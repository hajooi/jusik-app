import { User, CheckCircle2, Bookmark, Flame } from 'lucide-react';

export default function ProfilePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Consistent Animated Dynamic AI Gradient Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden p-6 sm:p-8 animated-mesh-bg border border-[var(--border-color)] shadow-sm">
        <div className="relative z-10 flex flex-col gap-1">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--text-primary)]">
              마이페이지
            </h1>
            <span className="text-xs font-mono font-bold bg-[var(--card-surface)] border border-[var(--border-color)] px-3.5 py-1.5 rounded-full text-[var(--text-primary)] shrink-0 shadow-xs">
              학습 대시보드
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium mt-1">
            내 강의 수강 진도율과 저장된 투자 성향, 나만의 포트폴리오를 한눈에 관리하는 공간입니다.
          </p>
        </div>
      </div>

      {/* User Info Header */}
      <div className="bg-[var(--card-surface)] border border-[var(--border-color)] p-6 rounded-3xl flex items-center gap-4 shadow-xs">
        <div className="w-14 h-14 rounded-2xl bg-[var(--accent-orange)] text-white flex items-center justify-center font-bold text-xl shadow-xs">
          <User className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">게스트 주린이 님</h2>
          <p className="text-xs text-[var(--text-secondary)] font-medium">학습 상태: Lv. 0 마인드셋 진행 중</p>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
        <div className="bg-[var(--card-surface)] border border-[var(--border-color)] p-5 rounded-2xl space-y-1 text-center shadow-xs">
          <span className="text-xs text-[var(--text-secondary)] font-medium">학습 진도율</span>
          <p className="text-2xl font-black text-[var(--accent-orange)]">16%</p>
        </div>
        <div className="bg-[var(--card-surface)] border border-[var(--border-color)] p-5 rounded-2xl space-y-1 text-center shadow-xs">
          <span className="text-xs text-[var(--text-secondary)] font-medium">완료한 강의</span>
          <p className="text-2xl font-black text-[var(--text-primary)]">3 / 18</p>
        </div>
        <div className="bg-[var(--card-surface)] border border-[var(--border-color)] p-5 rounded-2xl space-y-1 text-center col-span-2 sm:col-span-1 shadow-xs">
          <span className="text-xs text-[var(--text-secondary)] font-medium">진단된 투자 성향</span>
          <p className="text-sm font-bold text-[var(--accent-green)] mt-1">올웨더 분할 매수형</p>
        </div>
      </div>
    </div>
  );
}
