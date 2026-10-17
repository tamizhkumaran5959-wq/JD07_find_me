import React, { useEffect } from 'react';
import { Heart, Mail } from 'lucide-react';
import type { BirthdayConfig } from '../types';
import { memoryAudioController } from '../utils/memoryAudioController';

interface StageSurpriseGiftProps {
  config: BirthdayConfig;
  onProceed: () => void;
}

export const StageSurpriseGift: React.FC<StageSurpriseGiftProps> = ({ config, onProceed }) => {
  const content = config.journeyReflection ?? {
    heading: 'How Was the Journey?',
    subheading: 'Hope you enjoyed the journey…',
    paragraphs: [
      'Some journeys are measured in distance, while others are measured in the smiles, little moments, and memories they leave behind. I hope this little journey brought a few smiles to your face and reminded you that even the smallest moments can become something beautiful.',
      'This is my Small Gift',
      'Unaku Pudichirukum Nu Nenaikuren',
    ],
    buttonText: 'A Small Message for You 💌',
  };

  // Automatically continue existing Memories soundtrack seamlessly from current position
  useEffect(() => {
    memoryAudioController.resume();
  }, []);

  const handleProceed = async () => {
    try {
      await memoryAudioController.resume();
    } catch {
      // ignore
    }
    onProceed();
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['Enter', ' '].includes(e.key)) {
        handleProceed();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onProceed]);

  return (
    <div className="stage-container journey-reflection-stage" role="region" aria-label="Journey Reflection">
      {/* Subtle Floating Hearts & Gentle Glowing Ambient Lights */}
      <div className="reflection-ambient-glow" aria-hidden="true" />
      <div className="floating-hearts-layer" aria-hidden="true">
        <span className="drifting-heart dh-1">♡</span>
        <span className="drifting-heart dh-2">🌸</span>
        <span className="drifting-heart dh-3">♡</span>
        <span className="drifting-heart dh-4">✦</span>
        <span className="drifting-heart dh-5">♡</span>
        <span className="drifting-heart dh-6">🌸</span>
      </div>

      <div className="reflection-card glass-panel">
        <div className="reflection-glow-aura" />

        {/* Headings */}
        <header className="reflection-header">
          <div className="reflection-badge">
            <Heart size={14} className="badge-heart-icon fill-peach text-peach" />
            <span>MOMENTS & MEMORIES</span>
            <Heart size={14} className="badge-heart-icon fill-peach text-peach" />
          </div>

          <h1 className="reflection-main-heading gold-gradient-text">
            {content.heading}
          </h1>

          <p className="reflection-subheading">
            {content.subheading}
          </p>
        </header>

        {/* Creative Sentiments Passage */}
        <article className="reflection-body" aria-label="Journey Reflection Thoughts">
          <p className="reflection-paragraph anim-fade-1">
            {content.paragraphs[0]}
          </p>
          {content.paragraphs.length > 2 ? (
            <div className="journey-personal-gift-note anim-fade-2">
              <p className="journey-gift-line-1">{content.paragraphs[1]}</p>
              <p className="journey-gift-line-2">{content.paragraphs[2]}</p>
            </div>
          ) : (
            content.paragraphs.slice(1).map((p, idx) => (
              <p key={idx} className={`reflection-paragraph anim-fade-${idx + 2}`}>
                {p}
              </p>
            ))
          )}
        </article>

        {/* Heartbeat Animated Action Button */}
        <div className="reflection-action-row">
          <button
            onClick={handleProceed}
            className="btn-cinematic heartbeat-button"
            aria-label="Proceed to personal letter: A Small Message for You"
          >
            <Mail size={18} className="button-icon" />
            <span>{content.buttonText}</span>
          </button>
        </div>
      </div>

      <style>{`
        .journey-reflection-stage {
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          min-height: 100vh;
          width: 100vw;
          position: relative;
          overflow: hidden;
          padding: 60px 24px;
        }

        .reflection-ambient-glow {
          position: absolute;
          top: 30%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: clamp(340px, 50vw, 650px);
          height: clamp(340px, 50vw, 650px);
          border-radius: 50%;
          background: radial-gradient(circle, rgba(239, 195, 202, 0.22) 0%, rgba(250, 169, 67, 0.08) 50%, transparent 75%);
          filter: blur(55px);
          pointer-events: none;
          z-index: 0;
        }

        /* Floating Hearts */
        .floating-hearts-layer {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
          z-index: 1;
        }

        .drifting-heart {
          position: absolute;
          color: var(--color-primary);
          opacity: 0.35;
          animation: floatUpSlow 13s linear infinite;
        }

        .dh-1 { left: 14%; bottom: -40px; animation-delay: 0s; font-size: 1.5rem; }
        .dh-2 { left: 24%; bottom: -40px; animation-delay: 3.5s; font-size: 1.2rem; }
        .dh-3 { left: 78%; bottom: -40px; animation-delay: 1.8s; font-size: 1.6rem; }
        .dh-4 { left: 88%; bottom: -40px; animation-delay: 5s; font-size: 1.1rem; color: var(--color-secondary-peach); }
        .dh-5 { left: 45%; bottom: -40px; animation-delay: 7.2s; font-size: 1.4rem; }
        .dh-6 { left: 62%; bottom: -40px; animation-delay: 9s; font-size: 1.3rem; }

        @keyframes floatUpSlow {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 0;
          }
          15% {
            opacity: 0.38;
          }
          85% {
            opacity: 0.38;
          }
          100% {
            transform: translateY(-110vh) rotate(35deg);
            opacity: 0;
          }
        }

        .reflection-card {
          position: relative;
          z-index: 2;
          max-width: 780px;
          width: 100%;
          padding: 60px 48px;
          display: flex;
          flex-direction: column;
          align-items: center;
          background: radial-gradient(110% 115% at 50% 12%, rgba(52, 16, 42, 0.92) 0%, rgba(16, 4, 18, 0.97) 100%);
          border: 1px solid var(--color-border);
          border-radius: 30px;
          box-shadow: 0 35px 100px rgba(0, 0, 0, 0.85), 0 0 65px rgba(239, 195, 202, 0.18);
          animation: stageFadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          overflow: hidden;
        }

        .reflection-glow-aura {
          position: absolute;
          top: -70px;
          left: 50%;
          transform: translateX(-50%);
          width: 420px;
          height: 200px;
          background: radial-gradient(ellipse, rgba(239, 195, 202, 0.3) 0%, rgba(250, 169, 67, 0.12) 60%, transparent 80%);
          filter: blur(45px);
          pointer-events: none;
        }

        .reflection-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          margin-bottom: 32px;
        }

        .reflection-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 5px 16px;
          border-radius: 9999px;
          background: rgba(239, 195, 202, 0.1);
          border: 1px solid var(--color-border-subtle);
          font-family: var(--font-sans);
          font-size: 0.76rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          color: var(--color-secondary-peach, #FAA943);
          text-transform: uppercase;
        }

        .reflection-main-heading {
          font-family: var(--font-serif);
          font-size: clamp(2.2rem, 5vw, 3.2rem);
          font-weight: 700;
          letter-spacing: -0.01em;
          line-height: 1.25;
          margin: 0;
          text-shadow: 0 0 35px rgba(239, 195, 202, 0.45);
        }

        .reflection-subheading {
          font-family: var(--font-serif);
          font-style: italic;
          font-size: clamp(1.15rem, 2.4vw, 1.4rem);
          color: var(--color-secondary);
          margin: 0;
          letter-spacing: 0.01em;
        }

        .reflection-body {
          display: flex;
          flex-direction: column;
          gap: 20px;
          max-width: 660px;
          margin-bottom: 38px;
          text-align: center;
        }

        .reflection-paragraph {
          font-family: var(--font-sans);
          font-size: clamp(1.02rem, 2.1vw, 1.18rem);
          line-height: 1.8;
          color: rgba(255, 245, 248, 0.92);
          font-weight: 400;
          margin: 0;
        }

        .journey-personal-gift-note {
          margin-top: 14px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .journey-gift-line-1 {
          font-family: var(--font-serif);
          font-size: clamp(1.4rem, 2.8vw, 1.95rem);
          font-weight: 700;
          color: var(--color-secondary-peach, #FAA943);
          letter-spacing: 0.02em;
          margin: 0;
          text-shadow: 0 0 25px rgba(250, 169, 67, 0.4);
        }

        .journey-gift-line-2 {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-style: italic;
          font-size: clamp(1.22rem, 2.5vw, 1.62rem);
          font-weight: 600;
          color: var(--color-primary, #EFC3CA);
          letter-spacing: 0.025em;
          margin: 0;
          text-shadow: 0 0 20px rgba(239, 195, 202, 0.35);
        }

        .anim-fade-1 { animation: fadeSlideUp 0.75s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both; }
        .anim-fade-2 { animation: fadeSlideUp 0.75s cubic-bezier(0.16, 1, 0.3, 1) 0.28s both; }

        @keyframes fadeSlideUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .reflection-action-row {
          width: 100%;
          display: flex;
          justify-content: center;
          animation: fadeSlideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.55s both;
        }

        /* HEARTBEAT BUTTON ANIMATION */
        .heartbeat-button {
          font-family: var(--font-sans);
          font-size: 1.08rem;
          font-weight: 600;
          letter-spacing: 0.03em;
          padding: 15px 42px;
          border-radius: 9999px;
          display: inline-flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          touch-action: manipulation;
          animation: heartbeatPulse 2.4s ease-in-out infinite;
          transition: background 0.3s ease, border-color 0.3s ease;
        }

        .heartbeat-button:hover {
          animation-play-state: paused;
          transform: scale(1.05);
          box-shadow: 0 14px 40px rgba(239, 195, 202, 0.5);
        }

        .heartbeat-button:active {
          transform: scale(0.98);
        }

        @keyframes heartbeatPulse {
          0% {
            transform: scale(1);
            box-shadow: 0 10px 25px rgba(239, 195, 202, 0.25);
          }
          14% {
            transform: scale(1.06);
            box-shadow: 0 14px 38px rgba(239, 195, 202, 0.55), 0 0 25px rgba(239, 195, 202, 0.4);
          }
          28% {
            transform: scale(1);
            box-shadow: 0 10px 25px rgba(239, 195, 202, 0.25);
          }
          42% {
            transform: scale(1.035);
            box-shadow: 0 12px 30px rgba(239, 195, 202, 0.45), 0 0 18px rgba(239, 195, 202, 0.3);
          }
          70% {
            transform: scale(1);
            box-shadow: 0 10px 25px rgba(239, 195, 202, 0.25);
          }
          100% {
            transform: scale(1);
            box-shadow: 0 10px 25px rgba(239, 195, 202, 0.25);
          }
        }

        @media (max-width: 640px) {
          .journey-reflection-stage {
            padding: 40px 16px;
          }
          .reflection-card {
            padding: 42px 22px;
          }
          .heartbeat-button {
            width: 100%;
            justify-content: center;
            padding: 14px 24px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .heartbeat-button {
            animation: none !important;
          }
          .drifting-heart,
          .anim-fade-1,
          .anim-fade-2,
          .anim-fade-3 {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default StageSurpriseGift;
