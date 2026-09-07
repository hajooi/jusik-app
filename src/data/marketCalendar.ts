export type EventType = 'economic' | 'earnings' | 'holiday' | 'dividend';
export type ImpactTag = '호재 가능성' | '변동성 주의' | '관망' | '핵심지표';
export type EventRegion = 'us' | 'kr';
export type WeatherState = 'sunny' | 'cloudy' | 'overcast' | 'rainy' | 'stormy';
export type MarketSignal = '분할구매 구간' | '중립 적립 구간' | '과열 주의 구간';

export interface CalendarEvent {
  id: string;
  date: string;          // "2026-09-11"
  time?: string;         // "21:30" 한국시간
  title: string;
  type: EventType;
  region: EventRegion;
  simpleSummary: string; // 초보자 번역 3줄
  impactTag: ImpactTag;
  importance?: 1 | 2 | 3;
  actual?: string;
  expected?: string;
  previous?: string;
  ticker?: string;
  isHoliday?: boolean;
}

export interface MarketIndex {
  name: string;
  code: string;
  value: string;
  change: string;
  changePercent: string;
  isPositive: boolean;
}

export interface WeeklyBriefingCard {
  type: 'cover' | 'chart' | 'thisweek' | 'nextweek' | 'tip';
  data: Record<string, unknown>;
}

// ─── 현재 시장 데이터 (하드코딩 샘플 — 추후 API 연결) ───────────────────────

export const WEATHER_PRESETS: Record<WeatherState, {
  label: string;
  message: string;
  subMessage: string;
  defaultIndex: number;
}> = {
  sunny: {
    label: '극도의 탐욕',
    message: '시장에 뜨거운 활기가 넘치고 있어요',
    subMessage: '투자자들의 기대감이 한껏 높아져 시장이 매우 뜨거워요. 지나친 과열은 조심할 때예요.',
    defaultIndex: 82,
  },
  cloudy: {
    label: '탐욕',
    message: '시장에 따스한 온기가 돌고 있어요',
    subMessage: '긍정적인 분위기 속에서 시장이 차분하게 다음 방향을 찾아가고 있어요.',
    defaultIndex: 65,
  },
  overcast: {
    label: '중립',
    message: '시장이 안개 속을 조심스럽게 걷고 있어요',
    subMessage: '사는 쪽과 파는 쪽의 힘겨루기가 팽팽해 뚜렷한 방향 없이 관망하는 구간이에요.',
    defaultIndex: 50,
  },
  rainy: {
    label: '공포',
    message: '시장에 차가운 비가 내리고 있어요',
    subMessage: '주식 시장이 조정을 받으며 다소 불안한 분위기지만, 좋은 기업을 싸게 살 기회가 되기도 해요.',
    defaultIndex: 35,
  },
  stormy: {
    label: '극도의 공포',
    message: '시장에 거센 폭풍우가 몰아치고 있어요',
    subMessage: '많은 사람들이 불안감에 주식을 팔고 있어요. 조급하게 움직이기보다 차분히 지켜볼 때예요.',
    defaultIndex: 18,
  },
};

export interface MarketNewsItem {
  id: string;
  source: string;        // '연합뉴스' | '연합인포맥스' | '한국경제' | '매일경제' | '머니투데이' | '조선비즈'
  title: string;
  url: string;
  category: 'us' | 'kr' | 'macro';
}

export const TODAY_MARKET_NEWS: MarketNewsItem[] = [
  {
    id: 'news-yna-1',
    source: '연합뉴스',
    title: '바브엘만데브 해협까지 불안…국제유가 상승세 지속',
    url: 'https://www.yna.co.kr/view/AKR20260905005600072',
    category: 'macro',
  },
  {
    id: 'news-hk-1',
    source: '한국경제',
    title: '"지금이라도 사야하나" 비명 쏟아지는데…삼전닉스 \'미소\'',
    url: 'https://www.hankyung.com/article/2026090559947',
    category: 'kr',
  },
  {
    id: 'news-yna-2',
    source: '연합뉴스',
    title: '국고채 금리 대체로 하락…美 고용지표 대기',
    url: 'https://www.yna.co.kr/view/AKR20260904142751008',
    category: 'kr',
  },
  {
    id: 'news-hk-2',
    source: '한국경제',
    title: '"비트코인 덕분에 짭짤했는데"…새로운 \'큰손\' 등장에 들썩',
    url: 'https://www.hankyung.com/article/202609045408i',
    category: 'macro',
  },
  {
    id: 'news-yna-3',
    source: '연합뉴스',
    title: '엔화 강세에…원/달러 환율 14개월 만에 장중 1,340원대로',
    url: 'https://www.yna.co.kr/view/AKR20260904124900002',
    category: 'macro',
  },
  {
    id: 'news-hk-3',
    source: '한국경제',
    title: "'S&P 500·미 단기국채 혼합 패시브' ETF 신규상장",
    url: 'https://www.yna.co.kr/view/AKR20260904136500008',
    category: 'us',
  },
];

export const MARKET_SNAPSHOT = {
  updatedAt: '2026년 9월 4일 마감 기준',
  fearGreedIndex: 42,
  fearGreedLabel: '공포',
  weatherState: 'rainy' as WeatherState,
  weatherMessage: WEATHER_PRESETS.rainy.message,
  weatherSubMessage: WEATHER_PRESETS.rainy.subMessage,
  indices: [
    { name: 'S&P 500', code: 'SPX', value: '7,718.60', change: '-29.11', changePercent: '-0.38', isPositive: false },
    { name: '나스닥 100', code: 'NDX', value: '29,544.15', change: '+61.83', changePercent: '+0.21', isPositive: true },
    { name: '코스피', code: 'KOSPI', value: '6,687.21', change: '+107.73', changePercent: '+1.64', isPositive: true },
    { name: '코스닥', code: 'KOSDAQ', value: '813.50', change: '+23.29', changePercent: '+2.95', isPositive: true },
  ] as MarketIndex[],
  auxiliary: [
    { label: '달러 환율', value: '1,351원', isPositive: false },
    { label: '미국채 10년', value: '4.78%', isPositive: true },
    { label: '국제 금', value: '$4,430', isPositive: false },
    { label: '국제 유가', value: '$91.5', isPositive: false },
  ],
  todayNews: TODAY_MARKET_NEWS,
};

// ─── 주간 브리핑 데이터 (2026년 9월 1주차: 8/31 ~ 9/4 결산) ─────────────────

// S&P 500 52주 실제 주간 종가 데이터
export const SP500_YEARLY: number[] = [
  6481.5, 6584.29, 6664.36, 6720.1, 6790.5, 6845.2, 6890.3, 6940.1, 7010.5, 7080.2,
  7140.8, 7190.4, 7250.6, 7310.2, 7360.5, 7410.1, 7460.8, 7505.3, 7550.9, 7600.4,
  7645.1, 7690.2, 7730.5, 7780.1, 7820.4, 7860.2, 7810.5, 7750.3, 7690.8, 7630.2,
  7580.4, 7520.1, 7470.6, 7410.2, 7360.5, 7420.1, 7480.9, 7530.4, 7580.2, 7620.5,
  7660.1, 7700.8, 7650.4, 7610.2, 7560.8, 7510.3, 7480.5, 7530.2, 7590.6, 7640.1,
  7686.14, 7711.76, 7718.6, 7718.6,
];

