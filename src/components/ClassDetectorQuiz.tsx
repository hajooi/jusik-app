'use client';

import { useState, useEffect, useRef } from 'react';
import { Timer, CheckCircle2, AlertCircle, Clock, RotateCcw } from 'lucide-react';

type QuizOption = 'A' | 'B' | 'TIMEOUT' | null;

export default function ClassDetectorQuiz() {
  const [selectedOption, setSelectedOption] = useState<QuizOption>(null);
  const [prepStage, setPrepStage] = useState<'3' | '2' | '1' | 'GO' | null>(null);
  const [isPreparing, setIsPreparing] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(5.0);
  const [isActive, setIsActive] = useState<boolean>(false);
  const quizRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const hasTriggeredRef = useRef<boolean>(false);

  const startCountdown = () => {
    setIsPreparing(true);
    setPrepStage('3');
    setTimeout(() => {
      setPrepStage('2');
      setTimeout(() => {
        setPrepStage('1');
        setTimeout(() => {
          setPrepStage('GO');
          setTimeout(() => {
            setPrepStage(null);
            setIsPreparing(false);
            setIsActive(true);
          }, 600);
        }, 700);
      }, 700);
    }, 700);
  };

  // Auto trigger 3 -> 2 -> 1 -> GO! sequence once when centered in viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasTriggeredRef.current && selectedOption === null && !isActive && !isPreparing && timeLeft === 5.0) {
          hasTriggeredRef.current = true;
          startCountdown();
        }
      },
      { threshold: 0.3 }
    );

    if (quizRef.current) {
      observer.observe(quizRef.current);
    }

    return () => observer.disconnect();
  }, [selectedOption, isActive, isPreparing, timeLeft]);

  // Timer countdown
  useEffect(() => {
    if (isActive && selectedOption === null) {
      const interval = 100;
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 0.1) {
            clearInterval(timerRef.current as NodeJS.Timeout);
            setSelectedOption('TIMEOUT');
            setIsActive(false);
            return 0;
          }
          return parseFloat((prev - 0.1).toFixed(1));
        });
      }, interval);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, selectedOption]);

  const handleSelect = (option: 'A' | 'B') => {
    if (selectedOption !== null || isPreparing || !isActive) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setSelectedOption(option);
    setIsActive(false);
  };

  const handleReset = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setSelectedOption(null);
    setTimeLeft(5.0);
    hasTriggeredRef.current = true;
    setIsActive(false);
    startCountdown();
  };

  const progressPercentage = (timeLeft / 5.0) * 100;

  return (
    <div 
      ref={quizRef}
      className="glass-card p-5 sm:p-7 rounded-2xl sm:rounded-3xl border border-[var(--border-color)] shadow-lg space-y-5 transition-all duration-300 relative overflow-hidden my-6 min-h-[380px] flex flex-col justify-between"
    >
      {/* CONTINUOUS UNBROKEN OVERLAY BACKDROP */}
      {isPreparing && (
        <div className="absolute inset-0 bg-[var(--bg-main)]/90 backdrop-blur-md z-30 flex items-center justify-center pointer-events-auto">
          {prepStage === '3' && (
            <div key="3" className="text-7xl sm:text-9xl font-black text-[var(--accent-orange)] tracking-widest drop-shadow-lg animate-zoom-in-fast font-mono">
              3
            </div>
          )}
          {prepStage === '2' && (
            <div key="2" className="text-7xl sm:text-9xl font-black text-[var(--accent-orange)] tracking-widest drop-shadow-lg animate-zoom-in-fast font-mono">
              2
            </div>
          )}
          {prepStage === '1' && (
            <div key="1" className="text-7xl sm:text-9xl font-black text-[var(--accent-orange)] tracking-widest drop-shadow-lg animate-zoom-in-fast font-mono">
              1
            </div>
          )}
          {prepStage === 'GO' && (
            <div key="go" className="text-6xl sm:text-8xl font-black text-[var(--accent-orange)] tracking-widest drop-shadow-lg animate-zoom-in-fast font-mono">
              GO!
            </div>
          )}
        </div>
      )}

      {/* Header Badge */}
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--accent-orange)]/15 text-[var(--accent-orange)] text-xs sm:text-sm font-extrabold">
          <span>🕹️</span>
          <span>5초 계급 판독기</span>
        </div>
        
        {selectedOption !== null && (
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--accent-orange)] font-bold transition-colors px-2.5 py-1 rounded-lg hover:bg-[var(--card-hover)]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            다시 하기
          </button>
        )}
      </div>

      {/* Balance Game Title & Question (Placed FIRST) */}
      <div className="text-center py-1 space-y-1">
        <span className="inline-block text-[11px] px-2.5 py-0.5 rounded-full bg-[var(--accent-orange)]/10 text-[var(--accent-orange)] font-extrabold tracking-tight">
          밸런스 게임
        </span>
        <h3 className="text-base sm:text-xl font-extrabold text-[var(--text-primary)] tracking-tight">
          만약 둘 중 하나만 선택한다면?
        </h3>
      </div>

      {/* Timer Bar (Placed BELOW Question) */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-xs sm:text-sm font-bold">
          <span className="flex items-center gap-1.5 text-[var(--text-primary)] font-mono">
            <Timer className={`w-4 h-4 ${timeLeft <= 2 ? 'text-red-500' : 'text-[var(--accent-orange)]'}`} />
            <span>남은 시간:</span>
            <span className="text-[var(--accent-orange)] text-sm sm:text-base font-extrabold font-mono">{timeLeft.toFixed(1)}초</span>
          </span>
        </div>

        {/* Progress Track */}
        <div className="w-full h-2.5 bg-[var(--bg-main)] rounded-full overflow-hidden p-0.5 border border-[var(--border-color)]">
          <div 
            className={`h-full rounded-full transition-all duration-100 ${
              timeLeft <= 1.5 
                ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' 
                : 'bg-[var(--accent-orange)] shadow-[0_0_8px_rgba(241,143,1,0.4)]'
            }`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Choice Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={() => handleSelect('A')}
          disabled={selectedOption !== null || prepStage !== null || !isActive}
          className={`p-4 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base transition-all duration-300 border text-center flex items-center justify-center active:scale-95 ${
            selectedOption === 'A'
              ? 'bg-[var(--accent-orange)] text-white border-[var(--accent-orange)] shadow-md ring-2 ring-[var(--accent-orange)]/40'
              : selectedOption !== null
              ? 'opacity-50 border-[var(--border-color)] text-[var(--text-secondary)]'
              : 'glass-card glass-card-hover border-[var(--border-color)] text-[var(--text-primary)] hover:border-[var(--accent-orange)]/50'
          }`}
        >
          <span>지금 당장 10억 받기</span>
        </button>

        <button
          onClick={() => handleSelect('B')}
          disabled={selectedOption !== null || prepStage !== null || !isActive}
          className={`p-4 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base transition-all duration-300 border text-center flex items-center justify-center active:scale-95 ${
            selectedOption === 'B'
              ? 'bg-[var(--accent-orange)] text-white border-[var(--accent-orange)] shadow-md ring-2 ring-[var(--accent-orange)]/40'
              : selectedOption !== null
              ? 'opacity-50 border-[var(--border-color)] text-[var(--text-secondary)]'
              : 'glass-card glass-card-hover border-[var(--border-color)] text-[var(--text-primary)] hover:border-[var(--accent-orange)]/50'
          }`}
        >
          <span>평생 매달 500만 원 받기</span>
        </button>
      </div>

      {/* POPUP RESULT MESSAGE CARD (Fixed height container / Absolute popover so main card size remains rock solid) */}
      {selectedOption !== null && (
        <div className="pt-2 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)] shadow-inner space-y-3">
            {selectedOption === 'B' && (
              <>
                <div className="flex items-center gap-2 text-red-500 dark:text-red-400 font-extrabold text-sm sm:text-base">
                  <AlertCircle className="w-5 h-5 shrink-0 stroke-[2.2]" />
                  <span>월 500만 원 선택 결과</span>
                </div>
                <h4 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
                  &quot;월급의 달콤한 안정감에 갇히셨습니다.&quot;
                </h4>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed font-medium">
                  매달 꽂히는 안정적인 숫자는 안도감을 주지만, 노동자의 뇌에서 한 발자국도 벗어날 수 없게 만듭니다.
                </p>
              </>
            )}

            {selectedOption === 'A' && (
              <>
                <div className="flex items-center gap-2 text-emerald-500 dark:text-emerald-400 font-extrabold text-sm sm:text-base">
                  <CheckCircle2 className="w-5 h-5 shrink-0 stroke-[2.2]" />
                  <span>현금 10억 선택 결과</span>
                </div>
                <h4 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
                  &quot;이론상 완벽한 정답입니다.&quot;
                </h4>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed font-medium">
                  머리로는 10억이 이득임을 잘 알고 계시네요. 그렇다면 정작 현실의 삶에서도 &apos;돈이 나 대신 일하게 만드는 원칙&apos;을 제대로 적용하며 살아가고 계신가요?
                </p>
              </>
            )}

            {selectedOption === 'TIMEOUT' && (
              <>
                <div className="flex items-center gap-2 text-amber-500 font-extrabold text-sm sm:text-base">
                  <Clock className="w-5 h-5 shrink-0 stroke-[2.2]" />
                  <span>제한시간 초과 (Timeout)</span>
                </div>
                <h4 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
                  &quot;망설이는 순간에도 당신의 돈은 녹아내립니다.&quot;
                </h4>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed font-medium">
                  자본주의는 기다려주지 않습니다. 아무 결정도 내리지 않는 동안 인플레이션이라는 도둑이 통장의 가치를 갉아먹습니다.
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}



