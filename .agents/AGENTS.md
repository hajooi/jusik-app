# Project Name: jusik.app (Minimal Stock Learning Platform)

## 1. Project Goal
도메인 `jusik.app`에 최적화된 모바일 퍼스트 에듀테크/핀테크 플랫폼 구축.
모바일 웹 및 PWA 앱 환경에 최적화된 하단 내비게이션(Bottom Navigation) 기반의 절제된 UI를 지향합니다.

## 2. Architecture & Tech Stack
- **Framework**: Next.js (App Router), Tailwind CSS
- **Design System**: Material Design 3 (M3) & iOS HIG Bottom Navigation Pattern
- **Features**: PWA 지원, OS 설정 기반 Auto Dark/Light Mode (10 Signature Colors)

## 3. Brand Identity & Slogan
- **Brand Name**: jusik.app
- **Primary Slogan**: "주식 초보를 위한 가장 쉬운 설명서"

## 4. Mobile Bottom Navigation Structure (하단 고정 탭)
iOS/Android 모바일 UI 가이드라인에 맞춰 화면 하단에 3개의 핵심 탭을 고정 배치합니다.

1. **커리큘럼 (`/`)**: [Lv. 0 ~ Lv. 5] 정규 학습 아카이브
2. **주식 툴킷 (`/tools`)**: 투자 성향 진단(MBTI), 포트폴리오 백테스터, 계산기 등 실습 모듈 모음
3. **마이페이지 (`/profile`)**: 개인 투자 성향/포트폴리오 관리, 학습 진도율, 로그인 및 회원 정보

## 5. UI/UX Rules
- **No Cursor Tracking**: 과도한 마우스 추적 Glow 효과나 조잡한 애니메이션을 완전히 배제합니다.
- **Glassmorphism Depth**: 하단 내비게이션 바 및 헤더에는 은은한 `backdrop-blur` 모바일 유리 질감만 적용하여 깊이감을 줍니다.
- **Marketing Exclusion**: 메인 화면의 과도한 제휴 배너, 대형 버튼을 제거하고 정갈한 목차 및 툴킷 구조만 유지합니다.

## 6. Color System & Auto Dark/Light Mode
- **Palette**: Charcoal(`#353535`), Slate(`#5F5F5F`), Dark Green(`#24613B`), Mid Green(`#68A67D`), Light Green(`#8FBF9F`), Base Cream(`#F5ECD7`), Soft Beige(`#EBE2CD`), Dark Beige(`#C2BAA6`), Orange(`#F18F01`), Deep Brown(`#833500`)
- **Light Mode**: Base Cream 배경 / Soft Beige 카드 / Charcoal 텍스트
- **Dark Mode**: Charcoal 배경 / Slate 카드 / Base Cream 텍스트 (자동 감지)