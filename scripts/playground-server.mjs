import {createServer} from 'node:http';
import {runDonationExample} from './donation-example.mjs';
import {spawn} from 'node:child_process';

const [mode, ...args] = process.argv.slice(2);
if (mode === 'dev') {
  const examples = createServer((req, res) => {
    if (req.url === '/donation') void runDonationExample(req, res);
    else res.writeHead(404).end();
  });
  await new Promise(resolve => examples.listen(0, '127.0.0.1', resolve));
  process.env.THINKCAT_EXAMPLE_PORT = String(examples.address().port);
}
const entry = mode === 'dev' ? ['node_modules/next/dist/bin/next', 'dev', '--webpack', '--hostname', '127.0.0.1'] : ['scripts/preview.mjs'];
const web = spawn(process.execPath, [...entry, ...args], {stdio: 'inherit'});
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => web.kill());
web.on('exit', code => process.exit(code ?? 0));
