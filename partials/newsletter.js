/**
 * Newsletter sign-up note — the two lines under every Kit sign-up form:
 *
 *   1. .newsletter-consent — who is asking, how to reach them, and that the
 *      subscriber can withdraw. CASL requires all three in every request for
 *      consent, plus a mailing address (§5.21). site.mailingAddress renders
 *      here once it is set; until then double opt-in stays on in Kit.
 *   2. .newsletter-success — shown by js/shared.js after a submit. Its wording
 *      follows site.newsletter.doubleOptIn, which must match the form's
 *      "Send confirmation email" setting in Kit.
 *
 * Injected by build.js as an anchored, unmarked rewrite (same class as the
 * sell-form prelude, §4.3) so the copy lives here once instead of in a
 * hand-copied block on every page (§9.3). Headings stay per page so sold
 * stubs can name the piece; every heading promises new arrivals (§5.21).
 *
 * The email is plain text, not a mailto: link — shared.js counts mailto
 * clicks as the email_click key event, and a footnote must not inflate it.
 */
const site = require('../config/site');

function renderNewsletterNote(indent) {
  var i = indent || '        ';
  var parts = [site.brandName];
  if (site.mailingAddress) parts.push(site.mailingAddress);
  parts.push(site.email);
  var success = site.newsletter.doubleOptIn
    ? 'Thanks! Check your junk folder for your confirmation email.'
    : 'Thanks! You&rsquo;re on the list.';
  return [
    // Identity on one line, the withdrawal statement on its own, so a phone
    // never wraps mid-thought. &nbsp; keeps a separator off a line start.
    i + '<p class="newsletter-consent">' + parts.join('&nbsp;&middot; ') + ' <span class="newsletter-consent-optout">You can unsubscribe at any time.</span></p>',
    i + '<p class="newsletter-success">' + success + '</p>',
  ].join('\n');
}

module.exports = { renderNewsletterNote };
