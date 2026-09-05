'use client';

import { useEffect, useRef } from 'react';
import { WeatherState } from '@/data/marketCalendar';

interface WeatherBackgroundProps {
  state: WeatherState;
}

export default function WeatherBackground({ state }: WeatherBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const lightningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lightningBoltRef = useRef<{ points: [number, number][]; opacity: number } | null>(null);
  const ambientFlashRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isDark = document.documentElement.classList.contains('dark') ||
                 window.matchMedia('(prefers-color-scheme: dark)').matches;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleMediaChange = (e: MediaQueryListEvent) => {
      isDark = document.documentElement.classList.contains('dark') || e.matches;
    };
    mediaQuery.addEventListener('change', handleMediaChange);

    const observer = new MutationObserver(() => {
      isDark = document.documentElement.classList.contains('dark') || mediaQuery.matches;
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    const resize = () => {
      canvas.width = window.innerWidth * window.devicePixelRatio;
      canvas.height = window.innerHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);

    const W = () => window.innerWidth;
    const H = () => window.innerHeight;

    // ── 1. Clean Atmosphere (Zero artificial grey wash) ──────────
    // Keep jusik.app's pure OLED Obsidian / Snow Slate background completely intact

    // ── 2. Subtle Floating Atmospheric Motes/Mist (No fake cloud graphics) ──
    const isCloudyWeather = state === 'cloudy' || state === 'overcast';
    const mistParticles = Array.from({ length: 24 }, () => ({
      x: Math.random(),
      y: Math.random() * 0.45,
      radius: Math.random() * 1.6 + 0.8,
      speed: Math.random() * 0.0003 + 0.00015,
      baseAlpha: Math.random() * 0.25 + 0.15,
      phase: Math.random() * Math.PI * 2,
    }));

    let mistTime = 0;
    const drawAtmosphericMist = () => {
      if (!isCloudyWeather) return;
      mistTime += 0.015;

      ctx.save();
      mistParticles.forEach((p) => {
        p.x += p.speed;
        if (p.x > 1.05) p.x = -0.05;

        const px = p.x * W();
        const py = p.y * H() + Math.sin(mistTime + p.phase) * 6;
        const alpha = p.baseAlpha + Math.sin(mistTime * 2 + p.phase) * 0.08;

        ctx.beginPath();
        ctx.arc(px, py, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = isDark
          ? `rgba(203, 213, 225, ${Math.max(0.05, alpha)})`
          : `rgba(100, 116, 139, ${Math.max(0.04, alpha * 0.7)})`;
        ctx.fill();
      });
      ctx.restore();
    };

    // ── 3. Apple Weather Day/Night Optical Sky Engine ───────────────
    let sunRadian = 0;

    // Fixed twinkling celestial stars
    // In light mode: tiny & translucent (blends naturally into sky)
    // In dark mode: beautifully twinkling stars in the night sky
    const stars = Array.from({ length: 42 }, () => ({
      x: Math.random(),
      y: Math.random() * 0.58,
      radius: Math.random() * 1.3 + 0.6,
      baseAlpha: Math.random() * 0.45 + 0.25,
      speed: Math.random() * 0.025 + 0.012,
      phase: Math.random() * Math.PI * 2,
    }));

    const drawSunnyOrNightSky = () => {
      if (state !== 'sunny') return;
      sunRadian += 0.012;

      ctx.save();

      // ── A. Celestial Stars with Ambient Glow Halo ──
      stars.forEach((star) => {
        const sx = star.x * W();
        const sy = star.y * H();
        const twinkle = Math.sin(sunRadian * star.speed * 60 + star.phase);
        const alpha = isDark
          ? Math.max(0.12, star.baseAlpha + twinkle * 0.4)
          : Math.max(0.02, (star.baseAlpha + twinkle * 0.2) * 0.18);

        // Ambient Glow Halo (2.5x radius soft dispersion)
        const glowRadius = (isDark ? star.radius : star.radius * 0.8) * 2.8;
        const glowGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, glowRadius);
        if (isDark) {
          glowGrad.addColorStop(0, `rgba(224, 242, 254, ${alpha * 0.6})`);
          glowGrad.addColorStop(0.5, `rgba(186, 230, 253, ${alpha * 0.2})`);
          glowGrad.addColorStop(1, 'rgba(186, 230, 253, 0)');
        } else {
          glowGrad.addColorStop(0, `rgba(254, 240, 138, ${alpha * 0.4})`);
          glowGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
        }
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(sx, sy, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        // Solid Star Core
        ctx.beginPath();
        ctx.arc(sx, sy, isDark ? star.radius : star.radius * 0.75, 0, Math.PI * 2);
        ctx.fillStyle = isDark
          ? `rgba(255, 255, 255, ${Math.min(1, alpha * 1.3)})`
          : `rgba(251, 191, 36, ${alpha})`;
        ctx.fill();
      });

      // ── B. Dark Mode: Moonlit Aurora & Subtle Night Lens Flare ──
      if (isDark) {
        const moonX = W() * 0.88;
        const moonY = H() * 0.10;
        const moonGlow = ctx.createRadialGradient(moonX, moonY, 10, moonX, moonY, 280);
        moonGlow.addColorStop(0, 'rgba(224, 242, 254, 0.15)');
        moonGlow.addColorStop(0.4, 'rgba(186, 230, 253, 0.05)');
        moonGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = moonGlow;
        ctx.beginPath();
        ctx.arc(moonX, moonY, 280, 0, Math.PI * 2);
        ctx.fill();

        // Subtle Night Optical Lens Flares (Cool silver/moonlight, very soft and non-distracting)
        const centerX = W() * 0.45;
        const centerY = H() * 0.45;
        const dx = centerX - moonX;
        const dy = centerY - moonY;
        const drift = Math.sin(sunRadian * 0.7) * 0.03;

        const nightFlares = [
          { dist: 0.32 + drift, r: 16, alpha: 0.04, isRing: false },
          { dist: 0.55 - drift * 0.7, r: 32, alpha: 0.03, isRing: true }, // Thin lunar ring
          { dist: 0.85 + drift, r: 24, alpha: 0.025, isRing: false },
        ];

        nightFlares.forEach((f) => {
          const fx = moonX + dx * f.dist;
          const fy = moonY + dy * f.dist;

          ctx.beginPath();
          ctx.arc(fx, fy, f.r, 0, Math.PI * 2);

          if (f.isRing) {
            ctx.strokeStyle = `rgba(224, 242, 254, ${f.alpha * 1.6})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          } else {
            const grad = ctx.createRadialGradient(fx, fy, 0, fx, fy, f.r);
            grad.addColorStop(0, `rgba(240, 249, 255, ${f.alpha})`);
            grad.addColorStop(0.7, `rgba(186, 230, 253, ${f.alpha * 0.35})`);
            grad.addColorStop(1, 'rgba(186, 230, 253, 0)');
            ctx.fillStyle = grad;
            ctx.fill();
          }
        });

        ctx.restore();
        return;
      }

      // ── C. Light Mode: Soft Diffused Sun & High-Clarity Optical Lens Flare ──
      const sunX = W() * 0.88;
      const sunY = H() * 0.06;

      // 1. Warm atmospheric sun glow
      const sunGlow = ctx.createRadialGradient(sunX, sunY, 15, sunX, sunY, 380);
      sunGlow.addColorStop(0, 'rgba(254, 215, 170, 0.65)');
      sunGlow.addColorStop(0.2, 'rgba(251, 146, 60, 0.28)');
      sunGlow.addColorStop(0.5, 'rgba(245, 158, 11, 0.10)');
      sunGlow.addColorStop(1, 'rgba(245, 158, 11, 0)');
      ctx.fillStyle = sunGlow;
      ctx.beginPath();
      ctx.arc(sunX, sunY, 380, 0, Math.PI * 2);
      ctx.fill();

      // Sun Core Disc
      const sunCore = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 45);
      sunCore.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
      sunCore.addColorStop(0.5, 'rgba(254, 240, 138, 0.65)');
      sunCore.addColorStop(1, 'rgba(251, 191, 36, 0)');
      ctx.fillStyle = sunCore;
      ctx.beginPath();
      ctx.arc(sunX, sunY, 45, 0, Math.PI * 2);
      ctx.fill();

      // 2. Optical Lens Flares drifting smoothly along the sun-to-center ray axis
      const centerX = W() * 0.45;
      const centerY = H() * 0.45;
      const dx = centerX - sunX;
      const dy = centerY - sunY;

      // Subtle breath drift along the light ray
      const drift = Math.sin(sunRadian * 0.8) * 0.04;

      // High-clarity natural flares (Warm amber rim, champagne gold & radiant center)
      const flares = [
        { dist: 0.22 + drift, r: 24, alpha: 0.28, isRing: false, color: [245, 158, 11] },
        { dist: 0.42 - drift * 0.8, r: 48, alpha: 0.35, isRing: true, color: [217, 119, 6] },   // Primary aperture ring
        { dist: 0.60 + drift * 0.5, r: 16, alpha: 0.22, isRing: false, color: [249, 115, 22] },
        { dist: 0.82 - drift * 1.1, r: 38, alpha: 0.25, isRing: true, color: [245, 158, 11] },  // Secondary iris ring
        { dist: 1.10 + drift, r: 64, alpha: 0.18, isRing: false, color: [251, 191, 36] },       // Broad soft flare
      ];

      flares.forEach((f) => {
        const fx = sunX + dx * f.dist;
        const fy = sunY + dy * f.dist;
        const [cr, cg, cb] = f.color;

        ctx.beginPath();
        ctx.arc(fx, fy, f.r, 0, Math.PI * 2);

        if (f.isRing) {
          // Clear optical aperture ring with subtle glow outline
          ctx.strokeStyle = `rgba(${cr}, ${cg}, ${cb}, ${f.alpha * 1.4})`;
          ctx.lineWidth = 1.8;
          ctx.stroke();

          // Soft inner rim
          ctx.beginPath();
          ctx.arc(fx, fy, f.r * 0.92, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${cr}, ${cg}, ${cb}, ${f.alpha * 0.6})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        } else {
          // Luminous champagne/amber disc
          const grad = ctx.createRadialGradient(fx, fy, 0, fx, fy, f.r);
          grad.addColorStop(0, `rgba(255, 255, 255, ${f.alpha * 1.5})`);
          grad.addColorStop(0.45, `rgba(${cr}, ${cg}, ${cb}, ${f.alpha * 0.8})`);
          grad.addColorStop(0.85, `rgba(${cr}, ${cg}, ${cb}, ${f.alpha * 0.25})`);
          grad.addColorStop(1, `rgba(${cr}, ${cg}, ${cb}, 0)`);
          ctx.fillStyle = grad;
          ctx.fill();
        }
      });

      ctx.restore();
    };

    // ── 4. Rain Drops & Viewport Bottom Splash Particles ────────────
    interface RainDrop {
      x: number;
      y: number;
      speed: number;
      length: number;
      opacity: number;
      width: number;
    }

    interface SplashParticle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      alpha: number;
      radius: number;
    }

    const hasRain = state === 'rainy' || state === 'stormy';
    const splashes: SplashParticle[] = [];

    const triggerSplash = (x: number, y: number) => {
      if (splashes.length > 50) return;
      const count = Math.floor(Math.random() * 2) + 1;
      for (let i = 0; i < count; i++) {
        splashes.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 1.8,
          vy: -(Math.random() * 1.6 + 0.9),
          alpha: isDark ? 0.65 : 0.5,
          radius: Math.random() * 0.5 + 0.7,
        });
      }
    };

    const updateAndDrawSplashes = () => {
      for (let i = splashes.length - 1; i >= 0; i--) {
        const s = splashes[i];
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.16;
        s.alpha -= 0.055;

        if (s.alpha <= 0) {
          splashes.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fillStyle = isDark
          ? `rgba(225, 242, 255, ${s.alpha})`
          : `rgba(148, 163, 184, ${s.alpha})`;
        ctx.fill();
        ctx.restore();
      }
    };

    // Width-proportional responsive drop count (Optimized for mobile screen real estate)
    const getResponsiveDropCount = (baseDesk: number) => {
      const isMob = window.innerWidth < 640;
      const widthFactor = Math.min(1, Math.max(0.22, window.innerWidth / 1200));
      return Math.floor(baseDesk * widthFactor * (isMob ? 0.65 : 1));
    };

    // Constant uniform fall speed across desktop and mobile devices (gentle & relaxed)
    const isMobile = window.innerWidth < 640;
    const baseSpeedMin = isMobile ? 3.2 : 5.0;
    const baseSpeedRange = isMobile ? 2.8 : 4.0;

    const createRain = (count: number, opacityScale = 1): RainDrop[] =>
      Array.from({ length: count }, () => ({
        x: Math.random() * W(),
        y: Math.random() * H(),
        speed: Math.random() * baseSpeedRange + baseSpeedMin, // gentle and uniform
        length: Math.random() * (isMobile ? 12 : 18) + (isMobile ? 8 : 10),
        opacity: (Math.random() * 0.22 + 0.10) * opacityScale,
        width: Math.random() * 0.7 + 0.6,
      }));

    const nearDrops = hasRain ? createRain(getResponsiveDropCount(state === 'stormy' ? 120 : 80), 1) : [];
    const farDrops = hasRain ? createRain(getResponsiveDropCount(state === 'stormy' ? 60 : 40), 0.5) : [];

    const drawRain = (drops: RainDrop[], scale = 1, canSplash = false, dtFactor = 1) => {
      ctx.lineCap = 'round';
      drops.forEach((d) => {
        const drift = -1.2 * scale;
        const headY = d.y + d.length * scale;
        const headX = d.x + drift * (d.length / 16);

        // 빗방울 머리와 꼬리를 잇는 선형 그라디언트 (Tear-drop gradient)
        const grad = ctx.createLinearGradient(d.x, d.y, headX, headY);
        if (isDark) {
          grad.addColorStop(0, `rgba(180, 215, 255, 0)`);
          grad.addColorStop(0.65, `rgba(200, 230, 255, ${Math.min(0.45, d.opacity * 0.9)})`);
          grad.addColorStop(1, `rgba(255, 255, 255, ${Math.min(0.85, d.opacity * 1.6)})`);
        } else {
          grad.addColorStop(0, `rgba(100, 120, 150, 0)`);
          grad.addColorStop(0.65, `rgba(120, 145, 175, ${Math.min(0.28, d.opacity * 0.7)})`);
          grad.addColorStop(1, `rgba(70, 95, 130, ${Math.min(0.65, d.opacity * 1.3)})`);
        }

        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(headX, headY);

        ctx.strokeStyle = grad;
        ctx.lineWidth = d.width * scale * 1.2;
        ctx.stroke();

        // 빗방울 하단 물방울 맺힘 굴절 포인트 (현실적인 물빛 하이라이트)
        if (scale > 0.8 && d.length > 20) {
          ctx.beginPath();
          ctx.arc(headX, headY, (d.width * scale * 0.9), 0, Math.PI * 2);
          ctx.fillStyle = isDark
            ? `rgba(255, 255, 255, ${Math.min(0.9, d.opacity * 1.7)})`
            : `rgba(90, 115, 150, ${Math.min(0.7, d.opacity * 1.4)})`;
          ctx.fill();
        }

        d.y += d.speed * scale * dtFactor;
        d.x += drift * 0.14 * dtFactor;

        if (d.y > H() - 6) {
          if (canSplash && Math.random() < 0.28) {
            triggerSplash(d.x, H() - 4);
          }
          d.y = -d.length;
          d.x = Math.random() * W();
        }
        if (d.x < -30) d.x = W() + 30;
      });
    };

    // ── 5. Ambient Full-screen Flash (Apple Weather style) ─────────────
    const drawAmbientFlash = () => {
      if (ambientFlashRef.current <= 0.005) return;

      ctx.save();
      const flashOpacity = ambientFlashRef.current;
      ctx.fillStyle = isDark
        ? `rgba(215, 235, 255, ${flashOpacity * 0.24})`
        : `rgba(180, 205, 240, ${flashOpacity * 0.32})`;
      ctx.fillRect(0, 0, W(), H());

      const radial = ctx.createRadialGradient(W() * 0.5, 0, 50, W() * 0.5, 0, H() * 0.85);
      radial.addColorStop(0, isDark ? `rgba(255, 255, 255, ${flashOpacity * 0.45})` : `rgba(255, 255, 255, ${flashOpacity * 0.55})`);
      radial.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = radial;
      ctx.fillRect(0, 0, W(), H());
      ctx.restore();

      ambientFlashRef.current *= 0.84;
    };

    // ── 6. Lightning Bolt ─────────────────────────────────────────
    const drawLightning = () => {
      const bolt = lightningBoltRef.current;
      if (!bolt) return;

      ctx.save();
      ctx.globalAlpha = Math.max(0, bolt.opacity);
      ctx.shadowColor = 'rgba(195, 230, 255, 0.95)';
      ctx.shadowBlur = 24;
      ctx.strokeStyle = 'rgba(235, 248, 255, 0.95)';
      ctx.lineWidth = 2.6;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(bolt.points[0][0], bolt.points[0][1]);
      bolt.points.slice(1).forEach(([px, py]) => ctx.lineTo(px, py));
      ctx.stroke();

      ctx.shadowBlur = 6;
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(bolt.points[0][0], bolt.points[0][1]);
      bolt.points.slice(1).forEach(([px, py]) => ctx.lineTo(px, py));
      ctx.stroke();
      ctx.restore();

      bolt.opacity -= 0.05;
      if (bolt.opacity <= 0) lightningBoltRef.current = null;
    };

    const scheduleLightning = () => {
      if (state !== 'stormy') return;
      const delay = 4000 + Math.random() * 6500;
      lightningTimerRef.current = setTimeout(() => {
        const startX = W() * (0.15 + Math.random() * 0.7);
        const pts: [number, number][] = [[startX, 0]];
        let cy = 0;
        while (cy < H() * 0.7) {
          cy += Math.random() * 45 + 18;
          const px = pts[pts.length - 1][0] + (Math.random() - 0.5) * 65;
          pts.push([Math.max(20, Math.min(W() - 20, px)), cy]);
        }
        lightningBoltRef.current = { points: pts, opacity: 0.98 };
        ambientFlashRef.current = 0.95;

        setTimeout(() => {
          if (ambientFlashRef.current < 0.6) {
            ambientFlashRef.current = 0.75;
          }
        }, 90);

        scheduleLightning();
      }, delay);
    };

    // ── Main animation loop (With 60fps delta-time normalization for 120Hz ProMotion screens) ──
    let lastTimestamp = performance.now();

    const draw = () => {
      const now = performance.now();
      const elapsed = Math.min(now - lastTimestamp, 64); // Cap max step to 64ms against tab suspension
      lastTimestamp = now;
      const dtFactor = Math.min(1.8, Math.max(0.4, elapsed / 16.666));

      ctx.clearRect(0, 0, W(), H());

      // 1. Subtle Atmospheric Mist (Cloudy / Overcast)
      drawAtmosphericMist();

      // 2. Sunny (Day Lens Flare) or Night (Twinkling Stars & Moon Glow)
      drawSunnyOrNightSky();

      // 3. Ambient Flash (Stormy)
      if (state === 'stormy') {
        drawAmbientFlash();
      }

      // 5. Rain drops (With frame delta-time factor)
      if (hasRain) {
        drawRain(farDrops, 0.6, false, dtFactor);
        drawRain(nearDrops, 1, true, dtFactor);
        updateAndDrawSplashes();
      }

      // 6. Lightning Bolt
      if (state === 'stormy') {
        drawLightning();
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    if (state === 'stormy') scheduleLightning();

    return () => {
      cancelAnimationFrame(animRef.current);
      if (lightningTimerRef.current) clearTimeout(lightningTimerRef.current);
      window.removeEventListener('resize', resize);
      observer.disconnect();
      mediaQuery.removeEventListener('change', handleMediaChange);
    };
  }, [state]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
