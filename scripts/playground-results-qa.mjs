import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdir, mkdtemp, readFile, readdir, rm, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const BASE = process.env.THINKCAT_QA_ORIGIN ?? 'http://127.0.0.1:3000';
const PORT = Number(process.env.THINKCAT_QA_CDP_PORT ?? 9335);
const OUT = path.resolve(process.argv[2] ?? 'artifacts/playground-results-qa/after');
const CAPTURE_ONLY = process.env.THINKCAT_QA_CAPTURE_ONLY === '1';
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const sampleSource = await readFile('lib/demo-data.ts', 'utf8');
const sampleCsv = sampleSource.match(/export const sampleCsv = `([\s\S]*?)`;/)?.[1]
  .replaceAll('${playgroundTargetColumn}', 'label');
assert(sampleCsv, 'Could not read the sample CSV');

await mkdir(OUT, {recursive: true});
const profile = await mkdtemp(path.join(tmpdir(), 'thinkcat-results-qa-'));
const downloads = path.join(profile, 'downloads');
await mkdir(downloads, {recursive: true});
const browser = spawn(EDGE, [
  '--headless=new', '--disable-gpu', '--no-first-run', '--disable-extensions',
  '--remote-allow-origins=*', `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${profile}`, 'about:blank',
], {stdio: 'ignore'});

let socket;
let sequence = 0;
let scenario = 'success';
let held = null;
let requestCount = 0;
const pending = new Map();
const consoleErrors = [];
const pageErrors = [];

async function cleanup() {
  try { socket?.close(); } catch {}
  try { browser.kill(); } catch {}
  await sleep(300);
  await rm(profile, {recursive: true, force: true}).catch(() => {});
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

function command(method, params = {}) {
  const id = ++sequence;
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      pending.delete(id);
      reject(new Error(`浏览器调试命令超时：${method}`));
    }, 15_000);
    pending.set(id, {
      resolve: value => { clearTimeout(timer); resolve(value); },
      reject: error => { clearTimeout(timer); reject(error); },
      method,
    });
    socket.send(JSON.stringify({id, method, params}));
  });
}

async function evaluate(expression) {
  const response = await command('Runtime.evaluate', {expression, returnByValue: true, awaitPromise: true});
  if (response.exceptionDetails) throw new Error(response.exceptionDetails.text || 'Evaluation failed');
  return response.result?.value;
}

async function waitFor(expression, message, timeout = 5000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    if (await evaluate(expression)) return;
    await sleep(75);
  }
  throw new Error(message);
}

function resultFor(request) {
  const {rows, target_column: target} = JSON.parse(request.postData);
  const classes = [...new Set(rows.map(row => row[target]).filter(Boolean))];
  const rowIndices = rows.map((row, index) => row[target] ? null : index).filter(index => index !== null);
  const predictions = rowIndices.map((_, index) => classes[index % classes.length]);
  const probabilities = predictions.map((label, index) => {
    const top = .78 + (index % 6) * .03;
    const rest = (1 - top) / (classes.length - 1);
    return Object.fromEntries(classes.map(category => [category, category === label ? top : rest]));
  });
  return {model: 'Kumo Tabular Medium', row_indices: rowIndices, predictions, probabilities, classes};
}

function fulfill(requestId, request, currentScenario = scenario) {
  const status = typeof currentScenario === 'number' ? currentScenario : 200;
  const body = currentScenario === 'invalid' ? {unexpected: true}
    : status === 200 ? resultFor(request) : {error: 'controlled QA failure'};
  if (currentScenario === 'invalid-probabilities') {
    body.probabilities = body.predictions.map(() => Object.fromEntries(body.classes.map(label => [label, .9])));
  }
  return command('Fetch.fulfillRequest', {
    requestId,
    responseCode: status,
    responseHeaders: [{name: 'Content-Type', value: 'application/json'}],
    body: Buffer.from(JSON.stringify(body)).toString('base64'),
  });
}

