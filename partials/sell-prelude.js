/**
 * Sell-form prelude — the qualification block that sits immediately above
 * every embedded sell form (the hub plus every /sell/[slug]/ landing page).
 *
 * Two stacked panels, one canonical source:
 *
 *   1. .sell-form-prelude    — the mandatory verbatim fit statement (§5.13).
 *   2. .sell-form-offer      — how offers are calculated: we buy to resell,
 *                              so transport / cleaning / storage / remarketing
 *                              costs are priced in, the offer lands below
 *                              what a private sale would net, and the trade
 *                              on offer is certainty rather than top dollar.
 *                              Sets the
 *                              seller's expectation BEFORE the "What are you
 *                              hoping to get?" field, which was drawing wildly
 *                              optimistic numbers.
 *
 * Injected by build.js as an anchored, unmarked rewrite (same class as the
 * aggregateRating sync — §4.3) so the copy exists in exactly one place
 * instead of being hand-copied across 22 pages (§9.3). Both panels are flat
 * — no nested <div> — because the anchor matches to the first </div>.
 *
 * Per §5.13 pricing restraint: no figures, ranges, or multipliers here.
 */

function renderSellPrelude(indent) {
  var i = indent || '      ';
  return [
    i + '<div class="sell-form-prelude">We primarily purchase higher-quality sofas and sectionals from design-oriented and premium retailers. If you&rsquo;re unsure whether your piece is a fit, send photos anyway &mdash; we&rsquo;re happy to take a look.</div>',
    '',
    i + '<div class="sell-form-offer">',
    i + '  <p class="sell-form-offer-label">How our offers work</p>',
    i + '  <p class="sell-form-offer-body">We buy to resell, so every offer factors in what it costs us to transport, clean, store, and remarket a piece. That means our offer will come in below what a private sale would net you &mdash; if maximizing price is the priority, a private sale is the better option. What we offer instead is certainty: a firm number today, paid before the piece leaves your home, with no listing, no messaging, and no no-shows. If that trade is worth it to you, we&rsquo;re a good option.</p>',
    i + '</div>',
  ].join('\n');
}

module.exports = { renderSellPrelude };
