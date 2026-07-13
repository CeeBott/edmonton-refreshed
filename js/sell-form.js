// ═══════════════════════════════════════════════════════════
//  SELL FORM HANDLER
//
//  Used on /sell/ and every /sell/[slug]-edmonton/ landing page.
//  Posts a multipart form (Brand, Age, Asking price, Name, Contact,
//  Notes, 1–5 photos) to the Cloudflare Worker endpoint.
//
//  The form's "Brand" field can be pre-filled by setting its
//  value in HTML — that's how the brand-specific landing pages
//  pass context to the dispatcher (e.g. "Natuzzi", "Rove Concepts").
// ═══════════════════════════════════════════════════════════

(function () {
  var SELL_FORM_ENDPOINT = 'https://edmonton-refreshed-sell.cbottrell1990.workers.dev/';
  var MIN_PHOTOS = 1;
  var MAX_PHOTOS = 5;
  // 18 MB raw — Cloudflare Email Routing forwards messages up to 25 MB
  // on-the-wire, and base64-encoded attachments expand by 4/3. Anything
  // under 18 MB raw stays comfortably below the 25 MB email ceiling.
  // Photos are compressed in-browser before this check runs (see
  // compressImage), so the cap should essentially never fire in practice;
  // it exists to catch the rare case where compression fails on every file.
  var MAX_TOTAL_BYTES = 18 * 1024 * 1024;
  // Compression targets — 1600px on the long edge, JPEG quality 0.82.
  // A typical 4 MB phone photo lands around 250–400 KB at these settings.
  var COMPRESS_MAX_DIM = 1600;
  var COMPRESS_QUALITY = 0.82;

  // Captured at script load so the worker can reject submissions that arrive
  // implausibly fast (naive bots that POST in well under a second).
  var pageLoadedAt = Date.now();

  var form = document.getElementById('sell-form');
  var success = document.getElementById('sell-form-success');
  if (!form) return;

  // Asking price (optional) — format the value as CAD dollars as the seller
  // types, so "400" displays as "$400". Digits only; no cents.
  var priceInput = document.getElementById('sf-price');
  if (priceInput) {
    var formatPrice = function () {
      var digits = priceInput.value.replace(/[^0-9]/g, '');
      if (!digits) { priceInput.value = ''; return; }
      priceInput.value = '$' + Number(digits).toLocaleString('en-CA');
    };
    priceInput.addEventListener('input', formatPrice);
    priceInput.addEventListener('blur', formatPrice);
  }

  var photosInput = document.getElementById('sf-photos');
  var photosAdd = document.getElementById('sf-photos-add');
  var photosList = document.getElementById('sf-photos-list');
  var photosCount = document.getElementById('sf-photos-count');
  var photosErr = document.getElementById('sf-photos-error');
  var submit = form.querySelector('.sell-form-submit');

  var selectedPhotos = [];
  var objectUrls = [];

  function fmtSize(bytes) {
    if (bytes >= 1024 * 1024) return (bytes / 1024 / 1024).toFixed(1) + ' MB';
    return Math.max(1, Math.round(bytes / 1024)) + ' KB';
  }

  function totalBytes() {
    var t = 0;
    for (var i = 0; i < selectedPhotos.length; i++) t += selectedPhotos[i].size;
    return t;
  }

  function showPhotosError(msg) {
    if (!photosErr) return;
    photosErr.textContent = msg || '';
    photosErr.hidden = !msg;
  }

  function showFormError(msg) {
    var existing = form.querySelector('.sell-form-toplevel-error');
    if (existing) existing.remove();
    if (!msg) return;
    var p = document.createElement('p');
    p.className = 'sell-form-error sell-form-toplevel-error';
    p.textContent = msg;
    submit.insertAdjacentElement('beforebegin', p);
  }

  function revokeUrls() {
    for (var i = 0; i < objectUrls.length; i++) URL.revokeObjectURL(objectUrls[i]);
    objectUrls = [];
  }

  // Decode a File to an ImageBitmap (modern browsers, broadest codec support)
  // or fall back to HTMLImageElement (older browsers / edge cases). Returns
  // a Promise that rejects if neither path can decode the file (e.g., HEIC
  // on a browser without OS codec support).
  function decodeImage(file) {
    if (typeof createImageBitmap === 'function') {
      return createImageBitmap(file).catch(function () {
        return decodeViaImageElement(file);
      });
    }
    return decodeViaImageElement(file);
  }

  function decodeViaImageElement(file) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () { URL.revokeObjectURL(url); resolve(img); };
      img.onerror = function (err) { URL.revokeObjectURL(url); reject(err); };
      img.src = url;
    });
  }

  // Compress a File to a smaller JPEG via canvas. Resolves with a new File on
  // success, or with the original file unchanged on any failure. Caller does
  // not need to try/catch — failure modes are absorbed here so a single
  // un-decodable file never aborts the whole submission.
  async function compressImage(file) {
    if (!file || !/^image\//i.test(file.type || '')) return file;

    var bitmap;
    try {
      bitmap = await decodeImage(file);
    } catch (_) {
      return file;
    }

    var srcW = bitmap.width || bitmap.naturalWidth || 0;
    var srcH = bitmap.height || bitmap.naturalHeight || 0;
    if (!srcW || !srcH) {
      if (bitmap.close) bitmap.close();
      return file;
    }

    var scale = Math.min(1, COMPRESS_MAX_DIM / Math.max(srcW, srcH));
    var dstW = Math.max(1, Math.round(srcW * scale));
    var dstH = Math.max(1, Math.round(srcH * scale));

    var canvas = document.createElement('canvas');
    canvas.width = dstW;
    canvas.height = dstH;
    var ctx = canvas.getContext('2d');
    if (!ctx) {
      if (bitmap.close) bitmap.close();
      return file;
    }
    try {
      ctx.drawImage(bitmap, 0, 0, dstW, dstH);
    } catch (_) {
      if (bitmap.close) bitmap.close();
      return file;
    }
    if (bitmap.close) bitmap.close();

    var blob = await new Promise(function (resolve) {
      canvas.toBlob(resolve, 'image/jpeg', COMPRESS_QUALITY);
    });
    if (!blob || blob.size >= file.size) return file;

    var base = (file.name || 'photo').replace(/\.[^.]+$/, '');
    return new File([blob], base + '.jpg', { type: 'image/jpeg', lastModified: Date.now() });
  }

  function renderPhotos() {
    revokeUrls();
    photosList.innerHTML = '';

    if (!selectedPhotos.length) {
      photosList.hidden = true;
      photosCount.hidden = true;
      photosAdd.textContent = '+ Add photos';
    } else {
      photosList.hidden = false;
      photosCount.hidden = false;
      photosAdd.textContent = selectedPhotos.length >= MAX_PHOTOS ? 'Maximum reached' : '+ Add more photos';

      selectedPhotos.forEach(function (file, idx) {
        var item = document.createElement('li');
        item.className = 'sell-photo-item';

        var url = URL.createObjectURL(file);
        objectUrls.push(url);

        var img = document.createElement('img');
        img.alt = file.name || ('Photo ' + (idx + 1));
        img.src = url;
        img.loading = 'lazy';

        var meta = document.createElement('span');
        meta.className = 'sell-photo-meta';
        meta.textContent = fmtSize(file.size);

        var remove = document.createElement('button');
        remove.type = 'button';
        remove.className = 'sell-photo-remove';
        remove.setAttribute('aria-label', 'Remove photo ' + (idx + 1));
        remove.innerHTML = '&times;';
        remove.addEventListener('click', function () {
          selectedPhotos.splice(idx, 1);
          showPhotosError('');
          renderPhotos();
        });

        item.appendChild(img);
        item.appendChild(meta);
        item.appendChild(remove);
        photosList.appendChild(item);
      });

      var word = selectedPhotos.length === 1 ? 'photo' : 'photos';
      photosCount.textContent = selectedPhotos.length + ' of ' + MAX_PHOTOS + ' ' + word + ' (' + fmtSize(totalBytes()) + ')';
    }

    photosAdd.disabled = selectedPhotos.length >= MAX_PHOTOS;
  }

  photosAdd.addEventListener('click', function () {
    if (photosAdd.disabled) return;
    photosInput.click();
  });

  photosInput.addEventListener('change', function () {
    var newFiles = Array.from(photosInput.files || []);
    var added = 0;
    var skipped = 0;

    for (var i = 0; i < newFiles.length; i++) {
      var f = newFiles[i];
      if (selectedPhotos.length >= MAX_PHOTOS) { skipped++; continue; }
      if (!/^image\//i.test(f.type)) { skipped++; continue; }
      var dup = selectedPhotos.some(function (s) {
        return s.name === f.name && s.size === f.size && s.lastModified === f.lastModified;
      });
      if (dup) { skipped++; continue; }
      selectedPhotos.push(f);
      added++;
    }

    photosInput.value = '';

    if (added === 0 && skipped > 0 && selectedPhotos.length >= MAX_PHOTOS) {
      showPhotosError('Maximum of ' + MAX_PHOTOS + ' photos. Remove one to add another.');
    } else {
      showPhotosError('');
    }

    renderPhotos();
  });

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    showPhotosError('');
    showFormError('');

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    if (selectedPhotos.length < MIN_PHOTOS) {
      showPhotosError('Please attach at least ' + MIN_PHOTOS + ' photo' + (MIN_PHOTOS === 1 ? '' : 's') + '.');
      photosAdd.focus();
      return;
    }
    if (selectedPhotos.length > MAX_PHOTOS) {
      showPhotosError('Please attach no more than ' + MAX_PHOTOS + ' photos.');
      photosAdd.focus();
      return;
    }

    var originalSubmitText = submit ? submit.textContent : 'Send';
    if (submit) {
      submit.disabled = true;
      submit.textContent = 'Sending…';
    }

    // In-browser image compression. Cloudflare Email Routing rejects emails
    // larger than 25 MB on-the-wire, and base64-encoded attachments expand
    // by 4/3 — so raw attachments must stay under ~18 MB. compressImage
    // downscales each photo to JPEG (1600px / q0.82), bringing typical
    // 5-photo submissions well under 2 MB. If a specific file can't be
    // decoded (e.g., HEIC on a non-Safari browser without OS codec
    // support), compressImage returns the original; the size gate below
    // hard-blocks the submission if the post-compression total still
    // exceeds the cap. There is no path that submits silently-too-large.
    var processedPhotos = [];
    for (var p = 0; p < selectedPhotos.length; p++) {
      processedPhotos.push(await compressImage(selectedPhotos[p]));
    }

    var totalCompressed = 0;
    for (var q = 0; q < processedPhotos.length; q++) totalCompressed += processedPhotos[q].size;
    if (totalCompressed > MAX_TOTAL_BYTES) {
      showPhotosError(
        'Photos still total ' + (totalCompressed / 1024 / 1024).toFixed(1) + ' MB ' +
        'after optimization. Please send fewer photos or lower-resolution shots ' +
        'from your phone — or text them to 780-965-1477.'
      );
      photosAdd.focus();
      if (submit) {
        submit.disabled = false;
        submit.textContent = originalSubmitText;
      }
      return;
    }

    try {
      var fd = new FormData(form);
      fd.delete('photos');
      for (var i = 0; i < processedPhotos.length; i++) {
        fd.append('photos', processedPhotos[i], processedPhotos[i].name || ('photo-' + (i + 1) + '.jpg'));
      }
      fd.set('Source page', window.location.pathname + window.location.search);
      fd.set('_elapsed_ms', String(Date.now() - pageLoadedAt));
      var res = await fetch(SELL_FORM_ENDPOINT, { method: 'POST', body: fd });
      var data = {};
      try { data = await res.json(); } catch (_) {}
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Send failed.');
      }
      if (success) {
        success.hidden = false;
        form.hidden = true;
        success.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      if (window.gtag) {
        var brandField = form.querySelector('[name="Brand"]');
        gtag('event', 'sell_form_submit', {
          event_category: 'sell',
          event_label: brandField && brandField.value ? brandField.value : 'unknown'
        });
      }
    } catch (err) {
      showFormError(err && err.message ? err.message : 'Could not send. Please text us at 780-965-1477.');
      if (submit) {
        submit.disabled = false;
        submit.textContent = originalSubmitText;
      }
    }
  });
})();
