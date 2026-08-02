'use client';

import { useState, useMemo, useRef, MouseEvent, TouchEvent } from 'react';
import backtestJson from '@/data/backtestData.json';
import historicalPrices from '@/data/historicalPrices.json';
import { 
  LineChart, 
  TrendingUp, 
  Sliders, 
  Sparkles, 
  Layers, 
  Plus, 
  Trash2, 
  BarChart3, 
  Lightbulb, 
  ChevronDown, 
  AlertTriangle,
  HelpCircle
} from 'lucide-react';

interface SelectedAsset {
  assetId: string;
  weight: number;
  enableDefense?: boolean; // Per-asset defense toggle (default: true)
}

interface ChartPoint {
  index: number;
  date: string;
  valA: number;
  valB: number;
  invested: number;
  retA: number;
  retB: number;
}

type Frequency = 'monthly' | 'weekly';

export default function SimulatorPage() {
  const allAssets = backtestJson.assets;

  // Global Simulation Settings
  const [initialCapital, setInitialCapital] = useState<number>(100); // 100만 원
  const [depositAmount, setDepositAmount] = useState<number>(50); // 저금 금액 (50만 원)
  const [durationYears, setDurationYears] = useState<number>(20); // 기본 20년
  const [depositFrequency, setDepositFrequency] = useState<Frequency>('monthly'); // 매월 투자 / 매주 투자

  // Active Tooltip Info Modals State
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  // Portfolio A Configuration
  const [portfolioA, setPortfolioA] = useState<SelectedAsset[]>([
    { assetId: 'SPY', weight: 50, enableDefense: true },
    { assetId: 'QQQ', weight: 50, enableDefense: true },
  ]);
  const [strategyPeriodA, setStrategyPeriodA] = useState<number>(0);

  // Portfolio B Configuration
  const [portfolioB, setPortfolioB] = useState<SelectedAsset[]>([
    { assetId: 'SPY', weight: 60, enableDefense: true },
    { assetId: 'QQQ', weight: 40, enableDefense: true },
  ]);
  const [strategyPeriodB, setStrategyPeriodB] = useState<number>(0);

  // Interactive Canvas Hover & Drag States
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [dragStart, setDragStart] = useState<number | null>(null);
  const [dragEnd, setDragEnd] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Weight Calculation Helpers
  const totalWeightA = useMemo(() => portfolioA.reduce((sum, item) => sum + item.weight, 0), [portfolioA]);
  const autoCashA = Math.max(0, 100 - totalWeightA);

  const totalWeightB = useMemo(() => portfolioB.reduce((sum, item) => sum + item.weight, 0), [portfolioB]);
  const autoCashB = Math.max(0, 100 - totalWeightB);

  // Available unused assets for portfolio A & B
  const availableForA = useMemo(() => allAssets.filter((a) => a.id !== 'CASH' && !portfolioA.some((sa) => sa.assetId === a.id)), [allAssets, portfolioA]);
  const availableForB = useMemo(() => allAssets.filter((a) => a.id !== 'CASH' && !portfolioB.some((sa) => sa.assetId === a.id)), [allAssets, portfolioB]);

  // Slot Management for Portfolio A
  const handleAddSlotA = () => {
    if (availableForA.length === 0) return;
    const rem = Math.max(0, 100 - totalWeightA);
    setPortfolioA([...portfolioA, { assetId: availableForA[0].id, weight: Math.min(10, rem), enableDefense: true }]);
  };

  const handleUpdateWeightA = (index: number, requestedWeight: number) => {
    const currentSumWithoutThis = portfolioA.reduce((sum, item, idx) => (idx === index ? sum : sum + item.weight), 0);
    const capped = Math.min(requestedWeight, Math.max(0, 100 - currentSumWithoutThis));
    setPortfolioA(portfolioA.map((item, idx) => (idx === index ? { ...item, weight: capped } : item)));
  };

  // Slot Management for Portfolio B
  const handleAddSlotB = () => {
    if (availableForB.length === 0) return;
    const rem = Math.max(0, 100 - totalWeightB);
    setPortfolioB([...portfolioB, { assetId: availableForB[0].id, weight: Math.min(10, rem), enableDefense: true }]);
  };

  const handleUpdateWeightB = (index: number, requestedWeight: number) => {
    const currentSumWithoutThis = portfolioB.reduce((sum, item, idx) => (idx === index ? sum : sum + item.weight), 0);
    const capped = Math.min(requestedWeight, Math.max(0, 100 - currentSumWithoutThis));
    setPortfolioB(portfolioB.map((item, idx) => (idx === index ? { ...item, weight: capped } : item)));
  };

  // ----------------------------------------------------------------------
  // DUAL PORTFOLIO 20-YEAR BACKTEST ENGINE (투자 전략 A vs B 동시 백테스트)
  // ----------------------------------------------------------------------
  const simulation = useMemo(() => {
    const histMap = historicalPrices[depositFrequency] as Record<string, Array<{ date: string; price: number }>>;
    const canonicalDates = (histMap.SPY || []).map((d) => d.date);
    const targetLength = Math.min(
      canonicalDates.length,
      depositFrequency === 'weekly' ? durationYears * 52 : durationYears * 12
    );

    const timeline = canonicalDates.slice(canonicalDates.length - targetLength);

    const points: ChartPoint[] = [];
    let cumulativeInvested = initialCapital;

    // Helper function to resolve asset price at a specific dataIndex with fallback leverage / index synthesis
    const getAssetPrice = (assetId: string, idx: number): number => {
      const series = histMap[assetId];
      if (series && series[idx] && series[idx].price > 0) {
        return series[idx].price;
      }
      // Synthetic fallback for leveraged ETFs without direct historical series
      // Synthetic fallback for leveraged ETFs without direct historical series
      if (assetId === 'SSO' || assetId === 'UPRO') {
        const spySeries = histMap['SPY'];
        if (spySeries && spySeries[idx] && idx > 0 && spySeries[idx - 1]) {
          const spyRet = (spySeries[idx].price - spySeries[idx - 1].price) / spySeries[idx - 1].price;
          const mult = assetId === 'SSO' ? 2 : 3;
          const prevPrice = getAssetPrice(assetId, idx - 1);
          return Math.max(0.01, prevPrice * (1 + spyRet * mult));
        }
        return (spySeries?.[idx]?.price || 100) * (assetId === 'SSO' ? 0.3 : 0.1);
      }
      if (assetId === 'USD') {
        const soxxSeries = histMap['SOXX'];
        if (soxxSeries && soxxSeries[idx] && idx > 0 && soxxSeries[idx - 1]) {
          const soxxRet = (soxxSeries[idx].price - soxxSeries[idx - 1].price) / soxxSeries[idx - 1].price;
          const prevPrice = getAssetPrice(assetId, idx - 1);
          return Math.max(0.01, prevPrice * (1 + soxxRet * 2));
        }
        return (soxxSeries?.[idx]?.price || 100) * 0.2;
      }
      if (assetId === 'TQQQ' || assetId === 'QLD') {
        const qqqSeries = histMap['QQQ'];
        if (qqqSeries && qqqSeries[idx] && idx > 0 && qqqSeries[idx - 1]) {
          const qqqRet = (qqqSeries[idx].price - qqqSeries[idx - 1].price) / qqqSeries[idx - 1].price;
          const mult = assetId === 'QLD' ? 2 : 3;
          const prevPrice = getAssetPrice(assetId, idx - 1);
          return Math.max(0.01, prevPrice * (1 + qqqRet * mult));
        }
        return (qqqSeries?.[idx]?.price || 100) * (assetId === 'QLD' ? 0.2 : 0.05);
      }
      if (assetId === 'SOXL') {
        const soxxSeries = histMap['SOXX'];
        if (soxxSeries && soxxSeries[idx] && idx > 0 && soxxSeries[idx - 1]) {
          const soxxRet = (soxxSeries[idx].price - soxxSeries[idx - 1].price) / soxxSeries[idx - 1].price;
          const prevPrice = getAssetPrice(assetId, idx - 1);
          return Math.max(0.01, prevPrice * (1 + soxxRet * 3));
        }
        return (soxxSeries?.[idx]?.price || 100) * 0.1;
      }
      if (assetId === 'BTC' || assetId === 'ETH') {
        const qqqSeries = histMap['QQQ'];
        if (qqqSeries && qqqSeries[idx] && idx > 0 && qqqSeries[idx - 1]) {
          const qqqRet = (qqqSeries[idx].price - qqqSeries[idx - 1].price) / qqqSeries[idx - 1].price;
          // Moderate realistic beta multiplier (1.4x - 1.6x) for pre-crypto tech proxy to prevent extreme compounding
          const mult = assetId === 'BTC' ? 1.4 : 1.6;
          const prevPrice = getAssetPrice(assetId, idx - 1);
          return Math.max(0.01, prevPrice * (1 + qqqRet * mult));
        }
        return assetId === 'BTC' ? 50 : 10;
      }
      return histMap['SPY']?.[idx]?.price || 100;
    };

    // Helper to resolve benchmark series for MA calculation
    const getBenchmarkSeries = (assetId: string) => {
      if (assetId === 'SSO' || assetId === 'UPRO' || assetId === 'SCHD') return histMap['SPY'];
      if (assetId === 'TQQQ' || assetId === 'QLD' || assetId === 'BTC' || assetId === 'ETH') return histMap['QQQ'];
      if (assetId === 'USD' || assetId === 'SOXL') return histMap['SOXX'];
      if (assetId === 'SHY') return histMap['IEF'];
      return histMap[assetId] || histMap['SPY'];
    };

    // Separate accumulated defense cash pools per asset for A & B
    const defenseCashA: Record<string, number> = {};
    const defenseCashB: Record<string, number> = {};

    // Portfolio A setup
    const sharesA: Record<string, number> = {};
    let cashA = initialCapital * (autoCashA / 100);
    portfolioA.forEach((item) => {
      defenseCashA[item.assetId] = 0;
      const startIdx = canonicalDates.length - targetLength;
      const firstPrice = getAssetPrice(item.assetId, startIdx);
      sharesA[item.assetId] = (initialCapital * (item.weight / 100)) / firstPrice;
    });

    // Portfolio B setup
    const sharesB: Record<string, number> = {};
    let cashB = initialCapital * (autoCashB / 100);
    portfolioB.forEach((item) => {
      defenseCashB[item.assetId] = 0;
      const startIdx = canonicalDates.length - targetLength;
      const firstPrice = getAssetPrice(item.assetId, startIdx);
      sharesB[item.assetId] = (initialCapital * (item.weight / 100)) / firstPrice;
    });

    let prevValA = initialCapital;
    let prevValB = initialCapital;
    let peakA = initialCapital;
    let peakB = initialCapital;
    let maxDDA = 0;
    let maxDDB = 0;
    const twrReturnsA: number[] = [];
    const twrReturnsB: number[] = [];

    for (let t = 0; t < targetLength; t++) {
      const dataIndex = canonicalDates.length - targetLength + t;
      const dateStr = canonicalDates[dataIndex];

      if (t > 0) {
        // Compute pre-deposit portfolio values for TWR
        let preValA = cashA;
        portfolioA.forEach((item) => {
          preValA += (defenseCashA[item.assetId] || 0);
          preValA += (sharesA[item.assetId] || 0) * getAssetPrice(item.assetId, dataIndex);
        });

        let preValB = cashB;
        portfolioB.forEach((item) => {
          preValB += (defenseCashB[item.assetId] || 0);
          preValB += (sharesB[item.assetId] || 0) * getAssetPrice(item.assetId, dataIndex);
        });

        // TWR pure price return for period (ex-deposit)
        const twrStepA = prevValA > 0 ? (preValA - prevValA) / prevValA : 0;
        const twrStepB = prevValB > 0 ? (preValB - prevValB) / prevValB : 0;
        twrReturnsA.push(twrStepA);
        twrReturnsB.push(twrStepB);

        cumulativeInvested += depositAmount;

        // 1) PORTFOLIO A DYNAMIC PER-ASSET DEFENSE REBALANCING
        cashA += depositAmount * (autoCashA / 100);

        portfolioA.forEach((item) => {
          const benchSeries = getBenchmarkSeries(item.assetId);
          const benchPrice = benchSeries?.[dataIndex]?.price || getAssetPrice(item.assetId, dataIndex);
          const actualPrice = getAssetPrice(item.assetId, dataIndex);

          if (!actualPrice || actualPrice <= 0) return;

          const isDefenseEnabledForItem = item.enableDefense !== false && strategyPeriodA > 0;
          let isItemDefending = false;

          if (isDefenseEnabledForItem && benchPrice && benchPrice > 0 && dataIndex >= 2) {
            const barCount = Math.max(2, Math.round(strategyPeriodA / (depositFrequency === 'weekly' ? 5 : 20)));
            const windowSize = Math.min(dataIndex, barCount);
            const recentPrices = benchSeries.slice(dataIndex - windowSize, dataIndex).map((p) => p.price);
            const ma = recentPrices.reduce((a, b) => a + b, 0) / (recentPrices.length || 1);
            if (benchPrice < ma) isItemDefending = true;
          }

          const depositAlloc = depositAmount * (item.weight / 100);

          if (isItemDefending) {
            // Liquidate ONLY this specific asset into its own defense cash pool
            if ((sharesA[item.assetId] || 0) > 0) {
              defenseCashA[item.assetId] = (defenseCashA[item.assetId] || 0) + (sharesA[item.assetId] || 0) * actualPrice;
              sharesA[item.assetId] = 0;
            }
            // Add new deposit allocation to defense cash pool
            defenseCashA[item.assetId] = (defenseCashA[item.assetId] || 0) + depositAlloc;
          } else {
            // Normal state / Recovery: Buy stock with deposit + accumulated defense cash
            const totalMoneyToBuy = depositAlloc + (defenseCashA[item.assetId] || 0);
            sharesA[item.assetId] = (sharesA[item.assetId] || 0) + totalMoneyToBuy / actualPrice;
            defenseCashA[item.assetId] = 0; // Reset defense cash after reinvesting
          }
        });

        // 2) PORTFOLIO B DYNAMIC PER-ASSET DEFENSE REBALANCING
        cashB += depositAmount * (autoCashB / 100);

        portfolioB.forEach((item) => {
          const benchSeries = getBenchmarkSeries(item.assetId);
          const benchPrice = benchSeries?.[dataIndex]?.price || getAssetPrice(item.assetId, dataIndex);
          const actualPrice = getAssetPrice(item.assetId, dataIndex);

          if (!actualPrice || actualPrice <= 0) return;

          const isDefenseEnabledForItem = item.enableDefense !== false && strategyPeriodB > 0;
          let isItemDefending = false;

          if (isDefenseEnabledForItem && benchPrice && benchPrice > 0 && dataIndex >= 2) {
            const barCount = Math.max(2, Math.round(strategyPeriodB / (depositFrequency === 'weekly' ? 5 : 20)));
            const windowSize = Math.min(dataIndex, barCount);
            const recentPrices = benchSeries.slice(dataIndex - windowSize, dataIndex).map((p) => p.price);
            const ma = recentPrices.reduce((a, b) => a + b, 0) / (recentPrices.length || 1);
            if (benchPrice < ma) isItemDefending = true;
          }

          const depositAlloc = depositAmount * (item.weight / 100);

          if (isItemDefending) {
            // Liquidate ONLY this specific asset into its own defense cash pool
            if ((sharesB[item.assetId] || 0) > 0) {
              defenseCashB[item.assetId] = (defenseCashB[item.assetId] || 0) + (sharesB[item.assetId] || 0) * actualPrice;
              sharesB[item.assetId] = 0;
            }
            // Add new deposit allocation to defense cash pool
            defenseCashB[item.assetId] = (defenseCashB[item.assetId] || 0) + depositAlloc;
          } else {
            // Normal state / Recovery: Buy stock with deposit + accumulated defense cash
            const totalMoneyToBuy = depositAlloc + (defenseCashB[item.assetId] || 0);
            sharesB[item.assetId] = (sharesB[item.assetId] || 0) + totalMoneyToBuy / actualPrice;
            defenseCashB[item.assetId] = 0; // Reset defense cash after reinvesting
          }
        });
      }

      // Compute total values after deposit/rebalance at time t
      let valA = cashA;
      portfolioA.forEach((item) => {
        valA += (defenseCashA[item.assetId] || 0);
        valA += (sharesA[item.assetId] || 0) * getAssetPrice(item.assetId, dataIndex);
      });

      let valB = cashB;
      portfolioB.forEach((item) => {
        valB += (defenseCashB[item.assetId] || 0);
        valB += (sharesB[item.assetId] || 0) * getAssetPrice(item.assetId, dataIndex);
      });

      const roundedValA = Math.round(valA);
      const roundedValB = Math.round(valB);

      prevValA = valA;
      prevValB = valB;

      // Track MDD
      if (roundedValA > peakA) peakA = roundedValA;
      const ddA = (peakA - roundedValA) / peakA;
      if (ddA > maxDDA) maxDDA = ddA;

      if (roundedValB > peakB) peakB = roundedValB;
      const ddB = (peakB - roundedValB) / peakB;
      if (ddB > maxDDB) maxDDB = ddB;

      const retA = cumulativeInvested > 0 ? ((roundedValA - cumulativeInvested) / cumulativeInvested) * 100 : 0;
      const retB = cumulativeInvested > 0 ? ((roundedValB - cumulativeInvested) / cumulativeInvested) * 100 : 0;

      points.push({
        index: t,
        date: dateStr,
        valA: roundedValA,
        valB: roundedValB,
        invested: Math.round(cumulativeInvested),
        retA: Number(retA.toFixed(1)),
        retB: Number(retB.toFixed(1)),
      });
    }

    const finalPoint = points[points.length - 1] || { valA: initialCapital, valB: initialCapital, invested: initialCapital, retA: 0, retB: 0 };
    const years = durationYears || 1;

    // Compute CAGR (연수익률)
    const cagrA = (Math.pow(finalPoint.valA / finalPoint.invested, 1 / years) - 1) * 100;
    const cagrB = (Math.pow(finalPoint.valB / finalPoint.invested, 1 / years) - 1) * 100;

    // Compute TWR Sharpe Ratio excluding deposit inflation
    const computeTWRSharpe = (returns: number[]) => {
      if (returns.length < 2) return 0;
      const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
      const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (returns.length - 1);
      const stdDev = Math.sqrt(variance);
      const periodsPerYear = depositFrequency === 'weekly' ? 52 : 12;
      const annualizedReturn = mean * periodsPerYear;
      const annualizedVol = stdDev * Math.sqrt(periodsPerYear);
      const rf = 0.02; // Risk-free rate 2%
      return annualizedVol > 0 ? (annualizedReturn - rf) / annualizedVol : 0;
    };

    const sharpeA = computeTWRSharpe(twrReturnsA);
    const sharpeB = computeTWRSharpe(twrReturnsB);

    return {
      points,
      finalInvested: finalPoint.invested,
      portA: {
        val: finalPoint.valA,
        totalRate: finalPoint.retA,
        cagr: cagrA.toFixed(1),
        mdd: (maxDDA * 100).toFixed(1),
        sharpe: sharpeA.toFixed(2),
      },
      portB: {
        val: finalPoint.valB,
        totalRate: finalPoint.retB,
        cagr: cagrB.toFixed(1),
        mdd: (maxDDB * 100).toFixed(1),
        sharpe: sharpeB.toFixed(2),
      },
    };
  }, [portfolioA, autoCashA, strategyPeriodA, portfolioB, autoCashB, strategyPeriodB, initialCapital, depositAmount, durationYears, depositFrequency]);

  // Chart Canvas Dimensions
  const chartHeight = 320;
  const chartWidth = 800;

  const valsA = simulation.points.map((p) => p.valA);
  const valsB = simulation.points.map((p) => p.valB);
  const investedVals = simulation.points.map((p) => p.invested);

  const maxVal = Math.max(...valsA, ...valsB, ...investedVals, 10);
  const minVal = Math.min(...valsA, ...valsB, ...investedVals, 0) * 0.9;

  const getX = (index: number) => {
    const total = simulation.points.length;
    if (total <= 1) return 0;
    return (index / (total - 1)) * chartWidth;
  };

  const getY = (val: number) => {
    return chartHeight - ((val - minVal) / (maxVal - minVal || 1)) * (chartHeight - 40) - 20;
  };

  const getSvgPath = (values: number[]) => {
    if (values.length === 0) return '';
    const points = values.map((val, idx) => `${getX(idx)},${getY(val)}`);
    return `M ${points.join(' L ')}`;
  };

  const handlePointerMove = (clientX: number) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const relativeX = clientX - rect.left;
    const normalizedX = Math.max(0, Math.min(chartWidth, (relativeX / rect.width) * chartWidth));
    
    const index = Math.round((normalizedX / chartWidth) * (simulation.points.length - 1));
    setHoverIndex(index);
    if (isDragging) setDragEnd(index);
  };

  const handleMouseDown = (e: MouseEvent) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const relativeX = e.clientX - rect.left;
    const index = Math.round((relativeX / rect.width) * (simulation.points.length - 1));
    setIsDragging(true);
    setDragStart(index);
    setDragEnd(index);
  };

  const handleTouchStart = (e: TouchEvent) => {
    if (!svgRef.current || e.touches.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const relativeX = e.touches[0].clientX - rect.left;
    const index = Math.round((relativeX / rect.width) * (simulation.points.length - 1));
    setIsDragging(true);
    setDragStart(index);
    setDragEnd(index);
    setHoverIndex(index);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!svgRef.current || e.touches.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const relativeX = e.touches[0].clientX - rect.left;
    const normalizedX = Math.max(0, Math.min(chartWidth, (relativeX / rect.width) * chartWidth));
    const index = Math.round((normalizedX / chartWidth) * (simulation.points.length - 1));
    setHoverIndex(index);
    if (isDragging) setDragEnd(index);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Dragged Range Metrics
  const dragRangeInfo = useMemo(() => {
    if (dragStart === null || dragEnd === null || dragStart === dragEnd) return null;
    const startIdx = Math.min(dragStart, dragEnd);
    const endIdx = Math.max(dragStart, dragEnd);

    const pStart = simulation.points[startIdx];
    const pEnd = simulation.points[endIdx];
    if (!pStart || !pEnd) return null;

    const diffA = (((pEnd.valA - pStart.valA) / pStart.valA) * 100).toFixed(1);
    const diffB = (((pEnd.valB - pStart.valB) / pStart.valB) * 100).toFixed(1);

    return {
      startDate: pStart.date,
      endDate: pEnd.date,
      diffA,
      diffB,
    };
  }, [dragStart, dragEnd, simulation.points]);

  const activeHoverPoint = hoverIndex !== null ? simulation.points[hoverIndex] : null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 select-none">
      
      {/* Header Banner */}
      <div className="space-y-1 py-1">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--text-primary)] flex items-center gap-2.5">
          <LineChart className="w-7 h-7 text-[var(--accent-orange)]" />
          투자 수익률 시뮬레이터
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium">
          원하는 종목과 전략으로 2가지 포트폴리오를 구성하여 20년간의 실전 성과를 직관적으로 비교하세요.
        </p>
      </div>

      {/* ---------------------------------------------------- */}
      {/* GLOBAL INVESTMENT INPUTS (공통 투자 조건)             */}
      {/* ---------------------------------------------------- */}
      <div className="glass-card p-5 rounded-2xl sm:rounded-3xl space-y-4 border border-[var(--border-color)]">
        <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
          <Sliders className="w-4.5 h-4.5 text-[var(--accent-orange)]" />
          투자 조건 설정
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {/* Deposit Frequency (매월 투자 / 매주 투자) */}
          <div className="space-y-1 bg-[var(--bg-main)]/60 p-3 rounded-xl border border-[var(--border-color)]">
            <label className="text-[11px] font-bold text-[var(--text-secondary)] block">투자 주기</label>
            <div className="grid grid-cols-2 gap-1 pt-0.5">
              <button
                type="button"
                onClick={() => {
                  setDepositFrequency('monthly');
                  setDragStart(null);
                  setDragEnd(null);
                }}
                className={`py-1.5 px-2 rounded-lg border text-[11px] font-bold transition-all ${
                  depositFrequency === 'monthly'
                    ? 'bg-[var(--accent-orange)] text-white border-[var(--accent-orange)]'
                    : 'bg-[var(--card-surface)] text-[var(--text-secondary)] border-[var(--border-color)]'
                }`}
              >
                매월 투자
              </button>
              <button
                type="button"
                onClick={() => {
                  setDepositFrequency('weekly');
                  setDragStart(null);
                  setDragEnd(null);
                }}
                className={`py-1.5 px-2 rounded-lg border text-[11px] font-bold transition-all ${
                  depositFrequency === 'weekly'
                    ? 'bg-[var(--accent-orange)] text-white border-[var(--accent-orange)]'
                    : 'bg-[var(--card-surface)] text-[var(--text-secondary)] border-[var(--border-color)]'
                }`}
              >
                매주 투자
              </button>
            </div>
          </div>

          {/* Initial Capital */}
          <div className="space-y-1 bg-[var(--bg-main)]/60 p-3 rounded-xl border border-[var(--border-color)]">
            <label className="text-[11px] font-bold text-[var(--text-secondary)] block">시작 자본금</label>
            <div className="flex items-center justify-between gap-1">
              <div className="flex items-center gap-1 min-w-0">
                <input
                  type="number"
                  value={initialCapital}
                  onChange={(e) => setInitialCapital(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-transparent text-sm font-extrabold text-[var(--text-primary)] focus:outline-none font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="text-xs font-bold text-[var(--text-secondary)] shrink-0">만원</span>
              </div>
              <div className="flex items-center gap-0.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setInitialCapital(Math.max(0, initialCapital - 50))}
                  className="w-5 h-5 rounded-md bg-[var(--card-surface)] border border-[var(--border-color)] text-[10px] font-bold flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] active:scale-95"
                >
                  -
                </button>
                <button
                  type="button"
                  onClick={() => setInitialCapital(initialCapital + 50)}
                  className="w-5 h-5 rounded-md bg-[var(--card-surface)] border border-[var(--border-color)] text-[10px] font-bold flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] active:scale-95"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Deposit Amount */}
          <div className="space-y-1 bg-[var(--bg-main)]/60 p-3 rounded-xl border border-[var(--border-color)]">
            <label className="text-[11px] font-bold text-[var(--text-secondary)] block">
              {depositFrequency === 'weekly' ? '매주' : '매달'} 적립 금액
            </label>
            <div className="flex items-center justify-between gap-1">
              <div className="flex items-center gap-1 min-w-0">
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-transparent text-sm font-extrabold text-[var(--text-primary)] focus:outline-none font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="text-xs font-bold text-[var(--text-secondary)] shrink-0">만원</span>
              </div>
              <div className="flex items-center gap-0.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setDepositAmount(Math.max(0, depositAmount - 10))}
                  className="w-5 h-5 rounded-md bg-[var(--card-surface)] border border-[var(--border-color)] text-[10px] font-bold flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] active:scale-95"
                >
                  -
                </button>
                <button
                  type="button"
                  onClick={() => setDepositAmount(depositAmount + 10)}
                  className="w-5 h-5 rounded-md bg-[var(--card-surface)] border border-[var(--border-color)] text-[10px] font-bold flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] active:scale-95"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Duration Years (Manual Number Input) */}
          <div className="space-y-1 bg-[var(--bg-main)]/60 p-3 rounded-xl border border-[var(--border-color)]">
            <label className="text-[11px] font-bold text-[var(--text-secondary)] block">투자 기간</label>
            <div className="flex items-center justify-between gap-1">
              <div className="flex items-center gap-1 min-w-0">
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={durationYears}
                  onChange={(e) => setDurationYears(Math.min(20, Math.max(1, Number(e.target.value))))}
                  className="w-full bg-transparent text-sm font-extrabold text-[var(--text-primary)] focus:outline-none font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="text-xs font-bold text-[var(--text-secondary)] shrink-0">년 동안</span>
              </div>
              <div className="flex items-center gap-0.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setDurationYears(Math.max(1, durationYears - 1))}
                  className="w-5 h-5 rounded-md bg-[var(--card-surface)] border border-[var(--border-color)] text-[10px] font-bold flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] active:scale-95"
                >
                  -
                </button>
                <button
                  type="button"
                  onClick={() => setDurationYears(Math.min(20, durationYears + 1))}
                  className="w-5 h-5 rounded-md bg-[var(--card-surface)] border border-[var(--border-color)] text-[10px] font-bold flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] active:scale-95"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* REAL DATA INTERACTIVE MAIN CHART (수익률 차트)        */}
      {/* ---------------------------------------------------- */}
      <div className="glass-card p-5 sm:p-7 rounded-2xl sm:rounded-3xl space-y-4 border border-[var(--border-color)]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="space-y-0.5">
            <h2 className="text-lg sm:text-xl font-black text-[var(--text-primary)] tracking-tight flex items-center gap-2">
              <BarChart3 className="w-5.5 h-5.5 text-[var(--accent-orange)]" />
              수익률 차트
            </h2>
            <p className="text-xs text-[var(--text-secondary)] font-medium">
              💡 배당 재투자(Total Return)가 반영된 실제 20년 과거 종가 데이터입니다.
            </p>
          </div>
        </div>

        {/* RESERVED FIXED HEIGHT CONTAINER (덜컹거림 방지) */}
        <div className="h-11 flex items-center">
          {dragRangeInfo && (
            <div className="w-full p-2.5 rounded-xl bg-[var(--card-surface)] border border-[var(--border-color)] flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-[var(--text-primary)] shadow-2xs">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[var(--accent-orange)]">🗓️ {dragRangeInfo.startDate} ~ {dragRangeInfo.endDate}</span>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono">
                <div>투자 전략 A: <span className={Number(dragRangeInfo.diffA) >= 0 ? 'text-[var(--accent-mid-green)] font-extrabold' : 'text-red-500 font-extrabold'}>{dragRangeInfo.diffA}%</span></div>
                <div>투자 전략 B: <span className={Number(dragRangeInfo.diffB) >= 0 ? 'text-[var(--accent-orange)] font-extrabold' : 'text-red-500 font-extrabold'}>{dragRangeInfo.diffB}%</span></div>
              </div>
            </div>
          )}
        </div>

        {/* SVG Canvas with FIXED OVERLAY TOOLTIP CONTAINER */}
        <div className="bg-[var(--card-surface)] p-4 sm:p-5 rounded-2xl border border-[var(--border-color)] space-y-3 relative overflow-hidden">
          
          {/* Fixed Position Hover Tooltip Overlay Bar */}
          <div className="h-8 flex items-center px-2 bg-[var(--bg-main)]/80 rounded-xl border border-[var(--border-color)] text-xs font-bold font-mono">
            {activeHoverPoint ? (
              <div className="w-full flex items-center justify-between gap-2 text-[11px]">
                <span className="text-[var(--text-secondary)]">🗓️ {activeHoverPoint.date} (원금: {activeHoverPoint.invested.toLocaleString()}만)</span>
                <div className="flex items-center gap-4">
                  <span>전략 A: <strong className="text-[var(--accent-mid-green)]">{activeHoverPoint.valA.toLocaleString()}만 ({activeHoverPoint.retA > 0 ? '+' : ''}{activeHoverPoint.retA}%)</strong></span>
                  <span>전략 B: <strong className="text-[var(--accent-orange)]">{activeHoverPoint.valB.toLocaleString()}만 ({activeHoverPoint.retB > 0 ? '+' : ''}{activeHoverPoint.retB}%)</strong></span>
                </div>
              </div>
            ) : null}
          </div>

          <svg
            ref={svgRef}
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-auto overflow-visible cursor-crosshair touch-none"
            onMouseMove={(e) => handlePointerMove(e.clientX)}
            onMouseDown={handleMouseDown}
            onMouseUp={() => setIsDragging(false)}
            onMouseLeave={() => {
              setHoverIndex(null);
              setIsDragging(false);
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={(e) => handleTouchMove(e)}
            onTouchEnd={handleTouchEnd}
          >
            {/* Grid lines */}
            <line x1="0" y1={chartHeight - 20} x2={chartWidth} y2={chartHeight - 20} stroke="var(--border-color)" strokeDasharray="4 4" />
            <line x1="0" y1={chartHeight * 0.66} x2={chartWidth} y2={chartHeight * 0.66} stroke="var(--border-color)" strokeDasharray="4 4" />
            <line x1="0" y1={chartHeight * 0.33} x2={chartWidth} y2={chartHeight * 0.33} stroke="var(--border-color)" strokeDasharray="4 4" />

            {/* Drag Selection Overlay Rect */}
            {dragStart !== null && dragEnd !== null && dragStart !== dragEnd && (
              <rect
                x={getX(Math.min(dragStart, dragEnd))}
                y="0"
                width={Math.abs(getX(dragEnd) - getX(dragStart))}
                height={chartHeight}
                fill="rgba(241, 143, 1, 0.18)"
                stroke="rgba(241, 143, 1, 0.5)"
                strokeDasharray="3 3"
              />
            )}

            {/* Path 0: Invested Capital Baseline (Dotted Gray) */}
            <path d={getSvgPath(investedVals)} fill="none" stroke="#888888" strokeWidth="1.5" strokeDasharray="3 3" />

            {/* Path 1: Portfolio A Line (Mid Green #68A67D) */}
            <path d={getSvgPath(valsA)} fill="none" stroke="#68A67D" strokeWidth="3" />

            {/* Path 2: Portfolio B Line (Signature Orange #F18F01) */}
            <path d={getSvgPath(valsB)} fill="none" stroke="#F18F01" strokeWidth="3.5" />

            {/* Hover Line Indicator */}
            {hoverIndex !== null && (
              <line x1={getX(hoverIndex)} y1="0" x2={getX(hoverIndex)} y2={chartHeight} stroke="var(--accent-orange)" strokeWidth="1.5" strokeDasharray="2 2" />
            )}
          </svg>

          {/* Dynamic Chart Legend (Mid Green Color Badge for Portfolio A) */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-bold pt-2 border-t border-[var(--border-color)]">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-1.5 bg-[var(--accent-mid-green)] rounded-full" />
                <span className="text-[var(--accent-mid-green)] font-extrabold">투자 전략 A</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-1.5 bg-[var(--accent-orange)] rounded-full" />
                <span className="text-[var(--accent-orange)] font-extrabold">투자 전략 B</span>
              </div>
            </div>
            <div className="text-[11px] text-[var(--text-secondary)] font-mono">
              총 투입 원금: {simulation.finalInvested.toLocaleString()}만원
            </div>
          </div>

          {/* Dynamic Smart Notice for Inferred & Crypto Assets */}
          {(() => {
            // Asset launch dates mapping in backtest dataset
            const launchDates: Record<string, string> = {
              UPRO: '2009년 6월',
              SSO: '2006년 6월',
              USD: '2007년 1월',
              TQQQ: '2010년 2월',
              QLD: '2006년 6월',
              SOXL: '2010년 3월',
              BTC: '2014년 9월',
              ETH: '2017년 11월',
              SCHD: '2011년 10월',
            };

            const allSelected = Array.from(new Set([...portfolioA, ...portfolioB].map((item) => item.assetId)));
            
            // Format simulation start date (e.g. '2006-08' -> '2006년 8월')
            const [simYearStr, simMonthStr] = (simulation.points[0]?.date || '2006-08').split('-');
            const formattedSimStart = `${simYearStr}년 ${Number(simMonthStr)}월`;
            const simYear = Number(simYearStr);
            const simMonth = Number(simMonthStr);

            // Find assets that need inference within current selected timeline
            const inferredDetails: Array<{ id: string; name: string; untilDate: string }> = [];
            const cryptoInferredDetails: Array<{ id: string; name: string; untilDate: string }> = [];

            allSelected.forEach((id) => {
              const launch = launchDates[id];
              if (!launch) return;

              const assetObj = allAssets.find((a) => a.id === id);
              const assetName = assetObj?.name || id;

              let isBeforeLaunch = false;
              if (id === 'TQQQ' && simYear < 2010) isBeforeLaunch = true;
              else if (id === 'SOXL' && simYear < 2010) isBeforeLaunch = true;
              else if (id === 'UPRO' && (simYear < 2009 || (simYear === 2009 && simMonth < 6))) isBeforeLaunch = true;
              else if (id === 'SCHD' && (simYear < 2011 || (simYear === 2011 && simMonth < 10))) isBeforeLaunch = true;
              else if (id === 'BTC' && (simYear < 2014 || (simYear === 2014 && simMonth < 9))) isBeforeLaunch = true;
              else if (id === 'ETH' && (simYear < 2017 || (simYear === 2017 && simMonth < 11))) isBeforeLaunch = true;
              else if ((id === 'SSO' || id === 'QLD') && (simYear < 2006 || (simYear === 2006 && simMonth < 6))) isBeforeLaunch = true;
              else if (id === 'USD' && simYear < 2007) isBeforeLaunch = true;

              if (isBeforeLaunch) {
                if (id === 'BTC' || id === 'ETH') {
                  cryptoInferredDetails.push({ id, name: assetName, untilDate: launch });
                } else {
                  inferredDetails.push({ id, name: assetName, untilDate: launch });
                }
              }
            });

            if (inferredDetails.length === 0 && cryptoInferredDetails.length === 0) return null;

            return (
              <div className="pt-2 border-t border-[var(--border-color)] text-[11px] text-[var(--text-secondary)] space-y-1.5 font-medium">
                {inferredDetails.length > 0 && (
                  <p className="flex items-start gap-1.5 leading-relaxed">
                    <span className="text-[var(--accent-orange)] shrink-0">💡</span>
                    <span>
                      선택한 종목 중 과거 실데이터가 없는{' '}
                      <strong className="text-[var(--text-primary)] font-bold">
                        {inferredDetails.map((item) => `${item.id}(${item.untilDate} 이전)`).join(', ')}
                      </strong>
                      는 기초 지수 변동률을 기반으로 {formattedSimStart}부터 추론 계산되었습니다.
                    </span>
                  </p>
                )}
                {cryptoInferredDetails.length > 0 && (
                  <p className="flex items-start gap-1.5 text-amber-500/90 font-semibold leading-relaxed">
                    <span className="shrink-0">⚠️</span>
                    <span>
                      암호화폐({' '}
                      <strong>{cryptoInferredDetails.map((item) => `${item.id}, ${item.untilDate} 이전`).join(', ')}</strong>
                      )의 과거 추론 데이터는 지수 연동 모델 특성상 백테스트 신뢰도가 부정확할 수 있으니 참고용으로만 활용하세요.
                    </span>
                  </p>
                )}
              </div>
            );
          })()}
        </div>
      </div>

        {/* ---------------------------------------------------- */}
        {/* DUAL PERFORMANCE METRICS TABLE (3대 핵심 투자 지표)   */}
        {/* ---------------------------------------------------- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {/* Portfolio A Results Card */}
          <div className="p-4 rounded-2xl bg-[var(--bg-main)]/60 border border-[var(--border-color)] space-y-3">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-2">
              <span className="text-xs font-black text-[var(--accent-mid-green)] flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent-mid-green)]" />
                투자 전략 A 성과 리포트
              </span>
              <span className="text-lg font-black text-[var(--accent-mid-green)] font-mono">
                +{simulation.portA.totalRate}%
              </span>
            </div>

            {/* Intuitive Multiplier Highlight */}
            <div className="p-2.5 rounded-xl bg-[var(--accent-mid-green)]/10 border border-[var(--border-color)] text-center space-y-0.5 shadow-2xs">
              <span className="text-xs font-black text-[var(--accent-mid-green)]">
                ✨ 원금이 약 {(simulation.portA.val / Math.max(1, simulation.finalInvested)).toFixed(1)}배가 되었어요!
              </span>
              <p className="text-[11px] text-[var(--text-secondary)] font-medium">
                ({simulation.finalInvested.toLocaleString()}만원 ➔ {simulation.portA.val.toLocaleString()}만원)
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--text-secondary)] font-medium">최종 자산</span>
                <span className="font-mono font-extrabold text-sm text-[var(--text-primary)]">
                  {simulation.portA.val.toLocaleString()} <span className="text-xs font-sans">만원</span>
                </span>
              </div>

              {/* Metric 1: Annual Return (CAGR) */}
              <div className="pt-1.5 border-t border-[var(--border-color)]">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--text-secondary)] font-medium">연수익률 (CAGR)</span>
                  <span className="font-mono font-bold text-[var(--accent-mid-green)]">+{simulation.portA.cagr}% /년</span>
                </div>
              </div>

              {/* Metric 2: Max Drawdown (MDD) */}
              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--text-secondary)] font-medium">최대 손실폭 (MDD)</span>
                  <span className="font-mono font-bold text-red-500">-{simulation.portA.mdd}%</span>
                </div>
              </div>

              {/* Metric 3: Sharpe Ratio */}
              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--text-secondary)] font-medium">위험 대비 수익성 (샤프지수)</span>
                  <span className="font-mono font-bold text-[var(--text-primary)]">{simulation.portA.sharpe}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Portfolio B Results Card */}
          <div className="p-4 rounded-2xl bg-[var(--bg-main)]/60 border border-[var(--border-color)] space-y-3">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-2">
              <span className="text-xs font-black text-[var(--accent-orange)] flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent-orange)]" />
                투자 전략 B 성과 리포트
              </span>
              <span className="text-lg font-black text-[var(--accent-orange)] font-mono">
                +{simulation.portB.totalRate}%
              </span>
            </div>

            {/* Intuitive Multiplier Highlight */}
            <div className="p-2.5 rounded-xl bg-[var(--accent-orange)]/10 border border-[var(--border-color)] text-center space-y-0.5 shadow-2xs">
              <span className="text-xs font-black text-[var(--accent-orange)]">
                🚀 원금이 약 {(simulation.portB.val / Math.max(1, simulation.finalInvested)).toFixed(1)}배가 되었어요!
              </span>
              <p className="text-[11px] text-[var(--text-secondary)] font-medium">
                ({simulation.finalInvested.toLocaleString()}만원 ➔ {simulation.portB.val.toLocaleString()}만원)
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--text-secondary)] font-medium">최종 자산</span>
                <span className="font-mono font-extrabold text-sm text-[var(--text-primary)]">
                  {simulation.portB.val.toLocaleString()} <span className="text-xs font-sans">만원</span>
                </span>
              </div>

              {/* Metric 1: Annual Return (CAGR) */}
              <div className="pt-1.5 border-t border-[var(--border-color)]">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--text-secondary)] font-medium">연수익률 (CAGR)</span>
                  <span className="font-mono font-bold text-[var(--accent-orange)]">+{simulation.portB.cagr}% /년</span>
                </div>
              </div>

              {/* Metric 2: Max Drawdown (MDD) */}
              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--text-secondary)] font-medium">최대 손실폭 (MDD)</span>
                  <span className="font-mono font-bold text-red-500">-{simulation.portB.mdd}%</span>
                </div>
              </div>

              {/* Metric 3: Sharpe Ratio */}
              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--text-secondary)] font-medium">위험 대비 수익성 (샤프지수)</span>
                  <span className="font-mono font-bold text-[var(--text-primary)]">{simulation.portB.sharpe}</span>
                </div>
              </div>
            </div>
          </div>
        </div>


      {/* ---------------------------------------------------- */}
      {/* SIDE-BY-SIDE PORTFOLIO BUILDERS (투자 전략 A vs B)   */}
      {/* ---------------------------------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* PORTFOLIO A BUILDER */}
        <div className="glass-card p-5 rounded-2xl sm:rounded-3xl space-y-4 border border-[var(--border-color)]">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-[var(--accent-mid-green)] flex items-center gap-2">
              <Layers className="w-4 h-4" />
              투자 전략 A 종목 구성
            </h2>
            {availableForA.length > 0 && (
              <button type="button" onClick={handleAddSlotA} className="text-xs font-bold px-2.5 py-1 rounded-lg bg-[var(--accent-mid-green)] text-white hover:opacity-90 transition-all">
                + 종목 추가
              </button>
            )}
          </div>

          <div className="space-y-2.5">
            {portfolioA.map((item, index) => (
              <div key={index} className="p-3 rounded-xl bg-[var(--bg-main)]/60 border border-[var(--border-color)] space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-mono font-bold text-[var(--accent-mid-green)]">종목 {index + 1}:</span>
                  <select
                    value={item.assetId}
                    onChange={(e) => setPortfolioA(portfolioA.map((sa, idx) => (idx === index ? { ...sa, assetId: e.target.value } : sa)))}
                    className="flex-1 appearance-none bg-[var(--card-surface)] text-xs font-bold text-[var(--text-primary)] py-1 px-2 rounded-lg border border-[var(--border-color)] focus:outline-none cursor-pointer"
                  >
                    {allAssets.filter((a) => a.id !== 'CASH').map((asset) => (
                      <option key={asset.id} value={asset.id} disabled={portfolioA.some((sa, idx) => idx !== index && sa.assetId === asset.id)}>
                        {asset.name} ({asset.id})
                      </option>
                    ))}
                  </select>
                  <span className="font-mono text-xs font-extrabold text-[var(--accent-mid-green)] w-10 text-right">{item.weight}%</span>
                  {portfolioA.length > 1 && (
                    <button type="button" onClick={() => setPortfolioA(portfolioA.filter((_, idx) => idx !== index))} className="text-[var(--text-secondary)] hover:text-red-500 p-0.5">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={item.weight}
                    onChange={(e) => handleUpdateWeightA(index, Number(e.target.value))}
                    className="flex-1 accent-[var(--accent-mid-green)] cursor-pointer"
                  />
                  {strategyPeriodA > 0 && (
                    <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] shrink-0 bg-[var(--card-surface)] px-2 py-0.5 rounded-md border border-[var(--border-color)]">
                      <input
                        type="checkbox"
                        checked={item.enableDefense !== false}
                        onChange={(e) => setPortfolioA(portfolioA.map((sa, idx) => (idx === index ? { ...sa, enableDefense: e.target.checked } : sa)))}
                        className="w-3.5 h-3.5 accent-[var(--accent-mid-green)] rounded cursor-pointer"
                      />
                      <span>방어 적용</span>
                    </label>
                  )}
                </div>
              </div>
            ))}

            {/* Clean Cash Slot without white borders */}
            <div className="p-3 rounded-xl bg-[var(--bg-main)]/80 border border-[var(--border-color)] flex items-center justify-between text-xs font-bold">
              <span className="text-[var(--text-primary)]">현금</span>
              <span className="font-mono font-extrabold text-[var(--accent-mid-green)]">{autoCashA}%</span>
            </div>

            {/* Strategy Options for A */}
            <div className="pt-2 space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-[var(--text-secondary)] flex items-center gap-1">
                  <Lightbulb className="w-3.5 h-3.5 text-[var(--accent-mid-green)]" />
                  방어 옵션 (이동평균선)
                </label>
                <button type="button" onClick={() => setActiveTooltip(activeTooltip === 'defense_a' ? null : 'defense_a')} className="text-[var(--text-secondary)] hover:text-[var(--accent-orange)]">
                  <HelpCircle className="w-3.5 h-3.5" />
                </button>
              </div>
              {activeTooltip === 'defense_a' && (
                <div className="p-2.5 rounded-xl bg-[var(--card-surface)] border border-[var(--border-color)] text-[11px] text-[var(--text-secondary)] leading-relaxed animate-popover-expand">
                  시장 변화에 맞춰 적극적으로 매매하는 투자자에게 어울리는 옵션입니다. 일정 기간의 평균 가격(이동평균선) 위로 올라왔을 때만 주식을 사고 보유하며, 평균 가격 밑으로 떨어지는 하락장에서는 현금으로 안전하게 지킵니다. 종목별 체크박스로 방어 적용 여부를 각각 설정할 수 있습니다. (※ TQQQ, QLD 등 레버리지 ETF는 기초 지수 이동평균선을 기준으로 작동합니다)
                </div>
              )}
              <select
                value={strategyPeriodA}
                onChange={(e) => setStrategyPeriodA(Number(e.target.value))}
                className="w-full bg-[var(--bg-main)] text-xs font-bold text-[var(--text-primary)] p-2.5 rounded-xl border border-[var(--border-color)] cursor-pointer"
              >
                <option value={0}>기본 없음 (하락장 상관없이 주식 계속 보유)</option>
                <option value={50}>50일 평균 가격 기준 (단기 빠르게 피하기)</option>
                <option value={100}>100일 평균 가격 기준 (중기 균형 방어)</option>
                <option value={150}>150일 평균 가격 기준 (안정적 방어)</option>
                <option value={200}>200일 평균 가격 기준 (큰 폭락장 방어)</option>
              </select>
            </div>
          </div>
        </div>

        {/* PORTFOLIO B BUILDER */}
        <div className="glass-card p-5 rounded-2xl sm:rounded-3xl space-y-4 border border-[var(--border-color)]">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-[var(--accent-orange)] flex items-center gap-2">
              <Layers className="w-4 h-4" />
              투자 전략 B 종목 구성
            </h2>
            {availableForB.length > 0 && (
              <button type="button" onClick={handleAddSlotB} className="text-xs font-bold px-2.5 py-1 rounded-lg bg-[var(--accent-orange)] text-white hover:bg-[var(--accent-orange)]/90 transition-all">
                + 종목 추가
              </button>
            )}
          </div>

          <div className="space-y-2.5">
            {portfolioB.map((item, index) => (
              <div key={index} className="p-3 rounded-xl bg-[var(--bg-main)]/60 border border-[var(--border-color)] space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-mono font-bold text-[var(--accent-orange)]">종목 {index + 1}:</span>
                  <select
                    value={item.assetId}
                    onChange={(e) => setPortfolioB(portfolioB.map((sa, idx) => (idx === index ? { ...sa, assetId: e.target.value } : sa)))}
                    className="flex-1 appearance-none bg-[var(--card-surface)] text-xs font-bold text-[var(--text-primary)] py-1 px-2 rounded-lg border border-[var(--border-color)] focus:outline-none cursor-pointer"
                  >
                    {allAssets.filter((a) => a.id !== 'CASH').map((asset) => (
                      <option key={asset.id} value={asset.id} disabled={portfolioB.some((sa, idx) => idx !== index && sa.assetId === asset.id)}>
                        {asset.name} ({asset.id})
                      </option>
                    ))}
                  </select>
                  <span className="font-mono text-xs font-extrabold text-[var(--accent-orange)] w-10 text-right">{item.weight}%</span>
                  {portfolioB.length > 1 && (
                    <button type="button" onClick={() => setPortfolioB(portfolioB.filter((_, idx) => idx !== index))} className="text-[var(--text-secondary)] hover:text-red-500 p-0.5">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={item.weight}
                    onChange={(e) => handleUpdateWeightB(index, Number(e.target.value))}
                    className="flex-1 accent-[var(--accent-orange)] cursor-pointer"
                  />
                  {strategyPeriodB > 0 && (
                    <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] shrink-0 bg-[var(--card-surface)] px-2 py-0.5 rounded-md border border-[var(--border-color)]">
                      <input
                        type="checkbox"
                        checked={item.enableDefense !== false}
                        onChange={(e) => setPortfolioB(portfolioB.map((sa, idx) => (idx === index ? { ...sa, enableDefense: e.target.checked } : sa)))}
                        className="w-3.5 h-3.5 accent-[var(--accent-orange)] rounded cursor-pointer"
                      />
                      <span>방어 적용</span>
                    </label>
                  )}
                </div>
              </div>
            ))}

            {/* Clean Cash Slot without white borders */}
            <div className="p-3 rounded-xl bg-[var(--bg-main)]/80 border border-[var(--border-color)] flex items-center justify-between text-xs font-bold">
              <span className="text-[var(--text-primary)]">현금</span>
              <span className="font-mono font-extrabold text-[var(--accent-orange)]">{autoCashB}%</span>
            </div>

            {/* Strategy Options for B */}
            <div className="pt-2 space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-[var(--text-secondary)] flex items-center gap-1">
                  <Lightbulb className="w-3.5 h-3.5 text-[var(--accent-orange)]" />
                  방어 옵션 (이동평균선)
                </label>
                <button type="button" onClick={() => setActiveTooltip(activeTooltip === 'defense_b' ? null : 'defense_b')} className="text-[var(--text-secondary)] hover:text-[var(--accent-orange)]">
                  <HelpCircle className="w-3.5 h-3.5" />
                </button>
              </div>
              {activeTooltip === 'defense_b' && (
                <div className="p-2.5 rounded-xl bg-[var(--card-surface)] border border-[var(--border-color)] text-[11px] text-[var(--text-secondary)] leading-relaxed animate-popover-expand">
                  시장 변화에 맞춰 적극적으로 매매하는 투자자에게 어울리는 옵션입니다. 일정 기간의 평균 가격(이동평균선) 위로 올라왔을 때만 주식을 사고 보유하며, 평균 가격 밑으로 떨어지는 하락장에서는 현금으로 안전하게 지킵니다. 종목별 체크박스로 방어 적용 여부를 각각 설정할 수 있습니다. (※ TQQQ, QLD 등 레버리지 ETF는 기초 지수 이동평균선을 기준으로 작동합니다)
                </div>
              )}
              <select
                value={strategyPeriodB}
                onChange={(e) => setStrategyPeriodB(Number(e.target.value))}
                className="w-full bg-[var(--bg-main)] text-xs font-bold text-[var(--text-primary)] p-2.5 rounded-xl border border-[var(--border-color)] cursor-pointer"
              >
                <option value={0}>기본 없음 (하락장 상관없이 주식 계속 보유)</option>
                <option value={50}>50일 평균 가격 기준 (단기 빠르게 피하기)</option>
                <option value={100}>100일 평균 가격 기준 (중기 균형 방어)</option>
                <option value={150}>150일 평균 가격 기준 (안정적 방어)</option>
                <option value={200}>200일 평균 가격 기준 (큰 폭락장 방어)</option>
              </select>
            </div>
          </div>
        </div>

      </div>

      {/* Dynamic Data Synthesis Notice & Disclaimer */}
      <div className="p-4 rounded-2xl bg-[var(--bg-main)]/80 border border-[var(--border-color)] space-y-1.5 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-[var(--text-secondary)]">
          <AlertTriangle className="w-4 h-4 text-[var(--accent-orange)] shrink-0" />
          <span>결과 안내 및 과거 데이터 산출 방식</span>
        </div>
        <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed font-medium">
          본 도구는 Yahoo Finance의 20년 실제 데이터를 기반으로 작동됩니다. 선택하신 투자 주기(매달/매주)마다 설정하신 금액을 적립하고 선택한 방어 옵션에 맞춰 자동 리밸런싱됩니다. 단, 일부 종목의 상장 전 과거 데이터는 기초 지수 움직임을 기반으로 추론 계산하였으며, 과거 데이터 결과가 미래의 수익을 보장하지 않습니다.
        </p>
      </div>

    </div>
  );
}
