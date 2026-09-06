// Cloudflare Worker for the Edmonton Refreshed sell-page form.
// Receives multipart/form-data, validates, and emails the submission
// (with all photo attachments) via the Resend API.
//
// Required env:
//   RESEND_API_KEY   — secret, set via `wrangler secret put RESEND_API_KEY`
//   TO_EMAIL         — destination inbox (your Gmail or info@ address)
//   FROM_EMAIL       — Resend-verified sender; for first-time use,
//                      set to "onboarding@resend.dev" (works only when
//                      TO_EMAIL is the same address you signed up with).
//   ALLOWED_ORIGIN   — comma-separated allowlist, e.g.
//                      "https://edmontonrefreshed.com,https://www.edmontonrefreshed.com"
//                      (www serves the site too, so both origins must be allowed
//                      or www visitors get a CORS "Failed to fetch")

const REQUIRED_FIELDS = [
  'Brand',
  'Name',
  'Best contact',
];

// Age is required, but which field carries it depends on which version of the
// site the submission came from: the form moved from an "Approximate age"
// range select to an exact "Year of purchase" (§5.11). The static site and this
// Worker deploy independently (§4.8), so for a window after either one ships
// there are pages in the wild sending the other field — and a hard requirement
// on one name would reject every submission from those pages with a "Missing
// required field" error the seller can do nothing about. Accepting either makes
// the deploy order irrelevant.
//
// Once GitHub Pages has served the new form for long enough that no cached page
// sends the old name, 'Approximate age' can be dropped from this list.
const AGE_FIELDS = ['Year of purchase', 'Approximate age'];

// A receipt is optional but can be a PDF, which the client cannot compress the
// way it downscales photos. Capped separately so one large scan cannot eat the
// whole email budget; the client enforces the same number (§5.11).
const MAX_RECEIPT_BYTES = 8 * 1024 * 1024;

const MAX_PHOTOS = 5;
const MIN_PHOTOS = 1;
// 18 MB raw — must stay under Cloudflare Email Routing's 25 MB on-the-wire
// limit once base64-encoded (raw × 4/3 plus headers). The client compresses
// photos in-browser before upload, so submissions normally arrive at a few
// MB; this cap is a backstop for tampered clients and edge cases where
// compression failed on every file.
const MAX_TOTAL_BYTES = 18 * 1024 * 1024;
const MIN_FORM_FILL_MS = 2000; // Reject submissions filled in under 2 seconds — naive bots.