async function getTarget() {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    try {
      const targets = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
      const page = targets.find(target => target.type === 'page');
      if (page) return page;
    } catch {}
    await sleep(100);
  }
  throw new Error('Could not connect to Edge');
}

const target = await getTarget();
socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener('open', resolve, {once: true});
  socket.addEventListener('error', reject, {once: true});
});
socket.addEventListener('close', () => {
  for (const entry of pending.values()) entry.reject(new Error(`浏览器调试连接已关闭：${entry.method}`));
  pending.clear();
});
socket.addEventListener('message', event => {
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
  if (message.method === 'Runtime.exceptionThrown') pageErrors.push(message.params.exceptionDetails?.text ?? 'Runtime exception');
  if (message.method === 'Fetch.requestPaused') {
    const paused = message.params;
    if (!paused.request.url.endsWith('/api/kumo/predict')) {
      command('Fetch.continueRequest', {requestId: paused.requestId});
      return;
    }
    requestCount += 1;
    if (scenario === 'hold') {
      held = paused;
      return;
    }
    fulfill(paused.requestId, paused.request);
  }
});

await command('Page.enable');
await command('Runtime.enable');
await command('Fetch.enable', {patterns: [{urlPattern: '*/api/kumo/predict'}]});
await command('Browser.setDownloadBehavior', {behavior: 'allow', downloadPath: downloads, eventsEnabled: true});

async function navigate(locale = 'zh', width = 1440, height = 1000) {
  scenario = 'success';
  held = null;
  await command('Emulation.setDeviceMetricsOverride', {width, height, deviceScaleFactor: 1, mobile: width < 600});
  await command('Page.navigate', {url: `${BASE}/${locale}/playground/`});
  await waitFor(`document.readyState === 'complete' && Boolean(document.querySelector('#run-model'))`, 'Playground did not load', 15_000);
  await evaluate('document.fonts ? document.fonts.ready : true');
  await sleep(350);
}

async function captureElement(name, selector) {
  await evaluate(`(() => {
    if (!document.querySelector('#qa-external-artifacts')) {
      const style = document.createElement('style');
      style.id = 'qa-external-artifacts';
      style.textContent = 'doubao-ai-csui { display: none !important; }';
      document.documentElement.appendChild(style);
    }
    document.querySelectorAll('doubao-ai-csui').forEach(element => element.remove());
    document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block: 'start', behavior: 'instant'});
  })()`);
  await sleep(100);
  const rect = await evaluate(`(() => {
    const rect = document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();
    return {
      x: Math.max(0, rect.left + window.scrollX - 16),
      y: Math.max(0, rect.top + window.scrollY - 16),
      width: Math.ceil(rect.width) + 32,
      height: Math.min(Math.ceil(rect.height) + 32, 1600),
    };
  })()`);
  const shot = await command('Page.captureScreenshot', {
    format: 'png', fromSurface: true, captureBeyondViewport: true,
    clip: {...rect, scale: 1},
  });
  await writeFile(path.join(OUT, `${name}.png`), Buffer.from(shot.data, 'base64'));
}

async function capture(name) {
  await captureElement(name, '.result-panel');
}

async function captureWorkbenchSet() {
  const viewports = [['desktop', 1440, 1000], ['tablet', 768, 1024], ['mobile', 390, 844]];
  for (const locale of ['zh', 'en']) {
    for (const [label, width, height] of viewports) {
      await navigate(locale, width, height);
      await captureElement(`${locale}-${label}-workspace`, '.workbench');
    }
  }
}

async function upload(name, source, method = 'input') {
  await evaluate(`(() => {
    const input = document.querySelector('input[type="file"]');
    const transfer = new DataTransfer();
    transfer.items.add(new File([${JSON.stringify(source)}], ${JSON.stringify(name)}, {type: 'text/csv'}));
    if (${JSON.stringify(method)} === 'drop') {
      const zone = document.querySelector('.dropzone');
      zone.dispatchEvent(new DragEvent('dragover', {bubbles: true, cancelable: true, dataTransfer: transfer}));
      zone.dispatchEvent(new DragEvent('drop', {bubbles: true, cancelable: true, dataTransfer: transfer}));
    } else {
      input.files = transfer.files;
      input.dispatchEvent(new Event('change', {bubbles: true}));
    }
  })()`);
  await waitFor(`document.querySelector('.preview-toolbar h3')?.textContent.includes(${JSON.stringify(name)})`, 'Uploaded CSV was not parsed');
}

