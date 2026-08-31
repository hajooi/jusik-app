'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { PersonalityProfile, TYPE_EMOJIS } from '@/data/investmentSurvey';
import { getPersonalityDynamicPreviewStats } from '@/utils/personalitySimulatorMapping';
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
    <div className="space-y-2.5 p-3.5 sm:p-4 rounded-2xl bg-[var(--bg-main)]/50 border border-[var(--border-color)] transition-all duration-200">
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

interface AnimatedPortfolioCardProps {
  profile: PersonalityProfile;
  scores: {
    GS: { G: number; S: number };
    AP: { A: number; P: number };
    LT: { L: number; T: number };
    RI: { R: number; I: number };
  };
}

interface AnimatedPortfolioCardProps {
  profile: PersonalityProfile;
  scores: {
    GS: { G: number; S: number };
    AP: { A: number; P: number };
    LT: { L: number; T: number };
    RI: { R: number; I: number };
  };
}

// 애플 표준 물리 감속 커브 (Apple Spring/Quintic Ease-Out)
// t => 1 - Math.pow(1 - t, 5)
function useAppleAnimatedNumber(targetValue: number, duration: number = 1000): number {
  const [currentValue, setCurrentValue] = useState(targetValue);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const initialValue = currentValue;
    const diff = targetValue - initialValue;

    if (diff === 0) return;

    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Apple Quintic Ease-Out (극도로 매끄러운 감속)
      const ease = 1 - Math.pow(1 - progress, 5);
      setCurrentValue(Math.round(initialValue + diff * ease));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      }
    };

    animationFrameId = requestAnimationFrame(step);

    return () => cancelAnimationFrame(animationFrameId);
  }, [targetValue, duration]);

  return currentValue;
}

