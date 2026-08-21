/**
 * 주식부엉 커스텀 캔버스 폭죽/폭죽 가루(Confetti) 애니메이션 유틸리티
 * 자잘하고 섬세한 60FPS HTML5 Canvas 기반 Zero-Dependency 퍼포먼스 폭죽 연출
 */

export function triggerConfetti() {
  if (typeof window === 'undefined') return;

  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '999999';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    canvas.remove();
    return;
  }

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  const handleResize = () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  };
  window.addEventListener('resize', handleResize);

  // 시그니처 10색 팔레트 (주황, 에메랄드, 골드/앰버, 크림슨, 화이트)
  const colors = ['#F18F01', '#10B981', '#D97706', '#F43F5E', '#FFFFFF', '#64748B'];

  interface Particle {
    x: number;
    y: number;
    size: number;
    color: string;
    vx: number;
    vy: number;
    rotation: number;
    rotationSpeed: number;
    opacity: number;
    shape: 'rect' | 'circle';
  }

  // 더 자잘한 입자(약 70% 크기) & 풍성한 개수(180개)로 섬세한 별가루/꽃가루 연출
  const particleCount = 180;
  const particles: Particle[] = [];

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: width / 2 + (Math.random() - 0.5) * 260,
      y: height / 2 - 30 + (Math.random() - 0.5) * 120,
      size: Math.random() * 4.5 + 2.5, // 자잘한 파티클 사이즈 (70% 수준)
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 22,
      vy: (Math.random() - 1.2) * 18 - 5,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.25,
      opacity: 1,
      shape: Math.random() > 0.4 ? 'rect' : 'circle'
    });
  }

  let animationFrameId: number;
  let startTime = performance.now();

  const render = (now: number) => {
    const elapsed = now - startTime;
    ctx.clearRect(0, 0, width, height);

    let activeParticles = 0;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      if (p.opacity <= 0) continue;

      activeParticles++;

      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.42; // Gravity
      p.vx *= 0.982; // Air resistance
      p.rotation += p.rotationSpeed;

      // Fade out gradually after 1.6 seconds
      if (elapsed > 1600) {
        p.opacity -= 0.022;
      }

      ctx.save();
      ctx.globalAlpha = Math.max(0, p.opacity);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillStyle = p.color;

      if (p.shape === 'rect') {
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.5);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    if (activeParticles > 0 && elapsed < 3500) {
      animationFrameId = requestAnimationFrame(render);
    } else {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      canvas.remove();
    }
  };

  animationFrameId = requestAnimationFrame(render);
}
