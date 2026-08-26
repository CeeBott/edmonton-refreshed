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
// ═══════════════════════════════════════════════════════════

// Order is the render order of the bar, lowest grade first.
var conditionGrades = [
  {
    name: "Fair",
    definition: "Heavy pilling, fading or staining, and permanent cushion indentation. Structural or cosmetic issues are present and priced in.",
  },
  {
    name: "Good",
    definition: "Clearly used but structurally sound. Cushions show visible indentation, with obvious pilling or fading and possibly a small stain.",
  },
  {
    name: "Very Good",
    definition: "Well maintained. Cushions stay reasonably firm, wear is minimal, and any patina reads as natural rather than as damage.",
  },
  {
    name: "Excellent",
    definition: "Minimal use. Cushions hold firm, there is no pilling or fading, and seams and stitching are intact. Honest excellent condition is rare.",
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
