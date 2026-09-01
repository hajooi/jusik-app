'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, X } from 'lucide-react';

const SESSION_STORAGE_KEY = 'jusik_hide_broker_benefit_toast';

export default function BrokerBenefitBanner() {
  const [isClient, setIsClient] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsClient(true);

    try {
      if (sessionStorage.getItem(SESSION_STORAGE_KEY) === 'true') {
        return;
      }
    } catch {
      // ignore
    }

    // 0.5초 뒤 부드럽게 등장
    const enterTimer = setTimeout(() => {
      setIsVisible(true);
    }, 500);

    // 9초 후 자동 퇴장
    timerRef.current = setTimeout(() => {
      handleDismiss();
    }, 9000);

    return () => {
      clearTimeout(enterTimer);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
  };

  const handleManualClose = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsVisible(false);
    try {
      sessionStorage.setItem(SESSION_STORAGE_KEY, 'true');
    } catch {
      // ignore
    }
  };

  const handleMouseEnter = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const handleMouseLeave = () => {
    timerRef.current = setTimeout(() => {
      handleDismiss();
    }, 4500);
  };

  if (!isClient) return null;

  return (
    <div
      data-nosnippet="true"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="grid overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
      style={{
        gridTemplateRows: isVisible ? '1fr' : '0fr',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0px) scale(1)' : 'translateY(-4px) scale(0.98)',
        pointerEvents: isVisible ? 'auto' : 'none',
      }}
    >
      <div className="min-h-0 overflow-hidden py-0.5">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-1.5 rounded-full bg-[var(--card-surface)]/90 hover:bg-[var(--card-hover)] dark:bg-zinc-900/90 border border-[var(--border-color)] hover:border-[var(--accent-orange)]/40 shadow-xs hover:shadow-[0_0_18px_rgba(241,143,1,0.14)] backdrop-blur-xl transition-all duration-300 group max-w-full">
          {/* Link Clickable Area */}
          <Link
            href="/lesson/lv1-3"
            className="flex items-center gap-2 text-xs sm:text-[13px] font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors min-w-0"
          >
            {/* 특별 제휴 뱃지 */}
            <span className="px-2 py-0.5 rounded-full bg-[var(--accent-orange)]/15 text-[var(--accent-orange)] font-bold text-[10.5px] shrink-0">
              특별 제휴
            </span>
            <span className="truncate">
              해외주식 수수료{' '}
              <span className="text-[var(--accent-orange)] font-extrabold">평생 0.04%</span>
              {' '}적용받기
            </span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-300 shrink-0 text-[var(--accent-orange)] ml-0.5" />
          </Link>

          {/* Dismiss 'X' Button */}
          <button
            type="button"
            onClick={handleManualClose}
            className="p-1 -mr-1 rounded-full text-[var(--text-secondary)]/50 hover:text-[var(--text-primary)] hover:bg-[var(--card-hover)] transition-colors cursor-pointer shrink-0"
            aria-label="공지 닫기"
            title="이번 방문 동안 닫기"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
