/**
 * Inventory cards — the one renderer for every piece card on the site.
 *
 *   renderCard(item, 'available', opts)  homepage grid (§5.10): carousel,
 *                                        brand + badge, short title linking to
 *                                        the listing, size + condition pills,
 *                                        retail anchor, price.
 *   renderCard(item, 'sold', opts)       /sold/ archive: carousel, brand +
 *                                        Sold badge, title (linking to the
 *                                        piece's sold stub when it has one),
 *                                        card description.
 *   renderCard(item, 'compact', opts)    Recently sold strip on sell pages and
 *                                        the empty homepage (§4.3): one photo,
 *                                        brand, short title.
 *
 * The build writes the finished cards into each page, so the browser renders
 * none of them: js/shared.js only wires up the carousels, the lightbox, and
 * /sold/'s "Load more". Before this file the homepage and /sold/ cards were
 * written twice (a crawler fallback in build.js and the real card in the
 * browser scripts), mirrored by hand, and the browser rebuilt each grid after
 * load (§10.27). Visual differences between variants are deliberate and live
 * here; change a card here, never in a page.
 *
 * Photo paths come from either data file ("images/…" or "../images/…") and
 * are written root-absolute ("/images/…") so the same card works on any page.
 */

var h = require('./html');
var escapeHtml = h.escapeHtml;

// Card photo width for srcset selection: one column to 768px, two to the
// 1100px page width, then three ~345px columns (.cards-grid). The homepage
// LCP preload must use the same string, or the browser fetches the cover twice.
var CARD_SIZES = '(max-width: 768px) calc(100vw - 48px), (max-width: 1100px) 50vw, 350px';
var COMPACT_SIZES = '(max-width: 768px) 62vw, 180px';

// "../images/X/a.jpeg" or "images/X/a.jpeg" → "/images/X/a.jpeg".
function rootPath(src) {
  return '/' + String(src).replace(/^(?:\.\.\/)+/, '').replace(/^\/+/, '');
}

function isReserved(item) {
  return !!(item && item.reserved);
}

// Short card name: model and piece type, no fabric (§5.10).
function cardTitle(item) {
  return item.cardTitle || String(item.title).split(' — ')[0];
}

// Two pills: overall size and condition grade; legacy specs only as fallback.
function cardSpecs(item) {
  var d = item.dimensions || {};
  var out = [];
  if (d.width && d.depth && d.height) out.push(d.width + ' × ' + d.depth + ' × ' + d.height + ' in');
  if (item.conditionGrade) out.push(item.conditionGrade + ' Condition');
  if (out.length) return out;
  return (item.specs || []).filter(function (s) { return s !== item.brand; });
}

// Card retail anchor: retailLabel()'s verified/approx rules without the
// "plus tax & delivery" suffix, which stays on the listing's value pill.
function cardRetailLabel(item) {
  if (!item.retailEstimate) return '';
  return (item.retailVerified ? 'Retail ' : 'Est. retail ') +
    h.formatPrice(item.retailEstimate) + (item.retailEstimateApprox ? '+' : '') + ' CAD';
}

