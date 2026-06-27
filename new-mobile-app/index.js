/**
 * index.js
 * Main JavaScript entry point for app initialisation and logic.
 * New Mobile App
 */

'use strict';

/* ─────────────────────────────────────────────
   Design tokens (mirrors styles.css variables)
───────────────────────────────────────────── */
const TOKENS = {
  colorPrimary:    '#4F46E5',
  colorBackground: '#F9FAFB',
  colorText:       '#111827',
};

/* ─────────────────────────────────────────────
   App state
───────────────────────────────────────────── */
const state = {
  isReady: false,
};

/* ─────────────────────────────────────────────
   Utility helpers
───────────────────────────────────────────── */

/**
 * Selects a single DOM element.
 * @param {string} selector
 * @param {Element} [root=document]
 * @returns {Element|null}
 */
function qs(selector, root = document) {
  return root.querySelector(selector);
}

/**
 * Logs a namespaced message to the console.
 * @param {...any} args
 */
function log(...args) {
  console.log('[App]', ...args);
}

/* ─────────────────────────────────────────────
   Navigation
───────────────────────────────────────────── */

/**
 * Highlights the active navigation link that matches the current path.
 */
function initNavigation() {
  const navLinks = document.querySelectorAll('.app__nav-link');
  const currentPath = window.location.pathname;

  navLinks.forEach((link) => {
    if (link.getAttribute('href') === currentPath) {
      link.classList.add('app__nav-link--active');
      link.setAttribute('aria-current', 'page');
    }
  });

  log('Navigation initialised.');
}

/* ─────────────────────────────────────────────
   Theme
───────────────────────────────────────────── */

/**
 * Applies stored theme preference or falls back to the system preference.
 */
function initTheme() {
  const stored = localStorage.getItem('theme');
  const prefersDark =
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = stored || (prefersDark ? 'dark' : 'light');

  document.documentElement.setAttribute('data-theme', theme);
  log(`Theme set to "${theme}".`);
}

/**
 * Toggles between light and dark themes and persists the choice.
 */
function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  log(`Theme toggled to "${next}".`);
}

/* ─────────────────────────────────────────────
   Event listeners
───────────────────────────────────────────── */

/**
 * Binds all global UI event listeners.
 */
function bindEvents() {
  // Theme toggle button (optional element)
  const themeToggleBtn = qs('#theme-toggle');
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', toggleTheme);
  }

  // Mobile menu toggle (optional element)
  const menuBtn  = qs('#menu-toggle');
  const menuEl   = qs('.app__nav');
  if (menuBtn && menuEl) {
    menuBtn.addEventListener('click', () => {
      const isOpen = menuEl.classList.toggle('app__nav--open');
      menuBtn.setAttribute('aria-expanded', String(isOpen));
      log(`Mobile menu ${isOpen ? 'opened' : 'closed'}.`);
    });
  }

  log('Event listeners bound.');
}

/* ─────────────────────────────────────────────
   Initialisation
───────────────────────────────────────────── */

/**
 * Bootstraps the application.
 */
function init() {
  if (state.isReady) return;

  log('Initialising…');

  initTheme();
  initNavigation();
  bindEvents();

  state.isReady = true;
  log('App ready.', TOKENS);
}

// Run after the DOM is fully parsed.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
