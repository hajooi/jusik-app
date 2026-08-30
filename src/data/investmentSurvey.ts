export interface Question {
  id: number;
  axis: 'GS' | 'AP' | 'LT' | 'RI'; // GS: Growth/Safety, AP: Active/Passive, LT: Long-term/Tactical, RI: Rule/Intuitive
  question: string;
  leftLabel: string;  // Score 1 direction (Safety, Passive, Tactical, Intuitive)
  rightLabel: string; // Score 5 direction (Growth, Active, Long-term, Rule)
}

export interface PersonalityProfile {
  code: string;
  name: string;
  animal?: string; // 상징 동물 (독수리, 사자 등)
  tagline: string;
  description: string;
  storyNarrative?: {
    overview: string; // 투자를 대하는 내면과 시선 (2배 확장된 깊은 줄글)
    marketCaution: string; // 시장이 흔들릴 때 마주하는 심리적 함정과 주의점 (쉬운 우리말)
  };
  recommendedPortfolioPreview?: {
    title: string;
    targetCAGR: string; // 30년/15년 통합 목표 연수익률 범위 (예: '9~13%')
    targetMDD: string;  // 30년/15년 통합 목표 하락폭 범위 (예: '-18~-38%')
    isDynamicTrend?: boolean; // 시장 흐름에 따른 동적 현금 전환형 여부
    allocation: { 
      name: string; 
      weight: number; 
      weightRange?: string; 
      color: string;
      enableDefense?: boolean;
    }[];
    defenseAllocation?: { name: string; weight: number; weightRange?: string; color: string }[]; // 하락 추세 시 방어 비중
    rationale: string;  // 쉬운 우리말로 설명한 추천 이유
  };
  recommendedStrategy: string;
  suitableAssets: string[];
  badges: string[];
  strengths?: string[];
  weaknesses?: string[];
  guidelines?: {
    recommendation: string;
    warning: string;
  };
}

// 40 Questions (10 per Axis) - 홀수(정방향: G, A, L, R) vs 짝수(역방향: S, P, T, I) 5:5 교차 배치
export const QUESTIONS: Question[] = [
  // --- 1. [목표 축] G (성장/수익형) vs S (안전/보존형) : 10문항 ---
  {
    id: 1,
    axis: 'GS',
    question: '보유 주식이 20% 급락했을 때, 공포감보다는 싸게 살 기회라는 생각이 먼저 든다.',
    leftLabel: '그렇다',
    rightLabel: '그렇지 않다',
  },
  {
    id: 2,
    axis: 'GS',
    question: '투자로 돈을 버는 것보다, 애써 모은 원금을 잃지 않고 지키는 것이 더 중요하다.',
    leftLabel: '그렇다',
    rightLabel: '그렇지 않다',
  },
  {
    id: 3,
    axis: 'GS',
    question: '원금 손실 위험이 크더라도, 시장 평균을 뛰어넘는 고수익을 노릴 수 있는 종목에 집중 투자하고 싶다.',
    leftLabel: '그렇다',
    rightLabel: '그렇지 않다',
  },
  {
    id: 4,
    axis: 'GS',
    question: '은행 이자보다 조금 높은 수준(연 5~8%)의 안정적인 수익이라면 만족한다.',
    leftLabel: '그렇다',
    rightLabel: '그렇지 않다',
  },
  {
    id: 5,
    axis: 'GS',
    question: '변동성이 크더라도, 세상을 바꿀 신기술이나 미래 고성장 기업에 투자하는 것이 매력적이다.',
    leftLabel: '그렇다',
    rightLabel: '그렇지 않다',
  },
  {
    id: 6,
    axis: 'GS',
    question: '투자 자산 중 30% 이상은 언제든 꺼낼 수 있는 현금이나 예금으로 두어야 마음이 놓인다.',
    leftLabel: '그렇다',
    rightLabel: '그렇지 않다',
  },
  {
    id: 7,
    axis: 'GS',
    question: '배당금이나 이자 같은 고정 수익보다는, 자산 가격의 상승으로 인한 폭발적인 시세 차익을 노린다.',
    leftLabel: '그렇다',
    rightLabel: '그렇지 않다',
  },
  {
    id: 8,
    axis: 'GS',
    question: '하루 5~10%씩 급등락하는 종목을 보유하면, 불안해서 일상생활이나 수면에 지장이 있다.',
    leftLabel: '그렇다',
    rightLabel: '그렇지 않다',
  },
  {
    id: 9,
    axis: 'GS',
    question: '시장 상승기에 수익률을 극대화하기 위해, 고위험 상품(성장주·레버리지 등)도 적극 투자할 수 있다.',
    leftLabel: '그렇다',
    rightLabel: '그렇지 않다',
  },
  {
    id: 10,
    axis: 'GS',
    question: '내 자산의 상당 부분은 금, 채권, 배당주, 예금처럼 변동성이 적고 안정적인 자산으로 채워져야 한다.',
    leftLabel: '그렇다',
    rightLabel: '그렇지 않다',
  },

  // --- 2. [실행 축] A (능동/직접분석형) vs P (수동/패시브형) : 10문항 ---
  {
    id: 11,
    axis: 'AP',
    question: '관심 기업의 실적 보고서나 재무제표를 직접 찾아서 분석해보는 과정이 즐겁다.',
    leftLabel: '그렇다',
    rightLabel: '그렇지 않다',
  },
  {
    id: 12,
    axis: 'AP',
    question: '종목을 일일이 고르는 데 시간을 쓰기보다, 시장 전체를 추종하는 지수형 상품을 선호한다.',
    leftLabel: '그렇다',
    rightLabel: '그렇지 않다',
  },
  {
    id: 13,
    axis: 'AP',
    question: '주식을 사고팔 때마다 투자 이유와 결과를 매매 일지에 기록하고, 정기적으로 복기한다.',
    leftLabel: '그렇다',
    rightLabel: '그렇지 않다',
  },
  {
    id: 14,
    axis: 'AP',
    question: '전문가가 구성해 둔 펀드나 투자 서비스에 운용을 맡기는 편이 마음 편하다.',
    leftLabel: '그렇다',
    rightLabel: '그렇지 않다',
  },
  {
    id: 15,
    axis: 'AP',
    question: '매일 시장 뉴스를 체크하고 주요 종목 시세를 파악하는 데 30분 이상의 시간을 기꺼이 쓴다.',
    leftLabel: '그렇다',
    rightLabel: '그렇지 않다',
  },
  {
    id: 16,
    axis: 'AP',
    question: '주식 투자가 내 본업이나 일상에 방해되지 않도록, 신경 쓰는 시간을 최소화하고 싶다.',
    leftLabel: '그렇다',
    rightLabel: '그렇지 않다',
  },
  {
    id: 17,
    axis: 'AP',
    question: '남들이 골라준 펀드나 추천에 맡기기보다, 내가 직접 종목을 고르고 자산을 굴리는 편이 낫다.',
    leftLabel: '그렇다',
    rightLabel: '그렇지 않다',
  },
  {
    id: 18,
    axis: 'AP',
    question: '매달 정해진 날짜에 기계적으로 주식을 모아가도록 세팅해 두는 방식을 선호한다.',
    leftLabel: '그렇다',
    rightLabel: '그렇지 않다',
  },
  {
    id: 19,
    axis: 'AP',
    question: '투자 전략을 세우고 시장을 공부하는 과정은, 내 본업이나 취미만큼 즐겁고 가치 있다.',
    leftLabel: '그렇다',
    rightLabel: '그렇지 않다',
  },
  {
    id: 20,
    axis: 'AP',
    question: '기업 실적 발표나 복잡한 경제 지표를 분석하는 일은 머리 아프고 피곤하게 느껴진다.',
    leftLabel: '그렇다',
    rightLabel: '그렇지 않다',
  },

  // --- 3. [시간 축] L (장기/복리형) vs T (전술/추세대응형) : 10문항 ---
  {
    id: 21,
    axis: 'LT',
    question: '단기 시세 변동에 일희일비하지 않고, 기업의 장기적 성장과 복리 효과를 누리기 위해 수년간 보유한다.',
    leftLabel: '그렇다',
    rightLabel: '그렇지 않다',
  },
  {
    id: 22,
    axis: 'LT',
    question: '시장 트렌드와 흐름에 맞춰, 유연하게 사고팔며 수익을 챙기는 편이 좋다.',
    leftLabel: '그렇다',
    rightLabel: '그렇지 않다',
  },
  {
    id: 23,
    axis: 'LT',
    question: '내가 산 주식이 단기간에 30% 급등했더라도, 기업 자체의 가치가 변하지 않았다면 팔지 않는다.',
    leftLabel: '그렇다',
    rightLabel: '그렇지 않다',
  },
  {
    id: 24,
    axis: 'LT',
    question: '보유한 주식이 목표 수익에 도달하면, 주저 없이 팔아서 수익을 확정 짓는 편이다.',
    leftLabel: '그렇다',
    rightLabel: '그렇지 않다',
  },
  {
    id: 25,
    axis: 'LT',
    question: '시장의 정확한 타이밍을 맞추는 것은 불가능하므로, 꾸준히 모아가며 시간을 내 편으로 만들어야 한다.',
    leftLabel: '그렇다',
    rightLabel: '그렇지 않다',
  },
  {
    id: 26,
    axis: 'LT',
    question: '차트 흐름이나 거래량 변화를 잘 분석하면, 유리한 매매 타이밍을 포착할 수 있다고 믿는다.',
    leftLabel: '그렇다',
    rightLabel: '그렇지 않다',
  },
  {
    id: 27,
    axis: 'LT',
    question: '분기별 실적 부진이나 단기 악재 뉴스로 시장이 흔들려도 장기 로드맵을 믿고 끝까지 버틴다.',
    leftLabel: '그렇다',
    rightLabel: '그렇지 않다',
  },
  {
    id: 28,
    axis: 'LT',
    question: '하락세가 보이거나 시장의 위험 신호가 느껴지면, 주식을 즉시 팔아 현금을 확보해야 한다.',
    leftLabel: '그렇다',
    rightLabel: '그렇지 않다',
  },
  {
    id: 29,
    axis: 'LT',
    question: '단기 유행을 타는 테마주보다, 10년 뒤에도 독점적 지위를 유지할 1등 기업에 자산을 묻어둔다.',
    leftLabel: '그렇다',
    rightLabel: '그렇지 않다',
  },
  {
    id: 30,
    axis: 'LT',
    question: '시장의 뜨거운 관심을 받으며 거래량이 급증하는 주도주나 테마주에 빠르게 올라타고 싶다.',
    leftLabel: '그렇다',
    rightLabel: '그렇지 않다',
  },

  // --- 4. [판단 축] R (원칙/데이터형) vs I (직관/트렌드형) : 10문항 ---
  {
    id: 31,
    axis: 'RI',
    question: '주식을 사기 전, 가격·비중 등의 조건을 구체적인 수치로 기록해 둔다.',
    leftLabel: '그렇다',
    rightLabel: '그렇지 않다',
  },
  {
    id: 32,
    axis: 'RI',
    question: '일상에서 내가 직접 써보고 만족한 제품이나, 피부로 느껴지는 유행에서 강한 투자 확신을 얻는다.',
    leftLabel: '그렇다',
    rightLabel: '그렇지 않다',
  },
  {
    id: 33,
    axis: 'RI',
    question: '매매 결정을 내릴 때 감정이나 기분을 철저히 배제하고, 사전에 설계된 수식과 원칙대로만 기계적으로 실행한다.',
    leftLabel: '그렇다',
    rightLabel: '그렇지 않다',
  },
  {
    id: 34,
    axis: 'RI',
    question: '시장이 크게 흔들릴 때는, 정해진 규칙보다 시장 참여자들의 심리와 전체적인 분위기 파악이 더 중요하다고 느낀다.',
    leftLabel: '그렇다',
    rightLabel: '그렇지 않다',
  },
  {
    id: 35,
    axis: 'RI',
    question: '과거 데이터나 계량화된 통계 수치로 검증되지 않은 투자 전략은 신뢰하지 않는다.',
    leftLabel: '그렇다',
    rightLabel: '그렇지 않다',
  },
  {
    id: 36,
    axis: 'RI',
    question: '유망해 보이는 기업이나 신기술 소식을 접하면, 일단 소액이라도 빠르게 사보는 편이다.',
    leftLabel: '그렇다',
    rightLabel: '그렇지 않다',
  },
  {
    id: 37,
    axis: 'RI',
    question: '기업을 평가할 때 감성적인 스토리나 전망보다, PER·PBR·매출액 등 숫자로 확인되는 정량 지표를 먼저 본다.',
    leftLabel: '그렇다',
    rightLabel: '그렇지 않다',
  },
  {
    id: 38,
    axis: 'RI',
    question: '재무제표의 과거 숫자보다, CEO의 비전이나 산업의 매력적인 스토리라인에 더 마음이 끌린다.',
    leftLabel: '그렇다',
    rightLabel: '그렇지 않다',
  },
  {
    id: 39,
    axis: 'RI',
    question: '투자에서 가장 피해야 할 것은, 원칙 없이 감정에 휩쓸려 즉흥적으로 매매하는 일이다.',
    leftLabel: '그렇다',
    rightLabel: '그렇지 않다',
  },
  {
    id: 40,
    axis: 'RI',
    question: '복잡한 수치 계산보다, 시장의 전체적인 흐름과 대중의 관심도 변화를 더 중요하게 본다.',
    leftLabel: '그렇다',
    rightLabel: '그렇지 않다',
  },
];

