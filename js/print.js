/* ==========================================================
   AMERIDEX ESTIMATOR - Print / Save as PDF
   Builds a .print-page div mirroring the AmeriDex estimate
   layout, injects it into the DOM, calls window.print(),
   then removes it.

   Called by the "Print / Save PDF" button on Step 5.
   Requires window.ameridexEstimate to be set by estimator.js.

   GATE: estimate must exist + name, email, zip filled in.
   Phone is optional and never blocks printing.
   ========================================================== */

(function () {
  'use strict';

  /* ---- HELPERS ---- */
  function fmt(n) {
    return '$' + Math.round(n).toLocaleString('en-US');
  }

  function today() {
    return new Date().toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  function escHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function showToast(msg) {
    var t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(function () { t.classList.remove('show'); }, 3500);
  }

  /* ---- VALIDATION ---- */
  function validateForPrint() {
    var est   = window.ameridexEstimate;
    var name  = ((document.getElementById('lead-name')  || {}).value  || '').trim();
    var email = ((document.getElementById('lead-email') || {}).value  || '').trim();
    var zip   = ((document.getElementById('lead-zip')   || {}).value  || '').trim();

    if (!est || !est.sqFt || !est.layoutPattern) {
      showToast('Complete the estimator steps first, then print.');
      return false;
    }
    if (!name) {
      showToast('Please enter your name before printing.');
      document.getElementById('lead-name') && document.getElementById('lead-name').focus();
      return false;
    }
    if (!email || !/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
      showToast('Please enter a valid email address before printing.');
      document.getElementById('lead-email') && document.getElementById('lead-email').focus();
      return false;
    }
    if (!zip) {
      showToast('Please enter your ZIP code before printing.');
      document.getElementById('lead-zip') && document.getElementById('lead-zip').focus();
      return false;
    }
    return true;
  }

  /* ---- BUILD TABLE ROWS ---- */
  function buildRows(lines) {
    if (!lines || lines.length === 0) {
      return '<tr><td colspan="3" style="text-align:center;color:#6B7A90;">No items calculated.</td></tr>';
    }
    return lines.map(function (line) {
      return '<tr>' +
        '<td class="pq-item-name">' + escHtml(line.label) + '</td>' +
        '<td style="text-align:right;">' + fmt(line.low) + '</td>' +
        '<td style="text-align:right;">' + fmt(line.high) + '</td>' +
      '</tr>';
    }).join('');
  }

  /* ---- BUILD CUSTOMER INFO ROWS ---- */
  function buildCustomerRows() {
    var name  = ((document.getElementById('lead-name')  || {}).value || '').trim();
    var email = ((document.getElementById('lead-email') || {}).value || '').trim();
    var phone = ((document.getElementById('lead-phone') || {}).value || '').trim();
    var zip   = ((document.getElementById('lead-zip')   || {}).value || '').trim();

    var rows = [];
    if (name)  rows.push(['Name',  name]);
    if (email) rows.push(['Email', email]);
    if (phone) rows.push(['Phone', phone]); // optional -- only shown if provided
    if (zip)   rows.push(['ZIP',   zip]);

    return rows.map(function (r) {
      return '<div class="pq-info-row">' +
        '<span class="pq-info-label">' + escHtml(r[0]) + '</span>' +
        '<span class="pq-info-value">' + escHtml(r[1]) + '</span>' +
      '</div>';
    }).join('');
  }

  /* ---- BUILD SELECTIONS INFO ROWS ---- */
  function buildSelectionRows(est) {
    var rows = [];
    if (est.sqFt)          rows.push(['Deck Area',     est.sqFt.toLocaleString() + ' sq ft']);
    if (est.linFt)         rows.push(['Board Qty',     est.linFt.toLocaleString() + ' lin ft (incl. 10% waste)']);
    if (est.layoutPattern) rows.push(['Layout',        est.layoutPattern]);
    if (est.color)         rows.push(['Color',         est.color]);
    rows.push(['Framing', est.includeFraming ? 'Included' : 'Not included']);

    var acc = [];
    if (est.accessories) {
      if (est.accessories.railings) acc.push('Railings');
      if (est.accessories.fascia)   acc.push('Fascia');
      if (est.accessories.stairs)   acc.push('Stairs');
    }
    if (acc.length) rows.push(['Add-ons', acc.join(', ')]);

    return rows.map(function (r) {
      return '<div class="pq-info-row">' +
        '<span class="pq-info-label">' + escHtml(r[0]) + '</span>' +
        '<span class="pq-info-value">' + escHtml(r[1]) + '</span>' +
      '</div>';
    }).join('');
  }

  /* ---- BUILD FULL PRINT PAGE ---- */
  function buildPrintPage() {
    var est      = window.ameridexEstimate || {};
    var lines    = est.lines || [];
    var rangeStr = fmt(est.totalLow || 0) + ' &ndash; ' + fmt(est.totalHigh || 0);

    return '<div class="print-page" id="print-page-node">' +
      '<div class="print-page__inner">' +

        '<header class="pq-header">' +
          '<div class="pq-header__brand">' +
            '<div class="pq-header__logo">' +
              '<span class="pq-header__logotype">' +
                '<span class="ameri">AMERI</span>' +
                '<span class="dex">DEX</span>' +
              '</span>' +
            '</div>' +
            '<div>' +
              '<div class="pq-header__tagline">Composite Decking &mdash; Customer Estimate</div>' +
            '</div>' +
          '</div>' +
          '<div class="pq-header__meta">' +
            '<div class="pq-doc-title">Material Estimate</div>' +
            '<div class="pq-doc-date">Generated: ' + escHtml(today()) + '</div>' +
            '<span class="pq-badge">Rough Estimate Only</span>' +
          '</div>' +
        '</header>' +

        '<div class="pq-stripe"></div>' +

        '<div class="pq-body">' +

          '<div class="pq-info-grid">' +
            '<div class="pq-info-card">' +
              '<div class="pq-info-card__title">Customer Information</div>' +
              buildCustomerRows() +
            '</div>' +
            '<div class="pq-info-card">' +
              '<div class="pq-info-card__title">Project Selections</div>' +
              buildSelectionRows(est) +
            '</div>' +
          '</div>' +

          '<div class="pq-section-title">Estimate Line Items</div>' +
          '<table class="pq-table">' +
            '<thead>' +
              '<tr>' +
                '<th style="width:55%;">Item</th>' +
                '<th style="text-align:right;">Low</th>' +
                '<th style="text-align:right;">High</th>' +
              '</tr>' +
            '</thead>' +
            '<tbody>' + buildRows(lines) + '</tbody>' +
          '</table>' +

          '<div class="pq-totals-wrap">' +
            '<div class="pq-totals-box">' +
              '<div class="pq-totals-row">' +
                '<span>Labor / Delivery</span><span>Not included</span>' +
              '</div>' +
              '<div class="pq-totals-row">' +
                '<span>Tax / Permits</span><span>Not included</span>' +
              '</div>' +
              '<div class="pq-totals-row pq-totals-final">' +
                '<span>Estimated Range</span>' +
                '<span>' + rangeStr + '</span>' +
              '</div>' +
            '</div>' +
          '</div>' +

          '<div class="pq-disclaimer">' +
            '<strong>Disclaimer:</strong> This is a rough material-only estimate for budgeting purposes. ' +
            'Final pricing is subject to confirmation by an authorized AmeriDex dealer. ' +
            'Prices do not include labor, delivery, taxes, permits, or installation. ' +
            'Contact <a href="mailto:sales@ameridex.com" style="color:#C8102E;font-weight:600;">sales@ameridex.com</a> with questions.' +
          '</div>' +

          '<div class="pq-footer">' +
            '<span>Generated by AmeriDex Deck Estimator &nbsp;&bull;&nbsp; ameridex.com</span>' +
            '<a href="mailto:sales@ameridex.com">sales@ameridex.com</a>' +
          '</div>' +

        '</div>' +
      '</div>' +
    '</div>';
  }

  /* ---- TRIGGER PRINT ---- */
  function triggerPrint() {
    if (!validateForPrint()) return;

    var old = document.getElementById('print-page-node');
    if (old) old.parentNode.removeChild(old);

    document.body.insertAdjacentHTML('beforeend', buildPrintPage());

    setTimeout(function () {
      window.print();
      setTimeout(function () {
        var node = document.getElementById('print-page-node');
        if (node) node.parentNode.removeChild(node);
      }, 1200);
    }, 120);
  }

  /* ---- INIT ---- */
  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.getElementById('btn-print-estimate');
    if (btn) btn.addEventListener('click', triggerPrint);
  });

  window.printEstimate = triggerPrint;

}());
