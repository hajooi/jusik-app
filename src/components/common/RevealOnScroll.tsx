'use client';

import React, { useEffect, useRef, useState } from 'react';

interface RevealOnScrollProps {
  children: React.ReactNode;
  className?: string;
  delayIndex?: number;
}

export default function RevealOnScroll({
  children,
  className = '',
  delayIndex = 0,
}: RevealOnScrollProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.01,
        rootMargin: '50px 0px 50px 0px',
      }
    );

    observer.observe(el);

    // Fallback: If for any reason observer doesn't trigger within 350ms, force visible
    const fallbackTimer = setTimeout(() => {
      setIsVisible(true);
    }, 350);

    const onScroll = () => {
      setHasScrolled(true);
      setIsVisible(true);
    };
    window.addEventListener('scroll', onScroll, { passive: true, once: true });

    return () => {
      clearTimeout(fallbackTimer);
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  // Use stagger delay only on initial page load entrance. Once scrolled, reveal immediately.
  const delayMs = !hasScrolled && delayIndex > 0 ? Math.min(delayIndex * 80, 500) : 0;

  return (
    <div
      ref={ref}
      style={{
        transitionDelay: isVisible ? `${delayMs}ms` : '0ms',
      }}
      className={`${className} transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-[opacity,transform] ${
        isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-6 pointer-events-none'
      }`}
    >
      {children}
    </div>
  );
}
