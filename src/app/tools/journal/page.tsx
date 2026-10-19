'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  Trash2,
  RefreshCw,
  Check,
  X,
  Wallet,
  TrendingUp,
  PieChart,
  DollarSign,
  Coins,
  Banknote,
  Edit2,
  Layers,
  List,
  ShieldAlert,
  HelpCircle,
  Sparkles,
  Download,
  Settings,
  ArrowDownRight,
  ArrowUpRight,
  RotateCcw,
  ArrowUpDown,
  GripVertical,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  FileText,
  Loader2,
  AlertCircle,
  ArrowLeftRight,
  Crown,
  Lock,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { formatChartWon, getNiceTicks } from '@/utils/formatChart';
import SmoothHeight from '@/components/SmoothHeight';
import {
  JournalAccount,
  JournalGroup,
  CashDepositLog,
  AssetSnapshot,
  QuoteMap,
  PortfolioSummary,
  PlanLine,
  calcPlan,
  calcPortfolioSummary,
  calcAllAccountsSummary,
  calcNewAvgPrice,
  calcRealizedProfit,
  getSymbolUnit,
  isCryptoSymbol,
  normalizeSymbol,
  priceKrw,
  symbolName,
  calculateTradeSettlement,
  TradeSettlementResult,
} from '@/utils/rebalance';

interface JournalLog {
  id: string;
  date: string;
  accountId?: string;
  accountName: string;
  items: { name: string; symbol: string; qty: number; amountKrw: number; price?: number }[];
  type?: 'BUY' | 'SELL' | 'MIXED';
  realizedProfit?: number; // 실현 손익 (원)
  profitRate?: number; // 실현 수익률 (%)
  cashNeutral?: boolean; // 과거 날짜 등록 기록: 예수금에 반영하지 않음
}

interface JournalData {
  accounts: JournalAccount[];
  logs: JournalLog[];
}

// 다중 종목 묶음 로그를 1종목 1로그로 자동 분해(Flattening)하여 독립 관리 지원
const flattenLogs = (logs: JournalLog[]): JournalLog[] => {
  if (!Array.isArray(logs)) return [];
  const result: JournalLog[] = [];
  logs.forEach((log) => {
    if (!log.items || log.items.length <= 1) {
      result.push(log);
    } else {
      log.items.forEach((item, idx) => {
        result.push({
          id: `${log.id}-${idx}`,
          date: log.date,
          accountName: log.accountName,
          items: [item],
          type: item.qty < 0 ? 'SELL' : 'BUY',
          realizedProfit: item.qty < 0 ? log.realizedProfit : undefined,
          profitRate: item.qty < 0 ? log.profitRate : undefined,
          cashNeutral: log.cashNeutral,
        });
      });
    }
  });
  return result;
};

const getJournalStorageKey = (nickname?: string | null) =>
  nickname && nickname.trim() ? `jusik_journal_${nickname.trim()}` : 'jusik_journal_guest';
const uid = () => Math.random().toString(36).slice(2, 10);
const won = (n: number) => `${Math.round(n).toLocaleString('ko-KR')}원`;



// 브라우저 로컬 타임존(KST) 기준 YYYY-MM-DD 문자열 반환 (자정 넘김 즉시 반영)
const getLocalDateString = (d: Date = new Date()): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 저장된 로그의 날짜(UTC ISO 또는 YYYY-MM-DD)를 브라우저 로컬 타임존(KST) 기준 YYYY-MM-DD로 일관성 있게 변환
const formatLogDate = (dateStr: string): string => {
  if (!dateStr) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr.slice(0, 10);
    return getLocalDateString(d);
  } catch {
    return dateStr.slice(0, 10);
  }
};

// 화면 표시용 한국식 날짜 포맷 (예: 2026. 10. 16. - 타임존 왜곡 원천 차단)
const formatDisplayDate = (dateStr: string): string => {
  const ymd = formatLogDate(dateStr);
  if (!ymd) return '';
  const parts = ymd.split('-');
  if (parts.length < 3) return ymd;
  return `${parts[0]}. ${Number(parts[1])}. ${Number(parts[2])}.`;
};

// 코인은 소수점 8자리, 주식은 4자리 정밀 표시
const formatQuantity = (n: number, isCrypto: boolean = false) => {
  if (Number.isInteger(n)) return String(n);
  const maxDigits = isCrypto ? 8 : 4;
  return n.toFixed(maxDigits).replace(/0+$/, '').replace(/\.$/, '');
};

// 자산군 시각화 10색 시그니처 팔레트
const PALETTE_COLORS = [
  '#F18F01', // Buong Orange
  '#10B981', // Fintech Emerald
  '#D97706', // Deep Amber
  '#6366F1', // Indigo
  '#8B5CF6', // Violet
  '#06B6D4', // Cyan
  '#EC4899', // Pink
  '#F43F5E', // Crimson
  '#64748B', // Slate
];

const newAccount = (name = '새 계좌 1'): JournalAccount => ({
  id: uid(),
  name,
  fractional: false,
  noSell: true,
  cash: 0,
  groups: [],
});

// jusik.app 10색 시그니처 & M3 글래스모피즘 표준 토큰
const cardCls =
  'glass-card bg-[var(--card-surface)] backdrop-blur-md border border-[var(--border-color)] rounded-2xl sm:rounded-3xl shadow-xs transition-all duration-300';
const inputCls =
  'w-full bg-[var(--bg-main)]/80 border border-[var(--border-color)]/80 rounded-xl px-3.5 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-orange)]/70 focus:shadow-[0_0_12px_rgba(241,143,1,0.12)] transition-all';

// 애플 HIG + M3 캡슐(Pill) 버튼 토큰
const btnPrimaryPillCls =
  'inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-[var(--accent-orange)] text-white hover:brightness-105 hover:shadow-[0_0_18px_rgba(241,143,1,0.25)] active:scale-98 transition-all cursor-pointer border-0';
const btnSecondaryPillCls =
  'inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold border border-[var(--border-color)]/90 bg-[var(--card-surface)]/90 text-[var(--text-primary)] hover:border-[var(--accent-orange)] hover:shadow-[0_0_18px_rgba(241,143,1,0.22)] active:scale-98 transition-all cursor-pointer';

function Toggle({
  on,
  onChange,
  label,
  hint,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      className="flex items-start gap-3 text-left w-full group cursor-pointer"
      aria-pressed={on}
    >
      <span
        className={`mt-0.5 relative w-9 h-5 rounded-full shrink-0 transition-colors ${
          on ? 'bg-[var(--accent-orange)]' : 'bg-[var(--border-color)]'
        }`}
        style={{ transitionDuration: '0.38s', transitionTimingFunction: 'cubic-bezier(0.2, 0.8, 0.2, 1)' }}
      >
        <span
          className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-xs"
          style={{
            transform: on ? 'translateX(16px)' : 'translateX(0)',
            transition: 'transform 0.38s cubic-bezier(0.2, 0.8, 0.2, 1)',
          }}
        />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-bold text-[var(--text-primary)]">{label}</span>
        <span className="block text-xs text-[var(--text-secondary)]">{hint}</span>
      </span>
    </button>
  );
}

