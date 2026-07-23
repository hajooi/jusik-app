import Link from 'next/link';
import { Sparkles, Calculator, PieChart, ShieldCheck } from 'lucide-react';

export default function ToolsPage() {
  const tools = [
    {
      title: '투자 성향 진단 (MBTI)',
      description: '30초 테스트로 나만의 올웨더 자산배분 비중 산출',
      href: '/lesson/lv3-2',
      icon: Sparkles,
      tag: 'Lv. 3 연동',
    },
    {
      title: '포트폴리오 백테스터 & 계산기',
      description: '월별 목표 적립금액 및 리밸런싱 매수/매도 수량 자동 계산',
      href: '/lesson/lv4-2',
      icon: Calculator,
      tag: 'Lv. 4 연동',
    },
    {
      title: '절세 계좌 시뮬레이터 (ISA / 연금저축)',
      description: '세금 0원 만들기 계좌 조합 추천 및 절세 혜택 계산',
      href: '/lesson/lv2-1',
      icon: ShieldCheck,
      tag: 'Lv. 2 연동',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Consistent Animated Dynamic AI Gradient Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden p-6 sm:p-8 animated-mesh-bg border border-[var(--border-color)] shadow-sm">
        <div className="relative z-10 flex flex-col gap-1">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--text-primary)]">
              투자 도구
            </h1>
            <span className="text-xs font-mono font-bold bg-[var(--card-surface)] border border-[var(--border-color)] px-3.5 py-1.5 rounded-full text-[var(--text-primary)] shrink-0 shadow-xs">
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
          return (
            <Link
              key={idx}
              href={tool.href}
              className="bg-[var(--card-surface)] border border-[var(--border-color)] p-6 rounded-3xl flex flex-col justify-between hover:bg-[var(--card-hover)] hover:border-[var(--accent-orange)] transition-all duration-300 group shadow-xs hover:shadow-md active:scale-[0.99]"
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
