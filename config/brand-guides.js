// ═══════════════════════════════════════════════════════════
//  BRAND → BUYER'S GUIDE — single source of truth
//
//  One entry per brand with a published brand-review guide, keyed by
//  the exact `brand` string used in js/available-data.js and
//  js/sold-data.js. Renders the "Read our full … buyer's guide" link
//  inside the Description section of every active listing (build.js)
//  and every sold stub (scripts/gen-sold-stub.js), per CLAUDE.md §5.8.
//
//  Add an entry when a new brand guide is published, then rebuild and
//  regenerate that brand's sold stubs. The build warns (lint d) when a
//  published *-sofa-review-edmonton guide has no entry here.
//
//  The two renderers each kept their own copy until 2026-10-30, and the
//  stub generator's copy had missed West Elm.
// ═══════════════════════════════════════════════════════════

var brandGuides = {
  'Natuzzi':          { slug: 'natuzzi-sofa-review-edmonton',          label: 'Read our full Natuzzi buyer&rsquo;s guide for Edmonton' },
  'Natuzzi Editions': { slug: 'natuzzi-sofa-review-edmonton',          label: 'Read our full Natuzzi buyer&rsquo;s guide for Edmonton' },
  'Natuzzi Italia':   { slug: 'natuzzi-sofa-review-edmonton',          label: 'Read our full Natuzzi buyer&rsquo;s guide for Edmonton' },
  'B&B Italia':       { slug: 'bb-italia-sofa-review-edmonton',        label: 'Read our full B&amp;B Italia buyer&rsquo;s guide for Edmonton' },
  'Rove Concepts':    { slug: 'rove-concepts-sofa-review-edmonton',    label: 'Read our full Rove Concepts buyer&rsquo;s guide for Edmonton' },
  'Pottery Barn':     { slug: 'pottery-barn-sofa-review-edmonton',     label: 'Read our full Pottery Barn buyer&rsquo;s guide for Edmonton' },
  'Crate & Barrel':   { slug: 'crate-and-barrel-sofa-review-edmonton', label: 'Read our full Crate &amp; Barrel buyer&rsquo;s guide for Edmonton' },
  'EQ3':              { slug: 'eq3-sofa-review-edmonton',              label: 'Read our full EQ3 buyer&rsquo;s guide for Edmonton' },
  'West Elm':         { slug: 'west-elm-sofa-review-edmonton',         label: 'Read our full West Elm buyer&rsquo;s guide for Edmonton' }
};

module.exports = { brandGuides: brandGuides };
