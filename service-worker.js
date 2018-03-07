var cacheName = 'weatherPWA-step-6-1';
var filesToCache = [
  'https://bingmike.github.io/set/',
  'https://bingmike.github.io/set/index.html',
  'https://bingmike.github.io/set/set.js',
  'https://bingmike.github.io/set/setgame.js',
  'https://bingmike.github.io/set/imgs/1ogd.png',
  'https://bingmike.github.io/set/imgs/1ogo.png',
  'https://bingmike.github.io/set/imgs/1ogs.png',
  'https://bingmike.github.io/set/imgs/1opd.png',
  'https://bingmike.github.io/set/imgs/1opo.png',
  'https://bingmike.github.io/set/imgs/1ops.png',
  'https://bingmike.github.io/set/imgs/1ord.png',
  'https://bingmike.github.io/set/imgs/1oro.png',
  'https://bingmike.github.io/set/imgs/1ors.png',
  'https://bingmike.github.io/set/imgs/1sgd.png',
  'https://bingmike.github.io/set/imgs/1sgo.png',
  'https://bingmike.github.io/set/imgs/1sgs.png',
  'https://bingmike.github.io/set/imgs/1spd.png',
  'https://bingmike.github.io/set/imgs/1spo.png',
  'https://bingmike.github.io/set/imgs/1sps.png',
  'https://bingmike.github.io/set/imgs/1srd.png',
  'https://bingmike.github.io/set/imgs/1sro.png',
  'https://bingmike.github.io/set/imgs/1srs.png',
  'https://bingmike.github.io/set/imgs/1tgd.png',
  'https://bingmike.github.io/set/imgs/1tgo.png',
  'https://bingmike.github.io/set/imgs/1tgs.png',
  'https://bingmike.github.io/set/imgs/1tpd.png',
  'https://bingmike.github.io/set/imgs/1tpo.png',
  'https://bingmike.github.io/set/imgs/1tps.png',
  'https://bingmike.github.io/set/imgs/1trd.png',
  'https://bingmike.github.io/set/imgs/1tro.png',
  'https://bingmike.github.io/set/imgs/1trs.png',
  'https://bingmike.github.io/set/imgs/2ogd.png',
  'https://bingmike.github.io/set/imgs/2ogo.png',
  'https://bingmike.github.io/set/imgs/2ogs.png',
  'https://bingmike.github.io/set/imgs/2opd.png',
  'https://bingmike.github.io/set/imgs/2opo.png',
  'https://bingmike.github.io/set/imgs/2ops.png',
  'https://bingmike.github.io/set/imgs/2ord.png',
  'https://bingmike.github.io/set/imgs/2oro.png',
  'https://bingmike.github.io/set/imgs/2ors.png',
  'https://bingmike.github.io/set/imgs/2sgd.png',
  'https://bingmike.github.io/set/imgs/2sgo.png',
  'https://bingmike.github.io/set/imgs/2sgs.png',
  'https://bingmike.github.io/set/imgs/2spd.png',
  'https://bingmike.github.io/set/imgs/2spo.png',
  'https://bingmike.github.io/set/imgs/2sps.png',
  'https://bingmike.github.io/set/imgs/2srd.png',
  'https://bingmike.github.io/set/imgs/2sro.png',
  'https://bingmike.github.io/set/imgs/2srs.png',
  'https://bingmike.github.io/set/imgs/2tgd.png',
  'https://bingmike.github.io/set/imgs/2tgo.png',
  'https://bingmike.github.io/set/imgs/2tgs.png',
  'https://bingmike.github.io/set/imgs/2tpd.png',
  'https://bingmike.github.io/set/imgs/2tpo.png',
  'https://bingmike.github.io/set/imgs/2tps.png',
  'https://bingmike.github.io/set/imgs/2trd.png',
  'https://bingmike.github.io/set/imgs/2tro.png',
  'https://bingmike.github.io/set/imgs/2trs.png',
  'https://bingmike.github.io/set/imgs/3ogd.png',
  'https://bingmike.github.io/set/imgs/3ogo.png',
  'https://bingmike.github.io/set/imgs/3ogs.png',
  'https://bingmike.github.io/set/imgs/3opd.png',
  'https://bingmike.github.io/set/imgs/3opo.png',
  'https://bingmike.github.io/set/imgs/3ops.png',
  'https://bingmike.github.io/set/imgs/3ord.png',
  'https://bingmike.github.io/set/imgs/3oro.png',
  'https://bingmike.github.io/set/imgs/3ors.png',
  'https://bingmike.github.io/set/imgs/3sgd.png',
  'https://bingmike.github.io/set/imgs/3sgo.png',
  'https://bingmike.github.io/set/imgs/3sgs.png',
  'https://bingmike.github.io/set/imgs/3spd.png',
  'https://bingmike.github.io/set/imgs/3spo.png',
  'https://bingmike.github.io/set/imgs/3sps.png',
  'https://bingmike.github.io/set/imgs/3srd.png',
  'https://bingmike.github.io/set/imgs/3sro.png',
  'https://bingmike.github.io/set/imgs/3srs.png',
  'https://bingmike.github.io/set/imgs/3tgd.png',
  'https://bingmike.github.io/set/imgs/3tgo.png',
  'https://bingmike.github.io/set/imgs/3tgs.png',
  'https://bingmike.github.io/set/imgs/3tpd.png',
  'https://bingmike.github.io/set/imgs/3tpo.png',
  'https://bingmike.github.io/set/imgs/3tps.png',
  'https://bingmike.github.io/set/imgs/3trd.png',
  'https://bingmike.github.io/set/imgs/3tro.png',
  'https://bingmike.github.io/set/imgs/3trs.png',
  'https://bingmike.github.io/set/imgs/back2.png',
  'https://bingmike.github.io/set/imgs/finder2.png',
  'https://bingmike.github.io/set/imgs/gameover.svg',
  'https://bingmike.github.io/set/imgs/hilite2.gif',
  'https://bingmike.github.io/set/imgs/squiggle-icon.png',
  'https://bingmike.github.io/set/imgs/x.svg',
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


