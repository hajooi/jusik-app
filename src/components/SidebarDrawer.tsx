'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CURRICULUM_DATA } from '@/data/curriculum';
import { List, X, PlayCircle, CheckCircle2, ChevronRight } from 'lucide-react';

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

      <div className="space-y-5 max-h-[calc(100vh-140px)] overflow-y-auto px-0.5 py-1">
        {CURRICULUM_DATA.map((level) => (
          <div key={level.id} className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-extrabold text-[var(--text-secondary)] px-2 font-mono uppercase tracking-wider">
              <span>Lv. {level.levelNumber} · {level.badgeText}</span>
            </div>

            <div className="space-y-1">
              {level.lessons.map((lesson) => {
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
                        // Smooth slide out animation before route navigation
                        e.preventDefault();
                        handleClose(() => {
                          window.location.href = `/lesson/${lesson.id}`;
                        });
                      }
                    }}
                    className={`group flex items-center gap-3 p-3 rounded-2xl text-xs transition-all duration-300 ${
                      isActive
                        ? 'bg-[var(--accent-orange)]/15 border-2 border-[var(--accent-orange)]/50 text-[var(--accent-orange)] font-extrabold shadow-md scale-[1.01]'
                        : 'text-[var(--text-primary)] hover:bg-[var(--card-hover)] hover:text-[var(--accent-orange)] font-medium'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      isActive 
                        ? 'bg-[var(--accent-orange)] text-white shadow-xs' 
                        : 'bg-[var(--bg-main)] text-[var(--text-secondary)] group-hover:text-[var(--accent-orange)] group-hover:bg-[var(--accent-orange)]/10'
                    }`}>
                      <PlayCircle className="w-4 h-4 stroke-[2.2]" />
                    </div>

                    <span className="truncate flex-1">{lesson.title}</span>

                    {isActive ? (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[var(--accent-orange)] text-white shrink-0 font-mono shadow-2xs">
                        학습 중
                      </span>
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-0 group-hover:opacity-100 text-[var(--accent-orange)] transition-opacity" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
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
        <div className={`fixed inset-0 z-[100] flex justify-start bg-black/40 backdrop-blur-sm ${
          isClosing ? 'animate-fade-out-overlay' : 'animate-fade-in-overlay'
        }`}>
          {/* Backdrop Overlay Click to Close */}
          <div 
            className="absolute inset-0" 
            onClick={() => handleClose()} 
          />

          {/* Sliding Panel with Smooth Side Animation & Brand Base Cream Surface */}
          <div className={`relative z-10 w-full max-w-xs glass-card h-full p-5 shadow-2xl overflow-y-auto ${
            isClosing ? 'animate-slide-out-left' : 'animate-slide-in-left'
          }`}>
            {renderContent()}
          </div>
        </div>
      )}
    </>
  );
}
