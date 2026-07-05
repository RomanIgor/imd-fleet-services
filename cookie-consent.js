(function () {
  var STORAGE_KEY = 'imd-cookie-consent-v2';
  var DEFAULT_STATE = {
    necessary: true,
    external: false,
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
    activateConsentedServices(consent);
    return consent;
  }

  function hasConsent(category) {
    var consent = window.imdCookieConsent || readConsent();
    return !!(consent && consent[category]);
  }

  function activateConsentedServices(consent) {
    document.querySelectorAll('link[data-consent-href][data-consent-category]').forEach(function (link) {
      var category = link.getAttribute('data-consent-category');
      if (!consent[category] || link.dataset.loaded === 'true') return;
      link.setAttribute('href', link.getAttribute('data-consent-href'));
      link.dataset.loaded = 'true';
    });

    document.querySelectorAll('[data-consent-src][data-consent-category]').forEach(function (el) {
      var category = el.getAttribute('data-consent-category');
      if (!consent[category] || el.dataset.loaded === 'true') return;
      el.setAttribute('src', el.getAttribute('data-consent-src'));
      el.dataset.loaded = 'true';
    });

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

    document.querySelectorAll('[data-consent-placeholder][data-consent-category]').forEach(function (placeholder) {
      var category = placeholder.getAttribute('data-consent-category');
      placeholder.hidden = !!consent[category];
    });
  }

  function injectStyles() {
    if (document.getElementById('imd-cookie-styles')) return;
    var style = document.createElement('style');
    style.id = 'imd-cookie-styles';
    style.textContent = [
      '@keyframes imdCookieLayerIn{from{opacity:0}to{opacity:1}}',
      '@keyframes imdCookieIn{from{opacity:0;transform:translateY(18px) scale(.94)}to{opacity:1;transform:translateY(0) scale(1)}}',
      '.imd-cookie-layer{position:fixed;inset:0;z-index:2147483000;display:grid;place-items:center;padding:24px;background:rgba(10,10,9,.34);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);pointer-events:auto;animation:imdCookieLayerIn .25s ease}',
      '.imd-cookie-box{width:min(430px,100%);padding:1px;border-radius:24px;background:linear-gradient(145deg,rgba(150,150,146,.46),rgba(92,92,88,.32));box-shadow:0 26px 90px rgba(20,20,18,.42);pointer-events:auto;animation:imdCookieIn .42s cubic-bezier(.22,1,.36,1)}',
      '.imd-cookie-inner{position:relative;overflow:hidden;border-radius:23px;background:linear-gradient(145deg,rgba(112,112,108,.95),rgba(78,78,74,.92));backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);color:#f5f5f1}',
      '.imd-cookie-inner::before{content:"";position:absolute;inset:0 0 auto;height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.30),transparent)}',
      '.imd-cookie-head{display:grid;grid-template-columns:42px 1fr;gap:13px;align-items:center;padding:18px 18px 12px}',
      '.imd-cookie-mark{width:42px;height:42px;border-radius:14px;display:grid;place-items:center;background:rgba(255,255,255,.11);border:1px solid rgba(255,255,255,.15);box-shadow:inset 0 1px rgba(255,255,255,.06)}',
      '.imd-cookie-mark svg{width:20px;height:20px;color:#f5f5f1}',
      '.imd-cookie-kicker{font:700 9px/1.2 IBM Plex Sans,Arial,sans-serif;letter-spacing:.17em;text-transform:uppercase;color:rgba(245,245,241,.58);margin-bottom:4px}',
      '.imd-cookie-title{font:800 18px/1.12 IBM Plex Sans,Arial,sans-serif;letter-spacing:0;margin:0;color:#fff}',
      '.imd-cookie-text{font:400 12.5px/1.58 IBM Plex Sans,Arial,sans-serif;color:rgba(245,245,241,.74);margin:0;padding:0 18px 14px}',
      '.imd-cookie-options{display:grid;grid-template-columns:1fr;gap:8px;padding:0 18px 16px}',
      '.imd-cookie-option{position:relative;display:grid;grid-template-columns:1fr auto;gap:12px;align-items:center;min-width:0;min-height:0;padding:11px 12px;border:1px solid rgba(255,255,255,.12);border-radius:16px;background:rgba(255,255,255,.075)}',
      '.imd-cookie-option strong{display:block;font:700 11px/1.2 IBM Plex Sans,Arial,sans-serif;color:#fff}',
      '.imd-cookie-option span{display:block;margin-top:4px;font:400 10.5px/1.32 IBM Plex Sans,Arial,sans-serif;color:rgba(245,245,241,.62)}',
      '.imd-cookie-toggle{align-self:center;width:38px;height:22px;border:1px solid rgba(255,255,255,.17);border-radius:999px;background:rgba(30,30,28,.20);position:relative;cursor:pointer;transition:.18s}',
      '.imd-cookie-toggle::after{content:"";position:absolute;left:3px;top:3px;width:14px;height:14px;border-radius:50%;background:rgba(245,245,241,.88);transition:.18s}',
      '.imd-cookie-toggle[aria-checked="true"]{background:#f5f5f1;border-color:#f5f5f1}',
      '.imd-cookie-toggle[aria-checked="true"]::after{left:19px;background:#4e4e4a}',
      '.imd-cookie-toggle[aria-disabled="true"]{cursor:not-allowed;opacity:.72}',
      '.imd-cookie-static{align-self:center;white-space:nowrap;border:1px solid rgba(255,255,255,.14);border-radius:999px;background:rgba(245,245,241,.13);color:#f5f5f1;padding:7px 9px;font:800 9px/1 IBM Plex Sans,Arial,sans-serif;letter-spacing:.08em;text-transform:uppercase}',
      '.imd-cookie-actions{display:grid;grid-template-columns:1fr 1fr;gap:9px;padding:14px 18px 18px;border-top:1px solid rgba(255,255,255,.10);background:rgba(30,30,28,.08)}',
      '.imd-cookie-btn{height:40px;padding:0 13px;border-radius:12px;border:1px solid rgba(255,255,255,.13);background:rgba(255,255,255,.075);color:#f5f5f1;font:750 11.5px/1 IBM Plex Sans,Arial,sans-serif;cursor:pointer;transition:background .18s,transform .18s,border-color .18s}',
      '.imd-cookie-btn:hover{background:rgba(255,255,255,.11);transform:translateY(-1px)}',
      '.imd-cookie-btn-primary{grid-column:1/-1;grid-row:1;background:#f5f5f1;color:#4e4e4a;border-color:#f5f5f1}',
      '.imd-cookie-btn-primary:hover,.imd-cookie-btn-primary:focus-visible{background:#3fd475;color:#152016;border-color:#3fd475;box-shadow:0 0 0 3px rgba(63,212,117,.18)}',
      '.imd-cookie-btn-primary:active{background:#28b95b;color:#102314;border-color:#28b95b;transform:translateY(0) scale(.99)}',
      '.imd-cookie-manage{position:fixed;left:18px;bottom:18px;z-index:2147482999;width:34px;height:34px;border:1px solid rgba(255,255,255,.14);border-radius:50%;background:rgba(78,78,74,.88);backdrop-filter:blur(12px);color:#f5f5f1;font:700 0/1 IBM Plex Sans,Arial,sans-serif;cursor:pointer;box-shadow:0 12px 30px rgba(20,20,18,.22)}',
      '.imd-cookie-manage::before{content:"";display:block;width:14px;height:14px;margin:auto;border:1.8px solid currentColor;border-radius:4px;transform:rotate(45deg)}',
      '@media(max-width:760px){.imd-cookie-layer{padding:16px}.imd-cookie-box{width:min(360px,100%);border-radius:18px}.imd-cookie-inner{border-radius:17px}.imd-cookie-head{grid-template-columns:30px 1fr;gap:9px;padding:11px 11px 7px}.imd-cookie-mark{width:30px;height:30px;border-radius:10px}.imd-cookie-mark svg{width:16px;height:16px}.imd-cookie-kicker{font-size:7.5px}.imd-cookie-title{font-size:15px}.imd-cookie-text{padding:0 11px 9px;font-size:11px;line-height:1.42}.imd-cookie-options{gap:5px;padding:0 11px 10px}.imd-cookie-option{gap:8px;padding:8px 9px;border-radius:12px}.imd-cookie-option strong{font-size:10px}.imd-cookie-option span{font-size:9.5px;line-height:1.25}.imd-cookie-toggle{width:34px;height:19px}.imd-cookie-toggle::after{width:11px;height:11px}.imd-cookie-toggle[aria-checked="true"]::after{left:19px}.imd-cookie-static{padding:6px 8px;font-size:8px}.imd-cookie-actions{padding:10px 11px 11px}.imd-cookie-btn{height:34px;border-radius:9px;font-size:10px}.imd-cookie-manage{left:12px;bottom:12px}}'
    ].join('');
    document.head.appendChild(style);
  }

  function makeToggle(category, label, desc, locked) {
    var option = document.createElement('div');
    option.className = 'imd-cookie-option';
    option.innerHTML = '<div><strong>' + label + '</strong><span>' + desc + '</span></div>';
    if (locked) {
      var badge = document.createElement('span');
      badge.className = 'imd-cookie-static';
      badge.textContent = 'Immer aktiv';
      option.appendChild(badge);
      return option;
    }
    var toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'imd-cookie-toggle';
    toggle.setAttribute('role', 'switch');
    toggle.setAttribute('aria-label', label);
    toggle.setAttribute('aria-checked', 'false');
    toggle.dataset.category = category;
    toggle.addEventListener('click', function () {
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
      activateConsentedServices(saved);
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
      '<div class="imd-cookie-inner">',
      '<div class="imd-cookie-head">',
      '<div class="imd-cookie-mark" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.75 5 5.75v5.9c0 4.45 3 7.65 7 9.6 4-1.95 7-5.15 7-9.6v-5.9l-7-3Z"/><path d="m9.2 12.1 1.8 1.8 3.9-4.1"/></svg></div>',
      '<div><div class="imd-cookie-kicker">Datenschutz</div><h2 class="imd-cookie-title" id="imd-cookie-title">Privatsph&auml;re einstellen</h2></div>',
      '</div>',
      '<p class="imd-cookie-text">Notwendige Funktionen sichern Betrieb, Formulare und Darstellung. Optional k&ouml;nnen externe Schriftarten und Karteninhalte aktiviert werden.</p>',
      '<div class="imd-cookie-options" id="imdCookieOptions"></div>',
      '<div class="imd-cookie-actions">',
      '<button class="imd-cookie-btn" type="button" data-cookie-action="reject">Ablehnen</button>',
      '<button class="imd-cookie-btn imd-cookie-btn-primary" type="button" data-cookie-action="save">Speichern</button>',
      '<button class="imd-cookie-btn" type="button" data-cookie-action="accept">Zustimmen</button>',
      '</div>',
      '</div>',
      '</div>'
    ].join('');
    document.body.appendChild(layer);

    var options = layer.querySelector('#imdCookieOptions');
    options.appendChild(makeToggle('external', 'Externe Dienste', 'Externe Schriftarten und OpenStreetMap-Karteninhalte nur nach Zustimmung.', false));

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
        consent = saveConsent({ external: true });
      } else if (action === 'reject') {
        consent = saveConsent({ external: false });
      } else {
        consent = saveConsent({
          external: layer.querySelector('[data-category="external"]').getAttribute('aria-checked') === 'true'
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
