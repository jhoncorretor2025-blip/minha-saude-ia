/* Minha Saúde IA — V5.13 — melhorias de fluxo e consulta */
(function(){
'use strict';
const K=window.MSA_K||window.K||{};
const store=window.MSAStorage||{get:k=>{try{return JSON.parse(localStorage.getItem(k)||'[]')}catch(e){return[]}},set:(k,v)=>localStorage.setItem(k,JSON.stringify(v))};
const esc=window.MSAUtils?.esc||function(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))};
const val=v=>String(v??'').trim();
const isInfo=v=>{const s=val(v).toLowerCase();return !!s&&s!=='não informado'&&s!=='nao informado'&&s!=='n/a'&&s!=='na';};
const get=k=>store.get(k)||[];
function profile(){return get(K.p)[0]||{}}
function formatDate(v){if(!v)return '—';const s=String(v),m=s.match(/^(\d{4})-(\d{2})-(\d{2})/);return m?m[3]+'/'+m[2]+'/'+m[1]:s}
function addNav(){
 const group=[...document.querySelectorAll('#nav .nav-group')].find(g=>g.querySelector('.nav-toggle[data-menu="tools"]'));
 const menu=group?.querySelector('.nav-menu');
 if(menu){
  [['msaResumo','🩺 Ficha de saúde'],['msaConsulta2','👨‍⚕️ Preparar consulta']].forEach(([tab,label])=>{
   if(!menu.querySelector('[data-tab="'+tab+'"]')){
    const b=document.createElement('button');b.type='button';b.dataset.tab=tab;b.textContent=label;menu.appendChild(b);
   }
  });
 }
}
function ensureSections(){
 const host=document.getElementById('main-content')||document.querySelector('.wrap')||document.body;
 if(!document.getElementById('msaResumo')){
  const s=document.createElement('section');s.id='msaResumo';
  s.innerHTML='<div class="card"><div class="dash-section-title"><div><h2>🩺 Ficha de saúde</h2><div class="muted">Resumo organizado dos dados que já estão registrados no aplicativo.</div></div><div class="row"><button class="btn green small" type="button" id="msaResumoCopy">📋 Copiar</button><button class="btn secondary small" type="button" id="msaResumoRefresh">🔄 Atualizar</button></div></div><div id="msaResumoBody" style="margin-top:14px"></div></div>';
  host.appendChild(s);
  s.querySelector('#msaResumoCopy').addEventListener('click',()=>copyText(buildSummaryText()));
  s.querySelector('#msaResumoRefresh').addEventListener('click',renderSummary);
 }
 if(!document.getElementById('msaConsulta2')){
  const s=document.createElement('section');s.id='msaConsulta2';
  s.innerHTML='<div class="card"><div class="dash-section-title"><div><h2>👨‍⚕️ Preparar consulta</h2><div class="muted">Organiza informações já registradas para você levar à consulta. Não é diagnóstico.</div></div><button class="btn green" type="button" id="msaConsultaGenerate">✨ Gerar resumo</button></div><div id="msaConsultaBody" style="margin-top:14px"></div></div>';
  host.appendChild(s);
  s.querySelector('#msaConsultaGenerate').addEventListener('click',renderConsultation);
 }
}
async function copyText(text){
 try{await navigator.clipboard.writeText(text);alert('✅ Copiado para a área de transferência.')}catch(e){
  const t=document.createElement('textarea');t.value=text;document.body.appendChild(t);t.select();document.execCommand('copy');t.remove();alert('✅ Copiado.');
 }
}
function section(title,body){return '<div class="card" style="margin-top:10px"><h3 style="margin:0 0 8px">'+title+'</h3>'+body+'</div>'}
function listOrNone(items,empty='Nenhum dado informado.'){
 if(!items.length)return '<div class="empty">'+empty+'</div>';
 return '<div class="list">'+items.map(x=>'<div class="item">'+x+'</div>').join('')+'</div>';
}
function buildSummaryText(){
 const p=profile(),d=get(K.d),c=get(K.c),m=get(K.m),e=get(K.e),v=get(K.v),vx=get(K.vax),fam=get(K.fam);
 const lines=['MINHA SAÚDE IA — RESUMO PESSOAL','Gerado em: '+new Date().toLocaleString('pt-BR'),''];
 lines.push('PERFIL', 'Nome: '+(p.nome||'Não informado'),'Nascimento: '+formatDate(p.nasc),'Sexo: '+(p.sexo||'Não informado'),'Altura: '+(p.altura?String(p.altura)+' cm':'Não informado'),'Peso: '+(p.peso?String(p.peso)+' kg':'Não informado'),'Tipo sanguíneo: '+(p.sangue||'Não informado'),'');
 lines.push('CONDIÇÕES DE SAÚDE','Doenças/condições: '+(p.cond||'Não informado'),'Alergias: '+(p.alerg||'Não informado'),'Cirurgias/internações: '+(p.circ||'Não informado'),'');
 lines.push('MEDICAMENTOS',m.length?m.map(x=>'- '+(x.nome||'Não informado')+(x.dose?' — '+x.dose:'')+(x.freq?' — '+x.freq:'')).join('\n'):'Nenhum registrado','');
 lines.push('SINTOMAS',d.length?d.slice(-10).map(x=>'- '+(x.data?formatDate(x.data):'Data não informada')+' — '+(x.local||'Local não informado')+(x.sint?' — '+x.sint:'')).join('\n'):'Nenhum registrado','');
 lines.push('CONSULTAS',c.length?c.slice(-10).map(x=>'- '+(x.data?formatDate(x.data):'Data não informada')+' — '+(x.esp||x.mot||'Consulta registrada')).join('\n'):'Nenhuma registrada','');
 lines.push('EXAMES',e.length?e.slice(-10).map(x=>'- '+(x.data?formatDate(x.data):'Data não informada')+' — '+(x.nome||'Exame informado')+(x.res?' — '+x.res:'')).join('\n'):'Nenhum registrado','');
 lines.push('SINAIS VITAIS',v.length?v.slice(-10).map(x=>'- '+(x.data?formatDate(x.data):'Data não informada')+' — '+[x.peso&&x.peso+' kg',x.pressao&&x.pressao,x.fc&&x.fc+' bpm',x.temp&&x.temp+' °C',x.glic&&x.glic,x.sat&&x.sat+'%'].filter(Boolean).join(' · ')).join('\n'):'Nenhum registrado','');
 lines.push('VACINAS',vx.length?vx.slice(-15).map(x=>'- '+(x.nome||'Vacina')+(x.data?' — '+formatDate(x.data):'')).join('\n'):'Nenhuma registrada','');
 lines.push('HISTÓRICO FAMILIAR',fam.length?fam.map(x=>'- '+(x.parente||'Parente não informado')+(x.info?' — '+x.info:'')).join('\n'):'Nenhum registrado');
 return lines.join('\n');
}
function renderSummary(){
 const p=profile(),d=get(K.d),c=get(K.c),m=get(K.m),e=get(K.e);
 const body=document.getElementById('msaResumoBody');if(!body)return;
 const cards=[
  ['👤 Perfil',isInfo(p.nome)?'Nome cadastrado':'Perfil incompleto'],
  ['🩺 Condições',isInfo(p.cond)?p.cond:'Nenhuma informada'],
  ['💊 Medicamentos',String(m.length)+' registrado(s)'],
  ['😣 Sintomas',String(d.length)+' registrado(s)'],
  ['👨‍⚕️ Consultas',String(c.length)+' registrada(s)'],
  ['🧪 Exames',String(e.length)+' registrado(s)']
 ];
 body.innerHTML='<div class="grid2">'+cards.map(x=>'<div class="item"><div class="itemtop"><b>'+x[0]+'</b></div><p>'+esc(x[1])+'</p></div>').join('')+'</div><div class="prep-box"><b>📋 Resumo pronto para compartilhar</b><p class="muted">Use o botão “Copiar” e revise o conteúdo antes de enviar para qualquer pessoa ou serviço.</p></div>';
}
function renderConsultation(){
 const p=profile(),d=get(K.d),c=get(K.c),m=get(K.m),e=get(K.e),v=get(K.v);
 const body=document.getElementById('msaConsultaBody');if(!body)return;
 const recentSymptoms=d.slice().reverse().slice(0,8), recentExams=e.slice().reverse().slice(0,6), recentConsultas=c.slice().reverse().slice(0,5);
 const questions=[];
 if(!isInfo(p.cond))questions.push('Quais condições de saúde devo informar nesta consulta?');
 if(recentSymptoms.length)questions.push('Quais dos sintomas registrados são mais importantes relatar hoje?');
 if(m.length)questions.push('Devo levar a lista completa dos medicamentos e doses?');
 if(recentExams.length)questions.push('Quais exames anteriores são relevantes para esta consulta?');
 questions.push('Que informações ou sinais devo observar e registrar até o próximo retorno?');
 const html='<div class="prep-box"><b>👤 Perfil</b><p>'+esc([p.nome,p.idade&&p.idade+' anos',p.sexo,p.peso&&p.peso+' kg',p.altura&&p.altura+' cm'].filter(Boolean).join(' · ')||'Não informado')+'</p></div>'+
 section('🩺 Condições e alergias','<p><b>Condições:</b> '+esc(p.cond||'Não informado')+'</p><p><b>Alergias:</b> '+esc(p.alerg||'Não informado')+'</p>')+
 section('😣 Sintomas recentes',listOrNone(recentSymptoms.map(x=>esc((x.data?formatDate(x.data):'Data não informada')+' — '+(x.local||'Local não informado')+(x.sint?' — '+x.sint:''))),'Nenhum sintoma registrado.'))+
 section('💊 Medicamentos','<p>'+esc(m.map(x=>(x.nome||'Medicamento')+(x.dose?' — '+x.dose:'')+(x.freq?' — '+x.freq:'')).join('; ')||'Nenhum registrado')+'</p>')+
 section('🧪 Exames recentes',listOrNone(recentExams.map(x=>esc((x.data?formatDate(x.data):'Data não informada')+' — '+(x.nome||'Exame')+(x.res?' — '+x.res:''))),'Nenhum exame registrado.'))+
 section('👨‍⚕️ Consultas anteriores',listOrNone(recentConsultas.map(x=>esc((x.data?formatDate(x.data):'Data não informada')+' — '+(x.esp||x.mot||'Consulta'))),'Nenhuma consulta registrada.'))+
 section('❓ Perguntas para conversar com o profissional',listOrNone(questions.map(q=>'<b>'+esc(q)+'</b>'))) +
 '<div class="row" style="margin-top:12px"><button class="btn green" type="button" id="msaConsultaCopy">📋 Copiar preparação</button></div>';
 body.innerHTML=html;
 document.getElementById('msaConsultaCopy')?.addEventListener('click',()=>copyText('PREPARAÇÃO PARA CONSULTA\n\n'+buildSummaryText()+'\n\nPERGUNTAS\n'+questions.map((q,i)=>(i+1)+'. '+q).join('\n')));
}
function addImportTools(){
 const box=document.getElementById('importIA');if(!box||document.getElementById('msaImportTools'))return;
 const wrap=document.createElement('div');wrap.id='msaImportTools';wrap.style.marginTop='12px';
 wrap.innerHTML='<div class="card" style="background:#f8faff;border-color:#dbe5ff"><div class="dash-section-title"><div><h3 style="margin:0">🔎 Conferir resposta da IA</h3><div class="muted">Veja o que o aplicativo reconheceria antes de salvar.</div></div><button class="btn secondary small" type="button" id="msaValidateImport">🔍 Validar agora</button></div><div id="msaValidateResult" style="margin-top:10px"></div></div>'+
 '<div class="card" style="margin-top:10px;background:#fffaf0;border-color:#fde7b2"><h3 style="margin:0">💬 A IA fez uma pergunta?</h3><div class="muted">Cole a pergunta aqui, responda no campo abaixo e gere uma mensagem de continuidade para a mesma IA.</div><textarea id="msaAiQuestion" placeholder="Cole aqui a pergunta que a IA fez..."></textarea><textarea id="msaAiAnswer" placeholder="Digite sua resposta..."></textarea><button class="btn" type="button" id="msaContinueAI">🔄 Gerar resposta para continuar</button><textarea id="msaContinueOutput" readonly placeholder="A mensagem para enviar à IA aparecerá aqui..." style="margin-top:8px"></textarea><button class="btn secondary small" type="button" id="msaCopyContinue">📋 Copiar mensagem</button></div>';
 box.parentNode.insertBefore(wrap,box.nextSibling);
 document.getElementById('msaValidateImport').addEventListener('click',validateImport);
 document.getElementById('msaContinueAI').addEventListener('click',continueAI);
 document.getElementById('msaCopyContinue').addEventListener('click',()=>copyText(val(document.getElementById('msaContinueOutput')?.value)));
}
function validateImport(){
 const raw=val(document.getElementById('importIA')?.value),out=document.getElementById('msaValidateResult');if(!out)return;
 if(!raw){out.innerHTML='<div class="alert warn">Cole primeiro a resposta da IA.</div>';return}
 let n;
 try{n=typeof window.normalizarFichaIA==='function'?window.normalizarFichaIA(raw):null}catch(e){n=null}
 if(!n){out.innerHTML='<div class="alert danger">Não foi possível analisar esta resposta. Tente usar a ficha estruturada do prompt.</div>';return}
 const p=n.p||{}, old=profile(), fields=['nome','nasc','idade','sexo','sangue','altura','peso','cond','alerg','circ','medicamentos','supl','info'];
 const recognized=fields.filter(k=>isInfo(p[k])).length;
 const conflicts=fields.filter(k=>isInfo(p[k])&&isInfo(old[k])&&val(p[k]).toLowerCase()!==val(old[k]).toLowerCase());
 const missing=['cond','alerg','circ'].filter(k=>!isInfo(p[k]));
 out.innerHTML='<div class="grid2"><div class="item"><b>✅ '+recognized+'</b><p>campos principais reconhecidos</p></div><div class="item"><b>⚠️ '+conflicts.length+'</b><p>possível(is) conflito(s) com o cadastro atual</p></div></div>'+
 (conflicts.length?'<div class="alert warn" style="margin-top:8px"><b>Revise:</b> '+conflicts.map(k=>esc(k)).join(', ')+'</div>':'<div class="alert safe" style="margin-top:8px">✅ Nenhum conflito principal detectado.</div>')+
 (missing.length?'<div class="alert" style="margin-top:8px"><b>Informações ausentes:</b> '+missing.join(', ')+'.</div>':'');
}
function continueAI(){
 const q=val(document.getElementById('msaAiQuestion')?.value),a=val(document.getElementById('msaAiAnswer')?.value),o=document.getElementById('msaContinueOutput');if(!o)return;
 if(!q||!a){alert('Cole a pergunta da IA e informe sua resposta antes de continuar.');return}
 o.value='CONTINUAÇÃO DA IMPORTAÇÃO — Minha Saúde IA\n\nA pergunta anterior da IA foi:\n'+q+'\n\nMinha resposta é:\n'+a+'\n\nContinue a tarefa de importação usando o contexto/memória já disponível. Não invente dados. Use minha resposta acima para completar o campo correspondente. Se ainda faltar outra informação realmente necessária, faça apenas a próxima pergunta objetiva. Quando tiver as informações necessárias, devolva somente a ficha estruturada com os marcadores do prompt original, incluindo [DOENCAS] quando aplicável.';
}
function boot(){
 addNav();ensureSections();addImportTools();renderSummary();
 setTimeout(()=>{addNav();ensureSections();addImportTools()},400);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
