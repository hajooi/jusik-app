'use client';

import React from 'react';
import Link from 'next/link';
import { PersonalityProfile } from '@/data/investmentSurvey';
import { Sparkles, Share2, RefreshCw, ArrowRight, CheckCircle2, ShieldAlert, Award, Compass } from 'lucide-react';

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

export default function ResultView({ profile, scores, onRestart }: ResultViewProps) {
  const [copied, setCopied] = React.useState(false);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `내 투자 MBTI 성향: ${profile.name} (${profile.code})`,
        text: `주식부엉에서 내 투자 성향을 진단해 봤어요! 당신의 유형은 무엇인가요?`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12">
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
      <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-6 shadow-md border border-[var(--accent-orange)]/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent-orange)]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-3 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span className="px-3 py-1 rounded-full bg-[var(--accent-orange)] text-white text-xs font-extrabold font-mono shadow-2xs">
              {profile.code}
            </span>
            {profile.badges.map((b, i) => (
              <span key={i} className="px-2.5 py-0.5 rounded-full bg-[var(--card-hover)] text-[var(--text-secondary)] text-[11px] font-bold border border-[var(--border-color)]">
                {b}
              </span>
            ))}
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
            {profile.name}
          </h2>
          <p className="text-sm sm:text-base font-bold text-[var(--accent-orange)] leading-relaxed">
            "{profile.tagline}"
          </p>
        </div>

        <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium leading-relaxed bg-[var(--bg-main)]/60 p-4 rounded-2xl border border-[var(--border-color)]/20">
          {profile.description}
        </p>

        {/* 4-Axis Spectrum Gauges */}
        <div className="space-y-4 pt-2">
          <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-1.5 font-mono">
            <Compass className="w-4 h-4 text-[var(--accent-orange)]" />
            4대 세부 성향 스펙트럼 (%)
          </h3>

          {/* 1. GS Spectrum */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold">
              <span className={scores.GS.G >= 50 ? 'text-[var(--accent-orange)]' : 'text-[var(--text-secondary)]'}>
                공격형 (Growth) {scores.GS.G}%
              </span>
              <span className={scores.GS.S > 50 ? 'text-[var(--accent-orange)]' : 'text-[var(--text-secondary)]'}>
                방어형 (Safety) {scores.GS.S}%
              </span>
            </div>
            <div className="w-full h-3 rounded-full bg-[var(--bg-main)] overflow-hidden flex p-0.5 border border-[var(--border-color)]/20">
              <div 
                className="h-full rounded-full bg-[var(--accent-orange)] transition-all duration-1000" 
                style={{ width: `${scores.GS.G}%` }} 
              />
              <div 
                className="h-full rounded-full bg-[var(--text-secondary)]/30 transition-all duration-1000" 
                style={{ width: `${scores.GS.S}%` }} 
              />
            </div>
          </div>

          {/* 2. AP Spectrum */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold">
              <span className={scores.AP.A >= 50 ? 'text-[var(--accent-orange)]' : 'text-[var(--text-secondary)]'}>
                분석형 (Active) {scores.AP.A}%
              </span>
              <span className={scores.AP.P > 50 ? 'text-[var(--accent-orange)]' : 'text-[var(--text-secondary)]'}>
                시스템형 (Passive) {scores.AP.P}%
              </span>
            </div>
            <div className="w-full h-3 rounded-full bg-[var(--bg-main)] overflow-hidden flex p-0.5 border border-[var(--border-color)]/20">
              <div 
                className="h-full rounded-full bg-[var(--accent-orange)] transition-all duration-1000" 
                style={{ width: `${scores.AP.A}%` }} 
              />
              <div 
                className="h-full rounded-full bg-[var(--text-secondary)]/30 transition-all duration-1000" 
                style={{ width: `${scores.AP.P}%` }} 
              />
            </div>
          </div>

          {/* 3. LT Spectrum */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold">
              <span className={scores.LT.L >= 50 ? 'text-[var(--accent-orange)]' : 'text-[var(--text-secondary)]'}>
                장기형 (Long-term) {scores.LT.L}%
              </span>
              <span className={scores.LT.T > 50 ? 'text-[var(--accent-orange)]' : 'text-[var(--text-secondary)]'}>
                추세형 (Tactical) {scores.LT.T}%
              </span>
            </div>
            <div className="w-full h-3 rounded-full bg-[var(--bg-main)] overflow-hidden flex p-0.5 border border-[var(--border-color)]/20">
              <div 
                className="h-full rounded-full bg-[var(--accent-orange)] transition-all duration-1000" 
                style={{ width: `${scores.LT.L}%` }} 
              />
              <div 
                className="h-full rounded-full bg-[var(--text-secondary)]/30 transition-all duration-1000" 
                style={{ width: `${scores.LT.T}%` }} 
              />
            </div>
          </div>

          {/* 4. RI Spectrum */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold">
              <span className={scores.RI.R >= 50 ? 'text-[var(--accent-orange)]' : 'text-[var(--text-secondary)]'}>
                원칙형 (Rule-based) {scores.RI.R}%
              </span>
              <span className={scores.RI.I > 50 ? 'text-[var(--accent-orange)]' : 'text-[var(--text-secondary)]'}>
                직감형 (Intuitive) {scores.RI.I}%
              </span>
            </div>
            <div className="w-full h-3 rounded-full bg-[var(--bg-main)] overflow-hidden flex p-0.5 border border-[var(--border-color)]/20">
              <div 
                className="h-full rounded-full bg-[var(--accent-orange)] transition-all duration-1000" 
                style={{ width: `${scores.RI.R}%` }} 
              />
              <div 
                className="h-full rounded-full bg-[var(--text-secondary)]/30 transition-all duration-1000" 
                style={{ width: `${scores.RI.I}%` }} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Customized Strategy & Assets Card */}
      <div className="glass-card p-6 rounded-3xl space-y-4">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-xl bg-[var(--accent-orange)]/15 text-[var(--accent-orange)]">
            <Award className="w-4 h-4" />
          </span>
          <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
            나에게 딱 맞는 추천 투자 방식
          </h3>
        </div>

        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-[var(--card-hover)] space-y-1">
            <span className="text-[11px] font-bold text-[var(--accent-orange)] font-mono">추천 매매 전략</span>
            <p className="text-xs sm:text-sm font-semibold text-[var(--text-primary)]">
              {profile.recommendedStrategy}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--card-hover)] space-y-2">
            <span className="text-[11px] font-bold text-[var(--accent-orange)] font-mono">적합한 자산 & ETF</span>
            <div className="flex flex-wrap gap-2">
              {profile.suitableAssets.map((asset, idx) => (
                <span key={idx} className="px-3 py-1 rounded-xl bg-[var(--bg-main)] text-xs font-bold text-[var(--text-primary)] border border-[var(--border-color)]/30">
                  {asset}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          onClick={handleShare}
          className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-[var(--accent-orange)] text-white font-bold text-sm shadow-xs hover:opacity-90 active:scale-[0.98] transition-all"
        >
          <Share2 className="w-4 h-4" />
          {copied ? '결과 링크 복사 완료!' : '내 성향 결과 공유하기'}
        </button>

        <button
          onClick={onRestart}
          className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl glass-card text-[var(--text-primary)] font-bold text-sm hover:bg-[var(--card-hover)] active:scale-[0.98] transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          다시 진단하기
        </button>
      </div>

      {/* Curriculum CTA */}
      <div className="glass-card p-5 rounded-2xl flex items-center justify-between gap-4">
        <div className="space-y-0.5">
          <h4 className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">
            내 성향에 맞는 쉬운 주식 강좌 보러가기
          </h4>
          <p className="text-[11px] text-[var(--text-secondary)]">
            초보자도 따라 할 수 있는 단계별 커리큘럼이 준비되어 있습니다.
          </p>
        </div>
        <Link
          href="/"
          className="shrink-0 px-3.5 py-2 rounded-xl bg-[var(--bg-main)] text-[var(--accent-orange)] font-bold text-xs hover:bg-[var(--card-hover)] flex items-center gap-1 transition-colors"
        >
          학습하기
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
