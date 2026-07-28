export type ModuleType = 'guide_steps' | 'resources' | 'cta';

export interface GuideStep {
  stepNumber: number;
  title: string;
  description: string;
}

export interface GuideStepsModule {
  type: 'guide_steps';
  title: string;
  description?: string;
  steps: GuideStep[];
}

export interface ResourceLink {
  label: string;
  url: string;
  type?: 'link' | 'file' | 'reference';
  description?: string;
}

export interface ResourcesModule {
  type: 'resources';
  title: string;
  description?: string;
  links: ResourceLink[];
}

export interface CTAModule {
  type: 'cta';
  title: string;
  description: string;
  buttonText: string;
  buttonUrl: string;
  badge?: string;
  isExternal?: boolean;
}

export type LessonModule = GuideStepsModule | ResourcesModule | CTAModule;

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
  modules?: LessonModule[];
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
    title: "투자의 원리",
    description: "투자의 기초 동기부여부터 복리의 마법, 그리고 평생 흔들리지 않을 투자 철학 구축하기",
    badgeText: "투자의 원리",
    iconName: "Brain",
    lessons: [
      {
        id: "lv0-1",
        levelId: "lv0",
        lessonNumber: 1,
        title: "1강. 투자의 동기",
        subtitle: "AI 시대, 직장인이 가장 먼저 가난해지는 이유",
        youtubeId: "50KkWkqqKkQ",
        duration: "4:12",
        summary: [
          "AI와 로봇이 인간의 노동을 대체하는 시대, 노동의 가치가 0원이 되는 위기",
          "1769년 방직기 혁명처럼 자본을 소유한 공장주가 부를 독식하는 메커니즘",
          "미국 1등 빅테크 기업의 주인이 되어 내 돈이 24시간 일하게 만들기"
        ],
        cardNewsTitles: [
          "노동의 가치가 '0원'이 되는 시대",
          "방직기 혁명과 부의 독식",
          "1등 기업의 주인이 되는 법"
        ]
      },
      {
        id: "lv0-2",
        levelId: "lv0",
        lessonNumber: 2,
        title: "2강. 복리와 시간",
        subtitle: "현금 10억 VS 월 500만 원: 당신이 몰랐던 돈의 진짜 비밀",
        youtubeId: "vDo857gB1j0",
        duration: "5:39",
        summary: [
          "미래의 500만 원은 인플레이션으로 인해 지속적으로 가치가 하락함",
          "10억 원을 미국 주식 시장에 넣어두면 연 8% 기준 매달 667만 원 수익 시스템 완성",
          "원금과 이자가 함께 불어나는 복리의 눈덩이 효과로 자산 격차 극대화"
        ],
        cardNewsTitles: [
          "미래의 500만 원과 화폐 가치 하락",
          "10억 원 보유 시 매달 667만 원의 비밀",
          "복리의 눈덩이 효과"
        ]
      },
      {
        id: "lv0-3",
        levelId: "lv0",
        lessonNumber: 3,
        title: "3강. 투자와 철학",
        subtitle: "감정에 휩쓸려 사고파는 우리가 가져야 할 마음가짐",
        youtubeId: "hPDV4XWN9AU",
        duration: "4:37",
        summary: [
          "나도 모르게 주식을 사고파는 뇌의 자극과 공포 본능 차단",
          "주식 구매 전 3초 질문으로 조급함과 무턱대고 투자하는 실수 방지",
          "시장의 분위기보다 내 마음을 읽고 기준을 세워 자산 지키기"
        ],
        cardNewsTitles: [
          "사고파는 뇌의 본능 차단",
          "주식 구매 전 3초 질문",
          "시장의 분위기보다 내 마음 읽기"
        ]
      }
    ]
  },
  {
    id: "lv1",
    levelNumber: 1,
    title: "첫 구매 실습",
    description: "필수 주식 용어부터 계좌 개설, 주식 모으기 자동 적립까지 실전으로 따라하기",
    badgeText: "첫 구매 실습",
    iconName: "ShoppingBag",
    lessons: [
      {
        id: "lv1-1",
        levelId: "lv1",
        lessonNumber: 1,
        title: "1강. 종목 선택",
        subtitle: "1등 기업이 아닌 미국 시장 전체를 통째로 사야 하는 이유",
        youtubeId: "UI2ga-MHlpQ",
        duration: "4:52",
        summary: [
          "1등 기업 시스코 사례로 본 개별 주식 투자 맹신의 위험성",
          "돈 잘 버는 미국 대표 500개 기업에 알아서 투자해주는 S&P 500",
          "월가 전문가 90%를 이기는 가장 확실하고 안전한 투자 첫 단추"
        ],
        cardNewsTitles: [
          "1등 기업 맹신의 위험성",
          "미국 S&P 500 시장 시스템",
          "전문가 90%를 이기는 기본기"
        ]
      }
    ]
  },
  {
    id: "lv2",
    levelId: "lv2",
    levelNumber: 2,
    title: "자산 배분",
    description: "투자 성향 검사부터 올웨더 포트폴리오, 위험 관리 분산 기법까지",
    badgeText: "자산 배분",
    iconName: "PieChart",
    isComingSoon: true,
    lessons: []
  },
  {
    id: "lv3",
    levelId: "lv3",
    levelNumber: 3,
    title: "절세와 계좌",
    description: "ISA, 연금저축, IRP 등 합법적 절세 계좌를 활용해 세금을 최소화하는 노하우",
    badgeText: "절세와 계좌",
    iconName: "ShieldCheck",
    isComingSoon: true,
    lessons: []
  },
  {
    id: "lv4",
    levelId: "lv4",
    levelNumber: 4,
    title: "초과 수익 전략",
    description: "적립식 변동 매매, 정기 리밸런싱, 트레이딩뷰 얼러트 웹훅 연동으로 전략 고도화",
    badgeText: "초과 수익 전략",
    iconName: "TrendingUp",
    isComingSoon: true,
    lessons: []
  },
  {
    id: "lv5",
    levelId: "lv5",
    levelNumber: 5,
    title: "AI 투자 시스템",
    description: "AI 기반 종목 & 공시 스마트 스크리닝, 자동 매매 알고리즘 구축까지 완벽 가이드",
    badgeText: "AI 투자 시스템",
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
