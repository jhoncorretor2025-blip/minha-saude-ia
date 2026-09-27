/* Minha Saúde IA — primeiras melhorias V4.88+
 * Camada aditiva: não altera o formato dos registros existentes.
 */
(function(){
'use strict';

const K=window.MSA_K||window.K||{};
const storage=window.MSAStorage;
const DRAFT_KEY='msa2_rascunhos_formularios';

const FORMS={
  dorForm:{page:'dor',label:'Sintoma ou dor',dataKey:K.d},
  cForm:{page:'consultas',label:'Consulta',dataKey:K.c},
  mForm:{page:'meds',label:'Medicamento',dataKey:K.m},
  eForm:{page:'exames',label:'Exame',dataKey:K.e},
  pForm:{page:'perfil',label:'Perfil',dataKey:K.p},
  cicloForm:{page:'perfil',label:'Ciclo menstrual',dataKey:K.ciclo},
  vForm:{page:'acompanhamento',label:'Sinais vitais',dataKey:K.v},
  rForm:{page:'lembretes',label:'Lembrete',dataKey:K.r},
  vaxForm:{page:'acompanhamento',label:'Vacina',dataKey:K.vax},
  famForm:{page:'familia',label:'Histórico familiar',dataKey:K.fam},
  nutriForm:{page:'nutricao',label:'Nutrição',dataKey:K.nutri},
  suplForm:{page:'nutricao',label:'Suplemento',dataKey:K.suplReg},
  foodForm:{page:'nutricao',label:'Reação alimentar',dataKey:K.food},
  aguaForm:{page:'acompanhamento',label:'Hidratação',dataKey:K.agua},
  sonoForm:{page:'sono',label:'Sono',dataKey:K.sono},
  bemForm:{page:'sono',label:'Bem-estar',dataKey:K.bem},
  gatilhoForm:{page:'dor',label:'Gatilho',dataKey:K.gat},
  famFormPage:{page:'familia',label:'Antecedente familiar',dataKey:K.fam},
  medRotForm:{page:'lembretes',label:'Rotina de medicamento',dataKey:K.medRot},
  lembFormPage:{page:'lembretes',label:'Lembrete',dataKey:K.r}
};

const byId=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const readDrafts=()=>{try{return JSON.parse(storage.getItem(DRAFT_KEY)||'{}')}catch(e){return{}}};
const writeDrafts=o=>{try{storage.setItem(DRAFT_KEY,JSON.stringify(o));return true}catch(e){return false}};
const controlValue=el=>{
  if(el.type==='checkbox')return !!el.checked;
  if(el.type==='radio')return el.checked?el.value:null;
  if(el.type==='file'||el.type==='password')return null;
  return el.value;
};
const collectForm=form=>{
  const fields={};
  form.querySelectorAll('input,select,textarea').forEach(el=>{
    if(!el.name&& !el.id)return;
    const v=controlValue(el);
    if(v!==null)fields[el.id||el.name]=v;
  });
  return fields;
};
const formHasContent=form=>Object.values(collectForm(form)).some(v=>typeof v==='boolean'?v:String(v||'').trim()!=='');
const saveDraft=form=>{
  const cfg=FORMS[form.id];if(!cfg||!formHasContent(form))return;
  const drafts=readDrafts();drafts[form.id]={id:form.id,label:cfg.label,page:cfg.page,updatedAt:new Date().toISOString(),fields:collectForm(form)};
  writeDrafts(drafts);renderDraftPanel();
};
const removeDraft=id=>{
  const drafts=readDrafts();if(!drafts[id])return;
  delete drafts[id];writeDrafts(drafts);renderDraftPanel();
};
const fillForm=(form,fields)=>{
  Object.keys(fields||{}).forEach(id=>{
    const el=byId(id);if(!el||el.type==='file'||el.type==='password')return;
    if(el.type==='checkbox'){el.checked=!!fields[id];return}
    if(el.type==='radio'){el.checked=el.value===fields[id];return}
    el.value=fields[id];
    el.dispatchEvent(new Event('input',{bubbles:true}));
  });
};
window.msaRestaurarRascunho=function(id){
  const d=readDrafts()[id],form=byId(id);if(!d||!form)return;
  if(typeof window.go==='function')window.go(d.page);
  setTimeout(()=>{
    fillForm(form,d.fields);
    removeDraft(id);
    form.scrollIntoView({behavior:'smooth',block:'start'});
    const first=form.querySelector('input,select,textarea');if(first)first.focus();
  },80);
};
window.msaIgnorarRascunho=function(id){
  if(confirm('Ignorar e apagar este rascunho?'))removeDraft(id);
};
function renderDraftPanel(){
  const existing=byId('msaDraftPanel');
  if(existing)existing.remove();
  const drafts=Object.values(readDrafts()).sort((a,b)=>String(b.updatedAt).localeCompare(String(a.updatedAt)));
  if(!drafts.length)return;
  const host=document.getElementById('main-content')||document.querySelector('.wrap')||document.body;
  const box=document.createElement('div');
  box.id='msaDraftPanel';box.className='card';
  box.style.cssText='margin:0 0 14px;border:1px solid #bfdbfe;background:#eff6ff';
  box.innerHTML='<div class="dash-section-title"><div><h2 style="margin:0;font-size:18px">📝 Rascunhos salvos automaticamente</h2><div class="muted">Informações que você começou a preencher, mas ainda não salvou.</div></div></div>'+
    '<div class="list">'+drafts.map(d=>{
      const when=new Date(d.updatedAt),dt=isNaN(when)?d.updatedAt:when.toLocaleString('pt-BR',{dateStyle:'short',timeStyle:'short'});
      return '<div class="item msa-draft-row"><div class="itemtop"><b>📝 '+esc(d.label)+'</b><span class="tag">'+esc(dt)+'</span></div><p>Este rascunho fica apenas neste navegador.</p><div class="row" style="margin-top:9px"><button class="btn green small" type="button" data-msa-draft-action="restore" data-msa-draft-id="'+esc(d.id)+'">↩️ Continuar preenchendo</button><button class="btn secondary small" type="button" data-msa-draft-action="ignore" data-msa-draft-id="'+esc(d.id)+'">🗑️ Apagar rascunho</button></div></div>';
    }).join('')+'</div>';
  host.insertBefore(box,host.firstChild);
}
function snapshotKey(key){
  if(!key)return '';
  try{return JSON.stringify(storage.get(key))}catch(e){return ''}
}
function attachDraftHandlers(){
  Object.keys(FORMS).forEach(id=>{
    const form=byId(id);if(!form||form.dataset.msaDraftReady)return;
    form.dataset.msaDraftReady='1';
    let timer=0;
    form.addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(()=>saveDraft(form),650)});
    form.addEventListener('change',()=>{clearTimeout(timer);timer=setTimeout(()=>saveDraft(form),650)});
    form.addEventListener('submit',e=>{
      const cfg=FORMS[id];form.dataset.msaBeforeSave=snapshotKey(cfg.dataKey);
      setTimeout(()=>{
        const after=snapshotKey(cfg.dataKey);
        if(cfg.dataKey&&after!==form.dataset.msaBeforeSave)removeDraft(id);
      },40);
    });
  });
}
function startDrafts(){
  attachDraftHandlers();renderDraftPanel();
  document.addEventListener('click',e=>{
    const b=e.target.closest&&e.target.closest('[data-msa-draft-action]');if(!b)return;
    const id=b.getAttribute('data-msa-draft-id');
    if(b.getAttribute('data-msa-draft-action')==='restore')window.msaRestaurarRascunho(id);
    else window.msaIgnorarRascunho(id);
  });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(startDrafts,180));
else setTimeout(startDrafts,180);
})();