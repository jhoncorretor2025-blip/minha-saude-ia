/* Minha Saúde IA — aplicação principal V4.70 */

const K=window.MSA_K||window.K;
const get=k=>window.MSAStorage.get(k);
const set=(k,v)=>window.MSAStorage.set(k,v);
const $=x=>document.getElementById(x);
const esc=window.MSAUtils?.esc||function(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))};
function atualizarURLPagina(id,modo){
 try{
  const u=new URL(window.location.href);
  const pagina=id||'home';
  u.searchParams.set('pagina',pagina);
  const state={pagina:pagina};
  if(modo==='replace') history.replaceState(state,'',u.toString());
  else history.pushState(state,'',u.toString());
 }catch(e){console.warn('[Minha Saúde IA] URL da página indisponível:',e)}
}
function paginaDaURL(){
 try{return new URL(window.location.href).searchParams.get('pagina')||'home'}catch(e){return 'home'}
}
function mostrarPaginaDaURL(){
 const id=paginaDaURL();
 const alvo=document.getElementById(id);
 if(!alvo){atualizarURLPagina('home','replace');return}
 document.querySelectorAll('nav button[data-tab]').forEach(b=>b.classList.toggle('active',b.dataset.tab===id));
 document.querySelectorAll('section').forEach(s=>s.classList.toggle('active',s.id===id));
 fecharMenus();
 try{render()}catch(e){console.error('[Minha Saúde IA] render da URL',e)}
}
function go(id){
 document.querySelectorAll('nav button[data-tab]').forEach(b=>b.classList.toggle('active',b.dataset.tab===id));
 document.querySelectorAll('section').forEach(s=>s.classList.toggle('active',s.id===id));
 atualizarURLPagina(id,'push');
 fecharMenus();
 try{render()}catch(e){console.error('[Minha Saúde IA] render ao navegar',e)}
}
window.addEventListener('popstate',function(){mostrarPaginaDaURL()});
function fecharMenus(){
 document.querySelectorAll('#nav .nav-group').forEach(g=>g.classList.remove('open'));
 document.querySelectorAll('#nav .nav-toggle').forEach(b=>{b.classList.remove('open');b.setAttribute('aria-expanded','false')});
}
function bodyPick(el,v){$('dLocal').value=v;document.querySelectorAll('.bodymap button').forEach(x=>x.classList.remove('sel'));el.classList.add('sel')}
function fmt(d){if(!d)return '—';let x=new Date(d);return isNaN(x)?d:x.toLocaleString('pt-BR',{dateStyle:'short',timeStyle:'short'})}
function list(id,a,fn){$(id).innerHTML=a.length?a.slice().reverse().map(fn).join(''):'<div class="empty">Nenhum registro ainda.</div>'}
const formatDateBR=window.MSAUtils?.formatDateBR||function(v){if(!v)return 'Data não informada';var s=String(v);var m=s.match(/^(\\d{4})-(\\d{2})-(\\d{2})/);return m?m[3]+'/'+m[2]+'/'+m[1]:s};
function getNextCare(){
 const p=get(K.p)[0]||{},c=get(K.c),e=get(K.e),m=get(K.m),vax=get(K.vax),r=get(K.r),items=[];
 c.forEach(x=>{if(x.ret)items.push({date:x.ret,icon:'👨‍⚕️',title:'Retorno de consulta',sub:x.esp||x.med||'Consulta'});});
 e.forEach(x=>{if(x.data)items.push({date:x.data,icon:'🧪',title:x.nome||'Exame',sub:'Exame registrado'});});
 vax.forEach(x=>{if(x.data)items.push({date:x.data,icon:'💉',title:x.nome||'Vacina',sub:x.obs||'Vacinação registrada'});});
 r.forEach(x=>{if(x.data)items.push({date:x.data,icon:'📌',title:x.nome||'Lembrete',sub:x.tipo||'Lembrete'});});
 if(p.prevProx)items.push({date:p.prevProx,icon:'🌸',title:'Acompanhamento preventivo',sub:'Data registrada no perfil'});
 return items.sort((a,b)=>String(a.date).localeCompare(String(b.date))).slice(0,6);
}
function atualizarSmartHome(){
 const p=get(K.p)[0]||{},d=get(K.d),c=get(K.c),m=get(K.m),e=get(K.e),v=get(K.v),vax=get(K.vax),r=get(K.r);
 const next=getNextCare(),box=$('nextCareList');
 if(box)box.innerHTML=next.length?next.map(x=>'<div class="smart-item"><div class="smart-item-main"><span class="smart-icon">'+x.icon+'</span><div><b>'+esc(x.title)+'</b><small>'+esc(x.sub)+'</small></div></div><span class="smart-date">'+esc(formatDateBR(x.date))+'</span></div>').join(''):'<div class="muted">Nenhum próximo cuidado registrado. Você pode adicionar consultas, lembretes ou acompanhamentos.</div>';
 const s=$('smartSummary');if(s)s.innerHTML='<div class="smart-kpi"><b>'+d.length+'</b><span>😣 Sintomas</span></div><div class="smart-kpi"><b>'+c.length+'</b><span>👨‍⚕️ Consultas</span></div><div class="smart-kpi"><b>'+m.length+'</b><span>💊 Medicamentos</span></div><div class="smart-kpi"><b>'+e.length+'</b><span>🧪 Exames</span></div><div class="smart-kpi"><b>'+v.length+'</b><span>📈 Sinais vitais</span></div><div class="smart-kpi"><b>'+vax.length+'</b><span>💉 Vacinas</span></div><div class="smart-kpi"><b>'+r.length+'</b><span>📌 Lembretes</span></div><div class="smart-kpi"><b>'+Object.keys(p).filter(k=>String(p[k]||'').trim()).length+'</b><span>👤 Dados do perfil</span></div>';
 const tp=$('timelinePreview');if(tp)tp.innerHTML=buildTimeline().slice(0,5).map(timelineHTML).join('')||'<div class="muted">Ainda não há registros suficientes para mostrar a timeline.</div>';
 const tf=$('timelineFull');if(tf)tf.innerHTML=buildTimeline().map(timelineHTML).join('')||'<div class="muted">Nenhum registro ainda.</div>';
}
function buildTimeline(){
 const out=[],push=(date,icon,title,sub)=>{if(date)out.push({date:String(date),icon:icon,title:title,sub:sub||''})};
 const vazio=v=>!v||/^(valor|não informado|nao informado|n\/a|-)$/i.test(String(v).trim());
 get(K.d).forEach(x=>{
  const local=vazio(x.local)?'':String(x.local).trim();
  const intensidade=Number(x.int);
  let sub='';
  if(local && intensidade>0)sub=local+' — intensidade '+intensidade+'/10';
  else if(local)sub=local;
  else if(intensidade>0)sub='Intensidade '+intensidade+'/10';
  push(x.data,'😣','Sintoma',sub);
 });
 get(K.c).forEach(x=>push(x.data,'👨‍⚕️','Consulta',vazio(x.esp)?(vazio(x.med)?(vazio(x.mot)?'':x.mot):x.med):x.esp));
 get(K.m).forEach(x=>push(x.inicio||x.data,'💊','Medicamento',vazio(x.nome)?'':x.nome));
 get(K.e).forEach(x=>push(x.data,'🧪','Exame',vazio(x.nome)?'':x.nome));
 // Sinais vitais aparecem na timeline apenas como evento.
 // Valores como peso, pressão, FC, temperatura, glicemia e saturação
 // permanecem somente na área de Acompanhamento, evitando exposição
 // de dados sensíveis no resumo cronológico.
 const diasVitais={};
 get(K.v).forEach(x=>{
  const dia=String(x.data||'').slice(0,10);
  if(!dia || diasVitais[dia])return;
  diasVitais[dia]=true;
  push(x.data,'📈','Sinal vital','');
 });
 get(K.vax).forEach(x=>push(x.data,'💉','Vacina',vazio(x.nome)?'':x.nome));
 return out.sort((a,b)=>String(b.date).localeCompare(String(a.date)));
}
function timelineHTML(x){return '<div class="timeline-row"><div class="timeline-date">'+esc(formatDateBR(x.date))+'</div><div class="timeline-dot"></div><div class="timeline-content"><b>'+x.icon+' '+esc(x.title)+'</b><small>'+esc(x.sub)+'</small></div></div>'}
function prepararConsulta(){
 const p=get(K.p)[0]||{},d=get(K.d),m=get(K.m),e=get(K.e),c=get(K.c);
 const preview=$('consultPrepPreview');
 if(preview)preview.innerHTML='<div class="prep-box"><b>📄 Resumo para consulta</b><br><br>Perfil: '+esc(p.nome||'Não informado')+'<br>Sintomas registrados: '+d.length+'<br>Medicamentos: '+m.length+'<br>Exames: '+e.length+'<br>Consultas: '+c.length+'<br><br><button class="btn green" onclick="copiarParaIA()">📋 Copiar resumo para IA</button> <button class="btn secondary" onclick="go(\'relatorios\')">📄 Abrir relatórios</button></div>';
}
function alturaEmCm(valor){
 const n=parseFloat(String(valor??'').replace(',','.'));
 if(!Number.isFinite(n)||n<=0)return null;
 // Aceita tanto centímetros (ex.: 184) quanto metros (ex.: 1,84).
 return n<3?n*100:n;
}
function formatarAltura(valor){
 const cm=alturaEmCm(valor);
 if(!cm)return '—';
 return cm<3?'—':(cm>=100&&cm<300?(cm/100).toFixed(2).replace('.',',')+' m':cm.toFixed(0)+' cm');
}
function calcularIMC(p){
 const peso=parseFloat(String(p.peso||'').replace(',','.')),alturaCm=alturaEmCm(p.altura);
 if(!Number.isFinite(peso)||peso<=0||!alturaCm)return null;
 const h=alturaCm/100,bmi=peso/(h*h);
 let cls=bmi<18.5?'Abaixo do peso':bmi<25?'Faixa considerada adequada':bmi<30?'Sobrepeso':bmi<35?'Obesidade grau I':bmi<40?'Obesidade grau II':'Obesidade grau III';
 return{bmi,cls,min:18.5*h*h,max:24.99*h*h}
} 
function estimarAgua(p){const peso=parseFloat(String(p.peso||'').replace(',','.'));if(!peso)return null;let ml=peso*35;if(p.academia==='Sim')ml+=300;if(p.calorSuor==='Moderada')ml+=300;if(p.calorSuor==='Alta')ml+=600;if(p.trabalhoTipo==='Em pé'||p.trabalhoTipo==='Ativo / em movimento')ml+=200;return Math.round(ml/50)*50}
function atualizarMetricasCorporais(){const p=get(K.p)[0]||{},x=calcularIMC(p),agua=estimarAgua(p);if($('dashBMI'))$('dashBMI').textContent=x?x.bmi.toFixed(1):'—';if($('dashBMIClass'))$('dashBMIClass').textContent=x?(x.cls+' • faixa de peso de referência: '+x.min.toFixed(1)+'–'+x.max.toFixed(1)+' kg'):'Informe peso e altura';if($('dashWater'))$('dashWater').textContent=agua?(agua/1000).toFixed(2).replace('.',',')+' L/dia':'—';if($('dashActivity'))$('dashActivity').textContent=p.academia==='Sim'?(p.academiaFreq||'—')+'x/semana':p.academia==='Não'?'Não pratica':'Não informado';if($('dashActivityDetail'))$('dashActivityDetail').textContent=(p.trabalhoTipo||'Rotina não informada')+(p.horasSentado?' • '+p.horasSentado+'h sentado':'')+(p.horasPe?' • '+p.horasPe+'h em pé':'');if($('dashActivityEdit'))$('dashActivityEdit').textContent=(p.academia||p.academiaFreq||p.trabalhoTipo||p.horasSentado||p.horasPe)?'✏️ Editar':'➕ Informar';if($('dashUrine'))$('dashUrine').textContent=p.urinaDia?p.urinaDia+'x/dia':'Não informado';if($('dashUrineEdit'))$('dashUrineEdit').textContent=p.urinaDia?'✏️ Editar':'➕ Informar';if($('bodyMetrics'))$('bodyMetrics').innerHTML=x?'<div class="metric-kpi"><span>⚖️ IMC</span><b>'+x.bmi.toFixed(1)+'</b><small>'+esc(x.cls)+'</small></div><div class="metric-kpi"><span>📏 Faixa de referência</span><b>'+x.min.toFixed(1)+'–'+x.max.toFixed(1)+' kg</b><small>pela classificação de IMC adulto</small></div><div class="metric-kpi"><span>💧 Estimativa de água</span><b>'+((agua||0)/1000).toFixed(2).replace('.',',')+' L</b><small>ajuste pela atividade/clima</small></div>':''}
function abrirEdicaoRotina(campo){
 const alvo=campo==='urina'?'pUrinaDia':'pAcademia';
 go('perfil');
 setTimeout(()=>{
  const card=document.querySelector('.lifestyle-card'),input=$(alvo);
  if(card)card.scrollIntoView({behavior:'smooth',block:'start'});
  if(input){setTimeout(()=>{input.focus();input.scrollIntoView({behavior:'smooth',block:'center'});},180);}
 },80);
}
function atualizarPerfilHome(){const p=get(K.p)[0]||{},foto=p.foto||'';if($('homeProfileName'))$('homeProfileName').textContent=p.nome||'Seu nome';if($('homeProfileAge'))$('homeProfileAge').textContent=p.idade||'—';if($('homeProfileWeight'))$('homeProfileWeight').textContent=p.peso||'—';if($('homeProfileHeight'))$('homeProfileHeight').textContent=p.altura?formatarAltura(p.altura):'—';if($('homeProfileBlood'))$('homeProfileBlood').textContent=p.sangue||'—';if($('homeAvatar'))$('homeAvatar').innerHTML=foto?'<img src="'+esc(foto)+'" alt="Foto do perfil">':'<span>👤</span>'}
const RECURSOS_PERSONALIZAVEIS=[
 {key:'academia',icon:'🏋️',label:'Academia e medidas corporais',desc:'Atividades de academia e medidas de bíceps, cintura, quadril, panturrilha etc.',targets:['fitness']},
 {key:'nutricao',icon:'🥗',label:'Nutrição',desc:'Diário de alimentação, hidratação e suplementos.',targets:['nutricao']},
 {key:'sonoBem',icon:'😴',label:'Sono e bem-estar',desc:'Registros de sono, humor, ansiedade, estresse e bem-estar.',targets:['sonoBem']},
 {key:'ciclo',icon:'🌸',label:'Ciclo menstrual',desc:'Recursos de ciclo menstrual e acompanhamento reprodutivo.',targets:['ciclo']}
];
function experienciaPadrao(){
 const saved=get(K.preferencias)[0];
 return saved&&typeof saved==='object'&&['simple','comfortable','advanced'].includes(saved.experiencia)?saved.experiencia:'comfortable';
}
function preferenciasPadrao(){
 const p=get(K.p)[0]||{},saved=get(K.preferencias)[0];
 if(saved&&typeof saved==='object')return Object.assign({academia:'on',nutricao:'on',sonoBem:'on',ciclo:'on',experiencia:'comfortable'},saved);
 return {academia:p.academia==='Não'?'off':'on',nutricao:'on',sonoBem:'on',ciclo:'on',experiencia:'comfortable'};
}
function salvarPreferenciasObjeto(pref){
 set(K.preferencias,[Object.assign({},preferenciasPadrao(),pref)]);
 aplicarPreferencias();
 aplicarExperiencia();
 renderConfiguracoes();
}
function salvarPreferenciasPerfil(){
 const pref={academia:$('prefAcademia')?.value||'on',nutricao:$('prefNutricao')?.value||'on',sonoBem:$('prefSonoBem')?.value||'on',ciclo:$('prefCiclo')?.value||'on'};
 salvarPreferenciasObjeto(pref);
 alert('⚙️ Preferências salvas! O aplicativo foi personalizado.');
}
function salvarExperiencia(){
 const value=$('prefExperiencia')?.value||'comfortable';
 salvarPreferenciasObjeto({experiencia:value});
 const nomes={simple:'🔰 Simples',comfortable:'🙂 Confortável',advanced:'⚡ Avançado'};
 alert('🎚️ Experiência definida como '+nomes[value]+'. Você pode mudar isso quando quiser em Configurações.');
}
function renderConfiguracoes(){
 const pref=preferenciasPadrao(),box=$('settingsPreferences');
 if(box){
  const exp='<div class="experience-setting"><div class="experience-setting-title">🎚️ Experiência do aplicativo</div><div class="muted">Escolha quanto de informação, atalhos e opções você prefere ver. Isso não depende da sua idade.</div><select id="prefExperiencia" style="margin-top:8px"><option value="simple">🔰 Simples — poucos caminhos, botões maiores e mais orientação</option><option value="comfortable">🙂 Confortável — equilíbrio entre simplicidade e recursos</option><option value="advanced">⚡ Avançado — mais atalhos, detalhes e acesso rápido</option></select><button class="btn secondary" type="button" style="margin-top:8px" onclick="salvarExperiencia()">💾 Aplicar experiência</button></div>';
  box.innerHTML=exp+RECURSOS_PERSONALIZAVEIS.map(r=>'<label style="display:flex;flex-direction:column;gap:6px;border:1px solid #dbe4f0;border-radius:14px;padding:12px;background:#fff"><span style="font-weight:900">'+r.icon+' '+r.label+'</span><small class="muted">'+r.desc+'</small><select data-pref-key="'+r.key+'"><option value="on" '+(pref[r.key]==='on'?'selected':'')+'>Ativado</option><option value="off" '+(pref[r.key]==='off'?'selected':'')+'>Desativado</select></label>').join('');
  box.querySelector('#prefExperiencia').value=pref.experiencia||'comfortable';
  box.querySelectorAll('[data-pref-key]').forEach(s=>s.addEventListener('change',function(){salvarPreferenciasObjeto({[this.dataset.prefKey]:this.value})}));
 }
}
function aplicarPreferencias(){
 const pref=preferenciasPadrao();
 document.querySelectorAll('[data-feature]').forEach(el=>el.classList.toggle('msa-feature-off',pref[el.dataset.feature]==='off'));
 document.querySelectorAll('[data-feature-nav="academia"]').forEach(el=>el.classList.toggle('msa-feature-off',pref.academia==='off'));
 document.querySelectorAll('[data-feature-nav="nutricao"]').forEach(el=>el.classList.toggle('msa-feature-off',pref.nutricao==='off'));
 document.querySelectorAll('[data-feature-nav="sonoBem"]').forEach(el=>el.classList.toggle('msa-feature-off',pref.sonoBem==='off'));
 document.querySelectorAll('[data-feature-nav="ciclo"]').forEach(el=>el.classList.toggle('msa-feature-off',pref.ciclo==='off'));
 $('reproSection')?.classList.toggle('msa-feature-off',pref.ciclo==='off');
 document.querySelectorAll('#dashActivityEdit,#dashActivity').forEach(el=>el.closest('.metric-kpi')?.classList.toggle('msa-feature-off',pref.academia==='off'));
 $('medidasCorporaisCard')?.classList.toggle('msa-feature-off',pref.academia==='off');
}
function aplicarExperiencia(){
 const level=experienciaPadrao();
 document.body.classList.remove('msa-exp-simple','msa-exp-comfortable','msa-exp-advanced');
 document.body.classList.add('msa-exp-'+level);
 document.documentElement.dataset.msaExperience=level;
 document.querySelectorAll('[data-experience="advanced"]').forEach(el=>el.classList.toggle('msa-experience-off',level!=='advanced'));
 document.querySelectorAll('[data-experience="simple-hidden"]').forEach(el=>el.classList.toggle('msa-experience-off',level==='simple'));
}
function render(){
let d=get(K.d),c=get(K.c),m=get(K.m),e=get(K.e);
$('nD').textContent=d.length;$('nC').textContent=c.length;$('nM').textContent=m.length;$('nE').textContent=e.length;
list('listD',d,x=>`<div class="item"><div class="itemtop"><b>😣 ${esc(x.local)}</b><span class="tag">${x.int}/10</span></div><p>${fmt(x.data)} · ${esc(x.tipo)} · ${esc(x.freq)}<br>${esc(x.sint||'Sem sintomas associados')}<br>${esc(x.gatilho||'')} ${esc(x.obs||'')}</p></div>`);
list('listC',c,x=>`<div class="item"><div class="itemtop"><b>👨‍⚕️ ${esc(x.esp)}</b><span class="tag">${x.data}</span></div><p>${esc(x.med||'Médico não informado')} · ${esc(x.mot||'')}<br><b>Perguntas:</b> ${esc(x.perg||'—')}<br><b>Orientações:</b> ${esc(x.obs||'—')}<br>${x.ret?'Retorno: '+x.ret:''}</p></div>`);
list('listM',m,x=>`<div class="item"><div class="itemtop"><b>💊 ${esc(x.nome)}</b><span class="tag">${esc(x.dose||'')}</span></div><p>${esc(x.freq||'Frequência não informada')} · ${x.inicio||'—'} até ${x.fim||'—'}<br>Prescrito por: ${esc(x.pres||'—')}<br>${esc(x.obs||'')}</p></div>`);
list('listE',e,x=>`<div class="item"><div class="itemtop"><b>🧪 ${esc(x.nome)}</b><span class="tag">${x.data}</span></div><p><b>Resultado:</b> ${esc(x.res||'—')}<br>${esc(x.obs||'')}</p></div>`);
let all=[...d.map(x=>({date:x.data,type:'😣 Sintoma',text:x.local+' — '+x.int+'/10'})),...c.map(x=>({date:x.data,type:'👨‍⚕️ Consulta',text:x.esp})),...m.map(x=>({date:x.inicio,type:'💊 Medicamento',text:x.nome})),...e.map(x=>({date:x.data,type:'🧪 Exame',text:x.nome}))].filter(x=>x.date).sort((a,b)=>new Date(b.date)-new Date(a.date));
$('tl').innerHTML=all.length?all.map(x=>`<div class="tl"><b>${x.type}</b> <span class="tag">${x.date}</span><p>${esc(x.text)}</p></div>`).join(''):'<div class="empty">Nenhum evento registrado.</div>';
let last=all[0];$('ultimo').innerHTML=last?`<b>${last.type}</b><br>${esc(last.text)}<br><span class="muted">${last.date}</span>`:'Ainda não há registros.';
let alert=findAlerts(d);$('alertaHome').className=alert?'danger':'safe';$('alertaHome').innerHTML=alert?alert:'Nenhum sinal de alerta automático encontrado nos registros.';
let vals=d.slice(-10);$('chart').innerHTML=vals.length?vals.map(x=>`<div class="bar" style="height:${Math.max(8,x.int*10)}%"><span>${x.int}</span><small>${String(x.local).slice(0,7)}</small></div>`).join(''):'<div class="muted" style="margin:auto">Registre sintomas para ver a evolução.</div>';
if($('homeSummary')){
 const p=get(K.p)[0]||{}, all=[...d,...c,...m,...e].map(x=>x.data||x.inicio||x.fim).filter(Boolean).sort().reverse();
 const nome=p.nome||'Seu perfil ainda não foi preenchido';
 const ultima=all[0]||'Nenhum registro ainda';
 $('homeSummary').innerHTML='<b>'+esc(nome)+'</b><br>'+d.length+' sintomas · '+c.length+' consultas · '+m.length+' medicamentos · '+e.length+' exames<br><span class="muted">Último registro: '+esc(ultima)+'</span>';
}
loadProfile();
renderConfiguracoes();
aplicarPreferencias();
aplicarExperiencia();
atualizarPerfilHome();
renderCarteirinha();
atualizarDashboard();
atualizarMetricasCorporais();
atualizarEngajamento();atualizarSmartHome();renderMedidasCorporais();
}

