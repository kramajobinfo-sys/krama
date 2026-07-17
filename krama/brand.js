// Krama brand settings — loaded before any JSX so all pages can read window.KRAMA_LOGO_SRC
(function () {
  var BRAND_KEY = 'krama_brand_settings';

  // 1. Sync-read localStorage for instant paint (avoids flash)
  try {
    var s = JSON.parse(localStorage.getItem(BRAND_KEY) || '{}');
    window.KRAMA_LOGO_SRC   = s.logoUrl   || null;
    window.KRAMA_BRAND_NAME = s.brandName || 'KRAMA';
  } catch (e) {
    window.KRAMA_LOGO_SRC   = null;
    window.KRAMA_BRAND_NAME = 'KRAMA';
  }

  // Helper so JSX components can always get the latest value
  window.getKramaLogo = function (fallback) {
    try {
      var s = JSON.parse(localStorage.getItem(BRAND_KEY) || '{}');
      return s.logoUrl || fallback || null;
    } catch (e) { return fallback || null; }
  };

  // 2. Async-fetch from API to keep localStorage in sync with DB
  //    This runs in the background — no blocking, no visible delay.
  // On localhost (XAMPP) the Laravel API lives under /krama/krama-api/public; on hosting the web root IS the API, so /api.
  var apiBase = window.location.protocol + '//' + window.location.host + (/^(localhost|127\.0\.0\.1|::1|192\.168\.|10\.)/.test(window.location.hostname) ? '/krama/krama-api/public/api' : '/api');
  fetch(apiBase + '/settings/brand', { cache: 'no-cache' })
    .then(function(r) { return r.ok ? r.json() : null; })
    .then(function(data) {
      if (!data || typeof data !== 'object') return;
      // Update globals so any component that reads them after this gets fresh values
      if (data.logoUrl   !== undefined) window.KRAMA_LOGO_SRC   = data.logoUrl   || null;
      if (data.brandName !== undefined) window.KRAMA_BRAND_NAME = data.brandName || 'KRAMA';
      // Persist to localStorage so next load is instant
      try { localStorage.setItem(BRAND_KEY, JSON.stringify(data)); } catch (e) {}
    })
    .catch(function() {});
})();
