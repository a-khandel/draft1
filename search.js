/**
 * search.js
 * Full-text search engine with tokenizing, TF-style scoring,
 * filtering, and highlight range computation.
 * Exposes: window.SearchEngine
 */

(function (global) {
  "use strict";

  /**
   * Normalize and tokenize a string into an array of lowercase tokens.
   * Strips punctuation, splits on whitespace.
   * @param {string} str
   * @returns {string[]}
   */
  function tokenize(str) {
    if (!str || typeof str !== "string") return [];
    return str
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter(function (t) { return t.length > 0; });
  }

  /**
   * Compute term frequency (TF) for a single token within an array of tokens.
   * TF = count of term in document / total tokens in document.
   * @param {string} term
   * @param {string[]} tokens
   * @returns {number}
   */
  function termFrequency(term, tokens) {
    if (!tokens.length) return 0;
    var count = 0;
    for (var i = 0; i < tokens.length; i++) {
      if (tokens[i] === term) count++;
    }
    return count / tokens.length;
  }

  /**
   * Check whether a token "matches" a query term.
   * Supports exact match and prefix match (queryTerm is prefix of token).
   * @param {string} token
   * @param {string} queryTerm
   * @returns {boolean}
   */
  function tokenMatches(token, queryTerm) {
    return token === queryTerm || token.indexOf(queryTerm) === 0;
  }

  /**
   * Score a single document against an array of query terms.
   * Weights: title match = 3x, tag match = 2x, description match = 1x.
   * Uses prefix-aware TF-style scoring.
   * @param {Object} doc  - {id, title, description, tags}
   * @param {string[]} queryTerms
   * @returns {number}
   */
  function scoreDocument(doc, queryTerms) {
    if (!queryTerms.length) return 0;

    var titleTokens = tokenize(doc.title || "");
    var descTokens  = tokenize(doc.description || "");
    var tagTokens   = [];
    if (Array.isArray(doc.tags)) {
      doc.tags.forEach(function (tag) {
        tokenize(tag).forEach(function (t) { tagTokens.push(t); });
      });
    }

    var score = 0;

    queryTerms.forEach(function (qTerm) {
      // Title: weight 3
      titleTokens.forEach(function (t) {
        if (tokenMatches(t, qTerm)) {
          score += 3 * (1 / titleTokens.length);
        }
      });

      // Tags: weight 2
      tagTokens.forEach(function (t) {
        if (tokenMatches(t, qTerm)) {
          score += 2 * (1 / Math.max(tagTokens.length, 1));
        }
      });

      // Description: weight 1
      descTokens.forEach(function (t) {
        if (tokenMatches(t, qTerm)) {
          score += 1 * (1 / Math.max(descTokens.length, 1));
        }
      });
    });

    // Bonus for matching ALL query terms (encourages complete phrase match)
    var allFieldTokens = titleTokens.concat(tagTokens).concat(descTokens);
    var allMatched = queryTerms.every(function (qTerm) {
      return allFieldTokens.some(function (t) { return tokenMatches(t, qTerm); });
    });
    if (allMatched && queryTerms.length > 1) {
      score *= 1.5;
    }

    return score;
  }

  /**
   * Find all highlight ranges [{start, end}] for a query string within a text.
   * Ranges are character indices into `text` (end is exclusive).
   * Matches are case-insensitive; each query term is matched independently.
   * @param {string} text
   * @param {string[]} queryTerms
   * @returns {Array<{start: number, end: number}>}
   */
  function findHighlightRanges(text, queryTerms) {
    if (!text || !queryTerms.length) return [];

    var lowerText = text.toLowerCase();
    var ranges = [];

    queryTerms.forEach(function (qTerm) {
      if (!qTerm) return;
      var idx = 0;
      while (idx < lowerText.length) {
        var pos = lowerText.indexOf(qTerm, idx);
        if (pos === -1) break;
        ranges.push({ start: pos, end: pos + qTerm.length });
        idx = pos + 1;
      }
    });

    // Sort ranges by start position, then merge overlapping/adjacent ranges
    ranges.sort(function (a, b) { return a.start - b.start; });
    var merged = [];
    ranges.forEach(function (range) {
      if (!merged.length) {
        merged.push({ start: range.start, end: range.end });
        return;
      }
      var last = merged[merged.length - 1];
      if (range.start <= last.end) {
        // Overlapping or adjacent — extend if needed
        if (range.end > last.end) last.end = range.end;
      } else {
        merged.push({ start: range.start, end: range.end });
      }
    });

    return merged;
  }

  /**
   * Main query function.
   * Filters documents that have at least one match, scores them,
   * sorts descending by score, and attaches highlight ranges.
   *
   * @param {string} term   - Raw search string from the user
   * @param {Array}  data   - Array of {id, title, description, tags[]}
   * @returns {Array} Sorted result objects:
   *   {id, title, description, tags, score,
   *    titleRanges, descRanges, tagRanges}
   */
  function query(term, data) {
    if (!term || !term.trim() || !Array.isArray(data)) return [];

    var queryTerms = tokenize(term);
    if (!queryTerms.length) return [];

    var results = [];

    data.forEach(function (doc) {
      var score = scoreDocument(doc, queryTerms);
      if (score <= 0) return; // Filter out non-matching documents

      // Build per-field highlight ranges
      var titleRanges = findHighlightRanges(doc.title || "", queryTerms);
      var descRanges  = findHighlightRanges(doc.description || "", queryTerms);

      // Flatten tags into individual range sets
      var tagRanges = [];
      if (Array.isArray(doc.tags)) {
        tagRanges = doc.tags.map(function (tag) {
          return {
            tag: tag,
            ranges: findHighlightRanges(tag, queryTerms)
          };
        });
      }

      results.push({
        id:          doc.id,
        title:       doc.title,
        description: doc.description,
        tags:        doc.tags,
        score:       score,
        titleRanges: titleRanges,
        descRanges:  descRanges,
        tagRanges:   tagRanges
      });
    });

    // Sort by score descending
    results.sort(function (a, b) { return b.score - a.score; });

    return results;
  }

  // Expose public API
  global.SearchEngine = {
    query:               query,
    // Expose helpers for testing / external use
    tokenize:            tokenize,
    findHighlightRanges: findHighlightRanges,
    scoreDocument:       scoreDocument
  };

}(window));
