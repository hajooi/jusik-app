'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { X, Crown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const STORAGE_DISMISSED_UNTIL_KEY = 'jusik_broker_benefit_dismissed_until';
const SESSION_SHOWN_KEY = 'jusik_broker_benefit_session_shown';
const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

interface BrokerBenefitBannerProps {
  onDismiss?: () => void;
}

export default function BrokerBenefitBanner({ onDismiss }: BrokerBenefitBannerProps) {
  // 1-3강 비활성화(금감원/증권사 요청)에 따라 제휴 배너 전체 비활성화
  return null;

  const { completedLessons } = useAuth();
  const [isClient, setIsClient] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    setIsClient(true);

    try {
      // 1. 1-3(lv1-3) 수강 완료 유저는 영구 미노출 (AuthContext 및 비회원/로컬 캐시 확인)
      let is13Completed = completedLessons?.includes('lv1-3') || false;

      // 비회원 / 로컬 캐시 확인
      if (!is13Completed) {
        const localCompletedJson = localStorage.getItem('jusik_app_completed_lessons');
        if (localCompletedJson) {
          try {
            const list: string[] = JSON.parse(localCompletedJson);
            if (list.includes('lv1-3')) is13Completed = true;
          } catch {}
        }
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

      // 2. 사용자가 X를 눌러 3일간 숨김 중인지 확인 (localStorage)
      const now = Date.now();
      const dismissedUntil = localStorage.getItem(STORAGE_DISMISSED_UNTIL_KEY);
      if (dismissedUntil && Number(dismissedUntil) > now) {
        return;
      }

      // 3. 이번 접속(세션) 중 이미 1회 노출되었는지 확인 (sessionStorage)
      const sessionShown = sessionStorage.getItem(SESSION_SHOWN_KEY);
      if (sessionShown === 'true') {
        return;
      }

      // 위 조건을 모두 통과했으므로 이번 접속(세션) 노출 처리 기록
      sessionStorage.setItem(SESSION_SHOWN_KEY, 'true');
    } catch {
      // ignore
    }

    // 0.6초 뒤 프로필 아래로 자연스럽게 확장 (유저가 X를 누르기 전까지 이번 화면에서 유지)
    const enterTimer = setTimeout(() => {
      setIsVisible(true);
    }, 600);

    return () => {
      clearTimeout(enterTimer);
    };
  }, [completedLessons]);

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
      // X를 클릭한 경우 3일간(72시간) 숨김 기록 + 세션 노출 완료 유지
      const expireTime = Date.now() + THREE_DAYS_MS;
      localStorage.setItem(STORAGE_DISMISSED_UNTIL_KEY, String(expireTime));
      sessionStorage.setItem(SESSION_SHOWN_KEY, 'true');
    } catch {
      // ignore
    }
  };

  const handleLinkClick = () => {
    setIsVisible(false);
    if (onDismiss) onDismiss();
  };

  if (!isClient || !isVisible) return null;

  return (
    <div
      data-nosnippet="true"
      className={`w-max max-w-[calc(100vw-1.5rem)] px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-full bg-white/95 dark:bg-[#18181b]/95 backdrop-blur-2xl border border-[var(--border-color)] hover:border-[var(--accent-orange)]/50 shadow-xl hover:shadow-[0_0_16px_rgba(241,143,1,0.18)] transition-all duration-300 group text-left ${
        isClosing ? 'animate-popover-shrink pointer-events-none' : 'animate-popover-expand'
      }`}
    >
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Link Clickable Area */}
        <Link
          href="/lesson/lv1-3"
          onClick={handleLinkClick}
          className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-semibold text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors whitespace-nowrap"
        >
          {/* 특별 제휴 뱃지 */}
          <span className="px-1.5 py-0.5 rounded-full bg-[var(--accent-orange)]/15 text-[var(--accent-orange)] font-bold text-[9.5px] sm:text-[10px] shrink-0">
            특별 제휴
          </span>

          {/* 문구: 해외주식 수수료 평생 0.04% + PRO */}
          <span className="flex items-center gap-1 sm:gap-1.5 whitespace-nowrap">
            <span>
              해외주식 수수료 <span className="text-[var(--accent-orange)] font-extrabold">평생 0.04%</span> +
            </span>
            <span className="animate-pro-badge inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-black font-mono text-[var(--accent-orange)] bg-[var(--accent-orange)]/15 border border-[var(--accent-orange)]/40 shadow-2xs leading-none">
              <Crown className="w-2.5 h-2.5 stroke-[2.2] fill-[var(--accent-orange)]/20" />
              <span>PRO</span>
            </span>
          </span>
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
