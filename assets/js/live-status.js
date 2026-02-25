(function () {
  'use strict';

  var POLL_MS = 30000;
  var endpoint = '/api/live-status';
  var buttons = document.querySelectorAll('.js-live-btn');
  if (!buttons.length) return;

  // Only poll when the Cloudflare Worker is deployed (production domain)
  var host = window.location.hostname;
  if (host !== 'thewell-church.com' && host !== 'www.thewell-church.com') return;

  var timer = null;

  function setLive(show) {
    for (var i = 0; i < buttons.length; i++) {
      if (show) buttons[i].removeAttribute('hidden');
      else buttons[i].setAttribute('hidden', '');
    }
  }

  function check() {
    fetch(endpoint).then(function (r) { return r.json(); }).then(function (d) {
      setLive(d && d.is_live);
    }).catch(function () { /* leave buttons hidden on error */ });
  }

  function startPolling() {
    if (timer) return;
    check();
    timer = setInterval(check, POLL_MS);
  }

  function stopPolling() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  // Start/stop polling based on page visibility
  startPolling();
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stopPolling();
    else startPolling();
  });
})();
