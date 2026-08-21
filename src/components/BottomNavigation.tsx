'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Wrench } from 'lucide-react';

export default function BottomNavigation() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

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

  // Smart Scroll-to-Hide Listener with stable threshold
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const scrollHeight = document.documentElement.scrollHeight;
          const clientHeight = document.documentElement.clientHeight;

          // Always show when near top or bottom
          if (currentScrollY < 60 || currentScrollY + clientHeight >= scrollHeight - 40) {
            setIsVisible(true);
          } else if (currentScrollY > lastScrollY + 12) {
            // Scrolling DOWN -> Hide smoothly
            setIsVisible(false);
          } else if (currentScrollY < lastScrollY - 12) {
            // Scrolling UP -> Show smoothly
            setIsVisible(true);
          }

          setLastScrollY(currentScrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <div 
      className={`fixed bottom-5 sm:bottom-6 inset-x-0 z-40 flex justify-center px-4 select-none transition-transform duration-300 ease-in-out will-change-transform ${
        isVisible ? 'translate-y-0 pointer-events-auto' : 'translate-y-[160%] pointer-events-none'
      }`}
    >
      <nav 
        aria-label="플로팅 내비게이션"
        className="w-auto min-w-[240px] xs:min-w-[260px] sm:min-w-[280px] bg-[var(--card-surface)]/95 backdrop-blur-xl border border-[var(--border-color)] rounded-full p-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.45)] relative overflow-hidden transition-colors"
      >
        <div className="flex items-center justify-around relative">
          {/* Animated Liquid Sliding Pill Highlight with Signature Orange Surface */}
          {activeIndex !== -1 && (
            <div 
              className="absolute top-0 bottom-0 rounded-full bg-[var(--accent-orange)]/15 border border-[var(--accent-orange)]/45 shadow-[0_0_18px_rgba(241,143,1,0.25)] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none"
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
                className={`relative z-10 flex items-center justify-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 px-4 sm:px-5 rounded-full w-full transition-colors duration-200 cursor-pointer ${
                  isActive
                    ? 'text-[var(--accent-orange)] font-black'
                    : 'text-[var(--text-secondary)] font-semibold hover:text-[var(--text-primary)]'
                }`}
              >
                <Icon 
                  className={`w-4 h-4 transition-transform duration-300 ${
                    isActive 
                      ? 'stroke-[2.4px] text-[var(--accent-orange)] scale-110' 
                      : 'stroke-[1.7px]'
                  }`} 
                />
                <span className="text-xs sm:text-sm tracking-tight font-sans select-none">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
