import Link from 'next/link';
import { Sparkles, Clock } from 'lucide-react';

export default function ToolsPage() {
  const tools = [
    {
      title: '투자 성향 진단',
      description: '수익 vs 안전, 분석 vs 시스템 등 4대 핵심 축으로 나만의 16가지 투자 스타일과 퍼센티지 스펙트럼 리포트를 확인하세요.',
      href: '/tools/type',
      icon: Sparkles,
      tag: '40문항 진단',
      isComingSoon: false,
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
              <div
                key={idx}
                className="glass-card glass-card-hover p-5 sm:p-6 rounded-2xl flex flex-col justify-between opacity-85 cursor-not-allowed transition-all duration-300 group shadow-2xs relative overflow-hidden"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-transparent flex items-center justify-center text-[var(--text-secondary)] group-hover:text-[var(--accent-orange)] transition-colors">
                      <Icon className="w-4.5 h-4.5 stroke-[1.5]" />
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-mono font-extrabold px-2.5 py-0.5 rounded-full bg-[var(--text-secondary)]/10 text-[var(--text-secondary)] tracking-wider border border-[var(--border-color)]">
                      오픈 예정
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold tracking-[-0.02em] text-[var(--text-primary)] group-hover:text-[var(--accent-orange)] transition-colors">
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
            );
          }

          return (
            <Link
              key={idx}
              href={tool.href}
              className="glass-card glass-card-hover p-5 sm:p-6 rounded-2xl flex flex-col justify-between transition-all duration-300 group shadow-2xs hover:-translate-y-0.5 active:scale-[0.99]"
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
