import Accordion from '@/components/Accordion';
import { CURRICULUM_DATA } from '@/data/curriculum';

export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Consistent Animated Dynamic AI Gradient Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden p-6 sm:p-8 animated-mesh-bg shadow-sm">
        <div className="relative z-10 flex flex-col gap-1">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--text-primary)]">
              커리큘럼
            </h1>
            <span className="text-xs font-mono font-bold bg-[var(--card-surface)] px-3.5 py-1.5 rounded-full text-[var(--text-primary)] shrink-0">
              총 18개 강좌
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium mt-1">
            초보자도 쉽게 따라 하는 단계별 주식 강의입니다.
          </p>
        </div>
      </div>

      {/* Main Curriculum Accordion Section */}
      <section className="space-y-4">
        <Accordion levels={CURRICULUM_DATA} />
      </section>
    </div>
  );
}
