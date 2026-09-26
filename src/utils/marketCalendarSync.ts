// src/utils/marketCalendarSync.ts
// ─── FRED API (미국 연준 공식 무료 데이터) + BOK ECOS API (한국은행 공식) 기반 자동 동기화 ───
// TradingEconomics HTML 스크래핑 완전 제거 → 공식 API 기반으로 교체
// FRED: https://fred.stlouisfed.org/ (기준금리, CPI, 실업률, NFP, GDP, PPI, 소매판매)
// BOK ECOS: https://ecos.bok.or.kr/ (한국 기준금리)

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
  macroUpdates?: {
    fedRate?: string;
    cpi?: string;
    unemployment?: string;
  };
}

const FRED_API_KEY = process.env.FRED_API_KEY;
const BOK_API_KEY = process.env.BOK_API_KEY;

// ─── FRED API 공통 수집기 ──────────────────────────────────────────────────────

interface FredObservation {
  date: string;   // 'YYYY-MM-DD'
  value: string;  // 숫자 문자열 또는 '.' (결측)
}

/**
 * FRED API에서 특정 시리즈의 최근 N개 관측값을 수집합니다.
 * @param seriesId FRED 시리즈 ID (예: 'DFEDTARU')
 * @param observationEnd 조회 기준 종료 날짜 (YYYY-MM-DD)
 * @param limit 조회할 개수 (기본 2: 최신값 + 직전값)
 */
async function fetchFredSeries(
  seriesId: string,
  observationEnd: string,
  limit = 2
): Promise<FredObservation[]> {
  if (!FRED_API_KEY) {
    console.warn('[FRED] API key not configured (FRED_API_KEY env var missing)');
    return [];
  }

  try {
    const params = new URLSearchParams({
      series_id: seriesId,
      api_key: FRED_API_KEY,
      file_type: 'json',
      sort_order: 'desc',
      limit: String(limit),
      observation_end: observationEnd,
    });

    const url = `https://api.stlouisfed.org/fred/series/observations?${params.toString()}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10초 타임아웃

    let res: Response;
    try {
      res = await fetch(url, { cache: 'no-store', signal: controller.signal });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!res.ok) {
      console.warn(`[FRED] ${seriesId} HTTP ${res.status}`);
      return [];
    }

    const data = await res.json();
    // '.' 값(결측치)은 제외
    return (data?.observations ?? []).filter((o: FredObservation) => o.value !== '.' && o.value !== '');
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      console.warn(`[FRED] ${seriesId} timeout`);
    } else {
      console.warn(`[FRED] ${seriesId} error:`, err);
    }
    return [];
  }
}

/**
 * 기준 날짜에서 N개월 이전의 월 첫째 날을 반환합니다.
 * 예: '2026-09-11', prevMonths=1 → '2026-08-01'
 */
function getPrevMonthFirstDay(dateStr: string, prevMonths = 1): string {
  const d = new Date(dateStr + 'T00:00:00Z');
  d.setUTCDate(1);
  d.setUTCMonth(d.getUTCMonth() - prevMonths);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  return `${y}-${m}-01`;
}

// ─── 미국 FOMC 기준금리 수집 (FRED: DFEDTARU - 연준 기준금리 상단) ──────────────

async function fetchFomcRate(eventDate: string): Promise<{ actual: string; previous: string } | null> {
  // 발표일 이후 5일 범위까지 조회 (FRED는 보통 당일 or 다음 거래일에 반영)
  const endDate = new Date(eventDate + 'T00:00:00Z');
  endDate.setUTCDate(endDate.getUTCDate() + 5);
  const endStr = endDate.toISOString().split('T')[0];

  // 최근 30개 조회: 발표일 전후 충분히 커버
  const obs = await fetchFredSeries('DFEDTARU', endStr, 30);
  if (obs.length === 0) return null;

  // 발표일 이후 첫 번째 값 (시간 역순 정렬이므로 역으로 찾기)
  const afterDate = [...obs].reverse().find(o => o.date >= eventDate);
  if (!afterDate) return null;

  const current = parseFloat(afterDate.value);
  if (isNaN(current)) return null;

  // 발표일 이전 마지막 값 (직전 금리 수준)
  const beforeObs = obs.filter(o => o.date < eventDate);
  const previous = beforeObs.length > 0 ? parseFloat(beforeObs[0].value) : current;

  const diff = current - previous;
  let direction = '';
  if (diff > 0.001) direction = ` (${Math.abs(diff).toFixed(2)}%p 인상)`;
  else if (diff < -0.001) direction = ` (${Math.abs(diff).toFixed(2)}%p 인하)`;
  else direction = ' (동결)';

  return {
    actual: `${current.toFixed(2)}%${direction}`,
    previous: `${isNaN(previous) ? current.toFixed(2) : previous.toFixed(2)}%`,
  };
}

// ─── 한국은행 기준금리 수집 (BOK ECOS API) ────────────────────────────────────

async function fetchBokRate(eventDate: string): Promise<{ actual: string; previous: string } | null> {
  if (!BOK_API_KEY) {
    console.warn('[BOK] API key not configured (BOK_API_KEY env var missing)');
    return null;
  }

  try {
    // 발표일 전 60일 범위로 조회
    const start = new Date(eventDate + 'T00:00:00Z');
    start.setUTCDate(start.getUTCDate() - 60);
    const startStr = start.toISOString().split('T')[0].replace(/-/g, '');
    const endStr = eventDate.replace(/-/g, '');

    const url = `https://ecos.bok.or.kr/api/StatisticSearch/${BOK_API_KEY}/json/kr/1/5/722Y001/DD/${startStr}/${endStr}/0101000`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return null;

    const data = await res.json();
    const rows: Array<{ TIME: string; DATA_VALUE: string }> = data?.StatisticSearch?.row ?? [];
    if (rows.length === 0) return null;

    // 최신순 정렬
    rows.sort((a, b) => b.TIME.localeCompare(a.TIME));

    const current = parseFloat(rows[0]?.DATA_VALUE);
    const previous = rows.length > 1 ? parseFloat(rows[1]?.DATA_VALUE) : current;

    if (isNaN(current)) return null;

    const diff = current - (isNaN(previous) ? current : previous);
    let direction = '';
    if (diff > 0.001) direction = ` (${Math.abs(diff).toFixed(2)}%p 인상)`;
    else if (diff < -0.001) direction = ` (${Math.abs(diff).toFixed(2)}%p 인하)`;
    else direction = ' (동결)';

    return {
      actual: `${current.toFixed(2)}%${direction}`,
      previous: `${isNaN(previous) ? current.toFixed(2) : previous.toFixed(2)}%`,
    };
  } catch (err) {
    console.warn('[BOK] Rate fetch error:', err);
    return null;
  }
}

