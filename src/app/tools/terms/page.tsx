'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Timer,
  Trophy,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Share2,
  Zap,
  Layers,
  Check,
  Swords,
  ChevronDown,
  ChevronUp,
  LogIn,
  Award,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { TERMS_QUIZ_DATA, QUIZ_LEVELS, QuizQuestion } from '@/data/termsQuizData';
import RevealOnScroll from '@/components/common/RevealOnScroll';
import TypePreviewPopover from '@/components/type/TypePreviewPopover';
import TermsQuizPreviewPopover from '@/components/TermsQuizPreviewPopover';

type QuizState = 'intro' | 'playing' | 'summary';

interface LeaderboardItem {
  id: string;
  rank: number;
  nickname: string;
  level: number;
  score: number;
  correctCount: number;
  totalQuestions: number;
  timeSpentSec: number;
  avatarUrl?: string;
  investmentType?: string;
  typeScores?: { g: number; a: number; l: number; r: number };
  percentile?: number;
  activeBadge?: string;
  termsQuizBest?: {
    level?: number;
    score?: number;
    correctCount?: number;
    timeSpentSec?: number;
    percentile?: number;
    badgeName?: string;
  };
}

// Fisher-Yates True Random Shuffle
function fisherYatesShuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function TermsQuizContent() {
  const searchParams = useSearchParams();
  const { user, openAuthPopover, updateTermsQuizResult } = useAuth();

  // 1:1 Challenge Battle URL Query Params
  const challengerNick = searchParams.get('challenger');
  const challengerLevel = searchParams.get('level') ? Number(searchParams.get('level')) as 1 | 2 | 3 | 4 : null;
  const challengerScore = searchParams.get('score') ? Number(searchParams.get('score')) : null;
  const challengerTime = searchParams.get('time') ? Number(searchParams.get('time')) : null;

  // Level & Leaderboard selection (Bidirectionally synced)
  const [selectedLevel, setSelectedLevel] = useState<1 | 2 | 3 | 4>(challengerLevel || 1);
  const [activeLeaderboardTab, setActiveLeaderboardTab] = useState<1 | 2 | 3 | 4>(challengerLevel || 1);
  const [quizState, setQuizState] = useState<QuizState>('intro');
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);

  // Popover Targets for Leaderboard items
  const [previewTarget, setPreviewTarget] = useState<{
    id: string;
    code: string;
    authorNickname?: string;
    typeScores?: { g: number; a: number; l: number; r: number };
    anchorRect?: { top: number; bottom: number; left: number; right: number; width: number; height: number };
  } | null>(null);

  const [quizPopoverTarget, setQuizPopoverTarget] = useState<{
    id: string;
    nickname: string;
    investmentType?: string;
    termsQuiz?: any;
    anchorRect?: { top: number; bottom: number; left: number; right: number; width: number; height: number };
  } | null>(null);

  // Quiz Play State (Continuous Sprint)
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [userAnswers, setUserAnswers] = useState<Array<{ questionId: string; selected: number; isCorrect: boolean }>>([]);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [timerActive, setTimerActive] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Avoid repeated questions across consecutive quizzes (Pool Cycling)
  const seenQuestionIdsRef = useRef<Record<number, Set<string>>>({
    1: new Set(),
    2: new Set(),
    3: new Set(),
    4: new Set(),
  });

  // Final Result State
  const [finalResult, setFinalResult] = useState<{
    score: number;
    correctCount: number;
    totalQuestions: number;
    timeSpentSec: number;
    percentile?: number;
    rank?: number;
    totalParticipants?: number;
    badgeName?: string;
  } | null>(null);

  // Review Accordion Expanded State
  const [expandedQuestions, setExpandedQuestions] = useState<Record<number, boolean>>({});
  const [copiedBattleLink, setCopiedBattleLink] = useState(false);

  // Bidirectional Level Selector
  const handleSelectLevel = (lvl: 1 | 2 | 3 | 4) => {
    setSelectedLevel(lvl);
    setActiveLeaderboardTab(lvl);
  };

  // Fetch Leaderboard
  const fetchLeaderboard = useCallback(async (level: number) => {
    try {
      setLeaderboardLoading(true);
      const res = await fetch(`/api/terms-leaderboard?level=${level}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.leaderboard)) {
        setLeaderboard(data.leaderboard);
      }
    } catch (e) {
      console.error('Failed to fetch leaderboard:', e);
    } finally {
      setLeaderboardLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard(activeLeaderboardTab);
  }, [activeLeaderboardTab, fetchLeaderboard]);

  // Timer Tick (0.01s continuous precision during sprint)
  useEffect(() => {
    if (timerActive) {
      const start = Date.now() - elapsedTime * 1000;
      timerRef.current = setInterval(() => {
        const now = Date.now();
        setElapsedTime(Number(((now - start) / 1000).toFixed(2)));
      }, 50);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerActive, elapsedTime]);

  // Start Speed Sprint (15 questions with true randomness & pool cycling)
  const startQuiz = (level: 1 | 2 | 3 | 4) => {
    setSelectedLevel(level);
    setActiveLeaderboardTab(level);

    const pool = TERMS_QUIZ_DATA.filter((q) => q.level === level);
    if (!seenQuestionIdsRef.current[level]) {
      seenQuestionIdsRef.current[level] = new Set();
    }
    const seenSet = seenQuestionIdsRef.current[level];

    // Filter questions not seen in recent consecutive runs
    let available = pool.filter((q) => !seenSet.has(q.id));
    if (available.length < 15) {
      seenSet.clear();
      available = pool;
    }

    // Fisher-Yates shuffle and pick 15 unique questions
    const shuffled = fisherYatesShuffle(available).slice(0, 15);
    shuffled.forEach((q) => seenSet.add(q.id));

    setQuestions(shuffled);
    setCurrentIndex(0);
    setSelectedOption(null);
    setUserAnswers([]);
    setElapsedTime(0);
    setTimerActive(true);
    setExpandedQuestions({});
    setQuizState('playing');
  };

  // Select Option during Sprint
  const handleSelectOption = (index: number) => {
    setSelectedOption(index);
  };

  // Move to next question or finish sprint
  const handleAdvance = () => {
    if (selectedOption === null) return;

    const currentQ = questions[currentIndex];
    const isCorrect = selectedOption === currentQ.answerIndex;

    const updatedAnswers = [
      ...userAnswers,
      {
        questionId: currentQ.id,
        selected: selectedOption,
        isCorrect,
      },
    ];
    setUserAnswers(updatedAnswers);

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
    } else {
      finishSprint(updatedAnswers);
    }
  };

  // Finish Sprint & Record Result
  const finishSprint = async (answers: Array<{ questionId: string; selected: number; isCorrect: boolean }>) => {
    setTimerActive(false);
    const totalTime = elapsedTime;
    const correctAnswers = answers.filter((a) => a.isCorrect).length;
    const totalQ = questions.length;
    const rawScore = correctAnswers * 1000;

    let percentile = 1;
    let rank = 1;
    let totalParticipants = 1;

    try {
      const res = await fetch('/api/terms-leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isGuest: !user?.nickname,
          nickname: user?.nickname || undefined,
          level: selectedLevel,
          score: rawScore,
          correctCount: correctAnswers,
          totalQuestions: totalQ,
          timeSpentSec: totalTime,
          avatarUrl: user?.avatarUrl,
          investmentType: user?.investmentType,
        }),
      });
      const data = await res.json();
      if (data.success) {
        percentile = data.percentile || 1;
        rank = data.rank || 1;
        totalParticipants = data.totalParticipants || (leaderboard.length + 1);
      }
    } catch (e) {
      console.error('Failed to calculate/submit score:', e);
      // Offline fallback calculation using loaded leaderboard
      const virtualParticipants = leaderboard.length + 1;
      const virtualRank =
        leaderboard.filter(
          (entry) =>
            entry.correctCount > correctAnswers ||
            (entry.correctCount === correctAnswers && entry.timeSpentSec <= totalTime)
        ).length + 1;
      rank = virtualRank;
      totalParticipants = virtualParticipants;
      percentile = Math.max(1, Math.round((virtualRank / virtualParticipants) * 100));
    }

    const badgeName =
      selectedLevel === 4 && correctAnswers >= 14
        ? '마스터'
        : `상위 ${percentile}%`;

    const resultData = {
      score: rawScore,
      correctCount: correctAnswers,
      totalQuestions: totalQ,
      timeSpentSec: totalTime,
      percentile,
      rank,
      totalParticipants,
      badgeName,
    };

    setFinalResult(resultData);

    if (user) {
      updateTermsQuizResult({
        level: selectedLevel,
        score: rawScore,
        correctCount: correctAnswers,
        timeSpentSec: totalTime,
        percentile,
        badgeName,
      });
    }

    setQuizState('summary');
  };

  const lastSyncedUserRef = useRef<string | null>(null);

  // Sync result after guest user logs in on the result page
  useEffect(() => {
    if (user && user.nickname && finalResult && quizState === 'summary') {
      if (lastSyncedUserRef.current === user.nickname) return;
      lastSyncedUserRef.current = user.nickname;

      fetch('/api/terms-leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nickname: user.nickname,
          level: selectedLevel,
          score: finalResult.score,
          correctCount: finalResult.correctCount,
          totalQuestions: finalResult.totalQuestions,
          timeSpentSec: finalResult.timeSpentSec,
          avatarUrl: user.avatarUrl,
          investmentType: user.investmentType,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setFinalResult((prev) =>
              prev
                ? {
                    ...prev,
                    percentile: data.percentile || prev.percentile,
                    rank: data.rank || prev.rank,
                    totalParticipants: data.totalParticipants || prev.totalParticipants,
                  }
                : null
            );
            updateTermsQuizResult({
              level: selectedLevel,
              score: finalResult.score,
              correctCount: finalResult.correctCount,
              timeSpentSec: finalResult.timeSpentSec,
              percentile: data.percentile || finalResult.percentile,
              badgeName: finalResult.badgeName,
            });
            fetchLeaderboard(selectedLevel);
          }
        })
        .catch(console.error);
    } else if (!user) {
      lastSyncedUserRef.current = null;
    }
  }, [user, quizState]);

  // Format seconds to mm:ss.ms
  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainingSecs = Math.floor(sec % 60);
    const millis = Math.floor((sec % 1) * 100);
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}.${millis.toString().padStart(2, '0')}`;
  };

  // 1:1 Challenge Battle Link Generation (Native Share Sheet or Clipboard Fallback)
  const handleCopyChallengeLink = async () => {
    if (!finalResult) return;
    const author = user?.nickname || '주식도전자';
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://jusik.app';
    const link = `${baseUrl}/tools/terms?challenger=${encodeURIComponent(author)}&level=${selectedLevel}&score=${finalResult.correctCount}&time=${finalResult.timeSpentSec}`;
    const message = `${author} 님의 실전 금융 용어 1:1 도전장 도착!\n${selectedLevel}단계 15문제 중 ${finalResult.correctCount}개 정답 (${formatTime(finalResult.timeSpentSec)}) 기록에 도전해 보세요 👇\n\n${link}`;

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          text: message,
        });
        return;
      } catch (err) {
        if ((err as Error)?.name === 'AbortError') return;
      }
    }

    if (navigator.clipboard) {
      navigator.clipboard.writeText(message);
      setCopiedBattleLink(true);
      setTimeout(() => setCopiedBattleLink(false), 2500);
    }
  };

  // Toggle Review Accordion
  const toggleQuestionReview = (idx: number) => {
    setExpandedQuestions((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const currentQ = questions[currentIndex];
  const levelInfo = QUIZ_LEVELS[selectedLevel];

  // Battle Win/Loss evaluation if challenger is present
  const battleResult = useMemo(() => {
    if (!finalResult || challengerScore === null || challengerTime === null) return null;
    const myScore = finalResult.correctCount;
    const myTime = finalResult.timeSpentSec;

    if (myScore > challengerScore) return 'win';
    if (myScore < challengerScore) return 'loss';
    if (myTime < challengerTime) return 'win';
    if (myTime > challengerTime) return 'loss';
    return 'draw';
  }, [finalResult, challengerScore, challengerTime]);

  return (
    <RevealOnScroll>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 select-none">
        {/* Top Header Navigation (Unified with site design) */}
        <div className="flex items-center justify-end">
          <Link
            href="/tools"
            className="inline-flex items-center gap-1.5 font-bold text-xs sm:text-sm text-[var(--text-secondary)] hover:text-[var(--accent-orange)] transition-all duration-300 glass-card glass-card-hover px-3.5 py-2 rounded-full active:scale-95 border border-[var(--border-color)]"
          >
            <ArrowLeft className="w-4 h-4" />
            투자도구 목록으로
          </Link>
        </div>

        {/* Left Aligned Minimal Hero Banner */}
        <div className="space-y-1 py-1 text-left">
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
            주식 용어 퀴즈
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium">
            점수와 스피드로 겨루는 실전 금융 용어 랭킹전! 내 진짜 실력을 측정해 보세요.
          </p>
        </div>

        {/* 1:1 Challenge Challenger Banner (If arrived via challenge link) */}
        {challengerNick && challengerScore !== null && challengerTime !== null && quizState === 'intro' && (
          <div className="p-4 rounded-2xl bg-[var(--card-surface)] border border-[var(--accent-orange)] shadow-[0_0_20px_rgba(241,143,1,0.18)] space-y-2 text-left animate-fadeIn">
            <div className="flex items-center gap-2 text-xs font-extrabold text-[var(--accent-orange)]">
              <Swords className="w-4 h-4" />
              <span>1:1 챌린지 도전장 도착!</span>
            </div>
            <p className="text-sm font-bold text-[var(--text-primary)]">
              <strong className="text-[var(--accent-orange)]">{challengerNick}</strong> 님이 {challengerLevel}단계 {challengerScore}/15문항 ({formatTime(challengerTime)}) 기록으로 도전장을 보냈습니다!
            </p>
            <p className="text-xs text-[var(--text-secondary)]">
              지금 바로 퀴즈를 시작해 상대방의 기록을 깨보세요.
            </p>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 1: INTRO & LEVEL SELECTION & LEADERBOARD           */}
        {/* ======================================================== */}
        {quizState === 'intro' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Level Cards Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-sm sm:text-base font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[var(--accent-orange)]" />
                  난이도 선택
                </h2>
                <span className="text-xs text-[var(--text-secondary)] font-mono">단계별 15문항</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {([1, 2, 3, 4] as const).map((lvl) => {
                  const info = QUIZ_LEVELS[lvl];
                  const isSelected = selectedLevel === lvl;
                  return (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => handleSelectLevel(lvl)}
                      className={`p-5 rounded-2xl text-left transition-all duration-200 border cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                        isSelected
                          ? 'bg-[var(--card-surface)] border-[var(--accent-orange)] shadow-[0_0_20px_rgba(241,143,1,0.25)] scale-[1.01]'
                          : 'glass-card border-[var(--border-color)] hover:border-[var(--accent-orange)] hover:shadow-[0_0_20px_rgba(241,143,1,0.18)]'
                      }`}
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[var(--accent-orange)]/15 text-[var(--accent-orange)] border border-[var(--border-color)]">
                            Lv.{lvl}
                          </span>
                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-[var(--accent-orange)] text-white flex items-center justify-center">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-[var(--text-primary)]">
                            {info.title}
                          </h3>
                          <p className="text-xs text-[var(--text-secondary)] mt-1.5 leading-relaxed font-medium">
                            {info.description}
                          </p>
                        </div>
                      </div>

                      <div className="pt-3 mt-3 border-t border-[var(--border-color)] flex items-center justify-between text-[11px] text-[var(--text-secondary)] font-mono">
                        <span>15문제</span>
                        <span className="font-bold text-[var(--accent-orange)]">Lv.{lvl} 실전 테스트</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Start CTA Button */}
            <div>
              <button
                type="button"
                onClick={() => startQuiz(selectedLevel)}
                className="btn-primary !w-full !py-4 !px-6 !text-base tracking-wide"
              >
                <Zap className="w-5 h-5 fill-current" />
                {selectedLevel}단계: {QUIZ_LEVELS[selectedLevel].title} 시작하기 (15문항)
              </button>
            </div>

            {/* Real-time Leaderboard Section */}
            <div className="glass-card rounded-2xl p-5 sm:p-6 space-y-4 shadow-2xs border border-[var(--border-color)]">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <Trophy className="w-4.5 h-4.5 text-[var(--accent-orange)]" />
                  명예의 전당
                </h2>
              </div>

              {/* Leaderboard Tabs (Bidirectionally synced) */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)]">
                {([1, 2, 3, 4] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => handleSelectLevel(lvl)}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      activeLeaderboardTab === lvl
                        ? 'bg-[var(--card-surface)] text-[var(--accent-orange)] shadow-xs font-extrabold'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    Lv.{lvl}
                  </button>
                ))}
              </div>

              {/* Leaderboard List with interactive popovers */}
              {leaderboardLoading ? (
                <div className="py-8 text-center text-xs text-[var(--text-secondary)] font-medium">
                  랭킹 데이터를 불러오는 중입니다...
                </div>
              ) : leaderboard.length === 0 ? (
                <div className="py-8 text-center space-y-1.5">
                  <p className="text-xs text-[var(--text-secondary)] font-medium">아직 등록된 랭커가 없습니다.</p>
                  <p className="text-xs font-bold text-[var(--accent-orange)]">지금 첫 번째 1위 주인공이 되어보세요!</p>
                </div>
              ) : (
                <div className="space-y-1.5 divide-y divide-[var(--border-color)]">
                  {leaderboard.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="pt-2 first:pt-0 flex items-center justify-between text-xs sm:text-sm py-1.5"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center font-mono font-extrabold text-xs ${
                            idx === 0
                              ? 'bg-[var(--accent-orange)] text-white shadow-xs'
                              : idx === 1
                              ? 'bg-[var(--card-hover)] text-[var(--text-primary)]'
                              : idx === 2
                              ? 'bg-[var(--card-surface)] text-[var(--text-secondary)] border border-[var(--border-color)]'
                              : 'text-[var(--text-secondary)] font-medium'
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-[var(--text-primary)]">{item.nickname}</span>

                          {/* Dynamic Active Badge: termsQuizBest OR investmentType */}
                          {item.activeBadge === 'none' ? null : item.activeBadge === 'terms_percentile' && (item.termsQuizBest?.badgeName || item.percentile) ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                setQuizPopoverTarget(
                                  quizPopoverTarget?.id === `badge_${item.id || item.nickname}`
                                    ? null
                                    : {
                                        id: `badge_${item.id || item.nickname}`,
                                        nickname: item.nickname,
                                        investmentType: item.investmentType,
                                        termsQuiz: item.termsQuizBest || {
                                          level: item.level,
                                          score: item.score,
                                          correctCount: item.correctCount,
                                          totalQuestions: item.totalQuestions || 15,
                                          timeSpentSec: item.timeSpentSec,
                                          percentile: item.percentile,
                                          badgeName: item.percentile ? `상위 ${item.percentile}%` : undefined,
                                        },
                                        anchorRect: {
                                          top: rect.top,
                                          bottom: rect.bottom,
                                          left: rect.left,
                                          right: rect.right,
                                          width: rect.width,
                                          height: rect.height,
                                        },
                                      }
                                );
                              }}
                              className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] sm:text-[11px] font-bold font-mono text-[var(--text-secondary)] hover:text-[var(--accent-orange)] bg-[var(--bg-main)]/80 border border-[var(--border-color)] hover:border-[var(--accent-orange)] hover:shadow-2xs transition-all leading-none select-none cursor-pointer"
                              title={`${item.nickname}님의 실전 용어 퀴즈 랭킹 보기`}
                            >
                              {item.termsQuizBest?.badgeName || `상위 ${item.percentile}%`}
                            </button>
                          ) : (item.activeBadge === 'investmentType' || !item.activeBadge) && item.investmentType && item.investmentType !== '미진단' ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const effectiveScores = item.typeScores || (item.investmentType && item.investmentType.length === 4 ? {
                                  g: item.investmentType[0].toUpperCase() === 'G' ? 70 : 30,
                                  a: item.investmentType[1].toUpperCase() === 'A' ? 70 : 30,
                                  l: item.investmentType[2].toUpperCase() === 'L' ? 70 : 30,
                                  r: item.investmentType[3].toUpperCase() === 'R' ? 70 : 30,
                                } : undefined);

                                setPreviewTarget(
                                  previewTarget?.id === (item.id || item.nickname)
                                    ? null
                                    : {
                                        id: item.id || item.nickname,
                                        code: item.investmentType!,
                                        authorNickname: item.nickname,
                                        typeScores: effectiveScores,
                                        anchorRect: {
                                          top: rect.top,
                                          bottom: rect.bottom,
                                          left: rect.left,
                                          right: rect.right,
                                          width: rect.width,
                                          height: rect.height,
                                        },
                                      }
                                );
                              }}
                              className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] sm:text-[11px] font-bold font-mono text-[var(--text-secondary)] hover:text-[var(--accent-orange)] bg-[var(--bg-main)]/80 border border-[var(--border-color)] hover:border-[var(--accent-orange)] hover:shadow-2xs transition-all leading-none select-none cursor-pointer"
                              title={`${item.nickname}님의 ${item.investmentType} 성향 보기`}
                            >
                              {item.investmentType}
                            </button>
                          ) : null}
                        </div>
                      </div>

                      {/* Score & Time (Clickable for Floating Quiz Popover) */}
                      <button
                        type="button"
                        onClick={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setQuizPopoverTarget(
                            quizPopoverTarget?.id === (item.id || item.nickname)
                              ? null
                              : {
                                  id: item.id || item.nickname,
                                  nickname: item.nickname,
                                  investmentType: item.investmentType,
                                  termsQuiz: {
                                    level: item.level,
                                    score: item.score,
                                    correctCount: item.correctCount,
                                    totalQuestions: item.totalQuestions || 15,
                                    timeSpentSec: item.timeSpentSec,
                                    percentile: item.percentile,
                                    badgeName: item.percentile ? `상위 ${item.percentile}%` : undefined,
                                  },
                                  anchorRect: {
                                    top: rect.top,
                                    bottom: rect.bottom,
                                    left: rect.left,
                                    right: rect.right,
                                    width: rect.width,
                                    height: rect.height,
                                  },
                                }
                          );
                        }}
                        className="flex items-center gap-2 font-mono text-right hover:opacity-80 cursor-pointer"
                        title={`${item.nickname}님의 퀴즈 성적 상세 보기`}
                      >
                        <span className="font-extrabold text-[var(--accent-orange)]">
                          {item.correctCount}/{item.totalQuestions || 15}
                        </span>
                        <span className="text-xs text-[var(--text-secondary)]">
                          ({formatTime(item.timeSpentSec)})
                        </span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 2: CONTINUOUS SPEED SPRINT ENGINE                  */}
        {/* ======================================================== */}
        {quizState === 'playing' && currentQ && (
          <div className="space-y-6 animate-fadeIn">
            {/* Top Progress & Timer Bar */}
            <div className="glass-card p-4 rounded-2xl flex items-center justify-between shadow-2xs border border-[var(--border-color)]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-extrabold px-2.5 py-0.5 rounded-full bg-[var(--accent-orange)]/15 text-[var(--accent-orange)] border border-[var(--border-color)]">
                  Lv.{selectedLevel}
                </span>
                <span className="text-xs font-bold text-[var(--text-primary)]">
                  문제 {currentIndex + 1} / {questions.length}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-mono font-extrabold text-[var(--accent-orange)]">
                <Timer className="w-4 h-4 animate-pulse" />
                <span>{formatTime(elapsedTime)}</span>
              </div>
            </div>

            {/* Progress Bar Line */}
            <div className="w-full h-1.5 bg-[var(--border-color)] rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--accent-orange)] transition-all duration-300 rounded-full"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              />
            </div>

            {/* Question Card */}
            <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-6 shadow-sm border border-[var(--border-color)] text-left">
              <h2 className="text-lg sm:text-xl font-extrabold text-[var(--text-primary)] leading-snug">
                {currentQ.question}
              </h2>

              {/* 4 Choices with High-Contrast Selected State */}
              <div className="space-y-3 pt-1">
                {currentQ.options.map((opt, idx) => {
                  const isSelected = selectedOption === idx;

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectOption(idx)}
                      className={`choice-card ${
                        isSelected
                          ? '!border-[var(--accent-orange)] !bg-[var(--card-surface)] !shadow-[0_0_20px_rgba(241,143,1,0.25)]'
                          : ''
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className={`choice-badge ${
                            isSelected
                              ? '!bg-[var(--accent-orange)] !text-white !border-[var(--accent-orange)] !shadow-xs'
                              : ''
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <span className={`font-bold tracking-tight truncate ${isSelected ? 'text-[var(--accent-orange)]' : 'text-[var(--text-primary)]'}`}>
                          {opt}
                        </span>
                      </div>

                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-[var(--accent-orange)] text-white flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Advance Button */}
              <div className="pt-3 flex items-center justify-end">
                <button
                  type="button"
                  onClick={handleAdvance}
                  disabled={selectedOption === null}
                  className={`btn-primary !py-3.5 !px-7 !rounded-xl ${
                    selectedOption === null ? 'opacity-40 cursor-not-allowed !pointer-events-none' : ''
                  }`}
                >
                  <span>{currentIndex + 1 < questions.length ? '다음 문제로 →' : '최종 결과 확인하기 🏆'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 3: SPRINT RESULT & COMPREHENSIVE REVIEW            */}
        {/* ======================================================== */}
        {quizState === 'summary' && finalResult && (
          <div className="space-y-6 animate-fadeIn">
            {/* 1:1 Challenge Battle Result Callout (If challenger was present) */}
            {battleResult && (
              <div
                className={`p-5 rounded-3xl border text-center space-y-2 shadow-sm ${
                  battleResult === 'win'
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                    : battleResult === 'loss'
                    ? 'bg-rose-500/10 border-rose-500 text-rose-700 dark:text-rose-300'
                    : 'bg-[var(--card-surface)] border-[var(--border-color)] text-[var(--text-primary)]'
                }`}
              >
                <div className="text-2xl font-black">
                  {battleResult === 'win' && '🎉 1:1 챌린지 승리!'}
                  {battleResult === 'loss' && '😢 1:1 챌린지 패배!'}
                  {battleResult === 'draw' && '🤝 무승부!'}
                </div>
                <p className="text-xs sm:text-sm font-medium">
                  {challengerNick} 님의 기록({challengerScore}개 · {formatTime(challengerTime || 0)}) 대비{' '}
                  <strong className="font-bold underline">
                    내 기록({finalResult.correctCount}개 · {formatTime(finalResult.timeSpentSec)})
                  </strong>
                  으로 승부가 확정되었습니다!
                </p>
              </div>
            )}

            {/* Result Main Card */}
            <div className="glass-card p-6 sm:p-8 rounded-3xl text-center space-y-6 shadow-sm border border-[var(--border-color)]">
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-xs font-mono font-extrabold px-3 py-1 rounded-full bg-[var(--accent-orange)]/15 text-[var(--accent-orange)] border border-[var(--border-color)]">
                    {levelInfo.title}
                  </span>
                  {finalResult.percentile && (
                    <span className="text-xs font-mono font-extrabold px-3 py-1 rounded-full bg-[var(--accent-green)]/15 text-[var(--accent-green)] border border-[var(--border-color)]">
                      전체 {finalResult.totalParticipants || 1}명 중 {finalResult.rank || 1}위
                    </span>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">
                  {finalResult.percentile ? `상위 ${finalResult.percentile}% 달성! 🏆` : '테스트 완료!'}
                </h1>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium">
                  총 15문항 중 <strong className="text-[var(--text-primary)]">{finalResult.correctCount}문제</strong>를 맞혔습니다.
                </p>
              </div>

              {/* Score & Time Stats Grid */}
              <div className="grid grid-cols-2 gap-3 py-2">
                <div className="p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)] space-y-1">
                  <span className="text-[11px] text-[var(--text-secondary)] font-medium">맞힌 정답 수</span>
                  <p className="text-xl sm:text-2xl font-extrabold text-[var(--accent-orange)] font-mono">
                    {finalResult.correctCount} / {finalResult.totalQuestions}문항
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)] space-y-1">
                  <span className="text-[11px] text-[var(--text-secondary)] font-medium">총 소요 시간</span>
                  <p className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)] font-mono">
                    {formatTime(finalResult.timeSpentSec)}
                  </p>
                </div>
              </div>

              {/* Guest Login Callout Banner (If not logged in) */}
              {!user ? (
                <div className="p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)] space-y-2 text-center">
                  <span className="text-[11px] text-[var(--text-secondary)] font-bold">
                    명예의 전당 기록 보관
                  </span>
                  <p className="text-xs sm:text-sm font-medium text-[var(--text-primary)]">
                    로그인하면 내 순위({finalResult.rank || 1}위)와 백분위를 리더보드에 등록할 수 있습니다.
                  </p>
                  <div className="pt-0.5">
                    <button
                      type="button"
                      onClick={openAuthPopover}
                      className="py-2 px-4 rounded-xl text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--accent-orange)] hover:bg-[var(--card-hover)] transition-all border border-[var(--border-color)] inline-flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-2xs"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>내 기록 등록하기 (로그인)</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Awarded Badge Display (No square brackets as instructed) */
                <div className="p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)] space-y-2">
                  <span className="text-[11px] text-[var(--text-secondary)] font-bold">
                    획득한 대표 뱃지
                  </span>
                  <div className="flex items-center justify-center gap-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs sm:text-sm font-bold font-mono text-[var(--accent-orange)] bg-[var(--accent-orange)]/15 border border-[var(--accent-orange)]">
                      {finalResult.badgeName}
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)]">
                    프로필 설정에서 위 뱃지를 댓글 뱃지로 선택할 수 있습니다.
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => startQuiz(selectedLevel)}
                  className="btn-secondary !w-full sm:!w-auto"
                >
                  <RotateCcw className="w-4 h-4" />
                  다시 풀기
                </button>

                {/* 1:1 Challenge Battle Link Share Button (Web Share or Clipboard Fallback) */}
                <button
                  type="button"
                  onClick={handleCopyChallengeLink}
                  className="btn-primary !w-full sm:!w-auto"
                >
                  <Swords className="w-4 h-4" />
                  {copiedBattleLink ? '도전장 링크 복사 완료!' : '친구에게 1:1 도전장 보내기'}
                </button>

                <button
                  type="button"
                  onClick={() => setQuizState('intro')}
                  className="btn-secondary !w-full sm:!w-auto"
                >
                  난이도 목록으로
                </button>
              </div>
            </div>

            {/* ======================================================== */}
            {/* COMPREHENSIVE REVIEW & ANSWER NOTES ACCORDION           */}
            {/* ======================================================== */}
            <div className="glass-card p-5 sm:p-6 rounded-3xl space-y-4 shadow-sm border border-[var(--border-color)] text-left">
              <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
                <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <CheckCircle2 className="w-4.5 h-4.5 text-[var(--accent-orange)]" />
                  전체 15문항 오답노트 & 정답 해설
                </h3>
                <span className="text-xs text-[var(--text-secondary)] font-mono">
                  {userAnswers.filter((a) => a.isCorrect).length}정답 / {userAnswers.filter((a) => !a.isCorrect).length}오답
                </span>
              </div>

              <div className="space-y-3 pt-1">
                {questions.map((q, qIdx) => {
                  const userAnswer = userAnswers[qIdx];
                  const isCorrect = userAnswer?.isCorrect;
                  const isExpanded = !!expandedQuestions[qIdx];

                  return (
                    <div
                      key={q.id || qIdx}
                      className={`p-4 rounded-2xl border transition-all ${
                        isCorrect
                          ? 'bg-[var(--bg-main)]/50 border-[var(--border-color)]'
                          : 'bg-rose-500/5 border-rose-500/30'
                      }`}
                    >
                      {/* Question Row Header (Clickable) */}
                      <button
                        type="button"
                        onClick={() => toggleQuestionReview(qIdx)}
                        className="w-full flex items-start justify-between gap-3 text-left cursor-pointer"
                      >
                        <div className="flex items-start gap-2.5 min-w-0 flex-1">
                          <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                              isCorrect
                                ? 'bg-emerald-500 text-white'
                                : 'bg-rose-500 text-white'
                            }`}
                          >
                            {isCorrect ? '✓' : '✕'}
                          </span>
                          <div className="space-y-0.5 min-w-0 flex-1">
                            <div className="text-xs text-[var(--text-secondary)] font-mono">
                              문제 {qIdx + 1}번 · {q.keyword}
                            </div>
                            <h4 className="text-sm font-bold text-[var(--text-primary)] leading-snug">
                              {q.question}
                            </h4>
                          </div>
                        </div>

                        <div className="shrink-0 text-[var(--text-secondary)] pt-1">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </button>

                      {/* Expanded Details (CSS Grid Smooth Height Transition) */}
                      <div className={`grid transition-all duration-300 ease-out overflow-hidden ${
                        isExpanded ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0'
                      }`}>
                        <div className="min-h-0 pt-3 border-t border-[var(--border-color)] space-y-3 text-xs sm:text-sm">
                          {/* Options List */}
                          <div className="space-y-1.5">
                            {q.options.map((opt, optIdx) => {
                              const isMyPick = userAnswer?.selected === optIdx;
                              const isRealAnswer = q.answerIndex === optIdx;

                              return (
                                <div
                                  key={optIdx}
                                  className={`p-2.5 rounded-xl text-xs flex items-center justify-between border ${
                                    isRealAnswer
                                      ? 'bg-emerald-500/15 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold'
                                      : isMyPick && !isRealAnswer
                                      ? 'bg-rose-500/15 border-rose-500 text-rose-700 dark:text-rose-300 font-bold line-through'
                                      : 'bg-[var(--bg-main)] border-[var(--border-color)] text-[var(--text-secondary)]'
                                  }`}
                                >
                                  <span>{optIdx + 1}. {opt}</span>
                                  {isRealAnswer && <span className="text-[10px] font-extrabold text-emerald-600">정답</span>}
                                  {isMyPick && !isRealAnswer && <span className="text-[10px] font-extrabold text-rose-600">내 선택</span>}
                                </div>
                              );
                            })}
                          </div>

                          {/* Explanation Box */}
                          <div className="p-3.5 rounded-xl bg-[var(--card-surface)] border border-[var(--border-color)] space-y-1 text-xs text-[var(--text-primary)] leading-relaxed">
                            <span className="font-bold text-[var(--accent-orange)] block">💡 해설</span>
                            <p className="whitespace-pre-line">{q.explanation}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Type Preview Popover for Leaderboard items */}
        {previewTarget && (
          <TypePreviewPopover
            typeCode={previewTarget.code}
            authorNickname={previewTarget.authorNickname}
            typeScores={previewTarget.typeScores}
            anchorRect={previewTarget.anchorRect}
            onClose={() => setPreviewTarget(null)}
          />
        )}

        {/* Floating Terms Quiz Preview Popover for Leaderboard items (No full-screen dark backdrop) */}
        {quizPopoverTarget && (
          <TermsQuizPreviewPopover
            authorNickname={quizPopoverTarget.nickname}
            termsQuiz={quizPopoverTarget.termsQuiz}
            anchorRect={quizPopoverTarget.anchorRect}
            onClose={() => setQuizPopoverTarget(null)}
          />
        )}
      </div>
    </RevealOnScroll>
  );
}

export default function TermsQuizPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-xs text-[var(--text-secondary)]">페이지 로딩 중...</div>}>
      <TermsQuizContent />
    </Suspense>
  );
}
