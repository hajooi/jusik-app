import { NextResponse } from 'next/server';
import { withApiGuard } from '@/lib/observability/guard';
import { normalizeSymbol } from '@/utils/rebalance';

export const dynamic = 'force-dynamic';

interface HistoryQuoteResult {
  symbol: string;
  date: string;
  price: number;
  currency: string;
  name?: string;
  priceKrw: number;
}

const CRYPTO_HISTORY_SYMBOLS = new Set([
  'BTC',
  'ETH',
  'SOL',
  'XRP',
  'DOGE',
  'ADA',
  'AVAX',
  'DOT',
  'LINK',
]);

// 1. 암호화폐 과거 특정 일자 종가 (업비트 일봉 캔들)
async function fetchUpbitHistory(coinSymbol: string, dateStr: string): Promise<HistoryQuoteResult | null> {
  const clean = coinSymbol.replace(/^KRW-/, '').replace(/^COIN_/, '').toUpperCase();
  try {
    const toParam = `${dateStr}T23:59:59Z`;
    const res = await fetch(`https://api.upbit.com/v1/candles/days?market=KRW-${clean}&to=${encodeURIComponent(toParam)}&count=1`, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (!Array.isArray(json) || json.length === 0) return null;
    const item = json[0];
    const tradePrice = Number(item.trade_price);
    if (!Number.isFinite(tradePrice) || tradePrice <= 0) return null;

    return {
      symbol: coinSymbol,
      date: item.candle_date_time_kst?.slice(0, 10) || dateStr,
      price: tradePrice,
      currency: 'KRW',
      priceKrw: tradePrice,
    };
  } catch {
    return null;
  }
}

// 국제 금현물 1g 과거 특정 일자 종가 (GC=F 트로이온스 ➔ 1g 환산)
async function fetchGold1gHistory(targetDate: string, usdKrw: number): Promise<HistoryQuoteResult | null> {
  const goldOz = await fetchGlobalHistory('GC=F', targetDate, usdKrw);
  if (!goldOz || goldOz.price <= 0) return null;
  const pricePerGramKrw = Math.round((goldOz.price * usdKrw) / 31.1034768);
  return {
    symbol: 'GOLD_1G',
    date: goldOz.date,
    price: pricePerGramKrw,
    currency: 'KRW',
    name: '국제 금현물 (1g)',
    priceKrw: pricePerGramKrw,
  };
}

// 2. 한국 주식/ETF 과거 특정 일자 종가 (네이버 증권 일별 시세)
async function fetchKrHistory(code: string, targetDate: string): Promise<HistoryQuoteResult | null> {
  try {
    // 네이버 모바일 일별 시세 API (최근 60영업일)
    const res = await fetch(`https://m.stock.naver.com/api/stock/${encodeURIComponent(code)}/price?pageSize=60&page=1`, {
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
        const targetClean = targetDate.replace(/-/g, '');
        // targetClean 이하 중 가장 가까운 날짜 탐색 (주말/공휴일 대응)
        // localTradedAt은 "2026-10-13" 형식이므로 하이픈을 제거하여 정확한 YYYYMMDD로 비교
        const match = list.find((it: { localTradedAt?: string }) => {
          const rawD = String(it.localTradedAt || '').replace(/-/g, '');
          const d = rawD.slice(0, 8);
          return d <= targetClean;
        });

        if (match) {
          const rawPrice = match.closePrice;
          const price = Number(String(rawPrice).replace(/,/g, ''));
          if (Number.isFinite(price) && price > 0) {
            const rawTraded = String(match.localTradedAt || targetClean).replace(/-/g, '');
            const formattedDate = `${rawTraded.slice(0, 4)}-${rawTraded.slice(4, 6)}-${rawTraded.slice(6, 8)}`;
            return {
              symbol: code,
              date: formattedDate,
              price,
              currency: 'KRW',
              priceKrw: price,
            };
          }
        }
      }
    }

    // 60일 이전 데이터이거나 위 API 실패 시 네이버 차트 일별 XML API 폴백 (최근 1000영업일)
    const chartRes = await fetch(`https://fchart.stock.naver.com/sise.nhn?symbol=${encodeURIComponent(code)}&timeframe=day&count=500&requestType=0`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      cache: 'no-store',
    });
    if (!chartRes.ok) return null;
    const xmlText = await chartRes.text();
    const itemRegex = /<item\s+data="([^"]+)"\s*\/>/g;
    const targetClean = targetDate.replace(/-/g, '');
    let lastMatchPrice: number | null = null;
    let lastMatchDate: string = targetDate;
    let match: RegExpExecArray | null;

    while ((match = itemRegex.exec(xmlText)) !== null) {
      const parts = match[1].split('|'); // 날짜|시가|고가|저가|종가|거래량
      if (parts.length >= 5) {
        const d = parts[0].trim();
        const close = Number(parts[4].trim());
        if (d <= targetClean && Number.isFinite(close) && close > 0) {
          lastMatchPrice = close;
          lastMatchDate = `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`;
        }
      }
    }

    if (lastMatchPrice && lastMatchPrice > 0) {
      return {
        symbol: code,
        date: lastMatchDate,
        price: lastMatchPrice,
        currency: 'KRW',
        priceKrw: lastMatchPrice,
      };
    }

    return null;
  } catch {
    return null;
  }
}

