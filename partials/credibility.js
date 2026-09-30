/**
 * Credibility strip — small trust band above the main content. Four
 * variants, picked by the marker attribute on each page:
 *
 *   buyer   — homepage, sold archive, about, guides, privacy, returns
 *   seller  — sell hub + every /sell/[slug]/ landing page
 *   partner — /partners/ (kept as its own variant name so it can diverge)
 *   listing — every active listing page and sold stub (delivery line only)
 *
 * Per-page marker form:
 *   <!-- CREDIBILITY_START variant="seller" -->...<!-- CREDIBILITY_END -->
 *
 * The copy lives in config/site.js#credibility. Every three-part variant is
 * built from ONE template here: only the lead differs, so the rating and the
 * city line cannot drift between variants (they once did — "Proudly" survived
 * on the seller strip after the buyer strip dropped it). An unknown variant
 * throws, so a typo in a marker fails the build instead of silently
 * rendering the buyer strip.
 */
const site = require('../config/site');

function renderCredibility(variant) {
  const copy = site.credibility;
  if (variant === 'listing') {
    return [
      '  <div class="credibility-strip">',
      `    <span>${copy.listing.replace('{city}', site.cityName)}</span>`,
      '  </div>',
    ].join('\n');
  }
  const lead = copy.lead[variant];
  if (!lead) {
    throw new Error('Unknown credibility variant "' + variant + '" — expected one of: listing, ' + Object.keys(copy.lead).join(', '));
  }
  return [
    '  <div class="credibility-strip">',
    `    <span>${lead}</span>`,
    '    <span class="credibility-sep">|</span>',
    `    <span>&#9733; ${site.rating} Rating</span>`,
    '    <span class="credibility-sep">|</span>',
    `    <span><a href="/about/">${site.cityName} Owned &amp; Operated</a></span>`,
    '  </div>',
  ].join('\n');
}

module.exports = { renderCredibility };
