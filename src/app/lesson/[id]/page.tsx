import { getLessonById, getAllLessons } from '@/data/curriculum';
import LessonVideoSection from '@/components/LessonVideoSection';
import ClassDetectorQuiz from '@/components/ClassDetectorQuiz';
import WealthComparisonChart from '@/components/WealthComparisonChart';
import CiscoManiaGame from '@/components/CiscoManiaGame';
import BasicTermsQuiz from '@/components/BasicTermsQuiz';
import FeeComparisonBox from '@/components/FeeComparisonBox';
import DcaMotionSimulator from '@/components/DcaMotionSimulator';
import JpMorganTimingBarChart from '@/components/JpMorganTimingBarChart';
import AccountOpenGuide from '@/components/AccountOpenGuide';
import StockTradeGuide from '@/components/StockTradeGuide';
import StockDcaGuide from '@/components/StockDcaGuide';
import CommentSection from '@/components/CommentSection';
import RevealOnScroll from '@/components/common/RevealOnScroll';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { 
  ArrowLeft, 
  ArrowRight, 
  Layers,
  Award, 
  Clock, 
  BookOpen, 
  CheckCircle2, 
  Sparkles, 
  Calculator, 
  Copy, 
  ExternalLink,
  HelpCircle,
  Bot,
  History,
  Lightbulb,
  TrendingUp,
  ShieldAlert,
  Cpu,
  Zap,
  Target,
  Scale,
  Ghost,
  RefreshCw,
  Check
} from 'lucide-react';

