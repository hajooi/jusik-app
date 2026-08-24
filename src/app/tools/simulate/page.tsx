'use client';

import { useState, useMemo, useRef, MouseEvent, TouchEvent, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import backtestJson from '@/data/backtestData.json';
import historicalPrices from '@/data/historicalPrices.json';
import { calculatePersonalitySimulatorConfig, getUserPersonalityInfo } from '@/utils/personalitySimulatorMapping';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import CommentSection from '@/components/CommentSection';
import RevealOnScroll from '@/components/common/RevealOnScroll';
import SmoothHeight from '@/components/SmoothHeight';
import { 
  LineChart, 
  TrendingUp, 
  Sliders, 
  Sparkles, 
  Layers, 
  Trash2, 
  BarChart3, 
  Lightbulb, 
  AlertTriangle,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  Info,
  ShieldAlert,
  Target,
  ArrowLeft,
  RotateCcw,
  Lock,
  Crown,
  Zap,
  X
} from 'lucide-react';

interface SelectedAsset {
  assetId: string;
  weight: number;
  enableDefense?: boolean;
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

const SIMULATOR_SETTINGS_KEY = 'jusik_custom_simulator_settings';

interface AssetSelectOption {
  id: string;
  label: string;
}

interface AssetSelectGroup {
  groupLabel: string;
  options: AssetSelectOption[];
}

const SELECT_ASSET_GROUPS: AssetSelectGroup[] = [
  {
    groupLabel: '미국 대표 지수 & 레버리지',
    options: [
      { id: 'SPY', label: 'S&P 500 (SPY)' },
      { id: 'SSO', label: '　└ S&P 500 2배 레버리지 (SSO)' },
      { id: 'UPRO', label: '　└ S&P 500 3배 레버리지 (UPRO)' },
      { id: 'QQQ', label: '나스닥 100 (QQQ)' },
      { id: 'QLD', label: '　└ 나스닥 100 2배 레버리지 (QLD)' },
      { id: 'TQQQ', label: '　└ 나스닥 100 3배 레버리지 (TQQQ)' },
      { id: 'SOXX', label: '필라델피아 반도체 (SOXX)' },
      { id: 'USD', label: '　└ 반도체 2배 레버리지 (USD)' },
      { id: 'SOXL', label: '　└ 반도체 3배 레버리지 (SOXL)' },
    ],
  },
  {
    groupLabel: '배당 성장',
    options: [
      { id: 'SCHD', label: '미국배당다우존스 (SCHD)' },
    ],
  },
  {
    groupLabel: '한국 대표 지수',
    options: [
      { id: 'KS200', label: '코스피 200 (KS200)' },
      { id: 'KQ150', label: '코스닥 150 (KQ150)' },
    ],
  },
  {
    groupLabel: '미국 국채',
    options: [
      { id: 'SHY', label: '미국 단기채 (SHY - 1~3년)' },
      { id: 'IEF', label: '미국 중기채 (IEF - 7~10년)' },
      { id: 'TLT', label: '미국 장기채 (TLT - 20년+)' },
    ],
  },
  {
    groupLabel: '금 & 은',
    options: [
      { id: 'GLD', label: '금 (GLD)' },
      { id: 'SLV', label: '은 (SLV)' },
    ],
  },
  {
    groupLabel: '암호화폐',
    options: [
      { id: 'BTC', label: '비트코인 (BTC)' },
      { id: 'ETH', label: '이더리움 (ETH)' },
    ],
  },
  {
    groupLabel: '미국 대표 개별주',
    options: [
      { id: 'AAPL', label: '애플 (AAPL)' },
      { id: 'NVDA', label: '엔비디아 (NVDA)' },
      { id: 'MSFT', label: '마이크로소프트 (MSFT)' },
      { id: 'GOOGL', label: '알파벳/구글 (GOOGL)' },
      { id: 'AMZN', label: '아마존 (AMZN)' },
      { id: 'META', label: '메타 (META)' },
      { id: 'TSM', label: 'TSMC (TSM)' },
      { id: 'BRK_B', label: '버크셔 해서웨이 (BRK.B)' },
      { id: 'TSLA', label: '테슬라 (TSLA)' },
      { id: 'LLY', label: '일라이 릴리 (LLY)' },
    ],
  },
  {
    groupLabel: '한국 대표 개별주',
    options: [
      { id: '005930', label: '삼성전자 (005930)' },
      { id: '000660', label: 'SK하이닉스 (000660)' },
    ],
  },
];

function SimulatorContent() {
  const searchParams = useSearchParams();
  const allAssets = backtestJson.assets;
  const { user, updateSimulatorSettings, openAuthPopover } = useAuth();

  // Pro Membership Status Evaluation
  const isPro = useMemo(() => {
    if (!user) return false;
    if (user.nickname === '주식부엉') return true;
    if ((user as any).isPro) return true;
    if ((user as any).proExpiresAt && new Date((user as any).proExpiresAt).getTime() > Date.now()) return true;
    return false;
  }, [user]);

  const [proPopoverOpen, setProPopoverOpen] = useState<boolean>(false);

  // Global Simulation Settings
  const [initialCapital, setInitialCapital] = useState<number>(100); // 100만 원
  const [depositAmount, setDepositAmount] = useState<number>(50); // 저금 금액 (50만 원)
  const [durationYears, setDurationYears] = useState<number>(30); // 기본 30년
  const [depositFrequency, setDepositFrequency] = useState<Frequency>('monthly');

  // Active Tooltip Info Modals State
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  // Personality Profile State
  const [userProfileCode, setUserProfileCode] = useState<string | null>(null);
  const [targetCAGR, setTargetCAGR] = useState<number>(15); // 사용자 희망/추천 목표 연수익률 (%)
  const [maxTolerableMDD, setMaxTolerableMDD] = useState<number>(20); // 사용자 희망/추천 감내 MDD (%)

  // Portfolio A Configuration (Default: Tailored Recommendation)
  const [portfolioA, setPortfolioA] = useState<SelectedAsset[]>([
    { assetId: 'SPY', weight: 50, enableDefense: true },
    { assetId: 'QQQ', weight: 50, enableDefense: true },
  ]);
  const [strategyPeriodA, setStrategyPeriodA] = useState<number>(0);

  // Portfolio B Configuration (Default: Custom User Strategy)
  const [portfolioB, setPortfolioB] = useState<SelectedAsset[]>([
    { assetId: 'SPY', weight: 60, enableDefense: false },
    { assetId: 'QQQ', weight: 40, enableDefense: false },
  ]);
  const [strategyPeriodB, setStrategyPeriodB] = useState<number>(0);
  const settingsRestoredRef = useRef(false);

  // [본인 성향 & 4축 세부 점수 기반 맞춤 포트폴리오 적용 함수]
  const applyPersonalityStrategy = (code: string | null, scores?: any) => {
    setUserProfileCode(code);
    const config = calculatePersonalitySimulatorConfig(code, scores);
    setPortfolioA(config.portfolioA);
    setStrategyPeriodA(config.strategyPeriodA);
    setTargetCAGR(config.recommendedTargetCAGR);
    setMaxTolerableMDD(config.recommendedMaxMDD);
  };

  // [목표치 성향 맞춤 권장값으로 리셋]
  const resetGoalSettingsToRecommendation = () => {
    const info = getUserPersonalityInfo({ user, searchParams });
    const config = calculatePersonalitySimulatorConfig(info.typeCode, info.scores);
    setTargetCAGR(config.recommendedTargetCAGR);
    setMaxTolerableMDD(config.recommendedMaxMDD);
  };

  const prevUserNicknameRef = useRef<string | undefined>(undefined);

  // 1. [초기 마운트 및 로그인 시 1회만 복원]
  useEffect(() => {
    const currentNickname = user?.nickname;
    if (settingsRestoredRef.current && prevUserNicknameRef.current === currentNickname) {
      return;
    }
    prevUserNicknameRef.current = currentNickname;

    try {
      const info = getUserPersonalityInfo({ user, searchParams });
      setUserProfileCode(info.typeCode);
      const config = calculatePersonalitySimulatorConfig(info.typeCode, info.scores);

      let savedRaw = typeof window !== 'undefined' ? localStorage.getItem(SIMULATOR_SETTINGS_KEY) : null;
      let settingsSource = user?.simulatorSettings || (savedRaw ? JSON.parse(savedRaw) : null);

      if (settingsSource) {
        if (settingsSource.targetCAGR !== undefined) setTargetCAGR(settingsSource.targetCAGR);
        else setTargetCAGR(config.recommendedTargetCAGR);

        if (settingsSource.maxTolerableMDD !== undefined) setMaxTolerableMDD(settingsSource.maxTolerableMDD);
        else setMaxTolerableMDD(config.recommendedMaxMDD);

        if (settingsSource.portfolioA && settingsSource.portfolioA.length > 0) setPortfolioA(settingsSource.portfolioA);
        else setPortfolioA(config.portfolioA);

        if (settingsSource.strategyPeriodA !== undefined) setStrategyPeriodA(settingsSource.strategyPeriodA);
        else setStrategyPeriodA(config.strategyPeriodA);

        if (settingsSource.portfolioB && settingsSource.portfolioB.length > 0) setPortfolioB(settingsSource.portfolioB);
        if (settingsSource.strategyPeriodB !== undefined) setStrategyPeriodB(settingsSource.strategyPeriodB);
        if (settingsSource.initialCapital !== undefined) setInitialCapital(settingsSource.initialCapital);
        if (settingsSource.depositAmount !== undefined) setDepositAmount(settingsSource.depositAmount);
        if (settingsSource.depositFrequency) setDepositFrequency(settingsSource.depositFrequency);
        settingsRestoredRef.current = true;
      } else {
        setPortfolioA(config.portfolioA);
        setStrategyPeriodA(config.strategyPeriodA);
        setTargetCAGR(config.recommendedTargetCAGR);
        setMaxTolerableMDD(config.recommendedMaxMDD);
        settingsRestoredRef.current = true;
      }
    } catch (e) {
      console.error('Failed to restore custom simulator settings:', e);
    }
  }, [user?.nickname, searchParams]);

  // 2. [수정값 실시간 저장 - 디바운스 적용으로 입력 튕김 방지]
  useEffect(() => {
    if (!settingsRestoredRef.current) return;
    const timer = setTimeout(() => {
      try {
        const customData = {
          targetCAGR,
          maxTolerableMDD,
          portfolioA,
          strategyPeriodA,
          portfolioB,
          strategyPeriodB,
          initialCapital,
          depositAmount,
          durationYears,
          depositFrequency
        };
        localStorage.setItem(SIMULATOR_SETTINGS_KEY, JSON.stringify(customData));
        updateSimulatorSettings(customData);
      } catch (e) {
        console.error(e);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [targetCAGR, maxTolerableMDD, portfolioA, strategyPeriodA, portfolioB, strategyPeriodB, initialCapital, depositAmount, durationYears, depositFrequency]);

  // Interactive Canvas Hover & Drag States
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [dragStart, setDragStart] = useState<number | null>(null);
  const [dragEnd, setDragEnd] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [customStartDate, setCustomStartDate] = useState<string | null>(null);
  const [customEndDate, setCustomEndDate] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Weight Calculation Helpers
  const totalWeightA = useMemo(() => portfolioA.reduce((sum, item) => sum + item.weight, 0), [portfolioA]);
  const autoCashA = Math.max(0, 100 - totalWeightA);

  const totalWeightB = useMemo(() => portfolioB.reduce((sum, item) => sum + item.weight, 0), [portfolioB]);
  const autoCashB = Math.max(0, 100 - totalWeightB);

  // Available unused assets for portfolio A & B
  const availableForA = useMemo(() => allAssets.filter((a) => a.id !== 'CASH' && !portfolioA.some((sa) => sa.assetId === a.id)), [allAssets, portfolioA]);
  const availableForB = useMemo(() => allAssets.filter((a) => a.id !== 'CASH' && !portfolioB.some((sa) => sa.assetId === a.id)), [allAssets, portfolioB]);

  // Grouped assets for categorized dropdown
  const assetGroups = useMemo(() => {
    const groupOrder = [
      '미국 대표 지수 & 레버리지',
      '배당 성장',
      '한국 대표 지수',
      '미국 국채',
      '금 & 은',
      '미국 대표 개별주',
      '한국 대표 개별주',
      '암호화폐'
    ];
    const map = new Map<string, typeof allAssets>();
    allAssets.forEach(a => {
      if (a.id === 'CASH') return;
      const grp = (a as any).group || '미국 대표 지수 & 레버리지';
      if (!map.has(grp)) map.set(grp, []);
      map.get(grp)!.push(a);
    });
    const result: { groupName: string; assets: typeof allAssets }[] = [];
    groupOrder.forEach(gName => {
      if (map.has(gName)) {
        result.push({ groupName: gName, assets: map.get(gName)! });
        map.delete(gName);
      }
    });
    map.forEach((assets, groupName) => {
      result.push({ groupName, assets });
    });
    return result;
  }, [allAssets]);

  // Slot Management for Portfolio A
  const handleAddSlotA = () => {
    if (availableForA.length === 0) return;
    const rem = Math.max(0, 100 - totalWeightA);
    setPortfolioA([...portfolioA, { assetId: availableForA[0].id, weight: rem > 0 ? rem : 10, enableDefense: true }]);
  };

  const handleUpdateWeightA = (index: number, requestedWeight: number) => {
    const otherSum = portfolioA.reduce((sum, item, idx) => (idx === index ? sum : sum + item.weight), 0);
    const maxAllowed = Math.max(0, 100 - otherSum);
    const safe = Math.max(0, Math.min(maxAllowed, requestedWeight));
    setPortfolioA(portfolioA.map((item, idx) => (idx === index ? { ...item, weight: safe } : item)));
  };

  // Slot Management for Portfolio B
  const handleAddSlotB = () => {
    if (availableForB.length === 0) return;
    const rem = Math.max(0, 100 - totalWeightB);
    setPortfolioB([...portfolioB, { assetId: availableForB[0].id, weight: rem > 0 ? rem : 10, enableDefense: true }]);
  };

  const handleUpdateWeightB = (index: number, requestedWeight: number) => {
    const otherSum = portfolioB.reduce((sum, item, idx) => (idx === index ? sum : sum + item.weight), 0);
    const maxAllowed = Math.max(0, 100 - otherSum);
    const safe = Math.max(0, Math.min(maxAllowed, requestedWeight));
    setPortfolioB(portfolioB.map((item, idx) => (idx === index ? { ...item, weight: safe } : item)));
  };

  // ----------------------------------------------------------------------
  // DUAL PORTFOLIO WEEKLY HIGH-RESOLUTION BACKTEST ENGINE
  // ----------------------------------------------------------------------
  const simulation = useMemo(() => {
    // Always use weekly high-resolution dataset for smooth zoom and accurate compounding
    const histMap = historicalPrices.weekly as Record<string, Array<{ date: string; price: number }>>;
    const allCanonicalDates = (histMap.SPY || []).map((d) => d.date);

    let startIndex = 0;
    let endIndex = Math.max(0, allCanonicalDates.length - 1);

    if (customStartDate || customEndDate) {
      if (customStartDate) {
        const sIdx = allCanonicalDates.findIndex((d) => d >= customStartDate);
        if (sIdx !== -1) startIndex = sIdx;
      }
      if (customEndDate) {
        let eIdx = -1;
        for (let i = allCanonicalDates.length - 1; i >= 0; i--) {
          if (allCanonicalDates[i] <= customEndDate) {
            eIdx = i;
            break;
          }
        }
        if (eIdx !== -1 && eIdx >= startIndex) endIndex = eIdx;
      }
    } else {
      // Free users start at 15 years ago (2011-08-01), Pro users start at full 30 years (1996-08-02)
      if (!isPro) {
        const s15Idx = allCanonicalDates.findIndex((d) => d >= '2011-08-01');
        if (s15Idx !== -1) startIndex = s15Idx;
      } else {
        startIndex = 0;
      }
      endIndex = Math.max(0, allCanonicalDates.length - 1);
    }

    const targetLength = Math.max(1, endIndex - startIndex + 1);
    const timeline = allCanonicalDates.slice(startIndex, endIndex + 1);

    const points: ChartPoint[] = [];
    let cumulativeInvested = initialCapital;

    const getAssetPrice = (assetId: string, idx: number): number => {
      const series = histMap[assetId];
      if (series && series[idx] && series[idx].price > 0) {
        return series[idx].price;
      }
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
          const mult = assetId === 'BTC' ? 1.4 : 1.6;
          const prevPrice = getAssetPrice(assetId, idx - 1);
          return Math.max(0.01, prevPrice * (1 + qqqRet * mult));
        }
        return assetId === 'BTC' ? 50 : 10;
      }
      return histMap['SPY']?.[idx]?.price || 100;
    };

    const getBenchmarkSeries = (assetId: string) => {
      if (assetId === 'SSO' || assetId === 'UPRO' || assetId === 'SCHD') return histMap['SPY'];
      if (assetId === 'TQQQ' || assetId === 'QLD' || assetId === 'BTC' || assetId === 'ETH') return histMap['QQQ'];
      if (assetId === 'USD' || assetId === 'SOXL') return histMap['SOXX'];
      if (assetId === 'SHY') return histMap['IEF'];
      return histMap[assetId] || histMap['SPY'];
    };

    const defenseCashA: Record<string, number> = {};
    const defenseCashB: Record<string, number> = {};

    const sharesA: Record<string, number> = {};
    let cashA = initialCapital * (autoCashA / 100);
    portfolioA.forEach((item) => {
      defenseCashA[item.assetId] = 0;
      const firstPrice = getAssetPrice(item.assetId, startIndex);
      sharesA[item.assetId] = (initialCapital * (item.weight / 100)) / firstPrice;
    });

    const sharesB: Record<string, number> = {};
    let cashB = initialCapital * (autoCashB / 100);
    portfolioB.forEach((item) => {
      defenseCashB[item.assetId] = 0;
      const firstPrice = getAssetPrice(item.assetId, startIndex);
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
      const dataIndex = startIndex + t;
      const dateStr = allCanonicalDates[dataIndex];

      if (t > 0) {
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

        const twrStepA = prevValA > 0 ? (preValA - prevValA) / prevValA : 0;
        const twrStepB = prevValB > 0 ? (preValB - prevValB) / prevValB : 0;
        twrReturnsA.push(twrStepA);
        twrReturnsB.push(twrStepB);

        const prevDateStr = allCanonicalDates[dataIndex - 1];
        const isNewMonth = dateStr.slice(0, 7) !== (prevDateStr ? prevDateStr.slice(0, 7) : '');
        const shouldDeposit = depositFrequency === 'weekly' || isNewMonth;
        const stepDeposit = shouldDeposit ? depositAmount : 0;

        cumulativeInvested += stepDeposit;

        // Portfolio A Rebalance
        cashA += stepDeposit * (autoCashA / 100);
        portfolioA.forEach((item) => {
          const benchSeries = getBenchmarkSeries(item.assetId);
          const benchPrice = benchSeries?.[dataIndex]?.price || getAssetPrice(item.assetId, dataIndex);
          const actualPrice = getAssetPrice(item.assetId, dataIndex);
          if (!actualPrice || actualPrice <= 0) return;

          const isDefenseEnabledForItem = item.enableDefense !== false && strategyPeriodA > 0;
          let isItemDefending = false;

          if (isDefenseEnabledForItem && benchPrice && benchPrice > 0 && dataIndex >= 2) {
            const barCount = Math.max(2, Math.round(strategyPeriodA / 5));
            const windowSize = Math.min(dataIndex, barCount);
            const recentPrices = benchSeries.slice(dataIndex - windowSize, dataIndex).map((p) => p.price);
            const ma = recentPrices.reduce((a, b) => a + b, 0) / (recentPrices.length || 1);
            if (benchPrice < ma) isItemDefending = true;
          }

          const depositAlloc = stepDeposit * (item.weight / 100);
          if (isItemDefending) {
            if ((sharesA[item.assetId] || 0) > 0) {
              defenseCashA[item.assetId] = (defenseCashA[item.assetId] || 0) + (sharesA[item.assetId] || 0) * actualPrice;
              sharesA[item.assetId] = 0;
            }
            defenseCashA[item.assetId] = (defenseCashA[item.assetId] || 0) + depositAlloc;
          } else {
            const totalMoneyToBuy = depositAlloc + (defenseCashA[item.assetId] || 0);
            sharesA[item.assetId] = (sharesA[item.assetId] || 0) + totalMoneyToBuy / actualPrice;
            defenseCashA[item.assetId] = 0;
          }
        });

        // Portfolio B Rebalance
        cashB += stepDeposit * (autoCashB / 100);
        portfolioB.forEach((item) => {
          const benchSeries = getBenchmarkSeries(item.assetId);
          const benchPrice = benchSeries?.[dataIndex]?.price || getAssetPrice(item.assetId, dataIndex);
          const actualPrice = getAssetPrice(item.assetId, dataIndex);
          if (!actualPrice || actualPrice <= 0) return;

          const isDefenseEnabledForItem = item.enableDefense !== false && strategyPeriodB > 0;
          let isItemDefending = false;

          if (isDefenseEnabledForItem && benchPrice && benchPrice > 0 && dataIndex >= 2) {
            const barCount = Math.max(2, Math.round(strategyPeriodB / 5));
            const windowSize = Math.min(dataIndex, barCount);
            const recentPrices = benchSeries.slice(dataIndex - windowSize, dataIndex).map((p) => p.price);
            const ma = recentPrices.reduce((a, b) => a + b, 0) / (recentPrices.length || 1);
            if (benchPrice < ma) isItemDefending = true;
          }

          const depositAlloc = stepDeposit * (item.weight / 100);
          if (isItemDefending) {
            if ((sharesB[item.assetId] || 0) > 0) {
              defenseCashB[item.assetId] = (defenseCashB[item.assetId] || 0) + (sharesB[item.assetId] || 0) * actualPrice;
              sharesB[item.assetId] = 0;
            }
            defenseCashB[item.assetId] = (defenseCashB[item.assetId] || 0) + depositAlloc;
          } else {
            const totalMoneyToBuy = depositAlloc + (defenseCashB[item.assetId] || 0);
            sharesB[item.assetId] = (sharesB[item.assetId] || 0) + totalMoneyToBuy / actualPrice;
            defenseCashB[item.assetId] = 0;
          }
        });
      }

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
    const years = Math.max(0.1, targetLength / 52.1428);

    const cagrA = (Math.pow(finalPoint.valA / finalPoint.invested, 1 / years) - 1) * 100;
    const cagrB = (Math.pow(finalPoint.valB / finalPoint.invested, 1 / years) - 1) * 100;

    const computeTWRSharpe = (returns: number[]) => {
      if (returns.length < 2) return 0;
      const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
      const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (returns.length - 1);
      const stdDev = Math.sqrt(variance);
      const periodsPerYear = 52;
      const annualizedReturn = mean * periodsPerYear;
      const annualizedVol = stdDev * Math.sqrt(periodsPerYear);
      const rf = 0.02;
      return annualizedVol > 0 ? (annualizedReturn - rf) / annualizedVol : 0;
    };

    const sharpeA = computeTWRSharpe(twrReturnsA);
    const sharpeB = computeTWRSharpe(twrReturnsB);

    return {
      points,
      startDate: points[0]?.date || '2006-01-01',
      finalInvested: finalPoint.invested,
      portA: {
        val: finalPoint.valA,
        totalRate: finalPoint.retA,
        cagr: Number(cagrA.toFixed(1)),
        mdd: Number((maxDDA * 100).toFixed(1)),
        sharpe: sharpeA.toFixed(2),
      },
      portB: {
        val: finalPoint.valB,
        totalRate: finalPoint.retB,
        cagr: Number(cagrB.toFixed(1)),
        mdd: Number((maxDDB * 100).toFixed(1)),
        sharpe: sharpeB.toFixed(2),
      },
    };
  }, [portfolioA, autoCashA, strategyPeriodA, portfolioB, autoCashB, strategyPeriodB, initialCapital, depositAmount, depositFrequency, customStartDate, customEndDate, isPro]);

  // Real-time Warning & Feedback Evaluation for Strategy B (Custom Strategy)
  const evalFeedbackB = useMemo(() => {
    const actualMDD = simulation.portB.mdd;
    const actualCAGR = simulation.portB.cagr;

    const isRiskTooHigh = actualMDD > maxTolerableMDD + 3; // Risk exceeds limit by > 3%
    const isReturnTooLow = actualCAGR < targetCAGR - 3; // Return falls short by > 3%

    if (isRiskTooHigh && isReturnTooLow) {
      return {
        type: 'danger',
        title: '⚠️ 목표 대비 위험이 크고 수익률이 미달됩니다',
        desc: `최대 손실폭(-${actualMDD}%)이 감내 목표(-${maxTolerableMDD}%)를 넘어서며, 연수익률(+${actualCAGR}%)도 목표(+${targetCAGR}%)보다 낮습니다. 변동성이 큰 자산 비중을 줄이거나 200일선 방어 옵션을 활용해보세요.`,
      };
    }
    if (isRiskTooHigh) {
      return {
        type: 'warning',
        title: '⚠️ 감내 가능한 범위를 넘어서는 위험한 전략입니다',
        desc: `과거 최대 손실폭(-${actualMDD}%)이 설정하신 감내 기준(-${maxTolerableMDD}%)을 초과합니다. 200일선 방어 옵션을 켜거나 안전 자산(미국 배당 다우존스, 현금) 비중을 높여 위험을 낮춰보세요.`,
      };
    }
    if (isReturnTooLow) {
      return {
        type: 'info',
        title: '💡 목표 수익률에 다소 미치지 못합니다',
        desc: `연수익률(+${actualCAGR}%)이 목표(+${targetCAGR}%)보다 낮습니다. 장기 성장성이 높은 지수나 비중 조절을 고려해보세요.`,
      };
    }
    return {
      type: 'success',
      title: '✨ 목표에 잘 부합하는 균형 잡힌 전략입니다',
      desc: `목표 연수익률(+${targetCAGR}%)을 충족하면서 감내 손실폭(-${maxTolerableMDD}%) 내에서 안정적으로 운용되는 훌륭한 포트폴리오입니다.`,
    };
  }, [simulation.portB, targetCAGR, maxTolerableMDD]);

  // Chart Canvas Dimensions
  const chartHeight = 320;
  const chartWidth = 800;
  const proLeftOffset = !isPro && !customStartDate ? 36 : 0;

  const valsA = simulation.points.map((p) => p.valA);
  const valsB = simulation.points.map((p) => p.valB);
  const investedVals = simulation.points.map((p) => p.invested);

  const maxVal = Math.max(...valsA, ...valsB, ...investedVals, 10);
  const minVal = Math.min(...valsA, ...valsB, ...investedVals, 0) * 0.9;

  const getX = (index: number) => {
    const total = simulation.points.length;
    if (total <= 1) return proLeftOffset;
    return proLeftOffset + (index / (total - 1)) * (chartWidth - proLeftOffset);
  };

  const getY = (val: number) => {
    return chartHeight - ((val - minVal) / (maxVal - minVal || 1)) * (chartHeight - 40) - 20;
  };

  const getSvgPath = (values: number[]) => {
    if (values.length === 0) return '';
    const points = values.map((val, idx) => `${getX(idx)},${getY(val)}`);
    return `M ${points.join(' L ')}`;
  };

  const getIndexFromX = (clientX: number) => {
    if (!svgRef.current) return null;
    const rect = svgRef.current.getBoundingClientRect();
    const relativeX = clientX - rect.left;
    const normalizedX = (relativeX / rect.width) * chartWidth;
    if (normalizedX < proLeftOffset) return 0;
    const effectiveWidth = chartWidth - proLeftOffset;
    const ratio = Math.max(0, Math.min(1, (normalizedX - proLeftOffset) / (effectiveWidth || 1)));
    return Math.round(ratio * (simulation.points.length - 1));
  };

  const handlePointerMove = (clientX: number) => {
    const index = getIndexFromX(clientX);
    if (index !== null) {
      setHoverIndex(index);
      if (isDragging) setDragEnd(index);
    }
  };

  const handleMouseDown = (e: MouseEvent) => {
    const index = getIndexFromX(e.clientX);
    if (index !== null) {
      setIsDragging(true);
      setDragStart(index);
      setDragEnd(index);
    }
  };

  const handleTouchStart = (e: TouchEvent) => {
    if (e.touches.length === 0) return;
    const index = getIndexFromX(e.touches[0].clientX);
    if (index !== null) {
      setIsDragging(true);
      setDragStart(index);
      setDragEnd(index);
      setHoverIndex(index);
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (e.touches.length === 0) return;
    const index = getIndexFromX(e.touches[0].clientX);
    if (index !== null) {
      setHoverIndex(index);
      if (isDragging) setDragEnd(index);
    }
  };

  const handleDragEndAction = () => {
    if (isDragging && dragStart !== null && dragEnd !== null && Math.abs(dragEnd - dragStart) >= 2) {
      const startIdx = Math.min(dragStart, dragEnd);
      const endIdx = Math.max(dragStart, dragEnd);
      const sDate = simulation.points[startIdx]?.date;
      const eDate = simulation.points[endIdx]?.date;

      if (sDate && eDate) {
        setCustomStartDate(sDate);
        setCustomEndDate(eDate);
      }
    }
    setIsDragging(false);
    setDragStart(null);
    setDragEnd(null);
  };

  const handleTouchEnd = () => {
    handleDragEndAction();
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
    <RevealOnScroll>
      <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-4 sm:space-y-6 select-none">
      
      {/* Top Header Navigation */}
      <div className="flex items-center justify-end">
        <Link
          href="/tools"
          className="inline-flex items-center gap-1.5 font-bold text-xs sm:text-sm text-[var(--text-secondary)] hover:text-[var(--accent-orange)] transition-all duration-300 glass-card glass-card-hover px-3.5 py-2 rounded-full active:scale-95 border border-[var(--border-color)]"
        >
          <ArrowLeft className="w-4 h-4" />
          투자도구 목록으로
        </Link>
      </div>

      {/* Header Banner */}
      <div className="space-y-1 py-1">
        <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
          투자 전략 시뮬레이터
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium">
          내 투자 성향 및 목표에 적합한 전략을 검증하고, 나만의 성과를 데이터로 비교해보세요.
        </p>
      </div>

      {/* ---------------------------------------------------- */}
      {/* PERSONALIZED TARGET & RISK CONTROLS (성향 연동 가이드) */}
      {/* ---------------------------------------------------- */}
      <div className="glass-card p-5 rounded-2xl sm:rounded-3xl space-y-4 border border-[var(--border-color)] relative overflow-hidden shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-color)] pb-3">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-[var(--accent-orange)]" />
            <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
              목표 연수익률 & 감내 손실 설정
            </h2>
          </div>
          <button
            type="button"
            onClick={resetGoalSettingsToRecommendation}
            className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full bg-[var(--card-surface)] text-[var(--accent-orange)] border border-[var(--border-color)] hover:border-[var(--accent-orange)]/40 hover:bg-[var(--accent-orange)]/10 active:scale-95 transition-all cursor-pointer shadow-2xs"
          >
            <RotateCcw className="w-3 h-3 text-[var(--accent-orange)]" />
            <span>{userProfileCode ? `${userProfileCode} 맞춤값으로 초기화` : '기본 맞춤값으로 초기화'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Target CAGR Control */}
          <div className="space-y-2 bg-[var(--bg-main)]/60 p-3.5 rounded-xl border border-[var(--border-color)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--text-secondary)] flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-[var(--accent-mid-green)]" />
                목표 연수익률 (CAGR)
              </span>
              <span className="text-sm font-extrabold text-[var(--accent-mid-green)] font-mono">
                +{targetCAGR}%
              </span>
            </div>
            <input
              type="range"
              min={5}
              max={40}
              step={1}
              value={targetCAGR}
              onChange={(e) => setTargetCAGR(Number(e.target.value))}
              className="w-full accent-[var(--accent-mid-green)] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[var(--text-secondary)] font-mono">
              <span>+5% (안정)</span>
              <span>+20% (성장)</span>
              <span>+40% (초고수익)</span>
            </div>
          </div>

          {/* Max Tolerable MDD Control */}
          <div className="space-y-2 bg-[var(--bg-main)]/60 p-3.5 rounded-xl border border-[var(--border-color)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--text-secondary)] flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                감내 가능한 최대 손실 (MDD)
              </span>
              <span className="text-sm font-extrabold text-rose-500 font-mono">
                -{maxTolerableMDD}%
              </span>
            </div>
            <input
              type="range"
              min={5}
              max={60}
              step={1}
              value={maxTolerableMDD}
              onChange={(e) => setMaxTolerableMDD(Number(e.target.value))}
              className="w-full accent-rose-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[var(--text-secondary)] font-mono">
              <span>-5% (보수적)</span>
              <span>-25% (적정)</span>
              <span>-60% (공격적)</span>
            </div>
          </div>
        </div>
      </div>


      {/* ---------------------------------------------------- */}
      {/* GLOBAL SIMULATION SETTINGS (초기자본 & 적립액 & 주기)    */}
      {/* ---------------------------------------------------- */}
      <div className="glass-card p-5 rounded-2xl sm:rounded-3xl space-y-4 border border-[var(--border-color)]">
        <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[var(--accent-orange)]" />
            <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
              투자 조건 설정
            </h2>
          </div>
          <span className="text-xs text-[var(--text-secondary)] font-medium hidden sm:inline">
            💡 차트를 직접 드래그하여 원하는 구간을 자유롭게 확대할 수 있습니다
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Deposit Frequency */}
          <div className="space-y-1 bg-[var(--bg-main)]/60 p-3 rounded-xl border border-[var(--border-color)]">
            <label className="text-[11px] font-bold text-[var(--text-secondary)] block">저금 주기</label>
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
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* REAL DATA INTERACTIVE MAIN CHART (수익률 차트)        */}
      {/* ---------------------------------------------------- */}
      <div className="glass-card p-5 sm:p-7 rounded-2xl sm:rounded-3xl space-y-4 border border-[var(--border-color)]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center flex-wrap gap-2">
            <h2 className="text-lg sm:text-xl font-black text-[var(--text-primary)] tracking-tight flex items-center gap-2">
              <BarChart3 className="w-5.5 h-5.5 text-[var(--accent-orange)]" />
              수익률 차트
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[var(--card-surface)] border border-[var(--border-color)] text-[var(--text-secondary)] font-mono shadow-2xs">
              배당 재투자
            </span>
          </div>

          {/* Right Header: Always Visible Timeline / Zoom Status with Pro Option */}
          {customStartDate || customEndDate ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[var(--accent-orange)] bg-[var(--accent-orange)]/10 px-2.5 py-1 rounded-xl border border-[var(--accent-orange)]/30 font-mono">
                {simulation.points[0]?.date} ~ {simulation.points[simulation.points.length - 1]?.date}
              </span>
              <button
                type="button"
                onClick={() => {
                  setCustomStartDate(null);
                  setCustomEndDate(null);
                }}
                className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-3 py-1 rounded-xl bg-[var(--card-surface)] border border-[var(--border-color)] hover:border-[var(--accent-orange)]/50 transition-all active:scale-95 shadow-2xs cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[var(--accent-orange)]" />
                <span>전체 기간 복귀</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 relative">
              <div className="flex items-center p-0.5 sm:p-1 rounded-xl bg-[var(--card-surface)] border border-[var(--border-color)] shadow-2xs text-xs font-bold font-mono">
                <span className="px-2 sm:px-2.5 py-1 rounded-lg bg-[var(--accent-orange)]/10 text-[var(--accent-orange)] font-extrabold border border-[var(--accent-orange)]/30 text-[11px] sm:text-xs">
                  {isPro ? '30년 (1996~현재)' : '15년 (2011~현재)'}
                </span>

                {!isPro && (
                  <button
                    type="button"
                    onClick={() => setProPopoverOpen(!proPopoverOpen)}
                    className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg text-[var(--text-secondary)] hover:text-[var(--accent-orange)] hover:bg-[var(--card-hover)] transition-all cursor-pointer font-sans text-[11px] font-extrabold"
                  >
                    <Lock className="w-3 h-3 text-[var(--accent-orange)]" />
                    <span>30년 PRO</span>
                  </button>
                )}
              </div>

              {/* Floating Pro Popover anchored to Top Right Button */}
              {proPopoverOpen && !isPro && (
                <div className="absolute top-full right-0 mt-2 z-50 w-72 sm:w-80 p-4 rounded-2xl bg-white/80 dark:bg-[#18181b]/80 backdrop-blur-xl border border-[var(--border-color)] shadow-2xl space-y-3 animate-popover-expand text-left">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[var(--accent-orange)] font-extrabold text-xs">
                      <Crown className="w-4 h-4" />
                      <span>PRO 전용 (과거 30년 전체 데이터)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setProPopoverOpen(false)}
                      className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1 rounded-full hover:bg-[var(--card-hover)] transition-all cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-medium">
                    2000년 닷컴 버블(-80%), 2008년 리먼 사태(-55%) 등 <strong>과거 30년 역사적 위기 구간</strong>을 통과 검증하는 프리미엄 기능입니다.
                  </p>
                  {!user ? (
                    <button
                      type="button"
                      onClick={() => {
                        setProPopoverOpen(false);
                        openAuthPopover();
                      }}
                      className="w-full py-2.5 rounded-xl bg-[var(--accent-orange)] hover:bg-[var(--accent-orange)]/90 text-white font-bold text-xs transition-all shadow-md active:scale-98 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Crown className="w-3.5 h-3.5" />
                      로그인 / 가입하고 둘러보기
                    </button>
                  ) : (
                    <div className="text-center py-2 px-3 rounded-xl bg-[var(--accent-orange)]/10 border border-[var(--accent-orange)]/30 text-[11px] font-bold text-[var(--accent-orange)]">
                      멤버십 및 프로모션 코드 연동 준비 중입니다
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* SYNTHETIC ASSET INFERENCE NOTICE (Wrapped in permanent SmoothHeight for zero-jump animated expansion) */}
        <SmoothHeight duration={350}>
          {useMemo(() => {
            const simStartDate = simulation.points[0]?.date || '2006-01-01';

            const synthAssetMeta: Record<string, { label: string; dateStr: string; cutoffDate: string; isCrypto?: boolean }> = {
              TQQQ: { label: '나스닥 100 3배 레버리지', dateStr: '2010년 2월 이전', cutoffDate: '2010-02-01' },
              QLD: { label: '나스닥 100 2배 레버리지', dateStr: '2006년 6월 이전', cutoffDate: '2006-06-01' },
              SOXL: { label: '필라델피아 반도체 3배 레버리지', dateStr: '2010년 3월 이전', cutoffDate: '2010-03-01' },
              USD: { label: '필라델피아 반도체 2배 레버리지', dateStr: '2007년 1월 이전', cutoffDate: '2007-01-01' },
              UPRO: { label: 'S&P 500 3배 레버리지', dateStr: '2009년 6월 이전', cutoffDate: '2009-06-01' },
              SSO: { label: 'S&P 500 2배 레버리지', dateStr: '2006년 6월 이전', cutoffDate: '2006-06-01' },
              SCHD: { label: '미국 배당 다우존스', dateStr: '2011년 10월 이전', cutoffDate: '2011-10-01' },
              KS200: { label: '코스피 200', dateStr: '2002년 10월 이전', cutoffDate: '2002-10-01' },
              KQ150: { label: '코스닥 150', dateStr: '2015년 10월 이전', cutoffDate: '2015-10-01' },
              SLV: { label: '은', dateStr: '2006년 4월 이전', cutoffDate: '2006-04-01' },
              GOOGL: { label: '알파벳/구글', dateStr: '2004년 8월 이전', cutoffDate: '2004-08-01' },
              META: { label: '메타', dateStr: '2012년 5월 이전', cutoffDate: '2012-05-01' },
              TSLA: { label: '테슬라', dateStr: '2010년 6월 이전', cutoffDate: '2010-06-01' },
              BTC: { label: '비트코인', dateStr: '2014년 9월 이전', cutoffDate: '2014-09-01', isCrypto: true },
              ETH: { label: '이더리움', dateStr: '2017년 11월 이전', cutoffDate: '2017-11-01', isCrypto: true },
            };

            const selectedIds = Array.from(new Set([
              ...portfolioA.map(p => p.assetId),
              ...portfolioB.map(p => p.assetId)
            ])).filter(id => synthAssetMeta[id] && simStartDate < synthAssetMeta[id].cutoffDate);

            if (selectedIds.length === 0) return null;

            const etfItems = selectedIds.filter(id => !synthAssetMeta[id].isCrypto).map(id => `${synthAssetMeta[id].label} ${synthAssetMeta[id].dateStr}`);
            const cryptoItems = selectedIds.filter(id => synthAssetMeta[id].isCrypto).map(id => `${synthAssetMeta[id].label} ${synthAssetMeta[id].dateStr}`);

            return (
              <div className="space-y-2 pb-2">
                {etfItems.length > 0 && (
                  <div
                    style={{ borderColor: 'rgba(241, 143, 1, 0.35)' }}
                    className="p-3 rounded-xl bg-[var(--accent-orange)]/10 border text-[11px] text-[var(--text-primary)] font-medium leading-relaxed flex items-start gap-2 shadow-2xs"
                  >
                    <AlertCircle className="w-4 h-4 text-[var(--accent-orange)] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[var(--accent-orange)]">{etfItems.join(', ')}</strong>의 과거 구간은 기초지수 성과를 바탕으로 추론된 데이터입니다.
                    </div>
                  </div>
                )}

                {cryptoItems.length > 0 && (
                  <div
                    style={{ borderColor: 'rgba(244, 63, 94, 0.35)' }}
                    className="p-3 rounded-xl bg-rose-500/10 border text-[11px] text-[var(--text-primary)] font-medium leading-relaxed flex items-start gap-2 shadow-2xs"
                  >
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-rose-500 font-extrabold">{cryptoItems.join(', ')}</strong>의 과거 데이터는 추론 특성상 다른 자산보다 결과가 다소 부정확할 수 있습니다.
                    </div>
                  </div>
                )}
              </div>
            );
          }, [portfolioA, portfolioB, simulation.points])}
        </SmoothHeight>

        {/* SVG Canvas Container */}
        <div className="bg-[var(--card-surface)] p-4 sm:p-5 rounded-2xl border border-[var(--border-color)] space-y-3 relative overflow-hidden transition-all duration-300">
          {/* CONSOLIDATED INTERACTIVE DATA INFO HEADER */}
          <div className="min-h-[42px] flex items-center px-3 py-2 bg-[var(--bg-main)]/80 rounded-xl border border-[var(--border-color)] text-xs font-bold font-mono">
            {dragRangeInfo ? (
              <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 text-[11px]">
                <div className="flex items-center gap-1.5 text-[var(--accent-orange)] font-extrabold">
                  <span>선택 구간:</span>
                  <span>{dragRangeInfo.startDate} ~ {dragRangeInfo.endDate} (놓으면 확대)</span>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-3 text-[11px]">
                  <span>추천: <strong className={Number(dragRangeInfo.diffA) >= 0 ? 'text-[var(--accent-mid-green)] font-extrabold' : 'text-red-500 font-extrabold'}>{Number(dragRangeInfo.diffA) > 0 ? '+' : ''}{dragRangeInfo.diffA}%</strong></span>
                  <span>커스텀: <strong className={Number(dragRangeInfo.diffB) >= 0 ? 'text-[var(--accent-orange)] font-extrabold' : 'text-red-500 font-extrabold'}>{Number(dragRangeInfo.diffB) > 0 ? '+' : ''}{dragRangeInfo.diffB}%</strong></span>
                </div>
              </div>
            ) : activeHoverPoint ? (
              <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 text-[11px]">
                <div className="flex items-center justify-between sm:justify-start gap-2 text-[var(--text-secondary)]">
                  <span>{activeHoverPoint.date}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--card-surface)] border border-[var(--border-color)]">원금 {activeHoverPoint.invested.toLocaleString()}만</span>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-3 text-[11px]">
                  <span>추천: <strong className="text-[var(--accent-mid-green)]">{activeHoverPoint.valA.toLocaleString()}만 ({activeHoverPoint.retA > 0 ? '+' : ''}{activeHoverPoint.retA}%)</strong></span>
                  <span>커스텀: <strong className="text-[var(--accent-orange)]">{activeHoverPoint.valB.toLocaleString()}만 ({activeHoverPoint.retB > 0 ? '+' : ''}{activeHoverPoint.retB}%)</strong></span>
                </div>
              </div>
            ) : (
              <div className="w-full flex items-center justify-between text-[11px] font-medium text-[var(--text-secondary)] py-0.5">
                <span>차트를 드래그하여 원하는 구간을 자유롭게 확대할 수 있습니다</span>
              </div>
            )}
          </div>

          <svg
            ref={svgRef}
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-auto overflow-visible cursor-crosshair touch-none"
            onMouseMove={(e) => handlePointerMove(e.clientX)}
            onMouseDown={handleMouseDown}
            onMouseUp={handleDragEndAction}
            onMouseLeave={() => {
              setHoverIndex(null);
              if (isDragging) handleDragEndAction();
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={(e) => handleTouchMove(e)}
            onTouchEnd={handleTouchEnd}
          >
            <defs>
              <linearGradient id="proLeftShadeGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="var(--border-color)" stopOpacity="0.40" />
                <stop offset="70%" stopColor="var(--border-color)" stopOpacity="0.15" />
                <stop offset="100%" stopColor="var(--border-color)" stopOpacity="0.01" />
              </linearGradient>
              <linearGradient id="proLeftOrangeShadeGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="var(--accent-orange)" stopOpacity="0.25" />
                <stop offset="70%" stopColor="var(--accent-orange)" stopOpacity="0.10" />
                <stop offset="100%" stopColor="var(--accent-orange)" stopOpacity="0.01" />
              </linearGradient>
            </defs>

            <line x1="0" y1={chartHeight - 20} x2={chartWidth} y2={chartHeight - 20} stroke="var(--border-color)" strokeDasharray="4 4" />
            <line x1="0" y1={chartHeight * 0.66} x2={chartWidth} y2={chartHeight * 0.66} stroke="var(--border-color)" strokeDasharray="4 4" />
            <line x1="0" y1={chartHeight * 0.33} x2={chartWidth} y2={chartHeight * 0.33} stroke="var(--border-color)" strokeDasharray="4 4" />

            {/* Subtle Minimalist Frosted Slit with Hover Ambient Orange Glow */}
            {!isPro && !customStartDate && (
              <g
                className="cursor-pointer group"
                onClick={() => setProPopoverOpen(!proPopoverOpen)}
              >
                {/* Default neutral slit */}
                <rect
                  x="0"
                  y="0"
                  width={proLeftOffset}
                  height={chartHeight}
                  fill="url(#proLeftShadeGrad)"
                  className="transition-opacity duration-300 group-hover:opacity-0"
                />
                {/* Hover orange glow slit */}
                <rect
                  x="0"
                  y="0"
                  width={proLeftOffset}
                  height={chartHeight}
                  fill="url(#proLeftOrangeShadeGrad)"
                  className="opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                />
                <line
                  x1={proLeftOffset}
                  y1={0}
                  x2={proLeftOffset}
                  y2={chartHeight}
                  stroke="var(--border-color)"
                  strokeDasharray="3 3"
                  strokeWidth="1.2"
                  className="transition-colors duration-300 group-hover:stroke-[var(--accent-orange)]/60"
                  opacity="0.8"
                />
                {/* Vertical Minimalist Lock Pill */}
                <g transform={`translate(${proLeftOffset / 2 - 10}, ${chartHeight / 2 - 12})`}>
                  <rect
                    x="0"
                    y="0"
                    width="20"
                    height="24"
                    rx="10"
                    fill="var(--card-surface)"
                    stroke="var(--border-color)"
                    strokeWidth="1.2"
                    className="transition-all duration-300 group-hover:border-[var(--accent-orange)] group-hover:shadow-[0_0_12px_rgba(241,143,1,0.35)] shadow-2xs"
                  />
                  <g transform="translate(4.5, 5)">
                    <rect x="0.5" y="4" width="10" height="8" rx="1.5" fill="none" stroke="var(--accent-orange)" strokeWidth="1.4" />
                    <path d="M3 4V2.5a2 2 0 0 1 4 0V4" fill="none" stroke="var(--accent-orange)" strokeWidth="1.4" />
                  </g>
                </g>
              </g>
            )}

            <path
              d={getSvgPath(investedVals)}
              fill="none"
              stroke="#888888"
              strokeWidth="1.5"
              strokeDasharray="3 3"
              className="transition-all duration-500 ease-out"
              style={{ transition: 'd 0.45s cubic-bezier(0.16, 1, 0.3, 1)' }}
            />
            <path
              d={getSvgPath(valsA)}
              fill="none"
              stroke="#68A67D"
              strokeWidth="3"
              className="transition-all duration-500 ease-out"
              style={{ transition: 'd 0.45s cubic-bezier(0.16, 1, 0.3, 1)' }}
            />
            <path
              d={getSvgPath(valsB)}
              fill="none"
              stroke="#F18F01"
              strokeWidth="3.5"
              className="transition-all duration-500 ease-out"
              style={{ transition: 'd 0.45s cubic-bezier(0.16, 1, 0.3, 1)' }}
            />

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

            {hoverIndex !== null && (
              <line x1={getX(hoverIndex)} y1="0" x2={getX(hoverIndex)} y2={chartHeight} stroke="var(--accent-orange)" strokeWidth="1.5" strokeDasharray="2 2" />
            )}
          </svg>

          <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-bold pt-2 border-t border-[var(--border-color)]">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-1.5 bg-[var(--accent-mid-green)] rounded-full" />
                <span className="text-[var(--accent-mid-green)] font-extrabold">
                  {userProfileCode ? `${userProfileCode} 추천 전략` : '추천 전략'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-1.5 bg-[var(--accent-orange)] rounded-full" />
                <span className="text-[var(--accent-orange)] font-extrabold">커스텀 전략</span>
              </div>
            </div>
            <div className="text-[11px] text-[var(--text-secondary)] font-mono">
              총 투입 원금: {simulation.finalInvested.toLocaleString()}만원
            </div>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* SIDE-BY-SIDE STRATEGY & PERFORMANCE PAIR CONTAINERS  */}
      {/* Desktop (md): Side-by-side 2 Columns                  */}
      {/* Mobile (sm): Strategy A + Result A -> Strategy B + Result B */}
      {/* ---------------------------------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* ==================================================== */}
        {/* STRATEGY A (RECOMMENDED STRATEGY + PERFORMANCE PAIR) */}
        {/* ==================================================== */}
        <div className="space-y-4 flex flex-col justify-between">
          {/* RECOMMENDED PORTFOLIO BUILDER */}
          <div className="glass-card p-5 rounded-2xl sm:rounded-3xl space-y-4 border border-[var(--border-color)] flex-1">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-[var(--accent-mid-green)] flex items-center gap-2">
                <Layers className="w-4 h-4" />
                {userProfileCode ? `${userProfileCode} 추천 전략` : '추천 전략'}
              </h2>
              {availableForA.length > 0 && (
                <button type="button" onClick={handleAddSlotA} className="text-xs font-bold px-2.5 py-1 rounded-lg bg-[var(--accent-mid-green)] text-white hover:opacity-90 transition-all">
                  + 종목 추가
                </button>
              )}
            </div>

            {/* Recommended Strategy Disclaimer Notice & Preset Quick Picker */}
            <div className="p-3 rounded-xl bg-[var(--bg-main)]/60 border border-[var(--border-color)] text-[11px] text-[var(--text-secondary)] leading-relaxed font-medium space-y-2">
              <div>
                💡 <strong>추천 안내:</strong> {userProfileCode ? (
                  <span>성향 진단(<strong className="text-[var(--accent-orange)] font-mono">{userProfileCode}</strong>) 결과를 바탕으로 구성된 제안 조합입니다. 단순 참고용으로 활용해 보세요.</span>
                ) : (
                  <span>대표 자산 배분 템플릿 기반의 제안 조합입니다. 투자 성향 진단을 받으시면 나만의 맞춤 전략이 자동 세팅됩니다.</span>
                )}
              </div>
              
              {/* Quick Preset Selector Buttons */}
              <div style={{ borderTop: '1px solid var(--border-color)' }} className="pt-2 flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-bold text-[var(--text-secondary)] shrink-0">추천 템플릿:</span>
                <button
                  type="button"
                  onClick={() => {
                    const info = getUserPersonalityInfo({ user, searchParams });
                    const config = calculatePersonalitySimulatorConfig(info.typeCode, info.scores);
                    setPortfolioA(config.portfolioA);
                    setStrategyPeriodA(config.strategyPeriodA);
                  }}
                  className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-[var(--card-surface)] border border-[var(--border-color)] hover:border-[var(--accent-orange)]/40 hover:text-[var(--accent-orange)] hover:shadow-[0_0_12px_rgba(241,143,1,0.15)] active:scale-95 transition-all font-mono shadow-2xs"
                >
                  {userProfileCode ? `${userProfileCode} 맞춤` : '기본 맞춤'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPortfolioA([
                      { assetId: 'SPY', weight: 50, enableDefense: false },
                      { assetId: 'QQQ', weight: 30, enableDefense: false },
                      { assetId: 'SCHD', weight: 20, enableDefense: false },
                    ]);
                    setStrategyPeriodA(0);
                  }}
                  className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-[var(--card-surface)] border border-[var(--border-color)] hover:border-[var(--accent-orange)]/40 hover:text-[var(--accent-orange)] hover:shadow-[0_0_12px_rgba(241,143,1,0.15)] active:scale-95 transition-all shadow-2xs"
                >
                  균형 자산
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPortfolioA([
                      { assetId: 'TQQQ', weight: 45, enableDefense: true },
                      { assetId: 'SOXX', weight: 35, enableDefense: true },
                      { assetId: 'SPY', weight: 20, enableDefense: true },
                    ]);
                    setStrategyPeriodA(200);
                  }}
                  className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-[var(--card-surface)] border border-[var(--border-color)] hover:border-[var(--accent-orange)]/40 hover:text-[var(--accent-orange)] hover:shadow-[0_0_12px_rgba(241,143,1,0.15)] active:scale-95 transition-all shadow-2xs"
                >
                  공격형
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPortfolioA([
                      { assetId: 'SCHD', weight: 45, enableDefense: false },
                      { assetId: 'SPY', weight: 30, enableDefense: false },
                      { assetId: 'GLD', weight: 15, enableDefense: false },
                      { assetId: 'SHY', weight: 10, enableDefense: false },
                    ]);
                    setStrategyPeriodA(0);
                  }}
                  className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-[var(--card-surface)] border border-[var(--border-color)] hover:border-[var(--accent-orange)]/40 hover:text-[var(--accent-orange)] hover:shadow-[0_0_12px_rgba(241,143,1,0.15)] active:scale-95 transition-all shadow-2xs"
                >
                  방어형
                </button>
              </div>
            </div>

            <SmoothHeight>
              <div className="space-y-2.5">
                {portfolioA.map((item, index) => {
                  const otherSumA = portfolioA.reduce((sum, itm, idx) => (idx === index ? sum : sum + itm.weight), 0);
                  const maxAllowedA = Math.max(0, 100 - otherSumA);

                  return (
                    <div key={index} className="p-3 rounded-xl bg-[var(--bg-main)]/60 border border-[var(--border-color)] space-y-2 hover:border-[var(--accent-mid-green)]/40 transition-all shadow-2xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-mono font-bold whitespace-nowrap shrink-0 text-[var(--accent-mid-green)]">
                          종목 {index + 1}:
                        </span>

                        {/* 계층형 인덴트 종목 셀렉터 */}
                        <select
                          value={item.assetId}
                          onChange={(e) => setPortfolioA(portfolioA.map((sa, idx) => (idx === index ? { ...sa, assetId: e.target.value } : sa)))}
                          className="flex-1 appearance-none bg-[var(--card-surface)] text-xs font-bold text-[var(--text-primary)] py-1.5 px-2.5 rounded-lg border border-[var(--border-color)] focus:outline-none cursor-pointer hover:border-[var(--accent-mid-green)]/50 transition-all min-w-0"
                        >
                          {SELECT_ASSET_GROUPS.map((grp) => (
                            <optgroup key={grp.groupLabel} label={grp.groupLabel} className="bg-[var(--card-surface)] text-[var(--text-primary)] font-bold">
                              {grp.options.map((opt) => (
                                <option key={opt.id} value={opt.id} disabled={portfolioA.some((sa, idx) => idx !== index && sa.assetId === opt.id)}>
                                  {opt.label}
                                </option>
                              ))}
                            </optgroup>
                          ))}
                        </select>

                        {/* 비중 입력 및 삭제 버튼 */}
                        <div className="flex items-center gap-1 shrink-0">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            step={5}
                            value={item.weight}
                            onChange={(e) => handleUpdateWeightA(index, Math.round(Math.max(0, Math.min(100, Number(e.target.value))) / 5) * 5)}
                            className="w-12 bg-[var(--card-surface)] text-xs font-extrabold text-center text-[var(--accent-mid-green)] py-0.5 rounded-lg border border-[var(--border-color)] focus:outline-none focus:border-[var(--accent-mid-green)] font-mono"
                          />
                          <span className="text-xs font-bold text-[var(--text-secondary)] font-mono">%</span>
                          {portfolioA.length > 1 && (
                            <button type="button" onClick={() => setPortfolioA(portfolioA.filter((_, idx) => idx !== index))} className="text-[var(--text-secondary)] hover:text-red-500 p-0.5 ml-1 transition-all">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
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
                  );
                })}

                <div className="p-3 rounded-xl bg-[var(--bg-main)]/80 border border-[var(--border-color)] flex items-center justify-between text-xs font-bold">
                  <span className="text-[var(--text-primary)]">현금</span>
                  <span className="font-mono font-extrabold text-[var(--accent-mid-green)]">{autoCashA}%</span>
                </div>
              </div>
            </SmoothHeight>

            <div className="pt-2 space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-[var(--text-secondary)] flex items-center gap-1">
                  <Lightbulb className="w-3.5 h-3.5 text-[var(--accent-mid-green)]" />
                  방어 옵션 (이동평균선)
                </label>
                <button type="button" onClick={() => setActiveTooltip(activeTooltip === 'defense_a' ? null : 'defense_a')} className="text-[var(--text-secondary)] hover:text-[var(--accent-orange)] transition-all">
                  <HelpCircle className="w-3.5 h-3.5" />
                </button>
              </div>
              <SmoothHeight>
                {activeTooltip === 'defense_a' && (
                  <div className="p-2.5 rounded-xl bg-[var(--card-surface)] border border-[var(--border-color)] text-[11px] text-[var(--text-secondary)] leading-relaxed">
                    시장 변화에 맞춰 적극적으로 매매하는 투자자에게 어울리는 옵션입니다. 일정 기간의 평균 가격(이동평균선) 위로 올라왔을 때만 주식을 사고 보유하며, 평균 가격 밑으로 떨어지는 하락장에서는 현금으로 안전하게 지킵니다.
                  </div>
                )}
              </SmoothHeight>
              <select
                value={strategyPeriodA}
                onChange={(e) => setStrategyPeriodA(Number(e.target.value))}
                className="w-full bg-[var(--bg-main)] text-xs font-bold text-[var(--text-primary)] p-2.5 rounded-xl border border-[var(--border-color)] cursor-pointer hover:border-[var(--accent-orange)]/40 transition-all"
              >
                <option value={0}>기본 없음 (하락장 상관없이 주식 계속 보유)</option>
                <option value={50}>50일 평균 가격 기준 (단기 빠르게 피하기)</option>
                <option value={100}>100일 평균 가격 기준 (중기 균형 방어)</option>
                <option value={150}>150일 평균 가격 기준 (안정적 방어)</option>
                <option value={200}>200일 평균 가격 기준 (큰 폭락장 방어)</option>
              </select>
            </div>
          </div>

          {/* Portfolio A Results Card (Bound to Strategy A) */}
          <div className="p-4 rounded-2xl bg-[var(--bg-main)]/60 border border-[var(--border-color)] space-y-3">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-2">
              <span className="text-xs font-black text-[var(--accent-mid-green)] flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent-mid-green)]" />
                {userProfileCode ? `${userProfileCode} 추천 전략 성과` : '추천 전략 성과'}
              </span>
              <span className="text-lg font-black text-[var(--accent-mid-green)] font-mono">
                +{simulation.portA.totalRate}%
              </span>
            </div>

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

              <div className="pt-1.5 border-t border-[var(--border-color)]">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--text-secondary)] font-medium">연수익률 (CAGR)</span>
                  <span className="font-mono font-bold text-[var(--accent-mid-green)]">+{simulation.portA.cagr}% /년</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--text-secondary)] font-medium">최대 손실폭 (MDD)</span>
                  <span className="font-mono font-bold text-red-500">-{simulation.portA.mdd}%</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--text-secondary)] font-medium">위험 대비 수익성 (샤프지수)</span>
                  <span className="font-mono font-bold text-[var(--text-primary)]">{simulation.portA.sharpe}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ==================================================== */}
        {/* STRATEGY B (CUSTOM STRATEGY + PERFORMANCE PAIR)     */}
        {/* ==================================================== */}
        <div className="space-y-4 flex flex-col justify-between">
          {/* CUSTOM PORTFOLIO BUILDER */}
          <div className="glass-card p-5 rounded-2xl sm:rounded-3xl space-y-4 border border-[var(--border-color)] flex-1">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-[var(--accent-orange)] flex items-center gap-2">
                <Layers className="w-4 h-4" />
                커스텀 전략
              </h2>
              {availableForB.length > 0 && (
                <button
                  type="button"
                  onClick={handleAddSlotB}
                  className="text-xs font-bold px-3 py-1 rounded-full bg-[var(--accent-orange)] text-white hover:brightness-110 active:scale-95 shadow-2xs hover:shadow-[0_0_12px_rgba(241,143,1,0.25)] transition-all cursor-pointer"
                >
                  + 종목 추가
                </button>
              )}
            </div>

            {/* REAL-TIME DYNAMIC WARNING TOAST INSIDE CUSTOM STRATEGY CARD */}
            <div
              style={{
                borderColor:
                  evalFeedbackB.type === 'danger'
                    ? 'rgba(244, 63, 94, 0.3)'
                    : evalFeedbackB.type === 'warning'
                    ? 'rgba(241, 143, 1, 0.35)'
                    : evalFeedbackB.type === 'info'
                    ? 'rgba(14, 165, 233, 0.3)'
                    : 'rgba(104, 166, 125, 0.35)',
              }}
              className={`p-3.5 rounded-xl border transition-all duration-300 shadow-2xs space-y-1 ${
                evalFeedbackB.type === 'danger'
                  ? 'bg-rose-500/10 text-rose-500'
                  : evalFeedbackB.type === 'warning'
                  ? 'bg-[var(--accent-orange)]/10 text-[var(--accent-orange)]'
                  : evalFeedbackB.type === 'info'
                  ? 'bg-sky-500/10 text-sky-500'
                  : 'bg-[var(--accent-green)]/10 text-[var(--accent-green)]'
              }`}
            >
              <div className="flex items-center gap-1.5 font-extrabold text-xs">
                {evalFeedbackB.type === 'danger' && <ShieldAlert className="w-4 h-4 shrink-0 text-rose-500" />}
                {evalFeedbackB.type === 'warning' && <AlertTriangle className="w-4 h-4 shrink-0 text-[var(--accent-orange)]" />}
                {evalFeedbackB.type === 'info' && <Info className="w-4 h-4 shrink-0 text-sky-500" />}
                {evalFeedbackB.type === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0 text-[var(--accent-green)]" />}
                <span>{evalFeedbackB.title}</span>
              </div>
              <p className="text-[11px] text-[var(--text-primary)] font-medium leading-relaxed">
                {evalFeedbackB.desc}
              </p>
            </div>

            <SmoothHeight>
              <div className="space-y-2.5">
                {portfolioB.map((item, index) => {
                  const otherSumB = portfolioB.reduce((sum, itm, idx) => (idx === index ? sum : sum + itm.weight), 0);
                  const maxAllowedB = Math.max(0, 100 - otherSumB);

                  return (
                    <div key={index} className="p-3 rounded-xl bg-[var(--bg-main)]/60 border border-[var(--border-color)] space-y-2 hover:border-[var(--accent-orange)]/40 transition-all shadow-2xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-mono font-bold whitespace-nowrap shrink-0 text-[var(--accent-orange)]">
                          종목 {index + 1}:
                        </span>

                        {/* 계층형 인덴트 종목 셀렉터 */}
                        <select
                          value={item.assetId}
                          onChange={(e) => setPortfolioB(portfolioB.map((sa, idx) => (idx === index ? { ...sa, assetId: e.target.value } : sa)))}
                          className="flex-1 appearance-none bg-[var(--card-surface)] text-xs font-bold text-[var(--text-primary)] py-1.5 px-2.5 rounded-lg border border-[var(--border-color)] focus:outline-none cursor-pointer hover:border-[var(--accent-orange)]/50 transition-all min-w-0"
                        >
                          {SELECT_ASSET_GROUPS.map((grp) => (
                            <optgroup key={grp.groupLabel} label={grp.groupLabel} className="bg-[var(--card-surface)] text-[var(--text-primary)] font-bold">
                              {grp.options.map((opt) => (
                                <option key={opt.id} value={opt.id} disabled={portfolioB.some((sa, idx) => idx !== index && sa.assetId === opt.id)}>
                                  {opt.label}
                                </option>
                              ))}
                            </optgroup>
                          ))}
                        </select>

                        {/* 비중 입력 및 삭제 버튼 */}
                        <div className="flex items-center gap-1 shrink-0">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            step={5}
                            value={item.weight}
                            onChange={(e) => handleUpdateWeightB(index, Math.round(Math.max(0, Math.min(100, Number(e.target.value))) / 5) * 5)}
                            className="w-12 bg-[var(--card-surface)] text-xs font-extrabold text-center text-[var(--accent-orange)] py-0.5 rounded-lg border border-[var(--border-color)] focus:outline-none focus:border-[var(--accent-orange)] font-mono"
                          />
                          <span className="text-xs font-bold text-[var(--text-secondary)] font-mono">%</span>
                          {portfolioB.length > 1 && (
                            <button type="button" onClick={() => setPortfolioB(portfolioB.filter((_, idx) => idx !== index))} className="text-[var(--text-secondary)] hover:text-red-500 p-0.5 ml-1 transition-all">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
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
                  );
                })}

                <div className="p-3 rounded-xl bg-[var(--bg-main)]/80 border border-[var(--border-color)] flex items-center justify-between text-xs font-bold">
                  <span className="text-[var(--text-primary)]">현금</span>
                  <span className="font-mono font-extrabold text-[var(--accent-orange)]">{autoCashB}%</span>
                </div>
              </div>
            </SmoothHeight>

            <div className="pt-2 space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-[var(--text-secondary)] flex items-center gap-1">
                  <Lightbulb className="w-3.5 h-3.5 text-[var(--accent-orange)]" />
                  방어 옵션 (이동평균선)
                </label>
                <button type="button" onClick={() => setActiveTooltip(activeTooltip === 'defense_b' ? null : 'defense_b')} className="text-[var(--text-secondary)] hover:text-[var(--accent-orange)] transition-all">
                  <HelpCircle className="w-3.5 h-3.5" />
                </button>
              </div>
              <SmoothHeight>
                {activeTooltip === 'defense_b' && (
                  <div className="p-2.5 rounded-xl bg-[var(--card-surface)] border border-[var(--border-color)] text-[11px] text-[var(--text-secondary)] leading-relaxed">
                    시장 변화에 맞춰 적극적으로 매매하는 투자자에게 어울리는 옵션입니다. 일정 기간의 평균 가격(이동평균선) 위로 올라왔을 때만 주식을 사고 보유하며, 평균 가격 밑으로 떨어지는 하락장에서는 현금으로 안전하게 지킵니다.
                  </div>
                )}
              </SmoothHeight>
              <select
                value={strategyPeriodB}
                onChange={(e) => setStrategyPeriodB(Number(e.target.value))}
                className="w-full bg-[var(--bg-main)] text-xs font-bold text-[var(--text-primary)] p-2.5 rounded-xl border border-[var(--border-color)] cursor-pointer hover:border-[var(--accent-orange)]/40 transition-all"
              >
                <option value={0}>기본 없음 (하락장 상관없이 주식 계속 보유)</option>
                <option value={50}>50일 평균 가격 기준 (단기 빠르게 피하기)</option>
                <option value={100}>100일 평균 가격 기준 (중기 균형 방어)</option>
                <option value={150}>150일 평균 가격 기준 (안정적 방어)</option>
                <option value={200}>200일 평균 가격 기준 (큰 폭락장 방어)</option>
              </select>
            </div>
          </div>

          {/* Portfolio B Results Card (Bound to Strategy B) */}
          <div className="p-4 rounded-2xl bg-[var(--bg-main)]/60 border border-[var(--border-color)] space-y-3">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-2">
              <span className="text-xs font-black text-[var(--accent-orange)] flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent-orange)]" />
                커스텀 전략 성과
              </span>
              <span className="text-lg font-black text-[var(--accent-orange)] font-mono">
                +{simulation.portB.totalRate}%
              </span>
            </div>

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

              <div className="pt-1.5 border-t border-[var(--border-color)]">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--text-secondary)] font-medium">연수익률 (CAGR)</span>
                  <span className="font-mono font-bold text-[var(--accent-orange)]">+{simulation.portB.cagr}% /년</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--text-secondary)] font-medium">최대 손실폭 (MDD)</span>
                  <span className="font-mono font-bold text-red-500">-{simulation.portB.mdd}%</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--text-secondary)] font-medium">위험 대비 수익성 (샤프지수)</span>
                  <span className="font-mono font-bold text-[var(--text-primary)]">{simulation.portB.sharpe}</span>
                </div>
              </div>
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
          본 도구는 Yahoo Finance의 30년 실제 데이터를 기반으로 작동됩니다. 선택하신 투자 주기(매달/매주)마다 설정하신 금액을 적립하고 선택한 방어 옵션에 맞춰 자동 리밸런싱됩니다. 단, 일부 종목의 과거 데이터는 기초 지수 움직임을 기반으로 추론 계산하였으며, 과거 데이터 결과가 미래의 수익을 보장하지 않습니다.
        </p>
      </div>
      </div>
    </RevealOnScroll>
  );
}

export default function SimulatorPage() {
  return (
    <Suspense fallback={<div className="max-w-4xl mx-auto p-8 text-center text-sm font-bold">로딩 중...</div>}>
      <SimulatorContent />
    </Suspense>
  );
}
