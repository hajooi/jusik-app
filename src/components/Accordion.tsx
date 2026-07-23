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
  // Default first level open
  const [openLevelId, setOpenLevelId] = useState<string | null>('lv0');

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
            className={`rounded-3xl overflow-hidden transition-all duration-300 bg-[var(--card-surface)] ${
              isOpen 
                ? 'ring-2 ring-[var(--accent-orange)] shadow-md' 
                : 'hover:bg-[var(--card-hover)] shadow-xs'
            }`}
          >
            {/* Header / Accordion Button */}
            <button
              onClick={() => toggleLevel(level.id, level.isComingSoon)}
              className={`group/btn w-full px-4 py-4 sm:px-6 sm:py-5 text-left flex items-center justify-between gap-3 sm:gap-4 outline-none focus:outline-none transition-all duration-300 ${
                level.isComingSoon ? 'cursor-not-allowed opacity-75' : 'active:scale-[0.99]'
              }`}
            >
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                {/* Level Icon Container - No static borders */}
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 transition-all duration-300 ${
                  isOpen 
                    ? 'bg-[var(--accent-orange)] text-white shadow-xs scale-105' 
                    : 'bg-[var(--bg-main)] text-[var(--text-secondary)] group-hover/btn:text-[var(--accent-orange)] group-hover/btn:bg-[var(--accent-orange)]/10'
                }`}>
                  <IconComponent className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className={`text-[10px] sm:text-[11px] font-black px-2.5 py-0.5 rounded-full font-mono transition-colors ${
                      level.isComingSoon 
                        ? 'bg-[var(--text-secondary)]/20 text-[var(--text-secondary)]'
                        : isOpen 
                        ? 'bg-[var(--accent-orange)] text-white' 
                        : 'bg-[var(--accent-orange)]/15 text-[var(--accent-orange)]'
                    }`}>
                      Lv. {level.levelNumber}
                    </span>
                    <span className="text-[11px] sm:text-xs font-semibold text-[var(--text-secondary)] truncate">
                      {level.badgeText} · {level.isComingSoon ? '오픈 예정' : `${level.lessons.length}개 강의`}
                    </span>
                  </div>
                  <h3 className={`text-base sm:text-lg font-bold tracking-tight leading-snug truncate transition-colors ${
                    level.isComingSoon 
                      ? 'text-[var(--text-secondary)]' 
                      : isOpen 
                      ? 'text-[var(--accent-orange)]' 
                      : 'text-[var(--text-primary)] group-hover/btn:text-[var(--accent-orange)]'
                  }`}>
                    {level.title}
                  </h3>
                </div>
              </div>

              {/* Status Indicator: Coming Soon Badge or Arrow */}
              {level.isComingSoon ? (
                <span className="text-[10px] sm:text-xs font-extrabold px-3 py-1 rounded-full bg-[var(--card-hover)] text-[var(--text-secondary)] font-mono shrink-0">
                  COMING SOON
                </span>
              ) : (
                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-transform duration-300 shrink-0 ${
                  isOpen ? 'rotate-180 text-[var(--accent-orange)] bg-[var(--accent-orange)]/15' : 'text-[var(--text-secondary)] bg-[var(--bg-main)] group-hover/btn:text-[var(--accent-orange)]'
                }`}>
                  <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              )}
            </button>

            {/* Accordion Content - Lesson List without inner dividers */}
            <div
              className={`grid transition-all duration-300 ease-out ${
                isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
              }`}
            >
              <div className="overflow-hidden bg-[var(--card-hover)]/30">
                <div className="p-3 sm:p-5 space-y-2">
                  {level.lessons.map((lesson) => (
                    <Link
                      key={lesson.id}
                      href={`/lesson/${lesson.id}`}
                      className="group flex items-center justify-between p-3 sm:p-4 rounded-2xl bg-[var(--bg-main)] hover:bg-[var(--card-hover)] transition-all duration-300 shadow-2xs hover:shadow-xs active:scale-[0.98]"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="text-[var(--text-secondary)] group-hover:text-[var(--accent-orange)] transition-colors shrink-0">
                          <PlayCircle className="w-5 h-5 sm:w-6 sm:h-6" />
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
                        <span className="hidden sm:flex items-center gap-1 text-xs text-[var(--text-secondary)] font-mono bg-[var(--card-surface)] px-2.5 py-1 rounded-lg">
                          <Clock className="w-3.5 h-3.5" />
                          {lesson.duration}
                        </span>
                        <span className="text-xs sm:text-sm font-bold text-[var(--text-secondary)] group-hover:text-[var(--accent-orange)] group-hover:translate-x-1 transition-all flex items-center gap-0.5">
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
