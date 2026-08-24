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
 * 1. 로그인 유저 / URL 쿼리 / 로컬 저장소로부터 성향 코드 및 4축 세부 점수를 추출
 */
export function getUserPersonalityInfo(options: {
  user?: UserAccount | null;
  searchParams?: { get: (k: string) => string | null } | null;
}): {
  typeCode: string | null;
  scores: PersonalityScores;
} {
  const { user, searchParams } = options;

  // 1순위: URL Query Parameter
  if (searchParams) {
    const queryType = searchParams.get('type')?.toUpperCase().trim();
    if (queryType && PERSONALITY_PROFILES[queryType]) {
      const parseScore = (param: string | null, fallback: number) => {
        if (!param) return fallback;
        const num = Number(param);
        return isNaN(num) ? fallback : Math.min(100, Math.max(0, num));
      };
      const defaultScores = createDefaultScoresForCode(queryType);
      const g = parseScore(searchParams.get('g'), defaultScores.GS.G);
      const a = parseScore(searchParams.get('a'), defaultScores.AP.A);
      const l = parseScore(searchParams.get('l'), defaultScores.LT.L);
      const r = parseScore(searchParams.get('r'), defaultScores.RI.R);
      return {
        typeCode: queryType,
        scores: {
          GS: { G: g, S: 100 - g },
          AP: { A: a, P: 100 - a },
          LT: { L: l, T: 100 - l },
          RI: { R: r, I: 100 - r },
        },
      };
    }
  }

  // 2순위: 로그인 유저 계정 데이터 (40문항 답변 또는 성향 코드)
  if (user) {
    if (user.typeAnswers && typeof user.typeAnswers === 'object' && Object.keys(user.typeAnswers).length === 40) {
      const calc = calculateScoresFromAnswers(user.typeAnswers);
      return {
        typeCode: calc.typeCode,
        scores: calc.scores,
      };
    }
    const userType = user.investmentType?.toUpperCase().trim();
    if (userType && PERSONALITY_PROFILES[userType]) {
      return {
        typeCode: userType,
        scores: createDefaultScoresForCode(userType),
      };
    }
  }

  // 3순위: 비로그인 브라우저 로컬 저장소
  if (typeof window !== 'undefined') {
    try {
      const savedAnswers = localStorage.getItem('jusik_type_answers');
      if (savedAnswers) {
        const parsed = JSON.parse(savedAnswers);
        if (parsed && typeof parsed === 'object' && Object.keys(parsed).length === 40) {
          const calc = calculateScoresFromAnswers(parsed);
          return {
            typeCode: calc.typeCode,
            scores: calc.scores,
          };
        }
      }

      const localCode = localStorage.getItem('jusik_type_code')?.toUpperCase().trim();
      if (localCode && PERSONALITY_PROFILES[localCode]) {
        return {
          typeCode: localCode,
          scores: createDefaultScoresForCode(localCode),
        };
      }

      const savedUserJson = localStorage.getItem('jusik_app_user_account');
      if (savedUserJson) {
        const u = JSON.parse(savedUserJson);
        if (u?.typeAnswers && typeof u.typeAnswers === 'object' && Object.keys(u.typeAnswers).length === 40) {
          const calc = calculateScoresFromAnswers(u.typeAnswers);
          return {
            typeCode: calc.typeCode,
            scores: calc.scores,
          };
        }
        const accountType = u?.investmentType?.toUpperCase().trim();
        if (accountType && PERSONALITY_PROFILES[accountType]) {
          return {
            typeCode: accountType,
            scores: createDefaultScoresForCode(accountType),
          };
        }
      }
    } catch (e) {}
  }

  // 4순위: 미진단 기본 상태
  return {
    typeCode: null,
    scores: DEFAULT_UNBIASED_SCORES,
  };
}

/**
 * 2. 성향 코드(typeCode)와 4축 세부 점수(scores)를 받아 1점 단위로 미세 조절된 맞춤 포트폴리오를 반환
 */
