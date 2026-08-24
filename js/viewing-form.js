// ═══════════════════════════════════════════════════════════
//  VIEWING-REQUEST FORM HANDLER
//
//  Used on every active listing page. Posts a small buyer inquiry
//  (Piece, Name, Phone and/or Email, optional Message) to the same
//  Cloudflare Worker endpoint as the sell form, tagged `_form=viewing`
//  so the Worker routes it to the viewing-request email instead of the
//  photo-bearing sell-lead path.
//
//  Contact rule: Phone and Email are each optional, but at least one
//  must be filled, and anything that IS filled must parse. All of that
//  is enforced here with inline, per-field messages (the form carries
//  `novalidate`, so browser bubbles never fight our own copy) and again
//  in the Worker, so a tampered or scripted client still gets a real
//  error rather than a silently dropped lead.
//
//  Why a form instead of the old `sms:` link: on desktop an `sms:`
//  CTA is a silent no-op, so most desktop buyers could not reach us.
//  This form works on every device, needs no app from the buyer, and
//  emails Collin the buyer's number + which piece.
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

  var nameField = form.querySelector('#vf-name');
  var phoneField = form.querySelector('#vf-phone');
  var emailField = form.querySelector('#vf-email');
  var nameError = form.querySelector('#vf-name-error');
  var phoneError = form.querySelector('#vf-phone-error');
  var emailError = form.querySelector('#vf-email-error');
  var contactError = form.querySelector('#vf-contact-error');

  // Deliberately permissive: an address only has to look like one. Stricter
  // patterns reject valid real-world addresses, and the point is to catch
  // typos, not to police RFC 5322.
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;

  function val(el) { return el && el.value ? el.value.trim() : ''; }

  function setFieldError(input, el, msg) {
    if (el) {
      el.textContent = msg || '';
      el.hidden = !msg;
    }
    if (input) {
      if (msg) {
        input.setAttribute('aria-invalid', 'true');
        input.classList.add('is-invalid');
      } else {
        input.removeAttribute('aria-invalid');
        input.classList.remove('is-invalid');
      }
    }
  }

  function showError(msg) {
    if (!errorEl) return;
    errorEl.textContent = msg || '';
    errorEl.hidden = !msg;
  }

  function clearFieldErrors() {
    setFieldError(nameField, nameError, '');
    setFieldError(phoneField, phoneError, '');
    setFieldError(emailField, emailError, '');
    if (contactError) {
      contactError.textContent = '';
      contactError.hidden = true;
    }
  }

  function emailIsValid(v) {
    return EMAIL_RE.test(v);
  }

  // Accepts the ways people actually type numbers — 7809651477,
  // 780-965-1477, (780) 965-1477, 1 780 965 1477, +1 780.965.1477 — and
  // rejects letters, stray symbols, and wrong-length digit runs. A leading
  // "+" opens it up to international numbers (E.164 tops out at 15 digits).
  function phoneIsValid(v) {
    if (!/^\+?[0-9\s().-]+$/.test(v)) return false;
    var digits = v.replace(/\D/g, '');
    if (v.charAt(0) === '+') return digits.length >= 8 && digits.length <= 15;
    if (digits.length === 11) return digits.charAt(0) === '1';
    return digits.length === 10;
  }

  // Returns the first invalid input so we can focus it, or null when clean.
  function validate() {
    clearFieldErrors();

    var name = val(nameField);
    var phone = val(phoneField);
    var email = val(emailField);
    var firstBad = null;

    if (!name) {
      setFieldError(nameField, nameError, 'Please enter your name.');
      firstBad = firstBad || nameField;
    }

    if (!phone && !email) {
      if (contactError) {
        contactError.textContent = 'Please add a phone number or an email so we can get back to you.';
        contactError.hidden = false;
      }
      setFieldError(phoneField, null, ' ');
      setFieldError(emailField, null, ' ');
      firstBad = firstBad || phoneField;
    } else {
      if (phone && !phoneIsValid(phone)) {
        setFieldError(phoneField, phoneError, 'Enter a valid phone number, like 780-965-1477.');
        firstBad = firstBad || phoneField;
      }
      if (email && !emailIsValid(email)) {
        setFieldError(emailField, emailError, 'Enter a valid email, like you@example.com.');
        firstBad = firstBad || emailField;
      }
    }

    return firstBad;
  }

  // Clear a field's error as soon as the visitor starts fixing it, so the
  // message reads as guidance rather than a verdict that sticks.
  [nameField, phoneField, emailField].forEach(function (input) {
    if (!input) return;
    input.addEventListener('input', function () {
      setFieldError(input, input === nameField ? nameError : (input === phoneField ? phoneError : emailError), '');
      if (contactError && !contactError.hidden && (val(phoneField) || val(emailField))) {
        contactError.textContent = '';
        contactError.hidden = true;
        setFieldError(phoneField, null, '');
        setFieldError(emailField, null, '');
      }
    });
  });

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    showError('');

    var firstBad = validate();
    if (firstBad) {
      if (firstBad.focus) firstBad.focus();
      return;
    }

    var originalText = submit ? submit.textContent : 'Send';
    if (submit) {
      submit.disabled = true;
      submit.textContent = 'Sending…';
    }

    try {
      var fd = new FormData(form);
      if (!val(phoneField)) fd.delete('Phone');
      if (!val(emailField)) fd.delete('Email');
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
