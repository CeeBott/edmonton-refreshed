/**
 * Credibility strip — small trust band above the main content. Three
 * intentional variants, picked by the marker attribute on each page:
 *
 *   buyer   — homepage, sold archive, about, guides, privacy, 404 (default)
 *   seller  — sell hub + every /sell/[slug]-edmonton/ landing page
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
    `    <span>${site.piecesSold} Pieces Sold</span>`,
    '    <span class="credibility-sep">|</span>',
    `    <span>&#9733; ${site.rating} Rating</span>`,
    '    <span class="credibility-sep">|</span>',
    `    <span>Proudly ${site.cityName} Owned &amp; Operated</span>`,
    '  </div>',
  ].join('\n');
}

module.exports = { renderCredibility };
