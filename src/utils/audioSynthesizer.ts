/**
 * Gentle Web Audio Synthesizer for ambient birthday chimes and music-box melody.
 * Provides lovely sound if an MP3 file hasn't been uploaded yet.
 */

class AmbientBirthdayChimes {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private timer: number | null = null;
  private masterGain: GainNode | null = null;

  private notes = [
    // Gentle pentatonic and birthday motif frequencies in Hz
    261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99,
  ];

  // Dreamy chord progression: Cmaj9 -> Am9 -> Fmaj7 -> Gsus4
  private chords = [
    [261.63, 329.63, 392.0, 493.88], // Cmaj7
    [220.0, 261.63, 329.63, 392.0],  // Am7
    [174.61, 261.63, 329.63, 392.0], // Fmaj7
    [196.0, 293.66, 392.0, 493.88],  // Gadd9
  ];

  private currentChord = 0;
  private step = 0;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public play() {
    if (this.isPlaying) return;
    this.initContext();
    this.isPlaying = true;

    const playNext = () => {
      if (!this.isPlaying || !this.ctx || !this.masterGain) return;

      const chord = this.chords[this.currentChord];
      const root = chord[this.step % chord.length];

      // Add music-box chime harmonic
      const chimeFreq = this.notes[Math.floor(Math.random() * this.notes.length)];
      this.playChimeNote(root, 1.8, 0.12);
      if (Math.random() > 0.4) {
        setTimeout(() => {
          if (this.isPlaying) this.playChimeNote(chimeFreq, 1.2, 0.08);
        }, 320);
      }

      this.step++;
      if (this.step % 4 === 0) {
        this.currentChord = (this.currentChord + 1) % this.chords.length;
      }

      // 680ms gentle tempo
      this.timer = window.setTimeout(playNext, 680);
    };

    playNext();
  }

  private playChimeNote(freq: number, duration: number, volume: number) {
    if (!this.ctx || !this.masterGain) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Soft sine + triangle blend
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      const now = this.ctx.currentTime;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(volume, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + duration + 0.05);
    } catch {
      // AudioContext state handling
    }
  }

  public stop() {
    this.isPlaying = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  public setVolume(val: number) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, val)), this.ctx.currentTime);
    }
  }

  public getIsPlaying() {
    return this.isPlaying;
  }
}

export const ambientChimes = new AmbientBirthdayChimes();

/**
 * Gentle ascending harp chime for successful boarding approval
 */
export const playBoardingSuccessChime = () => {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    freqs.forEach((freq, idx) => {
      const startTime = ctx.currentTime + idx * 0.09;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.exponentialRampToValueAtTime(0.14, startTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 1.15);
    });
  } catch {
    // Gracefully ignore if browser blocks audio
  }
};

/**
 * Very soft tactile click when pressing on-screen keypad buttons
 */
export const playKeypadClick = () => {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const startTime = ctx.currentTime;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(540, startTime);
    osc.frequency.exponentialRampToValueAtTime(260, startTime + 0.03);

    gain.gain.setValueAtTime(0.035, startTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.03);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + 0.035);
  } catch {
    // Gracefully ignore
  }
};

