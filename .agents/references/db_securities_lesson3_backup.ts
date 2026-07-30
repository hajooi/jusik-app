// DB증권 심의필 완료 시 3강 (lv1-3) 복원용 원본 데이터 백업
// 위치: src/data/curriculum.ts 내 lv1-3 아이템

export const ORIGINAL_LESSON_3_DATA = {
  id: "lv1-3",
  levelId: "lv1",
  lessonNumber: 3,
  title: "3강. 계좌 개설",
  subtitle: "DB증권 비대면 계좌 개설부터 평생 우대 수수료 혜택 연동까지",
  youtubeId: "2Ee_qkHL5pE",
  duration: "3:09",
  cardNewsTitles: [
    "준비물 (앱 설치)",
    "1단계: 계좌 개설",
    "2단계: 자문사 연동",
    "3단계: 서비스 신청 & 폼 작성",
    "[필수 & 참고] 꼭 해야 하는 것들"
  ],
  modules: [
    {
      type: "guide_steps",
      title: "강의 노트",
      steps: [
        {
          stepNumber: 1,
          title: "준비물 (앱 설치)",
          icon: "Zap",
          bullets: [
            "DB증권 앱 & DB증권 자문사 서비스 앱 (총 2개 설치)"
          ]
        },
        {
          stepNumber: 2,
          title: "1단계: DB증권 앱 계좌 개설",
          icon: "Sparkles",
          bullets: [
            "DB증권 앱 실행 → 비대면 계좌개설 → 동의 → 계좌개설 시작 → 확인",
            "리스트 하단의 FA자문사 연계 계좌 선택 → FA종합매매계좌 선택 (필요시 추가 선택)",
            "본인 인증 진행 중 ID 및 관리점 정보 입력 시: 관리지점 [강남금융센터], 관리자 [김주호]",
            "계좌 개설 완료"
          ]
        },
        {
          stepNumber: 3,
          title: "2단계: 자문사 서비스 연동 (수수료 우대용)",
          icon: "Target",
          bullets: [
            "DB증권 자문사 서비스 앱 실행 → 가입하기 → 투자성향 분석",
            "자문사 찾기 → 오로라투자자문 선택",
            "운용포트폴리오 → 오로라x주식부엉 자율형MP 선택",
            "포트폴리오 투자하기 진행 (투자금액 없어도 계좌 등록 완료됨)"
          ]
        },
        {
          stepNumber: 4,
          title: "3단계: 해외주식 거래 신청 & 폼 작성",
          icon: "CheckCircle2",
          bullets: [
            "다시 DB증권 앱 실행 → 메뉴 → 해외주식 → 서비스 신청 → 해외주식거래이용신청 완료",
            "하단의 혜택 신청 폼 작성 (수수료 우대는 휴일 제외 1-2일 뒤 적용)"
          ]
        },
        {
          stepNumber: 5,
          title: "[필수 & 참고] 꼭 해야 하는 것들",
          icon: "Lightbulb",
          bullets: [
            "모바일 OTP 발급: 출금을 대비해 미리 발급 (메뉴 → 모바일지점 → 인증/OTP → OTP/보안카드 → 모바일OTP 발급)",
            "한도제한계좌 해제: 주식 100만 원 이상 거래 시 주말 제외 3~4일 뒤 한도 제한 자동 해제",
            "투자정보 활용: 자문사 앱 오른쪽 아래 '투자정보'에서 오로라투자자문의 시황 및 리포트 확인 가능"
          ]
        }
      ]
    },
    {
      type: "cta",
      badge: "평생 우대 혜택",
      title: "주식부엉 x DB증권 수수료 우대 혜택 신청",
      description: "아래 혜택은 안내된 제휴 절차(DB증권 비대면 계좌 개설 & 자문사 앱 연동)를 진행하셔야 평생 적용됩니다.",
      benefits: [
        "해외주식 수수료 ── 0.04% [업계 최저]",
        "환전 수수료 ── 무료 (0원)",
        "국내주식 수수료 ── 0.015%",
        "이체 수수료 ── 무료 (0원)",
        "해외선물 수수료 ── $2.49"
      ],
      buttonText: "혜택 신청 폼 작성하기",
      buttonUrl: "https://docs.google.com/forms/d/e/1FAIpQLSfMK-ZxVqgFSmKq0VyJu-K8IcLQJFjdmyaouG5Pls7hfX8siA/viewform",
      isExternal: true
    }
  ]
};
