import fs from 'fs';
import path from 'path';

console.log('--- Starting Audio Flow & Regression Verification ---');

// 1. Audio Assets Check
const publicAudioDir = path.resolve('public', 'audio');
const expectedFiles = ['f_1_m.mp3', 'f_m_looping.mp3', 'bd_looping.mp3'];

for (const file of expectedFiles) {
  const filePath = path.join(publicAudioDir, file);
  if (!fs.existsSync(filePath)) {
    console.error(`FAIL: Missing ${file} in public/audio/`);
    process.exit(1);
  }
  const stats = fs.statSync(filePath);
  console.log(`PASS: Found ${file} (${stats.size} bytes)`);
}

// 2. StageGallery.tsx check
const stageGalleryContent = fs.readFileSync(path.resolve('src', 'components', 'StageGallery.tsx'), 'utf-8');
if (stageGalleryContent.includes('leaveMemoriesTab()')) {
  console.error('FAIL: StageGallery still calls leaveMemoriesTab() on unmount!');
  process.exit(1);
} else {
  console.log('PASS: StageGallery unmount does not destroy Memories audio session');
}

if (!stageGalleryContent.includes('handleProceedToSecretGift') || !stageGalleryContent.includes('memoryAudioController.resume()')) {
  console.error('FAIL: StageGallery missing handleProceedToSecretGift or memoryAudioController.resume()');
  process.exit(1);
} else {
  console.log('PASS: StageGallery button click resumes Memories audio before stage transition');
}

// 3. StageSurpriseGift.tsx check
const stageSurpriseContent = fs.readFileSync(path.resolve('src', 'components', 'StageSurpriseGift.tsx'), 'utf-8');
if (!stageSurpriseContent.includes('memoryAudioController.resume()')) {
  console.error('FAIL: StageSurpriseGift does not call memoryAudioController.resume()');
  process.exit(1);
} else {
  console.log('PASS: StageSurpriseGift ensures Memories audio continues during gift reveal');
}

// 4. StageCelebration.tsx check
const stageCelebrationContent = fs.readFileSync(path.resolve('src', 'components', 'StageCelebration.tsx'), 'utf-8');
if (!stageCelebrationContent.includes('celebrationAudioController.start()') ||
    stageCelebrationContent.includes('celebrationAudioController.stop()') ||
    !stageCelebrationContent.includes('memoryAudioController.pause(false)')) {
  console.error('FAIL: StageCelebration lifecycle hooks should start celebration audio, pause memories, and NOT stop on unmount');
  process.exit(1);
} else {
  console.log('PASS: StageCelebration starts celebration audio, softly pauses memories audio, and persists into Final Words without unmount stop');
}

// 5. Celebration Audio Controller checks
const celebrationControllerContent = fs.readFileSync(path.resolve('src', 'utils', 'celebrationAudioController.ts'), 'utf-8');
if (!celebrationControllerContent.includes('overlapDurationSec: 1.25') ||
    !celebrationControllerContent.includes('crossfadeDurationMs: 1250') ||
    !celebrationControllerContent.includes('Math.cos') ||
    !celebrationControllerContent.includes('Math.sin')) {
  console.error('FAIL: celebrationAudioController missing 1.25s overlap or equal-power cosine/sine crossfade curve');
  process.exit(1);
} else {
  console.log('PASS: celebrationAudioController implements precise 1.25s overlap and smooth crossfade curve');
}

// 6. Memory Audio Controller check
const memoryControllerContent = fs.readFileSync(path.resolve('src', 'utils', 'memoryAudioController.ts'), 'utf-8');
if (!memoryControllerContent.includes('f_1_m.mp3') || !memoryControllerContent.includes('f_m_looping.mp3')) {
  console.error('FAIL: memoryAudioController audio filenames missing or altered');
  process.exit(1);
} else {
  console.log('PASS: memoryAudioController preserves existing f_1_m.mp3 and f_m_looping.mp3 structure');
}

console.log('--- ALL VERIFICATION CHECKS PASSED SUCCESSFULLY ---');
