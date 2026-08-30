const CACHE_NAME = 'edunexus-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json'
];

self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activated.');
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Agar cache mein hai toh wahi de do, warna internet se fetch karo
      return response || fetch(event.request);
    })
  );
});