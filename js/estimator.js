/* ==========================================================
   AMERIDEX ESTIMATOR - Wizard Engine & Live Calculator

   BOARD LENGTH SELECTION:
   - Standard: 12, 16, 20 ft (buttons)
   - Custom: even whole-foot value, 8-24 ft (number input)
   - No waste factor -- exact lin ft only

   Board count = ceil(totalLinFt / boardLengthFt)
   ========================================================== */

(function () {
  'use strict';

  const COVERAGE_FT = 5.625 / 12; // 5.5" face + 1/8" gap = 0.46875 ft

  /* ---------- STATE ---------- */
  const state = {
    currentStep: 1,
    totalSteps: 5,
    sqFt: 0,
    deckLength: 0,
    deckWidth: 0,
    boardLengthFt: AMERIDEX_PRODUCTS.boardLengths.defaultLength,
    layoutPatternId: null,
    colorId: null,
    includeFraming: false,
    accessories: { railings: false, fascia: false, stairs: false },
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

  /* ---------- BOARD QUANTITY ----------
   * No waste factor -- exact lin ft.
   * linFt = sqFt / COVERAGE_FT
   * boardCount = ceil(linFt / boardLengthFt)
   */
  function sqFtToLinFt(sqFt) {
    return Math.ceil(sqFt / COVERAGE_FT);
  }

  function linFtToBoardCount(linFt) {
    return Math.ceil(linFt / state.boardLengthFt);
  }

  function calcSolidLinFt(pattern) {
    const len = state.deckLength || Math.sqrt(state.sqFt);
    const wid = state.deckWidth  || Math.sqrt(state.sqFt);
    let linFt = 0;
    if (pattern.hasBorder)  linFt += 2 * (len + wid);
    if (pattern.hasBreaker) linFt += wid;
    return Math.ceil(linFt);
  }

  /* ---------- PROGRESS BAR ---------- */
  function updateProgress(step) {
    document.querySelectorAll('.progress-step').forEach(function (el, i) {
      const n = i + 1;
      el.classList.remove('active', 'done');
      if (n < step) el.classList.add('done');
      if (n === step) el.classList.add('active');
    });
    document.querySelectorAll('.progress-connector').forEach(function (el, i) {
      el.classList.toggle('done', i + 1 < step);
    });
  }

  /* ---------- STEP NAVIGATION ---------- */
  function goTo(step) {
    if (step < 1 || step > state.totalSteps) return;
    if (step > state.currentStep && !validateStep(state.currentStep)) return;
    syncStateFromDOM(state.currentStep);
    document.querySelectorAll('.wizard-step').forEach(function (el) {
      el.classList.remove('active');
    });
    const target = document.getElementById('step-' + step);
    if (target) {
      target.classList.add('active');
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    state.currentStep = step;
    updateProgress(step);
    if (step === 5) buildEstimate();
  }

  function restart() {
    state.sqFt = 0; state.deckLength = 0; state.deckWidth = 0;
    state.boardLengthFt = AMERIDEX_PRODUCTS.boardLengths.defaultLength;
    state.layoutPatternId = null; state.colorId = null;
    state.includeFraming = false;
    state.accessories = { railings: false, fascia: false, stairs: false };
    state.railingLf = 0;

    ['deck-length','deck-width'].forEach(function (id) {
      const el = document.getElementById(id); if (el) el.value = '';
    });
    const sqftEl = document.getElementById('sqft-value');
    if (sqftEl) sqftEl.textContent = '--';

    // Reset length selector
    document.querySelectorAll('.length-btn').forEach(function (btn) {
      btn.classList.toggle('selected', parseInt(btn.dataset.length) === state.boardLengthFt);
    });
    const customInput = document.getElementById('board-length-custom');
    if (customInput) { customInput.value = ''; customInput.style.display = 'none'; }

    document.querySelectorAll('.product-card').forEach(function (c) {
      c.classList.remove('selected'); c.setAttribute('aria-checked', 'false');
    });
    document.querySelectorAll('.swatch-item').forEach(function (s) {
      s.classList.remove('selected'); s.setAttribute('aria-checked', 'false');
    });
    const framingEl = document.getElementById('include-framing');
    if (framingEl) framingEl.checked = false;
    ['add-railings','add-fascia','add-stairs'].forEach(function (id) {
      const el = document.getElementById(id); if (el) el.checked = false;
    });
    const railLf  = document.getElementById('railing-lf');
    if (railLf) railLf.value = '';
    const railRow = document.getElementById('railing-row');
    if (railRow) railRow.style.display = 'none';
    const leadForm = document.getElementById('lead-form');
    if (leadForm) { leadForm.reset(); leadForm.style.display = ''; }
    const leadSuccess = document.getElementById('lead-success');
    if (leadSuccess) leadSuccess.style.display = 'none';

    window.ameridexEstimate = null;
    goTo(1);
  }

  /* ---------- STATE SYNC ---------- */
  function syncStateFromDOM(step) {
    if (step === 1) {
      const l = parseFloat(document.getElementById('deck-length').value) || 0;
      const w = parseFloat(document.getElementById('deck-width').value)  || 0;
      state.deckLength = l; state.deckWidth = w; state.sqFt = l * w;
    }
    if (step === 4) {
      state.includeFraming = document.getElementById('include-framing').checked;
      state.accessories.railings = document.getElementById('add-railings').checked;
      state.accessories.fascia   = document.getElementById('add-fascia').checked;
      state.accessories.stairs   = document.getElementById('add-stairs').checked;
      state.railingLf = parseFloat(document.getElementById('railing-lf').value) ||
        AMERIDEX_PRODUCTS.accessories.railings.defaultLinFt;
    }
  }

  /* ---------- VALIDATION ---------- */
  function validateStep(step) {
    let valid = true;
    function setError(id, msg) {
      const el = document.getElementById(id); if (el) el.textContent = msg; valid = false;
    }
    function clearError(id) {
      const el = document.getElementById(id); if (el) el.textContent = '';
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
      clearError('layout-pattern-error');
      if (!state.layoutPatternId) { setError('layout-pattern-error', 'Please select a deck layout to continue.'); valid = false; }
    }
    if (step === 3) {
      clearError('color-error');
      if (!state.colorId) { setError('color-error', 'Please choose a color to continue.'); valid = false; }
    }
    if (!valid) showToast('Please complete this step before continuing.');
    return valid;
  }

  /* ---------- RENDER BOARD LENGTH SELECTOR ----------
   * Renders in Step 1 below the sq ft display.
   * 3 standard buttons + a "Custom" button that reveals a number input.
   */
  function renderBoardLengthSelector() {
    const wrap = document.getElementById('board-length-selector');
    if (!wrap) return;
    const BL = AMERIDEX_PRODUCTS.boardLengths;

    let html = '<div class="length-selector-label">Board length</div><div class="length-btn-group">';
    BL.standard.forEach(function (len) {
      const sel = len === state.boardLengthFt ? ' selected' : '';
      html += '<button type="button" class="length-btn' + sel + '" data-length="' + len + '">' + len + ' ft</button>';
    });
    html += '<button type="button" class="length-btn length-btn--custom" id="length-btn-custom">Custom</button>';
    html += '</div>';
    html += '<div id="board-length-custom-wrap" style="display:none;margin-top:8px;">' +
            '<label class="form-label" for="board-length-custom">Custom length (even ft, ' + BL.customMin + '\u2013' + BL.customMax + ' ft)</label>' +
            '<input class="form-input form-input--sm" type="number" id="board-length-custom" ' +
            'min="' + BL.customMin + '" max="' + BL.customMax + '" step="' + BL.customStep + '" placeholder="e.g. 14" />' +
            '<span class="form-error" id="board-length-custom-error"></span>' +
            '</div>';
    wrap.innerHTML = html;

    // Standard length buttons
    wrap.querySelectorAll('.length-btn:not(.length-btn--custom)').forEach(function (btn) {
      btn.addEventListener('click', function () {
        wrap.querySelectorAll('.length-btn').forEach(function (b) { b.classList.remove('selected'); });
        btn.classList.add('selected');
        state.boardLengthFt = parseInt(btn.dataset.length);
        document.getElementById('board-length-custom-wrap').style.display = 'none';
        updateLinFtDisplay();
      });
    });

    // Custom button
    document.getElementById('length-btn-custom').addEventListener('click', function () {
      wrap.querySelectorAll('.length-btn').forEach(function (b) { b.classList.remove('selected'); });
      this.classList.add('selected');
      document.getElementById('board-length-custom-wrap').style.display = 'block';
      document.getElementById('board-length-custom').focus();
    });

    // Custom input validation
    document.getElementById('board-length-custom').addEventListener('input', function () {
      const BL = AMERIDEX_PRODUCTS.boardLengths;
      const val = parseInt(this.value);
      const errEl = document.getElementById('board-length-custom-error');
      if (!val || val < BL.customMin || val > BL.customMax || val % BL.customStep !== 0) {
        errEl.textContent = 'Must be an even number between ' + BL.customMin + ' and ' + BL.customMax + ' ft.';
        state.boardLengthFt = BL.defaultLength;
      } else {
        errEl.textContent = '';
        state.boardLengthFt = val;
        updateLinFtDisplay();
      }
    });
  }

  /* ---------- LIVE SQ FT / LIN FT / BOARD COUNT DISPLAY ---------- */
  function updateLinFtDisplay() {
    const sqftEl = document.getElementById('sqft-value');
    if (!sqftEl) return;
    const l = state.deckLength || parseFloat((document.getElementById('deck-length') || {}).value) || 0;
    const w = state.deckWidth  || parseFloat((document.getElementById('deck-width')  || {}).value) || 0;
    if (l > 0 && w > 0) {
      const sqft       = l * w;
      const linFt      = sqFtToLinFt(sqft);
      const boardCount = linFtToBoardCount(linFt);
      sqftEl.textContent = sqft.toLocaleString('en-US') + ' sq ft' +
        ' \u2022 ' + linFt.toLocaleString('en-US') + ' lin ft' +
        ' \u2022 ' + boardCount + ' boards @ ' + state.boardLengthFt + ' ft';
    } else {
      sqftEl.textContent = '--';
    }
  }

  function initDimensionListeners() {
    const lenEl = document.getElementById('deck-length');
    const widEl = document.getElementById('deck-width');
    function update() {
      const l = parseFloat(lenEl.value) || 0;
      const w = parseFloat(widEl.value) || 0;
      state.sqFt = l * w; state.deckLength = l; state.deckWidth = w;
      updateLinFtDisplay();
    }
    lenEl.addEventListener('input', update);
    widEl.addEventListener('input', update);
  }

  /* ---------- RENDER LAYOUT PATTERN CARDS ---------- */
  function renderLayoutPatterns() {
    const grid = document.getElementById('layout-pattern-grid');
    if (!grid) return;
    grid.innerHTML = '';
    AMERIDEX_PRODUCTS.layoutPatterns.forEach(function (pattern) {
      const card = document.createElement('div');
      card.className = 'product-card';
      card.setAttribute('role', 'radio');
      card.setAttribute('aria-checked', 'false');
      card.setAttribute('tabindex', '0');
      card.dataset.patternId = pattern.id;
      var badge = (pattern.hasBorder || pattern.hasBreaker)
        ? '<div class="product-card-badge">Includes solid accent boards</div>' : '';
      card.innerHTML =
        '<div class="product-card-icon">' + pattern.icon + '</div>' +
        '<div class="product-card-name">' + pattern.label + '</div>' +
        '<div class="product-card-detail">' + pattern.detail + '</div>' + badge;
      card.addEventListener('click', function () {
        document.querySelectorAll('#layout-pattern-grid .product-card').forEach(function (c) {
          c.classList.remove('selected'); c.setAttribute('aria-checked', 'false');
        });
        card.classList.add('selected'); card.setAttribute('aria-checked', 'true');
        state.layoutPatternId = pattern.id;
        document.getElementById('layout-pattern-error').textContent = '';
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
          s.classList.remove('selected'); s.setAttribute('aria-checked', 'false');
        });
        item.classList.add('selected'); item.setAttribute('aria-checked', 'true');
        state.colorId = color.id;
        document.getElementById('color-error').textContent = '';
      });
      item.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); item.click(); }
      });
      grid.appendChild(item);
    });
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
    const P      = AMERIDEX_PRODUCTS;
    const sqFt   = state.sqFt;
    const lines  = [];
    let totalLow = 0, totalHigh = 0;

    const pattern = P.layoutPatterns.find(function (p) { return p.id === state.layoutPatternId; });

    // 1. AmeriDex DrySpace Decking -- exact lin ft, no waste
    if (sqFt > 0) {
      const linFt      = sqFtToLinFt(sqFt);
      const boardCount = linFtToBoardCount(linFt);
      const cost       = linFt * P.groovedBoard.retailPerLinFt;
      lines.push({
        label:      P.groovedBoard.label + ' (' + linFt.toLocaleString() + ' lin ft)',
        low:        cost,
        high:       cost,
        boardCount: boardCount,
        linFt:      linFt
      });
      totalLow  += cost;
      totalHigh += cost;
    }

    // 2. Solid accent boards -- exact lin ft, no waste
    if (pattern && (pattern.hasBorder || pattern.hasBreaker) && sqFt > 0) {
      const solidLf  = calcSolidLinFt(pattern);
      const cost     = solidLf * P.solidBoard.retailPerLinFt;
      var accentDesc = [];
      if (pattern.hasBorder)  accentDesc.push('Picture Frame Border');
      if (pattern.hasBreaker) accentDesc.push('Breaker Board');
      lines.push({
        label: P.solidBoard.label + ' -- ' + accentDesc.join(' + ') + ' (' + solidLf.toLocaleString() + ' lin ft)',
        low:  cost, high: cost
      });
      totalLow  += cost;
      totalHigh += cost;
    }

    // 3. Framing
    if (state.includeFraming && sqFt > 0) {
      const low  = sqFt * P.framing.pricePerSqFt.low;
      const high = sqFt * P.framing.pricePerSqFt.high;
      lines.push({ label: P.framing.label + ' (' + sqFt.toLocaleString() + ' sq ft)', low: low, high: high });
      totalLow  += low; totalHigh += high;
    }

    // 4. Railings
    if (state.accessories.railings) {
      const lf   = state.railingLf || P.accessories.railings.defaultLinFt;
      const low  = lf * P.accessories.railings.pricePerLinFt.low;
      const high = lf * P.accessories.railings.pricePerLinFt.high;
      lines.push({ label: P.accessories.railings.label + ' (' + lf + ' lin ft)', low: low, high: high });
      totalLow  += low; totalHigh += high;
    }

    // 5. Fascia
    if (state.accessories.fascia && sqFt > 0) {
      const len     = state.deckLength || Math.sqrt(sqFt);
      const wid     = state.deckWidth  || Math.sqrt(sqFt);
      const perimLf = Math.ceil(2 * (len + wid));
      const cost    = perimLf * P.solidBoard.retailPerLinFt;
      lines.push({ label: P.accessories.fascia.label + ' (' + perimLf + ' lin ft)', low: cost, high: cost });
      totalLow  += cost; totalHigh += cost;
    }

    // 6. Stairs
    if (state.accessories.stairs) {
      const low  = P.accessories.stairs.flatRate.low;
      const high = P.accessories.stairs.flatRate.high;
      lines.push({ label: P.accessories.stairs.label, low: low, high: high });
      totalLow  += low; totalHigh += high;
    }

    return { lines: lines, totalLow: totalLow, totalHigh: totalHigh };
  }

  /* ---------- BUILD ESTIMATE DISPLAY ---------- */
  function buildEstimate() {
    syncStateFromDOM(4);
    const result  = calcEstimate();
    const P       = AMERIDEX_PRODUCTS;
    const pattern = P.layoutPatterns.find(function (p) { return p.id === state.layoutPatternId; });
    const color   = P.colors.find(function (c) { return c.id === state.colorId; });

    document.getElementById('est-low').textContent  = fmt(result.totalLow);
    document.getElementById('est-high').textContent = fmt(result.totalHigh);

    const tbody = document.getElementById('breakdown-tbody');
    tbody.innerHTML = '';
    result.lines.forEach(function (line) {
      const tr = document.createElement('tr');
      tr.innerHTML = '<td>' + line.label + '</td><td>' + fmt(line.low) + '</td><td>' + fmt(line.high) + '</td>';
      tbody.appendChild(tr);
    });

    const deckLine = result.lines.find(function (l) { return l.boardCount; });
    if (deckLine) {
      const infoRow = document.createElement('tr');
      infoRow.className = 'breakdown-info-row';
      infoRow.innerHTML =
        '<td colspan="3" class="breakdown-board-count">' +
        '&#9432; AmeriDex DrySpace boards needed: <strong>' + deckLine.boardCount + ' boards</strong>' +
        ' &nbsp;&bull;&nbsp; <strong>' + deckLine.linFt.toLocaleString() + ' lin ft</strong>' +
        ' @ ' + state.boardLengthFt + ' ft/board' +
        '</td>';
      tbody.appendChild(infoRow);
    }

    const totRow = document.createElement('tr');
    totRow.className = 'breakdown-total-row';
    totRow.innerHTML =
      '<td><strong>Total Estimate</strong></td>' +
      '<td><strong>' + fmt(result.totalLow)  + '</strong></td>' +
      '<td><strong>' + fmt(result.totalHigh) + '</strong></td>';
    tbody.appendChild(totRow);

    const selList = document.getElementById('selections-list');
    selList.innerHTML = '';
    const linFtField = deckLine ? deckLine.linFt : 0;
    [
      state.sqFt > 0               ? state.sqFt.toLocaleString() + ' sq ft'                        : null,
      linFtField > 0               ? linFtField.toLocaleString() + ' lin ft @ ' + state.boardLengthFt + ' ft boards' : null,
      pattern                      ? pattern.label                                                  : null,
      color                        ? color.label                                                    : null,
      state.includeFraming         ? 'With Framing'                                                : null,
      state.accessories.railings   ? 'Railings'                                                    : null,
      state.accessories.fascia     ? 'Fascia'                                                      : null,
      state.accessories.stairs     ? 'Stairs'                                                      : null
    ].filter(Boolean).forEach(function (text) {
      const li = document.createElement('li'); li.textContent = text; selList.appendChild(li);
    });

    window.ameridexEstimate = {
      sqFt:           state.sqFt,
      deckLength:     state.deckLength,
      deckWidth:      state.deckWidth,
      boardLengthFt:  state.boardLengthFt,
      layoutPattern:  pattern ? pattern.label : '',
      color:          color   ? color.label   : '',
      includeFraming: state.includeFraming,
      accessories:    Object.assign({}, state.accessories),
      totalLow:       result.totalLow,
      totalHigh:      result.totalHigh,
      lines:          result.lines,
      boardCount:     deckLine ? deckLine.boardCount : 0,
      linFt:          deckLine ? deckLine.linFt : 0
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
    renderLayoutPatterns();
    renderColors();
    renderBoardLengthSelector();
    initDimensionListeners();
    initRailingReveal();
    wireButtons();
    updateProgress(1);
  });

  window.wizard = {
    goTo: goTo, restart: restart,
    getState:    function () { return Object.assign({}, state); },
    getEstimate: function () { return calcEstimate(); }
  };

}());
