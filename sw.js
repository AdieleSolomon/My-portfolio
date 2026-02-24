const VERSION = "v3";
const STATIC_CACHE = `portfolio-static-${VERSION}`;
const DYNAMIC_CACHE = `portfolio-dynamic-${VERSION}`;
const OFFLINE_PAGE = "/offline.html";

const APP_SHELL = [
  "/",
  "/index.html",
  "/portfolio.html",
  "/404.html",
  OFFLINE_PAGE,
  "/assets/css/style.css",
  "/js/script.js",
  "/favicon.svg",
  "/site.webmanifest",
];

const canCacheResponse = (response) =>
  response &&
  response.status === 200 &&
  (response.type === "basic" || response.type === "cors");

const isSameOriginRequest = (request) => {
  const requestUrl = new URL(request.url);
  return requestUrl.origin === self.location.origin;
};

const isStaticAssetRequest = (request) =>
  ["style", "script", "image", "font"].includes(request.destination);

const putInCache = async (cacheName, request, response) => {
  if (!canCacheResponse(response)) return;
  const cache = await caches.open(cacheName);
  await cache.put(request, response.clone());
};

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  const keepCaches = new Set([STATIC_CACHE, DYNAMIC_CACHE]);

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((cacheName) => !keepCaches.has(cacheName))
            .map((cacheName) => caches.delete(cacheName))
        )
      )
      .then(() => self.clients.claim())
  );
});

const networkFirst = async (request) => {
  try {
    const networkResponse = await fetch(request);
    await putInCache(DYNAMIC_CACHE, request, networkResponse);
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) return cachedResponse;

    if (request.mode === "navigate") {
      return caches.match(OFFLINE_PAGE);
    }

    throw error;
  }
};

const staleWhileRevalidate = async (request) => {
  const cachedResponse = await caches.match(request);

  const networkPromise = fetch(request)
    .then(async (networkResponse) => {
      await putInCache(DYNAMIC_CACHE, request, networkResponse);
      return networkResponse;
    })
    .catch(() => null);

  if (cachedResponse) return cachedResponse;

  const networkResponse = await networkPromise;
  if (networkResponse) return networkResponse;

  if (request.mode === "navigate") {
    return caches.match(OFFLINE_PAGE);
  }

  return new Response(null, { status: 504, statusText: "Gateway Timeout" });
};

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET" || !request.url.startsWith("http")) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request));
    return;
  }

  if (isSameOriginRequest(request) && isStaticAssetRequest(request)) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  if (isSameOriginRequest(request)) {
    event.respondWith(networkFirst(request));
  }
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
