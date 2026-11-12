import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
import {mkdir, mkdtemp, readFile, readdir, rm, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = 9333;
const ROOT = process.cwd();
const OUT = path.resolve(ROOT, process.argv[2] ?? 'screenshots/v5.3/after');
const BASE = process.env.THINKCAT_QA_ORIGIN ?? 'http://127.0.0.1:3100';
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

async function scrollToSelector(selector, offset = 90) {
  const found = await evaluate(`(() => {
    const element = document.querySelector(${JSON.stringify(selector)});
    if (!element) return false;
    const top = element.getBoundingClientRect().top + window.scrollY - ${offset};
    window.scrollTo(0, Math.max(0, top));
    return true;
  })()`);
  if (!found) throw new Error(`Missing selector ${selector}`);
  await sleep(450);
}

async function hover(selector) {
  const box = await evaluate(`(() => {
    const element = document.querySelector(${JSON.stringify(selector)});
    if (!element) return null;
    const rect = element.getBoundingClientRect();
    return {x: rect.left + rect.width / 2, y: rect.top + rect.height / 2};
  })()`);
  if (!box) throw new Error(`Missing hover target ${selector}`);
  await command('Input.dispatchMouseEvent', {type: 'mouseMoved', x: box.x, y: box.y});
  await sleep(350);
}

async function click(selector) {
  const clicked = await evaluate(`(() => {
    const element = document.querySelector(${JSON.stringify(selector)});
    if (!element) return false;
    element.click();
    return true;
  })()`);
  if (!clicked) throw new Error(`Missing click target ${selector}`);
  await sleep(350);
}

async function setRange(selector, value) {
  const changed = await evaluate(`(() => {
    const element = document.querySelector(${JSON.stringify(selector)});
    if (!element) return false;
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    setter.call(element, ${JSON.stringify(String(value))});
    element.dispatchEvent(new Event('input', {bubbles: true}));
    element.dispatchEvent(new Event('change', {bubbles: true}));
    return true;
  })()`);
  if (!changed) throw new Error(`Missing range ${selector}`);
  await sleep(550);
}

async function uploadCsv(fileName, source) {
  const uploaded = await evaluate(`(() => {
    const input = document.querySelector('input[type="file"]');
    if (!input) return false;
    const file = new File([${JSON.stringify(source)}], ${JSON.stringify(fileName)}, {type: 'text/csv'});
    const transfer = new DataTransfer();
    transfer.items.add(file);
    input.files = transfer.files;
    input.dispatchEvent(new Event('change', {bubbles: true}));
    return true;
  })()`);
  if (!uploaded) throw new Error('File input not found');
  await sleep(550);
}

async function metrics(label) {
  return evaluate(`(() => {
    const h1 = document.querySelector('h1');
    const style = h1 ? getComputedStyle(h1) : null;
    return {
      label: ${JSON.stringify(label)},
      url: location.pathname,
      title: document.title,
      lang: document.documentElement.lang,
      h1: h1 ? h1.textContent.trim() : null,
      h1Size: style ? style.fontSize : null,
      h1Lines: style ? Math.round(h1.getBoundingClientRect().height / parseFloat(style.lineHeight)) : null,
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
      overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
      sections: document.querySelectorAll('main section').length,
    };
  })()`);
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

const checks = [];
const pages = ['home', 'products', 'playground', 'docs', 'research', 'contact', 'privacy'];
const routes = {
  home: '',
  products: 'products/',
  playground: 'playground/',
  docs: 'docs/',
  research: 'research/',
  contact: 'contact/',
  privacy: 'privacy/',
};
const viewports = [
  {key: 'desktop', width: 1440, height: 900},
  {key: 'tablet', width: 768, height: 1024},
  {key: 'mobile', width: 390, height: 844},
];

for (const locale of ['zh', 'en']) {
  for (const page of pages) {
    for (const viewport of viewports) {
      await navigate(`/${locale}/${routes[page]}`, viewport);
      checks.push(await metrics(`${locale}-${page}-${viewport.key}`));
      await screenshot(`${locale}-${page}-${viewport.key}`);
    }
  }
}

for (const locale of ['zh', 'en']) {
  for (const page of pages) {
    await navigate(`/${locale}/${routes[page]}`, {width: 320, height: 760, settle: 300});
    checks.push(await metrics(`${locale}-${page}-narrow`));
  }
}

for (const locale of ['zh', 'en']) {
  for (const page of ['home', 'products', 'playground', 'docs']) {
    await navigate(`/${locale}/${routes[page]}`, {width: 1440, height: 900});
    await screenshot(`${locale}-${page}-desktop-full`, {full: true});
  }
}

for (const locale of ['zh', 'en']) {
  for (const page of ['home', 'products', 'playground', 'docs']) {
    await navigate(`/${locale}/${routes[page]}`, {width: 390, height: 844});
    await screenshot(`${locale}-${page}-mobile-full`, {full: true});
  }
}

// Product interactions.
await navigate('/zh/products/', {width: 1440, height: 900});
await scrollToSelector('#tabular .matrix-shell');
await click('.tabular-table tbody tr:nth-child(5) td:nth-child(7) button');
await screenshot('zh-products-matrix-interaction', {resetScroll: false});
await scrollToSelector('#time-series', 150);
await setRange('.time-study input[type="range"]', 80);
await screenshot('zh-products-time-interaction', {resetScroll: false});
await scrollToSelector('#unified', 150);
await hover('.map-link');
await screenshot('zh-products-unified-interaction', {resetScroll: false});

// Playground loading and success, then invalid CSV.
await navigate('/zh/playground/', {width: 1440, height: 900});
await scrollToSelector('.result-panel', 120);
await click('.run-button');
await screenshot('zh-playground-loading', {resetScroll: false});
checks.push(await metrics('zh-playground-loading'));
await waitFor('Boolean(document.querySelector(".result-success"))', 'Playground returned predictions', 60_000);
await screenshot('zh-playground-success', {resetScroll: false});
checks.push(await metrics('zh-playground-success'));
const successRows = await evaluate('document.querySelectorAll(".result-table tbody tr").length');
const successState = await evaluate('document.querySelector(".result-panel")?.className');
const downloadLabel = await evaluate('document.querySelector(".result-actions .button")?.textContent?.trim()');
await click('.result-actions .button');
await sleep(900);
const downloadsList = await readdir(downloads).catch(() => []);
const csvDownload = downloadsList.find(name => name.endsWith('.csv'));
assert(csvDownload, 'Kumo results CSV was not downloaded');
const csvContent = await readFile(path.join(downloads, csvDownload), 'utf8');
assert.match(csvContent, /source_row,kumo_prediction,kumo_probability,kumo_probabilities/);
await uploadCsv('invalid.csv', ['a,label', ...Array.from({length: 19}, (_, i) => (i + 1) + (i % 2 ? ',A' : ',B')), 'not-a-number,'].join('\n'));
await scrollToSelector('.source-panel', 100);
await screenshot('zh-playground-error', {resetScroll: false});
checks.push(await metrics('zh-playground-error'));
const errorText = await evaluate('document.querySelector(".inline-error")?.textContent?.trim()');

// Docs code tab and copy interaction.
await navigate('/zh/docs/', {width: 1440, height: 900});
await scrollToSelector('#request', 130);
await click('.code-tablist button:nth-child(2)');
await click('.code-block figcaption button');
await sleep(300);
await screenshot('zh-docs-code-tabs', {resetScroll: false});
const copyStatus = await evaluate('document.querySelector(".code-block figcaption button")?.textContent?.trim()');
assert(await evaluate(`navigator.clipboard.readText().then(text =>
  text.replace(/\\r\\n/g, '\\n') === document.querySelector(".code-block pre").textContent.replace(/\\r\\n/g, '\\n')
)`));
await evaluate('document.querySelector(".code-tablist [aria-selected=true]").focus()');
await command('Input.dispatchKeyEvent', {type: 'keyDown', key: 'End', code: 'End', windowsVirtualKeyCode: 35});
await command('Input.dispatchKeyEvent', {type: 'keyUp', key: 'End', code: 'End', windowsVirtualKeyCode: 35});
assert.equal(await evaluate('document.querySelector(".code-tablist [aria-selected=true]").textContent'), 'Python');

// Mobile navigation.
await navigate('/zh/', {width: 390, height: 844});
await click('.menu-toggle');
await screenshot('zh-mobile-menu');
const mobileMenuExpanded = await evaluate('document.querySelector(".menu-toggle")?.getAttribute("aria-expanded")');
checks.push(await metrics('zh-mobile-menu'));
await command('Input.dispatchKeyEvent', {type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27});
await command('Input.dispatchKeyEvent', {type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27});
await sleep(250);
const mobileMenuClosed = await evaluate('document.querySelector(".menu-toggle")?.getAttribute("aria-expanded")');

// Mobile docs navigation.
await navigate('/zh/docs/', {width: 390, height: 844});
await click('.docs-mobile-nav summary');
await screenshot('zh-mobile-docs-nav');
await click('.docs-mobile-nav a[href="#parameters"]');
await waitFor(`(() => {
  const menu = document.querySelector('.docs-mobile-nav');
  const table = document.querySelector('#parameters .doc-table-wrap');
  return location.hash === '#parameters' && !menu.open &&
    menu.querySelector('[aria-current]')?.hash === '#parameters' &&
    document.activeElement === document.querySelector('#parameters h2') &&
    table.tabIndex === 0 && table.scrollWidth > table.clientWidth &&
    table.getBoundingClientRect().top > menu.getBoundingClientRect().bottom;
})()`, 'Mobile contents jump and scrollable parameters table');
await scrollToSelector('#parameters .doc-table-wrap', 265);
await screenshot('zh-mobile-docs-parameters', {resetScroll: false});

// Narrow playground success.
await navigate('/zh/playground/', {width: 390, height: 844});
assert(await evaluate('document.querySelectorAll(".source-table tbody tr").length === 6 && !document.querySelector("details.preview-block, .config-panel")'));
await click('.run-button');
await waitFor('Boolean(document.querySelector(".result-success"))', 'Mobile Playground returned predictions', 60_000);
await screenshot('zh-mobile-playground-success', {resetScroll: false});

// Ask for a target when the header is unknown and restore the built-in sample.
await navigate('/en/playground/', {width: 1440, height: 900});
await uploadCsv('custom-target.csv', 'value,result\n1,A\n2,');
assert(await evaluate('document.querySelector(".run-button").disabled && document.querySelector(".preview-target select").value === "" && document.querySelector(".inline-error").textContent.includes("target column")'));
await click('.source-restore');
assert(await evaluate('!document.querySelector(".run-button").disabled && document.querySelector(".preview-toolbar h3").textContent.includes("Synthetic Demo Data")'));
await click('.run-button');
await waitFor('Boolean(document.querySelector(".result-success"))', 'English Playground returned predictions', 60_000);
await screenshot('en-playground-success', {resetScroll: false});

// Client navigation must continue to work from a static export.
await navigate('/zh/', {width: 1440, height: 900});
await click('.primary-nav a[href="/zh/products/"]');
await sleep(1200);
const navPath = await evaluate('location.pathname');
const navHeading = await evaluate('document.querySelector("h1")?.textContent?.trim()');

// Reduced-motion preference should switch smooth scrolling and entrance motion off.
await command('Emulation.setEmulatedMedia', {features: [{name: 'prefers-reduced-motion', value: 'reduce'}]});
await navigate('/zh/', {width: 1440, height: 900});
const reducedMotion = await evaluate(`({
  scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
  heroAnimationDuration: getComputedStyle(document.querySelector('.hero-copy')).animationDuration
})`);
await command('Emulation.setEmulatedMedia', {features: []});
const accessibility = await evaluate(`(() => {
  const buttons = [...document.querySelectorAll('button')];
  const links = [...document.querySelectorAll('a[href]')];
  const unnamed = [...buttons, ...links].filter(element => !((element.innerText || '').trim() || element.getAttribute('aria-label') || element.getAttribute('title')));
  const ids = [...document.querySelectorAll('[id]')].map(element => element.id);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  return {
    buttons: buttons.length,
    buttonsWithoutType: buttons.filter(button => !button.getAttribute('type')).length,
    unnamed: unnamed.length,
    duplicateIds: [...new Set(duplicates)],
    h1Count: document.querySelectorAll('h1').length,
  };
})()`);

const summary = {
  generatedAt: new Date().toISOString(),
  checks,
  interactions: {
    successRows,
    successState,
    downloadLabel,
    downloads: downloadsList,
    errorText,
    copyStatus,
    mobileMenuExpanded,
    mobileMenuClosed,
    navPath,
    navHeading,
    reducedMotion,
    accessibility,
  },
  consoleErrors: [...new Set(consoleErrors)],
  pageErrors: [...new Set(pageErrors)],
  networkErrors: [...new Set(networkErrors)],
};
await writeFile(path.join(OUT, 'qa-report.json'), JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));

assert(checks.every(check => !check.overflow), 'Page overflows its viewport');
assert.equal(successRows, 6);
assert.match(successState, /state-success/);
assert.match(errorText, /数字/);
assert.match(copyStatus, /已复制/);
assert.equal(mobileMenuClosed, 'false');
assert.equal(navPath, '/zh/products/');
assert.equal(reducedMotion.scrollBehavior, 'auto');
assert.deepEqual(summary.consoleErrors, []);
assert.deepEqual(summary.pageErrors, []);
assert.deepEqual(summary.networkErrors, []);
await cleanup();
