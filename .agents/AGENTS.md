# Project Name: jusik.app (Minimal Stock Learning Platform)

## 0. Strict Agent Workflow & GitHub Directives (개발 원칙 및 작업 지침)
- **CRITICAL: Explicit User Approval Before Code Edit (독단적 코드 수정 엄격 금지 & 사전 승인 필수)**:
  - UI/UX 변경, 문구 수정, 레이아웃 변경, 기능 추가 등 **모든 코드 수정 요청에 대해 절대 즉시 코드를 변경하지 마십시오.**
  - 먼저 **수정 계획(어느 파일, 어떤 문구/구조를 어떻게 변경할 것인지)** 또는 **옵션 시안**을 사용자에게 제시하고, **사용자의 명시적인 승인/확인(컨펌)을 받은 후에만 코드를 수정**해야 합니다.
  - 이를 위반하고 사전 승인 없이 독단적으로 코드를 수정하는 행위는 엄격히 금지됩니다.
- **Visual Planning with Mermaid Diagram in Plan Artifact (작업 계획 시 Mermaid 시각 다이어그램 필수 제공)**:
  - 사용자가 작업/수정 요청을 했을 때, 단순 텍스트 나열뿐만 아니라 반드시 **`implementation_plan.md` (Artifact 플랜 뷰어)**를 생성/활용하여 **Mermaid 그래픽 다이어그램**과 함께 구조적 변경 사항을 시각적으로 제공해야 합니다.
  - 이를 통해 사용자가 IDE 패널에서 다이어그램 그림을 직관적으로 확인하고 승인(Confirm)할 수 있도록 합니다.
- **No Automatic GitHub Pushes (깃허브 자동 푸시 엄격 금지)**:
  - 사용자가 "깃허브 업데이트해", "깃허브에 올려줘" 등 **명시적으로 깃허브 푸시를 명령할 때만** `git push`를 실행합니다.
  - 임의로 작업 완료 시마다 깃허브에 자동 커밋/푸시하여 Vercel 재배포나 방화벽 차단을 일으키는 행위를 100% 엄격 금지합니다.
- **Autonomous Dev Server Lifecycle & Auto-Recovery (개발 서버 자율 관리 및 오류 시 자동 리셋 원칙)**:
  - 파일 수정, 빌드, HMR 충돌 또는 시스템 재시작으로 인해 개발자 서버가 꺼지거나 멈추거나 404 hot-update 등 오류가 발생할 경우, **사용자가 리셋을 요청하기 전에 에이전트가 자율적으로 개발 서버 상태를 확인하고 즉시 재시작/리셋**하여 항상 완벽한 로컬 테스트 환경을 유지해야 합니다.

## 1. Project Goal
도메인 `jusik.app`에 최적화된 모바일 퍼스트 에듀테크/핀테크 플랫폼 구축.
모바일 웹 및 PWA 앱 환경에 최적화된 하단 내비게이션(Bottom Navigation) 기반의 절제된 UI를 지향합니다.

## 2. Architecture & Tech Stack
- **Framework**: Next.js (App Router), Tailwind CSS
- **Design System**: Material Design 3 (M3) & iOS HIG Bottom Navigation Pattern
- **Icons**: Lucide React (`lucide-react`)
- **Features**: PWA 지원, OS 설정 기반 Auto Dark/Light Mode (10 Signature Colors), OpenGraph 동적 메타태그(카카오톡/SNS 공유 최적화)

## 3. Brand Identity & Slogan
- **Brand Name**: jusik.app
- **Primary Slogan**: "주식 초보를 위한 가장 쉬운 설명서"

## 4. Terminology & Easy Tone Rule (쉬운 어휘 및 용어 원칙)
초등학생이나 주식 초보자도 한눈에 이해할 수 있는 쉬운 용어만 사용합니다.
- **매수 ➔ '주식 구매' 또는 '구매'**: '매수'라는 전문 한자 용어를 절대 사용하지 않고 무조건 **'주식 구매'**로 표현합니다.
- **매도 ➔ '주식 판매' 또는 '팔기'**: '매도' 대신 **'주식 판매'**나 **'팔기'**로 표현합니다.
- **FOMO ➔ '나만 빠질까 봐 생기는 조급함'**: FOMO 등 영문 약어나 전문 금융 용어를 쓰지 않고 쉬운 우리말로 풀어서 작성합니다.

