'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Clock, Star, Sparkles } from 'lucide-react';
import { CALENDAR_EVENTS, EVENT_TYPE_CONFIG, IMPACT_TAG_CONFIG, CalendarEvent } from '@/data/marketCalendar';
import RevealOnScroll from '@/components/common/RevealOnScroll';
import SmoothHeight from '@/components/SmoothHeight';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay(); // 0 = 일, 1 = 월, ..., 6 = 토
}
function formatDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

type CategoryFilter = '전체' | '경제지표' | '실적';
type RegionFilter = '전체' | '국내' | '해외';
type ImportanceFilter = '전체' | '★' | '★★' | '★★★';

function PillToggle<T extends string>({
  options,
  value,
  onChange,
}: {
  options: T[];
  value: T;
  onChange: (v: T) => void;
}) {
  const activeIndex = options.indexOf(value);
  const count = options.length;
  const widthPercent = 100 / count;

  return (
    <div className="relative flex items-center p-1 rounded-full bg-[var(--bg-main)]/90 border border-[var(--border-color)]/90 shadow-2xs">
      {/* Sliding Animated Indicator with Apple snappy bezier & rounded-full */}
      <div
        className="absolute top-1 bottom-1 rounded-full bg-[var(--card-surface)] border border-[rgba(241,143,1,0.6)] shadow-[0_0_12px_rgba(241,143,1,0.22)] transition-all duration-300 pointer-events-none"
        style={{
          width: `calc(${widthPercent}% - 4px)`,
          left: `calc(${activeIndex * widthPercent}% + 2px)`,
          transitionTimingFunction: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}
      />
      {options.map((opt) => {
        const isSelected = value === opt;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`relative z-10 flex-1 py-1.5 rounded-full text-xs font-bold transition-colors duration-200 cursor-pointer text-center whitespace-nowrap ${
              isSelected
                ? 'text-[var(--accent-orange)] font-extrabold'
                : 'text-[var(--text-secondary)] hover:text-[var(--accent-orange)]'
            }`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

interface EventCardProps {
  event: CalendarEvent;
  isPast?: boolean;
}
function EventCard({ event, isPast }: EventCardProps) {
  const typeCfg = EVENT_TYPE_CONFIG[event.type];
  const impactCfg = IMPACT_TAG_CONFIG[event.impactTag];
  return (
    <div className={`p-4 rounded-2xl border transition-all ${
      isPast 
        ? 'border-[var(--border-color)]/60 bg-[var(--bg-main)]/60 opacity-80 hover:opacity-100' 
        : 'border-[var(--border-color)]/90 bg-[var(--bg-main)]/80 hover:bg-[var(--card-hover)] hover:border-[var(--accent-orange)]/40 shadow-2xs'
    }`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {isPast && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-500/15 text-slate-500">
              발표 완료
            </span>
          )}
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${typeCfg.badgeBg} ${typeCfg.badgeText}`}>
            {typeCfg.label}
          </span>
          {event.time && (
            <span className="text-xs text-[var(--text-secondary)] font-mono flex items-center gap-0.5">
              <Clock className="w-3 h-3" />
              {event.time}
            </span>
          )}
          {/* Importance Stars Badge */}
          {event.importance && (
            <span className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-[11px] font-bold">
              {Array.from({ length: event.importance }).map((_, i) => (
                <Star key={i} className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
              ))}
            </span>
          )}
        </div>
        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 ${impactCfg.bg} ${impactCfg.text}`}>
          {impactCfg.dot} {event.impactTag}
        </span>
      </div>
      <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)] mb-2 leading-snug break-keep">
        {event.title}
        {event.ticker && <span className="ml-1.5 text-xs font-mono text-[var(--accent-orange)] font-bold">({event.ticker})</span>}
      </h3>
      <div className="text-xs text-[var(--text-secondary)] leading-relaxed whitespace-pre-line border-l-2 border-[var(--border-color)] pl-2.5 mb-2 break-keep">
        {event.simpleSummary}
      </div>
      {(event.actual || event.expected || event.previous) && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-mono pt-1 border-t border-[var(--border-color)]/60">
          {event.actual && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[var(--accent-orange)]/10 border border-[var(--accent-orange)]/30">
              <span className="text-[var(--accent-orange)] font-bold">발표 결과</span>
              <span className="font-black text-[var(--text-primary)]">{event.actual}</span>
            </div>
          )}
          {event.expected && (
            <div>
              <span className="text-[var(--text-secondary)]">예상치 </span>
              <span className="font-bold text-[var(--text-primary)]">{event.expected}</span>
            </div>
          )}
          {event.previous && (
            <div>
              <span className="text-[var(--text-secondary)]">이전 </span>
              <span className="font-bold text-[var(--text-primary)]">{event.previous}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function MarketCalendarSection() {
  const MIN_MONTH_VAL = 2026 * 12 + 5;  // 2026 June
  const MAX_MONTH_VAL = 2026 * 12 + 11; // 2026 Dec

  // 매일 오늘 날짜로 자동 동적 세팅 (접속 당일 기준)
  const todayObj = new Date();
  const TODAY_STR = `${todayObj.getFullYear()}-${String(todayObj.getMonth() + 1).padStart(2, '0')}-${String(todayObj.getDate()).padStart(2, '0')}`;

  const [currentYear, setCurrentYear] = useState(todayObj.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(todayObj.getMonth()); // 0-indexed
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('전체');
  const [regionFilter, setRegionFilter] = useState<RegionFilter>('전체');
  const [importanceFilter, setImportanceFilter] = useState<ImportanceFilter>('전체');
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(CALENDAR_EVENTS);
  const feedScrollRef = useRef<HTMLDivElement>(null);

  // Supabase 클라우드 캐시에서 최신 동기화된 캘린더 이벤트 비동기 로드
  useEffect(() => {
    fetch(`/api/market/daily?t=${Date.now()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.calendarEvents) && data.calendarEvents.length > 0) {
          setCalendarEvents(data.calendarEvents);
        }
      })
      .catch((err) => {
        console.warn('Calendar events fetch fallback to static:', err);
      });
  }, []);

  const currentVal = currentYear * 12 + currentMonth;
  const canGoPrev = currentVal > MIN_MONTH_VAL;
  const canGoNext = currentVal < MAX_MONTH_VAL;

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  // Group events by date
  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    calendarEvents.forEach((e) => {
      if (!map[e.date]) map[e.date] = [];
      map[e.date].push(e);
    });
    return map;
  }, [calendarEvents]);

  // Apply filters
  const filterEvents = (events: CalendarEvent[]) => {
    return events.filter((e) => {
      const catOk =
        categoryFilter === '전체' ||
        (categoryFilter === '경제지표' && e.type === 'economic') ||
        (categoryFilter === '실적' && e.type === 'earnings');
      const regionOk =
        regionFilter === '전체' ||
        (regionFilter === '국내' && e.region === 'kr') ||
        (regionFilter === '해외' && e.region === 'us');
      const importanceOk =
        importanceFilter === '전체' ||
        (importanceFilter === '★' && e.importance === 1) ||
        (importanceFilter === '★★' && e.importance === 2) ||
        (importanceFilter === '★★★' && e.importance === 3);
      return catOk && regionOk && importanceOk;
    });
  };

  // Toss-style Continuous Feed: 과거 6월부터 연말까지 전체 일정을 정렬하여 제공 (타임라인 항상 보존)
  const displayedEvents = useMemo(() => {
    return filterEvents([...calendarEvents]).sort((a, b) => a.date.localeCompare(b.date));
  }, [calendarEvents, categoryFilter, regionFilter, importanceFilter]);

  // 페이지 마운트 시, 덜컹거리는 지연 애니메이션 없이 즉시 오늘 날짜 이벤트 위치로 바로 고정
  useEffect(() => {
    if (selectedDate) return;
    const container = feedScrollRef.current;
    if (!container) return;
    const todayEl = container.querySelector('[data-anchor-today="true"]') as HTMLElement;
    if (todayEl) {
      const containerRect = container.getBoundingClientRect();
      const targetRect = todayEl.getBoundingClientRect();
      const targetTop = container.scrollTop + (targetRect.top - containerRect.top) - 16;
      container.scrollTop = Math.max(0, targetTop);
    }
  }, [selectedDate, displayedEvents]);

  const prevMonth = () => {
    if (!canGoPrev) return;
    if (currentMonth === 0) {
      setCurrentYear((y) => y - 1);
      setCurrentMonth(11);
    } else setCurrentMonth((m) => m - 1);
    setSelectedDate(null);
  };

  const nextMonth = () => {
    if (!canGoNext) return;
    if (currentMonth === 11) {
      setCurrentYear((y) => y + 1);
      setCurrentMonth(0);
    } else setCurrentMonth((m) => m + 1);
    setSelectedDate(null);
  };

  const MONTH_KR = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

  // 오늘 이후 첫 번째 이벤트 인덱스 (초기 스크롤 타깃)
  const firstUpcomingIdx = displayedEvents.findIndex((e) => e.date >= TODAY_STR);

  return (
    <div className="flex flex-col gap-4">

      {/* ── Filter Row: High-Grade Sliding Capsule Segmented Controls ── */}
      <RevealOnScroll delayIndex={0}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <div className="text-[11px] text-[var(--text-secondary)] mb-1 font-semibold">종류</div>
            <PillToggle<CategoryFilter>
              options={['전체', '경제지표', '실적']}
              value={categoryFilter}
              onChange={setCategoryFilter}
            />
          </div>
          <div>
            <div className="text-[11px] text-[var(--text-secondary)] mb-1 font-semibold">지역</div>
            <PillToggle<RegionFilter>
              options={['전체', '국내', '해외']}
              value={regionFilter}
              onChange={setRegionFilter}
            />
          </div>
          <div>
            <div className="text-[11px] text-[var(--text-secondary)] mb-1 font-semibold">중요도</div>
            <PillToggle<ImportanceFilter>
              options={['전체', '★', '★★', '★★★']}
              value={importanceFilter}
              onChange={setImportanceFilter}
            />
          </div>
        </div>
      </RevealOnScroll>

      {/* ── Top Section: 캘린더 (좌/상) + 핵심 체크포인트 (우/상) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* 캘린더 카드 (7 cols on desktop) */}
        <RevealOnScroll delayIndex={1} className="lg:col-span-7 flex flex-col h-full">
        <div className="flex-1 flex flex-col rounded-3xl p-5 sm:p-6 bg-[var(--card-surface)] border border-[var(--border-color)]/90 shadow-2xs">
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
              {currentYear}년 {MONTH_KR[currentMonth]}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={prevMonth}
                disabled={!canGoPrev}
                aria-label="이전 달"
                className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--accent-orange)] hover:bg-[var(--accent-orange)]/10 transition-colors disabled:opacity-20 disabled:hover:bg-transparent disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextMonth}
                disabled={!canGoNext}
                aria-label="다음 달"
                className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--accent-orange)] hover:bg-[var(--accent-orange)]/10 transition-colors disabled:opacity-20 disabled:hover:bg-transparent disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 mb-2">
            {WEEKDAYS.map((d) => (
              <div 
                key={d} 
                className="text-center text-xs font-semibold py-1 text-[var(--text-secondary)]/70"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7 gap-y-2 flex-1 items-center">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const hasEvent = !!eventsByDate[dateStr]?.length;
              const isSelected = selectedDate === dateStr;
              const isToday = dateStr === TODAY_STR;

              const scrollToElement = (target: HTMLElement) => {
                const container = feedScrollRef.current;
                if (!container) return;
                const containerRect = container.getBoundingClientRect();
                const targetRect = target.getBoundingClientRect();
                const targetTop = container.scrollTop + (targetRect.top - containerRect.top) - 16;
                container.scrollTo({
                  top: Math.max(0, targetTop),
                  behavior: 'smooth',
                });
              };

              const handleDayClick = () => {
                if (isSelected) {
                  setSelectedDate(null);
                  return;
                }
                setSelectedDate(dateStr);
                const container = feedScrollRef.current;
                if (!container) return;
                const targetEl = container.querySelector(`[data-feed-date="${dateStr}"]`) as HTMLElement;
                if (targetEl) {
                  scrollToElement(targetEl);
                } else {
                  const allCards = Array.from(container.querySelectorAll('[data-feed-date]')) as HTMLElement[];
                  const nextCard = allCards.find((el) => (el.getAttribute('data-feed-date') ?? '') >= dateStr);
                  if (nextCard) {
                    scrollToElement(nextCard);
                  }
                }
              };

              return (
                <div key={dateStr} className="flex flex-col items-center relative py-1">
                  <button
                    onClick={handleDayClick}
                    className={`relative w-9 h-9 sm:w-10 sm:h-10 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer flex flex-col items-center justify-center ${
                      isSelected
                        ? 'bg-[var(--accent-orange)] text-white font-black shadow-[0_0_14px_rgba(241,143,1,0.5)] ring-2 ring-[var(--accent-orange)]'
                        : isToday
                        ? 'text-[var(--accent-orange)] font-black bg-[var(--accent-orange)]/10 ring-2 ring-[var(--accent-orange)]'
                        : hasEvent
                        ? 'text-[var(--text-primary)] font-bold hover:bg-[var(--bg-main)]'
                        : 'text-[var(--text-secondary)]/35 font-normal hover:bg-[var(--bg-main)]'
                    }`}
                  >
                    <span>{day}</span>
                    {hasEvent && !isSelected && (
                      <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[var(--accent-orange)]/80" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
        </RevealOnScroll>

        {/* 핵심 체크포인트 위젯 (5 cols on desktop, 모바일에서도 온전히 노출) */}
        <RevealOnScroll delayIndex={2} className="lg:col-span-5 flex flex-col h-full">
        <div className="flex-1 flex flex-col justify-between p-5 sm:p-6 rounded-3xl bg-[var(--card-surface)] border border-[var(--border-color)]/90 shadow-2xs">
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <span className="text-xs sm:text-sm font-extrabold text-[var(--accent-orange)] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>핵심 체크포인트</span>
              </span>
              <span className="text-[10px] text-[var(--text-secondary)] font-mono px-2 py-0.5 rounded-full bg-[var(--bg-main)] border border-[var(--border-color)]/60">
                Top 3
              </span>
            </div>

            <p className="text-xs text-[var(--text-secondary)] mb-3 leading-relaxed break-keep">
              놓치지 말아야 할 시장의 핵심 지표와 실적 발표 일정이에요.
            </p>

            <div className="space-y-2.5">
              {(() => {
                // 다가올 일정 우선 선별 (오늘 이후 중요도 3 일정)
                const upcomingKeyEvents = displayedEvents.filter((e) => e.importance === 3 && e.date >= TODAY_STR);
                // 모자라면 최근 중요도 3 일정으로 보충
                const pastKeyEvents = displayedEvents.filter((e) => e.importance === 3 && e.date < TODAY_STR).reverse();
                const keyEvents = [...upcomingKeyEvents, ...pastKeyEvents].slice(0, 3);

                return keyEvents.map((keyEv) => {
                  const isUpcoming = keyEv.date >= TODAY_STR;
                  return (
                    <button
                      key={keyEv.id}
                      type="button"
                      onClick={() => {
                        setSelectedDate(keyEv.date);
                        const container = feedScrollRef.current;
                        if (!container) return;
                        const targetEl = container.querySelector(`[data-feed-date="${keyEv.date}"]`) as HTMLElement;
                        if (targetEl) {
                          const containerRect = container.getBoundingClientRect();
                          const targetRect = targetEl.getBoundingClientRect();
                          const targetTop = container.scrollTop + (targetRect.top - containerRect.top) - 16;
                          container.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' });
                        }
                      }}
                      className="w-full text-left p-3 rounded-2xl bg-[var(--bg-main)]/80 hover:bg-[var(--card-hover)] border border-[var(--border-color)]/80 hover:border-[var(--accent-orange)]/50 hover:shadow-[0_0_14px_rgba(241,143,1,0.15)] transition-all cursor-pointer group space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="font-bold text-[var(--accent-orange)]">{keyEv.date.replace(/-/g, '.')}</span>
                        <div className="flex items-center gap-1.5">
                          {isUpcoming ? (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[var(--accent-orange)]/15 text-[var(--accent-orange)]">
                              예정
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-500/15 text-[var(--text-secondary)]">
                              발표완료
                            </span>
                          )}
                          <span className="text-[10px] text-[var(--text-secondary)] font-medium">
                            {keyEv.region === 'kr' ? '국내' : '미국'}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-orange)] transition-colors leading-snug break-keep">
                        {keyEv.title}
                        {keyEv.ticker && <span className="ml-1 text-xs font-mono text-[var(--accent-orange)]">({keyEv.ticker})</span>}
                      </p>
                    </button>
                  );
                });
              })()}
            </div>
          </div>
        </div>
        </RevealOnScroll>
      </div>

      {/* ── Bottom Section: 전체 일정 및 지표 피드 (Apple-style High Density Surface & Smooth Gradient Mask) ── */}
      <RevealOnScroll delayIndex={3}>
      <div className="relative w-full rounded-3xl p-5 sm:p-6 bg-[var(--card-surface)] border border-[var(--border-color)]/90 shadow-2xs">
        <SmoothHeight>
          {displayedEvents.length > 0 ? (
            <div 
              ref={feedScrollRef}
              className="max-h-[600px] overflow-y-auto pr-1 space-y-3.5 overscroll-contain [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-1"
              style={{
                maskImage: 'linear-gradient(to bottom, transparent 0%, black 20px, black calc(100% - 24px), transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 20px, black calc(100% - 24px), transparent 100%)',
              }}
            >
              {displayedEvents.map((ev, idx) => {
                const isPast = ev.date < TODAY_STR;
                const isAnchor = idx === (firstUpcomingIdx >= 0 ? firstUpcomingIdx : 0);
                const isDateSelected = ev.date === selectedDate;

                return (
                  <div 
                    key={ev.id}
                    data-feed-date={ev.date}
                    data-anchor-today={isAnchor ? 'true' : undefined}
                    className={`transition-all duration-300 rounded-2xl ${
                      isDateSelected ? 'ring-2 ring-[var(--accent-orange)]/60 p-1 bg-[var(--accent-orange)]/5' : ''
                    }`}
                  >
                    <RevealOnScroll delayIndex={Math.min(idx, 3)}>
                      <div className="text-xs font-mono font-semibold text-[var(--text-secondary)] mb-1 pl-1 flex items-center justify-between">
                        <span className={ev.date === TODAY_STR ? 'text-[var(--accent-orange)] font-black' : isDateSelected ? 'text-[var(--accent-orange)] font-bold' : ''}>
                          {ev.date.replace(/-/g, '.')}
                        </span>
                        <span className="text-[10px] text-[var(--text-secondary)]/70 uppercase">
                          {ev.region === 'kr' ? '국내' : '미국/해외'}
                        </span>
                      </div>
                      <div className={isPast ? 'opacity-65 hover:opacity-100 transition-opacity' : ''}>
                        <EventCard event={ev} />
                      </div>
                    </RevealOnScroll>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 text-sm text-[var(--text-secondary)]">
              선택한 조건에 해당하는 일정이 없어요.
            </div>
          )}
        </SmoothHeight>
      </div>
      </RevealOnScroll>
    </div>
  );
}
