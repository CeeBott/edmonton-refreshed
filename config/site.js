/**
 * Site config — city-specific values.
 *
 * To spin up a new city deployment (e.g., Calgary), fork the repo and edit
 * this file. URLs in config/taxonomy.js are templated against `citySlug`, so
 * a single rename here propagates through the nav, footer, and sell-landing
 * URL generation in build.js.
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
  piecesSold: '41+',
  piecesBought: '41+',
  rating: '4.9',
  ratingCount: 18,
  offerRange: 'Most Offers $500–$2,500',
};
