import { PersonalityProfile, PERSONALITY_PROFILES, calculateSurveyResult } from '@/data/investmentSurvey';
import { UserAccount } from '@/context/AuthContext';

export interface PersonalityScores {
  GS: { G: number; S: number };
  AP: { A: number; P: number };
  LT: { L: number; T: number };
  RI: { R: number; I: number };
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

/**
 * 40문항 답변 객체로부터 4개 축 백분율(0~100) 및 4글자 성향 코드 계산
 */
export function calculateScoresFromAnswers(answers: Record<number | string, number>): {
  typeCode: string;
  scores: PersonalityScores;
} {
  const normalizedAnswers: Record<number, number> = {};
  for (let i = 1; i <= 40; i++) {
    normalizedAnswers[i] = Number(answers[i] || answers[String(i)] || 3);
  }
  const result = calculateSurveyResult(normalizedAnswers);
  return {
    typeCode: result.typeCode,
    scores: result.scores,
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
export interface PresetOptions {
  balanced: {
    name: string;
    portfolio: SelectedAsset[];
    strategyPeriod: number;
    description: string;
  };
  growth: {
    name: string;
    portfolio: SelectedAsset[];
    strategyPeriod: number;
    description: string;
  };
  defensive: {
    name: string;
    portfolio: SelectedAsset[];
    strategyPeriod: number;
    description: string;
  };
}

export interface ScoreBreakdown {
  totalScore: number; // 0 ~ 100
  grade: 'S' | 'A' | 'B' | 'C';
  gradeLabel: string;
  summaryFeedback: string;
  scores: {
    returnScore: number; // Max 35
    riskScore: number; // Max 35
    downsideScore: number; // Max 15
    styleScore: number; // Max 15 (성향 실행 지속성)
  };
  metrics: {
    cagr: number;
    mdd: number;
    sortino: number;
    calmar: number;
    benchmarkCAGR: number;
    benchmarkMDD: number;
    benchmarkSortino: number;
    benchmarkCalmar: number;
  };
}

/**
 * 성향 4축 기반 3대 프리셋 (맞춤 균형, 맞춤 공격, 맞춤 방어) 생성
 */
export function getPersonality3Presets(
  typeCode: string | null | undefined,
  scores?: PersonalityScores
): PresetOptions {
  const activeScores = scores || (typeCode ? createDefaultScoresForCode(typeCode) : DEFAULT_UNBIASED_SCORES);
  const pctG = activeScores.GS.G;
  const pctS = activeScores.GS.S;
  const pctA = activeScores.AP.A;
  const pctP = activeScores.AP.P;
  const pctL = activeScores.LT.L;
  const pctT = activeScores.LT.T;
  const pctR = activeScores.RI.R;

  const round5 = (val: number) => Math.min(100, Math.max(0, Math.round(val / 5) * 5));

  // =========================================================================
  // 1. [맞춤 균형 (Balanced)] - 16개 성향 고유의 대표 정체성 맞춤형 포트폴리오
  // =========================================================================
  let balancedPortfolio: SelectedAsset[] = [];
  let balancedPeriod = 0;

  switch (typeCode) {
    // --- G-Active (Eagle, Lion, Cheetah, Racehorse) ---
    case 'GALR': // 독수리 (데이터 분석가): 퀀트 빅테크 분산 (QQQ + SPY + SOXX)
      balancedPeriod = 0;
      balancedPortfolio = [
        { assetId: 'QQQ', weight: 40, enableDefense: false },
        { assetId: 'SPY', weight: 30, enableDefense: false },
        { assetId: 'SOXX', weight: 30, enableDefense: false },
      ];
      break;

    case 'GALI': // 사자 (뚝심의 승부사): 나스닥 2배(QLD) + 반도체(SOXX) + S&P500
      balancedPeriod = 0;
      balancedPortfolio = [
        { assetId: 'QLD', weight: 25, enableDefense: false },
        { assetId: 'SOXX', weight: 35, enableDefense: false },
        { assetId: 'SPY', weight: 40, enableDefense: false },
      ];
      break;

    case 'GATR': // 치타 (추세 공략가): 반도체(SOXX) + 나스닥 레버리지(QLD) + 200일선 방어
      balancedPeriod = 200;
      balancedPortfolio = [
        { assetId: 'SOXX', weight: 40, enableDefense: true },
        { assetId: 'QLD', weight: 35, enableDefense: true },
        { assetId: 'SPY', weight: 25, enableDefense: true },
      ];
      break;

    case 'GATI': // 경주마 (트렌드 세터): 크립토(BTC) + 모멘텀 반도체(SOXX) + 나스닥(QQQ) + 200일선 방어
      balancedPeriod = 200;
      balancedPortfolio = [
        { assetId: 'BTC', weight: 15, enableDefense: true },
        { assetId: 'SOXX', weight: 35, enableDefense: true },
        { assetId: 'QQQ', weight: 50, enableDefense: true },
      ];
      break;

    // --- G-Passive (Bull, Elephant, Dolphin, Shark) ---
    case 'GPLR': // 황소 (원칙 설계자): QLD 레버리지 적립식 + 코어 S&P500 + 안전자산 금
      balancedPeriod = 0;
      balancedPortfolio = [
        { assetId: 'QLD', weight: 25, enableDefense: false },
        { assetId: 'SPY', weight: 45, enableDefense: false },
        { assetId: 'GLD', weight: 30, enableDefense: false },
      ];
      break;

    case 'GPLI': // 코끼리 (미래 개척자): 나스닥(QQQ) + S&P500 + 반도체(SOXX) 무스트레스 미래 성장 적립
      balancedPeriod = 0;
      balancedPortfolio = [
        { assetId: 'QQQ', weight: 50, enableDefense: false },
        { assetId: 'SPY', weight: 30, enableDefense: false },
        { assetId: 'SOXX', weight: 20, enableDefense: false },
      ];
      break;

    case 'GPTR': // 돌고래 (신호 포착가): 나스닥 + S&P500 + 안전자산(금 GLD)
      balancedPeriod = 0;
      balancedPortfolio = [
        { assetId: 'QQQ', weight: 45, enableDefense: false },
        { assetId: 'SPY', weight: 35, enableDefense: false },
        { assetId: 'GLD', weight: 20, enableDefense: false },
      ];
      break;

    case 'GPTI': // 상어 (유연한 탐색가): 나스닥 + 반도체 + 배당성장(SCHD)
      balancedPeriod = 0;
      balancedPortfolio = [
        { assetId: 'QQQ', weight: 40, enableDefense: false },
        { assetId: 'SOXX', weight: 30, enableDefense: false },
        { assetId: 'SCHD', weight: 30, enableDefense: false },
      ];
      break;

    // --- S-Active (Bear, Mountain Goat, Squirrel, Fox) ---
    case 'SALR': // 곰 (원금 수호자): 올웨더 4분할 (SPY + SCHD + 금 + 미국채)
      balancedPeriod = 0;
      balancedPortfolio = [
        { assetId: 'SPY', weight: 30, enableDefense: false },
        { assetId: 'SCHD', weight: 30, enableDefense: false },
        { assetId: 'GLD', weight: 20, enableDefense: false },
        { assetId: 'TLT', weight: 20, enableDefense: false },
      ];
      break;

    case 'SALI': // 산양 (신중한 검증가): 고배당 귀족(SCHD) + S&P 500 + 금 + 중기채
      balancedPeriod = 0;
      balancedPortfolio = [
        { assetId: 'SCHD', weight: 40, enableDefense: false },
        { assetId: 'SPY', weight: 30, enableDefense: false },
        { assetId: 'GLD', weight: 20, enableDefense: false },
        { assetId: 'IEF', weight: 10, enableDefense: false },
      ];
      break;

    case 'SATR': // 다람쥐 (위험 경보관): 대표지수(SPY) + 단기채(SHY) + 금(GLD) + 200일선 방어
      balancedPeriod = 200;
      balancedPortfolio = [
        { assetId: 'SPY', weight: 50, enableDefense: true },
        { assetId: 'SHY', weight: 30, enableDefense: false },
        { assetId: 'GLD', weight: 20, enableDefense: false },
      ];
      break;

    case 'SATI': // 여우 (위기 감지자): 배당(SCHD) + S&P500 + 금 + 200일선 방어
      balancedPeriod = 200;
      balancedPortfolio = [
        { assetId: 'SCHD', weight: 45, enableDefense: true },
        { assetId: 'SPY', weight: 35, enableDefense: true },
        { assetId: 'GLD', weight: 20, enableDefense: false },
      ];
      break;

    // --- S-Passive (Turtle, Panda, Hedgehog, Beaver) ---
    case 'SPLR': // 거북이 (꾸준한 적립가): 60/40 자산배분 (SPY + SCHD + 미국채 + 금)
      balancedPeriod = 0;
      balancedPortfolio = [
        { assetId: 'SPY', weight: 40, enableDefense: false },
        { assetId: 'SCHD', weight: 30, enableDefense: false },
        { assetId: 'TLT', weight: 15, enableDefense: false },
        { assetId: 'GLD', weight: 15, enableDefense: false },
      ];
      break;

    case 'SPLI': // 판다 (평화로운 투자자): 마음 편한 배당/지수 + 금(GLD) 완충 적립
      balancedPeriod = 0;
      balancedPortfolio = [
        { assetId: 'SPY', weight: 40, enableDefense: false },
        { assetId: 'SCHD', weight: 35, enableDefense: false },
        { assetId: 'GLD', weight: 25, enableDefense: false },
      ];
      break;

    case 'SPTR': // 고슴도치 (자산 조율사): S&P 500 + 중기채(IEF) + 금(GLD)
      balancedPeriod = 0;
      balancedPortfolio = [
        { assetId: 'SPY', weight: 45, enableDefense: false },
        { assetId: 'IEF', weight: 30, enableDefense: false },
        { assetId: 'GLD', weight: 25, enableDefense: false },
      ];
      break;

    case 'SPTI': // 비버 (안전지대 지킴이): SCHD + SPY + 단기채(SHY) 무스트레스 적립
      balancedPeriod = 0;
      balancedPortfolio = [
        { assetId: 'SCHD', weight: 40, enableDefense: false },
        { assetId: 'SPY', weight: 30, enableDefense: false },
        { assetId: 'SHY', weight: 30, enableDefense: false },
      ];
      break;

    default: // 기본 미진단: SPY 50% + QQQ 30% + SCHD 20%
      balancedPeriod = 0;
      balancedPortfolio = [
        { assetId: 'SPY', weight: 50, enableDefense: false },
        { assetId: 'QQQ', weight: 30, enableDefense: false },
        { assetId: 'SCHD', weight: 20, enableDefense: false },
      ];
      break;
  }

  // =========================================================================
  // 2. [맞춤 공격 (Growth / Alpha)] - 순수 ETF 35/35점 만점 보장 최적 알파 전략
  // =========================================================================
  let growthPortfolio: SelectedAsset[] = [];
  let growthPeriod = 0;

  if (pctP >= 50) {
    // 패시브 공격: 나스닥(QQQ 50%) + 반도체(SOXX 30%) + S&P500(SPY 20%) 단순 고성장 적립
    growthPortfolio = [
      { assetId: 'QQQ', weight: 50, enableDefense: false },
      { assetId: 'SOXX', weight: 30, enableDefense: false },
      { assetId: 'SPY', weight: 20, enableDefense: false },
    ];
    growthPeriod = 0;
  } else {
    // 액티브 공격: 나스닥 2배(QLD 35%) + 반도체(SOXX 35%) + 비트코인(BTC 15%) + S&P500 15% + 200일선 방어
    growthPortfolio = [
      { assetId: 'QLD', weight: 35, enableDefense: true },
      { assetId: 'SOXX', weight: 35, enableDefense: true },
      { assetId: 'BTC', weight: 15, enableDefense: true },
      { assetId: 'SPY', weight: 15, enableDefense: true },
    ];
    growthPeriod = 200;
  }

  // =========================================================================
  // 3. [맞춤 방어 (Defensive / All-Weather)] - 낙폭 방어력 35/35점 만점 보장 철벽 방어
  // =========================================================================
  let defensivePortfolio: SelectedAsset[] = [];
  let defensivePeriod = 0;

  if (pctP >= 50) {
    // 패시브 방어: S&P 500(SPY 40%) + 배당(SCHD 30%) + 금(GLD 15%) + 중기채(IEF 15%) 정석 올웨더 자산배분
    defensivePortfolio = [
      { assetId: 'SPY', weight: 40, enableDefense: false },
      { assetId: 'SCHD', weight: 30, enableDefense: false },
      { assetId: 'GLD', weight: 15, enableDefense: false },
      { assetId: 'IEF', weight: 15, enableDefense: false },
    ];
    defensivePeriod = 0;
  } else {
    // 액티브 방어: S&P 500(SPY 40%) + 배당성장(SCHD 30%) + 금(GLD 20%) + 미국채(TLT 10%) + 200일선 방어
    defensivePortfolio = [
      { assetId: 'SPY', weight: 40, enableDefense: true },
      { assetId: 'SCHD', weight: 30, enableDefense: true },
      { assetId: 'GLD', weight: 20, enableDefense: false },
      { assetId: 'TLT', weight: 10, enableDefense: false },
    ];
    defensivePeriod = 200;
  }

  return {
    balanced: {
      name: '맞춤 균형',
      portfolio: balancedPortfolio,
      strategyPeriod: balancedPeriod,
      description: '회원님의 성향 특성을 반영하여 가장 높은 지속성과 성과 균형을 갖춘 포트폴리오',
    },
    growth: {
      name: '맞춤 공격',
      portfolio: growthPortfolio,
      strategyPeriod: growthPeriod,
      description: '200일선 이동평균선 방어를 결합해 하방 리스크를 제어하며 고수익을 추구하는 전략',
    },
    defensive: {
      name: '맞춤 방어',
      portfolio: defensivePortfolio,
      strategyPeriod: defensivePeriod,
      description: '시장 하락장에서도 원금을 철저히 방어하고 배당과 안전 자산으로 지켜내는 전략',
    },
  };
}

/**
 * 2. 성향 코드(typeCode)와 4축 세부 점수(scores), 조회 기간(durationYears)을 받아 맞춤 포트폴리오 및 현실적 목표치 반환
 */
export function calculatePersonalitySimulatorConfig(
  typeCode: string | null | undefined,
  scores?: PersonalityScores,
  durationYears: number = 15
): RecommendationResult {
  const activeScores = scores || (typeCode ? createDefaultScoresForCode(typeCode) : DEFAULT_UNBIASED_SCORES);
  const is30 = durationYears === 30;

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
      recommendedTargetCAGR: is30 ? 7 : 10,
      recommendedMaxMDD: is30 ? 45 : 28,
      portfolioA: [
        { assetId: 'SPY', weight: 50, enableDefense: false },
        { assetId: 'QQQ', weight: 30, enableDefense: false },
        { assetId: 'SCHD', weight: 20, enableDefense: false },
      ],
      strategyPeriodA: 0,
      portfolioB: [
        { assetId: 'SPY', weight: 60, enableDefense: false },
        { assetId: 'TLT', weight: 40, enableDefense: false },
      ],
      strategyPeriodB: 0,
    };
  }

  const profile = PERSONALITY_PROFILES[typeCode];
  const isG = typeCode.includes('G');
  const isA = typeCode.includes('A');
  const isL = typeCode.includes('L');
  const isR = typeCode.includes('R');

  // 성향별 특성에 완벽히 부합하는 정수 앵커링 목표치 (15년 호황기 vs 30년 위기 포함 시장에 비례 연동)
  let recommendedTargetCAGR = is30 ? 7 : 10;
  let recommendedMaxMDD = is30 ? 45 : 30;

  if (isG) {
    if (typeCode === 'GALI' || typeCode === 'GATI') {
      recommendedTargetCAGR = is30 ? 12 : 16;
      recommendedMaxMDD = is30 ? 60 : 45;
    } else if (typeCode === 'GPLI' || typeCode === 'GATR' || typeCode === 'GALR') {
      recommendedTargetCAGR = is30 ? 9 : 13;
      recommendedMaxMDD = is30 ? 55 : 38;
    } else {
      recommendedTargetCAGR = is30 ? 8 : 11;
      recommendedMaxMDD = is30 ? 50 : 35;
    }
  } else {
    // S-안전형 성향 (채권/금/배당 자산배분 중심)
    if (typeCode === 'SATR' || typeCode === 'SATI') {
      // 200일선 방어선 가동 성향
      recommendedTargetCAGR = is30 ? 5 : 7;
      recommendedMaxMDD = is30 ? 16 : 12;
    } else if (typeCode === 'SPTR') {
      recommendedTargetCAGR = is30 ? 5 : 7;
      recommendedMaxMDD = is30 ? 25 : 20;
    } else if (typeCode === 'SPTI') {
      recommendedTargetCAGR = is30 ? 5 : 7;
      recommendedMaxMDD = is30 ? 35 : 22;
    } else {
      recommendedTargetCAGR = is30 ? 6 : 8;
      recommendedMaxMDD = is30 ? 36 : 26;
    }
  }

  const presets = getPersonality3Presets(typeCode, activeScores);

  return {
    typeCode,
    profile,
    scores: activeScores,
    recommendedTargetCAGR,
    recommendedMaxMDD,
    portfolioA: presets.balanced.portfolio,
    strategyPeriodA: presets.balanced.strategyPeriod,
    portfolioB: [
      { assetId: 'SPY', weight: 60, enableDefense: false },
      { assetId: 'QQQ', weight: 40, enableDefense: false },
    ],
    strategyPeriodB: 0,
  };
}

/**
 * 3. S&P 500 상대평가 퀀트 포트폴리오 점수 계산기 (100점 만점)
 */
export function calculateBenchmarkPortfolioScore(options: {
  portCAGR: number;
  portMDD: number;
  portSortino: number;
  portCalmar: number;
  portfolio: SelectedAsset[];
  strategyPeriod: number;
  benchmarkCAGR: number; // 동일 기간 SPY CAGR
  benchmarkMDD: number;  // 동일 기간 SPY MDD
  benchmarkSortino: number;
  benchmarkCalmar: number;
  targetCAGR: number;
  maxTolerableMDD: number;
  scores: PersonalityScores;
}): ScoreBreakdown {
  const {
    portCAGR,
    portMDD,
    portSortino,
    portCalmar,
    portfolio,
    strategyPeriod,
    benchmarkCAGR,
    benchmarkMDD,
    benchmarkSortino,
    benchmarkCalmar,
    targetCAGR,
    maxTolerableMDD,
    scores,
  } = options;

  const pctG = scores.GS.G;
  const pctS = scores.GS.S;
  const pctA = scores.AP.A;
  const pctP = scores.AP.P;
  const pctL = scores.LT.L;
  const pctT = scores.LT.T;
  const pctR = scores.RI.R;

  // -------------------------------------------------------------
  // 1. [35점 만점] 시장 대비 수익 달성도 (Return Utility Score)
  // -------------------------------------------------------------
  // 퀀트 효용: 목표 CAGR 달성도(기본 24점) + 시장(SPY) 대비 유의미한 초과 알파(Alpha, 최대 11점)
  const effectiveTargetCAGR = Math.max(6, targetCAGR);
  const targetAchieveRatio = portCAGR / effectiveTargetCAGR;
  const excessReturn = portCAGR - benchmarkCAGR;
  
  let returnScore = 0;
  if (targetAchieveRatio >= 1.0) {
    // 목표 달성 시 기본 24점 확보
    // 시장(S&P 500) 대비 초과 수익률(알파) 1%당 1.5점 가산 (최대 +11점, 만점 35점)
    const alphaBonus = excessReturn > 0 ? Math.min(11, excessReturn * 1.5) : 0;
    returnScore = 24 + alphaBonus;
  } else {
    // 목표 미달성 시 달성 비율에 따라 엄밀하게 감점 (0 ~ 24점)
    // 달성률 80% 미만 시 급격한 효용 감소 반영
    const utilityPower = targetAchieveRatio < 0.8 ? 1.2 : 1.0;
    returnScore = Math.max(0, 24 * Math.pow(Math.max(0, targetAchieveRatio), utilityPower));
  }
  returnScore = Math.min(35, Math.max(0, Number(returnScore.toFixed(1))));

  // -------------------------------------------------------------
  // 2. [35점 만점] 시장 대비 낙폭 방어력 (Risk Utility & Loss Aversion Score)
  // -------------------------------------------------------------
  const effectiveTolerableMDD = Math.max(10, maxTolerableMDD);
  let riskScore = 0;

  if (portMDD <= effectiveTolerableMDD) {
    // 1) 감내 범위 내 완전 방어 성공 시 (28 ~ 35점 구간)
    // 감내 한도보다 더 안전하게 방어할수록 최대 35점 만점
    const safetyBuffer = (effectiveTolerableMDD - portMDD) / effectiveTolerableMDD;
    riskScore = 28 + safetyBuffer * 7;
  } else {
    // 2) 감내 한도 초과 시 행동경제학 전망 이론(Loss Aversion 2.25x) 기반 엄격한 페널티
    // 초과 비율에 따라 0점까지 엄밀하게 감점
    const overRatio = (portMDD - effectiveTolerableMDD) / effectiveTolerableMDD;
    // 성장형 G 유저는 감내 기준 초과에 대해 약간의 유연성(0.8x)을 부여하고, 안정형 S 유저는 엄격(1.3x) 적용
    const riskAversionFactor = (pctS / 100) * 0.5 + (1.0 - (pctG / 100) * 0.3);
    const penalty = overRatio * 28 * riskAversionFactor;
    riskScore = Math.max(0, 28 - penalty);
  }

  // 시장(SPY) 대비 유의미한 낙폭 방어 보너스 (시장 MDD보다 15% 이상 안전할 때 +2점, 최대 35점)
  if (benchmarkMDD > 0 && (benchmarkMDD - portMDD) / benchmarkMDD >= 0.15) {
    riskScore = Math.min(35, riskScore + 2);
  }
  riskScore = Math.min(35, Math.max(0, Number(riskScore.toFixed(1))));

  // -------------------------------------------------------------
  // 3. [15점 만점] 하방 효율성 & 회복 탄력도 (Sortino / Calmar Benchmark Score)
  // -------------------------------------------------------------
  // 시장(S&P 500) 대비 하방 변동성 대비 효율(Sortino) 및 낙폭 회복 탄력성(Calmar)을 1:1 상대평가
  const safeBenchSortino = Math.max(0.3, benchmarkSortino);
  const safeBenchCalmar = Math.max(0.1, benchmarkCalmar);

  const sortinoRatio = Math.max(0, portSortino / safeBenchSortino);
  const calmarRatio = Math.max(0, portCalmar / safeBenchCalmar);

  // 성향별 가중치 (장기투자 L 성향은 소르티노 중시, 추세/단기 T 성향은 회복속도 칼마 중시)
  const sortinoWeight = (pctL / 100) * 0.4 + 0.3; // 0.3 ~ 0.7
  const calmarWeight = 1.0 - sortinoWeight;

  const relativeEfficiency = sortinoRatio * sortinoWeight + calmarRatio * calmarWeight;
  // 시장과 동일한 효율일 때 10점(기준), 시장보다 50% 이상 우수하면 15점 만점, 시장 미달 시 0점까지 비례 감점
  const downsideScore = Math.min(15, Math.max(0, Number((relativeEfficiency * 10).toFixed(1))));

  // -------------------------------------------------------------
  // 4. [15점 만점] 성향 실행 지속성 (Style & Consistency Fit)
  // -------------------------------------------------------------
  // 포트폴리오의 구조적 특성 분석 (A, B, C 모든 전략에 100% 동일한 규칙 적용)
  const activeAssets = portfolio.filter((p) => p.weight > 0);
  const assetCount = activeAssets.length;
  const isAllCoreIndex = assetCount > 0 && activeAssets.every((a) => ['SPY', 'QQQ', 'SOXX', 'SCHD', 'VOO', 'SPLG', 'VTI', 'GLD', 'TLT', 'IEF', 'SHY'].includes(a.assetId));
  const hasLeverageOrCrypto = activeAssets.some((a) => ['QLD', 'TQQQ', 'BTC', 'ETH', 'NVDA', 'TSLA'].includes(a.assetId));
  // 실질 방어선 작동 여부: 이동평균선 일수가 1일 이상 설정되어 있고, 방어선 적용 체크가 1개 이상 켜져 있는지
  const hasActiveDefenseLine = strategyPeriod > 0 && activeAssets.some((a) => a.enableDefense !== false);
  const hasUncorrelatedAssets = activeAssets.some((a) => ['GLD', 'TLT', 'IEF', 'SHY', 'BIL'].includes(a.assetId));

  let styleScore = 0;

  // 비로그인 / 성향 미진단 시 (중립 50/50 상태)
  if (pctP === 50 && pctA === 50 && pctG === 50 && pctS === 50) {
    if (isAllCoreIndex && !hasActiveDefenseLine) {
      styleScore = assetCount <= 3 ? 15 : 14;
    } else if (hasUncorrelatedAssets || hasActiveDefenseLine) {
      styleScore = 13;
    } else if (hasLeverageOrCrypto && !hasActiveDefenseLine) {
      styleScore = 8; // 고변동 자산 방어선 부재
    } else {
      styleScore = 12;
    }
  } else if (pctP > 50 || pctL > 50) {
    // [패시브(P) / 장기형(L) 유저]: 
    // - 방어선 없는 1~4개 정석 지수/자산배분 ➔ 지속성 15점 만점! (스트레스 없는 최고 지속성)
    // - 방어선(200일선)을 켰을 때 ➔ 잦은 매매와 이동평균선 모니터링 피로로 인해 5~6점으로 대폭 감점(꽝 처리)
    if (!hasActiveDefenseLine) {
      if (isAllCoreIndex && assetCount <= 4) {
        styleScore = 15; // 무스트레스 장기 지속 만점
      } else if (hasLeverageOrCrypto) {
        styleScore = 12; // 레버리지 무방어 장기 지속
      } else {
        styleScore = 14;
      }
    } else {
      // 패시브/장기 유저에게 이동평균선 잦은 매매는 최악의 피로 요인
      styleScore = 5;
    }
  } else {
    // [액티브(A) / 추세(T) 유저]: 
    // - 200일선 방어선이나 안전장치를 갖췄을 때 ➔ 지속성 15점 만점
    // - 고변동 자산(QLD, BTC 등)을 들고 방어선이 없을 때 ➔ 지속성 감점
    if (hasActiveDefenseLine) {
      styleScore = 15; // 멘탈 방어 무결성 만점
    } else if (hasUncorrelatedAssets) {
      styleScore = 13;
    } else if (isAllCoreIndex && !hasActiveDefenseLine) {
      styleScore = 10;
    } else {
      styleScore = 7; // 고변동 무방어 위험
    }
  }
  styleScore = Math.min(15, Math.max(0, Number(styleScore.toFixed(1))));

  // -------------------------------------------------------------
  // 총점 및 동적 맞춤 피드백 산출 (원인별 정밀 조언)
  // -------------------------------------------------------------
  const totalScore = Math.min(100, Math.max(0, Math.round(returnScore + riskScore + downsideScore + styleScore)));

  let grade: 'S' | 'A' | 'B' | 'C' = 'B';
  let gradeLabel = '보통';
  let summaryFeedback = '';

  if (totalScore >= 88) {
    grade = 'S';
    gradeLabel = '최적 (Perfect Fit)';
    summaryFeedback = '🌟 회원님의 목표와 성향에 완벽히 부합하며, 수익성과 방어력이 최상급으로 균형 잡힌 최적의 전략입니다!';
  } else if (totalScore >= 75) {
    grade = 'A';
    gradeLabel = '우수 (Great)';
    if (riskScore < 25) {
      summaryFeedback = '✨ 전반적으로 우수하나 손실폭이 다소 큽니다. 방어 옵션을 켜거나 채권/금 자산을 추가해 보세요.';
    } else if (returnScore < 25) {
      summaryFeedback = '✨ 매우 안전하고 견고한 전략입니다. 목표 연수익률을 높이고 싶다면 공격적인 자산의 비중을 5~10% 늘려보세요.';
    } else {
      summaryFeedback = '✨ 시장 수익과 안정성을 고르게 확보한 훌륭한 전략입니다. 약간의 비중 조절로 S등급에 도달할 수 있습니다.';
    }
  } else if (totalScore >= 60) {
    grade = 'B';
    gradeLabel = '양호 (Moderate)';
    if (riskScore < 20) {
      summaryFeedback = '⚠️ 감내 기준 대비 최대 낙폭이 큽니다. 방어 옵션을 켜거나 채권/금 자산을 추가해 보세요.';
    } else if (returnScore < 20) {
      summaryFeedback = '⚠️ 안정성은 높으나 목표 연수익률 대비 성장성이 부족합니다. 공격적인 자산의 비중을 확대해 보세요.';
    } else if (styleScore < 10) {
      summaryFeedback = (pctP > 50 || pctL > 50)
        ? '⚠️ 내 투자 스타일 대비 관리가 번거롭습니다. 단순한 핵심 지수 위주로 종목을 줄여보세요.'
        : '⚠️ 내 투자 스타일 대비 대응 장치가 부족합니다. 방어 옵션을 켜거나 전략을 더 세분화해 보세요.';
    } else {
      summaryFeedback = '⚠️ 전반적인 효율이 보통 수준입니다. 비중을 조정하여 수익과 방어의 균형을 맞춰보세요.';
    }
  } else {
    grade = 'C';
    gradeLabel = '주의 (Mismatch)';
    if (riskScore < 15 && returnScore < 20) {
      summaryFeedback = '🚨 수익성과 방어력이 모두 불안정합니다. 기본 추천 포트폴리오를 기반으로 자산 배분을 다시 구성해 보세요.';
    } else if (riskScore < 15) {
      summaryFeedback = '🚨 감내 가능한 위험 범위를 크게 초과하는 고위험 구조입니다. 방어 옵션을 켜거나 현금/채권 비중을 늘리세요.';
    } else {
      summaryFeedback = '🚨 기대 수익과 포트폴리오 성과 간 괴리가 큽니다. 목표 연수익률을 현실화하거나 성장주 비중을 보강하세요.';
    }
  }

  return {
    totalScore,
    grade,
    gradeLabel,
    summaryFeedback,
    scores: {
      returnScore,
      riskScore,
      downsideScore,
      styleScore,
    },
    metrics: {
      cagr: portCAGR,
      mdd: portMDD,
      sortino: portSortino,
      calmar: portCalmar,
      benchmarkCAGR,
      benchmarkMDD,
      benchmarkSortino,
      benchmarkCalmar,
    },
  };
}


