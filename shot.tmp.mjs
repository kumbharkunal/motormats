import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1600, height: 900 } });
await ctx.addInitScript(() => sessionStorage.setItem('motormats-splash-seen', '1'));
const p = await ctx.newPage();
await p.goto('http://localhost:3000/', { waitUntil: 'load' });
await p.waitForTimeout(1600);
await p.screenshot({ path: '/tmp/hero-align.png' });
await b.close();
