/* Minha Saúde IA V6.94 — apresentação visual de doenças e condições. */
(function(){
'use strict';
const $=(s,r=document)=>r.querySelector(s);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const arr=v=>Array.isArray(v)?v:(v&&typeof v==='object'?[v]:[]);
function read(key){try{const v=window.MSAStorage?.get(key);return v==null?[]:arr(v)}catch(_){return []}}
function profile(){return read('msa2_perfil')[0]||{}}
function conditions(){
 const p=profile(),out=[];
 const cond=p.cond??p.condicoes??p.doencas??p.diagnosticos;
 if(typeof cond==='string')cond.split(/[\n;|]+/).map(x=>x.trim()).filter(Boolean).forEach(name=>out.push({name,source:'Meu perfil'}));
 else arr(cond).forEach(x=>out.push({name:typeof x==='string'?x:(x.nome||x.nomeCondicao||x.condicao||x.doenca||x.diagnostico||'Condição registrada'),detail:typeof x==='object'?(x.observacao||x.descricao||x.status||''): '',source:'Meu perfil'}));
 ['msa2_condicoes','msa2_historico_medico','msa2_historico_condicoes','msa2_doencas'].forEach(key=>read(key).forEach(x=>{
  const name=typeof x==='string'?x:(x.nome||x.nomeCondicao||x.condicao||x.doenca||x.diagnostico||x.titulo);
  if(name)out.push({name,detail:typeof x==='object'?(x.observacao||x.descricao||x.status||''):'',date:typeof x==='object'?(x.dataDiagnostico||x.data||x.createdAt||''):'',source:'Registros de saúde'});
 }));
 const seen=new Set();return out.filter(x=>{const k=String(x.name).toLowerCase().trim();if(!k||seen.has(k))return false;seen.add(k);return true});
}
function formatDiseaseDate(v){if(!v)return '';const raw=String(v).trim();const m=raw.match(/^(\d{4})-(\d{2})-(\d{2})/);if(m)return m[3]+'/'+m[2]+'/'+m[1];const d=new Date(v);return Number.isNaN(d.getTime())?raw:d.toLocaleDateString('pt-BR')}
function diseaseType(x){const s=(String(x.name||'')+' '+String(x.detail||'')).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();if(/\b(exame|ultrassom|ressonancia|laboratorio|hemograma|radiografia|tomografia)\b/.test(s))return{key:'exam',label:'Exame',icon:'🧪'};if(/\b(medicamento|remedio|adalimumabe|hyrimoz|cosentyx|comprimido|injecao)\b/.test(s))return{key:'medication',label:'Medicamento',icon:'💊'};if(/\b(sintoma|dor|febre|coceira|nausea|tontura|fadiga)\b/.test(s))return{key:'symptom',label:'Sintoma',icon:'😣'};if(/\b(consulta|retorno medico|especialista)\b/.test(s))return{key:'consult',label:'Consulta',icon:'🩺'};return{key:'condition',label:'Condição de saúde',icon:'🩺'}}
function diseaseHashtag(name){
 const plain=String(name||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 const patterns=[
  [/hernia\s+epigastrica/,'HerniaEpigastrica'],
  [/polipo\s+(?:de\s+)?vesicula/,'PolipoDeVesicula'],
  [/espondilose\s+cervical/,'EspondiloseCervical'],
  [/psoriase/,'Psoriase'],
  [/artrite\s+psori[aá]sica/,'ArtritePsoriasica'],
  [/ansiedade.*fobia|fobia.*ansiedade/,'AnsiedadeEFobia'],
  [/ansiedade/,'Ansiedade'],
  [/fobia/,'Fobia']
 ];
 for(const [re,tag] of patterns)if(re.test(plain))return '#'+tag;
 const stop=new Set(['inicio','historico','de','da','do','das','dos','com','sem','e','para','sobre','condicao','doenca','saude','requer','desde','anos','leve','recorrente']);
 const words=plain.replace(/[^a-z0-9\\s]/g,' ').split(/\\s+/).filter(w=>w.length>2&&!stop.has(w));
 const tag=words.slice(0,2).map(w=>w.charAt(0).toUpperCase()+w.slice(1)).join('');
 return '#'+(tag||'CondicaoDeSaude');
}
function ensureStyles(){if($('#msa92DiseasesStyles'))return;const s=document.createElement('style');s.id='msa92DiseasesStyles';s.textContent=[
'#msa90DiseasesActions{margin-top:10px;gap:8px;flex-wrap:wrap}',
'#msa90DiseasesPanel .msa94-summary{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin:15px 0 11px;padding:12px;border:1px solid #e0e7ff;border-radius:14px;background:#f8faff}',
'#msa90DiseasesPanel .msa94-total{display:inline-flex;align-items:center;gap:7px;border-radius:12px;padding:9px 12px;background:#eef2ff;color:#4338ca;font-size:13px;font-weight:900}',
'#msa90DiseasesPanel .msa94-total strong{font-size:22px;line-height:1}',
'#msa90DiseasesPanel .msa94-summary small{font-size:11px;color:#64748b}',
'#msa90DiseasesPanel .msa94-hashtag-title{font-size:11px;font-weight:850;color:var(--muted,#64748b);margin:12px 0 7px}',
'#msa90DiseasesPanel .msa94-hashtags{display:flex;flex-wrap:wrap;gap:7px;margin:0 0 14px}',
'#msa90DiseasesPanel .msa94-hashtag{display:inline-flex;align-items:center;gap:6px;max-width:100%;border:1px solid #dbe4ff;border-radius:999px;padding:7px 10px;background:#f5f7ff;color:#4338ca;font:inherit;font-size:11px;font-weight:850;cursor:pointer;overflow-wrap:anywhere}',
'#msa90DiseasesPanel .msa94-hashtag span{display:inline-grid;place-items:center;min-width:18px;height:18px;padding:0 4px;border-radius:999px;background:#e0e7ff;color:#3730a3;font-size:10px}',
'#msa90DiseasesPanel .msa94-hashtag[aria-pressed="true"]{background:#4338ca;border-color:#4338ca;color:#fff}',
'#msa90DiseasesPanel .msa94-hashtag[aria-pressed="true"] span{background:rgba(255,255,255,.2);color:#fff}',
'#msa90DiseasesPanel .msa94-filter-status{font-size:11px;color:var(--muted,#64748b);margin:0 0 5px}',
'body.msa-dark #msa90DiseasesPanel .msa94-summary{background:#111827;border-color:#334155}body.msa-dark #msa90DiseasesPanel .msa94-total{background:#24234f;color:#c7d2fe}body.msa-dark #msa90DiseasesPanel .msa94-hashtag{background:#172033;border-color:#334155;color:#c7d2fe}body.msa-dark #msa90DiseasesPanel .msa94-hashtag span{background:#334155;color:#e2e8f0}',
'@media(max-width:600px){#msa90DiseasesPanel .msa94-summary{align-items:flex-start;flex-direction:column;gap:7px;padding:11px}#msa90DiseasesPanel .msa94-total{width:100%;justify-content:flex-start}#msa90DiseasesPanel .msa94-hashtags{gap:6px}#msa90DiseasesPanel .msa94-hashtag{font-size:11px;padding:7px 9px}}',
'#msa90DiseasesActions #msa90DiseasesButton{border:1px solid #d9defb;background:#f4f5ff;color:#4338ca;min-height:44px;border-radius:13px;padding:11px 15px;font-weight:850;box-shadow:none}',
'#msa90DiseasesActions #msa90DiseasesButton:hover{background:#eceeff;border-color:#bfc8ff}',
'#msa90DiseasesPanel{margin-top:12px;border:1px solid #cdd5ff;background:var(--card,#fff);border-radius:18px;padding:16px}',
'#msa90DiseasesPanel[hidden]{display:none!important}',
'#msa90DiseasesPanel .msa92-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap}',
'#msa90DiseasesPanel .msa92-heading{min-width:0;flex:1}',
'#msa90DiseasesPanel .msa92-heading h3{font-size:17px;line-height:1.35;font-weight:850;color:var(--text,#172033);margin:0 0 5px}',
'#msa90DiseasesPanel .msa92-intro{font-size:12px;line-height:1.55;color:var(--muted,#64748b);margin:0}',
'#msa90DiseasesPanel .msa92-list{display:grid;grid-template-columns:minmax(0,1fr);gap:12px;margin-top:16px}',
'#msa90DiseasesPanel .msa92-card{--cc:#7c3aed;--ct:#f5f3ff;border:1px solid var(--border,#e2e8f0);border-left:4px solid var(--cc);background:var(--card,#fff);border-radius:15px;padding:14px 15px;min-width:0;box-shadow:0 3px 10px rgba(15,23,42,.035)}',
'#msa90DiseasesPanel .msa92-card.kind-exam{--cc:#2563eb;--ct:#eff6ff}#msa90DiseasesPanel .msa92-card.kind-medication{--cc:#059669;--ct:#ecfdf5}#msa90DiseasesPanel .msa92-card.kind-symptom{--cc:#d97706;--ct:#fffbeb}#msa90DiseasesPanel .msa92-card.kind-consult{--cc:#0d9488;--ct:#f0fdfa}',
'#msa90DiseasesPanel .msa92-top{display:flex;align-items:flex-start;gap:9px;min-width:0}',
'#msa90DiseasesPanel .msa92-icon{display:inline-grid;place-items:center;flex:0 0 31px;width:31px;height:31px;border-radius:10px;background:var(--ct);font-size:16px}',
'#msa90DiseasesPanel .msa92-copy{min-width:0;flex:1}',
'#msa90DiseasesPanel .msa92-name{display:block;font-size:15px;font-weight:850;line-height:1.45;overflow-wrap:anywhere;color:var(--text,#172033)}',
'#msa90DiseasesPanel .msa92-badges{display:flex;flex-wrap:wrap;gap:6px;margin-top:9px}',
'#msa90DiseasesPanel .msa92-badge{display:inline-flex;align-items:center;border-radius:999px;padding:4px 8px;font-size:10px;line-height:1.35;font-weight:800;white-space:normal}',
'#msa90DiseasesPanel .msa92-cat{background:var(--ct);color:var(--cc)}#msa90DiseasesPanel .msa92-source{background:#f1f5f9;color:#475569}#msa90DiseasesPanel .msa92-date{background:#ecfdf5;color:#047857}#msa90DiseasesPanel .msa92-missing{background:#fff7ed;color:#b45309;border:1px solid #fed7aa}',
'#msa90DiseasesPanel .msa92-detail{font-size:13px;line-height:1.55;color:var(--muted,#64748b);margin:9px 0 0;overflow-wrap:anywhere}',
'#msa90DiseasesPanel .msa92-empty{margin-top:14px;padding:15px;border-radius:14px;border:1px dashed #cbd5e1;background:#f8fafc}#msa90DiseasesPanel .msa92-empty strong{font-size:14px;line-height:1.5}#msa90DiseasesPanel .msa92-empty p{font-size:13px;line-height:1.55;color:var(--muted,#64748b);margin:7px 0 12px}',
'body.msa-dark #msa90DiseasesPanel .msa92-card{background:#111827;border-color:#334155}body.msa-dark #msa90DiseasesPanel .msa92-source{background:#273449;color:#e2e8f0}body.msa-dark #msa90DiseasesPanel .msa92-empty{background:#111827;border-color:#475569}',
'@media(max-width:600px){#msa90DiseasesPanel{padding:13px;border-radius:16px}#msa90DiseasesPanel .msa92-heading{flex-basis:100%}#msa90DiseasesPanel #msa90Close{width:100%}#msa90DiseasesPanel .msa92-list{gap:12px;margin-top:14px}#msa90DiseasesPanel .msa92-card{padding:13px;border-radius:14px}#msa90DiseasesPanel .msa92-name{font-size:15px}#msa90DiseasesPanel .msa92-detail{font-size:13px;line-height:1.6}#msa90DiseasesPanel .msa92-badge{font-size:10px;padding:5px 8px}}'
].join('\n');document.head.appendChild(s)}
function render(){
 const section=$('#timeline');if(!section||$('#msa90DiseasesButton'))return;
 const filters=$('#timelineFilters');if(!filters)return;
 const btn=document.createElement('button');btn.type='button';btn.id='msa90DiseasesButton';btn.className='btn secondary';btn.textContent='🩺 Minhas doenças';
 ensureStyles();const panel=document.createElement('div');panel.id='msa90DiseasesPanel';panel.className='card';panel.hidden=true;panel.setAttribute('role','region');panel.setAttribute('aria-label','Minhas doenças e condições');
 const actions=document.createElement('div');actions.id='msa90DiseasesActions';actions.className='row';actions.style.cssText='margin-top:8px;gap:7px;flex-wrap:wrap';actions.appendChild(btn);filters.insertAdjacentElement('afterend',actions);actions.insertAdjacentElement('afterend',panel);
 function draw(){
  const items=conditions(),name=profile().nome||'perfil atual';
  const cards=items.map((x,i)=>{const cat=diseaseType(x),hasDate=Boolean(x.date);return '<article class="msa92-card kind-'+cat.key+'" data-disease-index="'+i+'"><div class="msa92-top"><span class="msa92-icon" aria-hidden="true">'+cat.icon+'</span><div class="msa92-copy"><strong class="msa92-name">'+esc(x.name)+'</strong><div class="msa92-badges"><span class="msa92-badge msa92-cat">'+esc(cat.label)+'</span><span class="msa92-badge msa92-source">'+esc(x.source||'Registro de saúde')+'</span><span class="msa92-badge '+(hasDate?'msa92-date':'msa92-missing')+'">'+(hasDate?'📅 ':'⚠️ ')+esc(hasDate?formatDiseaseDate(x.date):'Data não informada')+'</span></div></div></div>'+(x.detail?'<p class="msa92-detail">'+esc(x.detail)+'</p>':'')+'</article>'}).join('');
  const hashtags=items.map((x,i)=>'<button type="button" class="msa94-hashtag" data-disease-filter="'+i+'" aria-pressed="false">'+esc(diseaseHashtag(x.name))+' <span>1</span></button>').join('');
  const summary='<div class="msa94-summary"><span class="msa94-total"><strong>'+items.length+'</strong> '+(items.length===1?'doença/condição cadastrada':'doenças/condições cadastradas')+'</span><small>'+items.length+' etiqueta(s) de doença neste perfil</small></div>';
  const hashPanel=items.length?'<div class="msa94-hashtag-title">Filtrar por doença</div><div class="msa94-hashtags"><button type="button" class="msa94-hashtag" data-disease-all aria-pressed="true">#Todas <span>'+items.length+'</span></button>'+hashtags+'</div><p class="msa94-filter-status" id="msa94DiseaseFilterStatus">Mostrando todas as '+items.length+' condições.</p>':'';

  panel.innerHTML='<div class="msa92-head"><div class="msa92-heading"><h3>🩺 Minhas doenças e condições</h3><p class="msa92-intro">Informações cadastradas em '+esc(name)+'. Confira se está no perfil correto.</p></div><button type="button" id="msa90Close" class="btn secondary">Fechar</button></div>'+
   (items.length?summary+hashPanel+'<div class="msa92-list">'+cards+'</div>':'<div class="msa92-empty"><strong>Nenhuma doença ou condição encontrada.</strong><p>Cadastre no seu perfil as condições já informadas por um profissional de saúde. Não inclua suspeitas como se fossem diagnósticos confirmados.</p><button type="button" id="msa90GoProfile" class="btn secondary">Abrir meu perfil</button></div>');
  const filterCards=(idx)=>{const all=idx===null;let shown=0;panel.querySelectorAll('[data-disease-index]').forEach(card=>{const on=all||Number(card.dataset.diseaseIndex)===idx;card.hidden=!on;if(on)shown++});panel.querySelectorAll('[data-disease-filter]').forEach(t=>{const active=!all&&Number(t.dataset.diseaseFilter)===idx;t.setAttribute('aria-pressed',String(active))});const allButton=$('[data-disease-all]',panel);if(allButton)allButton.setAttribute('aria-pressed',String(all));const status=$('#msa94DiseaseFilterStatus',panel);if(status)status.textContent=all?'Mostrando todas as '+items.length+' condições.':'Mostrando 1 de '+items.length+' condições: '+items[idx].name+'.'};
  panel.querySelectorAll('[data-disease-filter]').forEach(t=>t.addEventListener('click',()=>filterCards(Number(t.dataset.diseaseFilter))));
  const allButton=$('[data-disease-all]',panel);if(allButton)allButton.addEventListener('click',()=>filterCards(null));
  $('#msa90Close',panel).onclick=()=>{panel.hidden=true;btn.setAttribute('aria-expanded','false');btn.focus()};
  const go=$('#msa90GoProfile',panel);if(go)go.onclick=()=>{if(typeof window.go==='function')window.go('perfil');else location.hash='perfil'};
 }
 btn.setAttribute('aria-controls',panel.id);btn.setAttribute('aria-expanded','false');
 btn.addEventListener('click',()=>{panel.hidden=!panel.hidden;btn.setAttribute('aria-expanded',String(!panel.hidden));if(!panel.hidden)draw()});
 window.addEventListener('msa:perfil-selecionado',()=>{if(!panel.hidden)draw()});
 window.addEventListener('msa:familiares-atualizados',()=>{if(!panel.hidden)draw()});
}
function init(){if(render()===undefined&&!$('#msa90DiseasesButton')){const observer=new MutationObserver(()=>{if($('#timelineFilters')&&!$('#msa90DiseasesButton')){render();observer.disconnect()}});observer.observe(document.body,{childList:true,subtree:true});setTimeout(()=>observer.disconnect(),15000)}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();