/**
 * Train Video Controller
 * 
 * Centralized, production-grade video preloading, readiness monitoring,
 * and playback coordination for the birthday cinematic train journey.
 * 
 * Manages:
 * - /videos/Begining.mp4 (Opening train ride with engine audio, 0-12s)
 * - /videos/Looping.mp4 (Continuous background train loop)
 */

export interface VideoTrackState {
  src: string;
  name: string;
  status: 'idle' | 'loading' | 'ready' | 'error';
  isReady: boolean;
  bufferedPercent: number;
  duration: number;
  error: string | null;
}

export interface TrainVideoState {
  opening: VideoTrackState;
  looping: VideoTrackState;
  overallReady: boolean;
  phase: 'opening' | 'looping';
  isPhotosRevealed: boolean;
  isAutoplayBlocked: boolean;
  isPlaying: boolean;
  currentTime: number;
}

type StateListener = (state: TrainVideoState) => void;

class TrainVideoController {
  private openingVideo: HTMLVideoElement | null = null;
  private loopingVideo: HTMLVideoElement | null = null;

  private state: TrainVideoState = {
    opening: {
      src: '/videos/Begining.mp4',
      name: 'Train Intro (Begining.mp4)',
      status: 'idle',
      isReady: false,
      bufferedPercent: 0,
      duration: 0,
      error: null,
    },
    looping: {
      src: '/videos/Looping.mp4',
      name: 'Train Memories View (Looping.mp4)',
      status: 'idle',
      isReady: false,
      bufferedPercent: 0,
      duration: 0,
      error: null,
    },
    overallReady: false,
    phase: 'opening',
    isPhotosRevealed: false,
    isAutoplayBlocked: false,
    isPlaying: false,
    currentTime: 0,
  };

  private listeners = new Set<StateListener>();
  private isInitialized = false;
  private hasTriggeredTimeline12s = false;
  private hasSwitchedToLoop = false;
  private fadeAnimId: number | null = null;
  private progressIntervalId: ReturnType<typeof setInterval> | null = null;
  private safetyTimerId: ReturnType<typeof setTimeout> | null = null;
  private timelineCallback: (() => void) | null = null;

  constructor() {
    // Lazily initialized in browser
  }

  /**
   * Initializes both video elements and starts preloading immediately.
   */
  public init(openingEl?: HTMLVideoElement | null, loopingEl?: HTMLVideoElement | null) {
    if (typeof window === 'undefined') return;

    if (openingEl) {
      this.openingVideo = openingEl;
      this.setupVideoElement(openingEl, 'opening', '/videos/Begining.mp4');
    } else if (!this.openingVideo) {
      this.openingVideo = document.createElement('video');
      this.setupVideoElement(this.openingVideo, 'opening', '/videos/Begining.mp4');
    }

    if (loopingEl) {
      this.loopingVideo = loopingEl;
      this.setupVideoElement(loopingEl, 'looping', '/videos/Looping.mp4');
    } else if (!this.loopingVideo) {
      this.loopingVideo = document.createElement('video');
      this.setupVideoElement(this.loopingVideo, 'looping', '/videos/Looping.mp4');
    }

    if (this.loopingVideo) {
      this.loopingVideo.loop = true;
      this.loopingVideo.muted = true;
    }

    this.startProgressPolling();

    if (!this.isInitialized) {
      this.isInitialized = true;
      this.safetyTimerId = setTimeout(() => {
        this.state.opening.isReady = true;
        this.state.looping.isReady = true;
        this.state.opening.status = 'ready';
        this.state.looping.status = 'ready';
        this.state.opening.bufferedPercent = Math.max(this.state.opening.bufferedPercent, 100);
        this.state.looping.bufferedPercent = Math.max(this.state.looping.bufferedPercent, 100);
        this.checkReadiness();
      }, 2500);
    }
  }

