/**
 * Sell form — the embedded seller lead form (§5.11) that appears on the sell
 * hub, all 19 /sell/[slug]/ landing pages, and the two legacy -edmonton
 * full-page stubs: 22 pages in total.
 *
 * This markup was hand-copied into all 22 of those pages, with §5.11 holding
 * them in sync by instruction alone — the same "update every copy" pattern
 * §9.3 exists to kill, and that §10.17 (reviewCount) and §10.18 (the prelude
 * panels) already caught twice. It drifted, exactly as predicted: the two
 * legacy stubs still told sellers "(3 to 5 required)" for photos long after
 * the Worker dropped MIN_PHOTOS to 1, so those pages turned away anyone
 * holding two photos. See §5.11.
 *
 * Injected by build.js as an anchored, unmarked rewrite (same class as the
 * prelude panels and the aggregateRating sync — §4.3), anchored on the
 * <form class="sell-form"> element. Idempotent and self-healing: a page
 * hand-edited between builds is rewritten back to this source.
 *
 * ── Per-page variation ──────────────────────────────────────────────
 * Three things legitimately differ per page. Everything else is identical
 * everywhere and lives here as a constant.
 *
 *   brand   — brand pages pre-fill sf-brand with their own brand (§5.11
 *             exception 1). Blank everywhere else.
 *   ack     — the mandatory mass-market acknowledgment checkbox (§5.11
 *             exception 2). NOT a separate input: it is derived as !brand,
 *             which is precisely the rule §5.11 states — a seller on a
 *             premium-brand page has already self-identified the brand, so
 *             the disclaimer is redundant there. Encoding the rule rather
 *             than a per-page boolean means the two can never disagree.
 *   notes   — situational pages tailor the "Anything we should know?" label
 *             and placeholder to their circumstance (move date, executor
 *             details, building access). This is deliberate page-specific
 *             copy, so it is a parameter rather than something normalized
 *             away.
 *
 * Per-page values live in SELL_FORM_META in build.js, keyed by repo-relative
 * path — the same convention as LANDING_SOLD_SCHEMA_META (§5.16).
 *
 * ── Worker contract ─────────────────────────────────────────────────
 * Field `name` attributes are the wire format the Cloudflare Worker reads
 * (§5.11): Brand, Approximate age, Asking price, photos, Name, Best contact,
 * Notes, plus the _honey checkbox honeypot (which must stay a CHECKBOX —
 * §9.1) and Acknowledged. Renaming any of these here without updating
 * worker/index.js breaks submissions. `Acknowledged` is deliberately absent
 * from the Worker's REQUIRED_FIELDS because brand pages omit it (§5.11).
 */

var DEFAULTS = {
  brandPlaceholder: 'e.g. Natuzzi, EQ3, Rove Concepts (or &lsquo;unsure&rsquo;)',
  // Must agree with MIN_PHOTOS / MAX_PHOTOS in worker/index.js (1 and 5).
  photosNote: '(minimum 1 photo &mdash; more are welcome)',
  notesLabel: 'Anything we should know?',
  notesPlaceholder: 'Anything we should know?',
};

