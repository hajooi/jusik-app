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
      <div className="flex items-center justify-between pb-2 border-b border-[var(--border-color)]/30">
        <h3 className="text-sm font-bold flex items-center gap-2 text-[var(--text-primary)]">
          <List className="w-4 h-4 text-[var(--accent-orange)]" />
          전체 목차
        </h3>
        <button
          onClick={handleClose}
          className="p-1.5 rounded-full text-[var(--text-secondary)] hover:bg-[var(--card-hover)]"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4 max-h-[calc(100vh-140px)] overflow-y-auto px-1.5 py-1">
        {CURRICULUM_DATA.map((level) => (
          <div key={level.id} className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-[var(--text-secondary)] px-2 py-1">
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
                    className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-[var(--accent-orange)]/15 text-[var(--accent-orange)] font-bold border-2 border-[var(--accent-orange)] shadow-2xs outline-none'
                        : 'text-[var(--text-primary)] hover:bg-[var(--card-hover)]/70'
                    }`}
                  >
                    <PlayCircle className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[var(--accent-orange)]' : 'text-[var(--text-secondary)]'}`} />
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
