// ═══════════════════════════════════════════════════════════
//  BUILD SCRIPT
//
//  Reads JS data files and:
//    1. Minifies CSS + JS source into .min.css / .min.js bundles.
//    2. Computes content-hash versions for every minified asset and
//       rewrites ?v=... query strings across every HTML file so cache
//       busting is automatic (no manual version registry).
//    3. Injects static fallback HTML into index.html and sold/index.html
//       so crawlers see content without JS.
//    4. Injects static Product schema <script> blocks into index.html <head>.
//    5. Generates individual listing pages at /listings/[slug]/index.html
//       for each available (non-coming-soon) item.
//    6. Generates centralized FAQ markup + JSON-LD schema from
//       config/faqs.js into the homepage / sell hub / about page.
//    7. Rewrites sitemap.xml. <lastmod> only advances when the rendered
//       content actually changed, using a committed sidecar state file
//       (.build-state.json). Pure build executions do not dilute freshness.
//
//  Usage:  node build.js
//  Deps:   none (Node.js built-ins only)
// ═══════════════════════════════════════════════════════════

var fs     = require('fs');
var path   = require('path');
var crypto = require('crypto');

var ROOT = __dirname;

// ── Partials (sitewide layout: nav, credibility strip, footer) ──
var renderNav         = require('./partials/nav').renderNav;
var renderFooter      = require('./partials/footer').renderFooter;
var renderCredibility = require('./partials/credibility').renderCredibility;

// ── FAQ source of truth (homepage / sell hub / about) ──
var faqs = require('./config/faqs');

// ── Site config (sameAs URLs, business stats, etc.) ──
var site = require('./config/site');


// ── Utilities ────────────────────────────────────────────

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/\u2014/g, '&mdash;')
    .replace(/\u2013/g, '&ndash;')
    .replace(/\u201C/g, '&ldquo;')
    .replace(/\u201D/g, '&rdquo;')
    .replace(/\u2018/g, '&lsquo;')
    .replace(/\u2019/g, '&rsquo;');
}

// \u2500\u2500 Price formatting \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
//  Canonical data stores prices as pure numbers (e.g. 7500). All visible
//  text and schema output derives from these helpers so the CAD invariant
//  (\u00A75.2) lives in exactly one place. The parallel client-side helper
//  in js/shared.js is a one-line mirror \u2014 too trivial to drift.

var PRICE_FMT = new Intl.NumberFormat('en-CA', { maximumFractionDigits: 0 });

function formatPrice(n) {
  return '$' + PRICE_FMT.format(n);
}

function formatPriceCAD(n) {
  return formatPrice(n) + ' CAD';
}

// \u2500\u2500 Content hashing \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
//  First 8 hex of SHA-256. Used for asset cache-busting and for sitemap
//  freshness comparisons.

function shortHash(content) {
  return crypto.createHash('sha256').update(content).digest('hex').slice(0, 8);
}

function srcsetFor(imgPath, prefix) {
  prefix = prefix || '';
  var base = imgPath.replace(/\.jpeg$/, '');
  return prefix + base + '-400w.jpeg 400w, ' + prefix + base + '-800w.jpeg 800w, ' + prefix + imgPath + ' 1200w';
}

function webpSrcsetFor(imgPath, prefix) {
  prefix = prefix || '';
  var base = imgPath.replace(/\.jpeg$/, '');
  return prefix + base + '-400w.webp 400w, ' + prefix + base + '-800w.webp 800w, ' + prefix + base + '.webp 1200w';
}

function avifSrcsetFor(imgPath, prefix) {
  prefix = prefix || '';
  var base = imgPath.replace(/\.jpeg$/, '');
  return prefix + base + '-400w.avif 400w, ' + prefix + base + '-800w.avif 800w, ' + prefix + base + '.avif 1200w';
}

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function today() {
  return new Date().toISOString().split('T')[0];
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}


// ── Asset pipeline ───────────────────────────────────────
//  Minifies CSS + JS source and computes a short content hash for each
//  output. The hash becomes the cache-busting "?v=" query parameter,
//  injected into every HTML reference automatically. No manual version
//  tracking; bumping versions is a side effect of editing source.

function minifyCSS(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, '')           // strip block comments
    .replace(/\s+/g, ' ')                       // collapse all whitespace
    .replace(/\s*([{}:;,>+~])\s*/g, '$1')       // tighten around CSS operators
    .replace(/;}/g, '}')                        // drop trailing semicolons
    .trim();
}

