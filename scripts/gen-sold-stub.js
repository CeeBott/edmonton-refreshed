// ═══════════════════════════════════════════════════════════
//  SOLD-STUB GENERATOR  (operational helper, run manually)
//
//  Emits listings/<slug>/index.html for previously-sold pieces, byte-faithful
//  to the canonical reference stubs (la-z-boy-emric-right-facing-sectional,
//  rove-concepts-milo-6-piece-modular-sectional). The repetitive markup
//  (carousel <picture> blocks, thumbnails, per-photo ImageObject schema) is
//  generated from the piece's images so it can never drift; the per-page copy
//  lives in MANIFEST below and stays hand-authored.
//
//  Workflow per piece (see CLAUDE.md §8.3):
//    1. Add  href: "/listings/<slug>/"  to the piece's entry in js/sold-data.js.
//    2. Add a MANIFEST entry here (keyed by slug) with the custom copy.
//    3. node scripts/gen-sold-stub.js            (regenerates every manifest entry)
//       node scripts/gen-sold-stub.js <slug>     (just one)
//    4. node build.js   — refreshes nav/footer/?v=, sitemap, related links.
//
//  Image data is read from js/sold-data.js (single source of truth) by matching
//  the entry whose href === "/listings/<slug>/". The chrome (GA tag, fonts, nav,
//  credibility, footer, lightbox, scripts) is sliced verbatim from the Emric
//  reference page so it stays identical without re-typing.
// ═══════════════════════════════════════════════════════════

'use strict';

var fs   = require('fs');
var path = require('path');

var ROOT     = path.join(__dirname, '..');
var BASE_URL = 'https://edmontonrefreshed.com/';
var TEMPLATE = path.join(ROOT, 'listings', 'la-z-boy-emric-right-facing-sectional', 'index.html');

