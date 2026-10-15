/* counters.js — stat count-up on the trust band.
   The real number is in the HTML (works without JS / for screen readers);
   the animation only runs when motion is allowed. Tabular numerals in CSS
   keep the width steady while digits change.                             */
(function () {
  'use strict';
  var NV = (window.NV = window.NV || {});
  var DURATION = 1600;

  NV.counters = {
    init: function () {
      var els = document.querySelectorAll('[data-count]');
      if (!els.length || NV.reducedMotion || !('IntersectionObserver' in window)) return;

      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          io.unobserve(entry.target);
          run(entry.target);
        });
      }, { threshold: 0.6 });

      els.forEach(function (el) {
        el.textContent = format(0, +el.dataset.decimals || 0);
        io.observe(el);
      });
    },
    run: run
  };

  function format(n, decimals) {
    return n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  }

  function run(el) {
    var target = parseFloat(el.dataset.count);
    var decimals = +el.dataset.decimals || 0;
    var start = null;
    // aria-hidden while ticking so screen readers don't announce every frame
    el.setAttribute('aria-hidden', 'true');
    function frame(t) {
      if (start === null) start = t;
      var p = Math.min((t - start) / DURATION, 1);
      var eased = 1 - Math.pow(1 - p, 4); // easeOutQuart
      el.textContent = format(target * eased, decimals);
      if (p < 1) requestAnimationFrame(frame);
      else {
        el.textContent = format(target, decimals);
        el.removeAttribute('aria-hidden');
      }
    }
    requestAnimationFrame(frame);
  }
})();
