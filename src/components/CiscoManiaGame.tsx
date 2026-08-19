'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Coins, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Sparkles,
  Shield,
  Zap,
  Coffee,
  DoorOpen,
  Award
} from 'lucide-react';

// --- Sound Synthesizer via Web Audio API ---
class SoundEngine {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;
  private bgmInterval: NodeJS.Timeout | null = null;

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    this.init();
    if (this.isMuted) {
      this.stopBattleBgm();
    }
    return this.isMuted;
  }

  public playFootstep() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(110, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(28, this.ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.02, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch {
      // Audio fallback
    }
  }

  public playTextBlip() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(460 + Math.random() * 50, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.02, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.03);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.03);
    } catch {
      // Audio fallback
    }
  }

  public playSelect() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.setValueAtTime(783.99, now + 0.06);

      gain.gain.setValueAtTime(0.07, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.2);
    } catch {
      // Audio fallback
    }
  }

  public playAttack() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.25);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } catch {
      // Audio fallback
    }
  }

  public playItemGet() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
      notes.forEach((freq, idx) => {
        const now = this.ctx!.currentTime + idx * 0.07;
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now);
        osc.stop(now + 0.18);
      });
    } catch {
      // Audio fallback
    }
  }

  public startBattleBgm() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || this.bgmInterval) return;

    const notes = [130.81, 146.83, 164.81, 174.61, 196.00, 174.61, 164.81, 146.83];
    let noteIdx = 0;

    this.bgmInterval = setInterval(() => {
      if (this.isMuted || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(notes[noteIdx % notes.length], now);

        gain.gain.setValueAtTime(0.035, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.12);

        noteIdx++;
      } catch {
        // fallback
      }
    }, 130);
  }

  public stopBattleBgm() {
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }

  public playCrash() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(240, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.6);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.6);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.6);
    } catch {
      // Audio fallback
    }
  }

  public playInflation() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(380, now);
      osc.frequency.linearRampToValueAtTime(160, now + 0.4);

      gain.gain.setValueAtTime(0.07, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.4);
    } catch {
      // Audio fallback
    }
  }

  public playVictory() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        const now = this.ctx!.currentTime + idx * 0.08;
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now);
        osc.stop(now + 0.2);
      });
    } catch {
      // Audio fallback
    }
  }
}

const sounds = new SoundEngine();

// --- 픽셀 페이스 포트레이트 SVG ---
function FacePortrait({ type }: { type: 'manager' | 'peer' | 'lee' | 'report' | 'board' | 'desk' | 'coffee' | 'door' | 'plant' | 'monster' | 'server' | 'glasses' }) {
  if (type === 'manager') {
    return (
      <svg viewBox="0 0 32 32" className="w-full h-full shape-rendering-crispEdges">
        <rect width="32" height="32" fill="#1e1b18" />
        <rect x="7" y="3" width="18" height="7" fill="#382214" />
        <rect x="5" y="6" width="4" height="12" fill="#382214" />
        <rect x="23" y="6" width="4" height="12" fill="#382214" />
        <rect x="8" y="7" width="16" height="15" fill="#fcd34d" />
        <rect x="9" y="21" width="14" height="3" fill="#f59e0b" />
        <rect x="8" y="11" width="6" height="4" fill="#0f172a" />
        <rect x="9" y="12" width="4" height="2" fill="#38bdf8" />
        <rect x="18" y="11" width="6" height="4" fill="#0f172a" />
        <rect x="19" y="12" width="4" height="2" fill="#38bdf8" />
        <rect x="14" y="12" width="4" height="1" fill="#0f172a" />
        <rect x="12" y="18" width="8" height="1.5" fill="#92400e" />
        <rect x="5" y="24" width="22" height="8" fill="#d97706" />
        <polygon points="12,24 16,28 20,24" fill="#ffffff" />
        <rect x="15" y="26" width="2" height="6" fill="#dc2626" />
      </svg>
    );
  }

  if (type === 'peer') {
    return (
      <svg viewBox="0 0 32 32" className="w-full h-full shape-rendering-crispEdges">
        <rect width="32" height="32" fill="#181e28" />
        <rect x="6" y="2" width="20" height="7" fill="#1e1b4b" />
        <rect x="4" y="5" width="4" height="11" fill="#1e1b4b" />
        <rect x="24" y="5" width="4" height="11" fill="#1e1b4b" />
        <rect x="10" y="1" width="5" height="3" fill="#1e1b4b" />
        <rect x="18" y="1" width="5" height="3" fill="#1e1b4b" />
        <rect x="8" y="7" width="16" height="16" fill="#fed7aa" />
        <rect x="10" y="11" width="4" height="4" fill="#0f172a" />
        <rect x="11" y="12" width="2" height="2" fill="#ffffff" />
        <rect x="18" y="11" width="4" height="4" fill="#0f172a" />
        <rect x="19" y="12" width="2" height="2" fill="#ffffff" />
        <rect x="12" y="18" width="8" height="3" fill="#b91c1c" />
        <rect x="14" y="19" width="4" height="1" fill="#ffffff" />
        <rect x="5" y="24" width="22" height="8" fill="#2563eb" />
        <polygon points="12,24 16,28 20,24" fill="#ffffff" />
        <rect x="15" y="26" width="2" height="6" fill="#f97316" />
      </svg>
    );
  }

  if (type === 'lee') {
    return (
      <svg viewBox="0 0 32 32" className="w-full h-full shape-rendering-crispEdges">
        <rect width="32" height="32" fill="#201824" />
        <rect x="6" y="3" width="20" height="8" fill="#701a75" />
        <rect x="4" y="6" width="5" height="15" fill="#701a75" />
        <rect x="23" y="6" width="5" height="15" fill="#701a75" />
        <rect x="8" y="8" width="16" height="15" fill="#ffedd5" />
        <rect x="10" y="12" width="3" height="3" fill="#0f172a" />
        <rect x="19" y="12" width="3" height="3" fill="#0f172a" />
        <rect x="22" y="9" width="2" height="3" fill="#38bdf8" />
        <rect x="13" y="19" width="6" height="1.5" fill="#9f1239" />
        <rect x="6" y="24" width="20" height="8" fill="#db2777" />
        <rect x="14" y="24" width="4" height="3" fill="#ffedd5" />
      </svg>
    );
  }

  if (type === 'monster') {
    return (
      <svg viewBox="0 0 32 32" className="w-full h-full shape-rendering-crispEdges">
        <rect width="32" height="32" fill="#450a0a" />
        <polygon points="6,2 10,8 4,8" fill="#ef4444" />
        <polygon points="26,2 28,8 22,8" fill="#ef4444" />
        <rect x="6" y="8" width="20" height="16" fill="#b91c1c" />
        <rect x="9" y="12" width="5" height="4" fill="#facc15" />
        <rect x="18" y="12" width="5" height="4" fill="#facc15" />
        <rect x="11" y="13" width="2" height="2" fill="#000000" />
        <rect x="20" y="13" width="2" height="2" fill="#000000" />
        <rect x="10" y="18" width="12" height="4" fill="#1e1b4b" />
        <polygon points="11,18 13,21 15,18" fill="#ffffff" />
        <polygon points="17,18 19,21 21,18" fill="#ffffff" />
      </svg>
    );
  }

  if (type === 'glasses') {
    return (
      <svg viewBox="0 0 32 32" className="w-full h-full shape-rendering-crispEdges">
        <rect width="32" height="32" fill="#064e3b" />
        <rect x="4" y="10" width="10" height="8" fill="#0f172a" />
        <rect x="6" y="12" width="6" height="4" fill="#38bdf8" />
        <rect x="18" y="10" width="10" height="8" fill="#0f172a" />
        <rect x="20" y="12" width="6" height="4" fill="#38bdf8" />
        <rect x="14" y="13" width="4" height="2" fill="#0f172a" />
        <polygon points="16,3 18,7 14,7" fill="#fde047" />
      </svg>
    );
  }

  if (type === 'server') {
    return (
      <svg viewBox="0 0 32 32" className="w-full h-full shape-rendering-crispEdges">
        <rect width="32" height="32" fill="#030712" />
        <rect x="4" y="4" width="24" height="24" fill="#1e293b" />
        <rect x="6" y="7" width="20" height="4" fill="#0f172a" />
        <rect x="8" y="8" width="3" height="2" fill="#22c55e" />
        <rect x="13" y="8" width="3" height="2" fill="#3b82f6" />
        <rect x="6" y="14" width="20" height="4" fill="#0f172a" />
        <rect x="8" y="15" width="3" height="2" fill="#ef4444" />
        <rect x="13" y="15" width="3" height="2" fill="#22c55e" />
      </svg>
    );
  }

  if (type === 'coffee') {
    return (
      <svg viewBox="0 0 32 32" className="w-full h-full shape-rendering-crispEdges">
        <rect width="32" height="32" fill="#1e1b18" />
        <rect x="8" y="12" width="14" height="14" fill="#d97706" />
        <rect x="22" y="15" width="4" height="8" fill="#b45309" />
        <rect x="10" y="7" width="2" height="4" fill="#ffffff" opacity="0.6" />
        <rect x="14" y="5" width="2" height="5" fill="#ffffff" opacity="0.8" />
        <rect x="18" y="7" width="2" height="4" fill="#ffffff" opacity="0.6" />
      </svg>
    );
  }

  if (type === 'door') {
    return (
      <svg viewBox="0 0 32 32" className="w-full h-full shape-rendering-crispEdges">
        <rect width="32" height="32" fill="#0f172a" />
        <rect x="6" y="4" width="20" height="26" fill="#78350f" />
        <rect x="8" y="6" width="16" height="22" fill="#9a3412" />
        <rect x="20" y="17" width="3" height="3" fill="#fde047" />
      </svg>
    );
  }

  if (type === 'plant') {
    return (
      <svg viewBox="0 0 32 32" className="w-full h-full shape-rendering-crispEdges">
        <rect width="32" height="32" fill="#064e3b" />
        <rect x="10" y="18" width="12" height="12" fill="#92400e" />
        <circle cx="16" cy="12" r="8" fill="#16a34a" />
        <circle cx="14" cy="10" r="5" fill="#22c55e" />
      </svg>
    );
  }

  if (type === 'report') {
    return (
      <svg viewBox="0 0 32 32" className="w-full h-full shape-rendering-crispEdges">
        <rect width="32" height="32" fill="#1e293b" />
        <rect x="6" y="4" width="20" height="24" fill="#ffffff" />
        <rect x="8" y="7" width="16" height="3" fill="#dc2626" />
        <rect x="8" y="12" width="16" height="2" fill="#475569" />
        <rect x="8" y="16" width="12" height="2" fill="#475569" />
        <rect x="8" y="20" width="14" height="2" fill="#475569" />
        <rect x="18" y="22" width="6" height="4" fill="#ef4444" />
      </svg>
    );
  }

  if (type === 'board') {
    return (
      <svg viewBox="0 0 32 32" className="w-full h-full shape-rendering-crispEdges">
        <rect width="32" height="32" fill="#1c1917" />
        <rect x="3" y="3" width="26" height="26" fill="#78350f" />
        <rect x="5" y="5" width="22" height="22" fill="#0f172a" />
        <rect x="7" y="7" width="9" height="9" fill="#fef08a" />
        <rect x="8" y="9" width="7" height="1" fill="#713f12" />
        <rect x="18" y="8" width="7" height="8" fill="#fca5a5" />
        <rect x="8" y="18" width="16" height="7" fill="#67e8f9" />
      </svg>
    );
  }

  // default / Kim Dae-ri
  return (
    <svg viewBox="0 0 32 32" className="w-full h-full shape-rendering-crispEdges">
      <rect width="32" height="32" fill="#111827" />
      <rect x="7" y="3" width="18" height="7" fill="#172554" />
      <rect x="5" y="6" width="4" height="11" fill="#172554" />
      <rect x="23" y="6" width="4" height="11" fill="#172554" />
      <rect x="8" y="7" width="16" height="16" fill="#fed7aa" />
      <rect x="10" y="12" width="3" height="3" fill="#0f172a" />
      <rect x="19" y="12" width="3" height="3" fill="#0f172a" />
      <rect x="13" y="18" width="6" height="1.5" fill="#451a03" />
      <rect x="5" y="24" width="22" height="8" fill="#0369a1" />
      <polygon points="12,24 16,28 20,24" fill="#ffffff" />
      <rect x="15" y="26" width="2" height="6" fill="#ea580c" />
    </svg>
  );
}

