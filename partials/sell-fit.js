/**
 * Buying-rules blocks for sell pages, rendered from config/buy-criteria.js
 * (the single source for what we buy) so a threshold or brand changes once.
 *
 *   renderFitCheck()  — "Before you send photos" (FIT_CHECK markers). Not for
 *                       brand pages: sellers there arrive with the brand.
 *   renderFitLists()  — "Brands we buy" tags + "Not a fit" list (FIT_LISTS
 *                       markers). Brand tags link to their sell page when
 *                       config/taxonomy.js has one, so a new brand page is
 *                       linked from here as soon as it exists. Identical on
 *                       every non-brand sell page: the hub, the piece-type and
 *                       situational pages, /sell/what-we-buy/, and /partners/.
 *                       Never on brand pages (no exclusion language, §5.13).
 *
 * A page's own nuance (where to take a piece we pass on, leather grades)
 * goes in a hand-written note after the FIT_LISTS_END marker, never in the
 * lists: a rule that differs per page is the drift this block exists to stop.
 */
const rules = require('../config/buy-criteria');
const tax = require('../config/taxonomy');

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/’/g, '&rsquo;');
}

function renderFitCheck(indent, hasLists) {
  const i = indent || '      ';
  const yes = rules.weBuy.map(([t, aside]) =>
    `${i}          <li>${esc(t)}${aside ? ` <span>(${esc(aside)})</span>` : ''}</li>`).join('\n');
  const no = rules.noOffers.map((x) => {
    const [t, aside] = Array.isArray(x) ? x : [x, ''];
    return `${i}          <li>${esc(t)}${aside ? ` <span>(${esc(aside)})</span>` : ''}</li>`;
  }).join('\n');
  return [
    `${i}<section class="sell-fitcheck" aria-labelledby="fitcheck-title">`,
    `${i}  <p class="sell-eyebrow" id="fitcheck-title">Before you send photos</p>`,
    `${i}  <div class="sell-fitcheck-cols">`,
    `${i}    <div>`,
    `${i}      <p class="sell-fitcheck-label">We buy pieces that are all of these</p>`,
    `${i}      <ul class="sell-yes">`,
    yes,
    `${i}      </ul>`,
    `${i}    </div>`,
    `${i}    <div>`,
    `${i}      <p class="sell-fitcheck-label">We don&rsquo;t make offers on</p>`,
    `${i}      <ul class="sell-no">`,
    no,
    `${i}      </ul>`,
    `${i}    </div>`,
    `${i}  </div>`,
    `${i}  <p class="sell-fitcheck-foot">` + (hasLists
      ? '<a href="#is-it-a-fit">Full list of brands we buy &darr;</a>'
      : '<a href="/sell/what-we-buy/">Full list of what we buy &rarr;</a>') + '</p>',
    `${i}</section>`,
  ].join('\n').replace(/^( *)          <li>/gm, '$1<li>').replace(/\n(\s*)(<li>)/g, (m, sp, li) => '\n' + i + '        ' + li);
}

// self = the page's own URL ('/sell/sell-designer-furniture/'), so the block
// never links a page to itself.
function renderFitLists(indent, self) {
  const i = indent || '      ';
  const linked = new Set();
  const link = (href, label) => (href === self ? label : `<a href="${href}">${label}</a>`);
  const tags = rules.brandsWeBuy.map(([name, q]) => {
    const page = tax.brands.find((b) => name.toLowerCase().startsWith(b.name.toLowerCase()) && !linked.has(b.slug));
    let label = esc(name);
    if (page) { linked.add(page.slug); label = link(`/sell/${page.slug}/`, label); }
    return `<li>${label}${q ? ` <small>(${esc(q)})</small>` : ''}</li>`;
  }).join('');
  const nf = rules.notAFit.map((t) => `${i}      <li>${esc(t)}</li>`).join('\n');
  return [
    `${i}<div class="sell-fitfull">`,
    `${i}  <div class="sell-fitfull-col">`,
    `${i}    <h3>Brands we buy</h3>`,
    `${i}    <p class="sell-muted">Sofas and sectionals, including ${link('/sell/sell-designer-furniture/', 'designer furniture')}, ideally within ${rules.maxAgeYears} years old, in Good condition or better. Matching chairs and ottomans sold with them are welcome too. Standalone chairs considered selectively for exceptional quality and condition.</p>`,
    `${i}    <ul class="sell-tags">${tags}</ul>`,
    `${i}    <p class="sell-muted">This list isn&rsquo;t exhaustive. We&rsquo;re always open to high-quality pieces from other makers, so if yours isn&rsquo;t here, send photos and we&rsquo;ll take a look.</p>`,
    `${i}  </div>`,
    `${i}  <div class="sell-fitfull-col">`,
    `${i}    <h3>Not a fit</h3>`,
    `${i}    <p class="sell-muted">These don&rsquo;t clear our quality and resale filters. Classifieds and donation remain good options for them.</p>`,
    `${i}    <ul class="sell-xlist">`,
    nf,
    `${i}    </ul>`,
    `${i}  </div>`,
    `${i}</div>`,
  ].join('\n');
}

module.exports = { renderFitCheck, renderFitLists };
