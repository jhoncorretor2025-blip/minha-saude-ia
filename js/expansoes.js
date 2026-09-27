/* Minha Saúde IA — expansões V4.94+
 * Recursos adicionais, carregados depois dos módulos principais.
 * Regra: recursos locais não enviam dados de saúde automaticamente.
 */
(function(){
'use strict';
const K=window.MSA_K||window.K||{};
const storage=window.MSAStorage;
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const byId=id=>document.getElementById(id);
function loadScriptOnce(src,globalName){
 return new Promise((resolve,reject)=>{
  if(window[globalName]){resolve(window[globalName]);return}
  const old=document.querySelector('script[data-msa-lib="'+src+'"]');
  if(old){old.addEventListener('load',()=>resolve(window[globalName]));old.addEventListener('error',reject);return}
  const s=document.createElement('script');s.src=src;s.async=true;s.dataset.msaLib=src;
  s.onload=()=>window[globalName]?resolve(window[globalName]):reject(new Error('Biblioteca carregada, mas não expôs '+globalName));
  s.onerror=()=>reject(new Error('Não foi possível carregar a biblioteca OCR.'));
  document.head.appendChild(s);
 });
}
function ensureOverlay(){
 if(byId('msaOCROverlay'))return;
 const div=document.createElement('div');div.id='msaOCROverlay';div.className='msa-modal-overlay';div.style.display='none';
 div.innerHTML='<div class="msa-modal" role="dialog" aria-modal="true" aria-labelledby="msaOCRTitle"><div class="msa-modal-header"><div><h2 id="msaOCRTitle" class="msa-card-title">🔎 OCR do documento</h2><div id="msaOCRStatus" class="msa-card-description">Texto extraído no próprio navegador.</div></div><button class="btn secondary small" type="button" id="msaOCRClose">✕</button></div><div class="msa-modal-body"><div id="msaOCRProgress" class="msa-feedback msa-feedback-info" style="margin-bottom:12px">Preparando…</div><textarea id="msaOCRText" class="msa-form-control" style="min-height:260px" placeholder="O texto reconhecido aparecerá aqui."></textarea></div><div class="msa-modal-footer"><button class="btn secondary" type="button" id="msaOCRCopy">📋 Copiar texto</button><button class="btn green" type="button" id="msaOCRSave">💾 Salvar texto no documento</button><button class="btn secondary" type="button" id="msaOCRDone">Fechar</button></div></div>';
 document.body.appendChild(div);
 div.querySelectorAll('#msaOCRClose,#msaOCRDone').forEach(b=>b.addEventListener('click',()=>{div.style.display='none';document.body.style.overflow=''}));
 div.querySelector('#msaOCRCopy').addEventListener('click',()=>{
   const txt=byId('msaOCRText')?.value||'';
   if(!txt)return alert('Ainda não há texto para copiar.');
   navigator.clipboard?.writeText(txt).then(()=>alert('📋 Texto copiado.')).catch(()=>prompt('Copie o texto:',txt));
 });
 div.querySelector('#msaOCRSave').addEventListener('click',()=>{
   const id=div.dataset.docId,txt=byId('msaOCRText')?.value||'';
   if(!id||!txt.trim())return alert('Não há texto reconhecido para salvar.');
   const a=storage.get(K.doc),doc=a.find(x=>String(x.id)===String(id));if(!doc)return;
   doc.ocrText=txt;doc.ocrAt=new Date().toISOString();storage.set(K.doc,a);
   alert('✅ Texto OCR salvo junto ao documento.');renderDocumentosSaude();
 });
}
async function ocrDocument(id){
 const arr=storage.get(K.doc),doc=arr.find(x=>String(x.id)===String(id));
 if(!doc||!doc.arquivo)return alert('Documento não encontrado.');
 if(!/^image\//i.test(String(doc.tipo||'')))return alert('O OCR nesta versão funciona para imagens. Para PDFs, abra o documento e use a função de seleção/cópia de texto do leitor de PDF.');
 ensureOverlay();
 const overlay=byId('msaOCROverlay');overlay.style.display='flex';document.body.style.overflow='hidden';overlay.dataset.docId=id;
 const status=byId('msaOCRStatus'),progress=byId('msaOCRProgress'),text=byId('msaOCRText');text.value='';
 try{
   status.textContent='Carregando o mecanismo OCR…';
   progress.textContent='⏳ Primeira utilização pode exigir internet para baixar o mecanismo de OCR. O reconhecimento acontece no navegador.';
   const T=await loadScriptOnce('https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js','Tesseract');
   const result=await T.recognize(doc.arquivo,'por',{logger:m=>{
     if(m&&typeof m.progress==='number')progress.textContent='⏳ OCR: '+Math.round(m.progress*100)+'%'+(m.status?' — '+m.status:'');
   }});
   text.value=String(result?.data?.text||'').trim();
   status.textContent=text.value?'Texto reconhecido. Revise antes de salvar.':'Não foi possível reconhecer texto nesta imagem.';
   progress.className=text.value?'msa-feedback msa-feedback-success':'msa-feedback msa-feedback-warning';
   progress.textContent=text.value?'✅ OCR concluído no navegador.':'⚠️ Nenhum texto reconhecível encontrado.';
 }catch(e){
   console.error('[Minha Saúde IA] OCR',e);
   progress.className='msa-feedback msa-feedback-error';
   progress.textContent='❌ Não foi possível executar o OCR. Confira sua conexão na primeira utilização e tente novamente.';
   status.textContent=String(e?.message||'Erro no OCR');
 }
}
window.msaOCRDocument=ocrDocument;
function renderDocumentosWithOCR(){
 if(typeof window.renderDocumentosSaude!=='function')return;
 const original=window.renderDocumentosSaude;
 if(original.__msaOCRWrapped)return;
 const wrapped=function(){
   original.apply(this,arguments);
   const box=byId('documentosSaudeList');if(!box)return;
   const arr=storage.get(K.doc);
   box.querySelectorAll('.item').forEach((item,index)=>{
     const doc=arr.slice().reverse()[index];if(!doc)return;
     if(/^image\//i.test(String(doc.tipo||''))){
       const row=item.querySelector('.row')||item.appendChild(Object.assign(document.createElement('div'),{className:'row'}));
       if(!row.querySelector('[data-msa-ocr]')){
         const b=document.createElement('button');b.type='button';b.className='btn small';b.textContent='🔎 OCR';b.setAttribute('data-msa-ocr',String(doc.id));b.addEventListener('click',()=>ocrDocument(doc.id));row.appendChild(b);
       }
     }
     if(doc.ocrText){
       const p=document.createElement('p');p.className='muted';p.textContent='✅ Texto OCR salvo em '+new Date(doc.ocrAt||Date.now()).toLocaleString('pt-BR');item.appendChild(p);
     }
   });
 };
 wrapped.__msaOCRWrapped=true;
 window.renderDocumentosSaude=wrapped;
 try{wrapped()}catch(e){}
}
function startOCR(){ensureOverlay();setTimeout(renderDocumentosWithOCR,250)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',startOCR);else startOCR();
document.addEventListener('DOMContentLoaded',()=>setTimeout(()=>{installHistoryLogging();ensureHistoryUI()},380));
document.addEventListener('DOMContentLoaded',()=>setTimeout(startDocumentTags,420));

/* ===== V4.95 — categorias e etiquetas de documentos ===== */
function ensureDocumentTagsUI(){
 const host=byId('documentosSaudeList');if(!host||byId('msaDocTagTools'))return;
 const toolsBox=document.createElement('div');toolsBox.id='msaDocTagTools';toolsBox.className='msa-filter-bar';toolsBox.innerHTML=
  '<div class="msa-filter-group msa-form-group"><label class="msa-form-label" for="msaDocTagFilter">🏷️ Filtrar por etiqueta</label><select id="msaDocTagFilter" class="msa-form-control"><option value="">Todas as etiquetas</option></select></div>'+
  '<div class="msa-filter-actions"><button type="button" class="btn secondary" id="msaDocTagClear">Limpar</button></div>';
 host.parentNode.insertBefore(toolsBox,host);
 byId('msaDocTagFilter').addEventListener('change',renderDocumentTags);
 byId('msaDocTagClear').addEventListener('click',()=>{byId('msaDocTagFilter').value='';renderDocumentTags()});
}
function normalizeTags(v){return [...new Set(String(v||'').split(/[,;]+/).map(x=>x.trim()).filter(Boolean).slice(0,8))]}
function saveDocumentTags(id,tags){
 const a=storage.get(K.doc),doc=a.find(x=>String(x.id)===String(id));if(!doc)return;
 doc.tags=normalizeTags(tags);storage.set(K.doc,a);
}
function renderDocumentTags(){
 const arr=storage.get(K.doc),filter=String(byId('msaDocTagFilter')?.value||'').trim().toLowerCase();
 const select=byId('msaDocTagFilter');
 const tags=[...new Set(arr.flatMap(x=>Array.isArray(x.tags)?x.tags:[]))].sort((a,b)=>a.localeCompare(b,'pt-BR'));
 if(select){
  const current=select.value;
  select.innerHTML='<option value="">Todas as etiquetas</option>'+tags.map(t=>'<option value="'+esc(t)+'">'+esc(t)+'</option>').join('');
  select.value=tags.some(t=>t===current)?current:'';
 }
 const box=byId('documentosSaudeList');if(!box)return;
 box.querySelectorAll('.item').forEach((item,index)=>{
  const doc=arr.slice().reverse()[index];if(!doc)return;
  const docTags=Array.isArray(doc.tags)?doc.tags:[];
  const visible=!filter||docTags.some(t=>String(t).toLowerCase()===filter);
  item.style.display=visible?'':'none';
  if(docTags.length&&!item.querySelector('[data-msa-doc-tags]')){
   const tagsBox=document.createElement('div');tagsBox.setAttribute('data-msa-doc-tags','1');tagsBox.style.cssText='display:flex;flex-wrap:wrap;gap:5px;margin:7px 0';
   docTags.forEach(t=>{const tag=document.createElement('span');tag.className='msa-badge';tag.textContent='🏷️ '+t;tagsBox.appendChild(tag)});
   item.insertBefore(tagsBox,item.querySelector('.row')||null);
  }
 });
}
function wrapDocumentUploadForTags(){
 if(typeof window.processarDocumentoSaude!=='function'||window.processarDocumentoSaude.__msaTagsWrapped)return;
 const original=window.processarDocumentoSaude;
 const wrapped=function(ev){
   const input=ev?.target,file=input?.files?.[0];
   const tags=normalizeTags(prompt('🏷️ Etiquetas opcionais\nSepare por vírgula. Ex.: exame, sangue, 2026',''));
   const before=storage.get(K.doc).map(x=>String(x.id)).join('|');
   original.apply(this,arguments);
   setTimeout(()=>{
     const arr=storage.get(K.doc),created=arr.find(x=>!before.split('|').includes(String(x.id)));
     if(created){created.tags=tags;storage.set(K.doc,arr);renderDocumentosSaude()}
   },80);
 };
 wrapped.__msaTagsWrapped=true;
 window.processarDocumentoSaude=wrapped;
}
function startDocumentTags(){ensureDocumentTagsUI();wrapDocumentUploadForTags();setTimeout(renderDocumentTags,320)}



/* ===== V4.96 — QR Code do cartão de emergência ===== */
function ensureQROverlay(){
 if(byId('msaQROverlay'))return;
 const div=document.createElement('div');div.id='msaQROverlay';div.className='msa-modal-overlay';div.style.display='none';
 div.innerHTML='<div class="msa-modal" role="dialog" aria-modal="true" aria-labelledby="msaQRTitle"><div class="msa-modal-header"><div><h2 id="msaQRTitle" class="msa-card-title">📱 QR Code de emergência</h2><div class="msa-card-description">O QR contém apenas as informações que você escolher para este cartão.</div></div><button class="btn secondary small" type="button" id="msaQRClose">✕</button></div><div class="msa-modal-body" style="text-align:center"><div id="msaQRStatus" class="msa-feedback msa-feedback-info">Preparando QR Code…</div><img id="msaQRImage" alt="QR Code do cartão de emergência" style="display:none;width:min(100%,320px);height:auto;margin:16px auto;border:12px solid #fff;border-radius:12px;box-shadow:var(--msa-shadow-card)"><pre id="msaQRText" style="white-space:pre-wrap;text-align:left;background:#f8fafc;border:1px solid #dbe3ef;border-radius:12px;padding:12px;font-size:12px"></pre></div><div class="msa-modal-footer"><button class="btn secondary" type="button" id="msaQRCopy">📋 Copiar informações</button><button class="btn green" type="button" id="msaQRDownload">⬇️ Salvar QR</button><button class="btn secondary" type="button" id="msaQRDone">Fechar</button></div></div>';
 document.body.appendChild(div);
 div.querySelectorAll('#msaQRClose,#msaQRDone').forEach(b=>b.addEventListener('click',()=>{div.style.display='none';document.body.style.overflow=''}));
 div.querySelector('#msaQRCopy').addEventListener('click',()=>{
  const txt=byId('msaQRText')?.textContent||'';if(!txt)return;
  navigator.clipboard?.writeText(txt).then(()=>alert('📋 Informações copiadas.')).catch(()=>prompt('Copie as informações:',txt));
 });
 div.querySelector('#msaQRDownload').addEventListener('click',()=>{
  const img=byId('msaQRImage');if(!img.src)return;
  const a=document.createElement('a');a.href=img.src;a.download='cartao-emergencia-qr.png';a.click();
 });
}
function emergencyText(){
 const p=storage.get(K.p)[0]||{},meds=storage.get(K.m);
 return ['MINHA SAÚDE IA — CARTÃO DE EMERGÊNCIA','Nome: '+(p.nome||'Não informado'),'Tipo sanguíneo: '+(p.sangue||'Não informado'),'Alergias: '+(p.alerg||'Não informado'),'Condições: '+(p.cond||'Não informado'),'Medicamentos: '+(meds.length?meds.map(x=>x.nome+(x.dose?' — '+x.dose:'')).join('; '):'Nenhum registrado'),'Contato de emergência: '+(p.emerg||'Não informado')+(p.tel?' — '+p.tel:'')].join('\n');
}
async function gerarQR(){
 ensureQROverlay();
 const modal=byId('msaQROverlay');modal.style.display='flex';document.body.style.overflow='hidden';
 const status=byId('msaQRStatus'),img=byId('msaQRImage'),pre=byId('msaQRText'),txt=emergencyText();
 pre.textContent=txt;img.style.display='none';
 try{
  const Q=await loadScriptOnce('https://cdn.jsdelivr.net/npm/qrcode@1.5.4/build/qrcode.min.js','QRCode');
  const src=await Q.toDataURL(txt,{width:320,margin:2,errorCorrectionLevel:'M'});
  img.src=src;img.style.display='block';status.className='msa-feedback msa-feedback-success';status.textContent='✅ QR Code gerado neste navegador.';
 }catch(e){
  status.className='msa-feedback msa-feedback-error';
  status.textContent='❌ Não foi possível gerar o QR agora. Na primeira utilização, o navegador precisa carregar o gerador de QR.';
 }
}
window.msaGerarQREmergencia=gerarQR;
function addQRButton(){
 const actions=document.querySelector('.emergency-actions');
 if(actions&&!actions.querySelector('[data-msa-qr]')){
  const b=document.createElement('button');b.className='btn secondary';b.type='button';b.setAttribute('data-msa-qr','1');b.textContent='📱 QR Code';b.addEventListener('click',gerarQR);actions.insertBefore(b,actions.lastElementChild);
 }
}
document.addEventListener('DOMContentLoaded',()=>setTimeout(()=>{ensureQROverlay();addQRButton()},350));



/* ===== V4.97 — histórico de alterações ===== */
const HISTORY_KEY='msa2_historico_alteracoes';
const historyLabel={};
Object.keys(K).forEach(k=>{
 const map={d:'Sintomas',c:'Consultas',m:'Medicamentos',e:'Exames',p:'Perfil',v:'Sinais vitais',r:'Lembretes',vax:'Vacinas',fam:'Histórico familiar',doc:'Documentos',nutri:'Nutrição',suplReg:'Suplementos',food:'Reações alimentares',agua:'Hidratação',sono:'Sono',bem:'Bem-estar',gat:'Gatilhos',medRot:'Rotinas de medicamentos',medTaken:'Doses de medicamentos',ciclo:'Ciclo menstrual',anticoncepcional:'Anticoncepcional'};
 if(map[k])historyLabel[K[k]]=map[k];
});
function readHistory(){try{return rawStorage.getItem(HISTORY_KEY)?JSON.parse(rawStorage.getItem(HISTORY_KEY)):[]}catch(e){return[]}}
function addHistory(entry){
 const a=readHistory();a.push(entry);if(a.length>300)a.splice(0,a.length-300);
 try{rawStorage.setItem(HISTORY_KEY,JSON.stringify(a))}catch(e){}
}
function installHistoryLogging(){
 if(window.MSAStorage.__msaHistoryWrapped)return;
 const original=window.MSAStorage.set,wrapped=function(key,value){
   const result=original.call(this,key,value);
   if(key!==HISTORY_KEY&&/^msa2_/.test(String(key))){
     let count='—';try{count=Array.isArray(value)?value.length:(value&&typeof value==='object'?1:'—')}catch(e){}
     addHistory({timestamp:new Date().toISOString(),key:String(key),label:historyLabel[key]||'Dados locais',count,action:'salvar'});
   }
   return result;
 };
 wrapped.__msaHistoryWrapped=true;window.MSAStorage.set=wrapped;
}
function ensureHistoryUI(){
 const toolsGroup=[...document.querySelectorAll('#nav .nav-group')].find(g=>g.querySelector('.nav-toggle[data-menu="tools"]')),menu=toolsGroup?.querySelector('.nav-menu');
 if(menu&&!menu.querySelector('[data-tab="historico"]')){
  const b=document.createElement('button');b.type='button';b.setAttribute('data-tab','historico');b.textContent='🕘 Histórico de alterações';menu.appendChild(b);
 }
 if(byId('historico'))return;
 const host=byId('main-content')||document.querySelector('.wrap')||document.body,sec=document.createElement('section');sec.id='historico';
 sec.innerHTML='<div class="card"><div class="dash-section-title"><div><h2>🕘 Histórico de alterações</h2><div class="muted">Mostra quando os registros locais foram salvos. O histórico não guarda uma cópia do conteúdo sensível.</div></div><button class="btn secondary" type="button" id="msaHistoryClear">Limpar histórico</button></div><div id="msaHistoryList" class="list"></div></div>';
 host.appendChild(sec);sec.querySelector('#msaHistoryClear').addEventListener('click',()=>{
  if(!confirm('Limpar somente o histórico de alterações? Os dados de saúde não serão apagados.'))return;
  rawStorage.removeItem(HISTORY_KEY);renderHistory();
 });renderHistory();
}
function renderHistory(){
 const box=byId('msaHistoryList');if(!box)return;const a=readHistory().slice().reverse();
 box.innerHTML=a.length?a.map(x=>{const d=new Date(x.timestamp);return '<div class="item"><div class="itemtop"><b>💾 '+esc(x.label)+'</b><span class="tag">'+esc(isNaN(d)?x.timestamp:d.toLocaleString('pt-BR'))+'</span></div><p>Ação: '+esc(x.action)+' · registros armazenados: '+esc(x.count)+'</p></div>'}).join(''):'<div class="empty">Ainda não há alterações registradas.</div>';
}



/* ===== V4.98 — metas pessoais ===== */
const GOALS_KEY='msa2_metas_pessoais';
function readGoals(){try{return JSON.parse(rawStorage.getItem(GOALS_KEY)||'[]')}catch(e){return[]}}
function goalCurrent(goal){
 const p=storage.get(K.p)[0]||{},today=new Date().toISOString().slice(0,10),type=goal.type;
 if(type==='completude'&&typeof window.calcularCompletudeSaude==='function')return Number(window.calcularCompletudeSaude().percentual)||0;
 if(type==='agua')return storage.get(K.agua).filter(x=>x.data===today).reduce((n,x)=>n+(Number(x.qtd)||0),0);
 if(type==='registros')return [K.d,K.c,K.m,K.e,K.v,K.vax,K.r,K.nutri,K.sono,K.bem].reduce((n,k)=>n+storage.get(k).filter(x=>String(x.data||x.inicio||'').slice(0,10)===today).length,0);
 if(type==='peso')return Number(String(p.peso||'').replace(',','.'))||0;
 return 0;
}
function goalUnit(type){return ({completude:'%',agua:' ml',registros:' registro(s)',peso:' kg'})[type]||''}
function renderGoals(){
 const box=byId('msaGoalsList');if(!box)return;const goals=readGoals();
 box.innerHTML=goals.length?goals.map(g=>{
   const current=goalCurrent(g),target=Number(g.target)||0,pct=target>0?Math.min(100,Math.round(current/target*100)):0;
   return '<div class="item"><div class="itemtop"><b>🎯 '+esc(g.title)+'</b><span class="tag">'+pct+'%</span></div><p>'+esc(String(current))+' '+goalUnit(g.type)+' de '+esc(String(target))+goalUnit(g.type)+'</p><div style="height:10px;background:#e8edf5;border-radius:99px;overflow:hidden"><div style="height:100%;width:'+pct+'%;background:linear-gradient(90deg,#2563eb,#059669)"></div></div><div class="row" style="margin-top:9px"><button class="btn secondary small" type="button" data-goal-delete="'+esc(g.id)+'">🗑️ Remover</button></div></div>';
 }).join(''):'<div class="empty">Nenhuma meta pessoal criada.</div>';
}
function ensureGoalsUI(){
 if(byId('msaGoalsPanel'))return;
 const host=byId('home')||byId('main-content');if(!host)return;
 const panel=document.createElement('div');panel.id='msaGoalsPanel';panel.className='card';panel.style.marginTop='13px';
 panel.innerHTML='<div class="dash-section-title"><div><h2>🎯 Minhas metas</h2><div class="muted">Acompanhamento pessoal baseado somente nos seus registros.</div></div></div><form id="msaGoalForm" class="grid2"><label>Nome da meta<input id="msaGoalTitle" required placeholder="Ex.: Completar meu perfil"></label><label>Indicador<select id="msaGoalType"><option value="completude">Completude do perfil (%)</option><option value="agua">Água de hoje (ml)</option><option value="registros">Registros de hoje</option><option value="peso">Peso atual (kg)</option></select></label><label>Meta numérica<input id="msaGoalTarget" type="number" min="0" step="0.1" required placeholder="Ex.: 90"></label><div style="align-self:end"><button class="btn green" type="submit">➕ Criar meta</button></div></form><div id="msaGoalsList" class="list" style="margin-top:13px"></div>';
 host.appendChild(panel);
 panel.querySelector('#msaGoalForm').addEventListener('submit',e=>{e.preventDefault();const a=readGoals();a.push({id:String(Date.now()),title:byId('msaGoalTitle').value.trim(),type:byId('msaGoalType').value,target:byId('msaGoalTarget').value});rawStorage.setItem(GOALS_KEY,JSON.stringify(a.slice(-30)));e.target.reset();renderGoals()});
 panel.addEventListener('click',e=>{const b=e.target.closest('[data-goal-delete]');if(!b)return;const id=b.getAttribute('data-goal-delete');rawStorage.setItem(GOALS_KEY,JSON.stringify(readGoals().filter(g=>g.id!==id)));renderGoals()});
 renderGoals();
}
document.addEventListener('DOMContentLoaded',()=>setTimeout(ensureGoalsUI,500));



/* ===== V4.99 — painel inicial personalizável ===== */
const DASH_PREF_KEY='msa2_dashboard_preferencias';
const DASH_WIDGETS=[
 {id:'homeProfileHero',label:'👤 Meu perfil'},
 {selector:'#home > .metric-panel',label:'📊 Indicadores rápidos'},
 {selector:'#home > .grid4',label:'🔢 Contadores'},
 {selector:'#home .smart-care-card:nth-of-type(1)',label:'🎯 Próximos cuidados'},
 {selector:'#home .smart-care-card:nth-of-type(2)',label:'🧠 Resumo inteligente'},
 {selector:'#home .smart-care-card:nth-of-type(3)',label:'🩺 Preparar consulta'},
 {selector:'#home .smart-care-card:nth-of-type(4)',label:'🕐 Linha do tempo'},
 {selector:'#home .engagement-card:nth-of-type(1)',label:'👋 Como você está hoje'},
 {selector:'#home .engagement-card:nth-of-type(2)',label:'🏆 Seu progresso'},
 {selector:'#home .quick-register',label:'➕ Registrar agora'},
 {selector:'#home .engagement-card:nth-of-type(3)',label:'🎯 Objetivos'},
 {selector:'#home .health-dashboard',label:'📈 Painel de saúde'},
 {selector:'#home > .actions',label:'⚡ Ações rápidas'},
 {id:'homeSummary',label:'📋 Visão geral'}
];
function readDashPrefs(){try{return JSON.parse(rawStorage.getItem(DASH_PREF_KEY)||'{}')}catch(e){return{}}}
function applyDashPrefs(){
 const prefs=readDashPrefs();
 DASH_WIDGETS.forEach(w=>{const el=w.id?byId(w.id):document.querySelector(w.selector);if(el)el.style.display=prefs[w.id||w.selector]===false?'none':''});
}
function ensureDashboardUI(){
 const smart=document.querySelectorAll('#home .smart-care-card');
 smart.forEach((el,i)=>el.setAttribute('data-msa-dash-index',String(i)));
 const engagement=document.querySelectorAll('#home .engagement-card');
 engagement.forEach((el,i)=>el.setAttribute('data-msa-engagement-index',String(i)));
 if(smart.length>=4){DASH_WIDGETS[3].selector='#home .smart-care-card[data-msa-dash-index="0"]';DASH_WIDGETS[4].selector='#home .smart-care-card[data-msa-dash-index="1"]';DASH_WIDGETS[5].selector='#home .smart-care-card[data-msa-dash-index="2"]';DASH_WIDGETS[6].selector='#home .smart-care-card[data-msa-dash-index="3"]'}
 if(engagement.length>=3){DASH_WIDGETS[7].selector='#home .engagement-card[data-msa-engagement-index="0"]';DASH_WIDGETS[8].selector='#home .engagement-card[data-msa-engagement-index="1"]';DASH_WIDGETS[10].selector='#home .engagement-card[data-msa-engagement-index="2"]'}
 const toolsGroup=[...document.querySelectorAll('#nav .nav-group')].find(g=>g.querySelector('.nav-toggle[data-menu="tools"]')),menu=toolsGroup?.querySelector('.nav-menu');
 if(menu&&!menu.querySelector('[data-tab="personalizar-inicio"]')){
  const b=document.createElement('button');b.type='button';b.setAttribute('data-tab','personalizar-inicio');b.textContent='⚙️ Personalizar início';menu.appendChild(b);
 }
 if(byId('personalizar-inicio'))return;
 const host=byId('main-content')||document.querySelector('.wrap')||document.body,sec=document.createElement('section');sec.id='personalizar-inicio';
 sec.innerHTML='<div class="card"><div class="dash-section-title"><div><h2>⚙️ Personalizar início</h2><div class="muted">Escolha os blocos que você quer ver na página inicial. Isso não altera seus dados.</div></div><button class="btn secondary" type="button" id="msaDashReset">Restaurar padrão</button></div><div id="msaDashOptions" class="grid2"></div></div>';
 host.appendChild(sec);
 const opts=byId('msaDashOptions'),prefs=readDashPrefs();
 DASH_WIDGETS.forEach((w,i)=>{
  const key=w.id||w.selector,label=document.createElement('label');label.className='item';label.style.cursor='pointer';label.innerHTML='<input type="checkbox" data-dash-pref="'+esc(key)+'" '+(prefs[key]===false?'':'checked')+'> <b>'+esc(w.label)+'</b>';
  opts.appendChild(label);
 });
 opts.addEventListener('change',e=>{
  const input=e.target.closest('[data-dash-pref]');if(!input)return;
  const p=readDashPrefs();p[input.getAttribute('data-dash-pref')]=input.checked;rawStorage.setItem(DASH_PREF_KEY,JSON.stringify(p));applyDashPrefs();
 });
 sec.querySelector('#msaDashReset').addEventListener('click',()=>{rawStorage.removeItem(DASH_PREF_KEY);opts.querySelectorAll('input').forEach(x=>x.checked=true);applyDashPrefs()});
}
document.addEventListener('DOMContentLoaded',()=>setTimeout(()=>{ensureDashboardUI();applyDashPrefs()},550));



/* ===== V5.00 — padrões dos registros ===== */
function patternRows(){
 const d=storage.get(K.d),local={},tipo={},gatilho={},weekday={},hour={};
 d.forEach(x=>{
  const add=(obj,k)=>{k=String(k||'').trim();if(k)obj[k]=(obj[k]||0)+1};
  add(local,x.local);add(tipo,x.tipo);add(gatilho,x.gatilho);
  const dt=new Date(String(x.data||'').replace(' ','T'));if(!isNaN(dt)){add(weekday,dt.toLocaleDateString('pt-BR',{weekday:'long'}));add(hour,String(dt.getHours()).padStart(2,'0')+'h')}
 });
 const top=obj=>Object.entries(obj).sort((a,b)=>b[1]-a[1]).slice(0,5);
 return {d,local:top(local),tipo:top(tipo),gatilho:top(gatilho),weekday:top(weekday),hour:top(hour)};
}
function ensurePatternsUI(){
 if(byId('padroes'))return;
 const toolsGroup=[...document.querySelectorAll('#nav .nav-group')].find(g=>g.querySelector('.nav-toggle[data-menu="tools"]')),menu=toolsGroup?.querySelector('.nav-menu');
 if(menu&&!menu.querySelector('[data-tab="padroes"]')){const b=document.createElement('button');b.type='button';b.setAttribute('data-tab','padroes');b.textContent='📈 Padrões dos registros';menu.appendChild(b)}
 const host=byId('main-content')||document.querySelector('.wrap')||document.body,sec=document.createElement('section');sec.id='padroes';
 sec.innerHTML='<div class="card"><div class="dash-section-title"><div><h2>📈 Padrões dos registros</h2><div class="muted">Mostra repetições encontradas nos sintomas que você registrou. Não é diagnóstico e não determina a causa de um sintoma.</div></div><button class="btn green" type="button" id="msaPatternsRefresh">🔄 Atualizar</button></div><div id="msaPatternsResult"></div></div>';
 host.appendChild(sec);sec.querySelector('#msaPatternsRefresh').addEventListener('click',renderPatterns);renderPatterns();
}
function patternCard(title,arr){
 return '<div class="card compact" style="padding:14px"><h3>'+esc(title)+'</h3>'+ (arr.length?'<div class="list">'+arr.map(x=>'<div class="item"><b>'+esc(x[0])+'</b><span class="tag">'+x[1]+' ocorrência(s)</span></div>').join('')+'</div>':'<div class="empty">Sem dados suficientes.</div>')+'</div>';
}
function renderPatterns(){
 const box=byId('msaPatternsResult');if(!box)return;const p=patternRows();
 if(!p.d.length){box.innerHTML='<div class="empty">Registre sintomas para começar a identificar repetições nos seus próprios dados.</div>';return}
 box.innerHTML='<div class="grid2" style="margin-top:14px">'+
 patternCard('📍 Locais mais registrados',p.local)+patternCard('🔧 Tipos de sintoma',p.tipo)+
 patternCard('🎯 Gatilhos informados',p.gatilho)+patternCard('📅 Dias com mais registros',p.weekday)+
 patternCard('🕐 Horários com mais registros',p.hour)+'</div>'+
 '<div class="alert safe" style="margin-top:14px">💡 Este painel descreve somente a frequência dos seus próprios registros. Repetição não significa que exista uma causa específica.</div>';
}
document.addEventListener('DOMContentLoaded',()=>setTimeout(ensurePatternsUI,600));



/* ===== V5.01 — painel avançado de medicamentos ===== */
function renderMedicationAdherence(){
 const box=byId('msaMedicationAdherence');if(!box)return;
 const meds=storage.get(K.medRot),taken=storage.get(K.medTaken),now=new Date(),from=new Date(now.getFullYear(),now.getMonth(),now.getDate()-29);
 if(!meds.length){box.innerHTML='<div class="empty">Crie uma rotina de medicamento para acompanhar os registros aqui.</div>';return}
 const totalAll=taken.filter(x=>new Date(x.data)>=from).length;
 box.innerHTML='<div class="grid2" style="margin-bottom:13px"><div class="card stat"><span>💊 Rotinas</span><b>'+meds.length+'</b></div><div class="card stat"><span>✅ Registros nos últimos 30 dias</span><b>'+totalAll+'</b></div></div>'+
  '<div class="list">'+meds.map(m=>{
    const logs=taken.filter(x=>String(x.medId)===String(m.id)&&new Date(x.data)>=from).sort((a,b)=>String(b.data).localeCompare(String(a.data)));
    const unique=[...new Set(logs.map(x=>String(x.data).slice(0,10)))],pct=Math.round(unique.length/30*100);
    return '<div class="item"><div class="itemtop"><b>💊 '+esc(m.nome)+'</b><span class="tag">'+unique.length+'/30 dias com registro</span></div><p>'+esc(m.dose||'Dose não informada')+' · horário '+esc(m.hora||'não informado')+' · estoque '+esc(m.estoque??0)+'</p><div style="height:9px;background:#e8edf5;border-radius:99px;overflow:hidden"><div style="height:100%;width:'+pct+'%;background:linear-gradient(90deg,#2563eb,#059669)"></div></div><small class="muted" style="display:block;margin-top:7px">'+(unique.length?('Último registro: '+new Date(logs[0].data).toLocaleString('pt-BR')):'Nenhum registro nos últimos 30 dias')+'</small></div>';
  }).join('')+'</div><div class="alert warn" style="margin-top:12px">ℹ️ Este painel conta somente as doses que foram registradas no aplicativo. Como a frequência prescrita não é armazenada nesta rotina, o percentual mostrado não deve ser interpretado como adesão ao tratamento.</div>';
}
function ensureMedicationAdherenceUI(){
 if(byId('med-adherence')){renderMedicationAdherence();return}
 const toolsGroup=[...document.querySelectorAll('#nav .nav-group')].find(g=>g.querySelector('.nav-toggle[data-menu="tools"]')),menu=toolsGroup?.querySelector('.nav-menu');
 if(menu&&!menu.querySelector('[data-tab="med-adherence"]')){const b=document.createElement('button');b.type='button';b.setAttribute('data-tab','med-adherence');b.textContent='💊 Acompanhamento de medicamentos';menu.appendChild(b)}
 const host=byId('main-content')||document.querySelector('.wrap')||document.body,sec=document.createElement('section');sec.id='med-adherence';
 sec.innerHTML='<div class="card"><div class="dash-section-title"><div><h2>💊 Acompanhamento de medicamentos</h2><div class="muted">Veja quantos dias houve registro de dose nos últimos 30 dias.</div></div><button class="btn green" type="button" id="msaMedRefresh">🔄 Atualizar</button></div><div id="msaMedicationAdherence"></div></div>';
 host.appendChild(sec);sec.querySelector('#msaMedRefresh').addEventListener('click',renderMedicationAdherence);renderMedicationAdherence();
}
document.addEventListener('DOMContentLoaded',()=>setTimeout(ensureMedicationAdherenceUI,650));



/* ===== V5.02 — resolução de conflitos na importação IA ===== */
const IMPORT_CONFLICTS=[
 {prop:'dores',key:K.d,label:'Sintomas',match:['data','local'],exact:['data','local','int','tipo']},
 {prop:'consultas',key:K.c,label:'Consultas',match:['data','esp','med'],exact:['data','esp','med','mot']},
 {prop:'meds',key:K.m,label:'Medicamentos',match:['nome','inicio'],exact:['nome','dose','inicio','fim']},
 {prop:'exames',key:K.e,label:'Exames',match:['data','nome'],exact:['data','nome','res']},
 {prop:'vitais',key:K.v,label:'Sinais vitais',match:['data'],exact:['data','peso','pressao','fc','temp','glic','sat']},
 {prop:'vacinas',key:K.vax,label:'Vacinas',match:['data','nome'],exact:['data','nome','obs']},
 {prop:'familia',key:K.fam,label:'Histórico familiar',match:['parente','info'],exact:['parente','info','idade']},
 {prop:'lembretes',key:K.r,label:'Lembretes',match:['data','nome'],exact:['data','nome','tipo']},
 {prop:'documentos',key:K.doc,label:'Documentos',match:['nome','data'],exact:['nome','data','tipo']}
];
const normConflict=v=>String(v??'').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
function conflictSignature(x,fields){return fields.map(f=>normConflict(x?.[f])).join('|')}
function buildImportConflictPlan(n){
 const records=[];
 IMPORT_CONFLICTS.forEach(cfg=>{
  const incoming=Array.isArray(n?.[cfg.prop])?n[cfg.prop]:[],current=storage.get(cfg.key);
  incoming.forEach((item,index)=>{
   if(!item||typeof item!=='object')return;
   const exact=current.some(x=>conflictSignature(x,cfg.exact)===conflictSignature(item,cfg.exact));
   const similar=!exact&&current.some(x=>conflictSignature(x,cfg.match)===conflictSignature(item,cfg.match)&&conflictSignature(item,cfg.match)!==(''.repeat(cfg.match.length)));
   if(exact||similar)records.push({id:cfg.prop+'_'+index,prop:cfg.prop,index,label:cfg.label,kind:exact?'igual':'parecido',choice:'skip',incoming:item});
  });
 const pCurrent=storage.get(K.p)[0]||{},profile=[];
 Object.keys(n?.p||{}).forEach(field=>{
  const nv=String(n.p[field]??'').trim(),ov=String(pCurrent[field]??'').trim();
  if(nv&&nv.toLowerCase()!=='não informado'&&ov&&normConflict(nv)!==normConflict(ov))profile.push({id:'perfil_'+field,field,label:field,valueCurrent:ov,valueIncoming:nv,choice:'keep'});
 });
 return {records,profile};
}
function importConflictSummary(plan){
 if(!plan.records.length&&!plan.profile.length)return '<div class="msa-feedback msa-feedback-success">✅ Nenhum conflito detectado. Os dados novos podem ser adicionados normalmente.</div>';
 const rec=plan.records.map(x=>'<div class="item"><div class="itemtop"><b>🔎 '+esc(x.label)+' — '+esc(x.kind)+'</b><span class="tag">Entrada '+(x.index+1)+'</span></div><p>Escolha o que fazer com esta entrada.</p><label><input type="radio" name="ic_'+esc(x.id)+'" value="skip" checked> Manter o que já existe</label> <label><input type="radio" name="ic_'+esc(x.id)+'" value="add"> Adicionar a entrada da IA</label></div>').join('');
 const prof=plan.profile.map(x=>'<div class="item"><b>👤 '+esc(x.label)+'</b><p>Atual: <b>'+esc(x.valueCurrent)+'</b><br>Importado: <b>'+esc(x.valueIncoming)+'</b></p><label><input type="radio" name="ic_'+esc(x.id)+'" value="keep" checked> Manter atual</label> <label><input type="radio" name="ic_'+esc(x.id)+'" value="import"> Usar importado</label></div>').join('');
 return '<div class="msa-feedback msa-feedback-warning"><b>⚠️ '+(plan.records.length+plan.profile.length)+' conflito(s) / possível(is) duplicata(s)</b><br>Revise cada item antes de salvar.</div>'+
   (rec?'<h3 style="margin-top:14px">Registros</h3><div class="list">'+rec+'</div>':'')+
   (prof?'<h3 style="margin-top:14px">Campos do perfil</h3><div class="list">'+prof+'</div>':'');
}
window.abrirRevisaoImportacao=function(n){
 const plan=buildImportConflictPlan(n);
 window._importPendente=n;window._msaImportConflictPlan=plan;
 const box=byId('importReviewContent');
 let base=typeof window.resumirImportacao==='function'?window.resumirImportacao(n):'<div class="msa-feedback msa-feedback-info">Revise os dados recebidos da IA.</div>';
 if(box)box.innerHTML=base+importConflictSummary(plan);
 const modal=byId('importReviewOverlay');if(modal)modal.style.display='flex';
};
window.cancelarImportacaoPendente=function(){
 window._importPendente=null;window._msaImportConflictPlan=null;
 const modal=byId('importReviewOverlay');if(modal)modal.style.display='none';
 if(byId('resultadoImport'))byId('resultadoImport').innerHTML='<div class="alert">↩️ Importação cancelada. Nada foi salvo.</div>';
};
window.confirmarImportacaoPendente=function(){
 const n=window._importPendente,plan=window._msaImportConflictPlan;if(!n)return;
 const chosen=JSON.parse(JSON.stringify(n));
 (plan?.records||[]).forEach(x=>{
  const el=document.querySelector('input[name="ic_'+CSS.escape(x.id)+'"]:checked'),choice=el?.value||'skip';
  if(choice==='skip'&&Array.isArray(chosen[x.prop]))chosen[x.prop]=chosen[x.prop].filter((_,i)=>i!==x.index);
 });
 const modal=byId('importReviewOverlay');if(modal)modal.style.display='none';
 try{
  if(typeof window.importarNormalizado==='function')window.importarNormalizado(chosen);
  else if(typeof importarNormalizado==='function')importarNormalizado(chosen);
  (plan?.profile||[]).forEach(x=>{
    const el=document.querySelector('input[name="ic_'+CSS.escape(x.id)+'"]:checked');
    if(el?.value==='import'){
      const p=storage.get(K.p)[0]||{};p[x.field]=x.valueIncoming;storage.set(K.p,[p]);
    }
  });
  try{render();if(typeof loadProfile==='function')loadProfile();if(typeof renderCarteirinha==='function')renderCarteirinha();if(typeof renderNovosModulos==='function')renderNovosModulos()}catch(e){}
  const msg=byId('resultadoImport');if(msg)msg.innerHTML='<div class="alert safe">✅ <b>Importação concluída com revisão.</b> Conflitos foram tratados conforme suas escolhas.</div>';
 }catch(e){
  console.error('[Minha Saúde IA] confirmação da importação',e);
  const msg=byId('resultadoImport');if(msg)msg.innerHTML='<div class="alert danger">❌ Não foi possível concluir a importação revisada.</div>';
 }finally{window._importPendente=null;window._msaImportConflictPlan=null}
};



/* ===== V5.03 — perfis familiares locais ===== */
const FAMILY_REG_KEY='msa3_perfis_locais';
function readFamilyRegistry(){try{return JSON.parse(window.localStorage.getItem(FAMILY_REG_KEY)||'[]')}catch(e){return[]}}
function writeFamilyRegistry(a){try{window.localStorage.setItem(FAMILY_REG_KEY,JSON.stringify(a.slice(-30)));return true}catch(e){return false}}
function profileSlug(v){return String(v||'perfil').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9_-]+/g,'-').replace(/^-|-$/g,'').slice(0,40)||('perfil-'+Date.now())}
function currentProfileId(){return String(window.msaStoragePerfil||new URLSearchParams(location.search).get('perfil')||'').trim()}
function profileURL(id){return location.origin+location.pathname+'?perfil='+encodeURIComponent(id)}
function ensureFamilyProfilesUI(){
 const toolsGroup=[...document.querySelectorAll('#nav .nav-group')].find(g=>g.querySelector('.nav-toggle[data-menu="tools"]')),menu=toolsGroup?.querySelector('.nav-menu');
 if(menu&&!menu.querySelector('[data-tab="perfis-locais"]')){const b=document.createElement('button');b.type='button';b.setAttribute('data-tab','perfis-locais');b.textContent='👨‍👩‍👧‍👦 Perfis locais';menu.appendChild(b)}
 if(byId('perfis-locais')){renderFamilyProfiles();return}
 const host=byId('main-content')||document.querySelector('.wrap')||document.body,sec=document.createElement('section');sec.id='perfis-locais';
 sec.innerHTML='<div class="card"><div class="dash-section-title"><div><h2>👨‍👩‍👧‍👦 Perfis locais</h2><div class="muted">Separe históricos de pessoas diferentes no mesmo navegador. Cada perfil usa uma área local independente.</div></div></div><form id="msaFamilyProfileForm" class="grid2"><label>Nome do perfil<input id="msaFamilyProfileName" required placeholder="Ex.: João, Maria, Filho"></label><div style="align-self:end"><button class="btn green" type="submit">➕ Criar perfil</button></div></form><div class="alert info" style="margin-top:12px">🔒 Criar um perfil gera um link local separado. Os dados não são enviados para um servidor.</div><div id="msaFamilyProfileList" class="list" style="margin-top:13px"></div></div>';
 host.appendChild(sec);
 sec.querySelector('#msaFamilyProfileForm').addEventListener('submit',e=>{
  e.preventDefault();const name=byId('msaFamilyProfileName').value.trim();let id=profileSlug(name);const reg=readFamilyRegistry();while(reg.some(x=>x.id===id))id=profileSlug(name)+'-'+Math.random().toString(36).slice(2,6);reg.push({id,name,createdAt:new Date().toISOString()});writeFamilyRegistry(reg);e.target.reset();renderFamilyProfiles();
 });
 renderFamilyProfiles();
}
function renderFamilyProfiles(){
 const box=byId('msaFamilyProfileList');if(!box)return;
 const reg=readFamilyRegistry(),current=currentProfileId();
 const items=[{id:'',name:'Perfil atual padrão',createdAt:null},...reg.filter(x=>x.id!==current)];
 box.innerHTML=items.map(x=>{
   const active=(x.id===current)||(!x.id&&!current),href=x.id?profileURL(x.id):location.origin+location.pathname;
   return '<div class="item"><div class="itemtop"><b>👤 '+esc(x.name)+'</b>'+(active?'<span class="tag">Atual</span>':'')+'</div><p>'+ (x.createdAt?'Criado em '+esc(new Date(x.createdAt).toLocaleString('pt-BR')):'Use o perfil padrão do navegador')+'</p><div class="row"><button class="btn '+(active?'secondary':'green')+' small" type="button" '+(active?'disabled':'')+' data-family-open="'+esc(href)+'">'+(active?'✅ Perfil ativo':'↔️ Abrir perfil')+'</button><button class="btn secondary small" type="button" data-family-copy="'+esc(href)+'">🔗 Copiar link</button></div></div>';
 }).join('')||'<div class="empty">Nenhum perfil local criado.</div>';
}
document.addEventListener('click',e=>{
 const open=e.target.closest&&e.target.closest('[data-family-open]');if(open)location.href=open.getAttribute('data-family-open');
 const copy=e.target.closest&&e.target.closest('[data-family-copy]');if(copy){const url=copy.getAttribute('data-family-copy');navigator.clipboard?.writeText(url).then(()=>alert('🔗 Link do perfil copiado.')).catch(()=>prompt('Copie o link:',url))}
});
document.addEventListener('DOMContentLoaded',()=>setTimeout(ensureFamilyProfilesUI,700));



/* ===== V5.04 — pacote de transferência / base para sincronização ===== */
const SYNC_KEYS=[['d','Sintomas'],['c','Consultas'],['m','Medicamentos'],['e','Exames'],['p','Perfil'],['v','Sinais vitais'],['r','Lembretes'],['vax','Vacinas'],['fam','Histórico familiar'],['doc','Documentos'],['nutri','Nutrição'],['suplReg','Suplementos'],['food','Reações alimentares'],['agua','Hidratação'],['sono','Sono'],['bem','Bem-estar'],['gat','Gatilhos'],['medRot','Rotinas de medicamentos'],['medTaken','Doses de medicamentos'],['ciclo','Ciclo menstrual'],['anticoncepcional','Anticoncepcional']];
function buildSyncPackage(){
 const data={app:'Minha Saúde IA',formatVersion:'2.0',exportedAt:new Date().toISOString(),profileId:currentProfileId(),data:{}};
 SYNC_KEYS.forEach(([name])=>{data.data[name]=storage.get(K[name])});
 return data;
}
window.msaExportSyncPackage=function(){
 const pkg=buildSyncPackage();
 downloadLocal('minha-saude-ia-pacote-'+new Date().toISOString().slice(0,10)+'.json',JSON.stringify(pkg,null,2),'application/json');
};
function downloadLocal(name,text,type){
 const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
}
function mergeSyncArray(current,incoming){
 const out=current.slice(),seen=new Set(out.map(x=>JSON.stringify(x)));
 incoming.forEach(x=>{const s=JSON.stringify(x);if(!seen.has(s)){out.push(x);seen.add(s)}});
 return out;
}
async function importSyncPackage(file){
 const text=await file.text(),pkg=JSON.parse(text);
 if(!pkg||pkg.app!=='Minha Saúde IA'||!pkg.data||typeof pkg.data!=='object')throw new Error('Pacote inválido ou incompatível.');
 const counts=[];for(const [name] of SYNC_KEYS){const inc=Array.isArray(pkg.data[name])?pkg.data[name]:[];if(inc.length)counts.push(name+': '+inc.length)}
 if(!confirm('📦 Pacote encontrado ('+counts.join(', ')+').\n\nA importação vai MESCLAR os registros locais, sem apagar o histórico atual. Continuar?'))return;
 let merged=0;
 SYNC_KEYS.forEach(([name])=>{const key=K[name],inc=Array.isArray(pkg.data[name])?pkg.data[name]:[];if(!inc.length)return;const before=storage.get(key);let after;if(name==='p'){const cur=before[0]||{},src=inc[0]||{};after=[Object.assign({},cur,Object.keys(cur).length?{}:src)];}else after=mergeSyncArray(before,inc);if(JSON.stringify(before)!==JSON.stringify(after)){storage.set(key,after);merged+=inc.length}});
 try{render();if(typeof renderNovosModulos==='function')renderNovosModulos();if(typeof renderDocumentosSaude==='function')renderDocumentosSaude()}catch(e){}
 alert('✅ Pacote importado. '+merged+' registro(s)/item(ns) novos foram mesclados.');
}
function ensureSyncUI(){
 const toolsGroup=[...document.querySelectorAll('#nav .nav-group')].find(g=>g.querySelector('.nav-toggle[data-menu="tools"]')),menu=toolsGroup?.querySelector('.nav-menu');
 if(menu&&!menu.querySelector('[data-tab="sincronizacao"]')){const b=document.createElement('button');b.type='button';b.setAttribute('data-tab','sincronizacao');b.textContent='📦 Transferir entre dispositivos';menu.appendChild(b)}
 if(byId('sincronizacao'))return;
 const host=byId('main-content')||document.querySelector('.wrap')||document.body,sec=document.createElement('section');sec.id='sincronizacao';
 sec.innerHTML='<div class="card"><div class="dash-section-title"><div><h2>📦 Transferir entre dispositivos</h2><div class="muted">Exporte um pacote completo para levar seus dados a outro celular ou computador.</div></div></div><div class="grid2"><div class="card"><h3>📤 Exportar pacote</h3><p class="muted">Baixe um arquivo JSON com os registros do perfil atual.</p><button class="btn green" type="button" id="msaSyncExport">📦 Baixar pacote</button></div><div class="card"><h3>📥 Importar pacote</h3><p class="muted">O pacote será mesclado ao histórico atual; nada será apagado automaticamente.</p><input id="msaSyncFile" type="file" accept=".json,application/json"><button class="btn secondary" type="button" id="msaSyncImport" style="margin-top:10px">📥 Importar pacote</button></div></div><div class="alert info" style="margin-top:13px">☁️ Sincronização automática entre aparelhos ainda requer uma conta e um servidor. Esta etapa cria a ponte local segura para transferência.</div></div>';
 host.appendChild(sec);
 sec.querySelector('#msaSyncExport').addEventListener('click',window.msaExportSyncPackage);
 sec.querySelector('#msaSyncImport').addEventListener('click',async()=>{const f=sec.querySelector('#msaSyncFile').files[0];if(!f)return alert('Escolha um pacote JSON antes de importar.');try{await importSyncPackage(f)}catch(e){alert('❌ Não foi possível importar: '+(e.message||e))}});
}
document.addEventListener('DOMContentLoaded',()=>setTimeout(ensureSyncUI,750));


})();