export const KOREAN_NAME_TO_SYMBOL: Record<string, string> = {
  비트코인: 'BTC',
  이더리움: 'ETH',
  솔라나: 'SOL',
  리플: 'XRP',
  도지: 'DOGE',
  도지코인: 'DOGE',
  에이다: 'ADA',
  아발란체: 'AVAX',
  금: 'GOLD_1G',
  금현물: 'GOLD_1G',
  골드: 'GOLD_1G',
};

// 입력된 종목 코드를 표준 심볼로 정규화
export function normalizeSymbol(raw: string): string {
  const trimmed = raw.trim();
  const lower = trimmed.toLowerCase();
  if (KOREAN_NAME_TO_SYMBOL[lower]) {
    return KOREAN_NAME_TO_SYMBOL[lower];
  }
  const upper = trimmed.toUpperCase();
  if (upper === 'GOLD' || upper === 'GOLD1G' || upper === 'KRX_GOLD') {
    return 'GOLD_1G';
  }
  return upper;
}

export interface JournalGroup {
  id: string;
  name: string;
  weight: number; // 목표 비율(%)
  symbols: string[]; // 같은 자산군으로 묶이는 종목들 (보유 수량 합산 대상)
  buySymbol: string; // 신규 자금으로 구매할 종목
  holdings: Record<string, number>; // 종목별 보유 수량
  avgPrices?: Record<string, number>; // 종목별 평균 구매 단가 (원)
  avgPricesUsd?: Record<string, number>; // 종목별 달러 평균 구매 단가 (USD, 미국/해외 주식 원본 단가 보존)
}

export interface AssetSnapshot {
  date: string; // ISO 날짜
  totalAssetsKrw: number; // 총 평가 자산 (자산 평가금 + 예수금)
  cashKrw: number; // 당시 예수금
  externalCashFlow?: number; // 외부 신규 입출금 (+입금, -출금)
}

export interface CashDepositLog {
  id: string;
  date: string;
  type: 'IN' | 'OUT'; // 'IN': 입금, 'OUT': 출금
  amountKrw: number;
  memo?: string;
}

export interface JournalAccount {
  id: string;
  name: string;
  fractional: boolean; // 소수점 구매 가능 여부
  noSell: boolean; // 판매 금지 (모으기 전용)
  cash: number; // 원화 예수금 (원)
  cashUsd?: number; // 달러 예수금 (USD)
  budget: number; // 이번에 추가로 넣을 금액 (원)
  groups: JournalGroup[];
  deposits?: CashDepositLog[]; // 입출금 기록
  snapshots?: AssetSnapshot[]; // 시간가중수익률 추적용 스냅샷
}

export interface QuoteMap {
  quotes: Record<string, { price: number; currency: string; name?: string }>;
  usdKrw: number | null;
  jpyKrw?: number | null;
  hkdKrw?: number | null;
}

export interface PlanLine {
  groupId: string;
  groupName: string;
  symbol: string;
  qty: number; // 양수: 구매, 음수: 판매
  priceKrw: number;
  amountKrw: number;
}

export interface GroupStatus {
  groupId: string;
  groupName: string;
  valueKrw: number;
  currentPct: number;
  targetPct: number;
  afterPct: number;
}

export interface PlanResult {
  lines: PlanLine[];
  statuses: GroupStatus[];
  totalKrw: number;
  spentKrw: number;
  leftoverKrw: number;
  availableCash: number;
  missingSymbols: string[];
  stockWeightSum: number;
  cashTargetPct: number;
  isOverAllocated: boolean;
}

export interface HoldingOverviewItem {
  symbol: string;
  name: string;
  groupName: string;
  qty: number;
  priceKrw: number;
  evalKrw: number;
  avgPriceKrw: number | null;
  investKrw: number | null;
  profitKrw: number | null;
  profitRate: number | null;
  weightPct: number;
}

