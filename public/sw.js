// A basic service worker to satisfy PWA install requirements
self.addEventListener('install', (event) => {
  console.log('Service worker installing...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service worker activating...');
});

self.addEventListener('fetch', (event) => {
  // We need a fetch event handler to be installable as a PWA.
  // This minimal one just passes the request through to the network.
  // In a real offline app, you'd implement caching strategies here.
});