export default {
  async fetch(request, env) {
    // ALLOWED_ORIGIN is a comma-separated allowlist (apex + www — both serve
    // the site). Echo the request's Origin when it's on the list; otherwise
    // fall back to the first entry so responses always carry a concrete value.
    const allowed = (env.ALLOWED_ORIGIN || '*').split(',').map((s) => s.trim()).filter(Boolean);
    const reqOrigin = request.headers.get('Origin') || '';
    const allowOrigin = allowed.includes('*') ? '*'
      : (allowed.includes(reqOrigin) ? reqOrigin : allowed[0]);
    const cors = {
      'Access-Control-Allow-Origin': allowOrigin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Vary': 'Origin',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: cors });
    }

    let formData;
    try {
      formData = await request.formData();
    } catch {
      return json({ error: 'Could not read form data.' }, 400, cors);
    }

    // Honeypot — checkbox that real browsers / password managers basically
    // never tick. Any value present = drop silently and return success so
    // bots can't distinguish real failure.
    if (formData.get('_honey')) {
      return json({ ok: true }, 200, cors);
    }

    // Timing check — naive bots POST the form in well under a second.
    // Real humans take at least a few seconds to type name + contact + notes.
    const elapsedMs = parseInt((formData.get('_elapsed_ms') || '').toString(), 10);
    if (!Number.isFinite(elapsedMs) || elapsedMs < MIN_FORM_FILL_MS) {
      return json({ ok: true }, 200, cors);
    }

    // Buyer viewing-request path (listing pages) — a small, photo-less inquiry
    // tagged `_form=viewing`. It emails Collin directly, skipping the sell-lead
    // path below (no photos, different required fields). The sell form never
    // sends `_form`, so it falls straight through. See handleViewingRequest.
    if ((formData.get('_form') || '').toString() === 'viewing') {
      return handleViewingRequest(formData, env, cors);
    }

    for (const field of REQUIRED_FIELDS) {
      if (!(formData.get(field) || '').toString().trim()) {
        return json({ error: `Missing required field: ${field}` }, 400, cors);
      }
    }
    const ageValue = AGE_FIELDS
      .map((f) => (formData.get(f) || '').toString().trim())
      .find(Boolean);
    if (!ageValue) {
      return json({ error: 'Missing required field: Year of purchase' }, 400, cors);
    }

    const photos = formData.getAll('photos').filter((p) => p instanceof File && p.size > 0);
    if (photos.length < MIN_PHOTOS) {
      return json({ error: `Please attach at least ${MIN_PHOTOS} photo${MIN_PHOTOS === 1 ? '' : 's'}.` }, 400, cors);
    }
    if (photos.length > MAX_PHOTOS) {
      return json({ error: `Please attach no more than ${MAX_PHOTOS} photos.` }, 400, cors);
    }

    let totalBytes = 0;
    const attachments = [];
    for (const photo of photos) {
      totalBytes += photo.size;
      if (totalBytes > MAX_TOTAL_BYTES) {
        return json({
          error: `Photos exceed ${(MAX_TOTAL_BYTES / 1024 / 1024).toFixed(0)} MB total. Please send smaller files.`,
        }, 400, cors);
      }
      const buf = await photo.arrayBuffer();
      attachments.push({
        filename: sanitizeFilename(photo.name),
        content: arrayBufferToBase64(buf),
      });
    }

    // Optional receipt/invoice — a photo or a PDF. Counted against the same
    // email budget as the photos, with its own per-file cap because a PDF
    // scan bypasses the client's image compression entirely.
    const receipt = formData.get('receipt');
    const hasReceipt = receipt instanceof File && receipt.size > 0;
    if (hasReceipt) {
      if (receipt.size > MAX_RECEIPT_BYTES) {
        return json({
          error: `That receipt is larger than ${(MAX_RECEIPT_BYTES / 1024 / 1024).toFixed(0)} MB. Please send a smaller file, or leave it off and email it separately.`,
        }, 400, cors);
      }
      totalBytes += receipt.size;
      if (totalBytes > MAX_TOTAL_BYTES) {
        return json({
          error: `Photos and receipt exceed ${(MAX_TOTAL_BYTES / 1024 / 1024).toFixed(0)} MB total. Please send smaller files.`,
        }, 400, cors);
      }
      const rbuf = await receipt.arrayBuffer();
      attachments.push({
        filename: sanitizeFilename(receipt.name || 'receipt'),
        content: arrayBufferToBase64(rbuf),
      });
    }

    const get = (k) => (formData.get(k) || '').toString().trim();
    const sourcePage = get('Source page') || '(unknown)';
    const lines = [
      `Submitted from: ${sourcePage}`,
      '',
      `Brand: ${get('Brand')}`,
      `Year purchased / made: ${ageValue}`,
      `Original purchase price: ${get('Original purchase price') || '(not provided)'}`,
      `Receipt attached: ${hasReceipt ? 'yes' : 'no'}`,
      `Pets in home: ${get('Pets in home') || '(not answered)'}`,
      // The "what are you hoping to get?" field was removed from the form
      // (§10.22). This line is retained CONDITIONALLY, not as a live field:
      // cached pages served before the removal still POST one, and silently
      // discarding a number a seller volunteered would lose real information.
      // It disappears on its own once no page sends it. Do not re-add the
      // field to bring the line back.
      ...(get('Asking price') ? [`Asking price (legacy field): ${get('Asking price')}`] : []),
      '',
      `Name: ${get('Name')}`,
      `Best contact: ${get('Best contact')}`,
      '',
      'Notes:',
      get('Notes') || '(none)',
    ];

    const subject = `New Sell Inquiry — ${get('Brand')} — ${get('Name')} (from ${sourcePage})`;
    const replyTo = looksLikeEmail(get('Best contact')) ? get('Best contact') : undefined;

    const payload = {
      from: env.FROM_EMAIL,
      to: env.TO_EMAIL,
      subject,
      text: lines.join('\n'),
      attachments,
    };
    if (replyTo) payload.reply_to = replyTo;

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!resendRes.ok) {
      const detail = await resendRes.text();
      console.error('Resend error', resendRes.status, detail);
      return json({
        error: 'We could not send your details right now. Please text us at 780-965-1477.',
      }, 502, cors);
    }

    return json({ ok: true }, 200, cors);
  },
};

