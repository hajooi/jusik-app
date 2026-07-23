import { getLessonById, getAllLessons } from '@/data/curriculum';
import SidebarDrawer from '@/components/SidebarDrawer';
import VideoCoverPlayer from '@/components/VideoCoverPlayer';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { 
  ArrowLeft, 
  ArrowRight, 
  Award, 
  Clock, 
  BookOpen, 
  CheckCircle2, 
  Sparkles, 
  Calculator, 
  Copy, 
  ExternalLink,
  HelpCircle
} from 'lucide-react';

export async function generateStaticParams() {
  const lessons = getAllLessons();
  return lessons.map((lesson) => ({
    id: lesson.id,
  }));
}

export default function LessonDetailPage({ params }: { params: { id: string } }) {
  const data = getLessonById(params.id);

  if (!data) {
    notFound();
  }

  const { lesson, level } = data;
  const allLessons = getAllLessons();
  const currentIndex = allLessons.findIndex((l) => l.id === lesson.id);

  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      
      {/* Top Navigation Bar: [Left] Entire Menu Drawer Trigger | [Right] Return to Home */}
      <div className="flex items-center justify-between gap-3 text-xs sm:text-sm">
        <SidebarDrawer currentLessonId={lesson.id} />

        <Link 
          href="/" 
          className="inline-flex items-center gap-1.5 font-bold text-[var(--text-secondary)] hover:text-[var(--accent-orange)] transition-colors bg-[var(--card-surface)]/90 backdrop-blur-md px-3.5 py-2 rounded-full shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" />
          홈으로 돌아가기
        </Link>
      </div>

      <div className="space-y-6">
        {/* Main Content Column */}
        <div className="space-y-6 min-w-0">
          
          {/* Header Info */}
          <div className="space-y-2 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-[var(--accent-green)]/15 text-[var(--accent-green)] font-mono">
                Lv. {level.levelNumber} - {level.badgeText}
              </span>
              <span className="flex items-center gap-1 text-xs text-[var(--text-secondary)] bg-[var(--card-surface)]/90 backdrop-blur-md px-2.5 py-1 rounded-full font-mono shadow-2xs">
                <Clock className="w-3.5 h-3.5" />
                {lesson.duration}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
              {lesson.title}
            </h1>
            {lesson.subtitle && (
              <p className="text-sm sm:text-base text-[var(--text-secondary)] font-medium">
                {lesson.subtitle}
              </p>
            )}
          </div>

          {/* TOP: M3 Styled Interactive YouTube Video Cover & Player */}
          <VideoCoverPlayer
            youtubeId={lesson.youtubeId}
            title={lesson.title}
            duration={lesson.duration}
            iconName={level.iconName}
          />

          {/* BODY: Lesson Summary Section */}
          <div className="bg-[var(--card-surface)]/90 backdrop-blur-md p-6 rounded-3xl space-y-3.5 shadow-md">
            <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[var(--accent-green)]" />
              핵심 요약
            </h3>
            <ul className="space-y-2.5 text-sm text-[var(--text-primary)]">
              {lesson.summary.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[var(--accent-green)] shrink-0 mt-0.5" />
                  <span className="leading-relaxed font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Visual Diagram & Concept Explanation Section */}
          {lesson.id === 'lv0-1' && (
            <div className="bg-[var(--card-surface)]/90 backdrop-blur-md p-6 rounded-3xl space-y-4 shadow-md border border-[var(--border-color)]">
              <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[var(--accent-orange)]" />
                핵심 구조 도식: 노동소득 ➔ 자본소득 시스템
              </h3>
              
              {/* Flowchart Diagram */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center my-2">
                <div className="bg-[var(--bg-main)] p-4 rounded-2xl border border-[var(--border-color)]/60 space-y-1">
                  <div className="text-xs font-mono text-[var(--text-secondary)] font-bold">1단계</div>
                  <div className="text-sm font-bold text-[var(--text-primary)]">월급 (노동소득)</div>
                  <div className="text-[11px] text-[var(--text-secondary)]">시간과 노동 교환</div>
                </div>
                <div className="bg-[var(--accent-orange)]/10 p-4 rounded-2xl border border-[var(--accent-orange)]/30 space-y-1 flex flex-col justify-center items-center">
                  <div className="text-xs font-mono text-[var(--accent-orange)] font-bold">2단계 ➔ 자동 적립</div>
                  <div className="text-sm font-bold text-[var(--text-primary)]">우량 주식/지분 매수</div>
                  <div className="text-[11px] text-[var(--accent-orange)] font-medium">자본 시스템 구축</div>
                </div>
                <div className="bg-[var(--accent-green)]/10 p-4 rounded-2xl border border-[var(--accent-green)]/30 space-y-1">
                  <div className="text-xs font-mono text-[var(--accent-green)] font-bold">3단계</div>
                  <div className="text-sm font-bold text-[var(--text-primary)]">배당 & 복리 성장</div>
                  <div className="text-[11px] text-[var(--accent-green)] font-medium">자본소득 극대화</div>
                </div>
              </div>

              {/* Detailed Text Explanation */}
              <div className="bg-[var(--bg-main)] p-4.5 rounded-2xl space-y-2 text-xs sm:text-sm text-[var(--text-primary)] leading-relaxed font-medium">
                <p>
                  💡 <strong>왜 무조건 주식 투자인가?</strong><br />
                  단순히 월급을 모으는 노동 소득만으로는 매년 발생하는 물가상승률(인플레이션)과 자산 인플레이션을 따라잡기 힘듭니다.
                </p>
                <p>
                  우량 기업의 주식을 소액부터 지속적으로 모아나감으로써 <strong>내가 잘 때도 일하는 자본소득 메커니즘</strong>을 완성해야 합니다.
                </p>
              </div>
            </div>
          )}

          {lesson.id === 'lv0-2' && (
            <div className="bg-[var(--card-surface)]/90 backdrop-blur-md p-6 rounded-3xl space-y-4 shadow-md border border-[var(--border-color)]">
              <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[var(--accent-orange)]" />
                핵심 구조 도식: 단리 vs 복리와 시간의 효과
              </h3>
              
              {/* Flowchart / Comparison Diagram */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2">
                <div className="bg-[var(--bg-main)] p-4 rounded-2xl border border-[var(--border-color)]/60 space-y-1">
                  <div className="text-xs font-bold text-[var(--text-secondary)]">단리 (일반 저축)</div>
                  <div className="text-lg font-black text-[var(--text-secondary)] font-mono">원금 + 이자</div>
                  <p className="text-xs text-[var(--text-secondary)]">시간이 흘러도 수익 증가폭이 일정함 (직선형)</p>
                </div>
                <div className="bg-[var(--accent-orange)]/10 p-4 rounded-2xl border border-[var(--accent-orange)]/30 space-y-1">
                  <div className="text-xs font-bold text-[var(--accent-orange)]">복리 (주식 적립) 🚀</div>
                  <div className="text-lg font-black text-[var(--accent-orange)] font-mono">(원금+이자) × 이자</div>
                  <p className="text-xs text-[var(--text-primary)] font-medium">시간이 지날수록 기하급수적으로 폭발 (지수 곡선)</p>
                </div>
              </div>

              {/* Detailed Text Explanation */}
              <div className="bg-[var(--bg-main)] p-4.5 rounded-2xl space-y-2 text-xs sm:text-sm text-[var(--text-primary)] leading-relaxed font-medium">
                <p>
                  📈 <strong>시간 프리미엄의 힘 (Snowball Effect)</strong><br />
                  아인슈타인이 인류의 8대 불가사의로 꼽은 복리는 시간이 결합될 때 비로소 거대한 눈덩이가 됩니다.
                </p>
                <p>
                  10년 먼저 시작한 소액 적립식 투자자가 10년 뒤 거액을 투자한 사람보다 훨씬 높은 최종 수익을 달성하는 원천입니다.
                </p>
              </div>
            </div>
          )}

          {lesson.id === 'lv0-3' && (
            <div className="bg-[var(--card-surface)]/90 backdrop-blur-md p-6 rounded-3xl space-y-4 shadow-md border border-[var(--border-color)]">
              <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[var(--accent-orange)]" />
                핵심 구조 도식: 주식부엉 멘탈 3단계 철학
              </h3>
              
              {/* Flowchart Diagram */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center my-2">
                <div className="bg-[var(--bg-main)] p-4 rounded-2xl border border-[var(--border-color)]/60 space-y-1">
                  <div className="text-xs font-mono text-[var(--text-secondary)] font-bold">STEP 1</div>
                  <div className="text-sm font-bold text-[var(--text-primary)]">단기 소음 차단</div>
                  <div className="text-[11px] text-[var(--text-secondary)]">주가 등락에 일희일비 금지</div>
                </div>
                <div className="bg-[var(--accent-orange)]/10 p-4 rounded-2xl border border-[var(--accent-orange)]/30 space-y-1">
                  <div className="text-xs font-mono text-[var(--accent-orange)] font-bold">STEP 2</div>
                  <div className="text-sm font-bold text-[var(--text-primary)]">기계적 원칙 매수</div>
                  <div className="text-[11px] text-[var(--accent-orange)] font-medium">공포 시 세일 기회로 인식</div>
                </div>
                <div className="bg-[var(--accent-green)]/10 p-4 rounded-2xl border border-[var(--accent-green)]/30 space-y-1">
                  <div className="text-xs font-mono text-[var(--accent-green)] font-bold">STEP 3</div>
                  <div className="text-sm font-bold text-[var(--text-primary)]">동반 성장의 믿음</div>
                  <div className="text-[11px] text-[var(--accent-green)] font-medium">장기 승리 확신</div>
                </div>
              </div>

              {/* Detailed Text Explanation */}
              <div className="bg-[var(--bg-main)] p-4.5 rounded-2xl space-y-2 text-xs sm:text-sm text-[var(--text-primary)] leading-relaxed font-medium">
                <p>
                  🧠 <strong>흔들리지 않는 굳건한 마인드셋</strong><br />
                  주식 투자에서 돈을 버는 것은 현란한 트레이딩 기술이 아니라 시장의 변동성을 버텨내는 멘탈입니다.
                </p>
                <p>
                  대중이 공포에 휩쓸려 매도할 때 원칙에 따라 우량주를 모아가는 찰리 멍거와 워렌 버핏의 굳건한 투자 철학을 이식합니다.
                </p>
              </div>
            </div>
          )}

          {/* Interactive Tools Module based on Lesson Type */}
          {lesson.interactiveToolType === 'db_cta' && (
            <div className="bg-[var(--card-surface)]/90 backdrop-blur-md p-6 rounded-3xl space-y-3 shadow-md">
              <div className="flex items-center gap-3">
                <Award className="w-5 h-5 text-[var(--accent-orange)]" />
                <div>
                  <h4 className="text-base font-bold text-[var(--text-primary)]">DB증권 계좌 개설 안내</h4>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    실습을 위한 DB증권 비대면 계좌 개설 가이드입니다.
                  </p>
                </div>
              </div>
              <a
                href="https://www.db-fi.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 text-xs font-bold bg-[var(--accent-orange)] hover:opacity-90 text-white px-4 py-2.5 rounded-full transition-all shadow-xs"
              >
                DB증권 계좌 개설 페이지 방문
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {lesson.interactiveToolType === 'mbti_test' && (
            <div className="bg-[var(--card-surface)]/90 backdrop-blur-md p-6 rounded-3xl space-y-3 shadow-md">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[var(--accent-orange)]" />
                <div>
                  <h4 className="text-base font-bold text-[var(--text-primary)]">투자 성향 진단 모듈</h4>
                  <p className="text-xs text-[var(--text-secondary)]">자산배분 비율 선정을 위한 간단 진단입니다.</p>
                </div>
              </div>
              <div className="bg-[var(--bg-main)] p-4 rounded-2xl space-y-3">
                <p className="text-xs font-semibold text-[var(--text-primary)]">Q. 증시가 20% 하락했을 때 당신의 행동은?</p>
                <div className="space-y-2 text-xs">
                  <button className="w-full text-left p-3 rounded-xl bg-[var(--card-surface)] hover:bg-[var(--card-hover)] transition-colors font-medium">
                    A. 분할 매수 기회로 판단한다
                  </button>
                  <button className="w-full text-left p-3 rounded-xl bg-[var(--card-surface)] hover:bg-[var(--card-hover)] transition-colors font-medium">
                    B. 안정 자산 비중을 늘린다
                  </button>
                </div>
              </div>
            </div>
          )}

          {lesson.interactiveToolType === 'calc' && (
            <div className="bg-[var(--card-surface)]/90 backdrop-blur-md p-6 rounded-3xl space-y-3 shadow-md">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-[var(--accent-green)]" />
                <div>
                  <h4 className="text-base font-bold text-[var(--text-primary)]">리밸런싱 계산기</h4>
                  <p className="text-xs text-[var(--text-secondary)]">목표 비중 계산을 위한 수량 산출 도구입니다.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <input 
                  type="number" 
                  placeholder="현재 총 자산 (원)" 
                  className="p-3 rounded-xl bg-[var(--bg-main)] text-[var(--text-primary)] focus:outline-none border border-[var(--border-color)]/50"
                />
                <input 
                  type="number" 
                  placeholder="목표 주식 비중 (%)" 
                  className="p-3 rounded-xl bg-[var(--bg-main)] text-[var(--text-primary)] focus:outline-none border border-[var(--border-color)]/50"
                />
              </div>
            </div>
          )}

          {lesson.interactiveToolType === 'ai_prompt' && (
            <div className="bg-[var(--card-surface)]/90 backdrop-blur-md p-6 rounded-3xl space-y-3 shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[var(--accent-orange)]" />
                  <h4 className="text-base font-bold text-[var(--text-primary)]">AI 분석 프롬프트</h4>
                </div>
                <button className="flex items-center gap-1.5 text-xs font-bold bg-[var(--accent-orange)] text-white px-3.5 py-1.5 rounded-full hover:opacity-90 transition-opacity">
                  <Copy className="w-3.5 h-3.5" />
                  복사하기
                </button>
              </div>
              <pre className="bg-[#1f2421] text-neutral-200 p-4 rounded-2xl text-xs overflow-x-auto whitespace-pre-wrap font-mono">
                {`[AI 주식 분석 지시문]
다음 기업 재무 데이터를 바탕으로 분석을 실행하십시오:
1. 지난 3년간 ROE 및 영업이익률 추이
2. 주요 공시사항 요약
3. 장기 투자 리스크 요인 2가지`}
              </pre>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {prevLesson ? (
                <Link
                  href={`/lesson/${prevLesson.id}`}
                  className="flex items-center gap-3 p-4 rounded-2xl bg-[#EBE2CD] dark:bg-[#464646] hover:bg-[#E2D7BE] dark:hover:bg-[#5F5F5F] border border-[var(--border-color)] transition-all duration-300 text-left group shadow-2xs hover:shadow-xs active:scale-[0.98]"
                >
                  <ArrowLeft className="w-4 h-4 text-[var(--text-secondary)] group-hover:-translate-x-1 transition-transform" />
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold text-[var(--text-secondary)] block">이전 강의</span>
                    <span className="text-xs sm:text-sm font-bold text-[var(--text-primary)] truncate block">
                      {prevLesson.title}
                    </span>
                  </div>
                </Link>
              ) : (
                <div className="p-4 rounded-2xl bg-[#EBE2CD]/50 dark:bg-[#464646]/50 border border-[var(--border-color)]/50 text-[var(--text-secondary)] text-xs flex items-center">
                  첫 번째 강의입니다.
                </div>
              )}

              {nextLesson ? (
                <Link
                  href={`/lesson/${nextLesson.id}`}
                  className="flex items-center justify-between p-4 rounded-2xl bg-[#EBE2CD] dark:bg-[#464646] hover:bg-[#E2D7BE] dark:hover:bg-[#5F5F5F] border border-[var(--border-color)] hover:border-[var(--accent-orange)]/80 transition-all duration-300 text-right group shadow-2xs hover:shadow-md active:scale-[0.98]"
                >
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold text-[var(--accent-orange)] block">다음 강의</span>
                    <span className="text-xs sm:text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-orange)] transition-colors truncate block">
                      {nextLesson.title}
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[var(--bg-main)] group-hover:bg-[var(--accent-orange)]/20 flex items-center justify-center shrink-0 ml-2 group-hover:translate-x-1 transition-all">
                    <ArrowRight className="w-4 h-4 text-[var(--accent-orange)]" />
                  </div>
                </Link>
              ) : (
                <div className="p-4 rounded-2xl bg-[#EBE2CD]/50 dark:bg-[#464646]/50 border border-[var(--border-color)]/50 text-[var(--text-secondary)] text-xs flex items-center justify-end">
                  마지막 강의입니다.
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
