/* Minha Saúde IA — Inteligência familiar V7.58
 * Oito melhorias incrementais: idade, consistência, vínculos, histórico, busca,
 * cadastro por voz/texto e revisão/mesclagem de duplicados.
 * Sem migração de esquema: lê e grava os registros no armazenamento existente.
 */
(function(){
'use strict';
if(window.__msaFamilyIntelligence758)return;
window.__msaFamilyIntelligence758=true;
const KEY=(window.MSA_K&&window.MSA_K.familiares)||'msa2_familiares';
const $=id=>document.getElementById(id);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=s=>String(s==null?'':s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR').trim();
function read(){
 try{
  if(window.MSAStorage&&typeof window.MSAStorage.get==='function'){
   const v=window.MSAStorage.get(KEY);if(Array.isArray(v))return v;
  }
  const raw=localStorage.getItem(KEY),v=raw?JSON.parse(raw):[];
  return Array.isArray(v)?v:[];
 }catch(e){return[]}
}
function save(list){
 try{
  if(window.MSAStorage&&typeof window.MSAStorage.set==='function')return window.MSAStorage.set(KEY,list);
  localStorage.setItem(KEY,JSON.stringify(list));return true;
 }catch(e){return false}
}
function emit(){
 try{window.dispatchEvent(new CustomEvent('msa:familiares-atualizados'))}catch(e){}
 if(typeof window.renderFamiliares==='function')setTimeout(()=>window.renderFamiliares(),20);
}
function name(p){return String(p&&(p.nome||p.name)||'Pessoa sem nome')}
function birth(p){return p&&(p.nasc||p.dataNascimento||p.nascimento)||''}
function death(p){return p&&(p.dataFalecimento||p.falecimento)||''}
function isDead(p){return !!death(p)||norm(p&&p.statusFamiliar)==='falecido'||norm(p&&p.status)==='falecido'}
function date(s){if(!s)return null;const d=new Date(String(s).slice(0,10)+'T12:00:00');return Number.isNaN(d.getTime())?null:d}
function ageAt(b,d){
 const born=date(b),end=d?date(d):new Date();
 if(!born||!end||end<born)return null;
 let a=end.getFullYear()-born.getFullYear();
 if(end.getMonth()<born.getMonth()||(end.getMonth()===born.getMonth()&&end.getDate()<born.getDate()))a--;
 return a>=0?a:null;
}
function ageOf(p){const calculated=ageAt(birth(p),isDead(p)?death(p):'');if(calculated!==null)return calculated;const n=Number(p&&p.idade);return Number.isFinite(n)&&n>=0&&n<=130?n:null}
function conditions(p){
 const values=[p&&p.condicao,p&&p.condicoes,p&&p.doencas,p&&p.historicoMedico,p&&p.alergias,p&&p.obs,p&&p.observacoes,p&&p.causaFalecimento,p&&p.idadeDiagnostico];
 return values.map(v=>Array.isArray(v)?v.map(x=>typeof x==='string'?x:JSON.stringify(x)).join(' '):typeof v==='object'&&v?JSON.stringify(v):String(v||'')).join(' ');
}
function degree(p){
 const explicit=norm(p&&p.grauParentesco);
 if(/1(º|o)? grau|primeiro grau/.test(explicit))return 1;
 if(/2(º|o)? grau|segundo grau/.test(explicit))return 2;
 const r=norm(p&&p.parentesco);
 if(/^(pai|mae|padrasto|madrasta|irmao|irma|filho|filha)(\b|\/)/.test(r))return 1;
 if(/^(avo|bisavo|neto|neta|tio|tia|sobrinho|sobrinha)(\b|\/)/.test(r))return 2;
 return null;
}
function onsetAge(p,text){
 const direct=String(p&&p.idadeDiagnostico||'').match(/\d{1,3}/);
 if(direct)return Number(direct[0]);
 const t=String(text||'');
 const patterns=[
  /(?:diagnosticad[oa]|diagnostico|infarto|avc|cancer|câncer|doenca|doença|teve)\D{0,24}?(?:aos?|com)\s*(\d{1,3})\s*anos/i,
  /idade aproximada ao diagnostico\s*:\s*(\d{1,3})\s*anos/i,
  /(?:in[ií]cio|come[cç]ou)\D{0,20}(\d{1,3})\s*anos/i
 ];
 for(const re of patterns){const m=t.match(re);if(m)return Number(m[1])}
 return null;
}
function sharedChildPairs(people){
 const byId=new Map(people.map(p=>[String(p.id),p])),pairs=new Map();
 people.forEach(child=>{
  const a=String(child.paiId||''),b=String(child.maeId||'');
  if(!a||!b||a===b||!byId.has(a)||!byId.has(b))return;
  const key=[a,b].sort().join('|');if(!pairs.has(key))pairs.set(key,{a:byId.get(a),b:byId.get(b),children:[]});
  pairs.get(key).children.push(child);
 });
 return Array.from(pairs.values()).filter(x=>String(x.a.conjugeId||'')!==String(x.b.id)&&String(x.b.conjugeId||'')!==String(x.a.id));
}
function duplicatePairs(people){
 const out=[];
 for(let i=0;i<people.length;i++)for(let j=i+1;j<people.length;j++){
  const a=people[i],b=people[j],na=norm(name(a)).replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim(),nb=norm(name(b)).replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();
  const ba=birth(a),bb=birth(b);
  const sameBirth=!!ba&&!!bb&&String(ba).slice(0,10)===String(bb).slice(0,10);
  const wordsA=na.split(' ').filter(Boolean),wordsB=nb.split(' ').filter(Boolean);
  const shorter=wordsA.length<=wordsB.length?wordsA:wordsB,longer=wordsA.length<=wordsB.length?wordsB:wordsA;
  const prefix=shorter.length>0&&shorter.every((w,k)=>longer[k]===w);
  const exact=na&&nb&&na===nb;
  const looks=(exact||sameBirth||(prefix&&shorter.join('').length>=3&&(shorter.length===1||longer.length>shorter.length)));
  if(looks)out.push({a,b,reason:sameBirth?'mesma data de nascimento':exact?'nomes iguais':'um nome parece ser versão abreviada do outro'});
 }
 return out;
}
function dateIssues(people){
 const issues=[],byId=new Map(people.map(p=>[String(p.id),p]));
 people.forEach(p=>{
  const b=date(birth(p)),d=date(death(p));
  if(birth(p)&&!b)issues.push({id:p.id,msg:name(p)+': data de nascimento inválida.'});
  if(death(p)&&!d)issues.push({id:p.id,msg:name(p)+': data de falecimento inválida.'});
  if(b&&d&&d<b)issues.push({id:p.id,msg:name(p)+': falecimento anterior ao nascimento.'});
  [['paiId','pai'],['maeId','mãe']].forEach(([field,label])=>{
   const parent=byId.get(String(p[field]||'')),pb=parent?date(birth(parent)):null;
   if(parent&&b&&pb&&b<pb)issues.push({id:p.id,msg:name(p)+' parece ter nascido antes do '+label+' ('+name(parent)+'). Confira as datas.'});
  });
  if(isDead(p)&&d){
   const med=Array.isArray(p.medicamentos)?p.medicamentos:[];
   med.forEach(m=>{
    const when=[m.data,m.dataInicio,m.inicio,m.prescritoEm,m.dataPrescricao].map(date).find(Boolean);
    if(when&&when>d)issues.push({id:p.id,msg:name(p)+': medicamento com data posterior ao falecimento ('+String(m.nome||'medicamento')+'). Confira se é um registro histórico.'});
   });
   const cons=Array.isArray(p.consultas)?p.consultas:[];
   cons.forEach(c=>{
    [c.data,c.retorno].forEach(dt=>{const when=date(dt);if(when&&when>d)issues.push({id:p.id,msg:name(p)+': consulta/retorno datado após o falecimento ('+String(dt)+'). Confira o registro.'})});
   });
   med.concat(cons).forEach(rec=>{
    const created=date(rec.criadoEm||rec.createdAt);
    if(created&&created>d)issues.push({id:p.id,msg:name(p)+': há um registro inserido no sistema após a data de falecimento; confirme se o conteúdo descreve um evento histórico.'});
   });
  }
 });
 return issues.filter((x,i,a)=>a.findIndex(y=>y.msg===x.msg)===i);
}
function riskItems(people){
 const defs=[
  {label:'Doenças cardíacas / infarto',re:/\b(infarto|card[ií]ac|coronar|angina|isqu[eê]m|insufici[eê]ncia card[ií]aca)\b/i},
  {label:'Diabetes',re:/\bdiabet(?:e|es|ica|ico)\b/i},
  {label:'Câncer',re:/\b(c[aâ]ncer|tumor|neoplas)\b/i},
  {label:'AVC',re:/\b(avc|derrame|acidente vascular cerebral)\b/i},
  {label:'Hipertensão',re:/\bhipertens[aã]o\b/i}
 ];
 const rows=[];
 defs.forEach(def=>{
  const members=people.filter(p=>p.vinculoFamilia!=='Afinidade'&&p.ladoFamilia!=='Afinidade'&&def.re.test(conditions(p)));
  if(!members.length)return;
  const first=members.filter(p=>degree(p)===1);
  const early=members.map(p=>({p,age:onsetAge(p,conditions(p))})).filter(x=>x.age!==null&&x.age<(def.label.indexOf('cardíacas')>=0?55:45));
  if(first.length||early.length)rows.push({label:def.label,first,early,all:members});
 });
 return rows;
}
function causeStats(people){
 const map={};const ages=[];
 people.filter(isDead).forEach(p=>{
  const a=ageAt(birth(p),death(p));if(a!==null)ages.push(a);
  const cause=String(p.causaFalecimento||p.causaMorte||'').trim();
  if(cause){const k=norm(cause);if(!map[k])map[k]={label:cause,count:0};map[k].count++;}
 });
 return {ages,avg:ages.length?Math.round(ages.reduce((a,b)=>a+b,0)/ages.length):null,repeated:Object.values(map).filter(x=>x.count>1).sort((a,b)=>b.count-a.count)};
}
function ensurePanel(){
 const sec=$('familiares');if(!sec)return null;
 let panel=$('msaFamilyIntelligence758');if(panel)return panel;
 panel=document.createElement('section');panel.id='msaFamilyIntelligence758';panel.dataset.famArea='ia';panel.setAttribute('aria-label','Inteligência do histórico familiar');
 panel.style.cssText='margin:14px 0;padding:15px;border:1px solid #dbe5f4;border-radius:17px;background:var(--card-bg,#fff);color:var(--text-color,inherit);box-shadow:0 4px 18px rgba(15,23,42,.05)';
 const hub=$('familiaInteligencia'),peopleCard=$('familiaPessoasCard');
 if(hub&&hub.parentNode)hub.insertAdjacentElement('afterend',panel);
 else if(peopleCard&&peopleCard.parentNode)peopleCard.insertAdjacentElement('afterend',panel);
 else sec.appendChild(panel);
 return panel;
}
function render(){
 const panel=ensurePanel();if(!panel)return;
 const people=read(),issues=dateIssues(people),dups=duplicatePairs(people),couples=sharedChildPairs(people),risks=riskItems(people),cs=causeStats(people);
 const oldQuery=$('msaFamilySearch758')?$('msaFamilySearch758').value:'';
 const oldText=$('msaFamilyText758')?$('msaFamilyText758').value:'';
 panel.innerHTML=
 '<div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start;flex-wrap:wrap"><div><div style="font-size:11px;font-weight:900;letter-spacing:.08em;color:#64748b">🧠 INTELIGÊNCIA COM SEUS DADOS</div><h3 style="margin:5px 0;font-size:20px">Histórico familiar inteligente</h3><p style="margin:0;color:#64748b;font-size:13px;max-width:680px">Calcula idades, identifica inconsistências e sugere vínculos. Nada é mesclado nem vinculado sem sua confirmação.</p></div><button id="msaFamilyRefresh758" type="button" style="padding:8px 12px;border:1px solid #cbd5e1;border-radius:10px;background:transparent;cursor:pointer">↻ Atualizar análise</button></div>'+
 '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:8px;margin:13px 0">'+
 '<div style="padding:11px;border-radius:12px;background:#f1f5f9"><div style="font-size:12px;color:#475569">👥 Familiares</div><b style="font-size:24px">'+people.length+'</b></div>'+
 '<div style="padding:11px;border-radius:12px;background:#f1f5f9"><div style="font-size:12px;color:#475569">🚨 Datas a revisar</div><b style="font-size:24px">'+issues.length+'</b></div>'+
 '<div style="padding:11px;border-radius:12px;background:#f1f5f9"><div style="font-size:12px;color:#475569">🔗 Casais sugeridos</div><b style="font-size:24px">'+couples.length+'</b></div>'+
 '<div style="padding:11px;border-radius:12px;background:#f1f5f9"><div style="font-size:12px;color:#475569">👯 Possíveis duplicados</div><b style="font-size:24px">'+dups.length+'</b></div>'+
 '<div style="padding:11px;border-radius:12px;background:#f1f5f9"><div style="font-size:12px;color:#475569">🕊️ Média ao falecer</div><b style="font-size:24px">'+(cs.avg===null?'—':cs.avg+' anos')+'</b><small style="display:block;color:#64748b">'+cs.ages.length+' registros com datas</small></div></div>'+
 '<div style="border-top:1px solid #e2e8f0;padding-top:12px"><label for="msaFamilySearch758" style="display:block;font-weight:800;margin-bottom:6px">🔎 Busca em linguagem normal</label><div style="display:flex;gap:8px;flex-wrap:wrap"><input id="msaFamilySearch758" type="search" value="'+esc(oldQuery)+'" placeholder="Ex.: quem tem diabetes? mulheres vivas acima de 60" style="flex:1;min-width:210px;padding:11px;border:1px solid #cbd5e1;border-radius:10px"><button id="msaFamilySearchBtn758" type="button" style="padding:10px 14px;border:0;border-radius:10px;background:#2563eb;color:white;font-weight:800;cursor:pointer">Buscar e filtrar lista</button><button id="msaFamilyClearBtn758" type="button" style="padding:10px 12px;border:1px solid #cbd5e1;border-radius:10px;background:transparent;cursor:pointer">Limpar</button></div><div id="msaFamilyResults758" aria-live="polite" style="margin-top:8px"></div></div>'+
 '<div style="border-top:1px solid #e2e8f0;padding-top:12px;margin-top:13px"><h4 style="margin:0 0 7px">🔗 Sugestões de vínculos</h4><p style="margin:0 0 8px;color:#64748b;font-size:12px">Quando duas pessoas aparecem como pai e mãe da mesma criança, o sistema sugere o vínculo. Confirme antes de gravar.</p>'+(couples.length?couples.slice(0,12).map((x,i)=>'<div style="border:1px solid #dbeafe;border-radius:11px;padding:10px;margin:7px 0"><b>'+esc(name(x.a))+' + '+esc(name(x.b))+'</b><div style="color:#64748b;font-size:12px;margin:4px 0">Filho(a) em comum: '+esc(x.children.map(name).join(', '))+'</div><button type="button" data-fam-link-a="'+esc(x.a.id)+'" data-fam-link-b="'+esc(x.b.id)+'" class="btn secondary small">💍 Confirmar vínculo</button></div>').join(''):'<p style="color:#64748b;font-size:13px">Nenhum vínculo novo foi sugerido com base nos vínculos de pai/mãe atuais.</p>')+'</div>'+
 '<details style="border-top:1px solid #e2e8f0;padding-top:12px;margin-top:13px" '+(issues.length?'open':'')+'><summary style="cursor:pointer;font-weight:800">🚨 Verificador de datas e registros ('+issues.length+')</summary><div style="margin-top:9px">'+(issues.length?issues.slice(0,30).map(x=>'<div style="padding:8px;margin:6px 0;background:#fff7ed;border-radius:9px;border:1px solid #fed7aa;font-size:13px">'+esc(x.msg)+(x.id?'<button type="button" data-fam-open758="'+esc(x.id)+'" style="margin-left:8px;border:0;background:transparent;color:#1d4ed8;cursor:pointer;font-weight:700">Revisar</button>':'')+'</div>').join(''):'<p style="color:#166534">✅ Nenhuma inconsistência básica foi identificada nos campos disponíveis.</p>')+'</div></details>'+
 '<details style="border-top:1px solid #e2e8f0;padding-top:12px;margin-top:13px" '+(risks.length?'open':'')+'><summary style="cursor:pointer;font-weight:800">🧬 Histórico familiar por parentesco e idade ('+risks.length+')</summary><div style="margin-top:9px"><p style="color:#64748b;font-size:12px">São lembretes organizacionais para conversar com um profissional de saúde, não diagnósticos nem previsões de risco pessoal.</p>'+(risks.length?risks.map(r=>'<div style="padding:10px;margin:7px 0;border:1px solid #fde68a;background:#fffbeb;border-radius:10px"><b>'+esc(r.label)+'</b>'+(r.first.length?'<div style="margin-top:4px">Parente(s) de 1º grau: '+esc(r.first.map(name).join(', '))+'</div>':'')+(r.early.length?'<div style="margin-top:4px">Diagnóstico/início possivelmente precoce registrado: '+esc(r.early.map(x=>name(x.p)+' ('+x.age+' anos)').join(', '))+'</div>':'')+'<div style="margin-top:5px;font-size:12px;color:#92400e">Vale levar este histórico à próxima consulta e confirmar as idades e os diagnósticos.</div></div>').join(''):'<p>Não foram identificados, nos campos cadastrados, padrões que acionem estes lembretes. Ausência de alerta não significa ausência de risco.</p>')+'</div></details>'+
 '<details style="border-top:1px solid #e2e8f0;padding-top:12px;margin-top:13px"><summary style="cursor:pointer;font-weight:800">🕊️ Causas de falecimento e longevidade</summary><div style="margin-top:9px">'+(cs.avg===null?'<p>Cadastre nascimento e falecimento para calcular a idade ao falecer.</p>':'<p>Idade média registrada ao falecer: <b>'+cs.avg+' anos</b> ('+cs.ages.length+' pessoas com datas válidas). A média descreve apenas os registros cadastrados.</p>')+(cs.repeated.length?'<b>Causas cadastradas mais de uma vez</b><ul>'+cs.repeated.map(x=>'<li>'+esc(x.label)+': '+x.count+' registros</li>').join('')+'</ul>':'<p>Nenhuma causa repetida registrada.</p>')+'</div></details>'+
 '<details style="border-top:1px solid #e2e8f0;padding-top:12px;margin-top:13px" id="msaFamilyDups758"><summary style="cursor:pointer;font-weight:800">👯 Revisar e mesclar possíveis duplicados ('+dups.length+')</summary><p style="color:#64748b;font-size:12px">Mesclar mantém o primeiro cadastro como principal, preenche campos vazios com dados do segundo e combina históricos. Campos com valores conflitantes são preservados no cadastro principal para evitar sobrescrita silenciosa.</p>'+(dups.length?dups.slice(0,20).map((x,i)=>'<div style="border:1px solid #e2e8f0;border-radius:11px;padding:10px;margin:7px 0"><b>'+esc(name(x.a))+' ↔ '+esc(name(x.b))+'</b><div style="font-size:12px;color:#64748b;margin:3px 0">Motivo: '+esc(x.reason)+' · '+esc(x.a.parentesco||'parentesco não informado')+' / '+esc(x.b.parentesco||'parentesco não informado')+'</div><button type="button" class="btn secondary small" data-fam-merge-a="'+esc(x.a.id)+'" data-fam-merge-b="'+esc(x.b.id)+'">Comparar e mesclar…</button></div>').join(''):'<p>Nenhum possível duplicado identificado.</p>')+'</details>'+
 '<details style="border-top:1px solid #e2e8f0;padding-top:12px;margin-top:13px" id="msaFamilyTextImport758"><summary style="cursor:pointer;font-weight:800">✍️ Cadastrar falando ou colando um texto</summary><p style="color:#64748b;font-size:12px">Ditado ou texto livre vira uma prévia. Revise antes de preencher o formulário e salve somente depois de conferir. A extração local reconhece alguns campos; o importador existente continua disponível para respostas completas de IA.</p><textarea id="msaFamilyText758" rows="3" placeholder="Ex.: Minha avó Maria, 82 anos, diabética, mora com a tia." style="width:100%;box-sizing:border-box;padding:11px;border:1px solid #cbd5e1;border-radius:10px">'+esc(oldText)+'</textarea><div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px"><button id="msaFamilyVoice758" type="button" class="btn secondary">🎙️ Ditar texto</button><button id="msaFamilyParse758" type="button" class="btn green">Preparar prévia</button><button id="msaFamilyAIImport758" type="button" class="btn secondary">📥 Abrir importador de IA</button></div><div id="msaFamilyPreview758" aria-live="polite" style="margin-top:9px"></div></details>'+
 '<p style="margin:12px 0 0;color:#64748b;font-size:11px;line-height:1.5">As análises dependem da qualidade dos registros. A idade ao diagnóstico só é considerada quando está explicitamente cadastrada ou descrita no texto; a falta de informação não é interpretada como ausência de doença. Padrões familiares não substituem avaliação médica.</p>';
 $('msaFamilyRefresh758').onclick=render;
 panel.querySelectorAll('[data-fam-link-a]').forEach(btn=>btn.addEventListener('click',()=>linkPair(btn.dataset.famLinkA,btn.dataset.famLinkB)));
 panel.querySelectorAll('[data-fam-open758]').forEach(btn=>btn.addEventListener('click',()=>openPerson(btn.dataset.famOpen758)));
 panel.querySelectorAll('[data-fam-merge-a]').forEach(btn=>btn.addEventListener('click',()=>mergePrompt(btn.dataset.famMergeA,btn.dataset.famMergeB)));
 $('msaFamilySearchBtn758').onclick=search;
 $('msaFamilySearch758').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();search()}});
 $('msaFamilyClearBtn758').onclick=()=>{ $('msaFamilySearch758').value='';filterCards(null);$('msaFamilyResults758').innerHTML='';};
 $('msaFamilyParse758').onclick=parseText;
 $('msaFamilyAIImport758').onclick=()=>{if(typeof window.abrirImportadorRespostaFamilia==='function')window.abrirImportadorRespostaFamilia();else alert('O importador de IA ainda não carregou. Atualize a página e tente novamente.')};
 $('msaFamilyVoice758').onclick=voiceText;
}
function filterCards(ids){
 const area=$('familiaresList');if(!area)return;
 area.querySelectorAll('.familiar-person-card').forEach(card=>{
  const b=card.querySelector('[data-fam-open]'),id=b&&String(b.dataset.famOpen||'');
  if(ids===null||ids.has(id))card.classList.remove('msa-family-nl-hidden758');else card.classList.add('msa-family-nl-hidden758');
 });
 let style=$('msaFamilyIntelligenceStyles758');
 if(!style){style=document.createElement('style');style.id='msaFamilyIntelligenceStyles758';style.textContent='.msa-family-nl-hidden758{display:none!important}';document.head.appendChild(style)}
}
function search(){
 const box=$('msaFamilySearch758'),out=$('msaFamilyResults758');if(!box||!out)return;
 const raw=box.value.trim(),q=norm(raw),people=read();
 if(!q){filterCards(null);out.innerHTML='<span style="color:#64748b;font-size:12px">Digite uma busca para filtrar a lista de pessoas.</span>';return}
 const female=/\b(mulheres?|femininas?|feminino)\b/.test(q),male=/\b(homens?|masculinos?)\b/.test(q);
 const living=/\b(vivos?|vivas?|vivo|viva|em vida)\b/.test(q),deceased=/\b(falecidos?|falecidas?|mortos?|mortas?)\b/.test(q);
 const ageMatch=q.match(/(?:acima de|mais de|maior que|maiores de)\s*(\d{1,3})/);
 const minMatch=q.match(/(?:\bde|com)\s*(\d{1,3})\s*(?:anos|ano)/);
 const underMatch=q.match(/(?:abaixo de|menos de|menor que|menores de)\s*(\d{1,3})/);
 const threshold=ageMatch?Number(ageMatch[1]):null,under=underMatch?Number(underMatch[1]):null;
 const dx=[
  {re:/diabet/,cond:/diabet/},{re:/hipertens/,cond:/hipertens/},
  {re:/infarto|cardiac|coron|doenca do coracao|cora[cç][aã]o/,cond:/infarto|cardiac|coron|doenca do coracao|cora[cç][aã]o/},
  {re:/cancer|tumor|neoplas/,cond:/cancer|tumor|neoplas/},{re:/avc|derrame|acidente vascular cerebral/,cond:/avc|derrame|acidente vascular cerebral/},
  {re:/psoriase|psorias/,cond:/psoriase|psorias/},{re:/artrite/,cond:/artrite/},{re:/asma/,cond:/asma/},
  {re:/colesterol/,cond:/colesterol/},{re:/renal|rim/,cond:/renal|rim/}
 ];
 const detected=dx.find(x=>x.re.test(q));
 let leftovers=q
  .replace(/\b(quem|quais?|tem|tenha|têm|com|que|sao|são|as|os|a|o|de|do|da|das|dos|e|acima|mais|maior|abaixo|menos|menor|que|idade|anos?|vivas?|vivos?|viva|vivo|mulheres?|homens?|femininas?|feminino|masculinos?|masculino|falecidos?|falecidas?|mortos?|mortas?|famili?a?res?)\b/g,' ')
  .replace(/\d+/g,' ').replace(/[?!.,;:]/g,' ').trim();
 if(detected)leftovers=leftovers.replace(detected.re,' ');
 const generic=leftovers.split(/\s+/).filter(t=>t.length>=2);
 const results=people.filter(p=>{
  const text=norm(name(p)+' '+String(p.parentesco||'')+' '+conditions(p)+' '+String(p.ladoFamilia||''));
  const sx=norm(p.sexo||p.genero||'');
  const isFemale=/femin|mulher|^f$/.test(sx),isMale=/mascul|homem|^m$/.test(sx);
  const a=ageOf(p);
  if(female&&!isFemale)return false;
  if(male&&!isMale)return false;
  if(living&&isDead(p))return false;
  if(deceased&&!isDead(p))return false;
  if(threshold!==null&&(a===null||a<=threshold))return false;
  if(under!==null&&(a===null||a>=under))return false;
  if(minMatch&&!threshold&&!under){const n=Number(minMatch[1]);if(Number.isFinite(n)&&!q.includes('acima de')&&a!==null&&a<n)return false;}
  if(detected&&!detected.cond.test(norm(conditions(p))))return false;
  if(generic.length&&!generic.every(t=>text.includes(t)))return false;
  return true;
 });
 const ids=new Set(results.map(p=>String(p.id||'')));filterCards(ids);
 out.innerHTML='<div style="font-size:12px;color:#64748b;margin-bottom:5px">'+results.length+' resultado(s). A lista de familiares foi filtrada; use “Limpar” para restaurar a visualização.</div>'+
  (results.length?'<div style="display:grid;gap:6px">'+results.slice(0,30).map(p=>'<button type="button" data-fam-result-open758="'+esc(p.id)+'" style="text-align:left;padding:9px;border:1px solid #dbeafe;border-radius:9px;background:transparent;cursor:pointer"><b>'+esc(name(p))+'</b><span style="display:block;font-size:12px;color:#64748b">'+esc(p.parentesco||'Parentesco não informado')+' · '+(ageOf(p)===null?'idade não informada':ageOf(p)+' anos')+' · '+esc(String(p.condicao||'sem condição principal cadastrada'))+'</span></button>').join('')+'</div>':'<p style="font-size:13px;color:#64748b">Nenhum familiar correspondeu à busca. Confira os dados cadastrados ou tente uma expressão diferente.</p>');
 out.querySelectorAll('[data-fam-result-open758]').forEach(btn=>btn.addEventListener('click',()=>openPerson(btn.dataset.famResultOpen758)));
}
function openPerson(id){
 if(typeof window.selecionarFamiliar==='function')window.selecionarFamiliar(String(id));
 else{try{window.MSAStorage&&window.MSAStorage.set('msa2_familiar_selecionado',String(id))}catch(e){}}
 const detail=$('familiarDetalhe');if(detail)setTimeout(()=>detail.scrollIntoView({behavior:'smooth',block:'start'}),100);
}
function linkPair(aId,bId){
 const list=read(),a=list.find(p=>String(p.id)===String(aId)),b=list.find(p=>String(p.id)===String(bId));
 if(!a||!b||String(a.id)===String(b.id)){alert('Não foi possível localizar as duas pessoas.');return}
 const direct=String(a.paiId||'')===String(b.id)||String(a.maeId||'')===String(b.id)||String(b.paiId||'')===String(a.id)||String(b.maeId||'')===String(a.id);
 if(direct){alert('O vínculo não foi sugerido porque uma pessoa está cadastrada como pai/mãe da outra. Revise os vínculos manualmente.');return}
 let prompt='Confirmar vínculo de cônjuge entre '+name(a)+' e '+name(b)+'?';
 const oldA=a.conjugeId&&String(a.conjugeId)!==String(b.id)?list.find(p=>String(p.id)===String(a.conjugeId)):null;
 const oldB=b.conjugeId&&String(b.conjugeId)!==String(a.id)?list.find(p=>String(p.id)===String(b.conjugeId)):null;
 if(oldA||oldB)prompt+='\n\nHá vínculo(s) atual(is): '+[oldA?name(oldA):'',oldB?name(oldB):''].filter(Boolean).join(', ')+'. Se confirmar, o vínculo anterior recíproco será removido; os outros cadastros serão preservados.';
 if(!confirm(prompt+'\n\nA ação será gravada somente após sua confirmação.'))return;
 if(oldA&&String(oldA.conjugeId||'')===String(a.id))delete oldA.conjugeId;
 if(oldB&&String(oldB.conjugeId||'')===String(b.id))delete oldB.conjugeId;
 a.conjugeId=String(b.id);b.conjugeId=String(a.id);
 if(!save(list)){alert('Não foi possível salvar o vínculo.');return}
 emit();render();
}
function mergePrompt(aId,bId){
 const list=read(),a=list.find(p=>String(p.id)===String(aId)),b=list.find(p=>String(p.id)===String(bId));
 if(!a||!b){alert('Os cadastros não foram encontrados. Atualize a análise e tente novamente.');return}
 const preview='Cadastro principal: '+name(a)+'\nCadastro a incorporar: '+name(b)+'\n\nNome/parentesco principal: '+String(a.parentesco||'não informado')+'\nParentesco do segundo cadastro: '+String(b.parentesco||'não informado')+'\nRegistros de medicamentos: '+((a.medicamentos||[]).length)+' + '+((b.medicamentos||[]).length)+'\nConsultas: '+((a.consultas||[]).length)+' + '+((b.consultas||[]).length)+'\n\nO cadastro principal será mantido. Campos vazios serão preenchidos, históricos serão combinados e campos com conflito manterão o valor principal. Referências familiares ao cadastro incorporado serão redirecionadas. Esta ação não tem desfazer automático; certifique-se de que é a mesma pessoa.';
 if(!confirm(preview+'\n\nDeseja continuar com a mesclagem?'))return;
 const primary=JSON.parse(JSON.stringify(a)),secondary=b;
 const appendFields=['condicao','alergias','obs','observacoes','causaFalecimento','medicamentosRelato','rotina','medidas'];
 Object.keys(secondary).forEach(k=>{
  if(k==='id'||k==='dadosImportadosIA'||k==='criadoEm')return;
  const av=primary[k],bv=secondary[k];
  if(Array.isArray(bv)){
   const old=Array.isArray(av)?av.slice():[],seen=new Set(old.map(fingerprint));
   bv.forEach(item=>{const key=fingerprint(item);if(!seen.has(key)){old.push(item);seen.add(key)}});
   primary[k]=old;return;
  }
  if((av===undefined||av===null||String(av).trim()==='')&&bv!==undefined&&bv!==null&&String(bv).trim()!==''){primary[k]=bv;return}
  if(appendFields.includes(k)&&av&&bv&&norm(av)!==norm(bv)){
   const parts=String(av).split(/[;\n]+/).map(x=>x.trim()).filter(Boolean);
   if(!parts.some(x=>norm(x)===norm(bv)))primary[k]=parts.concat(String(bv).split(/[;\n]+/).map(x=>x.trim()).filter(x=>x&&!parts.some(y=>norm(y)===norm(x)))).join('; ');
  }
 });
 primary.id=a.id;
 const next=list.filter(p=>String(p.id)!==String(b.id)).map(p=>{
  const x=p;
  ['paiId','maeId','conjugeId'].forEach(k=>{if(String(x[k]||'')===String(b.id))x[k]=String(a.id)});
  return x;
 });
 const pos=next.findIndex(p=>String(p.id)===String(a.id));if(pos>=0)next[pos]=primary;
 if(!save(next)){alert('Não foi possível gravar a mesclagem. Nenhuma alteração foi confirmada.');return}
 emit();render();alert('✅ Mesclagem concluída. O cadastro principal e os históricos foram preservados na medida possível.');
}
function fingerprint(obj){
 if(!obj||typeof obj!=='object')return norm(obj);
 const keys=['nome','dose','data','especialidade','medico','motivo','descricao','tipo','hora','frequencia'];
 const values=keys.map(k=>norm(obj[k]||'')).filter(Boolean);
 return values.length?values.join('|'):norm(JSON.stringify(obj));
}
function parseNarrative(text){
 const t=String(text||'').trim(),n=norm(t);
 const rels=[
  [/av[oó]\s+materna/,'Avó','Feminino'],[/av[oó]\s+paterna/,'Avó','Feminino'],[/av[oó]\b/,'Avô/avó',''],
  [/\bm[aã]e\b/,'Mãe','Feminino'],[/\bpai\b/,'Pai','Masculino'],[/\btia\b/,'Tia','Feminino'],[/\btio\b/,'Tio','Masculino'],
  [/\birm[aã]\b/,'Irmão/irmã',''],[/\birm[aã]o\b/,'Irmão/irmã',''],[/\bprima\b/,'Prima','Feminino'],[/\bprimo\b/,'Primo','Masculino'],
  [/\bfilha\b/,'Filha','Feminino'],[/\bfilho\b/,'Filho','Masculino'],[/\bnet[ao]\b/,'Neto/neta',''],[/\bc[oô]njuge\b/,'Cônjuge','']
 ];
 let parentesco='Outro',sexo='';
 for(const r of rels){if(r[0].test(n)){parentesco=r[1];sexo=r[2];break}}
 let nome='';
 const nm=t.match(/(?:minha|minha\s+fam[ií]lia|meu)?\s*(?:av[oó]|m[aã]e|pai|tia|tio|irm[aã]o|irm[aã]|prima|primo|filha|filho|neta|neto)\s+(?:materna|paterna|materno|paterno\s+)?([A-ZÀ-Ý][a-zà-ÿ'-]{1,})(?:\s+([A-ZÀ-Ý][a-zà-ÿ'-]{1,}))?/i);
 if(nm)nome=[nm[1],nm[2]].filter(Boolean).join(' ');
 const years=t.match(/\b(\d{1,3})\s*anos?\b/i),idade=years?Number(years[1]):null;
 const db=[
  {re:/diabet/,label:'Diabetes'},
  {re:/hipertens/,label:'Hipertensão'},
  {re:/infarto|card[ií]ac|cora[cç][aã]o/,label:'Doença cardíaca / infarto'},
  {re:/c[aâ]ncer|tumor|neoplas/,label:'Câncer'},
  {re:/derrame|acidente vascular cerebral|\bavc\b/,label:'AVC'},
  {re:/psor[ií]ase/,label:'Psoríase'},
  {re:/artrite/,label:'Artrite'},
  {re:/asma/,label:'Asma'},
  {re:/colesterol/,label:'Colesterol elevado'},
  {re:/doen[cç]a renal|rim|renal/,label:'Doença renal'}
 ];
 const cond=db.find(x=>x.re.test(n));
 const diagnoses=t.match(/(?:diagnosticad[oa]|diagn[oó]stico|infarto|avc|teve)\D{0,20}(?:aos?|com)\s*(\d{1,3})\s*anos/i);
 const idadeDiag=diagnoses?Number(diagnoses[1]):null;
 const status=/\b(faleceu|falecid[oa]|morreu|morto|morta)\b/i.test(t)?'Falecido':/vivo|viva/i.test(n)?'Vivo':'';
 const contexto=t.match(/(?:mora|reside)\s+(?:com|em)\s+([^.;]+)/i);
 return {texto:t,nome,parentesco,sexo,idade,condicao:cond?cond.label:'',idadeDiagnostico:idadeDiag,statusFamiliar:status,contexto:contexto?contexto[0]:'',obs:t};
}
function parseText(){
 const ta=$('msaFamilyText758'),out=$('msaFamilyPreview758');if(!ta||!out)return;
 const t=ta.value.trim();if(!t){out.innerHTML='<p style="color:#b45309">Escreva ou dite uma descrição primeiro.</p>';return}
 const p=parseNarrative(t);
 out.innerHTML='<div style="padding:12px;border:1px solid #cbd5e1;border-radius:11px;background:#f8fafc"><b>Prévia extraída — revise antes de usar</b><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:7px;margin-top:9px">'+[
  ['Nome',p.nome||'Não identificado'],['Parentesco',p.parentesco],['Sexo',p.sexo||'Não identificado'],['Idade',p.idade===null?'Não identificada':p.idade+' anos'],['Condição',p.condicao||'Não identificada'],['Idade ao diagnóstico',p.idadeDiagnostico===null?'Não identificada':p.idadeDiagnostico+' anos'],['Situação',p.statusFamiliar||'Não identificada'],['Contexto',p.contexto||'Não identificado']
 ].map(x=>'<div style="padding:8px;background:white;border-radius:8px"><small style="display:block;color:#64748b">'+esc(x[0])+'</small><b>'+esc(x[1])+'</b></div>').join('')+'</div><p style="font-size:12px;color:#64748b;line-height:1.45">A extração local identifica apenas alguns padrões de texto e pode errar. A descrição completa será mantida como observação. Nenhum cadastro foi salvo.</p><div style="display:flex;flex-wrap:wrap;gap:8px"><button id="msaFamilyFillForm758" type="button" class="btn green">Preencher formulário para revisar</button><button id="msaFamilyCopyJson758" type="button" class="btn secondary">Copiar estrutura JSON</button></div></div>';
 $('msaFamilyFillForm758').onclick=()=>fillForm(p);
 $('msaFamilyCopyJson758').onclick=()=>copy(JSON.stringify({nome:p.nome,parentesco:p.parentesco,sexo:p.sexo,idade:p.idade,condicao:p.condicao,idadeDiagnostico:p.idadeDiagnostico,obs:p.obs},null,2));
}
function fillForm(p){
 const set=(id,v)=>{const el=$(id);if(el&&v!==undefined&&v!==null&&String(v)!==''){el.value=String(v);el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}))}};
 set('fNome',p.nome);set('fParentesco',p.parentesco);set('fSexo',p.sexo);set('fIdade',p.idade);set('fCondicao',p.condicao);set('fObs',p.obs);
 if(p.statusFamiliar==='Falecido'){set('fStatusFamiliar','Falecido');const d=$('fDataFalecimento');if(d)d.disabled=false;}
 const form=$('familiarForm');if(form)form.scrollIntoView({behavior:'smooth',block:'start'});
 alert('Os campos identificados foram preenchidos no formulário. Confira nome, parentesco, datas e condições antes de clicar em “Cadastrar familiar”. Nada foi salvo automaticamente.');
}
function voiceText(){
 const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
 if(!SR){alert('O reconhecimento de voz não está disponível neste navegador. Você pode colar o texto no campo.');return}
 const btn=$('msaFamilyVoice758'),ta=$('msaFamilyText758'),rec=new SR();
 rec.lang='pt-BR';rec.continuous=false;rec.interimResults=false;
 if(btn){btn.disabled=true;btn.textContent='🎙️ Ouvindo…'}
 rec.onresult=e=>{const said=Array.from(e.results||[]).map(r=>r[0]&&r[0].transcript||'').join(' ').trim();if(ta)ta.value=(ta.value?ta.value+' ':'')+said;parseText()};
 rec.onerror=()=>alert('Não foi possível reconhecer a fala. Verifique a permissão do microfone ou cole o texto.');
 rec.onend=()=>{if(btn){btn.disabled=false;btn.textContent='🎙️ Ditar texto'}};
 try{rec.start()}catch(e){if(btn){btn.disabled=false;btn.textContent='🎙️ Ditar texto'}alert('Não foi possível iniciar o microfone neste navegador.')}
}
function copy(t){
 if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t).then(()=>alert('Estrutura JSON copiada.')).catch(()=>fallbackCopy(t));
 else fallbackCopy(t);
}
function fallbackCopy(t){const a=document.createElement('textarea');a.value=t;document.body.appendChild(a);a.select();try{document.execCommand('copy');alert('Estrutura JSON copiada.')}catch(e){alert('Não foi possível copiar automaticamente. Selecione e copie o conteúdo.')}a.remove()}
function start(){
 render();
 const sec=$('familiares');
 if(sec&&!sec.dataset.msaFamilyIntelligence758){
  sec.dataset.msaFamilyIntelligence758='1';
  new MutationObserver(()=>{if(!$('msaFamilyIntelligence758'))render()}).observe(sec,{childList:true});
 }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
window.addEventListener('msa:familiares-atualizados',()=>setTimeout(render,100));
window.msaFamilyIntelligence758={render,ageOf,degree,dateIssues,duplicatePairs,sharedChildPairs};
})();