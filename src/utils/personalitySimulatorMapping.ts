import { PersonalityProfile, PERSONALITY_PROFILES } from '@/data/investmentSurvey';

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
  recommendedTargetCAGR: number; // e.g. 15 (%)
  recommendedMaxMDD: number; // e.g. 25 (%)
  portfolioA: SelectedAsset[];
  strategyPeriodA: number;
  portfolioB: SelectedAsset[];
  strategyPeriodB: number;
}

/**
 * Unified Quant Dynamic Recommendation Engine (Architectural Overhaul)
 * Calibrates portfolio allocation dynamically based on personality scores.
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
  const pctT = scores.LT.T;
  const pctR = scores.RI.R;

  // =========================================================================
  // STEP 1: Independent Goal Determination based on Personality Scores
  // =========================================================================
  
  // Target CAGR Range: 8% (Extreme Safety) ~ 25% (Extreme Growth)
  let recommendedTargetCAGR = 12;
  if (pctG >= 75) {
    recommendedTargetCAGR = Math.round(20 + ((pctG - 75) / 25) * 5); // 20% ~ 25%
  } else if (pctG >= 50) {
    recommendedTargetCAGR = Math.round(14 + ((pctG - 50) / 25) * 6); // 14% ~ 20%
  } else {
    recommendedTargetCAGR = Math.round(8 + (pctG / 50) * 6);        // 8% ~ 14%
  }

  // Max Tolerable MDD Range: 12% (Extreme Safety) ~ 60% (High Risk/Long-term Tolerance)
  let recommendedMaxMDD = 20;
  if (pctS >= 75) {
    recommendedMaxMDD = Math.round(12 + ((100 - pctS) / 25) * 4);    // 12% ~ 16%
  } else if (pctS >= 50) {
    recommendedMaxMDD = Math.round(16 + ((100 - pctS) / 25) * 8);    // 16% ~ 24%
  } else if (pctG >= 75) {
    const passiveLongBonus = Math.max(0, (pctP - 50) * 0.3);
    recommendedMaxMDD = Math.round(45 + ((pctG - 75) / 25) * 10 + passiveLongBonus); // 45% ~ 60%
  } else {
    recommendedMaxMDD = Math.round(24 + ((pctG - 50) / 25) * 21);   // 24% ~ 45%
  }

  // =========================================================================
  // STEP 2: Determine Strategy Defense Period based on Tactical (T) & Rule (R)
  // =========================================================================
  let strategyPeriodA = 0;
  if (pctR >= 55 || pctT >= 55) {
    if (pctT >= 70 && pctA >= 60) {
      strategyPeriodA = 100; // Fast 100-day MA
    } else {
      strategyPeriodA = 200; // Standard 200-day MA
    }
  }

  const isDefenseActive = strategyPeriodA > 0;
  // Helper: Standardized Risk Asset Identification (SPY, QQQ, Leverage, Crypto are all equity risk assets)
  const isRiskAsset = (id: string) => ['SPY', 'QQQ', 'QLD', 'TQQQ', 'SOXX', 'SOXL', 'SSO', 'UPRO', 'BTC'].includes(id);

  // =========================================================================
  // STEP 3: Calibrate Portfolio Allocation to fulfill Target Goals (5% step)
  // =========================================================================
  let rawPortfolio: SelectedAsset[] = [];
  const round5 = (val: number) => Math.min(100, Math.max(0, Math.round(val / 5) * 5));

  // TIER 1: PASSIVE (P >= 60%) - Simple Market-Proven Combinations
  if (pctP >= 60) {
    if (pctG >= 65) {
      // High Growth Passive: QLD (2x Leverage) + SCHD (Dividend Growth Buffer)
      // Proven 2-ETF combination: QLD for growth, SCHD for dividend cashflow/drawdown hedge.
      const qldW = round5(50 + ((pctG - 65) / 35) * 35); // 50% ~ 85%
      rawPortfolio = [
        { assetId: 'QLD', weight: qldW },
        { assetId: 'SCHD', weight: 100 - qldW },
      ];
    } else if (pctG >= 50) {
      // Moderate Growth Passive: QLD + SPY
      const qldW = round5(35 + ((pctG - 50) / 15) * 15); // 35% ~ 50%
      rawPortfolio = [
        { assetId: 'QLD', weight: qldW },
        { assetId: 'SPY', weight: 100 - qldW },
      ];
    } else if (pctS >= 65) {
      // Safety Dividend Passive: SCHD + SPY
      const schdW = round5(45 + ((pctS - 65) / 35) * 35);
      rawPortfolio = [
        { assetId: 'SCHD', weight: schdW },
        { assetId: 'SPY', weight: 100 - schdW },
      ];
    } else {
      // Balanced Passive: SPY 50% + SCHD 30% + QQQ 20%
      rawPortfolio = [
        { assetId: 'SPY', weight: 50 },
        { assetId: 'SCHD', weight: 30 },
        { assetId: 'QQQ', weight: 20 },
      ];
    }
  }
  // TIER 2: HYBRID (40% <= P < 60%) - Core-Satellite Dynamic Balance
  else if (pctA < 60) {
    if (pctG >= 55) {
      // Growth Hybrid: QLD + SCHD + SPY
      const qldW = round5(40 + ((pctG - 55) / 45) * 25); // 40% ~ 65%
      const schdW = 30;
      rawPortfolio = [
        { assetId: 'QLD', weight: qldW },
        { assetId: 'SCHD', weight: schdW },
        { assetId: 'SPY', weight: 100 - qldW - schdW },
      ];
    } else if (pctS >= 60) {
      const schdW = round5(40 + ((pctS - 60) / 40) * 20); // 40% ~ 60%
      rawPortfolio = [
        { assetId: 'SCHD', weight: schdW },
        { assetId: 'SPY', weight: 30 },
        { assetId: 'IEF', weight: 100 - schdW - 30 },
      ];
    } else {
      rawPortfolio = [
        { assetId: 'SPY', weight: 45 },
        { assetId: 'SCHD', weight: 35 },
        { assetId: 'QQQ', weight: 20 },
      ];
    }
  }

  // TIER 3: ACTIVE (A >= 60%) - Multi-Asset & Leverage/Crypto Hedging
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
    } else if (pctS >= 65) {
      // Active Defense All-Weather: SPY (200MA) + QQQ (200MA) + SCHD + GLD + IEF
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

  // GUARANTEED DEFENSE MAPPING
  const portfolioA: SelectedAsset[] = rawPortfolio.map((item) => ({
    ...item,
    enableDefense: isRiskAsset(item.assetId) ? isDefenseActive : false,
  }));

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
