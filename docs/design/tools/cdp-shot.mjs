// Snímky stránek s emulací zařízení přes Chrome DevTools Protocol (bez závislostí, Node 22+).
// node cdp-shot.mjs <chrome.exe> <profileDir> <outDir> <width> <name=url> [name=url ...]
import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const [chrome, profile, outDir, widthArg, ...jobs] = process.argv.slice(2);
const width = Number(widthArg);
const port = 9333;
const proc = spawn(chrome, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run', `--user-data-dir=${profile}`, `--remote-debugging-port=${port}`, 'about:blank'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));

let targets;
for (let i = 0; i < 50; i++) {
  try { targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json(); if (targets.find(t => t.type === 'page')) break; } catch {}
  await sleep(200);
}
const page = targets.find(t => t.type === 'page');
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise(r => ws.addEventListener('open', r, { once: true }));
let id = 0; const pending = new Map(); const errors = [];
ws.addEventListener('message', e => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
  if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text);
  if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errors.push(m.params.args.map(a => a.value).join(' '));
});
const send = (method, params = {}) => new Promise(r => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });

await send('Runtime.enable');
await send('Page.enable');
const mobile = width < 768;
await send('Emulation.setDeviceMetricsOverride', { width, height: mobile ? 844 : 1000, deviceScaleFactor: 1, mobile });
for (const job of jobs) {
  const k = job.indexOf('='), name = job.slice(0, k), url = job.slice(k + 1);
  errors.length = 0;
  await send('Page.navigate', { url });
  await sleep(1500);
  const r = await send('Runtime.evaluate', { expression: 'JSON.stringify({sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, h: document.documentElement.scrollHeight})', returnByValue: true });
  const dim = JSON.parse(r.result.result.value);
  const h = Math.min(dim.h, 6000);
  await send('Emulation.setDeviceMetricsOverride', { width, height: h, deviceScaleFactor: 1, mobile });
  await sleep(600);
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(join(outDir, name + '.png'), Buffer.from(shot.result.data, 'base64'));
  await send('Emulation.setDeviceMetricsOverride', { width, height: mobile ? 844 : 1000, deviceScaleFactor: 1, mobile });
  console.log(name, `scrollWidth=${dim.sw} clientWidth=${dim.cw} height=${dim.h}`, dim.sw > dim.cw ? 'PŘETÉKÁ' : 'ok', errors.length ? 'CHYBY: ' + errors.join(' | ') : 'bez chyb');
}
ws.close();
proc.kill();
process.exit(0);
