/**
 * HTML helpers shared by build.js and the partials that render inventory
 * (partials/cards.js). One copy of each, so the build and the cards cannot
 * format a price, escape a title, or spell an image URL differently.
 */

// Text for HTML: the five unsafe characters, plus typographic punctuation as
// named entities (house style in every generated page).
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/—/g, '&mdash;')
    .replace(/–/g, '&ndash;')
    .replace(/“/g, '&ldquo;')
    .replace(/”/g, '&rdquo;')
    .replace(/‘/g, '&lsquo;')
    .replace(/’/g, '&rsquo;');
}

// Prices are stored as bare numbers (§5.2): 7500 → "$7,500". The CAD suffix
// is added at the markup boundary by the caller.
var PRICE_FMT = new Intl.NumberFormat('en-CA', { maximumFractionDigits: 0 });
function formatPrice(n) {
  return '$' + PRICE_FMT.format(n);
}

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

// srcset candidates are whitespace-separated, so a literal space in a path
// (legacy "images/Sold Inventory/") splits the URL and the browser drops every
// candidate, falling back to the full-size JPEG in src (§5.3, §9.12).
function srcsetUrl(u) { return u.replace(/ /g, '%20'); }

// The 400w / 800w / full (1200w) variant set every photo has (§5.3).
function variantSrcset(imgPath, prefix, ext) {
  var base = srcsetUrl((prefix || '') + imgPath.replace(/\.jpeg$/, ''));
  return base + '-400w.' + ext + ' 400w, ' + base + '-800w.' + ext + ' 800w, ' + base + '.' + ext + ' 1200w';
}
function srcsetFor(imgPath, prefix)     { return variantSrcset(imgPath, prefix, 'jpeg'); }
function webpSrcsetFor(imgPath, prefix) { return variantSrcset(imgPath, prefix, 'webp'); }
function avifSrcsetFor(imgPath, prefix) { return variantSrcset(imgPath, prefix, 'avif'); }

module.exports = {
  escapeHtml: escapeHtml,
  formatPrice: formatPrice,
  slugify: slugify,
  srcsetUrl: srcsetUrl,
  srcsetFor: srcsetFor,
  webpSrcsetFor: webpSrcsetFor,
  avifSrcsetFor: avifSrcsetFor,
};
