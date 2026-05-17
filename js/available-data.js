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
    title: "Charles Left-Facing Sectional — Off-White Rattier Fabric",
    slug: "b-b-italia-charles-l-shaped-modular-sectional",
    description: "The Charles is one of the most referenced sofas in the history of contemporary Italian design — designed by Antonio Citterio for B&B Italia and in continuous production since its introduction. This is not a piece that trends in and out. It has been a fixture in architecture studios, design publications, and high-end interiors for over two decades for a single reason: it gets everything right.\n\nThe Charles is defined by its restraint. Low profile, clean geometry, and the signature die-cast aluminium feet — cast in an inverted \"L\" shape — that give the piece its characteristic floating appearance. The back is composed of free, independently placed cushions rather than fixed bolsters, which allows the silhouette to remain open and architectural while still delivering full support.\n\nThis configuration is a left-facing L — a sofa body running right with a full chaise extending left. It reads as a complete, room-defining piece from the moment it's placed.\n\nThe upholstery is B&B Italia's Rattier fabric in off-white — a tightly woven, mid-weight textile with a refined, slightly textured surface. It's warm without being casual, and neutral enough to anchor both contemporary and transitional spaces without competing with anything around it.\n\nThe removable cover system is a meaningful feature at this tier. It means the piece is serviceable without involving a full upholsterer visit, and it's the reason well-maintained Charles sectionals remain in circulation decades after manufacture. The steel frame underneath doesn't warp, sag, or develop joint deterioration — it either holds or it doesn't, and this one holds.",
    features: [
      "Internal frame: tubular steel and steel profiles",
      "Internal frame upholstery: Bayfit® (Bayer®) flexible cold-shaped polyurethane foam with polyester fibre cover",
      "Seat cushion upholstery: shaped polyurethane of different densities, sterilized down, polyester fibre cover",
      "Back cushions: polyester fibre fill, box-style construction",
      "Feet: die-cast aluminium in inverted \"L\" profile",
      "Covers: fully removable via Velcro attachment — can be professionally reupholstered or cleaned off the frame",
    ],
    condition: "Structurally excellent — frame, cushions, and down fill all intact. The Rattier fabric shows subtle tonal variation on the seating surface from previous spot-cleaning; the effect is minor and reads as natural textile variation at conversational distance. Covers are removable and can be professionally laundered or replaced as desired.",
    configuration: "Left-facing chaise module, sofa body, all original back cushions and seat cushions.\n\nDelivery available for an additional fee.",
    retailCompare: "Est. Retail: $28,000 | Buy it Today: $7,500",
    price: "$7,500",
    specs: ["B&B Italia", "128¾ × 90½ × 28¾ in", "Seat Depth: 38.25 in", "Seat Height: ~15–16 in", "Good Condition"],
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
    title: "Roundabout Ottoman — Nubuck Leather",
    slug: "la-z-boy-genuine-nubuck-leather-roundabout-ottoman",
    description: "The Roundabout is La-Z-Boy's premium cocktail ottoman — and in nubuck leather, it's a different category of piece than the fabric version. Nubuck is top-grain leather that's been buffed on the outer surface to produce a fine, velvety texture. It has the warmth and tactility of suede with the durability of full-grain leather underneath. It develops a natural patina over time and is substantially more resistant to wear than fabric alternatives at this size.\n\nThe Roundabout's format is what makes it genuinely useful. Hidden casters let it move freely wherever it's needed — it functions as a footrest, overflow seating, or a centrepiece cocktail table depending on the room's needs at any given moment. At 35\" across, it's generously scaled without being oversized. The 18\" height puts it at standard sofa seat height, which means it works as additional seating without the awkward height differential common in smaller ottomans.\n\nButton-tufted top with welt trim detailing, double-picked blown fiber fill for cushion loft and shape retention, and high-grade foam for lasting comfort and appearance. The round format and neutral nubuck leather make it one of the more versatile accent pieces in the category — it doesn't require a matching sofa to work in a room.",
    features: [
      "High-grade foam seat cushion for lasting comfort and appearance",
      "Double-picked blown fiber fill for enhanced cushioning and shape retention",
      "Button-tufted top with welt cord trim",
      "Hidden casters for mobility",
      "Nubuck top-grain leather upholstery",
      "La-Z-Boy Limited Lifetime Warranty on frame and spring system",
    ],
    condition: "Like new.",
    metaDescription: "Pre-owned La-Z-Boy Roundabout Ottoman in genuine nubuck leather — Edmonton. Like new condition, $599. Delivery available.",
    retailCompare: "Est. Retail: $1,569 | Buy it Today: $599",
    price: "$599",
    specs: ["La-Z-Boy", "35 × 35 × 18 in", "Nubuck Leather", "Hidden Casters", "Like New"],
    images: [
      "images/LB-042/la-z-boy-03.jpeg",
      "images/LB-042/la-z-boy-02.jpeg",
      "images/LB-042/la-z-boy-01.jpeg",
      "images/LB-042/la-z-boy-04.jpeg",
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
    var slug = item.slug || slugify(item.brand + '-' + item.title);
    var listingUrl = '/listings/' + slug + '/';

    var brandLine = item.comingSoon
      ? '<div class="card-meta"><div class="card-brand">' + item.brand + '</div><span class="coming-soon-badge">Coming Soon</span></div>'
      : '<div class="card-brand">' + item.brand + '</div>';

    var titleEl = item.comingSoon
      ? '<div class="card-title">' + item.title + '</div>'
      : '<div class="card-title"><a class="card-title-link" href="' + listingUrl + '">' + item.title + '</a></div>';

    var priceCta = item.comingSoon
      ? '<div class="card-price card-price--muted">Listing coming soon</div>'
      : '<div class="card-price">' + item.price + ' <span class="card-price-currency">CAD</span></div>';

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

// Defer rendering so the static fallback paints as LCP first
if ('requestIdleCallback' in window) { requestIdleCallback(renderAvailable); }
else { setTimeout(renderAvailable, 0); }


// Product schema is injected as static <script> tags in index.html <head>
// by the build script (build.js). No runtime DOM injection needed.
