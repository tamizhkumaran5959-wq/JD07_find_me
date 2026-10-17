import React, { useEffect, useState } from 'react';
import { Maximize2 } from 'lucide-react';
import type { BirthdayConfig } from '../types';

interface StageInvitationProps {
  config: BirthdayConfig;
  onProceed: () => void;
}

export const StageInvitation: React.FC<StageInvitationProps> = ({ config, onProceed }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleFullscreenToggle = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // Browser permissions or mobile fallbacks
    }
  };

  const handleStart = () => {
    if (hasInteracted) return;
    setHasInteracted(true);
    onProceed();
  };

  // Keyboard listener: any key to proceed (ignoring modifier keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['Shift', 'Control', 'Alt', 'Meta', 'F11', 'F12', 'Tab'].includes(e.key)) {
        return;
      }
      handleStart();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasInteracted]);

  return (
    <div className="stage-container invitation-stage">
      <div className="invitation-card glass-panel">
        {/* Soft Ambient Glow */}
        <div className="invitation-glow-aura" />

        {/* Main Visually Prioritized Message */}
        <div className="invitation-text-content">
          <h1 className="invitation-main-message gold-gradient-text">
            Someone has <strong className="text-highlight-bold">something special</strong> for you...
          </h1>

          <p className="invitation-subtext">
            An experience made just for <em className="text-accent-italic">your special day</em>.
          </p>
        </div>

        {/* Action Buttons & Guidance */}
        <div className="invitation-actions">
          <button
            onClick={handleStart}
            className="btn-cinematic clean-text-btn"
            aria-label="Start Birthday Experience"
          >
            <span>{config.openingMessage.buttonPrompt}</span>
          </button>

          <button
            onClick={handleFullscreenToggle}
            className="btn-ghost"
            title="Toggle fullscreen mode for cinematic view"
            aria-label="Toggle Fullscreen"
          >
            <Maximize2 size={16} />
            <span>{isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen (Optional)'}</span>
          </button>
        </div>

        {/* Guidance & Gentle Care Note */}
        <div className="invitation-footer-guidance">
          {config.openingMessage.subtleCareNote && (
            <p className="care-note">{config.openingMessage.subtleCareNote}</p>
          )}
          <p className="key-prompt pulse-subtle">{config.openingMessage.keyboardPrompt || 'Press any key to continue'}</p>
        </div>
      </div>

      <style>{`
        .invitation-stage {
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 40px 20px;
        }

        .invitation-card {
          max-width: 680px;
          width: 100%;
          padding: 68px 52px;
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          background: radial-gradient(120% 120% at 50% 15%, rgba(48, 16, 38, 0.85) 0%, rgba(18, 5, 20, 0.94) 100%);
          border: 1px solid var(--color-border);
          border-radius: 28px;
          box-shadow: 0 30px 80px rgba(0, 0, 0, 0.7), 0 0 50px rgba(239, 195, 202, 0.18);
          animation: invitationFadeIn 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          overflow: hidden;
        }

        .invitation-glow-aura {
          position: absolute;
          top: -60px;
          left: 50%;
          transform: translateX(-50%);
          width: 380px;
          height: 180px;
          background: radial-gradient(ellipse, rgba(239, 195, 202, 0.3) 0%, rgba(252, 232, 235, 0.1) 60%, transparent 80%);
          filter: blur(40px);
          pointer-events: none;
        }

        @keyframes invitationFadeIn {
          from {
            opacity: 0;
            transform: scale(0.97) translateY(12px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .invitation-text-content {
          margin-bottom: 44px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 18px;
        }

        .invitation-main-message {
          font-family: var(--font-serif);
          font-size: clamp(2.2rem, 5.2vw, 3.4rem);
          font-weight: 700;
          letter-spacing: -0.01em;
          line-height: 1.25;
          text-shadow: 0 0 35px rgba(239, 195, 202, 0.45);
          max-width: 580px;
        }

        .invitation-subtext {
          font-family: var(--font-sans);
          font-size: clamp(1.05rem, 2.2vw, 1.25rem);
          color: rgba(255, 245, 248, 0.85);
          max-width: 480px;
          line-height: 1.6;
          font-weight: 400;
        }

        .text-highlight-bold {
          color: #FFF9F8;
          font-weight: 800;
          text-shadow: 0 0 25px rgba(239, 195, 202, 0.6);
        }

        .text-accent-italic {
          font-family: var(--font-serif);
          font-style: italic;
          color: var(--color-primary);
          font-weight: 600;
        }

        .invitation-actions {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: center;
          gap: 16px;
          margin-bottom: 36px;
        }

        .clean-text-btn {
          font-family: var(--font-sans);
          font-size: 1.05rem;
          font-weight: 600;
          letter-spacing: 0.04em;
          padding: 14px 38px;
          border-radius: 9999px;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .clean-text-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(239, 195, 202, 0.35);
        }

        .invitation-footer-guidance {
          display: flex;
          flex-direction: column;
          gap: 8px;
          border-top: 1px solid var(--color-border-subtle);
          padding-top: 24px;
          width: 100%;
        }

        .care-note {
          font-family: var(--font-serif);
          font-style: italic;
          font-size: 0.95rem;
          color: var(--color-secondary);
          letter-spacing: 0.02em;
        }

        .key-prompt {
          font-size: 0.9rem;
          color: var(--color-primary);
          font-weight: 500;
          letter-spacing: 0.04em;
        }

        .pulse-subtle {
          animation: pulseGlow 2.5s ease-in-out infinite;
        }

        @media (max-width: 640px) {
          .invitation-card {
            padding: 44px 24px;
          }
          .invitation-actions {
            flex-direction: column;
            width: 100%;
          }
          .invitation-actions button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};
