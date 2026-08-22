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
  HelpCircle,
  Phone,
  KeyRound,
  Unlock,
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
    desc: "해외주식 거래 이용신청과 미국 실시간 시세(무료)를 신청합니다."
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
    desc: "호가창을 확인하고 지정가 1주를 구매하며, 정정/취소 원리를 익힙니다."
  },
  {
    id: 5,
    stepNum: 5,
    title: "5단계: 보유자산 확인 & 통합증거금",
    shortTitle: "자산확인",
    icon: <PieChart className="w-5 h-5 text-[var(--accent-orange)]" />,
    desc: "구매한 주식의 평가손익과 환율 변동 대비 5% 가계산 정산 원리를 확인합니다."
  },
  {
    id: 6,
    stepNum: 6,
    title: "6단계: 주식 팔기 & 출금 안내",
    shortTitle: "주식팔기",
    icon: <ArrowDownToLine className="w-5 h-5 text-[var(--accent-orange)]" />,
    desc: "보유 주식을 팔고(매도), 이틀 뒤 결제일에 출금 가능한 원리를 익힙니다."
  }
];

const STEP1_SUBSTEPS = [
  { num: 1, title: "1. 하단 메뉴 넘겨 설정 진입", desc: "홈 화면 하단 메뉴를 오른쪽으로 넘겨 [설정 ⚙️]을 누릅니다." },
  { num: 2, title: "2. 핵심 메뉴 4개만 남기고 저장", desc: "홈, 해외주식주문, 보유자산현황, 실시간환전만 남기고 [저장]합니다." },
  { num: 3, title: "3. 해외 전용 퀵메뉴 Off", desc: "전체메뉴 ➔ 맨 아래 [설정] ➔ '해외주식 전용 퀵메뉴 사용' 토글을 끕니다." }
];

const STEP2_SUBSTEPS = [
  { num: 1, title: "1. 서비스신청 메뉴 진입", desc: "전체메뉴 ➔ 상단 [해외주식] ➔ 좌측 [서비스신청]으로 들어갑니다." },
  { num: 2, title: "2. 해외주식거래 이용신청", desc: "[해외주식거래이용신청]에서 거래신청 및 통합증거금 '이용중'을 확인/신청합니다." },
  { num: 3, title: "3. 미국 실시간 시세 무료 신청", desc: "[해외주식실시간시세신청]에서 🇺🇸 미국(0.0 USD) [신청]을 누릅니다." }
];

const STEP3_SUBSTEPS = [
  { num: 1, title: "1. 보유자산 예수금(100만 원) 확인", desc: "하단 [보유자산]에서 종합매매 계좌에 입금된 투자금을 확인합니다." },
  { num: 2, title: "2. 해외주식주문 종목명 터치", desc: "하단 [해외주식주문] ➔ 왼쪽 위 종목명(예: 애플 ▾)을 누릅니다." },
  { num: 3, title: "3. 'SPYM' 검색 및 선택", desc: "검색창에 'spym'을 입력하고 S&P 500 ETF를 선택합니다." }
];

const STEP4_SUBSTEPS = [
  { num: 1, title: "1. 호가창 & 지정가 선택", desc: "파란색(매도호가)과 빨간색(매수호가)을 확인하고 [지정가]를 선택합니다." },
  { num: 2, title: "2. 수량입력기 1주 입력", desc: "[수량] 필드를 눌러 수량입력기에서 [1주] 입력 후 [확인]을 누릅니다." },
  { num: 3, title: "3. 구매 주문 & 즉시 체결", desc: "빨간색 [매수] ➔ 주문확인 팝업 승인 시 통합증거금으로 즉시 체결됩니다." },
  { num: 4, title: "4. [정정/취소] 대기 주문 실습", desc: "낮은 가격 주문 시 미체결 대기 상태가 되며, 가격 정정으로 즉시 체결할 수 있습니다." }
];

