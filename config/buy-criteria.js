/**
 * Buying rules — the single source for what Edmonton Refreshed buys and what
 * it passes on. Rendered into:
 *
 *   - the "Before you send photos" fit check (FIT_CHECK markers, §5.13)
 *   - the "Brands we buy" / "Not a fit" lists (FIT_LISTS markers)
 *   - the form's mass-market acknowledgment note and the soft brand warning
 *     under Brand (partials/sell-form.js → js/sell-form.js)
 *
 * Change a threshold or a brand here once and rebuild; never edit the
 * rendered blocks on a page. The lists render identically on every non-brand
 * sell page, /sell/what-we-buy/ and /partners/ included. Page prose and the
 * FAQs are hand-written and must be checked by hand when these rules change.
 *
 * Brand pages never show the fit check: sellers there arrive with the brand
 * they searched for (Collin, 2026-09-27). The build warns if one does.
 *
 * Copy here renders as-is: no em dashes (house style).
 */

const minRetail = 3000;   // original retail, CAD
const maxAgeYears = 10;

module.exports = {
  minRetail,
  maxAgeYears,

  // Fit check, left column. A piece must meet ALL of these. [text, aside]
  weBuy: [
    ['A sofa or sectional', 'exceptional chairs considered'],
    ['From a recognized brand or premium retailer', '$' + minRetail.toLocaleString('en-CA') + '+ new'],
    ['Roughly ' + maxAgeYears + ' years old or newer', ''],
    ['In good condition', 'no major damage, staining, or pet damage'],
  ],

  // Fit check, right column.
  noOffers: [
    'IKEA, Ashley, Leon\u2019s, The Brick, or similar',
    'Bonded or faux leather, or microfiber',
    'Tables, desks, storage, or bedroom furniture',
  ],

  // "Brands we buy" tags, in display order. A brand whose name starts with a
  // brand in config/taxonomy.js links to that sell page automatically (first
  // match only), so a new brand page is linked from the hub the moment it
  // exists. [name, qualifier]
  brandsWeBuy: [
    ['B&B Italia', ''], ['Natuzzi Italia', ''], ['Herman Miller', ''], ['Knoll', ''],
    ['Roche Bobois', ''], ['Restoration Hardware', ''], ['Design Within Reach', ''],
    ['Rove Concepts', ''], ['EQ3', ''], ['West Elm', ''], ['Crate & Barrel', ''],
    ['Pottery Barn', ''], ['American Leather', ''], ['Room & Board', ''],
    ['Natuzzi Editions', ''], ['Younger', ''], ['VanGogh', ''],
    ['Brentwood Classics', ''],
    ['La-Z-Boy', 'leather & premium'], ['Urban Barn, CB2, Article', 'select'],
    ['Signature Lane & Cottswood Interiors', ''],
  ],

  // "Not a fit" list.
  notAFit: [
    'Ashley, IKEA, Leon\u2019s, The Brick',
    'Bonded or faux leather',
    'Microfiber recliners',
    'White or light fabric on mid-tier brands',
    'Unbranded, without premium-retailer provenance',
    'Major damage, pet damage, staining, or smoke saturation',
    'Tables, desks, storage, and bedroom furniture',
    'Standalone chairs, unless exceptional',
    'Hide-a-beds or recliners with mechanical issues',
  ],

  // Soft warning under the form's Brand field. [label shown, regex source]
  // matched case-insensitively. From brands actually passed on in the Leads
  // tab (Apr to Sep 2026) plus the four the site already names.
  massMarketBrands: [
    ['IKEA', '\\bikea\\b'],
    ['Ashley', '\\bashley\\b'],
    ['Leon\u2019s', '\\bleon[\u2019\']?s\\b'],
    ['The Brick', '\\b(the )?brick\\b'],
    ['Structube', '\\bstructube\\b'],
    ['Wayfair', '\\bwayfair\\b'],
    ['Wayfair', '\\bwilla arlo\\b'],
    ['Walmart', '\\bwal-?mart\\b'],
    ['Costco', '\\bcostco\\b'],
    ['Kort & Co.', '\\bkort\\b'],
  ],

  // Named in the acknowledgment note under the checkbox.
  ackExamples: 'IKEA, Ashley, Leon\u2019s, The Brick',
};