export const PERSONALITY_PROFILES: Record<string, PersonalityProfile> = {
  // G-Axis (Growth)
  GALR: {
    code: 'GALR',
    name: '데이터 분석가',
    animal: '독수리',
    tagline: '기업의 실적표와 수치 데이터로 원칙에 맞춰 투자하는 분석가',
    description: '뉴스나 소문 대신 기업의 재무제표와 숫자를 직접 검증하고, 스스로 정한 기준에 맞춰 주식을 사 모아가는 분석파입니다. 순간의 감정이나 시장의 열기에 휩쓸리지 않으며, 긴 호흡으로 자산을 키우는 것을 목표로 합니다.',
    storyNarrative: {
      overview: '당신은 구름 위 높은 하늘에서 전체 숲을 넓게 조망하다가, 확실한 목표가 포착되었을 때만 냉철하게 활강하는 독수리와 같습니다. 화려한 뉴스나 주변 사람들의 추천 소음보다는, 기업이 실제로 벌어들이는 영업이익과 탄탄한 재무제표의 숫자를 가장 신뢰합니다. 남들이 탐욕에 눈이 멀어 꼭대기에서 흥분하거나, 작은 악재에 공포에 질려 도망칠 때도 당신은 흔들리지 않습니다. 과거 수십 년간 축적된 통계 데이터와 스스로 세운 명확한 투자 원칙을 나침반 삼아 차분하고 우아하게 전진합니다. 당신에게 주식 투자란 단순한 요행이나 도박이 아니며, 철저한 검증과 통계적 인내가 만들어내는 위대한 복리의 예술입니다.',
      marketCaution: '하지만 모든 숫자가 완벽하게 맞아떨어질 때까지 지나치게 망설이다 보면, 좋은 기업을 저렴하게 살 수 있는 결정적인 기회를 놓치기 쉽습니다. 세상의 모든 산업 구조 변화가 숫자로 먼저 찍히지는 않기에, 때로는 시대를 이끄는 거대한 패러다임을 믿고 조금 더 유연하게 첫 발을 떼는 용기가 계좌를 더 크게 키워줄 것입니다.',
    },
    recommendedPortfolioPreview: {
      title: '데이터 기반 우량 성장 & 지수 조율 조합',
      targetCAGR: '9~13%',
      targetMDD: '38~55%',
      isDynamicTrend: false,
      allocation: [
        { name: '나스닥 100', weight: 40, color: '#F18F01' },
        { name: 'S&P 500', weight: 30, color: '#3B82F6' },
        { name: '필라델피아 반도체', weight: 30, color: '#8B5CF6' },
      ],
      rationale: '데이터 분석가의 성향에 맞춰 평소에는 미국 대표 500대 기업과 나스닥 혁신주를 모아가며 수익을 극대화하고, 시장의 분위기가 꺾이고 하락 위험이 커지면 주식을 줄여 현금으로 자산을 방어하도록 설계했습니다.',
    },
    recommendedStrategy: '빅테크 모멘텀 백테스팅, 듀얼 모멘텀 전략, 조건식 자동매매',
    suitableAssets: ['QQQ', 'TQQQ', '고성장 개별주', '퀀트 포트폴리오'],
    badges: ['수익형 🚀', '능동형 ⚡', '장기형 ⏳', '원칙형 📐'],
    strengths: [
      '감정에 휘둘리지 않고 객관적인 숫자를 바탕으로 판단함',
      '기업 실적 데이터를 파헤쳐 진짜 가치를 파악하는 능력',
      '스스로 세운 투자 규칙을 어떤 상황에서도 지켜냄',
    ],
    weaknesses: [
      '지나치게 완벽한 수치만 찾다가 상승 초입의 기회를 놓칠 수 있음',
      '숫자에 담기지 않는 트렌드 변화나 시장 심리에 둔감함',
      '분석할 데이터 양이 너무 많아 쉽게 피로감을 느낄 수 있음',
    ],
    guidelines: {
      recommendation: '분석한 데이터를 믿고 스스로 세운 기준대로 차분하게 투자 이어나가기',
      warning: '데이터에 갇혀 완벽만을 추구하다가 정작 시작할 기회를 놓치지 말 것',
    },
  },
  GALI: {
    code: 'GALI',
    name: '뚝심의 승부사',
    animal: '사자',
    tagline: '확신이 서면 흔들림 없이 주식을 사서 끝까지 밀고 가는 승부사',
    description: '세상을 바꾸는 혁신 기업이나 미래 성장성이 돋보이는 산업에 깊은 확신을 두고 장기 동행하는 스타일입니다.',
    storyNarrative: {
      overview: '당신은 거친 초원에서 목표를 한 번 정하면 거센 비바람이 몰아쳐도 꿋꿋하게 자리를 지키는 용맹한 사자와 같습니다. 어설프게 여러 종목에 잔돈을 흩뿌려두기보다는, 세상을 근본적으로 바꿀 인류 최고의 1등 혁신 기업을 발굴하여 끝까지 믿고 동행하는 담대한 심장을 지녔습니다. 경제가 며칠 흔들리고 시장에 공포 폭락이 찾아와도 "이 기업의 위대한 기술과 시장 독점력은 결코 사라지지 않는다"는 깊은 신념으로 버텨냅니다. 남들이 공포에 질려 눈물로 주식을 처분할 때, 오히려 더 큰 용기로 주식을 든든하게 채워 넣을 줄 아는 타고난 승부사입니다.',
      marketCaution: '하지만 나의 직관과 확신이 너무 강해진 나머지, 세상의 기술 환경이 완전히 바뀌고 기업의 실질 경쟁력이 꺾였는데도 이를 인정하지 않고 고집을 부리다가 큰 손해를 볼 수 있습니다. 아무리 위대해 보이는 1등 기업이라도 모든 돈을 한곳에만 쏟아붓지 말고, 최소한의 안전판을 나누어 담아두는 여유가 필요합니다.',
    },
    recommendedPortfolioPreview: {
      title: '미국 1등 혁신 기업 집중 복리 조합',
      targetCAGR: '12~16%',
      targetMDD: '45~60%',
      isDynamicTrend: false,
      allocation: [
        { name: 'S&P 500', weight: 40, color: '#3B82F6' },
        { name: '필라델피아 반도체', weight: 35, color: '#8B5CF6' },
        { name: '나스닥 100 (2배)', weight: 25, color: '#F18F01' },
      ],
      rationale: '사자처럼 시원한 고수익을 추구하는 성향에 맞추어 가장 대표적인 지수와 함께 필라델피아 반도체 및 나스닥 성장 자산에 집중 배치하여, 장기적으로 자산이 가파르게 불어나는 강력한 복리 효과를 누릴 수 있도록 구성했습니다.',
    },
    recommendedStrategy: '주력 개별주 집중 투자, 딥다이브 기업 분석, 주식 구매 후 성과 추적',
    suitableAssets: ['주력 혁신 기업주', 'NVDA', 'TSLA', '테마 대장주'],
    badges: ['수익형 🚀', '능동형 ⚡', '장기형 ⏳', '직감형 💡'],
    strengths: [
      '확신이 섰을 때 주저함 없이 실행하는 강한 결단력',
      '시장 흔들림에도 쉽게 불안해하지 않는 꿋꿋한 멘탈',
      '유망 산업의 장기 로드맵을 믿고 기다릴 수 있는 꿋꿋함',
    ],
    weaknesses: [
      '자신의 확신에 과몰입해 한 종목에 자산을 너무 몰아넣을 위험',
      '상황이 달라져 기업 가치가 훼손되어도 틀렸음을 인정하지 않고 버텼다가 손실이 커짐',
      '자산 분산 투자 및 위험 관리에 소홀해지기 쉬움',
    ],
    guidelines: {
      recommendation: '한 종목에만 집중하기보다 3~5개 유망 분야로 나누어 위험 분산하기',
      warning: '지나친 자신감으로 한 종목에 원금을 몰빵하지 말 것',
    },
  },
  GATR: {
    code: 'GATR',
    name: '추세 공략가',
    animal: '치타',
    tagline: '상승 흐름을 잡고 손실은 신속하게 끊어내는 기동파',
    description: '상승기의 흐름이 보일 때 신속하게 진입하여 이익을 챙기고, 흐름이 꺾이면 미련 없이 규칙을 적용하여 손해를 줄이는 기동파입니다.',
    storyNarrative: {
      overview: '당신은 바람을 가르며 폭발적인 가속도로 기회를 낚아채고, 사냥이 불리해지면 미련 없이 몸을 돌려 빠져나오는 민첩한 치타와 같습니다. 주식 시장에서 대세 상승의 강한 에너지가 감지될 때 신속하게 올라타 수익을 극대화하고, 시장의 힘이 빠지고 하락 흐름이 시작되면 칼같이 주식을 줄여 현금을 챙기는 탁월한 기동력을 발휘합니다. 특정 주식에 불필요한 감정이나 애착을 품지 않으며, 오직 살아 움직이는 시장의 힘과 방향성에 순응하는 매우 현실적이고 유연한 전략가입니다.',
      marketCaution: '하지만 뚜렷한 방향성 없이 오르내림을 반복하는 횡보장에서는 잦은 진입과 이탈로 인해 수수료만 쌓이고 피로해질 수 있습니다. 매일 시세판을 보며 안절부절못하기보다는, 시장의 큰 물줄기가 확실히 바뀔 때만 여유 있게 대응하는 진득함을 함께 갖추면 완벽해집니다.',
    },
    recommendedPortfolioPreview: {
      title: '상승 흐름 추종 & 유연한 현금 조율 조합',
      targetCAGR: '9~13%',
      targetMDD: '38~55%',
      isDynamicTrend: true,
      allocation: [
        { name: '필라델피아 반도체', weight: 40, color: '#8B5CF6', enableDefense: true },
        { name: '나스닥 100 (2배)', weight: 35, color: '#F18F01', enableDefense: true },
        { name: 'S&P 500', weight: 25, color: '#3B82F6', enableDefense: true },
      ],
      rationale: '상승 흐름에서는 필라델피아 반도체와 나스닥 성장에 힘을 실어주고, 시장의 흐름이 꺾이고 위험이 감지될 때는 주식 비중을 줄이고 안전한 현금으로 피신하여 소중한 원금을 기계적으로 지켜내도록 돕습니다.',
    },
    recommendedStrategy: '상대 모멘텀 전략, 이동평균선 돌파 매매, 단기 리밸런싱',
    suitableAssets: ['SOXX', '레버리지 ETF', '수급 상위 개별주'],
    badges: ['수익형 🚀', '능동형 ⚡', '추세형 📈', '원칙형 📐'],
    strengths: [
      '오르는 주식의 상승 모멘텀을 빠르게 알아채는 순발력',
      '손실이 커지기 전에 정해둔 규칙대로 파는 결단력',
      '시장 분위기가 나쁠 때 현금을 확보해 내 자산을 지키는 능력',
    ],
    weaknesses: [
      '자주 사고파는 과정에서 세금과 매매 수수료가 많이 발생함',
      '변동성이 클 때 급하게 들어가 손실을 볼 위험',
      '시세 화면을 자주 지켜보아야 하는 심리적 피로감',
    ],
    guidelines: {
      recommendation: '흐름이 꺾였을 때는 정해둔 기준선대로 미련 없이 팔아 자산 지키기',
      warning: '이미 크게 오른 뒤 뒤늦게 감정적으로 따라 사지 말 것',
    },
  },
  GATI: {
    code: 'GATI',
    name: '트렌드 세터',
    animal: '경주마',
    tagline: '일상의 유행과 뜨거운 이슈에 관심이 많은 트렌드파',
    description: '새로운 기술이나 유행하는 상품, 시장의 화제성이 높은 종목을 빠르게 포착하여 기회를 찾는 스타일입니다.',
    storyNarrative: {
      overview: '당신은 관중들의 뜨거운 환호와 축제의 열기를 느끼며 맨 앞에서 트랙을 질주하는 힘찬 경주마와 같습니다. 친구들이 열광하는 새로운 앱, SNS를 뜨겁게 달구는 유행 상품, 세상을 뒤흔들 미래 기술 소식을 남들보다 훨씬 기민하게 알아채고 투자 기회로 연결하는 탁월한 감각을 지녔습니다. 딱딱한 교과서적 이론 공부에 매달리기보다는, 살아 숨 쉬는 세상 사람들의 욕망과 소비 트렌드를 읽는 직관이 매우 뛰어나 시장의 가장 화려한 주인공에 일찍 올라타는 재주가 있습니다.',
      marketCaution: '하지만 이미 온 세상이 떠들썩하게 이야기하고 가격이 꼭대기까지 오른 인기 종목에 조급함으로 뒤늦게 뛰어들면 크게 물릴 수 있습니다. 인기가 절정에 달했을 때일수록 흥분을 가라앉히고, 내가 감당할 수 있는 만큼만 나누어 담는 절제가 꼭 필요합니다.',
    },
    recommendedPortfolioPreview: {
      title: '트렌드 혁신 & 미래 성장 조합',
      targetCAGR: '12~16%',
      targetMDD: '45~60%',
      isDynamicTrend: true,
      allocation: [
        { name: '나스닥 100', weight: 50, color: '#F18F01', enableDefense: true },
        { name: '필라델피아 반도체', weight: 35, color: '#8B5CF6', enableDefense: true },
        { name: '비트코인', weight: 15, color: '#F59E0B', enableDefense: true },
      ],
      rationale: '트렌드 세터의 감각을 살려 나스닥 혁신 기업과 필라델피아 반도체, 미래 디지털 자산에 골고루 힘을 실어주되, 시장 열기가 식었을 때는 주식을 덜어내어 현금으로 큰 손실을 방지하도록 조율합니다.',
    },
    recommendedStrategy: '핫 테마주 순환매, 주도주 단기 추세 매매, 이슈 대응',
    suitableAssets: ['신성장 섹터 ETF', '주도 테마 개별주', '암호화폐'],
    badges: ['수익형 🚀', '능동형 ⚡', '추세형 📈', '직감형 💡'],
    strengths: [
      '일상에서 소비 트렌드와 인기 상품의 변화를 빠르게 알아챔',
      '과감하게 실행하고 빠르게 기회를 잡는 기동성',
      '지루함 없이 주식 시장의 활력을 즐기며 투자에 참여함',
    ],
    weaknesses: [
      '이미 열기가 식어버린 인기 종목의 끝물에 나만 빠질까 봐(FOMO) 덜컥 샀다가 고점에 물릴 위험',
      '주식을 사기 전 기업의 실적이나 재무에 대한 꼼꼼한 조사 부족',
      '기업의 실제 가치가 없어 폭락할 때 대처가 어려움',
    ],
    guidelines: {
      recommendation: '인기 있는 분야라도, 내가 감당할 수 있는 손실 범위를 미리 정해두고 참여하기',
      warning: '이미 크게 오른 주식에 흥분해서 충동적으로 따라 사지 말 것',
    },
  },
  GPLR: {
    code: 'GPLR',
    name: '원칙 설계자',
    animal: '황소',
    tagline: '정해둔 비율과 규칙대로만 담아두고 차분히 운용하는 관리자',
    description: '좋은 주식들을 정해둔 비율로만 나누어 담아두고, 정해진 주기에 비율만 다시 맞춰주며 본업과 일상에 전혀 방해를 받지 않는 시스템 운용자입니다.',
    storyNarrative: {
      overview: '당신은 묵묵히 기름진 밭을 갈며 사계절의 결실을 만들어내는 우직하고 힘찬 황소와 같습니다. 매일 요동치는 시세판을 보며 소중한 에너지를 낭비하기보다는, 수학적으로 가장 안전하고 검증된 자산 배분 비율을 딱 정해둔 뒤 일정한 주기마다 어긋난 비율만 제자리로 맞춰주는 기계적 리밸런싱을 실천합니다. 사람의 나약한 감정이나 어설픈 시장 예측을 철저히 배제하고, 내가 정교하게 설계한 시스템의 힘을 깊이 신뢰합니다. 일상과 투자의 경계를 건강하게 지켜내며 본업에 완벽히 몰입하는 성숙한 투자자입니다.',
      marketCaution: '하지만 모든 것이 너무 평온하고 조용하게 흘러가다 보면, 시장에서 특정 테마주나 코인이 폭등한다는 소식이 들릴 때 지루함을 이기지 못하고 스스로 세운 황금 비율을 충동적으로 깨뜨리고 싶은 유혹에 빠질 수 있습니다. 시스템의 진정한 위력은 오직 긴 시간 동안 흔들림 없이 지켜내는 인내에서 나온다는 점을 잊지 마세요.',
    },
    recommendedPortfolioPreview: {
      title: '원칙 기반 성장 & 안전자산 황금비율',
      targetCAGR: '8~11%',
      targetMDD: '35~50%',
      isDynamicTrend: false,
      allocation: [
        { name: 'S&P 500', weight: 45, color: '#3B82F6' },
        { name: '금', weight: 30, color: '#EAB308' },
        { name: '나스닥 100 (2배)', weight: 25, color: '#F18F01' },
      ],
      rationale: '황소처럼 우직하게 자산을 불려 나가기 위해 가장 대표적인 지수와 나스닥 성장에 투자하면서, 폭락장에서 계좌를 든든하게 지켜줄 금을 30% 섞어 떨어질 때 싸게 더 사는 기계적 조율이 완벽히 작동하도록 설계했습니다.',
    },
    recommendedStrategy: '변동성 조절 알고리즘, 정기 정량 리밸런싱, 레버리지 적립식 투자',
    suitableAssets: ['TQQQ / UPRO', '지수 ETF 백테스트 포트폴리오'],
    badges: ['수익형 🚀', '수동형 🛋️', '장기형 ⏳', '원칙형 📐'],
    strengths: [
      '일상생활이나 본업이 주식 때문에 전혀 방해받지 않음',
      '감정에 휘둘리지 않고 정해둔 비율대로 기계적으로 운용함',
      '자주 사고팔지 않아 쓸데없는 세금을 대폭 아낌',
    ],
    weaknesses: [
      '특정 종목이 폭등할 때 여러 종목으로 나뉘어 있어 수익이 분산됨',
      '시장이 지루할 때 정해둔 비율과 규칙을 깨고 싶은 유혹을 느낌',
      '세상의 큰 산업 구조 변화를 늦게 알아챌 수 있음',
    ],
    guidelines: {
      recommendation: '미리 정해둔 비율과 규칙을 끝까지 지키기',
      warning: '단기적인 오르내림이나 시장 소음에 흔들려 정해둔 자산 비율을 깨지 말 것',
    },
  },
  GPLI: {
    code: 'GPLI',
    name: '미래 개척자',
    animal: '코끼리',
    tagline: '미래 유망 산업을 믿고 차곡차곡 사 모아가는 장기파',
    description: '매일 시세를 들여다보기보다, 앞으로 세상을 이끌어갈 대표 산업을 믿고 차곡차곡 모아가는 스타일입니다.',
    storyNarrative: {
      overview: '당신은 긴 세월 동안 묵직하고 웅장한 발걸음으로 대륙을 건너는 지혜로운 코끼리와 같습니다. 오늘 내일 주가가 몇 퍼센트 오르고 내리는 시세의 잔물결에 일희일비하지 않고, 인류의 과학기술과 위대한 문명이 10년 뒤 어디에 도달해 있을지를 바라보는 넓고 따뜻한 시야를 가졌습니다. 매달 들어오는 소중한 월급의 일부를 미래 세상의 지분으로 바꾸어 차곡차곡 모아가며, 시간을 가장 든든한 아군으로 만들어 거대한 복리의 결실을 기다리는 남다른 여유가 돋보입니다.',
      marketCaution: '다만 시세를 안 보는 느긋함이 지나쳐, 내가 투자한 기업이나 산업의 패러다임이 완전히 꺾였는데도 계좌를 아예 방치해 둘 위험이 있습니다. 1년에 두세 번 정도는 정기 점검일을 정해 내가 모아가는 혁신 자산들이 건강하게 성장하고 있는지 살피는 루틴이 필요합니다.',
    },
    recommendedPortfolioPreview: {
      title: '미래 혁신 기술 무스트레스 적립 조합',
      targetCAGR: '9~13%',
      targetMDD: '38~55%',
      isDynamicTrend: false,
      allocation: [
        { name: '나스닥 100', weight: 50, color: '#F18F01' },
        { name: 'S&P 500', weight: 30, color: '#3B82F6' },
        { name: '필라델피아 반도체', weight: 20, color: '#8B5CF6' },
      ],
      rationale: '미래 개척자의 성향에 맞추어 인류의 기술 혁신을 이끄는 나스닥 100과 필라델피아 반도체에 70% 비중을 두고, S&P 500 30%를 더해 스트레스 없이 매달 적금처럼 편안하게 모아갈 수 있도록 최적화했습니다.',
    },
    recommendedStrategy: '미래 기술 지수 적립식 투자, 장기 성장 ETF 매월 구매',
    suitableAssets: ['QQQ', 'SCHG', 'AI/반도체 테마 ETF'],
    badges: ['수익형 🚀', '수동형 🛋️', '장기형 ⏳', '직감형 💡'],
    strengths: [
      '하루하루 주식 시장의 오르내림에 스트레스를 받지 않음',
      '단기 등락 스트레스 없이 장기 복리 효과를 기다리는 여유',
      '긴 시간이 지나 복리로 커지는 결실을 누리는 긍정적인 안목',
    ],
    weaknesses: [
      '기업이나 산업의 이익 구조가 바뀌었음에도 너무 계좌를 안 봐서 방치할 위험',
      '큰 하락장이 찾아왔을 때 오랫동안 손해를 견뎌야 하는 답답함',
      '모아둔 주식을 언제 팔아서 이익을 실현할지 기준이 부족함',
    ],
    guidelines: {
      recommendation: '세상의 변화를 믿되, 최소 분기 1회 실적 점검을 원칙으로 삼기',
      warning: '일시적인 하락에 겁을 먹고 너무 일찍 포기하거나 무작정 계좌를 방치하지 말 것',
    },
  },
  GPTR: {
    code: 'GPTR',
    name: '신호 포착가',
    animal: '돌고래',
    tagline: '경제 신호가 올 때만 재빠르게 자산 비중을 조절하는 전략가',
    description: '평소에는 본업에 몰입하다가, 정해둔 경제 지표나 시장에 큰 기회/위험 신호가 올 때만 사전에 수립한 매뉴얼에 따라 자산 비중을 조절합니다.',
    storyNarrative: {
      overview: '당신은 바다의 수온과 파도의 미세한 진동을 감지하여 안전하고 풍요로운 수역으로 유영하는 영리한 돌고래와 같습니다. 매일 시장의 격랑 속에 뛰어들어 피를 흘리기보다는, 평소에는 본업과 일상에 집중하며 평화롭게 지내다가 사전에 정해둔 확실한 경제 신호가 켜질 때만 영리하게 자산 비중을 조절합니다. 감정에 휩쓸리지 않고 명확한 객관적 규칙에 따라 움직이므로 에너지 소모 없이 매우 효율적으로 자산을 지키고 불려 나갑니다.',
      marketCaution: '하지만 신호를 기다리는 동안 시장이 완만하게 계속 오르면, 나만 뒤처지는 것 같아 조바심이 생길 수 있습니다. 신호가 뜨지 않는 긴 평화의 시기에도 내 규칙을 믿고 진득하게 기다리는 인내가 성공 투자의 핵심 열쇠입니다.',
    },
    recommendedPortfolioPreview: {
      title: '성장 지수 & 안전 자산 균형 조율 조합',
      targetCAGR: '8~11%',
      targetMDD: '35~50%',
      isDynamicTrend: false,
      allocation: [
        { name: '나스닥 100', weight: 45, color: '#F18F01' },
        { name: 'S&P 500', weight: 35, color: '#3B82F6' },
        { name: '금', weight: 20, color: '#EAB308' },
      ],
      rationale: '미국을 대표하는 우량 기업(나스닥 100, S&P 500 80%)으로 든든한 수익을 챙기면서, 금(20%)을 안전판으로 두어 큰 위기 신호가 감지될 때마다 차분하게 비중을 조율할 수 있도록 설계했습니다.',
    },
    recommendedStrategy: '동적 자산 배분(VAA/DAA), 신호 기반 현금/주식 전환',
    suitableAssets: ['공격형 동적 ETF 포트폴리오', 'QQQ / TLT'],
    badges: ['수익형 🚀', '수동형 🛋️', '추세형 📈', '원칙형 📐'],
    strengths: [
      '하락장이 오기 전에 현금을 확보해 내 돈을 지키는 방어력',
      '정해둔 지표 신호가 올 때만 반응하는 정돈된 신중함',
      '일상생활과 주식 투자 간의 뛰어난 균형감',
    ],
    weaknesses: [
      '시장이 갑자기 폭등할 때 주식 비중이 부족해 수익이 적을 수 있음',
      '지표 신호가 나오지 않는 긴 대기 기간 동안 느껴지는 지루함',
      '신호를 잘못 읽었을 때 발생하는 아쉬움과 교체 수수료',
    ],
    guidelines: {
      recommendation: '수립해둔 객관적 신호가 올 때만 기계적으로 자산 비중 조정하기',
      warning: '아무 신호도 없는데 지루하다는 이유로 원칙 없는 매매를 건드리지 말 것',
    },
  },
  GPTI: {
    code: 'GPTI',
    name: '유연한 탐색가',
    animal: '상어',
    tagline: '시장의 뉴스와 분위기 흐름을 유연하게 타고 내리는 탐색가',
    description: '시장의 분위기와 뉴스 흐름을 관찰하며, 가격이 출렁일 때 생기는 기회를 유연하게 포착하려는 스타일입니다.',
    storyNarrative: {
      overview: '당신은 깊은 바닷속에서 작은 기류 변화를 맡고 기회를 유연하게 찾아내는 날렵한 상어와 같습니다. 딱딱한 교과서적 이론이나 고정관념에 갇히지 않고, 시장이 패닉에 빠져 좋은 주식들이 터무니없이 싸질 때 과감하게 다가가 기회를 낚아챕니다. 시장의 분위기와 세상 사람들의 심리 변화를 본능적으로 감지하여 실용적으로 이익을 챙기는 실전 감각이 매우 뛰어납니다.',
      marketCaution: '그러나 \'유연함\'이라는 이름 뒤에 숨어 명확한 기준 없이 순간의 감정이나 뉴스 소음에 따라 즉흥적인 매매를 반복할 위험이 있습니다. 기회를 포착하더라도 한 번 더 침착하게 따져보고 계획을 세우는 습관을 들이면 계좌의 안전이 배가됩니다.',
    },
    recommendedPortfolioPreview: {
      title: '고성장 테크 & 배당 쿠션 조합',
      targetCAGR: '8~11%',
      targetMDD: '35~50%',
      isDynamicTrend: false,
      allocation: [
        { name: '나스닥 100', weight: 40, color: '#F18F01' },
        { name: '필라델피아 반도체', weight: 30, color: '#8B5CF6' },
        { name: '미국배당다우존스', weight: 30, color: '#10B981' },
      ],
      rationale: '나스닥 100과 필라델피아 반도체(70%)로 시원한 성장을 노리면서, 안정적인 배당을 지급하는 미국배당다우존스(30%)를 든든한 쿠션으로 배치하여 시장의 출렁임 속에서도 흔들림 없이 수익을 누리도록 구성했습니다.',
    },
    recommendedStrategy: '스윙 매매, 시장 과매도 시 직관적 매수, 단기 랠리 활용',
    suitableAssets: ['고변동성 개별주', '레버리지 상품'],
    badges: ['수익형 🚀', '수동형 🛋️', '추세형 📈', '직감형 💡'],
    strengths: [
      '단기적으로 과도하게 하락한 구간에서 반등 기회를 포착하려는 민첩함',
      '고정관념 없이 변화된 환경에 유연하게 적응하는 유연함',
      '결정을 빠르게 내리고 바로 실행에 옮기는 기동성',
    ],
    weaknesses: [
      '\'유연함\'을 핑계로 명확한 기준 없이 순간 기분에 따라 충동 구매함',
      '자금 관리 기준이 없어 손실이 이어질 때 위험에 노출됨',
      '자자한 뉴스 소음에 너무 민감하게 반응하여 잦은 매매 발생',
    ],
    guidelines: {
      recommendation: '너무 즉흥적으로 사기보다, 시간을 두고 가격 흐름을 확인한 뒤 결정하기',
      warning: '단순한 순간 기분이나 감정적 흥분으로 충동적인 구매 버튼을 누르지 말 것',
    },
  },

  // S-Axis (Safety)
  SALR: {
    code: 'SALR',
    name: '원금 수호자',
    animal: '곰',
    tagline: '검증된 안전 자산으로 마음 편히 계좌를 수호하는 철벽 방어자',
    description: '힘겹게 모은 원금이 깎이는 것을 매우 피하고 싶어 하며, 과거 오랜 기간 안전하다고 증명된 자산 위주로만 원칙에 맞춰 사 모아갑니다.',
    storyNarrative: {
      overview: '당신은 혹독한 겨울바람 속에서도 든든한 동굴 안에서 평온하게 겨울잠을 자는 지혜로운 곰과 같습니다. 얼마나 빠르게 부자가 되느냐보다는, "어떻게 평생 피땀 흘려 일군 내 소중한 자산을 단 1원도 잃지 않고 지켜내느냐"를 인생의 가장 숭고한 가치로 생각합니다. 미국을 대표하는 우량 기업과 든든한 미국 장기채, 그리고 극심한 인플레이션을 막아주는 금을 황금 비율로 나누어 담아, 시장에 어떤 금융위기 폭풍우가 몰아쳐도 밤에 두 발 뻗고 잘 수 있는 완벽한 안도감을 만들어냅니다. 밤잠을 설칠 바에는 약간의 초과 수익을 기꺼이 양보하는 성숙함이야말로 당신만의 위대한 강점입니다.',
      marketCaution: '하지만 원금을 지키려는 마음이 지나치게 앞서다 보면, 물가가 오르는 속도보다 내 돈이 불어나는 속도가 느려져 시간이 흐를수록 실질 구매력이 줄어드는 함정에 빠질 수 있습니다. 전체 자산의 절반 정도는 자본주의의 성장을 묵묵히 따라가는 가장 대표적인 지수 주식에 당당하게 맡겨두는 건강한 용기가 필요합니다.',
    },
    recommendedPortfolioPreview: {
      title: '사계절 균형 안심 자산배분 조합',
      targetCAGR: '6~8%',
      targetMDD: '26~36%',
      isDynamicTrend: false,
      allocation: [
        { name: 'S&P 500', weight: 30, color: '#3B82F6' },
        { name: '미국배당다우존스', weight: 30, color: '#10B981' },
        { name: '금', weight: 20, color: '#EAB308' },
        { name: '미국 장기채', weight: 20, color: '#06B6D4' },
      ],
      rationale: '곰처럼 철벽 방어를 원하는 성향에 맞추어 주식 60%(S&P 500+미국배당다우존스)와 안전자산 40%(미국 장기채+금)를 조화롭게 섞어, 과거 금융위기나 폭락장에서도 원금 손실 폭을 극적으로 줄여주도록 완성했습니다.',
    },
    recommendedStrategy: '올웨더/영구 포트폴리오 백테스팅, 상관관계 최소화 자산 배분',
    suitableAssets: ['VT', 'BND', 'GLD (금)', '배당 성장의 대형주'],
    badges: ['안전형 🛡️', '능동형 ⚡', '장기형 ⏳', '원칙형 📐'],
    strengths: [
      '하락장에서도 마음 편히 밤잠을 잘 수 있는 평정심',
      '시장이 폭락해도 내 자산을 지켜내는 강력한 방어력',
      '오랜 역사로 검증된 자산 배분 원칙 준수',
    ],
    weaknesses: [
      '지나치게 안전 자산만 고집하다가 물가 상승률(인플레이션)보다 수익이 낮을 수 있음',
      '시장이 크게 오를 때 성장의 결실을 100% 누리지 못함',
      '원금 보전에만 치중하여 자산 형성 속도가 천천히 진행됨',
    ],
    guidelines: {
      recommendation: '안전 자산 중심 구성을 유지하되, 물가 상승 대응용 알짜 성장 자산 10~20% 포함하기',
      warning: '원금 손실에 대한 과도한 공포로 인플레이션 위험을 무시하지 말 것',
    },
  },
  SALI: {
    code: 'SALI',
    name: '신중한 검증가',
    animal: '산양',
    tagline: '확실히 검증된 안전한 대기업만 골라 신중히 투자하는 검증가',
    description: '꼼꼼히 조사해서 잘 알고 있는 안전한 대기업이나 우량 배당주만 고르고, 확실히 안전하다고 판단될 때만 조심스럽게 투자하는 검증가입니다.',
    storyNarrative: {
      overview: '당신은 깎아지른 가파른 절벽에서도 발을 딛을 돌다리를 하나하나 꼼꼼히 두드려보며 안전하게 정상으로 향하는 산양과 같습니다. 실체 없이 반짝 유행하는 신기술이나 주변 사람들의 뜬소문에 절대 현혹되지 않으며, 수십 년 동안 전쟁과 불황을 꿋꿋이 이겨내고 따박따박 현금 배당금을 늘려온 세계 1등 배당 기업들만을 깐깐하게 골라냅니다. 매 분기 내 계좌로 입금되는 든든한 배당금을 확인할 때 진정한 투자의 결실과 마음의 평화를 느끼는 현명한 현실주의자입니다.',
      marketCaution: '그러나 작은 불확실성에도 너무 신중하게 고민만 거듭하다 보면, 정작 좋은 가격에 우량 주식을 담을 수 있는 귀한 기회를 계속 놓치게 됩니다. 모든 조건이 완벽해질 때까지 망설이기보다는, 매달 정해진 날짜에 기계처럼 나누어 사는 시스템을 만들어 실행력을 높여보세요.',
    },
    recommendedPortfolioPreview: {
      title: '고배당 우량주 & 현금흐름 중심 조합',
      targetCAGR: '6~8%',
      targetMDD: '26~36%',
      isDynamicTrend: false,
      allocation: [
        { name: '미국배당다우존스', weight: 40, color: '#10B981' },
        { name: 'S&P 500', weight: 30, color: '#3B82F6' },
        { name: '금', weight: 20, color: '#EAB308' },
        { name: '미국 중기채', weight: 10, color: '#06B6D4' },
      ],
      rationale: '매년 배당금이 늘어나는 미국배당다우존스를 중심축으로 삼고, S&P 500과 금, 미국 중기채를 섞어 어떤 경제 위기에도 내 계좌에서 안정적으로 현금이 솟아나도록 설계했습니다.',
    },
    recommendedStrategy: '고배당 우량주 분석 및 장기 보유, 안전 이익 구조 검증',
    suitableAssets: ['배당 귀족주 (KO, PG)', 'SCHD', '단기 국채'],
    badges: ['안전형 🛡️', '능동형 ⚡', '장기형 ⏳', '직감형 💡'],
    strengths: [
      '위험한 신생 기업이나 부실 기업을 완벽히 피해 가는 안목',
      '확실하고 안전한 구간에서만 주식을 사는 신중함',
      '정기적인 배당 수익 확보로 계좌에 안정감을 줌',
    ],
    weaknesses: [
      '지나치게 오랫동안 고민만 하다가 좋은 주식을 살 기회를 계속 놓침',
      '생각이 너무 많아져 결국 아무 결정도 내리지 못하고 실행하지 못하게 됨',
      '새로운 산업 변화나 기술 혁신 기업에 대한 거부감',
    ],
    guidelines: {
      recommendation: '분석이 끝나면 고민 대신 정해진 금액으로 나눠서 사는 규칙 실행',
      warning: '완벽한 안전만 찾다가 아무것도 시작하지 못하는 상태를 경계할 것',
    },
  },
  SATR: {
    code: 'SATR',
    name: '위험 경보관',
    animal: '다람쥐',
    tagline: '하락 기운이 느껴지면 신속히 현금으로 피신하는 경보관',
    description: '원금 지키는 것을 가장 중요하게 생각하며, 시장의 하락 기운이 느껴지면 사전에 정한 매뉴얼에 따라 주식을 팔고 현금으로 피신합니다.',
    storyNarrative: {
      overview: '당신은 숲속에 작은 바스락거림만 들려도 재빠르게 안전한 나무 위로 몸을 숨기는 영민한 다람쥐와 같습니다. 시장의 폭풍우를 무모하게 온몸으로 맞서기보다는, 하락의 징조가 포착될 때 주식 비중을 줄이고 든든한 미국 단기채와 현금으로 대피하는 탁월한 자기방어 능력을 발휘합니다. 탐욕에 눈이 멀지 않고 언제든 비상 탈출 매뉴얼을 꺼내어 소중한 원금을 철저히 보존해 내는 절제력이 매우 돋보입니다.',
      marketCaution: '하지만 사소한 시장의 흔들림에도 매번 놀라 주식을 팔다 보면, 수수료만 빠져나가고 시장이 금방 회복할 때 밖에서 멍하니 구경만 하게 될 수 있습니다. 작은 소음과 진짜 위험 신호를 구분하여, 객관적인 큰 지표 신호가 올 때만 차분하게 움직이는 훈련이 필요합니다.',
    },
    recommendedPortfolioPreview: {
      title: '하락 방어 & 안전 현금 조율 조합',
      targetCAGR: '5~7%',
      targetMDD: '12~16%',
      isDynamicTrend: true,
      allocation: [
        { name: 'S&P 500', weight: 50, color: '#3B82F6', enableDefense: true },
        { name: '미국 단기채', weight: 30, color: '#06B6D4', enableDefense: false },
        { name: '금', weight: 20, color: '#EAB308', enableDefense: false },
      ],
      rationale: '미국 대표 500대 기업에 투자하면서도, 시장 흐름이 꺾일 때 주식을 줄이고 안전한 미국 단기채와 금, 현금으로 대피할 수 있는 튼튼한 방어망을 마련하여 손실 폭을 10% 초반대로 철저히 묶어둡니다.',
    },
    recommendedStrategy: '하락장 마켓 타이밍 룰, 이동평균 하회 시 현금화 전략',
    suitableAssets: ['USFR (단기채)', 'S&P500 Index', '현금성 자산'],
    badges: ['안전형 🛡️', '능동형 ⚡', '추세형 📈', '원칙형 📐'],
    strengths: [
      '대형 폭락장에서 내 원금을 지키는 훌륭한 위험 관리 능력',
      '사전에 준비해둔 현금화 매뉴얼 보유',
      '욕심을 부리지 않고 수익 및 현금을 챙기는 절제력',
    ],
    weaknesses: [
      '시장이 잠시 흔들릴 때마다 주식을 팔아서 수수료 손실 발생',
      '하락 후 금방 회복할 때 현금을 쥐고 있어 시장에서 소외될 위험',
      '시세와 경제 기사를 매번 점검해야 하는 심리적 피로감',
    ],
    guidelines: {
      recommendation: '일시적 변동성과 진짜 위기를 구분하는 객관적 현금화 지표만 적용하기',
      warning: '작은 소문이나 일시적인 흔들림에 매번 놀라 주식을 팔지 말 것',
    },
  },
  SATI: {
    code: 'SATI',
    name: '위기 감지자',
    animal: '여우',
    tagline: '시장의 위험 징후에 민감하게 반응하는 방어형',
    description: '손실에 대한 걱정이 크고 시장의 이상 신호나 하락 분위기를 민감하게 감지하여, 자산을 안전하게 지키는 데 집중하는 스타일입니다.',
    storyNarrative: {
      overview: '당신은 짙은 밤안개 속에서도 주변의 작은 위험을 예리하게 감지하고 뒷걸음질 칠 줄 아는 영리한 여우와 같습니다. 남들이 욕심에 취해 과열된 축제에 뛰어들 때도, 당신은 어딘가 모를 싸한 분위기를 직감적으로 알아채고 조용히 발을 빼는 탁월한 생존 본능을 발휘합니다. 손실에 대한 방어벽을 가장 두텁게 쌓아두어 역사적인 경제 위기 속에서도 당당히 살아남는 지혜를 가졌습니다.',
      marketCaution: '다만 세상의 자극적인 위기론 뉴스나 부정적인 소문에 너무 깊이 빠지면, 실제로는 건강하게 우상향하는 좋은 기업들까지 겁을 먹고 전부 팔아버릴 수 있습니다. 뉴스의 일시적 소음과 기업의 진짜 실력을 구분해 바라보는 균형 감각을 키워보세요.',
    },
    recommendedPortfolioPreview: {
      title: '배당 중심 & 위기 방어 안심 조합',
      targetCAGR: '5~7%',
      targetMDD: '12~16%',
      isDynamicTrend: true,
      allocation: [
        { name: '미국배당다우존스', weight: 45, color: '#10B981', enableDefense: true },
        { name: 'S&P 500', weight: 35, color: '#3B82F6', enableDefense: true },
        { name: '금', weight: 20, color: '#EAB308', enableDefense: false },
      ],
      rationale: '안전한 미국배당다우존스와 S&P 500(80%)으로 기본 수익을 다지고, 금(20%)을 방패 삼아 시장이 과열되거나 흔들릴 때 주식을 줄이고 안전하게 현금으로 자산을 지킬 수 있도록 설계했습니다.',
    },
    recommendedStrategy: '위험 감지 시 부분 현금화, 리스크 관리 중심 유연 매매',
    suitableAssets: ['안정성 대형주', '배당 ETF', '파킹통장/현금'],
    badges: ['안전형 🛡️', '능동형 ⚡', '추세형 📈', '직감형 💡'],
    strengths: [
      '손실이 커지기 전에 빠르게 현금을 챙겨 원금을 지키려는 신중함',
      '손실이 커지기 전에 빠르게 피신하여 원금을 지키는 태도',
      '복잡한 수치 공부 없이도 직관적으로 위험을 회피함',
    ],
    weaknesses: [
      '근거 없는 불안감이나 소문만 듣고 지레 겁먹어 주식을 팔아버림',
      '주식을 판 뒤 언제 다시 사야 할지 기준이 없어 상승 기회를 놓침',
      '시장의 좋은 소식조차 부정적으로 오해하기 쉬움',
    ],
    guidelines: {
      recommendation: '불안한 소문 대신 객관적인 실적과 지표를 확인한 뒤 침착하게 판단하기',
      warning: '단순한 소문이나 근거 없는 소음에 속아 충동적으로 팔지 말 것',
    },
  },
  SPLR: {
    code: 'SPLR',
    name: '꾸준한 적립가',
    animal: '거북이',
    tagline: '안전한 비율로 주식을 모아두고 편안하게 일상에 몰입하는 적립가',
    description: '자산을 잃지 않는 안전한 자산 배분 비율을 정한 뒤, 주식 모으기 시스템을 갖춰두고 마음 편하게 본업과 일상생활에 집중하는 스타일입니다.',
    storyNarrative: {
      overview: '당신은 조급하게 뛰지 않고 자신만의 묵직한 호흡과 리듬으로 결승선까지 걸어가는 우직한 거북이와 같습니다. 화면 속 주가 그래프의 어지러운 출렁임에 결코 일상을 침범당하지 않으며, 가족과의 소중한 시간과 본업에서의 성취를 가장 우선순위에 둡니다. 역사적으로 검증된 황금 자산 배분 비율(주식과 안전자산의 조화)을 믿고 매달 적금 붓듯 모아가는 당신의 태도는 가장 지혜롭고 성숙한 투자자의 표본입니다. 하락장이 찾아와도 "내가 세운 시스템이 알아서 저렴해진 주식을 채워주겠지"라며 덤덤하게 넘기는 평정심을 지녔습니다.',
      marketCaution: '하지만 주변에서 테마주나 코인으로 벼락부자가 되었다는 자극적인 무용담이 들려올 때, 나의 안전한 자산 배분이 너무 느리게 느껴져 순간적으로 조급해질 수 있습니다. 결국 토끼를 이기고 긴 여정에서 최후의 승자가 되는 것은 멈추지 않는 거북이의 장기 복리라는 사실을 굳게 믿으세요.',
    },
    recommendedPortfolioPreview: {
      title: '글로벌 밸런스 60/40 안심 조합',
      targetCAGR: '6~8%',
      targetMDD: '26~36%',
      isDynamicTrend: false,
      allocation: [
        { name: 'S&P 500', weight: 40, color: '#3B82F6' },
        { name: '미국배당다우존스', weight: 30, color: '#10B981' },
        { name: '미국 장기채', weight: 15, color: '#06B6D4' },
        { name: '금', weight: 15, color: '#EAB308' },
      ],
      rationale: '거북이처럼 꾸준히 자산을 지키며 불릴 수 있도록 주식 70%(S&P 500+미국배당다우존스)와 안전자산 30%(미국 장기채+금)로 나누어, 정기적인 비중 조율을 통해 마음 편히 일상에 전념할 수 있도록 완성했습니다.',
    },
    recommendedStrategy: '올웨더 자동 정기 리밸런싱, 60/40 자산 배분 적립',
    suitableAssets: ['AOA', 'RPAR', 'SPY + AGG 분산 포트폴리오'],
    badges: ['안전형 🛡️', '수동형 🛋️', '장기형 ⏳', '원칙형 📐'],
    strengths: [
      '하락장에서도 멘탈이 나가지 않는 평정심',
      '일상과 삶의 균형이 주식 때문에 흔들리지 않음',
      '감정이 개입되지 않는 깔끔한 주식 모으기 운용',
    ],
    weaknesses: [
      '자산이 늘어나는 속도가 다소 천천히 느껴질 수 있음',
      '남들이 다른 자산으로 큰돈을 벌었다는 말에 마음이 흔들림',
      '크게 폭등할 때 그 혜택을 100% 다 누리지는 못함',
    ],
    guidelines: {
      recommendation: '설정한 안전 배분 비율을 유지하며 마음 편히 본업과 일상에 몰입하기',
      warning: '남들이 대박을 냈다는 소식에 흔들려 나만의 안전 비율을 깨지 말 것',
    },
  },
  SPLI: {
    code: 'SPLI',
    name: '평화로운 투자자',
    animal: '판다',
    tagline: '시장의 소음에 귀 닫고 미국 대표 지수 주식을 사 모으는 투자자',
    description: '주식 뉴스나 차트를 복잡하게 보지 않고, 가장 마음이 편안한 미국 대표 지수 주식을 매달 적금 들듯 꾸준히 사 모으며 평화롭게 자산을 모아갑니다.',
    storyNarrative: {
      overview: '당신은 푸른 대나무 숲에서 걱정 없이 평화롭게 하루를 즐기는 사랑스러운 판다와 같습니다. 복잡한 경제 뉴스나 어지러운 차트를 보며 스트레스받지 않고, "세계에서 가장 강력한 500대 기업 전체를 사서 묻어둔다"는 단순하고 명쾌한 진리를 실천합니다. 매일의 시세 등락은 스쳐 지나가는 바람일 뿐이라 생각하며, 매달 적금 붓듯 우직하게 모아가는 것만으로도 대부분의 펀드 매니저를 이길 수 있다는 것을 직관적으로 아는 여유로운 마음의 소유자입니다.',
      marketCaution: '다만 너무 마음이 편안한 나머지, 내 계좌의 자산이 어떻게 굴러가고 있는지 아예 잊어버려 미래에 큰돈이 필요한 시점에 안전하게 현금화할 계획을 놓칠 수 있습니다. 1년에 한 번쯤은 자산 현황을 가볍게 점검해 두고 생애 주기에 맞춘 목표를 챙겨두는 것이 좋습니다.',
    },
    recommendedPortfolioPreview: {
      title: '미국 500대 기업 & 배당 적립 조합',
      targetCAGR: '6~8%',
      targetMDD: '26~36%',
      isDynamicTrend: false,
      allocation: [
        { name: 'S&P 500', weight: 50, color: '#3B82F6' },
        { name: '미국배당다우존스', weight: 30, color: '#10B981' },
        { name: '금', weight: 20, color: '#EAB308' },
      ],
      rationale: '복잡한 조율 없이 평생 모아갈 수 있는 S&P 500(50%)과 미국배당다우존스(30%)를 중심축으로 삼고, 시장 전체의 장기 침체기에도 마음을 든든하게 지켜줄 금(20%)을 결합한 가장 평화로운 조합입니다.',
    },
    recommendedStrategy: 'S&P 500 / 미국 전체 시장 ETF 매월 정량 자동 구매',
    suitableAssets: ['VOO', 'SPLG', 'VTI'],
    badges: ['안전형 🛡️', '수동형 🛋️', '장기형 ⏳', '직감형 💡'],
    strengths: [
      '주식 스트레스 0%의 가장 건강한 마음 상태 유지',
      '세계 시장 전체의 성장에 편안하게 탑승함',
      '사고팔지 않아 쓸데없는 세금과 시간을 대폭 절약함',
    ],
    weaknesses: [
      '너무 계좌를 안 봐서 현재 자산 상태나 수익 현황을 아예 잊어버림',
      '시장 전체가 장기 하락할 때 내 계좌 평가액도 함께 줄어듦',
      '개별 기업을 공부하고 선택하는 노하우가 부족함',
    ],
    guidelines: {
      recommendation: '신경 쓸 일 없는 대표 지수를 매달 편안하게 적립식으로 모아가기',
      warning: '계좌를 너무 방치하여 자산 현황과 인출 계획을 아예 잊지 말 것',
    },
  },
  SPTR: {
    code: 'SPTR',
    name: '자산 조율사',
    animal: '고슴도치',
    tagline: '사계절 자산을 황금비율로 담아두고 차분히 조율하는 조율사',
    description: '원금 보전을 기본으로 하여, 주식과 채권, 금을 사계절 황금비율로 담아두고 정기적으로 비중만 제자리로 맞춰주며 변동성을 일정하게 통제합니다.',
    storyNarrative: {
      overview: '당신은 날카로운 가시로 자신을 빈틈없이 방어하면서도, 계절의 변화에 맞춰 먹이를 영리하게 모아두는 고슴도치와 같습니다. 사계절이 바뀌듯 경제에도 봄, 여름, 가을, 겨울이 있다는 것을 깊이 이해하고 있기에, 무작정 비바람을 맞지 않고 주식과 미국 장기채, 금을 조화롭게 나누어 담아 계좌의 변동성을 일정하게 통제하는 사려 깊은 조율 능력을 보여줍니다. 무리하게 대박을 쫓기보다는 안정감을 지켜내는 데서 큰 성취감을 얻습니다.',
      marketCaution: '하지만 앞으로의 경기를 섣부르게 예측하려다 보면, 경제 전문가들의 엇갈리는 전망에 휘둘려 계획에 없던 주관적이고 무리한 조정을 하게 될 수 있습니다. 예측에 기대기보다는 사전에 정해둔 기계적인 지표와 주기적인 리밸런싱 규칙에 따라서만 조율하는 원칙을 지켜보세요.',
    },
    recommendedPortfolioPreview: {
      title: '사계절 자산 안심 조율 조합',
      targetCAGR: '5~7%',
      targetMDD: '20~25%',
      isDynamicTrend: false,
      allocation: [
        { name: 'S&P 500', weight: 35, color: '#3B82F6' },
        { name: '미국배당다우존스', weight: 25, color: '#10B981' },
        { name: '미국 장기채', weight: 25, color: '#06B6D4' },
        { name: '금', weight: 15, color: '#EAB308' },
      ],
      rationale: '주식 60%(S&P 500+미국배당다우존스)와 안전자산 40%(미국 장기채+금)로 포트폴리오를 구성하여, 계절이 바뀔 때마다 정기적으로 가격이 떨어진 자산을 싸게 담고 비싸진 자산을 덜어내며 안정적으로 수익을 불려나갑니다.',
    },
    recommendedStrategy: '정량 자산배분 (올웨더/사계절 모형), 주기적 비중 조절',
    suitableAssets: ['TLT (장기채)', 'GLD (금)', 'SPLG'],
    badges: ['안전형 🛡️', '수동형 🛋️', '추세형 📈', '원칙형 📐'],
    strengths: [
      '하락장에도 큰 손실 없이 소중한 자산을 지켜내는 안정감',
      '경제 계절에 맞춘 차분한 사계절 자산 조율',
      '예측에 휘둘리지 않는 규칙적인 리밸런싱 운용',
    ],
    weaknesses: [
      '경제 분위기 예측에 신경 쓰다가 시점을 잘못 잡아 기회를 놓침',
      '주식이 강하게 상승할 때 안전자산 비중 때문에 상승폭이 완만함',
      '자산 비중을 너무 자주 바꾸면 교체 비용과 세금이 소모됨',
    ],
    guidelines: {
      recommendation: '시장을 예측하려 하지 말고 정해둔 주기적 조율 원칙만 지키기',
      warning: '섣부른 개인적 추측으로 자산 비중을 너무 자주 바꾸지 말 것',
    },
  },
  SPTI: {
    code: 'SPTI',
    name: '안전지대 지킴이',
    animal: '비버',
    tagline: '든든한 배당과 안전자산으로 마음의 평화를 챙기는 지킴이',
    description: '현금 배당이 꾸준히 나오는 우량 주식과 금, 국채를 든든한 방파제로 둘러두어, 시장 소음에서 벗어나 언제나 마음 편히 자산을 지켜냅니다.',
    storyNarrative: {
      overview: '당신은 거센 물살 속에서도 나뭇가지를 단단히 엮어 누구도 무너뜨릴 수 없는 튼튼한 댐을 짓는 부지런한 비버와 같습니다. 아무리 화려하고 천문학적인 수익률을 약속한다고 해도 내 마음의 평화와 편안한 단잠을 바꿀 수는 없습니다. 안전한 현금 배당과 확실한 원금 보존을 최우선으로 여기며, 세상이 아무리 시끄러운 소음으로 요동쳐도 튼튼한 방파제 안에서 나만의 페이스를 굳건하게 지켜냅니다.',
      marketCaution: '다만 손실에 대한 걱정이 너무 커서 지나치게 많은 돈을 통장에만 묶어두면, 물가가 오르면서 돈의 실질 가치가 떨어질 수 있습니다. 손실 걱정이 적은 미국배당다우존스로 최소한의 물가 방어막을 쳐두는 것이 안전합니다.',
    },
    recommendedPortfolioPreview: {
      title: '철통 방어 배당 & 안전 쿠션 조합',
      targetCAGR: '5~7%',
      targetMDD: '22~35%',
      isDynamicTrend: false,
      allocation: [
        { name: '미국배당다우존스', weight: 40, color: '#10B981' },
        { name: 'S&P 500', weight: 30, color: '#3B82F6' },
        { name: '금', weight: 20, color: '#EAB308' },
        { name: '미국 장기채', weight: 10, color: '#06B6D4' },
      ],
      rationale: '마음 편히 잠들 수 있도록 현금 배당이 꾸준히 늘어나는 미국배당다우존스와 S&P 500을 70%로 담고, 금과 미국 장기채를 30% 둘러 원금 손실에 대한 불안을 완전히 덜어냈습니다.',
    },
    recommendedStrategy: '안전지수 ETF 중심 운용 + 시장 과열 체감 시 현금 확보',
    suitableAssets: ['SCHD', 'SHY (단기채)', 'CMA/현금'],
    badges: ['안전형 🛡️', '수동형 🛋️', '추세형 📈', '직감형 💡'],
    strengths: [
      '주식 손실에 대한 걱정과 스트레스가 0에 가까움',
      '확실한 이자와 배당금으로 자산을 안전하게 챙김',
      '불안할 때 언제든 현금화할 수 있는 확실한 안정성',
    ],
    weaknesses: [
      '지나치게 안전지대에만 머물러 인플레이션 위험에 노출됨',
      '주식 시장의 큰 상승장에서 자산을 크게 키울 기회를 상실함',
      '작은 변동성에도 겁을 먹고 주식 투자 자체를 멀리하게 됨',
    ],
    guidelines: {
      recommendation: '소액이라도 대표 지수 ETF로 안전하게 시장 수익을 경험해 보기',
      warning: '항상 통장에만 돈을 묶어두어 자산을 키울 기회를 지레 포기하지 말 것',
    },
  },
};

