/**
 * 21st Birthday Celebration Audio Controller
 * Manages continuous, seamless overlapping playback of bd_looping.mp3
 * with a genuine 1.25-second crossfade overlap between alternating audio players.
 */

export interface CelebrationAudioState {
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  isAutoplayBlocked: boolean;
  hasStartedPlayback: boolean;
  currentTime: number;
  duration: number;
  trackTitle: string;
}

export interface CelebrationAudioConfig {
  src: string;
  fallbackUrls?: string[];
  defaultVolume: number;
  overlapDurationSec: number;
  crossfadeDurationMs: number;
  title: string;
}

class CelebrationAudioController {
  private config: CelebrationAudioConfig = {
    src: '/audio/bd_looping.mp3',
    fallbackUrls: [
      '/audios/bd_looping.mp3',
      '/bd_looping.mp3',
    ],
    defaultVolume: 0.7,
    overlapDurationSec: 1.25,
    crossfadeDurationMs: 1250,
    title: '21st Birthday Celebration Soundtrack',
  };

  // Two alternating HTMLAudioElements for seamless 1.25s crossfade overlap
  private playerA: HTMLAudioElement | null = null;
  private playerB: HTMLAudioElement | null = null;

  // Active index: 0 = playerA is current, 1 = playerB is current
  private activeIndex: 0 | 1 = 0;

  private isInitialized = false;
  private isPlaying = false;
  private isMuted = false;
  private isAutoplayBlocked = false;
  private hasStartedPlayback = false;

  // Scheduling and animation refs
  private overlapTimer: ReturnType<typeof setTimeout> | null = null;
  private crossfadeAnimId: number | null = null;
  private isOverlapTriggered = false;

  private listeners = new Set<(state: CelebrationAudioState) => void>();

  constructor() {
    // Lazily initialized in browser environment
  }

  public init(customConfig?: Partial<CelebrationAudioConfig>): void {
    if (customConfig) {
      this.config = { ...this.config, ...customConfig };
    }

    if (typeof window === 'undefined' || this.isInitialized) return;

    const setupPlayer = (): HTMLAudioElement => {
      const audio = new Audio();
      audio.preload = 'auto';
      audio.src = this.config.src;
      let fallbackIdx = 0;

      audio.addEventListener('error', () => {
        const fallbacks = this.config.fallbackUrls || [];
        if (fallbackIdx < fallbacks.length) {
          audio.src = fallbacks[fallbackIdx++];
          audio.load();
        }
      });

      return audio;
    };

    this.playerA = setupPlayer();
    this.playerA.loop = false;
    this.playerA.volume = this.config.defaultVolume;

    this.playerB = setupPlayer();
    this.playerB.loop = false;
    this.playerB.volume = 0;

    this.isInitialized = true;
  }

  public getState(): CelebrationAudioState {
    const active = this.getActivePlayer();
    const isActuallyPlaying = !!(active && !active.paused && !active.ended);

    return {
      isPlaying: isActuallyPlaying,
      isMuted: this.isMuted,
      volume: this.config.defaultVolume,
      isAutoplayBlocked: this.isAutoplayBlocked,
      hasStartedPlayback: this.hasStartedPlayback,
      currentTime: active ? active.currentTime : 0,
      duration: active && !isNaN(active.duration) ? active.duration : 0,
      trackTitle: this.config.title,
    };
  }

  private getActivePlayer(): HTMLAudioElement | null {
    return this.activeIndex === 0 ? this.playerA : this.playerB;
  }

  private getReservePlayer(): HTMLAudioElement | null {
    return this.activeIndex === 0 ? this.playerB : this.playerA;
  }

  public subscribe(callback: (state: CelebrationAudioState) => void): () => void {
    this.listeners.add(callback);
    callback(this.getState());
    return () => this.listeners.delete(callback);
  }

  private notify(): void {
    const state = this.getState();
    this.listeners.forEach((listener) => {
      try {
        listener(state);
      } catch (err) {
        console.error('Error in CelebrationAudio listener:', err);
      }
    });
  }

