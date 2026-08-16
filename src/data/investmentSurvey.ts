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
  tagline: string;
  description: string;
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
    question: '시장이 요동칠 때는 정해진 매뉴얼보다, 시장 참여자들의 심리와 분위기를 읽어내는 촉이 더 결정적인 역할을 한다.',
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
    question: '유망한 종목이라는 \'감\'이 오면, 일단 소액이라도 바로 사본다.',
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
    question: '복잡한 수치 계산보다, 시장의 흐름과 사람들의 심리를 읽어내는 내 직관을 더 신뢰한다.',
    leftLabel: '그렇다',
    rightLabel: '그렇지 않다',
  },
];

export const PERSONALITY_PROFILES: Record<string, PersonalityProfile> = {
  // G-Axis (Growth)
  GALR: {
    code: 'GALR',
    name: '데이터 분석가',
    tagline: '기업의 실적표와 수치 데이터로 원칙에 맞춰 투자하는 분석가',
    description: '뉴스나 소문 대신 기업의 재무제표와 숫자를 직접 검증하고, 스스로 정한 기준에 맞춰 주식을 사 모아가는 분석파입니다. 순간의 감정이나 시장의 열기에 휩쓸리지 않으며, 긴 호흡으로 자산을 키우는 것을 목표로 합니다.',
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
    tagline: '확신이 서면 흔들림 없이 주식을 사서 끝까지 밀고 가는 승부사',
    description: '제대로 공부하거나 경험해서 "이 기업은 세상을 바꾼다"는 확신이 들면 망설임 없이 투자하여 오랫동안 진득하게 들고 가는 뚝심파입니다.',
    recommendedStrategy: '주력 개별주 집중 투자, 딥다이브 기업 분석, 주식 구매 후 성과 추적',
    suitableAssets: ['주력 혁신 기업주', 'NVDA', 'TSLA', '테마 대장주'],
    badges: ['수익형 🚀', '능동형 ⚡', '장기형 ⏳', '직감형 💡'],
    strengths: [
      '확신이 섰을 때 주저함 없이 실행하는 강한 결단력',
      '시장 흔들림에도 쉽게 불안해하지 않는 꿋꿋한 멘탈',
      '세상을 바꿀 훌륭한 기업을 알아채는 인사이트',
    ],
    weaknesses: [
      '자신의 확신에 과몰입해 한 종목에 자산을 너무 몰아넣을 위험',
      '상황이 달라져 기업 가치가 훼손되어도 틀렸음을 인정하지 않고 버텼다가 손실이 커짐',
      '자산 분산 투자 및 위험 관리에 소홀해지기 쉬움',
    ],
    guidelines: {
      recommendation: '아무리 확신이 높은 종목이라도 계좌 내 비중 상한선(예: 최대 20%)을 규칙으로 정해두기',
      warning: '지나친 자신감으로 한 종목에 원금을 몰빵하지 말 것',
    },
  },
  GATR: {
    code: 'GATR',
    name: '추세 공략가',
    tagline: '상승 흐름을 잡고 손실은 신속하게 끊어내는 기동파',
    description: '상승기의 흐름이 보일 때 신속하게 진입하여 이익을 챙기고, 흐름이 꺾이면 미련 없이 규칙을 적용하여 손해를 줄이는 기동파입니다.',
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
    tagline: '가장 뜨거운 최신 유행을 직관적으로 캐치하는 감각파',
    description: '세상에서 가장 빠르게 떠오르는 이슈와 트렌드를 감각적으로 캐치해, 상승 분위기에 빠르게 올라타 기회를 노리는 감각파입니다.',
    recommendedStrategy: '핫 테마주 순환매, 주도주 단기 추세 매매, 이슈 대응',
    suitableAssets: ['신성장 섹터 ETF', '주도 테마 개별주', '암호화폐'],
    badges: ['수익형 🚀', '능동형 ⚡', '추세형 📈', '직감형 💡'],
    strengths: [
      '최신 유행과 인기 주제를 알아채는 훌륭한 촉',
      '과감하게 실행하고 빠르게 기회를 잡는 기동성',
      '지루함 없이 주식 시장의 활력을 즐기며 투자에 참여함',
    ],
    weaknesses: [
      '이미 열기가 식어버린 인기 종목의 끝물에 나만 빠질까 봐(FOMO) 덜컥 샀다가 고점에 물릴 위험',
      '주식을 사기 전 기업의 실적이나 재무에 대한 꼼꼼한 조사 부족',
      '기업의 실제 가치가 없어 폭락할 때 대처가 어려움',
    ],
    guidelines: {
      recommendation: '투자하기 전, 최저 손절 기준선을 수치로 먼저 작성하고 진입하기',
      warning: '이미 크게 오른 주식에 흥분해서 충동적으로 따라 사지 말 것',
    },
  },
  GPLR: {
    code: 'GPLR',
    name: '원칙 설계자',
    tagline: '정해둔 비율과 규칙대로만 담아두고 차분히 운용하는 관리자',
    description: '좋은 주식들을 정해둔 비율로만 나누어 담아두고, 정해진 주기에 비율만 다시 맞춰주며 본업과 일상에 전혀 방해를 받지 않는 시스템 운용자입니다.',
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
    tagline: '미래 유망 산업을 믿고 차곡차곡 사 모아가는 장기파',
    description: '매일 시세 변화에 신경을 끄고, "앞으로 세상의 중심이 될 유망한 산업"이라는 믿음으로 차곡차곡 주식을 모아나갑니다.',
    recommendedStrategy: '미래 기술 지수 적립식 투자, 장기 성장 ETF 매월 구매',
    suitableAssets: ['QQQ', 'SCHG', 'AI/반도체 테마 ETF'],
    badges: ['수익형 🚀', '수동형 🛋️', '장기형 ⏳', '직감형 💡'],
    strengths: [
      '하루하루 주식 시장의 오르내림에 스트레스를 받지 않음',
      '미래 기술과 트렌드 변화를 직관적으로 파악하고 선택하는 인사이트',
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
    tagline: '경제 신호가 올 때만 재빠르게 자산 비중을 조절하는 전략가',
    description: '평소에는 본업에 몰입하다가, 정해둔 경제 지표나 시장에 큰 기회/위험 신호가 올 때만 사전에 수립한 매뉴얼에 따라 자산 비중을 조절합니다.',
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
    tagline: '시장의 뉴스와 분위기 흐름을 유연하게 타고 내리는 탐색가',
    description: '복잡한 재무제표나 고정된 규칙 대신, 시장의 분위기와 뉴스 소식을 빠르게 판단해서 오르내림의 기회를 유연하게 활용하는 타입입니다.',
    recommendedStrategy: '스윙 매매, 시장 과매도 시 직관적 매수, 단기 랠리 활용',
    suitableAssets: ['고변동성 개별주', '레버리지 상품'],
    badges: ['수익형 🚀', '수동형 🛋️', '추세형 📈', '직감형 💡'],
    strengths: [
      '시장이 과도하게 폭락했을 때 기회를 알아채는 순발력',
      '고정관념 없이 변화된 환경에 유연하게 적응하는 유연함',
      '결정을 빠르게 내리고 바로 실행에 옮기는 기동성',
    ],
    weaknesses: [
      '\'유연함\'을 핑계로 명확한 기준 없이 순간 기분에 따라 충동 구매함',
      '자금 관리 기준이 없어 손실이 이어질 때 위험에 노출됨',
      '자자한 뉴스 소음에 너무 민감하게 반응하여 잦은 매매 발생',
    ],
    guidelines: {
      recommendation: '아무리 유연하게 대응하더라도 \'최대 손실 허용 범위\'는 사전에 문서화하기',
      warning: '단순한 순간 기분이나 감정적 흥분으로 충동적인 구매 버튼을 누르지 말 것',
    },
  },

  // S-Axis (Safety)
  SALR: {
    code: 'SALR',
    name: '원금 수호자',
    tagline: '검증된 안전 자산으로 마음 편히 계좌를 수호하는 철벽 방어자',
    description: '힘겹게 모은 원금이 깎이는 것을 매우 피하고 싶어 하며, 과거 오랜 기간 안전하다고 증명된 자산(채권, 금, 대형 배당주 등) 위주로만 원칙에 맞춰 사 모아갑니다.',
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
    tagline: '확실히 검증된 안전한 대기업만 골라 신중히 투자하는 검증가',
    description: '꼼꼼히 조사해서 잘 알고 있는 안전한 대기업이나 우량 배당주만 고르고, 확실히 안전하다고 판단될 때만 조심스럽게 투자하는 검증가입니다.',
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
    tagline: '하락 기운이 느껴지면 신속히 현금으로 피신하는 경보관',
    description: '원금 지키는 것을 가장 중요하게 생각하며, 시장의 하락 기운이 느껴지면 사전에 정한 매뉴얼에 따라 주식을 팔고 현금으로 피신합니다.',
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
    tagline: '불안한 기운을 촉으로 감지하고 소중한 원금을 피신시키는 수호자',
    description: '시장의 이상한 소문이나 불안한 분위기를 남들보다 빠르게 감지하고, 손실을 보기 전에 발을 빼서 소중한 원금을 지키는 타입입니다.',
    recommendedStrategy: '위험 감지 시 부분 현금화, 리스크 관리 중심 유연 매매',
    suitableAssets: ['안정성 대형주', '배당 ETF', '파킹통장/현금'],
    badges: ['안전형 🛡️', '능동형 ⚡', '추세형 📈', '직감형 💡'],
    strengths: [
      '위험 상황을 미리 감지하는 빠른 순발력과 직관',
      '손실이 커지기 전에 빠르게 피신하여 원금을 지키는 태도',
      '복잡한 수치 공부 없이도 직관적으로 위험을 회피함',
    ],
    weaknesses: [
      '근거 없는 불안감이나 소문만 듣고 지레 겁먹어 주식을 팔아버림',
      '주식을 판 뒤 언제 다시 사야 할지 기준이 없어 상승 기회를 놓침',
      '시장의 좋은 소식조차 부정적으로 오해하기 쉬움',
    ],
    guidelines: {
      recommendation: '불안감이 들 때 감정적으로 팔지 말고, 숫자로 확인된 공시 수치만 점검하기',
      warning: '단순한 소문이나 근거 없는 소음에 속아 충동적으로 팔지 말 것',
    },
  },
  SPLR: {
    code: 'SPLR',
    name: '꾸준한 적립가',
    tagline: '안전한 비율로 주식을 모아두고 편안하게 일상에 몰입하는 적립가',
    description: '자산을 잃지 않는 안전한 자산 배분 비율을 정한 뒤, 주식 모으기 시스템을 갖춰두고 마음 편하게 본업과 일상생활에 집중하는 스타일입니다.',
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
    tagline: '시장의 소음에 귀 닫고 미국 대표 지수 주식을 사 모으는 투자자',
    description: '주식 뉴스나 차트를 복잡하게 보지 않고, 가장 마음이 편안한 미국 대표 지수 주식을 매달 적금 들듯 꾸준히 사 모으며 평화롭게 자산을 모아갑니다.',
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
    tagline: '경기 흐름에 맞춰 안전 자산과 현금 비중을 차분히 조율하는 조율사',
    description: '원금 보전을 기본으로 하되, 경기 분위기가 변할 때 사전에 정한 기준에 따라 저렴하게 살 자산과 현금의 비율을 차분히 조율합니다.',
    recommendedStrategy: '정량 자산배분 (LAA/VAA 보수형 모형), 주기적 비중 조절',
    suitableAssets: ['IEF (중기채)', 'BIL (단기채)', 'SPLG'],
    badges: ['안전형 🛡️', '수동형 🛋️', '추세형 📈', '원칙형 📐'],
    strengths: [
      '하락장에 현금으로 저렴하게 살 수 있는 유연한 기회 확보',
      '경기 변화에 맞춘 차분한 현금 및 자산 조율',
      '큰 손실 없이 소중한 자산을 지켜내는 안정감',
    ],
    weaknesses: [
      '경제 분위기 예측에 신경 쓰다가 시점을 잘못 잡아 기회를 놓침',
      '주식이 강하게 상승할 때 현금을 쥐고 있어 소외감을 느낌',
      '자산 비중을 자주 바꾸면 교체 비용과 세금이 소모됨',
    ],
    guidelines: {
      recommendation: '시장을 예측하려 하지 말고 정해둔 주기적 조율 원칙만 지키기',
      warning: '섣부른 개인적 추측으로 자산 비중을 너무 자주 바꾸지 말 것',
    },
  },
  SPTI: {
    code: 'SPTI',
    name: '안전지대 지킴이',
    tagline: '불안할 땐 언제든 통장으로 피신해 마음을 챙기는 지킴이',
    description: '평소에는 안전한 배당 주식이나 통장 이자로 돈을 모으다가, 시장이 조금이라도 과열되거나 불안해지면 즉시 현금으로 피신해 마음의 평화를 챙깁니다.',
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