// Calculate MBTI scores and percentages from 40 answers (each 1-5 score: 1=그렇다, 5=그렇지 않다)
// 홀수 문항(1, 3, 5...): '그렇다(1점)' 선택 시 G/A/L/R 점수 기여 (score = 6 - ans)
// 짝수 문항(2, 4, 6...): '그렇다(1점)' 선택 시 S/P/T/I 점수 기여 (score = ans, 즉 G/A/L/R 관점에서는 ans)
export function calculateSurveyResult(answers: Record<number, number>) {
  let scoreGS = 0; // 10 questions (id 1..10) -> G 점수 누적 (10..50)
  let scoreAP = 0; // 10 questions (id 11..20) -> A 점수 누적 (10..50)
  let scoreLT = 0; // 10 questions (id 21..30) -> L 점수 누적 (10..50)
  let scoreRI = 0; // 10 questions (id 31..40) -> R 점수 누적 (10..50)

  // GS (1..10)
  for (let i = 1; i <= 10; i++) {
    const ans = answers[i] || 3;
    scoreGS += i % 2 === 1 ? (6 - ans) : ans;
  }
  // AP (11..20)
  for (let i = 11; i <= 20; i++) {
    const ans = answers[i] || 3;
    scoreAP += i % 2 === 1 ? (6 - ans) : ans;
  }
  // LT (21..30)
  for (let i = 21; i <= 30; i++) {
    const ans = answers[i] || 3;
    scoreLT += i % 2 === 1 ? (6 - ans) : ans;
  }
  // RI (31..40)
  for (let i = 31; i <= 40; i++) {
    const ans = answers[i] || 3;
    scoreRI += i % 2 === 1 ? (6 - ans) : ans;
  }

  // Conversion: raw sum 10~50 -> (sum - 10) * 2.5 = 0~100%
  const pctG = Math.round((scoreGS - 10) * 2.5);
  const pctS = 100 - pctG;

  const pctA = Math.round((scoreAP - 10) * 2.5);
  const pctP = 100 - pctA;

  const pctL = Math.round((scoreLT - 10) * 2.5);
  const pctT = 100 - pctL;

  const pctR = Math.round((scoreRI - 10) * 2.5);
  const pctI = 100 - pctR;

  // Determine Letter Codes
  const codeG = pctG >= 50 ? 'G' : 'S';
  const codeA = pctA >= 50 ? 'A' : 'P';
  const codeL = pctL >= 50 ? 'L' : 'T';
  const codeR = pctR >= 50 ? 'R' : 'I';

  const typeCode = `${codeG}${codeA}${codeL}${codeR}`;

  return {
    typeCode,
    profile: PERSONALITY_PROFILES[typeCode] || PERSONALITY_PROFILES['SPLR'],
    scores: {
      GS: { G: pctG, S: pctS },
      AP: { A: pctA, P: pctP },
      LT: { L: pctL, T: pctT },
      RI: { R: pctR, I: pctI },
    },
  };
}

export const TYPE_EMOJIS: Record<string, string> = {
  GALR: '🦅', // 독수리 (데이터 분석가)
  GALI: '🦁', // 사자 (뚝심의 승부사)
  GATR: '🐆', // 치타 (추세 공략가)
  GATI: '🐎', // 경주마 (트렌드 세터)
  GPLR: '🐂', // 황소 (원칙 설계자)
  GPLI: '🐘', // 코끼리 (미래 개척자)
  GPTR: '🐬', // 돌고래 (신호 포착가)
  GPTI: '🦈', // 상어 (유연한 탐색가)
  SALR: '🐻', // 곰 (원금 수호자)
  SALI: '🐐', // 산양 (신중한 검증가)
  SATR: '🐿️', // 다람쥐 (위험 경보관)
  SATI: '🦊', // 여우 (위기 감지자)
  SPLR: '🐢', // 거북이 (꾸준한 적립가)
  SPLI: '🐼', // 판다 (평화로운 투자자)
  SPTR: '🦔', // 고슴도치 (자산 조율사)
  SPTI: '🦫', // 비버 (안전지대 지킴이)
};