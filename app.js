(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // Highlight helpers
  // ---------------------------------------------------------------------------

  /**
   * Given a plain text string and an array of [start, end] ranges (end exclusive),
   * return an HTML string with matching substrings wrapped in <mark class="fs-highlight">.
   * Ranges must be sorted and non-overlapping (SearchEngine guarantees this).
   */
  function applyHighlights(text, ranges) {
    if (!ranges || ranges.length === 0) {
      return escapeHtml(text);
    }

    let html = '';
    let cursor = 0;

    for (const [start, end] of ranges) {
      if (start > cursor) {
        html += escapeHtml(text.slice(cursor, start));
      }
      html +=
        '<mark class="fs-highlight">' +
        escapeHtml(text.slice(start, end)) +
        '</mark>';
      cursor = end;
    }

    if (cursor < text.length) {
      html += escapeHtml(text.slice(cursor));
    }

    return html;
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // ---------------------------------------------------------------------------
  // Rendering
  // ---------------------------------------------------------------------------

  /**
   * Render a single result card.
   * Each result object from SearchEngine.query is expected to contain:
   *   { id, title, description, tags[], highlights: { title: [], description: [] } }
   */
  function renderCard(result) {
    const highlights = result.highlights || {};
    const titleRanges = highlights.title || [];
    const descRanges = highlights.description || [];

    const titleHtml = applyHighlights(result.title, titleRanges);
    const descHtml = applyHighlights(result.description, descRanges);

    const tagsHtml = (result.tags || [])
      .map(function (tag) {
        return '<span class="fs-tag">' + escapeHtml(tag) + '</span>';
      })
      .join('');

    return (
      '<article class="fs-card">' +
      '<h2 class="fs-card__title">' + titleHtml + '</h2>' +
      '<p class="fs-card__desc">' + descHtml + '</p>' +
      (tagsHtml
        ? '<div class="fs-card__tags">' + tagsHtml + '</div>'
        : '') +
      '</article>'
    );
  }

  /**
   * Render the full results area.
   * @param {Array}  results  - array returned by SearchEngine.query
   * @param {string} term     - the raw search term (used for count message)
   */
  function renderResults(results, term) {
    const container = document.getElementById('fs-results');
    if (!container) return;

    const trimmed = term.trim();

    // Empty query → clear the results area entirely
    if (trimmed === '') {
      container.innerHTML = '';
      return;
    }

    // No matches
    if (results.length === 0) {
      container.innerHTML =
        '<p class="fs-empty">No results found for <strong>' +
        escapeHtml(trimmed) +
        '</strong>.</p>';
      return;
    }

    // Count line + cards
    const countHtml =
      '<p class="fs-count">' +
      results.length +
      ' result' +
      (results.length === 1 ? '' : 's') +
      ' for <strong>' +
      escapeHtml(trimmed) +
      '</strong></p>';

    const cardsHtml = results.map(renderCard).join('');

    container.innerHTML = countHtml + cardsHtml;
  }

  // ---------------------------------------------------------------------------
  // Wiring
  // ---------------------------------------------------------------------------

  document.addEventListener('DOMContentLoaded', function () {
    const input = document.getElementById('fs-search-input');
    const resultsContainer = document.getElementById('fs-results');

    if (!input) {
      console.warn('app.js: #fs-search-input not found in DOM.');
      return;
    }

    if (!resultsContainer) {
      console.warn('app.js: #fs-results not found in DOM.');
      return;
    }

    if (!window.SearchEngine || typeof window.SearchEngine.query !== 'function') {
      console.warn('app.js: window.SearchEngine.query is not available. Make sure search.js is loaded first.');
      return;
    }

    if (!Array.isArray(window.SEARCH_DATA)) {
      console.warn('app.js: window.SEARCH_DATA is not available. Make sure data.js is loaded first.');
      return;
    }

    function handleInput() {
      const term = input.value;
      const results = window.SearchEngine.query(term, window.SEARCH_DATA);
      renderResults(results, term);
    }

    input.addEventListener('input', handleInput);

    // If the page loads with a pre-filled value (e.g. browser auto-fill), run once
    if (input.value.trim() !== '') {
      handleInput();
    }
  });
})();