function registrarHumor(valor){
 const key='msa2_humor'; const hoje=new Date().toISOString().slice(0,10);
 window.msaStorage.setItem(key,JSON.stringify({data:hoje,valor:valor}));
 const st=$('moodStatus');if(st)st.textContent='Registrado hoje: '+valor;
 const done=$('moodDone');if(done){done.textContent='✓ Feito';done.style.background='#ecfdf3';done.style.color='#059669'}
}
function calcularCompletudeSaude(){
 const p=get(K.p)[0]||{};
 const itens=[
  ['Perfil','Nome',p.nome],['Perfil','Data de nascimento',p.nasc],['Perfil','Sexo',p.sexo],['Perfil','Altura',p.altura],['Perfil','Peso',p.peso],
  ['Perfil','Tipo sanguíneo',p.sangue],['Perfil','Alergias',p.alerg],['Perfil','Condições de saúde',p.cond],['Perfil','Cirurgias/internações',p.circ],
  ['Perfil','Contato de emergência',p.emerg],['Rotina','Atividade física',p.academia||p.atividade],['Rotina','Tipo de trabalho',p.trabalhoTipo],
  ['Rotina','Consumo de água',p.aguaDia],['Rotina','Alimentação',p.alimentacao],
  ['Histórico','Medicamentos',get(K.m).length],['Histórico','Sintomas',get(K.d).length],['Histórico','Consultas',get(K.c).length],
  ['Histórico','Exames',get(K.e).length],['Histórico','Sinais vitais',get(K.v).length],['Histórico','Vacinas',get(K.vax).length],
  ['Histórico','Histórico familiar',get(K.fam).length],['Organização','Lembretes',get(K.r).length],['Organização','Documentos',get(K.doc).length]
 ];
 const ok=v=>Array.isArray(v)?v.length>0:!!v&&String(v).trim()!==''&&!/^não informado$/i.test(String(v).trim());
 if(/femin|mulher|female/i.test(String(p.sexo||''))){
  itens.push(['Saúde reprodutiva','Duração média do ciclo',p.ciclo],['Saúde reprodutiva','Diário do ciclo',get(K.ciclo).length],['Saúde reprodutiva','Duração média do sangramento',p.duracaoMenstr],['Saúde reprodutiva','Regularidade do ciclo',p.regularidade],['Saúde reprodutiva','Método anticoncepcional',p.anticoncepcionalMetodo||p.usaAnticoncepcional]);
}
 const preenchidos=itens.filter(x=>ok(x[2])).length;
 return {percentual:Math.round(preenchidos/itens.length*100),total:itens.length,preenchidos,itens,pendentes:itens.filter(x=>!ok(x[2]))};
}
function gerarChecklistCompartilhamento(){
 const c=calcularCompletudeSaude();
 const linhas=['MINHA SAÚDE IA — CHECKLIST DE PREENCHIMENTO','Completude atual: '+c.percentual+'% ('+c.preenchidos+'/'+c.total+')','','INFORMAÇÕES QUE AINDA FALTAM:'];
 c.pendentes.forEach(x=>linhas.push('• ['+x[0]+'] '+x[1]));
 if(!c.pendentes.length)linhas.push('• Nenhuma informação pendente 🎉');
 linhas.push('','Observação: alguns campos podem não se aplicar à pessoa. Preencha apenas informações realmente conhecidas.');
 const txt=linhas.join('\n');
 if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(txt).then(()=>alert('📋 Checklist copiado! Agora você pode enviar para a pessoa preencher o que falta.')).catch(()=>prompt('Copie o checklist:',txt));}
 else prompt('Copie o checklist:',txt);
}
function atualizarEngajamento(){
 const hoje=new Date().toISOString().slice(0,10);
 const h=JSON.parse(window.msaStorage.getItem('msa2_humor')||'null');
 if(h&&h.data===hoje){const st=$('moodStatus');if(st)st.textContent='Registrado hoje: '+h.valor;const d=$('moodDone');if(d){d.textContent='✓ Feito';d.style.background='#ecfdf3';d.style.color='#059669'}}
 const c=calcularCompletudeSaude(),pct=c.percentual;
 const pe=$('profilePercent'),pf=$('profileProgress');if(pe)pe.textContent=pct+'%';if(pf)pf.style.width=pct+'%';
 const pm=$('profileMissing');
 if(pm)pm.innerHTML=c.pendentes.length
   ? '<b>📌 Ainda faltam '+c.pendentes.length+' informações:</b> '+c.pendentes.slice(0,4).map(x=>esc(x[1])).join(' · ')+(c.pendentes.length>4?' · …':'')
   : '<b>🎉 Cadastro completo!</b> Não há informações pendentes nos campos avaliados.';
 const level=$('healthLevel');if(level)level.textContent=pct>=90?'🏆 Muito completo':pct>=70?'🌳 Bem organizado':pct>=40?'🌿 Em construção':'🌱 Começando';
 const sd=$('streakDays');
 const all=[...get(K.d),...get(K.c),...get(K.m),...get(K.e),...get(K.v),...get(K.vax)].map(x=>x.data||x.inicio).filter(Boolean);
 const days=[...new Set(all.map(x=>String(x).slice(0,10)))].sort().reverse();let streak=0;
 for(let i=0;i<days.length;i++){const target=new Date();target.setDate(target.getDate()-i);if(days[i]===target.toISOString().slice(0,10))streak++;else break}
 if(sd)sd.textContent=streak;
 const goals=[['perfil',pct>=90,'Completar meu cadastro'],['consulta',get(K.c).length>0,'Registrar uma consulta'],['vital',get(K.v).length>0,'Registrar um sinal vital'],['med',get(K.m).length>0,'Organizar medicamentos']];
 const gl=$('goalList');if(gl)gl.innerHTML=goals.map(g=>'<label class="goal '+(g[1]?'done':'')+'"><input type="checkbox" '+(g[1]?'checked':'')+' disabled><span>'+(g[1]?'✅ ':'⬜ ')+g[2]+'</span></label>').join('');
 const d=get(K.d),m=get(K.m),co=get(K.c),e=get(K.e);
 const disc=[['😣',d.length,d.length===1?'sintoma registrado':'sintomas registrados'],['👨‍⚕️',co.length,co.length===1?'consulta registrada':'consultas registradas'],['💊',m.length,m.length===1?'medicamento registrado':'medicamentos registrados'],['🧪',e.length,e.length===1?'exame registrado':'exames registrados'],['📈',get(K.v).length,get(K.v).length===1?'sinal vital registrado':'sinais vitais registrados'],['🔥',streak,streak===1?'dia acompanhado':'dias acompanhados']];
 const dc=$('healthDiscoveries');if(dc)dc.innerHTML=disc.map(x=>'<div class="discovery"><b>'+x[0]+' '+x[1]+'</b><span>'+x[2]+'</span></div>').join('');
}

