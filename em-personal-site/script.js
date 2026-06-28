/* script.js — smooth scroll + active nav highlight for Em's site */

// ─── Smooth Scroll ───────────────────────────────────────────────────────────
// Polyfill-style: intercept anchor clicks so every browser gets smooth scroll.
document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
  anchor.addEventListener('click', function (e) {
    var targetId = this.getAttribute('href');
    var target = document.querySelector(targetId);
    if (!target) return;

    e.preventDefault();

    target.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Keep URL in sync without jumping
    if (history.pushState) {
      history.pushState(null, null, targetId);
    }
  });
});

// ─── Active Nav Highlight on Scroll ──────────────────────────────────────────
(function () {
  var sections = document.querySelectorAll('main section[id]');
  var navLinks = document.querySelectorAll('.nav__link');

  if (!sections.length || !navLinks.length) return;

  var ACTIVE_CLASS = 'nav__link--active';

  function setActive(id) {
    navLinks.forEach(function (link) {
      var href = link.getAttribute('href');
      if (href === '#' + id) {
        link.classList.add(ACTIVE_CLASS);
      } else {
        link.classList.remove(ACTIVE_CLASS);
      }
    });
  }

  // Use IntersectionObserver when available (modern browsers).
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        });
      },
      {
        // Trigger when the top of a section crosses the upper-third of viewport
        rootMargin: '0px 0px -60% 0px',
        threshold: 0,
      }
    );

    sections.forEach(function (section) {
      observer.observe(section);
    });
  } else {
    // Fallback: scroll-event approach for older browsers
    function onScroll() {
      var scrollY = window.pageYOffset || document.documentElement.scrollTop;
      var current = '';

      sections.forEach(function (section) {
        var sectionTop = section.offsetTop - 80; // account for fixed nav height
        if (scrollY >= sectionTop) {
          current = section.id;
        }
      });

      if (current) setActive(current);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // run once on load
  }
})();
