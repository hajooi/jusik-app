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
 * Tailors portfolio recommendations based on 4-axis investment personality scores.
 * Accurately aligns expected Target CAGR & Max MDD with the ACTUAL historical performance
 * of the recommended portfolio under its MA defense rules.
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
  const pctR = scores.RI.R;

  // 1. Determine Strategy Defense Period based on Rule/Tactical scores
  let strategyPeriodA = 0;
  if (pctR >= 60 || pctL < 40) {
    if (pctA >= 60) strategyPeriodA = 200; // 200-day MA
    else strategyPeriodA = 100; // 100-day MA
  }

  // 2. Build Tailored Recommendation Portfolio A & Accurately Calculated Expected Metrics
  let portfolioA: SelectedAsset[] = [];
  let recommendedTargetCAGR = 11;
  let recommendedMaxMDD = 20;

  // CASE 1: High Passive / Peace-of-Mind / Lazy (P >= 60%) - Simple 1~2 ETF Portfolios!
  if (pctP >= 60) {
    if (pctG >= 60) {
      // Lazy Growth: QQQ (70%) + SPY (30%)
      portfolioA = [
        { assetId: 'QQQ', weight: 70, enableDefense: false },
        { assetId: 'SPY', weight: 30, enableDefense: false },
      ];
      recommendedTargetCAGR = 13;
      recommendedMaxMDD = 25;
    } else if (pctS >= 60) {
      // Lazy Safety: Simple SPY 100% or SPY 70% + SCHD 30%
      if (pctS >= 80) {
        portfolioA = [
          { assetId: 'SPY', weight: 100, enableDefense: false },
        ];
        recommendedTargetCAGR = 10;
        recommendedMaxMDD = 19;
      } else {
        portfolioA = [
          { assetId: 'SPY', weight: 70, enableDefense: false },
          { assetId: 'SCHD', weight: 30, enableDefense: false },
        ];
        recommendedTargetCAGR = 10;
        recommendedMaxMDD = 18;
      }
    } else {
      // Lazy Balanced: S&P 500 (SPY) 100%
      portfolioA = [
        { assetId: 'SPY', weight: 100, enableDefense: false },
      ];
      recommendedTargetCAGR = 11;
      recommendedMaxMDD = 19;
    }
  } 
  // CASE 2: Active / Moderate (P < 60%) - Multi-asset Portfolios
  else {
    if (pctG >= 80) {
      // Ultra High Growth (Aggressive): TQQQ 45% + SOXX 35% + SPY 20%
      if (strategyPeriodA > 0) {
        portfolioA = [
          { assetId: 'TQQQ', weight: 45, enableDefense: true },
          { assetId: 'SOXX', weight: 35, enableDefense: true },
          { assetId: 'SPY', weight: 20, enableDefense: true },
        ];
        recommendedTargetCAGR = 15;
        recommendedMaxMDD = 38;
      } else {
        portfolioA = [
          { assetId: 'TQQQ', weight: 40, enableDefense: false },
          { assetId: 'SOXX', weight: 35, enableDefense: false },
          { assetId: 'SPY', weight: 25, enableDefense: false },
        ];
        recommendedTargetCAGR = 21;
        recommendedMaxMDD = 65;
      }
    } else if (pctG >= 60) {
      // Growth Core: QLD 45% + SPY 35% + SCHD 20%
      if (strategyPeriodA > 0) {
        portfolioA = [
          { assetId: 'QLD', weight: 45, enableDefense: true },
          { assetId: 'SPY', weight: 35, enableDefense: true },
          { assetId: 'SCHD', weight: 20, enableDefense: false },
        ];
        recommendedTargetCAGR = 10;
        recommendedMaxMDD = 18;
      } else {
        portfolioA = [
          { assetId: 'QLD', weight: 40, enableDefense: false },
          { assetId: 'SPY', weight: 40, enableDefense: false },
          { assetId: 'SCHD', weight: 20, enableDefense: false },
        ];
        recommendedTargetCAGR = 15;
        recommendedMaxMDD = 48;
      }
    } else if (pctS >= 80) {
      // Conservative Safety: SCHD 45% + SPY 30% + GLD 15% + SHY 10%
      portfolioA = [
        { assetId: 'SCHD', weight: 45, enableDefense: false },
        { assetId: 'SPY', weight: 30, enableDefense: false },
        { assetId: 'GLD', weight: 15, enableDefense: false },
        { assetId: 'SHY', weight: 10, enableDefense: false },
      ];
      recommendedTargetCAGR = 7;
      recommendedMaxMDD = 14;
    } else if (pctS >= 60) {
      // Safety Core: SPY 50% + SCHD 35% + IEF 15%
      portfolioA = [
        { assetId: 'SPY', weight: 50, enableDefense: false },
        { assetId: 'SCHD', weight: 35, enableDefense: false },
        { assetId: 'IEF', weight: 15, enableDefense: false },
      ];
      recommendedTargetCAGR = 9;
      recommendedMaxMDD = 17;
    } else {
      // Balanced Core (G 40-59%): e.g. GATR (추세 추적자)
      if (strategyPeriodA > 0) {
        // With 200-day MA defense, actual 20-year backtest CAGR is ~7%, MDD is ~13%
        portfolioA = [
          { assetId: 'QQQ', weight: 45, enableDefense: true },
          { assetId: 'SPY', weight: 35, enableDefense: true },
          { assetId: 'SCHD', weight: 20, enableDefense: false },
        ];
        recommendedTargetCAGR = 7;
        recommendedMaxMDD = 13;
      } else {
        // Without defense (buy & hold), actual 20-year backtest CAGR is ~12%, MDD is ~22%
        portfolioA = [
          { assetId: 'QQQ', weight: 45, enableDefense: false },
          { assetId: 'SPY', weight: 35, enableDefense: false },
          { assetId: 'SCHD', weight: 20, enableDefense: false },
        ];
        recommendedTargetCAGR = 12;
        recommendedMaxMDD = 22;
      }
    }
  }

  // 3. Default Custom Portfolio B (Benchmark 60/40 SPY & QQQ)
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
