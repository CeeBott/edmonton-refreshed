#!/usr/bin/env node
/**
 * perf-check.mjs — zero-dependency page-speed regression check (§8.18).
 *
 * Loads each page in the system Chrome over the DevTools protocol, cold cache,
 * once as a throttled phone and once as a desktop, and reports what a visitor
 * actually gets: first paint, LCP, layout shift (with the element that moved),
 * and image weight. Flags anything over budget. Catches the failures that
 * render fine and only show up as weight or movement — the class of bug the
 * build cannot see from source (§9.12).
 *
 * Analytics, Clarity, and Cloudflare beacons are blocked so runs never reach
 * GA4 or session recordings.
 *
 * Usage:
 *   node scripts/perf-check.mjs [baseUrl] [--all] [--only /path/,/path2/] [--profiles mobile,desktop]
 * Defaults:
 *   baseUrl https://edmontonrefreshed.com   one page of each type (PAGES)
 *
 * --all reads every URL from sitemap.xml (about 90 pages, ~15 minutes).
 * Timings are only meaningful against the live site: the local python server
 * does not compress HTML/CSS, which inflates paint times on the phone profile.
 * Image weight, JPEG fallbacks, and layout shift are valid against either.
 * Exits 1 when any page is over budget.
 */

import { spawn } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const argv = process.argv.slice(2);
const flag = (name) => {
  const i = argv.indexOf(name);
  return i >= 0 ? argv.splice(i, 2)[1] : null;
};
const has = (name) => {
  const i = argv.indexOf(name);
  return i >= 0 ? (argv.splice(i, 1), true) : false;
};
const ONLY = (flag('--only') || '').split(',').filter(Boolean);
const PROFILE_NAMES = (flag('--profiles') || 'mobile,desktop').split(',');
const ALL = has('--all');
const BASE = (argv[0] || 'https://edmontonrefreshed.com').replace(/\/$/, '');
const DEBUG_PORT = 9778;

// One page of each type. Edit when a page type is added.
const PAGES = [
  '/', '/sold/', '/sell/', '/sell/natuzzi/', '/sell/sectional/', '/sell/what-we-buy/',
  '/partners/', '/about/', '/guides/', '/guides/natuzzi-sofa-review-edmonton/',
  '/guides/how-to-buy-used-sofa-edmonton/', '/guides/sectional-sofa-cost-edmonton/',
  '/listings/crate-and-barrel-lounge-power-reclining-sectional-edmonton/',
  '/listings/american-leather-carson-sectional-edmonton/',
];

// Lighthouse's mobile profile: slow 4G (150 ms RTT, 1.6 Mbps) on a 4x-slowed
// CPU. Desktop: a plain broadband line.
const PROFILES = {
  mobile: {
    viewport: { width: 390, height: 844, deviceScaleFactor: 3, mobile: true },
    network: { offline: false, latency: 150, downloadThroughput: 1.6e6 / 8, uploadThroughput: 750e3 / 8 },
    cpu: 4,
  },
  desktop: {
    viewport: { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false },
    network: { offline: false, latency: 40, downloadThroughput: 10e6 / 8, uploadThroughput: 5e6 / 8 },
    cpu: 1,
  },
};

// Budgets. LCP and CLS are Google's "good" thresholds. The image budgets are
// house heuristics (2026-10-29), set above what every page measured after the
// srcset fix: a breach means something changed, not that a page is "slow".
const BUDGET = {
  lcpMs: 2500,
  cls: 0.1,
  imageKB: { mobile: 1200, desktop: 800 },
  singleImageKB: 300,
};

const BLOCKED = [
  '*googletagmanager.com*', '*google-analytics.com*', '*analytics.google.com*',
  '*doubleclick.net*', '*clarity.ms*', '*c.bing.com*', '*cloudflareinsights.com*',
  '*/cdn-cgi/rum*',
];

// Runs in the page before any of its scripts: buffer LCP and layout shifts.
const OBSERVERS = `
  window.__perf = { lcp: null, shifts: [] };
  new PerformanceObserver((l) => {
    for (const e of l.getEntries()) {
      const el = e.element;
      window.__perf.lcp = { t: Math.round(e.startTime), url: e.url || '',
        el: el ? el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\\s+/)[0] : '') : '' };
    }
  }).observe({ type: 'largest-contentful-paint', buffered: true });
  new PerformanceObserver((l) => {
    for (const e of l.getEntries()) {
      if (e.hadRecentInput) continue;
      const src = (e.sources || []).map((s) => {
        const n = s.node;
        if (!n || n.nodeType !== 1) return n ? n.nodeName : '?';
        return n.tagName.toLowerCase() + (n.id ? '#' + n.id : '') +
          (typeof n.className === 'string' && n.className.trim() ? '.' + n.className.trim().split(/\\s+/)[0] : '');
      });
      window.__perf.shifts.push({ v: e.value, t: Math.round(e.startTime), src });
    }
  }).observe({ type: 'layout-shift', buffered: true });
`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

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
  close() { try { this.ws.close(); } catch {} }
}

function sitemapPaths() {
  const xml = readFileSync(new URL('../sitemap.xml', import.meta.url), 'utf8');
  return [...xml.matchAll(/<loc>https:\/\/edmontonrefreshed\.com(\/[^<]*)<\/loc>/g)].map((m) => m[1]);
}