// ── Per-piece content manifest ───────────────────────────────
// availability: "SoldOut" (recommended) — accurate for one-of-one pieces and
// matches the visible "This piece has sold." overlay (see CLAUDE.md §6.3, §10.1).
var MANIFEST = {
  'natuzzi-editions-vigore-leather-sectional': {
    sku: 'NE-040',
    price: '2199',
    availability: 'SoldOut',
    brand: 'Natuzzi Editions',
    brandShort: 'Natuzzi',
    h1: 'Vigore Top-Grain Leather Sectional',
    model: 'Vigore',
    configuration: 'leather sectional',
    sellHref: '/sell/natuzzi/',
    altBase: 'Natuzzi Editions Vigore Top-Grain Leather Sectional',
    metaDescription: 'This Natuzzi Editions Vigore top-grain leather sectional has sold. Browse current available inventory at Edmonton Refreshed — curated pre-owned sofas and sectionals in Edmonton.',
    twitterDescription: 'This Natuzzi Editions Vigore top-grain leather sectional has sold. Browse current available inventory at Edmonton Refreshed.',
    productDescription: 'Natuzzi Editions Vigore sectional in white top-grain leather with a left-facing chaise and seating for four to five, measuring roughly 120 inches across and picked up in the Valley Point area of Sherwood Park — professionally inspected, sold in good condition. This piece has sold; browse current available inventory at Edmonton Refreshed.',
    introHTML: 'The Natuzzi Editions Vigore is a contemporary leather sectional &mdash; a left-facing chaise design wrapped in white top-grain leather, roughly 120 inches across with comfortable seating for four to five. We picked this one up from the Valley Point area of Sherwood Park; its low, clean lines and deep, supportive cushions make it the kind of statement sectional that holds its value well on Edmonton&rsquo;s pre-owned market.',
    newsletterHeading: 'Looking for a leather sectional like the Natuzzi Editions Vigore? Enter your email and we&rsquo;ll let you know when similar pieces come in.',
  },

  'natuzzi-editions-saggezza-leather-loveseat': {
    sku: 'NE-039',
    price: '699',
    availability: 'SoldOut',
    brand: 'Natuzzi Editions',
    brandShort: 'Natuzzi',
    h1: 'Saggezza Semi-Aniline Leather Loveseat',
    model: 'Saggezza',
    configuration: 'leather loveseat',
    sellHref: '/sell/natuzzi/',
    altBase: 'Natuzzi Editions Saggezza Semi-Aniline Leather Loveseat',
    metaDescription: 'This Natuzzi Editions Saggezza semi-aniline leather loveseat in stone has sold. Browse current available inventory at Edmonton Refreshed — curated pre-owned sofas and sectionals in Edmonton.',
    twitterDescription: 'This Natuzzi Editions Saggezza semi-aniline leather loveseat has sold. Browse current available inventory at Edmonton Refreshed.',
    productDescription: 'Natuzzi Editions Saggezza loveseat in stone semi-aniline leather, picked up in the Strathcona area of Edmonton alongside its matching sofa — a large two-seat design with adjustable manual headrests, padded track arms, and polished stainless steel feet. Professionally inspected, sold in good condition. This piece has sold; browse current available inventory at Edmonton Refreshed.',
    introHTML: 'The Natuzzi Editions Saggezza is one of the brand&rsquo;s most versatile designs &mdash; and this is the loveseat, the two-seat companion to the matching <a href="/listings/natuzzi-editions-saggezza-leather-sofa/" style="color:#2c2c2c; text-decoration:underline; text-underline-offset:2px;">sofa</a> we picked up alongside it from the same Strathcona home. A large two-seater in soft stone semi-aniline leather, it keeps the hide&rsquo;s natural character under a light protective finish, so the leather stays supple but holds up to everyday use. Adjustable manual headrests, padded track arms, and slim polished stainless steel feet give it a tailored, contemporary stance.',
    newsletterHeading: 'Looking for a leather loveseat like the Natuzzi Editions Saggezza? Enter your email and we&rsquo;ll let you know when similar pieces come in.',
  },

  'natuzzi-editions-saggezza-leather-sofa': {
    sku: 'NE-038',
    price: '899',
    availability: 'SoldOut',
    brand: 'Natuzzi Editions',
    brandShort: 'Natuzzi',
    h1: 'Saggezza Semi-Aniline Leather Sofa',
    model: 'Saggezza',
    configuration: 'leather sofa',
    sellHref: '/sell/natuzzi/',
    altBase: 'Natuzzi Editions Saggezza Semi-Aniline Leather Sofa',
    metaDescription: 'This Natuzzi Editions Saggezza sofa in upgraded stone semi-aniline leather has sold. Browse current available inventory at Edmonton Refreshed — curated pre-owned sofas and sectionals in Edmonton.',
    twitterDescription: 'This Natuzzi Editions Saggezza semi-aniline leather sofa has sold. Browse current available inventory at Edmonton Refreshed.',
    productDescription: 'Natuzzi Editions Saggezza sofa in upgraded stone semi-aniline leather, picked up in the Strathcona area of Edmonton — adjustable manual headrests, padded track arms, and polished stainless steel feet. Sold in fair condition with one non-functional headrest (disclosed before sale); the leather and seating were otherwise in very good shape. This piece has sold; browse current available inventory at Edmonton Refreshed.',
    introHTML: 'The Natuzzi Editions Saggezza sofa is the full-size companion to the <a href="/listings/natuzzi-editions-saggezza-leather-loveseat/" style="color:#2c2c2c; text-decoration:underline; text-underline-offset:2px;">loveseat</a> we picked up alongside it from the same Strathcona home &mdash; bought together as a set, then sold separately. It&rsquo;s finished in an upgraded stone semi-aniline leather and carries the same adjustable manual headrests, padded track arms, and polished stainless steel feet. The leather and seating were in very good shape; in the interest of full disclosure, one headrest mechanism was damaged and non-functional, noted to the buyer before the sale.',
    newsletterHeading: 'Looking for a leather sofa like the Natuzzi Editions Saggezza? Enter your email and we&rsquo;ll let you know when similar pieces come in.',
  },

  'la-z-boy-emric-right-facing-sectional': {
    sku: 'LB-041',
    price: '2199',
    availability: 'SoldOut',
    brand: 'La-Z-Boy',
    brandShort: 'La-Z-Boy',
    h1: 'Emric Right-Facing Sectional',
    model: 'Emric',
    configuration: 'sectional',
    sellHref: '/sell/sectional/',
    altBase: 'La-Z-Boy Emric 2-Piece Sectional with Right-Facing Chaise',
    metaDescription: 'This La-Z-Boy Emric right-facing sectional has sold. Browse current available inventory at Edmonton Refreshed — curated pre-owned sofas and sectionals in Edmonton.',
    twitterDescription: 'This La-Z-Boy Emric right-facing sectional has sold. Browse current available inventory at Edmonton Refreshed.',
    productDescription: 'La-Z-Boy Emric two-piece sectional with a right-facing chaise in performance fabric, acquired from a home in Spruce Grove — a now-discontinued, design-forward La-Z-Boy frame in like-new condition, still covered by the Limited Lifetime Warranty on the frame and spring systems. This piece has sold; browse current available inventory at Edmonton Refreshed.',
    introHTML: 'The La-Z-Boy Emric is one of the more design-forward pieces the brand has made &mdash; a now-discontinued contemporary sectional with slim shelter-style track arms, a low back, and clean lines. We acquired this two-piece with its right-facing chaise from a home in Spruce Grove; it&rsquo;s finished in a durable performance fabric, in like-new condition, and still covered by La-Z-Boy&rsquo;s Limited Lifetime Warranty on the frame and spring systems.',
    newsletterHeading: 'Looking for a sectional like the La-Z-Boy Emric? Enter your email and we&rsquo;ll let you know when similar pieces come in.',
  },

  'rove-concepts-milo-6-piece-modular-sectional': {
    sku: 'RC-043',
    price: '3900',
    availability: 'SoldOut',
    brand: 'Rove Concepts',
    brandShort: 'Rove Concepts',
    h1: 'Milo 6-Piece Modular Sectional — Pearl Chatou Bouclé',
    model: 'Milo',
    configuration: 'modular sectional',
    sellHref: '/sell/rove-concepts/',
    altBase: 'Rove Concepts Milo 6-Piece Modular Sectional',
    metaDescription: 'This Rove Concepts Milo 6-piece modular sectional in Pearl Chatou bouclé has sold. Browse current available inventory at Edmonton Refreshed — curated pre-owned sofas and sectionals in Edmonton.',
    twitterDescription: 'This Rove Concepts Milo 6-piece modular sectional has sold. Browse current available inventory at Edmonton Refreshed.',
    productDescription: 'Rove Concepts Milo modular sectional in its full six-piece configuration, upholstered in Pearl Chatou bouclé and acquired from a home in Sherwood Park — low and flat at 31.5 inches tall with 25.2-inch seats, a kiln-dried hardwood frame, three-layer high-density foam with a goose-feather top, and solid stainless-steel legs. This piece has sold; browse current available inventory at Edmonton Refreshed.',
    introHTML: 'The Rove Concepts Milo is one of the most actively searched sectionals on Edmonton&rsquo;s pre-owned market, and this was its fullest form &mdash; the six-piece modular configuration in Pearl Chatou bouclé, acquired from a home in Sherwood Park. Low and flat at 31.5 inches tall with deep 25.2-inch seats, it pairs a kiln-dried hardwood frame and three-layer high-density foam with a goose-feather top wrap and solid stainless-steel legs.',
    newsletterHeading: 'Looking for a sectional like the Rove Concepts Milo? Enter your email and we&rsquo;ll let you know when similar pieces come in.',
  },

  'crate-and-barrel-rochelle-sofa-chair-set': {
    sku: 'CB-037',
    price: '1199',
    availability: 'SoldOut',
    brand: 'Crate & Barrel',
    brandShort: 'Crate & Barrel',
    h1: 'Rochelle Sofa & Chair Set',
    model: 'Rochelle',
    configuration: 'sofa and chair set',
    sellHref: '/sell/crate-and-barrel/',
    altBase: 'Crate & Barrel Rochelle Sofa & Chair Set',
    metaDescription: 'This Crate &amp; Barrel Rochelle sofa and chair set has sold. Browse current available inventory at Edmonton Refreshed — curated pre-owned sofas and sectionals in Edmonton.',
    twitterDescription: 'This Crate &amp; Barrel Rochelle sofa and chair set has sold. Browse current available inventory at Edmonton Refreshed.',
    productDescription: 'Crate & Barrel Rochelle three-seat sofa with its matching armchair in an oatmeal woven fabric, picked up in the Keswick neighbourhood of Edmonton — slim track arms, loose seat and back cushions, and tapered solid-wood legs, built in North Carolina. Sold as a set in good condition, with noticeable sun-fading across both pieces, disclosed before the sale. This piece has sold; browse current available inventory at Edmonton Refreshed.',
    introHTML: 'The Crate &amp; Barrel Rochelle is a tailored, transitional design, and this was the full set &mdash; the three-seat sofa with its matching armchair, picked up in the Keswick neighbourhood of southwest Edmonton. Both pieces wear an oatmeal woven fabric over slim track arms, loose seat and back cushions, and tapered solid-wood legs. Built in North Carolina, it felt comfortable and solid in person; in the interest of full disclosure, both pieces carried significant sun-fading throughout, pointed out to the buyer before the sale.',
    newsletterHeading: 'Looking for a sofa and chair set like the Crate &amp; Barrel Rochelle? Enter your email and we&rsquo;ll let you know when similar pieces come in.',
  },

  'brentwood-classics-dorado-leather-sofa': {
    sku: 'BC-036',
    price: '2199',
    availability: 'SoldOut',
    brand: 'Brentwood Classics',
    brandShort: 'Brentwood Classics',
    h1: 'Dorado Full-Aniline Leather Sofa',
    model: 'Dorado',
    configuration: 'leather sofa',
    sellHref: '/sell/leather-sofa/',
    altBase: 'Brentwood Classics Dorado Full-Aniline Leather Sofa',
    metaDescription: 'This Brentwood Classics Dorado full-aniline leather sofa has sold. Browse current available inventory at Edmonton Refreshed — curated pre-owned sofas and sectionals in Edmonton.',
    twitterDescription: 'This Brentwood Classics Dorado full-aniline leather sofa has sold. Browse current available inventory at Edmonton Refreshed.',
    productDescription: 'Brentwood Classics Dorado sofa in full-aniline Capetown Antico leather with a wax finish, picked up in the Summerwood neighbourhood of Sherwood Park — one of a matching pair (each around $6,500 CAD retail), sold in excellent condition with a beautiful, well-kept patina. Measures 90 inches wide, 39 deep, and 31 tall, with deep seats and substantial block track arms. This piece has sold; browse current available inventory at Edmonton Refreshed.',
    introHTML: 'This leather sofa comes from Brentwood Classics&rsquo; Dorado collection, upholstered in full-aniline Capetown Antico leather with a wax finish &mdash; a breathable, un-coated hide that softens and deepens with age, on par with the leathers Restoration Hardware is known for. We picked this one up from the Summerwood neighbourhood of Sherwood Park; it was one of a matching pair of Dorado sofas (each around $6,500 CAD retail) and arrived in excellent, well-maintained condition with a gorgeous patina. It measures roughly 90 inches wide, with deep seats and substantial block track arms.',
    newsletterHeading: 'Looking for a leather sofa like the Brentwood Classics Dorado? Enter your email and we&rsquo;ll let you know when similar pieces come in.',
  },

  'natuzzi-editions-saggezza-grey-leather-sectional': {
    sku: 'NE-034',
    price: '2600',
    availability: 'SoldOut',
    brand: 'Natuzzi Editions',
    brandShort: 'Natuzzi',
    h1: 'Saggezza Grey Top-Grain Leather Sectional',
    model: 'Saggezza',
    configuration: 'leather sectional',
    sellHref: '/sell/natuzzi/',
    altBase: 'Natuzzi Editions Saggezza Grey Top-Grain Leather Sectional',
    metaDescription: 'This Natuzzi Editions Saggezza grey top-grain leather sectional has sold. Browse current available inventory at Edmonton Refreshed — curated pre-owned sofas and sectionals in Edmonton.',
    twitterDescription: 'This Natuzzi Editions Saggezza grey leather sectional has sold. Browse current available inventory at Edmonton Refreshed.',
    productDescription: 'Natuzzi Editions Saggezza sectional in light grey top-grain leather with a left-facing chaise, picked up in the Windermere neighbourhood of Edmonton — adjustable manual headrests, deep seats, and four sturdy polished stainless steel sled legs. Roughly 115 inches along the sofa run with a 91-inch chaise return, a consistent 41-inch depth, and a 30-inch height. Sold in good condition (one headrest slid out freely but functioned perfectly). This piece has sold; browse current available inventory at Edmonton Refreshed.',
    introHTML: 'The Natuzzi Editions Saggezza is one of the brand&rsquo;s most popular sectional designs, and this one came in a soft light grey top-grain leather with a left-facing chaise &mdash; picked up in Edmonton&rsquo;s Windermere neighbourhood. It pairs Natuzzi&rsquo;s signature adjustable manual headrests with deep, supportive seats, all riding on four sturdy polished stainless steel sled legs. It measures roughly 115 inches along the sofa run, with a 91-inch chaise return, a consistent 41-inch depth, and 30 inches tall; one headrest slid out a little freely but worked perfectly.',
    newsletterHeading: 'Looking for a leather sectional like the Natuzzi Editions Saggezza? Enter your email and we&rsquo;ll let you know when similar pieces come in.',
  },

  'rove-concepts-milo-4-piece-modular-sectional': {
    sku: 'RC-033',
    price: '1699',
    availability: 'SoldOut',
    brand: 'Rove Concepts',
    brandShort: 'Rove Concepts',
    h1: 'Milo 4-Piece Modular Sectional',
    model: 'Milo',
    configuration: 'modular sectional',
    sellHref: '/sell/rove-concepts/',
    altBase: 'Rove Concepts Milo 4-Piece Modular Sectional',
    metaDescription: 'This Rove Concepts Milo 4-piece modular sectional in grey performance fabric has sold. Browse current available inventory at Edmonton Refreshed — curated pre-owned sofas and sectionals in Edmonton.',
    twitterDescription: 'This Rove Concepts Milo 4-piece modular sectional has sold. Browse current available inventory at Edmonton Refreshed.',
    productDescription: 'Rove Concepts Milo modular sectional in its four-piece configuration, upholstered in grey performance fabric and picked up in the Lacombe Park neighbourhood of St. Albert — low and deep, with goose-feather-topped high-density foam that had held up beautifully despite being around five years old, on low-profile stainless-steel legs. Fully modular (left- or right-facing chaise), seats four to five, and measures 133 inches across the sofa with a 79-inch chaise and a 39-inch depth. Sold in good condition. This piece has sold; browse current available inventory at Edmonton Refreshed.',
    introHTML: 'The Rove Concepts Milo is a perennial favourite on Edmonton&rsquo;s pre-owned market, and this was the four-piece version in a soft grey performance fabric &mdash; two armless seats short of the <a href="/listings/rove-concepts-milo-6-piece-modular-sectional/" style="color:#2c2c2c; text-decoration:underline; text-underline-offset:2px;">six-piece</a> we also handled, but with the same low, deep, lounge-ready profile. It&rsquo;s fully modular, so the chaise can face left or right, and it seats four to five. We picked it up from the Lacombe Park neighbourhood in St. Albert; even at around five years old, its goose-feather-topped high-density foam had held up beautifully. It measures 133 inches across the sofa run, with a 79-inch chaise and a consistent 39-inch depth.',
    newsletterHeading: 'Looking for a sectional like the Rove Concepts Milo? Enter your email and we&rsquo;ll let you know when similar pieces come in.',
  },

  'american-leather-tuscany-leather-sofa': {
    sku: 'AL-032',
    price: '899',
    availability: 'SoldOut',
    brand: 'American Leather',
    brandShort: 'American Leather',
    h1: 'Tuscany Blackberry Leather Sofa',
    model: 'Tuscany',
    configuration: 'sofa',
    sellHref: '/sell/leather-sofa/',
    altBase: 'American Leather Tuscany Blackberry Leather Sofa',
    metaDescription: 'This American Leather Tuscany sofa in Blackberry top-grain leather has sold. Browse current available inventory at Edmonton Refreshed — curated pre-owned sofas and sectionals in Edmonton.',
    twitterDescription: 'This American Leather Tuscany Blackberry leather sofa has sold. Browse current available inventory at Edmonton Refreshed.',
    productDescription: 'American Leather Tuscany sofa in Blackberry top-grain leather — a deep jewel-toned purple, low and contemporary with wide track arms and thin polished stainless steel legs, picked up in the Secord neighbourhood of west Edmonton. A solid, heavy, well-built piece; at around fourteen years old and clearly under-cared-for it showed only very minor leather cracking and a handsome patina, and the Blackberry colour came back beautifully after a thorough cleaning and conditioning. Roughly 92 inches long, 38 deep, and 34 tall. Sold in fair condition. This piece has sold; browse current available inventory at Edmonton Refreshed.',
    introHTML: 'The American Leather Tuscany is a low, contemporary sofa, and this one wore the brand&rsquo;s deep Blackberry top-grain leather &mdash; a rich jewel-toned purple over wide track arms and thin polished stainless steel legs. We picked it up in the Secord neighbourhood of west Edmonton. It&rsquo;s a genuinely solid, heavy piece; at around fourteen years old and clearly under-cared-for, it needed plenty of cleaning and conditioning, after which the Blackberry colour came through beautifully &mdash; only very minor leather cracking and a lovely patina remained. We estimate it at roughly 92 inches long, 38 deep, and 34 tall.',
    newsletterHeading: 'Looking for a leather sofa like the American Leather Tuscany? Enter your email and we&rsquo;ll let you know when similar pieces come in.',
  },

  'natuzzi-editions-cesare-leather-sectional': {
    sku: 'NE-031',
    price: '1599',
    availability: 'SoldOut',
    brand: 'Natuzzi Editions',
    brandShort: 'Natuzzi',
    h1: 'Cesare Top-Grain Leather Sectional',
    model: 'Cesare',
    configuration: 'leather sectional',
    sellHref: '/sell/natuzzi/',
    altBase: 'Natuzzi Editions Cesare Top-Grain Leather Sectional',
    metaDescription: 'This Natuzzi Editions Cesare top-grain leather sectional in dark brown has sold. Browse current available inventory at Edmonton Refreshed — curated pre-owned sofas and sectionals in Edmonton.',
    twitterDescription: 'This Natuzzi Editions Cesare dark brown leather sectional has sold. Browse current available inventory at Edmonton Refreshed.',
    productDescription: 'Natuzzi Editions Cesare sectional in dark brown top-grain leather with a right-facing chaise, picked up in the Rio Terrace neighbourhood of west Edmonton — wide track arms, deep seats, and block wood feet, roughly 115 inches along the sofa with a 91-inch chaise and a 39-inch depth. A twelve-year-old piece that had sat nearly unused in a basement; once the dust was cleaned off and the leather conditioned, the hide and seats came back like new (original MSRP around $6,000 CAD). Sold in good condition with only a few very small markings. This piece has sold; browse current available inventory at Edmonton Refreshed.',
    introHTML: 'The Natuzzi Editions Cesare is one of the brand&rsquo;s bolder, larger-scale sectionals, and this one came in a deep dark brown top-grain leather with a right-facing chaise &mdash; wide track arms, deep cushioning, and block wood feet, seating four to five. We picked it up in the Rio Terrace neighbourhood of west Edmonton, where it had sat nearly unused in a basement for years; at around twelve years old it simply needed its dust cleaned off and the leather conditioned, after which the hide and seats came back like new (it retailed new for roughly $6,000 CAD). Only a few very small markings remain, low on the sofa face and the side of one arm. It measures about 115 inches along the sofa run, with a 91-inch chaise and a consistent 39-inch depth.',
    newsletterHeading: 'Looking for a leather sectional like the Natuzzi Editions Cesare? Enter your email and we&rsquo;ll let you know when similar pieces come in.',
  },

  'natuzzi-editions-saggezza-brown-leather-sectional': {
    sku: 'NE-029',
    price: '2750',
    availability: 'SoldOut',
    brand: 'Natuzzi Editions',
    brandShort: 'Natuzzi',
    h1: 'Saggezza Brown Top-Grain Leather Sectional',
    model: 'Saggezza',
    configuration: 'leather sectional',
    sellHref: '/sell/natuzzi/',
    altBase: 'Natuzzi Editions Saggezza Brown Top-Grain Leather Sectional',
    metaDescription: 'This Natuzzi Editions Saggezza top-grain leather sectional in dark brown has sold. Browse current available inventory at Edmonton Refreshed — curated pre-owned sofas and sectionals in Edmonton.',
    twitterDescription: 'This Natuzzi Editions Saggezza dark brown leather sectional has sold. Browse current available inventory at Edmonton Refreshed.',
    productDescription: 'Natuzzi Editions Saggezza sectional in dark brown top-grain leather with a right-facing chaise, from a downsizing family in the Jackson Heights neighbourhood of Edmonton — adjustable manual headrests, deep seats, and slim stainless steel sled legs, roughly 115 inches along the sofa with a 91-inch chaise, a 41-inch depth, and a 30-inch height. It arrived in excellent, like-new condition. This piece has sold; browse current available inventory at Edmonton Refreshed.',
    introHTML: 'The Natuzzi Editions Saggezza is one of the brand&rsquo;s most popular sectional designs &mdash; this one in a rich dark brown top-grain leather with a right-facing chaise, the warm-toned counterpart to the <a href="/listings/natuzzi-editions-saggezza-grey-leather-sectional/" style="color:#2c2c2c; text-decoration:underline; text-underline-offset:2px;">light grey Saggezza</a> we also handled. It carries the same adjustable manual headrests, deep supportive seats, and slim stainless steel sled legs. We picked it up from a downsizing family in the Jackson Heights neighbourhood of Edmonton; it was essentially like new. It measures roughly 115 inches along the sofa run, with a 91-inch chaise, a consistent 41-inch depth, and 30 inches tall.',
    newsletterHeading: 'Looking for a leather sectional like the Natuzzi Editions Saggezza? Enter your email and we&rsquo;ll let you know when similar pieces come in.',
  },

  'natuzzi-editions-indimenticabile-charcoal-leather-sofa': {
    sku: 'NE-028',
    price: '1150',
    availability: 'SoldOut',
    brand: 'Natuzzi Editions',
    brandShort: 'Natuzzi',
    h1: 'Indimenticabile Charcoal Top-Grain Leather Sofa',
    model: 'Indimenticabile',
    configuration: 'leather sofa',
    sellHref: '/sell/natuzzi/',
    altBase: 'Natuzzi Editions Indimenticabile Charcoal Top-Grain Leather Sofa',
    metaDescription: 'This Natuzzi Editions Indimenticabile top-grain leather sofa in charcoal has sold. Browse current available inventory at Edmonton Refreshed — curated pre-owned sofas and sectionals in Edmonton.',
    twitterDescription: 'This Natuzzi Editions Indimenticabile charcoal leather sofa has sold. Browse current available inventory at Edmonton Refreshed.',
    productDescription: 'Natuzzi Editions Indimenticabile sofa in charcoal-grey top-grain leather with a subtle blue tint, picked up in the Griesbach area of north Edmonton — a three-seater with softly flared track arms and tapered wood-look plastic legs, about 78 inches wide, 36 deep, and 34 tall (original MSRP around $2,700 CAD). Sold in good condition with slight scratch marks, paired with its light-grey twin and delivered as a set to a new duplex in Graydon Hills. This piece has sold; browse current available inventory at Edmonton Refreshed.',
    introHTML: 'The Natuzzi Editions Indimenticabile &mdash; Italian for &ldquo;unforgettable&rdquo; &mdash; is an elegantly tapered sofa, and this was the charcoal-grey version, with a subtle blue tint to its top-grain leather. A clean three-seater with softly flared track arms and tapered wood-look plastic legs, about 78 inches wide, 36 deep, and 34 tall. We picked it up in the Griesbach area of north Edmonton, and it sold as a set alongside its <a href="/listings/natuzzi-editions-indimenticabile-light-grey-leather-sofa/" style="color:#2c2c2c; text-decoration:underline; text-underline-offset:2px;">light-grey twin</a> &mdash; the two delivered together to a beautiful new duplex in Graydon Hills, south Edmonton. At around $2,700 CAD new, it came to us in good condition, with only slight scratch marks.',
    newsletterHeading: 'Looking for a leather sofa like the Natuzzi Editions Indimenticabile? Enter your email and we&rsquo;ll let you know when similar pieces come in.',
  },

  'natuzzi-editions-indimenticabile-light-grey-leather-sofa': {
    sku: 'NE-025',
    price: '1325',
    availability: 'SoldOut',
    brand: 'Natuzzi Editions',
    brandShort: 'Natuzzi',
    h1: 'Indimenticabile Light Grey Top-Grain Leather Sofa',
    model: 'Indimenticabile',
    configuration: 'leather sofa',
    sellHref: '/sell/natuzzi/',
    altBase: 'Natuzzi Editions Indimenticabile Light Grey Top-Grain Leather Sofa',
    metaDescription: 'This Natuzzi Editions Indimenticabile top-grain leather sofa in light grey has sold. Browse current available inventory at Edmonton Refreshed — curated pre-owned sofas and sectionals in Edmonton.',
    twitterDescription: 'This Natuzzi Editions Indimenticabile light grey leather sofa has sold. Browse current available inventory at Edmonton Refreshed.',
    productDescription: 'Natuzzi Editions Indimenticabile sofa in a light grey-bone top-grain leather, acquired in the Terra Losa neighbourhood of west Edmonton — a three-seater with softly flared track arms and tapered wood-look plastic legs, about 78 inches wide, 36 deep, and 34 tall. In excellent, like-new condition; it sold as a set with its charcoal twin to a new duplex in Graydon Hills. This piece has sold; browse current available inventory at Edmonton Refreshed.',
    introHTML: 'The Natuzzi Editions Indimenticabile &mdash; Italian for &ldquo;unforgettable&rdquo; &mdash; here in its lighter colourway: a soft grey-bone top-grain leather over the same elegantly tapered three-seat frame, with softly flared track arms and tapered wood-look plastic legs, about 78 inches wide, 36 deep, and 34 tall. We acquired it in the Terra Losa neighbourhood of west Edmonton, and it was in excellent, like-new condition. It sold as a set alongside its <a href="/listings/natuzzi-editions-indimenticabile-charcoal-leather-sofa/" style="color:#2c2c2c; text-decoration:underline; text-underline-offset:2px;">charcoal twin</a>, the pair delivered together to a beautiful new duplex in Graydon Hills, south Edmonton.',
    newsletterHeading: 'Looking for a leather sofa like the Natuzzi Editions Indimenticabile? Enter your email and we&rsquo;ll let you know when similar pieces come in.',
  },

  'natuzzi-editions-sollievo-leather-sofa': {
    sku: 'NE-026',
    price: '1150',
    availability: 'SoldOut',
    brand: 'Natuzzi Editions',
    brandShort: 'Natuzzi',
    h1: 'Sollievo Top-Grain Leather Sofa',
    model: 'Sollievo',
    configuration: 'leather sofa',
    sellHref: '/sell/natuzzi/',
    altBase: 'Natuzzi Editions Sollievo Top-Grain Leather Sofa',
    metaDescription: 'This Natuzzi Editions Sollievo top-grain leather sofa in ivory has sold. Browse current available inventory at Edmonton Refreshed — curated pre-owned sofas and sectionals in Edmonton.',
    twitterDescription: 'This Natuzzi Editions Sollievo ivory leather sofa has sold. Browse current available inventory at Edmonton Refreshed.',
    productDescription: 'Natuzzi Editions Sollievo sofa in ivory/bone top-grain leather — the brand\'s comfort-forward model, with a relaxed plush profile, wide track arms, and splayed polished stainless steel legs. A three-seater, 82 inches long and 36 deep, acquired from a large, beautiful home in the Granville neighbourhood of west Edmonton (one of several quality pieces we took from there). About eight years old yet in excellent, like-new condition with next to no cushion compression (original MSRP around $2,400 CAD). This piece has sold; browse current available inventory at Edmonton Refreshed.',
    introHTML: 'The Natuzzi Editions Sollievo &mdash; Italian for &ldquo;relief&rdquo; &mdash; is the brand&rsquo;s comfort-forward sofa, with a softer, more relaxed seat than its tailored models. This one wore an ivory/bone top-grain leather over wide track arms and splayed polished stainless steel legs, a three-seater measuring 82 inches long and 36 deep. We acquired it from a large, beautiful home in the Granville neighbourhood of west Edmonton &mdash; one of several quality pieces from that house &mdash; and at around eight years old its cushions had next to no compression, leaving it in excellent, like-new condition (it retailed new for roughly $2,400 CAD).',
    newsletterHeading: 'Looking for a leather sofa like the Natuzzi Editions Sollievo? Enter your email and we&rsquo;ll let you know when similar pieces come in.',
  },

  'fabbrica-charcoal-fabric-sectional': {
    sku: 'FS-022',
    price: '1099',
    availability: 'SoldOut',
    brand: 'Fabbrica',
    brandShort: 'Fabbrica',
    h1: 'Charcoal Performance Fabric Sectional',
    model: '',
    configuration: 'sectional',
    sellHref: '/sell/sectional/',
    altBase: 'Fabbrica Charcoal Performance Fabric Sectional',
    metaDescription: 'This Fabbrica charcoal performance-fabric sectional has sold. Browse current available inventory at Edmonton Refreshed — curated pre-owned sofas and sectionals in Edmonton.',
    twitterDescription: 'This Fabbrica charcoal performance-fabric sectional has sold. Browse current available inventory at Edmonton Refreshed.',
    productDescription: 'Fabbrica sectional in charcoal performance fabric — a sofa with a right-facing chaise, wide track arms, deep down-filled cushions, and block wood feet, picked up in the Magrath Heights neighbourhood of Edmonton. Fabbrica is a high-end European upholstery brand (this unit retailed new around $8,000 CAD); at roughly eight years old the down cushions fluffed back up like new and the performance fabric was in great shape. Measures 118 inches along the sofa with a 79-inch chaise, 38 inches deep and 29 tall, seating three to four. Sold in good condition. This piece has sold; browse current available inventory at Edmonton Refreshed.',
    introHTML: 'This Fabbrica sectional pairs a sofa with a right-facing chaise in a charcoal performance fabric &mdash; wide track arms, deep down-filled cushions, and a low, modern stance on block wood feet. Fabbrica is a high-end European upholstery brand, niche in Edmonton but genuinely luxurious; this unit retailed new for around $8,000 CAD. We picked it up in the Magrath Heights neighbourhood of Edmonton, and at roughly eight years old the down cushions had fluffed right back up like new, with the performance fabric in great shape. It measures 118 inches along the sofa with a 79-inch chaise, 38 inches deep and 29 tall, seating three to four.',
    newsletterHeading: 'Looking for a sectional like this Fabbrica? Enter your email and we&rsquo;ll let you know when similar pieces come in.',
  },

  'crate-and-barrel-gather-sofa': {
    sku: 'CB-021',
    price: '2799',
    availability: 'SoldOut',
    brand: 'Crate & Barrel',
    brandShort: 'Crate & Barrel',
    h1: 'Gather 99-Inch Deep Sofa',
    model: 'Gather',
    configuration: 'sofa',
    sellHref: '/sell/crate-and-barrel/',
    altBase: 'Crate & Barrel Gather 99-Inch Deep Sofa',
    metaDescription: 'This Crate &amp; Barrel Gather 99-inch deep sofa in Quartz has sold. Browse current available inventory at Edmonton Refreshed — curated pre-owned sofas and sectionals in Edmonton.',
    twitterDescription: 'This Crate &amp; Barrel Gather deep sofa has sold. Browse current available inventory at Edmonton Refreshed.',
    productDescription: 'Crate & Barrel Gather sofa in the deep 99-inch configuration, upholstered in Tribute performance fabric in Quartz — wide track arms, plush deep sink-in cushions, and a low profile, 99 inches wide, 38 deep, and 26 tall, seating three to four. Picked up in the Ambleside neighbourhood of southwest Edmonton from a family upgrading to a leather piece; manufactured in May 2024 and sold barely a year later in June 2025, it was in excellent, nearly-new condition (original MSRP $5,649 CAD). This piece has sold; browse current available inventory at Edmonton Refreshed.',
    introHTML: 'The Crate &amp; Barrel Gather is built for sinking in, and this was the deep 99-inch version in Tribute performance fabric, colour Quartz &mdash; a warm off-white and a premium fabric upgrade, over wide track arms with plush deep cushions and a low profile. It measures 99 inches wide, 38 deep, and 26 tall, seating three to four. We picked it up from a beautiful new home in the Ambleside neighbourhood of southwest Edmonton, where the family was replacing it with a large leather piece; manufactured in May 2024 and sold barely a year later in June 2025, it was in excellent, nearly-new condition (it retailed new for $5,649 CAD).',
    newsletterHeading: 'Looking for a sofa like the Crate &amp; Barrel Gather? Enter your email and we&rsquo;ll let you know when similar pieces come in.',
  },

  'natuzzi-italia-aniline-leather-loveseat-set': {
    sku: 'NI-006',
    price: '999',
    availability: 'SoldOut',
    brand: 'Natuzzi Italia',
    brandShort: 'Natuzzi',
    h1: 'Full-Grain Aniline Leather Loveseat Set',
    model: '',
    configuration: 'loveseat set',
    sellHref: '/sell/natuzzi/',
    altBase: 'Natuzzi Italia Full-Grain Aniline Leather Loveseat Set',
    metaDescription: 'This pair of Natuzzi Italia full-grain aniline leather loveseats has sold. Browse current available inventory at Edmonton Refreshed — curated pre-owned sofas and sectionals in Edmonton.',
    twitterDescription: 'This Natuzzi Italia full-grain aniline leather loveseat set has sold. Browse current available inventory at Edmonton Refreshed.',
    productDescription: 'A matching pair of Natuzzi Italia loveseats in rich brown full-grain aniline leather — the top tier of Natuzzi\'s range, with wide block track arms, deep cushions, and a block wood base. Each measures about 74 inches wide, 38 deep, and 26 tall, acquired in the Bonnie Doon neighbourhood of Edmonton from a smoke-, pet-, and child-free newly built home where they had been kept in the basement. Around fifteen years old yet in excellent condition, with the beautiful patina full-grain aniline develops over time. Sold as a set. This piece has sold; browse current available inventory at Edmonton Refreshed.',
    introHTML: 'Natuzzi Italia sits at the premium top of the Natuzzi range, and this was a matching pair of loveseats in rich brown full-grain aniline leather &mdash; the highest grade of hide, undyed and uncoated, with wide block track arms, deep cushions, and a solid block wood base. We acquired the set in the Bonnie Doon neighbourhood of Edmonton, from a smoke-, pet-, and child-free newly built home where the loveseats had been kept in the basement. At around fifteen years old they were in excellent condition, carrying the rich patina full-grain aniline earns with age. Each measures about 74 inches wide, 38 deep, and 26 tall.',
    newsletterHeading: 'Looking for a leather loveseat like these Natuzzi Italia pieces? Enter your email and we&rsquo;ll let you know when similar pieces come in.',
  },

  'urban-barn-preston-leather-sofa-set': {
    sku: 'UB-019',
    price: '1550',
    availability: 'SoldOut',
    brand: 'Urban Barn',
    brandShort: 'Urban Barn',
    h1: 'Preston Distressed Leather Sofa & Two Chairs',
    model: 'Preston',
    configuration: 'leather sofa',
    sellHref: '/sell/leather-sofa/',
    altBase: 'Urban Barn Preston Distressed Leather Sofa Set',
    metaDescription: 'This Urban Barn Preston distressed leather sofa and chair set has sold. Browse current available inventory at Edmonton Refreshed — curated pre-owned sofas and sectionals in Edmonton.',
    twitterDescription: 'This Urban Barn Preston distressed leather sofa set has sold. Browse current available inventory at Edmonton Refreshed.',
    productDescription: 'Urban Barn Preston set in distressed top-grain leather — a three-seat sofa (85 inches wide) with two matching armchairs (31 inches each), all 41 inches deep and 33 tall, in a rich dark brown with lived-in character. Acquired in the Riverbend area of southwest Edmonton from a seller moving out of their home; we cleaned and conditioned it, and the leather carries a beautiful patina, with wear consistent with age (original MSRP $5,497 CAD for the full set). Sold as a set. This piece has sold; browse current available inventory at Edmonton Refreshed.',
    introHTML: 'The Urban Barn Preston in distressed top-grain leather has real lived-in character, and this was the full set &mdash; a three-seat sofa with two matching armchairs, in a rich dark brown over slim track arms and tapered wood legs. We acquired it in the Riverbend area of southwest Edmonton from a seller moving out of their home; we cleaned and conditioned it, and the leather carries a beautiful patina, with wear consistent with age. The sofa runs 85 inches wide with each chair at 31 inches, all 41 inches deep and 33 tall (original MSRP $5,497 CAD for the set).',
    newsletterHeading: 'Looking for a leather sofa like the Urban Barn Preston? Enter your email and we&rsquo;ll let you know when similar pieces come in.',
  },

  'eq3-remi-leather-sofa': {
    sku: 'EQ-017',
    price: '1200',
    availability: 'SoldOut',
    brand: 'EQ3',
    brandShort: 'EQ3',
    h1: 'Remi Top-Grain Leather Sofa',
    model: 'Remi',
    configuration: 'leather sofa',
    sellHref: '/sell/eq3/',
    altBase: 'EQ3 Remi Top-Grain Leather Sofa',
    metaDescription: 'This EQ3 Remi top-grain leather sofa in light grey has sold. Browse current available inventory at Edmonton Refreshed — curated pre-owned sofas and sectionals in Edmonton.',
    twitterDescription: 'This EQ3 Remi light grey leather sofa has sold. Browse current available inventory at Edmonton Refreshed.',
    productDescription: 'EQ3 Remi sofa in upgraded Evoque Stone top-grain leather — a clean, Scandinavian-influenced three-seater with low track arms, tufted back cushions, a single bench-style seat, and thin splayed stainless steel legs. Measures 87 inches long, 38 deep, and 31 tall, picked up in the Chapelle neighbourhood of south Edmonton. About eight years old and in good condition (original MSRP $4,499 CAD). This piece has sold; browse current available inventory at Edmonton Refreshed.',
    introHTML: 'EQ3 is a Canadian brand known for clean, Scandinavian-influenced design at an accessible price, and the Remi is a great example &mdash; this one in an upgraded Evoque Stone top-grain leather, a soft light grey, a three-seater with low track arms, tufted back cushions, a single bench-style seat, and thin splayed stainless steel legs. We picked it up in the Chapelle neighbourhood of south Edmonton; at around eight years old, it was in good condition. It measures 87 inches long, 38 deep, and 31 tall (original MSRP $4,499 CAD).',
    newsletterHeading: 'Looking for a leather sofa like the EQ3 Remi? Enter your email and we&rsquo;ll let you know when similar pieces come in.',
  },

  'urban-barn-karis-fabric-sofa': {
    sku: 'UB-015',
    price: '1300',
    availability: 'SoldOut',
    brand: 'Urban Barn',
    brandShort: 'Urban Barn',
    h1: 'Karis Fabric Sofa',
    model: 'Karis',
    configuration: 'sofa',
    sellHref: '/sell/sofa/',
    altBase: 'Urban Barn Karis Fabric Sofa',
    metaDescription: 'This Urban Barn Karis fabric sofa in Maia Oat has sold. Browse current available inventory at Edmonton Refreshed — curated pre-owned sofas and sectionals in Edmonton.',
    twitterDescription: 'This Urban Barn Karis fabric sofa has sold. Browse current available inventory at Edmonton Refreshed.',
    productDescription: 'Urban Barn Karis sofa in Maia Oat — a soft oatmeal woven fabric — with deep bench seats, scatter back pillows, low track arms, and natural wood block legs. A three-seater, 89 inches wide, 41 deep, and 36 tall, picked up in Fort Saskatchewan. This was a brand-new Urban Barn floor model, still wrapped in cling film when we collected it (original MSRP $2,499 CAD). Sold in brand-new condition. This piece has sold; browse current available inventory at Edmonton Refreshed.',
    introHTML: 'The Urban Barn Karis is a deep, casual sofa, and this one came in Maia Oat &mdash; a soft oatmeal woven fabric &mdash; with plush bench seats, scatter back pillows, low track arms, and natural wood block legs. It seats three and measures 89 inches wide, 41 deep, and 36 tall. We picked it up in Fort Saskatchewan as a brand-new Urban Barn floor model, still wrapped in cling film from the store, and it sold essentially new for well under its $2,499 CAD retail.',
    newsletterHeading: 'Looking for a sofa like the Urban Barn Karis? Enter your email and we&rsquo;ll let you know when similar pieces come in.',
  },

  'urban-barn-renfrew-leather-sofa': {
    sku: 'UB-014',
    price: '1400',
    availability: 'SoldOut',
    brand: 'Urban Barn',
    brandShort: 'Urban Barn',
    h1: 'Renfrew 94-Inch Top-Grain Leather Sofa',
    model: 'Renfrew',
    configuration: 'leather sofa',
    sellHref: '/sell/leather-sofa/',
    altBase: 'Urban Barn Renfrew 94-Inch Top-Grain Leather Sofa',
    metaDescription: 'This Urban Barn Renfrew 94-inch top-grain leather sofa in caramel has sold. Browse current available inventory at Edmonton Refreshed — curated pre-owned sofas and sectionals in Edmonton.',
    twitterDescription: 'This Urban Barn Renfrew caramel leather sofa has sold. Browse current available inventory at Edmonton Refreshed.',
    productDescription: 'Urban Barn Renfrew sofa in a beautiful caramel top-grain leather — a long, low 94-inch design with two loose seat cushions, two fixed back cushions, low track arms, and thin black metal legs. Measures 94 inches wide, 37 deep, and 28 tall, picked up in the McKernan neighbourhood of Edmonton. At around three years old it was in excellent condition with no wear of note (original MSRP $3,999 CAD). This piece has sold; browse current available inventory at Edmonton Refreshed.',
    introHTML: 'The Urban Barn Renfrew is one of the brand&rsquo;s best-loved leather frames, and this was the long 94-inch version in a warm caramel top-grain leather &mdash; low track arms, two loose seat cushions over two fixed back cushions, and thin black metal legs. We picked it up in the McKernan neighbourhood of Edmonton; at around three years old it was in excellent condition with no wear of note. It measures 94 inches wide, 37 deep, and 28 tall (original MSRP $3,999 CAD).',
    newsletterHeading: 'Looking for a leather sofa like the Urban Barn Renfrew? Enter your email and we&rsquo;ll let you know when similar pieces come in.',
  },

  'eq3-replay-sofa': {
    sku: 'EQ-013',
    price: '999',
    availability: 'SoldOut',
    brand: 'EQ3',
    brandShort: 'EQ3',
    h1: 'Replay 99-Inch Sofa',
    model: 'Replay',
    configuration: 'sofa',
    sellHref: '/sell/eq3/',
    altBase: 'EQ3 Replay 99-Inch Sofa',
    metaDescription: 'This EQ3 Replay 99-inch sofa in stone-grey has sold. Browse current available inventory at Edmonton Refreshed — curated pre-owned sofas and sectionals in Edmonton.',
    twitterDescription: 'This EQ3 Replay 99-inch sofa has sold. Browse current available inventory at Edmonton Refreshed.',
    productDescription: 'EQ3 Replay sofa at a full 99 inches, upholstered in a soft, stone-grey fabric — three seat cushions, four back cushions, low track arms, and tall solid black ash wood legs. Measures 99 inches wide, 35 deep, and 28 tall, picked up in the Brander Gardens neighbourhood of southwest Edmonton. Sold in good condition, with wear consistent with normal use. This piece has sold; browse current available inventory at Edmonton Refreshed.',
    introHTML: 'The EQ3 Replay is one of the Canadian brand&rsquo;s larger frames, and this was the full 99-inch version in a soft, stone-grey fabric &mdash; three deep seat cushions, four back cushions, low track arms, and tall solid black ash wood legs. We picked it up in the Brander Gardens neighbourhood of southwest Edmonton; it was in good condition, with wear consistent with normal use. It measures 99 inches wide, 35 deep, and 28 tall.',
    newsletterHeading: 'Looking for a sofa like the EQ3 Replay? Enter your email and we&rsquo;ll let you know when similar pieces come in.',
  },
};

