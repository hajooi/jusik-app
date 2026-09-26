'use client';

import React from 'react';
import { Compass, Zap, ShieldCheck } from 'lucide-react';

interface EtfCardData {
  id: string;
  name: string;
  roleBadge: string;
  roleType: 'core' | 'growth' | 'defense';
  subtitle: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const ETF_CARDS: EtfCardData[] = [
  {
    id: 'sp500',
    name: 'S&P 500',
    roleBadge: '중심축 · 기본',
    roleType: 'core',
    subtitle: '미국 경제의 든든한 표준',
    description:
      '미국을 대표하는 500개 우량 기업을 통째로 담아, 미국 전체의 경제 성장률을 안정적으로 따라가는 가장 든든한 주춧돌입니다.',
    icon: Compass,
  },
  {
    id: 'nasdaq100',
    name: '나스닥 100',
    roleBadge: '성장 엔진 · 공격',
    roleType: 'growth',
    subtitle: '혁신 기술주의 고속 성장',
    description:
      '애플, 마이크로소프트, 엔비디아 등 혁신 빅테크 기업에 집중 투자하여, 시장 평균을 훌쩍 뛰어넘는 강력한 초과 수익을 추구합니다.',
    icon: Zap,
  },
  {
    id: 'schd',
    name: '미국배당다우존스',
    roleBadge: '든든한 방패 · 수비',
    roleType: 'defense',
    subtitle: '하락장 방어와 배당 현금',
    description:
      '10년 이상 배당금을 꾸준히 늘려온 재무 건전성 우량 기업들로 구성되어, 시장이 흔들릴 때도 든든한 현금 흐름을 제공하며 계좌를 지켜줍니다.',
    icon: ShieldCheck,
  },
];

export default function RepresentativeEtfCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4 my-3">
      {ETF_CARDS.map((card) => {
        const IconComponent = card.icon;

        // Visual Accents depending on role
        const badgeClasses =
          card.roleType === 'core'
            ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
            : card.roleType === 'growth'
            ? 'bg-orange-500/15 text-[var(--accent-orange)] border-orange-500/30'
            : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';

        const iconBgClasses =
          card.roleType === 'core'
            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25'
            : card.roleType === 'growth'
            ? 'bg-orange-500/10 text-[var(--accent-orange)] border-orange-500/25'
            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25';

        return (
          <div
            key={card.id}
            className="relative flex flex-col justify-start p-4 sm:p-5 rounded-2xl glass-card border border-[var(--border-color)]/90 shadow-2xs"
          >
            {/* Top Row: Icon & Role Badge */}
            <div className="flex items-center justify-between gap-2 mb-3">
              <div
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl border flex items-center justify-center shrink-0 ${iconBgClasses}`}
              >
                <IconComponent className="w-5 h-5 stroke-[2]" />
              </div>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border font-mono tracking-tight ${badgeClasses}`}
              >
                {card.roleBadge}
              </span>
            </div>

            {/* Title & Subtitle */}
            <div className="space-y-0.5 mb-2.5">
              <h3 className="text-base sm:text-lg font-black text-[var(--text-primary)] tracking-tight">
                {card.name}
              </h3>
              <p className="text-xs font-bold text-[var(--accent-orange)]">
                {card.subtitle}
              </p>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-[13px] text-[var(--text-secondary)] font-medium leading-relaxed">
              {card.description}
            </p>
          </div>
        );
      })}
    </div>
  );
}
