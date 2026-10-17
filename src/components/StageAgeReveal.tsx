import React, { useState, useEffect, useRef } from 'react';
import { Train, Ticket, Sparkles, Heart, RotateCcw, Delete, ArrowRight } from 'lucide-react';
import type { BirthdayConfig } from '../types';
import { playBoardingSuccessChime, playKeypadClick } from '../utils/audioSynthesizer';
import { triggerGentleSparks } from '../utils/confetti';

interface StageAgeRevealProps {
  config: BirthdayConfig;
  onProceed: () => void;
}

type GiftPhase = 'initial' | 'opening' | 'keypad';
type BoardingPhase = 'idle' | 'approved' | 'departing';

const CORRECT_DATE = '18102005'; // 18-10-2005

export const StageAgeReveal: React.FC<StageAgeRevealProps> = ({ onProceed }) => {
  const [giftPhase, setGiftPhase] = useState<GiftPhase>('initial');
  const [digits, setDigits] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [boardingPhase, setBoardingPhase] = useState<BoardingPhase>('idle');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const stageATimerRef = useRef<number | null>(null);
  const stageBTimerRef = useRef<number | null>(null);
  const stageDTimerRef = useRef<number | null>(null);
  const shakeTimerRef = useRef<number | null>(null);
  const openTimerRef = useRef<number | null>(null);

  // Strictly enforce on-screen keypad only: block physical keyboard typing into date field
  useEffect(() => {
    const handlePhysicalKeyDown = (e: KeyboardEvent) => {
      // Prevent physical number keys, backspace, space, enter from typing or skipping
      if (
        (e.key >= '0' && e.key <= '9') ||
        e.key === 'Backspace' ||
        e.key === 'Delete' ||
        e.key === 'Enter' ||
        e.key === ' ' ||
        ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)
      ) {
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
          e.preventDefault();
        }
      }
    };

    window.addEventListener('keydown', handlePhysicalKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handlePhysicalKeyDown, { capture: true });
  }, []);

  // Cleanup all timers on unmount
  useEffect(() => {
    const timers = [stageATimerRef, stageBTimerRef, stageDTimerRef, shakeTimerRef, openTimerRef];
    return () => {
      timers.forEach((t) => {
        if (t.current) clearTimeout(t.current);
      });
    };
  }, []);

  const handleOpenGift = () => {
    if (giftPhase !== 'initial') return;
    setGiftPhase('opening');
    playBoardingSuccessChime();
    triggerGentleSparks();

    openTimerRef.current = window.setTimeout(() => {
      setGiftPhase('keypad');
    }, 1100);
  };

  // Keypad click handlers
  const handleDigitClick = (num: string) => {
    if (isSubmitting || boardingPhase !== 'idle') return;
    if (digits.length >= 8) return;

    playKeypadClick();
    setDigits((prev) => prev + num);
    if (errorMessage) setErrorMessage(null);
  };

  const handleBackspace = () => {
    if (isSubmitting || boardingPhase !== 'idle') return;
    playKeypadClick();
    setDigits((prev) => prev.slice(0, -1));
    if (errorMessage) setErrorMessage(null);
  };

  const handleClear = () => {
    if (isSubmitting || boardingPhase !== 'idle') return;
    playKeypadClick();
    setDigits('');
    if (errorMessage) setErrorMessage(null);
    setIsShaking(false);
  };

  // Date validation and boarding sequence
  const handleBoardSubmit = () => {
    if (isSubmitting || boardingPhase !== 'idle') return;
    if (digits.length !== 8) {
      setErrorMessage('Please enter all 8 digits of your birth date (DD-MM-YYYY) 💗');
      return;
    }

    setIsSubmitting(true);

    if (digits === CORRECT_DATE) {
      // Stage A — Validation Success
      setErrorMessage(null);
      setBoardingPhase('approved');
      playBoardingSuccessChime();
      triggerGentleSparks();

      // Stage B & C — Main Message & Departure Animation
      stageBTimerRef.current = window.setTimeout(() => {
        setBoardingPhase('departing');
      }, 850);

      // Stage D — Seamless Navigation to Memories Tab (runs only once)
      stageDTimerRef.current = window.setTimeout(() => {
        onProceed();
      }, 3400);
    } else {
      // Incorrect date: gentle, friendly message as requested
      setIsShaking(true);
      setErrorMessage('Not quite! Try again, you can do it 💗');

      shakeTimerRef.current = window.setTimeout(() => {
        setIsShaking(false);
        setIsSubmitting(false);
      }, 600);
    }
  };

  // Helper to determine placeholder or digit
  const getSlotValue = (index: number, placeholderChar: string) => {
    if (index < digits.length) {
      return digits[index];
    }
    return placeholderChar;
  };

  return (
    <div
      className="stage-container memory-train-stage"
      onPaste={(e) => e.preventDefault()}
      onDrop={(e) => e.preventDefault()}
    >
      {/* Background Ambience: Golden Fairy Lights & Romantic Platform Glow */}
      <div className="train-station-glow" aria-hidden="true" />

      {/* Floating Fairy-Light Sparks & Drifting Hearts */}
      <div className="floating-train-particles" aria-hidden="true">
        <span className="particle p-1">✨</span>
        <span className="particle p-2">✦</span>
        <span className="particle p-3">♡</span>
        <span className="particle p-4">✨</span>
        <span className="particle p-5">✦</span>
        <span className="particle p-6">♡</span>
      </div>

      {/* INITIAL SCREEN FOR SLIDE 2: A Small Gift for You 🎁 */}
      {giftPhase !== 'keypad' ? (
        <div className={`gift-reveal-card-initial glass-panel ${giftPhase === 'opening' ? 'is-box-opening' : ''}`}>
          <div className="gift-card-glow-aura" />

          <div className="gift-header-area">
            <h1 className="gift-screen-heading gold-gradient-text">
              A Small Gift for You 🎁
            </h1>
          </div>

          {/* 3D Floating Interactive Gift Box */}
          <div
            className={`gift-stage-arena ${giftPhase === 'opening' ? 'is-opened' : ''}`}
            onClick={handleOpenGift}
            role="button"
            tabIndex={0}
            aria-label="Open Your Gift"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') handleOpenGift();
            }}
          >
            <div className="gift-box-3d">
              {/* Glow Aura under Box */}
              <div className="gift-base-shadow" />
              <div className="gift-internal-glow" />

              {/* Gift Box Lid */}
              <div className={`gift-lid ${giftPhase === 'opening' ? 'lid-fly' : ''}`}>
                <div className="lid-ribbon-horizontal" />
                <div className="lid-ribbon-vertical" />
                <div className="lid-bow">
                  <span className="bow-loop bow-left" />
                  <span className="bow-loop bow-right" />
                  <span className="bow-center" />
                </div>
              </div>

              {/* Gift Box Body */}
              <div className="gift-body">
                <div className="body-ribbon-vertical" />
                <div className="body-ribbon-horizontal" />
                <div className="body-sheen" />
              </div>
            </div>

            {/* Floating Particles around Gift */}
            <div className="gift-particles-float" aria-hidden="true">
              <span className="gp gp-1">✨</span>
              <span className="gp gp-2">✦</span>
              <span className="gp gp-3">♡</span>
              <span className="gp gp-4">✨</span>
            </div>
          </div>

          <div className="gift-footer-area">
            <p className="gift-subtext-quote">
              Every beautiful journey deserves a little surprise…
            </p>

            <button
              onClick={handleOpenGift}
              disabled={giftPhase === 'opening'}
              className="btn-cinematic gift-open-btn"
              aria-label="Open Your Gift"
            >
              <span>Open Your Gift</span>
            </button>
          </div>
        </div>
      ) : boardingPhase === 'departing' ? (
        <div className="departure-view-card glass-panel" role="status" aria-live="polite">
          <div className="departure-badge">
            <Sparkles size={16} className="text-peach" />
            <span>SPECIAL BIRTHDAY JOURNEY</span>
            <Sparkles size={16} className="text-peach" />
          </div>

          <h1 className="departure-title gold-gradient-text">
            The Memories Journey Begins...
          </h1>

          <p className="departure-subtext">
            Your little world of beautiful moments is waiting for you. 💗
          </p>

          <div className="departure-train-status">
            <Train size={24} className="departure-train-icon" />
            <span className="status-label">Departing from Platform 21 ➔ Arriving at Memories</span>
          </div>

          {/* Golden Horizontal Light Trails & Drifting Stars */}
          <div className="train-light-trails" aria-hidden="true">
            <div className="trail trail-fast-1" />
            <div className="trail trail-fast-2" />
            <div className="trail trail-fast-3" />
            <span className="drift-star s-1">✨</span>
            <span className="drift-star s-2">✦</span>
            <span className="drift-star s-3">✨</span>
          </div>
        </div>
      ) : (
        /* STAGE A & KEYPAD: Romantic Train Ticket Boarding Terminal */
        <div className={`train-ticket-card glass-panel ${boardingPhase === 'approved' ? 'approved-glow' : ''}`}>
          {/* Subtle Decorative Ticket Perforations on Left & Right */}
          <div className="ticket-notch notch-left" aria-hidden="true" />
          <div className="ticket-notch notch-right" aria-hidden="true" />

          {/* Ticket Top Ribbon */}
          <header className="ticket-header-ribbon">
            <div className="ticket-brand">
              <Train size={18} className="text-peach" />
              <span className="ticket-journey-tag">SPECIAL BIRTHDAY JOURNEY</span>
            </div>
            <div className="ticket-meta">
              <span className="ticket-serial">PASSENGER № 21</span>
              <span className="ticket-platform">PLATFORM 21</span>
            </div>
          </header>

          <div className="ticket-divider-line" aria-hidden="true" />

          {/* Main Headings */}
          <div className="ticket-titles-section">
            <h1 className="boarding-main-title">
              The <span className="highlight-peach serif-italic">Memory Train</span> Has Arrived
            </h1>
            <h2 className="boarding-sub-title">
              Enter Your Date of Birth to <span className="highlight-peach">Board</span>
            </h2>
          </div>

          {/* Date-of-Birth Input Display Plate (Read-Only) */}
          <section className="date-display-section" aria-label="Date of Birth Entry">
            <div
              className={`date-plate ${isShaking ? 'shake-anim' : ''} ${
                boardingPhase === 'approved' ? 'plate-approved-glow' : ''
              }`}
            >
              {/* Day Segment */}
              <div className="date-segment">
                <span className={`date-slot ${digits.length > 0 ? 'is-filled' : 'is-empty'}`}>
                  {getSlotValue(0, 'D')}
                </span>
                <span className={`date-slot ${digits.length > 1 ? 'is-filled' : 'is-empty'}`}>
                  {getSlotValue(1, 'D')}
                </span>
              </div>

              <span className="date-hyphen" aria-hidden="true">-</span>

              {/* Month Segment */}
              <div className="date-segment">
                <span className={`date-slot ${digits.length > 2 ? 'is-filled' : 'is-empty'}`}>
                  {getSlotValue(2, 'M')}
                </span>
                <span className={`date-slot ${digits.length > 3 ? 'is-filled' : 'is-empty'}`}>
                  {getSlotValue(3, 'M')}
                </span>
              </div>

              <span className="date-hyphen" aria-hidden="true">-</span>

              {/* Year Segment */}
              <div className="date-segment">
                <span className={`date-slot ${digits.length > 4 ? 'is-filled' : 'is-empty'}`}>
                  {getSlotValue(4, 'Y')}
                </span>
                <span className={`date-slot ${digits.length > 5 ? 'is-filled' : 'is-empty'}`}>
                  {getSlotValue(5, 'Y')}
                </span>
                <span className={`date-slot ${digits.length > 6 ? 'is-filled' : 'is-empty'}`}>
                  {getSlotValue(6, 'Y')}
                </span>
                <span className={`date-slot ${digits.length > 7 ? 'is-filled' : 'is-empty'}`}>
                  {getSlotValue(7, 'Y')}
                </span>
              </div>
            </div>

            {/* 8-Digit Progress Pips Indicator */}
            <div
              className="digits-pip-tracker"
              aria-label={`${digits.length} of 8 digits entered`}
            >
              {Array.from({ length: 8 }).map((_, idx) => (
                <React.Fragment key={idx}>
                  <span
                    className={`pip-dot ${idx < digits.length ? 'pip-active' : ''}`}
                  />
                  {(idx === 1 || idx === 3) && <span className="pip-dash">•</span>}
                </React.Fragment>
              ))}
            </div>

            {/* Validation / Gentle Error Notice */}
            {errorMessage && (
              <div className="error-badge-gentle" role="alert">
                <Heart size={14} className="error-icon text-peach" />
                <span>{errorMessage}</span>
              </div>
            )}
          </section>

          {/* Stamp Effect upon Successful Boarding Approval */}
          {boardingPhase === 'approved' && (
            <div className="boarding-stamp-overlay" aria-label="Boarding Approved">
              <div className="stamp-ring">
                <span className="stamp-stars">★ ★ ★</span>
                <span className="stamp-headline">BOARDING APPROVED</span>
                <span className="stamp-sub">MEMORY EXPRESS • SPECIAL PASSENGER</span>
              </div>
            </div>
          )}

          {/* On-Screen Mouse-Operated Numeric Keypad */}
          <section className="keypad-grid-container" aria-label="On-Screen Keypad">
            <div className="keypad-grid">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleDigitClick(num)}
                  disabled={digits.length >= 8 || isSubmitting}
                  className="keypad-btn digit-btn"
                  aria-label={`Digit ${num}`}
                >
                  {num}
                </button>
              ))}

              {/* Bottom Row: Clear, 0, Backspace */}
              <button
                type="button"
                onClick={handleClear}
                disabled={digits.length === 0 || isSubmitting}
                className="keypad-btn util-btn clear-btn"
                aria-label="Clear all entered digits"
                title="Clear"
              >
                <RotateCcw size={15} />
                <span>Clear</span>
              </button>

              <button
                type="button"
                onClick={() => handleDigitClick('0')}
                disabled={digits.length >= 8 || isSubmitting}
                className="keypad-btn digit-btn zero-btn"
                aria-label="Digit 0"
              >
                0
              </button>

              <button
                type="button"
                onClick={handleBackspace}
                disabled={digits.length === 0 || isSubmitting}
                className="keypad-btn util-btn backspace-btn"
                aria-label="Delete previous digit"
                title="Backspace"
              >
                <Delete size={17} />
                <span>⌫</span>
              </button>
            </div>
          </section>

          {/* Action Button: Board the Memory Train */}
          <div className="ticket-action-area">
            <button
              type="button"
              onClick={handleBoardSubmit}
              disabled={digits.length !== 8 || isSubmitting || boardingPhase !== 'idle'}
              className={`btn-cinematic board-train-btn ${
                digits.length === 8 && boardingPhase === 'idle' ? 'is-ready-pulse' : ''
              }`}
              aria-label="Board the Memory Train"
            >
              <Ticket size={18} className="btn-ticket-icon" />
              <span>Board the Memory Train</span>
              <ArrowRight size={18} />
            </button>
          </div>

          {/* Minimal Train Platform Railway Motif at Bottom */}
          <footer className="minimal-railway-motif" aria-hidden="true">
            <div className="track-rail top-rail" />
            <div className="track-ties-strip">
              {Array.from({ length: 16 }).map((_, i) => (
                <span key={i} className="track-tie" />
              ))}
            </div>
            <div className="track-rail bottom-rail" />
          </footer>
        </div>
      )}

      <style>{`
        .memory-train-stage {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 40px 20px 80px 20px;
          min-height: 100vh;
        }

        /* SLIDE 2: INITIAL SCREEN GIFT CARD & 3D ANIMATED BOX */
        .gift-reveal-card-initial {
          max-width: 680px;
          width: 100%;
          padding: 56px 44px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          background: radial-gradient(110% 110% at 50% 15%, rgba(52, 16, 42, 0.9) 0%, rgba(14, 4, 16, 0.98) 100%);
          border: 1px solid var(--color-border);
          border-radius: 28px;
          box-shadow: 0 35px 90px rgba(0, 0, 0, 0.8), 0 0 60px rgba(239, 195, 202, 0.18);
          z-index: 2;
          animation: stageFadeIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          transition: opacity 0.5s ease, transform 0.5s ease;
        }

        .gift-reveal-card-initial.is-box-opening {
          box-shadow: 0 35px 100px rgba(0, 0, 0, 0.9), 0 0 80px rgba(250, 169, 67, 0.4);
        }

        .gift-card-glow-aura {
          position: absolute;
          top: -50px;
          left: 50%;
          transform: translateX(-50%);
          width: 360px;
          height: 180px;
          background: radial-gradient(ellipse, rgba(239, 195, 202, 0.32) 0%, rgba(250, 169, 67, 0.14) 60%, transparent 80%);
          filter: blur(45px);
          pointer-events: none;
        }

        .gift-screen-heading {
          font-family: var(--font-serif);
          font-size: clamp(2rem, 4.5vw, 3rem);
          font-weight: 700;
          line-height: 1.3;
          margin: 0 0 16px 0;
          text-shadow: 0 0 30px rgba(239, 195, 202, 0.4);
        }

        .gift-stage-arena {
          width: 280px;
          height: 240px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          position: relative;
          outline: none;
          margin: 12px 0 20px 0;
        }

        .gift-box-3d {
          position: relative;
          width: 160px;
          height: 160px;
          transform-style: preserve-3d;
          transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
          animation: floatGentle 4.5s ease-in-out infinite;
        }

        .gift-stage-arena:hover .gift-box-3d {
          transform: scale(1.04);
        }

        .gift-base-shadow {
          position: absolute;
          bottom: -28px;
          left: 15px;
          width: 130px;
          height: 32px;
          background: radial-gradient(ellipse, rgba(0, 0, 0, 0.7) 0%, transparent 75%);
          filter: blur(8px);
        }

        .gift-internal-glow {
          position: absolute;
          top: 15px;
          left: 5px;
          width: 150px;
          height: 150px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(239, 195, 202, 0.95) 0%, rgba(250, 169, 67, 0.65) 45%, transparent 70%);
          opacity: 0;
          filter: blur(25px);
          transition: opacity 0.6s ease, transform 0.6s ease;
          pointer-events: none;
          z-index: 10;
        }

        .is-opened .gift-internal-glow {
          opacity: 1;
          transform: scale(2.4);
        }

        .gift-lid {
          position: absolute;
          top: 0;
          left: -8px;
          width: 176px;
          height: 46px;
          background: linear-gradient(135deg, #521639 0%, #350c26 100%);
          border: 1px solid var(--color-border);
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.2);
          z-index: 5;
          will-change: transform, opacity;
          transition: transform 1.1s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s ease;
        }

        .lid-fly {
          transform: translate3d(0, -95px, 0) rotateX(65deg) rotateZ(-18deg);
          opacity: 0.15;
        }

        .lid-ribbon-vertical {
          position: absolute;
          top: 0;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 24px;
          background: linear-gradient(180deg, #FFF9F8 0%, #EFC3CA 50%, #DDA7B0 100%);
          box-shadow: 0 0 10px rgba(239, 195, 202, 0.5);
        }

        .lid-ribbon-horizontal {
          position: absolute;
          left: 0;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          height: 20px;
          background: linear-gradient(90deg, #FFF9F8 0%, #EFC3CA 50%, #DDA7B0 100%);
        }

        .lid-bow {
          position: absolute;
          top: -22px;
          left: 50%;
          transform: translateX(-50%);
          width: 56px;
          height: 28px;
        }

        .bow-loop {
          position: absolute;
          top: 0;
          width: 26px;
          height: 22px;
          border: 3px solid var(--color-primary);
          border-radius: 50% 50% 10% 50%;
          background: radial-gradient(circle, #FCE8EB 0%, #EFC3CA 100%);
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4);
        }

        .bow-left {
          left: 4px;
          transform: rotate(-35deg);
        }

        .bow-right {
          right: 4px;
          transform: rotate(35deg) scaleX(-1);
        }

        .bow-center {
          position: absolute;
          top: 8px;
          left: 50%;
          transform: translateX(-50%);
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #FFF9F8;
          box-shadow: 0 0 10px rgba(239, 195, 202, 0.9);
        }

        .gift-body {
          position: absolute;
          top: 36px;
          left: 0;
          width: 160px;
          height: 124px;
          background: linear-gradient(135deg, #3c102f 0%, #22071a 100%);
          border: 1px solid var(--color-border-subtle);
          border-radius: 0 0 12px 12px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.8);
          overflow: hidden;
        }

        .body-ribbon-vertical {
          position: absolute;
          top: 0;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 24px;
          background: linear-gradient(180deg, #FFF9F8 0%, #EFC3CA 50%, #DDA7B0 100%);
          box-shadow: 0 0 12px rgba(239, 195, 202, 0.4);
        }

        .body-ribbon-horizontal {
          position: absolute;
          left: 0;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          height: 20px;
          background: linear-gradient(90deg, #FFF9F8 0%, #EFC3CA 50%, #DDA7B0 100%);
        }

        .body-sheen {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, transparent 60%);
          pointer-events: none;
        }

        .gift-particles-float {
          position: absolute;
          inset: -20px;
          pointer-events: none;
        }

        .gp {
          position: absolute;
          color: var(--color-secondary-peach, #FAA943);
          font-size: 1.1rem;
          opacity: 0.7;
          animation: floatParticle 5s ease-in-out infinite;
        }

        .gp-1 { top: 0%; left: 8%; animation-delay: 0.2s; }
        .gp-2 { top: 15%; right: 8%; animation-delay: 1.2s; }
        .gp-3 { bottom: 12%; left: 12%; animation-delay: 2.2s; color: var(--color-primary); }
        .gp-4 { bottom: 8%; right: 10%; animation-delay: 3.2s; }

        .gift-footer-area {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 18px;
          width: 100%;
        }

        .gift-subtext-quote {
          font-family: var(--font-serif);
          font-style: italic;
          font-size: clamp(1.05rem, 2.2vw, 1.25rem);
          color: rgba(255, 245, 248, 0.9);
          margin: 0;
          line-height: 1.5;
        }

        .gift-open-btn {
          font-family: var(--font-sans);
          font-size: 1.05rem;
          font-weight: 600;
          letter-spacing: 0.04em;
          padding: 14px 38px;
          border-radius: 9999px;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .gift-open-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(239, 195, 202, 0.35);
        }

        @keyframes floatGentle {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        /* Ambient Warm Platform Glow */
        .train-station-glow {
          position: absolute;
          top: 20%;
          left: 50%;
          transform: translateX(-50%);
          width: 520px;
          height: 520px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(250, 169, 67, 0.16) 0%, rgba(239, 195, 202, 0.12) 45%, transparent 70%);
          filter: blur(55px);
          pointer-events: none;
          z-index: 0;
          animation: stationGlowPulse 4.5s ease-in-out infinite;
        }

        @keyframes stationGlowPulse {
          0%, 100% {
            opacity: 0.6;
            transform: translateX(-50%) scale(1);
          }
          50% {
            opacity: 0.9;
            transform: translateX(-50%) scale(1.08);
          }
        }

        /* Romantic Floating Fairy Sparks */
        .floating-train-particles {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
          z-index: 1;
        }

        .particle {
          position: absolute;
          color: var(--color-secondary-peach, #FAA943);
          opacity: 0.6;
          animation: floatParticle 6s ease-in-out infinite;
        }

        .p-1 { top: 14%; left: 16%; font-size: 1.1rem; animation-delay: 0s; }
        .p-2 { top: 28%; right: 18%; font-size: 0.9rem; animation-delay: 1.2s; }
        .p-3 { bottom: 22%; left: 20%; font-size: 1.2rem; color: var(--color-primary); animation-delay: 2.5s; }
        .p-4 { top: 65%; right: 15%; font-size: 1rem; animation-delay: 3.8s; }
        .p-5 { top: 18%; right: 28%; font-size: 0.8rem; animation-delay: 2s; }
        .p-6 { bottom: 30%; right: 24%; font-size: 1.1rem; color: var(--color-primary); animation-delay: 4.5s; }

        @keyframes floatParticle {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
            opacity: 0.4;
          }
          50% {
            transform: translateY(-16px) rotate(15deg);
            opacity: 0.85;
          }
        }

        /* LUXURY ROMANTIC TRAIN TICKET CARD */
        .train-ticket-card {
          position: relative;
          z-index: 2;
          max-width: 580px;
          width: 100%;
          padding: 40px 38px 28px 38px;
          display: flex;
          flex-direction: column;
          align-items: center;
          background: radial-gradient(115% 120% at 50% 12%, rgba(44, 14, 32, 0.94) 0%, rgba(18, 5, 20, 0.98) 100%);
          border: 1px solid var(--color-border-glow, rgba(239, 195, 202, 0.45));
          border-radius: 28px;
          box-shadow: 0 30px 85px rgba(0, 0, 0, 0.85), 0 0 50px rgba(250, 169, 67, 0.12), inset 0 1px 1px rgba(255, 255, 255, 0.18);
          overflow: hidden;
          transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .train-ticket-card.approved-glow {
          border-color: var(--color-secondary-peach, #FAA943);
          box-shadow: 0 30px 90px rgba(0, 0, 0, 0.9), 0 0 60px rgba(250, 169, 67, 0.35);
        }

        /* Ticket Notches */
        .ticket-notch {
          position: absolute;
          top: 66px;
          width: 24px;
          height: 24px;
          background: var(--bg-deep, #0a0308);
          border-radius: 50%;
          border: 1px solid var(--color-border);
          box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.8);
          z-index: 3;
        }

        .notch-left {
          left: -13px;
        }

        .notch-right {
          right: -13px;
        }

        /* Ticket Ribbon */
        .ticket-header-ribbon {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 12px;
        }

        .ticket-brand {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .ticket-journey-tag {
          font-family: var(--font-sans);
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          color: var(--color-secondary-peach, #FAA943);
          text-transform: uppercase;
        }

        .ticket-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 0.72rem;
          color: var(--color-primary);
          letter-spacing: 0.08em;
          font-weight: 600;
        }

        .ticket-divider-line {
          width: 100%;
          height: 1px;
          background: repeating-linear-gradient(90deg, var(--color-border-subtle) 0, var(--color-border-subtle) 6px, transparent 6px, transparent 12px);
          margin-bottom: 22px;
        }

        /* Headings */
        .ticket-titles-section {
          max-width: 500px;
          margin-bottom: 24px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .boarding-main-title {
          font-family: var(--font-serif);
          font-size: clamp(1.8rem, 4vw, 2.45rem);
          font-weight: 700;
          line-height: 1.25;
          color: #FFF9F8;
          text-shadow: 0 4px 18px rgba(0, 0, 0, 0.6);
          margin: 0;
        }

        .boarding-sub-title {
          font-family: var(--font-sans);
          font-size: clamp(0.95rem, 2vw, 1.15rem);
          font-weight: 500;
          color: rgba(255, 245, 248, 0.88);
          margin: 0;
          letter-spacing: 0.02em;
        }

        .highlight-peach {
          color: var(--color-secondary-peach, #FAA943);
          font-weight: 700;
        }

        .serif-italic {
          font-family: var(--font-serif);
          font-style: italic;
        }

        /* DATE OF BIRTH DISPLAY PLATE */
        .date-display-section {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 20px;
        }

        .date-plate {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: rgba(26, 7, 22, 0.85);
          border: 1px solid var(--color-border);
          border-radius: 18px;
          padding: 12px 22px;
          box-shadow: inset 0 3px 10px rgba(0, 0, 0, 0.6), 0 6px 20px rgba(0, 0, 0, 0.4);
          transition: all 0.3s ease;
          user-select: none;
        }

        .date-plate.plate-approved-glow {
          border-color: var(--color-secondary-peach, #FAA943);
          box-shadow: 0 0 25px rgba(250, 169, 67, 0.45), inset 0 0 15px rgba(250, 169, 67, 0.2);
        }

        .date-segment {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .date-slot {
          width: 38px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          font-family: var(--font-sans);
          font-size: 1.55rem;
          font-weight: 700;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .date-slot.is-filled {
          background: rgba(239, 195, 202, 0.16);
          color: #FFF9F8;
          border: 1px solid rgba(239, 195, 202, 0.5);
          box-shadow: 0 0 12px rgba(239, 195, 202, 0.3);
          transform: translateY(-1px);
        }

        .date-slot.is-empty {
          background: rgba(255, 255, 255, 0.03);
          color: rgba(239, 195, 202, 0.32);
          border: 1px dashed rgba(221, 167, 176, 0.25);
        }

        .date-hyphen {
          font-size: 1.5rem;
          color: var(--color-secondary-peach, #FAA943);
          font-weight: 700;
          opacity: 0.7;
          margin: 0 2px;
        }

        /* 8-Digit Pip Tracker */
        .digits-pip-tracker {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 10px;
        }

        .pip-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: rgba(239, 195, 202, 0.22);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .pip-dot.pip-active {
          background: var(--color-secondary-peach, #FAA943);
          box-shadow: 0 0 10px var(--color-secondary-peach, #FAA943);
          transform: scale(1.25);
        }

        .pip-dash {
          color: rgba(239, 195, 202, 0.3);
          font-size: 0.7rem;
        }

        /* Gentle Error Notice */
        .error-badge-gentle {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 12px;
          padding: 8px 16px;
          border-radius: 9999px;
          background: rgba(85, 18, 32, 0.85);
          border: 1px solid rgba(255, 123, 137, 0.45);
          color: #FFE0E4;
          font-size: 0.84rem;
          font-weight: 500;
          animation: fadeSlideUp 0.35s ease both;
        }

        .shake-anim {
          animation: dateShake 0.48s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
        }

        @keyframes dateShake {
          0%, 100% { transform: translateX(0); }
          15%, 45%, 75% { transform: translateX(-7px); }
          30%, 60%, 90% { transform: translateX(7px); }
        }

        /* BOARDING APPROVED STAMP OVERLAY */
        .boarding-stamp-overlay {
          position: absolute;
          top: 48%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-9deg);
          z-index: 10;
          pointer-events: none;
          animation: stampThud 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }

        .stamp-ring {
          padding: 14px 28px;
          border: 3px double var(--color-secondary-peach, #FAA943);
          border-radius: 12px;
          background: rgba(38, 12, 28, 0.88);
          box-shadow: 0 0 30px rgba(250, 169, 67, 0.5), inset 0 0 15px rgba(250, 169, 67, 0.25);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .stamp-stars {
          color: var(--color-secondary-peach, #FAA943);
          font-size: 0.85rem;
          letter-spacing: 0.25em;
        }

        .stamp-headline {
          font-family: var(--font-display, 'Cinzel', serif);
          font-size: 1.35rem;
          font-weight: 800;
          letter-spacing: 0.14em;
          color: var(--color-secondary-peach, #FAA943);
          text-shadow: 0 0 12px rgba(250, 169, 67, 0.8);
          white-space: nowrap;
        }

        .stamp-sub {
          font-family: var(--font-sans);
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          color: var(--color-primary);
          text-transform: uppercase;
        }

        @keyframes stampThud {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(2.2) rotate(-22deg);
          }
          100% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1) rotate(-9deg);
          }
        }

        /* KEYPAD GRID */
        .keypad-grid-container {
          width: 100%;
          max-width: 320px;
          margin-bottom: 22px;
        }

        .keypad-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          width: 100%;
        }

        .keypad-btn {
          height: 56px;
          background: rgba(255, 249, 248, 0.05);
          border: 1px solid rgba(221, 167, 176, 0.35);
          border-radius: 16px;
          color: #FFF9F8;
          font-family: var(--font-sans);
          font-size: 1.35rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          user-select: none;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
        }

        .keypad-btn:hover:not(:disabled) {
          background: rgba(239, 195, 202, 0.18);
          border-color: var(--color-secondary-peach, #FAA943);
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.5), 0 0 16px rgba(250, 169, 67, 0.25);
          color: #ffffff;
        }

        .keypad-btn:active:not(:disabled) {
          transform: translateY(1px) scale(0.94);
          background: rgba(250, 169, 67, 0.25);
          border-color: var(--color-secondary-peach, #FAA943);
        }

        .keypad-btn:disabled {
          opacity: 0.38;
          cursor: not-allowed;
          box-shadow: none;
        }

        .util-btn {
          font-size: 0.88rem;
          font-weight: 600;
          color: var(--color-primary);
          letter-spacing: 0.04em;
        }

        .clear-btn:hover:not(:disabled) {
          color: #ffb8c3;
          border-color: var(--color-border);
        }

        .backspace-btn:hover:not(:disabled) {
          color: var(--color-secondary-peach, #FAA943);
        }

        /* ACTION BUTTON */
        .ticket-action-area {
          width: 100%;
          display: flex;
          justify-content: center;
          margin-bottom: 20px;
        }

        .board-train-btn {
          width: 100%;
          max-width: 320px;
          padding: 15px 24px;
          font-size: 1.02rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          border-radius: 9999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          color: #4a1d28;
          background: linear-gradient(135deg, #FFF9F8 0%, #FCE8EB 20%, #FAA943 75%, #e09432 100%);
          border: 1px solid var(--color-secondary-peach, #FAA943);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.6), 0 0 20px rgba(250, 169, 67, 0.3);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .board-train-btn.is-ready-pulse {
          animation: readyPulse 2s ease-in-out infinite;
        }

        @keyframes readyPulse {
          0%, 100% {
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.6), 0 0 20px rgba(250, 169, 67, 0.4);
            transform: scale(1);
          }
          50% {
            box-shadow: 0 12px 30px rgba(0, 0, 0, 0.7), 0 0 35px rgba(250, 169, 67, 0.75);
            transform: scale(1.02);
          }
        }

        .board-train-btn:hover:not(:disabled) {
          transform: translateY(-2px) scale(1.03);
          box-shadow: 0 14px 35px rgba(0, 0, 0, 0.7), 0 0 35px rgba(250, 169, 67, 0.6);
        }

        .board-train-btn:active:not(:disabled) {
          transform: translateY(1px) scale(0.97);
        }

        .board-train-btn:disabled {
          opacity: 0.42;
          cursor: not-allowed;
          background: rgba(239, 195, 202, 0.15);
          color: rgba(255, 249, 248, 0.45);
          border-color: rgba(221, 167, 176, 0.3);
          box-shadow: none;
        }

        /* MINIMAL RAILWAY TRACK MOTIF */
        .minimal-railway-motif {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          opacity: 0.45;
          margin-top: 4px;
        }

        .track-rail {
          width: 100%;
          height: 2px;
          background: linear-gradient(90deg, transparent 0%, var(--color-secondary-peach, #FAA943) 25%, var(--color-secondary-peach, #FAA943) 75%, transparent 100%);
          border-radius: 1px;
        }

        .track-ties-strip {
          width: 85%;
          display: flex;
          justify-content: space-between;
          padding: 0 10px;
        }

        .track-tie {
          width: 4px;
          height: 8px;
          background: var(--color-border);
          border-radius: 1px;
        }

        /* DEPARTURE VIEW SCREEN (STAGE B & C) */
        .departure-view-card {
          position: relative;
          z-index: 3;
          max-width: 680px;
          width: 100%;
          padding: 60px 44px;
          display: flex;
          flex-direction: column;
          align-items: center;
          background: radial-gradient(115% 120% at 50% 15%, rgba(48, 14, 34, 0.96) 0%, rgba(14, 4, 16, 0.98) 100%);
          border: 1px solid var(--color-secondary-peach, #FAA943);
          border-radius: 32px;
          box-shadow: 0 35px 100px rgba(0, 0, 0, 0.9), 0 0 70px rgba(250, 169, 67, 0.35);
          animation: departureCardEnter 0.85s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          overflow: hidden;
        }

        @keyframes departureCardEnter {
          from {
            opacity: 0;
            transform: scale(0.92) translateY(24px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .departure-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 18px;
          border-radius: 9999px;
          background: rgba(250, 169, 67, 0.12);
          border: 1px solid rgba(250, 169, 67, 0.4);
          color: var(--color-secondary-peach, #FAA943);
          font-size: 0.76rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          margin-bottom: 22px;
        }

        .departure-title {
          font-family: var(--font-serif);
          font-size: clamp(2.1rem, 5.2vw, 3.2rem);
          font-weight: 700;
          line-height: 1.25;
          margin-bottom: 16px;
          text-shadow: 0 6px 25px rgba(0, 0, 0, 0.7);
        }

        .departure-subtext {
          font-family: var(--font-sans);
          font-size: clamp(1.05rem, 2.4vw, 1.35rem);
          color: rgba(255, 245, 248, 0.95);
          line-height: 1.6;
          margin-bottom: 32px;
          max-width: 520px;
        }

        .departure-train-status {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 22px;
          border-radius: 9999px;
          background: rgba(26, 8, 22, 0.8);
          border: 1px solid var(--color-border);
          color: var(--color-primary);
          font-size: 0.86rem;
          font-weight: 600;
          letter-spacing: 0.04em;
        }

        .departure-train-icon {
          color: var(--color-secondary-peach, #FAA943);
          animation: trainGlide 2.4s ease-in-out infinite alternate;
        }

        @keyframes trainGlide {
          from { transform: translateX(-4px); }
          to { transform: translateX(4px); }
        }

        /* Light Trails & Departure Motion */
        .train-light-trails {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
        }

        .trail {
          position: absolute;
          height: 2px;
          background: linear-gradient(90deg, transparent, var(--color-secondary-peach, #FAA943), transparent);
          border-radius: 9999px;
          opacity: 0.5;
        }

        .trail-fast-1 {
          top: 25%;
          width: 140px;
          animation: lightGlide 1.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }

        .trail-fast-2 {
          bottom: 30%;
          width: 200px;
          animation: lightGlide 2.2s cubic-bezier(0.4, 0, 0.2, 1) 0.6s infinite;
        }

        .trail-fast-3 {
          top: 75%;
          width: 110px;
          animation: lightGlide 1.6s cubic-bezier(0.4, 0, 0.2, 1) 1.1s infinite;
        }

        @keyframes lightGlide {
          0% {
            left: -200px;
            opacity: 0;
          }
          50% {
            opacity: 0.85;
          }
          100% {
            left: 100%;
            opacity: 0;
          }
        }

        .drift-star {
          position: absolute;
          color: var(--color-secondary-peach, #FAA943);
          animation: driftAcross 3s linear infinite;
        }

        .s-1 { top: 35%; animation-delay: 0.2s; font-size: 1rem; }
        .s-2 { top: 60%; animation-delay: 1.4s; font-size: 1.2rem; }
        .s-3 { top: 82%; animation-delay: 2.1s; font-size: 0.9rem; }

        @keyframes driftAcross {
          0% {
            left: 100%;
            opacity: 0;
            transform: scale(0.6);
          }
          50% {
            opacity: 0.9;
            transform: scale(1.1);
          }
          100% {
            left: -30px;
            opacity: 0;
            transform: scale(0.6);
          }
        }

        /* RESPONSIVE DESIGN */
        @media (max-width: 640px) {
          .memory-train-stage {
            padding: 24px 14px 80px 14px;
          }

          .train-ticket-card {
            padding: 30px 18px 22px 18px;
            border-radius: 22px;
          }

          .date-plate {
            padding: 10px 12px;
            gap: 4px;
          }

          .date-slot {
            width: 30px;
            height: 42px;
            font-size: 1.25rem;
          }

          .date-hyphen {
            font-size: 1.2rem;
            margin: 0 1px;
          }

          .keypad-grid-container {
            max-width: 290px;
          }

          .keypad-grid {
            gap: 8px;
          }

          .keypad-btn {
            height: 50px;
            font-size: 1.2rem;
            border-radius: 12px;
          }

          .util-btn {
            font-size: 0.8rem;
          }

          .departure-view-card {
            padding: 42px 20px;
          }

          .stamp-headline {
            font-size: 1.1rem;
          }
        }

        /* REDUCED MOTION PREFERENCES */
        @media (prefers-reduced-motion: reduce) {
          .stationGlowPulse,
          .floatParticle,
          .trainGlowPulse,
          .shake-anim,
          .stampThud,
          .readyPulse,
          .lightGlide,
          .driftAcross,
          .departureCardEnter {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </div>
  );
};
