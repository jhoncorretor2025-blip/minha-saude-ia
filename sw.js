const CACHE='minha-saude-ia-v7-84';
const ASSETS=['./version.json','./js/features/areas-principais-v738.js','./','./index.html','./css/design-system.css','./js/core/constants.js','./js/core/storage.js','./js/core/utils.js','./js/navigation/menu.js','./js/core/app.js','./js/features/data-quality-v776.js','./js/features/navegacao-v779.js','./js/features/notificacoes-remotas.js','./js/features/perfil-compartilhado.js','./js/features/perfil-save.js','./js/features/familiares.js','./js/features/primeiros-passos-v714.js','./js/features/compartilhar-perfil-basico-v715.js','./js/features/compartilhar-facil-v717.js','./js/features/cuidado-a-dois-v716.js','./js/features/painel-intermediario.js','./js/features/saude-avancada-v688.js','./js/features/doencas-linha-tempo-v690.js','./js/features/linha-tempo-melhorias-v692.js','./js/features/perguntas-proxima-consulta-v693.js','./js/features/recursos.js','./js/features/configuracoes-profissionais.js','./js/features/perguntas-saude.js','./js/features/navegacao-facil.js','./js/features/saude-facil.js','./js/features/saude-plus.js','./js/features/visual-saude.js','./js/features/familia-abas.js','./js/ai/importar-facil.js','./js/features/comeco-rapido.js','./js/features/inteligencia.js','./js/ai/importacao.js','./js/legacy/melhorias.js','./js/legacy/melhorias-primeiras.js','./js/features/expansoes.js','./js/legacy/melhorias-v513.js','./js/ai/importacao-fluxo-v514.js','./js/ai/prompt-importacao-contexto-v698.js','./js/features/avancado.js','./js/core/stability-v599.js','./js/reports/relatorios-v599.js','./js/reports/evolucao-v599.js','./manifest.json','./icon.svg','./icons/icon-192.png','./icons/icon-512.png','./icons/icon-maskable-512.png','./icons/apple-touch-icon.png','./manifest.json','./icon.svg'];
/* V7.84 — abre mais rápido: os arquivos .js/.css de cada versão (?v=...) ficam guardados e saem do cache na hora, sem ir à internet.
   Na instalação o service worker lê o index.html e guarda todos os arquivos versionados (inclusive os carregados sob demanda). */
self.addEventListener('install',e=>e.waitUntil((async()=>{
 const c=await caches.open(CACHE),urls=new Set(ASSETS);
 try{const r=await fetch('./index.html',{cache:'no-store'}),t=await r.text(),re=/(?:src|href|data-src)="([^"#]+\?v=[^"]+)"/g;let m;while((m=re.exec(t)))urls.add(m[1])}catch(err){}
 await Promise.allSettled([...urls].map(u=>c.add(new Request(u,{cache:'reload'}))));
 await self.skipWaiting();
})()));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
 const req=e.request;if(req.method!=='GET')return;
 const url=new URL(req.url);if(url.origin!==self.location.origin)return;
 /* arquivos versionados nunca mudam: cache primeiro */
 if(url.searchParams.has('v')&&/\.(?:js|css)$/i.test(url.pathname)){
  e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(r=>{if(r&&r.ok){const copy=r.clone();caches.open(CACHE).then(c=>c.put(req,copy)).catch(()=>{})}return r})));
  return;
 }
 /* páginas, dados e imagens: rede primeiro (sempre atual) e cópia guardada se estiver sem internet */
 e.respondWith(fetch(req).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(req,copy)).catch(()=>{});return r}).catch(()=>caches.match(req,{ignoreSearch:true})));
});

/* V6.63 — botões do aviso do remédio: “✅ Tomei” e “⏰ Lembrar em 15 min” */
self.addEventListener('notificationclick',e=>{
 const n=e.notification,id=n.data&&n.data.id,acao=e.action||'abrir';n.close();
 e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(lista=>{
  const app=lista.find(c=>c.url.indexOf(self.registration.scope)===0);
  if(app){if(id!=null&&acao!=='abrir')app.postMessage({tipo:'msa-remedio',acao:acao,id:id});return app.focus()}
  const url=self.registration.scope+(id!=null&&acao==='tomei'?'?dose='+encodeURIComponent(id):id!=null&&acao==='adiar'?'?adiar='+encodeURIComponent(id):'');
  return self.clients.openWindow(url);
 }));
});
