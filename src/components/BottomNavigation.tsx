'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CURRICULUM_DATA } from '@/data/curriculum';
import { useAuth } from '@/context/AuthContext';
import { 
  BookOpen, 
  Wrench, 
  PlayCircle, 
  ChevronDown, 
  CheckCircle2, 
  Clock, 
  Brain, 
  ShoppingBag, 
  ShieldCheck, 
  PieChart, 
  TrendingUp, 
  Cpu, 
  Sparkles,
  HelpCircle,
  LineChart,
  Receipt,
  CandlestickChart,
  ChevronRight
} from 'lucide-react';

const LEVEL_ICON_MAP: Record<string, any> = {
  Brain,
  ShoppingBag,
  ShieldCheck,
  PieChart,
  TrendingUp,
  Cpu,
};

const TOOLS_DIRECTORY = [
  {
    title: '주식 용어 퀴즈',
    description: '주식 시장 필수 기초 용어! 퀴즈로 쉽고 재미있게 실력 점검',
    href: '/tools/terms',
    icon: HelpCircle,
    tag: '15문항 랭킹전',
    isComingSoon: false,
  },
  {
    title: '투자 성향 진단',
    description: '손실 걱정형부터 성장 추구형까지! 나에게 맞는 16가지 투자 스타일',
    href: '/tools/type',
    icon: Sparkles,
    tag: '40문항 진단',
    isComingSoon: false,
  },
  {
    title: '투자 전략 시뮬레이터',
    description: '과거 30년 실제 데이터로 검증하는 복리 수익률 & 자산 배분 계산기',
    href: '/tools/simulate',
    icon: LineChart,
    tag: '수익률 시뮬레이션',
    isComingSoon: false,
  },
  {
    title: 'ETF 수수료 정리',
    description: '표시된 보수 말고 진짜 떼어가는 실질 수수료 완벽 비교 분석',
    href: '#',
    icon: Receipt,
    tag: '실질 수수료',
    isComingSoon: true,
  },
  {
    title: '나의 투자일지',
    description: '내가 만든 포트폴리오를 저장하고 주기적으로 관리하는 투자 기록장',
    href: '#',
    icon: BookOpen,
    tag: '투자 기록',
    isComingSoon: true,
  },
  {
    title: '차트 패턴 트레이닝',
    description: '다음 캔들은 상승할까, 하락할까? 핵심 패턴으로 익히는 실전 훈련',
    href: '#',
    icon: CandlestickChart,
    tag: '실전 훈련',
    isComingSoon: true,
  },
];

const COLLAPSED_HEIGHT = 56;
const COLLAPSED_WIDTH = 276;

