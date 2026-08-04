import { PersonalityProfile, PERSONALITY_PROFILES } from '@/data/investmentSurvey';
import backtestDataRaw from '@/data/backtestData.json';

export interface SelectedAsset {
  assetId: string;
  weight: number;
  enableDefense?: boolean;
}

export interface RecommendationResult {
  typeCode: string;
  profile: PersonalityProfile;
  scores: {
    GS: { G: number; S: number };
    AP: { A: number; P: number };
    LT: { L: number; T: number };
    RI: { R: number; I: number };
  };
  recommendedTargetCAGR: number; // Target CAGR (%)
  recommendedMaxMDD: number;    // Target Max MDD (%)
  portfolioA: SelectedAsset[];
  strategyPeriodA: number;
  portfolioB: SelectedAsset[];
  strategyPeriodB: number;
}

interface BacktestAssetInfo {
  id: string;
  annualCAGR: number;
  annualVol: number;
  ma50Return?: number;
  ma100Return?: number;
  ma200Return?: number;
}

const assetMap: Record<string, BacktestAssetInfo> = {};
((backtestDataRaw as unknown) as { assets: BacktestAssetInfo[] }).assets.forEach((a) => {
  assetMap[a.id] = a;
});

/**
 * Unified Quant Dynamic Recommendation Engine (Architectural Overhaul)
 * Calibrates portfolio allocation dynamically based on exact 0~100 personality scores.
 */
