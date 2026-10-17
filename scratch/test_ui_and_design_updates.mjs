import fs from 'fs';
import path from 'path';

console.log('--- Starting Comprehensive Verification of UI & Design Updates ---');

// 1. Check "Open Your Gift" button in StageAgeReveal.tsx
const ageRevealContent = fs.readFileSync(path.resolve('src', 'components', 'StageAgeReveal.tsx'), 'utf-8');
const openGiftBtnMatch = ageRevealContent.match(/<button[^>]*className="[^"]*gift-open-btn[^"]*"[^>]*>([\s\S]*?)<\/button>/);

if (!openGiftBtnMatch) {
  console.error('FAIL: Could not locate gift-open-btn in StageAgeReveal.tsx');
  process.exit(1);
}
if (openGiftBtnMatch[1].includes('Sparkles')) {
  console.error('FAIL: gift-open-btn still contains Sparkles icon!');
  process.exit(1);
}
if (!openGiftBtnMatch[1].includes('Open Your Gift')) {
  console.error('FAIL: gift-open-btn missing text "Open Your Gift"!');
  process.exit(1);
}
console.log('PASS: "Open Your Gift" button has no AI icon and preserves exact button text');

// 2A. Check "View Memories" button in StageGallery.tsx
const galleryContent = fs.readFileSync(path.resolve('src', 'components', 'StageGallery.tsx'), 'utf-8');
if (galleryContent.includes('View Memories') || galleryContent.includes('train-skip-intro-btn')) {
  console.error('FAIL: "View Memories" button still present in StageGallery.tsx!');
  process.exit(1);
}
console.log('PASS: "View Memories" skip button completely removed from StageGallery.tsx');

// 2B. Check heading "Cinematic Train Journey · Memory Wall" in StageGallery.tsx
const headingPillMatch = galleryContent.match(/<div className="memory-badge-pill">([\s\S]*?)<\/div>/);
if (!headingPillMatch) {
  console.error('FAIL: memory-badge-pill not found in StageGallery.tsx');
  process.exit(1);
}
if (headingPillMatch[1].includes('Sparkles')) {
  console.error('FAIL: memory-badge-pill heading still contains Sparkles icon!');
  process.exit(1);
}
if (!headingPillMatch[1].includes('Cinematic Train Journey · Memory Wall')) {
  console.error('FAIL: memory-badge-pill heading text missing or altered!');
  process.exit(1);
}
console.log('PASS: "Cinematic Train Journey · Memory Wall" has no AI symbol and preserves exact text');

// 2C. Check 11th photo birthday message in StageGallery.tsx
const finaleBannerMatch = galleryContent.match(/<aside className="special-camera-banner"[^>]*>([\s\S]*?)<\/aside>/);
if (!finaleBannerMatch) {
  console.error('FAIL: special-camera-banner not found in StageGallery.tsx');
  process.exit(1);
}
if (finaleBannerMatch[1].includes('Sparkles')) {
  console.error('FAIL: special-camera-banner still contains Sparkles icon!');
  process.exit(1);
}
if (!finaleBannerMatch[1].includes("Here's to more beautiful memories. Happy 21st Birthday! ✨")) {
  console.error('FAIL: special-camera-banner quote text missing or altered!');
  process.exit(1);
}
console.log('PASS: 11th photo message has no AI symbol and preserves exact quote');

// 3. Check "One Last Surprise" button in StageMessage.tsx
const messageContent = fs.readFileSync(path.resolve('src', 'components', 'StageMessage.tsx'), 'utf-8');
const proceedSurpriseBtnMatch = messageContent.match(/<button[^>]*className="[^"]*proceed-surprise-btn[^"]*"[^>]*>([\s\S]*?)<\/button>/);
if (!proceedSurpriseBtnMatch) {
  console.error('FAIL: proceed-surprise-btn not found in StageMessage.tsx');
  process.exit(1);
}
if (proceedSurpriseBtnMatch[1].includes('Sparkles')) {
  console.error('FAIL: proceed-surprise-btn still contains Sparkles icon!');
  process.exit(1);
}
if (!proceedSurpriseBtnMatch[1].includes('{buttonText}')) {
  console.error('FAIL: proceed-surprise-btn missing buttonText!');
  process.exit(1);
}
if (!messageContent.includes('One Last Surprise ✨')) {
  console.error('FAIL: buttonText does not contain "One Last Surprise ✨" with Shine emoji!');
  process.exit(1);
}
console.log('PASS: "One Last Surprise" button has no AI symbol and retains ✨ Shine emoji');

// 4A. Check Final Words title
const finalRevealContent = fs.readFileSync(path.resolve('src', 'components', 'StageFinalReveal.tsx'), 'utf-8');
const configContent = fs.readFileSync(path.resolve('src', 'config', 'birthdayConfig.ts'), 'utf-8');

if (!finalRevealContent.includes('Before I End This..♡') || !configContent.includes('heading: \'Before I End This..♡\'')) {
  console.error('FAIL: Final Words title does not match "Before I End This..♡"!');
  process.exit(1);
}
if (finalRevealContent.includes('Sparkles')) {
  console.error('FAIL: StageFinalReveal still imports or contains Sparkles icon!');
  process.exit(1);
}
console.log('PASS: Final Words title exactly matches "Before I End This..♡" without AI icons');

// 4B. Check exact final passage preservation
const expectedPassage = "I don't know if I will see you on your next birthday… or maybe we'll become strangers with memories .But I’ll never forget you. No matter where life takes us, I’ll always keep you in my memories as someone special. Even if I become just a small chapter in your story, you’ll always remain a beautiful part of mine. I hope your smile never fades and your heart finally finds the peace it deserves.";

if (!finalRevealContent.includes(expectedPassage)) {
  console.error('FAIL: Final passage text altered in StageFinalReveal.tsx!');
  process.exit(1);
}
console.log('PASS: Final passage preserved 100% identically word-for-word');

// 4C. Check audio controller and continuity
if (!finalRevealContent.includes('celebrationAudioController')) {
  console.error('FAIL: StageFinalReveal missing celebrationAudioController!');
  process.exit(1);
}
console.log('PASS: Final Words maintains audio continuity via celebrationAudioController');

console.log('--- ALL VERIFICATION TESTS PASSED SUCCESSFULLY ---');
