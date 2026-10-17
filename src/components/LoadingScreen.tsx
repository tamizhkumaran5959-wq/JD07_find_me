import React, { useEffect, useState, useCallback, useRef } from 'react';
import { RotateCcw, CheckCircle2, AlertCircle, Film } from 'lucide-react';
import { trainVideoController, type TrainVideoState } from '../utils/trainVideoController';

interface LoadingScreenProps {
  onReady: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onReady }) => {
  const [videoState, setVideoState] = useState<TrainVideoState>(trainVideoController.getState());
  const [canProceed, setCanProceed] = useState<boolean>(false);
  const [isFadingOut, setIsFadingOut] = useState<boolean>(false);
  const [hasClicked, setHasClicked] = useState<boolean>(false);
  const autoProceedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleBegin = useCallback(() => {
    if (hasClicked) return;
    setHasClicked(true);
    if (autoProceedTimerRef.current) {
      clearTimeout(autoProceedTimerRef.current);
    }
    setIsFadingOut(true);
    setTimeout(() => {
      onReady();
    }, 550);
  }, [hasClicked, onReady]);

  useEffect(() => {
    const startTime = Date.now();

    const unlockAndAutoProceed = () => {
      setCanProceed(true);
      // Auto proceed after 1.8s so user is never stuck
      if (!autoProceedTimerRef.current) {
        autoProceedTimerRef.current = setTimeout(() => {
          handleBegin();
        }, 1800);
      }
    };

    const unsubscribe = trainVideoController.subscribe((state) => {
      setVideoState(state);

      if (state.overallReady) {
        const elapsed = Date.now() - startTime;
        const delay = Math.max(0, 1000 - elapsed);
        setTimeout(unlockAndAutoProceed, delay);
      }
    });

    // Safety fallback: guaranteed proceed after 2.4s even on slow devices
    const safetyTimer = setTimeout(unlockAndAutoProceed, 2400);

    return () => {
      unsubscribe();
      clearTimeout(safetyTimer);
      if (autoProceedTimerRef.current) {
        clearTimeout(autoProceedTimerRef.current);
      }
    };
  }, [handleBegin]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (['Shift', 'Control', 'Alt', 'Meta', 'F11', 'F12', 'Tab'].includes(e.key)) return;
      handleBegin();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleBegin]);

  const opening = videoState.opening;
  const looping = videoState.looping;

  return (
    <div
      className={`loading-screen-root${isFadingOut ? ' loading-fade-out' : ''}`}
      aria-live="polite"
      aria-label="Preparing Your Beautiful Memories"
      onClick={handleBegin}
      style={{ cursor: 'pointer' }}
    >
      <div className="loading-ambient-bg" />

      {/* Subtle Star Particles */}
      <div className="loading-stars" aria-hidden="true">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="loading-star"
            style={{
              left: `${((i * 137.5) % 100).toFixed(1)}%`,
              top: `${((i * 97.3 + 12) % 100).toFixed(1)}%`,
              animationDelay: `${(i * 0.35) % 4}s`,
              animationDuration: `${3 + (i % 3)}s`,
              width: i % 4 === 0 ? '3px' : '2px',
              height: i % 4 === 0 ? '3px' : '2px',
            }}
          />
        ))}
      </div>

      <div className="loading-content-card" onClick={(e) => e.stopPropagation()}>
        <div className="loading-glow-aura" aria-hidden="true" />

        {/* Cinematic Train Animation */}
        <div className="loading-train-icon" aria-hidden="true">
          <svg width="56" height="40" viewBox="0 0 56 40" fill="none">
            <rect x="4" y="10" width="40" height="22" rx="6" fill="url(#loadTrainBody)" />
            <rect x="2" y="16" width="6" height="10" rx="3" fill="url(#loadTrainCabin)" />
            <rect x="44" y="18" width="10" height="6" rx="3" fill="url(#loadTrainFront)" />
            <circle cx="12" cy="34" r="5" fill="url(#loadWheel)" />
            <circle cx="28" cy="34" r="5" fill="url(#loadWheel)" />
            <circle cx="44" cy="34" r="5" fill="url(#loadWheel)" />
            <rect x="8" y="14" width="10" height="8" rx="2" fill="rgba(255,255,255,0.22)" />
            <rect x="22" y="14" width="8" height="8" rx="2" fill="rgba(255,255,255,0.22)" />
            <rect x="34" y="14" width="8" height="8" rx="2" fill="rgba(255,255,255,0.22)" />
            <defs>
              <linearGradient id="loadTrainBody" x1="4" y1="10" x2="44" y2="32" gradientUnits="userSpaceOnUse">
                <stop stopColor="#5a2d42" />
                <stop offset="1" stopColor="#3a1428" />
              </linearGradient>
              <linearGradient id="loadTrainCabin" x1="2" y1="16" x2="8" y2="26" gradientUnits="userSpaceOnUse">
                <stop stopColor="#7a3d52" />
                <stop offset="1" stopColor="#4a1a2e" />
              </linearGradient>
              <linearGradient id="loadTrainFront" x1="44" y1="18" x2="54" y2="24" gradientUnits="userSpaceOnUse">
                <stop stopColor="#EFC3CA" />
                <stop offset="1" stopColor="#DDA7B0" />
              </linearGradient>
              <radialGradient id="loadWheel" cx="0.5" cy="0.5" r="0.5">
                <stop stopColor="#8a4a5c" />
                <stop offset="1" stopColor="#2a0d1a" />
              </radialGradient>
            </defs>
          </svg>
          <div className="loading-track-line">
            <div className="loading-track-moving" />
          </div>
        </div>

        {/* Header Message */}
        <h1 className="loading-title gold-gradient-text">Preparing Your Beautiful Memories&hellip;</h1>
        <p className="loading-subtitle">Optimizing your cinematic train journey for instant, smooth playback</p>

        {/* Separate Media Preparation Status for Both Videos */}
        <div className="loading-tracks-container" aria-label="Media Preparation Status">
          {/* Track 1: Begining.mp4 */}
          <div className="loading-track-item">
            <div className="loading-track-header">
              <span className="loading-track-name">
                <Film size={14} className="track-icon" />
                Train Intro Video (Begining.mp4)
              </span>
              <span className="loading-track-status">
                {opening.status === 'error' ? (
                  <span className="status-badge error">
                    <AlertCircle size={12} /> Error
                  </span>
                ) : opening.isReady || canProceed ? (
                  <span className="status-badge ready">
                    <CheckCircle2 size={12} /> Ready to Play
                  </span>
                ) : (
                  <span className="status-badge buffering">
                    Buffering {opening.bufferedPercent}%
                  </span>
                )}
              </span>
            </div>
            <div className="loading-progress-track">
              <div
                className={`loading-progress-fill ${opening.isReady || canProceed ? 'fill-ready' : ''}`}
                style={{ width: `${opening.isReady || canProceed ? 100 : Math.max(12, opening.bufferedPercent)}%` }}
              />
            </div>
            {opening.status === 'error' && (
              <button
                type="button"
                className="track-retry-btn"
                onClick={() => trainVideoController.retry('opening')}
              >
                <RotateCcw size={12} /> Retry Intro Video
              </button>
            )}
          </div>

          {/* Track 2: Looping.mp4 */}
          <div className="loading-track-item">
            <div className="loading-track-header">
              <span className="loading-track-name">
                <Film size={14} className="track-icon" />
                Train Memories Loop (Looping.mp4)
              </span>
              <span className="loading-track-status">
                {looping.status === 'error' ? (
                  <span className="status-badge error">
                    <AlertCircle size={12} /> Error
                  </span>
                ) : looping.isReady || canProceed ? (
                  <span className="status-badge ready">
                    <CheckCircle2 size={12} /> Ready to Loop
                  </span>
                ) : (
                  <span className="status-badge buffering">
                    Buffering {looping.bufferedPercent}%
                  </span>
                )}
              </span>
            </div>
            <div className="loading-progress-track">
              <div
                className={`loading-progress-fill ${looping.isReady || canProceed ? 'fill-ready' : ''}`}
                style={{ width: `${looping.isReady || canProceed ? 100 : Math.max(12, looping.bufferedPercent)}%` }}
              />
            </div>
            {looping.status === 'error' && (
              <button
                type="button"
                className="track-retry-btn"
                onClick={() => trainVideoController.retry('looping')}
              >
                <RotateCcw size={12} /> Retry Looping Video
              </button>
            )}
          </div>
        </div>

        {/* CTA Launch Section */}
        <div className="loading-cta-area cta-visible">
          <button
            type="button"
            className="btn-cinematic loading-begin-btn"
            onClick={handleBegin}
            disabled={hasClicked}
            aria-label="Begin the birthday experience"
          >
            <span>&#10024; Begin the Journey</span>
          </button>
          <p className="loading-key-hint pulse-subtle">
            {canProceed ? 'Entering automatically or press any key' : 'Press any key or click to continue'}
          </p>
        </div>
      </div>

      <style>{`
        .loading-screen-root {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-deep);
          animation: loadingFadeIn 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          overflow: hidden;
        }
        .loading-screen-root.loading-fade-out {
          animation: loadingFadeOut 0.55s cubic-bezier(0.4, 0, 0.6, 1) forwards;
          pointer-events: none;
        }
        @keyframes loadingFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes loadingFadeOut { from { opacity: 1; transform: scale(1); } to { opacity: 0; transform: scale(1.04); } }

        .loading-ambient-bg {
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 80% 60% at 50% 0%, rgba(90, 30, 60, 0.45) 0%, transparent 65%),
            radial-gradient(ellipse 60% 50% at 15% 100%, rgba(48, 12, 36, 0.5) 0%, transparent 60%),
            radial-gradient(ellipse 50% 40% at 85% 90%, rgba(60, 15, 45, 0.4) 0%, transparent 55%);
          pointer-events: none;
        }

        .loading-stars { position: absolute; inset: 0; pointer-events: none; }
        .loading-star {
          position: absolute;
          background: var(--color-primary);
          border-radius: 50%;
          animation: starTwinkle 3s ease-in-out infinite alternate;
          box-shadow: 0 0 6px var(--color-primary);
        }
        @keyframes starTwinkle { from { opacity: 0.12; transform: scale(0.7); } to { opacity: 0.9; transform: scale(1.4); } }

        .loading-content-card {
          position: relative;
          display: flex; flex-direction: column; align-items: center; text-align: center; gap: 16px;
          padding: 40px 36px 34px; max-width: 520px; width: calc(100% - 32px);
          background: radial-gradient(120% 130% at 50% 0%, rgba(58, 18, 42, 0.94) 0%, rgba(14, 4, 18, 0.98) 100%);
          border: 1px solid var(--color-border-subtle); border-radius: 28px;
          box-shadow: 0 40px 100px rgba(0, 0, 0, 0.75), 0 0 60px rgba(239, 195, 202, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.08);
          animation: cardRise 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @keyframes cardRise { from { opacity: 0; transform: translateY(20px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }

        .loading-glow-aura {
          position: absolute; top: -80px; left: 50%; transform: translateX(-50%);
          width: 420px; height: 200px;
          background: radial-gradient(ellipse, rgba(239, 195, 202, 0.22) 0%, rgba(247, 214, 220, 0.08) 55%, transparent 75%);
          filter: blur(50px); pointer-events: none;
          animation: auraBreath 3.5s ease-in-out infinite alternate;
        }
        @keyframes auraBreath { from { opacity: 0.6; } to { opacity: 1; } }

        .loading-train-icon { display: flex; flex-direction: column; align-items: center; gap: 8px; animation: trainFloat 2.8s ease-in-out infinite alternate; }
        @keyframes trainFloat { from { transform: translateX(-6px); } to { transform: translateX(6px); } }

        .loading-track-line { position: relative; width: 120px; height: 4px; background: rgba(221, 167, 176, 0.15); border-radius: 2px; overflow: hidden; }
        .loading-track-moving { position: absolute; top: 0; height: 100%; width: 40%; background: linear-gradient(90deg, transparent, var(--color-primary), transparent); animation: trackSlide 1.2s linear infinite; border-radius: 2px; }
        @keyframes trackSlide { from { left: -40%; } to { left: 100%; } }

        .loading-title { font-family: var(--font-serif); font-size: clamp(1.4rem, 3.8vw, 1.9rem); font-weight: 700; line-height: 1.25; letter-spacing: -0.01em; text-shadow: 0 0 35px rgba(239, 195, 202, 0.35); }
        .loading-subtitle { font-family: var(--font-serif); font-style: italic; font-size: clamp(0.88rem, 2vw, 1rem); color: rgba(255, 245, 248, 0.72); line-height: 1.45; margin-top: -6px; }

        /* Separate Video Tracks */
        .loading-tracks-container {
          display: flex; flex-direction: column; gap: 12px; width: 100%; margin-top: 4px;
        }
        .loading-track-item {
          display: flex; flex-direction: column; gap: 6px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(239, 195, 202, 0.08);
          border-radius: 14px;
          padding: 10px 14px;
          text-align: left;
        }
        .loading-track-header {
          display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem;
        }
        .loading-track-name {
          display: flex; align-items: center; gap: 6px;
          color: rgba(255, 245, 248, 0.88);
          font-weight: 500;
        }
        .track-icon { color: var(--color-primary); }
        .status-badge {
          display: inline-flex; align-items: center; gap: 4px;
          font-size: 0.75rem; font-weight: 600; padding: 2px 8px; border-radius: 9999px;
        }
        .status-badge.ready {
          background: rgba(46, 204, 113, 0.15); color: #2ecc71; border: 1px solid rgba(46, 204, 113, 0.3);
        }
        .status-badge.buffering {
          background: rgba(239, 195, 202, 0.12); color: var(--color-primary); border: 1px solid rgba(239, 195, 202, 0.2);
        }
        .status-badge.error {
          background: rgba(231, 76, 60, 0.15); color: #e74c3c; border: 1px solid rgba(231, 76, 60, 0.3);
        }
        .track-retry-btn {
          display: inline-flex; align-items: center; gap: 4px;
          background: rgba(231, 76, 60, 0.2); border: 1px solid rgba(231, 76, 60, 0.4);
          color: #ff7675; border-radius: 6px; padding: 4px 8px; font-size: 0.72rem; cursor: pointer;
          align-self: flex-start; margin-top: 4px;
        }

        .loading-progress-track {
          position: relative; width: 100%; height: 5px; background: rgba(221, 167, 176, 0.12); border-radius: 9999px; overflow: hidden;
        }
        .loading-progress-fill {
          height: 100%; background: linear-gradient(90deg, #EFC3CA 0%, #FAA943 100%);
          border-radius: 9999px; transition: width 0.35s ease;
        }
        .loading-progress-fill.fill-ready {
          background: linear-gradient(90deg, #2ecc71 0%, #27ae60 100%);
        }

        .loading-cta-area {
          display: flex; flex-direction: column; align-items: center; gap: 8px; width: 100%;
        }
        .loading-begin-btn { font-size: 1.05rem; padding: 13px 40px; letter-spacing: 0.05em; }
        .loading-key-hint { font-family: var(--font-sans); font-size: 0.82rem; color: rgba(239, 195, 202, 0.7); letter-spacing: 0.04em; }

        @media (max-width: 480px) {
          .loading-content-card { padding: 32px 18px 24px; gap: 12px; }
        }
      `}</style>
    </div>
  );
};
