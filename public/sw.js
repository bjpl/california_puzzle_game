/**
 * Service Worker for California Counties Puzzle Game
 *
 * Purpose: Enable offline gameplay with smart caching strategy
 * Strategy: 3-tier caching (pre-cache app shell, runtime cache assets, network-first APIs)
 *
 * Cache Tiers:
 * - Tier 1 (Pre-cache): App shell + ultra-low/low geodata (~3MB)
 * - Tier 2 (Runtime): Medium/high geodata, images (~5-8MB)
 * - Tier 3 (Network-first): Census data, API calls
 *
 * Browser Support: Chrome 40+, Firefox 44+, Safari 11.1+
 * Last updated: 2025-10-09
 */

const CACHE_VERSION = 'v1';
const CACHE_NAME = `ca-puzzle-${CACHE_VERSION}`;
const GEODATA_CACHE = `ca-geodata-${CACHE_VERSION}`;
const RUNTIME_CACHE = `ca-runtime-${CACHE_VERSION}`;

// Base path for GitHub Pages deployment
const BASE_PATH = '/california_puzzle_game';

// Tier 1: Pre-cache on install (app shell + essential geodata)
const PRECACHE_URLS = [
  `${BASE_PATH}/`,
  `${BASE_PATH}/index.html`,
  `${BASE_PATH}/california-icon.svg`,
  `${BASE_PATH}/data/geo/ca-counties-ultra-low.geojson`,
  `${BASE_PATH}/data/geo/ca-counties-low.geojson`,
  `${BASE_PATH}/data/geo/county-lookup.json`,
  `${BASE_PATH}/data/geo/geo-manifest.json`,
  `${BASE_PATH}/data/geo/projection-configs.json`,
];

// Tier 2: Runtime cache patterns (lazy-loaded geodata, images)
const RUNTIME_CACHE_PATTERNS = [
  /\/data\/geo\/ca-counties-medium\.geojson$/,
  /\/data\/geo\/ca-counties-high\.geojson$/,
  /\.(png|jpg|jpeg|svg|gif|webp)$/,
  /\.(woff|woff2|ttf|eot)$/,
];

// Tier 3: Network-first patterns (always try fresh data)
const NETWORK_FIRST_PATTERNS = [
  /\/data\/geo\/ca-counties-census\.geojson$/,
  /\/api\//,
];

// Max cache sizes
const MAX_GEODATA_CACHE_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_RUNTIME_CACHE_SIZE = 20 * 1024 * 1024; // 20MB

/**
 * Install Event: Pre-cache essential assets
 *
 * CONCEPT: Service Worker lifecycle - install happens once per version
 * WHY: Pre-caching ensures offline functionality from first install
 * PATTERN: Cache-then-activate ensures atomic updates
 */
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker version:', CACHE_VERSION);

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Pre-caching app shell and essential geodata');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => {
        console.log('[SW] Pre-cache complete, skipping waiting');
        return self.skipWaiting(); // Activate immediately
      })
      .catch((error) => {
        console.error('[SW] Pre-cache failed:', error);
        throw error;
      })
  );
});

/**
 * Activate Event: Clean up old caches
 *
 * CONCEPT: Cache versioning and cleanup
 * WHY: Prevents storage bloat from outdated caches
 * PATTERN: Delete old caches atomically during activation
 */
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker version:', CACHE_VERSION);

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => {
              // Delete caches from old versions
              return name.startsWith('ca-') && !name.endsWith(CACHE_VERSION);
            })
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('[SW] Claiming clients');
        return self.clients.claim(); // Take control immediately
      })
  );
});

/**
 * Fetch Event: Smart caching strategy router
 *
 * CONCEPT: Request interception and caching strategies
 * WHY: Different asset types need different caching approaches
 * PATTERN: Strategy pattern - route requests to appropriate handlers
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Route to appropriate caching strategy
  if (shouldUseNetworkFirst(url.pathname)) {
    event.respondWith(networkFirst(request));
  } else if (shouldCacheRuntime(url.pathname)) {
    event.respondWith(cacheFirst(request, RUNTIME_CACHE));
  } else if (url.pathname.includes('/data/geo/')) {
    event.respondWith(cacheFirst(request, GEODATA_CACHE));
  } else {
    event.respondWith(cacheFirst(request, CACHE_NAME));
  }
});

/**
 * Cache-First Strategy: Fast offline access
 *
 * CONCEPT: Prioritize cached content for performance
 * WHY: Instant load for static assets, works offline
 * PATTERN: Cache-first with network fallback and background update
 */
