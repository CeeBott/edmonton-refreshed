// ═══════════════════════════════════════════════════════════
//  AVAILABLE INVENTORY DATA
//
//  "images" is an ARRAY — list all photos for that piece.
//  The first image is the hero/cover.
//  Put photos in /images/<folder>/ and list them here.
//
//  To add a new piece: copy one block, change the values.
//  To remove a photo: delete that line from the array.
//  To reorder: move lines up/down — first = cover image.
// ═══════════════════════════════════════════════════════════

var availableItems = [
  {
    brand: "B&B Italia",
    title: "Charles L-shaped Modular Sectional",
    description: "An icon of design. The Charles sectional is a generational piece of furniture. Bench-made in Italy, upholstered in a beautiful white fabric, boasting a tubular steel frame encased in cold-cured polyurethane foam, solid polished Aluminum feet that make it feel like it's hovering, and manufactured in 2007.",
    retailCompare: "Retail: $28,000 | Buy it Now: $7,999",
    price: "$7,999",
    specs: ["B&B Italia", "Sofa: 129 inches, Chaise: 91 inches, Height: 29 inches", "Great Condition"],
    images: [
      "images/BB-030/bb-italia-14.jpeg",
      "images/BB-030/bb-italia-03.jpeg",
      "images/BB-030/bb-italia-12.jpeg",
      "images/BB-030/bb-italia-07.jpeg",
      "images/BB-030/bb-italia-01.jpeg",
      "images/BB-030/bb-italia-02.jpeg",
      "images/BB-030/bb-italia-04.jpeg",
      "images/BB-030/bb-italia-05.jpeg",
      "images/BB-030/bb-italia-06.jpeg",
      "images/BB-030/bb-italia-08.jpeg",
      "images/BB-030/bb-italia-09.jpeg",
      "images/BB-030/bb-italia-10.jpeg",
      "images/BB-030/bb-italia-11.jpeg",
      "images/BB-030/bb-italia-13.jpeg",
    ]
  },
  {
    brand: "La-Z-Boy",
    title: "Emric Right Facing Sectional",
    description: "At only 18 months old, this Emric sectional from La-Z-Boy is like new. Upholstered in Charcoal McKittrick fabric, and currently retails for $5,598 from La-Z-Boy. The seat and back cushions show zero signs of use. Manufactured in the USA, clean, and ready for its new home.",
    retailCompare: "Retail: $5,598 | Buy it Now: $2,199",
    price: "$2,199",
    specs: ["La-Z-Boy", "Sofa: 108 inches, Chaise: 89 inches, Height: 36 inches", "Excellent Condition"],
    images: [
      "images/LB-041/la-z-boy-07.jpeg",
      "images/LB-041/la-z-boy-06.jpeg",
      "images/LB-041/la-z-boy-08.jpeg",
      "images/LB-041/la-z-boy-11.jpeg",
      "images/LB-041/la-z-boy-01.jpeg",
      "images/LB-041/la-z-boy-02.jpeg",
      "images/LB-041/la-z-boy-03.jpeg",
      "images/LB-041/la-z-boy-04.jpeg",
      "images/LB-041/la-z-boy-09.jpeg",
      "images/LB-041/la-z-boy-10.jpeg",
      "images/LB-041/la-z-boy-12.jpeg",
      "images/LB-041/la-z-boy-13.jpeg",
      "images/LB-041/la-z-boy-14.jpeg",
    ]
  },
  {
    brand: "La-Z-Boy",
    title: "Genuine Nubuck Leather Roundabout Ottoman",
    description: "Upholstered in genuine Nubuck Leather and only 18 months old, this Roundabout Ottoman retails from La-Z-Boy for $1,649. It's engineered to function as a seat, and has four casters on the bottom for easy maneuverability.",
    retailCompare: "Retail: $1,649 | Buy it Now: $599",
    price: "$599",
    specs: ["La-Z-Boy", "35 inches wide x 35 inches wide x 18 inches high", "Like New"],
    images: [
      "images/LB-042/la-z-boy-03.jpeg",
      "images/LB-042/la-z-boy-02.jpeg",
      "images/LB-042/la-z-boy-01.jpeg",
      "images/LB-042/la-z-boy-04.jpeg",
    ]
  },
  {
    brand: "Rove Concepts",
    title: "Milo 6-Piece Modular Sectional",
    description: "A statement in texture and versatility. The Milo is upholstered in Pearl Chatou Boucl\u00e9 \u2014 a wool-fiber fabric whose tightly looped construction delivers extraordinary softness without sacrificing durability. Six fully independent modules of kiln-dried hardwood and sinuous spring construction, topped with three-layer high-density foam finished in 100% goose feathers. Low-profile stainless steel legs. Configure it as a grand L-shape, split it into two loveseats, or anchor a room around a sofa and ottoman \u2014 the layout is yours.",
    retailCompare: "Est. Retail: $7,400 | Buy it Now: $4,499",
    price: "$4,499",
    specs: ["Rove Concepts", "Sectional: 126.5 x 126.5 x 31.5 inches, 424.7 lbs \u2014 Extra module: 39 x 39.5 x 31.5 inches, 74 lbs", "Excellent Condition"],
    images: [
      "images/RC-043/rove-concepts-01.jpeg",
      "images/RC-043/rove-concepts-02.jpeg",
      "images/RC-043/rove-concepts-03.jpeg",
      "images/RC-043/rove-concepts-04.jpeg",
      "images/RC-043/rove-concepts-05.jpeg",
      "images/RC-043/rove-concepts-06.jpeg",
      "images/RC-043/rove-concepts-07.jpeg",
      "images/RC-043/rove-concepts-08.jpeg",
      "images/RC-043/rove-concepts-09.jpeg",
      "images/RC-043/rove-concepts-10.jpeg",
      "images/RC-043/rove-concepts-11.jpeg",
      "images/RC-043/rove-concepts-12.jpeg",
    ]
  },
];


// ═══════════════════════════════════════════════════════════
//  RENDER
// ═══════════════════════════════════════════════════════════

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function renderAvailable() {
  var grid = document.getElementById('available-grid');
  if (availableItems.length === 0) {
    grid.style.display = 'none';
    return;
  }

  grid.innerHTML = availableItems.map(function(item) {
    var slug = slugify(item.brand + '-' + item.title);
    var listingUrl = '/listings/' + slug + '/';

    var brandLine = item.comingSoon
      ? '<div class="card-meta"><div class="card-brand">' + item.brand + '</div><span class="coming-soon-badge">Coming Soon</span></div>'
      : '<div class="card-brand">' + item.brand + '</div>';

    var titleEl = item.comingSoon
      ? '<div class="card-title">' + item.title + '</div>'
      : '<div class="card-title"><a class="card-title-link" href="' + listingUrl + '">' + item.title + '</a></div>';

    var priceCta = item.comingSoon
      ? '<div class="card-price card-price--muted">Listing coming soon</div>'
      : '<div class="card-price">' + item.price + '</div>';

    return '<div class="card">' +
      (item.images && item.images.length > 0
        ? buildCarousel(item.images, item.brand + ' ' + item.title)
        : '<div class="card-image-placeholder">Photos coming soon</div>'
      ) +
      '<div class="card-body">' +
        brandLine +
        titleEl +
        '<div class="card-specs">' +
          item.specs.map(function(s) { return '<span class="spec-tag">' + s + '</span>'; }).join('') +
        '</div>' +
        priceCta +
      '</div>' +
    '</div>';
  }).join('');
}

renderAvailable();


// Product schema is injected as static <script> tags in index.html <head>
// by the build script (build.js). No runtime DOM injection needed.
