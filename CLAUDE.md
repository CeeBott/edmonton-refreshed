# Edmonton Refreshed — Operating Manual

Canonical engineering, SEO, and operations handbook for the Edmonton Refreshed
codebase and business systems.

---

## Reading This Document

This file is organized so that the most stable information sits at the top and
the most frequently changing information sits lower:

1. **Header / Meta** — what this document is and how it is maintained.
2. **Business Vision & Strategic Direction** — durable strategic intent.
3. **Core Architectural Principles** — foundational invariants. Rarely changes.
4. **Repository Architecture** — system topology, ownership, data flow.
5. **Canonical Conventions** — the single authoritative source for every recurring rule.
6. **SEO & Discovery Systems** — *why* the site is shaped the way it is.
7. **UI & Layout Architecture** — frontend layout philosophy and invariants.
8. **Operational Playbooks** — mutable step-by-step workflows.
9. **Historical Notes & Gotchas** — institutional memory and known quirks.
10. **Deprecated Patterns** — quarantined obsolete approaches.

**Weight labels.** Where helpful, content is tagged so not everything reads as
equally important:

- `[Core Invariant]` — foundational; changing it is a major architectural decision.
- `[Canonical]` — the authoritative definition of a rule; do not restate it elsewhere.
- `[Operational]` — a mutable workflow expected to evolve.
- `[Historical]` — preserved context, not active guidance.
- `[Deprecated]` — do not use for new implementation.

