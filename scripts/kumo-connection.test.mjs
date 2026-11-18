import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {kumoEndpoint, connectionFailure} from './kumo-connection.mjs';

test('URL must be explicit and preserve the full path', () => {
  assert.throws(() => kumoEndpoint('', 'http://127.0.0.1:3000'));
  assert.throws(() => kumoEndpoint('http://localhost:3000/api/kumo/predict', 'http://127.0.0.1:3000'));
  assert.throws(() => kumoEndpoint('https://user:secret@example.test/predict', 'http://127.0.0.1:3000'));
  assert.equal(kumoEndpoint('https://gpu.example.test/v1/predict', 'http://127.0.0.1:3000'),
    'https://gpu.example.test/v1/predict');
});

test('nested failures distinguish refusal, timeout, DNS and TLS without exposing messages', () => {
  const refusal = new Error('secret upstream', {
    cause: new AggregateError([Object.assign(new Error('secret'), {code: 'ECONNREFUSED'})]),
  });
  assert.deepEqual(connectionFailure(refusal), {kind: 'connection_refused', code: 'ECONNREFUSED'});
  assert.equal(connectionFailure(new Error(), true).kind, 'timeout');
  assert.equal(connectionFailure({cause: {code: 'UND_ERR_CONNECT_TIMEOUT'}}).kind, 'timeout');
  assert.equal(connectionFailure({cause: {code: 'ENOTFOUND'}}).kind, 'dns_error');
  assert.equal(connectionFailure({cause: {code: 'ERR_TLS_CERT_ALTNAME_INVALID'}}).kind, 'tls_error');
  assert.deepEqual(connectionFailure(new Error('secret')), {kind: 'connection_error', code: 'NETWORK_ERROR'});
});

async function listen(server) {
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  return server.address().port;
}

async function close(server) {
  server.closeAllConnections();
  await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
}

test('preview preserves bytes/status and safely logs refused connections', {timeout: 15000}, async () => {
  let status = 200;
  const payload = '{"rows":[{"x":1,"label":"a"},{"x":2,"label":null}],"target_column":"label"}';
  const responseBody = '{"fixture":"response bytes"}';
  const received = [];
  const upstream = http.createServer(async (req, res) => {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    received.push({path: req.url, method: req.method, body: Buffer.concat(chunks).toString()});
    res.writeHead(status, {'Content-Type': 'application/json'}).end(responseBody);
  });
  const upstreamPort = await listen(upstream);
  const reservation = http.createServer();
  const previewPort = await listen(reservation);
  await close(reservation);
  const child = spawn(process.execPath, ['scripts/preview.mjs', '--kumo'], {
    env: {...process.env, THINKCAT_PREVIEW_PORT: String(previewPort),
      KUMO_INFERENCE_URL: 'http://127.0.0.1:' + upstreamPort + '/predict?key=secret-marker'},
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let logs = '';
  let upstreamClosed = false;
  child.stderr.on('data', chunk => { logs += chunk; });
  try {
    await Promise.race([
      once(child.stdout, 'data'),
      once(child, 'exit').then(() => { throw new Error('Preview exited before listening'); }),
    ]);
    const predict = () => fetch('http://127.0.0.1:' + previewPort + '/api/kumo/predict', {
      method: 'POST', headers: {'Content-Type': 'application/json'}, body: payload,
      signal: AbortSignal.timeout(4000),
    });
    for (const upstreamStatus of [200, 422, 503]) {
      status = upstreamStatus;
      const response = await predict();
      assert.equal(response.status, status);
      assert.equal(await response.text(), responseBody);
    }
    assert(received.every(req => req.method === 'POST' && req.body === payload && req.path === '/predict?key=secret-marker'));
    await close(upstream);
    upstreamClosed = true;
    const refused = await predict();
    assert.equal(refused.status, 502);
    await refused.text();
  } finally {
    child.kill();
    await once(child, 'exit');
    if (!upstreamClosed) await close(upstream);
  }
  assert.match(logs, /upstream_http_error/);
  assert.match(logs, /connection_refused/);
  assert.doesNotMatch(logs, /secret-marker|target_column|fixture|http:/);
});