## 5. Main Services & Navigation Structure (주요 서비스 및 구조)
iOS/Android 모바일 UI 가이드라인에 맞춰 화면 하단에 2개의 핵심 탭을 고정 배치합니다.

1. **커리큘럼 (`/`)**: [Lv. 0 ~ Lv. 5] 정규 학습 아카이브 ("초보자도 쉽게 따라 하는 단계별 주식 강좌입니다.")
2. **투자도구 (`/tools`)**: 실습 모듈 및 인터랙티브 금융 툴 모음
   - **투자 성향 진단 (`/tools/type`, `/tools/type/[code]`)**:
     - 16가지 동물/투자 스타일 진단 설문 및 상세 리포트
     - 우세/열세 투톤 스펙트럼 게이지
     - 타 성향과의 1:1 심층 비교 모달(`ResultCompareModal`) 및 상세 아코디언(`ResultCompareAccordion`)
     - 카카오톡/SNS 맞춤형 OpenGraph 이미지 및 공유 기능
   - **포트폴리오 백테스터 & 복리 시뮬레이터 (`/tools/simulate`)**:
     - 자산 배분 전략 및 거치식/적립식 복리 수익률 계산기
     - 직관적인 복리 자산 비교 차트(`WealthComparisonChart`)
3. **댓글 및 관리자 시스템**:
   - 실시간 강의/도구 댓글 시스템(`CommentSection`), 욕설 필터링(`badWordsFilter`), 관리자 동기화 도구(`AdminModal`, `/api/sync`)

## 6. UI/UX Rules & Visual Polish
- **Floating Pill Bar (Scroll-to-Hide Navigation)**:
  - 데스크톱/모바일 공통 화면 중앙 하단에 부유하는 Glassmorphic Capsule (`rounded-full`, `backdrop-blur-xl`, `border-[var(--border-color)]`, 앰비언트 글로우).
  - 아래로 스크롤 시 콘텐츠 몰입을 위해 부드럽게 숨겨지고(`translate-y-24 opacity-0`), 위로 스크롤하거나 상단/하단 도달 시 다시 복귀(`translate-y-0 opacity-100`).
  - 활성화 탭은 유려한 슬라이딩 오렌지 서피스 인디케이터 적용.
- **Unified Design Tokens & Container Hover Effects**:
  - 하드코딩된 임의의 색상 사용을 엄격히 금지하고, 모든 카드, 모듈, 버튼, 팝오버는 반드시 CSS 변수 기반 디자인 토큰(`bg-[var(--card-surface)]/90 backdrop-blur-md`, `hover:bg-[var(--card-hover)]`, `border-[var(--border-color)]/90`)을 사용.
  - **Ambient Orange Glow Hover Rule**: 모든 인터랙티브 카드, 모듈, 버튼은 마우스 오버 시 일관되게 은은한 주황색 미세 테두리와 앰비언트 글로우(`hover:border-[var(--accent-orange)]/50 hover:shadow-[0_0_18px_rgba(241,143,1,0.18)]`)가 연출되어야 함.
  - 모든 카드와 모듈은 은은한 그림자(`shadow-sm`/`shadow-2xs`)와 1px Apple식 초미세 헤어라인 테두리로 통일감을 부여.
- **Lesson Page Modular Layout**:
  - 정적인 '핵심 요약' 및 '고정 도식'을 배제하고, 각 강의 데이터(`curriculum.ts`)에 따라 유연하게 렌더링되는 **동적 모듈 블록 (Modular Layout System)** 적용.
  - 지원 모듈: `guide_steps` (강의 노트/단계별 Step 가이드), `resources` (참고 데이터/자료 링크), `cta` (도구/외부 링크 이동 강조 카드).
  - 이전/다음 강의 버튼 및 상단 돌아가기 버튼 포함 세부 페이지 전체 요소에 홈 커리큘럼 카드와 동일한 Glassmorphic 디자인 언어 적용.
- **Video Cover Component**: 레슨 페이지에서는 기본 iFrame 대신 브랜드 부엉이 로고와 재생 버튼이 결합된 YouTube Cover Player 사용 (`playsinline=1` 모바일 자동 재생 지원).
- **Investment Type Survey & Report**:
  - 16가지 투자 성향 리포트 4대 세부 비율 스펙트럼은 전체 100% 바에 우세 성향(`Signature Orange` fill + `우세` 뱃지)과 열세 성향(`Soft Slate Gray` fill)이 투톤으로 명확히 구분 및 대조되어야 함.
