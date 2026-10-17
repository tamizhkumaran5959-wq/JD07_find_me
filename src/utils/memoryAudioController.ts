import type { MemoryAudioConfig } from '../types';

export interface MemoryAudioState {
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  isAutoplayBlocked: boolean;
  hasUserManuallyPaused: boolean;
  currentTime: number;
  duration: number;
  hasStartedPlayback: boolean;
  phase: 'idle' | 'waiting-12s' | 'intro' | 'looping';
  currentTrackTitle: string;
}

class MemoryAudioController {
  private config: MemoryAudioConfig = {
    src: '/audio/f_m_looping.mp3',
    fallbackUrls: [
      '/audios/f_m_looping.mp3',
      '/f_m_looping.mp3',
      '/audio/Memories_bgm.mp3?v=2',
    ],
    firstTrackSrc: '/audio/f_1_m.mp3',
    firstTrackFallbackUrls: [
      '/audios/f_1_m.mp3',
      '/f_1_m.mp3',
    ],
    loopTrackSrc: '/audio/f_m_looping.mp3',
    loopTrackFallbackUrls: [
      '/audios/f_m_looping.mp3',
      '/f_m_looping.mp3',
    ],
    defaultVolume: 0.65,
    fadeInDurationMs: 1800,
    fadeOutDurationMs: 1000,
    title: 'Memories Background Melody',
    loop: true,
  };

  // Dedicated audio elements: Intro player and two alternating loop players
  private introAudio: HTMLAudioElement | null = null;
  private loopPlayerA: HTMLAudioElement | null = null;
  private loopPlayerB: HTMLAudioElement | null = null;

  // Active loop state: 0 = Player A, 1 = Player B
  private activeLoopIndex: 0 | 1 = 0;
  private phase: 'idle' | 'waiting-12s' | 'intro' | 'looping' = 'idle';

  private isInitialized = false;
  private isMuted = false;
  private hasUserManuallyPaused = false;
  private isAutoplayBlocked = false;
  private hasStartedPlayback = false;

  // Precise timing & animation control
  private overlapTimer: ReturnType<typeof setTimeout> | null = null;
  private crossfadeAnimId: number | null = null;
  private isOverlapTriggered = false;

  private listeners = new Set<(state: MemoryAudioState) => void>();

  constructor() {
    // Lazily initialized in browser environment
  }

  public init(customConfig?: Partial<MemoryAudioConfig>) {
    if (customConfig) {
      this.config = { ...this.config, ...customConfig };
    }

    if (typeof window === 'undefined' || this.isInitialized) return;

    const setupAudio = (primarySrc: string, fallbackUrls: string[] = []): HTMLAudioElement => {
      const audio = new Audio();
      audio.preload = 'auto';
      audio.src = primarySrc;
      let fbIdx = 0;
      audio.addEventListener('error', () => {
        if (fbIdx < fallbackUrls.length) {
          audio.src = fallbackUrls[fbIdx++];
          audio.load();
        }
      });
      return audio;
    };

    // 1. Intro Player (f_1_m.mp3)
    const introSrc = this.config.firstTrackSrc || '/audio/f_1_m.mp3';
    const introFallbacks = this.config.firstTrackFallbackUrls || ['/audios/f_1_m.mp3', '/f_1_m.mp3'];
    this.introAudio = setupAudio(introSrc, introFallbacks);
    this.introAudio.loop = false;
    this.introAudio.volume = this.config.defaultVolume;

    // Listen for ended event on f_1_m.mp3 to start looping track
    this.introAudio.addEventListener('ended', () => {
      if (this.phase === 'intro') {
        this.startLoopingPhase();
      }
    });

    this.introAudio.addEventListener('play', () => {
      this.isAutoplayBlocked = false;
      this.notify();
    });
    this.introAudio.addEventListener('pause', () => this.notify());

    // 2. Looping Player A (f_m_looping.mp3)
    const loopSrc = this.config.loopTrackSrc || '/audio/f_m_looping.mp3';
    const loopFallbacks = this.config.loopTrackFallbackUrls || ['/audios/f_m_looping.mp3', '/f_m_looping.mp3'];
    this.loopPlayerA = setupAudio(loopSrc, loopFallbacks);
    this.loopPlayerA.loop = false;
    this.loopPlayerA.volume = this.config.defaultVolume;

    // 3. Looping Player B (f_m_looping.mp3 - for 2s overlap crossfade)
    this.loopPlayerB = setupAudio(loopSrc, loopFallbacks);
    this.loopPlayerB.loop = false;
    this.loopPlayerB.volume = 0;

    this.isInitialized = true;
  }

