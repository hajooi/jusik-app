'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Clock } from 'lucide-react';

export default function JpMorganTimingBarChart() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasTriggered, setHasTriggered] = useState(false);
  const [animProgress, setAnimProgress] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasTriggered) {
          setHasTriggered(true);
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -30px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasTriggered]);

  // Smooth Count-Up Animation (1200ms ease-out)
  useEffect(() => {
    if (!hasTriggered) return;

    const DURATION = 1200;
    let startTime: number | null = null;
    let animId: number;

    const easeOutCubic = (x: number): number => {
      return 1 - Math.pow(1 - x, 3);
    };

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(1, elapsed / DURATION);
      const eased = easeOutCubic(progress);

      setAnimProgress(eased);

      if (progress < 1) {
        animId = requestAnimationFrame(step);
      }
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [hasTriggered]);

  const rawData = [
    {
      title: '20년 동안 보유',
      targetValue: 71750,
      targetReturn: 617.5,
      showReturn: true,
      widthPct: 100,
      colorHex: '#10B981', // Fintech Emerald
      isChampion: true
    },
    {
      title: '최고의 10일을 놓쳤을 때',
      targetValue: 32871,
      targetReturn: 228.7,
      showReturn: true,
      widthPct: 45.8,
      colorHex: '#F18F01', // Buong Orange
      isChampion: false
    },
    {
      title: '최고의 60일을 놓쳤을 때',
      targetValue: 4712,
      targetReturn: -52.9,
      showReturn: true,
      widthPct: 6.6,
      colorHex: '#F43F5E', // Signal Crimson
      isChampion: false
    },
    {
      title: '원금',
      targetValue: 10000,
      targetReturn: 0.0,
      showReturn: false, // Do not show (0.0%)
      widthPct: 13.9,
      colorHex: '#64748B', // Muted Steel
      isChampion: false
    }
  ];

  return (
    <div 
      ref={containerRef}
      className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-[var(--bg-main)]/90 border border-[var(--border-color)] space-y-4 shadow-2xs my-4 select-none"
    >
      {/* Header */}
      <div className="flex items-center gap-2 pb-3 border-b border-[var(--border-color)]/70">
        <span className="p-1.5 rounded-lg bg-[var(--accent-orange)]/15 text-[var(--accent-orange)]">
          <Clock className="w-4 h-4" />
        </span>
        <h4 className="text-sm sm:text-base font-extrabold text-[var(--text-primary)]">
          1만 달러를 20년 동안 S&P 500에 투자했을 때
        </h4>
      </div>

      {/* 4 Comparison Bars (No Badges, Clean Typography) */}
      <div className="space-y-3 pt-1">
        {rawData.map((item, idx) => {
          const currentVal = Math.round(item.targetValue * animProgress);
          const currentRet = (item.targetReturn * animProgress).toFixed(1);

          return (
            <div 
              key={idx} 
              className={`space-y-1.5 p-2 rounded-xl transition-all ${
                item.isChampion ? 'bg-[var(--fintech-emerald)]/5 border border-[var(--fintech-emerald)]/20' : ''
              }`}
            >
              <div className="flex justify-between items-center text-xs sm:text-sm">
                <span className={`font-extrabold ${item.isChampion ? 'text-[var(--fintech-emerald)]' : 'text-[var(--text-primary)]'}`}>
                  {item.title}
                </span>
                <div className="flex items-center gap-1.5 font-mono">
                  <span className="font-extrabold text-sm sm:text-base text-[var(--text-primary)]">
                    ${currentVal.toLocaleString()}
                  </span>
                  {item.showReturn && (
                    <span className={`text-[11px] sm:text-xs font-bold ${
                      item.isChampion 
                        ? 'text-[var(--fintech-emerald)]' 
                        : item.targetReturn < 0
                        ? 'text-[var(--signal-crimson)]'
                        : 'text-[var(--text-secondary)]'
                    }`}>
                      ({item.targetReturn > 0 ? `+${currentRet}%` : `${currentRet}%`})
                    </span>
                  )}
                </div>
              </div>

              {/* Visual Animated Bar Track */}
              <div className="w-full h-3.5 bg-[var(--border-color)]/50 rounded-full overflow-hidden p-0.5 flex items-center">
                <div
                  className="h-full rounded-full min-w-[8px]"
                  style={{
                    backgroundColor: item.colorHex,
                    width: `${item.widthPct * animProgress}%`,
                    boxShadow: item.isChampion ? '0 0 10px rgba(16, 185, 129, 0.35)' : 'none'
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Clean Refined Fact Banner */}
      <div className="p-3 sm:p-4 rounded-xl bg-[var(--accent-orange)]/10 border border-[var(--accent-orange)]/30 text-xs sm:text-sm font-medium text-[var(--text-primary)] leading-relaxed">
        지난 20년간 가장 가격이 폭발적으로 올랐던 최고의 10일 중 무려 7일이 <strong className="text-[var(--accent-orange)] font-extrabold">&lsquo;가장 끔찍한 대하락장 직후&rsquo;</strong>에 나타났습니다.
      </div>
    </div>
  );
}
