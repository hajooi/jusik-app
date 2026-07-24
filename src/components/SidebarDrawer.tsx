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

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsMobileOpen(false);
      setIsClosing(false);
    }, 260);
  };

  const handleOpen = () => {
    setIsClosing(false);
    setIsMobileOpen(true);
  };

  const renderContent = () => (
    <div className="space-y-4">
      {/* Top Header Row without harsh divider line */}
      <div className="flex items-center justify-between pb-1">
        <h3 className="text-sm font-extrabold flex items-center gap-2 text-[var(--text-primary)]">
          <List className="w-4.5 h-4.5 text-[var(--accent-orange)]" />
          전체 목차
        </h3>
        <button
          onClick={handleClose}
          className="p-1.5 rounded-full text-[var(--text-secondary)] hover:text-[var(--accent-orange)] glass-card glass-card-hover transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4 max-h-[calc(100vh-140px)] overflow-y-auto px-1 py-1">
        {CURRICULUM_DATA.map((level) => (
          <div key={level.id} className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-extrabold text-[var(--accent-orange)] px-2 py-0.5 font-mono">
              <span>Lv. {level.levelNumber} - {level.badgeText}</span>
            </div>

            <div className="space-y-1">
              {level.lessons.map((lesson) => {
                const isActive = lesson.id === currentLessonId;

                return (
                  <Link
                    key={lesson.id}
                    href={`/lesson/${lesson.id}`}
                    onClick={handleClose}
                    className={`flex items-center gap-2.5 p-3 rounded-2xl text-xs font-bold transition-all duration-300 ${
                      isActive
                        ? 'bg-[var(--accent-orange)]/15 text-[var(--accent-orange)] border-2 border-[var(--accent-orange)] shadow-xs'
                        : 'glass-card glass-card-hover text-[var(--text-primary)] hover:text-[var(--accent-orange)]'
                    }`}
                  >
                    <PlayCircle className={`w-4 h-4 shrink-0 ${isActive ? 'text-[var(--accent-orange)]' : 'text-[var(--text-secondary)]'}`} />
                    <span className="truncate flex-1">{lesson.title}</span>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 shrink-0 text-[var(--accent-orange)]" />}
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
            onClick={handleClose} 
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