export interface GroupOverviewItem {
  groupId: string;
  groupName: string;
  targetPct: number;
  currentPct: number;
  evalKrw: number;
  investKrw: number | null;
  profitKrw: number | null;
  profitRate: number | null;
  symbols: { symbol: string; name: string; qty: number; evalKrw: number }[];
}

export interface PortfolioSummary {
  totalStockEvalKrw: number;
  cashKrw: number;
  totalAssetsKrw: number;
  totalInvestKrw: number;
  hasInvestData: boolean;
  totalProfitKrw: number;
  totalProfitRate: number | null; // 전체 자산 기준 수익률 (총 손익 / (주식 투자원금 + 예수금))
  stockProfitRate?: number | null; // 보유 자산 순수 수익률 (총 손익 / 주식 투자원금)
  cashWeightPct: number;
  items: HoldingOverviewItem[];
  groupItems: GroupOverviewItem[];
}

const CRYPTO_OR_GOLD_SYMBOLS = new Set([
  'BTC',
  'ETH',
  'SOL',
  'XRP',
  'DOGE',
  'ADA',
  'AVAX',
  'DOT',
  'LINK',
  'GOLD_1G',
]);

const CRYPTO_ONLY_SYMBOLS = new Set([
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

export function isCryptoSymbol(symbol: string): boolean {
  return CRYPTO_ONLY_SYMBOLS.has(symbol.toUpperCase());
}

// 종목별 자연스러운 한국어 단위 반환 (주식: 주, 코인: 개, 금현물: g)
export function getSymbolUnit(symbol: string): string {
  const upper = symbol.toUpperCase();
  if (upper === 'GOLD_1G') return 'g';
  if (isCryptoSymbol(upper)) return '개';
  return '주';
}

// 소수점 구매 허용 여부 판별 (금현물은 1g 단위 정수 매매이므로 소수점 제외, 코인은 자동 허용)
export function isFractionalAllowed(symbol: string, accountFractional: boolean): boolean {
  const upper = symbol.toUpperCase();
  if (upper === 'GOLD_1G') {
    return false;
  }
  if (isCryptoSymbol(upper)) {
    return true;
  }
  return accountFractional;
}

export function priceKrw(symbol: string, q: QuoteMap): number | null {
  const item = q.quotes[symbol];
  if (!item) return null;
  if (item.currency === 'KRW') return Math.round(item.price);
  if (item.currency === 'USD') return q.usdKrw ? Math.round(item.price * q.usdKrw) : null;
  if (item.currency === 'JPY') return q.jpyKrw ? Math.round(item.price * q.jpyKrw) : null;
  if (item.currency === 'HKD') return q.hkdKrw ? Math.round(item.price * q.hkdKrw) : null;
  return null;
}

export function symbolName(symbol: string, q: QuoteMap): string {
  return q.quotes[symbol]?.name || symbol;
}

export const floorTo = (v: number, digits: number) => {
  const m = Math.pow(10, digits);
  return Math.floor(v * m + 1e-9) / m;
};

// 이동평균 구매 단가 자동 계산 (기존 수량 + 신규 구매 수량 가중 평균)
export function calcNewAvgPrice(
  oldQty: number,
  oldAvgPrice: number,
  buyQty: number,
  buyPrice: number
): number {
  const totalQty = Math.max(0, oldQty) + Math.max(0, buyQty);
  if (totalQty <= 0) return buyPrice > 0 ? buyPrice : 0;
  const currentInvest = (Math.max(0, oldQty) * Math.max(0, oldAvgPrice));
  const newInvest = (Math.max(0, buyQty) * Math.max(0, buyPrice));
  return Math.round((currentInvest + newInvest) / totalQty);
}

// 계좌 오버뷰 및 수익률 계산 (원화 + 달러 예수금 실시간 합산)
export function calcPortfolioSummary(account: JournalAccount, q: QuoteMap): PortfolioSummary {
  const cashUsdKrw = (account.cashUsd || 0) * (q.usdKrw || 1350);
  const cashKrw = Math.max(0, Math.round((account.cash || 0) + cashUsdKrw));
  let totalStockEvalKrw = 0;
  let totalInvestKrw = 0;
  let hasInvestData = false;

  const rawItems: Omit<HoldingOverviewItem, 'weightPct'>[] = [];
  const groupItemsRaw: Omit<GroupOverviewItem, 'currentPct'>[] = [];

  for (const group of account.groups) {
    let groupEvalKrw = 0;
    let groupInvestKrw = 0;
    let groupHasInvest = false;
    const groupSymbols: { symbol: string; name: string; qty: number; evalKrw: number }[] = [];

    for (const sym of group.symbols) {
      const qty = group.holdings[sym] || 0;
      if (qty <= 0) continue;

      const p = priceKrw(sym, q) || 0;
      const evalKrw = qty * p;
      totalStockEvalKrw += evalKrw;
      groupEvalKrw += evalKrw;

      const avg = group.avgPrices?.[sym];
      const avgPriceKrw = typeof avg === 'number' && avg > 0 ? avg : (p > 0 ? p : null);
      const investKrw = avgPriceKrw ? qty * avgPriceKrw : null;

      let profitKrw: number | null = null;
      let profitRate: number | null = null;

      if (investKrw !== null && investKrw > 0) {
        profitKrw = evalKrw - investKrw;
        profitRate = (profitKrw / investKrw) * 100;
        totalInvestKrw += investKrw;
        groupInvestKrw += investKrw;
        hasInvestData = true;
        groupHasInvest = true;
      }

      const symName = symbolName(sym, q);
      groupSymbols.push({ symbol: sym, name: symName, qty, evalKrw });

      rawItems.push({
        symbol: sym,
        name: symName,
        groupName: group.name,
        qty,
        priceKrw: p,
        evalKrw,
        avgPriceKrw,
        investKrw,
        profitKrw,
        profitRate,
      });
    }

    const groupProfitKrw = groupHasInvest ? groupEvalKrw - groupInvestKrw : null;
    const groupProfitRate = groupHasInvest && groupInvestKrw > 0 ? (groupProfitKrw! / groupInvestKrw) * 100 : null;

    groupItemsRaw.push({
      groupId: group.id,
      groupName: group.name,
      targetPct: group.weight || 0,
      evalKrw: groupEvalKrw,
      investKrw: groupHasInvest ? groupInvestKrw : null,
      profitKrw: groupProfitKrw,
      profitRate: groupProfitRate,
      symbols: groupSymbols,
    });
  }

  const totalAssetsKrw = totalStockEvalKrw + cashKrw;
  const cashWeightPct = totalAssetsKrw > 0 ? (cashKrw / totalAssetsKrw) * 100 : 0;

  const items: HoldingOverviewItem[] = rawItems.map((item) => ({
    ...item,
    weightPct: totalAssetsKrw > 0 ? (item.evalKrw / totalAssetsKrw) * 100 : 0,
  }));

  const groupItems: GroupOverviewItem[] = groupItemsRaw.map((g) => ({
    ...g,
    currentPct: totalAssetsKrw > 0 ? (g.evalKrw / totalAssetsKrw) * 100 : 0,
  }));

  let totalProfitKrw = 0;
  let totalProfitRate: number | null = null;
  let stockProfitRate: number | null = null;

  if (hasInvestData && totalInvestKrw > 0) {
    const evalOfInvested = items
      .filter((it) => it.investKrw !== null)
      .reduce((sum, it) => sum + it.evalKrw, 0);

    totalProfitKrw = evalOfInvested - totalInvestKrw;
    stockProfitRate = (totalProfitKrw / totalInvestKrw) * 100;
    // 전체 자산 기준 수익률 = 총 손익 / (주식 투자원금 + 예수금)
    const totalCapital = totalInvestKrw + cashKrw;
    totalProfitRate = totalCapital > 0 ? (totalProfitKrw / totalCapital) * 100 : null;
  }

  return {
    totalStockEvalKrw,
    cashKrw,
    totalAssetsKrw,
    totalInvestKrw,
    hasInvestData,
    totalProfitKrw,
    totalProfitRate,
    stockProfitRate,
    cashWeightPct,
    items,
    groupItems,
  };
}

// 전체 통합 요약 (전체 탭 오버뷰용)
export function calcAllAccountsSummary(accounts: JournalAccount[], q: QuoteMap): PortfolioSummary {
  let totalStockEvalKrw = 0;
  let cashKrw = 0;
  let totalInvestKrw = 0;
  let hasInvestData = false;

  const allItems: HoldingOverviewItem[] = [];
  const groupMap: Record<
    string,
    {
      groupName: string;
      evalKrw: number;
      investKrw: number;
      hasInvest: boolean;
      symbols: { symbol: string; name: string; qty: number; evalKrw: number }[];
    }
  > = {};

  for (const acc of accounts) {
    const s = calcPortfolioSummary(acc, q);
    totalStockEvalKrw += s.totalStockEvalKrw;
    cashKrw += s.cashKrw;
    totalInvestKrw += s.totalInvestKrw;
    if (s.hasInvestData) hasInvestData = true;

    for (const item of s.items) {
      allItems.push(item);
    }

    for (const gr of s.groupItems) {
      if (!groupMap[gr.groupName]) {
        groupMap[gr.groupName] = {
          groupName: gr.groupName,
          evalKrw: 0,
          investKrw: 0,
          hasInvest: false,
          symbols: [],
        };
      }
      groupMap[gr.groupName].evalKrw += gr.evalKrw;
      if (gr.investKrw !== null) {
        groupMap[gr.groupName].investKrw += gr.investKrw;
        groupMap[gr.groupName].hasInvest = true;
      }
      groupMap[gr.groupName].symbols.push(...gr.symbols);
    }
  }

  const totalAssetsKrw = totalStockEvalKrw + cashKrw;
  const cashWeightPct = totalAssetsKrw > 0 ? (cashKrw / totalAssetsKrw) * 100 : 0;

  const items: HoldingOverviewItem[] = allItems.map((item) => ({
    ...item,
    weightPct: totalAssetsKrw > 0 ? (item.evalKrw / totalAssetsKrw) * 100 : 0,
  }));

  const groupItems: GroupOverviewItem[] = Object.values(groupMap).map((g, idx) => {
    const profitKrw = g.hasInvest ? g.evalKrw - g.investKrw : null;
    const profitRate = g.hasInvest && g.investKrw > 0 ? (profitKrw! / g.investKrw) * 100 : null;
    return {
      groupId: `all-g-${idx}`,
      groupName: g.groupName,
      targetPct: 0,
      currentPct: totalAssetsKrw > 0 ? (g.evalKrw / totalAssetsKrw) * 100 : 0,
      evalKrw: g.evalKrw,
      investKrw: g.hasInvest ? g.investKrw : null,
      profitKrw,
      profitRate,
      symbols: g.symbols,
    };
  });

  let totalProfitKrw = 0;
  let totalProfitRate: number | null = null;
  let stockProfitRate: number | null = null;

  if (hasInvestData && totalInvestKrw > 0) {
    const evalOfInvested = items
      .filter((it) => it.investKrw !== null)
      .reduce((sum, it) => sum + it.evalKrw, 0);

    totalProfitKrw = evalOfInvested - totalInvestKrw;
    stockProfitRate = (totalProfitKrw / totalInvestKrw) * 100;
    // 전체 자산 기준 수익률 = 총 손익 / (주식 투자원금 + 예수금)
    const totalCapital = totalInvestKrw + cashKrw;
    totalProfitRate = totalCapital > 0 ? (totalProfitKrw / totalCapital) * 100 : null;
  }

  return {
    totalStockEvalKrw,
    cashKrw,
    totalAssetsKrw,
    totalInvestKrw,
    hasInvestData,
    totalProfitKrw,
    totalProfitRate,
    stockProfitRate,
    cashWeightPct,
    items,
    groupItems,
  };
}

// 리밸런싱 계산기 (예수금 + 추가금 단일 공식 & 현금 목표 비중 자동 보존)
export function calcPlan(account: JournalAccount, q: QuoteMap): PlanResult {
  const missing = new Set<string>();
  const groups = account.groups;
  const cashUsdKrw = (account.cashUsd || 0) * (q.usdKrw || 1350);
  const currentCash = Math.max(0, Math.round((account.cash || 0) + cashUsdKrw));
  const extraBudget = Math.max(0, account.budget || 0);

  // 총 가용 현금: 원화 예수금 + 달러 예수금(원화 환산) + 이번 추가 입금액
  const availableCash = currentCash + extraBudget;

  const values = groups.map((gr) => {
    let v = 0;
    for (const sym of gr.symbols) {
      const qty = gr.holdings[sym] || 0;
      if (qty <= 0) continue;
      const p = priceKrw(sym, q);
      if (p === null) missing.add(sym);
      else v += qty * p;
    }
    return v;
  });

  groups.forEach((gr) => {
    if (priceKrw(gr.buySymbol, q) === null) missing.add(gr.buySymbol);
  });

  const totalStock = values.reduce((a, b) => a + b, 0);
  const stockWeightSum = Math.round(groups.reduce((a, b) => a + (b.weight || 0), 0) * 100) / 100;
  const isOverAllocated = stockWeightSum > 100;

  // 잔여 비율은 '목표 현금 비중'으로 자동 배정 (소수점 2자리 정밀)
  const cashTargetPct = Math.max(0, Math.round((100 - stockWeightSum) * 100) / 100);

  // 총 자산 (주식 평가금 + 가용 현금)
  const grandTotal = totalStock + availableCash;

  // 각 자산군 목표 금액 및 부족분
  const gaps = groups.map((gr, i) => {
    const targetVal = grandTotal * ((gr.weight || 0) / 100);
    return targetVal - values[i];
  });

  // 목표 현금(예수금) 금액
  const targetCashKrw = grandTotal * (cashTargetPct / 100);

  // 가용 주식 구매 자금 = 가용 현금 중 목표 현금을 보존하고 남는 자금
  const maxAvailableForStock = Math.max(0, availableCash - targetCashKrw);

  let alloc: number[];
  if (account.noSell) {
    const deficits = gaps.map((x) => Math.max(0, x));
    const sumDeficits = deficits.reduce((a, b) => a + b, 0);

    if (sumDeficits > 0 && maxAvailableForStock > 0) {
      const deployableCash = Math.min(maxAvailableForStock, sumDeficits);
      alloc = deficits.map((d) => (deployableCash * d) / sumDeficits);
    } else {
      alloc = groups.map(() => 0);
    }
  } else {
    alloc = gaps.slice();
  }

  const lines: PlanLine[] = [];
  const boughtQty = groups.map(() => 0);
  let spent = 0;

  groups.forEach((gr, i) => {
    const p = priceKrw(gr.buySymbol, q);
    if (p === null || p <= 0) return;
    const raw = alloc[i] / p;
    const allowFractional = isFractionalAllowed(gr.buySymbol, account.fractional);
    const isCrypto = isCryptoSymbol(gr.buySymbol);
    const digits = isCrypto ? 8 : 4;

    const qty = raw >= 0
      ? allowFractional ? floorTo(raw, digits) : Math.floor(raw + 1e-9)
      : allowFractional ? -floorTo(-raw, digits) : -Math.floor(-raw + 1e-9);

    boughtQty[i] = qty;
    spent += qty * p;
  });

  // 정수 주 종목: 가용 자금 한도 내에서 부족한 자산군부터 1주씩 추가
  let guard = 0;
  while (guard++ < 500) {
    const remainingCash = maxAvailableForStock - spent;
    let best = -1;
    let bestGap = 0;

    groups.forEach((gr, i) => {
      const allowFractional = isFractionalAllowed(gr.buySymbol, account.fractional);
      if (allowFractional) return; // 소수점 종목은 이미 완벽 배분됨

      const p = priceKrw(gr.buySymbol, q);
      if (p === null || p <= 0 || p > remainingCash + 1e-6) return;

      const remainingGap = gaps[i] - boughtQty[i] * p;
      if (remainingGap > bestGap) {
        bestGap = remainingGap;
        best = i;
      }
    });

    if (best < 0) break;
    const p = priceKrw(groups[best].buySymbol, q) as number;
    boughtQty[best] += 1;
    spent += p;
  }

  groups.forEach((gr, i) => {
    const p = priceKrw(gr.buySymbol, q);
    if (p === null || boughtQty[i] === 0) return;
    const roundedAmount = Math.round(boughtQty[i] * p);
    lines.push({
      groupId: gr.id,
      groupName: gr.name,
      symbol: gr.buySymbol,
      qty: boughtQty[i],
      priceKrw: p,
      amountKrw: roundedAmount,
    });
  });

  const finalSpentKrw = Math.round(spent);
  const afterGrandTotal = grandTotal;
  const statuses: GroupStatus[] = groups.map((gr, i) => {
    const p = priceKrw(gr.buySymbol, q) ?? 0;
    const after = values[i] + boughtQty[i] * p;
    return {
      groupId: gr.id,
      groupName: gr.name,
      valueKrw: Math.round(values[i]),
      currentPct: grandTotal > 0 ? (values[i] / grandTotal) * 100 : 0,
      targetPct: gr.weight || 0,
      afterPct: afterGrandTotal > 0 ? (after / afterGrandTotal) * 100 : 0,
    };
  });

  return {
    lines,
    statuses,
    totalKrw: Math.round(totalStock),
    spentKrw: finalSpentKrw,
    leftoverKrw: Math.max(0, Math.round(availableCash - finalSpentKrw)),
    availableCash: Math.round(availableCash),
    missingSymbols: Array.from(missing),
    stockWeightSum,
    cashTargetPct,
    isOverAllocated,
  };
}

export interface RealizedProfitResult {
  realizedProfitKrw: number; // 실현 손익 (원)
  profitRate: number | null; // 실현 수익률 (%)
}

// 판매(매도) 시 실현 손익 계산: (판매단가 - 이동평균단가) * 판매수량
export function calcRealizedProfit(
  avgPrice: number,
  sellPrice: number,
  sellQty: number
): RealizedProfitResult {
  const absQty = Math.abs(sellQty);
  if (avgPrice <= 0 || absQty <= 0) {
    return { realizedProfitKrw: 0, profitRate: null };
  }
  const diff = sellPrice - avgPrice;
  const realizedProfitKrw = Math.round(diff * absQty);
  const profitRate = ((sellPrice - avgPrice) / avgPrice) * 100;
  return { realizedProfitKrw, profitRate };
}

// 시간가중수익률 (TWR, Time-Weighted Return) 계산
// 외부 입출금의 왜곡을 배제하고 구간별 순수 운용 수익률을 복리 누적
export function calcTWR(snapshots: AssetSnapshot[]): number | null {
  if (!snapshots || snapshots.length < 2) return null;
  let cumulative = 1.0;

  for (let i = 1; i < snapshots.length; i++) {
    const prev = snapshots[i - 1];
    const curr = snapshots[i];
    const prevVal = prev.totalAssetsKrw;
    const flow = curr.externalCashFlow || 0;

    if (prevVal <= 0) continue;

    // Sub-period return: R_t = (EndValue - Flow) / StartValue - 1
    const subReturn = (curr.totalAssetsKrw - flow) / prevVal - 1;
    cumulative *= 1 + subReturn;
  }

  return (cumulative - 1) * 100;
}