function atualizarDashboard(){
 const d=get(K.d),c=get(K.c),m=get(K.m),e=get(K.e),v=get(K.v),vax=get(K.vax),p=get(K.p)[0]||{};
 const condTxt=String(p.cond||'').trim();
 const conds=condTxt&& !/^não informado$/i.test(condTxt) ? condTxt.split(/[;,|]+/).map(x=>x.trim()).filter(Boolean) : [];
 const uniq=[...new Set(conds.map(x=>x.toLowerCase()))];
 const set=(id,val)=>{const el=$(id);if(el)el.textContent=val};
 set('dashCond',uniq.length);
 set('dashCondTxt',uniq.length?uniq.slice(0,2).join(' · ')+(uniq.length>2?'…':''):'Nenhuma informada');
 set('dashConsultas',c.length);set('dashMeds',m.length);set('dashExames',e.length);set('dashVacinas',vax.length);
 set('dashConsultasTxt',c.length?(c.length===1?'1 consulta registrada':'histórico de consultas'):'Nenhuma consulta');
 set('dashMedsTxt',m.length?(m.length===1?'1 medicamento':'medicamentos registrados'):'Nenhum registrado');
 set('dashExamesTxt',e.length?(e.length===1?'1 exame':'exames registrados'):'Nenhum registrado');
 const consultas=c.filter(x=>x.data).sort((a,b)=>new Date(b.data)-new Date(a.data));
 const ultima=consultas[0];
 if(ultima){
   set('dashUltConsulta',fmt(ultima.data));
   const days=Math.max(0,Math.floor((Date.now()-new Date(ultima.data).getTime())/86400000));
   set('dashTempoConsulta',days===0?'Hoje':days===1?'Ontem':days+' dias atrás');
 }else{set('dashUltConsulta','—');set('dashTempoConsulta','Ainda não')}
 set('dashTotal',d.length+c.length+m.length+e.length+v.length+vax.length);
 const eventos=[
   {label:'Sint.',n:d.length},{label:'Cons.',n:c.length},{label:'Med.',n:m.length},{label:'Exames',n:e.length},{label:'Vitais',n:v.length},{label:'Vac.',n:vax.length}
 ];
 const max=Math.max(1,...eventos.map(x=>x.n));
 const chart=$('dashChart');
 if(chart)chart.innerHTML=eventos.map(x=>'<div class="dash-bar-wrap"><div class="dash-bar" title="'+x.n+' registros" style="height:'+Math.max(7,Math.round(x.n/max*88))+'px"></div><span class="dash-bar-label">'+x.label+'</span></div>').join('');
 const peso=v.filter(x=>x.peso!==undefined&&String(x.peso).trim()).slice(-8);
 const wc=$('dashWeight');
 if(wc){
   if(!peso.length)wc.innerHTML='<div class="muted" style="margin:auto">Registre sinais vitais para acompanhar o peso.</div>';
   else{
     const nums=peso.map(x=>parseFloat(String(x.peso).replace(',','.'))).filter(n=>!isNaN(n));
     const min=Math.min(...nums),maxW=Math.max(...nums),range=Math.max(1,maxW-min);
     wc.innerHTML=peso.map(x=>{
       const n=parseFloat(String(x.peso).replace(',','.'));if(isNaN(n))return '';
       const h=Math.max(12,Math.round(((n-min)/range)*78+20));
       const lab=String(x.data||'').slice(0,5);
       return '<div class="dash-bar-wrap"><div class="dash-bar" title="'+n+' kg" style="height:'+h+'px"></div><span class="dash-bar-label">'+n+'kg</span><span class="dash-bar-label">'+lab+'</span></div>';
     }).join('');
   }
 }
}
function healthText(){
 const p=get(K.p)[0]||{},d=get(K.d),c=get(K.c),m=get(K.m),e=get(K.e),v=get(K.v),r=get(K.r),vax=get(K.vax),fam=get(K.fam);
 const lines=['MINHA SAÚDE IA — RESUMO DE DADOS','Gerado em: '+new Date().toLocaleString('pt-BR'),'','[PERFIL]','Nome: '+(p.nome||'Não informado'),'Nascimento: '+(p.nasc||'Não informado'),'Idade: '+(p.idade||'Não informado'),'Sexo: '+(p.sexo||'Não informado'),'Tipo sanguíneo: '+(p.sangue||'Não informado'),'Altura: '+(p.altura||'Não informado'),'Peso: '+(p.peso||'Não informado'),'Objetivo corporal: '+(p.objetivoCorporal||'Não informado'),'Academia: '+(p.academia||'Não informado'),'Frequência academia: '+(p.academiaFreq||'Não informado'),'Atividade física: '+(p.atividadeFisica||'Não informado'),'Trabalho: '+(p.trabalhoTipo||'Não informado'),'Horas sentado: '+(p.horasSentado||'Não informado'),'Horas em pé: '+(p.horasPe||'Não informado'),'Água por dia: '+(p.aguaDia||'Não informado'),'Frequência urinária (opcional): '+(p.urinaDia||'Não informado'),'Frequência de evacuação (opcional): '+(p.evacuacaoDia||'Não informado'),'Exposição a calor/suor: '+(p.calorSuor||'Não informado'),'Alimentação: '+(p.alimentacao||'Não informado'),'Alergias: '+(p.alerg||'Não informado'),'Condições: '+(p.cond||'Não informado'),'Cirurgias/internações: '+(p.circ||'Não informado'),'Informações importantes: '+(p.info||'Não informado'),'Uso de Dorcelax: '+(p.dorcelaxFreq||'Não informado'),'Uso de paracetamol: '+(p.paracetamolFreq||'Não informado'),'Outros remédios para dor/febre: '+(p.outrosDor||'Não informado'),'Já teve catapora: '+(p.catapora||'Não informado'),'Quando teve catapora: '+(p.cataporaQuando||'Não informado'),'','[SINTOMAS]'];
 lines.push(...(d.length?d.map(x=>x.data+' | '+x.local+' | intensidade '+x.int+'/10 | '+x.tipo+' | '+(x.sint||'')):['Nenhum registro.']));
 lines.push('','[CONSULTAS]');lines.push(...(c.length?c.map(x=>x.data+' | '+x.esp+' | '+(x.med||'')+' | Motivo: '+(x.mot||'')+' | Perguntas: '+(x.perg||'')+' | Orientações: '+(x.obs||'')+' | Retorno: '+(x.ret||'')):['Nenhum registro.']));
 lines.push('','[MEDICAMENTOS]');lines.push(...(m.length?m.map(x=>x.nome+' | Dose: '+(x.dose||'')+' | Frequência: '+(x.freq||'')+' | Início: '+(x.inicio||'')+' | Fim: '+(x.fim||'')+' | Prescrito por: '+(x.pres||'')):['Nenhum registro.']));
 lines.push('','[EXAMES]');lines.push(...(e.length?e.map(x=>x.data+' | '+x.nome+' | Resultado: '+(x.res||'')+' | Observações: '+(x.obs||'')):['Nenhum registro.']));
 lines.push('','[SINAIS VITAIS]');lines.push(...(v.length?v.map(x=>x.data+' | Peso: '+(x.peso||'')+' | Pressão: '+(x.pressao||'')+' | FC: '+(x.fc||'')+' | Temp: '+(x.temp||'')+' | Glicemia: '+(x.glic||'')+' | Saturação: '+(x.sat||'')+' | '+(x.obs||'')):['Nenhum registro.']));
 lines.push('','[VACINAS]');lines.push(...(vax.length?vax.map(x=>x.nome+' | '+(x.data||'')+' | '+(x.obs||'')):['Nenhum registro.']));
 lines.push('','[HISTÓRICO FAMILIAR]');lines.push(...(fam.length?fam.map(x=>x.parente+': '+x.info):['Nenhum registro.']));
 lines.push('','[LEMBRETES]');lines.push(...(r.length?r.map(x=>x.data+' | '+x.tipo+' | '+x.nome):['Nenhum registro.']));
 lines.push('','Este arquivo organiza informações registradas pelo usuário e não constitui diagnóstico, prescrição ou laudo.');
 return lines.join('\n');
}
function exportarTexto(){const text=healthText();const blob=new Blob([text],{type:'text/plain;charset=utf-8'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='minha-saude-'+new Date().toISOString().slice(0,10)+'.txt';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500)}
function copiarParaIA(){const text=healthText()+'\n\nTAREFA PARA A IA:\nUse somente os fatos acima. Não invente, não altere os dados e não faça diagnóstico. Ajude a organizar ou preparar perguntas para um profissional de saúde.';if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(text).then(()=>alert('✅ Dados copiados. Agora você pode colar no ChatGPT, Gemini ou outra IA.')).catch(()=>copiarTextoFallback(text));else copiarTextoFallback(text)}
function copiarTextoFallback(text){const t=document.createElement('textarea');t.value=text;document.body.appendChild(t);t.select();document.execCommand('copy');t.remove();alert('✅ Dados copiados.')}
function exportarPDF(){openReport('Minha Saúde IA — Exportação', '<pre style="white-space:pre-wrap;font-family:Arial,sans-serif;line-height:1.5">'+esc(healthText())+'</pre>')}
function abrirCartaoEmergencia(){const p=get(K.p)[0]||{},m=get(K.m);const body='<div class="box"><h2>🚨 Informações de emergência</h2><b>Nome:</b> '+esc(p.nome||'Não informado')+'<br><b>Nascimento:</b> '+esc(p.nasc||'Não informado')+'<br><b>Alergias:</b> '+esc(p.alerg||'Não informado')+'<br><b>Condições:</b> '+esc(p.cond||'Não informado')+'<br><b>Medicamentos registrados:</b> '+esc(m.map(x=>x.nome+(x.dose?' — '+x.dose:'')).join('; ')||'Não informado')+'<br><b>Contato:</b> '+esc(p.emerg||'Não informado')+' — '+esc(p.tel||'')+'<br><b>Informações:</b> '+esc(p.info||'Não informado')+'</div>';openReport('Cartão de emergência',body)}
function copiarCartaoEmergencia(){const p=get(K.p)[0]||{},m=get(K.m);const text='CARTÃO DE EMERGÊNCIA\nNome: '+(p.nome||'Não informado')+'\nNascimento: '+(p.nasc||'Não informado')+'\nAlergias: '+(p.alerg||'Não informado')+'\nCondições: '+(p.cond||'Não informado')+'\nMedicamentos: '+(m.map(x=>x.nome+(x.dose?' — '+x.dose:'')).join('; ')||'Não informado')+'\nContato: '+(p.emerg||'Não informado')+' — '+(p.tel||'');if(navigator.clipboard)navigator.clipboard.writeText(text).then(()=>alert('✅ Cartão copiado.'));else copiarTextoFallback(text)}

function renderMedidasCorporais(){
 const a=get(K.medidas).slice().sort((x,y)=>String(y.data).localeCompare(String(x.data)));
 const box=$('medidasList');if(!box)return;
 box.innerHTML=a.length?a.map(x=>{
  const vals=[
   x.biceps?'💪 Bíceps: '+esc(x.biceps)+' cm':'',
   x.barriga?'🟠 Barriga/cintura: '+esc(x.barriga)+' cm':'',
   x.gluteos?'🍑 Glúteos/quadril: '+esc(x.gluteos)+' cm':'',
   x.panturrilha?'🦵 Panturrilha: '+esc(x.panturrilha)+' cm':'',
   x.coxa?'🦵 Coxa: '+esc(x.coxa)+' cm':'',
   x.peito?'🫁 Peito/tórax: '+esc(x.peito)+' cm':''
  ].filter(Boolean).join(' · ');
  return '<div class="item"><div class="itemtop"><b>📏 '+esc(formatDateBR(x.data))+'</b><button class="btn red small" type="button" onclick="removerMedidaCorporal(\''+esc(String(x.id))+'\')">Excluir</button></div><p>'+vals+(x.obs?'<br>📝 '+esc(x.obs):'')+'</p></div>';
 }).join(''):'<div class="empty">Nenhuma medida corporal registrada ainda.</div>';
}
function removerMedidaCorporal(id){
 if(!confirm('Excluir esta medição corporal?'))return;
 set(K.medidas,get(K.medidas).filter(x=>String(x.id)!==String(id)));
 render();
}
function renderAcompanhamento(){
 const v=get(K.v),r=get(K.r),vax=get(K.vax),fam=get(K.fam),docs=get(K.doc),p=get(K.p)[0]||{};
 if($('vList'))list('vList',v,x=>'<div class="item"><b>❤️ '+fmt(x.data)+'</b><p>Peso: '+esc(x.peso||'—')+' · Pressão: '+esc(x.pressao||'—')+' · FC: '+esc(x.fc||'—')+' · Temp: '+esc(x.temp||'—')+' · Glicemia: '+esc(x.glic||'—')+' · Sat.: '+esc(x.sat||'—')+'<br>'+esc(x.obs||'')+'</p></div>');
 if($('rList'))list('rList',r,x=>'<div class="item"><div class="itemtop"><b>🔔 '+esc(x.nome)+'</b><span class="tag">'+esc(x.tipo)+'</span></div><p>'+fmt(x.data)+'</p><button class="btn red small" onclick="removerLembrete(\''+x.id+'\')">Excluir</button></div>');
 if($('vaxList'))list('vaxList',vax,x=>'<div class="item"><b>💉 '+esc(x.nome)+'</b><p>'+(x.data||'Data não informada')+' · '+esc(x.obs||'')+'</p></div>');
 if($('famList'))list('famList',fam,x=>'<div class="item"><b>🧬 '+esc(x.parente)+'</b><p>'+esc(x.info)+'</p></div>');
 if($('docList'))list('docList',docs,x=>'<div class="item"><b>📎 '+esc(x.nome)+'</b><p>'+esc(x.tipo)+' · '+esc(x.tamanho||'')+' · '+esc(x.data||'')+'</p></div>');
 const consultas=get(K.c).filter(x=>x.ret&&x.ret>=new Date().toISOString().slice(0,10)).sort((a,b)=>a.ret.localeCompare(b.ret));
 if($('agendaList'))$('agendaList').innerHTML=consultas.length?consultas.map(x=>'<div class="item"><div class="itemtop"><b>👨‍⚕️ '+esc(x.esp)+'</b><span class="tag">'+esc(x.ret)+'</span></div><p>'+esc(x.med||'Médico não informado')+' · '+esc(x.mot||'')+'</p></div>').join(''):'<div class="empty">Nenhuma consulta futura com data de retorno registrada.</div>';
 if($('vChart')){
   const dados=v.filter(x=>x.peso!==''&&x.peso!=null).slice(-10);
   $('vChart').innerHTML=dados.length?dados.map(x=>'<div class="bar" style="height:'+Math.max(8,Math.min(100,Number(x.peso)))+'%"><span>'+esc(x.peso)+'</span><small>'+String(x.data).slice(0,10)+'</small></div>').join(''):'<div class="muted" style="margin:auto">Registre peso para visualizar a evolução.</div>';
 }
 if($('emergencyCard'))$('emergencyCard').innerHTML='<b>'+esc(p.nome||'Nome não informado')+'</b><br>⚠️ Alergias: '+esc(p.alerg||'Não informado')+'<br>🩺 Condições: '+esc(p.cond||'Não informado')+'<br>💊 Medicamentos: '+esc(vitalMeds())+'<br>📞 Emergência: '+esc(p.emerg||'Não informado')+' '+esc(p.tel||'');
}
function vitalMeds(){return get(K.m).map(x=>x.nome+(x.dose?' — '+x.dose:'')).join('; ')||'Não informado'}
function removerLembrete(id){set(K.r,get(K.r).filter(x=>x.id!==id));render()}
function salvarDocumento(){const f=$('docFile')?.files?.[0];if(!f)return alert('Escolha um arquivo.');if(f.size>2*1024*1024)return alert('Para manter o armazenamento local estável, use arquivos de até 2 MB.');const reader=new FileReader();reader.onload=()=>{let a=get(K.doc);a.push({id:String(Date.now()),nome:$('docNome').value||f.name,tipo:f.type||'arquivo',tamanho:Math.round(f.size/1024)+' KB',data:new Date().toLocaleDateString('pt-BR'),conteudo:reader.result});set(K.doc,a);$('docFile').value='';$('docNome').value='';render();alert('📎 Documento salvo neste navegador.')};reader.readAsDataURL(f)}
function verificarLembretes(){const now=Date.now();const a=get(K.r);a.forEach(x=>{if(x.alertado)return;const t=new Date(x.data).getTime();if(t&&t<=now+30000&&t>=now-60000){x.alertado=true;set(K.r,a);if('Notification' in window&&Notification.permission==='granted')new Notification('🩺 Minha Saúde IA',{body:x.nome});else alert('🔔 Lembrete: '+x.nome)}})}
async function pedirNotificacao(){if('Notification' in window){try{await Notification.requestPermission();alert(Notification.permission==='granted'?'🔔 Notificações ativadas.':'Notificações não ativadas.')}catch(e){}}}
function compartilharResumo(){const text=healthText();if(navigator.share){navigator.share({title:'Minha Saúde IA — Resumo',text:text}).catch(()=>{})}else copiarParaIA()}
function resumoInteligente(){const p=get(K.p)[0]||{},d=get(K.d),c=get(K.c),m=get(K.m),e=get(K.e),v=get(K.v);const txt='RESUMO INTELIGENTE\nNome: '+(p.nome||'Não informado')+'\nRegistros: '+d.length+' sintomas, '+c.length+' consultas, '+m.length+' medicamentos, '+e.length+' exames, '+v.length+' sinais vitais.\nCondições: '+(p.cond||'Não informado')+'\nAlergias: '+(p.alerg||'Não informado')+'\nÚltimos sintomas: '+d.slice(-5).map(x=>x.data+' — '+x.local+' — '+x.int+'/10').join(' | ')+'\nÚltimos exames: '+e.slice(-5).map(x=>x.data+' — '+x.nome).join(' | ')+'\n\nEste resumo é baseado apenas nos registros locais e não é diagnóstico.';const box=$('resumoIA');if(box)box.textContent=txt}

function prepararContextoIA(){
 const p=get(K.p)[0]||{},d=get(K.d),c=get(K.c),m=get(K.m),e=get(K.e);
 const recent=[...d.map(x=>({data:x.data,tipo:'Sintoma',texto:x.local+' — intensidade '+x.int+'/10 — '+(x.sint||'')})),...c.map(x=>({data:x.data,tipo:'Consulta',texto:x.esp+' — '+(x.mot||'')})),...m.map(x=>({data:x.inicio||x.fim,tipo:'Medicamento',texto:x.nome+' — '+(x.dose||'') })),...e.map(x=>({data:x.data,tipo:'Exame',texto:x.nome+' — '+(x.res||'')}))].filter(x=>x.data).sort((a,b)=>String(b.data).localeCompare(String(a.data))).slice(0,15);
 const ficha=[
 'Contexto de saúde pessoal para análise e organização — Minha Saúde IA.',
 'IMPORTANTE: use somente as informações abaixo. Não invente, não complete lacunas e não faça diagnóstico. Se algo exigir avaliação, sinalize como assunto para discutir com profissional de saúde.',
 '',
 '[PERFIL]',
 'Nome: '+(p.nome||'Não informado'),
 'Data de nascimento: '+(p.nasc||'Não informado'),
 'Idade: '+(p.idade||'Não informado'),
 'Peso: '+(p.peso||'Não informado'),
 'Altura: '+(p.altura||'Não informado'),
 'Sexo: '+(p.sexo||'Não informado'),
 'Alergias: '+(p.alerg||'Não informado'),
 'Condições: '+(p.cond||'Não informado'),
 'Cirurgias/internações: '+(p.circ||'Não informado'),
 'Informações importantes: '+(p.info||'Não informado'),
 '',
 '[REGISTROS RECENTES]',
 ...(recent.length?recent.map(x=>x.data+' — '+x.tipo+': '+x.texto):['Nenhum registro recente.']),
 '',
 '[MEDICAMENTOS REGISTRADOS]',
 ...(m.length?m.slice(-15).map(x=>x.nome+' — '+(x.dose||'dose não informada')+' — '+(x.freq||'frequência não informada')):['Nenhum registrado.']),
 '',
 'TAREFA: organize ou responda à pergunta do usuário usando somente este contexto. Não altere os fatos.'
 ].join('\n');
 try{navigator.clipboard.writeText(ficha);alert('✅ Contexto preparado e copiado. Revise antes de colar na IA.');go('ia');}catch(e){go('ia');const t=$('iaInput');if(t){t.value=ficha;t.focus();}alert('O contexto foi preparado. Se a cópia automática não funcionar, ele ficou no campo da IA.');}
}
function findAlerts(d){for(let x of d){let s=(x.sint||'').toLowerCase();if(x.int>=9)return '🔴 Há registro de dor muito intensa (9–10/10). Se for atual, súbita, piorando ou acompanhada de outros sinais importantes, procure avaliação médica.';if(/falta de ar|desmaio|convuls|confusão|fraqueza de um lado|sangramento importante/.test(s))return '🔴 Foi registrado um possível sinal de alerta. Se estiver acontecendo agora, procure atendimento médico rapidamente.'}return ''}
$('medidasForm')?.addEventListener('submit',e=>{
 e.preventDefault();
 const item={id:Date.now(),data:$('medidasData').value,biceps:$('medidasBiceps').value,barriga:$('medidasBarriga').value,gluteos:$('medidasGluteos').value,panturrilha:$('medidasPanturrilha').value,coxa:$('medidasCoxa').value,peito:$('medidasPeito').value,obs:$('medidasObs').value};
 if(!item.biceps&&!item.barriga&&!item.gluteos&&!item.panturrilha&&!item.coxa&&!item.peito){alert('Informe pelo menos uma medida corporal.');return}
 const a=get(K.medidas);a.push(item);set(K.medidas,a);e.target.reset();$('medidasData').value=hojeLocal();render();alert('📏 Medidas corporais salvas!');
});
$('dData').value=new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,16);
$('dorForm')?.addEventListener('submit',()=>{});
$('pForm').onsubmit=e=>{
 e.preventDefault();
 if(!$('pSexo').value){alert('👤 Selecione Masculino, Feminino ou Outro para continuar.');$('pSexo').focus();return;}
 const old=get(K.p)[0]||{};
 const perfil=Object.assign({},old,{
  nome:$('pNome').value,nasc:$('pNasc').value,idade:$('pIdade').value,peso:$('pPeso').value,sexo:$('pSexo').value,
  sangue:$('pSangue').value,altura:$('pAltura').value,supl:$('pSupl').value,alerg:$('pAlerg').value,cond:$('pCond').value,
  circ:$('pCirc').value,info:$('pInfo').value,emerg:$('pEmerg').value,tel:$('pTel').value,
  menstruacao:$('pMenstruacao').value,ciclo:$('pCiclo').value,duracaoMenstr:$('pDuracaoMenstr').value,regularidade:$('pRegularidade').value,sexoFreq:$('pSexoFreq').value,
  camisinha:$('pCamisinha').value,engravidou:$('pEngravidou').value,mae:$('pMae').value,gestacoes:$('pGestacoes').value,
  reproObs:$('pReproObs').value,usaAnticoncepcional:$('pUsaAnticoncepcional').value,anticoncepcionalMetodo:$('pAnticoncepcionalMetodo').value,anticoncepcionalNome:$('pAnticoncepcionalNome').value,anticoncepcionalHora:$('pAnticoncepcionalHora').value,anticoncepcionalInicio:$('pAnticoncepcionalInicio').value,anticoncepcionalRegime:$('pAnticoncepcionalRegime').value,minipilulaTipo:$('pMinipilulaTipo').value,prevColo:$('pPrevColo').value,mamografia:$('pMamografia').value,ist:$('pIST').value,hpv:$('pHPV').value,
  prevProx:$('pPrevProx').value,prevObs:$('pPrevObs').value,dorcelaxFreq:$('pDorcelaxFreq').value,
  paracetamolFreq:$('pParacetamolFreq').value,outrosDor:$('pOutrosDor').value,catapora:$('pCatapora').value,cataporaQuando:$('pCataporaQuando').value,
  academia:$('pAcademia').value,academiaFreq:$('pAcademiaFreq').value,trabalhoTipo:$('pTrabalhoTipo').value,
  horasSentado:$('pHorasSentado').value,horasPe:$('pHorasPe').value,aguaDia:$('pAguaDia').value,urinaDia:$('pUrinaDia').value,
  evacuacaoDia:$('pEvacuacaoDia').value,calorSuor:$('pCalorSuor').value
 });
 set(K.p,[perfil]);render();renderNovosModulos();renderCarteirinha();alert('Perfil salvo!');
};
$('dorForm').onsubmit=e=>{e.preventDefault();let a=get(K.d);a.push({data:$('dData').value,local:$('dLocal').value,int:+$('dInt').value,tipo:$('dTipo').value,freq:$('dFreq').value,gatilho:$('dGatilho').value,sint:$('dSint').value,obs:$('dObs').value});set(K.d,a);e.target.reset();$('dInt').value=5;$('dScore').textContent=5;render();alert('Sintoma salvo!')};
$('cForm').onsubmit=e=>{e.preventDefault();let a=get(K.c);a.push({data:$('cData').value,esp:$('cEsp').value,med:$('cMed').value,mot:$('cMot').value,perg:$('cPerg').value,obs:$('cObs').value,ret:$('cRet').value});set(K.c,a);e.target.reset();render();alert('Consulta salva!')};
$('mForm').onsubmit=e=>{e.preventDefault();let a=get(K.m);a.push({nome:$('mNome').value,dose:$('mDose').value,freq:$('mFreq').value,inicio:$('mInicio').value,fim:$('mFim').value,pres:$('mPres').value,obs:$('mObs').value});set(K.m,a);e.target.reset();render();alert('Medicamento salvo!')};
$('eForm').onsubmit=e=>{e.preventDefault();let a=get(K.e);a.push({nome:$('eNome').value,data:$('eData').value,res:$('eRes').value,obs:$('eObs').value});set(K.e,a);e.target.reset();render();alert('Exame salvo!')};

