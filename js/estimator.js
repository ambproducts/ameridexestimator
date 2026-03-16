/* ==========================================================
   AMERIDEX ESTIMATOR - Wizard Engine & Live Calculator
   Handles: step navigation, progress bar, live sq ft calc,
   board style card rendering, color swatch rendering,
   estimate calculation, and summary population.
   ========================================================== */

(function () {
  'use strict';

  /* ---------- STATE ---------- */
  const state = {
    currentStep: 1,
    totalSteps: 5,
    sqFt: 0,
    boardStyleId: null,
    colorId: null,
    includeFraming: false,
    accessories: {
      railings: false,
      fascia: false,
      fasteners: false,
      stairs: false
    },
    railingLf: 0
  };

  /* ---------- UTILS ---------- */
  function fmt(n) {
    return '$' + Math.round(n).toLocaleString('en-US');
  }

  function showToast(msg, duration) {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(function () { t.classList.remove('show'); }, duration || 2800);
  }

  /* ---------- PROGRESS BAR ---------- */
  function updateProgress(step) {
    const stepEls = document.querySelectorAll('.progress-step');
    const connectors = document.querySelectorAll('.progress-connector');
    stepEls.forEach(function (el, i) {
      const n = i + 1;
      el.classList.remove('active', 'done');
      if (n < step) el.classList.add('done');
      if (n === step) el.classList.add('active');
    });
    connectors.forEach(function (el, i) {
      el.classList.toggle('done', i + 1 < step);
    });
  }

  /* ---------- STEP NAVIGATION ---------- */
  function goTo(step) {
    if (step < 1 || step > state.totalSteps) return;

    // Validate before advancing
    if (step > state.currentStep) {
      if (!validateStep(state.currentStep)) return;
    }

    // Sync state from DOM before leaving a step
    syncStateFromDOM(state.currentStep);

    // Hide all steps
    document.querySelectorAll('.wizard-step').forEach(function (el) {
      el.classList.remove('active');
    });

    // Show target step
    const target = document.getElementById('step-' + step);
    if (target) {
      target.classList.add('active');
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    state.currentStep = step;
    updateProgress(step);

    // Build estimate when arriving at step 5
    if (step === 5) buildEstimate();
  }

  function restart() {
    // Reset state
    state.sqFt = 0;
    state.boardStyleId = null;
    state.colorId = null;
    state.includeFraming = false;
    state.accessories = { railings: false, fascia: false, fasteners: false, stairs: false };
    state.railingLf = 0;

    // Reset DOM inputs
    const lenEl = document.getElementById('deck-length');
    const widEl = document.getElementById('deck-width');
    if (lenEl) lenEl.value = '';
    if (widEl) widEl.value = '';
    document.getElementById('sqft-value').textContent = '--';

    document.querySelectorAll('.product-card').forEach(function (c) { c.classList.remove('selected'); });
    document.querySelectorAll('.swatch-item').forEach(function (s) { s.classList.remove('selected'); });

    const framingEl = document.getElementById('include-framing');
    if (framingEl) framingEl.checked = false;
    ['add-railings','add-fascia','add-fasteners','add-stairs'].forEach(function (id) {
      const el = document.getElementById(id);
      if (el) el.checked = false;
    });
    const railLf = document.getElementById('railing-lf');
    if (railLf) railLf.value = '';
    const railRow = document.getElementById('railing-row');
    if (railRow) railRow.style.display = 'none';

    // Reset lead form
    const leadForm = document.getElementById('lead-form');
    if (leadForm) { leadForm.reset(); leadForm.style.display = ''; }
    const leadSuccess = document.getElementById('lead-success');
    if (leadSuccess) leadSuccess.style.display = 'none';

    goTo(1);
  }

  /* ---------- STATE SYNC ---------- */
  function syncStateFromDOM(step) {
    if (step === 1) {
      const l = parseFloat(document.getElementById('deck-length').value) || 0;
      const w = parseFloat(document.getElementById('deck-width').value) || 0;
      state.sqFt = l * w;
    }
    if (step === 4) {
      state.includeFraming = document.getElementById('include-framing').checked;
      state.accessories.railings  = document.getElementById('add-railings').checked;
      state.accessories.fascia    = document.getElementById('add-fascia').checked;
      state.accessories.fasteners = document.getElementById('add-fasteners').checked;
      state.accessories.stairs    = document.getElementById('add-stairs').checked;
      state.railingLf = parseFloat(document.getElementById('railing-lf').value) ||
        AMERIDEX_PRODUCTS.accessories.railings.defaultLinFt;
    }
  }

  /* ---------- VALIDATION ---------- */
  function validateStep(step) {
    let valid = true;

    function setError(id, msg) {
      const el = document.getElementById(id);
      if (el) { el.textContent = msg; }
      valid = false;
    }
    function clearError(id) {
      const el = document.getElementById(id);
      if (el) el.textContent = '';
    }

    if (step === 1) {
      clearError('deck-length-error'); clearError('deck-width-error');
      const l = parseFloat(document.getElementById('deck-length').value);
      const w = parseFloat(document.getElementById('deck-width').value);
      if (!l || l < 1) { setError('deck-length-error', 'Please enter a valid length.'); document.getElementById('deck-length').classList.add('error'); }
      else { document.getElementById('deck-length').classList.remove('error'); }
      if (!w || w < 1) { setError('deck-width-error', 'Please enter a valid width.'); document.getElementById('deck-width').classList.add('error'); }
      else { document.getElementById('deck-width').classList.remove('error'); }
    }

    if (step === 2) {
      clearError('board-style-error');
      if (!state.boardStyleId) { setError('board-style-error', 'Please select a board style to continue.'); }
    }

    if (step === 3) {
      clearError('color-error');
      if (!state.colorId) { setError('color-error', 'Please choose a color to continue.'); }
    }

    if (!valid) showToast('Please complete this step before continuing.');
    return valid;
  }

  /* ---------- RENDER BOARD STYLE CARDS ---------- */
  function renderBoardStyles() {
    const grid = document.getElementById('board-style-grid');
    if (!grid) return;
    grid.innerHTML = '';
    AMERIDEX_PRODUCTS.boardStyles.forEach(function (style) {
      const card = document.createElement('div');
      card.className = 'product-card';
      card.setAttribute('role', 'radio');
      card.setAttribute('aria-checked', 'false');
      card.setAttribute('tabindex', '0');
      card.dataset.styleId = style.id;
      card.innerHTML =
        '<div class="product-card-icon">' + style.icon + '</div>' +
        '<div class="product-card-name">' + style.label + '</div>' +
        '<div class="product-card-detail">' + style.detail + '</div>';

      card.addEventListener('click', function () {
        document.querySelectorAll('.product-card').forEach(function (c) {
          c.classList.remove('selected');
          c.setAttribute('aria-checked', 'false');
        });
        card.classList.add('selected');
        card.setAttribute('aria-checked', 'true');
        state.boardStyleId = style.id;
        document.getElementById('board-style-error').textContent = '';
      });

      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.click(); }
      });

      grid.appendChild(card);
    });
  }

  /* ---------- RENDER COLOR SWATCHES ---------- */
  function renderColors() {
    const grid = document.getElementById('color-swatch-grid');
    if (!grid) return;
    grid.innerHTML = '';
    AMERIDEX_PRODUCTS.colors.forEach(function (color) {
      const item = document.createElement('div');
      item.className = 'swatch-item';
      item.setAttribute('role', 'radio');
      item.setAttribute('aria-checked', 'false');
      item.setAttribute('tabindex', '0');
      item.setAttribute('aria-label', color.label);
      item.dataset.colorId = color.id;
      item.innerHTML =
        '<div class="swatch-circle" style="background:' + color.hex + ';"></div>' +
        '<span class="swatch-label">' + color.label + '</span>';

      item.addEventListener('click', function () {
        document.querySelectorAll('.swatch-item').forEach(function (s) {
          s.classList.remove('selected');
          s.setAttribute('aria-checked', 'false');
        });
        item.classList.add('selected');
        item.setAttribute('aria-checked', 'true');
        state.colorId = color.id;
        document.getElementById('color-error').textContent = '';
      });

      item.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); item.click(); }
      });

      grid.appendChild(item);
    });
  }

  /* ---------- LIVE SQ FT CALCULATION ---------- */
  function initDimensionListeners() {
    const lenEl = document.getElementById('deck-length');
    const widEl = document.getElementById('deck-width');
    const sqftEl = document.getElementById('sqft-value');

    function update() {
      const l = parseFloat(lenEl.value) || 0;
      const w = parseFloat(widEl.value) || 0;
      if (l > 0 && w > 0) {
        const sqft = l * w;
        sqftEl.textContent = sqft.toLocaleString('en-US') + ' sq ft';
        state.sqFt = sqft;
      } else {
        sqftEl.textContent = '--';
      }
    }

    lenEl.addEventListener('input', update);
    widEl.addEventListener('input', update);
  }

  /* ---------- RAILING ROW REVEAL ---------- */
  function initRailingReveal() {
    const railingCheck = document.getElementById('add-railings');
    const railingRow   = document.getElementById('railing-row');
    if (!railingCheck || !railingRow) return;
    railingCheck.addEventListener('change', function () {
      railingRow.style.display = this.checked ? 'block' : 'none';
    });
  }

  /* ---------- ESTIMATE CALCULATION ---------- */
  function calcEstimate() {
    const P   = AMERIDEX_PRODUCTS;
    const sqFt = state.sqFt;
    const lines = [];
    let totalLow = 0, totalHigh = 0;

    // Board decking
    const style = P.boardStyles.find(function (s) { return s.id === state.boardStyleId; });
    if (style && sqFt > 0) {
      const low  = sqFt * style.pricePerSqFt.low;
      const high = sqFt * style.pricePerSqFt.high;
      lines.push({ label: style.label + ' decking (' + sqFt.toLocaleString() + ' sq ft)', low: low, high: high });
      totalLow  += low;
      totalHigh += high;
    }

    // Framing
    if (state.includeFraming && sqFt > 0) {
      const low  = sqFt * P.framing.pricePerSqFt.low;
      const high = sqFt * P.framing.pricePerSqFt.high;
      lines.push({ label: P.framing.label + ' (' + sqFt.toLocaleString() + ' sq ft)', low: low, high: high });
      totalLow  += low;
      totalHigh += high;
    }

    // Railings
    if (state.accessories.railings) {
      const lf   = state.railingLf || P.accessories.railings.defaultLinFt;
      const low  = lf * P.accessories.railings.pricePerLinFt.low;
      const high = lf * P.accessories.railings.pricePerLinFt.high;
      lines.push({ label: P.accessories.railings.label + ' (' + lf + ' lin ft)', low: low, high: high });
      totalLow  += low;
      totalHigh += high;
    }

    // Fascia
    if (state.accessories.fascia && sqFt > 0) {
      const low  = sqFt * P.accessories.fascia.pricePerSqFt.low;
      const high = sqFt * P.accessories.fascia.pricePerSqFt.high;
      lines.push({ label: P.accessories.fascia.label, low: low, high: high });
      totalLow  += low;
      totalHigh += high;
    }

    // Hidden fasteners
    if (state.accessories.fasteners && sqFt > 0) {
      const low  = sqFt * P.accessories.fasteners.pricePerSqFt.low;
      const high = sqFt * P.accessories.fasteners.pricePerSqFt.high;
      lines.push({ label: P.accessories.fasteners.label, low: low, high: high });
      totalLow  += low;
      totalHigh += high;
    }

    // Stairs
    if (state.accessories.stairs) {
      const low  = P.accessories.stairs.flatRate.low;
      const high = P.accessories.stairs.flatRate.high;
      lines.push({ label: P.accessories.stairs.label, low: low, high: high });
      totalLow  += low;
      totalHigh += high;
    }

    return { lines: lines, totalLow: totalLow, totalHigh: totalHigh };
  }

  /* ---------- BUILD ESTIMATE DISPLAY ---------- */
  function buildEstimate() {
    syncStateFromDOM(4);
    const result = calcEstimate();

    // Range display
    document.getElementById('est-low').textContent  = fmt(result.totalLow);
    document.getElementById('est-high').textContent = fmt(result.totalHigh);

    // Breakdown table
    const tbody = document.getElementById('breakdown-tbody');
    tbody.innerHTML = '';
    result.lines.forEach(function (line) {
      const tr = document.createElement('tr');
      tr.innerHTML =
        '<td>' + line.label + '</td>' +
        '<td>' + fmt(line.low)  + '</td>' +
        '<td>' + fmt(line.high) + '</td>';
      tbody.appendChild(tr);
    });
    // Totals row
    const totRow = document.createElement('tr');
    totRow.innerHTML =
      '<td>Total Estimate</td>' +
      '<td>' + fmt(result.totalLow) + '</td>' +
      '<td>' + fmt(result.totalHigh) + '</td>';
    tbody.appendChild(totRow);

    // Selections pills
    const selList = document.getElementById('selections-list');
    selList.innerHTML = '';
    const style = AMERIDEX_PRODUCTS.boardStyles.find(function (s) { return s.id === state.boardStyleId; });
    const color = AMERIDEX_PRODUCTS.colors.find(function (c) { return c.id === state.colorId; });

    const pills = [
      state.sqFt > 0 ? state.sqFt.toLocaleString() + ' sq ft' : null,
      style ? style.label : null,
      color ? color.label : null,
      state.includeFraming ? 'With Framing' : null,
      state.accessories.railings  ? 'Railings' : null,
      state.accessories.fascia    ? 'Fascia' : null,
      state.accessories.fasteners ? 'Hidden Fasteners' : null,
      state.accessories.stairs    ? 'Stairs' : null
    ].filter(Boolean);

    pills.forEach(function (text) {
      const li = document.createElement('li');
      li.textContent = text;
      selList.appendChild(li);
    });

    // Store estimate on window for lead.js to include in submission
    window.ameridexEstimate = {
      sqFt: state.sqFt,
      boardStyle: style ? style.label : '',
      color: color ? color.label : '',
      includeFraming: state.includeFraming,
      accessories: Object.assign({}, state.accessories),
      totalLow: result.totalLow,
      totalHigh: result.totalHigh,
      lines: result.lines
    };
  }

  /* ---------- WIRE UP NAV BUTTONS ---------- */
  function wireButtons() {
    document.getElementById('step1-next').addEventListener('click', function () { goTo(2); });
    document.getElementById('step2-back').addEventListener('click', function () { goTo(1); });
    document.getElementById('step2-next').addEventListener('click', function () { goTo(3); });
    document.getElementById('step3-back').addEventListener('click', function () { goTo(2); });
    document.getElementById('step3-next').addEventListener('click', function () { goTo(4); });
    document.getElementById('step4-back').addEventListener('click', function () { goTo(3); });
    document.getElementById('step4-next').addEventListener('click', function () { goTo(5); });
    document.getElementById('step5-back').addEventListener('click', function () { goTo(4); });
    document.getElementById('step5-restart').addEventListener('click', function () { restart(); });
  }

  /* ---------- INIT ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    renderBoardStyles();
    renderColors();
    initDimensionListeners();
    initRailingReveal();
    wireButtons();
    updateProgress(1);
  });

  /* ---------- PUBLIC API ---------- */
  window.wizard = {
    goTo: goTo,
    restart: restart,
    getState: function () { return Object.assign({}, state); },
    getEstimate: function () { return calcEstimate(); }
  };

}());
