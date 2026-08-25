'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';

interface WavePoint {
  t: number; // 0.0 to 1.0
  price: number;
  isBuyPoint: boolean;
  buyIndex?: number; // 1 to 10
}

// Generate realistic stock wave with natural multi-wave pullbacks, dips, and strong breakout rebound
function generateTimelinePoints(): { timeline: WavePoint[]; buyPoints: { index: number; t: number; price: number }[] } {
  const points: WavePoint[] = [];
  const TOTAL_STEPS = 500;
  const DROP_T = 0.62; // Drop & volatility consolidation phase
  const buyTs = [0, 0.06, 0.13, 0.20, 0.27, 0.34, 0.41, 0.48, 0.55, 0.62];
  const buyPoints: { index: number; t: number; price: number }[] = [];

  for (let i = 0; i <= TOTAL_STEPS; i++) {
    const t = i / TOTAL_STEPS;
    let price = 10000;

    if (t <= DROP_T) {
      const p = t / DROP_T;
      // Multi-wave descent with realistic bear-market rallies (10,000 -> 5,000)
      const baseTrend = 10000 - p * 5000;
      // Realistic multi-frequency waves
      const wave1 = Math.sin(p * Math.PI * 4) * 320; // Medium swing
      const wave2 = Math.sin(p * Math.PI * 8) * 140; // Secondary ripple
      const wave3 = Math.cos(p * Math.PI * 2) * 80;
      price = Math.round(Math.max(5000, Math.min(10000, baseTrend + wave1 + wave2 - wave3)));
    } else {
      const p = (t - DROP_T) / (1 - DROP_T);
      // Strong breakout rebound surge with minor pullback (5,000 -> 9,600)
      const baseRebound = 5000 + p * 4600;
      const breakoutWave = Math.sin(p * Math.PI * 3) * 220;
      price = Math.round(Math.max(5000, Math.min(9600, baseRebound + breakoutWave)));
    }

    // Match buy point
    let isBuy = false;
    let buyNumber: number | undefined = undefined;

    for (let b = 0; b < buyTs.length; b++) {
      const targetStep = Math.round(buyTs[b] * TOTAL_STEPS);
      if (i === targetStep) {
        isBuy = true;
        buyNumber = b + 1;
        buyPoints.push({ index: buyNumber, t, price });
        break;
      }
    }

    points.push({
      t,
      price,
      isBuyPoint: isBuy,
      buyIndex: buyNumber
    });
  }

  // Ensure anchor points
  points[0].price = 10000;
  points[points.length - 1].price = 9600;

  return { timeline: points, buyPoints };
}

const { timeline: TIMELINE, buyPoints: BUY_POINTS } = generateTimelinePoints();

// Pre-calculate exact DCA averages based on sampled prices
const DCA_AVGS_BY_BUY_COUNT: number[] = (() => {
  const avgs = [10000];
  let cumSpent = 0;
  let cumShares = 0;
  for (let i = 0; i < BUY_POINTS.length; i++) {
    cumSpent += 1000000;
    cumShares += 1000000 / BUY_POINTS[i].price;
    avgs[i + 1] = Math.round(cumSpent / cumShares);
  }
  return avgs;
})();

// Build timeline schedule with exact 350ms pauses at each buy point
interface ScheduleItem {
  type: 'move' | 'pause';
  durationMs: number;
  startT: number;
  endT: number;
  buyIndexAtPause?: number;
}

function buildSchedule(): { schedule: ScheduleItem[]; totalDuration: number } {
  const schedule: ScheduleItem[] = [];
  const MOVE_SEG_DURATION = 300; // 300ms smooth movement between buys
  const BUY_PAUSE_DURATION = 350; // 350ms (0.35s) snappy pause at each buy point

  let currentT = 0;

  for (let i = 0; i < BUY_POINTS.length; i++) {
    const buy = BUY_POINTS[i];
    if (buy.t > currentT) {
      schedule.push({
        type: 'move',
        durationMs: MOVE_SEG_DURATION,
        startT: currentT,
        endT: buy.t
      });
      currentT = buy.t;
    }

    schedule.push({
      type: 'pause',
      durationMs: BUY_PAUSE_DURATION,
      startT: buy.t,
      endT: buy.t,
      buyIndexAtPause: buy.index
    });
  }

  // Move from last buy (t=0.62) to end (t=1.0) with strong breakout surge
  schedule.push({
    type: 'move',
    durationMs: 1600, // 1.6s grand breakout
    startT: 0.62,
    endT: 1.0
  });

  // Final result pause before loop
  schedule.push({
    type: 'pause',
    durationMs: 2500, // 2.5s hold
    startT: 1.0,
    endT: 1.0
  });

  const totalDuration = schedule.reduce((sum, item) => sum + item.durationMs, 0);
  return { schedule, totalDuration };
}

