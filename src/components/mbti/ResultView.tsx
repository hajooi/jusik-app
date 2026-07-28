'use client';

import React, { useState } from 'react';
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

export default function ResultView({ profile, scores, onRestart }: ResultViewProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `내 투자 성향: ${profile.name} (${profile.code})`,
        text: `jusik.app에서 내 투자 성향을 진단해 봤어요! 당신의 유형은 무엇인가요?`,
        url: window.location.href,
      }).catch(() => { });
    } else {
      navigator.clipboard.writeText(window.location.href);
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
          당신의 투자 성향 리포트
        </h1>
      </div>

      {/* Main Personality Card */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-6 shadow-xs border border-[var(--border-color)] relative overflow-hidden transition-all duration-300 hover:border-[var(--accent-orange)]/40 hover:shadow-[0_0_25px_rgba(241,143,1,0.18)]">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent-orange)]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-3 text-center sm:text-left">
          {/* Code badge & Badges */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span className="px-3 py-1 rounded-full bg-[var(--accent-orange)] text-white text-xs font-black tracking-wider font-mono shadow-xs">
              {profile.code}
            </span>
            {profile.badges.map((b, i) => (
              <span key={i} className="px-2.5 py-1 rounded-full bg-[var(--card-hover)] text-[var(--text-secondary)] text-[11px] font-bold border border-[var(--border-color)]">
                {b}
              </span>
            ))}
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
            const isLeftWinner = item.leftPct > item.rightPct;

            return (
              <div key={item.key} className="space-y-2.5 p-3.5 sm:p-4 rounded-2xl bg-[var(--bg-main)]/50 border border-[var(--border-color)] transition-all duration-200 hover:border-[var(--accent-orange)]/40 hover:shadow-[0_0_15px_rgba(241,143,1,0.12)]">
                {/* Header Labels with Winner Highlight & Percentages */}
                <div className="flex items-center justify-between text-xs sm:text-sm font-extrabold">
                  <div className="flex items-center gap-1.5">
                    <span className={isLeftWinner ? 'text-[var(--accent-orange)] font-black' : 'text-[var(--text-secondary)]/60 font-semibold'}>
                      {item.leftLabel}({item.leftCode}) {item.leftPct}%
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
                      {item.rightLabel}({item.rightCode}) {item.rightPct}%
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
                    style={{ width: `${item.leftPct}%` }}
                  />
                  {/* Right Side Fill */}
                  <div
                    className={`h-full rounded-r-full transition-all duration-1000 ${!isLeftWinner
                      ? 'bg-[var(--accent-orange)] shadow-[0_0_10px_rgba(241,143,1,0.4)]'
                      : 'bg-[var(--text-secondary)]/12'
                      }`}
                    style={{ width: `${item.rightPct}%` }}
                  />
                </div>

                {/* Always-visible Inline Descriptions */}
                <div className="grid grid-cols-2 gap-3 text-[11px] pt-1 leading-tight">
                  <div className={`text-left ${isLeftWinner ? 'text-[var(--text-primary)] font-bold' : 'text-[var(--text-secondary)]/50 font-normal'}`}>
                    • {exp.leftDesc}
                  </div>
                  <div className={`text-right ${!isLeftWinner ? 'text-[var(--text-primary)] font-bold' : 'text-[var(--text-secondary)]/50 font-normal'}`}>
                    • {exp.rightDesc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tailored Investment Guidelines Card */}
      {profile.guidelines && (
        <div className="glass-card p-5 sm:p-7 rounded-3xl space-y-4 shadow-xs border border-[var(--border-color)] transition-all duration-300 hover:border-[var(--accent-orange)]/40 hover:shadow-[0_0_20px_rgba(241,143,1,0.15)]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[var(--accent-orange)]" />
            <h3 className="text-sm sm:text-base font-extrabold text-[var(--text-primary)] tracking-tight">
              {profile.name} 맞춤 투자 지침서
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-0.5">
            {/* Recommendation (나만의 핵심 무기) */}
            <div className="p-4 rounded-2xl bg-[var(--bg-main)]/60 border border-[var(--accent-green)]/30 space-y-1.5 transition-all">
              <div className="flex items-center gap-1.5 text-xs font-black text-[var(--accent-green)]">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>나만의 핵심 무기</span>
              </div>
              <p className="text-xs sm:text-sm text-[var(--text-primary)] font-bold leading-relaxed">
                {profile.guidelines.recommendation}
              </p>
            </div>

            {/* Warning / Caution (이것만은 경계하세요) */}
            <div className="p-4 rounded-2xl bg-[var(--bg-main)]/60 border border-[var(--accent-orange)]/30 space-y-1.5 transition-all">
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

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          onClick={handleShare}
          className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-[var(--accent-orange)] text-white font-extrabold text-sm border border-[var(--accent-orange)] shadow-[0_0_15px_rgba(241,143,1,0.3)] hover:shadow-[0_0_22px_rgba(241,143,1,0.5)] hover:scale-[1.01] active:scale-[0.98] transition-all"
        >
          <Share2 className="w-4 h-4" />
          {copied ? '결과 링크 복사 완료!' : '내 성향 결과 공유하기'}
        </button>

        <button
          onClick={onRestart}
          className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl glass-card text-[var(--text-primary)] font-bold text-sm border border-[var(--border-color)] hover:border-[var(--accent-orange)]/40 hover:text-[var(--accent-orange)] hover:shadow-[0_0_15px_rgba(241,143,1,0.25)] hover:scale-[1.01] active:scale-[0.98] transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          다시 진단하기
        </button>
      </div>
    </div>
  );
}