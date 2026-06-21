/// Service Worker — Meridian Canon PWA
/// Offline-first caching with network fallback

const CACHE_NAME = 'meridian-canon-v1';
const STATIC_ASSETS = [
  '/',
  '/meridian.js',
  '/pwa/icon-512.png',
  '/pwa/icon.svg',
  '/pwa/splash.png',
];

// Install — precache static assets
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(key) { return key !== CACHE_NAME; })
            .map(function(key) { return caches.delete(key); })
      );
    })
  );
  self.clients.claim();
});

// Fetch — network first, cache fallback
self.addEventListener('fetch', function(event) {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // For navigation requests, serve index
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(function() {
        return caches.match('/');
      })
    );
    return;
  }

  // For assets: stale-while-revalidate
  event.respondWith(
    caches.match(event.request).then(function(cached) {
      const fetchPromise = fetch(event.request).then(function(response) {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, clone);
          });
        }
        return response;
      }).catch(function() {
        return cached;
      });
      return cached || fetchPromise;
    })
  );
});