// ─── 미국 CPI (소비자물가) 수집 ────────────────────────────────────────────────
// FRED: CPALTT01USM657N = CPI All Items YoY (전년동월비 %, 직접 제공)
// 근원 CPI: CPILFESL (레벨값) → 13개월치 조회 후 YoY 직접 계산

async function fetchCpiYoy(eventDate: string, isCore = false): Promise<string | null> {
  // CPI 발표는 전월 데이터: 9월 11일 발표 = 8월 CPI → 기준월 = 2026-08-01
  const refMonthStr = getPrevMonthFirstDay(eventDate, 1);

  if (!isCore) {
    // 헤드라인 CPI: FRED가 직접 YoY %를 제공
    const obs = await fetchFredSeries('CPALTT01USM657N', refMonthStr, 2);
    if (obs.length === 0) return null;
    const latest = obs.find(o => o.date <= refMonthStr);
    if (!latest) return null;
    const val = parseFloat(latest.value);
    if (isNaN(val)) return null;
    return `${val.toFixed(1)}%`;
  } else {
    // 근원 CPI: CPILFESL 레벨값 14개월치 → 직접 YoY 계산
    const obs = await fetchFredSeries('CPILFESL', refMonthStr, 14);
    if (obs.length < 2) return null;

    // 가장 최근 값 (기준월)
    const current = obs.find(o => o.date <= refMonthStr);
    // 12개월 전 값
    const prevYear = obs[obs.length - 1];

    if (!current || !prevYear) return null;

    const currentVal = parseFloat(current.value);
    const prevYearVal = parseFloat(prevYear.value);

    if (isNaN(currentVal) || isNaN(prevYearVal) || prevYearVal === 0) return null;

    const yoy = ((currentVal - prevYearVal) / prevYearVal) * 100;
    return `${yoy.toFixed(1)}%`;
  }
}

// ─── 미국 Core PCE 수집 ────────────────────────────────────────────────────────
// FRED: PCEPI (PCE 레벨) → YoY 계산, 또는 PCEPILFE (근원 PCE 레벨)

