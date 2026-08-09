'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PersonalityProfile } from '@/data/investmentSurvey';
import { Sparkles, Share2, RefreshCw, Compass, CheckCircle2, AlertTriangle } from 'lucide-react';

interface ResultViewProps {
  profile: PersonalityProfile;
  scores: {
    GS: { G: number; S: number };
    AP: { A: number; P: number };
    LT: { L: number; T: number };
    RI: { R: number; I: number };
  };
  percentage?: number;
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

export default function ResultView({ profile, scores, percentage, onRestart }: ResultViewProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/tools/type/${profile.code}`;
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
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header Badge */}
      <div className="text-center space-y-2 py-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--accent-orange)]/15 text-[var(--accent-orange)] text-xs font-bold font-mono">
          <Sparkles className="w-3.5 h-3.5" />
          투자 성향 진단 완료
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
          나의 투자 성향
        </h1>
      </div>

      {/* Main Personality Card */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-6 shadow-xs border border-[var(--border-color)] relative overflow-hidden transition-all duration-300">
        <div className="absolute top-0 right-0 w-48 h-48 bg-[var(--accent-orange)]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Floating 3D Glass Icon Avatar & Title Section */}
        <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-7 text-center sm:text-left">
          {/* Borderless Floating 3D Icon Container */}
          <div className="relative shrink-0 group py-2">
            <div className="absolute inset-0 bg-[var(--accent-orange)]/20 rounded-full blur-2xl pointer-events-none" />
            {/* Larger Borderless Floating Y-Axis Icon */}
            <img
              src={`/types/${profile.code}.png`}
              alt={`${profile.name} (${profile.code}) 3D 아이콘`}
              className="w-36 h-36 sm:w-44 sm:h-44 object-contain animate-float-y filter drop-shadow-[0_12px_24px_rgba(241,143,1,0.3)] relative z-10 transition-transform duration-300 group-hover:scale-110"
            />
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
          ].map((item) => {
            const exp = AXIS_EXPLANATIONS[item.key];
            const isRightWinner = item.rightPct > item.leftPct;

            const leftCode = isRightWinner ? item.rightCode : item.leftCode;
            const leftLabel = isRightWinner ? item.rightLabel : item.leftLabel;
            const leftPct = isRightWinner ? item.rightPct : item.leftPct;
            const leftDesc = isRightWinner ? exp.rightDesc : exp.leftDesc;

            const rightCode = isRightWinner ? item.leftCode : item.rightCode;
            const rightLabel = isRightWinner ? item.leftLabel : item.rightLabel;
            const rightPct = isRightWinner ? item.leftPct : item.rightPct;
            const rightDesc = isRightWinner ? exp.leftDesc : exp.rightDesc;

            const isLeftWinner = leftPct >= rightPct;

            return (
              <div key={item.key} className="space-y-2.5 p-3.5 sm:p-4 rounded-2xl bg-[var(--bg-main)]/50 border border-[var(--border-color)] transition-all duration-200 hover:border-[var(--accent-orange)]/40 hover:shadow-[0_0_15px_rgba(241,143,1,0.12)]">
                {/* Header Labels with Winner Highlight & Percentages */}
                <div className="flex items-center justify-between text-xs sm:text-sm font-extrabold">
                  <div className="flex items-center gap-1.5">
                    <span className={isLeftWinner ? 'text-[var(--accent-orange)] font-black' : 'text-[var(--text-secondary)]/60 font-semibold'}>
                      {leftLabel}({leftCode}) {leftPct}%
                    </span>
                    {isLeftWinner && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-[var(--accent-orange)]/15 text-[var(--accent-orange)] font-bold">
                        우세
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {!isLeftWinner && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-[var(--accent-orange)]/15 text-[var(--accent-orange)] font-bold">
                        우세
                      </span>
                    )}
                    <span className={!isLeftWinner ? 'text-[var(--accent-orange)] font-black' : 'text-[var(--text-secondary)]/60 font-semibold'}>
                      {rightLabel}({rightCode}) {rightPct}%
                    </span>
                  </div>
                </div>

                {/* Gauge Bar (Winner: Signature Orange Glow, Loser: Soft Translucent Muted Tone) */}
                <div className="w-full h-3.5 rounded-full bg-[var(--bg-main)] overflow-hidden flex p-0.5 border border-[var(--border-color)] shadow-inner">
                  {/* Left Side Fill */}
                  <div
                    className={`h-full rounded-l-full transition-all duration-1000 ${isLeftWinner
                      ? 'bg-[var(--accent-orange)] shadow-[0_0_10px_rgba(241,143,1,0.4)]'
                      : 'bg-[var(--text-secondary)]/12'
                      }`}
                    style={{ width: `${leftPct}%` }}
                  />
                  {/* Right Side Fill */}
                  <div
                    className={`h-full rounded-r-full transition-all duration-1000 ${!isLeftWinner
                      ? 'bg-[var(--accent-orange)] shadow-[0_0_10px_rgba(241,143,1,0.4)]'
                      : 'bg-[var(--text-secondary)]/12'
                      }`}
                    style={{ width: `${rightPct}%` }}
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
          })}
        </div>
      </div>

      {/* Strengths & Weaknesses Cards */}
      {(profile.strengths || profile.weaknesses) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* 5 Strengths */}
          {profile.strengths && (
            <div className="glass-card p-5 sm:p-6 rounded-3xl space-y-3.5 border border-[var(--border-color)] shadow-xs">
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

          {/* 5 Weaknesses */}
          {profile.weaknesses && (
            <div className="glass-card p-5 sm:p-6 rounded-3xl space-y-3.5 border border-[var(--border-color)] shadow-xs">
              <div className="flex items-center gap-2 pb-1 border-b border-[var(--border-color)]">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent-orange)] shadow-[0_0_8px_rgba(241,143,1,0.6)]" />
                <h3 className="text-sm font-extrabold text-[var(--text-primary)] tracking-tight">
                  주의해야 할 약점
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
        <div className="glass-card p-5 sm:p-7 rounded-3xl space-y-4 shadow-xs border border-[var(--border-color)] transition-all duration-300">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[var(--accent-orange)]" />
            <h3 className="text-sm sm:text-base font-extrabold text-[var(--text-primary)] tracking-tight">
              {profile.name} 맞춤 가이드
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-0.5">
            {/* Recommendation (나만의 핵심 무기) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-main)]/50 border border-[var(--border-color)] space-y-1.5 transition-all duration-200">
              <div className="flex items-center gap-1.5 text-xs font-black text-[var(--accent-green)]">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>나만의 핵심 무기</span>
              </div>
              <p className="text-xs sm:text-sm text-[var(--text-primary)] font-bold leading-relaxed">
                {profile.guidelines.recommendation}
              </p>
            </div>

            {/* Warning / Caution (이것만은 경계하세요) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-main)]/50 border border-[var(--border-color)] space-y-1.5 transition-all duration-200">
              <div className="flex items-center gap-1.5 text-xs font-black text-[var(--accent-orange)]">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>이것만은 경계하세요</span>
              </div>
              <p className="text-xs sm:text-sm text-[var(--text-primary)] font-bold leading-relaxed">
                {profile.guidelines.warning}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Simulator Link CTA Card */}
      <div className="glass-card p-6 rounded-3xl space-y-4 border border-[var(--accent-orange)] bg-[var(--accent-orange)]/5 relative overflow-hidden shadow-[0_0_20px_rgba(241,143,1,0.12)]">
        <div className="flex items-center justify-between gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-[var(--accent-orange)] text-white text-[11px] font-extrabold font-mono">
            맞춤 전략 제공
          </span>
          <span className="text-xs font-bold text-[var(--accent-orange)] font-mono">
            {profile.name} 유형 추천
          </span>
        </div>
        <div className="space-y-1">
          <h3 className="text-lg sm:text-xl font-black text-[var(--text-primary)] tracking-tight">
            내 성향에 딱 맞는 맞춤 전략을 확인해보세요! 🚀
          </h3>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium leading-relaxed">
            {profile.name} 유형에 맞춰 추천 전략이 제공됩니다.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href={`/tools/simulate?type=${profile.code}&g=${scores.GS.G}&a=${scores.AP.A}&l=${scores.LT.L}&r=${scores.RI.R}`}
            className="inline-flex items-center justify-center gap-2 w-full px-5 py-3.5 rounded-2xl bg-[var(--accent-orange)] text-white font-extrabold text-sm border border-[var(--accent-orange)] shadow-[0_0_18px_rgba(241,143,1,0.35)] hover:shadow-[0_0_25px_rgba(241,143,1,0.5)] hover:scale-[1.01] active:scale-[0.98] transition-all"
          >
            내 성향 맞춤 시뮬레이션 시작하기 ➔
          </Link>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          onClick={handleShare}
          className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl glass-card glass-card-hover text-[var(--text-primary)] font-extrabold text-sm border border-[var(--border-color)] hover:border-[var(--accent-orange)]/40 hover:text-[var(--accent-orange)] hover:shadow-[0_0_20px_rgba(241,143,1,0.18)] hover:scale-[1.01] active:scale-[0.98] transition-all"
        >
          <Share2 className="w-4 h-4 text-[var(--accent-orange)]" />
          {copied ? '결과 링크 복사 완료! 🎉' : '내 성향 결과 공유하기'}
        </button>

        <button
          onClick={onRestart}
          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl glass-card glass-card-hover text-[var(--text-primary)] font-bold text-sm border border-[var(--border-color)] hover:border-[var(--accent-orange)]/40 hover:text-[var(--accent-orange)] hover:shadow-[0_0_20px_rgba(241,143,1,0.18)] hover:scale-[1.01] active:scale-[0.98] transition-all"
        >
          <RefreshCw className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-[var(--accent-orange)]" />
          다시 진단하기
        </button>
      </div>
    </div>
  );
}