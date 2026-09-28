/**
 * Sell-form prelude — the qualification block that sits immediately above
 * every embedded sell form (the hub plus every /sell/[slug]/ landing page).
 *
 * Two stacked panels, one canonical source:
 *
 *   1. .sell-form-prelude    — Collin's photo, the reply-time goal, and the
 *                              fit statement (§5.13). No "send photos anyway"
 *                              invitation: removed 2026-09-27 to make the ask
 *                              feel selective rather than open to anything.
 *   2. .sell-form-offer      — how offers are calculated: we buy to resell,
 *                              so transport / cleaning / storage / remarketing
 *                              costs are priced in, the offer lands below
 *                              what a private sale would net, and the trade
 *                              on offer is certainty rather than top dollar.
 *                              Added because inbound leads carried wildly
 *                              optimistic asking prices. The field that
 *                              collected those numbers has since been removed
 *                              (§10.22), which makes this panel the primary
 *                              place expectations get set — so it matters
 *                              more now, not less.
 *
 * Injected by build.js as an anchored, unmarked rewrite (same class as the
 * aggregateRating sync — §4.3) so the copy exists in exactly one place
 * instead of being hand-copied across 22 pages (§9.3). The prelude div is flat
 * (no nested <div>) because the anchor matches to its first </div>; the offer
 * panel is a <details>, collapsed by default.
 *
 * Per §5.13 pricing restraint: no figures, ranges, or multipliers here.
 */

function renderSellPrelude(indent) {
  var i = indent || '      ';
  return [
    // Flat on purpose: the build's anchor matches this div up to its first
    // </div>, so it must never contain a nested <div>.
    i + '<div class="sell-form-prelude">',
    i + '  <img class="sell-form-host-photo" src="/images/about/collin-bottrell-400w.jpeg" alt="Collin Bottrell" width="56" height="56" loading="lazy">',
    i + '  <p class="sell-form-host"><strong>Collin reviews every submission himself</strong> and aims to reply the same day.</p>',
    i + '  <p class="sell-form-fit">We primarily purchase higher-quality sofas and sectionals from premium retailers, chosen for their construction, materials, and comfort.</p>',
    i + '</div>',
    // Collapsed by default: the copy is unchanged in force (§5.13), it just no
    // longer sits between the seller and the first field.
    i + '<details class="sell-form-offer">',
    i + '  <summary class="sell-form-offer-label">How our offers work</summary>',
    i + '  <p class="sell-form-offer-body">We buy to resell, so every offer factors in what it costs us to transport, clean, store, and remarket a piece. That means our offer will come in below what a private sale would net you. If maximizing price is the priority, a private sale is the better option. What we offer instead is certainty: a firm number, paid before the piece leaves your home, with no listing, no messaging, and no no-shows. If that trade is worth it to you, we&rsquo;re a good option.</p>',
    i + '</details>',
  ].join('\n');
}

module.exports = { renderSellPrelude };