function minifyJS(src) {
  return src
    .replace(/(?<![:'"\\])\/\/[^\n]*/g, '')   // strip // comments (skip URLs in strings)
    .replace(/\/\*[\s\S]*?\*\//g, '')         // strip block comments
    .replace(/\n\s*\n/g, '\n')                // collapse blank lines
    .split('\n').map(function(l) { return l.trim(); }).filter(Boolean).join('\n');
}

// Build every minified bundle, write to disk, return { 'css/styles.min.css': 'a1b2c3d4', ... }.
function buildAssets() {
  var versions = {};

  var cssSrcPath = path.join(ROOT, 'css', 'styles.css');
  var cssMinPath = path.join(ROOT, 'css', 'styles.min.css');
  var cssMin = minifyCSS(fs.readFileSync(cssSrcPath, 'utf8'));
  fs.writeFileSync(cssMinPath, cssMin, 'utf8');
  versions['css/styles.min.css'] = shortHash(cssMin);

  var jsFiles = ['shared.js', 'available-data.js', 'sold-data.js', 'reviews-data.js', 'sell-form.js'];
  jsFiles.forEach(function(file) {
    var srcPath = path.join(ROOT, 'js', file);
    if (!fs.existsSync(srcPath)) return;
    var minName = file.replace('.js', '.min.js');
    var minPath = path.join(ROOT, 'js', minName);
    var minified = minifyJS(fs.readFileSync(srcPath, 'utf8'));
    fs.writeFileSync(minPath, minified, 'utf8');
    versions['js/' + minName] = shortHash(minified);
  });

  return versions;
}

// Rewrite every "<asset>?v=anything" on known assets to the current hash.
// Idempotent — re-running with unchanged sources produces unchanged output.
function injectAssetVersions(html, versions) {
  Object.keys(versions).forEach(function(asset) {
    var re = new RegExp(escapeRegExp(asset) + '\\?v=[A-Za-z0-9._-]+', 'g');
    html = html.replace(re, asset + '?v=' + versions[asset]);
  });
  return html;
}


// ── Data extraction ──────────────────────────────────────
//  Parses JS source to extract variable declarations
//  without executing render functions or DOM calls.

function extractVar(src, varName, openBracket, closeBracket) {
  var re = new RegExp('var\\s+' + varName + '\\s*=\\s*\\' + openBracket);
  var match = re.exec(src);
  if (!match) throw new Error('Could not find var ' + varName);

  var depth = 0;
  var inStr = false;
  var strCh = '';
  var i = match.index + match[0].length - 1; // at the opening bracket

  for (; i < src.length; i++) {
    var ch = src[i];
    if (inStr) {
      if (ch === '\\') { i++; continue; }
      if (ch === strCh) inStr = false;
      continue;
    }
    if (ch === '"' || ch === "'") { inStr = true; strCh = ch; continue; }
    if (ch === openBracket) depth++;
    if (ch === closeBracket) { depth--; if (depth === 0) break; }
  }

  var declaration = src.substring(match.index, i + 1) + ';';
  return new Function(declaration + '\nreturn ' + varName + ';')();
}

function extractArray(src, varName)  { return extractVar(src, varName, '[', ']'); }
function extractObject(src, varName) { return extractVar(src, varName, '{', '}'); }


// ── HTML generators ──────────────────────────────────────

function generateAvailableHTML(items) {
  if (items.length === 0) return '';

  var lines = ['        <!-- Static fallback for crawlers; JS replaces this on load -->'];

  items.forEach(function(item, idx) {
    var slug       = item.slug || slugify(item.brand + '-' + item.title);
    var listingUrl = '/listings/' + slug + '/';
    var imgSrc     = (item.images && item.images.length > 0) ? item.images[0] : '';
    var alt        = escapeHtml(item.brand + ' ' + item.title);
    var loading    = idx === 0 ? 'eager' : 'lazy';
    var specs      = item.specs.map(function(s) {
      return '<span class="spec-tag">' + escapeHtml(s) + '</span>';
    }).join('');

    var fetchPri = idx === 0 ? ' fetchpriority="high" width="800" height="600"' : '';
    var imgHtml = imgSrc
      ? '          <div class="card-image-placeholder"><picture><source type="image/avif" srcset="' + avifSrcsetFor(imgSrc) + '" sizes="(max-width: 768px) 100vw, 530px"><source type="image/webp" srcset="' + webpSrcsetFor(imgSrc) + '" sizes="(max-width: 768px) 100vw, 530px"><img src="' + imgSrc + '" srcset="' + srcsetFor(imgSrc) + '" sizes="(max-width: 768px) 100vw, 530px" alt="' + alt + '" loading="' + loading + '"' + fetchPri + '></picture></div>'
      : '          <div class="card-image-placeholder">Photos coming soon</div>';

    var brandLine = item.comingSoon
      ? '            <div class="card-meta"><div class="card-brand">' + escapeHtml(item.brand) + '</div><span class="coming-soon-badge">Coming Soon</span></div>'
      : '            <div class="card-brand">' + escapeHtml(item.brand) + '</div>';

    var titleLine = item.comingSoon
      ? '            <div class="card-title">' + escapeHtml(item.title) + '</div>'
      : '            <div class="card-title"><a class="card-title-link" href="' + listingUrl + '">' + escapeHtml(item.title) + '</a></div>';

    var priceCta = item.comingSoon
      ? '            <div class="card-price card-price--muted">Listing coming soon</div>'
      : '            <div class="card-price">' + formatPrice(item.price) + ' <span class="card-price-currency">CAD</span></div>';

    lines.push(
      '        <div class="card">',
      imgHtml,
      '          <div class="card-body">',
      brandLine,
      titleLine,
      '            <div class="card-specs">' + specs + '</div>',
      priceCta,
      '          </div>',
      '        </div>'
    );
  });

  return lines.join('\n') + '\n      ';
}

function generateSoldHTML(items) {
  if (items.length === 0) return '';

  var lines = ['        <!-- Static fallback for crawlers; JS replaces this on load -->'];

  items.forEach(function(item) {
    var imgSrc   = (item.images && item.images.length > 0) ? item.images[0] : '';
    var alt      = escapeHtml(item.brand + ' ' + item.title);
    var descLine = item.description
      ? '\n            <div class="card-description">' + escapeHtml(item.description) + '</div>'
      : '';

    lines.push(
      '        <div class="card sold">',
      '          <div class="card-image-placeholder"><picture><source type="image/avif" srcset="' + avifSrcsetFor(imgSrc) + '" sizes="(max-width: 768px) 100vw, 530px"><source type="image/webp" srcset="' + webpSrcsetFor(imgSrc) + '" sizes="(max-width: 768px) 100vw, 530px"><img src="' + imgSrc + '" srcset="' + srcsetFor(imgSrc) + '" sizes="(max-width: 768px) 100vw, 530px" alt="' + alt + '" loading="lazy"></picture></div>',
      '          <div class="card-body">',
      '            <div class="card-meta"><div class="card-brand">' + escapeHtml(item.brand) + '</div><span class="sold-badge">Sold</span></div>',
      '            <div class="card-title">' + escapeHtml(item.title) + '</div>' + descLine,
      '          </div>',
      '        </div>'
    );
  });

  return lines.join('\n') + '\n      ';
}

// ── FAQ generation (single source of truth) ──────────────
//  Each FAQ entry in config/faqs.js produces BOTH visible markup and
//  the JSON-LD FAQPage schema; build.js writes them between marker
//  comments so they cannot drift. Markdown-style [text](url) inside
//  answers becomes an <a> in visible markup and is flattened to
//  plain text in the schema.

function renderFaqVisible(items, indent) {
  indent = indent || '          ';
  return items.map(function(qa) {
    var answerHtml = escapeHtml(qa.answer).replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      function(_, label, href) { return '<a href="' + href + '">' + label + '</a>'; }
    );
    return indent + '<div class="faq-item">\n' +
           indent + '  <h3 class="faq-question">' + escapeHtml(qa.question) + '</h3>\n' +
           indent + '  <p class="faq-answer">' + answerHtml + '</p>\n' +
           indent + '</div>';
  }).join('\n');
}

function renderFaqSchema(items) {
  var schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(function(qa) {
      var schemaAnswer = qa.schemaAnswer != null
        ? qa.schemaAnswer
        : qa.answer.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1'); // flatten markdown links
      return {
        '@type': 'Question',
        name: qa.schemaQuestion || qa.question,
        acceptedAnswer: { '@type': 'Answer', text: schemaAnswer },
      };
    }),
  };
  return JSON.stringify(schema, null, 2).replace(/\n/g, '\n  ');
}

// Replace content between FAQ markers on a single page. Quietly no-ops on
// pages without the markers, so partial adoption is safe.
function injectFaqs(html, id) {
  var items = faqs[id];
  if (!items || items.length === 0) return html;

  // Visible block
  var visibleStart = '<!-- FAQ_VISIBLE_START id="' + id + '" -->';
  var visibleEnd   = '<!-- FAQ_VISIBLE_END -->';
  var vs = html.indexOf(visibleStart);
  var ve = html.indexOf(visibleEnd, vs);
  if (vs !== -1 && ve !== -1) {
    html = html.substring(0, vs + visibleStart.length) +
           '\n' + renderFaqVisible(items) + '\n          ' +
           html.substring(ve);
  }

  // Schema block
  var schemaStart = '<!-- FAQ_SCHEMA_START id="' + id + '" -->';
  var schemaEnd   = '<!-- FAQ_SCHEMA_END -->';
  var ss = html.indexOf(schemaStart);
  var se = html.indexOf(schemaEnd, ss);
  if (ss !== -1 && se !== -1) {
    html = html.substring(0, ss + schemaStart.length) +
           '\n  <script type="application/ld+json">\n  ' +
           renderFaqSchema(items) +
           '\n  </script>\n  ' +
           html.substring(se);
  }

  return html;
}

function generateReviewsHTML(reviews, aggregate) {
  var lines = ['        <!-- Static fallback for crawlers; JS replaces this on load -->'];

  // Aggregate bar
  var aggStars = '';
  for (var i = 1; i <= 5; i++) {
    aggStars += '<span class="review-star' + (i <= Math.round(aggregate.ratingValue) ? ' filled' : '') + '">&#9733;</span>';
  }

  lines.push(
    '        <div class="reviews-inner">',
    '          <div class="reviews-aggregate">',
    '            <div class="reviews-aggregate-score">' + aggregate.ratingValue.toFixed(1) + '</div>',
    '            <div class="reviews-aggregate-detail">',
    '              <div class="reviews-stars">' + aggStars + '</div>',
    '              <div class="reviews-aggregate-meta">' + aggregate.totalCount + ' ratings</div>',
    '            </div>',
    '          </div>',
    '          <div class="reviews-grid">'
  );

  reviews.forEach(function(review) {
    var stars   = '';
    for (var i = 1; i <= 5; i++) {
      stars += '<span class="review-star' + (i <= review.rating ? ' filled' : '') + '">&#9733;</span>';
    }
    var initial = review.name.charAt(0).toUpperCase();

    lines.push(
      '            <div class="review-card">',
      '              <div class="review-card-header">',
      '                <div class="review-avatar">' + initial + '</div>',
      '                <div class="review-header-info">',
      '                  <div class="review-author">' + escapeHtml(review.name) + '</div>',
      '                  <div class="review-card-stars">' + stars + '</div>',
      '                </div>',
      '              </div>',
      '              <p class="review-text">&ldquo;' + escapeHtml(review.text) + '&rdquo;</p>',
      '            </div>'
    );
  });

  lines.push(
    '          </div>',
    '        </div>'
  );

  return lines.join('\n') + '\n      ';
}


// ── Product schema (static, for index.html <head>) ───────

function generateProductSchemas(items) {
  var BASE_URL       = 'https://edmontonrefreshed.com/';
  var validUntilDate = new Date();
  validUntilDate.setDate(validUntilDate.getDate() + 90);
  var priceValidUntil = validUntilDate.toISOString().split('T')[0];

  var blocks = [];

  items.forEach(function(item) {
    if (item.comingSoon) return;

    var slug       = item.slug || slugify(item.brand + '-' + item.title);
    var listingUrl = BASE_URL + 'listings/' + slug + '/';
    var imageUrl   = (item.images && item.images.length > 0)
      ? BASE_URL + item.images[0]
      : null;

    // Extract SKU from image folder name (e.g., "images/BB-030/..." → "BB-030")
    var sku = (item.images && item.images.length > 0)
      ? item.images[0].split('/')[1]
      : null;

    var schema = {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": item.brand + ' ' + item.title,
      "description": item.description,
      "brand": { "@type": "Brand", "name": item.brand },
      "itemCondition": "https://schema.org/UsedCondition",
      "offers": {
        "@type": "Offer",
        "priceCurrency": "CAD",
        "price": item.price,
        "priceValidUntil": priceValidUntil,
        "availability": "https://schema.org/InStock",
        "url": listingUrl,
        "eligibleRegion": { "@type": "Country", "name": "CA" },
        "areaServed": { "@type": "Country", "name": "CA" },
        "hasMerchantReturnPolicy": {
          "@type": "MerchantReturnPolicy",
          "applicableCountry": "CA",
          "returnPolicyCategory": "https://schema.org/MerchantReturnNotPermitted"
        },
        "shippingDetails": {
          "@type": "OfferShippingDetails",
          "shippingRate": {
            "@type": "MonetaryAmount",
            "value": 200,
            "currency": "CAD"
          },
          "shippingDestination": {
            "@type": "DefinedRegion",
            "addressCountry": "CA",
            "addressRegion": "AB"
          },
          "deliveryTime": {
            "@type": "ShippingDeliveryTime",
            "handlingTime": {
              "@type": "QuantitativeValue",
              "minValue": 0,
              "maxValue": 3,
              "unitCode": "DAY"
            },
            "transitTime": {
              "@type": "QuantitativeValue",
              "minValue": 1,
              "maxValue": 7,
              "unitCode": "DAY"
            }
          }
        }
      }
    };

    if (sku) schema["sku"] = sku;
    if (imageUrl) schema["image"] = imageUrl;

    blocks.push(
      '  <script type="application/ld+json">\n' +
      '  ' + JSON.stringify(schema, null, 2).replace(/\n/g, '\n  ') + '\n' +
      '  </script>'
    );
  });

  return blocks.join('\n');
}


// ── Listing page generator ────────────────────────────────

function buildCarouselHTML(images, alt, prefix) {
  var count = images.length;
  var single = count <= 1 ? ' single' : '';

  var imgs = images.map(function(src, i) {
    var absSrc = prefix + src;
    var loadAttr = i === 0 ? 'eager' : 'lazy';
    var fetchPri = i === 0 ? ' fetchpriority="high"' : '';
    return '<picture><source type="image/avif" srcset="' + avifSrcsetFor(src, prefix) + '" sizes="(max-width: 768px) 100vw, 550px"><source type="image/webp" srcset="' + webpSrcsetFor(src, prefix) + '" sizes="(max-width: 768px) 100vw, 550px"><img src="' + absSrc + '" srcset="' + srcsetFor(src, prefix) + '" sizes="(max-width: 768px) 100vw, 550px" alt="' + escapeHtml(alt) + ' &mdash; photo ' + (i + 1) + '" loading="' + loadAttr + '"' + fetchPri + ' draggable="false"></picture>';
  }).join('');

  var dots = images.map(function(_, i) {
    return '<button class="dot' + (i === 0 ? ' active' : '') + '" data-index="' + i + '" aria-label="Photo ' + (i + 1) + '"></button>';
  }).join('');

  return '<div class="carousel' + single + '" id="carousel-0" data-index="0" data-count="' + count + '">' +
    '<div class="carousel-track">' + imgs + '</div>' +
    '<button class="carousel-btn prev" aria-label="Previous photo"><svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg></button>' +
    '<button class="carousel-btn next" aria-label="Next photo"><svg viewBox="0 0 24 24"><polyline points="9 6 15 12 9 18"/></svg></button>' +
    '<div class="carousel-counter">1 / ' + count + '</div>' +
    '<div class="carousel-dots">' + dots + '</div>' +
    '</div>';
}

function buildThumbnailStrip(images, alt, prefix) {
  if (!images || images.length <= 1) return '';
  var maxVisible = 7;
  var thumbs = images.slice(0, maxVisible).map(function(src, i) {
    var absSrc = prefix + src.replace(/\.jpeg$/, '') + '-400w.jpeg';
    return '<button class="listing-thumb' + (i === 0 ? ' active' : '') + '" data-index="' + i + '">' +
      '<img src="' + absSrc + '" alt="' + escapeHtml(alt) + ' — thumbnail ' + (i + 1) + '" loading="lazy">' +
    '</button>';
  }).join('');
  var overflow = '';
  if (images.length > maxVisible) {
    overflow = '<button class="listing-thumb listing-thumb-more" data-index="' + maxVisible + '">+' + (images.length - maxVisible) + '</button>';
  }
  return '<div class="listing-thumbnails">' + thumbs + overflow + '</div>';
}

function generateListingPage(item, slug, allItems, soldItems, assetVersions) {
  assetVersions = assetVersions || {};
  var cssV    = assetVersions['css/styles.min.css'] || '';
  var sharedV = assetVersions['js/shared.min.js']   || '';
  var BASE_URL       = 'https://edmontonrefreshed.com/';
  var listingUrl     = BASE_URL + 'listings/' + slug + '/';
  var validUntilDate = new Date();
  validUntilDate.setDate(validUntilDate.getDate() + 90);
  var priceValidUntil = validUntilDate.toISOString().split('T')[0];
  var imageUrl        = (item.images && item.images.length > 0)
    ? BASE_URL + item.images[0]
    : BASE_URL + 'images/og-preview.png';

  // Extract SKU from image folder name (e.g., "images/BB-030/..." → "BB-030")
  var listingSku = (item.images && item.images.length > 0)
    ? item.images[0].split('/')[1]
    : null;

  var offers = {
    "@type": "Offer",
    "priceCurrency": "CAD",
    "price": item.price,
    "priceValidUntil": priceValidUntil,
    "availability": "https://schema.org/InStock",
    "url": listingUrl,
    "eligibleRegion": { "@type": "Country", "name": "CA" },
    "areaServed": { "@type": "Country", "name": "CA" },
    "hasMerchantReturnPolicy": {
      "@type": "MerchantReturnPolicy",
      "applicableCountry": "CA",
      "returnPolicyCategory": "https://schema.org/MerchantReturnNotPermitted"
    },
    "shippingDetails": {
      "@type": "OfferShippingDetails",
      "shippingRate": {
        "@type": "MonetaryAmount",
        "value": 200,
        "currency": "CAD"
      },
      "shippingDestination": {
        "@type": "DefinedRegion",
        "addressCountry": "CA",
        "addressRegion": "AB"
      },
      "deliveryTime": {
        "@type": "ShippingDeliveryTime",
        "handlingTime": {
          "@type": "QuantitativeValue",
          "minValue": 0,
          "maxValue": 3,
          "unitCode": "DAY"
        },
        "transitTime": {
          "@type": "QuantitativeValue",
          "minValue": 1,
          "maxValue": 7,
          "unitCode": "DAY"
        }
      }
    }
  };
  if (item.availabilityStarts) offers["availabilityStarts"] = item.availabilityStarts;

  var productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": item.brand + ' ' + item.title,
    "description": item.description,
    "brand": { "@type": "Brand", "name": item.brand },
    "image": imageUrl,
    "itemCondition": "https://schema.org/UsedCondition",
    "dateModified": today(),
    "offers": offers
  };

  // Physical dimensions as QuantitativeValue (Schema.org Product width/depth/height)
  if (item.dimensions) {
    if (item.dimensions.width)  productSchema["width"]  = { "@type": "QuantitativeValue", "value": String(item.dimensions.width),  "unitCode": "INH" };
    if (item.dimensions.depth)  productSchema["depth"]  = { "@type": "QuantitativeValue", "value": String(item.dimensions.depth),  "unitCode": "INH" };
    if (item.dimensions.height) productSchema["height"] = { "@type": "QuantitativeValue", "value": String(item.dimensions.height), "unitCode": "INH" };
  }

  if (listingSku) productSchema["sku"] = listingSku;

  var breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
      { "@type": "ListItem", "position": 2, "name": "Available", "item": BASE_URL },
      { "@type": "ListItem", "position": 3, "name": item.brand + ' ' + item.title, "item": listingUrl }
    ]
  };

  // FAQ schema — emitted from optional item.faq array
  var faqSchemaBlock = '';
  var faqVisibleBlock = '';
  if (item.faq && item.faq.length > 0) {
    var faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": item.faq.map(function(qa) {
        return {
          "@type": "Question",
          "name": qa.question,
          "acceptedAnswer": { "@type": "Answer", "text": qa.answer }
        };
      })
    };
    faqSchemaBlock =
      '\n  <!-- FAQPage Schema -->\n' +
      '  <script type="application/ld+json">\n' +
      '  ' + JSON.stringify(faqSchema, null, 2).replace(/\n/g, '\n  ') + '\n' +
      '  </script>';

    faqVisibleBlock =
      '\n      <section class="faq-section listing-faq" aria-labelledby="listing-faq-heading">\n' +
      '        <h2 class="section-label" id="listing-faq-heading">Frequently Asked Questions</h2>\n' +
      '        <div class="faq-list">\n' +
      item.faq.map(function(qa) {
        return '          <div class="faq-item">\n' +
               '            <h3 class="faq-question">' + escapeHtml(qa.question) + '</h3>\n' +
               '            <p class="faq-answer">' + escapeHtml(qa.answer) + '</p>\n' +
               '          </div>';
      }).join('\n') +
      '\n        </div>\n' +
      '      </section>\n';
  }

  // LocalBusiness + Organization schemas — sitewide on every listing
  var localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "FurnitureStore",
    "@id": BASE_URL + "#business",
    "name": "Edmonton Refreshed Seating",
    "url": BASE_URL,
    "telephone": "+1-780-965-1477",
    "image": BASE_URL + "favicon.svg",
    "logo": BASE_URL + "favicon.svg",
    "priceRange": "$$-$$$",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Edmonton",
      "addressRegion": "AB",
      "addressCountry": "CA"
    },
    "areaServed": [
      { "@type": "City", "name": "Edmonton" },
      { "@type": "AdministrativeArea", "name": "Alberta" }
    ],
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
        "opens": "09:00",
        "closes": "20:00"
      }
    ],
    "sameAs": site.sameAs
  };

  var organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": BASE_URL + "#organization",
    "name": "Edmonton Refreshed Seating",
    "url": BASE_URL,
    "logo": BASE_URL + "favicon.svg",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+1-780-965-1477",
      "contactType": "customer service",
      "areaServed": "CA",
      "availableLanguage": "English"
    },
    "sameAs": site.sameAs
  };

  // Image prefix: listing page is at /listings/[slug]/, images are at root /images/
  var imgPrefix = '../../';
  var carouselHTML = (item.images && item.images.length > 0)
    ? buildCarouselHTML(item.images, item.brand + ' ' + item.title, imgPrefix)
    : '<div class="card-image-placeholder">Photos coming soon</div>';

  var specsHTML = item.specs.map(function(s) {
    return '<span class="spec-tag">' + escapeHtml(s) + '</span>';
  }).join('');

  // Description collapsible section (open by default)
  var brandGuideHTML = '';
  var brandGuideMap = {
    'Natuzzi': { slug: 'natuzzi-sofa-review-edmonton', label: 'Read our full Natuzzi buyer&rsquo;s guide for Edmonton' },
    'Natuzzi Editions': { slug: 'natuzzi-sofa-review-edmonton', label: 'Read our full Natuzzi buyer&rsquo;s guide for Edmonton' },
    'Natuzzi Italia': { slug: 'natuzzi-sofa-review-edmonton', label: 'Read our full Natuzzi buyer&rsquo;s guide for Edmonton' },
    'B&B Italia': { slug: 'bb-italia-sofa-review-edmonton', label: 'Read our full B&amp;B Italia buyer&rsquo;s guide for Edmonton' },
    'Rove Concepts': { slug: 'rove-concepts-sofa-review-edmonton', label: 'Read our full Rove Concepts buyer&rsquo;s guide for Edmonton' }
  };
  if (brandGuideMap[item.brand]) {
    var bg = brandGuideMap[item.brand];
    brandGuideHTML = '<p class="listing-brand-guide-link"><a href="/guides/' + bg.slug + '/">' + bg.label + ' &rarr;</a></p>';
  }
  var descriptionHTML = '<details class="listing-collapsible" open><summary class="listing-meta-label">Description</summary><p class="listing-description">' + escapeHtml(item.description) + '</p>' + brandGuideHTML + '</details>';

  // Optional features list (construction specs etc.)
  var featuresHTML = '';
  if (item.features && item.features.length > 0) {
    featuresHTML = '<details class="listing-collapsible"><summary class="listing-meta-label">Features</summary><ul class="listing-features">' +
      item.features.map(function(f) { return '<li>' + escapeHtml(f) + '</li>'; }).join('') +
      '</ul></details>';
  }

  // Optional condition section
  var conditionHTML = '';
  if (item.condition) {
    conditionHTML = '<details class="listing-collapsible"><summary class="listing-meta-label">Condition</summary><p class="listing-meta-text">' + escapeHtml(item.condition) + '</p></details>';
  }

  // Optional configuration / includes section
  var configHTML = '';
  if (item.configuration) {
    configHTML = '<details class="listing-collapsible"><summary class="listing-meta-label">Includes</summary><p class="listing-meta-text">' + escapeHtml(item.configuration) + '</p></details>';
  }

  // Retail value pill — two-part badge generated from numeric retailEstimate +
  // price. The "+" suffix is added when retailEstimateApprox is true.
  var retailHTML = '';
  if (item.retailEstimate) {
    var retailLabel = formatPrice(item.retailEstimate) + (item.retailEstimateApprox ? '+' : '');
    retailHTML = '<div class="listing-value-pill">' +
      '<span class="pill-retail">Est. Retail: ' + retailLabel + ' CAD</span>' +
      '<span class="pill-now">Buy it Today: ' + formatPrice(item.price) + ' CAD</span>' +
    '</div>';
  }

  // Strip variant spec (anything after em-dash) from title for concise SEO title
  var cleanTitle  = item.title.split(/\s+[—–-]\s+/)[0];
  // Title: use item.metaTitle if provided, otherwise auto-generate
  var titleTag;
  if (item.metaTitle) {
    titleTag = escapeHtml(item.metaTitle);
  } else {
    titleTag = escapeHtml(item.brand) + ' ' + escapeHtml(cleanTitle) + ' — Edmonton';
  }
  // Meta description: use item.metaDescription if provided, otherwise auto-generate
  var rawDesc;
  if (item.metaDescription) {
    rawDesc = item.metaDescription;
  } else {
    var condSpec    = (item.specs || []).filter(function(s) { return /condition/i.test(s); })[0];
    var condition   = condSpec || ((item.specs && item.specs.length > 0) ? item.specs[item.specs.length - 1] : '');
    var firstSentence = item.description.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim().split(/\.(?:\s|$)/)[0];
    rawDesc = 'Pre-owned ' + item.brand + ' ' + cleanTitle + ' in Edmonton — ' + formatPrice(item.price) + '. Inspected, cleaned, delivery available. ' + firstSentence + '.';
    if (rawDesc.length > 155) {
      rawDesc = rawDesc.substring(0, 152).replace(/\s+\S*$/, '') + '…';
    }
  }
  var metaDesc    = escapeHtml(rawDesc);
  var ogImageUrl  = imageUrl;

  // Trust statement — sitewide on every listing
  var trustStatementHTML =
    '<p class="listing-trust"><svg class="listing-trust-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2 4 5v6c0 5 3.5 9.5 8 11 4.5-1.5 8-6 8-11V5l-8-3z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><polyline points="9 12 11 14 15 10" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg><span>All designer pieces are inspected for construction, materials, and manufacturer consistency before listing.</span></p>';

  // Sell-line target — point the "have one like this?" prompt at the most
  // relevant sell-landing page. Brand match wins; otherwise derive piece type
  // (plus leather variant) from title/specs. Falls back to /sell/.
  // Mirrors the brandGuideMap pattern above so adding a new brand sell page
  // is a one-line change here.
  var brandSellMap = {
    'Natuzzi':              { href: '/sell/natuzzi-edmonton/',              anchor: 'sell your Natuzzi piece' },
    'Natuzzi Editions':     { href: '/sell/natuzzi-edmonton/',              anchor: 'sell your Natuzzi piece' },
    'Natuzzi Italia':       { href: '/sell/natuzzi-edmonton/',              anchor: 'sell your Natuzzi piece' },
    'Rove Concepts':        { href: '/sell/rove-concepts-edmonton/',        anchor: 'sell your Rove Concepts piece' },
    'EQ3':                  { href: '/sell/eq3-edmonton/',                  anchor: 'sell your EQ3 piece' },
    'Crate & Barrel':       { href: '/sell/crate-and-barrel-edmonton/',     anchor: 'sell your Crate &amp; Barrel piece' },
    'Restoration Hardware': { href: '/sell/restoration-hardware-edmonton/', anchor: 'sell your Restoration Hardware piece' },
    'West Elm':             { href: '/sell/west-elm-edmonton/',             anchor: 'sell your West Elm piece' }
  };
  var sellLineTarget;
  if (brandSellMap[item.brand]) {
    sellLineTarget = brandSellMap[item.brand];
  } else {
    var titleText = (item.title || '') + ' ' + (item.specs || []).join(' ');
    var t = titleText.toLowerCase();
    var hasLeather = /leather|nubuck|aniline|top-grain|full-grain/.test(t);
    if (/sectional/.test(t)) {
      sellLineTarget = hasLeather
        ? { href: '/sell/leather-sectional-edmonton/', anchor: 'sell your leather sectional' }
        : { href: '/sell/sectional-edmonton/',         anchor: 'sell your sectional' };
    } else if (/sofa/.test(t)) {
      sellLineTarget = hasLeather
        ? { href: '/sell/leather-sofa-edmonton/', anchor: 'sell your leather sofa' }
        : { href: '/sell/sofa-edmonton/',         anchor: 'sell your sofa' };
    } else if (/couch|loveseat/.test(t)) {
      sellLineTarget = hasLeather
        ? { href: '/sell/leather-couch-edmonton/', anchor: 'sell your leather couch' }
        : { href: '/sell/couch-edmonton/',         anchor: 'sell your couch' };
    } else {
      sellLineTarget = { href: '/sell/', anchor: 'sell your piece' };
    }
  }
  var sellLineHTML = '<p class="listing-sell-line">Have one like this? We&rsquo;d buy yours back &mdash; <a href="' + sellLineTarget.href + '">' + sellLineTarget.anchor + ' &rarr;</a></p>';

  // Related Pieces — only renders when real related inventory exists.
  // Real inventory = other live pieces OR sold pieces in the same brand family.
  // The brand guide is an optional supplemental card; it doesn't trigger the section on its own
  // (it already appears inside the Description collapsible via brandGuideMap).
  var relatedHTML = '';
  if (allItems && allItems.length > 0) {
    var brandKey = (item.brand || '').toLowerCase();
    var otherLive = allItems.filter(function(i) {
      if (i.comingSoon) return false;
      var iSlug = i.slug || slugify(i.brand + '-' + i.title);
      return iSlug !== slug;
    }).slice(0, 3);

    var brandFamily = brandKey.split(' ')[0];
    var soldSameBrand = (soldItems || []).filter(function(s) {
      return (s.brand || '').toLowerCase().indexOf(brandFamily) !== -1;
    }).slice(0, 2);

    var hasRealInventory = otherLive.length > 0 || soldSameBrand.length > 0;

    if (hasRealInventory) {
      var brandGuideEntry = brandGuideMap[item.brand];
      var relatedCards = [];

      otherLive.forEach(function(i) {
        var iSlug = i.slug || slugify(i.brand + '-' + i.title);
        relatedCards.push(
          '<a class="listing-related-card" href="/listings/' + iSlug + '/">' +
            '<p class="listing-related-eyebrow">Also Available</p>' +
            '<p class="listing-related-title">' + escapeHtml(i.brand + ' ' + i.title.split(/\s+[—–-]\s+/)[0]) + '</p>' +
          '</a>'
        );
      });
      soldSameBrand.forEach(function(s) {
        relatedCards.push(
          '<a class="listing-related-card" href="/sold/">' +
            '<p class="listing-related-eyebrow">Recently Sold</p>' +
            '<p class="listing-related-title">' + escapeHtml(s.brand + ' ' + s.title) + '</p>' +
          '</a>'
        );
      });
      if (brandGuideEntry) {
        relatedCards.push(
          '<a class="listing-related-card" href="/guides/' + brandGuideEntry.slug + '/">' +
            '<p class="listing-related-eyebrow">Buyer&rsquo;s Guide</p>' +
            '<p class="listing-related-title">' + brandGuideEntry.label + '</p>' +
          '</a>'
        );
      }

      relatedHTML =
        '\n      <section class="listing-related" aria-labelledby="listing-related-heading">\n' +
        '        <h2 class="section-label" id="listing-related-heading">Related Links</h2>\n' +
        '        <div class="listing-related-grid">\n          ' +
        relatedCards.join('\n          ') +
        '\n        </div>\n' +
        '      </section>\n';
    }
  }

  return '<!DOCTYPE html>\n' +
