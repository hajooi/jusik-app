'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import SmoothHeight from '@/components/SmoothHeight';
import { User, CheckCircle2, AlertCircle, Eye, EyeOff, LogOut, BookmarkCheck, MoreVertical, Compass, ChevronRight, Camera, RefreshCw, KeyRound, Crown, Gift, Sparkles } from 'lucide-react';
import { PERSONALITY_PROFILES } from '@/data/investmentSurvey';

interface AuthPopoverProps {
  onClose: () => void;
  onOpenAdmin?: () => void;
}

export default function AuthPopover({ onClose, onOpenAdmin }: AuthPopoverProps) {
  const { login, user, logout, changePin, redeemPromoCode, isPro, proExpiresAt, updateAvatar, updateActiveBadge, isAuthPopoverClosing } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [nickname, setNickname] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // PIN Change State
  const [isChangingPin, setIsChangingPin] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [newPinConfirm, setNewPinConfirm] = useState('');
  const [showNewPin, setShowNewPin] = useState(false);
  const [isPinChanging, setIsPinChanging] = useState(false);
  const [pinChangeError, setPinChangeError] = useState<string | null>(null);
  const [pinChangeSuccess, setPinChangeSuccess] = useState<string | null>(null);

  // Pro Code Redeem State
  const [isRedeemingCode, setIsRedeemingCode] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [isCodeSubmitting, setIsCodeSubmitting] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoSuccess, setPromoSuccess] = useState<string | null>(null);

  const handlePinChangeSubmit = async () => {
    if (!newPin || newPin.length !== 6 || !/^\d{6}$/.test(newPin)) {
      setPinChangeError('새 핀번호는 숫자 6자리로 입력해 주세요.');
      return;
    }
    if (newPin !== newPinConfirm) {
      setPinChangeError('입력하신 두 핀번호가 일치하지 않습니다.');
      return;
    }

    setIsPinChanging(true);
    setPinChangeError(null);
    setPinChangeSuccess(null);

    const res = await changePin(newPin);
    setIsPinChanging(false);

    if (res.success) {
      setPinChangeSuccess('핀번호가 성공적으로 변경되었습니다!');
      setTimeout(() => {
        setIsChangingPin(false);
        setNewPin('');
        setNewPinConfirm('');
        setPinChangeSuccess(null);
      }, 1200);
    } else {
      setPinChangeError(res.error || '핀번호 변경에 실패했습니다.');
    }
  };

  const handlePromoCodeSubmit = async () => {
    if (!promoCode || promoCode.trim().length < 3) {
      setPromoError('유효한 4자리 코드를 입력해 주세요.');
      return;
    }

    setIsCodeSubmitting(true);
    setPromoError(null);
    setPromoSuccess(null);

    const res = await redeemPromoCode(promoCode);
    setIsCodeSubmitting(false);

    if (res.success) {
      setPromoSuccess(res.message || 'Pro 코드가 성공적으로 등록되었습니다!');
      setTimeout(() => {
        setPromoCode('');
        setPromoSuccess(null);
        setIsRedeemingCode(false);
      }, 1500);
    } else {
      setPromoError(res.error || '코드 등록에 실패했습니다.');
    }
  };

  // Client-side image resize via HTML5 Canvas (128x128 compressed WebP/JPEG)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드할 수 있습니다.');
      return;
    }

    setIsUploadingAvatar(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = 128;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setIsUploadingAvatar(false);
          return;
        }

        // Draw square crop
        const minDim = Math.min(img.width, img.height);
        const startX = (img.width - minDim) / 2;
        const startY = (img.height - minDim) / 2;

        ctx.drawImage(img, startX, startY, minDim, minDim, 0, 0, size, size);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

        updateAvatar(dataUrl);
        setIsUploadingAvatar(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      const result = await login(nickname, pin);
      if (!result.success) {
        setErrorMsg(result.error || '입력 정보를 확인해 주세요.');
      } else {
        setSuccessMsg('로그인되었습니다!');
        setTimeout(() => {
          onClose();
        }, 700);
      }
    } catch (err) {
      setErrorMsg('서버와 통신 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // Avatar source resolution (커스텀 아바타 최우선 즉시 반영)
  const userAvatarSrc = (user?.avatarUrl && !user.avatarUrl.includes('default-avatar') && !user.avatarUrl.includes('guest.png'))
    ? user.avatarUrl
    : user?.nickname?.trim() === '주식부엉'
    ? '/icon.png?v=3'
    : '/guest.png?v=3';

  // 아바타 초기화 (기본 이미지로 복구)
  const handleResetAvatar = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateAvatar('');
  };

  return (
    <div 
      className={`w-[300px] sm:w-[330px] p-5 rounded-2xl bg-white/80 dark:bg-[#18181b]/80 backdrop-blur-xl shadow-2xl space-y-4 border border-[var(--border-color)] text-left ${
        isAuthPopoverClosing ? 'animate-popover-shrink' : 'animate-popover-expand'
      }`}
    >
      
      {/* Header Copy */}
      <div className="flex items-start justify-between">
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--accent-orange)]">
            <BookmarkCheck className="w-4 h-4" />
            <span>{user ? '내 계정 정보' : '내 기록 보관'}</span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-normal">
            {user 
              ? '학습 및 투자 기록이 안전하게 보관됩니다.' 
              : '로그인하여 학습 및 투자 기록을 안전하게 보관하세요.'}
          </p>
        </div>

        {/* Hidden Admin Dots Menu for '주식부엉' account */}
        {user && user.nickname === '주식부엉' && (
          <div className="relative">
            <button
              onClick={() => {
                onClose();
                if (onOpenAdmin) onOpenAdmin();
              }}
              title="관리자 대시보드"
              className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--accent-orange)] hover:bg-[var(--card-hover)] transition-all cursor-pointer"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {user ? (
        /* Logged in view */
        <div className="space-y-3 pt-1">
          {/* Profile Avatar & Nickname Card (Centered) */}
          <div className="p-4 rounded-xl bg-[var(--card-hover)] border border-[var(--border-color)] flex flex-col items-center justify-center text-center space-y-2 relative overflow-hidden">
            {/* Centered Avatar with Clickable Camera Overlay */}
            <div className="relative inline-block">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="relative group shrink-0 cursor-pointer"
                title="클릭하여 프로필 사진 변경"
              >
                <img
                  src={userAvatarSrc}
                  alt={user.nickname}
                  className="w-14 h-14 rounded-full object-cover border border-[var(--border-color)] bg-[var(--bg-main)] shadow-sm transition-all duration-200 group-hover:scale-105 group-hover:opacity-85"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-white">
                  <Camera className="w-4 h-4" />
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {/* 커스텀 아바타가 등록되어 있을 때 기본 이미지로 복구하는 버튼 */}
              {user.avatarUrl && !user.avatarUrl.includes('default-avatar') && !user.avatarUrl.includes('guest.png') && (
                <button
                  type="button"
                  onClick={handleResetAvatar}
                  title="기본 프로필 이미지로 복구"
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--accent-crimson)] hover:border-[var(--accent-crimson)] flex items-center justify-center shadow-xs transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-2.5 h-2.5" />
                </button>
              )}
            </div>

            {/* Centered Nickname & Live Badge Preview */}
            <div className="space-y-1">
              <div className="text-[10px] text-[var(--text-secondary)] font-medium">내 계정</div>
              <div className="flex items-center justify-center gap-1.5 flex-wrap">
                <span className="text-base font-bold text-[var(--text-primary)] font-mono">
                  {user.nickname}
                </span>

                {/* Live Selected Badge Display next to Nickname */}
                {user.activeBadge === 'pro' && isPro ? (
                  <span 
                    className="animate-pro-badge inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold font-mono text-[var(--accent-orange)] bg-[var(--accent-orange)]/15 border border-[var(--accent-orange)]/50 select-none leading-none shadow-2xs"
                    title="PRO 회원 뱃지"
                  >
                    <Crown className="w-2.5 h-2.5 stroke-[2.4] fill-[var(--accent-orange)]/20 animate-pulse" />
                    <span className="tracking-wide">PRO</span>
                  </span>
                ) : user.activeBadge === 'terms_percentile' && user.termsQuizBest?.badgeName ? (
                  <span 
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold font-mono leading-none select-none shadow-2xs ${
                      (user.termsQuizBest.percentile && user.termsQuizBest.percentile <= 10) || user.termsQuizBest.badgeName?.includes('마스터')
                        ? 'animate-elite-badge text-emerald-500 bg-emerald-500/10 border border-emerald-500/40'
                        : 'text-[var(--text-secondary)] bg-[var(--bg-main)]/80 border border-[var(--border-color)]'
                    }`}
                    title="주식 용어 퀴즈 뱃지"
                  >
                    {user.termsQuizBest.badgeName}
                  </span>
                ) : user.activeBadge === 'investmentType' && user.investmentType && user.investmentType !== '미진단' ? (
                  <span 
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold font-mono text-[var(--text-secondary)] bg-[var(--bg-main)]/80 border border-[var(--border-color)] leading-none select-none shadow-2xs"
                    title="투자 성향 뱃지"
                  >
                    {user.investmentType}
                  </span>
                ) : null}
              </div>
            </div>

            {/* Pro Status Banner */}
            {isPro && (
              <div className="w-full pt-1">
                <div className="w-full py-1.5 px-2.5 rounded-lg bg-[var(--accent-orange)]/10 border border-[var(--accent-orange)]/30 flex items-center justify-between text-[11px] font-bold">
                  <span className="flex items-center gap-1 text-[var(--accent-orange)]">
                    <Crown className="w-3.5 h-3.5 stroke-[2.4]" />
                    <span className="font-mono text-[10.5px]">PRO 회원</span>
                  </span>
                  <span className="text-[10px] font-medium text-[var(--text-secondary)]">
                    {user.proExpiresAt 
                      ? `~${new Date(user.proExpiresAt).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\s/g, '')}까지` 
                      : '무료 체험 중'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Badge Selection Cards (Visible if at least one badge is earned or user is PRO) */}
          {(() => {
            const hasInvestmentType = !!(user.investmentType && user.investmentType !== '미진단');
            const hasTermsQuizBest = !!user.termsQuizBest;
            const hasProBadge = isPro;

            if (!hasInvestmentType && !hasTermsQuizBest && !hasProBadge) return null;

            const isTypeActive = user.activeBadge === 'investmentType';
            const isQuizActive = user.activeBadge === 'terms_percentile';
            const isProActive = user.activeBadge === 'pro';

            return (
              <div className="space-y-1.5">
                <div className="text-[11px] text-[var(--text-secondary)] font-bold px-0.5">
                  노출 뱃지 선택
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  {/* Option 1: PRO Badge (First) */}
                  {hasProBadge && (
                    <button
                      type="button"
                      onClick={() => updateActiveBadge?.(isProActive ? 'none' : 'pro')}
                      className={`p-2 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between space-y-1.5 ${
                        isProActive
                          ? 'bg-[var(--card-surface)] border-[var(--accent-orange)] shadow-xs'
                          : 'bg-[var(--card-hover)] border-[var(--border-color)] opacity-70 hover:opacity-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[9.5px] font-bold text-[var(--text-secondary)] truncate">멤버십</span>
                        {isProActive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-orange)] shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center justify-center pt-0.5">
                        <span className="animate-pro-badge inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold font-mono text-[var(--accent-orange)] bg-[var(--accent-orange)]/15 border border-[var(--accent-orange)]/50 select-none leading-none">
                          <Crown className="w-2.5 h-2.5 stroke-[2.4] fill-[var(--accent-orange)]/20 animate-pulse" />
                          <span className="tracking-wide">PRO</span>
                        </span>
                      </div>
                    </button>
                  )}

                  {/* Option 2: Investment Type Badge (Second) */}
                  {hasInvestmentType && (
                    <button
                      type="button"
                      onClick={() => updateActiveBadge?.(isTypeActive ? 'none' : 'investmentType')}
                      className={`p-2 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between space-y-1.5 ${
                        isTypeActive
                          ? 'bg-[var(--card-surface)] border-[var(--accent-orange)] shadow-xs'
                          : 'bg-[var(--card-hover)] border-[var(--border-color)] opacity-70 hover:opacity-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[9.5px] font-bold text-[var(--text-secondary)] truncate">성향</span>
                        {isTypeActive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-orange)] shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center justify-center pt-0.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold font-mono text-[var(--text-secondary)] bg-[var(--bg-main)]/80 border border-[var(--border-color)] leading-none select-none">
                          {user.investmentType}
                        </span>
                      </div>
                    </button>
                  )}

                  {/* Option 3: Terms Quiz Rank Badge (Third) */}
                  {hasTermsQuizBest && (
                    <button
                      type="button"
                      onClick={() => updateActiveBadge?.(isQuizActive ? 'none' : 'terms_percentile')}
                      className={`p-2 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between space-y-1.5 ${
                        isQuizActive
                          ? 'bg-[var(--card-surface)] border-[var(--accent-orange)] shadow-xs'
                          : 'bg-[var(--card-hover)] border-[var(--border-color)] opacity-70 hover:opacity-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[9.5px] font-bold text-[var(--text-secondary)] truncate">퀴즈</span>
                        {isQuizActive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-orange)] shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center justify-center pt-0.5">
                        <span 
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold font-mono transition-all leading-none select-none ${
                            (user.termsQuizBest?.percentile && user.termsQuizBest?.percentile <= 10) || user.termsQuizBest?.badgeName?.includes('마스터')
                              ? 'animate-elite-badge text-emerald-500 bg-emerald-500/10 border border-emerald-500/40'
                              : 'text-[var(--text-secondary)] bg-[var(--bg-main)]/80 border border-[var(--border-color)]'
                          }`}
                        >
                          {user.termsQuizBest?.badgeName || `상위 ${user.termsQuizBest?.percentile}%`}
                        </span>
                      </div>
                    </button>
                  )}
                </div>
              </div>
            );
          })()}

          {/* PRO Code Redeem Accordion (Only visible if not PRO) */}
          {!isPro && (
            <SmoothHeight duration={250}>
              <div className="space-y-1.5">
                {!isRedeemingCode ? (
                  <button
                    type="button"
                    onClick={() => {
                      setIsRedeemingCode(true);
                      setIsChangingPin(false);
                      setPromoError(null);
                      setPromoSuccess(null);
                    }}
                    className="w-full py-2 px-3 rounded-full text-xs font-bold text-[var(--accent-orange)] hover:bg-[var(--accent-orange)]/10 hover:border-[rgba(241,143,1,0.5)] active:scale-95 transition-all border border-[var(--accent-orange)]/30 flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Crown className="w-3.5 h-3.5 stroke-[2.2]" />
                    <span>PRO 코드 인증</span>
                  </button>
                ) : (
                  <div className="p-3.5 rounded-2xl bg-[var(--card-hover)] border border-[var(--border-color)] space-y-2.5 animate-fade-in text-left">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                        <Crown className="w-3.5 h-3.5 text-[var(--accent-orange)] stroke-[2.2]" />
                        <span>PRO 코드 인증</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsRedeemingCode(false)}
                        className="text-[11px] text-[var(--text-secondary)] hover:text-red-500 font-medium cursor-pointer"
                      >
                        취소
                      </button>
                    </div>

                    <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-[var(--accent-orange)]/10 border border-[var(--accent-orange)]/30 text-[10.5px]">
                      <span className="text-[var(--text-secondary)] font-medium">무료 코드: <strong className="text-[var(--accent-orange)] font-mono font-bold">JU26</strong></span>
                      <button
                        type="button"
                        onClick={() => {
                          setPromoCode('JU26');
                          setPromoError(null);
                        }}
                        className="text-[10px] font-bold text-[var(--accent-orange)] hover:underline cursor-pointer"
                      >
                        코드 입력하기
                      </button>
                    </div>

                    <div className="space-y-2">
                      <input
                        type="text"
                        maxLength={10}
                        value={promoCode}
                        onChange={(e) => {
                          setPromoCode(e.target.value);
                          setPromoError(null);
                        }}
                        placeholder="4자리 코드 입력 (예: JU26)"
                        className="w-full px-3 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50 focus:outline-none focus:border-[var(--accent-orange)] focus:ring-1 focus:ring-[var(--accent-orange)]/30 transition-all font-mono tracking-wider uppercase text-center font-bold"
                      />
                    </div>

                    {promoError && (
                      <div className="text-[11px] text-red-500 font-medium flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{promoError}</span>
                      </div>
                    )}

                    {promoSuccess && (
                      <div className="text-[11px] text-[var(--accent-green)] font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 shrink-0" />
                        <span>{promoSuccess}</span>
                      </div>
                    )}

                    <button
                      type="button"
                      disabled={isCodeSubmitting || !promoCode.trim()}
                      onClick={handlePromoCodeSubmit}
                      className="w-full py-2.5 px-3 rounded-full text-xs font-bold bg-[var(--accent-orange)] text-white hover:brightness-105 hover:shadow-[0_0_18px_rgba(241,143,1,0.28)] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs border border-[var(--accent-orange)]"
                    >
                      {isCodeSubmitting ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>확인 중...</span>
                        </>
                      ) : (
                        <span>코드 인증 및 활성화</span>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </SmoothHeight>
          )}

          {/* PIN Change Accordion */}
          <SmoothHeight duration={250}>
            <div className="space-y-1.5">
              {!isChangingPin ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsChangingPin(true);
                    setIsRedeemingCode(false);
                    setNewPin('');
                    setNewPinConfirm('');
                    setPinChangeError(null);
                    setPinChangeSuccess(null);
                  }}
                  className="w-full py-2.5 px-3 rounded-full text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--accent-orange)] hover:bg-[var(--card-hover)] hover:border-[rgba(241,143,1,0.5)] hover:shadow-[0_0_14px_rgba(241,143,1,0.18)] active:scale-95 transition-all border border-[var(--border-color)] flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5 text-[var(--accent-orange)]" />
                  <span>핀번호 변경</span>
                </button>
              ) : (
              <div className="p-3.5 rounded-2xl bg-[var(--card-hover)] border border-[var(--border-color)] space-y-2.5 animate-fade-in text-left">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-[var(--accent-orange)]" />
                    <span>새 핀번호 설정</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsChangingPin(false)}
                    className="text-[11px] text-[var(--text-secondary)] hover:text-red-500 font-medium cursor-pointer"
                  >
                    취소
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="relative">
                    <input
                      type={showNewPin ? 'text' : 'password'}
                      maxLength={6}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={newPin}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        setNewPin(val);
                        setPinChangeError(null);
                      }}
                      placeholder="새 핀번호 6자리"
                      className="w-full pl-3 pr-9 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50 focus:outline-none focus:border-[var(--accent-orange)] focus:ring-1 focus:ring-[var(--accent-orange)]/30 transition-all font-mono tracking-widest"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPin(!showNewPin)}
                      className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                    >
                      {showNewPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <input
                    type={showNewPin ? 'text' : 'password'}
                    maxLength={6}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={newPinConfirm}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      setNewPinConfirm(val);
                      setPinChangeError(null);
                    }}
                    placeholder="새 핀번호 확인 (6자리)"
                    className="w-full px-3 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50 focus:outline-none focus:border-[var(--accent-orange)] focus:ring-1 focus:ring-[var(--accent-orange)]/30 transition-all font-mono tracking-widest"
                  />
                </div>

                {pinChangeError && (
                  <div className="text-[11px] text-red-500 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{pinChangeError}</span>
                  </div>
                )}

                {pinChangeSuccess && (
                  <div className="text-[11px] text-[var(--accent-green)] font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 shrink-0" />
                    <span>{pinChangeSuccess}</span>
                  </div>
                )}

                <button
                  type="button"
                  disabled={isPinChanging || newPin.length !== 6 || newPinConfirm.length !== 6}
                  onClick={handlePinChangeSubmit}
                  className="w-full py-2.5 px-3 rounded-full text-xs font-bold bg-[var(--accent-orange)] text-white hover:brightness-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                >
                  {isPinChanging ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>변경 중...</span>
                    </>
                  ) : (
                    <span>핀번호 변경 완료</span>
                  )}
                </button>
              </div>
            )}
          </div>
        </SmoothHeight>

          <button
            onClick={() => {
              logout();
              onClose();
            }}
            className="w-full py-2.5 px-3 rounded-full font-bold text-xs text-red-500 hover:bg-red-500/10 hover:border-red-500/40 active:scale-95 transition-all border border-red-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>로그아웃</span>
          </button>

          <p className="text-[10px] text-[var(--text-secondary)] opacity-60 text-center font-normal pt-0.5">
            * 1년 이상 미접속 시 기록은 자동 파기됩니다.
          </p>
        </div>
      ) : (
        /* Form */
        <form onSubmit={handleSubmit} className="space-y-3.5">
          
          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs flex items-start gap-1.5 font-medium animate-fade-in">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-2.5 rounded-xl bg-[var(--accent-green)]/15 border border-[var(--accent-green)]/30 text-[var(--accent-green)] text-xs flex items-center gap-1.5 font-medium animate-fade-in">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="space-y-3">
            {/* Nickname Input */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--text-primary)] flex items-center justify-between">
                <span>닉네임</span>
                <span className="text-[10px] text-[var(--text-secondary)] font-normal">2~12자</span>
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="예: 성공개미"
                maxLength={12}
                disabled={isLoading}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50 focus:outline-none focus:border-[var(--accent-orange)] focus:ring-1 focus:ring-[var(--accent-orange)]/30 transition-all font-sans disabled:opacity-50"
                required
              />
            </div>

            {/* PIN Input */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--text-primary)] flex items-center justify-between">
                <span>핀번호</span>
                <span className="text-[10px] text-[var(--text-secondary)] font-normal">숫자 6자리</span>
              </label>
              <div className="relative">
                <input
                  type={showPin ? 'text' : 'password'}
                  value={pin}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    if (val.length <= 6) setPin(val);
                  }}
                  placeholder="숫자 6자리 (예: 123456)"
                  maxLength={6}
                  inputMode="numeric"
                  disabled={isLoading}
                  className="w-full pl-3 pr-9 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50 focus:outline-none focus:border-[var(--accent-orange)] focus:ring-1 focus:ring-[var(--accent-orange)]/30 transition-all font-mono tracking-widest disabled:opacity-50"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                >
                  {showPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-1 py-2.5 px-3 rounded-full bg-[var(--accent-orange)] hover:brightness-110 text-white font-bold text-xs sm:text-sm transition-all duration-200 active:scale-98 shadow-sm hover:shadow-[0_0_16px_rgba(241,143,1,0.28)] cursor-pointer disabled:opacity-50"
          >
            {isLoading ? '서버 동기화 중...' : '로그인 / 계정 만들기'}
          </button>
        </form>
      )}
    </div>
  );
}
