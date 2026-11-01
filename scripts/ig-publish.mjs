#!/usr/bin/env node
// scripts/ig-publish.mjs — publishes queued Instagram carousels.
//
//   node scripts/ig-publish.mjs                 list the queue and what is due
//   node scripts/ig-publish.mjs approve <id..>  record Collin's approval of those posts
//   node scripts/ig-publish.mjs publish         publish every approved post that is due
//   node scripts/ig-publish.mjs publish --id X  publish one approved post now
//
// The queue (docs/social/instagram/queue.json) is local and git-ignored.
// Credentials come from ~/.config/instagram-mcp/credentials.json, shared with
// the Instagram MCP server; nothing secret is ever printed.
//
// A post publishes only if it was approved AND its caption, alt text and
// images still match what was approved (approvedHash). Editing a caption
// after approval puts it back in draft. Every slide URL must answer 200 as a
// JPEG first, so a post whose slides have not been pushed yet is skipped,
// not half-published.
import fs from 'fs';
import os from 'os';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const QUEUE = path.join(ROOT, 'docs/social/instagram/queue.json');
const CREDS = path.join(os.homedir(), '.config/instagram-mcp/credentials.json');
const GRAPH = 'https://graph.facebook.com/v23.0';
const REFRESH_DAYS = 15;