'<html lang="en-CA">\n' +
'<head>\n' +
'  <meta charset="UTF-8">\n' +
'  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
'\n' +
'  <!-- Google tag (gtag.js) — deferred until idle -->\n' +
'  <script>\n' +
'    window.dataLayer = window.dataLayer || [];\n' +
'    function gtag(){dataLayer.push(arguments);}\n' +
'    gtag(\'js\', new Date());\n' +
'    gtag(\'config\', \'G-8MN82PPZRZ\');\n' +
'    function _loadGA(){var s=document.createElement(\'script\');s.src=\'https://www.googletagmanager.com/gtag/js?id=G-8MN82PPZRZ\';s.async=true;document.head.appendChild(s)}\n' +
'    if(\'requestIdleCallback\' in window){requestIdleCallback(_loadGA)}else{addEventListener(\'load\',_loadGA)}\n' +
'  </script>\n' +
'\n' +
'  <title>' + titleTag + '</title>\n' +
'  <link rel="icon" type="image/svg+xml" href="../../favicon.svg">\n' +
'  <link rel="apple-touch-icon" href="../../apple-touch-icon.png">\n' +
'  <link rel="canonical" href="' + listingUrl + '">\n' +
'  <meta name="description" content="' + metaDesc + '">\n' +
'  <meta name="robots" content="index, follow">\n' +
'  <meta name="geo.region" content="CA-AB">\n' +
'  <meta name="geo.placename" content="Edmonton">\n' +
'\n' +
'  <!-- Open Graph -->\n' +
'  <meta property="og:locale" content="en_CA">\n' +
'  <meta property="og:type" content="product">\n' +
'  <meta property="og:url" content="' + listingUrl + '">\n' +
'  <meta property="og:title" content="' + titleTag + '">\n' +
'  <meta property="og:description" content="' + metaDesc + '">\n' +
'  <meta property="og:site_name" content="Edmonton Refreshed Seating">\n' +
'  <meta property="og:image" content="' + ogImageUrl + '">\n' +
'  <meta property="og:image:alt" content="' + escapeHtml(item.brand + ' ' + item.title) + ' — pre-owned furniture in Edmonton">\n' +
'\n' +
'  <!-- Twitter / X -->\n' +
'  <meta name="twitter:card" content="summary_large_image">\n' +
'  <meta name="twitter:title" content="' + titleTag + '">\n' +
'  <meta name="twitter:description" content="' + metaDesc + '">\n' +
'  <meta name="twitter:image" content="' + ogImageUrl + '">\n' +
'  <meta name="twitter:image:alt" content="' + escapeHtml(item.brand + ' ' + item.title) + ' — pre-owned furniture in Edmonton">\n' +
'\n' +
'  <!-- Product Schema -->\n' +
'  <script type="application/ld+json">\n' +
'  ' + JSON.stringify(productSchema, null, 2).replace(/\n/g, '\n  ') + '\n' +
'  </script>\n' +
'\n' +
'  <!-- BreadcrumbList Schema -->\n' +
'  <script type="application/ld+json">\n' +
'  ' + JSON.stringify(breadcrumbSchema, null, 2).replace(/\n/g, '\n  ') + '\n' +
'  </script>\n' +
'\n' +
'  <!-- LocalBusiness Schema -->\n' +
'  <script type="application/ld+json">\n' +
'  ' + JSON.stringify(localBusinessSchema, null, 2).replace(/\n/g, '\n  ') + '\n' +
'  </script>\n' +
'\n' +
'  <!-- Organization Schema -->\n' +
'  <script type="application/ld+json">\n' +
'  ' + JSON.stringify(organizationSchema, null, 2).replace(/\n/g, '\n  ') + '\n' +
'  </script>' + faqSchemaBlock + '\n' +
'\n' +
'  <link rel="preconnect" href="https://fonts.googleapis.com">\n' +
'  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n' +
'  <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Playfair+Display:wght@400;500&display=swap" onload="this.onload=null;this.rel=\'stylesheet\'">\n' +
'  <noscript><link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Playfair+Display:wght@400;500&display=swap" rel="stylesheet"></noscript>\n' +
'  <link rel="preload" as="image" imagesrcset="' + (item.images && item.images.length > 0 ? avifSrcsetFor(item.images[0], '../../') : '') + '" imagesizes="(max-width: 768px) 100vw, 550px" fetchpriority="high" type="image/avif">\n' +
'  <link rel="stylesheet" href="../../css/styles.min.css?v=' + cssV + '">\n' +
'  <meta name="theme-color" content="#2c2c2c">\n' +
'</head>\n' +
'<body>\n' +
'\n' +
'  <a href="#main-content" class="skip-link">Skip to main content</a>\n' +
'\n' +
renderNav() + '\n' +
'\n' +
renderCredibility('listing') + '\n' +
'\n' +
'  <main id="main-content">\n' +
'    <div class="page">\n' +
'\n' +
'      <nav class="breadcrumb" aria-label="Breadcrumb">\n' +
'        <a href="/">Home</a>\n' +
'        <span class="breadcrumb-sep">/</span>\n' +
'        <a href="/">Available</a>\n' +
'        <span class="breadcrumb-sep">/</span>\n' +
'        <span class="breadcrumb-current">' + escapeHtml(item.brand + ' ' + item.title) + '</span>\n' +
'      </nav>\n' +
'\n' +
'      <div class="listing-hero">\n' +
'        <div class="listing-layout">\n' +
'          <div class="listing-carousel">\n' +
'            ' + carouselHTML + '\n' +
'            ' + buildThumbnailStrip(item.images || [], item.brand + ' ' + item.title, imgPrefix) + '\n' +
'          </div>\n' +
'          <div class="listing-body">\n' +
'            <div class="listing-brand">' + escapeHtml(item.brand) + '</div>\n' +
'            <div class="listing-heading-row">\n' +
'              <h1 class="listing-title">' + escapeHtml(item.title) + '</h1>\n' +
(retailHTML ? '              ' + retailHTML + '\n' : '') +
'            </div>\n' +
'            <div class="listing-price">' + formatPrice(item.price) + ' <span class="listing-price-currency">CAD</span></div>\n' +
'            <div class="listing-ctas">\n' +
'              <a class="listing-cta" href="sms:7809651477">Text to Secure &rarr;</a>\n' +
'              <a class="listing-cta listing-cta--secondary" href="tel:7809651477">Call 780-965-1477</a>\n' +
'            </div>\n' +
'            <div class="listing-specs">' + specsHTML + '</div>\n' +
'            ' + descriptionHTML + '\n' +
(featuresHTML    ? '            ' + featuresHTML    + '\n' : '') +
(conditionHTML   ? '            ' + conditionHTML   + '\n' : '') +
(configHTML      ? '            ' + configHTML      + '\n' : '') +
'            ' + trustStatementHTML + '\n' +
'            ' + sellLineHTML + '\n' +
'            <a class="listing-back" href="/">&larr; All Available Pieces</a>\n' +
'          </div>\n' +
'        </div>\n' +
'      </div>\n' +
faqVisibleBlock +
relatedHTML +
'\n' +
'      <div class="newsletter-embed">\n' +
'        <p class="newsletter-heading">Get first access before pieces sell. Enter your email to hear about new arrivals before the public.</p>\n' +
'        <form class="newsletter-form" action="https://app.kit.com/forms/9233085/subscriptions" method="post" data-sv-form="9233085" data-uid="47c0cc8b38">\n' +
'          <label for="newsletter-email" class="sr-only">Email address</label>\n' +
'          <input type="email" id="newsletter-email" name="email_address" placeholder="Your email address" autocomplete="email" required>\n' +
'          <button type="submit">Subscribe</button>\n' +
'        </form>\n' +
'        <p class="newsletter-success">Thanks! You&rsquo;re on the list.</p>\n' +
'      </div>\n' +
'\n' +
'    </div>\n' +
'  </main>\n' +
'\n' +
'  <!-- Sticky CTA bar (mobile only) -->\n' +
'  <div class="listing-sticky-cta">\n' +
'    <a href="sms:7809651477" class="sticky-cta-primary">Text to Secure &rarr; ' + formatPrice(item.price) + ' CAD</a>\n' +
'    <a href="tel:7809651477" class="sticky-cta-secondary">Call</a>\n' +
'  </div>\n' +
'\n' +
renderFooter() + '\n' +
'\n' +
'  <!-- ── Lightbox ── -->\n' +
'  <div class="lightbox" id="lightbox">\n' +
'    <button class="lightbox-close" aria-label="Close">&times;</button>\n' +
'    <button class="lightbox-nav prev" aria-label="Previous">\n' +
'      <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>\n' +
'    </button>\n' +
'    <img id="lightbox-img" src="" alt="' + escapeHtml(item.brand + ' ' + item.title) + ' photo">\n' +
'    <button class="lightbox-nav next" aria-label="Next">\n' +
'      <svg viewBox="0 0 24 24"><polyline points="9 6 15 12 9 18"/></svg>\n' +
'    </button>\n' +
'    <div class="lightbox-counter" id="lightbox-counter"></div>\n' +
'  </div>\n' +
'\n' +
'  <script src="../../js/shared.min.js?v=' + sharedV + '"></script>\n' +
'  <script>\n' +
'  (function() {\n' +
'    var thumbs = document.querySelectorAll(".listing-thumb:not(.listing-thumb-more)");\n' +
'    var moreBtn = document.querySelector(".listing-thumb-more");\n' +
'    var carousel = document.querySelector(".listing-carousel .carousel");\n' +
'    var maxVisible = thumbs.length;\n' +
'    if (!thumbs.length || !carousel) return;\n' +
'    function syncThumbs(idx) {\n' +
'      thumbs.forEach(function(t, i) { t.classList.toggle("active", i === idx); });\n' +
'      if (moreBtn) moreBtn.classList.toggle("active", idx >= maxVisible);\n' +
'    }\n' +
'    thumbs.forEach(function(thumb) {\n' +
'      thumb.addEventListener("click", function(e) {\n' +
'        e.stopPropagation();\n' +
'        var idx = parseInt(thumb.dataset.index);\n' +
'        goToSlide(carousel, idx);\n' +
'        syncThumbs(idx);\n' +
'      });\n' +
'    });\n' +
'    if (moreBtn) moreBtn.addEventListener("click", function(e) {\n' +
'      e.stopPropagation();\n' +
'      var idx = parseInt(moreBtn.dataset.index);\n' +
'      goToSlide(carousel, idx);\n' +
'      syncThumbs(idx);\n' +
'    });\n' +
'    var origGoToSlide = goToSlide;\n' +
'    goToSlide = function(c, idx) {\n' +
'      origGoToSlide(c, idx);\n' +
'      if (c === carousel) syncThumbs(parseInt(c.dataset.index));\n' +
'    };\n' +
'  })();\n' +
'  </script>\n' +
'\n' +
'</body>\n' +
'</html>\n';
}


