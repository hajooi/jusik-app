'use client';

import { SP500_YEARLY, WEEKLY_BRIEFING } from '@/data/marketCalendar';
import SparklineChart from './SparklineChart';
import { useEffect, useRef, useState } from 'react';
import { Lock, ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Sparkles, HelpCircle, Compass, Quote, Target, AlertTriangle, Crown, X } from 'lucide-react';
import RevealOnScroll from '@/components/common/RevealOnScroll';
import { useAuth } from '@/context/AuthContext';

function useInvestmentType() {
  const [typeCode, setTypeCode] = useState<string | null>(null);
  useEffect(() => {
    try {
      const completed = localStorage.getItem('jusik_type_completed');
      if (completed === 'true') {
        const raw = localStorage.getItem('jusik_type_answers');
        if (raw) {
          const data = JSON.parse(raw);
          setTypeCode(data?.typeCode ?? 'DEFAULT');
        }
      }
    } catch { /* ignore */ }
  }, []);
  return typeCode;
}

const SIGNAL_CONFIG = {
  '분할구매 구간': { color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  '중립 적립 구간': { color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/20' },
  '과열 주의 구간': { color: 'text-rose-500', bg: 'bg-rose-500/10 border-rose-500/20' },
};

const IMPACT_COLORS: Record<string, { bg: string; text: string }> = {
  '주의': { bg: 'bg-amber-500/15', text: 'text-amber-600 dark:text-amber-400' },
  '관망': { bg: 'bg-slate-500/15', text: 'text-slate-600 dark:text-slate-300' },
  '호재': { bg: 'bg-emerald-500/15', text: 'text-emerald-600 dark:text-emerald-400' },
  '핵심지표': { bg: 'bg-[var(--accent-orange)]/15', text: 'text-[var(--accent-orange)]' },
};

export default function WeeklyBriefingSection() {
  const [b, setB] = useState(WEEKLY_BRIEFING);
  const typeCode = useInvestmentType();
  const { user, isPro, openAuthPopover } = useAuth();
  const [activeCard, setActiveCard] = useState(0);
  const [proModalOpen, setProModalOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const TOTAL_CARDS = 8;

  // Supabase 클라우드 캐시에서 최신 동기화된 주간 브리핑 비동기 로드
  useEffect(() => {
    fetch(`/api/market/daily?t=${Date.now()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.weeklyBriefing) {
          setB(data.weeklyBriefing);
        }
      })
      .catch((err) => {
        console.warn('Weekly briefing fetch fallback to static:', err);
      });
  }, []);

  const [isMouseDown, setIsMouseDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);

  const scrollToCard = (idx: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const card = el.children[idx] as HTMLElement;
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
    setActiveCard(idx);
  };

  // PC 마우스 드래그 스크롤 핸들러
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    if (!el) return;
    setIsMouseDown(true);
    setStartX(e.pageX - el.offsetLeft);
    setScrollLeftState(el.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isMouseDown) return;
    const el = scrollRef.current;
    if (!el) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startX) * 1.5;
    el.scrollLeft = scrollLeftState - walk;
  };

  const handleMouseUpOrLeave = () => {
    setIsMouseDown(false);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handler = () => {
      const scrollCenter = el.scrollLeft + el.offsetWidth / 2;
      let closestIdx = 0;
      let minDiff = Infinity;
      Array.from(el.children).forEach((child, i) => {
        const c = child as HTMLElement;
        const diff = Math.abs(c.offsetLeft + c.offsetWidth / 2 - scrollCenter);
        if (diff < minDiff) {
          minDiff = diff;
          closestIdx = i;
        }
      });
      setActiveCard(closestIdx);
    };
    el.addEventListener('scroll', handler, { passive: true });
    return () => el.removeEventListener('scroll', handler);
  }, []);

  const typeGuide = b.typeGuides[typeCode as keyof typeof b.typeGuides] ?? b.typeGuides.DEFAULT;
  const signal = b.marketSignal;
  const signalCfg = SIGNAL_CONFIG[signal.level] ?? SIGNAL_CONFIG['중립 적립 구간'];

  // S&P 500 최근 흐름 데이터 (주간 5거래일 또는 최근 포인트)
  const sp500WeekData = (b.summaryStory as any)?.weekPoints || [7686.1, 7711.8, 7745.2, 7735.0, 7718.6];

  // 1. 이번 주 증시 요약 (카드뉴스 01 - 미니 차트 탑재)
  const renderCard1 = () => (
    <div className="relative flex flex-col justify-between h-full p-6 sm:p-7 bg-[var(--card-surface)] rounded-3xl border border-[var(--border-color)]/90 shadow-2xs overflow-hidden">
      {/* Card Header */}
      <div className="flex items-center justify-between">
        <span className="px-3.5 py-1.5 rounded-full bg-[var(--accent-orange)]/15 text-[var(--accent-orange)] text-xs font-mono font-black tracking-wider">
          01 · 주간 총괄
        </span>
        <span className="text-xs font-bold text-[var(--text-secondary)] font-mono">
          9월 1주차
        </span>
      </div>

      {/* Visual Center */}
      <div className="my-auto py-1 space-y-3">
        <div>
          <h3 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] leading-snug tracking-tight mb-1.5 break-keep">
            일자리는 튼튼,<br />
            <span className="text-[var(--accent-orange)]">주가는 차분한 제자리 지키기</span>
          </h3>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed font-medium break-keep">
            {b.summaryStory.desc}
          </p>
        </div>

        {/* 이번 주 S&P 500 미니 추세 차트 */}
        <div className="p-3 rounded-2xl bg-[var(--bg-main)]/80 border border-[var(--border-color)]/70">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-bold text-[var(--text-secondary)]">S&amp;P 500 주간 5일 흐름</span>
            <span className="font-black text-emerald-500 tabular-nums">+{b.sp500WeekChange}%</span>
          </div>
          <div className="h-16 w-full pointer-events-none">
            <SparklineChart data={sp500WeekData} height={64} />
          </div>
        </div>
      </div>

      {/* Card Footer Metric Banner */}
      <div className="grid grid-cols-2 gap-3 pt-2.5 border-t border-[var(--border-color)]/60">
        <div className="p-2.5 sm:p-3 rounded-2xl bg-[var(--bg-main)]/90 border border-[var(--border-color)]/70 text-center">
          <span className="text-xs text-[var(--text-secondary)] font-bold block">S&amp;P 500 현재</span>
          <span className="text-base sm:text-lg font-black text-[var(--text-primary)] tabular-nums mt-0.5">
            {b.sp500Current}
          </span>
        </div>
        <div className="p-2.5 sm:p-3 rounded-2xl bg-[var(--bg-main)]/90 border border-[var(--border-color)]/70 text-center">
          <span className="text-xs text-[var(--text-secondary)] font-bold block">나스닥 100 주간</span>
          <span className="text-base sm:text-lg font-black text-emerald-500 tabular-nums flex items-center justify-center gap-0.5 mt-0.5">
            <TrendingUp className="w-3.5 h-3.5" /> +{b.nasdaqWeekChange}%
          </span>
        </div>
      </div>
    </div>
  );

  // 2. 핵심 뉴스 (카드뉴스 02)
  const renderCard2 = () => (
    <div className="relative flex flex-col justify-between h-full p-6 sm:p-7 bg-[var(--card-surface)] rounded-3xl border border-[var(--border-color)]/90 shadow-2xs overflow-hidden">
      <div className="flex items-center justify-between">
        <span className="px-3.5 py-1.5 rounded-full bg-[var(--accent-orange)]/15 text-[var(--accent-orange)] text-xs font-mono font-black tracking-wider">
          02 · 핵심 이슈
        </span>
        <span className="text-xs font-bold text-[var(--text-secondary)]">주요 뉴스 3선</span>
      </div>

      <div className="my-auto py-2 space-y-3">
        <h3 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] leading-snug tracking-tight break-keep">
          시장을 움직인<br />
          <span className="text-[var(--accent-orange)]">3대 결정적 뉴스</span>
        </h3>

        <div className="space-y-2">
          {b.newsItems.map((item, idx) => (
            <div key={idx} className="p-2.5 sm:p-3 rounded-2xl bg-[var(--bg-main)]/90 border border-[var(--border-color)]/70 flex items-start gap-2.5">
              <span className="text-lg sm:text-xl shrink-0 mt-0.5">{item.icon}</span>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-bold text-[var(--text-primary)] leading-snug break-keep">
                  {item.headline}
                </p>
                <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed mt-0.5 break-keep">
                  {item.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-center">
        <span className="text-xs font-bold text-amber-600 dark:text-amber-400 break-keep">
          💡 단기 뉴스보다 기업의 장기 체력에 집중할 때예요
        </span>
      </div>
    </div>
  );

  // 3. 거시 경제 (카드뉴스 03)
  const renderCard3 = () => (
    <div className="relative flex flex-col justify-between h-full p-6 sm:p-7 bg-[var(--card-surface)] rounded-3xl border border-[var(--border-color)]/90 shadow-2xs overflow-hidden">
      <div className="flex items-center justify-between">
        <span className="px-3.5 py-1.5 rounded-full bg-[var(--accent-orange)]/15 text-[var(--accent-orange)] text-xs font-mono font-black tracking-wider">
          03 · 환율 &amp; 원자재
        </span>
        <span className="text-xs font-bold text-[var(--text-secondary)]">거시 경제 흐름</span>
      </div>

      <div className="my-auto py-2 space-y-3">
        <h3 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] leading-snug tracking-tight break-keep">
          달러와 기름값,<br />
          <span className="text-sky-500">내 통장 영향은?</span>
        </h3>

        <div className="space-y-2">
          {b.macroStory.items.map((m, idx) => (
            <div key={idx} className="p-2.5 sm:p-3 rounded-2xl bg-[var(--bg-main)]/90 border border-[var(--border-color)]/70 flex items-start justify-between gap-2.5">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-xs sm:text-sm font-bold text-[var(--text-primary)] break-keep">{m.name}</p>
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed break-keep">{m.desc}</p>
              </div>
              <span className="text-xs font-black px-2 py-0.5 rounded-full bg-[var(--card-surface)] text-[var(--accent-orange)] border border-[var(--accent-orange)]/30 shrink-0 mt-0.5">
                {m.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="p-2.5 rounded-2xl bg-[var(--bg-main)]/70 border border-[var(--border-color)]/60 text-xs text-center text-[var(--text-secondary)] font-medium break-keep">
        안전자산 금값 견고 · 유가 숨고르기로 물가 부담 완화 중
      </div>
    </div>
  );

  // 4. 다음 주 일정 (카드뉴스 04)
  const renderCard4 = () => (
    <div className="relative flex flex-col justify-between h-full p-6 sm:p-7 bg-[var(--card-surface)] rounded-3xl border border-[var(--border-color)]/90 shadow-2xs overflow-hidden">
      <div className="flex items-center justify-between">
        <span className="px-3.5 py-1.5 rounded-full bg-[var(--accent-orange)]/15 text-[var(--accent-orange)] text-xs font-mono font-black tracking-wider">
          04 · 캘린더 프리뷰
        </span>
        <span className="text-xs font-bold text-[var(--text-secondary)]">주요 일정 체크</span>
      </div>

      <div className="my-auto py-2 space-y-3">
        <h3 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] leading-snug tracking-tight break-keep">
          놓치면 안 될<br />
          <span className="text-violet-500">다음 주 핵심 일정</span>
        </h3>

        <div className="space-y-2">
          {b.nextWeekEvents.map((ev, i) => (
            <div key={i} className="p-2.5 sm:p-3 rounded-2xl bg-[var(--bg-main)]/90 border border-[var(--border-color)]/70 flex items-start gap-2.5">
              <span className="text-lg sm:text-xl shrink-0 mt-0.5">{ev.icon}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                  <span className="text-xs font-mono font-black text-[var(--accent-orange)] px-1.5 py-0.5 rounded bg-[var(--accent-orange)]/15">
                    {ev.date}
                  </span>
                  <p className="text-xs sm:text-sm font-bold text-[var(--text-primary)] break-keep">{ev.title}</p>
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed break-keep">{ev.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-2.5 rounded-2xl bg-[var(--bg-main)]/80 border border-[var(--border-color)]/60 text-center text-xs font-semibold text-[var(--text-secondary)] break-keep">
        가장 중요한 날: <strong className="text-[var(--text-primary)]">9/17(목) 03:00 FOMC 금리 발표</strong>
      </div>
    </div>
  );

  // 5. 주요 자산 주간 등락 맵 (카드뉴스 05 - 실전 데이터)
  const renderCard5 = () => (
    <div className="relative flex flex-col justify-between h-full p-6 sm:p-7 bg-[var(--card-surface)] rounded-3xl border border-[var(--border-color)]/90 shadow-2xs overflow-hidden">
      <div className="flex items-center justify-between">
        <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-black tracking-wider flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5" />
          05 · 자산 맵
        </span>
        <span className="text-xs font-bold text-[var(--text-secondary)]">주요 자산 1주 성적표</span>
      </div>

      <div className="my-auto py-2 space-y-3">
        <h3 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] leading-snug tracking-tight break-keep">
          한눈에 비교하는<br />
          <span className="text-emerald-500">주요 자산 주간 수익률</span>
        </h3>

        <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
          {((b as any).assetPerformance || []).map((item: any, idx: number) => (
            <div key={idx} className="p-2.5 sm:p-3 rounded-2xl bg-[var(--bg-main)]/90 border border-[var(--border-color)]/70 flex flex-col justify-between">
              <span className="text-xs font-bold text-[var(--text-secondary)] truncate">{item.name}</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className={`text-sm sm:text-base font-black tabular-nums ${item.isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {item.returnRate}
                </span>
                <span className="text-[10px] font-semibold text-[var(--text-secondary)]/80">{item.note}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-center text-xs font-bold text-emerald-700 dark:text-emerald-300 break-keep">
        💡 주식과 금·채권을 분산한 포트폴리오는 변동성 속에서도 단단해요
      </div>
    </div>
  );

  // 6. 주간 핵심 1문 1답 (카드뉴스 06 - 실전 Q&A)
  const renderCard6 = () => {
    const qna = (b as any).weeklyQnA || {
      question: '일자리가 깜짝 호조인데, 왜 주가는 폭등하지 못했을까요?',
      answer: '경제가 너무 튼튼하면 연준이 금리를 서둘러 내릴 이유가 줄어들기 때문이에요. 좋은 고용 지표가 단기적으로는 금리 인하 기대감을 늦추는 브레이크 역할을 했습니다.',
      takeaway: '금리 방향타는 9/11(금) 소비자물가(CPI) 발표에서 판가름 납니다.',
    };

    return (
      <div className="relative flex flex-col justify-between h-full p-6 sm:p-7 bg-[var(--card-surface)] rounded-3xl border border-[var(--border-color)]/90 shadow-2xs overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="px-3.5 py-1.5 rounded-full bg-[var(--accent-orange)]/15 text-[var(--accent-orange)] text-xs font-mono font-black tracking-wider flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5" />
            06 · 핵심 Q&amp;A
          </span>
          <span className="text-xs font-bold text-[var(--text-secondary)]">주간 1문 1답</span>
        </div>

        <div className="my-auto py-2 space-y-3">
          <div className="p-3.5 sm:p-4 rounded-2xl bg-[var(--accent-orange)]/10 border border-[var(--accent-orange)]/25">
            <span className="text-xs font-black text-[var(--accent-orange)] block mb-1">Q. 이번 주 가장 큰 궁금증</span>
            <p className="text-sm sm:text-base font-extrabold text-[var(--text-primary)] leading-snug break-keep">
              &ldquo;{qna.question}&rdquo;
            </p>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl bg-[var(--bg-main)]/90 border border-[var(--border-color)]/70">
            <span className="text-xs font-black text-emerald-500 block mb-1">A. 부엉이의 명쾌한 해설</span>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium leading-relaxed break-keep">
              {qna.answer}
            </p>
          </div>
        </div>

        <div className="p-2.5 rounded-2xl bg-[var(--bg-main)]/80 border border-[var(--border-color)]/60 text-xs text-center text-[var(--text-primary)] font-semibold break-keep">
          📌 {qna.takeaway}
        </div>
      </div>
    );
  };

  // 7. PRO 관심 종목 & 레이더 (카드뉴스 07)
  const renderCard7 = () => (
    <div className="relative flex flex-col justify-between h-full p-6 sm:p-7 bg-[var(--card-surface)] rounded-3xl border border-[var(--border-color)]/90 shadow-2xs overflow-hidden">
      {!isPro && (
        <div
          onClick={() => setProModalOpen(true)}
          className="absolute inset-0 z-20 rounded-3xl flex flex-col items-center justify-center gap-3.5 backdrop-blur-md bg-[var(--card-surface)]/85 p-6 text-center cursor-pointer transition-all hover:bg-[var(--card-surface)]/90 group"
        >
          <div className="w-14 h-14 rounded-2xl bg-[var(--accent-orange)]/15 flex items-center justify-center border border-[var(--accent-orange)]/30 group-hover:scale-105 transition-transform shadow-xs">
            <Lock className="w-7 h-7 text-[var(--accent-orange)]" />
          </div>
          <div className="space-y-1">
            <div className="text-base sm:text-lg font-extrabold text-[var(--text-primary)] flex items-center justify-center gap-1.5">
              <Crown className="w-4 h-4 text-[var(--accent-orange)]" />
              PRO 전용 관심 종목
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed break-keep max-w-[240px] mx-auto">
              관심 종목 및 다음 주 실전 대응 시나리오
            </p>
          </div>
        </div>
      )}

      <div className={`flex flex-col justify-between h-full ${!isPro ? 'filter blur-sm select-none' : ''}`}>
        <div className="flex items-center justify-between">
          <span className="px-3.5 py-1.5 rounded-full bg-[var(--accent-orange)]/15 text-[var(--accent-orange)] text-xs font-mono font-black tracking-wider flex items-center gap-1.5">
            <Target className="w-4 h-4" />
            07 · PRO 관심 종목
          </span>
          <span className="text-xs font-bold text-[var(--accent-orange)]">관심 종목</span>
        </div>

        <div className="my-auto py-2 space-y-2.5">
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] leading-snug tracking-tight break-keep">
              이번 주 유심히 보는<br />
              <span className="text-[var(--accent-orange)]">레이더 &amp; 관심 종목</span>
            </h3>
            <p className="text-xs text-[var(--text-secondary)] font-medium mt-0.5 break-keep">
              {b.proRadar.macroObservation}
            </p>
          </div>

          <div className="space-y-2">
            {b.proRadar.watchlist.map((item, i) => (
              <div key={i} className="p-2.5 sm:p-3 rounded-2xl bg-[var(--bg-main)]/90 border border-[var(--border-color)]/70">
                <div className="flex items-center justify-between mb-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 rounded bg-[var(--accent-orange)]/15 text-[var(--accent-orange)] text-xs font-mono font-black">
                      {item.ticker}
                    </span>
                    <span className="text-xs sm:text-sm font-black text-[var(--text-primary)]">{item.name}</span>
                  </div>
                  <span className="text-xs font-semibold text-[var(--text-secondary)]">{item.focus}</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed break-keep">
                  {item.memo}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="p-2.5 rounded-2xl bg-[var(--bg-main)]/80 border border-[var(--border-color)]/60 text-xs font-semibold text-[var(--text-primary)] text-center break-keep">
          💡 {b.proRadar.weeklyActionAdvice}
        </div>
      </div>
    </div>
  );

  // 8. PRO 실전 시나리오 & 함정 피하기 (카드뉴스 08)
  const renderCard8 = () => (
    <div className="relative flex flex-col justify-between h-full p-6 sm:p-7 bg-[var(--card-surface)] rounded-3xl border border-[var(--border-color)]/90 shadow-2xs overflow-hidden">
      {!isPro && (
        <div
          onClick={() => setProModalOpen(true)}
          className="absolute inset-0 z-20 rounded-3xl flex flex-col items-center justify-center gap-3.5 backdrop-blur-md bg-[var(--card-surface)]/85 p-6 text-center cursor-pointer transition-all hover:bg-[var(--card-surface)]/90 group"
        >
          <div className="w-14 h-14 rounded-2xl bg-rose-500/15 flex items-center justify-center border border-rose-500/30 group-hover:scale-105 transition-transform shadow-xs">
            <Lock className="w-7 h-7 text-rose-500" />
          </div>
          <div className="space-y-1">
            <div className="text-base sm:text-lg font-extrabold text-[var(--text-primary)] flex items-center justify-center gap-1.5">
              <Crown className="w-4 h-4 text-rose-500" />
              PRO 실전 대응 매뉴얼
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed break-keep max-w-[240px] mx-auto">
              다음 주 시장 시나리오별 행동 수칙과 피해야 할 함정
            </p>
          </div>
        </div>
      )}

      <div className={`flex flex-col justify-between h-full ${!isPro ? 'filter blur-sm select-none' : ''}`}>
        <div className="flex items-center justify-between">
          <span className="px-3.5 py-1.5 rounded-full bg-rose-500/15 text-rose-500 text-xs font-mono font-black tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4" />
            08 · PRO 시나리오
          </span>
          <span className="text-xs font-bold text-rose-500">실전 대응법</span>
        </div>

        <div className="my-auto py-2 space-y-2.5">
          <h3 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] leading-snug tracking-tight break-keep">
            다음 주 시나리오 &<br />
            <span className="text-rose-500">절대 피해야 할 함정</span>
          </h3>

          <div className="space-y-1.5">
            {b.proScenario.scenarios.map((sc) => (
              <div key={sc.type} className="p-2.5 sm:p-3 rounded-2xl bg-[var(--bg-main)]/90 border border-[var(--border-color)]/70">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="w-4 h-4 rounded-md bg-[var(--accent-orange)] text-white text-xs font-black flex items-center justify-center shrink-0">
                    {sc.type}
                  </span>
                  <p className="text-xs font-bold text-[var(--text-primary)] break-keep">{sc.condition}</p>
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed pl-5 break-keep">
                  ➔ {sc.action}
                </p>
              </div>
            ))}
          </div>

          <div className="p-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/25">
            <div className="flex items-center gap-1 text-xs font-extrabold text-rose-600 dark:text-rose-400 mb-0.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              {b.proScenario.dangerTrap.alertTitle}
            </div>
            <p className="text-xs text-[var(--text-primary)] font-bold leading-snug break-keep">
              {b.proScenario.dangerTrap.description}
            </p>
          </div>
        </div>

        <div className="text-xs text-center text-[var(--text-secondary)]/60 font-mono">
          한 주의 계획을 세우고 흔들림 없이 실천하세요
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full flex flex-col items-center gap-5">

      {/* ── Mobile View (< md): Apple HIG Native Carousel ── */}
      <div className="block md:hidden w-full space-y-3">
        <RevealOnScroll delayIndex={0}>
        <div className="relative w-full overflow-hidden">
          <div
            ref={scrollRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
            className={`flex w-full overflow-x-auto snap-x snap-mandatory scroll-smooth px-4 py-2 gap-3.5 hide-scrollbar select-none ${
              isMouseDown ? 'cursor-grabbing' : 'cursor-grab'
            }`}
            style={{ scrollbarWidth: 'none' }}
          >
            <div className="flex-none w-[84vw] min-h-[460px] snap-center flex flex-col">{renderCard1()}</div>
            <div className="flex-none w-[84vw] min-h-[460px] snap-center flex flex-col">{renderCard2()}</div>
            <div className="flex-none w-[84vw] min-h-[460px] snap-center flex flex-col">{renderCard3()}</div>
            <div className="flex-none w-[84vw] min-h-[460px] snap-center flex flex-col">{renderCard4()}</div>
            <div className="flex-none w-[84vw] min-h-[460px] snap-center flex flex-col">{renderCard5()}</div>
            <div className="flex-none w-[84vw] min-h-[460px] snap-center flex flex-col">{renderCard6()}</div>
            <div className="flex-none w-[84vw] min-h-[460px] snap-center flex flex-col">{renderCard7()}</div>
            <div className="flex-none w-[84vw] min-h-[460px] snap-center flex flex-col">{renderCard8()}</div>
          </div>
        </div>
        </RevealOnScroll>

        {/* Carousel Navigation Controller (Dots + Prev/Next Buttons) */}
        <RevealOnScroll delayIndex={1}>
        <div className="flex items-center justify-center gap-3 mt-1">
          <button
            onClick={() => scrollToCard(Math.max(0, activeCard - 1))}
            disabled={activeCard === 0}
            aria-label="이전 카드"
            className="p-1.5 rounded-lg text-[var(--text-secondary)] disabled:opacity-20 hover:text-[var(--accent-orange)] hover:bg-[var(--accent-orange)]/10 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex gap-1.5">
            {Array.from({ length: TOTAL_CARDS }).map((_, i) => (
              <button
                key={i}
                onClick={() => scrollToCard(i)}
                aria-label={`${i + 1}번 카드로 이동`}
                className={`rounded-full transition-all duration-300 cursor-pointer ${
                  i === activeCard
                    ? 'w-5 h-2 bg-[var(--accent-orange)]'
                    : 'w-2 h-2 bg-[var(--border-color)] hover:bg-[var(--accent-orange)]/50'
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => scrollToCard(Math.min(TOTAL_CARDS - 1, activeCard + 1))}
            disabled={activeCard === TOTAL_CARDS - 1}
            aria-label="다음 카드"
            className="p-1.5 rounded-lg text-[var(--text-secondary)] disabled:opacity-20 hover:text-[var(--accent-orange)] hover:bg-[var(--accent-orange)]/10 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        </RevealOnScroll>
      </div>

      {/* ── Desktop View (>= md): Clean 2-Column Editorial Grid with Staggered Animations ── */}
      <div className="hidden md:grid md:grid-cols-2 gap-5 w-full">
        <RevealOnScroll delayIndex={0} className="min-h-[480px] flex flex-col">{renderCard1()}</RevealOnScroll>
        <RevealOnScroll delayIndex={1} className="min-h-[480px] flex flex-col">{renderCard2()}</RevealOnScroll>
        <RevealOnScroll delayIndex={2} className="min-h-[480px] flex flex-col">{renderCard3()}</RevealOnScroll>
        <RevealOnScroll delayIndex={3} className="min-h-[480px] flex flex-col">{renderCard4()}</RevealOnScroll>
        <RevealOnScroll delayIndex={4} className="min-h-[480px] flex flex-col">{renderCard5()}</RevealOnScroll>
        <RevealOnScroll delayIndex={5} className="min-h-[480px] flex flex-col">{renderCard6()}</RevealOnScroll>
        <RevealOnScroll delayIndex={6} className="min-h-[480px] flex flex-col">{renderCard7()}</RevealOnScroll>
        <RevealOnScroll delayIndex={7} className="min-h-[480px] flex flex-col">{renderCard8()}</RevealOnScroll>
      </div>

      {/* PRO Unlock Popover Modal */}
      {proModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-sm p-6 rounded-3xl bg-white dark:bg-[#18181b] border border-[var(--border-color)] shadow-2xl space-y-4 text-left">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[var(--accent-orange)] font-extrabold text-sm">
                <Crown className="w-4 h-4" />
                <span>PRO 멤버십 전용 브리핑</span>
              </div>
              <button
                type="button"
                onClick={() => setProModalOpen(false)}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1 rounded-full hover:bg-[var(--card-hover)] transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed font-medium break-keep">
              관심 종목 분석 및 실전 대응 시나리오는 <strong>PRO 멤버십 전용</strong> 인사이트 카드입니다.
            </p>

            <button
              type="button"
              onClick={() => {
                setProModalOpen(false);
                openAuthPopover();
              }}
              className="w-full py-3 rounded-full bg-[var(--accent-orange)] hover:brightness-110 text-white font-extrabold text-xs transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Crown className="w-3.5 h-3.5" />
              {!user ? '로그인 / 가입하고 둘러보기' : 'PRO 멤버십 등록하기'}
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

