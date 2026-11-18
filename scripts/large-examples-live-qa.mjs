import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
import {mkdir, mkdtemp, rm, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = 9345;
const ROOT = process.cwd();
const OUT = path.resolve(ROOT, process.argv[2] ?? 'screenshots/large-examples');
const BASE = process.env.THINKCAT_QA_ORIGIN ?? 'http://127.0.0.1:3001';
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

await mkdir(OUT, {recursive: true});
const tempRoot = path.resolve(tmpdir());
const PROFILE = await mkdtemp(path.join(tempRoot, 'thinkcat-visual-qa-'));

const browser = spawn(EDGE, [
  '--headless=new',
  '--disable-gpu',
  '--hide-scrollbars',
  '--no-first-run',
  '--disable-extensions',
  '--disable-background-networking',
  '--remote-allow-origins=*',
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${PROFILE}`,
  'about:blank',
], {stdio: 'ignore'});

let socket;
let sequence = 0;
const pending = new Map();
const consoleErrors = [];
const pageErrors = [];
const networkErrors = [];
const requestUrls = new Map();

async function cleanup() {
  try { socket?.close(); } catch {}
  try { browser.kill(); } catch {}
  await sleep(350);
  if (path.dirname(PROFILE) === tempRoot && path.basename(PROFILE).startsWith('thinkcat-visual-qa-')) {
    await rm(PROFILE, {recursive: true, force: true}).catch(() => {});
  }
}
process.on('uncaughtException', async error => {
  console.error(error);
  await cleanup();
  process.exit(1);
});
process.on('unhandledRejection', async error => {
  console.error(error);
  await cleanup();
  process.exit(1);
});

async function getTarget() {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      const targets = await response.json();
      const page = targets.find(target => target.type === 'page');
      if (page) return page;
    } catch {}
    await sleep(150);
  }
  throw new Error('Could not connect to Edge');
}

function command(method, params = {}) {
  const id = ++sequence;
  return new Promise((resolve, reject) => {
    pending.set(id, {resolve, reject, method});
    socket.send(JSON.stringify({id, method, params}));
  });
}

async function evaluate(expression, awaitPromise = true) {
  const result = await command('Runtime.evaluate', {expression, returnByValue: true, awaitPromise});
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text || 'Evaluation failed');
  return result.result?.value;
}

async function waitFor(expression, message, timeout = 3000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    if (await evaluate(expression)) return;
    await sleep(75);
  }
  throw new Error(message);
}

async function ready() {
  for (let attempt = 0; attempt < 120; attempt += 1) {
    try {
      if (await evaluate('document.readyState')) {
        const state = await evaluate('document.readyState');
        if (state === 'complete') return;
      }
    } catch {}
    await sleep(100);
  }
  throw new Error('Page did not finish loading');
}

async function setViewport(width, height, mobile = width < 600) {
  await command('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 1,
    mobile,
    screenWidth: width,
    screenHeight: height,
  });
}

async function navigate(url, {width = 1440, height = 900, settle = 1300} = {}) {
  await setViewport(width, height);
  await command('Page.navigate', {url: BASE + url});
  await ready();
  await evaluate('document.fonts ? document.fonts.ready : true');
  await sleep(settle);
}

async function screenshot(name, {full = false, resetScroll = true} = {}) {
  if (resetScroll) {
    await evaluate('window.scrollTo(0, 0)');
    await sleep(120);
  }
  let params = {format: 'png', fromSurface: true, captureBeyondViewport: false};
  if (full) {
    const metrics = await command('Page.getLayoutMetrics');
    const size = metrics.cssContentSize;
    params = {
      format: 'png',
      fromSurface: true,
      captureBeyondViewport: true,
      clip: {x: 0, y: 0, width: size.width, height: Math.ceil(size.height), scale: 1},
    };
  }
  const result = await command('Page.captureScreenshot', params);
  await writeFile(path.join(OUT, `${name}.png`), Buffer.from(result.data, 'base64'));
  return {name, errors: [...consoleErrors, ...pageErrors]};
}

const target = await getTarget();
socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.onopen = resolve;
  socket.onerror = reject;
});
socket.onmessage = event => {
  const message = JSON.parse(event.data);
  if (message.id && pending.has(message.id)) {
    const entry = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) entry.reject(new Error(`${entry.method}: ${message.error.message}`));
    else entry.resolve(message.result);
    return;
  }
  if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') {
    consoleErrors.push(message.params.args.map(arg => arg.value ?? arg.description ?? '').join(' '));
  }
  if (message.method === 'Runtime.exceptionThrown') {
    pageErrors.push(message.params.exceptionDetails?.text ?? 'Runtime exception');
  }
  if (message.method === 'Log.entryAdded' && message.params.entry.level === 'error') {
    pageErrors.push(message.params.entry.text);
  }
  if (message.method === 'Network.requestWillBeSent') {
    requestUrls.set(message.params.requestId, message.params.request.url);
  }
  if (message.method === 'Network.responseReceived' && message.params.response.status >= 400) {
    networkErrors.push(`${message.params.response.status} ${message.params.response.url}`);
  }
  if (message.method === 'Network.loadingFailed') {
    networkErrors.push(`failed ${requestUrls.get(message.params.requestId) ?? 'unknown'}`);
  }
};

await command('Page.enable');
await command('Runtime.enable');
await command('Log.enable');
await command('Network.enable');
await command('Browser.grantPermissions', {origin: BASE, permissions: ['clipboardReadWrite', 'clipboardSanitizedWrite']});
const downloads = path.join(PROFILE, 'downloads');
await mkdir(downloads, {recursive: true});
await command('Browser.setDownloadBehavior', {behavior: 'allow', downloadPath: downloads, eventsEnabled: true});

await navigate('/zh/playground/?dataset=46910', {width:1440,height:900});
await waitFor(`document.querySelectorAll('.source-table tbody tr').length===200`, 'data missing',8000);
await evaluate(`document.querySelector('.preview-filter input').click()`);
await evaluate(`Array.from(document.querySelectorAll('button')).find(b=>b.textContent.trim()==='运行模型').click()`);
await waitFor(`document.querySelectorAll('tr[data-predicted="true"]').length===50`, 'real inference did not complete',125000);
await evaluate(`document.querySelector('.data-preview').scrollIntoView()`);
await screenshot('bank-live-predictions',{resetScroll:false});
await writeFile(path.join(OUT,'browser-live.json'),JSON.stringify({predicted:50,consoleErrors,pageErrors,networkErrors},null,2));
assert.equal(networkErrors.length,0);
assert.equal(pageErrors.length,0);
await cleanup();
console.log('PASS: browser sends real 10000-row request and fills 50 predictions in the original table.');