// ── HTML injection ───────────────────────────────────────
//  Replaces the inner HTML of a container identified by id,
//  using div-depth counting to find the matching </div>.

function injectIntoContainer(html, containerId, newInner) {
  var re = new RegExp('(<[^>]*\\bid="' + containerId + '"[^>]*>)');
  var match = re.exec(html);
  if (!match) throw new Error('Container #' + containerId + ' not found');

  var openEnd = match.index + match[0].length;
  var depth = 1;
  var i = openEnd;

  while (i < html.length && depth > 0) {
    var nextOpen  = html.indexOf('<div', i);
    var nextClose = html.indexOf('</div>', i);

    if (nextClose === -1) throw new Error('Unmatched div for #' + containerId);

    if (nextOpen !== -1 && nextOpen < nextClose) {
      var after = html[nextOpen + 4];
      if (after === ' ' || after === '>' || after === '\n' || after === '\r' || after === '\t') {
        depth++;
      }
      i = nextOpen + 5;
    } else {
      depth--;
      if (depth === 0) {
        return html.substring(0, openEnd) + '\n' + newInner + '</div>' + html.substring(nextClose + 6);
      }
      i = nextClose + 6;
    }
  }

  throw new Error('Could not find closing tag for #' + containerId);
}

// Replaces content between two comment markers in the <head>
function injectBetweenMarkers(html, startMarker, endMarker, newContent) {
  var startIdx = html.indexOf(startMarker);
  var endIdx   = html.indexOf(endMarker);
  if (startIdx === -1 || endIdx === -1) throw new Error('Markers not found: ' + startMarker);
  return html.substring(0, startIdx + startMarker.length) +
    '\n' + newContent + '\n  ' +
    html.substring(endIdx);
}

