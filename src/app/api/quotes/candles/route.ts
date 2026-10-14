import { NextResponse } from 'next/server';
import { withApiGuard } from '@/lib/observability/guard';
import { normalizeSymbol } from '@/utils/rebalance';

export const dynamic = 'force-dynamic';

interface CandlePoint {
  date: string; // YYYY-MM-DD
  priceKrw: number;
}

const CRYPTO_SET = new Set(['BTC', 'ETH', 'SOL', 'XRP', 'DOGE', 'ADA', 'AVAX', 'DOT', 'LINK']);
const KR_CODE_RE = /^\d{6}$/;

// 1. 암호화폐 캔들 조회 (업비트 공식 API)
async function fetchUpbitCandles(
  coinSymbol: string,
  timeframe: 'day' | 'week' | 'month',
  count: number = 60
): Promise<CandlePoint[]> {
  const clean = coinSymbol.replace(/^KRW-/, '').replace(/^COIN_/, '').toUpperCase();
  const endpoint =
    timeframe === 'month'
      ? 'months'
      : timeframe === 'week'
      ? 'weeks'
      : 'days';

  try {
    const res = await fetch(`https://api.upbit.com/v1/candles/${endpoint}?market=KRW-${clean}&count=${Math.min(200, count)}`, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const json = await res.json();
    if (!Array.isArray(json)) return [];

    return json
      .map((item: { candle_date_time_kst?: string; trade_price?: number }) => {
        const rawDate = item.candle_date_time_kst || '';
        const dateStr = rawDate.slice(0, 10);
        const price = Number(item.trade_price);
        if (!dateStr || !Number.isFinite(price) || price <= 0) return null;
        return { date: dateStr, priceKrw: Math.round(price) };
      })
      .filter((p): p is CandlePoint => p !== null)
      .reverse(); // 오래된 순으로 정렬
  } catch {
    return [];
  }
}

// 2. 한국 주식/ETF 캔들 조회 (네이버 증권 API)
async function fetchKrCandles(code: string, count: number = 60): Promise<CandlePoint[]> {
  try {
    const res = await fetch(`https://m.stock.naver.com/api/stock/${encodeURIComponent(code)}/price?pageSize=${Math.min(100, count)}&page=1`, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    if (res.ok) {
      const json = await res.json();
      const list = json?.priceInfos || json;
      if (Array.isArray(list) && list.length > 0) {
        return list
          .map((it: { localTradedAt?: string; closePrice?: string | number }) => {
            const rawD = String(it.localTradedAt || '').replace(/-/g, '');
            if (rawD.length < 8) return null;
            const dateStr = `${rawD.slice(0, 4)}-${rawD.slice(4, 6)}-${rawD.slice(6, 8)}`;
            const price = Number(String(it.closePrice).replace(/,/g, ''));
            if (!Number.isFinite(price) || price <= 0) return null;
            return { date: dateStr, priceKrw: Math.round(price) };
          })
          .filter((p): p is CandlePoint => p !== null)
          .reverse();
      }
    }

    // 폴백: 네이버 일별 차트 XML
    const chartRes = await fetch(`https://fchart.stock.naver.com/sise.nhn?symbol=${encodeURIComponent(code)}&timeframe=day&count=${count}&requestType=0`, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      cache: 'no-store',
    });
    if (!chartRes.ok) return [];
    const xml = await chartRes.text();
    const itemRegex = /<item\s+data="([^"]+)"\s*\/>/g;
    const points: CandlePoint[] = [];
    let match: RegExpExecArray | null;

    while ((match = itemRegex.exec(xml)) !== null) {
      const parts = match[1].split('|');
      if (parts.length >= 5) {
        const d = parts[0].trim();
        const close = Number(parts[4].trim());
        if (d.length >= 8 && Number.isFinite(close) && close > 0) {
          points.push({
            date: `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`,
            priceKrw: Math.round(close),
          });
        }
      }
    }
    return points;
  } catch {
    return [];
  }
}

// 3. 글로벌 종목 캔들 조회 (Yahoo Finance Chart API)
async function fetchGlobalCandles(
  symbol: string,
  timeframe: 'day' | 'week' | 'month',
  usdKrwRate: number
): Promise<CandlePoint[]> {
  try {
    const interval = timeframe === 'month' ? '1mo' : timeframe === 'week' ? '1wk' : '1d';
    const range = timeframe === 'month' ? '5y' : timeframe === 'week' ? '2y' : '6mo';
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}`;

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        Accept: 'application/json',
      },
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const json = await res.json();
    const result = json?.chart?.result?.[0];
    if (!result) return [];

    const timestamps: number[] = result.timestamp || [];
    const closes: (number | null)[] = result.indicators?.quote?.[0]?.close || [];
    const currency: string = result.meta?.currency || 'USD';

    const points: CandlePoint[] = [];
    for (let i = 0; i < timestamps.length; i++) {
      const c = closes[i];
      if (c === null || c === undefined || c <= 0) continue;
      const d = new Date(timestamps[i] * 1000).toISOString().slice(0, 10);
      let priceKrw = Math.round(c * usdKrwRate);
      if (currency === 'KRW') priceKrw = Math.round(c);
      else if (currency === 'JPY') priceKrw = Math.round(c * (usdKrwRate / 150));
      else if (currency === 'HKD') priceKrw = Math.round(c * (usdKrwRate / 7.8));

      points.push({ date: d, priceKrw });
    }
    return points;
  } catch {
    return [];
  }
}

// 실시간 USDKRW 환율 간이 조회
async function getQuickUsdKrw(): Promise<number> {
  try {
    const res = await fetch('https://query1.finance.yahoo.com/v8/finance/chart/USDKRW=X?range=1d&interval=1d', {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      cache: 'no-store',
    });
    if (res.ok) {
      const json = await res.json();
      const p = json?.chart?.result?.[0]?.meta?.regularMarketPrice;
      if (Number.isFinite(p) && p > 1000) return p;
    }
  } catch {}
  return 1350;
}

export const GET = withApiGuard('실시간 캔들 시계열 조회 (/api/quotes/candles)', async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const rawSymbols = searchParams.get('symbols') || '';
  const timeframe = (searchParams.get('timeframe') || 'day') as 'day' | 'week' | 'month';

  if (!rawSymbols) {
    return NextResponse.json({ success: false, error: 'symbols required' }, { status: 400 });
  }

  const symbols = Array.from(
    new Set(
      rawSymbols
        .split(',')
        .map((s) => normalizeSymbol(s.trim()))
        .filter(Boolean)
    )
  );

  const usdKrw = await getQuickUsdKrw();
  const candlesMap: Record<string, CandlePoint[]> = {};

  await Promise.all(
    symbols.map(async (sym) => {
      const upper = sym.toUpperCase();
      if (CRYPTO_SET.has(upper)) {
        candlesMap[sym] = await fetchUpbitCandles(upper, timeframe, 120);
      } else if (KR_CODE_RE.test(sym)) {
        candlesMap[sym] = await fetchKrCandles(sym, 120);
      } else if (upper === 'GOLD_1G') {
        const goldCandles = await fetchGlobalCandles('GC=F', timeframe, usdKrw);
        candlesMap[sym] = goldCandles.map((g) => ({
          date: g.date,
          priceKrw: Math.round(g.priceKrw / 31.1034768),
        }));
      } else {
        candlesMap[sym] = await fetchGlobalCandles(sym, timeframe, usdKrw);
      }
    })
  );

  return NextResponse.json(
    {
      success: true,
      timeframe,
      candles: candlesMap,
    },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    }
  );
});
