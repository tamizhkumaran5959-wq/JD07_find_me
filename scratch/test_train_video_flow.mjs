import { spawn } from 'child_process';
import fs from 'fs';

async function main() {
  console.log('=== VERIFYING TRAIN INTRO VIDEO PLAYBACK & MEMORIES TRANSITION ===');
  // Temporarily set currentStage = 'gallery' in App.tsx
  let appCode = fs.readFileSync('src/App.tsx', 'utf8');
  appCode = appCode.replace(/const \[isLoading, setIsLoading\] = useState<boolean>\(.*?\);/, `const [isLoading, setIsLoading] = useState<boolean>(false);`);
  appCode = appCode.replace(/const \[currentStage, setCurrentStage\] = useState<BirthdayStage>\(.*?\);/, `const [currentStage, setCurrentStage] = useState<BirthdayStage>('gallery');`);
  fs.writeFileSync('src/App.tsx', appCode);

  await new Promise(r => setTimeout(r, 1200));

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const userDataDir = 'c:\\GBB\\gb\\dude-j\\scratch\\chrome_user_data_train_video2';

  const chromeProc = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    `--user-data-dir=${userDataDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--autoplay-policy=no-user-gesture-required',
    '--window-size=1280,800',
    'http://localhost:5173'
  ]);

  let targets = null;
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch('http://127.0.0.1:9222/json/list');
      targets = await res.json();
      if (Array.isArray(targets) && targets.length > 0) break;
    } catch (e) {
      await new Promise(r => setTimeout(r, 200));
    }
  }

  const pageTarget = targets.find(t => t.type === 'page' && t.url.includes('5173')) || targets[0];
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  await new Promise((resolve) => ws.onopen = resolve);

  let idCounter = 1;
  const pending = new Map();
  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = idCounter++;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  ws.onmessage = (evt) => {
    const msg = JSON.parse(evt.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(msg.error);
      else resolve(msg.result);
    }
  };

  await send('Runtime.enable');
  await send('Page.enable');
  await send('DOM.enable');

  console.log('1. Checking Opening Train Video (Begining.mp4) at 2s into journey...');
  await new Promise(r => setTimeout(r, 2500));

  const openingEval = await send('Runtime.evaluate', {
    expression: `(() => {
      const videos = Array.from(document.querySelectorAll('video'));
      const opening = videos.find(v => v.src.includes('Begining.mp4'));
      const looping = videos.find(v => v.src.includes('Looping.mp4'));
      const skipBtn = document.querySelector('.train-skip-intro-btn');
      return {
        openingSrc: opening?.src,
        openingOpacity: opening ? getComputedStyle(opening).opacity : null,
        openingPaused: opening?.paused,
        openingCurrentTime: opening?.currentTime,
        openingVideoWidth: opening?.videoWidth,
        openingVideoHeight: opening?.videoHeight,
        loopingSrc: looping?.src,
        loopingOpacity: looping ? getComputedStyle(looping).opacity : null,
        hasSkipBtn: !!skipBtn,
        isPhotosRevealed: document.querySelector('.camera-viewport-frame')?.classList.contains('photos-revealed'),
        hudRevealed: document.querySelector('.memory-top-hud')?.classList.contains('hud-revealed')
      };
    })()`,
    returnByValue: true
  });

  console.log('Opening Stage State:\n', JSON.stringify(openingEval.result.value, null, 2));

  // Take screenshot of Opening Train Video
  const openingScreenshot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scratch/train_video_opening_live.png', Buffer.from(openingScreenshot.data, 'base64'));
  console.log('Saved scratch/train_video_opening_live.png');

  // Now click "Skip to Memories"
  console.log('2. Clicking "Skip to Memories" to test transition...');
  await send('Runtime.evaluate', {
    expression: `(() => {
      const btn = document.querySelector('.train-skip-intro-btn');
      if (btn) btn.click();
    })()`
  });

  // Wait 1.4s for crossfade
  await new Promise(r => setTimeout(r, 1400));

  const memoriesEval = await send('Runtime.evaluate', {
    expression: `(() => {
      const videos = Array.from(document.querySelectorAll('video'));
      const opening = videos.find(v => v.src.includes('Begining.mp4'));
      const looping = videos.find(v => v.src.includes('Looping.mp4'));
      return {
        openingOpacity: opening ? getComputedStyle(opening).opacity : null,
        loopingOpacity: looping ? getComputedStyle(looping).opacity : null,
        loopingPaused: looping?.paused,
        loopingCurrentTime: looping?.currentTime,
        isPhotosRevealed: document.querySelector('.camera-viewport-frame')?.classList.contains('photos-revealed'),
        hudRevealed: document.querySelector('.memory-top-hud')?.classList.contains('hud-revealed'),
        polaroidsCount: document.querySelectorAll('.hanging-polaroid-unit').length,
        centerEl: document.elementFromPoint(640, 400)?.outerHTML?.substring(0, 100)
      };
    })()`,
    returnByValue: true
  });

  console.log('Memories Stage State after transition:\n', JSON.stringify(memoriesEval.result.value, null, 2));

  // Take screenshot of Memories Stage after transition
  const memoriesScreenshot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scratch/train_video_memories_live.png', Buffer.from(memoriesScreenshot.data, 'base64'));
  console.log('Saved scratch/train_video_memories_live.png');

  // Restore App.tsx
  appCode = fs.readFileSync('src/App.tsx', 'utf8');
  appCode = appCode.replace(/const \[isLoading, setIsLoading\] = useState<boolean>\(.*?\);/, `const [isLoading, setIsLoading] = useState<boolean>(true);`);
  appCode = appCode.replace(/const \[currentStage, setCurrentStage\] = useState<BirthdayStage>\(.*?\);/, `const [currentStage, setCurrentStage] = useState<BirthdayStage>('invitation');`);
  fs.writeFileSync('src/App.tsx', appCode);
  console.log('Restored App.tsx to initial invitation state');

  ws.close();
  chromeProc.kill();
}

main().catch(console.error);
