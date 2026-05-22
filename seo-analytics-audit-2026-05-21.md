# Edmonton Refreshed — SEO & Analytics Audit

**Audit date:** May 21, 2026
**Period analyzed:** All-time. GSC data runs Feb 13 – May 19, 2026 (the site's full search history). GA4 data runs Jan 1, 2025 – May 20, 2026 (real traffic begins ~Feb 2026).
**Data sources:** Google Search Console and Google Analytics 4, pulled directly from the live consoles. Site code reviewed read-only at `~/Desktop/edmonton-refreshed` — no edits made.
**Prior audit:** This updates the May 9, 2026 audit (`audit-may-2026.md`). Read alongside it; this document corrects two things that have changed since.

---

## Two Things That Reframe Everything

Before the data, two facts that change how every number below should be read.

**1. The lead numbers are not real.** GA4 records 39 "key events" all-time — 21 sell-form submissions, 14 SMS clicks, 5 phone clicks. You've confirmed that most or all of these were tests by you and your family. **Treat confirmed real inbound leads through the website as effectively zero.** The May 9 audit described the contact funnel as "working" based on this same data — that conclusion was built on test events and should be retired. The form plumbing works (the tests prove it end-to-end), but the site has not yet converted a single stranger into a lead. That is the honest baseline.

**2. The domain migration happened three days ago.** On May 18 you moved `edmonton-refreshed.com` → `edmontonrefreshed.com`. There are now two GSC properties. The old one holds the entire search history (57 clicks, 3,020 impressions); the new one has 2 clicks so far. The migration was executed well — clean 301s, query strings preserved, Change of Address filed, GA4 stream updated. But it means a ranking dip of 5–15% over the next 3–6 weeks is normal and expected, and you should not confuse that dip with anything you did wrong.

So: the site is a healthy, fast-growing, technically excellent SEO asset that **has not yet proven it can generate a seller lead.** Everything below serves that one gap.

---

## The Numbers

### Search Console — all-time (old property, `edmonton-refreshed.com`)

| Metric | Value |
|---|---|
| Clicks | 57 |
| Impressions | 3,020 |
| Average CTR | 1.9% |
| Average position | 22.7 |
| Distinct queries | 230 |
| Distinct pages earning impressions | 48 |

Trajectory (from the May 9 audit, still the best monthly view): Feb 56 impressions → Mar 770 → Apr 1,602. Impressions grew ~28× in two months and average position climbed from page 5 to mid–page 3. The trend is genuinely good. The site is young — three months of search history — and behaving like a healthy young niche site.

New property `edmontonrefreshed.com`: 2 clicks, 7 impressions, position 6.6 since May 18. Nothing to read into yet — it will accumulate as Google swaps indexed URLs over.

### Search Console — queries that matter

Queries the site **ranks well for and converts** (buyer intent):

| Query | Clicks | Impressions | CTR | Position |
|---|---|---|---|---|
| used furniture edmonton | 4 | 65 | 6.2% | 11.9 |
| natuzzi edmonton | 3 | 54 | 5.6% | 8.2 |
| second hand furniture edmonton | 2 | 51 | 3.9% | 12.1 |
| consignment furniture edmonton | 2 | 11 | 18.2% | 8.9 |

Queries the site **appears for but is buried on** (seller intent — the business's actual goal):

| Query | Clicks | Impressions | CTR | Position |
|---|---|---|---|---|
| sell used furniture edmonton | 0 | 163 | 0% | 40.8 |
| sell midcentury furniture edmonton | 0 | 142 | 0% | 56.4 |
| sell vintage furniture edmonton | 0 | 92 | 0% | 60.9 |
| vintage furniture buyers edmonton | 0 | 37 | 0% | 66.9 |
| sell used furniture | 0 | 24 | 0% | 65.5 |

This is the single most important pattern in the audit, and it is covered in full in "The Core Problem" below.

### Search Console — top pages

| Page | Clicks | Impressions | CTR | Position |
|---|---|---|---|---|
| `/` (homepage) | 30 | 642 | 4.7% | 12.2 |
| `/sell/` | 8 | 418 | 1.9% | 41.3 |
| `/guides/natuzzi-sofa-review-edmonton/` | 6 | 526 | 1.1% | 11.8 |
| `/sold/` | 3 | 170 | 1.8% | 38.9 |
| `/guides/selling-furniture-before-moving-edmonton/` | 3 | 87 | 3.4% | 36.8 |
| `/guides/edmonton-furniture-consignment-resale-guide/` | 2 | 221 | 0.9% | 35.0 |

The homepage carries the site (53% of all clicks). `/sell/` earns the second-most impressions of any page (418) but sits at position 41 — page 4. Every page in the 20-page sell-landing cluster you've built ranks between position 8 and 67, mostly deep: `/sell/natuzzi-edmonton/` 34.5, `/sell/restoration-hardware-edmonton/` 42.8, `/sell/furniture-consignment-edmonton/` 57.4.

### Search Console — device and country

| Device | Clicks | Impressions | CTR |
|---|---|---|---|
| Mobile | 38 | 1,290 | 2.9% |
| Desktop | 18 | 1,679 | 1.1% |
| Tablet | 1 | 52 | 1.9% |

Mobile earns **more than twice the clicks of desktop on fewer impressions** — mobile CTR is ~2.6× desktop. Sellers searching "sell my couch" do it on their phones. Mobile-first is the correct instinct and it is paying off.

Country: Canada 54 clicks / 2,150 impressions; United States 1 click / 514 impressions; everyone else negligible. Roughly **17% of your impressions are US traffic that will never convert** — it inflates the impression count and depresses the headline CTR. Your effective CTR on relevant Canadian queries is meaningfully better than the 1.9% the dashboard shows.

### Search Console — search appearance

Only one rich-result type is firing: **Product snippets** (2 clicks, 43 impressions). Despite the site's heavy investment in FAQPage, Review, and Breadcrumb schema, none of those are producing a distinct search appearance. FAQ rich results were largely deprecated by Google in 2023 for non-authoritative sites, so that is expected — but it means the schema work is currently an AI-citation and future-proofing play, not a visible-CTR play. Don't expect stars or FAQ accordions in the SERP from it.

### GA4 — all-time (property: Edmonton Refreshed Seating)

| Metric | Value |
|---|---|
| Sessions | 518 |
| Users | 315 |
| Engaged sessions | 240 |
| Engagement rate | 46.3% |
| Avg engagement time / session | 48 sec |
| Tracked revenue | $0 (no ecommerce — expected) |
| Key events | 39 (test data — see above) |

Channel mix:

| Channel | Sessions | Share | Engagement rate |
|---|---|---|---|
| Direct | 357 | 68.9% | 41.2% |
| Organic Search | 112 | 21.6% | 62.5% |
| Referral | 20 | 3.9% | 80.0% |
| Organic Social | 18 | 3.5% | 16.7% |
| Unassigned | 11 | 2.1% | 36.4% |

Events all-time: page_view 1,676 · user_engagement 1,122 · session_start 522 · scroll 454 · first_visit 316 · form_start 28 (10 users) · sell_form_submit 21 (8 users) · sms_click 14 (6 users) · phone_click 5 (3 users) · form_submit 4 · email_click 3 · click 1.

Landing pages: `/` took 67% of all sessions; `/sell` took 8% (42 sessions). One row — `(not set)`, 23 sessions at 0 seconds engagement — is almost certainly bot traffic, consistent with the Boardman, OR data-centre traffic the May 9 audit flagged. It has not been filtered out yet.

---

## The Core Problem: You Rank as a Buyer's Site, Not a Seller's Site

The business goal is inbound seller leads. The data shows the site is doing the opposite of that.

The queries the site **ranks well for** are buyer queries — "used furniture edmonton" (pos 11.9), "natuzzi edmonton" (8.2), "second hand furniture edmonton" (12.1), "consignment furniture edmonton" (8.9). These are people who want to *buy* a sofa. They sit on page 1–2 and they earn the clicks.

The queries the site **needs** to rank for are seller queries — and they are all buried:

- "sell used furniture edmonton" — **163 impressions, position 40.8.** That is 163 separate times a person in Edmonton typed a phrase that means "I want to sell furniture," your site appeared, and it was on page 4 where nobody scrolls.
- "sell midcentury furniture edmonton" — 142 impressions, position 56.
- "sell vintage furniture edmonton" — 92 impressions, position 61.
- "vintage furniture buyers edmonton" — 37 impressions, position 67.

Add those up: **well over 400 seller-intent impressions, zero clicks.** The demand exists. Edmontonians are actively searching to sell furniture. The site is even appearing for them. It is just appearing four to seven pages deep, which is functionally invisible.

This is why the site has produced no real leads. It is not a conversion problem — `/sell/` converts fine when someone reaches it (the May 9 audit measured a strong page-to-action rate, and GA4 shows `/sell` landings convert at 11.9% vs. the homepage's 4.6%). It is a **traffic problem at the top of the funnel.** Not enough of the right people are reaching the right page, because the right page is on page 4.

Everything in the action plan exists to fix that one thing.

---

## What's Going Well — Keep Doing It

**The growth trajectory is real.** 28× impression growth in two months, average position climbing from page 5 toward page 3, clicks rising in absolute terms. For a three-month-old niche site this is a healthy curve.

**Brand-anchored guides are the site's strongest content format.** `/guides/natuzzi-sofa-review-edmonton/` has 526 impressions at position 11.8 — knocking on page 1. The B&B Italia and Rove Concepts reviews rank on page 1 (positions 8.1 and 8.7). The pattern is consistent: "[brand] + Edmonton" review content works. The rove-concepts guide pulled a 5m 33s average engagement time in GA4 — people read it cover to cover.

**The technical foundation is excellent — better than most one-person sites.** Comprehensive schema, auto-generated sitemap with image children, content-hash cache-busting, partial-injection architecture, clean canonical/OG tags, fast indexing. The `CLAUDE.md` operating manual is genuinely rare discipline. None of this needs fixing.

**The migration was done right.** Clean 301s verified end-to-end, query strings preserved, Change of Address filed, GA4 and email infrastructure all updated. This is the highest-risk thing you can do to a site and it was executed properly.

**Mobile experience is converting.** 2.6× the desktop CTR. Whatever the mobile site is doing, keep it.

**Organic Search is your highest-quality channel.** 62.5% engagement rate and 1m 08s average — well above site average. It is currently your smallest meaningful channel (112 sessions) but the most qualified. That is the channel to grow.

---

## What to Do Less Of

**Stop treating the contact-funnel numbers as evidence of anything.** Until real leads flow, the key-event count is noise. Run one final clean test, then leave the form alone and watch for *real* submissions arriving in your inbox.

**Stop writing generic measurement/dimension guides.** "How to measure a sectional sofa" sits at position 57 with 64 impressions and zero clicks. That SERP is owned by Wayfair, IKEA, and Article — national retailers with authority you cannot out-rank, and the "Edmonton" suffix doesn't help an informational query nobody localizes. These guides spend effort on a fight that can't be won.

**Stop letting the homepage absorb seller intent.** The homepage ranks position 12 for a blend of buyer *and* seller queries, which means Google sends some sell-intent traffic to the homepage instead of `/sell/`. The homepage talks about both sides. The more it specializes toward "available inventory," the more cleanly Google routes sellers to the page built for them.

**Don't chase the US/global brand-review traffic as traffic.** 514 US impressions, 1 click. That audience cannot become a customer. The guides are still worth keeping for domain authority and AI citations — but don't measure them by impressions, and don't write more of them to chase that volume.

---

## What to Do More Of

**More brand-anchored, Edmonton-localized guides** — the one content format with proven traction. But every new one needs a conversion path built in (see action plan).

**More internal links into `/sell/` and the sell-landing cluster.** This is the cheapest authority you can build and the cluster is starved for it. Every guide and every listing page should link into the relevant sell page.

**More of the sell-landing cluster concept** — you've already built 20 of these pages, which was the top recommendation of the May 9 audit. Good. They just need time and link equity to rank. Don't abandon them because they're at position 40 today; they're weeks old.

---

## The Migration — Status and What to Monitor

The migration is done and done well. Your job for the next six weeks is mostly to *not interfere* with it and to watch the right dials.

- **Expect a dip.** Weeks 3–6 post-migration, a 5–15% ranking wobble is normal as Google swaps indexed URLs. Do not react to it.
- **Keep both GSC properties.** The old `edmonton-refreshed.com` property holds all your history — keep it live at least six months to monitor the handover.
- **Watch the new property's index coverage.** Over the next 2–4 weeks, impressions should migrate from the old property to the new one. If the new property is *not* climbing while the old one falls, that's the one signal worth investigating.
- **Filter bot traffic now** (it's migration-independent and overdue): the Boardman, OR / `(not set)` data-centre sessions are inflating GA4 by a meaningful margin. Add an internal/developer traffic filter in GA4 Admin so you can trust the session counts.
- **One caution:** avoid large structural or content changes for ~3–4 weeks. You want the migration to be the only variable Google is digesting. The internal-linking and estimator work below is low-risk and fine to proceed with; a homepage rewrite or URL changes are not.

---

## Aggressive Actions — Taking the Site to the Next Level

The May 9 audit's headline recommendation — build a sell-landing cluster — you executed. The next tier of moves, in priority order:

**1. Flood the sell cluster with internal links.** Right now `/sell/` is reachable mainly from the nav. It needs link signal. Every one of the 26 guide articles should link to `/sell/` or the most relevant sell-landing page twice — once near the top ("thinking of selling one of these? →"), once as a closing CTA. Every listing page should carry a contextual "we buy these back" link. Every sold-archive entry too. This is zero-cost, low-risk, migration-safe, and it is the fastest way to lift the cluster off page 4. **Do this first.**

**2. Build the "What's your sofa worth?" estimator.** This was recommended May 9 and still doesn't exist — it is the highest-leverage single asset the site could add. A client-side JS tool: brand dropdown, age, original price, condition → estimated offer range, using the depreciation framework you already operate by. It does four things at once: (a) ranks for the large cluster of "[brand] value / what is my couch worth / used furniture values" queries already showing in your data; (b) pre-qualifies sellers before they hit the form, lifting conversion; (c) becomes the most link-worthy and AI-citable page on the site; (d) gives you a lead magnet — "get your estimate" is a softer ask than "upload photos." One weekend of work, no backend.

**3. Publish your transaction data.** You track what you paid and what you sold each piece for. Almost no reseller publishes this. A "what this sold for in Edmonton" dataset — even rounded bands — makes you the canonical answer for "what is a used [brand] [model] worth in Canada," a query shape with thousands of variants and no good first-party source. It is exactly the first-party, verifiable, specific content Google's E-E-A-T rewards, and every such search becomes a seller entry point.

**4. Add a "Recently Bought" gallery to `/sell/`.** A rolling strip of the last 8–12 pieces purchased — brand, model, rounded price paid, photo. It is social proof, it is a freshness signal Google reads on every crawl, and it grows itself as you do deals. The architecture for sold cards already exists.

**5. Fix Facebook attribution.** A large share of your 357 "Direct" sessions is Facebook traffic landing without UTM tags (the May 9 audit found `?fbclid=` URLs misclassified). UTM-tag every link you post from Facebook and every Marketplace listing that points to the site. This won't add traffic, but it will let you *see* which channel actually works — and right now you're flying blind on your single biggest channel.

**The one priority, if you do nothing else:** items 1 and 2. Internal links into the sell cluster, and the estimator tool. Both are migration-safe, both directly attack the page-4 problem, and together they are the realistic path to the site's first real seller lead. Shelve everything else until those two ship.

---

## Missed Opportunities

**Set realistic expectations for the site as a lead channel.** SEO for a three-month-old site mid-migration is a 3–6 month payoff, not a 3-week one. The site will likely not produce meaningful inbound seller leads until late summer at the earliest, and only if the sell cluster ranks. Facebook Marketplace remains your real lead channel today — the site's current job is to be the *credibility and closing tool* for those FB leads (send sellers to `/sell/` and `/sold/` to see you're legitimate) while it compounds as an SEO asset in the background. Treating the site as a live lead source today and being disappointed would be the wrong read; treating it as an asset 90 days from maturity is the right one.

**Guides convert nothing — and that's a fixable miss.** Your guides earn impressions and deep engagement (5+ minutes on the Rove Concepts review) but drove **zero key events** in GA4. A reader spending five minutes on a sofa-brand review is a perfect seller or buyer prospect, and the page currently gives them nowhere obvious to go. Every guide needs a real conversion path — not just a footer link, but a mid-article callout tied to the topic.

**The `rove concepts edmonton` CTR hole.** 102 impressions, position 7.8, **zero clicks.** A page-1 ranking earning no clicks usually means a title/snippet mismatch with intent — someone searching "rove concepts edmonton" likely wants the Rove Concepts brand, and your snippet isn't pulling them. Worth a manual look at what page is ranking and how its title reads; some of this intent is unwinnable, but a page-1 zero-click result is worth ten minutes.

**AI search is a quiet opening.** The May 9 audit noted ChatGPT and AI-Overview referrals appearing. Your long-form, FAQ-anchored, brand-specific content is exactly what answer engines lift. This is a moat being built passively — the estimator and transaction data would accelerate it sharply, because structured first-party data is what AI engines cite.

---

## An Additional Revenue Stream Worth Considering

The clearest unmonetized asset is your **first-party resale data** — what you pay, what you sell for, how fast. The May 9 audit covered an "Edmonton Sofa Resale Index" report and a few other ideas; those still stand. One idea worth adding, because it fits the business's stated direction and solves a real constraint:

**A consignment / brokered-sale tier for pieces you can't buy outright.** Today, a seller whose piece is good but doesn't fit your capital position (you're HELOC-funded and deliberately inventory-thin) gets a "not a fit" — a lead that exits as a zero. Instead, offer to *broker* the sale: list and sell the piece through your channels and credibility for a percentage, without buying it or drawing on the HELOC. This monetizes the middle of your rejected-lead pile (the genuinely good pieces, not just the junk), requires no inventory capital, uses your existing audience and trust, and is consistent with the "facilitator / curation systems" direction the operating manual already names as acceptable. It also gives the `/sell/` page a second, lower-commitment path — "we'll buy it, or we'll sell it for you" — which is itself a conversion-rate lift.

Lower-effort companions, both monetizing leads that currently exit as zeros: a **paid haul-away/disposal service** ($99–$149) for pieces that truly don't qualify, using the truck and storage you already have; and, longer-term, a **designer/stager B2B trade program** — a `/trade/` page and vetting form — which is the most credible lever against the November–December revenue dead zone, since designer demand isn't seasonal the way consumer demand is.

These are ideas to weigh, not recommendations to act on this week — the strategic direction in `CLAUDE.md` is yours to set. They're flagged because the data shows you're generating rejected leads and reaching an audience you currently can't monetize.

---

## Prioritized Action Plan

**This week — safe, do now (migration-independent):**

1. Add a GA4 internal-traffic filter to remove the Boardman/data-centre bot sessions.
2. Run one clean end-to-end form test, document it, then stop testing — so the next submission you see is real.
3. UTM-tag every Facebook and Marketplace link pointing to the site.
4. Manually check the `rove concepts edmonton` page title/snippet for the zero-click issue.

**Weeks 1–3 — the core fix:**

5. Internal-link audit: every guide and every listing page links into `/sell/` or the relevant sell-landing page, twice.
6. Add a topic-matched conversion callout to the body of every guide (not just a footer link).

**Weeks 2–5 — the leverage assets:**

7. Build and ship the "What's your sofa worth?" estimator; place it on `/sell/` and link it from every guide.
8. Add the "Recently Bought" gallery to `/sell/`.
9. Begin publishing rounded transaction data, starting with the last 20 sold pieces.

**Ongoing — monitor, don't react:**

10. Watch the new GSC property's impressions climb as the old one's fall. Expect a 5–15% dip weeks 3–6 and don't touch anything because of it.

**Metrics to watch (replace the contaminated lead numbers with these):**

- `/sell/` average GSC position — currently 41.3; target page 2 (≤20) within 90 days.
- Combined impressions on the top seller queries — currently 400+; target 1,500+.
- Organic Search sessions — currently 112 all-time; target 100+ per month.
- **Real, confirmed seller leads arriving in your inbox** — currently 0; target the first one within 60–90 days.

---

## Bottom Line

The site is a well-built, fast-growing, technically excellent SEO asset that has not yet done its one job: produce a seller lead. That sounds harsh, but the cause is precise and fixable — the site ranks on page 1 as a place to *buy* furniture and on page 4 as a place to *sell* it, and the business needs the opposite. The seller demand is provably there (400+ seller-intent impressions sitting unclicked). The sell-landing cluster to capture it is already built. What's missing is the link equity and the on-page assets — internal links and the estimator tool — to push that cluster from page 4 to page 1, plus the patience to let a three-month-old site mid-migration mature.

Do the internal linking and build the estimator. Filter the bots, fix Facebook attribution, and stop reading the test data as if it were real. Then give it 90 days. The trajectory says it will work.

---

*Audit data pulled May 21, 2026 directly from Google Search Console (properties `sc-domain:edmonton-refreshed.com` and `sc-domain:edmontonrefreshed.com`) and GA4 property "Edmonton Refreshed Seating" (526743452). Supermetrics was the intended data path but its free trial expired May 18, 2026, so the consoles were read directly. Site code reviewed read-only; no edits made.*

Sources:
- [Google Search Console — edmonton-refreshed.com](https://search.google.com/search-console/performance/search-analytics?resource_id=sc-domain:edmonton-refreshed.com)
- [Google Analytics 4 — Edmonton Refreshed Seating](https://analytics.google.com/analytics/web/#/p526743452/reports/intelligenthome)
