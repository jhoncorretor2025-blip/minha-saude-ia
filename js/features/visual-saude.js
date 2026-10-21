/* Minha Saúde IA — melhorias visuais (V6.64)
 * 1 cor por tipo de registro · 2 semáforo 🟢🟡🔴 nas medições e na dor · 4 saudação com nome e hora
 * 6 ícone do formato do remédio · 8 carteirinha com cara de cartão · 9 telas vazias amigáveis
 * Só muda a aparência: não altera nenhum dado salvo (o formato do remédio fica numa preferência à parte).
 */
(function(){
'use strict';
if(window.__visualSaude)return;window.__visualSaude=true;
function $(id){return document.getElementById(id)}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function lista(k){try{return (typeof get==='function'&&typeof K!=='undefined')?(get(K[k])||[]):[]}catch(e){return[]}}

/* ---------- 4) saudação ---------- */
function saudacao(){
 var home=$('home');if(!home)return;var h=new Date().getHours();
 var s=h<5?['🌙','Boa noite']:h<12?['☀️','Bom dia']:h<18?['🌤️','Boa tarde']:['🌙','Boa noite'];
 var nome=((lista('p')[0]||{}).nome||'').trim().split(/\s+/)[0];
 var el=$('vsSaudacao');if(!el){el=document.createElement('div');el.id='vsSaudacao';el.className='vs-saudacao';home.insertBefore(el,home.firstChild)}
 el.innerHTML='<span class="vs-sol" aria-hidden="true">'+s[0]+'</span><div><b>'+s[1]+(nome?', '+esc(nome):'')+'!</b><small>'+new Date().toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long'})+'</small></div>';
}

/* ---------- 2) semáforo ---------- */
function nivelPressao(t){var m=String(t||'').match(/(\d{1,3})\s*[\/x×]\s*(\d{1,3})/);if(!m)return null;var s=Number(m[1]),d=Number(m[2]);if(s<30){s*=10;d*=10}
 if(s>=140||d>=90)return['r','alta'];if(s<90||d<60)return['a','baixa'];if(s>=130||d>=85)return['a','um pouco alta'];return['v','normal']}
function nivelGlic(t){var n=parseFloat(String(t||'').replace(',','.'));if(!isFinite(n))return null;if(n<70)return['r','baixa'];if(n>=126)return['r','alta'];if(n>=100)return['a','um pouco alta'];return['v','normal']}
function nivelFC(t){var n=parseFloat(t);if(!isFinite(n))return null;if(n<50||n>110)return['r',n<50?'baixa':'alta'];if(n>100||n<60)return['a',n>100?'um pouco alta':'um pouco baixa'];return['v','normal']}
function nivelSat(t){var n=parseFloat(String(t||'').replace(',','.'));if(!isFinite(n))return null;if(n<90)return['r','baixa'];if(n<95)return['a','um pouco baixa'];return['v','normal']}
function nivelTemp(t){var n=parseFloat(String(t||'').replace(',','.'));if(!isFinite(n))return null;if(n>=38)return['r','febre'];if(n>=37.5)return['a','um pouco alta'];if(n<35.5)return['a','baixa'];return['v','normal']}
function nivelDor(n){n=Number(n);if(!isFinite(n))return null;if(n>=7)return['r','forte'];if(n>=4)return['a','média'];return['v','leve']}
function chip(rot,valor,niv){if(!niv)return'';var bola={v:'🟢',a:'🟡',r:'🔴'}[niv[0]];return '<span class="vs-chip vs-'+niv[0]+'" title="'+esc(rot+': '+niv[1])+'">'+bola+' '+esc(rot)+' '+esc(valor)+' <small>'+esc(niv[1])+'</small></span>'}
function semaforoVitais(){
 var box=$('vList');if(!box)return;var v=lista('v').slice().reverse();
 box.querySelectorAll(':scope > .item').forEach(function(it,i){if(it.querySelector('.vs-chips'))return;var x=v[i];if(!x)return;
  var c=chip('Pressão',x.pressao,nivelPressao(x.pressao))+chip('Açúcar',x.glic,nivelGlic(x.glic))+chip('Batimentos',x.fc,nivelFC(x.fc))+chip('Oxigênio',x.sat,nivelSat(x.sat))+chip('Temp.',x.temp,nivelTemp(x.temp));
  if(c){var d=document.createElement('div');d.className='vs-chips';d.innerHTML=c;var p=it.querySelector('p');(p||it).insertAdjacentElement(p?'beforebegin':'beforeend',d)}});
 if(v.length&&!$('vsLegenda')){var l=document.createElement('p');l.id='vsLegenda';l.className='vs-legenda';l.innerHTML='🟢 normal · 🟡 atenção · 🔴 converse com seu médico<br><small>Cores com valores de referência gerais para adultos (açúcar considerado em jejum). Seu médico pode definir metas diferentes para você.</small>';box.parentNode.insertBefore(l,box)}
}
function semaforoDor(){
 var box=$('listD');if(!box)return;var d=lista('d').slice().reverse();
 box.querySelectorAll(':scope > .item').forEach(function(it,i){if(it.querySelector('.vs-dor'))return;var x=d[i];if(!x)return;var n=Number(x.int);var niv=nivelDor(n);if(!niv||!isFinite(n))return;
  var bar=document.createElement('div');bar.className='vs-dor vs-'+niv[0];bar.setAttribute('aria-label','Intensidade '+n+' de 10, '+niv[1]);bar.innerHTML='<span style="width:'+Math.max(5,n*10)+'%"></span><b>'+n+'/10 · '+niv[1]+'</b>';
  var top=it.querySelector('.itemtop');(top||it).insertAdjacentElement(top?'afterend':'afterbegin',bar)});
}

/* ---------- 6) formato do remédio ---------- */
var FORMAS=[['💊','Comprimido'],['💧','Gotas'],['🧴','Xarope'],['💉','Injeção'],['🩹','Pomada/creme'],['🌬️','Inalação/spray'],['🧪','Sachê/pó']];
function lerFormas(){try{return JSON.parse(localStorage.getItem('msaVisual_formas')||'{}')}catch(e){return{}}}
function formaDe(nome,txt){var f=lerFormas()[String(nome||'').toLowerCase().trim()];if(f)return f;var t=String((nome||'')+' '+(txt||'')).toLowerCase();
 if(/gota|gts/.test(t))return'💧';if(/xarope|suspens|solu[cç][aã]o oral|\bml\b/.test(t))return'🧴';if(/inje[cç]|ampola|insulina|caneta/.test(t))return'💉';if(/pomada|creme|gel\b|lo[cç][aã]o/.test(t))return'🩹';if(/spray|bombinha|inala|aerossol|nebuliz/.test(t))return'🌬️';if(/sach[eê]|p[oó]\b|envelope/.test(t))return'🧪';return'💊'}
function iconesRemedios(){
 [['listM','m'],['medRotList','medRot']].forEach(function(par){var box=$(par[0]);if(!box)return;var arr=lista(par[1]).slice().reverse();
  box.querySelectorAll(':scope > .item').forEach(function(it,i){var b=it.querySelector('.itemtop b');var x=arr[i];if(!b||!x)return;var ic=formaDe(x.nome,(x.dose||'')+' '+(x.freq||''));
   if(b.dataset.vsIc!==ic){b.textContent=b.textContent.replace(/^(💊|💧|🧴|💉|🩹|🌬️|🧪)\s*/,'');b.insertAdjacentText('afterbegin',ic+' ');b.dataset.vsIc=ic}
   if(!it.querySelector('.vs-forma')){var sel=document.createElement('label');sel.className='vs-forma';sel.innerHTML='Formato: <select aria-label="Formato do remédio '+esc(x.nome)+'">'+FORMAS.map(function(f){return '<option value="'+f[0]+'"'+(f[0]===ic?' selected':'')+'>'+f[0]+' '+f[1]+'</option>'}).join('')+'</select>';it.appendChild(sel);
    sel.querySelector('select').addEventListener('change',function(){var m=lerFormas();m[String(x.nome||'').toLowerCase().trim()]=this.value;try{localStorage.setItem('msaVisual_formas',JSON.stringify(m))}catch(e){}tudo()})}
  })});
 /* também no “Hoje” */
 document.querySelectorAll('#sfHoje li').forEach(function(li){var b=li.querySelector('b');if(!b)return;var sp=li.querySelector('span');if(!sp||!/^💊/.test(sp.textContent.trim()))return;var ic=formaDe(b.textContent,'');if(sp.firstChild&&sp.firstChild.nodeType===3)sp.firstChild.nodeValue=ic+' '});
}

/* ---------- 8) carteirinha com cara de cartão ---------- */
function carteirinha(){
 var foto=$('cardPhoto'),nome=$('cardName');if(!foto||!nome)return;
 if(!foto.querySelector('img')){var n=nome.textContent.trim();var ini=n&&n!=='Seu nome'?n.split(/\s+/).filter(Boolean).slice(0,2).map(function(p){return p[0].toUpperCase()}).join(''):'';var sp=foto.querySelector('span');if(sp&&ini){sp.textContent=ini;foto.classList.add('vs-iniciais')}}
 var sang=$('cardBlood');if(sang){var box=sang.parentNode;box.classList.toggle('vs-sangue',!/Não informado/i.test(sang.textContent))}
}

/* ---------- 9) telas vazias amigáveis ---------- */
var VAZIO={listD:['🤒','Nenhum sintoma anotado.','Que bom! Se sentir algo, anote aqui.','dorForm'],listM:['💊','Nenhum remédio cadastrado.','Cadastre os remédios que você usa.','mForm'],medRotList:['⏰','Nenhum remédio com horário.','Cadastre para receber avisos na hora certa.','medRotForm'],listC:['🩺','Nenhuma consulta anotada.','Anote suas consultas e o que o médico disse.','cForm'],listE:['🧪','Nenhum exame anotado.','Guarde aqui os resultados dos seus exames.','eForm'],vList:['❤️','Nenhuma medição ainda.','Anote sua pressão, açúcar ou peso.','vForm'],rList:['🔔','Nenhum lembrete.','Crie lembretes para não esquecer nada.','rForm']};
function telasVazias(){
 document.querySelectorAll('.empty').forEach(function(e){if(e.dataset.vs||!/Nenhum registro ainda/.test(e.textContent))return;var lista=e.parentNode,id=lista&&lista.id,info=VAZIO[id];e.dataset.vs='1';
  if(!info){e.classList.add('vs-vazio');e.innerHTML='<span>📭</span><b>Nada por aqui ainda.</b>';return}
  e.classList.add('vs-vazio');e.innerHTML='<span>'+info[0]+'</span><b>'+info[1]+'</b><small>'+info[2]+'</small>'+($(info[3])?'<button type="button" data-vs-form="'+info[3]+'">➕ Anotar agora</button>':'');});
}
document.addEventListener('click',function(e){var b=e.target.closest('[data-vs-form]');if(!b)return;var f=$(b.getAttribute('data-vs-form'));if(!f)return;f.scrollIntoView({behavior:'smooth',block:'start'});var i=f.querySelector('input:not([type=hidden]),select,textarea');if(i)setTimeout(function(){try{i.focus({preventScroll:true})}catch(x){}},350)});

/* ---------- juntando ---------- */
var agendado=false;
function tudo(){agendado=false;try{saudacao();semaforoVitais();semaforoDor();iconesRemedios();carteirinha();telasVazias()}catch(e){if(window.console)console.warn('[visual-saude]',e)}}
function agendar(){if(agendado)return;agendado=true;setTimeout(tudo,60)}
/* V6.64: corrige bug antigo — a lista de medições (pressão, açúcar…), lembretes e vacinas nunca era montada,
   porque renderAcompanhamento() não era chamada em lugar nenhum. */
function montarAcompanhamento(){try{if(typeof window.renderAcompanhamento==='function')window.renderAcompanhamento()}catch(e){if(window.console)console.warn('[visual-saude] acompanhamento',e)}}
function iniciar(){
 montarAcompanhamento();
 if(typeof window.render==='function'&&!window.render.__vs){var rr=window.render;window.render=function(){var r=rr.apply(this,arguments);montarAcompanhamento();return r};window.render.__vs=true}
 document.addEventListener('submit',function(e){if(e.target&&/^(vForm|rForm|vaxForm|famForm|docForm)$/.test(e.target.id))setTimeout(montarAcompanhamento,120)});
 tudo();
 ['vList','listD','listM','medRotList','listC','listE','rList','healthCard','sfHoje'].forEach(function(id){var el=$(id);if(el)new MutationObserver(agendar).observe(el,{childList:true,subtree:id==='healthCard'||id==='sfHoje',characterData:id==='healthCard'})});
 if(typeof window.go==='function'&&!window.go.__vs){var o=window.go;window.go=function(id){var r=o.apply(this,arguments);if(id==='acompanhamento'||id==='lembretes')montarAcompanhamento();agendar();return r};window.go.__vs=true}
 setInterval(saudacao,600000);
}
var css=document.createElement('style');css.id='msa-visual-saude';
css.textContent=
 /* 1) cor por tipo */
 ':root{--vs-sint:#f97316;--vs-med:#2563eb;--vs-cons:#16a34a;--vs-vit:#dc2626;--vs-ex:#7c3aed;--vs-lemb:#0891b2}'+
 '#listD>.item{border-left:6px solid var(--vs-sint)!important}#listM>.item,#medRotList>.item{border-left:6px solid var(--vs-med)!important}#listC>.item{border-left:6px solid var(--vs-cons)!important}#vList>.item{border-left:6px solid var(--vs-vit)!important}#listE>.item{border-left:6px solid var(--vs-ex)!important}#rList>.item{border-left:6px solid var(--vs-lemb)!important}'+
 '#dor>.card:first-child h2{color:var(--vs-sint)}#meds>.card:first-child h2{color:var(--vs-med)}#consultas>.card:first-child h2{color:var(--vs-cons)}#acompanhamento>.card:first-child h2{color:var(--vs-vit)}#exames>.card:first-child h2{color:var(--vs-ex)}'+
 '#sfBotoes .sf-grade button:nth-child(1){border-color:#fed7aa;background:linear-gradient(160deg,#fff7ed,#fff)}#sfBotoes .sf-grade button:nth-child(2){border-color:#bfdbfe;background:linear-gradient(160deg,#eff6ff,#fff)}#sfBotoes .sf-grade button:nth-child(3){border-color:#bbf7d0;background:linear-gradient(160deg,#f0fdf4,#fff)}#sfBotoes .sf-grade button:nth-child(4){border-color:#ddd6fe;background:linear-gradient(160deg,#f5f3ff,#fff)}'+
 /* 2) semáforo */
 '.vs-chips{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0}.vs-chip{display:inline-flex;align-items:center;gap:4px;padding:5px 10px;border-radius:999px;font-size:13.5px;font-weight:800;border:1px solid}.vs-chip small{font-weight:600;opacity:.85}'+
 '.vs-v{background:#f0fdf4;border-color:#86efac;color:#14532d}.vs-a{background:#fffbeb;border-color:#fcd34d;color:#78350f}.vs-r{background:#fef2f2;border-color:#fca5a5;color:#7f1d1d}'+
 '.vs-legenda{margin:0 0 10px;padding:10px 12px;border-radius:12px;background:#f8fafc;border:1px dashed #cbd5e1;font-size:14px;font-weight:700}.vs-legenda small{font-weight:500;color:#475569}'+
 '.vs-dor{position:relative;height:26px;margin:8px 0;border-radius:999px;background:#f1f5f9;overflow:hidden;border:0!important}.vs-dor span{position:absolute;inset:0 auto 0 0;border-radius:999px}.vs-dor.vs-v span{background:#86efac}.vs-dor.vs-a span{background:#fcd34d}.vs-dor.vs-r span{background:#fca5a5}.vs-dor b{position:relative;display:block;padding:0 10px;line-height:26px;font-size:13px;color:#0f172a}'+
 /* 4) saudação */
 '.vs-saudacao{display:flex;align-items:center;gap:12px;margin:0 0 12px;padding:14px 16px;border-radius:18px;background:linear-gradient(135deg,#eff6ff,#f5f3ff);border:1px solid #dbeafe}.vs-sol{font-size:38px;line-height:1}.vs-saudacao b{display:block;font-size:20px}.vs-saudacao small{display:block;font-size:14px;color:#475569;text-transform:capitalize}'+
 /* 6) formato */
 '.vs-forma{display:flex;align-items:center;gap:6px;margin-top:8px;font-size:13.5px;font-weight:700;color:#475569}.vs-forma select{min-height:40px;padding:4px 8px;border-radius:10px;font:inherit;font-size:14px}'+
 /* 8) carteirinha */
 '#healthCard.health-card{background:linear-gradient(135deg,#1d4ed8 0%,#2563eb 45%,#7c3aed 100%)!important;color:#fff!important;border-radius:22px!important;border:0!important;box-shadow:0 18px 40px rgba(37,99,235,.35)!important;padding:20px!important;position:relative;overflow:hidden}'+
 '#healthCard.health-card:after{content:"";position:absolute;right:-60px;top:-60px;width:200px;height:200px;border-radius:50%;background:rgba(255,255,255,.08)}'+
 '#healthCard .card-label{color:rgba(255,255,255,.8)!important;letter-spacing:.12em}#healthCard h1,#healthCard p,#healthCard b,#healthCard span{color:#fff!important}'+
 '#healthCard .card-photo{background:rgba(255,255,255,.18)!important;border:2px solid rgba(255,255,255,.6)!important}#healthCard .card-photo.vs-iniciais span{font-size:28px;font-weight:900}'+
 '#healthCard .health-card-grid>div{background:rgba(255,255,255,.12)!important;border:1px solid rgba(255,255,255,.2)!important;border-radius:14px!important}#healthCard .health-card-grid>div>span{opacity:.85;font-size:12.5px}'+
 '#healthCard .health-card-grid>div.vs-sangue{background:#fff!important}#healthCard .health-card-grid>div.vs-sangue span{color:#b91c1c!important;opacity:1}#healthCard .health-card-grid>div.vs-sangue b{color:#b91c1c!important;font-size:28px;font-weight:900}'+
 '#healthCard .health-card-footer{border-top:1px solid rgba(255,255,255,.25)!important}'+
 /* 9) telas vazias */
 '.empty.vs-vazio{display:flex;flex-direction:column;align-items:center;gap:6px;padding:22px 14px;text-align:center}.vs-vazio>span{font-size:44px;line-height:1}.vs-vazio b{font-size:16px;color:#0f172a}.vs-vazio small{font-size:14px;color:#475569}'+
 '.vs-vazio button{margin-top:6px;min-height:44px;padding:8px 16px;border-radius:12px;border:0;background:#2563eb;color:#fff;font:inherit;font-weight:900;cursor:pointer}'+
 /* tema escuro */
 'body.msa-dark .vs-saudacao{background:linear-gradient(135deg,#172554,#2e1065);border-color:#1e3a8a}body.msa-dark .vs-saudacao small,body.msa-dark .vs-vazio small,body.msa-dark .vs-forma{color:#cbd5e1}body.msa-dark .vs-vazio b{color:#f1f5f9}'+
 'body.msa-dark .vs-v{background:#052e16;color:#bbf7d0;border-color:#166534}body.msa-dark .vs-a{background:#3b2a0c;color:#fde68a;border-color:#b45309}body.msa-dark .vs-r{background:#3b0c0c;color:#fecaca;border-color:#991b1b}body.msa-dark .vs-legenda{background:#0f172a;border-color:#334155}body.msa-dark .vs-legenda small{color:#cbd5e1}body.msa-dark .vs-dor{background:#1e293b}'+
 'body.msa-dark #sfBotoes .sf-grade button{background:#111827!important}'+
 '@media print{.vs-forma,.vs-vazio button,.vs-saudacao{display:none!important}}';
document.head.appendChild(css);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(iniciar,500)});else setTimeout(iniciar,500);
})();
