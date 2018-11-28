var cacheName = 'setimagecache';
var filesToCache = [
  'index.htm',
  'set.js',
  'setgame.js',
  'imgs/1ogd.png',
  'imgs/1ogo.png',
  'imgs/1ogs.png',
  'imgs/1opd.png',
  'imgs/1opo.png',
  'imgs/1ops.png',
  'imgs/1ord.png',
  'imgs/1oro.png',
  'imgs/1ors.png',
  'imgs/1sgd.png',
  'imgs/1sgo.png',
  'imgs/1sgs.png',
  'imgs/1spd.png',
  'imgs/1spo.png',
  'imgs/1sps.png',
  'imgs/1srd.png',
  'imgs/1sro.png',
  'imgs/1srs.png',
  'imgs/1tgd.png',
  'imgs/1tgo.png',
  'imgs/1tgs.png',
  'imgs/1tpd.png',
  'imgs/1tpo.png',
  'imgs/1tps.png',
  'imgs/1trd.png',
  'imgs/1tro.png',
  'imgs/1trs.png',
  'imgs/2ogd.png',
  'imgs/2ogo.png',
  'imgs/2ogs.png',
  'imgs/2opd.png',
  'imgs/2opo.png',
  'imgs/2ops.png',
  'imgs/2ord.png',
  'imgs/2oro.png',
  'imgs/2ors.png',
  'imgs/2sgd.png',
  'imgs/2sgo.png',
  'imgs/2sgs.png',
  'imgs/2spd.png',
  'imgs/2spo.png',
  'imgs/2sps.png',
  'imgs/2srd.png',
  'imgs/2sro.png',
  'imgs/2srs.png',
  'imgs/2tgd.png',
  'imgs/2tgo.png',
  'imgs/2tgs.png',
  'imgs/2tpd.png',
  'imgs/2tpo.png',
  'imgs/2tps.png',
  'imgs/2trd.png',
  'imgs/2tro.png',
  'imgs/2trs.png',
  'imgs/3ogd.png',
  'imgs/3ogo.png',
  'imgs/3ogs.png',
  'imgs/3opd.png',
  'imgs/3opo.png',
  'imgs/3ops.png',
  'imgs/3ord.png',
  'imgs/3oro.png',
  'imgs/3ors.png',
  'imgs/3sgd.png',
  'imgs/3sgo.png',
  'imgs/3sgs.png',
  'imgs/3spd.png',
  'imgs/3spo.png',
  'imgs/3sps.png',
  'imgs/3srd.png',
  'imgs/3sro.png',
  'imgs/3srs.png',
  'imgs/3tgd.png',
  'imgs/3tgo.png',
  'imgs/3tgs.png',
  'imgs/3tpd.png',
  'imgs/3tpo.png',
  'imgs/3tps.png',
  'imgs/3trd.png',
  'imgs/3tro.png',
  'imgs/3trs.png',
  'imgs/gameover.svg',
  'imgs/hilite2.gif',
  'imgs/squiggle-icon.png',
  'imgs/x.svg',
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

self.addEventListener('fetch', function(e) {
  console.log('[ServiceWorker] Fetch', e.request.url);
  e.respondWith(
    caches.match(e.request).then(function(response) {
      return response || fetch(e.request);
    })
  );
});