async function cacheFirst(request, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);

    if (cached) {
      console.log('[SW] Cache hit:', request.url);

      // Background update for stale content (stale-while-revalidate)
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            cache.put(request, response.clone());
          }
        })
        .catch(() => {
          // Ignore network errors during background update
        });

      return cached;
    }
  } catch (error) {
    console.error('[SW] Cache read error:', error);
    // Fall through to network fetch
  }

  console.log('[SW] Cache miss, fetching:', request.url);

  try {
    const response = await fetch(request);

    if (response && response.status === 200) {
      try {
        const cache = await caches.open(cacheName);
        // Cache size check before storing
        const contentLength = response.headers.get('content-length');
        const maxSize = cacheName === GEODATA_CACHE ? MAX_GEODATA_CACHE_SIZE : MAX_RUNTIME_CACHE_SIZE;

        if (!contentLength || parseInt(contentLength) < maxSize) {
          await cache.put(request, response.clone());
        } else {
          console.warn('[SW] Response too large to cache:', request.url, contentLength);
        }
      } catch (cacheError) {
        console.error('[SW] Failed to cache response:', cacheError);
        // Continue anyway - return the response even if caching fails
      }
    }

    return response;
  } catch (error) {
    console.error('[SW] Network failed, no cache available:', request.url, error);

    // Return offline fallback page if available
    try {
      const cache = await caches.open(cacheName);
      const offlineFallback = await cache.match(`${BASE_PATH}/offline.html`);
      if (offlineFallback) {
        return offlineFallback;
      }
    } catch (fallbackError) {
      console.error('[SW] Failed to retrieve offline fallback:', fallbackError);
    }

    // If all else fails, throw to let browser handle it
    throw error;
  }
}

/**
 * Network-First Strategy: Fresh data priority
 *
 * CONCEPT: Prioritize network for dynamic content
 * WHY: Ensures users get latest data when online
 * PATTERN: Network-first with cache fallback for offline resilience
 */
async function networkFirst(request) {
  const cache = await caches.open(RUNTIME_CACHE);

  try {
    console.log('[SW] Network-first fetch:', request.url);
    const response = await fetch(request);

    if (response && response.status === 200) {
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.warn('[SW] Network failed, trying cache:', request.url);
    const cached = await cache.match(request);

    if (cached) {
      return cached;
    }

    throw error;
  }
}

/**
 * Strategy Routing Helpers
 */
function shouldUseNetworkFirst(pathname) {
  return NETWORK_FIRST_PATTERNS.some((pattern) => pattern.test(pathname));
}

function shouldCacheRuntime(pathname) {
  return RUNTIME_CACHE_PATTERNS.some((pattern) => pattern.test(pathname));
}

/**
 * Message Event: Handle commands from app
 *
 * CONCEPT: Two-way communication between SW and app
 * WHY: Allows app to trigger cache updates, clear storage, etc.
 * PATTERN: Command pattern with message passing
 */
self.addEventListener('message', (event) => {
  const { type, payload } = event.data;

  switch (type) {
    case 'SKIP_WAITING':
      console.log('[SW] Received SKIP_WAITING command');
      self.skipWaiting();
      break;

    case 'CLAIM_CLIENTS':
      console.log('[SW] Received CLAIM_CLIENTS command');
      self.clients.claim();
      break;

    case 'CLEAR_CACHE':
      console.log('[SW] Received CLEAR_CACHE command');
      event.waitUntil(
        caches.keys().then((names) => {
          return Promise.all(names.map((name) => caches.delete(name)));
        })
      );
      break;

    case 'PREFETCH_GEODATA':
      console.log('[SW] Received PREFETCH_GEODATA command:', payload);
      event.waitUntil(prefetchGeodata(payload.levels));
      break;

    default:
      console.warn('[SW] Unknown message type:', type);
  }
});

/**
 * Prefetch Geodata: Proactively cache geodata levels
 *
 * CONCEPT: Predictive caching based on user behavior
 * WHY: Improves perceived performance by caching before user needs it
 * PATTERN: Background fetch with priority queue
 */
async function prefetchGeodata(levels = ['medium']) {
  const cache = await caches.open(GEODATA_CACHE);

  const urls = levels.map((level) => `${BASE_PATH}/data/geo/ca-counties-${level}.geojson`);

  for (const url of urls) {
    try {
      const response = await fetch(url);
      if (response && response.status === 200) {
        await cache.put(url, response);
        console.log('[SW] Prefetched geodata:', url);
      }
    } catch (error) {
      console.error('[SW] Prefetch failed for:', url, error);
    }
  }
}

/**
 * Sync Event: Background sync for offline actions
 *
 * CONCEPT: Deferred execution when network available
 * WHY: Allows user to perform actions offline that execute when online
 * PATTERN: Background Sync API with retry logic
 *
 * Note: Background Sync not supported on iOS Safari yet
 */
self.addEventListener('sync', (event) => {
  console.log('[SW] Sync event:', event.tag);

  if (event.tag === 'sync-progress') {
    event.waitUntil(syncProgressData());
  }
});

async function syncProgressData() {
  // Future: Sync game progress to backend when available
  console.log('[SW] Syncing progress data...');
}

/**
 * Push Event: Push notifications
 *
 * CONCEPT: Server-initiated notifications
 * WHY: Re-engagement for achievements, daily challenges, etc.
 * PATTERN: Push API with notification display
 *
 * Note: Requires user permission and backend push server
 */
self.addEventListener('push', (event) => {
  console.log('[SW] Push received:', event);

  const options = {
    body: event.data ? event.data.text() : 'New achievement unlocked!',
    icon: `${BASE_PATH}/california-icon-192.png`,
    badge: `${BASE_PATH}/california-icon-192.png`,
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: 'explore',
        title: 'View Achievement',
      },
      {
        action: 'close',
        title: 'Close',
      },
    ],
  };

  event.waitUntil(
    self.registration.showNotification('California Puzzle', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);

  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow(`${BASE_PATH}/?notification=achievement`)
    );
  }
});

console.log('[SW] Service Worker loaded, version:', CACHE_VERSION);
