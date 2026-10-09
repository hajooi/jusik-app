# Project Name: jusik.app (Minimal Stock Learning Platform)

## 0. Strict Agent Workflow & GitHub Directives (작업 원칙)
- **CRITICAL: Explicit User Approval Before Code Edit (사전 승인 필수 & 독단적 코드 수정 엄격 금지)**:
  - UI/UX, 문구, 레이아웃, 기능 등 **모든 코드 수정 전 반드시 수정 계획을 사용자에게 제시하고 명시적 컨펌을 받은 뒤 진행**.
- **Visual Planning with Mermaid Diagram**:
  - 플랜 작성 시 `implementation_plan.md`에 **Mermaid 다이어그램**을 포함하여 시각적 구조를 직관적으로 전달.
- **No Automatic GitHub Pushes**:
  - 사용자가 명시적으로 지시할 때만 `git push` 실행 (자동 커밋/푸시 100% 금지).
- **Zero Secret Exposure & Strict Environment Variable Policy (비밀값/토큰 하드코딩 절대 금지 및 상시 보안 점검)**:
  - 텔레그램 봇 토큰, Supabase 키, Gemini/FRED/BOK API 키, DB 자격증명 등 모든 비밀값(Secrets)은 코드 파일(`*.ts`, `*.tsx`, `*.py`, `*.yml`, `*.json` 등 Git 추적 대상 파일)에 절대로 직접 문자열로 적거나 기본 폴백값(fallback)으로 포함하지 않음 (100% 금지).
  - 비밀값은 오직 `.env.local` (로컬 전용, `.gitignore` 필수), **Vercel Environment Variables**, **GitHub Actions Repository Secrets**를 통해서만 안전하게 주입받도록 구현.
  - 모든 커밋(`git commit`) 및 푸시(`git push`) 전에는 반드시 `git diff`를 정밀 검토하여 시크릿 또는 토큰 패턴(`[0-9]{9,10}:[a-zA-Z0-9_-]{35}`, `AIza`, `sk-`, `sb_secret` 등)이 우발적으로 포함되지 않았는지 상시 점검 완료 후 진행.
- **Loop Engineering & Continuous Verification (루프 엔지니어링 및 자동 검증 의무화)**:
  - 모든 코드 수정 후 사용자에게 완료를 보고하기 전 반드시 루프 엔지니어링 검증(`npm run verify` 또는 `python3 scripts/verify_loop.py`)을 통과해야 함.
  - `.agents/hooks.json`의 `Stop` 훅이 연동되어 있어 보안 누출, 도메인 금지어(매수/매도/주가/시가총액/수관형사), TypeScript 타입 오류 발견 시 시스템이 작업 종료를 강제 차단하고 에이전트가 통과할 때까지 자율 자가 수정(Self-Correction)을 수행함.
  - 배포 및 프로덕션 빌드 전에는 `npm run verify:full`로 37개 전체 라우트 빌드 무결성을 최종 검증.
- **100% Transparent Change Sharing (코드 변경 시 모든 수정 내용 전수 보고 의무화)**:
  - 어떤 파일이든 수정 완료 후에는 변경된 모든 파일 목록과 '수정 전 ➔ 수정 후' 세부 내용을 빠짐없이 사용자에게 100% 투명하게 공유해야 함.
  - 실제 증권사 앱(MTS) 모션 실습 화면(`StockTradeMotionSimulator.tsx` 등)이나 퀴즈 데이터(`termsQuizData.ts` 등) 맥락상 '매수/매도'가 필요한 고유 콘텐츠는 절대 임의로 변경하지 않음.
- **Autonomous Dev Server Lifecycle**:
  - 개발 서버 종료/오류/HMR 충돌 발생 시 사용자가 요청하기 전에 자율적으로 확인 및 즉시 재시작.

## 1. Project Stack & Identity
- **Tech Stack**: Next.js (App Router), Tailwind CSS, Lucide React (`lucide-react`), PWA
- **Brand Name**: jusik.app (주식앱)
- **Primary Slogan**: "주식 초보를 위한 가장 쉬운 설명서"
- **Main Structure**:
  1. 커리큘럼 (`/`): 단계별 주식 강좌 아카이브 (동적 모듈 블록 구조)
  2. 투자도구 (`/tools`): 투자 성향 진단, 백테스터 & 복리 시뮬레이터 등 인터랙티브 실습 도구
  3. 댓글 & 관리자: `CommentSection`, `AdminModal`

