import React, { useEffect, useRef, useState } from 'react';
import { Volume2 } from 'lucide-react';
import { trainVideoController, type TrainVideoState } from '../utils/trainVideoController';

interface TrainVideoBackgroundProps {
  isVisible: boolean;
}

export const TrainVideoBackground: React.FC<TrainVideoBackgroundProps> = ({ isVisible }) => {
  const openingVideoRef = useRef<HTMLVideoElement | null>(null);
  const loopingVideoRef = useRef<HTMLVideoElement | null>(null);
  const [videoState, setVideoState] = useState<TrainVideoState>(trainVideoController.getState());

  useEffect(() => {
    if (openingVideoRef.current && loopingVideoRef.current) {
      trainVideoController.init(openingVideoRef.current, loopingVideoRef.current);
    }

    const unsubscribe = trainVideoController.subscribe((state) => {
      setVideoState(state);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleEnableSound = () => {
    trainVideoController.enableSound();
  };

  return (
    <>
      <div
        className={`train-video-bg-viewport ${isVisible ? 'train-bg-active' : 'train-bg-inactive'}`}
        aria-hidden={!isVisible}
        style={{
          opacity: isVisible ? 1 : 0,
          pointerEvents: 'none',
          zIndex: 0,
          transition: 'opacity 0.8s ease',
        }}
      >
        {/* 1. Opening Train Journey Video (0-12s, with train audio) */}
        <video
          ref={openingVideoRef}
          src="/videos/Begining.mp4"
          className={`train-fullscreen-video opening-video-track ${
            videoState.phase === 'looping' ? 'video-fade-out' : 'video-visible'
          }`}
          playsInline
          preload="auto"
        />

        {/* 2. Continuous Looping Background Train Video */}
        <video
          ref={loopingVideoRef}
          src="/videos/Looping.mp4"
          className={`train-fullscreen-video looping-video-track ${
            videoState.phase === 'looping' ? 'video-visible' : 'video-hidden'
          }`}
          loop
          muted
          playsInline
          preload="auto"
        />

        {/* 3. Cinematic Scrim & Gradient Overlay */}
        <div
          className={`train-video-scrim-layer ${
            videoState.isPhotosRevealed ? 'scrim-photos-active' : 'scrim-opening-subtle'
          }`}
        />

        {/* 4. Floating "Enable Sound" Pill if browser autoplay policy blocked audio */}
        {isVisible && videoState.isAutoplayBlocked && (
          <button
            type="button"
            onClick={handleEnableSound}
            className="train-enable-sound-pill"
            aria-label="Enable train journey audio"
          >
            <Volume2 size={16} className="sound-pulse-icon" />
            <span>Enable Sound 🎶</span>
          </button>
        )}
      </div>

      <style>{`
        .train-video-bg-viewport {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          width: 100vw;
          height: 100vh;
          z-index: 0;
          pointer-events: none;
          overflow: hidden;
          background: #060205;
        }

        .train-fullscreen-video {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center center;
          transition: opacity 1.2s cubic-bezier(0.25, 1, 0.5, 1);
        }

        .video-visible {
          opacity: 1;
        }

        .video-fade-out {
          opacity: 0;
        }

        .video-hidden {
          opacity: 0;
        }

        .train-video-scrim-layer {
          position: absolute;
          inset: 0;
          z-index: 2;
          transition: background 1.6s ease;
          background: linear-gradient(180deg, rgba(8, 2, 7, 0.4) 0%, rgba(8, 2, 7, 0.1) 40%, rgba(8, 2, 7, 0.5) 100%);
        }

        .train-video-scrim-layer.scrim-photos-active {
          background: radial-gradient(circle at 50% 50%, rgba(8, 2, 7, 0.25) 0%, rgba(8, 2, 7, 0.65) 100%),
                      linear-gradient(180deg, rgba(8, 2, 7, 0.55) 0%, transparent 40%, rgba(8, 2, 7, 0.75) 100%);
        }

        .train-enable-sound-pill {
          position: fixed;
          top: 24px;
          right: 24px;
          z-index: 60;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border-radius: 9999px;
          background: rgba(28, 10, 26, 0.88);
          border: 1px solid var(--color-primary);
          color: var(--color-text-light);
          font-family: var(--font-sans);
          font-size: 0.88rem;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6), 0 0 15px rgba(239, 195, 202, 0.35);
          backdrop-filter: blur(12px);
          transition: all 0.3s ease;
        }
      `}</style>
    </>
  );
};
