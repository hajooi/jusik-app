'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { QUESTIONS, calculateSurveyResult, Question } from '@/data/investmentSurvey';
import ResultView from '@/components/mbti/ResultView';
import { ArrowLeft, ArrowRight, Sparkles, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function InvestmentSurveyPage() {
  const [currentPage, setCurrentPage] = useState(0); // 0..7 (5 questions per page, 40 total)
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isCompleted, setIsCompleted] = useState(false);

  const PAGE_SIZE = 5;
  const totalPages = Math.ceil(QUESTIONS.length / PAGE_SIZE);

  // Restore draft or completed result from localStorage if available
  useEffect(() => {
    try {
      const savedAnswers = localStorage.getItem('jusik_mbti_answers');
      const savedCompleted = localStorage.getItem('jusik_mbti_completed');
      if (savedAnswers) {
        setAnswers(JSON.parse(savedAnswers));
      }
      if (savedCompleted === 'true') {
        setIsCompleted(true);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const pageQuestions = QUESTIONS.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);
  const answeredCount = Object.keys(answers).length;
  const progressPercent = Math.round((answeredCount / QUESTIONS.length) * 100);

  const handleSelectScore = (questionId: number, score: number) => {
    const nextAnswers = { ...answers, [questionId]: score };
    setAnswers(nextAnswers);
    localStorage.setItem('jusik_mbti_answers', JSON.stringify(nextAnswers));
  };

  const isCurrentPageComplete = pageQuestions.every((q) => answers[q.id] !== undefined);

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setIsCompleted(true);
      localStorage.setItem('jusik_mbti_completed', 'true');
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleRestart = () => {
    setAnswers({});
    setCurrentPage(0);
    setIsCompleted(false);
    localStorage.removeItem('jusik_mbti_answers');
    localStorage.removeItem('jusik_mbti_completed');
  };

  const getMilestoneLabel = () => {
    if (currentPage < 2) return '1단계: 목표 축 (공격 vs 방어)';
    if (currentPage < 4) return '2단계: 실행 축 (분석 vs 시스템)';
    if (currentPage < 6) return '3단계: 시간 축 (장기 vs 추세)';
    return '4단계: 심리 축 (원칙 vs 직감)';
  };

  if (isCompleted) {
    const resultData = calculateSurveyResult(answers);
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/tools"
            className="inline-flex items-center gap-1.5 font-bold text-xs sm:text-sm text-[var(--text-secondary)] hover:text-[var(--accent-orange)] hover:border-[var(--accent-orange)]/40 hover:shadow-[0_0_15px_rgba(241,143,1,0.25)] glass-card px-3.5 py-2 rounded-full transition-all active:scale-95 border border-[var(--border-color)]"
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
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/tools"
          className="inline-flex items-center gap-1.5 font-bold text-xs sm:text-sm text-[var(--text-secondary)] hover:text-[var(--accent-orange)] hover:border-[var(--accent-orange)]/40 hover:shadow-[0_0_15px_rgba(241,143,1,0.25)] glass-card px-3.5 py-2 rounded-full transition-all active:scale-95 border border-[var(--border-color)]"
        >
          <ArrowLeft className="w-4 h-4" />
          투자도구 목록으로
        </Link>
        <button
          onClick={handleRestart}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--accent-orange)] hover:border-[var(--accent-orange)]/40 hover:shadow-[0_0_12px_rgba(241,143,1,0.2)] glass-card px-3 py-1.5 rounded-full transition-all active:scale-95 border border-[var(--border-color)]"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          처음부터 다시
        </button>
      </div>

      {/* Progress & Milestone Header */}
      <div className="glass-card p-5 rounded-3xl space-y-3 sticky top-3 z-10 backdrop-blur-xl border border-[var(--border-color)] shadow-xs">
        <div className="flex items-center justify-between text-xs font-extrabold text-[var(--text-secondary)]">
          <span className="text-[var(--accent-orange)] font-mono flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            {getMilestoneLabel()}
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
