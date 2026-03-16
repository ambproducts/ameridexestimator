/* ==========================================================
   AMERIDEX ESTIMATOR - Validation Helpers
   Standalone validation utilities used by lead.js.
   All functions are pure (no DOM side effects) except
   applyFieldError / clearFieldError which take an element.
   ========================================================== */

(function () {
  'use strict';

  const Validation = {

    /* --- Field-level helpers --- */
    applyFieldError: function (inputEl, errorEl, msg) {
      if (inputEl) inputEl.classList.add('error');
      if (errorEl) errorEl.textContent = msg;
    },

    clearFieldError: function (inputEl, errorEl) {
      if (inputEl) inputEl.classList.remove('error');
      if (errorEl) errorEl.textContent = '';
    },

    /* --- Rule checks (return true if VALID) --- */
    isNonEmpty: function (val) {
      return typeof val === 'string' && val.trim().length > 0;
    },

    isEmail: function (val) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test((val || '').trim());
    },

    isPhone: function (val) {
      // Optional field - blank is fine; if filled must have >= 7 digits
      if (!val || val.trim() === '') return true;
      return (val.replace(/\D/g, '').length >= 7);
    },

    isZip: function (val) {
      // Optional field - blank is fine; if filled must be 5 digits (US) or valid postal
      if (!val || val.trim() === '') return true;
      return /^[0-9]{5}(-[0-9]{4})?$/.test(val.trim());
    },

    /* --- Lead form full validation --- */
    validateLeadForm: function () {
      let valid = true;

      const nameEl   = document.getElementById('lead-name');
      const emailEl  = document.getElementById('lead-email');
      const phoneEl  = document.getElementById('lead-phone');
      const zipEl    = document.getElementById('lead-zip');

      const nameErr  = document.getElementById('lead-name-error');
      const emailErr = document.getElementById('lead-email-error');
      const zipErr   = document.getElementById('lead-zip-error');

      // Clear all first
      [nameEl, emailEl, phoneEl, zipEl].forEach(function (el) {
        if (el) el.classList.remove('error');
      });
      [nameErr, emailErr, zipErr].forEach(function (el) {
        if (el) el.textContent = '';
      });

      // Name: optional but if provided must not be only whitespace
      // (we only hard-require email)

      // Email: required
      if (!Validation.isEmail(emailEl ? emailEl.value : '')) {
        Validation.applyFieldError(emailEl, emailErr, 'Please enter a valid email address.');
        valid = false;
      }

      // Phone: optional, validate format if filled
      if (phoneEl && phoneEl.value.trim() !== '' && !Validation.isPhone(phoneEl.value)) {
        phoneEl.classList.add('error');
        valid = false;
      }

      // ZIP: optional, validate format if filled
      if (zipEl && zipEl.value.trim() !== '' && !Validation.isZip(zipEl.value)) {
        Validation.applyFieldError(zipEl, zipErr, 'Please enter a valid ZIP code (e.g. 08742).');
        valid = false;
      }

      return valid;
    }

  };

  window.Validation = Validation;

}());