export function calculatePersonalitySimulatorConfig(
  typeCode: string,
  scores: {
    GS: { G: number; S: number };
    AP: { A: number; P: number };
    LT: { L: number; T: number };
    RI: { R: number; I: number };
  }
): RecommendationResult {
  const profile = PERSONALITY_PROFILES[typeCode] || PERSONALITY_PROFILES['SPLI'];

  const pctG = scores.GS.G;
  const pctS = scores.GS.S;
  const pctA = scores.AP.A;
  const pctP = scores.AP.P;
  const pctL = scores.LT.L;
  const pctT = scores.LT.T;
  const pctR = scores.RI.R;
  const pctI = scores.RI.I;

  // =========================================================================
  // STEP 1: Determine Defense Strategy Period (이동평균선 스위칭 일수)
  // =========================================================================
  let strategyPeriodA = 0;

  // Passive & Long-term investors (P >= 50 & L >= 50) -> No defense (0 days, buy & hold)
  if (pctP >= 50 && pctL >= 50) {
    strategyPeriodA = 0;
  } else if (pctA >= 50 || pctT >= 50) {
    if (pctR >= 50) {
      // Rule-based: 100-day for fast tactical, 200-day for standard
      strategyPeriodA = pctT >= 70 ? 100 : 200;
    } else {
      // Intuitive: 20-day for fast short-term, 50-day for mid-term
      strategyPeriodA = pctT >= 70 ? 20 : 50;
    }
  }

  const isDefenseActive = strategyPeriodA > 0;

  // Risk asset helper: Only high-volatility growth assets get defense switch
  const isHighRiskAsset = (id: string) =>
    ['QLD', 'TQQQ', 'SOXX', 'SOXL', 'SSO', 'UPRO', 'BTC', 'ETH', 'SPY', 'QQQ'].includes(id);

  // =========================================================================
  // STEP 2: Calibrate Dynamic Portfolio Allocation based on exact scores
  // =========================================================================
  let rawPortfolio: { assetId: string; weight: number }[] = [];
  const round5 = (val: number) => Math.min(100, Math.max(0, Math.round(val / 5) * 5));

  // TIER 1: PASSIVE (P >= 50%) -> Simple 1~3 Representative ETF Combinations
  if (pctP >= 50) {
    if (pctG >= 65) {
      const qldW = round5(45 + ((pctG - 65) / 35) * 35); // 45% ~ 80%
      rawPortfolio = [
        { assetId: 'QLD', weight: qldW },
        { assetId: 'SCHD', weight: 100 - qldW },
      ];
    } else if (pctG >= 45) {
      const qldW = round5(30 + ((pctG - 45) / 20) * 20); // 30% ~ 50%
      rawPortfolio = [
        { assetId: 'QLD', weight: qldW },
        { assetId: 'SPY', weight: 100 - qldW },
      ];
    } else if (pctS >= 60) {
      const schdW = round5(50 + ((pctS - 60) / 40) * 30); // 50% ~ 80%
      rawPortfolio = [
        { assetId: 'SCHD', weight: schdW },
        { assetId: 'SPY', weight: 100 - schdW },
      ];
    } else {
      rawPortfolio = [
        { assetId: 'SPY', weight: 50 },
        { assetId: 'SCHD', weight: 30 },
        { assetId: 'QQQ', weight: 20 },
      ];
    }
  }
  // TIER 2: ACTIVE / HYBRID (A >= 50%) -> Dynamic Multi-Asset / Leverage Allocation
  else {
    if (pctG >= 75) {
      rawPortfolio = [
        { assetId: 'TQQQ', weight: 35 },
        { assetId: 'SOXL', weight: 25 },
        { assetId: 'BTC', weight: 10 },
        { assetId: 'SCHD', weight: 15 },
        { assetId: 'GLD', weight: 15 },
      ];
    } else if (pctG >= 55) {
      rawPortfolio = [
        { assetId: 'QLD', weight: 40 },
        { assetId: 'SOXX', weight: 20 },
        { assetId: 'BTC', weight: 10 },
        { assetId: 'SCHD', weight: 15 },
        { assetId: 'GLD', weight: 15 },
      ];
    } else if (pctS >= 60) {
      rawPortfolio = [
        { assetId: 'SPY', weight: 30 },
        { assetId: 'QQQ', weight: 20 },
        { assetId: 'SCHD', weight: 25 },
        { assetId: 'GLD', weight: 15 },
        { assetId: 'IEF', weight: 10 },
      ];
    } else {
      rawPortfolio = [
        { assetId: 'QQQ', weight: 35 },
        { assetId: 'SPY', weight: 30 },
        { assetId: 'SCHD', weight: 20 },
        { assetId: 'GLD', weight: 15 },
      ];
    }
  }

  // Assign defense ONLY to high-volatility risk assets when defense is active
  const portfolioA: SelectedAsset[] = rawPortfolio.map((item) => ({
    ...item,
    enableDefense: isDefenseActive && isHighRiskAsset(item.assetId),
  }));

  // =========================================================================
  // STEP 3: Multi-Axis Target Goal & Actual Backtest Metric Synchronization
  // =========================================================================

  // Calculate actual expected CAGR from backtest data
  let expectedCAGRSum = 0;
  let weightedVolSum = 0;

  portfolioA.forEach((item) => {
    const info = assetMap[item.assetId] || { annualCAGR: 0.1, annualVol: 0.15 };
    let assetCAGR = info.annualCAGR;

    if (item.enableDefense && isDefenseActive) {
      if (strategyPeriodA === 200 && info.ma200Return) assetCAGR = info.ma200Return;
      else if (strategyPeriodA === 100 && info.ma100Return) assetCAGR = info.ma100Return;
      else if (strategyPeriodA === 50 && info.ma50Return) assetCAGR = info.ma50Return;
      else if (strategyPeriodA === 20 && info.ma50Return) assetCAGR = info.ma50Return;
    }

    expectedCAGRSum += (item.weight / 100) * assetCAGR;

    // Defense reduces volatility & max drawdown of risk asset
    let assetVol = info.annualVol;
    if (item.enableDefense && isDefenseActive) {
      assetVol *= 0.55; // 200MA/Defense reduces drawdown by ~45%
    }
    weightedVolSum += (item.weight / 100) * assetVol;
  });

  const actualCAGRPercent = Math.round(expectedCAGRSum * 1000) / 10; // e.g. 15.2 (%)
  const actualMDDPercent = Math.min(65, Math.max(8, Math.round(weightedVolSum * 2.1 * 1000) / 10)); // e.g. 22.5 (%)

  // Multi-Axis Target Goals calculation calibrated for realistic DCA expectations
  // Target CAGR follows pctG score (8.0% ~ 16.0% DCA range)
  const scoreTargetCAGR = Math.round((8 + (pctG / 100) * 8) * 10) / 10;

  // Target Max MDD follows pctS & pctL scores (10.0% ~ 35.0% DCA range)
  const scoreMaxMDD = Math.round((10 + ((100 - pctS) / 100) * 25) * 10) / 10;

  const recommendedTargetCAGR = scoreTargetCAGR;
  const recommendedMaxMDD = scoreMaxMDD;

  // STEP 4: Default Benchmark Portfolio B
  const portfolioB: SelectedAsset[] = [
    { assetId: 'SPY', weight: 60, enableDefense: false },
    { assetId: 'QQQ', weight: 40, enableDefense: false },
  ];
  const strategyPeriodB = 0;

  return {
    typeCode,
    profile,
    scores,
    recommendedTargetCAGR,
    recommendedMaxMDD,
    portfolioA,
    strategyPeriodA,
    portfolioB,
    strategyPeriodB,
  };
}