const STEP5_SUBSTEPS = [
  { num: 1, title: "1. 보유자산현황 진입", desc: "하단 [보유자산] 탭을 눌러 내 계좌로 들어갑니다." },
  { num: 2, title: "2. 구매한 SPYM 주식 확인", desc: "계좌에 SPYM 주식이 정상 입고되었는지 실시간 평가손익을 확인합니다." },
  { num: 3, title: "3. 통합증거금 5% 원리", desc: "환율 변동 대비로 5% 정도 임시 묶어둔 뒤, 결제일(D+2)에 남은 돈은 자동 환급됩니다." }
];

const STEP6_SUBSTEPS = [
  { num: 1, title: "1. 보유 주식 [팔기(매도)] 터치", desc: "해외주식주문 또는 보유자산에서 [팔기(매도)] 탭을 선택합니다." },
  { num: 2, title: "2. 수량 및 가격 입력 후 매도", desc: "팔고 싶은 수량(1~2주)을 입력하고 빨간색 [매도]를 누릅니다." },
  { num: 3, title: "3. 예수금 복귀 & D+2 결제일 출금", desc: "판매 대금은 이틀 뒤(D+2)에 정산 완료되어 자유롭게 출금할 수 있습니다." }
];

const CONTACT_LIST = [
  {
    role: "DB증권 고객센터",
    desc: "계좌 개설, 시세 신청, 한도제한 해제",
    contact: "1588-4200",
    href: "tel:1588-4200",
    icon: <Phone className="w-4 h-4 text-emerald-500" />
  },
  {
    role: "해외주식 야간 데스크",
    desc: "야간 미국 주식 주문 및 체결 문의",
    contact: "02-369-3400",
    href: "tel:02-369-3400",
    icon: <Phone className="w-4 h-4 text-blue-500" />
  },
  {
    role: "주식부엉 공식 상담톡",
    desc: "실습 단계별 궁금증 1:1 안내",
    contact: "카카오톡 채널 문의",
    href: "https://pf.kakao.com",
    icon: <HelpCircle className="w-4 h-4 text-[var(--accent-orange)]" />
  }
];

