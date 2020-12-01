/// <reference no-default-lib="true" />
/// <reference lib="es7" />
/// <reference lib="webworker" />

const sw = (self as unknown) as ServiceWorkerGlobalScope & {
  __precacheManifest: { url: string; revision: string }[];
};

const precacheVersion = sw.__precacheManifest.reduce(
  (a, p) => a + p.revision,
  ''
);
const precacheFiles = sw.__precacheManifest.map((p) => p.url);

const cache = () => caches.open(precacheVersion);

sw.addEventListener('install', (ev) => {
  // Do not finish installing until every file in the app has been cached
  ev.waitUntil(cache().then((cache) => cache.addAll(precacheFiles)));
});

// Optionally, to clear previous precaches, also use the following:
sw.addEventListener('activate', (ev) => {
  ev.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== precacheVersion).map((k) => caches.delete(k))
        )
      )
  );
});

sw.addEventListener('fetch', (ev) => {
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