function renderSellForm(opts) {
  var o = opts || {};
  var i = o.indent || '      ';
  var brand = o.brand || '';
  // §5.11: brand pages omit the mass-market acknowledgment.
  var ack = !brand;
  var notesLabel = o.notesLabel || DEFAULTS.notesLabel;
  var notesPlaceholder = o.notesPlaceholder || DEFAULTS.notesPlaceholder;

  var out = [];
  function p(line) { out.push(line === '' ? '' : i + line); }

  p('<form class="sell-form" id="sell-form" method="POST" enctype="multipart/form-data" novalidate>');
  p('  <input type="checkbox" name="_honey" class="sell-form-honey" tabindex="-1" autocomplete="off" aria-hidden="true">');
  p('');
  p('  <div class="sell-form-row">');
  p('    <label for="sf-brand">Brand</label>');
  p('    <input type="text" id="sf-brand" name="Brand" placeholder="' + DEFAULTS.brandPlaceholder + '" autocomplete="off" value="' + brand + '" required>');
  p('  </div>');
  p('');
  p('  <div class="sell-form-row">');
  p('    <label for="sf-age">Approximate age</label>');
  p('    <select id="sf-age" name="Approximate age" required>');
  p('      <option value="">Select age range</option>');
  p('      <option>0&ndash;3 years</option>');
  p('      <option>4&ndash;7 years</option>');
  p('      <option>8&ndash;10 years</option>');
  p('      <option>11&ndash;15 years</option>');
  p('      <option>15+ years</option>');
  p('    </select>');
  p('  </div>');
  p('');
  p('  <div class="sell-form-row">');
  p('    <label for="sf-price">What are you hoping to get? <span class="sell-form-req-note">(optional)</span></label>');
  p('    <input type="text" id="sf-price" name="Asking price" inputmode="numeric" autocomplete="off" placeholder="Know what you&rsquo;d like to get? Share it here.">');
  p('  </div>');
  p('');
  p('  <div class="sell-form-row">');
  p('    <label id="sf-photos-label">Photos <span class="sell-form-req-note">' + DEFAULTS.photosNote + '</span></label>');
  p('    <div class="sell-photo-picker">');
  p('      <input type="file" id="sf-photos" name="photos" accept="image/*" multiple class="sell-photo-input" aria-labelledby="sf-photos-label">');
  p('      <button type="button" class="sell-photo-add" id="sf-photos-add" aria-describedby="sf-photos-label">+ Add photos</button>');
  p('      <ul class="sell-photo-list" id="sf-photos-list" hidden aria-live="polite"></ul>');
  p('      <p class="sell-photo-count" id="sf-photos-count" hidden></p>');
  p('    </div>');
  p('    <p class="sell-form-hint">Front, side, and close-ups of any wear. You can add photos one at a time or several at once. Photos are automatically optimized before sending — feel free to use full-resolution shots from your phone.</p>');
  p('    <p class="sell-form-error" id="sf-photos-error" hidden></p>');
  p('  </div>');
  p('');
  p('  <div class="sell-form-row">');
  p('    <label for="sf-name">Your name</label>');
  p('    <input type="text" id="sf-name" name="Name" autocomplete="name" required>');
  p('  </div>');
  p('');
  p('  <div class="sell-form-row">');
  p('    <label for="sf-contact">Best contact (phone or email)</label>');
  p('    <input type="text" id="sf-contact" name="Best contact" placeholder="Phone number or email" required>');
  p('  </div>');
  p('');
  p('  <div class="sell-form-row">');
  p('    <label for="sf-notes">' + notesLabel + '</label>');
  p('    <textarea id="sf-notes" name="Notes" rows="4" placeholder="' + notesPlaceholder + '"></textarea>');
  p('  </div>');
  p('');
  if (ack) {
    p('  <div class="sell-form-ack">');
    p('    <label class="sell-form-ack-label">');
    p('      <input type="checkbox" id="sf-ack" name="Acknowledged" value="yes" required>');
    p('      <span>I understand Edmonton Refreshed primarily purchases higher-end furniture from select brands and may not be able to make offers on mass-market furniture.</span>');
    p('    </label>');
    p('    <p class="sell-form-ack-note">Examples of brands we typically do not purchase include IKEA, Ashley, Leon&rsquo;s, The Brick, and similar mass-market furniture brands.</p>');
    p('  </div>');
    p('');
  }
  p('  <button type="submit" class="sell-form-submit">Get My Offer</button>');
  p("  <p class=\"sell-form-disclaimer\">We'll get you an offer today. Your details are only used to evaluate your piece &mdash; never shared.</p>");
  p('</form>');

  return out.join('\n');
}

module.exports = { renderSellForm };
