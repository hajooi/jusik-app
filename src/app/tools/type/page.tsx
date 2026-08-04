'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { QUESTIONS, calculateSurveyResult, PERSONALITY_PROFILES } from '@/data/investmentSurvey';
import ResultView from '@/components/type/ResultView';
import { ArrowLeft, ArrowRight, Sparkles, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

function SurveyContent() {
  const searchParams = useSearchParams();
  const sharedCode = searchParams.get('result')?.toUpperCase();
  const sharedProfile = sharedCode && PERSONALITY_PROFILES[sharedCode] ? PERSONALITY_PROFILES[sharedCode] : null;

  const { user, updateInvestmentType } = useAuth();

  const [currentPage, setCurrentPage] = useState(0); // 0..7 (5 questions per page, 40 total)
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isCompleted, setIsCompleted] = useState(false);

  const PAGE_SIZE = 5;
  const totalPages = Math.ceil(QUESTIONS.length / PAGE_SIZE);

  // Restore draft or completed result from LocalStorage or AuthContext
  useEffect(() => {
    try {
      const savedAnswers = localStorage.getItem('jusik_type_answers');
      const savedCompleted = localStorage.getItem('jusik_type_completed');
      const savedPage = localStorage.getItem('jusik_type_current_page');

      if (user && user.typeAnswers) {
        setAnswers(user.typeAnswers);
        setIsCompleted(true);
      } else if (savedAnswers) {
        const parsedAnswers = JSON.parse(savedAnswers);
        setAnswers(parsedAnswers);

        if (savedCompleted === 'true') {
          setIsCompleted(true);
        } else if (savedPage !== null) {
          const pageNum = parseInt(savedPage, 10);
          if (!isNaN(pageNum) && pageNum >= 0 && pageNum < totalPages) {
            setCurrentPage(pageNum);
          }
        } else {
          const firstUnansweredIndex = QUESTIONS.findIndex((q) => parsedAnswers[q.id] === undefined);
          if (firstUnansweredIndex !== -1) {
            setCurrentPage(Math.floor(firstUnansweredIndex / PAGE_SIZE));
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, [totalPages, user]);

  const pageQuestions = QUESTIONS.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);
  const answeredCount = Object.keys(answers).length;
  const progressPercent = Math.round((answeredCount / QUESTIONS.length) * 100);

  const handleSelectScore = (questionId: number, score: number) => {
    const nextAnswers = { ...answers, [questionId]: score };
    setAnswers(nextAnswers);
    localStorage.setItem('jusik_type_answers', JSON.stringify(nextAnswers));
  };

  const isCurrentPageComplete = pageQuestions.every((q) => answers[q.id] !== undefined);

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      localStorage.setItem('jusik_type_current_page', nextPage.toString());
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setIsCompleted(true);
      localStorage.setItem('jusik_type_completed', 'true');
      const resultData = calculateSurveyResult(answers);
      updateInvestmentType(resultData.typeCode, answers);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      const prevPage = currentPage - 1;
      setCurrentPage(prevPage);
      localStorage.setItem('jusik_type_current_page', prevPage.toString());
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleRestart = () => {
    setAnswers({});
    setCurrentPage(0);
    setIsCompleted(false);
    localStorage.removeItem('jusik_type_answers');
    localStorage.removeItem('jusik_type_completed');
    localStorage.removeItem('jusik_type_current_page');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isCompleted) {
    const resultData = calculateSurveyResult(answers);
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        <div className="flex items-center justify-end">
          <Link
            href="/tools"
            className="inline-flex items-center gap-1.5 font-bold text-xs sm:text-sm text-[var(--text-secondary)] hover:text-[var(--accent-orange)] transition-all duration-300 glass-card glass-card-hover px-3.5 py-2 rounded-full active:scale-95 border border-[var(--border-color)]"
          >
            <ArrowLeft className="w-4 h-4" />
            투자도구 목록으로
          </Link>
        </div>

        <ResultView
          profile={resultData.profile}
          scores={resultData.scores}
          onRestart={handleRestart}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-4 sm:space-y-6">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleRestart}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--accent-orange)] hover:border-[var(--accent-orange)]/40 hover:shadow-[0_0_12px_rgba(241,143,1,0.2)] glass-card px-3 py-1.5 rounded-full transition-all active:scale-95 border border-[var(--border-color)]"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          처음부터 다시
        </button>
        <Link
          href="/tools"
          className="inline-flex items-center gap-1.5 font-bold text-xs sm:text-sm text-[var(--text-secondary)] hover:text-[var(--accent-orange)] transition-all duration-300 glass-card glass-card-hover px-3.5 py-2 rounded-full active:scale-95 border border-[var(--border-color)]"
        >
          <ArrowLeft className="w-4 h-4" />
          투자도구 목록으로
        </Link>
      </div>

      {/* Shared Result Invite Card (Shown when arriving via shared link ?result=CODE) */}
      {sharedProfile && !isCompleted && answeredCount === 0 && (
        <div className="glass-card p-6 rounded-3xl space-y-4 border border-[var(--accent-orange)] shadow-[0_0_20px_rgba(241,143,1,0.18)] bg-[var(--card-hover)]/40 relative overflow-hidden">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[var(--accent-orange)] text-white text-[11px] font-extrabold font-mono">
              공유받은 성향
            </span>
            <span className="text-xs font-bold text-[var(--accent-orange)]">
              {sharedProfile.code}
            </span>
          </div>

          <div className="space-y-1">
            <h3 className="text-lg sm:text-xl font-black text-[var(--text-primary)] tracking-tight">
              이 링크를 공유한 친구는 <span className="text-[var(--accent-orange)]">"{sharedProfile.name}"</span> 유형이에요!
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium leading-relaxed">
              "{sharedProfile.tagline}"
            </p>
          </div>

          <div className="pt-2 border-t border-[var(--border-color)] flex items-center justify-between gap-3">
            <p className="text-xs font-bold text-[var(--text-primary)]">
              나는 어떤 투자 유형일까? 지금 3분 만에 진단해보세요! 🦉
            </p>
          </div>
        </div>
      )}

      {/* Progress & Milestone Header */}
      <div className="glass-card p-5 rounded-3xl space-y-3 sticky top-3 z-10 backdrop-blur-xl border border-[var(--border-color)] shadow-xs">
        <div className="flex items-center justify-between text-xs font-extrabold text-[var(--text-secondary)]">
          <span className="text-[var(--accent-orange)] font-mono flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            투자 성향 진단
          </span>
          <span className="font-mono text-xs text-[var(--text-primary)]">
            {currentPage + 1} / {totalPages} 페이지 ({progressPercent}%)
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 rounded-full bg-[var(--bg-main)] overflow-hidden flex p-0 border border-[var(--border-color)]">
          <div
            className="h-full rounded-full bg-[var(--accent-orange)] transition-all duration-300 shadow-[0_0_8px_rgba(241,143,1,0.5)]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* List of 5 Questions */}
      <div className="space-y-6">
        {pageQuestions.map((q, idx) => {
          const qNum = currentPage * PAGE_SIZE + idx + 1;
          const selectedScore = answers[q.id];

          return (
            <div
              key={q.id}
              className="glass-card p-5 sm:p-7 rounded-3xl space-y-5 border border-[var(--border-color)] relative overflow-hidden transition-all duration-200 hover:border-[var(--accent-orange)]/30 hover:shadow-[0_4px_20px_rgba(241,143,1,0.08)]"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-[var(--accent-orange)]/15 text-[var(--accent-orange)] font-mono">
                  Q{qNum}
                </span>
                {selectedScore !== undefined && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--accent-green)]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    선택 완료
                  </span>
                )}
              </div>

              <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)] leading-snug tracking-tight">
                {q.question}
              </h2>

              {/* 5-Point Rating Buttons */}
              <div className="space-y-3 pt-1">
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((score) => {
                    const isSelected = selectedScore === score;
                    return (
                      <button
                        key={score}
                        onClick={() => handleSelectScore(q.id, score)}
                        className={`py-3 rounded-2xl font-black text-sm transition-all duration-200 active:scale-95 flex items-center justify-center border ${
                          isSelected
                            ? 'bg-[var(--accent-orange)] text-white border-[var(--accent-orange)] shadow-[0_0_15px_rgba(241,143,1,0.4)] scale-[1.03]'
                            : 'glass-card text-[var(--text-primary)] border-[var(--border-color)] hover:border-[var(--accent-orange)]/50 hover:text-[var(--accent-orange)] hover:shadow-[0_0_12px_rgba(241,143,1,0.25)] hover:scale-[1.02]'
                        }`}
                      >
                        {score}
                      </button>
                    );
                  })}
                </div>

                {/* Left/Right Scale Labels (Clean minimalist wording without emojis) */}
                <div className="grid grid-cols-2 gap-3 text-xs font-medium text-[var(--text-secondary)] pt-3 border-t border-[var(--border-color)]">
                  <div className="text-left leading-relaxed break-words">
                    {q.leftLabel}
                  </div>
                  <div className="text-right leading-relaxed break-words">
                    {q.rightLabel}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Page Navigation Controls (Matching brand UI styling) */}
      <div className="flex items-center justify-between pt-4 pb-8">
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 0}
          className={`inline-flex items-center gap-1.5 px-5 py-3 rounded-2xl text-xs font-bold transition-all border ${
            currentPage === 0
              ? 'opacity-30 cursor-not-allowed text-[var(--text-secondary)] border-transparent'
              : 'glass-card hover:bg-[var(--card-hover)] hover:text-[var(--accent-orange)] hover:border-[var(--accent-orange)]/40 hover:shadow-[0_0_12px_rgba(241,143,1,0.2)] text-[var(--text-primary)] border-[var(--border-color)] active:scale-95'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          이전 페이지
        </button>

        <button
          onClick={handleNextPage}
          disabled={!isCurrentPageComplete}
          className={`inline-flex items-center gap-1.5 px-6 py-3 rounded-2xl text-xs font-extrabold transition-all active:scale-95 border ${
            isCurrentPageComplete
              ? 'bg-[var(--accent-orange)] text-white border-[var(--accent-orange)] hover:shadow-[0_0_20px_rgba(241,143,1,0.45)] hover:scale-[1.02]'
              : 'bg-[var(--bg-main)] text-[var(--text-secondary)]/50 border-[var(--border-color)] cursor-not-allowed'
          }`}
        >
          {currentPage === totalPages - 1 ? '결과 확인하기' : '다음 페이지'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function InvestmentSurveyPage() {
  return (
    <React.Suspense fallback={<div className="max-w-4xl mx-auto p-8 text-center text-sm font-bold">로딩 중...</div>}>
      <SurveyContent />
    </React.Suspense>
  );
}