  /**
   * Start 21st Celebration looping audio from iteration 1
   */
  public async start(): Promise<boolean> {
    if (!this.isInitialized) {
      this.init();
    }

    // If active player is already playing, avoid duplicate start
    const active = this.getActivePlayer();
    if (active && !active.paused && this.isPlaying) {
      return true;
    }

    if (!this.playerA || !this.playerB) return false;

    this.clearTimersAndAnimation();
    this.activeIndex = 0;
    this.isOverlapTriggered = false;

    const currentPlayer = this.playerA;
    const nextPlayer = this.playerB;

    currentPlayer.currentTime = 0;
    currentPlayer.volume = this.isMuted ? 0 : this.config.defaultVolume;

    nextPlayer.pause();
    nextPlayer.currentTime = 0;
    nextPlayer.volume = 0;

    try {
      await currentPlayer.play();
      this.isPlaying = true;
      this.isAutoplayBlocked = false;
      this.hasStartedPlayback = true;
      this.notify();

      // Schedule the 1.25-second crossfade overlap
      this.scheduleLoopOverlap(currentPlayer, nextPlayer);
      return true;
    } catch (err: unknown) {
      const error = err as Error;
      if (error && (error.name === 'NotAllowedError' || error.name === 'AbortError')) {
        this.isAutoplayBlocked = true;
        this.isPlaying = false;
        this.notify();
      }
      return false;
    }
  }