// 3. 글로벌 종목 (Yahoo Finance Chart API)
async function fetchGlobalHistory(
  symbol: string,
  targetDate: string,
  usdKrwRate: number
): Promise<HistoryQuoteResult | null> {
  try {
    const targetSec = Math.floor(new Date(`${targetDate}T00:00:00Z`).getTime() / 1000);
    // 선택일 전후 7일 버퍼로 주말/휴장일 대응
    const p1 = targetSec - 86400 * 7;
    const p2 = targetSec + 86400 * 2;

    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?period1=${p1}&period2=${p2}&interval=1d`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        Accept: 'application/json',
      },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const json = await res.json();
    const result = json?.chart?.result?.[0];
    if (!result) return null;

    const timestamps: number[] = result.timestamp || [];
    const closes: (number | null)[] = result.indicators?.quote?.[0]?.close || [];
    const currency: string = result.meta?.currency || 'USD';
    const name: string | undefined = result.meta?.shortName || result.meta?.longName;

    if (timestamps.length === 0 || closes.length === 0) return null;

    // targetSec 이하 중 가장 늦은 타임스탬프 탐색
    let bestIdx = -1;
    for (let i = timestamps.length - 1; i >= 0; i--) {
      if (timestamps[i] <= targetSec + 86400 && closes[i] !== null && closes[i]! > 0) {
        bestIdx = i;
        break;
      }
    }
    if (bestIdx < 0) {
      bestIdx = closes.findIndex((c) => c !== null && c > 0);
    }
    if (bestIdx < 0 || closes[bestIdx] === null) return null;

    const price = Math.round((closes[bestIdx] as number) * 100) / 100;
    const matchedDate = new Date(timestamps[bestIdx] * 1000).toISOString().slice(0, 10);

    let priceKrw = Math.round(price * usdKrwRate);
    if (currency === 'KRW') {
      priceKrw = Math.round(price);
    } else if (currency === 'JPY') {
      priceKrw = Math.round(price * (usdKrwRate / 150)); // JPY 근사 환산
    } else if (currency === 'HKD') {
      priceKrw = Math.round(price * (usdKrwRate / 7.8)); // HKD 근사 환산
    }

    return {
      symbol,
      date: matchedDate,
      price,
      currency,
      name,
      priceKrw,
    };
  } catch {
    return null;
  }
}

// 과거 특정 일자의 실제 USDKRW 환율 (야후 파이낸스 차트)
async function fetchHistoricalUsdKrw(targetDate: string): Promise<number> {
  try {
    const targetSec = Math.floor(new Date(`${targetDate}T00:00:00Z`).getTime() / 1000);
    const p1 = targetSec - 86400 * 7;
    const p2 = targetSec + 86400 * 2;
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/USDKRW=X?period1=${p1}&period2=${p2}&interval=1d`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        Accept: 'application/json',
      },
      cache: 'no-store',
    });
    if (!res.ok) return 1350;
    const json = await res.json();
    const result = json?.chart?.result?.[0];
    if (!result) return 1350;

    const timestamps: number[] = result.timestamp || [];
    const closes: (number | null)[] = result.indicators?.quote?.[0]?.close || [];
    if (timestamps.length === 0 || closes.length === 0) {
      const regular = result.meta?.regularMarketPrice;
      return typeof regular === 'number' && Number.isFinite(regular) ? regular : 1350;
    }

    let bestIdx = -1;
    for (let i = timestamps.length - 1; i >= 0; i--) {
      if (timestamps[i] <= targetSec + 86400 && closes[i] !== null && closes[i]! > 0) {
        bestIdx = i;
        break;
      }
    }
    if (bestIdx < 0) {
      bestIdx = closes.findIndex((c) => c !== null && c > 0);
    }
    if (bestIdx >= 0 && closes[bestIdx] !== null) {
      return Math.round((closes[bestIdx] as number) * 100) / 100;
    }
    const regular = result.meta?.regularMarketPrice;
    return typeof regular === 'number' && Number.isFinite(regular) ? regular : 1350;
  } catch {
    return 1350;
  }
}

export const GET = withApiGuard('과거 가격 조회 (/api/quotes/history)', async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const rawSymbol = searchParams.get('symbol');
  const targetDate = searchParams.get('date') || new Date().toISOString().slice(0, 10);

  if (!rawSymbol) {
    return NextResponse.json({ success: false, error: 'symbol is required' }, { status: 400 });
  }

  const sym = normalizeSymbol(rawSymbol);

  // 과거 거래 일자 기준 실제 달러 환율 조회 (당시 환율 적용)
  const usdKrw = await fetchHistoricalUsdKrw(targetDate);

  let result: HistoryQuoteResult | null = null;

  if (CRYPTO_HISTORY_SYMBOLS.has(sym) || sym.startsWith('COIN_') || sym.startsWith('KRW-')) {
    result = await fetchUpbitHistory(sym, targetDate);
  } else if (sym === 'GOLD_1G') {
    result = await fetchGold1gHistory(targetDate, usdKrw);
  } else if (/^\d{6}$/.test(sym)) {
    result = await fetchKrHistory(sym, targetDate);
  } else {
    result = await fetchGlobalHistory(sym, targetDate, usdKrw);
  }

  if (!result) {
    return NextResponse.json({ success: false, error: 'Price not found for date' }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    data: result,
  });
});