// --- 쯔꾸르 오브젝트 데이터 ---
interface TsukuruObject {
  id: string;
  name: string;
  speaker: string;
  map: 'office' | 'server_room' | 'ending_room';
  portraitType: 'manager' | 'peer' | 'lee' | 'report' | 'board' | 'desk' | 'coffee' | 'door' | 'plant' | 'monster' | 'server' | 'glasses';
  x: number;
  y: number;
  width: number;
  height: number;
  standX: number;
  standY: number;
  indicatorX?: number;
  indicatorY?: number;
  pages: string[];
}

const BASE_TSUKURU_OBJECTS: TsukuruObject[] = [
  {
    id: 'manager',
    name: '김과장',
    speaker: '김과장',
    map: 'office',
    portraitType: 'manager',
    x: 160,
    y: 80,
    width: 40,
    height: 36,
    standX: 180,
    standY: 130,
    indicatorX: 180,
    indicatorY: 48,
    pages: [
      '"이봐, 김대리! 아직도 은행 예금이나 구식 제조 기업 주식을 들고 있나? 시대를 모르는 바보들이나 그러는 거야."',
      '"지금 온 세상의 컴퓨터가 \'인터넷\'으로 연결되고 있어. 전 세계 모든 기업이 그 인프라를 깔기 위해 오직 이 기업의 네트워크 장비만 줄 서서 사고 있다고!"',
      '"그 장비를 독점한 세계 1등 기업인데, 이건 정말 무조건 10배는 더 갈 걸세. 당장 집 보증금이라도 빼서 넣어야 해!"'
    ]
  },
  {
    id: 'peer',
    name: '박동기',
    speaker: '박동기',
    map: 'office',
    portraitType: 'peer',
    x: 340,
    y: 80,
    width: 40,
    height: 36,
    standX: 360,
    standY: 130,
    indicatorX: 360,
    indicatorY: 48,
    pages: [
      '"나 지난주에 그 종목에 1,000만 원 넣었는데, 벌써 40%나 올랐어!"',
      '"하루 만에 내 한 달 월급만큼 버는 기적 같은 세상이 왔는데, 매일 아침 졸린 눈 비비며 출근하는 게 무슨 의미가 있냐?"',
      '"지금 탑승 안 하면 우리 평생 벼락거지 못 면해. 이건 인류 역사상 가장 확실하고 안전한 미래라니까?"'
    ]
  },
  {
    id: 'lee',
    name: '이대리',
    speaker: '이대리',
    map: 'office',
    portraitType: 'lee',
    x: 430,
    y: 135,
    width: 32,
    height: 32,
    standX: 430,
    standY: 165,
    indicatorX: 445,
    indicatorY: 96,
    pages: [
      '"김대리님... 사무실에 오면 다들 일은 안 하고 그 주식 얘기뿐이에요."',
      '"어제는 친구들 모임에서도 다 그 회사 얘기만 하더라고요. 나만 안 사서 뒤처지는 게 아닐까... 너무 불안하고 조급해요."'
    ]
  },
  {
    id: 'report',
    name: '증권 리포트',
    speaker: '증권사 특급 리포트',
    map: 'office',
    portraitType: 'report',
    x: 50,
    y: 90,
    width: 36,
    height: 30,
    standX: 60,
    standY: 130,
    indicatorX: 62,
    indicatorY: 60,
    pages: [
      '[증권사 특급 분석 보고서]\n"인터넷 혁명을 독점 지배하는 세계 1등 기업. 목표주가 10배 상향!"',
      '"역사상 가장 완벽한 독점 인프라이며, 이 기업이 무너지는 것은 상상할 수 없습니다. 망설이지 말고 투자하십시오."'
    ]
  },
  {
    id: 'board',
    name: '게시판',
    speaker: '사내 게시판 & 신문',
    map: 'office',
    portraitType: 'board',
    x: 255,
    y: 35,
    width: 48,
    height: 30,
    standX: 280,
    standY: 75,
    indicatorX: 279,
    indicatorY: 18,
    pages: [
      '[경제 헤드라인 특종]\n"마이크로소프트를 제치고 전 세계 시가총액 1위 등극! 이 시대의 절대 제왕 탄생."',
      '"구시대의 낡은 잣대로 새로운 패러다임을 평가하지 마십시오. 이 기업이 없는 포트폴리오는 자산의 사망선고나 다름없습니다."'
    ]
  },
  {
    id: 'coffee',
    name: '믹스커피',
    speaker: '믹스커피',
    map: 'office',
    portraitType: 'coffee',
    x: 510,
    y: 65,
    width: 30,
    height: 30,
    standX: 510,
    standY: 95,
    indicatorX: 518,
    indicatorY: 52,
    pages: [
      '달콤한 믹스커피 한 잔을 타서 마셨다.',
      '광기 어린 사무실 분위기 속에서 복잡했던 머리가 잠시 차분해진다. (정신이 맑아집니다)'
    ]
  },
  {
    id: 'door',
    name: '출입문',
    speaker: '출입문',
    map: 'office',
    portraitType: 'door',
    x: 260,
    y: 275,
    width: 40,
    height: 24,
    standX: 280,
    standY: 255,
    indicatorX: 280,
    indicatorY: 260,
    pages: [
      '사무실 밖으로 나가는 출입문이다.',
      '지금은 그냥 나갈 수 없다. 오늘 내 소중한 1,000만 원의 투자 결정을 내려야 한다!'
    ]
  },
  {
    id: 'plant_left',
    name: '화분',
    speaker: '초록 화분',
    map: 'office',
    portraitType: 'plant',
    x: 20,
    y: 190,
    width: 24,
    height: 24,
    standX: 45,
    standY: 190,
    indicatorX: 32,
    indicatorY: 172,
    pages: [
      '바닥에 놓인 싱그러운 초록 화분이다.',
      '주변 사람들의 탐욕과 조급함 속에서도 묵묵히 제자리를 지키고 있다.'
    ]
  },
  {
    id: 'plant_right',
    name: '화분',
    speaker: '초록 화분',
    map: 'office',
    portraitType: 'plant',
    x: 480,
    y: 190,
    width: 24,
    height: 24,
    standX: 460,
    standY: 190,
    indicatorX: 492,
    indicatorY: 172,
    pages: [
      '바닥에 놓인 차분한 초록 화분이다.',
      '광기 서린 공기 속에서도 푸른 잎사귀를 피워내고 있다.'
    ]
  },
  {
    id: 'server_door',
    name: '서버실 입구',
    speaker: '비밀 서버실 문',
    map: 'office',
    portraitType: 'server',
    x: 80,
    y: 35,
    width: 36,
    height: 32,
    standX: 98,
    standY: 75,
    indicatorX: 98,
    indicatorY: 22,
    pages: [
      '비밀 서버실로 통하는 문이다. 안쪽에서 기묘한 기운과 기계음이 들려온다.',
      '서버실 내부로 들어가 보시겠습니까?'
    ]
  },
  {
    id: 'my_desk',
    name: '내 책상',
    speaker: '김대리 (나)',
    map: 'office',
    portraitType: 'desk',
    x: 210,
    y: 185,
    width: 54,
    height: 36,
    standX: 236,
    standY: 235,
    indicatorX: 236,
    indicatorY: 160,
    pages: [
      '내 자리 책상에 앉았다. 모니터에는 평생 피땀 흘려 모은 소중한 자금 1,000만 원 통장 잔고가 떠 있다.',
      '주변 동료들의 압도적인 권유와 광기를 마주한 지금... 나는 어떤 선택을 내려야 할까?'
    ]
  },

  // 2. Server Room Entities (Side Room)
  {
    id: 'fomo_monster',
    name: '광기의 FOMO',
    speaker: 'Lv.99 광기의 FOMO',
    map: 'server_room',
    portraitType: 'monster',
    x: 210,
    y: 85,
    width: 48,
    height: 48,
    standX: 234,
    standY: 165,
    indicatorX: 234,
    indicatorY: 62,
    pages: [
      '"크하하하! 나는 시장의 조급함과 탐욕이 만들어낸 괴물, FOMO다!"',
      '"남들은 다 하루에 천만 원씩 버는데, 너 혼자 바보처럼 가만히 있을 셈이냐?! 벼락거지가 되기 싫으면 지금 당장 올인해라!"'
    ]
  },
  {
    id: 'dropped_glasses',
    name: '떨어진 안경',
    speaker: '냉철한 멘탈의 안경',
    map: 'server_room',
    portraitType: 'glasses',
    x: 220,
    y: 120,
    width: 28,
    height: 28,
    standX: 234,
    standY: 165,
    indicatorX: 234,
    indicatorY: 98,
    pages: [
      '바닥에서 반짝이는 안경을 주웠다! [냉철한 멘탈의 안경]을 장착했다!',
      '💡 이제 주변 사람들의 광기 어린 대화 속에서 냉정한 본질을 꿰뚫어 볼 수 있습니다.'
    ]
  },
  {
    id: 'back_to_office',
    name: '사무실 복귀문',
    speaker: '사무실 통로',
    map: 'server_room',
    portraitType: 'door',
    x: 215,
    y: 240,
    width: 36,
    height: 24,
    standX: 233,
    standY: 215,
    indicatorX: 233,
    indicatorY: 215,
    pages: [
      '메인 사무실로 돌아가는 통로 문이다.'
    ]
  },

  // 3. Ending Room Entities
  {
    id: 'ending_desk_a',
    name: '야수의 모니터',
    speaker: '야수의 심장으로 퇴근',
    map: 'ending_room',
    portraitType: 'monster',
    x: 215,
    y: 80,
    width: 70,
    height: 44,
    standX: 250,
    standY: 155,
    indicatorX: 250,
    indicatorY: 60,
    pages: [
      '집에 와서도 불을 끄지 못한 채 밤새 모니터 앞을 지키고 있습니다.',
      '"내일 아침 미국 장이 열리면 내 천만 원은 어떻게 될까...?"',
      '끝없는 조급함과 두려움에 잠 못 이루는 밤이 깊어갑니다.'
    ]
  },
  {
    id: 'ending_bed_b',
    name: '편안한 침대',
    speaker: '소나기를 피한 퇴근',
    map: 'ending_room',
    portraitType: 'desk',
    x: 215,
    y: 80,
    width: 70,
    height: 44,
    standX: 250,
    standY: 155,
    indicatorX: 250,
    indicatorY: 60,
    pages: [
      '일단 폭락의 공포를 피해 편안하게 발 뻗고 잠자리에 듭니다.',
      '"휴, 다행이다... 하지만 내 통장 잔고는 가만히 있는데 세상 물가는 계속 오르네?"',
      '소나기는 피했지만, 보이지 않는 인플레이션에 소중한 구매력이 조금씩 녹아내리고 있습니다.'
    ]
  },
  {
    id: 'ending_study_c',
    name: '여유로운 서재',
    speaker: '현명한 투자자의 정시 퇴근',
    map: 'ending_room',
    portraitType: 'desk',
    x: 215,
    y: 80,
    width: 70,
    height: 44,
    standX: 250,
    standY: 155,
    indicatorX: 250,
    indicatorY: 60,
    pages: [
      '마음 편히 정시 퇴근하여 여유로운 저녁 일상을 누립니다.',
      '"영원한 1등 기업은 없지만, 시장 시스템은 알아서 최고의 기업들로 채워지며 우상향한다."',
      '25년 동안 시장의 거인들과 함께할 위대한 첫 단추를 채우고, 단단한 멘탈의 투자자로 첫걸음을 내딛었습니다!'
    ]
  }
];

