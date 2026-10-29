// ═══════════════════════════════════════════════════════════
//  CAROUSEL BUILDER
// ═══════════════════════════════════════════════════════════

var carouselId = 0;

// opts.deferSlides: emit slides after the first with data-src/data-srcset
// only, so they download when someone interacts with that carousel
// (hydrateCarousel) instead of all at once. Lazy loading alone does not stop
// them: off-screen slides sit inside the viewport's load margin. Used on /sold/.
function buildCarousel(images, alt, opts) {
  var id = 'carousel-' + (carouselId++);
  var count = images.length;
  var singleClass = count <= 1 ? ' single' : '';
  var defer = !!(opts && opts.deferSlides) && count > 1;

  var imgsHtml = images.map(function(src, i) {
    // Encode spaces: srcset splits on whitespace, so "Sold Inventory/" paths
    // otherwise void every candidate and the full-size JPEG loads instead.
    var base = src.replace(/\.jpeg$/, '').replace(/ /g, '%20');
    var srcset = base + '-400w.jpeg 400w, ' + base + '-800w.jpeg 800w, ' + base + '.jpeg 1200w';
    var webpSrcset = base + '-400w.webp 400w, ' + base + '-800w.webp 800w, ' + base + '.webp 1200w';
    var avifSrcset = base + '-400w.avif 400w, ' + base + '-800w.avif 800w, ' + base + '.avif 1200w';
    var loadAttr = i === 0 ? 'eager' : 'lazy';
    var fetchPri = i === 0 ? ' fetchpriority="high"' : '';
    var dims = i === 0 ? ' width="800" height="600"' : '';
    var pre = defer && i > 0 ? 'data-' : '';
    return '<picture><source type="image/avif" ' + pre + 'srcset="' + avifSrcset + '" sizes="(max-width: 768px) 100vw, 530px"><source type="image/webp" ' + pre + 'srcset="' + webpSrcset + '" sizes="(max-width: 768px) 100vw, 530px"><img ' + pre + 'src="' + src + '" ' + pre + 'srcset="' + srcset + '" sizes="(max-width: 768px) 100vw, 530px" alt="' + alt + ' — photo ' + (i+1) + '" loading="' + loadAttr + '"' + fetchPri + dims + ' draggable="false"></picture>';
  }).join('');

  var dotsHtml = images.map(function(_, i) {
    return '<button class="dot' + (i === 0 ? ' active' : '') + '" data-index="' + i + '" aria-label="Photo ' + (i+1) + '"></button>';
  }).join('');

  return '<div class="carousel' + singleClass + (defer ? ' carousel-deferred' : '') + '" id="' + id + '" data-index="0" data-count="' + count + '">' +
    '<div class="carousel-track">' + imgsHtml + '</div>' +
    '<button class="carousel-btn prev" aria-label="Previous photo">' +
      '<svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>' +
    '</button>' +
    '<button class="carousel-btn next" aria-label="Next photo">' +
      '<svg viewBox="0 0 24 24"><polyline points="9 6 15 12 9 18"/></svg>' +
    '</button>' +
    '<div class="carousel-counter">1 / ' + count + '</div>' +
    '<div class="carousel-dots">' + dotsHtml + '</div>' +
  '</div>';
}


// ═══════════════════════════════════════════════════════════
//  CAROUSEL INTERACTION
// ═══════════════════════════════════════════════════════════

// Swap a deferred carousel's data-src/data-srcset into place (once).
function hydrateCarousel(carousel) {
  if (!carousel || !carousel.classList.contains('carousel-deferred')) return;
  carousel.classList.remove('carousel-deferred');
  carousel.querySelectorAll('[data-srcset]').forEach(function(el) {
    el.srcset = el.dataset.srcset;
    el.removeAttribute('data-srcset');
  });
  carousel.querySelectorAll('img[data-src]').forEach(function(img) {
    img.loading = 'eager';
    img.src = img.dataset.src;
    img.removeAttribute('data-src');
  });
}

