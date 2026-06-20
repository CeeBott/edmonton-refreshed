/**
 * Nav partial — renders the sitewide top navigation (logo + primary links +
 * Sell submenu + phone). Active state is applied client-side by shared.js
 * via the `data-page` attributes, so this output has no per-page variants.
 */
const site = require('../config/site');
const tax = require('../config/taxonomy');

function renderNav() {
  const brandItems = tax.brands
    .map(b => `            <li><a href="${tax.sellUrl(b.slug)}">${b.displayName || b.name}</a></li>`)
    .join('\n');
  const pieceItems = tax.furnitureTypes
    .map(p => `            <li><a href="${tax.sellUrl(p.slug)}">${p.nav}</a></li>`)
    .join('\n');
  const situationItems = tax.situations
    .map(s => `            <li><a href="${tax.sellUrl(s.slug)}">${s.nav}</a></li>`)
    .join('\n');

  return [
    '  <nav class="nav">',
    '    <div class="nav-inner">',
    `      <a href="/" class="nav-logo"><img src="/brand/er-logo-horizontal-light.png" alt="${site.brandName}" width="900" height="240"></a>`,
    '      <ul class="nav-links" id="navLinks">',
    '        <li><a href="/" data-page="available">Available</a></li>',
    '        <li><a href="/sold/" data-page="sold">Sold</a></li>',
    '        <li class="nav-dropdown">',
    '          <div class="nav-dropdown-wrap">',
    '            <a href="/sell/" data-page="sell">Sell Your Furniture</a>',
    '            <button class="nav-dropdown-toggle" aria-label="Toggle sell menu" aria-expanded="false" aria-controls="sell-submenu" type="button">',
    '              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><polyline points="6 9 12 15 18 9"/></svg>',
    '            </button>',
    '          </div>',
    '          <ul class="nav-dropdown-menu" id="sell-submenu" role="menu">',
    '            <li class="nav-dropdown-section"><span>By brand</span></li>',
    brandItems,
    '            <li class="nav-dropdown-section"><span>By piece</span></li>',
    pieceItems,
    '            <li class="nav-dropdown-section"><span>By situation</span></li>',
    situationItems,
    '          </ul>',
    '        </li>',
    '        <li><a href="/guides/" data-page="guides">Guides</a></li>',
    '        <li><a href="/about/" data-page="about">About</a></li>',
    `        <li class="nav-phone-mobile"><a href="tel:${site.phoneDigits}">${site.phone}</a></li>`,
    '      </ul>',
    '      <div class="nav-contact">',
    `        <a href="tel:${site.phoneDigits}">${site.phone}</a>`,
    '      </div>',
    '      <button class="nav-toggle" id="navToggle" aria-label="Menu" aria-expanded="false">',
    '        <span></span><span></span><span></span>',
    '      </button>',
    '    </div>',
    '  </nav>',
  ].join('\n');
}

module.exports = { renderNav };
