/* main.js — init / module wiring.
   Classic deferred scripts (not ES modules) so the site runs
   straight from file:// with no server and no build step.   */
(function () {
  'use strict';
  var NV = (window.NV = window.NV || {});

  NV.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var modules = ['nav', 'reveal', 'counters', 'beforeAfter', 'accordion', 'formSteps', 'facades', 'heroParallax'];

  function boot() {
    modules.forEach(function (name) {
      var mod = NV[name];
      if (!mod || typeof mod.init !== 'function') return;
      try { mod.init(); }
      catch (err) { console.error('[NV] ' + name + ' failed to init', err); }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