function AnimatedAssetBadge({
  name,
  targetWeight,
  color,
}: {
  name: string;
  targetWeight: number;
  color: string;
}) {
  const displayWeight = useAppleAnimatedNumber(targetWeight, 1100);

  return (
    <div
      className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition-all duration-700 ${
        displayWeight === 0
          ? 'bg-[var(--bg-main)]/30 border-[var(--border-color)]/40 opacity-40'
          : 'bg-[var(--bg-main)]/80 border-[var(--border-color)] shadow-2xs'
      }`}
    >
      <div className="flex items-center gap-1.5 min-w-0">
        <span
          className="w-2.5 h-2.5 rounded-full shrink-0 transition-transform duration-500"
          style={{ backgroundColor: color }}
        />
        <span className="font-extrabold text-[var(--text-primary)] truncate">{name}</span>
      </div>
      <span
        className="font-mono font-extrabold text-xs ml-1 shrink-0 transition-colors duration-500"
        style={{
          color: displayWeight > 0 ? color : 'var(--text-secondary)',
        }}
      >
        {displayWeight}%
      </span>
    </div>
  );
}

function AnimatedPortfolioCard({ profile, scores }: AnimatedPortfolioCardProps) {
  const preview = profile.recommendedPortfolioPreview;
  if (!preview) return null;

  const cardRef = React.useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  // 시뮬레이션 상태 인덱스 (0: 전 종목 보유, 1: 1번 종목 현금화, 2: 2번 종목 현금화 등 순차적 시장 시나리오)
  const [scenarioStep, setScenarioStep] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold: 0.15 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // 추세 방어가 켜진(enableDefense !== false) 자산들의 목록 추출
  const dynamicDefenseIndices = preview.allocation
    .map((item, idx) => ((item as any).enableDefense !== false ? idx : -1))
    .filter((idx) => idx !== -1);

  // 3.2초 주기: 추세 방어가 켜진 자산들에 대해서만 순차적으로 현금 전환 시뮬레이션
  useEffect(() => {
    if (!preview.isDynamicTrend || !isInView || dynamicDefenseIndices.length === 0) return;

    const interval = setInterval(() => {
      setScenarioStep((prev) => (prev + 1) % (dynamicDefenseIndices.length * 2));
    }, 3200);

    return () => clearInterval(interval);
  }, [preview.isDynamicTrend, isInView, dynamicDefenseIndices.length]);

  // 각 자산의 목표 비중 계산 (인뷰 전에는 모두 0%에서 시작하여 스르륵 채워짐)
  let cashTargetWeight = 0;
  const baseItems = preview.allocation.map((item, idx) => {
    let isHolding = true;
    const canDefend = (item as any).enableDefense !== false;

    if (preview.isDynamicTrend && canDefend && dynamicDefenseIndices.length > 0) {
      // 짝수 스텝: 전체 보유 / 홀수 스텝: 특정 추세 자산만 현금 전환
      const activeDefenseIndex = dynamicDefenseIndices[Math.floor(scenarioStep / 2) % dynamicDefenseIndices.length];
      if (scenarioStep % 2 === 1 && idx === activeDefenseIndex) {
        isHolding = false;
      }
    }

    const targetWeight = isInView ? (isHolding ? item.weight : 0) : 0;
    if (!isHolding && isInView) {
      cashTargetWeight += item.weight;
    }

    return {
      id: `asset-${idx}`,
      name: item.name,
      targetWeight,
      color: item.color,
    };
  });

  const allSlots = [...baseItems];
  if (preview.isDynamicTrend) {
    allSlots.push({
      id: 'asset-cash',
      name: '현금',
      targetWeight: isInView ? cashTargetWeight : 0,
      color: '#06B6D4',
    });
  }

  // 시뮬레이터 백테스트 엔진 기반 실시간 동적 목표치 연동
  const dynamicStats = useMemo(() => {
    return getPersonalityDynamicPreviewStats(profile.code, scores);
  }, [profile.code, scores]);

  return (
    <div
      ref={cardRef}
      className="glass-card p-6 sm:p-8 rounded-3xl space-y-5 shadow-2xs border border-[var(--border-color)] relative overflow-hidden transition-all duration-300"
    >
      {/* Header & Target Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[var(--accent-orange)] shrink-0" />
            <span className="text-[11px] font-extrabold text-[var(--accent-orange)] uppercase tracking-wider">
              맞춤 전략
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-[var(--text-primary)] tracking-tight">
            {preview.title}
          </h3>
        </div>

        {/* Target CAGR & Target MDD with Smooth Count-in */}
        <div className="flex items-center gap-3 bg-[var(--bg-main)]/80 px-4 py-2.5 rounded-2xl border border-[var(--border-color)] text-xs font-bold shrink-0 shadow-2xs">
          <div className="text-left">
            <span className="text-[10px] text-[var(--text-secondary)] block font-medium">목표 연수익률</span>
            <span
              className={`text-[var(--accent-green)] font-black font-mono text-sm transition-all duration-700 ${
                isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
              }`}
            >
              {isInView ? (dynamicStats.targetCAGR || preview.targetCAGR) : '0%'}
            </span>
          </div>
          <div className="w-[1px] h-6 bg-[var(--border-color)]" />
          <div className="text-left">
            <span className="text-[10px] text-[var(--text-secondary)] block font-medium">목표 하락폭</span>
            <span
              className={`text-[var(--accent-orange)] font-black font-mono text-sm transition-all duration-700 ${
                isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
              }`}
            >
              {isInView ? `${dynamicStats.targetMDD || preview.targetMDD} 이내` : '0%'}
            </span>
          </div>
        </div>
      </div>

      {/* Apple Physics Smooth Multi-Segment Bar */}
      <div className="space-y-2.5 pt-1">
        <div className="flex items-center justify-between text-xs font-bold text-[var(--text-secondary)]">
          <span>추천 자산 배분 비중</span>
        </div>

        {/* Container with rounded-full & seamless subpixel flex bar */}
        <div className="w-full h-4 rounded-full overflow-hidden flex bg-[var(--bg-main)] p-0.5 border border-[var(--border-color)] shadow-inner">
          <div className="w-full h-full rounded-full overflow-hidden flex">
            {allSlots.map((slot) => (
              <div
                key={slot.id}
                className="h-full"
                style={{
                  width: `${slot.targetWeight}%`,
                  backgroundColor: slot.color,
                  // Apple Quintic Fluid Easing (0.16, 1, 0.3, 1) - 1.1s 완벽한 감속
                  transition: 'width 1.1s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
                title={`${slot.name}: ${slot.targetWeight}%`}
              />
            ))}
          </div>
        </div>

        {/* Clean Asset Badges with Synchronized Apple Ease-out Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pt-1">
          {allSlots.map((slot) => (
            <AnimatedAssetBadge
              key={slot.id}
              name={slot.name}
              targetWeight={slot.targetWeight}
              color={slot.color}
            />
          ))}
        </div>
      </div>

      {/* Why This Portfolio? */}
      <div className="space-y-2 bg-[var(--bg-main)]/50 p-4 sm:p-5 rounded-2xl border border-[var(--border-color)]">
        <h4 className="text-xs font-black text-[var(--text-primary)] flex items-center gap-1.5">
          <span>💡 왜 이 비율을 추천할까요?</span>
        </h4>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium leading-relaxed">
          {preview.rationale}
        </p>
      </div>

      {/* Direct Interactive CTA Button to Simulator */}
      <Link
        href={`/tools/simulate?type=${profile.code}&g=${scores.GS.G}&a=${scores.AP.A}&l=${scores.LT.L}&r=${scores.RI.R}`}
        className="w-full inline-flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl bg-[var(--accent-orange)] text-white font-extrabold text-sm sm:text-base border border-[var(--accent-orange)] hover:brightness-105 hover:shadow-[0_0_24px_rgba(241,143,1,0.35)] active:scale-[0.99] transition-all cursor-pointer shadow-sm group"
      >
        <Sparkles className="w-4 h-4 text-white shrink-0 group-hover:rotate-12 transition-transform duration-300" />
        <span>추천 비율로 백테스트 결과 보기</span>
        <span className="font-mono text-white/90 group-hover:translate-x-1 transition-transform duration-200">➔</span>
      </Link>
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
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Title (Left-aligned brand standard, static without animation) */}
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
      <RevealOnScroll delayIndex={1}>
        <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-6 shadow-2xs border border-[var(--border-color)] relative overflow-hidden transition-all duration-300">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[var(--accent-orange)]/15 rounded-full blur-3xl pointer-events-none" />

          {/* Floating Large Emoji Avatar & Title Section */}
          <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-7 text-center sm:text-left">
            <div className="relative shrink-0 group py-2 flex items-center justify-center">
              <div className="absolute inset-0 bg-[var(--accent-orange)]/25 rounded-full blur-3xl pointer-events-none" />
              <div className="w-28 h-28 sm:w-36 sm:h-36 flex items-center justify-center relative z-10 animate-float-y group-hover:scale-110 transition-transform duration-300">
                <span className="text-7xl sm:text-8xl select-none filter drop-shadow-[0_12px_24px_rgba(241,143,1,0.22)] leading-none">
                  {TYPE_EMOJIS[profile.code] || '🦉'}
                </span>
              </div>
            </div>

            <div className="space-y-3 flex-1">
              <div className="space-y-2">
                <div className="min-h-[26px] flex items-center justify-center sm:justify-start">
                  {percentage !== undefined && percentage > 0 ? (
                    <div className="animate-in fade-in duration-300">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[var(--accent-orange)] text-white text-[11px] font-extrabold shadow-sm border border-[var(--accent-orange)]">
                        🔥 전체 참여자 중 <span className="font-mono text-xs underline underline-offset-2">{percentage}%</span>가 이 유형이에요!
                      </span>
                    </div>
                  ) : (
                    <div className="animate-in fade-in duration-300">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[var(--accent-orange)] text-white text-[11px] font-extrabold shadow-sm border border-[var(--accent-orange)]">
                        🔥 전체 참여자 중 <span className="font-mono text-xs underline underline-offset-2">6.3%</span>가 이 유형이에요!
                      </span>
                    </div>
                  )}
                </div>
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

          {/* 4-Axis Spectrum Gauges */}
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
      </RevealOnScroll>

      {/* Unified Deep Narrative & Mindset Card */}
      {profile.storyNarrative && (
        <RevealOnScroll delayIndex={2}>
          <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-5 shadow-2xs border border-[var(--border-color)] transition-all duration-300">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent-orange)] shadow-[0_0_8px_rgba(241,143,1,0.6)]" />
              <h3 className="text-sm sm:text-base font-extrabold text-[var(--text-primary)] tracking-tight">
                투자를 대하는 {profile.name}의 내면과 시선
              </h3>
            </div>
            
            <div className="space-y-3.5 text-xs sm:text-sm leading-relaxed">
              <div className="bg-[var(--bg-main)]/50 p-4 sm:p-6 rounded-2xl border border-[var(--border-color)] font-medium text-[var(--text-primary)] leading-relaxed">
                <p className="whitespace-pre-line">{profile.storyNarrative.overview}</p>
              </div>

              {profile.storyNarrative.marketCaution && (
                <div className="bg-[var(--accent-orange)]/5 p-4 sm:p-5 rounded-2xl border border-[var(--accent-orange)]/25 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-black text-[var(--accent-orange)]">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>시장이 흔들릴 때 주의할 점</span>
                  </div>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium leading-relaxed">
                    {profile.storyNarrative.marketCaution}
                  </p>
                </div>
              )}
            </div>
          </div>
        </RevealOnScroll>
      )}

      {/* Strengths & Weaknesses Cards */}
      {(profile.strengths || profile.weaknesses) && (
        <RevealOnScroll delayIndex={3}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {profile.strengths && (
              <div className="glass-card p-5 sm:p-6 rounded-3xl space-y-3.5 border border-[var(--border-color)] shadow-2xs">
                <div className="flex items-center gap-2">
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

            {profile.weaknesses && (
              <div className="glass-card p-5 sm:p-6 rounded-3xl space-y-3.5 border border-[var(--border-color)] shadow-2xs">
                <div className="flex items-center gap-2">
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
        </RevealOnScroll>
      )}

      {/* Tailored Investment Guidelines Card */}
      {profile.guidelines && (
        <RevealOnScroll delayIndex={3}>
          <div className="glass-card p-5 sm:p-7 rounded-3xl space-y-4 shadow-2xs border border-[var(--border-color)] transition-all duration-300">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[var(--accent-orange)]" />
              <h3 className="text-sm sm:text-base font-extrabold text-[var(--text-primary)] tracking-tight">
                감정을 이기는 원칙 & 추천 가이드
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-0.5">
              <div className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-main)]/50 border border-[var(--border-color)] space-y-1.5 transition-all duration-200">
                <div className="flex items-center gap-1.5 text-xs font-black text-[var(--accent-green)]">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>원칙 지침</span>
                </div>
                <p className="text-xs sm:text-sm text-[var(--text-primary)] font-bold leading-relaxed">
                  {profile.guidelines.recommendation}
                </p>
              </div>

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
        </RevealOnScroll>
      )}

      {/* Tailored Portfolio Preview & Direct Simulator CTA */}
      {profile.recommendedPortfolioPreview && (
        <RevealOnScroll delayIndex={4}>
          <AnimatedPortfolioCard profile={profile} scores={scores} />
        </RevealOnScroll>
      )}

      {/* Action Buttons: 친구에게 공유하기 & 다시 진단하기 */}
      {!isReadOnly && (
        <RevealOnScroll delayIndex={5}>
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 pt-2">
            <button
              onClick={handleShare}
              className="flex-1 min-w-[200px] inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl glass-card glass-card-hover text-[var(--text-primary)] font-bold text-xs sm:text-sm border border-[var(--border-color)] hover:border-[var(--accent-orange)]/40 hover:shadow-[0_0_15px_rgba(241,143,1,0.15)] active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
            >
              <Share2 className="w-4 h-4 text-[var(--accent-orange)] shrink-0" />
              <span>{copied ? '궁합 링크 복사 완료!' : '친구에게 공유하고 투자 궁합 확인'}</span>
            </button>

            <button
              onClick={onRestart}
              className="sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl glass-card glass-card-hover text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-bold text-xs sm:text-sm border border-[var(--border-color)] hover:border-[var(--accent-orange)]/40 hover:shadow-[0_0_15px_rgba(241,143,1,0.15)] active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
            >
              <RefreshCw className="w-4 h-4 text-[var(--text-secondary)] shrink-0" />
              <span>다시 진단하기</span>
            </button>
          </div>
        </RevealOnScroll>
      )}
    </div>
  );
}