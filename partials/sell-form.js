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
 * (§5.11): Brand, Year of purchase, Original purchase price, receipt, Pets in
 * home, photos, Name, Best contact, Notes, plus the _honey checkbox honeypot
 * (which must stay a CHECKBOX — §9.1) and Acknowledged.
 * Renaming any of these here without updating worker/index.js breaks
 * submissions.
 *
 * Only Brand / Year of purchase / Name / Best contact are enforced by the
 * Worker. Everything else is either genuinely optional or a client-side-only
 * gate — the same reasoning that keeps `Acknowledged` out of REQUIRED_FIELDS
 * (§5.11): a field the Worker demands but some page does not send rejects
 * that page's submissions outright, so the server-side list stays minimal.
 * `Pets in home` is `required` in markup and unenforced server-side for
 * exactly this reason.
 *
 * ── Field order ─────────────────────────────────────────────────────
 * Three numbered groups (Your piece / Photos / How to reach you) so the form
 * reads as short steps rather than one long column. The provenance answers
 * (receipt, year, original price) sit together because they come from one
 * place: the receipt.
 *
 * There is deliberately NO "what are you hoping to get?" field — see §10.22.
 * Do not add one back next to the original purchase price, or anywhere else.
 */

// Required marker. Every field on this form is mandatory (§5.11), so the
// asterisk is a visual cue only — aria-hidden keeps screen readers from
// announcing "star" on all ten labels, since each control already carries a
// `required` attribute, which is what assistive tech actually reports.
var REQ = ' <span class="sell-form-req" aria-hidden="true">*</span>';

var DEFAULTS = {
  brandPlaceholder: 'e.g. Natuzzi, EQ3, Rove Concepts (or &lsquo;unsure&rsquo;)',
  // Must agree with MIN_PHOTOS / MAX_PHOTOS in js/sell-form.js and
  // worker/index.js (1 and 6). The receipt uploads through this same field,
  // which is why the cap is 6 rather than 5 and the wording says "files".
  photosNote: '(at least 1, up to 6 files)',
  notesLabel: 'Anything we should know?',
  notesPlaceholder: 'Anything we should know?',
  // Oldest discrete year offered before the catch-all bucket. A fixed year
  // rather than a rolling span (Collin, 2026-09-27): the list grows by one
  // each January as the current year is added at the top.
  oldestYear: 2010,
};

// Year-of-purchase options. Replaces the old "Approximate age" range select,
// whose 4–7 year bucket lumped together pieces that are worth materially
// different amounts. An exact year also feeds the listing's `productionDate`
// (§5.10), which is otherwise usually blank because §5.10 forbids inferring
// one.
//
// `currentYear` is passed in by build.js from today() so it stays on Edmonton
// local time — deriving it here from `new Date()` would reintroduce the §9.5
// UTC off-by-one on a UTC runner.
function yearOptions(currentYear) {
  var y = parseInt(currentYear, 10);
  if (!y || isNaN(y)) throw new Error('renderSellForm: currentYear is required');
  var out = ['<option value="">Select a year</option>'];
  for (var n = y; n >= DEFAULTS.oldestYear; n--) out.push('<option>' + n + '</option>');
  out.push('<option>Older than ' + DEFAULTS.oldestYear + '</option>');
  out.push('<option>Not sure</option>');
  return out;
}

// Condition options. These are the §5.19 grades, in the same order and with
// the same meaning as config/conditions.js — deliberately NOT a second scale.
//
// The seller's answer here is compared directly against the grade that ends up
// on the listing, so the two must name the same tiers. The top tier is labelled
// "Excellent / Like New" because that is exactly how the published rubric
// (guides/what-condition-means-furniture-grading-edmonton/) heads it: sellers
// think in "like new", and the guide already treats the two as one tier. Do not
// split them into separate options — that publishes a five-tier scale against
// the site's four (§5.19), and shifts every label down one so a seller's
// "Excellent" would mean our "Very Good".
//
// Definitions are the seller-facing wording: same degree of wear as
// config/conditions.js, phrased for someone assessing their own piece. Degree
// only, never a named defect (§5.19).
//
// Do NOT copy this wording back into config/conditions.js. Those definitions
// render on every listing at that grade and are bound by the stricter rules
// there: degree only, no named defects, and no claims about how long a piece
// was owned or how heavily it was used. Guidance that helps a seller size up
// their own piece can assert more than a published grade definition may.
var CONDITION_OPTIONS = [
  ['Excellent / Like New', 'Virtually no signs of use'],
  ['Very Good',            'Minimal signs of use, apparent on close inspection'],
  ['Good',                 'Signs of use expected with normal use'],
  ['Fair',                 'Obvious cosmetic wear, structurally sound'],
];