function hojeLocal(){return new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,10)}
function diasEntre(a,b){
 const da=new Date(a+'T00:00:00'),db=new Date(b+'T00:00:00');
 return Math.round((db-da)/86400000);
}
function adicionarDiasData(data,dias){
 const d=new Date(data+'T00:00:00');d.setDate(d.getDate()+dias);
 return d.toISOString().slice(0,10);
}
function renderCicloMenstrual(){
 const a=get(K.ciclo).filter(x=>x.inicio).slice().sort((x,y)=>String(x.inicio).localeCompare(String(y.inicio)));
 const resumo=$('cicloResumo'),listEl=$('cicloList');
 if(!resumo||!listEl)return;
 if(!a.length){
   resumo.innerHTML='🩸 Registre o primeiro início da menstruação para começar seu histórico.';
   listEl.innerHTML='<div class="empty">Nenhum ciclo registrado ainda.</div>';
   return;
 }
 const intervalos=[];
 for(let i=1;i<a.length;i++){const n=diasEntre(a[i-1].inicio,a[i].inicio);if(n>0&&n<100)intervalos.push(n)}
 const media=intervalos.length?Math.round(intervalos.reduce((s,n)=>s+n,0)/intervalos.length):null;
 const ultimo=a[a.length-1].inicio;
 const proximo=media?adicionarDiasData(ultimo,media):null;
 resumo.innerHTML='<b>📊 Histórico:</b> '+a.length+' ciclo(s)'+(media?' · <b>média entre inícios:</b> '+media+' dias':' · registre mais ciclos para calcular uma média')+(proximo?' · <b>próximo início estimado:</b> '+formatDateBR(proximo): '');
 listEl.innerHTML=a.slice().reverse().map((x,i)=>{
   const idx=a.findIndex(y=>y.id===x.id), intervalo=idx>0?diasEntre(a[idx-1].inicio,x.inicio):null;
   return '<div class="item"><div class="itemtop"><b>🩸 Início: '+esc(formatDateBR(x.inicio))+'</b><span class="tag">'+(intervalo?intervalo+' dias de intervalo':'Primeiro registro')+'</span></div><p>'+(x.fim?'Fim: '+esc(formatDateBR(x.fim))+' · ':'')+'Fluxo: '+esc(x.fluxo||'Não informado')+' · Dor/cólica: '+esc(x.dor||'Não informado')+'/10'+(x.obs?' · 📝 '+esc(x.obs):'')+'</p></div>';
 }).join('');
}
function renderNovosModulos(){
 atualizarPainelAnticoncepcional();
 renderCicloMenstrual();
 const rev=(k,fn)=>{const a=get(k);return a.length?a.slice().reverse().map(fn).join(''):'<div class="empty">Nenhum registro ainda.</div>'};
 if($('nutriList'))$('nutriList').innerHTML=rev(K.nutri,x=>'<div class="item"><b>🍎 '+esc(x.data)+'</b><p>'+esc(x.texto)+(x.foto?' 📸 Foto anexada':'')+'</p></div>');
 if($('suplList'))$('suplList').innerHTML=rev(K.suplReg,x=>'<div class="item"><b>💊 '+esc(x.nome)+'</b><p>'+esc(x.dose||'')+(x.hora?' · '+x.hora:'')+' · estoque: '+(x.estoque??'—')+(x.obs?' · '+esc(x.obs):'')+'</p></div>');
 if($('foodList'))$('foodList').innerHTML=rev(K.food,x=>'<div class="item"><b>⚠️ '+esc(x.nome)+'</b><p>'+esc(x.reacao)+' · '+esc(x.data||'Sem data')+(x.obs?' · '+esc(x.obs):'')+'</p></div>');
 if($('aguaList'))$('aguaList').innerHTML=rev(K.agua,x=>'<div class="item"><b>💧 '+esc(x.data)+'</b><p>'+esc(x.qtd)+' ml'+(x.meta?' · meta '+esc(x.meta)+' ml':'')+'</p></div>');
 const ag=get(K.agua),today=hojeLocal(),sum=ag.filter(x=>x.data===today).reduce((n,x)=>n+(+x.qtd||0),0),meta=ag.find(x=>x.data===today)?.meta||'';
 if($('aguaResumo'))$('aguaResumo').textContent='Hoje: '+sum+' ml'+(meta?' de '+meta+' ml ('+Math.round(sum/+meta*100)+'%)':'');
 if($('sonoList'))$('sonoList').innerHTML=rev(K.sono,x=>{
 const detalhes=x.dormiu&&x.acordou
  ? '🌙 '+esc(x.dormiu)+' → ☀️ '+esc(x.acordou)+' · '+esc(x.horas||'—')+' h · 🚽 xixi: '+esc(x.xixi??0)+' · 😣 dor: '+esc(x.dor??0)
  : '⏱️ '+esc(x.horas||'—')+' h · qualidade '+esc(x.qual||'—')+'/10 · despertares '+esc(x.despert||'0');
 return '<div class="item"><b>😴 '+esc(x.data)+'</b><p>'+detalhes+(x.obs?' · 📝 '+esc(x.obs):'')+'</p></div>';
});
 if($('bemList'))$('bemList').innerHTML=rev(K.bem,x=>'<div class="item"><b>🧠 '+esc(x.data)+'</b><p>Estresse: '+esc(x.estresse||'—')+'/10 · ansiedade: '+esc(x.ansiedade||'—')+'/10'+(x.obs?' · '+esc(x.obs):'')+'</p></div>');
 if($('gatList'))$('gatList').innerHTML=rev(K.gat,x=>'<div class="item"><b>🎯 '+esc(x.gatilho)+'</b><p>'+esc(x.data)+' · sintoma: '+esc(x.sintoma||'—')+(x.obs?' · '+esc(x.obs):'')+'</p></div>');
 if($('famListPage'))$('famListPage').innerHTML=rev(K.fam,x=>'<div class="item"><b>🧬 '+esc(x.parente)+'</b><p>'+esc(x.info||x.cond||'')+(x.idade?' · diagnóstico aos '+esc(x.idade)+' anos':'')+(x.obs?' · '+esc(x.obs):'')+'</p></div>');
 if($('lembListPage'))$('lembListPage').innerHTML=rev(K.r,x=>'<div class="item"><b>🔔 '+esc(x.nome)+'</b><p>'+esc(x.data||'')+' · '+esc(x.tipo||'')+'</p></div>');
 if($('medRotList'))$('medRotList').innerHTML=rev(K.medRot,x=>{const dia=hojeLocal(),tomou=get(K.medTaken).some(t=>t.medId===x.id&&String(t.data).slice(0,10)===dia);return '<div class="item"><div class="itemtop"><b>💊 '+esc(x.nome)+'</b><span class="tag">'+(tomou?'✅ Hoje registrado':'⏳ Hoje pendente')+'</span></div><p>'+esc(x.dose||'')+' · '+esc(x.hora)+' · estoque '+(x.estoque??0)+(+x.estoque<=+x.min?' ⚠️ Reposição':'')+'</p><button class="btn '+(tomou?'secondary':'green')+'" onclick="confirmarDose('+x.id+')">'+(tomou?'↩️ Registrar novamente':'✅ Tomei')+'</button></div>'});
 if($('medAdherenceSummary')){
 const meds=get(K.medRot),taken=get(K.medTaken),today=hojeLocal();
 const active=meds.length,done=meds.filter(m=>taken.some(t=>t.medId===m.id&&String(t.data).slice(0,10)===today)).length;
 const last7=new Date();last7.setDate(last7.getDate()-6);
 const week=taken.filter(t=>new Date(t.data)>=last7).length;
 $('medAdherenceSummary').innerHTML='<div class="card stat"><span>💊 Rotinas</span><b>'+active+'</b></div><div class="card stat"><span>✅ Hoje</span><b>'+done+'/'+active+'</b></div><div class="card stat"><span>📅 Últimos 7 dias</span><b>'+week+'</b></div><div class="card stat"><span>📦 Estoque baixo</span><b>'+meds.filter(m=>+m.estoque<=+m.min).length+'</b></div>';
}
if($('lembAgenda')){const items=[...get(K.r).map(x=>({d:x.data,n:x.nome,t:x.tipo||'Lembrete'})),...get(K.medRot).map(x=>({d:hojeLocal()+'T'+x.hora,n:x.nome,t:'Medicamento'}))].filter(x=>x.d).sort((a,b)=>String(a.d).localeCompare(String(b.d))).slice(0,8);$('lembAgenda').innerHTML=items.length?items.map(x=>'<div class="item"><b>'+esc(x.n)+'</b><p>'+esc(x.d)+' · '+esc(x.t)+'</p></div>').join(''):'<div class="empty">Nenhum próximo cuidado.</div>'}
}
function arquivoDataURL(file,cb){if(!file){cb('');return}const r=new FileReader();r.onload=()=>cb(r.result);r.readAsDataURL(file)}
$('cicloForm')?.addEventListener('submit',e=>{
 e.preventDefault();
 const inicio=$('cicloInicio').value,fim=$('cicloFim').value;
 if(!inicio){alert('Informe o início da menstruação.');return}
 if(fim&&fim<inicio){alert('A data de fim não pode ser anterior ao início.');return}
 let a=get(K.ciclo);
 const idx=a.findIndex(x=>x.inicio===inicio);
 const registro={id:idx>=0?a[idx].id:Date.now(),inicio,fim,fluxo:$('cicloFluxo').value,dor:$('cicloDor').value,obs:$('cicloObs').value};
 if(idx>=0)a[idx]=registro;else a.push(registro);
 a.sort((x,y)=>String(x.inicio).localeCompare(String(y.inicio)));
 set(K.ciclo,a);e.target.reset();renderNovosModulos();alert('🩸 Ciclo menstrual registrado!'); 
});
$('nutriForm')?.addEventListener('submit',e=>{e.preventDefault();arquivoDataURL($('nutriFoto').files[0],foto=>{let a=get(K.nutri);a.push({data:$('nutriData').value,texto:$('nutriTexto').value,foto});set(K.nutri,a);e.target.reset();renderNovosModulos();alert('🍎 Alimentação registrada!')})});
$('suplForm')?.addEventListener('submit',e=>{e.preventDefault();let a=get(K.suplReg);a.push({nome:$('suplNome').value,dose:$('suplDose').value,hora:$('suplHora').value,estoque:$('suplEstoque').value,obs:$('suplObs').value});set(K.suplReg,a);e.target.reset();renderNovosModulos();alert('💊 Suplemento salvo!')});
$('foodForm')?.addEventListener('submit',e=>{e.preventDefault();let a=get(K.food);a.push({nome:$('foodNome').value,reacao:$('foodReacao').value,data:$('foodData').value,obs:$('foodObs').value});set(K.food,a);e.target.reset();renderNovosModulos();alert('⚠️ Reação registrada!')});
$('aguaForm')?.addEventListener('submit',e=>{e.preventDefault();let a=get(K.agua);a.push({data:$('aguaData').value,qtd:$('aguaQtd').value,meta:$('aguaMeta').value});set(K.agua,a);e.target.reset();renderNovosModulos();alert('💧 Hidratação registrada!')});
$('sonoForm')?.addEventListener('submit',e=>{
 e.preventDefault();
 const inicio=$('sonoDormiu').value,fim=$('sonoAcordou').value;
 if(!inicio||!fim){alert('Informe o horário que dormiu e o horário que acordou.');return}
 const [ih,im]=inicio.split(':').map(Number),[fh,fm]=fim.split(':').map(Number);
 let mins=(fh*60+fm)-(ih*60+im);if(mins<=0)mins+=1440;
 const horas=(mins/60).toFixed(1);
 let a=get(K.sono);
 a.push({id:Date.now(),data:$('sonoData').value,dormiu:inicio,acordou:fim,horas:horas,xixi:$('sonoXixi').value||0,dor:$('sonoDor').value||0,obs:$('sonoObs').value});
 set(K.sono,a);e.target.reset();$('sonoXixi').value=0;$('sonoDor').value=0;renderNovosModulos();alert('🌙 Sono registrado! Você dormiu cerca de '+horas.replace('.',',')+' horas.');
});
$('bemForm')?.addEventListener('submit',e=>{e.preventDefault();let a=get(K.bem);a.push({data:$('bemData').value,estresse:$('bemEstresse').value,ansiedade:$('bemAnsiedade').value,obs:$('bemObs').value});set(K.bem,a);e.target.reset();renderNovosModulos();alert('🧠 Bem-estar registrado!')});
$('gatilhoForm')?.addEventListener('submit',e=>{e.preventDefault();let a=get(K.gat);a.push({data:$('gatData').value,gatilho:$('gatNome').value,sintoma:$('gatSintoma').value,obs:$('gatObs').value});set(K.gat,a);e.target.reset();renderNovosModulos();alert('🎯 Gatilho registrado!')});
$('famFormPage')?.addEventListener('submit',e=>{e.preventDefault();let a=get(K.fam);a.push({parente:$('famParentePage').value,cond:$('famCondPage').value,info:$('famCondPage').value,idade:$('famIdadePage').value,obs:$('famObsPage').value});set(K.fam,a);e.target.reset();renderNovosModulos();alert('🧬 Antecedente salvo!')});
function gerarPerguntasFamilia(){const a=get(K.fam),conds=[...new Set(a.map(x=>x.cond||x.info).filter(Boolean))];$('famPerguntas').innerHTML=conds.length?'<b>Perguntas sugeridas:</b><ol>'+conds.map(c=>'<li>Há algum exame preventivo ou acompanhamento relacionado a histórico familiar de '+esc(c)+' que devo discutir com meu médico?</li>').join('')+'</ol>':'Registre antecedentes familiares para gerar perguntas organizadas.'}
$('medRotForm')?.addEventListener('submit',e=>{e.preventDefault();let a=get(K.medRot);a.push({id:Date.now(),nome:$('medRotNome').value,dose:$('medRotDose').value,hora:$('medRotHora').value,estoque:$('medRotEstoque').value||0,min:$('medRotMin').value||0});set(K.medRot,a);e.target.reset();renderNovosModulos();alert('💊 Rotina criada!')});
function confirmarDose(id){
 let a=get(K.medTaken),hoje=hojeLocal(),idx=a.findIndex(x=>x.medId===id&&String(x.data).slice(0,10)===hoje);
 let r=get(K.medRot),med=r.find(x=>x.id===id);
 if(idx>=0){a.splice(idx,1);set(K.medTaken,a);if(med&&+med.estoque>0){med.estoque=+med.estoque+1;set(K.medRot,r)}renderNovosModulos();return}
 a.push({id:id,medId:id,data:new Date().toISOString()});set(K.medTaken,a);
 if(med&&+med.estoque>0){med.estoque=+med.estoque-1;set(K.medRot,r)}
 renderNovosModulos();alert('✅ Dose registrada para hoje e estoque atualizado.');
}
$('lembFormPage')?.addEventListener('submit',e=>{e.preventDefault();let a=get(K.r);a.push({nome:$('lembNomePage').value,data:$('lembDataPage').value,tipo:$('lembTipoPage').value});set(K.r,a);e.target.reset();renderNovosModulos();alert('🔔 Lembrete criado!')});
function checarMedicamentosRotina(){const now=new Date(),hm=now.toTimeString().slice(0,5),date=hojeLocal();get(K.medRot).forEach(x=>{if(x.hora===hm){const chave='msa2_alerta_'+x.id+'_'+date+'_'+hm;if(!window.msaStorage.getItem(chave)){window.msaStorage.setItem(chave,'1');if('Notification'in window&&Notification.permission==='granted')new Notification('💊 Hora do medicamento',{body:x.nome+(x.dose?' — '+x.dose:'')});else alert('💊 Hora do medicamento: '+x.nome+(x.dose?' — '+x.dose:''))}}})}
setInterval(checarMedicamentosRotina,30000);
setInterval(checarAnticoncepcional,30000);
renderNovosModulos();
atualizarPainelAnticoncepcional();