## 2. Terminology & Easy Tone Rule (쉬운 용어 원칙)
초등학생/입문자도 이해할 수 있는 쉬운 우리말 사용:
- **매수 ➔ '주식 구매' 또는 '구매'** (매수 용어 사용 금지)
- **매도 ➔ '주식 판매' 또는 '팔기'** (매도 용어 사용 금지)
- **주가 ➔ '주식 가격' 또는 '가격' 또는 문맥에 따라 생략** ('주가' 용어 사용 절대 금지)
- **시가총액 ➔ '회사 규모' 또는 '회사 몸값'** ('시가총액' 용어 사용 절대 금지)
- **FOMO ➔ '나만 빠질까 봐 생기는 조급함'** (금융 약어 풀어서 기재)

## 3. UI/UX Rules & Motion Standards
- **Unified Design Tokens & CSS Variables**:
  - 하드코딩 색상 금지. CSS 변수(`bg-[var(--card-surface)]/90`, `hover:bg-[var(--card-hover)]`, `border-[var(--border-color)]/90`) 사용.
  - 1px Apple식 초미세 헤어라인 테두리 + 은은한 그림자(`shadow-2xs`).
- **Ambient Orange Glow Hover Rule**:
  - 인터랙티브 카드/모듈/버튼 호버 시: `hover:border-[var(--accent-orange)]/50 hover:shadow-[0_0_18px_rgba(241,143,1,0.18)]`.
- **Floating Pill Bar (Bottom Navigation)**:
  - 데스크톱/모바일 중앙 하단 Glassmorphic 캡슐. 스크롤 다운 시 숨김(`translate-y-24 opacity-0`), 스크롤 업/끝 도달 시 복귀.
- **Dynamic Height & CLS Prevention**:
  - 상태/탭/모달 전환에 따른 높이 변화 영역은 반드시 `<SmoothHeight>` 적용하여 레이아웃 덜컹거림(CLS) 방지.
- **Apple Native 2-Token Physics Engine**:
  1. `--motion-apple-smooth: 0.55s cubic-bezier(0.2, 0.8, 0.2, 1)`: 바텀시트, 팝업 모달, 드롭다운, `SmoothHeight`
  2. `--motion-apple-snappy: 0.38s cubic-bezier(0.2, 0.8, 0.2, 1)`: 토글, 탭 인디케이터, 마이크로 컨트롤
- **No Cursor Tracking**: 과도한 마우스 추적 인터랙션 지양.

## 4. Color System (10 Signature Colors)
- **Signature Palette**:
  - `Buong Orange` (`#F18F01` - 메인 브랜드/CTA/로고)
  - `Deep Amber` (`#D97706` - 앰버/골드 보조)
  - `Fintech Emerald` (`#10B981` - 수익/정답/상승)
  - `Signal Crimson` (`#F43F5E` - 손실/오답/리스크)
  - `Pure White` (`#FFFFFF` - 카드 서피스/다크 텍스트)
  - `Snow Slate` (`#F8FAFC` - 라이트 메인 배경)
  - `Hairline Gray` (`#E2E8F0` - 1px 보더)
  - `Muted Steel` (`#64748B` - 설명/단위 라벨)
  - `Graphite Slate` (`#1E293B` - 라이트 텍스트/다크 카드)
  - `OLED Obsidian` (`#09090B` - 다크 메인 배경)
- **Modes**:
  - **Light Mode**: Snow Slate 배경 / Pure White 카드 / Graphite Slate 텍스트
  - **Dark Mode**: OLED Obsidian 배경 / Dark Slate 카드 / Snow Slate 텍스트

## 5. SEO & Dynamic Sitemap
- `src/app/sitemap.ts`: `curriculum.ts` 및 정적/동적 라우트(`/tools/type/[code]` 등) 변경 시 동적 자동 반영 유지.

## 6. Image Generation Directives (이미지 생성 지침)
1. **10색 시그니처 팔레트 연계**: 오렌지, 앰버, 옵시디언, 슬레이트 등 테마 조명/반사광 반영.
2. **미니멀리즘 & 여백(Negative Space)**: 정제된 고급 소재(매트 스톤, 앰버 글래스, 브라스 등) 위주의 미니멀 에디토리얼 구도.
3. **얼굴 노출 배제 & 한국인 인물**: 인물 필요 시 한국인/동양인으로 설정하되, 뒷모습/실루엣/오브젝트 클로즈업/아웃포커싱으로 불쾌한 골짜기 방지.

## 7. Announcement Ribbon Spec (공지 배너 표준)
- **컴포넌트 위치**: `src/components/AnnouncementRibbon.tsx` (Navbar 최상단 결합)
- **디자인 규격**:
  - 36px(h-9) 초슬림 Glassmorphic 앰버 그라디언트 띠 (`bg-gradient-to-r from-[var(--accent-orange)]/15 via-amber-500/10 to-[var(--accent-orange)]/15 border-b border-[var(--accent-orange)]/25 backdrop-blur-md`).
  - 100% Optical Absolute Centering: 텍스트 및 코드 캡슐은 화면 정중앙 배치, `X` 닫기 버튼은 우측 끝 `absolute right-2 sm:right-4` 고정.