// --- 맵별 물리 충돌(Obstacle) 영역 정의 ---
interface ObstacleRect {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

const OFFICE_OBSTACLES: ObstacleRect[] = [
  // 상단 벽 및 복도 경계
  { minX: 0, minY: 0, maxX: 560, maxY: 48 },
  // 증권 리포트 / 복사기 (45, 75, 34, 30)
  { minX: 38, minY: 68, maxX: 85, maxY: 110 },
  // 김과장 책상 & 의자 & 캐릭터 (152, 85, 56, 32 + chair)
  { minX: 146, minY: 66, maxX: 214, maxY: 122 },
  // 박동기 책상 & 의자 & 캐릭터 (332, 85, 56, 32 + chair)
  { minX: 326, minY: 66, maxX: 394, maxY: 122 },
  // 이대리 캐릭터 & 의자 (445, 135)
  { minX: 428, minY: 112, maxX: 464, maxY: 152 },
  // 믹스커피 머신 (505, 65, 26, 30)
  { minX: 498, minY: 58, maxX: 536, maxY: 100 },
  // 좌측 화분 (20, 190, 24, 24)
  { minX: 14, minY: 180, maxX: 48, maxY: 218 },
  // 우측 화분 (480, 190, 24, 24)
  { minX: 472, minY: 180, maxX: 508, maxY: 218 },
  // 김대리 책상 & 의자 (208, 185, 56, 32)
  { minX: 202, minY: 172, maxX: 270, maxY: 222 },
  // 하단 출입문 기둥 및 바닥 경계 (260, 275, 40, 30)
  { minX: 254, minY: 275, maxX: 306, maxY: 320 }
];

const isBlocked = (
  x: number,
  y: number,
  map: 'office' | 'server_room' | 'ending_room',
  hasDefeatedBoss: boolean
): boolean => {
  // 맵 전체 외곽선 경계 (바깥으로 나가지 못하게 제한)
  if (x < 22 || x > 538 || y < 50 || y > 300) return true;

  // 플레이어 발바닥 기준 히트박스 (폭 12px, 높이 8px)
  const pMinX = x - 6;
  const pMaxX = x + 6;
  const pMinY = y - 4;
  const pMaxY = y + 4;

  if (map === 'office') {
    for (const obs of OFFICE_OBSTACLES) {
      if (pMaxX > obs.minX && pMinX < obs.maxX && pMaxY > obs.minY && pMinY < obs.maxY) {
        return true;
      }
    }
  } else if (map === 'server_room') {
    // 서버실 맵 장애물
    if (y < 46) return true;

    // 대형 서버랙 5개 (i=0, 1, 3, 4, 5)
    const rackIndices = [0, 1, 3, 4, 5];
    for (const i of rackIndices) {
      const rx = 40 + i * 80;
      if (pMaxX > rx - 2 && pMinX < rx + 52 && pMaxY > 38 && pMinY < 162) {
        return true;
      }
    }

    // 중앙 랙 / 보스 영역 (i=2, rx=200..250)
    if (!hasDefeatedBoss) {
      if (pMaxX > 198 && pMinX < 262 && pMaxY > 40 && pMinY < 145) {
        return true;
      }
    } else {
      // 보스 격파 후: 안경 뒤 배경 서버랙
      if (pMaxX > 198 && pMinX < 252 && pMaxY > 38 && pMinY < 110) {
        return true;
      }
    }

    // 사무실 복귀문 테두리
    if (pMaxX > 212 && pMinX < 254 && pMaxY > 230 && pMinY < 265) {
      return true;
    }
  } else if (map === 'ending_room') {
    if (y < 46) return true;
    // 중앙 가구 (책상 / 침대 / 서재)
    if (pMaxX > 205 && pMinX < 295 && pMaxY > 65 && pMinY < 140) {
      return true;
    }
  }

  return false;
};

export default function CiscoManiaGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  
  // Maps & Location
  const [currentMap, setCurrentMap] = useState<'office' | 'server_room' | 'ending_room'>('office');
  
  // Dialogue state
  const [activeObj, setActiveObj] = useState<TsukuruObject | null>(null);
  const [pageIndex, setPageIndex] = useState<number>(0);
  const [typedText, setTypedText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Battle state & Items
  const [inBattle, setInBattle] = useState<boolean>(false);
  const [bossHp, setBossHp] = useState<number>(100);
  const [playerMental, setPlayerMental] = useState<number>(100);
  const [isShieldActive, setIsShieldActive] = useState<boolean>(false);
  const [battleLog, setBattleLog] = useState<string>('광기의 FOMO가 나타났다! 조급함의 압박을 견뎌내라!');
  const [hasDefeatedBoss, setHasDefeatedBoss] = useState<boolean>(false);
  const [hasPickedUpGlasses, setHasPickedUpGlasses] = useState<boolean>(false);
  
  // Game flow state
  const [showChoiceModal, setShowChoiceModal] = useState<boolean>(false);
  const [selectedChoice, setSelectedChoice] = useState<'A' | 'B' | 'C' | null>(null);
  const [isWarping, setIsWarping] = useState<boolean>(false);
  const [visitedNpcs, setVisitedNpcs] = useState<Set<string>>(new Set());

  // Player State with 90-degree Manhattan Grid walking
  const playerRef = useRef({
    x: 235,
    y: 235,
    targetX: 235,
    targetY: 235,
    targetObjId: null as string | null,
    speed: 3.2,
    direction: 'up' as 'up' | 'down' | 'left' | 'right',
    stepTimer: 0,
    isMoving: false
  });

  const keysRef = useRef<{ [key: string]: boolean }>({});

  // 1.5x Zoom-in Viewport
  const VIEWPORT_WIDTH = 320;
  const VIEWPORT_HEIGHT = 190;

  // Toggle Sound
  const handleToggleSound = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  };

  // Keyboard Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showChoiceModal || isWarping || inBattle) return;

      const code = e.code;
      const key = e.key.toLowerCase();

