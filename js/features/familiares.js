/* Minha Saúde IA — módulo Familiares V6.29 */
(function(){
'use strict';
const K=window.MSA_K||window.K||{};
const storage=window.MSAStorage;
const KEY=K.familiares||'msa2_familiares',SELECTED='msa2_familiar_selecionado';
function getList(){try{const v=storage.get(KEY);return Array.isArray(v)?v:[]}catch(e){return[]}}
function saveList(v){try{const list=Array.isArray(v)?v:[];const ok=storage.set(KEY,list);if(ok&&window.MSAProfileBridge)window.MSAProfileBridge.publishFamilies(list);if(ok)window.dispatchEvent(new CustomEvent('msa:familiares-atualizados'));return ok}catch(e){return false}}
function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function uid(p){return p+'_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,8)}
function val(id){const x=document.getElementById(id);return x?(x.value||'').trim():''}
function fmtDate(x){if(!x)return'Não informada';const s=String(x).slice(0,10),m=s.match(/^(\d{4})-(\d{2})-(\d{2})$/);return m?m[3]+'/'+m[2]+'/'+m[1]:String(x)}
function selectedId(){try{if(storage&&typeof storage.selectedProfileId==='function')return String(storage.selectedProfileId()||'');const raw=storage&&typeof storage.rawGlobal==='function'?storage.rawGlobal(SELECTED):null;return String(raw?JSON.parse(raw)||'':'')}catch(e){return''}}
function setSelected(id){try{storage.set(SELECTED,id||'')}catch(e){}}
function findMember(id){const wanted=String(id??'');if(!wanted)return null;return getList().find(x=>String(x?.id??'')===wanted)||null}
function ensure(p){p.medicamentos=Array.isArray(p.medicamentos)?p.medicamentos:[];p.consultas=Array.isArray(p.consultas)?p.consultas:[];p.crises=Array.isArray(p.crises)?p.crises:[];return p}
let __msaFamFiltro=window.__msaFamFiltro||'todos';
let __msaFamPendingEdit='';
function instalarEstilosFiltroFamilia(){
 if(document.getElementById('msaFamFilterStyles'))return;
 const s=document.createElement('style');s.id='msaFamFilterStyles';
 s.textContent='.msa-fam-filter{margin:13px 0 4px;padding:12px;border:1px solid #e3e8f0;border-radius:16px;background:#f8fafc}.msa-fam-filter-title{font-size:11px;font-weight:900;color:#64748b;text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px}.msa-fam-filter-buttons{display:flex;gap:7px;overflow-x:auto;padding-bottom:2px}.msa-fam-filter-buttons button{flex:0 0 auto;border:1px solid #dbe3ee;background:#fff;color:#536174;border-radius:999px;padding:9px 12px;font:inherit;font-size:12px;font-weight:900;cursor:pointer;white-space:nowrap}.msa-fam-filter-buttons button.active{background:#eaf1ff;border-color:#9bb8ff;color:#2457c5}.msa-fam-filter-buttons button:active{transform:scale(.98)}@media(max-width:600px){.msa-fam-filter{padding:10px}.msa-fam-filter-buttons{margin-right:-4px}.msa-fam-filter-buttons button{min-height:42px}}';
 document.head.appendChild(s);
}
function instalarFiltroFamilia(){
 instalarEstilosFiltroFamilia();
 const root=document.getElementById('familiares');if(!root)return;
 const card=root.querySelector('.card');if(!card)return;
 let bar=document.getElementById('msaFamiliaFiltro');
 if(!bar){
  bar=document.createElement('div');bar.id='msaFamiliaFiltro';bar.className='msa-fam-filter';
  bar.innerHTML='<div class="msa-fam-filter-title">🔎 Organizar visualização</div><div class="msa-fam-filter-buttons">'+
   '<button type="button" data-fam-filter="todos">📋 Todos</button>'+
   '<button type="button" data-fam-filter="cadastro">👥 Cadastros</button>'+
   '<button type="button" data-fam-filter="consultas">👨‍⚕️ Consultas</button>'+
   '<button type="button" data-fam-filter="medicamentos">💊 Medicamentos</button>'+
   '<button type="button" data-fam-filter="crises">🚨 Crises</button>'+
   '<button type="button" data-fam-filter="ia">🤖 IA e análise</button>'+
   '</div>';
  const intro=card.querySelector('h2')?.parentElement||card.firstElementChild;
  if(intro)intro.after(bar);else card.prepend(bar);
  bar.querySelectorAll('[data-fam-filter]').forEach(btn=>btn.addEventListener('click',()=>{
    __msaFamFiltro=btn.dataset.famFilter;window.__msaFamFiltro=__msaFamFiltro;aplicarFiltroFamilia();
  }));
 }
 aplicarFiltroFamilia();
}
function aplicarFiltroFamilia(){
 const root=document.getElementById('familiares');if(!root)return;
 const f=__msaFamFiltro||'todos';
 root.querySelectorAll('[data-fam-area]').forEach(el=>{
   const area=el.dataset.famArea||'todos';
   el.style.display=(f==='todos'||area==='comum'||area===f)?'':'none';
 });
 const bar=document.getElementById('msaFamiliaFiltro');
 if(bar)bar.querySelectorAll('[data-fam-filter]').forEach(btn=>btn.classList.toggle('active',btn.dataset.famFilter===f));
 const detail=document.getElementById('familiarDetalhe');
 if(detail)detail.style.display=(f==='ia'?'none':'');
}
function instalarEstilosLadoFamiliaCards(){if(document.getElementById('msaFamSideCardStyles'))return;const s=document.createElement('style');s.id='msaFamSideCardStyles';s.textContent='.familiar-person-card{display:flex;flex-direction:column;align-items:stretch;gap:8px;cursor:default;padding:10px}.familiar-person-main{display:flex;align-items:center;gap:10px;text-align:left;width:100%;min-width:0;border:0;background:transparent;padding:2px;color:var(--text);cursor:pointer;font:inherit}.familiar-person-main:focus-visible{outline:2px solid #2563eb;outline-offset:2px;border-radius:8px}.familiar-side-label{display:flex;align-items:center;justify-content:space-between;gap:8px;padding-top:7px;border-top:1px solid #edf0f5;font-size:11px;font-weight:800;color:#64748b}.familiar-side-label select{width:auto;min-width:132px;max-width:58%;margin:0;padding:6px 8px;min-height:34px;border:1px solid #d8e1ef;border-radius:9px;background:#fff;color:#334155;font:inherit;font-size:12px;font-weight:700}.familiar-side-label select:focus{outline:2px solid #93b4ff;outline-offset:1px}@media(max-width:430px){.familiar-side-label{align-items:flex-start;flex-direction:column}.familiar-side-label select{width:100%;max-width:none}}';document.head.appendChild(s)}
function familiaGrau(p){if(p.grauParentesco)return p.grauParentesco;const r=String(p.parentesco||'').toLowerCase();if(/pai|mãe|mae|irm[aã]o|filh/.test(r))return '1º grau';if(/av[oó]|tio|tia|sobrinh/.test(r))return '2º grau';return 'Não informado'}
function familiaStatus(p){return p.statusFamiliar||'Não informado'}
function familiaConds(p){return String([p.condicao,p.obs,p.causaFalecimento].filter(Boolean).join(' '))}
function renderAlertasHistoricoFamiliar(){const home=document.getElementById('home');if(!home)return;let card=document.getElementById('msaFamilyRiskSuggestions');const members=familiaArray();const legacy=(()=>{try{const x=window.MSAStorage?.get(K.fam)||[];return Array.isArray(x)?x:[]}catch(e){return[]}})();const first=members.filter(p=>familiaGrau(p)==='1º grau');const tests=[{label:'hipertensão',re:/hipertens(?:ão|ao|iva|ivo)/i,advice:'Considere conversar com seu profissional de saúde sobre a frequência adequada para monitorar a pressão arterial (por exemplo, ao menos anualmente, conforme orientação clínica).'},{label:'diabetes',re:/diabet(?:e|es|ica|ico)/i,advice:'Converse com seu profissional de saúde sobre prevenção e se/ quando o rastreamento da glicose é indicado para você.'}];const alerts=[];tests.forEach(t=>{const people=first.filter(p=>t.re.test(familiaConds(p)));const old=legacy.filter(p=>t.re.test(String([p.cond,p.info,p.obs].filter(Boolean).join(' ')))&&/pai|mãe|mae|irm[aã]o|filh/i.test(String(p.parente||'')));if(people.length||old.length){const names=[...people.map(p=>p.nome||p.parentesco||'Familiar de 1º grau'),...old.map(p=>p.parente||'Familiar')];alerts.push({label:t.label,names:[...new Set(names)],advice:t.advice})}});if(!alerts.length){if(card)card.remove();return}if(!card){card=document.createElement('div');card.id='msaFamilyRiskSuggestions';card.className='card';card.style.cssText='margin-top:13px;border:1px solid #f4d28a;background:linear-gradient(135deg,#fffbeb,#fff7ed)';const anchor=home.querySelector('.health-dashboard')||home.querySelector('.metric-panel')||home.firstElementChild;if(anchor)anchor.insertAdjacentElement('afterend',card);else home.prepend(card)}card.innerHTML='<div style="display:flex;gap:10px;align-items:flex-start"><span style="font-size:25px">🧬</span><div><div style="font-size:11px;font-weight:900;letter-spacing:.05em;color:#92400e">ATENÇÃO AO HISTÓRICO FAMILIAR</div><h3 style="margin:3px 0 6px">Sugestões para conversar na próxima consulta</h3><p style="margin:0 0 9px;color:#78350f;font-size:12px">Estas sugestões são lembretes organizacionais, não um diagnóstico nem uma avaliação individual de risco.</p>'+alerts.map(a=>'<div style="padding:10px;margin-top:7px;border-radius:12px;background:rgba(255,255,255,.8);border:1px solid #f4d28a"><b>Familiar de 1º grau com '+esc(a.label)+' registrado</b><div style="font-size:12px;color:#78350f;margin-top:3px">Familiar(es): '+esc(a.names.join(', '))+'</div><p style="margin:6px 0 0;font-size:13px;color:#78350f">'+esc(a.advice)+'</p></div>').join('')+'<button type="button" class="btn secondary small" style="margin-top:10px" onclick="if(typeof go===\'function\')go(\'familiares\');else document.getElementById(\'familiares\')?.scrollIntoView({behavior:\'smooth\'})">Revisar histórico familiar →</button></div></div>'}

function parceirosRelacao(p){
 const r=String(p&&p.parentesco||'').toLowerCase();
 return /marido|esposa|cônjuge|conjuge|namorad|companheir|parceir|ficante|relação afetiva|relacao afetiva/.test(r);
}
function renderParceirosSaude(){
 const host=document.getElementById('msaPartnerProfilesList');if(!host)return;
 const list=getList().filter(parceirosRelacao);
 const ativos=list.filter(p=>p.statusRelacionamento!=='Encerrado');
 const encerrados=list.filter(p=>p.statusRelacionamento==='Encerrado');
 const card=function(p,ended){
  const records=(p.medicamentos||[]).length+' medicamento(s) · '+(p.consultas||[]).length+' consulta(s) · '+(p.crises||[]).length+' ocorrência(s)';
  return '<div style="display:flex;gap:12px;align-items:center;justify-content:space-between;flex-wrap:wrap;border:1px solid #e2e8f0;background:#fff;border-radius:14px;padding:13px;margin-top:9px"><div style="flex:1;min-width:190px"><b>'+(p.sexo==='Feminino'?'👩':'👤')+' '+esc(p.nome||'Sem nome')+'</b><div style="font-size:12px;color:#64748b;margin-top:3px">'+esc(p.parentesco||'Relação não informada')+(ended?' · Encerrado':' · Ativo')+'</div><div style="font-size:11px;color:#64748b;margin-top:3px">'+esc(p.condicao||'Condição não informada')+' · '+records+'</div></div><div style="display:flex;gap:7px;flex-wrap:wrap"><button type="button" class="btn secondary small" data-partner-open="'+esc(p.id)+'">👁️ Ver perfil</button><button type="button" class="btn small" data-partner-edit="'+esc(p.id)+'">✏️ Editar perfil</button>'+(ended?'<button type="button" class="btn small" data-partner-reactivate="'+esc(p.id)+'">↩️ Reativar</button>':'<button type="button" class="btn secondary small" data-partner-end="'+esc(p.id)+'">💔 Encerrar relação</button>')+'<button type="button" class="btn red small" data-partner-delete="'+esc(p.id)+'">🗑️ Excluir perfil</button></div></div>';
 };
 host.innerHTML=(ativos.length?'<h4 style="margin:12px 0 4px">💑 Relacionamentos ativos</h4>'+ativos.map(p=>card(p,false)).join(''):'<div class="empty" style="margin-top:10px">Nenhum parceiro(a) cadastrado ainda. Use “Preencher manualmente” ou “Enviar entrevista pelo WhatsApp” acima.</div>')+
 (encerrados.length?'<h4 style="margin:18px 0 4px">🗂️ Relacionamentos encerrados (histórico preservado)</h4><p class="muted" style="margin:0">Esses perfis não aparecem como relacionamentos ativos, mas permanecem em Familiares caso queira consultar seus registros.</p>'+encerrados.map(p=>card(p,true)).join(''):'');
 host.querySelectorAll('[data-partner-open]').forEach(b=>b.addEventListener('click',()=>{
  const id=b.dataset.partnerOpen;
  if(typeof go==='function')go('familiares');
  // A navegação pode redesenhar a ficha e restaurar a pessoa anterior.
  // Reaplica a seleção depois que a seção de Familiares terminar de renderizar.
  [250,600,1100].forEach(delay=>setTimeout(()=>{
   const atual=getList().find(p=>String(p.id)===String(id));
   if(!atual)return;
   setSelected(id);
   if(typeof window.selecionarFamiliar==='function')window.selecionarFamiliar(id);
   else renderFamiliares();
  },delay));
 }));
 host.querySelectorAll('[data-partner-edit]').forEach(b=>b.addEventListener('click',()=>{
   const id=String(b.dataset.partnerEdit||'');
   if(!id||!getList().some(p=>String(p.id)===id)){alert('Não foi possível localizar esse perfil. Atualize a lista e tente novamente.');return}
   __msaFamPendingEdit=id;setSelected(id);
   if(typeof go==='function')go('familiares');
   [80,250,600,1100].forEach(delay=>setTimeout(()=>{
    if(!getList().some(p=>String(p.id)===id))return;
    __msaFamPendingEdit=id;setSelected(id);
    if(typeof window.selecionarFamiliar==='function')window.selecionarFamiliar(id);else renderFamiliares();
    setTimeout(()=>window.focarEdicaoFamiliar&&window.focarEdicaoFamiliar(id),80);
   },delay));
  }));
 host.querySelectorAll('[data-partner-end]').forEach(b=>b.addEventListener('click',()=>window.encerrarRelacionamentoParceiro(b.dataset.partnerEnd)));
 host.querySelectorAll('[data-partner-reactivate]').forEach(b=>b.addEventListener('click',()=>window.reativarRelacionamentoParceiro(b.dataset.partnerReactivate)));
 host.querySelectorAll('[data-partner-delete]').forEach(b=>b.addEventListener('click',()=>window.excluirPerfilParceiro(b.dataset.partnerDelete)));
}
window.encerrarRelacionamentoParceiro=function(id){
 const p=findMember(id);if(!p||!parceirosRelacao(p))return;
 if(!confirm('Encerrar o relacionamento com '+(p.nome||'esta pessoa')+'? O perfil e o histórico de saúde serão mantidos no sistema, mas passarão para “Relacionamentos encerrados”.'))return;
 const all=getList(),person=all.find(x=>x.id===id);if(!person)return;
 person.statusRelacionamento='Encerrado';person.relacionamentoEncerradoEm=new Date().toISOString();
 if(!saveList(all)){alert('Não foi possível atualizar o relacionamento.');return}
 renderParceirosSaude();renderFamiliares();
 alert('💙 Relacionamento encerrado. O perfil e os dados foram preservados no histórico.');
};
window.reativarRelacionamentoParceiro=function(id){
 const p=findMember(id);if(!p||!parceirosRelacao(p))return;
 if(!confirm('Reativar '+(p.nome||'este relacionamento')+' como relacionamento ativo?'))return;
 const all=getList(),person=all.find(x=>x.id===id);if(!person)return;
 person.statusRelacionamento='Ativo';delete person.relacionamentoEncerradoEm;
 if(!saveList(all)){alert('Não foi possível reativar o relacionamento.');return}
 renderParceirosSaude();renderFamiliares();
};
window.excluirPerfilParceiro=function(id){
 const p=findMember(id);if(!p||!parceirosRelacao(p))return;
 if(!confirm('Excluir permanentemente o perfil de '+(p.nome||'esta pessoa')+' e TODOS os registros associados, incluindo medicamentos, consultas e ocorrências? Esta ação não pode ser desfeita. Para apenas encerrar a relação e manter o histórico, escolha “Encerrar relação”.'))return;
 const all=getList().filter(x=>x.id!==id);
 if(!saveList(all)){alert('Não foi possível excluir o perfil.');return}
 if(selectedId()===id)setSelected(all[0]?.id||'');
 renderParceirosSaude();renderFamiliares();
 alert('🗑️ Perfil e registros associados excluídos.');
};

window.focarEdicaoFamiliar=function(id){
  if(id){const p=getList().find(x=>String(x.id)===String(id));if(!p){alert('Não foi possível localizar esse perfil. Atualize a lista e tente novamente.');return}__msaFamPendingEdit=String(p.id);setSelected(p.id);renderFamiliares()}
  setTimeout(function(){
   const form=document.getElementById('familiarBasicEditForm');
   const expected=__msaFamPendingEdit||String(id||'');
   const current=findMember(selectedId());
   if(!form||(expected&&(!current||String(current.id)!==expected))){
    if(expected&&getList().some(p=>String(p.id)===expected)){__msaFamPendingEdit=expected;setSelected(expected);renderFamiliares();setTimeout(()=>window.focarEdicaoFamiliar(expected),120);return}
    alert('Não foi possível abrir o formulário da pessoa selecionada. Tente novamente.');return;
   }
   const details=form.closest('details');if(details)details.open=true;
   form.scrollIntoView({behavior:'smooth',block:'center'});
   const name=form.querySelector('#fbNome');if(name)name.focus({preventScroll:true});
   __msaFamPendingEdit='';
  },100);
};
function instalarAtalhoBuscarFamiliarIA(){
 const host=document.getElementById('familiaCadastroCard'),form=document.getElementById('familiarForm');
 if(!host||!form||document.getElementById('msaFamPromptImportCard'))return;
 const card=document.createElement('div');
 card.id='msaFamPromptImportCard';
 card.setAttribute('role','region');
 card.setAttribute('aria-labelledby','msaFamPromptImportTitle');
 card.style.cssText='border:1px solid #c7d8ff;background:linear-gradient(135deg,#eff6ff,#fff);border-radius:16px;padding:14px;margin:12px 0 16px';
 card.innerHTML='<div style="font-weight:900;color:#1d4ed8">🤖 BUSCAR DADOS COM IA</div>'+
  '<h4 id="msaFamPromptImportTitle" style="margin:5px 0 6px;font-size:16px">Quer puxar os dados de um familiar sem preencher tudo manualmente?</h4>'+
  '<p style="margin:0 0 10px;color:#475569;font-size:13px;line-height:1.5">Gere um prompt pronto para a IA procurar informações familiares que ela realmente consegue acessar e devolver os dados em JSON. Depois, importe a resposta para cadastrar ou atualizar os familiares.</p>'+
  '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:8px">'+
   '<button type="button" id="msaFamPromptImportGenerate" class="btn green">🤖 Gerar prompt para buscar familiares</button>'+
   '<button type="button" id="msaFamPromptImportOpen" class="btn secondary">📥 Já tenho a resposta — importar</button>'+
  '</div>'+
  '<p style="margin:9px 0 0;color:#64748b;font-size:12px;line-height:1.45">Como funciona: 1. Gere e revise o prompt. 2. Copie para o NotebookLM, ChatGPT, Gemini ou Claude. 3. Peça o JSON. 4. Volte e clique em “Já tenho a resposta — importar”. A IA pode não ter acesso a conversas antigas; confira tudo antes de salvar.</p>';
 host.insertBefore(card,form);
 card.querySelector('#msaFamPromptImportGenerate').addEventListener('click',function(){
  if(typeof window.abrirPromptFamiliaIA==='function')window.abrirPromptFamiliaIA('buscar-familiares');
  else alert('O módulo de prompt familiar ainda não carregou. Atualize com Ctrl+F5 e tente novamente.');
 });
 card.querySelector('#msaFamPromptImportOpen').addEventListener('click',function(){
  if(typeof window.abrirImportadorRespostaFamilia==='function')window.abrirImportadorRespostaFamilia();
  else alert('O importador familiar ainda não carregou. Atualize com Ctrl+F5 e tente novamente.');
 });
}
function instalarEstilosPainelGeralFamilia(){
 if(document.getElementById('msaFamilyDashboardStyles'))return;
 const s=document.createElement('style');s.id='msaFamilyDashboardStyles';
 s.textContent='.msa-family-dashboard{margin:10px 0 14px;padding:15px;border:1px solid #dbe5f4;border-radius:18px;background:linear-gradient(135deg,#f8fbff,#f5f7ff)}.msa-family-dashboard-head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px}.msa-family-dashboard-head h4{margin:4px 0;font-size:17px;color:#172554}.msa-family-dashboard-head p{margin:0;color:#64748b;font-size:12px;line-height:1.45}.msa-family-dashboard-live{font-size:10px;white-space:nowrap;font-weight:800;color:#166534;background:#dcfce7;padding:5px 8px;border-radius:99px}.msa-family-dashboard-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px;margin-top:12px}.msa-family-kpi{min-width:0;padding:10px;border:1px solid #e2e8f0;border-radius:13px;background:rgba(255,255,255,.92)}.msa-family-kpi span,.msa-family-kpi small{display:block;color:#64748b;font-size:10px;line-height:1.35}.msa-family-kpi b{display:block;color:#172554;font-size:23px;line-height:1.3;margin:3px 0}.msa-family-kpi.needs-review{border-color:#fcd34d;background:#fffbeb}.msa-family-kpi.needs-review b{color:#92400e}.msa-family-kpi.complete{border-color:#bbf7d0}.msa-family-dashboard-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}.msa-family-dashboard-actions .btn{min-height:40px}.msa-family-dashboard-ok{align-self:center;color:#166534;font-size:12px;font-weight:800}@media(max-width:760px){.msa-family-dashboard{padding:12px}.msa-family-dashboard-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.msa-family-dashboard-head{flex-direction:column}.msa-family-dashboard-live{white-space:normal}.msa-family-kpi:last-child{grid-column:1/-1}}@media(max-width:380px){.msa-family-dashboard-grid{grid-template-columns:1fr}.msa-family-kpi:last-child{grid-column:auto}.msa-family-dashboard-actions{display:grid}.msa-family-dashboard-actions .btn{width:100%}}body.msa-dark .msa-family-dashboard{background:#111827;border-color:#263244}body.msa-dark .msa-family-dashboard-head h4,body.msa-dark .msa-family-kpi b{color:#e5edff}body.msa-dark .msa-family-kpi{background:#0f172a;border-color:#263244}';
 document.head.appendChild(s);
}
function renderPainelGeralFamilia(list){
 const host=document.getElementById('familiaPessoasCard');if(!host)return;
 let panel=document.getElementById('msaFamilyDashboard');
 if(!panel){panel=document.createElement('div');panel.id='msaFamilyDashboard';const title=host.querySelector('h3');if(title)title.insertAdjacentElement('afterend',panel);else host.prepend(panel)}
 const pessoas=Array.isArray(list)?list:[],hoje=new Date();hoje.setHours(0,0,0,0);
 const comCondicao=pessoas.filter(function(p){return !!String(p.condicao||'').trim()||!!String(p.alergias||'').trim()}).length;
 const medicamentos=pessoas.reduce(function(n,p){return n+(Array.isArray(p.medicamentos)?p.medicamentos.length:0)},0);
 const hojeStr=hoje.toISOString().slice(0,10);
 const retornos=pessoas.reduce(function(n,p){return n+(Array.isArray(p.consultas)?p.consultas.filter(function(c){const data=String(c&&((c.retorno&&c.retorno>=hojeStr)?c.retorno:c.data)||'').slice(0,10);if(!data)return false;const d=new Date(data+'T00:00:00');return !Number.isNaN(d.getTime())&&d>=hoje}).length:0)},0);
 const faltam=function(p){return !String(p.parentesco||'').trim()||(!String(p.idade||'').trim()&&!String(p.nasc||'').trim())||!String(p.ladoFamilia||'').trim()};
 const incompletos=pessoas.filter(faltam).length,primeiro=pessoas.find(faltam);
 panel.className='msa-family-dashboard';
 panel.innerHTML='<div class="msa-family-dashboard-head"><div><div class="msa-fam-kicker">📊 VISÃO GERAL</div><h4>Resumo da sua família</h4><p>Veja como estão os cadastros e quais precisam de revisão. Os dados ficam separados do seu perfil pessoal.</p></div><span class="msa-family-dashboard-live">Atualizado agora</span></div>'+
 '<div class="msa-family-dashboard-grid"><div class="msa-family-kpi"><span>👥 Pessoas</span><b>'+pessoas.length+'</b><small>perfis cadastrados</small></div>'+
 '<div class="msa-family-kpi"><span>🩺 Saúde registrada</span><b>'+comCondicao+'</b><small>com condição ou alergia</small></div>'+
 '<div class="msa-family-kpi"><span>💊 Medicamentos</span><b>'+medicamentos+'</b><small>registros nos perfis</small></div>'+
 '<div class="msa-family-kpi"><span>🗓️ Consultas / retornos</span><b>'+retornos+'</b><small>hoje ou em data futura</small></div>'+
 '<div class="msa-family-kpi '+(incompletos?'needs-review':'complete')+'"><span>🧩 Para revisar</span><b>'+incompletos+'</b><small>com dados básicos faltantes</small></div></div>'+
 '<div class="msa-family-dashboard-actions"><button type="button" class="btn green" data-fam-ir="adicionar">➕ Adicionar pessoa</button>'+
 (primeiro?'<button type="button" class="btn secondary" onclick="selecionarFamiliar(\''+esc(primeiro.id)+'\');document.getElementById(\'familiarDetalhe\')?.scrollIntoView({behavior:\'smooth\',block:\'start\'})">🧩 Revisar primeiro cadastro incompleto</button>':'<span class="msa-family-dashboard-ok">✅ Os campos básicos estão preenchidos.</span>')+'</div>';
}

function renderFamiliares(){
 instalarAtalhoBuscarFamiliarIA();
 renderParceirosSaude();
 instalarEstilosLadoFamiliaCards();
 instalarEstilosFamiliaInteligente();
 instalarFiltroFamilia();
 instalarCampoLadoFamilia();
 instalarCamposHistoricoClinicoFamiliar();
 instalarCamposPerfilSaudePessoa();
 renderAlertasHistoricoFamiliar();
 const box=document.getElementById('familiares');if(!box||!box.classList.contains('active'))return;
 const list=getList();renderFamiliaInteligencia();instalarEstilosPainelGeralFamilia();renderPainelGeralFamilia(list);const pending=__msaFamPendingEdit?findMember(__msaFamPendingEdit):null;let sel=pending||findMember(selectedId());if(!sel&&list.length){sel=list[0];setSelected(sel.id)}if(sel){setSelected(sel.id);ensure(sel)}
 const cadastroCard=document.getElementById('familiaCadastroCard');if(cadastroCard)cadastroCard.dataset.famArea='cadastro';
 const pessoasCard=document.getElementById('familiaPessoasCard');if(pessoasCard)pessoasCard.dataset.famArea='cadastro';
 const cards=document.getElementById('familiaresList');
 if(cards){cards.innerHTML=list.length?list.map(p=>'<div class="familiar-person-card '+(sel&&p.id===sel.id?'selected':'')+'"><button type="button" class="familiar-person-main" data-fam-open="'+esc(p.id)+'"><span class="familiar-person-icon">'+(p.sexo==='Feminino'?'👩':'👤')+'</span><span class="familiar-person-info"><b>'+esc(p.nome||'Sem nome')+'</b><small>'+esc(p.parentesco||'Parentesco não informado')+'</small><small>'+esc(p.condicao||'Condição não informada')+'</small></span><span class="familiar-person-count">'+(p.medicamentos||[]).length+' 💊<br>'+(p.consultas||[]).length+' 👨‍⚕️</span></button><label class="familiar-side-label">🧬 Grupo / lado da família<select data-fam-side="'+esc(p.id)+'" aria-label="Grupo ou lado da família de '+esc(p.nome||'familiar')+'"><option value="" '+(!p.ladoFamilia?'selected':'')+'>Não informado</option><option value="Núcleo próximo" '+(p.ladoFamilia==='Núcleo próximo'?'selected':'')+'>Núcleo próximo</option><option value="Materno" '+(familiaLado(p)==='Materno'?'selected':'')+'>Materno</option><option value="Paterno" '+(familiaLado(p)==='Paterno'?'selected':'')+'>Paterno</option><option value="Afinidade" '+(p.vinculoFamilia==='Afinidade'||p.ladoFamilia==='Afinidade'?'selected':'')+'>Parente por afinidade</option><option value="Outro" '+(p.ladoFamilia==='Outro'?'selected':'')+'>Outro</option><option value="Ambos" '+(['Ambos','Ambos / não sei'].includes(p.ladoFamilia)?'selected':'')+'>Ambos os lados (materno e paterno)</option><option value="Ambos / não sei" '+(p.ladoFamilia==='Ambos / não sei'?'selected':'')+'>Ambos / não sei (legado)</option></select></label></div>').join(''):'<div class="empty">Nenhum familiar cadastrado ainda.</div>';cards.querySelectorAll('[data-fam-open]').forEach(btn=>btn.addEventListener('click',()=>window.selecionarFamiliar(btn.dataset.famOpen)));cards.querySelectorAll('[data-fam-side]').forEach(select=>select.addEventListener('change',()=>window.atualizarLadoFamiliar(select.dataset.famSide,select.value)));}
 const detail=document.getElementById('familiarDetalhe');if(!detail)return;
 if(!sel){detail.innerHTML='<div class="empty">👨‍👩‍👧‍👦 Selecione um familiar ou cadastre o primeiro acima.</div>';return}
 const meds=sel.medicamentos||[],cons=sel.consultas||[],crises=sel.crises||[];
 detail.innerHTML='<div class="familiar-detail-head" data-fam-area="comum"><div><div class="familiar-kicker">PESSOA ACOMPANHADA</div><h2>👤 '+esc(sel.nome||'Sem nome')+'</h2><div class="muted">'+esc(sel.parentesco||'Parentesco não informado')+(sel.idade?' · '+esc(sel.idade)+' anos':'')+'</div></div><div class="row"><button type="button" class="btn secondary small" onclick="copiarResumoFamiliar(\''+esc(sel.id)+'\')">📋 Copiar resumo</button><button type="button" class="btn small" onclick="perguntarIAFamiliar(\''+esc(sel.id)+'\')">🤖 Perguntar à IA</button><button type="button" class="btn red small" onclick="excluirFamiliar(\''+esc(sel.id)+'\')">🗑️ Excluir</button></div></div>'+
 '<div class="familiar-alert" data-fam-area="comum"><b>🧠 '+esc(sel.condicao||'Condição de saúde não informada')+'</b><br><span>'+esc(sel.obs||'Use esta área para organizar o cuidado.')+'</span></div>'+
 '<div class="familiar-summary-grid" data-fam-area="comum"><div><span>🎂 Nascimento</span><b>'+esc(fmtDate(sel.nasc))+'</b></div><div><span>🩸 Sangue</span><b>'+esc(sel.sangue||'Não informado')+'</b></div><div><span>🚨 Alergias</span><b>'+esc(sel.alergias||'Não informado')+'</b></div><div><span>📞 Contato</span><b>'+esc(sel.contato||'Não informado')+'</b></div></div>'+ '<div class="card familiar-subcard" data-fam-area="comum" style="margin-top:12px"><h3>🩺 Perfil de saúde da pessoa</h3><p class="muted">Informações opcionais sobre medidas, rotina e medicamentos relatados. Confirme os dados com a própria pessoa sempre que possível.</p><form id="familiarHealthProfileForm"><div class="grid2"><label>Altura (cm)<input id="fhAltura" type="number" min="30" max="250" value="'+esc(sel.altura||'')+'"></label><label>Peso atual (kg)<input id="fhPeso" type="number" min="1" max="500" step="0.1" value="'+esc(sel.peso||'')+'"></label></div><label>Medidas corporais<textarea id="fhMedidas">'+esc(sel.medidas||'')+'</textarea></label><label>Rotina e atividade física<textarea id="fhRotina">'+esc(sel.rotina||'')+'</textarea></label><label>Medicamentos, vitaminas ou suplementos relatados<textarea id="fhMeds">'+esc(sel.medicamentosRelato||'')+'</textarea></label><button class="btn green">💾 Salvar perfil de saúde</button></form></div>'+
 '<details data-fam-area="comum" style="margin-top:13px;border:1px solid #e3e8f0;border-radius:15px;padding:11px;background:#fbfdff"><summary style="cursor:pointer;font-weight:900">📦 Ver todos os dados importados da IA</summary><pre style="white-space:pre-wrap;word-break:break-word;background:#f8fafc;border:1px solid #e5eaf2;border-radius:12px;padding:12px;margin-top:10px;font-size:12px;line-height:1.45">'+esc(JSON.stringify(sel.dadosImportadosIA||sel,null,2))+'</pre></details>'+
 '<div class="familiar-grid">'+
 '<div class="card familiar-subcard" data-fam-area="medicamentos"><h3>💊 Medicamentos</h3><div class="muted">Nome, dose, horário e observações.</div><form id="familiarMedForm" style="margin-top:10px"><div class="grid2"><label>Medicamento<input id="fMedNome" required></label><label>Dose<input id="fMedDose"></label></div><div class="grid2"><label>Horário<input id="fMedHora" type="time"></label><label>Frequência<input id="fMedFreq"></label></div><label>Prescrito por<input id="fMedPres"></label><label>Observações<textarea id="fMedObs"></textarea></label><button class="btn">💾 Adicionar medicamento</button></form><div class="list" style="margin-top:12px">'+(meds.length?meds.slice().reverse().map(x=>'<div class="item"><div class="itemtop"><b>💊 '+esc(x.nome)+'</b><button type="button" class="btn red small" onclick="excluirRegistroFamiliar(\''+esc(sel.id)+'\',\'medicamentos\',\''+esc(x.id)+'\')">Excluir</button></div><p>'+esc(x.dose||'Dose não informada')+(x.hora?' · '+esc(x.hora):'')+(x.frequencia?' · '+esc(x.frequencia):'')+'<br>'+esc(x.prescritoPor||'')+'<br>'+esc(x.obs||'')+'</p></div>').join(''):'<div class="empty">Nenhum medicamento registrado.</div>')+'</div></div>'+
 '<div class="card familiar-subcard" data-fam-area="consultas"><h3>👨‍⚕️ Consultas</h3><div class="muted">Consultas, retornos e orientações.</div><form id="familiarConsultaForm" style="margin-top:10px"><div class="grid2"><label>Data<input id="fConData" type="date" required></label><label>Especialidade<input id="fConEsp" required></label></div><div class="grid2"><label>Médico<input id="fConMed"></label><label>Próximo retorno<input id="fConRet" type="date"></label></div><label>Motivo<textarea id="fConMot"></textarea></label><label>Orientações recebidas<textarea id="fConObs"></textarea></label><button class="btn">💾 Registrar consulta</button></form><div class="list" style="margin-top:12px">'+(cons.length?cons.slice().reverse().map(x=>'<div class="item"><div class="itemtop"><b>👨‍⚕️ '+esc(x.especialidade||'Consulta')+'</b><span class="tag">'+esc(fmtDate(x.data))+'</span></div><p>'+esc(x.medico||'Médico não informado')+'<br>'+esc(x.motivo||'')+(x.retorno?'<br>Retorno: '+esc(fmtDate(x.retorno)):'')+'<br>'+esc(x.obs||'')+'</p><button type="button" class="btn red small" onclick="excluirRegistroFamiliar(\''+esc(sel.id)+'\',\'consultas\',\''+esc(x.id)+'\')">Excluir</button></div>').join(''):'<div class="empty">Nenhuma consulta registrada.</div>')+'</div></div></div>'+
 '<div class="card familiar-subcard" data-fam-area="crises" style="margin-top:13px"><h3>🚨 Crises / intercorrências</h3><div class="muted">Registre objetivamente o que aconteceu, possíveis gatilhos e o atendimento realizado.</div><form id="familiarCriseForm" style="margin-top:10px"><div class="grid2"><label>Data<input id="fCriData" type="date" required></label><label>Hora<input id="fCriHora" type="time"></label></div><div class="grid2"><label>Tipo<select id="fCriTipo"><option>Alteração de comportamento</option><option>Agitação</option><option>Confusão</option><option>Esquecimento acentuado</option><option>Agressividade</option><option>Queda</option><option>Outro</option></select></label><label>Intensidade<select id="fCriInt"><option>Leve</option><option>Moderada</option><option>Intensa</option><option>Risco imediato</option></select></label></div><label>O que aconteceu?<textarea id="fCriDesc" required></textarea></label><label>Possível gatilho<input id="fCriGatilho"></label><label>Conduta / atendimento recebido<textarea id="fCriConduta"></textarea></label><button class="btn">💾 Registrar ocorrência</button></form><div class="list" style="margin-top:12px">'+(crises.length?crises.slice().reverse().map(x=>'<div class="item '+(x.intensidade==='Risco imediato'?'danger':'')+'"><div class="itemtop"><b>🚨 '+esc(x.tipo||'Ocorrência')+'</b><span class="tag">'+esc(fmtDate(x.data))+(x.hora?' · '+esc(x.hora):'')+'</span></div><p><b>Intensidade:</b> '+esc(x.intensidade||'Não informada')+'<br>'+esc(x.descricao||'')+(x.gatilho?'<br><b>Possível gatilho:</b> '+esc(x.gatilho):'')+(x.conduta?'<br><b>Conduta/atendimento:</b> '+esc(x.conduta):'')+'</p><button type="button" class="btn red small" onclick="excluirRegistroFamiliar(\''+esc(sel.id)+'\',\'crises\',\''+esc(x.id)+'\')">Excluir</button></div>').join(''):'<div class="empty">Nenhuma crise ou intercorrência registrada.</div>')+'</div></div>';

const basicEdit=document.createElement('details');basicEdit.open=true;basicEdit.className='card familiar-subcard';basicEdit.dataset.famArea='comum';basicEdit.style.cssText='margin:12px 0;border:1px solid #bfdbfe;border-radius:16px;padding:13px;background:#f8fbff';
const relChoices=['Marido','Esposa','Cônjuge','Namorado(a)','Namorado','Namorada','Companheiro(a)','Companheiro','Companheira','Parceiro(a)','Parceiro','Parceira','Ficante','Outra relação afetiva','Filho(a)','Pai','Mãe','Irmão/irmã','Avô/avó','Tio/tia','Outro'];
if(sel.parentesco&&!relChoices.includes(sel.parentesco))relChoices.unshift(sel.parentesco);
const relationOptions=relChoices.map(function(rel){return '<option value="'+esc(rel)+'" '+(rel===sel.parentesco?'selected':'')+'>'+esc(rel)+'</option>'}).join('');
const sexChoices=['','Masculino','Feminino','Outro','Não informado'];
const sexOptions=sexChoices.map(function(sex){return '<option value="'+esc(sex)+'" '+(sex===String(sel.sexo||'')?'selected':'')+'>'+(sex||'Não informado')+'</option>'}).join('');
const bloodChoices=['','A+','A-','B+','B-','AB+','AB-','O+','O-','Não informado'];
const bloodOptions=bloodChoices.map(function(b){return '<option value="'+esc(b)+'" '+(b===String(sel.sangue||'')?'selected':'')+'>'+(b||'Não informado')+'</option>'}).join('');
basicEdit.innerHTML='<summary style="cursor:pointer;font-weight:900;font-size:16px;list-style:none">✏️ Editar dados pessoais <span style="float:right;color:#2563eb">Abrir / fechar ▾</span></summary><p class="muted" style="margin:7px 0 12px">Edite nome, relação, nascimento, alergias e outras informações desta pessoa. Medicamentos e consultas cadastrados são mantidos.</p><form id="familiarBasicEditForm"><div class="grid2"><label>Nome<input id="fbNome" required value="'+esc(sel.nome||'')+'"></label><label>Relação<select id="fbRelacao">'+relationOptions+'</select></label></div><div class="grid2"><label>Sexo<select id="fbSexo">'+sexOptions+'</select></label><label>Data de nascimento<input id="fbNasc" type="date" value="'+esc(sel.nasc||'')+'"></label></div><div class="grid2"><label>Idade<input id="fbIdade" type="number" min="0" max="130" value="'+esc(sel.idade||'')+'"></label><label>Tipo sanguíneo<select id="fbSangue">'+bloodOptions+'</select></label></div><label>🧠 Condição principal<input id="fbCondicao" value="'+esc(sel.condicao||'')+'" placeholder="Ex.: condição conhecida (opcional)"></label><label>🚨 Alergias<textarea id="fbAlergias" placeholder="Medicamentos, alimentos ou outras alergias">'+esc(sel.alergias||'')+'</textarea></label><label>📞 Contato / responsável<input id="fbContato" value="'+esc(sel.contato||'')+'" placeholder="Opcional"></label><label>📌 Observações importantes<textarea id="fbObs" placeholder="Informações úteis para consultas e cuidados">'+esc(sel.obs||'')+'</textarea></label><button class="btn green" type="submit" style="width:100%">💾 Salvar alterações</button><div class="muted" style="font-size:11px;margin-top:6px">Salvar altera apenas este perfil. Seus outros perfis não serão modificados.</div></form>';
const profileSummary=detail.querySelector('.familiar-summary-grid');
if(profileSummary)profileSummary.insertAdjacentElement('afterend',basicEdit);
const bf=basicEdit.querySelector('#familiarBasicEditForm');
if(bf)bf.onsubmit=function(e){
 e.preventDefault();
 const all=getList(),person=all.find(x=>String(x?.id??'')===String(sel?.id??''));if(!person)return;
 const name=val('fbNome').trim();if(!name){alert('Informe o nome da pessoa.');return}
 person.nome=name;person.parentesco=val('fbRelacao');person.sexo=val('fbSexo');person.nasc=val('fbNasc');person.idade=val('fbIdade');person.sangue=val('fbSangue');person.condicao=val('fbCondicao');person.alergias=val('fbAlergias');person.contato=val('fbContato');person.obs=val('fbObs');
 if(!saveList(all)){alert('Não foi possível salvar as alterações.');return}
 setSelected(person.id);renderFamiliares();alert('✅ Dados da pessoa atualizados.');
};

const edit=document.createElement('div');edit.className='card familiar-subcard';edit.dataset.famArea='comum';edit.style.margin='12px 0';edit.innerHTML='<h3>🧬 Histórico familiar e risco hereditário</h3><p class="muted">Atualize os dados deste familiar. Campos não conhecidos podem ficar em branco.</p><form id="familiarClinicalEditForm"><div class="grid2"><label>Grau de parentesco<select id="feGrau"><option value="" '+(!sel.grauParentesco?'selected':'')+'>Não informado</option><option value="1º grau" '+(familiaGrau(sel)==='1º grau'?'selected':'')+'>1º grau — pais, irmãos e filhos</option><option value="2º grau" '+(familiaGrau(sel)==='2º grau'?'selected':'')+'>2º grau — avós/netos e outros</option><option value="3º grau ou outro" '+(sel.grauParentesco==='3º grau ou outro'?'selected':'')+'>3º grau ou outro</option></select></label><label>Os pais deste familiar são parentes de sangue entre si?<small style="display:block;font-weight:500;line-height:1.4;margin:4px 0 6px;color:var(--muted,#64748b)">Consanguinidade significa que os pais da pessoa têm parentesco biológico entre si, por exemplo, são primos. Não se refere ao parentesco entre você e este familiar.</small><select id="feCons"><option value="Não informado" '+(!sel.consanguinidade||sel.consanguinidade==='Não informado'?'selected':'')+'>Não sei / não informado</option><option value="Sim" '+(sel.consanguinidade==='Sim'?'selected':'')+'>Sim — os pais são parentes biológicos (ex.: primos)</option><option value="Não" '+(sel.consanguinidade==='Não'?'selected':'')+'>Não — os pais não são parentes biológicos conhecidos</option></select></label><label>Idade aproximada no diagnóstico<input id="feDiagAge" type="number" min="0" max="130" value="'+esc(sel.idadeDiagnostico||'')+'" placeholder="Ex.: 42"></label><label>Situação do familiar<select id="feStatus"><option value="Não informado" '+(!sel.statusFamiliar||sel.statusFamiliar==='Não informado'?'selected':'')+'>Não informado</option><option value="Vivo" '+(sel.statusFamiliar==='Vivo'?'selected':'')+'>Vivo</option><option value="Falecido" '+(sel.statusFamiliar==='Falecido'?'selected':'')+'>Falecido</option></select></label><label style="grid-column:1/-1">Causa do falecimento (se aplicável)<input id="feCause" value="'+esc(sel.causaFalecimento||'')+'" placeholder="Ex.: infarto, câncer, causa desconhecida"></label></div><button class="btn green" style="margin-top:10px">💾 Salvar histórico familiar</button></form>';const familyGrid=detail.querySelector('.familiar-grid');if(familyGrid)familyGrid.before(edit);const ef=edit.querySelector('#familiarClinicalEditForm');if(ef)ef.onsubmit=e=>{e.preventDefault();const all=getList(),person=all.find(x=>String(x?.id??'')===String(sel?.id??''));if(!person)return;person.grauParentesco=val('feGrau');person.consanguinidade=val('feCons');person.idadeDiagnostico=val('feDiagAge');person.statusFamiliar=val('feStatus');person.causaFalecimento=val('feCause');if(!saveList(all)){alert('Não foi possível salvar o histórico.');return}setSelected(person.id);renderFamiliares();alert('Histórico familiar atualizado.')};
 const hp=document.getElementById('familiarHealthProfileForm');if(hp)hp.onsubmit=e=>{e.preventDefault();const all=getList(),person=all.find(x=>String(x?.id??'')===String(sel?.id??''));if(!person)return;person.altura=val('fhAltura');person.peso=val('fhPeso');person.medidas=val('fhMedidas');person.rotina=val('fhRotina');person.medicamentosRelato=val('fhMeds');if(!saveList(all)){alert('Não foi possível salvar o perfil de saúde.');return}setSelected(person.id);renderFamiliares();alert('✅ Perfil de saúde atualizado.');};
 bindForms(sel.id);
}
function bindForms(id){
 const m=document.getElementById('familiarMedForm');if(m)m.onsubmit=e=>{e.preventDefault();addRecord(id,'medicamentos',{nome:val('fMedNome'),dose:val('fMedDose'),hora:val('fMedHora'),frequencia:val('fMedFreq'),prescritoPor:val('fMedPres'),obs:val('fMedObs')})};
 const c=document.getElementById('familiarConsultaForm');if(c)c.onsubmit=e=>{e.preventDefault();addRecord(id,'consultas',{data:val('fConData'),especialidade:val('fConEsp'),medico:val('fConMed'),retorno:val('fConRet'),motivo:val('fConMot'),obs:val('fConObs')})};
 const cr=document.getElementById('familiarCriseForm');if(cr)cr.onsubmit=e=>{e.preventDefault();addRecord(id,'crises',{data:val('fCriData'),hora:val('fCriHora'),tipo:val('fCriTipo'),intensidade:val('fCriInt'),descricao:val('fCriDesc'),gatilho:val('fCriGatilho'),conduta:val('fCriConduta')})};
}
function addRecord(memberId,type,data){const list=getList(),p=list.find(x=>x.id===memberId);if(!p)return;ensure(p);p[type].push(Object.assign({id:uid(type.slice(0,3)),criadoEm:new Date().toISOString()},data));if(!saveList(list)){alert('Não foi possível salvar.');return}setSelected(memberId);renderFamiliares()}
window.atualizarLadoFamiliar=function(id,lado){const list=getList(),p=list.find(x=>x.id===id);if(!p)return;p.ladoFamilia=String(lado||'');if(lado==='Afinidade'){p.vinculoFamilia='Afinidade';p.consanguinidade='Não';p.vinculoLadoPendente=false;}else if(['Materno','Paterno','Núcleo próximo','Ambos'].includes(lado)){p.vinculoFamilia='Consanguíneo';p.consanguinidade='Sim';p.vinculoLadoPendente=false;p.observacaoVinculoPendencia='';}if(!saveList(list)){alert('Não foi possível salvar o grupo/lado da família.');return}setSelected(selectedId()||id);renderFamiliares();};
function atualizarAppAposSelecaoFamiliar(){
 // Recarrega os componentes que leem o perfil ativo, sem trocar a tela atual.
 try{if(typeof window.loadProfile==='function')window.loadProfile()}catch(e){console.warn('[Minha Saúde IA] Não foi possível atualizar o formulário do perfil:',e)}
 try{if(typeof window.renderCarteirinha==='function')window.renderCarteirinha()}catch(e){}
 try{if(typeof window.renderNovosModulos==='function')window.renderNovosModulos()}catch(e){}
 try{if(typeof window.atualizarSaudeReprodutiva==='function')window.atualizarSaudeReprodutiva()}catch(e){}
 try{if(typeof window.aplicarPreferencias==='function')window.aplicarPreferencias()}catch(e){}
 try{window.dispatchEvent(new CustomEvent('msa:perfil-selecionado',{detail:{id:selectedId()}}))}catch(e){}
}
window.selecionarFamiliar=id=>{
 const pessoa=getList().find(p=>String(p.id)===String(id));
 if(!pessoa){console.warn('[Minha Saúde IA] Perfil familiar não encontrado:',id);return}
 setSelected(pessoa.id);
 atualizarAppAposSelecaoFamiliar();
 renderFamiliares();
 // Confirma que a seleção sobrevive ao redesenho da lista e mantém a tela sincronizada.
 setTimeout(()=>{
  const selecionado=getList().find(p=>String(p.id)===String(selectedId()));
  if(!selecionado||String(selecionado.id)!==String(pessoa.id)){
   setSelected(pessoa.id);
   atualizarAppAposSelecaoFamiliar();
   renderFamiliares();
  }
  document.getElementById('familiarDetalhe')?.scrollIntoView({behavior:'smooth',block:'start'});
 },80);
};
window.excluirFamiliar=id=>{const p=findMember(id);if(!p)return;if(!confirm('Excluir '+(p.nome||'este familiar')+' e todos os registros dele?'))return;const list=getList().filter(x=>x.id!==id);saveList(list);if(selectedId()===id)setSelected(list[0]?.id||'');renderFamiliares()};
window.excluirRegistroFamiliar=(memberId,type,recordId)=>{const list=getList(),p=list.find(x=>x.id===memberId);if(!p)return;ensure(p);p[type]=p[type].filter(x=>x.id!==recordId);saveList(list);setSelected(memberId);renderFamiliares()};
window.copiarResumoFamiliar=id=>{const p=findMember(id);if(!p)return;ensure(p);const t=['RESUMO DO FAMILIAR','Nome: '+(p.nome||'Não informado'),'Parentesco: '+(p.parentesco||'Não informado'),'Grau de parentesco: '+(p.grauParentesco||familiaGrau(p)),'Consanguinidade conhecida: '+(p.consanguinidade||'Não informado'),'Status: '+(p.statusFamiliar||'Não informado'),'Idade ao diagnóstico: '+(p.idadeDiagnostico||'Não informada'),'Causa do falecimento: '+(p.causaFalecimento||'Não informada'),'Idade: '+(p.idade||'Não informada'),'Altura (cm): '+(p.altura||'Não informada'),'Peso (kg): '+(p.peso||'Não informado'),'Medidas corporais: '+(p.medidas||'Não informadas'),'Rotina/atividade física: '+(p.rotina||'Não informada'),'Medicamentos/vitaminas/suplementos relatados: '+(p.medicamentosRelato||'Não informados'),'Condição: '+(p.condicao||'Não informada'),'Alergias: '+(p.alergias||'Não informadas'),'Medicamentos:',...(p.medicamentos.length?p.medicamentos.map(x=>'- '+x.nome+(x.dose?' — '+x.dose:'')+(x.frequencia?' — '+x.frequencia:'')):['- Nenhum registrado']),'Consultas:',...(p.consultas.length?p.consultas.map(x=>'- '+fmtDate(x.data)+' — '+(x.especialidade||'Consulta')+' — '+(x.medico||'Não informado')):['- Nenhuma registrada']),'Crises:',...(p.crises.length?p.crises.map(x=>'- '+fmtDate(x.data)+' — '+(x.tipo||'Ocorrência')+' — '+(x.intensidade||'')+' — '+(x.descricao||'')):['- Nenhuma registrada'])].join('\n');if(navigator.clipboard?.writeText)navigator.clipboard.writeText(t).then(()=>alert('📋 Resumo copiado.')).catch(()=>fallback(t));else fallback(t)};
window.perguntarIAFamiliar=id=>{const p=findMember(id);if(!p)return;ensure(p);const t=['COMANDO — PERGUNTAR À IA SOBRE ESTE FAMILIAR','','Atue como um assistente de saúde responsável. Analise EXCLUSIVAMENTE as informações deste familiar abaixo. Não invente dados, não faça diagnóstico e deixe claro quando uma informação estiver ausente.','','FAMILIAR','Nome: '+(p.nome||'Não informado'),'Parentesco: '+(p.parentesco||'Não informado'),'Grau de parentesco: '+(p.grauParentesco||familiaGrau(p)),'Consanguinidade: '+(p.consanguinidade||'Não informado'),'Status: '+(p.statusFamiliar||'Não informado'),'Idade aproximada no diagnóstico: '+(p.idadeDiagnostico||'Não informada'),'Causa do falecimento: '+(p.causaFalecimento||'Não informada'),'Sexo: '+(p.sexo||'Não informado'),'Nascimento: '+fmtDate(p.nasc),'Idade: '+(p.idade||'Não informada'),'Altura (cm): '+(p.altura||'Não informada'),'Peso (kg): '+(p.peso||'Não informado'),'Medidas corporais: '+(p.medidas||'Não informadas'),'Rotina/atividade física: '+(p.rotina||'Não informada'),'Medicamentos/vitaminas/suplementos relatados: '+(p.medicamentosRelato||'Não informados'),'Tipo sanguíneo: '+(p.sangue||'Não informado'),'Condição principal: '+(p.condicao||'Não informada'),'Alergias: '+(p.alergias||'Não informadas'),'Contato/responsável: '+(p.contato||'Não informado'),'Observações: '+(p.obs||'Não informadas'),'','MEDICAMENTOS:',...(p.medicamentos.length?p.medicamentos.map(x=>'- '+x.nome+(x.dose?' — dose: '+x.dose:'')+(x.hora?' — horário: '+x.hora:'')+(x.frequencia?' — frequência: '+x.frequencia:'')+(x.prescritoPor?' — prescrito por: '+x.prescritoPor:'')+(x.obs?' — '+x.obs:'')):['- Nenhum registrado']),'','CONSULTAS:',...(p.consultas.length?p.consultas.map(x=>'- '+fmtDate(x.data)+' — '+(x.especialidade||'Consulta')+(x.medico?' — médico: '+x.medico:'')+(x.retorno?' — retorno: '+fmtDate(x.retorno):'')+(x.motivo?' — motivo: '+x.motivo:'')+(x.obs?' — orientações: '+x.obs:'')):['- Nenhuma registrada']),'','CRISES / INTERCORRÊNCIAS:',...(p.crises.length?p.crises.map(x=>'- '+fmtDate(x.data)+(x.hora?' às '+x.hora:'')+' — '+(x.tipo||'Ocorrência')+' — intensidade: '+(x.intensidade||'não informada')+' — '+(x.descricao||'')+(x.gatilho?' — possível gatilho: '+x.gatilho:'')+(x.conduta?' — conduta/atendimento: '+x.conduta:'')):['- Nenhuma registrada']),'','TAREFA PARA A IA','1. Resuma o estado de saúde deste familiar de forma clara.','2. Destaque informações importantes que merecem atenção.','3. Aponte quais informações estão faltando ou precisam ser atualizadas.','4. Sugira perguntas úteis para levar ao médico, quando apropriado.','5. Se houver sinais de alerta nos dados registrados, destaque-os sem alarmismo e oriente procurar avaliação profissional.','6. Não misture informações do meu perfil ou de outros familiares.'].join('\\n');if(navigator.clipboard?.writeText)navigator.clipboard.writeText(t).then(()=>alert('🤖 Comando do familiar copiado. Agora é só colar na IA.')).catch(()=>fallbackIAFamiliar(t));else fallbackIAFamiliar(t)};
function fallbackIAFamiliar(t){const a=document.createElement('textarea');a.value=t;document.body.appendChild(a);a.select();try{document.execCommand('copy');alert('🤖 Comando do familiar copiado. Agora é só colar na IA.')}catch(e){}a.remove()}
function fallback(t){const a=document.createElement('textarea');a.value=t;document.body.appendChild(a);a.select();try{document.execCommand('copy');alert('📋 Resumo copiado.')}catch(e){}a.remove()}
/* V5.87 — Inteligência Familiar: Ava + mapa + padrões */
function familiaArray(){const a=getList();return Array.isArray(a)?a.map(ensure):[]}
function familiaCondicaoTexto(p){return String(p.condicao||'').trim()}
function familiaLado(p){if(p.ladoFamilia)return p.ladoFamilia;const s=(String(p.parentesco||'')+' '+String(p.obs||'')).toLowerCase();if(/materna|materno/.test(s))return 'Materno';if(/paterna|paterno/.test(s))return 'Paterno';return 'Não informado'}
function familiaIdade(p){if(p.idade!==undefined&&p.idade!==null&&String(p.idade).trim()!=='')return String(p.idade);if(p.nasc){const n=new Date(String(p.nasc).slice(0,10)+'T12:00:00'),h=new Date();if(!isNaN(n.getTime())){let a=h.getFullYear()-n.getFullYear();if((h.getMonth()+1)*100+h.getDate()<(n.getMonth()+1)*100+n.getDate())a--;return String(Math.max(0,a))}}return ''}
function familiaPatterns(list){const defs=[['Diabetes',/\bdiabet(?:e|es|ica|ico|icos|icas)\b/i],['Hipertensão',/\bhipertens(?:ão|ao|ivo|iva|ivos|ivas)\b/i],['Doenças cardíacas',/\b(infarto|cardíac|coronar|insufici[eê]ncia card|angina)\b/i],['AVC',/\b(avc|acidente vascular cerebral|derrame)\b/i],['Câncer',/\b(câncer|cancer|tumor|neoplas)\b/i],['Colesterol',/\b(colesterol|dislipidem)\b/i],['Tireoide',/\b(tireoide|hipotireoid|hipertireoid)\b/i],['Doença renal',/\b(renal|rim|insufici[eê]ncia renal)\b/i],['Doença hepática',/\b(fígado|figado|hepat|cirrose)\b/i],['Autoimune / reumatológica',/\b(autoimun|artrite|lúpus|lupus|psorías|psorias|espondil|reumat)\b/i],['Demência / Alzheimer',/\b(demência|demencia|alzheimer|parkinson)\b/i],['Saúde mental',/\b(depress[aã]o|ansiedade|bipolar|esquizofren|transtorno mental)\b/i]];return defs.map(d=>{const members=list.filter(p=>p.vinculoFamilia!=='Afinidade'&&p.ladoFamilia!=='Afinidade'&&d[1].test(familiaCondicaoTexto(p)+' '+String(p.obs||'')));return {nome:d[0],count:members.length,members}}).filter(x=>x.count>0).sort((a,b)=>b.count-a.count||a.nome.localeCompare(b.nome))}
function normalizarChaveVinculoFamilia(v){return String(v==null?'':v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'')}
function acrescentarCondicaoSeFaltar(p,frase,padroes){const todos=normalizarChaveVinculoFamilia(JSON.stringify(p));if(padroes.some(re=>re.test(todos)))return false;const atual=String(p.condicao||'').trim().replace(/[;,\s]+$/,'');p.condicao=(atual?atual+'; ':'')+frase;return true}
function atualizarCampoSeDiferente(p,chave,valor){if(p[chave]===valor)return false;p[chave]=valor;return true}
window.aplicarCorrecoesVinculosFamilia=function(){
 const lista=getList();if(!Array.isArray(lista)||!lista.length){alert('Não há familiares cadastrados para atualizar.');return}
 if(!confirm('Aplicar as atualizações solicitadas a Rita, Paulo Mendes e Gordo?\n\n• Rita: núcleo próximo e consanguínea.\n• Paulo Mendes: separar como parente por afinidade, fora dos padrões genéticos.\n• Gordo: manter Mal de Parkinson e deixar o lado pendente até confirmar se é tio paterno ou materno.\n\nAs informações existentes serão preservadas; só serão acrescentados dados ausentes.'))return;
 let alterados=0;const relatorio=[];
 function localizar(nome){const chave=normalizarChaveVinculoFamilia(nome);return lista.filter(p=>normalizarChaveVinculoFamilia(p.nome)===chave)}
 function executar(nome,acao){
  const achados=localizar(nome);
  if(achados.length===0){relatorio.push('⚠️ '+nome+': não encontrado pelo nome exato; nenhum cadastro foi criado.');return}
  if(achados.length!==1){relatorio.push('⚠️ '+nome+': há '+achados.length+' cadastros com esse nome; não alterei para evitar escolher a pessoa errada.');return}
  const p=achados[0];let n=0;acao(p,()=>{n++});alterados+=n;
  relatorio.push((n?'✅ ':'ℹ️ ')+nome+': '+(n?'atualizado':'já estava conforme')+'.');
 }
 executar('Rita',function(p,mark){
  if(atualizarCampoSeDiferente(p,'parentesco','Irmã'))mark();
  if(atualizarCampoSeDiferente(p,'ladoFamilia','Núcleo próximo'))mark();
  if(atualizarCampoSeDiferente(p,'vinculoFamilia','Consanguíneo'))mark();
  if(atualizarCampoSeDiferente(p,'vinculoDetalhe','Irmã consanguínea'))mark();
  if(atualizarCampoSeDiferente(p,'consanguinidade','Sim'))mark();
  if(atualizarCampoSeDiferente(p,'vinculoLadoPendente',false))mark();
  if(acrescentarCondicaoSeFaltar(p,'Constipação crônica severa',[/constipacaocronicasevera/]))mark();
  if(acrescentarCondicaoSeFaltar(p,'Histórico de pedra nos rins (cirurgia prévia)',[/pedranosrins|calculorenal|nefrolitiase/]))mark();
  if(acrescentarCondicaoSeFaltar(p,'Cirurgia prévia para hiperidrose palmar',[/hiperidrose.{0,20}palmar|palmar.{0,20}hiperidrose/]))mark();
  if(acrescentarCondicaoSeFaltar(p,'Cirurgia bariátrica prévia',[/cirurgiabariatricaprevia|bariatricaprevia/]))mark();
 });
 executar('Paulo Mendes',function(p,mark){
  if(atualizarCampoSeDiferente(p,'vinculoFamilia','Afinidade'))mark();
  if(atualizarCampoSeDiferente(p,'ladoFamilia','Afinidade'))mark();
  if(atualizarCampoSeDiferente(p,'vinculoDetalhe','Marido da Rita; parente por afinidade'))mark();
  if(atualizarCampoSeDiferente(p,'consanguinidade','Não'))mark();
  if(atualizarCampoSeDiferente(p,'vinculoLadoPendente',false))mark();
  if(acrescentarCondicaoSeFaltar(p,'Amputação traumática da mão direita (acidente de trabalho aos 19 anos)',[/amputacaotraumaticadamaodireita|amputacaodamaodireita/]))mark();
  if(acrescentarCondicaoSeFaltar(p,'Cirurgia bariátrica',[/cirurgiabariatrica|bariatrica/]))mark();
  if(acrescentarCondicaoSeFaltar(p,'Lesão discreta semelhante à psoríase no couro cabeludo',[/lesaotipopsoriasediscretanocourocabeludo|psoriase.{0,30}courocabeludo|courocabeludo.{0,30}psoriase/]))mark();
 });
 executar('Gordo',function(p,mark){
  if(!String(p.parentesco||'').trim()&&atualizarCampoSeDiferente(p,'parentesco','Tio'))mark();
  if(atualizarCampoSeDiferente(p,'vinculoFamilia','Consanguíneo'))mark();
  if(atualizarCampoSeDiferente(p,'consanguinidade','Sim'))mark();
  if(acrescentarCondicaoSeFaltar(p,'Mal de Parkinson',[/parkinson/]))mark();
  const lado=normalizarChaveVinculoFamilia(p.ladoFamilia),temLadoConhecido=['materno','paterno'].includes(lado);
  if(!temLadoConhecido){
   if(atualizarCampoSeDiferente(p,'ladoFamilia',''))mark();
   if(atualizarCampoSeDiferente(p,'vinculoLadoPendente',true))mark();
   if(atualizarCampoSeDiferente(p,'observacaoVinculoPendencia','Confirmar se Gordo é irmão do pai (lado paterno) ou da mãe (lado materno).'))mark();
  }else {if(p.vinculoLadoPendente&&atualizarCampoSeDiferente(p,'vinculoLadoPendente',false))mark();if(p.observacaoVinculoPendencia&&atualizarCampoSeDiferente(p,'observacaoVinculoPendencia',''))mark();}
 });
 if(alterados&&!saveList(lista)){alert('Não foi possível salvar as alterações no armazenamento local.');return}
 window.__msaFamCorrecoesVinculosStatus=relatorio.join('\n')+'\n\n'+(alterados?'Campos atualizados: '+alterados+'.':'Nenhum campo precisou mudar.');
 renderFamiliares();
 setTimeout(function(){const status=document.getElementById('msaFamLinkRepairStatus');if(status){status.style.display='block';status.textContent=window.__msaFamCorrecoesVinculosStatus}},80);
};
function familiaGeracao(p){
 const rel=normalizarChaveVinculoFamilia(p&&p.parentesco||'');
 if((p&&(p.vinculoFamilia==='Afinidade'||p.ladoFamilia==='Afinidade'))||parceirosRelacao(p))return 'afinidade';
 if(/avo|ava/.test(rel))return 'avos';if(/pai|mae/.test(rel))return 'pais';if(/irma/.test(rel))return 'irmaos';if(/filh/.test(rel))return 'filhos';return 'outros';
}
function instalarEstilosMapaInterativo(){
 if(document.getElementById('msaFamMapInteractiveStyles'))return;
 const s=document.createElement('style');s.id='msaFamMapInteractiveStyles';
 s.textContent='.msa-fam-map-controls{display:grid;gap:9px;margin:13px 0}.msa-fam-map-search{display:grid;gap:5px;font-size:12px;font-weight:800;color:#475569}.msa-fam-map-search input{width:100%;box-sizing:border-box;min-height:44px;border:1px solid #cbd5e1;border-radius:12px;padding:10px 12px;font:inherit;background:#fff;color:#0f172a}.msa-fam-map-modes{display:flex;flex-wrap:wrap;gap:7px}.msa-fam-map-mode{border:1px solid #dbe3ee;border-radius:999px;padding:8px 12px;background:#fff;color:#334155;font:inherit;font-size:12px;font-weight:900;cursor:pointer}.msa-fam-map-mode.active{background:#1d4ed8;border-color:#1d4ed8;color:#fff}.msa-fam-generation-tree,.msa-fam-side-tree{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-top:13px}.msa-fam-generation-group{min-width:0;border:1px solid #dbe5f4;background:#fff;border-radius:15px;padding:11px}.msa-fam-generation-group h4{margin:0 0 8px;font-size:13px;color:#1e3a8a}.msa-fam-generation-group p{font-size:10px;line-height:1.4;color:#64748b;margin:0 0 8px}.msa-fam-generation-group .msa-fam-map-list{display:grid;gap:7px}.msa-fam-map-person[hidden]{display:none!important}@media(max-width:760px){.msa-fam-generation-tree,.msa-fam-side-tree{grid-template-columns:1fr}.msa-fam-map-modes{display:grid;grid-template-columns:1fr 1fr}.msa-fam-map-mode{min-height:40px}}body.msa-dark .msa-fam-map-search{color:#cbd5e1}body.msa-dark .msa-fam-map-search input,body.msa-dark .msa-fam-map-mode,body.msa-dark .msa-fam-generation-group{background:#111827;color:#e5e7eb;border-color:#263244}body.msa-dark .msa-fam-map-mode.active{background:#1d4ed8}';
 document.head.appendChild(s);
}
function pessoaMapaFamiliaHTML(p){
 const c=familiaCondicaoTexto(p)||'Sem condição informada',med=(p.medicamentos||[]).length,con=(p.consultas||[]).length;
 const rel=p.parentesco||'Parentesco não informado',lado=p.vinculoLadoPendente?'Lado a confirmar':(p.vinculoFamilia==='Afinidade'||p.ladoFamilia==='Afinidade'?'Afinidade':(familiaLado(p)||'Lado não informado'));
 const alerta=p.vinculoLadoPendente?'<small style="display:block;color:#b45309;font-weight:800">⚠️ Confirmar lado paterno ou materno</small>':'';
 const busca=normalizarChaveVinculoFamilia([p.nome,rel,c,lado].join(' '));
 return '<button type="button" class="msa-fam-map-person" data-fam-map-person data-fam-map-search="'+esc(busca)+'" onclick="selecionarFamiliar(\''+esc(p.id)+'\')"><span class="msa-fam-avatar">'+(p.sexo==='Feminino'?'👩':'👤')+'</span><span><b>'+esc(p.nome||'Sem nome')+'</b><small>'+esc(rel)+'</small><em>'+esc(c)+'</em><small>🧭 '+esc(lado)+'</small>'+alerta+'<small>'+med+' 💊 · '+con+' 👨‍⚕️</small></span></button>';
}
function alternarVisualizacaoMapaFamilia(modo){
 window.__msaFamMapView=modo==='lado'?'lado':'geracao';
 const area=document.getElementById('msa-fam-map');if(!area)return;
 const gen=area.querySelector('#msaFamGenerationTree'),lado=area.querySelector('#msaFamSideTree');
 if(gen)gen.style.display=window.__msaFamMapView==='geracao'?'grid':'none';
 if(lado)lado.style.display=window.__msaFamMapView==='lado'?'grid':'none';
 area.querySelectorAll('[data-fam-map-view]').forEach(function(b){const on=b.getAttribute('data-fam-map-view')===window.__msaFamMapView;b.classList.toggle('active',on);b.setAttribute('aria-pressed',on?'true':'false')});
}
function filtrarMapaFamiliaBusca(valor){
 const area=document.getElementById('msa-fam-map');if(!area)return;
 const q=normalizarChaveVinculoFamilia(valor||'');
 area.querySelectorAll('[data-fam-map-person]').forEach(function(p){p.hidden=!!(q&&String(p.getAttribute('data-fam-map-search')||'').indexOf(q)<0)});
 area.querySelectorAll('[data-fam-map-section]').forEach(function(g){const pessoas=g.querySelectorAll('[data-fam-map-person]');const ok=!q||Array.prototype.some.call(pessoas,function(p){return !p.hidden});g.style.display=ok?'':'none'});
 area.querySelectorAll('[data-fam-map-empty]').forEach(function(empty){empty.style.display=q?'none':''});
}
function filtrarMapaFamiliaGrupo(chave){
 const area=document.getElementById('msa-fam-map');if(!area)return;
 window.__msaFamMapGroup=chave||'todos';
 area.querySelectorAll('[data-fam-map-group-filter]').forEach(function(b){const on=b.getAttribute('data-fam-map-group-filter')===window.__msaFamMapGroup;b.classList.toggle('active',on);b.setAttribute('aria-pressed',on?'true':'false')});
 area.querySelectorAll('#msaFamSideTree [data-fam-map-section]').forEach(function(g){const ok=window.__msaFamMapGroup==='todos'||g.getAttribute('data-fam-map-key')===window.__msaFamMapGroup;g.style.display=ok?'':'none'});
}
window.alternarVisualizacaoMapaFamilia=alternarVisualizacaoMapaFamilia;window.filtrarMapaFamiliaBusca=filtrarMapaFamiliaBusca;window.filtrarMapaFamiliaGrupo=filtrarMapaFamiliaGrupo;
function familiaMapaHTML(list){
 instalarEstilosMapaInterativo();
 const groups={Materno:[],Paterno:[],'Núcleo próximo':[],'Parentes por afinidade':[],'Lado a confirmar':[],'Não informado':[]};
 list.forEach(function(p){
  if(p.vinculoFamilia==='Afinidade'||p.ladoFamilia==='Afinidade'){groups['Parentes por afinidade'].push(p);return}
  if(p.vinculoLadoPendente){groups['Lado a confirmar'].push(p);return}
  const l=familiaLado(p);if(l==='Ambos'||l==='Ambos / não sei'){groups.Materno.push(p);groups.Paterno.push(p);return}
  if(l==='Materno'){groups.Materno.push(p);return}if(l==='Paterno'){groups.Paterno.push(p);return}if(l==='Núcleo próximo'){groups['Núcleo próximo'].push(p);return}
  const rel=normalizarChaveVinculoFamilia(p.parentesco),nucleo=['pai','mae','filho','filha','irmao','irma','marido','esposa','conjuge','companheiro','companheira','parceiro','parceira'].includes(rel);
  groups[nucleo?'Núcleo próximo':'Não informado'].push(p);
 });
 const desc={'Parentes por afinidade':'Pessoas ligadas por casamento ou relacionamento. Não entram nos padrões genéticos biológicos.','Lado a confirmar':'O parentesco é conhecido, mas falta confirmar se pertence ao lado paterno ou materno.','Não informado':'Ainda não há dados para definir o grupo ou lado dessa pessoa.','Lado materno':'Familiares ligados à sua mãe e à linhagem materna.','Lado paterno':'Familiares ligados ao seu pai e à linhagem paterna.','Núcleo próximo':'Pais, irmãos, filhos ou outras pessoas próximas; confirme o vínculo biológico quando relevante.'};
 const group=function(title,icon,arr,key){return '<div class="msa-fam-map-group" data-fam-map-section data-fam-map-key="'+key+'"><div class="msa-fam-map-title">'+icon+' '+title+' <span>'+arr.length+'</span></div><p class="msa-fam-map-explain">'+esc(desc[title]||desc['Não informado'])+'</p>'+(arr.length?'<div class="msa-fam-map-list">'+arr.map(pessoaMapaFamiliaHTML).join('')+'</div>':'<div class="msa-fam-empty" data-fam-map-empty>Nenhum familiar neste grupo.</div>')+'</div>'};
 const gs=[{key:'avos',title:'👵 Avós',desc:'Geração dos avós, conforme o parentesco cadastrado.'},{key:'pais',title:'👨‍👩 Pais',desc:'Pai e mãe.'},{key:'irmaos',title:'🧑 Você e irmãos',desc:'Irmãos e irmãs registrados.'},{key:'filhos',title:'🧒 Filhos',desc:'Filhos e filhas registrados.'},{key:'afinidade',title:'🤝 Cônjuge e afinidade',desc:'Vínculos afetivos ou por casamento, separados de padrões genéticos.'},{key:'outros',title:'🌿 Tios e outros parentes',desc:'Tios, primos, sobrinhos e parentes sem geração definida.'}];
 const ger={avos:[],pais:[],irmaos:[],filhos:[],afinidade:[],outros:[]};list.forEach(function(p){ger[familiaGeracao(p)].push(p)});
 const total=list.length,withCond=list.filter(function(p){return familiaCondicaoTexto(p)}).length,withData=list.filter(function(p){return familiaCondicaoTexto(p)||p.alergias||p.sangue||p.obs}).length;
 const modo=window.__msaFamMapView==='lado'?'lado':'geracao',filtro=window.__msaFamMapGroup||'todos';
 return '<div class="msa-fam-map-card"><div class="msa-fam-map-head"><div><div class="msa-fam-kicker">MAPA DE SAÚDE DA FAMÍLIA</div><h3>🌳 Árvore familiar interativa</h3><p>Busque por nome, parentesco ou condição e alterne entre gerações e lado da família. A geração é estimada pelo parentesco informado.</p></div><button type="button" class="btn secondary small" onclick="iniciarEntrevistaAvaFamilia()">🤖 Falar com a Ava</button></div>'+
 '<div class="msa-fam-map-stats"><div><b>'+total+'</b><span>familiares</span></div><div><b>'+withCond+'</b><span>com condição registrada</span></div><div><b>'+Math.max(0,total-withData)+'</b><span>com poucos dados</span></div></div>'+
 '<div class="msa-fam-map-controls"><label class="msa-fam-map-search">🔎 Buscar na árvore<input type="search" placeholder="Nome, parentesco ou condição..." oninput="filtrarMapaFamiliaBusca(this.value)" aria-label="Buscar familiar por nome, parentesco ou condição"></label>'+
 '<div class="msa-fam-map-modes" role="group" aria-label="Modo de visualizar a árvore"><button type="button" class="msa-fam-map-mode '+(modo==='geracao'?'active':'')+'" data-fam-map-view="geracao" aria-pressed="'+(modo==='geracao'?'true':'false')+'" onclick="alternarVisualizacaoMapaFamilia(\'geracao\')">🌳 Por geração</button><button type="button" class="msa-fam-map-mode '+(modo==='lado'?'active':'')+'" data-fam-map-view="lado" aria-pressed="'+(modo==='lado'?'true':'false')+'" onclick="alternarVisualizacaoMapaFamilia(\'lado\')">🧬 Por lado da família</button></div>'+
 '<div class="msa-fam-map-modes" role="group" aria-label="Filtrar grupos do lado da família">'+['Todos','Materno','Paterno','Núcleo próximo','Afinidade','A confirmar','Não informado'].map(function(t){const k={'Todos':'todos','Materno':'materno','Paterno':'paterno','Núcleo próximo':'nucleo','Afinidade':'afinidade','A confirmar':'confirmar','Não informado':'nao-informado'}[t];return '<button type="button" class="msa-fam-map-mode '+(filtro===k?'active':'')+'" data-fam-map-group-filter="'+k+'" aria-pressed="'+(filtro===k?'true':'false')+'" onclick="filtrarMapaFamiliaGrupo(\''+k+'\')">'+t+'</button>'}).join('')+'</div></div>'+
 '<div class="msa-fam-generation-tree" id="msaFamGenerationTree" style="display:'+(modo==='geracao'?'grid':'none')+'">'+gs.map(function(g){const arr=ger[g.key];return '<div class="msa-fam-generation-group" data-fam-map-section><h4>'+g.title+' <span style="float:right;color:#2563eb">'+arr.length+'</span></h4><p>'+g.desc+'</p>'+(arr.length?'<div class="msa-fam-map-list">'+arr.map(pessoaMapaFamiliaHTML).join('')+'</div>':'<div class="msa-fam-empty" data-fam-map-empty>Nenhum cadastro nesta geração.</div>')+'</div>'}).join('')+'</div>'+
 '<div class="msa-fam-side-tree" id="msaFamSideTree" style="display:'+(modo==='lado'?'grid':'none')+'">'+group('Lado materno','🌷',groups.Materno,'materno')+group('Lado paterno','🧭',groups.Paterno,'paterno')+group('Núcleo próximo','🏠',groups['Núcleo próximo'],'nucleo')+group('Parentes por afinidade','🤝',groups['Parentes por afinidade'],'afinidade')+group('Lado a confirmar','❔',groups['Lado a confirmar'],'confirmar')+group('Não informado','⚪',groups['Não informado'],'nao-informado')+'</div></div>';
}

function familiaAnaliseHTML(list){const patterns=familiaPatterns(list),relevant=patterns.filter(x=>x.count>=2),missing=list.filter(p=>!familiaCondicaoTexto(p)||!p.sangue||!familiaIdade(p)).length;let body='';if(patterns.length){body='<div class="msa-fam-patterns">'+patterns.slice(0,8).map(x=>'<div class="msa-fam-pattern"><div><b>'+esc(x.nome)+'</b><small>'+x.count+' familiar'+(x.count===1?'':'es')+'</small></div><div class="msa-fam-members">'+x.members.map(p=>'<button type="button" onclick="selecionarFamiliar(\''+esc(p.id)+'\')">'+esc(p.nome||'Sem nome')+'</button>').join('')+'</div></div>').join('')+'</div>'}else body='<div class="msa-fam-empty">Ainda não há condições suficientes registradas para encontrar padrões.</div>';return '<div class="msa-fam-analysis-card"><div class="msa-fam-kicker">ANÁLISE DO HISTÓRICO</div><h3>📊 Padrões familiares registrados</h3><p>O sistema agrupa informações que você registrou. Isso não significa que você terá a mesma condição.</p><div class="msa-fam-analysis-kpis"><div><b>'+relevant.length+'</b><span>padrões repetidos</span></div><div><b>'+patterns.length+'</b><span>categorias encontradas</span></div><div><b>'+missing+'</b><span>fichas com dados faltantes</span></div></div>'+body+'<div class="alert warn" style="margin-top:10px">⚠️ Esta análise é apenas organizacional. Histórico familiar não é diagnóstico nem previsão individual de risco.</div></div>'}

function dadosFamiliaParaIA(){
 const historico=(window.MSAStorage?.get(K.fam)||[]); 
 const familiares=familiaArray();
 return {
  historico:Array.isArray(historico)?historico:[],
  familiares:Array.isArray(familiares)?familiares:[]
 };
}
function gerarPromptCompletoFamilia(pergunta){
 const d=dadosFamiliaParaIA();
 const lines=[
  'PROMPT — FAMÍLIA PRONTO PARA COPIAR E COLAR',
  '',
  'Você é a assistente de organização do histórico familiar do Minha Saúde IA.',
  'Sua tarefa é analisar todo o contexto familiar fornecido e devolver imediatamente uma ficha estruturada para importação.',
  'ATENÇÃO: NÃO faça entrevista.',
  'ATENÇÃO: NÃO faça perguntas ao usuário.',
  'ATENÇÃO: NÃO peça informações adicionais.',
  'ATENÇÃO: NÃO espere uma segunda mensagem do usuário.',
  'ATENÇÃO: responda tudo em uma única resposta.',
  '',
  'Use somente informações relacionadas à família.',
  'Parentes por afinidade (vinculoFamilia="Afinidade" ou ladoFamilia="Afinidade") devem ficar registrados separadamente e NÃO contam para padrões genéticos ou herança biológica.',
  'Não misture informações do perfil pessoal do usuário nem de outros módulos, a menos que um dado esteja explicitamente identificado como pertencente a um familiar.',
  'Nunca invente dados.',
  'Quando uma informação não estiver disponível, use "" ou [] e siga em frente.',
  'Preserve informações incertas como foram informadas e não transforme suspeitas em certezas.',
  'Não faça diagnóstico e não faça previsão individual de doenças.',
  '',
  '=== O QUE VOCÊ DEVE FAZER AGORA ===',
  '1. Leia todo o contexto familiar abaixo.',
  '2. Organize TODOS os familiares já cadastrados.',
  '3. Preserve todos os dados disponíveis de cada familiar.',
  '4. Preserve doenças, condições, alergias, tipo sanguíneo, medicamentos, consultas, crises/intercorrências e observações.',
  '5. Preserve também o histórico familiar que não puder ser atribuído a uma pessoa específica.',
  '6. NÃO pergunte nada, mesmo que existam informações faltantes.',
  '7. Preencha os campos ausentes com "" ou [] conforme a estrutura.',
  '8. Gere imediatamente o resultado final.',
  '',
  '=== FORMATO DA RESPOSTA ===',
  'A resposta final deve conter SOMENTE um objeto JSON válido.',
  'Não escreva explicações antes do JSON.',
  'Não escreva explicações depois do JSON.',
  'Não use comentários.',
  'Use aspas duplas válidas para JSON.',
  'A estrutura principal obrigatória é:',
  '{"familiares":[],"historico_familiar":[]}',
  '',
  'Cada familiar deve preservar:',
  'nome, parentesco, grauParentesco, consanguinidade, vinculoFamilia, statusFamiliar, causaFalecimento, sexo, data_nascimento, idade, ladoFamilia, condicao, alergias, tipo_sanguineo, contato, obs, idadeDiagnostico, certeza, medicamentos, consultas e crises.',
  '',
  'Cada medicamento deve preservar:',
  'nome, dose, horario, frequencia, prescrito_por e obs.',
  '',
  'Cada consulta deve preservar:',
  'data, especialidade, medico, retorno, motivo e obs.',
  '',
  'Cada crise deve preservar:',
  'data, hora, tipo, intensidade, descricao, gatilho e conduta.',
  '',
  '=== PERGUNTA DO USUÁRIO ===',''+String(pergunta||'').trim(),'','=== CONTEXTO FAMILIAR ===',
  'HISTÓRICO FAMILIAR / ANTECEDENTES:'
 ];
 if(d.historico.length){
  d.historico.forEach((x,i)=>{
   lines.push(
    'Registro '+(i+1)+':',
    '- Parente: '+(x.parente||'Não informado'),
    '- Condição: '+(x.condicao||x.cond||x.info||'Não informado'),
    '- Idade ao diagnóstico: '+(x.idade||'Não informada'),
    '- Observação: '+(x.obs||'Não informada'),
    ''
   );
  });
 }else lines.push('- Nenhum antecedente familiar cadastrado.','');
 lines.push('FAMILIARES CADASTRADOS:');
 if(d.familiares.length){
  d.familiares.forEach((p,i)=>{
   lines.push(
    'Familiar '+(i+1)+':',
    '- Nome: '+(p.nome||'Não informado'),
    '- Parentesco: '+(p.parentesco||'Não informado'),
    '- Grau de parentesco: '+(p.grauParentesco||familiaGrau(p)),
    '- Consanguinidade conhecida: '+(p.consanguinidade||'Não informado'),
    '- Status do familiar: '+(p.statusFamiliar||'Não informado'),
    '- Causa do falecimento: '+(p.causaFalecimento||'Não informada'),
    '- Sexo: '+(p.sexo||'Não informado'),
    '- Data de nascimento: '+(p.nasc||'Não informada'),
    '- Idade: '+(p.idade||'Não informada'),
    '- Lado da família: '+(p.ladoFamilia||'Não informado'),
    '- Condição principal: '+(p.condicao||'Não informada'),
    '- Idade ao diagnóstico: '+(p.idadeDiagnostico||'Não informada'),
    '- Nível de confiança: '+(p.certeza||'Não informado'),
    '- Alergias: '+(p.alergias||'Não informadas'),
    '- Tipo sanguíneo: '+(p.sangue||'Não informado'),
    '- Contato/responsável: '+(p.contato||'Não informado'),
    '- Observações: '+(p.obs||'Não informadas')
   );
   const meds=Array.isArray(p.medicamentos)?p.medicamentos:[];
   const cons=Array.isArray(p.consultas)?p.consultas:[];
   const crises=Array.isArray(p.crises)?p.crises:[];
   if(meds.length){
    lines.push('- Medicamentos:');
    meds.forEach(m=>lines.push('  • '+(m.nome||'Não informado')+(m.dose?' — dose: '+m.dose:'')+(m.hora?' — horário: '+m.hora:'')+(m.frequencia?' — frequência: '+m.frequencia:'')+(m.prescritoPor?' — prescrito por: '+m.prescritoPor:'')+(m.obs?' — '+m.obs:'')));
   }else lines.push('- Medicamentos: Nenhum registrado.');
   if(cons.length){
    lines.push('- Consultas:');
    cons.forEach(x=>lines.push('  • '+(x.data||'Data não informada')+' — '+(x.especialidade||'Consulta')+(x.medico?' — médico: '+x.medico:'')+(x.retorno?' — retorno: '+x.retorno:'')+(x.motivo?' — motivo: '+x.motivo:'')+(x.obs?' — orientações: '+x.obs:'')));
   }else lines.push('- Consultas: Nenhuma registrada.');
   if(crises.length){
    lines.push('- Crises/intercorrências:');
    crises.forEach(x=>lines.push('  • '+(x.data||'Data não informada')+(x.hora?' '+x.hora:'')+' — '+(x.tipo||'Ocorrência')+' — intensidade: '+(x.intensidade||'não informada')+' — '+(x.descricao||'')+(x.gatilho?' — gatilho: '+x.gatilho:'')+(x.conduta?' — conduta: '+x.conduta:'')));
   }else lines.push('- Crises/intercorrências: Nenhuma registrada.');
   lines.push('');
  });
 }else lines.push('- Nenhum familiar cadastrado.','');
 lines.push(
  '=== FINALIZAÇÃO OBRIGATÓRIA ===',
  'Agora gere imediatamente o JSON completo.',
  'NÃO faça nenhuma pergunta.',
  'NÃO peça confirmação.',
  'NÃO peça mais dados.',
  'Entregue somente o JSON válido pronto para copiar e colar no botão "Colar resposta da IA" do Minha Saúde IA.'
 );
 return lines.join('\n');
}
function copiarTextoFamiliaIA(txt,okMsg){
 const done=()=>alert(okMsg||'📋 Prompt familiar copiado. Agora você pode colar na IA.');
 if(navigator.clipboard?.writeText)navigator.clipboard.writeText(txt).then(done).catch(()=>fallbackIAFamiliar(txt));
 else fallbackIAFamiliar(txt);
}
function gerarPromptNotebookLM(pedido){
 const objetivo=String(pedido||'').trim().slice(0,350)||'Localize os familiares citados nas fontes e gere o JSON para importar no Minha Saúde IA.';
 const linhas=[
  'TAREFA: organizar o histórico familiar a partir das fontes deste NotebookLM.',
  'Use APENAS as fontes anexadas e o conteúdo disponível neste notebook. Não presuma acesso a conversas antigas, memórias externas ou outros aplicativos.',
  'Localize os familiares mencionados nas fontes. Consolide menções da mesma pessoa sem misturar pessoas com nomes parecidos.',
  'Extraia apenas fatos documentados: nome, parentesco, lado materno/paterno, vínculo consanguíneo/afinidade, condições, cirurgias, alergias, medicamentos, consultas, crises e observações.',
  'Parentes por afinidade, como cunhados e cônjuges, devem usar vinculoFamilia="Afinidade" e não contam para padrões genéticos.',
  'Se o lado de um tio não estiver explícito, use ladoFamilia="" e explique a dúvida em obs. Não deduza o lado.',
  'Não invente dados, não faça diagnósticos e não transforme suspeitas em fatos. Dados ausentes: "" ou [].',
  'Responda SOMENTE com JSON válido, sem markdown, introdução ou comentários.',
  'Use esta estrutura: {"familiares":[{"nome":"","parentesco":"","grauParentesco":"","consanguinidade":"","vinculoFamilia":"","sexo":"","data_nascimento":"","idade":"","ladoFamilia":"","condicao":"","alergias":"","tipo_sanguineo":"","contato":"","obs":"","idadeDiagnostico":"","certeza":"","medicamentos":[{"nome":"","dose":"","horario":"","frequencia":"","prescrito_por":"","obs":""}],"consultas":[{"data":"","especialidade":"","medico":"","retorno":"","motivo":"","obs":""}],"crises":[{"data":"","hora":"","tipo":"","intensidade":"","descricao":"","gatilho":"","conduta":""}]}],"historico_familiar":[{"parente":"","condicao":"","idade":"","obs":"","ladoFamilia":"","certeza":""}]}',
  'Não omita familiares comprovados nas fontes nem inclua pessoas sem evidência de parentesco. Se não houver dados, use {"familiares":[],"historico_familiar":[]}.',
  'PEDIDO ESPECÍFICO: '+objetivo
 ];
 return linhas.join('\n');
}
function abrirPromptFamiliaIA(modo){
 const buscarFamiliares=modo==='buscar-familiares';
 const pergunta=buscarFamiliares
  ? 'Localize os familiares citados nas fontes deste NotebookLM e gere o JSON para importar no Minha Saúde IA.'
  : 'Faça uma análise geral do histórico familiar, destacando padrões, informações relevantes e perguntas úteis para levar ao médico.';
 const d=dadosFamiliaParaIA(),familiaCount=d.familiares.length,histCount=d.historico.length,medCount=d.familiares.reduce((n,p)=>n+(Array.isArray(p.medicamentos)?p.medicamentos.length:0),0),consCount=d.familiares.reduce((n,p)=>n+(Array.isArray(p.consultas)?p.consultas.length:0),0),criseCount=d.familiares.reduce((n,p)=>n+(Array.isArray(p.crises)?p.crises.length:0),0);
 let old=document.getElementById('msaFamiliaIAPromptModal');if(old)old.remove();
 const modal=document.createElement('div');modal.id='msaFamiliaIAPromptModal';modal.className='msa-ava-overlay';
 modal.innerHTML='<div class="msa-ava-dialog" role="dialog" aria-modal="true" aria-labelledby="msaFamiliaIATitle">'+
  '<div class="msa-ava-top"><div><div class="msa-fam-kicker">🤖 IA · FAMÍLIA</div><h2 id="msaFamiliaIATitle">'+(buscarFamiliares?'Buscar familiares nas fontes do NotebookLM':'Preparar prompt de IA sobre a família')+'</h2><p>Antes de abrir um serviço externo, confira exatamente o conteúdo e confirme o compartilhamento.</p></div><button type="button" class="msa-ava-close" id="msaFamiliaIAClose">✕</button></div>'+
  (buscarFamiliares?'<div class="alert safe" style="margin-top:12px"><b>📚 Prompt para NotebookLM</b><br>O prompt consulta somente as fontes disponíveis no seu notebook. Não anexa o histórico salvo localmente e fica limitado a 3.800 caracteres.</div>':'<div class="alert warn" style="margin-top:12px"><b>🔐 Prévia de privacidade</b><br>Este prompt pode conter nomes, parentesco e informações de saúde de familiares. O aplicativo não envia nada automaticamente.</div>')+
  (buscarFamiliares?'<div class="alert safe" style="margin-top:10px">O NotebookLM precisa ter as fontes familiares adicionadas ao caderno. Este prompt não consegue recuperar fontes que não estejam disponíveis nele.</div>':'<div class="grid2" style="margin-top:10px"><div class="card stat"><span>👥 Familiares</span><b>'+familiaCount+'</b></div><div class="card stat"><span>🧬 Histórico</span><b>'+histCount+'</b></div><div class="card stat"><span>💊 Medicamentos</span><b>'+medCount+'</b></div><div class="card stat"><span>👨‍⚕️ Consultas · 🚨 Crises</span><b>'+consCount+' · '+criseCount+'</b></div></div>')+
  '<label class="msa-ava-field">'+(buscarFamiliares?'❓ Pedido ao NotebookLM':'❓ O que você quer perguntar?')+'<textarea id="msaFamiliaIAPergunta" style="margin-top:7px;min-height:90px" placeholder="Ex.: Existe algum padrão de doenças que aparece em mais de uma geração?">'+esc(pergunta)+'</textarea></label>'+
  '<label class="msa-ava-field">'+(buscarFamiliares?'📚 Prompt do NotebookLM · limite de 3.800 caracteres':'📋 Prévia completa do que será copiado/compartilhado')+'<textarea id="msaFamiliaIATexto" readonly style="margin-top:7px;min-height:260px;font-size:12px;line-height:1.4"></textarea></label>'+(buscarFamiliares?'<div id="msaFamiliaIACharCount" role="status" style="margin-top:6px;font-size:12px;font-weight:800;color:#1d4ed8">0/3800 caracteres</div>':'')+
  '<label style="display:flex;gap:9px;align-items:flex-start;margin-top:12px;padding:12px;border:1px solid #fed7aa;background:#fffaf5;border-radius:14px;font-size:13px;line-height:1.4"><input id="msaFamiliaIAConfirmacao" type="checkbox" style="margin-top:3px;flex:0 0 auto"><span><b>Confirmo que revisei a prévia e autorizo o compartilhamento desses dados familiares com um serviço externo de IA.</b></span></label>'+
  '<div class="msa-ava-actions" style="display:grid;grid-template-columns:1fr 1fr"><button type="button" class="btn green" id="msaFamiliaIACopiar">📋 Copiar prompt</button>'+(buscarFamiliares?'<button type="button" class="btn secondary" id="msaFamiliaIANotebookLM" disabled>📚 Confirmar e abrir NotebookLM</button>':'<button type="button" class="btn" id="msaFamiliaIAChatGPT" disabled>🟢 Confirmar e abrir ChatGPT</button><button type="button" class="btn secondary" id="msaFamiliaIAClaude" disabled>🟣 Confirmar e abrir Claude</button><button type="button" class="btn secondary" id="msaFamiliaIAGemini" disabled>🔵 Confirmar e abrir Gemini</button>')+'<button type="button" class="btn secondary" id="msaFamiliaIAImportar">📥 Colar resposta da IA</button><button type="button" class="btn secondary" id="msaFamiliaIAFechar">↩️ Voltar</button></div>'+
  '<div class="alert safe" style="margin-top:12px">🔒 Copiar o prompt apenas copia para a área de transferência. Abrir um serviço externo só fica disponível depois da confirmação acima.</div>'+
  '</div>';
 document.body.appendChild(modal);
 const textarea=modal.querySelector('#msaFamiliaIAPergunta'),out=modal.querySelector('#msaFamiliaIATexto'),check=modal.querySelector('#msaFamiliaIAConfirmacao');
 const atualizar=()=>{
  out.value=buscarFamiliares?gerarPromptNotebookLM(textarea.value):gerarPromptCompletoFamilia(textarea.value);
  const contador=modal.querySelector('#msaFamiliaIACharCount');
  if(contador)contador.textContent=out.value.length+'/3800 caracteres'+(out.value.length>3800?' — excedeu o limite':'');
  const copiar=modal.querySelector('#msaFamiliaIACopiar');
  if(copiar)copiar.disabled=buscarFamiliares&&out.value.length>3800;
 };
 const atualizarBotoes=()=>['#msaFamiliaIAChatGPT','#msaFamiliaIAClaude','#msaFamiliaIAGemini','#msaFamiliaIANotebookLM'].forEach(sel=>{const b=modal.querySelector(sel);if(b)b.disabled=!check.checked||(buscarFamiliares&&out.value.length>3800)});
 atualizar();
 textarea.addEventListener('input',atualizar);
 check.addEventListener('change',atualizarBotoes);
 const fechar=()=>modal.remove();
 modal.querySelector('#msaFamiliaIAClose').onclick=fechar;
 modal.querySelector('#msaFamiliaIAFechar').onclick=fechar;
 modal.addEventListener('click',e=>{if(e.target===modal)fechar()});
 modal.querySelector('#msaFamiliaIACopiar').onclick=()=>copiarTextoFamiliaIA(out.value);
 modal.querySelector('#msaFamiliaIAImportar').onclick=()=>{fechar();abrirImportadorRespostaFamilia()};
 function abrirExterno(url,nome){
  if(!check.checked){alert('🔐 Confirme primeiro que revisou e autoriza o compartilhamento dos dados familiares.');return}
  if(!confirm('Você está prestes a abrir '+nome+' para compartilhar dados de saúde de familiares. Confirmar abertura?'))return;
  const janela=window.open(url,'_blank','noopener');
  if(!janela)alert('⚠️ O navegador bloqueou a nova aba. Permita pop-ups para abrir o serviço.');
  copiarTextoFamiliaIA(out.value,'✅ Prompt copiado. A prévia foi confirmada e '+nome+' foi aberto.');
 }
 modal.querySelector('#msaFamiliaIAChatGPT').onclick=()=>abrirExterno('https://chatgpt.com/','ChatGPT');
 modal.querySelector('#msaFamiliaIAClaude').onclick=()=>abrirExterno('https://claude.ai/new','Claude');
 modal.querySelector('#msaFamiliaIAGemini').onclick=()=>abrirExterno('https://gemini.google.com/app','Gemini');
 const notebookBtn=modal.querySelector('#msaFamiliaIANotebookLM');
 if(notebookBtn)notebookBtn.onclick=()=>abrirExterno('https://notebooklm.google.com/','NotebookLM');
 textarea.focus();
}
window.abrirPromptFamiliaIA=abrirPromptFamiliaIA;

function normalizarTextoIA(v){return String(v==null?'':v).trim()}
function tentarParseJSON(txt){
 const s=String(txt||'').trim();
 if(!s)return null;
 try{return JSON.parse(s)}catch(e){}
 return null;
}
function extrairJSONFamilia(raw){
 const txt=normalizarTextoIA(raw).replace(/^\uFEFF/,'');
 const candidatos=[];
 const blocos=[...txt.matchAll(/\`\`\`(?:json)?\s*([\s\S]*?)\`\`\`/gi)];
 blocos.forEach(m=>candidatos.push(m[1]));
 candidatos.push(txt);
 // Procura o objeto principal mesmo quando existe texto explicativo antes/depois.
 const inicioFamilia=txt.search(/\{\s*["']?familiares["']?\s*:/i);
 if(inicioFamilia>=0)candidatos.push(txt.slice(inicioFamilia));
 const inicioHistorico=txt.search(/\{\s*["']?historico_familiar["']?\s*:/i);
 if(inicioHistorico>=0)candidatos.push(txt.slice(inicioHistorico));
 for(const candidato of candidatos){
  const parsed=tentarParseJSON(candidato.replace(/^\s*json\s*/i,'').trim());
  if(parsed && (Array.isArray(parsed)||typeof parsed==='object'))return parsed;
  const clean=String(candidato).trim().replace(/^\`\`\`(?:json)?/i,'').replace(/\`\`\`$/,'').trim();
  const objStart=clean.search(/\{\s*["']?familiares["']?\s*:/i);
  if(objStart>=0){
   for(let end=clean.length;end>objStart+10;end--){
    if(clean[end-1]!=='}')continue;
    const parsed2=tentarParseJSON(clean.slice(objStart,end));
    if(parsed2&&typeof parsed2==='object'&&!Array.isArray(parsed2)&&parsed2.familiares)return parsed2;
   }
  }
  const arrStart=clean.indexOf('[');
  if(arrStart>=0){
   for(let end=clean.length;end>arrStart+2;end--){
    if(clean[end-1]!==']')continue;
    const parsed3=tentarParseJSON(clean.slice(arrStart,end));
    if(Array.isArray(parsed3)&&parsed3.some(x=>x&&typeof x==='object'&&x.nome))return {familiares:parsed3};
   }
  }
 }
 throw new Error('A resposta não contém o JSON de importação. Volte à conversa da IA e envie: Gere agora o JSON de importação do Minha Saúde IA usando todas as informações que já respondi. Depois copie o JSON completo e cole aqui. Um resumo em texto, sozinho, não cria o cadastro.');
}
function arrFam(v){return Array.isArray(v)?v:[]}
function normalizarFamiliarImportado(src){
 const p=src&&typeof src==='object'?src:{};
 const nome=normalizarTextoIA(p.nome||p.NOME);
 if(!nome)return null;
 const meds=arrFam(p.medicamentos||p.MEDICAMENTOS).map(m=>({
  id:uid('fmed'),nome:normalizarTextoIA(m&& (m.nome||m.NOME||m.medicamento)),
  dose:normalizarTextoIA(m&& (m.dose||m.DOSE)),hora:normalizarTextoIA(m&& (m.hora||m.HORARIO)),
  frequencia:normalizarTextoIA(m&& (m.frequencia||m.FREQUENCIA||m.freq)),
  prescritoPor:normalizarTextoIA(m&& (m.prescritoPor||m.PRESCRITO_POR||m.prescrito_por)),
  obs:normalizarTextoIA(m&& (m.obs||m.OBS))
 })).filter(function(x){return x.nome});
 const cons=arrFam(p.consultas||p.CONSULTAS).map(function(x){return {
  id:uid('fcon'),data:normalizarTextoIA(x&& (x.data||x.DATA)),
  especialidade:normalizarTextoIA(x&& (x.especialidade||x.ESPECIALIDADE)),
  medico:normalizarTextoIA(x&& (x.medico||x.MEDICO)),retorno:normalizarTextoIA(x&& (x.retorno||x.RETORNO)),
  motivo:normalizarTextoIA(x&& (x.motivo||x.MOTIVO)),obs:normalizarTextoIA(x&& (x.obs||x.OBS||x.orientacoes))
 }}).filter(function(x){return x.data||x.especialidade||x.medico||x.motivo||x.obs});
 const crises=arrFam(p.crises||p.CRISES).map(function(x){return {
  id:uid('fcrise'),data:normalizarTextoIA(x&& (x.data||x.DATA)),hora:normalizarTextoIA(x&& (x.hora||x.HORA)),
  tipo:normalizarTextoIA(x&& (x.tipo||x.TIPO)),intensidade:normalizarTextoIA(x&& (x.intensidade||x.INTENSIDADE)),
  descricao:normalizarTextoIA(x&& (x.descricao||x.DESCRICAO||x.o_que_aconteceu)),
  gatilho:normalizarTextoIA(x&& (x.gatilho||x.GATILHO)),conduta:normalizarTextoIA(x&& (x.conduta||x.CONDUTA))
 }}).filter(function(x){return x.data||x.tipo||x.descricao});
 const obs=[];
 const baseObs=normalizarTextoIA(p.obs||p.OBS);if(baseObs)obs.push(baseObs);
 const idadeDiag=normalizarTextoIA(p.idadeDiagnostico||p.IDADE_DIAGNOSTICO);if(idadeDiag)obs.push('Idade aproximada ao diagnóstico: '+idadeDiag+' anos');
 const certeza=normalizarTextoIA(p.certeza||p.CERTEZA);if(certeza)obs.push('Nível de confiança: '+certeza);
 return {
  id:normalizarTextoIA(p.id)||uid('fam'),nome:nome,
  parentesco:normalizarTextoIA(p.parentesco||p.PARENTESCO)||'Outro',
  sexo:normalizarTextoIA(p.sexo||p.SEXO),nasc:normalizarTextoIA(p.nasc||p.NASC||p.data_nascimento||p.DATA_NASCIMENTO),
  idade:normalizarTextoIA(p.idade||p.IDADE),altura:normalizarTextoIA(p.altura||p.ALTURA),peso:normalizarTextoIA(p.peso||p.PESO),medidas:normalizarTextoIA(p.medidas||p.MEDIDAS),rotina:normalizarTextoIA(p.rotina||p.ROTINA),medicamentosRelato:normalizarTextoIA(p.medicamentosRelato||p.MEDICAMENTOS_RELATADOS),condicao:normalizarTextoIA(p.condicao||p.CONDICAO),
  alergias:normalizarTextoIA(p.alergias||p.ALERGIAS),sangue:normalizarTextoIA(p.sangue||p.SANGUE||p.tipo_sanguineo||p.TIPO_SANGUINEO),
  contato:normalizarTextoIA(p.contato||p.CONTATO),obs:obs.join(' '),
  ladoFamilia:normalizarTextoIA(p.ladoFamilia||p.LADO_FAMILIA),vinculoFamilia:normalizarTextoIA(p.vinculoFamilia||p.VINCULO_FAMILIA),idadeDiagnostico:normalizarTextoIA(p.idadeDiagnostico||p.IDADE_DIAGNOSTICO),certeza:normalizarTextoIA(p.certeza||p.CERTEZA),criadoEm:normalizarTextoIA(p.criadoEm)||new Date().toISOString(),
  medicamentos:meds,consultas:cons,crises:crises,dadosImportadosIA:p
 };
}
function chaveDedupFamilia(v){
 return String(v==null?'':v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
}
function campoImportacaoPreenchido(v){
 return v!==undefined&&v!==null&&String(v).trim()!=='';
}
function mesclarTextoSemRepetir(atual,novo){
 const base=String(atual||'').trim();
 const incoming=String(novo||'').trim();
 if(!incoming)return base;
 if(!base)return incoming;
 const partesBase=base.split(/[;\n|]+/).map(x=>x.trim()).filter(Boolean);
 const partesNovas=incoming.split(/[;\n|]+/).map(x=>x.trim()).filter(Boolean);
 let partes=partesBase.slice(),alterou=false;
 partesNovas.forEach(function(parte){
  const chave=chaveDedupFamilia(parte);if(!chave)return;
  const todas=chaveDedupFamilia(partes.join(' '));
  if(todas.includes(chave))return;
  partes.push(parte);alterou=true;
 });
 return alterou?partes.join('; '):base;
}
function identidadeRegistroImportado(a,b,tipo){
 const norm=v=>chaveDedupFamilia(v);
 const get=(p,k)=>norm(p&&p[k]);
 if(tipo==='medicamentos'){
  if(!get(a,'nome')||get(a,'nome')!==get(b,'nome'))return false;
  const da=get(a,'dose'),db=get(b,'dose');
  return !(da&&db&&da!==db);
 }
 const campos=tipo==='consultas'?['data','especialidade','medico','motivo']:['data','hora','tipo','descricao','gatilho'];
 let iguais=0,temData=false;
 for(const k of campos){
  const va=get(a,k),vb=get(b,k);
  if(va&&vb&&va!==vb)return false;
  if(va&&vb&&va===vb){iguais++;if(k==='data')temData=true}
 }
 return tipo==='consultas'?(iguais>=2||temData):(iguais>=2||(temData&&get(a,'tipo')&&get(a,'tipo')===get(b,'tipo')));
}
function mesclarRegistroImportado(atual,novo,stats){
 let mudou=false;
 Object.keys(novo||{}).forEach(function(k){
  if(k==='id'||k==='criadoEm')return;
  const velho=atual[k],v=novo[k];
  if(!campoImportacaoPreenchido(velho)&&campoImportacaoPreenchido(v)){atual[k]=v;mudou=true;return}
  if(k==='obs'&&campoImportacaoPreenchido(velho)&&campoImportacaoPreenchido(v)){
   const combinado=mesclarTextoSemRepetir(velho,v);
   if(combinado!==velho){atual[k]=combinado;mudou=true}
  }
 });
 return mudou;
}
function mesclarListaRegistrosImportados(existentes,entrantes,tipo,stats){
 const lista=[];
 function inserir(registro,veioDaImportacao){
  const item=Object.assign({},registro||{});
  const idx=lista.findIndex(function(x){return identidadeRegistroImportado(x,item,tipo)});
  if(idx>=0){
   const mudou=mesclarRegistroImportado(lista[idx],item,stats);
   stats.registrosDuplicadosIgnorados++;
   if(mudou)stats.camposNovosCompletados++;
   return mudou;
  }
  if(!item.id)item.id=uid(tipo.slice(0,-1));
  lista.push(item);
  if(veioDaImportacao)stats.registrosNovos++;
  return true;
 }
 (Array.isArray(existentes)?existentes:[]).forEach(x=>inserir(x,false));
 (Array.isArray(entrantes)?entrantes:[]).forEach(x=>inserir(x,true));
 return {lista:lista,mudou:JSON.stringify(lista)!==JSON.stringify(Array.isArray(existentes)?existentes:[])};
}
function mesclarFamiliarImportado(atual,novo,stats){
 const merged=Object.assign({},atual||{});let mudou=false;
 const textos=['condicao','obs','medicamentosRelato','medidas','rotina'];
 textos.forEach(function(k){
  if(!campoImportacaoPreenchido(novo[k]))return;
  const valor=mesclarTextoSemRepetir(merged[k],novo[k]);
  if(valor!==String(merged[k]||'')){merged[k]=valor;mudou=true;stats.camposNovosCompletados++}
 });
 const simples=['nome','parentesco','sexo','nasc','idade','altura','peso','alergias','sangue','contato','ladoFamilia','idadeDiagnostico','certeza','statusFamiliar','causaFalecimento','grauParentesco','consanguinidade','vinculoFamilia','statusFamiliar','causaFalecimento'];
 simples.forEach(function(k){
  if(!campoImportacaoPreenchido(merged[k])&&campoImportacaoPreenchido(novo[k])){merged[k]=novo[k];mudou=true;stats.camposNovosCompletados++}
 });
 ['medicamentos','consultas','crises'].forEach(function(tipo){
  const res=mesclarListaRegistrosImportados(merged[tipo],novo[tipo],tipo,stats);
  if(res.mudou){merged[tipo]=res.lista;mudou=true}
 });
 if(novo.dadosImportadosIA&&typeof novo.dadosImportadosIA==='object'){
  const anterior=merged.dadosImportadosIA&&typeof merged.dadosImportadosIA==='object'?merged.dadosImportadosIA:{};
  const combinado=Object.assign({},anterior);
  Object.keys(novo.dadosImportadosIA).forEach(k=>{if(!campoImportacaoPreenchido(combinado[k])&&campoImportacaoPreenchido(novo.dadosImportadosIA[k]))combinado[k]=novo.dadosImportadosIA[k]});
  merged.dadosImportadosIA=combinado;
 }
 return {familiar:ensure(merged),mudou:mudou};
}
function mesmoHistoricoImportado(a,b){
 const parA=chaveDedupFamilia(a.parente||a.parentesco),parB=chaveDedupFamilia(b.parente||b.parentesco);
 if(!parA||parA!==parB)return false;
 const condA=String(a.cond||a.info||a.condicao||''),condB=String(b.cond||b.info||b.condicao||'');
 const ca=chaveDedupFamilia(condA),cb=chaveDedupFamilia(condB);
 if(ca&&cb)return ca===cb||ca.includes(cb)||cb.includes(ca);
 if(ca||cb)return false;
 const idadeA=chaveDedupFamilia(a.idade||a.idadeDiagnostico),idadeB=chaveDedupFamilia(b.idade||b.idadeDiagnostico);
 const obsA=chaveDedupFamilia(a.obs||a.observacao),obsB=chaveDedupFamilia(b.obs||b.observacao);
 return (idadeA&&idadeA===idadeB)||(obsA&&obsA===obsB);
}
function mesclarHistoricoImportado(atual,novo){
 let mudou=false;
 const cond=mesclarTextoSemRepetir(atual.cond||atual.info,novo.cond||novo.info||novo.condicao);
 if(cond!==String(atual.cond||atual.info||'')){atual.cond=cond;atual.info=cond;mudou=true}
 [['idade','idade'],['ladoFamilia','ladoFamilia'],['certeza','certeza']].forEach(function(par){
  if(!campoImportacaoPreenchido(atual[par[0]])&&campoImportacaoPreenchido(novo[par[1]])){atual[par[0]]=novo[par[1]];mudou=true}
 });
 const obs=mesclarTextoSemRepetir(atual.obs||atual.observacao,novo.obs||novo.observacao);
 if(obs!==String(atual.obs||atual.observacao||'')){atual.obs=obs;atual.observacao=obs;mudou=true}
 if(!campoImportacaoPreenchido(atual.idadeDiagnostico)&&campoImportacaoPreenchido(novo.idadeDiagnostico)){atual.idadeDiagnostico=novo.idadeDiagnostico;mudou=true}
 return mudou;
}
function localizarFamiliarImportado(lista,novo){
 const nome=chaveDedupFamilia(novo.nome),rel=chaveDedupFamilia(novo.parentesco);
 if(!nome)return -1;
 const exato=lista.findIndex(x=>chaveDedupFamilia(x.nome)===nome&&chaveDedupFamilia(x.parentesco)===rel);
 if(exato>=0)return exato;
 const candidatos=[];
 lista.forEach(function(x,i){if(chaveDedupFamilia(x.nome)===nome)candidatos.push(i)});
 if(candidatos.length===1){
  const p=lista[candidatos[0]],relAtual=chaveDedupFamilia(p.parentesco);
  if(!rel||!relAtual||rel==='outro'||relAtual==='outro')return candidatos[0];
 }
 return -1;
}
function detectarConflitosImportacaoFamilia(atual,novo){
 const campos=[['parentesco','parentesco'],['sexo','sexo'],['nasc','nascimento'],['idade','idade'],['sangue','tipo sanguíneo'],['alergias','alergias'],['contato','contato'],['ladoFamilia','lado da família'],['grauParentesco','grau de parentesco']];
 const conflitos=[];
 campos.forEach(function(par){const a=String(atual&&atual[par[0]]||'').trim(),b=String(novo&&novo[par[0]]||'').trim();if(a&&b&&chaveDedupFamilia(a)!==chaveDedupFamilia(b))conflitos.push(par[1])});
 return conflitos;
}
function salvarImportacaoFamilia(dados,somentePrevia){
 const raiz=dados&&typeof dados==='object'&&!Array.isArray(dados)?dados:{familiares:dados};
 const entrada=arrFam(raiz.familiares||raiz.FAMILIARES||raiz.family||raiz.members);
 const antecedentes=arrFam(raiz.historico_familiar||raiz.HISTORICO_FAMILIAR||raiz.antecedentes);
 const importados=entrada.map(normalizarFamiliarImportado).filter(Boolean);
 const atuais=getList();
 const stats={registrosNovos:0,registrosDuplicadosIgnorados:0,antecedentesNovos:0,antecedentesDuplicadosIgnorados:0,familiaresDuplicadosIgnorados:0,camposNovosCompletados:0};
 let novos=0,atualizados=0,primeiroId='',historicoMudou=false;const conflitosImportacao=[];
 if(importados.length===1){
  const pessoa=importados[0];
  ['medicamentos','consultas','crises'].forEach(function(chave){
   const raizLista=arrFam(raiz[chave]||raiz[chave.toUpperCase()]);
   if(!pessoa[chave].length&&raizLista.length)pessoa[chave]=raizLista.map(x=>Object.assign({},x||{}));
  });
 }
 importados.forEach(function(novo){
  const idx=localizarFamiliarImportado(atuais,novo);
  if(idx>=0){
   const antigo=ensure(atuais[idx]);
   const conflitos=detectarConflitosImportacaoFamilia(antigo,novo);if(conflitos.length)conflitosImportacao.push({nome:antigo.nome||novo.nome||'Familiar',campos:conflitos});
   const merge=mesclarFamiliarImportado(antigo,novo,stats);
   atuais[idx]=merge.familiar;
   if(!primeiroId)primeiroId=antigo.id;
   if(merge.mudou)atualizados++;
   else stats.familiaresDuplicadosIgnorados++;
  }else{
   const novoPerfil=ensure(novo);
   ['medicamentos','consultas','crises'].forEach(function(tipo){
    const dedup=mesclarListaRegistrosImportados([],novoPerfil[tipo],tipo,stats);
    novoPerfil[tipo]=dedup.lista;
   });
   atuais.push(novoPerfil);
   if(!primeiroId)primeiroId=novoPerfil.id;
   novos++;
  }
 });
 const rawHistorico=window.MSAStorage&&window.MSAStorage.get?window.MSAStorage.get(K.fam):[];
 const historicoAntes=Array.isArray(rawHistorico)?rawHistorico:[];
 const historico=[];
 historicoAntes.forEach(function(reg){
  const item=Object.assign({},reg||{}),idx=historico.findIndex(x=>mesmoHistoricoImportado(x,item));
  if(idx>=0){mesclarHistoricoImportado(historico[idx],item);historicoMudou=true;stats.antecedentesDuplicadosIgnorados++}
  else historico.push(item);
 });
 antecedentes.forEach(function(x){
  const a=x&&typeof x==='object'?x:{};
  const par=normalizarTextoIA(a.parente||a.parentesco||a.PARENTE||a.PARENTESCO);
  const cond=normalizarTextoIA(a.cond||a.condicao||a.CONDICAO||a.info||a.INFORMACAO);
  const idade=normalizarTextoIA(a.idade||a.idadeDiagnostico||a.IDADE||a.IDADE_DIAGNOSTICO);
  const obs=normalizarTextoIA(a.obs||a.observacao||a.observação||a.OBS||a.OBSERVACAO);
  const lado=normalizarTextoIA(a.ladoFamilia||a.LADO_FAMILIA);
  const certeza=normalizarTextoIA(a.certeza||a.CERTEZA);
  if(!par&&!cond&&!idade&&!obs)return;
  const novoHist={parente:par||'Não informado',cond:cond,info:cond,idade:idade,idadeDiagnostico:idade,obs:obs,observacao:obs,ladoFamilia:lado,certeza:certeza};
  const idx=historico.findIndex(z=>mesmoHistoricoImportado(z,novoHist));
  if(idx>=0){
   if(mesclarHistoricoImportado(historico[idx],novoHist))historicoMudou=true;
   stats.antecedentesDuplicadosIgnorados++;
  }else{
   historico.push(novoHist);historicoMudou=true;stats.antecedentesNovos++;
  }
  const rel=/^(pai|mãe|mae|irmão|irmao|irmã|irma|filho|filha|avô|avo|avó|tia|tio|marido|esposa|companheiro|companheira)$/i.test(par);
  if(rel){
   const nome=par,novoFam=normalizarFamiliarImportado({nome:nome,parentesco:par,condicao:cond,idadeDiagnostico:idade,ladoFamilia:lado,certeza:certeza,obs:obs,medicamentos:[],consultas:[],crises:[]});
   if(novoFam){
    const idxFam=localizarFamiliarImportado(atuais,novoFam);
    if(idxFam>=0){
     const antigo=ensure(atuais[idxFam]),merge=mesclarFamiliarImportado(antigo,novoFam,stats);
     atuais[idxFam]=merge.familiar;
     if(!primeiroId)primeiroId=antigo.id;
     if(merge.mudou)atualizados++;else stats.familiaresDuplicadosIgnorados++;
    }else{
     atuais.push(ensure(novoFam));if(!primeiroId)primeiroId=novoFam.id;novos++;
    }
   }
  }
 });
 if(!importados.length&&!antecedentes.length)throw new Error('Nenhum dado familiar válido encontrado na resposta da IA.');
 if(!somentePrevia){
 if(historicoMudou&&window.MSAStorage&&window.MSAStorage.set){
   const ok=window.MSAStorage.set(K.fam,historico);
   if(ok===false)throw new Error('Não foi possível gravar o histórico familiar neste navegador.');
  }
  if(!saveList(atuais))throw new Error('Não foi possível gravar os familiares neste navegador.');
  if(!primeiroId&&atuais.length)primeiroId=atuais[atuais.length-1].id;
  if(primeiroId)setSelected(primeiroId);
  renderFamiliares();
 }
 const repetidos=stats.familiaresDuplicadosIgnorados+stats.registrosDuplicadosIgnorados+stats.antecedentesDuplicadosIgnorados;
 return {
  novos:novos,atualizados:atualizados,duplicadosIgnorados:repetidos,
  registrosNovos:stats.registrosNovos,registrosDuplicadosIgnorados:stats.registrosDuplicadosIgnorados,
  antecedentesNovos:stats.antecedentesNovos,antecedentesDuplicadosIgnorados:stats.antecedentesDuplicadosIgnorados,
  camposNovosCompletados:stats.camposNovosCompletados,
  totalFamiliares:importados.length,totalHistorico:antecedentes.length,
  nomes:importados.map(function(p){return p.nome}).filter(Boolean),perfilId:primeiroId,conflitos:conflitosImportacao.length,conflitosLista:conflitosImportacao,previsao:!!somentePrevia
 };
}

function instalarEstilosPreviaImportacaoFamilia(){
 if(document.getElementById('msaFamImportPreviewStyles'))return;
 const s=document.createElement('style');s.id='msaFamImportPreviewStyles';
 s.textContent='.msa-fam-import-actions{display:grid;grid-template-columns:repeat(2,minmax(0,1fr))}.msa-fam-import-actions .btn{min-width:0;white-space:normal}.msa-fam-import-preview{margin-top:12px;padding:13px;border:1px solid #bfdbfe;background:#f8fbff;border-radius:14px;color:#172554}.msa-fam-import-preview-head{display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;font-size:11px;font-weight:900;letter-spacing:.04em}.msa-fam-import-preview-head b{background:#fef3c7;color:#92400e;border-radius:99px;padding:5px 8px;letter-spacing:0}.msa-fam-import-preview-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;margin:12px 0}.msa-fam-import-preview-grid>div{padding:9px;border:1px solid #dbeafe;background:#fff;border-radius:10px;min-width:0}.msa-fam-import-preview-grid b{display:block;font-size:22px}.msa-fam-import-preview-grid span{display:block;font-size:10px;line-height:1.35;color:#475569}.msa-fam-import-conflicts{margin-top:10px;padding:10px;border:1px solid #fcd34d;border-radius:12px;background:#fffbeb;color:#92400e;font-size:12px}.msa-fam-import-conflicts ul{padding-left:18px;margin:7px 0}.msa-fam-import-conflicts li{margin:5px 0;line-height:1.4}.msa-fam-import-conflicts p,.msa-fam-import-preview p{font-size:12px;line-height:1.45}.msa-fam-import-no-conflicts{color:#166534}.msa-fam-import-caution{border-top:1px solid #dbeafe;padding-top:9px;color:#475569}@media(max-width:600px){.msa-fam-import-actions{grid-template-columns:1fr}.msa-fam-import-preview-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.msa-fam-import-preview-head{align-items:flex-start;flex-direction:column}}body.msa-dark .msa-fam-import-preview{background:#111827;border-color:#263244;color:#e5edff}body.msa-dark .msa-fam-import-preview-grid>div{background:#0f172a;border-color:#263244}';
 document.head.appendChild(s);
}
function abrirImportadorRespostaFamilia(){
 instalarEstilosPreviaImportacaoFamilia();
 let old=document.getElementById('msaFamiliaIAImportModal');if(old)old.remove();
 const modal=document.createElement('div');modal.id='msaFamiliaIAImportModal';modal.className='msa-ava-overlay';
 modal.innerHTML='<div class="msa-ava-dialog" role="dialog" aria-modal="true" aria-labelledby="msaFamiliaIAImportTitle">'+
 '<div class="msa-ava-top"><div><div class="msa-fam-kicker">📥 IA · FAMÍLIA</div><h2 id="msaFamiliaIAImportTitle">Revisar importação antes de salvar</h2><p>Cole o JSON completo gerado pela IA. Primeiro veja a prévia; nada será gravado até você confirmar. Dados existentes são preservados e possíveis conflitos ficam destacados.</p></div><button type="button" class="msa-ava-close" id="msaFamiliaIAImportClose">✕</button></div>'+
 '<textarea id="msaFamiliaIAImportText" style="margin-top:14px;width:100%;min-height:260px;box-sizing:border-box;padding:13px;border:1px solid #d6deea;border-radius:14px;font-size:13px;line-height:1.45" placeholder="Cole aqui o JSON completo gerado pela IA..."></textarea>'+
 '<div id="msaFamiliaIAImportPreview" class="msa-fam-import-preview" hidden></div>'+
 '<div class="msa-ava-actions msa-fam-import-actions"><button type="button" class="btn secondary" id="msaFamiliaIAImportPaste">📋 Colar da área de transferência</button><button type="button" class="btn" id="msaFamiliaIAImportPreviewBtn">🔎 Pré-visualizar</button><button type="button" class="btn green" id="msaFamiliaIAImportSave" disabled>✅ Confirmar e salvar</button><button type="button" class="btn secondary" id="msaFamiliaIAImportGo" disabled>👤 Ver perfil importado</button><button type="button" class="btn secondary" id="msaFamiliaIAImportCancel">↩️ Cancelar</button></div>'+
 '<div id="msaFamiliaIAImportStatus" class="alert safe" role="status" aria-live="polite" style="margin-top:12px">Passo 1: cole a resposta. Passo 2: pré-visualize. Passo 3: revise os números e só então confirme para salvar.</div></div>';
 document.body.appendChild(modal);
 const input=modal.querySelector('#msaFamiliaIAImportText'),status=modal.querySelector('#msaFamiliaIAImportStatus'),preview=modal.querySelector('#msaFamiliaIAImportPreview');
 const previewBtn=modal.querySelector('#msaFamiliaIAImportPreviewBtn'),saveBtn=modal.querySelector('#msaFamiliaIAImportSave'),goBtn=modal.querySelector('#msaFamiliaIAImportGo'),pasteBtn=modal.querySelector('#msaFamiliaIAImportPaste');
 let previaRaw='',ultimaPrevia=null,importado=false;
 const fechar=function(){modal.remove()};
 const limparPrevia=function(){previaRaw='';ultimaPrevia=null;importado=false;saveBtn.disabled=true;goBtn.disabled=true;preview.hidden=true;preview.innerHTML='';previewBtn.disabled=false;saveBtn.textContent='✅ Confirmar e salvar';status.className='alert safe';status.textContent='Conteúdo alterado. Gere uma nova prévia antes de confirmar.'};
 modal.querySelector('#msaFamiliaIAImportClose').onclick=fechar;modal.querySelector('#msaFamiliaIAImportCancel').onclick=fechar;
 modal.addEventListener('click',function(e){if(e.target===modal)fechar()});
 input.addEventListener('input',limparPrevia);
 pasteBtn.onclick=async function(){try{const t=await navigator.clipboard.readText();if(t){input.value=t;input.dispatchEvent(new Event('input'));status.textContent='✅ Resposta colada. Agora clique em “Pré-visualizar”.'}else status.textContent='A área de transferência está vazia.'}catch(e){input.focus();status.textContent='Toque no campo e use Ctrl+V (ou Colar) para inserir a resposta.'}};
 previewBtn.onclick=function(){
  try{
   const raw=input.value.trim();if(!raw)throw new Error('Cole primeiro a resposta da IA.');
   const dados=extrairJSONFamilia(raw),res=salvarImportacaoFamilia(dados,true);
   previaRaw=raw;ultimaPrevia={dados:dados,res:res};importado=false;
   const conflitos=(res.conflitosLista||[]).map(function(x){return '<li><b>'+esc(x.nome)+'</b>: '+esc(x.campos.join(', '))+' — o valor já salvo será preservado; revise depois se necessário.</li>'}).join('');
   preview.innerHTML='<div class="msa-fam-import-preview-head"><span>🔎 PRÉVIA DA IMPORTAÇÃO</span><b>⚠️ Ainda não foi salvo</b></div>'+
    '<div class="msa-fam-import-preview-grid"><div><b>'+res.totalFamiliares+'</b><span>perfis no arquivo</span></div><div><b>'+res.novos+'</b><span>perfis novos</span></div><div><b>'+res.atualizados+'</b><span>perfis com novos dados</span></div><div><b>'+res.duplicadosIgnorados+'</b><span>itens repetidos identificados</span></div><div><b>'+res.registrosNovos+'</b><span>medicamentos, consultas ou crises novos</span></div><div><b>'+res.antecedentesNovos+'</b><span>antecedentes familiares novos</span></div></div>'+
    (res.camposNovosCompletados?'<p>🧩 <b>'+res.camposNovosCompletados+'</b> campos vazios serão completados com dados recebidos.</p>':'')+
    (res.conflitos?'<div class="msa-fam-import-conflicts"><b>⚠️ '+res.conflitos+' perfil(is) com possíveis conflitos</b><ul>'+conflitos+'</ul><p>Os valores existentes não serão sobrescritos automaticamente. Confira se a informação recebida se refere à mesma pessoa.</p></div>':'<p class="msa-fam-import-no-conflicts">✅ Nenhum conflito de campo básico foi identificado.</p>')+
    '<p class="msa-fam-import-caution">A prévia é uma simulação. Confira os números e possíveis conflitos antes de confirmar. A importação adiciona apenas informações novas e preserva os dados já registrados.</p>';
   preview.hidden=false;saveBtn.disabled=false;goBtn.disabled=true;previewBtn.disabled=false;status.className='alert safe';status.textContent='Prévia pronta. Nada foi salvo. Se estiver tudo certo, clique em “Confirmar e salvar”.';
  }catch(e){preview.hidden=true;preview.innerHTML='';saveBtn.disabled=true;goBtn.disabled=true;status.className='alert danger';status.textContent='❌ '+(e.message||'Não foi possível analisar a resposta.')}
 };
 saveBtn.onclick=function(){
  try{
   const raw=input.value.trim();if(!ultimaPrevia||!previaRaw||raw!==previaRaw)throw new Error('O texto mudou desde a prévia. Gere uma nova prévia antes de salvar.');
   const res=salvarImportacaoFamilia(ultimaPrevia.dados,false);window.__msaUltimoPerfilImportado=res.perfilId||'';importado=true;
   saveBtn.disabled=true;previewBtn.disabled=true;pasteBtn.disabled=true;input.disabled=true;goBtn.disabled=!res.perfilId;saveBtn.textContent='✅ Importação concluída';
   status.className='alert safe';status.innerHTML='<b>✅ Dados salvos com sucesso.</b><br>Perfis novos: '+res.novos+' · Perfis complementados: '+res.atualizados+' · Repetidos ignorados: '+res.duplicadosIgnorados+'<p>🩺 Registros clínicos novos: '+res.registrosNovos+' · Antecedentes novos: '+res.antecedentesNovos+'</p>'+(res.camposNovosCompletados?'<p>🧩 Campos completados: '+res.camposNovosCompletados+'</p>':'')+(res.conflitos?'<p>⚠️ '+res.conflitos+' perfil(is) tinham diferenças nos campos básicos. Os dados previamente salvos foram preservados.</p>':'')+'<p>Os registros só foram gravados após sua confirmação.</p>';
  }catch(e){status.className='alert danger';status.textContent='❌ '+(e.message||'Não foi possível salvar os dados.')}
 };
 goBtn.onclick=function(){if(!importado)return;const alvo=window.__msaUltimoPerfilImportado||'';fechar();if(alvo)setSelected(alvo);if(typeof go==='function')go('familiares');setTimeout(function(){if(alvo)setSelected(alvo);renderFamiliares();const detail=document.getElementById('familiarDetalhe');if(detail)detail.scrollIntoView({behavior:'smooth',block:'start'})},350)};
 input.focus();
}
window.abrirImportadorRespostaFamilia=abrirImportadorRespostaFamilia;
function renderFamiliaInteligencia(){
 const box=document.getElementById('familiares');if(!box)return;
 const host=box.querySelector('.card');if(!host)return;
 let hub=document.getElementById('familiaInteligencia');
 if(!hub){hub=document.createElement('div');hub.id='familiaInteligencia';hub.dataset.famArea='ia';host.insertBefore(hub,host.firstChild)}else hub.dataset.famArea='ia';
 const list=familiaArray();
 hub.innerHTML=
  '<div class="msa-fam-ai-card">'+
   '<div class="msa-fam-ai-head"><div><div class="msa-fam-kicker">🤖 FAMÍLIA COM IA</div><h3>Organize a família em 2 passos</h3><p>Copie o prompt, converse com a IA e depois cole a resposta para salvar tudo aqui.</p></div></div>'+
   '<div class="msa-fam-ai-steps">'+
    '<button type="button" class="msa-fam-ai-step" onclick="abrirPromptFamiliaIA()"><strong>1️⃣</strong><span>Copiar e abrir a IA</span><small>ChatGPT, Claude ou Gemini · gera tudo de uma vez, sem fazer perguntas.</small></button>'+
    '<button type="button" class="msa-fam-ai-step" onclick="abrirImportadorRespostaFamilia()"><strong>2️⃣</strong><span>Colar resposta e salvar tudo</span><small>Importa familiares, doenças, remédios, consultas e crises.</small></button>'+
   '</div>'+
  '</div>'+
  '<div class="msa-fam-actions">'+
    '<button type="button" class="msa-fam-action" onclick="copiarEntrevistaParceiroWhatsApp()"><strong>💬</strong><span>Enviar entrevista ao parceiro(a)</span><small>Copia uma mensagem para WhatsApp; a pessoa responde pela IA dela e devolve o resultado.</small></button>'+
   '<button type="button" class="msa-fam-action primary" onclick="iniciarEntrevistaAvaFamilia()"><strong>🤖</strong><span>Adicionar com a Ava</span><small>Ela faz perguntas uma por vez.</small></button>'+
   '<button type="button" class="msa-fam-action" onclick="document.getElementById(\'msa-fam-map\')?.scrollIntoView({behavior:\'smooth\',block:\'start\'})"><strong>🧬</strong><span>Ver mapa da família</span><small>Materno, paterno e núcleo próximo.</small></button>'+
   '<button type="button" class="msa-fam-action" onclick="document.getElementById(\'msa-fam-analysis\')?.scrollIntoView({behavior:\'smooth\',block:\'start\'})"><strong>📊</strong><span>Ver padrões</span><small>Condições que aparecem mais de uma vez.</small></button>'+
  '</div>'+
  '<div id="msaFamLinkRepairCard" class="card" style="border:1px solid #bfdbfe;background:linear-gradient(135deg,#eff6ff,#fff);border-radius:18px;padding:16px;margin:6px 0">'+
  '<div class="msa-fam-kicker">🧬 REVISÃO DE VÍNCULOS</div><h3 style="margin:6px 0">Corrigir vínculos e preservar os registros</h3><p style="color:#475569;line-height:1.5;margin:0 0 12px">Confira estas alterações solicitadas. Ao aplicar, o sistema atualiza somente familiares encontrados por nome exato e mantém as informações existentes. O lado de Gordo continuará pendente até você confirmar se é irmão do seu pai ou da sua mãe.</p>'+
  '<div style="display:grid;gap:9px">'+
   '<div style="background:#fff;border:1px solid #dbeafe;border-radius:12px;padding:11px"><b>👩 Rita — irmã consanguínea</b><p style="margin:5px 0 0;color:#475569;font-size:13px">Núcleo próximo. Preservar constipação crônica severa, pedra nos rins com cirurgia prévia, cirurgia para hiperidrose palmar e bariátrica prévia.</p></div>'+
   '<div style="background:#fff;border:1px solid #dbeafe;border-radius:12px;padding:11px"><b>🤝 Paulo Mendes — marido da Rita / cunhado</b><p style="margin:5px 0 0;color:#475569;font-size:13px">Parente por afinidade, separado dos padrões genéticos. Preservar amputação traumática da mão direita aos 19 anos em acidente de trabalho, cirurgia bariátrica e lesão discreta tipo psoríase no couro cabeludo.</p></div>'+
   '<div style="background:#fff;border:1px solid #fde68a;border-radius:12px;padding:11px"><b>❔ Gordo — tio</b><p style="margin:5px 0 0;color:#92400e;font-size:13px">Manter Mal de Parkinson e sinalizar o lado como pendente: confirmar se é irmão do pai (paterno) ou da mãe (materno).</p></div>'+
  '</div><button type="button" class="btn green" style="width:100%;margin-top:12px" onclick="aplicarCorrecoesVinculosFamilia()">✅ Aplicar atualizações aos familiares existentes</button>'+
  '<div id="msaFamLinkRepairStatus" role="status" style="display:'+(window.__msaFamCorrecoesVinculosStatus?'block':'none')+';white-space:pre-line;margin-top:10px;padding:10px;border-radius:10px;background:#f8fafc;color:#334155;font-size:13px">'+esc(window.__msaFamCorrecoesVinculosStatus||'')+'</div></div>'+
  '<div id="msa-fam-map" class="msa-fam-anchor">'+familiaMapaHTML(list)+'</div>'+
  '<div id="msa-fam-analysis" class="msa-fam-anchor">'+familiaAnaliseHTML(list)+'</div>';
}
function instalarCamposPerfilSaudePessoa(){const form=document.getElementById('familiarForm');if(!form||document.getElementById('fPerfilSaudeCampos'))return;const box=document.createElement('div');box.id='fPerfilSaudeCampos';box.style.cssText='display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin:10px 0';box.innerHTML='<label>📏 Altura (cm)<input id="fAltura" type="number" min="30" max="250" placeholder="Ex.: 168"></label><label>⚖️ Peso atual (kg)<input id="fPeso" type="number" min="1" max="500" step="0.1" placeholder="Ex.: 72"></label><label style="grid-column:1/-1">📐 Medidas corporais<textarea id="fMedidas" placeholder="Cintura, quadril ou outras medidas (opcional)"></textarea></label><label style="grid-column:1/-1">🏃 Rotina e atividade física<textarea id="fRotina" placeholder="Academia, caminhadas, dança, frequência de treino..."></textarea></label><label style="grid-column:1/-1">💊 Medicamentos, vitaminas ou suplementos já informados<textarea id="fMedicamentosRelato" placeholder="Nomes conhecidos; doses devem ser confirmadas"></textarea></label><small style="grid-column:1/-1;color:#64748b;font-size:11px">Campos opcionais. Registre informações de saúde de outra pessoa somente com autorização.</small>';const anchor=document.getElementById('fObs');if(anchor&&anchor.parentElement)anchor.parentElement.insertAdjacentElement('beforebegin',box);else form.appendChild(box)}
function instalarCamposHistoricoClinicoFamiliar(){const form=document.getElementById('familiarForm');if(!form||document.getElementById('fGrauParentesco'))return;const box=document.createElement('div');box.id='msaFamilyClinicalFields';box.style.cssText='display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin:10px 0';box.innerHTML='<label>🎓 Grau de parentesco<select id="fGrauParentesco"><option value="">Não informado</option><option value="1º grau">1º grau — pais, irmãos e filhos</option><option value="2º grau">2º grau — avós e netos; tios e sobrinhos*</option><option value="3º grau ou outro">3º grau ou outro</option></select></label><label>🧬 Consanguinidade conhecida?<select id="fConsanguinidade"><option value="Não informado">Não informado</option><option value="Sim">Sim</option><option value="Não">Não</option></select></label><label>🩺 Idade aproximada no diagnóstico<input id="fIdadeDiagnostico" type="number" min="0" max="130" placeholder="Ex.: 42"></label><label>❤️ Situação do familiar<select id="fStatusFamiliar"><option value="Não informado">Não informado</option><option value="Vivo">Vivo</option><option value="Falecido">Falecido</option></select></label><label style="grid-column:1/-1">🕊️ Causa do falecimento (se aplicável)<input id="fCausaFalecimento" placeholder="Ex.: infarto, câncer, causa desconhecida"></label><small style="grid-column:1/-1;color:#64748b;font-size:11px">* O grau pode variar conforme o parentesco e a convenção utilizada. Se não souber, deixe como não informado.</small>';const side=document.getElementById('fLadoFamilia');if(side&&side.parentElement)side.parentElement.insertAdjacentElement('afterend',box);else form.appendChild(box);const relation=document.getElementById('fParentesco'),degree=document.getElementById('fGrauParentesco');if(relation&&degree)relation.addEventListener('change',()=>{if(degree.value)return;const r=relation.value.toLowerCase();if(/pai|mãe|mae|irm[aã]o|filh/.test(r))degree.value='1º grau';else if(/av[oó]|neto|neta/.test(r))degree.value='2º grau'})}
function instalarCampoLadoFamilia(){const form=document.getElementById('familiarForm');if(!form||document.getElementById('fLadoFamilia'))return;const wrap=document.createElement('label');wrap.innerHTML='🧬 Lado da família<select id="fLadoFamilia"><option value="">Não informado</option><option>Materno</option><option>Paterno</option><option>Ambos / não sei</option></select>';const alvo=document.getElementById('fCondicao');if(alvo&&alvo.parentElement)alvo.parentElement.parentElement.insertBefore(wrap,alvo.parentElement);else form.appendChild(wrap)}
const avaQuestions=[{key:'nome',title:'Quem é esse familiar?',help:'Digite o nome da pessoa que você quer adicionar.',type:'text',placeholder:'Ex.: Maria'},{key:'parentesco',title:'Qual é o parentesco?',help:'Ava vai usar isso para organizar o mapa da família.',type:'select',options:['Cônjuge','Marido','Esposa','Namorado(a)','Companheiro(a)','Parceiro(a)','Ficante','Outra relação afetiva','Pai','Mãe','Irmão/irmã','Filho(a)','Avô/avó','Tio/tia','Outro']},{key:'sexo',title:'Qual é o sexo?',help:'Pode deixar como “Não informado” se preferir.',type:'select',options:['Não informado','Masculino','Feminino','Outro']},{key:'idade',title:'Qual é a idade aproximada?',help:'Pode informar apenas uma estimativa.',type:'number',placeholder:'Ex.: 38'},{key:'altura',title:'Qual é a altura?',help:'Opcional. Informe em centímetros, por exemplo 168.',type:'number',placeholder:'Ex.: 168 cm'},{key:'peso',title:'Qual é o peso atual?',help:'Opcional. Informe em quilogramas.',type:'number',placeholder:'Ex.: 72 kg'},{key:'medidas',title:'Tem medidas corporais para registrar?',help:'Opcional: cintura, quadril ou outras medidas.',type:'text',placeholder:'Ex.: cintura 82 cm'},{key:'rotina',title:'Como é a rotina de atividade física?',help:'Opcional: academia, caminhada, dança ou rotina sedentária.',type:'text',placeholder:'Ex.: academia 3 vezes por semana'},{key:'ladoFamilia',title:'De qual lado da família?',help:'Isso ajuda a organizar o mapa em materno e paterno.',type:'select',options:['Não informado','Materno','Paterno','Ambos / não sei']},{key:'condicao',title:'Ele(a) tem alguma doença ou condição diagnosticada?',help:'Informe somente o que você sabe. Pode escrever várias.',type:'text',placeholder:'Ex.: diabetes e hipertensão'},{key:'medicamentosRelato',title:'Usa medicamentos, vitaminas ou suplementos?',help:'Opcional. Registre os nomes que conhece; confirme doses depois.',type:'text',placeholder:'Ex.: medicamento, vitamina D'},{key:'idadeDiagnostico',title:'Você sabe com que idade foi diagnosticada?',help:'Pode deixar em branco ou informar uma idade aproximada.',type:'number',placeholder:'Ex.: 55'},{key:'recorrencia',title:'Essa condição aparece em outros familiares?',help:'Ex.: “sim, em duas tias” ou “não sei”.',type:'text',placeholder:'Ex.: Sim, em duas tias'},{key:'certeza',title:'Quanto você confia nessa informação?',help:'Diferencie o que foi confirmado do que é apenas lembrança familiar.',type:'select',options:['Confirmado por profissional','Informado pela família','Suspeita / não confirmado','Não sei']},{key:'obs',title:'Existe mais alguma informação importante?',help:'Cirurgias, infarto, AVC, câncer, internações ou outras observações.',type:'text',placeholder:'Pode deixar em branco'}];
function fecharAvaFamilia(){const m=document.getElementById('msaAvaFamiliaModal');if(m)m.remove();window.__msaAvaFam=null}
function renderAvaFamilia(){let m=document.getElementById('msaAvaFamiliaModal');if(!m)return;const st=window.__msaAvaFam||{step:0,data:{}},q=avaQuestions[st.step],d=st.data||{},val0=d[q.key]??'';let field='';if(q.type==='select')field='<select id="msaAvaFamInput">'+q.options.map(o=>'<option '+(String(o)===String(val0)?'selected':'')+'>'+esc(o)+'</option>').join('')+'</select>';else field='<input id="msaAvaFamInput" type="'+q.type+'" value="'+esc(val0)+'" placeholder="'+esc(q.placeholder||'')+'" '+(q.key==='nome'?'required':'')+'>';const pct=Math.round((st.step/(avaQuestions.length-1))*100);m.querySelector('.msa-ava-dialog').innerHTML='<div class="msa-ava-top"><div><div class="msa-fam-kicker">🤖 AVA · ENTREVISTA FAMILIAR</div><h2>'+esc(q.title)+'</h2><p>'+esc(q.help)+'</p></div><button type="button" class="msa-ava-close" onclick="fecharAvaFamilia()">✕</button></div><div class="msa-ava-progress"><div style="width:'+pct+'%"></div></div><div class="msa-ava-step">Pergunta '+(st.step+1)+' de '+avaQuestions.length+'</div><label class="msa-ava-field">'+(q.type==='select'?'Escolha uma opção':'Resposta')+field+'</label><div class="msa-ava-actions">'+(st.step?'<button type="button" class="btn secondary" onclick="avaFamiliaAnterior()">← Voltar</button>':'')+'<button type="button" class="btn green" onclick="avaFamiliaProxima()">'+(st.step===avaQuestions.length-1?'✅ Salvar familiar':'Continuar →')+'</button></div><div class="alert safe" style="margin-top:12px">🔒 A entrevista fica neste navegador e nada é enviado automaticamente para uma IA.</div>';const inp=document.getElementById('msaAvaFamInput');if(inp){inp.focus();inp.addEventListener('keydown',e=>{if(e.key==='Enter'&&q.type!=='text')avaFamiliaProxima()})}}

window.copiarEntrevistaParceiroWhatsApp=function(){
 const prompt=[
 'OLÁ! Vamos preencher seu perfil de saúde para o Minha Saúde IA.',
 '',
 'Copie este texto e cole no ChatGPT, Gemini ou outra IA. Faça uma entrevista amigável, com UMA pergunta por vez e espere minha resposta. Posso pular qualquer pergunta ou responder “não sei”.',
 '',
 'OBJETIVO: organizar um resumo do meu perfil de saúde para eu escolher o que compartilhar com meu/minha parceiro(a). Não invente dados, não faça diagnóstico e não recomende alterar medicamentos.',
 '',
 'PERGUNTE UMA DE CADA VEZ sobre: nome ou apelido autorizado; idade e sexo opcionais; altura, peso e medidas; rotina, sono, alimentação e atividade física; condições conhecidas, cirurgias e alergias; medicamentos, vitaminas e suplementos (dose/frequência apenas se eu souber); consultas, exames, sintomas e vacinas que eu quiser informar; e histórico familiar conhecido.',
 '',
 'PRIVACIDADE: peça minha autorização antes de começar. Não solicite CPF, endereço, senha ou dados desnecessários. Deixe claro que posso pular qualquer pergunta.',
 '',
 'AO TERMINAR AS PERGUNTAS: mostre um resumo curto e peça que eu confirme ou corrija. Depois da minha confirmação, gere AUTOMATICAMENTE um JSON válido para importar no Minha Saúde IA. Se eu disser “gere o JSON agora”, gere imediatamente usando todas as minhas respostas anteriores.',
 '',
 'O JSON deve ter a chave "familiares" com uma lista e a chave "historico_familiar" com uma lista, nesta estrutura:',
 '{"familiares":[{"nome":"NOME OU APELIDO AUTORIZADO","parentesco":"Namorado(a)","sexo":"","idade":"","altura":"","peso":"","medidas":"","rotina":"","medicamentosRelato":"","condicao":"","alergias":"","sangue":"","contato":"","obs":"","medicamentos":[],"consultas":[],"crises":[]}],"historico_familiar":[]}',
 '',
 'Use “Namorado(a)”, “Namorada(o)”, “Cônjuge” ou “Companheiro(a)” conforme a relação informada. Não invente informações. Não use Markdown nem cercas de código em volta do JSON final. A resposta final precisa incluir o objeto JSON completo.',
 '',
 'Quando gerar o JSON, oriente-me a copiar a resposta inteira e enviá-la pelo WhatsApp à pessoa que me convidou. Ela abrirá Minha Saúde IA → Meu círculo de saúde → Importar respostas recebidas. Nada deve ser salvo automaticamente em outro sistema.',
 '',
 'Comece perguntando se concordo em preencher e compartilhar as informações.'
 ].join('\n');
 const done=()=>alert('📋 Entrevista copiada! Envie-a pelo WhatsApp. Depois das respostas, peça que a IA gere o JSON final. Copie o JSON inteiro e importe em Meu círculo de saúde → Importar respostas recebidas.');
 if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(prompt).then(done).catch(()=>fallbackIAFamiliar(prompt));else fallbackIAFamiliar(prompt);
};

window.iniciarEntrevistaAvaFamilia=function(){if(document.getElementById('msaAvaFamiliaModal'))return;window.__msaAvaFam={step:0,data:{}};const m=document.createElement('div');m.id='msaAvaFamiliaModal';m.className='msa-ava-overlay';m.innerHTML='<div class="msa-ava-dialog" role="dialog" aria-modal="true"></div>';document.body.appendChild(m);renderAvaFamilia()}
window.avaFamiliaProxima=function(){const st=window.__msaAvaFam;if(!st)return;const q=avaQuestions[st.step],inp=document.getElementById('msaAvaFamInput');if(!inp)return;const v=String(inp.value||'').trim();if(q.key==='nome'&&!v){alert('Informe o nome do familiar.');return}st.data[q.key]=v;if(st.step<avaQuestions.length-1){st.step++;renderAvaFamilia();return}const d=st.data,p={id:uid('fam'),nome:d.nome,parentesco:d.parentesco||'Outro',sexo:d.sexo&&d.sexo!=='Não informado'?d.sexo:'',idade:d.idade||'',condicao:d.condicao||'',alergias:'',sangue:'',contato:'',obs:[d.idadeDiagnostico?'Idade aproximada ao diagnóstico: '+d.idadeDiagnostico+' anos':'',d.recorrencia?'Outros familiares com condição semelhante: '+d.recorrencia:'',d.certeza?'Nível de confiança: '+d.certeza:'',d.obs||''].filter(Boolean).join(' '),ladoFamilia:d.ladoFamilia||'',criadoEm:new Date().toISOString(),medicamentos:[],consultas:[],crises:[]};const list=getList();list.push(p);if(!saveList(list)){alert('Não foi possível salvar o familiar.');return}fecharAvaFamilia();setSelected(p.id);renderFamiliares();setTimeout(()=>document.getElementById('familiarDetalhe')?.scrollIntoView({behavior:'smooth',block:'start'}),80);alert('✅ Familiar cadastrado pela Ava.')}
window.avaFamiliaAnterior=function(){const st=window.__msaAvaFam;if(!st)return;const inp=document.getElementById('msaAvaFamInput'),q=avaQuestions[st.step];if(inp)st.data[q.key]=String(inp.value||'').trim();if(st.step){st.step--;renderAvaFamilia()}}
function instalarEstilosFamiliaInteligente(){if(document.getElementById('msaV587FamStyles'))return;const s=document.createElement('style');s.id='msaV587FamStyles';s.textContent="#familiaInteligencia{display:grid;gap:12px;margin-bottom:15px}\n.msa-fam-ai-card{border:1px solid #dbe5ff;background:linear-gradient(135deg,#f5f8ff,#faf7ff);border-radius:18px;padding:15px;margin-bottom:2px}.msa-fam-ai-head h3{margin:4px 0 4px;font-size:19px}.msa-fam-ai-head p{margin:0;color:#687386;font-size:13px;line-height:1.45}.msa-fam-ai-steps{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:12px}.msa-fam-ai-step{border:1px solid #dbe3ee;background:#fff;border-radius:15px;padding:13px;text-align:left;cursor:pointer;font:inherit;color:#172033}.msa-fam-ai-step strong{display:block;font-size:21px;margin-bottom:5px}.msa-fam-ai-step span{display:block;font-weight:900}.msa-fam-ai-step small{display:block;color:#687386;margin-top:4px;line-height:1.35}.msa-fam-actions{display:grid;grid-template-columns:repeat(3,1fr);gap:9px}.msa-fam-action{border:1px solid #dbe3ee;background:#fff;border-radius:16px;padding:13px;text-align:left;cursor:pointer;color:#172033;font:inherit}.msa-fam-action.primary{background:linear-gradient(135deg,#eef4ff,#f7f1ff);border-color:#d7e4ff}.msa-fam-action strong{display:block;font-size:24px;margin-bottom:6px}.msa-fam-action span{display:block;font-weight:900}.msa-fam-action small{display:block;color:#687386;margin-top:3px;line-height:1.35}\n.msa-fam-map-card,.msa-fam-analysis-card{border:1px solid #e3e8f0;border-radius:18px;padding:16px;background:#fbfdff}.msa-fam-map-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}.msa-fam-kicker{font-size:11px;font-weight:900;letter-spacing:.06em;color:#2563eb}.msa-fam-map-head h3,.msa-fam-analysis-card h3{margin:4px 0 4px;font-size:19px}.msa-fam-map-head p,.msa-fam-analysis-card>p{margin:0;color:#687386;font-size:13px;line-height:1.45}\n.msa-fam-map-stats,.msa-fam-analysis-kpis{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:12px}.msa-fam-map-stats>div,.msa-fam-analysis-kpis>div{border:1px solid #e6ebf2;background:#fff;border-radius:13px;padding:10px}.msa-fam-map-stats b,.msa-fam-analysis-kpis b{display:block;font-size:22px}.msa-fam-map-stats span,.msa-fam-analysis-kpis span{font-size:11px;color:#687386}\n.msa-fam-map-tree{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:13px}.msa-fam-you{grid-column:1/-1;text-align:center;padding:10px;border:1px dashed #b8c9e8;border-radius:14px;background:#f3f7ff;color:#1d4ed8}.msa-fam-you small{display:block;color:#687386;font-size:11px;margin-top:2px}\n.msa-fam-map-group{border:1px solid #e3e8f0;border-radius:15px;background:#fff;padding:10px}.msa-fam-map-title{font-size:12px;font-weight:900;margin-bottom:4px}.msa-fam-map-title span{float:right;color:#2563eb}.msa-fam-map-explain{font-size:11px;line-height:1.45;color:#64748b;margin:0 0 9px}.msa-fam-map-list{display:grid;gap:7px}.msa-fam-map-person{width:100%;display:flex;gap:8px;align-items:flex-start;text-align:left;border:1px solid #eef2f7;background:#f8fafc;border-radius:12px;padding:9px;cursor:pointer;font:inherit}.msa-fam-map-person:hover{background:#eff6ff;border-color:#cfe0ff}.msa-fam-avatar{font-size:22px;line-height:1}.msa-fam-map-person b,.msa-fam-map-person small,.msa-fam-map-person em{display:block}.msa-fam-map-person small{font-size:10px;color:#687386;margin-top:2px}.msa-fam-map-person em{font-size:11px;color:#334155;font-style:normal;margin-top:3px;line-height:1.25}\n.msa-fam-empty{padding:12px;text-align:center;color:#687386;border:1px dashed #d7dee9;border-radius:12px;font-size:12px}.msa-fam-patterns{display:grid;gap:8px;margin-top:12px}.msa-fam-pattern{border:1px solid #e4e9f0;background:#fff;border-radius:14px;padding:11px}.msa-fam-pattern>div:first-child{display:flex;justify-content:space-between;gap:8px}.msa-fam-pattern small{color:#687386;font-size:11px}.msa-fam-members{display:flex;gap:5px;flex-wrap:wrap;margin-top:7px}.msa-fam-members button{border:1px solid #dbe5f5;background:#f8fbff;border-radius:99px;padding:5px 8px;font-size:11px;font-weight:800;color:#2457c5;cursor:pointer}.msa-fam-anchor{scroll-margin-top:12px}\n@media(max-width:760px){.msa-fam-ai-steps{grid-template-columns:1fr}.msa-fam-actions{grid-template-columns:1fr}.msa-fam-map-tree{grid-template-columns:1fr}.msa-fam-map-head{flex-direction:column}.msa-fam-map-head .btn{width:100%}.msa-fam-map-stats,.msa-fam-analysis-kpis{grid-template-columns:1fr 1fr}.msa-fam-you{grid-column:auto}.msa-fam-map-group{min-height:0}}@media(max-width:430px){.msa-fam-map-stats,.msa-fam-analysis-kpis{grid-template-columns:1fr}.msa-fam-map-card,.msa-fam-analysis-card{padding:13px}}\n.msa-ava-overlay{position:fixed;inset:0;background:rgba(15,23,42,.68);z-index:100500;display:flex;align-items:center;justify-content:center;padding:18px}.msa-ava-dialog{width:min(680px,100%);max-height:90vh;overflow:auto;background:#fff;border-radius:24px;padding:21px;box-shadow:0 25px 80px rgba(0,0,0,.28)}.msa-ava-top{display:flex;justify-content:space-between;gap:14px;align-items:flex-start}.msa-ava-top h2{margin:5px 0 5px}.msa-ava-top p{margin:0;color:#687386;font-size:13px;line-height:1.45}.msa-ava-close{width:40px;height:40px;border:0;border-radius:12px;background:#f1f5f9;cursor:pointer;font-size:18px;font-weight:900}.msa-ava-progress{height:9px;background:#e8edf5;border-radius:99px;overflow:hidden;margin-top:16px}.msa-ava-progress>div{height:100%;background:linear-gradient(90deg,#2563eb,#6d28d9);transition:width .2s ease}.msa-ava-step{margin-top:8px;color:#687386;font-size:11px;font-weight:900}.msa-ava-field{display:block;margin-top:16px;font-size:13px;font-weight:900}.msa-ava-field input,.msa-ava-field select{margin-top:7px;min-height:50px;font-size:16px}.msa-ava-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:16px}.msa-ava-actions .btn{min-width:145px}@media(max-width:600px){.msa-ava-overlay{padding:10px;align-items:flex-end}.msa-ava-dialog{max-height:88vh;border-radius:22px 22px 12px 12px;padding:17px}.msa-ava-actions{display:grid;grid-template-columns:1fr}.msa-ava-actions .btn{width:100%}}";document.head.appendChild(s)}
function instalarControleFamiliares(){
 const box=document.getElementById('settingsPreferences');if(!box||document.getElementById('prefFamiliares'))return;
 const pref=(()=>{try{return (window.MSAStorage.get('msa2_preferencias')||[])[0]||{}}catch(e){return{}}})();
 const wrap=document.createElement('label');wrap.id='prefFamiliares';wrap.style.cssText='display:flex;flex-direction:column;gap:6px;border:1px solid #dbe4f0;border-radius:14px;padding:12px;background:#fff';
 wrap.innerHTML='<span style="font-weight:900">👨‍👩‍👧‍👦 Familiares</span><small class="muted">Mostra ou oculta a área para acompanhar outras pessoas da família.</small><select id="prefFamiliaresSelect"><option value="on">Ativado</option><option value="off">Ocultado</option></select>';
 box.appendChild(wrap);
 const sel=wrap.querySelector('select');sel.value=pref.familiares==='off'?'off':'on';
 sel.onchange=function(){try{const p=(window.MSAStorage.get('msa2_preferencias')||[])[0]||{};p.familiares=this.value;window.MSAStorage.set('msa2_preferencias',[p]);aplicarVisibilidadeFamiliares()}catch(e){}};
}
function aplicarVisibilidadeFamiliares(){
 let pref={};try{pref=(window.MSAStorage.get('msa2_preferencias')||[])[0]||{}}catch(e){}
 const off=pref.familiares==='off';
 document.querySelectorAll('[data-tab="familiares"],[data-mobile-tab="familiares"]').forEach(el=>el.classList.toggle('msa-feature-off',off));
 const sec=document.getElementById('familiares');if(sec)sec.classList.toggle('msa-feature-off',off);
}
function init(){instalarControleFamiliares();aplicarVisibilidadeFamiliares();
 const form=document.getElementById('familiarForm');if(form)form.onsubmit=e=>{e.preventDefault();const p={id:uid('fam'),nome:val('fNome'),parentesco:val('fParentesco'),sexo:val('fSexo'),nasc:val('fNasc'),idade:val('fIdade'),altura:val('fAltura'),peso:val('fPeso'),medidas:val('fMedidas'),rotina:val('fRotina'),medicamentosRelato:val('fMedicamentosRelato'),condicao:val('fCondicao'),alergias:val('fAlergias'),sangue:val('fSangue'),contato:val('fContato'),obs:val('fObs'),ladoFamilia:val('fLadoFamilia'),grauParentesco:val('fGrauParentesco'),consanguinidade:val('fConsanguinidade'),idadeDiagnostico:val('fIdadeDiagnostico'),statusFamiliar:val('fStatusFamiliar'),causaFalecimento:val('fCausaFalecimento'),criadoEm:new Date().toISOString(),medicamentos:[],consultas:[],crises:[]};if(!p.nome){alert('Informe o nome.');return}const list=getList();list.push(p);if(!saveList(list)){alert('Não foi possível salvar.');return}setSelected(p.id);form.reset();renderFamiliares()};
 renderFamiliares();
 const settings=document.getElementById('settingsPreferences');if(settings){const mo=new MutationObserver(()=>{if(!document.getElementById('prefFamiliares'))instalarControleFamiliares();aplicarVisibilidadeFamiliares()});mo.observe(settings,{childList:true});}
 const obs=new MutationObserver(()=>renderFamiliares());const section=document.getElementById('familiares');if(section)obs.observe(section,{attributes:true,attributeFilter:['class']});
}
window.renderFamiliares=renderFamiliares;
window.renderAlertasHistoricoFamiliar=renderAlertasHistoricoFamiliar;
window.addEventListener('msa:familiares-atualizados',()=>setTimeout(renderAlertasHistoricoFamiliar,0));
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{init();renderAlertasHistoricoFamiliar()},{once:true});else{init();renderAlertasHistoricoFamiliar();}

})();