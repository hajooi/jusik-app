'use client';

import React from 'react';
import VideoCoverPlayer from '@/components/VideoCoverPlayer';
import LessonCompletionBar from '@/components/LessonCompletionBar';
import { useAuth } from '@/context/AuthContext';
import { triggerConfetti } from '@/utils/confetti';

interface LessonVideoSectionProps {
  lessonId: string;
  youtubeId: string;
  title: string;
  duration: string;
  iconName?: string;
}

export default function LessonVideoSection({
  lessonId,
  youtubeId,
  title,
  duration,
  iconName
}: LessonVideoSectionProps) {
  const { markLessonCompleted, isLessonCompleted } = useAuth();

  const handleVideoEnded = () => {
    if (!isLessonCompleted(lessonId)) {
      triggerConfetti();
      markLessonCompleted(lessonId);
    }
  };

  return (
    <div className="space-y-4">
      <VideoCoverPlayer
        youtubeId={youtubeId}
        title={title}
        duration={duration}
        iconName={iconName}
        onVideoEnded={handleVideoEnded}
      />
      <LessonCompletionBar lessonId={lessonId} />
    </div>
  );
}
