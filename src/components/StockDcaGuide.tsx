'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calendar,
  Search, 
  CheckCircle2, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  Star,
  Zap,
  TrendingUp,
  Shield,
  Coins,
  Layers,
  Info,
  Building,
  Check,
  ChevronDown
} from 'lucide-react';
import StockDcaMotionSimulator from '@/components/StockDcaMotionSimulator';
import SmoothHeight from '@/components/SmoothHeight';

import RevealOnScroll from '@/components/common/RevealOnScroll';

interface StepData {
  id: number;
  stepNum: number;
  title: string;
  shortTitle: string;
  icon: React.ReactNode;
  desc: string;
}

const STEPS: StepData[] = [
  {
    id: 1,
    stepNum: 1,
    title: "1단계: 메뉴 진입 & 투자 방식 설정",
    shortTitle: "방식설정",
    icon: <Calendar className="w-5 h-5 text-[var(--accent-orange)]" />,
    desc: "해외주식 주식 모으기 메뉴로 들어가 투자 주기와 배당금 자동재투자를 설정합니다."
  },
  {
    id: 2,
    stepNum: 2,
    title: "2단계: 투자금액 입력 & 종목 검색 (SPYM)",
    shortTitle: "금액·종목",
    icon: <Search className="w-5 h-5 text-[var(--accent-orange)]" />,
    desc: "내가 원하는 1회 투자금액을 입력하고, 모아갈 주식(SPYM)을 검색해 담습니다."
  },
  {
    id: 3,
    stepNum: 3,
    title: "3단계: 비율 구성 & 주식 모으기 신청",
    shortTitle: "비율·신청",
    icon: <CheckCircle2 className="w-5 h-5 text-[var(--accent-orange)]" />,
    desc: "종목별 투자 비율을 확인하고, 신청 버튼을 눌러 기계적 자동 투자를 시작합니다."
  },
  {
    id: 4,
    stepNum: 4,
    title: "4단계: 추천 포트폴리오 살펴보기",
    shortTitle: "추천포트",
    icon: <Sparkles className="w-5 h-5 text-[var(--accent-orange)]" />,
    desc: "혼자 구성하기 어렵다면 검증된 포트폴리오를 둘러보고 그대로 활용할 수 있습니다."
  }
];

const STEP1_SUBSTEPS = [
  { num: 1, title: "주식 모으기 메뉴 진입", desc: "홈 [메뉴] ➔ [해외주식] ➔ [주식 모으기]를 누릅니다." },
  { num: 2, title: "투자 주기 및 날짜 선택", desc: "직장인이라면 월급날에 맞춰 '매월'로 설정하고 원하는 날짜를 선택합니다." },
  { num: 3, title: "배당금 자동재투자 체크", desc: "'배당금 입금 시 자동매수'를 체크하여 보너스를 다시 복리로 굴립니다." }
];

const STEP2_SUBSTEPS = [
  { num: 1, title: "1회 투자금액 입력", desc: "매월 투자할 금액(예: 10만 원 등 각자의 여건에 맞게)을 자유롭게 입력합니다." },
  { num: 2, title: "투자종목추가 터치", desc: "[+ 투자종목추가] 버튼을 눌러 종목 검색 화면을 엽니다." },
  { num: 3, title: "SPYM 검색 및 선택", desc: "검색창에 'SPYM'을 입력하고 미국 S&P 500 ETF를 선택해 목록에 담습니다." }
];

const STEP3_SUBSTEPS = [
  { num: 1, title: "투자 비율 확인", desc: "선택한 종목의 비율(단독 100% 또는 여러 종목 분배)을 점검합니다." },
  { num: 2, title: "신청 내역 확인 및 완료", desc: "[확인]을 누르고 [주식 모으기 신청]을 완료하면 매달 자동으로 구매됩니다." }
];

