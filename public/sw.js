// Production-ready Offline Service Worker for Learn Japanese PWA
const CACHE_NAME = 'learn-japanese-v1'
const DYNAMIC_CACHE_NAME = 'learn-japanese-dynamic-v1'

// Critical routes & static assets to precache on install
const PRECACHE_ASSETS = [
  '/',
  '/vocabulary',
  '/vocabulary-quiz',
  '/kanji',
  '/kanji-practice',
  '/alphabet',
  '/quiz',
  '/phrases',
  '/reading',
  '/converter',
  '/cheat-sheets',
  '/site.webmanifest',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/learn-japnese.svg',
]

// 1. Install Event: Cache critical pages & assets
self.addEventListener('install', (event) => {
  self.skipWaiting()
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.allSettled(
        PRECACHE_ASSETS.map((url) =>
          cache.add(url).catch((err) => {
            console.warn(`[SW] Precache skipped for ${url}:`, err)
          })
        )
      )
    })
  )
})

// 2. Activate Event: Clean up outdated caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => {
        return Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME && key !== DYNAMIC_CACHE_NAME) {
              return caches.delete(key)
            }
          })
        )
      })
      .then(() => self.clients.claim())
  )
})

// 3. Fetch Event: Smart Offline Caching Strategy
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Only handle GET requests and http/https schemes
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return
  }

  // Bypass API and auth routes
  if (url.pathname.startsWith('/api/') || url.pathname.includes('/auth/')) {
    return
  }

  // A. Navigation requests (User browsing pages)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const cloned = response.clone()
            caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
              cache.put(request, cloned)
            })
          }
          return response
        })
        .catch(async () => {
          // Offline fallback: check exact request match
          const cachedResponse = await caches.match(request)
          if (cachedResponse) {
            return cachedResponse
          }

          // Check by pathname
          const matchByPath = await caches.match(url.pathname)
          if (matchByPath) {
            return matchByPath
          }

          // Fallback to home page or vocabulary
          const homeFallback = await caches.match('/')
          if (homeFallback) {
            return homeFallback
          }

          return new Response(
            `<!DOCTYPE html>
            <html lang="bn">
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <title>Offline - Learn Japanese</title>
              <style>
                body { font-family: system-ui, -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #09090b; color: #fafafa; text-align: center; padding: 20px; }
                .box { max-width: 420px; padding: 32px; border-radius: 20px; background: #18181b; border: 1px solid #27272a; }
                h2 { margin-top: 0; color: #f43f5e; font-size: 24px; }
                p { color: #a1a1aa; line-height: 1.6; font-size: 15px; }
                a { display: inline-block; margin-top: 16px; padding: 10px 24px; border-radius: 9999px; background: #2563eb; color: white; text-decoration: none; font-weight: bold; font-size: 14px; }
              </style>
            </head>
            <body>
              <div class="box">
                <h2>⚡ আপনি অফলাইনে আছেন</h2>
                <p>ইন্টারনেট সংযোগ পাওয়া যায়নি। পূর্বে লোড করা পাতা বা ভোকাবুলারি পড়তে নিচের বাটনে ক্লিক করুন।</p>
                <a href="/">হোম পেজে যান</a>
              </div>
            </body>
            </html>`,
            { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
          )
        })
    )
    return
  }

  // B. Next.js Static assets (_next/static, css, js, fonts, images) -> Stale-while-revalidate / Cache-first
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|webp|woff2?|ico)$/)
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // Background revalidation
          fetch(request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
                  cache.put(request, networkResponse)
                })
              }
            })
            .catch(() => {})
          return cachedResponse
        }

        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const cloned = networkResponse.clone()
            caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
              cache.put(request, cloned)
            })
          }
          return networkResponse
        })
      })
    )
    return
  }

  // C. Other assets: Network-first with cache fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.status === 200) {
          const cloned = response.clone()
          caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
            cache.put(request, cloned)
          })
        }
        return response
      })
      .catch(() => caches.match(request))
  )
})