// Partial-injection: replaces content between named markers, parsing any
// attributes on the start marker so render() can vary by context.
//
// Marker form:
//   <!-- NAME_START [attr="value" ...] -->
//   ...replaced content...
//   <!-- NAME_END -->
//
// Files without the markers are left untouched.
function injectPartial(html, name, render) {
  var re = new RegExp(
    '(<!--\\s*' + name + '_START(?:\\s+([^>-]*?))?\\s*-->)[\\s\\S]*?(<!--\\s*' + name + '_END\\s*-->)',
    'g'
  );
  return html.replace(re, function (_match, openTag, attrs, closeTag) {
    var attrMap = {};
    if (attrs) {
      var attrRe = /(\w+)\s*=\s*"([^"]*)"/g;
      var m;
      while ((m = attrRe.exec(attrs)) !== null) attrMap[m[1]] = m[2];
    }
    return openTag + '\n' + render(attrMap) + '\n  ' + closeTag;
  });
}

function injectAllPartials(html) {
  html = injectPartial(html, 'NAV',         function ()      { return renderNav(); });
  html = injectPartial(html, 'CREDIBILITY', function (attrs) { return renderCredibility(attrs.variant || 'buyer'); });
  html = injectPartial(html, 'FOOTER',      function ()      { return renderFooter(); });
  return html;
}

