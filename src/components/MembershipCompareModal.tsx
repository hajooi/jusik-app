'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '@/context/AuthContext';
import { 
  X, 
  Check, 
  Crown, 
  Sparkles, 
  KeyRound, 
  ShieldCheck, 
  ChevronRight, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw 
} from 'lucide-react';
import SmoothHeight from '@/components/SmoothHeight';

interface MembershipCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const YOUTUBE_MEMBERSHIP_JOIN_URL = 'https://www.youtube.com/channel/UCnFnsb1jfgAHSdviaNSaUwA/join';

export default function MembershipCompareModal({ isOpen, onClose }: MembershipCompareModalProps) {
  const { user, proTier, redeemPromoCode, openAuthPopover } = useAuth();
  
  // High-performance enter/exit animation state
  const [isRendered, setIsRendered] = useState(false);
  const [isShowing, setIsShowing] = useState(false);

  // Inline Promo Code Redeem State
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [isSubmittingCode, setIsSubmittingCode] = useState(false);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [codeSuccess, setCodeSuccess] = useState<string | null>(null);

  // Apple Native Smooth Close Handler (plays exit animation then closes)
  const handleClose = () => {
    setIsShowing(false);
    setTimeout(() => {
      onClose();
      setIsRendered(false);
      setShowCodeInput(false);
      setPromoCode('');
      setCodeError(null);
      setCodeSuccess(null);
    }, 400);
  };

  // Synchronize enter and exit lifecycle & dual-layer scroll lock (body + html)
  useEffect(() => {
    let timer: NodeJS.Timeout;
    let animFrame: number;

    if (isOpen) {
      setIsRendered(true);
      animFrame = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsShowing(true);
        });
      });
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else if (isRendered) {
      setIsShowing(false);
      timer = setTimeout(() => {
        setIsRendered(false);
        setShowCodeInput(false);
        setPromoCode('');
        setCodeError(null);
        setCodeSuccess(null);
      }, 400);
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }

    return () => {
      if (timer) clearTimeout(timer);
      if (animFrame) cancelAnimationFrame(animFrame);
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isOpen, isRendered]);

  // Close on ESC key with smooth exit animation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isRendered) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRendered]);

  if (!isRendered) return null;

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      handleClose();
      openAuthPopover();
      return;
    }

    if (!promoCode || promoCode.trim().length < 3) {
      setCodeError('유효한 4자리 코드를 입력해 주세요.');
      return;
    }

    setIsSubmittingCode(true);
    setCodeError(null);
    setCodeSuccess(null);

    const res = await redeemPromoCode(promoCode);
    setIsSubmittingCode(false);

    if (res.success) {
      setCodeSuccess(res.message || '멤버십 코드가 성공적으로 등록되었습니다!');
      setTimeout(() => {
        setPromoCode('');
        setCodeSuccess(null);
        setShowCodeInput(false);
      }, 1500);
    } else {
      setCodeError(res.error || '코드 등록에 실패했습니다.');
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-hidden overscroll-contain">
      {/* Heavy Blur Backdrop with Smooth Apple Ease Fade (z-[10000]) */}
      <div 
        className={`fixed inset-0 bg-black/70 backdrop-blur-md cursor-pointer transition-opacity duration-[450ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] touch-none ${
          isShowing ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={handleClose}
      />

      {/* Modal Dialog Card with Apple Native Smooth Spring Physics (0.5s cubic-bezier) */}
      <div 
        className={`relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-3xl bg-[var(--card-surface)] border border-[var(--border-color)] shadow-2xl overflow-hidden z-10 my-auto text-left transform-gpu will-change-[transform,opacity] transition-all duration-[500ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
          isShowing 
            ? 'scale-100 opacity-100 translate-y-0' 
            : 'scale-[0.93] opacity-0 translate-y-8 pointer-events-none'
        }`}
      >
        {/* Floating Apple Progressive Glass Blur Header Shell (BottomNavigation 1:1 Reference, No border line) */}
        <div 
          className="absolute top-0 inset-x-0 z-20 pointer-events-none select-none overflow-hidden h-[96px] sm:h-[104px]"
        >
          {/* Layer 1: Solid/Dense glass background vertical gradient fade (dense at top -> transparent at bottom) */}
          <div 
            className="absolute inset-0 bg-gradient-to-b from-[var(--card-surface)] via-[var(--card-surface)]/95 to-transparent pointer-events-none"
            style={{
              maskImage: 'linear-gradient(to bottom, black 0%, black 72%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 72%, transparent 100%)'
            }}
          />
          {/* Layer 2: Deep glass backdrop blur across header area */}
          <div 
            className="absolute inset-x-0 top-0 h-[86px] sm:h-[94px] backdrop-blur-xl pointer-events-none"
            style={{
              maskImage: 'linear-gradient(to bottom, black 0%, black 75%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 75%, transparent 100%)'
            }}
          />
          {/* Layer 3: Soft ambient progressive blur fade */}
          <div 
            className="absolute inset-x-0 top-0 h-[96px] sm:h-[104px] backdrop-blur-[6px] pointer-events-none"
            style={{
              maskImage: 'linear-gradient(to bottom, black 0%, black 65%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 65%, transparent 100%)'
            }}
          />

          {/* Interactive Header Title & Close Button */}
          <div className="relative z-10 px-5 pt-6 pb-2 sm:px-8 sm:pt-7 sm:pb-3 flex items-start justify-between">
            <div className="space-y-1 pointer-events-auto">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-[var(--accent-orange)]/15 text-[var(--accent-orange)] border border-[var(--accent-orange)]/30">
                  <Crown className="w-4 h-4 stroke-[2.4]" />
                </span>
                <h2 className="text-lg sm:text-xl font-black tracking-tight text-[var(--text-primary)]">
                  내게 맞는 멤버십 플랜 알아보기
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-normal">
                내 투자 수준과 목표에 꼭 맞는 플랜으로 똑똑한 자산관리를 시작하세요.
              </p>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="p-2 rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--card-hover)] transition-all cursor-pointer pointer-events-auto shrink-0"
              title="닫기 (ESC)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Comparison Content (Passes smoothly under the floating progressive blur header) */}
        <div 
          className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 pt-24 sm:pt-28 pb-6 sm:pb-8 space-y-6 sm:space-y-8 no-scrollbar overscroll-contain"
        >
          
          {/* 3-Tier Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 items-stretch">
            
            {/* 1. FREE Plan Card */}
            <div className={`flex flex-col justify-between p-5 sm:p-6 rounded-2xl bg-[var(--card-hover)]/70 border transition-all duration-300 ${
              proTier === 'free' 
                ? 'border-[var(--accent-orange)]/60 shadow-[0_0_20px_rgba(241,143,1,0.08)]' 
                : 'border-[var(--border-color)]/90 hover:border-[var(--border-color)]'
            }`}>
              <div className="space-y-4">
                {/* Header */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[var(--text-secondary)] tracking-wider uppercase font-mono">
                      FREE
                    </span>
                    {proTier === 'free' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold text-[var(--accent-orange)] bg-[var(--accent-orange)]/10 border border-[var(--accent-orange)]/30">
                        <Check className="w-3 h-3" />
                        <span>현재 이용 중</span>
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-black text-[var(--text-primary)]">
                    평생 무료
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    주식 입문과 기초 지식 체계화를 위한 평생 무료 학습 플랜
                  </p>
                </div>

                {/* Price */}
                <div className="py-2.5 border-y border-[var(--border-color)]/60">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl sm:text-3xl font-black font-mono text-[var(--text-primary)]">0원</span>
                    <span className="text-xs text-[var(--text-secondary)]">/ 평생</span>
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-2.5 text-xs text-[var(--text-primary)] pt-1">
                  <div className="font-bold text-[var(--text-secondary)] text-[11px]">기본 제공 혜택:</div>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>주식 기초 커리큘럼 전 강좌 평생 무료 수강</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>40문항 투자 성향 정밀 진단</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>15년 주식 전략 시뮬레이터 제공</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>계좌 관리 및 주문 수량 자동 계산</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>전 종목 지표 스크리너 무료 열람</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>실전 주식 용어 스피드 퀴즈 & 커뮤니티 소통</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-6">
                <div className="w-full py-2.5 px-3 rounded-full text-center text-xs font-bold text-[var(--text-secondary)] bg-[var(--card-hover)] border border-[var(--border-color)] select-none">
                  {proTier === 'free' ? '현재 이용 중' : '기본 포함'}
                </div>
              </div>
            </div>

            {/* 2. PRO Plan Card */}
            <div className={`flex flex-col justify-between p-5 sm:p-6 rounded-2xl bg-[var(--card-hover)]/70 border relative transition-all duration-300 ${
              proTier === 'pro' 
                ? 'border-[var(--accent-orange)] shadow-[0_0_24px_rgba(241,143,1,0.20)]' 
                : 'border-[var(--border-color)]/90 hover:border-[var(--accent-orange)]/40 hover:shadow-[0_0_18px_rgba(241,143,1,0.1)]'
            }`}>
              <div className="space-y-4">
                {/* Header */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[var(--accent-orange)] tracking-wider uppercase font-mono flex items-center gap-1">
                      <Crown className="w-3.5 h-3.5" />
                      <span>PRO</span>
                    </span>
                    {proTier === 'pro' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold text-[var(--accent-orange)] bg-[var(--accent-orange)]/15 border border-[var(--accent-orange)]/50">
                        <Check className="w-3 h-3" />
                        <span>현재 이용 중</span>
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-black text-[var(--text-primary)]">
                    프로 실전 플랜
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    자산 배분 히스토리 추적과 스마트 프리셋 스크리너
                  </p>
                </div>

                {/* Price & Badge Preview */}
                <div className="py-2.5 border-y border-[var(--border-color)]/60 flex items-center justify-between">
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl sm:text-3xl font-black font-mono text-[var(--text-primary)]">4,900원</span>
                      <span className="text-xs text-[var(--text-secondary)]">/ 월</span>
                    </div>
                    <div className="text-[10px] text-[var(--accent-orange)] font-medium pt-0.5">
                      제휴 증권사 계좌 개설 시 무료 (거래 시 1년 단위 연장)
                    </div>
                  </div>

                  {/* Badge Preview */}
                  <span 
                    className="animate-pro-badge inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-extrabold font-mono text-[var(--accent-orange)] bg-[var(--accent-orange)]/15 border border-[var(--accent-orange)]/50 select-none shadow-2xs"
                    title="PRO 앰버 뱃지"
                  >
                    <Crown className="w-3 h-3 stroke-[2.4] fill-[var(--accent-orange)]/20" />
                    <span>PRO</span>
                  </span>
                </div>

                {/* Features List */}
                <div className="space-y-2.5 text-xs text-[var(--text-primary)] pt-1">
                  <div className="font-bold text-[var(--accent-orange)] text-[11px]">FREE 혜택 포함 +</div>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-[var(--accent-orange)] shrink-0 mt-0.5" />
                      <span>주식 심화 커리큘럼 전 강좌 수강</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-[var(--accent-orange)] shrink-0 mt-0.5" />
                      <span>30년 주식 전략 시뮬레이터 제공</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-[var(--accent-orange)] shrink-0 mt-0.5" />
                      <span>월별 자산 배분 히스토리 추적</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-[var(--accent-orange)] shrink-0 mt-0.5" />
                      <span>보유 종목 목표 비중 이탈 알림</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-[var(--accent-orange)] shrink-0 mt-0.5" />
                      <span>저평가 TOP 20 등 원클릭 프리셋 스크리너</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-6">
                {proTier === 'pro' ? (
                  <div className="w-full py-2.5 px-3 rounded-full text-center text-xs font-bold text-[var(--accent-orange)] bg-[var(--accent-orange)]/10 border border-[var(--accent-orange)]/30 select-none">
                    현재 이용 중
                  </div>
                ) : proTier === 'pro_plus' ? (
                  <div className="w-full py-2.5 px-3 rounded-full text-center text-xs font-bold text-[var(--text-secondary)] bg-[var(--card-hover)] border border-[var(--border-color)] select-none">
                    기본 포함
                  </div>
                ) : (
                  <a
                    href={YOUTUBE_MEMBERSHIP_JOIN_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-3 rounded-full text-center text-xs font-bold bg-[var(--accent-orange)] text-white hover:brightness-105 hover:shadow-[0_0_18px_rgba(241,143,1,0.28)] active:scale-95 transition-all flex items-center justify-center shadow-2xs border border-[var(--accent-orange)] cursor-pointer"
                  >
                    PRO 시작하기
                  </a>
                )}
              </div>
            </div>

            {/* 3. PRO+ Plan Card */}
            <div className={`flex flex-col justify-between p-5 sm:p-6 rounded-2xl bg-gradient-to-b from-amber-500/[0.06] to-[var(--card-hover)]/70 border relative transition-all duration-300 ${
              proTier === 'pro_plus' 
                ? 'border-amber-400 shadow-[0_0_28px_rgba(245,158,11,0.25)]' 
                : 'border-amber-500/40 hover:border-amber-400 hover:shadow-[0_0_22px_rgba(245,158,11,0.18)]'
            }`}>
              
              <div className="space-y-4">
                {/* Header */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-amber-500 tracking-wider uppercase font-mono flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>PRO+</span>
                    </span>
                    {proTier === 'pro_plus' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold text-amber-500 bg-amber-500/15 border border-amber-500/50">
                        <Check className="w-3 h-3" />
                        <span>현재 이용 중</span>
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-black text-[var(--text-primary)]">
                    프로+ VIP 플랜
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    증권사 원클릭 주문 연동과 포트폴리오 최적 배분기
                  </p>
                </div>

                {/* Price & Supreme Badge Preview */}
                <div className="py-2.5 border-y border-amber-500/30 flex items-center justify-between">
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl sm:text-3xl font-black font-mono text-[var(--text-primary)]">12,000원</span>
                      <span className="text-xs text-[var(--text-secondary)]">/ 월</span>
                    </div>
                    <div className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold pt-0.5">
                      최고 등급 전용 도구
                    </div>
                  </div>

                  {/* PRO+ Supreme Badge Preview */}
                  <span 
                    className="animate-pro-plus-badge inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-black font-mono text-amber-600 dark:text-amber-300 border select-none shadow-sm"
                    title="PRO+ 프리즘 골드 뱃지"
                  >
                    <Sparkles className="w-3 h-3 stroke-[2.4] fill-amber-400" />
                    <span>PRO+</span>
                  </span>
                </div>

                {/* Features List (User Specified Order) */}
                <div className="space-y-2.5 text-xs text-[var(--text-primary)] pt-1">
                  <div className="font-bold text-amber-600 dark:text-amber-400 text-[11px]">PRO 혜택 포함 +</div>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                      <span>PRO의 모든 혜택 기본 포함</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                      <span>증권사 원클릭 주문 연동</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                      <span>포트폴리오 최적 배분기</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-6">
                {proTier === 'pro_plus' ? (
                  <div className="w-full py-2.5 px-3 rounded-full text-center text-xs font-bold text-amber-500 bg-amber-500/10 border border-amber-500/30 select-none">
                    현재 이용 중
                  </div>
                ) : (
                  <a
                    href={YOUTUBE_MEMBERSHIP_JOIN_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-3 rounded-full text-center text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white shadow-sm hover:shadow-[0_0_20px_rgba(245,158,11,0.35)] active:scale-95 transition-all flex items-center justify-center border border-amber-400/50 cursor-pointer"
                  >
                    PRO+ 시작하기
                  </a>
                )}
              </div>
            </div>

          </div>

          {/* Bottom Accordion: Inline Redeem Promo Code (Hidden for PRO+ users) */}
          {proTier !== 'pro_plus' && (
            <div className="pt-2 border-t border-[var(--border-color)]/60 text-center space-y-3">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-xs text-[var(--text-secondary)]">
                <span>
                  {proTier === 'pro' 
                    ? '유튜브 PRO+ 멤버십에 가입하셨나요?' 
                    : '이미 유튜브 멤버십 회원이신가요?'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (!user) {
                      onClose();
                      openAuthPopover();
                    } else {
                      setShowCodeInput(!showCodeInput);
                      setCodeError(null);
                      setCodeSuccess(null);
                    }
                  }}
                  className="font-bold text-[var(--accent-orange)] hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>
                    {!user 
                      ? '로그인 후 인증하기' 
                      : (proTier === 'pro' ? 'PRO+ 인증 코드 등록하기' : '인증 코드 등록하기')}
                  </span>
                  <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showCodeInput ? 'rotate-90' : ''}`} />
                </button>
              </div>

              {/* Inline Code Input Form */}
              <SmoothHeight duration={250}>
                {showCodeInput && user && (
                  <div className="max-w-md mx-auto p-4 rounded-2xl bg-[var(--card-hover)] border border-[var(--border-color)] space-y-3 animate-fade-in text-left">
                    <div className="text-xs font-bold text-[var(--text-primary)] flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Crown className="w-3.5 h-3.5 text-[var(--accent-orange)]" />
                        <span>멤버십 인증 코드 입력</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowCodeInput(false)}
                        className="text-[11px] text-[var(--text-secondary)] hover:text-red-500 font-medium cursor-pointer"
                      >
                        닫기
                      </button>
                    </div>
                    <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                      유튜브 커뮤니티 회원 전용 게시판에 매달 초 공지되는 인증 코드를 입력하시면 해당 등급이 즉시 활성화됩니다.
                    </p>

                    <form onSubmit={handleCodeSubmit} className="space-y-2.5">
                      <input
                        type="text"
                        maxLength={10}
                        value={promoCode}
                        onChange={(e) => {
                          setPromoCode(e.target.value);
                          setCodeError(null);
                        }}
                        placeholder="인증 코드 입력"
                        className="w-full px-3 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50 focus:outline-none focus:border-[var(--accent-orange)] focus:shadow-[0_0_12px_rgba(241,143,1,0.25)] transition-all font-mono tracking-wider uppercase text-center font-bold"
                      />

                      {codeError && (
                        <div className="text-[11px] text-red-500 font-medium flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          <span>{codeError}</span>
                        </div>
                      )}

                      {codeSuccess && (
                        <div className="text-[11px] text-emerald-500 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 shrink-0" />
                          <span>{codeSuccess}</span>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={isSubmittingCode || !promoCode.trim()}
                        className="w-full py-2 px-3 rounded-full text-xs font-bold bg-[var(--accent-orange)] text-white hover:brightness-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                      >
                        {isSubmittingCode ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>확인 중...</span>
                          </>
                        ) : (
                          <span>인증하고 혜택 적용하기</span>
                        )}
                      </button>
                    </form>
                  </div>
                )}
              </SmoothHeight>

              <div className="text-[11px] text-[var(--text-secondary)]/70 flex items-center justify-center gap-1.5 pt-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>유튜브 멤버십은 언제든 구글 계정 설정에서 자유롭게 해지하실 수 있습니다.</span>
              </div>
            </div>
          )}

        </div>

        {/* Bottom subtle gradient fadeout (BottomNavigation 1:1 Reference, subtle fadeout at bottom) */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-6 sm:h-8 bg-gradient-to-t from-[var(--card-surface)] to-transparent z-20 rounded-b-3xl" />
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
}
