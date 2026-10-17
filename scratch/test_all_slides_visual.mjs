import { spawn } from 'child_process';
import fs from 'fs';

const stages = [
  'invitation',
  'age-reveal',
  'gallery',
  'surprise-gift',
  'birthday-message',
  'celebration',
  'final-reveal'
];

async function runStageTest(stageName) {
  // Update App.tsx with stageName
  let appCode = fs.readFileSync('src/App.tsx', 'utf8');
  appCode = appCode.replace(/const \[isLoading, setIsLoading\] = useState<boolean>\(.*?\);/, `const [isLoading, setIsLoading] = useState<boolean>(false);`);
  appCode = appCode.replace(/const \[currentStage, setCurrentStage\] = useState<BirthdayStage>\(.*?\);/, `const [currentStage, setCurrentStage] = useState<BirthdayStage>('${stageName}');`);
  fs.writeFileSync('src/App.tsx', appCode);

  // Wait 1.5s for Vite HMR
  await new Promise(r => setTimeout(r, 1500));

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const userDataDir = `c:\\GBB\\gb\\dude-j\\scratch\\chrome_user_data_${stageName}`;

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

  const screenshotRes = await send('Page.captureScreenshot', { format: 'png' });
  const outPath = `scratch/stage_${stageName}.png`;
  fs.writeFileSync(outPath, Buffer.from(screenshotRes.data, 'base64'));
  console.log(`✓ Stage ${stageName} captured to ${outPath}`);

  // Evaluate alignment
  const evalRes = await send('Runtime.evaluate', {
    expression: `(() => {
      const stage = document.querySelector('.stage-container');
      const rect = stage ? stage.getBoundingClientRect() : null;
      return {
        hasStage: !!stage,
        stageClasses: stage?.className,
        rect: rect ? { top: rect.top, left: rect.left, width: rect.width, height: rect.height } : null,
        isCenteredX: rect ? Math.abs((rect.left + rect.width / 2) - 640) < 20 : false,
        isCenteredY: rect ? Math.abs((rect.top + rect.height / 2) - 400) < 60 : false
      };
    })()`,
    returnByValue: true
  });

  console.log(`  Alignment data for ${stageName}:`, evalRes.result.value);

  ws.close();
  chromeProc.kill();
  await new Promise(r => setTimeout(r, 1000));
}

async function testAll() {
  for (const st of stages) {
    try {
      await runStageTest(st);
    } catch (e) {
      console.error(`Error on stage ${st}:`, e.message);
    }
  }

  // Restore App.tsx to initial invitation stage with loading enabled
  let appCode = fs.readFileSync('src/App.tsx', 'utf8');
  appCode = appCode.replace(/const \[isLoading, setIsLoading\] = useState<boolean>\(.*?\);/, `const [isLoading, setIsLoading] = useState<boolean>(true);`);
  appCode = appCode.replace(/const \[currentStage, setCurrentStage\] = useState<BirthdayStage>\(.*?\);/, `const [currentStage, setCurrentStage] = useState<BirthdayStage>('invitation');`);
  fs.writeFileSync('src/App.tsx', appCode);
  console.log('\n=== All stages tested & App.tsx restored to initial state ===');
}

testAll().catch(console.error);