async function fetchCorePceYoy(eventDate: string): Promise<string | null> {
  const refMonthStr = getPrevMonthFirstDay(eventDate, 1);
  const obs = await fetchFredSeries('PCEPILFE', refMonthStr, 14);
  if (obs.length < 2) return null;

  const current = obs.find(o => o.date <= refMonthStr);
  const prevYear = obs[obs.length - 1];

  if (!current || !prevYear) return null;

  const currentVal = parseFloat(current.value);
  const prevYearVal = parseFloat(prevYear.value);

  if (isNaN(currentVal) || isNaN(prevYearVal) || prevYearVal === 0) return null;

  const yoy = ((currentVal - prevYearVal) / prevYearVal) * 100;
  return `${yoy.toFixed(1)}%`;
}

// ─── 미국 실업률 수집 (FRED: UNRATE) ─────────────────────────────────────────

async function fetchUnemploymentRate(eventDate: string): Promise<string | null> {
  const refMonthStr = getPrevMonthFirstDay(eventDate, 1);
  const obs = await fetchFredSeries('UNRATE', refMonthStr, 1);
  if (obs.length === 0) return null;
  const val = parseFloat(obs[0].value);
  if (isNaN(val)) return null;
  return `${val.toFixed(1)}%`;
}

// ─── 미국 비농업 취업자수 수집 (FRED: PAYEMS - 월간 변화량) ──────────────────

async function fetchNonfarmPayrolls(eventDate: string): Promise<string | null> {
  const refMonthStr = getPrevMonthFirstDay(eventDate, 1);
  // 2개월치 → 월간 변화량 계산
  const obs = await fetchFredSeries('PAYEMS', refMonthStr, 2);
  if (obs.length < 2) return null;

  const current = parseFloat(obs[0].value);   // 기준월
  const previous = parseFloat(obs[1].value);   // 직전월

  if (isNaN(current) || isNaN(previous)) return null;

  // PAYEMS 단위: 천 명
  const change = Math.round(current - previous);
  return `${change > 0 ? '+' : ''}${change.toLocaleString()}K`;
}

// ─── 미국 GDP 성장률 수집 (FRED: A191RL1Q225SBEA - 실질 GDP QoQ 연율) ─────────

async function fetchGdpGrowth(eventDate: string): Promise<string | null> {
  // GDP는 분기 발표, 발표일 기준 이전 분기 데이터
  const obs = await fetchFredSeries('A191RL1Q225SBEA', eventDate, 1);
  if (obs.length === 0) return null;
  const val = parseFloat(obs[0].value);
  if (isNaN(val)) return null;
  return `${val >= 0 ? '+' : ''}${val.toFixed(1)}%`;
}

// ─── 미국 생산자물가 YoY 수집 (FRED: PPIACO) ─────────────────────────────────

async function fetchPpiYoy(eventDate: string): Promise<string | null> {
  const refMonthStr = getPrevMonthFirstDay(eventDate, 1);
  const obs = await fetchFredSeries('PPIACO', refMonthStr, 14);
  if (obs.length < 2) return null;

  const current = obs.find(o => o.date <= refMonthStr);
  const prevYear = obs[obs.length - 1];

  if (!current || !prevYear) return null;

  const currentVal = parseFloat(current.value);
  const prevYearVal = parseFloat(prevYear.value);

  if (isNaN(currentVal) || isNaN(prevYearVal) || prevYearVal === 0) return null;

  const yoy = ((currentVal - prevYearVal) / prevYearVal) * 100;
  return `${yoy.toFixed(1)}%`;
}

// ─── 미국 소매판매 YoY 수집 (FRED: RSAFS) ────────────────────────────────────

async function fetchRetailSalesYoy(eventDate: string): Promise<string | null> {
  const refMonthStr = getPrevMonthFirstDay(eventDate, 1);
  const obs = await fetchFredSeries('RSAFS', refMonthStr, 14);
  if (obs.length < 2) return null;

  const current = obs.find(o => o.date <= refMonthStr);
  const prevYear = obs[obs.length - 1];

  if (!current || !prevYear) return null;

  const currentVal = parseFloat(current.value);
  const prevYearVal = parseFloat(prevYear.value);

  if (isNaN(currentVal) || isNaN(prevYearVal) || prevYearVal === 0) return null;

  const yoy = ((currentVal - prevYearVal) / prevYearVal) * 100;
  return `${yoy >= 0 ? '+' : ''}${yoy.toFixed(1)}%`;
}

