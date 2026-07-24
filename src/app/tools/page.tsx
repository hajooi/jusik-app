import Link from 'next/link';
import { Sparkles, Clock } from 'lucide-react';

export default function ToolsPage() {
  const tools = [
    {
      title: '투자 성향 진단',
      description: '수익률 목표와 손실 감수 성향을 정밀하게 다차원으로 분석하여, 나에게 꼭 맞는 맞춤형 투자 성향과 자산 배분 가이드를 확인해 보세요.',
      href: '/risk-profile',
      icon: Sparkles,
      tag: '진단 도구',
      isComingSoon: true,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Consistent Animated Dynamic AI Gradient Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden p-6 sm:p-8 animated-mesh-bg shadow-sm">
        <div className="relative z-10 flex flex-col gap-1">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--text-primary)]">
              투자도구
            </h1>
            <span className="text-xs font-mono font-bold bg-[var(--card-surface)] px-3.5 py-1.5 rounded-full text-[var(--text-primary)] shrink-0 shadow-xs">
              {tools.length}개 모듈
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium mt-1">
            투자 성향 진단부터 자산 배분 백테스터까지, 실전 투자를 돕는 맞춤형 웹 도구 모음입니다.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tools.map((tool, idx) => {
          const Icon = tool.icon;
          
          if (tool.isComingSoon) {
            return (
              <div
                key={idx}
                className="glass-card p-6 rounded-3xl flex flex-col justify-between opacity-85 cursor-not-allowed shadow-xs relative overflow-hidden"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 rounded-2xl bg-[var(--bg-main)]/60 flex items-center justify-center text-[var(--text-secondary)]">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[var(--card-hover)] text-[var(--text-secondary)]">
                      오픈 예정
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
                      {tool.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1.5 leading-relaxed font-medium">
                      {tool.description}
                    </p>
                  </div>
                </div>
                <div className="pt-4 flex items-center justify-end text-xs font-semibold text-[var(--text-secondary)] font-mono gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  오픈 준비 중입니다
                </div>
              </div>
            );
          }

          return (
            <Link
              key={idx}
              href={tool.href}
              className="glass-card glass-card-hover p-6 rounded-3xl flex flex-col justify-between transition-all duration-300 group shadow-xs hover:shadow-md active:scale-[0.99]"
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
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 leading-relaxed">
                    {tool.description}
                  </p>
                </div>
              </div>
              <div className="pt-4 flex items-center justify-end text-xs font-bold text-[var(--accent-orange)] group-hover:translate-x-1 transition-transform">
                실습 실행 →
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