const today = () => new Date().toLocaleDateString('en-CA', { timeZone: 'America/Edmonton' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const readQueue = () => JSON.parse(fs.readFileSync(QUEUE, 'utf8'));
const writeQueue = (q) => fs.writeFileSync(QUEUE, JSON.stringify(q, null, 2) + '\n');
const creds = () => JSON.parse(fs.readFileSync(CREDS, 'utf8'));
const hashOf = (p) => crypto.createHash('sha256')
  .update(JSON.stringify([p.caption, p.alt, p.images])).digest('hex').slice(0, 16);
const isApproved = (p) => p.status === 'approved' && p.approvedHash === hashOf(p);

async function gapi(pathname, { method = 'GET', params = {}, token } = {}) {
  const url = new URL(`${GRAPH}/${pathname}`);
  url.searchParams.set('access_token', token ?? creds().access_token);
  for (const [k, v] of Object.entries(params)) if (v != null) url.searchParams.set(k, String(v));
  const res = await fetch(url, { method });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.error) {
    const e = body.error ?? { message: res.statusText };
    throw new Error(`Graph API ${pathname}: ${e.message}${e.error_user_msg ? ' (' + e.error_user_msg + ')' : ''}`);
  }
  return body;
}

// Exchange the long-lived token for a fresh one once it is inside REFRESH_DAYS
// of expiry. Works only while the current token is still valid.
async function refreshIfNeeded() {
  const c = creds();
  if (!c.app_id || !c.app_secret) return 'token expiry unknown (no app_id/app_secret)';
  const dbg = await gapi('debug_token', { params: { input_token: c.access_token }, token: `${c.app_id}|${c.app_secret}` });
  const exp = dbg.data?.expires_at;
  if (!dbg.data?.is_valid) throw new Error('Instagram token is invalid: generate a new one (see the instagram-post skill).');
  const days = exp ? (exp * 1000 - Date.now()) / 86400000 : Infinity;
  if (days > REFRESH_DAYS) return `token valid ${Math.floor(days)} more days`;
  const res = await gapi('oauth/access_token', {
    params: { grant_type: 'fb_exchange_token', client_id: c.app_id, client_secret: c.app_secret, fb_exchange_token: c.access_token },
  });
  if (!res.access_token) throw new Error('Token refresh returned no token.');
  fs.writeFileSync(CREDS, JSON.stringify({ ...c, access_token: res.access_token }, null, 2) + '\n', { mode: 0o600 });
  return 'token refreshed';
}

async function slidesLive(p) {
  for (const u of p.images) {
    const r = await fetch(u, { method: 'HEAD' }).catch(() => null);
    if (!r || r.status !== 200 || !/image\/jpeg/.test(r.headers.get('content-type') || '')) return u;
  }
  return null;
}

async function waitFor(id) {
  for (let i = 0; i < 36; i++) {
    const s = await gapi(id, { params: { fields: 'status_code' } });
    if (s.status_code === 'FINISHED') return;
    if (s.status_code === 'ERROR' || s.status_code === 'EXPIRED') throw new Error(`container ${id} ${s.status_code}`);
    await sleep(5000);
  }
  throw new Error(`container ${id} still processing after 3 minutes`);
}

async function publish(p) {
  const c = creds();
  const ig = c.ig_user_id;
  if (!ig) throw new Error('ig_user_id missing from credentials.');
  const n = p.images.length;
  const altFor = (i) => (n > 1 ? `${p.alt}. Photo ${i + 1} of ${n}.` : p.alt);
  let container;
  if (n === 1) {
    container = (await gapi(`${ig}/media`, { method: 'POST', params: {
      image_url: p.images[0], caption: p.caption, alt_text: altFor(0), location_id: c.location_id } })).id;
  } else {
    const kids = [];
    for (const [i, url] of p.images.entries()) {
      kids.push((await gapi(`${ig}/media`, { method: 'POST', params: {
        image_url: url, is_carousel_item: true, alt_text: altFor(i) } })).id);
    }
    for (const k of kids) await waitFor(k);
    container = (await gapi(`${ig}/media`, { method: 'POST', params: {
      media_type: 'CAROUSEL', children: kids.join(','), caption: p.caption, location_id: c.location_id } })).id;
  }
  await waitFor(container);
  const media = await gapi(`${ig}/media_publish`, { method: 'POST', params: { creation_id: container } });
  const { permalink } = await gapi(media.id, { params: { fields: 'permalink' } });
  return { mediaId: media.id, permalink };
}

const [cmd = 'list', ...args] = process.argv.slice(2);
const q = readQueue();

if (cmd === 'list') {
  const t = today();
  for (const p of q.posts) {
    const state = p.permalink ? 'posted' : isApproved(p) ? (p.date <= t ? 'DUE' : 'approved')
      : p.status === 'approved' ? 'CHANGED since approval' : 'draft';
    console.log(p.date, p.id.padEnd(13), String(p.images.length).padStart(2), state.padEnd(22), p.permalink || '');
  }
} else if (cmd === 'approve') {
  for (const id of args) {
    const p = q.posts.find((x) => x.id === id);
    if (!p) { console.error(`no post ${id}`); process.exitCode = 1; continue; }
    if (!p.caption || !p.alt) { console.error(`${id} has no caption or alt text`); process.exitCode = 1; continue; }
    Object.assign(p, { status: 'approved', approvedHash: hashOf(p), approvedOn: today() });
    console.log('approved', id);
  }
  writeQueue(q);
} else if (cmd === 'publish') {
  const only = args[0] === '--id' ? args[1] : null;
  const due = q.posts.filter((p) => !p.permalink && (only ? p.id === only : p.date <= today()));
  if (!due.length) { console.log('nothing due'); process.exit(0); }
  console.log(await refreshIfNeeded());
  for (const p of due) {
    if (!isApproved(p)) { console.log(`SKIP ${p.id}: ${p.status === 'approved' ? 'changed since approval' : 'not approved'}`); continue; }
    const dead = await slidesLive(p);
    if (dead) { console.log(`SKIP ${p.id}: slide not live yet (push needed): ${dead}`); continue; }
    try {
      const r = await publish(p);
      Object.assign(p, { status: 'posted', postedOn: today(), mediaId: r.mediaId, permalink: r.permalink });
      writeQueue(q);
      console.log(`POSTED ${p.id} ${r.permalink}`);
    } catch (e) {
      console.log(`FAILED ${p.id}: ${e.message}`);
      process.exitCode = 1;
    }
  }
} else {
  console.error('usage: ig-publish.mjs [list | approve <id..> | publish [--id <id>]]');
  process.exit(2);
}
