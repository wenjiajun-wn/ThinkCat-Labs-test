import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdir, mkdtemp, readFile, readdir, rm, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import ts from 'typescript';

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const BASE = process.env.THINKCAT_QA_ORIGIN ?? 'http://127.0.0.1:3000';
const PORT = Number(process.env.THINKCAT_QA_CDP_PORT ?? 9335);
const OUT = path.resolve(process.argv[2] ?? 'artifacts/playground-results-qa/after');
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const exampleFiles = (await readdir('content/datasets')).filter(name => /^\d+\.json$/.test(name));
const examples = await Promise.all(exampleFiles.map(async name => JSON.parse(await readFile(`content/datasets/${name}`, 'utf8'))));
const exampleCount = examples.length;
const evaluationSpecs = JSON.parse(await readFile('content/datasets/evaluation.json', 'utf8'));
const {outputText: csvModule} = ts.transpileModule(await readFile('lib/csv.ts', 'utf8'), {compilerOptions: {target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022}});
const {parseCsv} = await import('data:text/javascript;base64,' + Buffer.from(csvModule).toString('base64'));
let metadataChunk;
for (const file of await readdir('out/_next/static/chunks', {recursive: true})) {
  if (file.endsWith('.js') && (await readFile(path.join('out/_next/static/chunks',file),'utf8')).includes(evaluationSpecs['46913'].datasetVersion)) {
    metadataChunk=file.replaceAll('\\','/');break;
  }
}
assert(metadataChunk, 'Could not locate the independently loaded evaluation metadata chunk');
const evaluationChecks = [];
const absentEvaluation = `!document.querySelector('.evaluation-summary,.evaluation-error,.prediction-actual')`;

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
let lastRequest = null;
let holdMetadata = false;
let heldMetadata = null;
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
    if (await evaluate(`Boolean(${expression})`)) return;
    await sleep(75);
  }
  throw new Error(message);
}

function resultFor(request) {
  const {rows, target_column: target} = JSON.parse(request.postData);
  const classes = [...new Set(rows.map(row => row[target]).filter(value => value !== null))];
  const rowIndices = rows.map((row, index) => row[target] !== null ? null : index).filter(index => index !== null);
  const predictions = rowIndices.map((_, index) => classes[index % classes.length]);
  const probabilities = predictions.map((label, index) => {
    const top = .78 + (index % 6) * .03;
    const rest = (1 - top) / (classes.length - 1);
    return Object.fromEntries(classes.map(category => [category, category === label ? top : rest]));
  });
  // Reverse the server response to prove mapping uses row_indices, never response order.
  return {model: 'Kumo Tabular Medium', row_indices: rowIndices.reverse(), predictions: predictions.reverse(), probabilities: probabilities.reverse(), classes};
}

function fulfill(requestId, request, currentScenario = scenario) {
  const status = typeof currentScenario === 'number' ? currentScenario : 200;
  const body = currentScenario === 'invalid' ? {unexpected: true}
    : status === 200 ? resultFor(request) : {error: 'controlled QA failure'};
  if (currentScenario === 'invalid-probabilities') {
    body.probabilities = body.predictions.map(() => Object.fromEntries(body.classes.map(label => [label, .9])));
  }
  if (currentScenario === 'duplicate-index') body.row_indices[1] = body.row_indices[0];
  if (currentScenario === 'missing-index') { body.row_indices.pop(); body.predictions.pop(); body.probabilities.pop(); }
  if (currentScenario === 'unknown-index') body.row_indices[0] = 99999;
  if (currentScenario === 'unknown-class') body.predictions[0] = 'not-a-context-class';
  if (currentScenario === 'count-mismatch') body.predictions.pop();
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
    if (holdMetadata && paused.request.url.includes(metadataChunk)) { heldMetadata=paused;return; }
    if (!paused.request.url.endsWith('/api/kumo/predict')) {
      command('Fetch.continueRequest', {requestId: paused.requestId});
      return;
    }
    requestCount += 1;
    lastRequest = JSON.parse(paused.request.postData);
    if (scenario === 'hold') {
      held = paused;
      return;
    }
    fulfill(paused.requestId, paused.request);
  }
});

