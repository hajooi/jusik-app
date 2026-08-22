'use client';

import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Sparkles, 
  Target, 
  CheckCircle2, 
  Lightbulb, 
  ChevronLeft, 
  ChevronRight, 
  ExternalLink, 
  Download, 
  ArrowRight,
  Maximize2,
  X,
  HelpCircle,
  ShieldCheck,
  Check,
  Mail,
  Phone,
  Building,
  KeyRound,
  Unlock
} from 'lucide-react';
import AccountOpenMotionSimulator from '@/components/AccountOpenMotionSimulator';
import AdvisoryMotionSimulator from '@/components/AdvisoryMotionSimulator';
import OverseasBenefitMotionSimulator from '@/components/OverseasBenefitMotionSimulator';

interface StepData {
  id: number;
  stepNum: number;
  title: string;
  shortTitle: string;
  icon: React.ReactNode;
  breadcrumbs?: string[];
  details: string[];
  tips?: string;
  image?: string;
  imageAlt?: string;
  appDownload?: {
    appName: string;
    iosUrl: string;
    androidUrl: string;
  }[];
  ctaForm?: {
    title: string;
    description: string;
    buttonText: string;
    buttonUrl: string;
  };
}

const STEPS: StepData[] = [
  {
    id: 1,
    stepNum: 1,
    title: "1단계: 준비물 (앱 2종 설치)",
    shortTitle: "준비물",
    icon: <Smartphone className="w-5 h-5 text-[var(--accent-orange)]" />,
    details: [
      "DB증권 앱: 실제 비대면 계좌 개설 및 주식 거래, 자산 관리용",
      "DB증권 자문사 앱: 최초 1회 수수료 평생 우대 혜택 연동용"
    ],
    appDownload: [
      {
        appName: "DB증권 앱",
        iosUrl: "https://apps.apple.com/kr/app/db%EC%A6%9D%EA%B6%8C-mts-%EC%95%8C%ED%8C%8C%EC%A6%9D%EA%B6%8C/id1603371564",
        androidUrl: "https://play.google.com/store/apps/details?id=com.dbfi.xts&pcampaignid=web_share"
      },
      {
        appName: "DB증권 자문사 앱",
        iosUrl: "https://apps.apple.com/kr/app/db%EC%A6%9D%EA%B6%8C-%EC%9E%90%EB%AC%B8%EC%84%9C%EB%B9%84%EC%8A%A4/id1572772436",
        androidUrl: "https://play.google.com/store/apps/details?id=com.koscom.ktamp&pcampaignid=web_share"
      }
    ]
  },
  {
    id: 2,
    stepNum: 2,
    title: "2단계: DB증권 비대면 계좌 개설",
    shortTitle: "계좌개설",
    icon: <Sparkles className="w-5 h-5 text-[var(--accent-orange)]" />,
    details: [
      "1. 비대면 계좌개설 시작: 약관 동의 및 비대면 계좌 개설 절차를 시작합니다.",
      "2. FA종합매매계좌 선택: 화면을 아래로 내려 [FA자문사 연계 계좌] ➔ [FA종합매매계좌]를 선택합니다.",
      "3. 관리점 정보 입력: 관리지점에 [강남금융센터], 관리자에 [김주호]를 입력합니다.",
      "4. 비대면 계좌개설 완료: 본인 인증 및 계좌 개설 절차가 성공적으로 마무리됩니다."
    ]
  },
  {
    id: 3,
    stepNum: 3,
    title: "3단계: 수수료 우대 연동",
    shortTitle: "우대연동",
    icon: <Target className="w-5 h-5 text-[var(--accent-orange)]" />,
    details: [
      "1. 자문사 앱 가입 & 분석: 자문사 앱 실행 후 [1분 투자로 가입하기] 또는 로그인 ➔ 간단한 [투자성향 분석]을 완료합니다.",
      "2. 오로라투자자문 선택: 홈 화면에서 [자문사 찾기]를 누른 후 자문사 목록에서 [오로라투자자문]을 찾아 선택합니다.",
      "3. 오로라x주식부엉 자율형MP: 운용포트폴리오에서 [오로라x주식부엉 자율형MP]를 누르고 [포트폴리오 투자하기]를 누릅니다.",
      "4. 계좌연결 완료: 개설 계좌를 선택하고 연동 절차를 완료하면 평생 우대 혜택이 연결됩니다."
    ]
  },
  {
    id: 4,
    stepNum: 4,
    title: "4단계: 해외주식 신청 & 혜택 폼 작성",
    shortTitle: "혜택신청",
    icon: <CheckCircle2 className="w-5 h-5 text-[var(--accent-orange)]" />,
    details: [
      "1. 해외주식 메뉴 이동: DB증권 앱 홈 하단 [메뉴] ➔ 상단 [해외주식] 탭으로 이동합니다.",
      "2. 해외거래 이용신청: 좌측 [서비스신청] ➔ [해외주식거래이용신청]을 선택합니다.",
      "3. 해외주식 신청 완료: 약관 확인 후 해외주식 거래 이용신청을 완료합니다.",
      "4. 혜택 신청 폼 제출: 아래 구글 폼에 개설 정보를 입력하고 제출하면 평생 우대가 적용됩니다."
    ],
    ctaForm: {
      title: "주식부엉 x 오로라투자자문 수수료 평생 우대 혜택 신청",
      description: "안내된 절차(DB증권 계좌 개설 및 자문사 앱 연동)를 완료하신 후 아래 폼을 작성해 주세요.",
      buttonText: "혜택 신청 폼 작성하기",
      buttonUrl: "https://docs.google.com/forms/d/e/1FAIpQLSfMK-ZxVqgFSmKq0VyJu-K8IcLQJFjdmyaouG5Pls7hfX8siA/viewform"
    }
  },
  {
    id: 5,
    stepNum: 5,
    title: "5단계: 실전 필수 참고사항 & 문의처",
    shortTitle: "필수참고",
    icon: <Lightbulb className="w-5 h-5 text-[var(--accent-orange)]" />,
    details: []
  }
];

