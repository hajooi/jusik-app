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
          className="inline-flex items-center gap-1.5 font-bold text-[var(--text-secondary)] hover:text-[var(--accent-orange)] transition-all duration-300 glass-card glass-card-hover px-3.5 py-2 rounded-full active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          홈으로 돌아가기
        </Link>
      </div>

      <div className="space-y-6">
        {/* Main Content Column */}
        <div className="space-y-6 min-w-0">
          
          {/* Modern Minimal Header Info */}
          <div className="space-y-1.5 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[var(--accent-orange)]/15 text-[var(--accent-orange)] font-mono">
                Lv. {level.levelNumber}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
              {lesson.title}
            </h1>
            {lesson.subtitle && (
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium">
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

          {/* DYNAMIC CONTENT MODULES BLOCK */}
          {lesson.modules && lesson.modules.length > 0 && (
            <div className="space-y-6">
              {lesson.modules.map((module, index) => {
                if (module.type === 'guide_steps') {
                  return (
                    <div 
                      key={index}
                      className="space-y-4 py-2"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="p-1.5 rounded-xl bg-[var(--accent-green)]/15 text-[var(--accent-green)]">
                            <BookOpen className="w-4.5 h-4.5 stroke-[1.7]" />
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

                      {/* Pure Article Style Step Stack with Soft Translucent Accent Line */}
                      <div className="space-y-4 pt-1 pl-2 border-l border-[var(--border-color)] ml-2">
                        {module.steps.map((step) => (
                          <div 
                            key={step.stepNumber}
                            className="flex items-start gap-3.5 pl-2"
                          >
                            <div className="w-6 h-6 rounded-full bg-[var(--accent-green)]/15 text-[var(--accent-green)] flex items-center justify-center font-bold text-xs shrink-0 font-mono mt-0.5">
                              {step.stepNumber}
                            </div>
                            <div className="space-y-1 min-w-0 flex-1">
                              <h4 className="text-base font-bold text-[var(--text-primary)]">
                                {step.title}
                              </h4>
                              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed font-medium">
                                {step.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }

                if (module.type === 'resources') {
                  return (
                    <div 
                      key={index}
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
                              className="group flex items-center justify-between p-3.5 sm:p-4 rounded-xl glass-card glass-card-hover transition-all duration-300 shadow-2xs active:scale-[0.99]"
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
                  );
                }

                if (module.type === 'cta') {
                  return (
                    <div 
                      key={index}
                      className="relative overflow-hidden glass-card p-5 sm:p-6 rounded-2xl shadow-2xs space-y-4 my-2"
                    >
                      <div className="absolute -top-10 -right-10 w-40 h-40 bg-[var(--accent-orange)]/15 rounded-full blur-2xl pointer-events-none" />
                      
                      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
                              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto text-xs sm:text-sm font-bold bg-[var(--accent-orange)] hover:opacity-90 active:scale-95 text-white px-5 py-2.5 rounded-full transition-all shadow-2xs"
                            >
                              {module.buttonText}
                              <ExternalLink className="w-4 h-4 stroke-[1.7]" />
                            </a>
                          ) : (
                            <Link
                              href={module.buttonUrl}
                              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto text-xs sm:text-sm font-bold bg-[var(--accent-orange)] hover:opacity-90 active:scale-95 text-white px-5 py-2.5 rounded-full transition-all shadow-2xs"
                            >
                              {module.buttonText}
                              <ArrowRight className="w-4 h-4 stroke-[1.7]" />
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }

                return null;
              })}
            </div>
          )}

          {/* Navigation Buttons - Clean Modern Floating Cards */}
          <div className="pt-4">
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
          </div>

        </div>
      </div>
    </div>
  );
}
