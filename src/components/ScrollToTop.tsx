'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    // Disable browser auto scroll restoration if present
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    const resetScroll = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    // Execute immediately
    resetScroll();

    // Execute on next animation frame and after micro-tick (overrides Chrome SPA scroll-restoration lock)
    const rafId = requestAnimationFrame(() => {
      resetScroll();
      setTimeout(resetScroll, 10);
      setTimeout(resetScroll, 50);
    });

    return () => cancelAnimationFrame(rafId);
  }, [pathname]);

  return null;
}
