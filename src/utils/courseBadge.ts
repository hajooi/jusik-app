import React from 'react';
import { BookOpen, PenTool, GraduationCap } from 'lucide-react';

export type CourseBadgeTier = 'beginner' | 'student' | 'honor';

export interface CourseBadgeInfo {
  tier: CourseBadgeTier;
  label: string; // '입문생' | '수강생' | '우등생'
  icon: React.ComponentType<{ className?: string }>;
  colorClass: string;
  badgeContainerClass: string;
  activeBorderClass: string;
  activeDotClass: string;
  tooltip: string;
}

/**
 * 수강 완료 개수 및 영구 완강 플래그를 기반으로 현재 달성한 수강 뱃지 정보를 반환합니다.
 * 
 * - 11개 이상 또는 hasCompletedCourse === true: '우등생' (에메랄드)
 * - 6개 ~ 10개: '수강생' (앰버 오렌지)
 * - 1개 ~ 5개: '입문생' (스카이 블루)
 * - 0개: null (미획득)
 */
export function getCourseBadgeInfo(
  completedCount: number,
  _hasCompletedCourse?: boolean
): CourseBadgeInfo | null {
  const safeCount = Math.max(0, completedCount || 0);

  // 1. 우등생: 11개 이상 완료 시에만 부여 (완강 기준 제외, 순수 11강 이상)
  if (safeCount >= 11) {
    return {
      tier: 'honor',
      label: '우등생',
      icon: GraduationCap,
      colorClass: 'text-emerald-600 dark:text-emerald-400',
      badgeContainerClass: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/30',
      activeBorderClass: 'border-emerald-500',
      activeDotClass: 'bg-emerald-500',
      tooltip: '커리큘럼 11강 이상 수강 우등생 뱃지',
    };
  }

  // 2. 수강생: 6개 ~ 10개 완료
  if (safeCount >= 6) {
    return {
      tier: 'student',
      label: '수강생',
      icon: PenTool,
      colorClass: 'text-amber-600 dark:text-amber-400',
      badgeContainerClass: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/30',
      activeBorderClass: 'border-amber-500',
      activeDotClass: 'bg-amber-500',
      tooltip: '커리큘럼 6강 이상 실습 수강생 뱃지',
    };
  }

  // 3. 입문생: 1개 ~ 5개 완료
  if (safeCount >= 1) {
    return {
      tier: 'beginner',
      label: '입문생',
      icon: BookOpen,
      colorClass: 'text-sky-600 dark:text-sky-400',
      badgeContainerClass: 'text-sky-600 dark:text-sky-400 bg-sky-500/10 border border-sky-500/30',
      activeBorderClass: 'border-sky-500',
      activeDotClass: 'bg-sky-500',
      tooltip: '커리큘럼 첫걸음 입문생 뱃지',
    };
  }

  return null;
}