export function calculatePersonalitySimulatorConfig(
  typeCode: string | null | undefined,
  scores?: PersonalityScores
): RecommendationResult {
  const activeScores = scores || (typeCode ? createDefaultScoresForCode(typeCode) : DEFAULT_UNBIASED_SCORES);

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
      scores: activeScores,
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
  const pctG = activeScores.GS.G;
  const pctS = activeScores.GS.S;
  const pctA = activeScores.AP.A;
  const pctP = activeScores.AP.P;
  const pctL = activeScores.LT.L;
  const pctT = activeScores.LT.T;
  const pctR = activeScores.RI.R;
  const pctI = 100 - pctR;

  // =========================================================================
  // STEP 1: 방어선 (이동평균선) 결정 - A 및 T 점수 기준
  // =========================================================================
  let strategyPeriodA = 0;
  if (pctA >= 70 || pctT >= 70) {
    if (pctT >= 70 && pctA >= 70) {
      strategyPeriodA = 100; // 100일선
    } else if (pctR >= 50) {
      strategyPeriodA = 100; // 100일선
    } else {
      strategyPeriodA = 200; // 200일선
    }
  } else {
    strategyPeriodA = 0; // Buy & Hold DCA
  }

  const isDefenseActive = strategyPeriodA > 0;
  const isHighRiskAsset = (id: string) => ['QLD', 'TQQQ', 'SOXX', 'SOXL', 'SSO', 'UPRO', 'BTC', 'ETH', 'SPY'].includes(id);

  // =========================================================================
  // STEP 2: 점수 비율(0~100)에 따른 자산 배분 미세 조절 (Dynamic Fine-Tuning)
  // =========================================================================
  const round5 = (val: number) => Math.min(100, Math.max(0, Math.round(val / 5) * 5));
  let rawPortfolio: { assetId: string; weight: number }[] = [];

  if (pctP >= 50) {
    // 수동 / 패시브형
    if (pctG >= 70) {
      const qldW = round5(50 + ((pctG - 70) / 30) * 30); // 50% ~ 80% 미세 조절
      rawPortfolio = [
        { assetId: 'QLD', weight: qldW },
        { assetId: 'SCHD', weight: 100 - qldW },
      ];
    } else if (pctG >= 50) {
      rawPortfolio = [
        { assetId: 'QQQ', weight: 60 },
        { assetId: 'SPY', weight: 40 },
      ];
    } else if (pctS >= 60) {
      const schdW = round5(50 + ((pctS - 60) / 40) * 30); // 50% ~ 80% 미세 조절
      rawPortfolio = [
        { assetId: 'SCHD', weight: schdW },
        { assetId: 'SPY', weight: 100 - schdW },
      ];
    } else {
      rawPortfolio = [
        { assetId: 'SPY', weight: 50 },
        { assetId: 'QQQ', weight: 30 },
        { assetId: 'SCHD', weight: 20 },
      ];
    }
  } else {
    // 능동 / 액티브형
    if (pctG >= 75) {
      rawPortfolio = [
        { assetId: 'QLD', weight: 50 },
        { assetId: 'SOXX', weight: 30 },
        { assetId: 'BTC', weight: 10 },
        { assetId: 'SCHD', weight: 10 },
      ];
    } else if (pctG >= 55) {
      rawPortfolio = [
        { assetId: 'QQQ', weight: 50 },
        { assetId: 'SOXX', weight: 20 },
        { assetId: 'BTC', weight: 10 },
        { assetId: 'SCHD', weight: 10 },
        { assetId: 'GLD', weight: 10 },
      ];
    } else if (pctS >= 60) {
      rawPortfolio = [
        { assetId: 'SPY', weight: 40 },
        { assetId: 'SCHD', weight: 30 },
        { assetId: 'SHY', weight: 20 },
        { assetId: 'GLD', weight: 10 },
      ];
    } else {
      rawPortfolio = [
        { assetId: 'QQQ', weight: 40 },
        { assetId: 'SPY', weight: 35 },
        { assetId: 'SCHD', weight: 25 },
      ];
    }
  }

  const portfolioA: SelectedAsset[] = rawPortfolio.map((item) => ({
    ...item,
    enableDefense: isDefenseActive && isHighRiskAsset(item.assetId),
  }));

  // =========================================================================
  // STEP 3: 4축 가중치 기반 목표 CAGR & MDD 정밀 수식 계산
  // =========================================================================
  const targetCAGRFloat = 6.0 + (pctG / 100.0) * 9.0 + (pctA / 100.0) * 1.5 + (pctT / 100.0) * 1.0 + (pctI / 100.0) * 0.5;
  const recommendedTargetCAGR = Math.round(Math.max(5, Math.min(25, targetCAGRFloat)));

  const targetMDDFloat = 12.0 + (pctG / 100.0) * 45.0 - (pctT / 100.0) * 6.0 - (pctR / 100.0) * 4.0 - (pctP / 100.0) * 3.0;
  const recommendedMaxMDD = Math.round(Math.max(10, Math.min(65, targetMDDFloat)));

  return {
    typeCode,
    profile,
    scores: activeScores,
    recommendedTargetCAGR,
    recommendedMaxMDD,
    portfolioA,
    strategyPeriodA,
    portfolioB: [
      { assetId: 'SPY', weight: 60, enableDefense: false },
      { assetId: 'QQQ', weight: 40, enableDefense: false },
    ],
    strategyPeriodB: 0,
  };
}

