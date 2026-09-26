'use client';

import React from 'react';
import VideoCoverPlayer from '@/components/VideoCoverPlayer';
import LessonCompletionBar from '@/components/LessonCompletionBar';
import { useAuth } from '@/context/AuthContext';
import { triggerConfetti } from '@/utils/confetti';

import { Clock } from 'lucide-react';

interface LessonVideoSectionProps {
  lessonId: string;
  youtubeId: string;
  title: string;
  duration: string;
  iconName?: string;
  levelNumber?: number;
}

export default function LessonVideoSection({
  lessonId,
  youtubeId,
  title,
  duration,
  iconName,
  levelNumber
}: LessonVideoSectionProps) {
  const { markLessonCompleted, isLessonCompleted } = useAuth();

  const handleVideoEnded = () => {
    if (!isLessonCompleted(lessonId)) {
      triggerConfetti();
      markLessonCompleted(lessonId);
    }
  };

  return (
    <div className="space-y-3">
      {/* Video Meta & Action Toolbar */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2 sm:gap-2.5 text-xs text-[var(--text-secondary)] font-medium">
          {typeof levelNumber === 'number' && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[var(--card-surface)] border border-[var(--border-color)] font-mono text-[11px] font-bold text-[var(--text-primary)]">
              Lv.{levelNumber}
            </span>
          )}
          <span className="inline-flex items-center gap-1 font-mono text-[11px] sm:text-xs">
            <Clock className="w-3.5 h-3.5 text-[var(--text-secondary)] shrink-0" />
            {duration}
          </span>
        </div>

        <LessonCompletionBar lessonId={lessonId} />
      </div>

      <VideoCoverPlayer
        youtubeId={youtubeId}
        title={title}
        duration={duration}
        iconName={iconName}
        onVideoEnded={handleVideoEnded}
      />
    </div>
  );
}