// ── Helpers ──────────────────────────────────────────────────

// Parse `var <name> = [ ... ];` out of a browser script without executing it
// (mirrors build.js extractVar so behaviour matches the build).
function extractArray(src, varName) {
  var re = new RegExp('var\\s+' + varName + '\\s*=\\s*\\[');
  var m = re.exec(src);
  if (!m) throw new Error('Could not find var ' + varName);
  var depth = 0, inStr = false, strCh = '', i = m.index + m[0].length - 1;
  for (; i < src.length; i++) {
    var ch = src[i];
    if (inStr) { if (ch === '\\') { i++; continue; } if (ch === strCh) inStr = false; continue; }
    if (ch === '"' || ch === "'") { inStr = true; strCh = ch; continue; }
    if (ch === '[') depth++;
    if (ch === ']') { depth--; if (depth === 0) break; }
  }
  return new Function(src.substring(m.index, i + 1) + ';\nreturn ' + varName + ';')();
}

// strip leading ../ and / → root-relative path; drop the .jpeg extension.
function imageBase(p) {
  return p.replace(/^(?:\.\.\/)+/, '').replace(/^\/+/, '').replace(/\.jpe?g$/i, '');
}
function relUrl(baseNoExt, suffix) { return '../../' + encodeURI(baseNoExt + suffix); }
function absUrl(baseNoExt, suffix) { return BASE_URL + encodeURI(baseNoExt + suffix); }

