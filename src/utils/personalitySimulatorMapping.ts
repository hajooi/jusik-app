import { PersonalityProfile, PERSONALITY_PROFILES } from '@/data/investmentSurvey';
import backtestDataRaw from '@/data/backtestData.json';
import { UserAccount } from '@/context/AuthContext';

export interface PersonalityScores {
  GS: { G: number; S: number };
  AP: { A: number; P: number };
  LT: { L: number; T: number };
  RI: { R: number; I: number };
}

export interface ResolvedPersonality {
  typeCode: string | null;
  scores: PersonalityScores;
  isCustomized: boolean;
  source: 'query' | 'user_answers' | 'user_type' | 'local_answers' | 'local_type' | 'default';
}

export interface SelectedAsset {
  assetId: string;
  weight: number;
  enableDefense?: boolean;
}

export interface RecommendationResult {
  typeCode: string;
  profile: PersonalityProfile;
  scores: PersonalityScores;
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
 * 40문항 답변 객체로부터 4개 축 백분율(0~100) 및 4글자 성향 코드 계산
 */
export function calculateScoresFromAnswers(answers: Record<number | string, number>): {
  typeCode: string;
  scores: PersonalityScores;
} {
  let g = 0, a = 0, l = 0, r = 0;
  for (let i = 1; i <= 10; i++) g += Number(answers[i] || answers[String(i)] || 3);
  for (let i = 11; i <= 20; i++) a += Number(answers[i] || answers[String(i)] || 3);
  for (let i = 21; i <= 30; i++) l += Number(answers[i] || answers[String(i)] || 3);
  for (let i = 31; i <= 40; i++) r += Number(answers[i] || answers[String(i)] || 3);

  const pctG = Math.round((g - 10) * 2.5);
  const pctA = Math.round((a - 10) * 2.5);
  const pctL = Math.round((l - 10) * 2.5);
  const pctR = Math.round((r - 10) * 2.5);

  const typeCode = `${pctG >= 50 ? 'G' : 'S'}${pctA >= 50 ? 'A' : 'P'}${pctL >= 50 ? 'L' : 'T'}${pctR >= 50 ? 'R' : 'I'}`;

  return {
    typeCode,
    scores: {
      GS: { G: pctG, S: 100 - pctG },
      AP: { A: pctA, P: 100 - pctA },
      LT: { L: pctL, T: 100 - pctL },
      RI: { R: pctR, I: 100 - pctR },
    },
  };
}

/**
 * 4글자 성향 코드로부터 대표 기본 점수 생성
 */
export function createDefaultScoresForCode(typeCode: string): PersonalityScores {
  const isG = typeCode.includes('G');
  const isA = typeCode.includes('A');
  const isL = typeCode.includes('L');
  const isR = typeCode.includes('R');
  return {
    GS: { G: isG ? 65 : 35, S: isG ? 35 : 65 },
    AP: { A: isA ? 65 : 35, P: isA ? 35 : 65 },
    LT: { L: isL ? 65 : 35, T: isL ? 35 : 65 },
    RI: { R: isR ? 65 : 35, I: isR ? 35 : 65 },
  };
}

export const DEFAULT_UNBIASED_SCORES: PersonalityScores = {
  GS: { G: 50, S: 50 },
  AP: { A: 50, P: 50 },
  LT: { L: 50, T: 50 },
  RI: { R: 50, I: 50 },
};

/**
 * 1. 로그인 유저 / URL 쿼리 / 로컬 저장소로부터 유효한 성향 코드(4글자)를 간결하게 반환
 */
export function getUserPersonalityCode(options: {
  user?: UserAccount | null;
  searchParamType?: string | null;
}): string | null {
  const query = options.searchParamType?.toUpperCase().trim();
  if (query && PERSONALITY_PROFILES[query]) {
    return query;
  }
  const userType = options.user?.investmentType?.toUpperCase().trim();
  if (userType && PERSONALITY_PROFILES[userType]) {
    return userType;
  }
  if (typeof window !== 'undefined') {
    const local = localStorage.getItem('jusik_type_code')?.toUpperCase().trim();
    if (local && PERSONALITY_PROFILES[local]) {
      return local;
    }
    const savedUserJson = localStorage.getItem('jusik_app_user_account');
    if (savedUserJson) {
      try {
        const u = JSON.parse(savedUserJson);
        const accountType = u?.investmentType?.toUpperCase().trim();
        if (accountType && PERSONALITY_PROFILES[accountType]) {
          return accountType;
        }
      } catch (e) {}
    }
  }
  return null;
}

/**
 * 2. 성향 코드(typeCode)를 받아 해당 성향의 맞춤 포트폴리오 및 목표 가이드라인을 반환
 */
export function calculatePersonalitySimulatorConfig(
  typeCode: string | null | undefined
): RecommendationResult {
  // 성향 미진단 기본 상태
  if (!typeCode || !PERSONALITY_PROFILES[typeCode]) {
    return {
      typeCode: '',
      profile: {
        code: 'DEFAULT',
        name: '대표 균형 자산 배분',
        tagline: '시장 대표 지수를 기반으로 안정적인 복리 성장을 추구합니다.',
        description: 'S&P 500과 나스닥 100을 균형 있게 분산하여 장기 복리 수익을 극대화하는 표준 전략입니다.',
        recommendedStrategy: '미국 시장 대표 지수(SPY, QQQ) 정기 적립식 분산 투자',
        suitableAssets: ['SPY', 'QQQ'],
        badges: ['글로벌 우량주', '분산 투자', '적립식 복리'],
        strengths: ['검증된 장기 우상향 성과', '단순하고 지속 가능한 투자'],
        weaknesses: ['단기 시장 조정 시 심리적 인내 필요'],
        guidelines: {
          recommendation: '투자 성향 진단을 완료하시면 나만의 4축 맞춤형 포트폴리오가 제공됩니다.',
          warning: '단기 시세에 흔들리지 않고 꾸준히 적립해 나가는 규율이 중요합니다.'
        }
      },
      scores: DEFAULT_UNBIASED_SCORES,
      recommendedTargetCAGR: 15,
      recommendedMaxMDD: 20,
      portfolioA: [
        { assetId: 'SPY', weight: 50, enableDefense: true },
        { assetId: 'QQQ', weight: 50, enableDefense: true },
      ],
      strategyPeriodA: 0,
      portfolioB: [
        { assetId: 'SPY', weight: 60, enableDefense: false },
        { assetId: 'QQQ', weight: 40, enableDefense: false },
      ],
      strategyPeriodB: 0,
    };
  }

  const profile = PERSONALITY_PROFILES[typeCode];
  const isG = typeCode.includes('G');
  const isA = typeCode.includes('A');
  const isL = typeCode.includes('L');
  const isR = typeCode.includes('R');
  const isT = typeCode.includes('T');
  const isP = typeCode.includes('P');
  const isS = typeCode.includes('S');

  const scores = createDefaultScoresForCode(typeCode);

  // 방어 전략 주기 (Active / Tactical 성향)
  let strategyPeriodA = 0;
  if (isA && isT) {
    strategyPeriodA = 100; // 단기/중기 기동 방어
  } else if (isA) {
    strategyPeriodA = 200; // 200일선 장기 추세 방어
  }

  // 16가지 성향별 대표 포트폴리오 조합
  let rawPortfolio: SelectedAsset[] = [];

  if (isP) {
    // 수동/패시브형 성향
    if (isG) {
      rawPortfolio = [
        { assetId: 'QQQ', weight: 60, enableDefense: strategyPeriodA > 0 },
        { assetId: 'SPY', weight: 40, enableDefense: strategyPeriodA > 0 },
      ];
    } else {
      rawPortfolio = [
        { assetId: 'SPY', weight: 50, enableDefense: strategyPeriodA > 0 },
        { assetId: 'SCHD', weight: 30, enableDefense: strategyPeriodA > 0 },
        { assetId: 'QQQ', weight: 20, enableDefense: strategyPeriodA > 0 },
      ];
    }
  } else {
    // 능동/액티브형 성향 (GATR, GATI, GAHR, GAHI 등)
    if (isG) {
      rawPortfolio = [
        { assetId: 'QQQ', weight: 50, enableDefense: strategyPeriodA > 0 },
        { assetId: 'SOXX', weight: 20, enableDefense: strategyPeriodA > 0 },
        { assetId: 'BTC', weight: 10, enableDefense: false },
        { assetId: 'SCHD', weight: 10, enableDefense: false },
        { assetId: 'GLD', weight: 10, enableDefense: false },
      ];
    } else {
      rawPortfolio = [
        { assetId: 'SPY', weight: 40, enableDefense: strategyPeriodA > 0 },
        { assetId: 'SCHD', weight: 30, enableDefense: false },
        { assetId: 'SHY', weight: 20, enableDefense: false },
        { assetId: 'GLD', weight: 10, enableDefense: false },
      ];
    }
  }

  // 목표 연수익률(CAGR) & 감내 손실(MDD)
  const targetCAGR = isG ? (isA ? 22 : 18) : (isA ? 14 : 10);
  const maxMDD = isG ? (isA ? 25 : 20) : (isA ? 15 : 12);

  return {
    typeCode,
    profile,
    scores,
    recommendedTargetCAGR: targetCAGR,
    recommendedMaxMDD: maxMDD,
    portfolioA: rawPortfolio,
    strategyPeriodA,
    portfolioB: [
      { assetId: 'SPY', weight: 60, enableDefense: false },
      { assetId: 'QQQ', weight: 40, enableDefense: false },
    ],
    strategyPeriodB: 0,
  };
}

