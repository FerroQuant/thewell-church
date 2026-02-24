/**
 * protect.js — Basic copy/scrape protection for The Well Church website.
 * Disables right-click context menu, text selection, and common shortcuts.
 * Forms remain usable (inputs/textareas are excluded from selection block).
 */
(function () {
  'use strict';

  // Disable right-click context menu
  document.addEventListener('contextmenu', function (e) {
    e.preventDefault();
  });

  // Block copy/save/view-source keyboard shortcuts
  document.addEventListener('keydown', function (e) {
    // Ctrl+U (view source), Ctrl+S (save), Ctrl+Shift+I (dev tools)
    if (e.ctrlKey && (e.key === 'u' || e.key === 'U' || e.key === 's' || e.key === 'S')) {
      e.preventDefault();
    }
    if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j')) {
      e.preventDefault();
    }
    // F12 (dev tools)
    if (e.key === 'F12') {
      e.preventDefault();
    }
  });

  // Disable drag on images
  document.addEventListener('dragstart', function (e) {
    if (e.target.tagName === 'IMG') {
      e.preventDefault();
    }
  });
})();
