import { spawn } from 'child_process';
import fs from 'fs';

async function main() {
  console.log('=== STARTING END-TO-END FLOW TEST ===');
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const userDataDir = 'c:\\GBB\\gb\\dude-j\\scratch\\chrome_user_data_e2e';

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

  console.log('Step 1: Clicking .loading-begin-btn to enter experience...');
  await new Promise(r => setTimeout(r, 2500));

  await send('Runtime.evaluate', {
    expression: `(() => {
      const btn = document.querySelector('.loading-begin-btn');
      if (btn) btn.click();
    })()`
  });

  await new Promise(r => setTimeout(r, 800));

  console.log('Step 2: On Invitation stage, clicking "Let\'s Begin"...');
  await send('Runtime.evaluate', {
    expression: `(() => {
      const btn = document.querySelector('.btn-cinematic-glow') || Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes("Let's Begin"));
      if (btn) btn.click();
    })()`
  });

  await new Promise(r => setTimeout(r, 1000));

  console.log('Step 3: Opening the gift box...');
  await send('Runtime.evaluate', {
    expression: `(() => {
      const giftBtn = document.querySelector('.gift-open-btn') || document.querySelector('.gift-stage-arena');
      if (giftBtn) giftBtn.click();
    })()`
  });

  await new Promise(r => setTimeout(r, 1600));

  console.log('Step 4: Entering DOB 18102005 on keypad...');
  const keyRes = await send('Runtime.evaluate', {
    expression: `(() => {
      const buttons = Array.from(document.querySelectorAll('.keypad-btn.digit-btn'));
      const code = ['1', '8', '1', '0', '2', '0', '0', '5'];
      for (const char of code) {
        const btn = buttons.find(b => b.textContent.trim() === char);
        if (btn) btn.click();
      }
      return {
        enteredDigits: Array.from(document.querySelectorAll('.date-slot.is-filled')).map(s => s.textContent.trim()).join('')
      };
    })()`,
    returnByValue: true
  });
  console.log('Keypad result:', keyRes.result.value);

  await new Promise(r => setTimeout(r, 400));

  console.log('Step 5: Clicking "Board the Memory Train"...');
  await send('Runtime.evaluate', {
    expression: `(() => {
      const boardBtn = document.querySelector('.board-train-btn');
      if (boardBtn) boardBtn.click();
    })()`
  });

  console.log('Step 6: Waiting 5.5s for Boarding & Departure transition to Memories Tab...');
  await new Promise(r => setTimeout(r, 5500));

  // Verify we are in Memories Tab (StageGallery)
  const evalGallery = await send('Runtime.evaluate', {
    expression: `(() => {
      const stage = document.querySelector('.cinematic-camera-stage');
      const polaroids = document.querySelectorAll('.hanging-polaroid-unit');
      const imgs = document.querySelectorAll('.polaroid-image-render');
      const centerEl = document.elementFromPoint(640, 400);
      return {
        hasStageGallery: !!stage,
        polaroidsCount: polaroids.length,
        imagesCount: imgs.length,
        firstImgSrc: imgs[0]?.src,
        firstImgLoaded: imgs[0]?.complete && imgs[0]?.naturalWidth > 0,
        centerTag: centerEl?.tagName,
        centerClass: centerEl?.className
      };
    })()`,
    returnByValue: true
  });

  console.log('Step 7: Arrival at Memories Tab Diagnostic:\n', JSON.stringify(evalGallery.result.value, null, 2));

  // Capture final screenshot
  const screenshotRes = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scratch/e2e_memories_arrival.png', Buffer.from(screenshotRes.data, 'base64'));
  console.log('Saved scratch/e2e_memories_arrival.png');

  ws.close();
  chromeProc.kill();
}

main().catch(console.error);
