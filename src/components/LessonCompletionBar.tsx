'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { CheckCircle2, Circle } from 'lucide-react';
import { triggerConfetti } from '@/utils/confetti';

interface LessonCompletionBarProps {
  lessonId: string;
}

export default function LessonCompletionBar({ lessonId }: LessonCompletionBarProps) {
  const { user, isLessonCompleted, toggleLessonCompleted, openAuthPopover } = useAuth();
  const completed = Boolean(user && isLessonCompleted(lessonId));

  const handleToggle = () => {
    if (!user) {
      openAuthPopover();
      return;
    }

    toggleLessonCompleted(lessonId);

    // 완료 처리로 전환 시 축하 폭죽(Confetti) 실행
    if (!completed) {
      triggerConfetti();
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      title={
        completed
          ? '수강 완료된 강의입니다 (클릭하여 완료 취소)'
          : user
          ? '클릭하여 수강 완료로 표시'
          : '로그인하면 학습 기록이 계정에 저장돼요'
      }
      className={`group inline-flex items-center gap-1.5 h-8 px-3 sm:px-3.5 rounded-full text-xs font-semibold transition-all duration-200 active:scale-95 shrink-0 cursor-pointer select-none ${
        completed
          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 hover:shadow-[0_0_14px_rgba(16,185,129,0.22)] font-bold'
          : 'bg-[var(--card-surface)]/30 hover:bg-[var(--card-surface)]/80 text-[var(--text-secondary)] border border-[var(--border-color)]/70 hover:border-[var(--accent-orange)]/45 hover:text-[var(--text-primary)] hover:shadow-[0_0_12px_rgba(241,143,1,0.12)]'
      }`}
    >
      {completed ? (
        <>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 stroke-[2.4]" />
          <span>수강 완료</span>
        </>
      ) : (
        <>
          <Circle className="w-3.5 h-3.5 text-[var(--text-secondary)]/60 stroke-[1.8] group-hover:text-[var(--accent-orange)] transition-colors" />
          <span>수강 완료</span>
        </>
      )}
    </button>
  );
}

