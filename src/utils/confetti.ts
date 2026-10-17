import confetti from 'canvas-confetti';

const CELEBRATION_COLORS = [
  '#EFC3CA', // Soft Pink
  '#FCE8EB', // Pale Blush
  '#FFF9F8', // Warm White
  '#DDA7B0', // Muted Rose
  '#FAA943', // Soft Peach / Warm Accent
];

let lastBurstTime = 0;

/**
 * Fires a lightweight, debounced celebratory confetti burst in pastel pink & blush tones.
 * Prevents rapid clicks from creating hundreds of overlapping animation loops.
 */
export const triggerBirthdayConfetti = () => {
  const now = Date.now();
  if (now - lastBurstTime < 450) return;
  lastBurstTime = now;

  const count = 90;
  const defaults = {
    origin: { y: 0.65 },
    zIndex: 9999,
    disableForReducedMotion: true,
  };

  // Center upward spray
  confetti({
    ...defaults,
    particleCount: Math.floor(count * 0.45),
    spread: 60,
    startVelocity: 45,
    scalar: 0.9,
    colors: CELEBRATION_COLORS,
  });

  // Left & right gentle fans
  confetti({
    ...defaults,
    particleCount: Math.floor(count * 0.28),
    angle: 60,
    spread: 55,
    origin: { x: 0.15, y: 0.65 },
    colors: CELEBRATION_COLORS,
  });

  confetti({
    ...defaults,
    particleCount: Math.floor(count * 0.28),
    angle: 120,
    spread: 55,
    origin: { x: 0.85, y: 0.65 },
    colors: CELEBRATION_COLORS,
  });
};

/**
 * Natural, soft falling confetti shower when entering the final celebration slide.
 * Varied sizes, gentle rotation, and lightweight particle density.
 */
export const triggerSoftCelebrationFall = () => {
  const duration = 2400;
  const animationEnd = Date.now() + duration;

  const frame = () => {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 50,
      origin: { x: 0, y: 0.2 },
      colors: CELEBRATION_COLORS,
      ticks: 240,
      gravity: 0.6,
      scalar: 0.85,
      zIndex: 9999,
      disableForReducedMotion: true,
    });

    confetti({
      particleCount: 3,
      angle: 120,
      spread: 50,
      origin: { x: 1, y: 0.2 },
      colors: CELEBRATION_COLORS,
      ticks: 240,
      gravity: 0.6,
      scalar: 0.85,
      zIndex: 9999,
      disableForReducedMotion: true,
    });

    if (Date.now() < animationEnd) {
      requestAnimationFrame(frame);
    }
  };

  requestAnimationFrame(frame);
};

export const triggerGentleSparks = triggerSoftCelebrationFall;
