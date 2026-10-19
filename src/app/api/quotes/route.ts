import { NextResponse } from 'next/server';
import { withApiGuard } from '@/lib/observability/guard';
import { normalizeSymbol } from '@/utils/rebalance';

export const dynamic = 'force-dynamic';

interface QuoteEntry {
  price: number;
  currency: string;
  name?: string;
  at: number;
}

const CACHE_TTL_MS = 60_000;
const KR_CODE_RE = /^\d{6}$/;

const COIN_DISPLAY_NAMES: Record<string, string> = {
  BTC: '비트코인',
  ETH: '이더리움',
  SOL: '솔라나',
  XRP: '리플',
  DOGE: '도지코인',
  ADA: '에이다',
  AVAX: '아발란체',
  DOT: '폴카닷',
  LINK: '체인링크',
};

const g = globalThis as unknown as { __jusik_quote_cache__?: Map<string, QuoteEntry> };
const cache: Map<string, QuoteEntry> = (g.__jusik_quote_cache__ ??= new Map());

// 1. 암호화폐(코인) 실시간 원화 시세 (업비트 공개 API)
async function fetchUpbitQuote(coinSymbol: string): Promise<QuoteEntry | null> {
  const clean = coinSymbol.replace(/^KRW-/, '').toUpperCase();
  const hit = cache.get(`COIN_${clean}`);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit;

  try {
    const res = await fetch(`https://api.upbit.com/v1/ticker?markets=KRW-${clean}`, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
    if (!res.ok) return hit ?? null;
    const json = await res.json();
    if (!Array.isArray(json) || json.length === 0) return hit ?? null;
    const tradePrice = Number(json[0].trade_price);
    if (!Number.isFinite(tradePrice) || tradePrice <= 0) return hit ?? null;

    const entry: QuoteEntry = {
      price: tradePrice,
      currency: 'KRW',
      name: COIN_DISPLAY_NAMES[clean] || `${clean} (코인)`,
      at: Date.now(),
    };
    cache.set(`COIN_${clean}`, entry);
    return entry;
  } catch {
    return hit ?? null;
  }
}

// 2. 한국 주식/ETF (6자리 숫자) 실시간 시세 (네이버 증권 API 3중 폴백)
async function fetchKrQuote(code: string): Promise<QuoteEntry | null> {
  const hit = cache.get(code);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit;

  // 1차: 네이버 증권 모바일 API
  try {
    const res = await fetch(`https://m.stock.naver.com/api/stock/${encodeURIComponent(code)}/basic`, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
        Accept: 'application/json',
      },
      cache: 'no-store',
    });
    if (res.ok) {
      const json = await res.json();
      const rawPrice = json?.closePrice;
      if (rawPrice) {
        const price = Number(String(rawPrice).replace(/,/g, ''));
        if (Number.isFinite(price) && price > 0) {
          const entry: QuoteEntry = {
            price,
            currency: 'KRW',
            name: json?.stockName ? String(json.stockName) : undefined,
            at: Date.now(),
          };
          cache.set(code, entry);
          return entry;
        }
      }
    }
  } catch {
    // 1차 실패 시 2차 폴백 진행
  }

  // 2차: 네이버 실시간 폴링 API
  try {
    const res = await fetch(`https://polling.finance.naver.com/api/realtime/service/item/${encodeURIComponent(code)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        Accept: 'application/json',
      },
      cache: 'no-store',
    });
    if (res.ok) {
      const json = await res.json();
      const item = json?.result?.areas?.[0]?.datas?.[0];
      const rawPrice = item?.nv;
      const rawName = item?.nm;
      if (rawPrice) {
        const price = Number(rawPrice);
        if (Number.isFinite(price) && price > 0) {
          const entry: QuoteEntry = {
            price,
            currency: 'KRW',
            name: rawName ? String(rawName) : undefined,
            at: Date.now(),
          };
          cache.set(code, entry);
          return entry;
        }
      }
    }
  } catch {
    // 2차 실패 시 3차 폴백 진행
  }

  // 3차: 야후 파이낸스 코스피(.KS) 및 코스닥(.KQ) 폴백
  for (const suffix of ['.KS', '.KQ']) {
    try {
      const entry = await fetchGlobalQuote(`${code}${suffix}`);
      if (entry && entry.price > 0) {
        const krwEntry: QuoteEntry = {
          price: entry.price,
          currency: 'KRW',
          name: entry.name,
          at: Date.now(),
        };
        cache.set(code, krwEntry);
        return krwEntry;
      }
    } catch {
      // ignore
    }
  }

  return hit ?? null;
}

// 3. 글로벌/미국 종목 및 환율 (Yahoo Finance)
async function fetchGlobalQuote(symbol: string): Promise<QuoteEntry | null> {
  const hit = cache.get(symbol);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit;

  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`,
      { headers: { 'User-Agent': 'Mozilla/5.0' }, cache: 'no-store' }
    );
    if (!res.ok) return hit ?? null;
    const json = await res.json();
    const meta = json?.chart?.result?.[0]?.meta;
    const price = Number(meta?.regularMarketPrice);
    if (!Number.isFinite(price) || price <= 0) return hit ?? null;

    const entry: QuoteEntry = {
      price,
      currency: String(meta?.currency || 'USD'),
      name: meta?.shortName || meta?.symbol || symbol,
      at: Date.now(),
    };
    cache.set(symbol, entry);
    return entry;
  } catch {
    return hit ?? null;
  }
}

