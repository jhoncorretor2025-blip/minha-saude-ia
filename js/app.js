/* Minha Saúde IA — aplicação principal V4.24 */

const K={d:'msa2_dores',c:'msa2_consultas',m:'msa2_meds',e:'msa2_exames',p:'msa2_perfil',v:'msa2_vitais',r:'msa2_lembretes',vax:'msa2_vacinas',fam:'msa2_familia',doc:'msa2_documentos'};
const get=k=>JSON.parse(localStorage.getItem(k)||'[]'), set=(k,v)=>localStorage.setItem(k,JSON.stringify(v)), $=x=>document.getElementById(x);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function go(id){
 document.querySelectorAll('nav button[data-tab]').forEach(b=>b.classList.toggle('active',b.dataset.tab===id));
 document.querySelectorAll('section').forEach(s=>s.classList.toggle('active',s.id===id));
 fecharMenus();
 render();
}
function fecharMenus(){
 document.querySelectorAll('#nav .nav-group').forEach(g=>g.classList.remove('open'));
 document.querySelectorAll('#nav .nav-toggle').forEach(b=>{b.classList.remove('open');b.setAttribute('aria-expanded','false')});
}
document.querySelectorAll('nav button[data-tab]').forEach(b=>b.onclick=()=>go(b.dataset.tab));
function bodyPick(el,v){$('dLocal').value=v;document.querySelectorAll('.bodymap button').forEach(x=>x.classList.remove('sel'));el.classList.add('sel')}
function fmt(d){if(!d)return '—';let x=new Date(d);return isNaN(x)?d:x.toLocaleString('pt-BR',{dateStyle:'short',timeStyle:'short'})}
function list(id,a,fn){$(id).innerHTML=a.length?a.slice().reverse().map(fn).join(''):'<div class="empty">Nenhum registro ainda.</div>'}
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
}

function healthText(){
 const p=get(K.p)[0]||{},d=get(K.d),c=get(K.c),m=get(K.m),e=get(K.e),v=get(K.v),r=get(K.r),vax=get(K.vax),fam=get(K.fam);
 const lines=['MINHA SAÚDE IA — RESUMO DE DADOS','Gerado em: '+new Date().toLocaleString('pt-BR'),'','[PERFIL]','Nome: '+(p.nome||'Não informado'),'Nascimento: '+(p.nasc||'Não informado'),'Idade: '+(p.idade||'Não informado'),'Sexo: '+(p.sexo||'Não informado'),'Altura: '+(p.altura||'Não informado'),'Peso: '+(p.peso||'Não informado'),'Alergias: '+(p.alerg||'Não informado'),'Condições: '+(p.cond||'Não informado'),'Cirurgias/internações: '+(p.circ||'Não informado'),'Informações importantes: '+(p.info||'Não informado'),'','[SINTOMAS]'];
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
$('dData').value=new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,16);
$('dorForm')?.addEventListener('submit',()=>{});
$('pForm').onsubmit=e=>{e.preventDefault();set(K.p,[{nome:$('pNome').value,nasc:$('pNasc').value,idade:$('pIdade').value,peso:$('pPeso').value,sexo:$('pSexo').value,altura:$('pAltura').value,supl:$('pSupl').value,alerg:$('pAlerg').value,cond:$('pCond').value,circ:$('pCirc').value,info:$('pInfo').value,emerg:$('pEmerg').value,tel:$('pTel').value}]);render();alert('Perfil salvo!')};
$('dorForm').onsubmit=e=>{e.preventDefault();let a=get(K.d);a.push({data:$('dData').value,local:$('dLocal').value,int:+$('dInt').value,tipo:$('dTipo').value,freq:$('dFreq').value,gatilho:$('dGatilho').value,sint:$('dSint').value,obs:$('dObs').value});set(K.d,a);e.target.reset();$('dInt').value=5;$('dScore').textContent=5;render();alert('Sintoma salvo!')};
$('cForm').onsubmit=e=>{e.preventDefault();let a=get(K.c);a.push({data:$('cData').value,esp:$('cEsp').value,med:$('cMed').value,mot:$('cMot').value,perg:$('cPerg').value,obs:$('cObs').value,ret:$('cRet').value});set(K.c,a);e.target.reset();render();alert('Consulta salva!')};
$('mForm').onsubmit=e=>{e.preventDefault();let a=get(K.m);a.push({nome:$('mNome').value,dose:$('mDose').value,freq:$('mFreq').value,inicio:$('mInicio').value,fim:$('mFim').value,pres:$('mPres').value,obs:$('mObs').value});set(K.m,a);e.target.reset();render();alert('Medicamento salvo!')};
$('eForm').onsubmit=e=>{e.preventDefault();let a=get(K.e);a.push({nome:$('eNome').value,data:$('eData').value,res:$('eRes').value,obs:$('eObs').value});set(K.e,a);e.target.reset();render();alert('Exame salvo!')};
function loadProfile(){let p=get(K.p)[0]||{};[['Nome','nome'],['Nasc','nasc'],['Idade','idade'],['Peso','peso'],['Sexo','sexo'],['Altura','altura'],['Supl','supl'],['Alerg','alerg'],['Cond','cond'],['Circ','circ'],['Info','info'],['Emerg','emerg'],['Tel','tel']].forEach(([id,key])=>{if($('p'+id))$('p'+id).value=p[key]||''})}
$('pForm').onsubmit=e=>{e.preventDefault();set(K.p,[{nome:$('pNome').value,nasc:$('pNasc').value,idade:$('pIdade').value,peso:$('pPeso').value,sexo:$('pSexo').value,altura:$('pAltura').value,supl:$('pSupl').value,alerg:$('pAlerg').value,cond:$('pCond').value,circ:$('pCirc').value,info:$('pInfo').value,emerg:$('pEmerg').value,tel:$('pTel').value}]);render();alert('Perfil salvo!')};
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
// V4.24 — comportamento dos menus robustos
(function(){
 const nav=document.getElementById('nav');
 if(!nav)return;
 const groups=Array.from(nav.querySelectorAll('.nav-group'));
 const toggles=Array.from(nav.querySelectorAll('.nav-toggle'));
 toggles.forEach(toggle=>{
   toggle.setAttribute('aria-expanded','false');
   toggle.addEventListener('click',function(ev){
     ev.stopPropagation();
     const group=toggle.closest('.nav-group');
     const abrir=!group.classList.contains('open');
     fecharMenus();
     if(abrir){
       group.classList.add('open');
       toggle.classList.add('open');
       toggle.setAttribute('aria-expanded','true');
     }
   });
 });
 document.addEventListener('click',function(ev){
   if(!nav.contains(ev.target))fecharMenus();
 });
 document.addEventListener('keydown',function(ev){
   if(ev.key==='Escape')fecharMenus();
 });
})();