// Recursively collect all HTML files under `dir`, skipping vendor/build dirs.
function walkHtml(dir, files) {
  files = files || [];
  var entries = fs.readdirSync(dir, { withFileTypes: true });
  for (var i = 0; i < entries.length; i++) {
    var e = entries[i];
    if (e.name.charAt(0) === '.') continue;
    if (e.name === 'node_modules' || e.name === 'worker') continue;
    var full = path.join(dir, e.name);
    if (e.isDirectory()) walkHtml(full, files);
    else if (e.name.length > 5 && e.name.slice(-5) === '.html') files.push(full);
  }
  return files;
}


// ── Sitemap generator ────────────────────────────────────
//  <lastmod> only advances when the page's canonical content actually
//  changes. We canonicalize each rendered HTML file (stripping asset
//  version hashes, dateModified placeholders, and other build-time noise),
//  hash it, and compare to a sidecar state file. Pure builds with no
//  content change leave every <lastmod> stable — so freshness signals are
//  meaningful, not just timestamps.

var BASE_URL = 'https://edmontonrefreshed.com/';
var STATE_PATH = path.join(ROOT, '.build-state.json');

// Strip build-volatile bits so the same content hashes identically across
// successive builds. Anything that changes purely as a result of running
// the build (asset version hashes, today's dateModified, the 90-day
// priceValidUntil window) is normalized away.
function canonicalizeForHash(text) {
  return text
    .replace(/\?v=[A-Za-z0-9._-]+/g, '?v=')
    .replace(/<lastmod>[^<]+<\/lastmod>/g, '<lastmod/>')
    .replace(/"dateModified"\s*:\s*"[^"]+"/g, '"dateModified":""')
    .replace(/"priceValidUntil"\s*:\s*"[^"]+"/g, '"priceValidUntil":""');
}

