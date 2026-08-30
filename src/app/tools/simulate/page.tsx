'use client';

import { useState, useMemo, useRef, MouseEvent, TouchEvent, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import backtestJson from '@/data/backtestData.json';
import historicalPrices from '@/data/historicalPrices.json';
import { 
  calculatePersonalitySimulatorConfig, 
  getUserPersonalityInfo, 
  getPersonality3Presets,
  calculateBenchmarkPortfolioScore,
  ScoreBreakdown 
} from '@/utils/personalitySimulatorMapping';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import CommentSection from '@/components/CommentSection';
import RevealOnScroll from '@/components/common/RevealOnScroll';
import SmoothHeight from '@/components/SmoothHeight';
import AnimatedNumber from '@/components/AnimatedNumber';
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
  Plus,
  Minus,
  X,
  ChevronDown
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
  valB?: number;
  valC?: number;
  invested: number;
  retA: number;
  retB?: number;
  retC?: number;
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
      { id: 'NVDA', label: '엔비디아 (NVDA)' },
      { id: 'AAPL', label: '애플 (AAPL)' },
      { id: 'GOOGL', label: '알파벳/구글 (GOOGL)' },
      { id: 'MSFT', label: '마이크로소프트 (MSFT)' },
      { id: 'AMZN', label: '아마존 (AMZN)' },
      { id: 'TSM', label: 'TSMC (TSM)' },
      { id: 'SPCX', label: '스페이스X (SPCX)' },
      { id: 'AVGO', label: '브로드컴 (AVGO)' },
      { id: 'TSLA', label: '테슬라 (TSLA)' },
      { id: 'META', label: '메타 (META)' },
      { id: 'LLY', label: '일라이 릴리 (LLY)' },
      { id: 'MU', label: '마이크론 테크놀로지 (MU)' },
      { id: 'BRK_B', label: '버크셔 해서웨이 (BRK.B)' },
      { id: 'JPM', label: 'JP모건 체이스 (JPM)' },
      { id: 'WMT', label: '월마트 (WMT)' },
      { id: 'AMD', label: 'AMD (AMD)' },
      { id: 'V', label: '비자 (V)' },
      { id: 'XOM', label: '엑슨모빌 (XOM)' },
      { id: 'ASML', label: 'ASML (ASML)' },
      { id: 'JNJ', label: '존슨앤존슨 (JNJ)' },
    ],
  },
  {
    groupLabel: '한국 대표 개별주',
    options: [
      { id: '005930', label: '삼성전자 (005930)' },
      { id: '000660', label: 'SK하이닉스 (000660)' },
      { id: '402340', label: 'SK스퀘어 (402340)' },
      { id: '009150', label: '삼성전기 (009150)' },
      { id: '373220', label: 'LG에너지솔루션 (373220)' },
      { id: '005380', label: '현대차 (005380)' },
      { id: '207940', label: '삼성바이오로직스 (207940)' },
      { id: '032830', label: '삼성생명 (032830)' },
      { id: '028260', label: '삼성물산 (028260)' },
      { id: '105560', label: 'KB금융 (105560)' },
    ],
  },
];

