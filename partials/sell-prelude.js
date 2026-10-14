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
 *                              so transport / cleaning / storage / resale
 *                              costs are priced in and the offer lands below
 *                              what a private sale would net (stated plainly
 *                              on purpose; Collin, 2026-10-14). Then what the
 *                              seller gets for that: we handle everything,
 *                              listed so it scans. Pickup speed is "without
 *                              waiting on a buyer", never a timing promise
 *                              (§5.13).
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
    i + '  <p class="sell-form-host">We assess your piece based on brand, age, and condition, and aim to reply the same day.</p>',
    i + '  <p class="sell-form-fit">We primarily purchase higher-quality sofas and sectionals from premium retailers, chosen for their construction, materials, and comfort.</p>',
    i + '</div>',
    // Collapsed by default: the copy is unchanged in force (§5.13), it just no
    // longer sits between the seller and the first field.
    i + '<details class="sell-form-offer">',
    i + '  <summary class="sell-form-offer-label">How our offers work</summary>',
    i + '  <p class="sell-form-offer-body">We buy to resell, so every offer accounts for what it costs us to transport, clean, store, and resell a piece. That means our offer will come in below what a private sale would net you. In return, we handle all of it:</p>',
    i + '  <ul class="sell-form-offer-list">',
    i + '    <li>No listing, no messages, and no strangers from Marketplace coming to your home.</li>',
    i + '    <li>Pickup is scheduled with you once you accept, and it&rsquo;s included in the offer.</li>',
    i + '    <li>Our crew does all the lifting and carries it out, so you don&rsquo;t move a thing.</li>',
    i + '    <li>It&rsquo;s out of your home without waiting on a buyer, and you&rsquo;re paid by cash or e-transfer before it leaves.</li>',
    i + '  </ul>',
    i + '</details>',
  ].join('\n');
}

module.exports = { renderSellPrelude };
