/* nav.js — sticky header shadow, mobile drawer, active section */
(function () {
  'use strict';
  var NV = (window.NV = window.NV || {});

  NV.nav = {
    init: function () {
      var header = document.querySelector('[data-header]');
      if (!header) return;
      initScrollState(header);
      initDrawer(header);
      initActiveLinks();
    }
  };

  /* Shadow appears on scroll only. A 1px sentinel avoids scroll listeners. */
  function initScrollState(header) {
    var sentinel = document.createElement('div');
    sentinel.setAttribute('aria-hidden', 'true');
    sentinel.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:8px;pointer-events:none';
    document.body.prepend(sentinel);
    new IntersectionObserver(function (entries) {
      header.classList.toggle('is-scrolled', !entries[0].isIntersecting);
    }).observe(sentinel);
  }

  function initDrawer(header) {
    var toggle = header.querySelector('[data-nav-toggle]');
    var drawer = document.getElementById(toggle && toggle.getAttribute('aria-controls'));
    if (!toggle || !drawer) return;

    var label = toggle.querySelector('[data-nav-label]');
    // Everything outside header + drawer becomes inert while open (focus containment)
    var outside = Array.prototype.filter.call(document.body.children, function (el) {
      return el !== header && el !== drawer && el.tagName !== 'SCRIPT';
    });

    function setOpen(open) {
      toggle.setAttribute('aria-expanded', String(open));
      if (label) label.textContent = open ? 'Close' : 'Menu';
      drawer.hidden = !open;
      document.body.classList.toggle('drawer-open', open);
      outside.forEach(function (el) { el.inert = open; });
      if (open) {
        var first = drawer.querySelector('a, button');
        if (first) first.focus();
      }
    }

    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });
    drawer.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        toggle.focus();
      }
    });
    window.matchMedia('(min-width: 1024px)').addEventListener('change', function (mq) {
      if (mq.matches) setOpen(false);
    });
  }

  /* Underline the nav item for the section currently in view */
  function initActiveLinks() {
    var links = document.querySelectorAll('.site-nav a[href^="#"]');
    if (!links.length) return;
    var map = {};
    links.forEach(function (a) {
      var target = document.querySelector(a.getAttribute('href'));
      if (target) map[target.id] = a;
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var link = map[entry.target.id];
        if (!link) return;
        if (entry.isIntersecting) {
          links.forEach(function (l) { l.removeAttribute('aria-current'); });
          link.setAttribute('aria-current', 'true');
        } else if (link.getAttribute('aria-current')) {
          link.removeAttribute('aria-current');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(map).forEach(function (id) { io.observe(document.getElementById(id)); });
  }
})();
