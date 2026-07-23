'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Wrench, User } from 'lucide-react';

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
      label: '투자 도구',
      href: '/tools',
      icon: Wrench,
      exact: false,
    },
    {
      label: '마이페이지',
      href: '/profile',
      icon: User,
      exact: false,
    },
  ];

  // Active tab index for animated sliding pill effect
  const activeIndex = navItems.findIndex((item) => 
    item.exact ? (pathname === item.href || pathname.startsWith('/lesson/')) : pathname.startsWith(item.href)
  );

  return (
    <div className="fixed bottom-4 inset-x-0 z-50 flex justify-center px-3 sm:px-4 pointer-events-none">
      <nav 
        aria-label="하단 내비게이션"
        className="pointer-events-auto w-full max-w-sm sm:max-w-md bg-[var(--card-surface)]/90 backdrop-blur-xl rounded-full p-1.5 shadow-lg transition-all duration-300 relative overflow-hidden"
      >
        <div className="flex items-center justify-around relative">
          {/* Animated Liquid Sliding Pill Highlight */}
          {activeIndex !== -1 && (
            <div 
              className="absolute top-0 bottom-0 rounded-full bg-[var(--card-hover)] transition-transform duration-300 ease-out shadow-xs pointer-events-none"
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
                className={`relative z-10 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 px-3 sm:px-4 rounded-full w-full transition-colors duration-200 active:scale-95 ${
                  isActive
                    ? 'text-[var(--accent-orange)] font-bold'
                    : 'text-[var(--text-secondary)] font-medium hover:text-[var(--text-primary)]'
                }`}
              >
                <Icon className={`w-4.5 h-4.5 transition-transform duration-300 ${isActive ? 'stroke-[2.5px] text-[var(--accent-orange)] scale-110' : 'stroke-2'}`} />
                <span className="text-xs sm:text-sm tracking-tight">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
