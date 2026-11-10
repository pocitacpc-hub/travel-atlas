// Vykreslí stránku v headless Chrome a uloží outerHTML prvku .wrap (podklad pro gen-barvy.mjs).
// node dump-dom.mjs <chrome.exe> <profileDir> <url> <vystup.html>   (url např. http://127.0.0.1:4173/travel-atlas/ z vite preview)
import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';
const [chrome, profile, url, out] = process.argv.slice(2);
const port = 9334;
const proc = spawn(chrome, ['--headless=new', '--disable-gpu', '--no-first-run', `--user-data-dir=${profile}`, `--remote-debugging-port=${port}`, 'about:blank'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let targets;
for (let i = 0; i < 50; i++) { try { targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json(); if (targets.find(t => t.type === 'page')) break; } catch {} await sleep(200); }
const ws = new WebSocket(targets.find(t => t.type === 'page').webSocketDebuggerUrl);
await new Promise(r => ws.addEventListener('open', r, { once: true }));
let id = 0; const pending = new Map();
ws.addEventListener('message', e => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } });
const send = (method, params = {}) => new Promise(r => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
await send('Page.navigate', { url });
await sleep(2000);
const r = await send('Runtime.evaluate', { expression: 'document.querySelector(".wrap").outerHTML', returnByValue: true });
writeFileSync(out, r.result.result.value);
console.log('uloženo', r.result.result.value.length, 'znaků');
ws.close(); proc.kill(); process.exit(0);
