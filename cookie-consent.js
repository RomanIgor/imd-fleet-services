(function () {
  var STORAGE_KEY = 'imd-cookie-consent-v1';
  var DEFAULT_STATE = {
    necessary: true,
    statistics: false,
    marketing: false,
    updatedAt: null
  };

  function readConsent() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      return Object.assign({}, DEFAULT_STATE, parsed, { necessary: true });
    } catch (err) {
      return null;
    }
  }

  function saveConsent(next) {
    var consent = Object.assign({}, DEFAULT_STATE, next, {
      necessary: true,
      updatedAt: new Date().toISOString()
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
    window.imdCookieConsent = consent;
    window.dispatchEvent(new CustomEvent('imdConsentChanged', { detail: consent }));
    runDeferredScripts(consent);
    return consent;
  }

  function hasConsent(category) {
    var consent = window.imdCookieConsent || readConsent();
    return !!(consent && consent[category]);
  }

  function runDeferredScripts(consent) {
    document.querySelectorAll('script[type="text/plain"][data-consent-category]').forEach(function (script) {
      var category = script.getAttribute('data-consent-category');
      if (!consent[category] || script.dataset.loaded === 'true') return;
      var active = document.createElement('script');
      Array.prototype.slice.call(script.attributes).forEach(function (attr) {
        if (attr.name !== 'type' && attr.name !== 'data-consent-category' && attr.name !== 'data-loaded') {
          active.setAttribute(attr.name, attr.value);
        }
      });
      active.text = script.text || script.textContent || '';
      script.dataset.loaded = 'true';
      script.parentNode.insertBefore(active, script.nextSibling);
    });
  }

  function injectStyles() {
    if (document.getElementById('imd-cookie-styles')) return;
    var style = document.createElement('style');
    style.id = 'imd-cookie-styles';
    style.textContent = [
      '.imd-cookie-layer{position:fixed;inset:auto 20px 20px;z-index:2147483000;display:flex;justify-content:center;pointer-events:none}',
      '.imd-cookie-box{width:min(980px,100%);display:grid;grid-template-columns:1.25fr .95fr;gap:18px;padding:18px;border:1px solid rgba(255,255,255,.16);border-radius:20px;background:linear-gradient(145deg,rgba(24,29,37,.92),rgba(13,18,25,.90));box-shadow:0 24px 70px rgba(0,0,0,.42),inset 0 1px rgba(255,255,255,.08);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);color:#eef2f6;pointer-events:auto}',
      '.imd-cookie-kicker{font:700 10px/1.2 IBM Plex Sans,Arial,sans-serif;letter-spacing:.16em;text-transform:uppercase;color:rgba(238,242,246,.52);margin-bottom:8px}',
      '.imd-cookie-title{font:800 20px/1.18 IBM Plex Sans,Arial,sans-serif;letter-spacing:-.02em;margin:0 0 8px;color:#fff}',
      '.imd-cookie-text{font:400 13px/1.65 IBM Plex Sans,Arial,sans-serif;color:rgba(245,245,241,.68);margin:0}',
      '.imd-cookie-link{color:#fff;text-decoration:underline;text-underline-offset:3px}',
      '.imd-cookie-options{display:grid;gap:8px}',
      '.imd-cookie-option{display:grid;grid-template-columns:1fr auto;gap:12px;align-items:center;padding:11px 12px;border:1px solid rgba(255,255,255,.12);border-radius:14px;background:rgba(255,255,255,.045)}',
      '.imd-cookie-option strong{display:block;font:700 12px/1.2 IBM Plex Sans,Arial,sans-serif;color:#fff}',
      '.imd-cookie-option span{display:block;margin-top:3px;font:400 11px/1.35 IBM Plex Sans,Arial,sans-serif;color:rgba(245,245,241,.58)}',
      '.imd-cookie-toggle{width:44px;height:24px;border:1px solid rgba(255,255,255,.22);border-radius:999px;background:rgba(255,255,255,.08);position:relative;cursor:pointer;transition:.18s}',
      '.imd-cookie-toggle::after{content:"";position:absolute;left:3px;top:3px;width:16px;height:16px;border-radius:50%;background:rgba(255,255,255,.82);transition:.18s}',
      '.imd-cookie-toggle[aria-checked="true"]{background:rgba(255,255,255,.86);border-color:rgba(255,255,255,.9)}',
      '.imd-cookie-toggle[aria-checked="true"]::after{left:23px;background:#111827}',
      '.imd-cookie-toggle[aria-disabled="true"]{cursor:not-allowed;opacity:.72}',
      '.imd-cookie-actions{grid-column:1/-1;display:flex;justify-content:flex-end;gap:10px;flex-wrap:wrap;margin-top:2px}',
      '.imd-cookie-btn{height:40px;padding:0 15px;border-radius:10px;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.06);color:#fff;font:700 12px/1 IBM Plex Sans,Arial,sans-serif;cursor:pointer}',
      '.imd-cookie-btn:hover{background:rgba(255,255,255,.10)}',
      '.imd-cookie-btn-primary{background:linear-gradient(145deg,rgba(255,255,255,.94),rgba(200,216,232,.86));color:#111827;border-color:rgba(255,255,255,.82)}',
      '.imd-cookie-manage{position:fixed;left:18px;bottom:18px;z-index:2147482999;height:34px;padding:0 12px;border:1px solid rgba(255,255,255,.16);border-radius:999px;background:rgba(13,18,25,.72);backdrop-filter:blur(12px);color:rgba(255,255,255,.82);font:700 11px/1 IBM Plex Sans,Arial,sans-serif;cursor:pointer}',
      '@media(max-width:760px){.imd-cookie-layer{inset:auto 12px 12px}.imd-cookie-box{grid-template-columns:1fr;padding:15px;border-radius:18px}.imd-cookie-actions{justify-content:stretch}.imd-cookie-btn{flex:1 1 100%}.imd-cookie-manage{left:12px;bottom:12px}}'
    ].join('');
    document.head.appendChild(style);
  }

  function makeToggle(category, label, desc, locked) {
    var option = document.createElement('div');
    option.className = 'imd-cookie-option';
    option.innerHTML = '<div><strong>' + label + '</strong><span>' + desc + '</span></div>';
    var toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'imd-cookie-toggle';
    toggle.setAttribute('role', 'switch');
    toggle.setAttribute('aria-label', label);
    toggle.setAttribute('aria-checked', locked ? 'true' : 'false');
    if (locked) toggle.setAttribute('aria-disabled', 'true');
    toggle.dataset.category = category;
    toggle.addEventListener('click', function () {
      if (locked) return;
      toggle.setAttribute('aria-checked', toggle.getAttribute('aria-checked') === 'true' ? 'false' : 'true');
    });
    option.appendChild(toggle);
    return option;
  }

  function renderBanner(forceOpen) {
    injectStyles();
    document.querySelectorAll('.imd-cookie-layer').forEach(function (el) { el.remove(); });

    var saved = readConsent();
    if (saved && !forceOpen) {
      window.imdCookieConsent = saved;
      runDeferredScripts(saved);
      renderManageButton();
      return;
    }

    var layer = document.createElement('div');
    layer.className = 'imd-cookie-layer';
    layer.setAttribute('role', 'dialog');
    layer.setAttribute('aria-modal', 'true');
    layer.setAttribute('aria-labelledby', 'imd-cookie-title');
    layer.innerHTML = [
      '<div class="imd-cookie-box">',
      '<div>',
      '<div class="imd-cookie-kicker">Datenschutz-Einstellungen</div>',
      '<h2 class="imd-cookie-title" id="imd-cookie-title">Cookies & Dienste</h2>',
      '<p class="imd-cookie-text">Wir verwenden notwendige Speicherungen für Sicherheit, Formularfunktionen und Ihre Darstellungseinstellungen. Optionale Dienste werden erst nach Ihrer Zustimmung aktiviert. Sie können Ihre Auswahl jederzeit ändern.</p>',
      '</div>',
      '<div class="imd-cookie-options" id="imdCookieOptions"></div>',
      '<div class="imd-cookie-actions">',
      '<button class="imd-cookie-btn" type="button" data-cookie-action="reject">Alle ablehnen</button>',
      '<button class="imd-cookie-btn imd-cookie-btn-primary" type="button" data-cookie-action="save">Auswahl speichern</button>',
      '<button class="imd-cookie-btn" type="button" data-cookie-action="accept">Alle akzeptieren</button>',
      '</div>',
      '</div>'
    ].join('');
    document.body.appendChild(layer);

    var options = layer.querySelector('#imdCookieOptions');
    options.appendChild(makeToggle('necessary', 'Notwendig', 'Sicherheit, Session, CSRF und Darstellung. Immer aktiv.', true));
    options.appendChild(makeToggle('statistics', 'Statistik', 'Anonyme Reichweitenmessung, falls später aktiviert.', false));
    options.appendChild(makeToggle('marketing', 'Marketing', 'Externe Marketing- oder Trackingdienste, falls später aktiviert.', false));

    if (saved) {
      Object.keys(saved).forEach(function (key) {
        var toggle = layer.querySelector('[data-category="' + key + '"]');
        if (toggle) toggle.setAttribute('aria-checked', saved[key] ? 'true' : 'false');
      });
    }

    layer.addEventListener('click', function (event) {
      var action = event.target && event.target.getAttribute('data-cookie-action');
      if (!action) return;
      var consent;
      if (action === 'accept') {
        consent = saveConsent({ statistics: true, marketing: true });
      } else if (action === 'reject') {
        consent = saveConsent({ statistics: false, marketing: false });
      } else {
        consent = saveConsent({
          statistics: layer.querySelector('[data-category="statistics"]').getAttribute('aria-checked') === 'true',
          marketing: layer.querySelector('[data-category="marketing"]').getAttribute('aria-checked') === 'true'
        });
      }
      layer.remove();
      renderManageButton();
    });
  }

  function renderManageButton() {
    injectStyles();
    if (document.querySelector('.imd-cookie-manage')) return;
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'imd-cookie-manage';
    button.textContent = 'Cookie-Einstellungen';
    button.addEventListener('click', function () { renderBanner(true); });
    document.body.appendChild(button);
  }

  window.imdHasConsent = hasConsent;
  window.imdOpenCookieSettings = function () { renderBanner(true); };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { renderBanner(false); });
  } else {
    renderBanner(false);
  }
})();
