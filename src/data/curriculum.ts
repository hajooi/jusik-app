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
  isComingSoon?: boolean;
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
    isComingSoon: true,
    lessons: []
  },
  {
    id: "lv2",
    levelId: "lv2",
    levelNumber: 2,
    title: "세금 0원 만드는 주식 절세 전략",
    description: "ISA, 연금저축, IRP 등 합법적 절세 계좌를 활용해 세금을 최소화하는 노하우",
    badgeText: "절세 계좌 세팅",
    iconName: "ShieldCheck",
    isComingSoon: true,
    lessons: []
  },
  {
    id: "lv3",
    levelId: "lv3",
    levelNumber: 3,
    title: "안전한 주식 투자를 위한 자산 배분",
    description: "투자 성향 검사부터 올웨더 포트폴리오, 위험 관리 분산 기법까지",
    badgeText: "자산 배분 진단",
    iconName: "PieChart",
    isComingSoon: true,
    lessons: []
  },
  {
    id: "lv4",
    levelId: "lv4",
    levelNumber: 4,
    title: "수익률을 극대화하는 적극적 투자 방법",
    description: "적립식 변동 매매, 정기 리밸런싱, 트레이딩뷰 얼러트 웹훅 연동으로 전략 고도화",
    badgeText: "적극적 투자",
    iconName: "TrendingUp",
    isComingSoon: true,
    lessons: []
  },
  {
    id: "lv5",
    levelId: "lv5",
    levelNumber: 5,
    title: "AI를 활용한 주식 분석과 자동 매매",
    description: "AI 기반 종목 & 공시 스마트 스크리닝, 자동 매매 알고리즘 구축까지 완벽 가이드",
    badgeText: "AI 자동 매매",
    iconName: "Cpu",
    isComingSoon: true,
    lessons: []
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
