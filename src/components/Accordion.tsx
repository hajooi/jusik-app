'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Level } from '@/data/curriculum';
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
  CheckCircle2 
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
  // Initially collapsed (no open level)
  const [openLevelId, setOpenLevelId] = useState<string | null>(null);

  const toggleLevel = (id: string, isComingSoon?: boolean) => {
    if (isComingSoon) return;
    setOpenLevelId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {levels.map((level) => {
        const isOpen = openLevelId === level.id;
        const IconComponent = ICON_MAP[level.iconName] || Brain;

        return (
          <div
            key={level.id}
            className={`rounded-2xl overflow-hidden transition-all duration-300 glass-card ${
              isOpen 
                ? 'ring-1 ring-[var(--accent-orange)]/60 shadow-md' 
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
                {/* Level Icon Container - Sleek minimal thin icon with balanced ratio */}
                <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${
                  isOpen 
                    ? 'text-[var(--accent-orange)] bg-[var(--accent-orange)]/15 scale-105' 
                    : 'text-[var(--text-secondary)] group-hover/btn:text-[var(--accent-orange)] bg-transparent'
                }`}>
                  <IconComponent className="w-4.5 h-4.5 stroke-[1.5]" />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className={`text-base sm:text-[17px] font-semibold tracking-[-0.02em] leading-snug truncate transition-colors ${
                    level.isComingSoon 
                      ? 'text-[var(--text-secondary)]' 
                      : isOpen 
                      ? 'text-[var(--accent-orange)] font-bold' 
                      : 'text-[var(--text-primary)] group-hover/btn:text-[var(--accent-orange)]'
                  }`}>
                    {level.title}
                  </h3>
                </div>
              </div>

              {/* Status Indicator: Coming Soon Badge or Clean Minimal Arrow */}
              {level.isComingSoon ? (
                <span className="text-[10px] sm:text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-[var(--text-secondary)]/10 text-[var(--text-secondary)] font-mono tracking-wider shrink-0 border border-[var(--border-color)]">
                  COMING SOON
                </span>
              ) : (
                <div className={`transition-transform duration-300 shrink-0 ${
                  isOpen ? 'rotate-180 text-[var(--accent-orange)]' : 'text-[var(--text-secondary)] opacity-50 group-hover/btn:opacity-100 group-hover/btn:text-[var(--accent-orange)]'
                }`}>
                  <ChevronDown className="w-5 h-5 stroke-[1.8]" />
                </div>
              )}
            </button>

            {/* Accordion Content - Lesson List without inner dividers */}
            <div
              className={`grid transition-all duration-300 ease-out ${
                isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
              }`}
            >
              <div className="overflow-hidden bg-[var(--card-surface)]/30 backdrop-blur-md">
                <div className="p-3 sm:p-5 space-y-2">
                    {level.lessons.map((lesson) => (
                      <Link
                        key={lesson.id}
                        href={`/lesson/${lesson.id}`}
                        className="group flex items-center justify-between p-3.5 sm:p-4 rounded-2xl glass-card glass-card-hover transition-all duration-300 shadow-2xs active:scale-[0.98]"
                      >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[var(--bg-main)] group-hover:bg-[var(--accent-orange)]/15 text-[var(--text-secondary)] group-hover:text-[var(--accent-orange)] flex items-center justify-center shrink-0 transition-all duration-300 shadow-2xs group-hover:scale-105">
                          <PlayCircle className="w-5 h-5 stroke-[1.8]" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-sm sm:text-base font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-orange)] transition-colors truncate">
                              {lesson.title}
                            </span>
                            {lesson.interactiveToolType && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--accent-orange)]/15 text-[var(--accent-orange)]">
                                {lesson.interactiveToolType === 'db_cta' && '실습 안내'}
                                {lesson.interactiveToolType === 'mbti_test' && '성향 진단'}
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
                        <span className="text-xs sm:text-sm font-extrabold text-[var(--text-secondary)] group-hover:text-[var(--accent-orange)] group-hover:translate-x-1 transition-all flex items-center gap-0.5">
                          학습하기
                          <span>→</span>
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
