
const CACHE="skin-care-01-v1";
const ASSETS=["./","./index.html","./styles.css","./app.js","./manifest.json","./assets/icon-192.png","./assets/icon-512.png","./assets/objetivo-evolucion.png","./assets/productos-principales.jpeg","./assets/muestras-y-stick.jpeg","./assets/punto-de-partida.jpeg"];
self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS))));
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))));
self.addEventListener("fetch",e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));
