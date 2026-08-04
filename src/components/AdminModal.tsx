'use client';

import React, { useEffect, useState } from 'react';
import { Users, BookOpen, PieChart, RefreshCw, Search, X, Clock, CheckCircle } from 'lucide-react';

interface AdminUserRecord {
  nickname: string;
  createdAt: string;
  lastActiveAt: string;
  completedLessonsCount: number;
  investmentType: string;
  hasSimulatorSettings: boolean;
}

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminModal({ isOpen, onClose }: AdminModalProps) {
  const [isClosing, setIsClosing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  const handleClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 200);
  };

  const fetchAdminData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      if (typeof window === 'undefined') return;
      const storedPin = localStorage.getItem('jusik_user_pin') || '';

      const res = await fetch(`/api/admin/users?nickname=${encodeURIComponent('주식부엉')}&pin=${encodeURIComponent(storedPin)}`);
      const data = await res.json();

      if (!data.success) {
        setErrorMsg(data.error || '권한이 없거나 데이터 로드 실패');
      } else {
        setUsers(data.users || []);
        setTotalUsers(data.totalUsers || 0);
      }
    } catch (err) {
      setErrorMsg('서버와 통신 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
      fetchAdminData();
    }
  }, [isOpen]);

  if (!isOpen && !isClosing) return null;

  const filteredUsers = users.filter((u) =>
    u.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.investmentType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const completedAnyLessonCount = users.filter(u => u.completedLessonsCount > 0).length;
  const surveyedTypeCount = users.filter(u => u.investmentType !== '미진단').length;

  return (
    <div 
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm ${
        isClosing ? 'animate-fade-out-overlay' : 'animate-fade-in-overlay'
      }`}
      onClick={handleClose}
    >
      <div 
        className={`w-full max-w-lg glass-card border border-[var(--border-color)] rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col text-left text-[var(--text-primary)] ${
          isClosing ? 'animate-modal-shrink' : 'animate-modal-expand'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between shrink-0 pb-1">
          <h2 className="text-base sm:text-lg font-extrabold text-[var(--text-primary)]">
            관리자 미니 대시보드
          </h2>

          <div className="flex items-center gap-1.5">
            <button
              onClick={fetchAdminData}
              disabled={loading}
              className="p-1.5 rounded-xl hover:bg-[var(--card-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer disabled:opacity-50"
              title="새로고침"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleClose}
              className="p-1.5 rounded-xl hover:bg-[var(--card-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer"
              title="닫기"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Overview Stats (3 Grid Cards) - Unified Theme System */}
        <div className="grid grid-cols-3 gap-2.5 shrink-0">
          <div className="p-3 rounded-2xl bg-[var(--bg-main)]/60 border border-[var(--border-color)] space-y-0.5 text-center">
            <div className="flex items-center justify-center gap-1 text-[11px] text-[var(--text-secondary)]">
              <Users className="w-3.5 h-3.5 text-[var(--accent-orange)]" />
              <span>총 회원</span>
            </div>
            <div className="text-lg font-extrabold text-[var(--accent-orange)] font-mono">
              {totalUsers}<span className="text-[10px] font-normal text-[var(--text-secondary)]">명</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[var(--bg-main)]/60 border border-[var(--border-color)] space-y-0.5 text-center">
            <div className="flex items-center justify-center gap-1 text-[11px] text-[var(--text-secondary)]">
              <BookOpen className="w-3.5 h-3.5 text-[var(--accent-green)]" />
              <span>수강 회원</span>
            </div>
            <div className="text-lg font-extrabold text-[var(--accent-green)] font-mono">
              {completedAnyLessonCount}<span className="text-[10px] font-normal text-[var(--text-secondary)]">명</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[var(--bg-main)]/60 border border-[var(--border-color)] space-y-0.5 text-center">
            <div className="flex items-center justify-center gap-1 text-[11px] text-[var(--text-secondary)]">
              <PieChart className="w-3.5 h-3.5 text-blue-400" />
              <span>진단 유저</span>
            </div>
            <div className="text-lg font-extrabold text-blue-400 font-mono">
              {surveyedTypeCount}<span className="text-[10px] font-normal text-[var(--text-secondary)]">명</span>
            </div>
          </div>
        </div>

        {/* Search Input - Unified AuthPopover Input Theme */}
        <div className="relative shrink-0">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="닉네임 또는 성향 검색"
            className="w-full pl-8 pr-3 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50 focus:outline-none focus:border-[var(--accent-orange)] focus:ring-1 focus:ring-[var(--accent-orange)]/30 transition-all font-sans"
          />
        </div>

        {errorMsg && (
          <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-medium shrink-0">
            {errorMsg}
          </div>
        )}

        {/* Scrollable User List - Unified Theme Surface & Border */}
        <div className="flex-1 overflow-y-auto min-h-[160px] rounded-2xl bg-[var(--bg-main)]/50 border border-[var(--border-color)]">
          {loading && users.length === 0 ? (
            <div className="py-10 text-center text-xs text-[var(--text-secondary)] flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-[var(--accent-orange)]" />
              <span>회원 데이터를 로드하고 있습니다...</span>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-10 text-center text-xs text-[var(--text-secondary)] opacity-70">
              검색 조건에 일치하는 회원이 없습니다.
            </div>
          ) : (
            <div className="divide-y divide-[var(--border-color)] text-xs">
              {filteredUsers.map((u) => (
                <div key={u.nickname} className="p-3 hover:bg-[var(--card-hover)] transition-colors flex items-center justify-between gap-3">
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-[var(--text-primary)] font-mono truncate">
                        {u.nickname}
                      </span>
                      {u.nickname === '주식부엉' && (
                        <span className="px-1.5 py-0.2 rounded bg-[var(--accent-orange)]/20 text-[var(--accent-orange)] text-[9px] font-bold shrink-0">
                          관리자
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-[var(--text-secondary)] flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      <span>{new Date(u.createdAt).toLocaleDateString('ko-KR')} 가입</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-right shrink-0">
                    <div className="space-y-0.5">
                      <div className="text-[10px]">
                        {u.investmentType !== '미진단' ? (
                          <span className="text-[var(--accent-orange)] font-bold">{u.investmentType}</span>
                        ) : (
                          <span className="text-[var(--text-secondary)] opacity-50">미진단</span>
                        )}
                      </div>
                      <div className="text-[10px] text-[var(--accent-green)] font-mono font-semibold">
                        강좌 {u.completedLessonsCount}개 완료
                      </div>
                    </div>

                    {u.hasSimulatorSettings && (
                      <span title="시뮬레이터 설정 보유">
                        <CheckCircle className="w-3.5 h-3.5 text-[var(--accent-green)] shrink-0" />
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-1 text-center shrink-0">
          <p className="text-[10px] text-[var(--text-secondary)] opacity-60">
            총 {filteredUsers.length}명의 회원 기록이 조회되었습니다.
          </p>
        </div>
      </div>
    </div>
  );
}
