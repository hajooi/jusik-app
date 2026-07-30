export type ModuleType = 'guide_steps' | 'resources' | 'cta';

export interface GuideStep {
  stepNumber: number;
  title: string;
  description?: string;
  bullets?: string[];
  icon?: string;
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
  benefits?: string[];
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
  summary?: string[];
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
          "AI가 인간의 노동을 대체하면 우리 노동의 가치는 0원이 되고, 부를 소유한 빅테크 기업의 눈치만 보는 현대판 노예가 됩니다.",
          "월급을 아껴 저축만 하는 것은 가장 확실하게 가난해지는 길입니다.",
          "미국 1등 혁신 기업의 주식을 사서 AI를 소유한 자본가이자 동업자가 되어야 살아남습니다."
        ],
        cardNewsTitles: [
          "노동의 가치가 '0원'이 되는 시대",
          "방직기 혁명과 부의 독식",
          "1등 기업의 주인이 되는 법"
        ],
        modules: [
          {
            type: "guide_steps",
            title: "강의 노트",
            steps: [
              {
                stepNumber: 1,
                title: "기계와 AI의 경고",
                icon: "Bot",
                bullets: [
                  "기계가 노동을 완벽히 대체하면 내 손으로 돈 벌 능력이 0이 되고 밥줄을 남한테 넘겨주게 됩니다.",
                  "모든 부는 AI와 로봇을 소유한 극소수 빅테크 기업이 쓸어 담게 됩니다."
                ]
              },
              {
                stepNumber: 2,
                title: "역사의 증명과 저축의 착각",
                icon: "History",
                bullets: [
                  "방직기가 발명됐을 때 노동자들은 소모품으로 전락해 더 가난해졌고, 돈은 기계를 가진 공장주가 다 가졌습니다.",
                  "잘나가던 베테랑의 일을 AI가 3초 만에 해버리는 지금, 월급을 아껴 저축만 하는 것은 가난해지는 길이 됩니다."
                ]
              },
              {
                stepNumber: 3,
                title: "현실적인 해결책",
                icon: "Lightbulb",
                bullets: [
                  "살아남는 정답은 내가 직접 자본가가 되어 내 돈이 나 대신 24시간 일하게 만드는 것입니다.",
                  "주식 시장을 통해 애플, 구글, 엔비디아, 마이크로소프트 같은 미국 1등 기업의 주식을 사면 그 거대한 혁신 기업의 당당한 주인이자 동업자가 될 수 있습니다.",
                  "주식을 통해 AI를 소유한 자본가의 자리로 넘어가는 선택에 따라 미래의 계급이 결정됩니다."
                ]
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
          "당장의 10억 대신 매달 500만 원을 선택하는 것은 시간이 흐를수록 약해지는 돈의 힘과 현재가치를 무시한 착각입니다.",
          "10억 원을 받아 S&P 500 ETF(미국의 500개 기업에 투자하는 상품) 등에 투자하면 매달 500만 원보다 큰 수익이 생기고 복리의 마법을 통해 자산을 기하급수적으로 불릴 수 있습니다.",
          "시간의 힘을 활용해 돈이 스스로 일하게 만드는 투자자가 되어야 합니다."
        ],
        cardNewsTitles: [
          "미래의 500만 원과 화폐 가치 하락",
          "10억 원 보유 시 매달 667만 원의 비밀",
          "복리의 눈덩이 효과"
        ],
        modules: [
          {
            type: "guide_steps",
            title: "강의 노트",
            steps: [
              {
                stepNumber: 1,
                title: "월급이 주는 안정감이라는 착각",
                icon: "ShieldAlert",
                bullets: [
                  "SNS 밸런스 게임에서 수많은 사람들이 당장 손에 쥐어지는 현금 10억 대신 매달 통장에 꽂히는 500만 원을 선택합니다.",
                  "이는 월급날의 안정감이라는 익숙한 프레임에 갇혀 돈의 가장 중요한 진실과 시간의 속성을 보지 못하게 만듭니다."
                ]
              },
              {
                stepNumber: 2,
                title: "돈의 시간과 현재가치",
                icon: "Clock",
                bullets: [
                  "오늘의 500만 원과 20년 뒤의 500만 원은 결코 같은 가치가 아닙니다.",
                  "불확실성과 물가 상승을 고려하여 미래에 받을 돈의 가치를 일정 부분 낮추어 생각해야 합니다."
                ]
              },
              {
                stepNumber: 3,
                title: "잠자는 돈 vs 일하는 돈과 복리의 마법",
                icon: "TrendingUp",
                bullets: [
                  "10억 원을 받으면 자본이 가진 힘을 이용해 나를 위해 24시간 일해 줄 최고 직원으로 만들 수 있습니다.",
                  "보수적으로 연 5% 수익률이면 한 달에 약 400만 원, 주식 투자 연평균 8% 수익률로 가정하면 매달 약 667만 원의 수익이 생깁니다.",
                  "새로 붙은 이자가 원금에 합쳐져 눈덩이처럼 불어나는 복리의 가속도가 붙습니다."
                ]
              },
              {
                stepNumber: 4,
                title: "30년 뒤 자산 비교와 돈의 주인",
                icon: "Scale",
                bullets: [
                  "연평균 수익률 8% 가정 시, 10억 원을 그대로 30년간 투자한 A씨는 약 100억 원, 매달 500만 원을 받자마자 30년간 투자한 B씨는 약 70억 원이 되어 30억 원의 차이가 발생합니다.",
                  "안정감에 속아 돈을 기다리는 소비자로 남을 것인지, 돈이 스스로 일하게 만드는 투자자가 될 것인지에 대해 돈에 대한 근본적인 태도를 바꿔야 진정한 돈의 주인이 됩니다."
                ]
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
          "주식의 주인이 아닌 숫자에 끌려다니는 유령이 되는 이유는 지능이 아니라 본능이라는 덫에 걸려 감정을 샀기 때문입니다.",
          "주식 구매 버튼을 누르기 전 3초 동안 \"이 욕망은 '내 것'인가, 아니면 '시장의 것'인가?\" 적고 구분해야 판단의 주체로 돌아옵니다.",
          "급등주 검색 대신 인문학 책으로 마음을 읽고 나 자신을 해석해야 시장의 유혹에서 벗어나 진짜 밥을 먹여주는 철학을 얻게 됩니다."
        ],
        cardNewsTitles: [
          "숫자에 끌려다니는 유령",
          "본능의 파멸 사이클",
          "3초의 질문과 나를 해석하기"
        ],
        modules: [
          {
            type: "guide_steps",
            title: "강의 노트",
            steps: [
              {
                stepNumber: 1,
                title: "숫자에 끌려다니는 유령",
                icon: "Ghost",
                bullets: [
                  "밤마다 증권사 앱을 보며 숫자에 휘둘리는 건 의지가 부족해서가 아니라 본능이라는 덫 때문입니다.",
                  "뇌의 충동 때문에 분석이 아닌 감정을 사게 됩니다."
                ]
              },
              {
                stepNumber: 2,
                title: "본능의 파멸 사이클",
                icon: "RefreshCw",
                bullets: [
                  "손실의 고통: 확정된 손실이 싫어 파란색 계좌 감옥에 스스로를 갇히게 만듭니다.",
                  "불안과 고점: 남들 소식에 불안해서 타오르는 불기둥을 보며 가장 비싼 가격에 뛰어듭니다.",
                  "공포와 바닥: 폭락하면 공포 때문에 세력들이 기다리는 바닥에서 자산을 던집니다."
                ]
              },
              {
                stepNumber: 3,
                title: "3초의 질문",
                icon: "HelpCircle",
                bullets: [
                  "구매 버튼 전 3초 동안 포스트잇에 적으세요: \"이 욕망은 '내 것'인가, 아니면 '시장의 것'인가?\"",
                  "시장의 미끼임을 명확히 인식하고 취소 버튼을 누르는 것이 철학이 주는 첫 번째 수익입니다."
                ]
              },
              {
                stepNumber: 4,
                title: "나 자신을 해석하기",
                icon: "BookOpen",
                bullets: [
                  "숫자를 해석하는 내 마음은 언제나 거짓말을 합니다.",
                  "인문학 책을 읽으며 내 길이 진짜 나의 확신인지 시장의 유혹인지 구분하는 힘을 길러야 합니다."
                ]
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
          "삼성전자 같은 1등 기업도 영원하지 않으며 과거 미국 1등이었던 시스코처럼 추락 후 25년 동안 본전을 겨우 찾는 위험이 존재합니다.",
          "특정 기업의 미래를 맞히는 대신 뒤처진 기업을 빼고 새로운 기업을 알아서 채워주는 미국 S&P 500(미국의 500개 기업)을 사는 것이 안전합니다.",
          "전문가들도 이기기 힘든 S&P 500은 주식 공부할 시간이 없는 사람에게 가장 확실한 투자이자, 스스로의 투자 그릇과 멘탈을 파악하는 기본기가 됩니다."
        ],
        cardNewsTitles: [
          "영원한 1등은 없다",
          "시스코 사례와 대중의 확신",
          "기업 대신 시장 시스템 사기",
          "S&P 500: 투자의 기본기와 시작"
        ],
        modules: [
          {
            type: "guide_steps",
            title: "강의 노트",
            steps: [
              {
                stepNumber: 1,
                title: "영원한 1등은 없다",
                icon: "ShieldAlert",
                bullets: [
                  "1등 기업은 절대 망하지 않고 버티면 돈을 벌어다 줄 거라 믿지만, 역사를 보면 영원한 1등은 없습니다.",
                  "개별 기업 분석은 전문성과 시간이 필요하며, 확신을 가진 종목도 시간이 지나면 아는 게 거의 없었다는 것을 깨닫게 됩니다."
                ]
              },
              {
                stepNumber: 2,
                title: "시스코 사례와 대중의 확신",
                icon: "TrendingUp",
                bullets: [
                  "2000년대 초 전 세계 인터넷 장비를 독점하던 미국 1등 기업 시스코도 시장 분위기가 꺾이자 폭락했고, 25년이 지나서야 겨우 본전을 찾았습니다.",
                  "시장 분위기가 꺾이고 평가가 변하면 지금 실적이 좋고 안전해 보이는 삼성전자 같은 기업도 미래를 완벽히 예측하기 어렵습니다."
                ]
              },
              {
                stepNumber: 3,
                title: "기업 대신 시장 시스템을 사고 팔라",
                icon: "Target",
                bullets: [
                  "다음 1등을 고를 필요 없이 미국 상위 500개 기업을 통째로 묶은 S&P 500을 사야 합니다.",
                  "돈과 인재가 몰리는 미국 시장은 전 세계에서 가장 혁신적이며 경쟁에서 뒤처진 기업을 가차 없이 쫓아내는 시스템을 갖추고 있습니다."
                ]
              },
              {
                stepNumber: 4,
                title: "S&P 500: 투자의 기본기와 시작",
                icon: "Award",
                bullets: [
                  "전문 펀드매니저 90% 이상도 장기적으로 S&P 500 수익률을 이기지 못합니다.",
                  "공부에 시간을 쏟기 어렵다면 S&P 500에 투자하고, 제대로 공부하고 싶은 분들도 S&P 500을 통해 폭락과 상승 속에서 스스로의 투자 그릇을 파악하는 첫 단추로 삼아야 합니다."
                ]
              }
            ]
          }
        ]
      },
      {
        id: "lv1-2",
        levelId: "lv1",
        lessonNumber: 2,
        title: "2강. 필수 용어",
        subtitle: "주식 뉴스와 시세가 쏙쏙 들리는 기초 핵심 용어 총정리",
        youtubeId: "tf6vMw3u7LU",
        duration: "6:27",
        cardNewsTitles: [
          "주식 & 기업 가치",
          "주식 시장 & 거래",
          "주식의 종류",
          "초보자를 위한 투자"
        ],
        modules: [
          {
            type: "guide_steps",
            title: "강의 노트",
            steps: [
              {
                stepNumber: 1,
                title: "주식 & 기업 가치",
                icon: "Sparkles",
                bullets: [
                  "주식: 회사의 소유권을 잘게 쪼갠 소유권 조각",
                  "주가: 주식 한 개의 가격",
                  "시가총액: 주가에 총 주식 수를 곱한 시장이 평가하는 회사의 전체 몸값",
                  "유상증자: 기업이 자금이 필요할 때 새로운 주식을 추가로 발행해서 투자자들에게 파는 것",
                  "자사주 매입: 회사가 자기 자금으로 시중에 유통되는 자기 회사 주식을 사들이는 것",
                  "배당금: 회사가 번 이익의 일부를 주주들에게 현금으로 나눠주는 보너스 용돈"
                ]
              },
              {
                stepNumber: 2,
                title: "주식 시장 & 거래",
                icon: "TrendingUp",
                bullets: [
                  "증권거래소: 주식을 사고파는 공식 시장 (코스피, 코스닥, 나스닥, 뉴욕증권거래소)",
                  "지수: 시장 전체의 전반적인 분위기와 성적을 보여주는 평균 점수",
                  "예수금: 주식을 사기 위해 증권사 계좌에 넣어둔 현금 총알",
                  "매수 / 매도: 주식을 사는 것 / 파는 것",
                  "호가: 투자자들이 사고팔기 위해 제시하는 가격"
                ]
              },
              {
                stepNumber: 3,
                title: "주식의 종류",
                icon: "Target",
                bullets: [
                  "우량주: 오랫동안 안정적인 실적을 내온 전교 1등 모범생 같은 주식",
                  "성장주: 미래에 폭발적인 성장이 기대되는 슈퍼스타 같은 주식",
                  "가치주: 기업의 가치에 비해 현재 주가가 낮아 시장에서 주목받지 못하는 주식"
                ]
              },
              {
                stepNumber: 4,
                title: "초보자를 위한 투자",
                icon: "Lightbulb",
                bullets: [
                  "ETF: 대표 기업들을 조금씩 나눠 담은 과일 바구니 형태의 주식 종합 선물 세트",
                  "자산운용사: ETF 선물 세트를 만드는 회사 (TIGER, KODEX, iShares, Vanguard)"
                ]
              }
            ]
          }
        ]
      },
      {
        id: "lv1-3",
        levelId: "lv1",
        lessonNumber: 3,
        title: "3강. 계좌 개설",
        subtitle: "내부 점검 안내 및 계좌 개설 참고사항",
        youtubeId: "2Ee_qkHL5pE",
        duration: "3:09",
        summary: [
          "현재 DB증권 계좌 개설 안내 및 제휴 수수료 혜택 신청 서비스는 내부 점검으로 인해 잠시 중단되었습니다."
        ],
        cardNewsTitles: [
          "안내 사항"
        ],
        modules: [
          {
            type: "guide_steps",
            title: "서비스 점검 안내",
            steps: [
              {
                stepNumber: 1,
                title: "DB증권 계좌 개설 서비스 일시 중단",
                icon: "Lightbulb",
                bullets: [
                  "DB증권 계좌 개설 안내 및 수수료 혜택 신청 서비스는 내부 점검으로 인해 잠시 중단되었습니다.",
                  "이용에 불편을 드려 죄송하며, 점검 완료 후 새롭게 안내해 드릴 예정입니다."
                ]
              }
            ]
          },
          {
            type: "cta",
            badge: "서비스 점검 안내",
            title: "DB증권 계좌 개설 안내 일시 중단",
            description: "DB증권 계좌 개설 안내 및 혜택 신청은 내부 점검으로 인해 잠시 중단되었습니다. 이용에 불편을 드려 죄송합니다.",
            buttonText: "안내 확인 완료",
            buttonUrl: "/",
            isExternal: false
          }
        ]
      },
      {
        id: "lv1-4",
        levelId: "lv1",
        lessonNumber: 4,
        title: "4강. 주식 구매 실습",
        subtitle: "앱 퀵메뉴 세팅부터 SPYM 구매 & 소수점 구매, 주식 팔기까지 완벽 실습",
        youtubeId: "LUDPgG6Kf54",
        duration: "4:08",
        cardNewsTitles: [
          "1단계: 화면 깔끔하게 세팅하기",
          "2단계: 미국 시장 서비스 신청",
          "3단계: 계좌 확인 및 종목 검색",
          "4단계: 주식 직접 사보기 (구매)",
          "5단계: 자산 확인 및 통합증거금 원리",
          "6단계: 주식 팔기 및 출금",
          "[추가 팁] 한도제한계좌 해제"
        ],
        modules: [
          {
            type: "guide_steps",
            title: "강의 노트",
            steps: [
              {
                stepNumber: 1,
                title: "1단계: 화면 깔끔하게 세팅하기",
                icon: "Zap",
                bullets: [
                  "하단 메뉴 오른쪽 설정 → 해외주식주문, 보유자산현황, 실시간환전 3개만 남기고 삭제",
                  "메뉴 → 설정 → '해외주식 전용 퀵메뉴 사용' Off(끄기)"
                ]
              },
              {
                stepNumber: 2,
                title: "2단계: 미국 시장 서비스 신청",
                icon: "Sparkles",
                bullets: [
                  "메뉴 → 해외주식 → 서비스 신청 → 해외주식거래이용신청 & 해외주식실시간시세신청"
                ]
              },
              {
                stepNumber: 3,
                title: "3단계: 계좌 확인 및 종목 검색",
                icon: "Target",
                bullets: [
                  "하단 보유자산 → 계좌 → 종합매매 계좌 확인 (투자금 입금)",
                  "해외주식주문 → 왼쪽 상단 종목명 클릭 → SPYM (S&P 500 ETF) 검색"
                ]
              },
              {
                stepNumber: 4,
                title: "4단계: 주식 직접 사보기 (구매)",
                icon: "CheckCircle2",
                bullets: [
                  "지정가 / 시장가 선택 후 구매 버튼 (통합증거금 덕분에 달러 환전 없이 즉시 구매 가능)",
                  "주문정정/취소: 안 팔리거나 안 사진 대기 주문은 '주문체결' 창에서 취소 및 정정 가능",
                  "소수점 거래 (소액 투자): 메뉴 → 해외주식 → 소수점주문 → 원하는 금액(예: 10,000원) 입력 후 소수점 구매"
                ]
              },
              {
                stepNumber: 5,
                title: "5단계: 자산 확인 및 통합증거금 원리",
                icon: "Clock",
                bullets: [
                  "하단 보유자산에서 구매한 주식 확인",
                  "총자산 가계산: 환율 변동 대비로 5% 정도 잠시 묶어두는 원리이며, 이틀 뒤 결제일에 정산 후 남은 돈은 자동 환급"
                ]
              },
              {
                stepNumber: 6,
                title: "6단계: 주식 팔기 및 출금",
                icon: "RefreshCw",
                bullets: [
                  "보유자산 → 상세잔고 → 해외주식 → 팔기",
                  "결제일 원리: 주식을 판 돈은 실제 정산이 이루어지는 이틀 뒤에 출금 가능"
                ]
              },
              {
                stepNumber: 7,
                title: "[추가 팁] 한도제한계좌 해제",
                icon: "Lightbulb",
                bullets: [
                  "100만 원 이상 거래 완료 시 다음 날 한도 제한 자동 해제 (당장 해제 필요 시 영업점 전화 후 서류 제출)"
                ]
              }
            ]
          }
        ]
      },
      {
        id: "lv1-5",
        levelId: "lv1",
        lessonNumber: 5,
        title: "5강. 조금씩 모아가기",
        subtitle: "타이밍 욕심을 버리고 하락장 계좌 방어력을 높이는 분할 구매 법칙",
        youtubeId: "JmjGSUFEgHI",
        duration: "3:56",
        summary: [
          "내가 사고 싶어지는 시점은 남들이 다 사서 비싸진 고점일 확률이 높고, 타이밍을 재려다가는 최고의 수익을 내는 날들을 놓치게 됩니다.",
          "수학적으로는 목돈을 한 번에 넣는 것이 더 벌 수 있어도, 고점에 돈을 다 넣었다가 하락이 시작되면 마이너스 계좌의 고통을 견디기 어렵습니다.",
          "돈을 잘게 쪼개어 나누어 사면 하락장에서 계좌의 방어력이 올라가므로, 내 그릇에 맞는 안전한 금액으로 모아가야 살아남습니다."
        ],
        cardNewsTitles: [
          "타이밍의 함정",
          "한 번에 vs 나누어 투자",
          "나누어 투자하는 방어력",
          "내 그릇에 맞는 분할 투자"
        ],
        modules: [
          {
            type: "guide_steps",
            title: "강의 노트",
            steps: [
              {
                stepNumber: 1,
                title: "내가 사면 떨어지는 이유와 타이밍의 함정",
                icon: "ShieldAlert",
                bullets: [
                  "평소 관심 없던 사람들이 너도나도 주식 이야기를 하고 추천할 때가 시장의 최고점입니다.",
                  "하락장이 터진 직후 발생하는 최고의 날들을 놓치면 자산 수익이 반 토막 나거나 원금도 안 남게 되며, 완벽한 타이밍을 재는 것은 불가능합니다."
                ]
              },
              {
                stepNumber: 2,
                title: "한 번에 투자 vs 나누어 투자",
                icon: "Scale",
                bullets: [
                  "수학적 확률: 장기 상승하는 시장에서는 목돈을 한 번에 다 넣는 것이 나누어 사는 것보다 수익률이 높습니다.",
                  "인간의 한계: 최고점에 한 번에 다 넣었다가 하락이 시작되면 수학적 확률은 의미가 없고 고통을 견딜 수 없습니다."
                ]
              },
              {
                stepNumber: 3,
                title: "나누어 투자하는 것의 방어력",
                icon: "TrendingUp",
                bullets: [
                  "1,000만 원을 한 번에 사면 하락 시 즉시 마이너스가 되고 회복까지 수개월, 수년이 걸립니다.",
                  "100만 원씩 열 달 동안 나누어 사면 가격이 떨어질 때 더 저렴하게 사게 되어 평균 가격이 낮아집니다.",
                  "나중에 주식이 조금만 올라도 빠르게 수익으로 돌아서며 계좌의 방어력이 올라갑니다."
                ]
              },
              {
                stepNumber: 4,
                title: "내 그릇에 맞는 분할 투자",
                icon: "Target",
                bullets: [
                  "마음이 불편하지 않을 크기로 돈을 잘게 쪼개야 합니다.",
                  "1,000만 원 중 매달 100만 원씩 10번 투자하거나, 불안하다면 50만 원씩 20번 나누어 마음 편히 주식을 모아가야 합니다."
                ]
              }
            ]
          }
        ]
      },
      {
        id: "lv1-6",
        levelId: "lv1",
        lessonNumber: 6,
        title: "6강. 주식 모으기 실습",
        subtitle: "감정을 배제하고 매달 알아서 정기 구매해주는 주식 모으기 완벽 가이드",
        youtubeId: "qnFrQH2erNM",
        duration: "2:09",
        cardNewsTitles: [
          "주식 모으기 설정 방법",
          "추천 포트폴리오 6종 종류 및 특징",
          "추천 포트폴리오 활용법"
        ],
        modules: [
          {
            type: "guide_steps",
            title: "강의 노트",
            steps: [
              {
                stepNumber: 1,
                title: "주식 모으기 설정 방법",
                icon: "Zap",
                bullets: [
                  "메뉴 → 해외주식 → 주식 모으기",
                  "투자 주기: 직장인이라면 월급날에 맞춰 '매월' 추천 (날짜 및 기간 설정)",
                  "배당금 입금 시 자동구매: 체크 추천 (보너스 배당금을 다시 투자에 활용)",
                  "1회 투자금액: 원하는 금액 입력 (예: 매월 10만 원)",
                  "투자 종목 추가: 모아가고 싶은 주식 검색 후 선택 (예: SPYM)",
                  "여러 종목 투자 시 추가 후 원하는 비율 구성 → 확인 → 주식 모으기 신청"
                ]
              },
              {
                stepNumber: 2,
                title: "앱 내 추천 포트폴리오 6종 종류 및 특징",
                icon: "Sparkles",
                bullets: [
                  "미국배당주 투자하기: 애플, 마이크로소프트, 코카콜라 등 하락장에 강하고 배당을 주는 튼튼한 15개 기업 분산 투자(각 6.67%)",
                  "세계 1등 기업에 투자: 애플, 아마존, 엔비디아, 테슬라 등 글로벌 1등 기업 15개에 균등 투자(각 6.67%)",
                  "월세 대신 월배당 받기: DGRW, JEPI, JEPQ, TLT 등 배당 및 채권 ETF 8종(각 12.5%)으로 현금 흐름 창출",
                  "'레이달리오' 따라잡기 (올웨더): 금(GLD), 채권(IEF, TLT), 주식(QQQ, SPY), 원자재(XLE)를 섞어 경제 위기 방어(각 16.67%)",
                  "미국지수 따라잡기: 나스닥 100(QQQ 50%) + S&P 500(SPY 50%) 조합으로 적당한 안전함과 수익률 추구",
                  "주식+채권 분산투자: 주식(QQQ, SPY 50%)과 미국 국채(IEF, TLT 50%)를 절반씩 섞어 변동성 최소화"
                ]
              },
              {
                stepNumber: 3,
                title: "추천 포트폴리오 활용법",
                icon: "Lightbulb",
                bullets: [
                  "머리 아프고 복잡하다면 미국 1등부터 500등 기업을 담는 S&P 500 하나만 모아가는 것이 가장 완벽하고 훌륭한 정답입니다.",
                  "주식 하나만 갖는 게 불안하다면 앱 내 '추천 포트폴리오'를 활용하거나, 해당 비율을 메모해 두고 직접 설정해 모아갈 수 있습니다."
                ]
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
