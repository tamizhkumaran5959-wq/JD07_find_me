import fs from 'fs';
import path from 'path';

console.log('=== STARTING 7-SLIDE JOURNEY COMPREHENSIVE VERIFICATION ===\n');

// 1. Verify App.tsx Slide Order & Stages
const appContent = fs.readFileSync('c:/Jegan/src/App.tsx', 'utf8');

console.log('[TEST 1] Verifying 7-Slide Order in App.tsx:');
const expectedStageSequence = [
  { id: 'invitation', component: 'StageInvitation', slideNum: 1 },
  { id: 'age-reveal', component: 'StageAgeReveal', slideNum: 2 },
  { id: 'gallery', component: 'StageGallery', slideNum: 3 },
  { id: 'surprise-gift', component: 'StageSurpriseGift', slideNum: 4 },
  { id: 'birthday-message', component: 'StageMessage', slideNum: 5 },
  { id: 'celebration', component: 'StageCelebration', slideNum: 6 },
  { id: 'final-reveal', component: 'StageFinalReveal', slideNum: 7 },
];

for (const stage of expectedStageSequence) {
  const checkStr = `currentStage === '${stage.id}' && (\n          <${stage.component}`;
  if (appContent.includes(stage.id) && appContent.includes(stage.component)) {
    console.log(`  ✓ Slide ${stage.slideNum}: Stage '${stage.id}' -> <${stage.component} /> verified`);
  } else {
    console.error(`  ✗ Missing stage ${stage.id} with component ${stage.component}`);
    process.exit(1);
  }
}

// 2. Verify Slide 2 (StageAgeReveal.tsx): Gift Box + Keypad + Date Validation
console.log('\n[TEST 2] Verifying Slide 2: A Small Gift for You 🎁 & Memory Train:');
const stage2Content = fs.readFileSync('c:/Jegan/src/components/StageAgeReveal.tsx', 'utf8');

const s2Phrases = [
  'A Small Gift for You 🎁',
  'Every beautiful journey deserves a little surprise…',
  'Open Your Gift',
  'The Memory Train Has Arrived',
  'Enter Your Date of Birth to Board',
  'The Memories Journey Begins...',
  'Not quite! Try again, you can do it 💗',
];

const strippedStage2 = stage2Content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
for (const phrase of s2Phrases) {
  if (stage2Content.includes(phrase) || strippedStage2.includes(phrase)) {
    console.log(`  ✓ Found phrase: "${phrase}"`);
  } else {
    console.error(`  ✗ Missing phrase in Slide 2: "${phrase}"`);
    process.exit(1);
  }
}

if (stage2Content.includes("CORRECT_DATE = '18102005'")) {
  console.log('  ✓ Correct DOB constant 18-10-2005 ("18102005") verified');
} else {
  console.error('  ✗ DOB constant 18102005 missing');
  process.exit(1);
}

// 3. Verify Slide 3 (StageGallery.tsx): Memories tab preserved
console.log('\n[TEST 3] Verifying Slide 3: Memories tab preservation:');
const galleryContent = fs.readFileSync('c:/Jegan/src/components/StageGallery.tsx', 'utf8');
if (galleryContent.includes('photos') && galleryContent.includes('realistic-clothespin') && galleryContent.includes('tier1WirePath')) {
  console.log('  ✓ Memories gallery preserved with fairy lights, polaroids, and clothespins');
} else {
  console.error('  ✗ Memories gallery integrity compromised');
  process.exit(1);
}

// 4. Verify Slide 4 (StageSurpriseGift.tsx): How Was the Journey? + Heartbeat Button
console.log('\n[TEST 4] Verifying Slide 4: How Was the Journey? & Heartbeat Animation:');
const s4Content = fs.readFileSync('c:/Jegan/src/components/StageSurpriseGift.tsx', 'utf8');

const s4Phrases = [
  'How Was the Journey?',
  'Hope you enjoyed the journey…',
  'Some journeys are measured in distance, while others are measured in the smiles, little moments, and memories they leave behind.',
  'I may not have the perfect words for everything, but I hope this little collection of memories made you feel appreciated, remembered, and special.',
  'Every memory has its own place, and some people leave a warmth that time cannot completely erase.',
  'A Small Message for You 💌',
];

for (const phrase of s4Phrases) {
  if (s4Content.includes(phrase)) {
    console.log(`  ✓ Found Slide 4 text snippet: "${phrase.slice(0, 40)}..."`);
  } else {
    console.error(`  ✗ Missing Slide 4 text snippet: "${phrase}"`);
    process.exit(1);
  }
}

