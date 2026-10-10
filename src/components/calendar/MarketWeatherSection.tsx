'use client';

import { useEffect, useState } from 'react';
import {
  MARKET_SNAPSHOT,
  ASSET_CHARTS,
  WEATHER_PRESETS,
  TODAY_MARKET_NEWS,
  MarketNewsItem,
  INDICATOR_METADATA,
  MACRO_ASSET_CHARTS,
  MACRO_SUMMARY_ITEMS,
} from '@/data/marketCalendar';
import { TrendingDown, TrendingUp, ExternalLink, Newspaper, Activity, Coins, CheckCircle2, AlertTriangle } from 'lucide-react';
import SparklineChart from './SparklineChart';
import RevealOnScroll from '@/components/common/RevealOnScroll';
import SmoothHeight from '@/components/SmoothHeight';
import {
  evaluateCreditSpreadSignal,
  evaluateFedRateSignal,
  evaluateCpiSignal,
  evaluateUnemploymentSignal,
  evaluateEpsSignal,
  MacroSignalResult,
} from '@/utils/macroSignals';

const WEATHER_EMOJI: Record<string, string> = {
  sunny: '☀️',
  cloudy: '⛅',
  overcast: '🌥️',
  rainy: '🌧️',
  stormy: '⛈️',
};

const FG_BAR_COLOR = (value: number) =>
  value >= 75 ? '#F18F01' : // 극도의 탐욕 (Buong Orange)
  value >= 55 ? '#D97706' : // 탐욕 (Deep Amber)
  value >= 45 ? '#64748B' : // 중립 (Muted Steel)
  value >= 25 ? '#FB7185' : // 공포 (Soft Rose / Coral)
  '#F43F5E';                // 극도의 공포 (Signal Crimson)

const CACHE_KEY = 'jusik_market_daily_cache_v4';
const CACHE_TTL_MS = 60 * 60 * 1000; // 1시간 (오래된 과거 데이터 노출 방지)

