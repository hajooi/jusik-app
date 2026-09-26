'use client';

import React, { useState } from 'react';
import { Sparkles, Scale, TrendingUp, TrendingDown, Info } from 'lucide-react';
import AnimatedNumber from '@/components/AnimatedNumber';

export default function IsaTaxCalculator() {
  const [isaType, setIsaType] = useState<'general' | 'peasant'>('general');
  const [profit, setProfit] = useState<number>(600); // 만원 단위 (A종목 이익)
  const [loss, setLoss] = useState<number>(300);   // 만원 단위 (B종목 손실)

  // 비과세 한도 (일반형 200만 원, 서민형 400만 원)
  const taxFreeLimit = isaType === 'peasant' ? 400 : 200;

  // 손익 통산 순수익
  const netProfit = Math.max(0, profit - loss);

  // 일반 계좌: 손실 통산 불가, 이익 전액에 대해 15.4% 배당소득세
  const generalTax = Math.round(profit * 10000 * 0.154);
  const generalTaxMan = profit * 0.154;

  // 중개형 ISA: 손익 통산 적용, 비과세 한도 차감 후 9.9% 분리과세
  const isaTaxable = Math.max(0, netProfit - taxFreeLimit);
  const isaTax = Math.round(isaTaxable * 10000 * 0.099);
  const isaTaxMan = isaTaxable * 0.099;

  return (
    <div className="w-full my-6 rounded-2xl sm:rounded-3xl border border-[var(--border-color)] bg-[var(--card-surface)]/90 backdrop-blur-md overflow-hidden shadow-2xs">
      {/* Header (구분 라인 없이 여백과 색조로 자연스럽게 정돈) */}
      <div className="px-4 sm:px-6 pt-5 pb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-[var(--accent-orange)]/15 text-[var(--accent-orange)]">
            <Scale className="w-4 h-4 stroke-[2.2]" />
          </span>
          <div>
            <h4 className="text-sm sm:text-base font-extrabold text-[var(--text-primary)] tracking-tight">
              손익 통산 절세 효과 비교
            </h4>
            <p className="text-[11px] text-[var(--text-secondary)] font-medium">
              이익과 손실에 따른 절세 효과를 직접 비교해 보세요
            </p>
          </div>
        </div>

        {/* ISA 유형 캡슐 토글 (Apple Native Snappy Physics) */}
        <div className="relative flex items-center p-1 rounded-full bg-[var(--bg-main)] border border-[var(--border-color)] text-xs font-bold select-none">
          {/* Apple Sliding Pill Indicator */}
          <div
            className="absolute top-1 bottom-1 rounded-full bg-[var(--card-surface)] border border-[var(--border-color)] shadow-2xs transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
            style={{
              left: isaType === 'general' ? '4px' : 'calc(50% + 2px)',
              width: 'calc(50% - 6px)',
            }}
          />
          <button
            type="button"
            onClick={() => setIsaType('general')}
            className={`relative z-10 px-4 py-1.5 rounded-full transition-colors duration-200 ${
              isaType === 'general' ? 'text-[var(--accent-orange)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            일반형
          </button>
          <button
            type="button"
            onClick={() => setIsaType('peasant')}
            className={`relative z-10 px-4 py-1.5 rounded-full transition-colors duration-200 ${
              isaType === 'peasant' ? 'text-[var(--accent-orange)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            서민형
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-6 pt-2 space-y-4">
        {/* 인터랙티브 손익 슬라이더 & 일체형 종합 손익 패널 (애플식 폼 컨테이너) */}
        <div className="rounded-2xl bg-[var(--bg-main)]/80 border border-[var(--border-color)] overflow-hidden shadow-2xs">
          {/* 슬라이더 컨트롤 영역 */}
          <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* A종목 이익 슬라이더 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="w-3.5 h-3.5" />
                  A종목 이익
                </span>
                <span className="font-mono text-sm sm:text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                  +{profit}만 원
                </span>
              </div>
              <input
                type="range"
                min={100}
                max={2000}
                step={50}
                value={profit}
                onChange={(e) => setProfit(Number(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-[var(--border-color)] accent-[var(--fintech-emerald)]"
              />
              <div className="flex justify-between text-[10px] text-[var(--text-secondary)] font-mono">
                <span>+100만</span>
                <span>+1,000만</span>
                <span>+2,000만</span>
              </div>
            </div>

            {/* B종목 손실 슬라이더 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                  <TrendingDown className="w-3.5 h-3.5" />
                  B종목 손실
                </span>
                <span className="font-mono text-sm sm:text-base font-extrabold text-rose-600 dark:text-rose-400">
                  -{loss}만 원
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={1000}
                step={50}
                value={loss}
                onChange={(e) => setLoss(Number(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-[var(--border-color)] accent-[var(--signal-crimson)]"
              />
              <div className="flex justify-between text-[10px] text-[var(--text-secondary)] font-mono">
                <span>0만</span>
                <span>-500만</span>
                <span>-1,000만</span>
              </div>
            </div>
          </div>

          {/* 일체형 도킹: 내 계좌 합산 순이익 바 */}
          <div className="px-4 sm:px-5 py-3 bg-[var(--card-surface)] border-t border-[var(--border-color)]/80 flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm">
            <span className="font-extrabold text-[var(--text-secondary)]">계좌 전체 합산 손익</span>
            <div className="flex items-center gap-2 font-mono">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">+{profit}만</span>
              <span className="text-[var(--text-secondary)]">-</span>
              <span className="text-rose-600 dark:text-rose-400 font-bold">{loss}만</span>
              <span className="text-[var(--text-secondary)]">=</span>
              <span className="font-extrabold text-[var(--text-primary)] bg-[var(--bg-main)] px-2.5 py-0.5 rounded-full border border-[var(--border-color)] shadow-2xs">
                순이익 <AnimatedNumber value={netProfit} duration={250} />만 원
              </span>
            </div>
          </div>
        </div>

        {/* 계좌 비교 2열 그리드 (애플 스타일 명확한 시각적 대조) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {/* 1. 일반 계좌 (과세 부담 카드: 차분한 Slate + 로즈 페널티 서브셀) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[var(--card-surface)] border border-[var(--border-color)] flex flex-col justify-between space-y-3.5 shadow-2xs">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-extrabold text-[var(--text-primary)]">일반 계좌</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                  손실 불인정 과세 (15.4%)
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                손실({loss > 0 ? `-${loss}만 원` : '0원'})은 무시되고, 번 돈 {profit}만 원 전액에 대해 15.4%를 그대로 징수합니다.
              </p>
            </div>

            {/* 납부 세금 서브셀 */}
            <div className="p-3 rounded-xl bg-[var(--bg-main)]/90 border border-[var(--border-color)] flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--text-secondary)]">납부할 세금</span>
              <div className="text-right">
                <span className="text-base sm:text-lg font-mono font-black text-rose-600 dark:text-rose-400">
                  <AnimatedNumber value={generalTaxMan} decimals={1} duration={300} />만 원
                </span>
                <span className="block text-[10px] text-[var(--text-secondary)] font-mono">
                  {generalTax.toLocaleString()}원
                </span>
              </div>
            </div>
          </div>

          {/* 2. 중개형 ISA (절세 혜택 카드: 오렌지 헤어라인 + 에메랄드 절세 서브셀) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[var(--card-surface)] border-2 border-[var(--accent-orange)]/60 flex flex-col justify-between space-y-3.5 shadow-[0_0_20px_rgba(241,143,1,0.12)]">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-black text-[var(--accent-orange)] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[var(--accent-orange)]" />
                  중개형 ISA
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                  손익 통산 + 비과세 {taxFreeLimit}만 원
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                손실을 합친 <strong>순이익 {netProfit}만 원</strong>에서 비과세 {taxFreeLimit}만 원을 뺀 금액만 9.9% 저율 분리과세합니다.
              </p>
            </div>

            {/* 납부 세금 서브셀 */}
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">납부할 세금</span>
              <div className="text-right">
                <span className="text-base sm:text-lg font-mono font-black text-emerald-600 dark:text-emerald-400">
                  <AnimatedNumber value={isaTaxMan} decimals={1} duration={300} />만 원
                </span>
                <span className="block text-[10px] text-emerald-600/70 dark:text-emerald-400/70 font-mono">
                  {isaTax.toLocaleString()}원
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 안내 팁 박스 */}
        <div className="p-3.5 rounded-xl bg-[var(--bg-main)]/70 border border-[var(--border-color)] flex items-center gap-2 text-xs text-[var(--text-secondary)]">
          <Info className="w-4 h-4 text-[var(--accent-orange)] shrink-0" />
          <span>
            손실이 난 종목이 있을 때 ISA의 '손익 통산' 혜택이 가장 커지며, 일반 계좌보다 세금을 획기적으로 아낄 수 있습니다.
          </span>
        </div>
      </div>
    </div>
  );
}