async function releaseHeld(nextScenario = 'success') {
  assert(held, 'No held inference request');
  const request = held;
  held = null;
  scenario = nextScenario;
  await fulfill(request.requestId, request.request, nextScenario);
}

await captureWorkbenchSet();
if (CAPTURE_ONLY) {
  const captureReport = {
    generatedAt: new Date().toISOString(),
    mode: 'capture-only',
    locales: ['zh', 'en'],
    viewports: ['1440x1000', '768x1024', '390x844', '320x844'],
    workspaceScreenshots: 6,
    consoleErrors,
    pageErrors,
  };
  await writeFile(path.join(OUT, 'qa-report.json'), JSON.stringify(captureReport, null, 2));
  console.log(JSON.stringify(captureReport, null, 2));
  await cleanup();
  process.exit(0);
}

await navigate();
const inputBaseline = await evaluate(`(() => {
  const rows = [...document.querySelectorAll('.source-table tbody tr')];
  const run = document.querySelector('#run-model').getBoundingClientRect();
  const preview = document.querySelector('.data-preview').getBoundingClientRect();
  const toolbar = document.querySelector('.preview-toolbar').getBoundingClientRect();
  const table = document.querySelector('.source-table').getBoundingClientRect();
  return {
    rowCount: rows.length,
    rowLines: rows.map(row => Number(row.querySelector('th').textContent)),
    headerHeight: document.querySelector('.source-table thead tr').getBoundingClientRect().height,
    rowHeight: rows[0].getBoundingClientRect().height,
    runWidth: run.width,
    runHeight: run.height,
    primaryActions: document.querySelectorAll('.source-panel .button-accent').length,
    sourceBorder: getComputedStyle(document.querySelector('.source-panel')).borderTopWidth,
    previewWidth: preview.width,
    toolbarRight: toolbar.right,
    tableRight: table.right,
    hasHelp: Boolean(document.querySelector('.source-help')),
    hasPrivacy: Boolean(document.querySelector('#run-model-notice')?.textContent.trim()),
    viewport: window.innerWidth,
    documentWidth: document.documentElement.scrollWidth,
  };
})()`);
assert.equal(inputBaseline.rowCount, 6, 'Default preview must contain six real rows');
assert.deepEqual(inputBaseline.rowLines, [2, 3, 4, 5, 20, 21], 'Preview must preserve the original CSV line numbers');
assert(inputBaseline.headerHeight >= 40 && inputBaseline.headerHeight <= 48, `Header height: ${inputBaseline.headerHeight}`);
assert(inputBaseline.rowHeight >= 40 && inputBaseline.rowHeight <= 48, `Data row height: ${inputBaseline.rowHeight}`);
assert(inputBaseline.runWidth <= 240 && inputBaseline.runHeight >= 44 && inputBaseline.runHeight <= 48, `Desktop Run Model proportions: ${JSON.stringify(inputBaseline)}`);
assert.equal(inputBaseline.primaryActions, 1, 'Run Model must be the only primary input action');
assert.equal(inputBaseline.sourceBorder, '0px', 'Source panel must not have an outer card border');
assert(inputBaseline.previewWidth <= 1040.5, `Input data measure: ${inputBaseline.previewWidth}`);
assert(Math.abs(inputBaseline.toolbarRight - inputBaseline.tableRight) <= 1, 'Toolbar and table must share the same right edge');
assert(inputBaseline.hasHelp && inputBaseline.hasPrivacy, 'Format help and privacy notice must remain available');
assert(inputBaseline.documentWidth <= inputBaseline.viewport + 1, 'Desktop input must not overflow');
await evaluate(`document.querySelector('#preview-next').click()`);
await sleep(120);
assert.equal(await evaluate(`document.querySelector('.source-table tbody tr th').textContent`), '6', 'Input pagination must preserve real CSV lines');
await evaluate(`document.querySelector('#preview-previous').click()`);
await sleep(120);
assert.equal(await evaluate(`document.querySelector('.source-table tbody tr th').textContent`), '2', 'Previous page must restore the original first row');
await captureElement('zh-desktop-input', '.source-panel');
await capture('zh-desktop-idle');
assert(await evaluate(`Boolean(document.querySelector('.state-idle #result-back') &&
  document.querySelector('.result-state') && document.querySelector('.result-model'))`), 'Idle state needs a compact header with status, model and Back to Data');