      if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(code) ||
          ['w', 'a', 's', 'd'].includes(key)) {
        e.preventDefault();
        keysRef.current[code] = true;
        keysRef.current[key] = true;
        playerRef.current.targetObjId = null;
      }

      if (code === 'Space' || code === 'Enter') {
        e.preventDefault();
        if (activeObj) {
          handleDialogueAction();
        } else if (!showChoiceModal && !selectedChoice) {
          checkNearbyInteraction();
        }
      }

      if (code === 'Escape' || key === 'escape') {
        e.preventDefault();
        setActiveObj(null);
        setPageIndex(0);
        setShowChoiceModal(false);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const code = e.code;
      const key = e.key.toLowerCase();
      keysRef.current[code] = false;
      keysRef.current[key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [activeObj, showChoiceModal, selectedChoice, pageIndex, isWarping, inBattle, isTyping]);

  // 2-Step Dialogue Action (Skip Typing -> Next Page / Trigger Event)
  const handleDialogueAction = () => {
    if (!activeObj) return;

    // 1. If currently typing, skip typing and immediately show 100% of current page
    const fullText = activeObj.pages[pageIndex] || '';
    if (isTyping) {
      if (typingTimerRef.current) {
        clearInterval(typingTimerRef.current);
        typingTimerRef.current = null;
      }
      setTypedText(fullText);
      setIsTyping(false);
      return;
    }

    // 2. If already 100% shown, proceed to next page or close
    if (pageIndex < activeObj.pages.length - 1) {
      sounds.playSelect();
      setPageIndex((prev) => prev + 1);
    } else {
      sounds.playSelect();
      const finishedId = activeObj.id;
      setActiveObj(null);
      setPageIndex(0);

      // Event triggers
      if (finishedId === 'server_door') {
        setCurrentMap('server_room');
        playerRef.current.x = 233;
        playerRef.current.y = 210;
        playerRef.current.targetX = 233;
        playerRef.current.targetY = 210;
      } else if (finishedId === 'back_to_office') {
        setCurrentMap('office');
        playerRef.current.x = 98;
        playerRef.current.y = 95;
        playerRef.current.targetX = 98;
        playerRef.current.targetY = 95;
      } else if (finishedId === 'ending_exit_door') {
        setCurrentMap('office');
        playerRef.current.x = 280;
        playerRef.current.y = 245;
        playerRef.current.targetX = 280;
        playerRef.current.targetY = 245;
      } else if (finishedId === 'door') {
        if (selectedChoice) {
          setCurrentMap('ending_room');
          playerRef.current.x = 250;
          playerRef.current.y = 210;
          playerRef.current.targetX = 250;
          playerRef.current.targetY = 210;
          
          const targetEndingId = selectedChoice === 'A' ? 'ending_desk_a' : selectedChoice === 'B' ? 'ending_bed_b' : 'ending_study_c';
          const targetEndingObj = BASE_TSUKURU_OBJECTS.find(o => o.id === targetEndingId);
          if (targetEndingObj) {
            setTimeout(() => {
              setActiveObj(targetEndingObj);
              setPageIndex(0);
            }, 250);
          }
        }
      } else if (finishedId === 'dropped_glasses') {
        sounds.playItemGet();
        setHasPickedUpGlasses(true);
      } else if (finishedId === 'fomo_monster' && !hasDefeatedBoss) {
        setInBattle(true);
        setBossHp(100);
        setPlayerMental(100);
        setBattleLog('광기의 FOMO가 나타났다! 조급함의 압박을 견뎌내라!');
        sounds.startBattleBgm();
      } else if (finishedId === 'my_desk' && (visitedNpcs.has('manager') || visitedNpcs.has('peer') || visitedNpcs.has('lee') || hasPickedUpGlasses)) {
        setShowChoiceModal(true);
      }
    }
  };

  const startDialogue = (obj: TsukuruObject) => {
    sounds.playSelect();
    
    // Check exit door condition
    if (obj.id === 'door') {
      if (selectedChoice) {
        setActiveObj({
          ...obj,
          pages: [
            '퇴근 카드를 찍고 사무실 문을 열었다.'
          ]
        });
        setPageIndex(0);
        return;
      } else {
        setActiveObj({
          ...obj,
          pages: [
            '사무실 밖으로 나가는 출입문이다.',
            '지금은 그냥 나갈 수 없다. 오늘 내 소중한 1,000만 원의 투자 결정을 먼저 내려야 한다!'
          ]
        });
        setPageIndex(0);
        return;
      }
    }

    // Check desk quest condition
    if (obj.id === 'my_desk' && !visitedNpcs.has('manager') && !visitedNpcs.has('peer') && !visitedNpcs.has('lee') && !hasPickedUpGlasses) {
      setActiveObj({
        ...obj,
        pages: [
          '통장에 1,000만 원이 있긴 한데... 지금 사무실 분위기가 심상치 않다.',
          '먼저 주변 동료들의 이야기를 들어보거나 사무실을 둘러본 뒤 결정하자.'
        ]
      });
      setPageIndex(0);
      return;
    }

    // Add mind-reading insight hints if glasses equipped!
    let displayPages = [...obj.pages];
    if (hasPickedUpGlasses) {
      if (obj.id === 'manager') {
        displayPages.push('(집 보증금까지 걸 정도로 다들 이성을 잃었어... 폭락의 전조다.)');
      } else if (obj.id === 'peer') {
        displayPages.push('(하루 만에 월급을 번다고 들떠있지만... 비정상적인 급등 뒤에는 큰 위험이 따라.)');
      } else if (obj.id === 'lee') {
        displayPages.push('(나만 안 사서 손해 보는 것 같은 불안함... 이 조급함에 휩쓸려 충동적으로 사면 안 돼.)');
      }
    }

    if (['manager', 'peer', 'lee'].includes(obj.id)) {
      setVisitedNpcs((prev) => new Set([...prev, obj.id]));
    }

    setActiveObj({
      ...obj,
      pages: displayPages
    });
    setPageIndex(0);
  };

  const checkNearbyInteraction = useCallback(() => {
    const p = playerRef.current;
    const currentObjs = BASE_TSUKURU_OBJECTS.filter(o => {
      if (o.map !== currentMap) return false;
      if (currentMap === 'office' && selectedChoice !== null) {
        return o.id === 'door';
      }
      if (o.id === 'fomo_monster' && hasDefeatedBoss) return false;
      if (o.id === 'dropped_glasses' && (!hasDefeatedBoss || hasPickedUpGlasses)) return false;
      if (currentMap === 'ending_room') {
        if (o.id === 'ending_desk_a' && selectedChoice !== 'A') return false;
        if (o.id === 'ending_bed_b' && selectedChoice !== 'B') return false;
        if (o.id === 'ending_study_c' && selectedChoice !== 'C') return false;
      }
      return true;
    });

    for (const obj of currentObjs) {
      const dist = Math.hypot((obj.x + obj.width / 2) - p.x, (obj.y + obj.height / 2) - p.y);
      if (dist < 48) {
        startDialogue(obj);
        return;
      }
    }
  }, [currentMap, visitedNpcs, hasDefeatedBoss, hasPickedUpGlasses, selectedChoice]);

  // Canvas Click/Touch Handler with Manhattan (L-shaped) Grid Walking & Obstacle Avoidance
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (showChoiceModal || isWarping || inBattle) return;

    if (activeObj) {
      handleDialogueAction();
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const scaleX = VIEWPORT_WIDTH / rect.width;
    const scaleY = VIEWPORT_HEIGHT / rect.height;
    
    const p = playerRef.current;
    const camX = Math.max(0, Math.min(560 - VIEWPORT_WIDTH, p.x - VIEWPORT_WIDTH / 2));
    const camY = Math.max(0, Math.min(320 - VIEWPORT_HEIGHT, p.y - VIEWPORT_HEIGHT / 2));

    const worldClickX = (clientX - rect.left) * scaleX + camX;
    const worldClickY = (clientY - rect.top) * scaleY + camY;

    // Grid snap 20px
    const targetGridX = Math.round(worldClickX / 20) * 20;
    const targetGridY = Math.round(worldClickY / 20) * 20;

    const currentObjs = BASE_TSUKURU_OBJECTS.filter(o => {
      if (o.map !== currentMap) return false;
      if (currentMap === 'office' && selectedChoice !== null) {
        return o.id === 'door';
      }
      if (o.id === 'fomo_monster' && hasDefeatedBoss) return false;
      if (o.id === 'dropped_glasses' && (!hasDefeatedBoss || hasPickedUpGlasses)) return false;
      if (currentMap === 'ending_room') {
        if (o.id === 'ending_desk_a' && selectedChoice !== 'A') return false;
        if (o.id === 'ending_bed_b' && selectedChoice !== 'B') return false;
        if (o.id === 'ending_study_c' && selectedChoice !== 'C') return false;
      }
      return true;
    });

    for (const obj of currentObjs) {
      const isClicked = 
        worldClickX >= obj.x - 14 && worldClickX <= obj.x + obj.width + 14 &&
        worldClickY >= obj.y - 14 && worldClickY <= obj.y + obj.height + 18;

      if (isClicked) {
        const currentDist = Math.hypot((obj.x + obj.width / 2) - p.x, (obj.y + obj.height / 2) - p.y);
        
        if (currentDist < 52) {
          startDialogue(obj);
          return;
        }

        p.targetX = obj.standX;
        p.targetY = obj.standY;
        p.targetObjId = obj.id;
        return;
      }
    }

    playerRef.current.targetObjId = null;
    const clampedTargetX = Math.max(24, Math.min(536, targetGridX));
    const clampedTargetY = Math.max(52, Math.min(296, targetGridY));
    
    // If target position is inside an obstacle, find nearest free position
    if (isBlocked(clampedTargetX, clampedTargetY, currentMap, hasDefeatedBoss)) {
      const offsets = [
        [0, 20], [0, -20], [20, 0], [-20, 0],
        [20, 20], [-20, 20], [20, -20], [-20, -20]
      ];
      let resolved = false;
      for (const [ox, oy] of offsets) {
        const testX = clampedTargetX + ox;
        const testY = clampedTargetY + oy;
        if (!isBlocked(testX, testY, currentMap, hasDefeatedBoss)) {
          playerRef.current.targetX = testX;
          playerRef.current.targetY = testY;
          resolved = true;
          break;
        }
      }
      if (!resolved) {
        playerRef.current.targetX = p.x;
        playerRef.current.targetY = p.y;
      }
    } else {
      playerRef.current.targetX = clampedTargetX;
      playerRef.current.targetY = clampedTargetY;
    }
  };

  // Robust Typing effect with ref cleanup to fix the skip-typing bug
  useEffect(() => {
    if (!activeObj) {
      setTypedText('');
      setIsTyping(false);
      if (typingTimerRef.current) {
        clearInterval(typingTimerRef.current);
        typingTimerRef.current = null;
      }
      return;
    }

    const currentText = activeObj.pages[pageIndex] || '';
    let idx = 0;
    setTypedText('');
    setIsTyping(true);

    if (typingTimerRef.current) {
      clearInterval(typingTimerRef.current);
    }

    typingTimerRef.current = setInterval(() => {
      idx++;
      setTypedText(currentText.slice(0, idx));
      if (idx % 2 === 0) {
        sounds.playTextBlip();
      }
      if (idx >= currentText.length) {
        setIsTyping(false);
        if (typingTimerRef.current) {
          clearInterval(typingTimerRef.current);
          typingTimerRef.current = null;
        }
      }
    }, 16);

    return () => {
      if (typingTimerRef.current) {
        clearInterval(typingTimerRef.current);
        typingTimerRef.current = null;
      }
    };
  }, [activeObj, pageIndex]);

  // Main 60FPS Tsukuru 2D Canvas Engine with Manhattan 90-degree Walking & Physical Obstacle Collisions
  useEffect(() => {
    if (inBattle) return;
    let animId: number;

    const loop = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const p = playerRef.current;

      // 1. Movement logic: Manhattan L-shaped 90-degree Grid Walking with Collision Stopping/Sliding
      if (!showChoiceModal && !isWarping && !activeObj) {
        let keyDx = 0;
        let keyDy = 0;

        if (keysRef.current['KeyW'] || keysRef.current['w'] || keysRef.current['ArrowUp']) keyDy -= 1;
        if (keysRef.current['KeyS'] || keysRef.current['s'] || keysRef.current['ArrowDown']) keyDy += 1;
        if (keysRef.current['KeyA'] || keysRef.current['a'] || keysRef.current['ArrowLeft']) keyDx -= 1;
        if (keysRef.current['KeyD'] || keysRef.current['d'] || keysRef.current['ArrowRight']) keyDx += 1;

        if (keyDx !== 0 || keyDy !== 0) {
          // Keyboard axis movement with collision check
          if (keyDx !== 0) {
            const nextX = p.x + keyDx * p.speed;
            p.direction = keyDx > 0 ? 'right' : 'left';
            if (!isBlocked(nextX, p.y, currentMap, hasDefeatedBoss)) {
              p.x = nextX;
              p.isMoving = true;
            } else {
              p.isMoving = false;
            }
          } else if (keyDy !== 0) {
            const nextY = p.y + keyDy * p.speed;
            p.direction = keyDy > 0 ? 'down' : 'up';
            if (!isBlocked(p.x, nextY, currentMap, hasDefeatedBoss)) {
              p.y = nextY;
              p.isMoving = true;
            } else {
              p.isMoving = false;
            }
          }
          p.targetX = p.x;
          p.targetY = p.y;
          p.targetObjId = null;
        } else {
          // Mouse Click Destination: Move along X axis first, then Y axis with obstacle avoidance
          const distX = p.targetX - p.x;
          const distY = p.targetY - p.y;

          if (Math.abs(distX) > 2.5) {
            const stepX = Math.sign(distX) * Math.min(Math.abs(distX), p.speed);
            p.direction = distX > 0 ? 'right' : 'left';
            if (!isBlocked(p.x + stepX, p.y, currentMap, hasDefeatedBoss)) {
              p.x += stepX;
              p.isMoving = true;
            } else {
              // X blocked, try moving Y towards targetY if possible
              if (Math.abs(distY) > 2.5) {
                const stepY = Math.sign(distY) * Math.min(Math.abs(distY), p.speed);
                p.direction = distY > 0 ? 'down' : 'up';
                if (!isBlocked(p.x, p.y + stepY, currentMap, hasDefeatedBoss)) {
                  p.y += stepY;
                  p.isMoving = true;
                } else {
                  p.isMoving = false;
                  p.targetX = p.x;
                  p.targetY = p.y;
                }
              } else {
                p.isMoving = false;
                p.targetX = p.x;
                p.targetY = p.y;
              }
            }
          } else if (Math.abs(distY) > 2.5) {
            const stepY = Math.sign(distY) * Math.min(Math.abs(distY), p.speed);
            p.direction = distY > 0 ? 'down' : 'up';
            if (!isBlocked(p.x, p.y + stepY, currentMap, hasDefeatedBoss)) {
              p.y += stepY;
              p.isMoving = true;
            } else {
              // Y blocked, try moving X towards targetX if possible
              if (Math.abs(distX) > 2.5) {
                const stepX = Math.sign(distX) * Math.min(Math.abs(distX), p.speed);
                p.direction = distX > 0 ? 'right' : 'left';
                if (!isBlocked(p.x + stepX, p.y, currentMap, hasDefeatedBoss)) {
                  p.x += stepX;
                  p.isMoving = true;
                } else {
                  p.isMoving = false;
                  p.targetX = p.x;
                  p.targetY = p.y;
                }
              } else {
                p.isMoving = false;
                p.targetX = p.x;
                p.targetY = p.y;
              }
            }
          } else {
            p.isMoving = false;
            if (p.targetObjId) {
              const targetObj = BASE_TSUKURU_OBJECTS.find(o => o.id === p.targetObjId);
              p.targetObjId = null;
              if (targetObj) {
                startDialogue(targetObj);
              }
            }
          }
        }
      }

      // Bounds clamp
      const mapWidth = 560;
      const mapHeight = 320;
      p.x = Math.max(22, Math.min(mapWidth - 22, p.x));
      p.y = Math.max(50, Math.min(mapHeight - 22, p.y));

      if (p.isMoving) {
        p.stepTimer++;
        if (p.stepTimer % 18 === 0) {
          sounds.playFootstep();
        }
      }

      // 2. Camera Viewport Calculation (Centered on Kim Dae-ri)
      const camX = Math.max(0, Math.min(mapWidth - VIEWPORT_WIDTH, p.x - VIEWPORT_WIDTH / 2));
      const camY = Math.max(0, Math.min(mapHeight - VIEWPORT_HEIGHT, p.y - VIEWPORT_HEIGHT / 2));

      ctx.save();
      ctx.clearRect(0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);
      ctx.translate(-camX, -camY);

      // --- RENDERING MAP ---
      if (currentMap === 'office') {
        // Floor
        const tileSize = 20;
        for (let x = 0; x < mapWidth; x += tileSize) {
          for (let y = 0; y < mapHeight; y += tileSize) {
            const isCarpet = x >= 100 && x <= 440 && y >= 60 && y <= 260;
            if (isCarpet) {
              const isAlt = ((x / tileSize) + (y / tileSize)) % 2 === 0;
              ctx.fillStyle = isAlt ? '#14532d' : '#166534';
              ctx.fillRect(x, y, tileSize, tileSize);
            } else {
              const isAlt = ((x / tileSize) + (y / tileSize)) % 2 === 0;
              ctx.fillStyle = isAlt ? '#2d1b12' : '#26170f';
              ctx.fillRect(x, y, tileSize, tileSize);
              ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
              ctx.fillRect(x, y + tileSize - 1, tileSize, 1);
            }
          }
        }

        // Top Wall
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, mapWidth, 48);
        ctx.fillStyle = '#451a03';
        ctx.fillRect(0, 44, mapWidth, 5);
        ctx.fillStyle = '#78350f';
        ctx.fillRect(0, 47, mapWidth, 2);

        // Server Room Entrance (Left Top)
        ctx.fillStyle = '#1e1b4b';
        ctx.fillRect(80, 10, 36, 34);
        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(82, 12, 32, 30);
        ctx.fillStyle = '#60a5fa';
        ctx.fillRect(86, 16, 24, 22);
        ctx.font = 'bold 8px monospace';
        ctx.fillStyle = '#93c5fd';
        ctx.textAlign = 'center';
        ctx.fillText('서버실', 98, 42);

        // Center Board
        ctx.fillStyle = '#92400e';
        ctx.fillRect(255, 8, 48, 32);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(257, 10, 44, 28);
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(262, 14, 10, 8);
        ctx.fillStyle = '#f87171';
        ctx.fillRect(276, 15, 9, 9);
        ctx.fillStyle = '#60a5fa';
        ctx.fillRect(288, 20, 10, 10);
        ctx.font = 'bold 8px monospace';
        ctx.fillStyle = '#fde047';
        ctx.textAlign = 'center';
        ctx.fillText('게시판', 279, 46);

        // Exit Door (Bottom Center Wall)
        ctx.fillStyle = '#78350f';
        ctx.fillRect(260, 275, 40, 30);
        ctx.fillStyle = '#9a3412';
        ctx.fillRect(262, 277, 36, 28);
        ctx.fillStyle = '#fde047';
        ctx.fillRect(290, 290, 4, 4);
        ctx.font = 'bold 8px monospace';
        ctx.fillStyle = '#cbd5e1';
        ctx.textAlign = 'center';
        ctx.fillText('출입문', 280, 272);

        // Photocopier (Left)
        ctx.fillStyle = '#475569';
        ctx.fillRect(45, 75, 34, 30);
        ctx.fillStyle = '#64748b';
        ctx.fillRect(47, 77, 30, 16);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(52, 80, 10, 6);
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(64, 80, 10, 12);
        ctx.font = 'bold 8px monospace';
        ctx.fillStyle = '#f87171';
        ctx.fillText('증권 리포트', 62, 114);

        // Mix Coffee (Far Right Top Breakroom)
        ctx.fillStyle = '#334155';
        ctx.fillRect(505, 65, 26, 30);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(508, 68, 20, 10);
        ctx.fillStyle = '#f97316';
        ctx.fillRect(512, 82, 6, 8);
        ctx.font = 'bold 8px monospace';
        ctx.fillStyle = '#fb923c';
        ctx.fillText('믹스커피', 518, 102);

        // Floor Plants (Left & Right Corners on Floor)
        const drawFloorPlant = (px: number, py: number) => {
          ctx.fillStyle = '#92400e';
          ctx.fillRect(px + 4, py + 12, 16, 14);
          ctx.fillStyle = '#15803d';
          ctx.beginPath();
          ctx.arc(px + 12, py + 10, 11, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#22c55e';
          ctx.beginPath();
          ctx.arc(px + 10, py + 8, 6, 0, Math.PI * 2);
          ctx.fill();
        };
        drawFloorPlant(20, 190);
        drawFloorPlant(480, 190);

        // Sitting Chairs & Characters
        const drawTsukuruChar = (cx: number, cy: number, hair: string, suit: string, pants: string, tie?: string) => {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
          ctx.beginPath();
          ctx.ellipse(cx, cy + 6, 8.5, 4, 0, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = pants;
          ctx.fillRect(cx - 5, cy, 3.5, 6);
          ctx.fillRect(cx + 1.5, cy, 3.5, 6);

          ctx.fillStyle = suit;
          ctx.fillRect(cx - 6, cy - 11, 12, 11);

          if (tie) {
            ctx.fillStyle = tie;
            ctx.fillRect(cx - 1, cy - 11, 2, 7);
          }

          ctx.fillStyle = '#fed7aa';
          ctx.fillRect(cx - 5, cy - 20, 10, 9);

          ctx.fillStyle = hair;
          ctx.fillRect(cx - 6, cy - 23, 12, 5);
          ctx.fillRect(cx - 6, cy - 19, 2, 4);
          ctx.fillRect(cx + 4, cy - 19, 2, 4);

          ctx.fillStyle = '#0f172a';
          ctx.fillRect(cx - 3, cy - 16, 2, 2);
          ctx.fillRect(cx + 1, cy - 16, 2, 2);
        };

        const drawChair = (cx: number, cy: number) => {
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(cx - 8, cy - 16, 16, 18);
          ctx.fillStyle = '#334155';
          ctx.fillRect(cx - 6, cy - 14, 12, 14);
        };

        drawChair(180, 88);
        drawChair(360, 88);
        drawChair(236, 192);

        // Sitting NPCs
        drawTsukuruChar(180, 82, '#451a03', '#f59e0b', '#1e293b', '#dc2626'); // Kim Gwa-jang
        drawTsukuruChar(360, 82, '#1e1b4b', '#3b82f6', '#1e293b', '#f97316'); // Park Dong-gi
        drawTsukuruChar(445, 135, '#701a75', '#db2777', '#334155'); // Lee Dae-ri (Separated!)
        ctx.font = 'bold 8.5px sans-serif';
        ctx.fillStyle = '#f472b6';
        ctx.textAlign = 'center';
        ctx.fillText('이대리', 445, 112);

        // Desks with Monitor Backs
        const drawOfficeDesk = (dx: number, dy: number, label: string, isBackView: boolean, isMine: boolean) => {
          ctx.fillStyle = isMine ? '#854d0e' : '#78350f';
          ctx.fillRect(dx, dy, 56, 32);
          ctx.fillStyle = isMine ? '#a16207' : '#9a3412';
          ctx.fillRect(dx + 2, dy + 2, 52, 28);

          if (isBackView) {
            ctx.fillStyle = '#64748b';
            ctx.fillRect(dx + 18, dy + 2, 20, 16);
            ctx.fillStyle = '#475569';
            ctx.fillRect(dx + 20, dy + 4, 16, 12);
            ctx.fillStyle = '#334155';
            ctx.fillRect(dx + 26, dy + 16, 4, 6);
          } else {
            ctx.fillStyle = '#e2e8f0';
            ctx.fillRect(dx + 18, dy - 6, 20, 16);
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(dx + 20, dy - 4, 16, 12);
            ctx.fillStyle = '#22c55e';
            ctx.fillRect(dx + 22, dy - 2, 12, 8);
          }

          ctx.font = 'bold 8.5px monospace';
          ctx.fillStyle = isMine ? '#4ade80' : '#fde047';
          ctx.textAlign = 'center';
          ctx.fillText(label, dx + 28, dy + 42);
        };

        drawOfficeDesk(152, 85, '김과장', true, false);
        drawOfficeDesk(332, 85, '박동기', true, false);
        drawOfficeDesk(208, 185, '내 책상', false, true);

      } else if (currentMap === 'server_room') {
        // --- SERVER ROOM MAP ---
        ctx.fillStyle = '#020617';
        ctx.fillRect(0, 0, mapWidth, mapHeight);

        for (let i = 0; i < 6; i++) {
          const rx = 40 + i * 80;
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(rx, 40, 50, 120);
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(rx + 4, 44, 42, 112);

          for (let row = 0; row < 5; row++) {
            ctx.fillStyle = '#334155';
            ctx.fillRect(rx + 6, 50 + row * 20, 38, 16);
            const blink = Math.floor(Date.now() / 250 + i + row) % 3;
            ctx.fillStyle = blink === 0 ? '#22c55e' : blink === 1 ? '#3b82f6' : '#ef4444';
            ctx.fillRect(rx + 8, 54 + row * 20, 4, 3);
            ctx.fillRect(rx + 14, 54 + row * 20, 4, 3);
          }
        }

        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(215, 230, 36, 26);
        ctx.font = 'bold 8px monospace';
        ctx.fillStyle = '#93c5fd';
        ctx.textAlign = 'center';
        ctx.fillText('사무실 복귀', 233, 222);

        // Boss Monster (Before defeat)
        if (!hasDefeatedBoss) {
          const mx = 210;
          const my = 85;
          ctx.fillStyle = '#dc2626';
          ctx.beginPath();
          ctx.arc(mx + 24, my + 24, 20 + Math.sin(Date.now() / 150) * 3, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#facc15';
          ctx.fillRect(mx + 12, my + 16, 8, 6);
          ctx.fillRect(mx + 28, my + 16, 8, 6);
          ctx.font = 'bold 9px monospace';
          ctx.fillStyle = '#f87171';
          ctx.textAlign = 'center';
          ctx.fillText('Lv.99 광기의 FOMO', mx + 24, my - 6);
        } else if (!hasPickedUpGlasses) {
          // Dropped Glasses on Floor (Glow Item)
          const gx = 224;
          const gy = 120;
          const bounce = Math.sin(Date.now() / 180) * 3;
          ctx.fillStyle = '#fde047';
          ctx.beginPath();
          ctx.arc(gx + 10, gy + 10 + bounce, 12, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#0f172a';
          ctx.fillRect(gx + 4, gy + 8 + bounce, 5, 4);
          ctx.fillRect(gx + 11, gy + 8 + bounce, 5, 4);
          ctx.fillRect(gx + 8, gy + 9 + bounce, 4, 2);

          ctx.font = 'bold 8px monospace';
          ctx.fillStyle = '#fef08a';
          ctx.textAlign = 'center';
          ctx.fillText('✨ 멘탈의 안경', gx + 10, gy - 2 + bounce);
        }
      } else if (currentMap === 'ending_room') {
        // --- ENDING ROOM MAP ---
        if (selectedChoice === 'A') {
          // === ENDING A: Dark Night Room with glowing chart & FOMO shadow ===
          ctx.fillStyle = '#050811';
          ctx.fillRect(0, 0, mapWidth, mapHeight);

          // Floor
          ctx.fillStyle = '#111827';
          ctx.fillRect(0, 50, mapWidth, mapHeight - 50);

          // Window (Night sky with stars)
          ctx.fillStyle = '#020617';
          ctx.fillRect(80, 20, 60, 45);
          ctx.strokeStyle = '#334155';
          ctx.lineWidth = 2;
          ctx.strokeRect(80, 20, 60, 45);
          ctx.fillStyle = '#f8fafc';
          ctx.fillRect(95, 30, 2, 2);
          ctx.fillRect(120, 25, 1.5, 1.5);
          ctx.fillRect(105, 45, 1.5, 1.5);
          ctx.fillRect(130, 50, 2, 2);

          // Spooky FOMO Silhouette behind monitor (Center)
          const fomoPulse = Math.sin(Date.now() / 180) * 3;
          ctx.fillStyle = 'rgba(185, 28, 28, 0.35)';
          ctx.beginPath();
          ctx.arc(250, 65, 32 + fomoPulse, 0, Math.PI * 2);
          ctx.fill();
          // Red glowing eyes in shadow
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(240, 58, 6, 4);
          ctx.fillRect(254, 58, 6, 4);
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(242, 59, 2, 2);
          ctx.fillRect(256, 59, 2, 2);

          // Desk
          ctx.fillStyle = '#1f2937';
          ctx.fillRect(215, 95, 70, 36);
          ctx.fillStyle = '#374151';
          ctx.fillRect(217, 97, 66, 32);

          // Glowing Monitor with volatile plunging chart
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(235, 70, 30, 24);
          ctx.fillStyle = '#0284c7';
          ctx.fillRect(237, 72, 26, 20);
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(238, 76);
          ctx.lineTo(245, 74);
          ctx.lineTo(252, 86);
          ctx.lineTo(261, 90);
          ctx.stroke();

          // Monitor light glow beam on desk
          ctx.fillStyle = 'rgba(56, 189, 248, 0.12)';
          ctx.beginPath();
          ctx.moveTo(235, 94);
          ctx.lineTo(205, 140);
          ctx.lineTo(295, 140);
          ctx.lineTo(265, 94);
          ctx.fill();

          ctx.font = 'bold 9px monospace';
          ctx.fillStyle = '#f87171';
          ctx.textAlign = 'center';
          ctx.fillText('[야수의 심장으로 퇴근]', 250, 148);

        } else if (selectedChoice === 'B') {
          // === ENDING B: Cozy Moonlit Bedroom ===
          ctx.fillStyle = '#0b132b';
          ctx.fillRect(0, 0, mapWidth, mapHeight);

          // Floor
          ctx.fillStyle = '#1c2541';
          ctx.fillRect(0, 50, mapWidth, mapHeight - 50);

          // Window (Crescent moon)
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(80, 20, 60, 45);
          ctx.strokeStyle = '#475569';
          ctx.lineWidth = 2;
          ctx.strokeRect(80, 20, 60, 45);
          ctx.fillStyle = '#fde047';
          ctx.beginPath();
          ctx.arc(115, 40, 10, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#1e293b';
          ctx.beginPath();
          ctx.arc(119, 38, 9, 0, Math.PI * 2);
          ctx.fill();

          // Bed with Blanket
          ctx.fillStyle = '#334155';
          ctx.fillRect(215, 80, 70, 50);
          ctx.fillStyle = '#f8fafc';
          ctx.fillRect(220, 83, 20, 12); // Pillow
          ctx.fillStyle = '#059669';
          ctx.fillRect(225, 95, 56, 32); // Green Blanket

          // Floating zZZ particles
          const zPulse = (Date.now() / 300) % 3;
          ctx.font = 'bold 9px sans-serif';
          ctx.fillStyle = '#93c5fd';
          ctx.fillText('z', 235 - zPulse * 3, 75 - zPulse * 6);
          ctx.fillText('Z', 242 - zPulse * 3, 68 - zPulse * 6);

          // Nightstand with Bankbook & Coins
          ctx.fillStyle = '#78350f';
          ctx.fillRect(295, 85, 24, 24);
          ctx.fillStyle = '#3b82f6';
          ctx.fillRect(298, 88, 10, 8); // Bankbook
          ctx.fillStyle = '#fde047';
          ctx.beginPath();
          ctx.arc(312, 92, 3, 0, Math.PI * 2); // Coin
          ctx.fill();

          ctx.font = 'bold 9px monospace';
          ctx.fillStyle = '#34d399';
          ctx.textAlign = 'center';
          ctx.fillText('[소나기를 피한 퇴근]', 250, 148);

        } else {
          // === ENDING C: Warm Morning Study with S&P 500 ===
          ctx.fillStyle = '#292524';
          ctx.fillRect(0, 0, mapWidth, mapHeight);

          // Floor (Warm parquet)
          ctx.fillStyle = '#44403c';
          ctx.fillRect(0, 50, mapWidth, mapHeight - 50);

          // Sunlit Window (Morning Sun)
          ctx.fillStyle = '#fef3c7';
          ctx.fillRect(80, 20, 60, 45);
          ctx.strokeStyle = '#78350f';
          ctx.lineWidth = 2;
          ctx.strokeRect(80, 20, 60, 45);
          ctx.fillStyle = '#f59e0b';
          ctx.beginPath();
          ctx.arc(110, 48, 12, 0, Math.PI * 2);
          ctx.fill();

          // Warm Study Desk & Chair
          ctx.fillStyle = '#78350f';
          ctx.fillRect(215, 85, 70, 40);
          ctx.fillStyle = '#9a3412';
          ctx.fillRect(217, 87, 66, 36);

          // Laptop Screen with Smooth Green Upward S&P 500 curve
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(235, 72, 30, 22);
          ctx.fillStyle = '#064e3b';
          ctx.fillRect(237, 74, 26, 18);
          ctx.strokeStyle = '#4ade80';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(239, 88);
          ctx.quadraticCurveTo(248, 86, 261, 76);
          ctx.stroke();

          // Steaming Coffee Cup & Open Book
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(222, 94, 6, 7); // Coffee Cup
          ctx.fillStyle = '#fdba74';
          ctx.fillRect(272, 94, 10, 8); // Book

          ctx.font = 'bold 9px monospace';
          ctx.fillStyle = '#4ade80';
          ctx.textAlign = 'center';
          ctx.fillText('[현명한 투자자의 정시 퇴근]', 250, 148);
        }
      }

      // Draw Player (Kim Dae-ri) with 4-Directional Sprites (down, up, left, right)
      const legSwing = p.isMoving ? Math.sin(p.stepTimer * 0.45) * 3 : 0;
      ctx.save();
      ctx.translate(p.x, p.y);

      // Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.beginPath();
      ctx.ellipse(0, 7, 9, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      if (p.direction === 'up') {
        // --- 1. 후면 (UP / Back View) ---
        // Legs (back of dark trousers)
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-5, 0, 3.5, 6 + legSwing);
        ctx.fillRect(1.5, 0, 3.5, 6 - legSwing);

        // Back Suit Coat (Solid blue, no tie visible)
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(-6, -11, 12, 11);
        ctx.fillStyle = '#0369a1';
        ctx.fillRect(-0.5, -11, 1, 9);

        // Back Head / Hair (full dark blue hair covering back)
        ctx.fillStyle = '#172554';
        ctx.fillRect(-6, -23, 12, 12);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-5, -13, 10, 2);

      } else if (p.direction === 'left') {
        // --- 2. 좌측 (LEFT / Side View) ---
        // Legs (side walking)
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-4, 0, 3.5, 6 - legSwing);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0.5, 0, 3.5, 6 + legSwing);

        // Side Suit Body & Arm
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(-5, -11, 10, 11);
        ctx.fillStyle = '#0369a1';
        ctx.fillRect(-3, -10, 3.5, 8);
        // Subtle tie peek on left side
        ctx.fillStyle = '#f97316';
        ctx.fillRect(-5, -7, 1.5, 3);

        // Side Head & Hair
        ctx.fillStyle = '#fed7aa';
        ctx.fillRect(-5, -20, 7, 9);
        ctx.fillStyle = '#172554';
        ctx.fillRect(-6, -23, 9, 5);
        ctx.fillRect(1, -22, 3, 10);

        // Face feature (glasses only if picked up, else eye)
        if (hasPickedUpGlasses) {
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(-5, -17, 3.5, 3);
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(-4.5, -16, 2, 1);
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(-1.5, -16, 4, 1);
        } else {
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(-4, -16, 2, 2);
        }

      } else if (p.direction === 'right') {
        // --- 3. 우측 (RIGHT / Side View) ---
        // Legs (side walking)
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-4, 0, 3.5, 6 + legSwing);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0.5, 0, 3.5, 6 - legSwing);

        // Side Suit Body & Arm
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(-5, -11, 10, 11);
        ctx.fillStyle = '#0369a1';
        ctx.fillRect(-0.5, -10, 3.5, 8);
        // Subtle tie peek on right side
        ctx.fillStyle = '#f97316';
        ctx.fillRect(3.5, -7, 1.5, 3);

        // Side Head & Hair
        ctx.fillStyle = '#fed7aa';
        ctx.fillRect(-2, -20, 7, 9);
        ctx.fillStyle = '#172554';
        ctx.fillRect(-3, -23, 9, 5);
        ctx.fillRect(-4, -22, 3, 10);

        // Face feature (glasses only if picked up, else eye)
        if (hasPickedUpGlasses) {
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(1.5, -17, 3.5, 3);
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(2.5, -16, 2, 1);
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(-2.5, -16, 4, 1);
        } else {
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(2, -16, 2, 2);
        }

      } else {
        // --- 4. 전면 (DOWN / Front View - Default) ---
        // Legs
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-5, 0, 3.5, 6 + legSwing);
        ctx.fillRect(1.5, 0, 3.5, 6 - legSwing);

        // Suit & Front Orange Tie
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(-6, -11, 12, 11);
        ctx.fillStyle = '#f97316';
        ctx.fillRect(-1, -11, 2, 7);

        // Face & Front Hair Fringe
        ctx.fillStyle = '#fed7aa';
        ctx.fillRect(-5, -20, 10, 9);
        ctx.fillStyle = '#172554';
        ctx.fillRect(-6, -23, 12, 5);
        ctx.fillRect(-6, -19, 2, 3);
        ctx.fillRect(4, -19, 2, 3);

        // Face feature (glasses only if picked up, else two eyes)
        if (hasPickedUpGlasses) {
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(-4, -17, 4, 3);
          ctx.fillRect(1, -17, 4, 3);
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(-3, -16, 2, 1);
          ctx.fillRect(2, -16, 2, 1);
        } else {
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(-3, -16, 2, 2);
          ctx.fillRect(1, -16, 2, 2);
        }
      }

      ctx.font = 'bold 8.5px sans-serif';
      ctx.fillStyle = '#38bdf8';
      ctx.textAlign = 'center';
      ctx.fillText(hasPickedUpGlasses ? '김대리 👓' : '김대리', 0, -27);

      ctx.restore();

      // Floating '!' Indicators positioned accurately above heads/tops
      const currentObjs = BASE_TSUKURU_OBJECTS.filter(o => {
        if (o.map !== currentMap) return false;
        if (currentMap === 'office' && selectedChoice !== null) {
          return o.id === 'door';
        }
        if (o.id === 'fomo_monster' && hasDefeatedBoss) return false;
        if (o.id === 'dropped_glasses' && (!hasDefeatedBoss || hasPickedUpGlasses)) return false;
        if (currentMap === 'ending_room') {
          if (o.id === 'ending_desk_a' && selectedChoice !== 'A') return false;
          if (o.id === 'ending_bed_b' && selectedChoice !== 'B') return false;
          if (o.id === 'ending_study_c' && selectedChoice !== 'C') return false;
        }
        return true;
      });

      currentObjs.forEach((obj) => {
        const ix = obj.indicatorX ?? (obj.x + obj.width / 2);
        const iy = obj.indicatorY ?? (obj.y - 12);
        const dist = Math.hypot((obj.x + obj.width / 2) - p.x, (obj.y + obj.height / 2) - p.y);

        if (dist < 48) {
          const bounce = Math.sin(Date.now() / 160) * 3;
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(ix, iy + bounce, 5.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 8px monospace';
          ctx.textAlign = 'center';
          ctx.fillText('!', ix, iy + 2.5 + bounce);
        }
      });

      ctx.restore();

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [activeObj, showChoiceModal, selectedChoice, currentMap, inBattle, hasDefeatedBoss, hasPickedUpGlasses]);

  // Turn-Based RPG Battle Commands
  const handlePlayerAttack = () => {
    sounds.playAttack();
    const dmg = 45;
    const newHp = Math.max(0, bossHp - dmg);
    setBossHp(newHp);
    setBattleLog(`김대리의 [원칙의 일격]! "영원한 1등은 없다!" (FOMO에게 ${dmg} 데미지!)`);

    if (newHp <= 0) {
      setTimeout(() => {
        sounds.stopBattleBgm();
        sounds.playVictory();
        setHasDefeatedBoss(true);
        setInBattle(false);
        setBattleLog('FOMO를 격파했다! 바닥에 [냉철한 멘탈의 안경]이 떨어졌다!');
      }, 1000);
      return;
    }

    // Boss Turn
    setTimeout(() => {
      if (isShieldActive) {
        setBattleLog('FOMO의 유혹: "너만 빼고 다 부자 됐어!" ➔ [이성의 방패]로 완벽 방어!');
        setIsShieldActive(false);
      } else {
        const bossDmg = 25;
        setPlayerMental((prev) => Math.max(10, prev - bossDmg));
        setBattleLog(`FOMO의 유혹: "너만 빼고 다 부자 됐어!" (멘탈 -${bossDmg} 피해!)`);
      }
    }, 900);
  };

  const handlePlayerDefend = () => {
    sounds.playSelect();
    setIsShieldActive(true);
    setBattleLog('김대리가 [이성의 방패]를 펼쳤다! "남들의 속도에 흔들리지 않는다!" (방어 태세)');

    setTimeout(() => {
      setBattleLog('FOMO의 압박을 [이성의 방패]로 튕겨냈다! (데미지 0)');
      setIsShieldActive(false);
    }, 800);
  };

  const handlePlayerHeal = () => {
    sounds.playSelect();
    setPlayerMental((prev) => Math.min(100, prev + 35));
    setBattleLog('김대리가 믹스커피의 온기를 떠올리며 [심호흡]을 했다! (멘탈 +35 회복)');

    setTimeout(() => {
      if (isShieldActive) {
        setBattleLog('FOMO의 유혹 공격을 방어했다!');
        setIsShieldActive(false);
      } else {
        setPlayerMental((prev) => Math.max(10, prev - 20));
        setBattleLog('FOMO가 조급함을 자극했다! (멘탈 -20)');
      }
    }, 800);
  };

  const handleRunAway = () => {
    sounds.stopBattleBgm();
    sounds.playSelect();
    setInBattle(false);
    setCurrentMap('office');
    playerRef.current.x = 98;
    playerRef.current.y = 95;
  };

  // Choice Selection
  const handleSelectChoice = (choice: 'A' | 'B' | 'C') => {
    sounds.playSelect();
    setShowChoiceModal(false);
    setIsWarping(true);

    if (choice === 'A') sounds.playCrash();
    if (choice === 'B') sounds.playInflation();
    if (choice === 'C') sounds.playVictory();

    setTimeout(() => {
      setSelectedChoice(choice);
      setIsWarping(false);
    }, 1000);
  };

  const handleReset = () => {
    sounds.stopBattleBgm();
    sounds.playSelect();
    setSelectedChoice(null);
    setShowChoiceModal(false);
    setActiveObj(null);
    setPageIndex(0);
    setIsWarping(false);
    setInBattle(false);
    setCurrentMap('office');
    setHasDefeatedBoss(false);
    setHasPickedUpGlasses(false);
    playerRef.current.x = 235;
    playerRef.current.y = 235;
    playerRef.current.targetX = 235;
    playerRef.current.targetY = 235;
    playerRef.current.targetObjId = null;
  };

  return (
    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border-2 border-[var(--accent-orange)]/50 bg-neutral-950 text-white shadow-2xl my-6 select-none font-sans">
      {/* Header Bar */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between border-b border-neutral-700">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
          </span>
          <span className="font-mono text-xs sm:text-sm font-extrabold text-[var(--accent-orange)] tracking-wide">
            그때 그 광기
          </span>
          {hasPickedUpGlasses && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
              <Award className="w-3 h-3" />
              <span>멘탈의 안경 착용 중</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleSound}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border ${
              isMuted
                ? 'bg-neutral-800 text-neutral-400 border-neutral-700'
                : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
            }`}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />}
            <span className="text-[11px] hidden sm:inline">{isMuted ? '음소거' : '사운드 ON'}</span>
          </button>

          {selectedChoice && (
            <button
              onClick={handleReset}
              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-neutral-800 text-neutral-300 hover:text-white transition-colors cursor-pointer border border-neutral-700 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="text-[11px]">다시 하기</span>
            </button>
          )}
        </div>
      </div>

      {/* Canvas Area (Instant Start) - Mobile Square 1:1, Desktop 16:10 */}
      <div className="relative w-full aspect-square sm:aspect-[16/10] bg-neutral-950 flex items-center justify-center overflow-hidden">
        
        {/* 1. TURN-BASED RPG BATTLE SCREEN */}
        {inBattle && (
          <div className="absolute inset-0 bg-neutral-950 z-30 p-3 sm:p-5 flex flex-col justify-between overflow-y-auto animate-in fade-in duration-200">
            {/* Top: Boss Monster Status */}
            <div className="space-y-1 sm:space-y-2 max-w-md mx-auto w-full text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto animate-bounce">
                <FacePortrait type="monster" />
              </div>
              <h4 className="font-extrabold text-xs sm:text-base text-red-400">
                [Lv.99 광기의 FOMO]
              </h4>
              {/* Boss HP Bar */}
              <div className="w-full h-2.5 sm:h-3 bg-neutral-800 rounded-full overflow-hidden border border-red-500/40 p-0.5">
                <div 
                  className="h-full bg-red-500 rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(239,68,68,0.6)]"
                  style={{ width: `${bossHp}%` }}
                />
              </div>
              <span className="text-[9px] sm:text-[10px] font-mono text-neutral-400">HP: {bossHp}/100</span>
            </div>

            {/* Middle: Battle Log Box */}
            <div className="p-2.5 sm:p-3.5 rounded-xl bg-neutral-900/90 border-2 border-neutral-700 text-[11px] sm:text-sm text-neutral-200 font-mono leading-relaxed text-center min-h-[44px] sm:min-h-[50px] flex items-center justify-center">
              {battleLog}
            </div>

            {/* Bottom: Player Mental Bar & Action Commands */}
            <div className="space-y-2 sm:space-y-3 max-w-lg mx-auto w-full">
              <div className="flex justify-between items-center text-[11px] sm:text-xs font-mono">
                <span className="font-bold text-sky-400">김대리 멘탈</span>
                <span className="text-emerald-400 font-bold">{playerMental}/100</span>
              </div>
              <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden border border-sky-500/40 p-0.5">
                <div 
                  className="h-full bg-sky-500 rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(14,165,233,0.5)]"
                  style={{ width: `${playerMental}%` }}
                />
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 pt-0.5">
                <button
                  onClick={handlePlayerAttack}
                  className="p-2 sm:p-2.5 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-500 text-white text-[11px] sm:text-xs font-extrabold flex flex-col items-center gap-1 cursor-pointer active:scale-95 transition-all"
                >
                  <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400" />
                  <span>원칙의 일격</span>
                </button>
                <button
                  onClick={handlePlayerDefend}
                  className="p-2 sm:p-2.5 rounded-xl bg-blue-950/80 hover:bg-blue-900 border border-blue-500 text-white text-[11px] sm:text-xs font-extrabold flex flex-col items-center gap-1 cursor-pointer active:scale-95 transition-all"
                >
                  <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400" />
                  <span>이성의 방패</span>
                </button>
                <button
                  onClick={handlePlayerHeal}
                  className="p-2 sm:p-2.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500 text-white text-[11px] sm:text-xs font-extrabold flex flex-col items-center gap-1 cursor-pointer active:scale-95 transition-all"
                >
                  <Coffee className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
                  <span>심호흡</span>
                </button>
                <button
                  onClick={handleRunAway}
                  className="p-2 sm:p-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-600 text-neutral-300 text-[11px] sm:text-xs font-bold flex flex-col items-center gap-1 cursor-pointer active:scale-95 transition-all"
                >
                  <DoorOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-400" />
                  <span>도망치기</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2. ACTUAL 2D TSUKURU CANVAS */}
        {!inBattle && (
          <canvas
            ref={canvasRef}
            width={VIEWPORT_WIDTH}
            height={VIEWPORT_HEIGHT}
            onClick={handleCanvasClick}
            onTouchStart={handleCanvasClick}
            className="w-full h-full object-contain cursor-pointer"
            style={{ imageRendering: 'pixelated' }}
          />
        )}

        {/* Time Warp Cutscene */}
        {isWarping && (
          <div className="absolute inset-0 bg-neutral-950 z-40 flex flex-col items-center justify-center space-y-3 animate-in fade-in duration-500">
            <div className="text-3xl sm:text-5xl font-black text-[var(--accent-orange)] tracking-widest font-mono animate-pulse">
              ⏳
            </div>
            <p className="text-xs sm:text-sm font-bold text-neutral-300">
              시간이 흐르는 중...
            </p>
          </div>
        )}

        {/* Authentic Tsukuru RPG Dialogue Box */}
        {!inBattle && activeObj && !showChoiceModal && (
          <div 
            onClick={handleDialogueAction}
            className="absolute bottom-2.5 inset-x-2.5 sm:inset-x-8 z-30 animate-in fade-in slide-in-from-bottom-2 duration-150 cursor-pointer"
          >
            <div className="relative p-3 sm:p-4 rounded-xl bg-gradient-to-b from-neutral-950/95 via-neutral-900/95 to-neutral-950/95 border-2 border-neutral-400 shadow-2xl backdrop-blur-md flex gap-3 sm:gap-4 items-start">
              
              {/* Character Portrait */}
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-neutral-950 border border-neutral-600 p-0.5 flex items-center justify-center shrink-0 overflow-hidden shadow-inner">
                <FacePortrait type={activeObj.portraitType} />
              </div>

              {/* Right Speech Area */}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs sm:text-sm text-emerald-400 font-mono tracking-tight">
                    [{activeObj.speaker}]
                  </span>
                  <span className="text-[10px] text-neutral-400 font-mono">
                    {pageIndex + 1} / {activeObj.pages.length}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-neutral-100 leading-relaxed font-medium min-h-[42px] whitespace-pre-line">
                  {typedText}
                </p>

                <div className="flex justify-end pt-1 items-center">
                  <span className="text-white font-black text-xs animate-pulse select-none flex items-center gap-1">
                    <span className="text-[10px] text-neutral-400 font-normal">
                      {isTyping ? 'Skip' : pageIndex < activeObj.pages.length - 1 ? 'Next' : 'Close'}
                    </span>
                    <span>▼</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Decision Modal */}
      {showChoiceModal && !selectedChoice && (
        <div className="p-4 sm:p-6 bg-neutral-900 border-t border-neutral-700 space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-[var(--accent-orange)]/20 text-[var(--accent-orange)]">
                <Coins className="w-4 h-4" />
              </span>
              <h4 className="text-sm sm:text-base font-extrabold text-white">
                [당신의 선택] 평생 모은 소중한 자금 1,000만 원, 어떤 선택을 내리시겠습니까?
              </h4>
            </div>
            <button
              onClick={() => setShowChoiceModal(false)}
              className="text-xs text-neutral-400 hover:text-white px-2.5 py-1 rounded bg-neutral-800 cursor-pointer"
            >
              더 둘러보기 [ESC]
            </button>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {/* Choice A */}
            <button
              onClick={() => handleSelectChoice('A')}
              className="p-3.5 sm:p-4 rounded-xl text-left bg-neutral-800/90 hover:bg-red-950/40 border border-neutral-700 hover:border-red-500 transition-all flex items-start gap-3 cursor-pointer group"
            >
              <span className="w-6 h-6 rounded-lg bg-red-500/20 text-red-400 font-black flex items-center justify-center text-xs shrink-0 mt-0.5">
                A
              </span>
              <div className="space-y-0.5">
                <span className="text-xs sm:text-sm font-bold text-white group-hover:text-red-300 transition-colors block">
                  &quot;모두가 극찬하는 세계 1등, 결국은 오를 거니까 그 전설적인 혁신 기업에 1,000만 원을 올인한다!&quot;
                </span>
                <span className="text-[11px] text-red-400 font-medium block">
                  🔥 세계 1위 독점 테크 기업에 전 재산 100% 집중 투자
                </span>
              </div>
            </button>

            {/* Choice B */}
            <button
              onClick={() => handleSelectChoice('B')}
              className="p-3.5 sm:p-4 rounded-xl text-left bg-neutral-800/90 hover:bg-amber-950/40 border border-neutral-700 hover:border-amber-500 transition-all flex items-start gap-3 cursor-pointer group"
            >
              <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 font-black flex items-center justify-center text-xs shrink-0 mt-0.5">
                B
              </span>
              <div className="space-y-0.5">
                <span className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-300 transition-colors block">
                  &quot;도저히 불안해서 안 되겠다. 주식을 전량 팔고 100% 안전한 정기예금에 묻어둔다.&quot;
                </span>
                <span className="text-[11px] text-amber-400 font-medium block">
                  🛡️ 주식 시장에서 완전히 발을 빼고 은행 금고에 현금 보관
                </span>
              </div>
            </button>

            {/* Choice C */}
            <button
              onClick={() => handleSelectChoice('C')}
              className="p-3.5 sm:p-4 rounded-xl text-left bg-neutral-800/90 hover:bg-emerald-950/40 border border-neutral-700 hover:border-emerald-500 transition-all flex items-start gap-3 cursor-pointer group"
            >
              <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 font-black flex items-center justify-center text-xs shrink-0 mt-0.5">
                C
              </span>
              <div className="space-y-0.5">
                <span className="text-xs sm:text-sm font-bold text-white group-hover:text-emerald-300 transition-colors block">
                  &quot;주변 동료들에게 &apos;시대를 모르는 겁쟁이&apos;라 조롱받아도, 묵묵히 미국 상위 500개 기업(S&P 500)을 사 모은다.&quot;
                </span>
                <span className="text-[11px] text-emerald-400 font-medium block">
                  🌐 개별 기업 예측을 포기하고 미국 시장 시스템 전체를 공동 구매
                </span>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Results Display */}
      {selectedChoice && (
        <div className="p-4 sm:p-7 bg-neutral-900 border-t border-neutral-700 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-[var(--accent-orange)] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>➔ 당신의 선택에 따른 25년 뒤 결말</span>
            </span>
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 text-xs text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 px-3 py-1.5 rounded-lg transition-colors cursor-pointer border border-neutral-700 font-bold"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>처음부터 다시 플레이</span>
            </button>
          </div>

          {/* Result A */}
          {selectedChoice === 'A' && (
            <div className="p-5 sm:p-6 rounded-2xl bg-red-950/30 border-2 border-red-500/40 space-y-4">
              <div className="flex items-center gap-2 text-red-400 font-black text-base sm:text-lg">
                <XCircle className="w-5 h-5 shrink-0 stroke-[2.5]" />
                <span>[선택 A (올인)를 누른 당신의 결말]</span>
              </div>

              <div className="p-4 rounded-xl bg-neutral-950/80 border border-red-500/20 space-y-2">
                <h5 className="font-extrabold text-sm sm:text-base text-red-400">
                  &quot;눈물의 25년 터널, 본전에 갇혀버린 자산&quot;
                </h5>
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-medium">
                  당신이 전재산을 밀어 넣은 직후, 거짓말처럼 시장의 분위기가 꺾이고 버블이 붕괴되었습니다. 당신의 1,000만 원은 순식간에 <strong className="text-red-400">-90% 폭락하여 100만 원</strong>짜리 종잇조각으로 변했습니다.
                </p>
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-medium">
                  더 서늘한 진실은, 무려 <strong className="text-white">25년이 흘러서야 겨우 본전 주위를 맴돌게 되었다는 점</strong>입니다. 물가상승률을 감안하면 당신의 자산은 사실상 형체도 없이 녹아내렸습니다. 세계 1등 기업이라는 대중의 맹신이 가져다준 가장 참혹한 결말입니다.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-center text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800">
                  <span className="text-neutral-400 block text-[10px]">최대 낙폭 (MDD)</span>
                  <span className="text-red-400 font-extrabold text-sm">-90% 폭락</span>
                </div>
                <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800">
                  <span className="text-neutral-400 block text-[10px]">원금 회복 소요 기간</span>
                  <span className="text-red-400 font-extrabold text-sm">약 25년</span>
                </div>
                <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 col-span-2 sm:col-span-1">
                  <span className="text-neutral-400 block text-[10px]">실질 구매력 변화</span>
                  <span className="text-red-400 font-extrabold text-sm">완전 소멸</span>
                </div>
              </div>
            </div>
          )}

          {/* Result B */}
          {selectedChoice === 'B' && (
            <div className="p-5 sm:p-6 rounded-2xl bg-amber-950/30 border-2 border-amber-500/40 space-y-4">
              <div className="flex items-center gap-2 text-amber-400 font-black text-base sm:text-lg">
                <AlertTriangle className="w-5 h-5 shrink-0 stroke-[2.5]" />
                <span>[선택 B (예금 100%)를 고른 당신의 결말]</span>
              </div>

              <div className="p-4 rounded-xl bg-neutral-950/80 border border-amber-500/20 space-y-2">
                <h5 className="font-extrabold text-sm sm:text-base text-amber-400">
                  &quot;대폭락은 피했으나, 인플레이션에게 영혼까지 털려버린 자산&quot;
                </h5>
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-medium">
                  이성적으로 판단하여 광기 서린 폭락장은 피했습니다. 하지만 폭락이 끝난 뒤 찾아온 20여 년간의 대세 상승장 동안 당신의 1,000만 원은 금고 속에서 서서히 갉아먹혔습니다.
                </p>
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-medium">
                  25년 뒤의 1,000만 원은 시장에서 살 수 있는 구매력 자체가 다릅니다. <strong className="text-white">돈의 원금은 지켰을지 모르지만, 결국 자본을 소유하지 못해 평생을 노동의 굴레 속에서 쳇바퀴 돌듯 살아가야만 합니다.</strong>
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-center text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800">
                  <span className="text-neutral-400 block text-[10px]">명목 원금 보존</span>
                  <span className="text-amber-400 font-extrabold text-sm">1,000만 원 (100%)</span>
                </div>
                <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800">
                  <span className="text-neutral-400 block text-[10px]">인플레이션 방어</span>
                  <span className="text-red-400 font-extrabold text-sm">실패 (-50% 이상)</span>
                </div>
                <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 col-span-2 sm:col-span-1">
                  <span className="text-neutral-400 block text-[10px]">경제적 자유 도달</span>
                  <span className="text-red-400 font-extrabold text-sm">불가능</span>
                </div>
              </div>
            </div>
          )}

          {/* Result C */}
          {selectedChoice === 'C' && (
            <div className="p-5 sm:p-6 rounded-2xl bg-emerald-950/30 border-2 border-emerald-500/40 space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 font-black text-base sm:text-lg">
                <CheckCircle2 className="w-5 h-5 shrink-0 stroke-[2.5]" />
                <span>[선택 C (S&P 500)를 고른 당신의 결말]</span>
              </div>

              <div className="p-4 rounded-xl bg-neutral-950/80 border border-emerald-500/20 space-y-2">
                <h5 className="font-extrabold text-sm sm:text-base text-emerald-400">
                  &quot;조롱을 견뎌낸 위대한 동업자의 승리&quot;
                </h5>
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-medium">
                  당시 동료들에게 구시대의 바보라 불렸던 당신의 선택이 옳았습니다. 버블 붕괴로 일시적인 하락은 겪었지만, S&P 500 시스템은 뒤처진 그 세계 1등 기업의 비중을 가차 없이 줄이고 그 자리에 <strong className="text-white">애플, 마이크로소프트, 엔비디아</strong>라는 새로운 시대의 거인들을 알아서 채워 넣었습니다.
                </p>
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-medium">
                  25년이 지난 오늘날, 당신의 1,000만 원은 <strong className="text-emerald-400 font-extrabold text-sm sm:text-base">약 8,000만 원(+700%)</strong>의 거대한 자산으로 조용히 복리를 불려 나갔습니다.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-center text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800">
                  <span className="text-neutral-400 block text-[10px]">최종 자산 (25년 후)</span>
                  <span className="text-emerald-400 font-extrabold text-sm sm:text-base">약 8,000만 원</span>
                </div>
                <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800">
                  <span className="text-neutral-400 block text-[10px]">자정 정화 작용</span>
                  <span className="text-emerald-400 font-extrabold text-sm">자동 종목 교체</span>
                </div>
                <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 col-span-2 sm:col-span-1">
                  <span className="text-neutral-400 block text-[10px]">승리의 요인</span>
                  <span className="text-emerald-400 font-extrabold text-sm">미국 시장과 동업</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
