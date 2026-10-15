/* before-after.js — before/after comparison slider + project tabs.
   The control is a native <input type="range"> stretched over the image,
   so mouse drag, touch drag and arrow / Home / End / PageUp / PageDown keys
   all work without custom handlers. JS only mirrors the value into --pos. */
(function () {
  'use strict';
  var NV = (window.NV = window.NV || {});

  NV.beforeAfter = {
    init: function () {
      document.querySelectorAll('[data-ba]').forEach(setupSlider);
      document.querySelectorAll('[data-ba-tabs]').forEach(setupTabs);
    },
    /* Used by the video capture script: animate a slider to a position. */
    animateTo: function (ba, pct) {
      var range = ba.querySelector('.ba__range');
      ba.classList.add('is-animating');
      setPos(ba, range, pct);
      clearTimeout(ba._t);
      ba._t = setTimeout(function () { ba.classList.remove('is-animating'); }, 750);
    }
  };

  function setPos(ba, range, pct) {
    pct = Math.max(0, Math.min(100, +pct));
    range.value = pct;
    ba.style.setProperty('--pos', pct + '%');
    range.setAttribute('aria-valuetext', Math.round(pct) + '% before photo shown');
  }

  function setupSlider(ba) {
    var range = ba.querySelector('.ba__range');
    if (!range) return;
    var dragging = false;

    range.addEventListener('pointerdown', function () { dragging = true; ba.classList.remove('is-animating'); });
    window.addEventListener('pointerup', function () { dragging = false; });
    range.addEventListener('keydown', function () { ba.classList.add('is-animating'); });
    range.addEventListener('input', function () {
      if (dragging) ba.classList.remove('is-animating');
      setPos(ba, range, range.value);
    });
    setPos(ba, range, range.value);
  }

  /* WAI-ARIA tabs: arrow keys move between tabs, automatic activation */
  function setupTabs(wrap) {
    var tabs = Array.prototype.slice.call(wrap.querySelectorAll('[role="tab"]'));
    function select(tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
      });
      if (focus) tab.focus();
    }
    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { select(tab, false); });
      tab.addEventListener('keydown', function (e) {
        var next = null;
        if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
        if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
        if (e.key === 'Home') next = tabs[0];
        if (e.key === 'End') next = tabs[tabs.length - 1];
        if (next) { e.preventDefault(); select(next, true); }
      });
    });
  }
})();
