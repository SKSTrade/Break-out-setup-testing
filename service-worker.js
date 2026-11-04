/* Separate PWA cache name: does not touch the legacy Master Trade app. */
const CACHE='breakout-research-v0.1.9-20261104-r1';
const ASSETS=['./','./index.html','./styles.css','./engine.js','./judgment.js','./app.js','./manifest.webmanifest','./icons/icon.svg'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(names=>Promise.all(names.filter(k=>k.startsWith('breakout-research-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',event=>{const u=new URL(event.request.url);if(event.request.method!=='GET'||u.origin!==self.location.origin||!u.pathname.startsWith(new URL(self.registration.scope).pathname))return;
event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(resp=>{if(resp.ok){const copy=resp.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));}return resp;})));});
