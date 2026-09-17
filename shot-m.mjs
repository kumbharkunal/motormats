import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 390, height: 844 } });
await p.addInitScript(() => { try { sessionStorage.setItem('motormats-splash-seen','1'); } catch {} });
await p.goto('http://localhost:3000/', { waitUntil: 'load', timeout: 60000 });
await p.waitForTimeout(2000);
await p.screenshot({ path: 'shots/m-hero.png' });
const h = await p.evaluate(() => document.body.scrollHeight);
for (let y = 0; y < h; y += 600) { await p.evaluate((v) => window.scrollTo(0, v), y); await p.waitForTimeout(350); }
await p.waitForTimeout(1200);
await p.screenshot({ path: 'shots/m-full.png', fullPage: true });
await b.close();
