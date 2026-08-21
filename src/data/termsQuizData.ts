export interface QuizQuestion {
  id: string;
  level: 1 | 2 | 3 | 4; // 1: 초급, 2: 중급, 3: 고급, 4: 마스터
  category: string;
  keyword: string;
  question: string;
  options: string[];
  answerIndex: number; // 0, 1, 2, 3
  explanation: string;
}

export interface QuizLevelInfo {
  level: 1 | 2 | 3 | 4;
  title: string;
  badgeName: string;
  description: string;
  timeLimitSec: number;
  questionCount: number;
}

export const QUIZ_LEVELS: Record<number, QuizLevelInfo> = {
  1: {
    level: 1,
    title: '초급',
    badgeName: '입문',
    description: '주식의 기본 개념과 주문 방식, 예수금, D+2 결제, ETF 등 기초 필수 용어',
    timeLimitSec: 300,
    questionCount: 15,
  },
  2: {
    level: 2,
    title: '중급',
    badgeName: '중급',
    description: '배당락, 유무상증자, 자사주 소각, PER·PBR 재무 지표 등 실전 매매 용어',
    timeLimitSec: 300,
    questionCount: 15,
  },
  3: {
    level: 3,
    title: '고급',
    badgeName: '고급',
    description: '금리·환율 메커니즘, 양적완화, 테이퍼링, 거시경제 지표 및 시장 흐름',
    timeLimitSec: 300,
    questionCount: 15,
  },
  4: {
    level: 4,
    title: '마스터',
    badgeName: '마스터',
    description: '전환사채(CB), 신주인수권부사채(BW), 커버드콜, 듀레이션 등 심화 금융 지식',
    timeLimitSec: 300,
    questionCount: 15,
  },
};

