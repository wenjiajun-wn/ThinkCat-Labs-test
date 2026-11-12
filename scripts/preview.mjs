// Preview only: serve the exported site, never source files or credentials.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve('out');
const host = '127.0.0.1';
const port = Number(process.env.THINKCAT_PREVIEW_PORT ?? 3000);
const kumoEnabled = process.argv.includes('--kumo');
const kumoEndpoint = 'https://thinkcat-labs.ai-calendar.xyz/api/kumo/predict';
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.xml': 'application/xml', '.txt': 'text/plain', '.json': 'application/json', '.ico': 'image/x-icon' };

async function forwardKumo(req, res) {
  if (req.method !== 'POST') return res.writeHead(405, {Allow: 'POST'}).end();
  const origin = req.headers.origin;
  if (origin && origin !== `http://${host}:${port}` && origin !== `http://localhost:${port}`) {
    return res.writeHead(403).end();
  }
  if (req.headers['content-type']?.split(';')[0].trim().toLowerCase() !== 'application/json') {
    return res.writeHead(415).end();
  }

  const timeout = AbortSignal.timeout(55_000);
  try {
    const chunks = [];
    let bytes = 0;
    for await (const chunk of req.iterator({destroyOnReturn: false})) {
      bytes += chunk.length;
      if (bytes > 8 * 1024 * 1024) {
        req.resume();
        return res.writeHead(413).end();
      }
      chunks.push(chunk);
    }
    const upstream = await fetch(kumoEndpoint, {
      method: 'POST',
      headers: {'Content-Type': 'application/json', Accept: 'application/json'},
      body: Buffer.concat(chunks),
      redirect: 'error',
      signal: timeout,
    });
    const body = Buffer.from(await upstream.arrayBuffer());
    res.writeHead(upstream.status, {
      'Content-Type': upstream.headers.get('content-type') ?? 'application/json',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    }).end(body);
  } catch {
    res.writeHead(timeout.aborted ? 504 : 502).end();
  }
}

http.createServer((req, res) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch { res.writeHead(400).end(); return; }
  if (kumoEnabled && pathname === '/api/kumo/predict') {
    void forwardKumo(req, res);
    return;
  }
  let file = path.resolve(root, '.' + pathname);
  if (file !== root && !file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(fs.existsSync(path.join(root, '404.html')) ? fs.readFileSync(path.join(root, '404.html')) : 'Not found');
    return;
  }
  res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'X-Content-Type-Options': 'nosniff' });
  fs.createReadStream(file).pipe(res);
}).listen(port, host, () => {
  console.log(`Static production preview: http://${host}:${port}${kumoEnabled ? ' (Kumo proxy enabled)' : ''}`);
});

