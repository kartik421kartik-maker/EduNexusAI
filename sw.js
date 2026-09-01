const CACHE_NAME = 'edunexus-live-v3'; // Version change kiya taaki naya turant update ho
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
  // 🔥 THE LIFESAVER FIX: Sirf GET requests ko cache karo. POST (Firebase/AI) ko ignore karo warna crash hoga!
  if (event.request.method !== 'GET') {
      return; // Browser ko normal kaam karne do, service worker interfere nahi karega
  }

  // Chrome extensions wagaira ke errors se bachne ke liye
  if (!event.request.url.startsWith('http')) {
      return;
  }

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