export const TERMS_QUIZ_DATA: QuizQuestion[] = [
  // ==========================================
  // LEVEL 1: 초급 (기초 체력) - 100문항
  // ==========================================
  {
    id: "lv1-001",
    level: 1,
    category: "기초 개념",
    keyword: "주식",
    question: "회사의 소유권을 아주 잘게 쪼갠 지분 증서를 무엇이라고 할까요?",
    options: [
          "주식",
          "채권",
          "보험",
          "예금"
    ],
    answerIndex: 0,
    explanation: "주식(Stock)은 주식회사가 자본을 조달하기 위해 발행하는 회사의 소유권 조각입니다.",
  },
  {
    id: "lv1-002",
    level: 1,
    category: "기초 개념",
    keyword: "주가",
    question: "주식 시장에서 실시간으로 매수자와 매도자의 합의에 의해 결정되는 주식 1장의 가격을 무엇이라 할까요?",
    options: [
          "공모가",
          "주가",
          "액면가",
          "시가총액"
    ],
    answerIndex: 1,
    explanation: "주가(Stock Price)는 시장에서 거래되는 주식 1주의 현재 거래 가격입니다.",
  },
  {
    id: "lv1-003",
    level: 1,
    category: "기초 개념",
    keyword: "시가총액",
    question: "기업의 시장 전체 몸값을 나타내는 지표로, [현재 주가 × 발행 주식 수]로 계산되는 것은?",
    options: [
          "당기순이익",
          "자본금",
          "시가총액",
          "총자산"
    ],
    answerIndex: 2,
    explanation: "시가총액(Market Cap)은 현재 시장에서 평가받는 기업 전체의 경제적 가치(몸값)입니다.",
  },
  {
    id: "lv1-004",
    level: 1,
    category: "기초 개념",
    keyword: "배당금",
    question: "기업이 한 해 동안 영업을 통해 벌어들인 이익의 일부를 주주들에게 현금 등으로 나누어주는 보너스는?",
    options: [
          "퇴직금",
          "이자",
          "환급금",
          "배당금"
    ],
    answerIndex: 3,
    explanation: "배당금(Dividend)은 기업의 이익을 주주에게 환원하는 현금성 분배금입니다.",
  },
  {
    id: "lv1-005",
    level: 1,
    category: "시장 시스템",
    keyword: "증권거래소",
    question: "주식을 안전하고 공정하게 사고팔 수 있도록 국가의 승인을 받아 운영되는 공식 시장은?",
    options: [
          "증권거래소",
          "금융감독원",
          "국세청",
          "한국은행"
    ],
    answerIndex: 0,
    explanation: "증권거래소(Stock Exchange)는 상장된 주식이 공식적으로 거래되는 장내 시장입니다.",
  },
  {
    id: "lv1-006",
    level: 1,
    category: "시장 시스템",
    keyword: "상장",
    question: "기업이 증권거래소에 주식을 등록하여 일반 대중이 자유롭게 거래할 수 있게 하는 절차를 무엇이라 할까요?",
    options: [
          "합병",
          "상장",
          "감자",
          "청산"
    ],
    answerIndex: 1,
    explanation: "상장(Listing)은 거래소가 정한 요건을 갖춘 기업의 유가증권이 거래소 시장에서 거래되도록 허용하는 것입니다.",
  },
  {
    id: "lv1-007",
    level: 1,
    category: "시장 시스템",
    keyword: "시장 지수",
    question: "증권 시장 전체 기업들의 주가 흐름을 종합하여 하나의 평균 점수로 나타낸 지표는?",
    options: [
          "물가지수",
          "금리",
          "시장 지수",
          "환율"
    ],
    answerIndex: 2,
    explanation: "지수(Index)는 코스피, S&P 500처럼 시장의 전반적인 등락 추세를 보여주는 성적표입니다.",
  },
  {
    id: "lv1-008",
    level: 1,
    category: "실전 거래",
    keyword: "예수금",
    question: "주식을 구매하기 위해 증권 계좌에 미리 이체해 둔 순수 현금을 무엇이라 할까요?",
    options: [
          "대용금",
          "증거금",
          "미수금",
          "예수금"
    ],
    answerIndex: 3,
    explanation: "예수금(Deposit)은 주식 매매를 위해 계좌에 보관 중인 인출 가능한 순수 현금입니다.",
  },
  {
    id: "lv1-009",
    level: 1,
    category: "실전 거래",
    keyword: "호가",
    question: "주식을 사고팔기 위해 매수자나 매도자가 제시하는 구체적인 희망 가격표들을 무엇이라 할까요?",
    options: [
          "호가",
          "고가",
          "종가",
          "시가"
    ],
    answerIndex: 0,
    explanation: "호가(Quotation)는 투자자가 매매 주문을 낼 때 부르는 가격을 말합니다.",
  },
  {
    id: "lv1-010",
    level: 1,
    category: "실전 거래",
    keyword: "T+2 결제",
    question: "국내 및 미국 주식 시장에서 주문 체결 후 실제 현금과 주식이 최종 정산되는 결제 시점은?",
    options: [
          "주문 즉시",
          "T+2 영업일",
          "T+30 영업일",
          "T+1 영업일"
    ],
    answerIndex: 1,
    explanation: "주식 거래는 영업일 기준 매매일 포함 3일째(T+2일)에 증권과 대금의 최종 결제가 완료됩니다.",
  },
  {
    id: "lv1-011",
    level: 1,
    category: "실전 거래",
    keyword: "통합증거금",
    question: "원화를 달러로 미리 환전하지 않고도 원화 잔고로 미국 주식을 즉시 주문할 수 있게 해주는 증권사 제도는?",
    options: [
          "스왑거래",
          "주식담보대출",
          "통합증거금 제도",
          "신용융자"
    ],
    answerIndex: 2,
    explanation: "통합증거금 서비스는 주문 시 원화로 가계산 체결 후 결제일(T+2)에 자동 환전 정산하는 시스템입니다.",
  },
  {
    id: "lv1-012",
    level: 1,
    category: "상품 지식",
    keyword: "ETF",
    question: "특정 지수의 수익률을 추종하도록 여러 우량 기업을 분산하여 상장시킨 펀드 상품은?",
    options: [
          "채권형 랩",
          "ELS",
          "리츠",
          "ETF"
    ],
    answerIndex: 3,
    explanation: "ETF(Exchange Traded Fund)는 거래소에 상장되어 주식처럼 실시간 매매가 가능한 인덱스 펀드입니다.",
  },
  {
    id: "lv1-013",
    level: 1,
    category: "실전 거래",
    keyword: "티커",
    question: "주식 시장에서 각 상장 기업에 부여된 고유 식별 코드를 무엇이라 할까요?",
    options: [
          "종목코드",
          "SWIFT 코드",
          "바코드",
          "ISIN"
    ],
    answerIndex: 0,
    explanation: "종목코드(티커)는 삼성전자(005930), 애플(AAPL)처럼 종목을 빠르게 검색하고 식별하는 기호입니다.",
  },
  {
    id: "lv1-014",
    level: 1,
    category: "실전 거래",
    keyword: "지정가 주문",
    question: "내가 원하는 정확한 가격을 지정하여, 해당 가격 또는 그보다 유리한 가격일 때만 체결을 요청하는 주문 방식은?",
    options: [
          "시장가 주문",
          "지정가 주문",
          "최유리지정가",
          "조건부지정가"
    ],
    answerIndex: 1,
    explanation: "지정가 주문은 투자자가 정한 가격 이하(매수)나 이상(매도)으로만 체결되도록 제한하는 주문입니다.",
  },
  {
    id: "lv1-015",
    level: 1,
    category: "실전 거래",
    keyword: "시장가 주문",
    question: "가격에 상관없이 현재 시장에 나와 있는 최우선 호가로 즉시 전량 체결시키는 주문 방식은?",
    options: [
          "지정가 주문",
          "예약 주문",
          "시장가 주문",
          "시간외 단일가"
    ],
    answerIndex: 2,
    explanation: "시장가 주문은 빠른 체결을 최우선으로 하여 현 시점의 가장 유리한 가격으로 즉각 체결됩니다.",
  },
  {
    id: "lv1-016",
    level: 1,
    category: "지수 지식",
    keyword: "S&P 500",
    question: "미국을 대표하는 우량 상장 기업 500곳을 모아 시장 지수화한 미국의 핵심 대표 지수는?",
    options: [
          "다우존스 30",
          "나스닥 100",
          "러셀 2000",
          "S&P 500"
    ],
    answerIndex: 3,
    explanation: "S&P 500은 미국 주식 시장 전체 시가총액의 약 80%를 커버하는 대표 벤치마크 지수입니다.",
  },
  {
    id: "lv1-017",
    level: 1,
    category: "지수 지식",
    keyword: "나스닥",
    question: "애플, 마이크로소프트, 엔비디아 등 주로 첨단 기술주 및 혁신 성장 기업들이 상장되어 있는 미국 거래소는?",
    options: [
          "나스닥",
          "뉴욕증권거래소",
          "시카고거래소",
          "런던거래소"
    ],
    answerIndex: 0,
    explanation: "나스닥(NASDAQ)은 IT, 바이오 등 세계적인 기술주들이 대거 상장된 미국의 전자거래 시장입니다.",
  },
  {
    id: "lv1-018",
    level: 1,
    category: "국내 시장",
    keyword: "코스피",
    question: "삼성전자, 현대차 등 대한민국의 대형 우량 기업들이 주로 모여 있는 국내 제1 유가증권 시장은?",
    options: [
          "코넥스",
          "코스피",
          "K-OTC",
          "코스닥"
    ],
    answerIndex: 1,
    explanation: "코스피(KOSPI)는 한국거래소의 유가증권시장으로, 대표 대형주들이 거래되는 메인 시장입니다.",
  },
  {
    id: "lv1-019",
    level: 1,
    category: "국내 시장",
    keyword: "코스닥",
    question: "국내 유망 중소·벤처기업 및 IT, 바이오 기술 기업들이 주로 상장된 한국의 성장주 중심 시장은?",
    options: [
          "채권시장",
          "파생상품시장",
          "코스닥",
          "코스피"
    ],
    answerIndex: 2,
    explanation: "코스닥(KOSDAQ)은 성장 잠재력이 높은 벤처·기술 기업의 자금 조달을 돕는 주식 시장입니다.",
  },
  {
    id: "lv1-020",
    level: 1,
    category: "실전 거래",
    keyword: "시가",
    question: "주식 시장이 정규 개장할 때(오전 9시 등) 최초로 체결되어 결정되는 첫 거래 가격은?",
    options: [
          "고가",
          "저가",
          "종가",
          "시가"
    ],
    answerIndex: 3,
    explanation: "시가(Open Price)는 장 시작 동시호가에 의해 결정되는 당일의 첫 거래 가격입니다.",
  },
  {
    id: "lv1-021",
    level: 1,
    category: "실전 거래",
    keyword: "종가",
    question: "주식 정규 거래 시간이 마감되는 순간(오후 3시 30분 등) 마지막으로 확정된 당일의 최종 거래 가격은?",
    options: [
          "종가",
          "상한가",
          "시가",
          "호가"
    ],
    answerIndex: 0,
    explanation: "종가(Close Price)는 하루의 정규 장이 끝날 때 마지막으로 확정되는 최종 가격입니다.",
  },
  {
    id: "lv1-022",
    level: 1,
    category: "ETF 지식",
    keyword: "환헤지",
    question: "해외 투자 ETF 상품명 뒤에 붙는 (H) 표시는 무엇을 의미할까요?",
    options: [
          "미국 본사 상장",
          "환율 변동 위험을 방어",
          "단기 투자용",
          "고수익"
    ],
    answerIndex: 1,
    explanation: "(H)는 환헤지(Currency Hedged) 상품으로, 환율 변동 위험을 제거하고 순수 기초자산의 등락만 반영합니다.",
  },
  {
    id: "lv1-023",
    level: 1,
    category: "ETF 지식",
    keyword: "환노출",
    question: "ETF 상품명에 (H) 표기가 없는 일반 해외 ETF는 어떤 특징을 가질까요?",
    options: [
          "원금 보장형이다",
          "환율이 고정된다",
          "환율 변동에 자산 가치가 그대로 연동된다",
          "세금이 100% 면제된다"
    ],
    answerIndex: 2,
    explanation: "(H)가 없는 상품은 환노출 상품으로, 원/달러 환율이 오르면 ETF 평가 가치도 추가 상승합니다.",
  },
  {
    id: "lv1-024",
    level: 1,
    category: "실전 매매",
    keyword: "미수금",
    question: "증권사에서 단기 외상으로 주식을 매수한 뒤 실제 결제일까지 현금을 채워 넣지 않아 발생하는 빚은?",
    options: [
          "상환금",
          "배당금",
          "예수금",
          "미수금"
    ],
    answerIndex: 3,
    explanation: "미수금은 결제 대금이 부족할 때 발생하며, 갚지 못하면 반대매매(강제 처분)가 일어납니다.",
  },
  {
    id: "lv1-025",
    level: 1,
    category: "실전 매매",
    keyword: "반대매매",
    question: "투자자가 미수금이나 신용융자 담보 부족을 해결하지 못했을 때 증권사가 주식을 강제로 시장가 매도 처분하는 것은?",
    options: [
          "반대매매",
          "자사주 소각",
          "블록딜",
          "공매도"
    ],
    answerIndex: 0,
    explanation: "반대매매는 고객의 채무 불이행을 막기 위해 증권사가 다음 날 개장 시 하한가로 주식을 강제 처분하는 제도입니다.",
  },
  {
    id: "lv1-026",
    level: 1,
    category: "기초 개념",
    keyword: "주주",
    question: "주식을 단 1주라도 보유하여 그 기업의 지분을 소유하고 있는 사람을 무엇이라 부를까요?",
    options: [
          "채권자",
          "주주",
          "고객",
          "대리인"
    ],
    answerIndex: 1,
    explanation: "주주는 회사의 소유 지분을 보유한 실질적인 주인이자 동업자입니다.",
  },
  {
    id: "lv1-027",
    level: 1,
    category: "기초 개념",
    keyword: "시세 차익",
    question: "주식을 매수한 가격보다 더 높은 가격에 매도하여 얻게 되는 매매 차익을 무엇이라 할까요?",
    options: [
          "이자 소득",
          "배당 수익",
          "시세 차익",
          "환차익"
    ],
    answerIndex: 2,
    explanation: "시세 차익은 자산의 매수가와 매도가의 차이에서 발생하는 이익입니다.",
  },
  {
    id: "lv1-028",
    level: 1,
    category: "주식 종류",
    keyword: "우량주",
    question: "재무구조가 탄탄하고 오랜 기간 꾸준한 실적과 배당을 증명해 온 시장 선도 대형 기업의 주식은?",
    options: [
          "테마주",
          "동전주",
          "잡주",
          "우량주"
    ],
    answerIndex: 3,
    explanation: "우량주는 안정적인 경영 실적과 높은 신뢰도를 갖춘 대형 선도 기업의 주식입니다.",
  },
  {
    id: "lv1-029",
    level: 1,
    category: "주식 종류",
    keyword: "성장주",
    question: "현재의 순이익보다 미래의 폭발적인 매출 증가와 산업 혁신이 기대되는 고성장 기업의 주식은?",
    options: [
          "성장주",
          "가치주",
          "배당주",
          "채권"
    ],
    answerIndex: 0,
    explanation: "성장주는 미래 성장 잠재력이 높아 높은 주가수익비율(PER)을 적용받는 기업들입니다.",
  },
  {
    id: "lv1-030",
    level: 1,
    category: "주식 종류",
    keyword: "가치주",
    question: "기업의 실제 자산이나 실적에 비해 시장에서 상대적으로 저평가되어 저렴하게 거래되는 주식은?",
    options: [
          "모멘텀주",
          "가치주",
          "테마주",
          "성장주"
    ],
    answerIndex: 1,
    explanation: "가치주는 기업의 본질적 가치 대비 시장 가격이 낮게 형성되어 있는 주식을 의미합니다.",
  },
  {
    id: "lv1-031",
    level: 1,
    category: "ETF 지식",
    keyword: "자산운용사",
    question: "ETF나 펀드를 실제로 기획하고 운용하며 수수료를 받는 금융기관은?",
    options: [
          "증권사",
          "신용평가사",
          "자산운용사",
          "한국은행"
    ],
    answerIndex: 2,
    explanation: "미래에셋(TIGER), 삼성(KODEX), 뱅가드(Vanguard) 등은 투자자들의 자금을 모아 ETF를 운용하는 자산운용사입니다.",
  },
  {
    id: "lv1-032",
    level: 1,
    category: "거래 규칙",
    keyword: "상한가 / 하한가",
    question: "한국 주식 시장(코스피/코스닥)에서 개별 종목의 하루 주가 변동폭 제한 기준은?",
    options: [
          "±20%",
          "제한 없음",
          "±10%",
          "±30%"
    ],
    answerIndex: 3,
    explanation: "한국 정규 시장의 하루 가격 제한폭은 기준가 대비 상하 30%로 설정되어 있습니다.",
  },
  {
    id: "lv1-033",
    level: 1,
    category: "거래 규칙",
    keyword: "미국 가격제한폭",
    question: "미국 정규 주식 시장(NYSE, NASDAQ)의 하루 개별 종목 주가 상한가/하한가 제한폭은?",
    options: [
          "상하한가 제한 없음",
          "±15%",
          "±30%",
          "±50%"
    ],
    answerIndex: 0,
    explanation: "미국 시장은 인위적인 상하한가(가격제한폭)가 없으며, 급변 시 일시 거래정지(서킷브레이커/VI)만 발동됩니다.",
  },
  {
    id: "lv1-034",
    level: 1,
    category: "실전 거래",
    keyword: "거래량",
    question: "일정 기간 동안 시장에서 매수와 매도가 체결되어 실제로 오고 간 주식의 총 수량을 무엇이라 할까요?",
    options: [
          "시가총액",
          "거래량",
          "유동비율",
          "발행주식수"
    ],
    answerIndex: 1,
    explanation: "거래량(Volume)은 시장의 관심도와 유동성을 측정하는 가장 핵심적인 보조 지표입니다.",
  },
  {
    id: "lv1-035",
    level: 1,
    category: "실전 거래",
    keyword: "체결",
    question: "매수 주문자와 매도 주문자의 수량과 가격 조건이 일치하여 실제 매매 계약이 성립된 상태를 무엇이라 할까요?",
    options: [
          "접수",
          "미체결",
          "체결",
          "취소"
    ],
    answerIndex: 2,
    explanation: "체결은 주문이 시장에서 실제 거래로 성사되어 매매가 완료된 상태를 말합니다.",
  },
  {
    id: "lv1-036",
    level: 1,
    category: "차트 기초",
    keyword: "양봉",
    question: "캔들 차트에서 종가가 시가보다 더 높게 마감되었을 때(주가 상승) 표시되는 캔들의 이름은?",
    options: [
          "도지",
          "꼬리",
          "음봉",
          "양봉"
    ],
    answerIndex: 3,
    explanation: "한국 차트 기준 양봉(빨간색)은 장 시작 가격보다 끝나는 가격이 올랐음을 나타냅니다.",
  },
  {
    id: "lv1-037",
    level: 1,
    category: "차트 기초",
    keyword: "음봉",
    question: "캔들 차트에서 종가가 시가보다 더 낮게 마감되었을 때(주가 하락) 표시되는 캔들의 이름은?",
    options: [
          "음봉",
          "십자선",
          "팽이형",
          "양봉"
    ],
    answerIndex: 0,
    explanation: "한국 차트 기준 음봉(파란색)은 장 시작 가격보다 장 마감 가격이 떨어졌음을 나타냅니다.",
  },
  {
    id: "lv1-038",
    level: 1,
    category: "기초 원리",
    keyword: "복리",
    question: "원금에 발생한 이자가 다음 기간에 다시 새로운 원금에 더해져 기하급수적으로 자산이 불어나는 원리는?",
    options: [
          "할인율",
          "복리",
          "가산금리",
          "단리"
    ],
    answerIndex: 1,
    explanation: "복리는 아인슈타인이 세계 8대 불가사의라 칭한 자본 증식의 핵심 마법입니다.",
  },
  {
    id: "lv1-039",
    level: 1,
    category: "투자 심리",
    keyword: "FOMO",
    question: "남들은 다 주식으로 돈을 버는데 나만 소외되어 뒤처지는 것 같아 느끼는 극도의 조급함과 불안감은?",
    options: [
          "물타기",
          "손절매",
          "FOMO",
          "패닉셀"
    ],
    answerIndex: 2,
    explanation: "FOMO(Fear Of Missing Out)는 상승장에서 뇌동매매를 유발하는 가장 대표적인 심리적 함정입니다.",
  },
  {
    id: "lv1-040",
    level: 1,
    category: "기초 용어",
    keyword: "MTS",
    question: "스마트폰 앱을 통해 언제 어디서나 주식을 주문하고 시세를 조회할 수 있는 시스템의 약칭은?",
    options: [
          "ATM",
          "POS",
          "HTS",
          "MTS"
    ],
    answerIndex: 3,
    explanation: "MTS(Mobile Trading System)는 스마트폰에서 동작하는 증권사 모바일 거래 앱입니다.",
  },
  {
    id: "lv1-041",
    level: 1,
    category: "기초 용어",
    keyword: "HTS",
    question: "PC 컴퓨터에 프로그램을 설치하여 다수의 모니터와 전문 지표로 주식을 매매하는 시스템은?",
    options: [
          "HTS",
          "ERP",
          "WTS",
          "MTS"
    ],
    answerIndex: 0,
    explanation: "HTS(Home Trading System)는 집이나 사무실의 PC에서 사용하는 전문 증권 거래 프로그램입니다.",
  },
  {
    id: "lv1-042",
    level: 1,
    category: "투자 방식",
    keyword: "적립식 투자",
    question: "주가의 오르내림에 상관없이 매달 정해진 날짜에 일정 금액을 꾸준히 나누어 매수하는 방식은?",
    options: [
          "거치식 올인 투자",
          "적립식 분할 투자",
          "스캘핑",
          "데이 트레이딩"
    ],
    answerIndex: 1,
    explanation: "정액 분할 적립식 투자(DCA)는 매수 단가를 평단가로 안정화시키는 코스트 에버리징 효과를 제공합니다.",
  },
  {
    id: "lv1-043",
    level: 1,
    category: "투자 방식",
    keyword: "분산 투자",
    question: "\"달걀을 한 바구니에 담지 마라\"는 격언이 뜻하는, 위험을 줄이기 위해 자산을 여러 곳에 나누는 원칙은?",
    options: [
          "레버리지 투자",
          "단타 매매",
          "분산 투자",
          "집중 투자"
    ],
    answerIndex: 2,
    explanation: "분산 투자는 여러 자산과 종목에 자금을 나누어 개별 악재로 인한 파산 리스크를 제거하는 전략입니다.",
  },
  {
    id: "lv1-044",
    level: 1,
    category: "실전 거래",
    keyword: "단타 매매",
    question: "주식을 매수한 후 몇 초, 몇 분, 혹은 하루 안에 빠르게 되팔아 짧은 시세 차익을 노리는 매매법은?",
    options: [
          "가치 투자",
          "장기 적립",
          "바이 앤 홀드",
          "단기 매매"
    ],
    answerIndex: 3,
    explanation: "단기 매매는 주가의 단기 변동성을 이용해 즉각적인 차익을 노리는 고위험 매매 기법입니다.",
  },
  {
    id: "lv1-045",
    level: 1,
    category: "지수 지식",
    keyword: "다우존스 30",
    question: "미국 경제를 대표하는 유서 깊은 30개 초우량 기업의 주가를 가중평균하여 산출하는 최고령 지수는?",
    options: [
          "다우존스 지수",
          "니케이 225",
          "나스닥 종합",
          "러셀 1000"
    ],
    answerIndex: 0,
    explanation: "다우존스 산업평균지수는 1896년부터 발표된 미국의 가장 역사 깊은 30개 대표 우량주 지수입니다.",
  },
  {
    id: "lv1-046",
    level: 1,
    category: "실전 거래",
    keyword: "손절매",
    question: "주가가 추가로 폭락하여 더 큰 손실을 입는 것을 막기 위해 스스로 손실을 확정하고 매도하는 것은?",
    options: [
          "불타기",
          "손절매",
          "물타기",
          "익절"
    ],
    answerIndex: 1,
    explanation: "손절매(Stop Loss)는 원금의 치명적인 손실을 방어하기 위해 손실 상태에서 과감히 매도하는 위험 관리법입니다.",
  },
  {
    id: "lv1-047",
    level: 1,
    category: "실전 거래",
    keyword: "익절",
    question: "보유한 주식이 목표 수익률에 도달했을 때 이익을 확정 짓기 위해 매도하는 행위는?",
    options: [
          "추격 매수",
          "상장폐지",
          "익절",
          "손절"
    ],
    answerIndex: 2,
    explanation: "익절은 상승한 주식을 매도하여 실질적인 현금 수익을 통장에 확정 짓는 것입니다.",
  },
  {
    id: "lv1-048",
    level: 1,
    category: "실전 은어",
    keyword: "물타기",
    question: "내가 산 주식의 가격이 하락했을 때, 평균 매수 단가를 낮추기 위해 추가로 더 매수하는 행위는?",
    options: [
          "불타기",
          "헤징",
          "차익거래",
          "물타기"
    ],
    answerIndex: 3,
    explanation: "물타기는 하락 시 추가 매수로 평단가를 낮추는 전략이나, 부실 종목일 경우 손실이 눈덩이처럼 커집니다.",
  },
  {
    id: "lv1-049",
    level: 1,
    category: "실전 은어",
    keyword: "불타기",
    question: "내가 산 주식의 가격이 가파르게 상승할 때, 상승 추세를 믿고 추가로 더 매수하여 비중을 늘리는 것은?",
    options: [
          "불타기",
          "공매도",
          "물타기",
          "스캘핑"
    ],
    answerIndex: 0,
    explanation: "불타기(Pyramiding)는 상승 모멘텀을 타서 수익금을 극대화하기 위해 올라갈 때 비중을 싣는 전략입니다.",
  },
  {
    id: "lv1-050",
    level: 1,
    category: "기초 용어",
    keyword: "동시호가",
    question: "장 시작 직전이나 마감 직전, 주문을 일정 시간 모아두었다가 단 하나의 단일 가격으로 일괄 체결시키는 제도는?",
    options: [
          "바스켓 주문",
          "단일가 동시호가",
          "시간외 대량매매",
          "실시간 접속매매"
    ],
    answerIndex: 1,
    explanation: "동시호가는 대량 주문에 의한 가격 왜곡을 방지하고 공정한 시가/종가를 산출하기 위해 운영됩니다.",
  },
  {
    id: "lv1-051",
    level: 1,
    category: "기초 원리",
    keyword: "인플레이션",
    question: "시중에 돈이 많이 풀려 화폐 가치가 떨어지고, 물가가 지속적으로 상승하는 현상을 무엇이라 할까요?",
    options: [
          "디플레이션",
          "스태그플레이션",
          "인플레이션",
          "리세션"
    ],
    answerIndex: 2,
    explanation: "인플레이션은 현금의 가치가 떨어져 주식이나 부동산 등 실물 자산에 투자를 해야 하는 이유입니다.",
  },
  {
    id: "lv1-052",
    level: 1,
    category: "상품 지식",
    keyword: "국채",
    question: "국가가 공공 목적의 자금을 마련하기 위해 발행하는 원금 보장 신용도가 가장 높은 채권은?",
    options: [
          "정크본드",
          "후순위채",
          "회사채",
          "국채"
    ],
    answerIndex: 3,
    explanation: "국채(Government Bond)는 국가의 신용으로 보증하므로 부도 위험이 사실상 0에 수렴하는 안전자산입니다.",
  },
  {
    id: "lv1-053",
    level: 1,
    category: "상품 지식",
    keyword: "회사채",
    question: "일반 민간 주식회사가 사업 자금을 조달하기 위해 투자자들에게 이자를 약속하고 발행하는 채무 증서는?",
    options: [
          "회사채",
          "신용장",
          "주식",
          "국채"
    ],
    answerIndex: 0,
    explanation: "회사채는 기업이 원금과 고정 이자 지급을 약속하고 발행하는 채권입니다.",
  },
  {
    id: "lv1-054",
    level: 1,
    category: "계좌 지식",
    keyword: "CMA",
    question: "하루만 맡겨도 매일 이자가 붙으며 수시 입출금이 가능하여 증권사 비상금 통장으로 쓰이는 상품은?",
    options: [
          "청약통장",
          "CMA 통장",
          "정기예금",
          "퇴직연금"
    ],
    answerIndex: 1,
    explanation: "CMA(Cash Management Account)는 고객 자금을 단기 국공채나 RP 등에 투자해 매일 이자를 주는 수시입출금 계좌입니다.",
  },
  {
    id: "lv1-055",
    level: 1,
    category: "절세 지식",
    keyword: "ISA",
    question: "한 계좌 안에서 주식, ETF, 펀드 등을 운용하며 비과세 및 분리과세 혜택을 받는 개인종합자산관리계좌는?",
    options: [
          "CMA",
          "위탁계좌",
          "ISA 계좌",
          "IRP"
    ],
    answerIndex: 2,
    explanation: "ISA(Individual Savings Account)는 대한민국 정부가 국민 자산 형성을 돕기 위해 만든 만능 절세 계좌입니다.",
  },
  {
    id: "lv1-056",
    level: 1,
    category: "절세 지식",
    keyword: "연금저축계좌",
    question: "매년 연말정산 때 최대 수십만 원의 세액공제 혜택을 받고 노후에 저율 과세로 수령하는 계좌는?",
    options: [
          "외화 RP 계좌",
          "선물옵션 계좌",
          "일반 종합계좌",
          "연금저축펀드 계좌"
    ],
    answerIndex: 3,
    explanation: "연금저축계좌는 납입 시 세액공제와 과세이연 혜택을 누리며 노후를 대비해 투자를 굴리는 필수 계좌입니다.",
  },
  {
    id: "lv1-057",
    level: 1,
    category: "기초 지표",
    keyword: "환율",
    question: "우리나라 원화와 미국 달러화 등 서로 다른 국가 통화 간의 교환 비율을 무엇이라 할까요?",
    options: [
          "환율",
          "물가상승률",
          "수익률",
          "금리"
    ],
    answerIndex: 0,
    explanation: "환율은 두 나라 화폐의 상대적 가치 비율로, 수출입 기업과 해외 주식 평가에 결정적인 영향을 줍니다.",
  },
  {
    id: "lv1-058",
    level: 1,
    category: "지수 지식",
    keyword: "코스피 200",
    question: "코스피 시장에 상장된 기업 중 시장 대표성과 유동성이 높은 상위 200개 종목으로 구성된 핵심 지수는?",
    options: [
          "코스피 중형주",
          "코스피 200",
          "KRX 300",
          "코스닥 150"
    ],
    answerIndex: 1,
    explanation: "코스피 200은 한국 파생상품 시장과 주요 인덱스 ETF들의 표준 벤치마크 지수입니다.",
  },
  {
    id: "lv1-059",
    level: 1,
    category: "실전 거래",
    keyword: "동전주",
    question: "주가가 1주당 1,000원 미만으로 지폐가 아닌 동전으로 살 수 있을 만큼 저렴하지만 변동성과 위험이 극심한 주식은?",
    options: [
          "배당주",
          "블루칩",
          "동전주",
          "황제주"
    ],
    answerIndex: 2,
    explanation: "동전주(Penny Stock)는 재무구조가 취약하거나 상장폐지 위험이 높은 고위험 투기성 종목이 많습니다.",
  },
  {
    id: "lv1-060",
    level: 1,
    category: "실전 거래",
    keyword: "황제주",
    question: "1주의 가격이 100만 원을 넘어설 정도로 몸값이 비싼 초고가 주식을 부르는 별칭은?",
    options: [
          "보통주",
          "우선주",
          "동전주",
          "황제주"
    ],
    answerIndex: 3,
    explanation: "주가가 100만 원 이상인 초고가 주식을 황제주라 부르며, 유동성 공급을 위해 액면분할을 하기도 합니다.",
  },
  {
    id: "lv1-061",
    level: 1,
    category: "실전 거래",
    keyword: "액면분할",
    question: "주가가 너무 비싸 거래가 어려울 때, 주식 1주를 여러 개로 쪼개어 주가를 낮추고 유통 주식 수를 늘리는 것은?",
    options: [
          "액면분할",
          "감자",
          "유상증자",
          "액면병합"
    ],
    answerIndex: 0,
    explanation: "액면분할(Stock Split)은 기업의 본질 가치는 그대로 둔 채 주식을 쪼개어 매수 접근성을 높이는 작업입니다.",
  },
  {
    id: "lv1-062",
    level: 1,
    category: "실전 거래",
    keyword: "보통주",
    question: "주주총회에서 의결권(투표권)을 행사할 수 있는 표준적이고 일반적인 주식은?",
    options: [
          "전환주",
          "보통주",
          "신주인수권",
          "우선주"
    ],
    answerIndex: 1,
    explanation: "보통주(Common Stock)는 경영 참가 의결권을 가지며 회사 이익에 대한 일반적인 배당을 받습니다.",
  },
  {
    id: "lv1-063",
    level: 1,
    category: "실전 거래",
    keyword: "우선주",
    question: "의결권(투표권)이 없는 대신 보통주보다 더 높은 배당금이나 잔여재산 분배 우선권을 갖는 주식은?",
    options: [
          "보통주",
          "골든셰어",
          "우선주",
          "신주"
    ],
    answerIndex: 2,
    explanation: "종목명 뒤에 `우`(예: 삼성전자우)가 붙는 우선주는 배당 수익을 중시하는 투자자에게 유리합니다.",
  },
  {
    id: "lv1-064",
    level: 1,
    category: "기초 용어",
    keyword: "서킷브레이커",
    question: "주식 시장 전체 지수가 급락할 때 시장의 과열과 공포를 진정시키기 위해 매매를 일시 중단시키는 비상조치는?",
    options: [
          "사이드카",
          "관리종목",
          "정리매매",
          "서킷브레이커"
    ],
    answerIndex: 3,
    explanation: "서킷브레이커는 지수가 8%, 15%, 20% 급락할 때 20분간 시장 거래를 멈추는 비상 브레이크 제도입니다.",
  },
  {
    id: "lv1-065",
    level: 1,
    category: "기초 용어",
    keyword: "사이드카",
    question: "선물 시장의 가격이 급변할 때 정규 시장의 프로그램 매매 호가 효력을 5분간 정지시키는 완충 장치는?",
    options: [
          "사이드카",
          "서킷브레이커",
          "상벌위원회",
          "VI"
    ],
    answerIndex: 0,
    explanation: "사이드카는 선물 시장의 급등락이 현물 주식 시장으로 전이되는 충격을 완화하기 위해 발동됩니다.",
  },
  {
    id: "lv1-066",
    level: 1,
    category: "거래 제도",
    keyword: "정규 거래 시간",
    question: "한국 주식 시장(코스피·코스닥)의 평일 정규 거래 시간은 언제일까요?",
    options: [
          "오전 8시 ~ 오후 3시",
          "오전 9시 ~ 오후 3시 30분",
          "오전 9시 30분 ~ 오후 4시",
          "오전 10시 ~ 오후 4시 30분"
    ],
    answerIndex: 1,
    explanation: "한국 거래소의 정규 주식 매매 시간은 평일 오전 9시부터 오후 3시 30분까지입니다.",
  },
  {
    id: "lv1-067",
    level: 1,
    category: "거래 제도",
    keyword: "시간외 종가매매",
    question: "정규장 시작 전(08:30~08:40)이나 장 마감 후(15:40~16:00)에 당일 종가로 주식을 거래하는 제도는?",
    options: [
          "경매 매매",
          "동시호가 매매",
          "시간외 종가매매",
          "시간외 단일가매매"
    ],
    answerIndex: 2,
    explanation: "시간외 종가매매는 전일 종가(장전) 또는 당일 종가(장후)로 주문을 체결시키는 거래 제도입니다.",
  },
  {
    id: "lv1-068",
    level: 1,
    category: "거래 제도",
    keyword: "시간외 단일가매매",
    question: "오후 4시부터 6시까지 10분 단위로 주문을 모아 당일 종가 기준 ±10% 이내에서 거래하는 방식은?",
    options: [
          "장외 주식거래",
          "정규장 연속매매",
          "야간 선물매매",
          "시간외 단일가매매"
    ],
    answerIndex: 3,
    explanation: "시간외 단일가매매는 정규장 종료 후 오후 4시~6시 사이에 10분 간격으로 단일가 체결이 이루어집니다.",
  },
  {
    id: "lv1-069",
    level: 1,
    category: "안전 장치",
    keyword: "VI (변동성 완화장치)",
    question: "개별 주식의 가격이 갑자기 급등하거나 급락할 때 2분간 냉각 기간을 두어 단일가 매매로 전환시키는 장치는?",
    options: [
          "변동성 완화장치",
          "사이드카",
          "서킷브레이커",
          "스톱로스"
    ],
    answerIndex: 0,
    explanation: "변동성 완화장치(Volatility Interruption)는 개별 종목의 주가가 직전 체결가나 기준가 대비 일정 비율 이상 급변할 때 2분간 발동되는 안전장치입니다.",
  },
  {
    id: "lv1-070",
    level: 1,
    category: "안전 장치",
    keyword: "정적 VI vs 동적 VI",
    question: "주가가 이전 체결가(단기) 또는 당일 시초가(누적) 기준 일정 비율 이상 급변할 때 발동되는 2가지 변동성 완화장치 방식은?",
    options: [
          "사이드카와 서킷브레이커",
          "정적 VI와 동적 VI",
          "스톱로스와 마진콜",
          "상한가와 하한가"
    ],
    answerIndex: 1,
    explanation: "동적 VI는 직전 체결가 기준(2~6%), 정적 VI는 당일 시초가 기준(10%) 누적 변동성을 완화하기 위해 2분간 단일가 매매로 전환하는 장치입니다.",
  },
  {
    id: "lv1-071",
    level: 1,
    category: "거래 제도",
    keyword: "거래 정지",
    question: "상장 기업에 중대한 합병, 횡령·배임, 부도 등 시장에 큰 영향을 미칠 중요 정보가 발생했을 때 거래소가 주식 매매를 일시 중단시키는 조치는?",
    options: [
          "자본잠식 공시",
          "관리종목 지정",
          "거래 정지",
          "감자 명령"
    ],
    answerIndex: 2,
    explanation: "거래 정지는 중요 정보가 시장에 완전히 공개되어 투자자들이 합리적인 판단을 내릴 때까지 불공정 거래를 막기 위해 취하는 조치입니다.",
  },
  {
    id: "lv1-072",
    level: 1,
    category: "거래 제도",
    keyword: "단일가 매매",
    question: "일정 시간 동안 들어온 모든 매수·매도 주문을 모아 하나의 일치된 공정 가격으로 한 번에 체결시키는 매매 방식은?",
    options: [
          "연속 매매",
          "장외 거래",
          "블록딜",
          "단일가 매매"
    ],
    answerIndex: 3,
    explanation: "단일가 매매는 동시호가 시간이나 VI 발동 시, 시간외 단일가 등에서 단 하나의 가격으로 대량 주문을 공정하게 체결시키는 방식입니다.",
  },
  {
    id: "lv1-073",
    level: 1,
    category: "해외 주식",
    keyword: "프리마켓",
    question: "미국 정규 주식 시장이 열리기 전, 미리 주식을 거래할 수 있는 거래 시간을 무엇이라 할까요?",
    options: [
          "프리마켓",
          "애프터마켓",
          "나이트마켓",
          "얼리버드장"
    ],
    answerIndex: 0,
    explanation: "프리마켓은 미국 정규장(현지 기준 09:30) 시작 전 미리 거래가 이루어지는 개장 전 시장입니다.",
  },
  {
    id: "lv1-074",
    level: 1,
    category: "해외 주식",
    keyword: "애프터마켓",
    question: "미국 정규 주식 시장이 마감된 후 기업들의 실적 발표 등을 반영하여 추가로 거래할 수 있는 시장은?",
    options: [
          "프리마켓",
          "애프터마켓",
          "오버나이트장",
          "연장장"
    ],
    answerIndex: 1,
    explanation: "애프터마켓(장후 거래)은 미국 정규장 마감 후 기업들의 어닝 발표나 주요 뉴스를 반영하여 거래하는 시장입니다.",
  },
  {
    id: "lv1-075",
    level: 1,
    category: "해외 주식",
    keyword: "원화 주문 서비스",
    question: "달러로 직접 환전하지 않아도 증권사 계좌의 원화 예수금으로 미국 주식을 바로 구매할 수 있는 편리한 서비스는?",
    options: [
          "해외 대차거래",
          "신용 융자",
          "원화 주문 서비스",
          "통화 스왑"
    ],
    answerIndex: 2,
    explanation: "원화 주문 서비스를 이용하면 달러가 없어도 보유 원화로 해외 주식을 즉시 구매하고 익일 자동 환전 처리됩니다.",
  },
  {
    id: "lv1-076",
    level: 1,
    category: "주식 권리",
    keyword: "주주총회",
    question: "주식회사의 주인인 주주들이 모여 이사 선임, 재무제표 승인 등 회사의 가장 중요한 안건을 투표로 결정하는 최고 의결 기구는?",
    options: [
          "이사회",
          "감사회",
          "노사협의회",
          "주주총회"
    ],
    answerIndex: 3,
    explanation: "주주총회는 주식회사의 최고 의사결정 기구로, 1주 1의결권 원칙에 따라 주주들이 회사의 주요 사항을 결정합니다.",
  },
  {
    id: "lv1-077",
    level: 1,
    category: "주식 권리",
    keyword: "의결권",
    question: "주주가 주주총회에 출석하여 보유한 주식 수에 비례하여 안건에 찬성 또는 반대 표를 던질 수 있는 권리는?",
    options: [
          "의결권",
          "신주인수권",
          "배당수익권",
          "잔여재산청구권"
    ],
    answerIndex: 0,
    explanation: "의결권은 보통주 1주당 1표씩 주어지는 주주의 가장 기본적인 경영 참여 권리입니다.",
  },
  {
    id: "lv1-078",
    level: 1,
    category: "배당 제도",
    keyword: "분기배당",
    question: "1년에 단 한 번 결산 배당만 주는 것이 아니라, 3월·6월·9월 등 3개월마다 1년에 총 4번 배당금을 나누어 지급하는 방식은?",
    options: [
          "연말배당",
          "분기배당",
          "특별배당",
          "주식배당"
    ],
    answerIndex: 1,
    explanation: "분기배당(Quarterly Dividend)은 미국 주식의 표준적인 배당 방식이며, 국내에서도 주주 환원을 위해 도입하는 우량 기업이 늘고 있습니다.",
  },
  {
    id: "lv1-079",
    level: 1,
    category: "배당 제도",
    keyword: "배당락일",
    question: "배당기준일이 지나서 이날 주식을 구매해도 이번 배당금을 받을 권리가 주어지지 않는 첫 번째 날은?",
    options: [
          "배당지급일",
          "권리락일",
          "배당락일",
          "결제일"
    ],
    answerIndex: 2,
    explanation: "배당락일(Ex-Dividend Date)에는 배당을 받을 권리가 사라지기 때문에 통상 배당금만큼 주가가 하락하여 시작하는 경향이 있습니다.",
  },
  {
    id: "lv1-080",
    level: 1,
    category: "공모주 (IPO)",
    keyword: "공모주 청약",
    question: "새로 증권 시장에 상장하는 기업의 주식을 일반 대중에 정식 거래되기 전 정해진 공모가로 배정받기 위해 신청하는 것은?",
    options: [
          "실권주 청약",
          "장외 매수",
          "유상증자 청약",
          "공모주 청약"
    ],
    answerIndex: 3,
    explanation: "공모주 청약은 비상장 기업이 상장(IPO)할 때 일반 투자자가 주식을 배정받기 위해 증거금을 내고 신청하는 절차입니다.",
  },
  {
    id: "lv1-081",
    level: 1,
    category: "공모주 (IPO)",
    keyword: "주관사",
    question: "기업의 상장(IPO) 절차를 총괄하고, 기업 가치를 평가하며 공모주 청약을 주관하는 증권사를 무엇이라 할까요?",
    options: [
          "주관사",
          "위탁사",
          "신탁사",
          "예탁결제원"
    ],
    answerIndex: 0,
    explanation: "주관사(Lead Underwriter)는 기업의 상장 심사부터 공모가 산정, 청약 진행까지 IPO 전 과정을 책임지는 대표 증권사입니다.",
  },
  {
    id: "lv1-082",
    level: 1,
    category: "공모주 (IPO)",
    keyword: "균등 배정",
    question: "공모주 청약 시 증거금 액수와 상관없이 최소 청약 증거금을 넣은 모든 청약자에게 주식을 똑같이 균등하게 나누어주는 배정 방식은?",
    options: [
          "비례 배정",
          "균등 배정",
          "우선 배정",
          "사모 배정"
    ],
    answerIndex: 1,
    explanation: "균등 배정은 소액 투자자에게도 공평한 공모주 배정 기회를 주기 위해 총 공모 물량의 50% 이상을 전원 균등 분배하는 제도입니다.",
  },
  {
    id: "lv1-083",
    level: 1,
    category: "공모주 (IPO)",
    keyword: "비례 배정",
    question: "공모주 청약 시 청약 증거금을 많이 넣은 투자자일수록 증거금 규모에 비례하여 더 많은 주식을 배정받는 방식은?",
    options: [
          "균등 배정",
          "추첨 배정",
          "비례 배정",
          "선착순 배정"
    ],
    answerIndex: 2,
    explanation: "비례 배정은 투자자가 납입한 증거금 액수에 비례하여 주식을 배정하는 방식입니다.",
  },
  {
    id: "lv1-084",
    level: 1,
    category: "공모주 (IPO)",
    keyword: "환불일",
    question: "공모주 청약 결과 주식을 배정받지 못하고 남은 청약 증거금이 내 증권 계좌로 다시 돌아오는 날은?",
    options: [
          "상장일",
          "배당일",
          "결제일",
          "청약 환불일"
    ],
    answerIndex: 3,
    explanation: "환불일은 공모주 배정이 완료된 후 배정받은 주식 대금을 뺀 나머지 잔여 증거금이 전액 환불되는 날입니다.",
  },
  {
    id: "lv1-085",
    level: 1,
    category: "공모주 (IPO)",
    keyword: "따상",
    question: "신규 상장 주식이 첫날 공모가의 2배로 시초가를 형성한 뒤 당일 가격제한폭(+30%)인 상한가까지 직행하는 은어는?",
    options: [
          "따상",
          "점상",
          "상따",
          "따블"
    ],
    answerIndex: 0,
    explanation: "따상은 '더블(2배) + 상한가(+30%)'의 합성어로, 공모가 대비 최대 160%의 당일 수익률을 기록하는 현상을 의미합니다.",
  },
  {
    id: "lv1-086",
    level: 1,
    category: "시장 규제",
    keyword: "상장폐지 실질심사",
    question: "기업이 분식회계, 횡령, 자본잠식 등 중대한 퇴출 사유가 발생했을 때 거래소가 상장 유지 적격성을 최종 심사하는 절차는?",
    options: [
          "기업설명회",
          "상장폐지 실질심사",
          "예비 상장심사",
          "신용평가"
    ],
    answerIndex: 1,
    explanation: "상장폐지 실질심사 대상이 되면 매매 거래가 정지되며, 심의 결과에 따라 개선 기간이 부여되거나 증시에서 최종 퇴출(상장폐지)됩니다.",
  },
  {
    id: "lv1-087",
    level: 1,
    category: "시장 경보",
    keyword: "시장경보제도",
    question: "단기간 주가가 비정상적으로 급등하거나 투기적 거래가 몰릴 때 거래소가 [투자주의 ➔ 투자경고 ➔ 투자위험] 단계로 지정하는 제도는?",
    options: [
          "세이프가드",
          "서킷브레이커",
          "시장경보제도",
          "공매도 과열제도"
    ],
    answerIndex: 2,
    explanation: "시장경보제도는 투기적 뇌동매매를 방지하기 위해 투자주의 ➔ 투자경고 ➔ 투자위험 단계별로 경고를 발령하는 제도입니다.",
  },
  {
    id: "lv1-088",
    level: 1,
    category: "투자 전략",
    keyword: "손절가 (Stop Loss)",
    question: "주가가 예상과 다르게 하락할 때 더 큰 손실을 막기 위해 원칙적으로 주식을 판매하기로 정해둔 기준 가격은?",
    options: [
          "목표가",
          "공모가",
          "평균단가",
          "손절가"
    ],
    answerIndex: 3,
    explanation: "손절가(Stop-loss)는 감정에 휩쓸리지 않고 자산을 보호하기 위해 미리 설정해두는 기계적 손실 확정 가격입니다.",
  },
  {
    id: "lv1-089",
    level: 1,
    category: "투자 전략",
    keyword: "목표가 (Target Price)",
    question: "기업 분석을 바탕으로 적정 가치에 도달했을 때 이익을 실현하기 위해 미리 설정해두는 판매 기준 가격은?",
    options: [
          "목표가",
          "손절가",
          "호가",
          "시초가"
    ],
    answerIndex: 0,
    explanation: "목표가는 투자 전 설정한 기대 수익 실현 기준선입니다.",
  },
  {
    id: "lv1-090",
    level: 1,
    category: "투자 심리",
    keyword: "뇌동매매",
    question: "자신만의 명확한 투자 원칙이나 분석 없이 남들의 소문이나 급등하는 호가창을 보고 충동적으로 주식을 구매하는 행위는?",
    options: [
          "분할 매매",
          "뇌동매매",
          "가치 투자",
          "퀀트 투자"
    ],
    answerIndex: 1,
    explanation: "뇌동매매는 감정에 휩쓸려 충동적으로 매매하는 행위로, 초보 투자자들이 손실을 보는 가장 큰 원인 중 하나입니다.",
  },
  {
    id: "lv1-091",
    level: 1,
    category: "수익 분석",
    keyword: "손익분기점",
    question: "주식 매매에서 거래 수수료와 세금을 포함한 총비용과 총수익이 정확히 같아져 이익도 손실도 0이 되는 기준 가격은?",
    options: [
          "목표가",
          "평균단가",
          "손익분기점",
          "액면가"
    ],
    answerIndex: 2,
    explanation: "손익분기점(BEP)은 매수 가격에 증권사 매매 수수료와 증권거래세 등 부대비용을 모두 더하여 원금을 온전히 건질 수 있는 탈출 가격입니다.",
  },
  {
    id: "lv1-092",
    level: 1,
    category: "투자 전략",
    keyword: "추세 추종 매매",
    question: "바닥을 예측하려 하지 않고, 주가가 이미 상승 추세를 타고 위로 달리기 시작할 때 올라타서 추세가 꺾일 때까지 수익을 극대화하는 전략은?",
    options: [
          "역발상 투자",
          "가치 투자",
          "바닥 낚시",
          "추세 추종 매매"
    ],
    answerIndex: 3,
    explanation: "추세 추종 매매(Trend Following)는 \"달리는 말에 올라타라\"는 격언처럼 강력한 시장의 우상향 흐름에 편승하는 매매법입니다.",
  },
  {
    id: "lv1-093",
    level: 1,
    category: "수익률 원리",
    keyword: "복리 효과",
    question: "시간이 지남에 따라 원금뿐만 아니라 불어난 이자와 수익금에도 다시 수익이 붙어 자산이 눈덩이처럼 기하급수적으로 불어나는 원리는?",
    options: [
          "복리 효과",
          "단리 효과",
          "음의 복리",
          "레버리지 효과"
    ],
    answerIndex: 0,
    explanation: "워런 버핏의 스노우볼 비유처럼 복리 효과는 장기 투자와 배당 재투자가 결합될 때 엄청난 자산 증식의 마법을 부립니다.",
  },
  {
    id: "lv1-094",
    level: 1,
    category: "투자 방식",
    keyword: "거치식 투자",
    question: "투자할 목돈 전체를 한 번에 주식이나 펀드에 투입하고 장기간 그대로 묻어두는 방식은?",
    options: [
          "적립식 투자",
          "거치식 투자",
          "스윙 매매",
          "분할 매매"
    ],
    answerIndex: 1,
    explanation: "거치식 투자는 목돈을 일시에 투자하여 시장의 장기적인 우상향 복리 효과를 온전히 누리는 방식입니다.",
  },
  {
    id: "lv1-095",
    level: 1,
    category: "투자 관리",
    keyword: "포트폴리오",
    question: "한 종목에 몰빵하지 않고 여러 주식, 채권, 현금 등에 자산을 골고루 나누어 담은 '투자 바구니'를 무엇이라 할까요?",
    options: [
          "계좌원장",
          "레버리지",
          "포트폴리오",
          "위탁계좌"
    ],
    answerIndex: 2,
    explanation: "포트폴리오(Portfolio)는 위험을 분산하고 안정적인 수익을 추구하기 위해 구성한 자산 배분 조합입니다.",
  },
  {
    id: "lv1-096",
    level: 1,
    category: "계좌 관리",
    keyword: "현금 비중 관리",
    question: "주식 계좌의 모든 돈을 주식에 100% 몰빵하지 않고, 폭락장 저가 매수 기회를 위해 항상 계좌의 10~30%를 현금으로 남겨두는 전략은?",
    options: [
          "올인 전략",
          "신용 거래",
          "미수 거래",
          "현금 비중 관리"
    ],
    answerIndex: 3,
    explanation: "현금 역시 중요한 하나의 자산군이며, 위기 상황에서 최고의 우량주를 헐값에 쓸어 담을 수 있는 강력한 무기이자 완충재 역할을 합니다.",
  },
  {
    id: "lv1-097",
    level: 1,
    category: "수익률 개념",
    keyword: "원금 손실 위험",
    question: "은행 예금과 달리 주식 투자는 기업 실적이나 시장 상황에 따라 투자한 원금의 일부 또는 전부를 잃을 수 있는 특성은?",
    options: [
          "원금 손실 위험",
          "원금 보장성",
          "예금자 보호",
          "비과세 혜택"
    ],
    answerIndex: 0,
    explanation: "주식은 은행 예금과 달리 원금이 보장되지 않으며, 높은 수익률 뒤에 원금 손실 위험이 수반되는 실적 배당 금융상품입니다.",
  },
  {
    id: "lv1-098",
    level: 1,
    category: "세금과 비용",
    keyword: "증권 거래세",
    question: "한국 주식 시장에서 주식을 판매(매도)할 때 이익이나 손실 여부와 상관없이 매도 대금의 일정 비율로 국가에 납부하는 세금은?",
    options: [
          "소득세",
          "증권 거래세",
          "부가가치세",
          "취득세"
    ],
    answerIndex: 1,
    explanation: "증권 거래세는 국내 상장 주식을 판매할 때 자동으로 원천징수되는 거래 관련 세금입니다.",
  },
  {
    id: "lv1-099",
    level: 1,
    category: "세금과 비용",
    keyword: "배당소득세",
    question: "기업으로부터 배당금을 받을 때 원천징수되는 세금으로, 한국 기준 15.4%(지방소득세 포함)를 떼고 입금되는 세금은?",
    options: [
          "양도소득세",
          "법인세",
          "배당소득세",
          "종합부동산세"
    ],
    answerIndex: 2,
    explanation: "배당소득세는 배당금 수령 시 15.4%(소득세 14% + 지방소득세 1.4%)가 자동 공제된 후 계좌로 입금됩니다.",
  },
  {
    id: "lv1-100",
    level: 1,
    category: "계좌 혜택",
    keyword: "ISA (개인종합자산관리계좌)",
    question: "한 계좌에서 주식·ETF·예금 등 다양한 상품을 운용하며 발생한 순이익에 대해 비과세 및 분리과세 혜택을 주는 만능 통장은?",
    options: [
          "CMA 통장",
          "마이너스통장",
          "종합위탁계좌",
          "ISA"
    ],
    answerIndex: 3,
    explanation: "ISA(Individual Savings Account)는 정부가 국민의 자산 형성을 돕기 위해 비과세 및 저율 분리과세 혜택을 제공하는 절세 계좌입니다.\n \n \n \n \n ## 🌿 2단계: 중급 (실전 매매) (100문항)\n\n\n\n\n## 🌿 2단계: 중급 (실전 매매) (100문항)",
  },
  // ==========================================
  // LEVEL 2: 중급 (실전 매매) - 100문항
  // ==========================================
  {
    id: "lv2-001",
    level: 2,
    category: "가치 평가",
    keyword: "PER",
    question: "현재 주가를 주당순이익(EPS)으로 나눈 값으로, 기업이 벌어들이는 이익 대비 주가가 몇 배인지 나타내는 지표는?",
    options: [
          "PER",
          "EV/EBITDA",
          "ROE",
          "PBR"
    ],
    answerIndex: 0,
    explanation: "PER(Price to Earnings Ratio)은 주가가 순이익의 몇 배에 거래되는지 보여주는 대표 수익성 밸류에이션입니다.",
  },
  {
    id: "lv2-002",
    level: 2,
    category: "가치 평가",
    keyword: "PBR",
    question: "현재 주가를 주당순자산(BPS)으로 나눈 값으로, 회사가 망하고 모든 자산을 청산했을 때의 가치 대비 주가 배수는?",
    options: [
          "PER",
          "PBR",
          "PSR",
          "ROE"
    ],
    answerIndex: 1,
    explanation: "PBR(Price to Book Ratio)이 1배 미만이면 기업의 현재 시가총액이 순자산 청산가치보다도 싸다는 의미입니다.",
  },
  {
    id: "lv2-003",
    level: 2,
    category: "수익성 지표",
    keyword: "ROE",
    question: "기업이 주주의 자기자본을 투입하여 한 해 동안 얼마나 효율적으로 순이익을 창출했는지 보여주는 자기자본이익률은?",
    options: [
          "ROI",
          "ROA",
          "ROE",
          "ROS"
    ],
    answerIndex: 2,
    explanation: "ROE(Return on Equity)는 워런 버핏이 가장 중요하게 꼽는 지표로, 자본의 복리 증식 효율성을 뜻합니다.",
  },
  {
    id: "lv2-004",
    level: 2,
    category: "수익성 지표",
    keyword: "EPS",
    question: "기업이 한 해 동안 벌어들인 당기순이익을 총 발행주식 수로 나눈 1주당 순이익 지표는?",
    options: [
          "DPS",
          "BPS",
          "SPS",
          "EPS"
    ],
    answerIndex: 3,
    explanation: "EPS(Earnings Per Share)는 1주가 벌어들인 실질적인 알짜 순이익을 나타냅니다.",
  },
  {
    id: "lv2-005",
    level: 2,
    category: "가치 평가",
    keyword: "배당수익률",
    question: "현재 주가 대비 1년 동안 지급받는 주당 배당금의 비율을 백분율(%)로 나타낸 것은?",
    options: [
          "배당수익률",
          "유보율",
          "배당성향",
          "배당락"
    ],
    answerIndex: 0,
    explanation: "배당수익률 = (1주당 배당금 ÷ 현재 주가) × 100으로, 주가 대비 실질 배당 이자율입니다.",
  },
  {
    id: "lv2-006",
    level: 2,
    category: "배당 지식",
    keyword: "배당성향",
    question: "기업이 1년 동안 벌어들인 전체 당기순이익 중 주주들에게 배당금으로 지급한 총액의 비율은?",
    options: [
          "부채비율",
          "배당성향",
          "자기자본비율",
          "배당수익률"
    ],
    answerIndex: 1,
    explanation: "배당성향은 순이익 중 얼마를 주주에게 환원하고 얼마를 사내에 재투자용으로 유보했는지 보여줍니다.",
  },
  {
    id: "lv2-007",
    level: 2,
    category: "실전 이벤트",
    keyword: "배당락",
    question: "배당기준일이 지나 이번 분기 배당금을 받을 권리가 소멸됨에 따라 다음 날 주가가 배당금만큼 하락 조정되는 현상은?",
    options: [
          "권리락",
          "상장폐지",
          "배당락",
          "감자"
    ],
    answerIndex: 2,
    explanation: "배당락일에는 배당금을 받을 권리가 사라지므로 시장에서 통상 배당금 분량만큼 시초가가 하락하여 출발합니다.",
  },
  {
    id: "lv2-008",
    level: 2,
    category: "기업 행동",
    keyword: "유상증자",
    question: "기업이 신규 시설 투자나 부채 상환을 위해 새로운 주식을 새로 찍어내 주주나 일반인에게 돈을 받고 판매하는 것은?",
    options: [
          "액면분할",
          "무상증자",
          "자사주 소각",
          "유상증자"
    ],
    answerIndex: 3,
    explanation: "유상증자는 주식 수가 늘어나 기존 주주의 지분 가치가 희석되므로 단기 주가 악재로 작용하는 경우가 많습니다.",
  },
  {
    id: "lv2-009",
    level: 2,
    category: "기업 행동",
    keyword: "무상증자",
    question: "기업에 쌓아둔 잉여금을 자본금으로 전입하고, 기존 주주들에게 공짜로 주식을 보너스처럼 나누어주는 것은?",
    options: [
          "무상증자",
          "유상감자",
          "유상증자",
          "감자"
    ],
    answerIndex: 0,
    explanation: "무상증자는 주주에게 대가 없이 주식을 추가 배정하는 것으로, 주주환원 및 유동성 증대 호재로 인식됩니다.",
  },
  {
    id: "lv2-010",
    level: 2,
    category: "주주 환원",
    keyword: "자사주 매입 및 소각",
    question: "회사가 자기 돈으로 시장의 자기 회사 주식을 사들인 뒤 완전히 없애버려 1주당 가치를 극대화하는 주주환원책은?",
    options: [
          "전환사채 발행",
          "자사주 매입 및 소각",
          "블록딜",
          "유상증자"
    ],
    answerIndex: 1,
    explanation: "자사주 소각은 전체 유통 주식 수를 영구적으로 줄이므로 주당순이익(EPS)과 주주 가치를 즉각 끌어올립니다.",
  },
  {
    id: "lv2-011",
    level: 2,
    category: "매매 기법",
    keyword: "공매도",
    question: "주식을 보유하고 있지 않은 상태에서 주가 하락이 예상될 때 주식을 빌려 먼저 팔고, 주가가 떨어지면 싸게 사서 갚아 차익을 내는 기법은?",
    options: [
          "선물매수",
          "스캘핑",
          "공매도",
          "신용매수"
    ],
    answerIndex: 2,
    explanation: "공매도(Short Selling)는 주가 하락에 베팅하는 기법으로, 주가가 내려갈수록 이익이 커집니다.",
  },
  {
    id: "lv2-012",
    level: 2,
    category: "실전 거래",
    keyword: "숏스퀴즈",
    question: "공매도를 친 세력이 예상치 못한 주가 급등으로 막대한 손실을 피하기 위해 급하게 주식을 되사면서 주가가 폭등하는 현상은?",
    options: [
          "어닝 서프라이즈",
          "데드캣 바운스",
          "서킷브레이커",
          "숏스퀴즈"
    ],
    answerIndex: 3,
    explanation: "숏스퀴즈는 공매도 포지션의 강제 손절성 매수세(숏커버링)가 몰려 주가가 수직 상승하는 현상입니다.",
  },
  {
    id: "lv2-013",
    level: 2,
    category: "실적 발표",
    keyword: "어닝 서프라이즈",
    question: "기업이 발표한 분기 실적이 시장 애널리스트들의 평균 예상치(컨센서스)를 훨씬 뛰어넘는 놀라운 호실적을 냈을 때의 용어는?",
    options: [
          "어닝 서프라이즈",
          "어닝 쇼크",
          "빅배스",
          "실적 둔화"
    ],
    answerIndex: 0,
    explanation: "어닝 서프라이즈는 시장의 눈높이를 초과하는 실적을 기록하여 주가 급등의 강력한 촉매가 됩니다.",
  },
  {
    id: "lv2-014",
    level: 2,
    category: "실적 발표",
    keyword: "어닝 쇼크",
    question: "기업의 실적이 시장의 기대치에 턱없이 미치지 못해 주가에 큰 충격을 주는 현상은?",
    options: [
          "어닝 서프라이즈",
          "어닝 쇼크",
          "골든크로스",
          "턴어라운드"
    ],
    answerIndex: 1,
    explanation: "어닝 쇼크는 실적이 예상치보다 크게 하회하여 투자자들의 실망 매물이 쏟아지는 현상입니다.",
  },
  {
    id: "lv2-015",
    level: 2,
    category: "차트 기술",
    keyword: "이동평균선",
    question: "일정 기간(5일, 20일, 60일, 120일 등) 동안의 주가 종가 평균값을 선으로 연결하여 전체적인 추세를 보여주는 선은?",
    options: [
          "일목균형표",
          "MACD",
          "이동평균선",
          "볼린저밴드"
    ],
    answerIndex: 2,
    explanation: "이동평균선(Moving Average)은 단기 잡음을 제거하고 주가의 방향성과 지지/저항을 파악하는 핵심 지표입니다.",
  },
  {
    id: "lv2-016",
    level: 2,
    category: "차트 기술",
    keyword: "골든크로스",
    question: "단기 이동평균선(예: 20일선)이 장기 이동평균선(예: 60일선)을 아래에서 위로 강력하게 뚫고 올라가는 강력한 매수 신호는?",
    options: [
          "데드크로스",
          "수렴",
          "역배열",
          "골든크로스"
    ],
    answerIndex: 3,
    explanation: "골든크로스는 최근 매수세가 과거 평균을 압도하여 본격적인 상승 추세로의 전환을 의미합니다.",
  },
  {
    id: "lv2-017",
    level: 2,
    category: "차트 기술",
    keyword: "데드크로스",
    question: "단기 이동평균선이 중장기 이동평균선을 위에서 아래로 뚫고 내려앉는 강력한 하락 추세 전환 신호는?",
    options: [
          "데드크로스",
          "골든크로스",
          "발산",
          "정배열"
    ],
    answerIndex: 0,
    explanation: "데드크로스는 단기 투자 심리가 급격히 악화되어 하락 추세가 시작될 가능성을 경고합니다.",
  },
  {
    id: "lv2-018",
    level: 2,
    category: "보조 지표",
    keyword: "RSI",
    question: "최근 14일간의 주가 상승폭과 하락폭을 비교하여 현재 주가가 과매수(70 이상)인지 과매도(30 이하)인지 판단하는 상대강도지수는?",
    options: [
          "볼린저밴드",
          "RSI",
          "스토캐스틱",
          "OBV"
    ],
    answerIndex: 1,
    explanation: "RSI(Relative Strength Index)는 주가의 모멘텀 강도를 0~100 사이 숫자로 나타내는 대표 오실레이터 지표입니다.",
  },
  {
    id: "lv2-019",
    level: 2,
    category: "가치 지표",
    keyword: "PSR",
    question: "현재 시가총액을 기업의 연간 총 매출액으로 나눈 값으로, 아직 흑자를 내지 못하는 신생 혁신 기업의 가치를 평가할 때 쓰는 지표는?",
    options: [
          "PER",
          "EV/Sales",
          "PSR",
          "PBR"
    ],
    answerIndex: 2,
    explanation: "PSR(Price to Sales Ratio)은 순이익이 적자라도 매출이 폭발적으로 성장하는 유니콘 기업을 평가할 때 유용합니다.",
  },
  {
    id: "lv2-020",
    level: 2,
    category: "차트 기술",
    keyword: "지지선",
    question: "주가가 하락할 때 더 이상 떨어지지 않고 매수세가 유입되어 주가를 받쳐주는 특정 가격대를 무엇이라 할까요?",
    options: [
          "저항선",
          "돌파선",
          "추세선",
          "지지선"
    ],
    answerIndex: 3,
    explanation: "지지선은 과거 바닥 형성이나 심리적 매수 대기 물량이 밀집된 하방 방어선입니다.",
  },
  {
    id: "lv2-021",
    level: 2,
    category: "차트 기술",
    keyword: "저항선",
    question: "주가가 상승할 때 차익 실현 및 본전 탈출 매도 물량이 쏟아져 추가 상승을 가로막는 상방 가격대는?",
    options: [
          "저항선",
          "넥라인",
          "지지선",
          "이평선"
    ],
    answerIndex: 0,
    explanation: "저항선은 이전 고점에 물려 있던 투자자들의 매도세가 출회되는 상방 장애물 구간입니다.",
  },
  {
    id: "lv2-022",
    level: 2,
    category: "지수 관리",
    keyword: "리밸런싱",
    question: "주가 변동으로 인해 당초 설정했던 목표 포트폴리오 자산 비중이 틀어졌을 때, 원래 비중대로 맞추기 위해 매매하는 행위는?",
    options: [
          "스캘핑",
          "리밸런싱",
          "차익거래",
          "손절매"
    ],
    answerIndex: 1,
    explanation: "리밸런싱은 오른 자산을 일부 팔고 내린 자산을 채워 넣어 위험을 관리하고 포트폴리오를 정상화하는 작업입니다.",
  },
  {
    id: "lv2-023",
    level: 2,
    category: "대량 거래",
    keyword: "블록딜",
    question: "대주주나 기관투자가가 대량의 주식을 장내에서 팔면 주가가 급락하므로, 장 시작 전이나 마감 후 기관끼리 장외에서 할인된 가격에 일괄 넘기는 것은?",
    options: [
          "자사주 소각",
          "공개매수",
          "블록딜",
          "스왑거래"
    ],
    answerIndex: 2,
    explanation: "블록딜(Block Deal)은 시장 충격을 줄이기 위해 장외에서 대량 지분을 할인율을 적용해 일괄 거래하는 방식입니다.",
  },
  {
    id: "lv2-024",
    level: 2,
    category: "기업 행동",
    keyword: "보호예수",
    question: "신규 상장이나 유상증자 시 대주주나 기관이 상장 직후 주식을 곧바로 팔아 치워 주가가 폭락하는 것을 막기 위해 일정 기간 매도를 금지하는 제도는?",
    options: [
          "대차거래",
          "반대매매",
          "신용거래",
          "보호예수"
    ],
    answerIndex: 3,
    explanation: "보호예수(Lock-up) 해제일이 다가오면 대량의 잠재적 매도 물량(오버행)이 쏟아질 수 있어 주가 하방 압력이 커집니다.",
  },
  {
    id: "lv2-025",
    level: 2,
    category: "수급 용어",
    keyword: "오버행",
    question: "시장에 언제든지 대량으로 쏟아져 나올 수 있는 잠재적인 대기 매도 물량 부담을 뜻하는 용어는?",
    options: [
          "오버행",
          "언더밸류",
          "패닉셀",
          "빅쇼트"
    ],
    answerIndex: 0,
    explanation: "오버행 이슈는 전환사채 만기나 보호예수 해제 등으로 유통 주식 수가 급증할 수 있는 잠재적 리스크입니다.",
  },
  {
    id: "lv2-026",
    level: 2,
    category: "가치 평가",
    keyword: "EV/EBITDA",
    question: "기업의 순수 시장 몸값(EV)을 기업이 영업활동으로 벌어들인 현금창출능력(EBITDA)으로 나눈 지표로, 투자원금을 회수하는 데 몇 년이 걸리는지 보여주는 것은?",
    options: [
          "ROIC",
          "EV/EBITDA",
          "PBR",
          "PER"
    ],
    answerIndex: 1,
    explanation: "EV/EBITDA는 감가상각비와 부채까지 고려하여 기업의 진짜 현금 회수 기간을 측정하는 유용한 지표입니다.",
  },
  {
    id: "lv2-027",
    level: 2,
    category: "재무 상태",
    keyword: "부채비율",
    question: "기업의 타인자본(부채총계)을 자기자본(자본총계)으로 나눈 비율로, 통상 100~200% 이하일 때 건전하다고 평가하는 지표는?",
    options: [
          "유동비율",
          "당좌비율",
          "부채비율",
          "이자보상배율"
    ],
    answerIndex: 2,
    explanation: "부채비율은 기업의 재무 건전성과 파산 위험도를 측정하는 가장 기초적인 안전성 척도입니다.",
  },
  {
    id: "lv2-028",
    level: 2,
    category: "재무 상태",
    keyword: "유동비율",
    question: "1년 안에 현금화할 수 있는 유동자산을 1년 안에 갚아야 하는 유동부채로 나눈 비율로, 단기 채무 지급 능력을 보는 지표는?",
    options: [
          "부채비율",
          "차입금의존도",
          "매출원가율",
          "유동비율"
    ],
    answerIndex: 3,
    explanation: "유동비율이 200% 이상이면 단기 부채 상환 능력이 매우 우수하다고 판단합니다.",
  },
  {
    id: "lv2-029",
    level: 2,
    category: "재무 건전성",
    keyword: "이자보상배율",
    question: "영업이익을 지급해야 할 금융 이자비용으로 나눈 값으로, 1 미만이면 영업이익으로 이자조차 못 내는 잠재적 한계기업(좀비기업)임을 뜻하는 지표는?",
    options: [
          "이자보상배율",
          "자기자본회전율",
          "PER",
          "배당성향"
    ],
    answerIndex: 0,
    explanation: "이자보상배율이 1 미만인 상태가 수년간 지속되는 기업은 부도 위험이 급격히 높아집니다.",
  },
  {
    id: "lv2-030",
    level: 2,
    category: "펀드 지표",
    keyword: "NAV",
    question: "ETF나 펀드가 보유한 총자산에서 각종 부채와 보수를 뺀 실제 순수한 1주당 순자산가치를 무엇이라 할까요?",
    options: [
          "괴리율",
          "NAV",
          "BPS",
          "iNAV"
    ],
    answerIndex: 1,
    explanation: "NAV(Net Asset Value)는 ETF의 진짜 내재 가치이며, 시장 가격과의 차이를 괴리율이라고 합니다.",
  },
  {
    id: "lv2-031",
    level: 2,
    category: "ETF 지표",
    keyword: "괴리율",
    question: "ETF의 실시간 시장 거래 가격과 실제 본질 가치인 순자산가치(NAV) 사이의 가격 차이 비율은?",
    options: [
          "추적오차율",
          "할인율",
          "괴리율",
          "배당률"
    ],
    answerIndex: 2,
    explanation: "괴리율이 지나치게 플러스(+)로 크면 ETF를 너무 비싸게(고평가) 사고 있다는 뜻이므로 주의해야 합니다.",
  },
  {
    id: "lv2-032",
    level: 2,
    category: "ETF 지표",
    keyword: "추적오차율",
    question: "ETF의 순자산가치(NAV)가 ETF가 쫓아가야 할 원본 기초 지수의 수익률을 얼마나 정확하게 잘 따라붙는지를 나타내는 오차 척도는?",
    options: [
          "변동성",
          "샤프지수",
          "괴리율",
          "추적오차율"
    ],
    answerIndex: 3,
    explanation: "추적오차가 낮을수록 운용사가 벤치마크 지수를 완벽하게 복제하고 있다는 훌륭한 펀드입니다.",
  },
  {
    id: "lv2-033",
    level: 2,
    category: "차트 패턴",
    keyword: "헤드앤숄더",
    question: "가운데 가장 높은 봉우리(머리)와 양쪽에 작은 봉우리(어깨)가 나타난 후 넥라인을 이탈할 때 강력한 하락 반전으로 보는 차트 패턴은?",
    options: [
          "헤드앤숄더",
          "이중바닥",
          "깃발형",
          "삼각수렴"
    ],
    answerIndex: 0,
    explanation: "헤드앤숄더는 상승 추세의 종말과 강력한 중장기 하락 추세 전환을 예고하는 대표적인 고점 패턴입니다.",
  },
  {
    id: "lv2-034",
    level: 2,
    category: "차트 패턴",
    keyword: "역헤드앤숄더",
    question: "바닥권에서 세 개의 골짜기가 형성되고 가운데 골짜기가 가장 깊은 형태로, 넥라인을 돌파할 때 강력한 상승 전환 신호는?",
    options: [
          "하락쐐기형",
          "역헤드앤숄더",
          "쌍봉",
          "헤드앤숄더"
    ],
    answerIndex: 1,
    explanation: "역헤드앤숄더(이중 역어깨형)는 바닥 매집이 끝나고 강력한 우상향 랠리가 시작될 때 자주 출현합니다.",
  },
  {
    id: "lv2-035",
    level: 2,
    category: "실전 은어",
    keyword: "데드캣 바운스",
    question: "\"높은 곳에서 떨어지면 죽은 고양이도 튀어 오른다\"는 월가 격언으로, 대세 하락장에서 일시적으로 나타나는 가짜 반등은?",
    options: [
          "불마켓",
          "골든크로스",
          "데드캣 바운스",
          "산타랠리"
    ],
    answerIndex: 2,
    explanation: "데드캣 바운스는 펀더멘털의 개선 없는 기술적 숏커버성 반등이므로 추격 매수 시 물리기 쉽습니다.",
  },
  {
    id: "lv2-036",
    level: 2,
    category: "수급 주체",
    keyword: "사모펀드",
    question: "소수의 고액 자산가나 기관으로부터 비공개로 자금을 모아, 저평가된 기업을 인수해 구조조정 후 매각하여 고수익을 추구하는 펀드는?",
    options: [
          "공모펀드",
          "인덱스펀드",
          "헤지펀드",
          "사모펀드"
    ],
    answerIndex: 3,
    explanation: "사모펀드(PEF)는 49인 이하의 소수 투자자에게 비공개로 자금을 모집하여 기업 경영권 인수 및 구조조정 등을 통해 수익을 창출합니다.",
  },
  {
    id: "lv2-037",
    level: 2,
    category: "수급 주체",
    keyword: "외국인투자자",
    question: "국내 주식 시장에서 코스피 시가총액의 약 30%를 차지하며, 환율과 글로벌 매크로에 따라 대규모 매매를 단행하는 글로벌 투자 주체는?",
    options: [
          "외국인투자자",
          "국민연금",
          "사모펀드",
          "개인"
    ],
    answerIndex: 0,
    explanation: "외국인투자자의 매수/매도 동향은 한국 증시의 당일 등락 방향을 결정하는 가장 강력한 수급 지표입니다.",
  },
  {
    id: "lv2-038",
    level: 2,
    category: "포트폴리오",
    keyword: "베타",
    question: "시장 전체 지수가 1% 움직일 때 개별 종목이 몇 %나 민감하게 반응하여 출렁이는지를 나타내는 민감도 계수는?",
    options: [
          "세타",
          "베타",
          "감마",
          "알파"
    ],
    answerIndex: 1,
    explanation: "베타가 1보다 크면 시장보다 변동성이 큰 공격적인 주식이고, 1 미만이면 시장보다 방어적인 주식입니다.",
  },
  {
    id: "lv2-039",
    level: 2,
    category: "포트폴리오",
    keyword: "알파",
    question: "시장 평균 수익률(벤치마크)을 초과하여 펀드매니저의 뛰어난 역량이나 종목 선정으로 달성한 순수 초과 수익률은?",
    options: [
          "소르티노",
          "베타",
          "알파",
          "샤프"
    ],
    answerIndex: 2,
    explanation: "알파는 단순 시장 상승에 편승한 수익이 아니라, 시장을 이긴 순수한 초과 실력을 의미합니다.",
  },
  {
    id: "lv2-040",
    level: 2,
    category: "성과 지표",
    keyword: "샤프지수",
    question: "투자자가 감수한 위험(표준편차) 한 단위당 무위험 수익률 대비 얼마나 많은 초과 수익을 얻었는지를 나타내는 위험조정수익률 지표는?",
    options: [
          "베타",
          "변동성",
          "MDD",
          "샤프지수"
    ],
    answerIndex: 3,
    explanation: "샤프지수가 높을수록 적은 변동성(위험)으로 안정적이고 높은 수익을 달성한 우수한 포트폴리오입니다.",
  },
  {
    id: "lv2-041",
    level: 2,
    category: "위험 지표",
    keyword: "MDD",
    question: "특정 투자 기간 동안 포트폴리오의 최고점(전고점) 대비 최저점까지 기록한 최대 하락 비율은?",
    options: [
          "MDD",
          "변동계수",
          "VaR",
          "샤프지수"
    ],
    answerIndex: 0,
    explanation: "MDD(Maximum Drawdown)는 투자자가 겪을 수 있는 최악의 심리적 고통 크기를 측정하는 핵심 지표입니다.",
  },
  {
    id: "lv2-042",
    level: 2,
    category: "배당 정책",
    keyword: "배당귀족주",
    question: "미국 S&P 500 기업 중 무려 25년 이상 연속으로 매년 주당 배당금을 단 한 번도 삭감 없이 증액해 온 기업들을 부르는 명칭은?",
    options: [
          "배당챔피언",
          "배당귀족주",
          "우량주",
          "배당킹"
    ],
    answerIndex: 1,
    explanation: "배당귀족주는 강력한 경제적 해자와 현금흐름으로 25년 이상 배당을 늘려온 검증된 기업군입니다.",
  },
  {
    id: "lv2-043",
    level: 2,
    category: "배당 정책",
    keyword: "배당킹",
    question: "미국 시장에서 무려 50년 이상 연속으로 매년 배당금을 늘려온 코카콜라, 존슨앤존슨 등의 초극상 배당 기업군은?",
    options: [
          "배당스타",
          "배당블루칩",
          "배당킹",
          "배당귀족"
    ],
    answerIndex: 2,
    explanation: "배당킹은 반세기(50년) 동안 수많은 전쟁과 경제위기 속에서도 배당을 지속 증액한 최고 존엄 배당주입니다.",
  },
  {
    id: "lv2-044",
    level: 2,
    category: "계좌 지식",
    keyword: "신용융자",
    question: "투자자가 증권사로부터 보유 주식이나 현금을 담보로 돈을 빌려 주식을 추가로 레버리지 매수하는 서비스는?",
    options: [
          "스탁론",
          "대차거래",
          "예수금",
          "신용융자"
    ],
    answerIndex: 3,
    explanation: "신용융자는 상승 시 수익을 키우지만, 하락 시 담보부족으로 강제 반대매매를 당할 수 있는 고위험 차입금입니다.",
  },
  {
    id: "lv2-045",
    level: 2,
    category: "계좌 지식",
    keyword: "담보유지비율",
    question: "신용거래 시 증권사가 정해둔 최소한의 담보 가치 비율(보통 140%)로, 이 밑으로 떨어지면 담보부족 계좌가 되는 기준은?",
    options: [
          "담보유지비율",
          "부채비율",
          "결제비율",
          "증거금률"
    ],
    answerIndex: 0,
    explanation: "담보유지비율을 지키지 못하고 추가 입금을 하지 않으면 익일 오전 강제 반대매매가 실행됩니다.",
  },
  {
    id: "lv2-046",
    level: 2,
    category: "거래소 제도",
    keyword: "관리종목",
    question: "영업손실 지속, 자본잠식, 감사보고서 의견거절 등으로 상장폐지 기준에 해당할 우려가 있어 거래소가 특별히 지정 관리하는 종목은?",
    options: [
          "투자경고종목",
          "관리종목",
          "환금종목",
          "투자유의종목"
    ],
    answerIndex: 1,
    explanation: "관리종목으로 지정되면 신용거래가 중단되며, 사유가 해소되지 않으면 상장폐지 절차를 밟게 됩니다.",
  },
  {
    id: "lv2-047",
    level: 2,
    category: "거래소 제도",
    keyword: "정리매매",
    question: "상장폐지가 최종 확정된 주식에 대해 주주들에게 마지막으로 현금화할 기회를 주기 위해 7영업일 동안 상하한가 제한 없이 거래를 허용하는 기간은?",
    options: [
          "동시호가",
          "경매매",
          "정리매매",
          "시간외단일가"
    ],
    answerIndex: 2,
    explanation: "정리매매 기간에는 가격 제한폭(±30%)이 없어 주가가 90% 이상 폭락하는 것이 일반적입니다.",
  },
  {
    id: "lv2-048",
    level: 2,
    category: "재무 용어",
    keyword: "자본잠식",
    question: "기업의 누적 적자가 커져서 회사의 원래 순수 밑천인 납입 자본금을 갉아먹기 시작한 위험한 재무 상태는?",
    options: [
          "채무불이행",
          "흑자전환",
          "감자",
          "자본잠식"
    ],
    answerIndex: 3,
    explanation: "완전자본잠식(자본총계가 마이너스) 상태가 지속되면 거래소 상장폐지 요건에 직면합니다.",
  },
  {
    id: "lv2-049",
    level: 2,
    category: "기업 분할",
    keyword: "인적분할",
    question: "기존 회사를 두 개로 쪼갤 때, 기존 주주들이 기존 지분율 그대로 신설 회사의 주식을 나누어 받는 주주 친화적 분할 방식은?",
    options: [
          "인적분할",
          "영업양수도",
          "물적분할",
          "흡수합병"
    ],
    answerIndex: 0,
    explanation: "인적분할은 주주가 신설 법인의 주식을 직접 소유하므로 주주 가치 훼손 논란이 적습니다.",
  },
  {
    id: "lv2-050",
    level: 2,
    category: "기업 분할",
    keyword: "물적분할",
    question: "회사의 유망한 사업부를 떼어내 100% 자회사로 만들고, 이후 자회사를 쪼개기 상장시켜 기존 모회사 주주에게 소외감을 주는 분할 방식은?",
    options: [
          "주식교환",
          "물적분할",
          "자사주매입",
          "인적분할"
    ],
    answerIndex: 1,
    explanation: "물적분할 후 자회사 중복 상장은 모회사 주가의 지주사 디스카운트를 유발하는 대표적인 요인입니다.",
  },
  {
    id: "lv2-051",
    level: 2,
    category: "지수 지식",
    keyword: "러셀 2000",
    question: "미국 상장 기업 중 시가총액 기준 1001위부터 3000위까지의 중소형 유망 기업 2000개로 구성된 대표 중소형주 지수는?",
    options: [
          "다우 30",
          "나스닥 100",
          "러셀 2000",
          "S&P 100"
    ],
    answerIndex: 2,
    explanation: "러셀 2000 지수는 미국 내수 경기와 중소형주의 활력을 측정하는 대표 지수입니다.",
  },
  {
    id: "lv2-052",
    level: 2,
    category: "심리 지표",
    keyword: "공포탐욕지수",
    question: "CNN 비즈니스에서 시장의 7가지 수급/모멘텀 지표를 종합하여 0(극단적 공포)부터 100(극단적 탐욕)으로 나타내는 투자 심리 지수는?",
    options: [
          "풋콜비율",
          "VIX",
          "RSI",
          "공포&탐욕 지수"
    ],
    answerIndex: 3,
    explanation: "공포탐욕지수가 20 이하로 극단적 공포에 도달했을 때가 역사적으로 훌륭한 바닥 매수 기회인 경우가 많았습니다.",
  },
  {
    id: "lv2-053",
    level: 2,
    category: "배당 용어",
    keyword: "배당기준일",
    question: "회사의 주주명부에 등록되어 해당 분기 배당금을 정당하게 수령할 자격이 확정되는 기준 날짜는?",
    options: [
          "배당기준일",
          "배당락일",
          "주총일",
          "배당지급일"
    ],
    answerIndex: 0,
    explanation: "T+2 결제 규칙으로 인해 배당기준일의 2영업일 전까지는 주식을 매수해야 배당을 받을 수 있습니다.",
  },
  {
    id: "lv2-054",
    level: 2,
    category: "배당 용어",
    keyword: "배당지급일",
    question: "배당기준일에 주주로 확정된 투자자의 증권 계좌로 실제 현금 배당금이 입금되는 날은?",
    options: [
          "결산일",
          "배당지급일",
          "배당락일",
          "배당선언일"
    ],
    answerIndex: 1,
    explanation: "배당지급일은 주주총회 승인 후 통상 1개월 이내에 지정되어 통장에 돈이 꽂히는 날입니다.",
  },
  {
    id: "lv2-055",
    level: 2,
    category: "가치 평가",
    keyword: "PEG",
    question: "PER(주가수익비율)을 기업의 연평균 주당순이익 성장률(EPS Growth)로 나눈 값으로, 피터 린치가 성장주 저평가를 찾을 때 쓴 지표는?",
    options: [
          "PSR",
          "ROE",
          "PEG 비율",
          "PBR"
    ],
    answerIndex: 2,
    explanation: "PEG가 1 미만이면 기업의 높은 성장률 대비 PER이 상대적으로 저평가되어 있음을 뜻합니다.",
  },
  {
    id: "lv2-056",
    level: 2,
    category: "매매 형태",
    keyword: "프로그램 매매",
    question: "사전에 입력된 알고리즘과 수학적 조건에 따라 컴퓨터가 수십~수백 개 종목을 한꺼번에 자동으로 일괄 매수/매도 주문하는 기법은?",
    options: [
          "블록딜",
          "수동주문",
          "스캘핑",
          "프로그램 매매"
    ],
    answerIndex: 3,
    explanation: "프로그램 매매는 현물과 선물의 가격 차이를 이용한 차익거래와 대형 펀드의 바스켓 매매로 구성됩니다.",
  },
  {
    id: "lv2-057",
    level: 2,
    category: "보조 지표",
    keyword: "MACD",
    question: "단기 이동평균선과 장기 이동평균선의 수렴과 확산(이격)을 측정하여 추세 전환 시점을 포착하는 대표 모멘텀 지표는?",
    options: [
          "MACD",
          "일목균형표",
          "RSI",
          "볼린저밴드"
    ],
    answerIndex: 0,
    explanation: "MACD 곡선이 시그널 곡선을 상향 돌파할 때를 매수 신호, 하향 돌파할 때를 매도 신호로 해석합니다.",
  },
  {
    id: "lv2-058",
    level: 2,
    category: "보조 지표",
    keyword: "볼린저 밴드",
    question: "이동평균선을 중심으로 주가의 표준편차(±2시그마)를 적용하여 주가의 95%가 움직이는 상·하한 변동 밴드를 그린 지표는?",
    options: [
          "스토캐스틱",
          "볼린저 밴드",
          "엔벨로프",
          "파라볼릭"
    ],
    answerIndex: 1,
    explanation: "존 볼린저가 개발한 밴드로, 밴드 상단 터치 시 과매수, 하단 터치 시 과매도로 해석합니다.",
  },
  {
    id: "lv2-059",
    level: 2,
    category: "거래 형태",
    keyword: "프로그램 매매",
    question: "사전에 설정한 컴퓨터 알고리즘 조건에 따라 대규모 주식 매수·매도 주문을 자동으로 일괄 처리하는 거래 방식은?",
    options: [
          "스캘핑 매매",
          "분할 주문 매매",
          "프로그램 매매",
          "시간외 대량매매"
    ],
    answerIndex: 2,
    explanation: "프로그램 매매는 현물과 선물의 가격 차이를 이용한 차익거래나 대규모 바스켓 주문을 컴퓨터 알고리즘에 의해 일괄 집행하는 방식입니다.",
  },
  {
    id: "lv2-060",
    level: 2,
    category: "기업 행동",
    keyword: "공개매수",
    question: "특정 기업의 경영권을 인수하거나 자진 상장폐지를 하기 위해 장외에서 불특정 다수 주주에게 정해진 기간과 가격에 주식을 사들이는 것은?",
    options: [
          "유상증자",
          "블록딜",
          "주식매수청구권",
          "공개매수"
    ],
    answerIndex: 3,
    explanation: "공개매수는 통상 현재 주가에 상당한 프리미엄(웃돈)을 얹어 매수를 제안하므로 호재로 작용합니다.",
  },
  {
    id: "lv2-061",
    level: 2,
    category: "투자 기법",
    keyword: "배당 재투자",
    question: "지급받은 배당금을 소비하지 않고 곧바로 해당 주식이나 ETF를 추가 매수하여 복리 스노우볼을 극대화하는 전략은?",
    options: [
          "DRIP",
          "배당 소비",
          "손절매",
          "현금화"
    ],
    answerIndex: 0,
    explanation: "배당 재투자는 수십 년 동안 포트폴리오의 총수익률 중 절반 이상을 만들어내는 가장 강력한 복리 엔진입니다.",
  },
  {
    id: "lv2-062",
    level: 2,
    category: "거래소 제도",
    keyword: "VI",
    question: "개별 종목의 주가가 직전 체결가 대비 2~10% 급변할 때 순간적인 주가 왜곡을 막기 위해 2분간 단일가 매매로 전환하는 완충 장치는?",
    options: [
          "거래정지",
          "VI",
          "서킷브레이커",
          "사이드카"
    ],
    answerIndex: 1,
    explanation: "VI(Volatility Interruption)는 순간적인 대량 주문으로 인한 주가 급변을 식혀주는 냉각기입니다.",
  },
  {
    id: "lv2-063",
    level: 2,
    category: "재무 지표",
    keyword: "잉여현금흐름",
    question: "기업이 사업 운영을 통해 벌어들인 영업현금에서 필수 설비투자(CAPEX)를 빼고 순수하게 남은 진짜 자유로운 현금은?",
    options: [
          "매출총이익",
          "당기순이익",
          "FCF",
          "영업이익"
    ],
    answerIndex: 2,
    explanation: "FCF(Free Cash Flow)는 회사가 배당, 자사주 소각, M&A에 자유롭게 쓸 수 있는 가장 순도 높은 현금입니다.",
  },
  {
    id: "lv2-064",
    level: 2,
    category: "시장 용어",
    keyword: "약세장",
    question: "주식 시장의 주요 지수가 최근 전고점 대비 20% 이상 장기간 하락하여 침체에 빠진 시장을 뜻하는 동물 비유는?",
    options: [
          "울프마켓",
          "피그마켓",
          "불마켓",
          "베어마켓"
    ],
    answerIndex: 3,
    explanation: "베어마켓(Bear Market)은 곰이 발톱을 위에서 아래로 내리찍는 모습에서 유래한 약세장 용어입니다.",
  },
  {
    id: "lv2-065",
    level: 2,
    category: "시장 용어",
    keyword: "강세장",
    question: "주식 시장이 지속적으로 상승 랠리를 펼치며 투자 심리가 고조된 시장을 뜻하는 동물 비유는?",
    options: [
          "불마켓",
          "래빗마켓",
          "터틀마켓",
          "베어마켓"
    ],
    answerIndex: 0,
    explanation: "불마켓(Bull Market)은 황소가 뿔을 아래에서 위로 힘차게 치켜올리는 모습에서 유래한 강세장입니다.",
  },
  {
    id: "lv2-066",
    level: 2,
    category: "재무 지표",
    keyword: "EPS (주당순이익)",
    question: "기업이 한 해 동안 벌어들인 당기순이익을 총 발행 주식 수로 나눈 값으로, '주식 1주가 벌어들인 순이익'은?",
    options: [
          "BPS",
          "EPS",
          "DPS",
          "PBR"
    ],
    answerIndex: 1,
    explanation: "EPS(주당순이익)는 기업이 1주당 얼마의 순이익을 창출했는지를 나타내는 핵심 수익성 지표입니다.",
  },
  {
    id: "lv2-067",
    level: 2,
    category: "재무 지표",
    keyword: "BPS (주당순자산)",
    question: "기업의 총 순자산(자본)을 총 발행 주식 수로 나눈 값으로, '회사가 망했을 때 1주당 돌려받을 수 있는 장부상 가치'는?",
    options: [
          "EPS",
          "PER",
          "BPS",
          "EV"
    ],
    answerIndex: 2,
    explanation: "BPS(주당순자산가치)는 기업을 지금 당장 청산한다고 가정할 때 1주당 분배되는 장부상 순자산 가치입니다.",
  },
  {
    id: "lv2-068",
    level: 2,
    category: "재무 지표",
    keyword: "DPS (주당배당금)",
    question: "기업이 주주들에게 주식 1주당 현금으로 지급하기로 결정한 배당금의 절대 금액은?",
    options: [
          "EPS",
          "BPS",
          "ROE",
          "DPS"
    ],
    answerIndex: 3,
    explanation: "DPS(주당배당금)는 주식 1주를 보유했을 때 실제로 통장에 들어오는 세전 배당 금액입니다.",
  },
  {
    id: "lv2-069",
    level: 2,
    category: "배당 제도",
    keyword: "배당락 효과",
    question: "배당받을 권리가 사라지는 배당락일에, 전일 주가에서 주당 배당금 예상액만큼 주가가 인위적으로 낮게 조정되어 시작하는 현상은?",
    options: [
          "배당락 효과",
          "권리락",
          "어닝쇼크",
          "자본감소"
    ],
    answerIndex: 0,
    explanation: "배당락일에는 이미 배당을 받을 주주가 확정되었으므로, 회사의 배당금 유출을 반영하여 주가가 배당금 상당액만큼 하락하여 거래가 시작됩니다.",
  },
  {
    id: "lv2-070",
    level: 2,
    category: "주주 환원",
    keyword: "자사주 매입",
    question: "기업이 시장에서 유통되고 있는 자기 회사의 주식을 회삿돈으로 직접 사들여 유통 주식 수를 줄이고 주가를 부양하는 조치는?",
    options: [
          "유상증자",
          "자사주 매입",
          "감자",
          "출자전환"
    ],
    answerIndex: 1,
    explanation: "자사주 매입은 기업이 주주 가치를 제고하고 주가를 방어하기 위해 시행하는 대표적인 주주 친화 정책입니다.",
  },
  {
    id: "lv2-071",
    level: 2,
    category: "재무 건전성",
    keyword: "유보율",
    question: "기업이 벌어들인 순이익 중 배당 등으로 사외 유출하지 않고 사내에 차곡차곡 쌓아둔 잉여금의 비율로, 회사의 위기 대응 체력과 무상증자 여력을 보여주는 지표는?",
    options: [
          "부채비율",
          "자기자본비율",
          "유보율",
          "당좌비율"
    ],
    answerIndex: 2,
    explanation: "유보율은 납입자본금 대비 사내 잉여금(자본잉여금+이익잉여금)의 비율로, 높을수록 불황을 버티는 완충 능력이 우수합니다.",
  },
  {
    id: "lv2-072",
    level: 2,
    category: "재무 건전성",
    keyword: "당좌비율",
    question: "유동자산 중 쉽게 현금화하기 어려운 [재고자산]을 제외한 순수 당좌자산만으로 단기 빚을 갚을 수 있는 능력을 측정한 가장 엄격한 지표는?",
    options: [
          "유동비율",
          "매출원가율",
          "고정비율",
          "당좌비율"
    ],
    answerIndex: 3,
    explanation: "당좌비율(Quick Ratio)은 재고 처분의 불확실성을 배제하고 당장 보유한 현금과 예금, 매출채권만으로 빚을 갚는 초단기 지급 능력을 나타냅니다.",
  },
  {
    id: "lv2-073",
    level: 2,
    category: "수익성 지표",
    keyword: "영업이익률",
    question: "기업이 물건이나 서비스를 팔아 올린 전체 매출액 중 순수 본업을 통해 남긴 영업이익의 비율은?",
    options: [
          "영업이익률",
          "매출총이익률",
          "당기순이익률",
          "자기자본이익률"
    ],
    answerIndex: 0,
    explanation: "영업이익률은 [영업이익 ÷ 매출액 × 100]으로 계산되며, 기업 본업의 독점력과 마진 경쟁력을 보여줍니다.",
  },
  {
    id: "lv2-074",
    level: 2,
    category: "수익성 지표",
    keyword: "ROA (총자산이익률)",
    question: "자기자본뿐만 아니라 부채(빚)까지 포함한 기업의 모든 자산을 활용해 얼마나 순이익을 냈는지 측정하는 지표는?",
    options: [
          "ROE",
          "ROA",
          "ROI",
          "ROIC"
    ],
    answerIndex: 1,
    explanation: "ROA는 [당기순이익 ÷ 총자산(자본+부채)]으로 계산되어 회사 전체 자산의 운용 효율성을 측정합니다.",
  },
  {
    id: "lv2-075",
    level: 2,
    category: "기업 공시",
    keyword: "잠정 실적 공시",
    question: "정식 회계 감사 보고서가 나오기 전, 투자자들의 빠른 판단을 돕기 위해 매출액과 영업이익 등 핵심 실적 숫자를 미리 공시하는 것은?",
    options: [
          "정기 공시",
          "수시 공시",
          "잠정 실적 공시",
          "지연 공시"
    ],
    answerIndex: 2,
    explanation: "삼성전자나 LG전자 등이 분기 마감 직후 발표하는 잠정 실적은 실적 시즌의 포문을 여는 시장의 핵심 이벤트입니다.",
  },
  {
    id: "lv2-076",
    level: 2,
    category: "손익 분석",
    keyword: "영업외손익",
    question: "제품 생산이나 판매 등 기업 본업 활동이 아닌, 환율 변동으로 인한 환차손익이나 보유 부동산 매각, 이자 수익 등으로 발생한 손익은?",
    options: [
          "매출총이익",
          "영업이익",
          "매출원가",
          "영업외손익"
    ],
    answerIndex: 3,
    explanation: "영업외손익은 일회성 요소가 많으므로 기업의 지속 가능한 본업 경쟁력을 볼 때는 영업이익을 우선적으로 평가해야 합니다.",
  },
  {
    id: "lv2-077",
    level: 2,
    category: "실적 전망",
    keyword: "컨센서스",
    question: "증권사 소속 여러 애널리스트들이 분석하여 제시한 기업의 미래 매출·영업이익·목표주가 등의 시장 평균 전망치는?",
    options: [
          "컨센서스",
          "가이던스",
          "공시",
          "감사보고서"
    ],
    answerIndex: 0,
    explanation: "컨센서스는 시장 전문가들의 평균적인 실적 예측치로, 실적 발표 시 어닝 서프라이즈/쇼크의 기준선이 됩니다.",
  },
  {
    id: "lv2-078",
    level: 2,
    category: "실적 전망",
    keyword: "가이던스",
    question: "기업 경영진이 주주와 시장을 향해 공식적으로 발표하는 향후 분기나 연간 실적 및 사업 계획 전망치는?",
    options: [
          "컨센서스",
          "가이던스",
          "감사의견",
          "사업보고서"
    ],
    answerIndex: 1,
    explanation: "가이던스는 회사 경영진이 직접 제시하는 미래 실적 예상치로, 시장에 강력한 신뢰와 신호를 줍니다.",
  },
  {
    id: "lv2-079",
    level: 2,
    category: "자본 계정",
    keyword: "자본잉여금",
    question: "기업이 신주를 발행할 때 액면가(예: 500원)를 초과하여 주주들이 실제 납입한 발행가(예: 10,000원)와의 차액으로 적립된 잉여 자본은?",
    options: [
          "이익잉여금",
          "자본금",
          "자본잉여금",
          "당기순이익"
    ],
    answerIndex: 2,
    explanation: "자본잉여금(주식발행초과금)은 주주들이 낸 밑천 중 액면가를 넘는 금액으로, 무상증자의 재원 등으로 활용됩니다.",
  },
  {
    id: "lv2-080",
    level: 2,
    category: "기업 이벤트",
    keyword: "무상감자",
    question: "주주들에게 아무런 보상금 지급 없이 기존 주식 수를 강제로 줄여 장부상 결손금을 메우는 주주에게 치명적인 악재는?",
    options: [
          "유상감자",
          "액면분할",
          "무상증자",
          "무상감자"
    ],
    answerIndex: 3,
    explanation: "무상감자는 주주가 보유한 주식 수만 줄어들고 보상을 전혀 받지 못해 주주 가치가 크게 훼손되는 악재입니다.",
  },
  {
    id: "lv2-081",
    level: 2,
    category: "기업 이벤트",
    keyword: "유상감자",
    question: "기업의 자본금을 줄이면서 주주들에게 보유 주식에 대한 대가를 현금으로 지급하여 보상해주는 감자 방식은?",
    options: [
          "유상감자",
          "무상감자",
          "유상증자",
          "출자전환"
    ],
    answerIndex: 0,
    explanation: "유상감자는 회사의 남아도는 자본을 주주에게 환원하면서 주식 수를 줄이는 조치입니다.",
  },
  {
    id: "lv2-082",
    level: 2,
    category: "차트 도구",
    keyword: "매물대 차트",
    question: "각 가격대별로 과거에 얼마나 많은 주식 거래량이 체결되었는지를 가로 막대그래프로 표시하여 강력한 지지와 저항벽을 보여주는 차트는?",
    options: [
          "캔들 차트",
          "매물대 차트",
          "라인 차트",
          "점수 차트"
    ],
    answerIndex: 1,
    explanation: "매물대가 두껍게 쌓여있는 가격대는 수많은 사람들의 본전 심리가 몰려있어 주가가 뚫고 올라가기 힘든 강력한 저항선이 됩니다.",
  },
  {
    id: "lv2-083",
    level: 2,
    category: "차트 도구",
    keyword: "추세선",
    question: "차트에서 주가의 의미 있는 고점과 고점, 또는 저점과 저점을 직선으로 연결하여 주가의 진행 방향을 파악하는 선은?",
    options: [
          "이동평균선",
          "중심선",
          "추세선",
          "볼린저선"
    ],
    answerIndex: 2,
    explanation: "추세선은 주가가 상승 추세(우상향)인지 하락 추세(우하향)인지 한눈에 보여주는 기술적 분석의 가장 기본적 도구입니다.",
  },
  {
    id: "lv2-084",
    level: 2,
    category: "차트 분석",
    keyword: "돌파 매매",
    question: "주가가 오랫동안 뚫지 못하던 강력한 저항선이나 전고점을 대량 거래량을 동반하며 뚫고 올라갈 때 매수하는 기법은?",
    options: [
          "역발상 매매",
          "바닥 매수",
          "물타기",
          "돌파 매매"
    ],
    answerIndex: 3,
    explanation: "돌파 매매는 저항선을 돌파하는 순간 새로운 강력한 상승 추세가 시작된다고 보고 따라붙는 모멘텀 매매 기법입니다.",
  },
  {
    id: "lv2-085",
    level: 2,
    category: "차트 분석",
    keyword: "눌림목",
    question: "상승 추세에 있는 주가가 계속 오르기만 하지 않고 단기 차익 매물로 인해 일시적으로 조정을 받으며 숨고르기하는 구간은?",
    options: [
          "눌림목",
          "데드크로스",
          "상투",
          "투매"
    ],
    answerIndex: 0,
    explanation: "눌림목은 상승 추세 종목을 너무 비싸지 않은 조정 가격에 안전하게 분할 매수할 수 있는 좋은 진입 구간입니다.",
  },
  {
    id: "lv2-086",
    level: 2,
    category: "차트 분석",
    keyword: "갭상승",
    question: "강력한 호재로 인해 당일 장 시작 가격이 전일 고가보다 훨씬 높은 위치에서 시작하여 차트에 빈 공간이 생기는 것은?",
    options: [
          "갭하락",
          "갭상승",
          "도지",
          "밑꼬리"
    ],
    answerIndex: 1,
    explanation: "갭상승은 밤사이 발생한 강력한 호재로 인해 매수세가 폭발하여 장 시작부터 주가가 훌쩍 뛰어 시작하는 현상입니다.",
  },
  {
    id: "lv2-087",
    level: 2,
    category: "차트 분석",
    keyword: "갭하락",
    question: "예상치 못한 악재로 인해 당일 장 시작 가격이 전일 저가보다 훨씬 낮은 위치에서 시작하여 차트에 빈 공간이 생기는 것은?",
    options: [
          "갭상승",
          "장대양봉",
          "갭하락",
          "상한가"
    ],
    answerIndex: 2,
    explanation: "갭하락은 장전 악재로 인해 매도 물량이 쏟아지며 주가가 밑으로 뚝 떨어져 시작하는 현상입니다.",
  },
  {
    id: "lv2-088",
    level: 2,
    category: "캔들 차트",
    keyword: "윗꼬리 (Upper Shadow)",
    question: "캔들 차트에서 장중 한때 주가가 높이 치솟았으나 장 마감 직전 매도 압력에 밀려 내려왔을 때 캔들 위에 생기는 선은?",
    options: [
          "밑꼬리",
          "시가",
          "몸통",
          "윗꼬리"
    ],
    answerIndex: 3,
    explanation: "윗꼬리가 길게 달렸다는 것은 고점에서 매도 물량(차익 실현 및 본전 탈출 매물)이 강하게 출회되었음을 의미합니다.",
  },
  {
    id: "lv2-089",
    level: 2,
    category: "캔들 차트",
    keyword: "밑꼬리 (Lower Shadow)",
    question: "캔들 차트에서 장중 한때 주가가 크게 떨어졌으나 강력한 저가 매수세가 유입되어 가격을 끌어올렸을 때 생기는 선은?",
    options: [
          "밑꼬리",
          "윗꼬리",
          "양봉",
          "음봉"
    ],
    answerIndex: 0,
    explanation: "밑꼬리가 길게 달렸다는 것은 저가에서 강력한 반발 매수세가 들어와 바닥을 지지했다는 긍정적 신호입니다.",
  },
  {
    id: "lv2-090",
    level: 2,
    category: "이동평균선",
    keyword: "정배열",
    question: "차트에서 단기선(5일·20일)이 중기선(60일), 장기선(120일·200일)보다 위에 순서대로 나란히 놓여있는 강력한 상승 추세 상태는?",
    options: [
          "역배열",
          "정배열",
          "수렴",
          "디커플링"
    ],
    answerIndex: 1,
    explanation: "정배열은 주가가 꾸준히 우상향하고 있어 모든 기간의 투자자 평균 매입 단가가 안정적인 상승장 구조입니다.",
  },
  {
    id: "lv2-091",
    level: 2,
    category: "이동평균선",
    keyword: "역배열",
    question: "차트에서 장기선이 가장 위에 있고 그 아래로 중기선, 단기선이 순서대로 놓여있는 장기적인 하락 추세 상태는?",
    options: [
          "정배열",
          "박스권",
          "역배열",
          "골든크로스"
    ],
    answerIndex: 2,
    explanation: "역배열은 위로 갈수록 과거 물린 매물대가 겹겹이 쌓여 있어 반등할 때마다 강한 저항을 받는 약세장 구조입니다.",
  },
  {
    id: "lv2-092",
    level: 2,
    category: "시장 흐름",
    keyword: "박스권 장세",
    question: "주가가 뚜렷한 상승이나 하락 추세 없이 일정한 상한선(고점)과 하한선(저점) 사이에서 갇혀 횡보하는 시장은?",
    options: [
          "대세상승장",
          "버블장",
          "약세장",
          "박스권 장세"
    ],
    answerIndex: 3,
    explanation: "박스권 장세는 뚜렷한 호재나 악재가 없어 주가가 일정 밴드 내에서만 오르내리는 횡보 시장입니다.",
  },
  {
    id: "lv2-093",
    level: 2,
    category: "시장 흐름",
    keyword: "테마주",
    question: "기업의 실제 펀더멘털보다는 대선, 정책, 신기술, 전염병 등 특정 사회적 이슈에 엮여 단기 급등락하는 종목군은?",
    options: [
          "테마주",
          "가치주",
          "우량주",
          "배당주"
    ],
    answerIndex: 0,
    explanation: "테마주는 단기 관심과 수급으로 급등하지만, 재무 실체가 없으면 급락할 위험이 매우 높은 고위험 종목군입니다.",
  },
  {
    id: "lv2-094",
    level: 2,
    category: "가치 평가",
    keyword: "PEG 지수",
    question: "PER(주가수익비율)을 기업의 연평균 주당순이익 성장률(EPS Growth)로 나눈 값으로, 성장성을 반영한 저평가 여부를 측정하는 지표는?",
    options: [
          "PBR",
          "PEG 지수",
          "PSR",
          "EV/EBITDA"
    ],
    answerIndex: 1,
    explanation: "전설적 투자자 피터 린치가 애용한 PEG는 통상 1.0 이하일 때 성장성 대비 주가가 매우 저평가된 매력적인 상태로 봅니다.",
  },
  {
    id: "lv2-095",
    level: 2,
    category: "가치 평가",
    keyword: "PSR 지수",
    question: "기업의 시가총액을 연간 총 매출액으로 나눈 값으로, 아직 당기순이익이 나지 않는 초기 혁신 테크 기업의 가치를 평가할 때 쓰는 지표는?",
    options: [
          "PER",
          "PBR",
          "PSR",
          "ROE"
    ],
    answerIndex: 2,
    explanation: "PSR(Price-to-Sales Ratio)은 순이익 적자 상태인 초기 고성장 기업의 매출 성장 모멘텀을 평가할 때 유용합니다.",
  },
  {
    id: "lv2-096",
    level: 2,
    category: "기업 분석",
    keyword: "경기민감주 (시클리컬)",
    question: "철강, 화학, 조선, 반도체처럼 전 세계 경기 변동 사이클에 따라 실적과 주가가 크게 출렁이는 업종은?",
    options: [
          "경기방어주",
          "우선주",
          "공공재주",
          "경기민감주"
    ],
    answerIndex: 3,
    explanation: "경기민감주는 호황기에 막대한 이익을 내고 불황기에 적자로 돌아서는 주기를 타는 산업군입니다.",
  },
  {
    id: "lv2-097",
    level: 2,
    category: "기업 분석",
    keyword: "경기방어주",
    question: "음식료, 전력·가스, 통신, 제약처럼 불경기에도 사람들이 필수적으로 소비하여 실적이 안정적으로 유지되는 종목은?",
    options: [
          "경기방어주",
          "경기민감주",
          "레버리지주",
          "동전주"
    ],
    answerIndex: 0,
    explanation: "경기방어주는 경제 침체기에도 수요가 줄지 않아 주가 하락 방어력이 뛰어난 안전한 업종입니다.",
  },
  {
    id: "lv2-098",
    level: 2,
    category: "거래 주체",
    keyword: "외국인 순매수",
    question: "국내 증시에서 외국계 펀드나 글로벌 투자 기관이 주식을 판 금액보다 산 금액이 더 많은 상태를 무엇이라 할까요?",
    options: [
          "외국인 순매도",
          "외국인 순매수",
          "개인 순매수",
          "대차잔고"
    ],
    answerIndex: 1,
    explanation: "외국인 순매수는 대규모 자금을 운용하는 글로벌 기관의 매수세로, 통상 대형주 주가 상승의 강력한 원동력이 됩니다.",
  },
  {
    id: "lv2-099",
    level: 2,
    category: "거래 주체",
    keyword: "기관 투자자",
    question: "국민연금, 자산운용사, 보험사, 증권사, 은행 등 대규모 자금을 조직적으로 운용하는 전문 투자 주체는?",
    options: [
          "개미 투자자",
          "외국인 개인",
          "기관 투자자",
          "사채업자"
    ],
    answerIndex: 2,
    explanation: "기관 투자자는 거액의 자금을 전문 펀드매니저들이 운용하며 시장의 수급을 주도하는 핵심 플레이어입니다.",
  },
  {
    id: "lv2-100",
    level: 2,
    category: "거래 주체",
    keyword: "연기금",
    question: "국민연금, 공무원연금, 사학연금처럼 국민의 복지와 노후를 위해 거대한 공적 기금을 장기 운용하는 거손 기관은?",
    options: [
          "투신",
          "사모운용사",
          "사모펀드",
          "연기금"
    ],
    answerIndex: 3,
    explanation: "연기금(Pension Fund)은 국내 증시에서 가장 규모가 큰 장기 투자 기관으로, 시장의 안전판 역할을 수행합니다.\n \n \n \n \n ## 🌳 3단계: 고급 (거시 경제) (100문항)\n\n\n\n\n## 🌳 3단계: 고급 (거시 경제) (100문항)",
  },
  // ==========================================
  // LEVEL 3: 고급 (거시 경제) - 100문항
  // ==========================================
  {
    id: "lv3-001",
    level: 3,
    category: "통화 정책",
    keyword: "기준금리",
    question: "한 나라의 중앙은행(한국은행, 미국 연준)이 정하는 모든 금리의 표준이 되는 최상위 정책 금리는?",
    options: [
          "기준금리",
          "국고채금리",
          "콜금리",
          "CD금리"
    ],
    answerIndex: 0,
    explanation: "기준금리가 인상되면 시중 통화량이 흡수되고 기업의 이자 부담이 커져 주식 시장에 하방 압력이 됩니다.",
  },
  {
    id: "lv3-002",
    level: 3,
    category: "미국 연준",
    keyword: "FOMC",
    question: "미국의 기준금리와 통화 정책 방향을 결정하는 미국 연방준비제도(Fed) 산하의 최고 의결 기구는?",
    options: [
          "SEC",
          "FOMC",
          "IMF",
          "G20"
    ],
    answerIndex: 1,
    explanation: "FOMC는 1년에 8번 정례회의를 열고 미국의 기준금리 인상/동결/인하를 전 세계에 발표합니다.",
  },
  {
    id: "lv3-003",
    level: 3,
    category: "통화 정책",
    keyword: "양적완화",
    question: "기준금리가 0%에 가까워 더 이상 금리를 내릴 수 없을 때, 중앙은행이 국채 등을 직접 사들여 시장에 돈을 무제한 공급하는 비전통적 통화정책은?",
    options: [
          "오퍼레이션 트위스트",
          "지준율인상",
          "양적완화",
          "양적긴축"
    ],
    answerIndex: 2,
    explanation: "양적완화(Quantitative Easing)는 막대한 유동성을 시장에 공급하여 자산 시장의 대세 상승을 촉발합니다.",
  },
  {
    id: "lv3-004",
    level: 3,
    category: "통화 정책",
    keyword: "양적긴축",
    question: "중앙은행이 보유한 만기 도래 국채를 재투자하지 않고 회수하여 시중에 풀린 유동성 돈줄을 직접 흡수하고 줄이는 정책은?",
    options: [
          "양적완화",
          "금리인하",
          "테이퍼링",
          "양적긴축"
    ],
    answerIndex: 3,
    explanation: "양적긴축(Quantitative Tightening)은 중앙은행 대차대조표를 축소하여 시장의 유동성을 강하게 말립니다.",
  },
  {
    id: "lv3-005",
    level: 3,
    category: "통화 정책",
    keyword: "테이퍼링",
    question: "중앙은행이 양적완화(자산 매입) 정책의 규모를 점진적으로 줄여나가며 긴축으로 전환하는 과도기적 출구전략은?",
    options: [
          "테이퍼링",
          "자이언트스텝",
          "빅스텝",
          "피벗"
    ],
    answerIndex: 0,
    explanation: "테이퍼링은 수도꼭지를 서서히 잠그듯 자산 매입 속도를 완만히 늦추는 완충 긴축 단계입니다.",
  },
  {
    id: "lv3-006",
    level: 3,
    category: "정책 전환",
    keyword: "피벗",
    question: "중앙은행이 기존의 가파른 금리 인상(긴축) 기조를 멈추고 금리 인하(완화)로 정책 방향을 180도 선회하는 것을 뜻하는 용어는?",
    options: [
          "베이비스텝",
          "피벗",
          "스탠스유지",
          "테이퍼링"
    ],
    answerIndex: 1,
    explanation: "연준의 피벗(Policy Pivot)은 유동성 공급의 신호탄으로 주식 시장이 가장 열광하는 모멘텀입니다.",
  },
  {
    id: "lv3-007",
    level: 3,
    category: "금리 단위",
    keyword: "bp",
    question: "금융 시장에서 금리나 수익률의 미세한 변동을 나타내는 단위로, 0.01%p를 의미하는 용어는?",
    options: [
          "포인트",
          "틱",
          "베이시스 포인트",
          "퍼센트"
    ],
    answerIndex: 2,
    explanation: "1bp(Basis Point)는 0.01%p이며, 25bp 인상은 0.25%p 금리 인상을 뜻합니다.",
  },
  {
    id: "lv3-008",
    level: 3,
    category: "금리 스텝",
    keyword: "빅스텝",
    question: "중앙은행이 한 번의 통화정책 회의에서 기준금리를 통상적인 0.25%p(25bp)의 2배인 0.50%p(50bp) 전격 인상하는 것은?",
    options: [
          "울트라스텝",
          "자이언트스텝",
          "베이비스텝",
          "빅스텝"
    ],
    answerIndex: 3,
    explanation: "빅스텝은 급격한 인플레이션을 빠르게 진압하기 위해 기준금리를 단숨에 50bp 올리는 조치입니다.",
  },
  {
    id: "lv3-009",
    level: 3,
    category: "금리 스텝",
    keyword: "자이언트스텝",
    question: "기준금리를 한 번에 무려 0.75%p(75bp)나 파격적으로 인상하는 초강도 긴축 조치를 일컫는 말은?",
    options: [
          "자이언트스텝",
          "빅스텝",
          "패스트스텝",
          "마이크로스텝"
    ],
    answerIndex: 0,
    explanation: "자이언트스텝은 물가 폭등 비상사태에서 시장의 기대를 꺾기 위해 단행하는 초강력 충격요법입니다.",
  },
  {
    id: "lv3-010",
    level: 3,
    category: "시장 지표",
    keyword: "VIX 지수",
    question: "S&P 500 옵션 가격을 기반으로 향후 30일간의 시장 변동성 기대를 측정하여 \"월가의 공포지수\"라 불리는 지표는?",
    options: [
          "TED스프레드",
          "VIX 지수",
          "달러인덱스",
          "하이일드스프레드"
    ],
    answerIndex: 1,
    explanation: "VIX(Volatility Index)는 시장 급락 시 폭등하며, 30~40 이상으로 치솟으면 극단적 패닉 상태를 의미합니다.",
  },
  {
    id: "lv3-011",
    level: 3,
    category: "통화 지표",
    keyword: "달러 인덱스",
    question: "유로, 엔, 파운드 등 세계 주요 6개국 통화 대비 미국 달러화의 평균적인 종합 가치를 지수화한 것은?",
    options: [
          "빅맥지수",
          "원달러환율",
          "DXY",
          "환율"
    ],
    answerIndex: 2,
    explanation: "달러 인덱스(DXY)가 강세를 보이면 미국 외 신흥국 주식 시장에서 외국인 자금이 이탈하는 경향이 있습니다.",
  },
  {
    id: "lv3-012",
    level: 3,
    category: "채권 메커니즘",
    keyword: "장단기 금리 역전",
    question: "미래 경기 침체의 가장 확실한 전조 현상으로, 만기가 긴 10년물 국채 금리가 만기가 짧은 2년물 국채 금리보다 낮아지는 현상은?",
    options: [
          "쿠폰금리 상승",
          "금리스프레드 확대",
          "만기상환",
          "장단기 금리 역전"
    ],
    answerIndex: 3,
    explanation: "정상적인 시장에서는 장기금리가 높아야 하나, 경기 침체 공포로 장기국채에 자금이 쏠리면 역전이 발생합니다.",
  },
  {
    id: "lv3-013",
    level: 3,
    category: "물가 지표",
    keyword: "CPI",
    question: "일반 소비자가 일상생활에서 구입하는 상품과 서비스의 가격 변동을 종합 측정한 대표 소비자물가지수는?",
    options: [
          "CPI",
          "GDP",
          "PPI",
          "PCE"
    ],
    answerIndex: 0,
    explanation: "CPI(Consumer Price Index)는 연준의 금리 결정에 직접적인 영향을 미치는 핵심 인플레이션 지표입니다.",
  },
  {
    id: "lv3-014",
    level: 3,
    category: "물가 지표",
    keyword: "PCE",
    question: "미국 연준(Fed)이 인플레이션 목표(2%)를 관리할 때 CPI보다 더 신뢰하고 공식적으로 가장 중요하게 주시하는 물가 지표는?",
    options: [
          "PPI",
          "근원 PCE",
          "BDI",
          "수입물가지수"
    ],
    answerIndex: 1,
    explanation: "PCE(Personal Consumption Expenditures)는 소비 품목 대체 효과를 반영하여 연준이 공식 선호합니다.",
  },
  {
    id: "lv3-015",
    level: 3,
    category: "물가 지표",
    keyword: "PPI",
    question: "공장 문을 나서는 생산자(기업) 단계에서의 상품 및 서비스 가격 변동을 측정한 생산자물가지수는?",
    options: [
          "CPI",
          "ISM",
          "PPI",
          "PMI"
    ],
    answerIndex: 2,
    explanation: "PPI(Producer Price Index)는 기업의 원가 부담을 나타내어 향후 소비자물가(CPI)의 선행지표 역할을 합니다.",
  },
  {
    id: "lv3-016",
    level: 3,
    category: "경기 지표",
    keyword: "PMI",
    question: "기업의 구매 담당자들을 설문하여 신규 주문, 생산, 고용 등을 종합 측정한 지표로 50 이상이면 경기 확장을 뜻하는 지표는?",
    options: [
          "BDI",
          "장단의존도",
          "선행지수순환변동치",
          "PMI"
    ],
    answerIndex: 3,
    explanation: "PMI(Purchasing Managers' Index)는 실물 경제의 경기 활력을 가장 신속하게 보여주는 선행지표입니다.",
  },
  {
    id: "lv3-017",
    level: 3,
    category: "파생상품",
    keyword: "선물",
    question: "미래의 특정 시점에 정해진 가격으로 기초자산을 사거나 팔기로 현재 시점에 미리 약정하는 표준화된 파생 거래는?",
    options: [
          "선물",
          "현물",
          "옵션",
          "스왑"
    ],
    answerIndex: 0,
    explanation: "선물(Futures)은 가격 변동 위험을 헷지하거나 레버리지 투기를 위해 거래소에서 표준화되어 거래됩니다.",
  },
  {
    id: "lv3-018",
    level: 3,
    category: "파생상품",
    keyword: "콜옵션",
    question: "미래의 특정 만기일에 정해진 행사가격으로 특정 기초자산을 \"살 수 있는 권리\"를 매매하는 파생 계약은?",
    options: [
          "풋옵션",
          "콜옵션",
          "선도거래",
          "스왑"
    ],
    answerIndex: 1,
    explanation: "콜옵션 매수자는 기초자산 가격이 행사가격 이상으로 폭등할수록 무제한의 수익을 얻습니다.",
  },
  {
    id: "lv3-019",
    level: 3,
    category: "파생상품",
    keyword: "풋옵션",
    question: "미래의 특정 시점에 정해진 행사가격으로 특정 기초자산을 \"팔 수 있는 권리\"를 매매하는 파생 계약은?",
    options: [
          "선물매수",
          "콜옵션",
          "풋옵션",
          "워런트"
    ],
    answerIndex: 2,
    explanation: "풋옵션 매수는 주가 폭락에 대한 강력한 보험(하방 헤지) 수단으로 활용됩니다.",
  },
  {
    id: "lv3-020",
    level: 3,
    category: "파생 만기일",
    keyword: "쿼드러플 위칭데이",
    question: "주가지수 선물/옵션, 개별주식 선물/옵션 등 4가지 파생상품의 만기일이 동시에 겹쳐 시장 변동성이 극에 달하는 \"네 마녀의 날\"은?",
    options: [
          "블랙먼데이",
          "옵션만기일",
          "트리플위칭데이",
          "쿼드러플 위칭데이"
    ],
    answerIndex: 3,
    explanation: "3, 6, 9, 12월 둘째 주 목요일(미국은 셋째 주 금요일)에 발생하며 대규모 포지션 청산으로 주가가 요동칩니다.",
  },
  {
    id: "lv3-021",
    level: 3,
    category: "채권 원리",
    keyword: "채권 가격과 금리의 관계",
    question: "시장 금리가 상승할 때, 기존에 발행되어 있던 고정 이자 지급 채권의 시장 가격은 어떻게 변할까요?",
    options: [
          "하락한다",
          "원금이 2배가 된다",
          "상승한다",
          "전혀 변하지 않는다"
    ],
    answerIndex: 0,
    explanation: "시중 금리가 오르면 상대적으로 낮은 이자를 주는 기존 채권의 매력이 떨어져 채권 가격은 무조건 하락합니다.",
  },
  {
    id: "lv3-022",
    level: 3,
    category: "채권 지표",
    keyword: "하이일드 스프레드",
    question: "신용등급이 낮은 고위험 정크본드(하이일드 채권)의 금리와 안전한 국채 금리 간의 격차로, 금융위기 위험을 감지하는 지표는?",
    options: [
          "장단기스프레드",
          "하이일드 스프레드",
          "스왑스프레드",
          "TED스프레드"
    ],
    answerIndex: 1,
    explanation: "하이일드 스프레드가 급등한다는 것은 부실기업들의 부도 위험과 시장의 신용 경색이 심각해졌음을 뜻합니다.",
  },
  {
    id: "lv3-023",
    level: 3,
    category: "선물 시장",
    keyword: "콘탱고",
    question: "선물 시장에서 만기가 먼 원월물 가격이 만기가 가까운 근월물이나 현물 가격보다 더 비싼 정상적인 시장 상태는?",
    options: [
          "롤오버",
          "베이시스역전",
          "콘탱고",
          "백워데이션"
    ],
    answerIndex: 2,
    explanation: "보관비용, 이자비용 등으로 인해 선물 가격이 현물보다 비싼 상태를 콘탱고라고 합니다.",
  },
  {
    id: "lv3-024",
    level: 3,
    category: "선물 시장",
    keyword: "백워데이션",
    question: "원자재 공급 부족이나 시장 패닉으로 인해 현물 또는 근월물 가격이 만기가 먼 원월물 선물 가격보다 비정상적으로 비싸진 역전 상태는?",
    options: [
          "숏스퀴즈",
          "디스카운트",
          "콘탱고",
          "백워데이션"
    ],
    answerIndex: 3,
    explanation: "백워데이션은 당장 현물을 확보하려는 수요가 폭발했을 때 발생하는 비정상적 시장 상태입니다.",
  },
  {
    id: "lv3-025",
    level: 3,
    category: "선물 운용",
    keyword: "롤오버",
    question: "원유나 선물 ETF를 운용할 때, 만기가 다가온 선물을 팔고 다음 만기 선물로 교체하여 포지션을 유지하는 것은?",
    options: [
          "롤오버",
          "인수도",
          "스왑",
          "청산"
    ],
    answerIndex: 0,
    explanation: "콘탱고 시장에서 롤오버를 계속하면 싼 선물을 팔고 비싼 선물을 사야 하므로 계좌가 녹는 롤오버 비용이 발생합니다.",
  },
  {
    id: "lv3-026",
    level: 3,
    category: "경제 현상",
    keyword: "스태그플레이션",
    question: "경제 성장이 멈추고 실업률이 치솟는 불황(Stagnation) 속에서 물가마저 폭등(Inflation)하는 최악의 경제 악몽은?",
    options: [
          "디플레이션",
          "스태그플레이션",
          "골디락스",
          "하이퍼인플레이션"
    ],
    answerIndex: 1,
    explanation: "스태그플레이션은 금리를 올리면 불황이 심해지고 금리를 내리면 물가가 폭등해 중앙은행이 손을 쓰기 힘듭니다.",
  },
  {
    id: "lv3-027",
    level: 3,
    category: "경제 현상",
    keyword: "골디락스",
    question: "물가가 크게 오르지 않으면서도 경제가 적절하게 성장하여, 뜨겁지도 차갑지도 않은 가장 이상적인 경제 상태는?",
    options: [
          "블랙스완",
          "그레이스완",
          "골디락스",
          "스태그플레이션"
    ],
    answerIndex: 2,
    explanation: "골디락스 경제에서는 기업 실적이 좋아지고 금리 부담이 적어 주식 시장이 최적의 대세 상승장을 맞이합니다.",
  },
  {
    id: "lv3-028",
    level: 3,
    category: "위험 사건",
    keyword: "블랙스완",
    question: "도저히 일어날 것 같지 않지만 일단 발생하면 금융 시장 전체를 파멸로 몰고 갈 만큼 엄청난 충격을 주는 예기치 못한 파국 사건은?",
    options: [
          "데드캣",
          "그레이스완",
          "화이트스완",
          "블랙스완"
    ],
    answerIndex: 3,
    explanation: "나심 탈레브가 정립한 개념으로 2008년 리먼 사태, 2020년 코로나 팬데믹 폭락 등이 대표적인 블랙스완입니다.",
  },
  {
    id: "lv3-029",
    level: 3,
    category: "위험 사건",
    keyword: "회색 코뿔소",
    question: "충분히 예상할 수 있고 경고 신호가 계속 울리는데도 불구하고, 사람들이 안이하게 대처하다가 마주치는 거대한 위험은?",
    options: [
          "회색 코뿔소",
          "블랙스완",
          "화이트엘리펀트",
          "유니콘"
    ],
    answerIndex: 0,
    explanation: "회색 코뿔소는 눈앞에 다가오는 것을 알면서도 위험을 무시하다가 들이받히는 위기를 의미합니다.",
  },
  {
    id: "lv3-030",
    level: 3,
    category: "해외 투자",
    keyword: "ADR",
    question: "미국에 본사가 없는 외국 기업(예: TSMC, 쿠팡, 알리바바)이 미국 뉴욕 증시에서 주식처럼 거래될 수 있도록 발행한 미국주식예탁증서는?",
    options: [
          "GDR",
          "ADR",
          "CB",
          "ETF"
    ],
    answerIndex: 1,
    explanation: "ADR을 통해 미국 투자자들은 복잡한 해외 계좌 개설 없이 미국 거래소에서 편리하게 해외 우량주를 매매합니다.",
  },
  {
    id: "lv3-031",
    level: 3,
    category: "파생 지표",
    keyword: "풋콜 비율",
    question: "시장 전체에서 거래되는 풋옵션 거래량을 콜옵션 거래량으로 나눈 비율로, 시장의 과열과 공포를 측정하는 역발상 지표는?",
    options: [
          "괴리율",
          "샤프지수",
          "풋콜 비율",
          "베타"
    ],
    answerIndex: 2,
    explanation: "풋콜비율이 1.2 이상으로 극단적으로 치솟으면 시장 참여자들의 공포가 극에 달해 바닥 반등 신호로 해석됩니다.",
  },
  {
    id: "lv3-032",
    level: 3,
    category: "환율 메커니즘",
    keyword: "환율과 수출 기업",
    question: "원/달러 환율이 상승(원화 약세)하면, 삼성전자나 현대차 같은 국내 대형 수출 기업들의 단기 원화 환산 실적은 통상 어떻게 될까요?",
    options: [
          "전혀 영향 없다",
          "악화된다",
          "원자재 수입비만 줄어든다",
          "개선된다"
    ],
    answerIndex: 3,
    explanation: "원화 약세 시 해외에서 달러로 벌어들인 매출의 원화 환산액이 늘어나 수출 기업의 채산성이 단기 개선됩니다.",
  },
  {
    id: "lv3-033",
    level: 3,
    category: "통화 유동성",
    keyword: "M2 통화량",
    question: "현금과 당좌예금뿐만 아니라 2년 미만의 정기예적금, MMF, 수익증권 등 언제든 현금화 가능한 광의의 시중 통화량을 뜻하는 지표는?",
    options: [
          "M2",
          "Lf",
          "L",
          "M1"
    ],
    answerIndex: 0,
    explanation: "M2 통화량 증가율이 가파르면 자산 시장으로 유동성이 유입되어 주가와 부동산 가격 상승의 땔감이 됩니다.",
  },
  {
    id: "lv3-034",
    level: 3,
    category: "중앙은행 도구",
    keyword: "역RP",
    question: "미국 연준이 시중 금융기관들로부터 남는 유동성 자금을 빨아들여 연준 금고에 묶어두고 이자를 지급하는 단기 흡수 창구는?",
    options: [
          "할인창구대출",
          "역RP",
          "스왑라인",
          "RP 매수"
    ],
    answerIndex: 1,
    explanation: "역RP 잔고가 줄어든다는 것은 시중에 단기 유동성이 풀려 주식 등 자산 시장으로 흘러 들어감을 의미합니다.",
  },
  {
    id: "lv3-035",
    level: 3,
    category: "경기 지표",
    keyword: "장단기 스프레드",
    question: "미국 국채 10년물 금리와 2년물(또는 3개월물) 금리의 차이를 무엇이라 부르며, 이것이 0 밑으로 떨어지면 경기침체 경보일까요?",
    options: [
          "신용스프레드",
          "베이시스",
          "장단기 금리차",
          "쿠폰스프레드"
    ],
    answerIndex: 2,
    explanation: "장단기 금리차의 축소 및 역전은 역사상 모든 미국 경기 침체를 6~18개월 앞서 정확하게 예측했습니다.",
  },
  {
    id: "lv3-036",
    level: 3,
    category: "파생 거래",
    keyword: "차익거래",
    question: "동일한 기초자산의 선물 가격과 현물 가격 간의 일시적인 괴리를 포착하여, 비싼 것을 팔고 싼 것을 동시에 사서 무위험 차익을 얻는 기법은?",
    options: [
          "헤지거래",
          "스캘핑",
          "투기거래",
          "차익거래"
    ],
    answerIndex: 3,
    explanation: "차익거래는 시장의 비효율성을 이용해 무위험 수익을 얻으며, 시장 가격을 균형 상태로 되돌리는 역할을 합니다.",
  },
  {
    id: "lv3-037",
    level: 3,
    category: "파생 거래",
    keyword: "베이시스",
    question: "선물 가격에서 현물 가격을 뺀 가격 차이로, 프로그램 차익거래 발동의 기준이 되는 지표는?",
    options: [
          "베이시스",
          "스프레드",
          "틱",
          "괴리율"
    ],
    answerIndex: 0,
    explanation: "베이시스 = 선물가격 - 현물가격이며, 시장 상황에 따라 콘탱고나 백워데이션 상태를 측정합니다.",
  },
  {
    id: "lv3-038",
    level: 3,
    category: "신용 지표",
    keyword: "CDS 프리미엄",
    question: "채권을 발행한 국가나 기업이 부도가 났을 때 손실을 보상해 주는 일종의 신용부도보험 수수료로 부도 위험도를 보여주는 것은?",
    options: [
          "신용스프레드",
          "CDS 프리미엄",
          "샤프지수",
          "듀레이션"
    ],
    answerIndex: 1,
    explanation: "한국의 국가 CDS 프리미엄이 상승하면 국가 신용 부도 위험이 커져 외국인 자본 유출 위험이 증가합니다.",
  },
  {
    id: "lv3-039",
    level: 3,
    category: "원자재 지표",
    keyword: "WTI",
    question: "미국 텍사스산 중질유로, 영국 브렌트유, 두바이유와 함께 세계 3대 유가이자 글로벌 원유 선물의 표준 가격표는?",
    options: [
          "브렌트유",
          "두바이유",
          "WTI",
          "OPEC바스켓"
    ],
    answerIndex: 2,
    explanation: "WTI 유가의 급등은 전 세계 물가를 자극하여 인플레이션 및 금리 인상 우려를 촉발합니다.",
  },
  {
    id: "lv3-040",
    level: 3,
    category: "해운 지표",
    keyword: "BDI",
    question: "철광석, 석탄, 곡물 등 원자재를 싣고 나르는 건화물선(벌크선)의 운임 지수로, 세계 실물 경기와 무역량의 선행지표는?",
    options: [
          "WTI",
          "CCFI",
          "SCFI",
          "BDI"
    ],
    answerIndex: 3,
    explanation: "BDI(Baltic Dry Index)는 원자재 물동량의 실시간 수요를 반영하여 제조업 경기 회복을 선행 진단합니다.",
  },
  {
    id: "lv3-041",
    level: 3,
    category: "물가 지표",
    keyword: "기저효과",
    question: "전년도 동기의 수치가 너무 낮거나 높아서, 올해의 수치가 실제보다 훨씬 더 크게 성장하거나 악화되어 보이는 착시 현상은?",
    options: [
          "기저효과",
          "스필오버효과",
          "낙수효과",
          "나비효과"
    ],
    answerIndex: 0,
    explanation: "작년에 유가가 급락했었다면 올해 유가가 조금만 올라도 물가상승률(CPI) 수치가 폭등해 보이는 것이 기저효과입니다.",
  },
  {
    id: "lv3-042",
    level: 3,
    category: "연준 인사",
    keyword: "비둘기파",
    question: "중앙은행에서 물가 안정보다는 경기 부양과 고용 확대를 중시하여 저금리와 유동성 완화 정책을 선호하는 성향의 인사를 무엇이라 부를까요?",
    options: [
          "중립파",
          "비둘기파",
          "매파",
          "올빼미파"
    ],
    answerIndex: 1,
    explanation: "비둘기파적 발언(금리 인하 시사 등)은 주식 시장에 큰 호재로 작용합니다.",
  },
  {
    id: "lv3-043",
    level: 3,
    category: "연준 인사",
    keyword: "매파",
    question: "경기 침체 위험을 감수하더라도 인플레이션을 때려잡기 위해 가파른 금리 인상과 강력한 통화 긴축을 강력히 주장하는 인사는?",
    options: [
          "중도파",
          "비둘기파",
          "매파",
          "백로파"
    ],
    answerIndex: 2,
    explanation: "매파적 발언(금리 추가 인상, 긴축 지속 등)은 주식 시장의 차익 실현과 하락을 유발합니다.",
  },
  {
    id: "lv3-044",
    level: 3,
    category: "중앙은행 도구",
    keyword: "점도표",
    question: "FOMC 회의에 참석한 연준 위원 19명이 향후 몇 년간 기준금리가 몇 %가 될지 각자의 전망치를 익명으로 점 찍어 나타낸 표는?",
    options: [
          "그린북",
          "FOMC의사록",
          "베이지북",
          "점도표"
    ],
    answerIndex: 3,
    explanation: "점도표는 시장 참가자들이 연준의 향후 금리 인하 횟수와 최종 금리 수준을 가늠하는 가장 중요한 나침반입니다.",
  },
  {
    id: "lv3-045",
    level: 3,
    category: "경제 보고서",
    keyword: "베이지북",
    question: "미국 12개 연방준비은행이 각 지역의 최근 경제 동향을 취합하여 FOMC 회의 2주 전에 발표하는 미국 경제 동향 보고서는?",
    options: [
          "베이지북",
          "그린북",
          "화이트페이퍼",
          "블루북"
    ],
    answerIndex: 0,
    explanation: "베이지북은 표지 색깔에서 유래했으며, 미국 실물 현장의 체감 경기와 고용 실태를 생생하게 전달합니다.",
  },
  {
    id: "lv3-046",
    level: 3,
    category: "통화 현상",
    keyword: "달러 스마일",
    question: "미국 경제가 나홀로 압도적 호황일 때도 달러가 오르고, 글로벌 경제 위기가 터져 안전자산 선호가 쏠릴 때도 달러가 오르는 현상은?",
    options: [
          "달러 트랩",
          "달러 스마일",
          "트리핀 딜레마",
          "플라자합의"
    ],
    answerIndex: 1,
    explanation: "극단적 위기(공포)와 극단적 호황 양쪽 끝에서 달러가 모두 초강세를 보이는 U자형 스마일 곡선 이론입니다.",
  },
  {
    id: "lv3-047",
    level: 3,
    category: "환율 조작",
    keyword: "플라자 합의",
    question: "1985년 미국, 일본, 독일 등 G5 재무장관들이 모여 미국의 무역적자 해소를 위해 일본 엔화와 독일 마르크화 가치를 강제로 대폭 절상시킨 역사적 사건은?",
    options: [
          "스미소니언협정",
          "루브르합의",
          "플라자 합의",
          "브레튼우즈체제"
    ],
    answerIndex: 2,
    explanation: "플라자 합의로 엔화 가치가 2배 폭등하며 일본은 극심한 엔고 불황과 잃어버린 30년의 부동산/주식 버블 붕괴를 맞이했습니다.",
  },
  {
    id: "lv3-048",
    level: 3,
    category: "국부 펀드",
    keyword: "국민연금",
    question: "1,000조 원이 넘는 자산을 운용하며 국내외 주식 및 대체투자에 막대한 영향력을 행사하는 대한민국 최대 기관투자자는?",
    options: [
          "한국투자공사",
          "사학연금",
          "공무원연금",
          "국민연금"
    ],
    answerIndex: 3,
    explanation: "국민연금기금은 세계 3대 연기금 중 하나로, 한국 자본시장의 가장 큰 안전판이자 큰손입니다.",
  },
  {
    id: "lv3-049",
    level: 3,
    category: "파생 거래",
    keyword: "레버리지 ETF의 음의 복리",
    question: "2배나 3배를 추종하는 레버리지 ETF를 횡보장에서 장기 보유할 때, 변동성으로 인해 기초지수는 제자리인데 계좌 원금이 녹아내리는 현상은?",
    options: [
          "변동성 잠식",
          "추적오차 제로",
          "양의 복리",
          "롤오버 이익"
    ],
    answerIndex: 0,
    explanation: "레버리지 상품은 일간 수익률의 N배를 추종하므로, 주가가 오르내림을 반복하면 수학적으로 평단가가 갉아먹힙니다.",
  },
  {
    id: "lv3-050",
    level: 3,
    category: "파생 상품",
    keyword: "인버스 ETF",
    question: "기초 지수가 하락할 때 반대로 수익이 나도록 설계된 -1배 역방향 추종 상품은?",
    options: [
          "레버리지 ETF",
          "인버스 ETF",
          "커버드콜 ETF",
          "채권형 ETF"
    ],
    answerIndex: 1,
    explanation: "인버스 ETF는 하락장에서 수익을 내거나 보유 주식의 하방 리스크를 단기 헷지할 때 활용됩니다.",
  },
  {
    id: "lv3-051",
    level: 3,
    category: "통화 이론",
    keyword: "트리핀 딜레마",
    question: "미국 달러가 기축통화 지위를 유지하려면 전 세계에 달러를 공급하기 위해 무역적자를 지속해야 하지만, 적자가 누적되면 달러 신뢰도가 무너지는 역설은?",
    options: [
          "달러 갭",
          "그레셤의 법칙",
          "트리핀 딜레마",
          "피구 효과"
    ],
    answerIndex: 2,
    explanation: "로버트 트리핀 교수가 주장한 기축통화국 미국의 숙명적 통화 공급 딜레마입니다.",
  },
  {
    id: "lv3-052",
    level: 3,
    category: "경제 용어",
    keyword: "리세션",
    question: "실질 GDP 경제성장률이 2분기 연속 마이너스를 기록하여 공식적인 경기 후퇴에 진입한 상태를 무엇이라 할까요?",
    options: [
          "호황",
          "공황",
          "소프트랜딩",
          "리세션"
    ],
    answerIndex: 3,
    explanation: "리세션은 전미경제연구소(NBER)가 공식 판정하는 광범위한 경제 활동의 둔화 국면입니다.",
  },
  {
    id: "lv3-053",
    level: 3,
    category: "경기 연착륙",
    keyword: "소프트 랜딩",
    question: "중앙은행이 가파른 금리 인상으로 물가를 잡으면서도, 극심한 경기 침체(경착륙) 없이 완만하게 경기를 안정시키는 이상적인 상태는?",
    options: [
          "소프트 랜딩",
          "하드 랜딩",
          "스태그플레이션",
          "노 랜딩"
    ],
    answerIndex: 0,
    explanation: "연착륙(Soft Landing)은 실업률 급등 없이 인플레이션 목표치를 달성하는 중앙은행의 최고 성공 시나리오입니다.",
  },
  {
    id: "lv3-054",
    level: 3,
    category: "경기 무착륙",
    keyword: "노 랜딩",
    question: "금리를 아무리 올려도 고용과 소비가 꺾이지 않고 경제가 계속해서 뜨겁게 성장하여 침체 자체가 오지 않는 상태는?",
    options: [
          "하드 랜딩",
          "노 랜딩",
          "소프트 랜딩",
          "더블딥"
    ],
    answerIndex: 1,
    explanation: "노 랜딩은 당장 경기는 좋으나 인플레이션이 쉽게 잡히지 않아 고금리가 장기화(Higher for Longer)될 위험을 내포합니다.",
  },
  {
    id: "lv3-055",
    level: 3,
    category: "채권 지표",
    keyword: "듀레이션",
    question: "채권 투자에서 원금과 이자를 회수하는 데 걸리는 가중평균 회수 기간이자, 금리 변동에 따른 채권 가격 민감도를 나타내는 척도는?",
    options: [
          "컨벡시티",
          "만기",
          "듀레이션",
          "쿠폰율"
    ],
    answerIndex: 2,
    explanation: "듀레이션이 10년인 채권은 시중 금리가 1%p 하락할 때 채권 가격이 약 10% 상승합니다.",
  },
  {
    id: "lv3-056",
    level: 3,
    category: "채권 지표",
    keyword: "볼록성",
    question: "금리 변동 폭이 클 때 듀레이션만으로 설명되지 않는 채권 가격 곡선의 휘어짐과 비선형성을 보정해 주는 지표는?",
    options: [
          "베타",
          "감마",
          "듀레이션",
          "볼록성"
    ],
    answerIndex: 3,
    explanation: "볼록성이 높은 채권은 금리 상승 시 가격 하락폭은 적고, 금리 하락 시 가격 상승폭은 더 커지는 우수한 특성을 가집니다.",
  },
  {
    id: "lv3-057",
    level: 3,
    category: "자산 배분",
    keyword: "올웨더 포트폴리오",
    question: "레이 달리오의 브리지워터가 창안한 배분법으로, 경제 성장/침체, 인플레/디플레의 4계절 사분면을 국채, 주식, 원자재, 금 등으로 완벽 방어하는 전략은?",
    options: [
          "올웨더 포트폴리오",
          "60/40 포트폴리오",
          "바벨 전략",
          "모멘텀 전략"
    ],
    answerIndex: 0,
    explanation: "올웨더(사계절) 포트폴리오는 경제의 어떤 악조건에서도 MDD를 극단적으로 통제하며 안정적인 우상향을 만듭니다.",
  },
  {
    id: "lv3-058",
    level: 3,
    category: "투자 전략",
    keyword: "바벨 전략",
    question: "나심 탈레브가 제안한 전략으로, 중간 위험 자산은 완전히 배제하고 90%의 극단적 안전자산(현금/국채)과 10%의 초고위험 비대칭 옵션만 양극단으로 보유하는 배분법은?",
    options: [
          "올웨더 전략",
          "바벨 전략",
          "정액적립",
          "패리티 전략"
    ],
    answerIndex: 1,
    explanation: "역도 바벨처럼 양 극단에 자산을 배치하여 하방 파산 위험은 완벽 차단하고 상방 잠재력은 무한히 열어두는 전략입니다.",
  },
  {
    id: "lv3-059",
    level: 3,
    category: "환율 제도",
    keyword: "통화 스왑",
    question: "비상시 두 나라 중앙은행이 자국 통화를 상대국 통화(예: 원화와 달러)와 미리 약정한 환율로 즉시 맞교환할 수 있도록 체결하는 외환 안전판은?",
    options: [
          "금리스왑",
          "외환보유액",
          "통화 스왑",
          "수출신용"
    ],
    answerIndex: 2,
    explanation: "한미 통화스왑 체결 소식은 국내 금융 시장의 달러 유동성 가뭄을 일거에 해소하는 가장 강력한 안정제입니다.",
  },
  {
    id: "lv3-060",
    level: 3,
    category: "경제 위기",
    keyword: "더블 딥",
    question: "경기 침체 후 짧은 반등을 보이다가 다시 침체로 빠져들어 알파벳 W 모양의 이중 침체를 겪는 현상은?",
    options: [
          "L자 침체",
          "U자 회복",
          "V자 반등",
          "더블 딥"
    ],
    answerIndex: 3,
    explanation: "더블딥은 조기 금리 인상이나 긴축 실패로 인해 경제가 완전 회복 전 다시 2차 수렁에 빠지는 고통스러운 과정입니다.",
  },
  {
    id: "lv3-061",
    level: 3,
    category: "통화 정책",
    keyword: "한국은행 금통위",
    question: "한국의 기준금리와 통화 정책 방향을 심의하고 결정하는 한국은행의 최고 정책 결정 기구는?",
    options: [
          "금융통화위원회",
          "금융감독원",
          "공정거래위원회",
          "금융위원회"
    ],
    answerIndex: 0,
    explanation: "금융통화위원회는 한국은행 총재와 위원들이 모여 연 8회 기준금리 결정을 내리는 국가 최고 통화기구입니다.",
  },
  {
    id: "lv3-062",
    level: 3,
    category: "금리 정책",
    keyword: "베이비스텝",
    question: "중앙은행이 기준금리를 가장 일반적인 보폭인 0.25%p(25bp) 올리거나 내리는 정책 조치는?",
    options: [
          "빅스텝",
          "베이비스텝",
          "자이언트스텝",
          "울트라스텝"
    ],
    answerIndex: 1,
    explanation: "베이비스텝은 시장에 큰 충격을 주지 않고 점진적으로 통화정책을 조정하는 0.25%p 금리 변동입니다.",
  },
  {
    id: "lv3-063",
    level: 3,
    category: "통화 긴축",
    keyword: "양적긴축 (QT)",
    question: "중앙은행이 보유하고 있던 국채나 모기지 채권의 만기가 도래했을 때 재구매하지 않고 회수하여 시중의 유동성을 직접 줄이는 정책은?",
    options: [
          "양적완화",
          "금리 인하",
          "양적긴축",
          "지급준비율 인하"
    ],
    answerIndex: 2,
    explanation: "양적긴축(Quantitative Tightening)은 중앙은행의 대차대조표를 축소하여 시장에 풀린 달러 유동성을 직접 빨아들이는 강력한 긴축입니다.",
  },
  {
    id: "lv3-064",
    level: 3,
    category: "통화 정책",
    keyword: "오퍼레이션 트위스트",
    question: "중앙은행이 단기 국채를 팔고 장기 국채를 사들여, 기준금리를 건드리지 않으면서 장기 금리를 낮추고 경기 부양을 유도하는 정책은?",
    options: [
          "테이퍼링",
          "캐리 트레이드",
          "스텔스 QE",
          "오퍼레이션 트위스트"
    ],
    answerIndex: 3,
    explanation: "오퍼레이션 트위스트는 장단기 채권을 맞바꿔 장기 금리를 낮춤으로써 기업 투자와 주택담보대출을 활성화하는 기법입니다.",
  },
  {
    id: "lv3-065",
    level: 3,
    category: "금리 정책",
    keyword: "울트라스텝",
    question: "역사상 유례없는 초비상 물가 폭등 사태에서 기준금리를 한 번에 무려 1.00%p(100bp) 인상하는 극단적 조치는?",
    options: [
          "울트라스텝",
          "빅스텝",
          "자이언트스텝",
          "테이퍼링"
    ],
    answerIndex: 0,
    explanation: "울트라스텝은 기준금리를 단숨에 1.00%p 인상하여 시중의 유동성을 급격히 흡수하는 초강력 긴축 정책입니다.",
  },
  {
    id: "lv3-066",
    level: 3,
    category: "연준 보고서",
    keyword: "점도표 (Dot Plot)",
    question: "FOMC 회의 후 공개되는 자료로, 연준 위원 19명이 예상하는 향후 연도별 기준금리 전망을 '점(Dot)'으로 찍어 나타낸 도표는?",
    options: [
          "베이지북",
          "점도표",
          "필립스 곡선",
          "수익률 곡선"
    ],
    answerIndex: 1,
    explanation: "점도표는 연준 위원들의 미래 금리 인상/인하 경로에 대한 속내를 엿볼 수 있는 가장 중요한 정책 나침반입니다.",
  },
  {
    id: "lv3-067",
    level: 3,
    category: "단기 자금",
    keyword: "역레포 (Reverse Repo)",
    question: "시중 은행과 머니마켓펀드(MMF)가 남아도는 잉여 현금을 미국 연준에 하루 동안 맡기고 국채를 담보로 이자를 받는 단기 유동성 흡수 창구는?",
    options: [
          "재할인율",
          "콜시장",
          "역레포",
          "CD 발행"
    ],
    answerIndex: 2,
    explanation: "역레포(Reverse Repo) 잔고는 시중 금융기관의 남아도는 유동성 규모를 보여주며, 이 잔고가 줄어들면 시장 유동성이 고갈되고 있다는 신호입니다.",
  },
  {
    id: "lv3-068",
    level: 3,
    category: "물가 지표",
    keyword: "근원 CPI (Core CPI)",
    question: "소비자물가지수(CPI) 중에서 계절적 요인과 일시적 충격으로 가격 변동이 심한 [식료품 및 에너지]를 제외하고 산출하는 기조적 물가지수는?",
    options: [
          "헤드라인 CPI",
          "수출입물가지수",
          "생산자물가지수",
          "근원 CPI"
    ],
    answerIndex: 3,
    explanation: "근원 CPI는 일시적 유가/곡물가 급등락을 배제하고 경제 전반의 기초적인 물가 압력을 정확히 파악하기 위한 지표입니다.",
  },
  {
    id: "lv3-069",
    level: 3,
    category: "물가 지표",
    keyword: "PCE (개인소비지출 물가지수)",
    question: "미국 연준(Fed)이 공식적인 물가 목표(연 2%)를 설정하고 통화 정책을 결정할 때 가장 신뢰하고 선호하는 물가 지표는?",
    options: [
          "PCE",
          "CPI",
          "PPI",
          "GDP 디플레이터"
    ],
    answerIndex: 0,
    explanation: "PCE 물가지수는 소비자의 품목 대체 효과와 농촌/도시 전체 소비 패턴을 포괄적으로 반영하여 연준이 최우선 참고합니다.",
  },
  {
    id: "lv3-070",
    level: 3,
    category: "물가 지표",
    keyword: "근원 PCE (Core PCE)",
    question: "미국 연준이 가장 주목하는 핵심 물가 지표로, 개인소비지출(PCE)에서 가격 변동이 심한 식료품과 에너지를 제외한 지표는?",
    options: [
          "헤드라인 PCE",
          "근원 PCE",
          "근원 PPI",
          "생활물가지수"
    ],
    answerIndex: 1,
    explanation: "근원 PCE는 연준의 연간 2% 물가 안정 목표 달성 여부를 판단하는 절대적인 기준 지표입니다.",
  },
  {
    id: "lv3-071",
    level: 3,
    category: "고용 지표",
    keyword: "비농업 고용지수 (NFP)",
    question: "미국 노동부가 매월 첫째 주 금요일에 발표하는 지표로, 농업을 제외한 전 산업 분야의 신규 고용자 수 증감을 나타내는 핵심 지표는?",
    options: [
          "실업수당 청구건수",
          "고용비용지수",
          "비농업 고용지수",
          "구인건수"
    ],
    answerIndex: 2,
    explanation: "비농업 고용지수는 미국 노동 시장의 건전성과 소비 여력을 보여주는 가장 파급력이 큰 월간 경제 지표입니다.",
  },
  {
    id: "lv3-072",
    level: 3,
    category: "경기 선행 지표",
    keyword: "PMI (구매관리자지수)",
    question: "기업의 구매 담당자들을 대상으로 신규 주문, 생산, 고용 등을 설문하여 산출하며, '50'을 기준으로 경기 확장과 위축을 판단하는 선행 지표는?",
    options: [
          "소비자심리지수",
          "BSI",
          "경기선행지수",
          "PMI"
    ],
    answerIndex: 3,
    explanation: "PMI(Purchasing Managers' Index)는 50을 넘으면 경기 확장, 50 미만이면 경기 위축을 나타내는 가장 빠른 경기 선행 지표입니다.",
  },
  {
    id: "lv3-073",
    level: 3,
    category: "경기 시나리오",
    keyword: "연착륙 (Soft Landing)",
    question: "중앙은행이 금리를 올려 물가를 잡는 과정에서 경제가 극심한 불황이나 실업률 폭등 없이 완만하고 부드럽게 안정되는 이상적인 상태는?",
    options: [
          "연착륙",
          "경착륙",
          "무착륙",
          "스태그플레이션"
    ],
    answerIndex: 0,
    explanation: "연착륙(소프트 랜딩)은 비행기가 활주로에 부드럽게 착륙하듯 심각한 침체 없이 인플레이션을 잡는 베스트 시나리오입니다.",
  },
  {
    id: "lv3-074",
    level: 3,
    category: "경기 시나리오",
    keyword: "경착륙 (Hard Landing)",
    question: "중앙은행의 과도한 금리 인상으로 인해 기업 도산과 대규모 실업이 발생하며 경제가 급격한 침체와 불황으로 곤두박질치는 상태는?",
    options: [
          "연착륙",
          "경착륙",
          "골디락스",
          "유동성 장세"
    ],
    answerIndex: 1,
    explanation: "경착륙(하드 랜딩)은 비행기가 비상 추락하듯 급격한 금리 인상의 부작용으로 경제가 심각한 불황을 겪는 상태입니다.",
  },
  {
    id: "lv3-075",
    level: 3,
    category: "경기 시나리오",
    keyword: "무착륙 (No Landing)",
    question: "금리를 계속 올리는데도 고용이 여전히 탄탄하고 경제가 식지 않고 계속 뜨겁게 성장하여 금리를 내리기 힘든 시나리오는?",
    options: [
          "경착륙",
          "디플레이션",
          "무착륙",
          "모라토리엄"
    ],
    answerIndex: 2,
    explanation: "무착륙(노 랜딩)은 경기가 침체로 가지 않고 과열이 지속되어 금리를 장기간 높게 유지해야 하는 상황입니다.",
  },
  {
    id: "lv3-076",
    level: 3,
    category: "물가 개념",
    keyword: "디플레이션",
    question: "물가가 지속적으로 하락하여 소비자들이 구매를 미루고, 기업 매출 감소와 임금 삭감으로 이어지는 경제 침체의 악순환은?",
    options: [
          "인플레이션",
          "리플레이션",
          "스태그플레이션",
          "디플레이션"
    ],
    answerIndex: 3,
    explanation: "디플레이션은 돈의 가치가 오르고 물건값이 계속 떨어져 소비와 투자가 얼어붙는 위험한 불황 현상입니다.",
  },
  {
    id: "lv3-077",
    level: 3,
    category: "거시 경제 이론",
    keyword: "필립스 곡선",
    question: "실업률이 낮아지면(완전고용) 임금과 물가가 상승하고, 실업률이 높아지면 물가 상승세가 둔화된다는 고용과 물가의 역의 관계를 나타낸 곡선은?",
    options: [
          "필립스 곡선",
          "수익률 곡선",
          "로렌츠 곡선",
          "라퍼 곡선"
    ],
    answerIndex: 0,
    explanation: "필립스 곡선(Phillips Curve)은 중앙은행이 물가를 잡기 위해 금리를 올리면 일정 부분 실업률 증가를 감수해야 하는 딜레마를 설명합니다.",
  },
  {
    id: "lv3-078",
    level: 3,
    category: "물가 개념",
    keyword: "디스인플레이션",
    question: "물가 상승률(인플레이션)이 여전히 플러스(+)이긴 하지만, 그 상승 속도가 점차 둔화되며 물가가 안정되어 가는 과정은?",
    options: [
          "디플레이션",
          "디스인플레이션",
          "하이퍼인플레이션",
          "긴축"
    ],
    answerIndex: 1,
    explanation: "디스인플레이션은 물가 자체가 떨어지는 디플레이션과 달리, 물가 '상승 속도'가 둔화되어 정상 범위로 복귀하는 긍정적 흐름입니다.",
  },
  {
    id: "lv3-079",
    level: 3,
    category: "물가 개념",
    keyword: "하이퍼인플레이션",
    question: "통화량 남발이나 국가 신뢰 붕괴로 물가가 월 수십~수백% 이상 통제 불능으로 폭등하여 화폐가 휴지조각이 되는 극단적 현상은?",
    options: [
          "스태그플레이션",
          "디플레이션",
          "하이퍼인플레이션",
          "그레이트 리셋"
    ],
    answerIndex: 2,
    explanation: "하이퍼인플레이션은 짐바브웨나 베네수엘라처럼 화폐 가치가 완전히 소멸되어 물가가 천문학적으로 치솟는 현상입니다.",
  },
  {
    id: "lv3-080",
    level: 3,
    category: "환율 지수",
    keyword: "달러 인덱스 (DXY)",
    question: "유로, 엔, 파운드 등 세계 주요 6개국 통화 대비 미국 달러의 평균적인 가치를 지수화하여 나타낸 것은?",
    options: [
          "빅맥 지수",
          "금리 스프레드",
          "원달러 환율",
          "달러 인덱스"
    ],
    answerIndex: 3,
    explanation: "달러 인덱스는 글로벌 외환 시장에서 달러의 상대적 강세/약세를 가늠하는 핵심 기준 지표입니다.",
  },
  {
    id: "lv3-081",
    level: 3,
    category: "국제 금융",
    keyword: "엔 캐리 트레이드",
    question: "초저금리인 일본 엔화를 싸게 빌려 미국 국채나 한국 주식 등 고금리·고수익 국가의 자산에 투자하는 글로벌 금융 기법은?",
    options: [
          "엔 캐리 트레이드",
          "달러 페그",
          "외환 스왑",
          "통화 스와프"
    ],
    answerIndex: 0,
    explanation: "엔 캐리 트레이드는 금리가 0%에 가까운 엔화를 차입하여 해외 고금리 자산에 투자해 금리 차익을 얻는 전략입니다.",
  },
  {
    id: "lv3-082",
    level: 3,
    category: "국제 금융",
    keyword: "엔 캐리 청산",
    question: "일본이 금리를 올리거나 엔화 가치가 급등할 때, 손실을 피하기 위해 투자했던 해외 자산을 팔고 엔화를 갚는 글로벌 자금 회수 현상은?",
    options: [
          "달러 스왑",
          "엔 캐리 청산",
          "금리 차익거래",
          "양적긴축"
    ],
    answerIndex: 1,
    explanation: "엔 캐리 청산이 발생하면 글로벌 주식·코인 등 위험 자산이 대규모 매도세에 휩싸여 전 세계 증시가 급락할 수 있습니다.",
  },
  {
    id: "lv3-083",
    level: 3,
    category: "국제 금융",
    keyword: "외환보유액",
    question: "국가가 대외 채무를 갚지 못하거나 환율이 급변하는 비상사태에 대비하여 중앙은행과 정부가 비축해 둔 외화 자산은?",
    options: [
          "지급준비금",
          "통화안정증권",
          "외환보유액",
          "국민연금기금"
    ],
    answerIndex: 2,
    explanation: "외환보유액은 국가의 비상 금고 역할을 하며, 국가 신용등급과 대외 지급 능력을 보증하는 핵심 안전판입니다.",
  },
  {
    id: "lv3-084",
    level: 3,
    category: "국제 금융",
    keyword: "통화 스와프",
    question: "두 나라의 중앙은행이 비상시 미리 정해둔 환율로 자국 통화를 맞교환하여 외화를 즉시 공급받을 수 있도록 맺는 금융 방어막은?",
    options: [
          "자유무역협정",
          "이중과세방지협정",
          "관세 동맹",
          "통화 스와프"
    ],
    answerIndex: 3,
    explanation: "통화 스와프는 외환 위기 시 마이너스 통장처럼 즉시 달러 등을 인출해 사용할 수 있는 국가 간 외환 안전장치입니다.",
  },
  {
    id: "lv3-085",
    level: 3,
    category: "원자재와 자산",
    keyword: "금(Gold)의 자산 특성",
    question: "인플레이션이나 전쟁, 금융 위기 발생 시 가치가 보존되는 대표적인 실물 안전자산으로, 달러 가치와 통상 반대로 움직이는 것은?",
    options: [
          "금",
          "원유",
          "구리",
          "비트코인"
    ],
    answerIndex: 0,
    explanation: "금은 특정 국가의 신용에 의존하지 않는 절대적인 안전자산으로, 화폐 가치 하락과 위기 상황에서 강력한 헷지 수단이 됩니다.",
  },
  {
    id: "lv3-086",
    level: 3,
    category: "원자재와 자산",
    keyword: "닥터 코퍼 (Dr. Copper)",
    question: "전선, 건설, 자동차 등 전 산업에 두루 쓰여 가격 변동이 전 세계 실물 경기를 가장 정확히 예측한다고 하여 '박사'라 불리는 원자재는?",
    options: [
          "원유",
          "구리",
          "알루미늄",
          "니켈"
    ],
    answerIndex: 1,
    explanation: "구리는 실물 경제의 수요를 가장 민감하게 반영하므로, 경제학 박사 학위가 있는 것처럼 경기를 잘 맞춘다고 하여 '닥터 코퍼'라 불립니다.",
  },
  {
    id: "lv3-087",
    level: 3,
    category: "원자재와 자산",
    keyword: "WTI (서부 텍사스산 원유)",
    question: "브렌트유, 두바이유와 함께 세계 3대 유가 지표 중 하나로, 미국 뉴욕상업거래소에서 거래되는 국제 표준 원유는?",
    options: [
          "두바이유",
          "브렌트유",
          "WTI",
          "오만유"
    ],
    answerIndex: 2,
    explanation: "WTI는 미국 내 원유 생산과 소비를 대표하며, 국제 원유 가격 결정과 전 세계 물가에 막대한 영향을 미칩니다.",
  },
  {
    id: "lv3-088",
    level: 3,
    category: "채권과 금리",
    keyword: "국채 10년물 금리",
    question: "전 세계 모든 자산 가격(주식, 부동산, 기업 대출)의 기준 금리가 되는 '글로벌 무위험 기준 금리' 역할을 하는 지표는?",
    options: [
          "미국 국채 3개월물 금리",
          "리보 금리",
          "한국 국고채 3년물",
          "미국 국채 10년물 금리"
    ],
    answerIndex: 3,
    explanation: "미국 국채 10년물 금리는 글로벌 자본시장의 절대적인 할인율 기준이며, 이 금리가 급등하면 주식 시장의 밸류에이션이 압박을 받습니다.",
  },
  {
    id: "lv3-089",
    level: 3,
    category: "채권과 금리",
    keyword: "장단기 금리차 역전",
    question: "통상 10년물 장기 국채 금리가 2년물 단기 국채 금리보다 낮아지는 기현상으로, 역사적으로 1~2년 내 경기 침체를 정확히 예고해 온 신호는?",
    options: [
          "장단기 금리차 역전",
          "골든크로스",
          "스프레드 확대",
          "유동성 함정"
    ],
    answerIndex: 0,
    explanation: "장단기 금리 역전은 시장이 미래 경제 침체와 중앙은행의 향후 금리 인하를 예상할 때 발생하는 강력한 불황 선행 지표입니다.",
  },
  {
    id: "lv3-090",
    level: 3,
    category: "시장 심리",
    keyword: "위험선호 (Risk-On)",
    question: "경기 회복과 유동성 확대로 인해 투자자들이 안전한 채권이나 달러를 팔고 주식, 신흥국 자산, 코인 등 고수익 위험자산으로 몰려드는 분위기는?",
    options: [
          "리스크 오프",
          "리스크 온",
          "패닉 셀링",
          "모라토리엄"
    ],
    answerIndex: 1,
    explanation: "리스크 온 환경에서는 위험 자산 선호가 극대화되어 주식 시장으로 막대한 자금이 유입되고 주가가 급등합니다.",
  },
  {
    id: "lv3-091",
    level: 3,
    category: "시장 심리",
    keyword: "위험회피 (Risk-Off)",
    question: "전쟁, 금융 위기, 경기 침체 공포로 인해 투자자들이 위험한 주식을 던지고 미국 국채, 금, 달러 등 안전자산으로 피신하는 현상은?",
    options: [
          "리스크 온",
          "숏스퀴즈",
          "리스크 오프",
          "FOMO"
    ],
    answerIndex: 2,
    explanation: "리스크 오프 환경에서는 안전자산 수요가 폭발하여 금값과 달러가 상승하고 주식 시장은 일제히 조정을 받습니다.",
  },
  {
    id: "lv3-092",
    level: 3,
    category: "통화 정책",
    keyword: "유동성 함정",
    question: "중앙은행이 금리를 0% 수준까지 대폭 낮추고 돈을 풀어도, 극심한 경제 불안으로 기업과 가계가 소비나 투자를 하지 않고 돈을 쥐고만 있는 상태는?",
    options: [
          "스태그플레이션",
          "모럴 해저드",
          "테이퍼링",
          "유동성 함정"
    ],
    answerIndex: 3,
    explanation: "유동성 함정에 빠지면 통상적인 금리 인하 정책이 실물 경제를 살리는 데 전혀 작동하지 않게 됩니다.",
  },
  {
    id: "lv3-093",
    level: 3,
    category: "통화 정책",
    keyword: "포워드 가이던스",
    question: "중앙은행이 미래 통화정책 방향과 금리 경로에 대한 명확한 지침을 시장에 미리 예고하여 시장의 불확실성을 줄이는 소통 수단은?",
    options: [
          "포워드 가이던스",
          "구두개입",
          "점도표",
          "테이퍼링"
    ],
    answerIndex: 0,
    explanation: "포워드 가이던스는 중앙은행이 '언제까지 금리를 유지할 것인지' 미래 계획을 시장에 선제적으로 안내하는 정책 도구입니다.",
  },
  {
    id: "lv3-094",
    level: 3,
    category: "국제 무역",
    keyword: "환율과 수출입",
    question: "원/달러 환율이 상승(원화 가치 하락)할 때, 국내 수출 기업(예: 자동차·전자)의 해외 가격 경쟁력과 원화 환산 매출은 어떻게 될까요?",
    options: [
          "악화되고 감소한다",
          "개선되고 증가한다",
          "아무 영향이 없다",
          "수출이 전면 중단된다"
    ],
    answerIndex: 1,
    explanation: "환율이 오르면 달러로 벌어들인 수출 대금을 원화로 바꿀 때 더 큰 금액이 되어 국내 수출 기업의 실적에 유리합니다.",
  },
  {
    id: "lv3-095",
    level: 3,
    category: "국제 무역",
    keyword: "환율과 수입 물가",
    question: "원/달러 환율이 급등하면 해외에서 들여오는 원유, 천연가스, 곡물 등 수입 원자재의 국내 원화 가격은 어떻게 될까요?",
    options: [
          "더 저렴해진다",
          "변화가 없다",
          "더 비싸져 국내 물가를 자극한다",
          "세금이 면제된다"
    ],
    answerIndex: 2,
    explanation: "환율 상승은 수입 원자재 가격을 올려 국내 소비자 물가를 밀어 올리는(Cost-push) 주요 요인이 됩니다.",
  },
  {
    id: "lv3-096",
    level: 3,
    category: "지정학적 리스크",
    keyword: "지정학적 리스크",
    question: "중동 전쟁, 대만 해협 갈등, 우크라이나 사태처럼 국가 간 군사적 분쟁과 대립이 원유 공급망과 글로벌 증시를 흔드는 위험은?",
    options: [
          "신용 리스크",
          "법적 리스크",
          "유동성 리스크",
          "지정학적 리스크"
    ],
    answerIndex: 3,
    explanation: "지정학적 리스크는 공급망 단절과 유가 급등을 촉발하여 글로벌 금융 시장의 불확실성을 극대화합니다.",
  },
  {
    id: "lv3-097",
    level: 3,
    category: "거시 경제",
    keyword: "소비자신뢰지수",
    question: "소비자들의 경제에 대한 체감 경기와 향후 소비 지출 의향을 설문 조사하여 산출하는 민간 소비 선행 지표는?",
    options: [
          "소비자신뢰지수",
          "생산자물가지수",
          "고용비용지수",
          "소매판매지수"
    ],
    answerIndex: 0,
    explanation: "미국 GDP의 70%가 소비에서 나오므로, 소비자신뢰지수는 향후 미국 경제 성장의 모멘텀을 가늠하는 핵심 지표입니다.",
  },
  {
    id: "lv3-098",
    level: 3,
    category: "거시 경제",
    keyword: "소매판매 지수",
    question: "백화점, 마트, 온라인 쇼핑 등 소비자들이 물건을 실제로 얼마나 구매했는지를 집계하여 실물 경기 소비 강도를 측정하는 월간 지표는?",
    options: [
          "도매물가지수",
          "소매판매 지수",
          "산업생산지수",
          "수출입동향"
    ],
    answerIndex: 1,
    explanation: "소매판매 지수는 미국 가계의 실제 소비 지출 규모를 직접적으로 보여주는 대표적인 실물 경기 지표입니다.",
  },
  {
    id: "lv3-099",
    level: 3,
    category: "중앙은행 제도",
    keyword: "지급준비율",
    question: "시중 은행들이 고객의 예금 인출에 대비하여 예금액의 일정 비율을 한국은행에 의무적으로 예치해 두어야 하는 비율은?",
    options: [
          "자기자본비율",
          "예대율",
          "지급준비율",
          "BIS 비율"
    ],
    answerIndex: 2,
    explanation: "한국은행은 지급준비율을 올리거나 내려 시중 은행들의 대출 여력과 통화량을 직접 조절할 수 있습니다.",
  },
  {
    id: "lv3-100",
    level: 3,
    category: "국제 금융",
    keyword: "기축통화",
    question: "국제 무역 결제, 금융 거래, 외환보유액의 중심이 되는 세계 표준 통화(예: 미국 달러)를 무엇이라 할까요?",
    options: [
          "지역화폐",
          "보조통화",
          "가상통화",
          "기축통화"
    ],
    answerIndex: 3,
    explanation: "기축통화는 전 세계 금융 거래의 중심이 되는 통화로, 현재 미국 달러가 압도적인 기축통화 지위를 유지하고 있습니다.\n \n \n \n \n ## 👑 4단계: 마스터 (심화 금융) (100문항)\n\n\n\n\n## 👑 4단계: 마스터 (심화 금융) (100문항)",
  },
  // ==========================================
  // LEVEL 4: 마스터 (심화 금융) - 100문항
  // ==========================================
  {
    id: "lv4-001",
    level: 4,
    category: "메자닌 증권",
    keyword: "전환사채",
    question: "보유 중에는 확정 이자를 받다가, 주가가 오르면 정해진 조건에 따라 주식으로 바꿀 수 있는 권리(전환권)가 붙은 채권은?",
    options: [
          "전환사채",
          "신주인수권부사채",
          "후순위채",
          "교환사채"
    ],
    answerIndex: 0,
    explanation: "전환사채(Convertible Bond)는 주가 상승 시 주식 전환으로 대박 수익을 내고, 하락 시 채권 원금과 이자를 챙기는 메자닌 상품입니다.",
  },
  {
    id: "lv4-002",
    level: 4,
    category: "메자닌 증권",
    keyword: "신주인수권부사채",
    question: "채권 자체는 그대로 유지하여 만기까지 이자를 받으면서, 별도로 회사의 신주를 정해진 행사가격에 살 수 있는 권리(워런트)가 분리 결합된 채권은?",
    options: [
          "조건부자본증권",
          "신주인수권부사채",
          "영구채",
          "전환사채"
    ],
    answerIndex: 1,
    explanation: "BW(Bond with Warrant)는 채권 원금과 별개로 신주인수권을 행사해 추가 주식을 인수할 수 있는 복합 금융상품입니다.",
  },
  {
    id: "lv4-003",
    level: 4,
    category: "메자닌 증권",
    keyword: "교환사채",
    question: "채권 발행 회사가 보유하고 있는 자사주나 타 상장 기업의 주식으로 교환할 수 있는 권리가 부여된 채권은?",
    options: [
          "전환사채",
          "신주인수권부사채",
          "교환사채",
          "이익참가부사채"
    ],
    answerIndex: 2,
    explanation: "교환사채(Exchangeable Bond)는 신주를 찍어내지 않고 회사가 이미 들고 있는 주식으로 교환해주므로 신주 발행 부담이 없습니다.",
  },
  {
    id: "lv4-004",
    level: 4,
    category: "메자닌 조건",
    keyword: "리픽싱",
    question: "전환사채(CB)나 BW 발행 후 주가가 하락했을 때, 전환가격을 하향 조정하여 채권자의 이익을 보전해 주는 조항은?",
    options: [
          "콜옵션",
          "풋옵션",
          "롤오버",
          "리픽싱"
    ],
    answerIndex: 3,
    explanation: "리픽싱으로 전환가격이 낮아지면 전환 가능한 주식 수가 크게 늘어나 기존 주주의 지분 희석(오버행)이 가속화됩니다.",
  },
  {
    id: "lv4-005",
    level: 4,
    category: "파생 ETF",
    keyword: "커버드콜",
    question: "기초 주식을 매수함과 동시에 해당 주식의 외가격 콜옵션을 매도하여, 상방 수익은 제한되는 대신 높은 옵션 프리미엄 분배금을 챙기는 전략은?",
    options: [
          "커버드콜",
          "롱숏 전략",
          "스트래들",
          "불스프레드"
    ],
    answerIndex: 0,
    explanation: "커버드콜 ETF는 횡보장이나 완만한 하락장에서 고배당을 주지만, 대세 폭등장에서는 상방 수익이 막히고 폭락 시 원금 손실을 방어하지 못합니다.",
  },
  {
    id: "lv4-006",
    level: 4,
    category: "ETF 구조",
    keyword: "합성 ETF",
    question: "자산운용사가 주식을 직접 바구니에 담지 않고, 거래상대방인 다른 대형 증권사와 총수익스왑(TRS) 계약을 맺어 지수 수익률을 넘겨받는 방식의 ETF는?",
    options: [
          "테마 ETF",
          "합성 ETF",
          "실물 복제 ETF",
          "액티브 ETF"
    ],
    answerIndex: 1,
    explanation: "합성 ETF는 해외나 원자재 등 실물 복제가 어려운 자산에 쉽게 투자할 수 있지만 스왑 거래상대방의 신용 위험이 존재합니다.",
  },
  {
    id: "lv4-007",
    level: 4,
    category: "파생 스왑",
    keyword: "TRS",
    question: "증권사가 주식이나 자산을 대신 매수해 보유하고, 고객은 그에 따른 이자를 지급하며 자산에서 발생하는 모든 손익(배당/시세차익)을 온전히 가져가는 장외파생계약은?",
    options: [
          "신용부도스왑",
          "통화스왑",
          "TRS",
          "금리스왑"
    ],
    answerIndex: 2,
    explanation: "TRS는 적은 증거금으로 대규모 지분을 실물 노출 없이 굴리는 헤지펀드의 대표적인 고레버리지 차입 수단입니다.",
  },
  {
    id: "lv4-008",
    level: 4,
    category: "헤지펀드 전략",
    keyword: "롱숏 전략",
    question: "저평가된 우량 주식은 매수(Long)하고 고평가된 부실 주식은 공매도(Short)하여, 시장 전체의 등락과 무관하게 절대 수익을 추구하는 전략은?",
    options: [
          "글로벌 매크로",
          "모멘텀 전략",
          "CTA 전략",
          "롱숏 전략"
    ],
    answerIndex: 3,
    explanation: "롱숏 전략은 시장의 체계적 위험(베타)을 상쇄하고 순수한 종목 발굴 실력(알파)만으로 수익을 창출합니다.",
  },
  {
    id: "lv4-009",
    level: 4,
    category: "옵션 그리스",
    keyword: "델타",
    question: "기초자산 주가가 1원 변할 때 파생 옵션 프리미엄 가격이 얼마만큼 민감하게 변하는지를 나타내는 옵션 그리스 지표는?",
    options: [
          "델타",
          "베가",
          "감마",
          "세타"
    ],
    answerIndex: 0,
    explanation: "델타는 주가 변동에 따른 옵션 가격 민감도이며, 주식 선물 헤지 비율을 계산할 때 기준이 됩니다.",
  },
  {
    id: "lv4-010",
    level: 4,
    category: "옵션 그리스",
    keyword: "감마",
    question: "기초자산 가격 변동에 따라 델타(Delta) 자체가 얼마나 빠르게 변하는지를 측정하는 2차 가속도 지표는?",
    options: [
          "베가",
          "감마",
          "델타",
          "로"
    ],
    answerIndex: 1,
    explanation: "감마가 높으면 주가가 조금만 움직여도 델타가 급격히 변하므로 감마 스퀴즈 같은 극단적 변동성이 촉발될 수 있습니다.",
  },
  {
    id: "lv4-011",
    level: 4,
    category: "옵션 그리스",
    keyword: "세타",
    question: "만기일까지 시간이 하루씩 흘러감에 따라 파생 옵션의 시간가치가 얼마씩 갉아먹혀 소멸되는지를 나타내는 지표는?",
    options: [
          "델타",
          "로",
          "세타",
          "베가"
    ],
    answerIndex: 2,
    explanation: "옵션 매수자는 매일 세타에 의해 손실을 보며, 옵션 매도자(커버드콜 등)는 세타를 이익의 원천으로 취합니다.",
  },
  {
    id: "lv4-012",
    level: 4,
    category: "옵션 그리스",
    keyword: "베가",
    question: "시장의 내재변동성(IV)이 1%p 변할 때 파생 옵션 가격이 얼마나 민감하게 변하는지를 나타내는 지표는?",
    options: [
          "세타",
          "감마",
          "델타",
          "베가"
    ],
    answerIndex: 3,
    explanation: "베가는 변동성에 대한 민감도이며, 실적 발표 등 변동성이 급감하는 이벤트 직후 옵션 프리미엄이 폭락하는 원인(IV 크러시)입니다.",
  },
  {
    id: "lv4-013",
    level: 4,
    category: "재무 관리",
    keyword: "WACC",
    question: "기업이 자기자본과 타인자본(부채)을 조달할 때 발생하는 각각의 자본비용을 시장가치 비율로 가중평균한 기업의 총 자본비용은?",
    options: [
          "WACC",
          "CAPM",
          "IRR",
          "ROIC"
    ],
    answerIndex: 0,
    explanation: "기업의 투자가치가 있으려면 기업이 투자를 통해 벌어들이는 투하자본이익률(ROIC)이 WACC보다 무조건 높아야 합니다.",
  },
  {
    id: "lv4-014",
    level: 4,
    category: "가치 평가",
    keyword: "DCF",
    question: "기업이 미래에 창출할 잉여현금흐름(FCF)을 추정한 뒤, 이를 적절한 할인율(WACC)로 현재 가치로 할인하여 기업 가치를 구하는 절대 평가법은?",
    options: [
          "배당평가모형",
          "DCF",
          "청산가치법",
          "상대가치평가법"
    ],
    answerIndex: 1,
    explanation: "DCF(Discounted Cash Flow)는 IB 및 가치투자 전문가들이 기업의 본질적 내재가치를 산출하는 가장 정교한 프레임워크입니다.",
  },
  {
    id: "lv4-015",
    level: 4,
    category: "자산 가격 모델",
    keyword: "CAPM",
    question: "자산의 기대수익률은 무위험이자율에 시장 위험 프리미엄과 자산의 체계적 위험 계수(베타)를 곱해 결정된다는 자본자산가격결정모형은?",
    options: [
          "마코위츠모형",
          "APT 모형",
          "CAPM 모형",
          "블랙숄즈모형"
    ],
    answerIndex: 2,
    explanation: "기대수익률 = Rf + Beta*(Rm - Rf) 로 표현되며, 금융공학 자산 평가의 가장 기초적인 기둥입니다.",
  },
  {
    id: "lv4-016",
    level: 4,
    category: "옵션 가격 모델",
    keyword: "블랙-숄즈 모형",
    question: "기초자산 주가, 행사가격, 무위험금리, 만기, 변동성 등 5가지 변수로 유럽형 옵션의 이론적 공정가격을 산출해 낸 노벨경제학상 수상 공식은?",
    options: [
          "CAPM",
          "이항옵션모형",
          "몬테카를로 시뮬레이션",
          "블랙-숄즈 모형"
    ],
    answerIndex: 3,
    explanation: "1973년 발표되어 현대 파생상품 금융 시장의 폭발적인 성장을 이끈 역사상 가장 유명한 편미분 방정식 모형입니다.",
  },
  {
    id: "lv4-017",
    level: 4,
    category: "리스크 관리",
    keyword: "VaR",
    question: "정상적인 시장 조건에서 특정 신뢰수준(예: 99%) 하에 일정 기간(예: 1일, 10일) 동안 발생할 수 있는 최대 예상 손실 금액은?",
    options: [
          "VaR",
          "샤프지수",
          "베타",
          "MDD"
    ],
    answerIndex: 0,
    explanation: "VaR는 금융기관과 펀드가 규제 당국에 보고하고 내부 리스크를 한도 관리하는 표준 통계 지표입니다.",
  },
  {
    id: "lv4-018",
    level: 4,
    category: "리스크 관리",
    keyword: "스트레스 테스트",
    question: "2008년 금융위기나 2020년 팬데믹 같은 극단적인 역사적 위기 시나리오를 가상 적용하여 금융기관의 건전성을 시험하는 것은?",
    options: [
          "민감도분석",
          "스트레스 테스트",
          "백테스팅",
          "VaR"
    ],
    answerIndex: 1,
    explanation: "스트레스 테스트는 일반적인 통계 모델(VaR)이 잡아내지 못하는 테일 리스크(꼬리 위험)를 점검하는 위기 시뮬레이션입니다.",
  },
  {
    id: "lv4-019",
    level: 4,
    category: "옵션 변동성",
    keyword: "볼러틸리티 스마일",
    question: "옵션의 행사가격별 내재변동성(IV)을 그래프로 그렸을 때, 내가격과 외가격 옵션의 변동성이 등가격보다 높게 나타나 웃는 입술 모양을 띄는 현상은?",
    options: [
          "스프레드",
          "서피스",
          "볼러틸리티 스마일",
          "스큐"
    ],
    answerIndex: 2,
    explanation: "현실 시장의 주가 분포가 정규분포보다 꼬리가 두꺼운 팻 테일(Fat Tail) 특성을 보이기 때문에 발생하는 현상입니다.",
  },
  {
    id: "lv4-020",
    level: 4,
    category: "구조화 증권",
    keyword: "ELS",
    question: "개별 주가나 지수가 사전에 정해둔 녹인(Knock-in) 배리어 밑으로 떨어지지 않으면 약정된 고수익을 지급하는 파생결합증권은?",
    options: [
          "리츠",
          "DLS",
          "ETF",
          "ELS"
    ],
    answerIndex: 3,
    explanation: "ELS는 횡보장이나 완만한 하락장에서는 중수익을 주지만, 하락 배리어를 터치하면 주가 하락률만큼 원금 손실이 발생하는 비대칭 구조입니다.",
  },
  {
    id: "lv4-021",
    level: 4,
    category: "구조화 증권",
    keyword: "녹인 배리어",
    question: "ELS 투자에서 원금 손실 구간으로 진입하는 하방 안전 한계선(예: 최초 기준가의 50~60%)을 무엇이라 부를까요?",
    options: [
          "녹인 배리어",
          "녹아웃 배리어",
          "조기상환평가가격",
          "행사가격"
    ],
    answerIndex: 0,
    explanation: "녹인(Knock-In)이 발생하면 만기 상환 시점까지 기준 가격을 회복하지 못할 경우 기초자산 하락률만큼 원금이 대규모 손실됩니다.",
  },
  {
    id: "lv4-022",
    level: 4,
    category: "M&A 기법",
    keyword: "LBO",
    question: "사모펀드(PEF)가 기업을 인수할 때 인수할 대상 기업의 자산이나 미래 현금흐름을 담보로 거액의 빚을 끌어와 인수하는 차입매수 방식은?",
    options: [
          "MBO",
          "LBO",
          "스팩합병",
          "TOB"
    ],
    answerIndex: 1,
    explanation: "LBO는 인수 주체의 적은 자기자본으로 대형 기업을 인수할 수 있지만, 피인수 기업에 막대한 부채 이자 부담을 떠넘깁니다.",
  },
  {
    id: "lv4-023",
    level: 4,
    category: "상장 도구",
    keyword: "SPAC",
    question: "비상장 우량 기업을 발굴하여 합병하는 것만을 유일한 목적으로 설립되는 서류상 페이퍼컴퍼니(기업인수목적회사)는?",
    options: [
          "AMC",
          "리츠",
          "SPAC",
          "PEF"
    ],
    answerIndex: 2,
    explanation: "SPAC은 복잡하고 까다로운 일반 직상장 IPO 절차 대신 신속하게 증시에 우회 상장할 수 있는 통로입니다.",
  },
  {
    id: "lv4-024",
    level: 4,
    category: "옵션 전략",
    keyword: "스트래들",
    question: "주가가 어느 방향으로든 폭발적으로 크게 움직일 것으로 예상될 때, 행사가격과 만기가 같은 콜옵션과 풋옵션을 동시에 동일 수량 매수하는 양방향 변동성 베팅은?",
    options: [
          "불스프레드",
          "아이언콘도르",
          "스트랭글",
          "스트래들"
    ],
    answerIndex: 3,
    explanation: "스트래들 매수는 주가가 위든 아래든 옵션 프리미엄 총합보다 더 크게 폭등하거나 폭락하면 큰 수익을 냅니다.",
  },
  {
    id: "lv4-025",
    level: 4,
    category: "옵션 전략",
    keyword: "아이언 콘도르",
    question: "주가가 좁은 박스권 안에서 머무를 것을 예상하여, 외가격 콜 스프레드와 풋 스프레드를 동시에 매도해 프리미엄을 챙기는 중립 전략은?",
    options: [
          "아이언 콘도르",
          "스트래들",
          "버터플라이",
          "칼라 전략"
    ],
    answerIndex: 0,
    explanation: "아이언 콘도르는 변동성이 낮고 주가가 특정 상하단 밴드 안에 갇혀 있을 때 최대 이익을 달성합니다.",
  },
  {
    id: "lv4-026",
    level: 4,
    category: "옵션 전략",
    keyword: "칼라 전략",
    question: "주식을 보유한 상태에서 하방 손실을 막기 위해 풋옵션을 매수하고, 그 풋옵션 매수 비용을 충당하기 위해 상방 콜옵션을 매도하는 무비용 헤지 전략은?",
    options: [
          "커버드콜",
          "칼라 전략",
          "스트립",
          "거츠"
    ],
    answerIndex: 1,
    explanation: "칼라 전략은 대주주나 기관이 주가 폭락을 방어하면서도 추가 비용 없이 주식 포지션을 동결 보호할 때 널리 쓰입니다.",
  },
  {
    id: "lv4-027",
    level: 4,
    category: "헤지펀드 기법",
    keyword: "고빈도 매매",
    question: "초고속 통신망과 알고리즘 컴퓨터를 증권거래소 서버 바로 옆에 두고(코로케이션), 100만 분의 1초(마이크로초) 단위로 미세 차익을 수백만 번 긁어모으는 트레이딩은?",
    options: [
          "스윙매매",
          "퀀트모멘텀",
          "HFT",
          "가치투자"
    ],
    answerIndex: 2,
    explanation: "HFT는 나노초 단위의 호가 우위를 점해 유동성을 공급하고 무위험 스프레드 이익을 독식합니다.",
  },
  {
    id: "lv4-028",
    level: 4,
    category: "시장 미시구조",
    keyword: "다크풀",
    question: "대형 기관들의 대규모 블록 거래가 장내 시장 호가창에 노출되어 시장 가격을 왜곡하는 것을 피하기 위해 만든 비공개 대체 사설 거래 플랫폼은?",
    options: [
          "블랙마켓",
          "장외시장",
          "대체거래소",
          "다크풀"
    ],
    answerIndex: 3,
    explanation: "다크풀은 체결 전까지 매수/매도 주문 호가와 수량을 대중에 공개하지 않는 사설 주문 시스템입니다.",
  },
  {
    id: "lv4-029",
    level: 4,
    category: "퀀트 팩터",
    keyword: "파마-프렌치 3팩터",
    question: "전통 CAPM 모형에 기업 규모(소형주 프리미엄/SMB)와 가치(가치주 프리미엄/HML) 요인을 추가하여 주가 수익률을 정교하게 설명해 낸 퀀트 모형은?",
    options: [
          "파마-프렌치 3팩터 모형",
          "머튼 모형",
          "카하트 4팩터",
          "아비트라지 모델"
    ],
    answerIndex: 0,
    explanation: "유진 파마와 케네스 프렌치가 구축한 현대 팩터 인베스팅의 가장 위대한 학문적 이정표입니다.",
  },
  {
    id: "lv4-030",
    level: 4,
    category: "자산 배분",
    keyword: "리스크 패리티",
    question: "투자 자산의 금액 기준(60:40 등)이 아니라, 각 자산이 전체 포트폴리오의 위험(변동성 기여도)에 똑같은 비중을 기여하도록 위험을 균등 분배하는 기법은?",
    options: [
          "최소분산 포트폴리오",
          "리스크 패리티",
          "평균-분산 최적화",
          "블랙-리터만"
    ],
    answerIndex: 1,
    explanation: "주식의 높은 위험도를 채권의 낮은 위험도와 맞추기 위해 저변동성 채권에 레버리지를 일으켜 위험 기여도를 1:1로 맞춥니다.",
  },
  {
    id: "lv4-031",
    level: 4,
    category: "채권 공학",
    keyword: "수익률 곡선 라이딩",
    question: "우상향하는 정상 수익률 곡선 환경에서 채권 만기가 다가올수록 채권 금리가 낮아져(가격은 상승) 만기 이자 외에 자본 차익까지 얻는 채권 운용 기법은?",
    options: [
          "불렛 전략",
          "사다리형 전략",
          "롤링효과/라이딩 전략",
          "바벨형 전략"
    ],
    answerIndex: 2,
    explanation: "만기 전 채권의 가격 상승을 이용해 만기 보유보다 더 높은 총수익률을 추구하는 전문 채권 운용법입니다.",
  },
  {
    id: "lv4-032",
    level: 4,
    category: "성과 지표",
    keyword: "소르티노 비율",
    question: "샤프지수가 상승 변동성까지 위험으로 패널티를 주는 단점을 개선하여, 오직 손실을 발생시키는 \"하방 변동성(하락 위험)\"만을 분모로 계산한 성과 지표는?",
    options: [
          "정보비율",
          "샤프지수",
          "트레이너지수",
          "소르티노 비율"
    ],
    answerIndex: 3,
    explanation: "소르티노 비율은 투자자에게 고통을 주는 진짜 유해한 하락 변동성만을 위험으로 간주하여 헤지펀드를 정밀 평가합니다.",
  },
  {
    id: "lv4-033",
    level: 4,
    category: "성과 지표",
    keyword: "정보비율",
    question: "펀드가 벤치마크 대비 초과 수익을 내기 위해 감수한 추적오차(초과수익 변동성) 단위당 초과수익률을 측정한 지표는?",
    options: [
          "정보비율",
          "소르티노",
          "베타",
          "젠센의 알파"
    ],
    answerIndex: 0,
    explanation: "IR(Information Ratio)은 액티브 펀드매니저가 일관된 실력으로 지속적인 알파를 창출하는지 검증합니다.",
  },
  {
    id: "lv4-034",
    level: 4,
    category: "파생 메커니즘",
    keyword: "감마 스퀴즈",
    question: "투자자들의 대량 콜옵션 매수로 인해 옵션을 매도한 마켓메이커들이 델타 중립을 유지하기 위해 기초주식을 기계적으로 추격 매수하면서 주가가 수직 폭등하는 현상은?",
    options: [
          "베어트랩",
          "감마 스퀴즈",
          "숏스퀴즈",
          "유동성트랩"
    ],
    answerIndex: 1,
    explanation: "2021년 게임스탑(GME) 사태 당시 개미들의 외가격 콜옵션 매수가 딜러들의 헤지 매수를 강제하며 발생한 폭등 메커니즘입니다.",
  },
  {
    id: "lv4-035",
    level: 4,
    category: "옵션 이론",
    keyword: "풋-콜 패리티",
    question: "유럽형 콜옵션, 풋옵션, 기초주식, 무위험 무쿠폰 채권 사이에 차익거래가 불가능하도록 성립해야 하는 절대적인 가격 균형 항등식은?",
    options: [
          "커버드이자율평가설",
          "블랙숄즈공식",
          "풋-콜 패리티",
          "피셔방정식"
    ],
    answerIndex: 2,
    explanation: "C + PV(K) = P + S 로 성립하며, 균형이 깨지면 즉각 무위험 차익거래 프로그램이 발동됩니다.",
  },
  {
    id: "lv4-036",
    level: 4,
    category: "신용 위험",
    keyword: "신용 스프레드",
    question: "국채 금리와 회사채 금리의 차이로, 경기가 악화되고 기업 파산 위험이 커질 때 급격히 확대되는 지표는?",
    options: [
          "기간프리미엄",
          "스왑베이시스",
          "유동성프리미엄",
          "신용 스프레드"
    ],
    answerIndex: 3,
    explanation: "신용 스프레드 확대는 회사채 시장에서 투자자들이 부도 위험을 회피하고 국채로 도망치는 안전자산 선호의 징후입니다.",
  },
  {
    id: "lv4-037",
    level: 4,
    category: "기업 회계",
    keyword: "빅 배스",
    question: "새로운 CEO나 경영진이 취임한 첫해에 이전 경영진의 잠재 부실과 누적 손실을 당해 회계장부에 털어버려 실적 악화를 몰아넣는 회계 기법은?",
    options: [
          "빅 배스",
          "분식회계",
          "토빈의 Q",
          "윈도우드레싱"
    ],
    answerIndex: 0,
    explanation: "빅 배스는 첫해에 모든 오물을 씻어내어 기저효과를 만든 뒤, 다음 해부터 실적 턴어라운드를 연출하기 위해 사용됩니다.",
  },
  {
    id: "lv4-038",
    level: 4,
    category: "기관 행동",
    keyword: "윈도우 드레싱",
    question: "기관투자가들이 분기말이나 연말 결산 시점에 펀드 수익률과 편입 포트폴리오 명세를 돋보이게 하려고 주식을 인위적으로 관리하는 행위는?",
    options: [
          "자사주매입",
          "윈도우 드레싱",
          "블록딜",
          "빅배스"
    ],
    answerIndex: 1,
    explanation: "수익률이 좋았던 1등 종목을 추가 매수해 주가를 올리고, 손실 난 잡주를 장부에서 감추기 위해 처분합니다.",
  },
  {
    id: "lv4-039",
    level: 4,
    category: "자본 조달",
    keyword: "조건부자본증권",
    question: "발행 당시 정한 특정 사유(부실금융기관 지정, 자본비율 미달 등)가 발생하면 투자자 동의 없이 원금이 전액 탕감되거나 주식으로 강제 전환되는 채권은?",
    options: [
          "기업어음",
          "단기사채",
          "조건부자본증권",
          "일반회사채"
    ],
    answerIndex: 2,
    explanation: "조건부자본증권(CoCo Bond)은 유사시 자동으로 자본으로 흡수되어 은행 파산을 막고 공적자금 투입을 방지하기 위해 발행되는 특수 채권입니다.",
  },
  {
    id: "lv4-040",
    level: 4,
    category: "금융 규제",
    keyword: "BIS 자기자본비율",
    question: "국제결제은행이 제시한 기준으로, 은행의 위험가중자산 대비 자기자본의 비율로 금융기관의 파산 위험을 막는 건전성 지표는?",
    options: [
          "예대율",
          "NSFR",
          "LCR",
          "BIS 비율"
    ],
    answerIndex: 3,
    explanation: "통상 8% 이상(권고 10~13% 이상)을 유지해야 하며, 미달 시 금융당국의 경영개선명령을 받습니다.",
  },
  {
    id: "lv4-041",
    level: 4,
    category: "퀀트 팩터",
    keyword: "퀄리티 팩터",
    question: "높은 ROE, 낮은 부채비율, 안정적인 이익 성장세와 건전한 회계 품질을 가진 해자 기업에 가중치를 두는 스마트베타 팩터는?",
    options: [
          "퀄리티 팩터",
          "밸류 팩터",
          "로우볼 팩터",
          "모멘텀"
    ],
    answerIndex: 0,
    explanation: "퀄리티 팩터는 경기 둔화 및 침체 국면에서 다른 팩터 대비 압도적인 하방 방어력과 지속 가능한 초과 성과를 냅니다.",
  },
  {
    id: "lv4-042",
    level: 4,
    category: "퀀트 팩터",
    keyword: "로우볼 팩터",
    question: "시장 평균보다 주가 변동성(표준편차)이 현저히 낮은 종목들만 골라 담았는데도 장기적으로 시장 수익률을 능가하는 팩터 이상현상은?",
    options: [
          "일드 팩터",
          "로우볼 이상현상",
          "사이즈 팩터",
          "모멘텀 팩터"
    ],
    answerIndex: 1,
    explanation: "고위험일수록 고수익이라는 전통 금융 이론을 뒤집고, 덜 출렁이는 주식이 복리 효과로 장기 승리한다는 경험적 팩터입니다.",
  },
  {
    id: "lv4-043",
    level: 4,
    category: "파생 그리스",
    keyword: "참",
    question: "시간 경과(만기 접근)에 따라 델타(Delta)가 변하는 속도를 나타내는 옵션의 3차 그리스 지표는?",
    options: [
          "보마",
          "세타",
          "참",
          "바나"
    ],
    answerIndex: 2,
    explanation: "Charm은 0DTE(당일만기 옵션) 매매 및 주말 오버나이트 델타 헤지 포지션 관리 시 전문 트레이더들이 점검하는 지표입니다.",
  },
  {
    id: "lv4-044",
    level: 4,
    category: "파생 지표",
    keyword: "내재변동성",
    question: "과거 주가 데이터로 계산한 역사적 변동성이 아니라, 현재 거래되는 옵션 시장 가격에 녹아있는 미래 주가 변동에 대한 시장의 기대치는?",
    options: [
          "표준편차",
          "역사적 변동성",
          "실현변동성",
          "내재변동성"
    ],
    answerIndex: 3,
    explanation: "IV는 옵션 매수자와 매도자의 수급에 의해 실시간 결정되며, VIX 지수를 산출하는 기초 데이터입니다.",
  },
  {
    id: "lv4-045",
    level: 4,
    category: "채권 구조",
    keyword: "코코본드",
    question: "발행 은행이 심각한 부실 위기에 빠져 자본 비율이 기준치 밑으로 떨어지면 원금이 강제로 상각되거나 주식으로 강제 전환되는 후순위 채권은?",
    options: [
          "코코본드",
          "전환사채",
          "담보부채권",
          "국채"
    ],
    answerIndex: 0,
    explanation: "2023년 크레디트스위스(CS) 파산 사태 당시 약 22조 원 규모의 AT1 코코본드가 전액 0원으로 휴지조각 상각되었습니다.",
  },
  {
    id: "lv4-046",
    level: 4,
    category: "기업 가치",
    keyword: "토빈의 Q",
    question: "기업의 주식시장 평가 시가총액과 부채의 합을 기업 자산의 실질 대체원가(재취득비용)로 나눈 비율은?",
    options: [
          "PBR",
          "토빈의 Q",
          "PER",
          "EV/IC"
    ],
    answerIndex: 1,
    explanation: "Q 비율이 1보다 크면 기업의 자산 대비 시장 가치가 고평가되어 기업이 설비 투자를 늘릴 유인이 커집니다.",
  },
  {
    id: "lv4-047",
    level: 4,
    category: "포트폴리오 공학",
    keyword: "효율적 투자선",
    question: "동일한 기대수익률에서 위험(분산)을 최소화하거나, 동일한 위험 수준에서 기대수익률을 극대화하는 최적 포트폴리오들의 집합 곡선은?",
    options: [
          "자본시장선",
          "증권시장선",
          "효율적 투자선",
          "무차별곡선"
    ],
    answerIndex: 2,
    explanation: "해리 마코위츠의 현대 포트폴리오 이론(MPT)의 핵심 산출물입니다.",
  },
  {
    id: "lv4-048",
    level: 4,
    category: "자산 배분",
    keyword: "블랙-리터만 모형",
    question: "마코위츠 모형의 극단적인 비중 쏠림 단점을 해결하기 위해, 시장 균형 수익률에 투자자의 주관적인 시장 전망(View)을 베이지안 통계로 결합한 최적 배분 모형은?",
    options: [
          "몬테카를로",
          "CAPM",
          "APT",
          "블랙-리터만 모형"
    ],
    answerIndex: 3,
    explanation: "골드만삭스의 피셔 블랙과 로버트 리터만이 개발하여 글로벌 대형 IB와 국부펀드에서 실무 표준으로 사용하는 배분 모형입니다.",
  },
  {
    id: "lv4-049",
    level: 4,
    category: "배당 정책",
    keyword: "모딜리아니-밀러 정리",
    question: "완전 자본 시장과 세금이 없는 세상에서는 기업의 배당 정책이나 부채 비율이 기업의 본질적 총가치에 아무런 영향을 주지 못한다는 금융 이론은?",
    options: [
          "MM 정리",
          "효율적 시장 가설",
          "대리인 이론",
          "랜덤워크 이론"
    ],
    answerIndex: 0,
    explanation: "피자를 어떻게 쪼개든(배당이든 유보이든) 피자의 전체 크기는 변하지 않는다는 유명한 기업재무 무차별 정리입니다.",
  },
  {
    id: "lv4-050",
    level: 4,
    category: "시장 이론",
    keyword: "효율적 시장 가설",
    question: "주식 시장의 모든 가용 정보는 이미 즉각 주가에 100% 투명하게 반영되어 있으므로, 어떤 분석으로도 장기적으로 시장을 이길 수 없다는 가설은?",
    options: [
          "프랙탈이론",
          "EMH",
          "카오스이론",
          "행동경제학"
    ],
    answerIndex: 1,
    explanation: "유진 파마 교수가 정립한 가설로, 인덱스 펀드와 패시브 투자의 가장 강력한 철학적 기반이 되었습니다.",
  },
  {
    id: "lv4-051",
    level: 4,
    category: "이자율 이론",
    keyword: "기간 프리미엄",
    question: "장기 채권 투자자가 만기까지 긴 세월 동안 금리 변동 위험과 인플레이션 불확실성을 감수하는 대가로 단기 금리 대비 추가로 요구하는 보상 금리는?",
    options: [
          "유동성할인",
          "쿠폰스프레드",
          "기간 프리미엄",
          "신용프리미엄"
    ],
    answerIndex: 2,
    explanation: "미국 국채 10년물 금리의 급등은 연준의 기준금리 기대 외에도 기간 프리미엄의 상승에 의해 자주 촉발됩니다.",
  },
  {
    id: "lv4-052",
    level: 4,
    category: "금융 공학",
    keyword: "몬테카를로 시뮬레이션",
    question: "난수를 생성하여 수만 번의 가상 주가 경로 시뮬레이션을 반복 실행함으로써 복잡한 파생상품의 가격이나 포트폴리오 파산 확률을 추정하는 기법은?",
    options: [
          "이항모형",
          "부트스트래핑",
          "회귀분석",
          "몬테카를로 시뮬레이션"
    ],
    answerIndex: 3,
    explanation: "수학적 공식으로 닫힌 해를 구할 수 없는 경로의존형 복잡 금융상품을 평가하는 표준 수치해석 기법입니다.",
  },
  {
    id: "lv4-053",
    level: 4,
    category: "파생 그리스",
    keyword: "바나",
    question: "기초자산 주가가 변할 때 베가(변동성 민감도)가 어떻게 변하는지, 또는 변동성이 변할 때 델타가 어떻게 변하는지를 측정하는 2차 그리스는?",
    options: [
          "바나",
          "컬러",
          "볼가",
          "스피드"
    ],
    answerIndex: 0,
    explanation: "Vanna는 변동성과 주가의 교차 민감도로, 대형 옵션 만기일의 시장 수급 쏠림 현상을 분석할 때 핵심으로 쓰입니다.",
  },
  {
    id: "lv4-054",
    level: 4,
    category: "헤지펀드 전략",
    keyword: "리스크 아비트라지",
    question: "기업 인수합병(M&A) 발표 후 피인수 대상 기업 주식과 인수 주체 기업 주가 간의 스프레드를 이용해 합병 성공에 베팅하는 이벤트 드리븐 전략은?",
    options: [
          "지수차익거래",
          "합병 차익거래",
          "통계적 차익거래",
          "전환사채 차익거래"
    ],
    answerIndex: 1,
    explanation: "합병 승인 여부와 규제 당국의 독점 심사 통과 가능성을 분석하여 스프레드 차익을 거두는 전략입니다.",
  },
  {
    id: "lv4-055",
    level: 4,
    category: "기업 지배구조",
    keyword: "포이즌 필",
    question: "적대적 M&A 공격을 받을 때 기존 주주들에게 시가보다 훨씬 저렴한 가격에 대량의 신주를 살 수 있는 권리를 부여해 공격자의 지분을 희석시키는 방어책은?",
    options: [
          "백기사",
          "팩맨 방어",
          "포이즌 필",
          "황금낙하산"
    ],
    answerIndex: 2,
    explanation: "적대적 인수자에게 막대한 비용을 유발시켜 경영권 침탈을 막는 대표적인 경영권 방어 장치입니다.",
  },
  {
    id: "lv4-056",
    level: 4,
    category: "기업 지배구조",
    keyword: "백기사",
    question: "적대적 M&A 위협에 직면한 경영진이 경영권을 방어하기 위해 우호적인 제3의 기업이나 자본가를 끌어들여 지분을 인수하게 하는 것은?",
    options: [
          "흑기사",
          "기업사냥꾼",
          "그린메일러",
          "백기사"
    ],
    answerIndex: 3,
    explanation: "백기사는 경영진 편에서 우호 지분을 확보해 주어 적대적 인수합병을 좌절시키는 구원투수입니다.",
  },
  {
    id: "lv4-057",
    level: 4,
    category: "채권 공학",
    keyword: "수익률 곡선 스티프닝",
    question: "장기 금리가 단기 금리보다 더 가파르게 오르거나, 단기 금리가 장기 금리보다 더 가파르게 내려앉아 장단기 금리 격차가 벌어지는 현상은?",
    options: [
          "수익률 곡선 스티프닝",
          "시프트",
          "인버전",
          "수익률 곡선 플래트닝"
    ],
    answerIndex: 0,
    explanation: "커브 스티프닝은 통상 경기 회복 국면이나 중앙은행의 금리 인하 사이클 초기에 강력하게 나타납니다.",
  },
  {
    id: "lv4-058",
    level: 4,
    category: "채권 공학",
    keyword: "수익률 곡선 플래트닝",
    question: "장기 금리와 단기 금리의 격차가 줄어들어 수익률 곡선이 수평선에 가깝게 평평해지는 현상은?",
    options: [
          "트위스트",
          "플래트닝",
          "패리티",
          "스티프닝"
    ],
    answerIndex: 1,
    explanation: "커브 플래트닝은 중앙은행의 긴축으로 단기 금리가 오르고 경기 둔화 우려로 장기 금리가 눌릴 때 발생합니다.",
  },
  {
    id: "lv4-059",
    level: 4,
    category: "구조화 금융",
    keyword: "CDO",
    question: "주택담보대출(MBS), 회사채, 대출 채권 등 수천 개의 채권을 한데 묶은 뒤 위험도에 따라 트렌치(트랑슈)로 쪼개어 재발행한 부채담보부증권은?",
    options: [
          "CDS",
          "ABCP",
          "CDO",
          "ELS"
    ],
    answerIndex: 2,
    explanation: "2008년 글로벌 금융위기의 진원지가 된 대표적인 서브프라임 모기지 기반 구조화 파생상품입니다.",
  },
  {
    id: "lv4-060",
    level: 4,
    category: "통계 지표",
    keyword: "조건부 VaR",
    question: "VaR(최대예상손실) 한도를 초과하는 최악의 테일 리스크(꼬리 위험)가 실제로 터졌을 때 발생할 예상 손실의 평균값을 측정한 기대 숏폴 지표는?",
    options: [
          "소르티노",
          "상대VaR",
          "한계VaR",
          "CVaR"
    ],
    answerIndex: 3,
    explanation: "바젤 III 등 최신 글로벌 금융 규제에서 VaR의 한계를 보완하기 위해 공식 채택한 극단 위기 리스크 척도입니다.",
  },
  {
    id: "lv4-061",
    level: 4,
    category: "특수 사채",
    keyword: "전환사채 (CB)",
    question: "보유하고 있는 동안에는 이자를 받다가, 일정 기간 후 미리 정해진 가격(전환가액)으로 주식으로 바꿀 수 있는 권리가 붙은 회사채는?",
    options: [
          "전환사채",
          "신주인수권부사채",
          "교환사채",
          "후순위채"
    ],
    answerIndex: 0,
    explanation: "CB(전환사채)는 채권의 안전성과 주식 상승 시의 차익을 동시에 노릴 수 있는 메자닌 증권입니다.",
  },
  {
    id: "lv4-062",
    level: 4,
    category: "특수 사채",
    keyword: "리픽싱 (Refixing)",
    question: "전환사채(CB) 발행 후 주가가 하락하면 투자자를 보호하기 위해 주식 전환 가격을 낮추어 주식 수를 늘려주는 조항은?",
    options: [
          "풋옵션",
          "리픽싱",
          "콜옵션",
          "오버행"
    ],
    answerIndex: 1,
    explanation: "리픽싱 조항은 채권자에게 유리하지만, 전환 주식 수가 대폭 늘어나 기존 일반 주주들의 지분 가치가 희석되는 악재가 됩니다.",
  },
  {
    id: "lv4-063",
    level: 4,
    category: "특수 사채",
    keyword: "신주인수권부사채 (BW)",
    question: "채권 자체는 그대로 유지되면서, 회사의 신주를 정해진 가격에 추가로 인수할 수 있는 별도의 권리증서(워런트)가 붙은 채권은?",
    options: [
          "전환사채",
          "교환사채",
          "신주인수권부사채",
          "영구채"
    ],
    answerIndex: 2,
    explanation: "BW는 채권과 신주인수권이 결합된 상품으로, 워런트만 떼어내서 별도로 시장에서 매매할 수도 있습니다.",
  },
  {
    id: "lv4-064",
    level: 4,
    category: "특수 사채",
    keyword: "교환사채 (EB)",
    question: "채권 보유자가 원할 때 회사가 신주를 새로 찍어주는 것이 아니라, 회사가 이미 보유하고 있는 '자사주나 타사 상장 주식'으로 교환해주는 채권은?",
    options: [
          "전환사채",
          "후순위채",
          "신주인수권부사채",
          "교환사채"
    ],
    answerIndex: 3,
    explanation: "EB는 신주를 발행하지 않고 회사가 가진 기존 주식으로 교환해주므로 신주 발행에 따른 지분 희석이 발생하지 않습니다.",
  },
  {
    id: "lv4-065",
    level: 4,
    category: "특수 사채",
    keyword: "후순위채권",
    question: "기업이 파산했을 때 일반 채권자들에게 빚을 다 갚은 후 가장 나중에 변제받는 대신, 상대적으로 높은 금리를 주는 채권은?",
    options: [
          "후순위채권",
          "선순위채권",
          "담보부사채",
          "국채"
    ],
    answerIndex: 0,
    explanation: "후순위채권은 변제 순위가 주식 바로 앞 수준으로 낮아 부도 위험이 크지만 고금리를 제공하며 은행의 자본 확충에 쓰입니다.",
  },
  {
    id: "lv4-066",
    level: 4,
    category: "특수 사채",
    keyword: "영구채 (신종자본증권)",
    question: "만기가 없거나 30년 이상으로 매우 길어 회계상 부채(빚)가 아닌 '자기자본'으로 인정받는 하이브리드 금융상품은?",
    options: [
          "단기사채",
          "영구채",
          "일반 회사채",
          "전환사채"
    ],
    answerIndex: 1,
    explanation: "영구채는 만기 연장이 무제한 가능하여 발행 기업이 부채비율을 낮추고 자본을 확충하기 위해 활용합니다.",
  },
  {
    id: "lv4-067",
    level: 4,
    category: "채권 수학",
    keyword: "채권 듀레이션 (Duration)",
    question: "채권 투자 시 원금과 이자를 회수하는 데 걸리는 평균 시간으로, '금리 1% 변동 시 채권 가격이 몇 % 변하는지'를 측정하는 지표는?",
    options: [
          "만기",
          "볼록성",
          "듀레이션",
          "수익률"
    ],
    answerIndex: 2,
    explanation: "듀레이션이 긴 장기 채권일수록 금리가 오르내릴 때 채권 가격의 변동 폭이 극심해집니다.",
  },
  {
    id: "lv4-068",
    level: 4,
    category: "채권 수학",
    keyword: "볼록성 (Convexity)",
    question: "금리 변동에 따른 채권 가격의 곡선 형태 변화를 측정하여, 듀레이션이 미처 반영하지 못하는 가격 왜곡을 보정해주는 지표는?",
    options: [
          "감마",
          "베타",
          "알파",
          "볼록성"
    ],
    answerIndex: 3,
    explanation: "볼록성은 금리가 크게 오르내릴 때 채권 가격의 비선형적인 곡선 반응을 정밀하게 측정하는 고급 채권 지표입니다.",
  },
  {
    id: "lv4-069",
    level: 4,
    category: "신용 분석",
    keyword: "크레딧 스프레드",
    question: "민간 기업이 발행한 회사채 금리와 안전한 국고채 금리 사이의 격차로, 기업들의 부도 위험과 자금시장 경색을 나타내는 지표는?",
    options: [
          "크레딧 스프레드",
          "장단기 금리차",
          "예대마진",
          "차익거래"
    ],
    answerIndex: 0,
    explanation: "크레딧 스프레드가 벌어진다는 것은 시장이 기업들의 부도 위험을 높게 보아 회사채를 기피하고 국채로 도망치고 있음을 뜻합니다.",
  },
  {
    id: "lv4-070",
    level: 4,
    category: "신용 파생",
    keyword: "신용부도스왑 (CDS)",
    question: "채권을 발행한 기업이나 국가가 부도날 위험만을 떼어내서 거래하는 파생상품으로, 일종의 '부도 대비 보험' 성격을 띤 금융상품은?",
    options: [
          "금리 스왑",
          "신용부도스왑",
          "선물환",
          "주가지수선물"
    ],
    answerIndex: 1,
    explanation: "CDS(Credit Default Swap)는 채권 부도 위험을 전가하기 위한 파생상품으로, CDS 프리미엄이 급등하면 국가/기업 부도 위험이 커진 것입니다.",
  },
  {
    id: "lv4-071",
    level: 4,
    category: "파생 전략",
    keyword: "커버드콜 전략",
    question: "기초자산 주식을 보유하면서 동시에 '콜옵션(살 권리)을 매도'하여, 주가 상승분을 일부 포기하는 대신 월배당 프리미엄을 챙기는 전략은?",
    options: [
          "롱숏 전략",
          "네이키드 풋",
          "커버드콜",
          "스트래들 전략"
    ],
    answerIndex: 2,
    explanation: "커버드콜은 횡보장에서 높은 월배당을 안정적으로 챙길 수 있지만, 주가 급등 시 상승 수익이 제한되는 '상방 막힘' 구조를 가집니다.",
  },
  {
    id: "lv4-072",
    level: 4,
    category: "파생 전략",
    keyword: "커버드콜 상방 막힘",
    question: "커버드콜 ETF의 구조적 치명적 단점으로, 기초자산 주가가 100% 폭등해도 콜옵션 매도로 인해 상승 수익을 온전히 누리지 못하는 현상은?",
    options: [
          "하방 지지",
          "음의 복리",
          "롤오버 손실",
          "상방 제한"
    ],
    answerIndex: 3,
    explanation: "커버드콜은 하락할 때는 주가 하락을 거의 다 맞으면서 상승할 때는 옵션 행사가격 이상의 초과 수익을 모두 포기해야 하는 비대칭 구조입니다.",
  },
  {
    id: "lv4-073",
    level: 4,
    category: "옵션 기초",
    keyword: "콜옵션 (Call Option)",
    question: "정해진 만기일에 특정 자산(주식)을 미리 약속한 가격(행사가격)으로 '살 수 있는 권리'를 무엇이라 할까요?",
    options: [
          "콜옵션",
          "풋옵션",
          "선물환",
          "스왑"
    ],
    answerIndex: 0,
    explanation: "콜옵션 매수자는 기초자산 가격이 행사가격 이상으로 폭등할 때 무제한의 수익을 얻을 수 있는 권리를 가집니다.",
  },
  {
    id: "lv4-074",
    level: 4,
    category: "옵션 기초",
    keyword: "풋옵션 (Put Option)",
    question: "정해진 만기일에 특정 자산(주식)을 미리 약속한 가격(행사가격)으로 '팔 수 있는 권리'를 무엇이라 할까요?",
    options: [
          "콜옵션",
          "풋옵션",
          "워런트",
          "CB"
    ],
    answerIndex: 1,
    explanation: "풋옵션 매수자는 기초자산 가격이 폭락할수록 큰 수익을 얻거나 보유 주식의 하락 손실을 방어(헷지)할 수 있습니다.",
  },
  {
    id: "lv4-075",
    level: 4,
    category: "옵션 기초",
    keyword: "옵션 프리미엄",
    question: "옵션 매수자가 살 권리(콜)나 팔 권리(풋)를 획득하기 위해 옵션 매도자에게 지불하는 일종의 '권리금(보험료)'은?",
    options: [
          "행사가격",
          "증거금",
          "옵션 프리미엄",
          "정산금"
    ],
    answerIndex: 2,
    explanation: "옵션 프리미엄은 옵션 권리의 시장 가격으로, 내재가치와 시간가치로 구성됩니다.",
  },
  {
    id: "lv4-076",
    level: 4,
    category: "옵션 가격",
    keyword: "시간가치 (Time Value)",
    question: "옵션 만기일까지 남은 기간 동안 주가가 유리하게 움직일 수 있다는 기대감의 가치로, 만기가 다가올수록 점차 0으로 녹아내리는 가치는?",
    options: [
          "내재가치",
          "장부가치",
          "청산가치",
          "시간가치"
    ],
    answerIndex: 3,
    explanation: "옵션 매수자는 만기가 다가올수록 매일 시간가치가 소멸되는 '시간가치 하락(Time Decay)'의 불리함을 안고 싸워야 합니다.",
  },
  {
    id: "lv4-077",
    level: 4,
    category: "공매도 메커니즘",
    keyword: "숏스퀴즈 (Short Squeeze)",
    question: "주가 하락에 베팅한 공매도 세력이 예상치 못한 주가 급등으로 막대한 손실을 보자, 손실을 막기 위해 패닉 바잉하며 주가가 폭등하는 현상은?",
    options: [
          "숏스퀴즈",
          "숏커버링",
          "패닉셀",
          "마진콜"
    ],
    answerIndex: 0,
    explanation: "숏스퀴즈는 게임스탑(GME) 사태처럼 공매도 세력의 강제 청산 매수세가 몰리며 주가가 단기간에 수백% 폭등하는 현상입니다.",
  },
  {
    id: "lv4-078",
    level: 4,
    category: "공매도 메커니즘",
    keyword: "숏커버링 (Short Covering)",
    question: "공매도를 친 투자자가 이익을 실현하거나 손실을 줄이기 위해 시장에서 주식을 다시 사들여 빌린 주식을 갚는 행위는?",
    options: [
          "롤오버",
          "숏커버링",
          "차익거래",
          "대차거래"
    ],
    answerIndex: 1,
    explanation: "숏커버링은 공매도 포지션을 종료하는 환매수 주문으로, 주가 하락을 멈추고 일시적 반등을 일으키는 원인이 됩니다.",
  },
  {
    id: "lv4-079",
    level: 4,
    category: "공매도 규제",
    keyword: "무차입 공매도",
    question: "실제로 주식을 빌려놓지도 않은 상태에서 주식을 파는 불법 공매도 행위로, 한국 자본시장법상 엄격히 금지된 것은?",
    options: [
          "차입 공매도",
          "대차거래",
          "무차입 공매도",
          "신용융자"
    ],
    answerIndex: 2,
    explanation: "무차입 공매도는 결제 불이행 위험과 시장 교란을 일으키므로 형사처벌 대상인 중대 불법 금융 범죄입니다.",
  },
  {
    id: "lv4-080",
    level: 4,
    category: "레버리지 위험",
    keyword: "볼러틸리티 드래그 (음의 복리)",
    question: "2배 레버리지나 인버스 ETF를 횡보장이나 변동성 장세에서 장기 보유할 때, 지수가 제자리로 돌아와도 계좌가 지속적으로 녹아내리는 현상은?",
    options: [
          "양의 복리",
          "배당 락",
          "롤오버 이익",
          "음의 복리 효과"
    ],
    answerIndex: 3,
    explanation: "레버리지 ETF는 일간 수익률을 추종하므로, 주가가 오르내리며 횡보할 때 복리 역효과로 인해 원금이 갉아먹히게 됩니다.",
  },
  {
    id: "lv4-081",
    level: 4,
    category: "모멘텀 지표",
    keyword: "스토캐스틱",
    question: "최근 일정 기간(예: 14일) 동안 형성된 최고가와 최저가 범위 내에서 현재 주가가 어디쯤 위치하는지를 0~100%로 나타낸 오실레이터 지표는?",
    options: [
          "스토캐스틱",
          "MACD",
          "일목균형표",
          "볼린저밴드"
    ],
    answerIndex: 0,
    explanation: "스토캐스틱은 주가가 단기 박스권 고점(80% 이상 과매수)이나 저점(20% 이하 과매도)에 도달했을 때 빠른 매매 타이밍을 포착하는 지표입니다.",
  },
  {
    id: "lv4-082",
    level: 4,
    category: "보조지표",
    keyword: "RSI (상대강도지수)",
    question: "일정 기간 동안 주가의 상승폭과 하락폭의 상대적 강도를 백분율(0~100)로 나타내어, 보통 70 이상을 과매수, 30 이하를 과매도로 보는 지표는?",
    options: [
          "MACD",
          "RSI",
          "볼린저밴드",
          "CCI"
    ],
    answerIndex: 1,
    explanation: "RSI는 단기적으로 주가가 과열되었는지(70 이상) 침체되었는지(30 이하)를 판단하는 가장 대표적인 모멘텀 오실레이터입니다.",
  },
  {
    id: "lv4-083",
    level: 4,
    category: "보조지표",
    keyword: "RSI 다이버전스",
    question: "주가는 전고점을 뚫고 신고가를 쓰는데 RSI 보조지표의 고점은 오히려 낮아지며 강력한 추세 하락 반전을 예고하는 시그널은?",
    options: [
          "골든크로스",
          "데드크로스",
          "RSI 약세 다이버전스",
          "볼린저 수축"
    ],
    answerIndex: 2,
    explanation: "다이버전스(주가와 지표의 불일치)는 주가의 상승 탄력이 약화되고 있음을 경고하는 강력한 추세 반전 신호입니다.",
  },
  {
    id: "lv4-084",
    level: 4,
    category: "거래량 지표",
    keyword: "OBV (거래량 누적)",
    question: "주가가 상승한 날의 거래량은 누적해서 더하고 하락한 날의 거래량은 빼서, 세력의 매집과 분산(이탈)을 추적하는 대표적인 거래량 지표는?",
    options: [
          "RSI",
          "MACD",
          "볼린저 밴드",
          "OBV"
    ],
    answerIndex: 3,
    explanation: "OBV는 \"주가는 속일 수 있어도 거래량은 속일 수 없다\"는 원리에 기반하여 주가 변동 전 선행하는 자금의 유출입을 포착합니다.",
  },
  {
    id: "lv4-085",
    level: 4,
    category: "보조지표",
    keyword: "일목균형표 구름대",
    question: "선행스팬1과 선행스팬2 사이의 공간으로, 주가가 이 구름대 위에 있으면 강한 지지력의 상승세, 아래에 있으면 저항의 하락세로 보는 지표는?",
    options: [
          "일목균형표 구름대",
          "볼린저 밴드",
          "엔벨로프",
          "파라볼릭 SAR"
    ],
    answerIndex: 0,
    explanation: "일목균형표의 구름대는 시각적으로 매물대와 지지/저항 구간을 명확히 보여주는 독창적인 동양적 차트 분석 도구입니다.",
  },
  {
    id: "lv4-086",
    level: 4,
    category: "포트폴리오 지표",
    keyword: "베타 (Beta) 계수",
    question: "시장 전체 지수(코스피나 S&P500)가 1% 움직일 때 개별 주식이 몇 % 변동하는지 민감도를 나타내는 지표는?",
    options: [
          "알파",
          "베타",
          "샤프지수",
          "MDD"
    ],
    answerIndex: 1,
    explanation: "베타가 1.5인 종목은 시장이 1% 오를 때 1.5% 오르고 1% 내릴 때 1.5% 떨어지는 고변동성 종목입니다.",
  },
  {
    id: "lv4-087",
    level: 4,
    category: "포트폴리오 지표",
    keyword: "알파 (Alpha) 값",
    question: "시장 전체의 움직임(베타)을 뛰어넘어 펀드매니저의 탁월한 종목 선정과 운용 능력으로 창출해 낸 '초과 수익률'은?",
    options: [
          "베타",
          "감마",
          "알파",
          "세타"
    ],
    answerIndex: 2,
    explanation: "알파는 시장 평균 수익률을 초과하여 창출한 순수 실력 기반의 프리미엄 수익률을 의미합니다.",
  },
  {
    id: "lv4-088",
    level: 4,
    category: "포트폴리오 지표",
    keyword: "샤프 지수 (Sharpe Ratio)",
    question: "무위험 수익률(예금 금리)을 초과한 수익률을 포트폴리오의 변동성(위험)으로 나눈 값으로, '위험 대비 보상 비율'을 뜻하는 것은?",
    options: [
          "정보비율",
          "베타",
          "소르티노 지수",
          "샤프 지수"
    ],
    answerIndex: 3,
    explanation: "샤프 지수는 감수한 위험 1단위당 얼마의 초과 수익을 얻었는지 평가하며, 높을수록 효율적인 펀드입니다.",
  },
  {
    id: "lv4-089",
    level: 4,
    category: "위험 관리",
    keyword: "MDD (최대 낙폭)",
    question: "특정 투자 기간 동안 계좌 잔고가 최고점에서 최저점까지 떨어졌을 때 기록한 가장 뼈아픈 '최대 하락률'은?",
    options: [
          "MDD",
          "변동성",
          "손실률",
          "VaR"
    ],
    answerIndex: 0,
    explanation: "MDD는 투자자가 겪을 수 있는 최악의 고통 크기를 나타내며, 퀀트 투자와 자산 배분에서 멘탈을 지키기 위한 핵심 관리 지표입니다.",
  },
  {
    id: "lv4-090",
    level: 4,
    category: "위험 관리",
    keyword: "VaR (Value at Risk)",
    question: "정상적인 시장 조건에서 특정 신뢰수준(예: 99%) 하에 일정 기간(예: 1일, 10일) 동안 발생할 수 있는 '최대 예상 손실 금액'은?",
    options: [
          "MDD",
          "VaR",
          "스트레스 테스트",
          "베타"
    ],
    answerIndex: 1,
    explanation: "VaR는 금융기관과 헤지펀드가 보유 자산의 리스크 한도를 통제하기 위해 일상적으로 사용하는 위험 측정 모델입니다.",
  },
  {
    id: "lv4-091",
    level: 4,
    category: "만기 이벤트",
    keyword: "네 마녀의 날 (쿼드러플 위칭데이)",
    question: "주가지수 선물·옵션과 개별주식 선물·옵션의 만기일이 동시에 겹쳐 증시 변동성이 극도로 폭발하는 3·6·9·12월 둘째 목요일은?",
    options: [
          "블랙 먼데이",
          "옵션 만기일",
          "네 마녀의 날",
          "배당락일"
    ],
    answerIndex: 2,
    explanation: "네 마녀의 날에는 파생상품 만기 정산을 위한 막대한 프로그램 차익 매물이 쏟아지며 장 마감 직전 주가가 요동칩니다.",
  },
  {
    id: "lv4-092",
    level: 4,
    category: "매매 기법",
    keyword: "롱숏 전략 (Long-Short)",
    question: "상승할 우량 종목은 사고(Long), 하락할 고평가 종목은 공매도(Short)하여 시장 전체 방향성과 무관하게 절대 수익을 추구하는 헤지펀드 전략은?",
    options: [
          "모멘텀 전략",
          "차익거래",
          "커버드콜",
          "롱숏 전략"
    ],
    answerIndex: 3,
    explanation: "롱숏 전략은 시장이 폭락해도 좋은 종목이 나쁜 종목보다 덜 떨어지면 수익을 내는 시장 중립형 헤지 전략입니다.",
  },
  {
    id: "lv4-093",
    level: 4,
    category: "퀀트 투자",
    keyword: "팩터 투자 (Factor Investing)",
    question: "가치(Value), 소형주(Size), 모멘텀(Momentum), 퀄리티(Quality), 저변동성(Low Vol) 등 통계적으로 검증된 초과수익 유발 요인에 분산 투자하는 기법은?",
    options: [
          "팩터 투자",
          "차트 매매",
          "단타 매매",
          "풍문 매매"
    ],
    answerIndex: 0,
    explanation: "팩터 투자는 감정을 배제하고 역사적 통계와 재무 데이터 팩터를 조합하여 시장을 초과하는 퀀트 투자 방식입니다.",
  },
  {
    id: "lv4-094",
    level: 4,
    category: "파생 거래",
    keyword: "미결제약정 (Open Interest)",
    question: "선물이나 옵션 시장에서 매수/매도 계약이 체결된 후 아직 반대매매나 만기 청산으로 정리되지 않고 시장에 살아있는 총 계약 수는?",
    options: [
          "거래량",
          "미결제약정",
          "예탁금",
          "증거금"
    ],
    answerIndex: 1,
    explanation: "미결제약정이 늘어나면서 주가가 오르면 새로운 자금이 유입되는 강력한 추세 상승을 나타냅니다.",
  },
  {
    id: "lv4-095",
    level: 4,
    category: "파생 거래",
    keyword: "베이시스 (Basis)",
    question: "선물 가격과 현물 가격 사이의 차이(선물가격 - 현물가격)로, 프로그램 차익 거래의 기준이 되는 지표는?",
    options: [
          "스프레드",
          "괴리율",
          "베이시스",
          "프리미엄"
    ],
    answerIndex: 2,
    explanation: "베이시스가 양수(+)인 콘탱고(Contango)와 음수(-)인 백워데이션(Backwardation)을 통해 시장의 심리를 파악합니다.",
  },
  {
    id: "lv4-096",
    level: 4,
    category: "파생 거래",
    keyword: "콘탱고 (Contango)",
    question: "선물 만기까지의 보관비용과 이자비용으로 인해 통상 선물 가격이 현물 주가보다 더 높게 형성되어 있는 정상적인 시장 상태는?",
    options: [
          "백워데이션",
          "오버행",
          "디커플링",
          "콘탱고"
    ],
    answerIndex: 3,
    explanation: "콘탱고 상태에서는 선물 롤오버 시 비싼 차기월물로 갈아타야 하므로 원자재 ETF 등에 롤오버 비용 손실이 발생합니다.",
  },
  {
    id: "lv4-097",
    level: 4,
    category: "파생 거래",
    keyword: "백워데이션 (Backwardation)",
    question: "현물 공급 부족이나 시장 불안으로 인해 일시적으로 현물 가격이 선물 가격보다 더 비싸지는 비정상적인 역전 상태는?",
    options: [
          "백워데이션",
          "콘탱고",
          "오버슈팅",
          "언더슈팅"
    ],
    answerIndex: 0,
    explanation: "백워데이션은 당장 현물을 확보하려는 수요가 폭발할 때 발생하며, 원자재 시장에서 강한 현물 강세를 의미합니다.",
  },
  {
    id: "lv4-098",
    level: 4,
    category: "채권 위험",
    keyword: "콜러블 채권 (Callable Bond)",
    question: "발행 기업이 금리가 하락했을 때 만기 전에 채권을 조기 상환해버릴 수 있는 권리를 가진 채권은?",
    options: [
          "풋터블 채권",
          "콜러블 채권",
          "영구채",
          "물가연동채"
    ],
    answerIndex: 1,
    explanation: "콜러블 채권은 발행자에게 조기상환 권리가 있어 투자자는 금리 하락 시 추가 자본차익 기회를 조기에 박탈당할 수 있습니다.",
  },
  {
    id: "lv4-099",
    level: 4,
    category: "물가 연동",
    keyword: "TIPS (물가연동국채)",
    question: "물가(CPI)가 상승하면 채권의 원금 자체가 물가상승률만큼 불어나서 이자와 원금이 함께 증가하는 인플레이션 방어용 미국 국채는?",
    options: [
          "하이일드채",
          "무쿠폰채",
          "TIPS",
          "전환사채"
    ],
    answerIndex: 2,
    explanation: "TIPS(Treasury Inflation-Protected Securities)는 인플레이션으로 인한 화폐 가치 하락을 원금 증액으로 완벽히 방어해 주는 채권입니다.",
  },
  {
    id: "lv4-100",
    level: 4,
    category: "기업 지배구조",
    keyword: "스튜어드십 코드",
    question: "국민연금 등 대형 기관 투자자가 남의 돈을 맡아 관리하는 집사(Steward)처럼 주주 가치와 기업 성장을 위해 충실히 의결권을 행사하고 경영에 관여하는 행동 지침은?",
    options: [
          "컴플라이언스",
          "ESG 가이드라인",
          "내부통제기준",
          "스튜어드십 코드"
    ],
    answerIndex: 3,
    explanation: "스튜어드십 코드는 기관 투자자가 단순히 주식을 쥐고 있는 데 그치지 않고 경영진을 감시하고 주주 권익을 지키도록 유도하는 원칙입니다.",
  },
];
