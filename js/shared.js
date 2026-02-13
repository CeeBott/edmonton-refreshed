// ═══════════════════════════════════════════════════════════
//  CAROUSEL BUILDER
// ═══════════════════════════════════════════════════════════

var carouselId = 0;

function buildCarousel(images, alt) {
  var id = 'carousel-' + (carouselId++);
  var count = images.length;
  var singleClass = count <= 1 ? ' single' : '';

  var imgsHtml = images.map(function(src, i) {
    return '<img src="' + src + '" alt="' + alt + ' — photo ' + (i+1) + '" loading="' + (i === 0 ? 'eager' : 'lazy') + '" draggable="false">';
  }).join('');

  var dotsHtml = images.map(function(_, i) {
    return '<button class="dot' + (i === 0 ? ' active' : '') + '" data-index="' + i + '" aria-label="Photo ' + (i+1) + '"></button>';
  }).join('');

  return '<div class="carousel' + singleClass + '" id="' + id + '" data-index="0" data-count="' + count + '">' +
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

function goToSlide(carousel, index) {
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

// Delegate clicks for carousel arrows, dots, and image → lightbox
document.addEventListener('click', function(e) {
  var btn = e.target.closest('.carousel-btn');
  if (btn) {
    e.stopPropagation();
    var carousel = btn.closest('.carousel');
    var current = parseInt(carousel.dataset.index);
    if (btn.classList.contains('prev')) goToSlide(carousel, current - 1);
    else goToSlide(carousel, current + 1);
    return;
  }

  var dot = e.target.closest('.dot');
  if (dot) {
    e.stopPropagation();
    var carousel = dot.closest('.carousel');
    goToSlide(carousel, parseInt(dot.dataset.index));
    return;
  }

  // Click on image → open lightbox
  var img = e.target.closest('.carousel-track img');
  if (img) {
    var carousel = img.closest('.carousel');
    var images = Array.from(carousel.querySelectorAll('.carousel-track img')).map(function(i) { return i.src; });
    var index = parseInt(carousel.dataset.index);
    openLightbox(images, index);
  }
});

// Touch / swipe support
var touchStartX = 0;
var touchCarousel = null;

document.addEventListener('touchstart', function(e) {
  var carousel = e.target.closest('.carousel');
  if (!carousel) return;
  touchStartX = e.touches[0].clientX;
  touchCarousel = carousel;
}, { passive: true });

document.addEventListener('touchend', function(e) {
  if (!touchCarousel) return;
  var diff = touchStartX - e.changedTouches[0].clientX;
  var current = parseInt(touchCarousel.dataset.index);
  if (Math.abs(diff) > 40) {
    if (diff > 0) goToSlide(touchCarousel, current + 1);
    else goToSlide(touchCarousel, current - 1);
  }
  touchCarousel = null;
}, { passive: true });

// Keyboard navigation
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
//  MOBILE NAV
// ═══════════════════════════════════════════════════════════

var navToggle = document.getElementById('navToggle');
var navLinks = document.getElementById('navLinks');
if (navToggle && navLinks) {
  navToggle.addEventListener('click', function() {
    navLinks.classList.toggle('open');
  });
}


// ═══════════════════════════════════════════════════════════
//  ACTIVE NAV LINK DETECTION
// ═══════════════════════════════════════════════════════════

(function() {
  var path = window.location.pathname;
  var page = 'available';
  if (path.indexOf('/sold') !== -1) page = 'sold';
  else if (path.indexOf('/sell') !== -1) page = 'sell';

  document.querySelectorAll('.nav-links a').forEach(function(a) {
    if (a.dataset.page === page) {
      a.classList.add('active');
    }
  });
})();
