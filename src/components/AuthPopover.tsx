'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { User, CheckCircle2, AlertCircle, Eye, EyeOff, LogOut, BookmarkCheck, MoreVertical, Compass, ChevronRight, Camera, RefreshCw } from 'lucide-react';
import { PERSONALITY_PROFILES } from '@/data/investmentSurvey';

interface AuthPopoverProps {
  onClose: () => void;
  onOpenAdmin?: () => void;
}

export default function AuthPopover({ onClose, onOpenAdmin }: AuthPopoverProps) {
  const { login, user, logout, updateAvatar, isAuthPopoverClosing } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [nickname, setNickname] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

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

  // Avatar source resolution
  const userAvatarSrc = user?.avatarUrl
    ? user.avatarUrl
    : user?.nickname === '주식부엉'
    ? '/logo.png'
    : '/default-avatar.png';

  return (
    <div 
      className={`w-[300px] sm:w-[330px] p-5 rounded-2xl bg-[var(--bg-main)] shadow-2xl space-y-4 border border-[var(--border-color)] text-left ${
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

            {/* Centered Nickname & Status */}
            <div className="space-y-0.5">
              <div className="text-[10px] text-[var(--text-secondary)] font-medium">내 계정</div>
              <div className="text-base font-bold text-[var(--text-primary)] flex items-center justify-center gap-1.5 font-mono">
                <span>{user.nickname}</span>
                {user.nickname === '주식부엉' && (
                  <span className="px-1.5 py-0.2 rounded-md bg-[var(--accent-green)]/20 text-[var(--accent-green)] text-[9px] font-sans font-bold">
                    관리자
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Investment Type Card */}
          <div className="p-3.5 rounded-xl bg-[var(--card-hover)] border border-[var(--border-color)] space-y-1.5 text-center">
            <div className="text-[11px] text-[var(--text-secondary)] font-medium flex items-center justify-center gap-1">
              <Compass className="w-3.5 h-3.5 text-[var(--accent-orange)]" />
              <span>나의 투자 성향</span>
            </div>
            {user.investmentType && user.investmentType !== '미진단' && PERSONALITY_PROFILES[user.investmentType] ? (
              <div className="space-y-1.5 pt-0.5">
                <div className="text-sm font-extrabold text-[var(--text-primary)]">
                  {PERSONALITY_PROFILES[user.investmentType].name}{' '}
                  <span className="text-xs font-bold text-[var(--accent-orange)] font-mono">
                    ({user.investmentType})
                  </span>
                </div>
                <Link
                  href={`/tools/type?result=${user.investmentType}`}
                  onClick={onClose}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--accent-orange)] hover:underline cursor-pointer"
                >
                  <span>진단 결과 보기</span>
                  <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            ) : (
              <div className="space-y-1.5 pt-0.5">
                <div className="text-xs text-[var(--text-secondary)] opacity-70">
                  아직 진단을 진행하지 않았습니다.
                </div>
                <Link
                  href="/tools/type"
                  onClick={onClose}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--accent-orange)] hover:underline cursor-pointer"
                >
                  <span>내 성향 진단하기</span>
                  <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            )}
          </div>

          <div className="p-2.5 rounded-xl bg-[var(--accent-green)]/10 text-[var(--accent-green)] text-xs flex items-center justify-center gap-1.5 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>서버 동기화 상태 유지 중</span>
          </div>

          <button
            onClick={() => {
              logout();
              onClose();
            }}
            className="w-full py-2.5 px-3 rounded-xl font-bold text-xs text-red-500 hover:bg-red-500/10 transition-all border border-red-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
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
            className="w-full mt-1 py-2.5 px-3 rounded-xl bg-[var(--accent-orange)] hover:bg-[var(--accent-orange)]/90 text-white font-bold text-xs sm:text-sm transition-all duration-200 active:scale-98 shadow-sm hover:shadow-[0_0_15px_rgba(241,143,1,0.25)] cursor-pointer disabled:opacity-50"
          >
            {isLoading ? '서버 동기화 중...' : '로그인 / 계정 만들기'}
          </button>
        </form>
      )}
    </div>
  );
}
