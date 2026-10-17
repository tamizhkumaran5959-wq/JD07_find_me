import React, { useEffect, useState } from 'react';
import { Heart, RotateCcw } from 'lucide-react';
import type { BirthdayConfig } from '../types';
import { celebrationAudioController } from '../utils/celebrationAudioController';

interface StageFinalRevealProps {
  config: BirthdayConfig;
  onReplay: () => void;
}

export const EXACT_FINAL_PASSAGE =
  "I don't know if I will see you on your next birthday… or maybe we'll become strangers with memories .But I’ll never forget you. No matter where life takes us, I’ll always keep you in my memories as someone special. Even if I become just a small chapter in your story, you’ll always remain a beautiful part of mine. I hope your smile never fades and your heart finally finds the peace it deserves.";

export const StageFinalReveal: React.FC<StageFinalRevealProps> = ({ config, onReplay }) => {
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsRevealed(true);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  const heading = config.finalHeartMessage?.heading ?? 'Before I End This..♡';
  const rawPassage = config.finalHeartMessage?.passage ?? EXACT_FINAL_PASSAGE;
  const footnote = config.finalHeartMessage?.footnote ?? 'Some memories stay beautiful, even when the future is uncertain.';

  // Break passage into natural, emotionally resonant paragraphs for readability
  // First sentence, middle sentiment, closing wish
  const paragraphSegments = rawPassage.includes('\n\n')
    ? rawPassage.split('\n\n').filter(Boolean)
    : [
        "I don't know if I will see you on your next birthday… or maybe we'll become strangers with memories .But I’ll never forget you.",
        "No matter where life takes us, I’ll always keep you in my memories as someone special. Even if I become just a small chapter in your story, you’ll always remain a beautiful part of mine.",
        "I hope your smile never fades and your heart finally finds the peace it deserves.",
      ];

  return (
    <div
      className="stage-container final-intimate-stage"
      onClick={() => {
        if (celebrationAudioController.getState().isAutoplayBlocked) {
          celebrationAudioController.resume();
        }
      }}
      role="region"
      aria-label="A Final Message from My Heart"
    >
      {/* Cinematic Layered Night-Sky Ambience */}
      <div className="night-sky-ambience" aria-hidden="true">
        <div className="night-sky-nebula nebula-rose" />
        <div className="night-sky-nebula nebula-amber" />
        
        {/* Soft Twinkling Micro-Stars */}
        <span className="calm-star star-1">✧</span>
        <span className="calm-star star-2">✦</span>
        <span className="calm-star star-3">⋆</span>
        <span className="calm-star star-4">✧</span>
        <span className="calm-star star-5">✦</span>
        <span className="calm-star star-6">⋆</span>
        <span className="calm-star star-7">✧</span>
        <span className="calm-star star-8">⋆</span>

        {/* Delicate Drifting Embers & Hearts */}
        <span className="soft-heart sh-1">♡</span>
        <span className="soft-heart sh-2">♡</span>
        <span className="soft-heart sh-3">♡</span>
        <span className="soft-ember se-1" />
        <span className="soft-ember se-2" />
        <span className="soft-ember se-3" />
      </div>

      {/* Keepsake Letter Card */}
      <div className={`final-message-card glass-panel ${isRevealed ? 'is-visible' : ''}`}>
        <div className="card-ambient-glow" />

        {/* Vintage Keepsake Corner Florets */}
        <div className="card-corner-accents" aria-hidden="true">
          <span className="corner-floret cf-tl">✦</span>
          <span className="corner-floret cf-tr">✦</span>
          <span className="corner-floret cf-bl">✦</span>
          <span className="corner-floret cf-br">✦</span>
        </div>

        {/* Quiet Intimate Header */}
        <header className="final-header">
          <div className="final-heart-icon-wrapper" aria-hidden="true">
            <Heart size={20} className="fill-peach text-peach heart-pulse" />
          </div>

          <span className="final-eyebrow-tag">
            ONE LAST THOUGHT FROM MY HEART
          </span>

          <h1 className="final-heading romance-title-gradient">
            {heading}
          </h1>

          {/* Elegant Romantic Divider */}
          <div className="final-divider" aria-hidden="true">
            <span className="divider-line" />
            <span className="divider-heart">♡</span>
            <span className="divider-line" />
          </div>
        </header>

        {/* The Exact Supplied Passage with Generous Breathing Room */}
        <article className="final-passage-content" aria-label="Final message from heart">
          {paragraphSegments.map((paragraph, index) => (
            <p key={index} className={`passage-paragraph paragraph-${index + 1}`}>
              {paragraph}
            </p>
          ))}
        </article>

        {/* Visually Secondary Optional Footnote (No AI icons) */}
        {footnote && (
          <aside className="final-secondary-footnote">
            <Heart size={11} className="text-peach fill-peach opacity-80" />
            <span>{footnote}</span>
            <Heart size={11} className="text-peach fill-peach opacity-80" />
          </aside>
        )}

        {/* Peaceful Replay Option */}
        <footer className="final-footer-controls">
          <button
            onClick={onReplay}
            className="subtle-relive-btn"
            aria-label="Relive the birthday journey from the beginning"
          >
            <RotateCcw size={14} />
            <span>Relive the journey</span>
          </button>
        </footer>
      </div>

      <style>{`
        .final-intimate-stage {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          width: 100vw;
          position: relative;
          overflow-x: hidden;
          padding: 60px 24px;
          background: radial-gradient(120% 120% at 50% 10%, #160413 0%, #0a020d 55%, #030005 100%);
        }

        /* LAYERED NIGHT-SKY AMBIENCE */
        .night-sky-ambience {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
          z-index: 0;
        }

        .night-sky-nebula {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
        }

        .nebula-rose {
          top: 20%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: clamp(420px, 65vw, 850px);
          height: clamp(420px, 65vw, 850px);
          background: radial-gradient(circle, rgba(94, 20, 56, 0.42) 0%, rgba(42, 10, 32, 0.22) 50%, transparent 75%);
          animation: nebulaDriftRose 14s ease-in-out infinite alternate;
        }

        .nebula-amber {
          bottom: 15%;
          right: 25%;
          width: clamp(320px, 50vw, 650px);
          height: clamp(320px, 50vw, 650px);
          background: radial-gradient(circle, rgba(74, 38, 14, 0.32) 0%, rgba(40, 18, 8, 0.15) 50%, transparent 75%);
          animation: nebulaDriftAmber 18s ease-in-out infinite alternate;
        }

        @keyframes nebulaDriftRose {
          0% { transform: translate(-50%, -50%) scale(0.95); opacity: 0.65; }
          100% { transform: translate(-48%, -52%) scale(1.08); opacity: 0.95; }
        }

        @keyframes nebulaDriftAmber {
          0% { transform: scale(0.92); opacity: 0.5; }
          100% { transform: scale(1.06); opacity: 0.8; }
        }

        /* CALM TWINKLING STARS */
        .calm-star {
          position: absolute;
          color: var(--color-secondary);
          opacity: 0.45;
          animation: calmStarTwinkle 5s ease-in-out infinite alternate;
          user-select: none;
        }

        .star-1 { top: 12%; left: 14%; font-size: 1.15rem; animation-delay: 0s; }
        .star-2 { top: 24%; right: 16%; font-size: 1.35rem; animation-delay: 1.8s; color: var(--color-secondary-peach); }
        .star-3 { bottom: 22%; left: 12%; font-size: 0.95rem; animation-delay: 3.2s; }
        .star-4 { top: 66%; right: 14%; font-size: 1.25rem; animation-delay: 0.9s; }
        .star-5 { top: 16%; left: 78%; font-size: 1.05rem; animation-delay: 3.8s; }
        .star-6 { bottom: 14%; right: 28%; font-size: 0.85rem; animation-delay: 2.2s; }
        .star-7 { top: 45%; left: 6%; font-size: 0.9rem; animation-delay: 1.2s; color: var(--color-secondary-peach); }
        .star-8 { bottom: 40%; right: 8%; font-size: 1.1rem; animation-delay: 2.7s; }

        @keyframes calmStarTwinkle {
          0% { opacity: 0.2; transform: scale(0.85); }
          100% { opacity: 0.75; transform: scale(1.15); }
        }

        /* SOFT DRIFTING HEARTS */
        .soft-heart {
          position: absolute;
          color: var(--color-primary);
          opacity: 0.22;
          animation: softDriftUp 16s linear infinite;
          user-select: none;
        }

        .sh-1 { left: 16%; bottom: -30px; font-size: 1.35rem; animation-delay: 0s; }
        .sh-2 { left: 76%; bottom: -30px; font-size: 1.55rem; animation-delay: 5s; }
        .sh-3 { left: 44%; bottom: -30px; font-size: 1.15rem; animation-delay: 10s; }

        @keyframes softDriftUp {
          0% { transform: translateY(0); opacity: 0; }
          15% { opacity: 0.25; }
          85% { opacity: 0.25; }
          100% { transform: translateY(-110vh); opacity: 0; }
        }

        /* SOFT FLOATING EMBERS */
        .soft-ember {
          position: absolute;
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: rgba(250, 169, 67, 0.7);
          box-shadow: 0 0 8px rgba(250, 169, 67, 0.9);
          animation: emberRise 12s linear infinite;
        }

        .se-1 { left: 28%; bottom: -10px; animation-delay: 1s; }
        .se-2 { left: 62%; bottom: -10px; animation-delay: 6s; }
        .se-3 { left: 82%; bottom: -10px; animation-delay: 3s; }

        @keyframes emberRise {
          0% { transform: translateY(0) scale(0.8); opacity: 0; }
          20% { opacity: 0.7; }
          80% { opacity: 0.6; }
          100% { transform: translateY(-90vh) scale(1.2); opacity: 0; }
        }

        /* FINAL MESSAGE CARD - KEEPSAKE LETTER AESTHETIC */
        .final-message-card {
          position: relative;
          z-index: 2;
          max-width: 780px;
          width: 100%;
          padding: 60px 52px 46px 52px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          background: radial-gradient(130% 140% at 50% 0%, rgba(35, 10, 26, 0.92) 0%, rgba(16, 4, 15, 0.97) 65%, rgba(8, 2, 8, 0.99) 100%);
          border: 1px solid rgba(239, 195, 202, 0.22);
          border-radius: 32px;
          box-shadow: 
            0 40px 110px rgba(0, 0, 0, 0.9),
            0 0 70px rgba(239, 195, 202, 0.14),
            inset 0 1px 1px rgba(255, 255, 255, 0.15),
            inset 0 0 20px rgba(239, 195, 202, 0.04);
          opacity: 0;
          transform: translateY(24px) scale(0.98);
          transition: all 1.1s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .final-message-card.is-visible {
          opacity: 1;
          transform: translateY(0) scale(1);
        }

        /* VINTAGE KEEPSAKE CORNER FLORETS */
        .card-corner-accents {
          position: absolute;
          inset: 14px;
          pointer-events: none;
          border: 1px solid rgba(239, 195, 202, 0.08);
          border-radius: 22px;
        }

        .corner-floret {
          position: absolute;
          font-size: 0.75rem;
          color: rgba(239, 195, 202, 0.45);
          user-select: none;
        }

        .cf-tl { top: -6px; left: -6px; }
        .cf-tr { top: -6px; right: -6px; }
        .cf-bl { bottom: -6px; left: -6px; }
        .cf-br { bottom: -6px; right: -6px; }

        .card-ambient-glow {
          position: absolute;
          top: -70px;
          left: 50%;
          transform: translateX(-50%);
          width: 420px;
          height: 190px;
          background: radial-gradient(ellipse, rgba(239, 195, 202, 0.28) 0%, rgba(250, 169, 67, 0.12) 55%, transparent 80%);
          filter: blur(50px);
          pointer-events: none;
        }

        /* HEADER AREA */
        .final-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          margin-bottom: 26px;
        }

        .final-heart-icon-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 46px;
          height: 46px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(239, 195, 202, 0.16) 0%, rgba(239, 195, 202, 0.04) 100%);
          border: 1px solid rgba(239, 195, 202, 0.35);
          box-shadow: 0 0 24px rgba(239, 195, 202, 0.35);
          margin-bottom: 2px;
        }

        .heart-pulse {
          animation: softHeartPulse 2.8s ease-in-out infinite;
        }

        @keyframes softHeartPulse {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 4px rgba(239, 195, 202, 0.4)); }
          50% { transform: scale(1.12); filter: drop-shadow(0 0 10px rgba(239, 195, 202, 0.8)); }
        }

        .final-eyebrow-tag {
          font-family: var(--font-sans);
          font-size: 0.74rem;
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(239, 195, 202, 0.72);
        }

        /* ELEGANT ROMANTIC TITLE TREATMENT */
        .final-heading {
          font-family: var(--font-serif);
          font-size: clamp(2.1rem, 5.2vw, 3.2rem);
          font-weight: 600;
          letter-spacing: 0.01em;
          line-height: 1.25;
          margin: 4px 0 0 0;
          animation: titleGentleFade 1s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both;
        }

        .romance-title-gradient {
          background: linear-gradient(135deg, #FFFDFC 0%, #FDE8EC 40%, #EFC3CA 75%, #FAA943 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: drop-shadow(0 2px 22px rgba(239, 195, 202, 0.4));
        }

        @keyframes titleGentleFade {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* REFINED ROMANTIC DIVIDER */
        .final-divider {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          max-width: 380px;
          gap: 16px;
          margin: 10px 0 4px 0;
        }

        .divider-line {
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(239, 195, 202, 0.45), transparent);
        }

        .divider-heart {
          font-size: 0.95rem;
          color: rgba(239, 195, 202, 0.75);
          line-height: 1;
        }

        /* PASSAGE CONTENT - EDITORIAL KEEPSAKE LETTER */
        .final-passage-content {
          display: flex;
          flex-direction: column;
          gap: 26px;
          max-width: 660px;
          margin-bottom: 36px;
          text-align: center;
        }

        .passage-paragraph {
          font-family: var(--font-sans);
          font-size: clamp(1.08rem, 2.3vw, 1.25rem);
          line-height: 2.05;
          color: rgba(255, 248, 250, 0.95);
          font-weight: 400;
          margin: 0;
          letter-spacing: 0.015em;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
        }

        .paragraph-1 { animation: passageGentleFade 1s cubic-bezier(0.16, 1, 0.3, 1) 0.35s both; }
        .paragraph-2 { animation: passageGentleFade 1s cubic-bezier(0.16, 1, 0.3, 1) 0.65s both; }
        .paragraph-3 { animation: passageGentleFade 1s cubic-bezier(0.16, 1, 0.3, 1) 0.95s both; }

        @keyframes passageGentleFade {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* VISUALLY SECONDARY FOOTNOTE */
        .final-secondary-footnote {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          margin-bottom: 34px;
          padding: 8px 22px;
          border-radius: 9999px;
          background: rgba(239, 195, 202, 0.07);
          border: 1px solid rgba(239, 195, 202, 0.2);
          font-family: var(--font-serif);
          font-style: italic;
          font-size: 0.94rem;
          color: var(--color-secondary);
          opacity: 0.9;
          letter-spacing: 0.02em;
          animation: passageGentleFade 0.9s cubic-bezier(0.16, 1, 0.3, 1) 1.25s both;
        }

        /* PEACEFUL REPLAY CONTROLS */
        .final-footer-controls {
          width: 100%;
          display: flex;
          justify-content: center;
          padding-top: 20px;
          border-top: 1px solid rgba(239, 195, 202, 0.12);
          animation: passageGentleFade 0.9s cubic-bezier(0.16, 1, 0.3, 1) 1.45s both;
        }

        .subtle-relive-btn {
          background: rgba(239, 195, 202, 0.04);
          border: 1px solid rgba(239, 195, 202, 0.22);
          color: rgba(255, 245, 248, 0.7);
          font-family: var(--font-sans);
          font-size: 0.9rem;
          font-weight: 500;
          padding: 9px 26px;
          border-radius: 9999px;
          cursor: pointer;
          letter-spacing: 0.04em;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .subtle-relive-btn:hover {
          color: #FFF9F8;
          border-color: rgba(239, 195, 202, 0.6);
          background: rgba(239, 195, 202, 0.14);
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.5), 0 0 15px rgba(239, 195, 202, 0.2);
        }

        /* RESPONSIVE DESIGN */
        @media (max-width: 768px) {
          .final-intimate-stage {
            padding: 50px 20px;
          }
          .final-message-card {
            padding: 48px 32px 38px 32px;
          }
          .final-passage-content {
            gap: 22px;
          }
          .passage-paragraph {
            line-height: 1.95;
          }
        }

        @media (max-width: 480px) {
          .final-intimate-stage {
            padding: 36px 14px 44px 14px;
          }
          .final-message-card {
            padding: 38px 18px 28px 18px;
            border-radius: 24px;
          }
          .card-corner-accents {
            inset: 8px;
            border-radius: 16px;
          }
          .final-header {
            gap: 10px;
            margin-bottom: 20px;
          }
          .final-heading {
            font-size: 1.85rem;
          }
          .final-passage-content {
            gap: 18px;
            margin-bottom: 28px;
          }
          .passage-paragraph {
            font-size: 1.05rem;
            line-height: 1.85;
          }
          .final-secondary-footnote {
            font-size: 0.85rem;
            padding: 6px 14px;
            margin-bottom: 24px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .calm-star,
          .soft-heart,
          .soft-ember,
          .heart-pulse,
          .night-sky-nebula,
          .final-heading,
          .paragraph-1,
          .paragraph-2,
          .paragraph-3,
          .final-secondary-footnote,
          .final-footer-controls {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default StageFinalReveal;