const STEP4_SUBSTEPS = [
  { num: 1, title: "추천 포트폴리오 진입", desc: "앱 내 [추천 포트폴리오] 탭을 눌러 검증된 테마 조합들을 확인합니다." },
  { num: 2, title: "테마별 조합 및 비율 확인", desc: "미국배당주, 1등 기업, 올웨더 등 다양한 목적의 비율 구성을 둘러봅니다." },
  { num: 3, title: "초보자를 위한 최선의 정답", desc: "복잡하다면 미국 1등부터 500등을 모은 S&P 500 하나만 모아도 가장 훌륭합니다." }
];

// 6 Featured Portfolios
interface PortfolioItem {
  id: string;
  title: string;
  badge: string;
  badgeColor: string;
  description: string;
  returns: number; // 1-5
  safety: number;  // 1-5
  dividend: number;// 1-5
  stocks: { name: string; symbol: string; ratio: string }[];
}

const PORTFOLIOS: PortfolioItem[] = [
  {
    id: 'us-dividend',
    title: '미국배당주 투자하기',
    badge: '배당·방어형',
    badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
    description: '하락장에서도 잘 버티고 배당금을 주는 튼튼한 기업만 모았기에 안전하게 돈을 지키면서 제2의 월급도 챙기고 싶은 분들께 정답입니다.',
    returns: 3,
    safety: 4,
    dividend: 4,
    stocks: [
      { name: '애플', symbol: 'AAPL', ratio: '6.67%' },
      { name: '애브비', symbol: 'ABBV', ratio: '6.67%' },
      { name: '에이버리 데니슨', symbol: 'AVY', ratio: '6.67%' },
      { name: '시스코 시스템즈', symbol: 'CSCO', ratio: '6.67%' },
      { name: 'CVS 헬스', symbol: 'CVS', ratio: '6.67%' },
      { name: '듀크 에너지', symbol: 'DUK', ratio: '6.67%' },
      { name: 'FMC', symbol: 'FMC', ratio: '6.67%' },
      { name: '골드만삭스', symbol: 'GS', ratio: '6.67%' },
      { name: '존슨 앤드 존슨', symbol: 'JNJ', ratio: '6.67%' },
      { name: '록히드 마틴', symbol: 'LMT', ratio: '6.67%' },
      { name: '머크', symbol: 'MRK', ratio: '6.67%' },
      { name: '마이크로소프트', symbol: 'MSFT', ratio: '6.67%' },
      { name: '화이자', symbol: 'PFE', ratio: '6.67%' },
      { name: '프록터 앤드 갬블', symbol: 'PG', ratio: '6.67%' },
      { name: '스타벅스', symbol: 'SBUX', ratio: '6.67%' }
    ]
  },
  {
    id: 'global-top',
    title: '세계 1등 기업에 투자',
    badge: '성장·공격형',
    badgeColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30',
    description: '전 세계에서 돈을 제일 잘 버는 1등 회사 15개에 투자하는 조합이라서, 떨어질 땐 크게 떨어지더라도 오를 땐 더 크게 오릅니다.',
    returns: 5,
    safety: 2,
    dividend: 1,
    stocks: [
      { name: '애플', symbol: 'AAPL', ratio: '6.67%' },
      { name: '아마존닷컴', symbol: 'AMZN', ratio: '6.67%' },
      { name: 'ASML 홀딩', symbol: 'ASML', ratio: '6.67%' },
      { name: '보잉', symbol: 'BA', ratio: '6.67%' },
      { name: '캐터필러', symbol: 'CAT', ratio: '6.67%' },
      { name: '코카콜라', symbol: 'KO', ratio: '6.67%' },
      { name: '맥도날드', symbol: 'MCD', ratio: '6.67%' },
      { name: '넷플릭스', symbol: 'NFLX', ratio: '6.67%' },
      { name: '나이키', symbol: 'NKE', ratio: '6.67%' },
      { name: '엔비디아', symbol: 'NVDA', ratio: '6.67%' },
      { name: '스타벅스', symbol: 'SBUX', ratio: '6.67%' },
      { name: '테슬라', symbol: 'TSLA', ratio: '6.67%' },
      { name: 'TSMC', symbol: 'TSM', ratio: '6.67%' },
      { name: '비자', symbol: 'V', ratio: '6.67%' },
      { name: '엑슨 모빌', symbol: 'XOM', ratio: '6.67%' }
    ]
  },
  {
    id: 'monthly-rent',
    title: '월세 대신 월배당 받기',
    badge: '현금흐름형',
    badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    description: '주식 자체가 오르는 것보다 통장에 현금이 꽂히는 것에 집중했기에, 나중에 큰돈을 만지기보다 당장 건물주처럼 월세를 받고 싶은 분들께 정답입니다.',
    returns: 2,
    safety: 3,
    dividend: 5,
    stocks: [
      { name: '배당 ETF', symbol: 'DGRW', ratio: '12.5%' },
      { name: '미국 국채 중기', symbol: 'IEF', ratio: '12.5%' },
      { name: '배당 ETF', symbol: 'JEPI', ratio: '12.5%' },
      { name: '배당 ETF', symbol: 'JEPQ', ratio: '12.5%' },
      { name: '배당 ETF', symbol: 'PFF', ratio: '12.5%' },
      { name: '배당 ETF', symbol: 'SPHD', ratio: '12.5%' },
      { name: '미국 국채 장기', symbol: 'TLT', ratio: '12.5%' },
      { name: '배당 ETF', symbol: 'XYLD', ratio: '12.5%' }
    ]
  },
  {
    id: 'all-weather',
    title: "'레이달리오' 따라잡기 (올웨더 포트폴리오)",
    badge: '철벽방어형',
    badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
    description: '금과 채권, 원자재 등을 섞어 경제 위기에도 내 돈을 방어하도록 설계되었으므로, 돈을 많이 버는 것보다 절대 잃지 않는 것이 최우선인 분들께 정답입니다.',
    returns: 2,
    safety: 5,
    dividend: 2,
    stocks: [
      { name: '금', symbol: 'GLD', ratio: '16.67%' },
      { name: '미국 국채 중기', symbol: 'IEF', ratio: '16.67%' },
      { name: '나스닥 100', symbol: 'QQQ', ratio: '16.67%' },
      { name: 'S&P 500', symbol: 'SPY', ratio: '16.67%' },
      { name: '미국 국채 장기', symbol: 'TLT', ratio: '16.67%' },
      { name: '에너지 산업 ETF', symbol: 'XLE', ratio: '16.67%' }
    ]
  },
  {
    id: 'index-tracking',
    title: '미국지수 따라잡기',
    badge: '표준균형형',
    badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30',
    description: '가장 기초적인 투자인 S&P 500 절반과 최고의 기술을 가진 회사 100개를 모은 나스닥 100을 함께 투자하여, 적당한 안전함을 챙기면서도 수익률을 챙겼습니다.',
    returns: 4,
    safety: 2,
    dividend: 2,
    stocks: [
      { name: '나스닥 100', symbol: 'QQQ', ratio: '50%' },
      { name: 'S&P 500', symbol: 'SPY', ratio: '50%' }
    ]
  },
  {
    id: 'stock-bond',
    title: '주식+채권 분산투자',
    badge: '중립안정형',
    badgeColor: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30',
    description: '주식을 절반만 넣고, 하락을 막아줄 미국 국채 절반을 섞어 방어력을 크게 높였으므로, 주식이 떨어지더라도 스트레스 없이 투자하고 싶은 분들께 정답입니다.',
    returns: 2,
    safety: 4,
    dividend: 2,
    stocks: [
      { name: '미국 국채 중기', symbol: 'IEF', ratio: '25%' },
      { name: '나스닥 100', symbol: 'QQQ', ratio: '25%' },
      { name: 'S&P 500', symbol: 'SPY', ratio: '25%' },
      { name: '미국 국채 장기', symbol: 'TLT', ratio: '25%' }
    ]
  }
];

