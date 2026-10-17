import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, Music, Disc } from 'lucide-react';
import type { AudioConfig, MemoryAudioConfig, BirthdayStage } from '../types';
import { ambientChimes } from '../utils/audioSynthesizer';
import { memoryAudioController, type MemoryAudioState } from '../utils/memoryAudioController';
import { celebrationAudioController, type CelebrationAudioState } from '../utils/celebrationAudioController';

interface AudioPlayerProps {
  config: AudioConfig;
  memoryConfig?: MemoryAudioConfig;
  autoStartRequested?: boolean;
  hasEnteredMemoryTab?: boolean;
  currentStage?: BirthdayStage;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  config,
  memoryConfig,
  autoStartRequested,
  hasEnteredMemoryTab = false,
  currentStage,
}) => {
  // Existing Tamil Song Audio Ref & State
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isTamilPlaying, setIsTamilPlaying] = useState<boolean>(false);
  const [isTamilMuted, setIsTamilMuted] = useState<boolean>(false);
  const [hasFileError, setHasFileError] = useState<boolean>(false);
  const [isUsingSynth, setIsUsingSynth] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Persistent Memory BGM State
  const [memoryState, setMemoryState] = useState<MemoryAudioState>(() =>
    memoryAudioController.getState()
  );

  // Persistent 21st Celebration Audio State
  const [celebrationState, setCelebrationState] = useState<CelebrationAudioState>(() =>
    celebrationAudioController.getState()
  );

  // Subscribe to persistent Audio Controller updates
  useEffect(() => {
    return memoryAudioController.subscribe(setMemoryState);
  }, []);

  useEffect(() => {
    return celebrationAudioController.subscribe(setCelebrationState);
  }, []);

  // Initialize Memory Audio Controller with memoryConfig if provided
  useEffect(() => {
    if (memoryConfig) {
      memoryAudioController.init(memoryConfig);
    }
  }, [memoryConfig]);

  // Attempt to play Tamil song on user's first explicit action ("Let's Begin!") before entering Memory tab
  useEffect(() => {
    if (autoStartRequested && !isTamilPlaying && !hasEnteredMemoryTab) {
      handleTamilPlay();
    }
  }, [autoStartRequested, hasEnteredMemoryTab]);

  // Coordinate with Memory BGM: Once user enters Memory tab, pause Tamil song permanently
  useEffect(() => {
    if (hasEnteredMemoryTab) {
      if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
      }
      if (isUsingSynth) {
        ambientChimes.stop();
      }
      setIsTamilPlaying(false);
    }
  }, [hasEnteredMemoryTab, isUsingSynth]);

  // Tamil Song Playback Handlers
  const handleTamilPlay = async () => {
    if (hasEnteredMemoryTab) return; // Memory BGM has taken over
    const audio = audioRef.current;
    if (audio && !hasFileError) {
      try {
        await audio.play();
        setIsTamilPlaying(true);
        setIsUsingSynth(false);
        return;
      } catch {
        if (config.enableSynthFallback) {
          ambientChimes.play();
          setIsTamilPlaying(true);
          setIsUsingSynth(true);
        }
      }
    } else if (config.enableSynthFallback) {
      ambientChimes.play();
      setIsTamilPlaying(true);
      setIsUsingSynth(true);
    }
  };

  const handleTamilPause = () => {
    const audio = audioRef.current;
    if (audio && !isUsingSynth) {
      audio.pause();
    }
    if (isUsingSynth) {
      ambientChimes.stop();
    }
    setIsTamilPlaying(false);
  };

  // Determine active track:
  // 1. In 'celebration' and 'final-reveal' stages: Celebration BGM (bd_looping.mp3)
  // 2. Once memory tab has been entered: Memory BGM (f_1_m.mp3 -> f_m_looping.mp3)
  // 3. Before memory tab: Tamil song
  const isCelebrationActive = currentStage === 'celebration' || currentStage === 'final-reveal';
  const isMemoryActive = Boolean(hasEnteredMemoryTab) && !isCelebrationActive;

  const isPlaying = isCelebrationActive
    ? celebrationState.isPlaying
    : isMemoryActive
    ? memoryState.isPlaying
    : isTamilPlaying;

  const isMuted = isCelebrationActive
    ? celebrationState.isMuted
    : isMemoryActive
    ? memoryState.isMuted
    : isTamilMuted;

  const isBlocked = isCelebrationActive
    ? celebrationState.isAutoplayBlocked
    : isMemoryActive && memoryState.isAutoplayBlocked;

  // Unified Toggle Play / Pause
  const handleTogglePlay = () => {
    if (isCelebrationActive) {
      celebrationAudioController.togglePlayPause();
    } else if (isMemoryActive) {
      memoryAudioController.togglePlayPause();
    } else {
      if (isTamilPlaying) {
        handleTamilPause();
      } else {
        handleTamilPlay();
      }
    }
  };

  // Unified Toggle Mute
  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCelebrationActive) {
      celebrationAudioController.toggleMute();
    } else if (isMemoryActive) {
      memoryAudioController.toggleMute();
    } else {
      const nextMuted = !isTamilMuted;
      setIsTamilMuted(nextMuted);
      if (audioRef.current) {
        audioRef.current.muted = nextMuted;
      }
      ambientChimes.setVolume(nextMuted ? 0 : 0.3);
    }
  };

  const handleAudioError = () => {
    setHasFileError(true);
    if (isTamilPlaying && config.enableSynthFallback && !hasEnteredMemoryTab) {
      setIsUsingSynth(true);
      ambientChimes.play();
    }
  };

  // UI labels & titles
  const displayLabel = isCelebrationActive
    ? isBlocked
      ? 'Tap to play celebration music 🎵'
      : isPlaying
      ? isExpanded
        ? 'Pause Celebration'
        : 'Celebration Soundtrack 🎵'
      : 'Celebration Soundtrack Paused'
    : isMemoryActive
    ? isBlocked
      ? 'Tap to play music 🎵'
      : isPlaying
      ? isExpanded
        ? 'Pause Music'
        : 'Memories Soundtrack 🎵'
      : 'Soundtrack Paused'
    : config.promptLabel;

  const displayTitle = isCelebrationActive
    ? '21st Birthday Celebration Loop'
    : isMemoryActive
    ? memoryConfig?.title || 'Memories Background Melody'
    : isUsingSynth
    ? '✨ Dreamy Birthday Chimes (Add Tamil Song to /audio)'
    : config.title;

  return (
    <div
      className="audio-widget-container"
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      role="region"
      aria-label="Birthday Soundtrack Controls"
    >
      {/* Hidden Tamil Audio element (active only before memory tab) */}
      {!hasEnteredMemoryTab && (
        <audio
          ref={audioRef}
          src={config.src}
          preload="auto"
          loop
          onError={handleAudioError}
          onEnded={() => setIsTamilPlaying(false)}
        />
      )}

      <div
        className={`audio-pill glass-panel ${isPlaying ? 'is-active' : ''} ${
          isBlocked ? 'is-blocked-prompt pulse-subtle' : ''
        }`}
      >
        {/* Animated Spinning Vinyl / Melody Icon */}
        <button
          onClick={handleTogglePlay}
          className="audio-icon-btn"
          aria-label={
            isBlocked
              ? 'Click to start memory soundtrack'
              : isPlaying
              ? 'Pause music'
              : 'Play music'
          }
          title={
            isBlocked
              ? 'Click to start memory soundtrack'
              : isPlaying
              ? 'Pause music'
              : 'Play music'
          }
        >
          {isPlaying ? (
            <Disc className="spin-icon text-gold" size={20} />
          ) : (
            <Music className="text-muted" size={20} />
          )}
        </button>

        {/* Audio Equalizer Bars when playing */}
        {isPlaying && (
          <div className="equalizer-bars" aria-hidden="true">
            <span className="eq-bar bar-1"></span>
            <span className="eq-bar bar-2"></span>
            <span className="eq-bar bar-3"></span>
            <span className="eq-bar bar-4"></span>
          </div>
        )}

        {/* Label Text & Title */}
        <div
          className={`audio-details ${isExpanded ? 'expanded' : ''}`}
          onClick={handleTogglePlay}
          style={{ cursor: 'pointer' }}
        >
          <span className={`audio-label ${isBlocked ? 'text-blocked' : ''}`}>
            {displayLabel}
          </span>
          <span className="audio-title">{displayTitle}</span>
        </div>

        {/* Mute/Unmute Toggle */}
        <button
          onClick={handleToggleMute}
          className="audio-mute-btn"
          aria-label={isMuted ? 'Unmute' : 'Mute'}
          title={isMuted ? 'Unmute sound' : 'Mute sound'}
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
      </div>

      <style>{`
        .audio-widget-container {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 100;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .audio-pill {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 16px;
          border-radius: 9999px;
          background: rgba(28, 10, 26, 0.85);
          border: 1px solid var(--color-border);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          max-width: 90vw;
          user-select: none;
          transition: all 0.3s ease;
        }

        .audio-pill.is-active {
          border-color: var(--color-primary);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6), 0 0 20px rgba(239, 195, 202, 0.35);
        }

        .audio-pill.is-blocked-prompt {
          border-color: var(--color-primary);
          background: rgba(48, 16, 32, 0.95);
          box-shadow: 0 8px 25px rgba(239, 195, 202, 0.35);
          animation: pulseBorder 2s ease-in-out infinite;
        }

        @keyframes pulseBorder {
          0%, 100% {
            border-color: var(--color-primary);
            box-shadow: 0 0 15px rgba(239, 195, 202, 0.3);
          }
          50% {
            border-color: var(--color-secondary-peach, #FAA943);
            box-shadow: 0 0 25px rgba(250, 169, 67, 0.5);
          }
        }

        .text-blocked {
          color: var(--color-secondary-peach, #FAA943) !important;
          font-weight: 700 !important;
        }

        .audio-icon-btn, .audio-mute-btn {
          background: transparent;
          border: none;
          color: var(--color-text-light);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
          border-radius: 50%;
          transition: transform 0.2s ease, color 0.2s ease;
        }

        .audio-icon-btn:hover, .audio-mute-btn:hover {
          transform: scale(1.15);
          color: var(--color-primary);
        }

        .spin-icon {
          animation: spinRecord 6s linear infinite;
        }

        @keyframes spinRecord {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .equalizer-bars {
          display: flex;
          align-items: flex-end;
          gap: 3px;
          height: 16px;
          padding: 0 2px;
        }

        .eq-bar {
          width: 3px;
          background: linear-gradient(to top, var(--color-border), var(--color-primary));
          border-radius: 2px;
          animation: bounceEq 1s ease-in-out infinite alternate;
        }

        .bar-1 { height: 60%; animation-delay: 0.1s; }
        .bar-2 { height: 95%; animation-delay: 0.3s; }
        .bar-3 { height: 40%; animation-delay: 0.2s; }
        .bar-4 { height: 80%; animation-delay: 0.4s; }

        @keyframes bounceEq {
          0% { height: 20%; }
          100% { height: 100%; }
        }

        .audio-details {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
          max-width: 240px;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .audio-label {
          font-size: 0.72rem;
          color: var(--color-primary);
          font-weight: 600;
          letter-spacing: 0.02em;
          white-space: nowrap;
        }

        .audio-title {
          font-size: 0.78rem;
          color: rgba(255, 245, 248, 0.9);
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
          max-width: 100%;
        }

        @media (max-width: 640px) {
          .audio-widget-container {
            top: 14px;
            right: 14px;
          }
          .audio-details {
            max-width: 140px;
          }
          .audio-title {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};
