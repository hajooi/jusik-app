'use client';

import React, { useEffect, useState, useRef } from 'react';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export default function AnimatedNumber({
  value,
  duration = 900,
  decimals = 0,
  prefix = '',
  suffix = '',
  className = '',
}: AnimatedNumberProps) {
  const [displayVal, setDisplayVal] = useState<number>(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const prevValRef = useRef<number>(0);
  const isInitialRef = useRef<boolean>(true);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasStarted(true);
        }
      },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!hasStarted) return;

    if (isInitialRef.current) {
      isInitialRef.current = false;
      const start = 0;
      const startTime = performance.now();

      const update = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const current = start + (value - start) * easeProgress;
        setDisplayVal(current);

        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          setDisplayVal(value);
          prevValRef.current = value;
        }
      };

      const handle = requestAnimationFrame(update);
      return () => cancelAnimationFrame(handle);
    } else {
      const start = prevValRef.current;
      const diff = value - start;
      if (Math.abs(diff) < 0.001) {
        setDisplayVal(value);
        return;
      }
      const transitionDuration = 220;
      const startTime = performance.now();

      const update = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / transitionDuration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const current = start + diff * easeProgress;
        setDisplayVal(current);

        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          setDisplayVal(value);
          prevValRef.current = value;
        }
      };

      const handle = requestAnimationFrame(update);
      return () => cancelAnimationFrame(handle);
    }
  }, [value, duration, hasStarted]);

  const formattedNumber = decimals > 0
    ? displayVal.toFixed(decimals)
    : Math.round(displayVal).toLocaleString();

  return (
    <span ref={ref} className={className}>
      {prefix}{formattedNumber}{suffix}
    </span>
  );
}
