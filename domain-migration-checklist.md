# Domain Migration Checklist — edmonton-refreshed.com → edmontonrefreshed.com

Date: 2026-05-18

The hosting plan changed mid-migration: the site now runs on **Cloudflare Pages** (not GitHub Pages). The Pages project `edmonton-refreshed` is wired to the GitHub repo `CeeBott/edmonton-refreshed` and builds on every push. This document describes the end state for the migration and what each step actually did.

---

## Status at a glance (2026-05-18, fully migrated 2026-05-18 ~23:30 MDT)

- ✅ Code change (URLs, schemas, OG tags, sitemap, canonical links, email addresses, Worker config, CNAME) — done.
- ✅ Both zones (`edmonton-refreshed.com` and `edmontonrefreshed.com`) are on Cloudflare nameservers.
- ✅ `edmontonrefreshed.com` is connected as a custom domain on the Cloudflare Pages project `edmonton-refreshed`. DNS apex is `CNAME → edmonton-refreshed.pages.dev` (Proxied); `www → edmonton-refreshed.pages.dev` (Proxied).
- ✅ 301 redirect rule deployed on the `edmonton-refreshed.com` zone: matches **all incoming requests**, dynamic target `concat("https://edmontonrefreshed.com", http.request.uri.path)`, **preserve query string ✓**, status **301**, place **first** (above the legacy www→apex template rule, which is now redundant).
- ✅ Google Search Console "Change of Address" — done (verified by Collin 2026-05-18).
- ✅ Email forwarding for `info@edmontonrefreshed.com` — done 2026-05-18. Cloudflare Email Routing on the `edmontonrefreshed.com` zone, custom address `info@edmontonrefreshed.com` → destination `cbottrell1990@gmail.com` (Active, destination Verified). The 5 Namecheap `eforward*` MX records and the Namecheap SPF TXT on the apex were deleted; Cloudflare auto-added the 3 `route*.mx.cloudflare.net` MX records, an `_spf.mx.cloudflare.net` SPF TXT on the apex, and a Cloudflare DKIM TXT.
- ✅ Resend verification for `forms@edmontonrefreshed.com` — done 2026-05-18. **Note:** the Resend free tier caps at 1 domain, so the old `edmonton-refreshed.com` (with dash) was deleted from Resend first to free the slot. The new `edmontonrefreshed.com` was added and verified via Resend's Cloudflare Auto-configure (it OAuth'd into the Cloudflare account, then pushed: TXT `resend._domainkey.edmontonrefreshed.com` (DKIM), MX `send.edmontonrefreshed.com → feedback-smtp.us-east-1.amazonses.com` priority 10, TXT `send.edmontonrefreshed.com → v=spf1 include:amazonses.com ~all`). Because Resend uses the `send.` subdomain for its SPF, there is **no SPF conflict** with the apex SPF that Cloudflare Email Routing put on `edmontonrefreshed.com`.
- ✅ Cloudflare Worker `edmonton-refreshed-sell` redeployed 2026-05-18 with the new `wrangler.toml` values (TO_EMAIL, FROM_EMAIL, ALLOWED_ORIGIN all on the no-dash domain). Worker URL unchanged (`edmonton-refreshed-sell.cbottrell1990.workers.dev`). **Note:** the existing `RESEND_API_KEY` secret turned out to be scoped to the old (now-deleted) domain — Resend returned `400 "The associated domain with your API key is not verified"`. Fixed by creating a fresh API key in Resend with **Full access** permission (not "Sending access" scoped to a specific domain) and re-running `npx wrangler secret put RESEND_API_KEY`. After the secret rotation, an end-to-end probe POST succeeded — Worker returned `{"ok":true}` and the email arrived in Gmail (From: `forms@edmontonrefreshed.com`, To: `info@edmontonrefreshed.com`, delivered via Cloudflare Email Routing).
- ✅ Google Analytics data-stream URL update — done 2026-05-18. Stream URL updated to `https://edmontonrefreshed.com`; cross-domain linking configured for both `edmontonrefreshed.com` and `edmonton-refreshed.com`.
- ✅ Kit (ConvertKit) "From" address — `info@edmontonrefreshed.com` confirmed 2026-05-18. After Email Routing went live, Kit's "Resend confirmation" was clicked, the verification email forwarded to Gmail, link clicked, and the address is now **confirmed** in Kit's Email Addresses panel. Default sender unchanged (still `cbottrell1990@gmail.com`); flip the default in Kit when ready.

Verified working with curl:

```
curl -sI https://edmonton-refreshed.com/listings/b-b-italia-charles-sectional-edmonton/
# → HTTP/2 301
# → location: https://edmontonrefreshed.com/listings/b-b-italia-charles-sectional-edmonton/

curl -sI https://www.edmonton-refreshed.com/?utm=test
# → HTTP/2 301
# → location: https://edmontonrefreshed.com/?utm=test   (path + query preserved)
```

---