// HTML-escape a plain-text manifest value (brand / h1 / fullName / altBase) for
// HTML contexts. JSON-LD contexts keep the raw value — a literal "&" is valid
// JSON, whereas "&amp;" there would corrupt the data (e.g. brand "Crate & Barrel").
function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Pluralize a configuration noun phrase for the closing sell line ("sectional" →
// "sectionals", "couch" → "couches", "leather sofa" → "leather sofas").
function pluralize(s) { return /(?:ch|sh|s|x|z)$/i.test(s) ? s + 'es' : s + 's'; }

// Sell pages keyed by piece configuration (no brand involved). When a piece's
// sellHref is one of these, the closing-line anchor uses the pluralized
// configuration ("we buy leather sofas directly") instead of the brand.
var CONFIG_SELL_PAGES = ['/sell/sectional/', '/sell/leather-sectional/', '/sell/sofa/', '/sell/leather-sofa/', '/sell/couch/', '/sell/leather-couch/'];

function isoDate() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Edmonton' });
}

// Slice an inclusive [startMarker … endMarker] region out of the template.
function sliceRegion(html, startMarker, endMarker) {
  var s = html.indexOf(startMarker);
  var e = html.indexOf(endMarker, s);
  if (s === -1 || e === -1) throw new Error('Template missing region: ' + startMarker);
  return html.substring(s, e + endMarker.length);
}

