const V='v6',STATIC='costsync-static-'+V,DYN='costsync-dynamic-'+V;
const CORE=['./','index.html','offline.html','css/styles.css','js/app.js','js/db.js','manifest.webmanifest','favicon.svg','icons/icon-192.png','icons/icon-512.png','icons/apple-touch-icon.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(STATIC).then(c=>c.addAll(CORE))));
self.addEventListener('message',e=>{if(e.data==='SKIP')self.skipWaiting()});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(n=>n!==STATIC&&n!==DYN).map(n=>caches.delete(n)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;
 if(r.mode==='navigate'){e.respondWith(fetch(r).then(x=>{const c=x.clone();caches.open(DYN).then(d=>d.put(r,c));return x}).catch(()=>caches.match(r).then(m=>m||caches.match('offline.html'))));return}
 e.respondWith(caches.match(r).then(m=>{const f=fetch(r).then(x=>{if(x.ok){const c=x.clone();caches.open(DYN).then(d=>d.put(r,c))}return x}).catch(()=>m);return m||f}))});
self.addEventListener('sync',e=>{if(e.tag==='costsync-sync')e.waitUntil(Promise.resolve())});
self.addEventListener('push',e=>{const t=e.data?e.data.text():'CostSync update';e.waitUntil(self.registration.showNotification('CostSync Estimator',{body:t,icon:'icons/icon-192.png'}))});
