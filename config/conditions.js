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
//  ── DEGREE ONLY, NEVER A NAMED DEFECT ──
//  A definition states HOW MUCH wear a piece shows, never WHICH defects it
//  shows. No pilling, no staining, no cushion compression — those belong in
//  the per-piece `condition` note, which renders directly beneath the grade.
//
//  This is not a style preference, it is a correctness rule. A definition here
//  is generic by construction: it renders identically on every piece at that
//  grade. The moment it names a defect it is asserting that defect on pieces
//  that do not have it. That is exactly what happened — a Fair definition
//  citing pilling and cushion compression rendered on the B&B Italia Charles,
//  whose own notes record frame, cushions and down fill all intact and no
//  pilling at all. The page claimed damage the sofa did not have.
//
//  The scale says where the piece sits. The note says what is actually there.
//  Keep those jobs separate.
//
//  ── NO CLAIMS ABOUT HISTORY ──
//  A definition describes the piece in front of you. It never states how
//  long it was owned or how heavily it was used — that is a history we did
//  not witness. The labelled Year field carries age when we actually know it.
// ═══════════════════════════════════════════════════════════

// Order is the render order of the bar, lowest grade first.
var conditionGrades = [
  { name: "Fair",      definition: "Well loved, structurally sound." },
  { name: "Good",      definition: "Signs of use." },
  { name: "Very Good", definition: "Minimal signs of use." },
  { name: "Excellent", definition: "Next to no signs of use." },
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
