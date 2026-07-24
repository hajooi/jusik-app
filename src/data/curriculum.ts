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
          "미국 1등 빅테크 기업의 주주(자본가)가 되어 내 돈이 24시간 일하게 만드는 법"
        ],
        cardNewsTitles: [
          "노동의 가치가 '0원'이 되는 시대",
          "방직기 혁명과 부의 독식",
          "1등 기업의 주인이 되는 법"
        ],
        modules: [
          {
            type: 'guide_steps',
            title: '강의 노트: 저축은 가장 확실하게 가난해지는 길',
            description: 'AI가 인간의 노동을 대체하는 시대, 왜 우리가 당장 미국 주식을 시작해야 하는지 3가지 이유로 정리해 드립니다.',
            steps: [
              {
                stepNumber: 1,
                title: "AI와 로봇으로 인해 노동의 가치가 '0원'이 되는 시대가 옵니다",
                description: "일론 머스크의 경고처럼, AI와 로봇이 인간의 일을 대체하고 있습니다. 내 손으로 돈 벌 능력이 사라진다는 건 내 밥줄을 남에게 넘긴다는 뜻입니다. 빅테크가 던져주는 푼돈에 목숨 걸지 않으려면 스스로 자산 시스템을 구축해야 합니다."
              },
              {
                stepNumber: 2,
                title: "수백 년 전 방직기 혁명 때도 기계를 가진 자본가가 부를 독식했습니다",
                description: "1769년 방직기가 나왔을 때 생산량은 100배 늘었지만 노동자는 더 가난해졌고, 부는 공장주가 쓸어 담았습니다. 지금의 AI 혁명도 똑같습니다. 월급만 아껴 저축하는 것은 과거 길거리로 쫓겨난 노동자의 길을 답습하는 것입니다."
              },
              {
                stepNumber: 3,
                title: "스마트폰 터치 몇 번으로 1등 기업을 소유해 '자본가'가 되어야 합니다",
                description: "과거 노동자는 공장주를 찾아가 동업할 수 없었지만, 지금 우리는 미국 1등 기업의 주식을 사서 그들의 주인이 될 수 있습니다. 1등 기업과 동업하여 내 돈이 나 대신 24시간 일하게 만드는 것이 현대판 노예를 피할 유일한 정답입니다."
              }
            ]
          }
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
        ],
        modules: [
          {
            type: 'guide_steps',
            title: '강의 노트: 매달 받는 500만 원보다, 지금 당장의 10억을 선택해야 하는 이유',
            description: '단순히 돈을 모으는 것과, 거대한 돈을 굴리는 것의 압도적인 차이를 3가지로 정리해 드립니다.',
            steps: [
              {
                stepNumber: 1,
                title: '미래에 받는 500만 원은 물가 상승 때문에 계속 가치가 떨어집니다',
                description: '어릴 적 500원 하던 아이스크림이 지금 1,500원이 된 것처럼, 돈의 가치는 시간이 흐를수록 약해집니다. 따라서 지금 당장 쥐는 500만 원과, 10년, 20년 뒤에 뒤늦게 받는 500만 원은 이름만 같을 뿐 실제 가치가 완전히 다릅니다.'
              },
              {
                stepNumber: 2,
                title: '10억 원을 갖고만 있어도 매달 667만 원이 저절로 들어옵니다',
                description: '10억 원을 미국의 주식 시장에 넣어두면, 연평균 8% 수익률 기준 원금은 10억 그대로 유지되면서 매달 약 667만 원의 수익이 계속 발생합니다. 즉, 10억 원을 선택하는 순간 이미 \'월 500만 원\'보다 더 많은 돈이 매달 들어오는 시스템을 갖추게 됩니다.'
              },
              {
                stepNumber: 3,
                title: '복리는 돈이 다시 돈을 버는 눈덩이 효과입니다',
                description: '10억 원에서 나온 수익을 쓰지 않고 다시 투자하면, 그 늘어난 원금에 또 이자가 붙으면서 자산이 폭발적으로 불어납니다. 처음부터 10억이라는 거대한 눈덩이를 굴리는 것과, 매달 500만 원씩 작은 눈송이를 모아 굴리는 것은 시간이 지날수록 절대 따라잡을 수 없는 차이가 납니다.'
              }
            ]
          }
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
          "시장의 분위기보다 내 마음을 읽고 기준을 세워 자산을 지키는 법"
        ],
        cardNewsTitles: [
          "사고파는 뇌의 본능 차단",
          "주식 구매 전 3초 질문",
          "시장의 분위기보다 내 마음 읽기"
        ],
        modules: [
          {
            type: 'guide_steps',
            title: '강의 노트: 주식으로 돈을 잃는 진짜 이유',
            description: '남들 따라서 무작정 샀다가 후회하는 일을 안 만드는 3가지 원칙을 정리해 드립니다.',
            steps: [
              {
                stepNumber: 1,
                title: '나도 모르게 주식을 사고파는 건 뇌의 본능 때문입니다',
                description: '손해 보는 게 두려워서 나쁜 주식을 계속 쥐고 있고, 남들 돈 번다는 말에 덜컥 비싸게 따라 사며, 겁이 나서 바닥에서 던져버리는 것. 이건 당신이 우유부단해서가 아니라, 우리 뇌가 자극과 공포에 반응하도록 만들어졌기 때문입니다. 이 나쁜 습관을 끊는 힘이 바로 \'나만의 투자 철학\'입니다.'
              },
              {
                stepNumber: 2,
                title: '사고 싶은 마음이 들 때 딱 3초만 자신에게 물어보세요',
                description: '이건 내가 진짜 분석해서 사는 걸까, 아니면 남들 따라 조급해서 사는 걸까? 주식을 사기 전에 잠시 멈추고 이 질문을 던지는 것만으로도, 무언가에 홀려서 무턱대고 돈을 집어넣는 실수를 막을 수 있습니다.'
              },
              {
                stepNumber: 3,
                title: '시장의 분위기보다 \'내 마음\'을 먼저 읽어야 합니다',
                description: '주식 시장의 숫자는 거짓말을 안 하지만, 그 숫자를 바라보는 내 마음은 끊임없이 거짓말을 하고 불안해합니다. 서둘러 급등하는 주식을 찾아 헤매기보다, 내가 왜 불안해하는지 내 마음을 먼저 들여다보고 기준을 세우는 것이 내 돈을 지키는 가장 확실한 길입니다.'
              }
            ]
          }
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
          "뒤처진 기업은 빼고 돈 잘 버는 기업을 알아서 교체하는 S&P 500 시장 시스템",
          "월가 전문가 90%를 이기는 가장 확실하고 안전한 투자 첫 단추"
        ],
        cardNewsTitles: [
          "1등 기업 맹신의 위험성",
          "미국 S&P 500 시장 시스템",
          "전문가 90%를 이기는 기본기"
        ],
        modules: [
          {
            type: 'guide_steps',
            title: '강의 노트: 개별 기업의 위험성과 미국 시장 시스템의 우수함',
            description: '개별 주식 구매의 위험성을 피하고 미국 시장 전체에 투자해야 하는 3가지 이유를 정리해 드립니다.',
            steps: [
              {
                stepNumber: 1,
                title: '"1등 기업은 안 망한다"는 착각이 가장 위험합니다',
                description: "2000년대 전 세계 1등 기업이었던 '시스코'도 순식간에 폭락한 뒤 원금을 찾는 데 무려 25년이 걸렸습니다. 삼성전자든 다른 유명 기업이든 10년, 20년 뒤에도 영원히 1등이라는 보장은 없습니다."
              },
              {
                stepNumber: 2,
                title: "기업이 아닌 '시장 시스템'을 사는 것이 훨씬 안전합니다",
                description: "개별 기업과 달리 미국 상위 500개 기업을 묶은 'S&P 500'은 뒤처진 기업을 알아서 빼고, 가장 돈 잘 버는 1등 기업을 계속 교체해 넣는 우수한 시스템을 갖추고 있습니다."
              },
              {
                stepNumber: 3,
                title: "전문가 90%를 이기는 가장 확실한 기본기입니다",
                description: "월가 전문 펀드매니저 90% 이상도 장기적으로는 S&P 500의 수익률을 이기지 못했습니다. 공부할 시간이 부족한 초보자에게 미국 시장 전체 투자는 가장 안전하고 검증된 첫 단추입니다."
              }
            ]
          }
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
