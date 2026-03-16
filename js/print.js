/* ==========================================================
   AMERIDEX ESTIMATOR - Print / Save as PDF
   Builds a .print-page div mirroring the AmeriDex Dealer
   Portal quote-template.html layout, injects it into the
   DOM, calls window.print(), then removes it.

   Called by the "Print / Save PDF" button on Step 5.
   Requires window.ameridexEstimate to be set by estimator.js
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
  function buildCustomerRows(est) {
    var name  = (document.getElementById('lead-name')  || {}).value  || '';
    var email = (document.getElementById('lead-email') || {}).value  || '';
    var phone = (document.getElementById('lead-phone') || {}).value  || '';
    var zip   = (document.getElementById('lead-zip')   || {}).value  || '';

    var rows = [];
    if (name.trim())  rows.push(['Name',  name]);
    if (email.trim()) rows.push(['Email', email]);
    if (phone.trim()) rows.push(['Phone', phone]);
    if (zip.trim())   rows.push(['ZIP',   zip]);
    if (!rows.length) rows.push(['Customer', 'Not provided']);

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
    if (est.sqFt)       rows.push(['Deck Area',    est.sqFt.toLocaleString() + ' sq ft']);
    if (est.boardStyle) rows.push(['Board Style',  est.boardStyle]);
    if (est.color)      rows.push(['Color',        est.color]);
    rows.push(['Framing', est.includeFraming ? 'Included' : 'Not included']);

    var acc = [];
    if (est.accessories) {
      if (est.accessories.railings)  acc.push('Railings');
      if (est.accessories.fascia)    acc.push('Fascia');
      if (est.accessories.fasteners) acc.push('Hidden Fasteners');
      if (est.accessories.stairs)    acc.push('Stairs');
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
    var est = window.ameridexEstimate || {};
    var lines = est.lines || [];
    var rangeStr = fmt(est.totalLow || 0) + ' &ndash; ' + fmt(est.totalHigh || 0);

    return '<div class="print-page" id="print-page-node">' +
      '<div class="print-page__inner">' +

        /* HEADER */
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

        /* ACCENT STRIPE */
        '<div class="pq-stripe"></div>' +

        '<div class="pq-body">' +

          /* INFO GRID */
          '<div class="pq-info-grid">' +
            '<div class="pq-info-card">' +
              '<div class="pq-info-card__title">Customer Information</div>' +
              buildCustomerRows(est) +
            '</div>' +
            '<div class="pq-info-card">' +
              '<div class="pq-info-card__title">Project Selections</div>' +
              buildSelectionRows(est) +
            '</div>' +
          '</div>' +

          /* ITEMS TABLE */
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

          /* TOTALS */
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

          /* DISCLAIMER */
          '<div class="pq-disclaimer">' +
            '<strong>Disclaimer:</strong> This is a rough material-only estimate for budgeting purposes. ' +
            'Final pricing is subject to confirmation by an authorized AmeriDex dealer. ' +
            'Prices do not include labor, delivery, taxes, permits, or installation. ' +
            'Product availability and lead times may vary. Contact ' +
            '<a href="mailto:sales@ameridex.com" style="color:#C8102E;font-weight:600;">sales@ameridex.com</a> ' +
            'with questions.' +
          '</div>' +

          /* FOOTER */
          '<div class="pq-footer">' +
            '<span>Generated by AmeriDex Deck Estimator &nbsp;&bull;&nbsp; ameridex.com</span>' +
            '<a href="mailto:sales@ameridex.com">sales@ameridex.com</a>' +
          '</div>' +

        '</div>' + /* pq-body */
      '</div>' + /* print-page__inner */
    '</div>'; /* print-page */
  }

  /* ---- TRIGGER PRINT ---- */
  function triggerPrint() {
    var est = window.ameridexEstimate;
    if (!est || !est.sqFt || !est.boardStyle) {
      var t = document.getElementById('toast');
      if (t) {
        t.textContent = 'Complete the estimator first to print your estimate.';
        t.classList.add('show');
        setTimeout(function () { t.classList.remove('show'); }, 3000);
      }
      return;
    }

    /* Remove any stale print node */
    var old = document.getElementById('print-page-node');
    if (old) old.parentNode.removeChild(old);

    /* Inject fresh print page */
    document.body.insertAdjacentHTML('beforeend', buildPrintPage());

    /* Small delay so browser paints it, then print */
    setTimeout(function () {
      window.print();
      /* Remove after dialog closes */
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

  /* Public API so the button can also call window.printEstimate() */
  window.printEstimate = triggerPrint;

}());