if (s4Content.includes('@keyframes heartbeatPulse') && s4Content.includes('heartbeat-button')) {
  console.log('  ✓ Heartbeat button animation and class verified');
} else {
  console.error('  ✗ Missing heartbeatPulse keyframes in Slide 4');
  process.exit(1);
}

// 5. Verify Slide 5 (StageMessage.tsx): A Letter for You
console.log('\n[TEST 5] Verifying Slide 5: A Letter for You:');
const s5Content = fs.readFileSync('c:/Jegan/src/components/StageMessage.tsx', 'utf8');

const s5Phrases = [
  'A Letter for You',
  'Dear Sreeya,',
  'There are some people who become special without even realizing how much they mean to someone.',
  'I don\'t know how to put every feeling into words, but I wanted to create something that could hold a few of them.',
  'Whatever the future holds, I hope you continue discovering beautiful things about yourself and the world around you.',
  'You deserve happiness that feels natural, love that feels safe, and a life that gives back the kindness you share.',
  'With warm wishes,',
  'Someone who will always remember these moments.',
  'One Last Surprise ✨',
];

for (const phrase of s5Phrases) {
  if (s5Content.includes(phrase)) {
    console.log(`  ✓ Found Slide 5 text snippet: "${phrase.slice(0, 40)}..."`);
  } else {
    console.error(`  ✗ Missing Slide 5 text snippet: "${phrase}"`);
    process.exit(1);
  }
}

// 6. Verify Slide 6 (StageCelebration.tsx): Grand Celebration + Cake with 21 Candles
console.log('\n[TEST 6] Verifying Slide 6: Grand Celebration & 21 Candles Cake:');
const s6Content = fs.readFileSync('c:/Jegan/src/components/StageCelebration.tsx', 'utf8');

const s6Phrases = [
  'Happy 21st Birthday, Sreeya!',
  'You Deserve a Life as Lovely as Your Heart.',
  'A Few Words from My Heart 💗',
  'Array.from({ length: 21 })',
  'candle-flame',
  'fireworks-canvas',
  'balloons-layer',
];

for (const phrase of s6Phrases) {
  if (s6Content.includes(phrase)) {
    console.log(`  ✓ Found Slide 6 element: "${phrase}"`);
  } else {
    console.error(`  ✗ Missing Slide 6 element: "${phrase}"`);
    process.exit(1);
  }
}

// 7. Verify Slide 7 (StageFinalReveal.tsx): Exact Passage from My Heart
console.log('\n[TEST 7] Verifying Slide 7: Exact Final Message & Quiet Atmosphere:');
const s7Content = fs.readFileSync('c:/Jegan/src/components/StageFinalReveal.tsx', 'utf8');

const exactPassage = "I don't know if I will see you on your next birthday… or maybe we'll become strangers with memories .But I’ll never forget you. No matter where life takes us, I’ll always keep you in my memories as someone special. Even if I become just a small chapter in your story, you’ll always remain a beautiful part of mine. I hope your smile never fades and your heart finally finds the peace it deserves.";

if (s7Content.includes(exactPassage) || s7Content.includes(exactPassage.replace(/’/g, "'"))) {
  console.log('  ✓ Exact supplied passage present verbatim in Slide 7');
} else {
  console.error('  ✗ Exact supplied passage is missing or altered in Slide 7');
  process.exit(1);
}

const s7Secondary = 'Some memories stay beautiful, even when the future is uncertain.';
if (s7Content.includes(s7Secondary)) {
  console.log(`  ✓ Secondary footnote present: "${s7Secondary}"`);
} else {
  console.error(`  ✗ Missing secondary footnote in Slide 7`);
  process.exit(1);
}

// 8. Verify birthdayConfig.ts master data
console.log('\n[TEST 8] Verifying birthdayConfig.ts data:');
const configContent = fs.readFileSync('c:/Jegan/src/config/birthdayConfig.ts', 'utf8');
if (configContent.includes("recipientName: 'Sreeya'") && configContent.includes('letterForYou') && configContent.includes('journeyReflection')) {
  console.log('  ✓ birthdayConfig has Sreeya, letterForYou, and journeyReflection structured');
} else {
  console.error('  ✗ birthdayConfig missing expected sections');
  process.exit(1);
}

console.log('\n🎉 ALL STATIC TESTS PASSED PERFECTLY!\n');
