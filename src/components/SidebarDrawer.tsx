'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CURRICULUM_DATA } from '@/data/curriculum';
import { List, X, PlayCircle, ChevronDown } from 'lucide-react';

interface SidebarDrawerProps {
  currentLessonId: string;
}

export default function SidebarDrawer({ currentLessonId }: SidebarDrawerProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = (onComplete?: () => void) => {
    setIsClosing(true);
    setTimeout(() => {
      setIsMobileOpen(false);
      setIsClosing(false);
      if (onComplete) onComplete();
    }, 260);
  };

  const handleOpen = () => {
    setIsClosing(false);
    setIsMobileOpen(true);
  };

  // Find current level to auto-expand it by default
  const [openLevels, setOpenLevels] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    CURRICULUM_DATA.forEach((lvl) => {
      const containsCurrent = lvl.lessons.some((l) => l.id === currentLessonId);
      initial[lvl.id] = containsCurrent || lvl.levelNumber === 0 || lvl.levelNumber === 1;
    });
    return initial;
  });

  const toggleLevel = (levelId: string) => {
    setOpenLevels((prev) => ({
      ...prev,
      [levelId]: !prev[levelId],
    }));
  };

  const renderContent = () => (
    <div className="space-y-5">
      {/* Top Header Row */}
      <div className="flex items-center justify-between pb-1">
        <h3 className="text-base font-black flex items-center gap-2 text-[var(--text-primary)] tracking-tight">
          <List className="w-5 h-5 text-[var(--accent-orange)]" />
          전체 목차
        </h3>
        <button
          onClick={() => handleClose()}
          className="p-2 rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--card-hover)] transition-colors active:scale-95"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3 max-h-[calc(100vh-140px)] overflow-y-auto px-0.5 py-1">
        {CURRICULUM_DATA.map((level) => {
          const isOpen = !!openLevels[level.id];
          const hasLessons = level.lessons.length > 0;
          const containsCurrent = level.lessons.some((l) => l.id === currentLessonId);

          return (
            <div
              key={level.id}
              className={`rounded-2xl transition-all duration-200 ${
                containsCurrent
                  ? 'bg-[var(--card-surface)] border border-[var(--accent-orange)]/30 shadow-[0_0_15px_rgba(241,143,1,0.12)]'
                  : 'bg-[var(--card-surface)]/50 border border-transparent hover:border-[var(--accent-orange)]/30 hover:bg-[var(--card-hover)]'
              }`}
            >
              {/* Level Accordion Header Button */}
              <button
                onClick={() => toggleLevel(level.id)}
                className="w-full flex items-center justify-between p-3 rounded-2xl text-xs font-bold transition-all text-left active:scale-[0.99]"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full font-mono shrink-0 ${
                      containsCurrent
                        ? 'bg-[var(--accent-orange)] text-white shadow-2xs'
                        : 'bg-[var(--accent-orange)]/15 text-[var(--accent-orange)]'
                    }`}
                  >
                    Lv. {level.levelNumber}
                  </span>
                  <span className={`truncate text-xs font-extrabold ${containsCurrent ? 'text-[var(--accent-orange)]' : 'text-[var(--text-primary)]'}`}>
                    {level.title}
                  </span>
                  {hasLessons && (
                    <span className="text-[10px] text-[var(--text-secondary)] font-medium shrink-0">
                      ({level.lessons.length})
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-1">
                  {level.isComingSoon && (
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-[var(--bg-main)] text-[var(--text-secondary)] font-bold">
                      준비 중
                    </span>
                  )}
                  <ChevronDown
                    className={`w-4 h-4 text-[var(--text-secondary)] transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[var(--accent-orange)]' : ''
                    }`}
                  />
                </div>
              </button>

              {/* Accordion Content (Lessons List) */}
              {isOpen && (
                <div className="space-y-1 p-2 pt-0">
                  {hasLessons ? (
                    level.lessons.map((lesson) => {
                      const isActive = lesson.id === currentLessonId;

                      return (
                        <Link
                          key={lesson.id}
                          href={`/lesson/${lesson.id}`}
                          onClick={(e) => {
                            if (isActive) {
                              e.preventDefault();
                              handleClose();
                            } else {
                              setIsMobileOpen(false);
                              setIsClosing(false);
                            }
                          }}
                          className={`group flex items-center gap-2.5 p-2.5 rounded-xl text-xs transition-all duration-200 ${
                            isActive
                              ? 'bg-[var(--accent-orange)]/15 text-[var(--accent-orange)] font-black border border-[var(--accent-orange)]/30'
                              : 'text-[var(--text-primary)] hover:bg-[var(--card-hover)] hover:text-[var(--accent-orange)] font-medium'
                          }`}
                        >
                          <div
                            className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                              isActive
                                ? 'bg-[var(--accent-orange)] text-white'
                                : 'bg-[var(--bg-main)] text-[var(--text-secondary)] group-hover:text-[var(--accent-orange)]'
                            }`}
                          >
                            <PlayCircle className="w-3.5 h-3.5 stroke-[2]" />
                          </div>

                          <span className="truncate flex-1">{lesson.title}</span>

                          {isActive && (
                            <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-[var(--accent-orange)] text-white shrink-0 font-mono">
                              학습 중
                            </span>
                          )}
                        </Link>
                      );
                    })
                  ) : (
                    <div className="p-3 text-center text-xs text-[var(--text-secondary)] font-medium bg-[var(--bg-main)]/50 rounded-xl">
                      강의 준비 중입니다 🚀
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      {/* Top Header Left-aligned Drawer Trigger Button */}
      <button
        onClick={handleOpen}
        className="inline-flex items-center gap-2 font-bold text-xs sm:text-sm text-[var(--text-primary)] hover:text-[var(--accent-orange)] transition-all duration-300 glass-card glass-card-hover px-4 py-2 rounded-full shadow-2xs active:scale-95"
      >
        <List className="w-4 h-4 text-[var(--accent-orange)]" />
        <span>전체 목차</span>
      </button>

      {/* Left Slide-over Modal with Backdrop Blur Overlay (z-[100] covers bottom nav) */}
      {(isMobileOpen || isClosing) && (
        <div className={`fixed inset-0 z-[100] flex justify-start bg-black/15 backdrop-blur-[2px] ${
          isClosing ? 'animate-fade-out-overlay' : 'animate-fade-in-overlay'
        }`}>
          {/* Backdrop Overlay Click to Close */}
          <div 
            className="absolute inset-0" 
            onClick={() => handleClose()} 
          />

          {/* Sliding Panel with Smooth Side Animation & Pure Brand Base Cream Surface */}
          <div className={`relative z-10 w-full max-w-xs bg-[var(--bg-main)] border-r border-[var(--border-color)] h-full p-5 shadow-2xl overflow-y-auto ${
            isClosing ? 'animate-slide-out-left' : 'animate-slide-in-left'
          }`}>
            {renderContent()}
          </div>
        </div>
      )}
    </>
  );
}
