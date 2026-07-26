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
    question: '주식 구매 시 내가 기대하는 연간 목표 수익률은 어느 정도인가요?',
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
    question: '지수의 움직임을 2배, 3배로 추종하는 레버리지 상품에 대해 어떻게 생각하나요?',
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
    question: '신기술이나 신생 기업이 등장했을 때 주식 구매 스타일은?',
    leftLabel: '수익성이 검증된 안정적인 대형주 위주로 골라 산다',
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
    question: '하루 만에 주가가 10% 이상 요동칠 때 나의 반응은?',
    leftLabel: '불안해서 자꾸 계좌를 열어보고 스트레스를 받는다',
    rightLabel: '주식 시장의 자연스러운 일이라며 담담하다',
  },
  {
    id: 9,
    axis: 'GS',
    question: '주식 판매 시 내가 기대하는 이익의 크기는?',
    leftLabel: '소소하고 확실한 이익을 정기적으로 실현하는 것',
    rightLabel: '몇 배 이상의 큰 대박 수익을 끌어내는 것',
  },
  {
    id: 10,
    axis: 'GS',
    question: '자산 배분 시 국가 채권이나 국채 ETF에 대한 생각은?',
    leftLabel: '자산을 지키기 위해 포트폴리오에 반드시 넣어야 한다',
    rightLabel: '수익률을 갉아먹기 때문에 가급적 배제한다',
  },

  // --- 2. [실행 축] A (분석형 - Active) vs P (시스템형 - Passive) : 10문항 ---
  {
    id: 11,
    axis: 'AP',
    question: '기업의 재무제표나 기업 분석 보고서를 읽는 것에 대해 어떻게 느끼나요?',
    leftLabel: '머리 아프고 복잡해서 자동으로 정립해 주는 시스템이 좋다',
    rightLabel: '데이터를 직접 파헤치고 분석하는 과정이 흥미롭다',
  },
  {
    id: 12,
    axis: 'AP',
    question: '나의 주식 구매 및 투자 관리 방식은 어떤 쪽에 가깝나요?',
    leftLabel: '매월 정해진 날짜에 알아서 사지는 적립/자동화 방식',
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
    question: '개별 기업 주식과 지수 추종 ETF 중 어느 쪽을 선호하나요?',
    leftLabel: '시장 전체에 투자해 신경 쓸 일이 적은 지수 ETF',
    rightLabel: '더 높은 성과를 낼 수 있는 뛰어난 개별 기업 주식',
  },
  {
    id: 17,
    axis: 'AP',
    question: '포트폴리오의 비중을 다시 맞추는(리밸런싱) 작업에 대한 생각은?',
    leftLabel: '알고리즘이나 예약 주문으로 알아서 처리되면 좋겠다',
    rightLabel: '내 판단에 따라 종목 비율을 직접 계산하고 조절한다',
  },
  {
    id: 18,
    axis: 'AP',
    question: '주식 관련 유튜버나 전문가의 추천 종목을 접했을 때 나의 행동은?',
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
    question: '주식 시장이 급격하게 움직일 때 나의 매매 회전율은?',
    leftLabel: '추세나 기회에 맞춰 주식 판매와 구매를 자주 수행한다',
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
    rightLabel: '역사적으로 결국 우상향했으므로 싼값에 더 구매한다',
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
    question: '주식을 구매하기 전에 나만의 명확한 매매 수식이나 룰이 정해져 있나요?',
    leftLabel: '시장의 분위기와 느낌, 직관적 확신에 따라 결정한다',
    rightLabel: '손절가, 목표가, 비율 등 미리 정해둔 룰이 반드시 있다',
  },
  {
    id: 32,
    axis: 'RI',
    question: '예상치 못한 폭락장이 왔을 때 나를 움직이게 만드는 것은?',
    leftLabel: '지금이 바닥이라는 감각과 뉴스 기사의 뉘앙스',
    rightLabel: '과거 백테스팅 수치와 사전에 준비한 매뉴얼',
  },
  {
    id: 33,
    axis: 'RI',
    question: '내가 정해둔 손절 기준선(-10% 등)에 도달했을 때 나의 행동은?',
    leftLabel: '조금 더 기다리면 회복될 것 같아 직감으로 더 견뎌본다',
    rightLabel: '감정을 배제하고 기계적으로 주식을 판매한다',
  },
  {
    id: 34,
    axis: 'RI',
    question: '새로운 종목을 발굴할 때 나에게 더 강한 확신을 주는 것은?',
    leftLabel: '제품을 직접 써본 경험이나 세상의 변화에 대한 체감',
    rightLabel: '수치로 검증된 백테스팅 결과와 통계 데이터',
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
    rightLabel: '과거 데이터로 백테스터를 돌려 가설을 먼저 검증한다',
  },
  {
    id: 38,
    axis: 'RI',
    question: '시장에 파란불(하락)이 가득할 때 어떤 기분이 드나요?',
    leftLabel: '직감적으로 어디가 기회인지 눈여겨본다',
    rightLabel: '원칙대로만 이행하면 문제없다며 무감정하게 임한다',
  },
  {
    id: 39,
    axis: 'RI',
    question: '주식 매매 버튼을 누르는 순간 나의 상태는?',
    leftLabel: '대박이 나길 바라는 마음과 승부사의 긴장감',
    rightLabel: '루틴화된 작업을 처리하는 담담한 컴퓨터 상태',
  },
  {
    id: 40,
    axis: 'RI',
    question: '투자 성과를 개선하고 싶을 때 가장 먼저 수정하는 것은?',
    leftLabel: '시장을 바라보는 나의 인사이트와 트렌드 감각',
    rightLabel: '매매 수식, 조건문, 리밸런싱 수치 알고리즘',
  },
];

