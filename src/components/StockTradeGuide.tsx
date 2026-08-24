'use client';

import React, { useState } from 'react';
import { 
  Sliders,
  CheckCircle2, 
  Search, 
  ShoppingBag,
  PieChart, 
  ArrowDownToLine, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles,
  Zap,
  Coins
} from 'lucide-react';
import StockTradeMotionSimulator from '@/components/StockTradeMotionSimulator';

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
    title: "1단계: 화면 퀵메뉴 설정",
    shortTitle: "화면설정",
    icon: <Sliders className="w-5 h-5 text-[var(--accent-orange)]" />,
    desc: "하단 메뉴를 깔끔하게 정돈하고 해외 전용 퀵메뉴 토글을 끕니다."
  },
  {
    id: 2,
    stepNum: 2,
    title: "2단계: 해외주식 서비스 신청",
    shortTitle: "서비스신청",
    icon: <CheckCircle2 className="w-5 h-5 text-[var(--accent-orange)]" />,
    desc: "해외주식 거래 이용신청과 해외주식 실시간 시세를 신청합니다."
  },
  {
    id: 3,
    stepNum: 3,
    title: "3단계: 투자금 확인 & 종목 검색",
    shortTitle: "종목검색",
    icon: <Search className="w-5 h-5 text-[var(--accent-orange)]" />,
    desc: "종합매매 계좌의 예수금을 확인하고 S&P 500 종목인 SPYM을 검색합니다."
  },
  {
    id: 4,
    stepNum: 4,
    title: "4단계: 주식 구매 실습 (SPYM)",
    shortTitle: "주식구매",
    icon: <ShoppingBag className="w-5 h-5 text-[var(--accent-orange)]" />,
    desc: "수량을 입력하고 빨간색 매수 버튼을 눌러 원화로 즉시 구매합니다."
  },
  {
    id: 5,
    stepNum: 5,
    title: "5단계: 보유 주식 확인 & 주식 팔기(매도)",
    shortTitle: "자산확인·팔기",
    icon: <ArrowDownToLine className="w-5 h-5 text-[var(--accent-orange)]" />,
    desc: "구매한 주식의 평가손익을 확인하고, 원하는 시점에 주식을 팔아 출금하는 원리를 익힙니다."
  }
];

const STEP1_SUBSTEPS = [
  { num: 1, title: "하단 메뉴 넘겨 설정 진입", desc: "홈 화면 하단 메뉴를 오른쪽으로 넘겨 [설정]을 누릅니다." },
  { num: 2, title: "핵심 메뉴만 남기고 저장", desc: "홈, 해외주식주문, 보유자산현황, 실시간환전만 남기고 저장합니다." },
  { num: 3, title: "해외 전용 퀵메뉴 끄기", desc: "전체메뉴 ➔ 맨 아래 [설정] ➔ '해외주식 전용 퀵메뉴 사용' 토글을 끕니다." }
];

const STEP2_SUBSTEPS = [
  { num: 1, title: "서비스신청 메뉴 진입", desc: "홈 화면 [메뉴] ➔ [해외주식] ➔ 좌측 [서비스신청]으로 들어갑니다." },
  { num: 2, title: "해외주식거래 이용신청", desc: "[해외주식거래이용신청]에서 거래신청 및 통합증거금 '이용중'을 확인/신청합니다." },
  { num: 3, title: "해외주식 실시간 시세 신청", desc: "[해외주식실시간시세신청] ➔ 무료 실시간 시세 신청을 진행합니다." }
];

const STEP3_SUBSTEPS = [
  { num: 1, title: "보유자산 확인", desc: "홈 화면 하단 [보유자산]을 눌러 내 계좌 잔고를 확인합니다." },
  { num: 2, title: "해외주식주문 종목명 터치", desc: "하단 [해외주식주문] ➔ 왼쪽 위 종목명(예: 애플 ▾)을 누릅니다." },
  { num: 3, title: "'SPYM' 검색 및 선택", desc: "검색창에 'spym'을 입력하고 S&P 500 ETF를 선택합니다." }
];

const STEP4_SUBSTEPS = [
  { num: 1, title: "구매 수량 1주 입력", desc: "[수량] 칸을 눌러 키패드에서 1주를 입력하고 [확인]을 누릅니다." },
  { num: 2, title: "주식 구매(매수) 주문", desc: "빨간색 [매수] ➔ 팝업에서 [확인]을 누르면 원화로 즉시 구매됩니다." },
  { num: 3, title: "구매 체결 내역 확인", desc: "[주문체결] 탭에서 내 주식이 잘 사졌는지 실시간 확인합니다." }
];

