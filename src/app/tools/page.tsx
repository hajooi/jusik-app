'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { HelpCircle, Sparkles, Clock, LineChart, BookOpen, CandlestickChart, Receipt, CloudLightning, Star } from 'lucide-react';
import RevealOnScroll from '@/components/common/RevealOnScroll';
import { useAuth } from '@/context/AuthContext';

interface ToolItem {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: any;
  isComingSoon: boolean;
}

const RAW_TOOLS: ToolItem[] = [
  {
    id: 'terms',
    title: '주식 용어 퀴즈',
    description: '주식 시장 필수 기초 용어 퀴즈',
    href: '/tools/terms',
    icon: HelpCircle,
    isComingSoon: false,
  },
  {
    id: 'type',
    title: '투자 성향 진단',
    description: '나에게 딱 맞는 투자 스타일 찾기',
    href: '/tools/type',
    icon: Sparkles,
    isComingSoon: false,
  },
  {
    id: 'simulate',
    title: '투자 전략 시뮬레이터',
    description: '내가 만든 조합의 성적 미리보기',
    href: '/tools/simulate',
    icon: LineChart,
    isComingSoon: false,
  },
  {
    id: 'market',
    title: '마켓 인사이트',
    description: '오늘의 증시 현황과 주요 증시 일정',
    href: '/tools/market',
    icon: CloudLightning,
    isComingSoon: false,
  },
  {
    id: 'etf-fee',
    title: 'ETF 수수료 정리',
    description: 'ETF 실질 수수료 정리',
    href: '#',
    icon: Receipt,
    isComingSoon: true,
  },
  {
    id: 'journal',
    title: '나의 투자일지',
    description: '계좌를 관리하는 투자 기록장',
    href: '#',
    icon: BookOpen,
    isComingSoon: true,
  },
  {
    id: 'patterns',
    title: '차트 패턴 트레이닝',
    description: '차트 패턴으로 익히는 실전 훈련',
    href: '#',
    icon: CandlestickChart,
    isComingSoon: true,
  },
];

export default function ToolsPage() {
  const { isFavoriteTool, toggleFavoriteTool } = useAuth();
  const [animatingId, setAnimatingId] = useState<string | null>(null);
  const [displayTools, setDisplayTools] = useState<ToolItem[]>(RAW_TOOLS);

  // 페이지 최초 마운트(또는 재접속/새로고침) 시점에만 즐겨찾기 기준 상단 정렬
  // 사용자가 카드를 둘러보며 별표를 누를 때는 자리가 바뀌지 않고 제자리를 지켜 편안함을 제공합니다.
  useEffect(() => {
    const sorted = [...RAW_TOOLS].sort((a, b) => {
      if (a.isComingSoon !== b.isComingSoon) {
        return a.isComingSoon ? 1 : -1;
      }
      const aFav = !a.isComingSoon && isFavoriteTool(a.id);
      const bFav = !b.isComingSoon && isFavoriteTool(b.id);
      if (aFav !== bFav) {
        return aFav ? -1 : 1;
      }
      return 0;
    });
    setDisplayTools(sorted);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStarClick = (e: React.MouseEvent, toolId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setAnimatingId(toolId);
    toggleFavoriteTool(toolId);
    setTimeout(() => {
      setAnimatingId((prev) => (prev === toolId ? null : prev));
    }, 500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* De-boxed Clean Minimal Hero Banner */}
      <div className="py-2 px-1 space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
          투자도구
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium">
          투자를 쉽고 똑똑하게 시작하는 실전 도구 모음입니다. 별표(★)를 눌러 자주 찾는 도구를 상단에 배치해 보세요.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayTools.map((tool, idx) => {
          const Icon = tool.icon;
          const isFav = !tool.isComingSoon && isFavoriteTool(tool.id);
          const isAnimating = animatingId === tool.id;

          if (tool.isComingSoon) {
            return (
              <div key={tool.id} className="transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)]">
                <div className="glass-card p-4 sm:p-5 rounded-2xl flex items-center justify-between opacity-75 cursor-not-allowed transition-all duration-300 shadow-2xs relative overflow-hidden h-full gap-3">
                  <div className="flex items-center gap-3.5 min-w-0 pr-2">
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

                  <div className="flex items-center text-xs font-semibold text-[var(--text-secondary)] font-mono gap-1 shrink-0">
                    <Clock className="w-3.5 h-3.5 stroke-[1.7]" />
                    <span>오픈 준비 중</span>
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div key={tool.id} className="transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)]">
              <Link
                href={tool.href}
                className={`glass-card glass-card-hover p-4 sm:p-5 rounded-2xl flex items-center justify-between transition-all duration-300 group shadow-2xs active:scale-[0.99] h-full gap-3 relative overflow-hidden ${
                  isFav
                    ? 'border-[var(--accent-orange)]/40 shadow-[0_0_16px_rgba(241,143,1,0.12)]'
                    : ''
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0 pr-9">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 shrink-0 border ${
                      isFav
                        ? 'bg-[var(--accent-orange)]/15 text-[var(--accent-orange)] border-[var(--accent-orange)]/30 scale-105'
                        : 'bg-[var(--bg-main)] text-[var(--text-secondary)] border-[var(--border-color)]/60 group-hover:text-[var(--accent-orange)] group-hover:bg-[var(--accent-orange)]/15 group-hover:scale-105'
                    }`}
                  >
                    <Icon className="w-5 h-5 stroke-[1.8]" />
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <h3
                      className={`text-sm sm:text-base font-bold transition-colors ${
                        isFav
                          ? 'text-[var(--accent-orange)]'
                          : 'text-[var(--text-primary)] group-hover:text-[var(--accent-orange)]'
                      }`}
                    >
                      {tool.title}
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] font-medium truncate">
                      {tool.description}
                    </p>
                  </div>
                </div>

                {/* Apple HIG 우측 상단 글래스모픽 별표 버튼 */}
                <button
                  type="button"
                  onClick={(e) => handleStarClick(e, tool.id)}
                  title={isFav ? '즐겨찾기 해제' : '즐겨찾기 추가'}
                  aria-label={isFav ? '즐겨찾기 해제' : '즐겨찾기 추가'}
                  className={`absolute top-3.5 right-3.5 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-md cursor-pointer border ${
                    isFav
                      ? 'bg-[var(--accent-orange)]/15 text-[var(--accent-orange)] border-[var(--accent-orange)]/35 shadow-[0_0_10px_rgba(241,143,1,0.25)] scale-105'
                      : 'bg-transparent text-[var(--text-secondary)]/40 border-transparent hover:text-[var(--accent-orange)] hover:bg-[var(--bg-main)]/80 hover:border-[var(--border-color)]/60'
                  }`}
                >
                  <Star
                    className={`w-4 h-4 transition-all duration-300 ${
                      isFav
                        ? 'fill-[var(--accent-orange)] stroke-[var(--accent-orange)]'
                        : 'stroke-current stroke-[1.8]'
                    } ${isAnimating ? 'animate-star-pop' : ''}`}
                  />
                </button>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
