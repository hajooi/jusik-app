'use client';

import { useState, useRef, useEffect, useMemo } from 'react';

export interface ChartPoint {
  date: string;
  value: number;
}

interface SparklineChartProps {
  data: number[];
  points?: ChartPoint[];
  highlightLast?: number;
  height?: number;
}

export default function SparklineChart({
  data,
  points,
  highlightLast = 0,
  height = 160,
}: SparklineChartProps) {
  // 1. 유효한 숫자만 안전 필터링 (NaN, null, undefined 100% 차단)
  const sanitized = useMemo(() => {
    return Array.isArray(data) && data.length > 0
      ? data.filter((v): v is number => typeof v === 'number' && !isNaN(v) && isFinite(v))
      : [];
  }, [data]);

  // 0.0 ~ 1.0 정규화된 비율 배열을 보간하여 스케일 점프(5000 vs 3.86)로 인한 덜컹거림 원천 차단
  const normTarget = useMemo(() => {
    if (!sanitized.length) return [];
    const minVal = Math.min(...sanitized);
    const maxVal = Math.max(...sanitized);
    const rng = (maxVal - minVal) || 1;
    return sanitized.map((v) => (v - minVal) / rng);
  }, [sanitized]);

  // 정규화된 0.0 ~ 1.0 곡선 애니메이션 상태
  const [normPoints, setNormPoints] = useState<number[]>(normTarget);
  const animFrameRef = useRef<number>(0);
  const currentNormRef = useRef<number[]>(normTarget);
  const prevTargetRef = useRef<number[]>(normTarget);

  // 처음 마운트 시 180ms 스마트 딜레이 후 부드러운 스위프 활성화 (상위 RevealOnScroll 페이드인 완료 후 시작)
  const [hasAppeared, setHasAppeared] = useState(false);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHasAppeared(true);
    }, 180);
    return () => clearTimeout(timer);
  }, []);

  const getResampledNorm = (arr: number[], ratio: number): number => {
    if (!arr.length) return 0.5;
    if (arr.length === 1) return arr[0];
    const exactIdx = ratio * (arr.length - 1);
    const low = Math.floor(exactIdx);
    const high = Math.ceil(exactIdx);
    if (low === high) return arr[low];
    const weight = exactIdx - low;
    return arr[low] * (1 - weight) + arr[high] * weight;
  };

  // 렌더 패스 중 normTarget이 바뀌었을 때 normPoints를 즉시 이전 커브의 리샘플링 상태로 유지 (찰나의 새 그래프 튐 FOUC 원천 방지)
  if (prevTargetRef.current !== normTarget) {
    prevTargetRef.current = normTarget;
    if (currentNormRef.current.length > 0 && normTarget.length > 0) {
      const targetLen = normTarget.length;
      const initialResampled = normTarget.map((_, idx) => {
        const ratio = targetLen > 1 ? idx / (targetLen - 1) : 0;
        return getResampledNorm(currentNormRef.current, ratio);
      });
      setNormPoints(initialResampled);
    }
  }

  // 지수 변경 시 부드러운 스르륵 모핑 애니메이션 (애플 HIG 450ms 물리 감속)
  useEffect(() => {
    if (!normTarget.length) return;

    let startTime: number | null = null;
    const duration = 450; // 애플 HIG 표준 부드러운 높낮이 모핑
    const startNorm = currentNormRef.current.length > 0 ? currentNormRef.current : normTarget;

    const animate = (time: number) => {
      if (!startTime) startTime = time;
      const progress = Math.min((time - startTime) / duration, 1);
      // Apple HIG cubic-bezier(0.2, 0.8, 0.2, 1) 물리 감속 곡선
      const ease = 1 - Math.pow(1 - progress, 3.2);

      const targetLen = normTarget.length;
      const interpolated = normTarget.map((targetVal, idx) => {
        const ratio = targetLen > 1 ? idx / (targetLen - 1) : 0;
        const startVal = getResampledNorm(startNorm, ratio);
        return startVal + (targetVal - startVal) * ease;
      });

      setNormPoints(interpolated);
      currentNormRef.current = interpolated;

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [normTarget]);

  // ── 드래그 및 호버 인터랙션 상태 ──
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartIdx, setDragStartIdx] = useState<number | null>(null);
  const [dragEndIdx, setDragEndIdx] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  if (!sanitized || sanitized.length < 2) {
    return (
      <div
        className="w-full flex items-center justify-center text-xs text-[var(--text-secondary)]/50 font-mono"
        style={{ height: `${height}px` }}
      >
        데이터 준비 중...
      </div>
    );
  }

  // 내부 고정 해상도 800 x height
  const W = 800;
  const H = height;
  const PAD_X = 6;
  const PAD_TOP = 20; // 상단 플로팅 툴팁 및 여백
  const PAD_BOTTOM = 14;

  const toX = (i: number) => PAD_X + (i / Math.max(1, sanitized.length - 1)) * (W - PAD_X * 2);
  // 정규화된 0.0 ~ 1.0 비율로부터 Y 픽셀 계산 (스케일 차이로 인한 점프 원천 차단)
  const toYFromNorm = (norm: number) => H - PAD_BOTTOM - (Math.max(0, Math.min(1, norm)) * (H - PAD_TOP - PAD_BOTTOM));

  const displayNorms = normPoints.length === sanitized.length ? normPoints : normTarget;

  // 1년 일간 데이터에 매끄러운 스플라인(Spline) 곡선 생성 (Catmull-Rom to Cubic Bezier)
  const createSmoothPath = (norms: number[], startIndex = 0) => {
    if (norms.length === 0) return '';
    const pts = norms.map((norm, idx) => ({
      x: toX(startIndex + idx),
      y: toYFromNorm(norm),
    }));

    if (pts.length === 1) return `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
    if (pts.length === 2) {
      return `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)} L ${pts[1].x.toFixed(1)} ${pts[1].y.toFixed(1)}`;
    }

    let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
    const tension = 0.2; // 부드러운 금융 곡선 텐션 (과도한 오버슈트 방지)

    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = i > 0 ? pts[i - 1] : pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = i < pts.length - 2 ? pts[i + 2] : p2;

      const cp1x = p1.x + (p2.x - p0.x) * tension;
      const cp1y = p1.y + (p2.y - p0.y) * tension;
      const cp2x = p2.x - (p3.x - p1.x) * tension;
      const cp2y = p2.y - (p3.y - p1.y) * tension;

      d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }
    return d;
  };

  const pathD = createSmoothPath(displayNorms);
  const areaD = `${pathD} L ${toX(sanitized.length - 1).toFixed(1)} ${H - PAD_BOTTOM} L ${toX(0).toFixed(1)} ${H - PAD_BOTTOM} Z`;

  const hlStart = Math.max(0, sanitized.length - highlightLast - 1);
  const highlightPath = createSmoothPath(displayNorms.slice(hlStart), hlStart);

  const lastIdx = sanitized.length - 1;
  const lastVal = sanitized[lastIdx];

  // 단일 주황 테마
  const brandOrange = '#F18F01';

  // X 좌표로부터 인덱스 역산
  const getIndexFromClientX = (clientX: number): number => {
    if (!containerRef.current) return 0;
    const rect = containerRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return Math.round(ratio * (sanitized.length - 1));
  };

  // ── 마우스 이벤트 ──
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const idx = getIndexFromClientX(e.clientX);
    setIsDragging(true);
    setDragStartIdx(idx);
    setDragEndIdx(idx);
    setHoverIdx(idx);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const idx = getIndexFromClientX(e.clientX);
    setHoverIdx(idx);
    if (isDragging) {
      setDragEndIdx(idx);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setHoverIdx(null);
    if (!isDragging) {
      setDragStartIdx(null);
      setDragEndIdx(null);
    }
  };

  // ── 터치 이벤트 (모바일) ──
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!e.touches.length) return;
    const idx = getIndexFromClientX(e.touches[0].clientX);
    setIsDragging(true);
    setDragStartIdx(idx);
    setDragEndIdx(idx);
    setHoverIdx(idx);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!e.touches.length) return;
    const idx = getIndexFromClientX(e.touches[0].clientX);
    setHoverIdx(idx);
    if (isDragging) {
      setDragEndIdx(idx);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // ── 드래그 기간 수익률 계산 ──
  const dragInfo = useMemo(() => {
    if (dragStartIdx === null || dragEndIdx === null) return null;
    const s = Math.min(dragStartIdx, dragEndIdx);
    const e = Math.max(dragStartIdx, dragEndIdx);
    if (s === e) return null;

    const startVal = sanitized[s];
    const endVal = sanitized[e];
    if (startVal === 0) return null;

    const diffPercent = ((endVal - startVal) / startVal) * 100;
    const startDate = points?.[s]?.date ?? `${s}일`;
    const endDate = points?.[e]?.date ?? `${e}일`;

    const leftX = toX(s);
    const leftNorm = displayNorms[s] ?? normTarget[s] ?? 0.5;
    const leftY = toYFromNorm(leftNorm);

    const rightX = toX(e);
    const rightNorm = displayNorms[e] ?? normTarget[e] ?? 0.5;
    const rightY = toYFromNorm(rightNorm);
    const midX = (leftX + rightX) / 2;

    return {
      s,
      e,
      startDate,
      endDate,
      startVal,
      endVal,
      diffPercent,
      isPositive: diffPercent >= 0,
      leftX,
      leftY,
      rightX,
      rightY,
      midX,
      width: Math.max(2, rightX - leftX),
    };
  }, [dragStartIdx, dragEndIdx, sanitized, points, displayNorms, normTarget]);

  // 단일 호버 정보
  const activeIdx = hoverIdx !== null ? hoverIdx : null;
  const activeVal = activeIdx !== null ? sanitized[activeIdx] : null;
  const activeDate = activeIdx !== null && points?.[activeIdx]?.date
    ? points[activeIdx].date
    : '';
  const activeX = activeIdx !== null ? toX(activeIdx) : 0;
  const activeNorm = activeIdx !== null ? (displayNorms[activeIdx] ?? 0.5) : 0;
  const activeY = activeIdx !== null ? toYFromNorm(activeNorm) : 0;

  // 마지막 종가 좌표
  const lastX = toX(lastIdx);
  const lastNorm = displayNorms[lastIdx] ?? normTarget[lastIdx] ?? 0.5;
  const lastY = toYFromNorm(lastNorm);

  // 하단 X축 중간 날짜 틱 (양끝 강제 노출 제거, 겹침 방지 및 자연스러운 4개 균등 분할 날짜 20%, 40%, 60%, 80%)
  const xTicks = useMemo(() => {
    if (!points || points.length < 5) return [];
    // 20%, 40%, 60%, 80% 지점의 내부 날짜 4개 선택 (양끝값 억지 출력 방지)
    const fractions = [0.2, 0.4, 0.6, 0.8];
    return fractions.map((frac) => {
      const idx = Math.min(points.length - 1, Math.round((points.length - 1) * frac));
      return {
        date: points[idx].date.substring(2), // '25.12.01' 형태로 컴팩트
        ratio: idx / (points.length - 1),
      };
    });
  }, [points]);

  return (
    <div className="flex flex-col w-full select-none">
      {/* ── 1. 차트 메인 캔버스 (시뮬레이터와 동일하게 w-full h-auto 비율 유지 반응형) ── */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="relative w-full cursor-crosshair touch-none overflow-hidden"
      >
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-auto block"
        >
          <defs>
            <style>{`
              @keyframes chartSweepAnim {
                0% { width: 0px; }
                100% { width: ${W}px; }
              }
            `}</style>
            <clipPath id={`chartSweepClip-${animKey}`}>
              <rect
                key={animKey}
                x="0"
                y="0"
                width="0"
                height={H}
                style={{
                  animation: hasAppeared
                    ? 'chartSweepAnim 1250ms cubic-bezier(0.16, 1, 0.3, 1) forwards'
                    : 'none',
                }}
              />
            </clipPath>

            {/* 단일 주황 은은한 그라데이션 */}
            <linearGradient id="sparkOrangeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F18F01" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#F18F01" stopOpacity="0.00" />
            </linearGradient>

            <linearGradient id="hlGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#F18F01" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid lines */}
          {[0.25, 0.5, 0.75].map((t) => (
            <line
              key={t}
              x1={PAD_X}
              y1={PAD_TOP + (H - PAD_TOP - PAD_BOTTOM) * t}
              x2={W - PAD_X}
              y2={PAD_TOP + (H - PAD_TOP - PAD_BOTTOM) * t}
              stroke="var(--border-color)"
              strokeOpacity="0.35"
              strokeWidth="1"
              strokeDasharray="4 4"
              vectorEffect="non-scaling-stroke"
            />
          ))}

          {/* ── 드래그 선택 구간 하이라이트 박스 (주황 통일) ── */}
          {dragInfo && (
            <g>
              <rect
                x={dragInfo.leftX}
                y={PAD_TOP}
                width={dragInfo.width}
                height={H - PAD_TOP - PAD_BOTTOM}
                fill="rgba(241,143,1,0.12)"
                stroke="rgba(241,143,1,0.4)"
                strokeWidth="1.2"
                strokeDasharray="3 3"
                vectorEffect="non-scaling-stroke"
              />
            </g>
          )}

          {/* ── 차트 곡선 & 그라데이션 (주황 테마 및 부드러운 진입 스윕 모션) ── */}
          <g
            clipPath={`url(#chartSweepClip-${animKey})`}
            className={`transition-opacity duration-200 ${hasAppeared ? 'opacity-100' : 'opacity-0'}`}
          >
            {/* Area fill */}
            <path d={areaD} fill="url(#sparkOrangeGrad)" />

            {/* Main 1-year daily line (시그니처 주황, non-scaling-stroke로 가로세로 왜곡/눌림 방지) */}
            <path
              d={pathD}
              fill="none"
              stroke={brandOrange}
              strokeWidth="2.2"
              strokeOpacity="0.9"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />

            {/* Highlight last N trajectory */}
            {highlightLast > 0 && (
              <path
                d={highlightPath}
                fill="none"
                stroke="url(#hlGrad)"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            )}
          </g>

          {/* Vertical Crosshair Guide line */}
          {activeIdx !== null && (
            <line
              x1={activeX}
              y1={PAD_TOP}
              x2={activeX}
              y2={H - PAD_BOTTOM}
              stroke="rgba(241,143,1,0.8)"
              strokeWidth="1.2"
              strokeDasharray="2 2"
              vectorEffect="non-scaling-stroke"
            />
          )}
        </svg>

        {/* ── HTML-Anchored Dots with Apple Pulse Ring ── */}

        {/* 1. Normal Current Dot (마지막 종가 지점: 주황색 펄스 링 - 드로잉 완료와 부드럽게 연계) */}
        {activeIdx === null && !dragInfo && (
          <div
            className={`absolute pointer-events-none flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 transition-opacity duration-500 ${
              hasAppeared ? 'opacity-100 delay-700' : 'opacity-0'
            }`}
            style={{
              left: `${(lastX / W) * 100}%`,
              top: `${(lastY / H) * 100}%`,
              width: '24px',
              height: '24px',
            }}
          >
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent-orange)]/50 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[var(--accent-orange)] border-2 border-white shadow-[0_0_8px_rgba(241,143,1,0.9)]" />
          </div>
        )}

        {/* 2. Hover Pointer Dot (호버 시 주황색 펄스 링) */}
        {activeIdx !== null && !dragInfo && (
          <div
            className="absolute pointer-events-none flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${(activeX / W) * 100}%`,
              top: `${(activeY / H) * 100}%`,
              width: '28px',
              height: '28px',
            }}
          >
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent-orange)]/60 opacity-80" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[var(--accent-orange)] border-2 border-white shadow-[0_0_10px_rgba(241,143,1,0.95)]" />
          </div>
        )}

        {/* 3. Dragging Boundary Dots (드래그 시 양 끝 시작점/끝점 위에 호버 원 고정) */}
        {dragInfo && (
          <>
            {/* 시작점 점 */}
            <div
              className="absolute pointer-events-none flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 z-10"
              style={{
                left: `${(dragInfo.leftX / W) * 100}%`,
                top: `${(dragInfo.leftY / H) * 100}%`,
                width: '24px',
                height: '24px',
              }}
            >
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent-orange)]/50 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[var(--accent-orange)] border-2 border-white shadow-[0_0_8px_rgba(241,143,1,0.9)]" />
            </div>

            {/* 끝점 점 */}
            <div
              className="absolute pointer-events-none flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 z-10"
              style={{
                left: `${(dragInfo.rightX / W) * 100}%`,
                top: `${(dragInfo.rightY / H) * 100}%`,
                width: '28px',
                height: '28px',
              }}
            >
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent-orange)]/60 opacity-85" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[var(--accent-orange)] border-2 border-white shadow-[0_0_10px_rgba(241,143,1,0.95)]" />
            </div>
          </>
        )}

        {/* ── 단일 호버/터치 툴팁 (모바일/데스크톱 경계면 잘림 100% 방지) ── */}
        {activeIdx !== null && activeVal !== null && !dragInfo && (
          <div
            className="absolute pointer-events-none top-1.5 z-20 px-2 sm:px-2.5 py-1 rounded-xl bg-[var(--card-surface)]/95 border border-[var(--accent-orange)]/60 shadow-[0_0_14px_rgba(241,143,1,0.22)] text-center whitespace-nowrap transition-all duration-75 backdrop-blur-md"
            style={(() => {
              const pct = (activeX / W) * 100;
              // 모바일 양 끝단(0~18% 또는 82~100%) 터치 시 화면 밖 잘림 방지
              if (pct < 18) {
                return { left: '8px', transform: 'none' };
              }
              if (pct > 82) {
                return { right: '8px', left: 'auto', transform: 'none' };
              }
              return { left: `${pct}%`, transform: 'translateX(-50%)' };
            })()}
          >
            <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-[11px] font-mono leading-none">
              {activeDate && (
                <span className="text-[var(--text-secondary)] font-semibold">
                  {/* 모바일에서는 '26.03.04' 형태로 컴팩트 */}
                  {activeDate.replace(/^\d{2}(\d{2}\.)/, '$1')}
                </span>
              )}
              <span className="text-[var(--text-primary)] font-extrabold tabular-nums">
                {activeVal.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        )}

        {/* ── 드래그 기간 수익률 플로팅 뱃지 (선택 구간 중심을 자연스럽게 추적하며 경계면 안착) ── */}
        {dragInfo && (
          <div
            className="absolute pointer-events-none top-1.5 z-30 max-w-[94%] px-2.5 sm:px-3 py-1 rounded-full bg-[var(--card-surface)]/95 border border-[var(--accent-orange)]/80 shadow-[0_0_18px_rgba(241,143,1,0.25)] whitespace-nowrap transition-all duration-75 backdrop-blur-md"
            style={(() => {
              const pct = (dragInfo.midX / W) * 100;
              // 뱃지 가로 폭을 고려한 스마트 양 끝단 마진 클램핑 (왼쪽 22% 미만, 오른쪽 78% 초과 시 벽에 자동 안착)
              if (pct < 22) {
                return { left: '8px', transform: 'none' };
              }
              if (pct > 78) {
                return { right: '8px', left: 'auto', transform: 'none' };
              }
              return { left: `${pct}%`, transform: 'translateX(-50%)' };
            })()}
          >
            <div className="flex items-center gap-1.5 sm:gap-2 font-mono text-xs">
              <span className="text-[10px] sm:text-[11px] text-[var(--text-secondary)] font-semibold">
                {dragInfo.startDate.replace(/^\d{2}(\d{2}\.)/, '$1')} ~ {dragInfo.endDate.replace(/^\d{2}(\d{2}\.)/, '$1')}
              </span>
              <span className="w-1 h-1 rounded-full bg-[var(--border-color)] shrink-0" />
              <span className="font-extrabold text-[11px] sm:text-xs text-[var(--accent-orange)] font-mono shrink-0">
                {dragInfo.isPositive ? '+' : ''}{dragInfo.diffPercent.toFixed(2)}%
              </span>
              <span className="text-[10px] text-[var(--text-secondary)]/80 font-medium hidden md:inline shrink-0">
                ({dragInfo.startVal.toLocaleString(undefined, { maximumFractionDigits: 1 })} ➔ {dragInfo.endVal.toLocaleString(undefined, { maximumFractionDigits: 1 })})
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── 2. X축 연/월 텍스트 라벨 (순수 HTML 레이어로 분리하여 텍스트 왜곡 원천 차단) ── */}
      <div className="relative w-full h-4 select-none pointer-events-none mt-1 px-1.5">
        {xTicks.map((t, idx) => (
          <span
            key={idx}
            className="absolute text-[10px] sm:text-[11px] font-mono text-[var(--text-secondary)]/70 -translate-x-1/2 whitespace-nowrap"
            style={{
              left: `${t.ratio * 100}%`,
            }}
          >
            {t.date}
          </span>
        ))}
      </div>
    </div>
  );
}
