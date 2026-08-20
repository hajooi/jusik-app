'use client';

import Link from 'next/link';
import { HelpCircle, Sparkles, Clock, LineChart, BookOpen, CandlestickChart, Receipt } from 'lucide-react';
import RevealOnScroll from '@/components/common/RevealOnScroll';

export default function ToolsPage() {
  const tools = [
    {
      title: '주식 용어 퀴즈',
      description: '주식 시장 필수 기초 용어! 퀴즈로 쉽고 재미있게 내 진짜 실력 점검하기',
      href: '/tools/terms',
      icon: HelpCircle,
      tag: '15문항 랭킹전',
      isComingSoon: false,
    },
    {
      title: '투자 성향 진단',
      description: '손실이 걱정되는 사람부터 큰 기회를 찾는 사람까지! 나에게 딱 맞는 투자 스타일 찾기',
      href: '/tools/type',
      icon: Sparkles,
      tag: '40문항 진단',
      isComingSoon: false,
    },
    {
      title: '투자 전략 시뮬레이터',
      description: '이렇게 투자하면 미래에 얼마가 모일까? 내가 만든 조합의 성적 미리보기',
      href: '/tools/simulate',
      icon: LineChart,
      tag: '수익률 시뮬레이션',
      isComingSoon: false,
    },
    {
      title: 'ETF 수수료 정리',
      description: '표시된 보수 말고 진짜 떼어가는 수수료는 얼마일까? 매달 달라지는 ETF 실질 수수료 정리',
      href: '#',
      icon: Receipt,
      tag: '실질 수수료',
      isComingSoon: true,
    },
    {
      title: '나의 투자일지',
      description: '내가 만든 자산 배분 조합을 저장하고, 주기적으로 계좌를 관리하는 투자 기록장',
      href: '#',
      icon: BookOpen,
      tag: '투자 기록',
      isComingSoon: true,
    },
    {
      title: '차트 패턴 트레이닝',
      description: '다음 차트는 상승할까, 하락할까? 핵심 차트 패턴으로 익히는 실전 감각 훈련',
      href: '#',
      icon: CandlestickChart,
      tag: '실전 훈련',
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
          성공적인 투자를 시작할 수 있도록 돕는 맞춤형 도구 모음입니다.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tools.map((tool, idx) => {
          const Icon = tool.icon;

          if (tool.isComingSoon) {
            return (
              <RevealOnScroll key={idx} delayIndex={idx}>
                <div className="glass-card p-5 sm:p-6 rounded-2xl flex flex-col justify-between opacity-75 cursor-not-allowed transition-all duration-300 shadow-2xs relative overflow-hidden h-full">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-11 h-11 rounded-2xl bg-[var(--bg-main)] flex items-center justify-center text-[var(--text-secondary)]">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] sm:text-[11px] font-mono font-extrabold px-2.5 py-0.5 rounded-full bg-[var(--text-secondary)]/10 text-[var(--text-secondary)] tracking-wider border border-[var(--border-color)]">
                        오픈 예정
                      </span>
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold tracking-[-0.02em] text-[var(--text-primary)]">
                        {tool.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1.5 leading-relaxed font-medium">
                        {tool.description}
                      </p>
                    </div>
                  </div>
                  <div className="pt-4 flex items-center justify-end text-xs font-semibold text-[var(--text-secondary)] font-mono gap-1">
                    <Clock className="w-3.5 h-3.5 stroke-[1.7]" />
                    오픈 준비 중입니다
                  </div>
                </div>
              </RevealOnScroll>
            );
          }

          return (
            <RevealOnScroll key={idx} delayIndex={idx}>
              <Link
                href={tool.href}
                className="glass-card glass-card-hover p-5 sm:p-6 rounded-2xl flex flex-col justify-between transition-all duration-300 group shadow-2xs active:scale-[0.99] h-full"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 rounded-2xl bg-[var(--bg-main)] flex items-center justify-center text-[var(--text-secondary)] group-hover:text-[var(--accent-orange)] group-hover:bg-[var(--accent-orange)]/15 group-hover:scale-105 transition-all duration-300">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[var(--accent-orange)]/15 text-[var(--accent-orange)]">
                      {tool.tag}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-orange)] transition-colors">
                      {tool.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1.5 leading-relaxed font-medium">
                      {tool.description}
                    </p>
                  </div>
                </div>
                <div className="pt-4 flex items-center justify-end text-xs font-bold text-[var(--accent-orange)] group-hover:translate-x-1 transition-transform">
                  지금 알아보기 →
                </div>
              </Link>
            </RevealOnScroll>
          );
        })}
      </div>
    </div>
  );
}
