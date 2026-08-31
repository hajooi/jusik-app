'use client';

import React, { useState, useEffect, useRef } from 'react';

interface SmoothHeightProps {
  children: React.ReactNode;
  className?: string;
  duration?: number; // milliseconds (default 500ms)
  easing?: string; // CSS transition timing function
}

/**
 * Accurately check if children contains genuine renderable content.
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
 * Apple-grade Dynamic Smooth Height Animator.
 * Uses ResizeObserver to continuously track inner content height and smoothly transitions the outer container height.
 */
export default function SmoothHeight({
  children,
  className = '',
  duration = 450,
  easing = 'cubic-bezier(0.2, 0.8, 0.2, 1)',
}: SmoothHeightProps) {
  const hasContent = hasValidContent(children);
  const containerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | 'auto'>('auto');
  const [isInitial, setIsInitial] = useState(true);

  useEffect(() => {
    const innerEl = innerRef.current;
    if (!innerEl) return;

    if (!hasContent) {
      setHeight(0);
      return;
    }

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const measuredHeight = entry.contentRect.height;
        if (measuredHeight > 0) {
          setHeight(measuredHeight);
          if (isInitial) {
            setIsInitial(false);
          }
        }
      }
    });

    observer.observe(innerEl);

    return () => {
      observer.disconnect();
    };
  }, [hasContent, isInitial]);

  return (
    <div
      ref={containerRef}
      style={{
        height: height === 'auto' ? 'auto' : `${height}px`,
        transition: isInitial ? 'none' : `height ${duration}ms ${easing}, opacity ${duration}ms ${easing}`,
        opacity: hasContent ? 1 : 0,
      }}
      className={`overflow-hidden will-change-[height,opacity] ${className}`}
    >
      <div ref={innerRef} className="w-full">
        {children}
      </div>
    </div>
  );
}



