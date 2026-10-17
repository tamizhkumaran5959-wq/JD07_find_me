import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, Heart, PartyPopper } from 'lucide-react';
import type { BirthdayConfig } from '../types';
import { triggerBirthdayConfetti, triggerSoftCelebrationFall } from '../utils/confetti';
import { playBoardingSuccessChime } from '../utils/audioSynthesizer';
import { celebrationAudioController } from '../utils/celebrationAudioController';
import { memoryAudioController } from '../utils/memoryAudioController';

interface StageCelebrationProps {
  config: BirthdayConfig;
  onProceedToFinal: () => void;
  onReplay?: () => void;
}

interface FireworkParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  color: string;
  size: number;
  decay: number;
}

export const StageCelebration: React.FC<StageCelebrationProps> = ({ config, onProceedToFinal }) => {
  const [sequenceStep, setSequenceStep] = useState<number>(1);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const particlesRef = useRef<FireworkParticle[]>([]);

  const celebrationData = config.grandCelebration ?? {
    heading: 'Happy 21st Birthday, Sreya!',
    subheading: 'You Deserve a Life as Lovely as Your Heart.',
    candlesCount: 21,
    buttonText: 'A Few Words from My Heart 💗',
  };

  // Dedicated Celebration Soundtrack Lifecycle:
  // Starts bd_looping.mp3 with 1.25s overlap crossfade; softly pauses Memories audio without losing position.
  // Playback continues seamlessly across both the 21st Celebration and Final Words stages.
  useEffect(() => {
    memoryAudioController.pause(false);
    celebrationAudioController.start();
  }, []);

  // 1. High-Performance Lightweight Canvas Fireworks System
  const spawnFireworkBurst = React.useCallback((originX: number, originY: number) => {
    const colors = ['#EFC3CA', '#FAA943', '#FFF9F8', '#F7D6DC', '#FFD166', '#FF9F1C'];
    const count = 42;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
      const speed = Math.random() * 4 + 2;
      particlesRef.current.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 3 + 1.8,
        decay: Math.random() * 0.016 + 0.012,
      });
    }
  }, []);

  // 2. Orchestrated Celebration Sequence
  useEffect(() => {
    // Step 2: Dramatic heading reveal
    const timer1 = setTimeout(() => {
      setSequenceStep(2);
    }, 400);

    // Step 3: Grand Confetti Shower & Fireworks burst
    const timer2 = setTimeout(() => {
      setSequenceStep(3);
      triggerBirthdayConfetti();
      triggerSoftCelebrationFall();
      spawnFireworkBurst(window.innerWidth * 0.3, window.innerHeight * 0.25);
      spawnFireworkBurst(window.innerWidth * 0.7, window.innerHeight * 0.28);
    }, 900);

    // Step 4: Subheading & Cake Reveal
    const timer3 = setTimeout(() => {
      setSequenceStep(4);
    }, 1500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [spawnFireworkBurst]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    let lastAutoBurst = Date.now();

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Periodic gentle firework bursts in the background (every 3-4s)
      const now = Date.now();
      if (now - lastAutoBurst > 3200 && particlesRef.current.length < 80) {
        lastAutoBurst = now;
        const rx = width * (0.2 + Math.random() * 0.6);
        const ry = height * (0.15 + Math.random() * 0.25);
        spawnFireworkBurst(rx, ry);
      }

      // Update & render particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.045; // subtle gravity
        p.vx *= 0.985;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particlesRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [spawnFireworkBurst]);

  const handleManualConfetti = () => {
    triggerBirthdayConfetti();
    playBoardingSuccessChime();
    const w = window.innerWidth;
    const h = window.innerHeight;
    spawnFireworkBurst(w * 0.5, h * 0.3);
  };

  const handleStageClick = () => {
    if (celebrationAudioController.getState().isAutoplayBlocked) {
      celebrationAudioController.resume();
    }
  };

  return (
    <div
      className="stage-container celebration-stage"
      role="region"
      aria-label="Grand Birthday Celebration"
      onClick={handleStageClick}
    >
      {/* Background Canvas for Fireworks Bursts */}
      <canvas ref={canvasRef} className="fireworks-canvas" aria-hidden="true" />

      {/* Floating Pastel Balloons */}
      <div className="balloons-layer" aria-hidden="true">
        <div className="balloon b-pink-1"><span className="balloon-string" /></div>
        <div className="balloon b-gold-1"><span className="balloon-string" /></div>
        <div className="balloon b-rose-1"><span className="balloon-string" /></div>
        <div className="balloon b-lavender-1"><span className="balloon-string" /></div>
        <div className="balloon b-pink-2"><span className="balloon-string" /></div>
        <div className="balloon b-gold-2"><span className="balloon-string" /></div>
      </div>

      {/* Floating Golden Stars & Sparkles */}
      <div className="celebratory-stars" aria-hidden="true">
        <span className="c-star cs-1">✨</span>
        <span className="c-star cs-2">★</span>
        <span className="c-star cs-3">✦</span>
        <span className="c-star cs-4">✨</span>
        <span className="c-star cs-5">🌸</span>
        <span className="c-star cs-6">★</span>
      </div>

      <div className="celebration-center-card glass-panel">
        <div className="celebration-warm-aura" />

        {/* Milestone Pill Badge */}
        <div className={`milestone-badge ${sequenceStep >= 2 ? 'is-visible' : ''}`}>
          <Sparkles size={15} className="text-peach" />
          <span>CELEBRATING 21 RADIANT YEARS</span>
          <Sparkles size={15} className="text-peach" />
        </div>

        {/* Main Dramatic Heading: Happy 21st Birthday, Sreya! */}
        <h1 className={`celebration-hero-title gold-gradient-text ${sequenceStep >= 2 ? 'title-reveal' : ''}`}>
          {celebrationData.heading}
        </h1>

        {/* Glowing Subtext: You Deserve a Life as Lovely as Your Heart. */}
        <p className={`celebration-hero-subtext ${sequenceStep >= 4 ? 'subtext-reveal' : ''}`}>
          {celebrationData.subheading}
        </p>

        {/* =========================================================================
            BEAUTIFUL 2-TIER BIRTHDAY CAKE WITH 21 CANDLES
           ========================================================================= */}
        <div
          className={`birthday-cake-scene ${sequenceStep >= 4 ? 'cake-reveal' : ''}`}
          onClick={handleManualConfetti}
          role="button"
          tabIndex={0}
          title="Click the cake to make a wish & burst fireworks!"
          aria-label="Birthday cake with 21 glowing candles. Tap to celebrate."
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') handleManualConfetti();
          }}
        >
          {/* Top Plate Aura */}
          <div className="cake-pedestal-glow" />

          {/* 21 Flickering Candles Array on Top Tier */}
          <div className="candles-ring" aria-label="21 Birthday Candles">
            {Array.from({ length: 21 }).map((_, idx) => (
              <div key={idx} className="candle-unit" style={{ animationDelay: `${(idx * 0.12) % 1.5}s` }}>
                <span className="candle-flame" />
                <span className="candle-wick" />
                <span className="candle-stick" />
              </div>
            ))}
          </div>

          {/* Cake Layers */}
          <div className="cake-tiers-container">
            {/* Top Cake Tier */}
            <div className="cake-tier tier-top">
              <div className="tier-frosting-drip" />
              <div className="tier-pearls-row">
                {Array.from({ length: 9 }).map((_, i) => (
                  <span key={i} className="sugar-pearl" />
                ))}
              </div>
              <div className="tier-body" />
            </div>

            {/* Bottom Cake Tier */}
            <div className="cake-tier tier-bottom">
              <div className="tier-frosting-drip" />
              <div className="tier-garland">
                <span className="sugar-rose">🌸</span>
                <span className="milestone-number-tag">21</span>
                <span className="sugar-rose">🌸</span>
              </div>
              <div className="tier-body" />
            </div>

            {/* Golden Glass Cake Stand / Pedestal */}
            <div className="cake-stand-pedestal">
              <div className="stand-plate" />
              <div className="stand-base" />
            </div>
          </div>

          <p className="cake-wish-hint">
            <Sparkles size={14} className="text-peach" />
            <span>Tap cake to make a wish ♡</span>
            <Sparkles size={14} className="text-peach" />
          </p>
        </div>

        {/* Action Buttons Row */}
        <div className={`celebration-actions ${sequenceStep >= 4 ? 'actions-reveal' : ''}`}>
          <button
            onClick={onProceedToFinal}
            className="btn-cinematic proceed-final-words-btn"
            aria-label="Proceed to final message: A Few Words from My Heart"
          >
            <Heart size={18} className="btn-icon fill-peach text-peach" />
            <span>{celebrationData.buttonText}</span>
          </button>

          <button
            onClick={handleManualConfetti}
            className="btn-ghost confetti-burst-btn"
            aria-label="Shower More Confetti and Fireworks"
          >
            <PartyPopper size={17} />
            <span>Shower More Confetti</span>
          </button>
        </div>
      </div>

      <style>{`
        .celebration-stage {
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          min-height: 100vh;
          width: 100vw;
          position: relative;
          overflow: hidden;
          padding: 50px 20px 80px 20px;
          background: radial-gradient(110% 120% at 50% 15%, rgba(55, 14, 40, 0.94) 0%, rgba(12, 3, 14, 0.98) 100%);
        }

        .fireworks-canvas {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 1;
        }

        /* FLOATING BALLOONS */
        .balloons-layer {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
          z-index: 2;
        }

        .balloon {
          position: absolute;
          width: 48px;
          height: 60px;
          border-radius: 50% 50% 50% 50% / 40% 40% 60% 60%;
          box-shadow: inset -6px -6px 12px rgba(0, 0, 0, 0.35), inset 6px 6px 10px rgba(255, 255, 255, 0.4);
          animation: floatBalloonUp 16s ease-in-out infinite;
        }

        .balloon-string {
          position: absolute;
          bottom: -22px;
          left: 50%;
          transform: translateX(-50%);
          width: 1px;
          height: 24px;
          background: rgba(255, 255, 255, 0.3);
        }

        .b-pink-1 { left: 8%; bottom: -70px; background: linear-gradient(135deg, #FFB4C2, #E58296); animation-delay: 0s; }
        .b-gold-1 { left: 18%; bottom: -70px; background: linear-gradient(135deg, #FDE68A, #D97706); animation-delay: 4s; }
        .b-rose-1 { left: 78%; bottom: -70px; background: linear-gradient(135deg, #FCA5A5, #BE123C); animation-delay: 2s; }
        .b-lavender-1 { left: 88%; bottom: -70px; background: linear-gradient(135deg, #E9D5FF, #9333EA); animation-delay: 7s; }
        .b-pink-2 { left: 26%; bottom: -70px; background: linear-gradient(135deg, #FCE8EB, #EFC3CA); animation-delay: 9s; }
        .b-gold-2 { left: 70%; bottom: -70px; background: linear-gradient(135deg, #FEF08A, #CA8A04); animation-delay: 11s; }

        @keyframes floatBalloonUp {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.75;
          }
          90% {
            opacity: 0.75;
          }
          100% {
            transform: translateY(-115vh) rotate(15deg);
            opacity: 0;
          }
        }

        /* CELEBRATORY DRIFTING STARS */
        .celebratory-stars {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 2;
        }

        .c-star {
          position: absolute;
          color: var(--color-secondary-peach, #FAA943);
          opacity: 0.6;
          animation: starGlowDrift 5s ease-in-out infinite;
        }

        .cs-1 { top: 12%; left: 15%; font-size: 1.4rem; animation-delay: 0s; }
        .cs-2 { top: 22%; right: 14%; font-size: 1.1rem; animation-delay: 1.5s; color: var(--color-primary); }
        .cs-3 { bottom: 20%; left: 12%; font-size: 1.2rem; animation-delay: 2.8s; }
        .cs-4 { top: 60%; right: 10%; font-size: 1.3rem; animation-delay: 3.5s; }
        .cs-5 { bottom: 12%; right: 20%; font-size: 1.2rem; animation-delay: 1s; }
        .cs-6 { top: 18%; left: 28%; font-size: 1rem; animation-delay: 4.2s; color: #FFF; }

        @keyframes starGlowDrift {
          0%, 100% {
            transform: translateY(0) scale(1);
            opacity: 0.45;
          }
          50% {
            transform: translateY(-12px) scale(1.2);
            opacity: 0.95;
          }
        }

        /* MAIN CARD */
        .celebration-center-card {
          position: relative;
          z-index: 3;
          max-width: 820px;
          width: 100%;
          padding: 54px 44px 48px 44px;
          display: flex;
          flex-direction: column;
          align-items: center;
          background: radial-gradient(110% 115% at 50% 12%, rgba(56, 16, 44, 0.92) 0%, rgba(16, 4, 18, 0.98) 100%);
          border: 1px solid var(--color-border);
          border-radius: 30px;
          box-shadow: 0 35px 100px rgba(0, 0, 0, 0.88), 0 0 75px rgba(239, 195, 202, 0.22);
          overflow: hidden;
        }

        .celebration-warm-aura {
          position: absolute;
          top: -70px;
          left: 50%;
          transform: translateX(-50%);
          width: 440px;
          height: 220px;
          background: radial-gradient(ellipse, rgba(239, 195, 202, 0.35) 0%, rgba(250, 169, 67, 0.16) 60%, transparent 80%);
          filter: blur(45px);
          pointer-events: none;
        }

        .milestone-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 18px;
          border-radius: 9999px;
          background: rgba(239, 195, 202, 0.12);
          border: 1px solid var(--color-border);
          font-family: var(--font-sans);
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          color: var(--color-secondary-peach, #FAA943);
          text-transform: uppercase;
          margin-bottom: 16px;
          opacity: 0;
          transform: translateY(12px);
          transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .milestone-badge.is-visible {
          opacity: 1;
          transform: translateY(0);
        }

        .celebration-hero-title {
          font-family: var(--font-serif);
          font-size: clamp(2.3rem, 5.5vw, 3.8rem);
          font-weight: 800;
          letter-spacing: -0.015em;
          line-height: 1.2;
          margin: 0 0 12px 0;
          text-shadow: 0 0 45px rgba(239, 195, 202, 0.5);
          opacity: 0;
          transform: scale(0.92) translateY(18px);
          transition: all 0.85s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .celebration-hero-title.title-reveal {
          opacity: 1;
          transform: scale(1) translateY(0);
        }

        .celebration-hero-subtext {
          font-family: var(--font-serif);
          font-style: italic;
          font-size: clamp(1.2rem, 2.6vw, 1.55rem);
          color: var(--color-secondary);
          margin: 0 0 28px 0;
          letter-spacing: 0.01em;
          line-height: 1.45;
          text-shadow: 0 0 25px rgba(239, 195, 202, 0.35);
          opacity: 0;
          transform: translateY(16px);
          transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .celebration-hero-subtext.subtext-reveal {
          opacity: 1;
          transform: translateY(0);
        }

        /* =========================================================================
           BIRTHDAY CAKE & 21 CANDLES
           ========================================================================= */
        .birthday-cake-scene {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          margin: 12px 0 32px 0;
          cursor: pointer;
          outline: none;
          opacity: 0;
          transform: scale(0.9) translateY(20px);
          transition: all 0.9s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .birthday-cake-scene.cake-reveal {
          opacity: 1;
          transform: scale(1) translateY(0);
        }

        .birthday-cake-scene:hover {
          transform: scale(1.02);
        }

        .cake-pedestal-glow {
          position: absolute;
          bottom: 25px;
          left: 50%;
          transform: translateX(-50%);
          width: 260px;
          height: 90px;
          background: radial-gradient(ellipse, rgba(250, 169, 67, 0.28) 0%, rgba(239, 195, 202, 0.15) 50%, transparent 75%);
          filter: blur(25px);
          pointer-events: none;
        }

        /* 21 CANDLES ROW */
        .candles-ring {
          display: flex;
          align-items: flex-end;
          justify-content: center;
          gap: 6px;
          width: 220px;
          margin-bottom: -4px;
          z-index: 10;
        }

        .candle-unit {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
        }

        .candle-flame {
          width: 7px;
          height: 12px;
          background: radial-gradient(ellipse at 50% 80%, #FFFFFF 0%, #FFE272 40%, #FF8C00 80%, rgba(255, 69, 0, 0) 100%);
          border-radius: 50% 50% 20% 20%;
          box-shadow: 0 0 10px rgba(255, 200, 50, 0.9), 0 0 18px rgba(255, 120, 0, 0.6);
          animation: flicker 1.2s ease-in-out infinite alternate;
          transform-origin: center bottom;
        }

        @keyframes flicker {
          0%, 100% {
            transform: scale(1) rotate(-2deg);
            opacity: 0.92;
          }
          50% {
            transform: scale(1.15) rotate(3deg);
            opacity: 1;
          }
        }

        .candle-wick {
          width: 1.5px;
          height: 3px;
          background: #4A1525;
        }

        .candle-stick {
          width: 5px;
          height: 24px;
          background: repeating-linear-gradient(
            45deg,
            #FFF9F8,
            #FFF9F8 3px,
            #EFC3CA 3px,
            #EFC3CA 6px
          );
          border-radius: 2px 2px 0 0;
          box-shadow: inset 1px 0 1px rgba(255, 255, 255, 0.4), inset -1px 0 1px rgba(0, 0, 0, 0.2);
        }

        /* CAKE TIERS */
        .cake-tiers-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          z-index: 5;
        }

        .cake-tier {
          position: relative;
          border-radius: 14px 14px 8px 8px;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.5), inset 0 2px 3px rgba(255, 255, 255, 0.25);
          overflow: hidden;
        }

        .tier-top {
          width: 220px;
          height: 52px;
          background: linear-gradient(180deg, #FCE8EB 0%, #EFC3CA 60%, #DDA7B0 100%);
          border: 1px solid var(--color-border);
          z-index: 6;
        }

        .tier-frosting-drip {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 14px;
          background: #FFF9F8;
          border-radius: 0 0 8px 8px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
        }

        .tier-pearls-row {
          position: absolute;
          bottom: 5px;
          left: 0;
          right: 0;
          display: flex;
          justify-content: space-evenly;
        }

        .sugar-pearl {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #FFF9F8;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
        }

        .tier-bottom {
          width: 270px;
          height: 64px;
          margin-top: -6px;
          background: linear-gradient(180deg, #5A1C3C 0%, #3F112A 60%, #28081A 100%);
          border: 1px solid var(--color-border-subtle);
          z-index: 5;
        }

        .tier-garland {
          position: absolute;
          top: 14px;
          left: 0;
          right: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
        }

        .sugar-rose {
          font-size: 1.1rem;
        }

        .milestone-number-tag {
          font-family: var(--font-display);
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--color-secondary-peach, #FAA943);
          letter-spacing: 0.05em;
          text-shadow: 0 0 10px rgba(250, 169, 67, 0.8);
        }

        /* CAKE STAND */
        .cake-stand-pedestal {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 310px;
          margin-top: -4px;
          z-index: 4;
        }

        .stand-plate {
          width: 310px;
          height: 12px;
          background: linear-gradient(90deg, #EFC3CA 0%, #FAA943 50%, #EFC3CA 100%);
          border-radius: 6px;
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.6);
        }

        .stand-base {
          width: 90px;
          height: 18px;
          background: linear-gradient(180deg, #FAA943 0%, #C97D1A 100%);
          border-radius: 0 0 14px 14px;
          box-shadow: 0 6px 15px rgba(0, 0, 0, 0.5);
        }

        .cake-wish-hint {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-top: 14px;
          font-family: var(--font-serif);
          font-style: italic;
          font-size: 0.95rem;
          color: var(--color-primary);
          letter-spacing: 0.02em;
        }

        /* ACTION BUTTONS */
        .celebration-actions {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: center;
          gap: 16px;
          width: 100%;
          opacity: 0;
          transform: translateY(16px);
          transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .celebration-actions.actions-reveal {
          opacity: 1;
          transform: translateY(0);
        }

        .proceed-final-words-btn {
          font-family: var(--font-sans);
          font-size: 1.05rem;
          font-weight: 600;
          letter-spacing: 0.04em;
          padding: 15px 38px;
          border-radius: 9999px;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .proceed-final-words-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 30px rgba(239, 195, 202, 0.45);
        }

        .confetti-burst-btn {
          font-family: var(--font-sans);
          font-size: 0.98rem;
          font-weight: 500;
          padding: 14px 28px;
          border-radius: 9999px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: rgba(255, 245, 248, 0.9);
          border: 1px solid var(--color-border);
          background: rgba(239, 195, 202, 0.08);
          transition: all 0.3s ease;
        }

        .confetti-burst-btn:hover {
          background: rgba(239, 195, 202, 0.2);
          color: #FFF9F8;
          transform: translateY(-2px);
        }

        @media (max-width: 640px) {
          .celebration-stage {
            padding: 40px 16px 60px 16px;
          }
          .celebration-center-card {
            padding: 38px 20px 32px 20px;
          }
          .celebration-actions {
            flex-direction: column;
            width: 100%;
          }
          .celebration-actions button {
            width: 100%;
            justify-content: center;
          }
          .tier-top { width: 190px; }
          .tier-bottom { width: 230px; }
          .stand-plate { width: 260px; }
          .candles-ring { width: 190px; gap: 4px; }
          .candle-stick { width: 4px; height: 18px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .balloon,
          .candle-flame,
          .c-star,
          .celebration-hero-title,
          .celebration-hero-subtext,
          .birthday-cake-scene,
          .celebration-actions {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default StageCelebration;
