import { spawn } from 'child_process';
import fs from 'fs';

async function main() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const userDataDir = 'c:\\GBB\\gb\\dude-j\\scratch\\chrome_user_data';

  const chromeProc = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    `--user-data-dir=${userDataDir}`,
    '--no-first-run',
    '--no-default-browser-check',
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

  await new Promise(r => setTimeout(r, 2000));

  // Click dot 3 (index 2, Photo 3)
  await send('Runtime.evaluate', {
    expression: `(() => {
      const dots = document.querySelectorAll('.memory-dot-btn');
      if (dots[2]) {
        dots[2].click();
      }
    })()`
  });

  // Wait 1.2s for camera glide transition
  await new Promise(r => setTimeout(r, 1200));

  // Take screenshot
  const screenshotRes = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scratch/live_gallery_photo3.png', Buffer.from(screenshotRes.data, 'base64'));
  console.log('Saved scratch/live_gallery_photo3.png!');

  ws.close();
  chromeProc.kill();
}

main().catch(console.error);