const { schedule: SCHEDULE, totalDuration: CYCLE_DURATION } = buildSchedule();

export default function DcaMotionSimulator() {
  const [currentT, setCurrentT] = useState<number>(0);
  const [activeBuyCount, setActiveBuyCount] = useState<number>(1);
  const [smoothDcaAvg, setSmoothDcaAvg] = useState<number>(10000);

  const targetDcaAvgRef = useRef<number>(10000);
  const currentSmoothAvgRef = useRef<number>(10000);

  useEffect(() => {
    let animId: number;
    let startTime: number | null = null;

    const loop = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = (timestamp - startTime) % CYCLE_DURATION;

      // Handle cycle reset
      if (elapsed < 30) {
        currentSmoothAvgRef.current = 10000;
        targetDcaAvgRef.current = 10000;
      }

      // Find current active schedule slot
      let accMs = 0;
      for (const slot of SCHEDULE) {
        if (elapsed >= accMs && elapsed < accMs + slot.durationMs) {
          const slotProgress = (elapsed - accMs) / slot.durationMs;

          if (slot.type === 'move') {
            const interpolatedT = slot.startT + slotProgress * (slot.endT - slot.startT);
            setCurrentT(interpolatedT);

            let passedBuys = 0;
            for (const b of BUY_POINTS) {
              if (interpolatedT >= b.t) passedBuys = b.index;
            }
            const count = Math.max(1, passedBuys);
            setActiveBuyCount(count);
            targetDcaAvgRef.current = DCA_AVGS_BY_BUY_COUNT[count] || 7200;
          } else {
            setCurrentT(slot.startT);
            if (slot.buyIndexAtPause) {
              setActiveBuyCount(slot.buyIndexAtPause);
              targetDcaAvgRef.current = DCA_AVGS_BY_BUY_COUNT[slot.buyIndexAtPause] || 7200;
            }
          }
          break;
        }
        accMs += slot.durationMs;
      }

      // Smooth 60fps exponential interpolation for average price downward motion
      currentSmoothAvgRef.current += (targetDcaAvgRef.current - currentSmoothAvgRef.current) * 0.12;
      setSmoothDcaAvg(currentSmoothAvgRef.current);

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Map currentT (0..1) to timeline index
  const currentIndex = Math.min(TIMELINE.length - 1, Math.floor(currentT * (TIMELINE.length - 1)));
  const currentPt = TIMELINE[currentIndex];
  const currentPrice = currentPt.price;

  const currentDcaAvg = DCA_AVGS_BY_BUY_COUNT[activeBuyCount] || 7200;

  const allInValue = Math.round(1000 * currentPrice);
  const allInReturn = ((allInValue - 10000000) / 10000000) * 100;

  const completedBuysList = useMemo(() => {
    return BUY_POINTS.filter((b) => b.index <= activeBuyCount);
  }, [activeBuyCount]);

  const totalDcaShares = completedBuysList.reduce((sum, b) => sum + (1000000 / b.price), 0);
  const totalDcaInvested = activeBuyCount * 1000000;
  const dcaValue = Math.round(totalDcaShares * currentPrice);
  const dcaReturn = totalDcaInvested > 0 ? ((dcaValue - totalDcaInvested) / totalDcaInvested) * 100 : 0;

  // Responsive SVG Geometry (Balanced Top & Bottom Safety Buffers)
  const svgW = 500;
  const svgH = 230;
  const padL = 10;
  const padR = 10;
  const padT = 52;
  const padB = 38; // Ample 38px bottom buffer so hanging badge never clips at bottom
  const usableW = svgW - padL - padR;
  const usableH = svgH - padT - padB;

  const minP = 4600;
  const maxP = 10400;

  const getX = (t: number) => padL + t * usableW;
  const getY = (price: number) => svgH - padB - ((price - minP) / (maxP - minP)) * usableH;

  const fullPolyline = TIMELINE.map((p) => `${getX(p.t)},${getY(p.price)}`).join(' ');
  const activePolyline = TIMELINE.slice(0, currentIndex + 1).map((p) => `${getX(p.t)},${getY(p.price)}`).join(' ');

  const curX = getX(currentPt.t);
  const curY = getY(currentPrice);

  // Smoothly animated Y position for average price line (in SVG units and in Percentage for HTML badge)
  const dcaAvgY = getY(smoothDcaAvg);
  const dcaAvgPct = (dcaAvgY / svgH) * 100;

  // Calculate Breakthrough Profit Zone: Strictly for the right-side rebound surge (t >= 0.62)
  const profitPoints = useMemo(() => {
    const activePts = TIMELINE.slice(0, currentIndex + 1);
    const pts: { x: number; y: number }[] = [];
    for (const pt of activePts) {
      // Only show profit green during the true final rebound phase after DCA completes
      if (pt.t >= 0.62) {
        const px = getX(pt.t);
        const py = getY(pt.price);
        if (py < dcaAvgY) {
          pts.push({ x: px, y: py });
        }
      }
    }
    return pts;
  }, [currentIndex, dcaAvgY]);

  return (
    <div className="glass-card p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-[var(--border-color)]/80 space-y-4 shadow-2xs my-5 select-none">
      {/* Chart Canvas: Organic Market Wave + Massive Green Rebound Zone + Mobile-Safe Badge */}
      <div className="relative w-full bg-[var(--bg-main)]/90 rounded-2xl p-2.5 sm:p-4 border border-[var(--border-color)] overflow-hidden">
        
        {/* Floating Average Price Badge: Pure White Bold, Consistently Attached Below Line */}
        <div 
          className="absolute left-3 sm:left-4 z-20 pointer-events-none transition-transform duration-75"
          style={{
            top: `${dcaAvgPct}%`,
            transform: 'translateY(6px)'
          }}
        >
          <div className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl bg-[var(--card-surface)]/95 backdrop-blur-md border border-[var(--border-color)] shadow-md space-y-0.5">
            <div className="text-[10px] sm:text-[11px] font-semibold text-slate-400 dark:text-slate-300 tracking-tight">
              내가 산 평균 가격
            </div>
            <div className="text-base sm:text-base md:text-lg font-black font-mono text-slate-900 dark:text-white tracking-tight leading-tight">
              {Math.round(smoothDcaAvg).toLocaleString()}원
            </div>
          </div>
        </div>

        {/* SVG Chart Layer */}
        <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-auto overflow-visible">
          <defs>
            {/* High-Impact Breakthrough Profit Gradient */}
            <linearGradient id="breakthroughProfitGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.18" />
            </linearGradient>
          </defs>

          {/* High-Impact Breakthrough Profit Zone Fill (Striking Emerald Mountain when price explodes upward) */}
          {profitPoints.length > 1 && (
            <polygon
              fill="url(#breakthroughProfitGlow)"
              points={`${profitPoints[0].x},${dcaAvgY} ${profitPoints.map((p) => `${p.x},${p.y}`).join(' ')} ${profitPoints[profitPoints.length - 1].x},${dcaAvgY}`}
              className="transition-all duration-100"
            />
          )}

          {/* Full Wave Background Trajectory Curve */}
          <polyline
            fill="none"
            stroke="var(--border-color)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={fullPolyline}
            opacity="0.3"
          />

          {/* Active Orange Price Curve (Dynamic Organic Market Waves) */}
          <polyline
            fill="none"
            stroke="var(--accent-orange)"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={activePolyline}
          />

          {/* Full-Width Average Price Dashed Line (Spans entire chart width) */}
          <line
            x1={padL}
            y1={dcaAvgY}
            x2={svgW - padR}
            y2={dcaAvgY}
            stroke="var(--text-secondary)"
            strokeWidth="1.5"
            strokeDasharray="4 3"
            opacity="0.8"
          />

          {/* Clear 3.2px Neutral Ticks on Chart Curve */}
          {completedBuysList.map((buy) => (
            <circle
              key={buy.index}
              cx={getX(buy.t)}
              cy={getY(buy.price)}
              r="3.2"
              className="fill-slate-800 dark:fill-slate-200"
              opacity="0.8"
            />
          ))}

          {/* Active Price Dot */}
          <circle
            cx={curX}
            cy={curY}
            r="5.2"
            fill="var(--accent-orange)"
            stroke="var(--bg-main)"
            strokeWidth="2.2"
          />
        </svg>
      </div>

      {/* Two Side-by-Side Account Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* 1. All-in Account */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[var(--card-surface)]/90 backdrop-blur-md border border-[var(--border-color)]/80 space-y-2.5 shadow-2xs hover:border-[var(--accent-orange)]/40 transition-all">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-extrabold text-[var(--text-primary)]">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--signal-crimson)] shadow-[0_0_8px_rgba(244,63,94,0.6)] shrink-0" />
            <span>한 번에 다 산 계좌</span>
          </div>

          <div className="space-y-1.5 pt-1 text-xs sm:text-sm">
            <div className="flex justify-between items-center">
              <span className="text-[var(--text-secondary)]">내가 산 평균 가격</span>
              <span className="font-mono font-bold text-[var(--text-primary)]">10,000원</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[var(--text-secondary)]">계좌 잔고</span>
              <span className="font-mono font-extrabold text-sm sm:text-base text-[var(--text-primary)]">
                {allInValue.toLocaleString()}원
              </span>
            </div>
            <div className="flex justify-between items-center pt-1.5 border-t border-[var(--border-color)]/60">
              <span className="text-[var(--text-secondary)]">수익률</span>
              <span className={`font-mono font-extrabold text-base sm:text-lg ${
                allInReturn > 0
                  ? 'text-[var(--fintech-emerald)]'
                  : allInReturn < 0
                  ? 'text-[var(--signal-crimson)]'
                  : 'text-[var(--text-secondary)]'
              }`}>
                {allInReturn > 0 ? `+${allInReturn.toFixed(1)}%` : `${allInReturn.toFixed(1)}%`}
              </span>
            </div>
          </div>
        </div>

        {/* 2. DCA Account */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[var(--card-surface)]/90 backdrop-blur-md border border-[var(--border-color)]/80 space-y-2.5 shadow-2xs hover:border-[var(--accent-orange)]/40 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-extrabold text-[var(--text-primary)]">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--fintech-emerald)] shadow-[0_0_8px_rgba(16,185,129,0.6)] shrink-0" />
              <span>조금씩 나눠서 산 계좌</span>
            </div>
          </div>

          <div className="space-y-1.5 pt-1 text-xs sm:text-sm">
            <div className="flex justify-between items-center">
              <span className="text-[var(--text-secondary)]">내가 산 평균 가격</span>
              <span className="font-mono font-bold text-[var(--fintech-emerald)]">
                {currentDcaAvg.toLocaleString()}원
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[var(--text-secondary)]">계좌 잔고</span>
              <span className="font-mono font-extrabold text-sm sm:text-base text-[var(--text-primary)]">
                {dcaValue.toLocaleString()}원
              </span>
            </div>
            <div className="flex justify-between items-center pt-1.5 border-t border-[var(--border-color)]/60">
              <span className="text-[var(--text-secondary)]">수익률</span>
              <span className={`font-mono font-extrabold text-base sm:text-lg ${
                dcaReturn > 0
                  ? 'text-[var(--fintech-emerald)]'
                  : dcaReturn < 0
                  ? 'text-[var(--signal-crimson)]'
                  : 'text-[var(--text-secondary)]'
              }`}>
                {dcaReturn > 0 ? `+${dcaReturn.toFixed(1)}%` : `${dcaReturn.toFixed(1)}%`}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
