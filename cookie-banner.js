(function () {
  'use strict';

  var COOKIE_CONSENT_KEY = 'cookieConsent';

  function getUiLang() {
    var raw = (document.documentElement.getAttribute('lang') || 'en').toLowerCase();
    if (raw.indexOf('pt') === 0) return 'pt';
    if (raw.indexOf('es') === 0) return 'es';
    return 'en';
  }

  function getCopy(lang) {
    var map = {
      pt: {
        bannerText: 'Usamos cookies para melhorar sua experiência e exibir anúncios relevantes. Você pode gerenciar suas preferências.',
        acceptAll: 'Aceitar Todos',
        reject: 'Recusar',
        preferences: 'Preferências',
        modalTitle: 'Preferências de Cookies',
        necessaryLabel: 'Cookies Necessários',
        marketingLabel: 'Cookies de Marketing/AdSense',
        analyticsLabel: 'Cookies de Análise',
        save: 'Salvar Preferências',
        close: 'Fechar',
        necessaryNote: 'Sempre ativo'
      },
      en: {
        bannerText: 'We use cookies to improve your experience and show relevant ads. You can manage your preferences.',
        acceptAll: 'Accept All',
        reject: 'Reject',
        preferences: 'Preferences',
        modalTitle: 'Cookie Preferences',
        necessaryLabel: 'Necessary Cookies',
        marketingLabel: 'Marketing/AdSense Cookies',
        analyticsLabel: 'Analytics Cookies',
        save: 'Save Preferences',
        close: 'Close',
        necessaryNote: 'Always on'
      },
      es: {
        bannerText: 'Usamos cookies para mejorar tu experiencia y mostrar anuncios relevantes. Puedes gestionar tus preferencias.',
        acceptAll: 'Aceptar todos',
        reject: 'Rechazar',
        preferences: 'Preferencias',
        modalTitle: 'Preferencias de Cookies',
        necessaryLabel: 'Cookies Necesarios',
        marketingLabel: 'Cookies de Marketing/AdSense',
        analyticsLabel: 'Cookies de Análisis',
        save: 'Guardar preferencias',
        close: 'Cerrar',
        necessaryNote: 'Siempre activo'
      }
    };

    return map[lang] || map.en;
  }

  function readStoredConsent() {
    var raw = null;
    try {
      raw = window.localStorage.getItem(COOKIE_CONSENT_KEY);
    } catch (e) {
      raw = null;
    }
    if (!raw) return null;

    // Backward compatibility: previous implementation stored strings.
    if (raw === 'accepted') return { necessary: true, marketing: true, analytics: true };
    if (raw === 'rejected') return { necessary: true, marketing: false, analytics: false };

    try {
      var parsed = JSON.parse(raw);
      if (!parsed) return null;
      return {
        necessary: parsed.necessary !== false,
        marketing: !!parsed.marketing,
        analytics: !!parsed.analytics
      };
    } catch (e2) {
      return null;
    }
  }

  function writeStoredConsent(consent) {
    try {
      window.localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consent));
    } catch (e) {
      // ignore
    }
  }

  function hideBanner(cookieBanner) {
    if (!cookieBanner) return;
    cookieBanner.hidden = true;
  }

  function showBanner(cookieBanner) {
    if (!cookieBanner) return;
    cookieBanner.hidden = false;
  }

  function setBannerUi(copy) {
    var textEl = document.querySelector('#cookieBanner .cookie-text');
    if (textEl) textEl.textContent = copy.bannerText;

    var acceptBtn = document.getElementById('cookieAcceptAll');
    var rejectBtn = document.getElementById('cookieReject');
    var preferencesBtn = document.getElementById('cookiePreferences');
    if (acceptBtn) acceptBtn.textContent = copy.acceptAll;
    if (rejectBtn) rejectBtn.textContent = copy.reject;
    if (preferencesBtn) preferencesBtn.textContent = copy.preferences;
  }

  function createModal(copy, storedConsent) {
    var overlay = document.createElement('div');
    overlay.className = 'cb-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', copy.modalTitle);

    var modal = document.createElement('div');
    modal.className = 'cb-modal';

    var header = document.createElement('div');
    header.className = 'cb-modal-header';

    var title = document.createElement('h3');
    title.className = 'cb-modal-title';
    title.textContent = copy.modalTitle;

    var closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'cb-modal-close';
    closeBtn.setAttribute('aria-label', copy.close);
    closeBtn.textContent = '×';

    header.appendChild(title);
    header.appendChild(closeBtn);
    modal.appendChild(header);

    var body = document.createElement('div');
    body.className = 'cb-modal-body';

    // Toggle: Necessary (always on, disabled)
    var necessaryRow = document.createElement('label');
    necessaryRow.className = 'cb-toggle-row cb-toggle-row--disabled';
    var necessaryInput = document.createElement('input');
    necessaryInput.type = 'checkbox';
    necessaryInput.checked = true;
    necessaryInput.disabled = true;
    necessaryInput.setAttribute('aria-label', copy.necessaryLabel);
    var necessaryText = document.createElement('span');
    necessaryText.className = 'cb-toggle-text';
    necessaryText.textContent = copy.necessaryLabel + ' (' + copy.necessaryNote + ')';
    necessaryRow.appendChild(necessaryInput);
    necessaryRow.appendChild(necessaryText);

    // Marketing/AdSense
    var marketingRow = document.createElement('label');
    marketingRow.className = 'cb-toggle-row';
    var marketingInput = document.createElement('input');
    marketingInput.type = 'checkbox';
    marketingInput.checked = !!(storedConsent && storedConsent.marketing);
    marketingInput.setAttribute('aria-label', copy.marketingLabel);
    var marketingText = document.createElement('span');
    marketingText.className = 'cb-toggle-text';
    marketingText.textContent = copy.marketingLabel;
    marketingRow.appendChild(marketingInput);
    marketingRow.appendChild(marketingText);

    // Analytics
    var analyticsRow = document.createElement('label');
    analyticsRow.className = 'cb-toggle-row';
    var analyticsInput = document.createElement('input');
    analyticsInput.type = 'checkbox';
    analyticsInput.checked = !!(storedConsent && storedConsent.analytics);
    analyticsInput.setAttribute('aria-label', copy.analyticsLabel);
    var analyticsText = document.createElement('span');
    analyticsText.className = 'cb-toggle-text';
    analyticsText.textContent = copy.analyticsLabel;
    analyticsRow.appendChild(analyticsInput);
    analyticsRow.appendChild(analyticsText);

    body.appendChild(necessaryRow);
    body.appendChild(marketingRow);
    body.appendChild(analyticsRow);
    modal.appendChild(body);

    var footer = document.createElement('div');
    footer.className = 'cb-modal-footer';

    var saveBtn = document.createElement('button');
    saveBtn.type = 'button';
    saveBtn.className = 'cb-save-btn';
    saveBtn.textContent = copy.save;

    footer.appendChild(saveBtn);
    modal.appendChild(footer);

    overlay.appendChild(modal);

    function close() {
      try {
        document.body.style.overflow = '';
      } catch (e) {
        // ignore
      }
      try {
        document.body.classList.remove('cb-open');
      } catch (e2) {
        // ignore
      }
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }

    function save() {
      writeStoredConsent({
        necessary: true,
        marketing: !!marketingInput.checked,
        analytics: !!analyticsInput.checked
      });
      hideBanner(document.getElementById('cookieBanner'));
      close();
    }

    closeBtn.addEventListener('click', function () { close(); });
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) close();
    });
    saveBtn.addEventListener('click', save);

    return { overlay: overlay, save: save };
  }

  function initCookieBanner() {
    var lang = getUiLang();
    var copy = getCopy(lang);

    var cookieBanner = document.getElementById('cookieBanner');
    if (!cookieBanner) return;

    var stored = readStoredConsent();
    setBannerUi(copy);

    if (stored) {
      hideBanner(cookieBanner);
    } else {
      showBanner(cookieBanner);
    }

    var acceptAllBtn = document.getElementById('cookieAcceptAll');
    var rejectBtn = document.getElementById('cookieReject');
    var preferencesBtn = document.getElementById('cookiePreferences');
    var manageLink = document.getElementById('cookieManageLink');

    function acceptAll() {
      writeStoredConsent({ necessary: true, marketing: true, analytics: true });
      hideBanner(cookieBanner);
    }

    function reject() {
      writeStoredConsent({ necessary: true, marketing: false, analytics: false });
      hideBanner(cookieBanner);
    }

    function openPreferences() {
      // Ensure only one modal exists at a time.
      try {
        var existing = document.querySelector('.cb-overlay');
        if (existing && existing.parentNode) existing.parentNode.removeChild(existing);
      } catch (e) {
        // ignore
      }

      var latest = readStoredConsent();
      var modal = createModal(copy, latest);
      document.body.appendChild(modal.overlay);

      try {
        modal.overlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        document.body.classList.add('cb-open');
      } catch (e2) {
        // ignore
      }
    }

    if (acceptAllBtn) {
      acceptAllBtn.addEventListener('click', function () { acceptAll(); });
    }

    if (rejectBtn) {
      rejectBtn.addEventListener('click', function () { reject(); });
    }

    if (preferencesBtn) {
      preferencesBtn.addEventListener('click', function (e) {
        try {
          e.preventDefault();
        } catch (err) {
          // ignore
        }
        openPreferences();
      });
    }

    if (manageLink) {
      manageLink.addEventListener('click', function () {
        openPreferences();
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCookieBanner);
  } else {
    initCookieBanner();
  }
})();