// Mouse over, touch, or keyboard focus on a carousel counts as interest:
// load its other photos so the next slide is ready when it is shown.
['pointerover', 'touchstart', 'focusin'].forEach(function(type) {
  document.addEventListener(type, function(e) {
    var c = e.target.closest && e.target.closest('.carousel-deferred');
    if (c) hydrateCarousel(c);
  }, { passive: true });
});

function goToSlide(carousel, index) {
  hydrateCarousel(carousel);
  var count = parseInt(carousel.dataset.count);
  if (index < 0) index = count - 1;
  if (index >= count) index = 0;

  carousel.dataset.index = index;
  var track = carousel.querySelector('.carousel-track');
  track.style.transform = 'translateX(-' + (index * 100) + '%)';

  carousel.querySelectorAll('.dot').forEach(function(d, i) {
    d.classList.toggle('active', i === index);
  });

  var counter = carousel.querySelector('.carousel-counter');
  if (counter) counter.textContent = (index + 1) + ' / ' + count;
}

// Delegate clicks for carousel arrows, dots, and images
var didSwipe = false;

document.addEventListener('click', function(e) {
  // If a swipe just happened, don't treat the click as a tap
  if (didSwipe) { didSwipe = false; return; }

  var btn = e.target.closest('.carousel-btn');
  if (btn) {
    e.stopPropagation();
    e.preventDefault();
    var carousel = btn.closest('.carousel');
    var current = parseInt(carousel.dataset.index);
    if (btn.classList.contains('prev')) goToSlide(carousel, current - 1);
    else goToSlide(carousel, current + 1);
    return;
  }

  var dot = e.target.closest('.dot');
  if (dot) {
    e.stopPropagation();
    e.preventDefault();
    var carousel = dot.closest('.carousel');
    goToSlide(carousel, parseInt(dot.dataset.index));
    return;
  }

  // Click on image — navigate to listing page on available cards, open lightbox elsewhere
  var img = e.target.closest('.carousel-track img');
  if (img) {
    var card = img.closest('.card');
    if (card) {
      var link = card.querySelector('.card-title-link');
      if (link) { window.location.href = link.href; return; }
      // Card without listing link (sold items) — open lightbox if available
    }
    var carousel = img.closest('.carousel');
    var images = Array.from(carousel.querySelectorAll('.carousel-track img')).map(function(i) { return i.src || i.dataset.src; });
    var index = parseInt(carousel.dataset.index);
    openLightbox(images, index);
  }
});

// ── Swipe engine (shared by carousels and lightbox) ──
var swipeAccum = 0;
var swipeLockUntil = 0;

function handleSwipe(dir, target) {
  var lb = document.getElementById('lightbox');
  if (lb && lb.classList.contains('open')) {
    lightboxNav(dir);
    return;
  }
  var carousel = target.closest('.carousel');
  if (carousel) {
    var current = parseInt(carousel.dataset.index);
    goToSlide(carousel, current + dir);
  }
}

document.addEventListener('wheel', function(e) {
  var lb = document.getElementById('lightbox');
  var isLightbox = lb && lb.classList.contains('open') && lb.contains(e.target);
  var isCarousel = e.target.closest('.carousel');
  if (!isLightbox && !isCarousel) return;
  if (Math.abs(e.deltaX) < Math.abs(e.deltaY)) return;
  e.preventDefault();
  var now = Date.now();
  if (now < swipeLockUntil) return;
  swipeAccum += e.deltaX;
  if (Math.abs(swipeAccum) > 10) {
    handleSwipe(swipeAccum > 0 ? 1 : -1, e.target);
    swipeAccum = 0;
    swipeLockUntil = now + 350;
  }
}, { passive: false });

// Touch swipe (finger on mobile / tablet) — works on carousels and lightbox
var touchStartX = 0;
var touchStartY = 0;
var touchTarget = null;

