const CACHE='minha-saude-ia-v5-64';
const ASSETS=['./version.json','./','./index.html','./css/design-system.css','./js/core/constants.js','./js/core/storage.js','./js/core/utils.js','./js/menu.js','./js/app.js','./js/perfil-save.js','./js/recursos.js','./js/importacao.js','./js/melhorias.js','./js/melhorias-primeiras.js','./js/expansoes.js','./js/melhorias-v513.js','./js/importacao-fluxo-v514.js','./js/avancado.js','./manifest.json','./icon.svg'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy)).catch(()=>{});return r}).catch(()=>caches.match(e.request)))});
