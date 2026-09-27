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


})();