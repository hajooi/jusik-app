import { NextResponse } from 'next/server';
import { MARKET_SNAPSHOT, ASSET_CHARTS, CALENDAR_EVENTS, WEEKLY_BRIEFING, WEATHER_PRESETS, WeatherState, TODAY_MARKET_NEWS, CalendarEvent } from '@/data/marketCalendar';
import { sendTelegramDailyReport, sendTelegramErrorAlert } from '@/utils/telegram';
import { syncMarketCalendarEvents } from '@/utils/marketCalendarSync';

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
  meta: YahooMeta & {
    currentTradingPeriod?: {
      regular?: {
        start?: number;
        end?: number;
      };
    };
  };
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

// 안전한 서버 인메모리 일일 캐시
// DB가 단일 진실 공급원(Single Source of Truth)이므로 메모리 캐시는 성능 최적화 전용.
// 1시간 TTL: 배포 직후 / 일일 갱신 후 각 Lambda 인스턴스가 빠르게 DB 값으로 갱신됨.
let memoryCache: { data: any; timestamp: number } | null = null;
const CACHE_DURATION_MS = 60 * 60 * 1000; // 1시간 (DB 갱신 후 최대 1시간 내 반영)

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
    const result: YahooChartResult | undefined = json?.chart?.result?.[0];
    if (!result || !result.meta) return null;

    const timestamps: number[] = (result as any).timestamp ?? [];
    const rawHistory = result.indicators?.adjclose?.[0]?.adjclose ?? result.indicators?.quote?.[0]?.close ?? [];
    
    // 정확히 1년 전 (작년 9월 5일 거래일부터 온전히 포함하도록 370일 전 기준)
    const nowTimeMs = Date.now();
    const oneYearAgoMs = nowTimeMs - (370 * 24 * 60 * 60 * 1000);
    const nowSec = Math.floor(nowTimeMs / 1000);

    // 정규장 세션 시간 (장중 실시간 캔들 제외 판별용)
    const regPeriod = result.meta.currentTradingPeriod?.regular;
    const regStart = regPeriod?.start ?? 0;
    const regEnd = regPeriod?.end ?? 0;

    const points: DailyPoint[] = [];
    const history: number[] = [];

    for (let i = 0; i < timestamps.length; i++) {
      const ts = timestamps[i];
      const timeMs = ts * 1000;
      if (timeMs < oneYearAgoMs) continue; // 370일 이전 데이터 스킵

      // 현재 시각이 정규장 진행 중(개장 후 ~ 마감 전)인 경우, 당일 장중 캔들은 '마감 종가'가 아니므로 완전 제외!
      const isOngoingSession = ts >= regStart && nowSec < regEnd;
      if (isOngoingSession) {
        continue;
      }

      const rawVal = rawHistory[i];
      // 종가가 null이거나 유효하지 않은 임시 캔들은 건너뜀 (직전값 복제로 인한 중복 데이터 원천 방지)
      if (rawVal === null || typeof rawVal !== 'number' || isNaN(rawVal)) {
        continue;
      }

      const validClose = Number(rawVal.toFixed(2));

      // 날짜 포맷 (YYYY.MM.DD)
      const d = new Date(timeMs);
      const dateStr = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;

      // 동일한 날짜(시차/장중 캔들)가 이미 존재할 경우 마지막 확정값으로 갱신
      if (points.length > 0 && points[points.length - 1].date === dateStr) {
        points[points.length - 1].value = validClose;
        history[history.length - 1] = validClose;
      } else {
        points.push({ date: dateStr, value: validClose });
        history.push(validClose);
      }
    }

    if (points.length === 0) {
      return null;
    }

    // 마감 종가 기준 현재가 (장중 실시간가가 아니라 공식 마감된 최신 종가)
    const lastClosedPoint = points[points.length - 1];
    const prevClosedPoint = points.length >= 2 ? points[points.length - 2] : null;

    const current = lastClosedPoint.value;
    let change = 0;
    let changePercent = 0;

    if (prevClosedPoint && prevClosedPoint.value > 0) {
      change = Number((current - prevClosedPoint.value).toFixed(2));
      changePercent = Number(((change / prevClosedPoint.value) * 100).toFixed(2));
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

// 구글 뉴스 비즈니스/경제 실시간 트렌딩 AI 피드 파싱 수집기 (살아 움직이는 시장 테마 자동 반영 & 5~6개 언론사 다각화)
async function fetchRealKoreanMarketNews(): Promise<Array<{
  id: string;
  source: string;
  title: string;
  url: string;
  category: 'us' | 'kr' | 'macro';
}> | null> {
  try {
    const googleNewsUrl = 'https://news.google.com/rss/headlines/section/topic/BUSINESS?hl=ko&gl=KR&ceid=KR:ko';
    const res = await fetch(googleNewsUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      console.warn(`[Google News fetch HTTP ${res.status}]`);
      return null;
    }

    const xml = await res.text();
    const items = xml.match(/<item>[\s\S]*?<\/item>/g) || [];

    const seenSources = new Set<string>();
    const seenTitles = new Set<string>();
    const collected: Array<{
      id: string;
      source: string;
      title: string;
      url: string;
      category: 'us' | 'kr' | 'macro';
    }> = [];

    for (const item of items) {
      const tMatch = item.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/);
      const lMatch = item.match(/<link>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/);
      const sMatch = item.match(/<source[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/source>/);

      if (!tMatch || !lMatch) continue;

      let title = tMatch[1]
        .replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .trim();

      const link = lMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').trim();
      if (!link.startsWith('http')) continue;

      let source = sMatch ? sMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').trim() : '주요 언론';
      if (source === 'v.daum.net') source = '다음뉴스';

      // 언론사 명 접미사 제거 (예: '... - 조선일보')
      if (title.includes(' - ')) {
        title = title.split(' - ')[0].trim();
      }

      // 제목 중복 방지
      if (seenTitles.has(title)) continue;
      seenTitles.add(title);

      // 언론사 쏠림 방지: 서로 다른 5~6개 언론사에서 1개씩 선별
      if (seenSources.has(source)) continue;
      seenSources.add(source);

      // 카테고리 자동 판별
      const category: 'us' | 'kr' | 'macro' =
        title.includes('코스피') || title.includes('코스닥') || title.includes('국고채') || title.includes('한은') || title.includes('한국') || title.includes('삼전')
          ? 'kr'
          : title.includes('환율') || title.includes('유가') || title.includes('금값') || title.includes('달러') || title.includes('금리') || title.includes('GDP') || title.includes('물가')
          ? 'macro'
          : 'us';

      collected.push({
        id: `news-g-${collected.length + 1}`,
        source,
        title,
        url: link,
        category,
      });

      if (collected.length >= 6) break;
    }

    return collected.length >= 4 ? collected : null;
  } catch (err) {
    console.warn('[fetchRealKoreanMarketNews error]:', err);
    return null;
  }
}

import { getSupabaseAdmin } from '@/lib/supabase';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ─── KST 날짜 문자열 생성 헬퍼 ────────────────────────────────────────────────
function toKstDateStr(date: Date): string {
  // Asia/Seoul 기준 날짜 포맷 (YYYY.MM.DD)
  const kst = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  const y = kst.getUTCFullYear();
  const m = String(kst.getUTCMonth() + 1).padStart(2, '0');
  const d = String(kst.getUTCDate()).padStart(2, '0');
  return `${y}.${m}.${d}`;
}

// ─── Naver Finance API 폴백 ────────────────────────────────────────────────────
// Yahoo 한국 지수 일봉이 null로 반환되는 경우(장 개장 직후 미정산)의 보완 수단.
// Naver는 한국 거래일 종가를 지연 없이 정확하게 제공함.
interface NaverIndexPoint { date: string; value: number; change: number; changePercent: number; isPositive: boolean; }

async function fetchNaverIndex(indexCode: 'KOSPI' | 'KOSDAQ'): Promise<NaverIndexPoint | null> {
  try {
    const res = await fetch(
      `https://m.stock.naver.com/api/index/${indexCode}/price?pageSize=2&page=1`,
      { headers: { 'User-Agent': 'Mozilla/5.0' }, cache: 'no-store' }
    );
    if (!res.ok) return null;
    const data: Array<{
      localTradedAt: string;
      closePrice: string;
      compareToPreviousClosePrice: string;
      fluctuationsRatio: string;
      compareToPreviousPrice?: { code: string };
    }> = await res.json();
    if (!data || data.length < 1) return null;
    const latest = data[0];
    const closeNum = parseFloat(latest.closePrice.replace(/,/g, ''));
    const changeNum = parseFloat(latest.compareToPreviousClosePrice.replace(/,/g, ''));
    const pctNum = parseFloat(latest.fluctuationsRatio);
    const isPos = changeNum >= 0;
    // YYYY-MM-DD → YYYY.MM.DD
    const date = latest.localTradedAt.replace(/-/g, '.');
    return { date, value: closeNum, change: changeNum, changePercent: pctNum, isPositive: isPos };
  } catch (e) {
    console.warn(`[Naver ${indexCode} fetch failed]`, e);
    return null;
  }
}

async function fetchNaverUsdKrw(): Promise<NaverIndexPoint | null> {
  try {
    const res = await fetch(
      'https://m.stock.naver.com/front-api/marketIndex/prices?category=exchange&reutersCode=FX_USDKRW&pageSize=10&page=1',
      { headers: { 'User-Agent': 'Mozilla/5.0' }, cache: 'no-store' }
    );
    if (!res.ok) return null;
    const json = await res.json();
    const data: Array<{
      localTradedAt: string;
      closePrice: string;
      fluctuations: string;
      fluctuationsRatio: string;
      fluctuationsType?: { code: string };
    }> = json.result;
    if (!data || data.length < 1) return null;
    const latest = data[0];
    const closeNum = parseFloat(latest.closePrice.replace(/,/g, ''));
    const changeNum = parseFloat(latest.fluctuations.replace(/,/g, ''));
    const pctNum = parseFloat(latest.fluctuationsRatio);
    const isPos = changeNum >= 0;
    const date = latest.localTradedAt.replace(/-/g, '.');
    return { date, value: closeNum, change: changeNum, changePercent: pctNum, isPositive: isPos };
  } catch (e) {
    console.warn('[Naver USDKRW fetch failed]', e);
    return null;
  }
}

// Yahoo 데이터의 최신 포인트가 오늘 기준 N일 이상 오래됐는지 확인
function isDataStale(points: DailyPoint[], thresholdDays = 1): boolean {
  if (!points || points.length === 0) return true;
  const lastDate = points[points.length - 1].date; // 'YYYY.MM.DD'
  const [y, m, d] = lastDate.split('.').map(Number);
  const lastMs = Date.UTC(y, m - 1, d);
  const nowKst = Date.now() + 9 * 60 * 60 * 1000; // KST 기준 현재
  const nowMidnightKst = nowKst - (nowKst % 86400000); // KST 자정
  const diffDays = (nowMidnightKst - lastMs) / 86400000;
  return diffDays > thresholdDays;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get('refresh') === 'true';

    // ─────────────────────────────────────────────────────────────────────────
    // [일반 GET 경로] forceRefresh가 false인 모든 일반 요청
    // DB = 단일 진실 공급원. Yahoo Finance는 절대 호출하지 않음.
    // 순서: 메모리 캐시 → Supabase DB → 하드코딩 폴백
    // ─────────────────────────────────────────────────────────────────────────
    if (!forceRefresh) {
      const nowTime = Date.now();

      // 1. 메모리 캐시 유효 시 즉시 반환 (0ms)
      if (memoryCache && (nowTime - memoryCache.timestamp < CACHE_DURATION_MS)) {
        return NextResponse.json(memoryCache.data);
      }

      // 2. Supabase DB 읽기 (단일 진실 공급원)
      const supabase = getSupabaseAdmin();
      if (supabase) {
        try {
          const { data: dbRecord } = await supabase
            .from('users')
            .select('simulator_settings')
            .eq('nickname', '__system_market_daily_cache__')
            .maybeSingle();

          if (dbRecord?.simulator_settings?.snapshot && dbRecord?.simulator_settings?.assetCharts) {
            const snap = dbRecord.simulator_settings.snapshot;

            // 뉴스: DB에 저장된 뉴스가 유효하면 사용, 아니면 하드코딩 폴백
            const validNews = (Array.isArray(snap.todayNews) && snap.todayNews.length >= 4)
              ? snap.todayNews
              : TODAY_MARKET_NEWS;

            // 캘린더: 코드 정의 기준으로 DB의 actual/simpleSummary만 오버레이
            const dbEvents = dbRecord.simulator_settings?.calendarEvents;
            let mergedEvents = CALENDAR_EVENTS;
            if (Array.isArray(dbEvents) && dbEvents.length > 0) {
              const dbMap = new Map<string, CalendarEvent>();
              dbEvents.forEach((e: CalendarEvent) => { if (e?.id) dbMap.set(e.id, e); });
              mergedEvents = CALENDAR_EVENTS.map((base) => {
                const cached = dbMap.get(base.id);
                if (cached && (cached.actual || cached.simpleSummary)) {
                  return {
                    ...base,
                    ...(cached.actual ? { actual: cached.actual } : {}),
                    ...(cached.simpleSummary ? { simpleSummary: cached.simpleSummary } : {}),
                  };
                }
                return base;
              });
            }

            const cachedData = {
              ...dbRecord.simulator_settings,
              snapshot: { ...snap, todayNews: validNews },
              calendarEvents: mergedEvents,
              weeklyBriefing: WEEKLY_BRIEFING,
            };

            // 메모리 캐시에 저장 (다음 요청은 DB 조회 없이 즉시 반환)
            memoryCache = { data: cachedData, timestamp: nowTime };
            return NextResponse.json(cachedData);
          }
        } catch (dbErr) {
          console.warn('[Market Daily] Supabase read error (returning fallback):', dbErr);
        }
      }

      // 3. DB 조회 실패 시 하드코딩 폴백 반환 (Yahoo 절대 호출 안 함)
      console.warn('[Market Daily] DB unavailable, returning hardcoded fallback.');
      const fallbackData = {
        success: true,
        snapshot: MARKET_SNAPSHOT,
        assetCharts: ASSET_CHARTS,
        calendarEvents: CALENDAR_EVENTS,
        weeklyBriefing: WEEKLY_BRIEFING,
      };
      return NextResponse.json(fallbackData);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // [일일 갱신 경로] forceRefresh=true (GitHub Actions 크론 전용)
    // Yahoo Finance + CNN F&G 호출 → 검증 → DB 저장 → 메모리 캐시 갱신
    // ─────────────────────────────────────────────────────────────────────────
    const supabase = getSupabaseAdmin();

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

    // ── Naver 폴백: Yahoo 한국 지수 데이터가 비어 있거나 stale(1거래일 이상 오래됨)인 경우 ──
    // Yahoo는 장 개장 직후나 선물 롤오버 시 한국 지수 일봉을 null로 반환하는 경우가 있음.
    // Naver Finance API는 지연 없이 정확한 한국 거래일 종가를 제공.
    let resolvedKospi = kospi;
    let resolvedKosdaq = kosdaq;
    let resolvedUsdkrw = usdkrw;

    // KOSPI: stale 여부 확인 (마지막 포인트가 어제보다 오래됨)
    if (isDataStale(kospi?.points ?? [])) {
      console.log('[Market Daily] KOSPI stale, fetching from Naver...');
      const naverKospi = await fetchNaverIndex('KOSPI');
      if (naverKospi && kospi && naverKospi.date > (kospi.points.slice(-1)[0]?.date ?? '')) {
        // Naver가 더 최신 날짜라면 해당 포인트를 points에 추가하고 current 갱신
        const updatedPoints = [...kospi.points, { date: naverKospi.date, value: naverKospi.value }];
        resolvedKospi = { ...kospi, points: updatedPoints, history: updatedPoints.map(p => p.value), current: naverKospi.value, change: naverKospi.change, changePercent: naverKospi.changePercent };
        console.log(`[Market Daily] KOSPI updated via Naver: ${naverKospi.date} = ${naverKospi.value}`);
      } else if (naverKospi && !kospi) {
        // Yahoo 자체가 실패한 경우 Naver 단독 사용
        resolvedKospi = { points: [{ date: naverKospi.date, value: naverKospi.value }], history: [naverKospi.value], current: naverKospi.value, change: naverKospi.change, changePercent: naverKospi.changePercent };
        console.log(`[Market Daily] KOSPI from Naver only: ${naverKospi.value}`);
      }
    }

    // KOSDAQ
    if (isDataStale(kosdaq?.points ?? [])) {
      console.log('[Market Daily] KOSDAQ stale, fetching from Naver...');
      const naverKosdaq = await fetchNaverIndex('KOSDAQ');
      if (naverKosdaq && kosdaq && naverKosdaq.date > (kosdaq.points.slice(-1)[0]?.date ?? '')) {
        const updatedPoints = [...kosdaq.points, { date: naverKosdaq.date, value: naverKosdaq.value }];
        resolvedKosdaq = { ...kosdaq, points: updatedPoints, history: updatedPoints.map(p => p.value), current: naverKosdaq.value, change: naverKosdaq.change, changePercent: naverKosdaq.changePercent };
        console.log(`[Market Daily] KOSDAQ updated via Naver: ${naverKosdaq.date} = ${naverKosdaq.value}`);
      } else if (naverKosdaq && !kosdaq) {
        resolvedKosdaq = { points: [{ date: naverKosdaq.date, value: naverKosdaq.value }], history: [naverKosdaq.value], current: naverKosdaq.value, change: naverKosdaq.change, changePercent: naverKosdaq.changePercent };
      }
    }

    // USDKRW
    if (isDataStale(usdkrw?.points ?? [])) {
      console.log('[Market Daily] USDKRW stale, fetching from Naver...');
      const naverUsd = await fetchNaverUsdKrw();
      if (naverUsd && usdkrw && naverUsd.date > (usdkrw.points.slice(-1)[0]?.date ?? '')) {
        const updatedPoints = [...usdkrw.points, { date: naverUsd.date, value: naverUsd.value }];
        resolvedUsdkrw = { ...usdkrw, points: updatedPoints, history: updatedPoints.map(p => p.value), current: naverUsd.value, change: naverUsd.change, changePercent: naverUsd.changePercent };
        console.log(`[Market Daily] USDKRW updated via Naver: ${naverUsd.date} = ${naverUsd.value}`);
      } else if (naverUsd && !usdkrw) {
        resolvedUsdkrw = { points: [{ date: naverUsd.date, value: naverUsd.value }], history: [naverUsd.value], current: naverUsd.value, change: naverUsd.change, changePercent: naverUsd.changePercent };
      }
    }

    // ── 선물 롤오버 보완: Gold/Oil 일봉이 2일 이상 비어 있을 경우 meta.regularMarketPrice로 당일 포인트 추가 ──
    // GC=F, CL=F는 계약 롤오버(Sep → Dec) 시기에 Yahoo 일봉이 며칠간 누락될 수 있음.
    let resolvedGold = gold;
    let resolvedOil = oil;

    if (isDataStale(gold?.points ?? [], 2)) {
      // Yahoo 메타에서 현재가 직접 추출
      const goldUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(YAHOO_SYMBOLS['국제 금'])}?range=1d&interval=1d`;
      try {
        const goldMeta = await fetch(goldUrl, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }, cache: 'no-store' });
        if (goldMeta.ok) {
          const gj = await goldMeta.json();
          const gMeta = gj?.chart?.result?.[0]?.meta;
          if (gMeta?.regularMarketPrice) {
            const todayStr = toKstDateStr(new Date());
            const updatedPoints = [...(gold?.points ?? []), { date: todayStr, value: Number(gMeta.regularMarketPrice.toFixed(2)) }];
            const prevClose = gMeta.chartPreviousClose ?? (gold?.points?.slice(-1)[0]?.value ?? gMeta.regularMarketPrice);
            const chg = Number((gMeta.regularMarketPrice - prevClose).toFixed(2));
            const chgPct = Number(((chg / prevClose) * 100).toFixed(2));
            resolvedGold = { points: updatedPoints, history: updatedPoints.map(p => p.value), current: gMeta.regularMarketPrice, change: chg, changePercent: chgPct };
            console.log(`[Market Daily] Gold updated via meta.regularMarketPrice: ${todayStr} = ${gMeta.regularMarketPrice}`);
          }
        }
      } catch (e) { console.warn('[Market Daily] Gold meta fallback failed:', e); }
    }

    if (isDataStale(oil?.points ?? [], 2)) {
      const oilUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(YAHOO_SYMBOLS['국제 유가'])}?range=1d&interval=1d`;
      try {
        const oilMeta = await fetch(oilUrl, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }, cache: 'no-store' });
        if (oilMeta.ok) {
          const oj = await oilMeta.json();
          const oMeta = oj?.chart?.result?.[0]?.meta;
          if (oMeta?.regularMarketPrice) {
            const todayStr = toKstDateStr(new Date());
            const updatedPoints = [...(oil?.points ?? []), { date: todayStr, value: Number(oMeta.regularMarketPrice.toFixed(2)) }];
            const prevClose = oMeta.chartPreviousClose ?? (oil?.points?.slice(-1)[0]?.value ?? oMeta.regularMarketPrice);
            const chg = Number((oMeta.regularMarketPrice - prevClose).toFixed(2));
            const chgPct = Number(((chg / prevClose) * 100).toFixed(2));
            resolvedOil = { points: updatedPoints, history: updatedPoints.map(p => p.value), current: oMeta.regularMarketPrice, change: chg, changePercent: chgPct };
            console.log(`[Market Daily] Oil updated via meta.regularMarketPrice: ${todayStr} = ${oMeta.regularMarketPrice}`);
          }
        }
      } catch (e) { console.warn('[Market Daily] Oil meta fallback failed:', e); }
    }

    // 공탐지수 계산
    const fgScore = fgData?.score ?? MARKET_SNAPSHOT.fearGreedIndex;
    const weather = mapRatingToWeather(fgScore);

    // 날짜 포맷팅: 전체 수집 자산 중 가장 최근에 공식 마감된 실제 거래일 산출 (미국 휴장 시 한국 마감일 자동 반영)
    const allFetchedAssets = [spx, ndx, resolvedKospi, resolvedKosdaq, resolvedUsdkrw, us10y, resolvedGold, resolvedOil];
    const latestDates = allFetchedAssets
      .map((a) => (a?.points && a.points.length > 0 ? a.points[a.points.length - 1].date : null))
      .filter((d): d is string => Boolean(d));

    // 최신 날짜 정렬 (YYYY.MM.DD 포맷이므로 사전순 비교로 정확히 최신일 도출)
    latestDates.sort();
    const latestClosedDate = latestDates.length > 0 ? latestDates[latestDates.length - 1] : null;

    const now = new Date();
    let dateStr = `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일 마감 기준`;
    if (latestClosedDate) {
      const parts = latestClosedDate.split('.');
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
        value: resolvedKospi ? resolvedKospi.current.toLocaleString('ko-KR', { maximumFractionDigits: 2 }) : MARKET_SNAPSHOT.indices[2].value,
        change: resolvedKospi ? `${resolvedKospi.change >= 0 ? '+' : ''}${resolvedKospi.change.toFixed(2)}` : MARKET_SNAPSHOT.indices[2].change,
        changePercent: resolvedKospi ? `${resolvedKospi.changePercent >= 0 ? '+' : ''}${resolvedKospi.changePercent.toFixed(2)}` : MARKET_SNAPSHOT.indices[2].changePercent,
        isPositive: resolvedKospi ? resolvedKospi.changePercent >= 0 : MARKET_SNAPSHOT.indices[2].isPositive,
      },
      {
        name: '코스닥',
        code: 'KOSDAQ',
        value: resolvedKosdaq ? resolvedKosdaq.current.toLocaleString('ko-KR', { maximumFractionDigits: 2 }) : MARKET_SNAPSHOT.indices[3].value,
        change: resolvedKosdaq ? `${resolvedKosdaq.change >= 0 ? '+' : ''}${resolvedKosdaq.change.toFixed(2)}` : MARKET_SNAPSHOT.indices[3].change,
        changePercent: resolvedKosdaq ? `${resolvedKosdaq.changePercent >= 0 ? '+' : ''}${resolvedKosdaq.changePercent.toFixed(2)}` : MARKET_SNAPSHOT.indices[3].changePercent,
        isPositive: resolvedKosdaq ? resolvedKosdaq.changePercent >= 0 : MARKET_SNAPSHOT.indices[3].isPositive,
      },
    ];

    // 매크로 4종
    const auxiliary = [
      {
        label: '달러 환율',
        value: resolvedUsdkrw ? `${Math.round(resolvedUsdkrw.current).toLocaleString('ko-KR')}원` : MARKET_SNAPSHOT.auxiliary[0].value,
        isPositive: resolvedUsdkrw ? resolvedUsdkrw.changePercent >= 0 : MARKET_SNAPSHOT.auxiliary[0].isPositive,
      },
      {
        label: '미국채 10년',
        value: us10y ? `${us10y.current.toFixed(2)}%` : MARKET_SNAPSHOT.auxiliary[1].value,
        isPositive: us10y ? us10y.changePercent >= 0 : MARKET_SNAPSHOT.auxiliary[1].isPositive,
      },
      {
        label: '국제 금',
        value: resolvedGold ? `$${Math.round(resolvedGold.current).toLocaleString('en-US')}` : MARKET_SNAPSHOT.auxiliary[2].value,
        isPositive: resolvedGold ? resolvedGold.changePercent >= 0 : MARKET_SNAPSHOT.auxiliary[2].isPositive,
      },
      {
        label: '국제 유가',
        value: resolvedOil ? `$${resolvedOil.current.toFixed(1)}` : MARKET_SNAPSHOT.auxiliary[3].value,
        isPositive: resolvedOil ? resolvedOil.changePercent >= 0 : MARKET_SNAPSHOT.auxiliary[3].isPositive,
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
    const kospi1y = calc1YearReturn(resolvedKospi?.history, { change: '+108.6%', isPositive: true });
    const kosdaq1y = calc1YearReturn(resolvedKosdaq?.history, { change: '+0.3%', isPositive: true });
    const usdkrw1y = calc1YearReturn(resolvedUsdkrw?.history, { change: '-2.5%', isPositive: false });
    const us10y1y = calc1YearReturn(us10y?.history, { change: '+16.9%', isPositive: true });
    const gold1y = calc1YearReturn(resolvedGold?.history, { change: '+23.9%', isPositive: true });
    const oil1y = calc1YearReturn(resolvedOil?.history, { change: '+47.4%', isPositive: true });


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
        data: (resolvedKospi && resolvedKospi.history.length >= 20) ? resolvedKospi.history : (ASSET_CHARTS.KOSPI?.data ?? []),
        points: resolvedKospi?.points,
      },
      KOSDAQ: {
        label: '코스닥 (KOSDAQ)',
        current: indices[3].value,
        change: kosdaq1y.change,
        isPositive: kosdaq1y.isPositive,
        data: (resolvedKosdaq && resolvedKosdaq.history.length >= 20) ? resolvedKosdaq.history : (ASSET_CHARTS.KOSDAQ?.data ?? []),
        points: resolvedKosdaq?.points,
      },
      '달러 환율': {
        label: '달러 환율 (USDKRW)',
        current: auxiliary[0].value,
        change: usdkrw1y.change,
        isPositive: usdkrw1y.isPositive,
        data: (resolvedUsdkrw && resolvedUsdkrw.history.length >= 20) ? resolvedUsdkrw.history : (ASSET_CHARTS['달러 환율']?.data ?? []),
        points: resolvedUsdkrw?.points,
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
        data: (resolvedGold && resolvedGold.history.length >= 20) ? resolvedGold.history : (ASSET_CHARTS['국제 금']?.data ?? []),
        points: resolvedGold?.points,
      },
      '국제 유가': {
        label: 'WTI 국제 유가 (Oil)',
        current: auxiliary[3].value,
        change: oil1y.change,
        isPositive: oil1y.isPositive,
        data: (resolvedOil && resolvedOil.history.length >= 20) ? resolvedOil.history : (ASSET_CHARTS['국제 유가']?.data ?? []),
        points: resolvedOil?.points,
      },
    };


    // 5. 데이터 수집 정합성 검증 및 이상 감지 텔레그램 알림
    const dataIssues: string[] = [];

    // 1) 뉴스 수집: forceRefresh 시에만 실시간 파싱, 결과를 DB에 저장
    const autoNews = await fetchRealKoreanMarketNews();
    if (!autoNews || autoNews.length < 4) {
      dataIssues.push(`뉴스 수집 실패 (${autoNews ? autoNews.length : 0}개 수집됨, 정적 데이터로 폴백)`);
    }
    const resolvedNews = (autoNews && autoNews.length >= 4) ? autoNews : TODAY_MARKET_NEWS;

    // 2) 8대 핵심 자산 시계열 수집 실패 감지
    const assetChecks: Array<{ name: string; data: any }> = [
      { name: 'S&P 500', data: spx },
      { name: '나스닥 100', data: ndx },
      { name: '코스피', data: kospi },
      { name: '코스닥', data: kosdaq },
      { name: '달러 환율', data: usdkrw },
      { name: '미국채 10년', data: us10y },
      { name: '국제 금', data: gold },
      { name: '국제 유가', data: oil },
    ];

    const failedAssets = assetChecks.filter((a) => !a.data || !a.data.points || a.data.points.length === 0);
    if (failedAssets.length > 0) {
      dataIssues.push(`자산 데이터 수집 누락: ${failedAssets.map((f) => f.name).join(', ')}`);
    }

    // 이슈 발견 시 텔레그램 즉시 통보
    if (dataIssues.length > 0) {
      console.warn('[Market Daily Data Issues]:', dataIssues);
      try {
        await sendTelegramErrorAlert('일일 증시 데이터 수집 점검', dataIssues.join('\n'));
      } catch (alertErr) {
        console.warn('Telegram issue alert failed:', alertErr);
      }
    }

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

    // 캘린더 이벤트 동기화: 코드의 정식 CALENDAR_EVENTS를 기준(Single Source of Truth)으로 삼고,
    // DB 캐시에 저장된 최신 actual 및 AI 요약(simpleSummary)만 안전하게 오버레이 병합
    let currentCalendarEvents: CalendarEvent[] = CALENDAR_EVENTS;
    if (supabase) {
      try {
        const { data: currentDb } = await supabase
          .from('users')
          .select('simulator_settings')
          .eq('nickname', '__system_market_daily_cache__')
          .maybeSingle();

        const dbEvents = currentDb?.simulator_settings?.calendarEvents;
        if (Array.isArray(dbEvents) && dbEvents.length > 0) {
          const dbEventMap = new Map<string, CalendarEvent>();
          dbEvents.forEach((e: CalendarEvent) => { if (e?.id) dbEventMap.set(e.id, e); });
          currentCalendarEvents = CALENDAR_EVENTS.map((baseEvent) => {
            const cached = dbEventMap.get(baseEvent.id);
            if (cached && (cached.actual || cached.simpleSummary)) {
              return {
                ...baseEvent,
                ...(cached.actual ? { actual: cached.actual } : {}),
                ...(cached.simpleSummary ? { simpleSummary: cached.simpleSummary } : {}),
              };
            }
            return baseEvent;
          });
        }
      } catch (e) {
        console.warn('Failed to load existing calendarEvents for sync:', e);
      }
    }

    const { updatedEvents, newlyPublished } = await syncMarketCalendarEvents(currentCalendarEvents);

    const responseData = {
      success: true,
      snapshot,
      assetCharts,
      calendarEvents: updatedEvents,
      weeklyBriefing: WEEKLY_BRIEFING,
    };

    // 메모리 캐시 갱신
    memoryCache = { data: responseData, timestamp: Date.now() };

    // DB 저장 (크론 갱신 결과만 DB에 반영 — 일반 GET은 절대 이 코드에 도달하지 않음)
    if (supabase) {
      try {
        await supabase.from('users').upsert({
          nickname: '__system_market_daily_cache__',
          pin: '000000',
          simulator_settings: responseData,
          last_active_at: new Date().toISOString(),
        });
        console.log('[Market Daily] DB updated successfully. updatedAt:', dateStr);
      } catch (saveDbErr) {
        console.warn('Failed to persist market cache to Supabase:', saveDbErr);
      }
    }

    // 텔레그램 일일 브리핑 리포트 발송 (forceRefresh=true 전용)
    try {
      await sendTelegramDailyReport(snapshot, newlyPublished);
    } catch (tgErr) {
      console.warn('Telegram daily report failed:', tgErr);
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