  public getState(): MemoryAudioState {
    const activePlayer = this.getActivePlayer();
    const isPlaying = !!(
      activePlayer &&
      !activePlayer.paused &&
      !activePlayer.ended
    );

    return {
      isPlaying,
      isMuted: this.isMuted,
      volume: this.config.defaultVolume,
      isAutoplayBlocked: this.isAutoplayBlocked,
      hasUserManuallyPaused: this.hasUserManuallyPaused,
      currentTime: activePlayer ? activePlayer.currentTime : 0,
      duration: activePlayer ? activePlayer.duration || 0 : 0,
      hasStartedPlayback: this.hasStartedPlayback,
      phase: this.phase,
      currentTrackTitle:
        this.phase === 'intro'
          ? 'Memories Theme (f_1_m)'
          : this.phase === 'looping'
          ? 'Memories Looping (f_m_looping)'
          : this.config.title,
    };
  }

  private getActivePlayer(): HTMLAudioElement | null {
    if (this.phase === 'intro') return this.introAudio;
    if (this.phase === 'looping') {
      return this.activeLoopIndex === 0 ? this.loopPlayerA : this.loopPlayerB;
    }
    return null;
  }

  public subscribe(callback: (state: MemoryAudioState) => void): () => void {
    this.listeners.add(callback);
    callback(this.getState());
    return () => this.listeners.delete(callback);
  }

  private notify() {
    const state = this.getState();
    this.listeners.forEach((listener) => {
      try {
        listener(state);
      } catch (err) {
        console.error('Error in MemoryAudio listener:', err);
      }
    });
  }

  /**
   * Begins the Memories audio sequence at the 12-second mark.
   * Plays f_1_m.mp3 first until completion, then seamlessly transitions to f_m_looping.mp3.
   */
  public async startMemoriesAudioSequence(options?: { force?: boolean }): Promise<boolean> {
    if (!this.isInitialized) {
      this.init();
    }

    // Guard: If already playing intro or looping, do not duplicate or restart
    if (this.phase === 'intro' || this.phase === 'looping') {
      const active = this.getActivePlayer();
      if (active && !active.paused) {
        return true;
      }
    }

    if (this.hasUserManuallyPaused && !options?.force) {
      return false;
    }

    if (!this.introAudio) return false;

    // Stop and reset any ongoing looping playback
    this.clearTimersAndAnimation();

    this.phase = 'intro';
    this.introAudio.currentTime = 0;
    this.introAudio.volume = this.isMuted ? 0 : this.config.defaultVolume;

    try {
      await this.introAudio.play();
      this.isAutoplayBlocked = false;
      this.hasUserManuallyPaused = false;
      this.hasStartedPlayback = true;
      this.notify();
      return true;
    } catch (err: unknown) {
      const error = err as Error;
      if (error && (error.name === 'NotAllowedError' || error.name === 'AbortError')) {
        this.isAutoplayBlocked = true;
        this.notify();
      }
      return false;
    }
  }

  // Alias for backward compatibility with stage navigations
  public startMemoryBgm(options?: { force?: boolean }): Promise<boolean> {
    return this.startMemoriesAudioSequence(options);
  }

  /**
   * Starts the continuous looping phase of f_m_looping.mp3
   * with a genuine 2-second overlapping crossfade between alternating instances.
   */
  private async startLoopingPhase(): Promise<void> {
    if (!this.loopPlayerA || !this.loopPlayerB) return;

    this.clearTimersAndAnimation();
    this.phase = 'looping';
    this.activeLoopIndex = 0;
    this.isOverlapTriggered = false;

    const playerA = this.loopPlayerA;
    const playerB = this.loopPlayerB;

    playerA.currentTime = 0;
    playerA.volume = this.isMuted ? 0 : this.config.defaultVolume;

    playerB.pause();
    playerB.currentTime = 0;
    playerB.volume = 0;

    try {
      await playerA.play();
      this.isAutoplayBlocked = false;
      this.hasStartedPlayback = true;
      this.notify();

      // Schedule the 2-second crossfade overlap
      this.scheduleLoopOverlap(playerA, playerB);
    } catch {
      this.isAutoplayBlocked = true;
      this.notify();
    }
  }

