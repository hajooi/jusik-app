'use client';

import React, { useState, useEffect } from 'react';
import { X, Check, Copy } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const SESSION_STORAGE_KEY = 'jusik_hide_ribbon_oct26';
const USER_STORAGE_KEY = 'jusik_app_user_account';

export default function AnnouncementRibbon() {
  const { isPro } = useAuth();

  // Synchronously determine if ribbon should be eligible to display to avoid any FOUC / layout flash
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    try {
      if (sessionStorage.getItem(SESSION_STORAGE_KEY) === 'true') return true;
      const rawUser = localStorage.getItem(USER_STORAGE_KEY);
      if (rawUser) {
        const u = JSON.parse(rawUser);
        const validPro = !!(u.proExpiresAt ? new Date(u.proExpiresAt).getTime() > Date.now() : u.isPro === true);
        if (validPro) return true;
      }
    } catch {
      // ignore
    }
    return false;
  });

  const [isScrolledDown, setIsScrolledDown] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (isPro) {
      setIsDismissed(true);
      return;
    }
    try {
      if (sessionStorage.getItem(SESSION_STORAGE_KEY) === 'true') {
        setIsDismissed(true);
      }
    } catch {
      // ignore
    }
  }, [isPro]);

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

  const handleCopyCode = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText('JU26');
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy promo code:', err);
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
        {/* True 100% Optical Center: Announcement Content */}
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 justify-center text-center">
          <span className="px-2 py-0.5 rounded-full bg-[var(--card-hover)] text-[var(--text-secondary)] font-bold text-[10px] sm:text-[10.5px] border border-[var(--border-color)] tracking-tight shrink-0">
            ~10/31
          </span>
          
          <span className="text-[var(--text-secondary)] font-medium text-[11px] sm:text-xs whitespace-nowrap">
            PRO 멤버십 무료 코드:
          </span>

          {/* Interactive Promo Code Copy Capsule Button */}
          <button
            type="button"
            onClick={handleCopyCode}
            className={`inline-flex items-center font-mono font-black text-xs px-2.5 py-0.5 rounded-lg border transition-all cursor-pointer active:scale-95 shadow-2xs shrink-0 ${
              isCopied
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                : 'bg-[var(--accent-orange)]/15 hover:bg-[var(--accent-orange)]/25 border-[var(--accent-orange)]/40 text-[var(--accent-orange)] hover:shadow-[0_0_12px_rgba(241,143,1,0.25)]'
            }`}
            title="클릭하여 프로모션 코드 복사하기"
          >
            {isCopied ? (
              <span className="inline-flex items-center gap-0.5 text-xs text-emerald-400 font-bold">
                <Check className="w-3 h-3 stroke-[3]" />
                <span>JU26</span>
              </span>
            ) : (
              <span>JU26</span>
            )}
          </button>
        </div>

        {/* Right Fixed Dismiss Button (Does not offset center alignment) */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1 rounded-full hover:bg-[var(--card-hover)] transition-colors cursor-pointer shrink-0"
          title="공지 닫기"
          aria-label="공지 닫기"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
