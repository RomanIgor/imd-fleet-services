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
      '@keyframes imdCookieIn{from{opacity:0;transform:translateY(18px) scale(.98)}to{opacity:1;transform:translateY(0) scale(1)}}',
      '.imd-cookie-layer{position:fixed;inset:auto 24px 24px;z-index:2147483000;display:flex;justify-content:flex-end;pointer-events:none}',
      '.imd-cookie-box{width:min(520px,100%);padding:1px;border-radius:24px;background:linear-gradient(145deg,rgba(255,255,255,.34),rgba(255,255,255,.07));box-shadow:0 24px 80px rgba(0,0,0,.46);pointer-events:auto;animation:imdCookieIn .42s cubic-bezier(.22,1,.36,1)}',
      '.imd-cookie-inner{position:relative;overflow:hidden;border-radius:23px;background:linear-gradient(145deg,rgba(21,25,33,.94),rgba(9,13,19,.92));backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);color:#eef2f6}',
      '.imd-cookie-inner::before{content:"";position:absolute;inset:0 0 auto;height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.62),transparent)}',
      '.imd-cookie-head{display:grid;grid-template-columns:42px 1fr;gap:13px;align-items:center;padding:18px 18px 12px}',
      '.imd-cookie-mark{width:42px;height:42px;border-radius:14px;display:grid;place-items:center;background:linear-gradient(145deg,rgba(255,255,255,.16),rgba(255,255,255,.045));border:1px solid rgba(255,255,255,.16);box-shadow:inset 0 1px rgba(255,255,255,.08)}',
      '.imd-cookie-mark svg{width:20px;height:20px;color:rgba(255,255,255,.88)}',
      '.imd-cookie-kicker{font:700 9px/1.2 IBM Plex Sans,Arial,sans-serif;letter-spacing:.17em;text-transform:uppercase;color:rgba(238,242,246,.48);margin-bottom:4px}',
      '.imd-cookie-title{font:800 18px/1.12 IBM Plex Sans,Arial,sans-serif;letter-spacing:-.02em;margin:0;color:#fff}',
      '.imd-cookie-text{font:400 12.5px/1.58 IBM Plex Sans,Arial,sans-serif;color:rgba(245,245,241,.64);margin:0;padding:0 18px 14px}',
      '.imd-cookie-options{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;padding:0 18px 16px}',
      '.imd-cookie-option{position:relative;display:flex;min-width:0;min-height:92px;flex-direction:column;justify-content:space-between;padding:11px;border:1px solid rgba(255,255,255,.11);border-radius:16px;background:rgba(255,255,255,.045)}',
      '.imd-cookie-option strong{display:block;font:700 11px/1.2 IBM Plex Sans,Arial,sans-serif;color:#fff}',
      '.imd-cookie-option span{display:block;margin-top:4px;font:400 10.5px/1.32 IBM Plex Sans,Arial,sans-serif;color:rgba(245,245,241,.54)}',
      '.imd-cookie-toggle{align-self:flex-start;width:38px;height:22px;border:1px solid rgba(255,255,255,.20);border-radius:999px;background:rgba(255,255,255,.08);position:relative;cursor:pointer;transition:.18s}',
      '.imd-cookie-toggle::after{content:"";position:absolute;left:3px;top:3px;width:14px;height:14px;border-radius:50%;background:rgba(255,255,255,.82);transition:.18s}',
      '.imd-cookie-toggle[aria-checked="true"]{background:rgba(255,255,255,.90);border-color:rgba(255,255,255,.9)}',
      '.imd-cookie-toggle[aria-checked="true"]::after{left:19px;background:#111827}',
      '.imd-cookie-toggle[aria-disabled="true"]{cursor:not-allowed;opacity:.72}',
      '.imd-cookie-actions{display:grid;grid-template-columns:1fr 1fr;gap:9px;padding:14px 18px 18px;border-top:1px solid rgba(255,255,255,.09);background:rgba(255,255,255,.025)}',
      '.imd-cookie-btn{height:40px;padding:0 13px;border-radius:12px;border:1px solid rgba(255,255,255,.15);background:rgba(255,255,255,.055);color:#fff;font:750 11.5px/1 IBM Plex Sans,Arial,sans-serif;cursor:pointer;transition:background .18s,transform .18s,border-color .18s}',
      '.imd-cookie-btn:hover{background:rgba(255,255,255,.095);transform:translateY(-1px)}',
      '.imd-cookie-btn-primary{grid-column:1/-1;grid-row:1;background:linear-gradient(145deg,rgba(255,255,255,.96),rgba(200,216,232,.88));color:#10141b;border-color:rgba(255,255,255,.82)}',
      '.imd-cookie-manage{position:fixed;left:18px;bottom:18px;z-index:2147482999;width:34px;height:34px;border:1px solid rgba(255,255,255,.16);border-radius:50%;background:rgba(13,18,25,.70);backdrop-filter:blur(12px);color:rgba(255,255,255,.82);font:700 0/1 IBM Plex Sans,Arial,sans-serif;cursor:pointer;box-shadow:0 12px 30px rgba(0,0,0,.22)}',
      '.imd-cookie-manage::before{content:"";display:block;width:14px;height:14px;margin:auto;border:1.8px solid currentColor;border-radius:4px;transform:rotate(45deg)}',
      '@media(max-width:760px){.imd-cookie-layer{inset:auto 16px 16px;justify-content:center}.imd-cookie-box{width:min(360px,100%);border-radius:18px;background:linear-gradient(145deg,rgba(148,163,184,.44),rgba(71,85,105,.30));box-shadow:0 16px 38px rgba(9,21,42,.30)}.imd-cookie-inner{border-radius:17px;background:linear-gradient(145deg,rgba(100,116,139,.94),rgba(71,85,105,.90));color:#f8fafc}.imd-cookie-inner::before{background:linear-gradient(90deg,transparent,rgba(255,255,255,.34),transparent)}.imd-cookie-head{grid-template-columns:30px 1fr;gap:9px;padding:11px 11px 7px}.imd-cookie-mark{width:30px;height:30px;border-radius:10px;background:rgba(255,255,255,.12);border-color:rgba(255,255,255,.16);box-shadow:none}.imd-cookie-mark svg{width:16px;height:16px;color:#f8fafc}.imd-cookie-kicker{font-size:7.5px;color:rgba(248,250,252,.58)}.imd-cookie-title{font-size:15px;color:#fff}.imd-cookie-text{padding:0 11px 9px;font-size:11px;line-height:1.42;color:rgba(248,250,252,.74)}.imd-cookie-options{grid-template-columns:1fr;gap:5px;padding:0 11px 10px}.imd-cookie-option{min-height:0;display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center;padding:8px 9px;border-radius:12px;background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.13)}.imd-cookie-option strong{font-size:10px;color:#fff}.imd-cookie-option span{font-size:9.5px;line-height:1.25;color:rgba(248,250,252,.62)}.imd-cookie-toggle{align-self:center;width:34px;height:19px;background:rgba(15,23,42,.18);border-color:rgba(255,255,255,.18)}.imd-cookie-toggle::after{width:11px;height:11px;background:rgba(255,255,255,.86);box-shadow:0 2px 5px rgba(9,21,42,.22)}.imd-cookie-toggle[aria-checked="true"]{background:#f8fafc;border-color:#f8fafc}.imd-cookie-toggle[aria-checked="true"]::after{left:19px;background:#334155}.imd-cookie-actions{padding:10px 11px 11px;border-top-color:rgba(255,255,255,.10);background:rgba(15,23,42,.08)}.imd-cookie-btn{height:34px;border-radius:9px;font-size:10px;color:#f8fafc;background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.14)}.imd-cookie-btn-primary{background:#f8fafc;color:#334155;border-color:#f8fafc}.imd-cookie-manage{left:12px;bottom:12px;background:rgba(71,85,105,.86);color:#f8fafc;border-color:rgba(255,255,255,.14)}}'
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
      '<div class="imd-cookie-inner">',
      '<div class="imd-cookie-head">',
      '<div class="imd-cookie-mark" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.75 5 5.75v5.9c0 4.45 3 7.65 7 9.6 4-1.95 7-5.15 7-9.6v-5.9l-7-3Z"/><path d="m9.2 12.1 1.8 1.8 3.9-4.1"/></svg></div>',
      '<div><div class="imd-cookie-kicker">Datenschutz</div><h2 class="imd-cookie-title" id="imd-cookie-title">Privatsphäre einstellen</h2></div>',
      '</div>',
      '<p class="imd-cookie-text">Notwendige Speicherungen halten Sicherheit, Formulare und Darstellung stabil. Optionale Dienste starten erst nach Ihrer Zustimmung.</p>',
      '<div class="imd-cookie-options" id="imdCookieOptions"></div>',
      '<div class="imd-cookie-actions">',
      '<button class="imd-cookie-btn" type="button" data-cookie-action="reject">Alle ablehnen</button>',
      '<button class="imd-cookie-btn imd-cookie-btn-primary" type="button" data-cookie-action="save">Auswahl speichern</button>',
      '<button class="imd-cookie-btn" type="button" data-cookie-action="accept">Alle akzeptieren</button>',
      '</div>',
      '</div>',
      '</div>'
    ].join('');
    document.body.appendChild(layer);

    var options = layer.querySelector('#imdCookieOptions');
    options.appendChild(makeToggle('necessary', 'Notwendig', 'Sicherheit und Darstellung. Immer aktiv.', true));
    options.appendChild(makeToggle('statistics', 'Statistik', 'Anonyme Reichweite, falls aktiviert.', false));
    options.appendChild(makeToggle('marketing', 'Marketing', 'Externe Dienste, falls aktiviert.', false));

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
