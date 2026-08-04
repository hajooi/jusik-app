'use client';

import React, { useState, useRef, useEffect } from 'react';
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
  onVideoEnded?: () => void;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: (() => void) | undefined;
  }
}

export default function VideoCoverPlayer({ 
  youtubeId, 
  title, 
  duration, 
  iconName = 'Brain',
  onVideoEnded 
}: VideoCoverPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const iframeContainerRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<any>(null);
  const IconComponent = ICON_MAP[iconName] || Brain;

  // Load YouTube IFrame API script once
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
    }
  }, []);

  // Initialize YouTube Player after isPlaying becomes true
  useEffect(() => {
    if (isPlaying && window.YT && window.YT.Player && iframeContainerRef.current) {
      playerRef.current = new window.YT.Player(iframeContainerRef.current, {
        videoId: youtubeId,
        playerVars: {
          autoplay: 1,
          playsinline: 1,
          rel: 0,
          enablejsapi: 1
        },
        events: {
          onStateChange: (event: any) => {
            // YT.PlayerState.ENDED === 0
            if (event.data === 0) {
              if (onVideoEnded) {
                onVideoEnded();
              }
            }
          }
        }
      });
    }
  }, [isPlaying, youtubeId, onVideoEnded]);

  const handlePlayClick = () => {
    setIsPlaying(true);
  };

  return (
    <div className="relative w-full aspect-video rounded-2xl sm:rounded-3xl overflow-hidden shadow-md bg-black">
      {/* Render YouTube Iframe container after Play click */}
      {isPlaying ? (
        <div className="absolute top-0 left-0 w-full h-full">
          <div ref={iframeContainerRef} className="w-full h-full" />
        </div>
      ) : (
        <button
          onClick={handlePlayClick}
          type="button"
          aria-label={`${title} 영상 재생하기`}
          className="group absolute inset-0 w-full h-full bg-[var(--bg-main)] text-left cursor-pointer transition-all duration-300 focus:outline-none p-4 sm:p-6 flex flex-col justify-between z-10 overflow-hidden border-none"
        >
          {/* Ambient Glass Surface */}
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--card-surface)] to-[var(--bg-main)] pointer-events-none" />

          {/* Decorative Warm Ambient Mesh Background Shapes */}
          <div className="absolute -top-12 -right-12 w-48 h-48 sm:w-60 sm:h-60 bg-[var(--accent-orange)]/15 rounded-full blur-3xl pointer-events-none group-hover:bg-[var(--accent-orange)]/25 transition-all duration-500" />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 sm:w-60 sm:h-60 bg-[var(--accent-green)]/15 rounded-full blur-3xl pointer-events-none group-hover:bg-[var(--accent-green)]/25 transition-all duration-500" />

          {/* Top Header Row */}
          <div className="relative z-10 flex items-start justify-between w-full gap-2">
            <div className="space-y-0.5 min-w-0 flex-1">
              <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold text-[var(--accent-orange)] px-2.5 py-0.5 rounded-full bg-[var(--accent-orange)]/10 tracking-wider uppercase font-mono">
                <IconComponent className="w-3 h-3" />
                강의 영상
              </span>
              <h2 className="text-sm sm:text-lg font-extrabold text-[var(--text-primary)] tracking-tight line-clamp-1 group-hover:text-[var(--accent-orange)] transition-colors pt-1">
                {title}
              </h2>
            </div>

            <span className="text-[10px] sm:text-[11px] font-bold text-[var(--text-secondary)] opacity-80 group-hover:opacity-100 transition-opacity shrink-0 pt-0.5 whitespace-nowrap bg-[var(--card-surface)] px-2.5 py-1 rounded-full border border-[var(--border-color)]">
              클릭하여 재생
            </span>
          </div>

          {/* Center Row: Background Icon + Signature Play Button */}
          <div className="relative z-10 flex items-center justify-center my-auto w-full py-2">
            <IconComponent className="absolute w-40 h-40 sm:w-52 sm:h-52 text-[var(--accent-orange)] opacity-10 dark:opacity-15 pointer-events-none group-hover:scale-110 group-hover:opacity-20 transition-all duration-500 stroke-[1.2]" />

            <div className="relative group/btn flex items-center justify-center">
              <div className="absolute -inset-2 rounded-full bg-[var(--accent-orange)]/20 blur-md group-hover:bg-[var(--accent-orange)]/40 transition-all duration-500 animate-pulse" />
              
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[var(--accent-orange)] text-white shadow-lg flex items-center justify-center transform group-hover:scale-105 transition-all duration-300 group-active:scale-95 border border-white/20">
                <Play className="w-6 h-6 sm:w-7 sm:h-7 fill-white stroke-none ml-1" />
              </div>
            </div>
          </div>

          {/* Bottom Row: Duration Pill Tag */}
          <div className="relative z-10 w-full flex items-center justify-start">
            <span className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold px-3 py-1 sm:py-1.5 rounded-full bg-[var(--card-surface)] text-[var(--text-secondary)] backdrop-blur-md border border-[var(--border-color)] font-mono shadow-2xs">
              <Clock className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-[var(--accent-orange)]" />
              {duration}
            </span>
          </div>
        </button>
      )}
    </div>
  );
}