export default function StockTradeGuide() {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [currentScene, setCurrentScene] = useState<1 | 2 | 3 | 4>(1);

  const getSubsteps = (step: number) => {
    switch (step) {
      case 1: return STEP1_SUBSTEPS;
      case 2: return STEP2_SUBSTEPS;
      case 3: return STEP3_SUBSTEPS;
      case 4: return STEP4_SUBSTEPS;
      case 5: return STEP5_SUBSTEPS;
      case 6: return STEP6_SUBSTEPS;
      default: return STEP1_SUBSTEPS;
    }
  };

  const currentSubsteps = getSubsteps(currentStep);

  const handleStepChange = (newStep: 1 | 2 | 3 | 4 | 5 | 6) => {
    setCurrentStep(newStep);
    setCurrentScene(1);
  };

  const handleNextStep = () => {
    if (currentStep < 6) {
      handleStepChange((currentStep + 1) as 1 | 2 | 3 | 4 | 5 | 6);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      handleStepChange((currentStep - 1) as 1 | 2 | 3 | 4 | 5 | 6);
    }
  };

  return (
    <div className="glass-card p-5 sm:p-7 rounded-2xl sm:rounded-3xl shadow-2xs space-y-6">
      {/* Guide Header */}
      <div className="space-y-1.5 border-b border-[var(--border-color)] pb-4">
        <div className="flex items-center gap-2.5">
          <span className="p-1.5 rounded-xl bg-[var(--accent-orange)]/15 text-[var(--accent-orange)]">
            <Sparkles className="w-5 h-5" />
          </span>
          <h3 className="text-lg sm:text-xl font-extrabold tracking-tight text-[var(--text-primary)]">
            실전 주식 구매 실습 가이드
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium pl-9 leading-relaxed">
          실제 증권사 앱 화면을 바탕으로 화면 세팅부터 SPYM 구매, 자산 확인 및 매도까지 단계별로 완벽하게 따라 해보세요.
        </p>
      </div>

      {/* 6-Step Top Tab Slider Navigator */}
      <div className="relative p-1.5 rounded-2xl bg-[var(--card-hover)] border border-[var(--border-color)]">
        <div className="grid grid-cols-6 gap-1 relative z-10">
          {STEPS.map((s) => {
            const isActive = currentStep === s.stepNum;
            return (
              <button
                key={s.id}
                onClick={() => handleStepChange(s.stepNum as 1 | 2 | 3 | 4 | 5 | 6)}
                className={`py-2 px-1 sm:px-2 rounded-xl text-center font-extrabold transition-all duration-300 flex flex-col items-center gap-1 ${
                  isActive
                    ? 'text-white'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <span className="text-[10px] sm:text-xs tracking-tight truncate max-w-full">
                  {s.shortTitle}
                </span>
                <span className={`w-1.5 h-1.5 rounded-full transition-all ${
                  isActive ? 'bg-white scale-125' : 'bg-transparent'
                }`} />
              </button>
            );
          })}
        </div>

        {/* Sliding Indicator */}
        <div 
          className="absolute top-1.5 bottom-1.5 rounded-xl bg-gradient-to-r from-[var(--accent-orange)] to-amber-500 shadow-md transition-all duration-300 ease-out"
          style={{
            width: 'calc(16.666% - 3px)',
            left: `calc(${(currentStep - 1) * 16.666}% + 1.5px)`
          }}
        />
      </div>

      {/* Main Content Card */}
      <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-[var(--card-surface)]/90 border border-[var(--border-color)] space-y-4">
        {/* Step Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-color)]/60 pb-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-[var(--accent-orange)] text-white text-[11px] font-black">
                STEP 0{currentStep}
              </span>
              <h4 className="text-base sm:text-lg font-black text-[var(--text-primary)]">
                {STEPS[currentStep - 1].title}
              </h4>
            </div>
            <p className="text-xs text-[var(--text-secondary)] font-medium">
              {STEPS[currentStep - 1].desc}
            </p>
          </div>

          {/* Previous / Next Controls */}
          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            <button
              onClick={handlePrevStep}
              disabled={currentStep === 1}
              className={`p-2 rounded-xl border border-[var(--border-color)] transition-all ${
                currentStep === 1 
                  ? 'opacity-30 cursor-not-allowed' 
                  : 'hover:border-[var(--accent-orange)] hover:bg-[var(--card-hover)] text-[var(--text-primary)]'
              }`}
              title="이전 단계"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono font-bold text-[var(--text-secondary)] px-1">
              {currentStep} / 6
            </span>
            <button
              onClick={handleNextStep}
              disabled={currentStep === 6}
              className={`p-2 rounded-xl border border-[var(--border-color)] transition-all ${
                currentStep === 6 
                  ? 'opacity-30 cursor-not-allowed' 
                  : 'hover:border-[var(--accent-orange)] hover:bg-[var(--card-hover)] text-[var(--text-primary)]'
              }`}
              title="다음 단계"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Substep Interactive Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {currentSubsteps.map((sub, idx) => {
            const sceneNum = (idx + 1) as 1 | 2 | 3 | 4;
            const isSelected = currentScene === sceneNum;
            return (
              <button
                key={idx}
                onClick={() => setCurrentScene(sceneNum)}
                className={`p-3 rounded-xl border text-left transition-all space-y-1 ${
                  isSelected
                    ? 'border-[var(--accent-orange)] bg-[var(--accent-orange)]/10 shadow-xs ring-1 ring-[var(--accent-orange)]/40'
                    : 'border-[var(--border-color)] bg-white/60 dark:bg-zinc-800/60 hover:bg-[var(--card-hover)]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-black ${
                    isSelected ? 'text-[var(--accent-orange)]' : 'text-[var(--text-primary)]'
                  }`}>
                    {sub.title}
                  </span>
                  {isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-orange)] animate-pulse" />
                  )}
                </div>
                <p className="text-[11px] text-[var(--text-secondary)] font-medium leading-snug line-clamp-2">
                  {sub.desc}
                </p>
              </button>
            );
          })}
        </div>

        {/* Dynamic Motion Simulator (100% Video Matched) */}
        <div className="pt-2">
          <StockTradeMotionSimulator 
            step={currentStep}
            scene={currentScene}
          />
        </div>

        {/* STEP 4 & 6 SPECIAL BONUS TIPS: 소수점 매매 & 한도제한계좌 해제 */}
        {currentStep === 4 && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2 animate-fadeIn">
            <div className="flex items-center gap-2 text-sm font-extrabold text-amber-700 dark:text-amber-300">
              <span className="p-1 rounded-lg bg-amber-500/20">
                <Coins className="w-4 h-4" />
              </span>
              <span>[보너스 실습] 소액 투자자를 위한 소수점 매매</span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-medium">
              1주 금액이 부담스러운 경우, <span className="font-bold text-[var(--text-primary)]">메뉴 ➔ 해외주식 ➔ 소수점주문</span>에서 10,000원 등 원하는 금액 단위로 자유롭게 쪼개서 구매하실 수 있습니다.
            </p>
          </div>
        )}

        {currentStep === 6 && (
          <div className="space-y-4 pt-2 animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-white/80 dark:bg-zinc-800/80 border border-[var(--border-color)] space-y-2">
                <div className="flex items-center gap-2 text-sm font-extrabold text-[var(--text-primary)]">
                  <span className="p-1.5 rounded-lg bg-[var(--accent-orange)]/15 text-[var(--accent-orange)]">
                    <KeyRound className="w-4 h-4" />
                  </span>
                  <span>모바일 OTP 발급</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-medium">
                  수익금 출금 및 이체를 위해 모바일 OTP를 미리 발급해 두세요.
                </p>
                <div className="text-[11px] font-bold text-[var(--accent-orange)] bg-[var(--card-hover)] p-2 rounded-lg">
                  경로: 메뉴 ➔ 모바일지점 ➔ 인증/OTP ➔ 모바일OTP 발급
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/80 dark:bg-zinc-800/80 border border-[var(--border-color)] space-y-2">
                <div className="flex items-center gap-2 text-sm font-extrabold text-[var(--text-primary)]">
                  <span className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-600">
                    <Unlock className="w-4 h-4" />
                  </span>
                  <span>한도제한계좌 자동 해제</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-medium">
                  주식을 100만 원 이상 구매하시면 영업일 기준 3~4일 뒤 이체 한도가 자동으로 완전히 풀립니다.
                </p>
                <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-[var(--card-hover)] p-2 rounded-lg">
                  첫 주식 구매 시 자동 처리
                </div>
              </div>
            </div>

            {/* Official Support & Contact Section */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-[var(--card-hover)] to-transparent border border-[var(--border-color)] space-y-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-[var(--accent-orange)] text-white">
                  <HelpCircle className="w-4 h-4" />
                </span>
                <h5 className="text-sm sm:text-base font-extrabold text-[var(--text-primary)]">
                  실습 및 거래 문의처
                </h5>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                {CONTACT_LIST.map((c, cIdx) => (
                  <a
                    key={cIdx}
                    href={c.href}
                    className="p-3.5 rounded-xl bg-white/90 dark:bg-zinc-800/90 border border-[var(--border-color)] hover:border-[var(--accent-orange)]/60 hover:shadow-sm transition-all flex flex-col justify-between space-y-2 group"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        {c.icon}
                        <span className="font-extrabold text-xs text-[var(--text-primary)]">
                          {c.role}
                        </span>
                      </div>
                      <div className="text-[11px] text-[var(--text-secondary)] font-medium line-clamp-1">
                        {c.desc}
                      </div>
                    </div>

                    <div className="pt-1.5 border-t border-[var(--border-color)]/40 flex items-center justify-between">
                      <span className="font-mono font-black text-xs text-[var(--accent-orange)] group-hover:underline">
                        {c.contact}
                      </span>
                      <span className="text-[10px] text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] font-bold">
                        연결 ➔
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
