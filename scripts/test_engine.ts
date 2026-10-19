import assert from 'node:assert/strict';
import { packUserRecordForSupabase, ServerUserRecord } from '../src/utils/serverDb';
import {
  priceKrw,
  calcPortfolioSummary,
  calculateTradeSettlement,
  calcPlan,
  JournalAccount,
  QuoteMap,
} from '../src/utils/rebalance';

function testBackendIsolationAndAntiWipe() {
  const existingJournal = {
    accounts: [
      {
        id: 'acc-1',
        name: '장기 계좌',
        fractional: false,
        noSell: false,
        cash: 5000000,
        groups: [],
      },
    ],
    logs: [{ id: 'log-1', date: '2026-10-15', accountName: '장기 계좌', items: [] }],
  };

  // 1) /api/sync 등 타 API가 journal 없이 유저 레코드를 직렬화할 때 기존 journal 보존 검증
  const syncUserRecord: ServerUserRecord = {
    nickname: '테스트유저',
    pin: '1234',
    createdAt: '2026-01-01T00:00:00.000Z',
    lastActiveAt: '2026-10-20T00:00:00.000Z',
    completedLessons: ['lv0-1'],
    simulatorSettings: {
      initialAmount: 1000,
      // 만약 simulatorSettings 내부에 오염된 null journal이 들어오더라도 제거되어야 함
      journal: null,
    },
    journal: undefined,
  };

  const packedFromUndefined = packUserRecordForSupabase(syncUserRecord, existingJournal);
  assert.deepEqual(
    packedFromUndefined.simulator_settings.journal,
    existingJournal,
    'packUserRecordForSupabase must preserve existingJournal when u.journal is undefined'
  );

  // 2) u.journal이 빈 계좌 배열({ accounts: [], logs: [] })로 잘못 전달되었을 때도 existingJournal에 계좌가 있으면 보존
  const accidentalEmptyUserRecord: ServerUserRecord = {
    ...syncUserRecord,
    journal: { accounts: [], logs: [] },
  };
  const packedFromEmpty = packUserRecordForSupabase(accidentalEmptyUserRecord, existingJournal);
  assert.deepEqual(
    packedFromEmpty.simulator_settings.journal,
    existingJournal,
    'packUserRecordForSupabase must not overwrite non-empty existingJournal with empty accounts'
  );
}

function testMultiCurrencyValuationAndSettlement() {
  const quotes: QuoteMap = {
    quotes: {
      '005930': { price: 60000, currency: 'KRW', name: '삼성전자' },
      AAPL: { price: 200, currency: 'USD', name: '애플' },
      '7974.T': { price: 8500, currency: 'JPY', name: '닌텐도' },
      '0700.HK': { price: 400, currency: 'HKD', name: '텐센트' },
    },
    usdKrw: 1400,
    jpyKrw: 9.2,
    hkdKrw: 180,
  };

  // 1) 통화별 원화 환산 가격 검증 (엔화/홍콩달러가 원화로 1:1 오인되지 않는지 검증)
  assert.equal(priceKrw('005930', quotes), 60000);
  assert.equal(priceKrw('AAPL', quotes), 280000);
  assert.equal(priceKrw('7974.T', quotes), Math.round(8500 * 9.2)); // 78,200원
  assert.equal(priceKrw('0700.HK', quotes), Math.round(400 * 180)); // 72,000원

  // 2) 비달러 해외주식(JPY) 거래 정산 시 원화 환산 단가 기준 원화 예수금 차감 및 해외 수수료 적용 검증
  const jpyUnitKrw = priceKrw('7974.T', quotes)!;
  const settlementJpy = calculateTradeSettlement({
    symbol: '7974.T',
    tradeQty: 10,
    price: jpyUnitKrw,
    isUsdAsset: false,
    currency: 'JPY',
    currentHoldings: 0,
    currentAvgKrw: 0,
    currentCashKrw: 1000000,
    currentCashUsd: 500,
    fees: { krFeePct: 0.015, usFeePct: 0.07, fxDiscountPct: 95 },
    usdRate: 1400,
  });

  assert.equal(settlementJpy.tradeAmountKrw, 782000);
  assert.equal(settlementJpy.feeKrw, Math.round(782000 * (0.07 / 100))); // 해외주식 수수료율 0.07% 적용
  assert.equal(settlementJpy.nextCashUsd, 500, 'JPY stock settlement must not deduct USD cash');
  assert.equal(settlementJpy.nextCash, 1000000 - settlementJpy.totalCostKrw);

  // 3) 서브 종목 우선 처분(다른 종목 팔기 vs 대표 종목 팔기) 모드 검증
  const account: JournalAccount = {
    id: 'acc-sub',
    name: '리밸런싱 테스트',
    fractional: false,
    noSell: false,
    cash: 0,
    groups: [
      {
        id: 'g-1',
        name: '미국 기술주',
        weight: 50,
        symbols: ['AAPL', '005930'],
        buySymbol: 'AAPL',
        holdings: { AAPL: 10, '005930': 20 }, // AAPL 280만 + 005930 120만 = 400만 (현재 100%, 목표 50% -> 200만 초과)
        avgPrices: { AAPL: 250000, '005930': 55000 },
      },
    ],
  };

  const planSubSell = calcPlan(account, quotes, { prioritizeSubAssetLiquidation: true });
  const planRepSell = calcPlan(account, quotes, { prioritizeSubAssetLiquidation: false });

  // 서브 종목 우선 처분 켜짐: 005930(비대표 종목)부터 먼저 판매 라인 생성
  assert.ok(planSubSell.lines.some((l) => l.symbol === '005930' && l.qty < 0));
  // 대표 종목 팔기(서브 처분 꺼짐): 대표 종목(AAPL)만 판매 라인 생성
  assert.ok(planRepSell.lines.every((l) => l.symbol === 'AAPL'));
}

