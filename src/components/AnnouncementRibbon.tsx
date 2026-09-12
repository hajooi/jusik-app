'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, ArrowRight } from 'lucide-react';

const SESSION_STORAGE_KEY = 'jusik_hide_ribbon_quiz_sep26';

export default function AnnouncementRibbon() {
  // Synchronously determine if ribbon was explicitly dismissed in this session
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    try {
      if (sessionStorage.getItem(SESSION_STORAGE_KEY) === 'true') return true;
    } catch {
      // ignore
    }
    return false;
  });

  const [isScrolledDown, setIsScrolledDown] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      if (sessionStorage.getItem(SESSION_STORAGE_KEY) === 'true') {
        setIsDismissed(true);
      }
    } catch {
      // ignore
    }
  }, []);

  // Scroll detection: collapse ribbon when scrolling down (scrollY > 15), restore when at the very top (scrollY <= 5)
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset || 0;
      if (scrollY > 15) {
        setIsScrolledDown(true);
      } else if (scrollY <= 5) {
        setIsScrolledDown(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDismissed(true);
    try {
      sessionStorage.setItem(SESSION_STORAGE_KEY, 'true');
    } catch {
      // Fallback if sessionStorage is blocked
    }
  };

  if (!isMounted || isDismissed) return null;

  const isVisible = !isScrolledDown;

  return (
    <div
      style={{
        maxHeight: isVisible ? '48px' : '0px',
        opacity: isVisible ? 1 : 0,
        transition: 'max-height 0.38s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.25s ease',
        pointerEvents: isVisible ? 'auto' : 'none',
      }}
      className="relative z-50 overflow-hidden bg-gradient-to-r from-[var(--accent-orange)]/10 via-amber-500/5 to-[var(--accent-orange)]/10 border-b border-[var(--border-color)]/80 backdrop-blur-md select-none"
    >
      <div className="relative max-w-4xl mx-auto px-8 sm:px-12 h-9 sm:h-9 flex items-center justify-center text-xs font-sans">
        {/* Optical Center: Single Quiz Event Banner */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 min-w-0">
          <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 dark:text-amber-400 font-bold text-[10px] sm:text-[10.5px] border border-amber-500/30 tracking-tight shrink-0">
            ~9/21
          </span>

          <Link
            href="/tools/terms?challenger=%EC%A3%BC%EC%8B%9D%EB%B6%80%EC%97%89&level=1&score=15&time=90"
            className="inline-flex items-center gap-1 text-[var(--text-primary)] hover:text-[var(--accent-orange)] font-medium text-[11px] sm:text-xs transition-colors group truncate"
          >
            <span className="truncate">
              ☕ <strong>커피 30잔!</strong> 주식부엉을 이겨라 퀴즈 배틀
            </span>
            <span className="inline-flex items-center font-bold text-[var(--accent-orange)] shrink-0 group-hover:translate-x-0.5 transition-transform text-[11px]">
              도전하기
              <ArrowRight className="w-3 h-3 ml-0.5" />
            </span>
          </Link>
        </div>

        {/* Right Fixed Dismiss Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1 rounded-full hover:bg-[var(--card-hover)] transition-colors cursor-pointer shrink-0 z-10"
          title="공지 닫기"
          aria-label="공지 닫기"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
