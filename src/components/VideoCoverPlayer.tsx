'use client';

import React, { useState } from 'react';
import { 
  Play, 
  Clock, 
  Brain, 
  ShoppingBag, 
  ShieldCheck, 
  PieChart, 
  TrendingUp, 
  Cpu 
} from 'lucide-react';

const ICON_MAP: Record<string, any> = {
  Brain,
  ShoppingBag,
  ShieldCheck,
  PieChart,
  TrendingUp,
  Cpu,
};

interface VideoCoverPlayerProps {
  youtubeId: string;
  title: string;
  duration: string;
  iconName?: string;
}

export default function VideoCoverPlayer({ youtubeId, title, duration, iconName = 'Brain' }: VideoCoverPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const IconComponent = ICON_MAP[iconName] || Brain;

  if (isPlaying) {
    return (
      <div className="relative w-full aspect-video rounded-3xl overflow-hidden shadow-xl bg-black border border-[var(--border-color)]/60">
        <iframe
          className="absolute top-0 left-0 w-full h-full"
          src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsPlaying(true)}
      type="button"
      aria-label={`${title} 영상 재생하기`}
      className="group relative w-full aspect-video rounded-3xl overflow-hidden shadow-md border border-[var(--border-color)]/80 bg-gradient-to-br from-[var(--card-surface)] via-[var(--bg-main)] to-[var(--card-surface)] text-left cursor-pointer transition-all duration-300 hover:shadow-xl hover:border-[var(--accent-green)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--accent-green)]/50 p-6 sm:p-8 flex flex-col justify-between"
    >
      {/* Decorative M3 Mesh Background Shapes */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-[var(--accent-green)]/10 rounded-full blur-2xl pointer-events-none group-hover:bg-[var(--accent-green)]/15 transition-all duration-500" />
      <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-[var(--accent-orange)]/10 rounded-full blur-2xl pointer-events-none group-hover:bg-[var(--accent-orange)]/15 transition-all duration-500" />

      {/* Top Header Row: Lecture Title (Top Left) & Click to Play Tag (Top Right) */}
      <div className="relative z-10 flex items-start justify-between w-full gap-4">
        <div className="space-y-0.5 min-w-0 flex-1">
          <p className="text-[11px] font-bold text-[var(--accent-green)] tracking-wider uppercase">
            강의 영상
          </p>
          <h2 className="text-base sm:text-xl font-extrabold text-[var(--text-primary)] tracking-tight line-clamp-1 group-hover:text-[var(--accent-green)] transition-colors">
            {title}
          </h2>
        </div>

        <span className="text-[11px] font-bold text-[var(--text-secondary)] opacity-80 group-hover:opacity-100 transition-opacity shrink-0 pt-0.5">
          클릭하여 재생
        </span>
      </div>

      {/* Center Row: 20% Opacity Watermark Curriculum Level Icon + Outlined M3 Play Button */}
      <div className="relative z-10 flex items-center justify-center my-auto w-full py-2">
        <div className="relative flex items-center justify-center">
          {/* 커리큘럼 레벨 아이콘 (20% 은은한 워터마크 배경) */}
          <div className="w-48 h-48 sm:w-60 sm:h-60 rounded-full text-[var(--accent-green)] flex items-center justify-center opacity-20 group-hover:opacity-35 group-hover:scale-105 transition-all duration-500 pointer-events-none">
            <IconComponent className="w-36 h-36 sm:w-44 sm:h-44 stroke-[1.2]" />
          </div>

          {/* 선명하고 세련된 선형 (Outlined / Glass) M3 재생 버튼 */}
          <div className="absolute inset-0 m-auto w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[var(--card-surface)]/80 hover:bg-[var(--accent-orange)] text-[var(--accent-orange)] hover:text-white border-2 border-[var(--accent-orange)] flex items-center justify-center shadow-xl backdrop-blur-md transform group-hover:scale-110 transition-all duration-300 group-active:scale-95 z-10">
            <Play className="w-7 h-7 sm:w-8 sm:h-8 stroke-[2.5] fill-none ml-1" />
          </div>
        </div>
      </div>

      {/* Bottom Row: Duration Pill Tag (Bottom Left) */}
      <div className="relative z-10 w-full flex items-center justify-start">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-[var(--bg-main)]/80 text-[var(--text-secondary)] border border-[var(--border-color)]/50 backdrop-blur-md shadow-2xs font-mono">
          <Clock className="w-3.5 h-3.5 text-[var(--accent-green)]" />
          {duration}
        </span>
      </div>
    </button>
  );
}
