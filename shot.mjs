import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.addInitScript(() => { try { sessionStorage.setItem('motormats-splash-seen','1'); } catch {} });
const errs = new Set();
p.on('console', (m) => { if (m.type()==='error') errs.add(m.text().split('\n')[0].slice(0,150)); });
p.on('pageerror', (e) => errs.add('PAGEERROR ' + e.message.slice(0,200)));
await p.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded', timeout: 60000 });
await p.waitForTimeout(3000);
await p.screenshot({ path: 'shots/01-hero.png' });
// walk the page so ScrollTriggers fire and lazy images load
const h = await p.evaluate(() => document.body.scrollHeight);
for (let y = 0; y < h; y += 700) { await p.evaluate((v) => window.scrollTo(0, v), y); await p.waitForTimeout(450); }
await p.waitForTimeout(1500);
await p.screenshot({ path: 'shots/02-full.png', fullPage: true });
console.log('height', h);
console.log(errs.size ? [...errs].join('\n') : 'no console errors');
await b.close();
