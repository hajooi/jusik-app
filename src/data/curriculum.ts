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
        subtitle: "월급만으로는 부족한 이유와 자본소득 시스템 구축하기",
        youtubeId: "50KkWkqqKkQ",
        duration: "4:12",
        summary: [
          "AI와 로봇이 인간의 노동을 대체하면서 월급만으로는 살아남을 수 없는 시대의 도래",
          "1769년 방직기 혁명과 동일한 자본가들의 부의 독식 메커니즘 분석",
          "스마트폰으로 미국 1등 혁신 기업의 주식을 구매해 스스로 '자본가'가 되는 해결책"
        ],
        cardNewsTitles: [
          "당신의 월급이 0원이 되는 이유",
          "방직기 혁명이 증명한 자본가의 법칙",
          "AI 시대의 유일한 생존법: 미국 주식"
        ],
        modules: [
          {
            type: 'guide_steps',
            title: '강의 노트: 자본소득 시스템 구축 4단계 가이드',
            description: '노동소득에만 의존하는 삶에서 벗어나 주식 투자를 통해 자본소득 시스템을 구축하는 핵심 원리입니다.',
            steps: [
              {
                stepNumber: 1,
                title: '노동의 종말과 현대판 노예',
                description: 'AI와 로봇이 인간의 노동을 대체하는 시대, 노동 소득만으로는 내 밥줄을 남에게 넘겨준 현대판 노예로 전락하게 됩니다. 던져주는 푼돈에 목숨줄을 걸지 않으려면 자본의 소유자가 되어야 합니다.'
              },
              {
                stepNumber: 2,
                title: '역사적 증명: 방직기 혁명의 교훈',
                description: '1769년 방직기 혁명 때 생산량은 100배 늘었지만 노동자는 더 가난해졌고 부는 공장주(자본가)가 독식했습니다. AI가 전문직 일자리까지 대체하는 지금, 단순 저축은 가장 확실하게 가난해지는 길입니다.'
              },
              {
                stepNumber: 3,
                title: '미국 주식을 사야 하는 이유',
                description: '내 노동 가치가 0원이 되는 세상의 유일한 해결책은 스스로 자본가가 되는 것입니다. 세계 1등 혁신을 주도하는 미국의 빅테크 기업(엔비디아, 구글, 마이크로소프트 등)의 주식을 소유하여 24시간 나 대신 일하게 만드세요.'
              },
              {
                stepNumber: 4,
                title: '위기는 자본가들의 사냥 시간이다',
                description: '과거와 달리 지금은 주식 시장을 통해 누구나 손쉽게 자본가의 자리에 올라탈 수 있습니다. 거인의 어깨 위에 올라타 1등 기업의 동업자가 되세요. 다가올 미래의 계급은 지금 여러분의 선택에 달려있습니다.'
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
        subtitle: "현금 10억 VS 월 500만 원: 돈의 현재가치와 복리의 마법",
        youtubeId: "vDo857gB1j0",
        duration: "5:39",
        summary: [
          "현금 10억 일시불 vs 매달 500만 원 밸런스 게임으로 풀어보는 돈의 현재가치(PV) 개념",
          "인플레이션으로 인한 화폐 가치 하락과 자본이 스스로 일하게 만드는 복리의 메커니즘",
          "30년 뒤 30억 원 이상의 자산 격차를 만드는 '일하는 돈' 확보의 중요성"
        ],
        cardNewsTitles: [
          "10억 vs 월 500만 원의 진실",
          "돈의 시간 가치: 현재가치(PV)",
          "30년 후 30억 차이 만드는 복리의 힘"
        ],
        modules: [
          {
            type: 'guide_steps',
            title: '강의 노트: 돈의 시간 가치와 복리 4단계 가이드',
            description: '현재가치(Present Value)와 복리의 메커니즘을 이해하고 돈의 주인이 되는 핵심 원리입니다.',
            steps: [
              {
                stepNumber: 1,
                title: '우리를 시험에 들게 한 밸런스 게임',
                description: '현금 10억 일시불과 매달 500만 원 중 무엇을 선택할 것인가? 월급날의 안도감이 주는 프레임을 깨고 돈의 본질적인 시간 가치를 바라보아야 합니다.'
              },
              {
                stepNumber: 2,
                title: '놓치고 있는 단 한 가지: 돈의 시간 (현재가치)',
                description: '오늘의 500만 원과 20년 뒤의 500만 원은 인플레이션 때문에 전혀 다른 가치입니다. 경제학의 현재가치(Present Value) 개념을 통해 미래 소득의 가치를 객관적으로 평가해야 합니다.'
              },
              {
                stepNumber: 3,
                title: '잠자는 돈 vs 일하는 돈 (복리의 스노우볼)',
                description: '10억 원을 연 8% S&P 500 ETF에 투자하면 매월 667만 원의 수익을 냅니다. 원금과 이자가 함께 불어나는 복리 효과로 30년 후 자산 격차는 30억 원 이상 벌어집니다.'
              },
              {
                stepNumber: 4,
                title: '돈의 주인이 되는 선택',
                description: '안정감이라는 이름 아래 매달 돈을 기다리는 소비자로 남을 것인가, 돈이 스스로 일하게 만드는 투자자가 될 것인가? 가치를 미래로 증식시키는 돈의 주인이 되어야 합니다.'
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
        subtitle: "흔들리지 않는 원칙과 멘탈 사수법",
        youtubeId: "hPDV4XWN9AU",
        duration: "4:37",
        summary: [
          "장이 열리고 숫자가 춤출 때 이성을 마비시키는 '도파민 본능'의 덫 분석",
          "손실 회피 공포와 고점 구매 조급함을 부수는 스피노자의 '3초 질문' 철학 필터",
          "시장을 이기기 전에 나 자신을 해석하여 진짜 주체성을 회복하는 심리 제어법"
        ],
        cardNewsTitles: [
          "우리가 돈 대신 도파민을 산 이유",
          "주식 구매 전 3초 질문법",
          "시장을 이기는 철학적 자기 객관화"
        ],
        modules: [
          {
            type: 'guide_steps',
            title: '강의 노트: 투자 심리와 철학적 멘탈 사수 4단계 가이드',
            description: '본능의 덫에서 벗어나 자기 객관화와 철학적 필터로 판단의 주체성을 회복하는 핵심 원리입니다.',
            steps: [
              {
                stepNumber: 1,
                title: '밤이 되면 시작되는 유령의 시간 (본능의 덫)',
                description: '주식에서 실패하는 것은 지능이 부족해서가 아니라 성격과 감정에 휘둘리기 때문입니다. 장이 열리면 이성은 마비되고 본능의 덫에 걸려들게 됩니다.'
              },
              {
                stepNumber: 2,
                title: '당신은 돈이 아니라 도파민을 샀다',
                description: '손실 회피 공포로 물리고, 나만 빠질까 봐 생기는 조급함으로 고점에 사고, 공포에 눌려 바닥에 던지는 파멸의 굴레. 감정이 시키는 투자를 부술 수 있는 유일한 열쇠가 바로 철학입니다.'
              },
              {
                stepNumber: 3,
                title: '주체성을 회복하는 주식 구매 전 3초의 질문',
                description: '주식 구매 버튼을 누르기 전 3초간 "이 욕망은 내 것인가, 시장의 것인가?" 물어보세요. 스피노자의 말처럼 감정을 명확히 인식할 때 시장의 유혹을 끊고 판단의 주체가 됩니다.'
              },
              {
                stepNumber: 4,
                title: '투자는 나 자신을 해석하는 전쟁이다',
                description: '숫자는 거짓말을 하지 않지만 숫자를 해석하는 내 마음은 거짓말을 합니다. 시장을 이기려 하기 전에 시장보다 복잡한 나 자신을 먼저 해석하는 단단한 철학을 구축하세요.'
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
    title: "무작정 따라 하는 첫 주식 구매",
    description: "필수 주식 용어부터 계좌 개설, 주식 모으기 자동 적립까지 실전으로 따라하기",
    badgeText: "첫 구매 실습",
    iconName: "ShoppingBag",
    lessons: [
      {
        id: "lv1-1",
        levelId: "lv1",
        lessonNumber: 1,
        title: "1강. 종목 선택",
        subtitle: "개별 기업 모으기의 위험성과 S&P 500 미국 시장 전체 구매의 힘",
        youtubeId: "UI2ga-MHlpQ",
        duration: "5:20",
        summary: [
          "과거 전 세계 1등 기업 시스코(Cisco)의 사례로 본 개별 기업 맹신의 위험성",
          "우량 기업을 알아서 교체해주는 전 세계 1등 미국 시장(S&P 500) 시스템의 강점",
          "월가 전문가 90%를 이기는 최고의 투자 기본기와 멘탈 관리법"
        ],
        cardNewsTitles: [
          "영원한 1등 기업은 없다",
          "시스코 25년 본전의 교훈",
          "미국 S&P 500 시장 전체 구매"
        ],
        modules: [
          {
            type: 'guide_steps',
            title: '강의 노트: 성공적인 종목 선택 4단계 가이드',
            description: '개별 기업 맹신의 위험성을 이해하고 S&P 500 시장 시스템을 활용해 안전하게 투자하는 핵심 원리입니다.',
            steps: [
              {
                stepNumber: 1,
                title: '대중의 맹신을 부수는 1등 기업의 현실',
                description: '주식을 잘 모를 때는 안전한 1등 기업만 구매해서 모아가면 될 것이라 믿지만, 역사를 돌아보면 한순간의 변화를 따라가지 못하고 추락해 수십 년간 회복하지 못한 기업들이 수두룩합니다.'
              },
              {
                stepNumber: 2,
                title: '시스코 사례: 영원한 1등의 추락과 25년의 기다림',
                description: '2000년대 인터넷 시대를 독점하던 전 세계 1등 기업 시스코 역시 대중의 확신이 무너지자 폭락했고 본전을 찾는 데 무려 25년이 걸렸습니다. 특정 기업 하나에 자산을 모두 거는 것은 위험합니다.'
              },
              {
                stepNumber: 3,
                title: '개별 기업이 아닌 미국 1등 시장(S&P 500)을 구매하라',
                description: '기업은 영원할 수 없지만 시장은 다릅니다. 뒤처진 기업은 빼고 새로운 우량 기업을 알아서 채워 넣는 미국 상위 500개 기업 묶음인 S&P 500을 통째로 구매하는 것이 훨씬 안전하고 확실합니다.'
              },
              {
                stepNumber: 4,
                title: '전문가의 90%를 이기는 최고의 투자 기본기',
                description: '월가 전문 펀드매니저의 90% 이상도 장기적으로 S&P 500의 성과를 이기지 못했습니다. 내 투자 멘탈을 점검하며 복리의 결실을 거둘 수 있는 최고의 첫 단추입니다.'
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
