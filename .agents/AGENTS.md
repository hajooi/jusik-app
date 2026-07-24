# Project Name: jusik.app (Minimal Stock Learning Platform)

## 1. Project Goal
도메인 `jusik.app`에 최적화된 모바일 퍼스트 에듀테크/핀테크 플랫폼 구축.
모바일 웹 및 PWA 앱 환경에 최적화된 하단 내비게이션(Bottom Navigation) 기반의 절제된 UI를 지향합니다.

## 2. Architecture & Tech Stack
- **Framework**: Next.js (App Router), Tailwind CSS
- **Design System**: Material Design 3 (M3) & iOS HIG Bottom Navigation Pattern
- **Icons**: Lucide React (`lucide-react`)
- **Features**: PWA 지원, OS 설정 기반 Auto Dark/Light Mode (10 Signature Colors)

## 3. Brand Identity & Slogan
- **Brand Name**: jusik.app
- **Primary Slogan**: "주식 초보를 위한 가장 쉬운 설명서"

## 4. Terminology & Easy Tone Rule (쉬운 어휘 및 용어 원칙)
초등학생이나 주식 초보자도 한눈에 이해할 수 있는 쉬운 용어만 사용합니다.
- **매수 ➔ '주식 구매' 또는 '구매'**: '매수'라는 전문 한자 용어를 절대 사용하지 않고 무조건 **'주식 구매'**로 표현합니다.
- **매도 ➔ '주식 판매' 또는 '팔기'**: '매도' 대신 **'주식 판매'**나 **'팔기'**로 표현합니다.
- **FOMO ➔ '나만 빠질까 봐 생기는 조급함'**: FOMO 등 영문 약어나 전문 금융 용어를 쓰지 않고 쉬운 우리말로 풀어서 작성합니다.

## 5. Mobile Bottom Navigation Structure (하단 고정 탭)
iOS/Android 모바일 UI 가이드라인에 맞춰 화면 하단에 2개의 핵심 탭을 고정 배치합니다.

1. **커리큘럼 (`/`)**: [Lv. 0 ~ Lv. 5] 정규 학습 아카이브 ("초보자도 쉽게 따라 하는 단계별 주식 강좌입니다.")
2. **투자도구 (`/tools`)**: 투자 성향 진단(MBTI), 포트폴리오 백테스터, 계산기 등 실습 모듈 모음

## 6. UI/UX Rules & Visual Polish
- **Bottom Navigation Active State**:
  - **Dark Mode**: 고대비 순백색 (`text-white`) + Bold (`font-bold`)
  - **Light Mode**: 고대비 딥 숯색 (`text-neutral-900`) + Bold (`font-bold`)
  - **Icon Style**: 활성화 탭은 인스타그램 스타일 **Filled Icon** (`fill="currentColor"`, `stroke-[2.2px]`), 비활성화 탭은 **Outline Icon** (`stroke-[1.8px]`).
- **No Border Outlines**: 모든 카드, 헤더, 모듈에서 조잡한 외곽 테두리(Border)를 배제하고 표면색과 미세한 그림자(Shadow) 깊이감만 적용.
- **Lesson Page Modular Layout**:
  - 정적인 '핵심 요약' 및 '고정 도식'을 배제하고, 각 강의 데이터(`curriculum.ts`)에 따라 유연하게 렌더링되는 **동적 모듈 블록 (Modular Layout System)** 적용.
  - 지원 모듈: `guide_steps` (강의 노트/단계별 Step 가이드), `resources` (참고 데이터/자료 링크), `cta` (도구/외부 링크 이동 강조 카드).
- **Video Cover Component**: 레슨 페이지에서는 기본 iFrame 대신 브랜드 부엉이 로고와 재생 버튼이 결합된 YouTube Cover Player 사용 (`playsinline=1` 모바일 자동 재생 지원).
- **No Cursor Tracking**: 과도한 마우스 추적 Glow 효과나 조잡한 애니메이션 배제.

## 7. Color System & Auto Dark/Light Mode
- **Palette**: Charcoal(`#353535`), Slate(`#5F5F5F`), Dark Green(`#24613B`), Mid Green(`#68A67D`), Light Green(`#8FBF9F`), Base Cream(`#F5ECD7`), Soft Beige(`#EBE2CD`), Dark Beige(`#C2BAA6`), Orange(`#F18F01`), Deep Brown(`#833500`)
- **Light Mode**: Base Cream 배경 / Soft Beige 카드 / Charcoal 텍스트
- **Dark Mode**: Charcoal 배경 / Slate 카드 / Base Cream 텍스트 (자동 감지)