function RatingStars({ value, colorClass, animate = true }: { value: number; colorClass: string; animate?: boolean }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((idx) => {
        const isFilled = idx <= value;
        return (
          <Star
            key={idx}
            style={{
              transitionDelay: animate && isFilled ? `${idx * 80}ms` : '0ms'
            }}
            className={`w-3.5 h-3.5 transition-all duration-500 ${
              isFilled
                ? `${colorClass} fill-current scale-100 opacity-100`
                : 'text-zinc-300 dark:text-zinc-700 opacity-40 scale-90'
            }`}
          />
        );
      })}
    </div>
  );
}

function AnimatedRatioStockCard({
  name,
  symbol,
  ratio,
  index
}: {
  name: string;
  symbol: string;
  ratio: string;
  index: number;
}) {
  const targetNumber = parseFloat(ratio.replace('%', '')) || 0;
  const [displayRatio, setDisplayRatio] = useState(0);
  const [progressWidth, setProgressWidth] = useState(0);

  useEffect(() => {
    let animationFrameId: number;
    const startTime = performance.now();
    const duration = 650; // ms
    const delay = Math.min(index * 35, 300);

    const startTimer = setTimeout(() => {
      setProgressWidth(targetNumber);

      const updateCount = (currentTime: number) => {
        const elapsed = currentTime - (startTime + delay);
        if (elapsed < 0) {
          animationFrameId = requestAnimationFrame(updateCount);
          return;
        }

        const progress = Math.min(elapsed / duration, 1);
        // Easing: easeOutCubic
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const currentVal = easeProgress * targetNumber;
        setDisplayRatio(currentVal);

        if (progress < 1) {
          animationFrameId = requestAnimationFrame(updateCount);
        } else {
          setDisplayRatio(targetNumber);
        }
      };

      animationFrameId = requestAnimationFrame(updateCount);
    }, delay);

    return () => {
      clearTimeout(startTimer);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [targetNumber, index]);

  const formattedRatio = targetNumber % 1 === 0 
    ? `${displayRatio.toFixed(0)}%` 
    : targetNumber.toString().split('.')[1]?.length === 1
    ? `${displayRatio.toFixed(1)}%`
    : `${displayRatio.toFixed(2)}%`;

  return (
    <div className="relative overflow-hidden flex flex-col justify-between p-2.5 rounded-xl bg-[var(--card-surface)] border border-[var(--border-color)] text-xs shadow-2xs hover:border-[var(--accent-orange)]/50 hover:shadow-[0_0_12px_rgba(241,143,1,0.15)] transition-all">
      <div className="flex items-center justify-between gap-1.5 min-w-0 pb-1">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="font-bold text-[var(--text-primary)] truncate">{name}</span>
          <span className="text-[10px] font-mono text-[var(--text-secondary)] shrink-0">({symbol})</span>
        </div>
        <span className="font-mono font-black text-[var(--accent-orange)] ml-2 shrink-0 tabular-nums">
          {formattedRatio}
        </span>
      </div>

      {/* Mini Progress Bar */}
      <div className="w-full bg-[var(--card-hover)] h-1 rounded-full overflow-hidden mt-1">
        <div 
          className="bg-gradient-to-r from-[var(--accent-orange)] to-amber-400 h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${Math.min(progressWidth * 2, 100)}%` }}
        />
      </div>
    </div>
  );
}

export default function StockDcaGuide() {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [currentScene, setCurrentScene] = useState<1 | 2 | 3>(1);
  const [expandedPortfolios, setExpandedPortfolios] = useState<Record<string, boolean>>({});

  const togglePortfolio = (id: string) => {
    setExpandedPortfolios((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const getSubsteps = (step: number) => {
    switch (step) {
      case 1: return STEP1_SUBSTEPS;
      case 2: return STEP2_SUBSTEPS;
      case 3: return STEP3_SUBSTEPS;
      case 4: return STEP4_SUBSTEPS;
      default: return STEP1_SUBSTEPS;
    }
  };

  const currentSubsteps = getSubsteps(currentStep);

  const handleStepChange = (newStep: 1 | 2 | 3 | 4) => {
    setCurrentStep(newStep);
    setCurrentScene(1);
  };

  const handleNext = () => {
    const subCount = getSubsteps(currentStep).length;
    if (currentScene < subCount) {
      setCurrentScene((prev) => (prev + 1) as 1 | 2 | 3);
    } else if (currentStep < 4) {
      setCurrentStep((prev) => (prev + 1) as 1 | 2 | 3 | 4);
      setCurrentScene(1);
    }
  };

  const handlePrev = () => {
    if (currentScene > 1) {
      setCurrentScene((prev) => (prev - 1) as 1 | 2 | 3);
    } else if (currentStep > 1) {
      const prevStep = (currentStep - 1) as 1 | 2 | 3 | 4;
      const prevSubCount = getSubsteps(prevStep).length;
      setCurrentStep(prevStep);
      setCurrentScene(prevSubCount as 1 | 2 | 3);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upper Main Guide Card */}
      <div className="glass-card rounded-3xl p-4 sm:p-7 border border-[var(--border-color)]/90 shadow-sm space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-[var(--accent-orange)]/15 text-[var(--accent-orange)]">
                <Sparkles className="w-5 h-5" />
              </span>
              <h3 className="text-lg sm:text-xl font-extrabold text-[var(--text-primary)]">
                실전 주식 모으기 가이드
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium pl-8">
              감정을 배제하고 매월 기계적으로 사 모으는 스마트폰 설정법을 확인하세요.
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center gap-1.5 self-start sm:self-center px-3 py-1 rounded-full bg-[var(--card-hover)] border border-[var(--border-color)]/80 text-xs font-bold text-[var(--accent-orange)] whitespace-nowrap">
            <span>단계</span>
            <span className="font-extrabold">{currentStep}</span>
            <span className="text-[var(--text-secondary)]">/</span>
            <span className="text-[var(--text-secondary)]">{STEPS.length}</span>
          </div>
        </div>

        {/* 4-Step Top Tab Navigation with Sliding Pill */}
        <div className="relative p-1 rounded-2xl bg-[var(--card-hover)]/80 border border-[var(--border-color)]/50 select-none">
          <div className="grid grid-cols-4 relative">
            {/* Sliding Pill Highlight */}
            <div 
              className="absolute top-0 bottom-0 rounded-xl bg-white dark:bg-zinc-800 border border-[var(--accent-orange)]/45 shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none"
              style={{
                width: '25%',
                transform: `translateX(${(currentStep - 1) * 100}%)`,
              }}
            />

            {STEPS.map((s) => {
              const isActive = currentStep === s.stepNum;
              const isDone = s.stepNum < currentStep;

              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleStepChange(s.stepNum as 1 | 2 | 3 | 4)}
                  className={`relative z-10 flex flex-col items-center justify-center py-2 px-0.5 text-center transition-colors duration-200 ${
                    isActive
                      ? 'text-[var(--accent-orange)] font-extrabold'
                      : isDone
                      ? 'text-[var(--emerald)] hover:text-[var(--text-primary)] font-semibold'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium'
                  }`}
                >
                  <span className="text-[9px] sm:text-[11px] leading-tight tracking-tighter opacity-80 whitespace-nowrap">
                    {isDone ? '완료' : `STEP 0${s.stepNum}`}
                  </span>
                  <span className="text-[11px] sm:text-sm font-bold tracking-tight whitespace-nowrap mt-0.5">
                    {s.shortTitle}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Active Step Content with SmoothHeight */}
        <SmoothHeight duration={450}>
          <div className="p-4 sm:p-6 rounded-2xl bg-white/60 dark:bg-zinc-900/40 border border-[var(--border-color)] space-y-5">
            {/* Step Title Header */}
            <div className="flex items-center gap-2.5 pb-1">
              <span className="p-2 rounded-xl bg-[var(--accent-orange)]/15 text-[var(--accent-orange)]">
                {STEPS[currentStep - 1].icon}
              </span>
              <div className="space-y-0.5">
                <h4 className="text-base sm:text-lg font-black text-[var(--text-primary)]">
                  {STEPS[currentStep - 1].title}
                </h4>
                <p className="text-xs text-[var(--text-secondary)] font-medium">
                  {STEPS[currentStep - 1].desc}
                </p>
              </div>
            </div>

            {/* Substep Interactive Cards */}
            <div className="space-y-4 pt-1">
              <div className={`grid grid-cols-1 ${currentSubsteps.length === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-3'} gap-2.5`}>
                {currentSubsteps.map((sub) => {
                  const sceneNum = sub.num as 1 | 2 | 3;
                  const isActive = currentScene === sceneNum;
                  return (
                    <button
                      key={sub.num}
                      type="button"
                      onClick={() => setCurrentScene(sceneNum)}
                      className={`p-3 rounded-2xl text-left border transition-all duration-200 flex items-start gap-2.5 cursor-pointer ${
                        isActive
                          ? 'bg-[var(--accent-orange)]/10 border-[rgba(241,143,1,0.65)] shadow-xs scale-[1.01]'
                          : 'bg-white/80 dark:bg-zinc-800/60 border-[var(--border-color)] hover:border-[rgba(241,143,1,0.5)] hover:shadow-[0_0_14px_rgba(241,143,1,0.18)] hover:scale-[1.01] active:scale-[0.99]'
                      }`}
                    >
                      <span className={`w-5 h-5 rounded-full font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 ${
                        isActive 
                        ? 'bg-[var(--accent-orange)] text-white' 
                        : 'bg-[var(--card-hover)] text-[var(--text-secondary)]'
                      }`}>
                        {sub.num}
                      </span>
                      <div className="space-y-0.5 flex-1">
                        <div className={`text-xs sm:text-sm font-bold ${
                          isActive ? 'text-[var(--accent-orange)]' : 'text-[var(--text-primary)]'
                        }`}>
                          {sub.title}
                        </div>
                        <div className="text-[11px] text-[var(--text-secondary)] leading-relaxed line-clamp-2">
                          {sub.desc}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Smartphone Simulator */}
              <div className="pt-2">
                <StockDcaMotionSimulator 
                  step={currentStep}
                  scene={currentScene}
                />
              </div>
            </div>

            {/* Contextual Tips depending on Step */}
            {currentStep === 1 && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1.5 animate-fadeIn">
                <div className="flex items-center gap-2 text-sm font-extrabold text-amber-700 dark:text-amber-300">
                  <Sparkles className="w-4 h-4" />
                  <span>[핵심 팁] 배당금 자동재투자(DRIP)의 위력</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-medium">
                  주식에서 나오는 배당금을 계좌에 그대로 두지 않고 즉시 재투자하면, 원금뿐만 아니라 불어난 배당금까지 함께 일하게 되어 <span className="font-bold text-[var(--text-primary)]">복리의 눈덩이 효과</span>가 한층 빨라집니다.
                </p>
              </div>
            )}

            {currentStep === 2 && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-1.5 animate-fadeIn">
                <div className="flex items-center gap-2 text-sm font-extrabold text-emerald-700 dark:text-emerald-300">
                  <Coins className="w-4 h-4" />
                  <span>[투자금액 팁] 내 그릇에 맞는 금액으로 정하기</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-medium">
                  투자 금액에는 정답이 없습니다. 매월 5만 원이든 10만 원이든, 주식 가격이 떨어지더라도 밤에 편안히 잠들 수 있는 <span className="font-bold text-[var(--text-primary)]">내 마음에 여유를 주는 금액</span>으로 시작하는 것이 꾸준한 투자의 핵심입니다.
                </p>
              </div>
            )}

            {currentStep === 3 && (
              <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 space-y-1.5 animate-fadeIn">
                <div className="flex items-center gap-2 text-sm font-extrabold text-blue-700 dark:text-blue-300">
                  <Layers className="w-4 h-4" />
                  <span>[실전 안내] 주식 모으기 실행 방식</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-medium">
                  주식 모으기를 신청해 두면 증권사에서 매월 지정일에 맞춰 <span className="font-bold text-[var(--text-primary)]">원화 예수금으로 미국 주식을 자동 구매</span>해 줍니다. 별도로 환전해둘 필요 없이 계좌에 원화만 입금해 두시면 됩니다.
                </p>
              </div>
            )}

            {currentStep === 4 && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1.5 animate-fadeIn">
                <div className="flex items-center gap-2 text-sm font-extrabold text-amber-700 dark:text-amber-300">
                  <Sparkles className="w-4 h-4" />
                  <span>[가장 훌륭한 정답] S&P 500 단독 투자</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-medium">
                  어떤 포트폴리오를 골라야 할지 복잡하고 망설여진다면 굳이 고민할 필요 없습니다. 미국의 1등부터 500등 대표 기업을 한 바구니에 담은 <span className="font-bold text-[var(--text-primary)]">S&P 500(SPYM) 하나만 모아가는 것</span>이 평범한 우리에게는 언제나 가장 완벽하고 검증된 정답입니다.
                </p>
              </div>
            )}
          </div>
        </SmoothHeight>

        {/* Prev / Next Navigation Buttons */}
        <div className="flex items-center justify-between pt-2 gap-3">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentStep === 1 && currentScene === 1}
            className={`flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold border transition-all ${
              currentStep === 1 && currentScene === 1
                ? 'opacity-40 cursor-not-allowed border-transparent text-[var(--text-secondary)]'
                : 'bg-white dark:bg-zinc-800 border-[var(--border-color)] text-[var(--text-primary)] hover:border-[rgba(241,143,1,0.5)] hover:shadow-[0_0_14px_rgba(241,143,1,0.18)] hover:text-[var(--accent-orange)] hover:bg-[var(--accent-orange)]/10 active:scale-95 shadow-2xs cursor-pointer'
            }`}
          >
            <ChevronLeft className="w-4 h-4 stroke-[1.7]" />
            이전 단계
          </button>

          {currentStep < 4 || currentScene < getSubsteps(4).length ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold bg-[var(--accent-orange)] hover:brightness-110 hover:shadow-[0_0_18px_rgba(241,143,1,0.35)] active:scale-95 text-white transition-all shadow-2xs cursor-pointer"
            >
              다음 단계
              <ChevronRight className="w-4 h-4 stroke-[1.7]" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleStepChange(1)}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold bg-[var(--card-hover)] border border-[var(--border-color)] text-[var(--text-primary)] hover:border-[rgba(241,143,1,0.5)] hover:shadow-[0_0_14px_rgba(241,143,1,0.18)] hover:text-[var(--accent-orange)] hover:bg-[var(--accent-orange)]/10 active:scale-95 transition-all shadow-2xs cursor-pointer"
            >
              처음부터 다시 보기
            </button>
          )}
        </div>
      </div>

      {/* LOWER SECTION: 추천 포트폴리오 6종 상세 도감 (RevealOnScroll Wrapped & Clean Borderless Header) */}
      <RevealOnScroll delayIndex={1}>
        <div className="glass-card rounded-3xl p-5 sm:p-8 border border-[var(--border-color)] shadow-sm space-y-6">
          {/* Clean Header without bottom dividing line */}
          <div className="space-y-1.5 pb-2">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-[var(--accent-orange)]/15 text-[var(--accent-orange)]">
                <Layers className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-[var(--text-primary)]">
                  추천 포트폴리오 6종 상세 도감
                </h3>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium">
                  목적에 맞춰 검증된 투자 조합입니다. 타 증권사를 쓰더라도 이 종목과 비율을 메모해 직접 구성할 수 있습니다.
                </p>
              </div>
            </div>
          </div>

          {/* 6 Portfolios List with Independent SmoothHeight (Expanding one won't distort another) */}
          <div className="space-y-3.5">
            {PORTFOLIOS.map((item) => {
              const isExpanded = !!expandedPortfolios[item.id];

              return (
                <div
                  key={item.id}
                  className={`rounded-2xl transition-all duration-300 overflow-hidden ${
                    isExpanded
                      ? 'glass-card border-[var(--accent-orange)] ring-1 ring-[var(--accent-orange)] shadow-[0_0_20px_rgba(241,143,1,0.20)]'
                      : 'bg-[var(--card-surface)]/80 border border-[var(--border-color)] hover:border-[var(--accent-orange)]/50 hover:shadow-[0_0_15px_rgba(241,143,1,0.15)] shadow-2xs'
                  }`}
                >
                  {/* Card Header Button */}
                  <button
                    type="button"
                    onClick={() => togglePortfolio(item.id)}
                    className="w-full p-4 sm:p-5 text-left flex items-start justify-between gap-4 cursor-pointer outline-none focus:outline-none"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      {/* Badge on its own line above title */}
                      <div>
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10.5px] font-extrabold border ${item.badgeColor}`}>
                          {item.badge}
                        </span>
                      </div>

                      {/* Title clearly positioned under badge */}
                      <h4 className="text-base sm:text-lg font-black text-[var(--text-primary)]">
                        {item.title}
                      </h4>

                      <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium leading-relaxed pt-0.5">
                        {item.description}
                      </p>
                    </div>

                    <div className="p-1.5 rounded-xl bg-[var(--card-hover)] text-[var(--text-secondary)] shrink-0 mt-1">
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-300 ${
                          isExpanded ? 'rotate-180 text-[var(--accent-orange)]' : ''
                        }`}
                      />
                    </div>
                  </button>

                  {/* Score Ratings Bar (Clean signature token styling) */}
                  <div className="px-4 sm:px-5 py-3 bg-[var(--card-hover)]/50 grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[11px] font-bold text-[var(--text-secondary)]">수익성</span>
                      <RatingStars value={item.returns} colorClass="text-[var(--accent-orange)]" />
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[11px] font-bold text-[var(--text-secondary)]">안정성</span>
                      <RatingStars value={item.safety} colorClass="text-[var(--emerald)]" />
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[11px] font-bold text-[var(--text-secondary)]">배당금</span>
                      <RatingStars value={item.dividend} colorClass="text-blue-500" />
                    </div>
                  </div>

                  {/* SmoothHeight Accordion for Stock Content */}
                  <SmoothHeight duration={400}>
                    {isExpanded ? (
                      <div className="p-4 sm:p-5 space-y-3 bg-[var(--bg-main)]/60">
                        <div className="flex items-center justify-between text-xs sm:text-sm font-black text-[var(--text-primary)]">
                          <span>구성 종목 및 추천 비중</span>
                          <span className="text-xs font-mono text-[var(--accent-orange)] font-extrabold">총 {item.stocks.length}개 종목</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                          {item.stocks.map((stk, sIdx) => (
                            <AnimatedRatioStockCard
                              key={sIdx}
                              name={stk.name}
                              symbol={stk.symbol}
                              ratio={stk.ratio}
                              index={sIdx}
                            />
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </SmoothHeight>
                </div>
              );
            })}
          </div>
        </div>
      </RevealOnScroll>
    </div>
  );
}
