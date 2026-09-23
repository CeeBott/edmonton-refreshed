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
    brand: "American Leather",
    title: "Carson L-Shaped Sectional — Haven Heritage Champagne Aniline Leather",
    slug: "american-leather-carson-sectional-edmonton",
    metaTitle: "Pre-Owned American Leather Carson Leather Sectional for Sale in Edmonton",
    metaDescription: "Pre-owned American Leather Carson L-shaped sectional in Haven Heritage full-aniline leather. Delivery across Alberta. {price}.",
    availabilityStarts: "2026-09-23",
    model: "Carson",
    productionDate: "2015-07",
    material: "Haven Heritage Leather",
    materialFeed: "Leather",
    color: "Champagne",
    conditionGrade: "Good",
    dimensions: {
      width: "137", depth: "91", height: "34",
      extra: [
        { label: "Seat height",              value: "20 in" },
        { label: "Seat depth",               value: "21 in" },
        { label: "Arm height",               value: "23 in" },
        { label: "Module depth",             value: "38 in" },
        { label: "Left-arm 3-seat sofa",     value: "76 in wide" },
        { label: "Armless chair",            value: "23 in wide" },
        { label: "Right-arm corner sofa",    value: "91 in long" },
      ],
    },
    description: "The Carson is American Leather's track-arm sectional: square, low arms, a tailored base on espresso wood legs, and loose seat and back cushions of high-resiliency foam encased in down. This one is a three-module L measuring 137 by 91 inches, upholstered in Haven Heritage — a full-aniline, top-grain leather from American Leather's highest leather grade. Full aniline carries no pigment coat, so the pebbled grain and natural markings of each hide stay visible, and the leather keeps softening and deepening into a patina with use. In Champagne it reads as a warm, light neutral that suits wood floors and brighter rooms without the starkness of white leather.",
    features: [
      "Haven Heritage full-aniline top-grain leather — Grade J, American Leather's highest leather tier",
      "Pebbled texture, light protective finish; the leather's listed country of origin is Thailand",
      "Advanced unidirectional suspension system",
      "High-density, high-resiliency foam seat cores encased in down",
      "Loose back and seat cushions",
      "Double-needle top-stitching",
      "Espresso wood legs",
      "Manufactured in Dallas, Texas",
    ],
    condition: "The hide is soft and even in colour across all three modules, with relaxed creasing on the seat and back cushions from use — the normal way a full-aniline leather wears in. Cushions hold their shape and the seams are intact throughout the photos. Photographed as-is in our storage bay.",
    configuration: "Three modules: a left-arm 3-seat sofa (76 in), an armless chair (23 in), and a right-arm sofa with corner (91 in), with all original seat and back cushions. The pieces separate for moving.",
    faq: [
      { question: "Is this an authentic American Leather Carson sectional?", answer: "Yes. It is an American Leather Carson, built in Dallas, Texas in July 2015 and upholstered in the brand's Haven Heritage leather. Every designer piece we list is inspected for construction, materials, and manufacturer consistency before going up." },
      { question: "What is Haven Heritage leather?", answer: "Haven Heritage is a full-aniline, top-grain leather with a pebbled texture, in American Leather's Grade J — its highest leather tier. Full aniline means the hide is dyed through rather than coated with pigment, so the natural grain and markings stay visible and every hide looks slightly different. It carries only a light protective finish, so it feels softer and develops a richer patina over time than a coated leather, but it is also more absorbent. Blot spills promptly with a clean cloth. American Leather's own care guidance for this leather is dusting, vacuuming, and distilled water only — it is not meant to be conditioned." },
      { question: "What are the exact dimensions?", answer: "Overall it is 137 inches wide and 91 inches along the return, 34 inches high, with 38-inch-deep modules. Seat height is 20 inches, seat depth 21 inches, and arm height 23 inches. It comes apart into three pieces — a 76-inch left-arm sofa, a 23-inch armless chair, and a 91-inch right-arm corner sofa — so the largest single piece to get through a doorway is the 91-inch corner unit." },
      { question: "How old is it?", answer: "It was built in July 2015. Full-aniline leather on a well-made frame is meant for this kind of lifespan — the hide softens and takes on patina rather than wearing out." },
      { question: "Do you deliver?", answer: "Yes. We deliver throughout Edmonton and surrounding areas, and we arrange delivery across Alberta on request. Delivery is offered for an additional fee that depends on distance and access." },
    ],
    retailEstimate: 18000,
    price: 4200,
    specs: ["American Leather", "137 × 91 × 34 in", "Full-Aniline Leather", "Three Modules", "Good Condition"],
    images: [
      "images/AL-049/american-leather-01.jpeg",
      "images/AL-049/american-leather-02.jpeg",
      "images/AL-049/american-leather-03.jpeg",
      "images/AL-049/american-leather-04.jpeg",
      "images/AL-049/american-leather-05.jpeg",
      "images/AL-049/american-leather-06.jpeg",
      "images/AL-049/american-leather-07.jpeg",
      "images/AL-049/american-leather-08.jpeg",
      "images/AL-049/american-leather-09.jpeg",
      "images/AL-049/american-leather-10.jpeg",
      "images/AL-049/american-leather-11.jpeg",
      "images/AL-049/american-leather-12.jpeg",
      "images/AL-049/american-leather-13.jpeg",
      "images/AL-049/american-leather-14.jpeg",
      "images/AL-049/american-leather-15.jpeg",
      "images/AL-049/american-leather-16.jpeg",
      "images/AL-049/american-leather-17.jpeg",
      "images/AL-049/american-leather-18.jpeg",
    ]
  },
  {
    brand: "Crate & Barrel",
    title: "Aris 2-Piece Bench Sectional with Right-Arm Chaise — Thrive Ink",
    slug: "crate-and-barrel-aris-bench-sectional-edmonton",
    metaTitle: "Pre-Owned Crate & Barrel Aris Sectional Sofa for Sale in Edmonton",
    metaDescription: "Pre-owned Crate & Barrel Aris 2-piece bench sectional with right-arm chaise in Thrive Ink performance fabric. Delivery across Alberta. {price}.",
    availabilityStarts: "2026-08-24",
    reserved: "2026-09-13",
    model: "Aris 2-Piece Bench Sectional",
    productionDate: "2023-03",
    material: "Thrive Performance Fabric",
    materialFeed: "Olefin",
    color: "Ink",
    conditionGrade: "Excellent",
    dimensions: {
      width: "109", depth: "69", height: "31.25",
      extra: [
        { label: "Height over back cushion", value: "32.5 in" },
        { label: "Sofa module depth",        value: "37.5 in" },
      ],
    },
    description: "The Aris is a two-piece sectional \u2014 a sofa module and a right-facing chaise module. The bench-style seat cushion runs uninterrupted across the sofa, so there are no seams between cushions and fewer places to lose your keys. The chaise module is 69 inches deep for full-length lounging; the sofa module is 37.5 inches deep. Both use the same feather-down-wrapped foam cushions over a hardwood frame, in Crate & Barrel's Thrive performance fabric.",
    features: [
      "Hardwood frame, FSC® Certified — wood sourced from forests certified as responsibly managed",
      "Polyfoam core seat cushions wrapped in a feather-down blend",
      "Back cushions of polyfiber blend encased in polyester sheeting",
      "Thrive performance fabric in Ink — 97% olefin, 3% polyester textured basketweave, woven in the United States",
      "Solution-dyed olefin — resists staining and fading, cleans easily, holds up to pets and kids",
      "GREENGUARD Gold Certified for low chemical emissions",
      "Bench seats — one uninterrupted cushion per module, so there is no centre gap down the seating surface",
      "Two bolster pillows included",
      "Right-arm chaise, left-arm sofa — chaise on the right as you face the piece",
      "Made in USA of domestic and imported materials",
    ],
    condition: "The Thrive upholstery is clean and even across both modules with no staining, fading, or pilling. The frame is solid and quiet, and the bench cushions hold their shape and loft. Both bolster pillows are present and the original Crate & Barrel label is still attached. Photographed as-is in our storage bay.",
    configuration: "Two modules — a left-arm sofa and a right-arm chaise — plus two bolster pillows, exactly as shown. The modules connect to form a right-facing L; the chaise is not reversible to the left side.",
    faq: [
      { question: "Is this an authentic Crate & Barrel Aris sectional?", answer: "Yes. The original woven Crate & Barrel label is still attached to the frame — it is the last photo in the listing, shown alongside the factory law tag. The Aris two-piece sectional is also a Crate & Barrel exclusive, meaning it is not sold through any other retailer. Every designer piece we list is inspected for construction, materials, and manufacturer consistency before going up." },
      { question: "Which side is the chaise on?", answer: "The right, as you face the piece. The configuration is a right-arm chaise paired with a left-arm sofa, so it forms a right-facing L. The two modules are handed and cannot be swapped to put the chaise on the left." },
      { question: "What is the Thrive Ink fabric like?", answer: "Thrive is one of Crate & Barrel's performance fabrics — a textured basketweave where a heathered warp and a bouclé yarn create noticeable tone variation up close. Ink is a deep heathered blue-slate. The blend is 97% olefin and 3% polyester woven in the United States; olefin is solution-dyed, so it resists staining and fading and cleans easily, which is why it is rated for active, pet-friendly households. It is also GREENGUARD Gold Certified for low chemical emissions." },
      { question: "What are the exact dimensions?", answer: "The sectional is 109 inches wide and 31.25 inches high at the frame, or 32.5 inches measured over the back cushion. The 69-inch overall depth is measured across the chaise; the sofa module is 37.5 inches deep, so only the chaise end carries that deep footprint. Measure your doorways and any turns before delivery day: the piece comes apart into two modules, which makes it far easier to move than the overall dimensions suggest." },
      { question: "How old is it?", answer: "It was manufactured in March 2023, so it is a current-generation Aris rather than an older discontinued version. It has been in a single home since and is in excellent condition." },
      { question: "Do you deliver?", answer: "Yes. We deliver throughout Edmonton and surrounding areas, and we arrange delivery across Alberta on request. Delivery is offered for an additional fee that depends on distance and access." },
    ],
    retailEstimate: 4838,
    retailVerified: true,
    price: 2900,
    specs: ["Crate & Barrel", "109 × 69 × 31.25 in", "Thrive Ink Performance Fabric", "Right-Arm Chaise", "Made in USA", "Excellent Condition"],
    images: [
      "images/CB-048/crate-and-barrel-01.jpeg",
      "images/CB-048/crate-and-barrel-02.jpeg",
      "images/CB-048/crate-and-barrel-03.jpeg",
      "images/CB-048/crate-and-barrel-04.jpeg",
      "images/CB-048/crate-and-barrel-05.jpeg",
      "images/CB-048/crate-and-barrel-06.jpeg",
      "images/CB-048/crate-and-barrel-07.jpeg",
      "images/CB-048/crate-and-barrel-08.jpeg",
      "images/CB-048/crate-and-barrel-09.jpeg",
      "images/CB-048/crate-and-barrel-10.jpeg",
    ]
  },
  {
    brand: "B&B Italia",
    title: "Charles Left-Facing Sectional — Off-White Rattier Fabric",
    slug: "b-b-italia-charles-sectional-edmonton",
    metaTitle: "Pre-Owned B&B Italia Charles Sectional Sofa for Sale in Edmonton",
    metaDescription: "Pre-owned B&B Italia Charles sectional sofa in Edmonton. Professionally inspected and cleaned. Delivery available across Alberta. {price}.",
    availabilityStarts: "2026-05-15",
    model: "Charles",
    productionDate: "2007",
    material: "Esopo Rattier",
    materialFeed: "Fabric",
    color: "Off White",
    conditionGrade: "Fair",
    dimensions: { width: "129", depth: "91", height: "29" },
    description: "The Charles is one of the most referenced sofas in contemporary Italian design \u2014 Antonio Citterio for B&B Italia, in continuous production since its introduction. It is defined by restraint: a low profile, clean geometry, and die-cast aluminium feet cast in an inverted L that give the piece its floating look. The back is a set of free, independently placed cushions rather than fixed bolsters, so the silhouette stays open while still supporting properly. This configuration is a left-facing L \u2014 a sofa body running right with a full chaise extending left. The covers come off for cleaning, which is why well-kept Charles sectionals stay in circulation for decades.",
    features: [
      "Internal frame: tubular steel and steel profiles",
      "Internal frame upholstery: Bayfit® (Bayer®) flexible cold-shaped polyurethane foam with polyester fibre cover",
      "Seat cushion upholstery: shaped polyurethane of different densities, sterilized down, polyester fibre cover",
      "Back cushions: polyester fibre fill, box-style construction",
      "Feet: die-cast aluminium in inverted \"L\" profile",
      "Covers: fully removable via Velcro attachment — can be professionally reupholstered or cleaned off the frame",
    ],
    condition: "Structurally excellent — frame, cushions, and down fill all intact. The Rattier fabric shows subtle tonal variation on the seating surface from previous spot-cleaning; the effect is minor and reads as natural textile variation at conversational distance. Covers are removable and can be professionally laundered or replaced as desired.",
    configuration: "Left-facing chaise module, sofa body, all original back cushions and seat cushions.",
    faq: [
      { question: "Is this an authentic B&B Italia Charles sectional?", answer: "Yes. This is an authentic B&B Italia Charles, designed by Antonio Citterio. Every designer piece we list is inspected for construction, materials, and manufacturer consistency before going up. The Charles is identifiable by its signature inverted-L die-cast aluminium feet, tubular steel frame, and Velcro-attached removable cover system." },
      { question: "Are the covers removable?", answer: "Yes. The Charles is built around a fully removable cover system attached with Velcro. Covers come off the frame for professional laundering or replacement without involving an upholsterer." },
      { question: "Do you deliver outside Edmonton?", answer: "Yes. We deliver throughout Edmonton and surrounding areas, and we arrange delivery across Alberta on request. Delivery is offered for an additional fee that depends on distance and access." },
      { question: "Can this sectional be shipped outside Alberta?", answer: "Yes. Shipping across Canada — or anywhere in North America — can be arranged at the buyer's expense. Contact us before purchase and we'll coordinate a carrier and confirm the shipping cost to your location." },
      { question: "Can the covers be professionally cleaned or replaced?", answer: "Yes. Because the Rattier fabric covers detach from the frame, they can be sent out for professional cleaning, or replaced entirely. B&B Italia continues to produce Charles cover sets in current fabrics, which is one of the reasons well-maintained Charles sectionals stay in circulation for decades." },
      { question: "What condition is the sectional in?", answer: "Structurally excellent. The frame, cushions, and down fill are all intact. The Rattier fabric shows subtle tonal variation on the seating surface from previous spot-cleaning; the effect is minor and reads as natural textile variation at conversational distance. Covers are removable and can be professionally laundered or replaced if desired." },
    ],
    retailEstimate: 28000,
    price: 4200,
    specs: ["B&B Italia", "129 × 91 × 29 in", "Steel Frame", "Rattier Fabric", "Good Condition", "North America Shipping Available"],
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

// Retail anchor label — mirror of retailLabel() in build.js, which feeds the
// crawler fallback and the listing-page value pill. Keep the two in sync: a
// visitor sees this copy, a crawler sees the Node one. See CLAUDE.md §5.10.
var _RETAIL_SUFFIX = ' plus tax &amp; delivery';
function retailLabel(item) {
  if (!item.retailEstimate) return '';
  return (item.retailVerified ? 'Retail: ' : 'Est. Retail: ') +
    formatPrice(item.retailEstimate) + (item.retailEstimateApprox ? '+' : '') +
    ' CAD' + _RETAIL_SUFFIX;
}

function renderAvailable() {
  var grid = document.getElementById('available-grid');
  if (availableItems.length === 0) {
    grid.style.display = 'none';
    return;
  }

  // Reserved pieces render last — mirror of displayOrder() in build.js, so the
  // crawler fallback and the JS grid agree on order (§5.10).
  var ordered = availableItems.filter(function(i) { return !i.reserved; })
    .concat(availableItems.filter(function(i) { return !!i.reserved; }));

  grid.innerHTML = ordered.map(function(item) {
    var slug = item.slug || slugify(item.brand + '-' + item.title);
    var listingUrl = '/listings/' + slug + '/';

    var brandLine = item.comingSoon
      ? '<div class="card-meta"><div class="card-brand">' + item.brand + '</div><span class="coming-soon-badge">Coming Soon</span></div>'
      : item.reserved
        ? '<div class="card-meta"><div class="card-brand">' + item.brand + '</div><span class="coming-soon-badge reserved-badge">Reserved</span></div>'
        : '<div class="card-brand">' + item.brand + '</div>';

    var titleEl = item.comingSoon
      ? '<div class="card-title">' + item.title + '</div>'
      : '<div class="card-title"><a class="card-title-link" href="' + listingUrl + '">' + item.title + '</a></div>';

    var priceCta = item.comingSoon
      ? '<div class="card-price card-price--muted">Listing coming soon</div>'
      : '<div class="card-price">' + formatPrice(item.price) + ' <span class="card-price-currency">CAD</span></div>';

    // Retail anchor — same comparison the listing page carries (§5.10).
    var retailAnchor = (item.comingSoon || !item.retailEstimate)
      ? ''
      : '<div class="card-retail">' + retailLabel(item) + '</div>';

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
        retailAnchor +
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
