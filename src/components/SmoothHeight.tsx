'use client';

import React, { useState, useEffect, useRef } from 'react';

interface SmoothHeightProps {
  children: React.ReactNode;
  className?: string;
  duration?: number; // milliseconds (default 320ms)
  easing?: string; // CSS transition timing function
  animateInitial?: boolean;
}

/**
 * Accurately check if children contains genuine renderable content.
 * Correctly handles false, null, undefined, and empty arrays.
 */
function hasValidContent(content: React.ReactNode): boolean {
  if (content === null || content === undefined || typeof content === 'boolean') {
    return false;
  }
  if (Array.isArray(content)) {
    return content.some(hasValidContent);
  }
  return true;
}

/**
 * Apple-grade Pure Dynamic Smooth Height Animator using CSS Grid (0fr <-> 1fr).
 * 100% preserves content during collapse for buttery deceleration right to 0px without sudden snaps.
 */
export default function SmoothHeight({
  children,
  className = '',
  duration = 320,
  easing = 'cubic-bezier(0.2, 0.8, 0.2, 1)',
}: SmoothHeightProps) {
  const hasContent = hasValidContent(children);
  const [renderedContent, setRenderedContent] = useState<React.ReactNode>(hasContent ? children : null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    if (hasContent) {
      setRenderedContent(children);
    } else {
      // Keep displaying previous content during smooth 0fr collapse transition, then unmount cleanly
      timerRef.current = setTimeout(() => {
        setRenderedContent(null);
      }, duration + 80);
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
      className={`will-change-[grid-template-rows,opacity] overflow-hidden ${className}`}
    >
      <div className="overflow-hidden min-h-0 w-full">
        {renderedContent}
      </div>
    </div>
  );
}



