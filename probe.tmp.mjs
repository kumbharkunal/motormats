import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1600, height: 900 } });
await ctx.addInitScript(() => sessionStorage.setItem('motormats-splash-seen', '1'));
const p = await ctx.newPage();
await p.goto('http://localhost:3000/', { waitUntil: 'load' });
await p.waitForTimeout(1200);
console.log(await p.evaluate(() => {
  const l = (s) => { const e = document.querySelector(s); return e ? Math.round(e.getBoundingClientRect().left) : null; };
  const header = document.querySelector('header');
  const inner = header?.firstElementChild;
  return {
    logo: l('header a[href="/"]'),
    headerInner: inner ? Math.round(inner.getBoundingClientRect().left) : null,
    headerInnerPad: inner ? getComputedStyle(inner).paddingInlineStart : null,
    heroH1: l('#hero-heading'),
    footerFirst: l('footer a'),
  };
}));
await b.close();
