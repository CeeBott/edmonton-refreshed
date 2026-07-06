#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════
//  SEO DATA FETCHER  (operational helper — run manually or via /seo-audit)
//
//  Zero-dependency access to the data sources behind the SEO audit
//  (CLAUDE.md §8.16). Replaces the retired Supermetrics connector with
//  direct Google/Cloudflare API calls authenticated by a service account.
//
//  Commands:
//    gsc [dims]     Search Console search analytics. dims = comma list of
//                   query|page|date|device|country|searchAppearance
//                   (default query). Flags: --days N (84) --limit N (1000)
//                   --compare (also fetch the previous equal window)
//    inspect <url…> Search Console URL Inspection (index status per URL)
//    sitemaps       Search Console submitted-sitemap status
//    ga4 <preset>   GA4 Data API. Presets: landing (organic landing pages),
//                   channels, events, pages. Flags: --days N (84) --limit N
//    psi <url>      PageSpeed Insights (Lighthouse lab + CrUX field).
//                   Flags: --strategy mobile|desktop (mobile)
//    crux <target>  Chrome UX Report field CWV. Flags: --origin (treat
//                   target as origin instead of a page URL). A 404 from the
//                   API means no field data exists (normal below the public-
//                   dataset traffic threshold) — reported as a result, not
//                   an error.
//
//  Every printing command also takes --out <file> to write the JSON there
//  instead of stdout (PSI responses run ~3 MB — point them at the audit's
//  data/YYYY-MM-DD/ folder rather than flooding the terminal).
//    cf             Cloudflare zone analytics by day (GraphQL). --days N (28)
//    all            Standard audit bundle → docs/seo-audit/data/YYYY-MM-DD/
//    setup          Print the one-time credential setup steps
//
//  Config (credentials live OUTSIDE this public repo — never commit them):
//    ~/.config/edmonton-refreshed/seo.json
//    {
//      "serviceAccountKey": "~/.config/edmonton-refreshed/google-sa.json",
//      "gscSite": "sc-domain:edmontonrefreshed.com",
//      "ga4Property": "properties/XXXXXXXXX",
//      "cruxApiKey": "",                              // optional (CrUX/PSI)
//      "cloudflare": { "apiToken": "", "zoneTag": "" } // optional
//    }
// ═══════════════════════════════════════════════════════════

import { createSign } from 'node:crypto';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const CONFIG_PATH = path.join(homedir(), '.config', 'edmonton-refreshed', 'seo.json');
const SCOPES = [
  'https://www.googleapis.com/auth/webmasters.readonly',
  'https://www.googleapis.com/auth/analytics.readonly',
].join(' ');
// GSC search-analytics data lags ~2–3 days; end every window 3 days back.
const GSC_LAG_DAYS = 3;

// ── arg parsing ──────────────────────────────────────────────
const rawArgs = process.argv.slice(2);
const cmd = rawArgs.shift() || 'help';
const positionals = [];
const flags = {};
for (let i = 0; i < rawArgs.length; i++) {
  const a = rawArgs[i];
  if (a.startsWith('--')) {
    const next = rawArgs[i + 1];
    if (next === undefined || next.startsWith('--')) flags[a.slice(2)] = true;
    else { flags[a.slice(2)] = next; i++; }
  } else positionals.push(a);
}
const flag = (name, dflt) => (flags[name] === undefined ? dflt : flags[name]);

function fail(msg) { console.error(`seo-fetch: ${msg}`); process.exit(1); }
const expand = (p) => (p.startsWith('~') ? path.join(homedir(), p.slice(1)) : p);

let _config;
function config() {
  if (_config) return _config;
  try {
    _config = JSON.parse(readFileSync(CONFIG_PATH, 'utf8'));
  } catch {
    fail(`no config at ${CONFIG_PATH} — run \`node scripts/seo-fetch.mjs setup\` for the one-time setup steps.`);
  }
  return _config;
}

function isoDaysAgo(n) {
  const d = new Date(Date.now() - n * 86400000);
  return d.toISOString().slice(0, 10);
}

