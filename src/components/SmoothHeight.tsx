'use client';

import React, { useRef, useState, useEffect } from 'react';

interface SmoothHeightProps {
  children: React.ReactNode;
  className?: string;
  duration?: number; // milliseconds (default 550ms)
  easing?: string; // CSS transition timing function (default Apple HIG smooth curve)
  animateInitial?: boolean;
}

/**
 * High-performance, 0-overhead dynamic height animator using native ResizeObserver.
 * Smoothly transitions height whenever child content size changes (e.g. quiz results, tab switches, dynamic text).
 */
export default function SmoothHeight({
  children,
  className = '',
  duration = 550,
  easing = 'cubic-bezier(0.2, 0.8, 0.2, 1)',
  animateInitial = false,
}: SmoothHeightProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | undefined>(undefined);
  const isFirstRender = useRef(true);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const updateHeight = () => {
      const newHeight = el.scrollHeight;
      setHeight(newHeight);
    };

    updateHeight();

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

  // If children is null, undefined or empty boolean, do not render extra spacing
  const hasContent = React.Children.count(children) > 0 && Boolean(children);

  if (!hasContent) return null;

  return (
    <div
      style={{
        height: height !== undefined ? `${height}px` : 'auto',
        transition: `height ${duration}ms ${easing}`,
        overflow: 'hidden',
      }}
      className={`will-change-[height] ${className}`}
    >
      <div ref={contentRef}>{children}</div>
    </div>
  );
}
