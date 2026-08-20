'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PersonalityProfile, TYPE_EMOJIS } from '@/data/investmentSurvey';
import { Sparkles, Share2, RefreshCw, Compass, CheckCircle2, AlertTriangle } from 'lucide-react';
import RevealOnScroll from '@/components/common/RevealOnScroll';

interface ResultViewProps {
  profile: PersonalityProfile;
  scores: {
    GS: { G: number; S: number };
    AP: { A: number; P: number };
    LT: { L: number; T: number };
    RI: { R: number; I: number };
  };
  percentage?: number;
  ownerName?: string;
  isReadOnly?: boolean;
  showSimulatorCta?: boolean;
  onRestart: () => void;
}

interface AxisExplanation {
  leftCode: string;
  leftName: string;
  leftDesc: string;
  rightCode: string;
  rightName: string;
  rightDesc: string;
}

// 다듬어진 한글 용어 및 직관적인 설명 반영
const AXIS_EXPLANATIONS: Record<string, AxisExplanation> = {
  GS: {
    leftCode: 'S',
    leftName: '안전형 (Safety)',
    leftDesc: '원금 보전 최우선',
    rightCode: 'G',
    rightName: '수익형 (Growth)',
    rightDesc: '위험 감수 및 높은 수익 추구',
  },
  AP: {
    leftCode: 'P',
    leftName: '수동형 (Passive)',
    leftDesc: '시장 흐름 수동 추종',
    rightCode: 'A',
    rightName: '능동형 (Active)',
    rightDesc: '기업 직접 분석 및 개입',
  },
  LT: {
    leftCode: 'T',
    leftName: '추세형 (Tactical)',
    leftDesc: '단기 트렌드 및 유연 대응',
    rightCode: 'L',
    rightName: '장기형 (Long-term)',
    rightDesc: '복리 효과 기반 장기 보유',
  },
  RI: {
    leftCode: 'I',
    leftName: '직감형 (Intuitive)',
    leftDesc: '시각적·직관적 인사이트 판단',
    rightCode: 'R',
    rightName: '원칙형 (Rule-based)',
    rightDesc: '검증된 룰 및 원칙 매매',
  },
};

function SpectrumGaugeItem({
  item,
  axisExp,
  dominantCode,
}: {
  item: {
    key: string;
    title: string;
    leftCode: string;
    leftLabel: string;
    leftPct: number;
    rightCode: string;
    rightLabel: string;
    rightPct: number;
  };
  axisExp: AxisExplanation;
  dominantCode?: string;
}) {
  const [animatedLeft, setAnimatedLeft] = useState(0);
  const [animatedRight, setAnimatedRight] = useState(0);

  // Determine winner: if tied (50:50), strictly follow dominantCode from profile (G, A, L, R priority)
  const isRightWinner = item.rightPct > item.leftPct || (item.rightPct === item.leftPct && item.rightCode === dominantCode);
  const leftCode = isRightWinner ? item.rightCode : item.leftCode;
  const leftLabel = isRightWinner ? item.rightLabel : item.leftLabel;
  const leftPct = isRightWinner ? item.rightPct : item.leftPct;
  const leftDesc = isRightWinner ? axisExp.rightDesc : axisExp.leftDesc;

  const rightCode = isRightWinner ? item.leftCode : item.rightCode;
  const rightLabel = isRightWinner ? item.leftLabel : item.rightLabel;
  const rightPct = isRightWinner ? item.leftPct : item.rightPct;
  const rightDesc = isRightWinner ? axisExp.leftDesc : axisExp.rightDesc;

  const isLeftWinner = true; // Left side is always placed as the winner/dominant trait

  useEffect(() => {
    let animId: number;
    const timer = setTimeout(() => {
      const duration = 1200;
      const startTime = performance.now();

      const run = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);

        setAnimatedLeft(Math.round(ease * leftPct));
        setAnimatedRight(Math.round(ease * rightPct));

        if (progress < 1) {
          animId = requestAnimationFrame(run);
        }
      };

      animId = requestAnimationFrame(run);
    }, 120);

    return () => {
      clearTimeout(timer);
      if (animId) cancelAnimationFrame(animId);
    };
  }, [leftPct, rightPct]);

  return (
    <div className="space-y-2.5 p-3.5 sm:p-4 rounded-2xl bg-[var(--bg-main)]/50 border border-[var(--border-color)] transition-all duration-200 hover:border-[var(--accent-orange)]/40 hover:shadow-[0_0_15px_rgba(241,143,1,0.12)]">
      {/* Header Labels: Only the dominant/winner trait gets the percentage */}
      <div className="flex items-center justify-between text-xs sm:text-sm font-extrabold">
        <div className="flex items-center gap-1.5">
          <span className="text-[var(--accent-orange)] font-black">
            {leftLabel}({leftCode}) {`${animatedLeft}%`}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[var(--text-secondary)]/60 font-semibold">
            {rightLabel}({rightCode})
          </span>
        </div>
      </div>

      {/* Gauge Bar (Winner: Signature Orange Glow, Loser: Soft Translucent Muted Tone) */}
      <div className="w-full h-3.5 rounded-full bg-[var(--bg-main)] overflow-hidden flex p-0.5 border border-[var(--border-color)] shadow-inner">
        {/* Left Side Fill (Dominant Winner) */}
        <div
          className="h-full rounded-l-full bg-[var(--accent-orange)] shadow-[0_0_10px_rgba(241,143,1,0.4)]"
          style={{ width: `${animatedLeft}%` }}
        />
        {/* Right Side Fill (Muted) */}
        <div
          className="h-full rounded-r-full bg-[var(--text-secondary)]/12"
          style={{ width: `${animatedRight}%` }}
        />
      </div>

      {/* Always-visible Inline Descriptions */}
      <div className="grid grid-cols-2 gap-3 text-[11px] pt-1 leading-tight">
        <div className={`text-left ${isLeftWinner ? 'text-[var(--text-primary)] font-bold' : 'text-[var(--text-secondary)]/50 font-normal'}`}>
          • {leftDesc}
        </div>
        <div className={`text-right ${!isLeftWinner ? 'text-[var(--text-primary)] font-bold' : 'text-[var(--text-secondary)]/50 font-normal'}`}>
          • {rightDesc}
        </div>
      </div>
    </div>
  );
}