// 차트 호버/드래그 툴팁용 지표별 공식 정밀 자릿수 및 단위 통일 포맷터
export function formatChartValue(assetKey: string, val: number): string {
  if (assetKey === 'DFEDTARU') return `${val.toFixed(2)}%`;
  if (assetKey === 'CPI_YOY') return `${val.toFixed(2)}%`;
  if (assetKey === 'UNEMPLOYMENT') return `${val.toFixed(1)}%`;
  if (assetKey === 'CREDIT_SPREAD') return `${val.toFixed(2)}%`;
  if (assetKey === 'SP500_EPS') return `$${val.toFixed(2)}`;
  if (assetKey === '달러/원' || assetKey === '달러 환율') return `${Math.round(val).toLocaleString()}원`;
  if (assetKey === '미국채 10년') return `${val.toFixed(2)}%`;
  if (assetKey === '국제 금') return `$${Math.round(val).toLocaleString()}`;
  if (assetKey === '국제 유가') return `$${val.toFixed(1)}`;
  if (assetKey === '비트코인') return `$${Math.round(val).toLocaleString()}`;
  if (assetKey === 'DJI') return val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// 실제 마켓 카드와 100% 동일한 그리드/높이/패딩을 갖는 0-CLS 글래스모픽 스켈레톤
function MarketWeatherSkeleton() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      {/* 1. Hero Atmosphere Card Skeleton */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-[var(--card-surface)]/90 backdrop-blur-md border border-[var(--border-color)]/90 shadow-2xs text-center flex flex-col items-center">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[var(--border-color)]/40 my-1" />
        <div className="space-y-2 mt-2 w-full flex flex-col items-center max-w-lg">
          <div className="h-6 sm:h-7 w-48 sm:w-64 rounded-lg bg-[var(--border-color)]/40" />
          <div className="h-4 w-64 sm:w-80 rounded-md bg-[var(--border-color)]/25" />
          <div className="h-3 w-32 rounded-md bg-[var(--border-color)]/20 pt-1" />
        </div>
        <div className="w-full max-w-xs sm:max-w-sm mt-5 space-y-2">
          <div className="flex items-center justify-between px-0.5">
            <div className="h-3.5 w-24 rounded bg-[var(--border-color)]/30" />
            <div className="h-4 w-20 rounded-full bg-[var(--border-color)]/30" />
          </div>
          <div className="w-full h-2.5 rounded-full bg-[var(--bg-main)] border border-[var(--border-color)]/40 overflow-hidden">
            <div className="h-full w-1/2 rounded-full bg-[var(--border-color)]/40" />
          </div>
          <div className="flex justify-between px-0.5">
            <div className="h-2.5 w-16 rounded bg-[var(--border-color)]/20" />
            <div className="h-2.5 w-12 rounded bg-[var(--border-color)]/20" />
            <div className="h-2.5 w-16 rounded bg-[var(--border-color)]/20" />
          </div>
        </div>
      </div>

      {/* 2. Master Card Skeleton */}
      <div className="rounded-2xl sm:rounded-3xl p-4 sm:p-6 bg-[var(--card-surface)] border border-[var(--border-color)]/90 shadow-2xs space-y-5">
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
            <div className="h-5 w-32 rounded bg-[var(--border-color)]/40" />
            <div className="h-5 w-24 rounded bg-[var(--border-color)]/30" />
          </div>
          <div className="w-full h-[180px] rounded-xl bg-[var(--bg-main)]/60 border border-[var(--border-color)]/40" />
        </div>

        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-0.5">
            <div className="h-3.5 w-16 rounded bg-[var(--border-color)]/30" />
            <div className="h-3 w-20 rounded bg-[var(--border-color)]/20" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 [&>*:last-child]:col-span-2 sm:[&>*:last-child]:col-span-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="rounded-xl p-3 bg-[var(--card-surface)]/80 border border-[var(--border-color)]/80 shadow-2xs space-y-2">
                <div className="h-3 w-12 rounded bg-[var(--border-color)]/30" />
                <div className="h-5 w-20 rounded bg-[var(--border-color)]/40" />
                <div className="h-3 w-14 rounded bg-[var(--border-color)]/25" />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2 pt-0.5">
          <div className="px-0.5">
            <div className="h-3.5 w-20 rounded bg-[var(--border-color)]/30" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 [&>*:last-child]:col-span-2 sm:[&>*:last-child]:col-span-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="rounded-xl px-3 py-2.5 bg-[var(--card-surface)]/80 border border-[var(--border-color)]/80 shadow-2xs flex items-center justify-between">
                <div className="h-3 w-14 rounded bg-[var(--border-color)]/30" />
                <div className="h-3 w-12 rounded bg-[var(--border-color)]/40" />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2.5 pt-1">
          <div className="flex items-center justify-between px-0.5">
            <div className="h-3.5 w-24 rounded bg-[var(--border-color)]/30" />
            <div className="h-4 w-28 rounded-full bg-[var(--border-color)]/25" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 [&>*:last-child]:col-span-2 sm:[&>*:last-child]:col-span-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="rounded-xl p-3 bg-[var(--card-surface)]/80 border border-[var(--border-color)]/80 shadow-2xs space-y-2.5">
                <div className="h-3 w-16 rounded bg-[var(--border-color)]/30" />
                <div className="h-5 w-20 rounded bg-[var(--border-color)]/40" />
                <div className="h-4 w-14 rounded bg-[var(--border-color)]/20 pt-1" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. News Skeleton */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="h-4 w-28 rounded bg-[var(--border-color)]/30" />
          <div className="h-3 w-20 rounded bg-[var(--border-color)]/20" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-3.5 sm:p-4 rounded-2xl bg-[var(--card-surface)] border border-[var(--border-color)]/90 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="h-3.5 w-14 rounded bg-[var(--border-color)]/30" />
                <div className="h-3.5 w-3.5 rounded bg-[var(--border-color)]/20" />
              </div>
              <div className="h-4 w-full rounded bg-[var(--border-color)]/35" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function MarketWeatherSection({
  onWeatherChange,
}: {
  onWeatherChange?: (state: any) => void;
}) {
  const [snapshot, setSnapshot] = useState<typeof MARKET_SNAPSHOT | null>(null);
  const [charts, setCharts] = useState<typeof ASSET_CHARTS | null>(null);
  const [macroCharts, setMacroCharts] = useState<typeof MACRO_ASSET_CHARTS>(MACRO_ASSET_CHARTS);
  const [macroSummary, setMacroSummary] = useState<typeof MACRO_SUMMARY_ITEMS>(MACRO_SUMMARY_ITEMS);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAssetKey, setSelectedAssetKey] = useState<string>('SPX');
  const [gaugeWidth, setGaugeWidth] = useState(0);

  // 로컬 캐시(1시간 TTL) 로드 및 최신 API 비동기 SWR 연동
  useEffect(() => {
    let isMounted = true;

    const mergeMacroSummary = (incoming?: any[]) => {
      if (!Array.isArray(incoming) || incoming.length === 0) return MACRO_SUMMARY_ITEMS;
      return MACRO_SUMMARY_ITEMS.map((base) => {
        if (base.key === 'SP500_EPS') return base;
        const found = incoming.find((item: any) => item?.key === base.key);
        return found ? { ...base, ...found } : base;
      });
    };

    const mergeMacroCharts = (incoming?: any) => {
      const merged: Record<string, any> = {
        ...MACRO_ASSET_CHARTS,
        ...(incoming || {}),
        SP500_EPS: MACRO_ASSET_CHARTS.SP500_EPS,
      };
      for (const k of Object.keys(MACRO_ASSET_CHARTS)) {
        if (merged[k]) {
          merged[k] = { ...merged[k], label: MACRO_ASSET_CHARTS[k].label };
          if (k !== 'CREDIT_SPREAD' && Array.isArray(merged[k].points) && merged[k].points.length > 60) {
            merged[k].points = merged[k].points.slice(-60);
            if (Array.isArray(merged[k].data)) {
              merged[k].data = merged[k].data.slice(-60);
            }
          }
        }
      }
      return merged;
    };

    // 1. 유효한 로컬 캐시가 있으면 즉시 0ms 렌더링 (깜빡임 및 덜컹거림 없음)
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        const isFresh = parsed?.timestamp && (Date.now() - parsed.timestamp < CACHE_TTL_MS);
        if (isFresh && parsed?.data?.snapshot && parsed?.data?.assetCharts) {
          setSnapshot(parsed.data.snapshot);
          setCharts(parsed.data.assetCharts);
          if (parsed.data.macroAssetCharts) setMacroCharts(mergeMacroCharts(parsed.data.macroAssetCharts));
          if (parsed.data.macroSummaryItems) setMacroSummary(mergeMacroSummary(parsed.data.macroSummaryItems));
          setIsLoading(false);
          if (onWeatherChange && parsed.data.snapshot.weatherState) {
            onWeatherChange(parsed.data.snapshot.weatherState);
          }
        }
      }
    } catch (e) {
      console.warn('Market daily cache read error:', e);
    }

    // 2. 백그라운드에서 최신 API 데이터 확인 및 갱신 (SWR)
    fetch(`/api/market/daily?t=${Date.now()}`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.success && data.snapshot && data.assetCharts) {
          setSnapshot(data.snapshot);
          setCharts(data.assetCharts);
          if (data.macroAssetCharts) setMacroCharts(mergeMacroCharts(data.macroAssetCharts));
          if (data.macroSummaryItems) setMacroSummary(mergeMacroSummary(data.macroSummaryItems));
          setIsLoading(false);
          if (onWeatherChange && data.snapshot.weatherState) {
            onWeatherChange(data.snapshot.weatherState);
          }
          try {
            localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
          } catch (saveErr) {
            console.warn('Market daily cache save error:', saveErr);
          }
        }
      })
      .catch((err) => {
        console.warn('Daily market fetch error:', err);
        if (isMounted) {
          setSnapshot((prev) => prev ?? MARKET_SNAPSHOT);
          setCharts((prev) => prev ?? ASSET_CHARTS);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [onWeatherChange]);

  const fearGreedScore = snapshot?.fearGreedIndex ?? 50;

  // Gauge fill animation
  useEffect(() => {
    const t = setTimeout(() => setGaugeWidth(fearGreedScore), 300);
    return () => clearTimeout(t);
  }, [fearGreedScore]);

  if (isLoading || !snapshot || !charts) {
    return (
      <SmoothHeight>
        <MarketWeatherSkeleton />
      </SmoothHeight>
    );
  }

  const { weatherState, fearGreedIndex, fearGreedLabel, indices, auxiliary } =
    snapshot;
  const currentPreset = WEATHER_PRESETS[weatherState] || WEATHER_PRESETS.overcast;
  const weatherMessage = currentPreset.message || snapshot.weatherMessage;
  const weatherSubMessage = currentPreset.subMessage || snapshot.weatherSubMessage;
  const newsList: MarketNewsItem[] = (snapshot as any)?.todayNews || TODAY_MARKET_NEWS;

  const currentMeta = INDICATOR_METADATA[selectedAssetKey] ?? INDICATOR_METADATA.SPX;
  const activeChart =
    charts[selectedAssetKey] ??
    macroCharts[selectedAssetKey] ??
    charts.SPX ??
    ASSET_CHARTS.SPX;
  const barColor = FG_BAR_COLOR(fearGreedIndex);

  // 5대 거시경제 핵심 지표 신호등 판정
  const signals: Record<string, MacroSignalResult> = {
    DFEDTARU: evaluateFedRateSignal(macroCharts.DFEDTARU?.points ?? []),
    CPI_YOY: evaluateCpiSignal(macroCharts.CPI_YOY?.points ?? []),
    UNEMPLOYMENT: evaluateUnemploymentSignal(macroCharts.UNEMPLOYMENT?.points ?? []),
    SP500_EPS: evaluateEpsSignal(macroCharts.SP500_EPS?.points ?? []),
    CREDIT_SPREAD: evaluateCreditSpreadSignal(macroCharts.CREDIT_SPREAD?.points ?? []),
  };

  const emeraldCount = Object.values(signals).filter((s) => s.status === 'emerald').length;
  const orangeCount = Object.values(signals).filter((s) => s.status === 'orange').length;

  return (
    <SmoothHeight>
      <div className="flex flex-col gap-6">

        {/* ── 1. Apple Weather Style Centered Atmosphere Hero ── */}
        <RevealOnScroll delayIndex={0}>
          <div className="relative p-6 sm:p-8 rounded-3xl bg-[var(--card-surface)]/90 backdrop-blur-md border border-[var(--border-color)]/90 shadow-2xs text-center flex flex-col items-center">
            {/* Centered Large Weather Graphic */}
            <div className="text-5xl sm:text-6xl my-1 animate-pulse">
              {WEATHER_EMOJI[weatherState]}
            </div>

          {/* Headline & Atmosphere Copy */}
          <div className="space-y-1.5 mt-2 max-w-lg">
            <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] leading-tight break-keep">
              {weatherMessage}
            </h2>

            {weatherSubMessage && (
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed font-medium break-keep">
                {weatherSubMessage}
              </p>
            )}

            <p className="text-[11px] text-[var(--text-secondary)]/60 pt-1 font-mono">
              {snapshot.updatedAt}
            </p>
          </div>

          {/* Integrated Gauge Bar with Fear & Greed Badge (Clean layout without dividing line) */}
          <div className="w-full max-w-xs sm:max-w-sm mt-5 space-y-2">
            <div className="flex items-center justify-between px-0.5">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-[var(--text-secondary)]">공포와 탐욕 지수</span>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-secondary)]/80">
                  미국 증시 기준
                </span>
              </div>
              <span className="text-xs font-black font-mono px-2.5 py-0.5 rounded-full bg-[var(--bg-main)] border border-[var(--border-color)]" style={{ color: barColor }}>
                {fearGreedIndex}점 ({fearGreedLabel})
              </span>
            </div>

            <div className="w-full h-2.5 rounded-full bg-[var(--bg-main)] border border-[var(--border-color)]/40 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${gaugeWidth}%`,
                  background: barColor,
                  transition: 'width 1.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
                }}
              />
            </div>
            <div className="flex justify-between text-[var(--text-secondary)]/60 text-[10px] font-semibold px-0.5">
              <span>0 (극도의 공포)</span>
              <span>50 (중립)</span>
              <span>100 (극도의 탐욕)</span>
            </div>
          </div>
        </div>
      </RevealOnScroll>

      {/* ── 2. Integrated Market Status Master Card (Chart + Indices + Commodities) ── */}
      <RevealOnScroll delayIndex={1}>
        <div className="rounded-2xl sm:rounded-3xl p-4 sm:p-6 bg-[var(--card-surface)] border border-[var(--border-color)]/90 shadow-2xs space-y-5">
          {/* 1) Chart Header & Sparkline Canvas */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
              <div className="flex flex-col gap-0.5">
                <div className="flex items-baseline gap-2">
                  <span className="font-extrabold text-base sm:text-lg text-[var(--text-primary)] tracking-tight">
                    {activeChart.label}
                  </span>
                  <span className="text-xs text-[var(--text-secondary)] font-medium">
                    {currentMeta?.period ?? '최근 1년 추이'}
                  </span>
                </div>
                {currentMeta?.summary && (
                  <p className="text-[11px] sm:text-xs text-[var(--text-secondary)] font-medium">
                    {currentMeta.summary}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1 sm:mt-0">
                <span className="font-extrabold text-base sm:text-lg tabular-nums text-[var(--text-primary)] tracking-tight">
                  {activeChart.current}
                </span>
                {activeChart.change && (
                  <div className="flex items-center gap-1">
                    <span className={`text-xs font-extrabold tabular-nums ${
                      activeChart.isPositive ? 'text-emerald-500' : 'text-rose-500'
                    }`}>
                      {activeChart.change}
                    </span>
                    <span className="text-[11px] text-[var(--text-secondary)] font-medium">
                      ({currentMeta?.period?.includes('5년') ? '5년 기준' : '1년 기준'})
                    </span>
                  </div>
                )}
              </div>
            </div>

            <SparklineChart
              data={activeChart.data}
              points={(activeChart as any).points}
              highlightLast={4}
              height={180}
              valueFormatter={(val) => formatChartValue(selectedAssetKey, val)}
            />
          </div>

          {/* 2) Main 4 Stock Indices Controls */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-0.5">
              <span className="text-xs font-bold text-[var(--text-secondary)] flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-[var(--accent-orange)]" />
                <span>주요 지수</span>
              </span>
              <span className="text-[11px] text-[var(--text-secondary)]/70 font-mono">
                전일 마감 대비
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {indices.map((idx) => {
                const isSelected = selectedAssetKey === idx.code;
                return (
                  <button
                    key={idx.code}
                    onClick={() => setSelectedAssetKey(idx.code)}
                    className={`text-left rounded-xl p-3 backdrop-blur-md border transition-all duration-300 cursor-pointer relative overflow-hidden outline-none focus:outline-none focus-visible:outline-none ${
                      isSelected
                        ? 'border-[var(--accent-orange)] shadow-[0_0_18px_rgba(241,143,1,0.22)] bg-[var(--accent-orange)]/10'
                        : 'bg-[var(--card-surface)]/80 border-[var(--border-color)]/80 shadow-2xs hover:border-[var(--accent-orange)]/50 hover:shadow-[0_0_18px_rgba(241,143,1,0.18)] hover:bg-[var(--card-hover)]'
                    }`}
                  >
                    <div className="text-[var(--text-secondary)] text-[11px] font-semibold mb-0.5 flex items-center justify-between">
                      <span className={isSelected ? 'text-[var(--accent-orange)] font-bold' : ''}>{idx.name}</span>
                    </div>
                    <div className="text-[var(--text-primary)] font-extrabold text-sm sm:text-base tabular-nums tracking-tight">
                      {idx.value}
                    </div>
                    <div className={`flex items-center gap-0.5 text-[11px] font-extrabold mt-1 tabular-nums ${
                      idx.isPositive ? 'text-emerald-500' : 'text-rose-500'
                    }`}>
                      {idx.isPositive
                        ? <TrendingUp className="w-3 h-3 stroke-[2.5]" />
                        : <TrendingDown className="w-3 h-3 stroke-[2.5]" />}
                      <span>{idx.changePercent.endsWith('%') ? idx.changePercent : `${idx.changePercent}%`}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3) Macro Auxiliary Chips Controls */}
          <div className="space-y-2 pt-0.5">
            <div className="px-0.5">
              <span className="text-xs font-bold text-[var(--text-secondary)] flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-[var(--accent-orange)]" />
                <span>환율 및 대체자산</span>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {auxiliary.map((a) => {
                const isSelected = selectedAssetKey === a.label;
                return (
                  <button
                    key={a.label}
                    onClick={() => setSelectedAssetKey(a.label)}
                    className={`text-left rounded-xl px-3 py-2.5 backdrop-blur-md border transition-all duration-300 flex items-center justify-between cursor-pointer outline-none focus:outline-none focus-visible:outline-none ${
                      isSelected
                        ? 'border-[var(--accent-orange)] shadow-[0_0_18px_rgba(241,143,1,0.22)] bg-[var(--accent-orange)]/10'
                        : 'bg-[var(--card-surface)]/80 border-[var(--border-color)]/80 shadow-2xs hover:border-[var(--accent-orange)]/50 hover:shadow-[0_0_18px_rgba(241,143,1,0.18)] hover:bg-[var(--card-hover)]'
                    }`}
                  >
                    <span className={`text-[11px] font-medium transition-colors ${isSelected ? 'text-[var(--accent-orange)] font-bold' : 'text-[var(--text-secondary)]'}`}>
                      {a.label}
                    </span>
                    <span className="text-[11px] font-bold tabular-nums text-[var(--text-primary)]">
                      {a.value}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4) Macro Core Indicators Controls (5-Year Cycle) with Cockpit Signals */}
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center justify-between px-0.5">
              <span className="text-xs font-bold text-[var(--text-secondary)] flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-[var(--accent-orange)]" />
                <span>핵심 경제 지표</span>
              </span>
              <div className="flex items-center gap-1.5 text-[11px] font-bold font-mono px-2.5 py-1 rounded-full bg-[var(--bg-main)] border border-[var(--border-color)]">
                <span className="flex items-center gap-1 text-emerald-500">
                  <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>{emeraldCount}개 안정</span>
                </span>
                <span className="text-[var(--text-secondary)]/30">·</span>
                <span className="flex items-center gap-1 text-[var(--accent-orange)]">
                  <AlertTriangle className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>{orangeCount}개 주의</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {macroSummary.map((item) => {
                const isSelected = selectedAssetKey === item.key;
                const signal = signals[item.key] ?? { status: 'emerald', label: '안정', detail: '' };
                const isEmerald = signal.status === 'emerald';
                return (
                  <button
                    key={item.key}
                    onClick={() => setSelectedAssetKey(item.key)}
                    className={`text-left rounded-xl p-3 backdrop-blur-md border transition-all duration-300 cursor-pointer relative overflow-hidden flex flex-col justify-between outline-none focus:outline-none focus-visible:outline-none ${
                      isSelected
                        ? 'border-[var(--accent-orange)] shadow-[0_0_18px_rgba(241,143,1,0.22)] bg-[var(--accent-orange)]/10'
                        : 'bg-[var(--card-surface)]/80 border-[var(--border-color)]/80 shadow-2xs hover:border-[var(--accent-orange)]/50 hover:shadow-[0_0_18px_rgba(241,143,1,0.18)] hover:bg-[var(--card-hover)]'
                    }`}
                  >
                    <div>
                      <div className="text-[var(--text-secondary)] text-[11px] font-semibold mb-1 flex items-center justify-between">
                        <span className={isSelected ? 'text-[var(--accent-orange)] font-bold' : ''}>
                          {item.name}
                        </span>
                      </div>
                      <div className="text-[var(--text-primary)] font-extrabold text-sm sm:text-base tabular-nums tracking-tight">
                        {item.value}
                      </div>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${
                        isEmerald
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/25'
                          : 'bg-[var(--accent-orange)]/10 text-[var(--accent-orange)] border-[var(--accent-orange)]/30'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          isEmerald ? 'bg-emerald-500' : 'bg-[var(--accent-orange)]'
                        }`} />
                        {signal.label}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </RevealOnScroll>

      {/* ── 5. Today's Key Market News (Korean Financial Media with Direct Links) ── */}
      <RevealOnScroll delayIndex={4}>
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm sm:text-base font-bold text-[var(--text-primary)] flex items-center gap-1.5">
              <Newspaper className="w-4 h-4 text-[var(--accent-orange)]" />
              <span>오늘 장 핵심 뉴스</span>
            </h2>
            <span className="text-xs text-[var(--text-secondary)] font-mono">
              한국 · 미국 시황
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {newsList.map((item) => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group p-3.5 sm:p-4 rounded-2xl bg-[var(--card-surface)] border border-[var(--border-color)]/90 shadow-2xs hover:border-[var(--accent-orange)]/50 hover:shadow-[0_0_18px_rgba(241,143,1,0.18)] transition-all duration-200 flex flex-col justify-start gap-2.5"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="px-2 py-0.5 rounded-md bg-[var(--accent-orange)]/10 text-[var(--accent-orange)] font-extrabold font-mono text-[10px] sm:text-xs">
                    {item.source}
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-[var(--text-secondary)]/50 group-hover:text-[var(--accent-orange)] transition-colors" />
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-orange)] transition-colors leading-snug break-keep">
                  {item.title}
                </h4>
              </a>
            ))}
          </div>
        </div>
      </RevealOnScroll>
    </div>
  </SmoothHeight>
);
}
