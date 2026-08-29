'use client';

import React, { useState, useEffect, useRef } from 'react';

interface SmoothHeightProps {
  children: React.ReactNode;
  className?: string;
  duration?: number; // milliseconds (default 380ms)
  easing?: string; // CSS transition timing function
  animateInitial?: boolean;
}

/**
 * Modern High-Performance Dynamic Height Animator using CSS Grid (0fr <-> 1fr).
 * Preserves child content during collapse so closing is 100% smooth and visible.
 */
export default function SmoothHeight({
  children,
  className = '',
  duration = 380,
  easing = 'cubic-bezier(0.2, 0.8, 0.2, 1)',
}: SmoothHeightProps) {
  const hasContent = Boolean(children && React.Children.count(children) > 0);
  const [renderedContent, setRenderedContent] = useState<React.ReactNode>(children);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    if (hasContent) {
      setRenderedContent(children);
    } else {
      // Keep displaying previous content during collapse transition
      timerRef.current = setTimeout(() => {
        setRenderedContent(null);
      }, duration + 50);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [children, hasContent, duration]);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateRows: hasContent ? '1fr' : '0fr',
        transition: `grid-template-rows ${duration}ms ${easing}, opacity ${duration}ms ${easing}`,
        opacity: hasContent ? 1 : 0,
      }}
      className={`will-change-[grid-template-rows,opacity] ${className}`}
    >
      <div className="overflow-hidden min-h-0">{renderedContent}</div>
    </div>
  );
}
