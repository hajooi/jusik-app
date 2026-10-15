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
  budget?: number; // 레거시 호환 필드 (미사용)
  monthlyDepositGoal?: number; // 매월 정기 적립 목표 금액 프리셋 (원)
  groups: JournalGroup[];
  deposits?: CashDepositLog[]; // 입출금 기록
  snapshots?: AssetSnapshot[]; // 시간가중수익률 추적용 스냅샷
  fees?: {
    krFeePct?: number; // 국내 주식 거래 수수료 (%) 기본 0.015
    usFeePct?: number; // 해외 주식 거래 수수료 (%) 기본 0.07
    fxFeePct?: number; // 환전 비용 실질 스프레드 (%) 호환 유지
    fxDiscountPct?: number; // 환율 우대율 (%) 기본 95
  };
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
  // 총 가용 현금: 원화 예수금 + 달러 예수금(원화 환산)
  const availableCash = currentCash;

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

  // 최소 거래 가능 금액 (가상자산 및 국내외 거래소 최소 주문 단위: 5,000원)
  // 5,000원 미만의 미세한 잔여 괴리나 수수료 오차로 인한 소수점 자투리 주문 방지
  const MIN_TRADE_AMOUNT_KRW = 5000;

  // 5,000원 미만 잔여 괴리는 리밸런싱 완료 상태로 간주
  const effectiveGaps = gaps.map((x) => (Math.abs(x) < MIN_TRADE_AMOUNT_KRW ? 0 : x));

  let alloc: number[];
  if (account.noSell) {
    const deficits = effectiveGaps.map((x) => Math.max(0, x));
    const sumDeficits = deficits.reduce((a, b) => a + b, 0);

    if (sumDeficits > 0 && maxAvailableForStock >= MIN_TRADE_AMOUNT_KRW) {
      const deployableCash = Math.min(maxAvailableForStock, sumDeficits);
      alloc = deficits.map((d) => (d >= MIN_TRADE_AMOUNT_KRW ? (deployableCash * d) / sumDeficits : 0));
    } else {
      alloc = groups.map(() => 0);
    }
  } else {
    alloc = effectiveGaps.slice();
  }

  // 거래 수수료 및 환전 비용을 감안한 실질 1단위 비용 계산 헬퍼
  const getUnitCost = (sym: string): number => {
    const p = priceKrw(sym, q);
    if (p === null || p <= 0) return 0;
    const isCrypto = isCryptoSymbol(sym);
    const norm = normalizeSymbol(sym);
    const isUsd = !isCrypto && !/^\d{6}$/.test(norm);
    const feePct = isUsd ? (account.fees?.usFeePct ?? 0.07) : (account.fees?.krFeePct ?? 0.015);
    const feeFactor = 1 + feePct / 100;
    const fxDiscountPct = account.fees?.fxDiscountPct ?? 95;
    const fxSpreadPct = isUsd ? 1 * (1 - fxDiscountPct / 100) : 0;
    const fxFactor = 1 + fxSpreadPct / 100;
    return p * feeFactor * fxFactor;
  };

  const lines: PlanLine[] = [];
  const boughtQty = groups.map(() => 0);
  const groupSellDelta = groups.map(() => 0);
  let spent = 0;

  groups.forEach((gr, i) => {
    // 1) 판매(비중 축소)인 경우: 대표 종목 외의 서브 종목부터 우선 판매하여 보유 한도 내에서 정리
    if (alloc[i] < 0) {
      let remainingSellAmount = Math.abs(alloc[i]);

      // 서브 종목들 (대표 종목이 아닌 보유 종목들)
      const subSymbols = gr.symbols.filter(
        (sym) => sym !== gr.buySymbol && (gr.holdings[sym] || 0) > 0
      );

      for (const sym of subSymbols) {
        if (remainingSellAmount <= 0) break;
        const p = priceKrw(sym, q);
        if (p === null || p <= 0) continue;
        const heldQty = gr.holdings[sym] || 0;
        if (heldQty <= 0) continue;

        const allowFractional = isFractionalAllowed(sym, account.fractional);
        const isCrypto = isCryptoSymbol(sym);
        const digits = isCrypto ? 8 : 4;

        const rawNeeded = remainingSellAmount / p;
        const qtyToSell = Math.min(
          heldQty,
          allowFractional ? floorTo(rawNeeded, digits) : Math.floor(rawNeeded + 1e-9)
        );

        if (qtyToSell > 0) {
          const sellAmountKrw = Math.round(qtyToSell * p);
          // 전량 정리이거나 최소 주문 금액(5,000원) 이상일 때만 판매 라인 생성
          if (sellAmountKrw >= MIN_TRADE_AMOUNT_KRW || heldQty <= qtyToSell) {
            lines.push({
              groupId: gr.id,
              groupName: gr.name,
              symbol: sym,
              qty: -qtyToSell,
              priceKrw: p,
              amountKrw: -sellAmountKrw,
            });
            remainingSellAmount -= sellAmountKrw;
            groupSellDelta[i] += sellAmountKrw;
            spent -= sellAmountKrw;
          }
        }
      }

      // 서브 종목을 다 판매하고도 더 줄여야 할 때만 대표 종목(buySymbol) 판매 (실제 보유량 한도 캡)
      if (remainingSellAmount > 0) {
        const p = priceKrw(gr.buySymbol, q);
        const heldQty = gr.holdings[gr.buySymbol] || 0;
        if (p !== null && p > 0 && heldQty > 0) {
          const allowFractional = isFractionalAllowed(gr.buySymbol, account.fractional);
          const isCrypto = isCryptoSymbol(gr.buySymbol);
          const digits = isCrypto ? 8 : 4;

          const rawNeeded = remainingSellAmount / p;
          const qtyToSell = Math.min(
            heldQty,
            allowFractional ? floorTo(rawNeeded, digits) : Math.floor(rawNeeded + 1e-9)
          );

          if (qtyToSell > 0) {
            const sellAmountKrw = Math.round(qtyToSell * p);
            if (sellAmountKrw >= MIN_TRADE_AMOUNT_KRW || heldQty <= qtyToSell) {
              lines.push({
                groupId: gr.id,
                groupName: gr.name,
                symbol: gr.buySymbol,
                qty: -qtyToSell,
                priceKrw: p,
                amountKrw: -sellAmountKrw,
              });
              remainingSellAmount -= sellAmountKrw;
              groupSellDelta[i] += sellAmountKrw;
              spent -= sellAmountKrw;
            }
          }
        }
      }
      return;
    }

    // 2) 구매(비중 확대)인 경우: 앞으로 모아갈 대표 종목(buySymbol) 구매
    if (alloc[i] > 0) {
      const p = priceKrw(gr.buySymbol, q);
      if (p === null || p <= 0) return;
      const unitCost = getUnitCost(gr.buySymbol);
      const raw = alloc[i] / (unitCost > 0 ? unitCost : p);
      const allowFractional = isFractionalAllowed(gr.buySymbol, account.fractional);
      const isCrypto = isCryptoSymbol(gr.buySymbol);
      const digits = isCrypto ? 8 : 4;

      const qty = allowFractional ? floorTo(raw, digits) : Math.floor(raw + 1e-9);
      const estAmount = Math.round(qty * p);

      if (estAmount >= MIN_TRADE_AMOUNT_KRW) {
        boughtQty[i] = qty;
        spent += qty * (unitCost > 0 ? unitCost : p);
      }
    }
  });

  // 정수 주 종목: 가용 자금 한도 내에서 부족한 자산군부터 1주씩 추가
  let guard = 0;
  while (guard++ < 500) {
    const remainingCash = maxAvailableForStock - spent;
    let best = -1;
    let bestGap = 0;

    groups.forEach((gr, i) => {
      if (alloc[i] <= 0) return; // 구매 대상 자산군만
      const allowFractional = isFractionalAllowed(gr.buySymbol, account.fractional);
      if (allowFractional) return; // 소수점 종목은 이미 완벽 배분됨

      const p = priceKrw(gr.buySymbol, q);
      if (p === null || p <= 0) return;
      const unitCost = getUnitCost(gr.buySymbol);
      const costToCheck = unitCost > 0 ? unitCost : p;
      if (costToCheck > remainingCash + 1e-6) return;

      const remainingGap = gaps[i] - boughtQty[i] * p;
      if (remainingGap > bestGap) {
        bestGap = remainingGap;
        best = i;
      }
    });

    if (best < 0) break;
    const unitCost = getUnitCost(groups[best].buySymbol);
    const p = priceKrw(groups[best].buySymbol, q) as number;
    boughtQty[best] += 1;
    spent += unitCost > 0 ? unitCost : p;
  }

  // 구매 라인 추가
  groups.forEach((gr, i) => {
    if (boughtQty[i] <= 0) return;
    const p = priceKrw(gr.buySymbol, q);
    if (p === null || p <= 0) return;
    const roundedAmount = Math.round(boughtQty[i] * p);
    if (roundedAmount < MIN_TRADE_AMOUNT_KRW) return; // 5,000원 미만 자투리 구매 제외
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
    const after = values[i] + boughtQty[i] * p - groupSellDelta[i];
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

export interface TradeSettlementResult {
  isUsd: boolean;
  feePct: number;
  feeKrw: number;
  feeUsd: number;
  tradeAmountKrw: number; // 순 체결금액 (원)
  tradeAmountUsd: number; // 순 체결금액 (달러)
  totalCostKrw: number; // 수수료 및 자동환전 포함 총 원화 지출액(구매 시) 또는 순 입금액(판매 시)
  nextCash: number; // 거래 후 원화 예수금
  nextCashUsd: number; // 거래 후 달러 예수금
  appliedFxRate: number; // 적용된 실질 환율
  newAvgKrw: number; // 수수료 가산 이동평균단가 (원)
  newAvgUsd?: number; // 수수료 가산 이동평균단가 (달러)
  realizedProfitKrw?: number; // 실현 손익 (원)
  realizedProfitRate?: number; // 실현 수익률 (%)
  shortageKrw?: number; // 가용 잔액 부족 시 자동 입금되어야 할 부족액 (원)
}

// 매매 수수료 및 자동 환전(통합증거금) 정밀 결제 계산기
export function calculateTradeSettlement({
  symbol,
  tradeQty,
  price,
  currentHoldings = 0,
  currentAvgKrw = 0,
  currentAvgUsd = 0,
  currentCashKrw = 0,
  currentCashUsd = 0,
  fees,
  usdRate = 1350,
}: {
  symbol: string;
  tradeQty: number;
  price: number;
  currentHoldings?: number;
  currentAvgKrw?: number;
  currentAvgUsd?: number;
  currentCashKrw?: number;
  currentCashUsd?: number;
  fees?: JournalAccount['fees'];
  usdRate?: number;
}): TradeSettlementResult {
  const isCrypto = isCryptoSymbol(symbol);
  const isUsd = !isCrypto && symbol !== 'GOLD_1G' && !/^\d{6}$/.test(symbol);
  const absQty = Math.abs(tradeQty);
  const isBuy = tradeQty > 0;

  // 1. 거래 수수료율 결정 (해외 vs 국내)
  const feePct = isUsd
    ? (fees?.usFeePct !== undefined ? fees.usFeePct : 0.07)
    : (fees?.krFeePct !== undefined ? fees.krFeePct : 0.015);
  const feeRate = Math.max(0, feePct) / 100;

  // 2. 환율 우대율 및 자동 환전 스프레드 적용
  const fxDiscountPct = fees?.fxDiscountPct !== undefined ? fees.fxDiscountPct : 95;
  // 기준 스프레드 1.0% (전신환 매도/매수율 기준)
  const spreadFactor = ((1 - Math.min(100, Math.max(0, fxDiscountPct)) / 100) * 1.0) / 100;
  // 달러 구매 시 실질 환율 (원화 -> 달러)
  const buyUsdRate = usdRate * (1 + spreadFactor);
  // 달러 판매 시 실질 환율 (달러 -> 원화)
  const sellUsdRate = usdRate * (1 - spreadFactor);

  let nextCash = currentCashKrw;
  let nextCashUsd = currentCashUsd;
  let tradeAmountKrw = 0;
  let tradeAmountUsd = 0;
  let feeKrw = 0;
  let feeUsd = 0;
  let totalCostKrw = 0;
  let appliedFxRate = usdRate;
  let newAvgKrw = currentAvgKrw || (isUsd ? Math.round(price * usdRate) : Math.round(price));
  let newAvgUsd = currentAvgUsd || (isUsd ? price : 0);
  let realizedProfitKrw: number | undefined = undefined;
  let realizedProfitRate: number | undefined = undefined;

  let shortageKrw = 0;

  if (isUsd) {
    tradeAmountUsd = Math.round(absQty * price * 100) / 100;
    feeUsd = Math.round(tradeAmountUsd * feeRate * 100) / 100;
    appliedFxRate = isBuy ? buyUsdRate : sellUsdRate;

    if (isBuy) {
      // 매수: 취득원가에 수수료 가산
      const totalBuyAmountUsd = tradeAmountUsd + feeUsd;
      const totalBuyAmountKrw = Math.round(totalBuyAmountUsd * buyUsdRate);
      tradeAmountKrw = Math.round(tradeAmountUsd * buyUsdRate);
      feeKrw = Math.round(feeUsd * buyUsdRate);
      totalCostKrw = totalBuyAmountKrw;

      // 신규 이동평균단가 (수수료 포함 취득원가 기준)
      const totalQty = currentHoldings + absQty;
      if (totalQty > 0) {
        newAvgUsd = Math.round(((currentHoldings * (currentAvgUsd || price) + totalBuyAmountUsd) / totalQty) * 100) / 100;
        newAvgKrw = Math.round((currentHoldings * (currentAvgKrw || Math.round(price * buyUsdRate)) + totalBuyAmountKrw) / totalQty);
      }

      // 결제: 달러 예수금 우선 차감 ➔ 부족분 원화 자동 환전
      if (nextCashUsd >= totalBuyAmountUsd) {
        nextCashUsd = Math.round((nextCashUsd - totalBuyAmountUsd) * 100) / 100;
      } else {
        const shortageUsd = totalBuyAmountUsd - nextCashUsd;
        nextCashUsd = 0;
        const autoFxCostKrw = Math.round(shortageUsd * buyUsdRate);
        if (nextCash >= autoFxCostKrw) {
          nextCash = Math.round(nextCash - autoFxCostKrw);
        } else {
          shortageKrw = autoFxCostKrw - nextCash;
          nextCash = 0;
        }
      }
    } else {
      // 판매: 수수료 차감 후 순 입금액
      const netProceedUsd = Math.max(0, tradeAmountUsd - feeUsd);
      tradeAmountKrw = Math.round(tradeAmountUsd * sellUsdRate);
      feeKrw = Math.round(feeUsd * sellUsdRate);
      totalCostKrw = Math.round(netProceedUsd * sellUsdRate);

      // 달러 예수금으로 입금
      nextCashUsd = Math.round((nextCashUsd + netProceedUsd) * 100) / 100;

      // 실현 손익 계산: (판매단가 - 평단가) * 판매수량 - 수수료
      const sellProceedKrw = tradeAmountKrw - feeKrw;
      const costBasisKrw = Math.round(absQty * (currentAvgKrw || Math.round(price * sellUsdRate)));
      realizedProfitKrw = sellProceedKrw - costBasisKrw;
      realizedProfitRate = costBasisKrw > 0 ? (realizedProfitKrw / costBasisKrw) * 100 : 0;
      newAvgKrw = currentAvgKrw;
      newAvgUsd = currentAvgUsd;
    }
  } else {
    // 국내 자산 (KRW)
    tradeAmountKrw = Math.round(absQty * price);
    feeKrw = Math.round(tradeAmountKrw * feeRate);

    if (isBuy) {
      // 매수: 취득원가에 수수료 가산
      const totalBuyAmountKrw = tradeAmountKrw + feeKrw;
      totalCostKrw = totalBuyAmountKrw;

      const totalQty = currentHoldings + absQty;
      if (totalQty > 0) {
        newAvgKrw = Math.round((currentHoldings * (currentAvgKrw || price) + totalBuyAmountKrw) / totalQty);
      }

      if (nextCash >= totalBuyAmountKrw) {
        nextCash = Math.round(nextCash - totalBuyAmountKrw);
      } else {
        // 원화 부족 시 달러 예수금 자동 환전 (달러 매도하여 원화 충당)
        const shortageKrwNeeded = totalBuyAmountKrw - nextCash;
        nextCash = 0;
        const neededUsdToSell = Math.round((shortageKrwNeeded / sellUsdRate) * 100) / 100;
        if (nextCashUsd >= neededUsdToSell) {
          nextCashUsd = Math.round((nextCashUsd - neededUsdToSell) * 100) / 100;
        } else {
          const shortageUsd = neededUsdToSell - nextCashUsd;
          nextCashUsd = 0;
          shortageKrw = Math.round(shortageUsd * sellUsdRate);
        }
      }
    } else {
      // 판매: 수수료 차감 후 순 입금
      const netProceedKrw = Math.max(0, tradeAmountKrw - feeKrw);
      totalCostKrw = netProceedKrw;
      nextCash = Math.round(nextCash + netProceedKrw);

      const costBasisKrw = Math.round(absQty * (currentAvgKrw || price));
      realizedProfitKrw = netProceedKrw - costBasisKrw;
      realizedProfitRate = costBasisKrw > 0 ? (realizedProfitKrw / costBasisKrw) * 100 : 0;
      newAvgKrw = currentAvgKrw;
    }
  }

  return {
    isUsd,
    feePct,
    feeKrw,
    feeUsd,
    tradeAmountKrw: isBuy ? tradeAmountKrw : -tradeAmountKrw,
    tradeAmountUsd: isBuy ? tradeAmountUsd : -tradeAmountUsd,
    totalCostKrw,
    nextCash,
    nextCashUsd,
    appliedFxRate,
    newAvgKrw,
    newAvgUsd,
    realizedProfitKrw,
    realizedProfitRate,
    shortageKrw: shortageKrw > 0 ? shortageKrw : undefined,
  };
}
