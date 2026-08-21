'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { PERSONALITY_PROFILES, TYPE_EMOJIS, calculateSurveyResult } from '@/data/investmentSurvey';
import { useAuth } from '@/context/AuthContext';
import { ArrowRight, X, HeartHandshake } from 'lucide-react';

export interface TypePreviewPopoverProps {
  typeCode: string;
  authorNickname?: string;
  typeScores?: { g: number; a: number; l: number; r: number };
  anchorRect?: { top: number; bottom: number; left: number; right: number; width: number; height: number } | null;
  onClose: () => void;
}

export default function TypePreviewPopover({
  typeCode,
  authorNickname,
  typeScores,
  anchorRect,
  onClose,
}: TypePreviewPopoverProps) {
  const { user } = useAuth();
  const popoverRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [currentScore, setCurrentScore] = useState(0);

  const profile = PERSONALITY_PROFILES[typeCode.toUpperCase()];
  const emoji = TYPE_EMOJIS[typeCode.toUpperCase()] || '🦉';

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close handler with smooth exit animation
  const handleClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 140);
  };

  // Close on outside click or ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 내 성향과의 궁합 계산 (로그인 & 진단 완료된 경우에만 노출)
  const myType = user?.investmentType && user.investmentType !== '미진단' ? user.investmentType.toUpperCase() : null;
  const myProfile = myType && PERSONALITY_PROFILES[myType] ? PERSONALITY_PROFILES[myType] : null;

  // 상대방 4대 축 점수 (g, a, l, r: 0~100)
  const code = profile?.code.toUpperCase() || '';
  const targetScores = {
    g: typeScores?.g ?? (code[0] === 'G' ? 70 : 30),
    a: typeScores?.a ?? (code[1] === 'A' ? 70 : 30),
    l: typeScores?.l ?? (code[2] === 'L' ? 70 : 30),
    r: typeScores?.r ?? (code[3] === 'R' ? 70 : 30),
  };

  let targetScore: number | null = null;
  let matchTitle = '';
  let matchColor = 'var(--accent-orange)';

  if (myProfile && profile) {
    // 내 4대 축 점수 계산 (설문 답변 기반 or 코드 기반)
    let myScores = {
      g: myType![0] === 'G' ? 70 : 30,
      a: myType![1] === 'A' ? 70 : 30,
      l: myType![2] === 'L' ? 70 : 30,
      r: myType![3] === 'R' ? 70 : 30,
    };

    if (user?.typeAnswers && Object.keys(user.typeAnswers).length > 0) {
      const myResult = calculateSurveyResult(user.typeAnswers);
      myScores = {
        g: myResult.scores.GS.G,
        a: myResult.scores.AP.A,
        l: myResult.scores.LT.L,
        r: myResult.scores.RI.R,
      };
    }

    // 상세 비교 모달과 100% 동일한 4대 축 점수 차이 계산
    const diffGS = Math.abs(targetScores.g - myScores.g);
    const diffAP = Math.abs(targetScores.a - myScores.a);
    const diffLT = Math.abs(targetScores.l - myScores.l);
    const diffRI = Math.abs(targetScores.r - myScores.r);

    const avgDiff = (diffGS + diffAP + diffLT + diffRI) / 4;
    targetScore = Math.max(20, Math.min(100, Math.round(100 - avgDiff)));

    if (targetScore >= 80) {
      matchTitle = '🔥 찰떡궁합! 투자 환상의 짝꿍';
      matchColor = 'var(--accent-green)';
    } else if (targetScore >= 60) {
      matchTitle = '🤝 조화로운 시너지! 좋은 동반자';
      matchColor = 'var(--accent-orange)';
    } else {
      matchTitle = '⚡ 극과 극! 상보적 보완 관계';
      matchColor = 'var(--text-secondary)';
    }
  }

  // 100% Synced Single Animation Loop: Wait for popover to fully expand (180ms delay) then animate 0 -> targetScore smoothly
  useEffect(() => {
    if (targetScore === null) return;

    let animFrameId: number;
    const delayTimer = setTimeout(() => {
      const duration = 1200; // 1.2s smooth fluid duration
      const startTime = performance.now();

      const runAnimation = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Apple Smooth Cubic Ease-Out
        const ease = 1 - Math.pow(1 - progress, 3);
        const val = Math.round(ease * targetScore!);
        setCurrentScore(val);

        if (progress < 1) {
          animFrameId = requestAnimationFrame(runAnimation);
        }
      };

      animFrameId = requestAnimationFrame(runAnimation);
    }, 180);

    return () => {
      clearTimeout(delayTimer);
      if (animFrameId) cancelAnimationFrame(animFrameId);
    };
  }, [targetScore]);

  if (!profile || !mounted) return null;

  // Construct target link with author scores if present, or generate code-based fallback scores
  const effectiveScores = targetScores;

  let targetHref = `/tools/type/${profile.code}`;
  if (authorNickname) {
    targetHref = `/tools/type/${profile.code}?u=${encodeURIComponent(authorNickname)}&g=${effectiveScores.g}&a=${effectiveScores.a}&l=${effectiveScores.l}&r=${effectiveScores.r}`;
  }

  // Position calculations with screen boundaries
  const popoverWidth = typeof window !== 'undefined' && window.innerWidth < 640 ? 290 : 320;
  let topStyle: number | undefined = undefined;
  let bottomStyle: number | undefined = undefined;
  let leftStyle = 16;

  if (anchorRect && typeof window !== 'undefined') {
    // Check if bottom has enough space (at least 320px)
    const spaceBelow = window.innerHeight - anchorRect.bottom;
    const spaceAbove = anchorRect.top;

    if (spaceBelow < 320 && spaceAbove > spaceBelow) {
      // Show above
      bottomStyle = window.innerHeight - anchorRect.top + 8;
    } else {
      // Show below
      topStyle = anchorRect.bottom + 8;
    }

    // Clamp left within viewport
    leftStyle = Math.max(12, Math.min(anchorRect.left, window.innerWidth - popoverWidth - 16));
  }

  const content = (
    <>
      {/* Outside click detector (transparent, no dimming) */}
      <div
        className="fixed inset-0 z-[9998] bg-transparent"
        onClick={handleClose}
      />

      <div
        ref={popoverRef}
        className={`fixed z-[9999] w-[290px] sm:w-[320px] p-5 rounded-2xl bg-[var(--bg-main)] shadow-[0_16px_48px_rgba(0,0,0,0.3)] dark:shadow-[0_16px_48px_rgba(0,0,0,0.75)] space-y-3.5 border border-[var(--border-color)] text-left cursor-default opacity-100 ${
          isClosing ? 'animate-popover-shrink' : 'animate-popover-expand'
        }`}
        style={{
          top: topStyle !== undefined ? `${topStyle}px` : undefined,
          bottom: bottomStyle !== undefined ? `${bottomStyle}px` : undefined,
          left: `${leftStyle}px`,
          transformOrigin: bottomStyle !== undefined ? 'bottom left' : 'top left',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Emoji on Right & Close Button */}
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-0.5 min-w-0 flex-1">
            <span className="inline-block text-[11px] font-mono font-black text-[var(--accent-orange)] px-2 py-0.5 rounded-md bg-[var(--accent-orange)]/15 tracking-wider">
              {profile.code}
            </span>
            <h4 className="text-base font-extrabold text-[var(--text-primary)] tracking-tight truncate">
              {profile.name}
            </h4>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Animal Emoji Avatar */}
            <div className="w-10 h-10 rounded-xl bg-[var(--card-surface)] border border-[var(--border-color)] flex items-center justify-center text-2xl select-none shadow-2xs">
              {emoji}
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="p-1 rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--card-hover)] transition-all cursor-pointer"
              aria-label="닫기"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 1-Line Tagline / Brief Description */}
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-medium bg-[var(--card-surface)] p-3 rounded-xl border border-[var(--border-color)]">
          {profile.tagline || profile.description.slice(0, 70) + '...'}
        </p>

        {/* Optional Chemistry Score (Only when current user is logged in & surveyed) */}
        {targetScore !== null && (
          <div className="pt-2 border-t border-[var(--border-color)] space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="flex items-center gap-1.5 text-[var(--text-primary)]">
                <HeartHandshake className="w-3.5 h-3.5 text-[var(--accent-orange)]" />
                내 성향과의 궁합
              </span>
              <span className="font-mono font-black text-[var(--accent-orange)]">
                {currentScore}%
              </span>
            </div>

            {/* Score Progress Bar: 100% Synced directly with currentScore */}
            <div className="w-full h-2 rounded-full bg-[var(--card-surface)] overflow-hidden border border-[var(--border-color)] p-0.5">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${currentScore}%`,
                  backgroundColor: matchColor,
                }}
              />
            </div>

            <p className="text-[11px] text-[var(--text-secondary)] font-medium">
              {matchTitle}
            </p>
          </div>
        )}

        {/* CTA: Full Report Link */}
        <div className="pt-1">
          <Link
            href={targetHref}
            onClick={handleClose}
            className="w-full py-2.5 px-4 rounded-xl bg-[var(--accent-orange)] hover:opacity-90 active:scale-98 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs"
          >
            <span>상세 리포트 보기</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </>
  );

  return createPortal(content, document.body);
}
