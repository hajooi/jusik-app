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
 * Unified Quant Dynamic Recommendation Engine
 * Calibrates portfolio allocation & target goals dynamically based on 0~100 personality scores.
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

  // =========================================================================
  // STEP 1: Determine Defense Strategy Period (Moving Average Switching Days)
  // Defense options are GATED for TOP TIER active/tactical users (A >= 70 or T >= 70).
  // For most regular users, Buy & Hold DCA (0 days) is recommended as the superior approach.
  // Supported MA lines: 50, 100, 200 days (20-day line excluded).
  // =========================================================================
  let strategyPeriodA = 0;

  if (pctA >= 70 || pctT >= 70) {
    if (pctT >= 70) {
      strategyPeriodA = 50; // 50-day line for fast tactical response
    } else if (pctR >= 50) {
      strategyPeriodA = 100; // 100-day line for rule-based trend
    } else {
      strategyPeriodA = 200; // 200-day line for standard long-term trend
    }
  } else {
    strategyPeriodA = 0; // Pure Buy & Hold DCA
  }

  const isDefenseActive = strategyPeriodA > 0;

  // Helper: Only high-volatility risk assets receive moving average defense switching
  const isHighRiskAsset = (id: string) =>
    ['QLD', 'TQQQ', 'SOXX', 'SOXL', 'SSO', 'UPRO', 'BTC', 'ETH', 'SPY', 'QQQ'].includes(id);

  // =========================================================================
  // STEP 2: Calibrate Dynamic Portfolio Allocation based on score tiers
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
  // TIER 2: ACTIVE / HYBRID (A >= 50% or P < 50%) -> Multi-Asset & Leverage Allocations
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

  // Assign defense ONLY to high-volatility risk assets when defense is active for top tier
  const portfolioA: SelectedAsset[] = rawPortfolio.map((item) => ({
    ...item,
    enableDefense: isDefenseActive && isHighRiskAsset(item.assetId),
  }));

  // =========================================================================
  // STEP 3: Multi-Axis Target Goals (Whole Integer Format)
  // Target CAGR: 8% ~ 25% (G Score Driven)
  // Target Max MDD: 12% ~ 45% (G Score Driven, reduced by Active Top Tier Defense)
  // =========================================================================

  const targetCAGRFloat = 8 + (pctG / 100) * 17; // 8% to 25%
  const recommendedTargetCAGR = Math.round(targetCAGRFloat); // Clean integer

  const baseMDDFloat = 12 + (pctG / 100) * 33; // 12% to 45%
  const defenseDiscount = isDefenseActive ? (strategyPeriodA === 50 ? 8 : strategyPeriodA === 100 ? 6 : 5) : 0;
  const targetMDDFloat = Math.max(10, Math.min(45, baseMDDFloat - defenseDiscount));
  const recommendedMaxMDD = Math.round(targetMDDFloat); // Clean integer

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

