'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { QUESTIONS, calculateSurveyResult, PERSONALITY_PROFILES } from '@/data/investmentSurvey';
import ResultView from '@/components/type/ResultView';
import ResultCompareAccordion from '@/components/type/ResultCompareAccordion';
import { ArrowLeft, ArrowRight, Sparkles, RefreshCw, CheckCircle2, Users, HeartHandshake, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { attachJosa } from '@/utils/koreanJosa';

function SurveyContent({ initialCode }: { initialCode?: string }) {
  const searchParams = useSearchParams();
  const sharedCode = (initialCode || searchParams.get('result'))?.toUpperCase();
  const sharedProfile = sharedCode && PERSONALITY_PROFILES[sharedCode] ? PERSONALITY_PROFILES[sharedCode] : null;

  // Extract shared user scores and nickname if provided in query params
  const sharedUserName = searchParams.get('u') || '친구';
  const paramG = searchParams.get('g') ? parseInt(searchParams.get('g')!, 10) : undefined;
  const paramA = searchParams.get('a') ? parseInt(searchParams.get('a')!, 10) : undefined;
  const paramL = searchParams.get('l') ? parseInt(searchParams.get('l')!, 10) : undefined;
  const paramR = searchParams.get('r') ? parseInt(searchParams.get('r')!, 10) : undefined;

  const sharedScores =
    paramG !== undefined && paramA !== undefined && paramL !== undefined && paramR !== undefined
      ? {
          GS: { G: paramG, S: 100 - paramG },
          AP: { A: paramA, P: 100 - paramA },
          LT: { L: paramL, T: 100 - paramL },
          RI: { R: paramR, I: 100 - paramR },
        }
      : {
          GS: { G: 70, S: 30 },
          AP: { A: 60, P: 40 },
          LT: { L: 80, T: 20 },
          RI: { R: 40, I: 60 },
        };

  const { user, updateInvestmentType } = useAuth();

  const [currentPage, setCurrentPage] = useState(0); // 0..7 (5 questions per page, 40 total)
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [justFinishedTest, setJustFinishedTest] = useState(false);
  const [viewMyComparison, setViewMyComparison] = useState(false);
  const [typePercentage, setTypePercentage] = useState<number | undefined>(undefined);
  const [isTakingTest, setIsTakingTest] = useState(false);

  const PAGE_SIZE = 5;
  const totalPages = Math.ceil(QUESTIONS.length / PAGE_SIZE);

  // Restore draft or completed result ONCE on component mount to prevent resize/re-render question jump bug
  useEffect(() => {
    try {
      const savedAnswers = localStorage.getItem('jusik_type_answers');
      const savedCompleted = localStorage.getItem('jusik_type_completed');
      const savedPage = localStorage.getItem('jusik_type_current_page');

      if (user && user.typeAnswers && Object.keys(user.typeAnswers).length > 0) {
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
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []); // Run ONCE on mount!

  // Save currentPage to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('jusik_type_current_page', currentPage.toString());
  }, [currentPage]);

  // Fetch stats (GET read-only) when viewing completed result
  useEffect(() => {
    if (isCompleted && Object.keys(answers).length > 0) {
      const resultData = calculateSurveyResult(answers);
      fetch('/api/survey-stats')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.percentages) {
            setTypePercentage(data.percentages[resultData.typeCode] || 0);
          }
        })
        .catch((err) => console.error('Survey stats API error:', err));
    }
  }, [isCompleted, answers]);

  // Page change or completion change scroll to top effect
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage, isCompleted, isTakingTest]);

  const pageQuestions = QUESTIONS.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);
  const answeredCount = Object.keys(answers).length;
  const progressPercent = Math.round((answeredCount / QUESTIONS.length) * 100);

  const handleSelectScore = (questionId: number, score: number, pageIdx: number) => {
    const nextAnswers = { ...answers, [questionId]: score };
    setAnswers(nextAnswers);
    localStorage.setItem('jusik_type_answers', JSON.stringify(nextAnswers));

    // Smooth precision auto-scroll to next question card with navbar offset
    if (pageIdx < pageQuestions.length - 1) {
      setTimeout(() => {
        const nextEl = document.getElementById(`question-card-${pageIdx + 1}`);
        if (nextEl) {
          const yOffset = -84; // Perfect breathing space below sticky Navbar (64px + 20px)
          const y = nextEl.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 100);
    }
  };

  const isCurrentPageComplete = pageQuestions.every((q) => answers[q.id] !== undefined);

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      localStorage.setItem('jusik_type_current_page', nextPage.toString());
    } else {
      setIsCompleted(true);
      setIsTakingTest(false);
      setJustFinishedTest(true);
      localStorage.setItem('jusik_type_completed', 'true');
      const resultData = calculateSurveyResult(answers);
      updateInvestmentType(resultData.typeCode, answers);

      // Post survey stats
      fetch('/api/survey-stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ typeCode: resultData.typeCode }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.percentages) {
            setTypePercentage(data.percentages[resultData.typeCode] || 0);
          }
        })
        .catch((e) => console.error(e));
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      const prevPage = currentPage - 1;
      setCurrentPage(prevPage);
      localStorage.setItem('jusik_type_current_page', prevPage.toString());
    }
  };

  const handleRestart = () => {
    setAnswers({});
    setCurrentPage(0);
    setIsCompleted(false);
    setJustFinishedTest(false);
    setIsTakingTest(true);
    setTypePercentage(undefined);
    localStorage.removeItem('jusik_type_answers');
    localStorage.removeItem('jusik_type_completed');
  };

  // Extract 1:1 comparison params if present in shared link (e.g. created from "이 비교 결과 공유하기")
  const myParamU = searchParams.get('myU');
  const myParamCode = searchParams.get('myCode')?.toUpperCase();
  const myParamG = searchParams.get('myG') ? parseInt(searchParams.get('myG')!, 10) : undefined;
  const myParamA = searchParams.get('myA') ? parseInt(searchParams.get('myA')!, 10) : undefined;
  const myParamL = searchParams.get('myL') ? parseInt(searchParams.get('myL')!, 10) : undefined;
  const myParamR = searchParams.get('myR') ? parseInt(searchParams.get('myR')!, 10) : undefined;

  const compareUserFromParams =
    myParamCode && PERSONALITY_PROFILES[myParamCode] && myParamG !== undefined && myParamA !== undefined && myParamL !== undefined && myParamR !== undefined
      ? {
          name: myParamU || '',
          code: myParamCode,
          profile: PERSONALITY_PROFILES[myParamCode],
          scores: {
            GS: { G: myParamG, S: 100 - myParamG },
            AP: { A: myParamA, P: 100 - myParamA },
            LT: { L: myParamL, T: 100 - myParamL },
            RI: { R: myParamR, I: 100 - myParamR },
          },
        }
      : null;

  const friendDisplayName = sharedUserName && sharedUserName !== '친구' ? `${sharedUserName}` : '공유한 친구';
  const friendWithSuffix = sharedUserName && sharedUserName !== '친구' ? `${sharedUserName}님` : '공유한 친구';

  const handleStartNewTest = () => {
    setAnswers({});
    setCurrentPage(0);
    setIsCompleted(false);
    setIsTakingTest(true);
    setTypePercentage(undefined);
    localStorage.removeItem('jusik_type_answers');
    localStorage.removeItem('jusik_type_completed');
    localStorage.removeItem('jusik_type_current_page');

    // 1:1 비교 파라미터(myCode, myU 등)가 URL에 있다면 제거하여 테스트 완료 후 내 결과 + 공유자 궁합으로 직행
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('myCode');
      url.searchParams.delete('myU');
      url.searchParams.delete('myG');
      url.searchParams.delete('myA');
      url.searchParams.delete('myL');
      url.searchParams.delete('myR');
      window.history.replaceState({}, '', url.toString());
    }
  };

  // Case 1: [방금 테스트 완료!] 사용자가 설문을 직접 풀어서 방금 막 끝마친 경우 -> 내 성향 리포트 최우선 + 아래에 친구와의 1:1 궁합 리포트 노출!
  if (justFinishedTest && isCompleted && Object.keys(answers).length > 0) {
    const myResultData = calculateSurveyResult(answers);

    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={handleRestart}
            className="inline-flex items-center gap-1.5 font-bold text-xs sm:text-sm text-[var(--text-secondary)] hover:text-[var(--accent-orange)] transition-all duration-300 glass-card glass-card-hover px-3.5 py-2 rounded-full active:scale-95 border border-[var(--border-color)]"
          >
            <RefreshCw className="w-4 h-4" />
            다시 진단하기
          </button>
          <Link
            href="/tools"
            className="inline-flex items-center gap-1.5 font-bold text-xs sm:text-sm text-[var(--text-secondary)] hover:text-[var(--accent-orange)] transition-all duration-300 glass-card glass-card-hover px-3.5 py-2 rounded-full active:scale-95 border border-[var(--border-color)]"
          >
            <ArrowLeft className="w-4 h-4" />
            투자도구 목록으로
          </Link>
        </div>

        {/* (1) 상단 1순위: 방금 진단한 '나의 투자 성향' 상세 리포트 */}
        <ResultView
          profile={myResultData.profile}
          scores={myResultData.scores}
          percentage={typePercentage}
          ownerName={user?.nickname}
          onRestart={handleRestart}
        />

        {/* (2) 하단 2순위: 공유받은 친구가 있다면 1:1 궁합 리포트 노출! (내가 기준: targetUser=나) */}
        {sharedProfile && (
          <div className="pt-2">
            <ResultCompareAccordion
              targetUser={{
                name: user?.nickname || '나',
                code: myResultData.typeCode,
                profile: myResultData.profile,
                scores: myResultData.scores,
              }}
              currentUser={{
                name: friendDisplayName,
                code: sharedProfile.code,
                profile: sharedProfile,
                scores: sharedScores,
              }}
            />
          </div>
        )}
      </div>
    );
  }

  // Case 2: [우선순위 1] 1:1 궁합 전용 공유 링크 (두 사람의 성향이 모두 파라미터로 넘어왔을 때)
  if (compareUserFromParams && sharedProfile && !isTakingTest) {
    const myResultData = isCompleted && Object.keys(answers).length > 0 ? calculateSurveyResult(answers) : null;

    // 만약 사용자가 '나와 투자 성향 비교하기' 버튼을 눌렀다면 나와 친구의 1:1 성향 비교 화면만 단독 노출! (내가 기준: targetUser=나)
    if (viewMyComparison && myResultData) {
      return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setViewMyComparison(false)}
              className="inline-flex items-center gap-1.5 font-bold text-xs sm:text-sm text-[var(--text-secondary)] hover:text-[var(--accent-orange)] transition-all duration-300 glass-card glass-card-hover px-3.5 py-2 rounded-full active:scale-95 border border-[var(--border-color)] cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              공유받은 1:1 성향 비교 다시보기
            </button>
            <Link
              href="/tools"
              className="inline-flex items-center gap-1.5 font-bold text-xs sm:text-sm text-[var(--text-secondary)] hover:text-[var(--accent-orange)] transition-all duration-300 glass-card glass-card-hover px-3.5 py-2 rounded-full active:scale-95 border border-[var(--border-color)]"
            >
              <ArrowLeft className="w-4 h-4" />
              투자도구 목록으로
            </Link>
          </div>

          {/* 내가 기준(Left/Top)인 1:1 성향 비교 리포트 단독 렌더링 */}
          <ResultCompareAccordion
            targetUser={{
              name: user?.nickname || '나',
              code: myResultData.typeCode,
              profile: myResultData.profile,
              scores: myResultData.scores,
            }}
            currentUser={{
              name: friendDisplayName,
              code: sharedProfile.code,
              profile: sharedProfile,
              scores: sharedScores,
            }}
          />
        </div>
      );
    }

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

        {/* 오직 공유된 두 사람 간의 1:1 궁합 리포트만 단독 노출 */}
        <ResultCompareAccordion
          targetUser={{
            name: friendDisplayName,
            code: sharedProfile.code,
            profile: sharedProfile,
            scores: sharedScores,
          }}
          currentUser={compareUserFromParams}
          onTakeTest={handleStartNewTest}
          hasMyResult={Boolean(myResultData)}
          onCompareWithMe={() => setViewMyComparison(true)}
        />
      </div>
    );
  }

  // Case 3: [우선순위 2] 친구 1인의 성향 공유 링크로 들어왔을 때 (기존 진단 완료자이거나 미진단자)
  if (sharedProfile && !isTakingTest) {
    const myResultData = isCompleted && Object.keys(answers).length > 0 ? calculateSurveyResult(answers) : null;

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

        {/* (1) 상단 1순위: 상대방(공유한 친구)의 상세 성향 리포트가 먼저 노출 */}
        <ResultView
          profile={sharedProfile}
          scores={sharedScores}
          percentage={typePercentage}
          ownerName={friendDisplayName}
          onRestart={handleStartNewTest}
        />

        {/* (2) 하단 2순위: 내가 이미 테스트를 완료한 상태라면 1:1 궁합 리포트, 아직 안 했다면 성향 진단 CTA 카드 노출 */}
        {myResultData ? (
          <div className="pt-2">
            <ResultCompareAccordion
              targetUser={{
                name: user?.nickname || '나',
                code: myResultData.typeCode,
                profile: myResultData.profile,
                scores: myResultData.scores,
              }}
              currentUser={{
                name: friendDisplayName,
                code: sharedProfile.code,
                profile: sharedProfile,
                scores: sharedScores,
              }}
            />
          </div>
        ) : (
          <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-4 border border-[var(--accent-orange)] shadow-[0_0_25px_rgba(241,143,1,0.2)] bg-[var(--card-hover)]/40 text-center relative overflow-hidden">
            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-[var(--accent-orange)]/15 text-[var(--accent-orange)] text-xs font-black font-mono inline-block">
                나의 성향 진단하기
              </span>
              <h3 className="text-lg sm:text-xl font-black text-[var(--text-primary)]">
                나는 어떤 투자 유형일까? 지금 3분 만에 진단해보세요!
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium">
                40문항 테스트를 완료하면 {attachJosa(friendWithSuffix, '과/와')}의 투자 궁합 리포트가 제공됩니다!
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={handleStartNewTest}
                className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-[var(--accent-orange)] text-white font-black text-sm border border-[var(--accent-orange)] shadow-[0_0_20px_rgba(241,143,1,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                나도 내 성향 진단하기 ➔
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 3. [우선순위 3] 공유 링크가 아닌 상태에서 내가 직접 테스트를 완료했을 때
  if (isCompleted && Object.keys(answers).length > 0) {
    const myResultData = calculateSurveyResult(answers);

    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={handleRestart}
            className="inline-flex items-center gap-1.5 font-bold text-xs sm:text-sm text-[var(--text-secondary)] hover:text-[var(--accent-orange)] transition-all duration-300 glass-card glass-card-hover px-3.5 py-2 rounded-full active:scale-95 border border-[var(--border-color)]"
          >
            <RefreshCw className="w-4 h-4" />
            다시 진단하기
          </button>
          <Link
            href="/tools"
            className="inline-flex items-center gap-1.5 font-bold text-xs sm:text-sm text-[var(--text-secondary)] hover:text-[var(--accent-orange)] transition-all duration-300 glass-card glass-card-hover px-3.5 py-2 rounded-full active:scale-95 border border-[var(--border-color)]"
          >
            <ArrowLeft className="w-4 h-4" />
            투자도구 목록으로
          </Link>
        </div>

        {/* 내 단독 결과 노출 */}
        <ResultView
          profile={myResultData.profile}
          scores={myResultData.scores}
          percentage={typePercentage}
          ownerName={user?.nickname}
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
          className="inline-flex items-center gap-1.5 font-bold text-xs sm:text-sm text-[var(--text-secondary)] hover:text-[var(--accent-orange)] transition-all duration-300 glass-card glass-card-hover px-3.5 py-2 rounded-full active:scale-95 border border-[var(--border-color)]"
        >
          <RefreshCw className="w-4 h-4" />
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
        <div className="glass-card p-6 rounded-3xl space-y-4 border border-[var(--accent-orange)] shadow-[0_0_20px_rgba(241,143,1,0.18)] bg-[var(--card-hover)]/40 relative overflow-hidden flex flex-col sm:flex-row items-center gap-5">
          <div className="relative shrink-0 py-1">
            <div className="absolute inset-0 bg-[var(--accent-orange)]/20 rounded-full blur-xl pointer-events-none" />
            <img
              src={`/types/${sharedProfile.code}.png`}
              alt={`${sharedProfile.name} 3D 아이콘`}
              className="w-24 h-24 sm:w-28 sm:h-28 object-contain animate-float-y filter drop-shadow-[0_8px_16px_rgba(241,143,1,0.25)] relative z-10"
            />
          </div>

          <div className="space-y-2 flex-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[var(--accent-orange)] text-white text-[11px] font-extrabold font-mono">
                공유받은 성향
              </span>
              <span className="text-xs font-bold text-[var(--accent-orange)] font-mono">
                ({sharedProfile.code})
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="text-lg sm:text-xl font-black text-[var(--text-primary)] tracking-tight">
                친구의 성향: <span className="text-[var(--accent-orange)]">"{sharedProfile.name}"</span>
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium leading-relaxed">
                "{sharedProfile.tagline}"
              </p>
            </div>

            <p className="text-xs font-bold text-[var(--accent-orange)] pt-1">
              나는 어떤 투자 유형일까? 지금 3분 만에 진단해보세요! 🦉
            </p>
          </div>
        </div>
      )}

      {/* Progress & Milestone Header */}
      <div className="glass-card p-5 rounded-3xl space-y-3 border border-[var(--border-color)] shadow-xs">
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
              id={`question-card-${idx}`}
              className="glass-card p-5 sm:p-7 rounded-3xl space-y-5 border border-[var(--border-color)] relative"
              style={{ transform: 'translateZ(0)', WebkitBackfaceVisibility: 'hidden' }}
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

              {/* 5-Point Rating Circular Dot Buttons (Clean Aesthetic Radio Dots) */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between w-full gap-2 sm:gap-4 py-2 px-1">
                  {[1, 2, 3, 4, 5].map((score) => {
                    const isSelected = selectedScore === score;
                    return (
                      <button
                        key={score}
                        onClick={() => handleSelectScore(q.id, score, idx)}
                        className={`w-10 h-10 sm:w-12 sm:h-12 aspect-square rounded-full transition-all duration-200 active:scale-90 flex items-center justify-center border shrink-0 ${
                          isSelected
                            ? 'bg-[var(--accent-orange)] border-[var(--accent-orange)] shadow-[0_0_16px_rgba(241,143,1,0.5)] scale-105'
                            : 'glass-card glass-card-hover border-[var(--border-color)] hover:border-[var(--accent-orange)]/50 hover:scale-105'
                        }`}
                        title={`${score}점 선택`}
                        aria-label={`점수 ${score}점`}
                      >
                        <span
                          className={`rounded-full transition-all ${
                            isSelected
                              ? 'w-3.5 h-3.5 sm:w-4 sm:h-4 bg-white shadow-xs'
                              : 'w-2.5 h-2.5 sm:w-3 sm:h-3 bg-[var(--text-secondary)]/30 hover:bg-[var(--accent-orange)]/60'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>

                {/* Left/Right Scale Labels (Symmetric Balanced Line Wrapping with text-wrap:balance) */}
                <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm font-semibold text-[var(--text-secondary)] pt-3 border-t border-[var(--border-color)]">
                  <div className="text-left leading-relaxed break-keep [text-wrap:balance]">
                    {q.leftLabel}
                  </div>
                  <div className="text-right leading-relaxed break-keep [text-wrap:balance]">
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

export default function InvestmentSurveyPage({ initialCode }: { initialCode?: string }) {
  return (
    <React.Suspense fallback={<div className="max-w-4xl mx-auto p-8 text-center text-sm font-bold">로딩 중...</div>}>
      <SurveyContent initialCode={initialCode} />
    </React.Suspense>
  );
}
