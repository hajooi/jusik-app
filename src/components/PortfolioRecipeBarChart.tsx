'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, TrendingUp } from 'lucide-react';
import SmoothHeight from '@/components/SmoothHeight';
import curveDataRaw from '@/data/recipeCurves15y.json';

// Apple Native 2-Token Physics Engine: cubic-bezier(0.2, 0.8, 0.2, 1)
function appleSmoothEase(t: number): number {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  // Newton-Raphson solver for cubic-bezier(0.2, 0.8, 0.2, 1)
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

interface CurvePoint {
  d: string;
  v: number;
}

const curveData = curveDataRaw as Record<string, CurvePoint[]>;

interface RecipeData {
  id: string;
  name: string;
  ratioLabel: string;
  nasdaqPct: number;
  schdPct: number;
  tag: string;
  tagColor: 'orange' | 'amber' | 'emerald';
  isRecommended?: boolean;
  cagr: number;
  mdd: number;
  feature: string;
  detail: string;
  curve: CurvePoint[];
}

const SPY_BENCHMARK: { name: string; cagr: number; mdd: number; curve: CurvePoint[] } = {
  name: 'S&P 500',
  cagr: 15.1,
  mdd: -31.8,
  curve: curveData.spy || []
};

const RECIPES: RecipeData[] = [
  {
    id: 'r1',
    name: '1:1 조합',
    ratioLabel: '50% : 50%',
    nasdaqPct: 50,
    schdPct: 50,
    tag: '공격형',
    tagColor: 'orange',
    cagr: 17.2,
    mdd: -28.8,
    feature: '공격과 수비의 균등 배분 (최고 수익률)',
    detail: '나스닥의 높은 성장성을 가장 크게 취하는 조합입니다. 15년간 연 17.2%의 가장 높은 수익률을 기록했습니다.',
    curve: curveData.r1 || []
  },
  {
    id: 'r2',
    name: '2:3 조합',
    ratioLabel: '40% : 60%',
    nasdaqPct: 40,
    schdPct: 60,
    tag: '밸런스 추천',
    tagColor: 'amber',
    isRecommended: true,
    cagr: 16.6,
    mdd: -29.1,
    feature: '성장력과 방어력의 황금 조화',
    detail: '가장 추천하는 밸런스 레시피입니다. S&P 500(-31.8%)보다 하락장 낙폭(-29.1%)을 덜 겪으면서도 연 16.6%의 높은 성적을 냈습니다.',
    curve: curveData.r2 || []
  },
  {
    id: 'r3',
    name: '1:2 조합',
    ratioLabel: '33% : 67%',
    nasdaqPct: 33,
    schdPct: 67,
    tag: '밸런스',
    tagColor: 'emerald',
    cagr: 16.2,
    mdd: -29.4,
    feature: '완만한 성장과 탄탄한 현금 흐름',
    detail: '배당 비중을 약 3분의 2로 높여 분기마다 풍성한 배당금을 챙기면서, S&P 500보다 뛰어난 방어력과 수익률을 유지합니다.',
    curve: curveData.r3 || []
  },
  {
    id: 'r4',
    name: '1:3 조합',
    ratioLabel: '25% : 75%',
    nasdaqPct: 25,
    schdPct: 75,
    tag: '수비형',
    tagColor: 'emerald',
    cagr: 15.6,
    mdd: -29.8,
    feature: '하락장 방어벽과 배당 집중',
    detail: '수비 비중을 75%까지 높여 주가 변동성에 대한 심리적 스트레스를 크게 낮춘 안정 중심 레시피입니다.',
    curve: curveData.r4 || []
  },
  {
    id: 'r5',
    name: '1:4 조합',
    ratioLabel: '20% : 80%',
    nasdaqPct: 20,
    schdPct: 80,
    tag: '수비형',
    tagColor: 'emerald',
    cagr: 15.2,
    mdd: -30.0,
    feature: '극대화된 안정과 가격 방어',
    detail: '자산의 80%를 변동성이 적고 튼튼한 배당주에 배치하여, 안정적인 현금 흐름을 최우선으로 추구합니다.',
    curve: curveData.r5 || []
  }
];

export default function PortfolioRecipeBarChart() {
  const [selectedId, setSelectedId] = useState<string>('r2');
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [isInView, setIsInView] = useState<boolean>(false);
  const [animProgress, setAnimProgress] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInitialTriggeredRef = useRef<boolean>(false);

  const selectedRecipe = RECIPES.find((r) => r.id === selectedId) || RECIPES[1];

  // SVG Chart Geometry
  const chartWidth = 560;
  const chartHeight = 180;
  const padLeft = 40;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 28;
  const usableW = chartWidth - padLeft - padRight;

  const minVal = 0.8;
  const maxVal = 12.0;

  const totalPoints = selectedRecipe.curve.length;

  const getX = (idx: number) => {
    return padLeft + (idx / Math.max(1, totalPoints - 1)) * usableW;
  };

  const getY = (val: number) => {
    const norm = (val - minVal) / (maxVal - minVal);
    return chartHeight - padBottom - norm * (chartHeight - padTop - padBottom);
  };

  // Viewport trigger
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold: 0.15 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Line drawing & redrawing motion
  useEffect(() => {
    if (!isInView) return;

    const isInitial = !isInitialTriggeredRef.current;
    if (isInitial) {
      isInitialTriggeredRef.current = true;
    }

    const duration = isInitial ? 1800 : 650;
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
  }, [isInView, selectedId]);

  // Leading Dot Coordinates
  const currentLeadX = padLeft + animProgress * usableW;
  let currentLeadY = getY(selectedRecipe.curve[0]?.v || 1);
  if (totalPoints > 0) {
    const pointIdxFloat = animProgress * (totalPoints - 1);
    const idx0 = Math.floor(pointIdxFloat);
    const idx1 = Math.min(totalPoints - 1, Math.ceil(pointIdxFloat));
    const weight = pointIdxFloat - idx0;
    const val = selectedRecipe.curve[idx0].v * (1 - weight) + selectedRecipe.curve[idx1].v * weight;
    currentLeadY = getY(val);
  }

  // Recipe Curve Path
  const recipePoints = selectedRecipe.curve.map((pt, i) => `${getX(i).toFixed(1)},${getY(pt.v).toFixed(1)}`);
  const recipePath = `M ${recipePoints.join(' L ')}`;
  const recipeArea = `${recipePath} L ${getX(totalPoints - 1).toFixed(1)},${(chartHeight - padBottom).toFixed(1)} L ${padLeft},${(chartHeight - padBottom).toFixed(1)} Z`;

  // SPY Benchmark Path
  const spyPoints = SPY_BENCHMARK.curve.map((pt, i) => `${getX(i).toFixed(1)},${getY(pt.v).toFixed(1)}`);
  const spyPath = `M ${spyPoints.join(' L ')}`;

  // Key Dates for X-Axis Labels (every ~3 years)
  const xLabels = [
    { idx: 0, text: "'11년" },
    { idx: 26, text: "'14년" },
    { idx: 52, text: "'17년" },
    { idx: 78, text: "'20년" },
    { idx: 104, text: "'23년" },
    { idx: Math.max(0, totalPoints - 1), text: "'26년" }
  ];

  const hoveredPoint = hoverIndex !== null && hoverIndex < totalPoints ? selectedRecipe.curve[hoverIndex] : null;
  const hoveredSpy = hoverIndex !== null && hoverIndex < SPY_BENCHMARK.curve.length ? SPY_BENCHMARK.curve[hoverIndex] : null;

  return (
    <div ref={containerRef} className="rounded-2xl sm:rounded-3xl bg-[var(--bg-main)]/90 border border-[var(--border-color)] p-4 sm:p-6 space-y-5 shadow-2xs">
      {/* Chart Header & Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-1">
        <div>
          <h3 className="text-base sm:text-lg font-black text-[var(--text-primary)]">
            나스닥 100 + 미국배당다우존스
          </h3>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs font-bold shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-[#F18F01] shrink-0" />
            <span className="text-[var(--text-primary)]">나스닥 100 (공격)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-[#10B981] shrink-0" />
            <span className="text-[var(--text-primary)]">미국배당다우존스 (수비)</span>
          </div>
        </div>
      </div>

      {/* Stacked Bars List */}
      <div className="space-y-2.5">
        {RECIPES.map((r) => {
          const isSelected = selectedId === r.id;
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => {
                setSelectedId(r.id);
                setHoverIndex(null);
              }}
              className={`w-full text-left p-3 sm:p-3.5 rounded-xl sm:rounded-2xl cursor-pointer transition-all duration-200 border ${
                isSelected
                  ? 'bg-[var(--card-surface)] border-[var(--accent-orange)] shadow-[0_0_18px_rgba(241,143,1,0.22)] scale-[1.01]'
                  : 'bg-[var(--card-surface)]/60 border-[var(--border-color)] hover:border-[var(--accent-orange)]/60 hover:shadow-[0_0_16px_rgba(241,143,1,0.14)] hover:bg-[var(--card-surface)]'
              }`}
            >
              {/* Row Header */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-black text-[var(--text-primary)]">
                    {r.name}
                  </span>
                  <span className="text-xs font-bold text-[var(--text-secondary)]">
                    ({r.ratioLabel})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-[var(--text-secondary)] hidden sm:inline">
                    연 {r.cagr}% | MDD {r.mdd}%
                  </span>
                  <span
                    className={`px-2 py-0.5 text-[10px] sm:text-xs font-bold rounded-full ${
                      r.tagColor === 'orange'
                        ? 'bg-orange-500/15 text-orange-500'
                        : r.tagColor === 'amber'
                        ? 'bg-amber-500/15 text-amber-500'
                        : 'bg-emerald-500/15 text-emerald-500'
                    }`}
                  >
                    {r.tag}
                  </span>
                </div>
              </div>

              {/* Horizontal Stacked Bar */}
              <div className="w-full h-5 sm:h-6 rounded-lg overflow-hidden flex bg-[var(--bg-main)] p-0.5 border border-[var(--border-color)] shadow-inner">
                {/* Nasdaq Bar */}
                <div
                  style={{ width: `${r.nasdaqPct}%` }}
                  className="h-full bg-gradient-to-r from-amber-500 to-[#F18F01] rounded-l-md flex items-center justify-center text-[10px] sm:text-xs font-extrabold text-white transition-all duration-300"
                >
                  {r.nasdaqPct >= 25 ? `${r.nasdaqPct}%` : ''}
                </div>
                {/* SCHD Bar */}
                <div
                  style={{ width: `${r.schdPct}%` }}
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-r-md flex items-center justify-center text-[10px] sm:text-xs font-extrabold text-white transition-all duration-300"
                >
                  {r.schdPct >= 25 ? `${r.schdPct}%` : ''}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Recipe Performance Card & 15-Year High-Res Graph */}
      <div className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-[var(--card-surface)] border border-[var(--accent-orange)]/40 shadow-2xs space-y-4">
        {/* Title & Key Metrics */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-1">
          <div className="flex-1 min-w-0">
            <SmoothHeight duration={450} easing="cubic-bezier(0.2, 0.8, 0.2, 1)">
              <div key={selectedRecipe.id} className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm sm:text-base font-black text-[var(--text-primary)]">
                    {selectedRecipe.name}
                  </span>
                  <span className="text-xs font-bold text-[var(--accent-orange)]">
                    {selectedRecipe.feature}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed">
                  {selectedRecipe.detail}
                </p>
              </div>
            </SmoothHeight>
          </div>

          {/* Metric Badges */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-center min-w-[90px]">
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block">연평균 수익률</span>
              <span className="text-sm sm:text-base font-black text-emerald-600 dark:text-emerald-400 font-mono">
                연 {(selectedRecipe.cagr * (isInView ? animProgress : 1)).toFixed(1)}%
              </span>
            </div>
            <div className="px-3 py-2 rounded-xl bg-rose-500/10 border border-rose-500/25 text-center min-w-[90px]">
              <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold block">최대 낙폭 (MDD)</span>
              <span className="text-sm sm:text-base font-black text-rose-600 dark:text-rose-400 font-mono">
                {(selectedRecipe.mdd * (isInView ? animProgress : 1)).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* 15-Year Growth Curve Chart */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-extrabold text-[var(--text-primary)] flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-[var(--accent-orange)]" />
              과거 15년 성적 비교
            </span>
            <div className="flex items-center gap-3 text-[11px] font-bold">
              <span className="flex items-center gap-1 text-[var(--accent-orange)]">
                <span className="w-2.5 h-0.5 bg-[var(--accent-orange)] inline-block" /> {selectedRecipe.name}
              </span>
              <span className="flex items-center gap-1 text-[var(--text-secondary)]">
                <span className="w-2.5 h-0.5 border-b border-dashed border-[var(--text-secondary)] inline-block" /> S&P 500
              </span>
            </div>
          </div>

          {/* High-Resolution SVG Chart */}
          <div className="w-full overflow-hidden rounded-xl bg-[var(--bg-main)] p-2 sm:p-3 border border-[var(--border-color)]">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-auto overflow-visible select-none"
              onMouseLeave={() => setHoverIndex(null)}
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const mouseX = ((e.clientX - rect.left) / rect.width) * chartWidth;
                const ratio = Math.max(0, Math.min(1, (mouseX - padLeft) / (chartWidth - padLeft - padRight)));
                const idx = Math.round(ratio * (totalPoints - 1));
                setHoverIndex(idx);
              }}
            >
              <defs>
                <linearGradient id="recipeGradient15y" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#F18F01" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="#F18F01" stopOpacity="0.0" />
                </linearGradient>

                {/* Left-to-Right Reveal ClipPath */}
                <clipPath id="recipeSweepClip">
                  <rect
                    x="0"
                    y="0"
                    width={isInView ? currentLeadX : 0}
                    height={chartHeight}
                  />
                </clipPath>
              </defs>

              {/* Grid Lines */}
              {[1, 4, 7, 10].map((val) => (
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
                  >
                    {val}배
                  </text>
                </g>
              ))}

              {/* Animated Curves & Area Fill inside Sweep ClipPath */}
              <g clipPath="url(#recipeSweepClip)">
                {/* Area Fill */}
                <path d={recipeArea} fill="url(#recipeGradient15y)" />

                {/* SPY Benchmark Line (Dashed) */}
                <path
                  d={spyPath}
                  fill="none"
                  stroke="var(--text-secondary)"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  opacity="0.75"
                />

                {/* Recipe Line */}
                <path
                  d={recipePath}
                  fill="none"
                  stroke="#F18F01"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>

              {/* X Axis Labels */}
              {xLabels.map((lbl, i) => (
                <text
                  key={i}
                  x={getX(lbl.idx)}
                  y={chartHeight - 8}
                  fill="var(--text-secondary)"
                  fontSize="9"
                  textAnchor="middle"
                  fontWeight="600"
                >
                  {lbl.text}
                </text>
              ))}

              {/* Leading Dot & End Point Marker */}
              {hoverIndex === null && totalPoints > 0 && isInView && animProgress > 0 && (
                <g>
                  {/* Subtle soft pulse halo while moving */}
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
                  {/* Multiplier Badge when settled */}
                  {animProgress >= 0.95 && (
                    <text
                      x={getX(totalPoints - 1)}
                      y={getY(selectedRecipe.curve[totalPoints - 1].v) - 8}
                      fill="#F18F01"
                      fontSize="10"
                      textAnchor="end"
                      fontWeight="800"
                      className="animate-in fade-in duration-300"
                    >
                      {selectedRecipe.curve[totalPoints - 1].v.toFixed(1)}배
                    </text>
                  )}
                </g>
              )}

              {/* Hover Cursor Tooltip Indicator */}
              {hoverIndex !== null && hoveredPoint && hoveredSpy && (
                <g>
                  <line
                    x1={getX(hoverIndex)}
                    y1={padTop}
                    x2={getX(hoverIndex)}
                    y2={chartHeight - padBottom}
                    stroke="var(--accent-orange)"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                  <circle
                    cx={getX(hoverIndex)}
                    cy={getY(hoveredPoint.v)}
                    r="4.5"
                    fill="#F18F01"
                  />
                  <circle
                    cx={getX(hoverIndex)}
                    cy={getY(hoveredSpy.v)}
                    r="3.5"
                    fill="var(--text-secondary)"
                  />
                  <text
                    x={Math.min(chartWidth - 60, Math.max(70, getX(hoverIndex)))}
                    y={padTop + 4}
                    fill="var(--text-primary)"
                    fontSize="9.5"
                    textAnchor="middle"
                    fontWeight="700"
                  >
                    {selectedRecipe.name} {hoveredPoint.v.toFixed(1)}배 (S&P {hoveredSpy.v.toFixed(1)}배)
                  </text>
                </g>
              )}
            </svg>
          </div>
        </div>

        {/* Benchmark Comparison Footer Note */}
        <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] text-[var(--text-secondary)] font-medium">
          <span>
            * 기준 S&P 500 성적: 연평균 <strong className="text-[var(--text-primary)]">15.1%</strong> | 최대 낙폭 <strong className="text-[var(--text-primary)]">-31.8%</strong> (15년간 약 8.3배 성장)
          </span>
        </div>
      </div>
    </div>
  );
}
