// Service Worker para DK Semijóias PWA
const CACHE_NAME = 'dk-semijoias-v1';
const ASSETS_TO_CACHE = [
  '/dksemijoias/',
  '/dksemijoias/manifest.json',
  '/dksemijoias/assets/icon-192.svg',
  '/dksemijoias/assets/icon-512.svg',
  '/dksemijoias/assets/icon-maskable.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Network first with cache fallback for standard navigation
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/dksemijoias/');
      })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request).then((networkResponse) => {
        // Cache static files dynamically
        if (
          networkResponse.status === 200 &&
          (event.request.url.includes('/assets/') || event.request.url.endsWith('.js') || event.request.url.endsWith('.css'))
        ) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      });
    }).catch(() => {
      // Fallback for offline images or assets
      return caches.match(event.request);
    })
  );
});
