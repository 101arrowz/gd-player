import { version, manifest } from '@parcel/service-worker';

declare const self: ServiceWorkerGlobalScope;

const cache = () => caches.open(version);

self.addEventListener('install', (ev) => {
  // Do not finish installing until every file in the app has been cached
  ev.waitUntil(cache().then((cache) => cache.addAll(manifest)));
});

// Optionally, to clear previous precaches, also use the following:
self.addEventListener('activate', (ev) => {
  ev.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== version).map((k) => caches.delete(k))
        )
      )
  );
});

self.addEventListener('fetch', (ev) => {
  ev.respondWith(
    cache().then((c) =>
      c.match(ev.request).then(
        (res) =>
          res ||
          fetch(ev.request).then((res) => {
            c.put(ev.request, res.clone());
            return res;
          })
      )
    )
  );
});
