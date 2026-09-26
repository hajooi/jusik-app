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

  // 절세 금액 및 감면율
  const savedTax = Math.max(0, generalTax - isaTax);
  const savedTaxMan = generalTaxMan - isaTaxMan;
  const reductionRate = generalTax > 0 ? Math.round((savedTax / generalTax) * 100) : 0;

  // 프리셋 선택 핸들러
  const handlePreset = (p: number, l: number) => {
    setProfit(p);
    setLoss(l);
  };

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
            className={`relative z-10 px-3.5 py-1.5 rounded-full transition-colors duration-200 ${
              isaType === 'general' ? 'text-[var(--accent-orange)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            일반형 (비과세 200만)
          </button>
          <button
            type="button"
            onClick={() => setIsaType('peasant')}
            className={`relative z-10 px-3.5 py-1.5 rounded-full transition-colors duration-200 ${
              isaType === 'peasant' ? 'text-[var(--accent-orange)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            서민형 (비과세 400만)
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-6 pt-2 space-y-4">
        {/* 예시 칩 버튼 (라벨 없이 간결한 캡슐형 칩) */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handlePreset(600, 300)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              profit === 600 && loss === 300
                ? 'bg-[var(--accent-orange)] text-white font-bold shadow-2xs'
                : 'bg-[var(--bg-main)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-color)]'
            }`}
          >
            기본 (+600만 / -300만)
          </button>
          <button
            type="button"
            onClick={() => handlePreset(1200, 400)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              profit === 1200 && loss === 400
                ? 'bg-[var(--accent-orange)] text-white font-bold shadow-2xs'
                : 'bg-[var(--bg-main)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-color)]'
            }`}
          >
            대형 수익 (+1,200만 / -400만)
          </button>
          <button
            type="button"
            onClick={() => handlePreset(400, 200)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              profit === 400 && loss === 200
                ? 'bg-[var(--accent-orange)] text-white font-bold shadow-2xs'
                : 'bg-[var(--bg-main)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-color)]'
            }`}
          >
            소액 적립 (+400만 / -200만)
          </button>
        </div>

        {/* 인터랙티브 손익 슬라이더 영역 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-[var(--bg-main)]/70 border border-[var(--border-color)]">
          {/* A종목 이익 슬라이더 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="flex items-center gap-1.5 text-[var(--fintech-emerald)]">
                <TrendingUp className="w-3.5 h-3.5" />
                A종목 이익:
              </span>
              <span className="font-mono text-sm text-[var(--fintech-emerald)]">
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
              <span className="flex items-center gap-1.5 text-[var(--signal-crimson)]">
                <TrendingDown className="w-3.5 h-3.5" />
                B종목 손실:
              </span>
              <span className="font-mono text-sm text-[var(--signal-crimson)]">
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

        {/* 손익 요약 바 (구분선 없이 심플한 서피스) */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-[var(--card-surface)] border border-[var(--border-color)] flex flex-wrap items-center justify-between gap-2.5 text-xs sm:text-sm">
          <span className="font-extrabold text-[var(--text-primary)]">내 계좌 종합 손익:</span>
          <div className="flex items-center gap-2 font-mono text-xs sm:text-sm">
            <span className="text-[var(--fintech-emerald)] font-bold">+{profit}만</span>
            <span className="text-[var(--text-secondary)] font-normal">-</span>
            <span className="text-[var(--signal-crimson)] font-bold">{loss}만</span>
            <span className="text-[var(--text-secondary)] font-normal">=</span>
            <span className="font-extrabold text-[var(--text-primary)] bg-[var(--bg-main)] px-2.5 py-0.5 rounded-lg border border-[var(--border-color)]">
              순이익 <AnimatedNumber value={netProfit} duration={250} />만 원
            </span>
          </div>
        </div>

        {/* 계좌 비교 2열 그리드 (내부 구분 라인 제거) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {/* 일반 계좌 */}
          <div className="p-4 rounded-2xl bg-[var(--bg-main)]/60 border border-[var(--border-color)] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--text-secondary)]">일반 계좌</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--signal-crimson)]/10 text-[var(--signal-crimson)] font-bold">
                손실 무시 과세 (15.4%)
              </span>
            </div>
            <div className="text-xs text-[var(--text-secondary)] leading-relaxed">
              손실({loss > 0 ? `-${loss}만` : '0원'})은 차감하지 않고, 이익 {profit}만 원 전체에 대해 15.4%를 과세합니다.
            </div>
            <div className="pt-2 flex items-baseline justify-between">
              <span className="text-xs text-[var(--text-secondary)]">납부 세금</span>
              <div className="text-right">
                <span className="text-base sm:text-lg font-mono font-extrabold text-[var(--signal-crimson)]">
                  <AnimatedNumber value={generalTaxMan} decimals={1} duration={300} />만 원
                </span>
                <span className="block text-[10px] text-[var(--text-secondary)] font-mono">
                  {generalTax.toLocaleString()}원
                </span>
              </div>
            </div>
          </div>

          {/* 중개형 ISA */}
          <div className="p-4 rounded-2xl bg-[var(--accent-orange)]/5 border border-[var(--accent-orange)]/30 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-[var(--accent-orange)]">중개형 ISA</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--fintech-emerald)]/10 text-[var(--fintech-emerald)] font-bold">
                손익 통산 적용 (9.9%)
              </span>
            </div>
            <div className="text-xs text-[var(--text-secondary)] leading-relaxed">
              이익과 손실을 합친 <strong>순이익 {netProfit}만 원</strong>에서 비과세 {taxFreeLimit}만 원을 차감한 뒤 9.9% 과세합니다.
            </div>
            <div className="pt-2 flex items-baseline justify-between">
              <span className="text-xs text-[var(--text-secondary)]">납부 세금</span>
              <div className="text-right">
                <span className="text-base sm:text-lg font-mono font-extrabold text-[var(--fintech-emerald)]">
                  <AnimatedNumber value={isaTaxMan} decimals={1} duration={300} />만 원
                </span>
                <span className="block text-[10px] text-[var(--text-secondary)] font-mono">
                  {isaTax.toLocaleString()}원
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 절세 하이라이트 배너 */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-[var(--accent-orange)]/15 via-amber-500/10 to-[var(--accent-orange)]/15 border border-[var(--accent-orange)]/30 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[var(--accent-orange)]/20 text-[var(--accent-orange)]">
              <Sparkles className="w-5 h-5 stroke-[2.2]" />
            </span>
            <div>
              <span className="text-xs sm:text-sm font-extrabold text-[var(--text-primary)] block">
                ISA로 아끼는 세금
              </span>
              <span className="text-[11px] text-[var(--text-secondary)] font-medium">
                {isaType === 'peasant' ? '서민형(비과세 400만)' : '일반형(비과세 200만)'} 적용 기준
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg sm:text-xl font-mono font-black text-[var(--accent-orange)]">
              총 <AnimatedNumber value={savedTaxMan} decimals={1} duration={350} />만 원 절약
            </div>
            <span className="text-[11px] text-[var(--text-secondary)] font-medium">
              세금 약 <AnimatedNumber value={reductionRate} duration={350} />% 감면 ({savedTax.toLocaleString()}원 절약)
            </span>
          </div>
        </div>

        {/* 안내 팁 박스 */}
        <div className="p-3 rounded-xl bg-[var(--bg-main)]/60 border border-[var(--border-color)] flex items-center gap-2 text-xs text-[var(--text-secondary)]">
          <Info className="w-4 h-4 text-[var(--accent-orange)] shrink-0" />
          <span>
            손실이 난 종목이 함께 있을 때 ISA의 '손익 통산' 효과가 극대화되며, 일반 계좌보다 세금 부담을 줄일 수 있습니다.
          </span>
        </div>
      </div>
    </div>
  );
}
