self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("cs-intake-v1").then((cache) => {
      return cache.addAll([
        "./",
        "./index.html",
        "./app.js",
        "./logo.png",
        "./manifest.webmanifest",
        "./icon-192.png",
        "./icon-512.png"
      ]);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