document.addEventListener('touchstart', function(e) {
  var lb = document.getElementById('lightbox');
  var isLightbox = lb && lb.classList.contains('open') && lb.contains(e.target);
  var isCarousel = e.target.closest('.carousel');
  if (!isLightbox && !isCarousel) return;
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
  touchTarget = e.target;
}, { passive: true });

document.addEventListener('touchend', function(e) {
  if (!touchTarget) return;
  var diffX = touchStartX - e.changedTouches[0].clientX;
  var diffY = touchStartY - e.changedTouches[0].clientY;
  if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
    handleSwipe(diffX > 0 ? 1 : -1, touchTarget);
    didSwipe = true;
  }
  touchTarget = null;
}, { passive: true });

// Keyboard navigation (carousels + lightbox)
document.addEventListener('keydown', function(e) {
  var lb = document.getElementById('lightbox');
  if (lb && lb.classList.contains('open')) {
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') lightboxNav(-1);
    if (e.key === 'ArrowRight') lightboxNav(1);
  }
});


// ═══════════════════════════════════════════════════════════
//  LIGHTBOX
// ═══════════════════════════════════════════════════════════

var lightboxImages = [];
var lightboxIndex = 0;

function openLightbox(images, index) {
  lightboxImages = images;
  lightboxIndex = index;
  var lb = document.getElementById('lightbox');
  var img = document.getElementById('lightbox-img');
  var counter = document.getElementById('lightbox-counter');
  if (!lb || !img) return;
  img.src = images[index];
  counter.textContent = (index + 1) + ' / ' + images.length;
  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  var lb = document.getElementById('lightbox');
  if (!lb) return;
  lb.classList.remove('open');
  document.body.style.overflow = '';
}

function lightboxNav(dir) {
  lightboxIndex += dir;
  if (lightboxIndex < 0) lightboxIndex = lightboxImages.length - 1;
  if (lightboxIndex >= lightboxImages.length) lightboxIndex = 0;
  var img = document.getElementById('lightbox-img');
  var counter = document.getElementById('lightbox-counter');
  if (img) img.src = lightboxImages[lightboxIndex];
  if (counter) counter.textContent = (lightboxIndex + 1) + ' / ' + lightboxImages.length;
}

// Lightbox event listeners (guarded — lightbox HTML not on every page)
var lightboxEl = document.getElementById('lightbox');
if (lightboxEl) {
  lightboxEl.addEventListener('click', function(e) {
    if (e.target === e.currentTarget || e.target.classList.contains('lightbox-close')) closeLightbox();
  });
  var prevBtn = document.querySelector('.lightbox-nav.prev');
  var nextBtn = document.querySelector('.lightbox-nav.next');
  if (prevBtn) prevBtn.addEventListener('click', function(e) { e.stopPropagation(); lightboxNav(-1); });
  if (nextBtn) nextBtn.addEventListener('click', function(e) { e.stopPropagation(); lightboxNav(1); });
}


// ═══════════════════════════════════════════════════════════
//  CONVERSION EVENT TRACKING
//  Fires GA4 events for contact link clicks.
//  gtag() is defined in the inline <head> snippet on each page.
// ═══════════════════════════════════════════════════════════

document.addEventListener('click', function(e) {
  var link = e.target.closest('a');
  if (!link || typeof gtag !== 'function') return;

  var href = link.getAttribute('href') || '';

  // Phone number click (nav bar)
  if (href.startsWith('tel:')) {
    gtag('event', 'phone_click', {
      event_category: 'contact',
      event_label: 'nav_phone'
    });
    return;
  }

  // SMS link click — differentiate nav vs listing CTA vs sell page
  if (href.startsWith('sms:')) {
    var label = 'sell_page_sms';
    if (link.closest('.nav-contact, .nav-phone-mobile')) label = 'nav_text';
    else if (link.closest('.card-cta, .card')) label = 'listing_cta';
    gtag('event', 'sms_click', {
      event_category: 'contact',
      event_label: label
    });
    return;
  }

  // Email link click (sell page)
  if (href.startsWith('mailto:')) {
    gtag('event', 'email_click', {
      event_category: 'contact',
      event_label: 'sell_page_email'
    });
    return;
  }
});


