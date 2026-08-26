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

  "West Elm":
    "West Elm designs its own upholstery rather than reselling other makers' lines, and specifies a good deal of its seating to contract grade — built to hold up in commercial use, not only residential. Frames are typically kiln-dried wood over sinuous-spring seat support, and much of the range carries GREENGUARD Gold certification for low chemical emissions.",

  "Bracci":
    "Bracci is a Tuscan leather-furniture house that builds to order in the Quarrata furniture district. Production is small-batch, the hides are tanned in Italy, and frames are kiln-dried hardwood over elastic webbing rather than springs. Its pieces are uncommon on the Canadian secondary market.",

  "B&B Italia":
    "B&B Italia produces contemporary Italian design in collaboration with outside architects and designers, and keeps successful pieces in production for decades rather than cycling them seasonally. Frames are typically steel, and several ranges use fully removable covers — which is why well-kept examples stay serviceable long after manufacture.",
};

module.exports = { brandBlurbs: brandBlurbs };