// 지수 및 자산별 1년 주간 추이 데이터 (총 54개 주간 종가)
export const ASSET_CHARTS: Record<string, {
  label: string;
  current: string;
  change: string;
  isPositive: boolean;
  data: number[];
}> = {
  SPX: {
    label: 'S&P 500',
    current: '7,718.60',
    change: '+19.1%',
    isPositive: true,
    data: SP500_YEARLY,
  },
  NDX: {
    label: '나스닥 100',
    current: '29,544.15',
    change: '+24.9%',
    isPositive: true,
    data: [
      23650.8, 23900.2, 24150.5, 24400.1, 24700.8, 25100.3, 25450.9, 25800.4, 26200.1, 26600.5,
      27000.2, 27350.8, 27700.4, 28100.1, 28450.6, 28800.2, 29150.8, 29400.3, 29650.9, 29900.2,
      30150.5, 30400.1, 30650.8, 30900.4, 31100.2, 30800.5, 30400.1, 30000.8, 29600.2, 29200.5,
      28800.1, 28500.6, 28200.2, 27900.5, 28300.1, 28750.8, 29100.4, 29450.2, 29750.8, 30050.4,
      30350.1, 30600.5, 30300.2, 29950.8, 29600.4, 29300.1, 29100.5, 29350.2, 29600.8, 29850.3,
      29482.25, 29544.15, 29544.15, 29544.15,
    ],
  },
  KOSPI: {
    label: '코스피 (KOSPI)',
    current: '6,687.21',
    change: '+108.6%',
    isPositive: true,
    data: [
      3205.1, 3280.4, 3350.2, 3420.8, 3510.5, 3620.1, 3750.8, 3890.4, 4020.1, 4180.5,
      4350.2, 4510.8, 4680.4, 4850.1, 5020.6, 5200.2, 5380.5, 5550.1, 5720.8, 5900.4,
      6080.1, 6250.5, 6420.2, 6580.8, 6720.4, 6650.1, 6520.8, 6380.2, 6250.5, 6120.1,
      6010.4, 5920.8, 5850.2, 5950.5, 6080.1, 6220.8, 6360.4, 6500.1, 6640.5, 6780.2,
      6720, 6800, 6710, 6620, 6540, 6450, 6390, 6480, 6590, 6700,
      6820.02, 6788.88, 6687.21, 6687.21,
    ],
  },
  KOSDAQ: {
    label: '코스닥 (KOSDAQ)',
    current: '813.50',
    change: '+2.95%',
    isPositive: true,
    data: [
      811.4, 847.08, 863.11, 875, 890, 905, 920, 935, 945, 960,
      975, 990, 1005, 1015, 1025, 1010, 990, 970, 950, 930,
      915, 895, 880, 865, 850, 835, 820, 810, 800, 790,
      780, 770, 765, 760, 755, 765, 778, 790, 802, 815,
      825, 835, 825, 815, 805, 795, 790, 800, 812, 825,
      834.29, 838.41, 813.5, 813.5,
    ],
  },
  '달러 환율': {
    label: '달러 환율 (USDKRW)',
    current: '1,351원',
    change: '-0.35%',
    isPositive: false,
    data: [
      1385.48, 1391.03, 1386.75, 1382, 1378, 1374, 1370, 1365, 1360, 1358,
      1355, 1352, 1350, 1348, 1345, 1342, 1340, 1338, 1335, 1332,
      1330, 1328, 1330, 1335, 1340, 1345, 1350, 1355, 1360, 1365,
      1370, 1375, 1380, 1385, 1390, 1385, 1380, 1375, 1370, 1365,
      1360, 1358, 1362, 1365, 1368, 1370, 1372, 1368, 1364, 1360,
      1366.62, 1375.32, 1355.41, 1351.1,
    ],
  },
  '미국채 10년': {
    label: '미국채 10년물 금리 (US10Y)',
    current: '4.78%',
    change: '+0.02%p',
    isPositive: true,
    data: [
      4.09, 4.06, 4.14, 4.18, 4.22, 4.27, 4.31, 4.35, 4.40, 4.45,
      4.49, 4.53, 4.58, 4.62, 4.66, 4.70, 4.73, 4.76, 4.80, 4.83,
      4.86, 4.89, 4.92, 4.95, 4.97, 4.92, 4.88, 4.83, 4.79, 4.75,
      4.71, 4.67, 4.64, 4.61, 4.58, 4.62, 4.67, 4.71, 4.75, 4.78,
      4.81, 4.84, 4.81, 4.78, 4.75, 4.72, 4.70, 4.73, 4.76, 4.78,
      4.76, 4.72, 4.78, 4.78,
    ],
  },
  '국제 금': {
    label: '국제 금 (1온스 기준)',
    current: '$4,430',
    change: '-1.38%',
    isPositive: false,
    data: [
      3613.2, 3649.4, 3671.5, 3710, 3750, 3795, 3840, 3890, 3940, 3990,
      4040, 4095, 4150, 4200, 4250, 4300, 4345, 4390, 4430, 4470,
      4510, 4550, 4590, 4620, 4650, 4610, 4570, 4520, 4480, 4430,
      4390, 4350, 4320, 4290, 4260, 4300, 4350, 4400, 4445, 4490,
      4530, 4570, 4540, 4500, 4470, 4430, 4400, 4440, 4485, 4520,
      4431.1, 4478.1, 4429.8, 4477.2,
    ],
  },
  '국제 유가': {
    label: 'WTI 국제 유가 (Oil)',
    current: '$91.5',
    change: '-0.09%',
    isPositive: false,
    data: [
      61.87, 62.69, 62.68, 64.2, 65.8, 67.5, 69.1, 70.8, 72.5, 74.1,
      75.8, 77.4, 79.1, 80.7, 82.3, 84.0, 85.6, 87.2, 88.9, 90.5,
      92.1, 93.7, 95.3, 96.9, 98.2, 96.5, 94.8, 93.1, 91.4, 89.7,
      88.0, 86.3, 85.0, 83.7, 82.5, 84.0, 85.8, 87.5, 89.2, 90.8,
      92.4, 94.0, 92.5, 91.0, 89.5, 88.0, 87.0, 88.5, 90.2, 91.8,
      85.76, 83.4, 91.48, 91.22,
    ],
  },
};

export const WEEKLY_BRIEFING = {
  weekLabel: '2026년 8월 31일(월) – 9월 4일(금)',
  weekHighlight: '미국 일자리 깜짝 호조, 큰 흔들림 없이 차분하게 한 주를 마무리했어요',
  sp500WeekChange: '+0.42',
  sp500WeekChangePositive: true,
  nasdaqWeekChange: '+0.30',
  nasdaqWeekChangePositive: true,
  sp500Current: '7,718.60',
  sp500High52w: '7,860',
  sp500Low52w: '6,481',
  keywordTags: ['#일자리호조', '#금리경계감', '#차분한한주', '#분할적립유효'],

  // 카드 1: 이번 주 증시 요약
  summaryStory: {
    desc: '미국의 8월 일자리가 예상(5.5만 개)을 3배 웃돈 16만 개 늘어나며 경제 체력을 증명했어요. 금리 부담에 주춤했지만, S&P 500은 주간 +0.42%로 차분히 마감했습니다.',
    // 월~금 5거래일 시간대별 정밀 추세 흐름 (월요일 개장 7686 -> 수요일 고점 7745 -> 금요일 7718.60 마감)
    weekPoints: [
      7686.1, 7692.4, 7698.8, 7705.2, 7711.8,  // 월요일
      7715.3, 7724.0, 7730.5, 7738.2, 7742.0,  // 화요일
      7745.2, 7748.6, 7741.0, 7738.5, 7740.2,  // 수요일 고점
      7736.8, 7732.1, 7728.4, 7731.0, 7735.0,  // 목요일
      7732.5, 7726.8, 7720.4, 7715.2, 7718.6,  // 금요일 (NFP 호조 후 금리 경계로 7718.60 안착)
    ],
  },

  // 카드 2: 3대 핵심 뉴스 (간결한 2줄 팩트)
  newsItems: [
    {
      icon: '💼',
      headline: '미국 8월 새 일자리 16만 개 깜짝 증가',
      detail: '예상치를 3배 뛰어넘으며 미국 고용 체력이 여전히 탄탄함을 입증했어요.',
      impact: '핵심지표' as ImpactTag,
      impactPositive: true,
    },
    {
      icon: '📈',
      headline: '고용 호조에 따른 미 국채 금리 반등',
      detail: '경제가 튼튼해 금리 인하 속도가 늦춰질 수 있다는 경계감이 돌았어요.',
      impact: '변동성 주의' as ImpactTag,
      impactPositive: false,
    },
    {
      icon: '💵',
      headline: '원/달러 환율 1,350원대 안정세',
      detail: '환율 급등락 없이 차분해 미국 주식 적립 투자자의 환전 부담을 덜었어요.',
      impact: '호재 가능성' as ImpactTag,
      impactPositive: true,
    },
  ],

  // 카드 3: 환율 & 원자재 브리핑
  macroStory: {
    title: '내 통장과 지갑에 미치는 영향',
    items: [
      { name: '달러/원 (1,351원)', status: '안정 구간', desc: '환율이 1,350원대 안착해 매달 정기 적립하기 편안한 구간이에요.' },
      { name: '국제 금 ($4,430)', status: '안전자산', desc: '지정학적 리스크 속에서도 든든한 가치 방패 역할을 하고 있어요.' },
      { name: '국제 유가 ($91.5)', status: '숨고르기', desc: '유가 상승세가 멈추며 생활 물가 추가 상승 압력을 덜어냈어요.' },
    ],
  },

  // 카드 4: 다음 주 체크리스트
  nextWeekEvents: [
    { date: '9/10 목', icon: '🏭', title: '미국 8월 생산자물가(PPI)', desc: '공장 출하 도매물가의 둔화 추세를 먼저 확인해요.' },
    { date: '9/11 금', icon: '🛒', title: '미국 8월 소비자물가지수(CPI)', desc: '연준이 가장 주목하는 핵심 장바구니 물가 발표예요.' },
    { date: '9/17 목', icon: '🏛️', title: '미국 9월 FOMC 기준금리 발표', desc: '올가을 글로벌 금리 향방을 결정지을 최대 분수령이에요.' },
  ],

  // 카드 5: 주요 자산 주간 등락 맵 (실전 데이터 맵)
  assetPerformance: [
    { name: '미국 대형주 (S&P 500)', returnRate: '+0.42%', isPositive: true, note: '고용 호조로 방어' },
    { name: '미국 기술주 (나스닥 100)', returnRate: '+0.30%', isPositive: true, note: '빅테크 보합권' },
    { name: '원/달러 환율', returnRate: '-0.35%', isPositive: false, note: '달러 안정세' },
    { name: '미국채 10년물 금리', returnRate: '+0.02%p', isPositive: true, note: '금리 경계감' },
    { name: '국제 금 현물', returnRate: '-1.38%', isPositive: false, note: '단기 숨고르기' },
    { name: 'WTI 국제 유가', returnRate: '-0.09%', isPositive: false, note: '상승세 주춤' },
  ],

  // 카드 6: 주간 핵심 질문 1문 1답 (Q&A)
  weeklyQnA: {
    question: '일자리가 깜짝 호조인데, 왜 주가는 폭등하지 못했을까요?',
    answer: '경제가 너무 튼튼하면 미국 중앙은행(연준)이 기준금리를 서둘러 내릴 이유가 줄어들기 때문이에요. 좋은 고용 지표가 단기적으로는 금리 인하 기대감을 늦추는 브레이크 역할을 한 셈입니다.',
    takeaway: '금리 방향타는 9/11(금) 소비자물가(CPI) 발표에서 판가름 납니다.',
  },

  // 카드 7 (PRO 전용): 주식부엉 레이더 & 관심 종목 메모
  proRadar: {
    title: '주식부엉 레이더 & 관심 종목',
    subtitle: '시장의 소음을 걷어내고 유심히 지켜보는 종목 관찰 일지',
    macroObservation: '물가 발표 전 숨고르기 구간에서는 압도적 현금 창출력을 쥔 1등 독점 기업이 가장 든든해요.',
    watchlist: [
      {
        ticker: 'VOO',
        name: '미국 500대 우량기업 ETF',
        focus: '미국 대표 500개 우량주 분산',
        memo: '개별 기업 리스크 없이 미국 경제 전체의 성장을 가장 편안하게 모아가는 핵심 자산이에요.',
      },
      {
        ticker: 'QQQ',
        name: '나스닥 100 혁신기업 ETF',
        focus: '글로벌 AI & 테크 1등 연합',
        memo: '인공지능 생태계를 선도하는 기술 독점 기업들로 채워져 장기 성장 탄력이 높아요.',
      },
    ],
    weeklyActionAdvice: '조급한 추격 구매는 피하고, 정해진 날짜에 정해진 금액만 장바구니에 담으세요.',
  },

  // 카드 8 (PRO 전용): 다음 주 실전 시나리오 & 함정 피하기
  proScenario: {
    title: '다음 주 실전 시나리오 & 함정 피하기',
    subtitle: '물가 발표 전후 시장의 갈림길과 피해야 할 실수',
    scenarios: [
      {
        type: 'A',
        condition: '9/11 CPI가 예상보다 낮아 주가가 급등할 때',
        action: '흥분해서 뒤늦게 추격하지 말고, 기존 월급날 적립 계획을 그대로 유지하세요.',
      },
      {
        type: 'B',
        condition: '금리 부담에 주가가 단기 조정을 받으며 출렁일 때',
        action: '겁먹고 팔지 말고, 평소 점찍어둔 1등 우량주를 저렴하게 담는 기회로 삼으세요.',
      },
    ],
    dangerTrap: {
      alertTitle: '이번 주 절대 피해야 할 함정',
      description: '단기 지표 뉴스에 놀라 잦은 주식 사고팔기로 수수료와 감정을 낭비하지 마세요.',
    },
  },

  // 투자 성향 가이드 & 시장 신호등
  typeGuides: {
    SPLI: { label: '패시브 장기형', message: '시장의 파도는 자연스러운 과정이에요. 계획했던 정기 적립식 모아가기를 흔들림 없이 유지하는 것이 가장 현명합니다.' },
    SPLR: { label: '리밸런싱 장기형', message: '자산 배분 비중을 정기 점검하며, 목표 비중보다 낮아진 우량 자산을 차분히 채워 넣기에 좋은 시기예요.' },
    GATR: { label: '공격 트레이딩형', message: '지표 발표 전후로 단기 변동성이 확대될 수 있으니, 무리한 포지션 확대보다는 현금 비중을 방어적으로 유지하세요.' },
    GPTR: { label: '성장 포트폴리오형', message: '혁신 1등 기업들의 실적 체력을 확인하며, 장기 펀더멘털에 집중해 우량 성장주를 선별할 때입니다.' },
    DEFAULT: { label: '내 투자 성향', message: '공포와 탐욕 지수가 공포 영역(42점)에 머물고 있어요. 역사적으로 대중이 머뭇거릴 때 차분히 적립한 투자자가 가장 큰 결실을 맺었습니다.' },
  },
  marketSignal: {
    level: '중립 적립 구간' as MarketSignal,
    color: 'amber',
    basis: '공포와 탐욕 지수 42 (공포) + S&P 500 견고한 펀더멘털 유지',
    historicalNote: '역사적으로 실적 동반 장세에서 분할 적립은 변동성을 낮추고 장기 우상향의 결실을 극대화했어요.',
    disclaimer: '본 신호는 통계 기반 참고 데이터이며 투자 권유가 아닙니다.',
  },
};

