/* Minha Saúde IA — melhorias de navegação e acompanhamento V4.69 */
(function(){
'use strict';
const S=()=>window.msaStorage;
const read=k=>{try{return JSON.parse(S().getItem(k)||'[]')}catch(e){return[]}};
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const br=d=>{if(!d)return '—';const s=String(d).slice(0,10),m=s.match(/^(\d{4})-(\d{2})-(\d{2})$/);return m?m[3]+'/'+m[2]+'/'+m[1]:s};
const goSafe=id=>{if(typeof window.go==='function')window.go(id)};
const dataSets=[
 ['Sintoma','😣','msa2_dores','dor','local','sint'],
 ['Consulta','👨‍⚕️','msa2_consultas','consultas','esp','med','mot'],
 ['Medicamento','💊','msa2_meds','meds','nome','dose','freq'],
 ['Exame','🧪','msa2_exames','exames','nome','res'],
 ['Vacina','💉','msa2_vacinas','acompanhamento','nome','obs'],
 ['Lembrete','📌','msa2_lembretes','lembretes','nome','tipo','obs'],
 ['Documento','📄','msa2_documentos','documentos','nome','tipo'],
 ['Histórico familiar','🧬','msa2_familia','familia','nome','parentesco','obs'],
 ['Nutrição','🥗','msa2_nutri','nutricao','nome','obs'],
 ['Sono','😴','msa2_sono','sono','obs','qualidade'],
 ['Bem-estar','🧘','msa2_bemestar','sono','obs','humor']
];
function rowDate(x){return x.data||x.inicio||x.fim||x.date||''}
function rowText(x){return Object.keys(x||{}).map(k=>String(x[k]??'')).join(' ').toLowerCase()}
window.buscarSaude=function(q){
 const box=document.getElementById('globalSearchResults');if(!box)return;
 q=String(q||'').trim().toLowerCase();
 if(!q){box.innerHTML='<div class="empty">Digite algo para pesquisar.</div>';return}
 const out=[];
 dataSets.forEach(d=>{
  read(d[2]).forEach(x=>{if(rowText(x).includes(q))out.push({cat:d[0],icon:d[1],page:d[3],date:rowDate(x),title:d.slice(4).map(k=>x[k]).filter(Boolean).join(' — ')||d[0],raw:x})})
 });
 const p=read('msa2_perfil')[0]||{};
 if(rowText(p).includes(q))out.push({cat:'Perfil',icon:'👤',page:'perfil',date:'',title:p.nome||'Dados do perfil',raw:p});
 if(!out.length){box.innerHTML='<div class="empty">Nenhum resultado encontrado para “'+esc(q)+'”.</div>';return}
 box.innerHTML='<div class="muted">'+out.length+' resultado(s) encontrado(s).</div>'+out.slice(0,80).map(x=>'<button class="item" type="button" style="text-align:left;cursor:pointer" onclick="go(\''+x.page+'\')"><div class="itemtop"><b>'+x.icon+' '+esc(x.cat)+'</b><span class="tag">'+esc(br(x.date))+'</span></div><p>'+esc(x.title)+'</p></button>').join('');
};
function avisosData(){
 const now=new Date(),today=new Date(now.getFullYear(),now.getMonth(),now.getDate()),end=new Date(today);end.setDate(end.getDate()+30),out=[];
 const add=(date,icon,title,sub,page)=>{if(!date)return;const d=new Date(String(date).slice(0,10)+'T12:00:00');if(isNaN(d)||d<today||d>end)return;out.push({date:String(date).slice(0,10),icon,title,sub,page})};
 read('msa2_consultas').forEach(x=>add(x.ret||x.data,'👨‍⚕️',x.esp||'Consulta',x.med||x.mot||'Consulta registrada','consultas'));
 read('msa2_exames').forEach(x=>add(x.data,'🧪',x.nome||'Exame',x.obs||'Exame registrado','exames'));
 read('msa2_vacinas').forEach(x=>add(x.data,'💉',x.nome||'Vacina',x.obs||'Vacinação registrada','acompanhamento'));
 read('msa2_lembretes').forEach(x=>add(x.data,'📌',x.nome||'Lembrete',x.tipo||x.obs||'Lembrete','lembretes'));
 const p=read('msa2_perfil')[0]||{};add(p.prevProx,'🌸','Acompanhamento preventivo','Data registrada no perfil','perfil');
 return out.sort((a,b)=>a.date.localeCompare(b.date));
}
window.renderAvisos=function(){
 const box=document.getElementById('healthAlertsList');if(!box)return;
 const arr=avisosData();
 const p=read('msa2_perfil')[0]||{}, hoje=new Date().toISOString().slice(0,10);
 if(p.usaAnticoncepcional==='Sim'&&p.anticoncepcionalHora){
  const reg=read('msa2_anticoncepcional').find(x=>x.data===hoje);
  arr.unshift({date:hoje,icon:'💊',title:'Anticoncepcional — '+p.anticoncepcionalHora,sub:reg?(reg.status==='tomou'?'Dose registrada como tomada':'Dose registrada como não tomada'):'Dose de hoje ainda não registrada',page:'acompanhamento'});
 }
 box.innerHTML=arr.length?arr.map(x=>'<button class="item" type="button" style="text-align:left;cursor:pointer" onclick="go(\''+x.page+'\')"><div class="itemtop"><b>'+x.icon+' '+esc(x.title)+'</b><span class="tag">'+esc(br(x.date))+'</span></div><p>'+esc(x.sub)+'</p></button>').join(''):'<div class="empty">🎉 Nenhum aviso nos próximos 30 dias.</div>';
};
let calDate=new Date();
function calEvents(){
 const map={};
 const add=(date,icon,title,page)=>{if(!date)return;const k=String(date).slice(0,10);(map[k]||(map[k]=[])).push({icon,title,page})};
 read('msa2_consultas').forEach(x=>add(x.data,'👨‍⚕️',x.esp||'Consulta','consultas'));
 read('msa2_exames').forEach(x=>add(x.data,'🧪',x.nome||'Exame','exames'));
 read('msa2_vacinas').forEach(x=>add(x.data,'💉',x.nome||'Vacina','acompanhamento'));
 read('msa2_lembretes').forEach(x=>add(x.data,'📌',x.nome||'Lembrete','lembretes'));
 read('msa2_dores').forEach(x=>add(x.data,'😣','Sintoma','dor'));
 return map;
}
window.renderCalendario=function(){
 const box=document.getElementById('healthCalendar'),label=document.getElementById('calendarMonthLabel');if(!box)return;
 const y=calDate.getFullYear(),m=calDate.getMonth(),first=new Date(y,m,1),last=new Date(y,m+1,0),start=(first.getDay()+6)%7,ev=calEvents();
 label.textContent=first.toLocaleDateString('pt-BR',{month:'long',year:'numeric'});
 let h='<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:6px">';
 ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'].forEach(d=>h+='<div class="muted" style="text-align:center;font-weight:800;padding:6px">'+d+'</div>');
 for(let i=0;i<start;i++)h+='<div></div>';
 for(let day=1;day<=last.getDate();day++){
  const key=y+'-'+String(m+1).padStart(2,'0')+'-'+String(day).padStart(2,'0'),items=ev[key]||[],today=key===new Date().toISOString().slice(0,10);
  h+='<button type="button" class="item" style="min-height:76px;text-align:left;cursor:pointer;'+(today?'border:2px solid #2563eb;':'')+'" onclick="mostrarDiaCalendario(\''+key+'\')"><b>'+day+'</b><div style="font-size:11px;margin-top:6px">'+items.slice(0,3).map(x=>x.icon).join(' ')+'</div><small class="muted">'+(items.length?items.length+' registro(s)':'')+'</small></button>';
 }
 h+='</div>';box.innerHTML=h;
};
window.mudarMesCalendario=function(delta){calDate.setMonth(calDate.getMonth()+delta);renderCalendario();};
window.irParaMesAtual=function(){calDate=new Date();renderCalendario();document.getElementById('calendarDayDetails').innerHTML='';};
window.mostrarDiaCalendario=function(key){
 const box=document.getElementById('calendarDayDetails'),ev=calEvents()[key]||[];
 box.innerHTML='<h3>📅 '+br(key)+'</h3>'+(ev.length?ev.map(x=>'<button class="item" type="button" style="text-align:left;cursor:pointer" onclick="go(\''+x.page+'\')"><b>'+x.icon+' '+esc(x.title)+'</b></button>').join(''):'<div class="empty">Nenhum registro neste dia.</div>');
};
window.adicionarPerguntaSaude=function(){
 const el=document.getElementById('newHealthQuestion'),q=String(el?.value||'').trim();if(!q){alert('Digite uma pergunta antes de adicionar.');return}
 const arr=read('msa2_perguntas_consulta');arr.push({id:Date.now(),texto:q,respondida:false,data:new Date().toISOString()});
 S().setItem('msa2_perguntas_consulta',JSON.stringify(arr));el.value='';renderPerguntasSaude();
};
window.renderPerguntasSaude=function(){
 const box=document.getElementById('healthQuestionsList');if(!box)return;const arr=read('msa2_perguntas_consulta').slice().reverse();
 box.innerHTML=arr.length?arr.map(x=>'<div class="item"><div class="itemtop"><b style="'+(x.respondida?'text-decoration:line-through;opacity:.65':'')+'">❓ '+esc(x.texto)+'</b><span class="tag">'+(x.respondida?'Respondida':'Pendente')+'</span></div><div class="row" style="margin-top:9px"><button class="btn small '+(x.respondida?'secondary':'green')+'" onclick="alternarPerguntaSaude('+x.id+')">'+(x.respondida?'↩️ Reabrir':'✅ Marcar respondida')+'</button><button class="btn small red" onclick="removerPerguntaSaude('+x.id+')">🗑️ Remover</button></div></div>').join(''):'<div class="empty">Nenhuma pergunta cadastrada.</div>';
};
window.alternarPerguntaSaude=function(id){const a=read('msa2_perguntas_consulta'),x=a.find(x=>x.id===id);if(x)x.respondida=!x.respondida;S().setItem('msa2_perguntas_consulta',JSON.stringify(a));renderPerguntasSaude()};
window.removerPerguntaSaude=function(id){if(!confirm('Remover esta pergunta?'))return;S().setItem('msa2_perguntas_consulta',JSON.stringify(read('msa2_perguntas_consulta').filter(x=>x.id!==id)));renderPerguntasSaude()};
window.abrirCompartilhamentoSeguro=function(){const m=document.getElementById('shareSafeOverlay');if(m)m.style.display='flex'};
window.fecharCompartilhamentoSeguro=function(){const m=document.getElementById('shareSafeOverlay');if(m)m.style.display='none'};
function shareText(text){
 if(navigator.share){navigator.share({title:'Minha Saúde IA',text:text}).catch(function(){})}
 else if(navigator.clipboard){navigator.clipboard.writeText(text).then(function(){alert('📋 Conteúdo copiado para a área de transferência.')}).catch(function(){prompt('Copie o conteúdo:',text)})}
 else prompt('Copie o conteúdo:',text);
}
window.executarCompartilhamentoSeguro=function(){
 const level=document.querySelector('input[name="shareLevel"]:checked')?.value||'completude';
 let text='MINHA SAÚDE IA\n\n';
 if(level==='completude'){
  const p=read('msa2_perfil')[0]||{},fields=['nome','nasc','sexo','altura','peso','sangue','alerg','cond','circ','emerg'];
  const ok=v=>Array.isArray(v)?v.length>0:String(v||'').trim()&&String(v).toLowerCase()!=='não informado';
  const filled=fields.filter(k=>ok(p[k])).length,total=fields.length;
  text+='Completude do perfil principal: '+Math.round(filled/total*100)+'% ('+filled+'/'+total+')\n';
  text+='Este compartilhamento não contém a ficha de saúde.\n';
 }else if(level==='resumo'){
  const p=read('msa2_perfil')[0]||{};
  const counts=[['Sintomas','msa2_dores'],['Consultas','msa2_consultas'],['Medicamentos','msa2_meds'],['Exames','msa2_exames'],['Vacinas','msa2_vacinas'],['Lembretes','msa2_lembretes']];
  text+='Resumo de organização — sem dados clínicos detalhados\n\n';
  text+='Perfil preenchido: '+(p.nome?'Sim':'Não')+'\n';
  counts.forEach(x=>text+=x[0]+': '+read(x[1]).length+'\n');
  const avis=avisosData().slice(0,5);text+='\nPróximos cuidados registrados: '+avis.length+'\n';
 }else{
  if(!confirm('⚠️ A ficha completa pode conter informações sensíveis. Você confirma que deseja compartilhá-la?'))return;
  text=typeof window.healthText==='function'?window.healthText():'Ficha completa indisponível.';
 }
 fecharCompartilhamentoSeguro();shareText(text);
};
window.renderMelhorias=function(){renderAvisos();renderCalendario();renderPerguntasSaude()};
document.addEventListener('DOMContentLoaded',function(){setTimeout(renderMelhorias,160)});
})();
