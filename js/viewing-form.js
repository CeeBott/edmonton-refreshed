// ═══════════════════════════════════════════════════════════
//  VIEWING-REQUEST FORM HANDLER
//
//  Used on every active listing page. Posts a small buyer inquiry
//  (Piece, Name, Phone, optional Message) to the same Cloudflare
//  Worker endpoint as the sell form, tagged `_form=viewing` so the
//  Worker routes it to the instant Telegram ping instead of the
//  sell-lead email path.
//
//  Why a form instead of the old `sms:` link: on desktop an `sms:`
//  CTA is a silent no-op, so most desktop buyers could not reach us.
//  This form works on every device, needs no app from the buyer, and
//  pings Collin instantly with the buyer's number + which piece.
//
//  Spam defenses mirror the sell form (§5.11): a checkbox honeypot
//  (`_honey`) and a page-load timing gate (`_elapsed_ms`), both
//  enforced by the Worker with the same silent-drop contract.
// ═══════════════════════════════════════════════════════════

(function () {
  var ENDPOINT = 'https://edmonton-refreshed-sell.cbottrell1990.workers.dev/';

  // Captured at load so the Worker can reject implausibly fast submissions
  // (naive bots POST in well under a second — see MIN_FORM_FILL_MS).
  var pageLoadedAt = Date.now();

  var form = document.getElementById('viewing-form');
  var success = document.getElementById('viewing-success');
  if (!form) return;

  var submit = form.querySelector('.viewing-submit');
  var errorEl = form.querySelector('.viewing-error');

  function showError(msg) {
    if (!errorEl) return;
    errorEl.textContent = msg || '';
    errorEl.hidden = !msg;
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    showError('');

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    var originalText = submit ? submit.textContent : 'Send';
    if (submit) {
      submit.disabled = true;
      submit.textContent = 'Sending…';
    }

    try {
      var fd = new FormData(form);
      fd.set('Source page', window.location.pathname + window.location.search);
      fd.set('_elapsed_ms', String(Date.now() - pageLoadedAt));

      var res = await fetch(ENDPOINT, { method: 'POST', body: fd });
      var data = {};
      try { data = await res.json(); } catch (_) {}
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Send failed.');
      }

      if (success) {
        success.hidden = false;
        form.hidden = true;
        success.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      if (window.gtag) {
        var pieceField = form.querySelector('[name="Piece"]');
        gtag('event', 'viewing_request_submit', {
          event_category: 'buyer',
          event_label: pieceField && pieceField.value ? pieceField.value : 'unknown'
        });
      }
    } catch (err) {
      showError(err && err.message ? err.message : 'Could not send. Please text us at 780-965-1477.');
      if (submit) {
        submit.disabled = false;
        submit.textContent = originalText;
      }
    }
  });
})();
