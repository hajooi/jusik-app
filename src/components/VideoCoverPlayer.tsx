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
  const [playerState, setPlayerState] = useState<'idle' | 'playing' | 'paused' | 'ended'>('idle');
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const playerRef = useRef<any>(null);
  const isReadyRef = useRef(false);
  const pendingPlayRef = useRef(false);
  const IconComponent = ICON_MAP[iconName] || Brain;

  // Load YouTube Iframe API and initialize pre-mounted player
  useEffect(() => {
    let player: any = null;

    const initPlayer = () => {
      if (iframeRef.current && window.YT && window.YT.Player) {
        try {
          player = new window.YT.Player(iframeRef.current, {
            events: {
              onReady: (event: any) => {
                isReadyRef.current = true;
                if (pendingPlayRef.current) {
                  try {
                    event.target.playVideo();
                  } catch (e) {
                    console.error('Error calling playVideo onReady:', e);
                  }
                  pendingPlayRef.current = false;
                }
              },
              onStateChange: (event: any) => {
                // YT.PlayerState: PLAYING === 1, PAUSED === 2, ENDED === 0
                if (event.data === 1) {
                  setPlayerState('playing');
                } else if (event.data === 2) {
                  setPlayerState('paused');
                } else if (event.data === 0) {
                  setPlayerState('ended');
                  if (onVideoEnded) {
                    onVideoEnded();
                  }
                }
              }
            }
          });
          playerRef.current = player;
        } catch (e) {
          console.error('YouTube Player API init error:', e);
        }
      }
    };

    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
    }

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      const prevCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (prevCallback) prevCallback();
        initPlayer();
      };
    }
  }, [youtubeId, onVideoEnded]);

  const handlePlayClick = () => {
    setIsPlaying(true);
    setPlayerState('playing');

    // Attempt direct API call
    if (playerRef.current && typeof playerRef.current.playVideo === 'function') {
      try {
        playerRef.current.playVideo();
        return;
      } catch (e) {
        console.error('Error calling playVideo:', e);
      }
    }

    // Direct postMessage fallback during user gesture event for mobile browsers
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: 'playVideo', args: [] }),
          '*'
        );
      } catch (e) {
        console.error('Error postMessage playVideo:', e);
      }
    }
  };

  const lightOpacity =
    playerState === 'playing' ? 0.92 :
    playerState === 'paused' ? 0.35 :
    playerState === 'ended' ? 0.25 : 0.68;

  const darkOpacity =
    playerState === 'playing' ? 0.65 :
    playerState === 'paused' ? 0.22 :
    playerState === 'ended' ? 0.15 : 0.45;

  return (
    <div className="relative w-full group/ambient-container my-4">
      {/* 
        Dual-Layer Crossfade Ambient Glow (No Border Artifacts & 2.5s Echo Fade)
        Light Mode: Enhanced strength (playing 0.92 / idle 0.68)
        Dark Mode: Preserved current strength (playing 0.65 / idle 0.45)
      */}
      <div 
        className="absolute -inset-4 sm:-inset-6 rounded-[2.5rem] sm:rounded-[3.5rem] blur-2xl sm:blur-3xl pointer-events-none z-0 overflow-hidden opacity-[var(--glow-op-light)] dark:opacity-[var(--glow-op-dark)]"
        style={{
          transition: 'opacity 2500ms ease-in-out, transform 2500ms ease-in-out',
          '--glow-op-light': lightOpacity,
          '--glow-op-dark': darkOpacity,
          transform:
            playerState === 'playing' ? 'scale(1.04)' : 'scale(1.00)'
        } as React.CSSProperties}
      >
        {/* Layer A: Ambient Warm Orange Aura */}
        <div className="absolute inset-0 bg-[var(--accent-orange)] rounded-full animate-glow-orange" />

        {/* Layer B: Ambient Soft Green Aura */}
        <div className="absolute inset-0 bg-[var(--accent-mid-green)] rounded-full animate-glow-green" />
      </div>

      <div className="relative z-10 w-full aspect-video rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl bg-[var(--card-surface)] border border-[var(--border-color)]">
        {/* Pre-mounted YouTube Iframe element in DOM */}
        <div className="absolute top-0 left-0 w-full h-full">
          <iframe
            ref={iframeRef}
            src={`https://www.youtube.com/embed/${youtubeId}?enablejsapi=1&playsinline=1&rel=0&modestbranding=1&iv_load_policy=3`}
            title={title}
            className={`w-full h-full border-0 transition-opacity duration-300 ${
              isPlaying ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>

        {/* Brand Cover Overlay */}
        {!isPlaying && (
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
    </div>
  );
}