function renderStepIcon(iconName?: string) {
  const iconProps = { className: "w-4 h-4 text-[var(--accent-orange)] shrink-0 stroke-[2.2]" };
  switch (iconName) {
    case 'Layers':
      return <Layers {...iconProps} />;
    case 'Bot':
      return <Bot {...iconProps} />;
    case 'History':
      return <History {...iconProps} />;
    case 'Lightbulb':
      return <Lightbulb {...iconProps} />;
    case 'TrendingUp':
      return <TrendingUp {...iconProps} />;
    case 'ShieldAlert':
      return <ShieldAlert {...iconProps} />;
    case 'Cpu':
      return <Cpu {...iconProps} />;
    case 'Zap':
      return <Zap {...iconProps} />;
    case 'Target':
      return <Target {...iconProps} />;
    case 'Clock':
      return <Clock {...iconProps} />;
    case 'Scale':
      return <Scale {...iconProps} />;
    case 'Ghost':
      return <Ghost {...iconProps} />;
    case 'RefreshCw':
      return <RefreshCw {...iconProps} />;
    case 'HelpCircle':
      return <HelpCircle {...iconProps} />;
    case 'BookOpen':
      return <BookOpen {...iconProps} />;
    case 'Award':
      return <Award {...iconProps} />;
    default:
      return <Sparkles {...iconProps} />;
  }
}

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

  const courseJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: `${lesson.title} (Lv.${level.levelNumber})`,
    description: lesson.subtitle || lesson.summary?.[0] || '주식 초보를 위한 단계별 강좌입니다.',
    provider: {
      '@type': 'Organization',
      name: '주식앱',
      url: 'https://jusik.app',
    },
    educationalLevel: `Lv.${level.levelNumber}`,
    isAccessibleForFree: true,
    inLanguage: 'ko-KR',
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: '홈',
        item: 'https://jusik.app',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: `Lv.${level.levelNumber} ${level.title}`,
        item: 'https://jusik.app',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: lesson.title,
        item: `https://jusik.app/lesson/${lesson.id}`,
      },
    ],
  };

  return (
    <>
      {/* JSON-LD Educational & Breadcrumb Structured Data for Search Bots */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Unified Clean Minimal Hero Header */}
        <div className="py-2 px-1 space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
            {lesson.title}
          </h1>
          {lesson.subtitle && (
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium">
              {lesson.subtitle}
            </p>
          )}
        </div>

        {/* TOP: M3 Styled Interactive YouTube Video Cover & Player with Completion Bar */}
        <RevealOnScroll delayIndex={1}>
          <LessonVideoSection
            lessonId={lesson.id}
            youtubeId={lesson.youtubeId}
            title={lesson.title}
            duration={lesson.duration}
            iconName={level.iconName}
          />
        </RevealOnScroll>

        {/* BOOK MANUSCRIPT SECTIONS */}
          {lesson.bookSections && lesson.bookSections.length > 0 && (
            <div className="space-y-6">
              {lesson.bookSections.map((section, sIdx) => (
                <RevealOnScroll key={sIdx} delayIndex={sIdx + 2}>
                  <section 
                    className={`glass-card p-5 rounded-2xl sm:rounded-3xl shadow-2xs space-y-5 sm:space-y-6 ${
                      section.interactiveTool ? 'sm:p-7 sm:pb-6' : 'sm:p-8'
                    }`}
                  >
                    <h2 className="text-lg sm:text-xl font-extrabold text-[var(--text-primary)] tracking-tight flex items-center gap-2.5">
                      <span className="w-2 h-5 rounded-full bg-[var(--accent-orange)] inline-block shrink-0" />
                      <span>{section.title}</span>
                    </h2>

                    {/* Section Image */}
                    {section.image && (
                      <div className="relative w-full overflow-hidden rounded-xl sm:rounded-2xl shadow-2xs">
                        <img
                          src={section.image.src}
                          alt={section.image.alt}
                          className="w-full h-auto object-cover"
                        />
                      </div>
                    )}

                    {/* Embedded Interactive Tool */}
                    {section.interactiveTool === 'class_detector' && <ClassDetectorQuiz />}
                    {section.interactiveTool === 'wealth_chart' && <WealthComparisonChart />}
                    {section.interactiveTool === 'cisco_mania' && <CiscoManiaGame />}
                    {section.interactiveTool === 'basic_terms_quiz' && <BasicTermsQuiz />}
                    {section.interactiveTool === 'fee_comparison' && <FeeComparisonBox />}
                    {section.interactiveTool === 'jpmorgan_chart' && <JpMorganTimingBarChart />}
                    {section.interactiveTool === 'dca_simulator' && <DcaMotionSimulator />}

                    {/* Callout Box if present */}
                    {section.callout && (
                      <div className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-[var(--accent-orange)]/10 text-xs sm:text-sm font-extrabold text-[var(--text-primary)] leading-relaxed shadow-2xs">
                        {section.callout}
                      </div>
                    )}

                    {/* Book Paragraphs */}
                    {section.paragraphs && section.paragraphs.length > 0 && (
                      <div className="space-y-4 text-xs sm:text-base text-[var(--text-primary)] leading-relaxed sm:leading-loose">
                        {section.paragraphs.map((para, pIdx) => {
                          const isQuote = para.startsWith('"') && para.endsWith('"');
                          if (isQuote) {
                            return (
                              <blockquote key={pIdx} className="p-4 my-2 rounded-xl bg-[var(--bg-main)]/80 border-l-4 border-[var(--accent-orange)] text-sm sm:text-base font-extrabold text-[var(--accent-orange)] italic leading-relaxed">
                                {para}
                              </blockquote>
                            );
                          }

                          const isBullet = para.startsWith('• ');
                          if (isBullet) {
                            const content = para.slice(2);
                            const colonIndex = content.indexOf(':');
                            if (colonIndex !== -1) {
                              const label = content.slice(0, colonIndex);
                              const desc = content.slice(colonIndex + 1);
                              return (
                                <div key={pIdx} className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[var(--bg-main)]/90 border border-[var(--border-color)] flex items-start gap-3 shadow-2xs hover:border-[var(--accent-orange)]/30 transition-all">
                                  <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent-orange)] shadow-[0_0_8px_rgba(241,143,1,0.6)] mt-1.5 shrink-0" />
                                  <div className="text-xs sm:text-base leading-relaxed">
                                    <strong className="text-[var(--text-primary)] font-extrabold">{label}:</strong>
                                    <span className="text-[var(--text-secondary)] ml-1.5 font-medium">{desc}</span>
                                  </div>
                                </div>
                              );
                            }
                            return (
                              <div key={pIdx} className="p-3 sm:p-4 rounded-xl bg-[var(--bg-main)]/90 border border-[var(--border-color)] flex items-start gap-2.5 shadow-2xs hover:border-[var(--accent-orange)]/30 transition-all">
                                <span className="w-2 h-2 rounded-full bg-[var(--accent-orange)] shadow-[0_0_8px_rgba(241,143,1,0.6)] mt-1.5 shrink-0" />
                                <p className="text-xs sm:text-base text-[var(--text-primary)] font-medium leading-relaxed">{content}</p>
                              </div>
                            );
                          }

                          return (
                            <p key={pIdx} className="font-medium text-justify">
                              {para}
                            </p>
                          );
                        })}
                      </div>
                    )}
                  </section>
                </RevealOnScroll>
              ))}
            </div>
          )}

          {/* CONCISE SUMMARY CARD */}
          {lesson.summary && lesson.summary.length > 0 && (
            <RevealOnScroll>
              <div className="glass-card p-5 sm:p-6 rounded-2xl sm:rounded-3xl space-y-3.5 shadow-2xs border border-[var(--border-color)] transition-all duration-300">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-xl bg-[var(--accent-orange)]/15 text-[var(--accent-orange)]">
                    <Sparkles className="w-4 h-4 stroke-[2]" />
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] tracking-tight">
                    핵심 요약
                  </h3>
                </div>
                <ul className="space-y-3">
                  {lesson.summary.map((point, index) => (
                    <li key={index} className="flex items-start gap-3 text-xs sm:text-sm font-medium leading-relaxed">
                      <span className="w-5 h-5 rounded-full bg-[var(--accent-orange)]/15 text-[var(--accent-orange)] border border-[var(--accent-orange)]/30 flex items-center justify-center text-[11px] font-extrabold shrink-0 font-mono mt-0.5 shadow-2xs">
                        {index + 1}
                      </span>
                      <span className="flex-1 text-[var(--text-primary)] pt-0.5">
                        {point}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </RevealOnScroll>
          )}

          {/* DYNAMIC CONTENT MODULES BLOCK (Resources, CTA) */}
          {lesson.modules && lesson.modules.length > 0 && (
            <div className="space-y-6">
              {lesson.modules.map((module, index) => {
                if (module.type === 'guide_steps') {
                  if (lesson.id === 'lv1-3') {
                    return (
                      <RevealOnScroll key={index}>
                        <AccountOpenGuide />
                      </RevealOnScroll>
                    );
                  }
                  if (lesson.id === 'lv1-4') {
                    return (
                      <RevealOnScroll key={index}>
                        <StockTradeGuide />
                      </RevealOnScroll>
                    );
                  }
                  if (lesson.id === 'lv1-6') {
                    return (
                      <RevealOnScroll key={index}>
                        <StockDcaGuide />
                      </RevealOnScroll>
                    );
                  }
                  const hasSingleUntitledStep = module.steps.length === 1 && !module.steps[0].title;
                  return (
                    <RevealOnScroll key={index}>
                      <div 
                        className="glass-card p-5 sm:p-7 rounded-2xl sm:rounded-3xl shadow-2xs space-y-5"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2.5">
                            <span className="p-1.5 rounded-xl bg-[var(--accent-orange)]/15 text-[var(--accent-orange)]">
                              {renderStepIcon(module.icon || module.steps[0]?.icon || 'BookOpen')}
                            </span>
                            <h3 className="text-lg sm:text-xl font-extrabold tracking-tight text-[var(--text-primary)]">
                              {module.title}
                            </h3>
                          </div>
                          {module.description && (
                            <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium pl-9">
                              {module.description}
                            </p>
                          )}
                        </div>

                        {/* Step Guides Stack */}
                        {hasSingleUntitledStep ? (
                          <div className="pt-1">
                            {module.steps[0].bullets && module.steps[0].bullets.length > 0 && (
                              <ul className="space-y-3 pl-2 sm:pl-3">
                                {module.steps[0].bullets.map((bullet, bulletIdx) => (
                                  <li key={bulletIdx} className="flex items-start gap-2.5 text-sm sm:text-base text-[var(--text-primary)] font-medium leading-relaxed sm:leading-loose">
                                    <span className="text-[var(--accent-orange)] font-bold shrink-0 mt-1 sm:mt-1.5">•</span>
                                    <span className="whitespace-pre-line flex-1">{bullet}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-4 pt-1">
                            {module.steps.map((step, sIdx) => (
                              <div 
                                key={sIdx}
                                className="p-4 sm:p-5 rounded-2xl bg-white/80 dark:bg-white/[0.04] border border-[var(--border-color)] space-y-2.5 shadow-2xs"
                              >
                                {step.title && (
                                  <h4 className="text-sm sm:text-base font-bold text-[var(--text-primary)] flex items-center gap-2.5">
                                    <span className="p-1 rounded-lg bg-[var(--accent-orange)]/15 text-[var(--accent-orange)] inline-flex items-center justify-center shrink-0">
                                      {renderStepIcon(step.icon)}
                                    </span>
                                    <span>{step.title}</span>
                                  </h4>
                                )}
                                {step.description && (
                                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed font-medium pl-4">
                                    {step.description}
                                  </p>
                                )}
                                {step.bullets && step.bullets.length > 0 && (
                                  <ul className="space-y-2 pl-4 pt-1">
                                    {step.bullets.map((bullet, bulletIdx) => (
                                      <li key={bulletIdx} className="flex items-start gap-2 text-sm sm:text-base text-[var(--text-primary)] font-medium leading-relaxed">
                                        <span className="text-[var(--accent-orange)] font-bold shrink-0 mt-0.5">•</span>
                                        <span className="whitespace-pre-line flex-1">{bullet}</span>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </RevealOnScroll>
                  );
                }

                if (module.type === 'resources') {
                  return (
                    <RevealOnScroll key={index}>
                      <div 
                        className="space-y-4 py-2"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="p-1.5 rounded-xl bg-[var(--accent-orange)]/15 text-[var(--accent-orange)]">
                              <ExternalLink className="w-4.5 h-4.5 stroke-[1.7]" />
                            </span>
                            <h3 className="text-lg sm:text-xl font-bold tracking-tight text-[var(--text-primary)]">
                              {module.title}
                            </h3>
                          </div>
                          {module.description && (
                            <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium pl-8">
                              {module.description}
                            </p>
                          )}
                        </div>

                        {/* Resource Links Stack */}
                        <div className="space-y-2 pt-1">
                          {module.links.map((link, linkIdx) => {
                            const isExt = link.url.startsWith('http');
                            return (
                              <a
                                key={linkIdx}
                                href={link.url}
                                target={isExt ? '_blank' : '_self'}
                                rel={isExt ? 'noopener noreferrer' : undefined}
                                className="group flex items-center justify-between p-3.5 sm:p-4 rounded-xl glass-card transition-all duration-300 shadow-2xs hover:border-[var(--accent-orange)]/40 hover:shadow-[0_0_15px_rgba(241,143,1,0.18)] active:scale-[0.99]"
                              >
                                <div className="space-y-0.5 min-w-0 flex-1 pr-3">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm sm:text-base font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-orange)] transition-colors truncate">
                                      {link.label}
                                    </span>
                                  </div>
                                  {link.description && (
                                    <p className="text-xs text-[var(--text-secondary)] font-medium truncate">
                                      {link.description}
                                    </p>
                                  )}
                                </div>
                                <div className="w-6 h-6 rounded-full bg-[var(--card-surface)] group-hover:bg-[var(--accent-orange)] text-[var(--text-secondary)] group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                                  <ExternalLink className="w-3.5 h-3.5 stroke-[1.7]" />
                                </div>
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    </RevealOnScroll>
                  );
                }

                if (module.type === 'cta') {
                  return (
                    <RevealOnScroll key={index}>
                      <div 
                        className="relative overflow-hidden glass-card p-5 sm:p-6 rounded-2xl border border-[var(--accent-orange)] bg-[var(--accent-orange)]/[0.04] shadow-[0_0_15px_rgba(241,143,1,0.08)]"
                      >
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-[var(--accent-orange)]/15 rounded-full blur-2xl pointer-events-none" />
                        
                        <div className={`relative z-10 ${module.benefits && module.benefits.length > 0 ? 'space-y-4' : ''}`}>
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="space-y-1.5 min-w-0 flex-1">
                              {module.badge && (
                                <span className="inline-block text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-[var(--accent-orange)] text-white tracking-wide font-mono shadow-2xs">
                                  {module.badge}
                                </span>
                              )}
                              <h3 className="text-base sm:text-lg font-bold tracking-tight text-[var(--text-primary)]">
                                {module.title}
                              </h3>
                              <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium leading-relaxed">
                                {module.description}
                              </p>
                            </div>

                            <div className="shrink-0 pt-1 sm:pt-0">
                              {module.isExternal ? (
                                <a
                                  href={module.buttonUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center justify-center gap-2 w-full sm:w-auto text-xs sm:text-sm font-bold bg-[var(--accent-orange)] hover:brightness-110 hover:shadow-[0_0_15px_rgba(241,143,1,0.3)] active:scale-95 text-white px-5 py-2.5 rounded-full transition-all shadow-2xs"
                                >
                                  {module.buttonText}
                                  <ExternalLink className="w-4 h-4 stroke-[1.7]" />
                                </a>
                              ) : (
                                <Link
                                  href={module.buttonUrl}
                                  className="inline-flex items-center justify-center gap-2 w-full sm:w-auto text-xs sm:text-sm font-bold bg-[var(--accent-orange)] hover:brightness-110 hover:shadow-[0_0_15px_rgba(241,143,1,0.3)] active:scale-95 text-white px-5 py-2.5 rounded-full transition-all shadow-2xs"
                                >
                                  {module.buttonText}
                                  <ArrowRight className="w-4 h-4 stroke-[1.7]" />
                                </Link>
                              )}
                            </div>
                          </div>

                          {module.benefits && module.benefits.length > 0 && (
                            <div className="pt-4 border-t border-[var(--accent-orange)]/25 grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {module.benefits.map((benefit, bIdx) => (
                                <div
                                  key={bIdx}
                                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[var(--bg-main)]/70 border border-[var(--accent-orange)]/20 text-xs font-medium text-[var(--text-primary)] shadow-2xs"
                                >
                                  <div className="w-4 h-4 rounded-full bg-[var(--accent-orange)]/20 flex items-center justify-center shrink-0">
                                    <Check className="w-2.5 h-2.5 text-[var(--accent-orange)] stroke-[2.8]" />
                                  </div>
                                  <span>{benefit}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </RevealOnScroll>
                  );
                }

                return null;
              })}
            </div>
          )}

          {/* Lesson Specific Comments */}
          <RevealOnScroll>
            <CommentSection
              targetKey={`lesson-${lesson.id}`}
              title="댓글"
            />
          </RevealOnScroll>

          {/* Navigation Buttons - Clean Modern Floating Cards */}
          <RevealOnScroll>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {prevLesson ? (
                  <Link
                    href={`/lesson/${prevLesson.id}`}
                    className="flex items-center gap-3 p-3.5 sm:p-4 rounded-xl glass-card glass-card-hover transition-all duration-300 text-left group shadow-2xs active:scale-[0.98]"
                  >
                    <ArrowLeft className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-[var(--accent-orange)] group-hover:-translate-x-1 transition-all" />
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-bold text-[var(--text-secondary)] block">이전 강의</span>
                      <span className="text-xs sm:text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-orange)] transition-colors truncate block">
                        {prevLesson.title}
                      </span>
                    </div>
                  </Link>
                ) : (
                  <div className="p-3.5 sm:p-4 rounded-xl glass-card opacity-60 text-[var(--text-secondary)] text-xs flex items-center">
                    첫 번째 강의입니다.
                  </div>
                )}

                {nextLesson ? (
                  <Link
                    href={`/lesson/${nextLesson.id}`}
                    className="flex items-center justify-between p-3.5 sm:p-4 rounded-xl glass-card glass-card-hover transition-all duration-300 text-right group shadow-2xs active:scale-[0.98]"
                  >
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-bold text-[var(--accent-orange)] block">다음 강의</span>
                      <span className="text-xs sm:text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-orange)] transition-colors truncate block">
                        {nextLesson.title}
                      </span>
                    </div>
                    <div className="w-7 h-7 rounded-full bg-[var(--bg-main)] group-hover:bg-[var(--accent-orange)]/20 flex items-center justify-center shrink-0 ml-2 group-hover:translate-x-1 transition-all">
                      <ArrowRight className="w-4 h-4 text-[var(--accent-orange)]" />
                    </div>
                  </Link>
                ) : (
                  <div className="p-3.5 sm:p-4 rounded-xl glass-card opacity-60 text-[var(--text-secondary)] text-xs flex items-center justify-end">
                    마지막 강의입니다.
                  </div>
                )}
              </div>
          </RevealOnScroll>
      </div>
    </>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const result = getLessonById(resolvedParams.id);
  if (!result) return {};
  const { lesson } = result;

  const title = lesson.title;
  const fullTitle = `${lesson.title} | 주식앱`;
  const description = lesson.subtitle || lesson.summary?.[0] || '주식 초보를 위한 단계별 강좌입니다.';
  const url = `https://jusik.app/lesson/${lesson.id}`;

  const isUnlisted = lesson.id === 'lv1-3';

  return {
    title,
    description,
    ...(isUnlisted && {
      robots: {
        index: false,
        follow: false,
        nocache: true,
        googleBot: {
          index: false,
          follow: false,
        },
      },
    }),
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: '주식앱',
      images: [
        {
          url: '/og-image.png',
          width: 1024,
          height: 537,
          alt: `${lesson.title} - 주식앱`,
        },
      ],
      locale: 'ko_KR',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: ['/og-image.png'],
    },
  };
}