// ═══════════════════════════════════════════════════════════
//  MOBILE NAV
// ═══════════════════════════════════════════════════════════

var navToggle = document.getElementById('navToggle');
var navLinks = document.getElementById('navLinks');
if (navToggle && navLinks) {
  navToggle.addEventListener('click', function() {
    var isOpen = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });
}

// ═══════════════════════════════════════════════════════════
//  NAV DROPDOWN (Sell Your Furniture submenu)
//  Desktop opens on hover/focus-within via CSS; this script
//  drives the mobile/keyboard toggle and outside-click close.
// ═══════════════════════════════════════════════════════════

(function() {
  var dropdowns = document.querySelectorAll('.nav-dropdown');
  if (!dropdowns.length) return;

  function closeAll(except) {
    dropdowns.forEach(function(d) {
      if (d === except) return;
      d.setAttribute('data-open', 'false');
      var t = d.querySelector('.nav-dropdown-toggle');
      if (t) t.setAttribute('aria-expanded', 'false');
    });
  }

  dropdowns.forEach(function(d) {
    var toggle = d.querySelector('.nav-dropdown-toggle');
    if (!toggle) return;
    toggle.setAttribute('aria-expanded', 'false');
    d.setAttribute('data-open', 'false');

    toggle.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      var isOpen = d.getAttribute('data-open') === 'true';
      closeAll(d);
      d.setAttribute('data-open', isOpen ? 'false' : 'true');
      toggle.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
    });
  });

  document.addEventListener('click', function(e) {
    if (!e.target.closest('.nav-dropdown')) closeAll(null);
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeAll(null);
  });
})();


// ═══════════════════════════════════════════════════════════
//  ACTIVE NAV LINK DETECTION
// ═══════════════════════════════════════════════════════════

// Matched on the first path segment, not a substring: "/sell" also matched
// every /guides/selling-… guide, and pages outside the nav (partners, privacy,
// returns, 404) fell through to "Available". They now highlight nothing.
(function() {
  var segment = window.location.pathname.split('/')[1] || '';
  var page = {
    '': 'available', 'index.html': 'available', 'listings': 'available',
    'sold': 'sold', 'sell': 'sell', 'about': 'about', 'guides': 'guides'
  }[segment];
  if (!page) return;

  document.querySelectorAll('.nav-links a').forEach(function(a) {
    if (a.dataset.page === page) {
      a.classList.add('active');
    }
  });
})();


// ═══════════════════════════════════════════════════════════
//  NEWSLETTER FORM (Kit / ConvertKit)
// ═══════════════════════════════════════════════════════════

document.querySelectorAll('.newsletter-form').forEach(function(form) {
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    var email = form.querySelector('input[name="email_address"]');
    var btn = form.querySelector('button');
    var success = form.parentElement.querySelector('.newsletter-success');
    if (!email || !email.value) return;

    btn.textContent = 'Sending\u2026';
    btn.disabled = true;

    var data = new FormData();
    data.append('email_address', email.value);

    fetch('https://app.kit.com/forms/9233085/subscriptions', {
      method: 'POST',
      body: data,
      headers: { 'Accept': 'application/json' }
    }).then(function() {
      form.style.display = 'none';
      if (success) success.style.display = 'block';
      if (typeof gtag === 'function') {
        gtag('event', 'newsletter_signup', { event_category: 'engagement' });
      }
    }).catch(function() {
      btn.textContent = 'Subscribe';
      btn.disabled = false;
    });
  });
});


