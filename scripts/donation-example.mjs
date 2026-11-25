import {readFileSync} from 'node:fs';
import {isDeepStrictEqual} from 'node:util';
import {connectionFailure, logKumoFailure} from './kumo-connection.mjs';

const read = path => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
const example = read('../public/api-examples/donation-request.json');
const payload = JSON.stringify(example);

// The local runner sends only the bundled public example, never a browser request body.
export async function runDonationExample(req, res) {
  if (req.method !== 'POST') return res.writeHead(405, {Allow: 'POST'}).end();
  if (req.headers['content-type']?.split(';')[0] !== 'application/json') return res.writeHead(415).end();
  const parts = [];
  let size = 0;
  try {
    for await (const chunk of req.iterator({destroyOnReturn: false})) {
      size += chunk.length;
      if (size > 8192) { req.resume(); return res.writeHead(413).end(); }
      parts.push(chunk);
    }
    if (!isDeepStrictEqual(JSON.parse(Buffer.concat(parts).toString()), example)) {
      return res.writeHead(422).end('Local preview accepts only the bundled donation example.');
    }
  } catch { return res.writeHead(400).end(); }
  const timeout = AbortSignal.timeout(120000);
  try {
    const result = await fetch('https://thinkcatlabs.ai/api/kumo/predict', {
      method: 'POST', headers: {'Content-Type': 'application/json'},
      body: payload, signal: timeout, redirect: 'error',
    });
    const body = await result.text();
    res.writeHead(result.status, {'Content-Type': result.headers.get('content-type') ?? 'text/plain', 'Cache-Control': 'no-store'}).end(body);
  } catch (error) {
    const failure = connectionFailure(error, timeout.aborted);
    logKumoFailure(failure);
    res.writeHead(timeout.aborted ? 504 : 502).end();
  }
}