// Example shots shown behind "See example shots" in the photo group. Real
// photos from our own listings (CB-050, AL-049), cropped square by CSS.
var PHOTO_EXAMPLES = [
  ['/images/CB-050/crate-and-barrel-02-400w.jpeg',  'Front',    'Example: the front of a sofa'],
  ['/images/CB-050/crate-and-barrel-03-400w.jpeg',  'Side',     'Example: the side profile of a sofa'],
  ['/images/AL-049/american-leather-19-400w.jpeg',  'Close-up', 'Example: a close-up of the leather'],
  ['/images/CB-050/crate-and-barrel-06-400w.jpeg',  'Tags',     'Example: a manufacturer label'],
];

function renderSellForm(opts) {
  var o = opts || {};
  var i = o.indent || '      ';
  var brand = o.brand || '';
  // §5.11: brand pages omit the mass-market acknowledgment.
  var ack = !brand;
  var notesLabel = o.notesLabel || DEFAULTS.notesLabel;
  var notesPlaceholder = o.notesPlaceholder || DEFAULTS.notesPlaceholder;
  var years = yearOptions(o.currentYear);

  var out = [];
  function p(line) { out.push(line === '' ? '' : i + line); }

  p('<form class="sell-form" id="sell-form" method="POST" enctype="multipart/form-data" novalidate>');
  p('  <input type="checkbox" name="_honey" class="sell-form-honey" tabindex="-1" autocomplete="off" aria-hidden="true">');
  p('');
  // ── Group 1: the piece ──────────────────────────────────────────
  p('  <fieldset class="sell-form-group">');
  p('    <legend class="sell-form-group-title"><span class="sell-form-group-num" aria-hidden="true">1</span> Your piece</legend>');
  p('');
  p('    <div class="sell-form-row">');
  p('      <label for="sf-brand">Brand' + REQ + '</label>');
  p('      <input type="text" id="sf-brand" name="Brand" placeholder="' + DEFAULTS.brandPlaceholder + '" autocomplete="off" value="' + brand + '" required aria-describedby="sf-brand-warn">');
  // Filled by js/sell-form.js when the brand typed is one we don't buy. A soft
  // warning, never a block: it lands at the moment the seller is deciding,
  // instead of in a fit list they may have scrolled past.
  p('      <p class="sell-form-brand-warn" id="sf-brand-warn" role="status" hidden></p>');
  p('    </div>');
  p('');
  // Second field, directly under Brand: asking about the receipt up front
  // primes everything downstream.
  p('    <fieldset class="sell-form-row sell-form-choice">');
  p('      <legend>Do you have the original receipt?' + REQ + '</legend>');
  p('      <div class="sell-form-seg">');
  p('        <label><input type="radio" name="Has receipt" value="Yes" required> <span>Yes</span></label>');
  p('        <label><input type="radio" name="Has receipt" value="No"> <span>No</span></label>');
  p('      </div>');
  // The "isn't required" sentence is load-bearing (§5.11): stating only the
  // upside of a receipt implies a downside to not having one, and a seller
  // answering "No" this early could read it as being disqualified.
  p('      <p class="sell-form-hint">It helps us make a stronger offer. It isn&rsquo;t required. We make offers with or without one.</p>');
  p('    </fieldset>');
  p('');
  p('    <div class="sell-form-pair">');
  p('      <div class="sell-form-row">');
  p('        <label for="sf-year">Year purchased' + REQ + '</label>');
  p('        <select id="sf-year" name="Year of purchase" required>');
  years.forEach(function (opt) { p('          ' + opt); });
  p('        </select>');
  p('      </div>');
  p('      <div class="sell-form-row">');
  p('        <label for="sf-msrp">Original price' + REQ + '</label>');
  p('        <input type="text" id="sf-msrp" name="Original purchase price" inputmode="numeric" autocomplete="off" placeholder="$ (approximate is fine)" required>');
  p('      </div>');
  p('    </div>');
  p('');
  // No hint under Condition by design: the per-option definitions carry the
  // whole explanation.
  p('    <div class="sell-form-row">');
  p('      <label for="sf-condition">Condition' + REQ + '</label>');
  p('      <select id="sf-condition" name="Condition" required>');
  p('        <option value="">Select a condition</option>');
  CONDITION_OPTIONS.forEach(function (c) {
    p('        <option value="' + c[0] + '">' + c[0] + ': ' + c[1] + '</option>');
  });
  p('      </select>');
  p('    </div>');
  p('');
  p('    <fieldset class="sell-form-row sell-form-choice">');
  p('      <legend>Pets in the home' + REQ + '</legend>');
  p('      <div class="sell-form-seg sell-form-seg-3">');
  p('        <label><input type="radio" name="Pets in home" value="Non-hypoallergenic cat or dog" required> <span>Cat or dog</span></label>');
  p('        <label><input type="radio" name="Pets in home" value="Hypoallergenic cat or dog"> <span>Hypoallergenic</span></label>');
  p('        <label><input type="radio" name="Pets in home" value="None"> <span>No pets</span></label>');
  p('      </div>');
  p('      <p class="sell-form-hint">Only tells us what cleaning it needs. It never disqualifies a piece.</p>');
  p('    </fieldset>');
  p('  </fieldset>');
  p('');
  // ── Group 2: photos ─────────────────────────────────────────────
  p('  <fieldset class="sell-form-group">');
  p('    <legend class="sell-form-group-title" id="sf-photos-label"><span class="sell-form-group-num" aria-hidden="true">2</span> Photos' + REQ + ' <span class="sell-form-req-note">' + DEFAULTS.photosNote + '</span></legend>');
  p('    <p class="sell-form-hint sell-form-hint-lead">Best shots: the front, the side profile, a close-up of the fabric or leather, and any tags or labels. Add your receipt too if you have it.</p>');
  // Examples sit behind a disclosure: shown full size inside the form they
  // read as photos already attached, or as options to tap.
  p('    <details class="sell-photo-examples">');
  p('      <summary>See example shots</summary>');
  p('      <ul>');
  PHOTO_EXAMPLES.forEach(function (e) {
    p('        <li><img src="' + e[0] + '" alt="' + e[2] + '" width="64" height="64" loading="lazy"><span>' + e[1] + '</span></li>');
  });
  p('      </ul>');
  p('    </details>');
  p('    <div class="sell-photo-picker">');
  // Deliberately NOT `required`: the input is cleared after every selection
  // (files are held in a JS array so they can accumulate across picks), so a
  // markup `required` would block submission even with files chosen. The
  // minimum is enforced in js/sell-form.js against that array instead.
  p('      <input type="file" id="sf-photos" name="photos" accept="image/*,application/pdf" multiple class="sell-photo-input" aria-labelledby="sf-photos-label">');
  p('      <button type="button" class="sell-photo-add" id="sf-photos-add" aria-describedby="sf-photos-label">+ Add photos</button>');
  p('      <ul class="sell-photo-list" id="sf-photos-list" hidden aria-live="polite"></ul>');
  p('      <p class="sell-photo-count" id="sf-photos-count" hidden></p>');
  p('    </div>');
  p('    <p class="sell-form-error" id="sf-photos-error" hidden></p>');
  p('  </fieldset>');
  p('');
  // ── Group 3: contact ────────────────────────────────────────────
  p('  <fieldset class="sell-form-group">');
  p('    <legend class="sell-form-group-title"><span class="sell-form-group-num" aria-hidden="true">3</span> How to reach you</legend>');
  p('    <div class="sell-form-pair">');
  p('      <div class="sell-form-row">');
  p('        <label for="sf-name">Your name' + REQ + '</label>');
  p('        <input type="text" id="sf-name" name="Name" autocomplete="name" required>');
  p('      </div>');
  p('      <div class="sell-form-row">');
  p('        <label for="sf-contact">Phone or email' + REQ + '</label>');
  p('        <input type="text" id="sf-contact" name="Best contact" required>');
  p('      </div>');
  p('    </div>');
  p('    <div class="sell-form-row">');
  // The one optional field. It is the last thing before submit, and "anything
  // we should know?" has a legitimate answer of "no".
  p('      <label for="sf-notes">' + notesLabel + ' <span class="sell-form-req-note">(optional)</span></label>');
  p('      <textarea id="sf-notes" name="Notes" rows="3" placeholder="' + notesPlaceholder + '"></textarea>');
  p('    </div>');
  p('  </fieldset>');
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
  p('  <p class="sell-form-disclaimer">Your details are only used to evaluate your piece and are never shared.</p>');
  p('</form>');

  return out.join('\n');
}

module.exports = { renderSellForm };
