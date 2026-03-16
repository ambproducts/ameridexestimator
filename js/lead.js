/* ==========================================================
   AMERIDEX ESTIMATOR - Lead Capture
   v6: Added board_count + lin_ft to payload,
       redirect to thankyou.html on successful submission.
   Formspree endpoint: https://formspree.io/f/xlgpprpv
   ========================================================== */

(function () {
  'use strict';

  const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xlgpprpv';
  const THANKYOU_URL       = 'thankyou.html';

  /* ---- HELPERS ---- */
  function setLoading(isLoading) {
    const btn = document.getElementById('lead-submit');
    if (!btn) return;
    if (isLoading) {
      btn.disabled    = true;
      btn.textContent = 'Sending\u2026';
    } else {
      btn.disabled    = false;
      btn.textContent = 'Send My Estimate';
    }
  }

  function showToast(msg) {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(function () { t.classList.remove('show'); }, 3200);
  }

  /* ---- BUILD PAYLOAD ---- */
  function buildPayload() {
    const est = window.ameridexEstimate || {};

    const lineText = (est.lines || []).map(function (l) {
      return l.label + ': $' + Math.round(l.low).toLocaleString() +
             ' - $' + Math.round(l.high).toLocaleString();
    }).join('\n');

    const accessories = [];
    if (est.accessories) {
      if (est.accessories.railings)  accessories.push('Railings');
      if (est.accessories.fascia)    accessories.push('Fascia Boards');
      if (est.accessories.fasteners) accessories.push('Hidden Fasteners');
      if (est.accessories.stairs)    accessories.push('Stair Stringers');
    }

    return {
      _subject: 'New AmeriDex Deck Estimate Request',

      /* Contact */
      name:  (document.getElementById('lead-name')  || {}).value  || '(not provided)',
      email: (document.getElementById('lead-email') || {}).value  || '',
      phone: (document.getElementById('lead-phone') || {}).value  || '(not provided)',
      zip:   (document.getElementById('lead-zip')   || {}).value  || '(not provided)',

      /* Estimate */
      estimate_range:  '$' + Math.round(est.totalLow  || 0).toLocaleString() +
                       ' - $' + Math.round(est.totalHigh || 0).toLocaleString(),
      square_footage:  (est.sqFt || 0) + ' sq ft',
      board_style:     est.boardStyle   || '',
      color:           est.color        || '',
      include_framing: est.includeFraming ? 'Yes' : 'No',
      accessories:     accessories.length ? accessories.join(', ') : 'None',
      board_count:     (est.boardCount  || 0) + ' boards',
      linear_footage:  (est.linFt       || 0) + ' lin ft',
      waste_factor:    '10%',
      line_items:      lineText,

      /* Meta */
      submitted_at: new Date().toLocaleString('en-US', { timeZoneName: 'short' }),
      source:       'AmeriDex Deck Estimator'
    };
  }

  /* ---- SUBMIT HANDLER ---- */
  function handleSubmit(e) {
    e.preventDefault();

    if (!window.Validation || !window.Validation.validateLeadForm()) {
      showToast('Please fix the highlighted fields.');
      return;
    }

    const payload = buildPayload();
    setLoading(true);

    fetch(FORMSPREE_ENDPOINT, {
      method:  'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept':       'application/json'
      },
      body: JSON.stringify(payload)
    })
    .then(function (res) {
      setLoading(false);
      if (res.ok) {
        /* Encode the estimate range into the redirect URL so
           thankyou.html can personalise the confirmation message */
        const low  = Math.round((window.ameridexEstimate || {}).totalLow  || 0);
        const high = Math.round((window.ameridexEstimate || {}).totalHigh || 0);
        const name = encodeURIComponent(
          (document.getElementById('lead-name') || {}).value || ''
        );
        window.location.href = THANKYOU_URL +
          '?low='  + low  +
          '&high=' + high +
          '&name=' + name;
      } else {
        return res.json().then(function (data) {
          throw new Error((data && data.error) || 'Submission failed.');
        });
      }
    })
    .catch(function (err) {
      setLoading(false);
      console.error('AmeriDex lead submission error:', err);
      showToast('Something went wrong. Please try again or call us directly.');
    });
  }

  /* ---- INIT ---- */
  document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('lead-form');
    if (form) form.addEventListener('submit', handleSubmit);
  });

}());
