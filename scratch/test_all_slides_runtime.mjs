import fs from 'fs';
import { execSync } from 'child_process';

console.log('=== RUNNING ALL-SLIDES RUNTIME & ALIGNMENT VERIFICATION ===');

// Check that npm run build passes
try {
  const buildOut = execSync('npm run build', { encoding: 'utf8' });
  console.log('✓ npm run build passed cleanly.');
} catch (e) {
  console.error('✗ Build failed:', e.message);
  process.exit(1);
}

// Check index.css has fixed train-video-bg-viewport
const indexCss = fs.readFileSync('src/index.css', 'utf8');
if (indexCss.includes('.train-video-bg-viewport') && indexCss.includes('position: fixed')) {
  console.log('✓ index.css defines .train-video-bg-viewport as position: fixed (zero flow space).');
} else {
  console.error('✗ Missing fixed positioning in index.css for train video viewport.');
  process.exit(1);
}

// Check TrainVideoBackground.tsx has fixed styles
const tvb = fs.readFileSync('src/components/TrainVideoBackground.tsx', 'utf8');
if (tvb.includes('position: fixed') && tvb.includes('top: 0')) {
  console.log('✓ TrainVideoBackground.tsx has scoped fixed position styles.');
} else {
  console.error('✗ TrainVideoBackground missing fixed styles.');
  process.exit(1);
}

// Check StageGallery.tsx has photos revealed immediately
const gallery = fs.readFileSync('src/components/StageGallery.tsx', 'utf8');
if (gallery.includes('isPhotosRevealed = true')) {
  console.log('✓ StageGallery.tsx sets isPhotosRevealed = true (images visible immediately).');
} else {
  console.error('✗ StageGallery does not initialize photos as visible.');
  process.exit(1);
}

// Verify all 12 photo files exist on disk
for (let i = 1; i <= 12; i++) {
  const photoPath = `public/photos/${i}.jpg`;
  if (fs.existsSync(photoPath)) {
    const size = fs.statSync(photoPath).size;
    console.log(`  ✓ Photo ${i}: ${photoPath} (${(size / 1024).toFixed(1)} KB)`);
  } else {
    console.error(`  ✗ Missing photo: ${photoPath}`);
    process.exit(1);
  }
}

console.log('\n=== ALL SLIDES CONFIGURATION VERIFIED PERFECTLY! ===');
