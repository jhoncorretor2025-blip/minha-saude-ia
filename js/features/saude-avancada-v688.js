/* Minha Saúde IA V6.89 — tendências históricas, resumo clínico, perfil ativo e adesão.
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
 const groups=[['msa2_medidas_corporais',['peso','weight','cintura','quadril','biceps','altura']],['msa2_medidas',['peso','weight','cintura','quadril','biceps','altura']],['msa2_vitais',['pressao','pressaoArterial','pa','glicemia','glicose','temperatura','frequenciaCardiaca','saturacao','dor','peso']]];
 groups.forEach(([key,fields])=>get(key).forEach(o=>fields.forEach(f=>{const value=num(o?.[f]);if(value!==null)out.push({key,field:f,value,date:dateOf(o),raw:o})})));
 return out;
}
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
  {name:'Glicemia',keys:['glicemia','glicose'],unit:'',color:'#7c3aed'},
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
 const p=profile(),v=get('msa2_vitais'),m=get('msa2_medidas_corporais').concat(get('msa2_medidas')),meds=get('msa2_meds').concat(get('msa2_medicamentos_rotina')),taken=get('msa2_medicamentos_tomados'),consults=get('msa2_consultas'),exams=get('msa2_exames'),pain=get('msa2_dores');
 const lines=['MINHA SAÚDE IA — RESUMO PARA CONSULTA','Gerado em: '+new Date().toLocaleString('pt-BR'),'Perfil: '+familyName(),'','Este documento organiza registros informados pelo usuário; não é diagnóstico.','', 'PERFIL',...['idade','sexo','sangue','alerg','cond'].filter(k=>first(p,[k])!==null).map(k=>k+': '+first(p,[k])),'','INDICADORES RECENTES'];
 const all=measurements();
 ['peso','weight','pressao','pressaoArterial','pa','glicemia','glicose','cintura','dor'].forEach(k=>{const x=all.filter(r=>r.field===k).sort((a,b)=>(b.date?.getTime()||0)-(a.date?.getTime()||0))[0];if(x)lines.push(k+': '+x.value+' ('+fmtDate(x.date)+')')});
 lines.push('','MEDICAMENTOS ('+meds.length+')');meds.forEach((x,i)=>lines.push((i+1)+'. '+(first(x,['nome','medicamento','name','titulo'])||'Nome não informado')+(first(x,['dose','dosagem','quantidade'])?' — '+first(x,['dose','dosagem','quantidade']):'')));
 lines.push('Registros de doses tomadas: '+taken.length,'','CONSULTAS ('+consults.length+')');consults.slice(-15).forEach(x=>lines.push('- '+fmtDate(dateOf(x))+' — '+(first(x,['especialidade','medico','profissional','motivo','titulo'])||'Consulta registrada')));
 lines.push('','EXAMES ('+exams.length+')');exams.slice(-15).forEach(x=>lines.push('- '+fmtDate(dateOf(x))+' — '+(first(x,['nome','exame','titulo','tipo'])||'Exame registrado')+(first(x,['resultado','descricao'])?' — '+first(x,['resultado','descricao']):'')));
 lines.push('','SINTOMAS / DORES ('+pain.length+')');pain.slice(-15).forEach(x=>lines.push('- '+fmtDate(dateOf(x))+' — '+(first(x,['sintoma','nome','dor','descricao','tipo'])||'Registro de sintoma')+(first(x,['intensidade','nivel'])?' (intensidade '+first(x,['intensidade','nivel'])+')':'')));
 lines.push('','Sinais vitais cadastrados: '+v.length,'Medidas corporais cadastradas: '+m.length,'','Leve os exames originais e confirme os dados com o profissional de saúde.');
 return lines.join('\n');
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