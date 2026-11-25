import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile, mkdtemp, writeFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {createServer} from 'node:http';
import {spawn} from 'node:child_process';
import ts from 'typescript';

async function load(file) {
  const {outputText} = ts.transpileModule(await readFile(file, 'utf8'), {
    compilerOptions: {target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022},
  });
  return import('data:text/javascript;base64,' + Buffer.from(outputText).toString('base64'));
}
const {docsCode} = await load('content/docs.ts');
const {parseCsv} = await load('lib/csv.ts');
const {buildKumoDataset, predictWithKumo} = await load('lib/kumo-api.ts');
const request = JSON.parse(docsCode.requestJson);
const response = JSON.parse(docsCode.responseJson);

test('published JSON and CSV match the client request builder and downloadable fixtures', async () => {
  const parsed = parseCsv(docsCode.csv, 'input.csv');
  const result = buildKumoDataset(parsed, parsed.headers.indexOf('label'));
  assert.equal(result.ok, true);
  assert.deepEqual(JSON.parse(JSON.stringify(result.data.request)), request);
  assert.equal(result.data.supportCount, 18);
  assert.deepEqual(result.data.queryIndices, [18, 19]);
  for (const [name, text] of [['request.json', docsCode.requestJson], ['input.csv', docsCode.csv], ['response.example.json', docsCode.responseJson]]) {
    const normalize = value => value.replaceAll('\r\n', '\n').trim();
    assert.equal(normalize(await readFile(`docs/api/examples/${name}`, 'utf8')), normalize(text));
    assert.equal(normalize(await readFile(`public/api-examples/${name}`, 'utf8')), normalize(text));
  }
});

test('placeholder response stays separate from the unchanged live Playground contract', async t => {
  const built = buildKumoDataset(parseCsv(docsCode.csv, 'input.csv'), 2);
  let called = false;
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    called = true;
    assert.equal(url, '/api/predict');
    assert.deepEqual(JSON.parse(options.body), request);
    assert(!new Headers(options.headers).has('Authorization'));
    return new Response(JSON.stringify(response), {status: 200});
  });
  assert.equal(response.model, 'Model');
  await assert.rejects(predictWithKumo(built.data, new AbortController().signal), {code: 'invalid-response'});
  assert(called);
});

test('bilingual navigation covers every rendered section and obsolete API examples are absent', async () => {
  const {docIds, docGroups, docPath} = await load('content/docs-navigation.ts');
  assert.deepEqual(docGroups.flatMap(group => group.pages), [...docIds]);
  for (const locale of ['zh', 'en']) {
    assert.equal(docPath(locale, 'overview'), '/' + locale + '/docs/');
    assert.equal(new Set(docIds.map(id => docPath(locale, id))).size, 6);
  }
  assert.deepEqual(JSON.parse(await readFile('sdk/python/thinkcat/donation.json', 'utf8')),
    JSON.parse(await readFile('public/api-examples/donation-request.json', 'utf8')));
  for (const file of ['content/docs.ts', 'content/home.ts', 'content/products.ts', 'components/developer-docs.tsx']) {
    assert.doesNotMatch(await readFile(file, 'utf8'), /\/v1\/predict|Authorization: Bearer/);
  }
  for (const code of Object.values(docsCode.tabs)) assert(code.includes('/api/predict'));
});

function run(command, args, cwd, origin) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {cwd, env: {...process.env, THINKCAT_API_ORIGIN: origin, NO_PROXY: '127.0.0.1,localhost', no_proxy: '127.0.0.1,localhost'}, windowsHide: true});
    let output = '';
    const timer = setTimeout(() => { child.kill(); reject(new Error('Example did not exit')); }, 15000);
    child.stdout.on('data', data => { output += data; });
    child.stderr.on('data', data => { output += data; });
    child.once('error', error => { clearTimeout(timer); reject(error); });
    child.once('exit', code => { clearTimeout(timer); resolve({code, output}); });
  });
}

test('website and repository Python/JavaScript examples send the documented payload and fail on HTTP errors', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'thinkcat-api-docs-'));
  let status = 200;
  const calls = [];
  const server = createServer(async (req, res) => {
    let body = '';
    for await (const chunk of req) body += chunk;
    calls.push({method: req.method, url: req.url, headers: req.headers, body: JSON.parse(body)});
    res.writeHead(status, {'Content-Type': status === 200 ? 'application/json' : 'text/plain'});
    res.end(status === 200 ? JSON.stringify(response) : 'controlled unavailable response');
  });
  try {
    await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
    const origin = `http://127.0.0.1:${server.address().port}`;
    await writeFile(path.join(dir, 'request.json'), docsCode.requestJson);
    await writeFile(path.join(dir, 'web.mjs'), docsCode.tabs.javascript);
    await writeFile(path.join(dir, 'web.py'), docsCode.tabs.python);
    const cases = [
      [process.execPath, ['web.mjs']], ['python', ['web.py']],
      [process.execPath, [path.resolve('docs/api/examples/predict.mjs')]],
      ['python', [path.resolve('docs/api/examples/predict.py')]],
      [process.platform === 'win32' ? 'curl.exe' : 'curl', ['--fail-with-body', '--show-error', '--silent', '--max-time', '120', '-X', 'POST', `${origin}/api/predict`, '-H', 'Content-Type: application/json', '-H', 'Accept: application/json', '--data-binary', '@request.json']],
    ];
    for (const [command, args] of cases) {
      for (const code of [200, 422, 503]) {
        status = code;
        const result = await run(command, args, dir, origin);
        assert.equal(result.code === 0, code === 200, result.output);
        if (code === 200) assert(result.output.includes('Model'));
        else assert(result.output.includes(String(code)), result.output);
        const sent = calls.at(-1);
        assert.equal(sent.method, 'POST');
        assert.equal(sent.url, '/api/predict');
        assert.equal(sent.headers['content-type'], 'application/json');
        assert.equal(sent.headers.authorization, undefined);
        assert.deepEqual(sent.body, request);
      }
    }
    assert.equal(calls.length, cases.length * 3, 'Examples must not automatically retry');
  } finally {
    await new Promise(resolve => server.close(resolve));
    await rm(dir, {recursive: true, force: true});
  }
});
