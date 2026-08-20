'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { Trophy, Timer, CheckCircle2, ArrowRight, X } from 'lucide-react';

export interface TermsQuizPreviewPopoverProps {
  authorNickname?: string;
  termsQuiz?: {
    level?: number;
    score?: number;
    correctCount?: number;
    totalQuestions?: number;
    timeSpentSec?: number;
    percentile?: number;
    badgeName?: string;
  };
  anchorRect?: { top: number; bottom: number; left: number; right: number; width: number; height: number } | null;
  onClose: () => void;
}

export default function TermsQuizPreviewPopover({
  authorNickname,
  termsQuiz,
  anchorRect,
  onClose,
}: TermsQuizPreviewPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 140);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
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

  if (!mounted) return null;

  const quiz = termsQuiz;
  const percentile = quiz?.percentile || 3;
  const level = quiz?.level || 1;
  const correctCount = quiz?.correctCount ?? 14;
  const totalQuestions = quiz?.totalQuestions ?? 15;
  const timeSpentSec = quiz?.timeSpentSec ?? 72.4;
  const badgeName = quiz?.badgeName || `상위 ${percentile}%`;

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainingSecs = Math.floor(sec % 60);
    const millis = Math.floor((sec % 1) * 100);
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}.${millis.toString().padStart(2, '0')}`;
  };

  const levelTitles: Record<number, string> = {
    1: 'Lv.1 초급',
    2: 'Lv.2 중급',
    3: 'Lv.3 고급',
    4: 'Lv.4 마스터',
  };

  // Position calculations identical to TypePreviewPopover
  const popoverWidth = typeof window !== 'undefined' && window.innerWidth < 640 ? 290 : 320;
  let topStyle: number | undefined = undefined;
  let bottomStyle: number | undefined = undefined;
  let leftStyle = 16;

  if (anchorRect && typeof window !== 'undefined') {
    const spaceBelow = window.innerHeight - anchorRect.bottom;
    const spaceAbove = anchorRect.top;

    if (spaceBelow < 280 && spaceAbove > spaceBelow) {
      bottomStyle = window.innerHeight - anchorRect.top + 8;
    } else {
      topStyle = anchorRect.bottom + 8;
    }

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
        {/* Header with Close Button */}
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-0.5 min-w-0 flex-1">
            <span className="inline-block text-[11px] font-mono font-black text-[var(--accent-orange)] px-2 py-0.5 rounded-md bg-[var(--accent-orange)]/15 tracking-wider">
              {badgeName}
            </span>
            <h4 className="text-base font-extrabold text-[var(--text-primary)] tracking-tight truncate">
              {authorNickname ? `${authorNickname} 님의 기록` : '실전 용어 퀴즈 성적'}
            </h4>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--card-hover)] transition-colors cursor-pointer shrink-0"
            title="닫기"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Level Info */}
        <div className="text-xs font-semibold text-[var(--text-secondary)]">
          {levelTitles[level] || `Lv.${level} 퀴즈`}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2.5 rounded-xl bg-[var(--card-surface)] border border-[var(--border-color)] space-y-0.5">
            <span className="text-[10px] text-[var(--text-secondary)] font-medium">맞힌 정답</span>
            <p className="text-sm font-extrabold text-[var(--accent-orange)] font-mono">
              {correctCount} / {totalQuestions}문항
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-[var(--card-surface)] border border-[var(--border-color)] space-y-0.5">
            <span className="text-[10px] text-[var(--text-secondary)] font-medium">소요 시간</span>
            <p className="text-sm font-extrabold text-[var(--text-primary)] font-mono">
              {formatTime(timeSpentSec)}
            </p>
          </div>
        </div>

        {/* Action Link (1:1 Battle Challenge Mode) */}
        <div className="pt-1">
          <Link
            href={
              authorNickname
                ? `/tools/terms?challenger=${encodeURIComponent(authorNickname)}&level=${level}&score=${correctCount}&time=${timeSpentSec}`
                : '/tools/terms'
            }
            onClick={handleClose}
            className="w-full py-2.5 px-3.5 rounded-xl bg-[var(--accent-orange)] hover:bg-[var(--accent-orange)]/90 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
          >
            <span>이 기록 깨러 가기</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </>
  );

  return createPortal(content, document.body);
}