await command('Page.enable');
await command('Runtime.enable');
await command('Fetch.enable', {patterns: [{urlPattern: '*/api/kumo/predict'}, {urlPattern: `*${metadataChunk}*`}]});
await command('Browser.setDownloadBehavior', {behavior: 'allow', downloadPath: downloads, eventsEnabled: true});

async function navigate(locale = 'zh', width = 1440, height = 1000, datasetId = '') {
  scenario = 'success';
  held = null;
  await command('Emulation.setDeviceMetricsOverride', {width, height, deviceScaleFactor: 1, mobile: width < 600});
  await command('Page.navigate', {url: `${BASE}/${locale}/playground/${datasetId ? `?dataset=${datasetId}` : ''}`});
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
  await captureElement(name, '.workbench');
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


function assertRequestIsolation(data) {
  assert.deepEqual(Object.keys(lastRequest).sort(), ['rows', 'target_column']);
  assert.equal(lastRequest.target_column, data.target);
  const targetIndex = data.headers.indexOf(data.target);
  const expected = data.rows.map(row => Object.fromEntries(data.headers.map((column, i) => [column, i === targetIndex ? row[i] || null : Number(row[i])])));
  // Compare JSON wire values: JSON.stringify canonically serializes -0 as 0.
  assert.deepEqual(lastRequest.rows, JSON.parse(JSON.stringify(expected)), 'Request must contain only original features, support labels and null query labels');
}

async function assertEvaluation(data, locale = 'zh') {
  const spec = evaluationSpecs[data.id];
  const classes = [...new Set(lastRequest.rows.map(row => row[data.target]).filter(value => value !== null))];
  const truths = new Map(spec.queryLabels.map(row => [row.index, row]));
  const correct = data.queryIndices.filter((index, ordinal) => classes[ordinal % classes.length] === truths.get(index).label).length;
  const total = data.queryIndices.length;
  const summary = await evaluate(`(() => {const e=document.querySelector('.evaluation-summary');return e && {accuracy:Number(e.dataset.accuracy),correct:Number(e.dataset.correct),total:Number(e.dataset.total),text:e.textContent}})()`);
  assert(summary, 'Built-in example did not display evaluation');
  assert.equal(summary.accuracy, correct / total);
  assert.equal(summary.correct, correct); assert.equal(summary.total, total);
  assert(summary.text.includes((correct / total * 100).toFixed(1)));
  assert(summary.text.includes(locale === 'zh' ? '示例留出集准确率' : 'Example holdout accuracy'));
  assert(await evaluate(`Boolean(document.querySelector('.evaluation-note')) && !document.querySelector('.evaluation-error')`));
  const actuals = await evaluate(`[...document.querySelectorAll('.source-table tbody tr')].filter(r=>r.querySelector('.prediction-actual')).map(r=>({source:Number(r.dataset.sourceRow),text:r.querySelector('.prediction-actual').textContent,correct:r.querySelector('.prediction-actual').dataset.correct}))`);
  assert.equal(actuals.length,total);
  for (const [ordinal,index] of data.queryIndices.entries()) {
    const truth = truths.get(index);
    const row = actuals.find(item => item.source === truth.sourceRecord);
    assert(row, 'Real label mapped to wrong source record');
    assert(row.text.includes(truth.label));
    assert(row.text.includes(locale === 'zh' ? '真实' : 'Actual'));
    assert.equal(row.correct,String(classes[ordinal % classes.length] === truth.label));
  }
  return summary;
}

async function downloadCsv() {
  // CDP may overwrite an existing same-name download. Clear only CSVs in this
  // test's fresh temporary download directory, never the user's Downloads.
  for (const name of await readdir(downloads)) {
    const file=path.resolve(downloads,name);
    if(name.endsWith('.csv') && path.dirname(file)===downloads) await rm(file);
  }
  const before = new Set(await readdir(downloads));
  await evaluate(`document.querySelector('#download-results').click()`);
  for (let attempt=0; attempt<40; attempt++) {
    const filename=(await readdir(downloads)).find(name => name.endsWith('.csv') && !before.has(name));
    if (filename) {
      const text=await readFile(path.join(downloads,filename),'utf8');
      return {filename,text,csv:parseCsv(text)};
    }
    await sleep(100);
  }
  throw new Error('Results CSV was not downloaded');
}

await captureWorkbenchSet();
if(process.env.THINKCAT_QA_CAPTURE_ONLY==='1') {
  console.log('Capture only: no model requests made.');
  await cleanup();
  process.exit(0);
}
await navigate();
assert(await evaluate(`!document.querySelector('.workbench-topbar,.source-intro,.source-help,.source-restore,.preview-pagination,.result-pagination,.result-empty,#result-back')`));
assert.equal(await evaluate(`document.querySelectorAll('.source-table tbody tr').length`),40);
assert.equal(await evaluate(`document.querySelectorAll('.source-table tbody tr[data-query]').length`),8);
assert(await evaluate(`!document.querySelector('#run-model').disabled`));
const names=[];
const dimensions=[];
for(let i=0;i<exampleCount;i++){
 names.push(await evaluate(`document.querySelector('.preview-toolbar h3').textContent`));
 const before=await evaluate(`({count:document.querySelectorAll('.source-table tbody tr').length,columns:document.querySelectorAll('.source-table thead th').length-1,queries:[...document.querySelectorAll('.source-table tbody tr[data-query]')].map(r=>Number(r.dataset.sourceRow))})`);
 dimensions.push({name:names[i],rows:before.count,columns:before.columns,queries:before.queries.length});
 const data=examples.find(item=>item.rows.length===before.count);
 assert(data);
 assert(await evaluate(absentEvaluation));
 await evaluate(`document.querySelector('#run-model').click()`);
 await waitFor(`document.querySelector('.state-success')`,'Prediction failed');
 assertRequestIsolation(data);
 const summary=await assertEvaluation(data);
 evaluationChecks.push({datasetId:data.id,correct:summary.correct,total:summary.total,accuracy:summary.accuracy,predictions:'deterministic browser mock'});
 assert.equal(lastRequest.rows.length,before.count,'Send support and query records');
 assert.equal(lastRequest.rows.filter(r=>r[lastRequest.target_column]===null).length,before.queries.length);
 assert.deepEqual(await evaluate(`[...document.querySelectorAll('.source-table tbody tr[data-query]')].map(r=>Number(r.dataset.sourceRow))`),before.queries);

 assert.equal(await evaluate(`document.querySelectorAll('.workbench table').length`),1);
 assert.equal(await evaluate(`document.querySelectorAll('.source-table tr[data-predicted]').length`),before.queries.length);
 const originalRequest=JSON.stringify(lastRequest);
 const classes=[...new Set(lastRequest.rows.map(r=>r[lastRequest.target_column]).filter(value=>value!==null))];
 let queryOrdinal=0;
 const cells=await evaluate(`[...document.querySelectorAll('.source-table tbody tr')].map(r=>({source:Number(r.dataset.sourceRow),label:r.querySelector('td[data-label]').textContent,prediction:r.querySelector('.prediction-label')?.textContent,probability:r.querySelector('.prediction-meta')?.textContent}))`);
 for(let row=0;row<cells.length;row++) {
  const label=lastRequest.rows[row][lastRequest.target_column];
  if(label!==null) { assert.equal(cells[row].label,label); assert.equal(cells[row].prediction,undefined); }
  else {
   assert.equal(cells[row].prediction,classes[queryOrdinal % classes.length]);
   assert(cells[row].probability.includes(`${78+(queryOrdinal % 6)*3}%`));
   queryOrdinal++;
  }
 }
 await evaluate(`document.querySelector('.preview-filter input').click()`);
 assert.equal(await evaluate(`document.querySelectorAll('.source-table tbody tr').length`),before.queries.length);
 assert.deepEqual(await assertEvaluation(data),summary,'Filtering must not change accuracy denominator');
 if(i===0){
  const download=await downloadCsv();
  const actualIndex=download.csv.headers.indexOf('actual_label');
  const correctIndex=download.csv.headers.indexOf('is_correct');
  const sourceIndex=download.csv.headers.indexOf('source_row');
  assert(actualIndex>=0 && correctIndex>=0 && sourceIndex>=0);
  assert.equal(download.csv.rows.length,data.queryIndices.length);
  for(const row of download.csv.rows) {
   const truth=evaluationSpecs[data.id].queryLabels.find(item=>item.sourceRecord===Number(row[sourceIndex]));
   assert.equal(row[actualIndex],truth.label);
   const prediction=row[download.csv.headers.indexOf('prediction')];
   assert.equal(row[correctIndex],String(prediction===truth.label));
  }
 }
 await capture(`dataset-${i}-success`);
 // Re-running must keep the original query labels null even when predictions are visible.
 await evaluate(`document.querySelector('#run-model').click()`);
 await waitFor(`document.querySelector('.state-success')`,'Rerun failed');
 assert.equal(JSON.stringify(lastRequest),originalRequest);
 assert.deepEqual(await assertEvaluation(data),summary);
 await evaluate(`document.querySelector('.preview-filter input').click()`);
 assert.equal(await evaluate(`document.querySelectorAll('.source-table tbody tr').length`),before.count);

 await evaluate(`document.querySelector('#switch-example').click()`);
 await waitFor(`document.querySelector('.preview-toolbar h3').textContent!==${JSON.stringify(names[i])}`,'Dataset did not switch');
 assert(await evaluate(`!document.querySelector('.state-success,.prediction-label')`));
 assert(await evaluate(absentEvaluation));
 assert.equal(await evaluate(`document.querySelector('.source-table-scroll').scrollTop`),0);
}
assert.equal(new Set(names).size,exampleCount);
assert.equal(new Set(dimensions.map(item=>item.rows)).size,exampleCount);
assert.equal(new Set(dimensions.map(item=>item.columns)).size,exampleCount-1);
assert.equal(await evaluate(`document.querySelector('.preview-toolbar h3').textContent`),names[0]);

// A file with the same name and exact contents as a built-in sample is still an upload.
const builtin=examples.find(item=>item.id==='46913');
const sameCsv=[builtin.headers,...builtin.rows].map(row=>row.join(',')).join('\n');
await upload('openml-46913.csv',sameCsv);
assert(await evaluate(absentEvaluation));
await evaluate(`(()=>{const s=document.querySelector('.preview-target select');s.value='${builtin.headers.indexOf(builtin.target)}';s.dispatchEvent(new Event('change',{bubbles:true}));})()`);
await evaluate(`document.querySelector('#run-model').click()`);
await waitFor(`document.querySelector('.state-success')`,'Same-content upload failed');
assertRequestIsolation(builtin);
assert(await evaluate(absentEvaluation));
const uploadedDownload=await downloadCsv();
assert(!uploadedDownload.csv.headers.includes('actual_label') && !uploadedDownload.csv.headers.includes('is_correct'));
await navigate();

// Mouse dragging starts on cell padding; values remain native selectable text.
await evaluate(`window.scrollTo({top:0,behavior:"instant"});document.querySelector('.source-table-scroll').scrollTop=0`);
const point=await evaluate(`(()=>{const r=document.querySelector('.source-table tbody tr:nth-child(5) td').getBoundingClientRect();return {x:r.left+5,y:r.top+5}})()`);
await command('Input.dispatchMouseEvent',{type:'mouseMoved',...point});
await command('Input.dispatchMouseEvent',{type:'mousePressed',...point,button:'left',buttons:1,clickCount:1});
for(let dy=10;dy<=130;dy+=10)await command('Input.dispatchMouseEvent',{type:'mouseMoved',x:point.x,y:point.y-dy,button:'left',buttons:1});
await command('Input.dispatchMouseEvent',{type:'mouseReleased',x:point.x,y:point.y-130,button:'left',buttons:0,clickCount:1});
assert(await evaluate(`document.querySelector('.source-table-scroll').scrollTop>50`),'Mouse drag did not scroll');
assert(await evaluate(`getComputedStyle(document.querySelector('.source-table [data-selectable]')).userSelect==='text'`));
await evaluate(`document.querySelector('.source-table-scroll').focus()`);
const top=await evaluate(`document.querySelector('.source-table-scroll').scrollTop`);
await command('Input.dispatchKeyEvent',{type:'keyDown',key:'PageDown',code:'PageDown',windowsVirtualKeyCode:34});
await command('Input.dispatchKeyEvent',{type:'keyUp',key:'PageDown',code:'PageDown',windowsVirtualKeyCode:34});
await sleep(300);
assert(await evaluate(`document.querySelector('.source-table-scroll').scrollTop>${top}`),'Keyboard did not scroll');

// The wide JM1 table pans horizontally; dragging text still selects it natively.
await evaluate(`document.querySelector('#switch-example').click()`);await sleep(100);
await evaluate(`document.querySelector('#switch-example').click()`);await sleep(100);
await evaluate(`window.scrollTo({top:0,behavior:'instant'})`);
const widePoint=await evaluate(`(()=>{const r=document.querySelector('.source-table tbody tr:nth-child(4) td').getBoundingClientRect();return {x:r.right-4,y:r.top+4}})()`);
await command('Input.dispatchMouseEvent',{type:'mousePressed',...widePoint,button:'left',buttons:1,clickCount:1});
for(let dx=10;dx<=80;dx+=10)await command('Input.dispatchMouseEvent',{type:'mouseMoved',x:widePoint.x-dx,y:widePoint.y,buttons:1,button:'left'});
await command('Input.dispatchMouseEvent',{type:'mouseReleased',x:widePoint.x-80,y:widePoint.y,button:'left',clickCount:1});
assert(await evaluate(`document.querySelector('.source-table-scroll').scrollLeft>40`),'Horizontal mouse drag failed');
await evaluate(`document.querySelector('.source-table-scroll').scrollLeft=0`);
const textPoint=await evaluate(`(()=>{const r=document.querySelector('.source-table tbody tr:first-child td [data-selectable]').getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2}})()`);
await command('Input.dispatchMouseEvent',{type:'mousePressed',...textPoint,button:'left',buttons:1,clickCount:2});
await command('Input.dispatchMouseEvent',{type:'mouseReleased',...textPoint,button:'left',clickCount:2});
assert(await evaluate(`window.getSelection().toString().length>0`),'Native text selection failed');
await evaluate(`window.getSelection().removeAllRanges();document.querySelector('#switch-example').click()`);await sleep(100);

// Cancellation: switching while a request is pending must discard its response.
scenario='hold';
await evaluate(`document.querySelector('#run-model').click();document.querySelector('#run-model').click()`);
await waitFor(`document.querySelector('.state-running')`,'No running state');
await sleep(150);assert(held);
const count=requestCount;
await evaluate(`document.querySelector('#run-model').click()`);
await sleep(100);assert.equal(requestCount,count);
await evaluate(`document.querySelector('#switch-example').click()`);
await releaseHeld().catch(()=>{});
await sleep(250);
assert(await evaluate(`!document.querySelector('.state-success,.state-error')`),'Stale result polluted new source');
assert(await evaluate(absentEvaluation));

// A custom target, zero and false labels; all records remain accessible.
const custom='measurement,outcome\n'+Array.from({length:24},(_,i)=>`${i+1},${i<18?(i%2?'false':'0'):''}`).join('\n');
await upload('custom.csv',custom,'drop');
assert.equal(await evaluate(`document.querySelectorAll('.source-table tbody tr').length`),24);
assert.equal(await evaluate(`document.querySelectorAll('.source-table tbody tr[data-query]').length`),6);
await evaluate(`document.querySelector('#run-model').click()`);
await waitFor(`document.querySelector('.state-success')`,'Custom target failed');
assert.equal(lastRequest.target_column,'outcome');
assert.equal(lastRequest.rows.filter(r=>r.outcome===null).length,6);
assert.equal(lastRequest.rows[0].outcome,'0');
assert.equal(lastRequest.rows[1].outcome,'false');
assert.deepEqual(await evaluate(`[...document.querySelectorAll('.source-table tbody tr[data-query]')].map(r=>Number(r.dataset.sourceRow))`),[20,21,22,23,24,25]);
assert(await evaluate(absentEvaluation));
const customDownload=await downloadCsv();
const downloaded=customDownload.filename;
const exported=customDownload.text;
assert(!customDownload.csv.headers.includes('actual_label') && !customDownload.csv.headers.includes('is_correct'));
assert.equal(exported.trim().split('\r\n').length,7);
assert(exported.includes('19,,20,'),'Download lost original source mapping');

await upload('unknown.csv',custom.replace('outcome','decision'));
assert(await evaluate(`document.querySelector('.preview-target select') && document.querySelector('#run-model').disabled`));
await evaluate(`(()=>{const s=document.querySelector('.preview-target select');s.value='1';s.dispatchEvent(new Event('change',{bubbles:true}));})()`);
await waitFor(`!document.querySelector('#run-model').disabled`,'Target choice failed');
for(const error of [413,429,'invalid','invalid-probabilities','duplicate-index','missing-index','unknown-index','unknown-class','count-mismatch']){
 scenario=error;
 await evaluate(`document.querySelector('#run-model').click()`);
 await waitFor(`document.querySelector('.state-error')`,'No request error');
 assert(await evaluate(absentEvaluation));
 assert.equal(await evaluate(`document.querySelectorAll('.source-table tbody tr[data-query]').length`),6);
}
scenario='success';await evaluate(`document.querySelector('#result-retry').click()`);
await waitFor(`document.querySelector('.state-success')`,'Retry failed');
await upload('no-query.csv',custom.replace(/,$/gm,',0'));
assert(await evaluate(`document.querySelector('#run-model').disabled && !document.querySelector('.result-table')`));
await upload('no-labels.csv','x,target\n'+Array.from({length:24},(_,i)=>`${i},`).join('\n'));
assert(await evaluate(`document.querySelector('#run-model').disabled && Boolean(document.querySelector('#workbench-error'))`));
await upload('ambiguous.csv',custom.replace('measurement,outcome','target,class'));
assert(await evaluate(`document.querySelector('.preview-target select') && document.querySelector('#run-model').disabled`));

// Controlled asynchronous races. Old responses must never restore evaluation.
async function holdRun() {
 scenario='hold';
 await evaluate(`document.querySelector('#run-model').click()`);
 await waitFor(`document.querySelector('.state-running')`,'No pending state');
 for(let attempt=0;!held && attempt<100;attempt++) await sleep(20);
 assert(held,'Expected held request');
 assert(await evaluate(absentEvaluation),'Starting a run must clear old evaluation');
}
await navigate();
await evaluate(`document.querySelector('#run-model').click()`);
await waitFor(`document.querySelector('.evaluation-summary')`,'Initial evaluation missing');
await holdRun();
await upload('replacement.csv',custom);
await releaseHeld().catch(()=>{});
await sleep(150);
assert(await evaluate(absentEvaluation));
assert(await evaluate(`!document.querySelector('.state-success')`));

await navigate();
await holdRun();
const oldRequest=held;held=null;
await navigate('zh',1440,1000,'46941');
await fulfill(oldRequest.requestId,oldRequest.request,'success').catch(()=>{});
await sleep(150);
assert.equal(await evaluate(`document.querySelectorAll('.source-table tbody tr').length`),60);
assert(await evaluate(absentEvaluation));
await evaluate(`document.querySelector('#run-model').click()`);
await waitFor(`document.querySelector('.evaluation-summary')`,'URL dataset did not evaluate');
await assertEvaluation(examples.find(item=>item.id==='46941'));

// Changing a target while a user CSV request is in flight cancels it.
await upload('change-target.csv',custom.replace('outcome','decision'));
await evaluate(`(()=>{const s=document.querySelector('.preview-target select');s.value='1';s.dispatchEvent(new Event('change',{bubbles:true}));})()`);
await holdRun();
await evaluate(`(()=>{const s=document.querySelector('.preview-target select');s.value='0';s.dispatchEvent(new Event('change',{bubbles:true}));})()`);
await releaseHeld().catch(()=>{});
await sleep(150);
assert(await evaluate(absentEvaluation));
assert(await evaluate(`!document.querySelector('.state-success') && document.querySelector('#run-model').disabled`));

// A failing read cannot leave the previous example's score visible.
await navigate();
await evaluate(`document.querySelector('#run-model').click()`);
await waitFor(`document.querySelector('.evaluation-summary')`,'Evaluation before read error missing');
await evaluate(`(() => {
 const original=File.prototype.text;
 File.prototype.text=function(){return this.name==='read-failure.csv'?Promise.reject(new Error('Controlled read failure')):original.call(this)};
 const input=document.querySelector('input[type="file"]');
 const transfer=new DataTransfer();transfer.items.add(new File(['x,target\\n1,A'],'read-failure.csv',{type:'text/csv'}));
 input.files=transfer.files;input.dispatchEvent(new Event('change',{bubbles:true}));
 File.prototype.text=original;
})()`);
await waitFor(`document.querySelector('#workbench-error')`,'Missing file read error');
assert(await evaluate(absentEvaluation));

// Accelerate only the existing 60-second timeout in this isolated QA page.
await navigate();
await evaluate(`(() => {window.__qaTimeout=window.setTimeout;window.setTimeout=(fn,ms,...args)=>window.__qaTimeout(fn,ms===60000?200:ms,...args);})()`);
await holdRun();
await waitFor(`document.querySelector('.state-error')`,'Timeout did not surface');
assert(await evaluate(`document.querySelector('.state-error').textContent.includes('超时')`));
assert(await evaluate(absentEvaluation));
await releaseHeld().catch(()=>{});
await sleep(150);
assert(await evaluate(absentEvaluation));
await evaluate(`window.setTimeout=window.__qaTimeout;delete window.__qaTimeout`);

// Corrupt only the browser's version digest; prediction remains usable, evaluation fails closed.
await navigate();
for(const mode of ['wrong-version','digest-failure']) {
 await evaluate(`(() => {
  window.__qaDigest=crypto.subtle.digest.bind(crypto.subtle);
  crypto.subtle.digest=async()=>{if(${JSON.stringify(mode)}==='digest-failure')throw new Error('Controlled digest failure');return new Uint8Array(32).buffer};
 })()`);
 scenario='success';
 await evaluate(`document.querySelector('#run-model').click()`);
 await waitFor(`document.querySelector('.state-success') && document.querySelector('.evaluation-error')`,'Evaluation failure should preserve successful predictions');
 assert(await evaluate(`!document.querySelector('.state-error,.evaluation-summary,.prediction-actual')`));
 assert.equal(await evaluate(`document.querySelectorAll('.source-table tr[data-predicted]').length`),8);
 const withoutEvaluation=await downloadCsv();
 assert(!withoutEvaluation.csv.headers.includes('actual_label') && !withoutEvaluation.csv.headers.includes('is_correct'));
 await capture(`zh-desktop-${mode}`);
 await evaluate(`crypto.subtle.digest=window.__qaDigest;delete window.__qaDigest`);
 await evaluate(`document.querySelector('#run-model').click()`);
 await waitFor(`document.querySelector('.evaluation-summary')`,'Evaluation did not recover after metadata failure');
 await assertEvaluation(builtin);
}
// Uploads do not call the built-in version/ground-truth evaluator at all.
await upload('no-evaluation.csv',custom);
await evaluate(`window.__qaDigest=crypto.subtle.digest.bind(crypto.subtle);crypto.subtle.digest=async()=>{throw new Error('Upload must not evaluate')}`);
await evaluate(`document.querySelector('#run-model').click()`);
await waitFor(`document.querySelector('.state-success')`,'Upload prediction depends on evaluation');
assert(await evaluate(absentEvaluation));
await evaluate(`crypto.subtle.digest=window.__qaDigest;delete window.__qaDigest`);

// Delay the lazy answer resource beyond the inference deadline, but within the
// separate bounded evaluation wait. A valid model result must survive.
await command('Network.enable');
await command('Network.setCacheDisabled',{cacheDisabled:true});
holdMetadata=true;heldMetadata=null;
await navigate();
await evaluate(`(() => {window.__qaTimeout=window.setTimeout;window.setTimeout=(fn,ms,...args)=>window.__qaTimeout(fn,ms===60000?750:ms===5000?1000:ms,...args);})()`);
await evaluate(`document.querySelector('#run-model').click()`);
await waitFor(`document.querySelector('.state-success') && document.querySelector('.evaluation-error')`,'Slow evaluation resource discarded valid predictions',6000);
assert(heldMetadata,'Expected the independent answer resource to be delayed');
assert(await evaluate(`!document.querySelector('.state-error,.evaluation-summary,.prediction-actual')`));
assert.equal(await evaluate(`document.querySelectorAll('.source-table tr[data-predicted]').length`),8);
await capture('zh-desktop-slow-evaluation-resource');
holdMetadata=false;
await command('Fetch.continueRequest',{requestId:heldMetadata.requestId});heldMetadata=null;
await evaluate(`window.setTimeout=window.__qaTimeout;delete window.__qaTimeout`);
await sleep(250);
assert(await evaluate(`!document.querySelector('.evaluation-summary')`),'Late metadata must not silently replace a completed run');
await evaluate(`document.querySelector('#run-model').click()`);
await waitFor(`document.querySelector('.evaluation-summary')`,'Evaluation failed to recover after answer resource became available');
await assertEvaluation(builtin);
await command('Network.setCacheDisabled',{cacheDisabled:false});

const responsive=[];
for(const locale of ['zh','en'])for(const width of [1440,1024,768,375,320]){
 await navigate(locale,width,width<600?844:1000);
 const check=await evaluate(`({width:innerWidth,scroll:document.documentElement.scrollWidth,rows:document.querySelectorAll('.source-table tbody tr').length,overflow:document.querySelector('.source-table-scroll').scrollHeight>document.querySelector('.source-table-scroll').clientHeight,sticky:getComputedStyle(document.querySelector('.source-table thead th')).position})`);
 assert(check.scroll<=width+1);assert.equal(check.rows,40);assert(check.overflow);assert.equal(check.sticky,'sticky');responsive.push({locale,...check});
 await captureElement(`${locale}-${width}-input`,'.workbench');
 if(width===375){
  await evaluate(`window.scrollTo({top:0,behavior:"instant"})`);
  const r=await evaluate(`(()=>{const r=document.querySelector('.source-table-scroll').getBoundingClientRect();return {x:r.left+120,y:r.top+180}})()`);
  await command('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:1});
  await command('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...r}]});
  for(let i=1;i<=8;i++)await command('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:r.x,y:r.y-i*12}]});
  await command('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  await sleep(200);
  assert(await evaluate(`document.querySelector('.source-table-scroll').scrollTop>0`),'Touch scrolling failed');
  await command('Emulation.setTouchEmulationEnabled',{enabled:false});
 }
 await evaluate(`document.querySelector('#run-model').click()`);
 await waitFor(`document.querySelector('.state-success')`,'Responsive prediction failed');
 await assertEvaluation(builtin,locale);
 await evaluate(`document.querySelector('.preview-filter input').click();document.querySelector('.source-table-scroll').scrollLeft=99999`);
 assert.equal(await evaluate(`document.querySelectorAll('.source-table tr[data-predicted]').length`),8);
 assert(await evaluate(`document.documentElement.scrollWidth<=innerWidth`));
 await captureElement(`${locale}-${width}-inline-results`,'.workbench');
}
assert.equal(pageErrors.length,0);
await navigate('en',390,844);
const englishNames=[];
for(let i=0;i<exampleCount;i++){
 const name=await evaluate(`document.querySelector('.preview-toolbar h3').textContent`);englishNames.push(name);
 assert(await evaluate(absentEvaluation));
 assert(!/[\u3400-\u9fff]/.test(name));
 assert.equal(await evaluate(`document.querySelectorAll('.source-table tbody tr').length`),dimensions[i].rows);
 assert.equal(await evaluate(`document.querySelectorAll('.source-table thead th').length-1`),dimensions[i].columns);
 assert(await evaluate(`document.documentElement.scrollWidth<=innerWidth && !document.querySelector('#run-model').disabled`));
 await evaluate(`document.querySelector('#switch-example').click()`);
 await waitFor(`document.querySelector('.preview-toolbar h3').textContent!==${JSON.stringify(name)}`,'English dataset did not switch');
}
assert.equal(new Set(englishNames).size,exampleCount);
const report={inference:'Controlled browser mocks only; not real model accuracy.',evaluationChecks,locales:['zh','en'],names,englishNames,dimensions,responsive,requestCount,consoleErrors,pageErrors,downloaded,checks:['15 holdout evaluations from restored labels','shuffled response row mapping','strict request keys and every original feature/support value','filter-independent denominator','rerun preserves null query targets','same-name and same-content upload has no evaluation or export fields','evaluated CSV matches actual labels and correctness','invalid response index/class/count rejected','pending switch/upload/target/URL races','failed file read clears evaluation','accelerated 60-second timeout clears evaluation','metadata version mismatch and digest failure preserve predictions without score/export','upload bypasses evaluator entirely','slow answer resource preserves valid prediction past inference deadline and recovers on rerun','real examples cycle','distinct row and column counts','all English examples on mobile','all rows rendered','inline predictions, target highlighting and query filter','source row mapping','support retained in request','mouse drag vertical and horizontal','keyboard scroll','touch scroll','native text selection','stale response ignored','double-submit guard','CSV download','custom target','0 and false labels','413/429/invalid response','retry','missing labels','no query rows']};
await writeFile(path.join(OUT,'qa-report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));await cleanup();
