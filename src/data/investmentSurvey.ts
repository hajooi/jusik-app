export interface Question {
  id: number;
  axis: 'GS' | 'AP' | 'LT' | 'RI'; // GS: Growth/Safety, AP: Active/Passive, LT: Long-term/Tactical, RI: Rule/Intuitive
  question: string;
  leftLabel: string;  // Score 1 direction (e.g. Safety, Passive, Tactical, Intuitive)
  rightLabel: string; // Score 5 direction (e.g. Growth, Active, Long-term, Rule)
}

export interface PersonalityProfile {
  code: string;
  name: string;
  tagline: string;
  description: string;
  recommendedStrategy: string;
  suitableAssets: string[];
  badges: string[];
}

// 40 Questions (10 per Axis) - Written in easy Korean & compliance with terminology rules
export const QUESTIONS: Question[] = [
  // --- 1. [목표 축] G (공격형 - Growth) vs S (방어형 - Safety) : 10문항 ---
  {
    id: 1,
    axis: 'GS',
    question: '주식 시장이 좋지 않아서 내 자산이 -20% 손실을 보고 있다면 나의 심정은?',
    leftLabel: '원금이 깎여서 밤에 잠을 잘 수 없다',
    rightLabel: '더 싸게 살 수 있는 기회라 생각하고 설렌다',
  },
  {
    id: 2,
    axis: 'GS',
    question: '투자할 때 내가 기대하는 연간 목표 수익률은 어느 정도인가요?',
    leftLabel: '은행 이자보다 조금 높은 5~8%면 충분하다',
    rightLabel: '위험을 감수하더라도 연 20% 이상 큰 수익을 원한다',
  },
  {
    id: 3,
    axis: 'GS',
    question: '투자를 할 때 가장 두려운 상황은 무엇인가요?',
    leftLabel: '열심히 모은 원금이 손실 나는 것',
    rightLabel: '남들은 다 돈을 버는데 나만 기회를 놓치는 것',
  },
  {
    id: 4,
    axis: 'GS',
    question: '움직임을 2배, 3배로 추종하는 레버리지 상품에 대해 어떻게 생각하나요?',
    leftLabel: '위험성이 너무 커서 쳐다보지도 않는다',
    rightLabel: '수익률을 극대화하기 위해 적극적으로 활용한다',
  },
  {
    id: 5,
    axis: 'GS',
    question: '내 전체 투자 자산 중 비상금이나 현금의 비중은 어느 정도가 적당한가요?',
    leftLabel: '안전을 위해 최소 30% 이상은 늘 현금으로 둔다',
    rightLabel: '현금은 최소한만 두고 거의 100% 주식을 구매한다',
  },
  {
    id: 6,
    axis: 'GS',
    question: '신기술이나 신생 기업이 등장했을 때 투자 스타일은?',
    leftLabel: '수익성이 검증된 안정적인 대형 기업 위주로 골라 산다',
    rightLabel: '변동성이 크더라도 변혁을 이끄는 신성장 기업에 투자한다',
  },
  {
    id: 7,
    axis: 'GS',
    question: '투자할 종목을 고를 때 더 눈여겨보는 지표는 무엇인가요?',
    leftLabel: '부채 비율, 배당 수익률 등 기업의 단단함',
    rightLabel: '매출 성장률, 미래 시장 점유율 확장 가능성',
  },
  {
    id: 8,
    axis: 'GS',
    question: '하루 만에 내 주식이 10% 이상 요동칠 때 나의 반응은?',
    leftLabel: '불안해서 자꾸 계좌를 열어보고 스트레스를 받는다',
    rightLabel: '주식 시장의 자연스러운 일이라며 담담하다',
  },
  {
    id: 9,
    axis: 'GS',
    question: '주식을 팔 때 내가 기대하는 이익의 크기는?',
    leftLabel: '소소하고 확실한 이익을 정기적으로 실현하는 것',
    rightLabel: '몇 배 이상의 큰 대박 수익을 끌어내는 것',
  },
  {
    id: 10,
    axis: 'GS',
    question: '자산 배분 시 채권에 대한 생각은?',
    leftLabel: '자산을 지키기 위해 포트폴리오에 반드시 넣어야 한다',
    rightLabel: '수익률을 갉아먹기 때문에 가급적 배제한다',
  },

  // --- 2. [실행 축] A (분석형 - Active) vs P (시스템형 - Passive) : 10문항 ---
  {
    id: 11,
    axis: 'AP',
    question: '기업의 재무제표나 기업 분석 보고서를 읽는 것에 대해 어떻게 느끼나요?',
    leftLabel: '머리 아프고 복잡하다',
    rightLabel: '데이터를 직접 파헤치고 분석하는 과정이 흥미롭다',
  },
  {
    id: 12,
    axis: 'AP',
    question: '나의 투자 관리 방식은 어떤 쪽에 가깝나요?',
    leftLabel: '매월 정해진 날짜에 사는 적립 방식',
    rightLabel: '내가 직접 시장 상황을 보고 타이밍을 판단해 사는 방식',
  },
  {
    id: 13,
    axis: 'AP',
    question: '주식 매매 일지나 투자 기록을 직접 작성하는 편인가요?',
    leftLabel: '귀찮고 번거로워서 굳이 쓰지 않는다',
    rightLabel: '이유와 기록을 꼼꼼하게 메모하고 나중에 복기한다',
  },
  {
    id: 14,
    axis: 'AP',
    question: '하루 중 주식 차트나 관련 뉴스를 찾아보는 시간은 얼마나 되나요?',
    leftLabel: '며칠에 한 번 보거나 아예 안 볼 때도 많다',
    rightLabel: '매일 장 시작 전후로 뉴스 및 시세를 꼼꼼히 확인한다',
  },
  {
    id: 15,
    axis: 'AP',
    question: '투자 관련 서적이나 강좌를 찾아보고 공부하는 편인가요?',
    leftLabel: '필요한 핵심만 쉽고 짧게 정리된 것을 본다',
    rightLabel: '수식, 백테스팅, 지표까지 깊이 있게 파고들어 공부한다',
  },
  {
    id: 16,
    axis: 'AP',
    question: '개별 기업 주식과 ETF(여러 기업을 함께 투자하는 상품) 중 어느 쪽을 선호하나요?',
    leftLabel: '시장 전체에 투자해 신경 쓸 일이 적은 지수 ETF',
    rightLabel: '더 높은 성과를 낼 수 있는 뛰어난 개별 기업 주식',
  },
  {
    id: 17,
    axis: 'AP',
    question: '투자 자산의 비중을 다시 맞추는(리밸런싱) 작업에 대한 생각은?',
    leftLabel: '날짜를 정하여 처리한다',
    rightLabel: '내 판단에 따라 종목 비율을 직접 계산하고 조절한다',
  },
  {
    id: 18,
    axis: 'AP',
    question: '주식 관련 전문가의 추천 종목을 접했을 때 나의 행동은?',
    leftLabel: '검증된 지표나 유명 ETF 위주라면 믿고 편안하게 사둔다',
    rightLabel: '내가 직접 재무상태와 차트를 검증하기 전엔 사지 않는다',
  },
  {
    id: 19,
    axis: 'AP',
    question: '투자 활동이 내 본업이나 일상생활에 미치는 영향은?',
    leftLabel: '일상에 전혀 방해되지 않도록 최소한의 시간만 쓰고 싶다',
    rightLabel: '투자는 또 하나의 취미이자 본업만큼 즐거운 일이다',
  },
  {
    id: 20,
    axis: 'AP',
    question: '수십 개 기업의 실적 발표 기간이 다가오면 어떤 생각이 드나요?',
    leftLabel: '신경 쓸 일이 늘어나 피곤하다',
    rightLabel: '기업의 성적표를 비교하고 아이디어를 얻을 기회라 흥분된다',
  },

  // --- 3. [시간 축] L (장기 보유 - Long-term) vs T (단기 추세 - Tactical) : 10문항 ---
  {
    id: 21,
    axis: 'LT',
    question: '내가 주식을 한 번 구매하면 얼마나 오래 보유하길 원하나요?',
    leftLabel: '몇 달 안에 수익을 내고 유연하게 움직이고 싶다',
    rightLabel: '최소 3~5년 이상 묵혀두며 복리 효과를 누리고 싶다',
  },
  {
    id: 22,
    axis: 'LT',
    question: '주식 시장이 급격하게 움직일 때 나의 투자 방법은?',
    leftLabel: '추세나 기회에 맞춰 주식을 자주 사고판다',
    rightLabel: '시장의 파도에 상관없이 묵묵히 샀던 주식을 보유한다',
  },
  {
    id: 23,
    axis: 'LT',
    question: '금리 인상, 환율 급등 같은 거시 경제 뉴스가 나올 때 나의 반응은?',
    leftLabel: '뉴스를 보고 빠르게 현금 비중이나 종목을 교체한다',
    rightLabel: '단기 소음으로 여기고 장기 계획에 따라 보유를 유지한다',
  },
  {
    id: 24,
    axis: 'LT',
    question: '내가 구매한 주식이 한 달 만에 30% 급등했을 때 나의 선택은?',
    leftLabel: '이익을 빠르게 확정 짓고 주식을 판매한다',
    rightLabel: '기업의 장기 가치가 변하지 않았다면 계속 가져간다',
  },
  {
    id: 25,
    axis: 'LT',
    question: '주식 거래 수수료나 세금에 대해 어떻게 생각하나요?',
    leftLabel: '기회를 포착해 수익을 내는 것이 세금 절약보다 더 중요하다',
    rightLabel: '잦은 거래는 세금과 수수료로 자산을 갉아먹으므로 피한다',
  },
  {
    id: 26,
    axis: 'LT',
    question: '시장 타이밍(싼 가격에 사고 높은 가격에 팔기)을 잡는 것에 대한 생각은?',
    leftLabel: '차트와 추세를 잘 읽으면 타이밍을 맞출 수 있다',
    rightLabel: '타이밍을 맞추는 것은 불가능하므로 꾸준히 모아가는 게 정답이다',
  },
  {
    id: 27,
    axis: 'LT',
    question: '주식 계좌의 실적 평가 주기는 얼마가 적당하다고 생각하나요?',
    leftLabel: '매일 혹은 매주 단위로 수익률을 체크한다',
    rightLabel: '최소 연 단위 이상 긴 호흡으로 성과를 바라본다',
  },
  {
    id: 28,
    axis: 'LT',
    question: '세계 경제 위기 소식이 들려올 때 나의 행동 방식은?',
    leftLabel: '재빠르게 주식을 판매해 손실을 줄이고 현금을 확보한다',
    rightLabel: '역사적으로 결국 상승했으므로 싼값에 더 구매한다',
  },
  {
    id: 29,
    axis: 'LT',
    question: '인기 있는 테마주나 최근 뜨는 주식에 대한 관심도는?',
    leftLabel: '시장의 뜨거운 수급과 트렌드가 있는 곳에 빠르게 탑승한다',
    rightLabel: '일시적인 유행보다는 10년 뒤에도 살아남을 주식을 찾는다',
  },
  {
    id: 30,
    axis: 'LT',
    question: '투자 결과를 얻기까지 견딜 수 있는 최대 기다림의 기간은?',
    leftLabel: '6개월 이내에 결과가 나와야 답답하지 않다',
    rightLabel: '10년 이상이라도 큰 열매를 맺는다면 기꺼이 기다린다',
  },

  // --- 4. [심리 축] R (원칙형 - Rule-based) vs I (직감형 - Intuitive) : 10문항 ---
  {
    id: 31,
    axis: 'RI',
    question: '투자하기 전에 나만의 명확한 규칙이 정해져 있나요?',
    leftLabel: '시장의 분위기와 느낌, 직관적 확신에 따라 결정한다',
    rightLabel: '투자하는 이유, 투자 비율 등 미리 정해둔 규칙이 반드시 있다',
  },
  {
    id: 32,
    axis: 'RI',
    question: '예상치 못한 폭락장이 왔을 때 나를 움직이게 만드는 것은?',
    leftLabel: '지금이 바닥이라는 감각과 뉴스 기사의 뉘앙스',
    rightLabel: '과거 성적 분석과 사전에 준비한 매뉴얼',
  },
  {
    id: 33,
    axis: 'RI',
    question: '내가 정해둔 손실 기준선(-10% 등)에 도달했을 때 나의 행동은?',
    leftLabel: '조금 더 기다리면 회복될 것 같아 직감으로 더 견뎌본다',
    rightLabel: '감정을 배제하고 기계적으로 주식을 판다',
  },
  {
    id: 34,
    axis: 'RI',
    question: '새로운 종목을 발굴할 때 나에게 더 강한 확신을 주는 것은?',
    leftLabel: '제품을 직접 써본 경험이나 세상의 변화에 대한 체감',
    rightLabel: '수치로 검증된 결과와 통계 데이터',
  },
  {
    id: 35,
    axis: 'RI',
    question: '투자에서 가장 경계해야 할 위험은 무엇이라고 생각하나요?',
    leftLabel: '융통성 없이 고집을 피우다가 기회를 놓치는 것',
    rightLabel: '원칙 없이 감정에 휘둘려 충동적으로 주식을 사고 파는 것',
  },
  {
    id: 36,
    axis: 'RI',
    question: '포트폴리오 비중을 결정할 때 어떤 공식을 사용하나요?',
    leftLabel: '그때그때 더 자신 있는 종목에 감으로 비중을 싣는다',
    rightLabel: '동일 비중이나 자산 배분 산식(모형)에 맞춰 정확히 나눈다',
  },
  {
    id: 37,
    axis: 'RI',
    question: '투자 아이디어가 떠올랐을 때 나의 첫 번째 단계는?',
    leftLabel: '느낌이 좋을 때 바로 소액이라도 구매해 본다',
    rightLabel: '과거 데이터로 테스트해보고 가설을 검증한다',
  },
  {
    id: 38,
    axis: 'RI',
    question: '시장이 폭락할 때 어떤 기분이 드나요?',
    leftLabel: '직감적으로 어디가 기회인지 눈여겨본다',
    rightLabel: '원칙대로만 이행하면 문제없다며 무감정하게 임한다',
  },
  {
    id: 39,
    axis: 'RI',
    question: '주식 매매 버튼을 누르는 순간 나의 상태는?',
    leftLabel: '시장을 바라보는 나의 인사이트와 트렌드 등의 공부',
    rightLabel: '루틴화된 작업을 처리하는 담담한 컴퓨터 상태',
  },
  {
    id: 40,
    axis: 'RI',
    question: '투자 성과를 개선하고 싶을 때 가장 먼저 수정하는 것은?',
    leftLabel: '시장을 바라보는 감각과 트렌드 공부',
    rightLabel: '투자 규칙, 전략 조건, 비율 계산 방식',
  },
];