const STEP2_SUBSTEPS = [
  { num: 1, title: "비대면 계좌개설 시작", desc: "약관 동의 및 비대면 계좌 개설 절차를 시작합니다." },
  { num: 2, title: "FA종합매매계좌 선택", desc: "화면을 아래로 내려 [FA자문사 연계 계좌] ➔ [FA종합매매계좌]를 선택합니다." },
  { num: 3, title: "관리점 정보 입력", desc: "관리지점에 [강남금융센터], 관리자에 [김주호]를 입력합니다." },
  { num: 4, title: "비대면 계좌개설 완료", desc: "본인 인증 및 계좌 개설 절차가 성공적으로 마무리됩니다." }
];

const STEP3_SUBSTEPS = [
  { num: 1, title: "자문사 앱 가입 & 분석", desc: "자문사 앱 가입 또는 로그인 ➔ 간단한 투자성향 분석을 완료합니다." },
  { num: 2, title: "오로라투자자문 선택", desc: "홈 화면에서 [자문사 찾기]를 누른 후 [오로라투자자문]을 선택합니다." },
  { num: 3, title: "오로라x주식부엉 자율형MP", desc: "운용포트폴리오에서 [오로라x주식부엉 자율형MP]를 선택하고 투자하기를 누릅니다." },
  { num: 4, title: "계좌연결 완료", desc: "개설 계좌를 선택하고 연동 절차를 완료하면 평생 우대 혜택이 연결됩니다." }
];

const STEP4_SUBSTEPS = [
  { num: 1, title: "해외주식 메뉴 이동", desc: "DB증권 앱 홈 하단 [메뉴] ➔ 상단 [해외주식] 탭으로 이동합니다." },
  { num: 2, title: "해외거래 이용신청", desc: "좌측 [서비스신청] ➔ [해외주식거래이용신청]을 선택합니다." },
  { num: 3, title: "해외주식 신청 완료", desc: "약관 확인 후 해외주식 거래 이용신청을 완료합니다." },
  { num: 4, title: "혜택 신청 폼 제출", desc: "아래 구글 폼에 개설 정보를 입력하고 제출하면 평생 우대가 적용됩니다." }
];

