/* ==========================================================
   AMERIDEX ESTIMATOR - Lead Capture
   Submits the lead form + estimate data to Formspree.

   SETUP: Replace FORMSPREE_ENDPOINT below with your
   Formspree form URL: https://formspree.io/f/YOUR_FORM_ID

   To get a free Formspree endpoint:
   1. Go to https://formspree.io
   2. Create a free account
   3. Create a new form
   4. Copy the endpoint URL and paste it below
   ========================================================== */

(function () {
  'use strict';

  /* ---- CONFIGURE THIS ---- */
  const FORMSPREE_ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID';

  /* ---- HELPERS ---- */
  function setLoading(isLoading) {
    const btn = document.getElementById('lead-submit');
    if (!btn) return;
    if (isLoading) {
      btn.disabled = true;
      btn.textContent = 'Sending...';
    } else {
      btn.disabled = false;
      btn.textContent = 'Send My Estimate';
    }
  }

  function showSuccess() {
    const form    = document.getElementById('lead-form');
    const success = document.getElementById('lead-success');
    if (form)    form.style.display    = 'none';
    if (success) success.style.display = 'block';
    success.scrollIntoView({ behavior: 'smooth', block: 'center' });
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

    // Format line items as a readable string for the email
    const lineText = (est.lines || []).map(function (l) {
      return l.label + ': ' + '$' + Math.round(l.low).toLocaleString() +
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
      /* Contact info */
      name:  (document.getElementById('lead-name')  || {}).value  || '',
      email: (document.getElementById('lead-email') || {}).value  || '',
      phone: (document.getElementById('lead-phone') || {}).value  || '',
      zip:   (document.getElementById('lead-zip')   || {}).value  || '',

      /* Estimate summary */
      estimate_range:  '$' + Math.round(est.totalLow  || 0).toLocaleString() +
                       ' - $' + Math.round(est.totalHigh || 0).toLocaleString(),
      square_footage:  (est.sqFt || 0) + ' sq ft',
      board_style:     est.boardStyle  || '',
      color:           est.color       || '',
      include_framing: est.includeFraming ? 'Yes' : 'No',
      accessories:     accessories.length ? accessories.join(', ') : 'None',
      line_items:      lineText,

      /* Meta */
      submitted_at: new Date().toLocaleString('en-US', { timeZoneName: 'short' }),
      source:       'AmeriDex Deck Estimator'
    };
  }

  /* ---- SUBMIT HANDLER ---- */
  function handleSubmit(e) {
    e.preventDefault();

    // Run validation
    if (!window.Validation || !window.Validation.validateLeadForm()) {
      showToast('Please fix the highlighted fields.');
      return;
    }

    const payload = buildPayload();
    setLoading(true);

    fetch(FORMSPREE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    })
    .then(function (res) {
      setLoading(false);
      if (res.ok) {
        showSuccess();
      } else {
        return res.json().then(function (data) {
          throw new Error((data && data.error) || 'Submission failed.');
        });
      }
    })
    .catch(function (err) {
      setLoading(false);
      console.error('Lead submission error:', err);
      showToast('Something went wrong. Please try again or call us directly.');
    });
  }

  /* ---- INIT ---- */
  document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('lead-form');
    if (form) form.addEventListener('submit', handleSubmit);
  });

}());
