'use client';

import React from 'react';
import { PersonalityProfile, TYPE_EMOJIS } from '@/data/investmentSurvey';
import { Compass, Zap, Share2, Sparkles } from 'lucide-react';
import { attachJosa } from '@/utils/koreanJosa';

interface ResultCompareAccordionProps {
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
  onTakeTest?: () => void;
  hasMyResult?: boolean;
  onCompareWithMe?: () => void;
}

export default function ResultCompareAccordion({
  targetUser,
  currentUser,
  onTakeTest,
  hasMyResult,
  onCompareWithMe,
}: ResultCompareAccordionProps) {
  const [copied, setCopied] = React.useState(false);

  // Calculate Chemistry Score (0~100) based on differences across 4 axes
  const diffGS = Math.abs(targetUser.scores.GS.G - currentUser.scores.GS.G);
  const diffAP = Math.abs(targetUser.scores.AP.A - currentUser.scores.AP.A);
  const diffLT = Math.abs(targetUser.scores.LT.L - currentUser.scores.LT.L);
  const diffRI = Math.abs(targetUser.scores.RI.R - currentUser.scores.RI.R);

  const avgDiff = (diffGS + diffAP + diffLT + diffRI) / 4;
  const similarityScore = Math.max(20, Math.min(100, Math.round(100 - avgDiff)));

  let chemistryTitle = '⚡ 극과 극! 상보적 보완 관계';
  let chemistryDesc =
    '서로 투자 시각과 방식이 크게 달라 의견 충돌이 생길 수 있지만, 서로의 단점을 가장 완벽하게 메워주는 콤비가 될 수 있어요!';

  if (similarityScore >= 80) {
    chemistryTitle = '🔥 찰떡궁합! 투자 환상의 짝꿍';
    chemistryDesc =
      '투자 목표, 시간 감각, 원칙 등 대부분의 투자 성향이 놀랍도록 일치하여 서로의 판단을 깊이 공감할 수 있는 최고의 파트너입니다!';
  } else if (similarityScore >= 60) {
    chemistryTitle = '🤝 조화로운 시너지! 좋은 동반자';
    chemistryDesc =
      '비슷한 목표를 공유하면서도 세부적인 실행 방식에서 균형을 맞춰줄 수 있는 건강하고 생산적인 시너지 관계입니다.';
  } else if (similarityScore >= 50) {
    chemistryTitle = '🤝 훌륭한 균형! 조화로운 조력자';
    chemistryDesc =
      '기본적인 방향성은 통하지만 개별 실행 및 심리 방식에서 유연한 차이가 있어요. 서로의 시각을 참고하며 균형 잡힌 투자 전략을 구성하기에 좋습니다.';
  }

  // Left vs Right Determination
  const isTargetLeft = targetUser.name !== '공유한 친구' && targetUser.name !== '친구';
  const leftUser = isTargetLeft
    ? {
        name: targetUser.name,
        code: targetUser.code,
        profile: targetUser.profile,
        scores: targetUser.scores,
        badgeName: targetUser.name,
      }
    : {
        name: currentUser.name,
        code: currentUser.code,
        profile: currentUser.profile,
        scores: currentUser.scores,
        badgeName: currentUser.name,
      };

  const rightUser = isTargetLeft
    ? {
        name: currentUser.name,
        code: currentUser.code,
        profile: currentUser.profile,
        scores: currentUser.scores,
        badgeName: currentUser.name === '나' ? '나' : currentUser.name,
      }
    : {
        name: targetUser.name,
        code: targetUser.code,
        profile: targetUser.profile,
        scores: targetUser.scores,
        badgeName: '공유한 친구',
      };

  const headerTitle = `${leftUser.badgeName}님과 ${rightUser.badgeName}님의 투자 케미`;

  const handleShareComparison = () => {
    const cleanTargetName =
      targetUser.name && targetUser.name !== '나' && targetUser.name !== '공유한 친구' && targetUser.name !== '친구'
        ? targetUser.name
        : '';
    const cleanCurrentName =
      currentUser.name && currentUser.name !== '나' && currentUser.name !== '공유한 친구' && currentUser.name !== '친구'
        ? currentUser.name
        : '';

    const queryParams = new URLSearchParams();
    if (cleanTargetName) queryParams.set('u', cleanTargetName);
    queryParams.set('g', targetUser.scores.GS.G.toString());
    queryParams.set('a', targetUser.scores.AP.A.toString());
    queryParams.set('l', targetUser.scores.LT.L.toString());
    queryParams.set('r', targetUser.scores.RI.R.toString());

    if (cleanCurrentName) queryParams.set('myU', cleanCurrentName);
    queryParams.set('myCode', currentUser.code);
    queryParams.set('myG', currentUser.scores.GS.G.toString());
    queryParams.set('myA', currentUser.scores.AP.A.toString());
    queryParams.set('myL', currentUser.scores.LT.L.toString());
    queryParams.set('myR', currentUser.scores.RI.R.toString());

    const compareUrl = `${window.location.origin}/tools/type/${targetUser.code}?${queryParams.toString()}`;

    const text = `${attachJosa(
      leftUser.badgeName,
      '과/와'
    )} ${rightUser.badgeName}의 투자 성향 궁합은 ${similarityScore}점 🔥\n너와의 궁합도 진단해보자 👇\n\n${compareUrl}`;

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

  // 4 Axes logic based on Left User (leftUser) as 100% baseline!
  // 1. Goal Axis: GS (Growth vs Safety)
  const isLeftGrowth = leftUser.scores.GS.G >= 50;
  const leftGoalLabel = isLeftGrowth ? '수익형 (Growth)' : '안전형 (Safety)';
  const leftGoalVal = isLeftGrowth ? leftUser.scores.GS.G : leftUser.scores.GS.S;
  const rightGoalVal = isLeftGrowth ? rightUser.scores.GS.G : rightUser.scores.GS.S;

  // 2. Action Axis: AP (Active vs Passive)
  const isLeftActive = leftUser.scores.AP.A >= 50;
  const leftActionLabel = isLeftActive ? '능동형 (Active)' : '수동형 (Passive)';
  const leftActionVal = isLeftActive ? leftUser.scores.AP.A : leftUser.scores.AP.P;
  const rightActionVal = isLeftActive ? rightUser.scores.AP.A : rightUser.scores.AP.P;

  // 3. Time Axis: LT (Long-term vs Tactical)
  const isLeftLong = leftUser.scores.LT.L >= 50;
  const leftTimeLabel = isLeftLong ? '장기형 (Long-term)' : '추세형 (Tactical)';
  const leftTimeVal = isLeftLong ? leftUser.scores.LT.L : leftUser.scores.LT.T;
  const rightTimeVal = isLeftLong ? rightUser.scores.LT.L : rightUser.scores.LT.T;

  // 4. Psychology Axis: RI (Rule-based vs Intuitive)
  const isLeftRule = leftUser.scores.RI.R >= 50;
  const leftPsychLabel = isLeftRule ? '원칙형 (Rule-based)' : '직감형 (Intuitive)';
  const leftPsychVal = isLeftRule ? leftUser.scores.RI.R : leftUser.scores.RI.I;
  const rightPsychVal = isLeftRule ? rightUser.scores.RI.R : rightUser.scores.RI.I;

  const axesData = [
    {
      title: `${leftGoalLabel} 기준`,
      leftVal: leftGoalVal,
      rightVal: rightGoalVal,
      diffNote: Math.abs(diffGS) > 30 ? '⚠️ 투자 목표 편차 큼' : '✅ 목표 지향점 유사함',
    },
    {
      title: `${leftActionLabel} 기준`,
      leftVal: leftActionVal,
      rightVal: rightActionVal,
      diffNote: Math.abs(diffAP) > 30 ? '⚠️ 실행 스타일 차이 큼' : '✅ 매매 주기 유사함',
    },
    {
      title: `${leftTimeLabel} 기준`,
      leftVal: leftTimeVal,
      rightVal: rightTimeVal,
      diffNote: Math.abs(diffLT) > 30 ? '⚠️ 보유 기간 선호도 차이 큼' : '✅ 투자 호흡 유사함',
    },
    {
      title: `${leftPsychLabel} 기준`,
      leftVal: leftPsychVal,
      rightVal: rightPsychVal,
      diffNote: Math.abs(diffRI) > 30 ? '⚠️ 판단 기준 차이 큼' : '✅ 의사결정 방식 유사함',
    },
  ];

  return (
    <div className="glass-card p-5 sm:p-7 rounded-3xl space-y-6 border border-[var(--accent-orange)] shadow-[0_0_25px_rgba(241,143,1,0.18)] bg-[var(--card-surface)] transition-all duration-300">
      {/* Header */}
      <div className="text-center space-y-1">
        <h3 className="text-lg sm:text-xl font-black text-[var(--text-primary)] tracking-tight">
          {headerTitle}
        </h3>
      </div>

      {/* 1. VS Avatar Battle Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-main)]/60 border border-[var(--border-color)] relative overflow-hidden space-y-4">
        <div className="flex items-center justify-around gap-2 text-center">
          {/* Left User */}
          <div className="space-y-2 flex-1 flex flex-col items-center">
            <div className="relative py-1">
              <div className="absolute inset-0 bg-[var(--accent-green)]/25 rounded-full blur-xl" />
              <span className="text-5xl sm:text-6xl select-none relative z-10 animate-float-y filter drop-shadow-md inline-block">
                {TYPE_EMOJIS[leftUser.code] || '🦉'}
              </span>
            </div>
            <div>
              <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-[var(--accent-green)]/20 text-[var(--accent-green)] font-mono">
                {leftUser.badgeName}
              </span>
              <h4 className="text-xs sm:text-sm font-black text-[var(--text-primary)] mt-1">
                {leftUser.profile.name}
              </h4>
              <p className="text-[10px] font-mono text-[var(--text-secondary)]">
                ({leftUser.code})
              </p>
            </div>
          </div>

          {/* Center: VS Badge & Score */}
          <div className="shrink-0 space-y-1">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[var(--accent-orange)] text-white font-black text-base sm:text-lg flex items-center justify-center shadow-[0_0_15px_rgba(241,143,1,0.5)] mx-auto font-mono">
              VS
            </div>
            <div className="text-center">
              <span className="text-[11px] font-bold text-[var(--text-secondary)]">성향 궁합</span>
              <div className="text-xl sm:text-2xl font-black text-[var(--accent-orange)] font-mono">
                {similarityScore}점
              </div>
            </div>
          </div>

          {/* Right User */}
          <div className="space-y-2 flex-1 flex flex-col items-center">
            <div className="relative py-1">
              <div className="absolute inset-0 bg-[var(--accent-orange)]/25 rounded-full blur-xl" />
              <span className="text-5xl sm:text-6xl select-none relative z-10 animate-float-y filter drop-shadow-md inline-block">
                {TYPE_EMOJIS[rightUser.code] || '🦉'}
              </span>
            </div>
            <div>
              <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-[var(--accent-orange)]/20 text-[var(--accent-orange)] font-mono">
                {rightUser.badgeName}
              </span>
              <h4 className="text-xs sm:text-sm font-black text-[var(--text-primary)] mt-1">
                {rightUser.profile.name}
              </h4>
              <p className="text-[10px] font-mono text-[var(--text-secondary)]">
                ({rightUser.code})
              </p>
            </div>
          </div>
        </div>

        {/* Chemistry Banner */}
        <div className="p-3.5 rounded-xl bg-[var(--card-hover)] border border-[var(--border-color)] space-y-1 text-center">
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
          성향 스펙트럼 비교
        </h3>

        {axesData.map((axis, i) => (
          <div
            key={i}
            className="p-3.5 rounded-2xl bg-[var(--bg-main)]/50 border border-[var(--border-color)] space-y-2.5 text-xs"
          >
            <div className="flex items-center justify-between font-bold">
              <span className="text-[var(--text-primary)]">{axis.title}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--card-hover)] text-[var(--accent-orange)] border border-[var(--border-color)]">
                {axis.diffNote}
              </span>
            </div>

            {/* Left User Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-[var(--accent-green)] font-extrabold">
                  {leftUser.badgeName}: {axis.leftVal}%
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-[var(--bg-main)] overflow-hidden flex border border-[var(--border-color)]">
                <div
                  className="h-full bg-[var(--accent-green)] transition-all duration-500 shadow-[0_0_8px_rgba(104,166,125,0.4)]"
                  style={{ width: `${axis.leftVal}%` }}
                />
                <div
                  className="h-full bg-[var(--text-secondary)]/15 transition-all duration-500"
                  style={{ width: `${100 - axis.leftVal}%` }}
                />
              </div>
            </div>

            {/* Right User Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-[var(--accent-orange)] font-extrabold">
                  {rightUser.badgeName}: {axis.rightVal}%
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-[var(--bg-main)] overflow-hidden flex border border-[var(--border-color)]">
                <div
                  className="h-full bg-[var(--accent-orange)] transition-all duration-500 shadow-[0_0_8px_rgba(241,143,1,0.4)]"
                  style={{ width: `${axis.rightVal}%` }}
                />
                <div
                  className="h-full bg-[var(--text-secondary)]/15 transition-all duration-500"
                  style={{ width: `${100 - axis.rightVal}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Deep 4-Axis Synergy & Communication Guide */}
      <div className="space-y-3">
        <h3 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] flex items-center gap-1.5 font-mono">
          <Zap className="w-4 h-4 text-[var(--accent-orange)]" />
          심층 분석 & 궁합 가이드
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Synergy Card */}
          <div className="p-4 rounded-2xl bg-[var(--bg-main)]/60 border border-[var(--border-color)] space-y-2.5 shadow-2xs">
            <div className="flex items-center gap-1.5 text-xs font-black text-[var(--accent-green)]">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>함께 나눌 때 시너지 포인트</span>
            </div>
            <ul className="text-xs text-[var(--text-secondary)] space-y-2 leading-relaxed">
              {diffGS > 30 ? (
                <li>
                  • <strong>위험 & 자산 배분:</strong> 한 사람은 공격적인 성장 기회를 찾고, 한 사람은 안정적인 방어선을 지켜줍니다. 서로의 관점을 합치면 극단으로 치우치지 않는 황금비율 포트폴리오를 설계할 수 있어요.
                </li>
              ) : (
                <li>
                  • <strong>위험 감수 태도:</strong> 추구하는 수익률과 감내할 수 있는 손실 범위가 비슷하여, 관심 종목이나 투자 비중을 논의할 때 깊은 공감대가 형성됩니다.
                </li>
              )}
              {diffLT > 30 ? (
                <li>
                  • <strong>투자 시야의 조화:</strong> 장기 복리의 큰 그림과 시장 단기 흐름의 유연한 대응을 서로 보완해 줄 수 있어 시장 급변기에도 침착함을 유지하기 좋습니다.
                </li>
              ) : (
                <li>
                  • <strong>투자 호흡 일치:</strong> 주식을 보유하고 매매하는 호흡이 비슷해 시장을 바라보는 시간 단위가 잘 맞습니다.
                </li>
              )}
            </ul>
          </div>

          {/* Caution Card */}
          <div className="p-4 rounded-2xl bg-[var(--bg-main)]/60 border border-[var(--border-color)] space-y-2.5 shadow-2xs">
            <div className="flex items-center gap-1.5 text-xs font-black text-[var(--accent-orange)]">
              <Zap className="w-4 h-4 shrink-0" />
              <span>서로 배려해야 할 핵심 포인트</span>
            </div>
            <ul className="text-xs text-[var(--text-secondary)] space-y-2 leading-relaxed">
              {diffAP > 30 ? (
                <li>
                  • <strong>정보 탐색 방식:</strong> 직접 발굴 및 분석을 즐기는 스타일과 ETF나 기본 흐름을 편안하게 추종하는 스타일의 차이를 존중해 주세요. 자신의 투자 공부 방식을 무리하게 권유하지 않는 것이 좋습니다.
                </li>
              ) : (
                <li>
                  • <strong>정보 교류:</strong> 시장 뉴스와 종목 정보를 소화하는 방식이 비슷해 유익한 인사이트를 나누기에 최적입니다.
                </li>
              )}
              {diffRI > 30 ? (
                <li>
                  • <strong>의사결정 기준:</strong> 한 사람은 명확한 수치와 원칙에 따르고, 한 사람은 직관과 산업 트렌드를 중요시합니다. 판단 기준이 다를 수 있음을 인정하고 결정을 존중해 주세요.
                </li>
              ) : (
                <li>
                  • <strong>판단 멘탈:</strong> 매매 타이밍과 원칙을 정할 때 서로의 판단 논리를 쉽게 이해하고 격려해 줄 수 있습니다.
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-1">
        {hasMyResult && onCompareWithMe ? (
          <button
            onClick={onCompareWithMe}
            className="inline-flex items-center justify-center gap-2 w-full px-5 py-3.5 rounded-2xl bg-[var(--accent-orange)] text-white font-extrabold text-sm border border-[var(--accent-orange)] shadow-[0_0_18px_rgba(241,143,1,0.35)] hover:shadow-[0_0_25px_rgba(241,143,1,0.5)] hover:scale-[1.01] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            나와 {leftUser.badgeName}의 투자 성향 비교하기 ➔
          </button>
        ) : onTakeTest ? (
          <button
            onClick={onTakeTest}
            className="inline-flex items-center justify-center gap-2 w-full px-5 py-3.5 rounded-2xl bg-[var(--accent-orange)] text-white font-extrabold text-sm border border-[var(--accent-orange)] shadow-[0_0_18px_rgba(241,143,1,0.35)] hover:shadow-[0_0_25px_rgba(241,143,1,0.5)] hover:scale-[1.01] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            나도 3분 만에 내 투자 성향 진단하기 ➔
          </button>
        ) : (
          <button
            onClick={handleShareComparison}
            className="inline-flex items-center justify-center gap-2 w-full px-5 py-3.5 rounded-2xl bg-[var(--accent-orange)] text-white font-extrabold text-sm border border-[var(--accent-orange)] shadow-[0_0_18px_rgba(241,143,1,0.35)] hover:shadow-[0_0_25px_rgba(241,143,1,0.5)] hover:scale-[1.01] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            {copied ? '비교 결과 링크 복사 완료! 🎉' : '이 비교 결과 공유하기'}
          </button>
        )}
      </div>
    </div>
  );
}
