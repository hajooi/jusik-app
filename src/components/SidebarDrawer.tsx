'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CURRICULUM_DATA } from '@/data/curriculum';
import { useAuth } from '@/context/AuthContext';
import { 
  X, 
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
  BookOpen
} from 'lucide-react';

const ICON_MAP: Record<string, any> = {
  Brain,
  ShoppingBag,
  ShieldCheck,
  PieChart,
  TrendingUp,
  Cpu,
};

interface SidebarDrawerProps {
  currentLessonId: string;
}

export default function SidebarDrawer({ currentLessonId }: SidebarDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isLessonCompleted, completedLessons } = useAuth();

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleOpen = () => {
    setIsOpen(true);
  };

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Find current level to auto-expand ONLY the current level by default
  const [openLevels, setOpenLevels] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    CURRICULUM_DATA.forEach((lvl) => {
      const containsCurrent = lvl.lessons.some((l) => l.id === currentLessonId);
      initial[lvl.id] = containsCurrent;
    });
    return initial;
  });

  const toggleLevel = (levelId: string, isComingSoon?: boolean) => {
    if (isComingSoon) return;
    setOpenLevels((prev) => ({
      ...prev,
      [levelId]: !prev[levelId],
    }));
  };

  // Stats calculation
  const allLessons = CURRICULUM_DATA.flatMap((l) => l.lessons);
  const totalLessonCount = allLessons.length;
  const completedCount = completedLessons.filter((id) => allLessons.some((l) => l.id === id)).length;
  const progressPercent = totalLessonCount > 0 ? Math.round((completedCount / totalLessonCount) * 100) : 0;

  // Current lesson & level info for header
  const currentLevel = CURRICULUM_DATA.find((lvl) => lvl.lessons.some((l) => l.id === currentLessonId));

  const renderContent = () => (
    <div className="flex flex-col h-full overflow-hidden select-none">
      {/* 1. Modal Top Bar / Header */}
      <div className="p-4 sm:p-6 pb-3 sm:pb-4 border-b border-[var(--border-color)]/80 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-[var(--accent-orange)]/15 border border-[var(--accent-orange)]/30 flex items-center justify-center text-[var(--accent-orange)] shrink-0 shadow-2xs">
            <BookOpen className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-[var(--text-primary)] tracking-tight truncate">
                전체 커리큘럼 목차
              </h2>
              {currentLevel && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[var(--accent-orange)]/15 text-[var(--accent-orange)] font-mono shrink-0">
                  Lv.{currentLevel.levelNumber} 진행 중
                </span>
              )}
            </div>
            <p className="text-[11px] sm:text-xs text-[var(--text-secondary)] font-medium truncate">
              초보자 맞춤형 단계별 정규 주식 강좌 아카이브
            </p>
          </div>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="p-2 rounded-full bg-[var(--card-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-color)]/60 hover:border-[var(--border-color)] transition-all active:scale-90 cursor-pointer shrink-0"
          title="목차 닫기"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 sm:space-y-4 overscroll-contain">
        {/* User Progress Banner (when logged in) */}
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
            <div className="relative w-full h-2.5 rounded-full bg-[var(--card-hover)] overflow-hidden border border-[var(--border-color)]/50">
              <div 
                className="absolute left-0 top-0 bottom-0 bg-[var(--accent-orange)] transition-[width] duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Levels Accordion List */}
        <div className="space-y-3">
          {CURRICULUM_DATA.map((level) => {
            const isOpen = !!openLevels[level.id];
            const hasLessons = level.lessons.length > 0;
            const containsCurrent = level.lessons.some((l) => l.id === currentLessonId);
            const IconComponent = ICON_MAP[level.iconName] || Brain;

            const levelCompletedCount = user ? level.lessons.filter((l) => isLessonCompleted(l.id)).length : 0;
            const isLevelFullyCompleted = user && level.lessons.length > 0 && levelCompletedCount === level.lessons.length;

            return (
              <div
                key={level.id}
                className={`rounded-2xl transition-all duration-300 overflow-hidden ${
                  containsCurrent
                    ? 'glass-card border-[var(--accent-orange)]/60 ring-1 ring-[var(--accent-orange)]/40 shadow-[0_0_18px_rgba(241,143,1,0.14)]'
                    : level.isComingSoon
                    ? 'glass-card border-[var(--border-color)] opacity-70'
                    : 'glass-card glass-card-hover border-[var(--border-color)]'
                }`}
              >
                {/* Level Header Button */}
                <button
                  type="button"
                  onClick={() => toggleLevel(level.id, level.isComingSoon)}
                  className={`w-full flex items-center justify-between p-3.5 sm:p-4 text-left transition-all outline-none ${
                    level.isComingSoon ? 'cursor-not-allowed' : 'cursor-pointer active:scale-[0.99]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Level Icon */}
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${
                        containsCurrent
                          ? 'bg-[var(--accent-orange)] text-white shadow-2xs'
                          : isOpen
                          ? 'bg-[var(--accent-orange)]/15 text-[var(--accent-orange)]'
                          : 'bg-[var(--bg-main)] text-[var(--text-secondary)]'
                      }`}
                    >
                      <IconComponent className="w-4 h-4 stroke-[2]" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono font-extrabold text-[var(--accent-orange)] uppercase tracking-wider">
                          LEVEL {level.levelNumber}
                        </span>
                        {isLevelFullyCompleted && !level.isComingSoon && (
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-[var(--accent-green)] text-white shrink-0">
                            <CheckCircle2 className="w-2.5 h-2.5" /> 완료
                          </span>
                        )}
                      </div>
                      <h3 className={`text-xs sm:text-sm font-extrabold truncate ${
                        containsCurrent ? 'text-[var(--accent-orange)]' : 'text-[var(--text-primary)]'
                      }`}>
                        {level.title}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    {level.isComingSoon ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--accent-orange)]/10 text-[var(--text-secondary)] font-mono">
                        준비 중
                      </span>
                    ) : hasLessons ? (
                      <span className="text-[10px] text-[var(--text-secondary)] font-mono font-bold">
                        {user ? `${levelCompletedCount}/${level.lessons.length}강` : `${level.lessons.length}강`}
                      </span>
                    ) : null}

                    {!level.isComingSoon && (
                      <ChevronDown
                        className={`w-4 h-4 text-[var(--text-secondary)] transition-transform duration-300 ${
                          isOpen ? 'rotate-180 text-[var(--accent-orange)]' : ''
                        }`}
                      />
                    )}
                  </div>
                </button>

                {/* Level Lessons Accordion Content */}
                <div
                  className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
                    isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="p-2 pt-0 space-y-1.5 border-t border-[var(--border-color)]/50">
                      {hasLessons ? (
                        level.lessons.map((lesson, lessonIdx) => {
                          const isActive = lesson.id === currentLessonId;
                          const completed = Boolean(user && isLessonCompleted(lesson.id));

                          return (
                            <Link
                              key={lesson.id}
                              href={`/lesson/${lesson.id}`}
                              onClick={handleClose}
                              className={`group/item flex items-center justify-between gap-2.5 p-2.5 sm:p-3 rounded-xl text-xs transition-all duration-200 cursor-pointer ${
                                isActive
                                  ? 'bg-[var(--accent-orange)]/15 border border-[var(--accent-orange)] text-[var(--accent-orange)] font-extrabold shadow-[0_0_14px_rgba(241,143,1,0.2)]'
                                  : completed
                                  ? 'border border-[var(--accent-green)]/30 bg-[var(--accent-green)]/10 text-[var(--text-primary)] font-medium hover:border-[var(--accent-orange)] hover:text-[var(--accent-orange)]'
                                  : 'border border-[var(--border-color)]/70 bg-[var(--bg-main)]/60 text-[var(--text-primary)] hover:bg-[var(--card-hover)] hover:border-[var(--accent-orange)]/50 hover:text-[var(--accent-orange)] font-medium'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                <div
                                  className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                                    isActive
                                      ? 'bg-[var(--accent-orange)] text-white'
                                      : completed
                                      ? 'bg-[var(--accent-green)] text-white'
                                      : 'bg-[var(--card-hover)] text-[var(--text-secondary)] group-hover/item:text-[var(--accent-orange)]'
                                  }`}
                                >
                                  {completed ? (
                                    <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                                  ) : (
                                    <PlayCircle className="w-3.5 h-3.5 stroke-[2]" />
                                  )}
                                </div>

                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] font-mono text-[var(--text-secondary)] font-bold shrink-0">
                                      {lessonIdx + 1}강
                                    </span>
                                    <span className="truncate text-xs font-bold">
                                      {lesson.title}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                {isActive ? (
                                  <span className="text-[9px] font-mono font-extrabold px-2 py-0.5 rounded-full bg-[var(--accent-orange)] text-white shadow-2xs animate-pulse">
                                    학습 중
                                  </span>
                                ) : completed ? (
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[var(--accent-green)]/15 text-[var(--accent-green)] flex items-center gap-0.5">
                                    완료
                                  </span>
                                ) : lesson.duration ? (
                                  <span className="text-[10px] text-[var(--text-secondary)] font-mono flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {lesson.duration}
                                  </span>
                                ) : null}
                              </div>
                            </Link>
                          );
                        })
                      ) : (
                        <div className="p-3 text-center text-xs text-[var(--text-secondary)] font-medium bg-[var(--bg-main)]/50 rounded-xl">
                          강의 준비 중입니다 🚀
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Top Header Left-aligned Drawer Trigger Button (Signature HIG Capsule Pill) */}
      <button
        type="button"
        onClick={handleOpen}
        className="inline-flex items-center gap-2 font-bold text-xs sm:text-sm text-[var(--text-primary)] hover:text-[var(--accent-orange)] transition-all duration-300 glass-card glass-card-hover px-3.5 sm:px-4 py-2 rounded-full shadow-2xs active:scale-95 cursor-pointer"
      >
        <BookOpen className="w-4 h-4 text-[var(--accent-orange)]" />
        <span>전체 목차</span>
      </button>

      {/* Modern HIG & M3 Modal / Bottom Sheet Presentation */}
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center">
          {/* Backdrop Overlay */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-md animate-fade-in transition-opacity" 
            onClick={handleClose} 
          />

          {/* Mobile: iOS HIG Bottom Sheet (rounded-t-[32px]) | Desktop: M3 Glass Floating Modal (rounded-3xl) */}
          <div className="relative z-10 w-full sm:max-w-lg max-h-[85vh] sm:max-h-[80vh] rounded-t-[32px] sm:rounded-3xl bg-[var(--card-surface)]/95 backdrop-blur-2xl border border-[var(--border-color)] shadow-2xl overflow-hidden animate-modal-expand flex flex-col">
            {/* Mobile Top Drag Indicator Handle Pill */}
            <div className="sm:hidden w-10 h-1.2 rounded-full bg-[var(--border-color)]/80 mx-auto mt-2.5 mb-1 shrink-0" />
            
            {renderContent()}
          </div>
        </div>
      )}
    </>
  );
}
