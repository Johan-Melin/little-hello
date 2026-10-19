const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const manifest = JSON.parse(fs.readFileSync('dist/manifest.webmanifest'));
assert.equal(manifest.display, 'standalone');
for (const icon of manifest.icons) {
  const png = fs.readFileSync('dist/' + icon.src);
  assert.equal(`${png.readUInt32BE(16)}x${png.readUInt32BE(20)}`, icon.sizes);
}
const listeners = {}, stores = new Map();
const key = r => typeof r === 'string' ? r : r.url;
const caches = {
  async open(name) {
    if (!stores.has(name)) stores.set(name, new Map());
    const store = stores.get(name);
    return { put: async (r, v) => store.set(key(r), v), match: async r => store.get(key(r)) };
  },
  async keys() { return [...stores.keys()]; },
  async delete(name) { return stores.delete(name); }
};
let offline = false;
vm.runInNewContext(fs.readFileSync('dist/sw.js', 'utf8'), {
  self: { registration: { scope: 'https://example.com/' }, clients: { claim: async () => {} }, addEventListener: (type, fn) => listeners[type] = fn },
  URL, Request, caches,
  fetch: async request => {
    if (offline) throw Error('offline');
    const pathname = new URL(key(request)).pathname;
    assert(fs.existsSync('dist/' + (pathname === '/' ? 'index.html' : pathname.slice(1))), `Missing cached asset: ${pathname}`);
    return { ok: true, redirected: false, url: key(request) };
  }
});
(async () => {
  let work;
  listeners.install({ waitUntil: p => work = p }); await work;
  offline = true;
  async function request(url, mode = 'cors', method = 'GET') {
    let response;
    listeners.fetch({ request: { url, mode, method }, respondWith: p => response = p });
    return response;
  }
  assert.equal((await request('https://example.com/?from=home', 'navigate')).url, 'https://example.com/');
  assert.equal((await request('https://example.com/history.js')).url, 'https://example.com/history.js');
  assert.equal(await request('https://example.com/signin-with-chatgpt', 'navigate'), undefined);
  assert.equal(await request('https://example.com/', 'cors', 'POST'), undefined);
  assert.equal(await request('https://fonts.googleapis.com/font.css'), undefined);
  stores.set('little-hello-shell-old', new Map()); stores.set('unrelated-cache', new Map());
  listeners.activate({ waitUntil: p => work = p }); await work;
  assert(!stores.has('little-hello-shell-old')); assert(stores.has('unrelated-cache'));
  console.log('PWA checks passed: icon sizes, cached assets, offline launch, history assets, request boundaries, cache cleanup.');
})().catch(error => { console.error(error); process.exitCode = 1; });
