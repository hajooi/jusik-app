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

// 40 Questions (10 per Axis) - 쉬운 존댓말 표현 및 직관적 라벨 교정
export const QUESTIONS: Question[] = [
  // --- 1. [목표 축] G (수익형 - Growth) vs S (안전형 - Safety) : 10문항 ---
  {
    id: 1,
    axis: 'GS',
    question: '주식 시장이 폭락해 내 계좌가 20% 하락했을 때 내 반응은?',
    leftLabel: '매우 불안하고 스트레스를 받는다',
    rightLabel: '덤덤하거나 주식을 더 살 기회로 여긴다',
  },
  {
    id: 2,
    axis: 'GS',
    question: '투자 시 목표로 하는 연간 목표 수익률은 어느 정도인가요?',
    leftLabel: '은행 이자보다 조금 높은 연 5~8%면 충분하다',
    rightLabel: '위험을 감수하더라도 연 20% 이상 큰 수익을 원한다',
  },
  {
    id: 3,
    axis: 'GS',
    question: '투자를 하면서 가장 두려운 상황은 무엇인가요?',
    leftLabel: '힘들게 모은 원금이 손실 나는 상황',
    rightLabel: '남들은 다 돈 버는데 나만 기회를 놓치는 상황',
  },
  {
    id: 4,
    axis: 'GS',
    question: '2배, 3배로 수익이나 손실이 커지는 고위험 상품(레버리지)에 대해 어떻게 생각하나요?',
    leftLabel: '위험이 너무 커서 쳐다보지도 않는다',
    rightLabel: '수익률을 극대화하기 위해 적극적으로 활용한다',
  },
  {
    id: 5,
    axis: 'GS',
    question: '전체 투자 자산 중 현금의 비중은 어느 정도가 적당하다고 생각하나요?',
    leftLabel: '안전을 위해 최소 30% 이상은 현금으로 둔다',
    rightLabel: '현금은 최소한만 두고 거의 100% 주식을 사둔다',
  },
  {
    id: 6,
    axis: 'GS',
    question: '세상을 바꿀 신기술이 등장했을 때 어떻게 행동하나요?',
    leftLabel: '신기술 대신 이미 검증된 큰 기업 위주로 산다',
    rightLabel: '변동성이 크더라도 높은 성장이 기대되는 신기술에 투자한다',
  },
  {
    id: 7,
    axis: 'GS',
    question: '투자할 종목을 고를 때 어떤 지표를 더 눈여겨보나요?',
    leftLabel: '부채 비율, 배당 등 기업의 재무적 안정성',
    rightLabel: '매출 성장률, 미래 시장 점유율의 확장 가능성',
  },
  {
    id: 8,
    axis: 'GS',
    question: '내가 가진 주식이 하루 만에 10% 이상 폭락한다면 어떤가요?',
    leftLabel: '불안해서 자꾸 계좌를 열어보고 스트레스를 받는다',
    rightLabel: '주식 시장의 자연스러운 일이라며 담담하다',
  },
  {
    id: 9,
    axis: 'GS',
    question: '주식으로 얻고 싶은 이익의 크기는 어느 정도인가요?',
    leftLabel: '소소하고 확실한 이익을 짧은 주기로 챙기는 것',
    rightLabel: '오래 기다리더라도 몇 배 이상의 큰 수익을 내는 것',
  },
  {
    id: 10,
    axis: 'GS',
    question: '내 투자 포트폴리오에 금이나 채권 같은 안전자산을 포함시키는 것에 대해 어떻게 생각하나요?',
    leftLabel: '원금을 지키기 위해 안전자산을 비중 있게 꼭 넣어야 한다',
    rightLabel: '수익률을 높이기 위해 주식/성장자산 위주로 채우는 것이 좋다',
  },

  // --- 2. [실행 축] A (능동형 - Active) vs P (수동형 - Passive) : 10문항 ---
  {
    id: 11,
    axis: 'AP',
    question: '기업 재무제표나 기업 분석 보고서를 읽는 것을 어떻게 느끼나요?',
    leftLabel: '머리 아프고 복잡해서 피하고 싶다',
    rightLabel: '데이터를 직접 파헤치고 분석하는 과정이 흥미롭다',
  },
  {
    id: 12,
    axis: 'AP',
    question: '선호하는 투자 방식은 어느 쪽에 가깝나요?',
    leftLabel: '정기적으로 일정 금액을 고민 없이 사는 방식',
    rightLabel: '시장 상황과 타이밍을 직접 판단해서 사는 방식',
  },
  {
    id: 13,
    axis: 'AP',
    question: '매매 일지나 나만의 투자 기록을 작성하는 편인가요?',
    leftLabel: '귀찮고 번거로워서 굳이 쓰지 않는다',
    rightLabel: '투자 이유와 기록을 꼼꼼히 적고 복기한다',
  },
  {
    id: 14,
    axis: 'AP',
    question: '하루 중 주식 뉴스나 관련 정보, 시세를 찾아보는 시간은 얼마나 되나요?',
    leftLabel: '며칠에 한 번 보거나 거의 안 본다',
    rightLabel: '매일 장 시작 전후로 시세와 뉴스를 꼼꼼히 확인한다',
  },
  {
    id: 15,
    axis: 'AP',
    question: '투자 관련 책이나 강의로 공부할 때 어떤 방식을 좋아하나요?',
    leftLabel: '핵심 요약만 쉽고 짧게 정리된 내용을 좋아한다',
    rightLabel: '수식, 백테스트, 지표까지 깊이 있게 파고드는 내용을 좋아한다',
  },
  {
    id: 16,
    axis: 'AP',
    question: '개별 기업 주식과 지수 ETF(여러 기업을 한 번에 사는 상품) 중 어느 쪽을 더 선호하나요?',
    leftLabel: '신경 쓸 일이 적은 지수 ETF',
    rightLabel: '더 높은 성과를 기대할 수 있는 개별 기업 주식',
  },
  {
    id: 17,
    axis: 'AP',
    question: '자산 비중을 정기적으로 다시 맞추는 작업(리밸런싱)은 어떻게 진행하나요?',
    leftLabel: '정해둔 정기 주기(분기/연간)에 맞춰 처리한다',
    rightLabel: '내 판단에 따라 종목 비율을 직접 계산하고 조절한다',
  },
  {
    id: 18,
    axis: 'AP',
    question: '전문가나 유명인이 추천하는 종목을 알게 되었을 때 어떻게 하나요?',
    leftLabel: '신뢰할 수 있는 전문가나 유명한 종목이라면 믿고 산다',
    rightLabel: '내가 직접 재무제표와 차트를 검증하기 전엔 사지 않는다',
  },
  {
    id: 19,
    axis: 'AP',
    question: '투자 활동이 본업이나 일상생활에 미치는 영향에 대해 어떻게 생각하나요?',
    leftLabel: '일상에 방해되지 않도록 최소한의 시간만 쓰고 싶다',
    rightLabel: '투자는 본업만큼이나 즐겁고 적극적으로 할 만한 가치가 있다',
  },
  {
    id: 20,
    axis: 'AP',
    question: '기업들의 실적 발표 시즌이 다가오면 어떤 생각이 드나요?',
    leftLabel: '신경 써야 할 정보가 늘어나 피곤하게 느껴진다',
    rightLabel: '성적표를 비교하고 새로운 투자 기회를 찾을 생각에 설렌다',
  },

  // --- 3. [시간 축] L (장기형 - Long-term) vs T (추세형 - Tactical) : 10문항 ---
  {
    id: 21,
    axis: 'LT',
    question: '주식을 한 번 사면 어느 정도 기간 동안 보유하길 원하나요?',
    leftLabel: '몇 주 안에 수익을 내고 유연하게 바꾸고 싶다',
    rightLabel: '최소 3~5년 이상 들고 가며 복리 효과를 보고 싶다',
  },
  {
    id: 22,
    axis: 'LT',
    question: '주식 시장의 변동성이 급격히 커질 때 어떻게 대응하나요?',
    leftLabel: '트렌드와 기회에 맞춰 주식을 자주 사고판다',
    rightLabel: '시장의 파도와 상관없이 사둔 주식을 묵묵히 들고 간다',
  },
  {
    id: 23,
    axis: 'LT',
    question: '금리 인상이나 환율 변동 같은 대형 경제 뉴스가 나올 때 어떻게 행동하나요?',
    leftLabel: '뉴스를 보고 빠르게 현금이나 종목 비중을 교체하고 싶다',
    rightLabel: '단기 소음으로 여기고 원래의 장기 계획을 유지한다',
  },
  {
    id: 24,
    axis: 'LT',
    question: '내가 산 주식이 한 달 만에 30% 급등하면 어떻게 할 건가요?',
    leftLabel: '이익을 빠르게 확정 짓기 위해 판다',
    rightLabel: '기업의 가치가 변하지 않았다면 계속 들고 간다',
  },
  {
    id: 25,
    axis: 'LT',
    question: '주식 매매 시 발생하는 수수료나 세금에 대해 어떻게 생각하나요?',
    leftLabel: '좋은 기회를 잡아 수익을 내는 것이 수수료나 세금 절약보다 중요하다',
    rightLabel: '잦은 거래는 세금과 수수료로 자산을 갉아먹으므로 피해야 한다',
  },
  {
    id: 26,
    axis: 'LT',
    question: '바닥에 사고 고점에 파는 타이밍에 대해 어떻게 생각하나요?',
    leftLabel: '차트와 추세를 잘 분석하면 어느 정도 맞출 수 있다',
    rightLabel: '타이밍을 맞추는 건 불가능하므로 꾸준히 모아가는 게 정답이다',
  },
  {
    id: 27,
    axis: 'LT',
    question: '투자 성과를 평가하는 주기는 얼마가 적당하다고 보나요?',
    leftLabel: '매일 또는 매주 단위로 수익률을 체크한다',
    rightLabel: '최소 연 단위 이상 길게 보며 성과를 평가한다',
  },
  {
    id: 28,
    axis: 'LT',
    question: '세계 경제 위기나 하락장 소식이 들려올 때 어떻게 반응하나요?',
    leftLabel: '빠르게 주식을 팔아 현금을 확보하고 손실을 줄이고 싶다',
    rightLabel: '역사적으로 결국 회복했으므로 싼값에 더 사 모은다',
  },
  {
    id: 29,
    axis: 'LT',
    question: '유행하는 테마주나 급등주를 보면 어떤 생각이 드나요?',
    leftLabel: '수급과 트렌드가 살아있는 곳에 빠르게 올라타고 싶다',
    rightLabel: '일시적 유행보다는 10년 뒤에도 살아남을 종목에 집중하고 싶다',
  },
  {
    id: 30,
    axis: 'LT',
    question: '투자 결과를 얻기까지 얼마나 오래 기다릴 수 있나요?',
    leftLabel: '3개월 이내에는 결과가 나와야 답답하지 않다',
    rightLabel: '10년 이상 걸리더라도 큰 열매를 맺는다면 기꺼이 기다린다',
  },

  // --- 4. [심리 축] R (원칙형 - Rule-based) vs I (직감형 - Intuitive) : 10문항 ---
  {
    id: 31,
    axis: 'RI',
    question: '주식에 투자하기 전 나만의 기준이 정리되어 있나요?',
    leftLabel: '시장의 분위기와 직관적인 확신에 따라 결정한다',
    rightLabel: '투자 이유와 목표 비중 등 정해둔 규칙에 따라 결정한다',
  },
  {
    id: 32,
    axis: 'RI',
    question: '예상치 못한 폭락장이 올 때 나를 움직이게 만드는 것은 무엇인가요?',
    leftLabel: '지금이 바닥이라는 감각이나 주변 분위기',
    rightLabel: '사전에 준비해둔 매뉴얼과 과거 데이터',
  },
  {
    id: 33,
    axis: 'RI',
    question: '내가 정해둔 기준선(-10% 등)에 도달하면 어떻게 행동하나요?',
    leftLabel: '조금 더 기다리면 회복될 것 같아 감으로 더 견뎌본다',
    rightLabel: '감정을 배제하고 정해둔 원칙에 따라 대응한다',
  },
  {
    id: 34,
    axis: 'RI',
    question: '새로운 종목을 볼 때 어떤 점이 더 강한 확신을 주나요?',
    leftLabel: '제품을 직접 써본 경험이나 세상 변화에 대한 체감',
    rightLabel: '수치로 검증된 실적, 재무제표와 통계 데이터',
  },
  {
    id: 35,
    axis: 'RI',
    question: '투자에서 가장 경계해야 할 위험은 무엇이라고 생각하나요?',
    leftLabel: '융통성 없이 고집을 피우다가 좋은 기회를 놓치는 것',
    rightLabel: '원칙 없이 감정에 휘둘려 충동적으로 사고파는 것',
  },
  {
    id: 36,
    axis: 'RI',
    question: '투자 종목별 비중은 어떤 기준으로 정하나요?',
    leftLabel: '그때그때 더 자신 있는 종목에 비중을 더 싣는다',
    rightLabel: '자산 배분 공식에 맞춰 정확히 나눈다',
  },
  {
    id: 37,
    axis: 'RI',
    question: '투자 아이디어가 떠올랐을 때 가장 먼저 하는 행동은?',
    leftLabel: '소액이라도 일단 바로 사본다',
    rightLabel: '가설을 충분히 검증해 본다',
  },
  {
    id: 38,
    axis: 'RI',
    question: '주식 매매 버튼을 누르는 순간 나의 마음 상태는 어떤가요?',
    leftLabel: '내 인사이트와 감각이 맞기를 바라는 기대감이 크다',
    rightLabel: '미리 정해둔 정기 작업을 처리하는 담담한 상태다',
  },
  {
    id: 39,
    axis: 'RI',
    question: '투자 성과를 개선하고 싶을 때 가장 먼저 점검하는 것은 무엇인가요?',
    leftLabel: '시장을 바라보는 감각과 트렌드 공부',
    rightLabel: '투자 규칙, 전략 조건, 비중 계산 방식',
  },
  {
    id: 40,
    axis: 'RI',
    question: '나에게 더 잘 맞는 투자 스타일은 어느 쪽인가요?',
    leftLabel: '시장의 흐름에 따라 유연하고 기동성 있게 움직이는 스타일',
    rightLabel: '한번 정한 원칙을 어떤 상황에서도 끝까지 지키는 스타일',
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

// Calculate MBTI scores and percentages from 40 answers (each 1-5 score)
export function calculateSurveyResult(answers: Record<number, number>) {
  let scoreGS = 0; // 10 questions (id 1..10)
  let scoreAP = 0; // 10 questions (id 11..20)
  let scoreLT = 0; // 10 questions (id 21..30)
  let scoreRI = 0; // 10 questions (id 31..40)

  for (let i = 1; i <= 10; i++) scoreGS += answers[i] || 3;
  for (let i = 11; i <= 20; i++) scoreAP += answers[i] || 3;
  for (let i = 21; i <= 30; i++) scoreLT += answers[i] || 3;
  for (let i = 31; i <= 40; i++) scoreRI += answers[i] || 3;

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