// ─── 증시 캘린더 이벤트 데이터 (2026년 6월 ~ 12월 전반) ───────────────────

export const CALENDAR_EVENTS: CalendarEvent[] = [
  {
    "id": "jun-kr-memorial",
    "date": "2026-06-06",
    "title": "한국 증시 휴장 (현충일)",
    "type": "holiday",
    "region": "kr",
    "simpleSummary": "법정 공휴일 현충일로 국내 금융 및 주식 시장이 하루 쉬어갔어요.",
    "impactTag": "관망",
    "importance": 1,
    "isHoliday": true
  },
  {
    "id": "jun-fomc-result",
    "date": "2026-06-17",
    "time": "03:00",
    "title": "미국 6월 FOMC 기준금리 결정",
    "type": "economic",
    "region": "us",
    "simpleSummary": "미국 연준이 기준금리를 3.75%로 동결하며 물가 안정 추세를 신중히 관망했어요.\n장기 금리 전망(3.1%)을 유지하며 시장에 차분한 안정감을 부여했습니다.",
    "impactTag": "핵심지표",
    "importance": 3,
    "actual": "3.75% (동결)",
    "expected": "3.75%",
    "previous": "3.75%"
  },
  {
    "id": "jun-us-juneteenth",
    "date": "2026-06-19",
    "title": "미국 증시 휴장 (노예해방의 날, Juneteenth)",
    "type": "holiday",
    "region": "us",
    "simpleSummary": "미국 연방 공휴일로 뉴욕 증시가 하루 쉬어갔어요.",
    "impactTag": "관망",
    "importance": 1,
    "isHoliday": true
  },
  {
    "id": "jun-mu-q3",
    "date": "2026-06-25",
    "time": "05:30",
    "title": "마이크론 테크놀로지 (MU) 회계 3분기 실적 발표",
    "type": "earnings",
    "region": "us",
    "simpleSummary": "AI 메모리(HBM) 수요 급증으로 분기 매출과 영업이익이 가이던스를 크게 웃돌았어요.\n글로벌 반도체 업황의 강력한 상승 사이클을 확인했습니다.",
    "impactTag": "호재 가능성",
    "importance": 3,
    "ticker": "MU",
    "actual": "매출 $6.81B / EPS $0.62",
    "expected": "매출 $6.67B / EPS $0.51",
    "previous": "매출 $5.82B / EPS $0.42"
  },
  {
    "id": "jul-us-independence",
    "date": "2026-07-04",
    "title": "미국 증시 휴장 (독립기념일)",
    "type": "holiday",
    "region": "us",
    "simpleSummary": "미국 독립기념일로 뉴욕 증시가 하루 쉬어갔습니다.",
    "impactTag": "관망",
    "importance": 1,
    "isHoliday": true
  },
  {
    "id": "jul-samsung-q2",
    "date": "2026-07-08",
    "time": "08:30",
    "title": "삼성전자 2분기 잠정 실적 발표",
    "type": "earnings",
    "region": "kr",
    "simpleSummary": "영업이익이 10.4조 원으로 깜짝 실적(어닝 서프라이즈)을 기록했어요.\n메모리 반도체 가격 상승세가 증명되면서 코스피 랠리를 이끄는 견인차 역할을 했습니다.",
    "impactTag": "호재 가능성",
    "importance": 3,
    "ticker": "005930",
    "actual": "영업이익 10.44조원",
    "expected": "8.8조원",
    "previous": "6.61조원"
  },
  {
    "id": "jul-jpm-q2",
    "date": "2026-07-10",
    "time": "20:00",
    "title": "JP모건 체이스 (JPM) 2분기 실적 발표",
    "type": "earnings",
    "region": "us",
    "simpleSummary": "미국 최대 은행 JP모건이 견조한 순이자이익과 투자은행 수수료 반등으로 양호한 실적을 냈어요.\n미국 금융 시스템의 튼튼한 체력을 입증했습니다.",
    "impactTag": "호재 가능성",
    "importance": 2,
    "ticker": "JPM",
    "actual": "EPS $4.40",
    "expected": "EPS $4.19",
    "previous": "EPS $4.37"
  },
  {
    "id": "jul-us-cpi",
    "date": "2026-07-14",
    "time": "21:30",
    "title": "미국 6월 소비자물가지수 (CPI YoY)",
    "type": "economic",
    "region": "us",
    "simpleSummary": "미국 소비자물가 상승률이 3.5%로 발표되어 시장 예상치(3.8%)와 이전치(4.2%)를 크게 밑돌았어요.\n물가 둔화세가 가시화되며 시장 전반에 안도감이 퍼졌습니다.",
    "impactTag": "핵심지표",
    "importance": 3,
    "actual": "3.5%",
    "expected": "3.8%",
    "previous": "4.2%"
  },
  {
    "id": "jul-us-core-cpi",
    "date": "2026-07-14",
    "time": "21:30",
    "title": "미국 6월 근원 소비자물가지수 (Core CPI YoY)",
    "type": "economic",
    "region": "us",
    "simpleSummary": "변동성이 큰 에너지와 식료품을 제외한 근원 물가 상승률이 2.6%로 집계되었어요.\n예상치(2.8%)보다 낮게 안정되며 인플레이션 우려를 크게 낮췄습니다.",
    "impactTag": "핵심지표",
    "importance": 3,
    "actual": "2.6%",
    "expected": "2.8%",
    "previous": "2.9%"
  },
  {
    "id": "jul-asml-q2",
    "date": "2026-07-15",
    "time": "14:00",
    "title": "ASML 2분기 실적 발표",
    "type": "earnings",
    "region": "us",
    "simpleSummary": "첨단 반도체 제조 핵심 장비인 EUV 노광장비의 신규 수주가 회복세를 보였어요.\n글로벌 파운드리 및 메모리 기업들의 설비 투자 지속을 확인했습니다.",
    "impactTag": "호재 가능성",
    "importance": 3,
    "ticker": "ASML",
    "actual": "매출 €6.24B / 순익 €1.58B",
    "expected": "매출 €6.03B / 순익 €1.41B",
    "previous": "매출 €5.29B"
  },
  {
    "id": "jul-us-ppi",
    "date": "2026-07-15",
    "time": "21:30",
    "title": "미국 6월 생산자물가지수 (PPI YoY)",
    "type": "economic",
    "region": "us",
    "simpleSummary": "도매물가 격인 생산자물가가 5.5%로 발표되어 예상치(6.2%)를 밑돌며 하향 곡선을 그렸어요.",
    "impactTag": "관망",
    "importance": 2,
    "actual": "5.5%",
    "expected": "6.2%",
    "previous": "6.0%"
  },
  {
    "id": "jul-bok-rate",
    "date": "2026-07-16",
    "time": "10:00",
    "title": "한국은행 금융통화위원회 기준금리 결정",
    "type": "economic",
    "region": "kr",
    "simpleSummary": "한국은행이 기준금리를 2.75%로 결정하며 경기 부양과 유동성 흐름을 뒷받침했어요.",
    "impactTag": "핵심지표",
    "importance": 3,
    "actual": "2.75%",
    "expected": "2.50%",
    "previous": "2.50%"
  },
  {
    "id": "jul-tsmc-q2",
    "date": "2026-07-16",
    "time": "15:00",
    "title": "TSMC (TSM) 2분기 실적 발표",
    "type": "earnings",
    "region": "us",
    "simpleSummary": "3나노 및 5나노 첨단 공정 풀가동으로 분기 순이익이 전년 대비 36% 급증했어요.\nAI 가속기 칩 수요가 실적을 강력하게 견인했습니다.",
    "impactTag": "호재 가능성",
    "importance": 3,
    "ticker": "TSM",
    "actual": "매출 NT$673.5B / 순익 NT$247.8B",
    "expected": "매출 NT$657.5B",
    "previous": "매출 NT$592.6B"
  },
  {
    "id": "jul-jnj-q2",
    "date": "2026-07-16",
    "time": "20:00",
    "title": "존슨앤존슨 (JNJ) 2분기 실적 발표",
    "type": "earnings",
    "region": "us",
    "simpleSummary": "혁신 의약품과 의료기기 부문의 고른 성장으로 시장 기대치에 부합했어요.\n필수 헬스케어 기업으로서 경기 방어적 수익 안정성을 증명했습니다.",
    "impactTag": "관망",
    "importance": 2,
    "ticker": "JNJ",
    "actual": "EPS $2.82",
    "expected": "EPS $2.70",
    "previous": "EPS $2.71"
  },
  {
    "id": "jul-us-retail",
    "date": "2026-07-16",
    "time": "21:30",
    "title": "미국 6월 소매판매 (Retail Sales YoY)",
    "type": "economic",
    "region": "us",
    "simpleSummary": "미국 소비자들의 지출 체력을 보여주는 소매판매가 전년 대비 6.7% 증가하며 견조한 소비를 입증했어요.",
    "impactTag": "호재 가능성",
    "importance": 2,
    "actual": "6.7%",
    "previous": "7.3%"
  },
  {
    "id": "jul-tsla-q2",
    "date": "2026-07-22",
    "time": "05:30",
    "title": "테슬라 (TSLA) 2분기 실적 발표",
    "type": "earnings",
    "region": "us",
    "simpleSummary": "전기차 가격 경쟁으로 자동차 마진율은 다소 낮아졌으나 에너지 저장 장치(메가팩) 매출이 2배 이상 폭증했어요.\nFSD 및 자율주행 기술 투자가 활발히 진행 중입니다.",
    "impactTag": "변동성 주의",
    "importance": 3,
    "ticker": "TSLA",
    "actual": "매출 $25.5B / EPS $0.52",
    "expected": "매출 $24.7B / EPS $0.62",
    "previous": "매출 $21.3B / EPS $0.45"
  },
  {
    "id": "jul-samsungbio-q2",
    "date": "2026-07-22",
    "time": "15:30",
    "title": "삼성바이오로직스 (207940) 2분기 실적 발표",
    "type": "earnings",
    "region": "kr",
    "simpleSummary": "4공장 가동률 상승과 대형 글로벌 수주 확대로 분기 매출 1조 원을 돌파했어요.\n국내 바이오 CDMO 선도주로서 역대 최대 상반기 실적을 달성했습니다.",
    "impactTag": "호재 가능성",
    "importance": 2,
    "ticker": "207940",
    "actual": "영업이익 4,345억 원",
    "expected": "영업이익 3,890억 원",
    "previous": "영업이익 3,140억 원"
  },
  {
    "id": "jul-googl-q2",
    "date": "2026-07-23",
    "time": "05:30",
    "title": "알파벳 (GOOGL) 2분기 실적 발표",
    "type": "earnings",
    "region": "us",
    "simpleSummary": "검색 광고 매출 회복과 구글 클라우드 매출 29% 급성장으로 어닝 서프라이즈를 달성했어요.\nAI 인프라 효율화로 영업이익률이 대폭 개선되었습니다.",
    "impactTag": "호재 가능성",
    "importance": 3,
    "ticker": "GOOGL",
    "actual": "매출 $84.74B / EPS $1.89",
    "expected": "매출 $84.19B / EPS $1.84",
    "previous": "매출 $80.54B"
  },
  {
    "id": "jul-hyundai-q2",
    "date": "2026-07-23",
    "time": "14:00",
    "title": "현대차 (005380) 2분기 실적 발표",
    "type": "earnings",
    "region": "kr",
    "simpleSummary": "SUV와 하이브리드 고수익 차종 판매 호조로 분기 영업이익 4.2조 원의 사상 최대 실적을 경신했어요.\n주주 환원 확대 정책과 맞물려 투자 심리가 개선되었습니다.",
    "impactTag": "호재 가능성",
    "importance": 3,
    "ticker": "005380",
    "actual": "영업이익 4조 2,791억 원",
    "expected": "영업이익 4조 1,500억 원",
    "previous": "영업이익 3조 5,574억 원"
  },
  {
    "id": "jul-kbfg-q2",
    "date": "2026-07-23",
    "time": "16:00",
    "title": "KB금융 (105560) 2분기 실적 발표",
    "type": "earnings",
    "region": "kr",
    "simpleSummary": "견조한 이자이익과 비은행 계열사 실적 반등으로 분기 당기순이익 1.7조 원을 기록했어요.\n적극적인 자사주 매입 및 소각 등 밸류업 프로그램 실행을 재확인했습니다.",
    "impactTag": "호재 가능성",
    "importance": 2,
    "ticker": "105560",
    "actual": "순이익 1조 7,324억 원",
    "expected": "순이익 1조 5,900억 원",
    "previous": "순이익 1조 4,968억 원"
  },
  {
    "id": "jul-skhynix-q2",
    "date": "2026-07-24",
    "time": "09:00",
    "title": "SK하이닉스 (000660) 2분기 실적 발표",
    "type": "earnings",
    "region": "kr",
    "simpleSummary": "HBM3E 납품 본격화로 분기 영업이익 5.4조 원을 거두며 완벽한 흑자 턴어라운드를 입증했어요.\nD램과 낸드 평균 판매가격(ASP) 동반 상승세가 두드러졌습니다.",
    "impactTag": "호재 가능성",
    "importance": 3,
    "ticker": "000660",
    "actual": "영업이익 5조 4,685억 원",
    "expected": "영업이익 5조 1,900억 원",
    "previous": "영업이익 2조 8,860억 원"
  },
  {
    "id": "jul-lgensol-q2",
    "date": "2026-07-24",
    "time": "09:30",
    "title": "LG에너지솔루션 (373220) 2분기 실적 발표",
    "type": "earnings",
    "region": "kr",
    "simpleSummary": "전기차 캐즘 속에서도 미국 인플레이션 감축법(IRA) 세액공제 지원으로 영업이익 1,953억 원 흑자를 사수했어요.\n차세대 ESS 배터리 공급 확대로 돌파구를 마련하고 있습니다.",
    "impactTag": "관망",
    "importance": 2,
    "ticker": "373220",
    "actual": "영업이익 1,953억 원 (IRA 세액공제 포함)",
    "expected": "영업이익 1,800억 원",
    "previous": "영업이익 1,573억 원"
  },
  {
    "id": "jul-samsungel-q2",
    "date": "2026-07-24",
    "time": "14:00",
    "title": "삼성전기 (009150) 2분기 실적 발표",
    "type": "earnings",
    "region": "kr",
    "simpleSummary": "AI 서버용 고부가 MLCC(적층세라믹콘덴서)와 FC-BGA 기판 공급 호조로 영업이익이 전년 대비 대폭 증가했어요.",
    "impactTag": "호재 가능성",
    "importance": 2,
    "ticker": "009150",
    "actual": "영업이익 2,080억 원",
    "expected": "영업이익 1,950억 원",
    "previous": "영업이익 1,803억 원"
  },
  {
    "id": "jul-msft-q4",
    "date": "2026-07-28",
    "time": "05:30",
    "title": "마이크로소프트 (MSFT) 회계 4분기 실적 발표",
    "type": "earnings",
    "region": "us",
    "simpleSummary": "지능형 클라우드 Azure 매출이 29% 증가했으나 AI 인프라 자본지출(Capex) 증가로 단기 차익 실현 매물이 출회되었어요.\n장기 AI 플랫폼 지배력은 더욱 공고해졌습니다.",
    "impactTag": "변동성 주의",
    "importance": 3,
    "ticker": "MSFT",
    "actual": "매출 $64.7B / EPS $2.95",
    "expected": "매출 $64.3B / EPS $2.93",
    "previous": "매출 $61.86B"
  },
  {
    "id": "jul-amd-q2",
    "date": "2026-07-28",
    "time": "05:30",
    "title": "AMD (AMD) 2분기 실적 발표",
    "type": "earnings",
    "region": "us",
    "simpleSummary": "MI300 AI 가속기 칩 매출이 분기 10억 달러를 돌파하며 데이터센터 부문이 115% 폭발적 성장을 기록했어요.",
    "impactTag": "호재 가능성",
    "importance": 3,
    "ticker": "AMD",
    "actual": "매출 $5.83B / EPS $0.69",
    "expected": "매출 $5.72B / EPS $0.68",
    "previous": "매출 $5.47B"
  },
  {
    "id": "jul-v-q3",
    "date": "2026-07-28",
    "time": "05:30",
    "title": "비자 (V) 회계 3분기 실적 발표",
    "type": "earnings",
    "region": "us",
    "simpleSummary": "글로벌 결제 거래액과 국경 간 여행 결제가 9% 증가하며 안정적인 현금 흐름을 유지했어요.",
    "impactTag": "관망",
    "importance": 2,
    "ticker": "V",
    "actual": "매출 $8.90B / EPS $2.42",
    "expected": "매출 $8.92B / EPS $2.42",
    "previous": "매출 $8.78B"
  },
  {
    "id": "jul-fomc-result",
    "date": "2026-07-29",
    "time": "03:00",
    "title": "미국 7월 FOMC 기준금리 결정",
    "type": "economic",
    "region": "us",
    "simpleSummary": "미 연준이 기준금리를 3.75%로 재차 동결하며 하반기 거시지표 결과를 지켜보겠다는 입장을 견지했어요.",
    "impactTag": "핵심지표",
    "importance": 3,
    "actual": "3.75% (동결)",
    "expected": "3.75%",
    "previous": "3.75%"
  },
  {
    "id": "jul-meta-q2",
    "date": "2026-07-29",
    "time": "05:30",
    "title": "메타 플랫폼스 (META) 2분기 실적 발표",
    "type": "earnings",
    "region": "us",
    "simpleSummary": "AI 추천 알고리즘 개선으로 광고 노출 및 단가가 동반 상승하여 매출이 22% 증가했어요.\n적극적인 AI 오픈소스 투자와 효율적 비용 통제가 돋보였습니다.",
    "impactTag": "호재 가능성",
    "importance": 3,
    "ticker": "META",
    "actual": "매출 $39.07B / EPS $5.16",
    "expected": "매출 $38.31B / EPS $4.73",
    "previous": "매출 $36.45B"
  },
  {
    "id": "jul-samsungcnt-q2",
    "date": "2026-07-29",
    "time": "15:00",
    "title": "삼성물산 (028260) 2분기 실적 발표",
    "type": "earnings",
    "region": "kr",
    "simpleSummary": "해외 대형 프로젝트 공정 호조와 바이오 자회사 호실적으로 분기 영업이익 9,000억 원을 돌파했어요.",
    "impactTag": "호재 가능성",
    "importance": 2,
    "ticker": "028260",
    "actual": "영업이익 9,004억 원",
    "expected": "영업이익 8,400억 원",
    "previous": "영업이익 7,123억 원"
  },
  {
    "id": "jul-aapl-q3",
    "date": "2026-07-30",
    "time": "05:30",
    "title": "애플 (AAPL) 회계 3분기 실적 발표",
    "type": "earnings",
    "region": "us",
    "simpleSummary": "아이패드 신제품과 서비스 부문(App Store, Apple Pay 등) 사상 최대 매출로 기대치를 상회했어요.\n가을 AI 탑재 신형 아이폰에 대한 교체 수요 기대감이 고조되었습니다.",
    "impactTag": "호재 가능성",
    "importance": 3,
    "ticker": "AAPL",
    "actual": "매출 $85.78B / EPS $1.40",
    "expected": "매출 $84.53B / EPS $1.35",
    "previous": "매출 $90.75B"
  },
  {
    "id": "jul-amzn-q2",
    "date": "2026-07-30",
    "time": "05:30",
    "title": "아마존 (AMZN) 2분기 실적 발표",
    "type": "earnings",
    "region": "us",
    "simpleSummary": "AWS 클라우드 매출이 19% 가속 성장했으나, 북미 리테일 소비 둔화와 3분기 신중한 가이던스로 주가는 보합세를 보였어요.",
    "impactTag": "관망",
    "importance": 3,
    "ticker": "AMZN",
    "actual": "매출 $147.98B / EPS $1.26",
    "expected": "매출 $148.56B / EPS $1.03",
    "previous": "매출 $143.31B"
  },
  {
    "id": "jul-us-gdp-adv",
    "date": "2026-07-30",
    "time": "21:30",
    "title": "미국 2분기 GDP 성장률 (속보치 QoQ)",
    "type": "economic",
    "region": "us",
    "simpleSummary": "미국의 2분기 실질 성장률 속보치가 1.5%로 발표되어 과열 없이 차분한 완만한 성장을 나타냈어요.",
    "impactTag": "관망",
    "importance": 3,
    "actual": "1.5%",
    "expected": "2.1%",
    "previous": "2.1%"
  },
  {
    "id": "jul-xom-q2",
    "date": "2026-07-31",
    "time": "20:30",
    "title": "엑슨모빌 (XOM) 2분기 실적 발표",
    "type": "earnings",
    "region": "us",
    "simpleSummary": "파이오니어 내추럴 리소시스 인수 효과와 가이아나 유전 증산으로 원유 생산량이 15% 증가했어요.\n배당금과 자사주 매입으로 탄탄한 주주환원을 지속했습니다.",
    "impactTag": "호재 가능성",
    "importance": 2,
    "ticker": "XOM",
    "actual": "순이익 $9.24B / EPS $2.14",
    "expected": "EPS $2.01",
    "previous": "순이익 $8.22B"
  },
  {
    "id": "aug-brk-q2",
    "date": "2026-08-03",
    "time": "21:00",
    "title": "버크셔 해서웨이 (BRK.B) 2분기 실적 공시 (10-Q)",
    "type": "earnings",
    "region": "us",
    "simpleSummary": "보험 인수 영업이익이 대폭 증가한 반면, 현금 보유액은 2,769억 달러로 역대 최대치를 경신했어요.\n워런 버핏의 철저한 가치 보수주의 전략이 주목받았습니다.",
    "impactTag": "호재 가능성",
    "importance": 2,
    "ticker": "BRK_B",
    "actual": "영업이익 $11.60B (현금보유 $276.9B)",
    "expected": "영업이익 $10.50B",
    "previous": "영업이익 $11.22B"
  },
  {
    "id": "aug-lly-q2",
    "date": "2026-08-06",
    "time": "20:00",
    "title": "일라이 릴리 (LLY) 2분기 실적 발표",
    "type": "earnings",
    "region": "us",
    "simpleSummary": "비만치료제 젭바운드와 당뇨약 마운자로의 폭발적 수요로 분기 매출이 36% 급증했어요.\n연간 매출 가이던스를 30억 달러 상향 조정했습니다.",
    "impactTag": "호재 가능성",
    "importance": 3,
    "ticker": "LLY",
    "actual": "매출 $11.30B / EPS $3.92",
    "expected": "매출 $9.92B / EPS $2.60",
    "previous": "매출 $8.77B"
  },
  {
    "id": "aug-us-unemployment",
    "date": "2026-08-07",
    "time": "21:30",
    "title": "미국 7월 실업률 발표",
    "type": "economic",
    "region": "us",
    "simpleSummary": "미국의 7월 실업률이 4.1%로 집계되어 예상치(4.2%)보다 양호한 안정적 고용 체력을 보여주었어요.",
    "impactTag": "핵심지표",
    "importance": 3,
    "actual": "4.1%",
    "expected": "4.2%",
    "previous": "4.2%"
  },
  {
    "id": "aug-spcx-q2",
    "date": "2026-08-11",
    "time": "06:00",
    "title": "스페이스X (SPCX) 2분기 실적 발표",
    "type": "earnings",
    "region": "us",
    "simpleSummary": "스타링크 위성 인터넷 가입자 400만 명 돌파와 팰컨9 로켓 재사용 발사 빈도 증가로 분기 매출 38억 달러를 달성했어요.\n우주 통신 부문의 흑자 구조가 완전히 안착했습니다.",
    "impactTag": "호재 가능성",
    "importance": 3,
    "ticker": "SPCX",
    "actual": "매출 $3.85B / 영업이익 $5.2억 달러",
    "expected": "매출 $3.50B",
    "previous": "매출 $3.10B"
  },
  {
    "id": "aug-us-cpi",
    "date": "2026-08-12",
    "time": "21:30",
    "title": "미국 7월 소비자물가지수 (CPI YoY)",
    "type": "economic",
    "region": "us",
    "simpleSummary": "소비자물가 상승률이 3.4%로 집계되어 시장의 예상치(3.4%)와 정확히 일치하며 하향 안정세를 이어갔어요.",
    "impactTag": "핵심지표",
    "importance": 3,
    "actual": "3.4%",
    "expected": "3.4%",
    "previous": "3.5%"
  },
  {
    "id": "aug-us-core-cpi",
    "date": "2026-08-12",
    "time": "21:30",
    "title": "미국 7월 근원 소비자물가지수 (Core CPI YoY)",
    "type": "economic",
    "region": "us",
    "simpleSummary": "근원 소비자물가 상승률이 2.5%로 집계되어 인플레이션 둔화 추세가 순조롭게 이어지고 있음을 확인했어요.",
    "impactTag": "핵심지표",
    "importance": 3,
    "actual": "2.5%",
    "expected": "2.5%",
    "previous": "2.6%"
  },
  {
    "id": "aug-us-ppi",
    "date": "2026-08-13",
    "time": "21:30",
    "title": "미국 7월 생산자물가지수 (PPI YoY)",
    "type": "economic",
    "region": "us",
    "simpleSummary": "생산자물가가 4.7%로 발표되어 예상치(4.9%)와 이전치(5.5%) 대비 뚜렷한 진정 국면을 보였어요.",
    "impactTag": "관망",
    "importance": 2,
    "actual": "4.7%",
    "expected": "4.9%",
    "previous": "5.5%"
  },
  {
    "id": "aug-sksquare-q2",
    "date": "2026-08-14",
    "time": "16:00",
    "title": "SK스퀘어 (402340) 반기보고서 공시",
    "type": "earnings",
    "region": "kr",
    "simpleSummary": "주요 자회사 SK하이닉스의 흑자 전환에 힘입어 지분법 이익이 급증했어요.\n보유 포트폴리오 밸류업 및 자사주 매입 소각 정책이 주가를 지지했습니다.",
    "impactTag": "호재 가능성",
    "importance": 2,
    "ticker": "402340",
    "actual": "반기 순이익 1조 1,120억 원",
    "expected": "순이익 9,500억 원",
    "previous": "순손실 -7,350억 원"
  },
  {
    "id": "aug-samsunglife-q2",
    "date": "2026-08-14",
    "time": "16:30",
    "title": "삼성생명 (032830) 반기보고서 공시",
    "type": "earnings",
    "region": "kr",
    "simpleSummary": "건강보험 등 보장성 신계약 판매 호조와 안정적인 CSM(보험계약마진) 잔액 증가로 탄탄한 이익 체력을 보였어요.",
    "impactTag": "관망",
    "importance": 2,
    "ticker": "032830",
    "actual": "반기 당기순이익 1조 3,685억 원",
    "expected": "순이익 1조 2,800억 원",
    "previous": "순이익 9,742억 원"
  },
  {
    "id": "aug-us-retail",
    "date": "2026-08-14",
    "time": "21:30",
    "title": "미국 7월 소매판매 (Retail Sales YoY)",
    "type": "economic",
    "region": "us",
    "simpleSummary": "미국 7월 소매판매가 전년 대비 5.0% 증가하며 가계 소비가 탄탄히 버텨주고 있음을 나타냈어요.",
    "impactTag": "호재 가능성",
    "importance": 2,
    "actual": "5.0%",
    "previous": "6.8%"
  },
  {
    "id": "aug-kr-liberation",
    "date": "2026-08-15",
    "title": "한국 증시 휴장 (광복절)",
    "type": "holiday",
    "region": "kr",
    "simpleSummary": "국경일 광복절로 국내 금융 및 주식 시장이 휴장했습니다.",
    "impactTag": "관망",
    "importance": 1,
    "isHoliday": true
  },
  {
    "id": "aug-wmt-q2",
    "date": "2026-08-18",
    "time": "20:00",
    "title": "월마트 (WMT) 회계 2분기 실적 발표",
    "type": "earnings",
    "region": "us",
    "simpleSummary": "가성비 식료품 수요와 이커머스 매출 21% 성장에 힘입어 미국 동일매장 매출이 4.2% 증가했어요.\n연간 실적 가이던스를 재차 상향했습니다.",
    "impactTag": "호재 가능성",
    "importance": 2,
    "ticker": "WMT",
    "actual": "매출 $169.34B / EPS $0.67",
    "expected": "매출 $168.63B / EPS $0.65",
    "previous": "매출 $161.51B"
  },
  {
    "id": "aug-nvda-q2",
    "date": "2026-08-26",
    "time": "06:00",
    "title": "엔비디아 (NVDA) 회계 2분기 실적 발표",
    "type": "earnings",
    "region": "us",
    "simpleSummary": "데이터센터용 호퍼(H100/H200) 및 차세대 블랙웰(Blackwell) 칩 수요로 분기 매출이 300억 달러를 돌파했어요.\n매출 총이익률 75%의 압도적인 AI 독점 경쟁력을 과시했습니다.",
    "impactTag": "호재 가능성",
    "importance": 3,
    "ticker": "NVDA",
    "actual": "매출 $30.04B / EPS $0.68",
    "expected": "매출 $28.70B / EPS $0.64",
    "previous": "매출 $26.04B / EPS $0.61"
  },
  {
    "id": "aug-us-gdp-sec",
    "date": "2026-08-26",
    "time": "21:30",
    "title": "미국 2분기 GDP 성장률 (수정치 QoQ)",
    "type": "economic",
    "region": "us",
    "simpleSummary": "미국의 2분기 GDP 수정치가 1.5%로 속보치와 동일하게 유지되며 완만하고 안정적인 성장을 확인했어요.",
    "impactTag": "관망",
    "importance": 2,
    "actual": "1.5%",
    "expected": "1.5%",
    "previous": "2.1%"
  },
  {
    "id": "aug-bok-rate",
    "date": "2026-08-27",
    "time": "10:00",
    "title": "한국은행 금융통화위원회 기준금리 인상 (3.00%)",
    "type": "economic",
    "region": "kr",
    "simpleSummary": "한국은행이 환율 안정과 가계부채 관리를 고려해 기준금리를 3.00%로 0.25%p 인상 조정했어요.",
    "impactTag": "핵심지표",
    "importance": 3,
    "actual": "3.00%",
    "expected": "2.75%",
    "previous": "2.75%"
  },
  {
    "id": "sep-ism-mfg",
    "date": "2026-09-01",
    "time": "23:00",
    "title": "미국 8월 ISM 제조업 PMI 발표",
    "type": "economic",
    "region": "us",
    "simpleSummary": "제조업 구매관리자지수가 54.6으로 집계되어 경기 확장 기준선(50)을 여유 있게 상회했어요.\n미국 제조업 현장의 활력이 살아있음을 입증했습니다.",
    "impactTag": "호재 가능성",
    "importance": 3,
    "actual": "54.6",
    "expected": "55.2",
    "previous": "55.6"
  },
  {
    "id": "sep-avgo-q3",
    "date": "2026-09-03",
    "time": "06:00",
    "title": "브로드컴 (AVGO) 회계 3분기 실적 발표",
    "type": "earnings",
    "region": "us",
    "simpleSummary": "AI 커스텀 가속기(XPU)와 네트워킹 스위치 칩, VMware 소프트웨어 통합 효과로 매출이 전년 대비 47% 증가했어요.\n빅테크들의 커스텀 AI 칩 채택 확대를 입증했습니다.",
    "impactTag": "호재 가능성",
    "importance": 3,
    "ticker": "AVGO",
    "actual": "매출 $13.07B / EPS $1.24",
    "expected": "매출 $12.97B / EPS $1.20",
    "previous": "매출 $12.49B"
  },
  {
    "id": "sep-nfp",
    "date": "2026-09-04",
    "time": "21:30",
    "title": "미국 8월 비농업 취업자수 (Nonfarm Payrolls) 발표",
    "type": "economic",
    "region": "us",
    "simpleSummary": "미국 기업들의 8월 일자리가 16.2만 개 늘어나며 시장 예상치(5.5만 개)를 3배 가까이 뛰어넘었어요.\n고용 시장 체력이 여전히 탄탄하여 경기 침체 우려를 깨끗이 씻어냈습니다.",
    "impactTag": "핵심지표",
    "importance": 3,
    "actual": "162K",
    "expected": "55K",
    "previous": "21K"
  },
  {
    "id": "sep-unemployment",
    "date": "2026-09-04",
    "time": "21:30",
    "title": "미국 8월 실업률 (Unemployment Rate) 발표",
    "type": "economic",
    "region": "us",
    "simpleSummary": "미국의 8월 실업률이 4.1%로 집계되어 시장 컨센서스와 정확히 일치했어요.\n급격한 일자리 위축 없는 이상적인 안정권 흐름을 유지하고 있습니다.",
    "impactTag": "핵심지표",
    "importance": 3,
    "actual": "4.1%",
    "expected": "4.1%",
    "previous": "4.1%"
  },
  {
    "id": "sep-nfib-opt",
    "date": "2026-09-08",
    "time": "19:00",
    "title": "미국 NFIB 소기업 낙관지수 발표",
    "type": "economic",
    "region": "us",
    "simpleSummary": "미국 실물 경제의 뿌리인 중소기업과 소상공인들의 체감 경기 심리를 점검해요.",
    "impactTag": "관망",
    "importance": 1,
    "previous": "99.8"
  },
  {
    "id": "sep-us-ppi",
    "date": "2026-09-10",
    "time": "21:30",
    "title": "미국 8월 생산자물가지수 (PPI YoY) 발표",
    "type": "economic",
    "region": "us",
    "simpleSummary": "공장과 생산자들의 출하 가격 변동을 보여주는 도매물가 지표예요.\n이 지표가 안정되면 1~2개월 뒤 소비자물가 추가 안정으로 이어집니다.",
    "impactTag": "관망",
    "importance": 2,
    "previous": "4.7%"
  },
  {
    "id": "sep-us-cpi",
    "date": "2026-09-11",
    "time": "21:30",
    "title": "미국 8월 소비자물가지수 (CPI YoY) 발표",
    "type": "economic",
    "region": "us",
    "simpleSummary": "미국 9월 FOMC 금리 결정을 불과 5일 앞두고 공개되는 최후의 결정적 물가 성적표예요.\n물가 안정세가 확인되면 통화정책 완화 기대감이 더욱 탄력을 받아요.",
    "impactTag": "핵심지표",
    "importance": 3,
    "previous": "3.4%"
  },
  {
    "id": "sep-us-core-cpi",
    "date": "2026-09-11",
    "time": "21:30",
    "title": "미국 8월 근원 소비자물가지수 (Core CPI YoY) 발표",
    "type": "economic",
    "region": "us",
    "simpleSummary": "에너지와 식료품을 뺀 기조적 물가 흐름을 보여주는 연준의 핵심 주시 지표예요.",
    "impactTag": "핵심지표",
    "importance": 3,
    "previous": "2.5%"
  },
  {
    "id": "sep-retail-sales",
    "date": "2026-09-16",
    "time": "21:30",
    "title": "미국 8월 소매판매 (Retail Sales YoY) 발표",
    "type": "economic",
    "region": "us",
    "simpleSummary": "미국 경제의 70%를 차지하는 일반 소비자들의 실제 씀씀이를 점검해요.\n소비가 견조하면 기업 실적과 주가를 든든히 지탱해 줍니다.",
    "impactTag": "호재 가능성",
    "importance": 2,
    "previous": "5.0%"
  },
  {
    "id": "sep-fomc-result",
    "date": "2026-09-17",
    "time": "03:00",
    "title": "미국 9월 FOMC 기준금리 결정 및 경제전망(점도표) 발표",
    "type": "economic",
    "region": "us",
    "simpleSummary": "글로벌 유동성과 자산 가격의 향방을 가를 9월 FOMC 정례회의 결과가 공개돼요.\n파월 의장의 기자회견과 함께 연말까지의 금리 인하 경로 점도표가 핵심이에요.",
    "impactTag": "핵심지표",
    "importance": 3,
    "previous": "3.75%"
  },
  {
    "id": "sep-chuseok-1",
    "date": "2026-09-24",
    "title": "한국 증시 휴장 (추석 연휴)",
    "type": "holiday",
    "region": "kr",
    "simpleSummary": "민족 대명절 추석 연휴로 국내 금융 및 주식 시장이 휴장해요.",
    "impactTag": "관망",
    "importance": 1,
    "isHoliday": true
  },
  {
    "id": "sep-mu-q4",
    "date": "2026-09-24",
    "time": "05:30",
    "title": "마이크론 테크놀로지 (MU) 회계 4분기 실적 발표",
    "type": "earnings",
    "region": "us",
    "simpleSummary": "HBM3E 공급 확대와 PC/스마트폰 온디바이스 AI 메모리 탑재 증가세를 확인해요.\n연말 메모리 가격 전망과 2027년 HBM 수주 가이던스가 관전 포인트입니다.",
    "impactTag": "핵심지표",
    "importance": 3,
    "ticker": "MU",
    "expected": "매출 $7.65B / EPS $1.10",
    "previous": "매출 $6.81B / EPS $0.62"
  },
  {
    "id": "sep-chuseok-2",
    "date": "2026-09-25",
    "title": "한국 증시 휴장 (추석 연휴)",
    "type": "holiday",
    "region": "kr",
    "simpleSummary": "추석 연휴로 한국 증시가 휴장하며, 미국 등 해외 시장은 정상 거래됩니다.",
    "impactTag": "관망",
    "importance": 1,
    "isHoliday": true
  },
  {
    "id": "sep-us-gdp-final",
    "date": "2026-09-30",
    "time": "21:30",
    "title": "미국 2분기 GDP 성장률 (확정치 QoQ)",
    "type": "economic",
    "region": "us",
    "simpleSummary": "미국 2분기 경제 성장의 최종 확정 성적표가 집계돼요.",
    "impactTag": "관망",
    "importance": 2,
    "previous": "1.5%"
  },
  {
    "id": "oct-nfp",
    "date": "2026-10-02",
    "time": "21:30",
    "title": "미국 9월 비농업 고용보고서 (NFP) 및 실업률 발표",
    "type": "economic",
    "region": "us",
    "simpleSummary": "9월 FOMC 이후 첫 고용 성적표로 실물 경기 체력을 재확인해요.",
    "impactTag": "핵심지표",
    "importance": 3,
    "previous": "162K"
  },
  {
    "id": "oct-national-foundation",
    "date": "2026-10-03",
    "title": "한국 증시 휴장 (개천절)",
    "type": "holiday",
    "region": "kr",
    "simpleSummary": "국경일 개천절로 국내 주식 시장이 휴장해요.",
    "impactTag": "관망",
    "importance": 1,
    "isHoliday": true
  },
  {
    "id": "oct-samsung-q3",
    "date": "2026-10-08",
    "time": "08:30",
    "title": "삼성전자 3분기 잠정 실적 발표",
    "type": "earnings",
    "region": "kr",
    "simpleSummary": "코스피 시가총액 1위 삼성전자의 분기 매출과 영업이익이 공개돼요.\nHBM 납품 성과와 메모리 반도체 실적이 코스피 방향을 주도합니다.",
    "impactTag": "호재 가능성",
    "importance": 3,
    "ticker": "005930"
  },
  {
    "id": "oct-hangeul-day",
    "date": "2026-10-09",
    "title": "한국 증시 휴장 (한글날)",
    "type": "holiday",
    "region": "kr",
    "simpleSummary": "국경일 한글날로 국내 금융 시장이 하루 쉬어갑니다.",
    "impactTag": "관망",
    "importance": 1,
    "isHoliday": true
  },
  {
    "id": "oct-jpm-q3",
    "date": "2026-10-13",
    "time": "20:00",
    "title": "JP모건 체이스 (JPM) 3분기 실적 발표",
    "type": "earnings",
    "region": "us",
    "simpleSummary": "미국 어닝 시즌의 시작을 알리는 대표 금융주로 대출 건전성과 연말 미국 소비 체력을 점검해요.",
    "impactTag": "관망",
    "importance": 2,
    "ticker": "JPM"
  },
  {
    "id": "oct-asml-q3",
    "date": "2026-10-14",
    "time": "14:00",
    "title": "ASML 3분기 실적 발표",
    "type": "earnings",
    "region": "us",
    "simpleSummary": "첨단 반도체 핵심 장비인 극자외선(EUV) 노광장비 수주 잔고와 AI 칩 제조사들의 설비 투자 현황을 확인해요.",
    "impactTag": "호재 가능성",
    "importance": 3,
    "ticker": "ASML"
  },
  {
    "id": "oct-cpi",
    "date": "2026-10-14",
    "time": "21:30",
    "title": "미국 9월 소비자물가지수 (CPI) 발표",
    "type": "economic",
    "region": "us",
    "simpleSummary": "연말 통화정책 완화 속도를 가늠할 9월 물가 데이터가 공개돼요.",
    "impactTag": "핵심지표",
    "importance": 3
  },
  {
    "id": "oct-tsmc-q3",
    "date": "2026-10-15",
    "time": "15:00",
    "title": "TSMC 3분기 실적 발표",
    "type": "earnings",
    "region": "us",
    "simpleSummary": "애플과 엔비디아의 핵심 칩을 도맡아 생산하는 주요 파운드리 기업의 3분기 매출과 연말 실적 가이던스를 점검해요.",
    "impactTag": "호재 가능성",
    "importance": 3,
    "ticker": "TSM"
  },
  {
    "id": "oct-jnj-q3",
    "date": "2026-10-15",
    "time": "20:00",
    "title": "존슨앤존슨 (JNJ) 3분기 실적 발표",
    "type": "earnings",
    "region": "us",
    "simpleSummary": "제약 및 정밀 의료기기 부문의 글로벌 매출 신장세와 환율 변동에 따른 해외 수익성을 확인해요.",
    "impactTag": "관망",
    "importance": 2,
    "ticker": "JNJ"
  },
  {
    "id": "oct-tsla-q3",
    "date": "2026-10-21",
    "time": "05:30",
    "title": "테슬라 (TSLA) 3분기 실적 발표",
    "type": "earnings",
    "region": "us",
    "simpleSummary": "3분기 글로벌 차량 인도량과 에너지 부문 성장세, 자율주행(FSD) 및 로보택시 사업의 수익성을 확인해요.",
    "impactTag": "변동성 주의",
    "importance": 3,
    "ticker": "TSLA"
  },
  {
    "id": "oct-samsungbio-q3",
    "date": "2026-10-21",
    "time": "15:30",
    "title": "삼성바이오로직스 (207940) 3분기 실적 발표",
    "type": "earnings",
    "region": "kr",
    "simpleSummary": "1~4공장 풀가동 효과와 5공장 조기 완공 기대감, 연간 누적 수주 잔고 성장을 점검해요.",
    "impactTag": "호재 가능성",
    "importance": 2,
    "ticker": "207940"
  },
  {
    "id": "oct-bok-rate",
    "date": "2026-10-22",
    "time": "10:00",
    "title": "한국은행 금융통화위원회 기준금리 결정",
    "type": "economic",
    "region": "kr",
    "simpleSummary": "한국은행이 미국의 9월 금리 결정과 국내 가계부채 추이를 반영해 기준금리를 결정해요.",
    "impactTag": "핵심지표",
    "importance": 3,
    "previous": "3.00%"
  },
  {
    "id": "oct-hyundai-q3",
    "date": "2026-10-22",
    "time": "14:00",
    "title": "현대차 (005380) 3분기 실적 발표",
    "type": "earnings",
    "region": "kr",
    "simpleSummary": "북미 하이브리드 판매 비중 확대와 제네시스 프리미엄 수익성, 주주환원 자사주 매입 추진 현황을 공개해요.",
    "impactTag": "호재 가능성",
    "importance": 3,
    "ticker": "005380"
  },
  {
    "id": "oct-kbfg-q3",
    "date": "2026-10-22",
    "time": "16:00",
    "title": "KB금융 (105560) 3분기 실적 발표",
    "type": "earnings",
    "region": "kr",
    "simpleSummary": "금리 인하기 순이자마진(NIM) 방어력과 추가 주주환원 밸류업 이행 계획을 공식 발표해요.",
    "impactTag": "호재 가능성",
    "importance": 2,
    "ticker": "105560"
  },
  {
    "id": "oct-skhynix-q3",
    "date": "2026-10-23",
    "time": "09:00",
    "title": "SK하이닉스 3분기 잠정 실적 발표",
    "type": "earnings",
    "region": "kr",
    "simpleSummary": "글로벌 AI 가속기용 HBM 납품 실적과 D램·낸드 수익성 개선 흐름이 국내 반도체 섹터의 추가 상승 동력을 가늠해요.",
    "impactTag": "호재 가능성",
    "importance": 3,
    "ticker": "000660"
  },
  {
    "id": "oct-lgensol-q3",
    "date": "2026-10-26",
    "time": "09:30",
    "title": "LG에너지솔루션 (373220) 3분기 실적 발표",
    "type": "earnings",
    "region": "kr",
    "simpleSummary": "유럽 및 북미 주요 완성차 파트너사의 배터리 가동률과 원가 절감에 따른 분기 영업이익 개선을 점검해요.",
    "impactTag": "관망",
    "importance": 2,
    "ticker": "373220"
  },
  {
    "id": "oct-amd-q3",
    "date": "2026-10-27",
    "time": "05:30",
    "title": "AMD (AMD) 3분기 실적 발표",
    "type": "earnings",
    "region": "us",
    "simpleSummary": "차세대 AI GPU 출하 현황과 데이터센터 서버 CPU 시장 점유율 상승 추세를 확인해요.",
    "impactTag": "호재 가능성",
    "importance": 3,
    "ticker": "AMD"
  },
  {
    "id": "oct-v-q4",
    "date": "2026-10-27",
    "time": "05:30",
    "title": "비자 (V) 회계 4분기 실적 발표",
    "type": "earnings",
    "region": "us",
    "simpleSummary": "글로벌 전자결제 거래량 추이와 회계연도 전체 실적 결산 및 2027년 배당 확대 계획을 발표해요.",
    "impactTag": "관망",
    "importance": 2,
    "ticker": "V"
  },
  {
    "id": "oct-samsungel-q3",
    "date": "2026-10-27",
    "time": "14:00",
    "title": "삼성전기 (009150) 3분기 실적 발표",
    "type": "earnings",
    "region": "kr",
    "simpleSummary": "글로벌 AI 서버 및 전장용 고신뢰성 MLCC 공급 물량 확대와 패키지기판 수익성을 확인해요.",
    "impactTag": "호재 가능성",
    "importance": 2,
    "ticker": "009150"
  },
  {
    "id": "oct-msft-googl-q3",
    "date": "2026-10-28",
    "time": "05:30",
    "title": "마이크로소프트 (MSFT) & 알파벳 (GOOGL) 3분기 실적 발표",
    "type": "earnings",
    "region": "us",
    "simpleSummary": "클라우드 인프라(Azure, Google Cloud)의 두 자릿수 성장률과 기업용 AI 서비스 매출 기여도를 동시에 확인해요.",
    "impactTag": "핵심지표",
    "importance": 3,
    "ticker": "MSFT"
  },
  {
    "id": "oct-meta-q3",
    "date": "2026-10-28",
    "time": "05:30",
    "title": "메타 플랫폼스 (META) 3분기 실적 발표",
    "type": "earnings",
    "region": "us",
    "simpleSummary": "AI 어시스턴트 도입에 따른 사용자 체류시간 증가와 연말 쇼핑 시즌 디지털 광고 단가 추이를 확인해요.",
    "impactTag": "핵심지표",
    "importance": 3,
    "ticker": "META"
  },
  {
    "id": "oct-samsungcnt-q3",
    "date": "2026-10-28",
    "time": "15:00",
    "title": "삼성물산 (028260) 3분기 실적 발표",
    "type": "earnings",
    "region": "kr",
    "simpleSummary": "건설 하이테크 프로젝트 수익성과 상사 부문 친환경 원자재 트레이딩 실적을 점검해요.",
    "impactTag": "관망",
    "importance": 2,
    "ticker": "028260"
  },
  {
    "id": "oct-fomc-result",
    "date": "2026-10-29",
    "time": "03:00",
    "title": "미국 10월 FOMC 기준금리 결정",
    "type": "economic",
    "region": "us",
    "simpleSummary": "하반기 통화정책 기조를 재확인하는 연준의 정례 회의예요.",
    "impactTag": "핵심지표",
    "importance": 3
  },
  {
    "id": "oct-aapl-amzn-q3",
    "date": "2026-10-29",
    "time": "05:30",
    "title": "애플 (AAPL) & 아마존 (AMZN) 3분기 실적 발표",
    "type": "earnings",
    "region": "us",
    "simpleSummary": "애플의 신규 아이폰 판매 실적과 아마존의 AWS 클라우드 및 전자상거래 성수기 대비 전망을 공개해요.",
    "impactTag": "핵심지표",
    "importance": 3,
    "ticker": "AAPL"
  },
  {
    "id": "oct-samsung-q3-final",
    "date": "2026-10-29",
    "time": "08:30",
    "title": "삼성전자 (005930) 3분기 확정 실적 및 사업부별 세부 성적표",
    "type": "earnings",
    "region": "kr",
    "simpleSummary": "DS(반도체), DX(스마트폰/가전), SDC(디스플레이) 부문별 구체적 영업이익과 컨퍼런스콜 가이던스가 공개돼요.",
    "impactTag": "핵심지표",
    "importance": 3,
    "ticker": "005930"
  },
  {
    "id": "oct-lly-q3",
    "date": "2026-10-29",
    "time": "20:00",
    "title": "일라이 릴리 (LLY) 3분기 실적 발표",
    "type": "earnings",
    "region": "us",
    "simpleSummary": "글로벌 공급망 증설에 따른 비만 치료제 출하량 확대와 주요 신약 임상 진행 상황을 확인해요.",
    "impactTag": "호재 가능성",
    "importance": 3,
    "ticker": "LLY"
  },
  {
    "id": "oct-xom-q3",
    "date": "2026-10-30",
    "time": "20:30",
    "title": "엑슨모빌 (XOM) 3분기 실적 발표",
    "type": "earnings",
    "region": "us",
    "simpleSummary": "국제 유가 변동에 따른 정제마진 방어력과 업스트림 원유 생산 효율성을 점검해요.",
    "impactTag": "관망",
    "importance": 2,
    "ticker": "XOM"
  },
  {
    "id": "nov-brk-q3",
    "date": "2026-11-02",
    "time": "21:00",
    "title": "버크셔 해서웨이 (BRK.B) 3분기 실적 공시 (10-Q)",
    "type": "earnings",
    "region": "us",
    "simpleSummary": "워런 버핏의 3분기 주식 매수/매도 동향과 보험 부문 플로트(운용자산) 수익률을 확인해요.",
    "impactTag": "관망",
    "importance": 2,
    "ticker": "BRK_B"
  },
  {
    "id": "nov-us-election",
    "date": "2026-11-03",
    "title": "미국 중간선거 및 의회 구성 완료",
    "type": "economic",
    "region": "us",
    "simpleSummary": "의회 의석 분포와 향후 경제·무역 정책 기조를 좌우할 중요 정치 일정이에요.",
    "impactTag": "변동성 주의",
    "importance": 2
  },
  {
    "id": "nov-spcx-q3",
    "date": "2026-11-10",
    "time": "06:00",
    "title": "스페이스X (SPCX) 3분기 실적 발표",
    "type": "earnings",
    "region": "us",
    "simpleSummary": "차세대 우주선 스타십(Starship) 상용 비행 라이선스 진척과 스타링크 D2D(위성-스마트폰 직접 통신) 서비스 확장을 점검해요.",
    "impactTag": "호재 가능성",
    "importance": 3,
    "ticker": "SPCX"
  },
  {
    "id": "nov-cpi",
    "date": "2026-11-12",
    "time": "21:30",
    "title": "미국 10월 소비자물가지수 (CPI) 발표",
    "type": "economic",
    "region": "us",
    "simpleSummary": "연말 소비 시즌을 앞두고 물가 안정세가 지속되는지 점검해요.",
    "impactTag": "핵심지표",
    "importance": 3
  },
  {
    "id": "nov-sksquare-q3",
    "date": "2026-11-13",
    "time": "16:00",
    "title": "SK스퀘어 (402340) 3분기 분기보고서 공시",
    "type": "earnings",
    "region": "kr",
    "simpleSummary": "SK하이닉스 실적 모멘텀에 따른 순자산가치(NAV) 할인율 축소와 신규 테크 투자 방향을 확인해요.",
    "impactTag": "관망",
    "importance": 2,
    "ticker": "402340"
  },
  {
    "id": "nov-samsunglife-q3",
    "date": "2026-11-13",
    "time": "16:30",
    "title": "삼성생명 (032830) 3분기 분기보고서 공시",
    "type": "earnings",
    "region": "kr",
    "simpleSummary": "금융당국 건전성 제도 하에서 K-ICS(지급여력비율) 안정성과 연간 배당 가시성을 점검해요.",
    "impactTag": "관망",
    "importance": 2,
    "ticker": "032830"
  },
  {
    "id": "nov-wmt-q3",
    "date": "2026-11-17",
    "time": "20:00",
    "title": "월마트 (WMT) 회계 3분기 실적 발표",
    "type": "earnings",
    "region": "us",
    "simpleSummary": "추수감사절과 연말 홀리데이 쇼핑 성수기를 앞두고 미국 일반 가계의 소비 심리 상태를 확인해요.",
    "impactTag": "관망",
    "importance": 2,
    "ticker": "WMT"
  },
  {
    "id": "nov-nvda-q3",
    "date": "2026-11-18",
    "time": "06:00",
    "title": "엔비디아 (NVDA) 회계 3분기 실적 발표",
    "type": "earnings",
    "region": "us",
    "simpleSummary": "차세대 블랙웰(Blackwell B200) 아키텍처의 대량 납품 실적과 AI 생태계 수주 잔고를 총결산해요.\n글로벌 테크 섹터 연말 랠리의 최대 분수령입니다.",
    "impactTag": "핵심지표",
    "importance": 3,
    "ticker": "NVDA"
  },
  {
    "id": "nov-thanksgiving",
    "date": "2026-11-26",
    "title": "미국 증시 휴장 (추수감사절)",
    "type": "holiday",
    "region": "us",
    "simpleSummary": "미국 최대 명절로 뉴욕 증시가 전면 휴장합니다.",
    "impactTag": "관망",
    "importance": 1,
    "isHoliday": true
  },
  {
    "id": "dec-avgo-q4",
    "date": "2026-12-03",
    "time": "06:00",
    "title": "브로드컴 (AVGO) 회계 4분기 및 연간 실적 발표",
    "type": "earnings",
    "region": "us",
    "simpleSummary": "2026 회계연도 전체 결산 및 2027년 커스텀 AI 가속기 칩 공급 전망과 배당 증액을 발표해요.",
    "impactTag": "호재 가능성",
    "importance": 3,
    "ticker": "AVGO"
  },
  {
    "id": "dec-cpi",
    "date": "2026-12-10",
    "time": "21:30",
    "title": "미국 11월 소비자물가지수 (CPI) 발표",
    "type": "economic",
    "region": "us",
    "simpleSummary": "올해 마지막 FOMC를 앞두고 확인하는 최종 물가 성적표예요.",
    "impactTag": "핵심지표",
    "importance": 3
  },
  {
    "id": "dec-fomc-result",
    "date": "2026-12-17",
    "time": "03:00",
    "title": "미국 12월 FOMC 연간 최종 금리 결정 및 2027년 점도표 공개",
    "type": "economic",
    "region": "us",
    "simpleSummary": "2026년을 결산하고 2027년 새해 글로벌 금리 경로를 제시하는 연중 가장 중요한 회의예요.",
    "impactTag": "핵심지표",
    "importance": 3
  },
  {
    "id": "dec-christmas",
    "date": "2026-12-25",
    "title": "미국 증시 휴장 (크리스마스)",
    "type": "holiday",
    "region": "us",
    "simpleSummary": "성탄절로 전 세계 주요 금융 시장이 함께 쉬어갑니다.",
    "impactTag": "관망",
    "importance": 1,
    "isHoliday": true
  },
  {
    "id": "dec-kr-close",
    "date": "2026-12-31",
    "title": "한국 증시 연말 휴장일 (배당락 이후 폐장)",
    "type": "holiday",
    "region": "kr",
    "simpleSummary": "국내 주식시장은 매년 마지막 거래일 전날까지만 열리고 12월 31일은 휴장합니다.",
    "impactTag": "관망",
    "importance": 1,
    "isHoliday": true
  }
];

