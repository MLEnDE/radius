const CACHE_NAME = 'radius-pwa-v0.4-20261105c';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './src/qr.js?v=20261105c',
  './src/vault.js?v=20261105c',
  './src/graph-engine.js?v=20261105c',
  './src/app.js?v=20261105c'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).catch(() => {})
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Network-first with cache: 'no-cache' so GitHub Pages updates appear immediately when online
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request, { cache: 'no-cache' })
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});
