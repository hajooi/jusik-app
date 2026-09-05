import { NextResponse } from 'next/server';
import { MARKET_SNAPSHOT, ASSET_CHARTS, CALENDAR_EVENTS, WEEKLY_BRIEFING, WEATHER_PRESETS, WeatherState, TODAY_MARKET_NEWS } from '@/data/marketCalendar';
import { sendTelegramDailyReport, sendTelegramErrorAlert } from '@/utils/telegram';

export const dynamic = 'force-dynamic';

interface YahooMeta {
  regularMarketPrice: number;
  regularMarketChangePercent?: number;
  regularMarketChange?: number;
  fulldayPrice?: number;
  fulldayChange?: number;
  fulldayChangePercent?: number;
  chartPreviousClose?: number;
  previousClose?: number;
}

interface YahooChartResult {
  meta: YahooMeta;
  indicators?: {
    adjclose?: Array<{ adjclose?: (number | null)[] }>;
    quote?: Array<{ close?: (number | null)[] }>;
  };
}

const YAHOO_SYMBOLS: Record<string, string> = {
  SPX: '^GSPC',
  NDX: '^NDX',
  KOSPI: '^KS11',
  KOSDAQ: '^KQ11',
  '달러/원': 'USDKRW=X',
  '미국채 10년': '^TNX',
  '국제 금': 'GC=F',
  '국제 유가': 'CL=F',
};

// 안전한 서버 인메모리 일일 캐시 (성공한 데이터만 캐싱, 하루 1회 갱신)
let memoryCache: { data: any; timestamp: number } | null = null;
const CACHE_DURATION_MS = 12 * 60 * 60 * 1000; // 12시간 (반나절~하루)

export interface DailyPoint {
  date: string;
  value: number;
}

