/* Minha Saúde IA — primeiras melhorias V4.88+
 * Camada aditiva: não altera o formato dos registros existentes.
 */
(function(){
'use strict';

const K=window.MSA_K||window.K||{};
const storage=window.MSAStorage;
const rawStorage=window.msaStorage;
const DRAFT_KEY='msa2_rascunhos_formularios';
const DRAFT_PANEL_CLOSED_KEY='msa2_rascunhos_painel_fechado';
let draftPanelClosed=rawStorage.getItem(DRAFT_PANEL_CLOSED_KEY)==='1';

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
const readDrafts=()=>{try{return JSON.parse(rawStorage.getItem(DRAFT_KEY)||'{}')}catch(e){return{}}};
const writeDrafts=o=>{try{rawStorage.setItem(DRAFT_KEY,JSON.stringify(o));return true}catch(e){return false}};
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
  const drafts=readDrafts();
  const wasExisting=!!drafts[form.id];
  drafts[form.id]={id:form.id,label:cfg.label,page:cfg.page,updatedAt:new Date().toISOString(),fields:collectForm(form)};
  if(!wasExisting){
    draftPanelClosed=false;
    rawStorage.removeItem(DRAFT_PANEL_CLOSED_KEY);
  }
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
function fecharPainelRascunhos(){
  draftPanelClosed=true;
  rawStorage.setItem(DRAFT_PANEL_CLOSED_KEY,'1');
  const panel=byId('msaDraftPanel');
  if(panel)panel.remove();
}
function renderDraftPanel(){
  const existing=byId('msaDraftPanel');
  if(existing)existing.remove();
  if(draftPanelClosed)return;
  const drafts=Object.values(readDrafts()).sort((a,b)=>String(b.updatedAt).localeCompare(String(a.updatedAt)));
  if(!drafts.length)return;
  const host=document.getElementById('main-content')||document.querySelector('.wrap')||document.body;
  const box=document.createElement('div');
  box.id='msaDraftPanel';box.className='card';
  box.style.cssText='margin:0 0 14px;border:1px solid #bfdbfe;background:#eff6ff;position:relative';
  box.innerHTML='<div class="dash-section-title" style="position:relative;padding-right:44px"><div><h2 style="margin:0;font-size:18px">📝 Rascunhos salvos automaticamente</h2><div class="muted">Informações que você começou a preencher, mas ainda não salvou.</div></div><button type="button" class="btn secondary small" aria-label="Fechar rascunhos" title="Fechar" data-msa-close-drafts="1" style="position:absolute;right:0;top:0;width:34px;height:34px;min-width:34px;padding:0;border-radius:50%;font-size:18px;font-weight:800;line-height:1">✕</button></div>'+
    '<div class="list">'+drafts.map(d=>{
      const when=new Date(d.updatedAt),dt=isNaN(when)?d.updatedAt:when.toLocaleString('pt-BR',{dateStyle:'short',timeStyle:'short'});
      return '<div class="item msa-draft-row"><div class="itemtop"><b>📝 '+esc(d.label)+'</b><span class="tag">'+esc(dt)+'</span></div><p>Este rascunho fica apenas neste navegador.</p><div class="row" style="margin-top:9px"><button class="btn green small" type="button" data-msa-draft-action="restore" data-msa-draft-id="'+esc(d.id)+'">↩️ Continuar preenchendo</button><button class="btn secondary small" type="button" data-msa-draft-action="ignore" data-msa-draft-id="'+esc(d.id)+'">🗑️ Apagar rascunho</button></div></div>';
    }).join('')+'</div>';
  host.insertBefore(box,host.firstChild);
  const closeBtn=box.querySelector('[data-msa-close-drafts]');
  if(closeBtn)closeBtn.addEventListener('click',fecharPainelRascunhos);
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

/* ===== V4.89 — prevenção de registros duplicados ===== */
const DUP_CONFIG={
  dorForm:{key:K.d,fields:['dData','dLocal','dInt','dTipo','dSint'],map:{dData:'data',dLocal:'local',dInt:'int',dTipo:'tipo',dSint:'sint'}},
  cForm:{key:K.c,fields:['cData','cEsp','cMed','cMot'],map:{cData:'data',cEsp:'esp',cMed:'med',cMot:'mot'}},
  mForm:{key:K.m,fields:['mNome','mDose','mInicio'],map:{mNome:'nome',mDose:'dose',mInicio:'inicio'}},
  eForm:{key:K.e,fields:['eData','eNome','eRes'],map:{eData:'data',eNome:'nome',eRes:'res'}},
  vForm:{key:K.v,fields:['vData','vPeso','vPressao','vFC','vTemp','vGlic','vSat'],map:{vData:'data',vPeso:'peso',vPressao:'pressao',vFC:'fc',vTemp:'temp',vGlic:'glic',vSat:'sat'}},
  rForm:{key:K.r,fields:['rNome','rData','rTipo'],map:{rNome:'nome',rData:'data',rTipo:'tipo'}},
  vaxForm:{key:K.vax,fields:['vaxNome','vaxData'],map:{vaxNome:'nome',vaxData:'data'}},
  famForm:{key:K.fam,fields:['famParente','famInfo'],map:{famParente:'parente',famInfo:'info'}},
  nutriForm:{key:K.nutri,fields:['nutriData','nutriTexto'],map:{nutriData:'data',nutriTexto:'texto'}},
  suplForm:{key:K.suplReg,fields:['suplNome','suplDose','suplHora'],map:{suplNome:'nome',suplDose:'dose',suplHora:'hora'}},
  foodForm:{key:K.food,fields:['foodNome','foodReacao','foodData'],map:{foodNome:'nome',foodReacao:'reacao',foodData:'data'}},
  aguaForm:{key:K.agua,fields:['aguaData','aguaQtd'],map:{aguaData:'data',aguaQtd:'qtd'}},
  sonoForm:{key:K.sono,fields:['sonoData','sonoDormiu','sonoAcordou'],map:{sonoData:'data',sonoDormiu:'dormiu',sonoAcordou:'acordou'}},
  bemForm:{key:K.bem,fields:['bemData','bemEstresse','bemAnsiedade'],map:{bemData:'data',bemEstresse:'estresse',bemAnsiedade:'ansiedade'}},
  gatilhoForm:{key:K.gat,fields:['gatData','gatNome','gatSintoma'],map:{gatData:'data',gatNome:'gatilho',gatSintoma:'sintoma'}},
  famFormPage:{key:K.fam,fields:['famParentePage','famCondPage','famIdadePage'],map:{famParentePage:'parente',famCondPage:'cond',famIdadePage:'idade'}},
  medRotForm:{key:K.medRot,fields:['medRotNome','medRotDose','medRotHora'],map:{medRotNome:'nome',medRotDose:'dose',medRotHora:'hora'}},
  lembFormPage:{key:K.r,fields:['lembNomePage','lembDataPage','lembTipoPage'],map:{lembNomePage:'nome',lembDataPage:'data',lembTipoPage:'tipo'}}
};
const normalizeDuplicate=v=>String(v??'').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
function duplicateFormSignature(form,cfg,useRecord,record){
  return cfg.fields.map(id=>{
    if(useRecord)return normalizeDuplicate(record?.[cfg.map[id]]);
    const el=byId(id);
    if(!el)return '';
    if(el.type==='checkbox')return el.checked?'1':'0';
    if(el.type==='radio')return el.checked?normalizeDuplicate(el.value):'';
    return normalizeDuplicate(el.value);
  }).join('|');
}
function isDuplicateForm(form,cfg){
  const sig=duplicateFormSignature(form,cfg,false,null);
  if(!sig||/^\|*$/.test(sig))return false;
  return storage.get(cfg.key).some(record=>duplicateFormSignature(form,cfg,true,record)===sig);
}
function attachDuplicateGuard(){
  Object.keys(DUP_CONFIG).forEach(id=>{
    const form=byId(id);if(!form||form.dataset.msaDuplicateReady)return;
    form.dataset.msaDuplicateReady='1';
    form.addEventListener('submit',function(e){
      const cfg=DUP_CONFIG[id];
      if(isDuplicateForm(form,cfg)){
        const ok=confirm('🔎 Já existe um registro igual ou muito parecido.\n\nDeseja salvar mesmo assim?\n\nCancelar evita um possível duplicado.');
        if(!ok){
          e.preventDefault();
          e.stopImmediatePropagation();
          return false;
        }
      }
    },true);
  });
}


/* ===== V4.90 — Lixeira e desfazer exclusão ===== */
const TRASH_KEY='msa2_lixeira';
const LIST_CONFIG=[
  {container:'listD',key:K.d,label:'Sintoma'},
  {container:'listC',key:K.c,label:'Consulta'},
  {container:'listM',key:K.m,label:'Medicamento'},
  {container:'listE',key:K.e,label:'Exame'}
];
const readTrash=()=>{try{return rawStorage.getItem(TRASH_KEY)?JSON.parse(rawStorage.getItem(TRASH_KEY)):[]}catch(e){return[]}};
const writeTrash=a=>{try{rawStorage.setItem(TRASH_KEY,JSON.stringify(a.slice(-200)));return true}catch(e){return false}};
function ensureTrashUI(){
  const nav=document.querySelector('#nav .nav-group .nav-menu');
  const toolsGroup=[...document.querySelectorAll('#nav .nav-group')].find(g=>g.querySelector('.nav-toggle[data-menu="tools"]'));
  const toolsMenu=toolsGroup?.querySelector('.nav-menu')||nav;
  if(toolsMenu&&!toolsMenu.querySelector('[data-tab="lixeira"]')){
    const b=document.createElement('button');
    b.type='button';b.setAttribute('data-tab','lixeira');b.textContent='🗑️ Lixeira';
    toolsMenu.appendChild(b);
  }
  if(!document.getElementById('lixeira')){
    const host=document.getElementById('main-content')||document.querySelector('.wrap')||document.body;
    const sec=document.createElement('section');
    sec.id='lixeira';
    sec.innerHTML='<div class="card"><div class="dash-section-title"><div><h2>🗑️ Lixeira</h2><div class="muted">Registros excluídos dos históricos principais ficam aqui até serem restaurados ou apagados definitivamente.</div></div><button class="btn secondary" type="button" id="msaTrashRefresh">🔄 Atualizar</button></div><div id="msaTrashList" class="list"></div></div>';
    host.appendChild(sec);
    sec.querySelector('#msaTrashRefresh').addEventListener('click',renderTrash);
  }
  renderTrash();
}
function trashLabel(record,label){
  if(label==='Sintoma')return [record.local,record.data].filter(Boolean).join(' · ')||'Sintoma registrado';
  if(label==='Consulta')return [record.esp,record.data].filter(Boolean).join(' · ')||'Consulta registrada';
  if(label==='Medicamento')return [record.nome,record.inicio||record.data].filter(Boolean).join(' · ')||'Medicamento registrado';
  if(label==='Exame')return [record.nome,record.data].filter(Boolean).join(' · ')||'Exame registrado';
  return label;
}
window.msaExcluirRegistro=function(key,index,label){
  const arr=storage.get(key);
  if(!Array.isArray(arr)||index<0||index>=arr.length)return;
  const record=arr[index];
  if(!confirm('🗑️ Mover este registro para a Lixeira?\n\nVocê poderá restaurá-lo depois.'))return;
  const trash=readTrash();
  trash.push({id:String(Date.now())+'_'+Math.random().toString(36).slice(2,7),sourceKey:key,label,record,deletedAt:new Date().toISOString()});
  if(!writeTrash(trash))return alert('Não foi possível abrir a Lixeira.');
  arr.splice(index,1);storage.set(key,arr);
  renderTrash();
  if(typeof window.render==='function')window.render();
};
window.msaRestaurarRegistro=function(id){
  const trash=readTrash(),idx=trash.findIndex(x=>x.id===id);
  if(idx<0)return;
  const item=trash[idx],arr=storage.get(item.sourceKey);
  arr.push(item.record);
  storage.set(item.sourceKey,arr);
  trash.splice(idx,1);writeTrash(trash);renderTrash();
  if(typeof window.render==='function')window.render();
  alert('♻️ Registro restaurado.');
};
window.msaApagarDaLixeira=function(id){
  const trash=readTrash(),idx=trash.findIndex(x=>x.id===id);
  if(idx<0)return;
  if(!confirm('⚠️ Apagar este item definitivamente? Essa ação não poderá ser desfeita.'))return;
  trash.splice(idx,1);writeTrash(trash);renderTrash();
};
function renderTrash(){
  const box=byId('msaTrashList');if(!box)return;
  const trash=readTrash().slice().reverse();
  if(!trash.length){box.innerHTML='<div class="empty">🎉 A Lixeira está vazia.</div>';return}
  box.innerHTML=trash.map(x=>{
    const when=new Date(x.deletedAt),dt=isNaN(when)?'':when.toLocaleString('pt-BR',{dateStyle:'short',timeStyle:'short'});
    return '<div class="item"><div class="itemtop"><b>🗑️ '+esc(x.label)+'</b><span class="tag">'+esc(dt)+'</span></div><p>'+esc(trashLabel(x.record,x.label))+'</p><div class="row" style="margin-top:9px"><button class="btn green small" type="button" data-trash-action="restore" data-trash-id="'+esc(x.id)+'">♻️ Restaurar</button><button class="btn secondary small" type="button" data-trash-action="delete" data-trash-id="'+esc(x.id)+'">Apagar definitivamente</button></div></div>';
  }).join('');
}
function addDeleteButtons(){
  LIST_CONFIG.forEach(cfg=>{
    const box=byId(cfg.container);if(!box)return;
    box.querySelectorAll('.msa-delete-btn').forEach(b=>b.remove());
    const arr=storage.get(cfg.key);
    const items=[...box.children].filter(el=>el.classList.contains('item'));
    items.forEach((item,displayIndex)=>{
      const index=arr.length-1-displayIndex;
      if(index<0)return;
      const row=document.createElement('div');row.className='row msa-delete-row';row.style.marginTop='9px';
      const b=document.createElement('button');b.type='button';b.className='btn secondary small msa-delete-btn';b.textContent='🗑️ Mover para a Lixeira';b.addEventListener('click',()=>window.msaExcluirRegistro(cfg.key,index,cfg.label));
      row.appendChild(b);item.appendChild(row);
    });
  });
}
function wrapRenderForTrash(){
  if(typeof window.render!=='function'||window.render.__msaTrashWrapped)return;
  const original=window.render;
  function wrapped(){const out=original.apply(this,arguments);setTimeout(addDeleteButtons,0);return out}
  wrapped.__msaTrashWrapped=true;window.render=wrapped;
}


/* ===== V4.91 — verificador de consistência dos dados ===== */
const CONSISTENCY_DATASETS=[
  {key:K.d,label:'Sintomas',dates:['data']},
  {key:K.c,label:'Consultas',dates:['data','ret']},
  {key:K.m,label:'Medicamentos',dates:['inicio','fim']},
  {key:K.e,label:'Exames',dates:['data']},
  {key:K.v,label:'Sinais vitais',dates:['data']},
  {key:K.r,label:'Lembretes',dates:['data']},
  {key:K.vax,label:'Vacinas',dates:['data']},
  {key:K.fam,label:'Histórico familiar',dates:[]},
  {key:K.ciclo,label:'Ciclo menstrual',dates:['inicio','fim']},
  {key:K.nutri,label:'Nutrição',dates:['data']},
  {key:K.sono,label:'Sono',dates:['data']},
  {key:K.bem,label:'Bem-estar',dates:['data']},
  {key:K.gat,label:'Gatilhos',dates:['data']}
];
const strictDate=v=>{
  if(v===null||v===undefined||String(v).trim()==='')return true;
  const s=String(v).trim().slice(0,10),m=s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if(!m)return false;
  const d=new Date(Number(m[1]),Number(m[2])-1,Number(m[3]));
  return d.getFullYear()===Number(m[1])&&d.getMonth()===Number(m[2])-1&&d.getDate()===Number(m[3]);
};
function duplicateDataCount(key,fields){
  const a=storage.get(key),seen=new Set(),dupes=[];
  a.forEach((r,i)=>{
    const sig=fields.map(f=>normalizeDuplicate(r?.[f])).join('|');
    if(!sig||/^\|*$/.test(sig))return;
    if(seen.has(sig))dupes.push(i);else seen.add(sig);
  });
  return dupes.length;
}
function runConsistencyChecks(){
  const issues=[], p=storage.get(K.p)[0]||{};
  const add=(level,title,detail)=>issues.push({level,title,detail});
  if(p.nasc&&!strictDate(p.nasc))add('erro','Data de nascimento inválida','Revise a data cadastrada no perfil.');
  const age=Number(String(p.idade??'').replace(',','.')),birth=p.nasc;
  if(birth&&Number.isFinite(age)&&age>=0){
    const b=new Date(String(birth).slice(0,10)+'T12:00:00'),now=new Date(),calc=now.getFullYear()-b.getFullYear()-((now.getMonth()<b.getMonth()||now.getMonth()===b.getMonth()&&now.getDate()<b.getDate())?1:0);
    if(Math.abs(calc-age)>1)add('atenção','Idade e nascimento não batem','A idade informada é '+age+' e a idade calculada pela data de nascimento é '+calc+'.');
  }
  const altura=Number(String(p.altura??'').replace(',','.')),peso=Number(String(p.peso??'').replace(',','.'));
  if(p.altura&&(!Number.isFinite(altura)||altura<=0))add('erro','Altura inválida','Confira o valor cadastrado em centímetros.');
  if(p.peso&&(!Number.isFinite(peso)||peso<=0))add('erro','Peso inválido','Confira o valor cadastrado.');
  CONSISTENCY_DATASETS.forEach(ds=>{
    storage.get(ds.key).forEach((r,i)=>{
      ds.dates.forEach(field=>{if(r?.[field]&&!strictDate(r[field]))add('erro',ds.label+' — data inválida','Registro '+(i+1)+': campo '+field+' contém uma data que não foi reconhecida.')});
    });
  });
  storage.get(K.m).forEach((r,i)=>{
    if(r?.inicio&&r?.fim&&strictDate(r.inicio)&&strictDate(r.fim)&&String(r.fim).slice(0,10)<String(r.inicio).slice(0,10))add('erro','Medicamento com período invertido','Registro '+(i+1)+': a data final é anterior à inicial.');
  });
  storage.get(K.ciclo).forEach((r,i)=>{
    if(r?.inicio&&r?.fim&&strictDate(r.inicio)&&strictDate(r.fim)&&String(r.fim).slice(0,10)<String(r.inicio).slice(0,10))add('erro','Ciclo com período invertido','Registro '+(i+1)+': o fim do ciclo não pode ser anterior ao início.');
  });
  const dupChecks=[
    [K.d,'Sintomas',['data','local','int','tipo','sint']],
    [K.c,'Consultas',['data','esp','med','mot']],
    [K.m,'Medicamentos',['nome','dose','inicio']],
    [K.e,'Exames',['data','nome','res']],
    [K.v,'Sinais vitais',['data','peso','pressao','fc','temp','glic','sat']],
    [K.r,'Lembretes',['nome','data','tipo']],
    [K.vax,'Vacinas',['nome','data']],
    [K.fam,'Histórico familiar',['parente','info','idade']]
  ];
  dupChecks.forEach(x=>{const n=duplicateDataCount(x[0],x[2]);if(n)add('informativo','Possíveis duplicados em '+x[1],n+' registro(s) repetido(s) foram detectados pela combinação de campos principais.')});
  const medRot=storage.get(K.medRot),taken=storage.get(K.medTaken);
  const orphan=taken.filter(x=>x?.medId!=null&&!medRot.some(m=>String(m?.id)===String(x.medId))).length;
  if(orphan)add('atenção','Doses sem rotina correspondente',orphan+' registro(s) de dose apontam para uma rotina que não existe mais.');
  return issues;
}
window.msaExecutarConsistencia=function(){
  const box=byId('msaConsistencyResult');if(!box)return;
  const issues=runConsistencyChecks();
  if(!issues.length){box.innerHTML='<div class="alert safe"><b>✅ Nenhuma inconsistência estrutural encontrada.</b><br><span class="muted">A verificação analisa apenas a organização dos dados; ela não substitui uma avaliação profissional de saúde.</span></div>';return}
  const icon={erro:'🔴',atenção:'🟠',informativo:'🔵'};
  box.innerHTML='<div class="list">'+issues.map(x=>'<div class="item"><div class="itemtop"><b>'+icon[x.level]+' '+esc(x.title)+'</b><span class="tag">'+esc(x.level)+'</span></div><p>'+esc(x.detail)+'</p></div>').join('')+'</div><p class="muted" style="margin-top:10px">Total: '+issues.length+' apontamento(s). Eles indicam problemas de organização ou consistência, não um diagnóstico.</p>';
};
function ensureConsistencyUI(){
  const toolsGroup=[...document.querySelectorAll('#nav .nav-group')].find(g=>g.querySelector('.nav-toggle[data-menu="tools"]')),menu=toolsGroup?.querySelector('.nav-menu');
  if(menu&&!menu.querySelector('[data-tab="consistencia"]')){
    const b=document.createElement('button');b.type='button';b.setAttribute('data-tab','consistencia');b.textContent='🔍 Verificar dados';menu.appendChild(b);
  }
  if(!byId('consistencia')){
    const host=document.getElementById('main-content')||document.querySelector('.wrap')||document.body;
    const sec=document.createElement('section');sec.id='consistencia';
    sec.innerHTML='<div class="card"><div class="dash-section-title"><div><h2>🔍 Verificar consistência</h2><div class="muted">Procura problemas de organização dos dados, como datas inválidas, períodos invertidos, possíveis duplicados e referências quebradas.</div></div><button class="btn green" type="button" id="msaConsistencyRun">🔍 Verificar agora</button></div><div id="msaConsistencyResult"><div class="empty">Clique em “Verificar agora” para iniciar.</div></div></div>';
    host.appendChild(sec);
    sec.querySelector('#msaConsistencyRun').addEventListener('click',window.msaExecutarConsistencia);
  }
}


/* ===== V4.92 — filtros avançados da linha do tempo ===== */
function ensureTimelineFilters(){
  const target=byId('timelineFull');
  if(!target||byId('msaTimelineFilters'))return;
  const bar=document.createElement('div');
  bar.id='msaTimelineFilters';bar.className='msa-filter-bar';bar.style.margin='14px 0 16px';
  bar.innerHTML='<div class="msa-filter-group msa-form-group"><label class="msa-form-label" for="msaTimelineSearch">🔎 Buscar no histórico</label><input class="msa-form-control" id="msaTimelineSearch" type="search" placeholder="Ex.: dermatologia, dor, exame..."></div>'+
    '<div class="msa-filter-group msa-form-group"><label class="msa-form-label" for="msaTimelineType">Tipo de registro</label><select class="msa-form-control" id="msaTimelineType"><option value="">Todos</option><option value="Sintoma">Sintomas</option><option value="Consulta">Consultas</option><option value="Medicamento">Medicamentos</option><option value="Exame">Exames</option><option value="Sinal vital">Sinais vitais</option><option value="Vacina">Vacinas</option></select></div>'+
    '<div class="msa-filter-group msa-form-group"><label class="msa-form-label" for="msaTimelineFrom">De</label><input class="msa-form-control" id="msaTimelineFrom" type="date"></div>'+
    '<div class="msa-filter-group msa-form-group"><label class="msa-form-label" for="msaTimelineTo">Até</label><input class="msa-form-control" id="msaTimelineTo" type="date"></div>'+
    '<div class="msa-filter-actions"><button class="btn secondary" type="button" id="msaTimelineClear">Limpar filtros</button></div>';
  target.parentNode.insertBefore(bar,target);
  ['msaTimelineSearch','msaTimelineType','msaTimelineFrom','msaTimelineTo'].forEach(id=>byId(id)?.addEventListener(id==='msaTimelineSearch'?'input':'change',renderFilteredTimeline));
  byId('msaTimelineClear')?.addEventListener('click',()=>{
    ['msaTimelineSearch','msaTimelineType','msaTimelineFrom','msaTimelineTo'].forEach(id=>{const e=byId(id);if(e)e.value=''});
    renderFilteredTimeline();
  });
  renderFilteredTimeline();
}
function renderFilteredTimeline(){
  const target=byId('timelineFull');if(!target)return;
  const search=String(byId('msaTimelineSearch')?.value||'').trim().toLowerCase();
  const type=String(byId('msaTimelineType')?.value||'');
  const from=String(byId('msaTimelineFrom')?.value||'');
  const to=String(byId('msaTimelineTo')?.value||'');
  let rows=typeof window.buildTimeline==='function'?window.buildTimeline():[];
  rows=rows.filter(x=>{
    const raw=String(x.date||'').slice(0,10),iso=raw.match(/^(\d{4})-(\d{2})-(\d{2})$/),br=raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    const date=iso?raw:br?br[3]+'-'+br[2]+'-'+br[1]:'';
    if(type&&String(x.title)!==type)return false;
    if(from&&(!date||date<from))return false;
    if(to&&(!date||date>to))return false;
    if(search&&!((String(x.title||'')+' '+String(x.sub||'')).toLowerCase().includes(search)))return false;
    return true;
  });
  const info='<div class="muted" style="margin-bottom:10px">'+rows.length+' registro(s) encontrado(s).'+(search||type||from||to?' Filtros ativos na visão completa.':'')+'</div>';
  target.innerHTML=info+(rows.length?rows.map(x=>typeof window.timelineHTML==='function'?window.timelineHTML(x):'<div class="item"><b>'+esc(x.title)+'</b><p>'+esc(x.sub)+'</p></div>').join(''):'<div class="empty">Nenhum registro corresponde aos filtros. Experimente limpar ou ampliar o período.</div>');
}

function startDrafts(){
  attachDraftHandlers();
  attachDuplicateGuard();
  ensureTrashUI();
  wrapRenderForTrash();
  ensureConsistencyUI();
  ensureTimelineFilters();
  renderDraftPanel();
  document.addEventListener('click',e=>{
    const trash=e.target.closest&&e.target.closest('[data-trash-action]');
    if(trash){const id=trash.getAttribute('data-trash-id');if(trash.getAttribute('data-trash-action')==='restore')window.msaRestaurarRegistro(id);else window.msaApagarDaLixeira(id);return}
    const b=e.target.closest&&e.target.closest('[data-msa-draft-action]');if(!b)return;
    const id=b.getAttribute('data-msa-draft-id');
    if(b.getAttribute('data-msa-draft-action')==='restore')window.msaRestaurarRascunho(id);
    else window.msaIgnorarRascunho(id);
  });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(startDrafts,180));
else setTimeout(startDrafts,180);
})();
