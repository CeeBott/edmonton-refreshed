// ═══════════════════════════════════════════════════════════
//  REVIEWS DATA
//
//  "rating" is out of 5.
//  "text" is optional — omit for ratings-only entries.
//  Aggregate stats at the bottom drive the summary bar.
//
//  To add a new review: copy a block and fill in the values.
// ═══════════════════════════════════════════════════════════

var reviews = [
  {
    name: "Janet Spriggs",
    rating: 5,
    text: "My husband and I purchased a couch from Collin with Edmonton Refreshed Seating. We were absolutely impressed with the quality of the piece but more impressed with Collin’s professionalism. He was a pleasure to deal with and made sure our transaction went completely smooth. DO NOT hesitate to deal with him. You won’t be disappointed!"
  },
  {
    name: "Dave Schmidt",
    rating: 5,
    text: "Collin is the owner of the company and he is a joy to work with. He communicates well, he is incredibly helpful, and made himself readily available for the purchase of the furniture."
  },
  {
    name: "Sharon",
    rating: 5,
    text: "Quality sofa! Collin was great to work with!"
  },
  {
    name: "Leila",
    rating: 4,
    text: "Detailed listing, pointed out benefits as well as flaws. Excellent knowledge of the product. Great customer service — delivered my sofa next day in extremely cold weather, which I did not expect. Highly recommended. I would definitely buy from Collin again."
  },
  {
    name: "Debbie",
    rating: 5,
    text: "Collin was an absolute pleasure to deal with in every aspect! He was very responsive, knowledgeable about the product, answered all my questions and the item was exactly as described. Also priced very fairly. I would highly recommend Collin!"
  },
  {
    name: "Barbara",
    rating: 5,
    text: "This was a great shopping experience. The quality of the furniture was excellent. Service was above and beyond."
  },
  {
    name: "Andrea",
    rating: 5,
    text: "Very happy with my purchase. He really went above and beyond with delivery. Thank you Collin!"
  },
  {
    name: "CN",
    rating: 5,
    text: "Accurate description, fair pricing, pleasant and easy to deal with. Great seller!"
  },
  {
    name: "Fiona",
    rating: 5,
    text: "Friendly, very communicative, easy to deal with."
  }
];

// ── Aggregate (includes written + ratings-only) ──────────────
var reviewAggregate = {
  totalCount: 19,
  ratingValue: 4.9    // (18 × 5 + 1 × 4) / 19 = 4.9474 → 4.9
};


// ═══════════════════════════════════════════════════════════
//  RENDER
// ═══════════════════════════════════════════════════════════

function renderReviews() {
  var section = document.getElementById('reviews-section');
  if (!section) return;

  // ── Aggregate bar ────────────────────────────────────────
  var stars = '';
  for (var i = 1; i <= 5; i++) {
    stars += '<span class="review-star' + (i <= Math.round(reviewAggregate.ratingValue) ? ' filled' : '') + '">★</span>';
  }

  var aggregateHTML =
    '<div class="reviews-aggregate">' +
      '<div class="reviews-aggregate-score">' + reviewAggregate.ratingValue.toFixed(1) + '</div>' +
      '<div class="reviews-aggregate-detail">' +
        '<div class="reviews-stars">' + stars + '</div>' +
        '<div class="reviews-aggregate-meta">' +
          reviewAggregate.totalCount + ' ratings' +
        '</div>' +
      '</div>' +
    '</div>';

  // ── Individual review cards ──────────────────────────────
  var cardsHTML = reviews.map(function(review) {
    var cardStars = '';
    for (var i = 1; i <= 5; i++) {
      cardStars += '<span class="review-star' + (i <= review.rating ? ' filled' : '') + '">★</span>';
    }

    var initial = review.name.charAt(0).toUpperCase();

    return '<div class="review-card">' +
      '<div class="review-card-header">' +
        '<div class="review-avatar">' + initial + '</div>' +
        '<div class="review-header-info">' +
          '<div class="review-author">' + review.name + '</div>' +
          '<div class="review-card-stars">' + cardStars + '</div>' +
        '</div>' +
      '</div>' +
      '<p class="review-text">\u201C' + review.text + '\u201D</p>' +
    '</div>';
  }).join('');

  section.innerHTML =
    '<div class="reviews-inner">' +
      aggregateHTML +
      '<div class="reviews-grid">' + cardsHTML + '</div>' +
    '</div>';
}

// Defer rendering so the static fallback paints first
if ('requestIdleCallback' in window) { requestIdleCallback(renderReviews); }
else { setTimeout(renderReviews, 0); }
