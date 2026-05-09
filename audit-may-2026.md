# edmonton-refreshed.com — Performance Audit

**Audit date:** May 9, 2026
**Period analyzed:** Feb 9 – May 9, 2026 (last 3 months) with 12-month trend context
**Data sources:** Google Search Console, Google Analytics 4 (GA4 property: Edmonton Refreshed Seating)
**Site age in Search:** ~3 months (first GSC impressions in Feb 2026)

---

## Executive Summary

The site is doing what a brand-new niche site should do at month three: indexing fast, ranking on page 1 for a small set of high-intent local queries, and starting to show up for the biggest commercial opportunity (sell-side queries) — but in positions too deep to convert. Growth is real (impressions roughly doubled month over month from March to April). The conversion machinery on the site itself is solid. The constraint is that the highest-value queries — the ones that align directly with the lead-capture goal — are stuck on page 4–6 of Google.

The single biggest lever is fixing positioning on sell-side queries. The single biggest unmissed opportunity is publishing live "what we paid" data for sold pieces, which would let the site capture every "[brand] [model] resale value" search in Canada and pull sellers in passively. There is also a meaningful amount of off-Edmonton (US, UK, global) traffic on global brand reviews that is being earned but not monetized — a small adjustment to how those guides close could open a referral revenue stream.

---

## What the Numbers Say

### Search Console — Trajectory (last 12 months)

| Month | Impressions | Clicks | CTR | Avg Position |
|---|---|---|---|---|
| Feb 2026 | 56 | 3 | 5.36% | 44.1 |
| Mar 2026 | 770 | 12 | 1.56% | 38.3 |
| Apr 2026 | 1,602 | 26 | 1.62% | 22.9 |

