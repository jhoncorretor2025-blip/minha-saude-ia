/* Minha Saúde IA — V5.97 — Assistente visual de importação */
(function(){
'use strict';
const KEY='msa2_importacao_rascunho_v514';
const $=id=>document.getElementById(id);
function storage(){return window.msaStorage||localStorage}
function saveDraft(v){try{if(v)storage().setItem(KEY,v);else storage().removeItem(KEY)}catch(e){}}
function getDraft(){try{return storage().getItem(KEY)||''}catch(e){return''}}
function setStep(n,title,msg){
 const root=$('msaImportFlow');if(!root)return;
 root.querySelectorAll('[data-step]').forEach(x=>x.classList.toggle('active',Number(x.dataset.step)===n));
 const t=$('msaImportFlowTitle'),m=$('msaImportFlowMsg'),state=$('msaImportFlowState');
 if(t)t.textContent=title;
 if(m)m.textContent=msg;
 if(state)state.textContent='Etapa '+n+' de 5';
}
function addFlow(){
 const box=$('importIA');if(!box||$('msaImportFlow'))return;
 const card=document.createElement('div');card.id='msaImportFlow';card.className='card';
 card.style.cssText='margin:0 0 12px;background:linear-gradient(135deg,#f5f8ff,#faf7ff);border-color:#dce5ff';
 card.innerHTML='<div style="display:flex;justify-content:space-between;gap:10px;align-items:center"><div><div style="font-size:11px;font-weight:900;color:#315dcc;letter-spacing:.06em">ASSISTENTE DE IMPORTAÇÃO</div><h3 id="msaImportFlowTitle" style="margin:4px 0 3px">Prepare sua importação</h3><div id="msaImportFlowMsg" class="muted">Siga as etapas. O aplicativo guarda o que você colar para evitar perda acidental.</div></div><span id="msaImportFlowState" class="tag">Etapa 1 de 5</span></div><div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin-top:14px">'+
 [['1','Preparar'],['2','Conversar'],['3','Colar'],['4','Revisar'],['5','Salvar']].map(x=>'<div data-step="'+x[0]+'" style="padding:8px 5px;border-radius:10px;background:#eef2f7;text-align:center;font-size:10px;font-weight:900;color:#687386"><b style="display:block;font-size:15px">'+x[0]+'</b>'+x[1]+'</div>').join('')+
 '</div><div id="msaImportRecovery" style="margin-top:10px"></div>';
 box.parentNode.insertBefore(card,box);
 const draft=getDraft();
 if(draft){
  box.value=draft;
  $('msaImportRecovery').innerHTML='<div class="alert warn"><b>📝 Encontramos uma importação não finalizada.</b><br>O texto anterior foi recuperado automaticamente. Revise antes de importar.<div class="row" style="margin-top:8px"><button class="btn secondary small" type="button" id="msaDiscardDraft">Descartar rascunho</button></div></div>';
  $('msaDiscardDraft').onclick=function(){saveDraft('');box.value='';$('msaImportRecovery').innerHTML='';setStep(1,'Prepare sua importação','Siga as etapas. O aplicativo guarda o que você colar para evitar perda acidental.')};
  setStep(3,'Resposta recuperada','O texto que você estava preparando foi recuperado.');
 }else setStep(1,'Prepare sua importação','Primeiro copie o prompt e converse com a IA.');
 box.addEventListener('input',function(){saveDraft(box.value);if(box.value.trim())setStep(3,'Resposta pronta para análise','Quando terminar de conversar com a IA, cole a ficha completa abaixo.')});
 const copy=$('promptIA')?.closest('.card')?.querySelector('button[onclick*="copiarPrompt"]');
 if(copy)copy.addEventListener('click',()=>setStep(2,'Converse com sua IA','Cole o prompt no ChatGPT, Gemini ou outra IA e responda as perguntas necessárias.'));
 const openers=document.querySelectorAll('a[onclick*="copiarPromptAntesDeAbrir"]');
 openers.forEach(a=>a.addEventListener('click',()=>setStep(2,'Converse com sua IA','A IA organiza o contexto disponível e deve entregar a ficha sem inventar dados.')));
}
function hookImport(){
 if(typeof window.processarImportacao==='function'&&!window.__msa514Wrapped){
  const original=window.processarImportacao;window.__msa514Wrapped=true;
  window.processarImportacao=async function(){
   const raw=$('importIA')?.value.trim();
   if(raw){saveDraft(raw);setStep(4,'Analisando sua resposta','Estamos organizando os dados. Aguarde a tela de revisão.')}
   else setStep(3,'Falta a resposta da IA','Cole a ficha completa no campo antes de importar.');
   try{const r=await original.apply(this,arguments);if(window._importPendente)setStep(4,'Confira antes de salvar','Revise a prévia. Nada é salvo enquanto você não confirmar.');return r}
   catch(e){setStep(3,'Não foi possível importar','Revise o conteúdo e tente novamente.');throw e}
  };
 }
 if(typeof window.confirmarImportacaoPendente==='function'&&!window.__msa514ConfirmWrapped){
  const original=window.confirmarImportacaoPendente;window.__msa514ConfirmWrapped=true;
  window.confirmarImportacaoPendente=function(){
   const r=original.apply(this,arguments);
   if(!window._importPendente){
    saveDraft('');setStep(5,'Importação concluída','✅ Seus dados foram salvos. Você pode conferir a ficha de saúde.');
   }else{
    setStep(4,'Correção necessária','⚠️ A importação continua aguardando revisão. Nada incompleto foi salvo.');
   }
   return r;
  };
 }
 if(typeof window.cancelarImportacaoPendente==='function'&&!window.__msa514CancelWrapped){
  const original=window.cancelarImportacaoPendente;window.__msa514CancelWrapped=true;
  window.cancelarImportacaoPendente=function(){const r=original.apply(this,arguments);setStep(3,'Importação pausada','Nada foi salvo. Seu texto continua protegido no rascunho para você tentar novamente.');return r};
 }
}
function boot(){addFlow();hookImport();setTimeout(hookImport,500);setTimeout(hookImport,1200)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();