'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { User, CheckCircle2, AlertCircle, Eye, EyeOff, LogOut, BookmarkCheck } from 'lucide-react';

interface AuthPopoverProps {
  onClose: () => void;
}

export default function AuthPopover({ onClose }: AuthPopoverProps) {
  const { login, user, logout } = useAuth();
  
  const [nickname, setNickname] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const result = login(nickname, pin);
    if (!result.success) {
      setErrorMsg(result.error || '입력 정보를 확인해 주세요.');
    } else {
      setSuccessMsg('로그인되었습니다!');
      setTimeout(() => {
        onClose();
      }, 700);
    }
  };

  return (
    <div className="w-[300px] sm:w-[330px] p-5 rounded-2xl glass-card shadow-2xl space-y-4 border border-[var(--border-color)] animate-popover-expand text-left">
      
      {/* Header Copy */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--accent-orange)]">
          <BookmarkCheck className="w-4 h-4" />
          <span>{user ? '내 계정 정보' : '내 기록 보관'}</span>
        </div>
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-normal">
          닉네임과 핀번호 6자리로 학습 기록과 내 성향 및 투자일지를 보관하세요.
        </p>
      </div>

      {user ? (
        /* Logged in view */
        <div className="space-y-3 pt-1">
          <div className="p-3.5 rounded-xl bg-[var(--card-hover)] border border-[var(--border-color)] space-y-1 text-center">
            <div className="text-[11px] text-[var(--text-secondary)]">현재 로그인 닉네임</div>
            <div className="text-base font-bold text-[var(--accent-orange)] font-mono">
              {user.nickname}
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-[var(--accent-green)]/10 text-[var(--accent-green)] text-xs flex items-center justify-center gap-1.5 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>학습 기록과 성향이 자동 보관됩니다.</span>
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
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50 focus:outline-none focus:border-[var(--accent-orange)] focus:ring-1 focus:ring-[var(--accent-orange)]/30 transition-all font-sans"
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
                  className="w-full pl-3 pr-9 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50 focus:outline-none focus:border-[var(--accent-orange)] focus:ring-1 focus:ring-[var(--accent-orange)]/30 transition-all font-mono tracking-widest"
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
            className="w-full mt-1 py-2.5 px-3 rounded-xl bg-[var(--accent-orange)] hover:bg-[var(--accent-orange)]/90 text-white font-bold text-xs sm:text-sm transition-all duration-200 active:scale-98 shadow-sm hover:shadow-[0_0_15px_rgba(241,143,1,0.25)] cursor-pointer"
          >
            로그인 / 계정 만들기
          </button>
        </form>
      )}
    </div>
  );
}
