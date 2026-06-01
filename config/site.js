/**
 * Site config — city-specific values.
 *
 * To spin up a new city deployment (e.g., Calgary), fork the repo and edit
 * this file. Sell-landing URLs are city-agnostic paths (`/sell/<slug>/`) served
 * from a per-city domain, so they no longer carry a city slug; the local signal
 * lives in copy, schema, and the domain. `citySlug` is retained for city
 * identity but no longer drives sell-landing URL generation.
 */
module.exports = {
  // City
  citySlug: 'edmonton',
  cityName: 'Edmonton',
  province: 'Alberta',
  provinceCode: 'AB',
  country: 'CA',
  countryName: 'Canada',

  // Brand
  brandName: 'Edmonton Refreshed',
  brandFullName: 'Edmonton Refreshed Seating',
  brandTagline: 'Better furniture. Better experience.',
  brandStatement:
    'Edmonton Refreshed buys and resells premium pre-owned sofas and sectionals across Edmonton and surrounding areas.',
  brandSubstatement:
    'Viewings by appointment. Professionally inspected pieces from recognized brands.',

  // Contact
  phone: '780-965-1477',
  phoneDigits: '7809651477',
  email: 'info@edmontonrefreshed.com',

  // Business stats — update sitewide by editing here
  piecesSold: '40+',
  piecesBought: '41+',
  rating: '4.9',
  ratingCount: 18,
  offerRange: 'Most Offers $500–$2,500',

  // sameAs — canonical external profile URLs for Knowledge Graph entity
  // consolidation. Read into every Organization / FurnitureStore schema by
  // build.js, and referenced by hand-maintained sameAs arrays in pages that
  // don't go through build.js (homepage FurnitureStore, about Organization,
  // sell hub FurnitureStore, sell-landing FurnitureStore schemas). Adding a
  // new profile (e.g. YouTube, Pinterest) — append the URL here and rebuild;
  // the hand-maintained pages still require a one-time manual sync.
  sameAs: [
    'https://maps.app.goo.gl/Nipdt38odihmKEfG7',     // Google Business Profile
    'https://www.facebook.com/edmontonrefreshed',
  ],
};