  /**
   * Schedules the next player to begin 2 seconds before the current player finishes,
   * using duration metadata and precise timeupdate backup.
   */
  private scheduleLoopOverlap(outgoing: HTMLAudioElement, incoming: HTMLAudioElement): void {
    if (this.overlapTimer) {
      clearTimeout(this.overlapTimer);
      this.overlapTimer = null;
    }
    this.isOverlapTriggered = false;

    const armOverlap = () => {
      const duration = outgoing.duration;
      if (!duration || isNaN(duration) || duration <= 2.5) {
        // Fallback: If duration is still loading, wait a moment
        return;
      }

      const overlapStartTime = Math.max(0.5, duration - 2.0);
      const remainingSec = Math.max(0, overlapStartTime - outgoing.currentTime);

      this.overlapTimer = setTimeout(() => {
        this.executeLoopCrossfade(outgoing, incoming);
      }, remainingSec * 1000);

      // Robust ontimeupdate guard in case backgrounding drifts setTimeout
      outgoing.ontimeupdate = () => {
        if (!this.isOverlapTriggered && outgoing.currentTime >= overlapStartTime) {
          this.executeLoopCrossfade(outgoing, incoming);
        }
      };
    };

    if (outgoing.readyState >= 1 && outgoing.duration > 0) {
      armOverlap();
    } else {
      outgoing.addEventListener('loadedmetadata', () => armOverlap(), { once: true });
    }
  }

  /**
   * Executes a seamless 2-second crossfade between outgoing and incoming loop players.
   * Uses an equal-power (cosine/sine) gain ramp so total perceived loudness remains constant.
   */
  private executeLoopCrossfade(outgoing: HTMLAudioElement, incoming: HTMLAudioElement): void {
    if (this.isOverlapTriggered || this.phase !== 'looping') return;
    this.isOverlapTriggered = true;

    if (this.overlapTimer) {
      clearTimeout(this.overlapTimer);
      this.overlapTimer = null;
    }
    outgoing.ontimeupdate = null;

    // Start incoming track at 0 volume
    incoming.currentTime = 0;
    incoming.volume = 0;
    incoming.play().catch(() => {});

    const crossfadeDurationMs = 2000;
    const startTime = performance.now();

    const crossfadeStep = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / crossfadeDurationMs);

      // Equal-power crossfade curve to prevent perceptual volume dip
      const outGain = Math.cos(progress * 0.5 * Math.PI);
      const inGain = Math.sin(progress * 0.5 * Math.PI);

      if (!this.isMuted) {
        outgoing.volume = Math.max(0, Math.min(1, this.config.defaultVolume * outGain));
        incoming.volume = Math.max(0, Math.min(1, this.config.defaultVolume * inGain));
      }

