/**
 * "How it works" — one set of steps for every sell page, rendered both as the
 * visible block and as the HowTo JSON-LD, so the two cannot disagree and the
 * wording changes in one place. Per-page heading, schema name, offer basis,
 * and an optional note come from config/sell-pages.js (howTo).
 *
 * Step 2 states a goal, not a promise, and never implies every submission
 * gets an offer: most are declined (§5.13). No em dashes (house style).
 */
const DEFAULT_BASIS = 'brand, age, and condition';

function steps(meta, formBelow) {
  const basis = meta.basis || DEFAULT_BASIS;
  return [
    ['Send details and photos',
      'Take photos and fill out the form ' + (formBelow ? 'below.' : 'on this page.')],
    ['Get an offer',
      'We aim to reply to every submission the same day we receive it. If your piece is a fit, the offer is based on ' +
        basis + '.' + (meta.note ? ' ' + meta.note : '')],
    ['We handle pickup',
      'Our crew collects it in an enclosed truck, anywhere in the Edmonton area. You’re paid cash or e-transfer before it leaves. You don’t lift a thing.'],
  ];
}

function html(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/’/g, '&rsquo;').replace(/—/g, '&mdash;');
}

function renderHowTo(meta, opts) {
  const o = opts || {};
  const i = o.indent || '      ';
  const h2class = o.v2 ? 'sell-h2' : 'sell-section-heading';
  const items = steps(meta, o.formBelow).map(([t, p], n) => [
    `${i}    <li>`,
    `${i}      <span class="sell-howto-num">${n + 1}</span>`,
    `${i}      <strong>${html(t)}</strong>`,
    `${i}      <p>${html(p)}</p>`,
    `${i}    </li>`,
  ].join('\n')).join('\n');
  return [
    `${i}<section class="sell-howto">`,
    `${i}  <h2 class="${h2class}">${html(meta.heading || 'How it works')}</h2>`,
    `${i}  <ol class="sell-howto-steps">`,
    items,
    `${i}  </ol>`,
    `${i}</section>`,
  ].join('\n');
}

function renderHowToSchema(meta, opts) {
  const o = opts || {};
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: meta.name || 'How to Sell Your Sofa or Sectional in Edmonton',
    description: 'How selling to Edmonton Refreshed works: send details and photos, get an offer if your piece is a fit, and we handle pickup and payment.',
    step: steps(meta, o.formBelow).map(([t, p], n) => ({ '@type': 'HowToStep', position: n + 1, name: t, text: p })),
  };
  return '<script type="application/ld+json">\n  ' + JSON.stringify(schema, null, 2).replace(/\n/g, '\n  ') + '\n  </script>';
}

module.exports = { renderHowTo, renderHowToSchema };
