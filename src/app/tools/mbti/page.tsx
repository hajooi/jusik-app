'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { QUESTIONS, calculateSurveyResult, Question } from '@/data/investmentSurvey';
import ResultView from '@/components/mbti/ResultView';
import { ArrowLeft, ArrowRight, CheckCircle2, Sparkles, HelpCircle, RefreshCw } from 'lucide-react';

export default function InvestmentMBTIPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isCompleted, setIsCompleted] = useState(false);

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

  const currentQ: Question = QUESTIONS[currentIndex];
  const progressPercent = Math.round(((currentIndex + 1) / QUESTIONS.length) * 100);

  const handleSelectScore = (score: number) => {
    const nextAnswers = { ...answers, [currentQ.id]: score };
    setAnswers(nextAnswers);
    localStorage.setItem('jusik_mbti_answers', JSON.stringify(nextAnswers));

    if (currentIndex < QUESTIONS.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsCompleted(true);
      localStorage.setItem('jusik_mbti_completed', 'true');
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleRestart = () => {
    setAnswers({});
    setCurrentIndex(0);
    setIsCompleted(false);
    localStorage.removeItem('jusik_mbti_answers');
    localStorage.removeItem('jusik_mbti_completed');
  };

  // Milestone badge texts (every 10 questions)
  const getMilestoneLabel = () => {
    const qNum = currentIndex + 1;
    if (qNum <= 10) return '1단계: 목표 축 (공격 vs 방어)';
    if (qNum <= 20) return '2단계: 실행 축 (분석 vs 시스템)';
    if (qNum <= 30) return '3단계: 시간 축 (장기 vs 추세)';
    return '4단계: 심리 축 (원칙 vs 직감)';
  };

  if (isCompleted) {
    const resultData = calculateSurveyResult(answers);
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/tools"
            className="inline-flex items-center gap-1.5 font-bold text-xs sm:text-sm text-[var(--text-secondary)] hover:text-[var(--accent-orange)] glass-card px-3.5 py-2 rounded-full transition-all active:scale-95"
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
          className="inline-flex items-center gap-1.5 font-bold text-xs sm:text-sm text-[var(--text-secondary)] hover:text-[var(--accent-orange)] glass-card px-3.5 py-2 rounded-full transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          투자도구
        </Link>
        <button
          onClick={handleRestart}
          className="inline-flex items-center gap-1 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          처음부터 다시
        </button>
      </div>

      {/* Progress & Milestone Header */}
      <div className="glass-card p-5 rounded-3xl space-y-3">
        <div className="flex items-center justify-between text-xs font-extrabold text-[var(--text-secondary)]">
          <span className="text-[var(--accent-orange)] font-mono flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            {getMilestoneLabel()}
          </span>
          <span className="font-mono text-xs text-[var(--text-primary)]">
            {currentIndex + 1} / {QUESTIONS.length} 문항 ({progressPercent}%)
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2.5 rounded-full bg-[var(--bg-main)] overflow-hidden p-0.5 border border-[var(--border-color)]/20">
          <div
            className="h-full rounded-full bg-[var(--accent-orange)] transition-all duration-300 shadow-2xs"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Question Card Block */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-6 shadow-sm min-h-[320px] flex flex-col justify-between relative overflow-hidden">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-[var(--accent-orange)]/15 text-[var(--accent-orange)] font-mono">
              Q{currentIndex + 1}
            </span>
          </div>

          <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] leading-snug tracking-tight">
            {currentQ.question}
          </h2>
        </div>

        {/* Option 5-Point Likert Rating Buttons */}
        <div className="space-y-3 pt-4">
          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((score) => {
              const isSelected = answers[currentQ.id] === score;
              return (
                <button
                  key={score}
                  onClick={() => handleSelectScore(score)}
                  className={`py-3.5 rounded-2xl font-black text-sm transition-all duration-200 active:scale-95 flex flex-col items-center justify-center gap-1 border ${
                    isSelected
                      ? 'bg-[var(--accent-orange)] text-white border-[var(--accent-orange)] shadow-sm scale-[1.02]'
                      : 'glass-card hover:bg-[var(--card-hover)] text-[var(--text-primary)] border-[var(--border-color)]/20'
                  }`}
                >
                  <span>{score}</span>
                </button>
              );
            })}
          </div>

          {/* Scale Labels */}
          <div className="flex justify-between items-start text-[11px] sm:text-xs font-semibold text-[var(--text-secondary)] px-1 pt-1">
            <span className="max-w-[45%] leading-tight text-left">
              👈 {currentQ.leftLabel}
            </span>
            <span className="max-w-[45%] leading-tight text-right">
              {currentQ.rightLabel} 👉
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-bold transition-all ${
            currentIndex === 0
              ? 'opacity-30 cursor-not-allowed text-[var(--text-secondary)]'
              : 'glass-card hover:bg-[var(--card-hover)] text-[var(--text-primary)] active:scale-95'
          }`}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          이전 문항
        </button>

        {answers[currentQ.id] !== undefined && currentIndex < QUESTIONS.length - 1 && (
          <button
            onClick={() => setCurrentIndex(currentIndex + 1)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[var(--accent-orange)] text-white text-xs font-bold shadow-2xs hover:opacity-90 active:scale-95 transition-all"
          >
            다음 문항
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
