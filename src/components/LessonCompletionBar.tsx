'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { CheckCircle2, Circle, UserCheck } from 'lucide-react';
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
            <span className="text-[var(--accent-green)] font-bold">
              수강 완료! 학습 기록이 {user?.nickname} 계정에 보관되었습니다.
            </span>
          ) : user ? (
            <span className="text-[var(--text-secondary)]">
              영상을 끝까지 보시면 학습 기록이 자동 저장됩니다.
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
        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 active:scale-95 shrink-0 cursor-pointer ${
          completed
            ? 'bg-[var(--accent-green)] text-white hover:bg-[var(--accent-green)]/90 hover:shadow-[0_0_18px_rgba(36,97,59,0.35)] shadow-sm'
            : 'btn-secondary !rounded-full !py-2.5 !px-4'
        }`}
      >
        {completed ? (
          <>
            <CheckCircle2 className="w-4 h-4 text-white" />
            <span>수강 완료 ✓</span>
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