// ── Block builders ───────────────────────────────────────────

function buildCarousel(bases, altBase) {
  var n = bases.length;
  var SIZES = 'sizes="(max-width: 768px) 100vw, 550px"';
  var pictures = bases.map(function(b, i) {
    var srcset = function(ext) {
      return relUrl(b, '-400w' + ext) + ' 400w, ' + relUrl(b, '-800w' + ext) + ' 800w, ' + relUrl(b, ext) + ' 1200w';
    };
    var alt = altBase + ' — photo ' + (i + 1) + ' of ' + n;
    var loadAttrs = i === 0 ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"';
    return '' +
      '              <picture>\n' +
      '                <source type="image/avif" srcset="' + srcset('.avif') + '" ' + SIZES + '>\n' +
      '                <source type="image/webp" srcset="' + srcset('.webp') + '" ' + SIZES + '>\n' +
      '                <img src="' + relUrl(b, '.jpeg') + '" srcset="' + srcset('.jpeg') + '" ' + SIZES + ' alt="' + alt + '" ' + loadAttrs + ' draggable="false">\n' +
      '              </picture>';
  }).join('\n');

  var dots = bases.map(function(b, i) {
    return '<button class="dot' + (i === 0 ? ' active' : '') + '" data-index="' + i + '" aria-label="Photo ' + (i + 1) + '"></button>';
  }).join('');

  return '' +
    '          <div class="listing-carousel">\n' +
    '            <div class="carousel" id="carousel-0" data-index="0" data-count="' + n + '">\n' +
    '              <div class="carousel-track">\n' +
    pictures + '\n' +
    '              </div>\n' +
    '              <button class="carousel-btn prev" aria-label="Previous photo"><svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg></button>\n' +
    '              <button class="carousel-btn next" aria-label="Next photo"><svg viewBox="0 0 24 24"><polyline points="9 6 15 12 9 18"/></svg></button>\n' +
    '              <div class="carousel-counter">1 / ' + n + '</div>\n' +
    '              <div class="carousel-dots">' + dots + '</div>\n' +
    '              <div class="listing-sold-overlay">\n' +
    '                <p>This piece has sold.</p>\n' +
    '              </div>\n' +
    '            </div>\n' +
    buildThumbnails(bases, altBase) +
    '          </div>';
}