// ── Google service-account auth (JWT bearer, RS256 via node:crypto) ──
let _token;
async function accessToken() {
  if (_token) return _token;
  const sa = JSON.parse(readFileSync(expand(config().serviceAccountKey), 'utf8'));
  const now = Math.floor(Date.now() / 1000);
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
  const unsigned =
    b64({ alg: 'RS256', typ: 'JWT' }) + '.' +
    b64({ iss: sa.client_email, scope: SCOPES, aud: sa.token_uri, iat: now, exp: now + 3600 });
  const signature = createSign('RSA-SHA256').update(unsigned).sign(sa.private_key, 'base64url');
  const res = await fetch(sa.token_uri, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: `${unsigned}.${signature}`,
    }),
  });
  const json = await jsonOrThrow(res, 'token exchange');
  _token = json.access_token;
  return _token;
}

async function jsonOrThrow(res, what) {
  const text = await res.text();
  if (!res.ok) throw new Error(`${what} failed (HTTP ${res.status}): ${text.slice(0, 600)}`);
  return JSON.parse(text);
}

async function googleApi(url, body) {
  const token = await accessToken();
  const res = await fetch(url, {
    method: body === undefined ? 'GET' : 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return jsonOrThrow(res, url.replace(/https:\/\/[^/]+/, ''));
}

// ── Search Console ──────────────────────────────────────────
const gscBase = () => `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(config().gscSite)}`;

async function gscWindow(dimensions, startDate, endDate, limit) {
  const rows = [];
  let startRow = 0;
  while (rows.length < limit) {
    const rowLimit = Math.min(25000, limit - rows.length);
    const json = await googleApi(`${gscBase()}/searchAnalytics/query`, {
      startDate, endDate, dimensions, rowLimit, startRow,
    });
    const batch = json.rows || [];
    rows.push(...batch);
    if (batch.length < rowLimit) break;
    startRow += batch.length;
  }
  return rows;
}

async function gsc(dimensions, days, limit, compare) {
  const end = isoDaysAgo(GSC_LAG_DAYS);
  const start = isoDaysAgo(GSC_LAG_DAYS + days - 1);
  const out = {
    site: config().gscSite,
    dimensions,
    window: { startDate: start, endDate: end },
    rows: await gscWindow(dimensions, start, end, limit),
  };
  if (compare) {
    const prevEnd = isoDaysAgo(GSC_LAG_DAYS + days);
    const prevStart = isoDaysAgo(GSC_LAG_DAYS + 2 * days - 1);
    out.previousWindow = { startDate: prevStart, endDate: prevEnd };
    out.previousRows = await gscWindow(dimensions, prevStart, prevEnd, limit);
  }
  return out;
}

async function inspect(urls) {
  const results = [];
  for (const inspectionUrl of urls) {
    try {
      const json = await googleApi('https://searchconsole.googleapis.com/v1/urlInspection/index:inspect', {
        inspectionUrl, siteUrl: config().gscSite,
      });
      results.push({ url: inspectionUrl, result: json.inspectionResult });
    } catch (e) {
      results.push({ url: inspectionUrl, error: String(e.message || e) });
    }
  }
  return results;
}

const sitemaps = () => googleApi(`${gscBase()}/sitemaps`);

// ── GA4 Data API ────────────────────────────────────────────
const ORGANIC_FILTER = {
  filter: {
    fieldName: 'sessionDefaultChannelGroup',
    stringFilter: { matchType: 'EXACT', value: 'Organic Search' },
  },
};

const GA4_PRESETS = {
  landing: {
    dimensions: ['landingPage'],
    metrics: ['sessions', 'totalUsers', 'engagementRate', 'keyEvents'],
    dimensionFilter: ORGANIC_FILTER,
  },
  channels: {
    dimensions: ['sessionDefaultChannelGroup'],
    metrics: ['sessions', 'totalUsers', 'engagementRate', 'keyEvents'],
  },
  events: {
    dimensions: ['eventName'],
    metrics: ['eventCount', 'totalUsers'],
  },
  pages: {
    dimensions: ['pagePath'],
    metrics: ['screenPageViews', 'totalUsers', 'engagementRate'],
  },
};

async function ga4(preset, days, limit) {
  const p = GA4_PRESETS[preset];
  if (!p) fail(`unknown ga4 preset "${preset}" (use: ${Object.keys(GA4_PRESETS).join(', ')})`);
  const body = {
    dateRanges: [{ startDate: `${days}daysAgo`, endDate: 'yesterday' }],
    dimensions: p.dimensions.map((name) => ({ name })),
    metrics: p.metrics.map((name) => ({ name })),
    orderBys: [{ metric: { metricName: p.metrics[0] }, desc: true }],
    limit: String(limit),
  };
  if (p.dimensionFilter) body.dimensionFilter = p.dimensionFilter;
  return googleApi(`https://analyticsdata.googleapis.com/v1beta/${config().ga4Property}:runReport`, body);
}

// ── PageSpeed Insights / CrUX ───────────────────────────────
async function psi(url, strategy) {
  const params = new URLSearchParams({ url, strategy });
  params.append('category', 'performance');
  params.append('category', 'seo');
  const key = config().cruxApiKey;
  if (key) params.append('key', key);
  const res = await fetch(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${params}`);
  return jsonOrThrow(res, `PSI ${url}`);
}

async function crux(target, asOrigin) {
  const key = config().cruxApiKey;
  if (!key) fail('crux requires "cruxApiKey" in the config (a plain Google API key with the Chrome UX Report API enabled).');
  const res = await fetch(`https://chromeuxreport.googleapis.com/v1/records:queryRecord?key=${key}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(asOrigin ? { origin: target } : { url: target }),
  });
  // 404 = no field data for this URL/origin — an expected answer for new or
  // low-traffic sites (below the public-dataset threshold), not a failure.
  // Treat CWV as ranking-neutral and use PSI lab data for diagnostics.
  if (res.status === 404) {
    return {
      noFieldData: true,
      [asOrigin ? 'origin' : 'url']: target,
      note: 'CrUX has no field data for this ' + (asOrigin ? 'origin' : 'URL') +
        ' — traffic is below the public-dataset threshold. Normal for new/low-traffic sites; ' +
        'treat Core Web Vitals as ranking-neutral and use PSI lab data for diagnostics.',
    };
  }
  return jsonOrThrow(res, `CrUX ${target}`);
}

// ── Cloudflare zone analytics (GraphQL, free plan dataset) ──
async function cf(days) {
  const cfg = config().cloudflare || {};
  if (!cfg.apiToken || !cfg.zoneTag) {
    fail('cf requires "cloudflare": { "apiToken", "zoneTag" } in the config (token scope: Zone → Analytics → Read; zoneTag = Zone ID on the domain overview page).');
  }
  const query = `query($zone: String!, $since: String!) {
    viewer { zones(filter: { zoneTag: $zone }) {
      httpRequests1dGroups(limit: 92, filter: { date_geq: $since }, orderBy: [date_ASC]) {
        dimensions { date }
        sum { requests cachedRequests bytes cachedBytes pageViews threats }
        uniq { uniques }
      }
    } }
  }`;
  const res = await fetch('https://api.cloudflare.com/client/v4/graphql', {
    method: 'POST',
    headers: { authorization: `Bearer ${cfg.apiToken}`, 'content-type': 'application/json' },
    body: JSON.stringify({ query, variables: { zone: cfg.zoneTag, since: isoDaysAgo(days) } }),
  });
  const json = await jsonOrThrow(res, 'Cloudflare GraphQL');
  if (json.errors && json.errors.length) throw new Error(`Cloudflare GraphQL: ${JSON.stringify(json.errors).slice(0, 600)}`);
  return json.data.viewer.zones[0];
}

// ── standard audit bundle ───────────────────────────────────
async function all() {
  const days = Number(flag('days', 84));
  const stamp = new Date().toISOString().slice(0, 10);
  const dir = path.join(ROOT, 'docs', 'seo-audit', 'data', stamp);
  mkdirSync(dir, { recursive: true });
  const tasks = [
    ['gsc-by-date', () => gsc(['date'], days, days + 7, true)],
    ['gsc-queries', () => gsc(['query'], days, 2000, true)],
    ['gsc-pages', () => gsc(['page'], days, 2000, true)],
    ['gsc-devices', () => gsc(['device'], days, 10, false)],
    ['gsc-appearance', () => gsc(['searchAppearance'], days, 25, false)],
    ['gsc-query-page', () => gsc(['query', 'page'], days, 5000, false)],
    ['gsc-sitemaps', sitemaps],
    ['ga4-landing', () => ga4('landing', days, 250)],
    ['ga4-channels', () => ga4('channels', days, 50)],
    ['ga4-events', () => ga4('events', days, 100)],
  ];
  if (config().cloudflare && config().cloudflare.apiToken) {
    tasks.push(['cf-zone', () => cf(28)]);
  }
  let failed = 0;
  for (const [name, fn] of tasks) {
    try {
      const data = await fn();
      writeFileSync(path.join(dir, `${name}.json`), JSON.stringify(data, null, 2));
      const n = data.rows ? data.rows.length : (data.rowCount ?? '');
      console.log(`  ok   ${name}${n !== '' ? ` (${n} rows)` : ''}`);
    } catch (e) {
      failed++;
      console.error(`  FAIL ${name}: ${String(e.message || e).slice(0, 300)}`);
    }
  }
  console.log(`\nBundle → ${path.relative(ROOT, dir)}${failed ? ` (${failed} task(s) failed)` : ''}`);
  if (failed) process.exitCode = 1;
}

// ── setup instructions ──────────────────────────────────────
const SETUP = `One-time setup (~10 minutes, all free — full walkthrough in the /seo-audit skill):

1. console.cloud.google.com → create a project (any name).
2. APIs & Services → Enable: "Google Search Console API" and
   "Google Analytics Data API". Optional: "Chrome UX Report API" and
   "PageSpeed Insights API", plus an API key (Credentials → Create → API key)
   for the crux/psi commands.
3. IAM & Admin → Service Accounts → Create (no roles needed) → Keys →
   Add key → JSON. Save it as ~/.config/edmonton-refreshed/google-sa.json
   and chmod 600 it. NEVER place it inside the repo — the site repo is public.
4. Grant that service-account email access:
   - Search Console: Settings → Users and permissions → Add user → Full
     (Full is required for URL Inspection).
   - GA4: Admin → Property access management → add as Viewer.
5. GA4 property ID: Admin → Property settings → Property ID (numeric).
6. Write ${CONFIG_PATH}:
   {
     "serviceAccountKey": "~/.config/edmonton-refreshed/google-sa.json",
     "gscSite": "sc-domain:edmontonrefreshed.com",
     "ga4Property": "properties/XXXXXXXXX"
   }
   gscSite: use "sc-domain:<domain>" for a domain property, or the exact URL
   (with trailing slash) for a URL-prefix property — match what the Search
   Console property list shows.
   Optional extras: "cruxApiKey" (step 2), and
   "cloudflare": { "apiToken": "...", "zoneTag": "..." } — token from
   dash.cloudflare.com → My Profile → API Tokens with Zone → Analytics → Read;
   zoneTag is the Zone ID on the domain's overview page.
7. Test:  node scripts/seo-fetch.mjs sitemaps
          node scripts/seo-fetch.mjs ga4 channels --days 7`;

// ── dispatch ────────────────────────────────────────────────
// --out <file>: write the JSON to a file instead of stdout (PSI payloads run
// ~3 MB; during audits point them at docs/seo-audit/data/YYYY-MM-DD/).
const print = (data) => {
  const out = flag('out', null);
  const json = JSON.stringify(data, null, 2);
  if (out) {
    mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
    writeFileSync(out, json);
    console.log(`→ ${out}`);
  } else console.log(json);
};

try {
  switch (cmd) {
    case 'gsc':
      print(await gsc(
        (positionals[0] || 'query').split(','),
        Number(flag('days', 84)),
        Number(flag('limit', 1000)),
        Boolean(flag('compare', false)),
      ));
      break;
    case 'inspect':
      if (!positionals.length) fail('inspect needs one or more full URLs.');
      print(await inspect(positionals));
      break;
    case 'sitemaps': print(await sitemaps()); break;
    case 'ga4':
      print(await ga4(positionals[0] || 'channels', Number(flag('days', 84)), Number(flag('limit', 100))));
      break;
    case 'psi':
      if (!positionals.length) fail('psi needs a full URL.');
      print(await psi(positionals[0], flag('strategy', 'mobile')));
      break;
    case 'crux':
      if (!positionals.length) fail('crux needs a URL (or an origin with --origin).');
      print(await crux(positionals[0], Boolean(flag('origin', false))));
      break;
    case 'cf': print(await cf(Number(flag('days', 28)))); break;
    case 'all': await all(); break;
    case 'setup': console.log(SETUP); break;
    default:
      console.log('Commands: gsc | inspect | sitemaps | ga4 | psi | crux | cf | all | setup');
      console.log('See the header of scripts/seo-fetch.mjs or CLAUDE.md §8.16 for details.');
  }
} catch (e) {
  fail(String(e.message || e));
}