export default function ResultView({ profile, scores, percentage, ownerName, isReadOnly = false, showSimulatorCta = false, onRestart }: ResultViewProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    const queryParams = new URLSearchParams();
    if (ownerName && ownerName !== '공유한 친구' && ownerName !== '친구') {
      queryParams.set('u', ownerName);
    }
    queryParams.set('g', scores.GS.G.toString());
    queryParams.set('a', scores.AP.A.toString());
    queryParams.set('l', scores.LT.L.toString());
    queryParams.set('r', scores.RI.R.toString());

    const shareUrl = `${window.location.origin}/tools/type/${profile.code}?${queryParams.toString()}`;
    const fullText = `내 투자 성향은 "${profile.name}(${profile.code})"! 너한테 딱 맞는 주식 투자 스타일도 진단해보자 👇\n\n${shareUrl}`;

    if (navigator.share) {
      navigator.share({
        text: fullText,
      }).catch(() => {
        navigator.clipboard.writeText(fullText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      });
    } else {
      navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <RevealOnScroll>
      <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Title (Left-aligned brand standard) */}
      <div className="space-y-1 py-1 text-left">
        <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
          {isReadOnly && ownerName
            ? ownerName === '공유한 친구'
              ? '공유한 친구의 투자 성향'
              : `${ownerName}님의 투자 성향`
            : '나의 투자 성향'}
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium">
          {isReadOnly && ownerName
            ? ownerName === '공유한 친구'
              ? '공유된 투자 성향 진단 결과입니다.'
              : `${ownerName}님의 투자 성향 진단 결과입니다.`
            : '40문항 진단으로 분석한 나의 투자 기질과 맞춤형 위험 관리법입니다.'}
        </p>
      </div>

      {/* Main Personality Card */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-6 shadow-xs border border-[var(--border-color)] relative overflow-hidden transition-all duration-300">
        <div className="absolute top-0 right-0 w-48 h-48 bg-[var(--accent-orange)]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Floating Large Emoji Avatar & Title Section */}
        <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-7 text-center sm:text-left">
          {/* Borderless Pure Floating Large Emoji */}
          <div className="relative shrink-0 group py-2 flex items-center justify-center">
            <div className="absolute inset-0 bg-[var(--accent-orange)]/25 rounded-full blur-3xl pointer-events-none" />
            <div className="w-28 h-28 sm:w-36 sm:h-36 flex items-center justify-center relative z-10 animate-float-y group-hover:scale-110 transition-transform duration-300">
              <span className="text-7xl sm:text-8xl select-none filter drop-shadow-[0_12px_24px_rgba(241,143,1,0.22)] leading-none">
                {TYPE_EMOJIS[profile.code] || '🦉'}
              </span>
            </div>
          </div>

          <div className="space-y-3 flex-1">
            {/* Badges (Overall Population Percentage Badge on top line, 4 Trait Badges on next line) */}
            <div className="space-y-2">
              {percentage !== undefined && percentage > 0 && (
                <div>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[var(--accent-orange)] text-white text-[11px] font-extrabold shadow-sm border border-[var(--accent-orange)] animate-pulse">
                    🔥 전체 참여자 중 <span className="font-mono text-xs underline underline-offset-2">{percentage}%</span>가 이 유형이에요!
                  </span>
                </div>
              )}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                {profile.badges.map((b, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-full bg-[var(--card-hover)] text-[var(--text-secondary)] text-[11px] font-bold border border-[var(--border-color)] transition-all">
                    {b}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
                {profile.name} <span className="text-lg sm:text-xl font-bold text-[var(--accent-orange)] font-mono">({profile.code})</span>
              </h2>
            </div>

            <p className="text-sm sm:text-base font-bold text-[var(--accent-orange)] leading-relaxed pt-1">
              "{profile.tagline}"
            </p>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium leading-relaxed bg-[var(--bg-main)]/60 p-4 rounded-2xl border border-[var(--border-color)]">
          {profile.description}
        </p>

        {/* 4-Axis Spectrum Gauges (Intuitive Dual-Color Split vs Winner Highlight) */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-1.5 font-mono">
              <Compass className="w-4 h-4 text-[var(--accent-orange)]" />
              세부 성향 비율 리포트
            </h3>
          </div>

          {/* Spectrum Axis Items */}
          {[
            {
              key: 'GS',
              title: '목표 축',
              leftCode: 'S',
              leftLabel: '안전형',
              leftPct: scores.GS.S,
              rightCode: 'G',
              rightLabel: '수익형',
              rightPct: scores.GS.G,
            },
            {
              key: 'AP',
              title: '실행 축',
              leftCode: 'P',
              leftLabel: '수동형',
              leftPct: scores.AP.P,
              rightCode: 'A',
              rightLabel: '능동형',
              rightPct: scores.AP.A,
            },
            {
              key: 'LT',
              title: '시간 축',
              leftCode: 'T',
              leftLabel: '추세형',
              leftPct: scores.LT.T,
              rightCode: 'L',
              rightLabel: '장기형',
              rightPct: scores.LT.L,
            },
            {
              key: 'RI',
              title: '심리 축',
              leftCode: 'I',
              leftLabel: '직감형',
              leftPct: scores.RI.I,
              rightCode: 'R',
              rightLabel: '원칙형',
              rightPct: scores.RI.R,
            },
          ].map((item, idx) => (
            <SpectrumGaugeItem
              key={item.key}
              item={item}
              axisExp={AXIS_EXPLANATIONS[item.key]}
              dominantCode={profile.code[idx]}
            />
          ))}
        </div>
      </div>

      {/* Strengths & Weaknesses Cards */}
      {(profile.strengths || profile.weaknesses) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* 5 Strengths */}
          {profile.strengths && (
            <div className="glass-card p-5 sm:p-6 rounded-3xl space-y-3.5 border border-[var(--border-color)] shadow-xs m3-card-enter stagger-1">
              <div className="flex items-center gap-2 pb-1 border-b border-[var(--border-color)]">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent-green)] shadow-[0_0_8px_rgba(104,166,125,0.6)]" />
                <h3 className="text-sm font-extrabold text-[var(--text-primary)] tracking-tight">
                  {profile.name}의 핵심 강점
                </h3>
              </div>
              <ul className="space-y-2 text-xs sm:text-sm text-[var(--text-primary)] font-medium">
                {profile.strengths.map((str, idx) => (
                  <li key={idx} className="flex items-start gap-2 leading-relaxed">
                    <span className="text-[var(--accent-green)] font-black text-xs shrink-0 mt-0.5">✓</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Weaknesses / Caution */}
          {profile.weaknesses && (
            <div className="glass-card p-5 sm:p-6 rounded-3xl space-y-3.5 border border-[var(--border-color)] shadow-xs m3-card-enter stagger-2">
              <div className="flex items-center gap-2 pb-1 border-b border-[var(--border-color)]">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent-orange)] shadow-[0_0_8px_rgba(241,143,1,0.6)]" />
                <h3 className="text-sm font-extrabold text-[var(--text-primary)] tracking-tight">
                  투자 시 주의할 점
                </h3>
              </div>
              <ul className="space-y-2 text-xs sm:text-sm text-[var(--text-secondary)] font-medium">
                {profile.weaknesses.map((weak, idx) => (
                  <li key={idx} className="flex items-start gap-2 leading-relaxed">
                    <span className="text-[var(--accent-orange)] font-black text-xs shrink-0 mt-0.5">!</span>
                    <span>{weak}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Tailored Investment Guidelines Card */}
      {profile.guidelines && (
        <div className="glass-card p-5 sm:p-7 rounded-3xl space-y-4 shadow-xs border border-[var(--border-color)] transition-all duration-300 m3-card-enter stagger-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[var(--accent-orange)]" />
            <h3 className="text-sm sm:text-base font-extrabold text-[var(--text-primary)] tracking-tight">
              감정을 이기는 원칙 & 추천 가이드
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-0.5">
            {/* Recommendation (원칙 지침) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-main)]/50 border border-[var(--border-color)] space-y-1.5 transition-all duration-200">
              <div className="flex items-center gap-1.5 text-xs font-black text-[var(--accent-green)]">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>원칙 지침</span>
              </div>
              <p className="text-xs sm:text-sm text-[var(--text-primary)] font-bold leading-relaxed">
                {profile.guidelines.recommendation}
              </p>
            </div>

            {/* Warning (경고 수칙) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-main)]/50 border border-[var(--border-color)] space-y-1.5 transition-all duration-200">
              <div className="flex items-center gap-1.5 text-xs font-black text-[var(--accent-orange)]">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>경고 수칙</span>
              </div>
              <p className="text-xs sm:text-sm text-[var(--text-primary)] font-bold leading-relaxed">
                {profile.guidelines.warning}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Simulator Link CTA Card (내 성향에 맞는 투자 방법 안내 - 중앙 정렬 일반 글래스 버튼) */}
      {!isReadOnly && showSimulatorCta && (
        <div className="glass-card p-5 sm:p-6 rounded-3xl space-y-3.5 border border-[var(--border-color)] bg-[var(--card-surface)]/60 text-center relative overflow-hidden m3-card-enter stagger-4">
          <div className="space-y-1.5 max-w-lg mx-auto">
            <h3 className="text-base sm:text-lg font-black text-[var(--text-primary)] tracking-tight">
              "{profile.name}" 성향을 위한 가장 알맞은 투자 방법을 알려드릴게요!
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium leading-relaxed">
              내 성향에 맞춰 주식을 고르고, 과거에 투자했다면 얼마를 벌었을지 직접 확인해볼 수 있어요.
            </p>
          </div>
          <div className="pt-1 flex justify-center">
            <Link
              href={`/tools/simulate?type=${profile.code}&g=${scores.GS.G}&a=${scores.AP.A}&l=${scores.LT.L}&r=${scores.RI.R}`}
              className="inline-flex items-center justify-center gap-1.5 px-6 py-3 rounded-2xl glass-card glass-card-hover text-[var(--text-primary)] hover:text-[var(--accent-orange)] font-extrabold text-xs sm:text-sm border border-[var(--border-color)] hover:border-[var(--accent-orange)]/40 shadow-xs active:scale-[0.98] transition-all cursor-pointer"
            >
              <span>직접 테스트해보기</span>
              <span className="text-[var(--accent-orange)]">➔</span>
            </Link>
          </div>
        </div>
      )}

      {/* Action Buttons: 💖 공유하기 (주황색 강조 메인 버튼) & 다시 진단하기 (보조 버튼) */}
      {!isReadOnly && (
        <div className="flex flex-col sm:flex-row gap-3 pt-1">
          <button
            onClick={handleShare}
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[var(--accent-orange)] text-white font-black text-sm border border-[var(--accent-orange)] shadow-[0_0_20px_rgba(241,143,1,0.35)] hover:shadow-[0_0_25px_rgba(241,143,1,0.5)] hover:scale-[1.01] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Share2 className="w-4 h-4 text-white" />
            <span>{copied ? '궁합 링크 복사 완료! 친구에게 보내보세요 🎉' : '친구에게 공유하고 투자 궁합 확인하기 💖'}</span>
          </button>

          <button
            onClick={onRestart}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl glass-card glass-card-hover text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-bold text-sm border border-[var(--border-color)] hover:border-[var(--accent-orange)]/40 hover:shadow-[0_0_15px_rgba(241,143,1,0.15)] active:scale-[0.98] transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-[var(--text-secondary)]" />
            <span>다시 진단하기</span>
          </button>
        </div>
      )}
      </div>
    </RevealOnScroll>
  );
}