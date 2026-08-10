'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Level } from '@/data/curriculum';
import { useAuth } from '@/context/AuthContext';
import { 
  ChevronDown, 
  PlayCircle, 
  Clock, 
  Brain, 
  ShoppingBag, 
  ShieldCheck, 
  PieChart, 
  TrendingUp, 
  Cpu, 
  CheckCircle2,
  Sparkles
} from 'lucide-react';

const ICON_MAP: Record<string, any> = {
  Brain,
  ShoppingBag,
  ShieldCheck,
  PieChart,
  TrendingUp,
  Cpu,
};

interface AccordionProps {
  levels: Level[];
}

export default function Accordion({ levels }: AccordionProps) {
  const [openLevelId, setOpenLevelId] = useState<string | null>(null);
  const { user, isLessonCompleted, completedLessons } = useAuth();

  const toggleLevel = (id: string, isComingSoon?: boolean) => {
    if (isComingSoon) return;
    setOpenLevelId((prev) => (prev === id ? null : id));
  };

  // 전체 레슨 수 계산
  const allLessons = levels.flatMap((l) => l.lessons);
  const totalLessonCount = allLessons.length;
  const completedCount = completedLessons.filter((id) => allLessons.some((l) => l.id === id)).length;
  const progressPercent = totalLessonCount > 0 ? Math.round((completedCount / totalLessonCount) * 100) : 0;

  // 상위 % 계산 (서버 DB 실제 수강회원 석차 백분율 우선 반영)
  const topPercentile = completedCount === 0 
    ? null 
    : (user?.rankPercentile ?? Math.max(1, Math.round(100 - (completedCount / totalLessonCount) * 99)));

  return (
    <div className="space-y-4 sm:space-y-5">
      
      {/* 🔒 로그인 한 상태(user)일 때만 내 학습 수강 진도율 프로그레스 바 표시 */}
      {user && (
        <div className="glass-card p-4 sm:p-5 rounded-2xl border border-[var(--border-color)] space-y-2.5 shadow-2xs animate-fade-in">
          {/* Top Row: Left Nickname / Right Percentile Badge */}
          <div className="flex items-center justify-between gap-2 text-xs sm:text-sm font-bold">
            <div className="flex items-center gap-1.5 text-[var(--text-primary)] min-w-0">
              <Sparkles className="w-4 h-4 text-[var(--accent-orange)] shrink-0" />
              <span className="truncate">{user.nickname}님의 학습 진도</span>
            </div>
            {topPercentile !== null && (
              <span className="shrink-0 text-[10px] sm:text-xs font-mono font-extrabold px-2.5 py-0.5 rounded-full bg-[var(--accent-orange)]/15 text-[var(--accent-orange)] border border-transparent">
                상위 {topPercentile}%
              </span>
            )}
          </div>

          {/* Progress Track with embedded count text */}
          <div className="relative w-full h-5 sm:h-5.5 rounded-full bg-[var(--card-hover)] overflow-hidden flex items-center justify-center border border-[var(--border-color)]">
            <div 
              className="absolute left-0 top-0 bottom-0 bg-[var(--accent-orange)] transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
            <span className="relative z-10 font-mono text-[10px] sm:text-xs font-extrabold text-[var(--text-primary)] drop-shadow-xs select-none px-2">
              {completedCount} / {totalLessonCount}강 완료
            </span>
          </div>
        </div>
      )}

      {/* Levels List */}
      {levels.map((level) => {
        const isOpen = openLevelId === level.id;
        const IconComponent = ICON_MAP[level.iconName] || Brain;
        
        // 로그인된 상태일 때만 레벨별 완료 카운트 계산
        const levelCompletedCount = user ? level.lessons.filter((l) => isLessonCompleted(l.id)).length : 0;
        const isLevelFullyCompleted = user && level.lessons.length > 0 && levelCompletedCount === level.lessons.length;

        return (
          <div
            key={level.id}
            className={`rounded-2xl overflow-hidden transition-all duration-300 glass-card ${
              isOpen 
                ? 'ring-1 ring-[var(--accent-orange)] shadow-md shadow-[0_0_16px_rgba(241,143,1,0.10)] border-[var(--accent-orange)]' 
                : level.isComingSoon
                ? 'shadow-2xs opacity-75'
                : 'glass-card-hover shadow-2xs'
            }`}
          >
            {/* Header / Accordion Button */}
            <button
              onClick={() => toggleLevel(level.id, level.isComingSoon)}
              className={`group/btn w-full px-4 py-3.5 sm:px-5 sm:py-4 text-left flex items-center justify-between gap-3 sm:gap-4 outline-none focus:outline-none transition-all duration-300 ${
                level.isComingSoon ? 'cursor-not-allowed opacity-75' : 'active:scale-[0.99]'
              }`}
            >
              <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 flex-1">
                {/* Level Icon Container */}
                <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${
                  isOpen 
                    ? 'text-[var(--accent-orange)] bg-[var(--accent-orange)]/15 scale-105 shadow-[0_0_12px_rgba(241,143,1,0.25)]' 
                    : 'text-[var(--text-secondary)] group-hover/btn:text-[var(--accent-orange)] bg-transparent'
                }`}>
                  <IconComponent className="w-5 h-5 stroke-[1.8]" />
                </div>

                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-mono font-bold text-[var(--accent-orange)] uppercase tracking-wider block">
                    LEVEL {level.levelNumber}
                  </span>
                  <div className="flex items-center gap-2">
                    <h3 className={`text-base sm:text-lg font-extrabold tracking-[-0.02em] transition-colors truncate ${
                      isOpen ? 'text-[var(--accent-orange)]' : 'text-[var(--text-primary)] group-hover/btn:text-[var(--accent-orange)]'
                    }`}>
                      {level.title}
                    </h3>
                    {isLevelFullyCompleted && !level.isComingSoon && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--accent-green)] text-white shrink-0">
                        <CheckCircle2 className="w-3 h-3" /> 완료
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Indicator */}
              {level.isComingSoon ? (
                <span className="text-[10px] sm:text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-[var(--text-secondary)]/10 text-[var(--text-secondary)] font-mono tracking-wider shrink-0 border border-[var(--border-color)]">
                  COMING SOON
                </span>
              ) : (
                <div className="flex items-center gap-2">
                  {user && (
                    <span className="text-xs text-[var(--text-secondary)] font-mono opacity-80">
                      {levelCompletedCount}/{level.lessons.length}
                    </span>
                  )}
                  <div className={`transition-transform duration-300 shrink-0 ${
                    isOpen ? 'rotate-180 text-[var(--accent-orange)]' : 'text-[var(--text-secondary)] opacity-50 group-hover/btn:opacity-100 group-hover/btn:text-[var(--accent-orange)]'
                  }`}>
                    <ChevronDown className="w-5 h-5 stroke-[1.8]" />
                  </div>
                </div>
              )}
            </button>

            {/* Accordion Content */}
            <div
              className={`grid transition-all duration-300 ease-out ${
                isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
              }`}
            >
              <div className="overflow-hidden bg-[var(--card-surface)]/30 backdrop-blur-md">
                <div className="p-3 sm:p-5 space-y-2">
                  {level.lessons.map((lesson) => {
                    const completed = Boolean(user && isLessonCompleted(lesson.id));

                    return (
                      <Link
                        key={lesson.id}
                        href={`/lesson/${lesson.id}`}
                        className={`group flex items-center justify-between p-3.5 sm:p-4 rounded-2xl glass-card glass-card-hover transition-all duration-300 shadow-sm border border-[var(--border-color)] active:scale-[0.98] ${
                          completed ? 'border-[var(--accent-green)] bg-[var(--accent-green)]/10' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl border flex items-center justify-center shrink-0 transition-all duration-300 shadow-2xs group-hover:scale-105 ${
                            completed 
                              ? 'bg-[var(--accent-green)] text-white border-[var(--accent-green)]' 
                              : 'bg-[var(--card-surface)] border border-[var(--border-color)] group-hover:border-[var(--accent-orange)]/40 group-hover:bg-[var(--accent-orange)]/15 text-[var(--accent-orange)]'
                          }`}>
                            {completed ? (
                              <CheckCircle2 className="w-5 h-5" />
                            ) : (
                              <PlayCircle className="w-5 h-5 stroke-[1.8]" />
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`text-sm sm:text-base font-bold transition-colors truncate ${
                                completed ? 'text-[var(--accent-green)] font-extrabold' : 'text-[var(--text-primary)] group-hover:text-[var(--accent-orange)]'
                              }`}>
                                {lesson.title}
                              </span>

                              {completed && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--accent-green)] text-white flex items-center gap-0.5">
                                  <CheckCircle2 className="w-3 h-3" /> 완료
                                </span>
                              )}

                              {lesson.interactiveToolType && !completed && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--accent-orange)]/15 text-[var(--accent-orange)]">
                                  {lesson.interactiveToolType === 'db_cta' && '실습 안내'}
                                  {lesson.interactiveToolType === 'type_test' && '성향 진단'}
                                  {lesson.interactiveToolType === 'calc' && '계산기'}
                                  {lesson.interactiveToolType === 'ai_prompt' && 'AI 툴'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          <span className="hidden sm:flex items-center gap-1 text-xs text-[var(--text-secondary)] font-mono glass-card px-2.5 py-1 rounded-lg">
                            <Clock className="w-3.5 h-3.5" />
                            {lesson.duration}
                          </span>
                          <span className={`text-xs sm:text-sm font-extrabold group-hover:translate-x-1 transition-all flex items-center gap-0.5 ${
                            completed ? 'text-[var(--accent-green)]' : 'text-[var(--text-secondary)] group-hover:text-[var(--accent-orange)]'
                          }`}>
                            {completed ? '다시보기' : '학습하기'}
                            <span>→</span>
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
