/* form-steps.js — two-step inspection form.
   Inline validation on blur + on step change, honeypot + time-trap spam
   protection, success state. No backend: the payload is logged.          */
(function () {
  'use strict';
  var NV = (window.NV = window.NV || {});
  var MIN_FILL_MS = 3000; // submissions faster than this are treated as bots

  var RULES = {
    name: function (v) { return v.trim().length >= 2 || 'Please enter your full name.'; },
    phone: function (v) { return v.replace(/\D/g, '').replace(/^1/, '').length === 10 || 'Please enter a 10-digit phone number.'; },
    email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) || 'Please enter a valid email address.'; },
    zip: function (v) { return /^\d{5}$/.test(v.trim()) || 'Please enter a 5-digit ZIP code.'; },
    address: function (v) { return v.trim().length >= 4 || 'Please enter the property’s street address.'; },
    city: function (v) { return v.trim().length >= 2 || 'Please enter the city.'; },
    message: function () { return true; }
  };

  NV.formSteps = {
    init: function () {
      // [data-steps] = two-step form; [data-quick-form] = single-step (hero) form
      document.querySelectorAll('form[data-steps], form[data-quick-form]').forEach(setup);
    }
  };

  function setup(form) {
    var started = Date.now();
    var stamp = form.querySelector('[name="form_started"]');
    if (stamp) stamp.value = String(started);

    var steps = form.querySelectorAll('[data-step]');
    var label = form.querySelector('[data-step-label]');
    var status = form.querySelector('[data-status]');
    var success = form.parentElement.querySelector('[data-success]');
    var labels = ['Step 1 of 2 — Your details', 'Step 2 of 2 — Your property'];
    form.dataset.current = '1';

    // Phone: format as (555) 555-5555 while typing
    var phone = form.querySelector('[name="phone"]');
    if (phone) phone.addEventListener('input', function () {
      var d = phone.value.replace(/\D/g, '').replace(/^1/, '').slice(0, 10);
      var out = d;
      if (d.length > 6) out = '(' + d.slice(0, 3) + ') ' + d.slice(3, 6) + '-' + d.slice(6);
      else if (d.length > 3) out = '(' + d.slice(0, 3) + ') ' + d.slice(3);
      phone.value = out;
    });
    var zip = form.querySelector('[name="zip"]');
    if (zip) zip.addEventListener('input', function () { zip.value = zip.value.replace(/\D/g, '').slice(0, 5); });

    // Validate on blur once a field has been touched
    form.querySelectorAll('input, textarea').forEach(function (el) {
      if (!RULES[el.name]) return;
      el.addEventListener('blur', function () { if (el.value) check(el); });
      el.addEventListener('input', function () { if (el.closest('.field').classList.contains('is-invalid')) check(el); });
    });

    function check(el) {
      var res = RULES[el.name](el.value);
      var field = el.closest('.field');
      var err = field.querySelector('[data-error]');
      var ok = res === true;
      field.classList.toggle('is-invalid', !ok);
      el.setAttribute('aria-invalid', String(!ok));
      if (err) err.textContent = ok ? '' : res;
      return ok;
    }

    function validateStep(step) {
      var first = null;
      step.querySelectorAll('input, textarea').forEach(function (el) {
        if (!RULES[el.name]) return;
        if (!check(el) && !first) first = el;
      });
      if (first) { first.focus(); return false; }
      return true;
    }

    function go(n) {
      steps.forEach(function (s) {
        var on = s.dataset.step === String(n);
        s.hidden = !on;
        s.classList.toggle('is-entering', on);
      });
      form.dataset.current = String(n);
      if (label) label.textContent = labels[n - 1];
      var first = form.querySelector('[data-step="' + n + '"] input');
      if (first) first.focus();
    }

    var next = form.querySelector('[data-next]');
    var back = form.querySelector('[data-back]');
    if (next) next.addEventListener('click', function () { if (validateStep(steps[0])) go(2); });
    if (back) back.addEventListener('click', function () { go(1); });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (status) status.textContent = '';
      if (steps.length) {
        if (!validateStep(steps[0])) { go(1); validateStep(steps[0]); return; }
        if (!validateStep(steps[1])) return;
      } else if (!validateStep(form)) return;

      var data = Object.fromEntries(new FormData(form).entries());
      var tooFast = Date.now() - started < MIN_FILL_MS;
      var honeypot = !!data.company_website;
      if (honeypot || tooFast) {
        // Silently "succeed" so bots get no signal; nothing is sent.
        console.warn('[NV form] Blocked as spam', { honeypot: honeypot, tooFast: tooFast });
      } else {
        delete data.company_website;
        data.submitted_at = new Date().toISOString();
        data.page = location.pathname;
        console.log('[NV form] Inspection request (no backend in demo):', data);
      }
      form.hidden = true;
      if (success) { success.hidden = false; success.focus(); }
    });
  }
})();
