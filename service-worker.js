/* ============================================================
   service-worker.js – Offline-First PWA
   App works fully offline after first install.
   Data syncs to Supabase when internet is available.
   ============================================================ */

const CACHE_VERSION = 'tailor-pro-v20';

// All local app files to cache for offline use
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css',
  './css/auth.css',
  './js/i18n.js',
  './js/config.js',
  './js/auth.js',
  './js/utils.js',
  './js/db.js',
  './js/sync.js',
  './js/modals.js',
  './js/dashboard.js',
  './js/customers.js',
  './js/orders.js',
  './js/payments.js',
  './js/settings.js',
  './js/app.js',
];

// External CDN assets
const CDN_ASSETS = [
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600&display=swap',
];

// ── Install: Cache everything ────────────────────────────────
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_VERSION).then(cache => {
      // Cache app shell (must succeed)
      return cache.addAll(APP_SHELL).then(() => {
        // Cache CDN assets (best effort, won't fail install)
        return Promise.allSettled(
          CDN_ASSETS.map(url => cache.add(url).catch(() => {}))
        );
      });
    })
  );
});

// ── Activate: Remove old caches ──────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k))
      );
    }).then(() => self.clients.claim())
  );
});

// ── Fetch: Network first for app files, Cache first for CDN ──
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Skip non-GET and chrome-extension requests
  if (event.request.method !== 'GET') return;
  if (url.protocol === 'chrome-extension:') return;

  // Skip Supabase API calls — always go to network (or fail gracefully)
  if (url.hostname.includes('supabase.co')) return;

  // For same-origin files (our app): Network first, cache fallback
  if (url.origin === location.origin) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Update cache with fresh version
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_VERSION).then(cache => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => {
          // Offline: serve from cache
          return caches.match(event.request).then(cached => {
            return cached || caches.match('./index.html');
          });
        })
    );
    return;
  }

  // For external CDN (fonts, jspdf, supabase-js): Cache first, network fallback
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_VERSION).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => cached);
    })
  );
});