function buildThumbnails(bases, altBase) {
  var n = bases.length;
  // ≤8 photos: show all. >8: show first 7 + a "+N" more button (Emric pattern).
  var visible = n <= 8 ? n : 7;
  var thumbs = [];
  for (var i = 0; i < visible; i++) {
    thumbs.push(
      '              <button class="listing-thumb' + (i === 0 ? ' active' : '') + '" data-index="' + i + '">' +
      '<img src="' + relUrl(bases[i], '-400w.jpeg') + '" alt="' + altBase + ' — thumbnail ' + (i + 1) + ' of ' + n + '" loading="lazy"></button>'
    );
  }
  if (n > visible) {
    thumbs.push('              <button class="listing-thumb listing-thumb-more" data-index="' + visible + '">+' + (n - visible) + '</button>');
  }
  return '            <div class="listing-thumbnails">\n' + thumbs.join('\n') + '\n            </div>\n';
}

function buildImageObjectSchema(bases, altBase, pageUrl, brand) {
  var n = bases.length;
  var items = bases.map(function(b, i) {
    return '' +
      '      {\n' +
      '        "@type": "ListItem",\n' +
      '        "position": ' + (i + 1) + ',\n' +
      '        "item": {\n' +
      '          "@type": "ImageObject",\n' +
      '          "name": "' + altBase + ' — photo ' + (i + 1) + ' of ' + n + '",\n' +
      '          "description": "Pre-owned ' + altBase + ', purchased and resold by Edmonton Refreshed.",\n' +
      '          "contentUrl": "' + absUrl(b, '.jpeg') + '",\n' +
      '          "thumbnailUrl": "' + absUrl(b, '-400w.jpeg') + '",\n' +
      '          "about": {\n' +
      '            "@type": "Brand",\n' +
      '            "name": "' + brand + '"\n' +
      '          },\n' +
      '          "creator": {\n' +
      '            "@type": "Organization",\n' +
      '            "name": "Edmonton Refreshed"\n' +
      '          },\n' +
      '          "copyrightHolder": {\n' +
      '            "@type": "Organization",\n' +
      '            "name": "Edmonton Refreshed"\n' +
      '          },\n' +
      '          "creditText": "Photo by Edmonton Refreshed",\n' +
      '          "license": "https://edmontonrefreshed.com/",\n' +
      '          "acquireLicensePage": "https://edmontonrefreshed.com/"\n' +
      '        }\n' +
      '      }';
  }).join(',\n');

  return '' +
    '  <!-- Photo gallery — ImageObject per displayed photo (attribution + Licensable badge eligibility) -->\n' +
    '  <script type="application/ld+json">\n' +
    '  {\n' +
    '    "@context": "https://schema.org",\n' +
    '    "@type": "ItemList",\n' +
    '    "name": "' + altBase + ' — photos",\n' +
    '    "description": "Photos of the pre-owned ' + altBase + ', purchased and resold by Edmonton Refreshed in Edmonton, AB.",\n' +
    '    "url": "' + pageUrl + '",\n' +
    '    "numberOfItems": ' + n + ',\n' +
    '    "itemListElement": [\n' +
    items + '\n' +
    '    ]\n' +
    '  }\n' +
    '  </script>';
}

