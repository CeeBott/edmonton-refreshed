/**
 * Footer partial — renders the sitewide global footer: brand statement,
 * three-column taxonomy (Sell by Furniture Type / Sell By Situation /
 * Sell By Brand), utility/legal row, and social icons. All taxonomy content comes from
 * config/taxonomy.js; copy comes from config/site.js.
 */
const site = require('../config/site');
const tax = require('../config/taxonomy');

// Line icons drawn on a 24px grid, stroked in currentColor so they take the
// footer's muted text colour and hover state.
const SOCIAL_ICONS = [
  {
    name: 'Facebook',
    host: 'facebook.com',
    svg: '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>',
  },
  {
    name: 'Instagram',
    host: 'instagram.com',
    svg: '<rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.6" cy="6.4" r="0.6" fill="currentColor"/>',
  },
];

function renderFooter() {
  const pieceLinks = tax.furnitureTypes
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

  // Social icons — URLs come from config/site.js#sameAs (the one list of
  // external profiles), so a profile added there for schema also gets its
  // footer icon. Only platforms with an icon below render.
  const socialLinks = SOCIAL_ICONS
    .map(p => ({ ...p, url: site.sameAs.find(u => u.includes(p.host)) }))
    .filter(p => p.url)
    .map(p => `            <li><a href="${p.url}" target="_blank" rel="noopener" aria-label="${site.brandName} on ${p.name}"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">${p.svg}</svg></a></li>`)
    .join('\n');

  return [
    '  <footer class="site-footer">',
    '    <div class="footer-inner">',
    '      <div class="footer-statement">',
    `        <a href="/" class="footer-logo"><img src="/brand/er-logo-horizontal-light.png" srcset="/brand/er-logo-horizontal-light-400w.png 400w, /brand/er-logo-horizontal-light.png 900w" sizes="173px" alt="${site.brandName}" width="900" height="240"></a>`,
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
    '          <ul class="footer-social">',
    socialLinks,
    '          </ul>',
    `          <p class="footer-copy">&copy; 2026 ${site.brandFullName}</p>`,
    `          <p class="footer-tagline">${site.brandTagline}</p>`,
    '        </div>',
    '      </div>',
    '    </div>',
    '  </footer>',
  ].join('\n');
}

module.exports = { renderFooter };