## 1. DNS — `edmontonrefreshed.com` (done)

The new zone is on Cloudflare nameservers (`donovan.ns.cloudflare.com` + pair). When the domain was connected to the Cloudflare Pages project, Cloudflare auto-replaced the four GitHub-Pages A records (185.199.108–111.153) and the four AAAA records (2606:50c0:8000–3::153) with a single CNAME on the apex pointing at `edmonton-refreshed.pages.dev`. The `www` CNAME was also repointed from the legacy `ceebott.github.io` target to `edmonton-refreshed.pages.dev`. Both records are Proxied (orange cloud).

MX records (`eforward1–5.registrar-servers.net`) and the SPF TXT record (`v=spf1 include:spf.efwd.registrar-servers.net ~all`) were preserved — those handle the Namecheap email forwarding setup.

If MX records ever need to change (e.g., switching to Cloudflare Email Routing or Google Workspace), edit them in the Cloudflare DNS panel for the `edmontonrefreshed.com` zone — not at Namecheap, since the nameservers now point at Cloudflare.

---

## 2. Cloudflare Pages — custom domain (done)

The Pages project `edmonton-refreshed` (account `f00bc71c8884a3b2503e0b919d74143f`, Workers & Pages → edmonton-refreshed → Custom domains) now lists both domains:

- `edmonton-refreshed.com` — **Active**, SSL enabled. Left connected during the transition so the site still resolves there even before the redirect rule propagates.
- `edmontonrefreshed.com` — **Active**, SSL enabled.

The Pages project deploys automatically on push to `main` on the GitHub repo (`CeeBott/edmonton-refreshed`). No manual deploy step is required.

**Cleanup option (do later, not urgent):** once the redirect rule has been live for ~2 weeks and you've confirmed nothing on the old domain is being served directly, you can remove `edmonton-refreshed.com` as a custom domain from the Pages project. The redirect rule fires at the Cloudflare edge before Pages routing, so removing the Pages connection won't break the redirect. Keeping it on costs nothing and gives a fallback path if the redirect rule is ever disabled in error.

---

## 3. 301 redirect — `edmonton-refreshed.com` → `edmontonrefreshed.com` (done)

Deployed on the `edmonton-refreshed.com` zone at Rules → Redirect Rules:

- **Name:** Redirect to edmontonrefreshed.com (no dash)
- **Match:** All incoming requests
- **Type:** Dynamic
- **Expression:** `concat("https://edmontonrefreshed.com", http.request.uri.path)`
- **Status:** 301 (Permanent Redirect)
- **Preserve query string:** ✓
- **Place at:** First (above the legacy "Redirect from WWW to root [Template]" rule)

Because the new rule sits at order 1 and matches every request, the legacy www→apex template rule never fires for traffic to the old domain — it's effectively dead but harmless. Optional cleanup: delete the legacy template rule. It's not required.

**Optional but recommended — Always Use HTTPS:** in the `edmonton-refreshed.com` zone, SSL/TLS → Edge Certificates → **Always Use HTTPS**. Catches stray `http://edmonton-refreshed.com/...` links so users never hit a mixed-protocol redirect chain. Not strictly required since the redirect rule already targets `https://` on the new domain, but it shortens the chain by one hop for HTTP requests.

**Keep the redirect active indefinitely.** Cost is zero. Google's recommendation is "at least a year"; there's no upside to ever removing it.

---

## 4. Google Search Console — Change of Address (done — 2026-05-18)

1. In Search Console, **add `edmontonrefreshed.com` as a new property** (use the Domain property type — covers `https://`, `http://`, `www.`, all subdomains).
2. Verify ownership via DNS TXT record at the registrar — i.e., add it to the Cloudflare DNS panel for the `edmontonrefreshed.com` zone.
3. In the **old** property (`sc-domain:edmonton-refreshed.com`), go to **Settings → Change of address**.
4. Walk through the wizard. It will verify the 301 redirects (already in place per step 3) and that both properties belong to the same owner, then notify Google formally.
5. Submit the new sitemap (`https://edmontonrefreshed.com/sitemap.xml`) in the new property.

Without Change of Address Google still figures it out from the 301s eventually, but the wizard accelerates consolidation of authority from old → new significantly.

**Keep the old Search Console property live for ≥6 months** to monitor migration.

---

## 5. Email — `info@edmontonrefreshed.com` (pending — user task)

The site now displays `info@edmontonrefreshed.com` in the schema, the privacy page, the about page, and listings. No infrastructure exists for that address yet — mail sent to it bounces. Pick one:

- **Cloudflare Email Routing (free, 5 minutes):** Email → Email Routing → add the destination address (your real Gmail), enable the routing rule for `info@edmontonrefreshed.com`. Cloudflare auto-adds the MX + TXT records to the `edmontonrefreshed.com` zone. **This conflicts with the existing Namecheap email forwarding MX records — you'd want to remove those first or you'll have split routing.**
- **Google Workspace ($7.20/month):** Full Gmail on `@edmontonrefreshed.com`. Worth it if you want to *send* from the domain. Provide the MX records they give you.
- **ImprovMX (free):** Similar to Cloudflare Email Routing.