function SimulatorContent() {
  const searchParams = useSearchParams();
  const allAssets = backtestJson.assets;
  const { user, isPro, updateSimulatorSettings, openAuthPopover, redeemPromoCode } = useAuth();

  const [proPopoverOpen, setProPopoverOpen] = useState<boolean>(false);
  const [promoCodeInput, setPromoCodeInput] = useState<string>('');
  const [promoCodeLoading, setPromoCodeLoading] = useState<boolean>(false);
  const [promoCodeMessage, setPromoCodeMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Global Simulation Settings
  const [initialCapital, setInitialCapital] = useState<number>(100); // 100만 원
  const [depositAmount, setDepositAmount] = useState<number>(50); // 저금 금액 (50만 원)
  const [durationYears, setDurationYears] = useState<number>(30); // 기본 30년
  const [depositFrequency, setDepositFrequency] = useState<Frequency>('monthly');

  // Active Tooltip Info Modals State
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  // Personality Profile State
  const [userProfileCode, setUserProfileCode] = useState<string | null>(null);
  const [targetCAGR, setTargetCAGR] = useState<number>(10); // 사용자 희망/추천 목표 연수익률 (%)
  const [maxTolerableMDD, setMaxTolerableMDD] = useState<number>(30); // 사용자 희망/추천 감내 MDD (%)

  // Dynamic Strategy Count State (1 to 3 strategies, default 1: Tailored Recommendation only)
  const [strategyCount, setStrategyCount] = useState<1 | 2 | 3>(1);

  // Portfolio A Configuration (Strategy 1 - Default: Tailored Recommendation / Buong Orange)
  const [portfolioA, setPortfolioA] = useState<SelectedAsset[]>([
    { assetId: 'SPY', weight: 50, enableDefense: true },
    { assetId: 'QQQ', weight: 50, enableDefense: true },
  ]);
  const [strategyPeriodA, setStrategyPeriodA] = useState<number>(0);

  // Portfolio B Configuration (Strategy 2 - Custom Strategy 1 / Fintech Emerald)
  const [portfolioB, setPortfolioB] = useState<SelectedAsset[]>([
    { assetId: 'SPY', weight: 60, enableDefense: false },
    { assetId: 'TLT', weight: 40, enableDefense: false },
  ]);
  const [strategyPeriodB, setStrategyPeriodB] = useState<number>(0);

  // Portfolio C Configuration (Strategy 3 - Custom Strategy 2 / Royal Indigo)
  const [portfolioC, setPortfolioC] = useState<SelectedAsset[]>([
    { assetId: 'QQQ', weight: 60, enableDefense: false },
    { assetId: 'GLD', weight: 40, enableDefense: false },
  ]);
  const [strategyPeriodC, setStrategyPeriodC] = useState<number>(0);
  const [activePresetA, setActivePresetA] = useState<'balanced' | 'growth' | 'defensive' | null>('balanced');
  const [scoreModalOpen, setScoreModalOpen] = useState<boolean>(false);
  const [chartScale, setChartScale] = useState<'linear' | 'log'>('linear');
  const [isTargetCustomized, setIsTargetCustomized] = useState<boolean>(false);

  const settingsRestoredRef = useRef(false);

  // [본인 성향 & 4축 세부 점수 기반 맞춤 포트폴리오 적용 함수]
  const applyPersonalityStrategy = (code: string | null, scores?: any) => {
    setUserProfileCode(code);
    const config = calculatePersonalitySimulatorConfig(code, scores, durationYears);
    setPortfolioA(config.portfolioA);
    setStrategyPeriodA(config.strategyPeriodA);
    if (!isTargetCustomized) {
      setTargetCAGR(config.recommendedTargetCAGR);
      setMaxTolerableMDD(config.recommendedMaxMDD);
    }
    setActivePresetA('balanced');
  };

  const isAnimatingGoalRef = useRef<number | null>(null);

  // [목표치 부드러운 스르륵 애니메이션 전환 함수]
  const animateGoalTo = (targetC: number, targetM: number, durationMs = 400) => {
    if (isAnimatingGoalRef.current) {
      cancelAnimationFrame(isAnimatingGoalRef.current);
    }
    const startC = targetCAGR;
    const startM = maxTolerableMDD;
    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / durationMs);
      // Apple smooth easeOutCubic
      const ease = 1 - Math.pow(1 - progress, 3);

      const currentC = Math.round(startC + (targetC - startC) * ease);
      const currentM = Math.round(startM + (targetM - startM) * ease);

      setTargetCAGR(currentC);
      setMaxTolerableMDD(currentM);

      if (progress < 1) {
        isAnimatingGoalRef.current = requestAnimationFrame(step);
      } else {
        setTargetCAGR(targetC);
        setMaxTolerableMDD(targetM);
        isAnimatingGoalRef.current = null;
      }
    };
    isAnimatingGoalRef.current = requestAnimationFrame(step);
  };

  // [목표치 성향 맞춤 권장값으로 리셋]
  const resetGoalSettingsToRecommendation = (overrideYears?: number, animate = false) => {
    const years = overrideYears !== undefined ? overrideYears : durationYears;
    const info = getUserPersonalityInfo({ user, searchParams });
    const config = calculatePersonalitySimulatorConfig(info.typeCode, info.scores, years);
    if (animate) {
      animateGoalTo(config.recommendedTargetCAGR, config.recommendedMaxMDD);
    } else {
      setTargetCAGR(config.recommendedTargetCAGR);
      setMaxTolerableMDD(config.recommendedMaxMDD);
    }
    setIsTargetCustomized(false);
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

      let savedRaw = typeof window !== 'undefined' ? localStorage.getItem(SIMULATOR_SETTINGS_KEY) : null;
      let settingsSource = user?.simulatorSettings || (savedRaw ? JSON.parse(savedRaw) : null);
      const activeDuration = settingsSource?.durationYears !== undefined ? settingsSource.durationYears : durationYears;
      const config = calculatePersonalitySimulatorConfig(info.typeCode, info.scores, activeDuration);

      if (settingsSource) {
        if (settingsSource.strategyCount !== undefined) setStrategyCount(settingsSource.strategyCount);
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
        if (settingsSource.portfolioC && settingsSource.portfolioC.length > 0) setPortfolioC(settingsSource.portfolioC);
        if (settingsSource.strategyPeriodC !== undefined) setStrategyPeriodC(settingsSource.strategyPeriodC);
        if (settingsSource.initialCapital !== undefined) setInitialCapital(settingsSource.initialCapital);
        if (settingsSource.depositAmount !== undefined) setDepositAmount(settingsSource.depositAmount);
        if (settingsSource.depositFrequency) setDepositFrequency(settingsSource.depositFrequency);
        if (settingsSource.durationYears !== undefined) setDurationYears(settingsSource.durationYears);
        if (settingsSource.chartScale) setChartScale(settingsSource.chartScale);
        if (settingsSource.activePresetA !== undefined) {
          setActivePresetA(settingsSource.activePresetA);
        } else if (settingsSource.portfolioA) {
          setActivePresetA(null);
        }
        settingsRestoredRef.current = true;
      } else {
        setPortfolioA(config.portfolioA);
        setStrategyPeriodA(config.strategyPeriodA);
        setTargetCAGR(config.recommendedTargetCAGR);
        setMaxTolerableMDD(config.recommendedMaxMDD);
        setActivePresetA('balanced');
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
          strategyCount,
          targetCAGR,
          maxTolerableMDD,
          portfolioA,
          strategyPeriodA,
          portfolioB,
          strategyPeriodB,
          portfolioC,
          strategyPeriodC,
          initialCapital,
          depositAmount,
          durationYears,
          depositFrequency,
          chartScale,
          activePresetA
        };
        localStorage.setItem(SIMULATOR_SETTINGS_KEY, JSON.stringify(customData));
        updateSimulatorSettings(customData);
      } catch (e) {
        console.error(e);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [strategyCount, targetCAGR, maxTolerableMDD, portfolioA, strategyPeriodA, portfolioB, strategyPeriodB, portfolioC, strategyPeriodC, initialCapital, depositAmount, durationYears, depositFrequency, chartScale, activePresetA]);

  // Dynamic Strategy Add / Remove Handlers with Smooth Fade Transition
  const [closingStrategy, setClosingStrategy] = useState<'B' | 'C' | null>(null);

  const handleAddStrategy = () => {
    if (strategyCount === 1) {
      setChartBAnimKey((k) => k + 1);
      setPortfolioB([
        { assetId: 'SPY', weight: 60, enableDefense: false },
        { assetId: 'TLT', weight: 40, enableDefense: false },
      ]);
      setStrategyPeriodB(0);
      setStrategyCount(2);
    } else if (strategyCount === 2) {
      setChartCAnimKey((k) => k + 1);
      setPortfolioC([
        { assetId: 'QQQ', weight: 60, enableDefense: false },
        { assetId: 'GLD', weight: 40, enableDefense: false },
      ]);
      setStrategyPeriodC(0);
      setStrategyCount(3);
    }
  };

  const handleRemoveStrategy = (target: 'B' | 'C') => {
    if (closingStrategy) return;
    setClosingStrategy(target);
    setTimeout(() => {
      if (target === 'B') {
        if (strategyCount === 3) {
          // Shift C into B slot
          setPortfolioB(portfolioC);
          setStrategyPeriodB(strategyPeriodC);
        }
      }
      setStrategyCount((prev) => Math.max(1, prev - 1) as 1 | 2 | 3);
      setClosingStrategy(null);
    }, 200);
  };

  const handleToggleScale = (scale: 'linear' | 'log') => {
    if (scale === chartScale) return;
    setChartBaseAnimKey((k) => k + 1);
    setChartBAnimKey((k) => k + 1);
    setChartCAnimKey((k) => k + 1);
    setChartScale(scale);
  };

  // Interactive Canvas Hover & Drag States
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [dragStart, setDragStart] = useState<number | null>(null);
  const [dragEnd, setDragEnd] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [customStartDate, setCustomStartDate] = useState<string | null>(null);
  const [customEndDate, setCustomEndDate] = useState<string | null>(null);
  const [chartBaseAnimKey, setChartBaseAnimKey] = useState<number>(0);
  const [chartBAnimKey, setChartBAnimKey] = useState<number>(0);
  const [chartCAnimKey, setChartCAnimKey] = useState<number>(0);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Global zoom / period / scale changes sweep all active lines
  useEffect(() => {
    setChartBaseAnimKey((k) => k + 1);
    setChartBAnimKey((k) => k + 1);
    setChartCAnimKey((k) => k + 1);
  }, [customStartDate, customEndDate, durationYears, chartScale]);

  // Weight Calculation Helpers
  const totalWeightA = useMemo(() => portfolioA.reduce((sum, item) => sum + item.weight, 0), [portfolioA]);
  const autoCashA = Math.max(0, 100 - totalWeightA);

  const totalWeightB = useMemo(() => portfolioB.reduce((sum, item) => sum + item.weight, 0), [portfolioB]);
  const autoCashB = Math.max(0, 100 - totalWeightB);

  const totalWeightC = useMemo(() => portfolioC.reduce((sum, item) => sum + item.weight, 0), [portfolioC]);
  const autoCashC = Math.max(0, 100 - totalWeightC);

  // Available unused assets for portfolio A, B, C
  const availableForA = useMemo(() => allAssets.filter((a) => a.id !== 'CASH' && !portfolioA.some((sa) => sa.assetId === a.id)), [allAssets, portfolioA]);
  const availableForB = useMemo(() => allAssets.filter((a) => a.id !== 'CASH' && !portfolioB.some((sa) => sa.assetId === a.id)), [allAssets, portfolioB]);
  const availableForC = useMemo(() => allAssets.filter((a) => a.id !== 'CASH' && !portfolioC.some((sa) => sa.assetId === a.id)), [allAssets, portfolioC]);

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
    if (availableForA.length === 0 || portfolioA.length >= 10) return;
    const rem = Math.max(0, 100 - totalWeightA);
    setPortfolioA([...portfolioA, { assetId: availableForA[0].id, weight: rem > 0 ? rem : 0, enableDefense: true }]);
    setActivePresetA(null);
  };

  const handleUpdateWeightA = (index: number, requestedWeight: number) => {
    const otherSum = portfolioA.reduce((sum, item, idx) => (idx === index ? sum : sum + item.weight), 0);
    const maxAllowed = Math.max(0, 100 - otherSum);
    const safe = Math.max(0, Math.min(maxAllowed, requestedWeight));
    setPortfolioA(portfolioA.map((item, idx) => (idx === index ? { ...item, weight: safe } : item)));
    setActivePresetA(null);
  };

  // Slot Management for Portfolio B
  const handleAddSlotB = () => {
    if (availableForB.length === 0 || portfolioB.length >= 10) return;
    const rem = Math.max(0, 100 - totalWeightB);
    setPortfolioB([...portfolioB, { assetId: availableForB[0].id, weight: rem > 0 ? rem : 0, enableDefense: true }]);
  };

  const handleUpdateWeightB = (index: number, requestedWeight: number) => {
    const otherSum = portfolioB.reduce((sum, item, idx) => (idx === index ? sum : sum + item.weight), 0);
    const maxAllowed = Math.max(0, 100 - otherSum);
    const safe = Math.max(0, Math.min(maxAllowed, requestedWeight));
    setPortfolioB(portfolioB.map((item, idx) => (idx === index ? { ...item, weight: safe } : item)));
  };

  // Slot Management for Portfolio C
  const handleAddSlotC = () => {
    if (availableForC.length === 0 || portfolioC.length >= 10) return;
    const rem = Math.max(0, 100 - totalWeightC);
    setPortfolioC([...portfolioC, { assetId: availableForC[0].id, weight: rem > 0 ? rem : 0, enableDefense: true }]);
  };

  const handleUpdateWeightC = (index: number, requestedWeight: number) => {
    const otherSum = portfolioC.reduce((sum, item, idx) => (idx === index ? sum : sum + item.weight), 0);
    const maxAllowed = Math.max(0, 100 - otherSum);
    const safe = Math.max(0, Math.min(maxAllowed, requestedWeight));
    setPortfolioC(portfolioC.map((item, idx) => (idx === index ? { ...item, weight: safe } : item)));
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
      // Free users locked to 15 years (2011-08-01). Pro users can choose 15 years or full 30 years (1996-08-02)
      if (!isPro || durationYears === 15) {
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
    const defenseCashC: Record<string, number> = {};

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

    const sharesC: Record<string, number> = {};
    let cashC = initialCapital * (autoCashC / 100);
    portfolioC.forEach((item) => {
      defenseCashC[item.assetId] = 0;
      const firstPrice = getAssetPrice(item.assetId, startIndex);
      sharesC[item.assetId] = (initialCapital * (item.weight / 100)) / firstPrice;
    });

    let prevValA = initialCapital;
    let prevValB = initialCapital;
    let prevValC = initialCapital;
    let prevValMkt = initialCapital;
    let peakA = initialCapital;
    let peakB = initialCapital;
    let peakC = initialCapital;
    let peakMkt = initialCapital;
    let maxDDA = 0;
    let maxDDB = 0;
    let maxDDC = 0;
    let maxDDMkt = 0;
    const twrReturnsA: number[] = [];
    const twrReturnsB: number[] = [];
    const twrReturnsC: number[] = [];
    const twrReturnsMkt: number[] = [];

    const spyFirstPrice = getAssetPrice('SPY', startIndex);
    let spyShares = initialCapital / (spyFirstPrice || 100);

    for (let t = 0; t < targetLength; t++) {
      const dataIndex = startIndex + t;
      const dateStr = allCanonicalDates[dataIndex];

      const currentSpyPrice = getAssetPrice('SPY', dataIndex);

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

        let preValC = cashC;
        portfolioC.forEach((item) => {
          preValC += (defenseCashC[item.assetId] || 0);
          preValC += (sharesC[item.assetId] || 0) * getAssetPrice(item.assetId, dataIndex);
        });

        const preValMkt = spyShares * currentSpyPrice;

        const twrStepA = prevValA > 0 ? (preValA - prevValA) / prevValA : 0;
        const twrStepB = prevValB > 0 ? (preValB - prevValB) / prevValB : 0;
        const twrStepC = prevValC > 0 ? (preValC - prevValC) / prevValC : 0;
        const twrStepMkt = prevValMkt > 0 ? (preValMkt - prevValMkt) / prevValMkt : 0;
        twrReturnsA.push(twrStepA);
        twrReturnsB.push(twrStepB);
        twrReturnsC.push(twrStepC);
        twrReturnsMkt.push(twrStepMkt);

        const prevDateStr = allCanonicalDates[dataIndex - 1];
        const isNewMonth = dateStr.slice(0, 7) !== (prevDateStr ? prevDateStr.slice(0, 7) : '');
        const shouldDeposit = depositFrequency === 'weekly' || isNewMonth;
        const stepDeposit = shouldDeposit ? depositAmount : 0;

        cumulativeInvested += stepDeposit;

        if (stepDeposit > 0 && currentSpyPrice > 0) {
          spyShares += stepDeposit / currentSpyPrice;
        }

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

        // Portfolio C Rebalance
        cashC += stepDeposit * (autoCashC / 100);
        portfolioC.forEach((item) => {
          const benchSeries = getBenchmarkSeries(item.assetId);
          const benchPrice = benchSeries?.[dataIndex]?.price || getAssetPrice(item.assetId, dataIndex);
          const actualPrice = getAssetPrice(item.assetId, dataIndex);
          if (!actualPrice || actualPrice <= 0) return;

          const isDefenseEnabledForItem = item.enableDefense !== false && strategyPeriodC > 0;
          let isItemDefending = false;

          if (isDefenseEnabledForItem && benchPrice && benchPrice > 0 && dataIndex >= 2) {
            const barCount = Math.max(2, Math.round(strategyPeriodC / 5));
            const windowSize = Math.min(dataIndex, barCount);
            const recentPrices = benchSeries.slice(dataIndex - windowSize, dataIndex).map((p) => p.price);
            const ma = recentPrices.reduce((a, b) => a + b, 0) / (recentPrices.length || 1);
            if (benchPrice < ma) isItemDefending = true;
          }

          const depositAlloc = stepDeposit * (item.weight / 100);
          if (isItemDefending) {
            if ((sharesC[item.assetId] || 0) > 0) {
              defenseCashC[item.assetId] = (defenseCashC[item.assetId] || 0) + (sharesC[item.assetId] || 0) * actualPrice;
              sharesC[item.assetId] = 0;
            }
            defenseCashC[item.assetId] = (defenseCashC[item.assetId] || 0) + depositAlloc;
          } else {
            const totalMoneyToBuy = depositAlloc + (defenseCashC[item.assetId] || 0);
            sharesC[item.assetId] = (sharesC[item.assetId] || 0) + totalMoneyToBuy / actualPrice;
            defenseCashC[item.assetId] = 0;
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

      let valC = cashC;
      portfolioC.forEach((item) => {
        valC += (defenseCashC[item.assetId] || 0);
        valC += (sharesC[item.assetId] || 0) * getAssetPrice(item.assetId, dataIndex);
      });

      const valMkt = spyShares * currentSpyPrice;

      const roundedValA = Math.round(valA);
      const roundedValB = Math.round(valB);
      const roundedValC = Math.round(valC);
      const roundedValMkt = Math.round(valMkt);

      prevValA = valA;
      prevValB = valB;
      prevValC = valC;
      prevValMkt = valMkt;

      if (roundedValA > peakA) peakA = roundedValA;
      const ddA = (peakA - roundedValA) / peakA;
      if (ddA > maxDDA) maxDDA = ddA;

      if (roundedValB > peakB) peakB = roundedValB;
      const ddB = (peakB - roundedValB) / peakB;
      if (ddB > maxDDB) maxDDB = ddB;

      if (roundedValC > peakC) peakC = roundedValC;
      const ddC = (peakC - roundedValC) / peakC;
      if (ddC > maxDDC) maxDDC = ddC;

      if (roundedValMkt > peakMkt) peakMkt = roundedValMkt;
      const ddMkt = (peakMkt - roundedValMkt) / peakMkt;
      if (ddMkt > maxDDMkt) maxDDMkt = ddMkt;

      const retA = cumulativeInvested > 0 ? ((roundedValA - cumulativeInvested) / cumulativeInvested) * 100 : 0;
      const retB = cumulativeInvested > 0 ? ((roundedValB - cumulativeInvested) / cumulativeInvested) * 100 : 0;
      const retC = cumulativeInvested > 0 ? ((roundedValC - cumulativeInvested) / cumulativeInvested) * 100 : 0;

      points.push({
        index: t,
        date: dateStr,
        valA: roundedValA,
        valB: roundedValB,
        valC: roundedValC,
        invested: Math.round(cumulativeInvested),
        retA: Number(retA.toFixed(1)),
        retB: Number(retB.toFixed(1)),
        retC: Number(retC.toFixed(1)),
      });
    }

    const finalPoint = points[points.length - 1] || { valA: initialCapital, valB: initialCapital, valC: initialCapital, invested: initialCapital, retA: 0, retB: 0, retC: 0 };
    const years = Math.max(0.1, targetLength / 52.1428);

    const cagrA = (Math.pow(finalPoint.valA / finalPoint.invested, 1 / years) - 1) * 100;
    const cagrB = (Math.pow((finalPoint.valB || finalPoint.invested) / finalPoint.invested, 1 / years) - 1) * 100;
    const cagrC = (Math.pow((finalPoint.valC || finalPoint.invested) / finalPoint.invested, 1 / years) - 1) * 100;
    const cagrMkt = (Math.pow((spyShares * getAssetPrice('SPY', endIndex)) / finalPoint.invested, 1 / years) - 1) * 100;

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

    const computeSortino = (returns: number[]) => {
      if (returns.length < 2) return 0;
      const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
      const rfStep = 0.02 / 52;
      const downsideDiffs = returns.map((r) => Math.min(0, r - rfStep));
      const downsideVariance = downsideDiffs.reduce((a, b) => a + Math.pow(b, 2), 0) / (returns.length - 1);
      const downsideDev = Math.sqrt(downsideVariance) * Math.sqrt(52);
      const annualizedReturn = mean * 52;
      return downsideDev > 0 ? (annualizedReturn - 0.02) / downsideDev : 0;
    };

    const sharpeA = computeTWRSharpe(twrReturnsA);
    const sharpeB = computeTWRSharpe(twrReturnsB);
    const sharpeC = computeTWRSharpe(twrReturnsC);

    const sortinoA = computeSortino(twrReturnsA);
    const sortinoB = computeSortino(twrReturnsB);
    const sortinoC = computeSortino(twrReturnsC);
    const sortinoMkt = computeSortino(twrReturnsMkt);

    const mddA = maxDDA * 100;
    const mddB = maxDDB * 100;
    const mddC = maxDDC * 100;
    const mddMkt = maxDDMkt * 100;

    const calmarA = mddA > 0 ? cagrA / mddA : 0;
    const calmarB = mddB > 0 ? cagrB / mddB : 0;
    const calmarC = mddC > 0 ? cagrC / mddC : 0;
    const calmarMkt = mddMkt > 0 ? cagrMkt / mddMkt : 0;

    return {
      points,
      startDate: points[0]?.date || '2006-01-01',
      finalInvested: finalPoint.invested,
      benchmark: {
        cagr: Number(cagrMkt.toFixed(1)),
        mdd: Number(mddMkt.toFixed(1)),
        sortino: Number(sortinoMkt.toFixed(2)),
        calmar: Number(calmarMkt.toFixed(2)),
      },
      portA: {
        val: finalPoint.valA,
        totalRate: finalPoint.retA,
        cagr: Number(cagrA.toFixed(1)),
        mdd: Number(mddA.toFixed(1)),
        sharpe: sharpeA.toFixed(2),
        sortino: Number(sortinoA.toFixed(2)),
        calmar: Number(calmarA.toFixed(2)),
      },
      portB: {
        val: finalPoint.valB || 0,
        totalRate: finalPoint.retB || 0,
        cagr: Number(cagrB.toFixed(1)),
        mdd: Number(mddB.toFixed(1)),
        sharpe: sharpeB.toFixed(2),
        sortino: Number(sortinoB.toFixed(2)),
        calmar: Number(calmarB.toFixed(2)),
      },
      portC: {
        val: finalPoint.valC || 0,
        totalRate: finalPoint.retC || 0,
        cagr: Number(cagrC.toFixed(1)),
        mdd: Number(mddC.toFixed(1)),
        sharpe: sharpeC.toFixed(2),
        sortino: Number(sortinoC.toFixed(2)),
        calmar: Number(calmarC.toFixed(2)),
      },
    };
  }, [portfolioA, autoCashA, strategyPeriodA, portfolioB, autoCashB, strategyPeriodB, portfolioC, autoCashC, strategyPeriodC, initialCapital, depositAmount, durationYears, depositFrequency, customStartDate, customEndDate, isPro]);

  // Real-time Warning & Feedback Evaluation for Strategy 1
  const evalFeedbackA = useMemo(() => {
    const actualMDD = simulation.portA.mdd;
    const actualCAGR = simulation.portA.cagr;

    const isRiskTooHigh = actualMDD > maxTolerableMDD + 3;
    const isReturnTooLow = actualCAGR < targetCAGR - 3;

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
        desc: `과거 최대 손실폭(-${actualMDD}%)이 설정하신 감내 기준(-${maxTolerableMDD}%)을 초과합니다. 200일선 방어 옵션을 켜거나 안전 자산 비중을 높여 위험을 낮춰보세요.`,
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
  }, [simulation.portA, targetCAGR, maxTolerableMDD]);

  // Real-time Warning & Feedback Evaluation for Strategy 2
  const evalFeedbackB = useMemo(() => {
    const actualMDD = simulation.portB.mdd;
    const actualCAGR = simulation.portB.cagr;

    const isRiskTooHigh = actualMDD > maxTolerableMDD + 3;
    const isReturnTooLow = actualCAGR < targetCAGR - 3;

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

  // Real-time Warning & Feedback Evaluation for Strategy 3
  const evalFeedbackC = useMemo(() => {
    const actualMDD = simulation.portC.mdd;
    const actualCAGR = simulation.portC.cagr;

    const isRiskTooHigh = actualMDD > maxTolerableMDD + 3;
    const isReturnTooLow = actualCAGR < targetCAGR - 3;

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
        desc: `과거 최대 손실폭(-${actualMDD}%)이 설정하신 감내 기준(-${maxTolerableMDD}%)을 초과합니다. 200일선 방어 옵션을 켜거나 안전 자산 비중을 높여 위험을 낮춰보세요.`,
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
  }, [simulation.portC, targetCAGR, maxTolerableMDD]);

  // User personality info & 3 Presets
  const userPersonalityInfo = useMemo(() => {
    return getUserPersonalityInfo({ user, searchParams });
  }, [user, searchParams]);

  const personalityPresets = useMemo(() => {
    return getPersonality3Presets(userPersonalityInfo.typeCode, userPersonalityInfo.scores);
  }, [userPersonalityInfo]);

  // ScoreBreakdown Evaluation for Strategy A, B, C
  const scoreBreakdownA: ScoreBreakdown = useMemo(() => {
    return calculateBenchmarkPortfolioScore({
      portCAGR: simulation.portA.cagr,
      portMDD: simulation.portA.mdd,
      portSortino: simulation.portA.sortino || 1.0,
      portCalmar: simulation.portA.calmar || 0.3,
      portfolio: portfolioA,
      strategyPeriod: strategyPeriodA,
      benchmarkCAGR: simulation.benchmark?.cagr || 10.0,
      benchmarkMDD: simulation.benchmark?.mdd || 30.0,
      benchmarkSortino: simulation.benchmark?.sortino || 1.0,
      benchmarkCalmar: simulation.benchmark?.calmar || 0.3,
      targetCAGR,
      maxTolerableMDD,
      scores: userPersonalityInfo.scores,
    });
  }, [simulation.portA, simulation.benchmark, portfolioA, strategyPeriodA, targetCAGR, maxTolerableMDD, userPersonalityInfo]);

  const scoreBreakdownB: ScoreBreakdown = useMemo(() => {
    return calculateBenchmarkPortfolioScore({
      portCAGR: simulation.portB.cagr,
      portMDD: simulation.portB.mdd,
      portSortino: simulation.portB.sortino || 1.0,
      portCalmar: simulation.portB.calmar || 0.3,
      portfolio: portfolioB,
      strategyPeriod: strategyPeriodB,
      benchmarkCAGR: simulation.benchmark?.cagr || 10.0,
      benchmarkMDD: simulation.benchmark?.mdd || 30.0,
      benchmarkSortino: simulation.benchmark?.sortino || 1.0,
      benchmarkCalmar: simulation.benchmark?.calmar || 0.3,
      targetCAGR,
      maxTolerableMDD,
      scores: userPersonalityInfo.scores,
    });
  }, [simulation.portB, simulation.benchmark, portfolioB, strategyPeriodB, targetCAGR, maxTolerableMDD, userPersonalityInfo]);

  const scoreBreakdownC: ScoreBreakdown = useMemo(() => {
    return calculateBenchmarkPortfolioScore({
      portCAGR: simulation.portC.cagr,
      portMDD: simulation.portC.mdd,
      portSortino: simulation.portC.sortino || 1.0,
      portCalmar: simulation.portC.calmar || 0.3,
      portfolio: portfolioC,
      strategyPeriod: strategyPeriodC,
      benchmarkCAGR: simulation.benchmark?.cagr || 10.0,
      benchmarkMDD: simulation.benchmark?.mdd || 30.0,
      benchmarkSortino: simulation.benchmark?.sortino || 1.0,
      benchmarkCalmar: simulation.benchmark?.calmar || 0.3,
      targetCAGR,
      maxTolerableMDD,
      scores: userPersonalityInfo.scores,
    });
  }, [simulation.portC, simulation.benchmark, portfolioC, strategyPeriodC, targetCAGR, maxTolerableMDD, userPersonalityInfo]);

  // Chart Canvas Dimensions (Full-Width Dynamic Range)
  const chartHeight = 260;
  const chartWidth = 800;
  const proLeftOffset = !isPro && !customStartDate ? 36 : 0;

  const valsA = simulation.points.map((p) => p.valA);
  const valsB = strategyCount >= 2 ? simulation.points.map((p) => p.valB || 0) : [];
  const valsC = strategyCount >= 3 ? simulation.points.map((p) => p.valC || 0) : [];
  const investedVals = simulation.points.map((p) => p.invested);

  const maxVal = Math.max(...valsA, ...valsB, ...valsC, ...investedVals, 10);
  const minVal = Math.min(...valsA, ...valsB, ...investedVals, initialCapital);

  // Precompute Log Bounds: Starts exactly at bottom
  const safeLogMin = Math.max(1, minVal * 0.95);
  const safeLogMax = Math.max(maxVal * 1.02, safeLogMin * 1.05);
  const logMin = Math.log10(safeLogMin);
  const logMax = Math.log10(safeLogMax);

  const getX = (index: number) => {
    const total = simulation.points.length;
    if (total <= 1) return proLeftOffset;
    return proLeftOffset + (index / (total - 1)) * (chartWidth - proLeftOffset);
  };

  const getY = (val: number) => {
    if (chartScale === 'log') {
      const safeVal = Math.max(safeLogMin, val);
      const ratio = (Math.log10(safeVal) - logMin) / (logMax - logMin || 1);
      return chartHeight - 8 - ratio * (chartHeight - 16);
    }
    return chartHeight - 8 - ((val - minVal) / (maxVal - minVal || 1)) * (chartHeight - 16);
  };

  const getSvgPath = (values: number[]) => {
    if (values.length === 0) return '';
    const points = values.map((val, idx) => `${getX(idx)},${getY(val)}`);
    return `M ${points.join(' L ')}`;
  };

  // Dynamic X-Axis Year Ticks for SVG Canvas
  const yearTicks = useMemo(() => {
    const pts = simulation.points;
    if (!pts || pts.length < 2) return [];

    const firstYear = parseInt(pts[0].date.slice(0, 4), 10);
    const lastYear = parseInt(pts[pts.length - 1].date.slice(0, 4), 10);
    const spanYears = Math.max(1, lastYear - firstYear);

    let step = 1;
    if (spanYears >= 20) step = 5;
    else if (spanYears >= 10) step = 3;
    else if (spanYears >= 4) step = 2;
    else step = 1;

    const ticks: Array<{ index: number; label: string; x: number }> = [];
    let lastPushedYear = -1;

    for (let i = 0; i < pts.length; i++) {
      const year = parseInt(pts[i].date.slice(0, 4), 10);
      if (year !== lastPushedYear && year % step === 0) {
        ticks.push({
          index: i,
          label: `${year}`,
          x: getX(i),
        });
        lastPushedYear = year;
      }
    }

    return ticks;
  }, [simulation.points, proLeftOffset, chartWidth]);

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
    const diffB = pStart.valB !== undefined && pEnd.valB !== undefined && pStart.valB > 0
      ? (((pEnd.valB - pStart.valB) / pStart.valB) * 100).toFixed(1)
      : '0.0';
    const diffC = pStart.valC !== undefined && pEnd.valC !== undefined && pStart.valC > 0
      ? (((pEnd.valC - pStart.valC) / pStart.valC) * 100).toFixed(1)
      : '0.0';

    return {
      startDate: pStart.date,
      endDate: pEnd.date,
      diffA,
      diffB,
      diffC,
    };
  }, [dragStart, dragEnd, simulation.points]);

  const activeHoverPoint = hoverIndex !== null ? simulation.points[hoverIndex] : null;

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-4 sm:space-y-6 select-none">
      {/* De-boxed Clean Minimal Hero Banner */}
      <div className="py-2 px-1 space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
          투자 전략 시뮬레이터
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium">
          내 투자 성향 및 목표에 적합한 전략을 검증하고, 나만의 성과를 데이터로 비교해보세요.
        </p>
      </div>

      {/* ---------------------------------------------------- */}
      {/* [STEP 1 MASTER CARD] 나의 투자 기준                    */}
      {/* ---------------------------------------------------- */}
      <RevealOnScroll delayIndex={1}>
        <div className="glass-card p-5 rounded-2xl sm:rounded-3xl space-y-4 border border-[var(--border-color)] relative overflow-hidden shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-[var(--accent-orange)]/10 text-[var(--accent-orange)]">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
                  나의 투자 기준
                </h2>
                <p className="text-[10px] sm:text-[11px] text-[var(--text-secondary)] font-medium">
                  내 목표 수익, 감내 손실, 투자 금액과 주기를 설정합니다.
                </p>
              </div>
            </div>
          <button
            type="button"
            onClick={() => resetGoalSettingsToRecommendation()}
            className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full bg-[var(--card-surface)] text-[var(--accent-orange)] border border-[var(--border-color)] hover:border-[rgba(241,143,1,0.5)] hover:shadow-[0_0_14px_rgba(241,143,1,0.18)] hover:bg-[var(--accent-orange)]/10 active:scale-95 transition-all cursor-pointer shadow-2xs"
          >
            <RotateCcw className="w-3 h-3 text-[var(--accent-orange)]" />
            <span>{userProfileCode ? '맞춤값으로 초기화' : '기본값으로 초기화'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Target CAGR Control */}
          <div className="bg-[var(--bg-main)]/60 p-3 rounded-2xl border border-[var(--border-color)] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--text-secondary)] flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-[var(--accent-mid-green)]" />
                목표 연수익률
              </span>
              <span className="text-xs font-extrabold text-[var(--accent-mid-green)] font-mono">
                +{targetCAGR}%
              </span>
            </div>
            <input
              type="range"
              min={5}
              max={40}
              step={1}
              value={targetCAGR}
              onChange={(e) => {
                setTargetCAGR(Number(e.target.value));
                setIsTargetCustomized(true);
              }}
              className="w-full accent-[var(--accent-mid-green)] cursor-pointer h-1.5"
            />
          </div>

          {/* Max Tolerable MDD Control */}
          <div className="bg-[var(--bg-main)]/60 p-3 rounded-2xl border border-[var(--border-color)] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--text-secondary)] flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                감내 가능한 최대 손실
              </span>
              <span className="text-xs font-extrabold text-rose-500 font-mono">
                -{maxTolerableMDD}%
              </span>
            </div>
            <input
              type="range"
              min={5}
              max={60}
              step={1}
              value={maxTolerableMDD}
              onChange={(e) => {
                setMaxTolerableMDD(Number(e.target.value));
                setIsTargetCustomized(true);
              }}
              className="w-full accent-rose-500 cursor-pointer h-1.5"
            />
          </div>
        </div>

        {/* Investment Conditions Sub-Grid (시작 자본금 / 매달 적립 금액 - 50:50 대칭 배치) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Initial Capital */}
          <div className="space-y-1 bg-[var(--bg-main)]/60 p-3 rounded-2xl border border-[var(--border-color)]">
            <label className="text-[11px] font-bold text-[var(--text-secondary)] block">시작 자본금</label>
            <div className="flex items-center justify-between gap-2">
              <input
                type="number"
                value={initialCapital}
                onChange={(e) => setInitialCapital(Math.max(0, Number(e.target.value)))}
                className="flex-1 min-w-0 bg-transparent text-sm font-extrabold text-[var(--text-primary)] focus:outline-none font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-xs font-bold text-[var(--text-secondary)] font-mono">만원</span>
                <button
                  type="button"
                  onClick={() => setInitialCapital(Math.max(0, initialCapital - 50))}
                  className="w-6 h-6 rounded-full bg-[var(--card-surface)] border border-[var(--border-color)] text-xs font-black flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--accent-orange)] hover:border-[rgba(241,143,1,0.5)] hover:shadow-[0_0_10px_rgba(241,143,1,0.2)] hover:bg-[var(--accent-orange)]/10 active:scale-90 transition-all cursor-pointer shadow-2xs"
                  title="50만원 감소"
                >
                  <Minus className="w-3 h-3 stroke-[2.5]" />
                </button>
                <button
                  type="button"
                  onClick={() => setInitialCapital(initialCapital + 50)}
                  className="w-6 h-6 rounded-full bg-[var(--card-surface)] border border-[var(--border-color)] text-xs font-black flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--accent-orange)] hover:border-[rgba(241,143,1,0.5)] hover:shadow-[0_0_10px_rgba(241,143,1,0.2)] hover:bg-[var(--accent-orange)]/10 active:scale-90 transition-all cursor-pointer shadow-2xs"
                  title="50만원 추가"
                >
                  <Plus className="w-3 h-3 stroke-[2.5]" />
                </button>
              </div>
            </div>
          </div>

          {/* Monthly Deposit Amount */}
          <div className="space-y-1 bg-[var(--bg-main)]/60 p-3 rounded-2xl border border-[var(--border-color)]">
            <label className="text-[11px] font-bold text-[var(--text-secondary)] block">
              매달 적립 금액
            </label>
            <div className="flex items-center justify-between gap-2">
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(Math.max(0, Number(e.target.value)))}
                className="flex-1 min-w-0 bg-transparent text-sm font-extrabold text-[var(--text-primary)] focus:outline-none font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-xs font-bold text-[var(--text-secondary)] font-mono">만원</span>
                <button
                  type="button"
                  onClick={() => setDepositAmount(Math.max(0, depositAmount - 10))}
                  className="w-6 h-6 rounded-full bg-[var(--card-surface)] border border-[var(--border-color)] text-xs font-black flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--accent-orange)] hover:border-[rgba(241,143,1,0.5)] hover:shadow-[0_0_10px_rgba(241,143,1,0.2)] hover:bg-[var(--accent-orange)]/10 active:scale-90 transition-all cursor-pointer shadow-2xs"
                  title="10만원 감소"
                >
                  <Minus className="w-3 h-3 stroke-[2.5]" />
                </button>
                <button
                  type="button"
                  onClick={() => setDepositAmount(depositAmount + 10)}
                  className="w-6 h-6 rounded-full bg-[var(--card-surface)] border border-[var(--border-color)] text-xs font-black flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--accent-orange)] hover:border-[rgba(241,143,1,0.5)] hover:shadow-[0_0_10px_rgba(241,143,1,0.2)] hover:bg-[var(--accent-orange)]/10 active:scale-90 transition-all cursor-pointer shadow-2xs"
                  title="10만원 추가"
                >
                  <Plus className="w-3 h-3 stroke-[2.5]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      </RevealOnScroll>

      {/* ---------------------------------------------------- */}
      {/* [STEP 2 MASTER CARD] 실전 전략 & 투자 시뮬레이션       */}
      {/* ---------------------------------------------------- */}
      <RevealOnScroll delayIndex={2}>
        <div className="glass-card p-5 rounded-2xl sm:rounded-3xl border border-[var(--border-color)] space-y-4 relative shadow-sm">
          <div className="relative z-30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <div className="p-1.5 rounded-xl bg-[var(--accent-orange)]/10 text-[var(--accent-orange)] shrink-0">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)] truncate">
                  실전 전략 & 투자 시뮬레이션
                </h2>
                <p className="text-[10px] sm:text-[11px] text-[var(--text-secondary)] font-medium truncate">
                  원하는 자산과 방어 옵션을 구성하고 과거 30년 실제 성과를 검증합니다.
                </p>
              </div>
            </div>

            {/* Header Controls: Left [? + Scale] & Right [15/30y or Reset] (Always right-aligned with 30y securely positioned on the right edge) */}
            <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 w-full sm:w-auto">
              {/* Left Sub-Group: ? Tooltip + [ 선형 | 로그 ] */}
              <div className="flex items-center gap-1.5 shrink-0 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]">
                <button
                  type="button"
                  onClick={() => setActiveTooltip(activeTooltip === 'chart_scale' ? null : 'chart_scale')}
                  className={`transition-all p-1 rounded-full hover:bg-[var(--card-hover)] cursor-pointer shrink-0 ${
                    activeTooltip === 'chart_scale' ? 'text-[var(--accent-orange)] bg-[var(--card-hover)]' : 'text-[var(--text-secondary)] hover:text-[var(--accent-orange)]'
                  }`}
                  title="차트 보기 방식 설명"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                </button>

                {/* Scale Toggle: [ 선형 | 로그 ] */}
                <div className="relative flex items-center p-0.5 rounded-full bg-[var(--bg-main)]/90 border border-[var(--border-color)] shadow-2xs font-sans shrink-0">
                  <div
                    className="absolute top-0.5 bottom-0.5 rounded-full bg-[var(--card-surface)] border border-[rgba(241,143,1,0.6)] shadow-[0_0_12px_rgba(241,143,1,0.22)] transition-all duration-380 ease-[cubic-bezier(0.2,0.8,0.2,1)] pointer-events-none"
                    style={{
                      width: 'calc(50% - 2px)',
                      left: chartScale === 'linear' ? '2px' : 'calc(50% + 0px)',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleToggleScale('linear')}
                    className={`relative z-10 px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-colors duration-200 cursor-pointer whitespace-nowrap ${
                      chartScale === 'linear'
                        ? 'text-[var(--accent-orange)] font-extrabold'
                        : 'text-[var(--text-secondary)] hover:text-[var(--accent-orange)]'
                    }`}
                  >
                    선형
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleScale('log')}
                    className={`relative z-10 px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-colors duration-200 cursor-pointer whitespace-nowrap ${
                      chartScale === 'log'
                        ? 'text-[var(--accent-orange)] font-extrabold'
                        : 'text-[var(--text-secondary)] hover:text-[var(--accent-orange)]'
                    }`}
                  >
                    로그
                  </button>
                </div>
              </div>

              {/* 3. Duration / Reset Controls (Unified 108px Capsule Container) */}
              <div className="relative z-30 flex items-center justify-end shrink-0 w-[108px] h-[28px] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]">
                {customStartDate || customEndDate ? (
                  <div key="reset-btn-wrapper" className="w-full h-full flex items-center justify-center p-0.5 rounded-full bg-[var(--bg-main)]/90 border border-[var(--border-color)] shadow-2xs text-xs font-sans shrink-0 animate-fade-in">
                    <button
                      type="button"
                      onClick={() => {
                        setCustomStartDate(null);
                        setCustomEndDate(null);
                      }}
                      className="w-full h-full flex items-center justify-center gap-1.5 px-2 rounded-full bg-[var(--card-surface)] text-[var(--accent-orange)] font-extrabold text-[11px] border border-[rgba(241,143,1,0.6)] shadow-[0_0_12px_rgba(241,143,1,0.22)] hover:border-[var(--accent-orange)] hover:shadow-[0_0_16px_rgba(241,143,1,0.4)] transition-all cursor-pointer font-sans whitespace-nowrap active:scale-95 shrink-0"
                    >
                      <RotateCcw className="w-3 h-3 text-[var(--accent-orange)]" />
                      <span>전체 보기</span>
                    </button>
                  </div>
                ) : (
                  <div key="duration-pill-wrapper" className="w-full h-full relative shrink-0 animate-fade-in">
                    {/* Unified Segmented Pill Design matching Scale Switch */}
                    {isPro ? (
                      <div className="w-full h-full relative flex items-center p-0.5 rounded-full bg-[var(--bg-main)]/90 border border-[var(--border-color)] shadow-2xs text-xs font-sans">
                        <div
                          className="absolute top-0.5 bottom-0.5 rounded-full bg-[var(--card-surface)] border border-[rgba(241,143,1,0.6)] shadow-[0_0_12px_rgba(241,143,1,0.22)] transition-all duration-380 ease-[cubic-bezier(0.2,0.8,0.2,1)] pointer-events-none"
                          style={{
                            width: 'calc(50% - 2px)',
                            left: durationYears === 15 ? '2px' : 'calc(50% + 0px)',
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setDurationYears(15);
                            if (!isTargetCustomized) {
                              resetGoalSettingsToRecommendation(15, true);
                            }
                          }}
                          className={`relative z-10 w-1/2 flex items-center justify-center py-0.5 rounded-full font-bold transition-colors duration-200 cursor-pointer whitespace-nowrap ${
                            durationYears === 15
                              ? 'text-[var(--accent-orange)] font-extrabold text-[11px]'
                              : 'text-[var(--text-secondary)] hover:text-[var(--accent-orange)] text-[11px]'
                          }`}
                        >
                          15년
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDurationYears(30);
                            if (!isTargetCustomized) {
                              resetGoalSettingsToRecommendation(30, true);
                            }
                          }}
                          className={`relative z-10 w-1/2 flex items-center justify-center py-0.5 rounded-full font-bold transition-colors duration-200 cursor-pointer whitespace-nowrap ${
                            durationYears === 30
                              ? 'text-[var(--accent-orange)] font-extrabold text-[11px]'
                              : 'text-[var(--text-secondary)] hover:text-[var(--accent-orange)] text-[11px]'
                          }`}
                        >
                          30년
                        </button>
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-between p-0.5 rounded-full bg-[var(--bg-main)]/90 border border-[var(--border-color)] shadow-2xs text-xs font-sans">
                        <span className="w-1/2 flex items-center justify-center py-0.5 rounded-full bg-[var(--card-surface)] text-[var(--accent-orange)] font-extrabold text-[11px] border border-[rgba(241,143,1,0.6)] shadow-[0_0_12px_rgba(241,143,1,0.22)] font-mono whitespace-nowrap">
                          15년
                        </span>
                        <button
                          type="button"
                          onClick={() => setProPopoverOpen(!proPopoverOpen)}
                          className="w-1/2 flex items-center justify-center gap-1 py-0.5 rounded-full text-[var(--text-secondary)] hover:text-[var(--accent-orange)] transition-all cursor-pointer font-sans text-[11px] font-extrabold whitespace-nowrap"
                        >
                          <Lock className="w-3 h-3 text-[var(--accent-orange)]" />
                          <span>30년</span>
                        </button>
                      </div>
                    )}

                  {/* Floating Pro Popover anchored to Top Right Button (Optimized for Mobile/Desktop to avoid overflow) */}
                  {proPopoverOpen && !isPro && (
                    <div className="absolute top-full right-0 mt-2 z-50 w-72 sm:w-80 max-w-[calc(100vw-32px)] p-4 rounded-2xl bg-white/95 dark:bg-[#18181b]/95 backdrop-blur-xl border border-[var(--border-color)] shadow-2xl space-y-3 animate-popover-expand text-left font-sans">
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
                          className="w-full py-2.5 rounded-full bg-[var(--accent-orange)] border border-[rgba(241,143,1,0.5)] hover:brightness-110 hover:shadow-[0_0_16px_rgba(241,143,1,0.3)] text-white font-extrabold text-xs transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Crown className="w-3.5 h-3.5" />
                          로그인 / 가입하고 둘러보기
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setProPopoverOpen(false);
                            openAuthPopover();
                          }}
                          className="w-full py-2.5 rounded-full bg-[var(--accent-orange)] border border-[rgba(241,143,1,0.5)] hover:brightness-110 hover:shadow-[0_0_16px_rgba(241,143,1,0.3)] text-white font-extrabold text-xs transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Crown className="w-3.5 h-3.5" />
                          PRO 코드 인증
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 1. Inline SmoothHeight Chart Scale Explanation Box */}
        <SmoothHeight>
          {activeTooltip === 'chart_scale' && (
            <div className="pb-1.5">
              <div className="p-3.5 rounded-2xl bg-[var(--bg-main)]/80 border border-[var(--border-color)] text-[11px] text-[var(--text-secondary)] leading-relaxed space-y-1.5 font-sans">
                <div>
                  <strong className="text-[var(--text-primary)]">📊 선형:</strong> 실제 내 자산이 불어나는 최종 금액 크기를 있는 그대로 정직하게 보여줍니다.
                </div>
                <div>
                  <strong className="text-[var(--text-primary)]">📈 로그:</strong> 과거의 폭락과 상승 굴곡을 한눈에 자세히 비교할 수 있도록 성장 비율에 맞춰 보여줍니다.
                </div>
                <div className="text-[10.5px] pt-1 text-[var(--text-secondary)]">
                  💡 <strong>추천 팁:</strong> 로그 차트는 매달 적립 금액을 0원으로 두고 <strong>'시작 자본금'</strong>만으로 시뮬레이션할 때 가장 왜곡 없이 과거 성과를 분석할 수 있습니다.
                </div>
              </div>
            </div>
          )}
        </SmoothHeight>

        {/* 2. Inline SmoothHeight Synthetic Asset Inference Notices (Independent for smooth 1<->2 transitions) */}
        {(() => {
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
            AMZN: { label: '아마존', dateStr: '1997년 5월 이전', cutoffDate: '1997-05-01' },
            TSM: { label: 'TSMC', dateStr: '1997년 10월 이전', cutoffDate: '1997-10-01' },
            SPCX: { label: '스페이스X', dateStr: '2026년 6월 이전', cutoffDate: '2026-06-01' },
            AVGO: { label: '브로드컴', dateStr: '2009년 8월 이전', cutoffDate: '2009-08-01' },
            TSLA: { label: '테슬라', dateStr: '2010년 6월 이전', cutoffDate: '2010-06-01' },
            META: { label: '메타', dateStr: '2012년 5월 이전', cutoffDate: '2012-05-01' },
            V: { label: '비자', dateStr: '2008년 3월 이전', cutoffDate: '2008-03-01' },
            ASML: { label: 'ASML', dateStr: '1995년 3월 이전', cutoffDate: '1995-03-01' },
            '000660': { label: 'SK하이닉스', dateStr: '1996년 12월 이전', cutoffDate: '1996-12-01' },
            '402340': { label: 'SK스퀘어', dateStr: '2021년 11월 이전', cutoffDate: '2021-11-01' },
            '373220': { label: 'LG에너지솔루션', dateStr: '2022년 1월 이전', cutoffDate: '2022-01-01' },
            '207940': { label: '삼성바이오로직스', dateStr: '2016년 11월 이전', cutoffDate: '2016-11-01' },
            '032830': { label: '삼성생명', dateStr: '2010년 5월 이전', cutoffDate: '2010-05-01' },
            '028260': { label: '삼성물산', dateStr: '2014년 12월 이전', cutoffDate: '2014-12-01' },
            '105560': { label: 'KB금융', dateStr: '2008년 10월 이전', cutoffDate: '2008-10-01' },
            BTC: { label: '비트코인', dateStr: '2014년 9월 이전', cutoffDate: '2014-09-01', isCrypto: true },
            ETH: { label: '이더리움', dateStr: '2017년 11월 이전', cutoffDate: '2017-11-01', isCrypto: true },
          };

          const allSelectedAssets = [
            ...portfolioA.map(p => p.assetId),
            ...(strategyCount >= 2 ? portfolioB.map(p => p.assetId) : []),
            ...(strategyCount >= 3 ? portfolioC.map(p => p.assetId) : [])
          ];
          const selectedIds = Array.from(new Set(allSelectedAssets)).filter(id => synthAssetMeta[id] && simStartDate < synthAssetMeta[id].cutoffDate);

          const etfItems = selectedIds.filter(id => !synthAssetMeta[id].isCrypto).map(id => `${synthAssetMeta[id].label} ${synthAssetMeta[id].dateStr}`);
          const cryptoItems = selectedIds.filter(id => synthAssetMeta[id].isCrypto).map(id => `${synthAssetMeta[id].label} ${synthAssetMeta[id].dateStr}`);

          const hasNotices = etfItems.length > 0 || cryptoItems.length > 0;

          return (
            <SmoothHeight duration={320}>
              {hasNotices && (
                <div className="pb-1.5">
                  <div
                    style={{ borderColor: 'rgba(241, 143, 1, 0.35)' }}
                    className="p-3 rounded-xl bg-[var(--accent-orange)]/10 border text-[11px] text-[var(--text-primary)] font-medium leading-relaxed flex items-start gap-2 shadow-2xs transition-all"
                  >
                    <AlertCircle className="w-4 h-4 text-[var(--accent-orange)] shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <SmoothHeight duration={280}>
                        {etfItems.length > 0 && (
                          <div className={cryptoItems.length > 0 ? 'pb-1' : ''}>
                            <strong className="text-[var(--accent-orange)]">{etfItems.join(', ')}</strong>의 과거 구간은 기초지수 성과를 바탕으로 추론된 데이터입니다.
                          </div>
                        )}
                      </SmoothHeight>
                      <SmoothHeight duration={280}>
                        {cryptoItems.length > 0 && (
                          <div className={etfItems.length > 0 ? 'pt-0.5' : ''}>
                            <strong className="text-[var(--accent-orange)] font-extrabold">{cryptoItems.join(', ')}</strong>의 과거 데이터는 추론 특성상 다른 자산보다 결과가 다소 부정확할 수 있습니다.
                          </div>
                        )}
                      </SmoothHeight>
                    </div>
                  </div>
                </div>
              )}
            </SmoothHeight>
          );
        })()}

        {/* Integrated Clean Full-Width Chart Canvas */}
        <div className="relative z-10 overflow-hidden transition-all duration-300">
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
              <style>{`
                @keyframes chartSweepAnim {
                  0% { width: 0px; }
                  100% { width: ${chartWidth}px; }
                }
              `}</style>
              <clipPath id={`chartRevealClip-base-${chartBaseAnimKey}`}>
                <rect
                  key={chartBaseAnimKey}
                  x="0"
                  y="0"
                  width="0"
                  height={chartHeight}
                  style={{
                    animation: 'chartSweepAnim 850ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
                  }}
                />
              </clipPath>
              <clipPath id={`chartRevealClip-B-${chartBAnimKey}`}>
                <rect
                  key={chartBAnimKey}
                  x="0"
                  y="0"
                  width="0"
                  height={chartHeight}
                  style={{
                    animation: 'chartSweepAnim 850ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
                  }}
                />
              </clipPath>
              <clipPath id={`chartRevealClip-C-${chartCAnimKey}`}>
                <rect
                  key={chartCAnimKey}
                  x="0"
                  y="0"
                  width="0"
                  height={chartHeight}
                  style={{
                    animation: 'chartSweepAnim 850ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
                  }}
                />
              </clipPath>
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

            {/* Horizontal Grid lines */}
            <line x1="0" y1={chartHeight - 24} x2={chartWidth} y2={chartHeight - 24} stroke="var(--border-color)" strokeDasharray="4 4" opacity="0.6" />
            <line x1="0" y1={chartHeight * 0.66} x2={chartWidth} y2={chartHeight * 0.66} stroke="var(--border-color)" strokeDasharray="4 4" opacity="0.4" />
            <line x1="0" y1={chartHeight * 0.33} x2={chartWidth} y2={chartHeight * 0.33} stroke="var(--border-color)" strokeDasharray="4 4" opacity="0.4" />

            {/* Dynamic Vertical Year Grid Lines */}
            {yearTicks.map((tick, i) => (
              <line
                key={`year-grid-${tick.label}-${i}`}
                x1={tick.x}
                y1={0}
                x2={tick.x}
                y2={chartHeight}
                stroke="var(--border-color)"
                strokeDasharray="3 3"
                opacity="0.30"
                className="pointer-events-none"
              />
            ))}

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
                {/* Mobile: 2x Large Lock Pill (sm:hidden) */}
                <g className="sm:hidden" transform={`translate(${proLeftOffset / 2 - 14}, ${chartHeight / 2 - 18})`}>
                  <rect
                    x="0"
                    y="0"
                    width="28"
                    height="36"
                    rx="14"
                    fill="var(--card-surface)"
                    stroke="var(--border-color)"
                    strokeWidth="1.4"
                    className="transition-all duration-300 group-hover:border-[var(--accent-orange)] group-hover:shadow-[0_0_16px_rgba(241,143,1,0.45)] shadow-xs"
                  />
                  <g transform="translate(6.5, 8)">
                    <rect x="0.5" y="6" width="14" height="11" rx="2.5" fill="none" stroke="var(--accent-orange)" strokeWidth="1.8" />
                    <path d="M3.5 6V3.5a3.5 3.5 0 0 1 7 0V6" fill="none" stroke="var(--accent-orange)" strokeWidth="1.8" />
                  </g>
                </g>

                {/* Desktop: 0.8x Compact Minimal Lock Pill (hidden sm:block) */}
                <g className="hidden sm:block" transform={`translate(${proLeftOffset / 2 - 9}, ${chartHeight / 2 - 12})`}>
                  <rect
                    x="0"
                    y="0"
                    width="18"
                    height="24"
                    rx="9"
                    fill="var(--card-surface)"
                    stroke="var(--border-color)"
                    strokeWidth="1.2"
                    className="transition-all duration-300 group-hover:border-[var(--accent-orange)] group-hover:shadow-[0_0_12px_rgba(241,143,1,0.4)] shadow-2xs"
                  />
                  <g transform="translate(4, 5)">
                    <rect x="0.5" y="4.5" width="9" height="7.5" rx="1.5" fill="none" stroke="var(--accent-orange)" strokeWidth="1.4" />
                    <path d="M2.5 4.5V2.5a2 2 0 0 1 4 0V4.5" fill="none" stroke="var(--accent-orange)" strokeWidth="1.4" />
                  </g>
                </g>
              </g>
            )}

            {/* Base Line & Strategy A Curves (Buong Orange) */}
            <g clipPath={`url(#chartRevealClip-base-${chartBaseAnimKey})`}>
              {/* Invested Principal Base Dashed Line */}
              <path
                d={getSvgPath(investedVals)}
                fill="none"
                stroke="#888888"
                strokeWidth="1.5"
                strokeDasharray="3 3"
                className="transition-all duration-500 ease-out"
                style={{ transition: 'd 0.6s cubic-bezier(0.32, 0.72, 0, 1)' }}
              />

              {/* Strategy 1 Curve: Buong Orange */}
              <path
                d={getSvgPath(valsA)}
                fill="none"
                stroke="#F18F01"
                strokeWidth="2.2"
                className="transition-all duration-500 ease-out"
                style={{ transition: 'd 0.6s cubic-bezier(0.32, 0.72, 0, 1)' }}
              />
            </g>

            {/* Strategy 2 Curve: Fintech Emerald (Independent Sweep on Add) */}
            {strategyCount >= 2 && (
              <g clipPath={`url(#chartRevealClip-B-${chartBAnimKey})`}>
                <path
                  d={getSvgPath(valsB)}
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="2.2"
                  className="transition-all duration-500 ease-out"
                  style={{ transition: 'd 0.6s cubic-bezier(0.32, 0.72, 0, 1)' }}
                />
              </g>
            )}

            {/* Strategy 3 Curve: Royal Indigo (Independent Sweep on Add) */}
            {strategyCount >= 3 && (
              <g clipPath={`url(#chartRevealClip-C-${chartCAnimKey})`}>
                <path
                  d={getSvgPath(valsC)}
                  fill="none"
                  stroke="#6366F1"
                  strokeWidth="2.2"
                  className="transition-all duration-500 ease-out"
                  style={{ transition: 'd 0.6s cubic-bezier(0.32, 0.72, 0, 1)' }}
                />
              </g>
            )}

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

          {/* Responsive Native HTML X-Axis Year Timeline Bar (Crisp on Mobile & Desktop) */}
          <div className="relative w-full h-4 select-none pointer-events-none -mt-1 mb-1 px-1">
            {yearTicks.map((tick, i) => (
              <span
                key={`html-year-tick-${tick.label}-${i}`}
                className="absolute text-[11px] sm:text-xs font-mono font-bold text-[var(--text-secondary)] -translate-x-1/2"
                style={{
                  left: `${(tick.x / chartWidth) * 100}%`,
                  ...(i === 0 ? { transform: 'translateX(0%)' } : {}),
                  ...(i === yearTicks.length - 1 ? { transform: 'translateX(-100%)' } : {}),
                }}
              >
                {tick.label}
              </span>
            ))}
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* DYNAMIC MULTI-STRATEGY BUILDER (INSIDE MASTER CARD)  */}
        {/* ---------------------------------------------------- */}
        <SmoothHeight>
          <div className={`w-full grid gap-4 transition-all duration-380 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
              strategyCount === 1 ? 'grid-cols-1' : strategyCount === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            }`}>
              
              {/* STRATEGY A (기본 전략) */}
              <div className="w-full min-w-0 p-4 rounded-2xl bg-[var(--bg-main)]/60 border border-[var(--accent-orange)] space-y-4 shadow-2xs transition-all duration-380 ease-[cubic-bezier(0.2,0.8,0.2,1)]">
                <div className="flex items-center justify-between min-h-[32px] gap-1">
                  <h3 className="text-sm sm:text-base font-black text-[var(--accent-orange)] flex items-center gap-1.5 whitespace-nowrap shrink-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent-orange)] shadow-[0_0_8px_rgba(241,143,1,0.6)]" />
                    기본 전략
                  </h3>

                    <div className="flex items-center gap-1 shrink-0">
                      {/* Strategy Info Tooltip on the left of presets */}
                      <button
                        type="button"
                        onClick={() => setActiveTooltip(activeTooltip === 'strategy_info' ? null : 'strategy_info')}
                        className="text-[var(--text-secondary)] hover:text-[var(--accent-orange)] transition-colors cursor-pointer p-0.5 rounded-full hover:bg-[var(--card-hover)] shrink-0"
                        title="전략 안내"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                      </button>

                      {/* 3-Preset Sliding Pill Toggle */}
                      <div className="relative flex items-center p-0.5 rounded-full bg-[var(--bg-main)]/90 border border-[var(--border-color)] shadow-2xs font-sans">
                        <div
                          className="absolute top-0.5 bottom-0.5 rounded-full bg-[var(--card-surface)] border border-[rgba(241,143,1,0.6)] shadow-[0_0_12px_rgba(241,143,1,0.22)] transition-all duration-380 ease-[cubic-bezier(0.2,0.8,0.2,1)] pointer-events-none"
                          style={{
                            width: 'calc(33.333% - 2px)',
                            left:
                              activePresetA === 'balanced'
                                ? '2px'
                                : activePresetA === 'growth'
                                ? 'calc(33.333% + 1px)'
                                : activePresetA === 'defensive'
                                ? 'calc(66.666% + 0px)'
                                : '2px',
                            opacity: activePresetA ? 1 : 0,
                            transform: activePresetA ? 'scale(1)' : 'scale(0.95)',
                          }}
                        />

                        <button
                          type="button"
                          onClick={() => {
                            setPortfolioA(personalityPresets.balanced.portfolio);
                            setStrategyPeriodA(personalityPresets.balanced.strategyPeriod);
                            setActivePresetA('balanced');
                          }}
                          className={`relative z-10 py-1 px-1.5 sm:px-2 rounded-full text-[10.5px] sm:text-[11px] text-center truncate transition-colors duration-200 active:scale-95 cursor-pointer ${
                            activePresetA === 'balanced'
                              ? 'text-[var(--accent-orange)] font-extrabold'
                              : 'text-[var(--text-secondary)] hover:text-[var(--accent-orange)] font-bold'
                          }`}
                        >
                          균형
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPortfolioA(personalityPresets.growth.portfolio);
                            setStrategyPeriodA(personalityPresets.growth.strategyPeriod);
                            setActivePresetA('growth');
                          }}
                          className={`relative z-10 py-1 px-1.5 sm:px-2 rounded-full text-[10.5px] sm:text-[11px] text-center truncate transition-colors duration-200 active:scale-95 cursor-pointer ${
                            activePresetA === 'growth'
                              ? 'text-[var(--accent-orange)] font-extrabold'
                              : 'text-[var(--text-secondary)] hover:text-[var(--accent-orange)] font-bold'
                          }`}
                        >
                          공격
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPortfolioA(personalityPresets.defensive.portfolio);
                            setStrategyPeriodA(personalityPresets.defensive.strategyPeriod);
                            setActivePresetA('defensive');
                          }}
                          className={`relative z-10 py-1 px-1.5 sm:px-2 rounded-full text-[10.5px] sm:text-[11px] text-center truncate transition-colors duration-200 active:scale-95 cursor-pointer ${
                            activePresetA === 'defensive'
                              ? 'text-[var(--accent-orange)] font-extrabold'
                              : 'text-[var(--text-secondary)] hover:text-[var(--accent-orange)] font-bold'
                          }`}
                        >
                          방어
                        </button>
                      </div>

                      {strategyCount < 3 && (
                        <button
                          type="button"
                          onClick={handleAddStrategy}
                          className="w-7 h-7 rounded-full bg-[var(--bg-main)]/90 border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--accent-orange)] hover:border-[rgba(241,143,1,0.6)] hover:shadow-[0_0_14px_rgba(241,143,1,0.3)] hover:bg-[var(--accent-orange)]/10 active:scale-90 transition-all flex items-center justify-center cursor-pointer shrink-0 shadow-2xs"
                          title="전략 추가"
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Smooth Accordion for Strategy Information with padding container */}
                  <SmoothHeight>
                    {activeTooltip === 'strategy_info' && (
                      <div className="pb-1.5">
                        <div className="p-3.5 rounded-2xl bg-[var(--bg-main)]/90 border border-[var(--border-color)] text-[11px] text-[var(--text-secondary)] leading-relaxed font-medium shadow-2xs">
                          💡 {userProfileCode ? (
                            <span>회원님의 성향 진단(<strong className="text-[var(--accent-orange)] font-mono">{userProfileCode}</strong>) 데이터를 분석하여 최적화된 맞춤형 자산 배분 전략입니다.</span>
                          ) : (
                            <span>대표적인 정석 자산 배분 템플릿 기반의 추천 포트폴리오입니다.</span>
                          )}
                        </div>
                      </div>
                    )}
                  </SmoothHeight>

                  <div className="mt-4">
                    <SmoothHeight>
                      <div className="space-y-2.5">
                        {portfolioA.map((item, index) => (
                          <div key={index} className="p-3 rounded-2xl bg-[var(--bg-main)]/80 border border-[var(--border-color)] space-y-2 transition-colors shadow-2xs">
                            <div className="flex items-center justify-between gap-2">
                              <select
                                value={item.assetId}
                                onChange={(e) => {
                                  setPortfolioA(portfolioA.map((sa, idx) => (idx === index ? { ...sa, assetId: e.target.value } : sa)));
                                  setActivePresetA(null);
                                }}
                                className="select-interactive flex-1 appearance-none text-xs font-bold py-1.5 px-2.5 rounded-lg focus:outline-none focus:border-[var(--accent-orange)] cursor-pointer min-w-0 shadow-2xs"
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

                              <div className="flex items-center gap-1 shrink-0">
                                <input
                                  type="number"
                                  min={0}
                                  max={100}
                                  step={5}
                                  value={item.weight}
                                  onChange={(e) => {
                                    handleUpdateWeightA(index, Math.round(Math.max(0, Math.min(100, Number(e.target.value))) / 5) * 5);
                                    setActivePresetA(null);
                                  }}
                                  className="w-12 bg-[var(--bg-main)]/60 text-xs font-extrabold text-center text-[var(--accent-orange)] py-0.5 rounded-lg border border-[var(--border-color)] focus:outline-none focus:border-[var(--accent-orange)] font-mono"
                                />
                                <span className="text-xs font-bold text-[var(--text-secondary)] font-mono">%</span>
                                {portfolioA.length > 1 && (
                                  <button type="button" onClick={() => { setPortfolioA(portfolioA.filter((_, idx) => idx !== index)); setActivePresetA(null); }} className="text-[var(--text-secondary)] hover:text-red-500 p-0.5 ml-1 transition-all">
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
                                className="flex-1 accent-[var(--accent-orange)] cursor-pointer"
                              />
                              {strategyPeriodA > 0 && (
                                <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] shrink-0 bg-[var(--bg-main)]/60 hover:bg-[var(--card-hover)] px-2 py-0.5 rounded-md border border-[var(--border-color)] hover:border-[var(--accent-orange)]/40 transition-colors">
                                  <input
                                    type="checkbox"
                                    checked={item.enableDefense !== false}
                                    onChange={(e) => {
                                      setPortfolioA(portfolioA.map((sa, idx) => (idx === index ? { ...sa, enableDefense: e.target.checked } : sa)));
                                      setActivePresetA(null);
                                    }}
                                    className="w-3.5 h-3.5 accent-[var(--accent-orange)] rounded cursor-pointer"
                                  />
                                  <span className="text-[10px]">방어 적용</span>
                                </label>
                              )}
                            </div>
                          </div>
                        ))}

                        {portfolioA.length < 6 && (
                          <button
                            type="button"
                            onClick={handleAddSlotA}
                            className="w-full py-2.5 rounded-full border border-[var(--border-color)] bg-[var(--bg-main)]/80 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[rgba(241,143,1,0.5)] hover:bg-[var(--card-hover)] active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                          >
                            <Plus className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                            <span>종목 추가</span>
                          </button>
                        )}

                        <div className="p-3 rounded-2xl bg-[var(--bg-main)]/80 border border-[var(--border-color)] flex items-center justify-between text-xs font-bold">
                          <span className="text-[var(--text-primary)]">현금</span>
                          <span className="font-mono font-extrabold text-[var(--accent-orange)]">{autoCashA}%</span>
                        </div>
                      </div>
                    </SmoothHeight>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[11px] font-bold text-[var(--text-secondary)] flex items-center gap-1">
                        <Lightbulb className="w-3.5 h-3.5 text-[var(--accent-orange)]" />
                        방어 옵션 (이동평균선)
                      </label>
                      <button
                        type="button"
                        onClick={() => setActiveTooltip(activeTooltip === 'defense_a' ? null : 'defense_a')}
                        className={`transition-all p-1 rounded-full hover:bg-[var(--card-hover)] cursor-pointer shrink-0 ${
                          activeTooltip === 'defense_a' ? 'text-[var(--accent-orange)] bg-[var(--card-hover)]' : 'text-[var(--text-secondary)] hover:text-[var(--accent-orange)]'
                        }`}
                        title="방어 옵션 설명"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <SmoothHeight>
                      {activeTooltip === 'defense_a' && (
                        <div className="pb-1.5">
                          <div className="p-3.5 rounded-2xl bg-[var(--bg-main)]/80 border border-[var(--border-color)] text-[11px] text-[var(--text-secondary)] leading-relaxed space-y-1 font-sans">
                            <strong className="text-[var(--text-primary)] block">🛡️ 이동평균선 방어 옵션이란?</strong>
                            <p>시장 변화에 맞춰 적극적으로 대응하는 투자자에게 유용한 옵션입니다. 주가가 일정 기간의 평균 가격선 위로 올라왔을 때만 주식을 사고 보유하며, 평균선 밑으로 떨어지는 하락장에서는 <strong>전액 현금</strong>으로 안전하게 피신합니다.</p>
                          </div>
                        </div>
                      )}
                    </SmoothHeight>
                    <select
                      value={strategyPeriodA}
                      onChange={(e) => {
                        setStrategyPeriodA(Number(e.target.value));
                        setActivePresetA(null);
                      }}
                      className="select-interactive w-full text-xs font-bold p-2.5 rounded-xl focus:outline-none focus:border-[var(--accent-orange)] cursor-pointer shadow-2xs"
                    >
                      <option value={0}>기본 없음 (주식 계속 보유)</option>
                      <option value={50}>50일 평균 가격 기준 (단기 방어)</option>
                      <option value={100}>100일 평균 가격 기준 (중기 균형 방어)</option>
                      <option value={150}>150일 평균 가격 기준 (안정적 방어)</option>
                      <option value={200}>200일 평균 가격 기준 (큰 폭락장 방어)</option>
                    </select>
                  </div>
              </div>

              {/* STRATEGY B (전략 1) */}
            {strategyCount >= 2 && (
              <div className="w-full min-w-0 p-4 rounded-2xl bg-[var(--bg-main)]/60 border border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.12)] space-y-4 transition-all duration-380 ease-[cubic-bezier(0.2,0.8,0.2,1)] animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between min-h-[32px]">
                  <h3 className="text-base font-black text-emerald-500 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                    전략 1
                  </h3>
                  <button
                    type="button"
                    onClick={() => handleRemoveStrategy('B')}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/30 border border-transparent transition-all active:scale-90 cursor-pointer"
                    title="전략 1 삭제"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="mt-4">
                  <SmoothHeight>
                    <div className="space-y-2.5">
                      {portfolioB.map((item, index) => (
                        <div key={index} className="p-3 rounded-2xl bg-[var(--bg-main)]/80 border border-[var(--border-color)] space-y-2 transition-colors shadow-2xs">
                          <div className="flex items-center justify-between gap-2">
                            <select
                              value={item.assetId}
                              onChange={(e) => setPortfolioB(portfolioB.map((sb, idx) => (idx === index ? { ...sb, assetId: e.target.value } : sb)))}
                              className="select-interactive flex-1 appearance-none text-xs font-bold py-1.5 px-2.5 rounded-lg focus:outline-none focus:border-emerald-500 cursor-pointer min-w-0 shadow-2xs"
                            >
                              {SELECT_ASSET_GROUPS.map((grp) => (
                                <optgroup key={grp.groupLabel} label={grp.groupLabel} className="bg-[var(--card-surface)] text-[var(--text-primary)] font-bold">
                                  {grp.options.map((opt) => (
                                    <option key={opt.id} value={opt.id} disabled={portfolioB.some((sb, idx) => idx !== index && sb.assetId === opt.id)}>
                                      {opt.label}
                                    </option>
                                  ))}
                                </optgroup>
                              ))}
                            </select>

                            <div className="flex items-center gap-1 shrink-0">
                              <input
                                type="number"
                                min={0}
                                max={100}
                                step={5}
                                value={item.weight}
                                onChange={(e) => handleUpdateWeightB(index, Math.round(Math.max(0, Math.min(100, Number(e.target.value))) / 5) * 5)}
                                className="w-12 bg-[var(--bg-main)]/60 text-xs font-extrabold text-center text-emerald-500 py-0.5 rounded-lg border border-[var(--border-color)] focus:outline-none focus:border-emerald-500 font-mono"
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
                              className="flex-1 accent-emerald-500 cursor-pointer"
                            />
                            {strategyPeriodB > 0 && (
                              <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] shrink-0 bg-[var(--bg-main)]/60 hover:bg-[var(--card-hover)] px-2 py-0.5 rounded-md border border-[var(--border-color)] hover:border-emerald-500/40 transition-colors">
                                <input
                                  type="checkbox"
                                  checked={item.enableDefense !== false}
                                  onChange={(e) => setPortfolioB(portfolioB.map((sb, idx) => (idx === index ? { ...sb, enableDefense: e.target.checked } : sb)))}
                                  className="w-3.5 h-3.5 accent-emerald-500 rounded cursor-pointer"
                                />
                                <span>방어 적용</span>
                              </label>
                            )}
                          </div>
                        </div>
                      ))}

                      {portfolioB.length < 6 && (
                        <button
                          type="button"
                          onClick={handleAddSlotB}
                          className="w-full py-2.5 rounded-full border border-[var(--border-color)] bg-[var(--bg-main)]/80 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-emerald-500/50 hover:bg-[var(--card-hover)] active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <Plus className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                          <span>종목 추가</span>
                        </button>
                      )}

                      <div className="p-3 rounded-2xl bg-[var(--bg-main)]/80 border border-[var(--border-color)] flex items-center justify-between text-xs font-bold">
                        <span className="text-[var(--text-primary)]">현금</span>
                        <span className="font-mono font-extrabold text-emerald-500">{autoCashB}%</span>
                      </div>
                    </div>
                  </SmoothHeight>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-bold text-[var(--text-secondary)] flex items-center gap-1">
                      <Lightbulb className="w-3.5 h-3.5 text-emerald-500" />
                      방어 옵션 (이동평균선)
                    </label>
                    <button
                      type="button"
                      onClick={() => setActiveTooltip(activeTooltip === 'defense_b' ? null : 'defense_b')}
                      className={`transition-all p-1 rounded-full hover:bg-[var(--card-hover)] cursor-pointer shrink-0 ${
                        activeTooltip === 'defense_b' ? 'text-emerald-500 bg-[var(--card-hover)]' : 'text-[var(--text-secondary)] hover:text-emerald-500'
                      }`}
                      title="방어 옵션 설명"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <SmoothHeight>
                    {activeTooltip === 'defense_b' && (
                      <div className="pb-1.5">
                        <div className="p-3.5 rounded-2xl bg-[var(--bg-main)]/80 border border-[var(--border-color)] text-[11px] text-[var(--text-secondary)] leading-relaxed space-y-1 font-sans">
                          <strong className="text-[var(--text-primary)] block">🛡️ 이동평균선 방어 옵션이란?</strong>
                          <p>시장 변화에 맞춰 적극적으로 대응하는 투자자에게 유용한 옵션입니다. 주가가 일정 기간의 평균 가격선 위로 올라왔을 때만 주식을 사고 보유하며, 평균선 밑으로 떨어지는 하락장에서는 <strong>전액 현금</strong>으로 안전하게 피신합니다.</p>
                        </div>
                      </div>
                    )}
                  </SmoothHeight>
                  <select
                    value={strategyPeriodB}
                    onChange={(e) => setStrategyPeriodB(Number(e.target.value))}
                    className="select-interactive w-full text-xs font-bold p-2.5 rounded-xl focus:outline-none focus:border-emerald-500 cursor-pointer shadow-2xs"
                  >
                    <option value={0}>없음 (주식 계속 보유)</option>
                    <option value={50}>50일 평균 가격 기준 (단기 방어)</option>
                    <option value={100}>100일 평균 가격 기준 (중기 균형 방어)</option>
                    <option value={150}>150일 평균 가격 기준 (안정적 방어)</option>
                    <option value={200}>200일 평균 가격 기준 (큰 폭락장 방어)</option>
                  </select>
                </div>
              </div>
            )}

            {/* STRATEGY C (전략 2) */}
            {strategyCount >= 3 && (
              <div className="w-full min-w-0 p-4 rounded-2xl bg-[var(--bg-main)]/60 border border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.12)] space-y-4 transition-all duration-380 ease-[cubic-bezier(0.2,0.8,0.2,1)] animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between min-h-[32px]">
                  <h3 className="text-base font-black text-indigo-500 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
                    전략 2
                  </h3>
                  <button
                    type="button"
                    onClick={() => handleRemoveStrategy('C')}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/30 border border-transparent transition-all active:scale-90 cursor-pointer"
                    title="전략 2 삭제"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="mt-4">
                  <SmoothHeight>
                    <div className="space-y-2.5">
                      {portfolioC.map((item, index) => (
                        <div key={index} className="p-3 rounded-2xl bg-[var(--bg-main)]/80 border border-[var(--border-color)] space-y-2 transition-colors shadow-2xs">
                          <div className="flex items-center justify-between gap-2">
                            <select
                              value={item.assetId}
                              onChange={(e) => setPortfolioC(portfolioC.map((sc, idx) => (idx === index ? { ...sc, assetId: e.target.value } : sc)))}
                              className="select-interactive flex-1 appearance-none text-xs font-bold py-1.5 px-2.5 rounded-lg focus:outline-none focus:border-indigo-500 cursor-pointer min-w-0 shadow-2xs"
                            >
                              {SELECT_ASSET_GROUPS.map((grp) => (
                                <optgroup key={grp.groupLabel} label={grp.groupLabel} className="bg-[var(--card-surface)] text-[var(--text-primary)] font-bold">
                                  {grp.options.map((opt) => (
                                    <option key={opt.id} value={opt.id} disabled={portfolioC.some((sc, idx) => idx !== index && sc.assetId === opt.id)}>
                                      {opt.label}
                                    </option>
                                  ))}
                                </optgroup>
                              ))}
                            </select>

                            <div className="flex items-center gap-1 shrink-0">
                              <input
                                type="number"
                                min={0}
                                max={100}
                                step={5}
                                value={item.weight}
                                onChange={(e) => handleUpdateWeightC(index, Math.round(Math.max(0, Math.min(100, Number(e.target.value))) / 5) * 5)}
                                className="w-12 bg-[var(--bg-main)]/60 text-xs font-extrabold text-center text-indigo-500 py-0.5 rounded-lg border border-[var(--border-color)] focus:outline-none focus:border-indigo-500 font-mono"
                              />
                              <span className="text-xs font-bold text-[var(--text-secondary)] font-mono">%</span>
                              {portfolioC.length > 1 && (
                                <button type="button" onClick={() => setPortfolioC(portfolioC.filter((_, idx) => idx !== index))} className="text-[var(--text-secondary)] hover:text-red-500 p-0.5 ml-1 transition-all">
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
                              onChange={(e) => handleUpdateWeightC(index, Number(e.target.value))}
                              className="flex-1 accent-indigo-500 cursor-pointer"
                            />
                            {strategyPeriodC > 0 && (
                              <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] shrink-0 bg-[var(--bg-main)]/60 hover:bg-[var(--card-hover)] px-2 py-0.5 rounded-md border border-[var(--border-color)] hover:border-indigo-500/40 transition-colors">
                                <input
                                  type="checkbox"
                                  checked={item.enableDefense !== false}
                                  onChange={(e) => setPortfolioC(portfolioC.map((sc, idx) => (idx === index ? { ...sc, enableDefense: e.target.checked } : sc)))}
                                  className="w-3.5 h-3.5 accent-indigo-500 rounded cursor-pointer"
                                />
                                <span>방어 적용</span>
                              </label>
                            )}
                          </div>
                        </div>
                      ))}

                      {portfolioC.length < 6 && (
                        <button
                          type="button"
                          onClick={handleAddSlotC}
                          className="w-full py-2.5 rounded-full border border-[var(--border-color)] bg-[var(--bg-main)]/80 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-indigo-500/50 hover:bg-[var(--card-hover)] active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <Plus className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                          <span>종목 추가</span>
                        </button>
                      )}

                      <div className="p-3 rounded-2xl bg-[var(--bg-main)]/80 border border-[var(--border-color)] flex items-center justify-between text-xs font-bold">
                        <span className="text-[var(--text-primary)]">현금</span>
                        <span className="font-mono font-extrabold text-indigo-500">{autoCashC}%</span>
                      </div>
                    </div>
                  </SmoothHeight>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-bold text-[var(--text-secondary)] flex items-center gap-1">
                      <Lightbulb className="w-3.5 h-3.5 text-indigo-500" />
                      방어 옵션 (이동평균선)
                    </label>
                    <button
                      type="button"
                      onClick={() => setActiveTooltip(activeTooltip === 'defense_c' ? null : 'defense_c')}
                      className={`transition-all p-1 rounded-full hover:bg-[var(--card-hover)] cursor-pointer shrink-0 ${
                        activeTooltip === 'defense_c' ? 'text-indigo-500 bg-[var(--card-hover)]' : 'text-[var(--text-secondary)] hover:text-indigo-500'
                      }`}
                      title="방어 옵션 설명"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <SmoothHeight>
                    {activeTooltip === 'defense_c' && (
                      <div className="pb-1.5">
                        <div className="p-3.5 rounded-2xl bg-[var(--bg-main)]/80 border border-[var(--border-color)] text-[11px] text-[var(--text-secondary)] leading-relaxed space-y-1 font-sans">
                          <strong className="text-[var(--text-primary)] block">🛡️ 이동평균선 방어 옵션이란?</strong>
                          <p>시장 변화에 맞춰 적극적으로 대응하는 투자자에게 유용한 옵션입니다. 주가가 일정 기간의 평균 가격선 위로 올라왔을 때만 주식을 사고 보유하며, 평균선 밑으로 떨어지는 하락장에서는 <strong>전액 현금</strong>으로 안전하게 피신합니다.</p>
                        </div>
                      </div>
                    )}
                  </SmoothHeight>
                  <select
                    value={strategyPeriodC}
                    onChange={(e) => setStrategyPeriodC(Number(e.target.value))}
                    className="select-interactive w-full text-xs font-bold p-2.5 rounded-xl focus:outline-none focus:border-indigo-500 cursor-pointer shadow-2xs"
                  >
                    <option value={0}>없음 (주식 계속 보유)</option>
                    <option value={50}>50일 평균 가격 기준 (단기 방어)</option>
                    <option value={100}>100일 평균 가격 기준 (중기 균형 방어)</option>
                    <option value={150}>150일 평균 가격 기준 (안정적 방어)</option>
                    <option value={200}>200일 평균 가격 기준 (큰 폭락장 방어)</option>
                  </select>
                </div>
              </div>
            )}

          </div>
        </SmoothHeight>
      </div>
      </RevealOnScroll>

      {/* ---------------------------------------------------- */}
      {/* [STEP 3 MASTER CARD] 최종 성적표                      */}
      {/* ---------------------------------------------------- */}
      <RevealOnScroll delayIndex={3}>
        <div className="glass-card p-5 sm:p-7 rounded-2xl sm:rounded-3xl border border-[var(--border-color)] space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-[var(--accent-orange)]/10 text-[var(--accent-orange)]">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
                  최종 성적표
                </h2>
                <p className="text-[10px] sm:text-[11px] text-[var(--text-secondary)] font-medium">
                  {userProfileCode ? (
                    <span>내 투자 성향(<strong className="text-[var(--accent-orange)] font-mono">{userProfileCode}</strong>) 기준 맞춤 종합 평가 리포트입니다.</span>
                  ) : (
                    <span>미국 시장(S&P 500) 대비 종합 평가 리포트입니다.</span>
                  )}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveTooltip(activeTooltip === 'score_info' ? null : 'score_info')}
              className="p-1 rounded-full hover:bg-[var(--card-hover)] text-[var(--text-secondary)] hover:text-[var(--accent-orange)] transition-colors cursor-pointer"
              title="점수 산출 기준 안내"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>

          <SmoothHeight>
            {activeTooltip === 'score_info' && (
              <div className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-main)]/80 border border-[var(--border-color)] space-y-3.5 text-xs text-[var(--text-secondary)] leading-relaxed">
                <p className="font-bold text-[var(--text-primary)]">
                  💡 미국 대표 시장(S&P 500)과 비교하여 목표를 얼마나 잘 달성하고 위험을 방어했는지 종합 평가합니다.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  <div className="p-3 rounded-xl bg-[var(--card-surface)] border border-[var(--border-color)] space-y-1">
                    <div className="font-bold text-[var(--text-primary)]">
                      1. 목표 수익 (35점)
                    </div>
                    <p className="text-[11px] text-[var(--text-secondary)]">설정하신 목표 연수익률 달성 여부 및 시장 대비 초과 수익을 측정합니다.</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[var(--card-surface)] border border-[var(--border-color)] space-y-1">
                    <div className="font-bold text-[var(--text-primary)]">
                      2. 낙폭 방어 (35점)
                    </div>
                    <p className="text-[11px] text-[var(--text-secondary)]">감내 가능한 최대 손실폭을 지켜냈는지와 하락장에서의 방어력을 평가합니다.</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[var(--card-surface)] border border-[var(--border-color)] space-y-1">
                    <div className="font-bold text-[var(--text-primary)]">
                      3. 하방 효율 (15점)
                    </div>
                    <p className="text-[11px] text-[var(--text-secondary)]">하락할 때 겪는 손실 위험 대비 수익 효율과 하락 후 회복 속도를 평가합니다.</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[var(--card-surface)] border border-[var(--border-color)] space-y-1">
                    <div className="font-bold text-[var(--text-primary)]">
                      4. 실행 지속 (15점)
                    </div>
                    <p className="text-[11px] text-[var(--text-secondary)]">내 투자 스타일에 맞춰 심리적 스트레스 없이 10년 이상 꾸준히 이어갈 수 있는 구조인지 평가합니다.</p>
                  </div>
                </div>
              </div>
            )}
          </SmoothHeight>

          <div className={`grid gap-4 ${
            strategyCount === 1 ? 'grid-cols-1' : strategyCount === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-3'
          }`}>
            <div className={`p-4 rounded-2xl bg-[var(--bg-main)]/60 border border-[var(--accent-orange)] shadow-sm space-y-3 flex flex-col justify-between transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
              scoreBreakdownA.grade === 'S'
                ? 'shadow-[0_0_20px_rgba(241,143,1,0.18)]'
                : scoreBreakdownA.grade === 'A'
                ? 'shadow-[0_0_12px_rgba(241,143,1,0.10)]'
                : ''
            }`}>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[var(--accent-orange)] flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent-orange)] shadow-[0_0_8px_rgba(241,143,1,0.6)]" />
                    기본 전략
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-extrabold border bg-[var(--card-surface)] text-[var(--text-primary)] border-[var(--border-color)] ${
                      scoreBreakdownA.grade === 'S' || scoreBreakdownA.grade === 'A' ? 'font-black' : ''
                    }`}>
                      {scoreBreakdownA.grade}등급
                    </span>
                    <span className="text-lg font-black font-mono text-[var(--accent-orange)]">
                      <AnimatedNumber value={scoreBreakdownA.totalScore} suffix="점" />
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-1 pt-0.5 text-center text-[10px]">
                  <div className="p-1 rounded-lg bg-[var(--card-surface)] border border-[var(--border-color)] shadow-2xs">
                    <div className="text-[var(--text-secondary)] text-[9px]">수익</div>
                    <div className="font-mono font-bold text-[var(--text-primary)]" suppressHydrationWarning>{scoreBreakdownA.scores.returnScore}<span className="text-[8px] text-[var(--text-secondary)] font-normal">/35</span></div>
                  </div>
                  <div className="p-1 rounded-lg bg-[var(--card-surface)] border border-[var(--border-color)] shadow-2xs">
                    <div className="text-[var(--text-secondary)] text-[9px]">방어</div>
                    <div className="font-mono font-bold text-[var(--text-primary)]" suppressHydrationWarning>{scoreBreakdownA.scores.riskScore}<span className="text-[8px] text-[var(--text-secondary)] font-normal">/35</span></div>
                  </div>
                  <div className="p-1 rounded-lg bg-[var(--card-surface)] border border-[var(--border-color)] shadow-2xs">
                    <div className="text-[var(--text-secondary)] text-[9px]">효율</div>
                    <div className="font-mono font-bold text-[var(--text-primary)]" suppressHydrationWarning>{scoreBreakdownA.scores.downsideScore}<span className="text-[8px] text-[var(--text-secondary)] font-normal">/15</span></div>
                  </div>
                  <div className="p-1 rounded-lg bg-[var(--card-surface)] border border-[var(--border-color)] shadow-2xs">
                    <div className="text-[var(--text-secondary)] text-[9px]">지속</div>
                    <div className="font-mono font-bold text-[var(--text-primary)]" suppressHydrationWarning>{scoreBreakdownA.scores.styleScore}<span className="text-[8px] text-[var(--text-secondary)] font-normal">/15</span></div>
                  </div>
                </div>

                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed pt-1" suppressHydrationWarning>
                  {scoreBreakdownA.summaryFeedback}
                </p>
              </div>

              <div className="pt-2 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-secondary)]">최종 자산</span>
                  <span className="font-mono font-extrabold text-[var(--text-primary)]">
                    <AnimatedNumber value={simulation.portA.val} suffix=" 만원" />
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-secondary)]">연수익률</span>
                  <span className="font-mono font-bold text-[var(--accent-orange)]">
                    +<AnimatedNumber value={Number(simulation.portA.cagr)} decimals={1} suffix="% /년" />
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-secondary)]">최대 손실폭</span>
                  <span className="font-mono font-bold text-red-500">
                    -<AnimatedNumber value={Number(simulation.portA.mdd)} decimals={1} suffix="%" />
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2: Strategy 1 (Emerald) */}
            {strategyCount >= 2 && (
              <div className={`p-4 rounded-2xl bg-[var(--bg-main)]/60 border border-emerald-500 shadow-sm space-y-3 flex flex-col justify-between transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] animate-in fade-in zoom-in-95 ${
                scoreBreakdownB.grade === 'S'
                  ? 'shadow-[0_0_20px_rgba(16,185,129,0.22)]'
                  : scoreBreakdownB.grade === 'A'
                  ? 'shadow-[0_0_12px_rgba(16,185,129,0.12)]'
                  : ''
              }`}>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-emerald-500 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                      전략 1
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-extrabold border bg-[var(--card-surface)] text-[var(--text-primary)] border-[var(--border-color)] ${
                        scoreBreakdownB.grade === 'S' || scoreBreakdownB.grade === 'A' ? 'font-black' : ''
                      }`} suppressHydrationWarning>
                        {scoreBreakdownB.grade}등급
                      </span>
                      <span className="text-lg font-black font-mono text-emerald-500">
                        <AnimatedNumber value={scoreBreakdownB.totalScore} suffix="점" />
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-1 pt-0.5 text-center text-[10px]">
                    <div className="p-1 rounded-lg bg-[var(--card-surface)] border border-[var(--border-color)] shadow-2xs">
                      <div className="text-[var(--text-secondary)] text-[9px]">수익</div>
                      <div className="font-mono font-bold text-[var(--text-primary)]" suppressHydrationWarning>{scoreBreakdownB.scores.returnScore}<span className="text-[8px] text-[var(--text-secondary)] font-normal">/35</span></div>
                    </div>
                    <div className="p-1 rounded-lg bg-[var(--card-surface)] border border-[var(--border-color)] shadow-2xs">
                      <div className="text-[var(--text-secondary)] text-[9px]">방어</div>
                      <div className="font-mono font-bold text-[var(--text-primary)]" suppressHydrationWarning>{scoreBreakdownB.scores.riskScore}<span className="text-[8px] text-[var(--text-secondary)] font-normal">/35</span></div>
                    </div>
                    <div className="p-1 rounded-lg bg-[var(--card-surface)] border border-[var(--border-color)] shadow-2xs">
                      <div className="text-[var(--text-secondary)] text-[9px]">효율</div>
                      <div className="font-mono font-bold text-[var(--text-primary)]" suppressHydrationWarning>{scoreBreakdownB.scores.downsideScore}<span className="text-[8px] text-[var(--text-secondary)] font-normal">/15</span></div>
                    </div>
                    <div className="p-1 rounded-lg bg-[var(--card-surface)] border border-[var(--border-color)] shadow-2xs">
                      <div className="text-[var(--text-secondary)] text-[9px]">지속</div>
                      <div className="font-mono font-bold text-[var(--text-primary)]" suppressHydrationWarning>{scoreBreakdownB.scores.styleScore}<span className="text-[8px] text-[var(--text-secondary)] font-normal">/15</span></div>
                    </div>
                  </div>

                  <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed pt-1" suppressHydrationWarning>
                    {scoreBreakdownB.summaryFeedback}
                  </p>
                </div>

                <div className="pt-2 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--text-secondary)]">최종 자산</span>
                    <span className="font-mono font-extrabold text-[var(--text-primary)]">
                      <AnimatedNumber value={simulation.portB.val} suffix=" 만원" />
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--text-secondary)]">연수익률</span>
                    <span className="font-mono font-bold text-emerald-500">
                      +<AnimatedNumber value={Number(simulation.portB.cagr)} decimals={1} suffix="% /년" />
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--text-secondary)]">최대 손실폭</span>
                    <span className="font-mono font-bold text-red-500">
                      -<AnimatedNumber value={Number(simulation.portB.mdd)} decimals={1} suffix="%" />
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Card 3: Strategy 2 (Indigo) */}
            {strategyCount >= 3 && (
              <div className={`p-4 rounded-2xl bg-[var(--bg-main)]/60 border border-indigo-500 shadow-sm space-y-3 flex flex-col justify-between transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] animate-in fade-in zoom-in-95 ${
                scoreBreakdownC.grade === 'S'
                  ? 'shadow-[0_0_20px_rgba(99,102,241,0.22)]'
                  : scoreBreakdownC.grade === 'A'
                  ? 'shadow-[0_0_12px_rgba(99,102,241,0.12)]'
                  : ''
              }`}>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-indigo-500 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
                      전략 2
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-extrabold border bg-[var(--card-surface)] text-[var(--text-primary)] border-[var(--border-color)] ${
                        scoreBreakdownC.grade === 'S' || scoreBreakdownC.grade === 'A' ? 'font-black' : ''
                      }`} suppressHydrationWarning>
                        {scoreBreakdownC.grade}등급
                      </span>
                      <span className="text-lg font-black font-mono text-indigo-500">
                        <AnimatedNumber value={scoreBreakdownC.totalScore} suffix="점" />
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-1 pt-0.5 text-center text-[10px]">
                    <div className="p-1 rounded-lg bg-[var(--card-surface)] border border-[var(--border-color)] shadow-2xs">
                      <div className="text-[var(--text-secondary)] text-[9px]">수익</div>
                      <div className="font-mono font-bold text-[var(--text-primary)]" suppressHydrationWarning>{scoreBreakdownC.scores.returnScore}<span className="text-[8px] text-[var(--text-secondary)] font-normal">/35</span></div>
                    </div>
                    <div className="p-1 rounded-lg bg-[var(--card-surface)] border border-[var(--border-color)] shadow-2xs">
                      <div className="text-[var(--text-secondary)] text-[9px]">방어</div>
                      <div className="font-mono font-bold text-[var(--text-primary)]" suppressHydrationWarning>{scoreBreakdownC.scores.riskScore}<span className="text-[8px] text-[var(--text-secondary)] font-normal">/35</span></div>
                    </div>
                    <div className="p-1 rounded-lg bg-[var(--card-surface)] border border-[var(--border-color)] shadow-2xs">
                      <div className="text-[var(--text-secondary)] text-[9px]">효율</div>
                      <div className="font-mono font-bold text-[var(--text-primary)]" suppressHydrationWarning>{scoreBreakdownC.scores.downsideScore}<span className="text-[8px] text-[var(--text-secondary)] font-normal">/15</span></div>
                    </div>
                    <div className="p-1 rounded-lg bg-[var(--card-surface)] border border-[var(--border-color)] shadow-2xs">
                      <div className="text-[var(--text-secondary)] text-[9px]">지속</div>
                      <div className="font-mono font-bold text-[var(--text-primary)]" suppressHydrationWarning>{scoreBreakdownC.scores.styleScore}<span className="text-[8px] text-[var(--text-secondary)] font-normal">/15</span></div>
                    </div>
                  </div>

                  <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed pt-1" suppressHydrationWarning>
                    {scoreBreakdownC.summaryFeedback}
                  </p>
                </div>

                <div className="pt-2 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--text-secondary)]">최종 자산</span>
                    <span className="font-mono font-extrabold text-[var(--text-primary)]">
                      <AnimatedNumber value={simulation.portC.val} suffix=" 만원" />
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--text-secondary)]">연수익률</span>
                    <span className="font-mono font-bold text-indigo-500">
                      +<AnimatedNumber value={Number(simulation.portC.cagr)} decimals={1} suffix="% /년" />
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--text-secondary)]">최대 손실폭</span>
                    <span className="font-mono font-bold text-red-500">
                      -<AnimatedNumber value={Number(simulation.portC.mdd)} decimals={1} suffix="%" />
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </RevealOnScroll>

      {/* ---------------------------------------------------- */}
      {/* Dynamic Data Synthesis Notice & Disclaimer           */}
      {/* ---------------------------------------------------- */}
      <RevealOnScroll>
        <div className="p-4 rounded-2xl bg-[var(--bg-main)]/80 border border-[var(--border-color)] space-y-1.5 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-[var(--text-secondary)]">
            <AlertTriangle className="w-4 h-4 text-[var(--accent-orange)] shrink-0" />
            <span>결과 안내 및 과거 데이터 산출 방식</span>
          </div>
          <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed font-medium">
            본 도구는 Yahoo Finance의 30년 실제 데이터를 기반으로 작동됩니다. 매달 설정하신 금액을 적립하고 선택한 방어 옵션에 맞춰 자동 리밸런싱됩니다. 단, 일부 종목의 과거 데이터는 기초 지수 움직임을 기반으로 추론 계산하였으며, 과거 데이터 결과가 미래의 수익을 보장하지 않습니다.
          </p>
        </div>
      </RevealOnScroll>
    </div>
  );
}

export default function SimulatorPage() {
  return (
    <Suspense fallback={<div className="max-w-4xl mx-auto p-8 text-center text-sm font-bold">로딩 중...</div>}>
      <SimulatorContent />
    </Suspense>
  );
}
