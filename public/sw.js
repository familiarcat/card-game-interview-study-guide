// Service Worker for Card Game Study Guide
const CACHE_NAME = 'card-game-study-v1';
const urlsToCache = [
  '/',
  '/_next/static/css/b634334bf9a0b8c3.css',
  '/_next/static/chunks/webpack-b92f0f5d1944d721.js',
  '/_next/static/chunks/main-app-7fb43714f1644f37.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});
