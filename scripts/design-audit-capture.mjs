#!/usr/bin/env node
/**
 * design-audit-capture.mjs — zero-dependency full-page screenshot harness.
 *
 * Drives the system Chrome over the DevTools protocol (no puppeteer/playwright
 * install). Blocks Google Analytics hosts so audit runs never pollute GA4.
 *
 * Usage:
 *   node scripts/design-audit-capture.mjs [baseUrl] [outDir] [--only name1,name2] [--prefix after-]
 * Defaults:
 *   baseUrl http://127.0.0.1:8080   outDir docs/design-audit/assets
 *
 * --only re-shoots a subset (match on PAGES name) — e.g. after applying fixes.
 * --prefix prepends to output filenames (e.g. "after-").
 * The page matrix lives in PAGES below — edit it when the site map changes.
 */

import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const argv = process.argv.slice(2);
const flag = (name) => {
  const i = argv.indexOf(name);
  return i >= 0 ? argv.splice(i, 2)[1] : null;
};
const ONLY = (flag('--only') || '').split(',').filter(Boolean);
const PREFIX = flag('--prefix') || '';
const BASE = argv[0] || 'http://127.0.0.1:8080';
const OUT = argv[1] || 'docs/design-audit/assets';
const DEBUG_PORT = 9777;

const DESKTOP = { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false };
const MOBILE = { width: 375, height: 812, deviceScaleFactor: 2, mobile: true };

// Block analytics + tag manager so audit traffic never reaches GA4.
const BLOCKED = [
  '*googletagmanager.com*',
  '*google-analytics.com*',
  '*analytics.google.com*',
  '*doubleclick.net*',
];

// path, shot name, viewports, optional pre-capture script run in the page
const PAGES = [
  { path: '/', name: 'home', mobile: true },
  { path: '/sold/', name: 'sold' }, // full-page mobile is a 30-carousel monster — fold shot below instead
  { path: '/sold/', name: 'sold-mobile-fold', mobileOnly: true, viewportOnly: true },
  { path: '/sell/', name: 'sell-hub', mobile: true },
  { path: '/sell/natuzzi/', name: 'sell-brand-natuzzi', mobile: true },
  { path: '/sell/sectional/', name: 'sell-type-sectional' },
  { path: '/sell/leather-sofa/', name: 'sell-type-leather-sofa' },
  { path: '/sell/sell-furniture-fast/', name: 'sell-situation-fast', mobile: true },
  { path: '/sell/estate-furniture/', name: 'sell-situation-estate' },
  { path: '/sell/what-we-buy/', name: 'sell-what-we-buy', mobile: true },
  { path: '/partners/', name: 'partners' },
  { path: '/about/', name: 'about', mobile: true },
  { path: '/guides/', name: 'guides-index' },
  { path: '/guides/how-to-buy-used-sofa-edmonton/', name: 'guide-buyer' },
  { path: '/guides/who-buys-used-couches-edmonton/', name: 'guide-seller', mobile: true },
  { path: '/guides/natuzzi-sofa-review-edmonton/', name: 'guide-brand-natuzzi' },
  { path: '/listings/b-b-italia-charles-sectional-edmonton/', name: 'listing-bb-italia', mobile: true },
  { path: '/listings/west-elm-jodie-wing-leather-chairs-edmonton/', name: 'listing-west-elm', mobile: true },
  { path: '/listings/bracci-como-maxi-apartment-sofa-edmonton/', name: 'listing-bracci' },
  { path: '/listings/pottery-barn-turner-square-arm-sofa-edmonton/', name: 'sold-stub-pottery-barn' },
  { path: '/listings/natuzzi-editions-vigore-leather-sectional/', name: 'sold-stub-vigore' },
  { path: '/listings/rove-concepts-milo-6-piece-modular-sectional/', name: 'sold-stub-milo', mobile: true },
  { path: '/privacy/', name: 'privacy' },
  { path: '/returns/', name: 'returns' },
  { path: '/404.html', name: '404' },
  // Interaction states
  {
    path: '/', name: 'state-mobile-drawer', mobileOnly: true, viewportOnly: true,
    pre: `document.querySelector('.nav-toggle')?.click();`,
  },
  {
    path: '/sell/', name: 'state-form-validation', mobile: true, scroll: '#sell-details',
    pre: `(() => { const f = document.querySelector('form.sell-form'); if (!f) return;
      f.querySelector('button[type="submit"], .sell-form-submit')?.click();
      f.reportValidity && f.reportValidity(); })();`,
    viewportOnly: true,
  },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const MAX_SHOT_HEIGHT = 9000; // CSS px — clip monster pages (e.g. /sold/) so Chrome never renders 30k-px bitmaps
const SHOT_TIMEOUT_MS = 45000; // hard cap per shot; one bad page must not hang the run

function withTimeout(promise, ms, label) {
  return Promise.race([
    promise,
    new Promise((_, rej) => setTimeout(() => rej(new Error(`${label} timed out after ${ms}ms`)), ms)),
  ]);
}

async function httpJson(url, method = 'GET') {
  const res = await fetch(url, { method });
  if (!res.ok) throw new Error(`${method} ${url} -> ${res.status}`);
  return res.json();
}

class CdpPage {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.id = 0;
    this.pending = new Map();
    this.events = [];
    this.ws.addEventListener('message', (e) => {
      const msg = JSON.parse(e.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
      } else if (msg.method) {
        this.events.push(msg);
      }
    });
    this.ready = new Promise((r) => this.ws.addEventListener('open', r));
  }
  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
  async waitEvent(method, timeoutMs = 10000) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const i = this.events.findIndex((e) => e.method === method);
      if (i >= 0) return this.events.splice(i, 1)[0];
      await sleep(50);
    }
    throw new Error(`timeout waiting for ${method}`);
  }
  close() { try { this.ws.close(); } catch {} }
}

