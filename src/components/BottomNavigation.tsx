'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Wrench } from 'lucide-react';

export default function BottomNavigation() {
  const pathname = usePathname();

  const navItems = [
    {
      label: '커리큘럼',
      href: '/',
      icon: BookOpen,
      exact: true,
    },
    {
      label: '투자도구',
      href: '/tools',
      icon: Wrench,
      exact: false,
    },
  ];

  // Active tab index for animated sliding pill effect
  const activeIndex = navItems.findIndex((item) => 
    item.exact ? (pathname === item.href || pathname.startsWith('/lesson/')) : pathname.startsWith(item.href)
  );

  return (
    <div className="fixed bottom-4 inset-x-0 z-[9999] flex justify-center px-3 sm:px-4 pointer-events-none select-none">
      <nav 
        aria-label="하단 내비게이션"
        className="w-full max-w-[260px] xs:max-w-[280px] sm:max-w-[300px] bg-[var(--bg-main)]/95 backdrop-blur-md border border-[var(--border-color)] rounded-full p-1.5 shadow-xl relative overflow-hidden pointer-events-auto"
      >
        <div className="flex items-center justify-around relative">
          {/* Animated Liquid Sliding Pill Highlight with Subtle Glowing Orange Border */}
          {activeIndex !== -1 && (
            <div 
              className="absolute top-0 bottom-0 rounded-full bg-[var(--card-hover)]/80 border border-[rgba(241,143,1,0.45)] shadow-[0_0_12px_rgba(241,143,1,0.22)] transition-transform duration-300 ease-out pointer-events-none"
              style={{
                width: `${100 / navItems.length}%`,
                left: 0,
                transform: `translateX(${activeIndex * 100}%)`,
              }}
            />
          )}

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact 
              ? (pathname === item.href || pathname.startsWith('/lesson/'))
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative z-10 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 px-3 sm:px-4 rounded-full w-full transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'text-[var(--accent-orange)] font-extrabold'
                    : 'text-[var(--text-secondary)] font-medium hover:text-[var(--accent-orange)]'
                }`}
              >
                <Icon 
                  fill="none" 
                  className={`w-4 h-4 transition-all duration-300 ${
                    isActive 
                      ? 'stroke-[2px] text-[var(--accent-orange)] scale-105' 
                      : 'stroke-[1.6px]'
                  }`} 
                />
                <span className="text-xs sm:text-sm tracking-tight font-sans">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
