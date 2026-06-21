/**
 * Footer partial — renders the sitewide global footer: brand statement,
 * three-column taxonomy (Sell by Furniture Type / Sell By Situation /
 * Sell By Brand), and utility/legal row. All taxonomy content comes from
 * config/taxonomy.js; copy comes from config/site.js.
 */
const site = require('../config/site');
const tax = require('../config/taxonomy');

function renderFooter() {
  // The couch / leather-couch landing pages still exist (and stay in the nav
  // dropdown and sitemap for the "couch" search term), but they're omitted from
  // the footer: a couch and a sofa are the same piece, so the sofa entries
  // already cover the column and listing both just reads as redundant clutter.
  const FOOTER_PIECE_EXCLUDE = new Set(['couch', 'leather-couch']);
  const pieceLinks = tax.furnitureTypes
    .filter(p => !FOOTER_PIECE_EXCLUDE.has(p.slug))
    .map(p => `            <li><a href="${tax.sellUrl(p.slug)}">${p.name}</a></li>`)
    .join('\n');
  const situationLinks = tax.situations
    .map(s => `            <li><a href="${tax.sellUrl(s.slug)}">${s.name}</a></li>`)
    .join('\n');
  // Brand column. We append an "Other brands" escape-hatch link so the list
  // doesn't inadvertently signal that we only buy the named six — the
  // taxonomy reflects which brands have dedicated landing pages, not the full
  // set of brands we'll consider. Sellers whose brand isn't listed go to the
  // main sell hub for a general inquiry.
  const brandLinks = tax.brands
    .map(b => `            <li><a href="${tax.sellUrl(b.slug)}">${b.displayName || b.name}</a></li>`)
    .concat([
      '            <li class="footer-link-aside"><a href="/sell/">Other brands &rarr;</a></li>',
    ])
    .join('\n');

  return [
    '  <footer class="site-footer">',
    '    <div class="footer-inner">',
    '      <div class="footer-statement">',
    `        <a href="/" class="footer-logo"><img src="/brand/er-logo-horizontal-light.png" alt="${site.brandName}" width="900" height="240"></a>`,
    `        <p class="footer-lead">${site.brandStatement}</p>`,
    `        <p class="footer-sub">${site.brandSubstatement}</p>`,
    '      </div>',
    '      <nav class="footer-taxonomy" aria-label="Footer navigation">',
    '        <div class="footer-col">',
    '          <h2 class="footer-heading">Sell Your Furniture</h2>',
    '          <ul class="footer-links">',
    pieceLinks,
    '          </ul>',
    '        </div>',
    '        <div class="footer-col">',
    '          <h2 class="footer-heading">Sell By Situation</h2>',
    '          <ul class="footer-links">',
    situationLinks,
    '          </ul>',
    '        </div>',
    '        <div class="footer-col">',
    '          <h2 class="footer-heading">Sell By Brand</h2>',
    '          <ul class="footer-links">',
    brandLinks,
    '          </ul>',
    '        </div>',
    '      </nav>',
    '      <div class="footer-bottom">',
    '        <ul class="footer-utility">',
    '          <li><a href="/sold/">Recently Sold</a></li>',
    '          <li><a href="/guides/">Guides</a></li>',
    '          <li><a href="/about/">About</a></li>',
    '          <li><a href="/partners/">Partners</a></li>',
    '          <li><a href="/privacy/">Privacy Policy</a></li>',
    '          <li><a href="/returns/">Returns &amp; Refunds</a></li>',
    '        </ul>',
    '        <div class="footer-meta">',
    `          <p class="footer-copy">&copy; 2026 ${site.brandFullName}</p>`,
    `          <p class="footer-tagline">${site.brandTagline}</p>`,
    '        </div>',
    '      </div>',
    '    </div>',
    '  </footer>',
  ].join('\n');
}

module.exports = { renderFooter };
