'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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

const COLLAPSED_HEIGHT = 52;
const COLLAPSED_WIDTH = 268;

export default function BottomNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLessonCompleted, completedLessons } = useAuth();

  // Expanded State of the Drawer
  const [isExpanded, setIsExpanded] = useState(false);
  // Active Tab View: 'curriculum' | 'tools'
  const [activeTab, setActiveTab] = useState<'curriculum' | 'tools'>('curriculum');

  // Real-time Dragging State (Mobile touch physics)
  const [isDragging, setIsDragging] = useState(false);
  const [dragY, setDragY] = useState<number | null>(null);

  const startYRef = useRef(0);
  const isDraggingRef = useRef(false);
  const didMoveRef = useRef(false);
  const sheetHeightRef = useRef(580);
  const maxSheetWidthRef = useRef(576);
  const rafRef = useRef<number | null>(null);

  const isHomePage = pathname === '/';
  const isLessonPage = pathname.startsWith('/lesson/');
  const isOnCurriculum = isHomePage || isLessonPage;
  const isOnTools = pathname.startsWith('/tools');
  const isToolsSubPage = pathname.startsWith('/tools/') && pathname !== '/tools';
  const currentLessonId = isLessonPage ? pathname.split('/lesson/')[1] : '';

  // Scroll active state for translucent auto-fade while scrolling
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolling(true);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 200);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  // Lock background body & html scroll on iOS/Android when drawer is open
  useEffect(() => {
    if (isExpanded) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isExpanded]);

  // Drawer inner content scroll vs drawer pull-down detection (2-Step Gesture Protection & Bounce Cancellation)
  const contentRef = useRef<HTMLDivElement>(null);
  const contentTouchStartYRef = useRef(0);
  const isContentDraggingRef = useRef(false);
  const startedAtTopRef = useRef(false);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      if (!isExpanded) return;
      contentTouchStartYRef.current = e.touches[0].clientY;
      isContentDraggingRef.current = false;
      const scrollTop = el.scrollTop;
      startedAtTopRef.current = scrollTop <= 0;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isExpanded || !startedAtTopRef.current) return;
      const currentY = e.touches[0].clientY;
      const deltaY = contentTouchStartYRef.current - currentY; // negative when dragging down
      const scrollTop = el.scrollTop;

      // When dragging downwards from the top:
      if (scrollTop <= 0 && deltaY < -8) {
        if (e.cancelable) e.preventDefault(); // Stop native overscroll bounce completely to prevent 2x fast movement!
        isContentDraggingRef.current = true;
        setIsDragging(true);
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => {
          const maxDelta = sheetHeightRef.current - COLLAPSED_HEIGHT;
          const clamped = Math.max(-maxDelta, Math.min(0, deltaY));
          setDragY(clamped);
        });
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!isContentDraggingRef.current) return;
      isContentDraggingRef.current = false;
      setIsDragging(false);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);

      const currentY = e.changedTouches[0].clientY;
      const deltaY = contentTouchStartYRef.current - currentY;
      const threshold = (sheetHeightRef.current - COLLAPSED_HEIGHT) * 0.25;

      if (deltaY < -threshold) {
        setIsExpanded(false);
      }
      setDragY(null);
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    el.addEventListener('touchcancel', onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
      el.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [isExpanded]);

  // Screen width & viewport-based max sheet dimensions
  const [screenWidth, setScreenWidth] = useState(400);
  const [isMobileScreen, setIsMobileScreen] = useState(false);
  const prevWidthRef = useRef(0);

  useEffect(() => {
    const updateDimensions = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const isMob = w < 640;
      
      // On mobile devices, vertical scrolling collapses/expands browser URL bar which changes innerHeight continuously.
      // We only recalculate sheet height when width changes (orientation change / resize) or on initial load to avoid pill morphing/jitter.
      const widthChanged = Math.abs(prevWidthRef.current - w) > 2;
      if (widthChanged || prevWidthRef.current === 0) {
        prevWidthRef.current = w;
        setScreenWidth(w);
        setIsMobileScreen(isMob);
        sheetHeightRef.current = Math.min(h * 0.78, 600);
        maxSheetWidthRef.current = Math.min(isMob ? w : 576, 576);
      }
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

  // Window-level safety cleanup to prevent stuck mouse drag
  useEffect(() => {
    const handleWindowPointerUp = () => {
      if (isDraggingRef.current) {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        isDraggingRef.current = false;
        setIsDragging(false);
        setDragY(null);
      }
    };
    window.addEventListener('pointerup', handleWindowPointerUp);
    window.addEventListener('pointercancel', handleWindowPointerUp);
    return () => {
      window.removeEventListener('pointerup', handleWindowPointerUp);
      window.removeEventListener('pointercancel', handleWindowPointerUp);
    };
  }, []);

  const canPullDrawer = isLessonPage || isToolsSubPage || isExpanded;

  // Pointer drag gestures for sheet pulling
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!canPullDrawer) return;

    // On desktop mouse, don't capture drag pointer when clicking nav/buttons so clicks fire instantly
    if (e.pointerType === 'mouse' && (e.target as HTMLElement).closest('button, nav, a')) {
      return;
    }

    startYRef.current = e.clientY;
    isDraggingRef.current = true;
    didMoveRef.current = false;
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const currentY = e.clientY;
    const deltaY = startYRef.current - currentY; // positive when dragging UP

    if (Math.abs(deltaY) > 8) {
      didMoveRef.current = true;
      setIsDragging(true);

      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
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
      });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    isDraggingRef.current = false;
    setIsDragging(false);

    const currentY = e.clientY;
    const deltaY = startYRef.current - currentY;

    if (didMoveRef.current) {
      if (isExpanded) {
        if (deltaY < -60) {
          setIsExpanded(false);
        } else {
          setIsExpanded(true);
        }
      } else {
        if (deltaY > 40) {
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

  // Smart Tab click handler (Clean & instant navigation)
  const handleTabClick = (targetTab: 'curriculum' | 'tools', href: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (isExpanded) {
      if (activeTab === targetTab) {
        setIsExpanded(false);
      } else {
        setActiveTab(targetTab);
      }
      return;
    }

    // When collapsed on subpages (lessons or tools), tapping either tab opens the drawer directly!
    if (isLessonPage || isToolsSubPage) {
      setActiveTab(targetTab);
      setIsExpanded(true);
      return;
    }

    // When collapsed on main hubs (Home / and Tools /tools):
    if (targetTab === 'curriculum') {
      if (isHomePage) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        router.push('/');
      }
    } else if (targetTab === 'tools') {
      if (pathname === '/tools') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        router.push('/tools');
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
  const [isMounted, setIsMounted] = useState(false);
  const [transitionsEnabled, setTransitionsEnabled] = useState(false);
  useEffect(() => {
    setIsMounted(true);
    const timer = setTimeout(() => setTransitionsEnabled(true), 120);
    return () => clearTimeout(timer);
  }, []);

  // Apple Music Style: Always a sleek 52px floating pill when collapsed across ALL pages
  const baseCollapsedHeight = 52;
  const baseCollapsedWidth = 268;

  // Real-time GPU clip-path calculation (Fixed size container, 100% GPU hardware clipping)
  const maxTargetWidth = maxSheetWidthRef.current;
  const targetSheetHeight = sheetHeightRef.current;
  const topInset = Math.round((1 - progress) * (targetSheetHeight - baseCollapsedHeight));
  const horizontalInset = Math.max(0, Math.round((1 - progress) * ((maxTargetWidth - baseCollapsedWidth) / 2)));
  const currentRadius = Math.round(26 + progress * (30 - 26));
  const currentClipPath = `inset(${topInset}px ${horizontalInset}px 0px ${horizontalInset}px round ${currentRadius}px)`;

  // Continuous Header & Nav geometry interpolation (Zero abrupt jumps)
  const currentHeaderHeight = Math.round(52 + progress * (78 - 52));
  const currentNavBottom = Math.round(2 + progress * (16 - 2));
  const currentNotchOpacity = progress > 0.15 ? Math.min(1, (progress - 0.15) / 0.5) : 0;

  // Active indicator state for smooth animated pill position
  const activeIndicatorTab = isExpanded ? activeTab : (isOnTools ? 'tools' : 'curriculum');

  // Stats calculation
  const completedCount = completedLessons?.length || 0;
  const totalLessonCount = CURRICULUM_DATA.reduce((acc, lvl) => acc + lvl.lessons.length, 0);
  const progressPercent = totalLessonCount > 0 ? Math.round((completedCount / totalLessonCount) * 100) : 0;

  // Animated progress bar fill state (triggers smooth 0.7s fill upon expand)
  const [animatedPercent, setAnimatedPercent] = useState(0);
  useEffect(() => {
    if (isExpanded) {
      const timer = setTimeout(() => {
        setAnimatedPercent(progressPercent);
      }, 150);
      return () => clearTimeout(timer);
    } else {
      setAnimatedPercent(0);
    }
  }, [isExpanded, progressPercent]);

  return (
    <>
      {/* 1. Backdrop Dimming (z-[99] covers top sticky Navbar and Account profile) */}
      <div
        className="fixed inset-0 z-[99] bg-black/60 backdrop-blur-xs transition-opacity pointer-events-none will-change-opacity"
        style={{
          opacity: progress * 0.65,
          pointerEvents: progress > 0.05 ? 'auto' : 'none',
          transition: !transitionsEnabled || isDragging ? 'none' : 'opacity 0.38s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onTouchMove={(e) => e.preventDefault()}
        onClick={() => {
          setIsExpanded(false);
          setDragY(null);
        }}
      />

      {/* 2. THE ADAPTIVE PHYSICAL BOTTOM DRAWER / FLOATING PILL BACKGROUND SHELL (z-[100]) */}
      <div className="fixed inset-x-0 bottom-3 z-[100] flex justify-center items-end select-none pointer-events-none p-0 isolate">
        <div
          className="pointer-events-auto overflow-hidden flex flex-col will-change-[clip-path] touch-none origin-bottom bg-white/95 dark:bg-[#121215]/95 backdrop-blur-xl relative"
          style={{
            height: `${targetSheetHeight}px`,
            width: `${maxTargetWidth}px`,
            maxWidth: '100%',
            opacity: 1,
            pointerEvents: 'auto',
            clipPath: currentClipPath,
            WebkitClipPath: currentClipPath,
            transform: 'translate3d(0, 0, 0)',
            WebkitTransform: 'translate3d(0, 0, 0)',
            transition: !transitionsEnabled || isDragging 
              ? 'none' 
              : 'clip-path 0.38s cubic-bezier(0.16, 1, 0.3, 1), -webkit-clip-path 0.38s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* 1:1 Pixel-Perfect Dynamic Glass Border (360-degree perfect rounded curvature & full bottom border) */}
          <div
            aria-hidden="true"
            className="absolute pointer-events-none z-50 border border-[var(--border-color)]/90 shadow-[0_4px_24px_rgba(0,0,0,0.18)]"
            style={{
              top: `${topInset}px`,
              left: `${horizontalInset}px`,
              right: `${horizontalInset}px`,
              bottom: '0px',
              borderRadius: `${currentRadius}px`,
              transition: !transitionsEnabled || isDragging 
                ? 'none' 
                : 'top 0.38s cubic-bezier(0.16, 1, 0.3, 1), left 0.38s cubic-bezier(0.16, 1, 0.3, 1), right 0.38s cubic-bezier(0.16, 1, 0.3, 1), border-radius 0.38s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />

          {/* Top Header Area (Floating Fixed Overlay with Progressive Glass Blur, z-20) */}
          <div 
            className="w-full absolute top-0 inset-x-0 select-none flex flex-col items-center touch-none cursor-default z-20 pointer-events-none"
            style={{
              height: `${currentHeaderHeight}px`,
              minWidth: '264px',
              transform: `translate3d(0, ${topInset}px, 0)`,
              WebkitTransform: `translate3d(0, ${topInset}px, 0)`,
              transition: !transitionsEnabled || isDragging ? 'none' : 'transform 0.38s cubic-bezier(0.16, 1, 0.3, 1), -webkit-transform 0.38s cubic-bezier(0.16, 1, 0.3, 1), height 0.38s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            {/* Apple Native Multi-stage Diffuse Progressive Blur System */}
            <div 
              className="absolute inset-x-0 -top-3 -bottom-8 pointer-events-none overflow-hidden transition-opacity duration-300"
              style={{ opacity: progress > 0.05 ? progress : 0 }}
            >
              {/* Step 1: Broad ambient diffuse blur */}
              <div 
                className="absolute inset-0 bg-[var(--bg-main)]/35 backdrop-blur-[3px]"
                style={{
                  maskImage: 'linear-gradient(to bottom, black 0%, black 65%, transparent 100%)',
                  WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 65%, transparent 100%)'
                }}
              />
              {/* Step 2: Mid diffuse blur */}
              <div 
                className="absolute inset-x-0 top-0 h-14 bg-[var(--bg-main)]/35 backdrop-blur-[8px]"
                style={{
                  maskImage: 'linear-gradient(to bottom, black 0%, black 55%, transparent 100%)',
                  WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 55%, transparent 100%)'
                }}
              />
              {/* Step 3: Deep shape-breaking blur */}
              <div 
                className="absolute inset-x-0 top-0 h-9 bg-[var(--bg-main)]/45 backdrop-blur-[16px]"
                style={{
                  maskImage: 'linear-gradient(to bottom, black 0%, black 45%, transparent 100%)',
                  WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 45%, transparent 100%)'
                }}
              />
            </div>

            {/* Dedicated Notch Grab Handle Bar (Continuous smooth fade in) */}
            <div 
              aria-hidden="true"
              className={`absolute top-[7px] left-1/2 -translate-x-1/2 w-12 h-[2.5px] rounded-full bg-slate-400/85 dark:bg-zinc-500/85 shadow-2xs z-10 ${
                progress > 0.05 ? 'cursor-grab active:cursor-grabbing pointer-events-auto' : 'pointer-events-none'
              }`} 
              style={{
                opacity: currentNotchOpacity,
                transition: !transitionsEnabled || isDragging ? 'none' : 'opacity 0.38s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            />

            {/* The 264px Navigation Tab Bar (Centered & Smoothly positioned, 48px touch height) */}
            <nav 
              aria-label="하단 내비게이션"
              className="w-[264px] h-[48px] absolute left-1/2 -translate-x-1/2 flex items-center justify-around overflow-hidden rounded-full p-0.5 shrink-0 pointer-events-auto cursor-default z-10"
              style={{
                bottom: `${currentNavBottom}px`,
                transition: !transitionsEnabled || isDragging ? 'none' : 'bottom 0.38s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              {/* Exact 50:50 Centered Sliding Orange Highlight Surface with Tinted Glass Texture */}
              <div 
                className="absolute top-0.5 bottom-0.5 rounded-full bg-[var(--accent-orange)]/18 backdrop-blur-md border border-[var(--accent-orange)]/60 shadow-[0_0_16px_rgba(241,143,1,0.28)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none"
                style={{
                  width: 'calc(50% - 2px)',
                  left: activeIndicatorTab === 'curriculum' ? '2px' : 'calc(50% + 0px)',
                }}
              />

              {/* Tab 1: 커리큘럼 */}
              <button
                type="button"
                onClick={(e) => handleTabClick('curriculum', '/', e)}
                className={`relative z-10 w-1/2 h-full flex items-center justify-center gap-1.5 py-2 px-3.5 rounded-full transition-colors duration-200 cursor-pointer ${
                  activeIndicatorTab === 'curriculum'
                    ? 'text-[var(--accent-orange)] font-black'
                    : 'text-[var(--text-secondary)] font-bold hover:text-[var(--text-primary)]'
                }`}
              >
                <BookOpen className="w-[18px] h-[18px] stroke-[2.2] shrink-0" />
                <span className="text-[13px] tracking-tight whitespace-nowrap font-bold">커리큘럼</span>
              </button>

              {/* Tab 2: 투자도구 */}
              <button
                type="button"
                onClick={(e) => handleTabClick('tools', '/tools', e)}
                className={`relative z-10 w-1/2 h-full flex items-center justify-center gap-1.5 py-2 px-3.5 rounded-full transition-colors duration-200 cursor-pointer ${
                  activeIndicatorTab === 'tools'
                    ? 'text-[var(--accent-orange)] font-black'
                    : 'text-[var(--text-secondary)] font-bold hover:text-[var(--text-primary)]'
                }`}
              >
                <Wrench className="w-[18px] h-[18px] stroke-[2.2] shrink-0" />
                <span className="text-[13px] tracking-tight whitespace-nowrap font-bold">투자도구</span>
              </button>
            </nav>
          </div>

          {/* ==================================================== */}
          {/* REVEALED DRAWER CONTENT AREA (Synchronized Slide & Depth Blur) */}
          {/* ==================================================== */}
          <div 
            ref={contentRef}
            className="absolute inset-0 overflow-y-auto overscroll-contain px-4 sm:px-6 pt-[86px] pb-6 space-y-4 touch-pan-y [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden z-10 will-change-[opacity,transform,filter]"
            style={{
              contain: 'paint layout',
              opacity: progress > 0.08 ? Math.min(1, (progress - 0.08) / 0.72) : 0,
              filter: progress < 0.99 ? `blur(${(Math.max(0, (1 - progress) * 10)).toFixed(1)}px)` : 'none',
              WebkitFilter: progress < 0.99 ? `blur(${(Math.max(0, (1 - progress) * 10)).toFixed(1)}px)` : 'none',
              pointerEvents: progress > 0.6 ? 'auto' : 'none',
              minWidth: '320px',
              maxWidth: '100%',
              transformOrigin: 'top center',
              transform: `translate3d(0, ${topInset}px, 0) scale(${0.96 + progress * 0.04})`,
              WebkitTransform: `translate3d(0, ${topInset}px, 0) scale(${0.96 + progress * 0.04})`,
              transition: !transitionsEnabled || isDragging 
                ? 'none' 
                : 'opacity 0.38s cubic-bezier(0.16, 1, 0.3, 1), filter 0.38s cubic-bezier(0.16, 1, 0.3, 1), -webkit-filter 0.38s cubic-bezier(0.16, 1, 0.3, 1), transform 0.38s cubic-bezier(0.16, 1, 0.3, 1), -webkit-transform 0.38s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {/* A. CURRICULUM TOC VIEW */}
            {activeTab === 'curriculum' && (
              <div className="space-y-4 pt-2">
                {/* Progress Header Card */}
                {user && (
                  <div className="p-4 rounded-2xl bg-[var(--card-hover)]/40 border border-[var(--border-color)] space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-[var(--text-secondary)] flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-[var(--accent-green)]" />
                        학습 진도
                      </span>
                      <span className="font-mono text-[var(--accent-orange)] font-extrabold">
                        {completedCount} / {totalLessonCount}강 ({progressPercent}%)
                      </span>
                    </div>
                    {/* Animated Progress Fill Bar */}
                    <div className="relative w-full h-2 rounded-full bg-[var(--card-hover)] overflow-hidden border border-[var(--border-color)]/50">
                      <div 
                        className="h-full rounded-full bg-[var(--accent-orange)] shadow-[0_0_8px_rgba(241,143,1,0.3)] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                        style={{ width: `${animatedPercent}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2.5">
                  {CURRICULUM_DATA.map((level) => {
                    const isOpen = !!openLevels[level.id];
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
                        {/* Clickable Level Header Button */}
                        <button
                          type="button"
                          onClick={() => toggleLevel(level.id, level.isComingSoon)}
                          className="w-full flex items-center justify-between p-3 sm:p-3.5 text-left cursor-pointer select-none hover:bg-[var(--card-hover)]/70 hover:text-[var(--accent-orange)] transition-all"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${containsCurrent ? 'bg-[var(--accent-orange)] text-white' : 'bg-[var(--card-hover)] text-[var(--text-secondary)]'}`}>
                              <IconComponent className="w-4 h-4 stroke-[2]" />
                            </div>
                            <div className="flex items-center gap-1.5 min-w-0 flex-1">
                              <h3 className="text-xs sm:text-sm font-extrabold text-[var(--text-primary)] truncate">
                                {level.title}
                              </h3>
                              <span className="text-[10px] font-mono font-bold px-2 py-0.2 rounded-full bg-[var(--accent-orange)]/15 text-[var(--accent-orange)] shrink-0">
                                Lv.{level.levelNumber}
                              </span>
                              {isLevelFullyCompleted && !level.isComingSoon && (
                                <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-[var(--accent-green)] text-white shrink-0">
                                  <CheckCircle2 className="w-2.5 h-2.5" /> 완료
                                </span>
                              )}
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
                            <div className="p-2 pt-1 space-y-1.5">
                              {level.lessons.map((lesson) => {
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
                                        <span className="truncate font-bold text-[var(--text-primary)] group-hover/item:text-[var(--accent-orange)] transition-colors">
                                          {lesson.title}
                                        </span>
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
                        className="p-3 sm:p-3.5 rounded-2xl border border-[var(--border-color)] opacity-60 flex items-center justify-between gap-3 cursor-not-allowed bg-[var(--card-hover)]/30"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-[var(--card-hover)] flex items-center justify-center text-[var(--text-secondary)] shrink-0">
                            <ToolIcon className="w-4 h-4 stroke-[1.8]" />
                          </div>
                          <h3 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] truncate">{tool.title}</h3>
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
                      className={`p-3 sm:p-3.5 rounded-2xl flex items-center justify-between gap-3 transition-all cursor-pointer ${
                        isCurrent 
                          ? 'bg-[var(--accent-orange)]/15 border border-[var(--accent-orange)] shadow-[0_0_14px_rgba(241,143,1,0.22)]' 
                          : 'glass-card hover:bg-[var(--card-hover)] hover:border-[var(--accent-orange)]/50 hover:shadow-[0_0_18px_rgba(241,143,1,0.18)] border border-[var(--border-color)]'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          isCurrent ? 'bg-[var(--accent-orange)] text-white' : 'bg-[var(--card-hover)] text-[var(--text-secondary)]'
                        }`}>
                          <ToolIcon className="w-4 h-4 stroke-[2]" />
                        </div>
                        <div className="flex items-center gap-1.5 min-w-0">
                          <h3 className={`text-xs sm:text-sm font-extrabold truncate ${isCurrent ? 'text-[var(--accent-orange)]' : 'text-[var(--text-primary)]'}`}>
                            {tool.title}
                          </h3>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.2 rounded-full bg-[var(--accent-orange)]/15 text-[var(--accent-orange)] shrink-0">
                            {tool.tag}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {!isCurrent && (
                          <ChevronRight className="w-4 h-4 text-[var(--text-secondary)]" />
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
