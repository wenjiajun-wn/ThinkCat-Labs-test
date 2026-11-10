import fs from 'node:fs';
import path from 'node:path';
const rows = [];
function scan(dir) {
  if (!fs.existsSync(dir)) return;
  for (const name of fs.readdirSync(dir)) {
    if (name.startsWith('.')) continue;
    const folder = path.join(dir, name);
    if (name.startsWith('@')) { scan(folder); continue; }
    const manifest = path.join(folder, 'package.json');
    if (!fs.existsSync(manifest)) continue;
    const pkg = JSON.parse(fs.readFileSync(manifest, 'utf8'));
    const evidence = fs.readdirSync(folder).filter(file => /^(licen[sc]e|copying|notice)(\.|$)/i.test(file));
    rows.push({ name: pkg.name, version: pkg.version, license: typeof pkg.license === 'string' ? pkg.license : 'UNKNOWN', evidence: evidence.map(file => path.join(folder, file).replaceAll('\\', '/')) });
    scan(path.join(folder, 'node_modules'));
  }
}
scan('node_modules');
rows.sort((a,b) => a.name.localeCompare(b.name));
fs.mkdirSync('artifacts', { recursive: true });
fs.writeFileSync('artifacts/licenses.json', JSON.stringify(rows, null, 2));
fs.writeFileSync('THIRD_PARTY_LICENSES.md', '# Installed dependency license inventory\n\nGenerated from installed manifests and root license-file discovery. Includes development and platform packages. Preserve upstream LICENSE / NOTICE files. This is an engineering inventory, not legal approval; compound expressions, missing texts, and bundled subcomponents require review.\n\n| Package | Version | Declared license | Local evidence |\n|---|---|---|---|\n' + rows.map(r => `| ${r.name} | ${r.version} | ${r.license.replaceAll('|',' / ')} | ${r.evidence.join(', ') || 'MISSING — manual review'} |`).join('\n') + '\n');
console.log(JSON.stringify({ packages: rows.length, licenses: [...new Set(rows.map(r => r.license))], missing: rows.filter(r => !r.evidence.length).map(r => r.name) }, null, 2));