  /**
   * Schedule the next iteration 1.25s before outgoing track finishes
   */
  private scheduleLoopOverlap(outgoing: HTMLAudioElement, incoming: HTMLAudioElement): void {
    if (this.overlapTimer) {
      clearTimeout(this.overlapTimer);
      this.overlapTimer = null;
    }
    this.isOverlapTriggered = false;

    const armOverlap = () => {
      const duration = outgoing.duration;
      const overlapSec = this.config.overlapDurationSec; // 1.25s

      // Safety guard for short tracks
      if (!duration || isNaN(duration) || duration <= overlapSec + 0.2) {
        // Fallback: wait for ended event if duration is unusually brief
        outgoing.onended = () => {
          if (!this.isPlaying) return;
          incoming.currentTime = 0;
          incoming.volume = this.isMuted ? 0 : this.config.defaultVolume;
          incoming.play().catch(() => {});
          this.activeIndex = (1 - this.activeIndex) as 0 | 1;
          this.scheduleLoopOverlap(incoming, outgoing);
        };
        return;
      }

      const overlapStartTime = Math.max(0.2, duration - overlapSec);
      const remainingSec = Math.max(0, overlapStartTime - outgoing.currentTime);

      this.overlapTimer = setTimeout(() => {
        this.executeCrossfade(outgoing, incoming);
      }, remainingSec * 1000);

      // Robust ontimeupdate guard in case backgrounding/tab throttling drifts setTimeout
      outgoing.ontimeupdate = () => {
        if (!this.isOverlapTriggered && outgoing.currentTime >= overlapStartTime) {
          this.executeCrossfade(outgoing, incoming);
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
   * Seamless 1.25-second crossfade between outgoing and incoming audio players.
   * Uses an equal-power (cosine/sine) gain ramp to keep perceived volume constant.
   */
  private executeCrossfade(outgoing: HTMLAudioElement, incoming: HTMLAudioElement): void {
    if (this.isOverlapTriggered || !this.isPlaying) return;
    this.isOverlapTriggered = true;

    if (this.overlapTimer) {
      clearTimeout(this.overlapTimer);
      this.overlapTimer = null;
    }
    outgoing.ontimeupdate = null;
    outgoing.onended = null;

    // Incoming iteration starts at time 0 with 0 volume
    incoming.currentTime = 0;
    incoming.volume = 0;
    incoming.play().catch((err) => {
      console.warn('Celebration incoming loop play blocked:', err);
    });

    const crossfadeDurationMs = this.config.crossfadeDurationMs; // 1250ms
    const startTime = performance.now();
    const baseVolume = this.config.defaultVolume;

    const crossfadeStep = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / crossfadeDurationMs);

      // Equal-power crossfade curve to prevent perceptual volume dip
      const outGain = Math.cos(progress * 0.5 * Math.PI);
      const inGain = Math.sin(progress * 0.5 * Math.PI);

      if (!this.isMuted) {
        outgoing.volume = Math.max(0, Math.min(1, baseVolume * outGain));
        incoming.volume = Math.max(0, Math.min(1, baseVolume * inGain));
      }

      if (progress < 1 && this.isPlaying) {
        this.crossfadeAnimId = requestAnimationFrame(crossfadeStep);
      } else {
        // Crossfade complete: pause outgoing player and reset it for the next iteration
        outgoing.pause();
        outgoing.currentTime = 0;
        outgoing.volume = 0;

        if (!this.isMuted) {
          incoming.volume = baseVolume;
        }

        this.crossfadeAnimId = null;

        // Switch active index to the incoming player
        this.activeIndex = (1 - this.activeIndex) as 0 | 1;
        this.notify();

        // Schedule next iteration's 1.25s overlap using outgoing (now reserve) player
        this.scheduleLoopOverlap(incoming, outgoing);
      }
    };

    this.crossfadeAnimId = requestAnimationFrame(crossfadeStep);
  }

  /**
   * Resume playback from current position
   */
  public async resume(): Promise<boolean> {
    const active = this.getActivePlayer();
    const reserve = this.getReservePlayer();

    if (active && !active.paused) {
      return true;
    }

    if (active && active.duration > 0 && active.currentTime > 0) {
      try {
        await active.play();
        this.isPlaying = true;
        this.isAutoplayBlocked = false;
        if (reserve) {
          this.scheduleLoopOverlap(active, reserve);
        }
        this.notify();
        return true;
      } catch {
        this.isAutoplayBlocked = true;
        this.notify();
        return false;
      }
    }

    return this.start();
  }

  /**
   * Pause playback without resetting position
   */
  public pause(): void {
    this.isPlaying = false;
    this.clearTimersAndAnimation();

    const active = this.getActivePlayer();
    if (active) {
      active.pause();
    }
    const reserve = this.getReservePlayer();
    if (reserve) {
      reserve.pause();
    }

    this.notify();
  }

  /**
   * Stop celebration audio and reset players (called when leaving the celebration tab)
   */
  public stop(): void {
    this.isPlaying = false;
    this.clearTimersAndAnimation();

    if (this.playerA) {
      this.playerA.pause();
      this.playerA.currentTime = 0;
      this.playerA.volume = 0;
      this.playerA.ontimeupdate = null;
      this.playerA.onended = null;
    }

    if (this.playerB) {
      this.playerB.pause();
      this.playerB.currentTime = 0;
      this.playerB.volume = 0;
      this.playerB.ontimeupdate = null;
      this.playerB.onended = null;
    }

    this.activeIndex = 0;
    this.isOverlapTriggered = false;
    this.notify();
  }

  public togglePlayPause(): void {
    const active = this.getActivePlayer();
    if (active && !active.paused) {
      this.pause();
    } else {
      this.resume();
    }
  }

  public toggleMute(): void {
    this.isMuted = !this.isMuted;
    const vol = this.isMuted ? 0 : this.config.defaultVolume;

    const active = this.getActivePlayer();
    if (active) active.volume = vol;

    this.notify();
  }

  public setVolume(volume: number): void {
    this.config.defaultVolume = Math.max(0, Math.min(1, volume));
    if (!this.isMuted) {
      const active = this.getActivePlayer();
      if (active) active.volume = this.config.defaultVolume;
    }
    this.notify();
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
    if (this.playerA) {
      this.playerA.ontimeupdate = null;
      this.playerA.onended = null;
    }
    if (this.playerB) {
      this.playerB.ontimeupdate = null;
      this.playerB.onended = null;
    }
  }
}

export const celebrationAudioController = new CelebrationAudioController();
