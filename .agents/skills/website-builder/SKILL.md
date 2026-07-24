---
name: website-builder
description: Skill for developing, styling, and maintaining the jusik.app stock learning web application.
---

# Jusik.app Web Application Builder Skill

This skill guides the development and UI/UX maintenance of `jusik.app`, a minimal, mobile-first stock learning platform.

## Key Design Patterns & Guidelines

### 1. Terminology & Easy Language Rule
- **No '매수'**: Always use **'주식 구매'** or **'구매'**. Never use '매수'.
- **No '매도'**: Always use **'주식 판매'** or **'팔기'**.
- **No Jargon/FOMO**: Always translate technical jargon like FOMO into easy Korean phrases like **'나만 빠질까 봐 생기는 조급함'**.

### 2. Color Palette & Dark/Light Mode
Always use predefined CSS variables from `src/app/globals.css`:
- `--bg-main`: Base Cream (`#F5ECD7`) in Light / Charcoal (`#353535`) in Dark
- `--card-surface`: Soft Beige (`#EBE2CD`) in Light / Slate (`#464646`) in Dark
- `--card-hover`: Darker Soft Beige (`#E2D7BE`) in Light / Slate (`#5F5F5F`) in Dark
- `--text-primary`: Charcoal (`#353535`) in Light / Base Cream (`#F5ECD7`) in Dark
- `--text-secondary`: Slate Grey (`#5F5F5F`) in Light / Dark Beige (`#C2BAA6`) in Dark
- Primary Brand Accent: Light/Dark Green (`#24613B`, `#8FBF9F`) & Signature Orange (`#F18F01`)

### 3. Header & Navigation Layout
- **Navbar Header**:
  - No top-left logo image; title `jusik.app` is clean and centered in the header.
  - Dropdown popover menu on the right ("by 주식부엉").
- **Hero Banners (Curriculum & Tools)**:
  - Title and sub-description text are preserved and left-aligned (`"초보자도 쉽게 따라 하는 단계별 주식 강의입니다."`).
  - Total item count badges (e.g. `총 4개 강의`, `1개 모듈`) are removed for a cleaner minimal look.
- **Bottom Navigation**:
  - Keep 2 fixed tabs: 커리큘럼 (`/`), 투자도구 (`/tools`).
  - Active Tab Style: Pure White (`text-white`) in Dark Mode / Charcoal (`text-neutral-900`) in Light Mode.
  - Active Icons: Solid Filled (`fill="currentColor"`, `stroke-[2.2px]`).
  - Inactive Icons: Outline (`stroke-[1.8px]`, `fill="none"`).

### 4. Modern Refined Liquid Glassmorphism (De-boxing & Minimal Layout)
- **De-boxed Clean Headers**: Top hero banners (`/` and `/tools`) use clean left-aligned typography directly on page background without heavy background box containers.
- **De-boxed Lesson Page**: Remove outer box containers around lesson modules. Guide steps use clean article-style layout with soft translucent vertical guide line (`border-[var(--border-color)]`).
- **Delicate 1px Glass Borders**: Standardize on ultra-thin 1px borders (`border-[var(--border-color)]`, translucent 0.04 opacity) to prevent heavy boxy frames.
- **Corner Radius**: Keep card corner radius compact (`rounded-2xl` / `16px~18px`) to avoid bulky rounded boxes.
- **Backdrop Blur & Surface**: High-vibrancy glassmorphism (`backdrop-filter: blur(20px)` + translucent surface).
- **Typography & Density**: Apply tight negative letter-spacing (`tracking-[-0.025em]`) and slim font-weights (`font-semibold`) on main titles.
- **Soft Icon Highlights**: Hover/Active play icon states use subtle translucent orange tint (`bg-[var(--accent-orange)]/15 text-[var(--accent-orange)]`) rather than solid heavy orange fill.
- **Bottom Navigation**: Glowing orange border pill highlight (`border-[rgba(241,143,1,0.45)]`) for active tab button.

### 5. Key Components
- `Navbar.tsx`: Centered brand header with popover menu.
- `BottomNavigation.tsx`: Mobile fixed 2-tab navigation bar with glowing active pill.
- `VideoCoverPlayer.tsx`: Custom M3-styled cover overlay player with owl logo and play button.
- `Accordion.tsx`: Clean, single-row curriculum accordion.

### 5. Development & Verification Workflow
- Ensure TypeScript compilation passes: `npx tsc --noEmit`.
- Ensure dev server is responsive and mobile layout displays properly without horizontal overflow.
