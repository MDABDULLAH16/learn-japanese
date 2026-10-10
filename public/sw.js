// A basic service worker to satisfy PWA install requirements
// Version 2 - Cache Buster
self.addEventListener('install', (event) => {
  console.log('Service worker installing...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service worker activating...');
});

self.addEventListener('fetch', (event) => {
  // A proper fetch handler is required by Chrome for PWA installability.
  event.respondWith(
    fetch(event.request).catch(() => {
      return new Response("Offline Content", { status: 503 });
    })
  );
});
