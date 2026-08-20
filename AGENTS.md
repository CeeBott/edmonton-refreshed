# AGENTS.md — Edmonton Refreshed (engineering orientation)

Brief orientation for automated agents and contributors. This is NOT the full
conventions doc — it covers structure and build mechanics only. Content, SEO,
and business conventions are maintained separately by the owner; ask before
assuming.

## Stack
- Static site, hand-authored vanilla HTML/CSS/JS. No framework, no bundler.
- One build step: `node build.js` (Node built-ins only). Hosted on GitHub Pages.

## Golden rule: never hand-edit generated files
`build.js` regenerates these — edit the SOURCE and rerun the build, never the output:
- `index.html` / `sold/index.html` content inside `<!-- ..._START/_END -->` markers
- everything under `listings/*/index.html` (active listings)
- `sitemap.xml`, `merchant-feed.xml`, `.build-state.json`, `css/*.min.css`, `js/*.min.js`
- nav / credibility / footer blocks inside marker pairs on every page
- `BRAND_LIST` / `SOLD_COUNT` / `AVAILABLE_FROM_BRAND` marker content and the sold- and available-inventory lists in `llms.txt`
- the `.sell-form-prelude` / `.sell-form-offer` panels above every sell form (source: `partials/sell-prelude.js`)

Edit instead: `js/*.js` (non-min), `css/styles.css`, `config/*.js`,
`partials/*.js`, `build.js`, and hand-authored pages. Run `node build.js` after
any source change and commit the regenerated output.

## Layout
- `config/`   — single-source data (site, taxonomy, FAQs)
- `partials/` — nav / footer / credibility / sell-form prelude (injected at build)
- `js/ css/`  — source + minified bundles
- `images/XX-NNN/` — per-piece photos with responsive variants
- `listings/[slug]/` — generated; `guides/`, `sell/`, `about/` — hand-authored
- `worker/`   — Cloudflare Worker (sell form); deploys separately via wrangler

## Conventions easy to break
- Slugs: listing & guide slugs end in `-edmonton`; sell-cluster paths do not.
- Structured data: every page carries JSON-LD; keep `dateModified` (YYYY-MM-DD)
  current on any page you edit.
- Images: every photo needs AVIF + WebP + JPEG at 400w/800w/full; never
  reference a raw original.
- Prices: Canadian dollars only; stored as plain numbers, formatted to
  "$X,XXX CAD" at render — never bake currency/formatting into data.
- Deploy: push to `main`; Pages serves the repo root as-is. The Worker deploys
  separately and is not redeployed by a push.

Anything beyond structure/build — page copy, SEO/linking rules, what to buy or
list — is governed by the owner's private manual. When in doubt, ask.