function exigirSexoObrigatorio(){const p=get(K.p)[0]||{};if(!Object.keys(p).length||p.sexo)return;goSemBloqueio('perfil');const sel=$('pSexo');if(sel){sel.focus();sel.scrollIntoView({behavior:'smooth',block:'center'});}alert('👤 Antes de continuar, informe o sexo no seu perfil. Essa informação é necessária para organizar corretamente os módulos de saúde específicos.');}
function goSemBloqueio(id){document.querySelectorAll('nav button[data-tab]').forEach(b=>b.classList.toggle('active',b.dataset.tab===id));document.querySelectorAll('section').forEach(s=>s.classList.toggle('active',s.id===id));fecharMenus?.();loadProfile?.();renderCarteirinha?.();renderNovosModulos?.();}
function atualizarSaudeReprodutiva(){
 const s=String($('pSexo')?.value||'').trim().toLowerCase();
 const feminino=/femin|mulher|female/.test(s);
 const cicloMenu=$('cicloMenuBtn');if(cicloMenu)cicloMenu.closest('.nav-group').style.display=feminino?'block':'none';
 const box=$('reproSection');if(box)box.style.display=feminino?'block':'none';
 const cb=$('contraceptiveBox');if(cb)cb.style.display=feminino?'block':'none';
 atualizarCamposMetodoAnticoncepcional();
 if(feminino) atualizarPainelAnticoncepcional();
}
function atualizarCamposMetodoAnticoncepcional(){
 const metodo=String($('pAnticoncepcionalMetodo')?.value||'').toLowerCase();
 const pill=/pílula combinada|pilula combinada/.test(metodo);
 const mini=/minipílula|minipilula/.test(metodo);
 const rb=$('pillRegimenBox');if(rb)rb.style.display=(pill||mini)?'grid':'none';
 const rg=$('pAnticoncepcionalRegime')?.parentElement;if(rg)rg.style.display=pill?'':'none';
 const mt=$('pMinipilulaTipo')?.parentElement;if(mt)mt.style.display=mini?'':'none';
}
function registrarAnticoncepcional(status,data){
 const p=get(K.p)[0]||{};
 if(String(p.usaAnticoncepcional||'').toLowerCase()!=='sim')return;
 const dia=data||hojeLocal();
 let a=get(K.anticoncepcional).filter(x=>x.data!==dia);
 a.push({data:dia,status:status,registradoEm:new Date().toISOString()});
 a.sort((x,y)=>String(x.data).localeCompare(String(y.data)));
 set(K.anticoncepcional,a);
 atualizarPainelAnticoncepcional();
}
function atualizarPainelAnticoncepcional(){
 const p=get(K.p)[0]||{},box=$('anticoncepcionalToday'),hist=$('anticoncepcionalHistory');
 if(!box)return;
 const ativo=String(p.usaAnticoncepcional||'').toLowerCase()==='sim' && p.anticoncepcionalNome;
 if(!ativo){
   box.innerHTML='<div class="empty">Configure o anticoncepcional no Perfil para ativar o acompanhamento diário.</div>';
   if(hist)hist.innerHTML='';
   return;
 }
 const hoje=hojeLocal(),registro=get(K.anticoncepcional).find(x=>x.data===hoje);
 const status=registro?.status;
 box.innerHTML='<div class="item" style="background:#f8faff"><b>Hoje — '+esc(formatDateBR(hoje))+'</b><p>'+esc(p.anticoncepcionalNome)+(p.anticoncepcionalHora?' · horário '+esc(p.anticoncepcionalHora):'')+'<br><b>Status:</b> '+(status==='tomou'?'✅ Tomou':status==='nao_tomou'?'❌ Não tomou':'⏳ Ainda não registrado')+'</p><div class="row" style="margin-top:9px"><button class="btn green" type="button" onclick="registrarAnticoncepcional(\'tomou\')">✅ Tomei</button><button class="btn red" type="button" onclick="registrarAnticoncepcional(\'nao_tomou\')">❌ Não tomei</button></div></div>';
 if(hist){
   const dias=get(K.anticoncepcional).slice().sort((a,b)=>String(b.data).localeCompare(String(a.data))).slice(0,7);
   hist.innerHTML=dias.length?dias.map(x=>'<div class="item"><div class="itemtop"><b>'+esc(formatDateBR(x.data))+'</b><span class="tag">'+(x.status==='tomou'?'✅ Tomou':'❌ Não tomou')+'</span></div></div>').join(''):'<div class="muted">Ainda não há registros diários.</div>';
 }
}
function checarAnticoncepcional(){
 const p=get(K.p)[0]||{},hora=String(p.anticoncepcionalHora||'');
 if(String(p.usaAnticoncepcional||'').toLowerCase()!=='sim'||!hora)return;
 const hm=new Date().toTimeString().slice(0,5),dia=hojeLocal();
 if(hora!==hm||get(K.anticoncepcional).some(x=>x.data===dia))return;
 const chave='msa2_anticoncepcional_alerta_'+dia+'_'+hm;
 if(window.msaStorage.getItem(chave))return;
 window.msaStorage.setItem(chave,'1');
 if('Notification'in window&&Notification.permission==='granted')new Notification('💊 Hora do anticoncepcional',{body:(p.anticoncepcionalNome||'Anticoncepcional')+' — horário programado.'});
 else alert('💊 Hora do anticoncepcional: '+(p.anticoncepcionalNome||'Anticoncepcional')+' — horário programado.');
}
function orientarEsquecimentoAnticoncepcional(){
 const p=get(K.p)[0]||{},metodo=String(p.anticoncepcionalMetodo||'').toLowerCase();
 if(String(p.usaAnticoncepcional||'').toLowerCase()!=='sim'){alert('ℹ️ Primeiro registre que usa anticoncepcional no Perfil.');return}
 if(!metodo){alert('💊 Informe o método utilizado no Perfil antes de usar esta orientação.');return}
 const horasTxt=prompt('🚨 Há quanto tempo a dose ficou atrasada? Informe aproximadamente em horas.\n\nSe você perdeu mais de uma dose, informe a quantidade de horas desde a primeira dose que deveria ter sido tomada.','24');
 if(horasTxt===null)return;
 const horas=Number(String(horasTxt).replace(',','.'));
 if(!Number.isFinite(horas)||horas<0){alert('Informe um número de horas válido.');return}
 let msg='💊 Orientação de segurança\\n\\n';
 if(/pílula combinada|pilula combinada/.test(metodo)){
   if(horas<48) msg+='Para pílula combinada, referências clínicas consideram uma única pílula atrasada ou perdida quando ainda não se passaram 48 horas desde o horário previsto: a orientação geral é tomar a pílula assim que possível e continuar as próximas no horário habitual.\\n\\n';
   else msg+='Se já passaram 48 horas ou mais, isso pode corresponder a duas ou mais pílulas hormonais consecutivas perdidas. A orientação geral é tomar a pílula perdida mais recente assim que possível, continuar a cartela no horário habitual e usar método de barreira até completar 7 dias consecutivos de uso correto.\\n\\n';
   msg+='Se as perdas ocorreram na primeira semana e houve relação sexual sem proteção nos 5 dias anteriores, procure orientação profissional sobre contracepção de emergência.';
 }else if(/minipílula|minipilula/.test(metodo)){
   const tipo=String(p.minipilulaTipo||'').toLowerCase();
   if(/drospirenona/.test(tipo)){
     msg+=horas<48?'Para minipílula de drospirenona, menos de 48 horas desde o horário previsto é tratado nas recomendações gerais como atraso/perda de uma dose: tomar assim que possível e continuar diariamente.':'Para minipílula de drospirenona, 48 horas ou mais pode exigir medidas adicionais, incluindo método de barreira por 7 dias; confirme a bula do seu produto.';
   }else if(/tradicional|noretisterona|norgestrel/.test(tipo)){
     msg+=horas>3?'Para algumas minipílulas tradicionais, mais de 3 horas de atraso já é considerado uma dose perdida; a orientação geral é tomar assim que possível e usar método de barreira até 2 dias de uso correto.':'Para esse intervalo, siga o horário habitual e confirme a orientação da bula do produto.';
   }else{
     msg+='O intervalo permitido varia conforme o princípio ativo da minipílula. Confirme a bula específica antes de decidir o que fazer.';
   }
 }else{
   msg+='Para '+(p.anticoncepcionalMetodo||'este método')+', a conduta após atraso/esquecimento depende do produto e do esquema utilizado. Consulte a bula específica ou um profissional de saúde antes de tomar uma decisão.';
 }
 msg+='\\n\\n⚠️ Esta tela é uma referência de segurança e não substitui a bula do medicamento nem orientação profissional. A Anvisa disponibiliza gratuitamente o Bulário Eletrônico.';
 alert(msg);
}
function loadProfile(){let p=get(K.p)[0]||{};[['Nome','nome'],['Nasc','nasc'],['Idade','idade'],['Peso','peso'],['Sexo','sexo'],['Sangue','sangue'],['Altura','altura'],['Supl','supl'],['Alerg','alerg'],['Cond','cond'],['Circ','circ'],['Info','info'],['Emerg','emerg'],['Tel','tel'],['Menstruacao','menstruacao'],['Ciclo','ciclo'],['DuracaoMenstr','duracaoMenstr'],['Regularidade','regularidade'],['SexoFreq','sexoFreq'],['Camisinha','camisinha'],['Engravidou','engravidou'],['Mae','mae'],['Gestacoes','gestacoes'],['ReproObs','reproObs'],['UsaAnticoncepcional','usaAnticoncepcional'],['AnticoncepcionalMetodo','anticoncepcionalMetodo'],['AnticoncepcionalNome','anticoncepcionalNome'],['AnticoncepcionalHora','anticoncepcionalHora'],['AnticoncepcionalInicio','anticoncepcionalInicio'],['AnticoncepcionalRegime','anticoncepcionalRegime'],['MinipilulaTipo','minipilulaTipo'],['PrevColo','prevColo'],['Mamografia','mamografia'],['IST','ist'],['HPV','hpv'],['PrevProx','prevProx'],['PrevObs','prevObs'],['DorcelaxFreq','dorcelaxFreq'],['ParacetamolFreq','paracetamolFreq'],['OutrosDor','outrosDor'],['Catapora','catapora'],['CataporaQuando','cataporaQuando'],['Academia','academia'],['AcademiaFreq','academiaFreq'],['TrabalhoTipo','trabalhoTipo'],['HorasSentado','horasSentado'],['HorasPe','horasPe'],['AguaDia','aguaDia'],['UrinaDia','urinaDia'],['EvacuacaoDia','evacuacaoDia'],['CalorSuor','calorSuor']].forEach(([id,key])=>{if($('p'+id))$('p'+id).value=p[key]||''});atualizarSaudeReprodutiva()}
$('pSexo').addEventListener('input',atualizarSaudeReprodutiva);
$('pAnticoncepcionalMetodo')?.addEventListener('change',atualizarCamposMetodoAnticoncepcional);
function processarFotoPerfil(ev){const file=ev.target.files&&ev.target.files[0];if(!file)return;if(!file.type.startsWith('image/')){alert('Selecione uma imagem.');return;}const reader=new FileReader();reader.onload=()=>{const img=new Image();img.onload=()=>{const max=700,scale=Math.min(1,max/Math.max(img.width,img.height)),c=document.createElement('canvas');c.width=Math.round(img.width*scale);c.height=Math.round(img.height*scale);c.getContext('2d').drawImage(img,0,0,c.width,c.height);const data=c.toDataURL('image/jpeg',.82);let p=get(K.p)[0]||{};p.foto=data;set(K.p,[p]);loadProfile();renderCarteirinha();};img.src=reader.result};reader.readAsDataURL(file)}
function renderCarteirinha(){const p=get(K.p)[0]||{},m=get(K.m),foto=p.foto||'';const img=foto?'<img src="'+esc(foto)+'" alt="Foto do perfil">':'<span>👤</span>';if($('profilePhotoPreview'))$('profilePhotoPreview').innerHTML=img;if($('cardPhoto'))$('cardPhoto').innerHTML=img;if($('cardName'))$('cardName').textContent=p.nome||'Seu nome';if($('cardBasic')){let bits=[];if(p.nasc)bits.push('Nascimento: '+formatDateBR(p.nasc));if(p.idade)bits.push('Idade: '+p.idade);if(p.sexo)bits.push('Sexo: '+p.sexo);$('cardBasic').textContent=bits.join(' • ')||'Preencha seu perfil para montar a carteirinha.'}if($('cardBlood'))$('cardBlood').textContent=p.sangue||'Não informado';if($('cardBirth'))$('cardBirth').textContent=p.nasc?formatDateBR(p.nasc):'Não informado';if($('cardHeight'))$('cardHeight').textContent=p.altura?formatarAltura(p.altura):'Não informado';if($('cardWeight'))$('cardWeight').textContent=p.peso?(p.peso+' kg'):'Não informado';if($('cardAllergy'))$('cardAllergy').textContent=p.alerg||'Não informado';if($('cardConditions'))$('cardConditions').textContent=p.cond||'Não informado';if($('cardMeds'))$('cardMeds').textContent=m.length?m.slice(-4).map(x=>x.nome+(x.dose?' — '+x.dose:'')).join(' • '):'Nenhum registrado';if($('cardEmergency'))$('cardEmergency').textContent=p.emerg?(p.emerg+(p.tel?' — '+p.tel:'')):'Não informado';if($('cardUpdated'))$('cardUpdated').textContent=new Date().toLocaleDateString('pt-BR')}
function gerarCarteirinhaPDF(){renderCarteirinha();const oldTitle=document.title;document.title='Carteirinha de Saúde - '+((get(K.p)[0]||{}).nome||'Minha Saúde IA');setTimeout(()=>{window.print();setTimeout(()=>{document.title=oldTitle},500)},120)}
$('pFoto')?.addEventListener('change',processarFotoPerfil);
function ask(){let q=$('iaInput').value.trim();if(!q)return;let chat=$('chat');chat.innerHTML+=`<div class="bubble user">${esc(q)}</div>`;let l=q.toLowerCase(),ans;
if(/falta de ar|desmaio|convuls|confus|avc|fraqueza de um lado|sangramento intenso/.test(l))ans='🚨 Esse relato pode envolver um sinal de alerta. Se estiver acontecendo agora, for intenso ou súbito, procure atendimento médico imediatamente.';
else if(/dor|do[ií]|pontada|queima/.test(l))ans='Para organizar melhor, registre local, início, intensidade (0–10), tipo, fatores que pioram/melhoram e sintomas associados. Posso também gerar perguntas para sua consulta.';
else if(/rem[eé]dio|medicamento/.test(l))ans='Posso organizar nome, dose, frequência e período de uso. Não altere ou interrompa um medicamento prescrito sem orientação profissional.';
else ans='Posso ajudar a estruturar a informação e preparar sua conversa com um profissional. Conte quando começou, intensidade, sintomas associados e o que mudou desde então.';
chat.innerHTML+=`<div class="bubble bot">${ans}</div>`;$('iaInput').value='';chat.scrollTop=chat.scrollHeight}
function perguntasConsulta(){let d=get(K.d),e=get(K.e),m=get(K.m);let q=[];if(d.length)q.push('Quais podem ser as causas possíveis dos sintomas que registrei e quais sinais devo observar?');if(e.length)q.push('Há algum resultado dos meus exames que devo discutir com mais atenção?');if(m.length)q.push('Os medicamentos que estou usando devem ser mantidos, ajustados ou revisados?');q.push('Quais exames ou acompanhamentos podem ser necessários?','Em quais situações devo procurar atendimento antes do retorno?');$('perguntas').innerHTML='<div class="alert safe"><b>Perguntas sugeridas:</b><ol>'+q.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ol></div>'}
function gerarRelatorio(){
 const p=get(K.p)[0]||{},d=get(K.d),c=get(K.c),m=get(K.m),e=get(K.e);
 const body=`<div class="box"><b>Nome:</b> ${esc(p.nome||'Não informado')}<br><b>Informações importantes:</b> ${esc(p.info||'—')}<br><b>Alergias:</b> ${esc(p.alerg||'—')}</div>
 <h2>Sintomas</h2><ul>${d.length?d.map(x=>`<li>${x.data} — ${esc(x.local)}, intensidade ${x.int}/10, ${esc(x.tipo)}. ${esc(x.sint||'')}</li>`).join(''):'<li>Nenhum registrado.</li>'}</ul>
 <h2>Consultas</h2><ul>${c.length?c.map(x=>`<li>${x.data} — ${esc(x.esp)}, ${esc(x.med||'')}. ${esc(x.obs||'')}</li>`).join(''):'<li>Nenhuma registrada.</li>'}</ul>
 <h2>Medicamentos</h2><ul>${m.length?m.map(x=>`<li>${esc(x.nome)} — ${esc(x.dose||'')} — ${esc(x.freq||'')}</li>`).join(''):'<li>Nenhum registrado.</li>'}</ul>
 <h2>Exames</h2><ul>${e.length?e.map(x=>`<li>${x.data} — ${esc(x.nome)}: ${esc(x.res||'')}</li>`).join(''):'<li>Nenhum registrado.</li>'}</ul>`;
 openReport('Resumo de Saúde',body);
}
// V4.55 — inicialização da aplicação separada do sistema de menus
function iniciarAplicativo(){
 try{
  loadProfile();
  renderCarteirinha();
  renderNovosModulos();
  render();
 }catch(e){
  console.error('[Minha Saúde IA] falha na inicialização',e);
 }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',iniciarAplicativo);
else iniciarAplicativo();
