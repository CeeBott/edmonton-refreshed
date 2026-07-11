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

// Prices are stored as PURE NUMBERS (e.g. price: 7500). Visible "$X,XXX CAD"
// formatting is generated at render time via formatPrice() — never baked into
// the data. See CLAUDE.md §5.10 for the full listing data standard.

var availableItems = [
  {
    brand: "Crate & Barrel",
    title: "Lounge 83-Inch Bench Sofa — Taft Steel Everweave (Two Available)",
    slug: "crate-and-barrel-lounge-83-bench-sofa-edmonton",
    metaTitle: "Pre-Owned Crate & Barrel Lounge Sofas for Sale in Edmonton",
    metaDescription: "Two like-new Crate & Barrel Lounge bench sofas in grey Taft Steel weave. Sold individually, inspected and cleaned. Delivery across Alberta. $1,700 CAD.",
    availabilityStarts: "2026-07-04",
    dimensions: { width: "83", depth: "41", height: "37" },
    description: "There are two of these — a matched pair of identical Lounge 83-inch bench sofas, sold individually, with the listed price per sofa. Take one, or take both: a true matched pair is genuinely rare on the resale market.\n\nThe Lounge is Crate & Barrel's bestselling sofa for a reason: relaxed, sink-in comfort in a clean, modern shell. Slim track arms keep the profile light and maximize actual sitting space, medium-depth seats make it as easy to sit up with a book as to settle in for a movie, and the supersoft back cushions invite exactly the kind of curling up the design is known for. This is the 83-inch bench-cushion version — one long, uninterrupted 73-inch seat with no centre gap, which keeps the look tailored and the seating continuous.\n\nThe upholstery is Taft in the Steel colourway, one of Crate & Barrel's Everweave performance fabrics. It reads as a modern interpretation of bouclé — a two-toned textured weave with real depth up close — while the 70% polypropylene, 30% polyester blend is engineered for the strength and durability to stand up to active family life. The fabric is woven in the United States.\n\nUnderneath, this is a benchmade sofa built in the USA: an FSC-certified hardwood frame kiln-dried to prevent warping, seat cushions of supportive plant-based polyfoam wrapped in a soft fiber and feather-down blend, and fiber-down back cushions in a special ticking fabric that keeps feathers in place while the cushions hold their shape over time. The cushions ride on a spring-up Flexolator foundation, independently tested and designed to eliminate sagging.",
    features: [
      "FSC®-certified hardwood frame from responsibly managed forests, benchmade and kiln-dried to prevent warping",
      "Seat cushion: supportive plant-based polyfoam wrapped in a soft fiber and feather-down blend",
      "Fiber-down back cushions in feather-proof ticking that maintains shape and comfort over time",
      "Spring-up Flexolator foundation, independently tested and designed to eliminate sagging",
      "Slim track arms lighten the look and maximize sitting space",
      "Taft Steel Everweave performance fabric — 70% polypropylene / 30% polyester, woven in the USA",
      "Made in USA of domestic and imported materials",
      "Inside seat: 73 in wide × 24 in deep; seat height 18 in; arm and frame height 25 in; diagonal depth 48 in",
    ],
    condition: "Like new — both sofas. The Taft weave is clean and even with no visible wear, and the bench cushion and feather-down back cushions hold their shape and loft. The manufacturer's law label is intact and dated May 21, 2024 — these were barely two years old at listing, and the label is visible in the photos. Photos show one of the two sofas; they are identical.",
    configuration: "Two identical sofas are available and sold individually — the listed price is per sofa. Take one, or the matching pair for a facing or L-shaped arrangement.\n\nEach sofa includes the bench seat cushion and two back cushions as shown.\n\nDelivery available for an additional fee.",
    faq: [
      { question: "Is this an authentic Crate & Barrel Lounge sofa?", answer: "Yes. The original manufacturer's label is attached and confirms the piece: made for Crate & Barrel in Conover, North Carolina, in the Taft Steel fabric, with a May 21, 2024 label date. Every designer piece we list is inspected for construction, materials, and manufacturer consistency before going up." },
      { question: "Is this the current Lounge, the Lounge II, or the Lounge Deep?", answer: "This is the current-generation Lounge — the model Crate & Barrel sells today, label-dated May 2024. If you knew the line as the Lounge II, it's the same continuing design: Crate & Barrel simply renamed it back to Lounge. What this is not is the Lounge Deep, the deeper-profile variant — this is the standard Lounge at 41 inches deep with a 24-inch seat depth, in the 83-inch bench-cushion configuration." },
      { question: "Are there really two identical sofas available?", answer: "Yes. We have two of the same Lounge 83-inch bench sofa, both in the Taft Steel fabric and in matching condition. The listed price is per sofa — buy one, or take both for a matched pair that suits a facing or L-shaped layout." },
      { question: "What is the Taft Steel fabric like?", answer: "Taft is one of Crate & Barrel's Everweave performance fabrics — a two-toned textured weave that reads as a modern take on bouclé. The Steel colourway is a versatile mid-grey. The blend is 70% polypropylene and 30% polyester, woven in the United States and designed for the durability to withstand active family life." },
      { question: "Is the Taft Steel fabric pet-friendly and easy to clean?", answer: "It is well suited to homes with pets and kids. The dominant fibre is polypropylene, which is naturally moisture- and stain-resistant, so spills tend to sit on the surface rather than soak in. The tight two-toned weave also resists snags better than a looped bouclé. Vacuum it regularly and blot spills promptly with a water-based upholstery cleaner and it will keep looking the way it does in the photos." },
      { question: "What is a bench cushion like to live with?", answer: "A bench cushion is one continuous seat cushion instead of two or three separate ones. There is no centre gap to swallow phones and remotes, no seams to keep straight, and stretching out across the 73-inch inside seat is genuinely comfortable. It gives the sofa a cleaner, more tailored line than divided cushions." },
      { question: "What are the exact dimensions?", answer: "Overall: 83 inches wide, 41 inches deep, 37 inches high. Inside seat: 73 inches wide and 24 inches deep, with an 18-inch seat height. Arm and frame height: 25 inches. Diagonal depth: 48 inches — the measurement that matters for tight hallways, stairwells, and elevators." },
      { question: "Do you deliver?", answer: "Yes. We deliver throughout Edmonton and surrounding areas, and we arrange delivery across Alberta on request. Delivery is offered for an additional fee that depends on distance and access." },
    ],
    retailEstimate: 3057,
    price: 1700,
    specs: ["Crate & Barrel", "83 × 41 × 37 in", "Taft Steel Everweave", "Made in USA", "Two Available", "Like New"],
    images: [
      "images/CB-046-47/crate-and-barrel-01.jpeg",
      "images/CB-046-47/crate-and-barrel-02.jpeg",
      "images/CB-046-47/crate-and-barrel-03.jpeg",
      "images/CB-046-47/crate-and-barrel-04.jpeg",
      "images/CB-046-47/crate-and-barrel-05.jpeg",
    ]
  },
  {
    brand: "Bracci",
    title: "Como Maxi Apartment Sofa — Fango Victoria Leather",
    slug: "bracci-como-maxi-apartment-sofa-edmonton",
    metaTitle: "Pre-Owned Bracci Como Maxi Apartment Sofa for Sale in Edmonton",
    metaDescription: "Pre-owned Bracci Como maxi apartment sofa in Fango Victoria leather. Bench-made in Italy, inspected and cleaned. Delivery across Alberta. $2,450 CAD.",
    availabilityStarts: "2026-06-01",
    dimensions: { width: "78", depth: "40", height: "30" },
    description: "Bracci is a Tuscan leather-furniture house that builds to order in the Quarrata furniture district — a small-batch Italian maker whose pieces rarely turn up on the secondary market in Edmonton. The Como is its low, clean-lined contemporary two-seater — Bracci calls it a \"maxi\" loveseat, but at 78 inches wide and 40 inches deep it sits and lives like a compact apartment sofa — the depth in particular is closer to a full sectional than a typical two-seater, which means genuinely generous seating rather than a perch. A tailored bench with track arms and a quietly architectural stance lifted on slim metal feet.\n\nThe story of this piece is the hide. It is upholstered in Bracci's Category 35 Victoria leather, a thick 1.6 to 1.8mm semi-aniline cowhide that is embossed for durability and tanned start to finish in Italy. The colourway is Fango, a warm taupe-greige that shifts with the light and sits comfortably against almost any palette. Because the leather is consistent from hide to hide rather than heavily corrected, it keeps a natural hand and shows the gentle grain variation that only real full-thickness leather does.\n\nThe tailoring is meant to be seen. Heavy contrast baseball stitching — Bracci's factory Option 305 — runs the arms, seat, and back to emphasize the thickness of the hide and the precision of the seams. It is the visual signature of the design.\n\nUnder the upholstery is a serious frame: kiln-dried solid fir and beech reinforced with hardwood dowels and double corner blocks, over a tightly spaced 3-inch high-resilience elastic webbing system. It is a heavy, commercial-grade build, and it is the reason a well-kept Bracci holds its shape and sits the same for years.",
    features: [
      "Bench-made in Italy; Victoria leather tanned 100% in Italy",
      "Category 35 Victoria semi-aniline cowhide, 1.6 to 2.0mm thick, embossed for protection",
      "Fango colourway with a breathable semi-aniline hand and light protection against fading and marks",
      "Option 305 heavy-thread contrast baseball stitching",
      "Kiln-dried solid fir and beech frame with hardwood dowels and double corner blocks",
      "3-inch high-resilience interlocking elastic webbing spaced at 1.5-inch intervals",
    ],
    condition: "Excellent pre-owned condition. The Victoria leather is clean and supple with light, even patina and the natural grain variation expected of a full-thickness semi-aniline hide. The frame is solid and quiet, and the cushions hold their shape.",
    configuration: "Two-seat apartment sofa with bench seat and back cushions as shown.\n\nDelivery available for an additional fee.",
    faq: [
      { question: "Is this genuine leather?", answer: "Yes. The Como is upholstered in Bracci's Category 35 Victoria leather, a thick semi-aniline cowhide tanned in Italy. It is real full-thickness hide, not bonded or faux leather, which is why it shows natural grain variation and keeps a soft, breathable hand." },
      { question: "Is it really made in Italy?", answer: "Yes. The piece is bench-made in Italy and carries its original Made in Italy tag, and the Victoria leather is tanned start to finish in Italy. Bracci is a Tuscan furniture house based in the Quarrata district." },
      { question: "What is the Fango colour like?", answer: "Fango is Italian for mud, and the colour is a warm taupe-greige. It reads as a soft neutral that shifts slightly with the light and pairs easily with both warm and cool palettes, so it works in most rooms without dominating them." },
      { question: "How does semi-aniline leather wear?", answer: "Semi-aniline leather has a light protective finish over a natural dyed hide, so it resists fading and everyday marks better than pure aniline while still feeling soft and breathable. It develops a gentle patina over time rather than wearing out. Wipe spills promptly and keep it out of direct, prolonged sun." },
      { question: "Do you deliver?", answer: "Yes. We deliver throughout Edmonton and surrounding areas, and we arrange delivery across Alberta on request. Delivery is offered for an additional fee that depends on distance and access." },
    ],
    retailEstimate: 6699,
    price: 2450,
    specs: ["Bracci", "78 × 40 × 30 in", "Victoria Semi-Aniline Leather", "Made in Italy", "Excellent Condition"],
    images: [
      "images/BS-044/bracci-01.jpeg",
      "images/BS-044/bracci-02.jpeg",
      "images/BS-044/bracci-03.jpeg",
      "images/BS-044/bracci-04.jpeg",
      "images/BS-044/bracci-05.jpeg",
    ]
  },
  {
    brand: "B&B Italia",
    title: "Charles Left-Facing Sectional — Off-White Rattier Fabric",
    slug: "b-b-italia-charles-sectional-edmonton",
    metaTitle: "Pre-Owned B&B Italia Charles Sectional Sofa for Sale in Edmonton",
    metaDescription: "Pre-owned B&B Italia Charles sectional sofa in Edmonton. Professionally inspected and cleaned. Delivery available across Alberta. $6,900 CAD.",
    availabilityStarts: "2026-05-15",
    dimensions: { width: "129", depth: "91", height: "29" },
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
    faq: [
      { question: "Is this an authentic B&B Italia Charles sectional?", answer: "Yes. This is an authentic B&B Italia Charles, designed by Antonio Citterio. Every designer piece we list is inspected for construction, materials, and manufacturer consistency before going up. The Charles is identifiable by its signature inverted-L die-cast aluminium feet, tubular steel frame, and Velcro-attached removable cover system." },
      { question: "Are the covers removable?", answer: "Yes. The Charles is built around a fully removable cover system attached with Velcro. Covers come off the frame for professional laundering or replacement without involving an upholsterer." },
      { question: "Do you deliver outside Edmonton?", answer: "Yes. We deliver throughout Edmonton and surrounding areas, and we arrange delivery across Alberta on request. Delivery is offered for an additional fee that depends on distance and access." },
      { question: "Can the covers be professionally cleaned or replaced?", answer: "Yes. Because the Rattier fabric covers detach from the frame, they can be sent out for professional cleaning, or replaced entirely. B&B Italia continues to produce Charles cover sets in current fabrics, which is one of the reasons well-maintained Charles sectionals stay in circulation for decades." },
      { question: "What condition is the sectional in?", answer: "Structurally excellent. The frame, cushions, and down fill are all intact. The Rattier fabric shows subtle tonal variation on the seating surface from previous spot-cleaning; the effect is minor and reads as natural textile variation at conversational distance. Covers are removable and can be professionally laundered or replaced if desired." },
    ],
    retailEstimate: 28000,
    price: 6900,
    specs: ["B&B Italia", "129 × 91 × 29 in", "Steel Frame", "Rattier Fabric", "Good Condition"],
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
];


// ═══════════════════════════════════════════════════════════
//  RENDER
// ═══════════════════════════════════════════════════════════

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

// 7500 → "$7,500". Mirror of the Node-side helper in build.js. Trivial enough
// that having both is simpler than wiring shared module loading.
var _AVAILABLE_PRICE_FMT = new Intl.NumberFormat('en-CA', { maximumFractionDigits: 0 });
function formatPrice(n) { return '$' + _AVAILABLE_PRICE_FMT.format(n); }

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
      : '<div class="card-price">' + formatPrice(item.price) + ' <span class="card-price-currency">CAD</span></div>';

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