const CONTACT_LIST = [
  {
    role: "주식부엉",
    contact: "booung@jusik.app",
    type: "email",
    desc: "가이드 및 계좌 개설 관련 전반 문의",
    href: "mailto:booung@jusik.app",
    icon: <Mail className="w-4 h-4 text-[var(--accent-orange)]" />
  },
  {
    role: "DB증권 강남금융센터",
    contact: "02-568-3872",
    type: "phone",
    desc: "DB증권 계좌 개설 및 지점 유선 안내",
    href: "tel:02-568-3872",
    icon: <Building className="w-4 h-4 text-indigo-500" />
  },
  {
    role: "오로라투자자문",
    contact: "02-6956-9439",
    type: "phone",
    desc: "자문사 앱 연동 및 포트폴리오 유선 안내",
    href: "tel:02-6956-9439",
    icon: <Phone className="w-4 h-4 text-emerald-500" />
  }
];

export default function AccountOpenGuide() {
  const [currentStep, setCurrentStep] = useState(0);
  const [userOS, setUserOS] = useState<'ios' | 'android'>('ios');
  const [simulatorScene, setSimulatorScene] = useState<1 | 2 | 3 | 4>(1);
  const [advisoryScene, setAdvisoryScene] = useState<1 | 2 | 3 | 4>(1);
  const [overseasScene, setOverseasScene] = useState<1 | 2 | 3 | 4>(1);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    const ua = navigator.userAgent || navigator.vendor || (window as unknown as { opera?: string }).opera || '';
    if (/android/i.test(ua)) {
      setUserOS('android');
    } else {
      setUserOS('ios');
    }
  }, []);

  const step = STEPS[currentStep];

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) setCurrentStep(prev => prev + 1);
  };

  const handleAppDownload = (app: { iosUrl: string; androidUrl: string }) => {
    const targetUrl = userOS === 'android' ? app.androidUrl : app.iosUrl;
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="glass-card rounded-3xl p-5 sm:p-7 border border-[var(--border-color)]/90 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-color)]/60 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-[var(--accent-orange)]/15 text-[var(--accent-orange)]">
              <Sparkles className="w-5 h-5" />
            </span>
            <h3 className="text-lg sm:text-xl font-extrabold text-[var(--text-primary)]">
              실전 계좌 개설 가이드
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium pl-8">
            단계별 안내를 따라 천천히 진행해 주세요.
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center gap-1.5 self-start sm:self-center px-3 py-1 rounded-full bg-[var(--card-hover)] border border-[var(--border-color)]/80 text-xs font-bold text-[var(--accent-orange)]">
          <span>단계</span>
          <span className="font-extrabold">{currentStep + 1}</span>
          <span className="text-[var(--text-secondary)]">/</span>
          <span className="text-[var(--text-secondary)]">{STEPS.length}</span>
        </div>
      </div>

      {/* Step Tabs Navigation with Sliding Pill Animation */}
      <div className="relative p-1.5 rounded-2xl bg-[var(--card-hover)]/70 border border-[var(--border-color)]/50 select-none">
        <div className="grid grid-cols-5 relative">
          {/* Liquid Sliding Pill Highlight */}
          <div 
            className="absolute top-0 bottom-0 rounded-xl bg-white dark:bg-zinc-800 border border-[var(--accent-orange)]/45 shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none"
            style={{
              width: '20%',
              transform: `translateX(${currentStep * 100}%)`,
            }}
          />

          {STEPS.map((s, idx) => {
            const isActive = idx === currentStep;
            const isDone = idx < currentStep;

            return (
              <button
                key={s.id}
                onClick={() => setCurrentStep(idx)}
                className={`relative z-10 flex flex-col items-center justify-center py-2 px-1 rounded-xl text-center transition-colors duration-200 ${
                  isActive
                    ? 'text-[var(--accent-orange)] font-extrabold'
                    : isDone
                    ? 'text-[var(--emerald)] hover:text-[var(--text-primary)] font-semibold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium'
                }`}
              >
                <span className="text-[10px] sm:text-xs opacity-80">
                  {isDone ? '완료' : `STEP 0${s.stepNum}`}
                </span>
                <span className="text-xs sm:text-sm truncate w-full px-0.5 mt-0.5">
                  {s.shortTitle}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Step Content Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white/60 dark:bg-zinc-900/40 border border-[var(--border-color)] space-y-5">
        {/* Step Title */}
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-[var(--accent-orange)]/15 text-[var(--accent-orange)]">
            {step.icon}
          </span>
          <h4 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
            {step.title}
          </h4>
        </div>

        {/* Smart App Download Cards (Step 1) */}
        {step.appDownload && step.appDownload.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {step.appDownload.map((app, aIdx) => (
              <div 
                key={aIdx} 
                className="p-4 rounded-xl bg-white/90 dark:bg-zinc-800/80 border border-[var(--border-color)] space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-[var(--text-primary)] flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-[var(--accent-orange)]" />
                    {app.appName}
                  </span>
                  <span className="text-[11px] text-[var(--text-secondary)] font-medium">설치 필요</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleAppDownload(app)}
                  className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-lg bg-[var(--accent-orange)] hover:bg-[#d97706] text-white text-xs sm:text-sm font-bold transition-all shadow-xs active:scale-[0.98]"
                >
                  <Download className="w-4 h-4" />
                  <span>앱 다운로드</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* STEP 2 SPECIAL: 4-Step Interactive Navigation + Account Simulator */}
        {step.stepNum === 2 && (
          <div className="space-y-4 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {STEP2_SUBSTEPS.map((sub) => {
                const isActive = simulatorScene === sub.num;
                return (
                  <button
                    key={sub.num}
                    type="button"
                    onClick={() => setSimulatorScene(sub.num as 1 | 2 | 3 | 4)}
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

            <div className="pt-2">
              <AccountOpenMotionSimulator 
                currentScene={simulatorScene}
                onSceneChange={setSimulatorScene}
              />
            </div>
          </div>
        )}

        {/* STEP 3 SPECIAL: 4-Step Interactive Navigation + Advisory Simulator */}
        {step.stepNum === 3 && (
          <div className="space-y-4 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {STEP3_SUBSTEPS.map((sub) => {
                const isActive = advisoryScene === sub.num;
                return (
                  <button
                    key={sub.num}
                    type="button"
                    onClick={() => setAdvisoryScene(sub.num as 1 | 2 | 3 | 4)}
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

            <div className="pt-2">
              <AdvisoryMotionSimulator 
                currentScene={advisoryScene}
                onSceneChange={setAdvisoryScene}
              />
            </div>
          </div>
        )}

        {/* STEP 4 SPECIAL: 4-Step Interactive Navigation + Overseas Simulator + Simple CTA Form */}
        {step.stepNum === 4 && (
          <div className="space-y-4 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {STEP4_SUBSTEPS.map((sub) => {
                const isActive = overseasScene === sub.num;
                return (
                  <button
                    key={sub.num}
                    type="button"
                    onClick={() => setOverseasScene(sub.num as 1 | 2 | 3 | 4)}
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

            <div className="pt-2">
              <OverseasBenefitMotionSimulator 
                currentScene={overseasScene}
                onSceneChange={setOverseasScene}
              />
            </div>

            {/* Simple Integrated CTA Form Box */}
            {step.ctaForm && (
              <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-[var(--accent-orange)]/10 to-transparent border border-[var(--accent-orange)]/40 space-y-3.5 mt-4">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-[var(--accent-orange)] text-white">
                    <ShieldCheck className="w-4 h-4" />
                  </span>
                  <h5 className="text-sm sm:text-base font-extrabold text-[var(--text-primary)]">
                    {step.ctaForm.title}
                  </h5>
                </div>

                <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium">
                  {step.ctaForm.description}
                </p>

                {/* Google Form Button (No parenthesis) */}
                <a
                  href={step.ctaForm.buttonUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-[var(--accent-orange)] hover:bg-[#d97706] text-white font-extrabold text-sm sm:text-base transition-all shadow-md hover:shadow-lg scale-[1.00] hover:scale-[1.01]"
                >
                  <span>{step.ctaForm.buttonText}</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            )}
          </div>
        )}

        {/* STEP 5 SPECIAL: Clean Essentials & Contact Cards */}
        {step.stepNum === 5 && (
          <div className="space-y-5 pt-1">
            {/* 2 Core Tips Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-white/80 dark:bg-zinc-800/80 border border-[var(--border-color)] space-y-2">
                <div className="flex items-center gap-2 text-sm font-extrabold text-[var(--text-primary)]">
                  <span className="p-1.5 rounded-lg bg-[var(--accent-orange)]/15 text-[var(--accent-orange)]">
                    <KeyRound className="w-4 h-4" />
                  </span>
                  <span>모바일 OTP 사전 발급</span>
                </div>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed font-medium">
                  향후 원활한 출금과 이체를 위해 모바일 OTP를 미리 발급받아 두세요.
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
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed font-medium">
                  주식을 100만 원 이상 구매하시면 영업일 기준 3~4일 뒤 이체 한도 제한이 자동으로 완전히 해제됩니다.
                </p>
                <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-[var(--card-hover)] p-2 rounded-lg">
                  첫 주식 구매 시 자동 처리
                </div>
              </div>
            </div>

            {/* Official Support & Contact Section */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-[var(--card-hover)] to-transparent border border-[var(--border-color)] space-y-3.5">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-[var(--accent-orange)] text-white">
                  <HelpCircle className="w-4 h-4" />
                </span>
                <h5 className="text-sm sm:text-base font-extrabold text-[var(--text-primary)]">
                  개설 및 연동 문의처
                </h5>
              </div>

              <p className="text-xs text-[var(--text-secondary)] font-medium">
                진행 중 막히는 부분이 있거나 문의 사항이 있으시면 아래 채널로 편하게 연락해 주세요.
              </p>

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
                      <ExternalLink className="w-3 h-3 text-[var(--text-secondary)] opacity-60 group-hover:opacity-100" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Regular Step Details Bullet List (for Step 1) */}
        {step.stepNum === 1 && (
          <div className="space-y-2 pt-1">
            {step.details.map((detail, dIdx) => (
              <div key={dIdx} className="flex items-start gap-2.5 text-sm sm:text-base text-[var(--text-primary)] leading-relaxed">
                <span className="w-5 h-5 rounded-full bg-[var(--accent-orange)]/15 text-[var(--accent-orange)] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {dIdx + 1}
                </span>
                <span className="flex-1 font-medium">{detail}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Prev / Next Navigation Buttons */}
      <div className="flex items-center justify-between pt-2 gap-3">
        <button
          onClick={handlePrev}
          disabled={currentStep === 0}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition-all ${
            currentStep === 0
              ? 'opacity-40 cursor-not-allowed border-transparent text-[var(--text-secondary)]'
              : 'bg-white dark:bg-zinc-800 border-[var(--border-color)] text-[var(--text-primary)] hover:border-[var(--accent-orange)]/50'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          이전 단계
        </button>

        <div className="text-xs text-[var(--text-secondary)] font-semibold hidden sm:block">
          {currentStep === STEPS.length - 1 ? '모든 절차가 완료되었습니다 🎉' : `${currentStep + 1} / ${STEPS.length} 진행 중`}
        </div>

        {currentStep < STEPS.length - 1 ? (
          <button
            onClick={handleNext}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[var(--accent-orange)] hover:bg-[#d97706] text-white transition-all shadow-xs"
          >
            다음 단계
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={() => setCurrentStep(0)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[var(--card-hover)] border border-[var(--border-color)] text-[var(--text-primary)] hover:border-[var(--accent-orange)]/50 transition-all"
          >
            처음부터 다시 보기
          </button>
        )}
      </div>

      {/* Image Lightbox Modal */}
      {previewImage && (
        <div 
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="relative max-w-2xl w-full max-h-[90vh] flex flex-col items-center">
            <button 
              onClick={() => setPreviewImage(null)}
              className="absolute -top-10 right-0 p-2 rounded-full bg-white/20 text-white hover:bg-white/40 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <img 
              src={previewImage} 
              alt="화면 확대" 
              className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
