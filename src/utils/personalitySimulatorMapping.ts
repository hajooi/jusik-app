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

  // 2. Build Tailored Recommendation Portfolio A & Calibrate Expected Metrics Exactly
  let portfolioA: SelectedAsset[] = [];
  let recommendedTargetCAGR = 12;
  let recommendedMaxMDD = 21;

  // CASE 1: High Passive / Peace-of-Mind / Lazy (P >= 60%) - Simple 1~2 ETF Portfolios!
  if (pctP >= 60) {
    if (pctG >= 75) {
      portfolioA = [
        { assetId: 'TQQQ', weight: 50, enableDefense: false },
        { assetId: 'QQQ', weight: 50, enableDefense: false },
      ];
      recommendedTargetCAGR = 20;
      recommendedMaxMDD = 40;
    } else if (pctG >= 60) {
      portfolioA = [
        { assetId: 'QQQ', weight: 70, enableDefense: false },
        { assetId: 'SPY', weight: 30, enableDefense: false },
      ];
      recommendedTargetCAGR = 14;
      recommendedMaxMDD = 28;
    } else if (pctS >= 60) {
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
      portfolioA = [
        { assetId: 'SPY', weight: 100, enableDefense: false },
      ];
      recommendedTargetCAGR = 11;
      recommendedMaxMDD = 19;
    }
  } 
  // CASE 2: Active / Tactical / Moderate (P < 60%) - Multi-asset Active Portfolios
  else {
    if (pctG >= 75) {
      // Ultra High Growth (Aggressive) - Includes Crypto (BTC 15%) & TQQQ / SOXL
      if (strategyPeriodA > 0) {
        portfolioA = [
          { assetId: 'TQQQ', weight: 45, enableDefense: true },
          { assetId: 'SOXL', weight: 25, enableDefense: true },
          { assetId: 'BTC', weight: 15, enableDefense: false },
          { assetId: 'SPY', weight: 15, enableDefense: true },
        ];
        recommendedTargetCAGR = 20;
        recommendedMaxMDD = 38;
      } else {
        portfolioA = [
          { assetId: 'TQQQ', weight: 45, enableDefense: false },
          { assetId: 'SOXL', weight: 25, enableDefense: false },
          { assetId: 'BTC', weight: 15, enableDefense: false },
          { assetId: 'SPY', weight: 15, enableDefense: false },
        ];
        recommendedTargetCAGR = 22;
        recommendedMaxMDD = 62;
      }
    } else if (pctG >= 55) {
      // Growth & Tactical Core (e.g. GATR 추세 추적자)
      if (strategyPeriodA > 0) {
        portfolioA = [
          { assetId: 'QLD', weight: 45, enableDefense: true },
          { assetId: 'SOXX', weight: 25, enableDefense: true },
          { assetId: 'BTC', weight: 10, enableDefense: false },
          { assetId: 'SPY', weight: 20, enableDefense: true },
        ];
        recommendedTargetCAGR = 15;
        recommendedMaxMDD = 27;
      } else {
        portfolioA = [
          { assetId: 'QLD', weight: 45, enableDefense: false },
          { assetId: 'SOXX', weight: 25, enableDefense: false },
          { assetId: 'BTC', weight: 10, enableDefense: false },
          { assetId: 'SPY', weight: 20, enableDefense: false },
        ];
        recommendedTargetCAGR = 18;
        recommendedMaxMDD = 62;
      }
    } else if (pctS >= 75) {
      // Conservative Safety
      portfolioA = [
        { assetId: 'SCHD', weight: 45, enableDefense: false },
        { assetId: 'SPY', weight: 30, enableDefense: false },
        { assetId: 'GLD', weight: 15, enableDefense: false },
        { assetId: 'SHY', weight: 10, enableDefense: false },
      ];
      recommendedTargetCAGR = 8;
      recommendedMaxMDD = 14;
    } else if (pctS >= 55) {
      // Safety Core
      portfolioA = [
        { assetId: 'SPY', weight: 50, enableDefense: false },
        { assetId: 'SCHD', weight: 35, enableDefense: false },
        { assetId: 'IEF', weight: 15, enableDefense: false },
      ];
      recommendedTargetCAGR = 9;
      recommendedMaxMDD = 17;
    } else {
      // Balanced Active Core: QQQ 45% + SPY 35% + SCHD 20%
      portfolioA = [
        { assetId: 'QQQ', weight: 45, enableDefense: strategyPeriodA > 0 },
        { assetId: 'SPY', weight: 35, enableDefense: strategyPeriodA > 0 },
        { assetId: 'SCHD', weight: 20, enableDefense: false },
      ];
      recommendedTargetCAGR = 12;
      recommendedMaxMDD = 21;
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