When a rule is referenced from a workflow, the workflow points to its canonical
home rather than restating it (e.g., "see Canonical Conventions → Image
Standards").

---

# 1. Header / Meta

## 1.1 Document Purpose & Authority

This `CLAUDE.md` is the **single canonical operating manual** for Edmonton
Refreshed — a static site for a curated pre-owned furniture dealer in Edmonton,
AB, built with vanilla HTML/CSS/JS and a Node.js build script, hosted on GitHub
Pages.

It is the source of truth for every convention on the site: schemas, build
rules, file layout, data shapes, workflows, SEO architecture, layout
architecture, and asset versions. Where the document and the codebase disagree,
that is a bug in one of them — see §1.3.

The document is a **single file** by design and should remain one unless a
compelling future reason to modularize emerges.

## 1.2 Documentation Is Part of the Work

Documentation maintenance is part of implementation, not a follow-up task. A
change that ships without the corresponding documentation update is a
half-finished change.

When a system evolves, the full unit of work is:

1. Update the implementation.
2. Update the canonical section of this document.
3. Relocate or deprecate any obsolete guidance (move it to §9 or §10).
4. Eliminate any duplication the change introduced.
5. Preserve the rationale — record *why*, not only *what*.

## 1.3 Canonical-Source Philosophy

This document is infrastructure. Treat unnecessary growth as architectural debt.

- **Do not** treat the file as append-only. Prefer consolidation, replacement,
  refactoring, and canonicalization over accumulation, repeated clarifications,
  and scattered exceptions.
- **No duplicate canonical rules.** Each recurring rule has exactly one
  canonical explanation, which lives in §5. Other sections reference it.
- **Separate current truth from history.** When a system changes, update the
  canonical section and move the old guidance to §9 (Historical) or §10
  (Deprecated). Never leave old and new logic intermixed.
- **Preserve rationale.** Important systems document what, why, and exceptions —
  not implementation steps alone.
- **Every new system needs a canonical home.** Before adding guidance, ask
  where it belongs permanently. Never append randomly.
- **Avoid snapshot data in narrative.** Rapidly changing values (asset
  versions, counts, metrics) are centralized — see §5.7 and §2.4 — rather than
  scattered through prose.

When uncertain whether information is canonical, operational, historical, or
deprecated, **preserve it** by relocating it to the most appropriate section
rather than deleting it.

## 1.4 Maintenance Protocol

- If you notice drift between this file and the codebase during any session,
  fix the documentation before continuing the original task. The same standard
  of accuracy that applies to code applies to this file.
- Periodically (treat it like a quarterly infrastructure pass) do a dedicated
  refactor: merge duplicates, relocate legacy notes, simplify wording, verify
  that canonicals are still accurate, remove drift, and consolidate overlapping
  systems.
- Strategic direction (§2) may only be changed by explicit human direction —
  see §2.3.

---

# 2. Business Vision & Strategic Direction

> Strategic context in this section may only be modified by explicit human
> direction. See §2.3 for what AI systems may and may not do here.

## 2.1 What This Business Is

Edmonton Refreshed is a curated pre-owned furniture reseller in Edmonton, AB.
The owner (Collin Bottrell) buys quality pieces outright from sellers, inspects
and cleans them, photographs them, prices them against market value, and
resells with delivery.

The key differentiator versus Facebook Marketplace / Kijiji is **curation,
accountability, and convenience** — on both the buy side and the sell side.
Primary inventory is sofas, sectionals, and seating from recognized brands.
When brands are listed, top-tier names lead: B&B Italia, Natuzzi, Rove
Concepts, Crate & Barrel, EQ3, West Elm, American Leather. La-Z-Boy is accepted
selectively and represents the lower end of what the business takes — it should
appear at the end of any brand list, never as the primary example.

## 2.2 Strategic Direction

The platform is intended to evolve toward higher-trust, higher-signal local
commerce systems for premium secondhand furniture.

Long-term possibilities **may** include multi-city operations,
facilitator/curation systems, seller qualification systems, and
transaction-quality infrastructure. However:

- Future organizational structure is intentionally undefined.
- Marketplace expansion is **not** a committed roadmap item.
- Preserving trust and signal quality is more important than maximizing
  inventory volume.

The platform should **not** evolve toward open classifieds systems, low-quality
inventory aggregation, engagement-driven marketplace mechanics, or spam-heavy
user-generated ecosystems.

## 2.3 Constraints on AI-Authored Strategy

AI systems working in this document **may** reorganize, clarify, compress, and
cross-reference strategic content.

AI systems **may not** invent strategic direction, infer roadmap commitments,
extrapolate business models, fabricate market positioning, or synthesize
startup narratives. Do not include startup hype, motivational fluff,
unrealistic projections, or vanity metrics.

## 2.4 Durable Strategic Principles

These principles remain durable unless intentionally redefined by human
direction:

- Trust-first commerce.
- High-signal inventory over volume.
- Curated quality.
- SEO integrity.
- Structured, deliberate presentation.
- Operational seriousness.
- Transaction quality over engagement metrics.

> **Volatile business data is not stored here.** Live counts (pieces sold /
> bought), rating, and offer range live in `config/site.js` and render into the
> credibility strip and schemas. Update them there once; do not hardcode them
> into narrative documentation.

---

# 3. Core Architectural Principles

`[Core Invariant]` — This section defines foundational system behavior and
should rarely change. Implementation details may evolve; the reasoning behind
these decisions is preserved even when it does.

- **Static-site-first.** The site is plain static HTML/CSS/JS. There is no
  runtime server for page rendering. This keeps hosting trivial (GitHub Pages),
  keeps the site fast, and keeps it fully crawlable.

- **Deterministic build.** `build.js` is the single build step. Running it
  regenerates all derived artifacts deterministically from source data and
  partials. Generated files are never hand-edited; source files and partials
  are. See §4.

- **Vanilla stack preference.** No frameworks, no bundler beyond the in-house
  minification in `build.js`. New work should stay within vanilla
  HTML/CSS/JS unless there is a compelling reason otherwise.

- **SEO-first architecture.** The site's structure exists to be discovered.
  Structured data, local-search signals, semantic markup, static fallbacks for
  crawlers, and a long-tail page taxonomy are first-class architectural
  concerns, not afterthoughts. See §6 for the reasoning.

- **Local-first SEO strategy.** Edmonton is the anchor. URLs, copy, schema, and
  locale signals all reinforce the Edmonton/Alberta/Canada signal. See §6.1.

- **Structured-data philosophy.** Every page carries structured data in
  `<head>`. This is one of the strongest discoverability levers available and
  is kept current as a matter of course. See §5.4 and §6.4.

- **Single sources of truth.** Recurring content (city, contact, stats, brand
  statement, taxonomy of brands / furniture types / situations) lives in
  `config/` and is rendered everywhere from there. No content is duplicated
  across pages by hand. See §4.4.

- **Partial injection architecture.** Sitewide layout blocks (nav, credibility
  strip, footer) are generated from `partials/` and injected at build time into
  every page that carries the marker comments. This eliminates the
  "update every copy" maintenance pattern. See §4.5.

- **Documentation as infrastructure.** This file is maintained to the same
  standard as production code. See §1.

- **Maintainability and scalability.** Conventions exist so the site can grow
  (more inventory, more guides, more landing pages, eventually more cities)
  without proportional growth in manual effort. The multi-city path is a fork
  of `config/site.js`, not a rewrite — see §4.4.

---

# 4. Repository Architecture

## 4.1 File & Directory Map

```
index.html              Homepage (available inventory, reviews, FAQ)
about/index.html        About page
sold/index.html         Sold inventory archive
sell/index.html         Sell-your-furniture page (main hub)
sell/[slug]/   Brand, piece-type, and situational sell landing pages
                          (manually maintained — see §5.10)
privacy/index.html      Privacy policy
404.html                Custom 404
listings/[slug]/        Individual listing pages (auto-generated by build.js)
guides/index.html       Guides landing page (manually maintained)
guides/[slug]/          Individual guide articles (manually created)
js/available-data.js    Available inventory data + client-side render function
js/sold-data.js         Sold inventory data + client-side render function
js/reviews-data.js      Customer reviews data + client-side render function
js/shared.js            Carousel, lightbox, GA4 tracking, mobile nav, nav dropdown toggle
js/sell-form.js         Sell-form handler (used on /sell/ and every sell landing page)
js/*.min.js             Minified JS bundles (regenerated by build.js)
css/styles.css          Source stylesheet
css/styles.min.css      Minified stylesheet (regenerated by build.js)
images/[XX-NNN]/        Per-piece image folders. Each .jpeg has matching
                          -400w.jpeg / -800w.jpeg / .jpeg full-size variants,
                          PLUS .webp / -400w.webp / -800w.webp and
                          .avif / -400w.avif / -800w.avif companions.
images/Sold Inventory/  Legacy archive — sold pieces from before the
                          stable-URL convention (§5.3). New sales no longer
                          move folders; existing entries stay here for URL
                          continuity.
build.js                Build script — regenerates static HTML, schemas,
                          listing pages, sitemap, minified JS + CSS
sitemap.xml             Auto-generated by build.js
.build-state.json       Sidecar: per-URL content hash + lastmod (committed)
scripts/gen-sold-stub.js  Sold-stub generator (run manually) — emits a
                          listings/[slug]/ sold stub from a per-piece
                          manifest. See §8.3.
config/site.js          Site-wide config: city, contact, brand statement, stats
config/taxonomy.js      Single source of truth for brands, furniture types,
                          and seller situations
config/faqs.js          FAQ source of truth for homepage / sell hub / about
partials/nav.js         renderNav() — sitewide top navigation
partials/footer.js      renderFooter() — sitewide global footer
partials/credibility.js renderCredibility(variant) — buyer / seller / listing
worker/index.js         Cloudflare Worker — sell-form handler
worker/wrangler.toml    Worker deploy config
llms.txt                Plain-text business summary for LLM crawlers
robots.txt              Crawler policy — search/answer bots allowed, AI
                          training crawlers blocked (also enforced at the
                          Cloudflare edge). See §6.5.
```

## 4.2 Generated vs Authored Files

**Authored (edit these):** all `js/*.js` source files, `css/styles.css`,
`config/*.js`, `partials/*.js`, `build.js`, `worker/*`, all manually maintained
HTML pages (`about/`, `sell/index.html`, every `sell/[slug]/`,
`privacy/`, `404.html`, `guides/index.html`, every `guides/[slug]/`), and
sold-stub / redirect-stub listing pages.

**Generated by `build.js` (never hand-edit):** `index.html` and
`sold/index.html` content between marker comments, all active
`listings/[slug]/index.html` pages, `sitemap.xml`, `.build-state.json`,
`css/styles.min.css`, all `js/*.min.js` bundles, the nav / credibility /
footer blocks inside every page's marker pairs, every `?v=…` query string,
and the FAQ visible/schema blocks between `FAQ_VISIBLE_*` / `FAQ_SCHEMA_*`
markers on the homepage, sell hub, and about page, and the
sell-landing `ItemList` of `ImageObject` items between
`LANDING_SOLD_SCHEMA_*` markers on every `sell/[slug]/` page
that displays a `.sell-landing-sold-grid`.

`.build-state.json` is the sidecar that powers content-hash sitemap
freshness — commit it alongside source so dates persist across machines.
See §5.8.

## 4.3 `build.js` Responsibilities

Running `node build.js` regenerates, in one deterministic pass:

- **Assets** — `css/styles.min.css` and every `js/*.min.js` bundle are
  minified from their source files. Each minified bundle gets a short
  content hash (first 8 hex of SHA-256) injected automatically as a `?v=…`
  query string everywhere it's referenced. No manual version registry.
- `index.html` — static fallback cards + `Product` schemas + LCP preload,
  between marker comments.
- `sold/index.html` — static fallback sold cards.
- `listings/*/index.html` — one individual listing page per non-coming-soon
  available item.
- **FAQ injection** — `index.html`, `sell/index.html`, and `about/index.html`
  have FAQ visible markup and `FAQPage` JSON-LD generated from
  `config/faqs.js` between marker pairs. Visible and schema cannot drift —
  they share one source. See §5.7.
- `sitemap.xml` — driven by `config/taxonomy.js` (sell cluster) plus
  filesystem discovery of `guides/*/index.html`, the active listings, and
  sold-stub URLs for `soldItems` carrying an `href` (§5.10).
  `<lastmod>` only advances when a page's canonical content actually
  changes; pure rebuilds leave dates stable. Listing and sold-stub URLs also
  emit `<image:image>` children for every photo in `item.images` (image
  sitemap, declared with the `xmlns:image` namespace). See §5.8, §5.15.
- **Partial injection** — walks every `*.html` file in the repo and rewrites
  content between `<!-- NAV_START -->`/`<!-- NAV_END -->`,
  `<!-- CREDIBILITY_START variant="..." -->`/`<!-- CREDIBILITY_END -->`, and
  `<!-- FOOTER_START -->`/`<!-- FOOTER_END -->` markers from `partials/`. The
  same walk also rewrites the sell-landing `ItemList` of `ImageObject`
  items between `<!-- LANDING_SOLD_SCHEMA_START -->`/
  `<!-- LANDING_SOLD_SCHEMA_END -->` markers (parsed from the page's own
  `.sell-landing-sold-grid` — see §5.16), deep-links every
  `.sell-landing-sold-grid` card whose photo belongs to a sold piece that has a
  stub (matched by image folder against `js/sold-data.js` `href`s) straight to
  that stub in a new tab — reverting to `/sold/` if the stub is removed (see
  §5.13) — and rewrites every `?v=…` query
  string to the current asset hash. Files without a given marker pair are
  left untouched for that partial (404 has no credibility; redirect stubs
  have no markers at all). Manually authored content outside marker pairs
  is preserved exactly.
- **Entity-integrity audit** — after writing the sitemap, `build.js` parses
  the JSON-LD on every page it walked and runs three checks. (a) **Owner
  `@id` resolution (hard fail):** if any page references the canonical owner
  `Person` by `@id` (`https://edmontonrefreshed.com/about/#collin`) but no
  page actually *defines* that node, the build sets a non-zero exit code and
  errors out — the guardrail that keeps the About page's `Person` entity from
  being silently deleted while sell pages and guides still point at it (see
  §5.17). (b) **`sameAs` drift (warn):** any `Organization` / `FurnitureStore`
  / `LocalBusiness` whose `sameAs` array differs from `config/site.js#sameAs`
  is reported. (c) **Guide `Article` gaps (warn):** any `guides/*/index.html`
  (except the `CollectionPage` index and redirect stubs) missing an `Article` schema or its
  `author` is listed. The audit is read-only — it never rewrites files;
  warnings are advisory and only the dangling-owner case fails the build.

The marker matcher parses any attributes on the start tag, so adding new
credibility variant slots later is a one-line change in the partial.

`build.js` does **not** regenerate guide article bodies — guide `dateModified`
values are bumped manually (see §5.4).

## 4.4 Config Ownership (`config/`)

`[Core Invariant]` — These files are the single sources of truth that drive
everything generated.

- **`config/site.js`** — city, contact, brand statement, and business stats
  (`piecesSold`, `piecesBought`, `rating`, `offerRange`). `citySlug` / `cityName`
  carry the city identity (e.g. the credibility-strip city name); as of the
  sell-URL migration (§10.15) `citySlug` no longer drives sell-landing URL
  templates — those are city-agnostic paths (`/sell/<slug>/`, §5.1).
  **Multi-city future:** forking the repo for a new city is "edit `site.js`,
  swap the content data files, rebuild" — not a mass find/replace. Each city
  lives on its own domain, so the un-suffixed sell paths never collide.

- **`config/taxonomy.js`** — `brands`, `furnitureTypes`, and `situations`
  arrays. Each entry is `{ name, nav, slug, displayName? }`. Adding an entry
  automatically threads the page into the nav dropdown, the matching footer
  column, and the sitemap. Array order is the render order everywhere.

- **`config/faqs.js`** — `home`, `sell`, and `about` FAQ arrays. Each entry
  produces BOTH the visible `.faq-item` markup and the `FAQPage` JSON-LD
  schema on its corresponding page. See §5.7.

## 4.5 Partial Injection System (`partials/`)

Three sitewide blocks are generated from `partials/` and injected at build
time, with underlying content driven by `config/`. Each partial is a
`render*()` function taking config + context.

- **`partials/nav.js`** — `renderNav()`. No variants. Active state is applied
  client-side by `shared.js` via `data-page` attributes.
- **`partials/footer.js`** — `renderFooter()`. No variants.
- **`partials/credibility.js`** — `renderCredibility(variant)`. Three variants;
  see §5.9 for the canonical variant definitions.

**Marker form** (in manually maintained pages):

```html
<!-- NAV_START -->
…(rewritten by build.js)…
<!-- NAV_END -->

<!-- CREDIBILITY_START variant="seller" -->
…(rewritten by build.js — variant attribute picks the version)…
<!-- CREDIBILITY_END -->

<!-- FOOTER_START -->
…(rewritten by build.js)…
<!-- FOOTER_END -->
```

Listing pages (generated entirely by `build.js`) call the partial functions
directly inside the listing template — no markers needed in the output.

To rename a footer heading, swap an offer line, or change brand-statement copy,
edit the partial or config once and rebuild — never per-page.

## 4.6 Asset Pipeline

- **Images** — every per-piece `.jpeg` is accompanied by responsive variants in
  three formats (AVIF, WebP, JPEG) at three sizes (400w, 800w, full). See §5.3
  for the canonical image standard. `build.js` references all formats via
  `<picture>` tags.
- **JavaScript** — source `js/*.js` files are minified into `js/*.min.js` by
  `build.js` on every run.
- **CSS** — `css/styles.css` is minified into `css/styles.min.css` by
  `build.js` on every run.
- **Cache-busting** — all minified assets are referenced with `?v=<hash>`
  query strings where `<hash>` is the first 8 hex of SHA-256 over the
  minified content. `build.js` computes the hash on every run and rewrites
  every reference across every HTML file. Editing source bumps the hash
  automatically; no manual version tracking. See §5.7.

## 4.7 Worker Architecture (`worker/`)

The sell form posts to a Cloudflare Worker (`worker/index.js`, deployed at
`https://edmonton-refreshed-sell.cbottrell1990.workers.dev/`). The Worker
validates the submission, applies spam defenses, and forwards valid leads to
`info@edmontonrefreshed.com` via Resend. See §5.11 for the canonical worker
contract and spam-defense rules, and §8.11 for the deploy procedure.

## 4.8 Deployment Architecture

The static site and the Worker deploy **independently**:

- **Static site** — GitHub Pages auto-deploys from the `main` branch within
  ~60 seconds of a push. Collin handles all pushes personally.
- **Worker** — deployed separately from the `worker/` directory via
  `wrangler deploy`. Pushing to `main` does **not** redeploy the Worker.

See §8.12 for the deploy playbook and the AI/Collin responsibility boundary.

---

# 5. Canonical Conventions

`[Canonical]` — This is the authoritative source for every recurring rule. If a
rule appears to be needed elsewhere, reference this section rather than
restating it.

## 5.1 URL & Slug Conventions

- **Listing slugs** follow `{brand}-{model}-{piece-type}-edmonton` — lowercase,
  hyphens, no special characters. Examples:
  `b-b-italia-charles-sectional-edmonton`,
  `la-z-boy-roundabout-ottoman-edmonton`. The trailing `-edmonton` reinforces
  the local-search signal and prevents collisions with broader queries. Set the
  `slug` explicitly on every new listing; the `build.js` auto-generated
  fallback (brand + title) rarely reads cleanly.
- **Guide slugs** are a URL-friendly version of the title — lowercase, hyphens,
  no stop words. Example: `how-to-buy-used-sofa-edmonton`.
- **Sell landing pages** live at `sell/[slug]/` — **no `-edmonton` suffix**
  (unlike listing and guide slugs, which keep it). The `slug` comes from the
  matching `config/taxonomy.js` entry; the `sellUrl()` helper no longer appends
  a city slug. The old `sell/[slug]-edmonton/` URLs are retained as redirect
  stubs (see §8.10, §10.15); the local signal on these pages comes from copy,
  schema, and the domain rather than the path.
- **Changing a listing slug** preserves the old URL's indexed equity via a
  redirect stub — see §8.7. Never simply delete a URL that may be indexed.

## 5.2 Currency

`[Core Invariant]` — **Every price on the site is in Canadian Dollars (CAD).**
This is a Canadian business serving Edmonton; no other currency ever appears.
The convention applies in three layers:

1. **Schemas (machine-readable).** Every `Offer` uses `"priceCurrency": "CAD"`;
   every `MonetaryAmount` (shipping rate, etc.) uses `"currency": "CAD"`. Every
   `Offer` carries `eligibleRegion` and `areaServed` set to
   `{ "@type": "Country", "name": "CA" }`. `MerchantReturnPolicy.applicableCountry`
   and `shippingDestination.addressCountry` are both `"CA"`.

2. **Locale signals (machine-readable).** `<html lang="en-CA">` on every page
   (not bare `en`). `<meta property="og:locale" content="en_CA">`.
   `<meta name="geo.region" content="CA-AB">` and
   `<meta name="geo.placename" content="Edmonton">`. `Organization` /
   `FurnitureStore` schemas include `address.addressCountry: "CA"`.

3. **Visible text (human-readable).** Every visible price renders with a
   trailing ` CAD`. Google's rich-result snippets and AI overviews often read
   visible text rather than schema, and an unlabeled `$3,900` reads as USD to a
   non-Canadian crawler. The CAD suffix is appended at the **rendering layer**,
   never stored in data:
   - **Data shape.** `price` and `retailEstimate` are stored as **pure
     numbers** (e.g. `price: 7500`, `retailEstimate: 28000`) — no `$`, no
     thousands separator, no string quoting. Schemas use the numeric value
     directly; visible markup goes through a render-time formatter.
   - **The render-time helper.** `formatPrice(n)` lives in `build.js`
     (server-side) and `js/available-data.js` (browser-side). It uses
     `Intl.NumberFormat('en-CA', { maximumFractionDigits: 0 })` and returns
     `"$X,XXX"`. The CAD suffix is appended at the markup boundary as
     `<span class="card-price-currency">CAD</span>` or literal ` CAD`.
   - Homepage cards: `js/available-data.js` `renderAvailable()` and `build.js`
     `generateAvailableHTML()` both wrap the price as
     `$X,XXX <span class="card-price-currency">CAD</span>`.
   - Listing pages: `build.js` `generateListingPage()` emits
     `<div class="listing-price">$X,XXX <span class="listing-price-currency">CAD</span></div>`,
     the value pill (`pill-retail` / `pill-now`) gets ` CAD` appended to each
     side, and the sticky mobile CTA reads `Text to Secure → $X,XXX CAD`.

Any new visible price surface must call `formatPrice()` and append ` CAD`;
any new schema with a price/monetary field uses the numeric value directly
with `priceCurrency: "CAD"`.

## 5.3 Image Standards

Every per-piece original `.jpeg` requires responsive variants because the site
serves **AVIF first, WebP fallback, JPEG final fallback** via `<picture>` tags.
Every original needs all three formats at 400w, 800w, and full size.

Generation command (run from repo root):

```bash
for img in images/XX-NNN/*.jpeg; do
  base="${img%.jpeg}"
  # JPEG: 400w + 800w (original full-size .jpeg already exists)
  convert "$img" -resize 400x -quality 82 "${base}-400w.jpeg"
  convert "$img" -resize 800x -quality 82 "${base}-800w.jpeg"
  # WebP: full + 400w + 800w
  convert "$img"             -quality 80 "${base}.webp"
  convert "$img" -resize 400x -quality 80 "${base}-400w.webp"
  convert "$img" -resize 800x -quality 80 "${base}-800w.webp"
  # AVIF: full + 400w + 800w (powers LCP preload + <picture> primary source)
  convert "$img"             -quality 55 "${base}.avif"
  convert "$img" -resize 400x -quality 55 "${base}-400w.avif"
  convert "$img" -resize 800x -quality 55 "${base}-800w.avif"
done
```

If a variant is missing on disk the browser falls through to the next format —
but **missing AVIF disables LCP preload**, so always generate the full set.
`build.js`'s `srcsetFor()` helper builds the `srcset` attribute. The JS render
in `available-data.js` does not use `srcset` — it uses full-size images in
carousels.

**Image folders** are named `images/XX-NNN/` where `XX` is a brand abbreviation
and `NNN` is the next sequential number. Examples: `BB-030` (B&B Italia),
`LB-041` (La-Z-Boy), `RC-043` (Rove Concepts), `NE-040` (Natuzzi Editions).
Individual image files are named `brand-slug-NN.jpeg`. The first image in a
data array is the cover photo.

**Stable-URL convention (mandatory for new sales).** When a piece sells, the
image folder **stays where it is** — at `images/XX-NNN/`. Do **not** move
it to `images/Sold Inventory/`. The only thing that changes in
`sold-data.js` is the relative-path prefix (`../images/XX-NNN/...` because
sold/ is one level deep). The photo URL stays identical from active to
sold, so Google Images / Lens / shopping surfaces keep the photo's
indexed URL stable across the transition instead of dropping it on a
404 and rediscovering it weeks later. See §6.3 and §8.3 for the full
protocol; §9.5 captures why this convention exists; §10.14 deprecates the
old folder-move convention.

The legacy `images/Sold Inventory/` subfolder still exists for pieces
sold before this convention — leave those folders alone (their URLs are
indexed at that path). Going forward, the subfolder is closed to new
entries.

## 5.4 Schema & `dateModified` Standards

`[Canonical]` — Every page carries structured data in `<head>`. This table is
the source of truth for which schemas appear on each page type.

| Page | Schemas present in `<head>` |
|---|---|
| `index.html` (homepage) | `BreadcrumbList`, `WebSite` (homepage-only, site-level entity definition), `FurnitureStore` (with `aggregateRating` + embedded `review` array), `FAQPage`, plus N `Product` schemas (one per non-coming-soon item, injected between `<!-- PRODUCT_SCHEMA_START -->` and `<!-- PRODUCT_SCHEMA_END -->`) |
| `about/index.html` | `BreadcrumbList`, `FAQPage`, `Organization` (with `founder` → owner `Person` by `@id`), `Person` (**canonical owner/author entity**, defined here once — `@id` = `https://edmontonrefreshed.com/about/#collin`; see §5.17) |
| `sold/index.html` | `BreadcrumbList`, `ItemList` of `ImageObject` items (one per sold photo, generated by `build.js` between `SOLD_GALLERY_SCHEMA_*` markers — see §5.16) |
| `sell/index.html` | `FurnitureStore` (with `aggregateRating`), `BreadcrumbList`, `FAQPage`, `Service` |
| `sell/[slug]/index.html` | `BreadcrumbList`, `Service` (with `dateModified`), `FAQPage`, `FurnitureStore` (with `aggregateRating`), `HowTo`, `Person` (**reference only** — `@id` → `https://edmontonrefreshed.com/about/#collin`, defined on the About page, not redefined here; see §5.17), `ItemList` of `ImageObject` items (one per displayed sold card, generated by `build.js` between `LANDING_SOLD_SCHEMA_*` markers — see §5.16) when the page displays a `.sell-landing-sold-grid` |
| `privacy/index.html` | `BreadcrumbList` |
| `listings/[slug]/index.html` (active) | `Product` (with `offers.availability = InStock`, `offers.priceValidUntil` = today + 90d, optional `offers.availabilityStarts`, `offers.hasMerchantReturnPolicy`, `offers.shippingDetails`, `sku` from image folder, `dateModified`, optional `width`/`depth`/`height` `QuantitativeValue`), `BreadcrumbList`, `FurnitureStore` (LocalBusiness — sitewide), `Organization` (sitewide), optional `FAQPage` (when `item.faq` provided) |
| `listings/[slug]/index.html` (sold stub) | `BreadcrumbList`, `ItemList` of `ImageObject` (per-photo gallery — carries the brand via each image's `about`). **No `Product` schema** — see §6.3 |
| `guides/index.html` | `BreadcrumbList`, `CollectionPage` (recommended; verify present) |
| `guides/[slug]/index.html` | `Article` (with `datePublished`, `dateModified`, and an `author` `Person` carrying `@id` → `https://edmontonrefreshed.com/about/#collin` — see §5.17), `BreadcrumbList`, optional `FAQPage` |

**Schema/visible-content sync.** On the homepage, sell hub, and about page,
the visible FAQ section AND the `FAQPage` schema are generated from a single
source — `config/faqs.js`. Edit there; both render in lockstep. See §5.14.
On every active listing page the `Product` `FAQPage` schema and the visible
FAQ section are both generated from `item.faq` in `js/available-data.js`
(see §5.10). The `FurnitureStore` (LocalBusiness) and `Organization`
schemas on listing pages are constants inside `build.js`
(`generateListingPage`) — update them there when business info changes
(phone, address, social profiles, hours); they reinforce the local-Edmonton
signal on every product URL crawlers hit.

**`sameAs` rule — mandatory on every `Organization`, `FurnitureStore`, and
`LocalBusiness` emit.** Every such schema across the site carries a
`sameAs` array pointing to the same canonical external profile URLs, so
search engines can consolidate the business as a single Knowledge Graph
entity rather than splitting trust across variant URLs. The array is
canonically defined in `config/site.js` (`site.sameAs`). `build.js` reads
it directly into the listing-page `FurnitureStore` and `Organization`
schemas (`generateListingPage`); hand-maintained pages — homepage
`FurnitureStore`, about `Organization`, sell hub `FurnitureStore`, every
`sell/[slug]/` `FurnitureStore` (where present) — duplicate the
same array verbatim. Adding a new profile (e.g. YouTube, Pinterest) is a
two-step change: append the URL to `config/site.js#sameAs`, then sync the
hand-maintained pages (see §8.14). Never emit an `Organization` /
`FurnitureStore` without `sameAs`.

**`dateModified` rule — mandatory.** Whenever any HTML page is edited — content,
copy, structure, schema, anything — that page's `dateModified` must be updated
to today's date in ISO format (`YYYY-MM-DD`), even for small changes. Search
engines weight freshness; a stale `dateModified` misrepresents the site.

How it is handled per page class:

1. **Auto-regenerated by `build.js`.** `index.html`, `sold/index.html`, every
   active `listings/[slug]/index.html`, and `sitemap.xml`. Date handling lives
   inside `build.js`:
   - `sitemap.xml` — `<lastmod>` only advances when the canonical content
     hash for that URL has changed since the previous build. See §5.15.
   - Listing-page `Product` schemas — `offers.priceValidUntil` = `today() + 90d`,
     plus a root `dateModified` of `today()`.
   - Homepage `FurnitureStore` and marker-injected `Product` schemas — root
     `dateModified` of `today()`. For the `FurnitureStore` schema that lives in
     raw HTML, `build.js` regex-updates its `"dateModified"` on every build.
   - `sell/index.html` `FurnitureStore` schema — same treatment.
   If `build.js` does not yet do all of the above, treat it as a maintenance
   gap and fix it; the first build touching a page must bring its
   `dateModified` current.

2. **Manually maintained pages.** Editing `about/index.html`,
   `sell/index.html`, `privacy/index.html`, `guides/index.html`,
   `guides/[slug]/index.html`, or `404.html` requires updating `dateModified`
   in every schema on that page that supports it (`Article`, `Organization`,
   `Service`, `CollectionPage`, `WebPage`, etc.). `BreadcrumbList` and
   `FAQPage` do not natively carry `dateModified` — leave them alone unless
   wrapped in a `WebPage` that does.

3. **Guide articles.** Update `dateModified` on every save. Update
   `datePublished` only if the original was wrong.

4. **Verification** (run after any session that touches HTML):
   ```bash
   grep -rn '"dateModified"' --include="*.html" . | grep -v '"dateModified": "'"$(date +%Y-%m-%d)"'"'
   ```
   Any remaining line pointing to a page you edited this session is a bug.
   Lines on pages you did not touch are fine.

**Schema validation.** Before committing significant schema changes, validate
with Google's Rich Results Test (`https://search.google.com/test/rich-results`)
on at least one affected URL. Common breakage: missing required `Product`
fields (`name`, `image`, `offers.price`, `offers.priceCurrency`), invalid date
formats, mismatched `availability` values, missing `image` URLs on `Article`.

## 5.5 Metadata Standards

- **Listing pages** — `metaTitle` leads with
  `"Pre-Owned {brand} {model} {piece-type} for Sale in Edmonton"`;
  `metaDescription` is under 155 characters and includes brand, model,
  condition status, delivery note, and price + CAD. Both are custom on every
  new listing — the `build.js` fallbacks are weaker and may truncate.
- **Guide pages** — `<title>` is `Article Title | Edmonton Refreshed`;
  `<meta name="description">` is concise, keyword-rich, under 160 characters.
- **Open Graph / Twitter** — every page carries OG and Twitter card tags.
  `og:locale` is `en_CA` (see §5.2).
- **Seller-page OG copy convention** — every page under `/sell/` (the hub plus
  every `/sell/[slug]/` landing page, including the legacy full-page redirect
  stubs `american-leather-edmonton` and `bb-italia-edmonton`, which retain this
  copy) leads its
  `meta name="description"`, `og:description`, and `twitter:description` with
  the phrase `Skip Marketplace.` followed by a page-specific seller-journey
  sentence (photos in → offer back → pickup → paid). The supporting sentence
  describes what the **seller** does and receives ("Send photos"), not what the
  business does ("We buy"). Buyer-facing pages (homepage, sold, about, listing
  pages, guides) do **not** use the `Skip Marketplace.` prefix — their OG copy
  stays focused on what buyers see (curated inventory, brand list, inspection).

## 5.6 Heading Hierarchy

Every section heading sitewide uses `<h2 class="section-label">…</h2>` with
uniform styling (small uppercase tracked type). On desktop all `.section-label`
headings render visibly. On mobile most are visually hidden (the section's own
spacing carries hierarchy) — **FAQ section labels are the explicit exception**
and stay visible at every breakpoint. The mobile reveal rule lives at
`.faq-section .section-label, .listing-faq .section-label` inside the
`@media (max-width: 768px)` block in `css/styles.css`.

FAQ section headings always use the exact text `"Frequently Asked Questions"`
(matching every guide article). Never override `.section-label` per section —
uniformity matters more than visual variation.

## 5.7 Cache-Busting

Every minified asset is referenced with a `?v=<hash>` query string where
`<hash>` is the first 8 hex characters of SHA-256 over the minified output.
`build.js` computes the hash on every run and rewrites every reference
across every HTML file (including its own listing-page template) so editing
a CSS or JS source file is enough — the hash bumps itself.

**No manual version registry.** Hash values are not tracked in narrative
documentation; they change too often and a registry just drifts. The
canonical current values are emitted in the `build.js` summary line and
present in every HTML page's asset URLs. To see them, run `node build.js`
or `grep -h '?v=' index.html`.

## 5.8 Internal Linking Rules

- **Guide → listing.** When a guide body names a specific brand or model,
  check for a live listing page at `/listings/[slug]/` and wrap the first
  mention in a contextual anchor. One link per listing per article; links must
  read naturally in prose, never as promotional inserts. If a guide refers to
  inventory only in general terms, update the `.guide-cta` instead of inserting
  mid-article links.
- **Guide → sell cluster.** Every **seller-intent guide** carries **4–5+
  unique, contextual, in-prose links into the sell cluster** (more where they
  read naturally) — at least one in the **first third** of the article (where
  reader intent forms), the rest spread through the body at topically natural
  sentences. These are *in addition to* any `.guide-cta` box and the sitewide
  nav/footer (which already link the whole cluster on every page). Links live
  inside `<article class="guide-body">` prose — **never inside JSON-LD schema**
  (a duplicated FAQ answer often appears both visibly and in `FAQPage` JSON-LD;
  link only the visible copy, keep schema text plain). Assign each link by the
  word it sits on:
  - **Brand name** (Natuzzi, Rove Concepts, EQ3, Crate & Barrel, Restoration
    Hardware, West Elm) → that brand's `/sell/[brand]/` page.
    Exact-match brand-name anchors are the intended pattern and *may* repeat
    across guides (this overrides the older "never reuse a phrase sitewide"
    rule for brand anchors).
  - **Configuration word** (sofa, couch, sectional, and their leather variants)
    → the matching piece-type page (`/sell/sofa/`,
    `/sell/leather-sectional/`, etc.). Match leather context to the
    leather pages; keep fabric pieces on the non-leather pages.
  - **Situational phrase** (downsizing, moving, estate, consignment,
    fast/deadline, designer/name-brand/quality) → the matching situational page
    (`/sell/downsizing-furniture/`, `/sell/estate-furniture/`,
    `/sell/sell-designer-furniture/`, etc.).
  Aim for a mix across all three types. **Never link the same sell page twice
  in-prose** (the `.listing-cta` "Get an Offer" buttons pointing at the page's
  primary target are exempt — they're conversion CTAs, not contextual links),
  and vary non-brand anchor text within a guide. For B&B Italia and American
  Leather contexts, link to `/sell/` or a relevant piece-type page directly —
  their brand sell pages are redirect stubs; never internally link to a
  redirect. **Buyer guide exception**
  (`how-to-buy-used-sofa-edmonton`, `how-to-measure-sectional-sofa-edmonton`):
  give them **one** soft sell link as a "have one to sell?" aside, and spend
  the other contextual link pointing at **inventory** (homepage or a relevant
  live listing). Several sell links in a buyer-intent article reads as spam.
- **Listing → guide.** `build.js`'s `brandGuideMap` auto-injects a
  "Read our full [Brand] buyer's guide for Edmonton" link inside the
  Description collapsible for brands with a published guide. Currently mapped:
  Natuzzi (and Natuzzi Editions / Natuzzi Italia), B&B Italia, Rove Concepts.
  Add an entry when a new brand guide is published.
- **Listing → sell cluster.** `build.js`'s `brandSellMap` plus piece-type
  detection makes the `.listing-sell-line` ("Have one like this? …") target
  the most relevant sell-landing page on every active listing. Brand match
  wins (e.g., Rove Concepts → `/sell/rove-concepts/`); otherwise
  the listing's title/specs are inspected for sectional/sofa/couch + leather
  to pick between `/sell/leather-sectional/`, `/sell/sofa/`,
  etc. Falls back to `/sell/` only when nothing matches. Add a `brandSellMap`
  entry when a new brand sell page goes live.
- **Inventory churn.** When a piece sells, scan guides for links/sentences
  pointing to it — see §8.8.
- **Sell-cluster cross-linking** — see §5.10.

## 5.9 Credibility Strip Variants

`renderCredibility(variant)` produces three variants; copy lives in
`config/site.js`:

- **`buyer`** (default) — `41+ Pieces Sold | ★ 4.9 Rating | Proudly Edmonton Owned & Operated`.
  Used on `index.html`, `sold/`, `about/`, `guides/`, every guide article,
  `privacy/`.
- **`seller`** — `41+ Pieces Bought | ★ 4.9 Rating | Proudly Edmonton Owned & Operated | Most Offers $500–$2,500`.
  Used on `sell/` and every `sell/[slug]/`.
- **`listing`** — `We Deliver Anywhere in Edmonton and the Surrounding Area`.
  Used on every active listing page and every sold-stub listing.

The variant is selected by the `variant="..."` attribute on the page's
`<!-- CREDIBILITY_START -->` marker. The numeric values shown above are driven
by `config/site.js` (`piecesSold` / `piecesBought` / `rating` / `offerRange`) —
change them there once and rebuild; they are not edited per page.

## 5.10 Listing Data Standard (`js/available-data.js`)

Every new available listing should include the **full standard treatment** —
not only the technically required fields. The optional/standard fields are what
make a listing rank for transactional queries, render rich snippets, and
present the detail buyers and crawlers expect.

```javascript
{
  brand: "Brand Name",
  title: "Model Name — Fabric/Finish/Variant",
  slug: "brand-name-model-piece-edmonton",     // standard — see §5.1
  metaTitle: "Pre-Owned Brand Model Piece for Sale in Edmonton",   // standard — see §5.5
  metaDescription: "Pre-owned Brand Model in Edmonton. Professionally inspected and cleaned. Delivery available across Alberta. $X,XXX CAD.",  // standard — see §5.5
  availabilityStarts: "2026-05-15",            // standard — ISO date listing went live; emits offers.availabilityStarts
  dimensions: { width: "128.75", depth: "90.5", height: "28.75" },  // standard when known — emits Product width/depth/height QuantitativeValue (inches)
  description: "Opening paragraph.\n\nSecond paragraph.\n\nThird paragraph.",
  features: [                                  // optional — bulleted list under a "Features" label, below the retail pill
    "Frame construction detail",
    "Spring/cushion detail",
    "Leg/finish detail",
  ],
  condition: "One or two sentences on structural and cosmetic condition.",   // optional — "Condition" label below features
  configuration: "What's included. Delivery available for an additional fee.",  // optional — "Includes" label below condition
  faq: [                                       // standard — 4–5 questions; emits FAQPage schema + visible section
    { question: "Is this authentic?",          answer: "Yes. Inspected for construction, materials, and manufacturer consistency before listing." },
    { question: "What condition is it in?",    answer: "..." },
    { question: "Do you deliver?",             answer: "Yes. Delivery available across Edmonton and Alberta for an additional fee." },
    { question: "...piece-specific concern...",answer: "..." },
  ],
  retailEstimate: 28000,                       // optional — pure number, no currency formatting; emits the left side of the value pill
  retailEstimateApprox: false,                 // optional — set true to render the retail figure as "$X,XXX+"; default exact
  price: 7500,                                 // required — pure number
  specs: [
    "Brand Name",
    "000 × 000 × 00 in",                       // one pill per dimension grouping
    "Seat Depth: 00 in",
    "Seat Height: 00 in",
    "Good Condition",                          // brief condition summary
  ],
  images: [
    "images/XX-NNN/slug-01.jpeg",
    "images/XX-NNN/slug-02.jpeg",
  ]
},
```

Field rules:

- **`title`** — include the full variant name (fabric, finish, colourway) after
  an em dash, e.g. `"Milo 6-Piece Modular Sectional — Pearl Chatou Bouclé"`.
  Appears in the H1 and breadcrumb.
- **`slug`** (standard) — see §5.1.
- **`description`** — use `\n\n` for paragraph breaks (rendered with
  `white-space: pre-line`). Pure narrative only: what makes the piece notable,
  fabric/material detail, standout design notes. Do **not** put condition,
  configuration, includes, or delivery notes here — they have their own fields.
- **`features`** (optional) — construction/spec highlights; renders as a
  bulleted list under a "Features" label after the retail pill.
- **`condition`** (optional) — plain string; renders under a "Condition" label.
- **`configuration`** (optional) — modules/pieces included plus the delivery
  note; renders under an "Includes" label.
- **`metaTitle` / `metaDescription`** (standard) — see §5.5.
- **`availabilityStarts`** (standard) — ISO date the listing went live; emits
  `offers.availabilityStarts` as a freshness signal alongside `dateModified`.
- **`dimensions`** (standard when known) — `{ width, depth, height }` in inches;
  emitted as Product `width`/`depth`/`height` `QuantitativeValue` blocks with
  `unitCode: "INH"`. Use actual measured overall dimensions, not spec-pill text.
- **`faq`** (standard) — 4–5 `{ question, answer }` objects grounded in real
  buyer concerns (authenticity, fabric/leather type, removable covers, casters,
  delivery, warranty, condition). Emits `FAQPage` schema in `<head>` and a
  visible "Frequently Asked Questions" section using the sitewide
  `.faq-section`/`.faq-list`/`.faq-item` markup (heading exactly
  `"Frequently Asked Questions"`, per §5.6). Answer text must be plain text —
  no HTML entities; use literal `—`, `"`, etc.
- **`price`** (required) — **pure number** like `7500` — no currency symbol,
  no thousands separator, no string quoting. Rendered through
  `formatPrice()` everywhere it's displayed: card price, listing hero, sticky
  CTA, meta description, etc. The schema `offers.price` field uses the same
  numeric value directly. The CAD invariant (§5.2) is preserved at the render
  boundary — never bake `$`, `CAD`, or any formatting into the data.
- **`retailEstimate`** (optional) — pure number, original retail value. When
  present, generates the two-part value pill (`Est. Retail: $X,XXX CAD` |
  `Buy it Today: $X,XXX CAD`) above the description. Omit to suppress the
  pill entirely. Format via the rendering helper; never store as a string.
- **`retailEstimateApprox`** (optional) — set `true` when the retail figure
  is approximate; renders as `$X,XXX+`. Default false (exact figure).
- **`specs`** — each element renders as its own grey pill on both the homepage
  card and the listing page. Include brand, dimensions, seat depth/height, and
  a brief condition summary. Keep each pill short.
- **`images`** — paths relative to root (no leading `../`).
- **Coming Soon** — add `comingSoon: true` and omit `price` (or set to `0`).
  Shows a badge, hides the price, and skips listing-page generation.

**Sold data shape** (`js/sold-data.js`) — `{ brand, title, description, images }`
plus an optional `href`. No `price`, no `specs`, no `comingSoon`. Image paths use
the `../images/XX-NNN/` prefix — the same folder the photos were in while
active, just with a parent-relative `../` since `sold/index.html` is one
level deep (§5.3 stable-URL convention). Legacy entries from before that
convention still reference `../images/Sold Inventory/XX-NNN/`; leave those
paths alone — they match the indexed URLs.

- **`href`** (optional) — a root-relative URL (e.g.
  `"/listings/la-z-boy-emric-right-facing-sectional/"`) to the piece's
  surviving sold-stub listing page. When present, the sold card's title is
  wrapped in `<a class="card-title-link">`, which inherits the sitewide
  stretched-link behaviour (§7.6) so the whole card is clickable while the
  carousel controls stay live. Both render paths honour it identically —
  `buildSoldCard()` in `js/sold-data.js` (client) and `generateSoldHTML()` in
  `build.js` (static crawler fallback). Omit it for sold pieces that never had
  a dedicated listing page (most legacy entries), and the card renders as plain
  unlinked text exactly as before.

  Beyond the card link, `href` is the single trigger for the piece's whole
  discoverability surface. On the next build it: (a) adds the stub URL to
  `sitemap.xml` (priority `0.5`) with the piece's photos as `<image:image>`
  children — *moved off* the `/sold/` gallery URL so each photo has one
  canonical page (§5.15); and (b) retargets the "Recently Sold" Related-Links
  card on active same-brand listings to point at the stub instead of `/sold/`.
  The stub page itself is produced by `scripts/gen-sold-stub.js`, and is
  hand-listed in `llms.txt` under "Sold Inventory (Individual Archive Pages)"
  — see §8.3 for the full workflow.

### Listing page anatomy

Generated entirely by `build.js` (`generateListingPage`). Structure, top to
bottom:

- Breadcrumb; full-width carousel + thumbnail strip; brand; title; retail value
  pill (no label); price; "Text to Secure" CTA; "Call" CTA; spec pills.
- Collapsible `<details class="listing-collapsible">` sections in order —
  **Description** (`open` by default; includes the brand-guide cross-link
  footer where applicable, per §5.8), **Features**, **Condition**, **Includes**
  (all collapsed initially). Each has a `<summary class="listing-meta-label">`.
- `.listing-trust` — sitewide single-line authenticity statement, generated for
  every listing (never duplicated in data). Copy: *"All designer pieces are
  inspected for construction, materials, and manufacturer consistency before
  listing."*
- `.listing-sell-line` — sell-side prompt directly under the trust statement.
- Back link to homepage.
- Optional `.listing-faq` "Frequently Asked Questions" section — only when
  `faq` data is provided.
- Optional `.listing-related` "Related Links" grid — see rule below.
- Newsletter signup; footer; sticky mobile CTA bar.

Listing pages do **not** carry the "Selling a piece like this?" `.guide-cta`
block — sell-side intent is already covered by `.listing-sell-line`, and a
second sell CTA between FAQ and Related breaks reading flow.

**Related Links rule.** `build.js` renders `.listing-related` only when **real
related inventory** exists — at least one other live piece (`availableItems`
minus self + coming-soon) **or** at least one sold piece in the same brand
family (`Natuzzi` matches `Natuzzi Editions`). The brand guide is added as a
supplemental card whenever the section shows but never triggers it alone (the
brand-guide link is already in the Description collapsible). If neither
condition is met, the section is skipped. It renders directly below the FAQ
section and above the newsletter signup.

**Layout & carousel.** Images sit full-width above the text (stacked, not
side-by-side). The carousel uses a uniform 4:3 aspect ratio on desktop and
mobile so every listing presents at the same frame size. Images use
`object-fit: contain` — odd-aspect photos letterbox against the carousel
background rather than crop. The sticky mobile CTA bar is fixed at the bottom of
the viewport ("Text to Secure → $price" primary + "Call" secondary) and is
hidden on desktop via CSS. Behavior changes to collapsible defaults, the sticky
bar, or related-links logic are made in `build.js` (`generateListingPage`), not
in generated HTML.

## 5.11 Sell-Form & Worker Contract

The sell form posts to the Cloudflare Worker (§4.7), which validates, applies
spam defenses, and forwards to `info@edmontonrefreshed.com` via Resend.

**Form HTML must be identical** across `sell/index.html` and every
`sell/[slug]/index.html` — same field IDs (`sf-brand`, `sf-age`,
`sf-photos`, etc.) and same structure. Brand landing pages pre-fill `sf-brand`
via the `value="Brand Name"` attribute; piece-type and situational pages leave
it blank.

**Spam defenses — silent-drop pattern.** The Worker returns `{ok: true}` on
both real sends and suspected-bot drops so bots cannot distinguish them. Never
change this contract.

1. **Checkbox honeypot** — every form has
   `<input type="checkbox" name="_honey" class="sell-form-honey" tabindex="-1" autocomplete="off" aria-hidden="true">`,
   positioned off-screen via CSS. **It must stay a checkbox, not a text input**
   — see §9.1.
2. **Page-load timing** — `js/sell-form.js` captures `Date.now()` at script
   load and appends `_elapsed_ms` on submit. The Worker drops submissions with
   `_elapsed_ms < 2000` (under 2 seconds) as suspected bot.

**Source-page tracking.** `js/sell-form.js` appends `Source page` (pathname +
querystring) to every submission. The Worker prepends it to the email subject
(`New Sell Inquiry — Brand — Name (from /sell/natuzzi/)`) and as the
first line of the body — this is how each lead is attributed to a landing page.

**Email-size constraint & in-browser compression.** The delivery path is
Worker → Resend → `info@edmontonrefreshed.com` → **Cloudflare Email
Routing** → Collin's actual inbox. Cloudflare Email Routing forwards messages
**up to 25 MB on-the-wire**. Because attachments are base64-encoded (raw size
× 4/3), raw attachments must stay under ~18 MB or Cloudflare bounces the
forward — and the user sees a success message anyway because Resend
already accepted the message. To eliminate that false-success path:

1. `js/sell-form.js` compresses every photo in the browser before upload —
   canvas downscale to 1600px on the long edge, JPEG quality 0.82
   (`COMPRESS_MAX_DIM` / `COMPRESS_QUALITY`). A 4 MB phone photo
   typically lands at 250–400 KB; five-photo submissions arrive at well
   under 2 MB.
2. If `compressImage` can't decode a specific file (e.g., HEIC on a
   non-Safari browser without OS codec support), it returns the original
   unchanged — so a single un-decodable file never aborts the whole
   submission.
3. After compression, both client and Worker enforce a hard 18 MB raw cap
   (`MAX_TOTAL_BYTES`). Anything over that is **blocked with a visible
   error** ("Photos still total X MB after optimization…"); the form does
   **not** submit, the user does **not** see success. The client cap and
   Worker cap are intentionally identical so a tampered client can't
   bypass it.

There is no path in the system that produces a success message without
Resend accepting a message Cloudflare can also forward.

**Adding a form field** — update the HTML on every sell page *and* the Worker's
`REQUIRED_FIELDS` / email-body builder. Adding a honeypot or timing rule must
not change the silent-drop contract. Changing the compression targets or
the raw-byte cap requires keeping client `MAX_TOTAL_BYTES` and Worker
`MAX_TOTAL_BYTES` in lock-step.

## 5.12 Guide Article Standard

Guide articles live at `guides/[slug]/index.html` and are manually created (not
generated by `build.js`). The canonical reference example is
`guides/how-to-buy-used-sofa-edmonton/index.html`.

`<head>` must include, in order: `<meta charset>` + viewport; `preconnect` /
`dns-prefetch` for `googletagmanager.com`; the GA4 script block (`G-8MN82PPZRZ`);
`<title>` (`Article Title | Edmonton Refreshed`); `<link rel="icon">` →
`../../favicon.svg`; `<link rel="canonical">` (full
`https://edmontonrefreshed.com/guides/[slug]/` URL); `<meta name="description">`
(under 160 chars); `<meta name="robots" content="index, follow">`;
`geo.region` = `CA-AB` and `geo.placename` = `Edmonton`; Open Graph tags
(`og:locale`, `og:type` = `article`, `og:url`, `og:title`, `og:description`,
`og:site_name`, `og:image`); Twitter card tags (`summary_large_image`);
`Article` schema (`headline`, `description`, `author` = Collin Bottrell,
`publisher` = Edmonton Refreshed, `datePublished`, `dateModified`, `url`);
`BreadcrumbList` schema (Home → Guides → Article); `FAQPage` schema if the
article has an FAQ section; the font preload/onload pattern with `<noscript>`
fallback; `<link rel="stylesheet" href="../../css/styles.min.css?v=N">` (current
version, §5.7); `<meta name="theme-color" content="#2c2c2c">`.

`<body>` structure: site nav (Available, Sold, Sell Your Furniture, Guides,
About + phone + mobile toggle); credibility strip (`buyer` variant, §5.9);
`<main>` → `<div class="page">` → breadcrumb nav; `<div class="guide-article">`
containing `<header class="guide-header">` (`.guide-category`, `<h1>`,
`.guide-meta`) and `<article class="guide-body">`; optional FAQ section
(`.faq-section`/`.faq-list`/`.faq-item`); `.guide-cta` box (links to inventory
or `/sell/` per audience); newsletter signup (Kit form ID `9233085`); footer;
`<script src="../../js/shared.min.js">`.

**Guide body components:** `.guide-callout` — highlighted aside with a left
accent border, holds a single `<p>`, used for key rules/caveats/summaries.
`.guide-table-wrap` wrapping `<table class="guide-table">` — comparison tables;
the wrap provides mobile horizontal scroll, first column renders muted, even
rows get a subtle background (live example:
`guides/edmonton-furniture-consignment-resale-guide/index.html`).

## 5.13 Sell-Side Landing Page Standard

A cluster of hand-maintained landing pages sits under `/sell/`, supporting
brand-, piece-type-, and situation-level commercial-intent queries. They are
**not** auto-generated by `build.js`.

**Current cluster inventory:**

- *Brand pages (6):* `/sell/natuzzi/`, `/sell/rove-concepts/`,
  `/sell/eq3/`, `/sell/crate-and-barrel/`,
  `/sell/restoration-hardware/`, `/sell/west-elm/`.
- *Redirected brand pages (no longer active):* `/sell/american-leather/` and
  `/sell/bb-italia/`, plus their legacy `-edmonton` counterparts
  `/sell/american-leather-edmonton/` and `/sell/bb-italia-edmonton/` — all
  redirect to `/sell/` via meta refresh + canonical. The legacy `-edmonton`
  pair are full-page stubs that retain the seller-page OG copy convention
  (§5.5); the de-edmonton pair are bare redirect stubs.
- *Redirect stubs for the migrated cluster:* every page above is also reachable
  at its old `/sell/[slug]-edmonton/` URL, which is now a bare meta-refresh +
  canonical redirect stub pointing at the de-edmonton URL (see §10.15). Never
  internally link to these — link the live `/sell/[slug]/` URL directly.
- *Piece-type pages (6):* `/sell/sectional/`,
  `/sell/leather-sectional/`, `/sell/sofa/`,
  `/sell/leather-sofa/`, `/sell/couch/`,
  `/sell/leather-couch/`.
- *Situational pages (6):* `/sell/furniture-consignment/`,
  `/sell/selling-furniture-before-moving/`,
  `/sell/downsizing-furniture/`, `/sell/sell-furniture-fast/`,
  `/sell/estate-furniture/`, `/sell/sell-designer-furniture/`.
- *Eligibility page (1):* `/sell/what-we-buy/` — a pre-qualification
  page listing what we buy and what we don't (reusing the hub's `.sell-fit-grid`
  buy/skip layout), with a "what affects the offer" section and an honest
  "pieces we've passed on — and why" section. Its purpose is to reduce
  unqualified leads by letting sellers self-select before the form. **Not
  taxonomy-driven** — it is not a brand, piece type, or situation, so it does
  *not* auto-thread into the nav dropdown or footer columns; it is hand-added to
  the sitemap via the core-URL list in `build.js` `generateSitemap()` (see
  §5.15) and linked from the sell hub's buy/skip grid via a `.sell-fit-note`
  link. Carries the full mandatory schema + AEO stack like every other landing
  page. Per the pricing-restraint rule it publishes no per-piece numbers.

**Tone.** Knowledgeable, practical, honest about tradeoffs (consignment can
outperform on the right piece; Marketplace can produce higher prices for some
sellers; direct purchase prioritizes simplicity and speed over maximum value).
Avoid AI filler, exaggerated luxury language, fake urgency, and "we buy
everything" positioning.

**Page structure — brand & piece-type pages:**

1. Standard nav (with Sell dropdown), credibility strip (`seller`), breadcrumb.
2. `.sell-landing-hero` — H1, intro paragraph, hero CTA scrolling to
   `#sell-details`.
3. `.sell-landing-body` — `<h2>` sections: "What we look for", "What affects
   the offer" (bulleted), "Pieces that typically qualify" (bulleted). Brand
   pages reference specific models; piece-type pages reference specific
   configurations.
4. `.sell-landing-sold` — grid of up to 6 sold cards from real `js/sold-data.js`
   entries. **Never fabricate sold examples.** If no sold inventory exists for
   the category, replace with a `.sell-landing-sourcing` note.
5. `.sell-landing-back-cta` — mid-page link back to `/sell/`.
6. "Send us your details" heading with `id="sell-details"`.
7. `.sell-form-prelude` — **mandatory verbatim text:** *"We primarily purchase
   higher-quality sofas and sectionals from design-oriented and premium
   retailers. If you're unsure whether your piece is a fit, send photos anyway
   — we're happy to take a look."*
8. Embedded sell form (§5.11).
9. `.sell-landing-cluster` — cross-link cards (typically 5).
10. FAQ section (3–4 page-specific Q&A) + matching `FAQPage` schema.
11. Newsletter embed, footer.
12. Scripts: `shared.min.js` + `sell-form.min.js`.

**Page structure — situational pages (form-first variant).** Situational pages
target high-intent seller queries built around a circumstance; the form sits
**higher** because intent is stronger, and long-form body content sits **below**
the form:

1. Standard nav, credibility strip (`seller`), breadcrumb.
2. `.sell-landing-hero` — H1, situational intro, hero CTA → `#sell-details`.
3. `.sell-qualification` — single short trust/qualification block framing the
   buy zone and the timeline promise.
4. "Send us your details" (`id="sell-details"`), lead paragraph,
   `.sell-form-prelude`, embedded sell form (`sf-brand` left blank).
5. `.sell-landing-body` — `<h2>` sections framing the seller's operational
   friction, an honest comparison with alternatives, where direct purchase
   fits, and what the page typically purchases.
6. `.sell-landing-sold` — up to 6 real sold cards, weighted to the situation.
   **Never fabricate.**
7. FAQ section (4–5 page-specific Q&A on pickup logistics, timeline, condition,
   incomplete sets, older pieces, response time) + `FAQPage` schema.
8. `.sell-landing-cluster` — 4–6 cross-link cards.
9. `.sell-landing-back-cta` — closing link back to `/sell/`.
10. Newsletter embed, footer.
11. Scripts: `shared.min.js` + `sell-form.min.js`.

**Mandatory schemas on every landing page:** `BreadcrumbList` (Home → Sell Your
Furniture → this page); `Service` (`name`, `description`, `url`, `dateModified`
= today ISO, `provider`, `areaServed`); `FAQPage` (one `Question` per visible
FAQ item; plain-text answers — strip HTML entities); `FurnitureStore` (with the
same `aggregateRating` block the homepage carries — keep in sync via
`config/site.js`); `Person` (Collin Bottrell, with `jobTitle`, `knowsAbout`,
and `worksFor` pointing at the Organization); `HowTo` (the four-step selling
process, identical across the cluster: send photos → offer within 24h →
schedule pickup → paid by preferred method before we leave).

**Per-page AEO components — mandatory across the cluster.** These propagate
to every new sell page:

- **Author/updated byline directly under the H1.**
  `<p class="sell-updated">Updated [Month YYYY] &middot; <a href="/about/">Hosted by Collin Bottrell</a>, Edmonton pre-owned furniture buyer.</p>`
  sits between the H1 and the hero subhead — *not* below the hero CTA. AI
  engines associate author/date attribution with the page topic by byline
  proximity to the H1. Update the month-year on each meaningful edit.
- **Visible "How selling works" section + matching `HowTo` JSON-LD.** A
  four-step process between the hero and the existing body content. Steps
  are constant across the cluster; the section heading wording can be
  page-specific ("How selling your Natuzzi works", "How selling a sectional
  works", etc.).
- **"Send us your details" heading uses the global pattern.** The h2 above
  the form is `class="section-label sell-send-heading"` — the sitewide
  `.section-label` style (uppercase tracked sans-serif) plus the
  `.sell-send-heading` modifier (centered + extra top margin). The previous
  serif `.sell-section-heading` class is *deprecated* for this slot. See
  §10.11.

**Pricing restraint — no per-piece valuations.** Sell pages **never** publish
per-piece resale-value tables, per-brand value multipliers, or model-specific
dollar ranges. Two reasons: (a) the numbers cannot be verified against
transaction data accurately enough to defend under scrutiny, and (b)
publishing them creates a permanent negotiation floor — every seller arrives
pre-anchored to the published figure, making it harder to acquire pieces at
the margins the business needs. The only public valuation signal on sell
pages is the credibility-strip range *"Most Offers $500–$2,500"* — wide
enough not to function as a per-piece anchor. This rule applies to FAQ
answers too: questions like *"How much is my [brand] worth?"* deflect to
*"send photos for a specific offer"* rather than quoting numbers. See §10.12.

**Marketplace comparison — honest framing.** Every sell page's "Selling on
Marketplace vs us" comparison must follow these rules:

- **Concede Marketplace can pay more** for the right piece, right seller, and
  enough time. Pretending otherwise undermines every other claim on the page.
- **No false-confidence claims** like "Risk: None" — the real risk is getting
  less than Marketplace might yield, and the page is stronger for naming it.
- **No FUD that doesn't apply.** "Chargeback risk" on a cash/e-transfer
  transaction is an e-commerce concept; importing scary-sounding terms
  reads as marketing copy and erodes trust.
- **No fabricated stats.** "55–70% of asking after 2–3 price drops" reads as
  data; it's a guess. Remove specific percentages unless they're verifiable.
- **Frame the trade as dollars-for-friction.** Marketplace's ceiling vs.
  certainty + logistics + paid-on-the-spot. That comparison is stronger than
  the false-dichotomy version because credibility carries.

See §10.13 for the deprecated patterns.

**Cross-linking rules:**

- Every landing page links back to `/sell/` (both `.sell-landing-back-cta` and
  the breadcrumb satisfy this).
- `/sell/` links to every landing page via three `.sell-landing-cluster`
  sections — "Sell by brand", "Sell by piece type", "Sell by situation".
- Brand pages cross-link to relevant piece-type pages and one or two related
  brand pages.
- Piece-type pages cross-link to relevant brand pages.
- Brand pages with a guide also link to it (Natuzzi →
  `/guides/natuzzi-sofa-review-edmonton/`).
- Situational pages cross-link to other situational pages, relevant brand or
  piece-type pages, and at least one relevant guide: consignment →
  `/guides/edmonton-furniture-consignment-resale-guide/`; moving →
  `/guides/selling-furniture-before-moving-edmonton/` and
  `/guides/moving-edmonton-furniture-keep-sell-replace/`; designer →
  `/guides/who-buys-used-couches-edmonton/` and
  `/guides/best-sofa-brands-resale-value-edmonton/`; fast →
  `/guides/who-buys-used-couches-edmonton/`; estate →
  `/guides/selling-inherited-estate-furniture-edmonton/`; downsizing →
  `/guides/moving-edmonton-furniture-keep-sell-replace/`.

**Recently sold cards** use absolute URLs of the form
`/images/Sold%20Inventory/[XX-NNN]/[file].jpeg` (URL-encoded space) and use
`.card.sold` styling via the `.sell-landing-sold-grid` class. The author writes
every card with `href="/sold/"`; `build.js` then automatically deep-links any
card whose photo belongs to a piece that has a sold-stub listing page (matched
by image folder against the `href` entries in `js/sold-data.js`) straight to
that stub, opening in a new tab (`target="_blank" rel="noopener"`) so the
visitor isn't pulled off the sell page. Cards for pieces without a stub stay on
`/sold/`, and a card reverts automatically if its stub is ever removed. See
§4.3 — never hand-edit these links.

These pages are hand-maintained — they were generated once from a script that
is no longer run. See §8.10 to edit one or add a new one.

## 5.14 FAQ Single-Source

Every visible FAQ block AND its matching `FAQPage` JSON-LD schema on the
homepage, sell hub, and about page derive from a single canonical source —
`config/faqs.js`. The two cannot drift apart because they are generated
from the same array on every build.

`config/faqs.js` exports `home`, `sell`, and `about` arrays. Each entry has:

| Field | Required | Purpose |
|---|---|---|
| `question` | Yes | Visible question text |
| `answer` | Yes | Visible answer text. Use Unicode characters (`—`, `'`, `"`) directly; build-time escaping handles HTML entities. Inline links use markdown `[text](url)` — rendered as `<a>` in visible markup, flattened to plain text in schema. |
| `schemaQuestion` | No | Override for the JSON-LD `name` field. Use when the schema benefits from longer keyword-rich phrasing than the conversational visible text. |
| `schemaAnswer` | No | Override for the JSON-LD `text` field. Defaults to the visible `answer` with markdown links flattened. |

`build.js` rewrites content between marker pairs on every build:

```html
<!-- FAQ_SCHEMA_START id="home" -->
…(rewritten by build.js — emits FAQPage JSON-LD)…
<!-- FAQ_SCHEMA_END -->

<!-- FAQ_VISIBLE_START id="home" -->
…(rewritten by build.js — emits .faq-item markup)…
<!-- FAQ_VISIBLE_END -->
```

Visible markup is emitted as `<div class="faq-item"><h3 class="faq-question">…</h3><p class="faq-answer">…</p></div>`. The surrounding `.faq-section` /
`.faq-list` markup stays in the HTML source as a fixed scaffold.

**Listing-page FAQs** (`item.faq` in `js/available-data.js`) follow the
same principle — one source drives both schema and visible markup — but
keep their own per-listing structure since each listing's FAQ is unique.
See §5.10.

**Sell-landing FAQs** on every `sell/[slug]/` page remain hand-
maintained as page-specific Q&A pairs (§5.13). They are not centralized
because each page's FAQ is page-specific and updating one page does not
imply updating others.

To edit a homepage / sell hub / about FAQ: edit `config/faqs.js` and run
`node build.js`. Never edit between FAQ markers by hand — the next build
overwrites the edit.

## 5.15 Sitemap Freshness — Content-Hash `<lastmod>`

`build.js` does NOT stamp every `<lastmod>` with today's date. It compares
each page's canonical content hash against the previous build's hash
(stored in `.build-state.json`) and only advances `<lastmod>` when the
content has actually changed.

Canonicalization strips build-volatile fragments before hashing — asset
version hashes, `<lastmod>` placeholders, `dateModified` values, and
`priceValidUntil` windows — so a pure rebuild with no source changes does
not advance any URL's lastmod. Real changes (new inventory, edited copy,
modified schema) flip the hash and advance lastmod.

**`.build-state.json`** is the committed sidecar that tracks one record
per URL: `{ "hash": "<8 hex>", "lastmod": "<ISO date>" }`. Commit it with
source so lastmod history persists across machines and CI runs.

The sitemap URL list is data-driven:
- Homepage, `/sold/`, `/sell/`, `/sell/what-we-buy/`, `/about/`,
  `/privacy/`, `/guides/` are hardcoded core URLs.
- Sell-landing pages come from `config/taxonomy.js` (`brands` +
  `furnitureTypes` + `situations`).
- Guides are discovered by listing `guides/*/index.html`.
- Listings come from `availableItems` (skipping `comingSoon`).
- Sold-stub listing pages come from `soldItems` entries carrying an `href`
  (priority `0.5`, `changefreq monthly`).

Adding a guide directory or a taxonomy entry automatically threads it into
the sitemap on the next build — no manual edit required.

**Image sitemap children.** Listing URLs and the `/sold/` gallery URL
carry one `<image:image><image:loc>…</image:loc></image:image>` child per
photo, so Google Images / Lens / shopping surfaces can index every
photo of every piece — both currently-available and previously-sold. The
sitemap root declares the image namespace
(`xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"`); image
URLs are absolute (prefixed with `BASE_URL`) and URL-encoded (the literal
space in `images/Sold Inventory/` becomes `%20`). Active-listing photos
come from each item's `images` array in `js/available-data.js` and attach
to that listing's URL; sold photos come from `js/sold-data.js` and attach to
whichever page is canonical for them — a sold piece **with** an `href` claims
its photos on its own sold-stub URL (where the carousel displays them), while a
piece **without** an `href` attaches them to `/sold/` (the gallery where they
render as cards). Each photo therefore claims exactly one page; adding an
`href` moves that piece's photos from `/sold/` onto the stub on the next build.
Adding photos to either data file automatically threads them into the sitemap
on the next build — no separate step. Non-inventory URLs (homepage, guides, sell-landing pages)
do not carry image children.

## 5.16 Sold Gallery Schema — `ImageObject` per Photo

`/sold/index.html` carries an `ItemList` of `ImageObject` items — one
per photo across every entry in `js/sold-data.js` — generated by
`build.js` between `<!-- SOLD_GALLERY_SCHEMA_START -->` and
`<!-- SOLD_GALLERY_SCHEMA_END -->` markers. The image sitemap (§5.15)
covers *discovery* of every sold photo; this layer covers *attribution*.

Each `ImageObject` carries:

- `name` and `description` — piece brand + title (and photo M of N when
  the piece has multiple photos).
- `contentUrl` — the full-size JPEG URL.
- `thumbnailUrl` — the 400w variant URL (per §5.3 every photo has one).
- `about` → `{ "@type": "Brand", "name": ... }` — links the image to the
  brand entity.
- `creator` and `copyrightHolder` — both `{ "@type": "Organization", "name": "Edmonton Refreshed" }`.
  Claims authorship for Google Images attribution.
- `creditText` — `"Photo by Edmonton Refreshed"`.
- `license` + `acquireLicensePage` — both the canonical site URL,
  making each photo eligible for the Licensable badge in Google Images.

The schema is regenerated on every build from `sold-data.js`; never
hand-edit content between the markers. New sold entries automatically
gain `ImageObject` coverage on the next build. Removing a sold entry
removes its `ImageObject` block(s) automatically.

Raw schema size for the current ~30 pieces (~205 photos) is ~220KB
inline JSON-LD, which compresses to ~5KB on the wire — the page-weight
cost is small. JSON-LD doesn't block render, and `/sold/` isn't a
Core-Web-Vitals-critical surface like the homepage or listings.

The convention pairs with the stable-URL convention in §5.3: because
new sales no longer move the image folder, each `contentUrl` in the
schema is the same URL the photo had while the piece was active. The
attribution layer reinforces what's already a stable indexed URL
rather than describing a freshly-changed one.

**Sell-landing pages get the same `ImageObject` treatment.** Each
`sell/[slug]/` page that displays a `.sell-landing-sold-grid`
carries its own `ItemList` of `ImageObject` items — one per displayed
sold card, with the same attribution stack (`creator`,
`copyrightHolder`, `creditText`, `license`, `acquireLicensePage`) so
those photos are eligible for the same Licensable badge.

The schema is generated by `build.js` between
`<!-- LANDING_SOLD_SCHEMA_START -->` and
`<!-- LANDING_SOLD_SCHEMA_END -->` markers in `<head>`. The generator
parses the page's `.sell-landing-sold-grid` directly — pulling brand
from `.card-brand`, title from `.card-title`, and the full-size image
URL from each card's `<img src="…">` — so the schema can never drift
from what the cards actually display. Editing a card on the page
auto-updates the schema on the next build.

Per-page `name` and `description` strings live in the
`LANDING_SOLD_SCHEMA_META` map in `build.js`, keyed by repo-relative
path. Adding a new sell-landing page is a two-step change: drop the
marker pair into the new page's `<head>`, then add an entry to that
map. Pages without an entry — or without the marker pair — are left
untouched; partial adoption stays safe.

Per-item `description` prose follows the convention
*"Pre-owned `<brand>` `<descriptor>`, purchased and resold by Edmonton
Refreshed."* — where `<descriptor>` is the card title with everything
after the leading word lowercased and standalone `&`/`+` normalized to
`and` (so "Vigore Top-Grain Leather Sectional" reads "Vigore top-grain
leather sectional", and "Rochelle Sofa & Chair Set" reads "Rochelle
sofa and chair set"). Schema descriptions are machine-read; the visible
card titles preserve Title Case for human readers.

## 5.17 Owner / Author Entity (`Person` — canonical `@id`)

`[Canonical]` — The site has exactly **one** owner/author `Person` node. It is
defined **once** on the About page and referenced everywhere else by `@id`.

- **Canonical `@id`:** `https://edmontonrefreshed.com/about/#collin`.
- **Defined once.** The full `Person` node (name, `jobTitle`, `description`,
  `knowsAbout`, `homeLocation`, `worksFor`) lives only in `about/index.html`,
  immediately after the `Organization` schema. Do **not** duplicate the full
  node on any other page.
- **Referenced by `@id` everywhere else.**
  - Every `sell/[slug]/` landing page carries a `Person` block that is
    nothing but a pointer — `{ "@type": "Person", "@id": ".../about/#collin",
    "name": "Collin Bottrell", "url": ".../about/" }` — not a copy. (These were
    previously 18 full copies that had drifted apart on `jobTitle` and
    founding-year wording; they were slimmed to references so there is a single
    source of truth.)
  - Every guide `Article`'s `author` `Person` carries the same `@id`, so all
    article authorship consolidates onto the one node.
- **Why.** Google merges schema nodes that share an `@id`, so authorship
  (guides) and operator identity (sell pages) accrue to a single
  Knowledge-Graph person instead of splitting E-E-A-T signal across dozens of
  slightly different `Person` copies.

**Entity graph — who links to whom.** `Organization`
(`@id` = `https://edmontonrefreshed.com/#organization`) is the **durable,
transferable** business entity; the `Person` is its `founder`. The About
`Organization` points to the `Person` via `founder`; the `Person` points back
via `worksFor` → the Organization `@id`. This separation matters for the
saleable-business end goal (§2.2): the Organization survives a change of
ownership, while the person is attached as founder rather than *being* the
business.

**Dangling references are inert — and the build guards against them.** An
`@id` reference with no matching definition resolves to nothing; the markup is
silently useless. Because the canonical node lives on a single page, deleting
or renaming it would quietly break authorship/operator identity across every
referencing sell page and guide with no visible error. `build.js`'s
entity-integrity audit (§4.3) therefore **hard-fails the build** if any page
references the owner `@id` while no page defines it. This is the guardrail that
keeps the About page entity from being forgotten.

**Maintenance.**
- Edit the bio/identity in **one place** — `about/index.html` — and bump its
  `dateModified` to today (§5.4).
- Never re-inflate a sell-page or guide `Person` block into a full copy; keep
  it an `@id` reference.
- If the canonical `@id` ever changes, update (a) the About definition,
  (b) every referrer (`grep -rl 'about/#collin'`), and (c) the `COLLIN_ID`
  constant in `build.js`.

---

# 6. SEO & Discovery Systems

This section preserves the *reasoning* behind the site's shape. Implementation
rules live in §5; this explains why they exist.

## 6.1 Local SEO Strategy

Edmonton Refreshed competes locally. Every structural decision reinforces the
Edmonton → Alberta → Canada signal so search engines and AI overviews never
have to guess the locale: the `-edmonton` suffix on listing and guide slugs
(§5.1), the locale and geo meta tags and `en-CA` lang (§5.2),
`addressCountry: "CA"` in business schemas, and city-anchored copy. (Sell-
landing slugs deliberately omit the suffix — see §10.15 — relying on copy,
schema, and the domain for the locale signal instead.) The `citySlug` config
field exists so this entire signal layer can be re-pointed for a future city
without find/replace.

## 6.2 Long-Tail Indexing & Topical Authority

The sell-side landing cluster (§5.13) and the guides section exist to capture
long-tail, commercial-intent, and informational queries that the homepage alone
cannot. Brand pages, piece-type pages, and situational pages each match a
distinct query shape; guides build topical authority around buying, selling,
pricing, and brand comparison. Internal linking (§5.8) binds these into
clusters so authority flows between related pages rather than pooling on the
homepage.

## 6.3 Sold-Stub Philosophy

When a piece sells, its listing URL may already be indexed and may still draw
brand/model search traffic. Deleting the URL discards that equity. Instead the
page becomes a **sold stub** (§8.3): it stays indexed
(`robots: index, follow`); the visible "This piece has sold." overlay conveys
the sold state to crawlers.

**No `Product` schema on a sold stub.** The stub carries only `BreadcrumbList`
and the per-photo `ImageObject` gallery — *not* a `Product`. This is a forced
choice that resolved through three iterations:

1. A `Product` with a priced `Offer` both violates Google's "markup reflects
   visible content" rule (the page shows no price) and leaks a seller-side
   negotiation anchor to AI/answer crawlers and scrapers — undercutting the
   acquisition margins the business depends on (the same reason sell pages
   publish no per-piece figures — §5.13, §10.12). So the price came out.
2. But Google treats `price` as **required inside any `Offer`**, so a
   price-less `Offer` is a *critical* error. So the `Offer` came out.
3. But a `Product` is itself **invalid (critical error)** unless it carries one
   of `offers` / `review` / `aggregateRating` — and none can be supplied
   honestly: `offers` re-forces the price; a business-level `aggregateRating`
   on a product is a *manual-action* risk (misleading structured data);
   per-piece `review` would be fabricated. So the whole `Product` came out.

The end state is correct, not a compromise: a sold one-of-one piece is
genuinely ineligible for product rich results, so the `Product` carried **zero
discovery value**. All real signal survives — the `ImageObject` gallery (§5.16)
feeds Google Images / Lens and carries the brand via each image's `about` →
`Brand`, the `BreadcrumbList` places the page, and the visible copy carries
name/brand/condition for entity understanding. The page validates clean with
no critical issues.

A stub is not just kept
alive but actively surfaced: any sold piece carrying an `href` is emitted in
`sitemap.xml` (priority `0.5`, with its photos as image children) and listed in
`llms.txt`, so search and AI crawlers discover it directly rather than only via
internal links — see §5.10, §5.15. The same equity-preservation logic drives the redirect-stub
pattern for changed slugs (§8.7) and the stable-image-URL convention (§5.3):
indexed URLs — page or photo — are preserved across every transition rather
than re-indexed under new paths.

## 6.4 Structured-Data Reasoning

Structured data is one of the strongest discoverability levers available, so
every page carries it (§5.4). The schema table is treated as a contract: each
page type has a known schema set, and `dateModified` is kept genuinely current
because search engines weight freshness and a stale timestamp actively
misrepresents the site. `Product` schemas carry dimensions, SKU, and offer
detail so the site is eligible for Google's product knowledge panel and
shopping surfaces.

## 6.5 AI Crawlability Philosophy

The site is built to be read by AI *search/answer* crawlers as well as classic
search bots:

- **Static fallbacks.** `#available-grid` and `#sold-grid` hold pre-rendered
  HTML so crawlers that do not execute JS still see full inventory; JavaScript
  upgrades these to interactive carousels on load.
- **AI/LLM entity summary.** The homepage carries a
  `<div class="sr-only" aria-hidden="false">` block immediately below the skip
  link — a plain-text summary of the business, brands, location, and contact,
  visible to AI crawlers and accessibility tools but hidden visually. Update it
  whenever the brand list or contact info changes.
- **`llms.txt`.** A plain-text business summary at the repo root for LLM
  crawlers; its "Rating" line is kept in sync with the review count (§8.4).
- **Crawler policy (`robots.txt`).** Search and AI *search/answer* crawlers are
  welcomed (they drive citations and referral traffic); AI *training* crawlers
  (GPTBot, Google-Extended, CCBot, ClaudeBot, Applebot-Extended, Amazonbot,
  meta-externalagent, anthropic-ai) are blocked, because they send no traffic
  back and presence in a training corpus has no measurable value for a
  single-city business. Blocking them does **not** affect AI-answer visibility —
  that runs through separate search/answer user agents (OAI-SearchBot,
  PerplexityBot, Claude-SearchBot, ChatGPT-User, Perplexity-User, Claude-User),
  which stay fully allowed. **The policy lives in two places that must agree:**
  the repo `robots.txt` (origin) and Cloudflare's managed AI-bot rule at the
  edge (`Content-Signal: search=yes, ai-train=no`). Cloudflare prepends its
  block to the served file regardless of the origin, so if you ever want to
  reverse the training-crawler stance you must flip *both* the Cloudflare
  dashboard setting and the origin file — editing `robots.txt` alone will not
  change what crawlers actually receive.

## 6.6 Taxonomy & Guide Strategy

`config/taxonomy.js` is both an information architecture and an SEO asset:
adding one entry creates a nav path, a footer link, and a sitemap entry,
strengthening internal linking automatically. The guides section is the
topical-authority engine — see §8.13 for the article-ideation framework that
keeps new guides search-aligned and genuinely useful.

---

# 7. UI & Layout Architecture

This section explains *how* layout decisions are made, not merely which CSS
classes exist.

## 7.1 The `.page` Layout Primitive

`[Core Invariant]` — `.page` is the page-level container. Every **direct child**
of `.page` is automatically given
`max-width: var(--max-width); margin-inline: auto; padding-inline: var(--page-x);`
via the `:where(.page) > *` rule in `css/styles.css`. This is the **default
containment system**.

Sections inside `.page` do **not** redeclare `max-width`, `margin: 0 auto`, or
`padding: 0 var(--page-x)` — they own only their internal layout (vertical
rhythm, gap, and a narrower `max-width` when the section is a content column
rather than a page-width block). The rule's specificity is held at `0,0,0,1`
via `:where()` so any class on the section wins without specificity gymnastics.

## 7.2 Layout Ownership Boundaries

Architectural principles that follow from the primitive:

- Pages own horizontal page inset; components inside a page assume they are
  already in a padded context.
- Sections control vertical rhythm via `padding-top`/`padding-bottom`/
  `margin-top`/`margin-bottom`. Avoid `padding: T H B` shorthand for sections
  inside `.page` — it overrides the default `padding-inline`.
- Avoid nested compensation patterns (parent pads, child negates). If a section
  needs a narrower column, override `max-width` only; the default
  `padding-inline` still applies cleanly.
- When adding a new section as a direct child of `.page`, do **not** add
  `max-width`, `margin-inline`, or `padding-inline` — the primitive supplies
  them.

## 7.3 Full-Bleed & Outside-`.page` Exceptions

Some sections intentionally live outside `.page` and therefore self-pad with
their own `max-width / margin / padding`:

- `.newsletter-embed` — sibling of `<main>` on sell hub, sell landing pages,
  about, guides index, and guide articles; inside `.page` on sold, listings,
  and homepage. Self-padded to work in either position.
- `.sell-landing-cluster` — direct child of `<main>` on the sell hub (outside
  `.page`), direct child of `.page` on landing pages. Self-pads.
- `.about-related` — sibling of `.page` inside `<main>` on the about page.
  Self-pads.
- `.faq-section` — outside `.page` on the homepage (sibling), inside `.page` on
  listings / landing pages. Self-pads.
- `.service-area-note` — sibling of `.page` on the homepage. Self-pads.
- `.footer-inner` (inside `<footer>`), `.nav-inner` (inside `<nav>`),
  `.credibility-strip` (between `<nav>` and `<main>`) — outside `<main>`
  entirely. Each self-pads.
- `.reviews-inner` — direct child of `#reviews-section` (a JS mount-point
  wrapper); the wrapper is neutralized in CSS so `.reviews-inner` is the active
  layout box.
- `.l-bleed` — declared opt-out class, currently **unused**; reserves a
  documented pattern for future full-bleed surfaces inside `.page`.

**Reviews mobile full-bleed exception.** `.reviews-inner` drops horizontal
padding on mobile so `.reviews-grid` (a scroll-snap carousel) can be
edge-to-edge; `.reviews-aggregate` and `.reviews-grid` each re-add
`padding: 0 var(--page-x)` on mobile. This is the one intentional full-bleed
surface on the site.

## 7.4 Spacing & Rhythm Philosophy

Every page-edge horizontal padding and major vertical gap reads from CSS custom
properties on `:root` in `css/styles.css`. Never hardcode pixel values for
these — referencing the token lets future viewport changes propagate.

- **`--page-x`** — horizontal page padding. Used by the layout primitive.
  Desktop and mobile both `24px`; only sub-360px viewports drop to `20px` to
  preserve content width on the very narrowest devices. Modern phones
  (375–430px) stay at the full `24px`. Never hardcode `16px` for page-edge
  padding — see §10.3.
- **`--section-y`** — bottom padding on major sections. `72px` desktop,
  `80px` mobile. Mobile goes **up** because stacked content needs more rhythm
  to feel deliberate.
- **`--space-1` (8px) … `--space-7` (80px)** — vertical-rhythm token scale.
  Existing sections still use raw px in many places; new code should prefer the
  tokens. The token migration is gradual.

## 7.5 Column Tokens

Named content-column widths consolidate the previous sprawl of 580 / 720 / 850
/ 1100 max-widths (see §10.2). Reference them on sections that need a narrower
column than the page width:

- `--col-narrow` (580px) — sell form, sell checklist, sell content, sell method
  column.
- `--col-mid` (720px) — sell landing body, sell landing back-cta.
- `--col-prose` (850px) — guide callout, guide CTA, guide table wrap, guide
  related, about related.
- `--col-page` (`var(--max-width)` = 1100px) — alias for the page width; use
  when a section explicitly wants page width without inheriting through the
  primitive.

## 7.6 Component System

- **Homepage cards** show image carousel, brand, title (clickable link to the
  listing page), spec pills, and price. Descriptions appear only on individual
  listing pages.
- **Stretched link** — the whole homepage card is clickable via a CSS `::after`
  pseudo-element on `.card-title-link`. Carousel controls (arrows, dots,
  lightbox) sit at `z-index: 2` above the link layer.
- **Static fallback** — `#available-grid` and `#sold-grid` hold pre-rendered
  crawler HTML; JS replaces it with the interactive carousel version on load
  (§6.5).
- **Listing page components** — see §5.10 (anatomy, collapsible sections, trust
  statement, related links, sticky CTA, carousel).
- **Retail comparison pill** — see §5.10.
- **Nav dropdown ("Sell Your Furniture" submenu)** — the Sell item is wrapped
  in `<li class="nav-dropdown">` containing both a clickable `<a href="/sell/">`
  and a separate `<button class="nav-dropdown-toggle">`. Desktop: submenu opens
  on hover or focus-within. Mobile: the toggle drives it. The submenu lists
  "By brand", "By piece", "By situation" from `config/taxonomy.js`. Markup is
  generated by `partials/nav.js`. The mobile drawer (`.nav-links.open`) is
  full-opacity white with `max-height: calc(100vh - var(--nav-height))` and
  `overflow-y: auto` so the expanded dropdown scrolls cleanly.
- **Newsletter signup** — a Kit (ConvertKit) form (form ID `9233085`) appears
  on the homepage (between reviews and FAQ), the sold page (between hero and
  inventory), the about page (above footer), and individual listing pages
  (below content, above footer). It posts to
  `https://app.kit.com/forms/9233085/subscriptions` via AJAX in `shared.js`.
  The heading text is exactly: *"Get first access before pieces sell. Enter
  your email to hear about new arrivals before the public."*
- **Homepage divider** — between hero/tagline and inventory, a decorative
  divider reads *"One of One. Once it's Gone, it's Gone."* in serif with
  horizontal lines on either side.
- **Skip-to-content links** — every page's first body element is
  `<a href="#main-content" class="skip-link">Skip to main content</a>` for
  keyboard/screen-reader accessibility. Do not remove.
- **Google Analytics** — GA4 tag `G-8MN82PPZRZ` is on every page except
  `404.html`. The default sitewide pattern is deferred-until-idle injection;
  certain low-traffic pages use the canonical static snippet instead — see §9.2.

## 7.7 Footer Architecture

The global footer is rendered by `partials/footer.js` from `config/taxonomy.js`:
a centered brand statement, a three-column taxonomy (Sell by Furniture Type /
Sell By Situation / Sell By Brand) linking to every sell-landing page, a quiet
utility row (Recently Sold, Guides, About, Privacy Policy), copyright, and
tagline. Styling lives under `.site-footer` / `.footer-*` in `css/styles.css` —
editorial, muted, typography-led. Mobile collapses the three columns into a
single stacked column with padded link blocks for thumb-friendly tap targets.
Sold-stub listing pages also use the global footer. To add a footer column
entry, edit `config/taxonomy.js` and rebuild.

**"Other brands" escape hatch.** The "Sell By Brand" column lists the six
brands with dedicated sell-landing pages, but the business buys other brands
too (American Leather, Brentwood Classics, Urban Barn, La-Z-Boy, etc.). The
listed six could be read by a seller as "the only brands we buy," which is
inaccurate and costs leads. To prevent that, the brand column ends with an
explicit `<li><a href="/sell/">Other brands &rarr;</a></li>` entry — rendered
in `partials/footer.js` after the taxonomy-driven brand links. Any future
authoring of the brand column should preserve that closing entry.

## 7.8 Responsive Philosophy

Mobile is treated as a deliberate layout, not a shrink of desktop: section
rhythm increases on mobile (§7.4), page-edge padding is held at a comfortable
minimum (§7.4, §10.3), the nav becomes a scrollable drawer, and the reviews
carousel intentionally goes full-bleed (§7.3). FAQ section labels are the one
heading class kept visible on mobile (§5.6).

---

# 8. Operational Playbooks

`[Operational]` — Mutable step-by-step workflows. These reference §5 for rules
rather than restating them. Expect this section to evolve frequently.

Across all playbooks: **Collin handles every push to GitHub** — see §8.12. Each
workflow ends at a clean local commit with build artifacts regenerated.

## 8.1 Change a Price

1. Edit the `price` field on the item in `js/available-data.js` — pure
   number, no currency symbol or formatting (e.g. `price: 7500`).
2. Run `node build.js`.
3. Commit (include `.build-state.json` so the lastmod history advances).

The build regenerates the homepage `Product` schema, the static fallback card,
and the individual listing page with the new price formatted through
`formatPrice()` (e.g. `$7,500`). The schema uses the numeric value directly.

## 8.2 Add New Available Inventory

1. **Create the image folder** `images/XX-NNN/` — naming per §5.3 (check
   existing folders for the next sequential number).
2. **Name images** `brand-slug-NN.jpeg` — first image is the cover (§5.3).
3. **Generate responsive variants** — run the command in §5.3 (Image
   Standards). The full AVIF/WebP/JPEG set at 400w/800w/full is required.
4. **Add the data entry** to `js/available-data.js` using the full standard
   treatment — see §5.10 for the field-by-field standard. New listings get the
   complete set (slug, metaTitle, metaDescription, availabilityStarts,
   dimensions, faq), not just required fields.
5. Run `node build.js`.
6. Commit all new files (images, variants, data change, generated HTML).

## 8.3 Move a Sold Item from Available to Sold

1. **Copy the item's data block** from `js/available-data.js`.
2. **Paste into `js/sold-data.js`** at the top of the array (most recent
   first), reformatted to the sold shape (§5.10): `{ brand, title, href,
   description, images }` — `href` is the sold-stub URL you create in step 5,
   and the generator reads this entry's photos, so set it now. **Image paths
   keep the original folder**, only the relative-depth prefix changes:
   - Active (root-relative, from `index.html` and `listings/[slug]/index.html`):
     `"images/XX-NNN/foo.jpeg"`
   - Sold (parent-relative, from `sold/index.html`):
     `"../images/XX-NNN/foo.jpeg"`

   Do **not** insert a `Sold Inventory/` segment in the path. The photo URL
   must stay identical from active to sold so the indexed image URL is
   preserved across the transition — see §5.3 (stable-URL convention) and
   §6.3.
3. **Remove the item** from `js/available-data.js`.
4. **Leave the image folder where it is.** Do **not** run `mv` —
   `images/XX-NNN/` is the permanent home for every photo. The legacy
   `images/Sold Inventory/` subfolder is closed to new entries
   (deprecated — see §10.14).
5. **Give the piece a sold-stub listing page** (rationale in §6.3) — never
   delete the listing directory. The slug is descriptive with **no** `-edmonton`
   suffix (e.g. `natuzzi-editions-vigore-leather-sectional`), matching the
   reference stubs `la-z-boy-emric-right-facing-sectional` and
   `rove-concepts-milo-6-piece-modular-sectional`. Generate it rather than
   hand-authoring:
   - Add a `MANIFEST` entry keyed by that slug in `scripts/gen-sold-stub.js`
     (`sku`, `price`, `availability: "SoldOut"`, `brand`, `brandShort`, `h1`,
     `model`, `configuration`, `sellHref`, `altBase`, `metaDescription`,
     `twitterDescription`, `productDescription`, `introHTML`,
     `newsletterHeading`).
   - **Body-copy convention** (uniform across the cluster): `introHTML` is a
     unique, keyword-rich description (sat below the title with a touch of top
     padding). It carries **no sell-page link** — most visitors to a sold page
     are buyers, and a `/sell/` link on a descriptive phrase ("leather sofa")
     reads as a buyer catalogue link and bounces them. Brand/configuration words
     stay plain text in the intro; only buyer-relevant cross-links (e.g. a
     piece's matching companion in a set → the companion's own sold stub) belong
     there. The generator then appends a fixed closing sell line — the **only**
     sell CTA on the page — built from `model` / `brandShort` / `configuration`
     (with a/an auto-selected). Its hyperlinked phrase points to `sellHref` (the
     piece's target sell page: the brand's `/sell/[brand]/` page, or — when the
     brand has no sell page or only a redirect stub like B&B Italia / American
     Leather — the matching piece-type page; never a redirect, §5.8), and the
     **anchor text matches that target**: the brand name for a brand page (*"we
     buy Natuzzi directly — no listing, no waiting"*), or the pluralized
     configuration for a config page (*"we buy leather sofas directly…"*, *"we
     buy sectionals directly…"*). Full line: *"If you have a{n} {model} or a
     similar {brandShort} {configuration} you're thinking about selling, [we buy
     {brand-or-config} directly — no listing, no waiting]. Our team handles the
     full, specialized in-home removal and transport."* Putting the sell link
     here (seller-intent context) instead of the intro avoids pulling buyers off
     the page. (Edge cases: when a brand name already contains the configuration word — e.g. *American Leather* — set `configuration` without the redundant word, like `'sofa'`, so the line doesn't read "American Leather leather sofa"; and for a piece with no distinct model name — e.g. an unbranded-model Fabbrica sectional — leave `model` empty (`''`) and the line drops the "{model} or" clause: "If you have a similar Fabbrica sectional…".) Do **not** restate that closing line inside `introHTML`.
   - Run `node scripts/gen-sold-stub.js <slug>`. It reads the piece's photos
     from the `sold-data.js` entry (so the `href` from step 2 must be in place
     first) and emits `listings/<slug>/index.html` byte-faithful to the
     reference stubs: **no `Product` schema** (see §6.3 for the full reasoning —
     a sold piece can't carry a valid `Product` without re-introducing a price
     or a manual-action risk), just a `BreadcrumbList` and a per-photo
     `ImageObject` gallery, carousel + thumbnails, `robots: index, follow`, the
     canonical static GA snippet (§9.2), and a `dateModified` of today. The
     `sku` / `price` / `availability` MANIFEST keys are retained as an internal
     record (and the build log) but no longer emit any schema.
   - **Verify the copy against the photos** — legacy `sold-data.js` descriptions
     are not always accurate (e.g. a piece described as "cognac" that is
     actually white). Fix both the stub and the `sold-data.js` description.
   - For a piece that previously had an **active** listing the slug already
     exists; regenerating overwrites it as a stub. If the slug itself must
     change, leave a redirect stub at the old URL (§8.8).
6. **List the stub in `llms.txt`** under "Sold Inventory (Individual Archive
   Pages)", newest first.
7. **Run `node build.js`.** The `href` automatically threads the stub into
   `sitemap.xml` (with its photos as image children, moved off `/sold/`),
   retargets the "Recently Sold" Related-Links cards on active same-brand
   listings to the stub, and deep-links every matching `.sell-landing-sold-grid`
   card across the sell cluster to the stub in a new tab (§5.10, §5.13, §5.15);
   partial injection refreshes the stub's nav/credibility/footer and `?v=`
   hashes.
8. **Commit** (include `.build-state.json`). The sold-count tagline in
   `sold/index.html` ("Over NN premium sofas…") is hardcoded — update it
   manually if desired.
9. **Internal links** — scan guides for references to the piece; follow §8.8.

## 8.4 Add a New Customer Review

New reviews go at the **top** of the list (render order is data order, newest
first).

1. **Edit `js/reviews-data.js`** — insert the new review at the top of the
   `reviews` array:
   ```javascript
   { name: "First Last", rating: 5, text: "Quote text." },
   ```
2. **Bump `reviewAggregate`** — increment `totalCount` by 1, recompute
   `ratingValue` as (sum of ratings) / `totalCount` rounded to one decimal, and
   update the inline math comment.
3. **Update the `FurnitureStore` schema in `index.html`** — bump
   `aggregateRating.reviewCount` and **prepend** the new `Review` block so
   schema order matches visible order.
4. **Update the `FurnitureStore` schema in `sell/index.html`** — same
   treatment.
5. **Update `llms.txt`** — bump the "Rating: 4.9 stars (NN ratings)" count.
6. **Run `node build.js`** — regenerates the static fallback in `index.html`,
   recomputes the `reviews-data.min.js` content hash, and rewrites every
   `?v=…` reference automatically.

The credibility strip shows no review count, so no other copy changes.

## 8.5 Add a New Guide Article

1. **Create the directory** `guides/article-slug/` — slug per §5.1.
2. **Create `guides/article-slug/index.html`** following the full guide article
   standard in §5.12 (head order, body structure, components). Reference
   `guides/how-to-buy-used-sofa-edmonton/index.html`.
3. **Add a card to `guides/index.html`** inside `.guides-list`, newest first:
   ```html
   <a class="guide-card" href="/guides/article-slug/">
     <p class="guide-card-category">Category Label</p>
     <p class="guide-card-title">Full Article Title</p>
     <p class="guide-card-excerpt">One-to-two sentence excerpt.</p>
   </a>
   ```
4. **Add the guide URL to `generateSitemap()` in `build.js`**, alongside the
   existing guide URLs:
   ```javascript
   '  <url>',
   '    <loc>https://edmontonrefreshed.com/guides/article-slug/</loc>',
   '    <lastmod>' + d + '</lastmod>',
   '    <changefreq>monthly</changefreq>',
   '    <priority>0.8</priority>',
   '  </url>',
   ```
5. Run `node build.js` (regenerates the sitemap).
6. **Add internal links** from the guide body to relevant listing pages — see
   §5.8.
7. Commit all new files.

## 8.6 Edit CSS

1. Edit `css/styles.css`.
2. Run `node build.js` — minifies the source into `css/styles.min.css`,
   recomputes its content hash, and rewrites every `?v=…` reference across
   every HTML file (including the listing-page template).
3. Commit (include `.build-state.json`).

## 8.7 Edit JS

1. Edit the source file (`js/shared.js`, `js/available-data.js`,
   `js/sold-data.js`, `js/reviews-data.js`, or `js/sell-form.js`).
2. Run `node build.js` — re-minifies the source, recomputes its content
   hash, and rewrites every `?v=…` reference across every HTML file.
3. Commit (include `.build-state.json`).

## 8.8 Change a Listing's URL Slug

When a listing URL must change, preserve the old URL's indexed equity with a
redirect stub rather than deleting it (rationale in §6.3).

1. **Update the `slug`** in `js/available-data.js`.
2. **Run `node build.js`** — creates the new directory at
   `/listings/[new-slug]/`. The old directory still holds its old page.
3. **Replace the old directory's `index.html` with a redirect stub:**
   - `<meta http-equiv="refresh" content="0; url=https://edmontonrefreshed.com/listings/[new-slug]/">`
     in `<head>`.
   - `canonical`, `og:url`, and `twitter:url` all pointing at the **new** slug
     so a crawl of the old URL consolidates equity to the new page.
   - The canonical static GA snippet (not the deferred pattern — see §9.2).
   - A `<script>window.location.replace("...")</script>` fallback as the body's
     only meaningful content, plus one visible paragraph linking to the new URL.
   - Keep `<meta name="robots" content="index, follow">` so Google processes
     the redirect signal.
4. **Update every internal link** pointing at the old slug:
   ```bash
   grep -rln "listings/[old-slug]" --include="*.html" --include="*.js" .
   ```
   Bump `dateModified` (§5.4) on any guide or sell page you edit.
5. The sitemap regenerates automatically — `build.js` emits only the new slug.
6. Commit.

## 8.9 Update Internal Links When Inventory Changes

When a piece sells (and its listing becomes a sold stub), scan all guide
articles for links/sentences pointing at it:

- Links to the now-sold listing page can stay — the stub handles the
  destination gracefully.
- Sentences describing the piece as "currently available" should be updated to
  remove the availability claim or made evergreen (e.g., "pieces like this come
  through the shop regularly").
- If a new piece from the same brand replaces it, update the link target and
  sentence to the new listing.

Find all guide files linking to a listing slug:

```bash
grep -rl "listings/brand-slug" guides/
```

## 8.10 Edit or Add a Sell-Side Landing Page

The `/sell/[slug]/` pages are hand-maintained (§5.13); the original
generator script is no longer run.

**To edit one:** open the relevant `sell/[slug]/index.html` and edit
directly. Leave the `<!-- NAV_START -->`, `<!-- CREDIBILITY_START variant="seller" -->`,
and `<!-- FOOTER_START -->` marker pairs in place — content inside them is
regenerated from `partials/` on every build; edit only content outside them.
After any edit, refresh `dateModified` on the `Service` schema (§5.4).

**To modify the form:** update `js/sell-form.js` (source), run `node build.js`
to regenerate the minified file, and keep the form HTML identical across every
sell page (§5.11).

**To add a new landing page:**

1. Add an entry to the appropriate `config/taxonomy.js` array (`brands`,
   `furnitureTypes`, or `situations`) — this threads it into the nav dropdown
   and footer column on the next build.
2. Add a `<url>` entry to `generateSitemap()` in `build.js`.
3. Create `sell/[slug]/index.html` — easiest path is to copy an
   existing page in the same cluster and adjust. Follow the structure, schema,
   and cross-linking rules in §5.13.
4. Add a cross-link card to the appropriate cluster on `sell/index.html` and on
   related landing pages.
5. Run `node build.js`.
6. Commit.

## 8.11 Deploy the Worker

Worker changes (`worker/index.js`, `worker/wrangler.toml`) deploy independently
of the static site (§4.8). Deploy from the `worker/` directory via
`wrangler deploy`. Pushing to `main` does **not** redeploy the Worker —
explicitly tell Collin when Worker code has changed so he can run the deploy.

## 8.12 Deploy the Static Site

**Collin handles every push to GitHub personally. Do not run `git push`.** An
AI session's job ends at a clean commit on the local `main` branch with build
artifacts regenerated and ready to ship. Collin reviews the commit and pushes
when ready; GitHub Pages auto-deploys within ~60 seconds of his push.

## 8.13 Generate Guide Article Ideas

When asked to brainstorm article ideas for the Guides section, use this
framework. (For the business description and brand-ordering rule, see §2.1.)

**Each idea must include all six of:**

1. **Title** — a full article headline, reads naturally, contains the primary
   keyword, includes "Edmonton" where it fits.
2. **Target keywords** — 3–5 specific search phrases mixing head terms and
   long-tail; at least one includes "Edmonton".
3. **Detailed structural guidance** — a 150–250 word paragraph (prose, not
   bullets) describing exactly how to structure the article: what to open with,
   sections to include, specific points to cover, data/examples to use, tone,
   and how to close — detailed enough to write the article from without further
   direction.
4. **Word count target** — a specific range calibrated to topic depth.
5. **Internal linking opportunities** — which existing pages to link
   (inventory, `/sell/`, other guides).
6. **FAQ suggestions** — 3–4 real searcher questions in natural language, for
   `FAQPage` markup.

**Content principles:**

- **Objectivity over salesmanship.** Articles read as useful guides, not ads.
  Concede where the business model is not the best fit; acknowledge competitors
  fairly.
- **Specificity over generality.** Use real brands, real price ranges, real
  examples from sold/current inventory. "A Natuzzi Editions sectional that
  retailed for $6,800 sold pre-owned for $2,799 — 59% off" beats "buy quality
  furniture." Lead brand lists with top-tier names (§2.1); La-Z-Boy goes last.
- **Edmonton-local angle.** Every article has at least one Edmonton-specific
  section — local brands, market conditions, delivery realities, competitors,
  housing stock (split-levels, basement suites, apartment elevator dimensions).
- **Dual-audience awareness.** The business serves buyers and sellers; where
  natural, bridge to the other side.
- **Search-intent matching.** Each article targets one intent — informational,
  commercial investigation, transactional, or navigational — and its structure
  matches it.
- **Cross-linking between articles.** Ideas form natural clusters that link to
  each other (brand guides → pricing guide → buying guide; Marketplace articles
  ↔ sell page).

**Tone.** Write the descriptions the way the articles should read: direct,
knowledgeable, practical. No filler, no hedging, no marketing fluff — the voice
of someone who handles this furniture every day.

## 8.14 Add or Change a `sameAs` Profile URL

`sameAs` URLs are the canonical external profiles for Knowledge Graph entity
consolidation (§5.4 — sameAs rule). Adding a new profile (e.g. YouTube,
Pinterest) or correcting an existing one is a two-step change:

1. **Edit `config/site.js#sameAs`** — append the new URL or correct the
   existing one. `build.js` reads this array directly into the listing-page
   `FurnitureStore` and `Organization` schemas.
2. **Sync hand-maintained pages.** The homepage `FurnitureStore`, about
   `Organization`, sell hub `FurnitureStore`, and every
   `sell/[slug]/` `FurnitureStore` (where present) duplicate the
   same array verbatim. Update each one by hand, or run a one-shot sync
   script that rewrites every `"sameAs": [...]` JSON-LD array across all
   HTML files to match `config/site.js#sameAs` (see the historical sync
   pattern in the commit that introduced this playbook).
3. Run `node build.js` and commit (include `.build-state.json`).

Every `Organization`, `FurnitureStore`, and `LocalBusiness` schema across
the site must end up with the identical `sameAs` array. Inconsistency
splits entity trust across variant URLs and undermines the Knowledge
Graph signal.

---

# 9. Historical Notes & Gotchas

`[Historical]` — Institutional memory and known quirks. Context, not active
architecture.

## 9.1 The Text-Input Honeypot Bug

The sell-form honeypot must be a **checkbox**, not a text input. A previous
text-input honeypot was filled by browser autofill and password managers,
which silently dropped real submissions under the silent-drop contract (§5.11).
Checkboxes are almost never auto-ticked. Do not "simplify" the honeypot back to
a text input.

## 9.2 GA Tag Coverage on Low-Traffic Pages

The site's default GA4 pattern defers `gtag.js` injection until idle
(`requestIdleCallback` / `load`). That deferred snippet leaves no
`<script src="…/gtag/js?id=…">` in the static HTML, so Google's Tag Coverage
report flags low-traffic URLs as "no tag detected" until someone actually
visits them.

Because of this, **sold stubs and redirect stubs use the canonical static GA
snippet** instead — the tag is present in static HTML and validators/Tag
Coverage detect it without depending on real pageviews:

```html
<!-- Google tag (gtag.js) — canonical static snippet so GA Tag Coverage / validators detect the tag without depending on real pageviews -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-8MN82PPZRZ"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-8MN82PPZRZ');
</script>
```

Active listing pages (generated by `build.js`) keep the deferred pattern — they
receive real traffic, GA confirms the tag via pageviews, and LCP performance
matters more there.

## 9.3 The "Update Every Copy" Maintenance Pattern

Before the partial-injection system (§4.5), nav, credibility, and footer markup
were duplicated into every HTML file, so adding a sell-landing page or a footer
link meant editing every page by hand. The partial system plus `config/` was
introduced specifically to kill that pattern. If you ever find yourself making
the same edit across many HTML files, that is a signal the content should move
into a partial or config file.

## 9.4 AVIF & LCP Preload Coupling

LCP preload depends on the full-size AVIF variant existing on disk. A missing
AVIF does not break the page (the browser falls through WebP → JPEG) but it
**silently disables LCP preload**, hurting performance with no visible error.
Always generate the complete variant set (§5.3).

## 9.5 The Sold-Folder Move & Image-URL Continuity

Earlier convention moved each piece's image folder from `images/XX-NNN/`
to `images/Sold Inventory/XX-NNN/` on sale. The intent was folder-level
organization between active and archived inventory. The cost — only
visible after the §5.16 `ImageObject` attribution layer made image
indexing more legible — was that every photo's URL changed at the moment
of sale: Google had to drop the indexed `/images/XX-NNN/...` URL on a
404 and rediscover the photo at `/images/Sold Inventory/...` weeks
later via the sitemap. That continuity gap is precisely when brand+model
queries for the just-sold piece are still warm.

The §5.3 stable-URL convention removes the gap by leaving the folder in
place. The legacy `images/Sold Inventory/` subfolder is retained for
historical entries (those URLs are already indexed at that path and
should not be broken by a back-migration). New sales follow the stable-
URL protocol — see §10.14 for the deprecation entry.

## 9.6 Build Dates Are Edmonton-Local, Not UTC

`build.js`'s `today()` once used `new Date().toISOString()`, which returns a
**UTC** date. Edmonton is UTC-6/-7, so any build run after ~18:00 local time
stamped *tomorrow's* date — `dateModified`, sitemap `<lastmod>`, and
`priceValidUntil` all jumped a day ahead of the business's actual day (and a
UTC CI runner would trip it even earlier in the day). The fix: a single
`isoDate(date)` helper formats every freshness date with
`toLocaleDateString('en-CA', { timeZone: 'America/Edmonton' })` — `en-CA`
yields zero-padded `YYYY-MM-DD` — and both `today()` and `todayPlusDays(n)`
route through it. **Do not "simplify" these back to `toISOString()`** — that
reintroduces the off-by-one. The business timezone lives in the `BUSINESS_TZ`
constant so a future city fork (§4.4) repoints it in one place.

---

# 10. Deprecated Patterns

`[Deprecated]` — Obsolete approaches retained only to prevent accidental
resurrection. **Do not use any of these for new implementation.**

## 10.1 `OutOfStock` (and `Product`/`Offer`) for Sold Pieces

**DO NOT USE FOR NEW IMPLEMENTATION.** Sold stubs now carry **no `Product`
schema at all** (no `Offer`, no `availability`, no `price` — see §6.3), so this
rule is a historical guard. *If* a `Product`/`Offer` is ever reintroduced on a
sold piece (it shouldn't be — §6.3 explains why every variant fails): an
availability value must be `SoldOut`, never `OutOfStock` (`OutOfStock` implies
the item may return; `SoldOut` signals a permanent one-of-one sale), and note
that any `Offer` forces a `price` back onto the page (Google requires it) while
a bare `Product` is itself invalid without `offers`/`review`/`aggregateRating`.
The preferred state is no `Product` schema on sold stubs.

## 10.2 Ad-Hoc Content-Column Max-Widths

**DO NOT USE FOR NEW IMPLEMENTATION.** The site previously scattered raw
`max-width` values (580 / 720 / 850 / 1100px) across many sections. These are
consolidated into the named column tokens in §7.5 (`--col-narrow`,
`--col-mid`, `--col-prose`, `--col-page`). New sections reference a token; they
do not introduce new raw widths.

## 10.3 Hardcoded `16px` Page-Edge Padding

**DO NOT USE FOR NEW IMPLEMENTATION.** Earlier mobile CSS overrode page-edge
padding to `16px`, which read as edge-to-edge cramping. Page-edge horizontal
padding now reads exclusively from `--page-x` (§7.4), which never drops below
`20px` (and only at sub-360px). Never hardcode `16px` — or any literal pixel
value — for page-edge padding.

## 10.4 Hand-Edited Generated Files

**DO NOT USE FOR NEW IMPLEMENTATION.** Never hand-edit files generated by
`build.js` — `index.html` / `sold/index.html` content inside marker comments,
active listing pages, `sitemap.xml`, `js/*.min.js`, or the nav/credibility/
footer blocks inside marker pairs. Edit the source (data files, partials,
config, `build.js`) and rebuild. See §4.2.

## 10.5 Re-Running the Sell-Landing Generator Script

**DO NOT USE FOR NEW IMPLEMENTATION.** The `/sell/[slug]/` pages were
generated once by a script that is no longer maintained or run. They are now
hand-maintained (§5.13, §8.10). Do not attempt to re-run or recreate that
generator — edit the pages directly.

## 10.6 Restating Canonical Rules Inline

**DO NOT USE FOR NEW IMPLEMENTATION.** Earlier revisions of this document
restated the same rules (currency, `dateModified`, image variants, GA snippet)
in multiple places, which caused drift as copies fell out of sync. Each rule
now has one canonical home in §5; everything else references it. When adding
guidance, link to the canonical section instead of copying it.

## 10.7 Manual `?v=N` Asset-Version Registry

**DO NOT USE FOR NEW IMPLEMENTATION.** Asset versions used to be hand-bumped
integer suffixes (`v=56`, `v=31`, etc.) tracked in a registry table in this
file. `build.js` now derives `?v=<8-hex>` from a SHA-256 hash of the
minified content and rewrites every reference across every HTML file
automatically. Do not hand-edit asset query strings; do not recreate the
registry table. See §4.6 / §5.7.

## 10.8 String-Formatted Prices in Data

**DO NOT USE FOR NEW IMPLEMENTATION.** Prices used to live in
`js/available-data.js` as pre-formatted strings (`price: "$3,900"`) with a
sibling `retailCompare: "Est. Retail: $X,XXX | Buy it Today: $X,XXX"`. The
canonical shape is now pure numbers — `price: 3900`, optional
`retailEstimate: 12000` — formatted at render time through `formatPrice()`.
This eliminates regex parsing of price strings, fixes schema integrity (the
`offers.price` field is a real number, not a parsed-back string), and keeps
the value pill composable. See §5.10.

## 10.9 Separate Visible / Schema FAQ Blocks

**DO NOT USE FOR NEW IMPLEMENTATION.** The homepage, sell hub, and about
page used to maintain their visible FAQ markup and `FAQPage` JSON-LD schema
as two parallel hand-edited blocks, which drifted in both question text and
answer text. Both are now generated from `config/faqs.js` between marker
pairs on every build. Edit the data, not the markup. See §5.14.

## 10.10 Build-Timestamp `<lastmod>`

**DO NOT USE FOR NEW IMPLEMENTATION.** The sitemap used to stamp every
URL's `<lastmod>` with today's date on every build, which diluted the
freshness signal — a pure no-op build still advanced every URL. `<lastmod>`
now reflects actual content modification, gated by a per-URL content hash
stored in `.build-state.json`. Pure rebuilds leave every date stable. See
§5.15.

## 10.11 Serif `.sell-section-heading` on "Send us your details"

**DO NOT USE FOR NEW IMPLEMENTATION.** The "Send us your details" h2 on
every sell-landing page used to use `class="sell-section-heading"` — a
serif-styled centered heading specific to the sell cluster. It now uses
the global `class="section-label sell-send-heading"` pattern so the
heading hierarchy is uniform with the rest of the site (per §5.6) and
the form-handoff still gets the centered, top-spaced placement it needs.
The `.sell-section-heading` class still exists in CSS for transitional
purposes but new authoring uses the section-label pattern. See §5.13.

## 10.12 Published Per-Piece Valuation Tables on Sell Pages

**DO NOT USE FOR NEW IMPLEMENTATION.** Sell-landing pages briefly carried
"What used [Brand] pieces typically sell for in Edmonton" tables, plus
FAQ answers quoting specific dollar ranges and value multipliers
(e.g. "Italia is roughly 1.5–2× Editions value"). Both were removed.
The numbers couldn't be defended under scrutiny, and — more importantly
— every published figure became the seller's expected floor in
negotiation, making it harder to acquire pieces at the margins the
business needs. The only public valuation signal on sell pages is the
wide credibility-strip range *"Most Offers $500–$2,500"*. FAQ valuation
questions deflect to *"send photos for a specific offer"*. See §5.13
pricing restraint rule.

## 10.13 Disingenuous Marketplace Comparison

**DO NOT USE FOR NEW IMPLEMENTATION.** Earlier Marketplace-vs-us
comparison tables on sell pages contained "Risk: None" rows,
"chargeback risk" claims about Marketplace cash/e-transfer
transactions, and fabricated percentage stats ("55–70% of asking after
2–3 price drops"). All were removed because they read as marketing copy
rather than honest analysis and undermined the brand's "concede where
you're not the best fit" positioning. New comparisons follow the §5.13
Marketplace-comparison rules: concede Marketplace can pay more, no
false-confidence claims, no FUD, no fabricated stats, frame the trade
as dollars-for-friction.

## 10.14 Moving Image Folders to `images/Sold Inventory/` on Sale

**DO NOT USE FOR NEW IMPLEMENTATION.** Earlier protocol moved each
piece's image folder from `images/XX-NNN/` to
`images/Sold Inventory/XX-NNN/` when the piece sold, with `sold-data.js`
referencing the new path. The intent was folder-level organization
between active and archived inventory; the cost was that every photo's
URL changed at the moment of sale, dropping Google Images' indexed
entry on a 404 and re-indexing weeks later under the new path — exactly
the wrong moment for image-search continuity. The §5.3 stable-URL
convention replaces the move: the folder stays at `images/XX-NNN/`
forever, and only the relative-depth prefix in `sold-data.js` changes
(`../images/XX-NNN/...`). Existing folders already at
`images/Sold Inventory/` are retained as legacy (their URLs are
indexed there); do not back-migrate them. See §9.5 for the rationale,
§5.3 for the canonical rule, and §8.3 for the revised playbook.

## 10.15 `-edmonton` Suffix on Sell-Landing Slugs

**DO NOT USE FOR NEW IMPLEMENTATION.** The sell-landing cluster used to live at
`/sell/[slug]-edmonton/` — the `sellUrl()` helper in `config/taxonomy.js`
appended `-${site.citySlug}` to every brand, piece-type, situation, and
eligibility slug, mirroring the listing-slug convention (§5.1). The suffix was
dropped: the cluster now lives at `/sell/[slug]/`, and `sellUrl()` returns
`/sell/${slug}/` directly. The local-search signal on these pages is carried by
copy, schema, and the domain — not the path — and a multi-city fork lives on
its own domain, so an un-suffixed path never collides.

Migration shape (do not re-suffix these in new work):

- The 18 brand/piece/situation pages plus `what-we-buy` were renamed
  (`git mv`) from `sell/[slug]-edmonton/` to `sell/[slug]/`.
- Each old `/sell/[slug]-edmonton/` URL is retained as a bare redirect stub
  (meta-refresh + `rel=canonical` → the de-edmonton URL + the static GA
  snippet, §9.2), preserving indexed equity exactly like a changed listing
  slug (§8.8).
- The discontinued brand stubs gained de-edmonton siblings
  (`/sell/american-leather/`, `/sell/bb-italia/`) that redirect to `/sell/`;
  the legacy `-edmonton` versions still redirect too.
- True HTTP 301s for the old → new URLs are enforced at the Cloudflare edge
  (the in-repo meta-refresh stubs are the static-host fallback, since GitHub
  Pages can't emit a 301 from a file).

**Listing slugs and guide slugs keep their `-edmonton` suffix** (§5.1) — this
deprecation applies only to the `/sell/` cluster.
