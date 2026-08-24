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
  const [height, setHeight] = useState<number | undefined>(undefined);
  const isFirstRender = useRef(true);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const newHeight = Math.round(entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height);
        if (isFirstRender.current) {
          isFirstRender.current = false;
          if (!animateInitial) {
            setHeight(newHeight);
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
        height: height !== undefined ? `${height}px` : 'auto',
        transition: `height ${duration}ms cubic-bezier(0.16, 1, 0.3, 1)`,
        overflow: 'hidden',
      }}
      className={`will-change-[height] ${className}`}
    >
      <div ref={contentRef}>{children}</div>
    </div>
  );
}
