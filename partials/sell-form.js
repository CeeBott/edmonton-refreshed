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
 * The provenance cluster (year → original price → receipt) sits together
 * because those three answers come from one place: the receipt.
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
  photosNote: '(at least 1 photo &mdash; up to 6 files)',
  notesLabel: 'Anything we should know?',
  notesPlaceholder: 'Anything we should know?',
  // Oldest discrete year offered before the catch-all bucket. 14 back from the
  // current year keeps the list a single scroll while still covering the range
  // where age materially moves value; everything older is one bucket, because
  // the difference between a 16- and a 19-year-old sofa does not change the
  // offer.
  yearSpan: 14,
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
  for (var n = y; n >= y - DEFAULTS.yearSpan; n--) out.push('<option>' + n + '</option>');
  out.push('<option>' + (y - DEFAULTS.yearSpan - 1) + ' or earlier</option>');
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
// render on every listing at that grade and are bound by the stricter "no
// claims about history" rule there — "expected with normal use and age" is fine
// as guidance to a seller sizing up their own piece, and would be an unfounded
// claim about provenance if published on a listing.
var CONDITION_OPTIONS = [
  ['Excellent / Like New', 'Virtually no signs of use'],
  ['Very Good',            'Minimal signs of use, apparent on close inspection'],
  ['Good',                 'Signs of use expected with normal use and age'],
  ['Fair',                 'Obvious cosmetic wear, structurally sound'],
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
  p('  <div class="sell-form-row">');
  p('    <label for="sf-brand">Brand' + REQ + '</label>');
  p('    <input type="text" id="sf-brand" name="Brand" placeholder="' + DEFAULTS.brandPlaceholder + '" autocomplete="off" value="' + brand + '" required>');
  p('  </div>');
  p('');
  // Second field, directly under Brand: asking about the receipt up front
  // primes everything downstream — both provenance fields below say "if no
  // invoice is available", and the upload asks for it again.
  p('  <fieldset class="sell-form-row sell-form-choice">');
  p('    <legend>Do you have the original receipt?' + REQ + '</legend>');
  p('    <p class="sell-form-hint">Having original documentation showing purchase dates and prices helps us make a stronger, more confident offer.</p>');
  p('    <label class="sell-form-choice-option"><input type="radio" name="Has receipt" value="Yes" required> <span>Yes</span></label>');
  p('    <label class="sell-form-choice-option"><input type="radio" name="Has receipt" value="No"> <span>No</span></label>');
  p('  </fieldset>');
  p('');
  p('  <div class="sell-form-row">');
  p('    <label for="sf-year">Year purchased or manufactured' + REQ + '</label>');
  p('    <select id="sf-year" name="Year of purchase" required>');
  years.forEach(function (opt) { p('      ' + opt); });
  p('    </select>');
  p('    <p class="sell-form-hint">Enter approx. year of purchase if no invoice is available</p>');
  p('  </div>');
  p('');
  // No hint under this one by design: the per-option definitions carry the
  // whole explanation, and a "most sellers grade one tier high" nudge above
  // them read as a warning rather than help.
  p('  <div class="sell-form-row">');
  p('    <label for="sf-condition">Condition' + REQ + '</label>');
  p('    <select id="sf-condition" name="Condition" required>');
  p('      <option value="">Select a condition</option>');
  CONDITION_OPTIONS.forEach(function (c) {
    p('      <option value="' + c[0] + '">' + c[0] + ' &mdash; ' + c[1] + '</option>');
  });
  p('    </select>');
  p('  </div>');
  p('');
  p('  <div class="sell-form-row">');
  p('    <label for="sf-msrp">Original purchase price' + REQ + '</label>');
  p('    <input type="text" id="sf-msrp" name="Original purchase price" inputmode="numeric" autocomplete="off" placeholder="$" required>');
  p('    <p class="sell-form-hint">Enter the price pre-tax and any shipping fees. Enter the approximate price if the invoice is unavailable</p>');
  p('  </div>');
  p('');
  p('  <fieldset class="sell-form-row sell-form-choice">');
  p('    <legend>Pets in the home' + REQ + '</legend>');
  p('    <p class="sell-form-hint">This tells us what cleaning the piece will need. It does not disqualify anything.</p>');
  p('    <label class="sell-form-choice-option"><input type="radio" name="Pets in home" value="Non-hypoallergenic cat or dog" required> <span>Cat or dog</span></label>');
  p('    <label class="sell-form-choice-option"><input type="radio" name="Pets in home" value="Hypoallergenic cat or dog"> <span>Hypoallergenic cat or dog</span></label>');
  p('    <label class="sell-form-choice-option"><input type="radio" name="Pets in home" value="None"> <span>No pets</span></label>');
  p('  </fieldset>');
  p('');
  p('  <div class="sell-form-row">');
  p('    <label id="sf-photos-label">Photos and receipt' + REQ + ' <span class="sell-form-req-note">' + DEFAULTS.photosNote + '</span></label>');
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
  p('    <p class="sell-form-hint">Include photos of your item, including any relevant wear, as well as your original purchase receipt/invoice if it&rsquo;s available.</p>');
  p('    <p class="sell-form-error" id="sf-photos-error" hidden></p>');
  p('  </div>');
  p('');
  p('  <div class="sell-form-row">');
  p('    <label for="sf-name">Your name' + REQ + '</label>');
  p('    <input type="text" id="sf-name" name="Name" autocomplete="name" required>');
  p('  </div>');
  p('');
  p('  <div class="sell-form-row">');
  p('    <label for="sf-contact">Best contact (phone or email)' + REQ + '</label>');
  p('    <input type="text" id="sf-contact" name="Best contact" placeholder="Phone number or email" required>');
  p('  </div>');
  p('');
  p('  <div class="sell-form-row">');
  p('    <label for="sf-notes">' + notesLabel + REQ + '</label>');
  p('    <textarea id="sf-notes" name="Notes" rows="4" placeholder="' + notesPlaceholder + '" required></textarea>');
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
