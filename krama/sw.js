/* Krama service worker — makes the site installable and fast on repeat visits.
 * Conservative + safe:
 *   - The API (/api/) is NEVER cached (job data stays live).
 *   - Navigations are network-first (always fresh HTML → new asset ?v= refs picked up),
 *     with the cached app shell as an offline fallback.
 *   - Static assets are stale-while-revalidate; they're versioned via ?v=, so a new build
 *     is a new URL = a cache miss = a fresh fetch (no stuck-on-old-version risk).
 *   - Cross-origin requests (Google Fonts, Telegram, etc.) are left untouched.
 * Bump CACHE to force old caches to clear on the next activate.
 */
const CACHE = 'krama-shell-v2';

self.addEventListener('install', function () {
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil((async function () {
    const keys = await caches.keys();
    await Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', function (event) {
  const req = event.request;
  if (req.method !== 'GET') return;

  let url;
  try { url = new URL(req.url); } catch (e) { return; }
  if (url.origin !== self.location.origin) return;      // don't touch cross-origin
  if (url.pathname.indexOf('/api/') === 0) return;       // never cache the API

  // Navigations (HTML): network-first, fall back to the cached shell when offline.
  if (req.mode === 'navigate') {
    event.respondWith((async function () {
      try {
        const net = await fetch(req);
        const cache = await caches.open(CACHE);
        cache.put('/', net.clone());                     // keep a shell copy for offline
        return net;
      } catch (e) {
        const shell = await caches.match('/');
        return shell || Response.error();
      }
    })());
    return;
  }

  // Static assets (versioned): stale-while-revalidate.
  if (/\.(?:js|css|png|jpe?g|webp|svg|gif|ico|woff2?)$/i.test(url.pathname)) {
    event.respondWith((async function () {
      const cache = await caches.open(CACHE);
      const cached = await cache.match(req);
      const network = fetch(req).then(function (res) {
        if (res && res.ok) cache.put(req, res.clone());
        return res;
      }).catch(function () { return cached; });
      return cached || network;
    })());
  }
});

/* ── Web push: job-alert / followed-company notifications ────────────────────── */
self.addEventListener('push', function (event) {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (e) { data = {}; }
  const title = data.title || 'Krama';
  const options = {
    body: data.body || '',
    icon: data.icon || '/krama/assets/icon-192.png',
    badge: '/krama/assets/icon-192.png',
    data: { url: data.url || '/' },
    tag: data.tag || undefined,          // collapses duplicates when set
    renotify: !!data.tag,
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil((async function () {
    const wins = await clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const w of wins) {
      if (w.url.indexOf(self.location.origin) === 0 && 'focus' in w) {
        try { await w.navigate(target); } catch (e) {}
        return w.focus();
      }
    }
    return clients.openWindow(target);
  })());
});