// ─── Yahoo Finance 기업 실적 수집 ────────────────────────────────────────────

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

    const quarters = earnings?.earningsChart?.quarterly;
    if (Array.isArray(quarters) && quarters.length > 0) {
      const latest = quarters[quarters.length - 1];
      if (latest && (latest.actual !== undefined || latest.revenue !== undefined)) {
        const actualEps = latest.actual?.fmt || (typeof latest.actual === 'number' ? `$${latest.actual.toFixed(2)}` : null);
        const revenue = latest.revenue?.fmt || (typeof latest.revenue === 'number' ? `$${(latest.revenue / 1e9).toFixed(2)}B` : null);
        if (actualEps && revenue) return `매출 ${revenue} / EPS ${actualEps}`;
        if (revenue) return `매출 ${revenue}`;
        if (actualEps) return `EPS ${actualEps}`;
      }
    }

    if (financialData?.totalRevenue?.fmt) {
      return `매출 ${financialData.totalRevenue.fmt}`;
    }

    return null;
  } catch (err) {
    console.warn(`[Sync] Yahoo earnings fetch failed for ${ticker}:`, err);
    return null;
  }
}

// ─── 이벤트 제목 기반 FRED 수집 함수 라우터 ──────────────────────────────────

async function fetchEconomicActual(ev: CalendarEvent, todayStr: string): Promise<string | null> {
  const t = ev.title.toLowerCase();
  const eventDate = ev.date;

  // 발표일이 아직 오지 않은 경우 스킵
  if (eventDate > todayStr) return null;

  try {
    // ① FOMC / 미국 기준금리
    if (t.includes('fomc') || (t.includes('기준금리') && (t.includes('미국') || t.includes('연준')))) {
      const result = await fetchFomcRate(eventDate);
      return result?.actual ?? null;
    }

    // ② 한국은행 기준금리
    if (t.includes('한국은행') || t.includes('금융통화위원회') || (t.includes('기준금리') && t.includes('한국'))) {
      const result = await fetchBokRate(eventDate);
      return result?.actual ?? null;
    }

    // ③ Core PCE (반드시 헤드라인 PCE보다 먼저 체크)
    if ((t.includes('core') || t.includes('근원')) && t.includes('pce')) {
      return await fetchCorePceYoy(eventDate);
    }

    // ④ 근원 소비자물가 (Core CPI) - 헤드라인 CPI보다 먼저 체크
    if ((t.includes('근원') || t.includes('core')) && t.includes('소비자물가')) {
      return await fetchCpiYoy(eventDate, true);
    }

    // ⑤ 소비자물가 (CPI 헤드라인)
    if (t.includes('소비자물가') && !t.includes('근원') && !t.includes('core')) {
      return await fetchCpiYoy(eventDate, false);
    }

    // ⑥ 생산자물가 (PPI)
    if (t.includes('생산자물가')) {
      return await fetchPpiYoy(eventDate);
    }

    // ⑦ 비농업 취업자수 (NFP)
    if (t.includes('비농업') || t.includes('nonfarm') || t.includes('payroll')) {
      return await fetchNonfarmPayrolls(eventDate);
    }

    // ⑧ 실업률
    if (t.includes('실업률') && !t.includes('비농업')) {
      return await fetchUnemploymentRate(eventDate);
    }

    // ⑨ 소매판매
    if (t.includes('소매판매')) {
      return await fetchRetailSalesYoy(eventDate);
    }

    // ⑩ GDP 성장률
    if (t.includes('gdp') || (t.includes('성장률') && !t.includes('기업'))) {
      return await fetchGdpGrowth(eventDate);
    }

    return null;
  } catch (err) {
    console.warn(`[Sync] fetchEconomicActual failed for ${ev.id}:`, err);
    return null;
  }
}

// ─── 경제지표 수치 유효성 검증 ──────────────────────────────────────────────────

function isValidEconomicValue(title: string, value: string): boolean {
  if (!value || typeof value !== 'string') return false;
  const t = title.toLowerCase();
  const clean = value.trim();

  // 기준금리: 0% ~ 20%
  if (t.includes('fomc') || t.includes('기준금리')) {
    if (clean.startsWith('-')) return false;
    const num = parseFloat(clean.replace(/[^0-9.]/g, ''));
    return !isNaN(num) && num >= 0 && num <= 20;
  }

  // 실업률: 1% ~ 30%
  if (t.includes('실업률')) {
    if (clean.startsWith('-')) return false;
    const num = parseFloat(clean.replace(/[^0-9.]/g, ''));
    return !isNaN(num) && num >= 1 && num <= 30;
  }

  // CPI/PPI: ±40% 이내
  if (t.includes('소비자물가') || t.includes('생산자물가')) {
    const num = parseFloat(clean.replace(/[^0-9.-]/g, ''));
    return !isNaN(num) && Math.abs(num) <= 40;
  }

  return true;
}

