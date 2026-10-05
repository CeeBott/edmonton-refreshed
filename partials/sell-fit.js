/**
 * Buying-rules blocks for sell pages, rendered from config/buy-criteria.js
 * (the single source for what we buy) so a threshold or brand changes once.
 *
 *   renderFitCheck()  — "Before you send photos" (FIT_CHECK markers). Not for
 *                       brand pages: sellers there arrive with the brand.
 *   renderFitLists()  — "Brands we buy" tags + "Not a fit" list (FIT_LISTS
 *                       markers). Brand tags link to their sell page when
 *                       config/taxonomy.js has one, so a new brand page is
 *                       linked from here as soon as it exists.
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
  const no = rules.noOffers.map((t) => `${i}          <li>${esc(t)}</li>`).join('\n');
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

function renderFitLists(indent) {
  const i = indent || '      ';
  const linked = new Set();
  const tags = rules.brandsWeBuy.map(([name, q]) => {
    const page = tax.brands.find((b) => name.toLowerCase().startsWith(b.name.toLowerCase()) && !linked.has(b.slug));
    let label = esc(name);
    if (page) { linked.add(page.slug); label = `<a href="/sell/${page.slug}/">${label}</a>`; }
    return `<li>${label}${q ? ` <small>(${esc(q)})</small>` : ''}</li>`;
  }).join('');
  const nf = rules.notAFit.map((t) => `${i}      <li>${esc(t)}</li>`).join('\n');
  return [
    `${i}<div class="sell-fitfull">`,
    `${i}  <div class="sell-fitfull-col">`,
    `${i}    <h3>Brands we buy</h3>`,
    `${i}    <p class="sell-muted">Sofas and sectionals, including <a href="/sell/sell-designer-furniture/">designer furniture</a>, ideally within ${rules.maxAgeYears} years old, in Good condition or better.</p>`,
    `${i}    <ul class="sell-tags">${tags}</ul>`,
    `${i}    <p class="sell-muted">This list isn&rsquo;t exhaustive. We&rsquo;re always open to high-quality pieces from other makers, so if yours isn&rsquo;t here, send photos and we&rsquo;ll take a look.</p>`,
    `${i}  </div>`,
    `${i}  <div class="sell-fitfull-col">`,
    `${i}    <h3>Not a fit</h3>`,
    `${i}    <p class="sell-muted">These don&rsquo;t clear our quality and resale filters. Classifieds remain an excellent option for them.</p>`,
    `${i}    <ul class="sell-xlist">`,
    nf,
    `${i}    </ul>`,
    `${i}  </div>`,
    `${i}</div>`,
  ].join('\n');
}

module.exports = { renderFitCheck, renderFitLists };
