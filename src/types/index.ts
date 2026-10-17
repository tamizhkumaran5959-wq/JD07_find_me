export type BirthdayStage =
  | 'invitation'
  | 'age-reveal'
  | 'gallery'
  | 'surprise-gift'
  | 'birthday-message'
  | 'celebration'
  | 'final-reveal';

export interface PhotoItem {
  id: string;
  url: string;
  fallbackUrl?: string;
  caption: string;
  shortNote?: string;
  rotation?: number; // deterministic natural tilt in degrees (-4 to 4)
  focalPosition?: string;
  tag?: string;
  dateOrLocation?: string;
  isSpecial?: boolean;
}

export interface AudioConfig {
  src: string;
  title: string;
  artist: string;
  promptLabel: string;
  enableSynthFallback: boolean;
}

export interface MemoryAudioConfig {
  src: string;
  fallbackUrls?: string[];
  firstTrackSrc?: string;
  firstTrackFallbackUrls?: string[];
  loopTrackSrc?: string;
  loopTrackFallbackUrls?: string[];
  defaultVolume: number;
  fadeInDurationMs: number;
  fadeOutDurationMs: number;
  title: string;
  artist?: string;
  loop?: boolean;
}

export interface CelebrationAudioConfig {
  src: string;
  fallbackUrls?: string[];
  defaultVolume: number;
  overlapDurationSec: number;
  crossfadeDurationMs?: number;
  title: string;
}

export interface BirthdayConfig {
  recipientName: string;
  nickname?: string;
  age: number;
  birthDate: string;
  openingMessage: {
    greeting?: string;
    whisper: string;
    subtext: string;
    fullscreenTip?: string;
    keyboardPrompt?: string;
    buttonPrompt: string;
    subtleCareNote?: string;
  };
  ageReveal: {
    ageNumber: string;
    badge?: string;
    milestoneTag: string;
    headline: string;
    subtext: string;
    buttonText: string;
  };
  gallery: {
    title: string;
    subtitle: string;
    introWhisper: string;
    introPrompt: string;
    navHint: string;
    nextButtonText: string;
  };
  specialProposalMoment: {
    teaser: string;
    mainMessage: string;
    subMessage: string;
    prompt: string;
  };
  surprise: {
    teaser?: string;
    subTeaser?: string;
    centeredMessage: string;
    clickPrompt: string;
    revealMessage: string;
    proceedPrompt?: string;
    ribbonColor?: string;
  };
  birthdayMessage: {
    mainHeading?: string;
    supportingMessage?: string;
    paragraphs: string[];
    wishes?: string[];
    closingLine?: string;
    signature?: string;
    buttonText: string;
  };
  celebration: {
    heading?: string;
    subheading?: string;
    paragraphs: string[];
    replayText: string;
    confettiButtonText: string;
  };
  journeyReflection?: {
    heading: string;
    subheading: string;
    paragraphs: string[];
    buttonText: string;
  };
  letterForYou?: {
    heading: string;
    subtitle?: string;
    envelopeTitle?: string;
    envelopeSubtitle?: string;
    envelopeInstruction?: string;
    envelopeTag?: string;
    page1Paragraphs?: string[];
    page2Paragraphs?: string[];
    page3Paragraphs?: string[];
    salutation?: string;
    paragraphs: string[];
    closingLine?: string;
    valediction?: string;
    signature?: string;
    buttonText: string;
  };
  grandCelebration?: {
    heading: string;
    subheading: string;
    candlesCount: number;
    buttonText: string;
  };
  finalHeartMessage?: {
    heading: string;
    passage: string;
    footnote?: string;
  };
  finalReveal?: {
    ageNumber: string;
    message: string;
  };
  audio: AudioConfig;
  memoryAudio?: MemoryAudioConfig;
  celebrationAudio?: CelebrationAudioConfig;
  photos: PhotoItem[];
}
