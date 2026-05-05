(function () {
  'use strict';

  var grid = document.getElementById('services-grid');
  if (grid) {
    var source = new EventSource('/sse/all');
    source.onmessage = function (event) {
      var data = JSON.parse(event.data);
      if (data.type === 'update') {
        updateServiceCard(data.name, data.status);
      }
    };
  }

  var waitStatus = document.getElementById('wait-status');
  if (waitStatus && window.__SERVICE_NAME__) {
    var serviceSource = new EventSource('/sse/' + encodeURIComponent(window.__SERVICE_NAME__));
    var startTime = Date.now();
    var TIMEOUT_MS = 5 * 60 * 1000;

    serviceSource.onmessage = function (event) {
      var data = JSON.parse(event.data);
      if (data.status === 'ready') {
        serviceSource.close();
        showReady();
      } else if (data.status === 'starting') {
        setWaitMessage('Server is starting...');
      } else if (data.status === 'down') {
        setWaitMessage('Sending wake packet...');
      }
    };

    setInterval(function () {
      if (Date.now() - startTime > TIMEOUT_MS) {
        serviceSource.close();
        showTimeout();
      }
    }, 5000);
  }

  function updateServiceCard(name, status) {
    var card = document.querySelector('[data-service="' + name + '"]');
    if (!card) return;

    var badge = card.querySelector('.status-badge');
    if (badge) {
      badge.className = 'status-badge status-' + status;
      badge.textContent = status;
    }

    var actions = card.querySelector('.service-actions');
    if (!actions) return;

    var url = card.getAttribute('data-url') || '#';
    if (status === 'down') {
      actions.innerHTML = '<form method="POST" action="/wake/' + name + '">' +
        '<button type="submit" class="btn btn-wake">Wake</button></form>';
    } else if (status === 'starting') {
      actions.innerHTML = '<span class="spinner-inline"></span>' +
        '<span class="starting-text">Starting...</span>';
    } else if (status === 'ready') {
      actions.innerHTML = '<a href="' + url + '" class="btn btn-open" target="_blank" rel="noopener">Open</a>';
    }
  }

  function setWaitMessage(msg) {
    var el = document.getElementById('wait-message');
    if (el) el.textContent = msg;
  }

  function showReady() {
    var statusEl = document.getElementById('wait-status');
    var actionsEl = document.getElementById('wait-actions');
    if (statusEl) {
      statusEl.innerHTML = '<span class="status-badge status-ready">Ready</span>';
    }
    if (actionsEl) {
      actionsEl.style.display = '';
    }
    setTimeout(function () {
      if (window.__SERVICE_URL__) {
        window.location.href = window.__SERVICE_URL__;
      }
    }, 3000);
  }

  function showTimeout() {
    var statusEl = document.getElementById('wait-status');
    if (statusEl) {
      statusEl.innerHTML = '<p class="timeout-message">Server didn\'t respond in time.</p>' +
        '<form method="POST" action="/wake/' + encodeURIComponent(window.__SERVICE_NAME__) + '">' +
        '<button type="submit" class="btn btn-wake">Try again</button></form>';
    }
  }
})();
