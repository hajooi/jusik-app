'use client';

import Link from 'next/link';
import { HelpCircle, Sparkles, Clock, LineChart, BookOpen, CandlestickChart, Receipt, CloudLightning } from 'lucide-react';
import RevealOnScroll from '@/components/common/RevealOnScroll';

export default function ToolsPage() {
  const tools = [
    {
      title: '주식 용어 퀴즈',
      description: '주식 시장 필수 기초 용어 퀴즈',
      href: '/tools/terms',
      icon: HelpCircle,
      isComingSoon: false,
    },
    {
      title: '투자 성향 진단',
      description: '나에게 딱 맞는 투자 스타일 찾기',
      href: '/tools/type',
      icon: Sparkles,
      isComingSoon: false,
    },
    {
      title: '투자 전략 시뮬레이터',
      description: '내가 만든 조합의 성적 미리보기',
      href: '/tools/simulate',
      icon: LineChart,
      isComingSoon: false,
    },
    {
      title: '마켓 인사이트',
      description: '오늘의 증시 현황과 주요 증시 일정',
      href: '/tools/market',
      icon: CloudLightning,
      isComingSoon: false,
    },
    {
      title: 'ETF 수수료 정리',
      description: 'ETF 실질 수수료 정리',
      href: '#',
      icon: Receipt,
      isComingSoon: true,
    },
    {
      title: '나의 투자일지',
      description: '계좌를 관리하는 투자 기록장',
      href: '#',
      icon: BookOpen,
      isComingSoon: true,
    },
    {
      title: '차트 패턴 트레이닝',
      description: '차트 패턴으로 익히는 실전 훈련',
      href: '#',
      icon: CandlestickChart,
      isComingSoon: true,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* De-boxed Clean Minimal Hero Banner */}
      <div className="py-2 px-1 space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
          투자도구
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium">
          투자를 쉽고 똑똑하게 시작하는 실전 도구 모음입니다.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tools.map((tool, idx) => {
          const Icon = tool.icon;

          if (tool.isComingSoon) {
            return (
              <RevealOnScroll key={idx} delayIndex={idx}>
                <div className="glass-card p-4 sm:p-5 rounded-2xl flex items-center justify-between opacity-75 cursor-not-allowed transition-all duration-300 shadow-2xs relative overflow-hidden h-full gap-3">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[var(--bg-main)] flex items-center justify-center text-[var(--text-secondary)] shrink-0 border border-[var(--border-color)]/60">
                      <Icon className="w-5 h-5 stroke-[1.8]" />
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <h3 className="text-sm sm:text-base font-bold tracking-tight text-[var(--text-primary)]">
                        {tool.title}
                      </h3>
                      <p className="text-xs text-[var(--text-secondary)] font-medium truncate">
                        {tool.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center text-xs font-semibold text-[var(--text-secondary)] font-mono gap-1 shrink-0 pl-2">
                    <Clock className="w-3.5 h-3.5 stroke-[1.7]" />
                    <span>오픈 준비 중</span>
                  </div>
                </div>
              </RevealOnScroll>
            );
          }

          return (
            <RevealOnScroll key={idx} delayIndex={idx}>
              <Link
                href={tool.href}
                className="glass-card glass-card-hover p-4 sm:p-5 rounded-2xl flex items-center justify-between transition-all duration-300 group shadow-2xs active:scale-[0.99] h-full gap-3"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[var(--bg-main)] flex items-center justify-center text-[var(--text-secondary)] group-hover:text-[var(--accent-orange)] group-hover:bg-[var(--accent-orange)]/15 group-hover:scale-105 transition-all duration-300 shrink-0 border border-[var(--border-color)]/60">
                    <Icon className="w-5 h-5 stroke-[1.8]" />
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-orange)] transition-colors">
                      {tool.title}
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] font-medium truncate">
                      {tool.description}
                    </p>
                  </div>
                </div>

                <span className="text-xs font-bold text-[var(--accent-orange)] group-hover:translate-x-1 transition-transform inline-flex items-center gap-1 shrink-0 pl-2">
                  알아보기 →
                </span>
              </Link>
            </RevealOnScroll>
          );
        })}
      </div>
    </div>
  );
}