// Buyer "request a viewing" inquiry from a listing page. Delivers the inquiry
// as an email via Resend.
//
// This used to ping Telegram first and fall back to email. The Telegram path
// was removed 2026-08-23 — it went unused in practice and the email is
// sufficient — so email is now the single delivery path. Don't reintroduce a
// second channel here without a reason; one path means one thing to monitor.
//
// Env: reuses RESEND_API_KEY / TO_EMAIL / FROM_EMAIL from the sell-form path.
async function handleViewingRequest(formData, env, cors) {
  const get = (k) => (formData.get(k) || '').toString().trim();
  const name = get('Name');
  const phone = get('Phone');
  const email = get('Email');
  const piece = get('Piece');
  const message = get('Message');
  const sourcePage = get('Source page') || '(unknown)';

  // Phone and email are each optional but one is required, and anything
  // supplied must parse. Mirrors js/viewing-form.js so a client that skipped
  // the inline checks still gets a specific, visible error instead of a lead
  // we can't reply to. Errors are returned (not silently dropped) — the
  // silent-drop contract covers bot signals only (§5.11).
  if (!name) {
    return json({ error: 'Please include your name.' }, 400, cors);
  }
  if (!phone && !email) {
    return json({ error: 'Please add a phone number or an email so we can get back to you.' }, 400, cors);
  }
  if (phone && !looksLikePhone(phone)) {
    return json({ error: 'That phone number doesn\'t look right. Enter it like 780-965-1477.' }, 400, cors);
  }
  if (email && !looksLikeEmail(email)) {
    return json({ error: 'That email doesn\'t look right. Enter it like you@example.com.' }, 400, cors);
  }

  const text =
    '🛋️ New viewing request\n\n' +
    'Piece: ' + (piece || '(unspecified)') + '\n' +
    'Name: ' + name + '\n' +
    'Phone: ' + (phone || '(not provided)') + '\n' +
    'Email: ' + (email || '(not provided)') + '\n' +
    (message ? 'Message: ' + message + '\n' : '') +
    'Page: ' + sourcePage;

  if (env.RESEND_API_KEY && env.TO_EMAIL && env.FROM_EMAIL) {
    try {
      const payload = {
        from: env.FROM_EMAIL,
        to: env.TO_EMAIL,
        subject: 'Viewing request — ' + (piece || 'a piece') + ' — ' + name,
        text,
      };
      const replyTo = looksLikeEmail(email) ? email : (looksLikeEmail(phone) ? phone : '');
      if (replyTo) payload.reply_to = replyTo;
      const r = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (r.ok) return json({ ok: true }, 200, cors);
      console.error('Resend viewing-request error', r.status, await r.text());
    } catch (err) {
      console.error('Resend viewing-request failed', err);
    }
  } else {
    console.error('Resend not configured (RESEND_API_KEY / TO_EMAIL / FROM_EMAIL missing)');
  }

  return json({
    error: 'We could not send your request right now. Please text us at 780-965-1477.',
  }, 502, cors);
}

function json(data, status, cors) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...cors },
  });
}

function sanitizeFilename(name) {
  if (!name) return 'photo.jpg';
  return name.replace(/[^A-Za-z0-9._-]/g, '_').slice(0, 80) || 'photo.jpg';
}

function looksLikeEmail(s) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

// Same rule as js/viewing-form.js's phoneIsValid: allow the common written
// forms (7809651477, 780-965-1477, (780) 965-1477, 1 780 965 1477,
// +1 780.965.1477), reject letters and wrong-length digit runs. Keep the two
// in sync — the client copy is the one buyers see, this one is the backstop.
function looksLikePhone(s) {
  if (!/^\+?[0-9\s().-]+$/.test(s)) return false;
  const digits = s.replace(/\D/g, '');
  if (s.charAt(0) === '+') return digits.length >= 8 && digits.length <= 15;
  if (digits.length === 11) return digits.charAt(0) === '1';
  return digits.length === 10;
}

function arrayBufferToBase64(buf) {
  const bytes = new Uint8Array(buf);
  const chunk = 0x8000;
  let binary = '';
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}
