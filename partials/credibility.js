/**
 * Credibility strip — small trust band above the main content. Four
 * intentional variants, picked by the marker attribute on each page:
 *
 *   buyer   — homepage, sold archive, about, guides, privacy, 404 (default)
 *   seller  — sell hub + every /sell/[slug]/ landing page
 *   partner — /partners/ (seller strip minus the offer range)
 *   listing — every active listing page (delivery-oriented messaging)
 *
 * Per-page marker form:
 *   <!-- CREDIBILITY_START variant="seller" -->...<!-- CREDIBILITY_END -->
 */
const site = require('../config/site');

function renderCredibility(variant) {
  if (variant === 'seller') {
    return [
      '  <div class="credibility-strip">',
      `    <span>${site.piecesBought} Pieces Bought</span>`,
      '    <span class="credibility-sep">|</span>',
      `    <span>&#9733; ${site.rating} Rating</span>`,
      '    <span class="credibility-sep">|</span>',
      `    <span>Proudly ${site.cityName} Owned &amp; Operated</span>`,
      '    <span class="credibility-sep">|</span>',
      `    <span>${site.offerRange}</span>`,
      '  </div>',
    ].join('\n');
  }
  if (variant === 'partner') {
    // seller strip without the offer range — the partner hand-off page speaks
    // to B2B partners, not sellers anchoring on a purchase figure.
    return [
      '  <div class="credibility-strip">',
      `    <span>${site.piecesBought} Pieces Bought</span>`,
      '    <span class="credibility-sep">|</span>',
      `    <span>&#9733; ${site.rating} Rating</span>`,
      '    <span class="credibility-sep">|</span>',
      `    <span>Proudly ${site.cityName} Owned &amp; Operated</span>`,
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
    `    <span>${site.cityName} Owned &amp; Operated</span>`,
    '  </div>',
  ].join('\n');
}

module.exports = { renderCredibility };