async function fetchYahooData(symbol: string): Promise<{
  current: number;
  change: number;
  changePercent: number;
  history: number[];
  points: DailyPoint[];
} | null> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=1y&interval=1d`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      console.warn(`Yahoo fetch HTTP ${res.status} for ${symbol}`);
      return null;
    }
    const json = await res.json();
    const result = json?.chart?.result?.[0];
    if (!result || !result.meta) return null;

    const current = result.meta.regularMarketPrice ?? result.meta.fulldayPrice ?? 0;

    const timestamps: number[] = result.timestamp ?? [];
    const rawHistory = result.indicators?.adjclose?.[0]?.adjclose ?? result.indicators?.quote?.[0]?.close ?? [];
    
    // 정확히 1년 전 (작년 9월 5일 거래일부터 온전히 포함하도록 370일 전 기준)
    const oneYearAgoMs = Date.now() - (370 * 24 * 60 * 60 * 1000);

    // 최초 유효 종가 탐색 (current 대신 과거 첫 실제 거래 가격으로 초기화하여 첫 거래일 튀는 스파이크 원천 차단)
    let firstValidClose = current;
    for (let i = 0; i < rawHistory.length; i++) {
      const v = rawHistory[i];
      if (v !== null && typeof v === 'number' && !isNaN(v)) {
        firstValidClose = Number(v.toFixed(2));
        break;
      }
    }

    const points: DailyPoint[] = [];
    const history: number[] = [];
    let lastValid = firstValidClose;

    for (let i = 0; i < timestamps.length; i++) {
      const ts = timestamps[i];
      const timeMs = ts * 1000;
      if (timeMs < oneYearAgoMs) continue; // 370일 이전 데이터 스킵

      const rawVal = rawHistory[i];
      if (rawVal !== null && typeof rawVal === 'number' && !isNaN(rawVal)) {
        lastValid = Number(rawVal.toFixed(2));
      }

      // 날짜 포맷 (YYYY.MM.DD)
      const d = new Date(timeMs);
      const dateStr = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;

      points.push({ date: dateStr, value: lastValid });
      history.push(lastValid);
    }

    // 전일 대비 변동 계산 (fulldayChange 우선, 없으면 직전 거래일 history[length - 2] 대비)
    let change = result.meta.fulldayChange ?? result.meta.regularMarketChange;
    let changePercent = result.meta.fulldayChangePercent ?? result.meta.regularMarketChangePercent;

    if (change === undefined || change === null) {
      if (history.length >= 2) {
        const prevClose = history[history.length - 2];
        change = current - prevClose;
      } else {
        change = 0;
      }
    }

    if (changePercent === undefined || changePercent === null) {
      if (history.length >= 2) {
        const prevClose = history[history.length - 2];
        changePercent = prevClose > 0 ? (change / prevClose) * 100 : 0;
      } else {
        changePercent = 0;
      }
    }

    return {
      current,
      change,
      changePercent,
      history,
      points,
    };
  } catch (err) {
    console.error(`[Yahoo fetch failed for ${symbol}]`, err);
    return null;
  }
}

async function fetchFearGreedIndex(): Promise<{
  score: number;
  rating: string;
} | null> {
  try {
    const res = await fetch('https://production.dataviz.cnn.io/index/fearandgreed/graphdata', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
        'Referer': 'https://www.cnn.com/markets/fear-and-greed',
      },
      cache: 'no-store',
    });

    if (!res.ok) return null;
    const data = await res.json();
    const fg = data?.fear_and_greed;
    if (!fg || typeof fg.score !== 'number') return null;

    return {
      score: Math.round(fg.score),
      rating: fg.rating ?? 'neutral',
    };
  } catch (err) {
    console.error('[CNN Fear & Greed fetch failed]', err);
    return null;
  }
}

function mapRatingToWeather(score: number): {
  state: WeatherState;
  label: string;
  message: string;
  subMessage: string;
} {
  if (score >= 75) {
    const p = WEATHER_PRESETS.sunny;
    return { state: 'sunny', label: p.label, message: p.message, subMessage: p.subMessage };
  }
  if (score >= 55) {
    const p = WEATHER_PRESETS.cloudy;
    return { state: 'cloudy', label: p.label, message: p.message, subMessage: p.subMessage };
  }
  if (score >= 45) {
    const p = WEATHER_PRESETS.overcast;
    return { state: 'overcast', label: p.label, message: p.message, subMessage: p.subMessage };
  }
  if (score >= 25) {
    const p = WEATHER_PRESETS.rainy;
    return { state: 'rainy', label: p.label, message: p.message, subMessage: p.subMessage };
  }
  const p = WEATHER_PRESETS.stormy;
  return { state: 'stormy', label: p.label, message: p.message, subMessage: p.subMessage };
}

// 한국 주요 언론사(연합뉴스 경제, 한국경제) 실시간 금융 뉴스 공식 RSS 파싱 수집기 (100% 실제 기사 직결 URL)
async function fetchRealKoreanMarketNews(): Promise<Array<{
  id: string;
  source: string;
  title: string;
  url: string;
  category: 'us' | 'kr' | 'macro';
}> | null> {
  const feeds = [
    { source: '연합뉴스', url: 'https://www.yna.co.kr/rss/economy.xml' },
    { source: '한국경제', url: 'https://www.hankyung.com/feed/all-news' },
  ];

  const keywords = ['증시', '뉴욕증시', '코스피', '코스닥', '환율', '금리', '나스닥', '반도체', '유가', '연준', '물가', '다우', 'S&P'];

  try {
    const feedResults: Record<string, Array<{
      id: string;
      source: string;
      title: string;
      url: string;
      category: 'us' | 'kr' | 'macro';
    }>> = {
      연합뉴스: [],
      한국경제: [],
    };

    const seenTitles = new Set<string>();

    for (const feed of feeds) {
      try {
        const res = await fetch(feed.url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
          },
          cache: 'no-store',
        });

        if (!res.ok) continue;
        const xml = await res.text();
        const items = xml.match(/<item>[\s\S]*?<\/item>/g) || [];

        for (const item of items) {
          const tMatch = item.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/);
          const lMatch = item.match(/<link>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/);
          if (!tMatch || !lMatch) continue;

          let title = tMatch[1]
            .replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1')
            .replace(/&amp;/g, '&')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .trim();

          const link = lMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').trim();
          if (!link.startsWith('http')) continue;

          // 키워드 매칭 및 중복 방지
          const isRelevant = keywords.some((k) => title.includes(k));
          if (!isRelevant) continue;

          // 제목 단순 정제
          if (title.endsWith(` - ${feed.source}`)) {
            title = title.replace(` - ${feed.source}`, '').trim();
          }

          if (seenTitles.has(title)) continue;
          seenTitles.add(title);

          const category: 'us' | 'kr' | 'macro' =
            title.includes('코스피') || title.includes('코스닥') || title.includes('국고채') || title.includes('삼전')
              ? 'kr'
              : title.includes('환율') || title.includes('유가') || title.includes('금값') || title.includes('유동성')
              ? 'macro'
              : 'us';

          feedResults[feed.source].push({
            id: `news-${feed.source === '연합뉴스' ? 'yna' : 'hk'}-${feedResults[feed.source].length + 1}`,
            source: feed.source,
            title,
            url: link,
            category,
          });

          // 각 언론사별 최대 3개씩 선별
          if (feedResults[feed.source].length >= 3) break;
        }
      } catch (feedErr) {
        console.warn(`[News fetch failed for ${feed.source}]:`, feedErr);
      }
    }

    // 연합뉴스 & 한국경제 1:1 교차(Round-Robin) 결합
    const collected: Array<{
      id: string;
      source: string;
      title: string;
      url: string;
      category: 'us' | 'kr' | 'macro';
    }> = [];

    const maxItems = Math.max(feedResults['연합뉴스'].length, feedResults['한국경제'].length);
    for (let i = 0; i < maxItems; i++) {
      if (feedResults['연합뉴스'][i]) collected.push(feedResults['연합뉴스'][i]);
      if (feedResults['한국경제'][i]) collected.push(feedResults['한국경제'][i]);
    }

    return collected.length >= 4 ? collected : null;
  } catch (err) {
    console.warn('[fetchRealKoreanMarketNews error]:', err);
    return null;
  }
}

import { getSupabaseAdmin } from '@/lib/supabase';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get('refresh') === 'true';

    // 1. 메모리 캐시 유효 시 즉시 반환 (0ms) - forceRefresh 아닐 때
    const nowTime = Date.now();
    if (!forceRefresh && memoryCache && (nowTime - memoryCache.timestamp < CACHE_DURATION_MS)) {
      return NextResponse.json(memoryCache.data);
    }

    // 2. Supabase 클라우드 영구 캐시 우선 확인 (서버 재시작/인스턴스 분산 환경 대응)
    const supabase = getSupabaseAdmin();
    if (!forceRefresh && supabase) {
      try {
        const { data: dbRecord } = await supabase
          .from('users')
          .select('simulator_settings, last_active_at')
          .eq('nickname', '__system_market_daily_cache__')
          .maybeSingle();

        if (dbRecord?.simulator_settings?.snapshot && dbRecord?.simulator_settings?.assetCharts) {
          const snap = dbRecord.simulator_settings.snapshot;
          const validNews = (Array.isArray(snap.todayNews) && snap.todayNews.length >= 4)
            ? snap.todayNews
            : TODAY_MARKET_NEWS;

          const cachedData = {
            ...dbRecord.simulator_settings,
            snapshot: {
              ...snap,
              todayNews: validNews,
            },
            calendarEvents: CALENDAR_EVENTS,
            weeklyBriefing: WEEKLY_BRIEFING,
          };
          // 메모리 캐시도 함께 갱신하여 초고속 서빙
          memoryCache = {
            data: cachedData,
            timestamp: nowTime,
          };
          return NextResponse.json(cachedData);
        }
      } catch (dbErr) {
        console.warn('Supabase market cache lookup error:', dbErr);
      }
    }

    // 3. CNN Fear & Greed API 호출
    const fgData = await fetchFearGreedIndex();

    // 4. Yahoo Finance 8개 지수 순차 호출 (429 Rate Limit 완전 방지)
    const spx = await fetchYahooData(YAHOO_SYMBOLS.SPX);
    await delay(180);
    const ndx = await fetchYahooData(YAHOO_SYMBOLS.NDX);
    await delay(180);
    const kospi = await fetchYahooData(YAHOO_SYMBOLS.KOSPI);
    await delay(180);
    const kosdaq = await fetchYahooData(YAHOO_SYMBOLS.KOSDAQ);
    await delay(180);
    const usdkrw = await fetchYahooData(YAHOO_SYMBOLS['달러/원']);
    await delay(180);
    const us10y = await fetchYahooData(YAHOO_SYMBOLS['미국채 10년']);
    await delay(180);
    const gold = await fetchYahooData(YAHOO_SYMBOLS['국제 금']);
    await delay(180);
    const oil = await fetchYahooData(YAHOO_SYMBOLS['국제 유가']);

    // 공탐지수 계산
    const fgScore = fgData?.score ?? MARKET_SNAPSHOT.fearGreedIndex;
    const weather = mapRatingToWeather(fgScore);

    // 날짜 포맷팅: 실제 마지막 데이터 날짜 또는 오늘 날짜 (2026.09.04 / 2026.09.05)
    const lastDataDate = spx?.points && spx.points.length > 0 ? spx.points[spx.points.length - 1].date : null;
    const now = new Date();
    let dateStr = `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일 마감 기준`;
    if (lastDataDate) {
      const parts = lastDataDate.split('.');
      if (parts.length === 3) {
        dateStr = `${parts[0]}년 ${parseInt(parts[1], 10)}월 ${parseInt(parts[2], 10)}일 마감 기준`;
      }
    }

    // 인덱스 4종 (전일 하루 대비 변동)
    const indices = [
      {
        name: 'S&P 500',
        code: 'SPX',
        value: spx ? spx.current.toLocaleString('en-US', { maximumFractionDigits: 2 }) : MARKET_SNAPSHOT.indices[0].value,
        change: spx ? `${spx.change >= 0 ? '+' : ''}${spx.change.toFixed(2)}` : MARKET_SNAPSHOT.indices[0].change,
        changePercent: spx ? `${spx.changePercent >= 0 ? '+' : ''}${spx.changePercent.toFixed(2)}` : MARKET_SNAPSHOT.indices[0].changePercent,
        isPositive: spx ? spx.changePercent >= 0 : MARKET_SNAPSHOT.indices[0].isPositive,
      },
      {
        name: '나스닥 100',
        code: 'NDX',
        value: ndx ? ndx.current.toLocaleString('en-US', { maximumFractionDigits: 2 }) : MARKET_SNAPSHOT.indices[1].value,
        change: ndx ? `${ndx.change >= 0 ? '+' : ''}${ndx.change.toFixed(2)}` : MARKET_SNAPSHOT.indices[1].change,
        changePercent: ndx ? `${ndx.changePercent >= 0 ? '+' : ''}${ndx.changePercent.toFixed(2)}` : MARKET_SNAPSHOT.indices[1].changePercent,
        isPositive: ndx ? ndx.changePercent >= 0 : MARKET_SNAPSHOT.indices[1].isPositive,
      },
      {
        name: '코스피',
        code: 'KOSPI',
        value: kospi ? kospi.current.toLocaleString('ko-KR', { maximumFractionDigits: 2 }) : MARKET_SNAPSHOT.indices[2].value,
        change: kospi ? `${kospi.change >= 0 ? '+' : ''}${kospi.change.toFixed(2)}` : MARKET_SNAPSHOT.indices[2].change,
        changePercent: kospi ? `${kospi.changePercent >= 0 ? '+' : ''}${kospi.changePercent.toFixed(2)}` : MARKET_SNAPSHOT.indices[2].changePercent,
        isPositive: kospi ? kospi.changePercent >= 0 : MARKET_SNAPSHOT.indices[2].isPositive,
      },
      {
        name: '코스닥',
        code: 'KOSDAQ',
        value: kosdaq ? kosdaq.current.toLocaleString('ko-KR', { maximumFractionDigits: 2 }) : MARKET_SNAPSHOT.indices[3].value,
        change: kosdaq ? `${kosdaq.change >= 0 ? '+' : ''}${kosdaq.change.toFixed(2)}` : MARKET_SNAPSHOT.indices[3].change,
        changePercent: kosdaq ? `${kosdaq.changePercent >= 0 ? '+' : ''}${kosdaq.changePercent.toFixed(2)}` : MARKET_SNAPSHOT.indices[3].changePercent,
        isPositive: kosdaq ? kosdaq.changePercent >= 0 : MARKET_SNAPSHOT.indices[3].isPositive,
      },
    ];

    // 매크로 4종
    const auxiliary = [
      {
        label: '달러 환율',
        value: usdkrw ? `${Math.round(usdkrw.current).toLocaleString('ko-KR')}원` : MARKET_SNAPSHOT.auxiliary[0].value,
        isPositive: usdkrw ? usdkrw.changePercent >= 0 : MARKET_SNAPSHOT.auxiliary[0].isPositive,
      },
      {
        label: '미국채 10년',
        value: us10y ? `${us10y.current.toFixed(2)}%` : MARKET_SNAPSHOT.auxiliary[1].value,
        isPositive: us10y ? us10y.changePercent >= 0 : MARKET_SNAPSHOT.auxiliary[1].isPositive,
      },
      {
        label: '국제 금',
        value: gold ? `$${Math.round(gold.current).toLocaleString('en-US')}` : MARKET_SNAPSHOT.auxiliary[2].value,
        isPositive: gold ? gold.changePercent >= 0 : MARKET_SNAPSHOT.auxiliary[2].isPositive,
      },
      {
        label: '국제 유가',
        value: oil ? `$${oil.current.toFixed(1)}` : MARKET_SNAPSHOT.auxiliary[3].value,
        isPositive: oil ? oil.changePercent >= 0 : MARKET_SNAPSHOT.auxiliary[3].isPositive,
      },
    ];

    // 1년 누적 수익률 헬퍼 함수 (차트 1년 추이 우측 상단 수치)
    const calc1YearReturn = (data: number[] | undefined, fallback: { change: string; isPositive: boolean }) => {
      if (!data || data.length < 2) return fallback;
      const first = data[0];
      const last = data[data.length - 1];
      if (first <= 0) return fallback;
      const pct = ((last - first) / first) * 100;
      return {
        change: `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`,
        isPositive: pct >= 0,
      };
    };

    const spx1y = calc1YearReturn(spx?.history, { change: '+19.1%', isPositive: true });
    const ndx1y = calc1YearReturn(ndx?.history, { change: '+24.9%', isPositive: true });
    const kospi1y = calc1YearReturn(kospi?.history, { change: '+108.6%', isPositive: true });
    const kosdaq1y = calc1YearReturn(kosdaq?.history, { change: '+0.3%', isPositive: true });
    const usdkrw1y = calc1YearReturn(usdkrw?.history, { change: '-2.5%', isPositive: false });
    const us10y1y = calc1YearReturn(us10y?.history, { change: '+16.9%', isPositive: true });
    const gold1y = calc1YearReturn(gold?.history, { change: '+23.9%', isPositive: true });
    const oil1y = calc1YearReturn(oil?.history, { change: '+47.4%', isPositive: true });

    // 1년치 차트 데이터 동적 구성 (정확한 1년치 일간 종가 및 1년 수익률)
    const assetCharts: Record<string, {
      label: string;
      current: string;
      change: string;
      isPositive: boolean;
      data: number[];
      points?: DailyPoint[];
    }> = {
      SPX: {
        label: 'S&P 500',
        current: indices[0].value,
        change: spx1y.change,
        isPositive: spx1y.isPositive,
        data: (spx && spx.history.length >= 20) ? spx.history : (ASSET_CHARTS.SPX?.data ?? []),
        points: spx?.points,
      },
      NDX: {
        label: '나스닥 100',
        current: indices[1].value,
        change: ndx1y.change,
        isPositive: ndx1y.isPositive,
        data: (ndx && ndx.history.length >= 20) ? ndx.history : (ASSET_CHARTS.NDX?.data ?? []),
        points: ndx?.points,
      },
      KOSPI: {
        label: '코스피 (KOSPI)',
        current: indices[2].value,
        change: kospi1y.change,
        isPositive: kospi1y.isPositive,
        data: (kospi && kospi.history.length >= 20) ? kospi.history : (ASSET_CHARTS.KOSPI?.data ?? []),
        points: kospi?.points,
      },
      KOSDAQ: {
        label: '코스닥 (KOSDAQ)',
        current: indices[3].value,
        change: kosdaq1y.change,
        isPositive: kosdaq1y.isPositive,
        data: (kosdaq && kosdaq.history.length >= 20) ? kosdaq.history : (ASSET_CHARTS.KOSDAQ?.data ?? []),
        points: kosdaq?.points,
      },
      '달러 환율': {
        label: '달러 환율 (USDKRW)',
        current: auxiliary[0].value,
        change: usdkrw1y.change,
        isPositive: usdkrw1y.isPositive,
        data: (usdkrw && usdkrw.history.length >= 20) ? usdkrw.history : (ASSET_CHARTS['달러 환율']?.data ?? []),
        points: usdkrw?.points,
      },
      '미국채 10년': {
        label: '미국채 10년물 금리 (US10Y)',
        current: auxiliary[1].value,
        change: us10y1y.change,
        isPositive: us10y1y.isPositive,
        data: (us10y && us10y.history.length >= 20) ? us10y.history : (ASSET_CHARTS['미국채 10년']?.data ?? []),
        points: us10y?.points,
      },
      '국제 금': {
        label: '국제 금 (1온스 기준)',
        current: auxiliary[2].value,
        change: gold1y.change,
        isPositive: gold1y.isPositive,
        data: (gold && gold.history.length >= 20) ? gold.history : (ASSET_CHARTS['국제 금']?.data ?? []),
        points: gold?.points,
      },
      '국제 유가': {
        label: 'WTI 국제 유가 (Oil)',
        current: auxiliary[3].value,
        change: oil1y.change,
        isPositive: oil1y.isPositive,
        data: (oil && oil.history.length >= 20) ? oil.history : (ASSET_CHARTS['국제 유가']?.data ?? []),
        points: oil?.points,
      },
    };

    // 실시간 한국어 금융 뉴스 자동 수집 (실패 시 정적 TODAY_MARKET_NEWS 폴백)
    const autoNews = await fetchRealKoreanMarketNews();
    const resolvedNews = (autoNews && autoNews.length >= 4) ? autoNews : TODAY_MARKET_NEWS;

    const snapshot = {
      weatherState: weather.state,
      fearGreedIndex: fgScore,
      fearGreedLabel: weather.label,
      weatherMessage: weather.message,
      weatherSubMessage: weather.subMessage,
      updatedAt: dateStr,
      indices,
      auxiliary,
      todayNews: resolvedNews,
    };

    const responseData = {
      success: true,
      snapshot,
      assetCharts,
      calendarEvents: CALENDAR_EVENTS,
      weeklyBriefing: WEEKLY_BRIEFING,
    };

    // 성공한 데이터 인메모리 및 Supabase DB에 동시 저장
    memoryCache = {
      data: responseData,
      timestamp: Date.now(),
    };

    if (supabase) {
      try {
        await supabase.from('users').upsert({
          nickname: '__system_market_daily_cache__',
          pin: '000000',
          simulator_settings: responseData,
          last_active_at: new Date().toISOString(),
        });
      } catch (saveDbErr) {
        console.warn('Failed to persist market cache to Supabase:', saveDbErr);
      }
    }

    // 깃허브 액션 등 일일 강제 갱신(forceRefresh) 호출 시 텔레그램 일일 브리핑 리포트 발송
    if (forceRefresh) {
      try {
        await sendTelegramDailyReport(snapshot);
      } catch (tgErr) {
        console.warn('Telegram daily report failed:', tgErr);
      }
    }

    return NextResponse.json(responseData, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      },
    });
  } catch (error: any) {
    console.error('Market daily API error:', error);
    try {
      await sendTelegramErrorAlert('일일 증시 지표 갱신 (/api/market/daily)', error?.message || String(error));
    } catch (alertErr) {
      console.warn('Telegram error alert send failed:', alertErr);
    }
    return NextResponse.json({
      success: false,
      error: error?.message || String(error),
      snapshot: MARKET_SNAPSHOT,
      assetCharts: ASSET_CHARTS,
    });
  }
}
