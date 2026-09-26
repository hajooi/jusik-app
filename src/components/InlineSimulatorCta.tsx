'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function InlineSimulatorCta() {
  return (
    <div className="pt-1">
      <Link
        href="/tools/simulate"
        className="inline-flex items-center justify-center gap-2 text-xs sm:text-sm font-bold bg-[var(--accent-orange)] hover:brightness-110 hover:shadow-[0_0_18px_rgba(241,143,1,0.35)] active:scale-95 text-white px-5 sm:px-6 py-2.5 rounded-full transition-all shadow-2xs"
      >
        <span>투자 전략 시뮬레이터 실습하기</span>
        <ArrowRight className="w-4 h-4 stroke-[2]" />
      </Link>
    </div>
  );
}