Impressions grew 28× in two months and average position moved from page 5 to mid–page 3. CTR dropped as impression volume scaled (normal — the site is appearing on more queries it can't rank well for yet), but the absolute click count is rising. The site is on a healthy trajectory; what it lacks is volume.

### Google Analytics 4 — Last 3 months

| Metric | Value |
|---|---|
| Sessions | 337 |
| Active users | 191 |
| Engaged sessions | 169 |
| Engagement rate | 50.5% |
| Avg session length | 49 sec (boosted significantly when guides are the landing page) |
| Form submits | 1 |
| SMS clicks | 11 |
| Phone clicks | 5 |
| Email clicks | 3 |

**~20 contact actions in 90 days** is a healthier number than the form-submit count alone suggests — most prospects are clicking text-to-phone rather than filling out the upload form. Worth noting because the analytics narrative depends on it.

### Channel mix (last 3 months)

| Channel | Sessions | Engagement Rate |
|---|---|---|
| Direct | 229 | 44.5% |
| Organic Search | 83 | 71.1% |
| Organic Social | 11 | 27.3% |
| Referral | 6 | 83.3% |
| Unassigned (incl. ChatGPT) | 5 | 40% |

A large share of "Direct" is actually Facebook traffic — the URL data shows multiple `/?fbclid=...` landings being misclassified. Facebook is the dominant referral driver and it is being undercounted as a channel.

**Organic search has by far the highest engagement rate (71%)** — these are the most qualified visitors the site receives, and they are the cheapest to acquire. They are also the smallest channel today.

### Geographic distribution (last 3 months sessions)

| City | Sessions | Engagement Rate |
|---|---|---|
| Edmonton | 153 | 73.9% |
| Boardman, OR | 54 | 1.85% (bot traffic — see issues below) |
| Calgary | 34 | 61.8% |
| (not set) | 21 | 9.5% |
| Drayton Valley / Grande Prairie / Dawson Creek / High River | 10 combined | 80%+ |

**Edmonton + surrounding-area Alberta sessions (real humans): ~190.** That's the actual addressable audience the site is reaching today.

### Search Console — Top 12 non-branded queries (last 3 months)

| Query | Imp | Clicks | Position | Note |
|---|---|---|---|---|
| sell midcentury furniture edmonton | 118 | 0 | 56.6 | Page 6 — high-intent miss |
| sell used furniture edmonton | 115 | 0 | 42.7 | Page 5 — high-intent miss |
| sell vintage furniture edmonton | 81 | 0 | 60.6 | Page 6 — high-intent miss |
| rove concepts edmonton | 71 | 0 | 7.7 | **Page 1, no clicks** |
| how to measure a sectional | 64 | 0 | 57.1 | Long-tail informational |
| danish furniture edmonton | 57 | 0 | 43.2 | Adjacent intent |
| used furniture edmonton | 44 | 2 | 9.8 | **Page 1, converting** |
| natuzzi edmonton | 36 | 2 | 8.4 | **Page 1, converting** |
| sectional couch dimensions | 36 | 0 | 78.0 | Off-target |
| second hand furniture edmonton | 30 | 1 | 12.4 | Top of page 2 |
| no frills near me | 13 | 0 | 1.1 | Misfire — irrelevant |
| how to measure a sectional couch | 12 | 0 | 48.3 | Long-tail informational |

### Search Console — Top landing pages (last 3 months)

| Page | Imp | Clicks | CTR | Position |
|---|---|---|---|---|
| Homepage | 495 | 19 | 3.8% | 12.7 |
| /guides/natuzzi-sofa-review-edmonton/ | 393 | 4 | 1.0% | 11.8 |
| /sell/ | 340 | 7 | 2.1% | 41.8 |
| /listings/b-b-italia-charles-l-shaped-modular-sectional/ | 273 | 2 | 0.7% | 50.5 |
| /listings/rove-concepts-milo-6-piece-modular-sectional/ | 167 | 0 | 0% | 41.1 |
| /guides/how-to-measure-sectional-sofa-edmonton/ | 156 | 0 | 0% | 58.6 |
| /sold/ | 156 | 2 | 1.3% | 39.8 |
| /guides/edmonton-furniture-consignment-resale-guide/ | 148 | 2 | 1.4% | 27.3 |

### Device split (CTR is the headline)

| Device | Imp | Clicks | CTR | Position |
|---|---|---|---|---|
| Desktop | 1,483 | 12 | 0.81% | 32.4 |
| Mobile | 905 | 28 | 3.09% | 22.0 |
| Tablet | 40 | 1 | 2.50% | 18.3 |

Mobile CTR is **3.8× higher than desktop** at a slightly better average position. This suggests SERP appearance is more compelling on mobile, the mobile site experience is excellent, and/or desktop SERPs have more competition pushing the result down. Either way, mobile is doing the heavy lifting.

### What the /sell/ page actually ranks for (last 3 months)

| Query targeting /sell/ | Impressions | Clicks | Position |
|---|---|---|---|
| sell midcentury furniture edmonton | 107 | 0 | 54.1 |
| sell used furniture edmonton | 60 | 0 | 54.3 |
| sell vintage furniture edmonton | 56 | 0 | 62.7 |
| trade in sofa | 10 | 0 | 55.6 |
| trade in sofas | 6 | 0 | 38.8 |
| sell your sofa | 2 | 0 | 3.5 |
| where can i sell my sofa | 2 | 1 | 7 |
| sell my sofa | 1 | 1 | 3 |
| we buy sofas | 2 | 0 | 10 |
| sofa buyers | 2 | 0 | 64 |

This is the most important finding in the whole audit. The /sell/ page is **already showing up** for the exact high-intent queries the business is built on. It is just buried — page 4 to page 7 — for the highest-volume ones, while ranking on page 1 for lower-volume ones. The page exists, the schema is right, the content is solid. The signals are too weak to compete.

---

## What's Going Well — Keep Doing It

**The guide content is earning impressions.** The Natuzzi review alone has 393 impressions in the last quarter at position 11.8 (one or two spots from page 1). The Edmonton consignment guide is at position 27 — tantalizing close to the second page. The B&B Italia review is at position 6.8 (page 1 but low), the Rove Concepts review at 12.8. The pattern is consistent: **brand-specific guides anchored to Edmonton are working.** This is the single highest-leverage content format on the site so far.

**Local Edmonton intent is converting.** Edmonton-based sessions show a 73.9% engagement rate, dramatically higher than the site average. When the site reaches the right person, the page does its job. The same pattern shows on /sell/: 77.8% engagement rate, 55-second average dwell — when someone gets to that page, they read it.

**Page-1 rankings exist for the right tail of brand+city queries.** "rove concepts edmonton" (pos 7.7), "natuzzi edmonton" (pos 8.4), "used furniture edmonton" (pos 9.8), "second hand furniture edmonton" (pos 12.4). These are exactly the queries the niche is built around. The site is on the leaderboard. It just needs more authority to push them into the top 3.

**Technical SEO foundation is strong.** Schema markup is comprehensive (Product, BreadcrumbList, FAQPage, HowTo, Service, Article on guides). Sitemap is auto-generated. Canonical tags, OG tags, mobile viewport, theme-color are all in place. Indexing is fast — pages appear in GSC within days. **This is doing more than most one-person sites do.**

**AI search is showing up.** ChatGPT.com referrals, search.google.com/referral (AI Overview citations), aisearchindex.space — small numbers but the trajectory matters. The kind of long-form, branded, FAQ-anchored content the site publishes is exactly what answer engines lift from. This is a moat being built quietly.

**The contact funnel works once people land.** ~20 contact actions over 144 /sell/ pageviews is roughly a 14% page-to-action rate. For a cold-traffic page with no offer escalation, that's healthy.

---

## What to Do Less Of (or Stop)

**Stop optimizing for "global" brand-review traffic without a path to revenue.** The B&B Italia review pulls impressions from Spain, UAE, Brazil, Korea, etc. — 487 US impressions and 0 clicks in the last 90 days. None of this audience can become a customer. The guides are valuable for domain authority and for AI-search citations, so don't kill them — but don't write more of them in their current form. Either localize them harder (so global traffic self-selects out) or add a path to revenue (see "additional revenue stream" below).

**Stop publishing measurement/dimension guides without a tighter local hook.** "How to measure a sectional sofa Edmonton" is at position 58.6 with zero clicks despite 156 impressions. The "Edmonton" suffix doesn't help an informational query like that — searchers anywhere in the world type "how to measure a sectional," and the SERP is dominated by retailers (Wayfair, IKEA, Article) with massive authority. This is a battle the site can't win and shouldn't fight. Repurpose the article or merge it into a more commercial page.

**Stop relying on the homepage to do the sell-side ranking.** The homepage is positioned reasonably well (pos 12.7) for a mix of branded and local queries. But it's also the page Google is sending sell-intent traffic to instead of /sell/ — because the homepage talks about both buying and selling. Tighten the homepage to be unambiguously about available inventory, and let /sell/ specialize.

---

## Issues Worth Fixing Now (Quick Wins)

1. **Filter the Boardman, OR bot traffic.** 54 sessions in 90 days at 1.85% engagement is materially distorting GA4 numbers. Add a filter in GA4 admin to exclude that data centre's IP range, or set up an internal traffic exclusion. About a 16% inflation on session counts otherwise.

2. **Fix Facebook attribution.** All the `?fbclid=...` URLs are landing in "Direct" because the Facebook traffic is hitting the site without proper UTM tagging. Add UTM parameters (`?utm_source=facebook&utm_medium=social&utm_campaign=...`) to every Facebook post link and every Marketplace listing link that points back to the site. This will reclassify ~half the "direct" traffic into Facebook, which makes the channel mix usable for decision-making.

3. **Verify the form submission tracking is working.** GA4 shows only 1 `form_submit` event in 90 days but 11 `sms_click` events. Either submissions really are this rare (consistent with 9 organic sessions to /sell/) or the event isn't firing reliably. Test a submission and confirm it lands in real-time.

4. **The 404 page has no GA4 tag.** That's documented in CLAUDE.md as intentional, but you can't see how many people are hitting 404s. Add GA4 to /404.html so broken-link issues become visible.

---

## The Single Biggest Lever — /sell/ Positioning

The /sell/ page is showing up for `sell [type] furniture edmonton` queries but at positions 42–63. It does not need a content rewrite. It needs **link equity, internal link signal, and entity coverage** to push it up two or three pages.

Aggressive set of moves, in order of effort vs. impact:

1. **Create a programmatic "Sell [brand] in Edmonton" landing page set.** One page each for the 12–15 brands listed on /sell/ (Natuzzi, B&B Italia, Rove Concepts, EQ3, Crate & Barrel, etc.). Each page should be ~600 words, real, useful: what makes that brand worth buying back, what variants you take, typical price ranges paid, photos of past purchases, link to current inventory of that brand if any. Every one of these pages becomes a node that targets `sell [brand] edmonton` queries (which currently get zero specific landing pages and route to /sell/) and feeds internal link equity into the main /sell/ page. This alone could double sell-side organic traffic in 60 days.

2. **Create a "Sell [piece type] in Edmonton" set.** Sell sectional, sell sofa, sell loveseat, sell leather couch, sell modular sectional, sell sleeper sofa. Same template, different intent. Capture queries like "sell sectional couch edmonton" and "sell my leather sofa" that currently route nowhere specific.

3. **Build a public "What's your sofa worth?" estimator tool.** The /sell/ page already explains the framework (brand × age × condition). Make it interactive. A simple JS calculator that takes brand (dropdown), age (slider), original price, condition (radio) and returns an estimated offer range. Zero backend required — runs client-side. This becomes the most-shared, most-linked, most-cited page on the site within six months. Every "what is my [brand] couch worth" search in Canada becomes an entry point. Also: it dramatically improves the conversion rate of /sell/ because the user has already pre-qualified themselves before they hit the form.

4. **Internal-link audit pointing into /sell/.** Right now the /sell/ page is in the nav, and that's about it. Every guide article should reference /sell/ at least twice — once as "related: sell yours" near the top, once as a CTA at the bottom. Every listing page should have a contextual `If you have one of these, we'd buy it back. /sell/` link. Every sold-archive page should have it. Internal link signal is the cheapest authority you can build, and the /sell/ page is starved for it.

5. **Add a "Recently bought" section to /sell/.** A sliding gallery of the last 8–12 pieces purchased — model name, brand, what you paid (rounded), a photo. This is social proof, schema-friendly content, AND a content engine — it auto-grows as you do more deals. Each entry is a soft testimonial that Google will read as freshness signal on the page.

6. **Get Google reviews showing in SERP.** The credibility strip says "★ 4.9 Rating" — those reviews exist somewhere. Add `LocalBusiness` schema with `aggregateRating` to the homepage and /sell/ if you have ≥5 verified reviews you can cite. Stars in the SERP can lift CTR by 30%+ on commercial queries.

---

## Additional Revenue Stream — The One You're Missing

The clearest unmonetized asset on the site is the **sold archive combined with what you paid + what you sold for**. You already track this in your inventory CSV. Almost no other reseller publishes this data. If you publish it, you do three things at once:

1. **You become the canonical source for "what is a used [brand] [model] worth in Canada."** Every search of that shape — and there are thousands of them across the brands you handle — becomes an entry point to the site. This is exactly the data Google rewards for E-E-A-T (Experience, Expertise, Authority, Trust): first-party, verifiable, specific.

2. **You convert sellers passively.** A homeowner Googling "what is my Natuzzi Editions Pavia sectional worth" lands on a page showing three real recent transactions on similar pieces. The reflexive next click is "sell yours."

3. **You build an actual revenue stream around the data.** A "Premium Sofa Resale Index" — quarterly PDF or web report with category-level depreciation curves, top resold brands, average days-to-sell, neighborhood patterns — has clear value to (a) interior designers pricing client trade-ins, (b) staging companies, (c) brand reps trying to understand secondary-market dynamics, (d) journalists writing about sustainability and furniture. Could be a $49 PDF or a $19/month newsletter. It would take maybe a weekend to launch a v1.

**Other revenue streams worth considering, ranked by realism:**

- **Pickup-and-disposal service for "not a fit" inquiries.** You already get sellers whose pieces don't qualify. Charging $99–$149 to haul away the piece (and donating/recycling on their behalf) turns rejected leads into revenue. The infrastructure already exists — truck, schedule, two storage units. Marginal cost is mostly time. This is not a scaled business but it monetizes leads that currently exit the funnel as zeros.

- **Designer/stager B2B program.** Edmonton has a real interior design community. A "trade tier" — designers get 15% off retail, priority access to incoming inventory, and a buyback program for client trade-ins — could shift a meaningful portion of inventory to a recurring channel. A separate /trade/ landing page with a vetting form. Doesn't need much marketing — 10–15 active designer accounts could materially change winter revenue.

- **Sponsored newsletter.** You already have a Kit signup on every page. Once the list reaches a few hundred Edmonton subscribers genuinely interested in furniture, a single sponsored placement per issue (rug shop, lighting store, mid-tier retailer adjacent but non-competitive) is real income. Doesn't compromise editorial because the niche is so narrow.

- **Affiliate links on global brand reviews.** The B&B Italia and Natuzzi reviews are pulling 487+ US impressions a quarter for queries the site can't otherwise monetize. Adding `rel="sponsored"` affiliate links to relevant retailers (1stDibs, Chairish, Perigold, AllModern) at the bottom of those guides — clearly disclosed — would convert global pass-through traffic into nominal revenue. Not the core play, but free.

- **A geographic clone of the model.** Calgary Refreshed, Vancouver Refreshed, Toronto Refreshed. The site, the playbook, the SEO scaffolding all transfer. This is the biggest possible move and the furthest from current capacity, but worth flagging because the architecture you've built is templatable.

---

## Aggressive 90-Day Action Plan

If you take only the top items from above, here is a sequenced plan that compounds:

**Weeks 1–2 — Foundation cleanup**
- Filter Boardman bot traffic in GA4
- UTM-tag all Facebook outbound links
- Verify form_submit event firing
- Add LocalBusiness + aggregateRating schema to homepage and /sell/
- Audit internal links — add /sell/ link to every guide and every listing page

**Weeks 3–6 — Programmatic /sell/ expansion**
- Build 8 brand-specific /sell-[brand]-edmonton/ landing pages (Natuzzi, B&B Italia, Rove Concepts, EQ3, Crate & Barrel, La-Z-Boy, American Leather, West Elm)
- Build 4 piece-type /sell-[type]-edmonton/ pages (sectional, sofa, leather couch, sleeper)
- Each links into main /sell/ page — and is linked FROM main /sell/ page
- Add "Recently bought" gallery section to /sell/

**Weeks 5–8 — Authority + interactive tool**
- Build "What's your sofa worth?" estimator (client-side JS, ~1 weekend of work)
- Place it prominently on /sell/ and link from every guide
- Begin publishing sold-archive transaction data (model, brand, year sold, price band) — start with the last 20 sold pieces

**Weeks 9–12 — Revenue stream launch**
- Compile first "Premium Sofa Resale Index" report from your inventory CSV
- Launch /trade/ page for designers/stagers
- Add disposal/pickup service offering on /sell/ for "not a fit" leads

**Tracking metrics to watch:**
- /sell/ average GSC position (currently 41.8 — target page 2 within 90 days, page 1 within 6 months)
- Sell-side query impressions (currently ~480/quarter on the top 4 queries — target 2,000)
- Form submits (currently 1/quarter — target 8/quarter)
- Edmonton-area session count (currently 153/quarter — target 400)

---

## Bottom Line

The site is in much better shape than its absolute traffic numbers suggest. It has only existed in Search Console for three months and it is already on page 1 for several of the most valuable queries it could possibly rank for. The technical foundation is unusually good. The conversion mechanics on /sell/ work when traffic arrives.

The constraint is purely one of scale and signal density. The site needs (a) more pages targeting more specific intents, (b) more internal link equity flowing into /sell/, (c) more authoritative content (transaction data, the estimator tool, the resale index), and (d) better attribution so you can see what's actually working. None of this requires changing what the business is. It requires turning the SEO scaffolding from "good for a small site" into "the obvious answer for anyone in Edmonton trying to sell or buy a quality sofa."

The unmissed revenue play is publishing your own transaction data. You are sitting on Edmonton-specific resale information that nobody else has and Google has no other source for. That is rare. Use it.

---

*Audit data pulled via Supermetrics MCP — Google Search Console (`sc-domain:edmonton-refreshed.com`) and GA4 property `Edmonton Refreshed Seating` (526743452). Site code reviewed read-only at /Users/collinbottrell/Desktop/edmonton-refreshed.*
