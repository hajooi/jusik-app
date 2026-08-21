'use client';

import React, { useRef, useCallback } from 'react';
import { Sparkles, ShieldCheck } from 'lucide-react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rotation: number;
  vRot: number;
  alpha: number;
  shape: 'rect' | 'circle';
}

export default function FeeComparisonBox() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameId = useRef<number | null>(null);

  // 경량 캔버스 폭죽(Confetti) 발사 함수
  const triggerConfetti = useCallback((e?: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    let startX = canvas.width / 2;
    let startY = canvas.height * 0.45;

    if (e) {
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      if (clickX >= 0 && clickX <= canvas.width && clickY >= 0 && clickY <= canvas.height) {
        startX = clickX;
        startY = clickY;
      }
    }

    const colors = ['#F18F01', '#D97706', '#10B981', '#FFFFFF', '#64748B', '#F8FAFC'];
    const particleCount = 40;
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5;
      const speed = Math.random() * 6 + 3.5;
      particles.push({
        x: startX,
        y: startY,
        vx: Math.cos(angle) * speed * (Math.random() * 0.8 + 0.6),
        vy: (Math.sin(angle) * speed - 3.5) * (Math.random() * 0.8 + 0.6),
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 5 + 3,
        rotation: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 10,
        alpha: 1,
        shape: Math.random() > 0.4 ? 'rect' : 'circle',
      });
    }

    if (animFrameId.current) {
      cancelAnimationFrame(animFrameId.current);
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let aliveCount = 0;

      particles.forEach((p) => {
        if (p.alpha <= 0.01) return;
        aliveCount++;

        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.18;
        p.vx *= 0.98;
        p.rotation += p.vRot;
        p.alpha *= 0.96;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;

        if (p.shape === 'rect') {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      if (aliveCount > 0) {
        animFrameId.current = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    render();
  }, []);

  return (
    <div className="relative w-full my-2 space-y-4">
      {/* 폭죽 캔버스 오버레이 */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-30"
      />

      {/* 3단 비교 카드 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
        {/* 1. 시중 증권사 일반 */}
        <div className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-white/80 dark:bg-white/[0.04] border border-[var(--border-color)] flex flex-col justify-between space-y-3 shadow-2xs">
          <div>
            <span className="text-[11px] sm:text-xs font-semibold px-2 py-0.5 rounded-full bg-[var(--bg-main)] text-[var(--text-secondary)] border border-[var(--border-color)]/30">
              일반 계좌
            </span>
            <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)] mt-2">
              시중 증권사
            </h3>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-extrabold text-[var(--text-secondary)] tracking-tight">
                0.25%
              </div>
              <p className="text-[11px] sm:text-xs text-[var(--text-secondary)] mt-0.5">
                해외주식 기본 정가
              </p>
            </div>
          </div>
          <div className="pt-3 border-t border-[var(--border-color)]/15 space-y-1.5 text-xs text-[var(--text-secondary)]">
            <div className="flex justify-between items-center">
              <span>1억 원 거래 시</span>
              <span className="font-bold text-[var(--text-primary)]">250,000원</span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span>환전 수수료</span>
              <span>일반 환율 적용</span>
            </div>
          </div>
        </div>

        {/* 2. 타사 이벤트 계좌 */}
        <div className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-white/80 dark:bg-white/[0.04] border border-[var(--border-color)] flex flex-col justify-between space-y-3 shadow-2xs">
          <div>
            <span className="text-[11px] sm:text-xs font-semibold px-2 py-0.5 rounded-full bg-[var(--bg-main)] text-[var(--text-secondary)] border border-[var(--border-color)]/30">
              기간 한정
            </span>
            <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)] mt-2">
              타사 이벤트 계좌
            </h3>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-extrabold text-[var(--text-secondary)] tracking-tight">
                0.05 ~ 0.09%
              </div>
              <p className="text-[11px] sm:text-xs text-amber-500/90 font-medium mt-0.5">
                기간 종료 시 원래대로 원복
              </p>
            </div>
          </div>
          <div className="pt-3 border-t border-[var(--border-color)]/15 space-y-1.5 text-xs text-[var(--text-secondary)]">
            <div className="flex justify-between items-center">
              <span>1억 원 거래 시</span>
              <span className="font-bold text-[var(--text-primary)]">약 70,000원</span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span>적용 기간</span>
              <span>3개월 ~ 1년 한정</span>
            </div>
          </div>
        </div>

        {/* 3. 주식부엉 제휴 계좌 (기본 주황 테두리 + 회전 하이라이트 빛 반사 프리미엄 카드) */}
        <div
          onClick={triggerConfetti}
          className="relative p-[2px] rounded-xl sm:rounded-2xl overflow-hidden cursor-pointer group bg-[var(--accent-orange)] shadow-[0_0_22px_rgba(241,143,1,0.22)] hover:shadow-[0_0_32px_rgba(241,143,1,0.38)] active:scale-[0.99] transition-all duration-300 select-none flex flex-col"
        >
          {/* 회전하는 화이트-골드 하이라이트 반사광 레이어 */}
          <div className="absolute inset-[-150%] animate-border-rotate bg-[conic-gradient(from_0deg,transparent_0_70%,rgba(255,255,255,0.4)_82%,rgba(255,255,255,1)_90%,rgba(254,240,138,0.95)_94%,transparent_100%)] pointer-events-none opacity-90 group-hover:opacity-100 transition-opacity" />

          {/* 내부 카드 본체 */}
          <div className="relative z-10 w-full h-full rounded-[calc(0.75rem-1px)] sm:rounded-[calc(1rem-1px)] bg-[#FFF8EE] dark:bg-[#181512] p-4 sm:p-5 flex flex-col justify-between space-y-3 overflow-hidden">
            {/* 내부 앰비언트 글로우 블러 */}
            <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2 pointer-events-none">
              <div className="w-24 h-24 bg-[var(--accent-orange)]/15 rounded-full blur-xl" />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-[var(--accent-orange)] text-white flex items-center gap-1 shadow-2xs">
                  <Sparkles className="w-3 h-3" />
                  평생 우대
                </span>
                <span className="text-[11px] font-bold text-[var(--accent-orange)]">
                  업계 최저 수준
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)] mt-2">
                주식부엉 제휴 계좌
              </h3>
              <div className="mt-3">
                <div className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-[var(--accent-orange)] via-amber-400 to-[var(--accent-orange)] bg-clip-text text-transparent animate-text-shimmer tracking-tight">
                  평생 0.04%
                </div>
                <p className="text-[11px] sm:text-xs text-[var(--accent-orange)] font-semibold mt-0.5">
                  조건 없이 평생 고정
                </p>
              </div>
            </div>
            <div className="pt-3 border-t border-[var(--accent-orange)]/25 space-y-1.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-[var(--text-secondary)]">1억 원 거래 시</span>
                <span className="font-extrabold text-[var(--accent-orange)] text-sm">단 40,000원</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-[var(--text-secondary)]">환전 수수료</span>
                <span className="font-bold text-[var(--accent-orange)]">무료 (0원)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 하단 요약 문구 박스 */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-[var(--bg-main)]/70 border border-[var(--border-color)]/20 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed text-center sm:text-left flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-[var(--accent-orange)] shrink-0 mt-0.5 hidden sm:block" />
        <div>
          <p className="text-[var(--text-primary)] font-medium">
            거래액 1억 원 기준으로도 큰 차이가 나지만, 거래액이 커지고 자산이 불어날수록 이 격차는 수백만 원 이상으로 벌어집니다.
          </p>
        </div>
      </div>
    </div>
  );
}
