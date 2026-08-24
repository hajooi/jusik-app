'use client';

import React, { useRef, useState, useEffect } from 'react';

interface SmoothHeightProps {
  children: React.ReactNode;
  className?: string;
  duration?: number; // milliseconds (default 320ms)
  animateInitial?: boolean;
}

/**
 * High-performance, 0-overhead dynamic height animator using native ResizeObserver.
 * Smoothly transitions height whenever child content size changes (e.g. quiz results, tab switches, dynamic text).
 */
export default function SmoothHeight({
  children,
  className = '',
  duration = 320,
  animateInitial = false,
}: SmoothHeightProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | 'auto'>('auto');
  const isFirstRender = useRef(true);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const newHeight = Math.round(entry.contentRect.height);
        if (isFirstRender.current) {
          isFirstRender.current = false;
          if (!animateInitial) {
            setHeight('auto');
            return;
          }
        }
        setHeight(newHeight);
      }
    });

    resizeObserver.observe(el);

    return () => {
      resizeObserver.disconnect();
    };
  }, [animateInitial]);

  return (
    <div
      style={{
        height: height === 'auto' ? 'auto' : `${height}px`,
        transition: height === 'auto' ? 'none' : `height ${duration}ms cubic-bezier(0.16, 1, 0.3, 1)`,
        overflow: 'hidden',
      }}
      className={`will-change-[height] ${className}`}
    >
      <div ref={contentRef}>{children}</div>
    </div>
  );
}