  private setupVideoElement(
    video: HTMLVideoElement,
    track: 'opening' | 'looping',
    primarySrc: string
  ) {
    video.preload = 'auto';
    video.playsInline = true;
    video.muted = true;
    video.autoplay = false;

    if (!video.src || !video.src.includes(primarySrc)) {
      video.src = primarySrc;
    }

    this.updateTrackState(track, {
      status: 'loading',
      error: null,
    });

    const markReady = () => {
      this.updateTrackState(track, {
        isReady: true,
        status: 'ready',
        duration: video.duration || 0,
        bufferedPercent: Math.max(this.state[track].bufferedPercent, 100),
      });
      this.checkReadiness();
    };

    const onLoadedMetadata = () => {
      this.updateTrackState(track, {
        duration: video.duration || 0,
      });
      this.evaluateTrackBuffer(track, video);
    };

    const onLoadedData = () => {
      markReady();
    };

    const onCanPlay = () => {
      markReady();
    };

    const onProgress = () => {
      this.evaluateTrackBuffer(track, video);
    };

    const onError = () => {
      console.warn(`[TrainVideoController] ${track} load notice:`, video.error?.message || 'deferred');
      // Treat as ready with fallback so slides are never blocked
      markReady();
    };

    video.addEventListener('loadedmetadata', onLoadedMetadata);
    video.addEventListener('loadeddata', onLoadedData);
    video.addEventListener('canplay', onCanPlay);
    video.addEventListener('canplaythrough', onCanPlay);
    video.addEventListener('progress', onProgress);
    video.addEventListener('error', onError);

    if (track === 'opening' && !(video as any)._hasOpeningListeners) {
      (video as any)._hasOpeningListeners = true;
      video.addEventListener('timeupdate', () => this.handleOpeningTimeUpdate());
      video.addEventListener('ended', () => this.handleOpeningEnded());
    }

    // Check if already ready
    if (video.readyState >= 2) {
      markReady();
    } else {
      try {
        video.load();
      } catch {
        // Safe catch
      }
    }
  }

  private evaluateTrackBuffer(track: 'opening' | 'looping', video: HTMLVideoElement) {
    if (!video) return;

    if (video.readyState >= 2) {
      this.updateTrackState(track, {
        isReady: true,
        status: 'ready',
        duration: video.duration || 0,
        bufferedPercent: 100,
      });
      this.checkReadiness();
      return;
    }

    if (!video.duration || video.duration === 0) return;
    const buf = video.buffered;
    let maxBuffered = 0;

    for (let i = 0; i < buf.length; i++) {
      if (buf.start(i) <= 1.0) {
        maxBuffered = Math.max(maxBuffered, buf.end(i));
      }
    }

    const ratio = Math.min(1, maxBuffered / video.duration);
    const percent = Math.round(ratio * 100);

    const isReady = ratio >= 0.15 || video.readyState >= 2;

    this.updateTrackState(track, {
      bufferedPercent: isReady ? 100 : Math.max(percent, this.state[track].bufferedPercent),
      duration: video.duration,
      ...(isReady ? { isReady: true, status: 'ready' } : {}),
    });

    if (isReady) {
      this.checkReadiness();
    }
  }

  private startProgressPolling() {
    if (this.progressIntervalId) return;
    this.progressIntervalId = setInterval(() => {
      if (this.openingVideo) this.evaluateTrackBuffer('opening', this.openingVideo);
      if (this.loopingVideo) this.evaluateTrackBuffer('looping', this.loopingVideo);
    }, 200);
  }

  private updateTrackState(track: 'opening' | 'looping', partial: Partial<VideoTrackState>) {
    this.state[track] = { ...this.state[track], ...partial };
    this.notifyListeners();
  }

  private checkReadiness() {
    const openingReady = this.state.opening.isReady;
    const loopingReady = this.state.looping.isReady;

    if (openingReady && loopingReady && !this.state.overallReady) {
      this.state.overallReady = true;
      if (this.safetyTimerId) {
        clearTimeout(this.safetyTimerId);
        this.safetyTimerId = null;
      }
      this.notifyListeners();
    }
  }

  public retry(track?: 'opening' | 'looping') {
    if (!track || track === 'opening') {
      if (this.openingVideo) {
        this.openingVideo.src = '/videos/Begining.mp4';
        this.openingVideo.load();
      }
    }
    if (!track || track === 'looping') {
      if (this.loopingVideo) {
        this.loopingVideo.src = '/videos/Looping.mp4';
        this.loopingVideo.load();
      }
    }
  }