assert(await evaluate(`getComputedStyle(document.querySelector('.result-panel')).backgroundColor !== 'rgb(17, 26, 19)'`), 'Results still use the dark panel');

const uploadedCsv = sampleCsv.replace('13.3,3.3,0.81,', '99.1,3.3,0.81,');
await upload('uploaded-sensor-data.csv', uploadedCsv);
await evaluate(`document.querySelector('#result-back').click()`);
await sleep(250);
const backFocus = await evaluate(`({
  id: document.activeElement.id,
  element: document.activeElement.outerHTML.slice(0, 240),
  runDisabled: document.querySelector('#run-model').disabled,
  runText: document.querySelector('#run-model').textContent,
  datasetError: document.querySelector('#workbench-error')?.textContent ?? null,
})`);
assert.equal(backFocus.id, 'run-model', `Back to Data should focus the run control: ${JSON.stringify(backFocus)}`);
assert(await evaluate(`document.querySelector('.preview-toolbar h3').textContent.includes('uploaded-sensor-data.csv')`), 'Back to Data cleared the uploaded CSV');

scenario = 'hold';
const beforeDoubleRun = requestCount;
await evaluate(`document.querySelector('#run-model').click(); document.querySelector('#run-model').click()`);
await waitFor(`Boolean(document.querySelector('.state-running'))`, 'Loading state missing');
assert.equal(requestCount, beforeDoubleRun + 1, 'Double click started concurrent inference requests');
assert(await evaluate(`Boolean(document.querySelector('.result-loading progress:not([value])'))`), 'Loading needs an indeterminate native progress element');
assert(!(await evaluate(`document.querySelector('.result-loading').textContent`)).includes('%'), 'Loading must not invent progress');
await capture('zh-desktop-loading');
await releaseHeld();
await waitFor(`Boolean(document.querySelector('.state-success'))`, 'Success state missing');
assert.equal(await evaluate(`document.querySelectorAll('.result-table tbody tr').length`), 6);
assert(await evaluate(`(() => {
  const headers = [...document.querySelectorAll('.result-table thead th')].map(th => th.textContent.trim());
  return ['sensor_a', 'sensor_b', 'load_gap'].every(header => headers.includes(header));
})()`), 'Prediction table must include the original input features');
assert(!(await evaluate(`document.querySelector('.result-success').textContent`)).includes('99.99%'), 'Unexpected decorative result data');
await capture('zh-desktop-success');
assert(await evaluate(`document.querySelector('.result-sample-number').textContent === '1' &&
  document.querySelector('.result-line-number').textContent.includes('20')`), 'Prediction rows need distinct sample numbers and original CSV lines');
const desktopLayout = await evaluate(`(() => {
  const panel = document.querySelector('.result-panel').getBoundingClientRect();
  const metrics = document.querySelector('.result-summary dl').getBoundingClientRect();
  return {
    viewport: window.innerWidth,
    documentWidth: document.documentElement.scrollWidth,
    panelRight: panel.right,
    metricsRight: metrics.right,
  };
})()`);
assert(desktopLayout.documentWidth <= desktopLayout.viewport + 1, `Desktop page overflows: ${JSON.stringify(desktopLayout)}`);
assert(desktopLayout.metricsRight <= desktopLayout.panelRight + 1, `Summary metrics overflow: ${JSON.stringify(desktopLayout)}`);

