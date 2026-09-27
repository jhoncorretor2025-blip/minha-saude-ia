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
})();