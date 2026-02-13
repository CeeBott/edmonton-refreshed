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
    description: "An icon of design. The Charles sectional is a generational piece of furniture. Bench-made in Italy, upholsetered in a beautiful white fabric, boasting a tubular steel frame encased in cold-cured polyurethane foam, solid polished Aluminum feet that make it feel like its hovering, and manufactured in 2007",
    price: "$7,999",
    specs: ["B&B Italia", "Sofa: 129 inches, Chaise: 91 inches, Heigh: 29 inches", "Great Condition"],
    images: [
      "images/BB-030/IMG_5892.jpeg",
      "images/BB-030/IMG_5530.jpeg",
      "images/BB-030/IMG_5565.jpeg",
      "images/BB-030/IMG_5542.jpeg",
      "images/BB-030/IMG_5528.jpeg",
      "images/BB-030/IMG_5529.jpeg",
      "images/BB-030/IMG_5532.jpeg",
      "images/BB-030/IMG_5534.jpeg",
      "images/BB-030/IMG_5535.jpeg",
      "images/BB-030/IMG_5543.jpeg",
      "images/BB-030/IMG_5548.jpeg",
      "images/BB-030/IMG_5549.jpeg",
      "images/BB-030/IMG_5552.jpeg",
      "images/BB-030/IMG_5890.jpeg",
    ]
  },
  {
    brand: "La-Z-Boy",
    title: "Emric Right Facing Sectional",
    description: "At only only 18 months old, this Emric sectional from La-Z-Boy is like new. Upholstered in Charcoal McKittrick fabric, and currently retails for $5,598 from La-Z-Boy. The seat and back cushions show zero signs of use. Manufactured in the USA, clean, and ready for its new home.",
    price: "$2,699",
    specs: ["La-Z-Boy", "Sofa: 108 inches, Chaise: 89 inches, Height: 36 inches", "Excellent Condition"],
    images: [
      "images/LB-041/IMG_6670.jpeg",
      "images/LB-041/IMG_6668.jpeg",
      "images/LB-041/IMG_6671.jpeg",
      "images/LB-041/IMG_6677.jpeg",
      "images/LB-041/IMG_6663.jpeg",
      "images/LB-041/IMG_6664.jpeg",
      "images/LB-041/IMG_6665.jpeg",
      "images/LB-041/IMG_6666.jpeg",
      "images/LB-041/IMG_6672.jpeg",
      "images/LB-041/IMG_6673.jpeg",
      "images/LB-041/IMG_6678.jpeg",
      "images/LB-041/IMG_6679.jpeg",
      "images/LB-041/IMG_6680.jpeg",
    ]
  },
  {
    brand: "La-Z-Boy",
    title: "Genuine Nubuck Leather Roundabout Ottoman",
    description: "Upholstered in genuine Nubuck Leather and only 18 months old, this Roundabout Ottoman retails from La-Z-Boy for $1,649. It's engineered to function as a seat, and has four casters on the bottom for eaasy maneuverability.",
    price: "$799",
    specs: ["La-Z-Boy", "35 inches wide x 35 inches wide x 18 inches high", "Like New"],
    images: [
      "images/LB-042/IMG_6685.jpeg",
      "images/LB-042/IMG_6683.jpeg",
      "images/LB-042/IMG_6681.jpeg",
      "images/LB-042/IMG_6686.jpeg",
    ]
  },
];


// ═══════════════════════════════════════════════════════════
//  RENDER
// ═══════════════════════════════════════════════════════════

function renderAvailable() {
  var grid = document.getElementById('available-grid');
  var empty = document.getElementById('available-empty');

  if (availableItems.length === 0) {
    grid.style.display = 'none';
    empty.style.display = 'block';
    return;
  }

  grid.innerHTML = availableItems.map(function(item) {
    return '<div class="card">' +
      (item.images && item.images.length > 0
        ? buildCarousel(item.images, item.title)
        : '<div class="card-image-placeholder">Photo coming soon</div>'
      ) +
      '<div class="card-body">' +
        '<div class="card-brand">' + item.brand + '</div>' +
        '<div class="card-title">' + item.title + '</div>' +
        '<div class="card-description">' + item.description + '</div>' +
        '<div class="card-specs">' +
          item.specs.map(function(s) { return '<span class="spec-tag">' + s + '</span>'; }).join('') +
        '</div>' +
        '<div class="card-price">' + item.price + '</div>' +
        '<a class="card-cta" href="sms:7809651477">Contact to View &rarr;</a>' +
      '</div>' +
    '</div>';
  }).join('');
}

renderAvailable();
