/* ============================================================
   "片片公子" 个人博客 — Service Worker
   离线缓存策略：Cache-first for static assets
   ============================================================ */

var CACHE_NAME = 'pianpian-blog-v1';

var ASSETS = [
  '/',
  '/index.html',
  '/article-detail.html',
  '/style.css',
  '/utils.js',
  '/article-data.js',
  '/script.js',
  '/avatar.jpg',
  '/ShuBiao32.png',
  '/manifest.json'
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('fetch', function(e) {
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      return cached || fetch(e.request).then(function(response) {
        return caches.open(CACHE_NAME).then(function(cache) {
          cache.put(e.request, response.clone());
          return response;
        });
      });
    })
  );
});