      if (progress < 1 && this.phase === 'looping') {
        this.crossfadeAnimId = requestAnimationFrame(crossfadeStep);
      } else {
        // Crossfade complete: Stop outgoing player and finalize incoming player
        outgoing.pause();
        outgoing.currentTime = 0;
        outgoing.volume = 0;

        if (!this.isMuted) {
          incoming.volume = this.config.defaultVolume;
        }

        this.crossfadeAnimId = null;

        if (this.phase === 'looping') {
          // Flip active index (A <-> B) and schedule next 2s overlap
          this.activeLoopIndex = (1 - this.activeLoopIndex) as 0 | 1;
          this.isOverlapTriggered = false;
          this.scheduleLoopOverlap(incoming, outgoing);
          this.notify();
        }
      }
    };

    this.crossfadeAnimId = requestAnimationFrame(crossfadeStep);
  }

  private clearTimersAndAnimation(): void {
    if (this.overlapTimer) {
      clearTimeout(this.overlapTimer);
      this.overlapTimer = null;
    }
    if (this.crossfadeAnimId !== null) {
      cancelAnimationFrame(this.crossfadeAnimId);
      this.crossfadeAnimId = null;
    }
    if (this.loopPlayerA) this.loopPlayerA.ontimeupdate = null;
    if (this.loopPlayerB) this.loopPlayerB.ontimeupdate = null;
  }

  /**
   * Clean up timers, event listeners, and scheduled sources when leaving Memories tab
   */
  public leaveMemoriesTab(): void {
    this.clearTimersAndAnimation();

    if (this.introAudio) {
      this.introAudio.pause();
      this.introAudio.currentTime = 0;
    }

    if (this.loopPlayerA) {
      this.loopPlayerA.pause();
      this.loopPlayerA.currentTime = 0;
      this.loopPlayerA.volume = 0;
    }

    if (this.loopPlayerB) {
      this.loopPlayerB.pause();
      this.loopPlayerB.currentTime = 0;
      this.loopPlayerB.volume = 0;
    }

    this.phase = 'idle';
    this.isOverlapTriggered = false;
    this.notify();
  }

  /**
   * Pause currently active track without losing playback position
   */
  public pause(manual = true): void {
    if (manual) {
      this.hasUserManuallyPaused = true;
    }
    this.clearTimersAndAnimation();

    const active = this.getActivePlayer();
    if (active) {
      active.pause();
    }
    this.notify();
  }

  /**
   * Resume playback seamlessly from current position
   * Ensures no unnecessary restarting and no duplicate playback
   */
  public async resume(): Promise<boolean> {
    this.hasUserManuallyPaused = false;

    // 1. If currently active player is ALREADY playing, do not touch or restart it
    const active = this.getActivePlayer();
    if (active && !active.paused && !active.ended) {
      return true;
    }

    // 2. Resume intro track (f_1_m.mp3) from current playback position
    if (this.phase === 'intro' && this.introAudio) {
      try {
        await this.introAudio.play();
        this.isAutoplayBlocked = false;
        this.hasStartedPlayback = true;
        this.notify();
        return true;
      } catch (err: unknown) {
        const error = err as Error;
        if (error && (error.name === 'NotAllowedError' || error.name === 'AbortError')) {
          this.isAutoplayBlocked = true;
          this.notify();
        }
        return false;
      }
    }

    // 3. Resume looping track (f_m_looping.mp3) from current playback position
    if (this.phase === 'looping') {
      const currentActive = this.activeLoopIndex === 0 ? this.loopPlayerA : this.loopPlayerB;
      const reserve = this.activeLoopIndex === 0 ? this.loopPlayerB : this.loopPlayerA;
      if (currentActive) {
        try {
          await currentActive.play();
          this.isAutoplayBlocked = false;
          this.hasStartedPlayback = true;
          if (reserve) {
            this.scheduleLoopOverlap(currentActive, reserve);
          }
          this.notify();
          return true;
        } catch (err: unknown) {
          const error = err as Error;
          if (error && (error.name === 'NotAllowedError' || error.name === 'AbortError')) {
            this.isAutoplayBlocked = true;
            this.notify();
          }
          return false;
        }
      }
    }

    // 4. If playback has already started previously, resume appropriate player
    if (this.hasStartedPlayback) {
      if (this.loopPlayerA && (this.loopPlayerA.currentTime > 0 || (this.loopPlayerB && this.loopPlayerB.currentTime > 0))) {
        this.phase = 'looping';
        return this.resume();
      }
      if (this.introAudio && this.introAudio.currentTime > 0 && !this.introAudio.ended) {
        this.phase = 'intro';
        return this.resume();
      }
      // If intro finished, start looping phase
      this.phase = 'looping';
      return this.startLoopingPhase().then(() => true);
    }

    // 5. Initial start
    return this.startMemoriesAudioSequence({ force: true });
  }

  public togglePlayPause(): void {
    const active = this.getActivePlayer();
    if (active && !active.paused) {
      this.pause(true);
    } else {
      this.resume();
    }
  }

  public toggleMute(): void {
    this.isMuted = !this.isMuted;
    const vol = this.isMuted ? 0 : this.config.defaultVolume;

    if (this.introAudio) this.introAudio.volume = vol;
    const active = this.getActivePlayer();
    if (active) active.volume = vol;

    this.notify();
  }

  public setVolume(volume: number): void {
    this.config.defaultVolume = Math.max(0, Math.min(1, volume));
    if (!this.isMuted) {
      const active = this.getActivePlayer();
      if (active) {
        active.volume = this.config.defaultVolume;
      }
    }
    this.notify();
  }

  public reset(): void {
    this.leaveMemoriesTab();
    this.hasStartedPlayback = false;
    this.hasUserManuallyPaused = false;
    this.isAutoplayBlocked = false;
    this.notify();
  }

  public destroy(): void {
    this.leaveMemoriesTab();
    this.introAudio = null;
    this.loopPlayerA = null;
    this.loopPlayerB = null;
    this.listeners.clear();
    this.isInitialized = false;
    this.hasStartedPlayback = false;
  }
}

export const memoryAudioController = new MemoryAudioController();
