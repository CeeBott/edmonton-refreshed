# Internal Linking Plan — Feed the Sell Cluster

**Created:** May 21, 2026
**Purpose:** Lift the `/sell/` hub and the 20-page sell-landing cluster off page 4 of Google by routing internal link equity into them.
**Companion doc:** `seo-analytics-audit-2026-05-21.md` (Aggressive Action #1).
**Scope:** Observation + plan only. No code was changed producing this document.

---

## The Finding

The audit assumed `/sell/` was "reachable mainly from the nav." A code review shows it's better *and* worse than that:

- **Better:** the sitewide footer's three-column taxonomy and the nav dropdown already link to ~17 sell-landing pages from every page. And every guide has 1–3 `.guide-cta` boxes pointing at `/sell/`.
- **Worse:** **not one of the 26 guides — and not one listing page — contains a single contextual, in-prose link to a sell page.** Every `/sell/` link on the entire site is nav chrome, footer chrome, or a CTA box.

This matters because Google evaluates internal links by context and position. A link inside a sentence of relevant article prose passes real topical signal. A link repeated in the footer of all 60+ pages on the site is recognized as boilerplate and discounted close to zero. The sell cluster currently receives **only the discounted kind.** That is a direct, mechanical reason it sits at position 41.

The fix is not "more links." It is **contextual links** — editorial links inside guide and listing prose, where the surrounding words tell Google what the target page is about.

### Bug to fix first — 5 orphaned guides

These 5 guides have **no nav, no footer, and no `.guide-cta`** — meaning no standard template chrome at all. They are dead-end pages with effectively zero internal links in or out, and four of them are *seller-intent* guides, the exact content that should be feeding the cluster:

| Orphaned guide | Should be |
|---|---|
| `guides/how-to-sell-high-end-furniture-edmonton/` | full template |
| `guides/sell-couch-sectional-fast-edmonton/` | full template |
| `guides/selling-l-shaped-sectional-edmonton/` | full template |
| `guides/selling-modular-sectional-edmonton/` | full template |
| `guides/selling-u-shaped-sectional-edmonton/` | full template |

Likely cause: these were created without the `<!-- NAV_START -->`, `<!-- CREDIBILITY_START -->`, and `<!-- FOOTER_START -->` marker pairs, so `build.js` never injected the partials into them. They also lack the `.guide-cta` block. Until they carry the standard chrome, no linking plan reaches them — and they leak no equity anywhere.

### Minor: one sell page missing from the footer

The footer taxonomy links 17 sell pages; `/sell/eq3-edmonton/` is not among them. `american-leather-edmonton` and `bb-italia-edmonton` are correctly excluded (they're redirect stubs). EQ3 looks like an accidental omission — add it to the footer taxonomy via `config/taxonomy.js`.

---

## Phase 0 — Fix the orphaned guides (do first)

For each of the 5 guides above: add the standard guide template chrome — the `NAV_START`/`NAV_END`, `CREDIBILITY_START variant="buyer"`/`CREDIBILITY_END`, and `FOOTER_START`/`FOOTER_END` marker pairs, plus a `.guide-cta` block — per the canonical guide structure in `CLAUDE.md` §5.12. Then rebuild so `build.js` injects the partials. Verify each renders with nav and footer.

This is a prerequisite. The Phase 1 mapping below assigns these 5 guides contextual links, but those links only count once the pages are real, navigable pages.

---

## Phase 1 — Contextual links in guide prose (the core work)

**The rule:** every guide gets **2 contextual, in-prose links** into the sell cluster — one in the **first third** of the article (where a reader's intent forms), one **deeper in the body** at a topically natural sentence. These are *in addition to* the existing `.guide-cta` box, which stays. Guides are authored files (`CLAUDE.md` §4.2), so these are hand-edits to the article HTML.

**Targets are assigned by topic match.** Link a guide to the sell page whose target query the guide's content most closely supports. For B&B Italia and American Leather contexts, link to `/sell/` directly — their brand sell pages are redirect stubs, and you never want an internal link pointing at a redirect.

### Guide → sell-page mapping

| Guide | Primary target | Secondary target | Anchor-text ideas (vary them) |
|---|---|---|---|
| `natuzzi-sofa-review-edmonton` | `/sell/natuzzi-edmonton/` | `/sell/leather-sofa-edmonton/` | "sell your Natuzzi in Edmonton", "get an offer on a Natuzzi sofa" |
| `rove-concepts-sofa-review-edmonton` | `/sell/rove-concepts-edmonton/` | `/sell/sectional-edmonton/` | "sell a Rove Concepts piece", "what your Rove sectional is worth" |
| `bb-italia-sofa-review-edmonton` | `/sell/` | `/sell/sell-designer-furniture-edmonton/` | "sell a B&B Italia piece in Edmonton", "selling designer furniture" |
| `best-sofa-brands-resale-value-edmonton` | `/sell/sell-designer-furniture-edmonton/` | `/sell/` | "sell a designer sofa in Edmonton", "get a firm offer" |
| `used-sofa-couch-value-edmonton` | `/sell/` | `/sell/sofa-edmonton/` | "sell your sofa to us", "what we'd pay for it" |
| `sectional-sofa-cost-edmonton` | `/sell/sectional-edmonton/` | `/sell/` | "sell your sectional in Edmonton" |
| `how-to-sell-high-end-furniture-edmonton` | `/sell/sell-designer-furniture-edmonton/` | `/sell/` | "sell high-end furniture in Edmonton", "request an offer" |
| `sell-couch-sectional-fast-edmonton` | `/sell/sell-furniture-fast-edmonton/` | `/sell/couch-edmonton/` | "sell your couch fast", "skip Marketplace" |
| `who-buys-used-couches-edmonton` | `/sell/couch-edmonton/` | `/sell/` | "we buy used couches in Edmonton" |
| `edmonton-furniture-consignment-resale-guide` | `/sell/furniture-consignment-edmonton/` | `/sell/` | "consign or sell your furniture", "get a direct offer instead" |
| `selling-furniture-before-moving-edmonton` | `/sell/selling-furniture-before-moving-edmonton/` | `/sell/sell-furniture-fast-edmonton/` | "sell furniture before a move", "sell it fast before moving day" |
| `selling-furniture-facebook-marketplace-edmonton` | `/sell/sell-furniture-fast-edmonton/` | `/sell/` | "skip Marketplace and sell direct" |
| `facebook-marketplace-sofa-vs-curated-reseller` | `/sell/` | `/sell/sell-furniture-fast-edmonton/` | "sell to a curated reseller", "get one firm offer" |
| `moving-edmonton-furniture-keep-sell-replace` | `/sell/selling-furniture-before-moving-edmonton/` | `/sell/downsizing-furniture-edmonton/` | "sell what you're not taking", "downsizing furniture" |
| `selling-inherited-estate-furniture-edmonton` | `/sell/estate-furniture-edmonton/` | `/sell/downsizing-furniture-edmonton/` | "sell inherited furniture in Edmonton", "estate furniture offers" |
| `selling-sectional-sofa-edmonton` | `/sell/sectional-edmonton/` | `/sell/` | "sell your sectional in Edmonton" |
| `selling-l-shaped-sectional-edmonton` | `/sell/sectional-edmonton/` | `/sell/leather-sectional-edmonton/` | "sell an L-shaped sectional", "sell a leather sectional" |
| `selling-u-shaped-sectional-edmonton` | `/sell/sectional-edmonton/` | `/sell/` | "sell your U-shaped sectional" |
| `selling-modular-sectional-edmonton` | `/sell/sectional-edmonton/` | `/sell/` | "sell a modular sectional in Edmonton" |
| `selling-leather-sofa-sectional-edmonton` | `/sell/leather-sofa-edmonton/` | `/sell/leather-sectional-edmonton/` | "sell a leather sofa", "sell a leather sectional" |
| `selling-loveseat-sofa-set-edmonton` | `/sell/sofa-edmonton/` | `/sell/couch-edmonton/` | "sell a sofa set in Edmonton" |
| `selling-fabric-boucle-velvet-sofa-edmonton` | `/sell/sofa-edmonton/` | `/sell/` | "sell a bouclé or velvet sofa" |
| `how-to-tell-if-your-sofa-is-high-quality-edmonton` | `/sell/sell-designer-furniture-edmonton/` | `/sell/` | "sell a high-quality sofa", "see what we'd offer" |
| `what-condition-means-furniture-grading-edmonton` | `/sell/` | `/sell/sofa-edmonton/` | "get your piece assessed and an offer" |
| `how-to-measure-sectional-sofa-edmonton` | `/sell/sectional-edmonton/` | — (buyer guide — see note) | "selling that sectional instead?" |
| `how-to-buy-used-sofa-edmonton` | `/sell/` | — (buyer guide — see note) | "have one to sell?" |

**Note on the two buyer guides.** `how-to-buy-used-sofa-edmonton` and `how-to-measure-sectional-sofa-edmonton` serve buyers, not sellers. Give them **one** soft sell link (a "have one to sell?" aside), and spend their other contextual link pointing at **inventory** — the homepage or a relevant live listing — so they still serve their own audience. Don't force two sell links into a buyer-intent article; it reads as spam and Google notices.

### Anchor-text discipline

- **Vary every anchor.** Never use the identical phrase twice across the site. Repeated exact-match anchors ("sell furniture Edmonton" × 26) read as manipulation.
- **Descriptive, natural, in-sentence.** The link should be a phrase a human would write anyway — "if you're ready to *sell a Natuzzi piece in Edmonton*, we make an offer within 24 hours" — not a bare "click here" and not a keyword stuffed mid-paragraph.
- **One link per target per article.** Don't link the same sell page twice from one guide.
- **Place the first link high.** A contextual link in paragraph 2–3 carries more weight and catches the reader while intent is fresh.

---

## Phase 2 — Listing pages into the cluster

Listing pages are **generated by `build.js`** (`CLAUDE.md` §4.2, §10.4) — do **not** hand-edit the generated HTML. Changes go in `build.js` (`generateListingPage`) or the listing data.

Two items:

1. **Confirm the `.listing-sell-line` links to a sell page on every active listing.** The sell line is supposed to be generated for every listing (§5.10). A scan found it linking only on some — verify `b-b-italia-charles-sectional-edmonton`, `la-z-boy-roundabout-ottoman-edmonton`, `la-z-boy-emric-right-facing-sectional`, and `rove-concepts-milo-6-piece-modular-sectional` all render a working sell-line link after the next build.

2. **Make the sell-line target brand- or type-specific.** Right now where it links, it links to `/sell/` generically. In `generateListingPage`, point the sell line at the *matching* sell page based on the listing's brand and piece type — a Rove Concepts sectional listing → `/sell/rove-concepts-edmonton/`; a leather sectional → `/sell/leather-sectional-edmonton/`; fall back to `/sell/` only when nothing matches. This mirrors the existing `brandGuideMap` pattern (which already auto-injects listing→guide links) — add a parallel `brandSellMap` / type map. One change in `build.js`, applies to every current and future listing.

Sold-stub and redirect-stub listings need nothing — leave them.

---

## What's already fine — don't redo it

- **Footer + nav coverage** of the sell cluster exists sitewide. Keep it. It's just not *sufficient* on its own.
- **`.guide-cta` boxes** exist on the 21 properly-built guides. Keep them — they're the closing CTA. The Phase 1 contextual links are additive, not a replacement.
- **Sell pages → guides:** the cluster already cross-links *out* to guides per `CLAUDE.md` §5.13. Spot-check that it still holds after Phase 0, but no new work is planned here.

---

## Sequencing & housekeeping

1. **Phase 0** — restore template chrome to the 5 orphaned guides; add EQ3 to the footer taxonomy. ~1 sitting.
2. **Phase 1** — work the mapping table top-down. Brand-review guides first (`natuzzi-`, `rove-concepts-`, `bb-italia-` — they rank best and pass the most equity), then the selling guides, then the rest. Budget ~10–15 min per guide. ~26 guides over a few sittings.
3. **Phase 2** — the `build.js` sell-line change. ~1 sitting.

**Every guide you edit:** bump its `dateModified` to the edit date and rebuild (`CLAUDE.md` §5.4). Run the §5.4 verification grep afterward.

**Migration note:** internal linking is low-risk and migration-safe — no need to wait for the migration to settle. It changes no URLs and removes no pages.

**Documentation:** when this ships, update `CLAUDE.md` §5.8 to codify the new standing rule — "every guide carries 2 contextual in-prose links into the sell cluster, target assigned by topic" — so future guides are built with it rather than retrofitted. Per §1.2, that doc update is part of the work, not a follow-up.

---

## Why this is the highest-leverage move

The sell cluster is built. The seller demand is proven (400+ unclicked seller-intent impressions). The only thing between the two is ranking, and the cheapest, fastest, lowest-risk ranking lever is internal contextual links — which currently number zero. This plan turns 26 guides and a handful of listings from boilerplate-only linkers into 50+ contextual signals pointing at the exact pages the business needs on page 1. It costs no ad spend, touches no URLs, and can ship this week.
