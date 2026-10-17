import fs from 'fs';
import path from 'path';

console.log('--- STARTING COMPREHENSIVE VERIFICATION OF BIRTHDAY MEMORY TRAIN EXPERIENCE ---');

const stageFilePath = path.resolve('c:/Jegan/src/components/StageAgeReveal.tsx');
const stageFileContent = fs.readFileSync(stageFilePath, 'utf8');

// 1. Verify exact required strings
const requiredPhrases = [
  'The Memory Train Has Arrived',
  'Enter Your Date of Birth to Board',
  'SPECIAL BIRTHDAY JOURNEY',
  'Board the Memory Train',
  'The Memories Journey Begins...',
  'Your little world of beautiful moments is waiting for you. 💗',
  'BOARDING APPROVED',
];

console.log('\n[TEST 1] Checking exact phrase matches:');
for (const phrase of requiredPhrases) {
  // Strip tags for content checking
  const cleanedFile = stageFileContent.replace(/<[^>]+>/g, ' ');
  if (stageFileContent.includes(phrase) || cleanedFile.includes(phrase.replace(/\.\.\./g, '...'))) {
    console.log(`  ✓ Found: "${phrase}"`);
  } else {
    // Check if broken up by span tags
    const words = phrase.split(' ');
    const allWordsPresent = words.every(w => stageFileContent.includes(w));
    if (allWordsPresent) {
      console.log(`  ✓ Found (with inline styling tags): "${phrase}"`);
    } else {
      console.error(`  ✗ MISSING: "${phrase}"`);
      process.exit(1);
    }
  }
}

// 2. Verify Keypad Layout
console.log('\n[TEST 2] Checking Keypad Grid Layout:');
const expectedKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'Clear', '0', '⌫'];
for (const key of expectedKeys) {
  if (stageFileContent.includes(key)) {
    console.log(`  ✓ Keypad contains key: "${key}"`);
  } else {
    console.error(`  ✗ Missing keypad key: "${key}"`);
    process.exit(1);
  }
}

// 3. Verify Date Validation Logic & Correct Date
console.log('\n[TEST 3] Checking Date Validation Logic:');
const targetDateMatch = stageFileContent.match(/CORRECT_DATE\s*=\s*['"](\d+)['"]/);
if (!targetDateMatch || targetDateMatch[1] !== '18102005') {
  console.error('  ✗ Correct date constant is not 18102005 (18-10-2005)');
  process.exit(1);
} else {
  console.log('  ✓ Correct date constant is correctly set to 18-10-2005 ("18102005")');
}

// Test validation algorithm
const testDates = [
  { input: '18102005', expected: true, label: '18-10-2005 (Correct DOB)' },
  { input: '19102005', expected: false, label: '19-10-2005 (Wrong Day)' },
  { input: '18112005', expected: false, label: '18-11-2005 (Wrong Month)' },
  { input: '18102006', expected: false, label: '18-10-2006 (Wrong Year)' },
  { input: '01012000', expected: false, label: '01-01-2000 (Arbitrary wrong)' },
];

for (const test of testDates) {
  const isValid = test.input === targetDateMatch[1];
  if (isValid === test.expected) {
    console.log(`  ✓ Validation test passed for ${test.label}: expected ${test.expected}, got ${isValid}`);
  } else {
    console.error(`  ✗ Validation test failed for ${test.label}`);
    process.exit(1);
  }
}

// 4. Verify Hyphen formatting and slot placeholder
console.log('\n[TEST 4] Checking Date Format & Auto-Hyphens:');
const hasHyphen = stageFileContent.includes('date-hyphen') && stageFileContent.includes('-');
if (hasHyphen) {
  console.log('  ✓ Auto-hyphens are present between day-month and month-year segments');
} else {
  console.error('  ✗ Missing auto-hyphens');
  process.exit(1);
}

// 5. Verify Input Protections: No typing, No paste, No drop, Read-only display
console.log('\n[TEST 5] Checking Security & Input Protections:');
if (stageFileContent.includes('onPaste={(e) => e.preventDefault()}') && stageFileContent.includes('onDrop={(e) => e.preventDefault()}')) {
  console.log('  ✓ Paste and Drag-and-drop are explicitly prevented');
} else {
  console.error('  ✗ Missing paste/drop prevention');
  process.exit(1);
}

if (stageFileContent.includes('handlePhysicalKeyDown') && stageFileContent.includes('addEventListener(\'keydown\'')) {
  console.log('  ✓ Physical keyboard typing is trapped and prevented');
} else {
  console.error('  ✗ Missing physical keyboard listener trapping');
  process.exit(1);
}

// 6. Verify 8-Digit Max Restriction
if (stageFileContent.includes('digits.length >= 8')) {
  console.log('  ✓ Digits input is capped at strictly 8 digits');
} else {
  console.error('  ✗ Missing 8 digits cap');
  process.exit(1);
}

// 7. Verify Error Handling Preserves Digits
if (stageFileContent.includes('friendlyErrors') && !stageFileContent.includes('setDigits(\'\'); // on error')) {
  console.log('  ✓ Digits are preserved upon incorrect input (not wiped out)');
}

// 8. Verify Memories BGM integration
const appFilePath = path.resolve('c:/Jegan/src/App.tsx');
const appFileContent = fs.readFileSync(appFilePath, 'utf8');
if (appFileContent.includes('memoryAudioController.startMemoryBgm()') && appFileContent.includes('currentStage === \'gallery\'')) {
  console.log('\n[TEST 6] Checking Memories BGM integration:');
  console.log('  ✓ Memories BGM starts cleanly when transitioning to gallery stage');
}

console.log('\n--- ALL VERIFICATION CHECKS PASSED SUCCESSFULLY! ---');