- **문구 및 톤**:
  - `[월 한정] PRO 멤버십 무료 코드: [CODE]` (군더더기 복사 텍스트 없이 단독 캡슐)
- **인터랙션 & 세션 정책**:
  - 코드 캡슐 클릭 시 원클릭 클립보드 복사 및 `✓ CODE` 피드백.
  - `X` 닫기 시 `sessionStorage`에 기록하여 **이번 방문(세션) 동안만 숨김**, 나중에 브라우저 재실행/재접속 시 자동으로 다시 노출.

## 8. 증시 캘린더 운영 및 자동화 라이프사이클
- **타임라인 범위**: 최근 3개월 과거 실적/지표부터 향후 3개월 미래 일정까지 총 6~7개월 연속 타임라인 유지.
- **월간 롤링 (매월 말)**: 가장 오래된 지난 1개월 폐기 + 새로운 1개월 추가 (일정 슬라이딩 윈도우 유지).
- **주간 동기화 (매주 토요일 오전 07:35 KST)**:
  - 차주 및 다가오는 이벤트의 세부 일정/발표 시간/예상치 변동 사항 점검 및 동기화.
  - **S&P 500 기업 실적 (EPS) 주간 자동 점검**: 미국 금요일 장 마감 후 FactSet 최신 주간 실적 리포트(Earnings Insight) 발행 상태를 점검하여 텔레그램 주간 결산 브리핑에 기업 실적 모멘텀 및 지표 신호등 자동 보고.
- **과거~미래 양방향 탐색 UX**: '오늘' 기준점을 중심으로 위로 스크롤 시 과거 발표 결과 확인, 아래로 스크롤 시 미래 일정 확인 가능하도록 구현.

## 9. Book Quality Copywriting & Anti-AI Directives (출판 도서급 정밀 원고 및 탈(脫)AI 텍스트 지침)
- **단행본 책의 서사적 호흡 보존 (Narrative Depth)**:
  - 건조한 요약문/블로그형 토막글 지양. 독자의 삶에 맞닿은 질문 ➔ 역사적·비유적 배경 ➔ 냉철한 경제학적 현실 ➔ 주체적 자본가로의 도약으로 이어지는 **깊이 있는 단행본 에세이 서사**를 온전히 유지.
- **AI 클리셰 4대 금지 패턴 (Anti-AI Blacklist)**:
  1. **기계적 전환구 금지**: `"하지만 이 눈부신 안도감을 한 겹만 걷어내면, 그 뒤에 숨겨진 차가운 현실이 고스란히 모습을 드러냅니다"` 같은 뻔한 AI 소설식 전환구 절대 사용 금지.
  2. **감정 강요형 3중 수식어 금지**: `"잔인할 만큼 상반된"`, `"가장 가혹한 빈곤에 시달려야 했습니다"`, `"무서운 속도로 곤두박질쳤습니다"` 등 과장된 형용사/부사 중첩 배제.
  3. **번역투/피동 종결어미 배제**: `"~해야 함을 뜻합니다"`, `"~하는 셈입니다"`, `"~라 할 수 있습니다"` ➔ 자연스러운 한국어 서술어(`"~합니다"`, `"~입니다"`, `"~일 뿐입니다"`) 사용.
  4. **작위적 묘사 및 극단적 공포 클리셰 금지**: `"현대판 노예"`, `"시혜적 배급품"`, `"담담하게 내 계좌에 쓸어 담는"` 등 1차원적 자극 어휘 대신, `"경제적 주권"`, `"시스템 종속"`, `"내 계좌에 담아보는"` 등 단단하고 지적인 저자의 육성 유지.
- **용어 및 맞춤법 규격 준수**:
  - '매수' ➔ **'주식 구매' 또는 '구매'** (매수 용어 원천 금지, 2번 규칙과 연계).
  - '매도' ➔ **'주식 판매' 또는 '팔기'**.
  - '주가' ➔ **'주식 가격' 또는 '가격' 또는 생략** ('주가' 용어 원천 금지).
  - '시가총액' ➔ **'회사 규모' 또는 '회사 몸값'** ('시가총액' 용어 원천 금지).
  - **단위성 의존명사 앞 순우리말 수관형사 표기**: `3가지` ➔ **`세 가지`**, `2가지` ➔ **`두 가지`**, `4가지` ➔ **`네 가지`**, `1가지` ➔ **`한 가지`** 등 아라비아 숫자+가지 결합 절대 금지, 반드시 순우리말 수관형사(`한, 두, 세, 네, 다섯...`)로 표기.
  - `단돈 몇만 원`, `1등 기업`, `단 한 주`, `단 몇 초` 등 띄어쓰기 규정 철저 준수.

