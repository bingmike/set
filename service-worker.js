const cacheName = 'setcache';
const filesToCache = [
	'/set/index.htm',
	'/set/favicon.png',
	'/set/style.css',
	'/set/gamecode.js',
	'/set/TUZyzwprpvBS1izr_vOECuSf.woff2',
	'/set/z7NFdQDnbTkabZAIOl9il_O6KJj73e7Ff1GhDuXMRw.woff2',
    '/set/icon-128x128.png',
    '/set/icon-144x144.png',
    '/set/icon-152x152.png',
    '/set/icon-192x192.png',
    '/set/icon-256x256.png',
    '/set/icon-512x512.png',
];

self.addEventListener('install', function(e) {
  console.log('[ServiceWorker] Install');
  e.waitUntil(
    caches.open(cacheName).then(function(cache) {
      console.log('[ServiceWorker] Caching app shell');
      return cache.addAll(filesToCache);
    })
  );
});

self.addEventListener('activate', function(e) {
  console.log('[ServiceWorker] Activate');
  e.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(keyList.map(function(key) {
        if (key !== cacheName) {
          console.log('[ServiceWorker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  return self.clients.claim();
});

// This one only uses network if it's not cached.
// self.addEventListener('fetch', function(e) {
//   console.log('[ServiceWorker] Fetch', e.request.url);
//   e.respondWith(
//     caches.match(e.request).then(function(response) {
//       return response || fetch(e.request);
//     })
//   );
// });

// This one should only use cache when network fails.
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