function buildHead(m, bases, pageUrl) {
  var fullName = m.brand + ' ' + m.h1;
  var fullNameHtml = esc(fullName);   // HTML contexts; JSON-LD below keeps raw fullName
  var altHtml = esc(m.altBase);
  var coverAbs = absUrl(bases[0], '.jpeg');

  // Title / description. With a retained active-listing snapshot (current
  // sold-stub standard, §6.3/§8.3) keep the original active title + description
  // but neutralized of availability signals — no "for Sale", no advertised
  // asking price, and never "Sold" — so the page stays click-worthy without
  // advertising a sold piece as purchasable. Legacy stubs (no snapshot) also
  // stay availability-neutral: the title drops the "— Sold" suffix and the
  // MANIFEST "This … has sold." meta is reframed to "Pre-owned …" (§6.3).
  var r = m.retained || null;
  var titleContent = (r && r.metaTitle)
    ? escapeHtml(neutralizeMeta(r.metaTitle))
    : fullNameHtml + ' | Edmonton Refreshed';
  var descContent = (r && r.metaDescription)
    ? escapeHtml(neutralizeMeta(r.metaDescription))
    : neutralizeMeta(neutralizeLegacyDesc(m.metaDescription));
  var twDescContent = (r && r.metaDescription)
    ? descContent
    : neutralizeMeta(neutralizeLegacyDesc(m.twitterDescription));

  var meta = '' +
    '  <title>' + titleContent + '</title>\n' +
    '  <link rel="icon" type="image/svg+xml" href="../../favicon.svg">\n' +
    '  <link rel="apple-touch-icon" href="../../apple-touch-icon.png">\n' +
    '  <link rel="canonical" href="' + pageUrl + '">\n' +
    '  <meta name="description" content="' + descContent + '">\n' +
    '  <meta name="robots" content="index, follow">\n' +
    '  <meta name="geo.region" content="CA-AB">\n' +
    '  <meta name="geo.placename" content="Edmonton">\n\n' +
    '  <!-- Open Graph -->\n' +
    '  <meta property="og:locale" content="en_CA">\n' +
    '  <meta property="og:type" content="product">\n' +
    '  <meta property="og:url" content="' + pageUrl + '">\n' +
    '  <meta property="og:title" content="' + titleContent + '">\n' +
    '  <meta property="og:description" content="' + descContent + '">\n' +
    '  <meta property="og:site_name" content="Edmonton Refreshed Seating">\n' +
    '  <meta property="og:image" content="' + coverAbs + '">\n' +
    '  <meta property="og:image:alt" content="' + altHtml + ' — pre-owned furniture in Edmonton">\n\n' +
    '  <!-- Twitter / X -->\n' +
    '  <meta name="twitter:card" content="summary_large_image">\n' +
    '  <meta name="twitter:title" content="' + titleContent + '">\n' +
    '  <meta name="twitter:description" content="' + twDescContent + '">\n' +
    '  <meta name="twitter:image" content="' + coverAbs + '">\n' +
    '  <meta name="twitter:image:alt" content="' + altHtml + ' — pre-owned furniture in Edmonton">';

  // No Product schema. A sold one-of-one piece displays no price, and a
  // `Product` is *invalid* (critical error) unless it carries one of
  // `offers` / `review` / `aggregateRating` — none of which we can supply
  // honestly: `offers` forces a price back onto the page (Google requires it,
  // re-leaking a seller-side negotiation anchor); business-level
  // `aggregateRating` on a product is a manual-action risk; per-piece
  // `review` would be fabricated. Since a sold item is ineligible for product
  // rich results anyway, the Product carried no discovery value. The page's
  // real signal lives in the per-photo `ImageObject` gallery (carries the
  // brand via `about`) for Google Images, the `BreadcrumbList`, and the
  // visible copy. See §6.3.

  var breadcrumb = '' +
    '  <!-- BreadcrumbList Schema -->\n' +
    '  <script type="application/ld+json">\n' +
    '  {\n' +
    '    "@context": "https://schema.org",\n' +
    '    "@type": "BreadcrumbList",\n' +
    '    "itemListElement": [\n' +
    '      {\n' +
    '        "@type": "ListItem",\n' +
    '        "position": 1,\n' +
    '        "name": "Home",\n' +
    '        "item": "https://edmontonrefreshed.com/"\n' +
    '      },\n' +
    '      {\n' +
    '        "@type": "ListItem",\n' +
    '        "position": 2,\n' +
    '        "name": "' + fullName + '",\n' +
    '        "item": "' + pageUrl + '"\n' +
    '      }\n' +
    '    ]\n' +
    '  }\n' +
    '  </script>';

  // FAQPage schema — only when the piece carries retained FAQ (reflects the
  // now-visible FAQ section). Sold stubs still carry NO Product schema (§6.3).
  var faqBlock = '';
  if (r && r.faq && r.faq.length) {
    var faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": r.faq.map(function(qa) {
        return { "@type": "Question", "name": qa.question, "acceptedAnswer": { "@type": "Answer", "text": qa.answer } };
      })
    };
    faqBlock = '\n\n  <!-- FAQPage Schema -->\n' +
      '  <script type="application/ld+json">\n' +
      '  ' + JSON.stringify(faqSchema, null, 2).replace(/\n/g, '\n  ') + '\n' +
      '  </script>';
  }

  return meta + '\n\n' + breadcrumb + '\n\n' +
    buildImageObjectSchema(bases, m.altBase, pageUrl, m.brand) + faqBlock;
}

// ── Active-listing retention (current sold-stub standard) ────
// Under the current standard (CLAUDE.md §6.3/§8.3) a piece's sold-data.js entry
// carries a `retained` snapshot of its active-listing content. The stub
// reproduces that content below the neighbourhood summary — byte-faithful to
// what build.js generateListingPage rendered — minus the transactional CTAs
// and the asking price. Legacy stubs (no snapshot) render as before.

// Faithful copy of build.js escapeHtml so retained text matches the active
// listing exactly (em/en dashes and smart quotes → entities).
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/—/g, '&mdash;')
    .replace(/–/g, '&ndash;')
    .replace(/“/g, '&ldquo;')
    .replace(/”/g, '&rdquo;')
    .replace(/‘/g, '&lsquo;')
    .replace(/’/g, '&rsquo;');
}

// 7500 → "$7,500" (mirror of build.js / available-data.js).
var PRICE_FMT = new Intl.NumberFormat('en-CA', { maximumFractionDigits: 0 });
function formatPrice(n) { return '$' + PRICE_FMT.format(n); }

// Strip availability signals from active metadata so a sold page's title and
// description stay neutral — no "for Sale", no advertised asking price, and
// never "Sold". A sold page must not advertise a price it can't honour
// (§6.3) nor promise a piece it can't deliver. Operates on raw text; the
// caller applies escapeHtml.
function neutralizeMeta(s) {
  return String(s)
    .replace(/\s*\bfor sale\b/gi, '')
    .replace(/\s*\$[\d,]+(?:\.\d+)?\s*CAD\b\.?/gi, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([.,;:])/g, '$1')
    .trim();
}

// Reframe a legacy stub's MANIFEST meta/twitter description away from the
// "This … has sold." announcement. Legacy stubs never had an active listing,
// so there is no original metadata to preserve — we just drop the sold framing
// and keep the descriptive remainder: "This {X} has sold. Browse current
// available inventory…" → "Pre-owned {X}. Browse current available inventory…".
// A non-matching string is returned unchanged.
function neutralizeLegacyDesc(s) {
  return String(s).replace(/^This\s+(.+?)\s+has sold\.\s*/i, 'Pre-owned $1. ');
}

// Brand → buyer's-guide cross-link (mirror of build.js brandGuideMap), shown
// in the retained Description collapsible.
var BRAND_GUIDE_MAP = {
  'Natuzzi':          { slug: 'natuzzi-sofa-review-edmonton',       label: 'Read our full Natuzzi buyer&rsquo;s guide for Edmonton' },
  'Natuzzi Editions': { slug: 'natuzzi-sofa-review-edmonton',       label: 'Read our full Natuzzi buyer&rsquo;s guide for Edmonton' },
  'Natuzzi Italia':   { slug: 'natuzzi-sofa-review-edmonton',       label: 'Read our full Natuzzi buyer&rsquo;s guide for Edmonton' },
  'B&B Italia':       { slug: 'bb-italia-sofa-review-edmonton',     label: 'Read our full B&amp;B Italia buyer&rsquo;s guide for Edmonton' },
  'Rove Concepts':    { slug: 'rove-concepts-sofa-review-edmonton', label: 'Read our full Rove Concepts buyer&rsquo;s guide for Edmonton' }
};
function brandGuideHTML(brand) {
  var bg = BRAND_GUIDE_MAP[brand];
  return bg ? '<p class="listing-brand-guide-link"><a href="/guides/' + bg.slug + '/">' + bg.label + ' &rarr;</a></p>' : '';
}

// Sitewide listing trust statement (verbatim from build.js generateListingPage).
var TRUST_HTML = '<p class="listing-trust"><svg class="listing-trust-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2 4 5v6c0 5 3.5 9.5 8 11 4.5-1.5 8-6 8-11V5l-8-3z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><polyline points="9 12 11 14 15 10" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg><span>All designer pieces are inspected for construction, materials, and manufacturer consistency before listing.</span></p>';

// Visible FAQ section (mirror of build.js faqVisibleBlock), 10-space indented
// to sit inside the stub's .listing-body.
function buildFaqVisible(faq) {
  return '' +
    '          <section class="faq-section listing-faq" aria-labelledby="listing-faq-heading">\n' +
    '            <h2 class="section-label" id="listing-faq-heading">Frequently Asked Questions</h2>\n' +
    '            <div class="faq-list">\n' +
    faq.map(function(qa) {
      return '              <div class="faq-item">\n' +
             '                <h3 class="faq-question">' + escapeHtml(qa.question) + '</h3>\n' +
             '                <p class="faq-answer">' + escapeHtml(qa.answer) + '</p>\n' +
             '              </div>';
    }).join('\n') + '\n' +
    '            </div>\n' +
    '          </section>';
}

// The retained active-listing content block, rendered after the closing CTAs
// and sell-line paragraph (current standard). Returns '' for legacy stubs.
// Order mirrors the active listing: Est. Retail (asking price withheld) →
// specs → Description → Features → Condition → Includes → trust → FAQ.
function buildRetained(m) {
  var r = m.retained;
  if (!r) return '';
  var parts = [];
  if (r.retailEstimate) {
    var retailLabel = formatPrice(r.retailEstimate) + (r.retailEstimateApprox ? '+' : '');
    parts.push('          <div class="listing-value-pill"><span class="pill-retail">Est. Retail: ' + retailLabel + ' CAD</span></div>');
  }
  if (r.specs && r.specs.length) {
    parts.push('          <div class="listing-specs">' +
      r.specs.map(function(s) { return '<span class="spec-tag">' + escapeHtml(s) + '</span>'; }).join('') +
      '</div>');
  }
  if (r.description) {
    parts.push('          <details class="listing-collapsible" open><summary class="listing-meta-label">Description</summary><p class="listing-description">' +
      escapeHtml(r.description) + '</p>' + brandGuideHTML(m.brand) + '</details>');
  }
  if (r.features && r.features.length) {
    parts.push('          <details class="listing-collapsible"><summary class="listing-meta-label">Features</summary><ul class="listing-features">' +
      r.features.map(function(f) { return '<li>' + escapeHtml(f) + '</li>'; }).join('') +
      '</ul></details>');
  }
  if (r.condition) {
    parts.push('          <details class="listing-collapsible"><summary class="listing-meta-label">Condition</summary><p class="listing-meta-text">' +
      escapeHtml(r.condition) + '</p></details>');
  }
  if (r.configuration) {
    parts.push('          <details class="listing-collapsible"><summary class="listing-meta-label">Includes</summary><p class="listing-meta-text">' +
      escapeHtml(r.configuration) + '</p></details>');
  }
  parts.push('          ' + TRUST_HTML);
  if (r.faq && r.faq.length) {
    parts.push(buildFaqVisible(r.faq));
  }
  return parts.join('\n') + '\n\n';
}

