import React, { useEffect, useRef, useState } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  opacity: number;
  maxOpacity: number;
  fadeSpeed: number;
  color: string;
  type: 'star' | 'gold-dust' | 'heart' | 'motif';
  rotation: number;
  rotSpeed: number;
}

export const AmbientBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const isTouchDevice = useRef(false);

  useEffect(() => {
    isTouchDevice.current = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isTouchDevice.current) {
        setMousePos({ x: e.clientX, y: e.clientY });
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle Palette inspired by Soft Pink & Pastel theme
    const colors = [
      'rgba(239, 195, 202, ',  // Soft Pink (#EFC3CA)
      'rgba(247, 214, 220, ',  // Light Blush Pink (#F7D6DC)
      'rgba(252, 232, 235, ',  // Pale Blush (#FCE8EB)
      'rgba(221, 167, 176, ',  // Muted Rose (#DDA7B0)
      'rgba(255, 249, 248, ',  // Warm White (#FFF9F8)
      'rgba(250, 169, 67, ',   // Warm Peach / Golden Sparkle (#FAA943)
    ];

    const particleCount = window.innerWidth < 768 ? 40 : 80;
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      const typeRand = Math.random();
      const type: 'star' | 'gold-dust' | 'heart' | 'motif' =
        typeRand < 0.5 ? 'gold-dust' : typeRand < 0.8 ? 'star' : typeRand < 0.95 ? 'heart' : 'motif';

      particles.push({
        type,
        x: Math.random() * width,
        y: Math.random() * height,
        size: type === 'motif' ? 24 : type === 'heart' ? Math.random() * 8 + 6 : Math.random() * 2.5 + 1,
        speedY: -(Math.random() * 0.4 + 0.15),
        speedX: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.5 + 0.1,
        maxOpacity: type === 'motif' ? 0.08 : Math.random() * 0.6 + 0.25,
        fadeSpeed: (Math.random() * 0.008 + 0.003) * (Math.random() > 0.5 ? 1 : -1),
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.015,
      });
    }

    const drawHeart = (c: CanvasRenderingContext2D, x: number, y: number, size: number, rot: number) => {
      c.save();
      c.translate(x, y);
      c.rotate(rot);
      c.beginPath();
      const topCurveHeight = size * 0.3;
      c.moveTo(0, topCurveHeight);
      c.bezierCurveTo(0, 0, -size / 2, 0, -size / 2, topCurveHeight);
      c.bezierCurveTo(-size / 2, (size + topCurveHeight) / 2, 0, (size + topCurveHeight) / 1.5, 0, size);
      c.bezierCurveTo(0, (size + topCurveHeight) / 1.5, size / 2, (size + topCurveHeight) / 2, size / 2, topCurveHeight);
      c.bezierCurveTo(size / 2, 0, 0, 0, 0, topCurveHeight);
      c.closePath();
      c.fill();
      c.restore();
    };

    let lastTime = performance.now();

    const render = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      ctx.clearRect(0, 0, width, height);

      // Deep rich gradient background with subtle plum/wine warmth
      const bgGrad = ctx.createRadialGradient(
        width * 0.5,
        height * 0.45,
        width * 0.05,
        width * 0.5,
        height * 0.5,
        Math.max(width, height) * 0.8
      );
      bgGrad.addColorStop(0, '#1f091c'); // subtle deep wine
      bgGrad.addColorStop(0.45, '#140514'); // plum dark night
      bgGrad.addColorStop(1, '#080208'); // pure dark velvet
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Particles render
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Opacity pulsing
        p.opacity += p.fadeSpeed;
        if (p.opacity > p.maxOpacity || p.opacity < 0.05) {
          p.fadeSpeed = -p.fadeSpeed;
        }

        // Movement
        p.y += p.speedY * dt * 60;
        p.x += p.speedX * dt * 60;
        p.rotation += p.rotSpeed;

        // Wrap around
        if (p.y < -30) {
          p.y = height + 20;
          p.x = Math.random() * width;
        }
        if (p.x < -30) p.x = width + 20;
        if (p.x > width + 30) p.x = -20;

        ctx.fillStyle = `${p.color}${Math.max(0, p.opacity)})`;

        if (p.type === 'heart') {
          drawHeart(ctx, p.x, p.y, p.size, p.rotation);
        } else if (p.type === 'motif') {
          // Subtle drifting "21" watermark
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.font = '600 28px "Cinzel", serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('21', 0, 0);
          ctx.restore();
        } else if (p.type === 'star') {
          // 4-point sparkle star
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.beginPath();
          ctx.moveTo(-p.size * 2, 0);
          ctx.lineTo(p.size * 2, 0);
          ctx.moveTo(0, -p.size * 2);
          ctx.lineTo(0, p.size * 2);
          ctx.lineWidth = 1;
          ctx.strokeStyle = `${p.color}${Math.max(0, p.opacity)})`;
          ctx.stroke();
          ctx.restore();
        } else {
          // Circular glowing dust
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} className="ambient-canvas" />
      {mousePos && (
        <div
          className="cursor-ambient-aura"
          style={{
            left: `${mousePos.x}px`,
            top: `${mousePos.y}px`,
          }}
        />
      )}
    </>
  );
};
