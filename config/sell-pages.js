/**
 * Sell-cluster page registry — one entry per page that carries a sell form,
 * a "How it works" block, or a sold-card ItemList. Keyed by repo-relative
 * path. build.js reads everything per-page from here; nothing per-page is
 * hardcoded in the build any more.
 *
 * Fields (all optional except type):
 *   type        hub | brand | piece | situation | eligibility | partner | legacy
 *               Brand pages never render the buying-rules fit check: their
 *               sellers already arrive with the brand (config/buy-criteria.js).
 *   brand       Pre-fills the form's Brand field (brand pages). A pre-filled
 *               brand also drops the mass-market acknowledgment (§5.11).
 *   notesLabel / notesPlaceholder
 *               Situational wording for the form's optional Notes field.
 *   soldSchema  { name, description } for the Recently sold ItemList (§5.16).
 *   showcase    { brand, match, leather } — which pieces this page features in
 *               its hero mosaic and Recently sold strip. brand = brand family
 *               (first word); match = "sofa|loveseat" style title test;
 *               leather = true for leather only. Omit to feature everything.
 *   mosaic      { caption, images: [[path, alt], ...] } pins the hero photos
 *               instead of picking them from showcase (the hub).
 *   howTo       { heading, name, basis, note } for the shared How it works
 *               block and its HowTo schema (partials/sell-howto.js).
 *               heading = the visible h2; name = the HowTo schema name;
 *               basis = what an offer is based on (default "brand, age, and
 *               condition"); note = one optional page-specific sentence.
 *
 * Adding a sell page: add its entry here (the /add-sell-page skill does it).
 */