function loadState() {
  if (!fs.existsSync(STATE_PATH)) return {};
  try { return JSON.parse(fs.readFileSync(STATE_PATH, 'utf8')); }
  catch (_) { return {}; }
}

function saveState(state) {
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2) + '\n', 'utf8');
}

// Resolve the file backing a given URL ("/" → index.html, "/sold/" → sold/index.html).
function fileForUrl(loc) {
  var rel = loc.replace(BASE_URL, '');
  var file = rel.length === 0 ? 'index.html' : rel + 'index.html';
  return path.join(ROOT, file);
}

// Collect every directory under guides/ that holds an index.html.
function discoverGuides() {
  var dir = path.join(ROOT, 'guides');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter(function(e) { return e.isDirectory() && fs.existsSync(path.join(dir, e.name, 'index.html')); })
    .map(function(e) { return BASE_URL + 'guides/' + e.name + '/'; })
    .sort();
}

// Normalize an image path from data files to an absolute, URL-encoded URL.
// available-data.js uses root-relative paths ("images/XX-NNN/foo.jpeg");
// sold-data.js uses "../images/Sold Inventory/..." (relative to /sold/).
// Strip any leading ../ and / segments, URL-encode (literal spaces become %20),
// then prefix BASE_URL.
function imagePathToUrl(p) {
  var rel = p.replace(/^(?:\.\.\/)+/, '').replace(/^\/+/, '');
  return BASE_URL + encodeURI(rel);
}

// Build the /sold/ gallery ItemList JSON-LD — one ImageObject per sold photo
// across every entry in sold-data.js. Each ImageObject carries authorship
// (creator/copyrightHolder = Edmonton Refreshed), licence pointers so the
// photo is eligible for Google Images' Licensable badge, and a brand entity
// link via about. The image sitemap covers discovery; this layer covers
// attribution.
function generateSoldGallerySchema(soldItems) {
  var ORG = { '@type': 'Organization', name: 'Edmonton Refreshed' };
  var elements = [];
  var position = 0;
  soldItems.forEach(function(item) {
    var photos = item.images || [];
    photos.forEach(function(rel, idx) {
      position++;
      var contentUrl   = imagePathToUrl(rel);
      var thumbnailUrl = contentUrl.replace(/\.jpeg$/i, '-400w.jpeg');
      var label = photos.length > 1
        ? item.brand + ' ' + item.title + ' — photo ' + (idx + 1) + ' of ' + photos.length
        : item.brand + ' ' + item.title;
      elements.push({
        '@type': 'ListItem',
        position: position,
        item: {
          '@type': 'ImageObject',
          name: label,
          description: 'Pre-owned ' + item.brand + ' ' + item.title + ', purchased and resold by Edmonton Refreshed.',
          contentUrl: contentUrl,
          thumbnailUrl: thumbnailUrl,
          about: { '@type': 'Brand', name: item.brand },
          creator: ORG,
          copyrightHolder: ORG,
          creditText: 'Photo by Edmonton Refreshed',
          license: BASE_URL,
          acquireLicensePage: BASE_URL,
        },
      });
    });
  });
  var schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Previously Sold Pieces in Edmonton',
    description: 'Photos of pre-owned sofas and sectionals previously purchased and resold by Edmonton Refreshed in Edmonton, AB.',
    url: BASE_URL + 'sold/',
    numberOfItems: position,
    itemListOrder: 'https://schema.org/ItemListOrderDescending',
    itemListElement: elements,
  };
  return JSON.stringify(schema, null, 2).replace(/\n/g, '\n  ');
}

// Inject the gallery schema between SOLD_GALLERY_SCHEMA_START / _END markers.
// No-op when the markers are absent so partial adoption stays safe.
function injectSoldGallerySchema(html, soldItems) {
  var startMarker = '<!-- SOLD_GALLERY_SCHEMA_START -->';
  var endMarker   = '<!-- SOLD_GALLERY_SCHEMA_END -->';
  var ss = html.indexOf(startMarker);
  if (ss === -1) return html;
  var se = html.indexOf(endMarker, ss);
  if (se === -1) return html;
  return html.substring(0, ss + startMarker.length) +
         '\n  <script type="application/ld+json">\n  ' +
         generateSoldGallerySchema(soldItems) +
         '\n  </script>\n  ' +
         html.substring(se);
}

// Build the canonical URL list with metadata. Order is stable for diff readability.
function buildUrlList(items, soldItems) {
  // Sold-inventory images attach to the /sold/ gallery URL — that page is
  // where these photos actually render (as cards in #sold-grid). Sold-stub
  // listing pages show no images, so they don't claim any.
  var soldImages = (soldItems || []).reduce(function(acc, item) {
    (item.images || []).forEach(function(p) { acc.push(imagePathToUrl(p)); });
    return acc;
  }, []);

  var urls = [
    { loc: BASE_URL,                         changefreq: 'weekly',  priority: '1.0' },
    { loc: BASE_URL + 'sold/',               changefreq: 'weekly',  priority: '0.8', images: soldImages },
    { loc: BASE_URL + 'sell/',               changefreq: 'monthly', priority: '0.7' },
  ];

  // Sell-landing cluster — driven by config/taxonomy.js.
  var tax = require('./config/taxonomy');
  function pushSell(slug) { urls.push({ loc: BASE_URL + 'sell/' + slug + '-edmonton/', changefreq: 'monthly', priority: '0.7' }); }
  tax.brands.forEach(function(b) { pushSell(b.slug); });
  tax.furnitureTypes.forEach(function(p) { pushSell(p.slug); });
  tax.situations.forEach(function(s) { pushSell(s.slug); });

  urls.push({ loc: BASE_URL + 'about/',   changefreq: 'monthly', priority: '0.6' });
  urls.push({ loc: BASE_URL + 'privacy/', changefreq: 'yearly',  priority: '0.3' });
  urls.push({ loc: BASE_URL + 'guides/',  changefreq: 'weekly',  priority: '0.7' });

  discoverGuides().forEach(function(loc) {
    urls.push({ loc: loc, changefreq: 'monthly', priority: '0.8' });
  });

  items.forEach(function(item) {
    if (item.comingSoon) return;
    var slug = item.slug || slugify(item.brand + '-' + item.title);
    // Per-listing image array — emitted as <image:image> children in the
    // sitemap so Google Images / Lens / shopping surfaces can index every
    // photo of every piece. See imagePathToUrl for the path-normalization rules.
    var images = (item.images || []).map(imagePathToUrl);
    urls.push({
      loc: BASE_URL + 'listings/' + slug + '/',
      changefreq: 'weekly',
      priority: '0.9',
      images: images
    });
  });

  return urls;
}