await evaluate(`document.querySelector('#download-results').click()`);
await sleep(700);
const downloaded = (await readdir(downloads)).find(name => name.endsWith('.csv'));
assert(downloaded, 'CSV did not download');
const csv = await readFile(path.join(downloads, downloaded), 'utf8');
assert.match(csv, /source_row,kumo_prediction,kumo_probability,kumo_probabilities/);
assert.equal(csv.trim().split(/\r?\n/).length, 7);
assert.match(csv, /99.1/);

await evaluate(`document.querySelector('#result-back').click()`);
await sleep(200);
assert(await evaluate(`document.querySelector('.preview-toolbar h3').textContent.includes('uploaded-sensor-data.csv')`), 'Success Back to Data did not preserve the uploaded CSV');

scenario = 503;
await evaluate(`document.querySelector('#run-model').click()`);
await waitFor(`Boolean(document.querySelector('.state-error'))`, '503 did not produce an error state');
assert(await evaluate(`Boolean(document.querySelector('#result-retry') && document.querySelector('#result-back-error'))`), 'Error state needs Retry and Back to Data actions');
assert(await evaluate(`document.querySelector('.result-error').getBoundingClientRect().height < 400`), 'Error state is too large');
assert(await evaluate(`getComputedStyle(document.querySelector('.result-panel')).backgroundColor !== 'rgb(17, 26, 19)'`), 'Error state still uses the dark panel');
await capture('zh-desktop-error');

scenario = 'hold';
const beforeRetry = requestCount;
await evaluate(`document.querySelector('#result-retry').click(); document.querySelector('#result-retry').click()`);
await waitFor(`Boolean(document.querySelector('.state-running'))`, 'Retry did not resubmit the current data');
assert.equal(requestCount, beforeRetry + 1, 'Retry started duplicate requests');
await releaseHeld();
await waitFor(`Boolean(document.querySelector('.state-success'))`, 'Retry did not show real returned results');
assert(await evaluate(`document.querySelector('.preview-toolbar h3').textContent.includes('uploaded-sensor-data.csv')`), 'Retry changed the current CSV');

const errorCases = [
  [504, '超时'], [503, '暂时'], [422, '未接受'], [429, '频繁'], [413, '过大'], ['invalid', '格式'], ['invalid-probabilities', '格式'],
];
for (const [errorScenario, expected] of errorCases) {
  scenario = errorScenario;
  await evaluate(`document.querySelector('#run-model').click()`);
  await waitFor(`Boolean(document.querySelector('.state-error'))`, `Missing error for ${errorScenario}`);
  assert((await evaluate(`document.querySelector('.result-error').textContent`)).includes(expected), `Wrong message for ${errorScenario}`);
}

const beforeInvalidUpload = requestCount;
await upload('invalid.csv', 'a,label\n1,A\n2,');
assert(await evaluate(`Boolean(document.querySelector('.inline-error'))`), 'Malformed input needs an inline data error');
assert.equal(requestCount, beforeInvalidUpload, 'Malformed input should not call the model');

