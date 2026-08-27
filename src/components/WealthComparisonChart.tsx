'use client';

import { useState } from 'react';
import { TrendingUp, Sparkles, Scale, Info } from 'lucide-react';

export default function WealthComparisonChart() {
  const [selectedYear, setSelectedYear] = useState<number>(30);
  const returnRate = 8; // S&P 500 Benchmark 8%
  const r = returnRate / 100;

  // Path A: 10억 lump-sum invested at 8%
  const getInvestorValue = (year: number) => {
    return 10 * Math.pow(1 + r, year);
  };

  // Path B: 월 500만 원 (연 0.6억) invested at 8%
  const getWorkerValue = (year: number) => {
    if (year === 0) return 0;
    const annualDeposit = 0.6;
    return annualDeposit * ((Math.pow(1 + r, year) - 1) / r) * (1 + r);
  };

  // Cumulative Capital Outlay (실제 내 주머니에서 들어간 돈)
  const investorOutlay = 10; // 10억
  const getWorkerOutlay = (year: number) => year * 0.6; // 연 6,000만 * 년수

  const currentInvestorVal = getInvestorValue(selectedYear);
  const currentWorkerVal = getWorkerValue(selectedYear);
  const currentWorkerOutlay = getWorkerOutlay(selectedYear);
  const gap = currentInvestorVal - currentWorkerVal;

  // SVG Geometry (0년 ~ 30년 Full Width Span)
  const chartWidth = 500;
  const chartHeight = 220;
  const padLeft = 20;
  const padRight = 20;
  const padTop = 25;
  const padBottom = 35;
  const usableW = chartWidth - padLeft - padRight;
  const usableH = chartHeight - padTop - padBottom;
  const maxVal = getInvestorValue(30);

  const getX = (year: number) => padLeft + (year / 30) * usableW;
  const getY = (val: number) => chartHeight - padBottom - (val / maxVal) * usableH;

  const yearArray = Array.from({ length: 31 }, (_, i) => i);
  const investorPoints = yearArray.map((y) => `${getX(y)},${getY(getInvestorValue(y))}`).join(' ');
  const workerPoints = yearArray.map((y) => `${getX(y)},${getY(getWorkerValue(y))}`).join(' ');

  const currentX = getX(selectedYear);
  const currentInvY = getY(currentInvestorVal);
  const currentWrkY = getY(currentWorkerVal);

  const handleSvgPointer = (e: React.PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const year = Math.round(ratio * 30);
    setSelectedYear(year);
  };

  return (
    <div className="glass-card p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-[var(--border-color)] space-y-5 shadow-2xs my-6">
      {/* Header */}
      <div className="flex items-start sm:items-center justify-between gap-2">
        <div className="flex items-start sm:items-center gap-2.5 min-w-0">
          <span className="p-2 rounded-xl bg-[var(--accent-orange)]/15 text-[var(--accent-orange)] shrink-0 mt-0.5 sm:mt-0">
            <TrendingUp className="w-5 h-5 stroke-[2.2]" />
          </span>
          <h3 className="text-base sm:text-lg font-extrabold text-[var(--text-primary)] tracking-tight break-keep leading-snug">
            10억 일시 vs 월 500만 복리 비교
          </h3>
        </div>
        <span className="text-[11px] sm:text-xs font-bold text-[var(--accent-orange)] px-2 py-0.5 rounded-md bg-[var(--accent-orange)]/10 shrink-0 font-mono self-start sm:self-auto mt-1 sm:mt-0">
          연 8% 가정
        </span>
      </div>

      {/* Full-width Responsive Interactive SVG Chart */}
      <div className="space-y-3">
        <div className="relative w-full bg-[var(--bg-main)] rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-[var(--border-color)] overflow-visible select-none">
          <svg 
            viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
            className="w-full h-auto cursor-pointer touch-none overflow-visible"
            onPointerDown={handleSvgPointer}
            onPointerMove={(e) => {
              if (e.buttons === 1) handleSvgPointer(e);
            }}
          >
            {/* Grid Horizontal Lines */}
            <line x1={padLeft} y1={getY(0)} x2={chartWidth - padRight} y2={getY(0)} stroke="var(--border-color)" strokeWidth="1" />
            <line x1={padLeft} y1={getY(50)} x2={chartWidth - padRight} y2={getY(50)} stroke="var(--border-color)" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
            <line x1={padLeft} y1={getY(100)} x2={chartWidth - padRight} y2={getY(100)} stroke="var(--border-color)" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />

            {/* Worker Curve (Monthly 500만) */}
            <polyline
              fill="none"
              stroke="var(--text-secondary)"
              strokeWidth="2.5"
              strokeDasharray="5 4"
              opacity="0.8"
              points={workerPoints}
            />

            {/* Investor Curve (10억 Lump Sum) */}
            <polyline
              fill="none"
              stroke="var(--accent-orange)"
              strokeWidth="3.5"
              strokeLinecap="round"
              points={investorPoints}
            />

            {/* Active Year Vertical Guideline */}
            <line
              x1={currentX}
              y1={padTop}
              x2={currentX}
              y2={chartHeight - padBottom}
              stroke="var(--accent-orange)"
              strokeWidth="2"
              strokeDasharray="3 3"
              opacity="0.8"
            />

            {/* Interactive Data Markers */}
            <circle cx={currentX} cy={currentInvY} r="7" fill="var(--accent-orange)" className="animate-pulse" />
            <circle cx={currentX} cy={currentWrkY} r="5" fill="var(--text-secondary)" />

            {/* X-Axis Labels positioned safely with padBottom padding */}
            {[0, 5, 10, 15, 20, 25, 30].map((y) => (
              <text
                key={y}
                x={getX(y)}
                y={chartHeight - 8}
                textAnchor={y === 0 ? 'start' : y === 30 ? 'end' : 'middle'}
                fontSize="11"
                fill="var(--text-secondary)"
                fontWeight="bold"
                fontFamily="monospace"
              >
                {y === 30 ? '30년후' : `${y}년`}
              </text>
            ))}
          </svg>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between gap-3 text-xs pt-1 px-1">
          <div className="flex items-center gap-1.5 font-bold text-[var(--accent-orange)]">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent-orange)] inline-block" />
            <span>자본가 (10억 일시)</span>
          </div>
          <div className="flex items-center gap-1.5 font-bold text-[var(--text-secondary)]">
            <span className="w-3 h-0.5 bg-[var(--text-secondary)] inline-block" />
            <span>노동자 (월 500만 적립)</span>
          </div>
        </div>
      </div>

      {/* Dynamic Year Comparison Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Investor Card */}
        <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)] space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-[var(--accent-orange)]">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              자본가
            </span>
            <span className="text-[10px] text-[var(--text-secondary)] font-normal">
              원금 10억
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-[var(--text-primary)] font-mono">
            약 {currentInvestorVal.toFixed(1)}억 원
          </div>
        </div>

        {/* Worker Card */}
        <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)] space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-[var(--text-secondary)]">
            <span className="flex items-center gap-1">
              <Scale className="w-3.5 h-3.5" />
              노동자
            </span>
            <span className="text-[10px] text-[var(--text-secondary)] font-normal">
              원금 {currentWorkerOutlay.toFixed(1)}억
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-[var(--text-primary)] font-mono">
            약 {currentWorkerVal.toFixed(1)}억 원
          </div>
        </div>
      </div>

      {/* CORE DYNAMIC PARADOX BANNER */}
      <div className="p-4 rounded-xl sm:rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)] space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--accent-orange)]">
          <Info className="w-4 h-4 shrink-0" />
          <span>{selectedYear}년 경과 분석:</span>
        </div>
        {selectedYear === 0 ? (
          <p className="text-xs sm:text-sm text-[var(--text-primary)] font-bold leading-relaxed">
            출발 시점입니다. 자본가는 10억 원으로 시작하고, 노동자는 첫 달 500만 원부터 적립을 시작합니다.
          </p>
        ) : selectedYear < 17 ? (
          <p className="text-xs sm:text-sm text-[var(--text-primary)] font-bold leading-relaxed">
            {selectedYear}년 동안 노동자가 투자한 원금은 총 <span className="font-mono text-[var(--accent-orange)] underline">{currentWorkerOutlay.toFixed(1)}억 원</span>으로 아직 자본가(10억 원)보다 적으며, 복리의 힘으로 자본가의 자산이 무려 약 <span className="font-mono text-[var(--accent-orange)] underline font-black">{gap.toFixed(1)}억 원</span>이나 더 큽니다.
          </p>
        ) : (
          <p className="text-xs sm:text-sm text-[var(--text-primary)] font-bold leading-relaxed">
            {selectedYear}년 경과 시 노동자가 투자한 원금은 총 <span className="font-mono text-[var(--accent-orange)] underline">{currentWorkerOutlay.toFixed(1)}억 원</span>으로 자본가(10억 원)보다 <span className="font-mono text-[var(--accent-orange)] underline font-black font-mono">{(currentWorkerOutlay - 10).toFixed(1)}억 원</span>이나 더 많습니다. 하지만 복리의 힘으로 자본가의 자산이 약 <span className="font-mono text-[var(--accent-orange)] underline font-black">{gap.toFixed(1)}억 원</span> 더 큽니다.
          </p>
        )}
      </div>
    </div>
  );
}
