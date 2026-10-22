/* Minha Saúde IA V7.04 — tendências históricas, resumo clínico, perfil ativo e adesão.
 * Lê somente o espaço do perfil atualmente selecionado. Não realiza diagnóstico.
 */
(function(){
'use strict';
const $=(s,r=document)=>r.querySelector(s);
const S=()=>window.MSAStorage;
const get=k=>{try{const v=S()?.get(k);return v==null?[]:Array.isArray(v)?v:(typeof v==='object'?[v]:[])}catch(_){return []}};
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const first=(o,keys)=>{for(const k of keys){const v=o&&o[k];if(v!==undefined&&v!==null&&v!=='')return v}return null};
const dateOf=o=>{const v=first(o,['data','dataRegistro','dataMedicao','dataConsulta','createdAt','timestamp','date','dia']);if(!v)return null;const d=new Date(v);return Number.isNaN(d.getTime())?null:d};
const num=v=>{if(typeof v==='number')return Number.isFinite(v)?v:null;const s=String(v??'').trim().replace(',','.').replace(/[^0-9.\-]/g,'');const n=Number(s);return s&&Number.isFinite(n)?n:null};
const fmtDate=d=>d?d.toLocaleDateString('pt-BR'):'data não informada';
const profile=()=>get('msa2_perfil')[0]||{};
function measurements(){
 const out=[];
 const groups=[['msa2_medidas_corporais',['peso','weight','cintura','quadril','biceps','altura']],['msa2_medidas',['peso','weight','cintura','quadril','biceps','altura']],['msa2_vitais',['glic','glicemia','glicose','temp','temperatura','fc','frequenciaCardiaca','sat','saturacao','peso']]];
 groups.forEach(([key,fields])=>get(key).forEach(o=>fields.forEach(f=>{const value=num(o?.[f]);if(value!==null)out.push({key,field:f,value,date:dateOf(o),raw:o})})));
/* V7.04: dor vem dos sintomas (campo int) e a pressão é lida como “12/8” → máxima 120 (não vira 128) */
 get('msa2_dores').forEach(o=>{const value=num(o&&o.int);if(value!==null)out.push({key:'msa2_dores',field:'dor',value,date:dateOf(o),raw:o})});
 get('msa2_vitais').forEach(o=>{const pa=pressao(o&&o.pressao);if(pa)out.push({key:'msa2_vitais',field:'pressaoMax',value:pa.max,texto:pa.texto,date:dateOf(o),raw:o})});
 return out;
}
function pressao(t){const m=String(t||'').match(/(\d{1,3})\s*[\/x×]\s*(\d{1,3})/);if(!m)return null;let a=Number(m[1]),b=Number(m[2]);if(a<30){a*=10;b*=10}return {max:a,min:b,texto:a+'/'+b+' mmHg'}}
function familyName(){const p=profile();return first(p,['nome','name'])||'Perfil atual';}
function familyNotice(){
 const host=$('#msa87Panel');if(!host||$('#msa88Family'))return;
 const id=S()?.selectedProfileId?.();
 const el=document.createElement('div');el.id='msa88Family';el.className='msa88-card';
 el.innerHTML='<div><strong>👤 Perfil de saúde ativo</strong><p>Os dados e relatórios abaixo usam o perfil selecionado: <b>'+esc(familyName())+'</b>.</p><small>Antes de importar, restaurar ou registrar informações, confira se esta é a pessoa correta.</small></div>';
 host.prepend(el);
}
function chart(){
 const host=$('#msa88Trends');if(!host)return;
 const all=measurements();
 const defs=[
  {name:'Peso',keys:['peso','weight'],unit:'kg',color:'#2563eb'},
  {name:'Cintura',keys:['cintura'],unit:'cm',color:'#0d9488'},
  {name:'Pressão (máxima)',keys:['pressaoMax'],unit:'mmHg',color:'#dc2626'},
  {name:'Açúcar (glicemia)',keys:['glic','glicemia','glicose'],unit:'mg/dL',color:'#7c3aed'},
  {name:'Dor',keys:['dor'],unit:'/10',color:'#ea580c'}
 ];
 const sections=defs.map(def=>{
  const rows=all.filter(x=>def.keys.includes(x.field)).sort((a,b)=>(a.date?.getTime()||0)-(b.date?.getTime()||0)).slice(-12);
  if(!rows.length)return '<div class="msa88-trend"><strong>'+def.name+'</strong><p class="msa88-muted">Sem histórico registrado.</p></div>';
  const vals=rows.map(x=>x.value),min=Math.min(...vals),max=Math.max(...vals),span=max-min||1;
  return '<div class="msa88-trend"><div class="msa88-trend-head"><strong>'+def.name+'</strong><span>'+esc(rows[rows.length-1].value)+' '+def.unit+'</span></div><div class="msa88-bars" role="img" aria-label="Histórico de '+def.name+'">'+rows.map(x=>'<div class="msa88-bar-col" title="'+esc(fmtDate(x.date))+': '+esc(x.value)+'"><i style="height:'+Math.max(8,((x.value-min)/span)*76+18)+'%;background:'+def.color+'"></i><small>'+esc(x.date?x.date.toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'}):'—')+'</small></div>').join('')+'</div><small class="msa88-muted">Últimos '+rows.length+' registros · menor '+min+' · maior '+max+'</small></div>';
 }).join('');
 host.innerHTML=sections;
}
function report(){
 /* V7.04: relatório com os dados certos (pressão 12/8, sintomas com local e intensidade, consultas completas), “antes × agora” e adesão aos remédios */
 const p=profile(),meds=get('msa2_meds'),rot=get('msa2_medicamentos_rotina'),consults=get('msa2_consultas'),exams=get('msa2_exames'),pain=get('msa2_dores'),vit=get('msa2_vitais');
 const L=[],sec=t=>{L.push('',t,'-'.repeat(Math.min(40,t.length)))};
 L.push('MINHA SAÚDE IA — RELATÓRIO EVOLUTIVO PARA A CONSULTA','Gerado em: '+new Date().toLocaleString('pt-BR'),'Pessoa: '+familyName(),'Organiza registros feitos pela própria pessoa. Não é diagnóstico.');
 sec('DADOS PRINCIPAIS');
 [['Nascimento','nasc'],['Sexo','sexo'],['Tipo sanguíneo','sangue'],['Alergias','alerg'],['Condições de saúde','cond'],['Cirurgias/internações','circ'],['Peso (cadastro)','peso'],['Altura','altura']].forEach(([r,k])=>{const v=first(p,[k]);if(v!==null)L.push(r+': '+v)});
 sec('ANTES × AGORA (últimos 90 dias)');
 const lim=Date.now()-90*86400000,all=measurements();
 [['Peso','peso','kg'],['Pressão','pressaoMax','mmHg'],['Açúcar (glicemia)','glic','mg/dL'],['Batimentos','fc','bpm'],['Dor (sintomas)','dor','/10']].forEach(([r,f,u])=>{
  const rows=all.filter(x=>x.field===f&&x.date&&x.date.getTime()>=lim).sort((a,b)=>a.date-b.date);if(!rows.length)return;
  const ini=rows[0],fim=rows[rows.length-1],txt=x=>x.texto||((x.value)+' '+u);
  if(rows.length===1){L.push(r+': '+txt(fim)+' ('+fmtDate(fim.date)+') — só 1 registro');return}
  const d=fim.value-ini.value,seta=Math.abs(d)<0.0001?'➡️ igual':d>0?'⬆️ subiu':'⬇️ desceu';
  L.push(r+': '+txt(ini)+' ('+fmtDate(ini.date)+') → '+txt(fim)+' ('+fmtDate(fim.date)+') · '+seta+' · '+rows.length+' registros');
 });
 if(L[L.length-1].startsWith('-'))L.push('Sem medições suficientes no período.');
 sec('ÚLTIMAS MEDIÇÕES');
 vit.slice().sort((a,b)=>(dateOf(b)?.getTime()||0)-(dateOf(a)?.getTime()||0)).slice(0,6).forEach(x=>{const pa=pressao(x.pressao),v=[];if(pa)v.push('Pressão '+pa.texto);if(x.glic)v.push('Açúcar '+x.glic+' mg/dL');if(x.fc)v.push('Batimentos '+x.fc);if(x.sat)v.push('Saturação '+x.sat+'%');if(x.temp)v.push('Temperatura '+x.temp+'°C');if(x.peso)v.push('Peso '+x.peso+' kg');if(v.length)L.push('- '+fmtDate(dateOf(x))+': '+v.join(' · '))});
 if(!vit.length)L.push('Nenhuma medição registrada.');
 sec('REMÉDIOS');
 const ades=adesao();
 rot.forEach(x=>{const a=ades.find(y=>String(y.id)===String(x.id));L.push('- '+(x.nome||'Sem nome')+(x.dose?' — '+x.dose:'')+(x.hora?' às '+x.hora:'')+(a?' · tomou em '+a.dias+' de '+a.total+' dias (últimos 7)':''))});
 meds.forEach(x=>L.push('- '+(x.nome||'Sem nome')+(x.dose?' — '+x.dose:'')+(x.freq?' · '+x.freq:'')+(x.inicio?' · desde '+x.inicio:'')+(x.fim?' até '+x.fim:'')));
 if(!rot.length&&!meds.length)L.push('Nenhum remédio cadastrado.');
 sec('SINTOMAS (mais recentes)');
 pain.slice().sort((a,b)=>(dateOf(b)?.getTime()||0)-(dateOf(a)?.getTime()||0)).slice(0,12).forEach(x=>L.push('- '+fmtDate(dateOf(x))+': '+(x.local||'local não informado')+(x.int!=null&&x.int!==''?' · intensidade '+x.int+'/10':'')+(x.tipo?' · '+x.tipo:'')+(x.sint?' · '+x.sint:'')+(x.obs?' · '+x.obs:'')));
 if(!pain.length)L.push('Nenhum sintoma registrado.');
 sec('CONSULTAS');
 consults.slice().sort((a,b)=>(dateOf(b)?.getTime()||0)-(dateOf(a)?.getTime()||0)).slice(0,10).forEach(x=>L.push('- '+fmtDate(dateOf(x))+': '+(x.esp||'Consulta')+(x.med?' · '+x.med:'')+(x.mot?' · motivo: '+x.mot:'')+(x.obs?' · orientação: '+x.obs:'')+(x.ret?' · retorno: '+x.ret:'')));
 if(!consults.length)L.push('Nenhuma consulta registrada.');
 sec('EXAMES');
 exams.slice().sort((a,b)=>(dateOf(b)?.getTime()||0)-(dateOf(a)?.getTime()||0)).slice(0,10).forEach(x=>L.push('- '+fmtDate(dateOf(x))+': '+(x.nome||'Exame')+(x.res?' · resultado: '+x.res:'')+(x.obs?' · '+x.obs:'')));
 if(!exams.length)L.push('Nenhum exame registrado.');
 L.push('','Leve os exames originais e confirme estes dados com o profissional de saúde.');
 return L.join('\n');
}
/* V7.04: adesão por remédio nos últimos 7 dias */
function adesao(){
 const rot=get('msa2_medicamentos_rotina'),tom=get('msa2_medicamentos_tomados'),hoje=new Date();hoje.setHours(0,0,0,0);
 const dias=[];for(let i=6;i>=0;i--){const d=new Date(hoje);d.setDate(d.getDate()-i);dias.push(d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'))}
 return rot.map(m=>{const feitos=dias.map(d=>tom.some(t=>String(t.medId)===String(m.id)&&String(t.data||'').slice(0,10)===d));
  const agoraHm=new Date().toTimeString().slice(0,5);const hojePend=!feitos[6]&&(!m.hora||m.hora<=agoraHm);
  const esquecidos=dias.slice(0,6).filter((d,i)=>!feitos[i]);
  return {id:m.id,nome:m.nome||'Sem nome',dose:m.dose||'',hora:m.hora||'',dias:feitos.filter(Boolean).length,total:7,feitos,diasISO:dias,hojePend,esquecidos}});
}
function cartaoAdesao(){
 const host=$('#msa88Advanced');if(!host)return;let c=$('#msa90Adesao');
 if(!c){c=document.createElement('section');c.id='msa90Adesao';c.className='msa88-card';host.insertBefore(c,host.firstChild)}
 const a=adesao();
 if(!a.length){c.innerHTML='<h3>💊 Remédios: como está indo</h3><p class="msa88-muted">Cadastre seus remédios com horário em Lembretes para acompanhar aqui se você está tomando todos os dias.</p>';return}
 const sem=['D','S','T','Q','Q','S','S'];
 c.innerHTML='<h3>💊 Remédios: como está indo (7 dias)</h3>'+a.map(x=>{const pct=Math.round(x.dias/7*100),cor=pct>=85?'#16a34a':pct>=60?'#d97706':'#dc2626';
  return '<div class="msa90-med"><div class="msa90-top"><b>'+esc(x.nome)+'</b>'+(x.dose?' <span>'+esc(x.dose)+'</span>':'')+'<em style="color:'+cor+'">'+x.dias+' de 7 dias</em></div>'+
   '<div class="msa90-barra"><i style="width:'+pct+'%;background:'+cor+'"></i></div>'+
   '<div class="msa90-dias">'+x.feitos.map((f,i)=>'<span class="'+(f?'ok':(i===6&&!x.hojePend?'hoje':'falta'))+'" title="'+x.diasISO[i].split('-').reverse().join('/')+'">'+sem[new Date(x.diasISO[i]+'T12:00:00').getDay()]+'</span>').join('')+'</div>'+
   (x.hojePend?'<p class="msa90-alerta">⏰ A dose de hoje'+(x.hora?' ('+esc(x.hora)+')':'')+' ainda não foi marcada.</p>':'')+
   (x.esquecidos.length?'<p class="msa90-esq">⚠️ Sem registro em '+x.esquecidos.length+' dia(s): '+x.esquecidos.slice(-3).map(d=>d.split('-').reverse().slice(0,2).join('/')).join(', ')+'.</p>':'')+'</div>'}).join('')+
  '<p class="msa88-muted">Conta os dias em que a dose foi marcada como tomada. Esqueceu de marcar? Marque no “Hoje”, no Início.</p>';
}

function exportReport(){
 const text=report(),blob=new Blob([text],{type:'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');
 a.href=url;a.download='resumo-saude-'+new Date().toISOString().slice(0,10)+'.txt';document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);
 const status=$('#msa88Status');if(status)status.textContent='Resumo gerado para o perfil '+familyName()+'. Guarde o arquivo em local seguro.';
}
function copyForAI(){
 const text=report(),status=$('#msa88Status');
 if(navigator.clipboard?.writeText){navigator.clipboard.writeText(text).then(()=>{if(status)status.textContent='Resumo copiado. Cole no assistente de IA que você preferir.'}).catch(()=>fallbackCopy(text))}
 else fallbackCopy(text);
}
function fallbackCopy(text){const ta=document.createElement('textarea');ta.value=text;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();try{document.execCommand('copy');$('#msa88Status').textContent='Resumo copiado. Cole no assistente de IA que você preferir.'}catch(_){$('#msa88Status').textContent='Não foi possível copiar. Use “Baixar resumo” para exportar.'}ta.remove()}
function render(){
 const host=$('#msa87Panel');if(!host)return false;
 familyNotice();
 if(!$('#msa88Advanced')){
  const el=document.createElement('section');el.id='msa88Advanced';el.className='msa88-wrap';
  el.innerHTML='<section class="msa88-card"><div class="msa88-section-head"><div><h3>📈 Histórico de saúde</h3><p>Últimos registros disponíveis por indicador. Registros sem data aparecem sem data no eixo.</p></div><button id="msa88Refresh" type="button">Atualizar</button></div><div id="msa88Trends" class="msa88-trends"></div></section><section class="msa88-card"><h3>🧾 Relatório evolutivo</h3><p>Reúne perfil, medições, medicamentos, consultas, exames e sintomas do perfil ativo para preparar uma consulta.</p><div class="msa88-actions"><button type="button" id="msa88Export">⬇ Baixar resumo (.txt)</button><button type="button" id="msa88Copy" class="secondary">📋 Copiar para IA</button></div><p id="msa88Status" role="status" aria-live="polite"></p><small>Revise o conteúdo antes de compartilhar. O arquivo pode conter dados pessoais sensíveis.</small></section>';
  host.appendChild(el);
  $('#msa88Refresh').addEventListener('click',()=>{familyNotice();chart()});
  $('#msa88Export').addEventListener('click',exportReport);
  $('#msa88Copy').addEventListener('click',copyForAI);
 }
 chart();
 cartaoAdesao();
 return true;
}
function init(){
 // Garante que a área avançada apareça mesmo se o painel-base não for criado.
 if(!$('#msa87Panel')){
  const base=document.createElement('section');base.id='msa87Panel';base.setAttribute('aria-label','Painel de saúde');
  const anchor=$('header')||$('main')||document.body;
  if(anchor===document.body)anchor.prepend(base);else anchor.insertAdjacentElement(anchor.tagName==='HEADER'?'afterend':'afterbegin',base);
 }
 const attempt=()=>render();
 if(!attempt()){
  const obs=new MutationObserver(()=>{if(attempt())obs.disconnect()});
  obs.observe(document.body,{childList:true,subtree:true});
  setTimeout(()=>obs.disconnect(),15000);
 }
 window.addEventListener('msa:perfil-selecionado',()=>{const n=$('#msa88Family');if(n)n.remove();familyNotice();chart()});
 window.addEventListener('msa:familiares-atualizados',()=>{const n=$('#msa88Family');if(n)n.remove();familyNotice();chart()});
 window.addEventListener('storage',chart);
}
const style=document.createElement('style');style.textContent=`
#msa87Panel .msa88-wrap{display:grid;gap:12px;margin-top:12px}
#msa87Panel .msa88-card{background:var(--card,#fff);border:1px solid var(--border,#e2e8f0);border-radius:16px;padding:15px;margin:0 0 12px}
#msa87Panel .msa88-card h3{margin:0 0 7px;font-size:17px}
#msa87Panel .msa88-card p{font-size:13px;color:var(--muted,#64748b);line-height:1.5;margin:6px 0 12px}
#msa87Panel #msa88Family{border-left:4px solid #0d9488;background:var(--card,#fff);margin-bottom:12px}
#msa87Panel #msa88Family small{font-size:12px;color:var(--muted,#64748b)}
#msa87Panel .msa88-section-head,#msa87Panel .msa88-trend-head{display:flex;justify-content:space-between;align-items:center;gap:10px}
#msa87Panel .msa88-trends{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
#msa87Panel .msa88-trend{border:1px solid var(--border,#e2e8f0);border-radius:12px;padding:12px;min-width:0}
#msa87Panel .msa88-trend-head span{font-weight:800}
#msa87Panel .msa88-bars{height:115px;display:flex;align-items:flex-end;gap:5px;padding:8px 0 0;overflow-x:auto}
#msa87Panel .msa88-bar-col{flex:1;min-width:20px;height:100%;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;gap:4px}
#msa87Panel .msa88-bar-col i{display:block;width:min(100%,22px);min-height:5px;border-radius:5px 5px 2px 2px}
#msa87Panel .msa88-bar-col small{font-size:9px;color:var(--muted,#64748b);white-space:nowrap}
#msa87Panel .msa88-muted{font-size:11px;color:var(--muted,#64748b)}
#msa87Panel .msa88-actions{display:flex;flex-wrap:wrap;gap:8px}
#msa87Panel .msa88-actions button,#msa87Panel .msa88-section-head button{background:#2563eb;color:#fff;border:0;border-radius:10px;padding:10px 12px;font:inherit;font-size:13px;font-weight:700;cursor:pointer}
#msa87Panel .msa88-actions button.secondary{background:#eff6ff;color:#1d4ed8}
#msa87Panel #msa88Status{font-size:12px}
@media(max-width:600px){#msa87Panel .msa88-trends{grid-template-columns:1fr}#msa87Panel .msa88-section-head{align-items:flex-start;flex-wrap:wrap}}
body.msa-dark #msa87Panel .msa88-trend{background:#111827}
`;
document.head.appendChild(style);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();