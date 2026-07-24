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

### 3. Navigation & Layout
- **Bottom Navigation**:
  - Keep 2 fixed tabs: 커리큘럼 (`/`), 투자도구 (`/tools`).
  - Active Tab Style: Pure White (`text-white`) in Dark Mode / Charcoal (`text-neutral-900`) in Light Mode.
  - Active Icons: Solid Filled (`fill="currentColor"`, `stroke-[2.2px]`).
  - Inactive Icons: Outline (`stroke-[1.8px]`, `fill="none"`).
- **Header & Cards**:
  - Glassmorphism design system (`backdrop-blur-md bg-[var(--card-surface)]/90 border border-[var(--border-color)]/20 shadow-sm`).
  - Unified across main curriculum page, lesson detail pages (modules & next/prev buttons), and navigation elements.

### 4. Key Components
- `BottomNavigation.tsx`: Mobile fixed 2-tab navigation bar.
- `VideoCoverPlayer.tsx`: Custom M3-styled cover overlay player with owl logo and play button.
- `Accordion.tsx`: Main curriculum accordion & Table of contents drawer.

### 5. Development & Verification Workflow
- Ensure TypeScript compilation passes: `npx tsc --noEmit`.
- Ensure dev server is responsive and mobile layout displays properly without horizontal overflow.
