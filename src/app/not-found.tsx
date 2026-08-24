import React from 'react';
import Link from 'next/link';
import { FileQuestion, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="glass-card max-w-md w-full p-8 rounded-3xl border border-[var(--border-color)] space-y-6 shadow-lg">
        <div className="w-16 h-16 rounded-2xl bg-[var(--accent-orange)]/15 text-[var(--accent-orange)] flex items-center justify-center mx-auto">
          <FileQuestion className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">
            페이지를 찾을 수 없습니다
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
            요청하신 주소가 변경되었거나 삭제되었습니다. 홈 화면으로 이동해 주세요.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/"
            className="w-full btn-primary !py-2.5"
          >
            <Home className="w-4 h-4 stroke-[1.7]" />
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