---

## 6. Resend — verify the new domain (pending — user task)

The Cloudflare Worker `edmonton-refreshed-sell` sends sell-form submissions via Resend with `FROM_EMAIL = "Edmonton Refreshed <forms@edmontonrefreshed.com>"`. Resend will reject this until the domain is verified.

1. Log in to Resend → **Domains → Add Domain** → `edmontonrefreshed.com`.
2. Add the 3 DNS records Resend provides (SPF, DKIM, return-path) to the `edmontonrefreshed.com` Cloudflare DNS panel.
3. Wait 10–30 minutes for verification.
4. **Don't redeploy the Worker until verification is green** — otherwise the sell form throws a 502.

Optional safety: temporarily verify both `edmonton-refreshed.com` and `edmontonrefreshed.com` in Resend so cross-domain transitions don't break anything.

---

## 7. Cloudflare Worker — redeploy (pending — user task)

The Worker's `wrangler.toml` is already updated in the repo:

    TO_EMAIL = "info@edmontonrefreshed.com"
    FROM_EMAIL = "Edmonton Refreshed <forms@edmontonrefreshed.com>"
    ALLOWED_ORIGIN = "https://edmontonrefreshed.com"

To deploy (run after Resend verification is green):

    cd worker
    npx wrangler deploy

The Worker deployment name (`edmonton-refreshed-sell`) **does not change** — it stays at `edmonton-refreshed-sell.cbottrell1990.workers.dev`, which is what the browser still POSTs to from `js/sell-form.js`. Only the CORS gate (`ALLOWED_ORIGIN`) and the email addresses change.

---

## 8. Google Analytics — update the data stream (done — 2026-05-18)

GA4 property `Edmonton Refreshed Seating` (526743452). The tag ID (`G-8MN82PPZRZ`) stays the same.

1. GA4 → **Admin → Data Streams → Web stream**.
2. Update the **Stream URL** to `https://edmontonrefreshed.com`.
3. Under **Configure tag settings → Configure your domains**, list both `edmonton-refreshed.com` and `edmontonrefreshed.com` for the transition period.
4. After 6 months, remove the old domain.

---

## 9. Kit (ConvertKit) (partial — pending email confirmation)

Newsletter form `9233085`. The post URL doesn't change.

**Done 2026-05-18:** `info@edmontonrefreshed.com` added as a From address (From name: "Edmonton Refreshed"). Status: **pending confirmation** — Kit sent a confirmation email to that address.

**Remaining:** Once email routing (step 5) is set up, the confirmation email will arrive in your Gmail. Click the link to verify, then click the pencil icon on the row and set it as the default sender. Until then, Kit continues sending from `cbottrell1990@gmail.com`.

If Kit ever asks for sending-domain DNS verification, add the records it gives you to the `edmontonrefreshed.com` Cloudflare DNS panel.

---

## 10. Backlinks (optional, do over time)

The 301 redirects handle this for crawlers automatically. For important destinations (Google Business Profile, Facebook page, Instagram bio, directory listings, press mentions), it's worth manually updating the URL to skip the redirect hop — faster page loads, cleaner analytics. No rush.

---

## What to expect SEO-wise

- **Week 1–2:** Google starts processing the Change of Address. Old URLs still appear in SERPs; clicks redirect via the 301s.
- **Week 3–6:** Google starts swapping indexed URLs from old → new. Expect a short-term ranking dip of 5–15% — normal.
- **Month 2–3:** Rankings stabilize. The new domain inherits the old domain's authority.
- **Month 6+:** Migration fully consolidated.

The biggest predictor of a clean migration is redirect quality. Every old URL must 301 to the same path on the new domain, with no chains and no 404s. The dynamic redirect rule in step 3 satisfies this — verified end-to-end via curl on a deep listing URL.

---

## What I did NOT change

- **The Cloudflare Worker's deployment name (`edmonton-refreshed-sell`)** — it's an internal identifier, not a public URL, no need to rename.
- **The local desktop folder (`/Users/collinbottrell/Desktop/edmonton-refreshed`)** — purely local, doesn't affect anything live.
- **The GitHub repo name (`CeeBott/edmonton-refreshed`)** — Cloudflare Pages is wired to it by name; renaming would force re-establishing the build connection, with no benefit.
- **The GA4 measurement ID (`G-8MN82PPZRZ`)** — same tag, new data stream URL.
- **The CNAME file in the repo root** — it lives at `/Users/collinbottrell/Desktop/edmonton-refreshed/CNAME` and now reads `edmontonrefreshed.com`. GitHub Pages used this file to set its custom domain; Cloudflare Pages ignores it. It's harmless to leave in place and useful if hosting ever moves back.