- **Dynamic Component Height Stability & SmoothHeight Mandatory Rule (동적 컴포넌트 높이 안정화 및 SmoothHeight 필수 적용)**:
  - 탭 전환, 스텝 진행, 조건부 배너/모달 등 상태 변경에 따라 컨텐츠 높이가 달라지는 모든 인터랙티브/동적 컴포넌트는 **화면이 뚝뚝 끊기거나 덜컹거리는 레이아웃 시프트(CLS)를 100% 엄격 금지**.
  - 높이가 가변적인 영역은 반드시 `<SmoothHeight>` (`src/components/SmoothHeight.tsx`)를 감싸거나, CSS 변수 `--motion-apple-smooth`를 적용하여 항상 부드럽고 유려한 높이 전환을 보장해야 함.
- **Apple Native 2-Token Physics Engine Rule (애플 2대 표준 물리 모션 시스템 원칙)**:
  - 컴포넌트마다 제각각 다른 임의의 `transition duration` 하드코딩을 100% 엄격 금지하고, 반드시 애플 표준 2대 물리 토큰을 사용함.
  - 1. **`--motion-apple-smooth: 0.55s cubic-bezier(0.2, 0.8, 0.2, 1)`**: 하단 서랍 바텀시트, 모든 팝업 모달, 프로필 드롭다운, `SmoothHeight` 동적 높이 보간.
  - 2. **`--motion-apple-snappy: 0.38s cubic-bezier(0.2, 0.8, 0.2, 1)`**: 토글 스위치, 탭 슬라이딩 인디케이터, 4분할 프리셋 버튼 등 마이크로 컨트롤.
- **No Cursor Tracking**: 과도한 마우스 추적 Glow 효과나 조잡한 애니메이션 배제.

## 7. Color System & Auto Dark/Light Mode (주식부엉 2.0 10색 시그니처 팔레트)
- **Palette**:
  1. `Buong Orange` (`#F18F01` - 메인 브랜드, 핵심 CTA, 로고)
  2. `Deep Amber` (`#D97706` - 앰버/골드 보조)
  3. `Fintech Emerald` (`#10B981` - 수익, 정답, 상승)
  4. `Signal Crimson` (`#F43F5E` - 손실, 오답, 리스크)
  5. `Pure White` (`#FFFFFF` - 카드 서피스, 다크 텍스트)
  6. `Snow Slate` (`#F8FAFC` - 라이트모드 메인 배경)
  7. `Hairline Gray` (`#E2E8F0` - 1px 초미세 보더)
  8. `Muted Steel` (`#64748B` - 부연 설명, 단위 라벨)
  9. `Graphite Slate` (`#1E293B` - 라이트 텍스트, 다크 카드)
  10. `OLED Obsidian` (`#09090B` - 다크모드 메인 배경)
- **Light Mode**: Snow Slate (`#F8FAFC`) 배경 / Pure White (`#FFFFFF`) 카드 / Graphite Slate (`#0F172A`) 텍스트
- **Dark Mode**: OLED Obsidian (`#09090B`) 배경 / Dark Slate (`#18181B`) 카드 / Snow Slate (`#F8FAFC`) 텍스트

## 8. SEO & Dynamic Sitemap Automation Rules
- **자동 사이트맵 (Dynamic Sitemap)**:
  - `src/app/sitemap.ts`는 `curriculum.ts` 데이터를 동적으로 불러와 새로운 강의가 추가될 때마다 `sitemap.xml`이 **100% 자동 업데이트**됩니다.
  - 새로 추가되는 모든 정적/동적 라우트(예: 신규 투자도구 페이지, `/tools/type/[code]` 등)는 `sitemap.ts`에 라우트 경로를 누락 없이 유지합니다.
- **브랜드 표기**:
  - 사이트 메인명은 **'주식앱'** (`jusik.app`), 슬로건은 **"주식 초보를 위한 가장 쉬운 설명서"**를 준수합니다.

## 9. DB Securities Compliance Temporary Status & Restore Backup Rule
- **임시 안내 상태**: DB증권 심의필 관련 문제 해결 전까지 3강(`lv1-3`)은 "DB증권 계좌 개설 안내는 내부 점검으로 인해 잠시 중단되었습니다" 안내로 노출.
- **원본 데이터 백업 위치**: 심의필 승인 후 복구 요청 시 `.agents/references/db_securities_lesson3_backup.ts` 파일의 데이터를 `src/data/curriculum.ts` 내 `lv1-3`으로 즉시 원상복구할 것.

