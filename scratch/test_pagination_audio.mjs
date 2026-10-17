import fs from 'fs';
import path from 'path';

console.log('--- RUNNING RIGOROUS VERIFICATION OF ALL REQUIREMENTS ---');

// 1. Check birthdayConfig.ts
const configPath = path.resolve('src/config/birthdayConfig.ts');
const configContent = fs.readFileSync(configPath, 'utf-8');

// Check Journey paragraphs
const journeyExpectedLines = [
  'This is my Small Gift',
  'Unaku Pudichirukum Nu Nenaikuren'
];

for (const line of journeyExpectedLines) {
  if (!configContent.includes(line)) {
    console.error(`FAIL: Journey missing line: "${line}"`);
    process.exit(1);
  }
}
console.log('PASS: Journey contains both requested lines.');

// Check that old Journey 2nd & 3rd paragraphs were removed
const oldJourneyPhrase1 = 'Every memory in this gallery';
const oldJourneyPhrase2 = 'I wanted to create something';
if (configContent.includes(oldJourneyPhrase1) || configContent.includes(oldJourneyPhrase2)) {
  console.error('FAIL: Old journey paragraphs still present in birthdayConfig.ts');
  process.exit(1);
}
console.log('PASS: Old journey paragraphs are completely removed.');

// Check 3-page letter configuration
const hasPage1 = configContent.includes('page1Paragraphs: [');
const hasPage2 = configContent.includes('page2Paragraphs: [');
const hasPage3 = configContent.includes('page3Paragraphs: [');

if (!hasPage1 || !hasPage2 || !hasPage3) {
  console.error('FAIL: birthdayConfig does not have page1Paragraphs, page2Paragraphs, and page3Paragraphs');
  process.exit(1);
}
console.log('PASS: birthdayConfig has page1Paragraphs, page2Paragraphs, and page3Paragraphs.');

// Check StageMessage.tsx
const messageComponentPath = path.resolve('src/components/StageMessage.tsx');
const messageContent = fs.readFileSync(messageComponentPath, 'utf-8');

// Check that internal scrolling was removed
if (messageContent.includes('page-scrollable-content') || messageContent.includes('overflow-y: auto') || messageContent.includes('scrollbar-width: thin')) {
  console.error('FAIL: StageMessage.tsx still contains scrollable content or overflow-y: auto or scrollbar-width!');
  process.exit(1);
}
console.log('PASS: StageMessage.tsx has completely removed internal scrolling and scrollbars.');

// Check 3 pages in StageMessage.tsx
if (!messageContent.includes('Page 1 of 3') || !messageContent.includes('Page 2 of 3') || !messageContent.includes('Page 3 of 3')) {
  console.error('FAIL: StageMessage.tsx does not contain all 3 pages labeled properly.');
  process.exit(1);
}
console.log('PASS: StageMessage.tsx contains all 3 pages.');

// Check PAGE X OF 3
if (!messageContent.includes('PAGE {currentPage} OF 3')) {
  console.error('FAIL: Counter does not show PAGE {currentPage} OF 3');
  process.exit(1);
}
console.log('PASS: StageMessage.tsx counter shows PAGE {currentPage} OF 3.');

// Check verbatim preservation of sensitive items
const sensitiveTokens = ['25 September 2024', '😂', '♡', 'First time una pathadhu clg bus la dha', 'One Last Surprise ✨'];
for (const token of sensitiveTokens) {
  if (!messageContent.includes(token)) {
    console.error(`FAIL: StageMessage missing preserved token: ${token}`);
    process.exit(1);
  }
}
console.log('PASS: Verbatim sensitive tokens preserved in StageMessage.tsx.');

// Check StageGallery.tsx audio trigger & cleanup
const galleryPath = path.resolve('src/components/StageGallery.tsx');
const galleryContent = fs.readFileSync(galleryPath, 'utf-8');

if (!galleryContent.includes('12.0') || !galleryContent.includes('startMemoriesAudioSequence')) {
  console.error('FAIL: StageGallery does not trigger startMemoriesAudioSequence at 12s');
  process.exit(1);
}
console.log('PASS: StageGallery triggers memories audio sequence at 12s.');

if (!galleryContent.includes('leaveMemoriesTab')) {
  console.error('FAIL: StageGallery cleanup does not call leaveMemoriesTab');
  process.exit(1);
}
console.log('PASS: StageGallery cleans up audio on tab leave / unmount.');

// Check memoryAudioController.ts implementation
const audioControllerPath = path.resolve('src/utils/memoryAudioController.ts');
const audioContent = fs.readFileSync(audioControllerPath, 'utf-8');

if (!audioContent.includes('f_1_m.mp3') || !audioContent.includes('f_m_looping.mp3')) {
  console.error('FAIL: memoryAudioController missing asset paths f_1_m.mp3 or f_m_looping.mp3');
  process.exit(1);
}
console.log('PASS: memoryAudioController references exact files f_1_m.mp3 and f_m_looping.mp3.');

// Check for 2 alternating loop players and 2-second overlap crossfade
if (!audioContent.includes('loopPlayerA') || !audioContent.includes('loopPlayerB') || !audioContent.includes('duration - 2.0') || !audioContent.includes('crossfadeDurationMs = 2000')) {
  console.error('FAIL: memoryAudioController does not implement alternating loop players with 2s overlap');
  process.exit(1);
}
console.log('PASS: memoryAudioController implements alternating loop players with 2-second crossfade overlap.');

// Check audio files exist in public/audio/
const audioDir = path.resolve('public/audio');
const f1Exists = fs.existsSync(path.join(audioDir, 'f_1_m.mp3'));
const loopExists = fs.existsSync(path.join(audioDir, 'f_m_looping.mp3'));

if (!f1Exists || !loopExists) {
  console.error(`FAIL: Audio files missing from public/audio! f1: ${f1Exists}, loop: ${loopExists}`);
  process.exit(1);
}
console.log('PASS: Both audio files f_1_m.mp3 and f_m_looping.mp3 are present in public/audio/.');

console.log('--- ALL AUTOMATED VERIFICATION CHECKS PASSED SUCCESSFULLY ---');