function buildBody(m, bases, chrome) {
  var fullName = m.brand + ' ' + m.h1;
  var fullNameHtml = esc(fullName);
  var carousel = buildCarousel(bases, esc(m.altBase));

  // Fixed closing sell line (constant structure across the cluster; only
  // Model / Brand / Configuration vary). Always the final body paragraph.
  // The sell CTA lives ONLY here, in seller-intent context. It is deliberately
  // NOT in the intro: most visitors to a sold page are buyers, and a "/sell/"
  // link on a descriptive phrase ("leather sofa") reads as a buyer catalogue
  // link and bounces them. Here the surrounding text ("…thinking about selling")
  // makes the intent unambiguous. Links to the piece's target sell page. (§8.3)
  // Anchor subject matches the link target: brand name when the piece links to a
  // brand sell page, else the pluralized configuration (it links to a config page).
  var buySubject = CONFIG_SELL_PAGES.indexOf(m.sellHref) !== -1
    ? esc(pluralize(m.configuration))
    : esc(m.brandShort || m.brand);
  var buyPhrase = 'we buy ' + buySubject + ' directly &mdash; no listing, no waiting';
  var pitch = m.sellHref
    ? '<a href="' + m.sellHref + '" style="color:#2c2c2c; text-decoration:underline; text-underline-offset:2px;">' + buyPhrase + '</a>'
    : buyPhrase;
  // Lead with the model when there is one ("If you have a Vigore or a similar
  // Natuzzi leather sectional…"); model-less pieces drop that clause
  // ("If you have a similar Fabbrica sectional…").
  var brandOrShort = esc(m.brandShort || m.brand);
  var leadIn = m.model
    ? 'If you have ' + (/^[aeiou]/i.test(m.model) ? 'an' : 'a') + ' ' + esc(m.model) + ' or a similar ' + brandOrShort + ' ' + esc(m.configuration)
    : 'If you have a similar ' + brandOrShort + ' ' + esc(m.configuration);
  var endingLine = leadIn + ' you&rsquo;re thinking about selling, ' + pitch +
    '. Our team handles the full, specialized in-home removal and transport.';

  // Retained block renders AFTER the CTAs + closing sell line (current standard,
  // §6.3/§8.3). Captured once and gated so legacy stubs (empty block) stay
  // byte-identical to the pre-retention layout.
  var retainedBlock = buildRetained(m);
  var bodyInner = '' +
    '          <div class="listing-body">\n' +
    '          <div class="listing-brand">' + esc(m.brand) + '</div>\n' +
    '          <h1 class="listing-title">' + esc(m.h1) + '</h1>\n\n' +
    '          <p style="margin-top:18px; color:#6b6b6b; font-size:0.95rem; line-height:1.7;">' + m.introHTML + '</p>\n\n' +
    '          <div style="margin:28px 0; display:flex; flex-wrap:wrap; gap:12px;">\n' +
    '            <a href="/" class="listing-cta" style="flex:1; min-width:200px; text-align:center;">Browse Available Inventory &rarr;</a>\n' +
    '            <a href="/sold/" class="listing-cta" style="flex:1; min-width:200px; text-align:center; background:#fff; color:#2c2c2c; border:1px solid #2c2c2c;">View Sold Pieces</a>\n' +
    '          </div>\n\n' +
    '          <p style="margin-top:24px; color:#6b6b6b; font-size:0.95rem; line-height:1.7;">' + endingLine + '</p>\n' +
    (retainedBlock ? '\n' + retainedBlock : '') +
    '        </div>';

  var newsletter = '' +
    '      <div class="newsletter-embed">\n' +
    '        <p class="newsletter-heading">' + m.newsletterHeading + '</p>\n' +
    '        <form class="newsletter-form" action="https://app.kit.com/forms/9233085/subscriptions" method="post" data-sv-form="9233085" data-uid="47c0cc8b38">\n' +
    '          <label for="newsletter-email" class="sr-only">Email address</label>\n' +
    '          <input type="email" id="newsletter-email" name="email_address" placeholder="Your email address" autocomplete="email" required>\n' +
    '          <button type="submit">Subscribe</button>\n' +
    '        </form>\n' +
    '        <p class="newsletter-success">Thanks! You&rsquo;re on the list.</p>\n' +
    '      </div>';

  return '' +
    '  <main id="main-content">\n' +
    '    <div class="page">\n\n' +
    '      <nav class="breadcrumb" aria-label="Breadcrumb">\n' +
    '        <a href="/">Home</a>\n' +
    '        <span class="breadcrumb-sep">/</span>\n' +
    '        <span class="breadcrumb-current">' + fullNameHtml + '</span>\n' +
    '      </nav>\n\n' +
    '      <div class="listing-hero">\n' +
    '        <div class="listing-layout" style="max-width:680px; margin-inline:auto;">\n\n' +
    carousel + '\n\n' +
    bodyInner + '\n' +
    '        </div>\n' +
    '      </div>\n\n' +
    newsletter + '\n\n' +
    '    </div>\n' +
    '  </main>';
}

// ── Assemble & write ─────────────────────────────────────────

function generate(slug, m, soldItems, template, chrome) {
  var pageUrl = BASE_URL + 'listings/' + slug + '/';
  var entry = soldItems.filter(function(s) { return s.href === '/listings/' + slug + '/'; })[0];
  if (!entry) throw new Error('No sold-data.js entry with href "/listings/' + slug + '/" — add it first.');
  var bases = (entry.images || []).map(imageBase);
  if (!bases.length) throw new Error('Sold entry for ' + slug + ' has no images.');

  // Attach the retained active-listing snapshot (if any) so the stub can
  // reproduce the piece's specs / description / features / condition /
  // includes / FAQ below the neighbourhood summary (current standard, §6.3/§8.3).
  m = Object.assign({}, m, { retained: entry.retained || null });

  // Lightbox/scripts tail: reuse verbatim, just repoint the lightbox alt text.
  var tail = chrome.tail.replace(/alt="[^"]*photo"/, 'alt="' + esc(m.altBase) + ' photo"');

  var html =
    '<!DOCTYPE html>\n' +
    '<html lang="en-CA">\n' +
    '<head>\n' +
    '  <meta charset="UTF-8">\n' +
    '  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n\n' +
    chrome.ga + '\n\n' +
    buildHead(m, bases, pageUrl) + '\n\n' +
    chrome.fonts + '\n' +
    '</head>\n' +
    '<body>\n\n' +
    '  <a href="#main-content" class="skip-link">Skip to main content</a>\n\n' +
    chrome.nav + '\n\n' +
    chrome.credibility + '\n\n' +
    buildBody(m, bases, chrome) + '\n\n' +
    chrome.footer + '\n\n' +
    // `tail` is sliced up to (not including) </body>, so it already carries the
    // template's trailing whitespace. Do NOT append another newline — the Emric
    // page is itself the template, so an extra '\n' here accumulates a blank
    // line into every stub on each regeneration. Keeping the slice verbatim
    // makes regeneration idempotent.
    tail +
    '</body>\n' +
    '</html>\n';

  var outDir = path.join(ROOT, 'listings', slug);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'index.html'), html);
  console.log('  wrote listings/' + slug + '/index.html  (' + bases.length + ' photos, ' + m.availability + ', $' + m.price + ')');
}

function main() {
  var template = fs.readFileSync(TEMPLATE, 'utf8');
  var soldItems = extractArray(fs.readFileSync(path.join(ROOT, 'js', 'sold-data.js'), 'utf8'), 'soldItems');

  // Chrome sliced verbatim from the Emric reference (build.js refreshes these regions anyway).
  var gaStart = template.indexOf('<!-- Google tag');
  var gaEnd   = template.indexOf('</script>', template.indexOf("gtag('config'")) + '</script>'.length;
  var fontsStart = template.indexOf('<link rel="preconnect" href="https://fonts.googleapis.com">');
  var fontsEnd   = template.indexOf('<meta name="theme-color"');
  var chrome = {
    ga:          template.substring(gaStart, gaEnd),
    fonts:       template.substring(fontsStart, fontsEnd) + '<meta name="theme-color" content="#2c2c2c">',
    nav:         sliceRegion(template, '<!-- NAV_START -->', '<!-- NAV_END -->'),
    credibility: sliceRegion(template, '<!-- CREDIBILITY_START variant="listing" -->', '<!-- CREDIBILITY_END -->'),
    footer:      sliceRegion(template, '<!-- FOOTER_START -->', '<!-- FOOTER_END -->'),
    tail:        template.substring(template.indexOf('<!-- Lightbox'), template.indexOf('</body>')),
  };

  var only = process.argv[2];
  var slugs = only ? [only] : Object.keys(MANIFEST);
  slugs.forEach(function(slug) {
    if (!MANIFEST[slug]) throw new Error('No MANIFEST entry for slug: ' + slug);
    generate(slug, MANIFEST[slug], soldItems, template, chrome);
  });
}

main();
