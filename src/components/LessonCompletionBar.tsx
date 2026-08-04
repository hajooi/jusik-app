'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { CheckCircle2, Circle, Sparkles, UserCheck } from 'lucide-react';
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
    <div className="flex items-center justify-between p-4 rounded-2xl glass-card border border-[var(--border-color)] transition-all duration-300 shadow-2xs">
      <div className="space-y-0.5 min-w-0 flex-1 pr-3">
        <div className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">
          강의 수강 상태
        </div>
        <p className="text-[11px] sm:text-xs font-medium leading-relaxed">
          {completed ? (
            <span className="text-[var(--accent-green)] font-bold inline-flex items-center gap-1 flex-wrap">
              <Sparkles className="w-3.5 h-3.5 text-[var(--accent-orange)] shrink-0 animate-bounce" />
              <span>🎉 완강 완료! 학습 기록이 {user?.nickname} 계정에 보관되었습니다.</span>
            </span>
          ) : user ? (
            <span className="text-[var(--text-secondary)]">
              영상 완강 시 수강 완료 처리 및 자동 보관됩니다.
            </span>
          ) : (
            <span className="text-[var(--text-secondary)]">
              로그인 시 강의 완료 여부가 기록됩니다.
            </span>
          )}
        </p>
      </div>

      <button
        type="button"
        onClick={handleToggle}
        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 active:scale-95 shadow-sm shrink-0 cursor-pointer ${
          completed
            ? 'bg-[var(--accent-green)] text-white hover:bg-[var(--accent-green)]/90 hover:shadow-[0_0_15px_rgba(36,97,59,0.3)]'
            : 'bg-[var(--card-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-color)] hover:border-[var(--accent-orange)]/40'
        }`}
      >
        {completed ? (
          <>
            <CheckCircle2 className="w-4 h-4 text-white" />
            <span>수강 완료됨 ✓</span>
          </>
        ) : user ? (
          <>
            <Circle className="w-4 h-4 text-[var(--accent-orange)]" />
            <span>수강 완료 체크하기</span>
          </>
        ) : (
          <>
            <UserCheck className="w-4 h-4 text-[var(--accent-orange)]" />
            <span>로그인 후 기록하기</span>
          </>
        )}
      </button>
    </div>
  );
}
