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
    question: '주식 시장이 폭락해 내 계좌가 20% 하락했다면 어떤 기분이 드나요?',
    leftLabel: '불안해서 잠이 안 온다',
    rightLabel: '더 싸게 살 수 있는 기회라 설렌다',
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
    question: '지수 움직임의 2배, 3배를 추종하는 레버리지 상품에 대해 어떻게 생각하나요?',
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
    question: '포트폴리오를 구성할 때 안전자산에 대한 생각은 어떤가요?',
    leftLabel: '원금을 지키기 위해 포트폴리오에 반드시 넣어야 한다',
    rightLabel: '전체 수익률을 갉아먹으므로 가급적 뺀다',
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
    question: '개별 기업 주식과 지수 ETF(여러 기업을 한 번에 사는 상품으로 더 안정적임) 중 어느 쪽을 더 선호하나요?',
    leftLabel: '신경 쓸 일이 적은 지수 ETF',
    rightLabel: '더 높은 성과를 기대할 수 있는 개별 기업 주식',
  },
  {
    id: 17,
    axis: 'AP',
    question: '자산 비중을 다시 맞추는 리밸런싱 작업은 어떻게 진행하나요?',
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
    leftLabel: '몇 달 안에 수익을 내고 유연하게 바꾸고 싶다',
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
    question: '금리나 환율 등 거시 경제 뉴스가 크게 다뤄질 때 어떻게 행동하나요?',
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
    leftLabel: '6개월 이내에는 결과가 나와야 답답하지 않다',
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
    question: '포트폴리오의 종목별 비중은 어떤 기준으로 정하나요?',
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
    tagline: '기업 수치와 데이터로 원칙에 맞게 고르는 수익파',
    description: '실적 수치를 직접 파헤쳐 확신을 얻고, 미리 정해둔 기준과 규칙에 따라 높은 수익을 기대할 수 있는 곳을 차분히 모아가는 분석파입니다.',
    recommendedStrategy: '빅테크 모멘텀 백테스팅, 듀얼 모멘텀 전략, 조건식 자동매매',
    suitableAssets: ['QQQ', 'TQQQ', '고성장 개별주', '퀀트 포트폴리오'],
    badges: ['수익형 🚀', '능동형 ⚡', '장기형 ⏳', '원칙형 📐'],
    guidelines: {
      recommendation: '분석한 데이터를 믿고 정해둔 기준대로 차분하게 이어나가세요.',
      warning: '너무 완벽한 데이터만 찾다가 좋은 시작 기회를 놓치지 마세요.',
    },
  },
  GALI: {
    code: 'GALI',
    name: '직관적 승부사',
    tagline: '직접 분석해서 확신이 들면 거침없이 크게 돈을 넣는 사람',
    description: '기업을 꼼꼼히 공부한 뒤, "이거다" 싶은 확실한 느낌이 드는 순간 망설임 없이 크게 돈을 실어 승부를 거는 유형입니다.',
    recommendedStrategy: '주력 개별주 집중 투자, 딥다이브 기업 분석, 주식 구매 후 성과 추적',
    suitableAssets: ['주력 혁신 기업주', 'NVDA', 'TSLA', '테마 대장주'],
    badges: ['수익형 🚀', '능동형 ⚡', '장기형 ⏳', '직감형 💡'],
    guidelines: {
      recommendation: '확실한 근거가 있을 때만 신중하게 자금 비중을 늘리세요.',
      warning: '지나친 자신감으로 한곳에 지나치게 많은 돈을 몰아넣지 마세요.',
    },
  },
  GATR: {
    code: 'GATR',
    name: '추세 추적자',
    tagline: '시장의 흐름과 기회 원칙에 따라 신속하게 움직이는 사람',
    description: '시장 흐름이 정해둔 사기 좋은 기준에 들어맞을 때만 신속하게 사고, 흐름이 꺾이면 미련 없이 정리에 나서는 신속파입니다.',
    recommendedStrategy: '상대 모멘텀 전략, 이동평균선 돌파 매매, 단기 리밸런싱',
    suitableAssets: ['SOXX', '레버리지 ETF', '수급 상위 개별주'],
    badges: ['수익형 🚀', '능동형 ⚡', '추세형 📈', '원칙형 📐'],
    guidelines: {
      recommendation: '시장 흐름이 꺾였을 때는 정해둔 기준대로 미련 없이 정리하세요.',
      warning: '이미 크게 오른 뒤 뒤늦게 감정적으로 따라 들어가지 마세요.',
    },
  },
  GATI: {
    code: 'GATI',
    name: '트렌드 스나이퍼',
    tagline: '지금 가장 뜨거운 산업과 인기 기업에 과감하게 올라타는 감각파',
    description: '시장에서 가장 빠르게 떠오르는 유행이나 인기 기업을 감각적으로 포착해, 상승 흐름이 강할 때 과감하게 합류해 수익을 노립니다.',
    recommendedStrategy: '핫 테마주 순환매, 주도주 단기 추세 매매, 이슈 대응',
    suitableAssets: ['신성장 섹터 ETF', '주도 테마 개별주', '암호화폐'],
    badges: ['수익형 🚀', '능동형 ⚡', '추세형 📈', '직감형 💡'],
    guidelines: {
      recommendation: '유행이 살아있을 때 빠르게 수익을 챙기고 나오는 깔끔함이 필요합니다.',
      warning: '이미 열기가 식어버린 유행에 미련을 두고 오래 잡고 있지 마세요.',
    },
  },
  GPLR: {
    code: 'GPLR',
    name: '원칙주의 자산가',
    tagline: '고수익 자산을 미리 정해둔 비율대로만 담고 기계적으로 운용하는 사람',
    description: '일일이 기업을 찾아보지 않고 고수익을 기대할 수 있는 자산을 미리 정한 비율대로만 계좌에 담아둔 뒤, 감정을 빼고 규칙대로만 챙깁니다.',
    recommendedStrategy: '변동성 조절 알고리즘, 정기 정량 리밸런싱, 레버리지 적립식 투자',
    suitableAssets: ['TQQQ / UPRO', '지수 ETF 백테스트 포트폴리오'],
    badges: ['수익형 🚀', '수동형 🛋️', '장기형 ⏳', '원칙형 📐'],
    guidelines: {
      recommendation: '미리 정해둔 비율과 규칙을 끝까지 기계적으로 지키세요.',
      warning: '단기적인 시장 오르내림에 마음이 흔들려 정해둔 비율을 깨지 마세요.',
    },
  },
  GPLI: {
    code: 'GPLI',
    name: '성장주 항해사',
    tagline: '미래 성장 가능성이 높은 유망 기업을 사서 진득하게 가져가는 사람',
    description: '매일 가격 변화를 보지 않고, "앞으로 세상의 중심이 될 분야"라는 믿음 하나로 유망한 기업이나 상품을 사두고 긴 시간 진득하게 결실을 기다립니다.',
    recommendedStrategy: '미래 기술 지수 적립식 투자, 장기 성장 ETF 매월 구매',
    suitableAssets: ['QQQ', 'SCHG', 'AI/반도체 테마 ETF'],
    badges: ['수익형 🚀', '수동형 🛋️', '장기형 ⏳', '직감형 💡'],
    guidelines: {
      recommendation: '세상의 변화를 믿고 긴 호흡으로 차분히 모아가세요.',
      warning: '일시적인 가격 하락에 겁을 먹고 너무 일찍 포기하지 마세요.',
    },
  },
  GPTR: {
    code: 'GPTR',
    name: '전략적 기동대',
    tagline: '시장에 변화 신호가 올 때만 미리 정한 기준대로 움직이는 기동파',
    description: '평소에는 일상에 집중하다가, 시장의 흐름이나 경제 분위기가 위험하거나 좋은 기회로 바뀔 때만 정해둔 기준대로 재빠르게 자산 비중을 바꿉니다.',
    recommendedStrategy: '동적 자산 배분(VAA/DAA), 신호 기반 현금/주식 전환',
    suitableAssets: ['공격형 동적 ETF 포트폴리오', 'QQQ / TLT'],
    badges: ['수익형 🚀', '수동형 🛋️', '추세형 📈', '원칙형 📐'],
    guidelines: {
      recommendation: '정해둔 신호나 기준이 올 때만 재빠르게 자산 비율을 바꾸세요.',
      warning: '아무 신호도 없는데 지루하다는 이유로 괜히 건드리지 마세요.',
    },
  },
  GPTI: {
    code: 'GPTI',
    name: '스피드 모험가',
    tagline: '시장 흐름을 감각적으로 빠르게 타고 내리며 수익을 노리는 사람',
    description: '복잡한 원칙이나 장기 보유 대신, 그때그때 시장의 뉴스나 짧은 가격의 오르내림을 감각적으로 타고 내리며 투자 결과를 즐기는 유형입니다.',
    recommendedStrategy: '스윙 매매, 시장 과매도 시 직관적 매수, 단기 랠리 활용',
    suitableAssets: ['고변동성 개별주', '레버리지 상품'],
    badges: ['수익형 🚀', '수동형 🛋️', '추세형 📈', '직감형 💡'],
    guidelines: {
      recommendation: '짧은 흐름을 타더라도 나름의 최소한의 기준선은 정해두세요.',
      warning: '단순한 순간 기분이나 흥분감으로 충동적인 선택을 하지 마세요.',
    },
  },

  // S-Axis (Safety)
  SALR: {
    code: 'SALR',
    name: '통계 방어군',
    tagline: '과거 데이터로 검증된 탄탄하고 안전한 자산에만 돈을 넣는 사람',
    description: '원금이 깎이는 걸 극도로 싫어해 과거 몇십 년간 위험이 적다고 증명된 탄탄한 자산 위주로만 원칙에 맞춰 안전하게 모아갑니다.',
    recommendedStrategy: '올웨더/영구 포트폴리오 백테스팅, 상관관계 최소화 자산 배분',
    suitableAssets: ['VT', 'BND', 'GLD (금)', '배당 성장의 대형주'],
    badges: ['안전형 🛡️', '능동형 ⚡', '장기형 ⏳', '원칙형 📐'],
    guidelines: {
      recommendation: '검증된 안전한 자산 위주로 차곡차곡 원금을 지켜가세요.',
      warning: '지나치게 안전만 따지다가 물가 상승률도 못 따라잡는 결과를 피하세요.',
    },
  },
  SALI: {
    code: 'SALI',
    name: '신중한 탐색가',
    tagline: '돌다리도 100번 두드려보고 확실히 아는 기업에만 조심스럽게 시작하는 사람',
    description: '본인이 직접 꼼꼼하게 조사해서 확실히 잘 아는 안전한 대기업만 고르고, 확신이 설 때만 차분하고 조심스럽게 모아가는 신중파입니다.',
    recommendedStrategy: '고배당 우량주 분석 및 장기 보유, 안전 이익 구조 검증',
    suitableAssets: ['배당 귀족주 (KO, PG)', 'SCHD', '단기 국채'],
    badges: ['안전형 🛡️', '능동형 ⚡', '장기형 ⏳', '직감형 💡'],
    guidelines: {
      recommendation: '내가 잘 알고 확신이 서는 안전한 대기업 위주로 시작하세요.',
      warning: '너무 고민만 하다가 아무것도 시작하지 못하는 상태를 경계하세요.',
    },
  },
  SATR: {
    code: 'SATR',
    name: '위험 감지 마스터',
    tagline: '하락 신호가 보이면 미리 정한 기준대로 현금을 확보하는 방어 전문가',
    description: '시장이 흔들리거나 위험 기운이 보이면 망설이지 않고 사전에 정해둔 기준에 따라 자산을 안전하게 현금으로 바꿔 피신시킵니다.',
    recommendedStrategy: '하락장 마켓 타이밍 룰, 이동평균 하회 시 현금화 전략',
    suitableAssets: ['USFR (단기채)', 'S&P500 Index', '현금성 자산'],
    badges: ['안전형 🛡️', '능동형 ⚡', '추세형 📈', '원칙형 📐'],
    guidelines: {
      recommendation: '위험 기운이 보일 땐 정해둔 매뉴얼대로 안전하게 현금화하세요.',
      warning: '작은 소문이나 일시적인 흔들림에도 매번 놀라 발을 빼지 마세요.',
    },
  },
  SATI: {
    code: 'SATI',
    name: '촉 좋은 파수꾼',
    tagline: '시장 분위기가 수상하면 직감적으로 위험을 피하고 보는 감각파',
    description: '시장의 이상 기류나 위험 소식을 뛰어난 촉으로 가장 먼저 감지하고, 손실을 입기 전에 스스로 발을 빼서 원금을 지켜내는 타입입니다.',
    recommendedStrategy: '위험 감지 시 부분 현금화, 리스크 관리 중심 유연 매매',
    suitableAssets: ['안정성 대형주', '배당 ETF', '파킹통장/현금'],
    badges: ['안전형 🛡️', '능동형 ⚡', '추세형 📈', '직감형 💡'],
    guidelines: {
      recommendation: '이상 기류를 느꼈을 때 빠르게 현금을 확보해 원금을 지키세요.',
      warning: '단순한 근거 없는 소문이나 불안감에 지레 겁먹고 움직이지 마세요.',
    },
  },
  SPLR: {
    code: 'SPLR',
    name: '안전자산 수호자',
    tagline: '원금 손실을 줄이는 비중을 딱 정해두고 마음 편히 일상에 집중하는 사람',
    description: '자산을 잃지 않는 비율로 딱 나누어 세팅해 두고, 정해둔 날짜에만 비율을 맞춰준 뒤 마음 편하게 본업과 일상을 즐깁니다.',
    recommendedStrategy: '올웨더 자동 정기 리밸런싱, 60/40 자산 배분 적립',
    suitableAssets: ['AOA', 'RPAR', 'SPY + AGG 분산 포트폴리오'],
    badges: ['안전형 🛡️', '수동형 🛋️', '장기형 ⏳', '원칙형 📐'],
    guidelines: {
      recommendation: '나누어 둔 안전 비율을 유지하며 마음 편히 일상에 몰입하세요.',
      warning: '남들이 큰 돈을 벌었다는 소식에 흔들려 안전 비율을 무수수 깨지 마세요.',
    },
  },
  SPLI: {
    code: 'SPLI',
    name: '평화로운 투자자',
    tagline: '마음 편한 안전 자산을 사두고 잊고 사는 평화주의자',
    description: '복잡한 뉴스나 가격 변화는 신경 끄고, 마음이 가장 편안한 안전한 자산을 매달 꾸준히 사 모으며 평화롭게 자산을 모아갑니다.',
    recommendedStrategy: 'S&P 500 / 미국 전체 시장 ETF 매월 정량 자동 구매',
    suitableAssets: ['VOO', 'SPLG', 'VTI'],
    badges: ['안전형 🛡️', '수동형 🛋️', '장기형 ⏳', '직감형 💡'],
    guidelines: {
      recommendation: '신경 쓸 일 없는 안전한 자산을 매달 편안하게 모아가세요.',
      warning: '계좌를 너무 방치해서 내 자산이 지금 어떤 상태인지 아예 잊지는 마세요.',
    },
  },
  SPTR: {
    code: 'SPTR',
    name: '스마트 가드',
    tagline: '시장 분위기와 경제 흐름에 맞춰 안전자산과 현금 비중을 조절하는 보수파',
    description: '기본적인 자산 지키기를 최우선으로 하되, 경제 상황이 좋아지거나 나빠질 때 미리 정해둔 기준에 맞춰 안전한 자산과 현금의 비중을 조절합니다.',
    recommendedStrategy: '정량 자산배분 (LAA/VAA 보수형 모형), 주기적 비중 조절',
    suitableAssets: ['IEF (중기채)', 'BIL (단기채)', 'SPLG'],
    badges: ['안전형 🛡️', '수동형 🛋️', '추세형 📈', '원칙형 📐'],
    guidelines: {
      recommendation: '경제 흐름 변화에 맞춰 안전자산과 현금 비중을 차분히 조절하세요.',
      warning: '섣부른 예측으로 너무 자주 자산 비중을 왔다 갔다 하지 마세요.',
    },
  },
  SPTI: {
    code: 'SPTI',
    name: '안전지대 피신가',
    tagline: '평소엔 조심스럽게 돈을 모으다가 위험해 보이면 빠르게 발을 빼는 방어파',
    description: '평소에는 안전한 자산 위주로 조심스럽게 모아가다가, 과열이나 위험 기운이 느껴지면 즉시 현금이나 통장으로 옮겨 마음 편한 상태를 만듭니다.',
    recommendedStrategy: '안전지수 ETF 중심 운용 + 시장 과열 체감 시 현금 확보',
    suitableAssets: ['SCHD', 'SHY (단기채)', 'CMA/현금'],
    badges: ['안전형 🛡️', '수동형 🛋️', '추세형 📈', '직감형 💡'],
    guidelines: {
      recommendation: '불안할 때는 언제든 현금이나 통장으로 피신해 마음을 챙기세요.',
      warning: '항상 안전지대에만 웅크려 있다가 자산을 키울 기회를 아예 놓치지 마세요.',
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