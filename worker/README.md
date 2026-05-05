# Sell-form Worker

A Cloudflare Worker that receives the sell-page form, validates it, and emails the submission with all attached photos via Resend. Replaces FormSubmit.

## What you'll set up (one-time, ~20 minutes)

1. A free Cloudflare account (Workers free tier — 100k requests/day).
2. A free Resend account (3k emails/month, 40 MB attachments per email).
3. The Wrangler CLI to deploy this Worker.

You don't need to move DNS, change the GitHub Pages site, or run any servers. The Worker lives at `your-worker.<account>.workers.dev` (or a custom subdomain you set later).

## Step 1 — Create a Resend account and grab an API key

1. Go to <https://resend.com> and sign up with `cbottrell1990@gmail.com`.
2. Verify the email.
3. Open **API Keys** → **Create API Key**. Name it `edmonton-refreshed-sell`. Permission: **Sending access**. Copy the key (starts with `re_…`). You'll paste it once below.

For first-time use, **leave domain verification for later.** Resend lets you send emails *to your own signup email* (your Gmail) using their built-in `onboarding@resend.dev` sender — no DNS setup required. That's what `wrangler.toml` is preconfigured for. When you're ready, you can verify `edmonton-refreshed.com` to send from a custom address; that requires adding 3 DNS records.

## Step 2 — Install Wrangler

If you have Node installed:

```bash
npm install -g wrangler
```

If you don't have Node, install it first via <https://nodejs.org> (LTS).

## Step 3 — Configure and deploy

From the repo root:

```bash
cd worker
wrangler login                      # opens browser, log into Cloudflare
wrangler secret put RESEND_API_KEY  # paste the key from step 1 when prompted
wrangler deploy
```

After a successful deploy, Wrangler prints a URL like:

```
https://edmonton-refreshed-sell.<your-subdomain>.workers.dev
```

**Copy that URL.** You'll paste it into the form on the website.

## Step 4 — Point the form at the Worker

Open `sell/index.html` and find the line near the bottom:

```js
var SELL_FORM_ENDPOINT = 'https://edmonton-refreshed-sell.YOUR-SUBDOMAIN.workers.dev/';
```

Replace `https://edmonton-refreshed-sell.YOUR-SUBDOMAIN.workers.dev/` with the URL Wrangler printed. Commit and push — done.

## Step 5 — Test it

Submit the form yourself with 3+ test photos. You should receive an email at `info@edmonton-refreshed.com` (or whatever `TO_EMAIL` is set to in `wrangler.toml`) with all photos as attachments. Reply-to is set to the email the seller provided, so hitting Reply goes straight to them.

If something fails, check Cloudflare's worker log:

```bash
wrangler tail
```

…then submit the form again and watch the logs.

## Editing settings later

- Change destination email or allowed origin: edit `[vars]` in `wrangler.toml`, run `wrangler deploy`.
- Rotate the Resend API key: `wrangler secret put RESEND_API_KEY` again with the new value, then `wrangler deploy`.

## Verifying your domain in Resend (optional, recommended later)

Once the form is working, verify `edmonton-refreshed.com` in Resend so the from-address is `forms@edmonton-refreshed.com` instead of `onboarding@resend.dev`. Resend will give you 3 DNS records to add wherever your DNS lives. After verification, change `FROM_EMAIL` in `wrangler.toml` to your custom address and redeploy.

## Cost

Free for typical traffic. Both Cloudflare Workers and Resend have generous free tiers that cover several hundred form submissions per month with no charge.