async function measure(port, path, profile) {
  const target = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' })).json();
  const page = new CdpPage(target.webSocketDebuggerUrl);
  await page.ready;
  await page.send('Network.enable');
  await page.send('Network.setCacheDisabled', { cacheDisabled: true });
  await page.send('Network.setBlockedURLs', { urls: BLOCKED });
  await page.send('Network.emulateNetworkConditions', profile.network);
  await page.send('Emulation.setCPUThrottlingRate', { rate: profile.cpu });
  await page.send('Emulation.setDeviceMetricsOverride', profile.viewport);
  await page.send('Page.enable');
  await page.send('Page.addScriptToEvaluateOnNewDocument', { source: OBSERVERS });
  await page.send('Page.navigate', { url: BASE + path });
  const start = Date.now();
  while (Date.now() - start < 45000 && !page.events.some((e) => e.method === 'Page.loadEventFired')) await sleep(100);
  await sleep(3000); // late images, font swap, JS-rendered carousels

  const types = {}, urls = {}, status = {};
  for (const e of page.events) {
    if (e.method === 'Network.requestWillBeSent') urls[e.params.requestId] = e.params.request.url;
    if (e.method === 'Network.responseReceived') {
      types[e.params.requestId] = e.params.type;
      status[e.params.requestId] = e.params.response.status;
    }
  }
  let imageBytes = 0, biggest = { kb: 0, url: '' };
  const broken = [];
  for (const e of page.events) {
    if (e.method !== 'Network.loadingFinished' || types[e.params.requestId] !== 'Image') continue;
    const url = urls[e.params.requestId] || '';
    const bytes = e.params.encodedDataLength;
    imageBytes += bytes;
    if (bytes / 1024 > biggest.kb) biggest = { kb: Math.round(bytes / 1024), url };
    if (status[e.params.requestId] >= 400) broken.push(url);
  }
  const r = await page.send('Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => {
      const fcp = performance.getEntriesByName('first-contentful-paint')[0];
      // Chrome supports AVIF, so a <picture> that offers AVIF but rendered
      // its JPEG means the fallback fired: a broken srcset or a missing variant.
      const jpegs = [...document.images].filter((i) => /\\.jpe?g$/i.test(i.currentSrc) &&
        i.parentElement && i.parentElement.tagName === 'PICTURE' &&
        i.parentElement.querySelector('source[type="image/avif"][srcset]'))
        .map((i) => decodeURIComponent(i.currentSrc.replace(/^.*\\/images\\//, '')));
      return { fcp: fcp ? Math.round(fcp.startTime) : null, lcp: window.__perf.lcp, shifts: window.__perf.shifts, jpegs };
    })()`,
  });
  await page.send('Page.close').catch(() => {});
  page.close();
  if (r.exceptionDetails) throw new Error('page evaluate failed: ' + r.exceptionDetails.text);
  const v = r.result.value;
  const cls = v.shifts.reduce((a, s) => a + s.v, 0);
  const worst = v.shifts.slice().sort((a, b) => b.v - a.v)[0];
  return { fcp: v.fcp, lcp: v.lcp, cls, worst, imageKB: Math.round(imageBytes / 1024), biggest, jpegs: v.jpegs, broken };
}

const paths = ONLY.length ? ONLY : ALL ? sitemapPaths() : PAGES;
const profileDir = mkdtempSync(join(tmpdir(), 'er-perf-'));
const chrome = spawn(CHROME, [
  '--headless=new', `--remote-debugging-port=${DEBUG_PORT}`, `--user-data-dir=${profileDir}`,
  '--no-first-run', '--no-default-browser-check', '--disable-extensions', 'about:blank',
], { stdio: 'ignore' });

let failures = 0;
try {
  let up = false;
  for (let i = 0; i < 50 && !up; i++) {
    up = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/version`).then(() => true).catch(() => false);
    if (!up) await sleep(200);
  }
  if (!up) throw new Error('Chrome did not start');
  console.log(`perf-check — ${BASE} — ${paths.length} page(s) × ${PROFILE_NAMES.join(' + ')}\n`);
  for (const path of paths) {
    for (const name of PROFILE_NAMES) {
      const m = await measure(DEBUG_PORT, path, PROFILES[name]);
      const issues = [];
      if (m.lcp && m.lcp.t > BUDGET.lcpMs) issues.push(`LCP ${m.lcp.t} ms > ${BUDGET.lcpMs}`);
      if (m.cls > BUDGET.cls) issues.push(`CLS ${m.cls.toFixed(3)} > ${BUDGET.cls} (moved: ${m.worst.src.join(', ')})`);
      if (m.imageKB > BUDGET.imageKB[name]) issues.push(`images ${m.imageKB} KB > ${BUDGET.imageKB[name]}`);
      if (m.biggest.kb > BUDGET.singleImageKB) issues.push(`one image is ${m.biggest.kb} KB: ${m.biggest.url}`);
      if (m.jpegs.length) issues.push(`JPEG fallback loaded (broken srcset or missing AVIF, §5.3): ${m.jpegs.slice(0, 3).join(', ')}${m.jpegs.length > 3 ? ' …' : ''}`);
      if (m.broken.length) issues.push(`image errors: ${m.broken.slice(0, 3).join(', ')}`);
      const line = `${issues.length ? 'OVER ' : 'ok   '} ${name.padEnd(7)} ${path.padEnd(52)} FCP ${String(m.fcp).padStart(5)}  LCP ${String(m.lcp ? m.lcp.t : '—').padStart(5)} (${m.lcp ? m.lcp.el : ''})  CLS ${m.cls.toFixed(3)}  images ${m.imageKB} KB`;
      console.log(line);
      issues.forEach((i) => console.log('        ' + i));
      if (issues.length) failures++;
    }
  }
  console.log(`\n${failures ? failures + ' measurement(s) over budget' : 'all pages within budget'}`);
} finally {
  chrome.kill('SIGKILL');
  try { rmSync(profileDir, { recursive: true, force: true }); } catch {}
}
process.exitCode = failures ? 1 : 0;