## 10. Pro Membership & Monetization Blueprint (수익화 & Pro 멤버십 원칙)
- **Alex Hormozi 고농도 세일즈 퍼널 모델**:
  - 유튜브 '주식부엉' 영상은 대중적 어그로/조회수 경쟁 대신, 원칙 투자를 진지하게 실행하려는 "고농도 진성 유저"를 모으는 필터링 역할 수행.
  - `jusik.app`은 연출보다 **"실전 데이터와 도구(과거 30년 폭락장 검증 데이터, 증시 캘린더 & 개인 맞춤 알림)"**를 제공하여 높은 유료 전환율 유도.
- **무료 vs Pro 기능 티어 구분**:
  - **무료 (Free)**: 백테스팅 최근 15년 데이터(2011년~현재), 기본 성향 진단 및 금융 퀴즈, 기본 시뮬레이터.
  - **Pro 멤버십 (Pro)**:
    1. **과거 30년치 전체 데이터 (1995년~현재)**: 2000 닷컴 버블(-80%), 2008 리먼 사태(-55%) 등 극한의 위기 구간 완벽 검증.
    2. **증시 캘린더 및 개인 맞춤 알림**: 주요 경제 지표/실적 일정, 개인 설정 맞춤 알림 서비스.
    3. **위기 구간 스트레스 테스트 & 추가 Pro 도구**: 역사적 위기 구간 통과 시각화 및 추후 지속 추가되는 Pro 전용 프리미엄 툴.
- **신규 가입자 온보딩 & 계정 정책**:
  - **기본 3일 체험권**: 신규 가입 시 모든 유저에게 **'3일 Pro 체험권' 자동 지급** (`pro_expires_at = NOW() + 3일`)하여 프로 기능을 가볍게 둘러보고 체감하도록 유도.
  - **런칭/프로모션 이벤트**: 런칭 시기나 특별 이벤트 시 프로모션 코드 등을 통해 30일권 등 유연하게 확장 지급.
  - 닉네임 + PIN 6자리 기반의 개인정보 없는 경량 로그인 체계 유지.
- **무부담 듀얼 수익화 트랙 (정기 자동결제 부담 Zero)**:
  1. **유튜브 멤버십 시크릿 프로모션 코드**: 유튜브 멤버십 커뮤니티에 매월 공지되는 전용 코드(예: `OWL-2609`)를 웹에 입력하여 +30일 연장 (PG사 심사/수수료/환불 CS 없이 유튜브 정산 활용).
  2. **무약정 단건 기간제 간편결제**: 30일권 / 90일권 / 1년권 등 토스/카카오페이 단건 결제로 기간 만료 시 자동 해제되는 안전한 구조.

## 11. Image Generation Prompt Directives (이미지 생성 프롬프트 작성 지침)
사용자가 웹사이트 내 삽입될 이미지 생성을 위한 프롬프트를 요청할 경우, 반드시 다음 3대 원칙을 철저히 준수하여 프롬프트를 작성해야 합니다.
1. **브랜드 10색 시그니처 팔레트 연계**:
   - `Buong Orange` (`#F18F01`), `Deep Amber` (`#D97706`), `OLED Obsidian` (`#09090B`), `Snow Slate` (`#F8FAFC`), `Graphite Slate` (`#1E293B`) 등 사이트 테마 색상이 조명, 반사광, 오브젝트에 자연스럽게 묻어나도록 명시.
2. **미니멀리즘 및 여백 극대화 (AI 조잡함 원천 차단)**:
   - 과도한 오브젝트를 우겨넣은 초현실주의는 AI 특유의 엉성함과 조잡함을 유발하므로, **불필요한 디테일을 과감히 덜어내고 넉넉한 여백(Negative Space)**과 정제된 고급 소재(매트 옵시디언 스톤, 트래버틴, 앰버 글래스, 브라스, 다크 마블) 위주의 미니멀 에디토리얼 구도를 지향.
3. **얼굴 노출 배제 & 한국인 인물 원칙 (불쾌한 골짜기 방지)**:
   - 인물이 등장해야 하는 경우 **반드시 한국인(Korean / East Asian)**으로 설정.
   - AI 인물 생성 시 발생하는 어색함(불쾌한 골짜기)을 방지하기 위해 **얼굴 정면 노출을 철저히 배제**하고 뒷모습, 소프트 실루엣, 손/오브젝트 클로즈업, 아웃포커싱 배경 처리로 연출.