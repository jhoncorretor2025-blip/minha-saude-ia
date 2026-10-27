/* Minha Saúde IA — Inteligência familiar V7.57
 * Complementa o módulo existente sem substituir nem migrar os cadastros.
 */
(function(){
'use strict';
if(window.__msaFamilyIntelligence757)return;
window.__msaFamilyIntelligence757=true;
const KEY=(window.MSA_K&&window.MSA_K.familiares)||'msa2_familiares';
const $=id=>document.getElementById(id);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function read(){
 try{
  if(window.MSAStorage&&typeof window.MSAStorage.get==='function'){
   const x=window.MSAStorage.get(KEY); if(Array.isArray(x))return x;
  }
  const raw=localStorage.getItem(KEY);const x=raw?JSON.parse(raw):[];
  return Array.isArray(x)?x:[];
 }catch(e){return[]}
}
function date(s){if(!s)return null;const d=new Date(String(s).slice(0,10)+'T12:00:00');return isNaN(d.getTime())?null:d}
function age(birth,death){const b=date(birth),end=date(death)||new Date();if(!b)return null;if(end<b)return null;let n=end.getFullYear()-b.getFullYear();if(end.getMonth()<b.getMonth()||(end.getMonth()===b.getMonth()&&end.getDate()<b.getDate()))n--;return n>=0?n:null}
function name(p){return p.nome||p.name||'Pessoa sem nome'}
function conditions(p){return [p.condicao,p.condicoes,p.doencas,p.historicoMedico,p.alergias,p.observacoes,p.saude].flatMap(v=>Array.isArray(v)?v.map(x=>typeof x==='string'?x:JSON.stringify(x)):v?[String(v)]:[]).join(' ')}
function dead(p){return !!(p.dataFalecimento||p.falecimento||String(p.statusFamiliar||p.status||'').toLowerCase().includes('falec'))}
function render(){
 const root=$('familiares');if(!root)return;
 let panel=$('msaFamilyIntelligence757');
 if(!panel){panel=document.createElement('section');panel.id='msaFamilyIntelligence757';panel.setAttribute('aria-label','Inteligência do histórico familiar');panel.style.cssText='margin:16px 0;padding:16px;border:1px solid #cbd5e1;border-radius:18px;background:var(--card-bg,#fff);color:var(--text-color,inherit);box-shadow:0 4px 18px rgba(15,23,42,.06)';root.appendChild(panel)}
 const people=read(),alerts=[],duplicates=[],causeMap={};let deceasedAges=[];
 people.forEach((p,i)=>{
  const birth=p.nasc||p.dataNascimento||p.nascimento,death=p.dataFalecimento||p.falecimento;
  const b=date(birth),d=date(death);
  if(birth&&!b)alerts.push(name(p)+': data de nascimento inválida.');
  if(death&&!d)alerts.push(name(p)+': data de falecimento inválida.');
  if(b&&d&&d<b)alerts.push(name(p)+': falecimento anterior ao nascimento.');
  if(b){const par=[p.paiId,p.maeId].filter(Boolean);par.forEach(id=>{const parent=people.find(x=>String(x.id)===String(id));const pb=date(parent&&(parent.nasc||parent.dataNascimento||parent.nascimento));if(parent&&pb&&b<pb)alerts.push(name(p)+' parece ter nascido antes de '+name(parent)+'. Confira as datas e os vínculos.');});}
  if(dead(p)){
   const a=age(birth,death);if(a!==null)deceasedAges.push(a);
   const cause=String(p.causaFalecimento||p.causaMorte||p.causa_do_falecimento||'').trim();
   if(cause){const key=cause.toLocaleLowerCase('pt-BR');causeMap[key]=causeMap[key]||{label:cause,count:0};causeMap[key].count++;}
  }
  if(!dead(p)){
   const futureMed=(Array.isArray(p.medicamentos)?p.medicamentos:[]).some(m=>{const dt=date(m.data||m.dataInicio||m.inicio);return dt&&d&&dt>d});
   const futureVisit=(Array.isArray(p.consultas)?p.consultas:[]).some(c=>{const dt=date(c.data||c.dataConsulta);return dt&&d&&dt>d});
   if(futureMed||futureVisit)alerts.push(name(p)+': revise registros de medicamentos/consultas posteriores ao falecimento.');
  }
  people.slice(i+1).forEach(q=>{const sameName=name(p).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim()===name(q).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();const sameBirth= birth&& (q.nasc||q.dataNascimento||q.nascimento)===birth;if(sameName||sameBirth)duplicates.push([p,q]);});
 });
 const avg=deceasedAges.length?Math.round(deceasedAges.reduce((a,b)=>a+b,0)/deceasedAges.length):null;
 const repeated=Object.values(causeMap).filter(x=>x.count>1).sort((a,b)=>b.count-a.count);
 panel.innerHTML='<div style="display:flex;gap:12px;align-items:flex-start;justify-content:space-between;flex-wrap:wrap"><div><div style="font-size:12px;font-weight:800;letter-spacing:.08em;color:#64748b">🧠 FERRAMENTAS INTELIGENTES</div><h3 style="margin:5px 0;font-size:20px">Inteligência do histórico familiar</h3><p style="margin:0;color:#64748b;font-size:13px">Análises locais dos dados cadastrados. Revise as sugestões antes de alterar qualquer informação.</p></div><button id="msaFamilyRefresh757" type="button" style="padding:8px 12px;border:1px solid #cbd5e1;border-radius:10px;background:transparent;cursor:pointer">↻ Atualizar</button></div>'+
 '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(135px,1fr));gap:9px;margin:14px 0"><div style="padding:12px;border-radius:12px;background:#f1f5f9"><div style="font-size:12px;color:#475569">👥 Familiares</div><strong style="font-size:24px">'+people.length+'</strong></div><div style="padding:12px;border-radius:12px;background:#f1f5f9"><div style="font-size:12px;color:#475569">🕊️ Idade ao falecer</div><strong style="font-size:24px">'+(avg===null?'—':avg+' anos')+'</strong><div style="font-size:11px;color:#64748b">média dos '+deceasedAges.length+' registros com datas</div></div><div style="padding:12px;border-radius:12px;background:'+(alerts.length?'#fff7ed':'#f0fdf4')+'"><div style="font-size:12px;color:#475569">🚨 Conferir dados</div><strong style="font-size:24px">'+alerts.length+'</strong></div><div style="padding:12px;border-radius:12px;background:'+(duplicates.length?'#fff7ed':'#f1f5f9')+'"><div style="font-size:12px;color:#475569">👯 Possíveis duplicados</div><strong style="font-size:24px">'+duplicates.length+'</strong></div></div>'+
 '<label for="msaFamilySearch757" style="display:block;font-weight:700;margin:12px 0 6px">🔎 Buscar por nome, condição ou frase</label><div style="display:flex;gap:8px;flex-wrap:wrap"><input id="msaFamilySearch757" type="search" placeholder="Ex.: quem tem diabetes? mulheres vivas acima de 60" style="flex:1;min-width:180px;padding:11px;border:1px solid #cbd5e1;border-radius:10px"><button id="msaFamilySearchBtn757" type="button" style="padding:10px 14px;border:0;border-radius:10px;background:#2563eb;color:#fff;font-weight:700;cursor:pointer">Buscar</button></div><div id="msaFamilyResults757" aria-live="polite" style="margin-top:10px"></div>'+
 '<details style="margin-top:12px;border-top:1px solid #e2e8f0;padding-top:12px"><summary style="cursor:pointer;font-weight:750">🚨 Verificar datas e duplicados</summary><div style="margin-top:10px">'+(alerts.length?'<ul>'+alerts.map(x=>'<li style="margin:6px 0">'+esc(x)+'</li>').join('')+'</ul>':'<p>✅ Nenhuma inconsistência básica de datas foi identificada com os dados disponíveis.</p>')+(duplicates.length?'<h4>Possíveis duplicados — confira antes de mesclar</h4><ul>'+duplicates.map(([a,b])=>'<li>'+esc(name(a))+' ↔ '+esc(name(b))+' <small>(não foram mesclados)</small></li>').join('')+'</ul>':'')+'</div></details>'+
 '<details style="margin-top:12px;border-top:1px solid #e2e8f0;padding-top:12px"><summary style="cursor:pointer;font-weight:750">🕊️ Causas de falecimento e longevidade</summary><div style="margin-top:10px">'+(avg===null?'<p>Cadastre datas de nascimento e falecimento para calcular a média.</p>':'<p>Idade média registrada ao falecer: <strong>'+avg+' anos</strong>, com base em '+deceasedAges.length+' familiar(es) com datas válidas. Isso descreve apenas os cadastros, não prevê longevidade.</p>')+(repeated.length?'<p><strong>Causas registradas mais de uma vez:</strong></p><ul>'+repeated.map(x=>'<li>'+esc(x.label)+': '+x.count+' registros</li>').join('')+'</ul>':'<p>Não há causas de falecimento repetidas registradas até o momento.</p>')+'</div></details>'+
 '<details style="margin-top:12px;border-top:1px solid #e2e8f0;padding-top:12px"><summary style="cursor:pointer;font-weight:750">✍️ Preparar cadastro a partir de texto</summary><p style="color:#64748b;font-size:13px">Cole uma descrição. O sistema prepara uma prévia para você revisar; não salva automaticamente.</p><textarea id="msaFamilyText757" rows="3" placeholder="Ex.: Minha avó Maria, 82 anos, diabética..." style="width:100%;box-sizing:border-box;padding:11px;border:1px solid #cbd5e1;border-radius:10px"></textarea><button id="msaFamilyParse757" type="button" style="margin-top:8px;padding:10px 14px;border:0;border-radius:10px;background:#0f766e;color:#fff;font-weight:700;cursor:pointer">Preparar prévia</button><div id="msaFamilyPreview757" aria-live="polite"></div></details>'+
 '<p style="margin:12px 0 0;color:#64748b;font-size:11px;line-height:1.5">Importante: as sugestões dependem da qualidade dos dados. Padrões familiares não são diagnósticos; leve dúvidas sobre riscos hereditários ao profissional de saúde.</p>';
 $('msaFamilyRefresh757').onclick=render;
 function search(){
  const raw=$('msaFamilySearch757').value.trim().toLocaleLowerCase('pt-BR');
  const terms=raw.replace(/[?.,!]/g,'').split(/\s+/).filter(Boolean);
  let results=people.filter(p=>{
   const text=(name(p)+' '+conditions(p)+' '+(p.parentesco||'')+' '+(p.sexo||'')+' '+(p.statusFamiliar||p.status||'')+' '+(p.ladoFamilia||'')).toLocaleLowerCase('pt-BR');
   let ok=!terms.length||terms.some(t=>text.includes(t));
   const n=age(p.nasc||p.dataNascimento||p.nascimento,p.dataFalecimento||p.falecimento);
   if(/acima de|mais de|maior que/.test(raw)){const m=raw.match(/(?:acima de|mais de|maior que)\s*(\d+)/);if(m)ok=ok&&n!==null&&n>Number(m[1]);}
   if(/mulher|mulheres|feminino/.test(raw))ok=ok&&/femin|mulher|^f$/i.test(p.sexo||p.genero||'');
   if(/homem|homens|masculino/.test(raw))ok=ok&&/mascul|homem|^m$/i.test(p.sexo||p.genero||'');
   if(/vivo|viva|vivas|vivos/.test(raw))ok=ok&&!dead(p);
   if(/falecido|falecida|morto|morta/.test(raw))ok=ok&&dead(p);
   return ok;
  });
  $('msaFamilyResults757').innerHTML='<p><strong>'+results.length+'</strong> resultado(s)</p>'+(results.length?'<ul>'+results.map(p=>{const a=age(p.nasc||p.dataNascimento||p.nascimento,p.dataFalecimento||p.falecimento);return '<li style="margin:7px 0"><strong>'+esc(name(p))+'</strong>'+(a===null?'':' · '+a+' anos')+' — '+esc(conditions(p).slice(0,180)||'sem condição de saúde descrita')+'</li>'}).join('')+'</ul>':'<p>Nenhum familiar correspondeu aos termos. Tente um nome ou condição cadastrada.</p>');
 }
 $('msaFamilySearchBtn757').onclick=search;$('msaFamilySearch757').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();search()}});
 $('msaFamilyParse757').onclick=function(){
  const t=$('msaFamilyText757').value.trim();if(!t){$('msaFamilyPreview757').textContent='Digite uma descrição primeiro.';return}
  const nm=(t.match(/(?:avó|avô|mãe|pai|tia|tio|irmã|irmão|prima|primo|filha|filho)\s+([A-ZÀ-Ý][\p{L}'-]+)/iu)||[])[1]||'';
  const am=t.match(/\b(\d{1,3})\s*anos\b/i), condition=(t.match(/\b(diabetes|hipertens[aã]o|asma|c[aâ]ncer|infarto|psor[ií]ase|artrite)\b/i)||[])[1]||'';
  $('msaFamilyPreview757').innerHTML='<div style="margin-top:10px;padding:12px;background:#f8fafc;border:1px solid #cbd5e1;border-radius:10px"><strong>Prévia para conferência</strong><p>Nome identificado: '+esc(nm||'não identificado')+'</p><p>Idade mencionada: '+esc(am?am[1]+' anos':'não identificada')+'</p><p>Condição mencionada: '+esc(condition||'não identificada')+'</p><p style="font-size:12px;color:#64748b">Esta versão não salva o cadastro e não substitui uma IA de extração estruturada. Confira os dados e cadastre-os no formulário familiar existente.</p></div>';
 };
}
function start(){render();const root=$('familiares');if(root&&!root.dataset.msaFamilyIntelligence757){root.dataset.msaFamilyIntelligence757='1';new MutationObserver(()=>{if(!$('msaFamilyIntelligence757'))render()}).observe(root,{childList:true});} }
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
window.addEventListener('msa:familiares-atualizados',()=>setTimeout(render,80));
})();
