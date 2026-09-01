import Accordion from '@/components/Accordion';
import BrokerBenefitBanner from '@/components/BrokerBenefitBanner';
import { CURRICULUM_DATA } from '@/data/curriculum';

export default function HomePage() {

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* De-boxed Clean Minimal Hero Banner with responsive Right-aligned / Mobile inline Benefit Banner */}
      <div className="py-2 px-1 flex flex-col sm:flex-row sm:items-end justify-between gap-3 min-h-[58px]">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
            커리큘럼
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium">
            초보자도 쉽게 따라 하는 단계별 주식 강의입니다.
          </p>
        </div>
        
        {/* 배너: 데스크톱에서는 우측 상단 여백에 플로팅, 모바일에서는 하단 인라인 */}
        <div className="shrink-0 flex sm:justify-end">
          <BrokerBenefitBanner />
        </div>
      </div>

      {/* Main Curriculum Accordion Section */}
      <section className="space-y-4">
        <Accordion levels={CURRICULUM_DATA} />
      </section>
    </div>
  );
}