const customTargetCsv = sampleCsv.replace(/,label\r?\n/, ',custom_target\n');
assert(customTargetCsv !== sampleCsv, 'Custom target fixture must replace the header');
await upload('custom-target.csv', customTargetCsv);
const customTargetState = await evaluate(`({
  disabled: document.querySelector('#run-model').disabled,
  hasSelect: Boolean(document.querySelector('.preview-target select')),
  headers: [...document.querySelectorAll('.source-table thead th')].map(element => element.textContent),
  error: document.querySelector('#workbench-error')?.textContent ?? null,
})`);
assert(customTargetState.disabled && customTargetState.hasSelect, `An ambiguous target must require a selection: ${JSON.stringify(customTargetState)}`);
await evaluate(`(() => {
  const select = document.querySelector('.preview-target select');
  select.value = '3';
  select.dispatchEvent(new Event('change', {bubbles: true}));
})()`);
await waitFor(`!document.querySelector('#run-model').disabled`, 'Selecting a target did not enable Run Model');
await upload('dropped-sensor-data.csv', uploadedCsv, 'drop');
assert(await evaluate(`!document.querySelector('#run-model').disabled`), 'Dragged CSV did not update a valid preview');
await evaluate(`document.querySelector('.source-restore').click()`);
await waitFor(`document.querySelector('.preview-toolbar h3')?.textContent.includes('示例数据')`, 'Restore sample did not restore the sample preview');
assert.equal(await evaluate(`document.querySelectorAll('.source-table tbody tr').length`), 6);
assert.equal(await evaluate(`document.querySelector('.source-table tbody tr th').textContent`), '2');
assert.equal(requestCount, beforeInvalidUpload, 'Upload and restore interactions must not call the model');

await navigate('en');
scenario = 503;
await evaluate(`document.querySelector('#run-model').click()`);
await waitFor(`Boolean(document.querySelector('.state-error'))`, 'English error state missing');
assert.doesNotMatch(await evaluate(`document.querySelector('.result-panel').textContent`), /\p{Script=Han}/u);
assert.match(await evaluate(`document.querySelector('#result-retry').textContent`), /Retry/);
scenario = 'success';
await evaluate(`document.querySelector('#result-retry').click()`);
await waitFor(`Boolean(document.querySelector('.state-success'))`, 'English retry failed');
await capture('en-desktop-success');

// 窄屏输入表应保持可读行高；允许表格内部滚动，禁止页面横向溢出。
for (const locale of ['zh', 'en']) {
  await navigate(locale, 320, 844);
  assert(await evaluate(`document.documentElement.scrollWidth <= innerWidth + 1`), `${locale}: 320px 页面横向溢出`);
  assert(await evaluate(`[...document.querySelectorAll('.source-table tbody tr')].every(row => row.getBoundingClientRect().height <= 60)`), `${locale}: 320px 表格行高异常`);
  assert(await evaluate(`document.querySelector('#run-model').getBoundingClientRect().height >= 48`), `${locale}: 运行按钮触控区域不足`);
  await capture(`${locale}-narrow-input`);
}

const responsiveLayouts = [];
for (const [locale, label, width, height] of [
  ['zh', 'tablet', 768, 1024],
  ['en', 'tablet', 768, 1024],
  ['en', 'mobile', 390, 844],
]) {
  await navigate(locale, width, height);
  await evaluate(`document.querySelector('#run-model').click()`);
  await waitFor(`Boolean(document.querySelector('.state-success'))`, `${locale} ${label} success missing`);
  await capture(`${locale}-${label}-success`);
  const responsiveLayout = await evaluate(`(() => {
    const panelRight = document.querySelector('.result-panel').getBoundingClientRect().right;
    const metricElement = document.querySelector('.result-summary dl > div:last-child dd');
    const chartElement = document.querySelector('.result-chart figcaption > span:last-child');
    const distributionElements = [...document.querySelectorAll('.distribution-value')];
    const metric = metricElement.getBoundingClientRect().right;
    const chart = chartElement.getBoundingClientRect().right;
    const distribution = Math.max(...distributionElements.map(element => element.getBoundingClientRect().right));
    return {
      panelRight,
      metric,
      chart,
      distribution,
      clipped: metricElement.scrollWidth > metricElement.clientWidth + 1 ||
        chartElement.scrollWidth > chartElement.clientWidth + 1 ||
        distributionElements.some(element => element.scrollWidth > element.clientWidth + 1),
    };
  })()`);
  responsiveLayouts.push({locale, label, ...responsiveLayout});
  assert(!responsiveLayout.clipped, `${locale} ${label} contains clipped text: ${JSON.stringify(responsiveLayout)}`);
  for (const [name, right] of Object.entries(responsiveLayout)) {
    if (name !== 'panelRight') assert(right <= responsiveLayout.panelRight + 1, `${locale} ${label} ${name} is clipped: ${JSON.stringify(responsiveLayout)}`);
  }
  assert(await evaluate(`document.documentElement.scrollWidth <= window.innerWidth + 1`), `${locale} ${label} overflows horizontally`);
}

