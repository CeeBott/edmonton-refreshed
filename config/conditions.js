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
//  These four names, in this order, are the already-published framework in
//  guides/what-condition-means-furniture-grading-edmonton/, whose <title>
//  and meta description both say "4 Tiers". "Like New" is deliberately NOT
//  a separate grade — that guide folds it into Excellent. Adding a fifth
//  tier here would publish two disagreeing standards on one site. Change
//  one and you must change the other, guide title included.
//
//  ── ONE LINE, NOT A CHECKLIST ──
//  The wording is deliberately looser than that guide's diagnostic table.
//  The guide is the rubric a seller grades their own piece against, test by
//  test; this is the one line a buyer reads beside a piece we have already
//  graded. It should not read as a checklist deteriorating tier by tier.
//
//  ── NO CLAIMS ABOUT HISTORY ──
//  A definition describes the piece in front of you. It never states how
//  long it was owned or how heavily it was used — that is a history we did
//  not witness. The labelled Year field carries age when we actually know it.
// ═══════════════════════════════════════════════════════════

// Order is the render order of the bar, lowest grade first.
var conditionGrades = [
  {
    name: "Fair",
    definition: "Pilling, subtle stains, and cushion compression present. Structurally sound.",
  },
  {
    name: "Good",
    definition: "Some signs of use. Well cared for without visible staining or significant upholstery degradation.",
  },
  {
    name: "Very Good",
    definition: "No pilling, no stains, cushions hold their loft with next to no persistent indentation.",
  },
  {
    name: "Excellent",
    definition: "Very few signs of use, nearly new condition.",
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
