/* accordion.js — FAQ disclosure buttons with aria-expanded.
   Without JS the panels stay [hidden] and the "Read the full answer" links
   still work. With JS, panels animate open via CSS grid rows.            */
(function () {
  'use strict';
  var NV = (window.NV = window.NV || {});

  NV.accordion = {
    init: function () {
      document.querySelectorAll('[data-accordion]').forEach(function (acc) {
        acc.classList.add('is-enhanced');
        acc.querySelectorAll('.acc__btn').forEach(function (btn) {
          var panel = document.getElementById(btn.getAttribute('aria-controls'));
          if (!panel) return;
          panel.hidden = false; // CSS (.is-enhanced) now handles collapsed state
          btn.addEventListener('click', function () {
            toggle(btn, panel, btn.getAttribute('aria-expanded') !== 'true');
          });
        });
      });

      // Open the matching question when arriving via #faq-a-N
      var hash = location.hash && document.querySelector(location.hash + '.acc__panel');
      if (hash) {
        var b = document.getElementById(hash.getAttribute('aria-labelledby'));
        if (b) toggle(b, hash, true);
      }
    },
    toggle: toggle
  };

  function toggle(btn, panel, open) {
    btn.setAttribute('aria-expanded', String(open));
    panel.classList.toggle('is-open', open);
  }
})();
