# Project Name: jusik.app (Minimal Stock Learning Platform)

## 0. Strict Agent Workflow & GitHub Directives (작업 원칙)
- **CRITICAL: Explicit User Approval Before Code Edit (사전 승인 필수 & 독단적 코드 수정 엄격 금지)**:
  - UI/UX, 문구, 레이아웃, 기능 등 **모든 코드 수정 전 반드시 수정 계획을 사용자에게 제시하고 명시적 컨펌을 받은 뒤 진행**.
- **Visual Planning with Mermaid Diagram**:
  - 플랜 작성 시 `implementation_plan.md`에 **Mermaid 다이어그램**을 포함하여 시각적 구조를 직관적으로 전달.
- **No Automatic GitHub Pushes**:
  - 사용자가 명시적으로 지시할 때만 `git push` 실행 (자동 커밋/푸시 100% 금지).
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
- **주간 동기화 (매주 토요일 오전)**: 차주 및 다가오는 이벤트의 세부 일정/발표 시간/예상치 변동 사항 점검 및 동기화.
- **과거~미래 양방향 탐색 UX**: '오늘' 기준점을 중심으로 위로 스크롤 시 과거 발표 결과 확인, 아래로 스크롤 시 미래 일정 확인 가능하도록 구현.