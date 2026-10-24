const CACHE='minha-saude-ia-v7-25';
const ASSETS=['./version.json','./','./index.html','./css/design-system.css','./js/core/constants.js','./js/core/storage.js','./js/core/utils.js','./js/navigation/menu.js','./js/core/app.js','./js/features/notificacoes-remotas.js','./js/features/perfil-compartilhado.js','./js/features/perfil-save.js','./js/features/familiares.js','./js/features/compartilhar-perfil-basico-v715.js','./js/features/compartilhar-facil-v717.js','./js/features/cuidado-a-dois-v716.js','./js/features/painel-intermediario.js','./js/features/saude-avancada-v688.js','./js/features/doencas-linha-tempo-v690.js','./js/features/linha-tempo-melhorias-v692.js','./js/features/perguntas-proxima-consulta-v693.js','./js/features/recursos.js','./js/features/configuracoes-profissionais.js','./js/features/perguntas-saude.js','./js/features/navegacao-facil.js','./js/features/saude-facil.js','./js/features/saude-plus.js','./js/features/visual-saude.js','./js/ai/importar-facil.js','./js/features/comeco-rapido.js','./js/features/inteligencia.js','./js/ai/importacao.js','./js/legacy/melhorias.js','./js/legacy/melhorias-primeiras.js','./js/features/expansoes.js','./js/legacy/melhorias-v513.js','./js/ai/importacao-fluxo-v514.js','./js/ai/prompt-importacao-contexto-v698.js','./js/features/avancado.js','./js/core/stability-v599.js','./js/reports/relatorios-v599.js','./js/reports/evolucao-v599.js','./manifest.json','./icon.svg'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy)).catch(()=>{});return r}).catch(()=>caches.match(e.request,{ignoreSearch:true})))});

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
