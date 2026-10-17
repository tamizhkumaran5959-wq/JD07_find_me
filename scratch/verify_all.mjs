import fs from 'fs';

console.log('=== VERIFICATION OF VIDEO PRELOADING & ASSET READINESS ===');

// 1. Files existence and sizes
const files = [
  'public/videos/Begining.mp4',
  'public/videos/Looping.mp4',
  'dist/videos/Begining.mp4',
  'dist/videos/Looping.mp4',
  'public/audio/f_1_m.mp3',
  'public/audio/f_m_looping.mp3',
  'public/audio/bd_looping.mp3'
];

for (const f of files) {
  if (fs.existsSync(f)) {
    const stat = fs.statSync(f);
    console.log(`[PASS] ${f} (${(stat.size / 1024 / 1024).toFixed(2)} MB)`);
  } else {
    console.error(`[FAIL] Missing file: ${f}`);
  }
}

// 2. FastStart atom offsets
function verifyFastStart(filePath) {
  const buf = fs.readFileSync(filePath);
  const moov = buf.indexOf(Buffer.from('moov'));
  const mdat = buf.indexOf(Buffer.from('mdat'));
  const isFastStart = moov > 0 && moov < mdat;
  console.log(`FastStart check on ${filePath}: moov=${moov}, mdat=${mdat} => ${isFastStart ? 'PASS (Web Streaming Ready)' : 'FAIL'}`);
}

verifyFastStart('public/videos/Begining.mp4');
verifyFastStart('public/videos/Looping.mp4');
verifyFastStart('dist/videos/Begining.mp4');
verifyFastStart('dist/videos/Looping.mp4');

// 3. Deployment configs
console.log('vercel.json valid JSON?', !!JSON.parse(fs.readFileSync('vercel.json', 'utf8')));
console.log('netlify.toml exists?', fs.existsSync('netlify.toml'));
console.log('public/_headers exists?', fs.existsSync('public/_headers'));
console.log('dist/_headers exists?', fs.existsSync('dist/_headers'));
