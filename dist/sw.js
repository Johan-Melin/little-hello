// Bump this version whenever the app shell changes. New versions activate after
// all old app windows close, so an open form is never interrupted by an update.
const CACHE = 'little-hello-shell-v1';
const FILES = ['./', './index.html', './style.css', './app.js', './history.js', './pwa.js', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png'];
const urls = FILES.map(path => new URL(path, self.registration.scope).href);
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    // Never cache an authentication redirect as the application shell.
    const responses = await Promise.all(urls.map(async url => {
      const response = await fetch(new Request(url, { cache: 'reload' }));
      if (!response.ok || response.redirected) throw new Error('App shell unavailable');
      return response;
    }));
    await Promise.all(urls.map((url, i) => cache.put(url, responses[i])));
  })());
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
    return (await cache.match(isHome ? root.href : event.request)) || fetch(event.request);
  })());
});
