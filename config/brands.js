// ═══════════════════════════════════════════════════════════
//  BRAND BLURBS — single source of truth
//
//  A short, factual note on the manufacturer, rendered on every
//  listing page for that brand (and reusable on other surfaces later).
//  Keyed by the exact `brand` string used in js/available-data.js.
//
//  Rules:
//   - Factual only. Construction, provenance, what the brand actually
//     does — never "refinement, sophistication and everyday elegance."
//   - Brand-general, not piece-specific. It renders on every piece of
//     that brand, so it cannot reference one model.
//   - Two or three sentences. If it needs more, it wants to be a guide.
//   - Only write what can be supported. A brand with no entry simply
//     renders no blurb.
//
//  The listing page links the brand's buyer's guide separately via
//  brandGuideMap in build.js — do not duplicate that link here.
// ═══════════════════════════════════════════════════════════

var brandBlurbs = {
  "Crate & Barrel":
    "Crate & Barrel designs its upholstery in-house rather than reselling other makers' lines, so its sofas and sectionals are exclusive to the brand and do not turn up under other labels. Frames are typically hardwood, and the house performance fabrics are specified for daily use in active households rather than for showroom life.",
};

module.exports = { brandBlurbs: brandBlurbs };