await navigate('zh', 390, 844);
await capture('zh-mobile-idle');
scenario = 'hold';
await evaluate(`document.querySelector('#run-model').click()`);
await waitFor(`Boolean(document.querySelector('.state-running'))`, 'Mobile loading missing');
await capture('zh-mobile-loading');
await releaseHeld();
await waitFor(`Boolean(document.querySelector('.state-success'))`, 'Mobile success missing');
await capture('zh-mobile-success');
const mobileSuccessLayout = await evaluate(`(() => {
  const panel = document.querySelector('.result-panel').getBoundingClientRect();
  const y = Math.max(0, Math.min(window.innerHeight - 1, panel.top + 230));
  return {
    panelTop: panel.top,
    hit: document.elementsFromPoint(window.innerWidth - 31, y).slice(0, 5).map(element => ({
      tag: element.tagName,
      id: element.id,
      className: String(element.className),
    })),
  };
})()`);
assert(await evaluate(`document.documentElement.scrollWidth <= window.innerWidth + 1`), 'Mobile page overflows horizontally');
assert(await evaluate(`(() => {
  const region = document.querySelector('.result-table-scroll');
  return region && region.scrollWidth > region.clientWidth && region.tabIndex === 0;
})()`), 'Mobile prediction table needs keyboard-accessible horizontal scrolling');
scenario = 503;
await evaluate(`document.querySelector('#run-model').click()`);
await waitFor(`Boolean(document.querySelector('.state-error'))`, 'Mobile error missing');
await capture('zh-mobile-error');
assert(await evaluate(`document.documentElement.scrollWidth <= window.innerWidth + 1`), 'Mobile error overflows horizontally');

await navigate('zh');
const moreQueries = sampleCsv.trimEnd() + '\n12.2,3.2,0.80,\n14.4,4.3,0.67,\n15.5,4.7,0.56,\n10.3,4.2,1.07,\n16.2,5.0,0.51,\n9.7,3.8,1.13,';
await upload('twelve-predictions.csv', moreQueries);
await evaluate(`document.querySelector('#run-model').click()`);
await waitFor(`Boolean(document.querySelector('.state-success'))`, 'Pagination fixture failed');
assert.equal(await evaluate(`document.querySelectorAll('.result-table tbody tr').length`), 10);
await evaluate(`document.querySelector('#result-next').click()`);
await sleep(200);
assert.equal(await evaluate(`document.querySelectorAll('.result-table tbody tr').length`), 2);
assert.equal(await evaluate(`document.querySelector('.result-sample-number').textContent`), '11', 'Pagination must preserve global sample numbers');

assert.deepEqual(consoleErrors, [], 'Browser console errors');
assert.deepEqual(pageErrors, [], 'Browser runtime errors');
const report = {
  generatedAt: new Date().toISOString(),
  states: ['idle', 'loading', 'success', 'error'],
  interactions: ['download', 'retry', 'back-to-data', 'double-submit-guard', 'pagination', 'upload-validation', 'input-pagination', 'drag-upload', 'target-selection', 'restore-sample'],
  locales: ['zh', 'en'],
  viewports: ['1440x1000', '768x1024', '390x844', '320x844'],
  workspaceScreenshots: 6,
  downloaded,
  inputBaseline,
  desktopLayout,
  responsiveLayouts,
  mobileSuccessLayout,
  externalArtifactsExcluded: ['DOUBAO-AI-CSUI browser-injected assistant'],
  requestCount,
  consoleErrors,
  pageErrors,
};
await writeFile(path.join(OUT, 'qa-report.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
await cleanup();
