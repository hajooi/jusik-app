import Accordion from '@/components/Accordion';
import { CURRICULUM_DATA } from '@/data/curriculum';

export default function HomePage() {

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* De-boxed Clean Minimal Hero Banner */}
      <div className="py-2 px-1 space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
          커리큘럼
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium">
          초보자도 쉽게 따라 하는 단계별 주식 강의입니다.
        </p>
      </div>

      {/* Main Curriculum Accordion Section */}
      <section className="space-y-4">
        <Accordion levels={CURRICULUM_DATA} />
      </section>
    </div>
  );
}
