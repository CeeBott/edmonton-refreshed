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
    title: "Gather 89-Inch Wood Base Bench Sofa — Tribute Gravel",
    slug: "crate-and-barrel-gather-89-bench-sofa-edmonton",
    metaTitle: "Pre-Owned Crate & Barrel Gather Bench Sofa for Sale in Edmonton",
    metaDescription: "Pre-owned Crate & Barrel Gather 89-inch bench sofa on a bleached rubberwood base, Tribute Gravel fabric. Delivery across Alberta. {price}.",
    availabilityStarts: "2026-09-24",
    model: "Gather Wood Base Bench Sofa",
    productionDate: "2022-10",
    material: "Tribute Performance Fabric",
    materialFeed: "Polyester",
    color: "Gravel",
    conditionGrade: "Good",
    dimensions: {
      width: "89", depth: "38", height: "36",
      extra: [
        { label: "Inside seat width", value: "81 in" },
        { label: "Seat depth",        value: "23 in" },
        { label: "Seat height",       value: "19 in" },
        { label: "Arm height",        value: "26 in" },
        { label: "Base height",       value: "4 in" },
      ],
    },
    description: "The Gather is one of Crate & Barrel's best-known sofas, and this is the 89-inch version with a single bench seat cushion and a bleached rubberwood base in place of legs. The base runs the full perimeter, so the sofa sits low and solid, and the pale wood keeps it from reading heavy. The seat is boxy and extra-plush on an innerspring core, with two fibre-filled back cushions that let you sink back and lounge. In Tribute Gravel, a light grey-oatmeal twill, it suits a modern or Scandinavian-leaning room and pairs easily with warm wood floors.",
    features: [
      "Single bench seat cushion — no seams across the 81-inch seating surface",
      "Bleached rubberwood base in place of legs",
      "Frame of FSC®-certified engineered hardwood, kiln-dried to prevent warping",
      "Seat cushion is an innerspring core wrapped in polyfoam, with fibre encased in ticking",
      "Back cushions are full-blown fibre encased in ticking",
      "Sinuous wire spring suspension",
      "Top-stitch detailing",
      "Tribute performance fabric — 100% polyester classic twill, OEKO-TEX® STANDARD 100 certified",
      "Cleaning code WS — water- or solvent-based cleaners",
      "Made in USA of domestic and imported materials",
    ],
    condition: "Four years of use show mainly as pilling, which is normal for a performance twill. We shaved the pilling off the seat, arms, back and cushions, then extraction cleaned the upholstery throughout. Colour is even across the seat, arms and back, and the bleached rubberwood base is intact at every corner. The Crate & Barrel label and the dated factory law tag are both still attached. Photographed as-is in our storage bay after cleaning.",
    configuration: "The sofa with its bench seat cushion and two back cushions, exactly as shown.",
    faq: [
      { question: "Is this an authentic Crate & Barrel Gather sofa?", answer: "Yes. The woven Crate & Barrel label and the factory law tag, dated October 2022, are both still attached — they are the last two photos in the listing. The Gather is a Crate & Barrel exclusive and is not sold through other retailers. Every designer piece we list is inspected for construction, materials, and manufacturer consistency before going up." },
      { question: "What is Tribute fabric like?", answer: "Tribute is one of Crate & Barrel's performance fabrics — a 100% polyester classic twill with a soft, casual hand, made to stand up to everyday family use and to clean easily. It is OEKO-TEX STANDARD 100 certified. Gravel is a light grey-oatmeal neutral. Blot spills right away with a clean cloth, and spot clean with a damp cloth and mild detergent; its cleaning code is WS." },
      { question: "What are the exact dimensions?", answer: "It is 89 inches wide, 38 inches deep, and 36 inches high, with a 26-inch arm height. Inside, the seat is 81 inches wide, 23 inches deep, and 19 inches high. The wood base is 4 inches tall. The sofa is one piece, so measure doorways, hallways, and stair turns before delivery day." },
      { question: "How old is it?", answer: "The factory law tag is dated October 2022. It is a current Crate & Barrel model, still sold new." },
      { question: "Do you deliver?", answer: "Yes. We deliver throughout Edmonton and surrounding areas, and we arrange delivery across Alberta on request. Delivery is offered for an additional fee that depends on distance and access." },
    ],
    retailEstimate: 5529,
    retailVerified: true,
    price: 2300,
    specs: ["Crate & Barrel", "89 × 38 × 36 in", "Tribute Gravel Performance Fabric", "Bleached Rubberwood Base", "Good Condition"],
    images: [
      "images/CB-050/crate-and-barrel-01.jpeg",
      "images/CB-050/crate-and-barrel-02.jpeg",
      "images/CB-050/crate-and-barrel-03.jpeg",
      "images/CB-050/crate-and-barrel-04.jpeg",
      "images/CB-050/crate-and-barrel-05.jpeg",
      "images/CB-050/crate-and-barrel-06.jpeg",
      "images/CB-050/crate-and-barrel-07.jpeg",
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
