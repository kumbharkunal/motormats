import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1500, height: 1100 } });
await p.addInitScript(() => { try { sessionStorage.setItem('motormats-splash-seen','1'); } catch {} });
await p.goto('http://localhost:3000/sketch-preview', { waitUntil: 'load', timeout: 60000 });
await p.waitForTimeout(1200);
await p.locator('#marks').screenshot({ path: 'shots/marks.png' });
await p.locator('#big').screenshot({ path: 'shots/marks-big.png' });
await b.close();