// ═══════════════════════════════════════════════════════════
//  RETAIL VALUE PILL — responsive placement
// ═══════════════════════════════════════════════════════════
//  Desktop: the pill sits in the heading row, beside the title (its authored
//  position). Mobile: it reads better stacked between the spec pills and the
//  description, so we relocate the single element there at <=768px. No-JS
//  crawlers keep the authored desktop position, which is fine — placement is
//  purely visual.

(function() {
  var pill = document.querySelector('.listing-heading-row .listing-value-pill');
  var body = document.querySelector('.listing-body');
  if (!pill || !body) return;
  var headingRow = pill.parentElement;
  var specs = body.querySelector('.listing-specs');
  if (!specs) return;
  var mq = window.matchMedia('(max-width: 768px)');

  function place() {
    if (mq.matches) {
      // Mobile: below the spec pills, above the description.
      if (specs.nextElementSibling !== pill) specs.insertAdjacentElement('afterend', pill);
    } else {
      // Desktop: back beside the title.
      if (pill.parentElement !== headingRow) headingRow.appendChild(pill);
    }
  }

  place();
  mq.addEventListener('change', place);
})();


// ═══════════════════════════════════════════════════════════
//  STICKY LISTING CTA — floats while reading, parks after the FAQ
// ═══════════════════════════════════════════════════════════
//  The bar is `position: fixed` (floating) by default. Once the sentinel —
//  placed in the document right above the bar, just below the FAQ — scrolls
//  up to or past the bottom of the viewport, we add `.parked`, dropping the
//  bar into normal flow so it sits under the FAQ and stops covering the
//  related links, newsletter, and footer below it.

(function() {
  var bar = document.querySelector('.listing-sticky-cta');
  var sentinel = document.querySelector('.listing-sticky-sentinel');
  if (!bar || !sentinel || !('IntersectionObserver' in window)) return;

  var link = bar.querySelector('a');
  var overForm = false;

  function update(top) {
    bar.classList.toggle('parked', top <= window.innerHeight);
    sync();
  }

  // Hidden from assistive tech and the tab order only while it is actually
  // slid away: floating over the viewing form. Parked, it is always shown.
  function sync() {
    var hidden = overForm && !bar.classList.contains('parked');
    bar.classList.toggle('over-form', overForm);
    bar.setAttribute('aria-hidden', hidden ? 'true' : 'false');
    if (link) link.tabIndex = hidden ? -1 : 0;
  }

  // IntersectionObserver fires on every crossing of the viewport edge and
  // reports the sentinel's current position, which is all we need to decide
  // whether the bar should float or park.
  var observer = new IntersectionObserver(function(entries) {
    update(entries[entries.length - 1].boundingClientRect.top);
  });
  observer.observe(sentinel);

  // Set the initial state (the observer's first callback also handles this,
  // but this guards against any timing edge on very short pages).
  update(sentinel.getBoundingClientRect().top);

  // The viewing form sits above the FAQ, so the floating bar used to cover the
  // bottom of the very form it links to (its submit button and error text).
  // Slide it away while the form is on screen, as the sell pages' bar does.
  var form = document.getElementById('request-viewing');
  if (form) {
    new IntersectionObserver(function(entries) {
      overForm = entries[entries.length - 1].isIntersecting;
      sync();
    }, { rootMargin: '0px 0px -30% 0px' }).observe(form);
  }
})();