// 16 Personality Profile Definitions
export const PERSONALITY_PROFILES: Record<string, PersonalityProfile> = {
  // G-Axis (Growth)
  GALR: {
    code: 'GALR',
    name: '퀀트 트레이더',
    tagline: '데이터와 수식으로 거침없이 시장을 씹어먹는 공격적 원칙주의자',
    description: '수익 극대화를 지향하면서도 엄격한 수식과 백테스팅 데이터를 바탕으로 기계적으로 매매합니다. 감정에 흔들리지 않고 공격적인 정량 전략을 실행하는 퀀트형 투자자입니다.',
    recommendedStrategy: '빅테크 모멘텀 백테스팅, 듀얼 모멘텀 전략, 조건식 자동매매',
    suitableAssets: ['QQQ', 'TQQQ', '고성장 개별주', '퀀트 포트폴리오'],
    badges: ['공격형 🚀', '분석형 📊', '장기형 ⏳', '원칙형 📐'],
  },
  GALI: {
    code: 'GALI',
    name: '직관적 승부사',
    tagline: '스스로 분석한 확신이 들면 거침없이 올인하는 야생의 투자가',
    description: '기업에 대한 깊은 직접 분석과 탁월한 시장 감각을 결합해 승부수를 던집니다. 강한 확신이 드는 주식에 과감하게 집중 투자하는 스타일입니다.',
    recommendedStrategy: '주력 개별주 집중 투자, 딥다이브 기업 분석, 주식 구매 후 성과 추적',
    suitableAssets: ['주력 혁신 기업주', 'NVDA', 'TSLA', '테마 대장주'],
    badges: ['공격형 🚀', '분석형 📊', '장기형 ⏳', '직감형 💡'],
  },
  GTLR: {
    code: 'GTLR',
    name: '모멘텀 추적자',
    tagline: '시장 추세와 수급 원칙에 따라 빠르게 기회를 포착하는 공격파',
    description: '수급과 가격 추세의 정량적 규칙을 바탕으로 빠르게 시장 기회를 포착합니다. 단기/중기 변동성을 수익으로 전환하는 정밀한 트레이더입니다.',
    recommendedStrategy: '상대 모멘텀 전략, 이동평균선 돌파 매매, 단기 리밸런싱',
    suitableAssets: ['SOXX', '레버리지 ETF', '수급 상위 개별주'],
    badges: ['공격형 🚀', '분석형 📊', '추세형 ⚡', '원칙형 📐'],
  },
  GTLI: {
    code: 'GTLI',
    name: '트렌드 스나이퍼',
    tagline: '시장의 가장 뜨거운 트렌드에 과감하게 탑승하는 감각파',
    description: '세상의 변화와 테마의 흐름을 누구보다 빠르게 감지합니다. 뜨거운 트렌드에 순발력 있게 탑승해 고수익을 낚아채는 트레이딩 감각이 뛰어납니다.',
    recommendedStrategy: '핫 테마주 순환매, 주도주 단기 추세 매매, 이슈 대응',
    suitableAssets: ['신성장 섹터 ETF', '주도 테마 개별주', '암호화폐'],
    badges: ['공격형 🚀', '분석형 📊', '추세형 ⚡', '직감형 💡'],
  },
  GPLR: {
    code: 'GPLR',
    name: '강철의 알고리즘',
    tagline: '레버리지나 고수익 자산을 정해진 룰로 무감정하게 리밸런싱하는 자산가',
    description: '높은 수익률을 목표로 하면서도 일상의 번거로움을 줄이기 위해 엄격한 자동 시스템에 투자를 맡깁니다. 변동성 폭풍 속에서도 정해진 룰을 기계처럼 수호합니다.',
    recommendedStrategy: '변동성 조절 알고리즘, 정기 정량 리밸런싱, 레버리지 적립식 투자',
    suitableAssets: ['TQQQ / UPRO', '지수 ETF 백테스트 포트폴리오'],
    badges: ['공격형 🚀', '시스템형 🤖', '장기형 ⏳', '원칙형 📐'],
  },
  GPLI: {
    code: 'GPLI',
    name: '비전 항해사',
    tagline: '미래 기술과 성장 가능성을 믿고 장기 시스템을 구축하는 비전가',
    description: '미래를 바꿀 기술과 거대한 시대적 흐름에 투자합니다. 세세한 매매보다는 큰 비전을 믿고 장기 자동 적립식으로 원금을 크게 불려 나갑니다.',
    recommendedStrategy: '미래 기술 지수 적립식 투자, 장기 성장 ETF 매월 구매',
    suitableAssets: ['QQQ', 'SCHG', 'AI/반도체 테마 ETF'],
    badges: ['공격형 🚀', '시스템형 🤖', '장기형 ⏳', '직감형 💡'],
  },
  GPTR: {
    code: 'GPTR',
    name: '전략적 기동대',
    tagline: '시장 변화 신호가 올 때만 시스템 스위치를 켜는 스마트 공격파',
    description: '평소에는 자동화된 전략으로 자산을 운용하다가, 시장의 특정 신호가 발생하면 수식 룰에 따라 기동성 있게 포트폴리오 비중을 재조정합니다.',
    recommendedStrategy: '동적 자산 배분(VAA/DAA), 신호 기반 현금/주식 전환',
    suitableAssets: ['공격형 동적 ETF 포트폴리오', 'QQQ / TLT'],
    badges: ['공격형 🚀', '시스템형 🤖', '추세형 ⚡', '원칙형 📐'],
  },
  GPTI: {
    code: 'GPTI',
    name: '모험가',
    tagline: '시장의 파도를 감각적으로 타며 고수익을 노리는 스피드형',
    description: '복잡한 분석에 얽매이기보다 시장의 흐름과 직관적 감각에 따라 스피디하게 움직입니다. 높은 변동성을 기회로 활용하는 과감한 모험가 스타일입니다.',
    recommendedStrategy: '스윙 매매, 시장 과매도 시 직관적 매수, 단기 랠리 활용',
    suitableAssets: ['고변동성 개별주', '레버리지 상품'],
    badges: ['공격형 🚀', '시스템형 🤖', '추세형 ⚡', '직감형 💡'],
  },

  // S-Axis (Safety)
  SALR: {
    code: 'SALR',
    name: '수학자 자산가',
    tagline: '철저한 백테스팅과 통계로 원금을 단단히 지키는 자산 방어군',
    description: '원금 보전과 안정적 성장을 최고 가치로 두고, 철저한 통계적 데이터 분석을 통해 위험을 완벽히 통제합니다. 수학적 정밀함으로 자산을 지켜냅니다.',
    recommendedStrategy: '올웨더/영구 포트폴리오 백테스팅, 상관관계 최소화 자산 배분',
    suitableAssets: ['VT', 'BND', 'GLD (금)', '배당 성장의 대형주'],
    badges: ['방어형 🛡️', '분석형 📊', '장기형 ⏳', '원칙형 📐'],
  },
  SALI: {
    code: 'SALI',
    name: '신중한 탐색가',
    tagline: '돌다리도 100번 두드려보고 확신이 설 때만 차분히 움직이는 사람',
    description: '위험 요소를 극도로 경계하며, 직접 꼼꼼히 조사하고 확실한 명분이 생겼을 때만 우량 자산을 중심으로 안전하게 투자합니다.',
    recommendedStrategy: '고배당 우량주 분석 및 장기 보유, 안전 이익 구조 검증',
    suitableAssets: ['배당 귀족주 (KO, PG)', 'SCHD', '단기 국채'],
    badges: ['방어형 🛡️', '분석형 📊', '장기형 ⏳', '직감형 💡'],
  },
  STLR: {
    code: 'STLR',
    name: '위험 감지 마스터',
    tagline: '악재 신호가 뜨면 누구보다 빠르게 현금 비중을 늘리는 방어 전문가',
    description: '위험 지표와 수식 룰을 모니터링하다가 시장 이상 징후가 감지되면 즉시 기계적으로 안전자산이나 현금으로 피신하는 방어형 정량 트레이더입니다.',
    recommendedStrategy: '하락장 마켓 타이밍 룰, 이동평균 하회 시 현금화 전략',
    suitableAssets: ['USFR (단기채)', 'S&P500 Index', '현금성 자산'],
    badges: ['방어형 🛡️', '분석형 📊', '추세형 ⚡', '원칙형 📐'],
  },
  STLI: {
    code: 'STLI',
    name: '촉 좋은 파수꾼',
    tagline: '시장 분위기가 이상하면 직감적으로 손실을 방어해 내는 감각파',
    description: '시장의 불안정한 기류나 위기 징후를 감각적으로 빠르게 포착합니다. 손실이 커지기 전에 직관적으로 위험을 회피해 자산을 안전하게 보존합니다.',
    recommendedStrategy: '위험 감지 시 부분 현금화, 리스크 관리 중심 유연 매매',
    suitableAssets: ['안정성 대형주', '배당 ETF', '파킹통장/현금'],
    badges: ['방어형 🛡️', '분석형 📊', '추세형 ⚡', '직감형 💡'],
  },
  SPLR: {
    code: 'SPLR',
    name: '올웨더 파수꾼 (★ 가장 대중적)',
    tagline: '단 1%의 원금 손실도 싫어해 자동 자산 배분만 돌려놓고 일상에 집중하는 사람',
    description: '투자 스트레스 없이 마음 편하게 자산을 지키는 것을 최우선으로 합니다. 주식, 채권, 원자재 등에 자동 분산 투자하여 밤에 편안히 잠드는 스타일입니다.',
    recommendedStrategy: '올웨더 자동 정기 리밸런싱, 60/40 자산 배분 적립',
    suitableAssets: ['AOA', 'RPAR', 'SPY + AGG 분산 포트폴리오'],
    badges: ['방어형 🛡️', '시스템형 🤖', '장기형 ⏳', '원칙형 📐'],
  },
  SPLI: {
    code: 'SPLI',
    name: '평화로운 수호자',
    tagline: '마음에 평화를 주는 안전한 지수 ETF를 사두고 잊고 사는 사람',
    description: '시장의 복잡한 매매 대신 세상에서 가장 안전하고 검증된 대표 지수 ETF를 매달 정기적으로 모아갑니다. 차트를 거의 보지 않고 일상에 집중합니다.',
    recommendedStrategy: 'S&P 500 / 미국 전체 시장 ETF 매월 정량 자동 구매',
    suitableAssets: ['VOO', 'SPLG', 'VTI'],
    badges: ['방어형 🛡️', '시스템형 🤖', '장기형 ⏳', '직감형 💡'],
  },
  SPTR: {
    code: 'SPTR',
    name: '스마트 가드',
    tagline: '거시경제 사이클에 맞춰 안전자산 비중을 조절하는 보수파',
    description: '기본적으로 자산을 지키는 것을 목표로 하되, 정해진 매크로 수식 룰에 따라 주기적으로 안전자산과 위험자산의 비중을 능동적으로 리밸런싱합니다.',
    recommendedStrategy: '정량 자산배분 (LAA/VAA 보수형 모형), 주기적 비중 조절',
    suitableAssets: ['IEF (중기채)', 'BIL (단기채)', 'SPLG'],
    badges: ['방어형 🛡️', '시스템형 🤖', '추세형 ⚡', '원칙형 📐'],
  },
  SPTI: {
    code: 'SPTI',
    name: '안전지대 항해사',
    tagline: '평소엔 조심스럽지만 시장 과열 시 빠르게 발을 빼는 방어파',
    description: '평소에는 안전한 자산 위주로 운용하다가, 시장 과열이나 위험 체감이 커지면 직감적으로 안전지대로 빠르게 발을 빼는 신중한 항해사입니다.',
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
