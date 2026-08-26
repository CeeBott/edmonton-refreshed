// ═══════════════════════════════════════════════════════════
//  CONDITION GRADE SCALE — single source of truth
//
//  A published, comparable standard so "Excellent" means the same
//  thing on every listing. Rendered on listing pages as the condition
//  bar (grades in this order, worst → best) plus the expandable
//  "How we grade condition" rubric.
//
//  An item opts in by setting `conditionGrade: "<name>"` in
//  js/available-data.js. The per-piece `condition` string stays the
//  specific observation for THAT piece; this is the shared definition.
//
//  ── FOUR TIERS, NOT FIVE ──
//  These four grades and their signals mirror the already-published
//  framework in guides/what-condition-means-furniture-grading-edmonton/,
//  whose <title> and meta description both say "4 Tiers". That guide is
//  the deep rubric (cushion, fabric, crevice, and smell tests); this file
//  is the same standard in one line per tier. "Like New" is deliberately
//  NOT a separate grade — the guide folds it into Excellent. Adding a
//  fifth tier here would publish two disagreeing standards on one site.
//  Change one and you must change the other, guide title included.
//
//  ── OBSERVABLE SIGNS ONLY ──
//  A definition states what is or is not present on the piece — pilling,
//  fading, staining, cushion compression, sag. It never infers how much the
//  piece was used or how old it is. "Minimal use" and "1-2 years old" are
//  guesses about a history we did not witness and cannot stand behind; the
//  labelled Year field carries the date when we actually know it.
// ═══════════════════════════════════════════════════════════

// Order is the render order of the bar, lowest grade first.
var conditionGrades = [
  {
    name: "Fair",
    definition: "Heavy pilling, fading, or staining. Permanent cushion indentation, possibly some sag. Structurally sound.",
  },
  {
    name: "Good",
    definition: "Visible pilling or fading, and possibly a small stain. Cushions show indentation.",
  },
  {
    name: "Very Good",
    definition: "Light pilling or fading at most. Cushions stay reasonably firm.",
  },
  {
    name: "Excellent",
    definition: "No pilling, fading, or flattening of cushions present.",
  },
];

// Shown under the rubric. States only what the site already claims elsewhere
// (the sitewide listing trust statement) — it is not a new promise.
var conditionScopeNote =
  "Grades describe cosmetic condition. Every piece is separately inspected for " +
  "construction, materials, and manufacturer consistency before it is listed.";

// Deep rubric — the 60-second self-check and the full per-tier tests.
var conditionGuideHref = "/guides/what-condition-means-furniture-grading-edmonton/";
var conditionGuideLabel = "How we test each tier, in full";

module.exports = {
  conditionGrades: conditionGrades,
  conditionScopeNote: conditionScopeNote,
  conditionGuideHref: conditionGuideHref,
  conditionGuideLabel: conditionGuideLabel,
};
