/* reveal.js — IntersectionObserver scroll reveals.
   24px rise + fade, 80ms stagger. Children of a [data-reveal-group]
   get their stagger index (--i) assigned automatically.
   With reduced motion, everything is shown immediately.           */
(function () {
  'use strict';
  var NV = (window.NV = window.NV || {});

  NV.reveal = {
    init: function () {
      // Assign stagger indices within groups
      document.querySelectorAll('[data-reveal-group]').forEach(function (group) {
        group.querySelectorAll('[data-reveal], [data-draw]').forEach(function (el, i) {
          if (!el.style.getPropertyValue('--i')) el.style.setProperty('--i', i);
        });
      });

      var targets = document.querySelectorAll('[data-reveal], [data-draw]');
      if (NV.reducedMotion || !('IntersectionObserver' in window)) {
        targets.forEach(function (el) { el.classList.add('is-revealed'); });
        return;
      }

      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-revealed');
          entry.target.dispatchEvent(new CustomEvent('nv:revealed', { bubbles: true }));
          io.unobserve(entry.target);
        });
      }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });

      targets.forEach(function (el) { io.observe(el); });
    }
  };
})();
