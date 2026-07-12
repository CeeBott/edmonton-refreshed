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
//   ALLOWED_ORIGIN   — e.g. "https://edmontonrefreshed.com"

const REQUIRED_FIELDS = [
  'Brand',
  'Approximate age',
  'Name',
  'Best contact',
];

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
    const cors = {
      'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN || '*',
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

    for (const field of REQUIRED_FIELDS) {
      if (!(formData.get(field) || '').toString().trim()) {
        return json({ error: `Missing required field: ${field}` }, 400, cors);
      }
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

    const get = (k) => (formData.get(k) || '').toString().trim();
    const sourcePage = get('Source page') || '(unknown)';
    const lines = [
      `Submitted from: ${sourcePage}`,
      '',
      `Brand: ${get('Brand')}`,
      `Approximate age: ${get('Approximate age')}`,
      `Asking price: ${get('Asking price') || '(not provided)'}`,
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

function arrayBufferToBase64(buf) {
  const bytes = new Uint8Array(buf);
  const chunk = 0x8000;
  let binary = '';
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}
