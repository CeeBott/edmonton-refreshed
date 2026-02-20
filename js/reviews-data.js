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
  totalCount: 16,
  ratingValue: 4.9,   // (15 × 5 + 1 × 4) / 16 = 4.9375 → 4.9
  platform: "Facebook"
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
          reviewAggregate.totalCount + ' ratings on ' + reviewAggregate.platform +
        '</div>' +
      '</div>' +
    '</div>';

  // ── Individual review cards ──────────────────────────────
  var cardsHTML = reviews.map(function(review) {
    var cardStars = '';
    for (var i = 1; i <= 5; i++) {
      cardStars += '<span class="review-star' + (i <= review.rating ? ' filled' : '') + '">★</span>';
    }
    return '<div class="review-card">' +
      '<div class="review-stars">' + cardStars + '</div>' +
      '<p class="review-text">\u201C' + review.text + '\u201D</p>' +
      '<div class="review-author">\u2014 ' + review.name + '</div>' +
    '</div>';
  }).join('');

  section.innerHTML =
    '<div class="reviews-inner">' +
      aggregateHTML +
      '<div class="reviews-grid">' + cardsHTML + '</div>' +
      '<a class="reviews-source" href="https://www.facebook.com/edmonton.refreshed/reviews" target="_blank" rel="noopener">View all reviews on Facebook &rarr;</a>' +
    '</div>';
}

renderReviews();
