/* Minha Saúde IA — Dashboard visual + mapa de sintomas V7.59
 * Usa históricos existentes. Não altera nem migra registros.
 */
(function(){
'use strict';
if(window.__msaVisualDashboardPainMap759)return;
window.__msaVisualDashboardPainMap759=true;
const $=id=>document.getElementById(id);
const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const KEY={profile:'msa2_perfil',pain:'msa2_dores',vitals:'msa2_vitais',measures:'msa2_medidas_corporais',water:'msa2_hidratacao',sleep:'msa2_sono',meds:'msa2_meds',medRoutine:'msa2_medicamentos_rotina',activity:'msa2_atividade_fisica'};
let periodDays=90,selectedPainDay='';
function list(key){
 try{const api=window.MSAStorage;if(api&&typeof api.get==='function'){const v=api.get(key);if(Array.isArray(v))return v;if(v&&typeof v==='object')return[v];return[]}
 const raw=localStorage.getItem(key),v=raw?JSON.parse(raw):[];return Array.isArray(v)?v:(v&&typeof v==='object'?[v]:[])
 }catch(e){return[]}
}
function num(v){if(v===undefined||v===null||String(v).trim()==='')return null;const n=Number(String(v).trim().replace(',','.').replace(/[^0-9.\-]/g,''));return Number.isFinite(n)?n:null}
function dayString(v){
 if(v===undefined||v===null||v==='')return '';
 if(typeof v==='number'){const d=new Date(v);return Number.isNaN(d.getTime())?'':localDay(d)}
 const s=String(v).trim(),m=s.match(/^(\d{4})-(\d{2})-(\d{2})/);
 if(m)return m[1]+'-'+m[2]+'-'+m[3];
 const d=new Date(s);return Number.isNaN(d.getTime())?'':localDay(d)
}
function localDay(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function fromDay(s){const m=String(s||'').match(/^(\d{4})-(\d{2})-(\d{2})$/);return m?new Date(Number(m[1]),Number(m[2])-1,Number(m[3]),12,0,0):null}
function shiftDay(s,n){const d=fromDay(s);if(!d)return'';d.setDate(d.getDate()+n);return localDay(d)}
function fmtDay(s){const d=fromDay(s);return d?d.toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'}):'—'}
function dateOf(o){return dayString(o&&(o.data||o.dataRegistro||o.dataMedicao||o.dia||o.date||o.createdAt||o.atualizadoEm))}
function since(s,n){const now=localDay(new Date()),start=shiftDay(now,-(n-1));return !!s&&s>=start&&s<=now}
function sorted(rows){return rows.slice().sort((a,b)=>a.date.localeCompare(b.date))}
function recent(rows,n){return sorted(rows.filter(r=>since(r.date,n)))}
function profile(){return list(KEY.profile)[0]||{}}
function readWeight(){
 const rows=[];
 [KEY.measures,'msa2_medidas'].forEach(k=>list(k).forEach(o=>{const value=num(o.peso||o.weight),date=dateOf(o);if(value!==null&&date)rows.push({date,value})}));
 list(KEY.vitals).forEach(o=>{const value=num(o.peso||o.weight),date=dateOf(o);if(value!==null&&date)rows.push({date,value})});
 const unique=new Map();rows.forEach(x=>unique.set(x.date+'|'+x.value,x));return sorted(Array.from(unique.values()))
}
function parsePressure(v){
 const m=String(v||'').match(/(\d{1,3}(?:[.,]\d)?)\s*[\/x×]\s*(\d{1,3}(?:[.,]\d)?)/i);if(!m)return null;
 let sys=Number(m[1].replace(',','.')),dia=Number(m[2].replace(',','.'));if(sys>0&&sys<30)sys*=10;if(dia>0&&dia<30)dia*=10;
 return sys>=30&&sys<=300&&dia>=20&&dia<=200?{sys,dia,text:Math.round(sys)+'/'+Math.round(dia)}:null
}
function readPressure(){
 const map=new Map();list(KEY.vitals).forEach(o=>{const date=dateOf(o),p=parsePressure(o.pressao||o.pressaoArterial||o.pa);if(date&&p)map.set(date+'|'+p.text,{date,sys:p.sys,dia:p.dia,text:p.text})});return sorted(Array.from(map.values()))
}
function readWater(){
 const totals=new Map();list(KEY.water).forEach(o=>{const date=dateOf(o),q=num(o.qtd||o.quantidade||o.ml||o.agua);if(date&&q!==null&&q>=0)totals.set(date,(totals.get(date)||0)+q)});
 return sorted(Array.from(totals.entries()).map(([date,value])=>({date,value})))
}
function readSleep(){
 const out=[];list(KEY.sleep).forEach(o=>{
  if(o.habitual||String(o.id||'')==='habitual')return;
  let value=num(o.horas||o.duracao||o.horasDormidas),date=dateOf(o);
  if(value===null&&o.dormiu&&o.acordou){const a=String(o.dormiu).split(':').map(Number),b=String(o.acordou).split(':').map(Number);if(a.length>1&&b.length>1&&a.every(Number.isFinite)&&b.every(Number.isFinite)){let min=b[0]*60+b[1]-a[0]*60-a[1];if(min<=0)min+=1440;value=min/60}}
  if(date&&value!==null&&value>=0&&value<=24)out.push({date,value})
 });
 const map=new Map();out.forEach(x=>map.set(x.date+'|'+x.value,x));return sorted(Array.from(map.values()))
}
function painRecords(){return list(KEY.pain).map((o,i)=>Object.assign({},o,{__day:dateOf(o),__int:num(o.int),__uid:String(o.id||i)})).filter(o=>o.__day)}
function painWithin(rows,n){return rows.filter(r=>since(r.__day,n))}
function addStyles(){
 if($('msaVisualChartsStyles759'))return;
 const st=document.createElement('style');st.id='msaVisualChartsStyles759';
 st.textContent=
 '.msa-vd-wrap{margin:14px 0 16px;padding:15px;border:1px solid #dce5f2;border-radius:20px;background:var(--card-bg,#fff);color:var(--text-color,#172033);box-shadow:0 5px 18px rgba(20,40,80,.045)}\n'+
 '.msa-vd-header{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap}.msa-vd-kicker{font-size:11px;font-weight:900;letter-spacing:.08em;color:#64748b}.msa-vd-sub{font-size:12px;line-height:1.5;color:#64748b;margin:4px 0 0}\n'+
 '.msa-vd-ranges{display:flex;gap:5px;overflow-x:auto;padding:2px 0}.msa-vd-ranges button{border:1px solid #d7e0ed;border-radius:999px;background:transparent;color:inherit;padding:7px 11px;font:inherit;font-size:12px;font-weight:800;white-space:nowrap;cursor:pointer}.msa-vd-ranges button[aria-pressed=true]{background:#e7efff;border-color:#8db1ff;color:#1d4ed8}\n'+
 '.msa-vd-metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin:13px 0}.msa-vd-metric{padding:11px;border:1px solid #e5ebf4;border-radius:13px;background:#f8fafc;min-width:0}.msa-vd-metric span{font-size:12px;color:#64748b;display:block}.msa-vd-metric b{display:block;font-size:22px;line-height:1.25;margin-top:5px;overflow-wrap:anywhere}.msa-vd-metric small{display:block;color:#64748b;font-size:11px;margin-top:3px;line-height:1.4}\n'+
 '.msa-vd-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.msa-vd-chart{padding:13px;border:1px solid #e4eaf3;border-radius:15px;min-width:0;background:var(--card-bg,#fff)}.msa-vd-chart h4{font-size:14px;margin:0 0 4px}.msa-vd-chart .msa-vd-current{font-size:21px;font-weight:900;margin:5px 0}.msa-vd-chart svg{display:block;width:100%;height:auto;overflow:visible}.msa-vd-chart .msa-vd-muted{font-size:11px;line-height:1.45;color:#64748b;margin-top:6px}.msa-vd-empty{border:1px dashed #cbd5e1;border-radius:11px;padding:13px;color:#64748b;font-size:12px;line-height:1.5;background:#f8fafc}.msa-vd-legend{display:flex;flex-wrap:wrap;gap:10px;font-size:11px;color:#64748b;margin-top:7px}\n'+
 '.msa-painmap-wrap{margin:13px 0;padding:15px;border:1px solid #dce5f2;border-radius:18px;background:var(--card-bg,#fff);color:var(--text-color,#172033)}.msa-pm-weekdays,.msa-pm-grid{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:4px}.msa-pm-weekdays div{text-align:center;font-size:10px;font-weight:800;color:#64748b;padding:4px 0}.msa-pm-day{min-width:0;min-height:42px;border:1px solid #e2e8f0;border-radius:8px;background:#f8fafc;color:#64748b;padding:4px 1px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;font:inherit;cursor:pointer}.msa-pm-day[disabled]{cursor:default;opacity:.35}.msa-pm-day .msa-pm-num{font-size:11px;font-weight:800}.msa-pm-day .msa-pm-score{font-size:10px;font-weight:900}\n'+
 '.msa-pm-day[data-level="1"]{background:#e0f2fe;border-color:#bae6fd;color:#075985}.msa-pm-day[data-level="2"]{background:#fef3c7;border-color:#fde68a;color:#92400e}.msa-pm-day[data-level="3"]{background:#fed7aa;border-color:#fdba74;color:#9a3412}.msa-pm-day[data-level="4"]{background:#fee2e2;border-color:#fecaca;color:#991b1b}.msa-pm-day.selected{outline:3px solid #2563eb;outline-offset:1px}\n'+
 '.msa-pm-legend{display:flex;flex-wrap:wrap;gap:6px 10px;font-size:10px;color:#64748b;margin-top:9px}.msa-pm-key{display:inline-flex;align-items:center;gap:4px}.msa-pm-swatch{width:11px;height:11px;border-radius:3px;border:1px solid #cbd5e1}.msa-pm-detail{margin-top:12px;padding:11px;border:1px solid #e2e8f0;border-radius:12px;background:#f8fafc;font-size:12px;line-height:1.5}.msa-pm-detail h4{margin:0 0 7px;font-size:13px}.msa-pm-record{padding:8px 0;border-top:1px solid #e2e8f0}.msa-pm-record:first-of-type{border-top:0}.msa-pm-bars{display:grid;grid-template-columns:repeat(8,minmax(0,1fr));gap:6px;align-items:end;margin-top:10px}.msa-pm-weekbar{display:flex;flex-direction:column;align-items:center;justify-content:end;gap:5px;min-width:0;font-size:10px;color:#64748b}.msa-pm-weekbar .bar{width:100%;height:54px;display:flex;align-items:end;background:#f1f5f9;border-radius:6px 6px 2px 2px;overflow:hidden}.msa-pm-weekbar .bar i{display:block;width:100%;border-radius:5px 5px 0 0;background:#2563eb;min-height:0}\n'+
 '@media(max-width:650px){.msa-vd-metrics{grid-template-columns:repeat(2,minmax(0,1fr))}.msa-vd-grid{grid-template-columns:1fr}.msa-vd-wrap,.msa-painmap-wrap{padding:12px}.msa-pm-day{min-height:37px}.msa-pm-bars{gap:3px}.msa-pm-weekbar{font-size:9px}}\n'+
 'body.msa-dark .msa-vd-wrap,body.msa-dark .msa-vd-chart,body.msa-dark .msa-painmap-wrap{background:#111827;color:#e5e7eb;border-color:#334155}body.msa-dark .msa-vd-metric,body.msa-dark .msa-vd-empty,body.msa-dark .msa-pm-detail{background:#1f2937;border-color:#374151;color:#e5e7eb}body.msa-dark .msa-pm-day{border-color:#374151;background:#1f2937;color:#cbd5e1}';
 document.head.appendChild(st)
}
function lineSvg(rows,key,color,otherKey){
 if(!rows.length)return '';
 const W=320,H=100,L=15,R=8,T=9,B=20,pw=W-L-R,ph=H-T-B;
 const values=rows.flatMap(r=>[num(r[key]),otherKey?num(r[otherKey]):null]).filter(v=>v!==null);
 let min=Math.min(...values),max=Math.max(...values);if(min===max){min-=1;max+=1}
 const y=v=>T+(max-v)/(max-min)*ph,x=(r,i)=>L+(rows.length===1?pw/2:i*pw/(rows.length-1));
 const line=key2=>rows.map((r,i)=>x(r,i)+','+y(num(r[key2]))).join(' ');
 const labels=rows.map((r,i)=>(i===0||i===rows.length-1||i===Math.floor((rows.length-1)/2))?'<text x="'+x(r,i)+'" y="'+(H-5)+'" text-anchor="middle" fill="#64748b" font-size="9">'+esc(fmtDay(r.date))+'</text>':'').join('');
 const dots=k=>rows.map((r,i)=>'<circle cx="'+x(r,i)+'" cy="'+y(num(r[k]))+'" r="3" fill="'+(k===key?color:'#0d9488')+'"><title>'+esc(fmtDay(r.date))+': '+esc(num(r[k]))+'</title></circle>').join('');
 return '<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Gráfico de evolução"><line x1="'+L+'" y1="'+(T+ph)+'" x2="'+(W-R)+'" y2="'+(T+ph)+'" stroke="#cbd5e1"/><line x1="'+L+'" y1="'+(T+ph/2)+'" x2="'+(W-R)+'" y2="'+(T+ph/2)+'" stroke="#e2e8f0" stroke-dasharray="3 3"/><polyline points="'+line(key)+'" fill="none" stroke="'+color+'" stroke-width="2.7" stroke-linecap="round" stroke-linejoin="round"/>'+dots(key)+(otherKey?'<polyline points="'+line(otherKey)+'" fill="none" stroke="#0d9488" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>'+dots(otherKey):'')+labels+'</svg>'
}
function barSvg(rows,color,unit){
 if(!rows.length)return '';
 const W=320,H=100,L=8,R=8,T=7,B=23,ph=H-T-B,gap=rows.length>12?3:6,width=(W-L-R-gap*(rows.length-1))/rows.length;
 const vals=rows.map(r=>Math.max(0,num(r.value)||0)),max=Math.max(...vals,1);
 const bars=rows.map((r,i)=>{const v=Math.max(0,num(r.value)||0),h=v>0?Math.max(2,v/max*ph):0;
 return '<g><rect x="'+(L+i*(width+gap))+'" y="'+(T+ph-h)+'" width="'+Math.max(2,width)+'" height="'+h+'" rx="3" fill="'+color+'"><title>'+esc(fmtDay(r.date))+': '+esc(v)+' '+esc(unit)+'</title></rect>'+((i===0||i===rows.length-1||i===Math.floor((rows.length-1)/2))?'<text x="'+(L+i*(width+gap)+width/2)+'" y="'+(H-5)+'" text-anchor="middle" fill="#64748b" font-size="9">'+esc(fmtDay(r.date))+'</text>':'')+'</g>'}).join('');
 return '<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Gráfico de barras"><line x1="'+L+'" y1="'+(T+ph)+'" x2="'+(W-R)+'" y2="'+(T+ph)+'" stroke="#cbd5e1"/>'+bars+'</svg>'
}
function card(title,current,sub,chart,empty){
 return '<article class="msa-vd-chart"><h4>'+esc(title)+'</h4>'+(current?'<div class="msa-vd-current">'+esc(current)+'</div>':'')+(chart||'<div class="msa-vd-empty">'+esc(empty||'Ainda não existem dados suficientes para desenhar este gráfico.')+'</div>')+(sub?'<div class="msa-vd-muted">'+esc(sub)+'</div>':'')+'</article>'
}
function dashboard(){
 const home=$('home');if(!home)return;
 let host=$('msaVisualDashboard759');
 if(!host){host=document.createElement('section');host.id='msaVisualDashboard759';host.className='msa-vd-wrap';host.setAttribute('aria-label','Dashboard visual da saúde');const anchor=home.querySelector('.metric-panel');if(anchor)anchor.insertAdjacentElement('afterend',host);else if($('homeSmartHealth'))$('homeSmartHealth').insertAdjacentElement('afterend',host);else home.prepend(host)}
 const p=profile(),now=localDay(new Date());
 const weights=recent(readWeight(),periodDays),pressures=recent(readPressure(),periodDays),water=recent(readWater(),periodDays),sleeps=recent(readSleep(),periodDays),pains=painWithin(painRecords(),periodDays);
 const meds=list(KEY.meds),routine=list(KEY.medRoutine),act=list(KEY.activity);
 const weight=weights.length?weights[weights.length-1].value:num(p.peso);
 const latestPressure=pressures.length?pressures[pressures.length-1]:null;
 const waterDays=water.filter(x=>x.date>=shiftDay(now,-6)),waterLast=waterDays.length?waterDays[waterDays.length-1]:null;
 const sleepRoutine=list(KEY.sleep).find(x=>x.habitual||String(x.id||'')==='habitual'),habitHours=sleepRoutine?num(sleepRoutine.horas):null;
 const validPain=pains.filter(x=>x.__int!==null),painAvg=validPain.length?Math.round(validPain.reduce((sum,x)=>sum+x.__int,0)/validPain.length*10)/10:null;
 const activityText=String(p.atividadeFisica||p.academia||'').trim(),activityFreq=num(p.academiaFreq);
 const range=n=>'<button type="button" data-vd-range="'+n+'" aria-pressed="'+(periodDays===n)+'">'+(n===30?'30 dias':n===90?'90 dias':'1 ano')+'</button>';
 host.innerHTML=
 '<div class="msa-vd-header"><div><div class="msa-vd-kicker">📊 VISÃO GERAL</div><h2 style="margin:4px 0;font-size:20px">Dashboard visual da saúde</h2><p class="msa-vd-sub">Gráficos construídos com os registros existentes. Dados ausentes não são estimados.</p></div><div class="msa-vd-ranges" aria-label="Período dos gráficos">'+range(30)+range(90)+range(365)+'</div></div>'+
 '<div class="msa-vd-metrics"><div class="msa-vd-metric"><span>⚖️ Peso mais recente</span><b>'+(weight===null?'—':esc(weight)+' kg')+'</b><small>'+(weights.length?'Medição de '+esc(fmtDay(weights[weights.length-1].date)):(p.peso?'Valor do perfil, sem data histórica':'Cadastre peso para visualizar'))+'</small></div>'+
 '<div class="msa-vd-metric"><span>❤️ Última pressão</span><b>'+(latestPressure?esc(latestPressure.text):'—')+'</b><small>'+(latestPressure?esc(fmtDay(latestPressure.date)):'Sem pressão registrada')+'</small></div>'+
 '<div class="msa-vd-metric"><span>😣 Sintomas registrados</span><b>'+pains.length+'</b><small>'+(painAvg!==null?'Intensidade média '+painAvg+'/10':'Últimos '+periodDays+' dias')+'</small></div>'+
 '<div class="msa-vd-metric"><span>💊 Medicamentos</span><b>'+meds.length+'</b><small>'+routine.length+' rotina(s) de horário cadastrada(s)</small></div></div>'+
 '<div class="msa-vd-grid">'+
 card('⚖️ Evolução do peso',weights.length?weights[weights.length-1].value+' kg':'',weights.length?'Última medição '+fmtDay(weights[weights.length-1].date)+' · '+weights.length+' registro(s) no período':'',lineSvg(weights,'value','#2563eb'),p.peso?'Há peso no perfil, mas ainda não há medições datadas suficientes para desenhar a tendência.':'Cadastre peso em “Medidas corporais” para construir a evolução.')+
 card('❤️ Pressão arterial',latestPressure?latestPressure.text:'',pressures.length?'Último registro '+fmtDay(latestPressure.date)+' · '+pressures.length+' registro(s) no período':'',lineSvg(pressures,'sys','#2563eb','dia'),'Registre a pressão em “Acompanhamento” para gerar o gráfico.')+
 card('💧 Hidratação diária',waterLast?Math.round(waterLast.value).toLocaleString('pt-BR')+' ml':'',waterLast?'Último dia registrado: '+fmtDay(waterLast.date):'',barSvg(waterDays,'#0d9488','ml'),'Registre a quantidade de água em ml para visualizar os totais diários.')+
 card('🌙 Sono',sleeps.length?sleeps[sleeps.length-1].value.toLocaleString('pt-BR')+' h':'',sleeps.length?'Histórico datado · '+sleeps.length+' registro(s)':(habitHours!==null?'Rotina habitual informada: '+habitHours+' h; não é uma série diária.':'Rotina de sono ainda não informada.'),lineSvg(sleeps,'value','#7c3aed'),'Registre dados de sono datados para visualizar a evolução.')+
 card('🏃 Atividade física',activityText||'Não informada',activityFreq!==null?'Frequência de academia informada: '+activityFreq+' vez(es)/semana':(act.length?act.length+' registro(s) de atividade física':'Dados de rotina disponíveis no perfil'),act.length?barSvg(act.map(x=>({date:dateOf(x),value:num(x.minutos||x.duracao||x.tempo)||0})).filter(x=>x.date).slice(-12),'#ea580c','min'):'','Este resumo usa os dados cadastrados. Sem histórico datado de treino, não desenha tendência.')+
 card('💊 Organização dos medicamentos',meds.length+' cadastrados',routine.length+' rotina(s) cadastrada(s) · confira a lista em Medicamentos','',meds.length||routine.length?'':'Cadastre medicamentos para que apareçam neste resumo.')+
 '</div><p class="msa-vd-sub" style="margin-top:12px">Este painel organiza informações, não faz diagnóstico. Cada indicador deve ser interpretado em seu contexto clínico.</p>';
 host.querySelectorAll('[data-vd-range]').forEach(btn=>btn.addEventListener('click',()=>{periodDays=Number(btn.dataset.vdRange)||90;dashboard()}))
}
function renderPainMap(){
 const section=$('dor'),chartEl=$('chart');if(!section||!chartEl)return;
 let host=$('msaPainCalendarMap759');
 if(!host){host=document.createElement('section');host.id='msaPainCalendarMap759';host.className='msa-painmap-wrap';host.setAttribute('aria-label','Mapa visual de sintomas e dores');const cardEl=chartEl.closest('.card');if(cardEl)cardEl.insertAdjacentElement('afterend',host);else section.appendChild(host)}
 const all=painRecords(),today=localDay(new Date()),start=shiftDay(today,-55),rows=painWithin(all,56),dayMap=new Map();
 rows.forEach(r=>{if(!dayMap.has(r.__day))dayMap.set(r.__day,[]);dayMap.get(r.__day).push(r)});
 const days=[];for(let i=0;i<56;i++){const day=shiftDay(start,i);days.push({day,rows:dayMap.get(day)||[]})}
 const blanks=(fromDay(start).getDay()+6)%7;
 const cells=new Array(blanks).fill(null).concat(days).map(item=>{
  if(!item)return '<div aria-hidden="true"></div>';
  const rs=item.rows,vals=rs.map(x=>x.__int).filter(x=>x!==null),avg=vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:null,max=vals.length?Math.max(...vals):null,level=max===null?0:max<=3?1:max<=6?2:max<=8?3:4;
  const label=rs.length+' registro(s)'+(avg===null?'':' · média '+avg.toFixed(1)+'/10')+(max===null?'':' · máximo '+max+'/10');
  const tip=fmtDay(item.day)+': '+label+(rs.length?' · '+rs.map(x=>x.local||'local não informado').join(', '):' · sem registro de sintoma');
  return '<button type="button" class="msa-pm-day '+(selectedPainDay===item.day?'selected':'')+'" data-pm-day="'+item.day+'" data-level="'+level+'" aria-label="'+esc(tip)+'" title="'+esc(tip)+'"><span class="msa-pm-num">'+Number(item.day.slice(-2))+'</span><span class="msa-pm-score">'+(avg===null?'·':avg.toFixed(1))+'</span></button>'
 }).join('');
 const weeks=[];for(let w=0;w<8;w++){const wr=days.slice(w*7,w*7+7).flatMap(x=>x.rows),vals=wr.map(x=>x.__int).filter(x=>x!==null);weeks.push({rows:wr,avg:vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:null,label:fmtDay(days[w*7].day)+'–'+fmtDay(days[w*7+6].day)})}
 const top={};rows.forEach(r=>{const k=String(r.local||'Local não informado').trim();top[k]=(top[k]||0)+1});
 const topLoc=Object.entries(top).sort((a,b)=>b[1]-a[1]).slice(0,4),valid=rows.map(x=>x.__int).filter(x=>x!==null),avg=valid.length?Math.round(valid.reduce((a,b)=>a+b,0)/valid.length*10)/10:null,active=days.filter(x=>x.rows.length).length;
 host.innerHTML=
 '<div class="msa-vd-header"><div><div class="msa-vd-kicker">😣 PADRÕES DOS SINTOMAS</div><h2 style="margin:4px 0;font-size:19px">Mapa visual de sintomas e dores</h2><p class="msa-vd-sub">Últimos 56 dias. Toque em uma data para ver os registros. Dia vazio significa que não há registro no app, não necessariamente que não houve dor.</p></div><button type="button" id="msaPainMapRefresh759" style="padding:8px 11px;border:1px solid #cbd5e1;border-radius:10px;background:transparent;cursor:pointer">↻ Atualizar</button></div>'+
 '<div class="msa-vd-metrics"><div class="msa-vd-metric"><span>📝 Registros</span><b>'+rows.length+'</b><small>nos últimos 56 dias</small></div><div class="msa-vd-metric"><span>📅 Dias registrados</span><b>'+active+'</b><small>de 56 dias acompanhados</small></div><div class="msa-vd-metric"><span>📊 Intensidade média</span><b>'+(avg===null?'—':avg+'/10')+'</b><small>'+valid.length+' registro(s) com intensidade</small></div><div class="msa-vd-metric"><span>🔺 Maior intensidade</span><b>'+(valid.length?Math.max(...valid)+'/10':'—')+'</b><small>valor cadastrado</small></div></div>'+
 '<div class="msa-pm-weekdays"><div>Seg</div><div>Ter</div><div>Qua</div><div>Qui</div><div>Sex</div><div>Sáb</div><div>Dom</div></div><div class="msa-pm-grid">'+cells+'</div>'+
 '<div class="msa-pm-legend"><span class="msa-pm-key"><i class="msa-pm-swatch" style="background:#f8fafc"></i>Sem registro</span><span class="msa-pm-key"><i class="msa-pm-swatch" style="background:#e0f2fe"></i>1–3</span><span class="msa-pm-key"><i class="msa-pm-swatch" style="background:#fef3c7"></i>4–6</span><span class="msa-pm-key"><i class="msa-pm-swatch" style="background:#fed7aa"></i>7–8</span><span class="msa-pm-key"><i class="msa-pm-swatch" style="background:#fee2e2"></i>9–10</span><span>Intensidade cadastrada de 0 a 10</span></div>'+
 '<div class="msa-pm-detail" id="msaPainDayDetail759"><h4>📍 Detalhes do dia</h4><div>Selecione uma data no mapa para ver local, intensidade e observações.</div></div>'+
 '<div style="border-top:1px solid #e2e8f0;margin-top:13px;padding-top:12px"><h4 style="margin:0 0 4px;font-size:14px">📊 Intensidade média por semana</h4><p class="msa-vd-sub">Média dos valores registrados em blocos de sete dias.</p><div class="msa-pm-bars">'+weeks.map((w,i)=>'<div class="msa-pm-weekbar" title="'+esc(w.label)+': '+(w.avg===null?'sem intensidade':w.avg.toFixed(1)+'/10')+'"><b>'+(w.avg===null?'—':w.avg.toFixed(1))+'</b><div class="bar"><i style="height:'+(w.avg===null?0:Math.max(4,w.avg*10))+'%"></i></div><span>'+esc(fmtDay(days[i*7].day))+'</span></div>').join('')+'</div></div>'+
 (topLoc.length?'<div style="border-top:1px solid #e2e8f0;margin-top:13px;padding-top:12px"><h4 style="margin:0 0 6px;font-size:14px">📍 Locais mais registrados</h4><div style="display:flex;gap:7px;flex-wrap:wrap">'+topLoc.map(x=>'<span style="padding:6px 9px;border:1px solid #dbeafe;border-radius:999px;font-size:11px">'+esc(x[0])+' · '+x[1]+'</span>').join('')+'</div></div>':'')+
 '<p class="msa-vd-sub" style="margin-top:12px">Este mapa descreve os registros informados por você. Não identifica a causa da dor nem substitui avaliação profissional.</p>';
 host.querySelectorAll('[data-pm-day]').forEach(btn=>btn.addEventListener('click',()=>{selectedPainDay=btn.dataset.pmDay;showPainDay(selectedPainDay,dayMap);host.querySelectorAll('[data-pm-day]').forEach(b=>b.classList.toggle('selected',b.dataset.pmDay===selectedPainDay))}));
 $('msaPainMapRefresh759').onclick=()=>{selectedPainDay='';renderPainMap()};
 if(selectedPainDay&&dayMap.has(selectedPainDay))showPainDay(selectedPainDay,dayMap)
}
function showPainDay(day,map){
 const out=$('msaPainDayDetail759');if(!out)return;const rows=map.get(day)||[];
 out.innerHTML='<h4>📍 Registros de '+esc(new Date(day+'T12:00:00').toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long',year:'numeric'}))+'</h4>'+
 (rows.length?rows.slice().sort((a,b)=>String(b.data||'').localeCompare(String(a.data||''))).map(r=>'<div class="msa-pm-record"><b>'+esc(r.local||'Local não informado')+'</b> · Intensidade <b>'+(r.__int===null?'não informada':esc(r.__int)+'/10')+'</b>'+(r.data?' · '+esc(String(r.data).slice(11,16)):'')+(r.tipo?'<div>Tipo: '+esc(r.tipo)+'</div>':'')+(r.freq?'<div>Frequência: '+esc(r.freq)+'</div>':'')+(r.gatilho?'<div>O que melhora/piora: '+esc(r.gatilho)+'</div>':'')+(r.sint?'<div>Outros sintomas: '+esc(r.sint)+'</div>':'')+(r.obs?'<div>Observações: '+esc(r.obs)+'</div>':'')+'</div>').join(''):'Não há registros de sintomas cadastrados nesta data.')
}
function renderAll(){addStyles();dashboard();renderPainMap()}
function start(){
 renderAll();
 document.addEventListener('submit',function(e){if(e.target&&['dorForm','medidasForm','vForm','aguaForm','sonoForm','pForm'].includes(e.target.id)){[80,300,800].forEach(ms=>setTimeout(renderAll,ms))}},true);
 document.addEventListener('click',function(e){if(e.target.closest('#nav button,.msa-mobile-links button,.msa-mobile-quick button,[data-go]'))setTimeout(renderAll,180)},true);
 window.addEventListener('msa:familiares-atualizados',()=>setTimeout(renderAll,100));
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)renderAll()})
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
window.msaVisualDashboardPainMap759={render:renderAll,refreshPainMap:renderPainMap};
})();