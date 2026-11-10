import fs from 'node:fs';
import path from 'node:path';
const roots = ['node_modules/next','node_modules/react','node_modules/react-dom','node_modules/scheduler','node_modules/styled-jsx'];
const sections = ['Third-party notices for Thinkcat Labs static build. Conservative inventory includes Next compiled components, some of which may be build-only.'];
function walk(folder) {
  if (!fs.existsSync(folder)) return;
  for (const entry of fs.readdirSync(folder,{withFileTypes:true})) {
    const file = path.join(folder,entry.name);
    if (entry.isDirectory()) walk(file);
    else if (/^(license|licence|notice|copying)(\.|$)/i.test(entry.name)) sections.push('\n===== '+file.replaceAll('\\','/')+' =====\n'+fs.readFileSync(file,'utf8'));
  }
}
roots.forEach(walk);
fs.writeFileSync('public/THIRD_PARTY_NOTICES.txt',sections.join('\n'));
console.log(`Preserved ${sections.length-1} license/notice texts in public/THIRD_PARTY_NOTICES.txt`);
