import { NextResponse } from 'next/server';
import { getYahooSymbol, getCleanDisplayName, SELECT_ASSET_GROUPS } from '@/data/simulatorAssets';

export const dynamic = 'force-dynamic';
export const maxDuration = 15;

function resolveStockInfo(input: string): { symbol: string; displayName: string } {
  const trimmed = input.trim();

  // 1. 시뮬레이터 50개 자산 그룹에서 완벽 매칭
  for (const grp of SELECT_ASSET_GROUPS) {
    for (const opt of grp.options) {
      const ySymbol = getYahooSymbol(opt.id);
      if (
        ySymbol.toUpperCase() === trimmed.toUpperCase() ||
        opt.id.toUpperCase() === trimmed.toUpperCase() ||
        opt.label.includes(trimmed)
      ) {
        return {
          symbol: ySymbol,
          displayName: getCleanDisplayName(opt.label),
        };
      }
    }
  }

  // 2. 한국 6자리 코드
  if (/^\d{6}$/.test(trimmed)) {
    return {
      symbol: `${trimmed}.KS`,
      displayName: trimmed,
    };
  }

  return {
    symbol: trimmed.toUpperCase(),
    displayName: trimmed,
  };
}

interface StockQuote {
  name: string;
  symbol: string;
  price: string;
  change: string;
  isUp: boolean;
}

async function fetchQuote(symbol: string, defaultName?: string): Promise<StockQuote | null> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=1d&interval=1d`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
      },
      next: { revalidate: 60 },
    });

    if (res.ok) {
      const data = await res.json();
      const meta = data?.chart?.result?.[0]?.meta;
      if (meta && typeof meta.regularMarketPrice === 'number') {
        const current = meta.regularMarketPrice;
        const prevClose = meta.chartPreviousClose || meta.previousClose || current;
        const diff = current - prevClose;
        const percent = prevClose > 0 ? (diff / prevClose) * 100 : 0;
        const isUp = diff >= 0;
        const isKrw = symbol.endsWith('.KS') || symbol.endsWith('.KQ');
        const isUsdKrw = symbol === 'USDKRW=X';
        const formattedPrice = isKrw
          ? `${Math.round(current).toLocaleString()}원`
          : isUsdKrw
            ? `${current.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}원`
            : `$${current.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        const formattedChange = `${isUp ? '+' : ''}${percent.toFixed(2)}%`;

        return {
          name: defaultName || meta.shortName || symbol,
          symbol,
          price: formattedPrice,
          change: formattedChange,
          isUp,
        };
      }
    }
  } catch (err) {
    console.warn(`[fetchQuote error] ${symbol}`, err);
  }

  return null;
}

async function fetchNewsHeadlines(query: string): Promise<string[]> {
  try {
    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query + ' 주식')}&hl=ko&gl=KR&ceid=KR:ko`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      next: { revalidate: 300 },
    });

    if (res.ok) {
      const xml = await res.text();
      const titleMatches = xml.match(/<item>[\s\S]*?<title>(.*?)<\/title>/g) || [];
      const headlines: string[] = [];

      for (const item of titleMatches) {
        const rawTitle = item.match(/<title>(.*?)<\/title>/)?.[1];
        if (rawTitle) {
          const clean = rawTitle
            .replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/ - .*$/, '')
            .trim();

          if (clean && !headlines.includes(clean)) {
            headlines.push(clean);
          }
        }
        if (headlines.length >= 3) break;
      }

      if (headlines.length > 0) return headlines;
    }
  } catch (err) {
    console.warn('[fetchNewsHeadlines error]', err);
  }

  return [
    '미국 주요 빅테크 기업, 분기 실적 호조 속 견고한 이익 성장세 지속',
    '글로벌 인공지능 인프라 투자 확대 및 데이터센터 공급망 수요 강세',
    '미국 연준, 안정적인 고용 지표와 물가 둔화 흐름 속 경제 연착륙 전망',
  ];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const stock1Input = searchParams.get('stock1') || 'AAPL';
  const stock2Input = searchParams.get('stock2') || 'NVDA';

  const s1Info = resolveStockInfo(stock1Input);
  const s2Info = resolveStockInfo(stock2Input);

  const [spxQuote, usdkrwQuote, stock1Quote, stock2Quote, newsList] = await Promise.all([
    fetchQuote('^GSPC', 'S&P 500'),
    fetchQuote('USDKRW=X', '원/달러 환율'),
    fetchQuote(s1Info.symbol, s1Info.displayName),
    fetchQuote(s2Info.symbol, s2Info.displayName),
    fetchNewsHeadlines(`${s1Info.displayName} ${s2Info.displayName}`),
  ]);

  const now = new Date();
  const dateStr = now.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
  });

  const validStocks = [stock1Quote, stock2Quote].filter((s): s is StockQuote => s !== null);

  return NextResponse.json({
    dateStr,
    market: {
      spx: {
        price: spxQuote ? spxQuote.price.replace('$', '') : '5,800.00',
        change: spxQuote ? spxQuote.change : '+0.50%',
        isUp: spxQuote ? spxQuote.isUp : true,
      },
      usdkrw: {
        price: usdkrwQuote ? usdkrwQuote.price : '1,340.00원',
        change: usdkrwQuote ? usdkrwQuote.change : '-0.10%',
        isUp: usdkrwQuote ? usdkrwQuote.isUp : false,
      },
    },
    stocks: validStocks,
    news: newsList,
  });
}
