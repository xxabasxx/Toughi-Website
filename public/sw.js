/* طوقی — Service Worker: حالت آفلاین و کش هوشمند */
const VERSION = "toughi-v2";
const SHELL = `${VERSION}-shell`;
const PAGES = `${VERSION}-pages`;
const ASSETS = `${VERSION}-assets`;
const MEDIA = `${VERSION}-media`;
const ALL_CACHES = [SHELL, PAGES, ASSETS, MEDIA];

const PRECACHE_URLS = [
  "/offline",
  "/guide",
  "/icon.svg",
  "/images/hero-pigeon.jpg",
  "/images/cta-cockatoo.jpg",
];

const MAX_PAGES = 60;
const MAX_ASSETS = 200;
const MAX_MEDIA = 250;

function trimCache(cache, max) {
  return cache.keys().then((keys) => {
    if (keys.length <= max) return Promise.resolve();
    return Promise.all(keys.slice(0, keys.length - max).map((k) => cache.delete(k)));
  });
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .catch(() => undefined)
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => !ALL_CACHES.includes(k)).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.protocol !== "http:" && url.protocol !== "https:") return;

  /* APIها همیشه از شبکه — هرگز کش نشوند */
  if (url.origin === self.location.origin && url.pathname.startsWith("/api/")) return;
  if (url.pathname.startsWith("/_next/webpack-hmr")) return;

  /* درخواست‌های دیتای App Router (RSC / prefetch): شبکه-اول بدون جایگزین HTML */
  if (
    req.headers.get("RSC") === "1" ||
    url.searchParams.has("_rsc") ||
    req.headers.get("next-router-prefetch") === "1" ||
    req.headers.get("next-router-segment-prefetch") === "1"
  ) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(PAGES).then((cache) => cache.put(req, clone));
          }
          return res;
        })
        .catch(() =>
          caches.match(req).then((hit) => hit || new Response("offline", { status: 503, statusText: "Offline" })),
        ),
    );
    return;
  }

  /* دارایی‌های استاتیک (باندل‌های نکست، فونت‌ها، تصاویر محلی و آپلودی): کش-اول */
  if (
    url.origin === self.location.origin &&
    (url.pathname.startsWith("/_next/static/") ||
      url.pathname.startsWith("/images/") ||
      url.pathname.startsWith("/icons/") ||
      url.pathname.startsWith("/uploads/") ||
      url.pathname === "/icon.svg" ||
      /\.(woff2?|ttf|otf)$/.test(url.pathname))
  ) {
    event.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            if (res.ok) {
              const clone = res.clone();
              caches.open(ASSETS).then((cache) => {
                cache.put(req, clone);
                trimCache(cache, MAX_ASSETS);
              });
            }
            return res;
          }),
      ),
    );
    return;
  }

  /* تصاویر خارجی (Pexels و...) — Stale-While-Revalidate */
  if (url.origin !== self.location.origin && /\.(png|jpe?g|webp|avif|gif|svg)(\?|$)/.test(url.pathname)) {
    event.respondWith(
      caches.open(MEDIA).then(async (cache) => {
        const cached = await cache.match(req);
        const network = fetch(req)
          .then((res) => {
            if (res.ok || res.type === "opaque") {
              cache.put(req, res.clone());
              trimCache(cache, MAX_MEDIA);
            }
            return res;
          })
          .catch(() => cached);
        return cached || network;
      }),
    );
    return;
  }

  /* صفحات (سند HTML): شبکه-اول ← کش صفحه‌ای استفاده نشده ← صفحه آفلاین */
  if (req.mode === "navigate" || req.destination === "document" || (req.headers.get("accept") || "").includes("text/html")) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(PAGES).then((cache) => {
              cache.put(req, clone);
              trimCache(cache, MAX_PAGES);
            });
          }
          return res;
        })
        .catch(async () => {
          const cached = await caches.match(req);
          return cached || caches.match("/offline");
        }),
    );
    return;
  }

  /* سایر موارد: شبکه-اول ← کش */
  event.respondWith(
    caches.match(req).then(async (hit) => {
      try {
        const res = await fetch(req);
        if (res.ok || res.type === "opaque") {
          const clone = res.clone();
          caches.open(ASSETS).then((cache) => cache.put(req, clone));
        }
        return res;
      } catch {
        return hit || new Response("offline", { status: 503, statusText: "Offline" });
      }
    }),
  );
});