const STEP5_SUBSTEPS = [
  { num: 1, title: "보유자산에서 내 주식 확인", desc: "하단 [보유자산] 탭에서 내가 산 SPYM 주식과 평가손익을 확인합니다." },
  { num: 2, title: "보유 주식 [팔기(매도)] 터치", desc: "내 주식 목록에서 [팔기(매도)] 탭을 누릅니다." },
  { num: 3, title: "판매 수량 입력 후 매도", desc: "팔고 싶은 수량(1주)을 입력하고 파란색 [매도]를 누릅니다." },
  { num: 4, title: "D+2 결제일 및 출금 안내", desc: "판매 대금은 이틀 뒤(D+2)에 정산 완료되어 자유롭게 출금할 수 있습니다." }
];

export default function StockTradeGuide() {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [currentScene, setCurrentScene] = useState<1 | 2 | 3 | 4>(1);

  const getSubsteps = (step: number) => {
    switch (step) {
      case 1: return STEP1_SUBSTEPS;
      case 2: return STEP2_SUBSTEPS;
      case 3: return STEP3_SUBSTEPS;
      case 4: return STEP4_SUBSTEPS;
      case 5: return STEP5_SUBSTEPS;
      default: return STEP1_SUBSTEPS;
    }
  };

  const currentSubsteps = getSubsteps(currentStep);

  const handleStepChange = (newStep: 1 | 2 | 3 | 4 | 5) => {
    setCurrentStep(newStep);
    setCurrentScene(1);
  };

  const handleNext = () => {
    const subCount = getSubsteps(currentStep).length;
    if (currentScene < subCount) {
      setCurrentScene((prev) => (prev + 1) as 1 | 2 | 3 | 4);
    } else if (currentStep < 5) {
      setCurrentStep((prev) => (prev + 1) as 1 | 2 | 3 | 4 | 5);
      setCurrentScene(1);
    }
  };

  const handlePrev = () => {
    if (currentScene > 1) {
      setCurrentScene((prev) => (prev - 1) as 1 | 2 | 3 | 4);
    } else if (currentStep > 1) {
      const prevStep = (currentStep - 1) as 1 | 2 | 3 | 4 | 5;
      const prevSubCount = getSubsteps(prevStep).length;
      setCurrentStep(prevStep);
      setCurrentScene(prevSubCount as 1 | 2 | 3 | 4);
    }
  };

  return (
    <div className="glass-card rounded-3xl p-4 sm:p-7 border border-[var(--border-color)]/90 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-color)]/60 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-[var(--accent-orange)]/15 text-[var(--accent-orange)]">
              <Sparkles className="w-5 h-5" />
            </span>
            <h3 className="text-lg sm:text-xl font-extrabold text-[var(--text-primary)]">
              실전 주식 구매 실습 가이드
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium pl-8">
            실제 증권사 앱 화면을 바탕으로 단계별로 따라 해보세요.
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

      {/* 5-Step Top Tab Navigation with Sliding Pill Animation */}
      <div className="relative p-1 rounded-2xl bg-[var(--card-hover)]/80 border border-[var(--border-color)]/50 select-none">
        <div className="grid grid-cols-5 relative">
          {/* Liquid Sliding Pill Highlight */}
          <div 
            className="absolute top-0 bottom-0 rounded-xl bg-white dark:bg-zinc-800 border border-[var(--accent-orange)]/45 shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none"
            style={{
              width: '20%',
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
                onClick={() => handleStepChange(s.stepNum as 1 | 2 | 3 | 4 | 5)}
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

      {/* Main Active Step Card */}
      <div className="p-4 sm:p-6 rounded-2xl bg-white/60 dark:bg-zinc-900/40 border border-[var(--border-color)] space-y-5">
        {/* Step Title Header */}
        <div className="flex items-center gap-2.5 border-b border-[var(--border-color)]/60 pb-3">
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
          <div className={`grid grid-cols-1 ${currentSubsteps.length === 4 ? 'sm:grid-cols-2' : 'sm:grid-cols-3'} gap-2.5`}>
            {currentSubsteps.map((sub) => {
              const sceneNum = sub.num as 1 | 2 | 3 | 4;
              const isActive = currentScene === sceneNum;
              return (
                <button
                  key={sub.num}
                  type="button"
                  onClick={() => setCurrentScene(sceneNum)}
                  className={`p-3 rounded-2xl text-left border transition-all duration-200 flex items-start gap-2.5 ${
                    isActive
                      ? 'bg-[var(--accent-orange)]/10 border-[var(--accent-orange)]/60 shadow-sm scale-[1.01]'
                      : 'bg-white/80 dark:bg-zinc-800/60 border-[var(--border-color)] hover:border-[var(--accent-orange)]/30'
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

          {/* Dynamic Motion Simulator */}
          <div className="pt-2">
            <StockTradeMotionSimulator 
              step={currentStep}
              scene={currentScene}
            />
          </div>
        </div>

        {/* STEP 4: 시장가 즉시 구매 팁 & 소수점 매매 */}
        {currentStep === 4 && (
          <div className="space-y-3 pt-1 animate-fadeIn">
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1.5">
              <div className="flex items-center gap-2 text-sm font-extrabold text-amber-700 dark:text-amber-300">
                <span className="p-1 rounded-lg bg-amber-500/20">
                  <Zap className="w-4 h-4" />
                </span>
                <span>[핵심 팁] 시장가 즉시 구매 안내</span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-medium">
                내가 정한 가격(지정가) 대신 지금 파는 가격으로 바로 사고 싶다면 <span className="font-bold text-[var(--text-primary)]">[시장가]</span>를 누르고 수량(1주)만 입력해서 구매하시면 즉시 체결됩니다.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/80 dark:bg-zinc-800/80 border border-[var(--border-color)] space-y-1.5">
              <div className="flex items-center gap-2 text-sm font-extrabold text-[var(--text-primary)]">
                <span className="p-1 rounded-lg bg-[var(--accent-orange)]/15 text-[var(--accent-orange)]">
                  <Coins className="w-4 h-4" />
                </span>
                <span>[보너스 실습] 소액 투자자를 위한 소수점 매매</span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-medium">
                1주 금액이 부담스러운 경우, <span className="font-bold text-[var(--text-primary)]">메뉴 ➔ 해외주식 ➔ 소수점주문</span>에서 10,000원 등 원하는 금액 단위로 자유롭게 쪼개서 구매하실 수 있습니다.
              </p>
            </div>
          </div>
        )}

        {/* STEP 5: 통합증거금 5% 원리 안내 */}
        {currentStep === 5 && (
          <div className="space-y-4 pt-2 animate-fadeIn">
            {/* 5% 통합증거금 원리 안내 */}
            <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 space-y-1.5">
              <div className="flex items-center gap-2 text-sm font-extrabold text-blue-700 dark:text-blue-300">
                <span className="p-1 rounded-lg bg-blue-500/20">
                  <PieChart className="w-4 h-4" />
                </span>
                <span>통합증거금 5% 가계산 정산 원리</span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-medium">
                달러 환전 없이 원화로 주식을 살 때는 야간 환율 변동에 대비하여 약 5%를 임시로 묶어두며, 이틀 뒤(D+2) 결제일에 실제 환율로 정산되어 남은 차액은 계좌로 자동 환급됩니다.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Prev / Next Navigation Buttons (1-3 Style) */}
      <div className="flex items-center justify-between pt-2 gap-3">
        <button
          type="button"
          onClick={handlePrev}
          disabled={currentStep === 1 && currentScene === 1}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition-all ${
            currentStep === 1 && currentScene === 1
              ? 'opacity-40 cursor-not-allowed border-transparent text-[var(--text-secondary)]'
              : 'bg-white dark:bg-zinc-800 border-[var(--border-color)] text-[var(--text-primary)] hover:border-[var(--accent-orange)]/50 shadow-2xs'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          이전 단계
        </button>

        {currentStep < 5 || currentScene < getSubsteps(5).length ? (
          <button
            type="button"
            onClick={handleNext}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[var(--accent-orange)] hover:bg-[#d97706] text-white transition-all shadow-xs"
          >
            다음 단계
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => handleStepChange(1)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[var(--card-hover)] border border-[var(--border-color)] text-[var(--text-primary)] hover:border-[var(--accent-orange)]/50 transition-all"
          >
            처음부터 다시 보기
          </button>
        )}
      </div>
    </div>
  );
}
