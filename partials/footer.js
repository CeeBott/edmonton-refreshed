/**
 * Footer partial — renders the sitewide global footer: brand statement,
 * three-column taxonomy (Sell by Furniture Type / Sell By Situation /
 * Sell By Brand), and utility/legal row. All taxonomy content comes from
 * config/taxonomy.js; copy comes from config/site.js.
 */
const site = require('../config/site');
const tax = require('../config/taxonomy');

function renderFooter() {
  const pieceLinks = tax.furnitureTypes
    .map(p => `            <li><a href="${tax.sellUrl(p.slug)}">${p.name}</a></li>`)
    .join('\n');
  const situationLinks = tax.situations
    .map(s => `            <li><a href="${tax.sellUrl(s.slug)}">${s.name}</a></li>`)
    .join('\n');
  const brandLinks = tax.brands
    .map(b => `            <li><a href="${tax.sellUrl(b.slug)}">${b.displayName || b.name}</a></li>`)
    .join('\n');

  return [
    '  <footer class="site-footer">',
    '    <div class="footer-inner">',
    '      <div class="footer-statement">',
    `        <p class="footer-lead">${site.brandStatement}</p>`,
    `        <p class="footer-sub">${site.brandSubstatement}</p>`,
    '      </div>',
    '      <nav class="footer-taxonomy" aria-label="Footer navigation">',
    '        <div class="footer-col">',
    '          <h2 class="footer-heading">Sell by Furniture Type</h2>',
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
    '          <li><a href="/privacy/">Privacy Policy</a></li>',
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
