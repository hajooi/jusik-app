'use client';

import React from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-[#09090b] text-[#f8fafc] flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full p-8 rounded-3xl bg-[#18181b] border border-white/10 text-center space-y-6 shadow-2xl">
          <h2 className="text-2xl font-black text-white">
            시스템 오류가 발생했습니다
          </h2>
          <p className="text-sm text-zinc-400">
            애플리케이션 구동 중 치명적인 문제가 발생했습니다. 아래 버튼을 눌러 다시 시도해 주세요.
          </p>
          <button
            onClick={() => reset()}
            className="w-full py-3 px-4 rounded-xl bg-[#f18f01] hover:bg-[#d97706] text-white font-bold text-sm transition-all"
          >
            다시 시도
          </button>
        </div>
      </body>
    </html>
  );
}
