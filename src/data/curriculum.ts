export interface Lesson {
  id: string; // e.g. "lv0-1"
  levelId: string; // "lv0"
  lessonNumber: number;
  title: string;
  subtitle: string;
  youtubeId: string;
  duration: string;
  summary: string[];
  cardNewsTitles: string[];
  interactiveToolType?: 'db_cta' | 'mbti_test' | 'calc' | 'ai_prompt';
}

export interface Level {
  id: string;
  levelId?: string;
  levelNumber: number;
  title: string;
  description: string;
  badgeText: string;
  iconName: string;
  lessons: Lesson[];
}

export const CURRICULUM_DATA: Level[] = [
  {
    id: "lv0",
    levelNumber: 0,
    title: "주식 투자 전 알아야 할 마인드셋",
    description: "투자의 기초 동기부여부터 복리의 마법, 그리고 평생 흔들리지 않을 투자 철학 구축하기",
    badgeText: "투자의 기초",
    iconName: "Brain",
    lessons: [
      {
        id: "lv0-1",
        levelId: "lv0",
        lessonNumber: 1,
        title: "1강. 투자의 동기",
        subtitle: "",
        youtubeId: "50KkWkqqKkQ",
        duration: "4:12",
        summary: [
          "월급만으로는 물가상승률과 자산 인플레이션을 따라잡기 힘든 현실 분석",
          "자본주의 사회에서 노동 소득을 자본 소득으로 전환하는 시스템 구축의 필요성",
          "투자는 위험한 도박이 아니라, 우상향하는 경제 성장에 올라타는 파트너십"
        ],
        cardNewsTitles: [
          "노동소득 VS 자본소득의 격차",
          "물가상승률과 내 월급의 진실",
          "성공적인 투자의 시작점 3가지"
        ]
      },
      {
        id: "lv0-2",
        levelId: "lv0",
        lessonNumber: 2,
        title: "2강. 복리와 시간",
        subtitle: "",
        youtubeId: "vDo857gB1j0",
        duration: "5:39",
        summary: [
          "아인슈타인이 인류 세계 8대 불가사의라 칭한 '복리(Compound Interest)'의 매커니즘",
          "하루라도 일찍 투자를 시작해야 하는 시간 프리미엄 효과 분석",
          "소액 적립식 투자자가 장기 복리로 승리하는 실증 데이터 공개"
        ],
        cardNewsTitles: [
          "단리 vs 복리 수익률 그래프",
          "10년 일찍 시작한 투자자의 차이",
          "복리 효과를 극대화하는 규칙"
        ]
      },
      {
        id: "lv0-3",
        levelId: "lv0",
        lessonNumber: 3,
        title: "3강. 투자와 철학",
        subtitle: "",
        youtubeId: "hPDV4XWN9AU",
        duration: "4:37",
        summary: [
          "시장 변동성 앞에서 멘탈을 유지하는 굳건한 원칙 수립",
          "워렌 버핏과 찰리 멍거의 핵심 마인드셋 구조 분석",
          "단기 시세에 일희일비하지 않고 위기를 기회로 바꾸는 심리 제어법"
        ],
        cardNewsTitles: [
          "투자 심리 4단계 변화",
          "대중과 반대로 움직이는 거인의 철학",
          "주식부엉 마인드셋 체크리스트"
        ]
      }
    ]
  },
  {
    id: "lv1",
    levelNumber: 1,
    title: "무작정 따라 하는 첫 주식 구매",
    description: "필수 주식 용어부터 계좌 개설, 주식 모으기 자동 적립까지 실전으로 따라하기",
    badgeText: "첫 매수 실습",
    iconName: "ShoppingBag",
    lessons: [
      {
        id: "lv1-1",
        levelId: "lv1",
        lessonNumber: 1,
        title: "1강. 필수 주식 용어 총정리",
        subtitle: "PER, PBR, 배당수익률 초보자 맞춤 해설",
        youtubeId: "dQw4w9WgXcQ",
        duration: "15:30",
        summary: [
          "주식시장의 기본 메커니즘과 거래 시간 및 방식 이해",
          "시가총액, PER, PBR, ROE 핵심 지표의 쉬운 해석법",
          "체결, 미체결, 지정가, 시장가 주문 방식의 차이점"
        ],
        cardNewsTitles: [
          "핵심 주식 용어 5가지 한눈에 보기",
          "주문 종류(지정가/시장가) 실수 방지법",
          "좋은 주식을 가려내는 3가지 신호"
        ]
      },
      {
        id: "lv1-2",
        levelId: "lv1",
        lessonNumber: 2,
        title: "2강. DB증권 제휴계좌 개설 실습",
        subtitle: "혜택 가득한 비대면 계좌 개설 A to Z",
        youtubeId: "dQw4w9WgXcQ",
        duration: "12:15",
        summary: [
          "주식부엉 전용 혜택이 적용되는 DB증권 제휴계좌 신청 가이드",
          "모바일 신분증 촬영 및 본인 인증 실습 화면 튜토리얼",
          "수수료 우대 혜택 및 무료 주식 받는 꿀팁 안내"
        ],
        cardNewsTitles: [
          "DB증권 제휴 계좌 개설 5단계",
          "수수료 혜택 자동 적용 확인법",
          "첫 입금 및 준비 완료 안내"
        ],
        interactiveToolType: "db_cta"
      },
      {
        id: "lv1-3",
        levelId: "lv1",
        lessonNumber: 3,
        title: "3강. 주식 모으기 자동 적립 세팅",
        subtitle: "신경 쓰지 않고 저절로 자산이 늘어나는 적립 시스템",
        youtubeId: "dQw4w9WgXcQ",
        duration: "17:00",
        summary: [
          "매월/매주 지정된 날짜에 주식을 자동 매수하는 소액 적립 기능",
          "달러 환전 없이 미주 주식을 자동 적립하는 최적 세팅",
          "감정을 배제한 소액 자동 투자로 장기 승리하기"
        ],
        cardNewsTitles: [
          "주식 모으기 자동 예약 설정법",
          "소액 분할 매수의 놀라운 안정성",
          "자동 적립 추천 종목 포트폴리오"
        ]
      }
    ]
  },
  {
    id: "lv2",
    levelId: "lv2",
    levelNumber: 2,
    title: "세금 0원 만드는 주식 절세 전략",
    description: "ISA, 연금저축, IRP 등 합법적 절세 계좌를 활용해 세금을 최소화하는 노하우",
    badgeText: "절세 계좌 세팅",
    iconName: "ShieldCheck",
    lessons: [
      {
        id: "lv2-1",
        levelId: "lv2",
        lessonNumber: 1,
        title: "1강. ISA 계좌 활용법",
        subtitle: "배당금과 매매차익 세금 100% 비과세 혜택받기",
        youtubeId: "dQw4w9WgXcQ",
        duration: "20:10",
        summary: [
          "ISA(개인종합자산관리계좌)의 의무 가입 기간과 한도 구조",
          "일반형 vs 서민형 비과세 한도 격차 및 절세액 계산법",
          "국내 상장 해외 ETF 투자 시 ISA가 필수인 이유"
        ],
        cardNewsTitles: [
          "ISA 일반계좌 세금 비교 표",
          "ISA 계좌 만기 후 연금 이전 전략",
          "ISA에서 담아야 할 필수 종목"
        ]
      },
      {
        id: "lv2-2",
        levelId: "lv2",
        lessonNumber: 2,
        title: "2강. 연금저축펀드 세액공제",
        subtitle: "연말정산 16.5% 세액공제 환급받는 연금 전략",
        youtubeId: "dQw4w9WgXcQ",
        duration: "19:30",
        summary: [
          "연 최대 600만원 납입 시 99만원 세금 돌려받는 세액공제 메커니즘",
          "연금저축계좌에서 장기 우상향 ETF로 자산 굴리기",
          "과세이연과 과세유예의 강력한 복리 증폭 효과"
        ],
        cardNewsTitles: [
          "연말정산 세액공제 금액 계산법",
          "연금저축 ETF 장기 투자 시뮬레이션",
          "연금 수령 시 주의해야 할 절세 기준"
        ]
      },
      {
        id: "lv2-3",
        levelId: "lv2",
        lessonNumber: 3,
        title: "3강. IRP 퇴직연금 세팅",
        subtitle: "연금저축과 합쳐서 900만원 세액공제 완성하기",
        youtubeId: "dQw4w9WgXcQ",
        duration: "15:40",
        summary: [
          "IRP 계좌와 연금저축 계좌의 차이점 및 안전자산 30% 규정 해설",
          "안전자산 30%를 채우면서 높은 수익률을 내는 스마트 상품 구성",
          "퇴직금 수령 시 IRP를 활용한 퇴직소득세 30~40% 감면 노하우"
        ],
        cardNewsTitles: [
          "연금저축 + IRP 900만원 조합 공식",
          "안전자산 30% 채우기 추천 상품",
          "퇴직소득세 절감 실전 적용법"
        ]
      }
    ]
  },
  {
    id: "lv3",
    levelId: "lv3",
    levelNumber: 3,
    title: "안전한 주식 투자를 위한 자산 배분",
    description: "30초 투자 성향 검사(MBTI)부터 올웨더 포트폴리오, 위험 관리 분산 기법까지",
    badgeText: "자산 배분 진단",
    iconName: "PieChart",
    lessons: [
      {
        id: "lv3-1",
        levelId: "lv3",
        lessonNumber: 1,
        title: "1강. 자산배분 원리와 포트폴리오",
        subtitle: "왜 자산배분이 주식 수익의 90%를 결정하는가?",
        youtubeId: "dQw4w9WgXcQ",
        duration: "21:00",
        summary: [
          "상상관관계가 낮은 자산(주식, 채권, 원자재, 현금) 조합의 과학적 원리",
          "하락장에서도 마이너스 폭을 크게 줄이는 포트폴리오 방어력",
          "마음 편하게 밤에 잠들 수 있는 마음 안정형 분산 투자"
        ],
        cardNewsTitles: [
          "자산간 상관관계 지도",
          "단일 주식 vs 자산배분 하락폭 비교",
          "나에게 맞는 비중 조합 찾기"
        ]
      },
      {
        id: "lv3-2",
        levelId: "lv3",
        lessonNumber: 2,
        title: "2강. 30초 투자 성향 검사 (MBTI)",
        subtitle: "나의 성향에 맞는 최적의 포트폴리오 진단하기",
        youtubeId: "dQw4w9WgXcQ",
        duration: "11:50",
        summary: [
          "공격투자형, 안정추구형, 수입형(배당) 등 30초 MBTI 진단 테스트",
          "성향별 맞춤 추천 포트폴리오 비율 가이드 (주식/채권/원자재)",
          "자신의 스트레스 내성을 파악하여 지속 가능한 시스템 구축하기"
        ],
        cardNewsTitles: [
          "투자 MBTI 4가지 유형 분석",
          "유형별 맞춤 포트폴리오 가이드",
          "성향 진단 결과 활용법"
        ],
        interactiveToolType: "mbti_test"
      },
      {
        id: "lv3-3",
        levelId: "lv3",
        lessonNumber: 3,
        title: "3강. 올웨더 & 미주 분산 전략",
        subtitle: "사계절 경제 상황에서도 손실 없는 전략",
        youtubeId: "dQw4w9WgXcQ",
        duration: "23:15",
        summary: [
          "레이 달리오의 올웨더(All Weather) 전략 원리 정밀 해설",
          "인플레이션, 경기후퇴, 금리인상 시기별 이기는 자산군 구성",
          "미국 지수 ETF(S&P500, Nasdaq)와 달러 자산의 든든한 헤지 역할"
        ],
        cardNewsTitles: [
          "사계절 올웨더 포트폴리오 비율",
          "환율 변동과 미국 주식의 관계",
          "월간 주기별 포트폴리오 점검표"
        ]
      }
    ]
  },
  {
    id: "lv4",
    levelId: "lv4",
    levelNumber: 4,
    title: "수익률을 극대화하는 적극적 투자 방법",
    description: "적립식 변동 매매, 정기 리밸런싱, 트레이딩뷰 얼러트 웹훅 연동으로 전략 고도화",
    badgeText: "적극적 투자",
    iconName: "TrendingUp",
    lessons: [
      {
        id: "lv4-1",
        levelId: "lv4",
        lessonNumber: 1,
        title: "1강. 적립식 변동 매매법",
        subtitle: "주가 하락 시 매수량을 늘려 평단가를 획기적으로 낮추기",
        youtubeId: "dQw4w9WgXcQ",
        duration: "24:00",
        summary: [
          "단순 정량 적립을 뛰어넘는 이동평균선 기반 스마트 변동 매매법",
          "공포 지수(VIX) 및 RSI 지표를 활용한 분할 추가 매수 타이밍",
          "백테스팅으로 증명된 적립식 변동 매매의 알파 수익률"
        ],
        cardNewsTitles: [
          "스마트 변동 매매 규칙 3단계",
          "공포 탐욕 지수 활용법",
          "평단가 개선 시뮬레이션"
        ]
      },
      {
        id: "lv4-2",
        levelId: "lv4",
        lessonNumber: 2,
        title: "2강. 리밸런싱 공식과 실습",
        subtitle: "싸게 사고 비싸게 파는 기계적 리밸런싱 시스템",
        youtubeId: "dQw4w9WgXcQ",
        duration: "18:20",
        summary: [
          "목표 비중에서 벗어난 자산을 기계적으로 조정하는 리밸런싱의 위력",
          "분기별/반년별 주기적 리밸런싱 vs 밴드 리밸런싱 장단점",
          "엑셀 및 웹 계산기를 활용한 3분 리밸런싱 실습"
        ],
        cardNewsTitles: [
          "리밸런싱 전후 수익률 차이",
          "쉬운 리밸런싱 계산 공식",
          "매매 수수료 감안한 최적 주기"
        ],
        interactiveToolType: "calc"
      },
      {
        id: "lv4-3",
        levelId: "lv4",
        lessonNumber: 3,
        title: "3강. TradingView 얼러트 연동",
        subtitle: "조건이 맞을 때 차트 신호를 스마트폰 알림으로 받기",
        youtubeId: "dQw4w9WgXcQ",
        duration: "22:10",
        summary: [
          "트레이딩뷰(TradingView) 지표 설정 및 커스텀 얼러트 알림 구축",
          "주요 이동평균선 돌파 및 과매도 구간 매수 알림 자동화",
          "모바일 푸시 알림으로 시세에 지치지 않는 스마트 트레이딩"
        ],
        cardNewsTitles: [
          "TradingView 지표 설정 가이드",
          "스마트폰 텔레그램/푸시 알림 연동",
          "매수/매도 신호 조건식 예시"
        ]
      }
    ]
  },
  {
    id: "lv5",
    levelId: "lv5",
    levelNumber: 5,
    title: "AI를 활용한 주식 분석과 자동 매매",
    description: "AI 기반 종목 & 공시 스마트 스크리닝, 자동 매매 알고리즘 구축까지 완벽 가이드",
    badgeText: "AI 자동 매매",
    iconName: "Cpu",
    lessons: [
      {
        id: "lv5-1",
        levelId: "lv5",
        lessonNumber: 1,
        title: "1강. 차트 & 재무지표 기초 분석",
        subtitle: "AI 프롬프트에 넣을 재무 데이터와 주가 데이터 추출하기",
        youtubeId: "dQw4w9WgXcQ",
        duration: "26:30",
        summary: [
          "기업 재무제표(손익계산서, 재무상태표, 현금흐름표) 핵심 구별법",
          "Dart(금융감독원 전자공시) 공시 읽는 필수 노하우",
          "AI에 전달할 텍스트 재무 데이터 가공 가이드"
        ],
        cardNewsTitles: [
          "3분 기업 재무 분석 팁",
          "Dart 필수 공시 체크 항목",
          "AI 분석용 데이터 준비"
        ]
      },
      {
        id: "lv5-2",
        levelId: "lv5",
        lessonNumber: 2,
        title: "2강. AI 기반 종목/공시 스크리닝",
        subtitle: "LLM을 활용해 유망 종목과 주요 호재/악재 공시 3초 분석",
        youtubeId: "dQw4w9WgXcQ",
        duration: "28:15",
        summary: [
          "주식부엉 특허 프롬프트: 기업 실적 및 공시 자동 심층 분석",
          "퀀트 스크리닝 조건(ROE > 15%, low PER) AI 자동 필터링",
          "AI 분석 리포트를 10초 만에 생성하고 판단하는 실전 프롬프트"
        ],
        cardNewsTitles: [
          "주식부엉 AI 스크리닝 프롬프트",
          "기업 공시 요약 예시",
          "AI 위험 종목 필터링 기준"
        ],
        interactiveToolType: "ai_prompt"
      },
      {
        id: "lv5-3",
        levelId: "lv5",
        lessonNumber: 3,
        title: "3강. 자동 매매 시스템 완성",
        subtitle: "파이썬 & 증권사 API를 활용해 자는 동안에도 일하는 매매봇",
        youtubeId: "dQw4w9WgXcQ",
        duration: "35:00",
        summary: [
          "증권사 Open API 계좌 연동 및 보안 키 세팅 가이드",
          "매수 조건 충족 시 자동 주문 실행 알고리즘 봇 구조",
          "서버 구축 및 24시간 안심 모니터링 시스템 완성"
        ],
        cardNewsTitles: [
          "자동 매매 봇 실행 흐름도",
          "증권사 API 연결 3단계",
          "리스크 관리(손절선/익절선) 자동화"
        ]
      }
    ]
  }
];

export function getLessonById(id: string): { lesson: Lesson; level: Level } | undefined {
  for (const level of CURRICULUM_DATA) {
    const lesson = level.lessons.find((l) => l.id === id);
    if (lesson) {
      return { lesson, level };
    }
  }
  return undefined;
}

export function getAllLessons(): Lesson[] {
  return CURRICULUM_DATA.flatMap((level) => level.lessons);
}
