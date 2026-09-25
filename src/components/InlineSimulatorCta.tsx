'use client';

import React from 'react';
import Link from 'next/link';
import { Calculator, ArrowRight, Sparkles, TrendingUp } from 'lucide-react';

export default function InlineSimulatorCta() {
  return (
    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-[var(--card-surface)] via-[var(--bg-main)] to-[var(--card-surface)] border border-[var(--border-color)] shadow-2xs">
      {/* Background Subtle Ambient Glow */}
      <div 
        className="absolute -top-12 -right-12 w-48 h-48 bg-[var(--accent-orange)]/10 rounded-full blur-2xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[var(--accent-orange)]/15 text-[var(--accent-orange)] border border-[var(--accent-orange)]/30 inline-flex items-center justify-center">
              <Calculator className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-black text-[var(--text-primary)]">
                투자 전략 시뮬레이터 실습하기
              </h3>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium leading-relaxed max-w-xl">
            원하는 종목과 비율을 직접 입력하여 내가 모아갈 포트폴리오의 과거 성적과 미래 자산을 직접 확인해 보세요.
          </p>
        </div>

        <div className="shrink-0">
          <Link
            href="/tools/simulate"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl sm:rounded-2xl bg-[var(--accent-orange)] hover:bg-[#d97f00] text-white font-black text-sm sm:text-base shadow-sm hover:shadow-[0_0_16px_rgba(241,143,1,0.4)] active:scale-95 transition-all duration-200"
          >
            <span>시뮬레이터 열기</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
