/**
 * Taxonomy — single source of truth for brands, furniture types, and seller
 * situations. The nav dropdown, footer columns, and sell-landing page URLs
 * are all generated from this file at build time.
 *
 * To add a new sell-landing page: add an entry below, create the HTML file at
 * the matching URL, then run `node build.js`. The nav and footer will pick up
 * the new link automatically on the next build — no per-page edits required.
 */
// Sell-landing page paths are city-agnostic (no -edmonton suffix). The local
// signal comes from the domain, page copy, and schema — not the slug. A
// multi-city fork lives on its own domain, so `/sell/<slug>/` never collides.
const sellUrl = (slug) => `/sell/${slug}/`;

// Furniture types — the "Sell by Furniture Type" footer column.
// `name` = footer label, `nav` = short label used in the nav dropdown.
const furnitureTypes = [
  { name: 'Sectionals',         nav: 'Sectional',         slug: 'sectional' },
  { name: 'Leather Sectionals', nav: 'Leather Sectional', slug: 'leather-sectional' },
  { name: 'Sofas',              nav: 'Sofa',              slug: 'sofa' },
  { name: 'Leather Sofas',      nav: 'Leather Sofa',      slug: 'leather-sofa' },
  { name: 'Couches',            nav: 'Couch',             slug: 'couch' },
  { name: 'Leather Couches',    nav: 'Leather Couch',     slug: 'leather-couch' },
];

// Selling situations — the "Sell By Situation" footer column.
const situations = [
  { name: 'Furniture Consignment',   nav: 'Consignment',   slug: 'furniture-consignment' },
  { name: 'Selling Before Moving',   nav: 'Before a move', slug: 'selling-furniture-before-moving' },
  { name: 'Downsizing Furniture',    nav: 'Downsizing',    slug: 'downsizing-furniture' },
  { name: 'Estate Furniture',        nav: 'Estate',        slug: 'estate-furniture' },
  { name: 'Sell Premium Furniture Fast', nav: 'Sell fast', slug: 'sell-furniture-fast' },
  { name: 'Sell Designer Furniture', nav: 'Designer',      slug: 'sell-designer-furniture' },
];

// Recognized brands — the "Sell By Brand" footer column.
// `displayName` (optional) lets us use the HTML-entity form where needed
// (e.g., "Crate &amp; Barrel" for safe inline rendering).
const brands = [
  { name: 'Natuzzi',              slug: 'natuzzi' },
  { name: 'Restoration Hardware', slug: 'restoration-hardware' },
  { name: 'EQ3',                  slug: 'eq3' },
  { name: 'Crate & Barrel',       slug: 'crate-and-barrel', displayName: 'Crate &amp; Barrel' },
  { name: 'Rove Concepts',        slug: 'rove-concepts' },
  { name: 'West Elm',             slug: 'west-elm' },
];

module.exports = {
  furnitureTypes,
  situations,
  brands,
  sellUrl,
};
