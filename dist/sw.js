// Bump this version whenever the app shell changes. New versions activate after
// all old app windows close, so an open form is never interrupted by an update.
const CACHE = 'little-hello-shell-v2';
const FILES = ['./', './index.html', './style.css', './app.js', './history.js', './pwa.js', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png'];
const urls = FILES.map(path => new URL(path, self.registration.scope).href);
const essential = urls.slice(0, 6);
async function prepareOffline() {
  const cache = await caches.open(CACHE);
  await Promise.all(essential.map(async url => {
    if (await cache.match(url)) return;
    const response = await fetch(new Request(url, { cache: 'reload' }));
    if (!response.ok || response.redirected) throw new Error('App shell unavailable');
    await cache.put(url, response);
  }));
}
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    await prepareOffline();
    const cache = await caches.open(CACHE);
    // An unavailable icon must not prevent the app from working offline.
    await Promise.allSettled(urls.slice(6).map(async url => {
      const response = await fetch(new Request(url, { cache: 'reload' }));
      if (response.ok && !response.redirected) await cache.put(url, response);
    }));
  })());
});
self.addEventListener('message', event => {
  if (event.data?.type !== 'PREPARE_OFFLINE') return;
  event.waitUntil(prepareOffline().then(
    () => event.ports[0]?.postMessage({ ready: true }),
    () => event.ports[0]?.postMessage({ ready: false })
  ));
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) {
      if (key.startsWith('little-hello-shell-') && key !== CACHE) await caches.delete(key);
    }
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  const root = new URL('./', self.registration.scope);
  // Only serve our app shell; leave authentication and external requests alone.
  const isHome = event.request.mode === 'navigate' && (url.pathname === root.pathname || url.pathname === root.pathname + 'index.html');
  if (url.origin !== root.origin || (!isHome && !urls.includes(url.href))) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cacheKey = isHome ? root.href : event.request;
    const cached = await cache.match(cacheKey);
    if (cached) return cached;
    if (isHome) {
      const fallback = await cache.match(new URL('index.html', root).href);
      if (fallback) return fallback;
    }
    const response = await fetch(event.request);
    if (response.ok && !response.redirected) await cache.put(cacheKey, response.clone());
    return response;
  })());
});
