const CACHE_NAME = 'edunexus-live-v2';
const ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

// 1. Force Install: Naya update aate hi wait mat karo, turant install karo
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// 2. Auto-Clean: Jaise hi naya update aaye, purane kachre (cache) ko delete maar do
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. THE MAGIC (Network First): Hamesha pehle internet se naya code laao
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Agar internet chal raha hai, toh naya code dikhao aur cache ko bhi update kar lo
        const resClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
        return response;
      })
      .catch(() => {
        // Agar user offline hai (no internet), tabhi phone ki memory se purana app dikhao
        return caches.match(event.request);
      })
  );
});
