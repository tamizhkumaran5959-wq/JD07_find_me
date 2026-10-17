import React, { useEffect, useState } from 'react';
import { Music, Volume2, VolumeX } from 'lucide-react';
import type { MemoryAudioConfig } from '../types';
import { memoryAudioController, type MemoryAudioState } from '../utils/memoryAudioController';

interface MemoryAudioPlayerProps {
  config?: MemoryAudioConfig;
}

export const MemoryAudioPlayer: React.FC<MemoryAudioPlayerProps> = ({ config }) => {
  const [audioState, setAudioState] = useState<MemoryAudioState>(() => memoryAudioController.getState());
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    // Initialize controller with config if provided
    if (config) {
      memoryAudioController.init(config);
    }

    // Subscribe to state updates
    const unsubscribe = memoryAudioController.subscribe((state) => {
      setAudioState(state);
    });

    // Enter memory tab: begins persistent playback across website
    memoryAudioController.startMemoryBgm();

    return () => {
      // Audio playback persists across all tabs; only unsubscribe listener
      unsubscribe();
    };
  }, [config]);

  const handleTogglePlay = () => {
    memoryAudioController.togglePlayPause();
  };

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    memoryAudioController.toggleMute();
  };

  const isBlocked = audioState.isAutoplayBlocked;
  const isPlaying = audioState.isPlaying;

  return (
    <div
      className={`memory-audio-widget glass-panel ${isPlaying ? 'is-active' : ''} ${isBlocked ? 'is-blocked-prompt pulse-subtle' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="region"
      aria-label="Memory Tab Background Music"
    >
      {/* Play / Pause / Unblock Button */}
      <button
        onClick={handleTogglePlay}
        className="memory-music-btn"
        aria-label={
          isBlocked
            ? 'Tap to enable memory music'
            : isPlaying
            ? 'Pause memory soundtrack'
            : 'Play memory soundtrack'
        }
        title={
          isBlocked
            ? 'Tap to enable memory music'
            : isPlaying
            ? 'Pause memory soundtrack'
            : 'Play memory soundtrack'
        }
      >
        <Music
          size={16}
          className={`music-icon ${isPlaying ? 'spin-gentle' : ''}`}
          style={{ color: 'var(--color-primary)' }}
        />

        {/* Equalizer animation bars when active */}
        {isPlaying && (
          <span className="memory-eq-bars" aria-hidden="true">
            <span className="m-eq m-eq-1" />
            <span className="m-eq m-eq-2" />
            <span className="m-eq m-eq-3" />
          </span>
        )}

        <span className="memory-audio-label">
          {isBlocked
            ? 'Tap to play music 🎵'
            : isPlaying
            ? (isHovered ? 'Pause Music' : 'Memories Melody')
            : 'Music Paused'}
        </span>
      </button>

      {/* Mute / Unmute Toggle */}
      <button
        onClick={handleToggleMute}
        className="memory-mute-btn"
        aria-label={audioState.isMuted ? 'Unmute music' : 'Mute music'}
        title={audioState.isMuted ? 'Unmute' : 'Mute'}
      >
        {audioState.isMuted ? (
          <VolumeX size={15} style={{ color: 'var(--color-border)' }} />
        ) : (
          <Volume2 size={15} style={{ color: 'var(--color-primary)' }} />
        )}
      </button>

      <style>{`
        .memory-audio-widget {
          position: fixed;
          top: 20px;
          left: 20px;
          z-index: 100;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          border-radius: 9999px;
          background: rgba(28, 10, 26, 0.85);
          border: 1px solid var(--color-border);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          box-shadow: 0 8px 24px rgba(90, 45, 55, 0.25);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          pointer-events: auto;
          user-select: none;
        }

        .memory-audio-widget.is-active {
          border-color: var(--color-primary);
          box-shadow: 0 8px 24px rgba(90, 45, 55, 0.3), 0 0 20px rgba(239, 195, 202, 0.35);
        }

        .memory-audio-widget.is-blocked-prompt {
          border-color: var(--color-secondary-peach);
          background: rgba(48, 16, 32, 0.95);
          box-shadow: 0 8px 24px rgba(90, 45, 55, 0.4), 0 0 20px rgba(250, 169, 67, 0.45);
          cursor: pointer;
        }

        .memory-music-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: transparent;
          border: none;
          color: var(--color-text-light);
          cursor: pointer;
          font-family: var(--font-sans);
          font-size: 0.82rem;
          font-weight: 600;
          letter-spacing: 0.02em;
          padding: 2px 4px;
          outline: none;
          transition: color 0.2s ease;
        }

        .memory-music-btn:hover {
          color: var(--color-primary);
        }

        .music-icon {
          flex-shrink: 0;
          transition: transform 0.2s ease;
        }

        .spin-gentle {
          animation: spinRecord 8s linear infinite;
        }

        .memory-eq-bars {
          display: inline-flex;
          align-items: flex-end;
          gap: 2.5px;
          height: 12px;
          padding-bottom: 1px;
        }

        .m-eq {
          width: 2.5px;
          background: linear-gradient(to top, var(--color-border), var(--color-primary));
          border-radius: 1px;
          animation: eqBounce 0.9s ease-in-out infinite alternate;
        }

        .m-eq-1 { height: 60%; animation-delay: 0.1s; }
        .m-eq-2 { height: 100%; animation-delay: 0.35s; }
        .m-eq-3 { height: 45%; animation-delay: 0.2s; }

        @keyframes eqBounce {
          0% { height: 25%; }
          100% { height: 100%; }
        }

        .memory-audio-label {
          white-space: nowrap;
          font-size: 0.8rem;
          color: var(--color-text-light);
        }

        .memory-mute-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 4px;
          border-radius: 50%;
          transition: transform 0.2s ease, opacity 0.2s ease;
          outline: none;
        }

        .memory-mute-btn:hover {
          transform: scale(1.15);
        }

        @media (max-width: 768px) {
          .memory-audio-widget {
            top: 14px;
            left: 14px;
            padding: 5px 10px;
          }

          .memory-audio-label {
            max-width: 95px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }
      `}</style>
    </div>
  );
};