## 10. 월초 정기 루틴 및 사용자 체크리스트 선제 관리 (Monthly Routine Directives)
- **월초 선제 알림 의무 (매월 1일~3일)**:
  - 시스템 현재 날짜가 매월 1일~3일인 경우, 에이전트는 사용자의 다른 질문이나 인사에 앞서 항상 먼저 아래와 같이 능동적으로 확인하고 제안해야 함:
    - *"새로운 달이 시작되었습니다! 우리 매달 초에 하는 정기 작업(미국/한국 대표 종목 회사 규모 순위 점검, 시뮬레이터 주가·백테스트 갱신, 증시 캘린더 슬라이딩 롤링) 할 시간입니다. 이번 달 순위를 알려주시면 바로 반영하겠습니다!"*
- **월초 정기 원스톱 5대 체크리스트 (사용자 & 에이전트 상호 확인용)**:
  1. **[회사 규모(시총) 순위 최신화]**:
     - 미국 Top 20 및 한국 Top 10 순위 수령 ➔ 탈락/신규 종목 판별 및 순위 재배열.
     - `src/app/tools/simulate/page.tsx` (`ASSET_OPTIONS`), `src/data/backtestData.json` (`assets`), `scripts/update_market_data.py` (`SYMBOLS`), `scripts/update_historical_data.py` (`raw_meta`) 4개 파일 일괄 동기화.
  2. **[전월 주식 가격 마감 및 백테스트 지표 재계산 & S&P 500 EPS 점검]**:
     - `python3 scripts/update_market_data.py` 실행하여 전월 말 종가 기준 주봉·월봉 수집 (`historicalPrices.json`).
     - 50개 전체 자산의 CAGR, 연간 변동성, 이동평균선 매매 전략 지표 자동 재계산 (`backtestData.json`).
     - **S&P 500 TTM EPS 점검 (FactSet & S&P 공식 이중 파이프라인)**:
       - **분기 공식 확정월 (2월, 5월, 8월, 11월)**: S&P Dow Jones Indices 공식 분기 실적 보고서 확정치로 갱신.
       - **실적 집계 대기월 (그 외 기간, 예: 10월)**: FactSet 공식 'Earnings Insight' 주간 보고서(John Butters 부사장 공식 집계)의 500개 기업 바텀업(Bottom-Up) TTM EPS 컨센서스를 확인하여 `src/data/marketCalendar.ts` (`MACRO_SUMMARY_ITEMS`, `MACRO_ASSET_CHARTS`) 및 안내 문구 최신화. (불안정한 스크래핑 대신 공인 리포트 수치 직접 검증 반영).
  3. **[증시 캘린더 슬라이딩 윈도우 정리 (과거 -3개월)]**:
     - 오늘 기준 3개월 이전 과거 일정 자동 삭제(Pruning). (예: 10월 1일 실행 시 6월 이전 일정 폐기)
  4. **[미래 +3개월 신규 월(New Month) 공식 일정 추가 & 실적 동기화]**:
     - **공신력 있는 공식 데이터 소스 필수 원칙 (추정 데이터 등록 절대 금지)**:
       - AI가 임의로 실적 발표일이나 경제지표 일정을 '추정'하여 지어내는 행위는 엄격히 금지함.
       - **기업 실적**: 오직 **야후 파이낸스(`yfinance`) 공식 API 및 기업 공식 IR 공시**에서 확정된 발표일만 캘린더에 반영. (아직 기업이 확정 공시하지 않은 4분기 실적일은 공시될 때까지 임의 등록 금지)
       - **거시 경제지표 및 기준금리**: **미국 연준(Federal Reserve 공식 회의 캘린더)**, **한국은행(BOK ECOS)**, **미국 노동통계국(BLS)** 공식 확정 일정만 반영.
       - **증시 휴장일**: **한국거래소(KRX)** 및 **뉴욕증권거래소(NYSE)** 공식 확정 캘린더만 반영.
     - 새로 열리는 미래 3개월 차(예: 10월이면 2027년 1월)의 공식 확정 휴장일 및 FOMC 기준금리 발표 일정을 `src/data/marketCalendar.ts`에 추가.
  5. **[프로덕션 빌드 검증 및 원격 배포]**:
     - `npm run build`로 37개 전체 라우트 타입/빌드 검증 수행 ➔ 사용자 컨펌 후 Git 커밋 및 원격 푸시 (`main`).
- **월간 깃허브 크론 금지**:
  - 순위 변동 여부를 반영하지 못하고 큐 지연이 발생하는 깃허브 액션의 월간 자동 크론 스케줄은 사용하지 않으며, 매월 초 사용자와 함께 위 원스톱 파이프라인으로 정확하게 처리함.