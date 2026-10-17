import type { BirthdayConfig } from '../types';

/**
 * =========================================================================
 * 🎂 BIRTHDAY SURPRISE MASTER CONFIGURATION
 * =========================================================================
 * This is the ONLY file you need to edit to customize:
 *  1. Photos, rotations, and handwritten captions (drop photos into /public/images/birthday/)
 *  2. Special Proposal-Vibe Cinematic Birthday Highlight message
 *  3. Music file (drop your Tamil MP3 song into /public/audio/birthday-song.mp3)
 *  4. Name, Age (21), and Birth Date (October 18, 2005)
 *  5. All written letters, wishes, and captions
 * =========================================================================
 */

export const birthdayConfig: BirthdayConfig = {
  // Recipient details
  recipientName: 'Sreya',
  nickname: 'Sreya',
  age: 21,
  birthDate: 'October 18, 2005',

  // Stage 1: Opening Invitation Screen
  openingMessage: {
    whisper: 'Someone has something special for you...',
    subtext: 'An experience made just for your special day.',
    buttonPrompt: "Let's Begin",
    fullscreenTip: 'Press F11 for the best fullscreen experience',
    keyboardPrompt: 'Press any key to continue',
    subtleCareNote: 'Made with a little extra care, just for you.',
  },

  // Stage 2: 21st Birthday Age Reveal / A Small Gift
  ageReveal: {
    ageNumber: '21',
    milestoneTag: 'A milestone of Grace & Radiance',
    headline: '21 Years of being wonderfully YOU.',
    subtext: "Today isn't just another day. It's Your Day!",
    buttonText: 'Walk Down Memory Lane',
  },

  // Stage 3: Cinematic Polaroid Memory Experience (Preserved completely)
  gallery: {
    title: 'Hanging Fairy-Light Memories ✨',
    subtitle: 'Polaroid moments hanging from glowing warm fairy lights',
    introWhisper: 'Some moments deserve their own little place in time...',
    introPrompt: 'Ready for a few little memories? ✨',
    navHint: 'Click any photo or use → / ← arrow keys to illuminate',
    nextButtonText: 'Proceed to Next Chapter ✨',
  },

  // Stage 4: How Was the Journey?
  journeyReflection: {
    heading: 'How Was the Journey?',
    subheading: 'Hope you enjoyed the journey…',
    paragraphs: [
      'Some journeys are measured in distance, while others are measured in the smiles, little moments, and memories they leave behind. I hope this little journey brought a few smiles to your face and reminded you that even the smallest moments can become something beautiful.',
      'This is my Small Gift',
      'Unaku Pudichirukum Nu Nenaikuren',
    ],
    buttonText: 'A Small Message for You 💌',
  },

  // Stage 5: A Letter for You (Three-Page Interactive Envelope Experience)
  letterForYou: {
    heading: "A Letter I've Been Meaning to Give You",
    subtitle: 'Some memories are too precious to leave unspoken...',
    envelopeTitle: "A Letter I've Been Meaning to Give You",
    envelopeSubtitle: 'Some memories are too precious to leave unspoken...',
    envelopeInstruction: 'Untie the little ribbon to open your letter',
    envelopeTag: 'Made with care, just for you.',
    page1Paragraphs: [
      "First time una pathadhu clg bus la dha.... Apo nee yaru, un name, ena department kuda theriyathu.. just bus la random ah yarachu papom la aprm avanga next pakave mudiyathu like that... After bridge course, regular class start Achu apo students ellarum split pani department la potanga... Apo dha una namba class la pathen. Enaku apdiye sudden shock. Ne epdi inga nu. Aprm un name therinjuchu. One day Unaku neyabakam iruka nu therla first apo tha unkita notes kettu pesunen. Patha nee english laye pesitu irundha... Nanum manage pani dha pesuna.. but at the end, nane unkita ketten tamil theriyatha.. tamil la pesu nu ketten. Adhuku ne strangers kita english la dha pesuva nu sonna.. but,one day na clg leave pottu jolly a irukiya nu ketten..adhuku ne tamil la reply pana first time.. enaku apdiye shock..aprm dha unkita ketten hey ne dha pesuriya ila vera yaravadha nu. Ne edhuku kekura nu keta. Adha ne already sonna la strangers kitta english la dha pesuven nu . Odane ne laughing emoji send panita 😂. I don't know whether you remember or not...i still remember it as one of my sweetest day of my first year."
    ],
    page2Paragraphs: [
      "Aprm second year apo apo unkita pesunen.. mrng ne Vera bus la varuva.. evng mattum dha en bus la varuva apo dha unkita pesuven.. ne front seat la irupa na last seat la irupen. Suma fun ah pesitu irupom.. adhuvum rainy days la neraya vatti pesirupom la... May be they were just normal moments for you, but for me, they became beautiful memories... I'll always carry in my heart.. aprm Pongal celebration apo.. ne black saree la vandha.. you look so pretty on that day... Na kuda chat la unaku compliment sonna neyabakam iruka.. avlo crowd la kuda ne mattum thaniya therinja....aprm lab spiral pottu unaku kuduka ketten adhu ne pay pani dha vangipen Ilana vanga matten nu evlo neram chat la argue paniye i still remember....One day mattum na marakave matten.. 25 September 2024 ... Apo dha ne aludha dha pathen... enaku romba kastama irundhuchu.. apo andha time ne evlo emotional ah irupa nu purinjidhu... Unkita vandhu pesanum, enachu kekanum nu nenchen.. but enala mudila.. because of my hesitation.. as a frnd or whatever.. na vandhu unkita keturukanum.. ipo varaikum na Adhuku regret pandren... Adhuku dha unaku romba memorable ah close to heart oru gift kuduthen..I hope you still have the gift.. apo una force Panni kuduthutten.. once again sorry"
    ],
    page3Paragraphs: [
      "Third year la kjm misunderstanding la nadandhuchu... Oru sila vishayam la enaku therinjuchu..na adha pathila unkita edhuvum solala.. enaku romba hurt agiduchu adha ketu.... Aprm nane realize pana una force pani pesura mari irundhuchu... Sometimes ne reply ye pana matta..but whenever I talk to you, ne natural ah pesuva without any hesitation.. i genuinely liked that about you... Nane unkuda pesa kudathu..una disturb pana kudathu nu irupen.. but sometimes epdiyo therila epayachu Suma edhana random ah pesiduven.. unkuda pesunathula sorry sonadhu dha athigam",
      "Now we are in last year...Unkuda chat la dha pesiruken.. but nerla 1 minutes kuda full ah pesunathu ila... Seri adha unkuda one last time ah pesalam nu kupten...adhuvum na bayandhuttu dha una kupta...first time na yaru kittayum ipdi ketadhum pesunathum illa..na clg la First pesuna girl ne mattum dha...na adha marakave matten...Ne dha busy vara mudiyathu nu sollita...enaku kjm kastama dha irundhuchu.. it's ok that's my luck.. i respected your situation or whatever...... ♡"
    ],
    paragraphs: [],
    buttonText: 'One Last Surprise ✨',
  },

  // Stage 6: The Grand 21st Birthday Celebration
  grandCelebration: {
    heading: 'Happy 21st Birthday, Sreya!',
    subheading: 'You Deserve a Life as Lovely as Your Heart.',
    candlesCount: 21,
    buttonText: 'A Few Words from My Heart 💗',
  },

  // Stage 7: A Final Message from My Heart
  finalHeartMessage: {
    heading: 'Before I End This..♡',
    passage:
      'I don\'t know if I will see you on your next birthday… or maybe we\'ll become strangers with memories .But I’ll never forget you. No matter where life takes us, I’ll always keep you in my memories as someone special. Even if I become just a small chapter in your story, you’ll always remain a beautiful part of mine. I hope your smile never fades and your heart finally finds the peace it deserves.',
    footnote: 'Some memories stay beautiful, even when the future is uncertain.',
  },

  // Legacy mappings preserved for backward compatibility
  specialProposalMoment: {
    teaser: 'Okay... one last little thing 💌',
    mainMessage: "You're one of those people who make ordinary moments feel a little more special. ♡",
    subMessage: 'Today, the spotlight is all yours. Happy 21st Birthday! ✨',
    prompt: 'Press → or tap to unwrap the heartfelt note ♡',
  },

  surprise: {
    centeredMessage: 'How Was the Journey?',
    clickPrompt: 'Tap or click the gift box to open',
    revealMessage: 'Some gifts come wrapped in ribbons. Others come wrapped in a little love, a lot of care, and the hope of making you smile. This little surprise is for you. ♡',
    proceedPrompt: 'A Small Message for You 💌',
    ribbonColor: '#e0a96d',
  },

  birthdayMessage: {
    paragraphs: [
      'To someone who deserves a little extra happiness today,',
      'May your 21st year bring you beautiful surprises, peaceful moments, genuine smiles, and countless reasons to feel proud of the person you are becoming.',
      'May you always find the courage to chase your dreams, the strength to overcome difficult days, and people who appreciate the wonderful person you are.',
      'Never forget that you deserve kindness, happiness, and all the little things that make life beautiful.',
      'Today, I hope you smile a little more, laugh a little louder, and make memories that stay with you for years to come.',
      'Happy 21st Birthday! You deserve a day as lovely as your heart. ♡',
    ],
    buttonText: 'One Last Surprise ✨',
  },

  celebration: {
    paragraphs: [
      'May this new chapter bring you more reasons to smile, more dreams worth chasing, more beautiful memories, and more moments that remind you how special you are.',
      'May life surprise you with happiness in the most unexpected ways. Keep being your wonderful self, keep believing in your dreams, and never stop finding magic in the little things.',
      "Here's to 21, to new beginnings, and to a year filled with love, laughter, and unforgettable moments.",
      'Happy 21st Birthday! ♡',
    ],
    replayText: "A Few Words from My Heart 💗",
    confettiButtonText: 'Shower More Confetti',
  },

  finalReveal: {
    ageNumber: '21',
    message: 'Once again Happy Birthday',
  },

  // Audio / Tamil Song Configuration
  audio: {
    /**
     * INSTRUCTIONS FOR YOUR TAMIL SONG:
     * 1. Place your MP3 file in: /public/audio/birthday-song.mp3
     * 2. (Optional) change the title and artist below.
     * 3. If no file is present yet, our gentle Web Audio chime generator plays automatically!
     */
    src: '/audio/birthday-song.mp3',
    title: 'A Beautiful Melody for Your Special Day',
    artist: 'Special Birthday Tamil Selection',
    promptLabel: 'A little melody for your special day 🎶',
    enableSynthFallback: true,
  },

  // Memory Tab Dedicated Background Music Sequence (f_1_m.mp3 -> f_m_looping.mp3)
  memoryAudio: {
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
    artist: '21st Birthday Theme BGM',
  },

  // 21st Birthday Celebration Loop Audio (bd_looping.mp3 with 1.25s overlap)
  celebrationAudio: {
    src: '/audio/bd_looping.mp3',
    fallbackUrls: [
      '/audios/bd_looping.mp3',
      '/bd_looping.mp3',
    ],
    defaultVolume: 0.7,
    overlapDurationSec: 1.25,
    crossfadeDurationMs: 1250,
    title: '21st Birthday Celebration Loop',
  },

  // Photo Gallery Configuration (Real tactile Polaroid stack)
  /**
   * INSTRUCTIONS FOR REPLACING PHOTOS:
   * Option A (Recommended):
   *   Save your photos into public/images/birthday/ named:
   *   photo-01.jpg, photo-02.jpg, photo-03.jpg ...
   * Option B:
   *   Replace the `url` values below with any image URLs or paths.
   */
  photos: [
    {
      id: 'memory-01',
      url: '/photos/1.jpg',
      caption: 'A quiet moment, a lovely memory ♡',
      shortNote: 'Warm sunlight & gentle focus',
      rotation: -1.8,
      focalPosition: 'center 22%',
      tag: 'Quiet Moments',
      dateOrLocation: 'Pure Joy',
    },
    {
      id: 'memory-02',
      url: '/photos/2.jpg',
      caption: 'Smiles that light up every day ✨',
      shortNote: 'Laughter shared with cherished company',
      rotation: 1.6,
      focalPosition: 'center 24%',
      tag: 'Sunshine',
      dateOrLocation: 'Sweet Smiles',
    },
    {
      id: 'memory-03',
      url: '/photos/3.jpg',
      caption: 'Grace, laughter & sweet college days 🌸',
      shortNote: 'Festive vibes & cherished classrooms',
      rotation: -1.2,
      focalPosition: 'center 20%',
      tag: 'Golden Days',
      dateOrLocation: 'Memories',
    },
    {
      id: 'memory-04',
      url: '/photos/4.jpg',
      caption: 'Little candid moments worth keeping ♡',
      shortNote: 'Sweet smiles and simple joy',
      rotation: 2.1,
      focalPosition: 'center 20%',
      tag: 'Candid Joy',
      dateOrLocation: 'Lovely Days',
    },
    {
      id: 'memory-05',
      url: '/photos/5.jpg',
      caption: 'Chasing waterfalls & peaceful days 🌿',
      shortNote: 'Fresh breezes & quiet serenity',
      rotation: -1.6,
      focalPosition: 'center 22%',
      tag: 'Adventures',
      dateOrLocation: 'Peaceful Moments',
    },
    {
      id: 'memory-06',
      url: '/photos/6.jpg',
      caption: 'A warm heart and a gentle smile ✨',
      shortNote: 'Radiance that brightens any room',
      rotation: 1.4,
      focalPosition: 'center 24%',
      tag: 'Kindness',
      dateOrLocation: 'Everyday Magic',
    },
    {
      id: 'memory-07',
      url: '/photos/7.jpg',
      caption: 'Pure elegance and golden grace 💛',
      shortNote: 'A special day draped in tradition',
      rotation: -2.0,
      focalPosition: 'center 20%',
      tag: 'Elegance',
      dateOrLocation: 'Celebration',
    },
    {
      id: 'memory-08',
      url: '/photos/8.jpg',
      caption: 'A gentle smile that brightens any room ✨',
      shortNote: 'Radiance, warmth & heartfelt grace',
      rotation: -1.2,
      focalPosition: 'center 20%',
      tag: 'Radiance',
      dateOrLocation: 'Pure Radiance',
    },
    {
      id: 'memory-09',
      url: '/photos/9.jpg',
      caption: 'Lost in stories & bookstore afternoons 📚',
      shortNote: 'Quiet shelves & thoughtful dreams',
      rotation: 1.5,
      focalPosition: 'center 15%',
      tag: 'Stories',
      dateOrLocation: 'Cozy Corners',
    },
    {
      id: 'memory-10',
      url: '/photos/10.jpg',
      caption: 'The legendary lecture power nap! 😴✨',
      shortNote: 'Because genius minds need beauty rest',
      rotation: -1.4,
      focalPosition: 'center 30%',
      tag: 'Pure Relatable',
      dateOrLocation: 'College Life',
    },
    {
      id: 'memory-11',
      url: '/photos/11.jpg',
      caption: 'Tiny paws, unconditional love 🐾♡',
      shortNote: 'A gentle hold that says it all',
      rotation: 1.8,
      focalPosition: 'center 45%',
      tag: 'Best Friends',
      dateOrLocation: 'Pure Love',
    },
    {
      id: 'memory-12',
      url: '/photos/12.jpg',
      caption: 'Pure happiness with her favorite buddy! 🐶💖',
      shortNote: 'A milestone hug for the sweetest 21st birthday',
      rotation: -1.0,
      focalPosition: 'center 32%',
      tag: 'Unconditional Joy',
      dateOrLocation: 'Chapter 21',
      isSpecial: true,
    },
  ],
};
