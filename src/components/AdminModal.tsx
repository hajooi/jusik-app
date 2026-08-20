'use client';

import React, { useEffect, useState } from 'react';
import { Users, BookOpen, PieChart, RefreshCw, Search, X, Clock, CheckCircle, BarChart3, ChevronRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { PERSONALITY_PROFILES } from '@/data/investmentSurvey';

interface AdminUserRecord {
  nickname: string;
  createdAt: string;
  lastActiveAt: string;
  completedLessonsCount: number;
  investmentType: string;
  hasSimulatorSettings: boolean;
}

interface SurveyStatsResponse {
  totalCount: number;
  typeCounts: Record<string, number>;
  percentages: Record<string, number>;
}

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminModal({ isOpen, onClose }: AdminModalProps) {
  const { user } = useAuth();
  const [isClosing, setIsClosing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Active Tab View: 'users' | 'surveyStats' | 'lessonStats'
  const [activeTab, setActiveTab] = useState<'users' | 'surveyStats' | 'lessonStats'>('users');
  const [surveyStats, setSurveyStats] = useState<SurveyStatsResponse | null>(null);

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
      let storedPin = user?.pin || '';
      if (!storedPin && typeof window !== 'undefined') {
        const userAccountStr = localStorage.getItem('jusik_user_account');
        if (userAccountStr) {
          try {
            const parsed = JSON.parse(userAccountStr);
            storedPin = parsed.pin || '';
          } catch (e) {}
        }
      }

      const adminNickname = user?.nickname || '주식부엉';
      const timestamp = Date.now();
      const noCacheHeaders = {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
      };

      // 1. Fetch Admin Users List (Real-time No-Cache)
      const res = await fetch(
        `/api/admin/users?nickname=${encodeURIComponent(adminNickname)}&pin=${encodeURIComponent(storedPin)}&_t=${timestamp}`,
        {
          cache: 'no-store',
          headers: noCacheHeaders,
        }
      );
      const data = await res.json();

      if (!data.success) {
        setErrorMsg(data.error || '권한이 없거나 데이터 로드 실패');
      } else {
        setUsers(data.users || []);
        setTotalUsers(data.totalUsers || 0);
      }

      // 2. Fetch All Anonymous & Member Survey Stats (Real-time No-Cache)
      const statsRes = await fetch(`/api/survey-stats?_t=${timestamp}`, {
        cache: 'no-store',
        headers: noCacheHeaders,
      });
      const statsData = await statsRes.json();
      if (statsData.success) {
        setSurveyStats({
          totalCount: statsData.totalCount || 0,
          typeCounts: statsData.typeCounts || {},
          percentages: statsData.percentages || {}
        });
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
      className={`fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md ${
        isClosing ? 'animate-fade-out-overlay' : 'animate-fade-in-overlay'
      }`}
      onClick={handleClose}
    >
      <div 
        className={`w-full max-w-lg glass-card border border-[var(--border-color)] rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[88vh] flex flex-col text-left text-[var(--text-primary)] ${
          isClosing ? 'animate-modal-shrink' : 'animate-modal-expand'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between shrink-0 pb-1">
          <h2 className="text-base sm:text-lg font-extrabold text-[var(--text-primary)] flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[var(--accent-orange)]" />
            관리자 대시보드
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

        {/* Overview Stats (3 Interactive Grid Cards -> Switch Tabs) */}
        <div className="grid grid-cols-3 gap-2.5 shrink-0">
          <button
            onClick={() => setActiveTab('users')}
            className={`p-3 rounded-2xl border text-center transition-all cursor-pointer active:scale-95 ${
              activeTab === 'users'
                ? 'bg-[var(--card-hover)] border-[var(--accent-orange)] shadow-[0_0_15px_rgba(241,143,1,0.2)]'
                : 'bg-[var(--bg-main)]/60 border-[var(--border-color)] hover:border-[var(--accent-orange)]/40'
            }`}
          >
            <div className="flex items-center justify-center gap-1 text-[11px] text-[var(--text-secondary)]">
              <Users className="w-3.5 h-3.5 text-[var(--accent-orange)]" />
              <span>총 회원</span>
            </div>
            <div className="text-lg font-extrabold text-[var(--accent-orange)] font-mono">
              {totalUsers}<span className="text-[10px] font-normal text-[var(--text-secondary)]">명</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('lessonStats')}
            className={`p-3 rounded-2xl border text-center transition-all cursor-pointer active:scale-95 ${
              activeTab === 'lessonStats'
                ? 'bg-[var(--card-hover)] border-[var(--accent-green)] shadow-[0_0_15px_rgba(104,166,125,0.2)]'
                : 'bg-[var(--bg-main)]/60 border-[var(--border-color)] hover:border-[var(--accent-green)]/40'
            }`}
          >
            <div className="flex items-center justify-center gap-1 text-[11px] text-[var(--text-secondary)]">
              <BookOpen className="w-3.5 h-3.5 text-[var(--accent-green)]" />
              <span>수강 회원</span>
            </div>
            <div className="text-lg font-extrabold text-[var(--accent-green)] font-mono">
              {completedAnyLessonCount}<span className="text-[10px] font-normal text-[var(--text-secondary)]">명</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('surveyStats')}
            className={`p-3 rounded-2xl border text-center transition-all cursor-pointer active:scale-95 ${
              activeTab === 'surveyStats'
                ? 'bg-[var(--card-hover)] border-blue-400 shadow-[0_0_15px_rgba(96,165,250,0.2)]'
                : 'bg-[var(--bg-main)]/60 border-[var(--border-color)] hover:border-blue-400/40'
            }`}
          >
            <div className="flex items-center justify-center gap-1 text-[11px] text-[var(--text-secondary)]">
              <PieChart className="w-3.5 h-3.5 text-blue-400" />
              <span>진단 통계</span>
            </div>
            <div className="text-lg font-extrabold text-blue-400 font-mono">
              {surveyStats ? surveyStats.totalCount : surveyedTypeCount}<span className="text-[10px] font-normal text-[var(--text-secondary)]">회</span>
            </div>
          </button>
        </div>

        {errorMsg && (
          <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-medium shrink-0">
            {errorMsg}
          </div>
        )}

        {/* TAB 1: USER LIST */}
        {activeTab === 'users' && (
          <>
            {/* Search Input */}
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

            <div className="flex-1 overflow-y-auto min-h-[180px] rounded-2xl bg-[var(--bg-main)]/50 border border-[var(--border-color)]">
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
          </>
        )}

        {/* TAB 2: SURVEY STATS (ANONYMOUS + USERS POPULATION RATIO) */}
        {activeTab === 'surveyStats' && (
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            <div className="p-3 rounded-2xl bg-[var(--card-hover)]/60 border border-blue-400/30 flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-[var(--text-primary)]">
                  전체 투자 성향 진단 참여 통계
                </div>
                <div className="text-[11px] text-[var(--text-secondary)]">
                  비로그인 사용자를 포함한 누적 진단 아카이브
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-black text-blue-400 font-mono">
                  총 {surveyStats?.totalCount || 0}회
                </span>
              </div>
            </div>

            {/* 16 Personality Profile Distribution List */}
            <div className="space-y-2">
              <h4 className="text-xs font-extrabold text-[var(--text-secondary)] px-1">
                유형별 전체 인구 비율 분포
              </h4>

              <div className="space-y-2">
                {Object.keys(PERSONALITY_PROFILES).map((code) => {
                  const profile = PERSONALITY_PROFILES[code];
                  const count = surveyStats?.typeCounts[code] || 0;
                  const pct = surveyStats?.percentages[code] || 0;

                  return (
                    <div key={code} className="p-3 rounded-2xl bg-[var(--bg-main)]/60 border border-[var(--border-color)] space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-[var(--accent-orange)] font-mono">{code}</span>
                          <span className="font-bold text-[var(--text-primary)] truncate max-w-[150px]">{profile.name}</span>
                        </div>
                        <div className="flex items-center gap-2 font-mono">
                          <span className="text-xs font-black text-blue-400">{pct}%</span>
                          <span className="text-[10px] text-[var(--text-secondary)]">({count}명)</span>
                        </div>
                      </div>

                      {/* Percentage Bar */}
                      <div className="w-full h-1.5 bg-[var(--card-hover)] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[var(--accent-orange)] to-blue-400 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, pct)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: LESSON COMPLETION STATS */}
        {activeTab === 'lessonStats' && (
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            <div className="p-3 rounded-2xl bg-[var(--card-hover)]/60 border border-[var(--border-color)] flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-[var(--text-primary)]">
                  수강 회원 진도 및 완강 현황
                </div>
                <div className="text-[11px] text-[var(--text-secondary)]">
                  1개 이상 강좌를 수강 완료한 회원 통계
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-black text-[var(--accent-green)] font-mono">
                  {completedAnyLessonCount}명 수강 중
                </span>
              </div>
            </div>

            <div className="divide-y divide-[var(--border-color)] rounded-2xl bg-[var(--bg-main)]/60 border border-[var(--border-color)]">
              {users.filter(u => u.completedLessonsCount > 0).map((u) => (
                <div key={u.nickname} className="p-3 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <span className="font-bold text-[var(--text-primary)] font-mono">{u.nickname}</span>
                    <div className="text-[10px] text-[var(--text-secondary)]">
                      {new Date(u.lastActiveAt).toLocaleDateString('ko-KR')} 최근 접속
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-2.5 py-1 rounded-full bg-[var(--accent-green)]/15 text-[var(--accent-green)] font-extrabold text-[11px] font-mono">
                      {u.completedLessonsCount}개 강좌 수강 완료
                    </span>
                  </div>
                </div>
              ))}
              {completedAnyLessonCount === 0 && (
                <div className="p-6 text-center text-xs text-[var(--text-secondary)]">
                  아직 수강을 시작한 회원이 없습니다.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="pt-1 text-center shrink-0">
          <p className="text-[10px] text-[var(--text-secondary)] opacity-60">
            주식부엉 (jusik.app) 마스터 통계 데이터입니다.
          </p>
        </div>
      </div>
    </div>
  );
}

