'use client';

import React from 'react';
import { PERSONALITY_PROFILES, PersonalityProfile } from '@/data/investmentSurvey';
import { X, Sparkles, Compass, Zap, Shield, HeartHandshake, Share2 } from 'lucide-react';

interface ResultCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser: {
    name: string;
    code: string;
    profile: PersonalityProfile;
    scores: {
      GS: { G: number; S: number };
      AP: { A: number; P: number };
      LT: { L: number; T: number };
      RI: { R: number; I: number };
    };
  };
  currentUser: {
    name: string;
    code: string;
    profile: PersonalityProfile;
    scores: {
      GS: { G: number; S: number };
      AP: { A: number; P: number };
      LT: { L: number; T: number };
      RI: { R: number; I: number };
    };
  };
}

export default function ResultCompareModal({
  isOpen,
  onClose,
  targetUser,
  currentUser,
}: ResultCompareModalProps) {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  // Calculate Chemistry Score (0~100) based on differences across 4 axes
  const diffGS = Math.abs(targetUser.scores.GS.G - currentUser.scores.GS.G);
  const diffAP = Math.abs(targetUser.scores.AP.A - currentUser.scores.AP.A);
  const diffLT = Math.abs(targetUser.scores.LT.L - currentUser.scores.LT.L);
  const diffRI = Math.abs(targetUser.scores.RI.R - currentUser.scores.RI.R);

  const avgDiff = (diffGS + diffAP + diffLT + diffRI) / 4;
  // Similarity score out of 100
  const similarityScore = Math.max(20, Math.min(100, Math.round(100 - avgDiff)));

  let chemistryTitle = '⚡ 극과 극! 상보적 보완 관계';
  let chemistryDesc =
    '서로 투자 시각과 방식이 크게 달라 의견 충돌이 생길 수 있지만, 서로의 단점을 가장 완벽하게 메워주는 콤비가 될 수 있어요!';

  if (similarityScore >= 80) {
    chemistryTitle = '🔥 찰떡궁합! 투자 환상의 짝꿍';
    chemistryDesc =
      '투자를 바라보는 목표, 실행 방식, 심리 기질까지 매우 닮아있어요! 함께 주식 스터디를 하거나 투자 아이디어를 공유하면 폭발적인 시너지가 납니다.';
  } else if (similarityScore >= 50) {
    chemistryTitle = '🤝 훌륭한 균형! 조화로운 조력자';
    chemistryDesc =
      '기본적인 방향성은 통하지만 개별 실행 및 심리 방식에서 유연한 차이가 있어요. 서로의 시각을 참고하며 균형 잡힌 포트폴리오를 구성하기에 좋습니다.';
  }

  const handleShareComparison = () => {
    const compareUrl = `${window.location.origin}/tools/type/${targetUser.code}?u=${encodeURIComponent(
      targetUser.name
    )}&g=${targetUser.scores.GS.G}&a=${targetUser.scores.AP.A}&l=${targetUser.scores.LT.L}&r=${
      targetUser.scores.RI.R
    }&compare=${currentUser.code}&cu=${encodeURIComponent(currentUser.name)}&cg=${
      currentUser.scores.GS.G
    }&ca=${currentUser.scores.AP.A}&cl=${currentUser.scores.LT.L}&cr=${currentUser.scores.RI.R}`;

    const text = `[${targetUser.name}]님(${targetUser.code})과 [${currentUser.name}]님(${currentUser.code})의 투자 궁합 점수는 ${similarityScore}점! 🦉\n성향 비교 리포트 보기 👇\n${compareUrl}`;

    if (navigator.share) {
      navigator.share({ text }).catch(() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      });
    } else {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="glass-card max-w-2xl w-full p-5 sm:p-7 rounded-3xl space-y-6 border border-[var(--accent-orange)]/40 shadow-2xl relative bg-[var(--bg-main)] my-8 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full glass-card hover:bg-[var(--card-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
          aria-label="닫기"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1">
          <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-[var(--accent-orange)]/15 text-[var(--accent-orange)] text-xs font-bold font-mono">
            <HeartHandshake className="w-3.5 h-3.5" />
            1:1 투자 성향 궁합 대조
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] tracking-tight">
            나와 상대방의 투자 케미 분석
          </h2>
        </div>

        {/* 1. VS Avatar Battle Card */}
        <div className="p-5 rounded-2xl bg-[var(--card-surface)] border border-[var(--border-color)] relative overflow-hidden space-y-4">
          <div className="flex items-center justify-around gap-2 text-center">
            {/* Target User */}
            <div className="space-y-2 flex-1 flex flex-col items-center">
              <div className="relative">
                <div className="absolute inset-0 bg-[var(--accent-orange)]/20 rounded-full blur-lg" />
                <img
                  src={`/types/${targetUser.code}.png`}
                  alt={targetUser.profile.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 object-contain relative z-10 animate-float-y filter drop-shadow-md"
                />
              </div>
              <div>
                <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-[var(--accent-orange)]/20 text-[var(--accent-orange)]">
                  {targetUser.name}
                </span>
                <h4 className="text-xs sm:text-sm font-black text-[var(--text-primary)] mt-1">
                  {targetUser.profile.name}
                </h4>
                <p className="text-[10px] font-mono text-[var(--text-secondary)]">
                  ({targetUser.code})
                </p>
              </div>
            </div>

            {/* VS Badge & Score */}
            <div className="shrink-0 space-y-1">
              <div className="w-12 h-12 rounded-full bg-[var(--accent-orange)] text-white font-black text-lg flex items-center justify-center shadow-[0_0_15px_rgba(241,143,1,0.5)] mx-auto font-mono">
                VS
              </div>
              <div className="text-center">
                <span className="text-xs font-bold text-[var(--text-secondary)]">궁합 점수</span>
                <div className="text-2xl font-black text-[var(--accent-orange)] font-mono">
                  {similarityScore}점
                </div>
              </div>
            </div>

            {/* Current User */}
            <div className="space-y-2 flex-1 flex flex-col items-center">
              <div className="relative">
                <div className="absolute inset-0 bg-[var(--accent-green)]/20 rounded-full blur-lg" />
                <img
                  src={`/types/${currentUser.code}.png`}
                  alt={currentUser.profile.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 object-contain relative z-10 animate-float-y filter drop-shadow-md"
                />
              </div>
              <div>
                <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-[var(--accent-green)]/20 text-[var(--accent-green)]">
                  {currentUser.name} (나)
                </span>
                <h4 className="text-xs sm:text-sm font-black text-[var(--text-primary)] mt-1">
                  {currentUser.profile.name}
                </h4>
                <p className="text-[10px] font-mono text-[var(--text-secondary)]">
                  ({currentUser.code})
                </p>
              </div>
            </div>
          </div>

          {/* Chemistry Banner */}
          <div className="p-3.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] space-y-1 text-center">
            <h4 className="text-xs sm:text-sm font-extrabold text-[var(--accent-orange)]">
              {chemistryTitle}
            </h4>
            <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed">
              {chemistryDesc}
            </p>
          </div>
        </div>

        {/* 2. 4-Axis Spectrum Dual Bar Chart */}
        <div className="space-y-3">
          <h3 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] flex items-center gap-1.5 font-mono">
            <Compass className="w-4 h-4 text-[var(--accent-orange)]" />
            4대 축 성향 스펙트럼 대조
          </h3>

          {[
            {
              title: '목표 축 (안전형 vs 수익형)',
              targetValG: targetUser.scores.GS.G,
              targetValS: targetUser.scores.GS.S,
              currentValG: currentUser.scores.GS.G,
              currentValS: currentUser.scores.GS.S,
              diffNote:
                Math.abs(targetUser.scores.GS.G - currentUser.scores.GS.G) > 30
                  ? '⚠️ 위험 감수 성향 차이 큼'
                  : '✅ 위험 성향 유사함',
            },
            {
              title: '실행 축 (수동형 vs 능동형)',
              targetValG: targetUser.scores.AP.A,
              targetValS: targetUser.scores.AP.P,
              currentValG: currentUser.scores.AP.A,
              currentValS: currentUser.scores.AP.P,
              diffNote:
                Math.abs(targetUser.scores.AP.A - currentUser.scores.AP.A) > 30
                  ? '⚠️ 주식 공부 및 개입 시간 차이 큼'
                  : '✅ 분석 및 실행 방식 유사함',
            },
            {
              title: '시간 축 (추세형 vs 장기형)',
              targetValG: targetUser.scores.LT.L,
              targetValS: targetUser.scores.LT.T,
              currentValG: currentUser.scores.LT.L,
              currentValS: currentUser.scores.LT.T,
              diffNote:
                Math.abs(targetUser.scores.LT.L - currentUser.scores.LT.L) > 30
                  ? '⚠️ 보유 기간 선호도 차이 큼'
                  : '✅ 투자 호흡 및 시계열 유사함',
            },
            {
              title: '심리 축 (직감형 vs 원칙형)',
              targetValG: targetUser.scores.RI.R,
              targetValS: targetUser.scores.RI.I,
              currentValG: currentUser.scores.RI.R,
              currentValS: currentUser.scores.RI.I,
              diffNote:
                Math.abs(targetUser.scores.RI.R - currentUser.scores.RI.R) > 30
                  ? '⚠️ 의사결정 판단 기준 차이 큼'
                  : '✅ 규칙 및 인사이트 활용도 유사함',
            },
          ].map((axis, i) => {
            const targetDominant = axis.targetValG >= 50 ? '우세' : '우세';
            const currentDominant = axis.currentValG >= 50 ? '우세' : '우세';

            return (
              <div
                key={i}
                className="p-3.5 rounded-2xl bg-[var(--card-surface)] border border-[var(--border-color)] space-y-2 text-xs"
              >
                <div className="flex items-center justify-between font-bold">
                  <span className="text-[var(--text-primary)]">{axis.title}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--bg-main)] text-[var(--accent-orange)] border border-[var(--border-color)]">
                    {axis.diffNote}
                  </span>
                </div>

                {/* Target Dual Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-[var(--accent-orange)] font-bold">
                      {targetUser.name}: {axis.targetValG >= 50 ? `우세 (수치: ${axis.targetValG}%)` : `안전 (수치: ${axis.targetValS}%)`}
                    </span>
                    <span className="text-[var(--text-secondary)] font-semibold">
                      {axis.targetValS}% vs {axis.targetValG}%
                    </span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-[var(--bg-main)] overflow-hidden flex border border-[var(--border-color)]">
                    <div
                      className="h-full bg-[var(--text-secondary)]/30 transition-all duration-500"
                      style={{ width: `${axis.targetValS}%` }}
                    />
                    <div
                      className="h-full bg-[var(--accent-orange)] transition-all duration-500"
                      style={{ width: `${axis.targetValG}%` }}
                    />
                  </div>
                </div>

                {/* Current Dual Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-[var(--accent-green)] font-bold">
                      {currentUser.name} (나): {axis.currentValG >= 50 ? `우세 (수치: ${axis.currentValG}%)` : `안전 (수치: ${axis.currentValS}%)`}
                    </span>
                    <span className="text-[var(--text-secondary)] font-semibold">
                      {axis.currentValS}% vs {axis.currentValG}%
                    </span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-[var(--bg-main)] overflow-hidden flex border border-[var(--border-color)]">
                    <div
                      className="h-full bg-[var(--text-secondary)]/30 transition-all duration-500"
                      style={{ width: `${axis.currentValS}%` }}
                    />
                    <div
                      className="h-full bg-[var(--accent-green)] transition-all duration-500"
                      style={{ width: `${axis.currentValG}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 3. AI Chemistry Insight Advice Box */}
        <div className="p-4 rounded-2xl bg-[var(--accent-orange)]/10 border border-[var(--accent-orange)]/30 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-black text-[var(--accent-orange)]">
            <Zap className="w-4 h-4" />
            <span>두 사람이 함께 투자할 때 시너지 가이드</span>
          </div>
          <ul className="text-xs text-[var(--text-primary)] font-medium space-y-1.5 leading-relaxed">
            {diffGS > 30 ? (
              <li>
                • <strong>위험 관리 방식:</strong> [{targetUser.name}]님은 공격적 수익을 지향하고, [
                {currentUser.name}]님은 안전을 중시해요. 함께 주식을 이야기할 때 포트폴리오 비중에 대해 융통성을 발휘해 보세요.
              </li>
            ) : (
              <li>
                • <strong>위험 관리 방식:</strong> 두 사람 모두 위험을 대하는 시각이 비슷하여 투자 아이디어를 낼 때 깊은 공감대가 형성됩니다.
              </li>
            )}

            {diffAP > 30 ? (
              <li>
                • <strong>정보 수집 방식:</strong> 한 명은 깊이 있는 분석을 좋아하고, 한 명은 편안한 수동 적립을 선호해요. 서로 기업 리포트를 정리해 주면 부족한 점이 잘 보완됩니다.
              </li>
            ) : (
              <li>
                • <strong>정보 수집 방식:</strong> 주식을 대하는 관심도와 일상 속 투자 비중이 비슷해 최고의 스터디 파트너가 될 수 있습니다.
              </li>
            )}
          </ul>
        </div>

        {/* Modal Action Footer */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={handleShareComparison}
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[var(--accent-orange)] text-white font-extrabold text-sm border border-[var(--accent-orange)] shadow-[0_0_15px_rgba(241,143,1,0.3)] hover:scale-[1.01] active:scale-[0.98] transition-all"
          >
            <Share2 className="w-4 h-4" />
            {copied ? '비교 결과 링크 복사 완료! 🎉' : '이 비교 결과 공유하기'}
          </button>
          <button
            onClick={onClose}
            className="px-5 py-3 rounded-2xl glass-card text-[var(--text-secondary)] font-bold text-sm border border-[var(--border-color)] hover:text-[var(--text-primary)] transition-all"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
