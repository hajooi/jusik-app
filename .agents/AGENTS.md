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
- **Bottom Navigation Active State**:
  - **Dark Mode**: 고대비 순백색 (`text-white`) + Bold (`font-bold`)
  - **Light Mode**: 고대비 딥 숯색 (`text-neutral-900`) + Bold (`font-bold`)
  - **Icon Style**: 활성화 탭은 인스타그램 스타일 **Filled Icon** (`fill="currentColor"`, `stroke-[2.2px]`), 비활성화 탭은 **Outline Icon** (`stroke-[1.8px]`).
- **Unified Design Tokens & Container Hover Effects**:
  - 하드코딩된 색상 코드(예: `#EBE2CD`, `#464646` 등) 사용을 엄격히 금지하고, 모든 카드, 모듈, 버튼, 팝오버는 반드시 CSS 변수 기반 디자인 토큰(`bg-[var(--card-surface)]/90 backdrop-blur-md`, `hover:bg-[var(--card-hover)]`, `border-[var(--border-color)]/20`)을 사용.
  - **Ambient Orange Glow Hover Rule**: 모든 인터랙티브 카드, 모듈, 버튼(커리큘럼 레벨, 레슨 항목, 투자도구 카드, 성향 리포트 카드, 비디오 커버, CTA 모듈 등)은 마우스 오버 시 일관되게 은은한 주황색 미세 테두리와 앰비언트 글로우(`hover:border-[var(--accent-orange)]/40 hover:shadow-[0_0_20px_rgba(241,143,1,0.18)]`)가 연출되어야 함.
  - 모든 카드와 모듈은 은은한 그림자(`shadow-sm`/`shadow-2xs`)와 절제된 미세 테두리로 통일감을 부여.
- **Lesson Page Modular Layout**:
  - 정적인 '핵심 요약' 및 '고정 도식'을 배제하고, 각 강의 데이터(`curriculum.ts`)에 따라 유연하게 렌더링되는 **동적 모듈 블록 (Modular Layout System)** 적용.
  - 지원 모듈: `guide_steps` (강의 노트/단계별 Step 가이드), `resources` (참고 데이터/자료 링크), `cta` (도구/외부 링크 이동 강조 카드).
  - 이전/다음 강의 버튼 및 상단 돌아가기 버튼 포함 세부 페이지 전체 요소에 홈 커리큘럼 카드와 동일한 Glassmorphic 디자인 언어 적용.
- **Video Cover Component**: 레슨 페이지에서는 기본 iFrame 대신 브랜드 부엉이 로고와 재생 버튼이 결합된 YouTube Cover Player 사용 (`playsinline=1` 모바일 자동 재생 지원).
- **Investment Type Survey & Report**:
  - 16가지 투자 성향 리포트 4대 세부 비율 스펙트럼은 전체 100% 바에 우세 성향(`Signature Orange` fill + `우세` 뱃지)과 열세 성향(`Soft Slate Gray` fill)이 투톤으로 명확히 구분 및 대조되어야 함.
- **No Cursor Tracking**: 과도한 마우스 추적 Glow 효과나 조잡한 애니메이션 배제.

## 7. Color System & Auto Dark/Light Mode
- **Palette**: Charcoal(`#353535`), Slate(`#5F5F5F`), Dark Green(`#24613B`), Mid Green(`#68A67D`), Light Green(`#8FBF9F`), Base Cream(`#F5ECD7`), Soft Beige(`#EBE2CD`), Dark Beige(`#C2BAA6`), Orange(`#F18F01`), Deep Brown(`#833500`)
- **Light Mode**: Base Cream 배경 / Soft Beige 카드 / Charcoal 텍스트
- **Dark Mode**: Charcoal 배경 / Slate 카드 / Base Cream 텍스트 (자동 감지)

## 8. SEO & Dynamic Sitemap Automation Rules
- **자동 사이트맵 (Dynamic Sitemap)**:
  - `src/app/sitemap.ts`는 `curriculum.ts` 데이터를 동적으로 불러와 새로운 강의가 추가될 때마다 `sitemap.xml`이 **100% 자동 업데이트**됩니다.
  - 새로 추가되는 모든 정적/동적 라우트(예: 신규 투자도구 페이지, `/tools/type/[code]` 등)는 `sitemap.ts`에 라우트 경로를 누락 없이 유지합니다.
- **브랜드 표기**:
  - 사이트 메인명은 **'주식앱'** (`jusik.app`), 슬로건은 **"주식 초보를 위한 가장 쉬운 설명서"**를 준수합니다.

## 9. DB Securities Compliance Temporary Status & Restore Backup Rule
- **임시 안내 상태**: DB증권 심의필 관련 문제 해결 전까지 3강(`lv1-3`)은 "DB증권 계좌 개설 안내는 내부 점검으로 인해 잠시 중단되었습니다" 안내로 노출.
- **원본 데이터 백업 위치**: 심의필 승인 후 복구 요청 시 `.agents/references/db_securities_lesson3_backup.ts` 파일의 데이터를 `src/data/curriculum.ts` 내 `lv1-3`으로 즉시 원상복구할 것.