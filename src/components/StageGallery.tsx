import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { ArrowLeft, ArrowRight, Heart, Gift, RotateCcw, Volume2 } from 'lucide-react';
import type { BirthdayConfig } from '../types';
import { triggerGentleSparks } from '../utils/confetti';
import { memoryAudioController } from '../utils/memoryAudioController';

interface StageGalleryProps {
  config: BirthdayConfig;
  onProceed: () => void;
}

export const StageGallery: React.FC<StageGalleryProps> = ({ config, onProceed }) => {
  const photos = config.photos;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const transitionTimerRef = useRef<number | null>(null);
  const lastNavTimeRef = useRef<number>(0);
  const [isInitialApproach, setIsInitialApproach] = useState(true);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  // Video & Audio Lifecycle State
  const [videoPhase, setVideoPhase] = useState<'opening' | 'looping'>('opening');
  const [isPhotosRevealed, setIsPhotosRevealed] = useState<boolean>(false);
  const [showEnableSoundPrompt, setShowEnableSoundPrompt] = useState<boolean>(false);

  const openingVideoRef = useRef<HTMLVideoElement | null>(null);
  const loopingVideoRef = useRef<HTMLVideoElement | null>(null);
  const hasTriggeredBgmRef = useRef<boolean>(false);
  const hasRevealedPhotosRef = useRef<boolean>(false);
  const hasSwitchedToLoopRef = useRef<boolean>(false);
  const fadeAnimRef = useRef<number | null>(null);

  const [viewportSize, setViewportSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  });

  const isMobile = viewportSize.width < 768;
  const isShortScreen = viewportSize.height < 740;
  const photoWidth = isMobile ? 240 : 275;
  const photoHeight = isMobile ? 305 : 345;
  const photoSpacing = isMobile ? 315 : 380;
  const startX = 240;

  // Preload all memory photographs into browser cache
  useEffect(() => {
    photos.forEach((photo) => {
      const img = new Image();
      img.src = photo.url;
    });
  }, [photos]);

  // Track window resize
  useEffect(() => {
    let timeoutId: number;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        setViewportSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }, 100);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  /**
   * =========================================================================
   * CINEMATIC TRAIN VIDEO & AUDIO LIFECYCLE MANAGEMENT
   * =========================================================================
   * 0–10s: Play Begining.mp4 / Begining.mkv with original audio.
   * At 10s: Begin fading in memories_bgm.mp3; fade down opening train audio.
   * Around 10–12s: Smooth crossfade to Looping.mp4 / Looping.mkv background.
   * At 12s: Staggered reveal of memory photos, fairy lights, and HUD.
   * =========================================================================
   */
  const fadeOpeningVideoAudio = useCallback((video: HTMLVideoElement, durationMs: number) => {
    const startVol = video.volume;
    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / durationMs);
      video.volume = Math.max(0, startVol * (1 - progress));

      if (progress < 1) {
        fadeAnimRef.current = requestAnimationFrame(step);
      } else {
        video.volume = 0;
        fadeAnimRef.current = null;
      }
    };

    fadeAnimRef.current = requestAnimationFrame(step);
  }, []);

  // Timeupdate handler tracking exact playback timestamp
  const handleOpeningTimeUpdate = useCallback(() => {
    const video = openingVideoRef.current;
    if (!video) return;
    const time = video.currentTime;

    // 1. At 12 seconds: Begin playing f_1_m.mp3 and gently fade opening train audio
    if (time >= 12.0 && !hasTriggeredBgmRef.current) {
      hasTriggeredBgmRef.current = true;
      memoryAudioController.startMemoriesAudioSequence();
      fadeOpeningVideoAudio(video, 2000);
    }

    // 2. Around 11.5-12s: Begin crossfading to looping video
    if (time >= 11.5 && !hasSwitchedToLoopRef.current) {
      hasSwitchedToLoopRef.current = true;
      setVideoPhase('looping');
      loopingVideoRef.current?.play().catch(() => {});
    }

    // 3. At 12 seconds: Reveal memory photos and HUD
    if (time >= 12.0 && !hasRevealedPhotosRef.current) {
      hasRevealedPhotosRef.current = true;
      setIsPhotosRevealed(true);
    }
  }, [fadeOpeningVideoAudio]);

  const handleOpeningEnded = useCallback(() => {
    if (!hasTriggeredBgmRef.current) {
      hasTriggeredBgmRef.current = true;
      memoryAudioController.startMemoriesAudioSequence();
    }
    if (!hasRevealedPhotosRef.current) {
      hasRevealedPhotosRef.current = true;
      setIsPhotosRevealed(true);
    }
    if (!hasSwitchedToLoopRef.current) {
      hasSwitchedToLoopRef.current = true;
      setVideoPhase('looping');
      loopingVideoRef.current?.play().catch(() => {});
    }
  }, []);

  const handleOpeningError = useCallback(() => {
    console.warn('Opening video encountered playback issue, activating graceful fallback');
    if (!hasTriggeredBgmRef.current) {
      hasTriggeredBgmRef.current = true;
      memoryAudioController.startMemoryBgm();
    }
    hasRevealedPhotosRef.current = true;
    setIsPhotosRevealed(true);
    hasSwitchedToLoopRef.current = true;
    setVideoPhase('looping');
    loopingVideoRef.current?.play().catch(() => {});
  }, []);

  // Initialize playback on mount
  useEffect(() => {
    const video = openingVideoRef.current;
    if (!video) return;

    video.currentTime = 0;
    video.volume = 1.0;
    video.muted = false;

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn('Autoplay with sound restricted by browser; starting muted:', err);
        video.muted = true;
        video.play().catch((playErr) => console.error('Video playback failed:', playErr));
        setShowEnableSoundPrompt(true);
      });
    }

    // Preload looping video
    if (loopingVideoRef.current) {
      loopingVideoRef.current.load();
    }

    // Safety fallback timer ensuring user reaches memories within 12.5s even if media freezes
    const fallbackTimer = setTimeout(() => {
      if (!hasTriggeredBgmRef.current) {
        hasTriggeredBgmRef.current = true;
        memoryAudioController.startMemoryBgm();
      }
      if (!hasRevealedPhotosRef.current) {
        hasRevealedPhotosRef.current = true;
        setIsPhotosRevealed(true);
      }
      if (!hasSwitchedToLoopRef.current) {
        hasSwitchedToLoopRef.current = true;
        setVideoPhase('looping');
        loopingVideoRef.current?.play().catch(() => {});
      }
    }, 12500);

    return () => {
      clearTimeout(fallbackTimer);
      if (fadeAnimRef.current !== null) {
        cancelAnimationFrame(fadeAnimRef.current);
      }
    };
  }, []);

  const handleEnableSound = () => {
    const video = openingVideoRef.current;
    if (video) {
      video.muted = false;
      video.volume = 1.0;
    }
    if (hasTriggeredBgmRef.current) {
      memoryAudioController.startMemoryBgm({ force: true });
    }
    setShowEnableSoundPrompt(false);
  };

  /**
   * =========================================================================
   * 3-STRING FAIRY LIGHT WALL ARRANGEMENT (12 PHOTOS: 4 + 4 + 4)
   * =========================================================================
   * String 1 (Top Tier): 4 photos (index 0, 1, 2, 3 -> Photos 1, 2, 3, 4)
   * String 2 (Middle Tier): 4 photos (index 4, 5, 6, 7 -> Photos 5, 6, 7, 8)
   * String 3 (Bottom Tier): 4 photos (index 8, 9, 10, 11 -> Photos 9, 10, 11, 12)
   * =========================================================================
   */
  const photoPositions = useMemo(() => {
    const baseOffsetY = isShortScreen ? 145 : 170;
    return photos.map((_, i) => {
      const x = startX + i * photoSpacing;
      let y = baseOffsetY;
      let stringTier: 1 | 2 | 3 = 1;

      if (i < 4) {
        // String 1 (Top Tier)
        y = baseOffsetY - 5 + Math.sin(i * 1.05) * 14;
        stringTier = 1;
      } else if (i < 8) {
        // String 2 (Middle Tier)
        y = baseOffsetY + 38 + Math.sin((i - 4) * 1.05) * 14;
        stringTier = 2;
      } else {
        // String 3 (Bottom Tier)
        y = baseOffsetY + 22 + Math.sin((i - 8) * 1.05) * 14;
        stringTier = 3;
      }

      return { x, y, stringTier };
    });
  }, [photos, photoSpacing, startX, isShortScreen]);

  const totalWallWidth = startX + photos.length * photoSpacing + 400;

  // SVG Path for String 1 (Top String - Clamps Photos 1-4)
  const tier1WirePath = useMemo(() => {
    if (photoPositions.length === 0) return '';
    let d = `M 0,145`;

    for (let i = 0; i < Math.min(4, photoPositions.length); i++) {
      const p = photoPositions[i];
      const attachX = p.x + photoWidth / 2;
      const attachY = p.y;

      if (i === 0) {
        d += ` Q ${attachX * 0.45},${attachY + 22} ${attachX},${attachY}`;
      } else {
        const prev = photoPositions[i - 1];
        const prevX = prev.x + photoWidth / 2;
        const midX = (prevX + attachX) / 2;
        const midY = Math.max(prev.y, attachY) + 24;
        d += ` Q ${midX},${midY} ${attachX},${attachY}`;
      }
    }

    const p3 = photoPositions[Math.min(3, photoPositions.length - 1)];
    const p3X = p3.x + photoWidth / 2;
    const midWallX = (p3X + totalWallWidth) / 2;
    d += ` Q ${midWallX},135 ${totalWallWidth},120`;
    return d;
  }, [photoPositions, photoWidth, totalWallWidth]);

  // SVG Path for String 2 (Middle String - Clamps Photos 5-8)
  const tier2WirePath = useMemo(() => {
    if (photoPositions.length === 0) return '';
    const p4 = photoPositions[4] ?? photoPositions[0];
    const p4X = p4.x + photoWidth / 2;
    let d = `M 0,195 Q ${p4X * 0.5},215 ${p4X},${p4.y}`;

    for (let i = 4; i < Math.min(8, photoPositions.length); i++) {
      const p = photoPositions[i];
      const attachX = p.x + photoWidth / 2;
      const attachY = p.y;

      if (i > 4) {
        const prev = photoPositions[i - 1];
        const prevX = prev.x + photoWidth / 2;
        const midX = (prevX + attachX) / 2;
        const midY = Math.max(prev.y, attachY) + 26;
        d += ` Q ${midX},${midY} ${attachX},${attachY}`;
      }
    }

    const p7 = photoPositions[Math.min(7, photoPositions.length - 1)];
    const p7X = p7.x + photoWidth / 2;
    const midEnd = (p7X + totalWallWidth) / 2;
    d += ` Q ${midEnd},190 ${totalWallWidth},175`;
    return d;
  }, [photoPositions, photoWidth, totalWallWidth]);

  // SVG Path for String 3 (Bottom String - Clamps Photos 9-12)
  const tier3WirePath = useMemo(() => {
    if (photoPositions.length === 0) return '';
    const p8 = photoPositions[8] ?? photoPositions[0];
    const p8X = p8.x + photoWidth / 2;
    let d = `M 0,225 Q ${p8X * 0.45},240 ${p8X},${p8.y}`;

    for (let i = 8; i < photoPositions.length; i++) {
      const p = photoPositions[i];
      const attachX = p.x + photoWidth / 2;
      const attachY = p.y;

      if (i > 8) {
        const prev = photoPositions[i - 1];
        const prevX = prev.x + photoWidth / 2;
        const midX = (prevX + attachX) / 2;
        const midY = Math.max(prev.y, attachY) + 28;
        d += ` Q ${midX},${midY} ${attachX},${attachY}`;
      }
    }

    const lastP = photoPositions[photoPositions.length - 1];
    const lastX = lastP.x + photoWidth / 2;
    const midEnd = (lastX + totalWallWidth) / 2;
    d += ` Q ${midEnd},220 ${totalWallWidth},205`;
    return d;
  }, [photoPositions, photoWidth, totalWallWidth]);

  // Warm Glowing Fairy Light Bulbs
  const fairyBulbs = useMemo(() => {
    const bulbs: { x: number; y: number; phaseClass: string }[] = [];
    const bulbInterval = 55;
    const bulbCount = Math.floor(totalWallWidth / bulbInterval);

    for (let i = 0; i < bulbCount; i++) {
      const bx = i * bulbInterval + 25;
      let by = 150 + Math.sin(i * 0.42) * 16;
      if (i % 3 === 1) by += 45;
      if (i % 3 === 2) by += 30;

      const phaseIdx = (i % 4) + 1;
      bulbs.push({
        x: bx,
        y: by,
        phaseClass: `glow-phase-${phaseIdx}`,
      });
    }
    return bulbs;
  }, [totalWallWidth]);

  // Virtual Camera positioning
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialApproach(false);
    }, 250);
    return () => clearTimeout(timer);
  }, []);

  const baseZoom = isMobile ? (viewportSize.width < 420 ? 1.02 : 1.08) : (isShortScreen ? 1.08 : 1.15);
  const cameraZoom = isInitialApproach ? baseZoom * 0.8 : baseZoom;

  const activePos = photoPositions[currentIndex] ?? { x: 200, y: 200 };
  const targetCenterX = activePos.x + photoWidth / 2;
  const targetCenterY = activePos.y + photoHeight / 2;

  const cameraX = viewportSize.width / 2 - targetCenterX * cameraZoom;
  const cameraY = viewportSize.height / 2 - targetCenterY * cameraZoom;

  const TRANSITION_MS = 850;

  // Cleanup transition timer on unmount
  useEffect(() => {
    return () => {
      if (transitionTimerRef.current) {
        clearTimeout(transitionTimerRef.current);
      }
    };
  }, []);

  // Unified buttery-smooth cinematic navigation handler
  const navigateToPhoto = useCallback(
    (targetIdx: number) => {
      const now = performance.now();
      // Smooth 200ms debounce to prevent runaway jitter from rapid clicks
      if (now - lastNavTimeRef.current < 200) return;
      lastNavTimeRef.current = now;

      if (targetIdx === currentIndex || targetIdx < 0 || targetIdx >= photos.length) return;

      if (transitionTimerRef.current) {
        clearTimeout(transitionTimerRef.current);
      }

      setCurrentIndex(targetIdx);
      setIsTransitioning(true);

      if (targetIdx === photos.length - 1) {
        triggerGentleSparks();
      }

      // Preload neighboring image into browser cache
      if (photos[targetIdx + 1]) {
        const img = new Image();
        img.src = photos[targetIdx + 1].url;
      }

      transitionTimerRef.current = window.setTimeout(() => {
        setIsTransitioning(false);
      }, TRANSITION_MS);
    },
    [currentIndex, photos]
  );

  // Navigation handlers
  const handleNext = useCallback(() => {
    if (currentIndex >= photos.length - 1) {
      onProceed();
      return;
    }
    navigateToPhoto(currentIndex + 1);
  }, [currentIndex, photos.length, onProceed, navigateToPhoto]);

  const handlePrev = useCallback(() => {
    if (currentIndex <= 0) return;
    navigateToPhoto(currentIndex - 1);
  }, [currentIndex, navigateToPhoto]);

  const jumpToPhoto = useCallback(
    (index: number) => {
      navigateToPhoto(index);
    },
    [navigateToPhoto]
  );

  // Keyboard Navigation: RIGHT ARROW & LEFT ARROW
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (targetTag === 'input' || targetTag === 'textarea') return;

      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev]);

  // Mobile Touch Gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const diff = touchStartX - e.changedTouches[0].clientX;

    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    setTouchStartX(null);
  };

  const activePhoto = photos[currentIndex];
  const isSpecialFinal = currentIndex === photos.length - 1;

  const handleProceedToSecretGift = async () => {
    try {
      // Automatically resume existing Memories background audio if paused or interrupted
      await memoryAudioController.resume();
    } catch (err) {
      console.warn('Audio resume failed on secret gift click:', err);
    }
    onProceed();
  };

  const handleUserInteract = () => {
    if (showEnableSoundPrompt) {
      handleEnableSound();
    } else if (memoryAudioController.getState().isAutoplayBlocked) {
      memoryAudioController.startMemoryBgm({ force: true });
    }
  };

  return (
    <div
      className="stage-container cinematic-camera-stage"
      onClick={handleUserInteract}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* =========================================================================
          1. FULL-SCREEN CINEMATIC TRAIN JOURNEY BACKGROUND VIDEO
         ========================================================================= */}
      <div className="train-video-bg-viewport" aria-hidden="true">
        {/* Opening Train Journey Video (Plays with original audio 0-10s, fades at 10-12s) */}
        <video
          ref={openingVideoRef}
          className={`train-fullscreen-video opening-video-track ${
            videoPhase === 'looping' ? 'video-fade-out' : 'video-visible'
          }`}
          playsInline
          preload="auto"
          onTimeUpdate={handleOpeningTimeUpdate}
          onEnded={handleOpeningEnded}
          onError={handleOpeningError}
        >
          <source src="/videos/Begining.mp4" type="video/mp4" />
          <source src="/videos/Begining.mkv" type="video/x-matroska" />
          <source src="/memoreies_bg_videos/Begining.mkv" type="video/x-matroska" />
        </video>

        {/* Continuous Looping Train Video (preloaded, loops seamlessly) */}
        <video
          ref={loopingVideoRef}
          className={`train-fullscreen-video looping-video-track ${
            videoPhase === 'looping' ? 'video-visible' : 'video-hidden'
          }`}
          loop
          muted
          playsInline
          preload="auto"
        >
          <source src="/videos/Looping.mp4" type="video/mp4" />
          <source src="/videos/looping.mp4" type="video/mp4" />
          <source src="/videos/Looping.mkv" type="video/x-matroska" />
          <source src="/videos/looping.mkv" type="video/x-matroska" />
          <source src="/memoreies_bg_videos/Looping.mkv" type="video/x-matroska" />
        </video>

        {/* Cinematic Scrim & Gradient Overlay for Contrast */}
        <div className={`train-video-scrim-layer ${isPhotosRevealed ? 'scrim-photos-active' : 'scrim-opening-subtle'}`} />
      </div>

      {/* Floating "Enable Sound" Pill if Autoplay was restricted */}
      {showEnableSoundPrompt && (
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

      {/* =========================================================================
          2. TOP HUD: Revealed gracefully at 12 seconds with photos
         ========================================================================= */}
      <header className={`memory-top-hud ${isPhotosRevealed ? 'hud-revealed' : 'hud-hidden'}`} aria-label="Memory Gallery Header">
        {/* Top Title Pill */}
        <div className="memory-badge-pill">
          <span>Cinematic Train Journey · Memory Wall</span>
          <Heart size={13} className="text-rose fill-rose" />
        </div>

        {/* Dedicated Central Info Card */}
        <div className="memory-info-card">
          <div className="memory-counter-row">
            <span className="counter-badge">
              MEMORY {String(currentIndex + 1).padStart(2, '0')} / {String(photos.length).padStart(2, '0')}
            </span>

            {activePhoto?.tag && (
              <span className="memory-tag-badge">
                {activePhoto.tag}
              </span>
            )}

            <span className="memory-instruction-hint desktop-only">
              Use ← → to travel
            </span>
          </div>

          {activePhoto && (
            <div key={activePhoto.id} className="memory-caption-box">
              <p className="memory-caption-title">"{activePhoto.caption}"</p>
              {activePhoto.shortNote && (
                <span className="memory-caption-subnote">{activePhoto.shortNote}</span>
              )}
            </div>
          )}
        </div>
      </header>

      {/* =========================================================================
          3. UNIFIED WORLD SCENE: Hanging Wires & Polaroids (Revealed at 12 seconds)
         ========================================================================= */}
      <div className={`camera-viewport-frame ${isPhotosRevealed ? 'photos-revealed' : 'photos-waiting'} ${isTransitioning ? 'is-camera-gliding' : ''}`}>
        {/* The World Scene (Fairy Wires & Polaroids) */}
        <div
          className="camera-world-scene"
          style={{
            transform: `translate3d(${cameraX}px, ${cameraY}px, 0) scale(${cameraZoom})`,
            transformOrigin: '0 0',
            transition: isInitialApproach
              ? 'transform 1.4s cubic-bezier(0.16, 1, 0.3, 1)'
              : `transform ${TRANSITION_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`,
            width: `${totalWallWidth}px`,
            height: '680px',
          }}
        >
          {/* Continuous Sagging Fairy Light Wires (3 Strings: Top, Mid, Bottom) */}
          <svg
            className="fairy-wires-canvas"
            width={totalWallWidth}
            height="500"
            style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: 10 }}
          >
            {/* SVG Geometry Shadows */}
            <path d={tier1WirePath} stroke="rgba(0,0,0,0.4)" strokeWidth="3.2" fill="none" transform="translate(0, 2)" />
            <path d={tier2WirePath} stroke="rgba(0,0,0,0.4)" strokeWidth="3.2" fill="none" transform="translate(0, 2)" />
            <path d={tier3WirePath} stroke="rgba(0,0,0,0.4)" strokeWidth="3.2" fill="none" transform="translate(0, 2)" />

            {/* String 1: Top Tier Wire (Connects Photos 1-4) */}
            <path d={tier1WirePath} stroke="#583e24" strokeWidth="2.4" fill="none" opacity="0.95" />
            {/* String 2: Middle Tier Wire (Connects Photos 5-8) */}
            <path d={tier2WirePath} stroke="#4e351d" strokeWidth="2.4" fill="none" opacity="0.95" />
            {/* String 3: Bottom Tier Wire (Connects Photos 9-12) */}
            <path d={tier3WirePath} stroke="#432c18" strokeWidth="2.4" fill="none" opacity="0.95" />
          </svg>

          {/* Warm Glowing Yellow LED Bulbs Along All 3 Strings */}
          <div className="fairy-bulbs-layer">
            {fairyBulbs.map((bulb, idx) => (
              <div
                key={idx}
                className="realistic-fairy-bulb"
                style={{
                  left: `${bulb.x}px`,
                  top: `${bulb.y}px`,
                }}
              >
                <span className="bulb-socket" />
                <span className={`bulb-glass ${bulb.phaseClass}`} />
                <span className="bulb-golden-glow" />
              </div>
            ))}
          </div>

          {/* Array of Hanging Polaroid Cards Clamped to the Wires */}
          <div className="polaroids-wall-layer">
            {photos.map((photo, idx) => {
              const pos = photoPositions[idx] ?? { x: 0, y: 0, stringTier: 1 };
              const distFromCurrent = Math.abs(idx - currentIndex);
              const isCardActive = isPhotosRevealed && distFromCurrent === 0;
              const isCardNeighbor = isPhotosRevealed && distFromCurrent === 1;
              const naturalRot = photo.rotation ?? ((idx % 4) - 1.5) * 1.8;

              const focusClass = isCardActive
                ? 'card-focus-active is-active-spotlight'
                : isCardNeighbor
                ? 'card-focus-neighbor'
                : 'card-focus-distant is-unfocused-ambient';

              const cardInnerFocusClass = isCardActive
                ? 'card-active-focus'
                : isCardNeighbor
                ? 'card-neighbor-focus'
                : 'card-distant-focus';

              const zIndex = isCardActive ? 50 : isCardNeighbor ? 30 : 20;

              return (
                <div
                  key={photo.id}
                  className={`hanging-polaroid-unit ${focusClass}`}
                  style={{
                    left: `${pos.x}px`,
                    top: `${pos.y}px`,
                    width: `${photoWidth}px`,
                    zIndex,
                    animationDelay: isPhotosRevealed ? `${(idx % 6) * 0.08}s` : '0s',
                  }}
                  onClick={() => jumpToPhoto(idx)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Photo ${idx + 1}: ${photo.caption}. Click to center camera.`}
                >
                  {/* Miniature Wooden Clothespin Gripping Designated Wire */}
                  <div
                    className={`realistic-clothespin ${
                      isCardActive ? 'clip-illuminated' : ''
                    }`}
                  >
                    <span className="clothespin-wood-head" />
                    <span className="clothespin-metal-spring" />
                    <span className="clothespin-clip-leg" />
                  </div>

                  {/* Tactile Polaroid Card with Natural Shadow & Rotation (Scales as a complete unit) */}
                  <div
                    className={`tactile-polaroid-card ${cardInnerFocusClass}`}
                    style={{
                      transform: `rotate(${naturalRot}deg)`,
                    }}
                  >
                    {/* The Glossy Photo Window with Realistic Aspect Ratio */}
                    <div className="polaroid-photo-frame">
                      <img
                        src={photo.url}
                        alt={photo.caption}
                        className="polaroid-image-render"
                        style={{
                          objectPosition: photo.focalPosition ?? 'center 20%',
                        }}
                        loading="eager"
                        decoding="async"
                      />
                      <div className="polaroid-gloss-sheen" />
                      {photo.tag && <span className="polaroid-corner-tag">{photo.tag}</span>}
                    </div>

                    {/* Bottom White Border with Handwritten Caption */}
                    <div className="polaroid-caption-margin">
                      <p className={`handwritten-caption-text ${isCardActive ? 'active-ink' : ''}`}>
                        {photo.caption}
                      </p>
                      {photo.dateOrLocation && (
                        <span className="handwritten-date-sub">{photo.dateOrLocation} ♡</span>
                      )}
                    </div>
                  </div>

                  {/* Warm Golden Spotlight Pool Behind Active Card */}
                  <div
                    className={`active-golden-light-pool ${
                      isCardActive ? 'pool-active' : 'pool-hidden'
                    }`}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Special Birthday Finale Banner (Floating gracefully above controls when last photo is focused) */}
      {isSpecialFinal && isPhotosRevealed && (
        <aside className="special-camera-banner" aria-label="Special Birthday Message">
          <span className="special-banner-quote">
            "Here's to more beautiful memories. Happy 21st Birthday! ✨"
          </span>
          <Heart size={15} className="text-rose fill-rose" />
        </aside>
      )}

      {/* =========================================================================
          4. BOTTOM NAVIGATION AREA: Revealed at 12 seconds
         ========================================================================= */}
      <footer className={`memory-bottom-hud ${isPhotosRevealed ? 'hud-revealed' : 'hud-hidden'}`} aria-label="Photo Gallery Controls">
        {/* Previous Photo Button */}
        <button
          onClick={handlePrev}
          disabled={currentIndex <= 0}
          className="btn-memory-nav btn-prev"
          aria-label="Previous photo"
          title="Previous Photo (Left Arrow)"
        >
          <ArrowLeft size={17} />
          <span className="btn-label">Previous Photo</span>
        </button>

        {/* Dedicated In-Line Progress Track */}
        <div className="memory-progress-track" role="tablist" aria-label="Photo navigation dots">
          {photos.map((p, idx) => {
            const isActive = idx === currentIndex;
            const isPast = idx < currentIndex;
            return (
              <button
                key={p.id}
                onClick={() => jumpToPhoto(idx)}
                className={`memory-dot-btn ${isActive ? 'is-active' : ''} ${isPast ? 'is-past' : ''}`}
                aria-label={`Jump to photo ${idx + 1}`}
                title={`Photo ${idx + 1}: ${p.caption}`}
              >
                <span className="dot-visual" />
                <span className="dot-tooltip">Memory {String(idx + 1).padStart(2, '0')}</span>
              </button>
            );
          })}
        </div>

        {/* Next Photo OR Proceed to Secret Gift Button */}
        {!isSpecialFinal ? (
          <button
            onClick={handleNext}
            className="btn-memory-nav btn-next primary-spotlight"
            aria-label="Next photo"
            title="Next Photo (Right Arrow)"
          >
            <span className="btn-label">Next Photo</span>
            <ArrowRight size={17} />
          </button>
        ) : (
          <button
            onClick={handleProceedToSecretGift}
            className="btn-memory-nav btn-proceed-gift primary-spotlight"
            aria-label="Open the Secret Gift Box and proceed"
            title="Open the Secret Gift Box"
          >
            <Gift size={18} />
            <span className="btn-label">Open Secret Gift 💝</span>
          </button>
        )}

        {/* Start Over Button (Aligned in-line to the right) */}
        {currentIndex > 0 ? (
          <button
            onClick={() => jumpToPhoto(0)}
            className="btn-memory-reset"
            aria-label="Return to start of photo wall"
            title="Return to start of photo wall"
          >
            <RotateCcw size={15} />
            <span className="btn-label desktop-only">Start Over</span>
          </button>
        ) : (
          <div className="btn-reset-placeholder desktop-only" />
        )}
      </footer>

      <style>{`
        .cinematic-camera-stage {
          position: relative;
          width: 100vw;
          height: 100vh;
          min-height: 100vh;
          overflow: hidden;
          background: #060205;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px 20px;
          user-select: none;
        }

        /* =========================================================================
           1. FULL-SCREEN BACKGROUND VIDEO LAYER
           ========================================================================= */
        .train-video-bg-viewport {
          position: fixed;
          inset: 0;
          width: 100vw;
          height: 100vh;
          z-index: 0;
          pointer-events: none;
          overflow: hidden;
          background: #060205;
        }

        .train-fullscreen-video {
          position: absolute;
          inset: 0;
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

        /* Enable Sound Pill */
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
          animation: pulseSoundPill 2s infinite ease-in-out;
        }

        .train-enable-sound-pill:hover {
          transform: translateY(-2px) scale(1.04);
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.7), 0 0 25px rgba(239, 195, 202, 0.55);
        }

        @keyframes pulseSoundPill {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.04); }
        }

        /* =========================================================================
           HUD VISIBILITY & REVEAL
           ========================================================================= */
        .hud-hidden {
          opacity: 0;
          pointer-events: none;
          transform: translateY(-16px);
          transition: opacity 0.8s ease, transform 0.8s ease;
        }

        .hud-revealed {
          opacity: 1;
          pointer-events: auto;
          transform: translateY(0);
          transition: opacity 1s cubic-bezier(0.16, 1, 0.3, 1), transform 1s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .memory-top-hud {
          position: relative;
          z-index: 50;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          width: 100%;
          max-width: 820px;
          margin: 0 auto;
          pointer-events: auto;
        }

        .memory-badge-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 5px 16px;
          border-radius: 9999px;
          background: rgba(30, 10, 26, 0.85);
          border: 1px solid var(--color-border);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.45);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          font-size: 0.76rem;
          color: var(--color-primary);
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .memory-info-card {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 10px 24px;
          border-radius: 20px;
          background: rgba(28, 10, 26, 0.85);
          border: 1px solid var(--color-border);
          box-shadow: 0 12px 36px rgba(0, 0, 0, 0.55), 0 0 20px rgba(239, 195, 202, 0.12);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
        }

        .memory-counter-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 4px;
        }

        .counter-badge {
          font-family: var(--font-sans);
          font-size: 0.74rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          color: var(--color-secondary-peach);
        }

        .memory-tag-badge {
          font-size: 0.7rem;
          font-weight: 600;
          padding: 2px 10px;
          border-radius: 9999px;
          background: rgba(239, 195, 202, 0.12);
          border: 1px solid var(--color-border-subtle);
          color: var(--color-primary);
        }

        .memory-instruction-hint {
          font-size: 0.72rem;
          color: var(--color-text-muted);
        }

        .memory-caption-box {
          text-align: center;
          animation: captionCrossfade 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        @keyframes captionCrossfade {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .memory-caption-title {
          font-family: var(--font-serif);
          font-size: clamp(1.05rem, 2.2vw, 1.25rem);
          font-weight: 600;
          letter-spacing: 0.01em;
          color: #FFF9F8;
          margin: 0;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
        }

        .memory-caption-subnote {
          font-size: 0.82rem;
          color: var(--color-secondary);
          font-style: italic;
        }

        /* =========================================================================
           WORLD SCENE & CAMERA VIEWPORT
           ========================================================================= */
        .camera-viewport-frame {
          position: absolute;
          inset: 0;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          z-index: 10;
        }

        .camera-world-scene {
          position: absolute;
          top: 0;
          left: 0;
          will-change: transform;
        }

        /* Reveal animations for wires, bulbs, and polaroids */
        .photos-waiting .fairy-wires-canvas,
        .photos-waiting .fairy-bulbs-layer,
        .photos-waiting .polaroids-wall-layer {
          opacity: 0;
          pointer-events: none;
        }

        .photos-revealed .fairy-wires-canvas {
          animation: fairyWiresFadeIn 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .photos-revealed .fairy-bulbs-layer {
          animation: fairyBulbsFadeIn 1.4s cubic-bezier(0.16, 1, 0.3, 1) 0.15s forwards;
        }

        .photos-revealed .hanging-polaroid-unit {
          animation: polaroidStaggerReveal 0.85s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        @keyframes fairyWiresFadeIn {
          from { opacity: 0; transform: translateY(-14px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes fairyBulbsFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes polaroidStaggerReveal {
          from {
            opacity: 0;
            transform: translateY(24px) scale(0.92);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        /* Fairy Bulbs */
        .fairy-bulbs-layer {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 15;
        }

        .realistic-fairy-bulb {
          position: absolute;
          width: 14px;
          height: 18px;
          transform: translate(-50%, -50%);
        }

        .bulb-socket {
          position: absolute;
          top: 0;
          left: 4px;
          width: 6px;
          height: 5px;
          background: #3e2612;
          border-radius: 2px 2px 0 0;
        }

        .bulb-glass {
          position: absolute;
          top: 4px;
          left: 2px;
          width: 10px;
          height: 13px;
          border-radius: 50% 50% 40% 40%;
          background: radial-gradient(circle at 40% 40%, #FFFDE8 0%, #FFE97D 50%, #FFB834 100%);
          box-shadow: 0 0 12px rgba(255, 215, 90, 0.8), 0 0 24px rgba(255, 170, 50, 0.4);
        }

        .glow-phase-1 { animation: bulbTwinkle 3.2s ease-in-out infinite 0s; }
        .glow-phase-2 { animation: bulbTwinkle 3.6s ease-in-out infinite 0.9s; }
        .glow-phase-3 { animation: bulbTwinkle 4.0s ease-in-out infinite 1.8s; }
        .glow-phase-4 { animation: bulbTwinkle 3.4s ease-in-out infinite 2.5s; }

        @keyframes bulbTwinkle {
          0%, 100% { opacity: 0.85; filter: brightness(1); }
          50% { opacity: 1; filter: brightness(1.35); }
        }

        /* Polaroids Wall Layer */
        .polaroids-wall-layer {
          position: absolute;
          inset: 0;
          z-index: 20;
        }

        .hanging-polaroid-unit {
          position: absolute;
          cursor: pointer;
          outline: none;
          display: flex;
          flex-direction: column;
          align-items: center;
          transform-origin: center center;
          transition: transform 800ms cubic-bezier(0.22, 1, 0.36, 1),
                      opacity 600ms ease,
                      filter 800ms ease;
          will-change: transform, opacity;
        }

        /* 1. Active Polaroid: Whole card enlarged (scale 1.10), elevated with rich shadow */
        .hanging-polaroid-unit.card-focus-active {
          transform: translateY(-8px) scale(1.10);
          opacity: 1;
          z-index: 50;
          filter: drop-shadow(0 28px 56px rgba(0, 0, 0, 0.95)) brightness(1.02);
        }

        /* 2. Previous and Next Neighbor Polaroids: scale(0.92), in background */
        .hanging-polaroid-unit.card-focus-neighbor {
          transform: translateY(0px) scale(0.92);
          opacity: 0.82;
          z-index: 30;
          filter: drop-shadow(0 14px 28px rgba(0, 0, 0, 0.58)) brightness(0.92);
        }

        .hanging-polaroid-unit.card-focus-neighbor:hover {
          opacity: 0.94;
          transform: translateY(-3px) scale(0.95);
          filter: drop-shadow(0 18px 34px rgba(0, 0, 0, 0.70)) brightness(0.98);
        }

        /* 3. Distant Inactive Polaroids: Visually in background, scale(0.87) */
        .hanging-polaroid-unit.card-focus-distant {
          transform: translateY(0px) scale(0.87);
          opacity: 0.68;
          z-index: 20;
          filter: drop-shadow(0 8px 18px rgba(0, 0, 0, 0.45)) brightness(0.85);
        }

        .hanging-polaroid-unit.card-focus-distant:hover {
          opacity: 0.88;
          transform: translateY(-3px) scale(0.90);
          filter: drop-shadow(0 12px 24px rgba(0, 0, 0, 0.60)) brightness(0.95);
        }

        /* Clothespin */
        .realistic-clothespin {
          position: relative;
          width: 14px;
          height: 32px;
          margin-bottom: -12px;
          z-index: 50;
          transition: filter 800ms cubic-bezier(0.22, 1, 0.36, 1);
        }

        .clip-illuminated .clothespin-wood-head,
        .clip-illuminated .clothespin-clip-leg {
          filter: drop-shadow(0 0 6px rgba(255, 220, 130, 0.80));
          transition: filter 800ms cubic-bezier(0.22, 1, 0.36, 1);
        }

        .clothespin-wood-head {
          position: absolute;
          top: 0;
          left: 3px;
          width: 8px;
          height: 14px;
          background: linear-gradient(90deg, #bfa076 0%, #8e6840 100%);
          border-radius: 2px 2px 0 0;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
        }

        .clothespin-metal-spring {
          position: absolute;
          top: 11px;
          left: 1px;
          width: 12px;
          height: 4px;
          background: #505050;
          border-radius: 2px;
        }

        .clothespin-clip-leg {
          position: absolute;
          top: 14px;
          left: 3px;
          width: 8px;
          height: 16px;
          background: linear-gradient(90deg, #bfa076 0%, #8e6840 100%);
          border-radius: 0 0 2px 2px;
        }

        /* Tactile Polaroid Card (The entire white frame, photo, and caption container) */
        .tactile-polaroid-card {
          width: 100%;
          background: #FFFFFF;
          padding: 12px 12px 16px 12px;
          border-radius: 4px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6), 0 1px 3px rgba(0, 0, 0, 0.2);
          display: flex;
          flex-direction: column;
          align-items: center;
          transform-origin: center center;
          transition: box-shadow 800ms cubic-bezier(0.22, 1, 0.36, 1);
        }

        .card-active-focus {
          box-shadow: 0 22px 50px rgba(0, 0, 0, 0.82), 0 0 28px rgba(255, 215, 120, 0.25), 0 2px 6px rgba(0, 0, 0, 0.3);
        }

        .card-neighbor-focus {
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.55), 0 1px 3px rgba(0, 0, 0, 0.2);
        }

        .card-distant-focus {
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.45), 0 1px 2px rgba(0, 0, 0, 0.18);
        }

        .polaroid-photo-frame {
          position: relative;
          width: 100%;
          height: 235px;
          overflow: hidden;
          background: #1a0f16;
          border-radius: 2px;
          -webkit-mask-image: -webkit-radial-gradient(white, black);
          contain: paint;
        }

        /* Photo stays in 1:1 lockstep alignment with its white Polaroid frame */
        .polaroid-image-render {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transform: scale(1.00);
        }

        .polaroid-gloss-sheen {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.18) 0%, transparent 60%);
          pointer-events: none;
        }

        .polaroid-corner-tag {
          position: absolute;
          bottom: 8px;
          right: 8px;
          background: rgba(28, 10, 26, 0.85);
          color: var(--color-primary);
          font-size: 0.65rem;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 9999px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .polaroid-caption-margin {
          width: 100%;
          padding-top: 10px;
          text-align: center;
        }

        .handwritten-caption-text {
          font-family: var(--font-handwritten);
          font-size: 1.45rem;
          line-height: 1.25;
          color: #2D1420;
          margin: 0;
          font-weight: 600;
          transition: color 600ms ease;
        }

        .handwritten-caption-text.active-ink {
          color: #1a0812;
        }

        .handwritten-date-sub {
          display: block;
          font-family: var(--font-handwritten);
          font-size: 0.95rem;
          color: #8C475A;
          margin-top: 2px;
        }

        .active-golden-light-pool {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 140%;
          height: 140%;
          background: radial-gradient(circle, rgba(255, 215, 90, 0.28) 0%, transparent 70%);
          filter: blur(30px);
          pointer-events: none;
          z-index: -1;
          opacity: 0;
          transition: opacity 800ms cubic-bezier(0.22, 1, 0.36, 1);
        }

        .active-golden-light-pool.pool-active {
          opacity: 1;
        }

        .active-golden-light-pool.pool-hidden {
          opacity: 0;
        }

        /* Reduced Motion Accessibility */
        @media (prefers-reduced-motion: reduce) {
          .hanging-polaroid-unit,
          .hanging-polaroid-unit.card-focus-active,
          .hanging-polaroid-unit.card-focus-neighbor,
          .hanging-polaroid-unit.card-focus-distant {
            transform: none !important;
            transition: opacity 0.3s ease !important;
          }
          .camera-world-scene {
            transition: transform 0.4s ease !important;
          }
        }

        /* Special Camera Banner */
        .special-camera-banner {
          position: fixed;
          bottom: 95px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 60;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 8px 24px;
          border-radius: 9999px;
          background: rgba(30, 10, 26, 0.9);
          border: 1px solid var(--color-secondary-peach);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6), 0 0 25px rgba(250, 169, 67, 0.4);
          font-family: var(--font-serif);
          font-style: italic;
          color: #FFF9F8;
          font-size: 0.98rem;
          animation: bannerGlow 2.5s infinite ease-in-out;
        }

        @keyframes bannerGlow {
          0%, 100% { box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6), 0 0 20px rgba(250, 169, 67, 0.3); }
          50% { box-shadow: 0 12px 35px rgba(0, 0, 0, 0.7), 0 0 35px rgba(250, 169, 67, 0.6); }
        }

        /* =========================================================================
           BOTTOM NAVIGATION CONTROLS
           ========================================================================= */
        .memory-bottom-hud {
          position: relative;
          z-index: 50;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          width: 100%;
          max-width: 820px;
          margin: 0 auto;
        }

        .btn-memory-nav {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          height: 44px;
          padding: 0 20px;
          border-radius: 9999px;
          background: rgba(30, 10, 26, 0.85);
          border: 1px solid var(--color-border);
          color: var(--color-text-light);
          font-family: var(--font-sans);
          font-size: 0.88rem;
          font-weight: 600;
          cursor: pointer;
          backdrop-filter: blur(14px);
          transition: all 0.28s ease;
        }

        .btn-memory-nav:hover:not(:disabled) {
          background: rgba(239, 195, 202, 0.25);
          border-color: var(--color-primary);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
        }

        .btn-memory-nav:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }

        .primary-spotlight {
          background: linear-gradient(135deg, rgba(239, 195, 202, 0.3) 0%, rgba(250, 169, 67, 0.2) 100%);
          border-color: var(--color-secondary-peach);
        }

        .btn-proceed-gift {
          background: linear-gradient(135deg, #FCE8EB 0%, #EFC3CA 50%, #FAA943 100%);
          color: #4A1A28;
          font-weight: 700;
          box-shadow: 0 0 20px rgba(250, 169, 67, 0.4);
        }

        .memory-progress-track {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 16px;
          border-radius: 9999px;
          background: rgba(28, 10, 26, 0.85);
          border: 1px solid var(--color-border-subtle);
          backdrop-filter: blur(14px);
        }

        .memory-dot-btn {
          position: relative;
          background: transparent;
          border: none;
          padding: 4px;
          cursor: pointer;
          outline: none;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .dot-visual {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255, 245, 248, 0.3);
          transition: all 0.3s ease;
        }

        .memory-dot-btn:hover .dot-visual {
          background: var(--color-primary);
          transform: scale(1.3);
        }

        .memory-dot-btn.is-past .dot-visual {
          background: var(--color-border);
        }

        .memory-dot-btn.is-active .dot-visual {
          width: 20px;
          border-radius: 9999px;
          background: var(--color-secondary-peach);
          box-shadow: 0 0 10px var(--color-secondary-peach);
        }

        .dot-tooltip {
          position: absolute;
          bottom: 26px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(28, 10, 26, 0.95);
          border: 1px solid var(--color-border);
          color: var(--color-primary);
          padding: 3px 8px;
          border-radius: 6px;
          font-size: 0.68rem;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.2s ease;
        }

        .memory-dot-btn:hover .dot-tooltip {
          opacity: 1;
        }

        .btn-memory-reset {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          height: 44px;
          padding: 0 16px;
          border-radius: 9999px;
          background: rgba(28, 10, 26, 0.7);
          border: 1px solid var(--color-border-subtle);
          color: var(--color-text-muted);
          font-size: 0.8rem;
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .btn-memory-reset:hover {
          color: var(--color-primary);
          border-color: var(--color-border);
        }

        .btn-reset-placeholder {
          width: 44px;
        }

        /* =========================================================================
           RESPONSIVE ADJUSTMENTS
           ========================================================================= */
        @media (max-width: 768px) {
          .memory-top-hud {
            gap: 6px;
          }
          .memory-info-card {
            padding: 8px 14px;
          }
          .memory-caption-title {
            font-size: 0.92rem;
          }
          .special-camera-banner {
            bottom: 110px;
            font-size: 0.84rem;
            padding: 6px 16px;
          }
          .memory-bottom-hud {
            flex-wrap: wrap;
            gap: 8px;
            justify-content: center;
          }
          .memory-progress-track {
            order: 1;
            width: auto;
            height: 38px;
            gap: 5px;
            padding: 4px 10px;
          }
          .dot-visual {
            width: 6px;
            height: 6px;
          }
          .memory-dot-btn.is-active .dot-visual {
            width: 14px;
          }
          .btn-prev {
            order: 2;
            height: 40px;
            padding: 0 14px;
            font-size: 0.82rem;
          }
          .btn-next, .btn-proceed-gift {
            order: 3;
            height: 40px;
            padding: 0 16px;
            font-size: 0.82rem;
          }
          .btn-memory-reset {
            order: 4;
            height: 40px;
            padding: 0 10px;
          }
          .btn-reset-placeholder {
            display: none;
          }
          .desktop-only {
            display: none !important;
          }
          .polaroid-photo-frame {
            height: 185px;
          }
          .handwritten-caption-text {
            font-size: 1.25rem;
          }
        }

        @media (max-height: 720px) {
          .cinematic-camera-stage {
            padding-top: 8px;
            padding-bottom: 8px;
          }
          .memory-badge-pill {
            display: none;
          }
          .memory-info-card {
            padding: 6px 14px;
          }
          .memory-bottom-hud {
            margin-bottom: 4px;
          }
          .special-camera-banner {
            bottom: 65px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .camera-world-scene,
          .train-fullscreen-video {
            transition: none !important;
          }
          .bulb-glass,
          .photos-revealed .fairy-wires-canvas,
          .photos-revealed .fairy-bulbs-layer,
          .photos-revealed .hanging-polaroid-unit {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default StageGallery;