async function capture(page, def, vp, file) {
  await page.send('Network.enable');
  await page.send('Network.setBlockedURLs', { urls: BLOCKED });
  await page.send('Page.enable');
  await page.send('Emulation.setDeviceMetricsOverride', vp);
  await page.send('Page.navigate', { url: BASE + def.path });
  await page.waitEvent('Page.loadEventFired');
  // Let fonts + JS-rendered carousels settle.
  await page.send('Runtime.evaluate', {
    expression: 'document.fonts ? document.fonts.ready.then(()=>1) : 1',
    awaitPromise: true,
  });
  await sleep(400);
  if (!def.viewportOnly) {
    // Force lazy images by walking the page, then return to top.
    await page.send('Runtime.evaluate', {
      expression: `(async () => {
        const step = Math.max(400, innerHeight - 100);
        for (let y = 0; y < document.body.scrollHeight; y += step) {
          scrollTo(0, y); await new Promise(r => setTimeout(r, 60));
        }
        scrollTo(0, 0);
      })()`,
      awaitPromise: true,
    });
    await sleep(350);
  }
  if (def.scroll) {
    await page.send('Runtime.evaluate', {
      expression: `document.querySelector(${JSON.stringify(def.scroll)})?.scrollIntoView()`,
    });
    await sleep(200);
  }
  if (def.pre) {
    await page.send('Runtime.evaluate', { expression: def.pre });
    await sleep(450);
  }
  const fullPage = !def.viewportOnly && !def.scroll;
  const params = { format: 'png', captureBeyondViewport: fullPage };
  if (fullPage) {
    const { result } = await page.send('Runtime.evaluate', {
      expression: 'Math.min(document.body.scrollHeight, ' + MAX_SHOT_HEIGHT + ')',
      returnByValue: true,
    });
    params.clip = { x: 0, y: 0, width: vp.width, height: result.value, scale: 1 };
  }
  const shot = await page.send('Page.captureScreenshot', params);
  writeFileSync(file, Buffer.from(shot.data, 'base64'));
  console.log('  saved', file);
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  const profile = mkdtempSync(join(tmpdir(), 'er-audit-chrome-'));
  const chrome = spawn(CHROME, [
    `--headless=new`,
    `--remote-debugging-port=${DEBUG_PORT}`,
    `--user-data-dir=${profile}`,
    '--no-first-run', '--no-default-browser-check', '--hide-scrollbars',
    '--disable-gpu', 'about:blank',
  ], { stdio: 'ignore' });

  try {
    // Wait for the debugger endpoint.
    let version = null;
    for (let i = 0; i < 50 && !version; i++) {
      version = await httpJson(`http://127.0.0.1:${DEBUG_PORT}/json/version`).catch(() => null);
      if (!version) await sleep(200);
    }
    if (!version) throw new Error('Chrome debugger never came up');

    for (const def of PAGES) {
      if (ONLY.length && !ONLY.includes(def.name)) continue;
      const viewports = [];
      if (!def.mobileOnly) viewports.push(['desktop', DESKTOP]);
      if (def.mobile || def.mobileOnly) viewports.push(['mobile', MOBILE]);
      for (const [label, vp] of viewports) {
        const tab = await httpJson(`http://127.0.0.1:${DEBUG_PORT}/json/new?about:blank`, 'PUT');
        const page = new CdpPage(tab.webSocketDebuggerUrl);
        await page.ready;
        const file = join(OUT, `${PREFIX}${def.name}--${label}.png`);
        try {
          await withTimeout(capture(page, def, vp, file), SHOT_TIMEOUT_MS, `${def.name}--${label}`);
        } catch (err) {
          console.error('  FAILED', def.name, label, err.message);
        } finally {
          page.close();
          await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/close/${tab.id}`).catch(() => {});
        }
      }
    }
  } finally {
    chrome.kill('SIGKILL');
    rmSync(profile, { recursive: true, force: true });
  }
  console.log('done');
}

main().catch((err) => { console.error(err); process.exit(1); });
