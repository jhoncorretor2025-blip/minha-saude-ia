/* Minha Saúde IA V5.99 — Evolução, gráficos e resumo inteligente */
(function(){
'use strict';
const K=window.MSA_K||window.K||{};
const S=window.MSAStorage;
const get=k=>S&&k?S.get(k):[];
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const num=v=>{const n=Number(String(v??'').replace(',','.'));return Number.isFinite(n)?n:null};
const dateBR=d=>{if(!d)return '—';const p=String(d).slice(0,10).split('-');return p.length===3?p.reverse().join('/'):String(d)};
function sorted(a){return (Array.isArray(a)?a:[]).filter(x=>x&&x.data).sort((a,b)=>String(a.data).localeCompare(String(b.data)))}
function canvasLine(canvas,items,key,label,unit){
 const ctx=canvas.getContext('2d'), dpr=window.devicePixelRatio||1, w=canvas.clientWidth||600,h=220;
 canvas.width=w*dpr;canvas.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
 if(items.length<2){ctx.fillStyle='#64748b';ctx.font='13px system-ui';ctx.fillText('Registre pelo menos 2 dados para visualizar a evolução.',16,32);return}
 const vals=items.map(x=>num(x[key])).filter(v=>v!==null); if(vals.length<2)return;
 const min=Math.min(...vals),max=Math.max(...vals),pad=(max-min||1)*.18;
 const lo=min-pad,hi=max+pad,left=42,right=12,top=18,bottom=34;
 ctx.strokeStyle='#e5eaf2';ctx.lineWidth=1;
 for(let i=0;i<4;i++){const y=top+(h-top-bottom)*i/3;ctx.beginPath();ctx.moveTo(left,y);ctx.lineTo(w-right,y);ctx.stroke()}
 const points=items.map((x,i)=>{const v=num(x[key]);if(v===null)return null;const px=left+(w-left-right)*i/Math.max(1,items.length-1);const py=top+(h-top-bottom)*(1-(v-lo)/(hi-lo));return [px,py,v,x.data]}).filter(Boolean);
 if(!points.length)return;
 ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.strokeStyle='#2563eb';ctx.lineWidth=3;ctx.stroke();
 points.forEach(p=>{ctx.beginPath();ctx.arc(p[0],p[1],4,0,Math.PI*2);ctx.fillStyle='#2563eb';ctx.fill();});
 ctx.fillStyle='#64748b';ctx.font='11px system-ui';ctx.fillText(String(lo.toFixed(1))+unit,4,h-12);ctx.fillText(String(hi.toFixed(1))+unit,4,12);
 ctx.fillText(dateBR(points[0][3]),left,h-10);ctx.fillText(dateBR(points[points.length-1][3]),Math.max(left,w-80),h-10);
}
function metricCard(icon,title,value,sub,cls){return '<div class="msa98-kpi '+(cls||'')+'"><div class="msa98-kpi-icon">'+icon+'</div><div><small>'+title+'</small><strong>'+value+'</strong><span>'+sub+'</span></div></div>'}
function build(){
 if(document.getElementById('msa98-evolution'))return;
 const home=document.getElementById('home');if(!home)return;
 const medidas=sorted(get(K.medidas)), vitais=sorted(get(K.v)), meds=get(K.m), consultas=get(K.c), exames=get(K.e);
 const latestM=medidas[medidas.length-1]||{}, latestV=vitais[vitais.length-1]||{};
 const peso=num(latestV.peso), cintura=num(latestM.barriga), quadril=num(latestM.gluteos), biceps=num(latestM.biceps);
 const firstPeso=vitais.find(x=>num(x.peso)!==null), deltaPeso=peso!==null&&firstPeso?peso-num(firstPeso.peso):null;
 const activeMeds=meds.filter(x=>!x.fim||String(x.fim)>=new Date().toISOString().slice(0,10)).length;
 const timeline=[];
 const add=(arr,icon,title,sub)=>sorted(arr).forEach(x=>timeline.push({date:x.data||x.inicio,icon,title,sub}));
 add(get(K.v),'❤️','Sinal vital',latestV.pressao||latestV.peso?((latestV.pressao?'Pressão '+latestV.pressao:'')+(latestV.peso?' · '+latestV.peso+' kg':'')):'' );
 add(medidas,'📏','Medida corporal',x=>x);
 get(K.c).forEach(x=>timeline.push({date:x.data,icon:'👨‍⚕️',title:'Consulta',sub:x.esp||x.med||x.mot||''}));
 get(K.e).forEach(x=>timeline.push({date:x.data,icon:'🧪',title:'Exame',sub:x.nome||''}));
 timeline.sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));
 const recent=timeline.slice(0,6);
 let insights=[];
 if(deltaPeso!==null) insights.push((deltaPeso>0?'⚖️ Peso aumentou ':'⚖️ Peso reduziu ')+Math.abs(deltaPeso).toFixed(1)+' kg desde o primeiro registro disponível.');
 if(cintura!==null) insights.push('📏 Última cintura registrada: '+cintura.toFixed(1)+' cm.');
 if(latestV.pressao) insights.push('❤️ Última pressão registrada: '+esc(latestV.pressao)+'.');
 if(meds.length) insights.push('💊 '+activeMeds+' medicamento(s) atualmente registrado(s) como ativo(s).');
 if(!insights.length) insights.push('Comece registrando peso, medidas ou sinais vitais para liberar análises da sua evolução.');
 const el=document.createElement('section');el.id='msa98-evolution';el.className='msa98-section';
 el.innerHTML='<div class="msa98-head"><div><span class="msa98-kicker">📊 EVOLUÇÃO DA SAÚDE</span><h2>Minha evolução</h2><p>Acompanhe mudanças reais nos seus registros, sem transformar dados em diagnóstico.</p></div><button type="button" id="msa98-refresh" class="btn secondary small">↻ Atualizar</button></div>'+
 '<div class="msa98-kpis">'+metricCard('⚖️','Peso',peso!==null?peso.toFixed(1)+' kg':'—',deltaPeso===null?'Registre sinais vitais':(deltaPeso>0?'+'+deltaPeso.toFixed(1)+' kg no histórico':deltaPeso.toFixed(1)+' kg no histórico'))+
 metricCard('📏','Cintura',cintura!==null?cintura.toFixed(1)+' cm':'—',medidas.length?'Última medição':'Sem medidas')+
 metricCard('🍑','Quadril',quadril!==null?quadril.toFixed(1)+' cm':'—',medidas.length?'Última medição':'Sem medidas')+
 metricCard('💪','Bíceps',biceps!==null?biceps.toFixed(1)+' cm':'—',medidas.length?'Última medição':'Sem medidas')+'</div>'+
 '<div class="msa98-grid"><div class="card msa98-chart-card"><div class="msa98-chart-title"><h3>⚖️ Evolução do peso</h3><span>Histórico registrado</span></div><canvas id="msa98-weight"></canvas></div>'+
 '<div class="card msa98-chart-card"><div class="msa98-chart-title"><h3>📏 Evolução da cintura</h3><span>Medidas corporais</span></div><canvas id="msa98-waist"></canvas></div></div>'+
 '<div class="msa98-grid msa98-bottom"><div class="card msa98-summary"><div class="msa98-chart-title"><h3>🧠 Resumo inteligente</h3><span>Baseado apenas nos seus registros</span></div><ul>'+insights.map(x=>'<li>'+x+'</li>').join('')+'</ul><div class="msa98-disclaimer">ℹ️ Este resumo organiza informações registradas e não substitui avaliação médica.</div></div>'+
 '<div class="card msa98-timeline"><div class="msa98-chart-title"><h3>🕒 Linha do tempo</h3><span>'+timeline.length+' eventos</span></div>'+ (recent.length?recent.map(x=>'<div class="msa98-event"><b>'+esc(x.icon)+' '+esc(x.title)+'</b><small>'+dateBR(x.date)+'</small><span>'+esc(typeof x.sub==='string'?x.sub:'')+'</span></div>').join(''):'<div class="empty">Ainda não há eventos suficientes.</div>')+'</div></div>';
 const anchor=document.getElementById('homeProfileHero')||home.firstElementChild; if(anchor&&anchor.parentElement===home)anchor.insertAdjacentElement('afterend',el);else home.appendChild(el);
 el.querySelector('#msa98-refresh').onclick=()=>renderAll();
 renderAll();
}
function renderAll(){
 const m=sorted(get(K.medidas)),v=sorted(get(K.v));
 const wc=document.getElementById('msa98-weight'),wa=document.getElementById('msa98-waist');
 if(wc)canvasLine(wc,v,'peso','Peso',' kg');
 if(wa)canvasLine(wa,m,'barriga','Cintura',' cm');
}
function boot(){build();renderAll();setInterval(()=>{if(document.getElementById('msa98-evolution'))renderAll();else build()},2500)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else setTimeout(boot,400);
window.addEventListener('resize',renderAll);
})();