module.exports = {
  'sell/index.html': {
    type: "hub",
    // Pinned hero photos (Collin approved this set, 2026-09-27).
    mosaic: {
      caption: 'Recent buys from Edmonton homes',
      images: [
        ['images/BB-030/bb-italia-01.jpeg', 'B&B Italia Charles sofa'],
        ['images/PB-045/pottery-barn-01.jpeg', 'Pottery Barn Turner leather sofa'],
        ['images/Sold Inventory/NE-029/natuzzi-editions-01.jpeg', 'Natuzzi Editions Saggezza leather sectional'],
        ['images/CB-048/crate-and-barrel-01.jpeg', 'Crate & Barrel Aris sectional'],
      ],
    },
    soldSchema: {
      name: "Recently Purchased Pieces in Edmonton",
      description: "Photos of pre-owned sofas and sectionals recently purchased and resold by Edmonton Refreshed across Edmonton and surrounding communities.",
    },
    howTo: {
      heading: "How it works",
      name: "How to Sell Your Sofa or Sectional in Edmonton",
    },
  },
  'sell/natuzzi/index.html': {
    type: "brand",
    showcase: { brand: 'Natuzzi' },
    brand: "Natuzzi",
    soldSchema: {
      name: "Recently Purchased Natuzzi Pieces in Edmonton",
      description: "Photos of pre-owned Natuzzi Italia and Natuzzi Editions sofas and sectionals purchased and resold by Edmonton Refreshed.",
    },
    howTo: {
      heading: "How selling your Natuzzi works",
      name: "How to Sell Your Natuzzi Sofa or Sectional in Edmonton",
      basis: "Natuzzi line (Italia or Editions), leather grade, age, and condition",
    },
  },
  'sell/rove-concepts/index.html': {
    type: "brand",
    showcase: { brand: 'Rove Concepts' },
    brand: "Rove Concepts",
    soldSchema: {
      name: "Recently Purchased Rove Concepts Pieces in Edmonton",
      description: "Photos of pre-owned Rove Concepts sofas and sectionals — Milo, Porter, Kaye, Luca, and others — purchased and resold by Edmonton Refreshed.",
    },
    howTo: {
      heading: "How selling your Rove Concepts piece works",
      name: "How to Sell Your Rove Concepts Sofa or Sectional in Edmonton",
      basis: "model, upholstery (bouclé, performance fabric, or leather), age, and condition",
    },
  },
  'sell/eq3/index.html': {
    type: "brand",
    showcase: { brand: 'EQ3' },
    brand: "EQ3",
    soldSchema: {
      name: "Recently Purchased EQ3 Pieces in Edmonton",
      description: "Photos of pre-owned EQ3 sofas and sectionals — Replay, Remi, Salema, Cello, and others — purchased and resold by Edmonton Refreshed.",
    },
    howTo: {
      heading: "How selling your EQ3 piece works",
      name: "How to Sell an EQ3 Sofa or Sectional in Edmonton",
      basis: "model, fabric or leather, age, and condition",
    },
  },
  'sell/crate-and-barrel/index.html': {
    type: "brand",
    showcase: { brand: 'Crate & Barrel' },
    brand: "Crate &amp; Barrel",
    soldSchema: {
      name: "Recently Purchased Crate & Barrel Pieces in Edmonton",
      description: "Photos of pre-owned Crate & Barrel sofas and sectionals — Lounge, Axis, Gather, Rochelle and others — purchased and resold by Edmonton Refreshed.",
    },
    howTo: {
      heading: "How selling your Crate & Barrel piece works",
      name: "How to Sell a Crate & Barrel Sofa or Sectional in Edmonton",
      basis: "model, fabric or leather, age, and condition",
    },
  },
  'sell/restoration-hardware/index.html': {
    type: "brand",
    soldSchema: {
      name: "Recently Purchased Restoration Hardware Pieces in Edmonton",
      description: "Photos of pre-owned Restoration Hardware sofas and sectionals purchased and resold by Edmonton Refreshed.",
    },
    showcase: { brand: 'Restoration Hardware' },
    brand: "Restoration Hardware",
    howTo: {
      heading: "How selling your Restoration Hardware piece works",
      name: "How to Sell a Restoration Hardware Sofa or Sectional in Edmonton",
      basis: "the collection, upholstery (leather grade or fabric type), age, and condition",
    },
  },
  'sell/west-elm/index.html': {
    type: "brand",
    soldSchema: {
      name: "Recently Purchased West Elm Pieces in Edmonton",
      description: "Photos of pre-owned West Elm sofas, sectionals, and chairs purchased and resold by Edmonton Refreshed.",
    },
    showcase: { brand: 'West Elm' },
    brand: "West Elm",
    howTo: {
      heading: "How selling your West Elm piece works",
      name: "How to Sell a West Elm Sofa or Sectional in Edmonton",
      basis: "model, fabric or leather, age, and condition",
    },
  },
  'sell/american-leather-edmonton/index.html': {
    type: "legacy",
    brand: "American Leather",
  },
  'sell/bb-italia-edmonton/index.html': {
    type: "legacy",
    brand: "B&amp;B Italia",
  },
  'sell/sofa/index.html': {
    type: "piece",
    soldSchema: {
      name: "Recently Purchased Sofas in Edmonton",
      description: "Photos of pre-owned sofas and loveseats purchased and resold by Edmonton Refreshed.",
    },
    showcase: { match: 'sofa|loveseat' },
    howTo: {
      heading: "How selling your sofa works",
      name: "How to Sell a Sofa in Edmonton",
      basis: "brand, age, upholstery, and condition",
    },
  },
  'sell/leather-sofa/index.html': {
    type: "piece",
    showcase: { match: 'sofa|loveseat', leather: true },
    soldSchema: {
      name: "Recently Purchased Leather Sofas in Edmonton",
      description: "Photos of pre-owned leather sofas recently purchased and resold by Edmonton Refreshed across Edmonton and surrounding communities.",
    },
    howTo: {
      heading: "How selling your leather sofa works",
      name: "How to Sell a Leather Sofa in Edmonton",
      basis: "brand, leather grade (aniline, semi-aniline, or top-grain), age, and condition",
    },
  },
  'sell/sectional/index.html': {
    type: "piece",
    showcase: { match: 'sectional' },
    soldSchema: {
      name: "Recently Purchased Sectionals in Edmonton",
      description: "Photos of pre-owned sectionals recently purchased and resold by Edmonton Refreshed across Edmonton and surrounding communities.",
    },
    howTo: {
      heading: "How selling your sectional works",
      name: "How to Sell a Sectional in Edmonton",
      basis: "brand, configuration, upholstery, age, and condition",
    },
  },
  'sell/leather-sectional/index.html': {
    type: "piece",
    showcase: { match: 'sectional', leather: true },
    soldSchema: {
      name: "Recently Purchased Leather Sectionals in Edmonton",
      description: "Photos of pre-owned leather sectionals recently purchased and resold by Edmonton Refreshed across Edmonton and surrounding communities.",
    },
    howTo: {
      heading: "How selling your leather sectional works",
      name: "How to Sell a Leather Sectional in Edmonton",
      basis: "brand, leather grade (aniline, semi-aniline, or top-grain), age, and condition",
    },
  },
  'sell/furniture-consignment/index.html': {
    type: "situation",
    soldSchema: {
      name: "Recently Purchased Pieces in Edmonton — Direct Buyouts",
      description: "Photos of pre-owned sofas and sectionals purchased outright in Edmonton — an alternative to local consignment channels.",
    },
    howTo: {
      heading: "How selling direct instead of consignment works",
      name: "How to Sell Furniture Direct in Edmonton Instead of Consignment",
      basis: "brand, age, condition, and the current local resale market",
      note: "No commission, no markdown schedule.",
    },
  },
  'sell/selling-furniture-before-moving/index.html': {
    type: "situation",
    notesLabel: "Anything we should know? (Move date, building access, etc.)",
    notesPlaceholder: "Move date, building access, anything else",
    soldSchema: {
      name: "Recently Purchased Pieces from Edmonton Sellers",
      description: "Photos of pre-owned sofas and sectionals recently purchased and resold by Edmonton Refreshed across Edmonton and surrounding communities.",
    },
    howTo: {
      heading: "How selling before your move works",
      name: "How to Sell Furniture Before a Move in Edmonton",
      basis: "brand, age, condition, and the local resale market",
    },
  },
  'sell/downsizing-furniture/index.html': {
    type: "situation",
    notesLabel: "Anything we should know? (Multiple pieces, building access, timing)",
    notesPlaceholder: "Number of pieces, building access, timing, anything else",
    soldSchema: {
      name: "Recently Purchased Pieces from Edmonton Households",
      description: "Photos of pre-owned sofas and sectionals recently purchased and resold by Edmonton Refreshed across Edmonton and surrounding communities.",
    },
    howTo: {
      heading: "How selling while downsizing works",
      name: "How to Sell Furniture While Downsizing in Edmonton",
    },
  },
  'sell/sell-furniture-fast/index.html': {
    type: "situation",
    notesLabel: "Anything we should know? (Timeline, building access, etc.)",
    notesPlaceholder: "When does the piece need to be gone? Any access notes?",
    soldSchema: {
      name: "Recently Purchased Pieces in Edmonton — Fast Buyouts",
      description: "Photos of pre-owned sofas and sectionals recently purchased on tight timelines by Edmonton Refreshed across Edmonton and surrounding communities.",
    },
    howTo: {
      heading: "How selling fast works",
      name: "How to Sell Premium Furniture Fast in Edmonton",
      basis: "brand, age, condition, and the local resale market",
      note: "Firm number, no escalation.",
    },
  },
  'sell/estate-furniture/index.html': {
    type: "situation",
    notesLabel: "Anything we should know? (Multiple pieces, timeline, executor details)",
    notesPlaceholder: "Number of pieces, timeline, who the offer should be paid to",
    soldSchema: {
      name: "Recently Purchased Pieces from Edmonton Estates and Family Homes",
      description: "Photos of pre-owned sofas and sectionals purchased from estates and family homes across Edmonton and surrounding communities.",
    },
    howTo: {
      heading: "How selling estate furniture works",
      name: "How to Sell Estate Furniture in Edmonton",
      basis: "brand, age, and condition",
      note: "We're patient with timeline questions and probate considerations. The offer holds while the family or executor coordinates a decision.",
    },
  },
  'sell/sell-designer-furniture/index.html': {
    type: "situation",
    notesLabel: "Anything we should know? (Model name, leather grade, original retailer)",
    notesPlaceholder: "Model, fabric/leather, where it was originally purchased",
    soldSchema: {
      name: "Recently Purchased Designer Pieces in Edmonton",
      description: "Photos of pre-owned designer and premium sofas and sectionals recently purchased and resold by Edmonton Refreshed across Edmonton and surrounding communities.",
    },
    howTo: {
      heading: "How selling a designer piece works",
      name: "How to Sell Designer Furniture in Edmonton",
      basis: "brand, line, leather grade or fabric type, age, and condition",
      note: "We know the designer brands and price them accordingly.",
    },
  },
  'sell/what-we-buy/index.html': {
    type: "eligibility",
    soldSchema: {
      name: "Pieces We've Bought in Edmonton",
      description: "Photos of pre-owned sofas and sectionals purchased and resold by Edmonton Refreshed.",
    },
    notesLabel: "Anything we should know? (Model name, leather grade, original retailer)",
    notesPlaceholder: "Model, fabric/leather, where it was originally purchased",
    howTo: {
      heading: "How selling to us works",
      name: "How to Sell Your Sofa or Sectional to Edmonton Refreshed",
      basis: "brand, age, and condition",
      note: "If your piece isn’t a fit, we tell you that quickly and point you to a better channel.",
    },
  },
  'partners/index.html': {
    type: "partner",
    soldSchema: {
      name: "Pieces Recently Bought Through Edmonton Refreshed",
      description: "Photos of pre-owned premium sofas and sectionals purchased directly from Edmonton homes and resold by Edmonton Refreshed.",
    },
  },
};
