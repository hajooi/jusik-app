// src/utils/marketCalendarSync.ts

import { CalendarEvent } from '@/data/marketCalendar';
import { generateEasyEventSummary } from './aiSummary';

export interface SyncCalendarResult {
  updatedEvents: CalendarEvent[];
  newlyPublished: Array<{
    title: string;
    ticker?: string;
    actual: string;
    expected?: string;
    summary: string;
  }>;
}

/**
 * Yahoo Finance quoteSummary API를 통해 특정 티커의 최근 실적 결과치를 조회합니다.
 */
async function fetchEarningsResult(ticker: string, isKr: boolean): Promise<string | null> {
  try {
    const symbol = isKr ? `${ticker}.KS` : (ticker === 'BRK_B' ? 'BRK-B' : ticker);
    const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(symbol)}?modules=earnings,financialData,defaultKeyStatistics`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
      },
      cache: 'no-store',
    });

    if (!res.ok) return null;
    const json = await res.json();
    const result = json?.quoteSummary?.result?.[0];
    const earnings = result?.earnings;
    const financialData = result?.financialData;

    // 최근 분기 실적 히스토리 확인
    const quarters = earnings?.earningsChart?.quarterly;
    if (Array.isArray(quarters) && quarters.length > 0) {
      const latest = quarters[quarters.length - 1];
      if (latest && (latest.actual !== undefined || latest.revenue !== undefined)) {
        const actualEps = latest.actual?.fmt || (typeof latest.actual === 'number' ? `$${latest.actual.toFixed(2)}` : null);
        const revenue = latest.revenue?.fmt || (typeof latest.revenue === 'number' ? `$${(latest.revenue / 1e9).toFixed(2)}B` : null);
        
        if (actualEps && revenue) {
          return `매출 ${revenue} / EPS ${actualEps}`;
        }
        if (revenue) return `매출 ${revenue}`;
        if (actualEps) return `EPS ${actualEps}`;
      }
    }

    if (financialData?.totalRevenue?.fmt) {
      return `매출 ${financialData.totalRevenue.fmt}`;
    }

    return null;
  } catch (err) {
    console.warn(`[Sync] Failed to fetch earnings for ${ticker}:`, err);
    return null;
  }
}

interface EconomicIndicator {
  name: string;
  date: string;
  expected?: string;
  actual?: string;
  previous?: string;
}

/**
 * 향후 14일(2주) 범위의 주요 미국 경제지표 실시간 예상치(컨센서스) 및 발표 결과치를 스크래핑합니다.
 */
async function fetchUpcomingEconomicIndicators(): Promise<EconomicIndicator[]> {
  try {
    const res = await fetch('https://tradingeconomics.com/calendar', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      console.warn('[Sync] TradingEconomics response not ok:', res.status);
      return [];
    }

    const html = await res.text();
    const blocks = html.split('<tr data-url=');
    const indicators: EconomicIndicator[] = [];

    for (let i = 1; i < blocks.length; i++) {
      const b = blocks[i];
      const urlPart = b.substring(0, b.indexOf('>'));
      if (!urlPart.includes('/united-states/')) continue;

      const evM = b.match(/class=['"]calendar-event['"][^>]*>([^<]+)<\/a>/i);
      const acM = b.match(/id=['"]actual['"][^>]*>([^<]*)<\/span>/i);
      const prM = b.match(/id=['"]previous['"][^>]*>([^<]*)<\/span>/i);
      const coM = b.match(/id=['"]consensus['"][^>]*>([^<]*)<\/a>/i);
      const foM = b.match(/id=['"]forecast['"][^>]*>([^<]*)<\/a>/i);
      const dtM = b.match(/class=['"][^'"]*(\d{4}-\d{2}-\d{2})[^'"]*['"]/i);

      const name = evM ? evM[1].trim() : '';
      const actual = acM ? acM[1].trim() : '';
      const previous = prM ? prM[1].trim() : '';
      const expected = (coM && coM[1].trim()) ? coM[1].trim() : (foM ? foM[1].trim() : '');
      const date = dtM ? dtM[1].trim() : '';

      if (name && (expected || actual || previous)) {
        indicators.push({ name, date, expected, actual, previous });
      }
    }

    return indicators;
  } catch (err) {
    console.warn('[Sync] Failed to fetch economic indicators:', err);
    return [];
  }
}

/**
 * 전일 및 당일 기준 발표 완료되어야 하는 캘린더 이벤트를 점검하고,
 * 14일(2주) 이내 경제지표의 예상치(expected)와 발표 결과치(actual)를 최신 동기화합니다.
 */
export async function syncMarketCalendarEvents(currentEvents: CalendarEvent[]): Promise<SyncCalendarResult> {
  const now = new Date();
  // KST 기준 오늘 날짜 및 14일 후(2주) 날짜 스트링 생성
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  
  const future14 = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  const future14Str = `${future14.getFullYear()}-${String(future14.getMonth() + 1).padStart(2, '0')}-${String(future14.getDate()).padStart(2, '0')}`;

  const newlyPublished: SyncCalendarResult['newlyPublished'] = [];

  // 1. 향후 14일간의 실시간 경제지표 피드 수집
  const liveIndicators = await fetchUpcomingEconomicIndicators();

  // 지표 매핑 헬퍼 함수
  const matchIndicator = (title: string, date: string): EconomicIndicator | undefined => {
    const t = title.toLowerCase();
    const isEventYoY = t.includes('yoy') || t.includes('전년');
    const isEventMoM = t.includes('mom') || t.includes('전월');
    const isEventCore = t.includes('근원') || t.includes('core');

    return liveIndicators.find((ind) => {
      const indName = ind.name.toLowerCase();
      // 날짜 오차 1일 허용 (시차 감안)
      const dateMatch = ind.date === date || Math.abs(new Date(ind.date).getTime() - new Date(date).getTime()) <= 86400000;
      if (!dateMatch) return false;

      const isIndYoY = indName.includes('yoy') || indName.includes('year on year') || indName.includes('change');
      const isIndMoM = indName.includes('mom') || indName.includes('month on month');
      const isIndCore = indName.includes('core');
      const isIndExSub = indName.includes('ex '); // 'ex food', 'ex trade' 등 세부 제외 지표

      // YoY / MoM 주기 일치 여부 엄격 검증
      if (isEventYoY && !isIndYoY) return false;
      if (isEventMoM && !isIndMoM) return false;

      // Core(근원) 지표와 Headline 지표 상호 침범 방지
      if (isEventCore && !isIndCore) return false;
      if (!isEventCore && (isIndCore || isIndExSub)) return false;

      if ((t.includes('nfib') || t.includes('소기업')) && (indName.includes('nfib') || indName.includes('optimism'))) return true;
      if (t.includes('소비자물가') && (indName.includes('inflation rate') || indName.includes('cpi'))) return true;
      if (t.includes('생산자물가') && (indName.includes('ppi') || indName.includes('producer prices'))) return true;
      if (t.includes('소매판매') && indName.includes('retail sales')) return true;
      if ((t.includes('fomc') || t.includes('기준금리')) && (indName.includes('interest rate') || indName.includes('fed'))) return true;
      if (t.includes('비농업') && (indName.includes('non farm') || indName.includes('payroll'))) return true;
      if (t.includes('실업률') && indName.includes('unemployment')) return true;
      if (t.includes('gdp') && indName.includes('gdp')) return true;

      return false;
    });
  };

  const updatedEvents = await Promise.all(
    currentEvents.map(async (ev) => {
      // --- A. 경제지표인 경우: 14일 이내 일정의 실시간 예상치(expected) 및 결과치(actual) 동기화 ---
      if (ev.type === 'economic') {
        const matched = matchIndicator(ev.title, ev.date);
        let updatedEv = { ...ev };

        if (matched) {
          // 최신 시장 예상치(컨센서스) 반영
          if (matched.expected && matched.expected !== ev.expected) {
            updatedEv.expected = matched.expected;
          }
          // 직전치 반영
          if (matched.previous && !ev.previous) {
            updatedEv.previous = matched.previous;
          }
          // 만약 결과치가 발표되었는데 아직 미등록 상태라면 자동 반영
          if (matched.actual && !ev.actual) {
            updatedEv.actual = matched.actual;
            const aiSummary = await generateEasyEventSummary({
              title: ev.title,
              ticker: ev.ticker,
              region: ev.region,
              actual: matched.actual,
              expected: updatedEv.expected,
              previous: updatedEv.previous,
            });
            updatedEv.simpleSummary = aiSummary;
            newlyPublished.push({
              title: ev.title,
              ticker: ev.ticker,
              actual: matched.actual,
              expected: updatedEv.expected,
              summary: aiSummary,
            });
          }
        }
        return updatedEv;
      }

      // --- B. 기업 실적인 경우: 발표 완료된 실적 조회 및 AI 요약 동기화 ---
      // 이미 결과치(actual)가 입력되어 있다면 유지
      if (ev.actual) {
        return ev;
      }

      // 아직 발표일이 오지 않은 미래 실적은 유지
      if (ev.date > todayStr) {
        return ev;
      }

      let fetchedActual: string | null = null;
      if (ev.type === 'earnings' && ev.ticker) {
        fetchedActual = await fetchEarningsResult(ev.ticker, ev.region === 'kr');
      }

      if (fetchedActual) {
        const aiSummaryText = await generateEasyEventSummary({
          title: ev.title,
          ticker: ev.ticker,
          region: ev.region,
          actual: fetchedActual,
          expected: ev.expected,
          previous: ev.previous,
        });

        newlyPublished.push({
          title: ev.title,
          ticker: ev.ticker,
          actual: fetchedActual,
          expected: ev.expected,
          summary: aiSummaryText,
        });

        return {
          ...ev,
          actual: fetchedActual,
          simpleSummary: aiSummaryText,
        };
      }

      return ev;
    })
  );

  return {
    updatedEvents,
    newlyPublished,
  };
}

