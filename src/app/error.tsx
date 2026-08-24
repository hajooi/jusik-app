'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App Router Error:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="glass-card max-w-md w-full p-8 rounded-3xl border border-[var(--border-color)] space-y-6 shadow-lg">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/15 text-[var(--accent-orange)] flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">
            페이지를 불러오지 못했습니다
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
            일시적인 문제가 발생했습니다. 다시 시도하거나 홈 화면으로 이동해 주세요.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="flex-1 btn-primary !py-2.5"
          >
            <RotateCcw className="w-4 h-4 stroke-[1.7]" />
            다시 시도
          </button>
          <Link
            href="/"
            className="flex-1 btn-secondary !py-2.5"
          >
            <Home className="w-4 h-4 stroke-[1.7]" />
            홈으로
          </Link>
        </div>
      </div>
    </div>
  );
}