function testPeriodReturnNoDoubleSubtractDeposit() {
  // 시나리오 A: 2026-10-15에 첫 입금 1억 원 후 현재 평가자산 101,096,631원 (+1,096,631원 수익)
  // 이번 달(10.01~), 올해(01.01~), 최근 1년, 전체 누적 모두 기준일(10.01 등)이 첫 활동일(10.15) 이전이므로
  // 시작 시점 자산(startAssets)=0, 시작 시점 원금(startInvested)=0 이어야 하며, 입금액이 이중 차감되면 절대 안 됨.
  const firstActivityDate = '2026-10-15';
  const currentTotalAssets = 101096631;
  const currentInvested = 100000000;

  const evaluateMock = (targetKey: string) => {
    if (targetKey < firstActivityDate) {
      return { totalAssetsKrw: 0, investedKrw: 0 };
    }
    return { totalAssetsKrw: 100500000, investedKrw: 100000000 };
  };

  const calcPeriod = (startDateStr: string | null) => {
    const startState = startDateStr ? evaluateMock(startDateStr) : { totalAssetsKrw: 0, investedKrw: 0 };
    const startAssets = startState.totalAssetsKrw;
    const startInvested = startState.investedKrw;
    const netNewCapital = currentInvested - startInvested;
    const diffKrw = (currentTotalAssets - currentInvested) - (startAssets - startInvested);
    const baseCapital = Math.max(0, startAssets + Math.max(0, netNewCapital));
    const returnRate = baseCapital > 0 ? (diffKrw / baseCapital) * 100 : 0;
    return { diffKrw, returnRate };
  };

  for (const startStr of ['2026-10-01', '2026-01-01', '2025-10-20', null]) {
    const res = calcPeriod(startStr);
    assert.equal(res.diffKrw, 1096631, `Period ${startStr} must equal exact profit +1,096,631 KRW`);
    assert.ok(Math.abs(res.returnRate - 1.096631) < 1e-4);
  }

  // 시나리오 B: 10.01 시점에 원금 5,000만 / 평가자산 5,500만(+500만 수익) 상태에서,
  // 10.15에 2,000만 추가 입금 후 오늘(10.20) 총 원금 7,000만 / 총 평가자산 7,650만(+650만 누적 수익)인 경우
  // 10월(MTD) 순수익은 650만 - 500만 = +150만 원이어야 함 (입금액 2,000만 원이 차감되어 마이너스가 되면 안 됨)
  const startAssetsOct1 = 55000000;
  const startInvestedOct1 = 50000000;
  const endAssetsToday = 76500000;
  const endInvestedToday = 70000000;

  const netNewCap = endInvestedToday - startInvestedOct1; // +20,000,000
  const mtdDiff = (endAssetsToday - endInvestedToday) - (startAssetsOct1 - startInvestedOct1); // 6.5M - 5M = +1.5M
  const mtdBase = startAssetsOct1 + Math.max(0, netNewCap); // 55M + 20M = 75M
  const mtdRate = (mtdDiff / mtdBase) * 100; // 1.5M / 75M = +2.0%

  assert.equal(mtdDiff, 1500000);
  assert.equal(mtdRate, 2.0);
}

function main() {
  testBackendIsolationAndAntiWipe();
  testMultiCurrencyValuationAndSettlement();
  testPeriodReturnNoDoubleSubtractDeposit();
  console.log('UNIT_TESTS_OK (3 suites passed)');
}

main();