// 계좌 구성 한눈에 보는 가로 비례 바 차트 (게이지 채움 애니메이션 & 실시간 호버 피드백 적용)
function PortfolioSegmentedBar({
  segments,
}: {
  segments: { label: string; pct: number; color: string; amountKrw?: number }[];
}) {
  const [animated, setAnimated] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const validSegments = segments.filter(
    (s) => s.pct > 0 || (s.amountKrw !== undefined && s.amountKrw > 0)
  );

  useEffect(() => {
    setAnimated(false);
    const timer = setTimeout(() => setAnimated(true), 60);
    return () => clearTimeout(timer);
  }, [segments]);

  if (validSegments.length === 0) return null;

  const activeSegment = hoveredIdx !== null ? validSegments[hoveredIdx] : null;

  return (
    <div className="space-y-2.5 pt-1">
      {/* 호버 시 실시간 자산 정보 배너 & 가이드 (높이 20px 고정으로 CLS 원천 방지) */}
      <div className="h-5 flex items-center justify-between text-xs px-1 select-none">
        {activeSegment ? (
          <div className="flex items-center gap-2 animate-fadeIn">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs ring-2 ring-white/20"
              style={{ backgroundColor: activeSegment.color }}
            />
            <span className="font-extrabold text-[var(--text-primary)]">
              {activeSegment.label}
            </span>
            <span
              className="font-bold font-mono transition-colors"
              style={{ color: activeSegment.color }}
            >
              {activeSegment.pct.toFixed(1)}%
            </span>
            {activeSegment.amountKrw !== undefined && activeSegment.amountKrw > 0 && (
              <span className="text-[var(--text-secondary)] font-mono text-[11px]">
                ({won(activeSegment.amountKrw)})
              </span>
            )}
          </div>
        ) : null}
      </div>

      {/* 가로 누적 캡슐 바 (0%에서 부드럽게 채워지는 애니메이션 & 호버 시 비호버 세그먼트 소프트 페이드) */}
      <div
        className="h-4 sm:h-5 w-full rounded-full overflow-hidden flex bg-[var(--bg-main)] p-0.5 border border-[var(--border-color)]/70 shadow-2xs"
        onMouseLeave={() => setHoveredIdx(null)}
      >
        {validSegments.map((s, idx) => {
          const isHovered = hoveredIdx === idx;
          const isOtherHovered = hoveredIdx !== null && !isHovered;

          return (
            <div
              key={idx}
              onMouseEnter={() => setHoveredIdx(idx)}
              style={{
                width: animated ? `${Math.min(100, Math.max(0, s.pct))}%` : '0%',
                minWidth: animated && (s.pct > 0 || (s.amountKrw && s.amountKrw > 0)) ? '4px' : '0px',
                backgroundColor: s.color,
                transition: 'width 0.75s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.2s ease, filter 0.2s ease',
                opacity: isOtherHovered ? 0.35 : 1,
                filter: isHovered
                  ? `brightness(1.15) drop-shadow(0 0 6px ${s.color}80)`
                  : 'none',
              }}
              className="h-full first:rounded-l-full last:rounded-r-full relative cursor-pointer"
              title={`${s.label}: ${s.pct.toFixed(1)}%${s.amountKrw ? ` (${won(s.amountKrw)})` : ''}`}
            />
          );
        })}
      </div>

      {/* 범례 캡슐 칩 목록 (호버 시 해당 칩도 연동 하이라이트) */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs font-mono">
        {validSegments.map((s, idx) => {
          const isHovered = hoveredIdx === idx;
          return (
            <div
              key={idx}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              style={{
                borderColor: isHovered ? s.color : undefined,
                backgroundColor: isHovered ? `${s.color}15` : undefined,
                boxShadow: isHovered ? `0 0 12px ${s.color}35` : undefined,
              }}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] transition-all cursor-pointer shadow-2xs ${
                isHovered
                  ? 'border'
                  : 'bg-[var(--bg-main)]/60 border border-[var(--border-color)]/60 hover:border-[var(--accent-orange)]/40'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0 shadow-2xs"
                style={{ backgroundColor: s.color }}
              />
              <span
                className={`font-medium transition-colors ${
                  isHovered ? 'text-[var(--text-primary)] font-bold' : 'text-[var(--text-secondary)]'
                }`}
              >
                {s.label}
              </span>
              <span
                className={`font-extrabold font-mono transition-colors ${
                  !isHovered ? 'text-[var(--text-primary)]' : ''
                }`}
                style={{ color: isHovered ? s.color : undefined }}
              >
                {s.pct.toFixed(1)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface MonthlyTradeStat {
  monthStr: string;
  buyAmount: number;
  sellAmount: number;
  realizedProfit: number;
  tradeCount: number;
}

interface MonthlyDepositStat {
  monthStr: string;
  inAmount: number;
  outAmount: number;
  netAmount: number;
}

interface AssetTrendPoint {
  dateKey?: string;
  monthStr: string;
  investedKrw: number;
  totalAssetsKrw: number;
  profitKrw: number;
  profitRate: number;
}

// 시뮬레이터 규격 프리미엄 Glassmorphic PRO 미니 팝오버 컴포넌트
function ProMiniPopover({
  title,
  description,
  ctaText = '멤버십 플랜 알아보기',
  align = 'left',
  placement = 'bottom',
  isClosing = false,
  onClose,
  onAction,
}: {
  title: string;
  description: string;
  ctaText?: string;
  align?: 'left' | 'right' | 'center';
  placement?: 'top' | 'bottom';
  isClosing?: boolean;
  onClose: () => void;
  onAction?: () => void;
}) {
  const { openCompareModal } = useAuth();
  const finalCta = ctaText || '멤버십 플랜 알아보기';

  const posClass = placement === 'top' ? 'bottom-full mb-2.5' : 'top-full mt-2.5';
  const alignClass =
    align === 'right'
      ? placement === 'top'
        ? 'right-0 origin-bottom-right'
        : 'right-0 origin-top-right'
      : align === 'center'
      ? placement === 'top'
        ? 'left-1/2 -translate-x-1/2 origin-bottom'
        : 'left-1/2 -translate-x-1/2 origin-top'
      : placement === 'top'
      ? 'left-0 origin-bottom-left'
      : 'left-0 origin-top-left';

  const isUp = placement === 'top';
  const animClass =
    align === 'left'
      ? isClosing
        ? isUp ? 'animate-popover-shrink-up-left' : 'animate-popover-shrink-left'
        : isUp ? 'animate-popover-expand-up-left' : 'animate-popover-expand-left'
      : align === 'right'
      ? isClosing
        ? isUp ? 'animate-popover-shrink-up-right' : 'animate-popover-shrink-right'
        : isUp ? 'animate-popover-expand-up-right' : 'animate-popover-expand-right'
      : isClosing
      ? isUp ? 'animate-popover-shrink-up-center' : 'animate-popover-shrink-center'
      : isUp ? 'animate-popover-expand-up-center' : 'animate-popover-expand-center';

  return (
    <div
      data-pro-popover
      onClick={(e) => e.stopPropagation()}
      className={`absolute ${posClass} z-50 w-72 sm:w-80 max-w-[calc(100vw-32px)] p-4 rounded-2xl bg-white/95 dark:bg-[#18181b]/95 backdrop-blur-xl border border-[var(--accent-orange)]/40 shadow-[0_0_24px_rgba(241,143,1,0.18)] space-y-3 text-left font-sans select-text whitespace-normal ${animClass} ${alignClass}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[var(--accent-orange)] font-extrabold text-xs">
          <Crown className="w-4 h-4" />
          <span>{title}</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1 rounded-full hover:bg-[var(--card-hover)] transition-all cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-medium">
        {description}
      </p>

      <button
        type="button"
        onClick={() => {
          onClose();
          if (onAction) {
            onAction();
          } else {
            openCompareModal();
          }
        }}
        className="w-full py-2.5 rounded-full bg-[var(--accent-orange)] border border-[rgba(241,143,1,0.5)] hover:brightness-110 hover:shadow-[0_0_16px_rgba(241,143,1,0.3)] text-white font-extrabold text-xs transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
      >
        <Crown className="w-3.5 h-3.5" />
        {finalCta}
      </button>
    </div>
  );
}

// 적응형 투자 원금 vs 총 자산 추이 SVG 차트 컴포넌트 (30일 이내: 일별, 1년 이내: 주별, 1년 초과: 월별 자동 분기)
function AdaptiveAssetTrendChart({
  summary,
  monthlyTradeStats,
  monthlyDepositStats,
  logs = [],
  accounts = [],
  isPro = false,
  onOpenProModal,
}: {
  summary: PortfolioSummary;
  monthlyTradeStats: MonthlyTradeStat[];
  monthlyDepositStats: MonthlyDepositStat[];
  logs?: JournalLog[];
  accounts?: JournalAccount[];
  isPro?: boolean;
  onOpenProModal?: () => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const hasMovedRef = useRef(false);

  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [dragStartIdx, setDragStartIdx] = useState<number | null>(null);
  const [dragCurrentIdx, setDragCurrentIdx] = useState<number | null>(null);
  const [selectedRange, setSelectedRange] = useState<{ start: number; end: number } | null>(null);
  const [chartSpan, setChartSpan] = useState<'1M' | 'ALL'>(() => (isPro ? 'ALL' : '1M'));
  const [isDragging, setIsDragging] = useState(false);
  const [candlesMap, setCandlesMap] = useState<Record<string, Array<{ date: string; priceKrw: number }>>>({});
  const [animKey, setAnimKey] = useState<number>(() => Date.now());

  const { openCompareModal } = useAuth();
  const [trendPopoverTarget, setTrendPopoverTarget] = useState<'span' | '1y' | 'total' | null>(null);
  const [isTrendPopoverClosing, setIsTrendPopoverClosing] = useState(false);
  const trendTimerRef = useRef<NodeJS.Timeout | null>(null);

  const closeTrendPopover = useCallback(() => {
    if (!trendPopoverTarget || isTrendPopoverClosing) return;
    setIsTrendPopoverClosing(true);
    if (trendTimerRef.current) clearTimeout(trendTimerRef.current);
    trendTimerRef.current = setTimeout(() => {
      setTrendPopoverTarget(null);
      setIsTrendPopoverClosing(false);
    }, 220);
  }, [trendPopoverTarget, isTrendPopoverClosing]);

  const openTrendPopover = useCallback((t: 'span' | '1y' | 'total') => {
    if (trendTimerRef.current) clearTimeout(trendTimerRef.current);
    setIsTrendPopoverClosing(false);
    setTrendPopoverTarget((prev) => (prev === t ? null : t));
  }, []);

  useEffect(() => {
    if (!trendPopoverTarget || isTrendPopoverClosing) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-pro-popover]') && !target.closest('[data-pro-trigger]')) {
        closeTrendPopover();
      }
    };
    document.addEventListener('pointerdown', handleClickOutside);
    return () => document.removeEventListener('pointerdown', handleClickOutside);
  }, [trendPopoverTarget, isTrendPopoverClosing, closeTrendPopover]);

  // 계좌 목록의 고유 ID 문자열 (부모 컴포넌트의 리렌더링으로 인한 새 배열 인스턴스 생성 시 불필요한 차트 리드로잉 원천 방지)
  const accountIdsKey = useMemo(() => accounts.map((a) => a.id).join(','), [accounts]);

  // 마운트 및 모드/계좌/데이터/기간 변경 시마다 애플 모션 드로잉 재실행 보장
  useEffect(() => {
    setAnimKey(Date.now());
  }, [accountIdsKey, logs.length, chartSpan]);

  // 계좌 및 거래 기록에 포함된 실제 종목 심볼 목록 추출
  const holdingSymbols = useMemo(() => {
    const symSet = new Set<string>();
    accounts.forEach((acc) => {
      (acc.groups || []).forEach((grp) => {
        Object.entries(grp.holdings || {}).forEach(([s, q]) => {
          if (q > 0) symSet.add(normalizeSymbol(s));
        });
      });
    });
    logs.forEach((l) => {
      (l.items || []).forEach((it) => symSet.add(normalizeSymbol(it.symbol)));
    });
    return Array.from(symSet);
  }, [accounts, logs]);

  // 기간 분석 및 적응형 주기 결정 (1개월 모드는 항상 일별, 전체 기간은 3개월 이하 일별, 2년 이하 주별, 2년 초과 월별)
  const mode: 'daily' | 'weekly' | 'monthly' = useMemo(() => {
    if (chartSpan === '1M') return 'daily';

    const now = new Date();
    const todayStr = getLocalDateString(now);
    const allDates: string[] = [];
    logs.forEach((l) => allDates.push(formatLogDate(l.date)));
    accounts.forEach((acc) => {
      (acc.deposits || []).forEach((d) => allDates.push(formatLogDate(d.date)));
    });
    allDates.push(todayStr);
    allDates.sort((a, b) => a.localeCompare(b));
    const earliest = allDates[0] || todayStr;
    const daySpan = Math.max(1, Math.round((now.getTime() - new Date(earliest).getTime()) / (1000 * 60 * 60 * 24)));
    if (daySpan <= 90) return 'daily';
    if (daySpan <= 730) return 'weekly';
    return 'monthly';
  }, [logs, accounts, chartSpan]);

  // 종목별 실제 거래소 캔들 시계열 데이터 경량 조회 (더미 0%, 하드코딩 0%)
  useEffect(() => {
    if (holdingSymbols.length === 0) return;
    const timeframe = mode === 'monthly' ? 'month' : mode === 'weekly' ? 'week' : 'day';
    let cancelled = false;

    fetch(`/api/quotes/candles?symbols=${encodeURIComponent(holdingSymbols.join(','))}&timeframe=${timeframe}`)
      .then((res) => res.json())
      .then((json) => {
        if (!cancelled && json.success && json.candles) {
          setCandlesMap(json.candles);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [holdingSymbols, mode]);

  // 차트 외부 클릭 시 선택 구간 해제
  useEffect(() => {
    if (!selectedRange) return;
    const handleOutsideClick = (e: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setSelectedRange(null);
      }
    };
    document.addEventListener('pointerdown', handleOutsideClick);
    return () => document.removeEventListener('pointerdown', handleOutsideClick);
  }, [selectedRange]);

  // 1. 기간 분석 및 적응형 타임라인 생성
  const { points, evaluateAtDateKey, currentInvested, currentTotalAssets } = useMemo(() => {
    const now = new Date();
    const todayStr = getLocalDateString(now);

    const allDeposits: CashDepositLog[] = accounts
      .flatMap((a) => a.deposits || [])
      .sort((a, b) => a.date.localeCompare(b.date));

    const hasLogs = logs.length > 0;
    const hasDeposits = allDeposits.length > 0;
    const hasAnyHistory = hasLogs || hasDeposits;

    const allDates: string[] = [];
    logs.forEach((l) => allDates.push(formatLogDate(l.date)));
    allDeposits.forEach((d) => allDates.push(formatLogDate(d.date)));
    allDates.push(todayStr);

    allDates.sort((a, b) => a.localeCompare(b));
    let earliestDateStr = allDates[0] || todayStr;

    // 1개월 모드일 때는 최근 30일간의 일별 포인트로 촘촘하고 부드러운 스플라인 곡선 제공
    if (chartSpan === '1M') {
      const oneMonthAgo = new Date(now);
      oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);
      earliestDateStr = getLocalDateString(oneMonthAgo);
    } else if (!hasAnyHistory) {
      // 거래 기록/입출금/스냅샷이 전혀 없는 초기 상태라면 최근 1년 전부터의 월봉을 생성하여 시세 흐름 제공
      const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), 1);
      earliestDateStr = getLocalDateString(oneYearAgo);
    }

    const earliestTime = new Date(earliestDateStr).getTime();
    const nowTime = now.getTime();
    const daySpan = Math.max(1, Math.round((nowTime - earliestTime) / (1000 * 60 * 60 * 24)));

    const timeKeys: { key: string; label: string }[] = [];

    if (mode === 'daily') {
      const cur = new Date(earliestTime);
      while (cur <= now) {
        const dStr = getLocalDateString(cur);
        const label = `${cur.getMonth() + 1}.${String(cur.getDate()).padStart(2, '0')}`;
        timeKeys.push({ key: dStr, label });
        cur.setDate(cur.getDate() + 1);
      }
      if (timeKeys[timeKeys.length - 1]?.key !== todayStr) {
        timeKeys.push({
          key: todayStr,
          label: `${now.getMonth() + 1}.${String(now.getDate()).padStart(2, '0')}`,
        });
      }
    } else if (mode === 'weekly') {
      const cur = new Date(earliestTime);
      const day = cur.getDay();
      const diff = cur.getDate() - day + (day === 0 ? -6 : 1);
      cur.setDate(diff);

      while (cur <= now) {
        const dStr = getLocalDateString(cur);
        const label = `${cur.getMonth() + 1}.${String(cur.getDate()).padStart(2, '0')}`;
        timeKeys.push({ key: dStr, label });
        cur.setDate(cur.getDate() + 7);
      }
      if (timeKeys[timeKeys.length - 1]?.key !== todayStr) {
        timeKeys.push({
          key: todayStr,
          label: `${now.getMonth() + 1}.${String(now.getDate()).padStart(2, '0')}`,
        });
      }
    } else {
      // 1년 초과: 시작 연월부터 오늘 연월까지 매월 1달 단위로 연속 타임라인 생성
      const startParts = earliestDateStr.slice(0, 7).split('-');
      let curYear = parseInt(startParts[0], 10);
      let curMonth = parseInt(startParts[1], 10);

      const endYear = now.getFullYear();
      const endMonth = now.getMonth() + 1;

      const totalMonthDiff = (endYear - curYear) * 12 + (endMonth - curMonth);
      if (!hasAnyHistory && totalMonthDiff < 3) {
        const adjustedStart = new Date(endYear, endMonth - 4, 1);
        curYear = adjustedStart.getFullYear();
        curMonth = adjustedStart.getMonth() + 1;
      }

      while (curYear < endYear || (curYear === endYear && curMonth <= endMonth)) {
        const mKey = `${curYear}-${String(curMonth).padStart(2, '0')}`;
        timeKeys.push({
          key: mKey,
          label: `${curYear}.${String(curMonth).padStart(2, '0')}`,
        });
        curMonth++;
        if (curMonth > 12) {
          curMonth = 1;
          curYear++;
        }
      }
    }

    // 2. 단일 일관 회계 기준 & 거래소 실제 캔들 시세 매핑
    const currentTotalAssets = summary.totalAssetsKrw;
    const baseInvest = summary.hasInvestData ? summary.totalInvestKrw : summary.totalStockEvalKrw;
    const currentInvested = baseInvest + summary.cashKrw;

    // 현재 각 종목별 실시간 평가액 맵 (현재 시세 기준 100% 실측치)
    const currentEvalMap: Record<string, number> = {};
    (summary.items || []).forEach((it) => {
      currentEvalMap[it.symbol] = (currentEvalMap[it.symbol] || 0) + it.evalKrw;
    });

    // 종목별 과거 시점 실제 거래소 종가 반환 (더미 0%, 하드코딩 0%, 거래소 실측치 100%)
    const getHistoricalPrice = (symbol: string, targetKey: string): number | null => {
      const normSym = normalizeSymbol(symbol);
      const symCandles = candlesMap[normSym] || candlesMap[symbol];
      if (!symCandles || symCandles.length === 0) return null;

      // targetKey (YYYY-MM-DD 또는 YYYY-MM) 이하의 가장 최근 실제 거래소 종가 탐색
      for (let i = symCandles.length - 1; i >= 0; i--) {
        if (symCandles[i].date <= targetKey) {
          return symCandles[i].priceKrw;
        }
      }
      return symCandles[0].priceKrw;
    };

    // 현재 계좌들에 보유 중인 종목들 (수량 > 0)
    const currentHoldings: Array<{ symbol: string; qty: number; currentEvalKrw: number }> = [];
    accounts.forEach((acc) => {
      (acc.groups || []).forEach((grp) => {
        Object.entries(grp.holdings || {}).forEach(([sym, qty]) => {
          if (qty > 0) {
            const evalAmount = currentEvalMap[sym] || Math.round(qty * (grp.avgPrices?.[sym] || 0));
            currentHoldings.push({
              symbol: sym,
              qty,
              currentEvalKrw: evalAmount,
            });
          }
        });
      });
    });

    const sortedLogs = [...logs].sort((a, b) => a.date.localeCompare(b.date));

    // 전체 기간 동안의 총 순입출금액
    const totalNetDeposits = allDeposits.reduce(
      (acc, d) => acc + (d.type === 'IN' ? d.amountKrw : -d.amountKrw),
      0
    );

    // 전체 기간 동안의 총 거래 현금 흐름 (판매 대금 유입 - 구매 대금 지출, 예수금 미반영 과거 기록 제외)
    const totalTradeCashFlow = sortedLogs.reduce((acc, l) => {
      if (l.cashNeutral) return acc;
      let flow = 0;
      (l.items || []).forEach((it) => {
        flow += it.qty < 0 ? Math.abs(it.amountKrw) : -Math.abs(it.amountKrw);
      });
      return acc + flow;
    }, 0);

    // 기초 보유분: 현재 보유 수량 중 매매 기록으로 설명되지 않는 수량 (기록 이전부터 보유 · 직접 입력분)
    const netLogQtyMap: Record<string, number> = {};
    sortedLogs.forEach((l) => {
      (l.items || []).forEach((it) => {
        netLogQtyMap[it.symbol] = (netLogQtyMap[it.symbol] || 0) + it.qty;
      });
    });
    const currentQtyMap: Record<string, { qty: number; avgKrw: number }> = {};
    accounts.forEach((acc) => {
      (acc.groups || []).forEach((grp) => {
        Object.entries(grp.holdings || {}).forEach(([sym, qty]) => {
          if (qty > 0) {
            const prev = currentQtyMap[sym];
            currentQtyMap[sym] = {
              qty: (prev?.qty || 0) + qty,
              avgKrw: grp.avgPrices?.[sym] || prev?.avgKrw || 0,
            };
          }
        });
      });
    });
    const baseHoldings: Array<{ symbol: string; qty: number; costKrw: number }> = [];
    Object.entries(currentQtyMap).forEach(([sym, cur]) => {
      const baseQty = cur.qty - (netLogQtyMap[sym] || 0);
      if (baseQty > 1e-8) {
        const curItem = (summary.items || []).find((it) => it.symbol === sym);
        const unit = cur.avgKrw || (curItem && curItem.qty > 0 ? curItem.evalKrw / curItem.qty : 0);
        baseHoldings.push({ symbol: sym, qty: baseQty, costKrw: Math.round(baseQty * unit) });
      }
    });
    const baseCostKrw = baseHoldings.reduce((s, b) => s + b.costKrw, 0);

    // 기초 현금 (입출금 및 거래 내역으로 역산되지 않는 초기 기초 잔액)
    const seedCash = Math.max(0, summary.cashKrw - (totalNetDeposits + totalTradeCashFlow));

    // 전체 거래 기록의 매수/매도 합계
    let allLogsBuySum = 0;
    let allLogsSellSum = 0;
    sortedLogs.forEach((l) => {
      (l.items || []).forEach((it) => {
        if (it.qty > 0) {
          allLogsBuySum += it.amountKrw;
        } else {
          allLogsSellSum += Math.abs(it.amountKrw);
        }
      });
    });

    // 모든 입출금과 매매가 완료된 시점의 장부 원금 (미보정 종점 원금)
    const baseEndingInvested = allDeposits.length > 0
      ? Math.max(0, seedCash + totalNetDeposits + baseCostKrw)
      : sortedLogs.length > 0
      ? Math.max(0, Math.max(0, allLogsBuySum - allLogsSellSum) + baseCostKrw + summary.cashKrw)
      : currentInvested;

    // 사용자가 종목 카드의 평단가를 직접 수정했거나 실현 손익으로 인해 발생한 실질 원본 자본의 보정값
    // (평단가 수정 등이 과거 장부 계산에는 즉시 들어가지 못해 생기는 갭을 전체 타임라인에 균일 적용하여 자정 점프 원천 방지)
    const capitalAdjustment = currentInvested - baseEndingInvested;

    // 계좌의 첫 번째 활동 시작일 (첫 거래일 또는 첫 입출금일 중 빠른 일자)
    const firstLogDate = sortedLogs[0]?.date ? formatLogDate(sortedLogs[0].date) : null;
    const firstDepositDate = allDeposits[0]?.date ? formatLogDate(allDeposits[0].date) : null;
    let firstActivityDate: string | null = null;
    if (firstLogDate && firstDepositDate) {
      firstActivityDate = firstLogDate < firstDepositDate ? firstLogDate : firstDepositDate;
    } else {
      firstActivityDate = firstLogDate || firstDepositDate;
    }

    const evaluateAtDateKey = (targetKey: string): { totalAssetsKrw: number; investedKrw: number } => {
      if (firstActivityDate && targetKey < firstActivityDate.slice(0, targetKey.length)) {
        return { totalAssetsKrw: 0, investedKrw: 0 };
      }

      // 해당 시점까지의 매매 기록 필터링
      const logsUpToThis = sortedLogs.filter((l) => formatLogDate(l.date).slice(0, targetKey.length) <= targetKey);

      // 해당 시점까지의 입출금 기록 필터링
      const depositsUpToThis = allDeposits.filter((d) => formatLogDate(d.date).slice(0, targetKey.length) <= targetKey);
      const netDepositAtPoint = depositsUpToThis.reduce(
        (acc, d) => acc + (d.type === 'IN' ? d.amountKrw : -d.amountKrw),
        0
      );

      // 종목별 누적 보유 수량 및 매수/매도 금액 집계 (기록 이전부터 보유한 기초 보유분 포함)
      const tradeHoldingMap: Record<string, { qty: number; buyAmountKrw: number }> = {};
      baseHoldings.forEach((b) => {
        tradeHoldingMap[b.symbol] = { qty: b.qty, buyAmountKrw: b.costKrw };
      });
      let totalBuySum = 0;
      let totalSellSum = 0;
      let cashFlowBuySum = 0;
      let cashFlowSellSum = 0;

      logsUpToThis.forEach((l) => {
        (l.items || []).forEach((it) => {
          if (!tradeHoldingMap[it.symbol]) {
            tradeHoldingMap[it.symbol] = { qty: 0, buyAmountKrw: 0 };
          }
          tradeHoldingMap[it.symbol].qty += it.qty;
          if (it.qty > 0) {
            tradeHoldingMap[it.symbol].buyAmountKrw += it.amountKrw;
            totalBuySum += it.amountKrw;
            if (!l.cashNeutral) cashFlowBuySum += it.amountKrw;
          } else {
            totalSellSum += Math.abs(it.amountKrw);
            if (!l.cashNeutral) cashFlowSellSum += Math.abs(it.amountKrw);
          }
        });
      });

      // 해당 시점까지의 거래 현금 흐름 (판매 대금 유입 - 구매 지출, 예수금 미반영 과거 기록 제외)
      const tradeFlowAtPoint = cashFlowSellSum - cashFlowBuySum;

      // 시점별 현금 잔액 (기초 현금 + 순입출금 + 거래 현금 흐름)
      const cashAtPoint = Math.max(0, seedCash + netDepositAtPoint + tradeFlowAtPoint);

      // 시점별 주식 평가액 계산
      let stockEvalAtPoint = 0;
      if (logs.length > 0) {
        const tradeSymbols = Object.entries(tradeHoldingMap).filter(([_, d]) => d.qty > 0);
        if (tradeSymbols.length > 0) {
          tradeSymbols.forEach(([sym, data]) => {
            const realPrice = getHistoricalPrice(sym, targetKey);
            let evalAtPoint = 0;
            if (realPrice !== null && realPrice > 0) {
              evalAtPoint = Math.round(data.qty * realPrice);
            } else {
              const curItem = (summary.items || []).find((it) => it.symbol === sym);
              const curUnitEval =
                curItem && curItem.qty > 0
                  ? curItem.evalKrw / curItem.qty
                  : data.buyAmountKrw / (data.qty || 1);
              evalAtPoint = Math.round(data.qty * curUnitEval);
            }
            stockEvalAtPoint += evalAtPoint;
          });
        }
      } else if (currentHoldings.length > 0) {
        // 기록이 없는 초기 계좌만 현재 보유 종목으로 시세 역산
        currentHoldings.forEach((h) => {
          const realPrice = getHistoricalPrice(h.symbol, targetKey);
          if (realPrice !== null && realPrice > 0) {
            stockEvalAtPoint += Math.round(h.qty * realPrice);
          } else {
            stockEvalAtPoint += h.currentEvalKrw;
          }
        });
      }

      // 시점별 총 자산 = 주식 평가액 + 당시 보유 현금
      const pointAssets = stockEvalAtPoint + cashAtPoint;

      // 시점별 투자 원금 계산 (100% 거래 및 입출금 장부 역산 단일 모델)
      let pointInvested = 0;
      if (allDeposits.length > 0) {
        // 입출금 기록이 있는 경우: 외부 유입 누적 순입금액 + 기초 현금 + 기초 보유분 원가 + 평단가 수정 보정값
        pointInvested = Math.max(0, seedCash + netDepositAtPoint + baseCostKrw + capitalAdjustment);
      } else if (logs.length > 0) {
        // 거래 기록만 있는 경우: 순매수 원금 + 기초 보유분 원가 + 잔여 현금 + 평단가 수정 보정값
        const netInvestedFromTrades = Math.max(0, totalBuySum - totalSellSum);
        pointInvested = Math.max(0, netInvestedFromTrades + baseCostKrw + cashAtPoint + capitalAdjustment);
      } else {
        // 기록이 전혀 없는 초기 사용자
        pointInvested = currentInvested;
      }

      return { totalAssetsKrw: pointAssets, investedKrw: pointInvested };
    };

    const resultPoints: AssetTrendPoint[] = [];

    timeKeys.forEach((tk, idx) => {
      const isLast = idx === timeKeys.length - 1;

      // 마지막 포인트는 항상 현재 실시간 요약치와 100% 무결점 일치
      if (isLast) {
        const finalInvested = currentInvested;
        const finalAssets = currentTotalAssets;
        const profit = finalAssets - finalInvested;
        const pRate = finalInvested > 0 ? (profit / finalInvested) * 100 : 0;
        resultPoints.push({
          dateKey: tk.key,
          monthStr: tk.label,
          investedKrw: finalInvested,
          totalAssetsKrw: finalAssets,
          profitKrw: profit,
          profitRate: pRate,
        });
        return;
      }

      const { totalAssetsKrw: pointAssets, investedKrw: pointInvested } = evaluateAtDateKey(tk.key);
      const profit = pointAssets - pointInvested;
      const pRate = pointInvested > 0 ? (profit / pointInvested) * 100 : 0;

      resultPoints.push({
        dateKey: tk.key,
        monthStr: tk.label,
        investedKrw: pointInvested,
        totalAssetsKrw: pointAssets,
        profitKrw: profit,
        profitRate: pRate,
      });
    });

    // 0원인 과거 포인트가 차트 라인 왜곡(수직 절벽)을 일으키지 않도록 유효 포인트만 선별
    const cleanedPoints = resultPoints.filter((p, i) => {
      if (i === resultPoints.length - 1) return true;
      return p.totalAssetsKrw > 0;
    });

    return {
      points: cleanedPoints.length > 0 ? cleanedPoints : resultPoints,
      evaluateAtDateKey,
      currentInvested,
      currentTotalAssets,
    };
  }, [summary, logs, accounts, candlesMap, mode, chartSpan]);

  const activeIndex = hoverIdx !== null ? hoverIdx : points.length - 1;
  const activePoint = points[activeIndex] || points[points.length - 1];

  const width = 800;
  const height = 240;
  const padding = { top: 24, right: 14, bottom: 24, left: 14 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  // 차트에 그려지는 유효 포인트들(총자산 및 원금)의 동적 최솟값/최댓값 계산 (0원 고정 탈피)
  const allValues = points.flatMap((p) => [p.totalAssetsKrw, p.investedKrw]).filter((v) => v > 0);
  const rawMin = allValues.length > 0 ? Math.min(...allValues) : 0;
  const rawMax = allValues.length > 0 ? Math.max(...allValues) : 100000;
  const diff = rawMax - rawMin;

  // 변동폭의 약 12%를 상하 여백으로 주어 자산 변화 흐름이 생생하게 보이도록 동적 스케일링
  const pad = diff > 0 ? diff * 0.12 : rawMax * 0.1;
  const minVal = Math.max(0, Math.floor((rawMin - pad) / 10000) * 10000);
  const maxVal = Math.max(minVal + 10000, Math.ceil((rawMax + pad) / 10000) * 10000);
  const yRange = Math.max(maxVal - minVal, 10000);

  const getX = (idx: number) => {
    if (points.length <= 1) return padding.left + chartW / 2;
    return padding.left + (idx / (points.length - 1)) * chartW;
  };

  const getY = (val: number) => {
    return padding.top + chartH - ((val - minVal) / (yRange || 1)) * chartH;
  };

  // W3C 표준 SVG 행렬 변환 (ScreenCTM Inverse)을 적용하여 뷰포트/레터박스 오차 없는 0px 정밀 화면 좌표 변환
  const getSvgX = (e: React.MouseEvent<SVGSVGElement> | React.TouchEvent<SVGSVGElement>) => {
    const svg = svgRef.current || (e.currentTarget as SVGSVGElement);
    if (!svg) return 0;

    const clientX =
      'touches' in e
        ? e.touches[0]?.clientX ?? (e as unknown as React.TouchEvent<SVGSVGElement>).changedTouches?.[0]?.clientX ?? 0
        : e.clientX;
    const clientY =
      'touches' in e
        ? e.touches[0]?.clientY ?? (e as unknown as React.TouchEvent<SVGSVGElement>).changedTouches?.[0]?.clientY ?? 0
        : e.clientY;

    if (svg.getScreenCTM) {
      const ctm = svg.getScreenCTM();
      if (ctm) {
        const pt = svg.createSVGPoint();
        pt.x = clientX;
        pt.y = clientY;
        const svgPt = pt.matrixTransform(ctm.inverse());
        return svgPt.x;
      }
    }

    const rect = svg.getBoundingClientRect();
    return ((clientX - rect.left) / rect.width) * width;
  };

  // 0px 정밀 스냅 역산 공식 (물리적 마우스 커서 위치와 차트 데이터 포인트를 1:1 완벽 정렬)
  const getIndexFromX = (svgX: number) => {
    if (points.length <= 1) return 0;
    const clampedX = Math.max(padding.left, Math.min(width - padding.right, svgX));
    const ratio = (clampedX - padding.left) / chartW;
    return Math.max(0, Math.min(points.length - 1, Math.round(ratio * (points.length - 1))));
  };

  const handlePointerDown = (e: React.MouseEvent<SVGSVGElement> | React.TouchEvent<SVGSVGElement>) => {
    const idx = getIndexFromX(getSvgX(e));
    setIsDragging(true);
    hasMovedRef.current = false;
    setDragStartIdx(idx);
    setDragCurrentIdx(idx);
  };

  const handlePointerMove = (e: React.MouseEvent<SVGSVGElement> | React.TouchEvent<SVGSVGElement>) => {
    const idx = getIndexFromX(getSvgX(e));
    setHoverIdx(idx);
    if (isDragging) {
      if (idx !== dragStartIdx) {
        hasMovedRef.current = true;
      }
      setDragCurrentIdx(idx);
    }
  };

  const handlePointerUp = () => {
    if (isDragging) {
      setIsDragging(false);
      // 단순 클릭(이동 없음 또는 같은 지점) 시 선택 구간 해제
      if (!hasMovedRef.current || dragStartIdx === dragCurrentIdx) {
        setSelectedRange(null);
      } else if (dragStartIdx !== null && dragCurrentIdx !== null) {
        setSelectedRange({
          start: Math.min(dragStartIdx, dragCurrentIdx),
          end: Math.max(dragStartIdx, dragCurrentIdx),
        });
      }
      setDragStartIdx(null);
      setDragCurrentIdx(null);
    }
  };

  // 4대 핵심 기간(이번 달 MTD, 올해 YTD, 최근 1년 1Y, 누적 전체 Total)의 실질 순자산 증감 및 실질 수익률 정밀 산출
  // (차트 스팬이나 0원 필터링에 영향받지 않고, 각 기준일의 장부 원금·평가액을 독립 평가하여 입출금 이중 차감 원천 차단)
  const performanceCards = useMemo(() => {
    const now = new Date();

    // 기준일 정의
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfMonthStr = getLocalDateString(startOfMonth);

    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const startOfYearStr = getLocalDateString(startOfYear);

    const oneYearAgo = new Date(now);
    oneYearAgo.setDate(oneYearAgo.getDate() - 365);
    const oneYearAgoStr = getLocalDateString(oneYearAgo);

    const calcForPeriod = (startDateStr: string | null) => {
      const startState = startDateStr
        ? evaluateAtDateKey(startDateStr)
        : { totalAssetsKrw: 0, investedKrw: 0 };

      const startAssets = startState.totalAssetsKrw;
      const startInvested = startState.investedKrw;

      // 기간 내 순유입 원금 = 현재 총 원금 - 시작 시점 총 원금 (입출금 이중 차감 원천 방지)
      const netNewCapital = currentInvested - startInvested;

      // 실질 순자산 증감(순이익) = 현재 누적 손익 - 시작 시점 누적 손익 = (현재 자산 - 시작 자산) - 기간 내 순유입 원금
      const diffKrw = (currentTotalAssets - currentInvested) - (startAssets - startInvested);

      // 기준 원본 = 시작 순자산 + 기간 내 순유입 원금(양수일 때)
      const baseCapital = Math.max(0, startAssets + Math.max(0, netNewCapital));
      const returnRate = baseCapital > 0 ? (diffKrw / baseCapital) * 100 : 0;

      return { diffKrw, returnRate };
    };

    const mtd = calcForPeriod(startOfMonthStr);
    const ytd = calcForPeriod(startOfYearStr);
    const oneYear = calcForPeriod(oneYearAgoStr);
    const total = calcForPeriod(null);

    return [
      {
        id: 'mtd',
        title: '이번 달',
        period: `${now.getMonth() + 1}월 1일 ~ 오늘`,
        diffKrw: mtd.diffKrw,
        returnRate: mtd.returnRate,
        isPro: false,
      },
      {
        id: 'ytd',
        title: '올해 (YTD)',
        period: `${now.getFullYear()}년 1월 1일 ~ 오늘`,
        diffKrw: ytd.diffKrw,
        returnRate: ytd.returnRate,
        isPro: false,
      },
      {
        id: '1y',
        title: '최근 1년',
        period: '최근 365일 실질 성과',
        diffKrw: oneYear.diffKrw,
        returnRate: oneYear.returnRate,
        isPro: true,
      },
      {
        id: 'total',
        title: '전체 누적',
        period: '첫 활동일부터 현재까지',
        diffKrw: total.diffKrw,
        returnRate: total.returnRate,
        isPro: true,
      },
    ];
  }, [evaluateAtDateKey, currentInvested, currentTotalAssets]);

  // 선택된 구간 데이터 및 기간 수익률 계산
  const activeRange =
    isDragging && dragStartIdx !== null && dragCurrentIdx !== null
      ? { start: Math.min(dragStartIdx, dragCurrentIdx), end: Math.max(dragStartIdx, dragCurrentIdx) }
      : selectedRange;

  const rangeStartPoint = activeRange ? points[activeRange.start] : null;
  const rangeEndPoint = activeRange ? points[activeRange.end] : null;

  const rangeAssetDiff =
    rangeStartPoint && rangeEndPoint
      ? rangeEndPoint.totalAssetsKrw - rangeStartPoint.totalAssetsKrw
      : 0;

  const rangeReturnRate =
    rangeStartPoint && rangeEndPoint && rangeStartPoint.totalAssetsKrw > 0
      ? (rangeAssetDiff / rangeStartPoint.totalAssetsKrw) * 100
      : 0;

  // 마지막 유효한 선택 구간 정보 (닫힐 때 내용 즉시 언마운트 방지 및 300ms 접힘 애니메이션 유지)
  const lastValidRangeRef = useRef<{
    startPoint: (typeof points)[number];
    endPoint: (typeof points)[number];
    diff: number;
    returnRate: number;
  } | null>(null);

  if (rangeStartPoint && rangeEndPoint) {
    lastValidRangeRef.current = {
      startPoint: rangeStartPoint,
      endPoint: rangeEndPoint,
      diff: rangeAssetDiff,
      returnRate: rangeReturnRate,
    };
  }

  const displayRange = (rangeStartPoint && rangeEndPoint)
    ? { startPoint: rangeStartPoint, endPoint: rangeEndPoint, diff: rangeAssetDiff, returnRate: rangeReturnRate }
    : lastValidRangeRef.current;

  const assetCoords = points.map((p, idx) => ({ x: getX(idx), y: getY(p.totalAssetsKrw) }));
  const investCoords = points.map((p, idx) => ({ x: getX(idx), y: getY(p.investedKrw) }));

  // 텐션을 최적화한 Catmull-Rom to Cubic Bezier 곡선 패스 생성기 (애플/토스식 프리미엄 유선형 곡선)
  const getSmoothCurvePath = (coords: Array<{ x: number; y: number }>, tension = 0.22) => {
    if (coords.length === 0) return '';
    if (coords.length === 1) return `M ${coords[0].x} ${coords[0].y}`;
    if (coords.length === 2) {
      return `M ${coords[0].x} ${coords[0].y} L ${coords[1].x} ${coords[1].y}`;
    }

    let path = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const p0 = coords[Math.max(0, i - 1)];
      const p1 = coords[i];
      const p2 = coords[i + 1];
      const p3 = coords[Math.min(coords.length - 1, i + 2)];

      const cp1x = p1.x + (p2.x - p0.x) * tension;
      const cp1y = p1.y + (p2.y - p0.y) * tension;
      const cp2x = p2.x - (p3.x - p1.x) * tension;
      const cp2y = p2.y - (p3.y - p1.y) * tension;

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return path;
  };

  const assetLinePath = getSmoothCurvePath(assetCoords, 0.22);
  const investLinePath = getSmoothCurvePath(investCoords, 0.22);

  const assetAreaPath =
    assetCoords.length > 0
      ? `${assetLinePath} L ${assetCoords[assetCoords.length - 1].x} ${padding.top + chartH} L ${assetCoords[0].x} ${padding.top + chartH} Z`
      : '';

  // 차트 Y축 전용 나이스 넘버 눈금 (500만 원, 1,000만 원, 1억 원 등 정갈한 단위)
  const yTicks = getNiceTicks(minVal, maxVal, 3)
    .map((val) => ({
      val,
      label: formatChartWon(val),
    }))
    .filter((t) => {
      const y = getY(t.val);
      return t.val <= maxVal && y >= padding.top + 6 && y <= padding.top + chartH - 6;
    });

  // X축 라벨: 사용자 피드백 반영 ("끝 날짜는 안 하는 게 나을 거 같아. 잘리니까. 날짜 같은 건 중간중간 퐁퐁퐁 넣으면 좋아")
  // 시작점과 끝점(오늘/10.19)은 가장자리 잘림 및 답답함 방지를 위해 완전히 제외하고,
  // 중간 구간(약 25%, 50%, 75% 지점 등 2~3개)에만 안전하게 퐁퐁퐁 배치
  const middleTickIndices = useMemo(() => {
    const len = points.length;
    if (len < 3) return [];
    if (len === 3) return [1];
    if (len <= 5) {
      return [Math.floor(len / 2)];
    }
    const idx1 = Math.max(1, Math.round(len * 0.25));
    const idx2 = Math.round(len * 0.5);
    const idx3 = Math.min(len - 2, Math.round(len * 0.75));
    return Array.from(new Set([idx1, idx2, idx3])).filter((i) => i > 0 && i < len - 1);
  }, [points.length]);

  return (
    <div ref={containerRef} className="p-4 sm:p-5 rounded-2xl bg-[var(--card-surface)]/60 border border-[var(--border-color)]/80 space-y-3.5 shadow-2xs">
      {/* 헤더 & 기간 토글 캡슐(우측 정렬) & 순자산·원금 정보(2행 분리 배치) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 shrink-0">
            <TrendingUp className="w-4 h-4 text-[var(--accent-orange)]" />
            <span className="text-xs font-extrabold text-[var(--text-primary)]">
              자산 추이
            </span>
          </div>

          {/* 기간 토글 캡슐 (우측 정렬) */}
          <div className="relative inline-block">
            {isPro ? (
              <div className="relative inline-grid grid-cols-2 p-0.5 rounded-full bg-[var(--bg-main)]/90 backdrop-blur-md border border-[var(--border-color)]/90 shadow-2xs w-36 sm:w-40 select-none">
                <div
                  className="absolute top-0.5 bottom-0.5 left-0.5 rounded-full bg-[var(--card-surface)] border border-[rgba(241,143,1,0.6)] shadow-[0_0_12px_rgba(241,143,1,0.22)] transition-transform duration-300 pointer-events-none"
                  style={{
                    width: 'calc((100% - 4px) / 2)',
                    transform: `translateX(${chartSpan === '1M' ? '0%' : '100%'})`,
                    transitionTimingFunction: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setChartSpan('1M')}
                  className={`relative z-10 w-full flex items-center justify-center py-1 px-2 rounded-full text-[11px] font-bold transition-colors duration-200 cursor-pointer whitespace-nowrap ${
                    chartSpan === '1M'
                      ? 'text-[var(--accent-orange)] font-extrabold'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  1개월
                </button>
                <button
                  type="button"
                  onClick={() => setChartSpan('ALL')}
                  className={`relative z-10 w-full flex items-center justify-center py-1 px-2 rounded-full text-[11px] font-bold transition-colors duration-200 cursor-pointer whitespace-nowrap ${
                    chartSpan === 'ALL'
                      ? 'text-[var(--accent-orange)] font-extrabold'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  전체 기간
                </button>
              </div>
            ) : (
              <div className="relative inline-grid grid-cols-2 p-0.5 rounded-full bg-[var(--bg-main)]/90 backdrop-blur-md border border-[var(--border-color)]/90 shadow-2xs w-36 sm:w-40 select-none">
                <span className="w-full flex items-center justify-center py-1 px-2 rounded-full bg-[var(--card-surface)] text-[var(--accent-orange)] font-extrabold text-[11px] border border-[rgba(241,143,1,0.6)] shadow-[0_0_12px_rgba(241,143,1,0.22)] whitespace-nowrap">
                  1개월
                </span>
                <button
                  type="button"
                  data-pro-trigger
                  onClick={() => openTrendPopover('span')}
                  className="w-full flex items-center justify-center gap-1 py-1 px-2 rounded-full text-[var(--text-secondary)] hover:text-[var(--accent-orange)] transition-all cursor-pointer text-[11px] font-extrabold whitespace-nowrap"
                >
                  <Lock className="w-3 h-3 text-[var(--accent-orange)] shrink-0" />
                  <span>전체 기간</span>
                </button>
              </div>
            )}

            {trendPopoverTarget === 'span' && (
              <ProMiniPopover
                title="PRO 전용 (전체 기간 자산 추이)"
                description="PRO 멤버십으로 업그레이드하면 첫 자산 등록일부터 지금까지 전체 기간의 누적 자산 성장 곡선과 실질 수익률을 확인할 수 있습니다."
                align="right"
                isClosing={isTrendPopoverClosing}
                onClose={closeTrendPopover}
                onAction={openCompareModal}
              />
            )}
          </div>
        </div>

        {/* 2행: 순자산, 원금, 수익률 정보 (호버 수치가 변해도 레이아웃이 덜컹거리지 않음) */}
        {activePoint && (
          <div className="flex items-center gap-2 sm:gap-3 text-xs font-mono flex-wrap pt-0.5">
            <span className="text-[11px] font-bold text-[var(--text-secondary)] bg-[var(--bg-main)] px-2 py-0.5 rounded-md border border-[var(--border-color)]/60 whitespace-nowrap">
              {activePoint.monthStr}
            </span>
            <div className="flex items-center gap-1 whitespace-nowrap">
              <span className="text-[10px] text-[var(--text-secondary)]">순자산</span>
              <span className="font-extrabold text-[var(--text-primary)]">
                {won(activePoint.totalAssetsKrw)}
              </span>
            </div>
            <div className="flex items-center gap-1 whitespace-nowrap">
              <span className="text-[10px] text-[var(--text-secondary)]">원금</span>
              <span className="font-bold text-[var(--text-secondary)]">
                {won(activePoint.investedKrw)}
              </span>
            </div>
            <span
              className={`font-bold whitespace-nowrap ${
                activePoint.profitKrw >= 0 ? 'text-[#10B981]' : 'text-[#F43F5E]'
              }`}
            >
              ({activePoint.profitKrw >= 0 ? '+' : ''}{activePoint.profitRate.toFixed(1)}%)
            </span>
          </div>
        )}
      </div>

      {/* 드래그 선택 구간 탐색 요약 칩 (부드러운 Apple Smooth 펼침/접힘 애니메이션) */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
          activeRange && rangeStartPoint && rangeEndPoint
            ? 'max-h-24 opacity-100 scale-100'
            : 'max-h-0 opacity-0 scale-95 pointer-events-none'
        }`}
      >
        {displayRange && displayRange.startPoint && displayRange.endPoint && (
          <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-[var(--accent-orange)]/10 border border-[var(--accent-orange)]/30 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-extrabold text-[var(--accent-orange)] flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> 선택 구간 ({displayRange.startPoint.monthStr} ~ {displayRange.endPoint.monthStr})
              </span>
              <span className="text-[var(--text-secondary)] hidden sm:inline">|</span>
              <span className="font-mono text-[var(--text-primary)]">
                {won(displayRange.startPoint.totalAssetsKrw)} ➔ <strong className="text-[var(--text-primary)]">{won(displayRange.endPoint.totalAssetsKrw)}</strong>
              </span>
              <span
                className={`font-mono font-extrabold ${
                  displayRange.diff >= 0 ? 'text-[#10B981]' : 'text-[#F43F5E]'
                }`}
              >
                ({displayRange.diff >= 0 ? '+' : ''}{won(displayRange.diff)}, {displayRange.diff >= 0 ? '+' : ''}{displayRange.returnRate.toFixed(2)}%)
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedRange(null);
              }}
              className="p-1 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--card-hover)] transition-colors cursor-pointer"
              title="구간 선택 해제"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* SVG 인터랙티브 차트 (0px 정밀 스냅 & 드래그 탐색 지원 - 모바일 비례 유지) */}
      <div className="relative w-full overflow-hidden select-none cursor-crosshair">
        <svg
          key={`trend-svg-${animKey}-${mode}-${points.length}`}
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto aspect-[800/240] overflow-visible"
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onMouseLeave={() => {
            handlePointerUp();
            setHoverIdx(null);
          }}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
        >
          <defs>
            <linearGradient id="assetTrendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent-orange)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="var(--accent-orange)" stopOpacity="0.0" />
            </linearGradient>

            <style>{`
              @keyframes assetTrendSweep_${animKey} {
                0% { width: 0px; }
                100% { width: ${chartW + 20}px; }
              }
            `}</style>
            <clipPath id={`assetTrendSweepClip_${animKey}`}>
              <rect
                x={padding.left}
                y={0}
                width={0}
                height={height}
                style={{
                  animation: `assetTrendSweep_${animKey} 1000ms cubic-bezier(0.16, 1, 0.3, 1) forwards`,
                }}
              />
            </clipPath>
          </defs>

          {/* 수평 눈금 그리드선 (순수 SVG 그리드선) */}
          {yTicks.map((tick, i) => {
            const y = getY(tick.val);
            return (
              <line
                key={i}
                x1={padding.left}
                y1={y}
                x2={padding.left + chartW}
                y2={y}
                stroke="var(--border-color)"
                strokeOpacity="0.5"
                strokeDasharray={i === 2 ? undefined : '3 3'}
                className="pointer-events-none"
              />
            );
          })}

          {/* 드래그 선택 구간 하이라이트 밴드 */}
          {activeRange && (
            <g>
              <rect
                x={getX(activeRange.start)}
                y={padding.top}
                width={Math.max(2, getX(activeRange.end) - getX(activeRange.start))}
                height={chartH}
                fill="var(--accent-orange)"
                fillOpacity="0.14"
                stroke="var(--accent-orange)"
                strokeOpacity="0.5"
                strokeWidth="1.2"
                rx="3"
              />
              <line
                x1={getX(activeRange.start)}
                y1={padding.top}
                x2={getX(activeRange.start)}
                y2={padding.top + chartH}
                stroke="var(--accent-orange)"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
              <line
                x1={getX(activeRange.end)}
                y1={padding.top}
                x2={getX(activeRange.end)}
                y2={padding.top + chartH}
                stroke="var(--accent-orange)"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
            </g>
          )}

          {/* 애플 네이티브 ClipPath Sweep Reveal 애니메이션 그룹 (선 + 영역 일체형 드로잉) */}
          <g clipPath={`url(#assetTrendSweepClip_${animKey})`}>
            {/* 총 자산 영역 채우기 */}
            {assetAreaPath && (
              <path
                d={assetAreaPath}
                fill="url(#assetTrendGradient)"
                className="pointer-events-none"
              />
            )}

            {/* 투자 원금 점선 (점선 속성 100% 보존) */}
            {investLinePath && (
              <path
                d={investLinePath}
                fill="none"
                stroke="#94A3B8"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                strokeLinecap="round"
              />
            )}

            {/* 총 자산 실선 (오렌지) */}
            {assetLinePath && (
              <path
                d={assetLinePath}
                fill="none"
                stroke="var(--accent-orange)"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            )}
          </g>



          {/* 호버가 없을 때 마지막 현재 시점 종점 포인트 강조 (Apple Polish) */}
          {activeIndex === null && points.length > 0 && (
            <g className="transition-opacity duration-300 pointer-events-none">
              <circle
                cx={getX(points.length - 1)}
                cy={getY(points[points.length - 1].totalAssetsKrw)}
                r="7"
                fill="var(--accent-orange)"
                fillOpacity="0.25"
                className="animate-ping"
              />
              <circle
                cx={getX(points.length - 1)}
                cy={getY(points[points.length - 1].totalAssetsKrw)}
                r="4"
                fill="var(--accent-orange)"
                stroke="var(--bg-main)"
                strokeWidth="2"
              />
            </g>
          )}

          {/* 마우스 호버 가이드라인 & 포인트 도트 (0px 정밀 스냅) */}
          {activeIndex !== null && (
            <g>
              <line
                x1={getX(activeIndex)}
                y1={padding.top}
                x2={getX(activeIndex)}
                y2={padding.top + chartH}
                stroke="var(--accent-orange)"
                strokeOpacity="0.4"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
              <circle
                cx={getX(activeIndex)}
                cy={getY(activePoint.investedKrw)}
                r="3.5"
                fill="#94A3B8"
                stroke="var(--bg-main)"
                strokeWidth="2"
              />
              <circle
                cx={getX(activeIndex)}
                cy={getY(activePoint.totalAssetsKrw)}
                r="4.5"
                fill="var(--accent-orange)"
                stroke="var(--bg-main)"
                strokeWidth="2"
              />
            </g>
          )}
        </svg>

        {/* Responsive Native HTML Y-Axis Value Labels (토스/트레이딩뷰 금융 표준: X축과 100% 동일 크기 및 두께) */}
        <div className="absolute inset-0 pointer-events-none select-none z-10">
          {yTicks.map((tick, i) => {
            const y = getY(tick.val);
            return (
              <span
                key={`html-journal-y-${i}`}
                className="absolute font-mono text-[10px] sm:text-[11px] font-bold text-[var(--text-secondary)] opacity-80 -translate-y-full mb-0.5 select-none"
                style={{
                  top: `${(y / height) * 100}%`,
                  left: `${(padding.left / width) * 100}%`,
                  paddingLeft: '4px',
                }}
              >
                {tick.label}
              </span>
            );
          })}
        </div>
      </div>

      {/* Responsive Native HTML X-Axis Timeline Bar (중간중간 퐁퐁퐁 날짜 배치) */}
      <div className="relative w-full h-5 select-none pointer-events-none mt-1 mb-2">
        {middleTickIndices.map((i) => {
          const p = points[i];
          if (!p) return null;
          const x = getX(i);
          const isSelected = i === activeIndex;
          return (
            <span
              key={`html-journal-x-${p.monthStr}-${i}`}
              className={`absolute text-[11px] sm:text-xs font-mono font-bold -translate-x-1/2 whitespace-nowrap transition-colors ${
                isSelected ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'
              }`}
              style={{
                left: `${(x / width) * 100}%`,
              }}
            >
              {p.monthStr}
            </span>
          );
        })}
      </div>

      {/* 1일 차 초기 안내 */}
      {points.length <= 1 && (
        <div className="text-center py-2 px-3 rounded-lg bg-[var(--bg-main)]/60 border border-[var(--border-color)]/60 text-[11px] text-[var(--text-secondary)] font-medium">
          🌱 첫 기록 등록일입니다. 내일부터 일별 순자산 및 투자 원금 변동 추이가 연속 선 그래프로 기록됩니다.
        </div>
      )}

      {/* 범례 */}
      <div className="flex items-center justify-end gap-4 text-[11px] text-[var(--text-secondary)] font-medium pt-1">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-1 rounded-full bg-[var(--accent-orange)] inline-block" />
          <span>총 자산</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 border-t border-dashed border-[#94A3B8] inline-block" />
          <span>투자 원금</span>
        </div>
      </div>

      {/* 4대 기간 실질 성과 스코어카드 (차트 아래로 이동하여 합리적 시선 흐름 완성) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5 pt-1 relative z-30">
        {performanceCards.map((card) => {
          const isLocked = card.isPro && !isPro;
          const isPositive = card.diffKrw >= 0;
          const isTarget = trendPopoverTarget === card.id;

          return (
            <div key={card.id} className="relative z-10">
              <div
                className="p-3 rounded-xl bg-[var(--card-surface)]/80 border border-[var(--border-color)]/70 flex flex-col justify-between transition-all h-full cursor-default"
              >
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span className="text-[11px] font-bold text-[var(--text-secondary)] truncate">
                    {card.title}
                  </span>
                  {card.isPro && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-[var(--accent-orange)]/15 text-[var(--accent-orange)] border border-[var(--accent-orange)]/30 shrink-0">
                      PRO
                    </span>
                  )}
                </div>

                {isLocked ? (
                  <div className="flex items-center gap-1.5 py-0.5 text-xs font-bold text-[var(--text-secondary)]">
                    <Lock className="w-3.5 h-3.5 text-[var(--accent-orange)]" />
                    <span className="text-[11px]">PRO 멤버십 전용</span>
                  </div>
                ) : (
                  <div className="space-y-0.5">
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <span
                        className={`text-sm sm:text-base font-extrabold font-mono ${
                          isPositive ? 'text-[#10B981]' : 'text-[#F43F5E]'
                        }`}
                      >
                        {isPositive ? '+' : ''}{won(card.diffKrw)}
                      </span>
                      <span
                        className={`text-[11px] font-mono font-bold ${
                          isPositive ? 'text-[#10B981]' : 'text-[#F43F5E]'
                        }`}
                      >
                        ({isPositive ? '+' : ''}{card.returnRate.toFixed(1)}%)
                      </span>
                    </div>
                    <span className="text-[9px] text-[var(--text-secondary)] block truncate">
                      {card.period}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OverviewHistoryArchive({
  monthlyTradeStats,
  monthlyDepositStats,
  isPro = false,
  onExportCsv,
  onOpenProModal,
  proPopoverTarget,
  isProPopoverClosing,
  onCloseProPopover,
}: {
  monthlyTradeStats: MonthlyTradeStat[];
  monthlyDepositStats: MonthlyDepositStat[];
  isPro?: boolean;
  onExportCsv: () => void;
  onOpenProModal?: () => void;
  proPopoverTarget?: string | null;
  isProPopoverClosing?: boolean;
  onCloseProPopover?: () => void;
}) {
  const { openCompareModal } = useAuth();
  const displayedTradeStats = isPro ? monthlyTradeStats : monthlyTradeStats.slice(0, 1);
  const hasMoreTradeStats = !isPro && monthlyTradeStats.length > 1;

  const displayedDepositStats = isPro ? monthlyDepositStats : monthlyDepositStats.slice(0, 1);
  const hasMoreDepositStats = !isPro && monthlyDepositStats.length > 1;

  return (
    <div className="space-y-4 pt-2">
      {/* 월별 매매 실적 */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[var(--card-surface)]/60 border border-[var(--border-color)]/80 space-y-3.5 shadow-2xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-extrabold text-[var(--text-primary)]">
              월별 매매 실적
            </span>
            <span className="text-[10px] text-[var(--text-secondary)]">
              (실제 등록된 거래 기록 기준 집계)
            </span>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={onExportCsv}
              className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--accent-orange)] hover:bg-[var(--accent-orange)]/10 rounded-lg transition-colors cursor-pointer"
              title="CSV 파일 저장"
              aria-label="CSV 파일 저장"
            >
              <Download className="w-4 h-4" />
            </button>
            {proPopoverTarget === 'csv-archive' && (
              <ProMiniPopover
                title="월별 매매 실적 CSV 내보내기"
                description="PRO 멤버십에 가입하면 모든 계좌의 전체 매매 기록과 계좌 잔고를 엑셀 CSV 파일로 무제한 저장할 수 있습니다."
                align="right"
                isClosing={isProPopoverClosing}
                onClose={onCloseProPopover || (() => {})}
                onAction={onOpenProModal || openCompareModal}
              />
            )}
          </div>
        </div>

        {displayedTradeStats.length === 0 ? (
          <div className="py-6 text-center text-xs text-[var(--text-secondary)] border border-dashed border-[var(--border-color)]/60 rounded-lg">
            아직 등록된 거래 기록이 없습니다. 종목 카드에서 거래를 기록하면 월별 실적이 자동으로 집계됩니다.
          </div>
        ) : (
          <div className="overflow-x-auto pb-1">
            <table className="min-w-[460px] w-full text-xs text-left whitespace-nowrap">
              <thead>
                <tr className="border-b border-[var(--border-color)]/70 text-[11px] text-[var(--text-secondary)] font-bold">
                  <th className="py-2 px-2.5 whitespace-nowrap">기준월</th>
                  <th className="py-2 px-2.5 text-right whitespace-nowrap">구매 금액</th>
                  <th className="py-2 px-2.5 text-right whitespace-nowrap">판매 금액</th>
                  <th className="py-2 px-2.5 text-right whitespace-nowrap">확정 실현손익</th>
                  <th className="py-2 px-2.5 text-right whitespace-nowrap">거래 횟수</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]/40 font-mono">
                {displayedTradeStats.map((st) => (
                  <tr key={st.monthStr} className="hover:bg-[var(--card-surface)]/60 transition-colors">
                    <td className="py-2.5 px-2.5 font-bold text-[var(--text-primary)] whitespace-nowrap">{st.monthStr}</td>
                    <td className="py-2.5 px-2.5 text-right text-[var(--text-secondary)] whitespace-nowrap">{st.buyAmount > 0 ? won(st.buyAmount) : '-'}</td>
                    <td className="py-2.5 px-2.5 text-right text-[var(--text-secondary)] whitespace-nowrap">{st.sellAmount > 0 ? won(st.sellAmount) : '-'}</td>
                    <td className={`py-2.5 px-2.5 text-right font-bold whitespace-nowrap ${
                      st.realizedProfit > 0
                        ? 'text-[var(--accent-emerald,#10B981)]'
                        : st.realizedProfit < 0
                        ? 'text-[#F43F5E]'
                        : 'text-[var(--text-secondary)]'
                    }`}>
                      {st.realizedProfit !== 0 ? `${st.realizedProfit > 0 ? '+' : ''}${won(st.realizedProfit)}` : '-'}
                    </td>
                    <td className="py-2.5 px-2.5 text-right text-[var(--text-secondary)] whitespace-nowrap">{st.tradeCount}건</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {hasMoreTradeStats && (
          <div className="pt-1.5">
            <button
              type="button"
              onClick={openCompareModal}
              className="w-full py-2.5 px-3.5 rounded-xl bg-[var(--card-surface)]/80 hover:bg-[var(--card-surface)] border border-[var(--border-color)]/70 hover:border-[var(--accent-orange)]/50 transition-all flex items-center justify-between gap-2 text-xs cursor-pointer group shadow-2xs"
            >
              <div className="flex items-center gap-1.5 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] font-medium">
                <Lock className="w-3.5 h-3.5 text-[var(--accent-orange)] shrink-0" />
                <span>이전 월별 실적 아카이브는 PRO 멤버십 전용입니다.</span>
              </div>
              <span className="text-[11px] font-bold text-[var(--accent-orange)] shrink-0 flex items-center gap-0.5">
                멤버십 플랜 알아보기 <ChevronRight className="w-3 h-3" />
              </span>
            </button>
          </div>
        )}
      </div>

      {/* 월별 입출금 현황 */}
      {displayedDepositStats.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-[var(--card-surface)]/60 border border-[var(--border-color)]/80 space-y-3.5 shadow-2xs">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-extrabold text-[var(--text-primary)]">
              월별 입출금 현황
            </span>
          </div>

          <div className="overflow-x-auto pb-1">
            <table className="min-w-[380px] w-full text-xs text-left whitespace-nowrap">
              <thead>
                <tr className="border-b border-[var(--border-color)]/70 text-[11px] text-[var(--text-secondary)] font-bold">
                  <th className="py-2 px-2.5 whitespace-nowrap">기준월</th>
                  <th className="py-2 px-2.5 text-right whitespace-nowrap">입금액</th>
                  <th className="py-2 px-2.5 text-right whitespace-nowrap">출금액</th>
                  <th className="py-2 px-2.5 text-right whitespace-nowrap">순 입금액</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]/40 font-mono">
                {displayedDepositStats.map((st) => (
                  <tr key={st.monthStr} className="hover:bg-[var(--card-surface)]/60 transition-colors">
                    <td className="py-2.5 px-2.5 font-bold text-[var(--text-primary)] whitespace-nowrap">{st.monthStr}</td>
                    <td className="py-2.5 px-2.5 text-right text-[var(--accent-emerald,#10B981)] whitespace-nowrap">+{won(st.inAmount)}</td>
                    <td className="py-2.5 px-2.5 text-right text-[#F43F5E] whitespace-nowrap">-{won(st.outAmount)}</td>
                    <td className="py-2.5 px-2.5 text-right font-bold text-[var(--text-primary)] whitespace-nowrap">{won(st.netAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {hasMoreDepositStats && !hasMoreTradeStats && (
            <div className="pt-1.5">
              <button
                type="button"
                onClick={openCompareModal}
                className="w-full py-2.5 px-3.5 rounded-xl bg-[var(--card-surface)]/80 hover:bg-[var(--card-surface)] border border-[var(--border-color)]/70 hover:border-[var(--accent-orange)]/50 transition-all flex items-center justify-between gap-2 text-xs cursor-pointer group shadow-2xs"
              >
                <div className="flex items-center gap-1.5 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] font-medium">
                  <Lock className="w-3.5 h-3.5 text-[var(--accent-orange)] shrink-0" />
                  <span>이전 월별 입출금 아카이브는 PRO 멤버십 전용입니다.</span>
                </div>
                <span className="text-[11px] font-bold text-[var(--accent-orange)] shrink-0 flex items-center gap-0.5">
                  멤버십 플랜 알아보기 <ChevronRight className="w-3 h-3" />
                </span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// 초기 데이터 로딩 중 온보딩 빈 계좌 화면이 깜빡이지 않도록 방지하는 Apple HIG 스켈레톤
function JournalLoadingSkeleton() {
  return (
    <div className="rounded-2xl border border-[var(--border-color)]/80 bg-[var(--card-surface)]/90 backdrop-blur-md p-4 sm:p-6 space-y-5 animate-pulse shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="h-6 w-32 rounded-lg bg-[var(--border-color)]/50" />
          <div className="h-5 w-24 rounded-full bg-[var(--border-color)]/30" />
        </div>
        <div className="h-8 w-44 rounded-full bg-[var(--border-color)]/30 self-start sm:self-auto" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-[var(--bg-main)]/70 border border-[var(--border-color)]/70 rounded-xl p-3 sm:p-3.5 space-y-2">
            <div className="h-3 w-14 rounded bg-[var(--border-color)]/40" />
            <div className="h-5 sm:h-6 w-24 rounded bg-[var(--border-color)]/50" />
            <div className="h-2.5 w-20 rounded bg-[var(--border-color)]/30" />
          </div>
        ))}
      </div>

      <div className="space-y-2 pt-2">
        <div className="h-3 w-20 rounded bg-[var(--border-color)]/40" />
        <div className="h-4 rounded-full bg-[var(--border-color)]/30 w-full" />
      </div>

      <div className="space-y-2 pt-1">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-3 rounded-xl bg-[var(--bg-main)]/50 border border-[var(--border-color)]/60 flex items-center justify-between gap-3">
            <div className="space-y-1.5">
              <div className="h-4 w-28 rounded bg-[var(--border-color)]/40" />
              <div className="h-3 w-20 rounded bg-[var(--border-color)]/30" />
            </div>
            <div className="space-y-1.5 text-right flex flex-col items-end">
              <div className="h-4 w-20 rounded bg-[var(--border-color)]/40" />
              <div className="h-3 w-12 rounded bg-[var(--border-color)]/30" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function JournalPage() {
  const { user, isPro, openCompareModal } = useAuth();
  const isAdmin = user?.nickname === '주식부엉';
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [data, setData] = useState<JournalData>({ accounts: [], logs: [] });
  // 'ALL'은 전체 오버뷰 탭
  const [activeId, setActiveId] = useState<string>('ALL');
  const [loaded, setLoaded] = useState(false);
  const [quotes, setQuotes] = useState<QuoteMap>({ quotes: {}, usdKrw: null });
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteAt, setQuoteAt] = useState<string | null>(null);

  // 직전 조회 시세 로컬 캐시 즉시 복원 (첫 진입 시 시세 미도착으로 인한 계산 플래시 방지)
  useEffect(() => {
    try {
      const cached = localStorage.getItem('jusik_quotes_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.quotes && Object.keys(parsed.quotes).length > 0) {
          setQuotes(parsed);
          if (parsed.fetchedAt) setQuoteAt(parsed.fetchedAt);
        }
      }
    } catch {}
  }, []);
  const [applied, setApplied] = useState(false);
  const [appliedLineGroupIds, setAppliedLineGroupIds] = useState<string[]>([]);
  const [showAccountDetailAnalytics, setShowAccountDetailAnalytics] = useState(false);

  // PRO 미니 팝오버 상태 ('account' 계좌 추가 제한 | 'report' 수익률 리포트 제한 | 'csv' | 'csv-logs' | 'csv-archive' | 'history' | 'history-overview' | null)
  const [proPopoverTarget, setProPopoverTarget] = useState<'account' | 'report' | 'csv' | 'csv-logs' | 'csv-archive' | 'history' | 'history-overview' | null>(null);
  const [isProPopoverClosing, setIsProPopoverClosing] = useState(false);
  const closePopoverTimerRef = useRef<NodeJS.Timeout | null>(null);

  const closeProPopover = useCallback(() => {
    if (!proPopoverTarget || isProPopoverClosing) return;
    setIsProPopoverClosing(true);
    if (closePopoverTimerRef.current) clearTimeout(closePopoverTimerRef.current);
    closePopoverTimerRef.current = setTimeout(() => {
      setProPopoverTarget(null);
      setIsProPopoverClosing(false);
    }, 220);
  }, [proPopoverTarget, isProPopoverClosing]);

  const openProPopover = useCallback((target: 'account' | 'report' | 'csv' | 'csv-logs' | 'csv-archive' | 'history' | 'history-overview') => {
    if (closePopoverTimerRef.current) clearTimeout(closePopoverTimerRef.current);
    setIsProPopoverClosing(false);
    setProPopoverTarget(target);
  }, []);

  // ESC 키 및 바깥 클릭으로 PRO 미니 팝오버 닫기
  useEffect(() => {
    if (!proPopoverTarget || isProPopoverClosing) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeProPopover();
    };
    const handlePointerDown = (e: PointerEvent | MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest('[data-pro-popover]')) return;
      closeProPopover();
    };
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('pointerdown', handlePointerDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [proPopoverTarget, isProPopoverClosing, closeProPopover]);

  // 계좌 오버뷰 뷰 모드 ('group' 자산군별 | 'asset' 종목별)
  const [overviewViewMode, setOverviewViewMode] = useState<'group' | 'asset'>('group');
  // 계좌 관리 모드 (상단 탭 인라인 관리)
  const [isManagingAccounts, setIsManagingAccounts] = useState(false);
  // 신규 추가된 계좌 자동 포커스 & 선택 타겟 ID
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  // 다종목 보유 자산군 대표 종목 보존 (서브 종목 우선 정리) 토글 (기본값: true)
  const [prioritizeSubAssetLiquidation, setPrioritizeSubAssetLiquidation] = useState(true);

  // 방금 수행한 매매 반영 실행 취소(되돌리기) 스냅샷
  const [lastUndoSnapshot, setLastUndoSnapshot] = useState<{
    label: string;
    prevAccounts: JournalAccount[];
    createdLogIds: string[];
    appliedGroupIds: string[];
  } | null>(null);
  const [isUndoClosing, setIsUndoClosing] = useState(false);
  const undoCloseTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 실행 취소 캡슐 부드러운 퇴장 (Apple Motion 0.35s)
  const dismissUndo = useCallback(() => {
    if (!lastUndoSnapshot || isUndoClosing) return;
    setIsUndoClosing(true);
    if (undoCloseTimerRef.current) clearTimeout(undoCloseTimerRef.current);
    undoCloseTimerRef.current = setTimeout(() => {
      setLastUndoSnapshot(null);
      setIsUndoClosing(false);
    }, 350);
  }, [lastUndoSnapshot, isUndoClosing]);

  // 실행 취소(되돌리기) 배너 5초 후 자동 숨김 타이머 (UX 표준 5초)
  useEffect(() => {
    if (!lastUndoSnapshot) return;
    setIsUndoClosing(false);
    const timer = setTimeout(() => {
      dismissUndo();
    }, 5000);
    return () => clearTimeout(timer);
  }, [lastUndoSnapshot, dismissUndo]);

  // 신규 계좌 추가 시 인풋 자동 Focus & "새 계좌" 전체 텍스트 자동 Select
  useEffect(() => {
    if (!editingAccountId) return;
    const timer = setTimeout(() => {
      const el = document.getElementById(`account-name-input-${editingAccountId}`) as HTMLInputElement | null;
      if (el) {
        el.focus();
        el.select();
      }
      setEditingAccountId(null);
    }, 50);
    return () => clearTimeout(timer);
  }, [editingAccountId]);

  // 이번에 살 수량 계산 카드에서 사용자가 수정한 수량 맵 (groupId -> number)
  const [customQuantities, setCustomQuantities] = useState<Record<string, number>>({});

  // 종목별 수동 거래 기록 폼 상태
  const [manualTradeSymbol, setManualTradeSymbol] = useState<string | null>(null);
  const [manualTradeType, setManualTradeType] = useState<'BUY' | 'SELL'>('BUY');
  const [manualTradeQty, setManualTradeQty] = useState('');
  const [manualTradePrice, setManualTradePrice] = useState('');
  const [manualTradeDate, setManualTradeDate] = useState<string>(() => getLocalDateString());
  const [isLoadingHistoryPrice, setIsLoadingHistoryPrice] = useState(false);

  // 현재 인라인 수정 중인 종목 심볼 (null이면 평소 Read-Only 모드)
  const [editingSymbol, setEditingSymbol] = useState<string | null>(null);

  // 현재 인라인 수정 중인 자산군 ID (null이면 평소 Read-Only 모드)
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);

  // 자산군 순서 편집 모드 및 드래그 상태
  const [isReorderingGroups, setIsReorderingGroups] = useState(false);
  const [draggedGroupIndex, setDraggedGroupIndex] = useState<number | null>(null);
  const groupCardRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const prevGroupTops = useRef<Map<string, number>>(new Map());

  // 현금 인라인 편집 및 슬림 1줄 입출금 / 환전 상태
  const [isEditingCash, setIsEditingCash] = useState(false);
  const cashEditInitialRef = useRef<{ krw: number; usd: number } | null>(null);
  // 종목 인라인 수량/단가 편집 시작 시점 스냅샷 (완료 시 deltaQty 계산하여 매매 기록 자동 생성용)
  const symbolEditInitialRef = useRef<{ groupId: string; symbol: string; qty: number; avgPriceKrw: number } | null>(null);
  const [isInlineDepositOpen, setIsInlineDepositOpen] = useState(false);
  const [inlineDepositType, setInlineDepositType] = useState<'IN' | 'OUT' | 'FX'>('IN');
  const [inlineDepositAmount, setInlineDepositAmount] = useState('');
  const [isEditingDepositGoal, setIsEditingDepositGoal] = useState(false);
  const [typingDepositGoal, setTypingDepositGoal] = useState('');
  const [fxDirection, setFxDirection] = useState<'USD_TO_KRW' | 'KRW_TO_USD'>('USD_TO_KRW');
  const [fxAmount, setFxAmount] = useState('');
  const [showFeeSettings, setShowFeeSettings] = useState(false);

  // 현금 및 수수료 소수점 입력 증발 방지용 로컬 문자열 버퍼
  const [typingCashUsd, setTypingCashUsd] = useState<string | null>(null);
  const [typingKrFee, setTypingKrFee] = useState<string | null>(null);
  const [typingUsFee, setTypingUsFee] = useState<string | null>(null);
  const [typingFxDiscount, setTypingFxDiscount] = useState<string | null>(null);

  const sanitizeDecimal = (val: string) => {
    const cleaned = val.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    return parts.length > 1 ? `${parts[0]}.${parts.slice(1).join('')}` : cleaned;
  };

  // 한국어 주격 조사(이/가) 받침 유무 동적 판별 헬퍼
  const getSubjectParticle = (word: string) => {
    if (!word) return '이';
    const lastChar = word.trim().slice(-1);
    const code = lastChar.charCodeAt(0);
    if (code >= 0xac00 && code <= 0xd7a3) {
      const hasBatchim = (code - 0xac00) % 28 > 0;
      return hasBatchim ? '이' : '가';
    }
    return '이';
  };

  // 살 수량 수동 입력 소수점 버퍼
  const [typingCustomQuantities, setTypingCustomQuantities] = useState<Record<string, string>>({});

  // 소수점 입력 증발 방지용 로컬 문자열 버퍼 (종목 심볼 -> 입력 문자열)
  const [typingHoldings, setTypingHoldings] = useState<Record<string, string>>({});
  const [typingWeights, setTypingWeights] = useState<Record<string, string>>({});

  // 종목별 평균단가 통화 표시 모드 (심볼 -> 'KRW' | 'USD')
  const [avgPriceCurrencyMode, setAvgPriceCurrencyMode] = useState<Record<string, 'KRW' | 'USD'>>({});
  const [typingAvgPrices, setTypingAvgPrices] = useState<Record<string, string>>({});

  // 도움말 툴팁 열림 상태
  const [showCodeHelp, setShowCodeHelp] = useState(false);

  // 새 자산군 추가 폼 열림 상태 (접이식)
  const [isAddGroupOpen, setIsAddGroupOpen] = useState(false);

  // 펼쳐진 "다른 종목 추가" 자산군 ID
  const [expandedAddSymbolGroupId, setExpandedAddSymbolGroupId] = useState<string | null>(null);

  // 자산 직접 추가 폼 상태 (보유 수량 및 구매일자, 평단가 포함)
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupSymbol, setNewGroupSymbol] = useState('');
  const [newGroupWeight, setNewGroupWeight] = useState('');
  const [newGroupHoldings, setNewGroupHoldings] = useState('');
  const [newGroupTradeDate, setNewGroupTradeDate] = useState<string>(() => getLocalDateString());
  const [newGroupAvgPrice, setNewGroupAvgPrice] = useState('');
  const [newGroupAvgPriceUsd, setNewGroupAvgPriceUsd] = useState('');

  // 새 자산군 추가 폼: 심볼 실시간 조회 상태 및 피드백
  const [newGroupSymbolInfo, setNewGroupSymbolInfo] = useState<{ name?: string; price: number; priceKrw: number; currency: string } | null>(null);
  const [isSearchingSymbol, setIsSearchingSymbol] = useState(false);
  const [symbolSearchError, setSymbolSearchError] = useState<string | null>(null);

  // 과거 특정 일자 종가 API 조회 헬퍼
  const fetchPastPrice = async (sym: string, dateStr: string) => {
    setIsLoadingHistoryPrice(true);
    try {
      const res = await fetch(`/api/quotes/history?symbol=${encodeURIComponent(sym)}&date=${encodeURIComponent(dateStr)}`);
      const json = await res.json();
      if (json.success && json.data) {
        return json.data;
      }
    } catch {} finally {
      setIsLoadingHistoryPrice(false);
    }
    return null;
  };

  // 심볼 입력 시 실시간 디바운스(350ms) 시세 및 종목명 조회
  useEffect(() => {
    const raw = newGroupSymbol.trim();
    if (!raw) {
      setNewGroupSymbolInfo(null);
      setIsSearchingSymbol(false);
      setSymbolSearchError(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingSymbol(true);
      setSymbolSearchError(null);
      try {
        const norm = normalizeSymbol(raw);
        const res = await fetch(`/api/quotes?symbols=${encodeURIComponent(norm)}`);
        const json = await res.json();
        const q = json?.quotes?.[norm];
        if (q && q.price > 0) {
          // 평균단가가 비어있다면 기본값으로 제안 (해외 주식인 경우 통화별 환율을 즉시 곱해 원화 단가로 설정)
          const usdRate = json?.usdKrw || quotes.usdKrw || 1350;
          const jpyRate = json?.jpyKrw || quotes.jpyKrw || 9.0;
          const hkdRate = json?.hkdKrw || quotes.hkdKrw || 173;
          const eurRate = json?.eurKrw || quotes.eurKrw || 1470;
          const cnyRate = json?.cnyKrw || quotes.cnyKrw || 190;

          let priceKrwVal = Math.round(q.price);
          if (q.currency === 'USD') {
            priceKrwVal = Math.round(q.price * usdRate);
          } else if (q.currency === 'JPY') {
            priceKrwVal = Math.round(q.price * jpyRate);
          } else if (q.currency === 'HKD') {
            priceKrwVal = Math.round(q.price * hkdRate);
          } else if (q.currency === 'EUR') {
            priceKrwVal = Math.round(q.price * eurRate);
          } else if (q.currency === 'CNY') {
            priceKrwVal = Math.round(q.price * cnyRate);
          }

          setNewGroupSymbolInfo({
            name: q.name,
            price: q.price,
            priceKrw: priceKrwVal,
            currency: q.currency || 'KRW',
          });
          // 종목명이 아직 비어있다면 자동 입력
          if (q.name) {
            setNewGroupName((prev) => (prev.trim() === '' ? q.name! : prev));
          }

          setNewGroupAvgPrice((prev) => {
            if (prev.trim() !== '') return prev;
            return String(priceKrwVal);
          });
          if (q.currency === 'USD') {
            setNewGroupAvgPriceUsd((prev) => {
              if (prev.trim() !== '') return prev;
              return String(q.price);
            });
          }
        } else {
          setNewGroupSymbolInfo(null);
          setSymbolSearchError('종목 시세를 조회할 수 없습니다. 코드나 티커를 확인해 주세요.');
        }
      } catch {
        setSymbolSearchError('시세 조회 중 오류가 발생했습니다.');
      } finally {
        setIsSearchingSymbol(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [newGroupSymbol]);

  const nickname = user?.nickname;
  const pin = user?.pin;
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialLoadedJsonRef = useRef<string | null>(null);
  const allowEmptyOverwriteRef = useRef<boolean>(false);

  // 데이터 불러오기 (이중 증발 방지 가드 적용)
  useEffect(() => {
    let cancelled = false;
    const sanitizeAccounts = (accs: JournalAccount[]): JournalAccount[] =>
      accs.map((a) => {
        const copy = { ...a };
        delete copy.budget;
        delete copy.snapshots;
        return copy;
      });

    const storageKey = getJournalStorageKey(nickname);
    const loadLocal = (): JournalData => {
      try {
        const raw = JSON.parse(localStorage.getItem(storageKey) || 'null');
        if (raw && Array.isArray(raw.accounts)) {
          return {
            accounts: sanitizeAccounts(raw.accounts),
            logs: flattenLogs(raw.logs || []),
          };
        }
      } catch {}
      return { accounts: [], logs: [] };
    };

    (async () => {
      const localData = loadLocal();
      let next: JournalData | null = null;
      let needsServerBackup = false;

      if (nickname && pin) {
        try {
          const res = await fetch('/api/journal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'load', nickname, pin }),
          });
          const json = await res.json();
          if (json.success && json.journal && Array.isArray(json.journal.accounts) && json.journal.accounts.length > 0) {
            next = {
              accounts: sanitizeAccounts(json.journal.accounts),
              logs: flattenLogs(json.journal.logs || []),
            };
          } else if (json.success) {
            // 서버 응답이 비어 있더라도 동일 계정의 브라우저 로컬 캐시에 유효한 계좌가 남아있다면 절대 빈 배열로 덮어쓰지 않고 복원
            if (localData.accounts.length > 0) {
              next = localData;
              needsServerBackup = true;
            } else {
              next = { accounts: [], logs: [] };
            }
          }
        } catch {}
      }
      if (!next) next = localData;
      if (cancelled) return;
      allowEmptyOverwriteRef.current = false;
      initialLoadedJsonRef.current = needsServerBackup ? '__NEEDS_SERVER_BACKUP__' : JSON.stringify(next);
      setData(next);
      setActiveId(next.accounts.length === 1 ? next.accounts[0].id : 'ALL');
      setLoaded(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [nickname, pin]);

  // 계좌가 1개뿐일 때 모아보기 탭을 숨기고 해당 단일 계좌를 자동으로 기본 활성화
  useEffect(() => {
    if (loaded && data.accounts.length === 1 && activeId === 'ALL') {
      setActiveId(data.accounts[0].id);
    }
  }, [loaded, data.accounts, activeId]);

  // 디바운스 자동 저장 (초기 로드 직후 무변경 상태거나 의도치 않은 빈 계좌 덮어쓰기 원천 차단)
  useEffect(() => {
    if (!loaded) return;
    const currentJson = JSON.stringify(data);
    if (currentJson === initialLoadedJsonRef.current) {
      return;
    }
    // 사용자가 마지막 계좌를 명시적으로 삭제한 경우가 아닌데 빈 계좌 배열이 된 경우 로컬/서버 덮어쓰기 차단
    if (data.accounts.length === 0 && !allowEmptyOverwriteRef.current) {
      return;
    }

    initialLoadedJsonRef.current = currentJson;
    const storageKey = getJournalStorageKey(nickname);
    try {
      localStorage.setItem(storageKey, currentJson);
    } catch {}
    if (!nickname || !pin) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    const allowEmpty = allowEmptyOverwriteRef.current;
    saveTimer.current = setTimeout(async () => {
      try {
        const res = await fetch('/api/journal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'save',
            nickname,
            pin,
            journal: data,
            allowEmptyOverwrite: allowEmpty,
          }),
        });
        if (res.status === 409) {
          const json = await res.json();
          if (json.journal && Array.isArray(json.journal.accounts) && json.journal.accounts.length > 0) {
            initialLoadedJsonRef.current = JSON.stringify(json.journal);
            setData(json.journal);
          }
        }
      } catch {}
    }, 900);

    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [data, loaded, nickname, pin]);

  const account = useMemo(
    () => (activeId === 'ALL' ? null : data.accounts.find((a) => a.id === activeId) || null),
    [data.accounts, activeId]
  );

  // 현금 잔액, 추가 투자금, 운용 전략 또는 자산군 비중/보유량이 변경되면 수동 수정 수량(customQuantities)을 자동 리셋하여 최신 계산값 동기화
  const conditionsSignature = useMemo(() => {
    if (!account) return '';
    const groupsKey = account.groups.map((g) => `${g.id}:${g.weight}:${JSON.stringify(g.holdings)}`).join(';');
    return `${account.cash}_${account.cashUsd}_${account.noSell}_${account.fractional}_${groupsKey}`;
  }, [account]);

  const lastConditionsSignatureRef = useRef(conditionsSignature);
  useEffect(() => {
    if (lastConditionsSignatureRef.current !== conditionsSignature) {
      lastConditionsSignatureRef.current = conditionsSignature;
      setCustomQuantities({});
      setTypingCustomQuantities({});
    }
  }, [conditionsSignature]);

  // 전체 종목 목록 추출 (정규화)
  const allSymbols = useMemo(() => {
    const set = new Set<string>();
    data.accounts.forEach((a) =>
      a.groups.forEach((g) =>
        g.symbols.forEach((s) => {
          const norm = normalizeSymbol(s);
          if (norm) set.add(norm);
        })
      )
    );
    return Array.from(set);
  }, [data.accounts]);
  const symbolsKey = allSymbols.join(',');

  // 현재 가격 및 종목명 갱신
  const refreshQuotes = useCallback(async () => {
    if (!symbolsKey) return;
    setQuoteLoading(true);
    try {
      const res = await fetch(`/api/quotes?symbols=${encodeURIComponent(symbolsKey)}`);
      const json = await res.json();
      if (json.success) {
        const nextQuotes = {
          quotes: json.quotes,
          usdKrw: json.usdKrw,
          jpyKrw: json.jpyKrw,
          hkdKrw: json.hkdKrw,
          eurKrw: json.eurKrw,
          cnyKrw: json.cnyKrw,
        };
        setQuotes(nextQuotes);
        setQuoteAt(json.fetchedAt);
        try {
          localStorage.setItem('jusik_quotes_cache', JSON.stringify({ ...nextQuotes, fetchedAt: json.fetchedAt }));
        } catch {}
      }
    } catch {}
    setQuoteLoading(false);
  }, [symbolsKey]);

  useEffect(() => {
    if (loaded && symbolsKey) {
      refreshQuotes();
    }
  }, [loaded, symbolsKey, refreshQuotes]);

  // 계좌 수정 핸들러 (수치 변경 시 '반영됨' 뱃지 자동 리셋)
  const updateAccount = (patch: Partial<JournalAccount>) => {
    if (!account) return;
    setApplied(false);
    setAppliedLineGroupIds([]);
    setData((d) => ({
      ...d,
      accounts: d.accounts.map((a) => (a.id === account.id ? { ...a, ...patch } : a)),
    }));
  };

  const updateGroup = (gid: string, patch: Partial<JournalGroup>) => {
    if (!account) return;
    updateAccount({
      groups: account.groups.map((g) => (g.id === gid ? { ...g, ...patch } : g)),
    });
  };

  // 자산군 순서 변경 헬퍼 (위/아래 버튼 및 드래그 앤 드롭 지원 - FLIP 스르륵 애니메이션 연동)
  const moveGroup = (fromIndex: number, toIndex: number) => {
    if (!account) return;
    if (toIndex < 0 || toIndex >= account.groups.length) return;

    // FLIP: 이동 전 각 카드의 Y좌표 스냅샷 기록
    groupCardRefs.current.forEach((el, id) => {
      if (el) {
        prevGroupTops.current.set(id, el.getBoundingClientRect().top);
      }
    });

    const newGroups = [...account.groups];
    const [moved] = newGroups.splice(fromIndex, 1);
    newGroups.splice(toIndex, 0, moved);
    updateAccount({ groups: newGroups });
  };

  // 같은 자산군 내 종목 순서 변경 헬퍼 (위/아래 이동)
  const moveSymbolInGroup = (groupId: string, fromIndex: number, toIndex: number) => {
    if (!account) return;
    const g = account.groups.find((group) => group.id === groupId);
    if (!g || toIndex < 0 || toIndex >= g.symbols.length) return;

    const newSymbols = [...g.symbols];
    const [moved] = newSymbols.splice(fromIndex, 1);
    newSymbols.splice(toIndex, 0, moved);

    updateGroup(groupId, { symbols: newSymbols });
  };

  // 자산군 순서 변경 시 스르륵 부드러운 FLIP (First, Last, Invert, Play) 애니메이션 적용
  useEffect(() => {
    if (prevGroupTops.current.size === 0) return;

    groupCardRefs.current.forEach((el, id) => {
      const prevTop = prevGroupTops.current.get(id);
      if (el && prevTop !== undefined) {
        const currentTop = el.getBoundingClientRect().top;
        const deltaY = prevTop - currentTop;
        if (Math.abs(deltaY) > 0.5) {
          el.style.transform = `translateY(${deltaY}px)`;
          el.style.transition = 'none';
          requestAnimationFrame(() => {
            el.style.transition = 'transform 0.45s cubic-bezier(0.2, 0.8, 0.2, 1)';
            el.style.transform = '';
          });
        }
      }
    });
    prevGroupTops.current.clear();
  }, [account?.groups]);

  const handleGroupDragStart = (e: React.DragEvent, index: number) => {
    setDraggedGroupIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleGroupDragEnter = (targetIndex: number) => {
    if (draggedGroupIndex === null || draggedGroupIndex === targetIndex) return;
    moveGroup(draggedGroupIndex, targetIndex);
    setDraggedGroupIndex(targetIndex);
  };

  const handleGroupDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleGroupDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggedGroupIndex(null);
  };

  const handleGroupDragEnd = () => {
    setDraggedGroupIndex(null);
  };

  // 초슬림 인라인 예수금 입금/출금/환전 핸들러 (팝업 없는 심플 UI)
  const handleExecuteInlineDeposit = () => {
    if (!account) return;

    if (inlineDepositType === 'FX') {
      const usdRate = quotes.usdKrw || 1350;
      const discountPct = account.fees?.fxDiscountPct !== undefined ? account.fees.fxDiscountPct : 95;
      const effectiveSpreadFactor = ((1 - discountPct / 100) * 1.0) / 100;

      if (fxDirection === 'USD_TO_KRW') {
        const usdVal = Number(fxAmount.replace(/[^0-9.]/g, ''));
        if (!usdVal || usdVal <= 0) {
          alert('환전할 달러($) 금액을 올바르게 입력해 주세요.');
          return;
        }
        const currentUsd = account.cashUsd || 0;
        if (usdVal > currentUsd) {
          alert(`보유 달러($${currentUsd.toLocaleString('en-US')})보다 큰 금액을 환전할 수 없습니다.`);
          return;
        }
        // 환율 우대 반영된 실질 환율 적용
        const effectiveRate = usdRate * (1 - effectiveSpreadFactor);
        const krwGain = Math.round(usdVal * effectiveRate);
        const nextUsd = Math.round((currentUsd - usdVal) * 100) / 100;
        const nextCash = (account.cash || 0) + krwGain;

        const newLog: CashDepositLog = {
          id: uid(),
          date: new Date().toISOString(),
          type: 'IN',
          amountKrw: krwGain,
          memo: `환전 반영: $${usdVal.toLocaleString('en-US')} ➔ ${krwGain.toLocaleString('ko-KR')}원 (우대 ${discountPct}%)`,
        };

        updateAccount({
          cash: nextCash,
          cashUsd: nextUsd,
          deposits: [newLog, ...(account.deposits || [])].slice(0, 200),
        });
        if (cashEditInitialRef.current) {
          cashEditInitialRef.current = { krw: nextCash, usd: nextUsd };
        }
      } else {
        const krwVal = Number(fxAmount.replace(/[^0-9]/g, ''));
        if (!krwVal || krwVal <= 0) {
          alert('환전할 원화 금액을 올바르게 입력해 주세요.');
          return;
        }
        const currentCash = account.cash || 0;
        if (krwVal > currentCash) {
          alert(`보유 원화(${currentCash.toLocaleString('ko-KR')}원)보다 큰 금액을 환전할 수 없습니다.`);
          return;
        }
        // 환율 우대 반영된 실질 환율 적용
        const effectiveRate = usdRate * (1 + effectiveSpreadFactor);
        const usdGain = Math.round((krwVal / effectiveRate) * 100) / 100;
        const nextCash = currentCash - krwVal;
        const nextUsd = Math.round(((account.cashUsd || 0) + usdGain) * 100) / 100;

        const newLog: CashDepositLog = {
          id: uid(),
          date: new Date().toISOString(),
          type: 'OUT',
          amountKrw: krwVal,
          memo: `환전 반영: ${krwVal.toLocaleString('ko-KR')}원 ➔ $${usdGain.toLocaleString('en-US')} (우대 ${discountPct}%)`,
        };

        updateAccount({
          cash: nextCash,
          cashUsd: nextUsd,
          deposits: [newLog, ...(account.deposits || [])].slice(0, 200),
        });
        if (cashEditInitialRef.current) {
          cashEditInitialRef.current = { krw: nextCash, usd: nextUsd };
        }
      }

      setFxAmount('');
      setIsInlineDepositOpen(false);
      return;
    }

    const amount = Number(inlineDepositAmount.replace(/[^0-9]/g, ''));
    if (!amount || amount <= 0) {
      alert('유효한 금액을 입력해 주세요.');
      return;
    }
    const currentCash = account.cash || 0;
    if (inlineDepositType === 'OUT' && amount > currentCash) {
      alert(`보유 원화 예수금(${currentCash.toLocaleString()}원)보다 큰 금액을 출금할 수 없습니다.`);
      return;
    }
    const nextCash = inlineDepositType === 'IN' ? currentCash + amount : currentCash - amount;
    const newLog: CashDepositLog = {
      id: uid(),
      date: new Date().toISOString(),
      type: inlineDepositType,
      amountKrw: amount,
      memo: inlineDepositType === 'IN' ? '자금 입금' : '자금 출금',
    };
    updateAccount({
      cash: nextCash,
      deposits: [newLog, ...(account.deposits || [])].slice(0, 200),
    });
    // 기준 잔액 동기화하여 편집 완료 시 '잔액 직접 조정' 이중 기록 방지
    if (cashEditInitialRef.current) {
      cashEditInitialRef.current = { krw: nextCash, usd: account.cashUsd || 0 };
    }
    setInlineDepositAmount('');
    setIsInlineDepositOpen(false);
  };

  // 매월 정기 적립금 원클릭 즉시 입금 반영 헬퍼
  const handleExecuteInstantDeposit = (depositAmount: number) => {
    if (!account || depositAmount <= 0) return;
    const currentCash = account.cash || 0;
    const nextCash = currentCash + depositAmount;
    const newLog: CashDepositLog = {
      id: uid(),
      date: new Date().toISOString(),
      type: 'IN',
      amountKrw: depositAmount,
      memo: '자금 입금',
    };
    updateAccount({
      cash: nextCash,
      deposits: [newLog, ...(account.deposits || [])].slice(0, 200),
    });
    if (cashEditInitialRef.current) {
      cashEditInitialRef.current = { krw: nextCash, usd: account.cashUsd || 0 };
    }
    setInlineDepositAmount('');
  };

  // 매월 정기 적립 목표금액 저장 헬퍼
  const handleSaveDepositGoal = () => {
    if (!account) return;
    const num = Number(typingDepositGoal.replace(/[^0-9]/g, ''));
    updateAccount({ monthlyDepositGoal: num > 0 ? num : undefined });
    if (num > 0 && !inlineDepositAmount) {
      setInlineDepositAmount(String(num));
    }
    setIsEditingDepositGoal(false);
  };

  const formatDepositGoalBadge = (val: number) => {
    if (val >= 10000 && val % 10000 === 0) {
      return `${(val / 10000).toLocaleString('ko-KR')}만 원`;
    }
    return won(val);
  };

  // 한국 주식 구매를 위한 원터치 맞춤 부분 환전 헬퍼
  const handleExecuteQuickFx = (usdToExchange: number) => {
    if (!account) return;
    const currentUsd = account.cashUsd || 0;
    const safeUsd = Math.min(currentUsd, Math.round(usdToExchange * 100) / 100);
    if (safeUsd <= 0) return;

    const usdRate = quotes.usdKrw || 1350;
    const krwGain = Math.round(safeUsd * usdRate);
    const nextUsd = Math.round((currentUsd - safeUsd) * 100) / 100;
    const nextCash = (account.cash || 0) + krwGain;

    const newLog: CashDepositLog = {
      id: uid(),
      date: new Date().toISOString(),
      type: 'IN',
      amountKrw: krwGain,
      memo: `맞춤 환전 반영: $${safeUsd} ➔ ${krwGain.toLocaleString()}원`,
    };

    updateAccount({
      cash: nextCash,
      cashUsd: nextUsd,
      deposits: [newLog, ...(account.deposits || [])].slice(0, 200),
    });
    if (cashEditInitialRef.current) {
      cashEditInitialRef.current = { krw: nextCash, usd: nextUsd };
    }
  };

  const handleRemoveDeposit = (logId: string) => {
    if (!account) return;
    const target = account.deposits?.find((d) => d.id === logId);
    if (!target) return;
    const rollbackCash = target.type === 'IN' ? (account.cash || 0) - target.amountKrw : (account.cash || 0) + target.amountKrw;
    if (rollbackCash < 0) {
      alert('입금 내역을 삭제하면 계좌 예수금이 음수가 되므로 삭제할 수 없습니다.');
      return;
    }
    updateAccount({
      cash: rollbackCash,
      deposits: (account.deposits || []).filter((d) => d.id !== logId),
    });
  };

  // 현금 직접 수정 시작 (초기 잔액 스냅샷 보존)
  const handleStartCashEdit = () => {
    if (account) {
      cashEditInitialRef.current = { krw: account.cash || 0, usd: account.cashUsd || 0 };
    }
    setIsEditingCash(true);
  };

  // 현금 직접 수정 완료 (차액 발생 시 오늘 날짜의 잔액 직접 조정 입출금 원장 기록 자동 생성)
  const handleFinishCashEdit = () => {
    if (account && cashEditInitialRef.current) {
      const usdRate = quotes.usdKrw || 1350;
      const prevTotalKrw = Math.round(cashEditInitialRef.current.krw + cashEditInitialRef.current.usd * usdRate);
      const curTotalKrw = Math.round((account.cash || 0) + (account.cashUsd || 0) * usdRate);
      const diffKrw = curTotalKrw - prevTotalKrw;

      if (Math.abs(diffKrw) >= 100) {
        const adjustLog: CashDepositLog = {
          id: uid(),
          date: new Date().toISOString(),
          type: diffKrw > 0 ? 'IN' : 'OUT',
          amountKrw: Math.abs(diffKrw),
          memo: diffKrw > 0 ? '잔액 직접 조정 (증액)' : '잔액 직접 조정 (감액)',
        };
        updateAccount({
          deposits: [adjustLog, ...(account.deposits || [])].slice(0, 200),
        });
      }
    }
    cashEditInitialRef.current = null;
    setIsEditingCash(false);
  };

  const addAccount = () => {
    if (!isPro && data.accounts.length >= 3) {
      openProPopover('account');
      return;
    }

    // 만약 기존에 번호 없는 '새 계좌'가 있다면 '새 계좌 1'로 보정하고 새 계좌는 '새 계좌 2'로 명명
    let currentAccounts = data.accounts;
    const unnumberedIndex = currentAccounts.findIndex((a) => a.name.trim() === '새 계좌');
    if (unnumberedIndex !== -1 && !currentAccounts.some((a) => a.name.trim() === '새 계좌 1')) {
      currentAccounts = currentAccounts.map((a, idx) => (idx === unnumberedIndex ? { ...a, name: '새 계좌 1' } : a));
    }

    // 이미 사용 중인 '새 계좌 N' 번호 탐색
    const usedNums = new Set<number>();
    for (const a of currentAccounts) {
      const match = a.name.trim().match(/^새\s*계좌\s*(\d+)$/);
      if (match) {
        usedNums.add(parseInt(match[1], 10));
      }
    }
    let n = 1;
    while (usedNums.has(n)) {
      n++;
    }
    const newName = `새 계좌 ${n}`;
    const a = newAccount(newName);
    allowEmptyOverwriteRef.current = false;
    setData((d) => ({ ...d, accounts: [...currentAccounts, a] }));
    setActiveId(a.id);
    setIsManagingAccounts(true);
    setEditingAccountId(a.id);
  };

  const renameAccount = (id: string, newName: string) => {
    const finalName = newName.slice(0, 20);
    const oldAcc = data.accounts.find((a) => a.id === id);
    const oldName = oldAcc?.name;
    setData((d) => ({
      ...d,
      accounts: d.accounts.map((a) => (a.id === id ? { ...a, name: finalName } : a)),
      logs: oldName && finalName.trim()
        ? d.logs.map((l) => (l.accountName === oldName ? { ...l, accountName: finalName.trim() } : l))
        : d.logs,
    }));
  };

  const handleAccountBlur = (id: string) => {
    const acc = data.accounts.find((a) => a.id === id);
    if (!acc || acc.name.trim()) return;
    // 입력창을 비워두고 나갔을 때 '새 계좌 1' 기본값으로 복원
    renameAccount(id, '새 계좌 1');
  };

  const removeAccount = (id: string) => {
    const target = data.accounts.find((a) => a.id === id);
    if (!target) return;
    if (!window.confirm(`'${target.name}' 계좌를 삭제할까요? 저장된 자산군과 보유 수량 및 매매 기록이 함께 정리됩니다.`)) return;

    // 되돌리기(Undo) 스냅샷 저장
    setLastUndoSnapshot({
      label: `${target.name} 계좌 삭제`,
      prevAccounts: data.accounts,
      createdLogIds: [],
      appliedGroupIds: [],
    });

    const remaining = data.accounts.filter((a) => a.id !== id);
    allowEmptyOverwriteRef.current = remaining.length === 0;

    setData((d) => {
      const accounts = d.accounts.filter((a) => a.id !== id);
      const logs = target ? d.logs.filter((l) => l.accountName !== target.name) : d.logs;
      return { ...d, accounts, logs };
    });
    if (remaining.length === 1) {
      setActiveId(remaining[0].id);
    } else {
      setActiveId('ALL');
    }
    if (remaining.length <= 1) {
      setIsManagingAccounts(false);
    }
  };

  // 모든 매매 기록 전체 비우기 (유령 기록 및 과거 데이터 완전 청소)
  const handleClearAllLogs = () => {
    if (data.logs.length === 0) return;
    if (window.confirm('저장된 모든 매매 기록을 비우시겠습니까?\n월별 실적과 최근 기록이 초기화됩니다.')) {
      setData((d) => ({ ...d, logs: [] }));
    }
  };

  // 자산군 직접 추가 핸들러 (등록 시점부터 보유 수량, 평단가, 구매일자 아카이빙)
  const handleAddDirectGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) return;
    const rawSym = newGroupSymbol.trim();
    if (!rawSym) return;

    const sym = normalizeSymbol(rawSym);
    const p = priceKrw(sym, quotes);
    const currentPrice = p || 0;

    const isCrypto = isCryptoSymbol(sym);
    const quoteEntry = quotes.quotes[sym];
    const isUsdAsset = quoteEntry?.currency === 'USD';
    const usdRate = quotes.usdKrw || 1350;

    const name = newGroupName.trim() || symbolName(sym, quotes) || sym;
    const weight = Math.min(100, Math.max(0, Number(newGroupWeight) || 0));
    const initQty = Math.max(0, Number(newGroupHoldings) || 0);
    const parsedAvgPrice = Number(newGroupAvgPrice.replace(/[^0-9]/g, ''));
    const initAvg = parsedAvgPrice > 0 ? parsedAvgPrice : currentPrice;
    const parsedUsd = Number(newGroupAvgPriceUsd);
    const initAvgUsd = isUsdAsset
      ? (parsedUsd > 0 ? parsedUsd : (initAvg > 0 ? Math.round((initAvg / usdRate) * 100) / 100 : 0))
      : 0;

    const newGid = uid();
    const newGroup: JournalGroup = {
      id: newGid,
      name,
      weight,
      symbols: [sym],
      buySymbol: sym,
      holdings: initQty > 0 ? { [sym]: initQty } : {},
      avgPrices: initAvg > 0 ? { [sym]: initAvg } : {},
      avgPricesUsd: initAvgUsd > 0 ? { [sym]: initAvgUsd } : undefined,
    };

    let nextLogs = data.logs;
    let nextDeposits = account.deposits || [];
    if (initQty > 0) {
      const effectiveTradeDate = newGroupTradeDate || getLocalDateString();
      const buyAmountKrw = Math.round(initQty * (initAvg || currentPrice));
      const newLog: JournalLog = {
        id: uid(),
        date: effectiveTradeDate,
        accountName: account.name,
        items: [
          {
            name,
            symbol: sym,
            qty: initQty,
            amountKrw: buyAmountKrw,
          },
        ],
        type: 'BUY',
      };
      nextLogs = [newLog, ...data.logs].slice(0, 300);

      // 초기 보유 자산 등록 시 해당 구매일 날짜로 자동 입금 원장 기록 동기화
      const autoDeposit: CashDepositLog = {
        id: uid(),
        date: effectiveTradeDate,
        type: 'IN',
        amountKrw: buyAmountKrw,
        memo: `자동 입금 · 초기 자산 등록 (${name})`,
      };
      nextDeposits = [autoDeposit, ...nextDeposits].slice(0, 200);
    }

    setData((d) => ({
      accounts: d.accounts.map((a) =>
        a.id === account.id ? { ...a, groups: [newGroup, ...a.groups], deposits: nextDeposits } : a
      ),
      logs: nextLogs,
    }));

    setNewGroupName('');
    setNewGroupSymbol('');
    setNewGroupWeight('');
    setNewGroupHoldings('');
    setNewGroupAvgPrice('');
    setNewGroupAvgPriceUsd('');
    setNewGroupTradeDate(getLocalDateString());
    setNewGroupSymbolInfo(null);
    setIsSearchingSymbol(false);
    setSymbolSearchError(null);
    setIsAddGroupOpen(false);
  };

  const addSymbolToGroup = (g: JournalGroup, rawSym: string) => {
    const sym = normalizeSymbol(rawSym);
    if (!sym || g.symbols.includes(sym)) return;
    const p = priceKrw(sym, quotes);
    const currentPrice = p || 0;

    const nextAvg = { ...(g.avgPrices || {}) };
    if (currentPrice > 0 && !nextAvg[sym]) {
      nextAvg[sym] = currentPrice;
    }

    updateGroup(g.id, {
      symbols: [...g.symbols, sym],
      avgPrices: nextAvg,
    });
    setExpandedAddSymbolGroupId(null);
  };

  // 종목 인라인 수량/단가 편집 완료 핸들러 (수량 증감에 따른 BUY/SELL 매매 기록 자동 생성)
  const handleFinishEditingSymbol = (g: JournalGroup, sym: string) => {
    // typingHoldings에 버퍼가 남아있는 경우 반영
    const rawHolding = typingHoldings[sym];
    let currentQty = g.holdings[sym] || 0;
    if (rawHolding !== undefined) {
      const n = Number(rawHolding);
      currentQty = Number.isFinite(n) ? Math.max(0, n) : 0;
      updateGroup(g.id, {
        holdings: { ...g.holdings, [sym]: currentQty },
      });
      setTypingHoldings((prev) => {
        const next = { ...prev };
        delete next[sym];
        return next;
      });
    }

    const initial = symbolEditInitialRef.current;
    if (initial && initial.symbol === sym) {
      const deltaQty = currentQty - initial.qty;
      // 수량 변화가 있는 경우 매매 기록 자동 생성 (방식 A: 예수금 이중 변동 없이 매매 기록만 생성)
      if (Math.abs(deltaQty) > 1e-6) {
        const isBuy = deltaQty > 0;
        const absQty = Math.abs(deltaQty);
        const p = priceKrw(sym, quotes);
        const itemPrice = p || g.avgPrices?.[sym] || 0;
        const totalAmount = Math.round(absQty * itemPrice);
        const isCrypto = isCryptoSymbol(sym);
        const unit = getSymbolUnit(sym);
        const sName = symbolName(sym, quotes) || sym;
        const todayStr = getLocalDateString();

        // 실현 손익 계산 (판매 시)
        let realizedProfit = 0;
        if (!isBuy && initial.avgPriceKrw > 0 && itemPrice > 0) {
          realizedProfit = Math.round((itemPrice - initial.avgPriceKrw) * absQty);
        }

        const newLog: JournalLog = {
          id: `log-edit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          date: todayStr,
          accountId: account?.id || '',
          accountName: account?.name || '',
          type: isBuy ? 'BUY' : 'SELL',
          realizedProfit: !isBuy ? realizedProfit : undefined,
          items: [
            {
              symbol: sym,
              name: sName,
              qty: isBuy ? absQty : -absQty,
              price: itemPrice,
              amountKrw: isBuy ? totalAmount : -totalAmount,
            },
          ],
        };

        setData((prev) => ({
          ...prev,
          logs: [newLog, ...prev.logs],
        }));

        setLastUndoSnapshot({
          label: `${sName} ${formatQuantity(absQty, isCrypto)}${unit} 수량 직접 ${isBuy ? '구매' : '판매'}`,
          prevAccounts: data.accounts,
          createdLogIds: [newLog.id],
          appliedGroupIds: [],
        });
      }
    }

    symbolEditInitialRef.current = null;
    setEditingSymbol(null);
  };

  const removeSymbolFromGroup = (g: JournalGroup, sym: string) => {
    if (g.symbols.length <= 1) {
      alert('자산군에 최소 한 개 종목은 있어야 합니다.');
      return;
    }
    const sName = symbolName(sym, quotes) || sym;
    const holdQty = g.holdings[sym] || 0;
    const isCrypto = isCryptoSymbol(sym);
    const unit = getSymbolUnit(sym);

    const confirmMsg = holdQty > 0
      ? `'${sName}' 종목을 이 자산군에서 삭제할까요?\n(보유 중인 ${formatQuantity(holdQty, isCrypto)}${unit} 전량 판매 기록이 자동으로 생성됩니다)`
      : `'${sName}' 종목을 이 자산군에서 삭제할까요?`;

    if (!window.confirm(confirmMsg)) {
      return;
    }

    const createdLogIds: string[] = [];
    let nextLogs = data.logs;
    let nextCash = account?.cash || 0;

    // 만약 보유 수량이 있었다면 전량 판매 거래 기록 생성 및 판매 대금 현금(예수금) 입금
    if (holdQty > 0) {
      const p = priceKrw(sym, quotes) || g.avgPrices?.[sym] || 0;
      const totalAmount = Math.round(holdQty * p);
      const avgPrice = g.avgPrices?.[sym] || p;
      const realizedProfit = Math.round((p - avgPrice) * holdQty);
      const todayStr = getLocalDateString();
      nextCash += totalAmount;

      const sellLog: JournalLog = {
        id: `log-del-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        date: todayStr,
        accountId: account?.id || '',
        accountName: account?.name || '',
        type: 'SELL',
        realizedProfit,
        items: [
          {
            symbol: sym,
            name: sName,
            qty: -holdQty,
            price: p,
            amountKrw: -totalAmount,
          },
        ],
      };
      createdLogIds.push(sellLog.id);
      nextLogs = [sellLog, ...nextLogs];
    }

    // 실수 삭제 복원용 되돌리기(Undo) 스냅샷 저장
    setLastUndoSnapshot({
      label: `${sName} 종목 삭제${holdQty > 0 ? ' (전량 판매)' : ''}`,
      prevAccounts: data.accounts,
      createdLogIds,
      appliedGroupIds: [],
    });

    const nextSymbols = g.symbols.filter((s) => s !== sym);
    const nextBuy = g.buySymbol === sym ? nextSymbols[0] : g.buySymbol;
    const nextHoldings = { ...g.holdings };
    delete nextHoldings[sym];
    const nextAvg = { ...(g.avgPrices || {}) };
    delete nextAvg[sym];

    setData((prev) => ({
      ...prev,
      accounts: prev.accounts.map((a) =>
        a.id === account?.id
          ? {
              ...a,
              cash: nextCash,
              groups: a.groups.map((grp) =>
                grp.id === g.id
                  ? { ...grp, symbols: nextSymbols, buySymbol: nextBuy, holdings: nextHoldings, avgPrices: nextAvg }
                  : grp
              ),
            }
          : a
      ),
      logs: nextLogs,
    }));
  };

  const removeGroup = (gid: string) => {
    if (!account) return;
    const targetGroup = account.groups.find((g) => g.id === gid);
    const gName = targetGroup?.name || '자산군';
    if (!window.confirm(`'${gName}' 자산군을 삭제할까요? 포함된 모든 종목이 함께 삭제됩니다.`)) {
      return;
    }

    const createdLogIds: string[] = [];
    let nextLogs = data.logs;
    const todayStr = getLocalDateString();

    // 자산군에 속한 종목들 중 보유 수량이 있는 종목들의 전량 판매 기록 생성
    if (targetGroup) {
      for (const sym of targetGroup.symbols) {
        const holdQty = targetGroup.holdings[sym] || 0;
        if (holdQty > 0) {
          const p = priceKrw(sym, quotes) || targetGroup.avgPrices?.[sym] || 0;
          const totalAmount = Math.round(holdQty * p);
          const avgPrice = targetGroup.avgPrices?.[sym] || p;
          const realizedProfit = Math.round((p - avgPrice) * holdQty);
          const sName = symbolName(sym, quotes) || sym;

          const sellLog: JournalLog = {
            id: `log-delgrp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            date: todayStr,
            accountId: account.id,
            accountName: account.name,
            type: 'SELL',
            realizedProfit,
            items: [
              {
                symbol: sym,
                name: sName,
                qty: -holdQty,
                price: p,
                amountKrw: -totalAmount,
              },
            ],
          };
          createdLogIds.push(sellLog.id);
          nextLogs = [sellLog, ...nextLogs];
        }
      }
    }

    // 실수 삭제 복원용 되돌리기(Undo) 스냅샷 저장
    setLastUndoSnapshot({
      label: `${gName} 자산군 삭제`,
      prevAccounts: data.accounts,
      createdLogIds,
      appliedGroupIds: [],
    });

    setData((prev) => ({
      ...prev,
      accounts: prev.accounts.map((a) =>
        a.id === account.id
          ? {
              ...a,
              groups: a.groups.filter((g) => g.id !== gid),
            }
          : a
      ),
      logs: nextLogs,
    }));
  };

  const handleRemoveLog = (logId: string) => {
    const baseId = logId.includes('-') && /-\d+$/.test(logId) ? logId.replace(/-\d+$/, '') : logId;
    setData((d) => ({
      ...d,
      logs: d.logs.filter((l) => l.id !== logId && l.id !== baseId),
    }));
  };

  // 계산 및 요약 집계
  const plan = useMemo(
    () => (account ? calcPlan(account, quotes, { prioritizeSubAssetLiquidation }) : null),
    [account, quotes, prioritizeSubAssetLiquidation]
  );
  const currentSummary = useMemo(() => {
    if (activeId === 'ALL') {
      return calcAllAccountsSummary(data.accounts, quotes);
    }
    return account ? calcPortfolioSummary(account, quotes) : null;
  }, [activeId, account, data.accounts, quotes]);

  // 그래프용 세그먼트 데이터 구성
  const barSegments = useMemo(() => {
    if (!currentSummary || currentSummary.totalAssetsKrw <= 0) return [];
    const segs: { label: string; pct: number; color: string; amountKrw: number }[] = [];

    currentSummary.groupItems.forEach((g, idx) => {
      segs.push({
        label: g.groupName,
        pct: g.currentPct,
        color: PALETTE_COLORS[idx % PALETTE_COLORS.length],
        amountKrw: g.evalKrw,
      });
    });

    if (currentSummary.cashWeightPct > 0.1) {
      segs.push({
        label: '현금',
        pct: currentSummary.cashWeightPct,
        color: '#94A3B8', // Muted Gray
        amountKrw: currentSummary.cashKrw,
      });
    }

    return segs;
  }, [currentSummary]);

  // 전체 계획 반영 시 필요한 총 구매 금액 및 현금 부족 종합 판별 (판매 대금 유입 상계 반영)
  const cashShortageState = useMemo(() => {
    if (!account || !plan || plan.lines.length === 0) return null;
    const usdRate = quotes.usdKrw || 1350;
    const currentTotalCashKrw = (account.cash || 0) + Math.floor((account.cashUsd || 0) * usdRate);

    // 아직 반영되지 않은 항목 중, 판매 항목으로 들어올 예상 대금과 구매 항목에 필요한 대금 각각 계산
    let expectedSellProceedsKrw = 0;
    let totalNeededKrw = 0;
    for (const l of plan.lines) {
      if (appliedLineGroupIds.includes(l.groupId)) continue;
      const customVal = customQuantities[l.groupId];
      const effectiveQty = customVal !== undefined ? customVal : l.qty;

      if (effectiveQty > 0) {
        totalNeededKrw += Math.round(effectiveQty * l.priceKrw);
      } else if (effectiveQty < 0) {
        expectedSellProceedsKrw += Math.round(Math.abs(effectiveQty) * l.priceKrw);
      }
    }

    const availableTotalCashKrw = currentTotalCashKrw + expectedSellProceedsKrw;

    if (totalNeededKrw > availableTotalCashKrw) {
      return {
        isShortage: true,
        neededKrw: totalNeededKrw,
        availableKrw: availableTotalCashKrw,
        shortageKrw: totalNeededKrw - availableTotalCashKrw,
      };
    }
    return null;
  }, [account, plan, quotes, appliedLineGroupIds, customQuantities]);

  // 단일 자산 행 반영 (선택적 체결 - 사용자가 수정한 수량/금액 반영 지원)
  const applySingleLine = (line: PlanLine, overrideQty?: number, overrideAmountKrw?: number) => {
    if (!account) return;

    const g = account.groups.find((group) => group.id === line.groupId);
    if (!g) return;

    const sym = line.symbol;
    const oldQty = g.holdings[sym] || 0;
    const tradeQty = overrideQty !== undefined ? overrideQty : line.qty;
    if (tradeQty === 0) return;

    const tradePrice = line.priceKrw;
    const tradeAmount = overrideAmountKrw !== undefined ? overrideAmountKrw : Math.round(tradeQty * tradePrice);
    const currentAvg = g.avgPrices?.[sym] || tradePrice;
    const isCrypto = isCryptoSymbol(sym);
    const quoteEntry = quotes.quotes[sym];
    const isUsdAsset = quoteEntry?.currency === 'USD';
    const usdRate = quotes.usdKrw || 1350;
    const itemPrice = isUsdAsset
      ? (quoteEntry?.price || (g.avgPricesUsd?.[sym] ?? (line.priceKrw / usdRate)))
      : line.priceKrw;

    // 수수료 및 자동 환전(통합증거금) 정밀 결제 계산
    const settlement = calculateTradeSettlement({
      symbol: sym,
      tradeQty,
      price: itemPrice,
      isUsdAsset,
      currency: quoteEntry?.currency,
      currentHoldings: oldQty,
      currentAvgKrw: g.avgPrices?.[sym],
      currentAvgUsd: g.avgPricesUsd?.[sym],
      currentCashKrw: account.cash || 0,
      currentCashUsd: account.cashUsd || 0,
      fees: account.fees,
      usdRate,
    });

    const nextQty = Math.max(0, oldQty + tradeQty);
    const roundedQty = isCrypto
      ? Math.round(nextQty * 1e8) / 1e8
      : Math.round(nextQty * 1e4) / 1e4;

    // 구매 시 수수료 포함 총 필요 금액 대비 가용 현금 검증
    const totalAvailableCashKrw = (account.cash || 0) + Math.floor((account.cashUsd || 0) * usdRate);
    if (tradeQty > 0 && settlement.totalCostKrw > totalAvailableCashKrw) {
      alert(`보유 현금(${won(totalAvailableCashKrw)})이 부족하여 주식을 구매할 수 없습니다. (수수료 포함 필요 금액: ${won(settlement.totalCostKrw)})\n현금을 충전하거나 구매 수량을 줄여주세요.`);
      return;
    }

    const updatedGroups = account.groups.map((group) => {
      if (group.id !== g.id) return group;
      return {
        ...group,
        holdings: { ...group.holdings, [sym]: roundedQty },
        avgPrices: { ...(group.avgPrices || {}), [sym]: settlement.newAvgKrw },
        ...(isUsdAsset && settlement.newAvgUsd !== undefined
          ? { avgPricesUsd: { ...(group.avgPricesUsd || {}), [sym]: settlement.newAvgUsd } }
          : {}),
      };
    });

    const nextCash = settlement.nextCash;
    const nextCashUsd = settlement.nextCashUsd;

    const newItem = {
      name: line.groupName,
      symbol: line.symbol,
      qty: tradeQty,
      amountKrw: settlement.tradeAmountKrw,
    };

    // 항상 1종목 1로그 독립 레코드로 생성 (타 종목과 합치지 않아 개별 삭제 지원)
    const newLogId = uid();
    const newLog: JournalLog = {
      id: newLogId,
      date: new Date().toISOString(),
      accountName: account.name,
      items: [newItem],
      type: tradeQty < 0 ? 'SELL' : 'BUY',
      realizedProfit: settlement.realizedProfitKrw !== 0 ? settlement.realizedProfitKrw : undefined,
      profitRate: settlement.realizedProfitRate !== null && settlement.realizedProfitRate !== undefined ? settlement.realizedProfitRate : undefined,
    };
    const nextLogs = [newLog, ...data.logs].slice(0, 500);

    // 실행 취소용 스냅샷 저장
    const prevAccountsBackup: JournalAccount[] = JSON.parse(JSON.stringify(data.accounts));
    const prevAppliedIds = [...appliedLineGroupIds];

    setData((d) => ({
      accounts: d.accounts.map((a) =>
        a.id === account.id ? { ...a, groups: updatedGroups, cash: nextCash, cashUsd: nextCashUsd } : a
      ),
      logs: nextLogs,
    }));

    const singleLineKey = `${line.groupId}-${line.symbol}`;
    setAppliedLineGroupIds((prev) => (prev.includes(singleLineKey) ? prev : [...prev, singleLineKey, line.groupId]));

    setLastUndoSnapshot({
      label: `${line.symbol} ${tradeQty < 0 ? '판매' : '구매'}`,
      prevAccounts: prevAccountsBackup,
      createdLogIds: [newLogId],
      appliedGroupIds: prevAppliedIds,
    });
  };

  // 남은 모든 항목 일괄 반영 (항상 1종목 1로그로 개별 분리 생성하여 개별 삭제 지원)
  const applyRemainingPlan = () => {
    if (!account || !plan) return;
    const unappliedLines = plan.lines.filter((l) => !appliedLineGroupIds.includes(l.groupId));
    if (unappliedLines.length === 0) return;

    // 실행 취소용 스냅샷 저장
    const prevAccountsBackup: JournalAccount[] = JSON.parse(JSON.stringify(data.accounts));
    const prevAppliedIds = [...appliedLineGroupIds];

    let currentCash = account.cash || 0;
    let currentCashUsd = account.cashUsd || 0;
    const usdRate = quotes.usdKrw || 1350;

    // 전체 반영 대상 항목들의 순 구매 필요 금액(판매 대금 상계 반영 및 거래 수수료 포함) 및 가용 현금 검증
    const totalAvailableCashKrw = currentCash + Math.floor(currentCashUsd * usdRate);
    let netBuyNeededKrw = 0;
    for (const line of unappliedLines) {
      const customQty = customQuantities[line.groupId];
      const tradeQty = customQty !== undefined ? customQty : line.qty;
      const isCrypto = isCryptoSymbol(line.symbol);
      const isUsd = !isCrypto && line.symbol !== 'GOLD_1G' && !/^\d{6}$/.test(line.symbol);
      const feePct = isUsd
        ? (account.fees?.usFeePct !== undefined ? account.fees.usFeePct : 0.07)
        : (account.fees?.krFeePct !== undefined ? account.fees.krFeePct : 0.015);
      const feeFactor = 1 + (tradeQty > 0 ? feePct / 100 : -feePct / 100);
      netBuyNeededKrw += Math.round(tradeQty * line.priceKrw * feeFactor);
    }

    if (netBuyNeededKrw > totalAvailableCashKrw) {
      alert(`보유 현금(${won(totalAvailableCashKrw)})이 부족하여 전체 매매를 반영할 수 없습니다. (수수료 포함 순 필요 금액: ${won(netBuyNeededKrw)})\n현금을 충전하거나 구매 수량을 조절해 주세요.`);
      return;
    }

    let updatedGroups = [...account.groups];
    const newLogs: JournalLog[] = [];

    // 판매(SELL)를 먼저 실행하여 현금을 계좌에 채운 뒤, 구매(BUY)를 실행하여 현금 잔고 무결성 보장
    const sortedLinesToApply = [...unappliedLines].sort((a, b) => {
      const aQty = customQuantities[a.groupId] !== undefined ? customQuantities[a.groupId] : a.qty;
      const bQty = customQuantities[b.groupId] !== undefined ? customQuantities[b.groupId] : b.qty;
      if (aQty < 0 && bQty >= 0) return -1;
      if (aQty >= 0 && bQty < 0) return 1;
      return 0;
    });

    for (let idx = 0; idx < sortedLinesToApply.length; idx++) {
      const line = sortedLinesToApply[idx];
      const g = updatedGroups.find((group) => group.id === line.groupId);
      if (!g) continue;

      const sym = line.symbol;
      const oldQty = g.holdings[sym] || 0;
      const lineKey = `${line.groupId}-${line.symbol}`;
      const customQty = customQuantities[lineKey] !== undefined ? customQuantities[lineKey] : customQuantities[line.groupId];
      const tradeQty = customQty !== undefined ? customQty : line.qty;
      if (tradeQty === 0) continue;

      const isCrypto = isCryptoSymbol(sym);
      const quoteEntry = quotes.quotes[sym];
      const isUsdAsset = quoteEntry?.currency === 'USD';
      const itemPrice = isUsdAsset
        ? (quoteEntry?.price || (g.avgPricesUsd?.[sym] ?? (line.priceKrw / usdRate)))
        : line.priceKrw;

      const settlement = calculateTradeSettlement({
        symbol: sym,
        tradeQty,
        price: itemPrice,
        isUsdAsset,
        currency: quoteEntry?.currency,
        currentHoldings: oldQty,
        currentAvgKrw: g.avgPrices?.[sym],
        currentAvgUsd: g.avgPricesUsd?.[sym],
        currentCashKrw: currentCash,
        currentCashUsd,
        fees: account.fees,
        usdRate,
      });

      currentCash = settlement.nextCash;
      currentCashUsd = settlement.nextCashUsd;

      const nextQty = Math.max(0, oldQty + tradeQty);
      const roundedQty = isCrypto
        ? Math.round(nextQty * 1e8) / 1e8
        : Math.round(nextQty * 1e4) / 1e4;

      updatedGroups = updatedGroups.map((group) => {
        if (group.id !== g.id) return group;
        return {
          ...group,
          holdings: { ...group.holdings, [sym]: roundedQty },
          avgPrices: { ...(group.avgPrices || {}), [sym]: settlement.newAvgKrw },
          ...(isUsdAsset && settlement.newAvgUsd !== undefined
            ? { avgPricesUsd: { ...(group.avgPricesUsd || {}), [sym]: settlement.newAvgUsd } }
            : {}),
        };
      });

      // 각 종목마다 독립적인 1건의 JournalLog 생성!
      newLogs.push({
        id: `${uid()}-${idx}`,
        date: new Date().toISOString(),
        accountName: account.name,
        items: [{
          name: line.groupName,
          symbol: line.symbol,
          qty: tradeQty,
          amountKrw: settlement.tradeAmountKrw,
        }],
        type: tradeQty < 0 ? 'SELL' : 'BUY',
        realizedProfit: settlement.realizedProfitKrw !== 0 ? settlement.realizedProfitKrw : undefined,
        profitRate: settlement.realizedProfitRate !== null && settlement.realizedProfitRate !== undefined ? settlement.realizedProfitRate : undefined,
      });
    }

    const nextLogs = [...newLogs, ...data.logs].slice(0, 500);

    // 일괄 반영 시 budget(신규 입금액)도 0으로 초기화
    setData((d) => ({
      accounts: d.accounts.map((a) =>
        a.id === account.id ? { ...a, groups: updatedGroups, cash: currentCash, cashUsd: currentCashUsd } : a
      ),
      logs: nextLogs,
    }));

    setAppliedLineGroupIds(plan.lines.map((l) => `${l.groupId}-${l.symbol}`));

    setLastUndoSnapshot({
      label: `${newLogs.length}개 종목 매매 내역`,
      prevAccounts: prevAccountsBackup,
      createdLogIds: newLogs.map((l) => l.id),
      appliedGroupIds: prevAppliedIds,
    });
  };

  // 방금 수행한 매매 반영 실행 취소 (되돌리기)
  const handleUndoLastAction = () => {
    if (!lastUndoSnapshot) return;
    setData((d) => ({
      accounts: lastUndoSnapshot.prevAccounts,
      logs: d.logs.filter((l) => !lastUndoSnapshot.createdLogIds.includes(l.id)),
    }));
    setAppliedLineGroupIds(lastUndoSnapshot.appliedGroupIds);
    dismissUndo();
  };

  // 종목별 수동 거래 직접 기록 (가이드와 무관하게 사용자가 임의로 사고판 내역)
  const handleExecuteManualTrade = (groupId: string, symbol: string) => {
    if (!account) return;
    const g = account.groups.find((group) => group.id === groupId);
    if (!g) return;

    const isCrypto = isCryptoSymbol(symbol);
    const quoteEntry = quotes.quotes[symbol];
    const isUsdAsset = quoteEntry?.currency === 'USD';
    const usdRate = quotes.usdKrw || 1350;

    const qtyNum = Number(manualTradeQty);
    // 달러 자산이면 소수점 포함 파싱, 원화 자산이면 정수 파싱
    const priceNum = isUsdAsset
      ? Number(manualTradePrice)
      : Number(manualTradePrice.replace(/[^0-9]/g, ''));

    if (!qtyNum || qtyNum <= 0 || !priceNum || priceNum <= 0) {
      alert('유효한 수량과 가격을 입력해 주세요.');
      return;
    }

    const tradeQty = manualTradeType === 'SELL' ? -qtyNum : qtyNum;
    const oldQty = g.holdings[symbol] || 0;

    if (manualTradeType === 'SELL' && qtyNum > oldQty) {
      alert(`보유 수량(${oldQty})보다 많이 판매할 수 없습니다.`);
      return;
    }

    // 수수료 및 자동 환전(통합증거금) 정밀 결제 계산
    const settlement = calculateTradeSettlement({
      symbol,
      tradeQty,
      price: priceNum,
      isUsdAsset,
      currency: quoteEntry?.currency,
      currentHoldings: oldQty,
      currentAvgKrw: g.avgPrices?.[symbol],
      currentAvgUsd: g.avgPricesUsd?.[symbol],
      currentCashKrw: account.cash || 0,
      currentCashUsd: account.cashUsd || 0,
      fees: account.fees,
      usdRate,
    });

    const nextQty = Math.max(0, oldQty + tradeQty);
    const roundedQty = isCrypto
      ? Math.round(nextQty * 1e8) / 1e8
      : Math.round(nextQty * 1e4) / 1e4;

    const updatedGroups = account.groups.map((group) => {
      if (group.id !== g.id) return group;
      return {
        ...group,
        holdings: { ...group.holdings, [symbol]: roundedQty },
        avgPrices: { ...(group.avgPrices || {}), [symbol]: Math.round(settlement.newAvgKrw) },
        ...(isUsdAsset && settlement.newAvgUsd !== undefined
          ? { avgPricesUsd: { ...(group.avgPricesUsd || {}), [symbol]: Math.round(settlement.newAvgUsd * 100) / 100 } }
          : {}),
      };
    });

    const nextCash = settlement.nextCash;
    const nextCashUsd = settlement.nextCashUsd;

    const sName = symbolName(symbol, quotes) || g.name;
    const newItem = {
      name: sName,
      symbol,
      qty: tradeQty,
      amountKrw: settlement.tradeAmountKrw,
    };

    // 선택한 거래 일자 기준으로 동일 계좌 매매 자동 병합
    // 오늘 이전 날짜의 과거 기록 등록은 예수금을 건드리지 않고 종목 수량·평단·기록만 반영
    const effectiveTradeDate = manualTradeDate || getLocalDateString();
    const isPastTrade = effectiveTradeDate < getLocalDateString();
    const existingIndex = data.logs.findIndex((l) => {
      const lDate = formatLogDate(l.date);
      return lDate === effectiveTradeDate && l.accountName === account.name && !!l.cashNeutral === isPastTrade;
    });

    let nextLogs: JournalLog[];
    if (existingIndex >= 0) {
      const target = data.logs[existingIndex];
      const updatedItems = [...target.items];
      const itemIdx = updatedItems.findIndex((it) => it.symbol === newItem.symbol);
      if (itemIdx >= 0) {
        const prev = updatedItems[itemIdx];
        updatedItems[itemIdx] = {
          ...prev,
          qty: prev.qty + newItem.qty,
          amountKrw: prev.amountKrw + newItem.amountKrw,
        };
      } else {
        updatedItems.push(newItem);
      }

      const totalRealized = (target.realizedProfit || 0) + (settlement.realizedProfitKrw || 0);
      const hasSell = updatedItems.some((it) => it.qty < 0);
      const hasBuy = updatedItems.some((it) => it.qty > 0);

      const mergedLog: JournalLog = {
        ...target,
        items: updatedItems,
        type: hasSell && hasBuy ? 'MIXED' : hasSell ? 'SELL' : 'BUY',
        realizedProfit: totalRealized !== 0 ? totalRealized : undefined,
      };

      nextLogs = [...data.logs];
      nextLogs[existingIndex] = mergedLog;
    } else {
      const newLog: JournalLog = {
        id: uid(),
        date: effectiveTradeDate,
        accountName: account.name,
        items: [newItem],
        type: tradeQty < 0 ? 'SELL' : 'BUY',
        realizedProfit: settlement.realizedProfitKrw !== 0 ? settlement.realizedProfitKrw : undefined,
        profitRate: settlement.realizedProfitRate !== null && settlement.realizedProfitRate !== undefined ? settlement.realizedProfitRate : undefined,
        ...(isPastTrade ? { cashNeutral: true } : {}),
      };
      nextLogs = [newLog, ...data.logs].slice(0, 300);
    }

    const shortageKrw = isPastTrade ? 0 : (settlement.shortageKrw || 0);
    let nextDeposits = account.deposits || [];
    if (shortageKrw > 0) {
      const autoDeposit: CashDepositLog = {
        id: uid(),
        date: effectiveTradeDate,
        type: 'IN',
        amountKrw: shortageKrw,
        memo: `자동 입금 · 잔액 부족분 (${sName} 구매)`,
      };
      nextDeposits = [autoDeposit, ...nextDeposits].slice(0, 200);
    }

    setData((d) => ({
      accounts: d.accounts.map((a) =>
        a.id === account.id
          ? {
              ...a,
              groups: updatedGroups,
              cash: isPastTrade ? a.cash : nextCash,
              cashUsd: isPastTrade ? a.cashUsd : nextCashUsd,
              deposits: nextDeposits,
            }
          : a
      ),
      logs: nextLogs,
    }));

    // 입력 폼 리셋
    setManualTradeSymbol(null);
    setManualTradeQty('');
    setManualTradePrice('');
  };

  const allLogsForAccount = account
    ? data.logs.filter((l) => l.accountName === account.name)
    : data.logs;

  // 계좌의 전체 거래 기록 최신순(내림차순) 정렬 (데이터는 영구 안전 보존)
  const allSortedLogs = useMemo(() => {
    return [...allLogsForAccount].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [allLogsForAccount]);

  // 화면 표시 목록: PRO는 전체 무제한, 무료 회원은 최신 10건만 노출
  const displayedLogs = useMemo(() => {
    return isPro ? allSortedLogs : allSortedLogs.slice(0, 10);
  }, [allSortedLogs, isPro]);

  // 무료 회원에게 숨겨진 과거 기록 수 (10건 초과분)
  const hiddenLogsCount = !isPro ? Math.max(0, allSortedLogs.length - 10) : 0;

  // 월별 실적 집계용 전체 정렬 로그 호환
  const logsForAccount = allSortedLogs;

  // 전체 탭 매매 기록 정렬 및 표시용 (무료 회원 최신 10건만 노출, 데이터는 영구 보존)
  const allSortedOverviewLogs = useMemo(() => {
    return flattenLogs(data.logs).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [data.logs]);

  const displayedOverviewLogs = useMemo(() => {
    return isPro ? allSortedOverviewLogs : allSortedOverviewLogs.slice(0, 10);
  }, [allSortedOverviewLogs, isPro]);

  const hiddenOverviewLogsCount = !isPro ? Math.max(0, allSortedOverviewLogs.length - 10) : 0;

  // PRO 전용 매매 기록 CSV 엑셀 내보내기 (수동 삭제된 항목 및 다른 계좌 완벽 제외된 allSortedLogs 기준)
  const exportToCsv = (target: 'csv-logs' | 'csv-archive' = 'csv-logs') => {
    if (!isPro) {
      openProPopover(target);
      return;
    }
    if (allSortedLogs.length === 0) {
      alert('내보낼 매매 기록이 없습니다.');
      return;
    }

    const headers = ['날짜', '계좌명', '종목명', '종목코드', '수량', '거래금액(원)', '구분', '실현손익(원)'];
    const rows = allSortedLogs.flatMap((l) =>
      l.items.map((i) => [
        `"${formatDisplayDate(l.date)}"`,
        `"${l.accountName}"`,
        `"${i.name}"`,
        `"${i.symbol}"`,
        i.qty,
        Math.abs(i.amountKrw),
        i.qty < 0 ? '판매' : '구매',
        l.realizedProfit !== undefined ? l.realizedProfit : '',
      ])
    );

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `jusik_journal_records_${getLocalDateString()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // 월별 매매 실적 집계 (실제 사용자 기록 기반)
  const monthlyTradeStats = useMemo(() => {
    const map: Record<
      string,
      {
        monthStr: string;
        buyAmount: number;
        sellAmount: number;
        realizedProfit: number;
        tradeCount: number;
      }
    > = {};

    logsForAccount.forEach((l) => {
      const ymd = formatLogDate(l.date);
      if (!ymd) return;
      const monthKey = `${ymd.slice(0, 4)}.${ymd.slice(5, 7)}`;
      if (!map[monthKey]) {
        map[monthKey] = {
          monthStr: monthKey,
          buyAmount: 0,
          sellAmount: 0,
          realizedProfit: 0,
          tradeCount: 0,
        };
      }
      map[monthKey].tradeCount += 1;
      if (l.realizedProfit) {
        map[monthKey].realizedProfit += l.realizedProfit;
      }
      l.items.forEach((it) => {
        if (it.qty > 0) {
          map[monthKey].buyAmount += Math.abs(it.amountKrw);
        } else {
          map[monthKey].sellAmount += Math.abs(it.amountKrw);
        }
      });
    });

    return Object.values(map).sort((a, b) => b.monthStr.localeCompare(a.monthStr));
  }, [logsForAccount]);

  // 월별 입출금 현황 집계 (실제 사용자 입출금 기록 기반)
  const monthlyDepositStats = useMemo(() => {
    const depositsList = account
      ? account.deposits || []
      : data.accounts.flatMap((a) => a.deposits || []);
    if (depositsList.length === 0) return [];

    const map: Record<string, { monthStr: string; inAmount: number; outAmount: number; netAmount: number }> = {};
    depositsList.forEach((dep) => {
      const d = new Date(dep.date);
      if (isNaN(d.getTime())) return;
      const monthKey = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!map[monthKey]) {
        map[monthKey] = { monthStr: monthKey, inAmount: 0, outAmount: 0, netAmount: 0 };
      }
      if (dep.type === 'IN') {
        map[monthKey].inAmount += dep.amountKrw;
        map[monthKey].netAmount += dep.amountKrw;
      } else {
        map[monthKey].outAmount += dep.amountKrw;
        map[monthKey].netAmount -= dep.amountKrw;
      }
    });
    return Object.values(map).sort((a, b) => b.monthStr.localeCompare(a.monthStr));
  }, [account, data.accounts]);

  // 마운트 전 깜빡임 방지
  if (!mounted) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] px-4 py-16 flex flex-col items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[var(--accent-orange)]" />
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Modern Ambient Mesh Glow Background - Subtle Atmospheric Depth */}
      <div 
        className="fixed top-24 left-1/2 -translate-x-1/2 w-[700px] h-[400px] sm:w-[960px] sm:h-[480px] pointer-events-none z-0 opacity-40 dark:opacity-25 blur-[70px] sm:blur-[95px]"
        style={{
          background: 'radial-gradient(circle at 50% 30%, var(--glow-color) 0%, rgba(16, 185, 129, 0.08) 45%, transparent 75%)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-4xl mx-auto px-3.5 sm:px-6 py-5 sm:py-8 space-y-5 sm:space-y-6 pb-32">
        {/* 헤더 */}
      <div className="py-1 sm:py-2 px-0.5 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
            투자일지
          </h1>
          <p className="text-xs sm:text-base text-[var(--text-secondary)] font-medium">
            자산 배분 목표 비율을 정하고, 목표에 맞춘 주문 수량을 손쉽게 계산해 보세요.
          </p>
        </div>

        <div className="text-right shrink-0 flex flex-col items-end gap-1">
          {quoteAt && (
            <span className="text-[11px] font-mono text-[var(--text-secondary)]">
              시세 기준: {new Date(quoteAt).toLocaleTimeString('ko-KR')}
            </span>
          )}
          <button
            type="button"
            onClick={refreshQuotes}
            disabled={quoteLoading}
            title="시세 새로고침"
            className="p-1 rounded-full text-[var(--text-secondary)] hover:text-[var(--accent-orange)] hover:bg-[var(--accent-orange)]/10 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${quoteLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 상단 탭 바: 애플 HIG + M3 캡슐(Pill) 스타일 통일 */}
      <div className="space-y-2">
        {!loaded ? (
          <div className="flex flex-wrap items-center gap-2 animate-pulse py-1">
            <div className="h-8 w-20 rounded-full bg-[var(--border-color)]/50" />
            <div className="h-8 w-24 rounded-full bg-[var(--border-color)]/40" />
          </div>
        ) : !isManagingAccounts ? (
          <div className="flex flex-wrap items-center gap-2">
            {data.accounts.length > 1 && (
              <button
                onClick={() => {
                  setActiveId('ALL');
                  setApplied(false);
                  setAppliedLineGroupIds([]);
                }}
                className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                  activeId === 'ALL'
                    ? 'border-[var(--accent-orange)] bg-[var(--accent-orange)] text-white font-extrabold shadow-[0_0_14px_rgba(241,143,1,0.35)]'
                    : 'border-[var(--border-color)]/90 bg-[var(--card-surface)]/90 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent-orange)]/50 hover:shadow-[0_0_12px_rgba(241,143,1,0.18)] shadow-2xs'
                }`}
              >
                모아보기
              </button>
            )}

            {data.accounts.map((a) => (
              <button
                key={a.id}
                onClick={() => {
                  setActiveId(a.id);
                  setApplied(false);
                  setAppliedLineGroupIds([]);
                }}
                className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                  a.id === activeId
                    ? 'border-[var(--accent-orange)] bg-[var(--accent-orange)] text-white font-extrabold shadow-[0_0_14px_rgba(241,143,1,0.35)]'
                    : 'border-[var(--border-color)]/90 bg-[var(--card-surface)]/90 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent-orange)]/50 hover:shadow-[0_0_12px_rgba(241,143,1,0.18)] shadow-2xs'
                }`}
              >
                {a.name}
              </button>
            ))}

            {/* 계좌가 0개일 때는 연필 없이 [+ 계좌 추가] 바로 노출, 계좌가 있을 때는 [연필] 노출 */}
            {data.accounts.length === 0 ? (
              <div className="relative inline-block">
                <button
                  type="button"
                  onClick={addAccount}
                  className="px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-bold border border-[var(--border-color)]/90 bg-[var(--card-surface)] text-[var(--text-primary)] hover:border-[var(--accent-orange)] hover:text-[var(--accent-orange)] transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> 계좌 추가
                </button>

                {proPopoverTarget === 'account' && (
                  <ProMiniPopover
                    title="PRO 전용 (다중 계좌 무제한)"
                    description="무료 회원은 최대 세 개의 계좌(예: 연금저축, ISA, 일반 위탁)까지 등록할 수 있습니다. PRO 멤버십으로 업그레이드하면 가상자산, 가족 계좌 등 목적별 무제한 다중 계좌를 자유롭게 관리할 수 있습니다."
                    align="left"
                    isClosing={isProPopoverClosing}
                    onClose={closeProPopover}
                    onAction={openCompareModal}
                  />
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsManagingAccounts(true)}
                className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--accent-orange)] transition-colors cursor-pointer"
                title="계좌 관리 (이름 수정, 삭제, 추가)"
                aria-label="계좌 관리"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            {data.accounts.map((a) => (
              <div
                key={a.id}
                className="relative inline-flex items-center rounded-full border border-[var(--accent-orange)] bg-[var(--card-surface)] px-4 py-2 shadow-xs transition-all gap-1.5"
              >
                <input
                  id={`account-name-input-${a.id}`}
                  className="bg-transparent text-xs font-bold text-[var(--text-primary)] border-none outline-none no-focus-outline p-0 m-0 text-left min-w-[50px] max-w-[140px]"
                  style={{
                    boxShadow: 'none',
                    outline: 'none',
                    border: 'none',
                    width: `${Math.max(4, (a.name || '').length * 1.35)}ch`,
                  }}
                  value={a.name}
                  onChange={(e) => renameAccount(a.id, e.target.value)}
                  onBlur={() => handleAccountBlur(a.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.currentTarget.blur();
                      setIsManagingAccounts(false);
                    }
                  }}
                  placeholder="계좌 이름"
                  maxLength={20}
                />
                <button
                  type="button"
                  onClick={() => removeAccount(a.id)}
                  className="p-0.5 rounded-full text-[var(--text-secondary)] hover:text-[#F43F5E] hover:bg-[#F43F5E]/10 transition-colors cursor-pointer shrink-0 -mr-1"
                  title={`${a.name} 계좌 삭제`}
                  aria-label={`${a.name} 계좌 삭제`}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}

            <div className="relative inline-block">
              <button
                type="button"
                onClick={addAccount}
                className="px-4 py-2 rounded-full text-xs font-bold border border-[var(--border-color)]/90 bg-[var(--card-surface)] text-[var(--text-primary)] hover:border-[var(--accent-orange)] hover:text-[var(--accent-orange)] transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> 계좌 추가
              </button>

              {proPopoverTarget === 'account' && (
                <ProMiniPopover
                  title="PRO 전용 (다중 계좌 무제한)"
                  description="무료 회원은 최대 세 개의 계좌(예: 연금저축, ISA, 일반 위탁)까지 등록할 수 있습니다. PRO 멤버십으로 업그레이드하면 가상자산, 가족 계좌 등 목적별 무제한 다중 계좌를 자유롭게 관리할 수 있습니다."
                  align="left"
                  isClosing={isProPopoverClosing}
                  onClose={closeProPopover}
                  onAction={openCompareModal}
                />
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsManagingAccounts(false)}
              className="px-4 py-2 rounded-full text-xs font-bold bg-[var(--accent-orange)] text-white hover:brightness-105 transition-all flex items-center gap-1 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" /> 완료
            </button>
          </div>
        )}

      </div>

      <SmoothHeight>
        {/* ============================================================== */}
        {/* 0. 계좌 없음 안내 (온보딩 Empty State: 계좌가 0개일 때)             */}
        {/* ============================================================== */}
        {!loaded ? (
          <JournalLoadingSkeleton />
        ) : data.accounts.length === 0 ? (
          <div className={`${cardCls} p-8 sm:p-10 text-center space-y-4`}>
            <div className="w-12 h-12 rounded-2xl bg-[var(--accent-orange)]/10 text-[var(--accent-orange)] flex items-center justify-center mx-auto">
              <Wallet className="w-6 h-6 stroke-[1.8]" />
            </div>
            <div className="space-y-1">
              <p className="text-base font-extrabold text-[var(--text-primary)]">
                등록된 계좌가 없습니다.
              </p>
              <p className="text-xs text-[var(--text-secondary)]">
                첫 번째 계좌를 추가하여 목표 비율과 구매 수량을 관리해 보세요.
              </p>
            </div>
            <button onClick={addAccount} className={btnPrimaryPillCls}>
              <Plus className="w-3.5 h-3.5" /> 첫 계좌 만들기
            </button>
          </div>
        ) : activeId === 'ALL' && data.accounts.length > 1 ? (
          /* ============================================================== */
          /* 1. [모아보기] 탭: 순수 종합 오버뷰 (계좌 2개 이상일 때)               */
          /* ============================================================== */
          <div className="space-y-6">
            {currentSummary && (
              <div className={`${cardCls} p-4 sm:p-6 space-y-4 sm:space-y-5`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-extrabold text-[var(--text-primary)]">
                      내 자산 모아보기
                    </h2>
                    <span className="text-[10px] sm:text-[11px] font-mono text-[var(--text-secondary)] bg-[var(--bg-main)] px-2.5 py-0.5 rounded-full border border-[var(--border-color)]/60">
                      총 {data.accounts.length}개 계좌 합산
                    </span>
                  </div>

                </div>

                <div className="space-y-4 sm:space-y-5">
                      {/* 4대 핵심 지표 카드 */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                        <div className="bg-[var(--bg-main)]/70 border border-[var(--border-color)]/70 rounded-xl p-2.5 sm:p-3.5 space-y-1 min-w-0">
                          <span className="text-[10px] sm:text-[11px] font-bold text-[var(--text-secondary)] flex items-center gap-1">
                            <Coins className="w-3 h-3 text-[var(--accent-orange)]" /> 총 자산
                          </span>
                          <p className="text-sm sm:text-lg font-extrabold font-mono text-[var(--text-primary)] truncate">
                            {won(currentSummary.totalAssetsKrw)}
                          </p>
                          <span className="text-[9px] sm:text-[10px] text-[var(--text-secondary)] block font-mono truncate">
                            투자 원금 {currentSummary.hasInvestData ? won(currentSummary.totalInvestKrw) : '-'}
                          </span>
                        </div>

                        <div className="bg-[var(--bg-main)]/70 border border-[var(--border-color)]/70 rounded-xl p-2.5 sm:p-3.5 space-y-1 min-w-0">
                          <span className="text-[10px] sm:text-[11px] font-bold text-[var(--text-secondary)] flex items-center gap-1">
                            <Banknote className="w-3 h-3 text-[var(--accent-orange)]" /> 투자자산
                          </span>
                          <p className="text-sm sm:text-lg font-extrabold font-mono text-[var(--text-primary)] truncate">
                            {won(currentSummary.totalStockEvalKrw)}
                          </p>
                          <span className="text-[9px] sm:text-[10px] text-[var(--text-secondary)] block font-mono truncate">
                            투자 비중 {(100 - currentSummary.cashWeightPct).toFixed(1)}%
                          </span>
                        </div>

                        <div className="bg-[var(--bg-main)]/70 border border-[var(--border-color)]/70 rounded-xl p-2.5 sm:p-3.5 space-y-1 min-w-0">
                          <span className="text-[10px] sm:text-[11px] font-bold text-[var(--text-secondary)] flex items-center gap-1">
                            <DollarSign className="w-3 h-3" /> 현금
                          </span>
                          <p className="text-sm sm:text-lg font-extrabold font-mono text-[var(--text-primary)] truncate">
                            {won(currentSummary.cashKrw)}
                          </p>
                          <span className="text-[9px] sm:text-[10px] text-[var(--text-secondary)] block font-mono truncate">
                            현금 비중 {currentSummary.cashWeightPct.toFixed(1)}%
                          </span>
                        </div>

                        <div className="bg-[var(--bg-main)]/70 border border-[var(--border-color)]/70 rounded-xl p-2.5 sm:p-3.5 space-y-1 min-w-0">
                          <span className="text-[10px] sm:text-[11px] font-bold text-[var(--text-secondary)] flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" /> 수익률
                          </span>
                          <p
                            className={`text-sm sm:text-lg font-extrabold font-mono truncate ${
                              currentSummary.totalProfitRate === null
                                ? 'text-[var(--text-secondary)]'
                                : currentSummary.totalProfitRate >= 0
                                ? 'text-[var(--accent-emerald,#10B981)]'
                                : 'text-[#F43F5E]'
                            }`}
                          >
                            {currentSummary.totalProfitRate !== null
                              ? `${currentSummary.totalProfitRate >= 0 ? '+' : ''}${currentSummary.totalProfitRate.toFixed(2)}%`
                              : '-'}
                          </p>
                          <span
                            className={`text-[9px] sm:text-[10px] font-mono block truncate ${
                              currentSummary.totalProfitKrw >= 0 ? 'text-[var(--accent-emerald,#10B981)]' : 'text-[#F43F5E]'
                            }`}
                          >
                            {currentSummary.totalProfitRate !== null
                              ? `${currentSummary.totalProfitKrw >= 0 ? '+' : ''}${won(currentSummary.totalProfitKrw)}`
                              : '단가 입력 시 계산'}
                          </span>
                        </div>
                      </div>

                      {/* 적응형 자산 추이 그래프 (풀와이드 곡선 차트 & 4대 기간 실질 성과 스코어카드) */}
                      <AdaptiveAssetTrendChart
                        summary={currentSummary}
                        monthlyTradeStats={monthlyTradeStats}
                        monthlyDepositStats={monthlyDepositStats}
                        logs={data.logs}
                        accounts={data.accounts}
                        isPro={isPro}
                        onOpenProModal={openCompareModal}
                      />

                      {/* 계좌 구성 & 가로 비례 바 차트 */}
                      <div className="pt-2 space-y-3.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[var(--text-primary)]">
                            계좌 구성
                          </span>
                          {/* Apple HIG 2-Segmented Pill Controller (글래스모피즘 + 슬라이딩 인디케이터) */}
                          <div className="relative inline-grid grid-cols-2 p-0.5 rounded-full bg-[var(--bg-main)]/90 backdrop-blur-md border border-[var(--border-color)]/90 shadow-2xs w-44 sm:w-52">
                            {/* 슬라이딩 글래스모피즘 인디케이터 (Apple Snappy cubic-bezier & 주황 글로우) */}
                            <div
                              className="absolute top-0.5 bottom-0.5 left-0.5 rounded-full bg-[var(--card-surface)] border border-[rgba(241,143,1,0.6)] shadow-[0_0_12px_rgba(241,143,1,0.22)] transition-transform duration-300 pointer-events-none"
                              style={{
                                width: 'calc((100% - 4px) / 2)',
                                transform: `translateX(${overviewViewMode === 'group' ? '0%' : '100%'})`,
                                transitionTimingFunction: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => setOverviewViewMode('group')}
                              className={`relative z-10 w-full flex items-center justify-center py-1 sm:py-1.5 px-1.5 sm:px-2 rounded-full text-[11px] sm:text-xs font-bold transition-colors duration-200 cursor-pointer text-center whitespace-nowrap select-none leading-none gap-1 ${
                                overviewViewMode === 'group'
                                  ? 'text-[var(--accent-orange)] font-extrabold'
                                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                              }`}
                            >
                              <Layers className="w-3 h-3 shrink-0" />
                              <span>자산군별</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setOverviewViewMode('asset')}
                              className={`relative z-10 w-full flex items-center justify-center py-1 sm:py-1.5 px-1.5 sm:px-2 rounded-full text-[11px] sm:text-xs font-bold transition-colors duration-200 cursor-pointer text-center whitespace-nowrap select-none leading-none gap-1 ${
                                overviewViewMode === 'asset'
                                  ? 'text-[var(--accent-orange)] font-extrabold'
                                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                              }`}
                            >
                              <List className="w-3 h-3 shrink-0" />
                              <span>종목별</span>
                            </button>
                          </div>
                        </div>

                        {/* 가로 누적 비례 그래프 */}
                        <PortfolioSegmentedBar segments={barSegments} />

                        <SmoothHeight>
                          {overviewViewMode === 'group' ? (
                            <div className="space-y-2 pt-1">
                              {currentSummary.groupItems.map((gr) => (
                                <div
                                  key={gr.groupId}
                                  className="p-3 rounded-xl bg-[var(--bg-main)]/50 border border-[var(--border-color)]/60 flex items-center justify-between gap-3 text-xs"
                                >
                                  <div className="min-w-0 space-y-0.5">
                                    <span className="font-extrabold text-[var(--text-primary)] block">
                                      {gr.groupName}
                                    </span>
                                    <span className="text-[11px] text-[var(--text-secondary)] font-mono">
                                      {gr.symbols.map((s) => s.name).join(' · ')}
                                    </span>
                                  </div>
                                  <div className="text-right shrink-0 space-y-0.5 font-mono">
                                    <p className="font-extrabold text-[var(--text-primary)]">{won(gr.evalKrw)}</p>
                                    <div className="flex items-center justify-end gap-1.5 text-[11px]">
                                      <span className="text-[var(--text-secondary)] font-bold">{gr.currentPct.toFixed(1)}%</span>
                                      {gr.profitRate !== null && (
                                        <span className={gr.profitRate >= 0 ? 'text-[var(--accent-emerald,#10B981)] font-bold' : 'text-[#F43F5E] font-bold'}>
                                          ({gr.profitRate >= 0 ? '+' : ''}{gr.profitRate.toFixed(1)}%)
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="space-y-2 pt-1">
                              {currentSummary.items.map((item, idx) => {
                                const isCrypto = isCryptoSymbol(item.symbol);
                                const unit = getSymbolUnit(item.symbol);
                                return (
                                  <div
                                    key={`${item.symbol}-${idx}`}
                                    className="p-3 rounded-xl bg-[var(--bg-main)]/50 border border-[var(--border-color)]/60 flex items-center justify-between gap-3 text-xs"
                                  >
                                    <div className="min-w-0 space-y-0.5">
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="font-extrabold text-[var(--text-primary)]">{item.name}</span>
                                        <span className="text-[10px] font-mono text-[var(--text-secondary)] bg-[var(--bg-main)] px-2 py-0.5 rounded-full border border-[var(--border-color)]/60">
                                          {item.symbol}
                                        </span>
                                        <span className="text-[11px] text-[var(--text-secondary)]">· {item.groupName}</span>
                                      </div>
                                      <p className="text-[11px] font-mono text-[var(--text-secondary)]">
                                        {formatQuantity(item.qty, isCrypto)}{unit} · {won(item.priceKrw)}
                                      </p>
                                    </div>
                                    <div className="text-right shrink-0 space-y-0.5 font-mono">
                                      <p className="font-extrabold text-[var(--text-primary)]">{won(item.evalKrw)}</p>
                                      <div className="flex items-center justify-end gap-1.5 text-[11px]">
                                        <span className="text-[var(--text-secondary)]">{item.weightPct.toFixed(1)}%</span>
                                        {item.profitRate !== null && (
                                          <span className={item.profitRate >= 0 ? 'text-[var(--accent-emerald,#10B981)] font-bold' : 'text-[#F43F5E] font-bold'}>
                                            ({item.profitRate >= 0 ? '+' : ''}{item.profitRate.toFixed(1)}%)
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </SmoothHeight>
                      </div>
                      {/* 하단 히스토리 아카이브 (월별 매매 실적 + CSV 다운로드 & 월별 입출금 현황 - PRO 회원 전용) */}
                      {isPro && (
                        <OverviewHistoryArchive
                          monthlyTradeStats={monthlyTradeStats}
                          monthlyDepositStats={monthlyDepositStats}
                          isPro={isPro}
                          onExportCsv={() => exportToCsv('csv-archive')}
                          onOpenProModal={openCompareModal}
                          proPopoverTarget={proPopoverTarget}
                          isProPopoverClosing={isProPopoverClosing}
                          onCloseProPopover={closeProPopover}
                        />
                      )}
                    </div>
              </div>
            )}

            {/* 계좌별 보유 요약 카드 */}
            <div className={`${cardCls} p-5 sm:p-6 space-y-3`}>
              <h2 className="text-sm font-extrabold text-[var(--text-primary)]">
                보유 계좌 목록
              </h2>
              <div className="space-y-2">
                {data.accounts.map((acc) => {
                  const s = calcPortfolioSummary(acc, quotes);
                  const sharePct = currentSummary && currentSummary.totalAssetsKrw > 0
                    ? (s.totalAssetsKrw / currentSummary.totalAssetsKrw) * 100
                    : 0;

                  return (
                    <div
                      key={acc.id}
                      onClick={() => setActiveId(acc.id)}
                      className="p-3.5 rounded-xl bg-[var(--bg-main)]/50 border border-[var(--border-color)]/60 flex items-center justify-between gap-3 text-xs hover:border-[var(--accent-orange)] hover:bg-[var(--accent-orange)]/[0.03] hover:shadow-[0_0_18px_rgba(241,143,1,0.18)] transition-all cursor-pointer group"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-sm text-[var(--text-primary)] group-hover:text-[var(--accent-orange)] transition-colors truncate">
                            {acc.name}
                          </span>
                          <span className="text-[10px] text-[var(--text-secondary)] whitespace-nowrap shrink-0">
                            ({acc.groups.length}개 자산군)
                          </span>
                        </div>
                        <p className="text-[11px] font-mono text-[var(--text-secondary)] mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                          <span className="whitespace-nowrap">투자자산 {won(s.totalStockEvalKrw)}</span>
                          <span className="hidden sm:inline text-[var(--border-color)]">·</span>
                          <span className="whitespace-nowrap">보유 현금 {won(s.cashKrw)}</span>
                        </p>
                      </div>
                      <div className="text-right font-mono shrink-0 whitespace-nowrap pl-2">
                        <p className="font-extrabold text-sm text-[var(--text-primary)] whitespace-nowrap">{won(s.totalAssetsKrw)}</p>
                        <span className="text-[11px] text-[var(--text-secondary)] whitespace-nowrap">
                          전체의 {sharePct.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 최근 매매 기록 (전체 통합 및 개별/전체 삭제, CSV 다운로드) */}
            {data.logs.length > 0 && (
              <div className={`${cardCls} p-5 sm:p-6 space-y-3 min-h-[260px]`}>
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-extrabold text-[var(--text-primary)]">
                      {isPro ? '전체 매매 기록' : '최근 매매 기록'}
                    </h2>
                    <span className="text-[10px] text-[var(--text-secondary)] font-mono">
                      ({isPro ? `총 ${data.logs.length}건` : `최근 ${displayedOverviewLogs.length}건`})
                    </span>
                  </div>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => exportToCsv('csv-logs')}
                      className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--accent-orange)] hover:bg-[var(--accent-orange)]/10 rounded-lg transition-colors cursor-pointer"
                      title="전체 매매 기록 CSV 엑셀 다운로드"
                      aria-label="CSV 저장"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    {proPopoverTarget === 'csv-logs' && (
                      <ProMiniPopover
                        title="전체 매매 기록 CSV 내보내기"
                        description="PRO 멤버십에 가입하면 모든 계좌의 전체 매매 기록과 계좌 잔고를 엑셀 CSV 파일로 무제한 저장할 수 있습니다."
                        align="right"
                        isClosing={isProPopoverClosing}
                        onClose={closeProPopover}
                        onAction={openCompareModal}
                      />
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  {displayedOverviewLogs.map((log) => {
                    const firstItem = log.items[0];
                    const isCrypto = firstItem ? isCryptoSymbol(firstItem.symbol) : false;
                    const unit = firstItem ? getSymbolUnit(firstItem.symbol) : '주';
                    const isSell = firstItem ? firstItem.qty < 0 : log.type === 'SELL';
                    const amount = firstItem ? Math.abs(firstItem.amountKrw) : 0;
                    const qty = firstItem ? Math.abs(firstItem.qty) : 0;

                    return (
                      <div
                        key={log.id}
                        className="text-xs text-[var(--text-secondary)] bg-[var(--bg-main)]/50 p-3 rounded-xl border border-[var(--border-color)]/60 flex items-center justify-between gap-3 hover:border-[var(--accent-orange)]/40 transition-colors shadow-2xs"
                      >
                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-bold text-[var(--text-primary)]">
                              {formatDisplayDate(log.date)}
                            </span>
                            <span className="text-[10px] text-[var(--text-secondary)] font-mono">
                              · {log.accountName}
                            </span>
                            <span
                              className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full ${
                                isSell
                                  ? 'text-[#F43F5E] border border-[#F43F5E]/40'
                                  : 'text-[#10B981] border border-[#10B981]/40'
                              }`}
                            >
                              {isSell ? '판매' : '구매'}
                            </span>
                            {log.realizedProfit !== undefined && log.realizedProfit !== 0 && (
                              <span
                                className={`text-[10px] font-bold font-mono ${
                                  log.realizedProfit >= 0 ? 'text-[#10B981]' : 'text-[#F43F5E]'
                                }`}
                              >
                                실현손익 {log.realizedProfit >= 0 ? '+' : ''}{won(log.realizedProfit)}
                              </span>
                            )}
                          </div>
                          <div className="font-mono text-xs flex items-center gap-1.5 flex-wrap">
                            {firstItem ? (
                              <>
                                <span className="font-extrabold text-[var(--text-primary)]">
                                  {firstItem.name || firstItem.symbol} ({firstItem.symbol})
                                </span>
                                <span className="text-[var(--text-primary)] font-bold">
                                  {formatQuantity(qty, isCrypto)}{unit} {isSell ? '판매' : '구매'}
                                </span>
                                <span className="text-[var(--text-secondary)]">
                                  ({won(amount)})
                                </span>
                              </>
                            ) : (
                              <span>거래 상세 없음</span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveLog(log.id)}
                          className="p-1.5 text-[var(--text-secondary)] hover:text-[#F43F5E] transition-colors shrink-0 cursor-pointer border-0 outline-none"
                          title="매매 기록 삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : !account ? (
          /* ============================================================== */
          /* 계좌 없음 안내                                                  */
          /* ============================================================== */
          <div className={`${cardCls} p-10 text-center space-y-4`}>
            <div className="w-12 h-12 rounded-2xl bg-[var(--accent-orange)]/10 text-[var(--accent-orange)] flex items-center justify-center mx-auto">
              <Wallet className="w-6 h-6 stroke-[1.8]" />
            </div>
            <div className="space-y-1">
              <p className="text-base font-extrabold text-[var(--text-primary)]">
                등록된 계좌가 없습니다.
              </p>
              <p className="text-xs text-[var(--text-secondary)]">
                첫 번째 계좌를 추가하여 목표 비율과 구매 수량을 관리해 보세요.
              </p>
            </div>
            <button onClick={addAccount} className={btnPrimaryPillCls}>
              <Plus className="w-3.5 h-3.5" /> 첫 계좌 만들기
            </button>
          </div>
        ) : (
          /* ============================================================== */
          /* 2. [개별 계좌] 뷰                                               */
          /* ============================================================== */
          <div className="space-y-6">
            {/* 계좌 오버뷰 */}
            {currentSummary && (
              <div className={`${cardCls} relative z-20 p-4 sm:p-6 space-y-4 sm:space-y-5`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <PieChart className="w-4 h-4 text-[var(--accent-orange)]" />
                    <h2 className="text-base sm:text-lg font-extrabold text-[var(--text-primary)]">
                      {account.name}
                    </h2>
                  </div>

                </div>

                <div className="space-y-4 sm:space-y-5">
                      {/* 4대 핵심 지표 카드 */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                        <div className="bg-[var(--bg-main)]/70 border border-[var(--border-color)]/70 rounded-xl p-2.5 sm:p-3.5 space-y-1 min-w-0">
                          <span className="text-[10px] sm:text-[11px] font-bold text-[var(--text-secondary)] flex items-center gap-1">
                            <Coins className="w-3 h-3 text-[var(--accent-orange)]" /> 총 자산
                          </span>
                          <p className="text-sm sm:text-lg font-extrabold font-mono text-[var(--text-primary)] truncate">
                            {won(currentSummary.totalAssetsKrw)}
                          </p>
                          <span className="text-[9px] sm:text-[10px] text-[var(--text-secondary)] block font-mono truncate">
                            투자 원금 {currentSummary.hasInvestData ? won(currentSummary.totalInvestKrw) : '-'}
                          </span>
                        </div>

                        <div className="bg-[var(--bg-main)]/70 border border-[var(--border-color)]/70 rounded-xl p-2.5 sm:p-3.5 space-y-1 min-w-0">
                          <span className="text-[10px] sm:text-[11px] font-bold text-[var(--text-secondary)] flex items-center gap-1">
                            <Banknote className="w-3 h-3 text-[var(--accent-orange)]" /> 투자자산
                          </span>
                          <p className="text-sm sm:text-lg font-extrabold font-mono text-[var(--text-primary)] truncate">
                            {won(currentSummary.totalStockEvalKrw)}
                          </p>
                          <span className="text-[9px] sm:text-[10px] text-[var(--text-secondary)] block font-mono truncate">
                            투자 비중 {(100 - currentSummary.cashWeightPct).toFixed(1)}%
                          </span>
                        </div>

                        <div className="bg-[var(--bg-main)]/70 border border-[var(--border-color)]/70 rounded-xl p-2.5 sm:p-3.5 space-y-1 min-w-0">
                          <span className="text-[10px] sm:text-[11px] font-bold text-[var(--text-secondary)] flex items-center gap-1">
                            <DollarSign className="w-3 h-3" /> 현금
                          </span>
                          <p className="text-sm sm:text-lg font-extrabold font-mono text-[var(--text-primary)] truncate">
                            {won(currentSummary.cashKrw)}
                          </p>
                          <span className="text-[9px] sm:text-[10px] text-[var(--text-secondary)] block font-mono truncate">
                            현금 비중 {currentSummary.cashWeightPct.toFixed(1)}%
                          </span>
                        </div>

                        <div className="bg-[var(--bg-main)]/70 border border-[var(--border-color)]/70 rounded-xl p-2.5 sm:p-3.5 space-y-1 min-w-0">
                          <span className="text-[10px] sm:text-[11px] font-bold text-[var(--text-secondary)] flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" /> 수익률
                          </span>
                          <p
                            className={`text-sm sm:text-lg font-extrabold font-mono truncate ${
                              currentSummary.totalProfitRate === null
                                ? 'text-[var(--text-secondary)]'
                                : currentSummary.totalProfitRate >= 0
                                ? 'text-[var(--accent-emerald,#10B981)]'
                                : 'text-[#F43F5E]'
                            }`}
                          >
                            {currentSummary.totalProfitRate !== null
                              ? `${currentSummary.totalProfitRate >= 0 ? '+' : ''}${currentSummary.totalProfitRate.toFixed(2)}%`
                              : '-'}
                          </p>
                          <span
                            className={`text-[9px] sm:text-[10px] font-mono block truncate ${
                              currentSummary.totalProfitKrw >= 0 ? 'text-[var(--accent-emerald,#10B981)]' : 'text-[#F43F5E]'
                            }`}
                          >
                            {currentSummary.totalProfitRate !== null
                              ? `${currentSummary.totalProfitKrw >= 0 ? '+' : ''}${won(currentSummary.totalProfitKrw)}`
                              : '단가 입력 시 계산'}
                          </span>
                        </div>
                      </div>

                      {/* ── 애플 HIG 스타일 미니멀 인라인 접이식 컨트롤 바 (우측 정렬 & 상단 구분선 제거) ── */}
                      <div className="pt-1 flex justify-end">
                        <button
                          type="button"
                          onClick={() => setShowAccountDetailAnalytics((prev) => !prev)}
                          className="flex items-center gap-1.5 py-1 px-2.5 rounded-lg text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--accent-orange)] hover:bg-[var(--accent-orange)]/10 transition-colors cursor-pointer group"
                        >
                          <TrendingUp className="w-3.5 h-3.5 text-[var(--accent-orange)]" />
                          <span>계좌 상세 분석 및 자산 추이 {showAccountDetailAnalytics ? '접기' : '보기'}</span>
                          <ChevronDown
                            className={`w-3.5 h-3.5 transition-transform duration-300 ${
                              showAccountDetailAnalytics ? 'rotate-180 text-[var(--accent-orange)]' : ''
                            }`}
                          />
                        </button>
                      </div>

                      {/* 통합된 계좌 상세 분석 및 적응형 자산 추이 그래프 (단일 SmoothHeight) */}
                      <SmoothHeight>
                        {showAccountDetailAnalytics && (
                          <div className="pt-2 space-y-4">
                            <AdaptiveAssetTrendChart
                              summary={currentSummary}
                              monthlyTradeStats={monthlyTradeStats}
                              monthlyDepositStats={monthlyDepositStats}
                              logs={allLogsForAccount}
                              accounts={[account]}
                              isPro={isPro}
                              onOpenProModal={openCompareModal}
                            />

                            {/* 계좌 구성 스위처 & 가로 비례 바 차트 */}
                            <div className="space-y-3.5">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-[var(--text-primary)]">
                                    계좌 구성
                                  </span>
                                  {/* Apple HIG 2-Segmented Pill Controller (글래스모피즘 + 슬라이딩 인디케이터) */}
                                  <div className="relative inline-grid grid-cols-2 p-0.5 rounded-full bg-[var(--bg-main)]/90 backdrop-blur-md border border-[var(--border-color)]/90 shadow-2xs w-44 sm:w-52">
                                    {/* 슬라이딩 글래스모피즘 인디케이터 (Apple Snappy cubic-bezier & 주황 글로우) */}
                                    <div
                                      className="absolute top-0.5 bottom-0.5 left-0.5 rounded-full bg-[var(--card-surface)] border border-[rgba(241,143,1,0.6)] shadow-[0_0_12px_rgba(241,143,1,0.22)] transition-transform duration-300 pointer-events-none"
                                      style={{
                                        width: 'calc((100% - 4px) / 2)',
                                        transform: `translateX(${overviewViewMode === 'group' ? '0%' : '100%'})`,
                                        transitionTimingFunction: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
                                      }}
                                    />
                                    <button
                                      type="button"
                                      onClick={() => setOverviewViewMode('group')}
                                      className={`relative z-10 w-full flex items-center justify-center py-1 sm:py-1.5 px-1.5 sm:px-2 rounded-full text-[11px] sm:text-xs font-bold transition-colors duration-200 cursor-pointer text-center whitespace-nowrap select-none leading-none gap-1 ${
                                        overviewViewMode === 'group'
                                          ? 'text-[var(--accent-orange)] font-extrabold'
                                          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                                      }`}
                                    >
                                      <Layers className="w-3 h-3 shrink-0" />
                                      <span>자산군별</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setOverviewViewMode('asset')}
                                      className={`relative z-10 w-full flex items-center justify-center py-1 sm:py-1.5 px-1.5 sm:px-2 rounded-full text-[11px] sm:text-xs font-bold transition-colors duration-200 cursor-pointer text-center whitespace-nowrap select-none leading-none gap-1 ${
                                        overviewViewMode === 'asset'
                                          ? 'text-[var(--accent-orange)] font-extrabold'
                                          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                                      }`}
                                    >
                                      <List className="w-3 h-3 shrink-0" />
                                      <span>종목별</span>
                                    </button>
                                  </div>
                                </div>

                                {/* 가로 누적 비례 그래프 */}
                                <PortfolioSegmentedBar segments={barSegments} />

                                <SmoothHeight>
                                  {overviewViewMode === 'group' ? (
                                    <div className="space-y-2 pt-1">
                                      {currentSummary.groupItems.map((gr) => (
                                        <div
                                          key={gr.groupId}
                                          className="p-3 rounded-xl bg-[var(--bg-main)]/50 border border-[var(--border-color)]/60 flex items-center justify-between gap-3 text-xs"
                                        >
                                          <div className="min-w-0 space-y-0.5">
                                            <span className="font-extrabold text-[var(--text-primary)] block">
                                              {gr.groupName}
                                            </span>
                                            <span className="text-[11px] text-[var(--text-secondary)] font-mono">
                                              {gr.symbols.map((s) => s.name).join(' · ')}
                                            </span>
                                          </div>
                                          <div className="text-right shrink-0 space-y-0.5 font-mono">
                                            <p className="font-extrabold text-[var(--text-primary)]">{won(gr.evalKrw)}</p>
                                            <div className="flex items-center justify-end gap-1.5 text-[11px]">
                                              <span className="text-[var(--text-secondary)] font-bold">{gr.currentPct.toFixed(1)}%</span>
                                              {gr.profitRate !== null && (
                                                <span className={gr.profitRate >= 0 ? 'text-[var(--accent-emerald,#10B981)] font-bold' : 'text-[#F43F5E] font-bold'}>
                                                  ({gr.profitRate >= 0 ? '+' : ''}{gr.profitRate.toFixed(1)}%)
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="space-y-2 pt-1">
                                      {currentSummary.items.map((item, idx) => {
                                        const isCrypto = isCryptoSymbol(item.symbol);
                                        const unit = getSymbolUnit(item.symbol);
                                        return (
                                          <div
                                            key={`${item.symbol}-${idx}`}
                                            className="p-3 rounded-xl bg-[var(--bg-main)]/50 border border-[var(--border-color)]/60 flex items-center justify-between gap-3 text-xs"
                                          >
                                            <div className="min-w-0 space-y-0.5">
                                              <div className="flex items-center gap-1.5 flex-wrap">
                                                <span className="font-extrabold text-[var(--text-primary)]">{item.name}</span>
                                                <span className="text-[10px] font-mono text-[var(--text-secondary)] bg-[var(--bg-main)] px-2 py-0.5 rounded-full border border-[var(--border-color)]/60">
                                                  {item.symbol}
                                                </span>
                                                <span className="text-[11px] text-[var(--text-secondary)]">· {item.groupName}</span>
                                              </div>
                                              <p className="text-[11px] font-mono text-[var(--text-secondary)]">
                                                {formatQuantity(item.qty, isCrypto)}{unit} · {won(item.priceKrw)}
                                              </p>
                                            </div>
                                            <div className="text-right shrink-0 space-y-0.5 font-mono">
                                              <p className="font-extrabold text-[var(--text-primary)]">{won(item.evalKrw)}</p>
                                              <div className="flex items-center justify-end gap-1.5 text-[11px]">
                                                <span className="text-[var(--text-secondary)]">{item.weightPct.toFixed(1)}%</span>
                                                {item.profitRate !== null && (
                                                  <span className={item.profitRate >= 0 ? 'text-[var(--accent-emerald,#10B981)] font-bold' : 'text-[#F43F5E] font-bold'}>
                                                    ({item.profitRate >= 0 ? '+' : ''}{item.profitRate.toFixed(1)}%)
                                                  </span>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </SmoothHeight>
                              </div>

                              {/* 하단 히스토리 아카이브 (월별 매매 실적 + CSV 다운로드 & 월별 입출금 현황 - PRO 회원 전용) */}
                              {isPro && (
                                <OverviewHistoryArchive
                                  monthlyTradeStats={monthlyTradeStats}
                                  monthlyDepositStats={monthlyDepositStats}
                                  isPro={isPro}
                                  onExportCsv={() => exportToCsv('csv-archive')}
                                  onOpenProModal={openCompareModal}
                                  proPopoverTarget={proPopoverTarget}
                                  isProPopoverClosing={isProPopoverClosing}
                                  onCloseProPopover={closeProPopover}
                                />
                              )}
                            </div>
                          )}
                        </SmoothHeight>
                      </div>
                    </div>
                  )}

            {/* 현금 및 운용 설정 카드 (평소 Read-Only & 카드 클릭 시 통합 편집 패널 열림) */}
            <div className={`${cardCls} p-5 sm:p-6 space-y-4`}>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-[var(--accent-orange)]" />
                  <h2 className="text-base font-extrabold text-[var(--text-primary)]">
                    현금 및 운용 설정
                  </h2>
                </div>
              </div>

              {/* 평소 상태(Read-Only 3열 카드) vs 클릭 시 열리는 통합 편집 패널 */}
              <SmoothHeight>
                {!isEditingCash ? (
                  /* 1. 평소 상태: 깔끔한 Read-Only 2열 카드 (아무 카드나 클릭 시 편집 패널 열림) */
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div
                      onClick={handleStartCashEdit}
                      className="p-3.5 rounded-xl bg-[var(--bg-main)]/60 border border-[var(--border-color)] space-y-1 hover:border-[var(--accent-orange)] hover:bg-[var(--accent-orange)]/[0.04] hover:shadow-[0_0_18px_rgba(241,143,1,0.18)] transition-all duration-200 cursor-pointer group relative"
                      title="클릭하여 현금 관리 및 수정"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-[var(--text-secondary)] block">
                          원화 예수금 (KRW)
                        </span>
                        <Edit2 className="w-3 h-3 text-[var(--text-secondary)]/40 group-hover:text-[var(--accent-orange)] transition-colors" />
                      </div>
                      <p className="text-base font-extrabold font-mono text-[var(--text-primary)]">
                        {won(account.cash || 0)}
                      </p>
                    </div>

                    <div
                      onClick={handleStartCashEdit}
                      className="p-3.5 rounded-xl bg-[var(--bg-main)]/60 border border-[var(--border-color)] space-y-1 hover:border-[var(--accent-orange)] hover:bg-[var(--accent-orange)]/[0.04] hover:shadow-[0_0_18px_rgba(241,143,1,0.18)] transition-all duration-200 cursor-pointer group relative"
                      title="클릭하여 현금 관리 및 수정"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-[var(--text-secondary)] block">
                          달러 예수금 (USD)
                        </span>
                        <div className="flex items-center gap-1.5">
                          {quotes.usdKrw && account.cashUsd ? (
                            <span className="text-[10px] font-mono text-[var(--text-secondary)]">
                              ≈ {won(Math.round(account.cashUsd * quotes.usdKrw))}
                            </span>
                          ) : null}
                          <Edit2 className="w-3 h-3 text-[var(--text-secondary)]/40 group-hover:text-[var(--accent-orange)] transition-colors" />
                        </div>
                      </div>
                      <p className="text-base font-extrabold font-mono text-[var(--text-primary)]">
                        ${(account.cashUsd || 0).toLocaleString('en-US')}
                      </p>
                    </div>
                  </div>
                ) : (
                  /* 2. 편집 모드: 잔액 직접 수정 + 입출금/환전 + 수수료 설정 통합 패널 */
                  <div className="space-y-4 p-4 rounded-2xl bg-[var(--bg-main)]/40 border border-[var(--accent-orange)]/40 shadow-sm">
                    {/* 상단: 보유 현금 직접 수정 인풋 2열 */}
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-[var(--text-secondary)]">
                          원화 예수금 (KRW)
                        </label>
                        <div className="relative">
                          <input
                            className={inputCls}
                            inputMode="numeric"
                            value={account.cash ? account.cash.toLocaleString('ko-KR') : ''}
                            placeholder="0"
                            onChange={(e) => {
                              const val = Number(e.target.value.replace(/[^0-9]/g, '')) || 0;
                              updateAccount({ cash: val });
                            }}
                          />
                          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[var(--text-secondary)] font-medium">
                            원
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-[var(--text-secondary)]">
                          달러 예수금 (USD)
                        </label>
                        <div className="relative">
                          <input
                            className={inputCls}
                            inputMode="decimal"
                            value={typingCashUsd !== null ? typingCashUsd : (account.cashUsd !== undefined && account.cashUsd !== null ? String(account.cashUsd) : '')}
                            placeholder="0"
                            onChange={(e) => {
                              const cleaned = sanitizeDecimal(e.target.value);
                              setTypingCashUsd(cleaned);
                              const val = parseFloat(cleaned);
                              updateAccount({ cashUsd: isNaN(val) ? 0 : val });
                            }}
                            onBlur={() => setTypingCashUsd(null)}
                          />
                          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[var(--text-secondary)] font-medium">
                            $
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 중단: 입금 / 출금 / 환전 글래스모피즘 슬라이딩 폼 */}
                    <div className="p-3 rounded-xl bg-[var(--card-surface)]/80 backdrop-blur-md border border-[var(--border-color)]/80 flex flex-wrap items-center gap-2.5">
                      {/* 구분: 입금(초록) / 출금(빨강) / 환전(주황) Apple HIG 슬라이딩 캡슐 */}
                      <div className="relative inline-grid grid-cols-3 p-0.5 rounded-full bg-[var(--bg-main)]/90 backdrop-blur-md border border-[var(--border-color)]/90 shadow-2xs w-48 select-none shrink-0">
                        <div
                          className={`absolute top-0.5 bottom-0.5 left-0.5 rounded-full transition-all duration-300 pointer-events-none ${
                            inlineDepositType === 'IN'
                              ? 'bg-[#10B981] shadow-[0_0_12px_rgba(16,185,129,0.35)]'
                              : inlineDepositType === 'OUT'
                              ? 'bg-[#F43F5E] shadow-[0_0_12px_rgba(244,63,94,0.35)]'
                              : 'bg-[var(--accent-orange)] shadow-[0_0_12px_rgba(241,143,1,0.35)]'
                          }`}
                          style={{
                            width: 'calc((100% - 4px) / 3)',
                            transform: `translateX(${inlineDepositType === 'IN' ? '0%' : inlineDepositType === 'OUT' ? '100%' : '200%'})`,
                            transitionTimingFunction: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setInlineDepositType('IN')}
                          className={`relative z-10 w-full py-1 text-xs font-bold transition-colors duration-200 cursor-pointer text-center ${
                            inlineDepositType === 'IN'
                              ? 'text-white font-extrabold'
                              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                          }`}
                        >
                          입금
                        </button>
                        <button
                          type="button"
                          onClick={() => setInlineDepositType('OUT')}
                          className={`relative z-10 w-full py-1 text-xs font-bold transition-colors duration-200 cursor-pointer text-center ${
                            inlineDepositType === 'OUT'
                              ? 'text-white font-extrabold'
                              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                          }`}
                        >
                          출금
                        </button>
                        <button
                          type="button"
                          onClick={() => setInlineDepositType('FX')}
                          className={`relative z-10 w-full py-1 text-xs font-bold transition-colors duration-200 cursor-pointer text-center ${
                            inlineDepositType === 'FX'
                              ? 'text-white font-extrabold'
                              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                          }`}
                        >
                          환전
                        </button>
                      </div>

                      {inlineDepositType !== 'FX' ? (
                        /* 입금 / 출금: 금액란 바로 옆에 인라인 반영 버튼 배치 + 입금 모드 시 매월 정기 적립 단골 칩 */
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="relative w-36">
                            <input
                              className="w-full bg-[var(--card-surface)] border border-[var(--border-color)] rounded-lg pl-2.5 pr-7 py-1 text-xs font-mono font-bold text-right text-[var(--text-primary)] outline-none focus:border-[var(--accent-orange)]"
                              inputMode="numeric"
                              placeholder="금액(원)"
                              value={inlineDepositAmount ? Number(inlineDepositAmount.replace(/[^0-9]/g, '')).toLocaleString('ko-KR') : ''}
                              onChange={(e) => setInlineDepositAmount(e.target.value.replace(/[^0-9]/g, ''))}
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-[var(--text-secondary)] pointer-events-none">
                              원
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={handleExecuteInlineDeposit}
                            className={`${btnPrimaryPillCls} py-1 px-3 text-xs shrink-0`}
                          >
                            반영
                          </button>

                          {/* 입금 모드일 때 매월 정기 적립금 단골 칩 / 설정 버튼 */}
                          {inlineDepositType === 'IN' && (
                            <div className="flex items-center gap-1.5 ml-0.5">
                              {isEditingDepositGoal ? (
                                <div className="inline-flex items-center gap-1 bg-[var(--card-surface)] border border-[var(--accent-orange)] rounded-lg px-2 py-0.5 shadow-2xs">
                                  <span className="text-[10px] font-bold text-[var(--text-secondary)]">매월</span>
                                  <input
                                    type="text"
                                    inputMode="numeric"
                                    autoFocus
                                    placeholder="금액(원)"
                                    value={typingDepositGoal ? Number(typingDepositGoal.replace(/[^0-9]/g, '')).toLocaleString('ko-KR') : ''}
                                    onChange={(e) => setTypingDepositGoal(e.target.value.replace(/[^0-9]/g, ''))}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleSaveDepositGoal();
                                      if (e.key === 'Escape') setIsEditingDepositGoal(false);
                                    }}
                                    className="w-24 bg-transparent text-xs font-mono font-bold text-right text-[var(--text-primary)] outline-none"
                                  />
                                  <span className="text-[10px] text-[var(--text-secondary)]">원</span>
                                  <button
                                    type="button"
                                    onClick={handleSaveDepositGoal}
                                    className="p-1 text-[#10B981] hover:bg-[#10B981]/15 rounded-md transition-colors cursor-pointer"
                                    title="저장"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setIsEditingDepositGoal(false)}
                                    className="p-1 text-[var(--text-secondary)] hover:bg-[var(--card-hover)] rounded-md transition-colors cursor-pointer"
                                    title="취소"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : account.monthlyDepositGoal && account.monthlyDepositGoal > 0 ? (
                                <div className="inline-flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleExecuteInstantDeposit(account.monthlyDepositGoal!)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold border border-[var(--accent-orange)]/70 bg-[var(--card-surface)] text-[var(--accent-orange)] hover:bg-[var(--accent-orange)] hover:text-white hover:shadow-[0_0_18px_rgba(241,143,1,0.25)] transition-all cursor-pointer shadow-2xs"
                                    title="클릭 시 예수금에 즉시 입금 반영합니다"
                                  >
                                    <span>+ {formatDepositGoalBadge(account.monthlyDepositGoal)}</span>
                                    <span className="text-[10px] opacity-80 font-normal">적립</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setTypingDepositGoal(String(account.monthlyDepositGoal || ''));
                                      setIsEditingDepositGoal(true);
                                    }}
                                    className="p-1 text-[var(--text-secondary)] hover:text-[var(--accent-orange)] transition-colors cursor-pointer rounded-full"
                                    title="정기 적립금 수정"
                                    aria-label="정기 적립금 수정"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setTypingDepositGoal('');
                                    setIsEditingDepositGoal(true);
                                  }}
                                  className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[var(--accent-orange)] border border-[var(--accent-orange)]/70 bg-[var(--card-surface)] hover:bg-[var(--accent-orange)] hover:text-white hover:shadow-[0_0_18px_rgba(241,143,1,0.25)] rounded-full px-2.5 py-1 transition-all cursor-pointer shadow-2xs"
                                  title="매월 고정으로 입금할 적립금을 설정합니다"
                                >
                                  <Plus className="w-3 h-3 stroke-[2.5]" />
                                  <span>정기 적립금 설정</span>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        /* 환전 모드: 슬림 방향 슬라이딩 캡슐 + 여유 있는 입력란 + 바로 옆 반영 버튼 + 실시간 환산 */
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="relative inline-grid grid-cols-2 p-0.5 rounded-full bg-[var(--bg-main)]/90 backdrop-blur-md border border-[var(--border-color)]/90 shadow-2xs w-28 sm:w-32 select-none shrink-0 font-mono">
                            <div
                              className="absolute top-0.5 bottom-0.5 left-0.5 rounded-full bg-[var(--accent-orange)] shadow-[0_0_12px_rgba(241,143,1,0.35)] transition-transform duration-300 pointer-events-none"
                              style={{
                                width: 'calc((100% - 4px) / 2)',
                                transform: `translateX(${fxDirection === 'USD_TO_KRW' ? '0%' : '100%'})`,
                                transitionTimingFunction: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setFxDirection('USD_TO_KRW');
                                setFxAmount('');
                              }}
                              className={`relative z-10 w-full py-1 text-xs font-bold transition-colors duration-200 cursor-pointer text-center ${
                                fxDirection === 'USD_TO_KRW'
                                  ? 'text-white font-extrabold'
                                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                              }`}
                            >
                              $ ➔ ₩
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setFxDirection('KRW_TO_USD');
                                setFxAmount('');
                              }}
                              className={`relative z-10 w-full py-1 text-xs font-bold transition-colors duration-200 cursor-pointer text-center ${
                                fxDirection === 'KRW_TO_USD'
                                  ? 'text-white font-extrabold'
                                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                              }`}
                            >
                              ₩ ➔ $
                            </button>
                          </div>

                          <div className="relative w-28 sm:w-32">
                            <input
                              className="w-full bg-[var(--card-surface)] border border-[var(--border-color)] rounded-lg pl-2 pr-6 py-1 text-xs font-mono font-bold text-right text-[var(--text-primary)] outline-none focus:border-[var(--accent-orange)]"
                              inputMode={fxDirection === 'USD_TO_KRW' ? 'decimal' : 'numeric'}
                              placeholder="금액"
                              value={fxAmount}
                              onChange={(e) => {
                                const val = fxDirection === 'USD_TO_KRW'
                                  ? sanitizeDecimal(e.target.value)
                                  : e.target.value.replace(/[^0-9]/g, '');
                                setFxAmount(val);
                              }}
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-[var(--text-secondary)] font-mono pointer-events-none">
                              {fxDirection === 'USD_TO_KRW' ? '$' : '원'}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={handleExecuteInlineDeposit}
                            className={`${btnPrimaryPillCls} py-1 px-3 text-xs shrink-0`}
                          >
                            반영
                          </button>

                          {Number(fxAmount) > 0 && (
                            <span className="text-[11px] font-mono text-[var(--accent-emerald,#10B981)] font-bold shrink-0">
                              ≈ {fxDirection === 'USD_TO_KRW'
                                ? won(Math.round(Number(fxAmount) * (quotes.usdKrw || 1350) * (1 - ((1 - (account.fees?.fxDiscountPct ?? 95) / 100) * 0.01))))
                                : `$${(Number(fxAmount) / ((quotes.usdKrw || 1350) * (1 + ((1 - (account.fees?.fxDiscountPct ?? 95) / 100) * 0.01)))).toFixed(2)}`}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* 완료 버튼 */}
                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={handleFinishCashEdit}
                        className={`${btnPrimaryPillCls} px-6`}
                      >
                        <Check className="w-3.5 h-3.5" /> 완료
                      </button>
                    </div>
                  </div>
                )}
              </SmoothHeight>

              {/* 최근 입출금 내역 슬림 목록 (기록 확인 및 삭제 지원, 무료 최신 10건 · PRO 전체 무제한) */}
              {account.deposits && account.deposits.length > 0 && (() => {
                const displayedDeposits = isPro ? account.deposits : account.deposits.slice(0, 10);
                return (
                  <div className="pt-1 space-y-2">
                    <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] gap-2">
                      <span className="font-bold flex items-center gap-1 truncate">
                        {isPro ? '전체 입출금 내역' : '최근 입출금 내역'} ({displayedDeposits.length}건)
                      </span>
                      <span className="text-[11px] font-mono whitespace-nowrap shrink-0">
                        순 입금: {won(account.deposits.reduce((acc, cur) => acc + (cur.type === 'IN' ? cur.amountKrw : -cur.amountKrw), 0))}
                      </span>
                    </div>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {displayedDeposits.map((log) => (
                        <div
                          key={log.id}
                          className="flex items-center justify-between text-xs p-2 rounded-lg bg-[var(--bg-main)]/60 border border-[var(--border-color)]/60 gap-2"
                        >
                          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
                            <span
                              className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap shrink-0 ${
                                log.type === 'IN'
                                  ? 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/25'
                                  : 'bg-[#F43F5E]/10 text-[#F43F5E] border border-[#F43F5E]/25'
                              }`}
                            >
                              {log.type === 'IN' ? '입금' : '출금'}
                            </span>
                            <span className="font-mono text-[var(--text-secondary)] text-[11px] whitespace-nowrap shrink-0">
                              {formatLogDate(log.date)}
                            </span>
                            <span className="text-[var(--text-primary)] font-medium truncate min-w-0">
                              {log.memo}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 whitespace-nowrap">
                            <span className="font-mono font-bold text-[var(--text-primary)] whitespace-nowrap">
                              {log.type === 'IN' ? '+' : '-'}{won(log.amountKrw)}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveDeposit(log.id)}
                              className="text-[var(--text-secondary)] hover:text-[#F43F5E] p-0.5 cursor-pointer transition-colors shrink-0"
                              title="이 입출금 기록 삭제"
                              aria-label="입출금 기록 삭제"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* 토글 옵션 */}
              <div className="grid sm:grid-cols-2 gap-4 pt-3">
                <Toggle
                  on={account.noSell}
                  onChange={(v) => updateAccount({ noSell: v })}
                  label="판매 없이 모으기만"
                  hint="목표 비중을 초과한 자산은 팔지 않고, 부족한 자산에만 새 자금을 배분합니다."
                />
                <Toggle
                  on={account.fractional}
                  onChange={(v) => updateAccount({ fractional: v })}
                  label="주식 소수점 구매 지원"
                  hint="주식을 소수점으로 살 수 있는 계좌인 경우 켜주세요."
                />
              </div>

              {/* 하단: 거래 비용 & 수수료 접이식 설정 */}
              <div className="pt-3 border-t border-[var(--border-color)]/60">
                <button
                  type="button"
                  onClick={() => setShowFeeSettings((v) => !v)}
                  className="text-xs text-[var(--text-secondary)] hover:text-[var(--accent-orange)] flex items-center gap-1.5 font-bold transition-colors cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>거래 비용 & 수수료 설정 (선택)</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${showFeeSettings ? 'rotate-180' : ''}`} />
                </button>

                <SmoothHeight>
                  {showFeeSettings && (
                    <div className="grid sm:grid-cols-3 gap-3 p-1.5 text-xs">
                      {/* 국내 주식 수수료 */}
                      <div className="space-y-1">
                        <label className="block text-[11px] text-[var(--text-secondary)]">
                          국내 주식 수수료 (%)
                        </label>
                        <input
                          className={inputCls}
                          inputMode="decimal"
                          placeholder="0.015"
                          value={typingKrFee !== null ? typingKrFee : (account.fees?.krFeePct !== undefined ? String(account.fees.krFeePct) : '0.015')}
                          onChange={(e) => {
                            const cleaned = sanitizeDecimal(e.target.value);
                            setTypingKrFee(cleaned);
                            const val = parseFloat(cleaned);
                            updateAccount({ fees: { ...(account.fees || {}), krFeePct: isNaN(val) ? 0 : val } });
                          }}
                          onBlur={() => setTypingKrFee(null)}
                        />
                      </div>

                      {/* 해외 주식 수수료 */}
                      <div className="space-y-1">
                        <label className="block text-[11px] text-[var(--text-secondary)]">
                          해외 주식 수수료 (%)
                        </label>
                        <input
                          className={inputCls}
                          inputMode="decimal"
                          placeholder="0.07"
                          value={typingUsFee !== null ? typingUsFee : (account.fees?.usFeePct !== undefined ? String(account.fees.usFeePct) : '0.07')}
                          onChange={(e) => {
                            const cleaned = sanitizeDecimal(e.target.value);
                            setTypingUsFee(cleaned);
                            const val = parseFloat(cleaned);
                            updateAccount({ fees: { ...(account.fees || {}), usFeePct: isNaN(val) ? 0 : val } });
                          }}
                          onBlur={() => setTypingUsFee(null)}
                        />
                      </div>

                      {/* 환율 우대 (%) */}
                      <div className="space-y-1">
                        <label className="block text-[11px] text-[var(--text-secondary)]">
                          환율 우대 (%)
                        </label>
                        <div className="relative">
                          <input
                            className={`${inputCls} pr-6`}
                            inputMode="decimal"
                            placeholder="95"
                            value={typingFxDiscount !== null ? typingFxDiscount : (account.fees?.fxDiscountPct !== undefined ? String(account.fees.fxDiscountPct) : '95')}
                            onChange={(e) => {
                              const cleaned = sanitizeDecimal(e.target.value);
                              setTypingFxDiscount(cleaned);
                              const val = parseFloat(cleaned);
                              const validVal = isNaN(val) ? 0 : Math.min(100, Math.max(0, val));
                              updateAccount({
                                fees: {
                                  ...(account.fees || {}),
                                  fxDiscountPct: validVal,
                                  fxFeePct: Math.round((1 - validVal / 100) * 1000) / 1000,
                                },
                              });
                            }}
                            onBlur={() => setTypingFxDiscount(null)}
                          />
                          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[var(--text-secondary)] font-bold pointer-events-none">
                            %
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </SmoothHeight>
              </div>
            </div>

            {/* 자산군 목표 비율 설정 */}
            <div className={`${cardCls} p-5 sm:p-6 space-y-4`}>
              <div className="flex items-center justify-between gap-2">
                  <h2 className="text-base font-extrabold text-[var(--text-primary)] flex items-center gap-2 truncate">
                    <Layers className="w-4 h-4 text-[var(--accent-orange)] shrink-0" />
                    <span>목표 비율 설정</span>
                  </h2>

                  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    {account.groups.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsReorderingGroups((v) => !v);
                          setEditingGroupId(null);
                        }}
                        className={
                          isReorderingGroups
                            ? 'p-1.5 text-[var(--accent-orange)] transition-colors cursor-pointer flex items-center justify-center'
                            : 'p-1.5 text-[var(--text-secondary)] hover:text-[var(--accent-orange)] transition-colors cursor-pointer flex items-center justify-center'
                        }
                        title={isReorderingGroups ? '순서 저장 완료' : '자산군 순서 변경'}
                        aria-label="자산군 순서 변경"
                      >
                        {isReorderingGroups ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <ArrowUpDown className="w-4 h-4" />
                        )}
                      </button>
                    )}

                    {account.groups.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setIsAddGroupOpen((v) => !v)}
                        className={
                          isAddGroupOpen
                            ? 'px-3 py-1.5 rounded-full text-xs font-extrabold bg-[var(--accent-orange)] text-white shadow-sm hover:brightness-105 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0'
                            : 'px-3 py-1.5 rounded-full text-xs font-extrabold border border-[var(--accent-orange)]/70 bg-[var(--card-surface)] text-[var(--accent-orange)] hover:bg-[var(--accent-orange)] hover:text-white hover:shadow-[0_0_18px_rgba(241,143,1,0.25)] transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs whitespace-nowrap shrink-0'
                        }
                        title={isAddGroupOpen ? '추가 폼 닫기' : '새 자산군 추가'}
                      >
                        {isAddGroupOpen ? (
                          <>
                            <X className="w-3.5 h-3.5" /> <span>닫기</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5 stroke-[2.5]" /> <span>자산군 추가</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
              </div>

              {plan?.isOverAllocated && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>목표 비율의 합이 100%를 초과했습니다. 합계가 100% 이하가 되도록 조절해 주세요.</span>
                </div>
              )}

              {account.groups.length === 0 && !isAddGroupOpen && (
                <div className="py-10 text-center space-y-3.5 border border-dashed border-[var(--border-color)]/80 rounded-2xl bg-[var(--bg-main)]/30">
                  <div className="w-10 h-10 rounded-full bg-[var(--accent-orange)]/10 text-[var(--accent-orange)] flex items-center justify-center mx-auto">
                    <Layers className="w-5 h-5 stroke-[1.8]" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-[var(--text-primary)]">
                      아직 추가된 자산군이 없습니다.
                    </p>
                    <p className="text-[11px] text-[var(--text-secondary)]">
                      원하는 자산(예: S&P 500, 비트코인, 금 등)을 등록해 목표 비율을 설정해 보세요.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAddGroupOpen(true)}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-[var(--accent-orange)] text-white hover:brightness-105 shadow-sm hover:shadow-[0_0_18px_rgba(241,143,1,0.25)] transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>자산군 추가하기</span>
                  </button>
                </div>
              )}

              {/* 자산 직접 추가 폼 (목록 최상단 배치로 즉시 확인 가능, SmoothHeight 아코디언 애니메이션) */}
              <SmoothHeight>
                {isAddGroupOpen ? (
                  <form
                    onSubmit={handleAddDirectGroup}
                    className="rounded-2xl border border-[var(--accent-orange)]/50 bg-white dark:bg-[var(--card-surface)] p-4 sm:p-5 space-y-3.5 shadow-md animate-fadeIn mb-3"
                  >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-primary)]">
                      <Plus className="w-3.5 h-3.5 text-[var(--accent-orange)]" />
                      <span>새 자산군 추가</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsAddGroupOpen(false)}
                      className="p-1 rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                      title="닫기"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="grid sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-[var(--text-secondary)] mb-1">
                          자산군 이름
                        </label>
                        <input
                          className={inputCls}
                          placeholder="예: S&P 500, 비트코인, 금 등"
                          value={newGroupName}
                          onChange={(e) => setNewGroupName(e.target.value)}
                        />
                      </div>

                      <div>
                        {/* 종목코드 라벨 바로 옆 인라인 (?) 팁 버튼 */}
                        <div className="flex items-center gap-1.5 mb-1">
                          <label className="block text-[11px] font-bold text-[var(--text-secondary)]">
                            종목 코드 또는 티커
                          </label>
                          <button
                            type="button"
                            onClick={() => setShowCodeHelp((v) => !v)}
                            className="text-[var(--text-secondary)] hover:text-[var(--accent-orange)] transition-colors cursor-pointer"
                            title="코드 입력 팁 열기/닫기"
                            aria-label="코드 입력 팁 토글"
                          >
                            <HelpCircle className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <input
                          className={`${inputCls} font-mono`}
                          placeholder="예: VOO, 005930, 360200, 비트코인"
                          value={newGroupSymbol}
                          onChange={(e) => setNewGroupSymbol(e.target.value)}
                          required
                        />

                        {/* 실시간 종목 및 시세 확인 안내 */}
                        {isSearchingSymbol && (
                          <p className="text-[11px] text-[var(--text-secondary)] font-medium flex items-center gap-1.5 mt-1.5">
                            <Loader2 className="w-3 h-3 animate-spin text-[var(--accent-orange)]" />
                            종목 시세를 확인하고 있습니다...
                          </p>
                        )}
                        {!isSearchingSymbol && newGroupSymbolInfo && (
                          <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-[var(--accent-emerald,#10B981)] font-bold">
                            <Check className="w-3.5 h-3.5 shrink-0" />
                            <span>{newGroupSymbolInfo.name || newGroupSymbol.trim()}</span>
                            <span className="font-mono text-[var(--text-secondary)] font-normal">
                              · 현재 가격 {won(newGroupSymbolInfo.priceKrw || newGroupSymbolInfo.price)}{newGroupSymbolInfo.currency === 'USD' ? ` ($${newGroupSymbolInfo.price.toFixed(2)})` : ''}
                            </span>
                          </div>
                        )}
                        {!isSearchingSymbol && symbolSearchError && (
                          <p className="text-[11px] text-[#F43F5E] font-medium flex items-center gap-1 mt-1.5">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>{symbolSearchError}</span>
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[var(--text-secondary)] mb-1">
                          목표 비율 (%)
                        </label>
                        <div className="relative">
                          <input
                            className={`${inputCls} font-mono pr-6 text-right`}
                            inputMode="decimal"
                            placeholder="30"
                            value={newGroupWeight}
                            onChange={(e) => setNewGroupWeight(e.target.value.replace(/[^0-9.]/g, ''))}
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--text-secondary)]">
                            %
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 최초 보유 수량 및 구매 일자 / 단가 입력 (등록과 동시에 거래 기록 아카이빙) */}
                    <div className="p-3 rounded-xl bg-[var(--bg-main)]/70 border border-[var(--border-color)]/70 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-[var(--text-primary)]">
                          이미 보유 중인 주식/자산이 있나요? (선택)
                        </span>
                        <span className="text-[10px] text-[var(--text-secondary)]">
                          입력 시 거래 기록에도 구매 내역으로 자동 저장됩니다.
                        </span>
                      </div>

                      <div className="grid sm:grid-cols-3 gap-3 items-end">
                        <div>
                          <label className="block text-[10px] font-bold text-[var(--text-secondary)] mb-1">
                            현재 보유 수량
                          </label>
                          <input
                            className={`${inputCls} font-mono font-bold text-right`}
                            inputMode="decimal"
                            placeholder="0 (없으면 0)"
                            value={newGroupHoldings}
                            onChange={(e) => setNewGroupHoldings(e.target.value.replace(/[^0-9.]/g, ''))}
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-[var(--text-secondary)] mb-1">
                            구매 일자
                          </label>
                          <input
                            type="date"
                            value={newGroupTradeDate}
                            onChange={async (e) => {
                              const nd = e.target.value;
                              setNewGroupTradeDate(nd);
                              if (newGroupSymbol.trim() && nd) {
                                const hist = await fetchPastPrice(newGroupSymbol.trim(), nd);
                                if (hist) {
                                  if (hist.priceKrw > 0) {
                                    setNewGroupAvgPrice(String(hist.priceKrw));
                                  }
                                  if (hist.currency === 'USD' && hist.price > 0) {
                                    setNewGroupAvgPriceUsd(String(hist.price));
                                  }
                                }
                              }
                            }}
                            className={`${inputCls} font-mono`}
                          />
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-[10px] font-bold text-[var(--text-secondary)]">
                              평균 구매 단가
                            </label>
                            {isLoadingHistoryPrice && (
                              <span className="text-[10px] text-[var(--accent-orange)] font-bold animate-pulse">
                                시세 조회 중...
                              </span>
                            )}
                          </div>
                          <div className="relative">
                            <input
                              className={`${inputCls} font-mono font-bold text-right pr-6`}
                              inputMode="numeric"
                              placeholder="원 단위 (자동 조회)"
                              value={newGroupAvgPrice ? Number(newGroupAvgPrice.replace(/[^0-9]/g, '')).toLocaleString('ko-KR') : ''}
                              onChange={(e) => setNewGroupAvgPrice(e.target.value.replace(/[^0-9]/g, ''))}
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--text-secondary)]">
                              원
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        type="submit"
                        disabled={!newGroupSymbol.trim()}
                        className={`${btnPrimaryPillCls} px-6`}
                      >
                        <Plus className="w-3.5 h-3.5" /> 자산군 등록
                      </button>
                    </div>
                  </div>

                  {/* 인라인 티커 가이드 박스 (아래 카드에 절대 가려지지 않는 인라인 확장형) */}
                  <SmoothHeight>
                    {showCodeHelp && (
                      <div className="p-3.5 rounded-xl bg-[var(--card-surface)] border border-[var(--accent-orange)]/40 shadow-2xs space-y-2 text-xs animate-fadeIn">
                        <div className="flex items-center justify-between font-bold">
                          <span className="flex items-center gap-1.5 text-xs text-[var(--text-primary)]">
                            💡 종목 코드 입력 팁
                          </span>
                          <button
                            type="button"
                            onClick={() => setShowCodeHelp(false)}
                            className="p-1 rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                            title="닫기"
                            aria-label="팁 닫기"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <ul className="grid sm:grid-cols-2 gap-1.5 text-[11px] text-[var(--text-secondary)] leading-relaxed">
                          <li>• <b className="text-[var(--text-primary)]">한국 주식/ETF</b>: <code className="text-[var(--text-primary)] bg-[var(--bg-main)] px-1 py-0.5 rounded font-mono">005930</code>, <code className="text-[var(--text-primary)] bg-[var(--bg-main)] px-1 py-0.5 rounded font-mono">360750</code> 등 6자리</li>
                          <li>• <b className="text-[var(--text-primary)]">미국 주식/ETF</b>: <code className="text-[var(--text-primary)] bg-[var(--bg-main)] px-1 py-0.5 rounded font-mono">VOO</code>, <code className="text-[var(--text-primary)] bg-[var(--bg-main)] px-1 py-0.5 rounded font-mono">SPY</code>, <code className="text-[var(--text-primary)] bg-[var(--bg-main)] px-1 py-0.5 rounded font-mono">AAPL</code> 등</li>
                          <li>• <b className="text-[var(--text-primary)]">일본 주식</b>: 티커 뒤 <code className="text-[var(--text-primary)] bg-[var(--bg-main)] px-1 py-0.5 rounded font-mono">.T</code> (예: <code className="text-[var(--text-primary)] bg-[var(--bg-main)] px-1 py-0.5 rounded font-mono">7974.T</code> 닌텐도, <code className="text-[var(--text-primary)] bg-[var(--bg-main)] px-1 py-0.5 rounded font-mono">7203.T</code> 토요타)</li>
                          <li>• <b className="text-[var(--text-primary)]">중국/홍콩 주식</b>: 티커 뒤 <code className="text-[var(--text-primary)] bg-[var(--bg-main)] px-1 py-0.5 rounded font-mono">.HK</code> (예: <code className="text-[var(--text-primary)] bg-[var(--bg-main)] px-1 py-0.5 rounded font-mono">0700.HK</code> 텐센트)</li>
                          <li>• <b className="text-[var(--text-primary)]">암호화폐</b>: <code className="text-[var(--text-primary)] bg-[var(--bg-main)] px-1 py-0.5 rounded font-mono">비트코인</code>, <code className="text-[var(--text-primary)] bg-[var(--bg-main)] px-1 py-0.5 rounded font-mono">이더리움</code> 등 한글 직접 입력</li>
                          <li>• <b className="text-[var(--text-primary)]">실물 금</b>: <code className="text-[var(--text-primary)] bg-[var(--bg-main)] px-1 py-0.5 rounded font-mono">금</code>, <code className="text-[var(--text-primary)] bg-[var(--bg-main)] px-1 py-0.5 rounded font-mono">금현물</code> (국제 1g 시세)</li>
                        </ul>
                      </div>
                    )}
                  </SmoothHeight>
                </form>
              ) : null}
              </SmoothHeight>

              {/* 자산군 카드 목록 */}
              <div className="space-y-3">
                {account.groups.map((g, gIdx) => {
                  const status = plan?.statuses.find((s) => s.groupId === g.id);
                  const isAddSymbolOpen = expandedAddSymbolGroupId === g.id;
                  const isFirst = gIdx === 0;
                  const isLast = gIdx === account.groups.length - 1;

                  return (
                    <div
                      key={g.id}
                      ref={(el) => {
                        if (el) groupCardRefs.current.set(g.id, el);
                        else groupCardRefs.current.delete(g.id);
                      }}
                      draggable={isReorderingGroups}
                      onDragStart={(e) => handleGroupDragStart(e, gIdx)}
                      onDragEnter={() => handleGroupDragEnter(gIdx)}
                      onDragOver={handleGroupDragOver}
                      onDrop={handleGroupDrop}
                      onDragEnd={handleGroupDragEnd}
                      className={`rounded-2xl border bg-[var(--bg-main)]/50 p-4 space-y-3.5 shadow-2xs ${
                        draggedGroupIndex === gIdx
                          ? 'border-[var(--accent-orange)] opacity-50 scale-[0.99]'
                          : isReorderingGroups
                            ? 'border-[var(--accent-orange)]/40 hover:border-[var(--accent-orange)]'
                            : 'border-[var(--border-color)]/90 hover:border-[var(--accent-orange)]/40'
                      }`}
                    >
                      {/* 자산군 헤더: 평소 Read-Only & 연필 클릭 시 수정 & 순서 편집 모드 */}
                      <SmoothHeight>
                        {editingGroupId === g.id ? (
                          <div className="flex items-center gap-2 w-full py-1.5 px-0.5">
                            <input
                              className={`${inputCls} font-extrabold bg-[var(--card-surface)] text-sm flex-1`}
                              value={g.name}
                              onChange={(e) => updateGroup(g.id, { name: e.target.value.slice(0, 30) })}
                              aria-label="자산군 이름"
                              autoFocus
                            />
                            <div className="relative w-24 shrink-0">
                              <input
                                className={`${inputCls} pr-6 text-right font-mono font-bold bg-[var(--card-surface)]`}
                                inputMode="decimal"
                                value={typingWeights[g.id] !== undefined ? typingWeights[g.id] : (g.weight || '')}
                                placeholder="0"
                                onChange={(e) => {
                                  const raw = e.target.value.replace(/[^0-9.]/g, '');
                                  setTypingWeights((prev) => ({ ...prev, [g.id]: raw }));
                                  const n = Number(raw);
                                  if (Number.isFinite(n) && !raw.endsWith('.')) {
                                    updateGroup(g.id, { weight: Math.min(100, Math.max(0, n)) });
                                  }
                                }}
                                onBlur={() => {
                                  const raw = typingWeights[g.id];
                                  if (raw !== undefined) {
                                    const n = Number(raw);
                                    updateGroup(g.id, { weight: Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : 0 });
                                    setTypingWeights((prev) => {
                                      const next = { ...prev };
                                      delete next[g.id];
                                      return next;
                                    });
                                  }
                                }}
                                aria-label="목표 비율"
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--text-secondary)]">
                                %
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setEditingGroupId(null)}
                              className="px-3 py-1.5 rounded-full text-xs font-bold bg-[var(--accent-orange)] text-white hover:opacity-90 transition-opacity shrink-0 cursor-pointer shadow-2xs"
                            >
                              ✓ 완료
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between gap-2 w-full">
                            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-wrap">
                              {isReorderingGroups && (
                                <div
                                  className="cursor-grab active:cursor-grabbing p-1 -ml-1 text-[var(--text-secondary)] hover:text-[var(--accent-orange)] transition-colors shrink-0"
                                  title="마우스로 끌어서 순서 변경"
                                >
                                  <GripVertical className="w-4 h-4" />
                                </div>
                              )}
                              <span className="font-extrabold text-[var(--text-primary)] text-sm truncate">
                                {g.name}
                              </span>
                              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[var(--card-surface)] text-[var(--accent-orange)] border border-[var(--border-color)]/80 shrink-0">
                                목표 {g.weight}%
                              </span>
                              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-[var(--card-surface)] text-[var(--text-secondary)] border border-[var(--border-color)]/70 shrink-0">
                                현재 {status ? status.currentPct.toFixed(1) : '0.0'}%
                              </span>
                              {!isReorderingGroups && (
                                <button
                                  type="button"
                                  onClick={() => setEditingGroupId(g.id)}
                                  className="p-1 text-[var(--text-secondary)] hover:text-[var(--accent-orange)] transition-colors cursor-pointer"
                                  title="자산군 이름 및 목표 비율 수정"
                                  aria-label="자산군 수정"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>

                            {isReorderingGroups ? (
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  disabled={isFirst}
                                  onClick={() => moveGroup(gIdx, gIdx - 1)}
                                  className={`p-1.5 rounded-lg border border-[var(--border-color)]/80 transition-colors ${
                                    isFirst
                                      ? 'opacity-30 cursor-not-allowed text-[var(--text-secondary)]'
                                      : 'hover:border-[var(--accent-orange)] hover:text-[var(--accent-orange)] text-[var(--text-secondary)] cursor-pointer bg-[var(--card-surface)]'
                                  }`}
                                  title="위로 이동"
                                  aria-label="위로 이동"
                                >
                                  <ChevronUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  disabled={isLast}
                                  onClick={() => moveGroup(gIdx, gIdx + 1)}
                                  className={`p-1.5 rounded-lg border border-[var(--border-color)]/80 transition-colors ${
                                    isLast
                                      ? 'opacity-30 cursor-not-allowed text-[var(--text-secondary)]'
                                      : 'hover:border-[var(--accent-orange)] hover:text-[var(--accent-orange)] text-[var(--text-secondary)] cursor-pointer bg-[var(--card-surface)]'
                                  }`}
                                  title="아래로 이동"
                                  aria-label="아래로 이동"
                                >
                                  <ChevronDown className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => setExpandedAddSymbolGroupId(isAddSymbolOpen ? null : g.id)}
                                  className={`p-1 rounded-md transition-colors cursor-pointer border-0 outline-none ${
                                    isAddSymbolOpen
                                      ? 'text-[var(--accent-orange)]'
                                      : 'text-[var(--text-secondary)] hover:text-[var(--accent-orange)]'
                                  }`}
                                  aria-label="같은 자산군에 종목 추가"
                                  title="같은 자산군에 종목 추가"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeGroup(g.id)}
                                  className="p-1 text-[var(--text-secondary)] hover:text-[#F43F5E] rounded-md transition-colors shrink-0 cursor-pointer border-0 outline-none"
                                  aria-label="자산군 삭제"
                                  title="자산군 삭제"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </SmoothHeight>

                      {/* 종목 카드 목록 */}
                      <div className="space-y-2.5">
                        {g.symbols.map((sym, symIdx) => {
                          const p = priceKrw(sym, quotes);
                          const name = symbolName(sym, quotes);
                          const isBuy = g.buySymbol === sym;
                          const qty = g.holdings[sym] || 0;
                          const avg = g.avgPrices?.[sym] || (p || 0);
                          const evalAmount = qty * (p || 0);
                          const investAmount = avg > 0 ? qty * avg : 0;
                          const profitRate =
                            investAmount > 0 ? ((evalAmount - investAmount) / investAmount) * 100 : null;
                          const isCrypto = isCryptoSymbol(sym);

                          // 달러 통화 자산 판별 (통화가 USD인 미국 자산만 달러 모드 지원)
                          const quoteEntry = quotes.quotes[sym];
                          const isUsdAsset = quoteEntry?.currency === 'USD';
                          const currencyMode = avgPriceCurrencyMode[sym] || (isUsdAsset ? 'USD' : 'KRW');
                          const usdRate = quotes.usdKrw || 1350;

                          // 달러 기준 평단가 및 주가 손익률 계산 (달러 원본 평단가 보존 우선)
                          const avgUsd = g.avgPricesUsd?.[sym] ?? (avg > 0 ? Math.round((avg / usdRate) * 100) / 100 : (quoteEntry?.price || 0));
                          const usdMarketPrice = quoteEntry?.currency === 'USD' ? quoteEntry.price : null;
                          const usdProfitRate = usdMarketPrice && avgUsd > 0 ? ((usdMarketPrice - avgUsd) / avgUsd) * 100 : null;

                          return (
                            <div
                              key={sym}
                              className="bg-[var(--card-surface)] border border-[var(--border-color)]/70 rounded-xl p-3 space-y-2.5 shadow-2xs"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
                                  {g.symbols.length > 1 ? (
                                    <button
                                      type="button"
                                      onClick={() => updateGroup(g.id, { buySymbol: sym })}
                                      className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-bold shrink-0 transition-colors cursor-pointer whitespace-nowrap ${
                                        isBuy
                                          ? 'bg-[var(--accent-orange)] text-white shadow-2xs'
                                          : 'bg-[var(--bg-main)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-color)]'
                                      }`}
                                      title="새로운 자금으로 구매할 종목으로 선택"
                                    >
                                      {isBuy ? '✓ 구매' : '선택'}
                                    </button>
                                  ) : (
                                    <span className="px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-[var(--accent-orange)]/15 text-[var(--accent-orange)] shrink-0 whitespace-nowrap">
                                      구매종목
                                    </span>
                                  )}

                                  {/* 종목명 + 티커 + 삭제 버튼 */}
                                  <div className="min-w-0 flex-1 flex items-center gap-1 sm:gap-1.5">
                                    <span className="font-extrabold text-xs sm:text-sm text-[var(--text-primary)] truncate">
                                      {name}
                                    </span>
                                    <span className="font-mono text-[10px] sm:text-[11px] text-[var(--text-secondary)] whitespace-nowrap shrink-0">
                                      ({sym})
                                    </span>
                                    {g.symbols.length > 1 && (
                                      <button
                                        type="button"
                                        onClick={() => removeSymbolFromGroup(g, sym)}
                                        className="p-0.5 rounded-full text-[var(--text-secondary)] hover:text-[#F43F5E] hover:bg-[var(--bg-main)] transition-colors cursor-pointer shrink-0"
                                        title="종목 삭제"
                                        aria-label="종목 삭제"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    )}
                                  </div>
                                </div>

                                <div className="text-right shrink-0 whitespace-nowrap pl-2 flex items-center gap-2">
                                  <div className="flex flex-col items-end font-mono">
                                    <span className="font-extrabold text-xs sm:text-sm text-[var(--text-primary)] whitespace-nowrap">
                                      {won(evalAmount)}
                                    </span>
                                    <span className="text-[10px] text-[var(--text-secondary)] whitespace-nowrap">
                                      평가 금액
                                    </span>
                                  </div>
                                  {isReorderingGroups && g.symbols.length > 1 && (
                                    <div className="flex items-center gap-0.5 shrink-0 pl-1 border-l border-[var(--border-color)]/60">
                                      <button
                                        type="button"
                                        disabled={symIdx === 0}
                                        onClick={() => moveSymbolInGroup(g.id, symIdx, symIdx - 1)}
                                        className={`p-1 rounded-md border border-[var(--border-color)]/80 transition-colors ${
                                          symIdx === 0
                                            ? 'opacity-25 cursor-not-allowed text-[var(--text-secondary)]'
                                            : 'hover:border-[var(--accent-orange)] hover:text-[var(--accent-orange)] text-[var(--text-secondary)] cursor-pointer bg-[var(--bg-main)]'
                                        }`}
                                        title="종목 순서 위로 이동"
                                        aria-label="위로 이동"
                                      >
                                        <ChevronUp className="w-3 h-3" />
                                      </button>
                                      <button
                                        type="button"
                                        disabled={symIdx === g.symbols.length - 1}
                                        onClick={() => moveSymbolInGroup(g.id, symIdx, symIdx + 1)}
                                        className={`p-1 rounded-md border border-[var(--border-color)]/80 transition-colors ${
                                          symIdx === g.symbols.length - 1
                                            ? 'opacity-25 cursor-not-allowed text-[var(--text-secondary)]'
                                            : 'hover:border-[var(--accent-orange)] hover:text-[var(--accent-orange)] text-[var(--text-secondary)] cursor-pointer bg-[var(--bg-main)]'
                                        }`}
                                        title="종목 순서 아래로 이동"
                                        aria-label="아래로 이동"
                                      >
                                        <ChevronDown className="w-3 h-3" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* 평소 상태(Read-Only) vs 연필 수정 모드 (SmoothHeight 적용) */}
                              <SmoothHeight>
                                {editingSymbol !== sym ? (
                                /* 1. 평소 상태: 깔끔한 타이포그래피와 핵심 지표 요약 */
                                <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-0.5">
                                  <div className="flex items-center gap-4 flex-wrap font-mono">
                                    <div>
                                      <span className="text-[10px] text-[var(--text-secondary)] block">보유 수량</span>
                                      <span className="font-extrabold text-xs text-[var(--text-primary)]">
                                        {formatQuantity(qty, isCrypto)}{getSymbolUnit(sym)}
                                      </span>
                                    </div>

                                    <div>
                                      <span className="text-[10px] text-[var(--text-secondary)] block">평균 단가</span>
                                      <span className="font-extrabold text-xs text-[var(--text-primary)]">
                                        {avg > 0
                                          ? isUsdAsset && avgUsd > 0
                                            ? `${won(avg)} ($${avgUsd.toFixed(2)})`
                                            : won(avg)
                                          : '-'}
                                      </span>
                                    </div>

                                    <div>
                                      <span className="text-[10px] text-[var(--text-secondary)] block">현재 가격</span>
                                      <span className="font-extrabold text-xs text-[var(--text-primary)]">
                                        {p
                                          ? isUsdAsset && usdMarketPrice
                                            ? `${won(p)} ($${usdMarketPrice.toFixed(2)})`
                                            : won(p)
                                          : '시세 조회 중...'}
                                      </span>
                                    </div>

                                    {profitRate !== null && (
                                      <div>
                                        <span className="text-[10px] text-[var(--text-secondary)] block">수익률</span>
                                        <span
                                          className={`font-extrabold text-xs ${
                                            profitRate >= 0 ? 'text-[var(--accent-emerald,#10B981)]' : 'text-[#F43F5E]'
                                          }`}
                                        >
                                          {profitRate >= 0 ? '+' : ''}
                                          {profitRate.toFixed(1)}%
                                          {isUsdAsset && usdProfitRate !== null && (
                                            <span className="text-[10px] text-[var(--text-secondary)] font-medium ml-1">
                                              (달러 {usdProfitRate >= 0 ? '+' : ''}{usdProfitRate.toFixed(1)}%)
                                            </span>
                                          )}
                                        </span>
                                      </div>
                                    )}

                                    {/* 수치 목록 맨 끝 연필(수정) 버튼 */}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        symbolEditInitialRef.current = {
                                          groupId: g.id,
                                          symbol: sym,
                                          qty: g.holdings[sym] || 0,
                                          avgPriceKrw: g.avgPrices?.[sym] || (p || 0),
                                        };
                                        setEditingSymbol(sym);
                                      }}
                                      className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--accent-orange)] hover:bg-[var(--accent-orange)]/10 rounded-full transition-colors cursor-pointer self-end mb-0.5"
                                      title="보유 수량 및 평균 단가 수정"
                                      aria-label="보유 수량 및 평균 단가 수정"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>

                                    <div className="flex items-center gap-1.5 ml-auto">
                                      {/* 거래 기록 추가 버튼 */}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (manualTradeSymbol === sym) {
                                          setManualTradeSymbol(null);
                                        } else {
                                          setManualTradeSymbol(sym);
                                          setManualTradeType('BUY');
                                          setManualTradeQty('');
                                          setManualTradePrice(
                                            isUsdAsset
                                              ? (quoteEntry?.price ? String(quoteEntry.price) : (avgUsd > 0 ? String(avgUsd) : ''))
                                              : (p ? String(p) : String(avg || ''))
                                          );
                                          setManualTradeDate(getLocalDateString());
                                        }
                                      }}
                                      className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
                                        manualTradeSymbol === sym
                                          ? 'border-[var(--accent-orange)] text-[var(--accent-orange)] bg-[var(--accent-orange)]/10'
                                          : 'border-[var(--border-color)]/90 bg-[var(--card-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent-orange)]'
                                      }`}
                                      title="실제 거래 기록 추가"
                                    >
                                      + 거래 기록
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                /* 2. 인라인 수정 모드 (연필 클릭 시) */
                                <div className="p-3 rounded-xl bg-[var(--bg-main)]/70 border border-[var(--accent-orange)]/50 space-y-3">
                                  <div className="flex flex-wrap items-center justify-between gap-2.5 text-xs">
                                    <div className="flex items-center gap-3 flex-wrap">
                                      {/* 평균단가 입력 및 달러/원화 캡슐 토글 */}
                                      <div className="space-y-1">
                                        <div className="flex items-center justify-between gap-1">
                                          <span className="text-[11px] font-bold text-[var(--text-secondary)]">평균 단가</span>
                                          {isUsdAsset && (
                                            <div className="relative inline-grid grid-cols-2 p-0.5 rounded-full bg-[var(--bg-main)]/90 backdrop-blur-md border border-[var(--border-color)]/90 shadow-2xs w-16 select-none">
                                              <div
                                                className="absolute top-0.5 bottom-0.5 left-0.5 rounded-full bg-[var(--card-surface)] border border-[rgba(241,143,1,0.6)] shadow-[0_0_8px_rgba(241,143,1,0.25)] transition-transform duration-300 pointer-events-none"
                                                style={{
                                                  width: 'calc((100% - 4px) / 2)',
                                                  transform: `translateX(${currencyMode === 'USD' ? '0%' : '100%'})`,
                                                  transitionTimingFunction: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
                                                }}
                                              />
                                              <button
                                                type="button"
                                                onClick={() => setAvgPriceCurrencyMode((prev) => ({ ...prev, [sym]: 'USD' }))}
                                                className={`relative z-10 w-full flex items-center justify-center py-0.5 px-1.5 rounded-full text-[10px] font-bold transition-colors duration-200 cursor-pointer text-center select-none ${
                                                  currencyMode === 'USD'
                                                    ? 'text-[var(--accent-orange)] font-extrabold'
                                                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                                                }`}
                                              >
                                                $
                                              </button>
                                              <button
                                                type="button"
                                                onClick={() => setAvgPriceCurrencyMode((prev) => ({ ...prev, [sym]: 'KRW' }))}
                                                className={`relative z-10 w-full flex items-center justify-center py-0.5 px-1.5 rounded-full text-[10px] font-bold transition-colors duration-200 cursor-pointer text-center select-none ${
                                                  currencyMode === 'KRW'
                                                    ? 'text-[var(--accent-orange)] font-extrabold'
                                                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                                                }`}
                                              >
                                                ₩
                                              </button>
                                            </div>
                                          )}
                                        </div>
                                        <div className="relative w-28 sm:w-32">
                                          <input
                                            className="w-full bg-[var(--card-surface)] border border-[var(--border-color)] rounded-lg px-2.5 py-1 text-xs font-mono text-right text-[var(--text-primary)] outline-none focus:border-[var(--accent-orange)]"
                                            inputMode={currencyMode === 'USD' ? 'decimal' : 'numeric'}
                                            placeholder={currencyMode === 'USD' ? (usdMarketPrice ? String(usdMarketPrice) : '시세 자동') : (p ? String(p) : '시세 자동')}
                                            value={
                                              typingAvgPrices[sym] !== undefined
                                                ? typingAvgPrices[sym]
                                                : currencyMode === 'USD'
                                                ? (avgUsd > 0 ? String(avgUsd) : '')
                                                : (avg > 0 ? avg.toLocaleString('ko-KR') : '')
                                            }
                                            onChange={(e) => {
                                              const raw = e.target.value.replace(/[^0-9.]/g, '');
                                              setTypingAvgPrices((prev) => ({ ...prev, [sym]: raw }));
                                              const valNum = Number(raw);
                                              if (Number.isFinite(valNum) && !raw.endsWith('.')) {
                                                const krwVal = currencyMode === 'USD' ? Math.round(valNum * usdRate) : Math.round(valNum);
                                                const usdVal = currencyMode === 'USD' ? Math.round(valNum * 100) / 100 : Math.round((valNum / usdRate) * 100) / 100;
                                                updateGroup(g.id, {
                                                  avgPrices: { ...(g.avgPrices || {}), [sym]: krwVal },
                                                  ...(isUsdAsset ? { avgPricesUsd: { ...(g.avgPricesUsd || {}), [sym]: usdVal } } : {}),
                                                });
                                              }
                                            }}
                                            onBlur={() => {
                                              const raw = typingAvgPrices[sym];
                                              if (raw !== undefined) {
                                                const valNum = Number(raw);
                                                const krwVal = Number.isFinite(valNum)
                                                  ? (currencyMode === 'USD' ? Math.round(valNum * usdRate) : Math.round(valNum))
                                                  : 0;
                                                const usdVal = Number.isFinite(valNum)
                                                  ? (currencyMode === 'USD' ? Math.round(valNum * 100) / 100 : Math.round((valNum / usdRate) * 100) / 100)
                                                  : 0;
                                                updateGroup(g.id, {
                                                  avgPrices: { ...(g.avgPrices || {}), [sym]: krwVal },
                                                  ...(isUsdAsset ? { avgPricesUsd: { ...(g.avgPricesUsd || {}), [sym]: usdVal } } : {}),
                                                });
                                                setTypingAvgPrices((prev) => {
                                                  const next = { ...prev };
                                                  delete next[sym];
                                                  return next;
                                                });
                                              }
                                            }}
                                          />
                                        </div>
                                      </div>

                                      {/* 보유 수량 */}
                                      <div className="space-y-1">
                                        <span className="text-[11px] font-bold text-[var(--text-secondary)] block">보유 수량</span>
                                        <div className="relative w-28 sm:w-32">
                                          <input
                                            className="w-full bg-[var(--card-surface)] border border-[var(--border-color)] rounded-lg px-2.5 py-1 text-xs font-mono font-bold text-right text-[var(--text-primary)] outline-none focus:border-[var(--accent-orange)]"
                                            inputMode="decimal"
                                            placeholder="0"
                                            value={
                                              typingHoldings[sym] !== undefined
                                                ? typingHoldings[sym]
                                                : (g.holdings[sym] !== undefined && g.holdings[sym] !== null ? String(g.holdings[sym]) : '')
                                            }
                                            onChange={(e) => {
                                              const valStr = e.target.value.replace(/[^0-9.]/g, '');
                                              setTypingHoldings((prev) => ({ ...prev, [sym]: valStr }));
                                              const n = Number(valStr);
                                              if (Number.isFinite(n) && !valStr.endsWith('.')) {
                                                updateGroup(g.id, {
                                                  holdings: { ...g.holdings, [sym]: n },
                                                });
                                              }
                                            }}
                                            onBlur={() => {
                                              const raw = typingHoldings[sym];
                                              if (raw !== undefined) {
                                                const n = Number(raw);
                                                updateGroup(g.id, {
                                                  holdings: { ...g.holdings, [sym]: Number.isFinite(n) ? Math.max(0, n) : 0 },
                                                });
                                                setTypingHoldings((prev) => {
                                                  const next = { ...prev };
                                                  delete next[sym];
                                                  return next;
                                                });
                                              }
                                            }}
                                          />
                                        </div>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-1.5 self-end pt-1">
                                      <button
                                        type="button"
                                        onClick={() => handleFinishEditingSymbol(g, sym)}
                                        className={btnPrimaryPillCls}
                                      >
                                        <Check className="w-3.5 h-3.5" /> 완료
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </SmoothHeight>

                            {/* 종목별 직접 거래 입력 폼 (SmoothHeight 적용, 글래스모피즘 캡슐 & 날짜별 과거 시세 연동) */}
                            <SmoothHeight>
                              {manualTradeSymbol === sym && (
                                <div className="mt-2.5 p-3.5 rounded-xl bg-[var(--bg-main)] border border-[var(--accent-orange)]/40 space-y-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-xs font-extrabold text-[var(--text-primary)]">
                                        거래 기록 추가
                                      </span>
                                      <span className="text-[10px] text-[var(--text-secondary)]">
                                        (날짜를 선택하면 그날의 가격을 자동으로 불러옵니다)
                                      </span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => setManualTradeSymbol(null)}
                                      className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-full cursor-pointer"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </div>

                                  <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                                    {/* 구분: 구매 / 판매 글래스모피즘 슬라이딩 캡슐 토글 */}
                                    <div className="relative inline-grid grid-cols-2 p-0.5 rounded-full bg-[var(--bg-main)]/90 backdrop-blur-md border border-[var(--border-color)]/90 shadow-2xs w-32 sm:w-36 shrink-0">
                                      {/* 슬라이딩 글래스모피즘 인디케이터 (Apple Snappy & 앰비언트 글로우) */}
                                      <div
                                        className={`absolute top-0.5 bottom-0.5 left-0.5 rounded-full bg-[var(--card-surface)] border transition-all duration-300 pointer-events-none ${
                                          manualTradeType === 'BUY'
                                            ? 'border-[#10B981]/60 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                                            : 'border-[#F43F5E]/60 shadow-[0_0_12px_rgba(244,63,94,0.25)]'
                                        }`}
                                        style={{
                                          width: 'calc((100% - 4px) / 2)',
                                          transform: `translateX(${manualTradeType === 'BUY' ? '0%' : '100%'})`,
                                          transitionTimingFunction: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
                                        }}
                                      />
                                      <button
                                        type="button"
                                        onClick={() => setManualTradeType('BUY')}
                                        className={`relative z-10 w-full flex items-center justify-center py-1 px-2.5 sm:px-3 rounded-full text-xs font-bold transition-colors duration-200 cursor-pointer text-center select-none ${
                                          manualTradeType === 'BUY'
                                            ? 'text-[#10B981] font-extrabold'
                                            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                                        }`}
                                      >
                                        구매
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setManualTradeType('SELL')}
                                        className={`relative z-10 w-full flex items-center justify-center py-1 px-2.5 sm:px-3 rounded-full text-xs font-bold transition-colors duration-200 cursor-pointer text-center select-none ${
                                          manualTradeType === 'SELL'
                                            ? 'text-[#F43F5E] font-extrabold'
                                            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                                        }`}
                                      >
                                        판매
                                      </button>
                                    </div>

                                    {/* 거래 일자 선택 */}
                                    <div className="flex items-center gap-1 shrink-0">
                                      <input
                                        type="date"
                                        value={manualTradeDate}
                                        onChange={async (e) => {
                                          const nextDate = e.target.value;
                                          setManualTradeDate(nextDate);
                                          if (nextDate) {
                                            const hist = await fetchPastPrice(sym, nextDate);
                                            if (hist) {
                                              if (isUsdAsset && hist.price > 0) {
                                                setManualTradePrice(String(hist.price));
                                              } else if (hist.priceKrw > 0) {
                                                setManualTradePrice(String(hist.priceKrw));
                                              }
                                            }
                                          }
                                        }}
                                        className="bg-[var(--card-surface)] border border-[var(--border-color)] rounded-lg px-2 sm:px-2.5 py-1 text-xs font-mono font-bold text-[var(--text-primary)] outline-none focus:border-[var(--accent-orange)] max-w-[130px] sm:max-w-none"
                                      />
                                      {isLoadingHistoryPrice && (
                                        <span className="text-[10px] text-[var(--accent-orange)] font-bold animate-pulse">
                                          시세 조회 중...
                                        </span>
                                      )}
                                    </div>

                                    {/* 수량 */}
                                    <div className="relative w-20 sm:w-24 shrink-0">
                                      <input
                                        type="text"
                                        inputMode="decimal"
                                        placeholder="수량"
                                        value={manualTradeQty}
                                        onChange={(e) => setManualTradeQty(e.target.value.replace(/[^0-9.]/g, ''))}
                                        className="w-full bg-[var(--card-surface)] border border-[var(--border-color)] rounded-lg px-2 sm:px-2.5 py-1 text-xs font-mono font-bold text-right text-[var(--text-primary)] outline-none focus:border-[var(--accent-orange)]"
                                      />
                                    </div>
                                    <span className="text-xs font-mono text-[var(--text-secondary)] shrink-0">
                                      {getSymbolUnit(sym)}
                                    </span>

                                    {/* 단가 */}
                                    <div className="relative w-24 sm:w-28 shrink-0">
                                      <input
                                        type="text"
                                        inputMode={isUsdAsset ? 'decimal' : 'numeric'}
                                        placeholder={isUsdAsset ? '달러 단가' : '단가'}
                                        value={
                                          isUsdAsset
                                            ? manualTradePrice
                                            : manualTradePrice
                                              ? Number(manualTradePrice.replace(/[^0-9]/g, '')).toLocaleString('ko-KR')
                                              : ''
                                        }
                                        onChange={(e) => {
                                          if (isUsdAsset) {
                                            setManualTradePrice(e.target.value.replace(/[^0-9.]/g, ''));
                                          } else {
                                            setManualTradePrice(e.target.value.replace(/[^0-9]/g, ''));
                                          }
                                        }}
                                        className="w-full bg-[var(--card-surface)] border border-[var(--border-color)] rounded-lg px-2 sm:px-2.5 py-1 text-xs font-mono font-bold text-right text-[var(--text-primary)] outline-none focus:border-[var(--accent-orange)]"
                                      />
                                    </div>
                                    <span className="text-xs text-[var(--text-secondary)] shrink-0">
                                      {isUsdAsset ? '$' : '원'}
                                    </span>

                                    {/* 반영 버튼 */}
                                    <button
                                      type="button"
                                      onClick={() => handleExecuteManualTrade(g.id, sym)}
                                      className="ml-auto px-4 py-1.5 rounded-full text-xs font-bold bg-[var(--accent-orange)] text-white hover:brightness-105 hover:shadow-[0_0_16px_rgba(241,143,1,0.3)] active:scale-98 transition-all flex items-center gap-1 cursor-pointer"
                                    >
                                      <Check className="w-3.5 h-3.5" /> 기록
                                    </button>
                                  </div>

                                  {Number(manualTradeQty) > 0 && Number(manualTradePrice) > 0 && (() => {
                                    const qNum = Number(manualTradeQty);
                                    const pNum = isUsdAsset
                                      ? Number(manualTradePrice)
                                      : Number(manualTradePrice.replace(/[^0-9]/g, ''));
                                    const prevSettlement = calculateTradeSettlement({
                                      symbol: sym,
                                      tradeQty: manualTradeType === 'SELL' ? -qNum : qNum,
                                      price: pNum,
                                      isUsdAsset,
                                      currency: quoteEntry?.currency,
                                      currentHoldings: g.holdings[sym] || 0,
                                      currentCashKrw: account.cash || 0,
                                      currentCashUsd: account.cashUsd || 0,
                                      fees: account.fees,
                                      usdRate,
                                    });
                                    return (
                                      <div className="text-[11px] font-mono text-[var(--text-secondary)] text-right space-y-0.5">
                                        <div>
                                          체결 금액:{' '}
                                          {isUsdAsset ? (
                                            <>
                                              <span className="text-[var(--text-primary)] font-bold">
                                                ${Math.abs(prevSettlement.tradeAmountUsd).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                              </span>
                                              {prevSettlement.feeUsd > 0 && (
                                                <span className="ml-1 text-[var(--accent-orange)] font-bold">
                                                  (수수료 ${prevSettlement.feeUsd.toFixed(2)}, {prevSettlement.feePct}%)
                                                </span>
                                              )}
                                              <span className="ml-1 text-[var(--text-secondary)]">
                                                (원화 환산 약 {won(Math.abs(prevSettlement.tradeAmountKrw))})
                                              </span>
                                            </>
                                          ) : (
                                            <>
                                              <span className="text-[var(--text-primary)] font-bold">
                                                {won(Math.abs(prevSettlement.tradeAmountKrw))}
                                              </span>
                                              {prevSettlement.feeKrw > 0 && (
                                                <span className="ml-1 text-[var(--accent-orange)] font-bold">
                                                  (수수료 {won(prevSettlement.feeKrw)}, {prevSettlement.feePct}%)
                                                </span>
                                              )}
                                            </>
                                          )}
                                        </div>
                                        {isUsdAsset && prevSettlement.appliedFxRate !== usdRate && (
                                          <div className="text-[10px] text-[var(--text-secondary)]">
                                            자동 환전 적용 환율: {prevSettlement.appliedFxRate.toFixed(2)}원 (환율 우대 {account.fees?.fxDiscountPct ?? 95}% 적용)
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })()}
                                </div>
                              )}
                            </SmoothHeight>
                            </div>
                          );
                        })}

                        {/* 부가 종목 추가 인라인 UI (헤더의 + 버튼으로 토글 & SmoothHeight 애니메이션 적용) */}
                        <SmoothHeight>
                          {isAddSymbolOpen && (
                            <div className="pt-2 pb-1 px-1 space-y-2">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--accent-orange)]">
                                <Plus className="w-3.5 h-3.5" />
                                <span>같은 자산군의 다른 종목 추가</span>
                              </div>
                              <AddSymbolInline
                                onAdd={(s) => addSymbolToGroup(g, s)}
                                onClose={() => setExpandedAddSymbolGroupId(null)}
                              />
                            </div>
                          )}
                        </SmoothHeight>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 주문 수량 계산 결과 */}
            {plan && account.groups.length > 0 && (
              <div className={`${cardCls} p-5 sm:p-6 space-y-4`}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[var(--accent-orange)]" />
                    <h2 className="text-base font-extrabold text-[var(--text-primary)]">
                      주문 수량 계산
                    </h2>
                  </div>
                  {(appliedLineGroupIds.length > 0 || Object.keys(customQuantities).length > 0) && (
                    <button
                      type="button"
                      onClick={() => {
                        setAppliedLineGroupIds([]);
                        setCustomQuantities({});
                      }}
                      className="text-xs text-[var(--text-secondary)] hover:text-[var(--accent-orange)] flex items-center gap-1 font-medium transition-colors cursor-pointer"
                      title="계산 상태 초기화 및 다시 계산"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> 다시 계산
                    </button>
                  )}
                </div>

                {quoteLoading ? (
                  <p className="text-xs text-[var(--text-secondary)] font-medium flex items-center gap-1.5 py-1">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--accent-orange)]" />
                    최신 시세를 조회하고 있습니다...
                  </p>
                ) : plan.missingSymbols.length > 0 ? (
                  <p className="text-xs text-[#F43F5E] font-bold">
                    가격을 불러오지 못한 종목: {plan.missingSymbols.join(', ')}
                  </p>
                ) : null}
                {/* 보유 현금 부족 경고 배너 */}
                {cashShortageState?.isShortage && (
                  <div className="p-3.5 rounded-xl bg-[#F43F5E]/10 border border-[#F43F5E]/30 flex items-start gap-2.5 text-xs animate-fadeIn">
                    <AlertCircle className="w-4 h-4 text-[#F43F5E] shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-bold text-[#F43F5E]">
                        보유 현금이 부족하여 구매를 진행할 수 없습니다.
                      </p>
                      <p className="text-[var(--text-secondary)] leading-relaxed">
                        필요 금액: <b className="text-[var(--text-primary)] font-mono">{won(cashShortageState.neededKrw)}</b> · 부족 금액: 약 <b className="text-[#F43F5E] font-mono">{won(cashShortageState.shortageKrw)}</b>
                      </p>
                    </div>
                  </div>
                )}

                {plan.lines.length === 0 ? (
                  plan.availableCash <= 0 && account.noSell ? (
                    <p className="text-sm text-[var(--text-secondary)] py-2">
                      위 설정에서 현금을 넣으시면 목표 현금을 보존하는 선에서 최적의 구매 수량을 계산해 드립니다.
                    </p>
                  ) : (
                    <p className="text-sm text-[var(--text-secondary)] py-2">
                      현재 목표 비율에 비해 부족한 자산이 없거나, 목표 현금 비중({plan.cashTargetPct}%)을 보존하고 남는 가용 자금이 없습니다.
                    </p>
                  )
                ) : (
                  <div className="space-y-2.5">
                    {/* 다종목 보유 자산군 판매 안내 및 대표 종목 보존 우선 정리 토글 */}
                    {account?.groups.some((gr) => {
                      const hasSellLine = plan.lines.some((l) => l.groupId === gr.id && l.qty < 0);
                      if (!hasSellLine) return false;
                      const subHeldCount = gr.symbols.filter((s) => s !== gr.buySymbol && (gr.holdings[s] || 0) > 0).length;
                      return subHeldCount > 0;
                    }) && (
                      <div
                        className={`p-3 sm:p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs leading-relaxed transition-all duration-300 shadow-2xs ${
                          prioritizeSubAssetLiquidation
                            ? 'bg-amber-500/10 border-amber-500/25'
                            : 'bg-[var(--card-surface)]/80 border-[var(--border-color)]/90'
                        }`}
                      >
                        <div className="flex items-start gap-2 min-w-0">
                          {prioritizeSubAssetLiquidation ? (
                            <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                          ) : (
                            <Layers className="w-4 h-4 text-[var(--text-secondary)] shrink-0 mt-0.5" />
                          )}
                          <span className="text-[var(--text-secondary)] text-[11px] sm:text-xs">
                            <b className="text-[var(--text-primary)]">다종목 보유 자산군</b>:{' '}
                            {prioritizeSubAssetLiquidation
                              ? '앞으로 모아갈 대표 종목을 보존하기 위해, 다른 보유 종목부터 먼저 팔도록 계산됩니다.'
                              : '대표 종목을 보존하지 않고, 목표 비중에 맞춰 대표 종목을 직접 먼저 팔도록 계산됩니다.'}
                          </span>
                        </div>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={prioritizeSubAssetLiquidation}
                          onClick={() => setPrioritizeSubAssetLiquidation((prev) => !prev)}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--bg-main)]/90 border border-[var(--border-color)]/90 hover:border-[var(--accent-orange)]/60 transition-all cursor-pointer shadow-2xs shrink-0 select-none self-end sm:self-auto"
                        >
                          <span
                            className={`text-[10px] sm:text-[11px] font-bold whitespace-nowrap transition-colors min-w-[70px] text-center ${
                              prioritizeSubAssetLiquidation
                                ? 'text-[var(--accent-orange)]'
                                : 'text-[var(--text-secondary)]'
                            }`}
                          >
                            {prioritizeSubAssetLiquidation ? '다른 종목 팔기' : '대표 종목 팔기'}
                          </span>
                          <div
                            className={`relative w-8 h-4.5 rounded-full transition-colors duration-300 flex items-center p-0.5 ${
                              prioritizeSubAssetLiquidation
                                ? 'bg-[var(--accent-orange)] shadow-[0_0_10px_rgba(241,143,1,0.35)]'
                                : 'bg-slate-300 dark:bg-slate-700'
                            }`}
                          >
                            <div
                              className={`w-3.5 h-3.5 rounded-full bg-white shadow-md transition-transform duration-300 ${
                                prioritizeSubAssetLiquidation ? 'translate-x-3.5' : 'translate-x-0'
                              }`}
                            />
                          </div>
                        </button>
                      </div>
                    )}
                    {plan.lines.map((l) => {
                      const isCrypto = isCryptoSymbol(l.symbol);
                      const unit = getSymbolUnit(l.symbol);
                      const lineKey = `${l.groupId}-${l.symbol}`;
                      const isLineApplied = appliedLineGroupIds.includes(lineKey) || appliedLineGroupIds.includes(l.groupId);
                      const customVal = customQuantities[lineKey] ?? customQuantities[l.groupId];
                      const isTyping = typingCustomQuantities[lineKey] !== undefined;
                      const displayQtyStr = isTyping
                        ? typingCustomQuantities[lineKey]
                        : customVal !== undefined
                        ? String(Math.abs(customVal))
                        : String(Math.abs(l.qty));
                      const effectiveQty = customVal !== undefined ? customVal : l.qty;
                      const effectiveAmountKrw = Math.round(effectiveQty * l.priceKrw);

                      return (
                        <div
                          key={lineKey}
                          className="p-3 sm:p-3.5 rounded-xl bg-[var(--bg-main)]/50 border border-[var(--border-color)]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 shadow-2xs"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-[var(--text-primary)] truncate">
                              {l.groupName}
                            </p>
                            <p className="text-xs font-mono text-[var(--text-secondary)]">
                              {symbolName(l.symbol, quotes)} ({l.symbol}) · 1{unit} {won(l.priceKrw)}
                            </p>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[var(--border-color)]/40">
                            {/* 체결 수량 직접 수정 인풋 (추천 수량 기본값, 직접 변경 가능) */}
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] text-[var(--text-secondary)] font-bold whitespace-nowrap">
                                수량:
                              </span>
                              <div className="relative w-16 sm:w-24">
                                <input
                                  type="text"
                                  inputMode="decimal"
                                  disabled={isLineApplied}
                                  value={displayQtyStr}
                                  onChange={(e) => {
                                    const cleaned = sanitizeDecimal(e.target.value);
                                    setTypingCustomQuantities((prev) => ({ ...prev, [lineKey]: cleaned }));
                                    const num = parseFloat(cleaned);
                                    if (!isNaN(num)) {
                                      setCustomQuantities((prev) => ({
                                        ...prev,
                                        [lineKey]: l.qty < 0 ? -num : num,
                                      }));
                                    }
                                  }}
                                  onBlur={() => {
                                    setTypingCustomQuantities((prev) => {
                                      const next = { ...prev };
                                      delete next[lineKey];
                                      return next;
                                    });
                                  }}
                                  className="w-full bg-[var(--card-surface)] border border-[var(--border-color)] rounded-lg px-2 py-1 text-xs font-mono font-bold text-right text-[var(--text-primary)] outline-none focus:border-[var(--accent-orange)] disabled:opacity-50"
                                />
                              </div>
                              <span className="text-xs font-mono text-[var(--text-secondary)]">
                                {unit}
                              </span>
                            </div>

                            <div className="text-right min-w-[70px] font-mono">
                              <p
                                className={`text-xs sm:text-sm font-extrabold ${
                                  effectiveQty < 0 ? 'text-[#F43F5E]' : 'text-[var(--accent-orange)]'
                                }`}
                              >
                                {effectiveQty < 0
                                  ? `${formatQuantity(Math.abs(effectiveQty), isCrypto)}${unit} 판매`
                                  : `${formatQuantity(effectiveQty, isCrypto)}${unit} 구매`}
                              </p>
                              <p className="text-[10px] sm:text-[11px] text-[var(--text-secondary)]">
                                {won(Math.abs(effectiveAmountKrw))}
                              </p>
                            </div>

                            {/* 개별 행 반영 버튼 */}
                            {isLineApplied ? (
                              <span className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-bold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 font-mono">
                                <Check className="w-3.5 h-3.5" /> 반영됨
                              </span>
                            ) : (
                              <button
                                type="button"
                                disabled={effectiveQty > 0 && effectiveAmountKrw > (account.cash || 0) + Math.floor((account.cashUsd || 0) * (quotes.usdKrw || 1350))}
                                onClick={() => applySingleLine(l, effectiveQty, effectiveAmountKrw)}
                                className={`inline-flex items-center gap-1 px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-bold shadow-2xs transition-all ${
                                  effectiveQty > 0 && effectiveAmountKrw > (account.cash || 0) + Math.floor((account.cashUsd || 0) * (quotes.usdKrw || 1350))
                                    ? 'bg-[var(--border-color)] text-[var(--text-secondary)] opacity-50 cursor-not-allowed'
                                    : 'bg-[var(--accent-orange)] text-white hover:brightness-105 hover:shadow-[0_0_14px_rgba(241,143,1,0.3)] cursor-pointer active:scale-95'
                                }`}
                                title={
                                  effectiveQty > 0 && effectiveAmountKrw > (account.cash || 0) + Math.floor((account.cashUsd || 0) * (quotes.usdKrw || 1350))
                                    ? '보유 현금이 부족하여 체결할 수 없습니다'
                                    : '이 수량으로 체결 내역을 계좌에 반영'
                                }
                              >
                                반영
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {(() => {
                      const totalPlanSpendKrw = plan.lines.reduce((sum, l) => {
                        const cVal = customQuantities[l.groupId];
                        const q = cVal !== undefined ? cVal : l.qty;
                        const isCrypto = isCryptoSymbol(l.symbol);
                        const isUsd = !isCrypto && l.symbol !== 'GOLD_1G' && !/^\d{6}$/.test(l.symbol);
                        const feePct = isUsd
                          ? (account.fees?.usFeePct !== undefined ? account.fees.usFeePct : 0.07)
                          : (account.fees?.krFeePct !== undefined ? account.fees.krFeePct : 0.015);
                        const feeFactor = 1 + (q > 0 ? feePct / 100 : -feePct / 100);
                        return sum + Math.round(q * l.priceKrw * feeFactor);
                      }, 0);

                      return (
                        <div className="pt-2 flex items-center justify-between text-xs font-mono text-[var(--text-secondary)] font-bold px-1">
                          <span>
                            총 사용 금액 {won(totalPlanSpendKrw)}
                          </span>
                          <span>
                            남는 현금 {won(Math.max(0, plan.availableCash - totalPlanSpendKrw))}
                          </span>
                        </div>
                      );
                    })()}

                    <div className="pt-2 space-y-2">
                      {plan.lines.every((l) => appliedLineGroupIds.includes(l.groupId)) ? (
                        <div className="p-3 rounded-full text-center text-xs font-bold bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30 flex items-center justify-center gap-1.5 font-mono">
                          <Check className="w-4 h-4" /> 모든 매매 내역이 계좌에 반영되었습니다
                        </div>
                      ) : (
                        <button
                          type="button"
                          disabled={Boolean(cashShortageState?.isShortage)}
                          onClick={applyRemainingPlan}
                          className={
                            cashShortageState?.isShortage
                              ? 'inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-full text-sm font-bold bg-[var(--border-color)] text-[var(--text-secondary)] opacity-50 cursor-not-allowed w-full border-0'
                              : `${btnPrimaryPillCls} py-3 w-full justify-center text-sm`
                          }
                        >
                          <Check className="w-4 h-4" />
                          전체 매매 반영
                        </button>
                      )}

                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 최근 매매 기록 (개별 삭제 기능 및 실현손익 표시, 무료 회원 최신 10건 노출 & CSV 다운로드) */}
            {allSortedLogs.length > 0 && (
              <div className={`${cardCls} p-5 sm:p-6 space-y-3 min-h-[260px]`}>
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-extrabold text-[var(--text-primary)]">
                      {isPro ? '전체 매매 기록' : '최근 매매 기록'}
                    </h2>
                    <span className="text-[10px] text-[var(--text-secondary)] font-mono">
                      ({isPro ? `총 ${allSortedLogs.length}건` : `최근 ${displayedLogs.length}건`})
                    </span>
                  </div>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => exportToCsv('csv-logs')}
                      className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--accent-orange)] hover:bg-[var(--accent-orange)]/10 rounded-lg transition-colors cursor-pointer"
                      title="매매 기록 CSV 엑셀 다운로드"
                      aria-label="CSV 저장"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    {proPopoverTarget === 'csv-logs' && (
                      <ProMiniPopover
                        title="매매 기록 CSV 내보내기"
                        description="PRO 멤버십에 가입하면 모든 계좌의 전체 매매 기록과 계좌 잔고를 엑셀 CSV 파일로 무제한 저장할 수 있습니다."
                        align="right"
                        isClosing={isProPopoverClosing}
                        onClose={closeProPopover}
                        onAction={openCompareModal}
                      />
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  {displayedLogs.map((log) => {
                    const firstItem = log.items[0];
                    const isCrypto = firstItem ? isCryptoSymbol(firstItem.symbol) : false;
                    const unit = firstItem ? getSymbolUnit(firstItem.symbol) : '주';
                    const isSell = firstItem ? firstItem.qty < 0 : log.type === 'SELL';
                    const amount = firstItem ? Math.abs(firstItem.amountKrw) : 0;
                    const qty = firstItem ? Math.abs(firstItem.qty) : 0;

                    return (
                      <div
                        key={log.id}
                        className="text-xs text-[var(--text-secondary)] bg-[var(--bg-main)]/50 p-3 rounded-xl border border-[var(--border-color)]/60 flex items-center justify-between gap-3 hover:border-[var(--accent-orange)]/40 transition-colors shadow-2xs"
                      >
                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-bold text-[var(--text-primary)]">
                              {formatDisplayDate(log.date)}
                            </span>
                            <span className="text-[10px] text-[var(--text-secondary)] font-mono">
                              · {log.accountName}
                            </span>
                            <span
                              className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full ${
                                isSell
                                  ? 'text-[#F43F5E] border border-[#F43F5E]/40'
                                  : 'text-[#10B981] border border-[#10B981]/40'
                              }`}
                            >
                              {isSell ? '판매' : '구매'}
                            </span>
                            {log.realizedProfit !== undefined && log.realizedProfit !== 0 && (
                              <span
                                className={`text-[10px] font-bold font-mono ${
                                  log.realizedProfit >= 0 ? 'text-[#10B981]' : 'text-[#F43F5E]'
                                }`}
                              >
                                실현손익 {log.realizedProfit >= 0 ? '+' : ''}{won(log.realizedProfit)}
                              </span>
                            )}
                          </div>
                          <div className="font-mono text-xs flex items-center gap-1.5 flex-wrap">
                            {firstItem ? (
                              <>
                                <span className="font-extrabold text-[var(--text-primary)]">
                                  {firstItem.name || firstItem.symbol} ({firstItem.symbol})
                                </span>
                                <span className="text-[var(--text-primary)] font-bold">
                                  {formatQuantity(qty, isCrypto)}{unit} {isSell ? '판매' : '구매'}
                                </span>
                                <span className="text-[var(--text-secondary)]">
                                  ({won(amount)})
                                </span>
                              </>
                            ) : (
                              <span>거래 상세 없음</span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveLog(log.id)}
                          className="p-1.5 text-[var(--text-secondary)] hover:text-[#F43F5E] transition-colors shrink-0 cursor-pointer border-0 outline-none"
                          title="이 거래 기록 삭제"
                          aria-label="거래 기록 삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </SmoothHeight>

      {/* 화면 상단 플로팅 단독 실행 취소(되돌리기) 알약 캡슐: Navbar 직하단(top-20) 중앙 안착 */}
      {lastUndoSnapshot && (
        <div
          className={`fixed top-20 left-1/2 z-[110] ${
            isUndoClosing ? 'animate-undo-exit pointer-events-none' : 'animate-undo-enter pointer-events-auto'
          }`}
        >
          <div className="flex items-center gap-2 pl-3.5 pr-2 py-1.5 rounded-full bg-white/95 dark:bg-[#18181b]/95 backdrop-blur-xl border border-[var(--border-color)]/90 dark:border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.12)] hover:border-black/20 dark:hover:border-white/20 transition-all text-xs">
            <button
              type="button"
              onClick={handleUndoLastAction}
              className="group flex items-center gap-1.5 text-xs font-semibold text-[var(--text-primary)] transition-colors cursor-pointer select-none"
              title="방금 수행한 작업 되돌리기"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] stroke-[2] transition-colors" />
              <span>실행 취소</span>
            </button>
            <button
              type="button"
              onClick={dismissUndo}
              className="p-1 rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--card-hover)] transition-colors cursor-pointer"
              title="닫기"
              aria-label="닫기"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

// 필요할 때만 펼쳐지는 같은 자산 내 다른 종목 코드 추가 컴포넌트
function AddSymbolInline({ onAdd, onClose }: { onAdd: (s: string) => void; onClose: () => void }) {
  const [v, setV] = useState('');
  return (
    <div className="flex items-center gap-2 pt-1 animate-fadeIn">
      <input
        className="w-full bg-[var(--card-surface)] border border-[var(--border-color)]/80 rounded-xl px-3 py-1.5 text-xs font-mono text-[var(--text-primary)] outline-none focus:border-[var(--accent-orange)]/60"
        placeholder="종목 코드 또는 한글 (예: VOO, IVV, 360750 등)"
        value={v}
        onChange={(e) => setV(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            if (v.trim()) onAdd(v);
          }
        }}
        autoFocus
      />
      <button
        type="button"
        onClick={() => {
          if (v.trim()) onAdd(v);
        }}
        className={btnPrimaryPillCls}
      >
        추가
      </button>
      <button
        type="button"
        onClick={onClose}
        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold border border-[var(--border-color)]/90 bg-[var(--card-surface)]/90 text-[var(--text-primary)] hover:border-[var(--accent-orange)] hover:text-[var(--accent-orange)] hover:shadow-[0_0_16px_rgba(241,143,1,0.22)] active:scale-98 transition-all cursor-pointer whitespace-nowrap"
      >
        닫기
      </button>
    </div>
  );
}
