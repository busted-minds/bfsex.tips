const cacheName = 'bfsex-tips-v3';
const offlineUrl = new URL('./offline.html', self.location).toString();
const offlineFiles = [
  './',
  './index.html',
  './offline.html',
  './manifest.json',
  './css/tips.css',
  './js/libraries/vue.min.js',
  './js/libraries/html2canvas.min.js',
  './js/libraries/canvas2image.js',
  './js/min/tips.min.js',
  './svg/logo-red.svg',
  './svg/logo-white.svg',
  './svg/logo-duotone.svg',
  './svg/busted.svg',
  './img/bg1.jpg',
  './img/bg2.jpg',
  './img/bg3.jpg',
  './img/bg4.jpg',
  './img/bg5.jpg',
  './img/bg6.jpg',
  './img/bg7.jpg',
  './img/bg8.jpg',
  './img/bg9.jpg',
  './img/bg10.jpg',
].map(function(url) {
  return new URL(url, self.location).toString();
});

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(cacheName).then(function(cache) {
      return cache.addAll(offlineFiles);
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.map(function(key) {
        if (key !== cacheName) {
          return caches.delete(key);
        }
      }));
    }).then(function() {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function(event) {
  var request = event.request;

  if (request.method !== 'GET') {
    return;
  }

  if (new URL(request.url).origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    fetch(request).then(function(response) {
      if (response && response.status === 200 && request.url.indexOf(self.location.origin) === 0) {
        var copy = response.clone();
        caches.open(cacheName).then(function(cache) {
          cache.put(request, copy);
        });
      }

      return response;
    }).catch(function() {
      return caches.match(request, { ignoreSearch: true }).then(function(cached) {
        if (cached) {
          return cached;
        }

        if (request.headers.get('accept') && request.headers.get('accept').indexOf('text/html') !== -1) {
          return caches.match(offlineUrl);
        }
      });
    })
  );
});