// Stable anchor for a sold card, from its image folder (e.g. sold-rc-033), so
// guides can link /sold/#sold-rc-033 (SOLD_LINK markers, §5.12).
function soldCardId(item) {
  var m = item.images && item.images[0] && item.images[0].match(/images\/(?:Sold Inventory\/)?([^\/]+)\//);
  return m ? 'sold-' + m[1].toLowerCase() : '';
}

// The cover's AVIF srcset, for the homepage LCP preload: identical to the
// card's own <source>, so the preload is reused rather than fetched twice.
function coverAvifSrcset(item) {
  return h.avifSrcsetFor(rootPath(item.images[0]));
}

function picture(src, sizes, attrs, park) {
  var rel = rootPath(src);
  var pre = park ? 'data-' : '';
  return '<picture>' +
    '<source type="image/avif" ' + pre + 'srcset="' + h.avifSrcsetFor(rel) + '" sizes="' + sizes + '">' +
    '<source type="image/webp" ' + pre + 'srcset="' + h.webpSrcsetFor(rel) + '" sizes="' + sizes + '">' +
    '<img ' + pre + 'src="' + h.srcsetUrl(rel) + '" ' + pre + 'srcset="' + h.srcsetFor(rel) + '" sizes="' + sizes + '"' + attrs + '>' +
    '</picture>';
}

// Card carousel. opts:
//   id        unique element id (from the piece, so batches never collide)
//   defer     'after-load' | 'interaction' | false — how slides after the
//             first are parked (data-src/data-srcset, swapped in by
//             hydrateImages() in js/shared.js; §7.6). Lazy loading alone does
//             not hold them: off-screen slides sit inside the load margin.
//   eager     load the cover eagerly: the LCP card only. Other covers stay
//             lazy, which still loads the visible ones as soon as layout
//             runs; eager ones start during parsing and, on a slow phone,
//             compete with the stylesheet the first paint is waiting for
//             (/sold/: +0.17s first paint with three eager covers, 2026-10-29).
//   priority  fetchpriority="high" on the cover (the LCP card only)
function carousel(images, alt, opts) {
  var count = images.length;
  var defer = count > 1 && opts.defer;
  var slides = images.map(function (src, i) {
    var attrs = ' alt="' + escapeHtml(alt + ' — photo ' + (i + 1)) + '"' +
      ' loading="' + (i === 0 && opts.eager ? 'eager' : 'lazy') + '"' +
      (i === 0 && opts.priority ? ' fetchpriority="high"' : '') +
      (i === 0 ? ' width="800" height="600"' : '') +
      ' draggable="false"';
    return picture(src, CARD_SIZES, attrs, defer && i > 0);
  }).join('');
  var dots = images.map(function (_, i) {
    return '<button class="dot' + (i === 0 ? ' active' : '') + '" data-index="' + i + '" aria-label="Photo ' + (i + 1) + '"></button>';
  }).join('');
  return '<div class="carousel' + (count <= 1 ? ' single' : '') + (defer === 'interaction' ? ' carousel-deferred' : '') + '"' +
    (defer === 'after-load' ? ' data-defer="after-load"' : '') +
    ' id="' + opts.id + '" data-index="0" data-count="' + count + '">' +
    '<div class="carousel-track">' + slides + '</div>' +
    '<button class="carousel-btn prev" aria-label="Previous photo"><svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg></button>' +
    '<button class="carousel-btn next" aria-label="Next photo"><svg viewBox="0 0 24 24"><polyline points="9 6 15 12 9 18"/></svg></button>' +
    '<div class="carousel-counter">1 / ' + count + '</div>' +
    '<div class="carousel-dots">' + dots + '</div>' +
    '</div>';
}

// opts.index: position in its grid. Only the first card's cover is eager: it
// is the homepage LCP image (and the preloaded one).
function availableCard(item, opts) {
  var slug = item.slug || h.slugify(item.brand + '-' + item.title);
  var badge = item.comingSoon ? '<span class="coming-soon-badge">Coming Soon</span>'
    : isReserved(item) ? '<span class="coming-soon-badge reserved-badge">Reserved</span>' : '';
  var brand = '<div class="card-brand">' + escapeHtml(item.brand) + '</div>';
  var title = escapeHtml(cardTitle(item));
  var lines = [
    '<div class="card">',
    item.images && item.images.length
      // Every photo's canonical page is its listing (§5.15); after-load keeps
      // them visible to Googlebot, which never interacts.
      ? carousel(item.images, item.brand + ' ' + item.title, {
          id: 'carousel-' + slug, defer: 'after-load', eager: opts.index === 0, priority: opts.index === 0 })
      : '<div class="card-image-placeholder">Photos coming soon</div>',
    '<div class="card-body">',
    badge ? '<div class="card-meta">' + brand + badge + '</div>' : brand,
    item.comingSoon
      ? '<div class="card-title">' + title + '</div>'
      : '<div class="card-title"><a class="card-title-link" href="/listings/' + slug + '/">' + title + '</a></div>',
    '<div class="card-specs">' + cardSpecs(item).map(function (s) {
      return '<span class="spec-tag">' + escapeHtml(s) + '</span>';
    }).join('') + '</div>',
    (item.comingSoon || !item.retailEstimate) ? '' : '<div class="card-retail">' + cardRetailLabel(item) + '</div>',
    item.comingSoon
      ? '<div class="card-price card-price--muted">Listing coming soon</div>'
      : '<div class="card-price">' + h.formatPrice(item.price) + ' <span class="card-price-currency">CAD</span></div>',
    '</div>',
    '</div>',
  ];
  return lines.filter(Boolean);
}

// opts.index: position in the archive. opts.batch: 0 for the cards shown on
// load; n > 0 marks a hidden card revealed by the nth "Load more" (js/shared.js).
function soldCard(item, opts) {
  var id = soldCardId(item);
  var title = escapeHtml(item.title);
  var lines = [
    '<div class="card sold"' + (id ? ' id="' + id + '"' : '') +
      (opts.batch ? ' hidden data-batch="' + opts.batch + '"' : '') + '>',
    item.images && item.images.length
      // Slides wait for interaction only when the piece has a sold stub: the
      // stub is its photos' canonical page (§5.15), so Googlebot, which never
      // interacts, loses nothing here. A piece without one keeps every photo.
      ? carousel(item.images, item.brand + ' ' + item.title, {
          id: 'carousel-' + (id || 'sold-' + opts.index), defer: item.href ? 'interaction' : false,
          eager: false, priority: false })
      : '<div class="card-image-placeholder">Photo</div>',
    '<div class="card-body">',
    '<div class="card-meta"><div class="card-brand">' + escapeHtml(item.brand) + '</div><span class="sold-badge">Sold</span></div>',
    item.href
      ? '<div class="card-title"><a class="card-title-link" href="' + item.href + '">' + title + '</a></div>'
      : '<div class="card-title">' + title + '</div>',
    item.description ? '<div class="card-description">' + escapeHtml(item.description) + '</div>' : '',
    '</div>',
    '</div>',
  ];
  return lines.filter(Boolean);
}

// The whole card is one link. href starts as /sold/; build.js relinkSoldCards
// points it at the piece's stub when one exists (§5.13). opts.fill marks a
// fill-in card (not the page's own brand), which the sell page's ItemList
// schema skips. Keep this shape: build.js parseSellLandingSoldCards reads
// card-brand, card-title, and the img src back out of it (§5.16).
function compactCard(item, opts) {
  var title = String(item.title || '').split(' — ')[0];
  var label = escapeHtml(item.brand + ' ' + title);
  return [
    '<a class="card sold" href="/sold/"' + (opts.fill ? ' data-sold-fill' : '') + ' aria-label="' + label + ' (sold)">',
    '  <div class="card-image-placeholder">' + picture(item.images[0], COMPACT_SIZES, ' alt="' + label + '" loading="lazy"', false) + '</div>',
    '  <div class="card-body">',
    '    <div class="card-brand">' + escapeHtml(item.brand) + '</div>',
    '    <div class="card-title">' + escapeHtml(title) + '</div>',
    '  </div>',
    '</a>',
  ];
}

// Returns the card's HTML, one line per element, each prefixed with indent.
function renderCard(item, variant, opts) {
  opts = opts || {};
  var lines = variant === 'available' ? availableCard(item, opts)
    : variant === 'sold' ? soldCard(item, opts)
    : variant === 'compact' ? compactCard(item, opts)
    : null;
  if (!lines) throw new Error('renderCard: unknown variant "' + variant + '"');
  var indent = opts.indent || '';
  return lines.map(function (l) { return indent + l; }).join('\n');
}

module.exports = {
  renderCard: renderCard,
  CARD_SIZES: CARD_SIZES,
  coverAvifSrcset: coverAvifSrcset,
  cardTitle: cardTitle,
  cardSpecs: cardSpecs,
  cardRetailLabel: cardRetailLabel,
  soldCardId: soldCardId,
  isReserved: isReserved,
};
