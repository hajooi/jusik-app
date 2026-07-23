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
      <div className="relative w-full aspect-video rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl bg-black">
        <iframe
          className="absolute top-0 left-0 w-full h-full"
          src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&playsinline=1&rel=0&enablejsapi=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
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
      className="group relative w-full aspect-video rounded-2xl sm:rounded-3xl overflow-hidden shadow-md bg-gradient-to-br from-[var(--card-surface)] via-[var(--bg-main)] to-[var(--card-surface)] text-left cursor-pointer transition-all duration-300 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[var(--accent-green)]/50 p-4 sm:p-6 flex flex-col justify-between"
    >
      {/* Decorative M3 Mesh Background Shapes */}
      <div className="absolute -top-12 -right-12 w-40 h-40 sm:w-48 sm:h-48 bg-[var(--accent-green)]/10 rounded-full blur-2xl pointer-events-none group-hover:bg-[var(--accent-green)]/15 transition-all duration-500" />
      <div className="absolute -bottom-12 -left-12 w-40 h-40 sm:w-48 sm:h-48 bg-[var(--accent-orange)]/10 rounded-full blur-2xl pointer-events-none group-hover:bg-[var(--accent-orange)]/15 transition-all duration-500" />

      {/* Watermark Icon (Absolute Centered Background - prevents layout overflow) */}
      <div className="absolute inset-0 m-auto flex items-center justify-center pointer-events-none">
        <div className="w-32 h-32 sm:w-48 sm:h-48 text-[var(--accent-green)] flex items-center justify-center opacity-15 sm:opacity-20 group-hover:opacity-30 group-hover:scale-105 transition-all duration-500">
          <IconComponent className="w-24 h-24 sm:w-36 sm:h-36 stroke-[1.2]" />
        </div>
      </div>

      {/* Top Header Row: Lecture Title (Top Left) & Click to Play Tag (Top Right) */}
      <div className="relative z-10 flex items-start justify-between w-full gap-2">
        <div className="space-y-0.5 min-w-0 flex-1">
          <p className="text-[10px] sm:text-[11px] font-bold text-[var(--accent-green)] tracking-wider uppercase">
            강의 영상
          </p>
          <h2 className="text-sm sm:text-lg font-extrabold text-[var(--text-primary)] tracking-tight line-clamp-1 group-hover:text-[var(--accent-green)] transition-colors">
            {title}
          </h2>
        </div>

        <span className="text-[10px] sm:text-[11px] font-bold text-[var(--text-secondary)] opacity-80 group-hover:opacity-100 transition-opacity shrink-0 pt-0.5 whitespace-nowrap">
          클릭하여 재생
        </span>
      </div>

      {/* Center Row: Outlined M3 Play Button */}
      <div className="relative z-10 flex items-center justify-center my-auto w-full py-1">
        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[var(--card-surface)]/80 hover:bg-[var(--accent-orange)] text-[var(--accent-orange)] hover:text-white border-2 border-[var(--accent-orange)] flex items-center justify-center shadow-lg backdrop-blur-md transform group-hover:scale-110 transition-all duration-300 group-active:scale-95">
          <Play className="w-5 h-5 sm:w-7 sm:h-7 stroke-[2.5] fill-none ml-0.5 sm:ml-1" />
        </div>
      </div>

      {/* Bottom Row: Duration Pill Tag (Bottom Left) */}
      <div className="relative z-10 w-full flex items-center justify-start">
        <span className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-[var(--bg-main)]/80 text-[var(--text-secondary)] backdrop-blur-md shadow-2xs font-mono">
          <Clock className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-[var(--accent-green)]" />
          {duration}
        </span>
      </div>
    </button>
  );
}
