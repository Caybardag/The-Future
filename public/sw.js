// Service Worker for Teknolojik Evrim Takvimi PWA & TWA Google Play Readiness
const CACHE_NAME = "evrim-takvimi-v5";
const ASSETS_TO_CACHE = [
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
  "/icon-maskable-512.png",
  "/apple-touch-icon.png",
  "/screenshot-mobile.png",
  "/screenshot-desktop.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => console.log("Cache pre-fetch warn:", err));
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Network-First for Navigation & HTML, bypass Vite dev/src requests
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Bypass API calls and Vite dev server requests completely
  if (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/src/") ||
    url.pathname.includes("@vite") ||
    url.pathname.includes("@fs") ||
    url.pathname.includes("node_modules")
  ) {
    return;
  }

  // Navigation requests (HTML): Always network first so users get fresh bundles, fallback to cache if offline
  if (event.request.mode === "navigate" || event.request.headers.get("accept")?.includes("text/html")) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(event.request).then((cached) => cached || caches.match("/index.html")))
    );
    return;
  }

  // Static assets (production assets, images): Cache-first with network fallback
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) return response;
      return fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === "basic") {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return networkResponse;
      });
    })
  );
});

// 1. Background Sync Support
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-timeline-cache") {
    event.waitUntil(
      fetch("/api/brain/knowledge-matrix")
        .then((res) => res.json())
        .then((data) => console.log("Background sync brain matrix updated:", data?.totalNodes))
        .catch((err) => console.log("Background sync error:", err))
    );
  }
});

// 2. Periodic Background Sync Support
self.addEventListener("periodicsync", (event) => {
  if (event.tag === "periodic-futurist-sync") {
    event.waitUntil(
      fetch("/api/brain/autonomous-status")
        .then((res) => res.json())
        .then((data) => console.log("Periodic background check completed:", data))
        .catch((err) => console.log("Periodic sync error:", err))
    );
  }
});

// 3. Push Notifications Support
self.addEventListener("push", (event) => {
  let payload = { title: "Teknolojik Evrim Takvimi", body: "Yeni bir teknolojik keşif doğrulandı." };
  try {
    if (event.data) {
      payload = event.data.json();
    }
  } catch (e) {
    if (event.data) {
      payload.body = event.data.text();
    }
  }

  const options = {
    body: payload.body,
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
      url: "/"
    },
    actions: [
      { action: "explore", title: "Zaman Çizelgesini Aç" },
      { action: "close", title: "Kapat" }
    ]
  };

  event.waitUntil(self.registration.showNotification(payload.title, options));
});

// Notification Click Handler
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  if (event.action === "explore" || !event.action) {
    event.waitUntil(
      self.clients.matchAll({ type: "window" }).then((clientList) => {
        for (const client of clientList) {
          if (client.url === "/" && "focus" in client) {
            return client.focus();
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow("/");
        }
      })
    );
  }
});
