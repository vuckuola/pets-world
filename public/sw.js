const CACHE = 'wildlife-atlas-v1'
const PRECACHE = ['/', '/animal/komodo-dragon']

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(PRECACHE)))
})

self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(res => {
    if (res.ok) { const c = res.clone(); caches.open(CACHE).then(cache => cache.put(e.request, c)) }
    return res
  }).catch(() => caches.match('/'))))
})
