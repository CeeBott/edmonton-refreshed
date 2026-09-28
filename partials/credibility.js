/**
 * Credibility strip — small trust band above the main content. Four
 * intentional variants, picked by the marker attribute on each page:
 *
 *   buyer   — homepage, sold archive, about, guides, privacy, 404 (default)
 *   seller  — sell hub + every /sell/[slug]/ landing page
 *   partner — /partners/ (same strip as seller; kept as its own variant name)
 *   listing — every active listing page (delivery-oriented messaging)
 *
 * Per-page marker form:
 *   <!-- CREDIBILITY_START variant="seller" -->...<!-- CREDIBILITY_END -->
 */
const site = require('../config/site');

function renderCredibility(variant) {
  // The seller strip carried a "Most Offers $500–$2,500" range until 2026-09-27.
  // Removed: a range topping out at $2,500 read as a lowball to exactly the
  // premium sellers the business wants most (§10.23). Do not re-add it.
  if (variant === 'seller') {
    return [
      '  <div class="credibility-strip">',
      `    <span>${site.piecesBought} Pieces Bought</span>`,
      '    <span class="credibility-sep">|</span>',
      `    <span>&#9733; ${site.rating} Rating</span>`,
      '    <span class="credibility-sep">|</span>',
      `    <span>Proudly <a href="/about/">${site.cityName} Owned &amp; Operated</a></span>`,
      '  </div>',
    ].join('\n');
  }
  if (variant === 'partner') {
    return [
      '  <div class="credibility-strip">',
      `    <span>${site.piecesBought} Pieces Bought</span>`,
      '    <span class="credibility-sep">|</span>',
      `    <span>&#9733; ${site.rating} Rating</span>`,
      '    <span class="credibility-sep">|</span>',
      `    <span>Proudly <a href="/about/">${site.cityName} Owned &amp; Operated</a></span>`,
      '  </div>',
    ].join('\n');
  }
  if (variant === 'listing') {
    return [
      '  <div class="credibility-strip">',
      `    <span>We Deliver Anywhere in ${site.cityName} and the Surrounding Area</span>`,
      '  </div>',
    ].join('\n');
  }
  // buyer (default)
  return [
    '  <div class="credibility-strip">',
    '    <span>Designer Brands</span>',
    '    <span class="credibility-sep">|</span>',
    `    <span>&#9733; ${site.rating} Rating</span>`,
    '    <span class="credibility-sep">|</span>',
    `    <span><a href="/about/">${site.cityName} Owned &amp; Operated</a></span>`,
    '  </div>',
  ].join('\n');
}

module.exports = { renderCredibility };
