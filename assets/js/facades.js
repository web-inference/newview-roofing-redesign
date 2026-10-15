/* facades.js — click-to-load facades for YouTube, Google Maps and Instagram.
   Zero third-party requests on first load: the iframe is only created after
   the visitor asks for it. Also wires the service-area chips to the map.  */
(function () {
  'use strict';
  var NV = (window.NV = window.NV || {});

  NV.facades = {
    init: function () {
      document.querySelectorAll('[data-facade]').forEach(function (el) {
        var btn = el.querySelector('button');
        if (!btn) return;
        btn.addEventListener('click', function () { load(el); }, { once: true });
      });
      initAreaChips();
    }
  };

  function load(el) {
    var iframe = document.createElement('iframe');
    iframe.src = el.dataset.src;
    iframe.title = el.dataset.title || 'Embedded content';
    iframe.loading = 'lazy';
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    if (el.dataset.facade === 'youtube') {
      iframe.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen';
      iframe.allowFullscreen = true;
    }
    el.appendChild(iframe);
    el.classList.add('is-loaded');
    iframe.focus();
  }

  /* Hovering a city chip highlights its dot on the SVG map (decorative —
     the city list itself is the accessible content, so chips stay non-focusable) */
  function initAreaChips() {
    document.querySelectorAll('[data-city-chip]').forEach(function (chip) {
      var dot = document.querySelector('.dfw-map__city[data-city="' + chip.dataset.cityChip + '"]');
      if (!dot) return;
      chip.addEventListener('mouseenter', function () { chip.classList.add('is-active'); dot.classList.add('is-active'); });
      chip.addEventListener('mouseleave', function () { chip.classList.remove('is-active'); dot.classList.remove('is-active'); });
    });
  }
})();
