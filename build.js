// ═══════════════════════════════════════════════════════════
//  BUILD SCRIPT
//
//  Reads JS data files and injects static fallback HTML
//  into the HTML pages so crawlers see content without JS.
//
//  Usage:  node build.js
//  Deps:   none (Node.js built-ins only)
// ═══════════════════════════════════════════════════════════

var fs = require('fs');
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

function extractArray(src, varName) { return extractVar(src, varName, '[', ']'); }
function extractObject(src, varName) { return extractVar(src, varName, '{', '}'); }


// ── HTML generators ──────────────────────────────────────

function generateAvailableHTML(items) {
  if (items.length === 0) return '';

  var lines = ['        <!-- Static fallback for crawlers; JS replaces this on load -->'];

  items.forEach(function(item, idx) {
    var imgSrc = (item.images && item.images.length > 0) ? item.images[0] : '';
    var alt = escapeHtml(item.brand + ' ' + item.title);
    var loading = idx === 0 ? 'eager' : 'lazy';
    var specs = item.specs.map(function(s) {
      return '<span class="spec-tag">' + escapeHtml(s) + '</span>';
    }).join('');

    var imgHtml = imgSrc
      ? '          <div class="card-image-placeholder"><img src="' + imgSrc + '" alt="' + alt + '" loading="' + loading + '"></div>'
      : '          <div class="card-image-placeholder">Photos coming soon</div>';

    var brandLine = item.comingSoon
      ? '            <div class="card-meta"><div class="card-brand">' + escapeHtml(item.brand) + '</div><span class="coming-soon-badge">Coming Soon</span></div>'
      : '            <div class="card-brand">' + escapeHtml(item.brand) + '</div>';

    var priceCta = item.comingSoon
      ? '            <div class="card-price card-price--muted">Listing coming soon</div>'
      : '            <div class="card-price">' + escapeHtml(item.price) + '</div>\n            <a class="card-cta" href="sms:7809651477">Contact to View &rarr;</a>';

    lines.push(
      '        <div class="card">',
      imgHtml,
      '          <div class="card-body">',
      brandLine,
      '            <div class="card-title">' + escapeHtml(item.title) + '</div>',
      '            <div class="card-description">' + escapeHtml(item.description) + '</div>',
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
    var imgSrc = (item.images && item.images.length > 0) ? item.images[0] : '';
    var alt = escapeHtml(item.brand + ' ' + item.title);
    var descLine = item.description
      ? '\n            <div class="card-description">' + escapeHtml(item.description) + '</div>'
      : '';

    lines.push(
      '        <div class="card sold">',
      '          <div class="card-image-placeholder"><img src="' + imgSrc + '" alt="' + alt + '" loading="lazy"></div>',
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
    var stars = '';
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
    var nextOpen = html.indexOf('<div', i);
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


// ── Main ─────────────────────────────────────────────────

var availableSrc = fs.readFileSync(path.join(ROOT, 'js', 'available-data.js'), 'utf8');
var soldSrc      = fs.readFileSync(path.join(ROOT, 'js', 'sold-data.js'), 'utf8');
var reviewsSrc   = fs.readFileSync(path.join(ROOT, 'js', 'reviews-data.js'), 'utf8');

var availableItems  = extractArray(availableSrc, 'availableItems');
var soldItems       = extractArray(soldSrc, 'soldItems');
var reviews         = extractArray(reviewsSrc, 'reviews');
var reviewAggregate = extractObject(reviewsSrc, 'reviewAggregate');

var availableHTML = generateAvailableHTML(availableItems);
var soldHTML      = generateSoldHTML(soldItems);
var reviewsHTML   = generateReviewsHTML(reviews, reviewAggregate);

var indexPath = path.join(ROOT, 'index.html');
var soldPath  = path.join(ROOT, 'sold', 'index.html');

var indexContent = fs.readFileSync(indexPath, 'utf8');
var soldContent  = fs.readFileSync(soldPath, 'utf8');

indexContent = injectIntoContainer(indexContent, 'available-grid', availableHTML);
indexContent = injectIntoContainer(indexContent, 'reviews-section', reviewsHTML);
soldContent  = injectIntoContainer(soldContent, 'sold-grid', soldHTML);

fs.writeFileSync(indexPath, indexContent, 'utf8');
fs.writeFileSync(soldPath, soldContent, 'utf8');

console.log('Build complete:');
console.log('  index.html      — ' + availableItems.length + ' available items, ' + reviews.length + ' reviews');
console.log('  sold/index.html — ' + soldItems.length + ' sold items');