  public startGalleryPlayback(on12sTimelineCallback?: () => void): Promise<boolean> {
    this.timelineCallback = on12sTimelineCallback || null;
    const video = this.openingVideo;

    this.hasTriggeredTimeline12s = false;
    this.hasSwitchedToLoop = false;
    this.state.phase = 'opening';
    this.state.isPhotosRevealed = false;
    this.state.isPlaying = true;

    // Preload looping video ready for crossfade
    if (this.loopingVideo) {
      this.loopingVideo.currentTime = 0;
      this.loopingVideo.load();
    }

    if (!video) {
      this.skipToMemories();
      return Promise.resolve(false);
    }

    video.currentTime = 0;
    video.volume = 1.0;
    video.muted = false;

    const playPromise = video.play();
    if (playPromise !== undefined) {
      return playPromise
        .then(() => {
          this.state.isAutoplayBlocked = false;
          this.notifyListeners();
          return true;
        })
        .catch((err) => {
          console.warn('[TrainVideoController] Autoplay with sound restricted, starting muted:', err);
          video.muted = true;
          this.state.isAutoplayBlocked = true;
          this.notifyListeners();
          return video.play().then(() => true).catch(() => {
            // If even muted autoplay fails, skip to memories so user is not blocked
            this.skipToMemories();
            return false;
          });
        });
    }

    this.notifyListeners();
    return Promise.resolve(true);
  }

  public skipToMemories() {
    this.hasTriggeredTimeline12s = true;
    this.hasSwitchedToLoop = true;
    this.state.phase = 'looping';
    this.state.isPhotosRevealed = true;

    if (this.openingVideo) {
      this.fadeAudio(this.openingVideo, 800);
    }

    if (this.loopingVideo) {
      this.loopingVideo.muted = true;
      this.loopingVideo.loop = true;
      this.loopingVideo.playsInline = true;
      this.loopingVideo.play().catch(() => {});
    }

    if (this.timelineCallback) {
      this.timelineCallback();
    }

    this.notifyListeners();
  }

  public enableSound() {
    if (this.openingVideo) {
      this.openingVideo.muted = false;
      this.openingVideo.volume = 1.0;
    }
    this.state.isAutoplayBlocked = false;
    this.notifyListeners();
  }

  private handleOpeningTimeUpdate() {
    const video = this.openingVideo;
    if (!video) return;
    const time = video.currentTime;
    this.state.currentTime = time;

    // 1. Around 10.0s: Fade train engine audio
    if (time >= 10.0 && !this.hasTriggeredTimeline12s) {
      this.fadeAudio(video, 2000);
    }

    // 2. At 11.5s: Start looping video in background for visual crossfade
    if (time >= 11.5 && !this.hasSwitchedToLoop) {
      this.hasSwitchedToLoop = true;
      this.state.phase = 'looping';
      if (this.loopingVideo) {
        this.loopingVideo.currentTime = 0;
        this.loopingVideo.muted = true;
        this.loopingVideo.loop = true;
        this.loopingVideo.play().catch(() => {});
      }
      this.notifyListeners();
    }

    // 3. At 12.0s: Trigger memory sequence (reveal 12 photos, fairy lights, HUD)
    if (time >= 12.0 && !this.hasTriggeredTimeline12s) {
      this.hasTriggeredTimeline12s = true;
      this.state.isPhotosRevealed = true;
      if (this.timelineCallback) {
        this.timelineCallback();
      }
      this.notifyListeners();
    }
  }

  private handleOpeningEnded() {
    this.skipToMemories();
  }

  private fadeAudio(video: HTMLVideoElement, durationMs: number) {
    if (this.fadeAnimId !== null) {
      cancelAnimationFrame(this.fadeAnimId);
    }
    const startVol = video.volume;
    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / durationMs);
      video.volume = Math.max(0, startVol * (1 - progress));

      if (progress < 1) {
        this.fadeAnimId = requestAnimationFrame(step);
      } else {
        video.volume = 0;
        this.fadeAnimId = null;
      }
    };

    this.fadeAnimId = requestAnimationFrame(step);
  }

  public pause() {
    this.openingVideo?.pause();
    this.loopingVideo?.pause();
    this.state.isPlaying = false;
    this.notifyListeners();
  }

  public resume() {
    if (this.state.phase === 'opening') {
      this.openingVideo?.play().catch(() => {});
    } else {
      this.loopingVideo?.play().catch(() => {});
    }
    this.state.isPlaying = true;
    this.notifyListeners();
  }

  public getState(): TrainVideoState {
    return { ...this.state };
  }

  public getOpeningVideo(): HTMLVideoElement | null {
    return this.openingVideo;
  }

  public getLoopingVideo(): HTMLVideoElement | null {
    return this.loopingVideo;
  }

  public subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    const currentState = this.getState();
    this.listeners.forEach((listener) => {
      try {
        listener(currentState);
      } catch (err) {
        console.error('[TrainVideoController] Listener error:', err);
      }
    });
  }
}

export const trainVideoController = new TrainVideoController();
