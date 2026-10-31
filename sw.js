/**
 * Nexcrest Insights - Service Worker for Offline PWA Capabilities
 * Version: v79
 */

const CACHE_NAME = 'nexcrest-insights-shell-v81';
const CORE_ASSETS = [
  './',
  './index.html',
  './css/styles.css?v=79',
  './js/firebase-config.js?v=79',
  './js/data.js?v=79',
  './js/auth.js?v=79',
  './js/app.js?v=79',
  './assets/nexcrest_icon.png',
  './manifest.webmanifest'
];

// Install event: pre-cache core application shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CORE_ASSETS).catch((err) => {
        console.warn('Pre-cache warning for offline shell:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate event: clean up stale legacy caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event: Network-first for dynamic content with cache fallback
self.addEventListener('fetch', (event) => {
  // Only intercept GET requests and avoid Firestore / external API requests
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  
  if (url.origin.includes('firestore.googleapis.com') || url.origin.includes('firebaseio.com')) {
    return; // Firestore SDK handles its own indexedDB offline synchronization
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Fallback to cache when offline
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
      })
  );
});

