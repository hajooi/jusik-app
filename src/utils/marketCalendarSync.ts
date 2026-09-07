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

/**
 * 전일 및 당일 기준 발표 완료되어야 하는 캘린더 이벤트를 점검하고,
 * 실제 수치 수집 및 AI 초보자 요약을 동기화합니다.
 */
export async function syncMarketCalendarEvents(currentEvents: CalendarEvent[]): Promise<SyncCalendarResult> {
  const now = new Date();
  // KST 기준 어제 및 오늘 날짜 스트링 생성
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

  const newlyPublished: SyncCalendarResult['newlyPublished'] = [];
  const updatedEvents = await Promise.all(
    currentEvents.map(async (ev) => {
      // 이미 결과치(actual)가 입력되어 있다면 그대로 유지
      if (ev.actual) {
        return ev;
      }

      // 아직 발표일이 오지 않은 미래 일정은 그대로 유지
      if (ev.date > todayStr) {
        return ev;
      }

      // 어제 또는 오늘 발표 대상인데 actual이 없는 경우 실적 결과 조회 시도
      let fetchedActual: string | null = null;
      if (ev.type === 'earnings' && ev.ticker) {
        fetchedActual = await fetchEarningsResult(ev.ticker, ev.region === 'kr');
      }

      if (fetchedActual) {
        // AI 초보자 요약 생성
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
