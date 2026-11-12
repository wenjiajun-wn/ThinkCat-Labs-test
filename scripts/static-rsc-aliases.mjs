import {copyFile, readdir, stat} from 'node:fs/promises';
import path from 'node:path';

/**
 * Next.js 16 static export writes dynamic-route RSC payloads into a directory
 * (`__next.$d$locale/$d$page/__PAGE__.txt`) while its client prefetch asks for a
 * dotted filename (`__next.$d$locale.$d$page.__PAGE__.txt`). The mismatch only
 * affects prefetch requests, but it produces noisy 404s in the browser.
 * Route groups use the same layout with a !-prefixed group segment.
 *
 * This post-build step creates aliases in `out/` so the exported site is clean
 * when served by a plain static host. It does not change source or runtime code.
 */
const out = path.resolve('out');

async function directories(root) {
  const entries = await readdir(root, {withFileTypes: true});
  const result = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const target = path.join(root, entry.name);
    result.push(target, ...await directories(target));
  }
  return result;
}

async function exists(file) {
  try {
    return (await stat(file)).isFile();
  } catch {
    return false;
  }
}

let copied = 0;
for (const directory of await directories(out)) {
  const payload = path.join(directory, '__PAGE__.txt');
  if (!await exists(payload)) continue;
  const segments = path.relative(out, directory).split(path.sep);
  const prefix = segments.findIndex(segment => segment.startsWith('__next.'));
  if (prefix < 0) continue;
  const alias = [...segments.slice(0, prefix), segments.slice(prefix).join('.') + '.__PAGE__.txt'];
  await copyFile(payload, path.join(out, ...alias));
  copied += 1;
}

console.log(`Static RSC aliases: ${copied} file(s)`);
