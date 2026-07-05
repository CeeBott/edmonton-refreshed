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
//    8. Writes merchant-feed.xml — a Google Merchant Center RSS 2.0 product
//       feed listing every active (non-coming-soon) piece. Static file served
//       at /merchant-feed.xml; Google fetches it on a daily schedule.
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

// Minimal image-dimension reader (PNG IHDR + JPEG SOF markers) so OG/Twitter
// tags can declare accurate og:image:width/height/type without an image
// library. Returns {} when the file is missing or an unhandled format.
function imageSize(absPath) {
  if (!absPath || !fs.existsSync(absPath)) return {};
  var b = fs.readFileSync(absPath);
  if (b.length >= 24 && b.toString('hex', 0, 8) === '89504e470d0a1a0a') {
    return { w: b.readUInt32BE(16), h: b.readUInt32BE(20), type: 'image/png' };
  }
  if (b.length >= 4 && b[0] === 0xFF && b[1] === 0xD8) {
    var i = 2;
    while (i < b.length - 8) {
      if (b[i] !== 0xFF) { i++; continue; }
      var m = b[i + 1];
      if ((m >= 0xC0 && m <= 0xC3) || (m >= 0xC5 && m <= 0xC7) ||
          (m >= 0xC9 && m <= 0xCB) || (m >= 0xCD && m <= 0xCF)) {
        return { h: b.readUInt16BE(i + 5), w: b.readUInt16BE(i + 7), type: 'image/jpeg' };
      }
      i += 2 + b.readUInt16BE(i + 2);
    }
  }
  var ext = path.extname(absPath).toLowerCase();
  if (ext === '.webp') return { type: 'image/webp' };
  if (ext === '.svg')  return { type: 'image/svg+xml' };
  return {};
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

// Business timezone. Freshness dates (dateModified, sitemap <lastmod>,
// priceValidUntil) are stamped in Edmonton local time, NOT UTC: between
// ~18:00 and midnight MDT (UTC-6) the UTC ISO date is already tomorrow, which
// would mis-stamp every date a day ahead of the business's actual day.
var BUSINESS_TZ = 'America/Edmonton';

// en-CA locale formats a Date as zero-padded YYYY-MM-DD.
function isoDate(date) {
  return date.toLocaleDateString('en-CA', { timeZone: BUSINESS_TZ });
}

function today() {
  return isoDate(new Date());
}

function todayPlusDays(n) {
  var d = new Date();
  d.setDate(d.getDate() + n);
  return isoDate(d);
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

  // Root favicon assets are static (not minified), but still get a content-hash
  // ?v= so a rebranded icon busts browser caches — favicons are cached by URL
  // very aggressively. Content-hash, consistent with §5.7 (no manual ?v=N
  // registry, §10.7). injectFaviconVersions adds/refreshes the query on refs.
  ['favicon.svg', 'apple-touch-icon.png'].forEach(function(f) {
    var p = path.join(ROOT, f);
    if (fs.existsSync(p)) versions[f] = shortHash(fs.readFileSync(p));
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

// favicon.svg / apple-touch-icon.png sit at site root, referenced with varying
// relative prefixes and historically no ?v=. Add or refresh a content-hash
// query on each <link href="…"> so a rebranded icon busts caches. Anchored on
// href="…" so it never touches schema "logo"/"image" URLs (which stay clean).
function injectFaviconVersions(html, versions) {
  ['favicon.svg', 'apple-touch-icon.png'].forEach(function(asset) {
    if (!versions[asset]) return;
    var re = new RegExp('(href=")([^"]*' + escapeRegExp(asset) + ')(\\?v=[A-Za-z0-9._-]+)?(")', 'g');
    html = html.replace(re, '$1$2?v=' + versions[asset] + '$4');
  });
  return html;
}

// Ensure every page links the web manifest (Android "add to home screen" / PWA
// identity + a structured app name/icons for search & AI). Inserted once after
// the apple-touch-icon link; idempotent. Bare redirect stubs (no apple-touch
// link) are left untouched.
function injectManifestLink(html) {
  if (/rel="manifest"/.test(html)) return html;
  return html.replace(/^([ \t]*)(<link rel="apple-touch-icon"[^>]*>)/m,
    '$1$2\n$1<link rel="manifest" href="/site.webmanifest">');
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
    var titleLine = item.href
      ? '            <div class="card-title"><a class="card-title-link" href="' + item.href + '">' + escapeHtml(item.title) + '</a></div>'
      : '            <div class="card-title">' + escapeHtml(item.title) + '</div>';

    lines.push(
      '        <div class="card sold">',
      '          <div class="card-image-placeholder"><picture><source type="image/avif" srcset="' + avifSrcsetFor(imgSrc) + '" sizes="(max-width: 768px) 100vw, 530px"><source type="image/webp" srcset="' + webpSrcsetFor(imgSrc) + '" sizes="(max-width: 768px) 100vw, 530px"><img src="' + imgSrc + '" srcset="' + srcsetFor(imgSrc) + '" sizes="(max-width: 768px) 100vw, 530px" alt="' + alt + '" loading="lazy"></picture></div>',
      '          <div class="card-body">',
      '            <div class="card-meta"><div class="card-brand">' + escapeHtml(item.brand) + '</div><span class="sold-badge">Sold</span></div>',
      titleLine + descLine,
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
  var priceValidUntil = todayPlusDays(90);

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
    var material = materialFor(item);
    if (material) schema["material"] = material;

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
  var priceValidUntil = todayPlusDays(90);
  var imageUrl        = (item.images && item.images.length > 0)
    ? BASE_URL + item.images[0]
    : BASE_URL + 'images/og-preview.png';
  var ogDims          = (item.images && item.images.length > 0)
    ? imageSize(path.join(ROOT, item.images[0]))
    : { w: 1200, h: 630, type: 'image/png' };

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

  var listingMaterial = materialFor(item);
  if (listingMaterial) productSchema["material"] = listingMaterial;

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
    "image": BASE_URL + "images/og-preview.png",
    "logo": site.logo,
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
    "logo": site.logo,
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
  var brandGuideMap = getBrandGuideMap();
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
    'Natuzzi':              { href: '/sell/natuzzi/',              anchor: 'sell your Natuzzi piece' },
    'Natuzzi Editions':     { href: '/sell/natuzzi/',              anchor: 'sell your Natuzzi piece' },
    'Natuzzi Italia':       { href: '/sell/natuzzi/',              anchor: 'sell your Natuzzi piece' },
    'Rove Concepts':        { href: '/sell/rove-concepts/',        anchor: 'sell your Rove Concepts piece' },
    'EQ3':                  { href: '/sell/eq3/',                  anchor: 'sell your EQ3 piece' },
    'Crate & Barrel':       { href: '/sell/crate-and-barrel/',     anchor: 'sell your Crate &amp; Barrel piece' },
    'Restoration Hardware': { href: '/sell/restoration-hardware/', anchor: 'sell your Restoration Hardware piece' },
    'West Elm':             { href: '/sell/west-elm/',             anchor: 'sell your West Elm piece' }
  };
  var sellLineTarget;
  if (brandSellMap[item.brand]) {
    sellLineTarget = brandSellMap[item.brand];
  } else {
    var pc = classifyPiece(item);
    if (pc.type === 'sectional') {
      sellLineTarget = pc.leather
        ? { href: '/sell/leather-sectional/', anchor: 'sell your leather sectional' }
        : { href: '/sell/sectional/',         anchor: 'sell your sectional' };
    } else if (pc.type === 'sofa') {
      sellLineTarget = pc.leather
        ? { href: '/sell/leather-sofa/', anchor: 'sell your leather sofa' }
        : { href: '/sell/sofa/',         anchor: 'sell your sofa' };
    } else if (pc.type === 'couch') {
      sellLineTarget = pc.leather
        ? { href: '/sell/leather-couch/', anchor: 'sell your leather couch' }
        : { href: '/sell/couch/',         anchor: 'sell your couch' };
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
          '<a class="listing-related-card" href="' + (s.href || '/sold/') + '">' +
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
(ogDims.w ? '  <meta property="og:image:width" content="' + ogDims.w + '">\n' : '') +
(ogDims.h ? '  <meta property="og:image:height" content="' + ogDims.h + '">\n' : '') +
'  <meta property="og:image:type" content="' + (ogDims.type || 'image/jpeg') + '">\n' +
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
'              <a class="listing-cta" href="sms:7809651477">Text to Book a Viewing &rarr;</a>\n' +
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
'\n' +
'      <!-- Sticky CTA (mobile only): floats while reading, parks here once the\n' +
'           FAQ is reached so it never covers the related links, newsletter, or footer. -->\n' +
'      <div class="listing-sticky-sentinel" aria-hidden="true"></div>\n' +
'      <div class="listing-sticky-cta">\n' +
'        <a href="sms:7809651477" class="sticky-cta-primary">Book a Viewing</a>\n' +
'      </div>\n' +
'\n' +
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

// Inline variant of injectPartial — same marker grammar, but emits the
// replacement on the same line with no added whitespace. Used for config-
// driven text fragments inside authored sentences, where injectPartial's
// newline wrapping would add visible whitespace before punctuation.
function injectInline(html, name, render) {
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
    return openTag + render(attrMap) + closeTag;
  });
}

function injectAllPartials(html) {
  html = injectPartial(html, 'NAV',         function ()      { return renderNav(); });
  html = injectPartial(html, 'CREDIBILITY', function (attrs) { return renderCredibility(attrs.variant || 'buyer'); });
  html = injectPartial(html, 'FOOTER',      function ()      { return renderFooter(); });
  // Brand guides: live-inventory cross-link. Renders a short "available right
  // now" paragraph when the marker's brand family has live pieces — and
  // nothing when it doesn't — so guides never claim stale availability
  // (§8.9) and every reprice propagates on the next build. Family matching
  // is first-word prefix, same as related links ("Natuzzi" covers Natuzzi
  // Editions / Natuzzi Italia).
  html = injectPartial(html, 'AVAILABLE_FROM_BRAND', function (attrs) {
    var family = (attrs.brand || '').split(' ')[0].toLowerCase();
    if (!family) return '';
    var live = availableItems.filter(function (i) {
      return !i.comingSoon && (i.brand || '').toLowerCase().indexOf(family) === 0;
    });
    if (!live.length) return '';
    var links = live.map(function (i) {
      var slug = i.slug || slugify(i.brand + '-' + i.title);
      return '<a href="/listings/' + slug + '/">' + escapeHtml(i.title) + '</a> (' + formatPriceCAD(i.price) + ')';
    }).join('; ');
    return '          <p><strong>Available from ' + escapeHtml(attrs.brand) + ' in Edmonton right now:</strong> ' + links + '.</p>';
  });
  // Config-driven inline fragments (homepage sr-only entity block, sold-page
  // tagline): the canonical §2.1-ordered brand list and the sold count render
  // from config/site.js so the pages can never drift from it.
  html = injectInline(html, 'BRAND_LIST', function (attrs) {
    var list = (site.brandList || []).map(escapeHtml);
    if (!list.length) return '';
    return attrs.and === 'true' && list.length > 1
      ? list.slice(0, -1).join(', ') + ', and ' + list[list.length - 1]
      : list.join(', ');
  });
  html = injectInline(html, 'SOLD_COUNT', function () {
    var n = parseInt(site.piecesSold, 10);
    return isNaN(n) ? escapeHtml(String(site.piecesSold)) : String(n);
  });
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
    // Favicon refs carry a content-hash ?v= in the HTML to bust browser caches
    // (injectFaviconVersions), but a rebranded icon is sitewide chrome, not a
    // per-page content change — normalize the query away so it never bumps
    // <lastmod> (avoids the spurious sitewide freshness signal, §5.15/§10.10).
    .replace(/(favicon\.svg|apple-touch-icon\.png)\?v=/g, '$1')
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
    .filter(function(e) {
      if (!e.isDirectory()) return false;
      var file = path.join(dir, e.name, 'index.html');
      if (!fs.existsSync(file)) return false;
      // Skip redirect stubs (meta-refresh to a consolidated guide): they are
      // noindex, so advertising them in the sitemap sends a mixed signal —
      // crawl this, then don't index it. Same detection the entity-integrity
      // audit uses below.
      if (/<meta[^>]+http-equiv=["']?refresh/i.test(fs.readFileSync(file, 'utf8'))) return false;
      return true;
    })
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

// ── Sell-landing ItemList schemas ────────────────────────
// Same shape as the /sold/ gallery (§5.16): ItemList of ImageObject items
// with the full attribution stack so each photo is eligible for Google
// Images' Licensable badge. Each sell-landing page hand-picks a subset of
// sold cards in its .sell-landing-sold-grid; this generator derives the
// schema from that visible grid so the schema and the cards can never drift
// out of sync. Pages without an entry in LANDING_SOLD_SCHEMA_META — or
// without the marker pair — are left untouched.

// Per-page metadata for the landing-sold schema. Keyed by repo-relative path
// to keep the inject site free of long description strings.
var LANDING_SOLD_SCHEMA_META = {
  'sell/index.html': {
    name: 'Recently Purchased Pieces in Edmonton',
    description: 'Photos of pre-owned sofas and sectionals recently purchased and resold by Edmonton Refreshed across Edmonton and surrounding communities.',
  },
  'partners/index.html': {
    name: 'Pieces Recently Bought Through Edmonton Refreshed',
    description: 'Photos of pre-owned premium sofas and sectionals purchased directly from Edmonton homes and resold by Edmonton Refreshed.',
  },
  'sell/natuzzi/index.html': {
    name: 'Recently Purchased Natuzzi Pieces in Edmonton',
    description: 'Photos of pre-owned Natuzzi Italia and Natuzzi Editions sofas and sectionals purchased and resold by Edmonton Refreshed.',
  },
  'sell/selling-furniture-before-moving/index.html': {
    name: 'Recently Purchased Pieces from Edmonton Sellers',
    description: 'Photos of pre-owned sofas and sectionals recently purchased and resold by Edmonton Refreshed across Edmonton and surrounding communities.',
  },
  'sell/downsizing-furniture/index.html': {
    name: 'Recently Purchased Pieces from Edmonton Households',
    description: 'Photos of pre-owned sofas and sectionals recently purchased and resold by Edmonton Refreshed across Edmonton and surrounding communities.',
  },
  'sell/furniture-consignment/index.html': {
    name: 'Recently Purchased Pieces in Edmonton — Direct Buyouts',
    description: 'Photos of pre-owned sofas and sectionals purchased outright in Edmonton — an alternative to local consignment channels.',
  },
  'sell/estate-furniture/index.html': {
    name: 'Recently Purchased Pieces from Edmonton Estates and Family Homes',
    description: 'Photos of pre-owned sofas and sectionals purchased from estates and family homes across Edmonton and surrounding communities.',
  },
  'sell/couch/index.html': {
    name: 'Recently Purchased Couches in Edmonton',
    description: 'Photos of pre-owned couches and sofas recently purchased and resold by Edmonton Refreshed across Edmonton and surrounding communities.',
  },
  'sell/sectional/index.html': {
    name: 'Recently Purchased Sectionals in Edmonton',
    description: 'Photos of pre-owned sectionals recently purchased and resold by Edmonton Refreshed across Edmonton and surrounding communities.',
  },
  'sell/sell-furniture-fast/index.html': {
    name: 'Recently Purchased Pieces in Edmonton — Fast Buyouts',
    description: 'Photos of pre-owned sofas and sectionals recently purchased on tight timelines by Edmonton Refreshed across Edmonton and surrounding communities.',
  },
  'sell/sell-designer-furniture/index.html': {
    name: 'Recently Purchased Designer Pieces in Edmonton',
    description: 'Photos of pre-owned designer and premium sofas and sectionals recently purchased and resold by Edmonton Refreshed across Edmonton and surrounding communities.',
  },
  'sell/leather-sofa/index.html': {
    name: 'Recently Purchased Leather Sofas in Edmonton',
    description: 'Photos of pre-owned leather sofas recently purchased and resold by Edmonton Refreshed across Edmonton and surrounding communities.',
  },
  'sell/leather-sectional/index.html': {
    name: 'Recently Purchased Leather Sectionals in Edmonton',
    description: 'Photos of pre-owned leather sectionals recently purchased and resold by Edmonton Refreshed across Edmonton and surrounding communities.',
  },
  'sell/leather-couch/index.html': {
    name: 'Recently Purchased Leather Couches in Edmonton',
    description: 'Photos of pre-owned leather couches recently purchased and resold by Edmonton Refreshed across Edmonton and surrounding communities.',
  },
  'sell/crate-and-barrel/index.html': {
    name: 'Recently Purchased Crate & Barrel Pieces in Edmonton',
    description: 'Photos of pre-owned Crate & Barrel sofas and sectionals — Lounge, Axis, Gather, Rochelle and others — purchased and resold by Edmonton Refreshed.',
  },
  'sell/rove-concepts/index.html': {
    name: 'Recently Purchased Rove Concepts Pieces in Edmonton',
    description: 'Photos of pre-owned Rove Concepts sofas and sectionals — Milo, Porter, Kaye, Luca, and others — purchased and resold by Edmonton Refreshed.',
  },
  'sell/eq3/index.html': {
    name: 'Recently Purchased EQ3 Pieces in Edmonton',
    description: 'Photos of pre-owned EQ3 sofas and sectionals — Replay, Remi, Salema, Cello, and others — purchased and resold by Edmonton Refreshed.',
  },
};

// Decode the small set of HTML entities that appear in card-brand / card-title
// div text. Card image src attributes are already URL-encoded and don't need
// decoding — the resulting URL is fed straight into the schema.
function decodeHtmlEntities(s) {
  return s
    .replace(/&amp;/g,  '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g,  "'")
    .replace(/&apos;/g, "'")
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–');
}

// Parse the .sell-landing-sold section on a sell-landing page. Each
// <a class="card sold"> inside the section contributes one card; we pull
// brand (.card-brand), title (.card-title), and the full-size image src
// from the <img> tag. Returns null if the page has no sold grid (not a
// sell-landing page or just no sold cards yet).
function parseSellLandingSoldCards(html) {
  var sectionMatch = html.match(/<section class="sell-landing-sold">[\s\S]*?<\/section>/);
  if (!sectionMatch) return null;
  var sectionHtml = sectionMatch[0];
  var cardRe = /<a class="card sold"[\s\S]*?<\/a>/g;
  var cards = [];
  var m;
  while ((m = cardRe.exec(sectionHtml)) !== null) {
    var cardHtml = m[0];
    var bm = cardHtml.match(/<div class="card-brand">([^<]+)<\/div>/);
    var tm = cardHtml.match(/<div class="card-title">([^<]+)<\/div>/);
    var im = cardHtml.match(/<img\s+src="([^"]+)"/);
    if (bm && tm && im) {
      cards.push({
        brand: decodeHtmlEntities(bm[1].trim()),
        title: decodeHtmlEntities(tm[1].trim()),
        src:   im[1].trim(),
      });
    }
  }
  return cards.length > 0 ? cards : null;
}

// Build description prose for a single ImageObject. Matches the editorial
// style established by hand on the sell-landing pages: lowercase descriptor
// words in the title (keeping the leading word — typically a proper-noun
// model name — capitalized), and normalize standalone & and + to "and".
function describeLandingCard(card) {
  var parts = card.title.split(/\s+/).filter(Boolean);
  var leading = parts[0] || '';
  var rest = parts.slice(1).map(function(w) {
    if (w === '&' || w === '+') return 'and';
    return w.toLowerCase();
  }).join(' ');
  var descriptor = rest ? leading + ' ' + rest : leading;
  return 'Pre-owned ' + card.brand + ' ' + descriptor + ', purchased and resold by Edmonton Refreshed.';
}

// Build the ItemList JSON-LD for a sell-landing page from its parsed cards.
// Attribution stack matches §5.16 (creator/copyrightHolder/creditText/license/
// acquireLicensePage) for Licensable-badge eligibility in Google Images.
function generateLandingSoldSchema(meta, cards) {
  var ORG = { '@type': 'Organization', name: 'Edmonton Refreshed' };
  var elements = cards.map(function(card, idx) {
    var contentUrl = BASE_URL + card.src.replace(/^\/+/, '');
    var thumbnailUrl = contentUrl.replace(/\.jpeg$/i, '-400w.jpeg');
    return {
      '@type': 'ListItem',
      position: idx + 1,
      item: {
        '@type': 'ImageObject',
        name: card.brand + ' ' + card.title,
        description: describeLandingCard(card),
        contentUrl: contentUrl,
        thumbnailUrl: thumbnailUrl,
        about: { '@type': 'Brand', name: card.brand },
        creator: ORG,
        copyrightHolder: ORG,
        creditText: 'Photo by Edmonton Refreshed',
        license: BASE_URL,
        acquireLicensePage: BASE_URL,
      },
    };
  });
  var schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: meta.name,
    description: meta.description,
    numberOfItems: cards.length,
    itemListOrder: 'https://schema.org/ItemListOrderDescending',
    itemListElement: elements,
  };
  return JSON.stringify(schema, null, 2).replace(/\n/g, '\n  ');
}

// Inject the landing-sold schema between LANDING_SOLD_SCHEMA_START / _END
// markers. No-op when markers are absent, when the page has no metadata
// entry, or when the page has no sold-card grid — partial adoption is safe.
function injectLandingSoldSchema(html, filepath) {
  var startMarker = '<!-- LANDING_SOLD_SCHEMA_START -->';
  var endMarker   = '<!-- LANDING_SOLD_SCHEMA_END -->';
  var ss = html.indexOf(startMarker);
  if (ss === -1) return html;
  var se = html.indexOf(endMarker, ss);
  if (se === -1) return html;
  var rel = path.relative(ROOT, filepath).split(path.sep).join('/');
  var meta = LANDING_SOLD_SCHEMA_META[rel];
  if (!meta) return html;
  var cards = parseSellLandingSoldCards(html);
  if (!cards) return html;
  return html.substring(0, ss + startMarker.length) +
         '\n  <script type="application/ld+json">\n  ' +
         generateLandingSoldSchema(meta, cards) +
         '\n  </script>\n  ' +
         html.substring(se);
}

// Build the canonical URL list with metadata. Order is stable for diff readability.
function buildUrlList(items, soldItems) {
  // Sold-inventory images attach to the /sold/ gallery URL — that page is where
  // these photos render (as cards in #sold-grid). Pieces that now have their own
  // sold-stub listing page (item.href) claim their photos on that dedicated page
  // instead (see the sold-stub loop below), so they're excluded here to keep one
  // canonical page per image.
  var soldImages = (soldItems || []).reduce(function(acc, item) {
    if (item.href) return acc;
    (item.images || []).forEach(function(p) { acc.push(imagePathToUrl(p)); });
    return acc;
  }, []);

  var urls = [
    { loc: BASE_URL,                         changefreq: 'weekly',  priority: '1.0' },
    { loc: BASE_URL + 'sold/',               changefreq: 'weekly',  priority: '0.8', images: soldImages },
    { loc: BASE_URL + 'sell/',               changefreq: 'monthly', priority: '0.7' },
    { loc: BASE_URL + 'sell/what-we-buy/', changefreq: 'monthly', priority: '0.7' },
  ];

  // Sell-landing cluster — driven by config/taxonomy.js.
  var tax = require('./config/taxonomy');
  function pushSell(slug) { urls.push({ loc: BASE_URL + 'sell/' + slug + '/', changefreq: 'monthly', priority: '0.7' }); }
  tax.brands.forEach(function(b) { pushSell(b.slug); });
  tax.furnitureTypes.forEach(function(p) { pushSell(p.slug); });
  tax.situations.forEach(function(s) { pushSell(s.slug); });

  urls.push({ loc: BASE_URL + 'about/',    changefreq: 'monthly', priority: '0.6' });
  urls.push({ loc: BASE_URL + 'partners/', changefreq: 'monthly', priority: '0.6' });
  urls.push({ loc: BASE_URL + 'privacy/',  changefreq: 'yearly',  priority: '0.3' });
  urls.push({ loc: BASE_URL + 'returns/',  changefreq: 'yearly',  priority: '0.3' });
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

  // Sold-stub listing pages — any sold piece with an href has a surviving,
  // indexable /listings/<slug>/ page (see CLAUDE.md §8.3, §6.3). It carries the
  // piece's photos, so it earns its own sitemap entry with <image:image>
  // children. Lower priority than live inventory; the page rarely changes.
  (soldItems || []).forEach(function(item) {
    if (!item.href) return;
    urls.push({
      loc: BASE_URL + item.href.replace(/^\//, ''),
      changefreq: 'monthly',
      priority: '0.5',
      images: (item.images || []).map(imagePathToUrl)
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


// ── Google Merchant Center product feed ──────────────────
//  Emits /merchant-feed.xml — an RSS 2.0 feed in Google's `g:` namespace, one
//  <item> per ACTIVE piece in available-data.js. Coming-soon pieces are skipped
//  (same gate as the on-page Product schema) and sold pieces aren't in
//  availableItems at all, so the feed can only ever contain live, for-sale
//  inventory. The file is static — served by GitHub Pages at
//  https://edmontonrefreshed.com/merchant-feed.xml — and Merchant Center is
//  pointed at that URL with a daily scheduled fetch, so there's no server or
//  cron: it regenerates on every `node build.js`, exactly like sitemap.xml.
//  See CLAUDE.md §5.18.
//
//  Pre-owned furniture specifics:
//    · condition          = used
//    · availability       = in_stock (feed only ever holds live stock)
//    · identifier_exists  = no  (one-of-one pieces carry no GTIN/MPN)
//    · shipping           = a flat local rate scoped to one region (config), so
//                           Google treats items as locally available without
//                           national shipping rates.

var MF = site.merchantFeed || {};
var MF_CURRENCY     = MF.currency || 'CAD';
var MF_SHIP_RATE    = (MF.shippingRate != null ? MF.shippingRate : null);  // null → omit <g:shipping>, defer to account-level
var MF_SHIP_COUNTRY = MF.shippingCountry || 'CA';
var MF_SHIP_REGION  = (MF.shippingRegion != null ? MF.shippingRegion : 'AB');
var MF_GCAT_DEFAULT = MF.googleProductCategory || 'Home & Garden > Furniture > Sofas';

// XML text escaping — ONLY the five predefined XML entities. (escapeHtml emits
// named HTML entities like &mdash; which are UNDEFINED in plain XML and would
// break the feed; Unicode chars stay literal under the UTF-8 declaration.)
function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Google price format: "NUMBER CURRENCY", e.g. "3200.00 CAD".
function mfPrice(n) {
  return Number(n).toFixed(2) + ' ' + MF_CURRENCY;
}

// Stable, unique merchant id — the image-folder SKU (e.g. "BB-030"), identical
// to the on-page Product `sku` so Google can match feed ↔ structured data.
// Falls back to the slug if a piece somehow has no images.
function mfId(item, slug) {
  if (item.images && item.images.length > 0) {
    var seg = item.images[0].split('/');
    if (seg.length > 1 && seg[1]) return seg[1];
  }
  return slug;
}

// ── Piece classification — the SINGLE source for piece type + leather ───
// Consumed by the listing sell-line and both merchant-feed category mappers
// so the three can never drift (CLAUDE.md §5.8 / §5.18). Precedence:
// sectional > sofa > couch/loveseat > ottoman > chair > other.
var LEATHER_RE = /leather|nubuck|aniline|top-grain|full-grain/;
function classifyPiece(item) {
  var t = ((item.title || '') + ' ' + (item.specs || []).join(' ')).toLowerCase();
  var type = 'other';
  if (/sectional/.test(t)) type = 'sectional';
  else if (/sofa/.test(t)) type = 'sofa';
  else if (/couch|loveseat/.test(t)) type = 'couch';
  else if (/ottoman|footstool|pouf/.test(t)) type = 'ottoman';
  else if (/recliner|armchair|accent chair|lounge chair|\bchair\b/.test(t)) type = 'chair';
  return { type: type, leather: LEATHER_RE.test(t) };
}

function mfIsLeather(item) {
  return classifyPiece(item).leather;
}

// On-page Product schema material — a premium/quality signal and a valid
// Schema.org Product field. Prefer the authored material spec verbatim (e.g.
// "Top-Grain Aniline Leather"); else fall back to a plain "Leather" for leather
// pieces with no explicit material spec; else omit. Never guesses a material
// that isn't already in the piece's own data.
var MATERIAL_RE = /top-grain|full-grain|semi-aniline|aniline|nubuck|suede|leather|bouclé|boucle|velvet|chenille|linen|performance fabric|fabric|microfib/i;
function materialFor(item) {
  if (Array.isArray(item.specs)) {
    for (var i = 0; i < item.specs.length; i++) {
      if (MATERIAL_RE.test(item.specs[i])) return item.specs[i];
    }
  }
  return mfIsLeather(item) ? 'Leather' : null;
}

// Merchant product_type (the seller's own taxonomy).
function mfPieceType(item) {
  var pc = classifyPiece(item);
  if (pc.type === 'sectional') return pc.leather ? 'Leather Sectionals' : 'Sectionals';
  if (pc.type === 'sofa')      return pc.leather ? 'Leather Sofas'      : 'Sofas';
  if (pc.type === 'couch')     return pc.leather ? 'Leather Couches'    : 'Couches';
  if (pc.type === 'ottoman')   return 'Ottomans';
  if (pc.type === 'chair')     return 'Chairs';
  return 'Seating';
}

// Google product taxonomy — VERIFIED exact paths from Google's official feed
// taxonomy. "Furniture" is a TOP-LEVEL category (NOT under "Home & Garden"):
//   Furniture > Sofas (460) · Furniture > Ottomans (458) · Furniture > Chairs (443).
// Sofas (460) is the closest valid node for sofas, sectionals, and couches —
// Google has no standalone "Sectionals" category.
function mfGoogleCategory(item) {
  var pc = classifyPiece(item);
  if (pc.type === 'ottoman') return 'Furniture > Ottomans';
  if (pc.type === 'chair')   return 'Furniture > Chairs';
  return MF_GCAT_DEFAULT;
}

var merchantFeedStats = { items: 0 };

function generateMerchantFeed(items) {
  merchantFeedStats = { items: 0 };

  var lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">',
    '  <channel>',
    '    <title>' + escapeXml(site.brandFullName + ' — Available Inventory') + '</title>',
    '    <link>' + BASE_URL + '</link>',
    '    <description>' + escapeXml('Pre-owned premium sofas and sectionals available now in ' + site.cityName + ', ' + site.provinceCode + '. Professionally inspected, cleaned, and delivered locally.') + '</description>',
  ];

  items.forEach(function(item) {
    if (item.comingSoon) return;   // not yet for sale
    if (!item.price) return;       // defensive — no price, can't list

    var slug       = item.slug || slugify(item.brand + '-' + item.title);
    var listingUrl = BASE_URL + 'listings/' + slug + '/';
    var images     = item.images || [];

    var desc = (item.description || '').replace(/\s*\n+\s*/g, ' ').trim();
    if (desc.length > 5000) desc = desc.substring(0, 4999).replace(/\s+\S*$/, '') + '…';

    var title = item.brand + ' ' + item.title;
    if (title.length > 150) title = title.substring(0, 149).replace(/\s+\S*$/, '') + '…';

    var L = ['    <item>'];
    L.push('      <g:id>' + escapeXml(mfId(item, slug)) + '</g:id>');
    L.push('      <g:title>' + escapeXml(title) + '</g:title>');
    L.push('      <g:description>' + escapeXml(desc) + '</g:description>');
    L.push('      <g:link>' + listingUrl + '</g:link>');
    if (images.length > 0) L.push('      <g:image_link>' + imagePathToUrl(images[0]) + '</g:image_link>');
    images.slice(1, 11).forEach(function(p) {   // Google allows up to 10 additional images
      L.push('      <g:additional_image_link>' + imagePathToUrl(p) + '</g:additional_image_link>');
    });
    L.push('      <g:availability>in_stock</g:availability>');
    L.push('      <g:price>' + mfPrice(item.price) + '</g:price>');
    L.push('      <g:condition>used</g:condition>');
    L.push('      <g:brand>' + escapeXml(item.brand) + '</g:brand>');
    L.push('      <g:google_product_category>' + escapeXml(mfGoogleCategory(item)) + '</g:google_product_category>');
    L.push('      <g:product_type>' + escapeXml('Pre-Owned Furniture > ' + mfPieceType(item)) + '</g:product_type>');
    L.push('      <g:identifier_exists>no</g:identifier_exists>');  // one-of-one used pieces: no GTIN/MPN
    if (mfIsLeather(item)) L.push('      <g:material>Leather</g:material>');

    // Dimensions → product_detail (inches), when known.
    if (item.dimensions) {
      ['width', 'depth', 'height'].forEach(function(d) {
        if (!item.dimensions[d]) return;
        L.push('      <g:product_detail>');
        L.push('        <g:section_name>Dimensions</g:section_name>');
        L.push('        <g:attribute_name>' + (d.charAt(0).toUpperCase() + d.slice(1)) + '</g:attribute_name>');
        L.push('        <g:attribute_value>' + escapeXml(item.dimensions[d] + ' in') + '</g:attribute_value>');
        L.push('      </g:product_detail>');
      });
    }

    // Per-item shipping. When a flat rate is configured, emit <g:shipping> with
    // country + price only — NO <g:region>: Google rejected province-level
    // region values (bare 'AB' and ISO 'CA-AB' alike), and the account is
    // scoped to Canada, so a per-item region is unnecessary. Set shippingRate
    // to null in config to omit the block entirely and defer to account-level
    // shipping. shippingRegion is honoured only if explicitly set (off by default).
    if (MF_SHIP_RATE != null) {
      L.push('      <g:shipping>');
      L.push('        <g:country>' + escapeXml(MF_SHIP_COUNTRY) + '</g:country>');
      if (MF_SHIP_REGION) L.push('        <g:region>' + escapeXml(MF_SHIP_REGION) + '</g:region>');
      L.push('        <g:price>' + mfPrice(MF_SHIP_RATE) + '</g:price>');
      L.push('      </g:shipping>');
      // Handling/transit mirror the on-page Offer shippingDetails (0–3 / 1–7 days).
      L.push('      <g:min_handling_time>0</g:min_handling_time>');
      L.push('      <g:max_handling_time>3</g:max_handling_time>');
      L.push('      <g:min_transit_time>1</g:min_transit_time>');
      L.push('      <g:max_transit_time>7</g:max_transit_time>');
    }
    L.push('    </item>');

    lines.push(L.join('\n'));
    merchantFeedStats.items++;
  });

  lines.push('  </channel>');
  lines.push('</rss>');
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
// Sold-card deep-linking: any .sell-landing-sold-grid card whose photo belongs
// to a piece that now has a sold-stub listing page (sold-data.js href) links
// straight to that stub in a new tab, instead of the broad /sold/ gallery — so
// the visitor isn't pulled off the sell page. Driven entirely by sold-data.js
// hrefs (single source of truth): add a stub and every matching card across the
// sell cluster relinks on the next build; remove one and the cards revert to
// /sold/. Keyed by the image folder (e.g. "NE-040"), the stable per-piece id.
var soldStubByFolder = {};
soldItems.forEach(function(item) {
  if (!item.href || !item.images || !item.images.length) return;
  var seg = item.images[0].split('/');
  soldStubByFolder[seg[seg.length - 2]] = item.href;
});

var soldCardRelinks = 0;
function relinkSoldCards(html) {
  if (html.indexOf('sell-landing-sold-grid') === -1) return html;
  return html.replace(/<a class="card sold"[\s\S]*?<\/a>/g, function(card) {
    var im = card.match(/\/images\/[^"'\s]+\.(?:jpe?g|avif|webp)/i);
    if (!im) return card;
    var seg = im[0].split('/');
    var href = soldStubByFolder[seg[seg.length - 2]];
    var open = card.match(/^<a\b[^>]*>/)[0];
    var rest = card.slice(open.length);
    var cleaned = open
      .replace(/\s+href="[^"]*"/, '')
      .replace(/\s+target="[^"]*"/, '')
      .replace(/\s+rel="[^"]*"/, '')
      .replace(/(<a class="card sold")/, '$1 href="' + (href || '/sold/') + '"' + (href ? ' target="_blank" rel="noopener"' : ''));
    if (href) soldCardRelinks++;
    return cleaned + rest;
  });
}

var partialFiles = walkHtml(ROOT);
var partialUpdated = 0;
for (var pi = 0; pi < partialFiles.length; pi++) {
  var pPath = partialFiles[pi];
  var pOrig = fs.readFileSync(pPath, 'utf8');
  var pNext = injectAllPartials(pOrig);
  pNext = injectLandingSoldSchema(pNext, pPath);
  pNext = relinkSoldCards(pNext);
  pNext = injectAssetVersions(pNext, assetVersions);
  pNext = injectFaviconVersions(pNext, assetVersions);
  pNext = injectManifestLink(pNext);
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

// ── 6b. Write the Google Merchant Center product feed.
//      Static file at /merchant-feed.xml; Merchant Center fetches it daily.
var merchantFeedPath = path.join(ROOT, 'merchant-feed.xml');
fs.writeFileSync(merchantFeedPath, generateMerchantFeed(availableItems), 'utf8');

// ── 7. Entity-integrity guardrail.
//      The site's authority rests on a single canonical owner entity
//      (Person @id /about/#collin) referenced from every sell page and guide
//      author, plus one consistent sameAs set defined in config/site.js. That
//      wiring is easy to break silently: the About page can lose the Person
//      node while pages keep citing it (the references then resolve to
//      nothing), a hand-edited sameAs can drift from config, or a guide can
//      ship without an Article schema or author. We re-read the final on-disk
//      HTML and audit. A dangling owner @id is a HARD failure (exit 1) because
//      it makes every sell-page/guide author citation inert; sameAs drift and
//      guide gaps are warnings. See CLAUDE.md §5.17 and §4.3.
// ── Brand-guide cross-link map — module-scoped so the audit can lint it ──
// One entry per brand with a published buyer's guide; renders the listing
// Description cross-link (§5.8). The audit warns when a published brand-
// review guide has no entry here.
function getBrandGuideMap() {
  return {
    'Natuzzi': { slug: 'natuzzi-sofa-review-edmonton', label: 'Read our full Natuzzi buyer&rsquo;s guide for Edmonton' },
    'Natuzzi Editions': { slug: 'natuzzi-sofa-review-edmonton', label: 'Read our full Natuzzi buyer&rsquo;s guide for Edmonton' },
    'Natuzzi Italia': { slug: 'natuzzi-sofa-review-edmonton', label: 'Read our full Natuzzi buyer&rsquo;s guide for Edmonton' },
    'B&B Italia': { slug: 'bb-italia-sofa-review-edmonton', label: 'Read our full B&amp;B Italia buyer&rsquo;s guide for Edmonton' },
    'Rove Concepts': { slug: 'rove-concepts-sofa-review-edmonton', label: 'Read our full Rove Concepts buyer&rsquo;s guide for Edmonton' },
    'Pottery Barn': { slug: 'pottery-barn-sofa-review-edmonton', label: 'Read our full Pottery Barn buyer&rsquo;s guide for Edmonton' },
    'Crate & Barrel': { slug: 'crate-and-barrel-sofa-review-edmonton', label: 'Read our full Crate &amp; Barrel buyer&rsquo;s guide for Edmonton' },
    'EQ3': { slug: 'eq3-sofa-review-edmonton', label: 'Read our full EQ3 buyer&rsquo;s guide for Edmonton' }
  };
}

// ── llms.txt: regenerate the sold-archive list ───────────────────────────
// The bullet list under "## Sold Inventory (Individual Archive Pages)"
// mirrors every soldItems entry carrying an href (§5.10), newest first —
// generated here so §8.3 has no manual llms.txt step to forget. The intro
// prose under the header and every other llms.txt section stay hand-authored.
function rebuildLlmsSoldSection() {
  var llmsPath = path.join(ROOT, 'llms.txt');
  if (!fs.existsSync(llmsPath)) return 0;
  var txt = fs.readFileSync(llmsPath, 'utf8');
  var header = '## Sold Inventory (Individual Archive Pages)';
  var start = txt.indexOf(header);
  if (start === -1) return 0;
  var next = txt.indexOf('\n## ', start + header.length);
  var end = next === -1 ? txt.length : next + 1;
  var section = txt.slice(start, end);
  var firstBullet = section.indexOf('\n- ');
  var intro = firstBullet === -1 ? section.replace(/\s+$/, '') + '\n\n' : section.slice(0, firstBullet + 1);
  var stubs = soldItems.filter(function (s) { return s.href; });
  var bullets = stubs.map(function (s) {
    var label = (s.brand + ' ' + s.title).replace(/\s+—\s+/g, ', ');
    return '- ' + label + ' (sold): ' + BASE_URL.replace(/\/$/, '') + s.href;
  }).join('\n');
  var out = txt.slice(0, start) + intro + bullets + '\n\n' + txt.slice(end);
  if (out !== txt) fs.writeFileSync(llmsPath, out, 'utf8');
  return stubs.length;
}
var llmsSoldCount = rebuildLlmsSoldSection();

// ── llms.txt: regenerate the available-inventory list ────────────────────
// Same pattern as the sold list: the bullet list under "## Available
// Inventory (Live Listings)" mirrors every live availableItems entry
// (coming-soon excluded) with its current asking price, so llms.txt always
// matches the homepage — prices stay current through every reprice with no
// manual step. The intro prose stays hand-authored.
function rebuildLlmsAvailableSection() {
  var llmsPath = path.join(ROOT, 'llms.txt');
  if (!fs.existsSync(llmsPath)) return 0;
  var txt = fs.readFileSync(llmsPath, 'utf8');
  var header = '## Available Inventory (Live Listings)';
  var start = txt.indexOf(header);
  if (start === -1) return 0;
  var next = txt.indexOf('\n## ', start + header.length);
  var end = next === -1 ? txt.length : next + 1;
  var section = txt.slice(start, end);
  var firstBullet = section.indexOf('\n- ');
  var intro = firstBullet === -1 ? section.replace(/\s+$/, '') + '\n\n' : section.slice(0, firstBullet + 1);
  var live = availableItems.filter(function (i) { return !i.comingSoon; });
  var bullets = live.map(function (i) {
    var label = (i.brand + ' ' + i.title).replace(/\s+—\s+/g, ', ');
    var slug = i.slug || slugify(i.brand + '-' + i.title);
    return '- ' + label + ': ' + formatPriceCAD(i.price) + ' — ' + BASE_URL + 'listings/' + slug + '/';
  }).join('\n');
  var out = txt.slice(0, start) + intro + bullets + '\n\n' + txt.slice(end);
  if (out !== txt) fs.writeFileSync(llmsPath, out, 'utf8');
  return live.length;
}
var llmsAvailableCount = rebuildLlmsAvailableSection();

var COLLIN_ID = 'https://edmontonrefreshed.com/about/#collin';

function extractJsonLd(html) {
  var out = [];
  var re = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g;
  var m;
  while ((m = re.exec(html))) {
    var raw = m[1].trim();
    if (!raw) continue;
    try { out.push(JSON.parse(raw)); } catch (e) { /* unparseable / templated — skip */ }
  }
  return out;
}

function walkNodes(node, cb) {
  if (Array.isArray(node)) {
    for (var i = 0; i < node.length; i++) walkNodes(node[i], cb);
  } else if (node && typeof node === 'object') {
    cb(node);
    for (var k in node) {
      if (Object.prototype.hasOwnProperty.call(node, k)) walkNodes(node[k], cb);
    }
  }
}

function typeIncludes(node, t) {
  var ty = node['@type'];
  return ty === t || (Array.isArray(ty) && ty.indexOf(t) !== -1);
}

// Re-read final on-disk content for every walked HTML file (post-injection).
var auditFiles = partialFiles.map(function(p) {
  return { rel: path.relative(ROOT, p).split(path.sep).join('/'), html: fs.readFileSync(p, 'utf8') };
});

// (a) Owner @id integrity — HARD FAIL if referenced but undefined on About.
var ownerDefined = false;
auditFiles.forEach(function(f) {
  if (f.rel !== 'about/index.html') return;
  extractJsonLd(f.html).forEach(function(doc) {
    walkNodes(doc, function(n) {
      if (typeIncludes(n, 'Person') && n['@id'] === COLLIN_ID) ownerDefined = true;
    });
  });
});
var ownerRefs = auditFiles.filter(function(f) {
  return f.rel !== 'about/index.html' && f.html.indexOf(COLLIN_ID) !== -1;
}).map(function(f) { return f.rel; });
var ownerDangling = ownerRefs.length > 0 && !ownerDefined;

// (b) sameAs drift — WARN if any schema's sameAs differs from config.sameAs.
var canonSameAs = (site.sameAs || []).slice().sort();
function arraysEqual(a, b) {
  if (a.length !== b.length) return false;
  for (var i = 0; i < a.length; i++) { if (a[i] !== b[i]) return false; }
  return true;
}
var sameAsDrift = [];
auditFiles.forEach(function(f) {
  extractJsonLd(f.html).forEach(function(doc) {
    walkNodes(doc, function(n) {
      if (!n.sameAs) return;
      var arr = (Array.isArray(n.sameAs) ? n.sameAs.slice() : [n.sameAs]).sort();
      if (!arraysEqual(arr, canonSameAs) && sameAsDrift.indexOf(f.rel) === -1) {
        sameAsDrift.push(f.rel);
      }
    });
  });
});

// (b2) logo drift — WARN if any schema `logo` (bare URL or ImageObject.url),
// e.g. Organization / FurnitureStore / LocalBusiness or a guide
// publisher.logo, differs from config.logo. Keeps one consistent logo for the
// entity in the Knowledge Graph (mirrors the sameAs check). See CLAUDE.md §5.4.
var canonLogo = site.logo || '';
var logoDrift = [];
auditFiles.forEach(function(f) {
  extractJsonLd(f.html).forEach(function(doc) {
    walkNodes(doc, function(n) {
      if (!n || !n.logo) return;
      var url = (typeof n.logo === 'string') ? n.logo : n.logo.url;
      if (url && url !== canonLogo && logoDrift.indexOf(f.rel) === -1) {
        logoDrift.push(f.rel);
      }
    });
  });
});

// (c) Guide Article/author coverage — WARN on any guide article missing either.
var guideGaps = [];
auditFiles.forEach(function(f) {
  if (f.rel.indexOf('guides/') !== 0 || f.rel.slice(-11) !== '/index.html') return;
  if (f.rel === 'guides/index.html') return; // landing page is a CollectionPage, not an Article
  // Redirect stubs (meta-refresh to another guide) carry no Article by design —
  // skip them so the gap check only flags real articles that are missing one.
  if (/<meta[^>]+http-equiv=["']?refresh/i.test(f.html)) return;
  var hasArticle = false, hasAuthor = false;
  extractJsonLd(f.html).forEach(function(doc) {
    walkNodes(doc, function(n) {
      if (typeIncludes(n, 'Article') || typeIncludes(n, 'BlogPosting') || typeIncludes(n, 'NewsArticle')) {
        hasArticle = true;
        if (n.author) hasAuthor = true;
      }
    });
  });
  if (!hasArticle || !hasAuthor) {
    guideGaps.push(f.rel + (!hasArticle ? ' [no Article]' : '') + (hasArticle && !hasAuthor ? ' [no author]' : ''));
  }
});

// (d) brandGuideMap coverage — WARN when a published brand-review guide has
//     no map entry (the listing→guide cross-link would silently never render). §5.8.
var mappedGuideSlugs = (function () {
  var map = getBrandGuideMap(), out = [];
  for (var k in map) { if (out.indexOf(map[k].slug) === -1) out.push(map[k].slug); }
  return out;
})();
var unmappedReviewGuides = fs.readdirSync(path.join(ROOT, 'guides'), { withFileTypes: true })
  .filter(function (e) { return e.isDirectory() && /-sofa-review-edmonton$/.test(e.name); })
  .map(function (e) { return e.name; })
  .filter(function (slug) { return mappedGuideSlugs.indexOf(slug) === -1; });

// (e) §5.5 metaTitle formula — WARN when an active listing's metaTitle drops
//     the transactional "for Sale in Edmonton" phrase.
var metaTitleGaps = availableItems.filter(function (i) {
  return !i.comingSoon && !/for Sale in Edmonton/.test(i.metaTitle || '');
}).map(function (i) { return i.slug || slugify(i.brand + '-' + i.title); });

// (f) llms.txt coverage — WARN when a hand-added core page or a live guide is
//     missing from llms.txt (the class of gap that left /partners/ unlisted).
var llmsAuditText = fs.existsSync(path.join(ROOT, 'llms.txt'))
  ? fs.readFileSync(path.join(ROOT, 'llms.txt'), 'utf8') : '';
var llmsGaps = [];
['partners/', 'sell/what-we-buy/'].forEach(function (p) {
  if (llmsAuditText.indexOf(BASE_URL + p) === -1) llmsGaps.push('/' + p);
});
auditFiles.forEach(function (f) {
  if (f.rel.indexOf('guides/') !== 0 || f.rel === 'guides/index.html' || f.rel.slice(-11) !== '/index.html') return;
  if (/<meta[^>]+http-equiv=["']?refresh/i.test(f.html)) return;
  var rel = f.rel.slice(0, -'index.html'.length);
  if (llmsAuditText.indexOf(BASE_URL + rel) === -1) llmsGaps.push('/' + rel);
});

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
console.log('  merchant-feed   — ' + merchantFeedStats.items + ' product(s) in /merchant-feed.xml');
console.log('  partials        — ' + partialUpdated + ' HTML files updated');
console.log('  sold cards      — ' + soldCardRelinks + ' card link(s) point to sold stubs');

// Entity-integrity report.
if (ownerDangling) {
  console.log('  entity          — FAIL: ' + ownerRefs.length + ' page(s) reference owner @id ' + COLLIN_ID + ' but about/index.html does not define it');
  ownerRefs.forEach(function(r) { console.log('                    · ' + r); });
} else {
  console.log('  entity          — owner @id ' + (ownerDefined ? 'defined on /about/' : 'not referenced') + '; ' + ownerRefs.length + ' referencing page(s) resolve OK');
}
if (sameAsDrift.length) {
  console.log('  sameAs WARN     — ' + sameAsDrift.length + ' file(s) differ from config.sameAs [' + canonSameAs.join(', ') + ']:');
  sameAsDrift.forEach(function(r) { console.log('                    · ' + r); });
} else {
  console.log('  sameAs          — all schemas match config.sameAs');
}
if (logoDrift.length) {
  console.log('  logo WARN       — ' + logoDrift.length + ' file(s) differ from config.logo (' + canonLogo + '):');
  logoDrift.forEach(function(r) { console.log('                    · ' + r); });
} else {
  console.log('  logo            — all schema logos match config.logo');
}
if (guideGaps.length) {
  console.log('  guides WARN     — ' + guideGaps.length + ' article(s) missing Article schema or author:');
  guideGaps.forEach(function(g) { console.log('                    · ' + g); });
} else {
  console.log('  guides          — all articles carry Article schema + author');
}
if (unmappedReviewGuides.length) {
  console.log('  guide-map WARN  — review guide(s) missing from brandGuideMap: ' + unmappedReviewGuides.join(', '));
} else {
  console.log('  guide-map       — every brand-review guide has a listing cross-link entry');
}
if (metaTitleGaps.length) {
  console.log('  metaTitle WARN  — active listing(s) missing "for Sale in Edmonton": ' + metaTitleGaps.join(', '));
} else {
  console.log('  metaTitle       — all active listings follow the §5.5 title formula');
}
if (llmsGaps.length) {
  console.log('  llms WARN       — missing from llms.txt: ' + llmsGaps.join(', '));
} else {
  console.log('  llms.txt        — sold list (' + llmsSoldCount + ' stubs) + available list (' + llmsAvailableCount + ' live) regenerated; core pages + guides all listed');
}

if (ownerDangling) {
  console.error('\nBuild FAILED entity-integrity check (dangling owner @id). See above.');
  process.exitCode = 1;
}
