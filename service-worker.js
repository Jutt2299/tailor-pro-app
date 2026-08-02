const CACHE_NAME = 'tailor-pro-v9';

// Only cache static assets that NEVER change (images, fonts)
// Do NOT cache JS/CSS/HTML so updates always reach users
const ASSETS_TO_CACHE = [
  'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
];

// Install Event
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS_TO_CACHE).catch(() => {});
    })
  );
});

// Activate Event - Clean up old caches immediately
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => caches.delete(cache))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - NETWORK FIRST always for JS/CSS/HTML
// Only use cache for truly offline fallback of non-code assets
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // For same-origin JS, CSS, HTML files: always go to network, never cache
  if (url.origin === location.origin) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(event.request);
      })
    );
    return;
  }

  // For external CDN assets: cache first
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});