// ─── 메인 동기화 함수 ──────────────────────────────────────────────────────────

export async function syncMarketCalendarEvents(currentEvents: CalendarEvent[]): Promise<SyncCalendarResult> {
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const newlyPublished: SyncCalendarResult['newlyPublished'] = [];
  const macroUpdates: SyncCalendarResult['macroUpdates'] = {};

  const updatedEvents = await Promise.all(
    currentEvents.map(async (ev) => {
      // 이미 actual이 있으면 건너뜀 (DB에 저장된 확정값 보호)
      if (ev.actual) return ev;

      // 아직 발표일이 오지 않은 미래 이벤트는 건너뜀
      if (ev.date > todayStr) return ev;

      // ─── A. 경제지표 ──────────────────────────────────────────
      if (ev.type === 'economic') {
        const fetchedActual = await fetchEconomicActual(ev, todayStr);

        if (fetchedActual && isValidEconomicValue(ev.title, fetchedActual)) {
          console.log(`[Sync] ✅ ${ev.id} (${ev.date}): actual = ${fetchedActual}`);

          const aiSummary = await generateEasyEventSummary({
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
            summary: aiSummary,
          });

          // 핵심 매크로 지표 업데이트 기록 (route.ts에서 MACRO_SUMMARY_ITEMS 갱신용)
          const t = ev.title.toLowerCase();
          if (t.includes('fomc') || (t.includes('기준금리') && t.includes('미국'))) {
            macroUpdates.fedRate = fetchedActual;
          }
          if (t.includes('소비자물가') && !t.includes('근원') && !t.includes('core')) {
            macroUpdates.cpi = fetchedActual;
          }
          if (t.includes('실업률')) {
            macroUpdates.unemployment = fetchedActual;
          }

          return { ...ev, actual: fetchedActual, simpleSummary: aiSummary };
        }

        console.warn(`[Sync] ⚠️ ${ev.id} (${ev.date}): FRED 수집 실패 또는 유효하지 않은 값, 기존 유지`);
        return ev;
      }

      // ─── B. 기업 실적 ──────────────────────────────────────────
      if (ev.type === 'earnings' && ev.ticker) {
        const fetchedActual = await fetchEarningsResult(ev.ticker, ev.region === 'kr');

        if (fetchedActual) {
          const aiSummary = await generateEasyEventSummary({
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
            summary: aiSummary,
          });

          return { ...ev, actual: fetchedActual, simpleSummary: aiSummary };
        }

        console.warn(`[Sync] ⚠️ ${ev.id} (${ev.date}): Yahoo 실적 수집 실패, 기존 유지`);
        return ev;
      }

      return ev;
    })
  );

  return { updatedEvents, newlyPublished, macroUpdates };
}

// ─── FRED 기반 매크로 지표 현재값 수집 (route.ts forceRefresh 전용) ──────────

export interface FredMacroSnapshot {
  fedRate?: string;           // 미국 기준금리
  cpiYoy?: string;            // 소비자물가 YoY
  unemployment?: string;       // 실업률
}

/**
 * GitHub Actions 크론 갱신 시 MACRO_SUMMARY_ITEMS의 현재값을 FRED로 업데이트합니다.
 * route.ts의 forceRefresh 경로에서 호출됩니다.
 */
export async function fetchFredMacroSnapshot(): Promise<FredMacroSnapshot> {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const [fedRateObs, cpiObs, unrateObs] = await Promise.allSettled([
    fetchFredSeries('DFEDTARU', todayStr, 1),
    fetchFredSeries('CPALTT01USM657N', todayStr, 1),
    fetchFredSeries('UNRATE', todayStr, 1),
  ]);

  const result: FredMacroSnapshot = {};

  if (fedRateObs.status === 'fulfilled' && fedRateObs.value.length > 0) {
    const val = parseFloat(fedRateObs.value[0].value);
    if (!isNaN(val)) result.fedRate = `${val.toFixed(2)}%`;
  }

  if (cpiObs.status === 'fulfilled' && cpiObs.value.length > 0) {
    const val = parseFloat(cpiObs.value[0].value);
    if (!isNaN(val)) result.cpiYoy = `${val.toFixed(2)}%`;
  }

  if (unrateObs.status === 'fulfilled' && unrateObs.value.length > 0) {
    const val = parseFloat(unrateObs.value[0].value);
    if (!isNaN(val)) result.unemployment = `${val.toFixed(1)}%`;
  }

  return result;
}