// 이벤트 유형별 스타일 설정
export const EVENT_TYPE_CONFIG: Record<EventType, {
  label: string;
  dotColor: string;
  badgeBg: string;
  badgeText: string;
}> = {
  economic: {
    label: '경제지표',
    dotColor: 'bg-[var(--fintech-emerald)]',
    badgeBg: 'bg-[var(--fintech-emerald)]/15',
    badgeText: 'text-[var(--fintech-emerald)]',
  },
  earnings: {
    label: '실적발표',
    dotColor: 'bg-[var(--royal-indigo)]',
    badgeBg: 'bg-[var(--royal-indigo)]/15',
    badgeText: 'text-[var(--royal-indigo)]',
  },
  holiday: {
    label: '휴장일',
    dotColor: 'bg-[var(--text-secondary)]',
    badgeBg: 'bg-[var(--text-secondary)]/10',
    badgeText: 'text-[var(--text-secondary)]',
  },
  dividend: {
    label: '배당/기타',
    dotColor: 'bg-purple-500',
    badgeBg: 'bg-purple-500/15',
    badgeText: 'text-purple-500',
  },
};

export const IMPACT_TAG_CONFIG: Record<ImpactTag, {
  bg: string;
  text: string;
  dot: string;
}> = {
  '호재 가능성': { bg: 'bg-[var(--fintech-emerald)]/15', text: 'text-[var(--fintech-emerald)]', dot: '🟢' },
  '변동성 주의': { bg: 'bg-amber-500/15', text: 'text-amber-500', dot: '🟡' },
  '관망': { bg: 'bg-[var(--text-secondary)]/10', text: 'text-[var(--text-secondary)]', dot: '⚪' },
  '핵심지표': { bg: 'bg-[var(--accent-orange)]/15', text: 'text-[var(--accent-orange)]', dot: '🟠' },
};
