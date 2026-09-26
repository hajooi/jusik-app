'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { TrendingUp, Sparkles, Scale, Info } from 'lucide-react';
import AnimatedNumber from '@/components/AnimatedNumber';

// Apple Native 2-Token Physics Engine: cubic-bezier(0.2, 0.8, 0.2, 1)
function appleSmoothEase(t: number): number {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  let u = t;
  for (let i = 0; i < 5; i++) {
    const x = 0.6 * u * (1 - u) + u * u * u;
    const diff = x - t;
    if (Math.abs(diff) < 0.001) break;
    const dx = 0.6 * (1 - 2 * u) + 3 * u * u;
    if (Math.abs(dx) < 0.0001) break;
    u -= diff / dx;
  }
  u = Math.max(0, Math.min(1, u));
  const y = 2.4 * (1 - u) * (1 - u) * u + 3.0 * (1 - u) * u * u + u * u * u;
  return Math.max(0, Math.min(1, y));
}

export default function WealthComparisonChart() {
  const [selectedYear, setSelectedYear] = useState<number>(30);
  const [isInteracting, setIsInteracting] = useState<boolean>(false);
  const [isInView, setIsInView] = useState<boolean>(false);
  const [animProgress, setAnimProgress] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInitialTriggeredRef = useRef<boolean>(false);

  const returnRate = 8; // S&P 500 Benchmark 8%
  const r = returnRate / 100;

  // Viewport trigger for initial entrance animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold: 0.2 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Synchronized line sweep & leading dot animation (Apple Smooth 1.8s)
  useEffect(() => {
    if (!isInView) return;
    if (isInitialTriggeredRef.current) return;
    isInitialTriggeredRef.current = true;

    const duration = 1800;
    const startTime = performance.now();
    let frameId: number;

    const update = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);
      // Apple Native 2-Token Physics: cubic-bezier(0.2, 0.8, 0.2, 1)
      const ease = appleSmoothEase(t);
      setAnimProgress(ease);

      if (t < 1) {
        frameId = requestAnimationFrame(update);
      } else {
        setAnimProgress(1);
      }
    };

    frameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frameId);
  }, [isInView]);

  // Path A: 10억 lump-sum invested at 8%
  const getInvestorValue = useCallback((year: number) => {
    return 10 * Math.pow(1 + r, year);
  }, [r]);

  // Path B: 월 500만 원 (연 0.6억) invested at 8%
  const getWorkerValue = useCallback((year: number) => {
    if (year === 0) return 0;
    const annualDeposit = 0.6;
    return annualDeposit * ((Math.pow(1 + r, year) - 1) / r) * (1 + r);
  }, [r]);

  // Cumulative Capital Outlay (실제 내 주머니에서 들어간 돈)
  const getWorkerOutlay = (year: number) => year * 0.6; // 연 6,000만 * 년수

  const currentInvestorVal = getInvestorValue(selectedYear);
  const currentWorkerVal = getWorkerValue(selectedYear);
  const currentWorkerOutlay = getWorkerOutlay(selectedYear);
  const gap = currentInvestorVal - currentWorkerVal;

  // SVG Geometry (2-3강 PortfolioRecipeBarChart 규격 1:1 표준 채택)
  const chartWidth = 560;
  const chartHeight = 180;
  const padLeft = 40;
  const padRight = 20;
  const padTop = 22;
  const padBottom = 26;
  const usableW = chartWidth - padLeft - padRight;
  const usableH = chartHeight - padTop - padBottom;
  const maxVal = getInvestorValue(30); // 약 100.6억

  const getX = (year: number) => padLeft + (year / 30) * usableW;
  const getY = (val: number) => chartHeight - padBottom - (val / maxVal) * usableH;

  const yearArray = Array.from({ length: 31 }, (_, i) => i);
  const investorVals = yearArray.map((y) => getInvestorValue(y));
  const workerVals = yearArray.map((y) => getWorkerValue(y));

  // Line paths
  const investorPoints = yearArray.map((y) => `${getX(y).toFixed(1)},${getY(investorVals[y]).toFixed(1)}`);
  const investorLinePath = `M ${investorPoints.join(' L ')}`;

  const workerPoints = yearArray.map((y) => `${getX(y).toFixed(1)},${getY(workerVals[y]).toFixed(1)}`);
  const workerLinePath = `M ${workerPoints.join(' L ')}`;

  // Area paths (2-3강 스타일 선명한 앰버 그라데이션)
  const bottomY = (chartHeight - padBottom).toFixed(1);
  const firstX = getX(0).toFixed(1);
  const lastX = getX(30).toFixed(1);

  const investorAreaPath = `${investorLinePath} L ${lastX},${bottomY} L ${firstX},${bottomY} Z`;
  const workerAreaPath = `${workerLinePath} L ${lastX},${bottomY} L ${firstX},${bottomY} Z`;

  const currentX = getX(selectedYear);
  const currentInvY = getY(currentInvestorVal);
  const currentWrkY = getY(currentWorkerVal);

  // Leading Dot Coordinates
  const currentLeadX = padLeft + animProgress * usableW;
  const leadYearFloat = animProgress * 30;
  const leadInvestorVal = getInvestorValue(leadYearFloat);
  const currentLeadY = getY(leadInvestorVal);

  const handlePointerAction = (clientX: number, target: SVGSVGElement) => {
    const rect = target.getBoundingClientRect();
    const mouseX = ((clientX - rect.left) / rect.width) * chartWidth;
    const ratio = Math.max(0, Math.min(1, (mouseX - padLeft) / usableW));
    const year = Math.round(ratio * 30);
    setSelectedYear(Math.max(0, Math.min(30, year)));
    setIsInteracting(true);
  };

  return (
    <div 
      ref={containerRef}
      className="glass-card p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-[var(--border-color)] space-y-4 shadow-2xs my-6 transition-all duration-300"
    >
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

      {/* 2-3강 스타일 모바일 최적화 SVG Chart Container */}
      <div className="space-y-2">
        <div className="relative w-full bg-[var(--bg-main)] rounded-xl sm:rounded-2xl p-2 sm:p-3 border border-[var(--border-color)] overflow-hidden select-none">
          <svg 
            viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
            className="w-full h-auto cursor-crosshair touch-none overflow-visible select-none"
            onPointerDown={(e) => handlePointerAction(e.clientX, e.currentTarget)}
            onPointerMove={(e) => {
              if (e.buttons === 1) handlePointerAction(e.clientX, e.currentTarget);
            }}
            onTouchStart={(e) => {
              if (e.touches.length > 0) handlePointerAction(e.touches[0].clientX, e.currentTarget);
            }}
            onTouchMove={(e) => {
              if (e.touches.length > 0) handlePointerAction(e.touches[0].clientX, e.currentTarget);
            }}
            onMouseLeave={() => setIsInteracting(false)}
            onTouchEnd={() => setIsInteracting(false)}
          >
            <defs>
              {/* Reveal ClipPath */}
              <clipPath id="wealthSweepClip">
                <rect
                  x="0"
                  y="0"
                  width={isInView ? currentLeadX : 0}
                  height={chartHeight}
                />
              </clipPath>

              {/* 2-3강 스타일 선명한 Buong Orange 면적 그라데이션 */}
              <linearGradient id="wealthOrangeGrad23" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#F18F01" stopOpacity="0.28" />
                <stop offset="100%" stopColor="#F18F01" stopOpacity="0.0" />
              </linearGradient>

              <linearGradient id="wealthWorkerGrad23" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="var(--text-secondary)" stopOpacity="0.06" />
                <stop offset="100%" stopColor="var(--text-secondary)" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Y-Axis Value Grid Lines & Labels (0억, 25억, 50억, 75억, 100억) */}
            {[0, 25, 50, 75, 100].map((val) => (
              <g key={val}>
                <line
                  x1={padLeft}
                  y1={getY(val)}
                  x2={chartWidth - padRight}
                  y2={getY(val)}
                  stroke="var(--border-color)"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                />
                <text
                  x={padLeft - 6}
                  y={getY(val) + 3}
                  fill="var(--text-secondary)"
                  fontSize="9"
                  textAnchor="end"
                  fontWeight="600"
                  fontFamily="monospace"
                >
                  {val}억
                </text>
              </g>
            ))}

            {/* Animated Curves & Area Fills inside Sweep ClipPath */}
            <g clipPath="url(#wealthSweepClip)">
              {/* Worker Area Fill */}
              <path
                d={workerAreaPath}
                fill="url(#wealthWorkerGrad23)"
                className="pointer-events-none"
              />

              {/* Investor Area Fill (Buong Orange 0.28) */}
              <path
                d={investorAreaPath}
                fill="url(#wealthOrangeGrad23)"
                className="pointer-events-none"
              />

              {/* Worker Curve: Dashed Line (2-3강 1.5px standard) */}
              <path
                d={workerLinePath}
                fill="none"
                stroke="var(--text-secondary)"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                opacity="0.75"
              />

              {/* Investor Curve: 2.5px Round Stroke (2-3강 standard) */}
              <path
                d={investorLinePath}
                fill="none"
                stroke="#F18F01"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>

            {/* X-Axis Compact Year Labels (2-3강 배치 표준) */}
            {[0, 5, 10, 15, 20, 25, 30].map((y) => (
              <text
                key={y}
                x={getX(y)}
                y={chartHeight - 8}
                fill="var(--text-secondary)"
                fontSize="9"
                textAnchor={y === 0 ? 'start' : y === 30 ? 'end' : 'middle'}
                fontWeight="600"
                fontFamily="monospace"
              >
                {y === 30 ? '30년후' : `${y}년`}
              </text>
            ))}

            {/* Leading Dot along Investor Curve */}
            {!isInteracting && selectedYear === 30 && isInView && animProgress > 0 && (
              <g>
                {/* Subtle soft pulse aura while sweeping */}
                {animProgress < 1 && (
                  <circle
                    cx={currentLeadX}
                    cy={currentLeadY}
                    r="8"
                    fill="#F18F01"
                    opacity="0.22"
                  />
                )}
                {/* Main Orange Dot */}
                <circle
                  cx={currentLeadX}
                  cy={currentLeadY}
                  r="4.5"
                  fill="#F18F01"
                />
                {/* Inner White Pin */}
                <circle
                  cx={currentLeadX}
                  cy={currentLeadY}
                  r="2"
                  fill="#FFFFFF"
                />
                {/* 30-Year Badge when settled */}
                {animProgress >= 0.95 && selectedYear === 30 && (
                  <text
                    x={getX(30)}
                    y={getY(investorVals[30]) - 8}
                    fill="#F18F01"
                    fontSize="10"
                    textAnchor="end"
                    fontWeight="800"
                    fontFamily="monospace"
                    className="animate-in fade-in duration-300"
                  >
                    100.6억
                  </text>
                )}
              </g>
            )}

            {/* Active Year Vertical Guideline & 2-3강 Hover/Touch Tooltip Indicator */}
            {isInteracting && (
              <g className="animate-in fade-in duration-150">
                <line
                  x1={currentX}
                  y1={padTop}
                  x2={currentX}
                  y2={chartHeight - padBottom}
                  stroke="var(--accent-orange)"
                  strokeWidth="1.2"
                  strokeDasharray="2 2"
                />
                <circle cx={currentX} cy={currentInvY} r="4.5" fill="#F18F01" />
                <circle cx={currentX} cy={currentWrkY} r="3.5" fill="var(--text-secondary)" />
                <text
                  x={Math.min(chartWidth - 90, Math.max(90, currentX))}
                  y={padTop - 6}
                  fill="var(--text-primary)"
                  fontSize="9.5"
                  textAnchor="middle"
                  fontWeight="700"
                >
                  {selectedYear}년차 | 자본가 {currentInvestorVal.toFixed(1)}억 (노동자 {currentWorkerVal.toFixed(1)}억)
                </text>
              </g>
            )}

            {/* Default Resting Guideline & Pins */}
            {!isInteracting && selectedYear !== 30 && (
              <g>
                <line
                  x1={currentX}
                  y1={padTop}
                  x2={currentX}
                  y2={chartHeight - padBottom}
                  stroke="var(--accent-orange)"
                  strokeWidth="1.2"
                  strokeDasharray="2 2"
                  opacity="0.8"
                />
                <circle cx={currentX} cy={currentInvY} r="4.5" fill="#F18F01" />
                <circle cx={currentX} cy={currentInvY} r="2" fill="#FFFFFF" />
                <circle cx={currentX} cy={currentWrkY} r="3.5" fill="var(--text-secondary)" />
              </g>
            )}
          </svg>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between gap-3 text-xs pt-0.5 px-1">
          <div className="flex items-center gap-1.5 font-bold text-[var(--accent-orange)]">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#F18F01] shrink-0" />
            <span>자본가 (10억 일시)</span>
          </div>
          <div className="flex items-center gap-1.5 font-bold text-[var(--text-secondary)]">
            <span className="w-2.5 h-0.5 border-b border-dashed border-[var(--text-secondary)] inline-block" />
            <span>노동자 (월 500만 적립)</span>
          </div>
        </div>
      </div>

      {/* Dynamic Year Comparison Cards with AnimatedNumber */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Investor Card */}
        <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)] space-y-1.5 transition-all duration-200">
          <div className="flex items-center justify-between text-xs font-bold text-[var(--accent-orange)]">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              자본가
            </span>
            <span className="text-[10px] text-[var(--text-secondary)] font-normal font-mono">
              원금 10억
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-[var(--text-primary)] font-mono">
            약 <AnimatedNumber value={currentInvestorVal} decimals={1} duration={1200} />억 원
          </div>
        </div>

        {/* Worker Card */}
        <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)] space-y-1.5 transition-all duration-200">
          <div className="flex items-center justify-between text-xs font-bold text-[var(--text-secondary)]">
            <span className="flex items-center gap-1">
              <Scale className="w-3.5 h-3.5" />
              노동자
            </span>
            <span className="text-[10px] text-[var(--text-secondary)] font-normal font-mono">
              원금 <AnimatedNumber value={currentWorkerOutlay} decimals={1} duration={600} />억
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-[var(--text-primary)] font-mono">
            약 <AnimatedNumber value={currentWorkerVal} decimals={1} duration={1200} />억 원
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
            {selectedYear}년 동안 노동자가 투자한 원금은 총 <span className="font-mono text-[var(--accent-orange)] underline">{currentWorkerOutlay.toFixed(1)}억 원</span>으로 아직 자본가(10억 원)보다 적으며, 복리의 힘으로 자본가의 자산이 무려 약 <span className="font-mono text-[var(--accent-orange)] underline font-black"><AnimatedNumber value={gap} decimals={1} duration={400} />억 원</span>이나 더 큽니다.
          </p>
        ) : (
          <p className="text-xs sm:text-sm text-[var(--text-primary)] font-bold leading-relaxed">
            {selectedYear}년 경과 시 노동자가 투자한 원금은 총 <span className="font-mono text-[var(--accent-orange)] underline">{currentWorkerOutlay.toFixed(1)}억 원</span>으로 자본가(10억 원)보다 <span className="font-mono text-[var(--accent-orange)] underline font-black font-mono">{(currentWorkerOutlay - 10).toFixed(1)}억 원</span>이나 더 많습니다. 하지만 복리의 힘으로 자본가의 자산이 약 <span className="font-mono text-[var(--accent-orange)] underline font-black"><AnimatedNumber value={gap} decimals={1} duration={400} />억 원</span> 더 큽니다.
          </p>
        )}
      </div>
    </div>
  );
}