export default function BottomNavigation() {
  const pathname = usePathname();
  const { user, isLessonCompleted, completedLessons } = useAuth();

  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Expanded State of the Drawer
  const [isExpanded, setIsExpanded] = useState(false);
  // Active Tab View: 'curriculum' | 'tools'
  const [activeTab, setActiveTab] = useState<'curriculum' | 'tools'>('curriculum');

  // Real-time Dragging State (Mobile touch only)
  const [isDragging, setIsDragging] = useState(false);
  const [dragY, setDragY] = useState<number | null>(null);

  const startYRef = useRef(0);
  const isDraggingRef = useRef(false);
  const didMoveRef = useRef(false);
  const sheetHeightRef = useRef(560);
  const maxSheetWidthRef = useRef(576);

  const isHomePage = pathname === '/';
  const isLessonPage = pathname.startsWith('/lesson/');
  const isOnCurriculum = isHomePage || isLessonPage;
  const isOnTools = pathname.startsWith('/tools');
  const isToolsSubPage = pathname.startsWith('/tools/') && pathname !== '/tools';
  const currentLessonId = isLessonPage ? pathname.split('/lesson/')[1] : '';

  // Viewport-based max sheet height & width
  useEffect(() => {
    const updateDimensions = () => {
      sheetHeightRef.current = Math.min(window.innerHeight * 0.78, 620);
      maxSheetWidthRef.current = Math.min(window.innerWidth < 640 ? window.innerWidth : 576, 576);
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Match activeTab with current route when route changes
  useEffect(() => {
    if (pathname.startsWith('/tools')) {
      setActiveTab('tools');
    } else {
      setActiveTab('curriculum');
    }
    setIsExpanded(false);
    setDragY(null);
  }, [pathname]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isExpanded) {
        setIsExpanded(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isExpanded]);

  // Lock body scroll when expanded
  useEffect(() => {
    if (isExpanded) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isExpanded]);

  // Level accordion open states
  const [openLevels, setOpenLevels] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    CURRICULUM_DATA.forEach((lvl) => {
      const containsCurrent = isLessonPage && lvl.lessons.some((l) => l.id === currentLessonId);
      initial[lvl.id] = containsCurrent;
    });
    return initial;
  });

  useEffect(() => {
    if (currentLessonId) {
      setOpenLevels((prev) => {
        const next = { ...prev };
        CURRICULUM_DATA.forEach((lvl) => {
          if (lvl.lessons.some((l) => l.id === currentLessonId)) {
            next[lvl.id] = true;
          }
        });
        return next;
      });
    }
  }, [currentLessonId]);

  const toggleLevel = (levelId: string, isComingSoon?: boolean) => {
    if (isComingSoon) return;
    setOpenLevels((prev) => ({
      ...prev,
      [levelId]: !prev[levelId],
    }));
  };

  // Scroll to hide only when collapsed and idle
  useEffect(() => {
    if (isExpanded || isDragging) return;

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const scrollHeight = document.documentElement.scrollHeight;
          const clientHeight = document.documentElement.clientHeight;

          if (currentScrollY < 60 || currentScrollY + clientHeight >= scrollHeight - 40) {
            setIsVisible(true);
          } else if (currentScrollY > lastScrollY + 12) {
            setIsVisible(false);
          } else if (currentScrollY < lastScrollY - 12) {
            setIsVisible(true);
          }

          setLastScrollY(currentScrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, isExpanded, isDragging]);

  // Touch Gesture Physics Drag (Touch devices only; bypassed on Desktop mouse & Home page)
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse') return; // Desktop mouse clicks natively without drag friction
    if (isHomePage && !isExpanded) return; // Home page doesn't need drawer drag

    startYRef.current = e.clientY;
    isDraggingRef.current = true;
    didMoveRef.current = false;
    setIsDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const currentY = e.clientY;
    const deltaY = startYRef.current - currentY; // positive when dragging UP

    if (Math.abs(deltaY) > 6) {
      didMoveRef.current = true;
    }

    const maxDelta = sheetHeightRef.current - COLLAPSED_HEIGHT;
    if (isExpanded) {
      // Dragging down from expanded (deltaY <= 0)
      const clamped = Math.max(-maxDelta, Math.min(0, deltaY));
      setDragY(clamped);
    } else {
      // Dragging up from collapsed (deltaY >= 0)
      const clamped = Math.max(0, Math.min(maxDelta, deltaY));
      setDragY(clamped);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);

    const currentY = e.clientY;
    const deltaY = startYRef.current - currentY;

    if (didMoveRef.current) {
      if (isExpanded) {
        if (deltaY < -70) {
          setIsExpanded(false);
        } else {
          setIsExpanded(true);
        }
      } else {
        if (deltaY > 60) {
          if (isLessonPage) {
            setActiveTab('curriculum');
            setIsExpanded(true);
          } else if (isToolsSubPage) {
            setActiveTab('tools');
            setIsExpanded(true);
          }
        } else {
          setIsExpanded(false);
        }
      }
    }

    setDragY(null);
  };

  // Smart Tab click handler
  const handleTabClick = (targetTab: 'curriculum' | 'tools', href: string, e: React.MouseEvent) => {
    if (didMoveRef.current) {
      e.preventDefault();
      return;
    }

    if (isExpanded) {
      if (activeTab === targetTab) {
        e.preventDefault();
        setIsExpanded(false);
      } else {
        e.preventDefault();
        setActiveTab(targetTab);
      }
      return;
    }

    // When collapsed:
    if (targetTab === 'curriculum') {
      if (isLessonPage) {
        // On lesson page ➔ Expand curriculum TOC drawer
        e.preventDefault();
        setActiveTab('curriculum');
        setIsExpanded(true);
      } else if (isHomePage) {
        // On home page ➔ Simply smooth scroll to top
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else if (targetTab === 'tools') {
      if (isToolsSubPage) {
        // On tools sub-tool page ➔ Expand tools directory drawer
        e.preventDefault();
        setActiveTab('tools');
        setIsExpanded(true);
      } else if (pathname === '/tools') {
        // On tools main page ➔ Simply smooth scroll to top
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  // Compute live expansion progress (0: fully collapsed pill, 1: fully expanded sheet)
  const maxDelta = sheetHeightRef.current - COLLAPSED_HEIGHT || 1;
  let progress = 0;
  if (isDragging && dragY !== null) {
    if (isExpanded) {
      progress = Math.max(0, Math.min(1, 1 + dragY / maxDelta));
    } else {
      progress = Math.max(0, Math.min(1, dragY / maxDelta));
    }
  } else {
    progress = isExpanded ? 1 : 0;
  }

  // Active tab indicator key
  const activeIndicatorTab = isExpanded ? activeTab : (isOnTools ? 'tools' : 'curriculum');

  // Stats calculation
  const allLessons = CURRICULUM_DATA.flatMap((l) => l.lessons);
  const totalLessonCount = allLessons.length;
  const completedCount = completedLessons.filter((id) => allLessons.some((l) => l.id === id)).length;
  const progressPercent = totalLessonCount > 0 ? Math.round((completedCount / totalLessonCount) * 100) : 0;

  // Real-time height and width continuous calculations
  const currentHeight = COLLAPSED_HEIGHT + progress * (sheetHeightRef.current - COLLAPSED_HEIGHT);
  const maxTargetWidth = maxSheetWidthRef.current;
  const currentWidth = COLLAPSED_WIDTH + progress * (maxTargetWidth - COLLAPSED_WIDTH);
  const isSheetVisible = progress > 0.001 || isExpanded;

  // Animated progress bar fill state
  const [animatedPercent, setAnimatedPercent] = useState(0);
  useEffect(() => {
    if (isSheetVisible && progress > 0.2) {
      const timer = setTimeout(() => {
        setAnimatedPercent(progressPercent);
      }, 120);
      return () => clearTimeout(timer);
    } else {
      setAnimatedPercent(0);
    }
  }, [isSheetVisible, progress, progressPercent]);

  return (
    <>
      {/* 1. Backdrop Dimming (z-[99] covers top sticky Navbar and Account profile) */}
      <div
        className="fixed inset-0 z-[99] bg-black/60 backdrop-blur-xs transition-opacity duration-300 pointer-events-none will-change-opacity"
        style={{
          opacity: progress * 0.65,
          pointerEvents: progress > 0.05 ? 'auto' : 'none',
          transition: isDragging ? 'none' : 'opacity 0.35s cubic-bezier(0.25, 1, 0.5, 1)',
        }}
        onClick={() => {
          setIsExpanded(false);
          setDragY(null);
        }}
      />

      {/* 2. Fixed Bottom Anchor (z-[100]) - Docked firmly to the bottom */}
      <div 
        className={`fixed inset-x-0 bottom-0 z-[100] flex justify-center items-end select-none pointer-events-none transition-transform duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] will-change-transform ${
          !isSheetVisible && !isVisible ? 'translate-y-[180%]' : 'translate-y-0'
        } p-0`}
      >
        {/* Pure Vertical Slide-Up Sheet Drawer (Inverted U-Shape Docked Tab ∩) */}
        <div
          className="pointer-events-auto border-t border-x border-[var(--border-color)]/80 shadow-[0_-2px_12px_rgba(0,0,0,0.06)] dark:shadow-[0_-3px_16px_rgba(0,0,0,0.35)] overflow-hidden flex flex-col will-change-[height,width,border-radius,background-color] touch-none origin-bottom"
          style={{
            height: `${currentHeight}px`,
            width: `${currentWidth}px`,
            maxWidth: '100%',
            borderRadius: progress > 0.05
              ? '32px 32px 0px 0px'
              : '24px 24px 0px 0px',
            backgroundColor: typeof window !== 'undefined' && document.documentElement.classList.contains('dark')
              ? `rgba(24, 24, 27, ${0.82 + progress * 0.12})`
              : `rgba(255, 255, 255, ${0.88 + progress * 0.10})`,
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            transition: isDragging ? 'none' : 'height 0.38s cubic-bezier(0.25, 1, 0.5, 1), width 0.35s cubic-bezier(0.25, 1, 0.5, 1), border-radius 0.3s cubic-bezier(0.25, 1, 0.5, 1)',
          }}
        >
          {/* ==================================================== */}
          {/* TOP HEADER PILL: CONSTANT 276px ZERO-SHIFT GEOMETRY  */}
          {/* ==================================================== */}
          <div 
            className="w-full h-[56px] flex items-center justify-center shrink-0 select-none px-2"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            {/* The Floating Capsule Pill (Always exactly 276px, never shifts) */}
            <nav 
              aria-label="내비게이션"
              className="w-[276px] relative flex items-center justify-around overflow-hidden rounded-full p-0.5"
            >
              {/* Exact 50:50 Centered Sliding Orange Highlight Surface */}
              <div 
                className="absolute top-0.5 bottom-0.5 rounded-full bg-[var(--accent-orange)]/15 border border-[var(--accent-orange)]/50 shadow-[0_0_16px_rgba(241,143,1,0.25)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none"
                style={{
                  width: 'calc(50% - 2px)',
                  left: activeIndicatorTab === 'curriculum' ? '2px' : 'calc(50% + 0px)',
                }}
              />

              {/* Tab 1: 커리큘럼 */}
              <Link
                href="/"
                onClick={(e) => handleTabClick('curriculum', '/', e)}
                className={`relative z-10 w-1/2 flex items-center justify-center gap-1.5 py-2 px-4 rounded-full transition-colors duration-200 cursor-pointer ${
                  activeIndicatorTab === 'curriculum'
                    ? 'text-[var(--accent-orange)] font-black'
                    : 'text-[var(--text-secondary)] font-semibold hover:text-[var(--text-primary)]'
                }`}
              >
                <BookOpen 
                  className={`w-4 h-4 transition-transform duration-300 ${
                    activeIndicatorTab === 'curriculum' 
                      ? 'stroke-[2.5px] text-[var(--accent-orange)] scale-105' 
                      : 'stroke-[1.7px]'
                  }`} 
                />
                <span className="text-xs sm:text-sm tracking-tight font-sans select-none">커리큘럼</span>
              </Link>

              {/* Tab 2: 투자도구 */}
              <Link
                href="/tools"
                onClick={(e) => handleTabClick('tools', '/tools', e)}
                className={`relative z-10 w-1/2 flex items-center justify-center gap-1.5 py-2 px-4 rounded-full transition-colors duration-200 cursor-pointer ${
                  activeIndicatorTab === 'tools'
                    ? 'text-[var(--accent-orange)] font-black'
                    : 'text-[var(--text-secondary)] font-semibold hover:text-[var(--text-primary)]'
                }`}
              >
                <Wrench 
                  className={`w-4 h-4 transition-transform duration-300 ${
                    activeIndicatorTab === 'tools' 
                      ? 'stroke-[2.5px] text-[var(--accent-orange)] scale-105' 
                      : 'stroke-[1.7px]'
                  }`} 
                />
                <span className="text-xs sm:text-sm tracking-tight font-sans select-none">투자도구</span>
              </Link>
            </nav>
          </div>

          {/* ==================================================== */}
          {/* REVEALED DRAWER CONTENT AREA (Vertical Reveal)       */}
          {/* ==================================================== */}
          {isSheetVisible && (
            <div 
              className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 overscroll-contain touch-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
              style={{
                opacity: Math.max(0, (progress - 0.1) / 0.9),
                transition: isDragging ? 'none' : 'opacity 0.25s ease',
              }}
            >
              {/* A. CURRICULUM TOC VIEW */}
              {activeTab === 'curriculum' && (
                <div className="space-y-3.5">
                  {user && (
                    <div className="glass-card p-3.5 sm:p-4 rounded-2xl border border-[var(--border-color)] space-y-2 shadow-2xs">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <div className="flex items-center gap-1.5 text-[var(--text-primary)] min-w-0">
                          <Sparkles className="w-3.5 h-3.5 text-[var(--accent-orange)] shrink-0" />
                          <span className="truncate">{user.nickname}님의 수강 진도</span>
                        </div>
                        <span className="font-mono text-[11px] text-[var(--accent-orange)] font-extrabold shrink-0">
                          {completedCount}/{totalLessonCount}강 완료 ({progressPercent}%)
                        </span>
                      </div>
                      {/* Animated Progress Fill Bar */}
                      <div className="relative w-full h-2 rounded-full bg-[var(--card-hover)] overflow-hidden border border-[var(--border-color)]/50">
                        <div 
                          className="absolute left-0 top-0 bottom-0 bg-[var(--accent-orange)] transition-[width] duration-700 ease-out rounded-full"
                          style={{ width: `${animatedPercent}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2.5">
                    {CURRICULUM_DATA.map((level) => {
                      const isOpen = !!openLevels[level.id];
                      const hasLessons = level.lessons.length > 0;
                      const containsCurrent = isLessonPage && level.lessons.some((l) => l.id === currentLessonId);
                      const IconComponent = LEVEL_ICON_MAP[level.iconName] || Brain;
                      const levelCompletedCount = user ? level.lessons.filter((l) => isLessonCompleted(l.id)).length : 0;
                      const isLevelFullyCompleted = user && level.lessons.length > 0 && levelCompletedCount === level.lessons.length;

                      return (
                        <div
                          key={level.id}
                          className={`rounded-2xl transition-all duration-300 overflow-hidden ${
                            containsCurrent
                              ? 'glass-card border-[var(--accent-orange)]/70 ring-1 ring-[var(--accent-orange)]/40 shadow-[0_0_18px_rgba(241,143,1,0.14)]'
                              : level.isComingSoon
                              ? 'glass-card border-[var(--border-color)] opacity-60'
                              : 'glass-card border-[var(--border-color)]'
                          }`}
                        >
                          {/* Clickable Level Header Button with Focused Brand Hover Glow */}
                          <button
                            type="button"
                            onClick={() => toggleLevel(level.id, level.isComingSoon)}
                            className="w-full flex items-center justify-between p-3.5 sm:p-4 text-left cursor-pointer select-none hover:bg-[var(--card-hover)]/70 hover:text-[var(--accent-orange)] transition-all"
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${containsCurrent ? 'bg-[var(--accent-orange)] text-white' : 'bg-[var(--card-hover)] text-[var(--text-secondary)]'}`}>
                                <IconComponent className="w-4 h-4 stroke-[2]" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] font-mono font-extrabold text-[var(--accent-orange)]">LEVEL {level.levelNumber}</span>
                                  {isLevelFullyCompleted && !level.isComingSoon && (
                                    <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-[var(--accent-green)] text-white shrink-0">
                                      <CheckCircle2 className="w-2.5 h-2.5" /> 완료
                                    </span>
                                  )}
                                </div>
                                <h3 className="text-xs sm:text-sm font-extrabold text-[var(--text-primary)] truncate">{level.title}</h3>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0 ml-2">
                              {level.isComingSoon ? (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--accent-orange)]/10 text-[var(--text-secondary)] font-mono">
                                  준비 중
                                </span>
                              ) : (
                                <span className="text-[10px] text-[var(--text-secondary)] font-mono font-bold">
                                  {user ? `${levelCompletedCount}/${level.lessons.length}강` : `${level.lessons.length}강`}
                                </span>
                              )}
                              <ChevronDown className={`w-4 h-4 text-[var(--text-secondary)] transition-transform duration-300 ${isOpen ? 'rotate-180 text-[var(--accent-orange)]' : ''}`} />
                            </div>
                          </button>

                          {/* Smooth CSS Grid Accordion Transition */}
                          <div className={`grid transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                            <div className="overflow-hidden">
                              <div className="p-2 pt-0 space-y-1.5 border-t border-[var(--border-color)]/50">
                                {level.lessons.map((lesson, lessonIdx) => {
                                  const isActive = lesson.id === currentLessonId;
                                  const completed = Boolean(user && isLessonCompleted(lesson.id));
                                  return (
                                    <Link
                                      key={lesson.id}
                                      href={`/lesson/${lesson.id}`}
                                      onClick={() => {
                                        setIsExpanded(false);
                                        setDragY(null);
                                      }}
                                      className={`group/item flex items-center justify-between gap-2.5 p-2.5 rounded-xl text-xs transition-all ${
                                        isActive 
                                          ? 'bg-[var(--accent-orange)]/15 border border-[var(--accent-orange)] text-[var(--accent-orange)] font-black shadow-[0_0_12px_rgba(241,143,1,0.2)]' 
                                          : 'border border-[var(--border-color)]/70 bg-[var(--card-hover)]/40 hover:bg-[var(--card-hover)] hover:border-[var(--accent-orange)]/50 hover:shadow-[0_0_18px_rgba(241,143,1,0.18)]'
                                      }`}
                                    >
                                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${isActive ? 'bg-[var(--accent-orange)] text-white' : completed ? 'bg-[var(--accent-green)] text-white' : 'bg-[var(--card-hover)] text-[var(--text-secondary)]'}`}>
                                          {completed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <PlayCircle className="w-3.5 h-3.5" />}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                          <div className="flex items-center gap-1.5">
                                            <span className="text-[10px] font-mono text-[var(--text-secondary)]">{lessonIdx + 1}강</span>
                                            <span className="truncate font-bold text-[var(--text-primary)] group-hover/item:text-[var(--accent-orange)] transition-colors">{lesson.title}</span>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="shrink-0 text-[10px] text-[var(--text-secondary)] font-mono flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {lesson.duration}
                                      </div>
                                    </Link>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* B. TOOLS DIRECTORY VIEW */}
              {activeTab === 'tools' && (
                <div className="space-y-2.5">
                  {TOOLS_DIRECTORY.map((tool, idx) => {
                    const ToolIcon = tool.icon;
                    const isCurrent = !tool.isComingSoon && pathname.startsWith(tool.href);
                    
                    if (tool.isComingSoon) {
                      return (
                        <div
                          key={idx}
                          className="p-3.5 sm:p-4 rounded-2xl border border-[var(--border-color)] opacity-60 flex items-center justify-between gap-3 cursor-not-allowed bg-[var(--card-hover)]/30"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-xl bg-[var(--card-hover)] flex items-center justify-center text-[var(--text-secondary)] shrink-0">
                              <ToolIcon className="w-4 h-4 stroke-[1.8]" />
                            </div>
                            <div className="min-w-0">
                              <h3 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] truncate">{tool.title}</h3>
                              <p className="text-[11px] text-[var(--text-secondary)] truncate">{tool.description}</p>
                            </div>
                          </div>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[var(--text-secondary)]/10 text-[var(--text-secondary)] shrink-0">
                            오픈 예정
                          </span>
                        </div>
                      );
                    }

                    return (
                      <Link
                        key={idx}
                        href={tool.href}
                        onClick={() => {
                          setIsExpanded(false);
                          setDragY(null);
                        }}
                        className={`p-3.5 sm:p-4 rounded-2xl flex items-center justify-between gap-3 transition-all cursor-pointer ${
                          isCurrent 
                            ? 'bg-[var(--accent-orange)]/10 border border-[var(--accent-orange)] ring-1 ring-[var(--accent-orange)] shadow-[0_0_18px_rgba(241,143,1,0.25)]' 
                            : 'glass-card hover:bg-[var(--card-hover)] hover:border-[var(--accent-orange)]/50 hover:shadow-[0_0_18px_rgba(241,143,1,0.18)] border border-[var(--border-color)]'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            isCurrent ? 'bg-[var(--accent-orange)] text-white' : 'bg-[var(--card-hover)] text-[var(--text-secondary)]'
                          }`}>
                            <ToolIcon className="w-4 h-4 stroke-[2]" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <h3 className={`text-xs sm:text-sm font-extrabold truncate ${isCurrent ? 'text-[var(--accent-orange)]' : 'text-[var(--text-primary)]'}`}>
                                {tool.title}
                              </h3>
                              <span className="text-[10px] font-mono font-bold px-2 py-0.2 rounded-full bg-[var(--accent-orange)]/15 text-[var(--accent-orange)] shrink-0">
                                {tool.tag}
                              </span>
                            </div>
                            <p className="text-[11px] text-[var(--text-secondary)] truncate mt-0.5">{tool.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {isCurrent ? (
                            <span className="text-[9px] font-mono font-extrabold px-2 py-0.5 rounded-full bg-[var(--accent-orange)] text-white">이용 중</span>
                          ) : (
                            <ChevronRight className="w-4 h-4 text-[var(--text-secondary)]" />
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