// 16 Personality Profile Definitions
export const PERSONALITY_PROFILES: Record<string, PersonalityProfile> = {
  // G-Axis (Growth - 공격형)
  GALR: {
    code: 'GALR',
    name: '데이터 분석가',
    tagline: '재무제표와 수치 데이터로 원칙에 맞게 종목을 고르는 공격파',
    description: '재무제표와 수치 데이터를 철저히 분석하고 정해진 투자 원칙에 따라 고수익 목표 종목을 침착하게 발굴하는 정량적 분석가입니다.',
    recommendedStrategy: '빅테크 모멘텀 백테스팅, 듀얼 모멘텀 전략, 조건식 자동매매',
    suitableAssets: ['QQQ', 'TQQQ', '고성장 개별주', '퀀트 포트폴리오'],
    badges: ['공격형 🚀', '분석형 📊', '장기형 ⏳', '원칙형 📐'],
  },
  GALI: {
    code: 'GALI',
    name: '직관적 승부사',
    tagline: '스스로 분석해서 확신이 들면 거침없이 비중을 실어 투자하는 사람',
    description: '스스로 시장과 기업을 철저하게 분석한 뒤 확신이 서는 순간 승부처에서 거침없이 자산 비중을 실어 성과를 이끌어내는 승부사 유형입니다.',
    recommendedStrategy: '주력 개별주 집중 투자, 딥다이브 기업 분석, 주식 구매 후 성과 추적',
    suitableAssets: ['주력 혁신 기업주', 'NVDA', 'TSLA', '테마 대장주'],
    badges: ['공격형 🚀', '분석형 📊', '장기형 ⏳', '직감형 💡'],
  },
  GTLR: {
    code: 'GTLR',
    name: '추세 추적자',
    tagline: '시장의 수급과 차트 흐름 원칙에 따라 신속하게 기회를 잡는 사람',
    description: '시장의 수급과 차트 추세 원칙을 정밀하게 모니터링하여 타이밍이 다가왔을 때 신속하고 정확하게 기회를 잡는 트레이딩 전문가입니다.',
    recommendedStrategy: '상대 모멘텀 전략, 이동평균선 돌파 매매, 단기 리밸런싱',
    suitableAssets: ['SOXX', '레버리지 ETF', '수급 상위 개별주'],
    badges: ['공격형 🚀', '분석형 📊', '추세형 ⚡', '원칙형 📐'],
  },
  GTLI: {
    code: 'GTLI',
    name: '트렌드 스나이퍼',
    tagline: '지금 가장 뜨거운 산업과 주도주에 과감하게 탑승하는 감각파',
    description: '현재 가장 주목받는 산업과 주도주 트렌드를 미세하게 감지하여 과감하고 빠르게 탑승해 시장 수익을 극대화하는 감각파 스타일입니다.',
    recommendedStrategy: '핫 테마주 순환매, 주도주 단기 추세 매매, 이슈 대응',
    suitableAssets: ['신성장 섹터 ETF', '주도 테마 개별주', '암호화폐'],
    badges: ['공격형 🚀', '분석형 📊', '추세형 ⚡', '직감형 💡'],
  },
  GPLR: {
    code: 'GPLR',
    name: '원칙주의 자산가',
    tagline: '고수익 자산을 미리 정해둔 비율대로만 담고 기계적으로 운용하는 사람',
    description: '높은 수익을 목표로 하는 고성장 자산을 정해진 적립 산식과 비율대로 담아두고, 시장의 소음에 흔들리지 않고 기계적으로 운용합니다.',
    recommendedStrategy: '변동성 조절 알고리즘, 정기 정량 리밸런싱, 레버리지 적립식 투자',
    suitableAssets: ['TQQQ / UPRO', '지수 ETF 백테스트 포트폴리오'],
    badges: ['공격형 🚀', '시스템형 🤖', '장기형 ⏳', '원칙형 📐'],
  },
  GPLI: {
    code: 'GPLI',
    name: '성장주 항해사',
    tagline: '미래 성장 가능성이 높은 지수나 기업을 사서 진득하게 가져가는 사람',
    description: '미래 성장 가능성이 높고 유망한 대표 지수나 기술 기업을 정기적으로 적립 구매한 뒤, 긴 시간 동안 진득하게 믿고 결실을 기다립니다.',
    recommendedStrategy: '미래 기술 지수 적립식 투자, 장기 성장 ETF 매월 구매',
    suitableAssets: ['QQQ', 'SCHG', 'AI/반도체 테마 ETF'],
    badges: ['공격형 🚀', '시스템형 🤖', '장기형 ⏳', '직감형 💡'],
  },
  GPTR: {
    code: 'GPTR',
    name: '전략적 기동대',
    tagline: '시장에 변화 신호가 올 때만 미리 정한 기준대로 움직이는 스마트 공격파',
    description: '평상시에는 시스템으로 운용하다가 시장의 변화 신호가 포착되면 사전에 정한 정량 기준에 따라서만 신속하게 포트폴리오를 스위칭합니다.',
    recommendedStrategy: '동적 자산 배분(VAA/DAA), 신호 기반 현금/주식 전환',
    suitableAssets: ['공격형 동적 ETF 포트폴리오', 'QQQ / TLT'],
    badges: ['공격형 🚀', '시스템형 🤖', '추세형 ⚡', '원칙형 📐'],
  },
  GPTI: {
    code: 'GPTI',
    name: '스피드 모험가',
    tagline: '시장 흐름을 감각적으로 빠르게 타고 내리며 수익을 노리는 사람',
    description: '단기적인 시장 파도와 수급 흐름을 순발력 있게 타고 내려 과감하게 고수익 기회를 노리는 직관적 스피드형 스타일입니다.',
    recommendedStrategy: '스윙 매매, 시장 과매도 시 직관적 매수, 단기 랠리 활용',
    suitableAssets: ['고변동성 개별주', '레버리지 상품'],
    badges: ['공격형 🚀', '시스템형 🤖', '추세형 ⚡', '직감형 💡'],
  },

  // S-Axis (Safety - 방어형)
  SALR: {
    code: 'SALR',
    name: '통계 방어군',
    tagline: '과거 수치와 통계로 검증된 확실한 자산에만 신중히 투자하는 사람',
    description: '철저히 과거 데이터와 검증된 통계 수치에 기반하여 위험 요인을 완벽히 제거하고, 손실 없는 확실한 자산 위주로 신중히 관리합니다.',
    recommendedStrategy: '올웨더/영구 포트폴리오 백테스팅, 상관관계 최소화 자산 배분',
    suitableAssets: ['VT', 'BND', 'GLD (금)', '배당 성장의 대형주'],
    badges: ['방어형 🛡️', '분석형 📊', '장기형 ⏳', '원칙형 📐'],
  },
  SALI: {
    code: 'SALI',
    name: '신중한 탐색가',
    tagline: '돌다리도 100번 두드려보고 확실히 아는 종목에만 조심스럽게 투자하는 사람',
    description: '위험을 극도로 철저히 경계하고, 본인이 직접 알아보고 100번 검증하여 확신할 수 있는 안전한 기업에만 조심스럽게 투자하는 방어형입니다.',
    recommendedStrategy: '고배당 우량주 분석 및 장기 보유, 안전 이익 구조 검증',
    suitableAssets: ['배당 귀족주 (KO, PG)', 'SCHD', '단기 국채'],
    badges: ['방어형 🛡️', '분석형 📊', '장기형 ⏳', '직감형 💡'],
  },
  STLR: {
    code: 'STLR',
    name: '위험 감지 마스터',
    tagline: '악재 신호나 시장 하락이 보이면 미리 정한 기준대로 현금을 확보하는 사람',
    description: '시장의 위험 징후나 하락 신호가 감지되면 망설임 없이 사전 매뉴얼 기준에 따라 자산을 안전자산 및 현금으로 기계적으로 전환합니다.',
    recommendedStrategy: '하락장 마켓 타이밍 룰, 이동평균 하회 시 현금화 전략',
    suitableAssets: ['USFR (단기채)', 'S&P500 Index', '현금성 자산'],
    badges: ['방어형 🛡️', '분석형 📊', '추세형 ⚡', '원칙형 📐'],
  },
  STLI: {
    code: 'STLI',
    name: '촉 좋은 파수꾼',
    tagline: '시장 분위기가 수상하면 직감적으로 위험을 피하고 보는 감각파',
    description: '시장의 이상 기류나 위험 소식을 뛰어난 직감으로 신속하게 감지해 손실을 입기 전에 스스로 발을 빼고 자산을 피신시키는 파수꾼입니다.',
    recommendedStrategy: '위험 감지 시 부분 현금화, 리스크 관리 중심 유연 매매',
    suitableAssets: ['안정성 대형주', '배당 ETF', '파킹통장/현금'],
    badges: ['방어형 🛡️', '분석형 📊', '추세형 ⚡', '직감형 💡'],
  },
  SPLR: {
    code: 'SPLR',
    name: '올웨더 수호자',
    tagline: '원금 손실을 최소화하는 비중을 딱 정해두고 마음 편히 일상에 집중하는 사람',
    description: '원금 손실 위험을 차단하는 정교한 자산 배분 비중을 미리 정해둔 뒤, 투자로 인한 스트레스 없이 마음 편하게 본업과 일상에 몰입합니다.',
    recommendedStrategy: '올웨더 자동 정기 리밸런싱, 60/40 자산 배분 적립',
    suitableAssets: ['AOA', 'RPAR', 'SPY + AGG 분산 포트폴리오'],
    badges: ['방어형 🛡️', '시스템형 🤖', '장기형 ⏳', '원칙형 📐'],
  },
  SPLI: {
    code: 'SPLI',
    name: '평화로운 투자자',
    tagline: '마음 편한 지수 ETF나 안전자산을 사두고 잊고 사는 평화주의자',
    description: '가장 마음이 편안한 지수 ETF나 안정적인 우량 자산을 매달 편안하게 모아두고 일상의 평화를 누리는 가장 여유로운 투자자입니다.',
    recommendedStrategy: 'S&P 500 / 미국 전체 시장 ETF 매월 정량 자동 구매',
    suitableAssets: ['VOO', 'SPLG', 'VTI'],
    badges: ['방어형 🛡️', '시스템형 🤖', '장기형 ⏳', '직감형 💡'],
  },
  SPTR: {
    code: 'SPTR',
    name: '스마트 가드',
    tagline: '거시경제 분위기에 맞춰 안전자산과 현금 비중을 조절하는 보수파',
    description: '거시경제와 매크로 지표의 흐름을 보며 안전자산과 현금의 적정 비중을 시스템적으로 철저히 맞추어 나가는 보수적 수호자 스타일입니다.',
    recommendedStrategy: '정량 자산배분 (LAA/VAA 보수형 모형), 주기적 비중 조절',
    suitableAssets: ['IEF (중기채)', 'BIL (단기채)', 'SPLG'],
    badges: ['방어형 🛡️', '시스템형 🤖', '추세형 ⚡', '원칙형 📐'],
  },
  SPTI: {
    code: 'SPTI',
    name: '안전지대 피신가',
    tagline: '평소엔 조심스럽게 투자하다가 위험해 보이면 빠르게 발을 빼는 방어파',
    description: '평소에는 신중하고 안정적인 자산 위주로 차분히 투자를 진행하다가, 과열이나 위험 징후가 느껴지면 빠르게 현금화해 안전지대로 이동합니다.',
    recommendedStrategy: '안전지수 ETF 중심 운용 + 시장 과열 체감 시 현금 확보',
    suitableAssets: ['SCHD', 'SHY (단기채)', 'CMA/현금'],
    badges: ['방어형 🛡️', '시스템형 🤖', '추세형 ⚡', '직감형 💡'],
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
