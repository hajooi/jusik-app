'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';

interface WavePoint {
  t: number; // 0.0 to 1.0
  price: number;
  isBuyPoint: boolean;
  buyIndex?: number; // 1 to 10
}

// Generate a completely organic, natural stock wave (0 kinks, purely smooth)
function generateTimelinePoints(): { timeline: WavePoint[]; buyPoints: { index: number; t: number; price: number }[] } {
  const points: WavePoint[] = [];
  const TOTAL_STEPS = 500;
  const DROP_T = 0.65; // 65% of trajectory for drop
  const buyTs = [0, 0.07, 0.14, 0.21, 0.28, 0.35, 0.42, 0.49, 0.57, 0.65];
  const buyPoints: { index: number; t: number; price: number }[] = [];

  for (let i = 0; i <= TOTAL_STEPS; i++) {
    const t = i / TOTAL_STEPS;
    let price = 10000;

    if (t <= DROP_T) {
      const p = t / DROP_T;
      // Natural organic market descent (10,000 to 5,000)
      const trend = 10000 - p * 5000;
      const organicWave = Math.sin(p * Math.PI * 3.5) * 110 + Math.sin(p * Math.PI * 7) * 35;
      price = Math.round(Math.max(5000, Math.min(10000, trend + organicWave)));
    } else {
      const p = (t - DROP_T) / (1 - DROP_T);
      // Natural organic market recovery (5,000 to 8,000)
      const trend = 5000 + p * 3000;
      const organicWave = Math.sin(p * Math.PI * 2.5) * 70;
      price = Math.round(Math.max(5000, Math.min(8000, trend + organicWave)));
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

  // Ensure first is strictly 10,000 and last is strictly 8,000
  points[0].price = 10000;
  points[points.length - 1].price = 8000;

  return { timeline: points, buyPoints };
}

const { timeline: TIMELINE, buyPoints: BUY_POINTS } = generateTimelinePoints();

// Pre-calculate exact DCA averages based on organic sampled prices
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

// Build timeline schedule with exact 500ms pauses at each buy point
interface ScheduleItem {
  type: 'move' | 'pause';
  durationMs: number;
  startT: number;
  endT: number;
  buyIndexAtPause?: number;
}

function buildSchedule(): { schedule: ScheduleItem[]; totalDuration: number } {
  const schedule: ScheduleItem[] = [];
  const MOVE_SEG_DURATION = 320; // 320ms smooth movement between buys
  const BUY_PAUSE_DURATION = 350; // 350ms (0.35s) snappy, rhythmic pause at each buy point

  let currentT = 0;

  for (let i = 0; i < BUY_POINTS.length; i++) {
    const buy = BUY_POINTS[i];
    // 1. Move to this buy point (if not at start)
    if (buy.t > currentT) {
      schedule.push({
        type: 'move',
        durationMs: MOVE_SEG_DURATION,
        startT: currentT,
        endT: buy.t
      });
      currentT = buy.t;
    }

    // 2. Pause at this buy point for 350ms
    schedule.push({
      type: 'pause',
      durationMs: BUY_PAUSE_DURATION,
      startT: buy.t,
      endT: buy.t,
      buyIndexAtPause: buy.index
    });
  }

  // Move from last buy (t=0.65) to end (t=1.0)
  schedule.push({
    type: 'move',
    durationMs: 1400, // 1.4s smooth rebound
    startT: 0.65,
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

  useEffect(() => {
    let animId: number;
    let startTime: number | null = null;

    const loop = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = (timestamp - startTime) % CYCLE_DURATION;

      // Find current active schedule slot
      let accMs = 0;
      for (const slot of SCHEDULE) {
        if (elapsed >= accMs && elapsed < accMs + slot.durationMs) {
          const slotProgress = (elapsed - accMs) / slot.durationMs;

          if (slot.type === 'move') {
            const interpolatedT = slot.startT + slotProgress * (slot.endT - slot.startT);
            setCurrentT(interpolatedT);

            // Determine how many buys have been passed so far
            let passedBuys = 0;
            for (const b of BUY_POINTS) {
              if (interpolatedT >= b.t) passedBuys = b.index;
            }
            setActiveBuyCount(Math.max(1, passedBuys));
          } else {
            // In 500ms pause
            setCurrentT(slot.startT);
            if (slot.buyIndexAtPause) {
              setActiveBuyCount(slot.buyIndexAtPause);
            }
          }
          break;
        }
        accMs += slot.durationMs;
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Map currentT (0..1) to timeline index
  const currentIndex = Math.min(TIMELINE.length - 1, Math.floor(currentT * (TIMELINE.length - 1)));
  const currentPt = TIMELINE[currentIndex];
  const currentPrice = currentPt.price;

  const currentDcaAvg = DCA_AVGS_BY_BUY_COUNT[activeBuyCount] || 7000;

  const allInValue = Math.round(1000 * currentPrice);
  const allInReturn = ((allInValue - 10000000) / 10000000) * 100;

  const completedBuysList = useMemo(() => {
    return BUY_POINTS.filter((b) => b.index <= activeBuyCount);
  }, [activeBuyCount]);

  const totalDcaShares = completedBuysList.reduce((sum, b) => sum + (1000000 / b.price), 0);
  const totalDcaInvested = activeBuyCount * 1000000;
  const dcaValue = Math.round(totalDcaShares * currentPrice);
  const dcaReturn = totalDcaInvested > 0 ? ((dcaValue - totalDcaInvested) / totalDcaInvested) * 100 : 0;

  // SVG Geometry
  const svgW = 560;
  const svgH = 200;
  const padL = 40;
  const padR = 25;
  const padT = 30;
  const padB = 30;
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
  const dcaAvgY = getY(currentDcaAvg);

  return (
    <div className="glass-card p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-[var(--border-color)]/80 space-y-4 shadow-2xs my-5 select-none">
      {/* SVG Stock Wave Chart: Natural Organic Wave + 0.5s Pause at Buys + Capsule Z-Index on TOP */}
      <div className="relative w-full bg-[var(--bg-main)]/90 rounded-2xl p-3 sm:p-4 border border-[var(--border-color)] overflow-hidden">
        <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-auto overflow-visible">
          {/* Subtle Grid reference lines */}
          <line x1={padL} y1={getY(10000)} x2={svgW - padR} y2={getY(10000)} stroke="var(--border-color)" strokeWidth="1" strokeDasharray="3 3" opacity="0.3" />
          <text x={padL - 6} y={getY(10000) + 3} fill="var(--text-secondary)" fontSize="9" textAnchor="end" className="font-mono opacity-70">10,000</text>

          <line x1={padL} y1={getY(5000)} x2={svgW - padR} y2={getY(5000)} stroke="var(--border-color)" strokeWidth="1" strokeDasharray="3 3" opacity="0.3" />
          <text x={padL - 6} y={getY(5000) + 3} fill="var(--text-secondary)" fontSize="9" textAnchor="end" className="font-mono opacity-70">5,000</text>

          {/* Full Wave Background Trajectory Curve */}
          <polyline
            fill="none"
            stroke="var(--border-color)"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={fullPolyline}
            opacity="0.3"
          />

          {/* Active Orange Price Curve */}
          <polyline
            fill="none"
            stroke="var(--accent-orange)"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={activePolyline}
          />

          {/* Minimal 1px Hairline Average Price Dashed Line (Extends from Left axis to Capsule Right Edge: 498px) */}
          <line
            x1={padL}
            y1={dcaAvgY}
            x2={362 + 136}
            y2={dcaAvgY}
            stroke="var(--border-color)"
            strokeWidth="1.2"
            strokeDasharray="4 4"
            opacity="0.6"
            className="transition-all duration-300"
          />

          {/* Ultra-Minimal 2.5px Neutral Ticks on Chart Curve */}
          {completedBuysList.map((buy) => (
            <circle
              key={buy.index}
              cx={getX(buy.t)}
              cy={getY(buy.price)}
              r="2.5"
              fill="var(--text-primary)"
              opacity="0.75"
            />
          ))}

          {/* Active Price Dot (Rendered under Capsule so Capsule is never covered) */}
          <circle
            cx={curX}
            cy={curY}
            r="4.5"
            fill="var(--accent-orange)"
            stroke="var(--bg-main)"
            strokeWidth="2"
          />

          {/* Translucent Glass Capsule Aligned: Left Edge at 10th Buy Point (x=362), Ending at x=498 */}
          <g className="transition-all duration-300 pointer-events-none" transform={`translate(362, ${dcaAvgY})`}>
            <rect
              x="0"
              y="-22"
              width="136"
              height="18"
              rx="4"
              fill="var(--card-surface)"
              stroke="var(--border-color)"
              strokeWidth="1"
              opacity="0.98"
            />
            <text
              x="68"
              y="-9.5"
              fill="var(--text-primary)"
              fontSize="9"
              fontWeight="600"
              textAnchor="middle"
              className="font-mono tracking-tight"
            >
              내가 산 평균 가격: <tspan fill="var(--fintech-emerald)" fontWeight="bold">{currentDcaAvg.toLocaleString()}원</tspan>
            </text>
          </g>
        </svg>
      </div>

      {/* Two Side-by-Side Account Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* 1. All-in Account */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[var(--card-surface)]/90 backdrop-blur-md border border-[var(--border-color)]/80 space-y-2.5 shadow-2xs hover:border-[var(--accent-orange)]/40 transition-all">
          <div className="text-xs font-extrabold text-[var(--text-primary)]">
            🔴 한 번에 다 산 계좌
          </div>

          <div className="space-y-1.5 pt-1 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-[var(--text-secondary)]">내가 산 평균 가격</span>
              <span className="font-mono font-bold text-[var(--text-primary)]">10,000원</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[var(--text-secondary)]">현재 계좌 잔고</span>
              <span className="font-mono font-extrabold text-sm text-[var(--text-primary)]">
                {allInValue.toLocaleString()}원
              </span>
            </div>
            <div className="flex justify-between items-center pt-1.5 border-t border-[var(--border-color)]/60">
              <span className="text-[var(--text-secondary)]">수익률</span>
              <span className={`font-mono font-extrabold text-base ${
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
            <span className="text-xs font-extrabold text-[var(--text-primary)]">
              🟢 조금씩 나눠서 산 계좌
            </span>

            {/* 10-Segment Mini Capsule Progress Indicator */}
            <div className="flex items-center gap-1" title={`${activeBuyCount}/10회 분할 매수 진행`}>
              {Array.from({ length: 10 }).map((_, i) => (
                <span
                  key={i}
                  className={`w-2 h-1 rounded-full transition-all duration-200 ${
                    i < activeBuyCount
                      ? 'bg-[var(--fintech-emerald)]'
                      : 'bg-[var(--border-color)]/60'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="space-y-1.5 pt-1 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-[var(--text-secondary)]">내가 산 평균 가격</span>
              <span className="font-mono font-bold text-[var(--fintech-emerald)]">
                {currentDcaAvg.toLocaleString()}원
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[var(--text-secondary)]">현재 계좌 잔고</span>
              <span className="font-mono font-extrabold text-sm text-[var(--text-primary)]">
                {dcaValue.toLocaleString()}원
              </span>
            </div>
            <div className="flex justify-between items-center pt-1.5 border-t border-[var(--border-color)]/60">
              <span className="text-[var(--text-secondary)]">수익률</span>
              <span className={`font-mono font-extrabold text-base ${
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
