const CACHE='minha-saude-ia-v4-76';
const ASSETS=['./','./index.html','./js/menu.js','./js/app.js','./js/recursos.js','./js/importacao.js','./js/melhorias.js','./manifest.json','./icon.svg'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',event=>{
 const req=event.request;
 if(req.method!=='GET'||new URL(req.url).origin!==self.location.origin)return;
 event.respondWith(fetch(req).then(res=>{if(res.ok){const copy=res.clone();caches.open(CACHE).then(c=>c.put(req,copy)).catch(()=>{})}return res}).catch(()=>caches.match(req,{ignoreSearch:true}).then(c=>c||caches.match('./index.html'))));
});