// ── Reviews carousel (listing pages) ─────────────────────
// Horizontal review track with prev/next arrows. The track is a plain
// overflow-x scroller, so touch swipe, trackpad, and keyboard all work with no
// JS at all — this only adds the desktop arrows and keeps them in sync with the
// scroll position. Arrows ship hidden and are revealed only when the track
// actually overflows, so a listing with two reviews shows no dead controls.
(function initReviewsCarousels() {
  var carousels = document.querySelectorAll('[data-reviews-carousel]');
  if (!carousels.length) return;

  carousels.forEach(function(carousel) {
    var track = carousel.querySelector('.reviews-grid');
    var prev  = carousel.querySelector('.reviews-carousel-prev');
    var next  = carousel.querySelector('.reviews-carousel-next');
    if (!track || !prev || !next) return;

    // Scroll by one card plus its gap, so a click always lands a card edge on
    // the snap point rather than leaving a sliver showing.
    function step() {
      var card = track.querySelector('.review-card');
      if (!card) return track.clientWidth;
      var styles = window.getComputedStyle(track);
      var gap = parseFloat(styles.columnGap || styles.gap) || 0;
      return card.getBoundingClientRect().width + gap;
    }

    function update() {
      // 1px of slack absorbs sub-pixel rounding at the track's right edge.
      var max = track.scrollWidth - track.clientWidth;
      var overflows = max > 1;
      prev.hidden = !overflows || track.scrollLeft <= 1;
      next.hidden = !overflows || track.scrollLeft >= max - 1;
    }

    // Deliberately no `behavior` option: passing 'smooth' overrides the CSS, and
    // where a smooth scroll cannot animate the request is dropped outright and
    // the arrow does nothing. Omitting it defers to scroll-behavior in CSS,
    // which also lets the reduced-motion override switch the animation off.
    //
    // The fallback covers the case where the animation never starts at all —
    // a backgrounded or non-rendered tab, an engine that ignores the request.
    // If the track has not moved a frame or two later, land the scroll
    // instantly so an arrow is never dead. When the animation IS running,
    // scrollLeft has already changed by then and this leaves it alone.
    function nudge(delta) {
      var from = track.scrollLeft;
      track.scrollBy({ left: delta });
      setTimeout(function() {
        // 'instant', not 'auto' and not a scrollLeft assignment. Per CSSOM,
        // behavior:'auto' means "use the CSS scroll-behavior property" — with
        // smooth set there it resolves straight back to smooth and gets
        // dropped again, and a plain scrollLeft assignment goes through the
        // same animated path. 'instant' is the only value that bypasses it.
        if (track.scrollLeft === from) track.scrollBy({ left: delta, behavior: 'instant' });
        update();
      }, 60);
      // A smooth animation lands well after that check, and the scroll event
      // that would normally refresh the arrows is not guaranteed to fire (it is
      // suppressed in a non-rendered tab). Refresh once the animation has had
      // time to settle so the arrows can never show a stale enabled state.
      setTimeout(update, 500);
    }

    prev.addEventListener('click', function() { nudge(-step()); });
    next.addEventListener('click', function() { nudge(step()); });
    track.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);

    // Card widths depend on fonts and images, so re-check once those settle.
    update();
    window.addEventListener('load', update);
    if (window.ResizeObserver) new ResizeObserver(update).observe(track);
  });
})();

// ── Guide tables: even rows (§5.12) ──────────────────────
// Every guide table sets each body row to the height of its tallest row, so
// comparable items (models, routes, grades) read as equal rows; on phones,
// only tables of four or more columns. Heights depend on width and fonts, so
// re-measure on load and resize.
(function() {
  var tables = document.querySelectorAll('.guide-table');
  if (!tables.length) return;
  function even() {
    var phone = window.matchMedia('(max-width: 600px)').matches;
    tables.forEach(function(table) {
      var rows = Array.prototype.slice.call(table.tBodies[0].rows);
      rows.forEach(function(r) { r.style.height = ''; });
      // On phones only swipe tables (four or more columns) are evened; a
      // narrow table's wrapped rows would leave large blank gaps.
      if (phone && table.tHead && table.tHead.rows[0].cells.length < 4) return;
      var tallest = 0;
      rows.forEach(function(r) { tallest = Math.max(tallest, r.getBoundingClientRect().height); });
      rows.forEach(function(r) { r.style.height = Math.ceil(tallest) + 'px'; });
    });
  }
  var timer;
  even();
  window.addEventListener('load', even);
  window.addEventListener('resize', function() { clearTimeout(timer); timer = setTimeout(even, 100); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(even);
})();
