'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { MARKET_SNAPSHOT, WeatherState } from '@/data/marketCalendar';
import SmoothHeight from '@/components/SmoothHeight';
import { Sun, Calendar, BookOpen } from 'lucide-react';

const WeatherBackground = dynamic(
  () => import('@/components/calendar/WeatherBackground'),
  { ssr: false }
);
const MarketWeatherSection = dynamic(
  () => import('@/components/calendar/MarketWeatherSection'),
  { ssr: false }
);
const MarketCalendarSection = dynamic(
  () => import('@/components/calendar/MarketCalendarSection'),
  { ssr: false }
);

type MarketTab = 'today' | 'calendar';

const TABS: Array<{ id: MarketTab; label: string; icon: React.ElementType }> = [
  { id: 'today', label: '오늘의 증시', icon: Sun },
  { id: 'calendar', label: '증시 캘린더', icon: Calendar },
];

export default function MarketRadarPage() {
  const [weatherState, setWeatherState] = useState<WeatherState>(MARKET_SNAPSHOT.weatherState);
  const [currentTab, setCurrentTab] = useState<MarketTab>('today');

  const activeIndex = TABS.findIndex((t) => t.id === currentTab);

  return (
    <div className="relative">
      {/* Full-page fixed weather animation overlay */}
      <WeatherBackground state={weatherState} />

      <div className="relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">

          {/* Page Hero Header - Consistent with /tools/terms and other tool pages */}
          <div className="py-2 px-1 space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
              마켓 인사이트
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium">
              증시 현황부터 주요 증시 일정까지 한눈에 확인해보세요.
            </p>
          </div>

          {/* ── Apple HIG 2-Segmented Pill Controller (Centered with Orange Glow) ── */}
          <div className="flex justify-center w-full">
            <div className="relative grid grid-cols-2 p-1 rounded-full bg-[var(--bg-main)]/90 backdrop-blur-md border border-[var(--border-color)]/90 shadow-2xs w-full max-w-[280px] sm:max-w-[300px]">
              {/* Sliding Animated Indicator with Apple snappy bezier & Ambient Orange Glow */}
              <div
                className="absolute top-1 bottom-1 left-1 rounded-full bg-[var(--card-surface)] border border-[rgba(241,143,1,0.6)] shadow-[0_0_12px_rgba(241,143,1,0.22)] transition-transform duration-300 pointer-events-none"
                style={{
                  width: 'calc((100% - 8px) / 2)',
                  transform: `translateX(${activeIndex * 100}%)`,
                  transitionTimingFunction: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
                }}
              />
              {TABS.map((tab) => {
                const isSelected = currentTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setCurrentTab(tab.id)}
                    className={`relative z-10 w-full flex items-center justify-center py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold transition-colors duration-200 cursor-pointer text-center whitespace-nowrap select-none leading-none ${
                      isSelected
                        ? 'text-[var(--accent-orange)] font-extrabold'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <span className="inline-block text-center">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Tab Content Area with SmoothHeight ── */}
          <SmoothHeight>
            <div className="pb-2">
              {currentTab === 'today' && (
                <section className="space-y-4">
                  <MarketWeatherSection onWeatherChange={setWeatherState} />
                </section>
              )}

              {currentTab === 'calendar' && (
                <section className="space-y-4">
                  <MarketCalendarSection />
                </section>
              )}
            </div>
          </SmoothHeight>

        </div>
      </div>
    </div>
  );
}
