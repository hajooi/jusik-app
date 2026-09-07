'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const STORAGE_DISMISSED_UNTIL_KEY = 'jusik_broker_benefit_dismissed_until';
const STORAGE_LAST_SEEN_DATE_KEY = 'jusik_broker_benefit_last_seen_date';
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

interface BrokerBenefitBannerProps {
  onDismiss?: () => void;
}

export default function BrokerBenefitBanner({ onDismiss }: BrokerBenefitBannerProps) {
  const [isClient, setIsClient] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsClient(true);

    try {
      // 1. 1-3(lv1-3) 수강 완료 유저는 영구 미노출 (비회원 로컬 & 로그인 회원 계정 모두 확인)
      let is13Completed = false;

      // 비회원 / 로컬 캐시 확인
      const localCompletedJson = localStorage.getItem('jusik_app_completed_lessons');
      if (localCompletedJson) {
        try {
          const list: string[] = JSON.parse(localCompletedJson);
          if (list.includes('lv1-3')) is13Completed = true;
        } catch {}
      }

      // 로그인 계정 데이터 확인
      if (!is13Completed) {
        const userJson = localStorage.getItem('jusik_app_user_account');
        if (userJson) {
          try {
            const parsedUser = JSON.parse(userJson);
            if (parsedUser.completedLessons?.includes('lv1-3')) is13Completed = true;
          } catch {}
        }
      }

      if (is13Completed) {
        return;
      }

      // 2. 사용자가 X를 눌러 7일간 숨김 중인지 확인
      const now = Date.now();
      const dismissedUntil = localStorage.getItem(STORAGE_DISMISSED_UNTIL_KEY);
      if (dismissedUntil && Number(dismissedUntil) > now) {
        return;
      }

      // 3. 오늘 이미 1회 노출되었는지 확인
      const todayStr = new Date().toISOString().slice(0, 10);
      const lastSeenDate = localStorage.getItem(STORAGE_LAST_SEEN_DATE_KEY);
      if (lastSeenDate === todayStr) {
        return;
      }
    } catch {
      // ignore
    }

    // 0.6초 뒤 프로필 아래로 자연스럽게 확장
    const enterTimer = setTimeout(() => {
      try {
        const todayStr = new Date().toISOString().slice(0, 10);
        localStorage.setItem(STORAGE_LAST_SEEN_DATE_KEY, todayStr);
      } catch {
        // ignore
      }
      setIsVisible(true);
    }, 600);

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
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsClosing(false);
      if (onDismiss) onDismiss();
    }, 260);
  };

  const handleManualClose = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsClosing(false);
      if (onDismiss) onDismiss();
    }, 260);

    try {
      // X를 클릭한 경우 7일간 숨김 기록
      const expireTime = Date.now() + SEVEN_DAYS_MS;
      localStorage.setItem(STORAGE_DISMISSED_UNTIL_KEY, String(expireTime));
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

  if (!isClient || !isVisible) return null;

  return (
    <div
      data-nosnippet="true"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`w-max max-w-[calc(100vw-1.5rem)] px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-full bg-white/95 dark:bg-[#18181b]/95 backdrop-blur-2xl border border-[var(--border-color)] hover:border-[var(--accent-orange)]/50 shadow-xl hover:shadow-[0_0_16px_rgba(241,143,1,0.18)] transition-all duration-300 group text-left ${
        isClosing ? 'animate-popover-shrink pointer-events-none' : 'animate-popover-expand'
      }`}
    >
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Link Clickable Area */}
        <Link
          href="/lesson/lv1-3"
          className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-semibold text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors whitespace-nowrap"
        >
          {/* 특별 제휴 뱃지 */}
          <span className="px-1.5 py-0.5 rounded-full bg-[var(--accent-orange)]/15 text-[var(--accent-orange)] font-bold text-[9.5px] sm:text-[10px] shrink-0">
            특별 제휴
          </span>

          {/* 문구: 말줄임 없이 온전하게 표기 */}
          <span className="whitespace-nowrap">
            해외주식 수수료{' '}
            <span className="text-[var(--accent-orange)] font-extrabold">평생 0.04%</span>
            {' '}적용
          </span>

          <ArrowRight className="w-3 h-3 text-[var(--accent-orange)] group-hover:translate-x-0.5 transition-transform duration-300 shrink-0" />
        </Link>

        {/* Separator Hairline */}
        <span className="w-px h-2.5 bg-[var(--border-color)] shrink-0 mx-0.5" />

        {/* Dismiss 'X' Button */}
        <button
          type="button"
          onClick={handleManualClose}
          className="p-0.5 rounded-full text-[var(--text-secondary)]/50 hover:text-[var(--text-primary)] hover:bg-[var(--card-hover)] transition-colors cursor-pointer shrink-0"
          aria-label="공지 닫기"
          title="이번 방문 동안 닫기"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
