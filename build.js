// ═══════════════════════════════════════════════════════════
//  BUILD SCRIPT
//
//  Reads JS data files and:
//    1. Injects static fallback HTML into index.html and sold/index.html
//       so crawlers see content without JS.
//    2. Injects static Product schema <script> blocks into index.html <head>.
//    3. Generates individual listing pages at /listings/[slug]/index.html
//       for each available (non-coming-soon) item.
//    4. Rewrites sitemap.xml with lastmod dates and all page URLs.
//
//  Usage:  node build.js
//  Deps:   none (Node.js built-ins only)
// ═══════════════════════════════════════════════════════════

var fs   = require('fs');
var path = require('path');

var ROOT = __dirname;


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
      : '            <div class="card-price">' + escapeHtml(item.price) + '</div>';

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
  var BASE_URL       = 'https://edmonton-refreshed.com/';
  var validUntilDate = new Date();
  validUntilDate.setDate(validUntilDate.getDate() + 90);
  var priceValidUntil = validUntilDate.toISOString().split('T')[0];

  var blocks = [];

  items.forEach(function(item) {
    if (item.comingSoon) return;

    var slug       = item.slug || slugify(item.brand + '-' + item.title);
    var listingUrl = BASE_URL + 'listings/' + slug + '/';
    var numericPrice = item.price.replace(/[^0-9.]/g, '');
    var imageUrl     = (item.images && item.images.length > 0)
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
        "price": numericPrice,
        "priceValidUntil": priceValidUntil,
        "availability": "https://schema.org/InStock",
        "url": listingUrl,
        "hasMerchantReturnPolicy": {
          "@type": "MerchantReturnPolicy",
          "applicableCountry": "CA",
          "returnPolicyCategory": "https://schema.org/MerchantReturnNotPermitted"
        },
        "shippingDetails": {
          "@type": "OfferShippingDetails",
          "shippingRate": {
            "@type": "MonetaryAmount",
            "value": "200",
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

function generateListingPage(item, slug) {
  var BASE_URL       = 'https://edmonton-refreshed.com/';
  var listingUrl     = BASE_URL + 'listings/' + slug + '/';
  var validUntilDate = new Date();
  validUntilDate.setDate(validUntilDate.getDate() + 90);
  var priceValidUntil = validUntilDate.toISOString().split('T')[0];
  var numericPrice    = item.price.replace(/[^0-9.]/g, '');
  var imageUrl        = (item.images && item.images.length > 0)
    ? BASE_URL + item.images[0]
    : BASE_URL + 'images/og-preview.png';

  // Extract SKU from image folder name (e.g., "images/BB-030/..." → "BB-030")
  var listingSku = (item.images && item.images.length > 0)
    ? item.images[0].split('/')[1]
    : null;

  var productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": item.brand + ' ' + item.title,
    "description": item.description,
    "brand": { "@type": "Brand", "name": item.brand },
    "image": imageUrl,
    "itemCondition": "https://schema.org/UsedCondition",
    "offers": {
      "@type": "Offer",
      "priceCurrency": "CAD",
      "price": numericPrice,
      "priceValidUntil": priceValidUntil,
      "availability": "https://schema.org/InStock",
      "url": listingUrl,
      "hasMerchantReturnPolicy": {
        "@type": "MerchantReturnPolicy",
        "applicableCountry": "CA",
        "returnPolicyCategory": "https://schema.org/MerchantReturnNotPermitted"
      },
      "shippingDetails": {
        "@type": "OfferShippingDetails",
        "shippingRate": {
          "@type": "MonetaryAmount",
          "value": "200",
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

  // Image prefix: listing page is at /listings/[slug]/, images are at root /images/
  var imgPrefix = '../../';
  var carouselHTML = (item.images && item.images.length > 0)
    ? buildCarouselHTML(item.images, item.brand + ' ' + item.title, imgPrefix)
    : '<div class="card-image-placeholder">Photos coming soon</div>';

  var specsHTML = item.specs.map(function(s) {
    return '<span class="spec-tag">' + escapeHtml(s) + '</span>';
  }).join('');

  // Description collapsible section (open by default)
  var descriptionHTML = '<details class="listing-collapsible" open><summary class="listing-meta-label">Description</summary><p class="listing-description">' + escapeHtml(item.description) + '</p></details>';

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

  // Retail value pill — split "X | Y" into two-part badge; fall back to plain text
  var retailHTML = '';
  if (item.retailCompare) {
    var pillParts = item.retailCompare.split(' | ');
    if (pillParts.length === 2) {
      retailHTML = '<div class="listing-value-pill"><span class="pill-retail">' + escapeHtml(pillParts[0]) + '</span><span class="pill-now">' + escapeHtml(pillParts[1]) + '</span></div>';
    } else {
      retailHTML = '<div class="listing-retail-compare">' + escapeHtml(item.retailCompare) + '</div>';
    }
  }

  var titleTag    = escapeHtml(item.brand) + ' ' + escapeHtml(item.title) + ' in Edmonton | Edmonton Refreshed';
  // SEO-optimized meta description: price, condition, city, then first sentence of description
  var condSpec    = (item.specs || []).filter(function(s) { return /condition/i.test(s); })[0];
  var condition   = condSpec || ((item.specs && item.specs.length > 0) ? item.specs[item.specs.length - 1] : '');
  var firstSentence = item.description.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim().split(/\.(?:\s|$)/)[0];
  var rawDesc     = item.brand + ' ' + item.title + ' — ' + item.price + ' — ' + condition + '. Pre-owned, professionally inspected, available in Edmonton. ' + firstSentence + '.';
  if (rawDesc.length > 160) {
    rawDesc = rawDesc.substring(0, 160).replace(/\s+\S*$/, '') + '…';
  }
  var metaDesc    = escapeHtml(rawDesc);
  var ogImageUrl  = imageUrl;

  return '<!DOCTYPE html>\n' +
'<html lang="en">\n' +
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
'  <link rel="preconnect" href="https://fonts.googleapis.com">\n' +
'  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n' +
'  <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Playfair+Display:wght@400;500&display=swap" onload="this.onload=null;this.rel=\'stylesheet\'">\n' +
'  <noscript><link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Playfair+Display:wght@400;500&display=swap" rel="stylesheet"></noscript>\n' +
'  <link rel="preload" as="image" imagesrcset="' + (item.images && item.images.length > 0 ? avifSrcsetFor(item.images[0], '../../') : '') + '" imagesizes="(max-width: 768px) 100vw, 550px" fetchpriority="high" type="image/avif">\n' +
'  <link rel="stylesheet" href="../../css/styles.min.css?v=26">\n' +
'  <meta name="theme-color" content="#2c2c2c">\n' +
'</head>\n' +
'<body>\n' +
'\n' +
'  <a href="#main-content" class="skip-link">Skip to main content</a>\n' +
'\n' +
'  <!-- ── Navigation ── -->\n' +
'  <nav class="nav">\n' +
'    <div class="nav-inner">\n' +
'      <a href="/" class="nav-logo">Edmonton Refreshed</a>\n' +
'      <ul class="nav-links" id="navLinks">\n' +
'        <li><a href="/" data-page="available">Available</a></li>\n' +
'        <li><a href="/sold/" data-page="sold">Sold</a></li>\n' +
'        <li><a href="/sell/" data-page="sell">Sell Your Furniture</a></li>\n' +
'        <li><a href="/guides/" data-page="guides">Guides</a></li>\n' +
'        <li><a href="/about/" data-page="about">About</a></li>\n' +
'        <li class="nav-phone-mobile"><a href="tel:7809651477">780-965-1477</a></li>\n' +
'      </ul>\n' +
'      <div class="nav-contact">\n' +
'        <a href="tel:7809651477">780-965-1477</a>\n' +
'      </div>\n' +
'      <button class="nav-toggle" id="navToggle" aria-label="Menu" aria-expanded="false">\n' +
'        <span></span><span></span><span></span>\n' +
'      </button>\n' +
'    </div>\n' +
'  </nav>\n' +
'\n' +
'  <div class="credibility-strip">\n' +
'    <span>We Deliver Anywhere in Edmonton and the Surrounding Area</span>\n' +
'  </div>\n' +
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
'            <div class="listing-price">' + escapeHtml(item.price) + '</div>\n' +
'            <div class="listing-ctas">\n' +
'              <a class="listing-cta" href="sms:7809651477">Text to Secure &rarr;</a>\n' +
'              <a class="listing-cta listing-cta--secondary" href="tel:7809651477">Call 780-965-1477</a>\n' +
'            </div>\n' +
'            <div class="listing-specs">' + specsHTML + '</div>\n' +
'            ' + descriptionHTML + '\n' +
(featuresHTML    ? '            ' + featuresHTML    + '\n' : '') +
(conditionHTML   ? '            ' + conditionHTML   + '\n' : '') +
(configHTML      ? '            ' + configHTML      + '\n' : '') +
'            <a class="listing-back" href="/">&larr; All Available Pieces</a>\n' +
'          </div>\n' +
'        </div>\n' +
'      </div>\n' +
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
'    <a href="sms:7809651477" class="sticky-cta-primary">Text to Secure &rarr; ' + escapeHtml(item.price) + '</a>\n' +
'    <a href="tel:7809651477" class="sticky-cta-secondary">Call</a>\n' +
'  </div>\n' +
'\n' +
'  <footer>\n' +
'    <p>&copy; 2026 Edmonton Refreshed Seating</p>\n' +
'    <p>Serving Edmonton, Alberta and surrounding areas</p>\n' +
'    <p><a href="/privacy/">Privacy Policy</a></p>\n' +
'  </footer>\n' +
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
'  <script src="../../js/shared.min.js?v=26"></script>\n' +
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


// ── Sitemap generator ────────────────────────────────────

function generateSitemap(items) {
  var d = today();
  var lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    '  <url>',
    '    <loc>https://edmonton-refreshed.com/</loc>',
    '    <lastmod>' + d + '</lastmod>',
    '    <changefreq>weekly</changefreq>',
    '    <priority>1.0</priority>',
    '  </url>',
    '  <url>',
    '    <loc>https://edmonton-refreshed.com/sold/</loc>',
    '    <lastmod>' + d + '</lastmod>',
    '    <changefreq>weekly</changefreq>',
    '    <priority>0.8</priority>',
    '  </url>',
    '  <url>',
    '    <loc>https://edmonton-refreshed.com/sell/</loc>',
    '    <lastmod>' + d + '</lastmod>',
    '    <changefreq>monthly</changefreq>',
    '    <priority>0.7</priority>',
    '  </url>',
    '  <url>',
    '    <loc>https://edmonton-refreshed.com/about/</loc>',
    '    <lastmod>' + d + '</lastmod>',
    '    <changefreq>monthly</changefreq>',
    '    <priority>0.6</priority>',
    '  </url>',
    '  <url>',
    '    <loc>https://edmonton-refreshed.com/privacy/</loc>',
    '    <lastmod>' + d + '</lastmod>',
    '    <changefreq>yearly</changefreq>',
    '    <priority>0.3</priority>',
    '  </url>',
  '  <url>',
    '    <loc>https://edmonton-refreshed.com/guides/</loc>',
    '    <lastmod>' + d + '</lastmod>',
    '    <changefreq>weekly</changefreq>',
    '    <priority>0.7</priority>',
    '  </url>',
    '  <url>',
    '    <loc>https://edmonton-refreshed.com/guides/how-to-tell-if-your-sofa-is-high-quality-edmonton/</loc>',
    '    <lastmod>' + d + '</lastmod>',
    '    <changefreq>monthly</changefreq>',
    '    <priority>0.8</priority>',
    '  </url>',
    '  <url>',
    '    <loc>https://edmonton-refreshed.com/guides/what-condition-means-furniture-grading-edmonton/</loc>',
    '    <lastmod>' + d + '</lastmod>',
    '    <changefreq>monthly</changefreq>',
    '    <priority>0.8</priority>',
    '  </url>',
    '  <url>',
    '    <loc>https://edmonton-refreshed.com/guides/moving-edmonton-furniture-keep-sell-replace/</loc>',
    '    <lastmod>' + d + '</lastmod>',
    '    <changefreq>monthly</changefreq>',
    '    <priority>0.8</priority>',
    '  </url>',
    '  <url>',
    '    <loc>https://edmonton-refreshed.com/guides/best-sofa-brands-resale-value-edmonton/</loc>',
    '    <lastmod>' + d + '</lastmod>',
    '    <changefreq>monthly</changefreq>',
    '    <priority>0.8</priority>',
    '  </url>',
    '  <url>',
    '    <loc>https://edmonton-refreshed.com/guides/facebook-marketplace-sofa-vs-curated-reseller/</loc>',
    '    <lastmod>' + d + '</lastmod>',
    '    <changefreq>monthly</changefreq>',
    '    <priority>0.8</priority>',
    '  </url>',
    '  <url>',
    '    <loc>https://edmonton-refreshed.com/guides/selling-furniture-facebook-marketplace-edmonton/</loc>',
    '    <lastmod>' + d + '</lastmod>',
    '    <changefreq>monthly</changefreq>',
    '    <priority>0.8</priority>',
    '  </url>',
    '  <url>',
    '    <loc>https://edmonton-refreshed.com/guides/how-to-buy-used-sofa-edmonton/</loc>',
    '    <lastmod>' + d + '</lastmod>',
    '    <changefreq>monthly</changefreq>',
    '    <priority>0.8</priority>',
    '  </url>',
    '  <url>',
    '    <loc>https://edmonton-refreshed.com/guides/natuzzi-sofa-review-edmonton/</loc>',
    '    <lastmod>' + d + '</lastmod>',
    '    <changefreq>monthly</changefreq>',
    '    <priority>0.8</priority>',
    '  </url>',
    '  <url>',
    '    <loc>https://edmonton-refreshed.com/guides/edmonton-furniture-consignment-resale-guide/</loc>',
    '    <lastmod>' + d + '</lastmod>',
    '    <changefreq>monthly</changefreq>',
    '    <priority>0.8</priority>',
    '  </url>',
    '  <url>',
    '    <loc>https://edmonton-refreshed.com/guides/sectional-sofa-cost-edmonton/</loc>',
    '    <lastmod>' + d + '</lastmod>',
    '    <changefreq>monthly</changefreq>',
    '    <priority>0.8</priority>',
    '  </url>',
    '  <url>',
    '    <loc>https://edmonton-refreshed.com/guides/how-to-measure-sectional-sofa-edmonton/</loc>',
    '    <lastmod>' + d + '</lastmod>',
    '    <changefreq>monthly</changefreq>',
    '    <priority>0.8</priority>',
    '  </url>',
    '  <url>',
    '    <loc>https://edmonton-refreshed.com/guides/who-buys-used-couches-edmonton/</loc>',
    '    <lastmod>' + d + '</lastmod>',
    '    <changefreq>monthly</changefreq>',
    '    <priority>0.8</priority>',
    '  </url>',
    '  <url>',
    '    <loc>https://edmonton-refreshed.com/guides/used-sofa-couch-value-edmonton/</loc>',
    '    <lastmod>' + d + '</lastmod>',
    '    <changefreq>monthly</changefreq>',
    '    <priority>0.8</priority>',
    '  </url>',
    '  <url>',
    '    <loc>https://edmonton-refreshed.com/guides/selling-sectional-sofa-edmonton/</loc>',
    '    <lastmod>' + d + '</lastmod>',
    '    <changefreq>monthly</changefreq>',
    '    <priority>0.8</priority>',
    '  </url>',
    '  <url>',
    '    <loc>https://edmonton-refreshed.com/guides/selling-furniture-before-moving-edmonton/</loc>',
    '    <lastmod>' + d + '</lastmod>',
    '    <changefreq>monthly</changefreq>',
    '    <priority>0.8</priority>',
    '  </url>',
    '  <url>',
    '    <loc>https://edmonton-refreshed.com/guides/selling-inherited-estate-furniture-edmonton/</loc>',
    '    <lastmod>' + d + '</lastmod>',
    '    <changefreq>monthly</changefreq>',
    '    <priority>0.8</priority>',
    '  </url>',
    '  <url>',
    '    <loc>https://edmonton-refreshed.com/guides/selling-loveseat-sofa-set-edmonton/</loc>',
    '    <lastmod>' + d + '</lastmod>',
    '    <changefreq>monthly</changefreq>',
    '    <priority>0.8</priority>',
    '  </url>',
    '  <url>',
    '    <loc>https://edmonton-refreshed.com/guides/selling-modular-sectional-edmonton/</loc>',
    '    <lastmod>' + d + '</lastmod>',
    '    <changefreq>monthly</changefreq>',
    '    <priority>0.8</priority>',
    '  </url>',
    '  <url>',
    '    <loc>https://edmonton-refreshed.com/guides/selling-u-shaped-sectional-edmonton/</loc>',
    '    <lastmod>' + d + '</lastmod>',
    '    <changefreq>monthly</changefreq>',
    '    <priority>0.8</priority>',
    '  </url>',
    '  <url>',
    '    <loc>https://edmonton-refreshed.com/guides/selling-l-shaped-sectional-edmonton/</loc>',
    '    <lastmod>' + d + '</lastmod>',
    '    <changefreq>monthly</changefreq>',
    '    <priority>0.8</priority>',
    '  </url>',
    '  <url>',
    '    <loc>https://edmonton-refreshed.com/guides/selling-fabric-boucle-velvet-sofa-edmonton/</loc>',
    '    <lastmod>' + d + '</lastmod>',
    '    <changefreq>monthly</changefreq>',
    '    <priority>0.8</priority>',
    '  </url>',
    '  <url>',
    '    <loc>https://edmonton-refreshed.com/guides/selling-leather-sofa-sectional-edmonton/</loc>',
    '    <lastmod>' + d + '</lastmod>',
    '    <changefreq>monthly</changefreq>',
    '    <priority>0.8</priority>',
    '  </url>',
  ];

  items.forEach(function(item) {
    if (item.comingSoon) return;
    var slug = item.slug || slugify(item.brand + '-' + item.title);
    lines.push(
      '  <url>',
      '    <loc>https://edmonton-refreshed.com/listings/' + slug + '/</loc>',
      '    <lastmod>' + d + '</lastmod>',
      '    <changefreq>weekly</changefreq>',
      '    <priority>0.9</priority>',
      '  </url>'
    );
  });

  lines.push('</urlset>');
  return lines.join('\n') + '\n';
}


// ── Main ─────────────────────────────────────────────────

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

fs.writeFileSync(indexPath, indexContent, 'utf8');

// ── 2. Update sold/index.html ────────────────────────
var soldPath    = path.join(ROOT, 'sold', 'index.html');
var soldContent = fs.readFileSync(soldPath, 'utf8');

soldContent = injectIntoContainer(soldContent, 'sold-grid', soldHTML);

fs.writeFileSync(soldPath, soldContent, 'utf8');

// ── 3. Generate individual listing pages ─────────────
var listingsDir = path.join(ROOT, 'listings');
if (!fs.existsSync(listingsDir)) fs.mkdirSync(listingsDir);

var listingCount = 0;
availableItems.forEach(function(item) {
  if (item.comingSoon) return;

  var slug       = item.slug || slugify(item.brand + '-' + item.title);
  var itemDir    = path.join(listingsDir, slug);
  if (!fs.existsSync(itemDir)) fs.mkdirSync(itemDir);

  var html = generateListingPage(item, slug);
  fs.writeFileSync(path.join(itemDir, 'index.html'), html, 'utf8');
  listingCount++;
});

// ── 4. Rewrite sitemap.xml ───────────────────────────
var sitemapPath = path.join(ROOT, 'sitemap.xml');
fs.writeFileSync(sitemapPath, generateSitemap(availableItems), 'utf8');

// ── 5. Minify JS files ──────────────────────────────
//  Simple minification: strip comments, collapse whitespace, trim lines.
function minifyJS(src) {
  // Strip single-line comments but not :// inside strings (e.g. https://)
  return src
    .replace(/(?<![:'"])\/\/[^\n]*/g, '')  // strip // comments, skip ://, '//', "//"]
    .replace(/\/\*[\s\S]*?\*\//g, '')      // strip multi-line comments
    .replace(/\n\s*\n/g, '\n')             // collapse blank lines
    .split('\n').map(function(l) { return l.trim(); }).filter(Boolean).join('\n');
}

var jsFiles = ['shared.js', 'available-data.js', 'sold-data.js', 'reviews-data.js'];
var jsMinCount = 0;
jsFiles.forEach(function(file) {
  var srcPath = path.join(ROOT, 'js', file);
  if (!fs.existsSync(srcPath)) return;
  var minPath = path.join(ROOT, 'js', file.replace('.js', '.min.js'));
  var content = fs.readFileSync(srcPath, 'utf8');
  fs.writeFileSync(minPath, minifyJS(content), 'utf8');
  jsMinCount++;
});

// ── Summary ──────────────────────────────────────────
console.log('Build complete:');
console.log('  index.html      — ' + availableItems.length + ' available items, ' + reviews.length + ' reviews, ' + availableItems.filter(function(i) { return !i.comingSoon; }).length + ' product schemas');
console.log('  sold/index.html — ' + soldItems.length + ' sold items');
console.log('  listings/       — ' + listingCount + ' individual listing pages generated');
console.log('  sitemap.xml     — updated with lastmod ' + today());
console.log('  js/             — ' + jsMinCount + ' JS files minified');
