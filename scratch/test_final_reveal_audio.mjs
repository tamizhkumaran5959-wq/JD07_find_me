import fs from 'fs';
import path from 'path';

console.log('--- Verifying Final Words Audio Continuity ---');

// 1. App.tsx check
const appCode = fs.readFileSync(path.resolve('src', 'App.tsx'), 'utf-8');

if (!appCode.includes("const celebrationDomainStages: BirthdayStage[] = ['celebration', 'final-reveal'];")) {
  console.error('FAIL: celebrationDomainStages missing from App.tsx');
  process.exit(1);
} else {
  console.log('PASS: App.tsx groups celebration and final-reveal into a single persistent audio domain');
}

if (!appCode.includes('celebrationAudioController.stop();\n              memoryAudioController.reset();')) {
  console.error('FAIL: onReplay does not stop celebration audio on reset to invitation');
  process.exit(1);
} else {
  console.log('PASS: onReplay properly cleans up celebration audio when resetting to invitation');
}

// 2. StageCelebration.tsx check
const celebrationCode = fs.readFileSync(path.resolve('src', 'components', 'StageCelebration.tsx'), 'utf-8');

if (celebrationCode.includes('celebrationAudioController.stop()')) {
  console.error('FAIL: StageCelebration still stops celebration audio on unmount!');
  process.exit(1);
} else {
  console.log('PASS: StageCelebration does NOT stop audio on unmount');
}

// 3. AudioPlayer.tsx check
const audioPlayerCode = fs.readFileSync(path.resolve('src', 'components', 'AudioPlayer.tsx'), 'utf-8');

if (!audioPlayerCode.includes("currentStage === 'celebration' || currentStage === 'final-reveal'")) {
  console.error('FAIL: AudioPlayer does not recognize final-reveal as celebration audio stage');
  process.exit(1);
} else {
  console.log('PASS: AudioPlayer recognizes final-reveal as celebration audio stage');
}

// 4. StageFinalReveal.tsx check
const finalRevealCode = fs.readFileSync(path.resolve('src', 'components', 'StageFinalReveal.tsx'), 'utf-8');

if (!finalRevealCode.includes('celebrationAudioController')) {
  console.error('FAIL: StageFinalReveal missing celebrationAudioController');
  process.exit(1);
} else {
  console.log('PASS: StageFinalReveal properly handles celebrationAudioController');
}

// Check passage preservation
const expectedPassage = "I don't know if I will see you on your next birthday… or maybe we'll become strangers with memories .But I’ll never forget you. No matter where life takes us, I’ll always keep you in my memories as someone special. Even if I become just a small chapter in your story, you’ll always remain a beautiful part of mine. I hope your smile never fades and your heart finally finds the peace it deserves.";
if (!finalRevealCode.includes(expectedPassage)) {
  console.error('FAIL: Final passage text modified or altered!');
  process.exit(1);
} else {
  console.log('PASS: Final passage text remains 100% exact and preserved');
}

console.log('--- ALL FINAL WORDS AUDIO CHECKS PASSED ---');
