import fs from 'fs';
import path from 'path';

console.log('=== VERIFYING COMPLETE REMOVAL OF SLIDE NAVIGATION INDICATOR ===\n');

// 1. Verify App.tsx
const appContent = fs.readFileSync(path.resolve('src', 'App.tsx'), 'utf-8');

if (appContent.includes('<StageIndicator')) {
  console.error('FAIL: App.tsx still renders <StageIndicator />!');
  process.exit(1);
}
console.log('✓ App.tsx does not render StageIndicator');

if (appContent.includes("from './components/StageIndicator'")) {
  console.error('FAIL: App.tsx still imports StageIndicator!');
  process.exit(1);
}
console.log('✓ App.tsx does not import StageIndicator');

// 2. Verify StageIndicator.tsx returns null without DOM or styles
const indicatorContent = fs.readFileSync(path.resolve('src', 'components', 'StageIndicator.tsx'), 'utf-8');

if (indicatorContent.includes('<nav') || indicatorContent.includes('indicator-pill') || indicatorContent.includes('stage-dot-btn')) {
  console.error('FAIL: StageIndicator.tsx still contains navigation HTML or styles!');
  process.exit(1);
}
if (!indicatorContent.includes('return null;')) {
  console.error('FAIL: StageIndicator.tsx does not return null!');
  process.exit(1);
}
console.log('✓ StageIndicator component returns null without any HTML or styles');

// 3. Verify all 7 slides and navigation order preserved in App.tsx
const expectedStages = [
  'invitation',
  'age-reveal',
  'gallery',
  'surprise-gift',
  'birthday-message',
  'celebration',
  'final-reveal'
];

for (const stage of expectedStages) {
  if (!appContent.includes(`currentStage === '${stage}'`)) {
    console.error(`FAIL: Stage '${stage}' is missing from App.tsx rendering!`);
    process.exit(1);
  }
}
console.log('✓ All 7 slides are properly rendered in App.tsx');

// 4. Verify slide progression triggers
const expectedTransitions = [
  "onProceed={handleStartExperience}",
  "onProceed={() => safeSetStage('gallery')}",
  "onProceed={() => safeSetStage('surprise-gift')}",
  "onProceed={() => safeSetStage('birthday-message')}",
  "onProceed={() => safeSetStage('celebration')}",
  "onProceedToFinal={() => safeSetStage('final-reveal')}",
  "onReplay"
];

for (const trigger of expectedTransitions) {
  if (!appContent.includes(trigger)) {
    console.error(`FAIL: Missing navigation transition trigger: ${trigger}`);
    process.exit(1);
  }
}
console.log('✓ All slide-to-slide progression buttons and handlers remain 100% intact');

console.log('\n=== ALL SLIDE NAVIGATION INDICATOR REMOVAL CHECKS PASSED ===');