// 4. 금현물 1g (GOLD_1G: 국제 금 선물 GC=F를 트로이온스 31.1035g 및 환율로 원화 환산)
async function fetchGold1gQuote(usdKrw: number): Promise<QuoteEntry | null> {
  const hit = cache.get('GOLD_1G');
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit;

  try {
    const goldOz = await fetchGlobalQuote('GC=F');
    if (!goldOz || goldOz.price <= 0) return hit ?? null;

    const pricePerGramKrw = Math.round((goldOz.price * usdKrw) / 31.1034768);
    const entry: QuoteEntry = {
      price: pricePerGramKrw,
      currency: 'KRW',
      name: '국제 금현물 (1g)',
      at: Date.now(),
    };
    cache.set('GOLD_1G', entry);
    return entry;
  } catch {
    return hit ?? null;
  }
}

async function fetchQuote(rawSymbol: string, usdKrw: number): Promise<QuoteEntry | null> {
  const symbol = normalizeSymbol(rawSymbol);

  // 코인 심볼인지 검사 (BTC, ETH 등 대표 코인 또는 KRW- 접두사)
  if (COIN_DISPLAY_NAMES[symbol] || symbol.startsWith('KRW-')) {
    const coinRes = await fetchUpbitQuote(symbol);
    if (coinRes) return coinRes;
  }

  // 금현물 1g 심볼
  if (symbol === 'GOLD_1G') {
    const goldRes = await fetchGold1gQuote(usdKrw);
    if (goldRes) return goldRes;
  }

  // 6자리 숫자인 경우 한국 주식/ETF 우선
  if (KR_CODE_RE.test(symbol)) {
    const krRes = await fetchKrQuote(symbol);
    if (krRes) return krRes;
    return fetchGlobalQuote(`${symbol}.KS`);
  }

  return fetchGlobalQuote(symbol);
}

// GET /api/quotes?symbols=비트코인,금,005930,VOO
export const GET = withApiGuard('현재 가격 조회 (/api/quotes)', async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const rawParams = (searchParams.get('symbols') || '').split(',');

  const symbols: string[] = [];
  rawParams.forEach((s) => {
    const norm = normalizeSymbol(s);
    if (norm && !symbols.includes(norm)) {
      symbols.push(norm);
    }
  });

  const validSymbols = symbols.slice(0, 50);

  const [fxUsd, fxJpy, fxHkd, fxEur, fxCny] = await Promise.all([
    fetchGlobalQuote('KRW=X'),
    fetchGlobalQuote('JPYKRW=X'),
    fetchGlobalQuote('HKDKRW=X'),
    fetchGlobalQuote('EURKRW=X'),
    fetchGlobalQuote('CNYKRW=X'),
  ]);
  const usdKrw = fxUsd?.price ?? 1345;
  const jpyKrw = fxJpy?.price ?? 9.0;
  const hkdKrw = fxHkd?.price ?? 173;
  const eurKrw = fxEur?.price ?? 1470;
  const cnyKrw = fxCny?.price ?? 190;

  const results = await Promise.all(validSymbols.map((s) => fetchQuote(s, usdKrw)));

  const quotes: Record<string, { price: number; currency: string; name?: string }> = {};
  validSymbols.forEach((s, i) => {
    const r = results[i];
    if (r) {
      quotes[s] = {
        price: r.price,
        currency: r.currency,
        name: r.name,
      };
    }
  });

  return NextResponse.json(
    {
      success: true,
      quotes,
      usdKrw,
      jpyKrw,
      hkdKrw,
      eurKrw,
      cnyKrw,
      fetchedAt: new Date().toISOString(),
    },
    { headers: { 'Cache-Control': 'no-store' } }
  );
});