var sitemapStats = { changed: 0, held: 0, added: 0 };

function generateSitemap(items, soldItems) {
  var d = today();
  var urls = buildUrlList(items, soldItems);
  var state = loadState();
  var nextState = {};

  sitemapStats = { changed: 0, held: 0, added: 0 };

  var lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
  ];

  urls.forEach(function(u) {
    var file = fileForUrl(u.loc);
    var hash = null;
    var lastmod = d;

    if (fs.existsSync(file)) {
      hash = shortHash(canonicalizeForHash(fs.readFileSync(file, 'utf8')));
      var prev = state[u.loc];
      if (prev && prev.hash === hash) {
        lastmod = prev.lastmod;
        sitemapStats.held++;
      } else if (prev) {
        sitemapStats.changed++;
      } else {
        sitemapStats.added++;
      }
      nextState[u.loc] = { hash: hash, lastmod: lastmod };
    } else {
      // File missing — emit today's date but don't track state.
      sitemapStats.changed++;
    }

    lines.push('  <url>');
    lines.push('    <loc>' + u.loc + '</loc>');
    lines.push('    <lastmod>' + lastmod + '</lastmod>');
    lines.push('    <changefreq>' + u.changefreq + '</changefreq>');
    lines.push('    <priority>' + u.priority + '</priority>');
    if (u.images && u.images.length > 0) {
      u.images.forEach(function(imgUrl) {
        lines.push('    <image:image>');
        lines.push('      <image:loc>' + imgUrl + '</image:loc>');
        lines.push('    </image:image>');
      });
    }
    lines.push('  </url>');
  });

  lines.push('</urlset>');

  saveState(nextState);
  return lines.join('\n') + '\n';
}



// ── Main ─────────────────────────────────────────────────

// 0. Build & hash assets. The hash map is used by the listing template
//    and again at the end to rewrite ?v= query strings on every HTML file.
var assetVersions = buildAssets();

var availableSrc  = fs.readFileSync(path.join(ROOT, 'js', 'available-data.js'), 'utf8');
var soldSrc       = fs.readFileSync(path.join(ROOT, 'js', 'sold-data.js'),      'utf8');
var reviewsSrc    = fs.readFileSync(path.join(ROOT, 'js', 'reviews-data.js'),   'utf8');

var availableItems  = extractArray(availableSrc,  'availableItems');
var soldItems       = extractArray(soldSrc,        'soldItems');
var reviews         = extractArray(reviewsSrc,     'reviews');
var reviewAggregate = extractObject(reviewsSrc,    'reviewAggregate');

var availableHTML = generateAvailableHTML(availableItems);
var soldHTML      = generateSoldHTML(soldItems);
var reviewsHTML   = generateReviewsHTML(reviews, reviewAggregate);
var productSchema = generateProductSchemas(availableItems);

// ── 1. Update index.html ──────────────────────────────
var indexPath    = path.join(ROOT, 'index.html');
var indexContent = fs.readFileSync(indexPath, 'utf8');

indexContent = injectIntoContainer(indexContent, 'available-grid', availableHTML);
indexContent = injectIntoContainer(indexContent, 'reviews-section', reviewsHTML);
indexContent = injectBetweenMarkers(
  indexContent,
  '<!-- PRODUCT_SCHEMA_START -->',
  '<!-- PRODUCT_SCHEMA_END -->',
  productSchema
);

// Update LCP preload to always match the first available (non-coming-soon) item
var firstVisible = availableItems.filter(function(i) { return !i.comingSoon; })[0];
if (firstVisible && firstVisible.images && firstVisible.images.length > 0) {
  var lcpAvifSrcset = avifSrcsetFor(firstVisible.images[0]);
  indexContent = indexContent.replace(
    /<!-- LCP_PRELOAD_START -->.*?<!-- LCP_PRELOAD_END -->/,
    '<!-- LCP_PRELOAD_START --><link rel="preload" as="image" imagesrcset="' + lcpAvifSrcset + '" imagesizes="(max-width: 768px) 100vw, 530px" fetchpriority="high" type="image/avif"><!-- LCP_PRELOAD_END -->'
  );
}

// Centralized FAQ markup + schema for the homepage
indexContent = injectFaqs(indexContent, 'home');

fs.writeFileSync(indexPath, indexContent, 'utf8');

// ── 2. Update sold/index.html ────────────────────────
var soldPath    = path.join(ROOT, 'sold', 'index.html');
var soldContent = fs.readFileSync(soldPath, 'utf8');

soldContent = injectIntoContainer(soldContent, 'sold-grid', soldHTML);
soldContent = injectSoldGallerySchema(soldContent, soldItems);

fs.writeFileSync(soldPath, soldContent, 'utf8');

// ── 3. Update sell hub + about (centralized FAQ injection) ─
['sell/index.html', 'about/index.html'].forEach(function(rel) {
  var p = path.join(ROOT, rel);
  if (!fs.existsSync(p)) return;
  var id = rel === 'sell/index.html' ? 'sell' : 'about';
  var src = fs.readFileSync(p, 'utf8');
  var next = injectFaqs(src, id);
  if (next !== src) fs.writeFileSync(p, next, 'utf8');
});

// ── 4. Generate individual listing pages ─────────────
var listingsDir = path.join(ROOT, 'listings');
if (!fs.existsSync(listingsDir)) fs.mkdirSync(listingsDir);

var listingCount = 0;
availableItems.forEach(function(item) {
  if (item.comingSoon) return;

  var slug       = item.slug || slugify(item.brand + '-' + item.title);
  var itemDir    = path.join(listingsDir, slug);
  if (!fs.existsSync(itemDir)) fs.mkdirSync(itemDir);

  var html = generateListingPage(item, slug, availableItems, soldItems, assetVersions);
  fs.writeFileSync(path.join(itemDir, 'index.html'), html, 'utf8');
  listingCount++;
});

// ── 5. Inject partials + asset versions into every HTML file.
//      Files without partial markers are left alone for those partials;
//      every file still has its asset versions rewritten so cache-busting
//      stays in sync.
var partialFiles = walkHtml(ROOT);
var partialUpdated = 0;
for (var pi = 0; pi < partialFiles.length; pi++) {
  var pPath = partialFiles[pi];
  var pOrig = fs.readFileSync(pPath, 'utf8');
  var pNext = injectAllPartials(pOrig);
  pNext = injectAssetVersions(pNext, assetVersions);
  if (pNext !== pOrig) {
    fs.writeFileSync(pPath, pNext, 'utf8');
    partialUpdated++;
  }
}

// ── 6. Rewrite sitemap.xml using content-hash freshness.
//      <lastmod> only advances when the rendered content changes; sidecar
//      state lives in .build-state.json and is committed so dates persist
//      across machines.
var sitemapPath = path.join(ROOT, 'sitemap.xml');
var sitemapOut = generateSitemap(availableItems, soldItems);
fs.writeFileSync(sitemapPath, sitemapOut, 'utf8');

// ── Summary ──────────────────────────────────────────
var assetSummary = Object.keys(assetVersions)
  .map(function(k) { return k.split('/').pop() + ' ' + assetVersions[k]; })
  .join(', ');
console.log('Build complete:');
console.log('  assets          — ' + assetSummary);
console.log('  index.html      — ' + availableItems.length + ' available items, ' + reviews.length + ' reviews, ' + availableItems.filter(function(i) { return !i.comingSoon; }).length + ' product schemas');
console.log('  sold/index.html — ' + soldItems.length + ' sold items');
console.log('  listings/       — ' + listingCount + ' individual listing pages generated');
console.log('  sitemap.xml     — ' + sitemapStats.changed + ' URL(s) advanced; ' + sitemapStats.held + ' held; ' + sitemapStats.added + ' new');
console.log('  partials        — ' + partialUpdated + ' HTML files updated');
