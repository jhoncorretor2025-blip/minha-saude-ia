/* Minha Saúde IA — melhorias visuais (V6.65)
 * Cores por registro, semáforos, barra de dor, saudação, formato do remédio, carteirinha e telas vazias
 * V6.65: sequência semanal de doses, animação ao confirmar e tema escuro azul-marinho mais suave
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
 /* V6.72: saudação e data compactas no canto direito do cabeçalho/logo. */
 var el=$('vsSaudacao'),cab=document.querySelector('header .head');
 if(!el){el=document.createElement('div');el.id='vsSaudacao';el.className='vs-saudacao'}
 if(cab&&el.parentElement!==cab)cab.appendChild(el);
 el.innerHTML='<span class="vs-sol" aria-hidden="true">'+s[0]+'</span><div><b>'+s[1]+(nome?', '+esc(nome):'')+'!</b><small>'+new Date().toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long'})+'</small></div>';
}

/* ---------- 2) semáforo ---------- */
function nivelPressao(t){var m=String(t||'').match(/(\d{1,3})\s*[\/x×]\s*(\d{1,3})/);if(!m)return null;var s=Number(m[1]),d=Number(m[2]);if(s<30){s*=10;d*=10}
 if(s>=180||d>=110)return['r','muito alta'];if(s>=140||d>=90)return['a','alta'];if(s<90||d<60)return['a','baixa'];if(s>=130||d>=80)return['v','acompanhar tendência'];return['v','na faixa verde do app']}
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
 if(v.length&&!$('vsLegenda')){var l=document.createElement('p');l.id='vsLegenda';l.className='vs-legenda';l.innerHTML='🟢 faixa verde do app · 🟡 atenção/alta · 🔴 muito alta<br><small>Referências gerais para adultos; glicemia considerada em jejum. Uma medição isolada não confirma diagnóstico. Pressão alta repetida deve ser avaliada por um profissional; procure urgência diante de pressão muito alta com dor no peito, falta de ar, confusão ou alteração neurológica.</small>';box.parentNode.insertBefore(l,box)}
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


/* ---------- 7) calendário semanal de adesão aos remédios ---------- */
function isoLocalDia(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function calendarioSemana(){
 var host=$('sfHoje');if(!host)return;
 var titulo=host.querySelector('h2');if(!titulo)return;
 var box=$('vsWeekCalendar');
 if(!box){box=document.createElement('div');box.id='vsWeekCalendar';box.className='vs-week';titulo.insertAdjacentElement('afterend',box)}
 else if(box.parentNode!==host)titulo.insertAdjacentElement('afterend',box);
 var meds=lista('medRot').filter(function(m){return m&&m.nome});
 var taken=lista('medTaken');
 var agora=new Date(),hoje=isoLocalDia(agora);agora.setHours(12,0,0,0);
 var inicio=new Date(agora);inicio.setDate(inicio.getDate()-((inicio.getDay()+6)%7));
 var nomes=['Segunda','Terça','Quarta','Quinta','Sexta','Sábado','Domingo'];
 var letras=['S','T','Q','Q','S','S','D'];
 var dias=[];
 for(var i=0;i<7;i++){
  var dt=new Date(inicio);dt.setDate(inicio.getDate()+i);
  var iso=isoLocalDia(dt),ids=[];
  taken.forEach(function(t){if(String(t.data||'').slice(0,10)===iso&&t.medId!=null)ids.push(String(t.medId))});
  var distinct=Array.from(new Set(ids)),estado='sem-registro',mensagem='Nenhuma confirmação registrada — isso não quer dizer que a dose foi esquecida.';
  if(iso>hoje){estado='futuro';mensagem='Dia futuro';}
  else if(!meds.length){estado='sem-rotina';mensagem='Cadastre os remédios da rotina para acompanhar a sequência.';}
  else if(meds.every(function(m){return distinct.indexOf(String(m.id))>=0})){estado='completo';mensagem='Todos os remédios da rotina foram marcados como tomados.';}
  else if(distinct.length){estado='parcial';mensagem='Há doses marcadas, mas nem todos os remédios da rotina foram confirmados.';}
  var hojeClasse=iso===hoje?' hoje':'';
  var miolo=estado==='completo'?'✓':estado==='parcial'?'•':String(dt.getDate());
  dias.push('<div class="vs-week-day vs-week-'+estado+hojeClasse+'" title="'+esc(nomes[i]+', '+iso+': '+mensagem)+'" aria-label="'+esc(nomes[i]+', dia '+dt.getDate()+'. '+mensagem)+'"><small>'+letras[i]+'</small><span class="vs-week-dot">'+miolo+'</span><em>'+dt.getDate()+'</em></div>');
 }
 var rodape=meds.length?'Verde = todos os remédios da rotina confirmados':'Cadastre remédios na rotina para começar a acompanhar.';
 var html='<div class="vs-week-head"><b>🗓️ Esta semana</b><small>'+esc(rodape)+'</small></div><div class="vs-week-days">'+dias.join('')+'</div>';
 if(box.innerHTML!==html)box.innerHTML=html;
}

/* ---------- 5) retorno visual ao marcar uma dose ---------- */
document.addEventListener('click',function(e){
 var botao=e.target&&e.target.closest?e.target.closest('[data-sf-dose]'):null;
 if(!botao||botao.getAttribute('aria-pressed')==='true')return;
 var id=String(botao.getAttribute('data-sf-dose')||'');
 setTimeout(function(){
  var host=$('sfHoje');if(!host)return;
  var atual=Array.prototype.find.call(host.querySelectorAll('button[data-sf-dose]'),function(b){return String(b.getAttribute('data-sf-dose'))===id});
  if(!atual||atual.getAttribute('aria-pressed')!=='true')return;
  var item=atual.closest('li');if(!item)return;
  item.classList.remove('vs-dose-complete');
  var velho=item.querySelector('.vs-dose-pop');if(velho)velho.remove();
  void item.offsetWidth;
  item.classList.add('vs-dose-complete');
  var ok=document.createElement('span');ok.className='vs-dose-pop';ok.setAttribute('role','status');ok.textContent='✔️';ok.setAttribute('aria-label','Dose marcada como tomada');
  item.appendChild(ok);
  setTimeout(function(){item.classList.remove('vs-dose-complete');if(ok.parentNode)ok.remove()},1700);
 },650);
},true);


/* V6.67 — hierarquia da página inicial, ações prioritárias e responsividade */
function melhorarHome(){
 var home=$('home');if(!home)return;
 var perfil=$('homeProfileHero'),atalhos=$('homeCommandCenter'),imc=$('homeSmartHealth'),aniversario=$('homeBirthdayCountdown'),rapidas=$('homeQuickActions'),intro=$('msaPurposeIntro'),pendencias=$('homeMissingInfoCard'),metricas=home.querySelector('.metric-panel'),backup=home.querySelector('.msa-backup-prompt');
 /* Coloca a contagem do aniversário no cartão superior "Você está em / Início", junto aos controles do cabeçalho. */
 if(aniversario){
  var crumbCards=Array.from(document.querySelectorAll('div,nav,section,aside')).filter(function(el){
   var t=(el.innerText||'').trim();
   return /Você está em/i.test(t)&&/Início/i.test(t)&&el.querySelectorAll('button').length>=3&&t.length<320&&(!el.parentElement||!el.parentElement.classList.contains('msa-birthday-crumb-host'));
  }).sort(function(a,b){return (a.innerText||'').length-(b.innerText||'').length;});
  var crumb=crumbCards[0];
  if(crumb&&aniversario.parentElement!==crumb){
   crumb.appendChild(aniversario);
   crumb.classList.add('msa-birthday-crumb-host');
  }
 }
 if(perfil&&atalhos&&atalhos.previousElementSibling!==perfil)perfil.insertAdjacentElement('afterend',atalhos);
 if(atalhos&&imc&&imc.previousElementSibling!==atalhos)atalhos.insertAdjacentElement('afterend',imc);
 /* Não mover aniversário para baixo do IMC: ele pertence ao cartão superior de navegação. */
 if(rapidas)rapidas.hidden=true;
 if(intro)intro.hidden=true;
 if(metricas&&pendencias&&pendencias.previousElementSibling!==metricas)metricas.insertAdjacentElement('afterend',pendencias);
 if(metricas&&backup&&backup.previousElementSibling!==metricas)metricas.insertAdjacentElement('afterend',backup);
}


/* V6.73 — seletor de pessoa acompanhada no cartão de perfil */
function pessoaEsc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]})}
function pessoaPrincipal(){
 var k=window.MSA_K||window.K||{},a=[];try{a=window.MSAStorage.getGlobal?window.MSAStorage.getGlobal(k.p):window.MSAStorage.get(k.p)}catch(e){}
 var p=Array.isArray(a)?(a[0]||{}):(a||{});
 return {id:'__principal__',nome:p.nome||'Meu perfil',idade:p.idade||'',nasc:p.nasc||'',peso:p.peso||'',altura:p.altura||'',sangue:p.sangue||'',sexo:p.sexo||'',foto:p.foto||'',circ:p.circ||'',principal:true};
}
function pessoasAcompanhadas(){
 var k=window.MSA_K||window.K||{},a=[];try{a=window.MSAStorage.get(k.familiares||'msa2_familiares')||[]}catch(e){}
 return Array.isArray(a)?a:[];
}
function pessoaAtual(){
 try{var raw=window.MSAStorage.raw('msa2_familiar_selecionado'),id=raw?JSON.parse(raw):'';if(id){var p=pessoasAcompanhadas().find(function(x){return String(x.id)===String(id)});if(p)return p}}catch(e){}
 return pessoaPrincipal();
}
function pessoaIdade(p){
 if(p.idade)return String(p.idade);
 if(p.nasc){var d=new Date(p.nasc+'T12:00:00');if(!isNaN(d)){var n=new Date(),a=n.getFullYear()-d.getFullYear();if(n.getMonth()<d.getMonth()||(n.getMonth()===d.getMonth()&&n.getDate()<d.getDate()))a--;if(a>=0)return String(a)}}
 return '—';
}
function pessoaAltura(p){
 var h=String(p.altura||'').trim();if(!h)return '—';
 var n=parseFloat(h.replace(',','.'));if(!isFinite(n))return h;
 return n>3?(n/100).toFixed(2).replace('.',',')+' m':n.toFixed(2).replace('.',',')+' m';
}
function pessoaNumeroAltura(p){var n=parseFloat(String(p.altura||'').replace(',','.'));if(!isFinite(n))return 0;return n>3?n/100:n}
function pessoaNumeroPeso(p){var n=parseFloat(String(p.peso||'').replace(',','.'));return isFinite(n)?n:0}
function atualizarCardPessoa(){
 var hero=$('homeProfileHero');if(!hero)return;var p=pessoaAtual(),principal=!!p.principal;
 var setText=function(id,v){var e=$(id);if(e)e.textContent=v||'—'};
 setText('homeProfileName',p.nome||'Sem nome');setText('homeProfileAge',pessoaIdade(p));setText('homeProfileWeight',p.peso||'—');setText('homeProfileHeight',pessoaAltura(p));setText('homeProfileBlood',p.sangue||'—');
 var h=pessoaNumeroAltura(p),w=pessoaNumeroPeso(p),imc=h>0&&w>0?w/(h*h):0;
 setText('homeProfileBMI',imc?imc.toFixed(1).replace('.',','):'—');setText('homeProfileBMIClass',!imc?'Informe peso e altura':imc<18.5?'Abaixo da faixa':imc<25?'Faixa adequada':imc<30?'Sobrepeso':'Acima da faixa');
 var circ=p.circ||p.cintura||'';if(!circ&&p.medidas){var m=String(p.medidas).match(/cintura\s*[:=—-]?\s*(\d+(?:[,.]\d+)?)\s*(?:cm)?/i);if(m)circ=m[1]+' cm'}
 setText('homeProfileWaist',circ?(/cm/i.test(String(circ))?circ:circ+' cm'):'—');setText('homeProfileWaistDate',principal?'Última medida registrada':'Medida não informada');
 var avatar=$('homeAvatar');if(avatar)avatar.innerHTML=p.foto?'<img src="'+pessoaEsc(p.foto)+'" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%">':(principal?'<span>👤</span>':(p.sexo==='Feminino'?'👩':'👤'));
 var greet=hero.querySelector('.home-greeting');if(greet)greet.textContent=principal?'👋 Olá!':'💙 Acompanhando';
 var b=$('msaPessoaAcompanhadaBtn');if(b){var name=b.querySelector('b');if(name)name.textContent=p.nome||'Pessoa selecionada';b.setAttribute('aria-label','Estou cuidando da saúde de '+(p.nome||'pessoa selecionada')+'. Clique para trocar')}
 var edit=hero.querySelector('.home-profile-edit');if(edit){edit.textContent=principal?'✏️ Editar':'✏️ Editar pessoa';edit.onclick=principal?function(){go('perfil')}:function(){try{window.MSAStorage.set('msa2_familiar_selecionado',p.id)}catch(e){}go('familiares');setTimeout(function(){if(window.selecionarFamiliar)window.selecionarFamiliar(p.id);setTimeout(function(){if(window.focarEdicaoFamiliar)window.focarEdicaoFamiliar(p.id)},120)},180)}}
}
function abrirSeletorPessoa(){
 var old=$('msaPessoaAcompanhadaModal');if(old)old.remove();var active=pessoaAtual(),own=pessoaPrincipal(),list=pessoasAcompanhadas();
 var modal=document.createElement('div');modal.id='msaPessoaAcompanhadaModal';modal.className='msa-pessoa-modal';
 modal.innerHTML='<div class="msa-pessoa-dialog" role="dialog" aria-modal="true" aria-labelledby="msaPessoaTitle"><div class="msa-pessoa-head"><div><small>👨‍👩‍👧‍👦 PERFIL ACOMPANHADO</small><h2 id="msaPessoaTitle">De quem você está cuidando?</h2><p>Escolha uma pessoa para atualizar o cartão de perfil.</p></div><button type="button" class="msa-pessoa-close" aria-label="Fechar">✕</button></div><div class="msa-pessoa-options"><button type="button" class="msa-pessoa-option '+(active.principal?'selected':'')+'" data-pessoa-id="__principal__"><span>👤</span><span><b>'+pessoaEsc(own.nome||'Meu perfil')+'</b><small>Meu perfil pessoal</small></span><span>✓</span></button>'+(list.length?list.map(function(p){return '<button type="button" class="msa-pessoa-option '+(String(active.id)===String(p.id)?'selected':'')+'" data-pessoa-id="'+pessoaEsc(p.id)+'"><span>'+(p.sexo==='Feminino'?'👩':'👤')+'</span><span><b>'+pessoaEsc(p.nome||'Sem nome')+'</b><small>'+pessoaEsc(p.parentesco||'Familiar')+' · '+pessoaEsc(p.idade||'Idade não informada')+' anos</small></span><span>✓</span></button>'}).join(''):'<p class="msa-pessoa-empty">Nenhum familiar cadastrado. Cadastre pessoas na área Família.</p>')+'</div><div class="msa-pessoa-foot"><button type="button" class="msa-pessoa-manage">➕ Cadastrar ou editar familiares</button></div></div>';
 document.body.appendChild(modal);function fechar(){modal.remove();document.removeEventListener('keydown',tecla)}function tecla(e){if(e.key==='Escape')fechar()}
 modal.querySelector('.msa-pessoa-close').onclick=fechar;modal.addEventListener('click',function(e){if(e.target===modal)fechar()});document.addEventListener('keydown',tecla);
 modal.querySelectorAll('[data-pessoa-id]').forEach(function(btn){btn.onclick=function(){var id=btn.dataset.pessoaId;try{window.MSAStorage.set('msa2_familiar_selecionado',id==='__principal__'?'':id)}catch(e){}fechar();aplicarPerfilSelecionado();}});
 modal.querySelector('.msa-pessoa-manage').onclick=function(){fechar();go('familiares')};
}
function aplicarPerfilSelecionado(){
 /* Os módulos leem MSAStorage; a seleção agora troca o espaço de dados ativo, não apenas o nome do card. */
 try{if(typeof window.loadProfile==='function')window.loadProfile()}catch(e){}
 try{if(typeof window.render==='function')window.render()}catch(e){console.warn('[perfil ativo] render:',e)}
 try{if(typeof window.renderCarteirinha==='function')window.renderCarteirinha()}catch(e){}
 try{if(typeof window.renderNovosModulos==='function')window.renderNovosModulos()}catch(e){}
 try{if(typeof window.renderFamiliares==='function')window.renderFamiliares()}catch(e){}
 atualizarCardPessoa();
}
(function instalarNavegacaoCarteirinha(){
 if(window.__msaCarteirinhaPerfilWrap||typeof window.go!=='function')return;
 var original=window.go;
 window.go=function(id){var r=original.apply(this,arguments);if(id==='carteirinha'){setTimeout(function(){try{if(typeof window.renderCarteirinha==='function')window.renderCarteirinha()}catch(e){}},0)}return r};
 window.__msaCarteirinhaPerfilWrap=true;
})();
function instalarSeletorPessoaAcompanhada(){
 var hero=$('homeProfileHero'),waist=$('homeProfileWaistChip');
 if(!hero)return false;
 /* Busca o chip também pelo texto, caso algum ajuste de layout tenha trocado o ID. */
 if(!waist){var chips=hero.querySelectorAll('.home-profile-metric-chip');for(var i=0;i<chips.length;i++){if(/Cintura/i.test(chips[i].textContent||'')){waist=chips[i];break}}}
 if(!waist)return false;
 var btn=$('msaPessoaAcompanhadaBtn');
 if(!btn){
  btn=document.createElement('button');btn.id='msaPessoaAcompanhadaBtn';btn.type='button';btn.className='msa-pessoa-acompanhada';
  btn.innerHTML='👨‍👩‍👧 <span>Estou cuidando da saúde de:</span> <b>Meu perfil</b> <span aria-hidden="true">▾</span>';
  btn.setAttribute('aria-haspopup','dialog');btn.onclick=abrirSeletorPessoa;
 }
 /* Reposiciona caso o card seja recriado ou o botão tenha ficado fora da linha de métricas. */
 if(waist.nextElementSibling!==btn)waist.insertAdjacentElement('afterend',btn);
 btn.style.display='inline-flex';btn.style.visibility='visible';
 atualizarCardPessoa();
 return true;
}
/* Reaplica após a montagem assíncrona da Home, inclusive quando o card é recriado. */
function garantirSeletorPessoaAcompanhada(){
 var tentativas=0;
 function tentar(){tentativas++;if(instalarSeletorPessoaAcompanhada())return;if(tentativas<20)setTimeout(tentar,250)}
 tentar();
}

/* ---------- juntando ---------- */
var agendado=false;
function tudo(){agendado=false;try{melhorarHome();garantirSeletorPessoaAcompanhada();saudacao();semaforoVitais();semaforoDor();iconesRemedios();carteirinha();telasVazias();calendarioSemana()}catch(e){if(window.console)console.warn('[visual-saude]',e)}}
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
 /* V6.71: cartão do perfil no celular — o nome ficava com largura zero (foto e botões numa linha só) */
 '@media(max-width:700px){body:has(#home.active) #homeProfileHero{display:grid!important;grid-template-columns:64px minmax(0,1fr)!important;gap:12px!important;align-items:start!important}#homeProfileHero>.home-profile-main{min-width:0!important;width:auto!important}#homeProfileHero>.home-profile-actions{grid-column:1/-1!important;width:100%!important;display:grid!important;grid-template-columns:1fr 1fr!important;gap:8px!important}#homeProfileHero .home-profile-stats{display:flex!important;flex-wrap:wrap!important;gap:6px!important}}'+
 /* 2) semáforo */
 '.vs-chips{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0}.vs-chip{display:inline-flex;align-items:center;gap:4px;padding:5px 10px;border-radius:999px;font-size:13.5px;font-weight:800;border:1px solid}.vs-chip small{font-weight:600;opacity:.85}'+
 '.vs-v{background:#f0fdf4;border-color:#86efac;color:#14532d}.vs-a{background:#fffbeb;border-color:#fcd34d;color:#78350f}.vs-r{background:#fef2f2;border-color:#fca5a5;color:#7f1d1d}'+
 '.vs-legenda{margin:0 0 10px;padding:10px 12px;border-radius:12px;background:#f8fafc;border:1px dashed #cbd5e1;font-size:14px;font-weight:700}.vs-legenda small{font-weight:500;color:#475569}'+
 '.vs-dor{position:relative;height:26px;margin:8px 0;border-radius:999px;background:#f1f5f9;overflow:hidden;border:0!important}.vs-dor span{position:absolute;inset:0 auto 0 0;border-radius:999px}.vs-dor.vs-v span{background:#86efac}.vs-dor.vs-a span{background:#fcd34d}.vs-dor.vs-r span{background:#fca5a5}.vs-dor b{position:relative;display:block;padding:0 10px;line-height:26px;font-size:13px;color:#0f172a}'+
 /* 4) saudação */
 '.vs-saudacao{display:flex;align-items:center;justify-content:flex-end;gap:9px;margin:0 0 0 auto;padding:7px 0 7px 14px;border:0;background:transparent;color:#fff;min-width:0;max-width:300px;flex:0 1 auto}.vs-sol{font-size:25px;line-height:1;flex:0 0 auto}.vs-saudacao>div{min-width:0;text-align:right}.vs-saudacao b{display:block;font-size:15px;line-height:1.35;color:#fff;white-space:nowrap}.vs-saudacao small{display:block;font-size:11px;color:rgba(255,255,255,.85);text-transform:capitalize;white-space:nowrap}.head{position:relative;padding-right:260px}.head>.brand,.head>.sub{max-width:100%}.vs-saudacao{position:absolute;right:0;top:0}@media(max-width:600px){.head{display:block;padding-right:0}.head>.brand,.head>.sub{max-width:100%}.vs-saudacao{position:absolute;right:0;top:0;max-width:44%;padding:4px 0 4px 6px;gap:5px}.vs-sol{font-size:19px}.vs-saudacao b{font-size:11px;white-space:normal}.vs-saudacao small{font-size:9px;white-space:normal}.head>.brand{padding-right:35%}.head>.sub{padding-right:0}}'+
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
 '@media print{.vs-forma,.vs-vazio button,.vs-saudacao{display:none!important}}'+
  /* Barra de dor contínua do verde ao vermelho */
  '.vs-dor span,.vs-dor.vs-v span,.vs-dor.vs-a span,.vs-dor.vs-r span{background:linear-gradient(90deg,#22c55e 0%,#facc15 52%,#f97316 76%,#ef4444 100%)!important}'+
  /* Cores de categoria também na linha do tempo */
  '.timeline-row-sintomas .timeline-dot{background:#f97316!important}.timeline-row-sintomas .timeline-content{border-left:4px solid #f97316;padding-left:10px}'+
  '.timeline-row-medicamentos .timeline-dot{background:#2563eb!important}.timeline-row-medicamentos .timeline-content{border-left:4px solid #2563eb;padding-left:10px}'+
  '.timeline-row-consultas .timeline-dot{background:#16a34a!important}.timeline-row-consultas .timeline-content{border-left:4px solid #16a34a;padding-left:10px}'+
  '.timeline-row-sinais .timeline-dot{background:#dc2626!important}.timeline-row-sinais .timeline-content{border-left:4px solid #dc2626;padding-left:10px}'+
  '.timeline-row-exames .timeline-dot{background:#7c3aed!important}.timeline-row-exames .timeline-content{border-left:4px solid #7c3aed;padding-left:10px}'+
  /* Calendário semanal */
  '.vs-week{margin:9px 0 14px;padding:12px;border:1px solid var(--border);border-radius:16px;background:var(--card);color:var(--text)}'+
  '.vs-week-head{display:flex;flex-direction:column;gap:3px;margin-bottom:10px}.vs-week-head>b{font-size:14px}.vs-week-head>small{font-size:11px;color:var(--muted);line-height:1.35}'+
  '.vs-week-days{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:4px;text-align:center}'+
  '.vs-week-day{display:flex;flex-direction:column;align-items:center;gap:4px;min-width:0}.vs-week-day>small{font-size:11px;font-weight:900;color:var(--muted)}'+
  '.vs-week-dot{display:flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:50%;background:#eef2f7;color:#526071;border:1px solid #d9e0e9;font-size:13px;font-weight:900}'+
  '.vs-week-day>em{font-style:normal;font-size:10px;color:var(--muted)}.vs-week-day.vs-week-completo .vs-week-dot{background:#16a34a;color:#fff;border-color:#15803d}'+
  '.vs-week-day.vs-week-parcial .vs-week-dot{background:#fef3c7;color:#92400e;border-color:#f59e0b}.vs-week-day.vs-week-futuro .vs-week-dot{opacity:.55}'+
  '.vs-week-day.hoje .vs-week-dot{outline:2px solid #60a5fa;outline-offset:2px}.vs-week-day.vs-week-sem-rotina .vs-week-dot{background:#f1f5f9;color:#94a3b8}'+
  /* Microanimação ao concluir uma dose */
  '.sf-hoje li.vs-dose-complete{animation:vsDoseCard .62s cubic-bezier(.2,.75,.25,1);background:#f0fdf4!important;border-color:#86efac!important}'+
  '.vs-dose-pop{display:inline-flex;align-items:center;justify-content:center;margin-left:8px;width:28px;height:28px;border-radius:50%;background:#16a34a;color:#fff;font-size:17px;box-shadow:0 4px 12px rgba(22,163,74,.25);animation:vsCheckPop .55s cubic-bezier(.2,.9,.25,1.4)}'+
  '@keyframes vsDoseCard{0%{transform:scale(1)}38%{transform:scale(1.015)}100%{transform:scale(1)}}@keyframes vsCheckPop{0%{transform:scale(.35);opacity:0}70%{transform:scale(1.15);opacity:1}100%{transform:scale(1)}}'+
  /* Tema escuro azul-marinho, contraste suave e bordas discretas */
  'body.msa-dark{--bg:#111b2f;--card:#1a2940;--text:#dce6f3;--muted:#a9b7cb;--border:#34445d;--shadow:0 8px 24px rgba(0,0,0,.18);background:#111b2f!important;color:#dce6f3!important}'+
  'body.msa-dark .card,body.msa-dark .item,body.msa-dark .box,body.msa-dark .progressive-card,body.msa-dark .modal-card,body.msa-dark .msa-fab-action,body.msa-dark .msa-mobile-drawer{background:#1a2940!important;color:#dce6f3!important;border-color:#34445d!important;box-shadow:0 7px 22px rgba(0,0,0,.14)}'+
  'body.msa-dark input,body.msa-dark select,body.msa-dark textarea{background:#17243a!important;color:#dce6f3!important;border-color:#34445d!important}'+
  'body.msa-dark .vs-week,body.msa-dark .vs-legenda{background:#17243a!important;color:#dce6f3!important;border-color:#34445d!important}'+
  'body.msa-dark .vs-week-head small,body.msa-dark .vs-week-day>small,body.msa-dark .vs-week-day>em{color:#a9b7cb!important}'+
  'body.msa-dark .vs-week-dot{background:#24344c;color:#dce6f3;border-color:#40516a}body.msa-dark .vs-week-day.vs-week-completo .vs-week-dot{background:#166534;color:#dcfce7;border-color:#22c55e}'+
  'body.msa-dark .vs-week-day.vs-week-parcial .vs-week-dot{background:#493815;color:#fde68a;border-color:#a16207}'+
  'body.msa-dark .sf-hoje li{background:#1a2940!important;color:#dce6f3!important;border-color:#34445d!important}body.msa-dark .sf-hoje li.vs-dose-complete{background:#143626!important;border-color:#27834e!important}'+
  'body.msa-dark .vs-saudacao{background:linear-gradient(135deg,#192d4d,#29264a);border-color:#34445d}'+
  '@media(prefers-reduced-motion:reduce){.vs-dose-pop,.sf-hoje li.vs-dose-complete{animation:none!important;transition:none!important}}body.msa-reduce-motion .vs-dose-pop,body.msa-reduce-motion .sf-hoje li.vs-dose-complete{animation:none!important}'+
  '@media(max-width:360px){.vs-week{padding:9px 6px}.vs-week-days{gap:2px}.vs-week-dot{width:28px;height:28px}}'+
  '@media print{.vs-forma,.vs-vazio button,.vs-saudacao,.vs-week,.vs-dose-pop{display:none!important}}';
document.head.appendChild(css);


var pessoaCss=document.createElement('style');pessoaCss.id='msa-pessoa-acompanhada-css';pessoaCss.textContent=`
.msa-pessoa-acompanhada{display:inline-flex;align-items:center;gap:5px;flex-wrap:wrap;max-width:100%;padding:8px 10px;border:1px solid #cfe0ff;border-radius:11px;background:linear-gradient(135deg,#eff6ff,#f5f3ff);color:#2347a5;font:inherit;font-size:11px;font-weight:800;cursor:pointer;line-height:1.35}.msa-pessoa-acompanhada b{font-weight:900;color:#1d4ed8}.msa-pessoa-acompanhada:hover{border-color:#8fb0ff;background:#eaf1ff}
.msa-pessoa-modal{position:fixed;inset:0;z-index:13000;background:rgba(15,23,42,.5);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:16px}.msa-pessoa-dialog{width:min(100%,480px);max-height:min(82vh,680px);overflow:auto;background:#fff;color:#172033;border:1px solid #dbe5f3;border-radius:20px;padding:18px;box-shadow:0 24px 80px rgba(15,23,42,.24)}.msa-pessoa-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:14px}.msa-pessoa-head small{font-size:10px;font-weight:900;letter-spacing:.08em;color:#2563eb}.msa-pessoa-head h2{font-size:20px;line-height:1.2;margin:5px 0}.msa-pessoa-head p{font-size:13px;color:#64748b;margin:0}.msa-pessoa-close{width:36px;height:36px;border:1px solid #dbe4f0;border-radius:10px;background:#f8fafc;cursor:pointer;font-size:18px}.msa-pessoa-options{display:grid;gap:8px}.msa-pessoa-option{width:100%;display:flex;align-items:center;gap:11px;padding:12px;border:1px solid #e2e8f0;border-radius:13px;background:#fff;color:#172033;text-align:left;font:inherit;cursor:pointer}.msa-pessoa-option>span:first-child{font-size:25px}.msa-pessoa-option>span:nth-child(2){flex:1;min-width:0;display:grid;gap:3px}.msa-pessoa-option b{font-size:14px}.msa-pessoa-option small{font-size:11px;color:#64748b}.msa-pessoa-option>span:last-child{opacity:0;color:#2563eb;font-weight:900}.msa-pessoa-option.selected{border-color:#7da7ff;background:#eff6ff}.msa-pessoa-option.selected>span:last-child{opacity:1}.msa-pessoa-empty{padding:14px;border-radius:12px;background:#f8fafc;color:#64748b;font-size:13px}.msa-pessoa-foot{border-top:1px solid #e5eaf2;margin-top:14px;padding-top:12px}.msa-pessoa-manage{width:100%;padding:11px;border:1px dashed #9bb8ff;border-radius:12px;background:#f8fbff;color:#2457c5;font:inherit;font-size:13px;font-weight:800;cursor:pointer}body.msa-dark .msa-pessoa-dialog{background:#172338;color:#e5edf8;border-color:#34445d}body.msa-dark .msa-pessoa-option{background:#1c2b42;color:#e5edf8;border-color:#34445d}body.msa-dark .msa-pessoa-option.selected{background:#203a60;border-color:#719dff}body.msa-dark .msa-pessoa-close{background:#1c2b42;color:#e5edf8;border-color:#34445d}body.msa-dark .msa-pessoa-head p,body.msa-dark .msa-pessoa-option small{color:#b5c2d4}@media(max-width:600px){.msa-pessoa-acompanhada{flex-basis:100%;justify-content:flex-start}.msa-pessoa-dialog{padding:14px;border-radius:16px}.msa-pessoa-head h2{font-size:18px}}
`;document.head.appendChild(pessoaCss);

var homePolish=document.createElement('style');homePolish.id='msa-home-polish-v667';
homePolish.textContent=`
.msa-birthday-crumb-host{display:flex!important;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}.msa-birthday-crumb-host>.home-birthday-countdown{flex:1 1 260px;min-width:0;max-width:560px;margin:0!important;padding:7px 12px!important;border-radius:12px!important;box-shadow:none!important;gap:8px!important;background:#fff7e6!important;border-color:#f5d58a!important}.msa-birthday-crumb-host .home-birthday-icon{font-size:22px!important}.msa-birthday-crumb-host .home-birthday-countdown strong{font-size:12px!important;line-height:1.3}.msa-birthday-crumb-host .home-birthday-countdown small{font-size:10px!important;margin-top:1px!important}.msa-birthday-crumb-host>.home-birthday-countdown[hidden]{display:none!important}@media(max-width:600px){.msa-birthday-crumb-host{gap:7px}.msa-birthday-crumb-host>.home-birthday-countdown{flex-basis:100%;max-width:none;padding:7px 9px!important}.msa-birthday-crumb-host .home-birthday-icon{font-size:19px!important}} 
/* V6.71: só quando o Início está ativo — “#home{display:flex}” fazia o Início aparecer embaixo de todas as outras páginas */
#home.active{display:flex;flex-direction:column;gap:12px}
#home #homeProfileHero{margin:0 0 2px;gap:16px}
#home .home-command-center{order:1;margin:0;align-items:stretch;gap:12px}
#home .home-command-main,#home .home-command-side{border-radius:18px;box-shadow:0 6px 20px rgba(15,23,42,.045)}
#home .home-command-main{padding:17px}
#home .home-command-main h2{font-size:clamp(20px,2.4vw,25px);letter-spacing:-.025em}
#home .home-primary-actions button{min-height:88px;transition:transform .16s ease,box-shadow .16s ease,border-color .16s ease}
#home .home-primary-actions button:focus-visible,#home .home-command-side button:focus-visible,#home .home-secondary-actions button:focus-visible{outline:3px solid #93c5fd;outline-offset:2px}
#home .home-primary-actions button:hover{box-shadow:0 5px 14px rgba(37,99,235,.09)}
#home #homeSmartHealth{margin:0}
#home .home-bmi-card{border-radius:18px;padding:16px;box-shadow:0 6px 20px rgba(37,99,235,.055)}
#home .home-missing-info-card,#home #homeMissingInfoCard{border-radius:16px!important}
#home .metric-panel{margin:0;gap:9px}
#home .metric-kpi{border-radius:15px;transition:border-color .15s ease}
#home .home-quick-actions,#home .msa-purpose{display:none!important}
#home .msa-backup-prompt{margin:0!important;border-radius:16px!important}
#home .home-secondary-details{margin-top:0!important}
body.msa-dark #home .home-command-main,body.msa-dark #home .home-command-side{background:#1a2940;border-color:#34445d;color:#dce6f3}
body.msa-dark #home .home-command-main p,body.msa-dark #home .home-command-side button{color:#cbd5e1}
body.msa-dark #home .home-primary-actions button,body.msa-dark #home .home-command-side button{background:#17243a;border-color:#34445d;color:#dce6f3}
@media(max-width:760px){
 #home{gap:10px}
 #home #homeProfileHero{padding:13px;gap:10px;align-items:flex-start;flex-wrap:wrap}
 #home .home-avatar{width:56px;height:56px;min-width:56px}
 #home .home-profile-main h2{font-size:19px}
 #home .home-profile-stats{gap:6px}
 #home .home-profile-stats span{font-size:11px;padding:5px 8px}
 #home .home-profile-actions{width:100%;display:flex;gap:7px}
 #home .home-profile-actions button{flex:1;min-height:40px}
 #home .home-command-center{grid-template-columns:1fr}
 #home .home-command-side{display:none}
 #home .home-command-main{padding:14px}
 #home .home-command-main h2{font-size:21px}
 #home .home-command-main p{font-size:13px;line-height:1.45}
 #home .home-primary-actions{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:11px}
 #home .home-primary-actions button{min-height:72px;padding:10px 8px;border-radius:13px}
 #home .home-primary-actions strong{font-size:21px}
 #home .home-primary-actions span{font-size:12px}
 #home .home-secondary-actions{gap:4px}
 #home .home-bmi-card{grid-template-columns:minmax(0,1fr) minmax(92px,.55fr);gap:10px;padding:13px}
 #home .home-bmi-summary p{font-size:11px}
 #home .home-bmi-scale{grid-column:1/-1}
 #home .home-bmi-note{grid-column:1/-1}
 #home .metric-panel{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
 #home .metric-kpi{padding:11px}
 #home .metric-kpi b{font-size:20px}
 #home #homeMissingInfoCard{align-items:flex-start!important;flex-direction:column;padding:13px!important;gap:10px!important}
 #home #homeMissingInfoCard .btn{width:100%}
 #home .msa-backup-prompt .row{display:grid;grid-template-columns:1fr}
 #home .msa-backup-prompt .row button{width:100%}
}
@media(max-width:380px){
 #home .home-profile-actions{flex-direction:column}
 #home .home-bmi-card{grid-template-columns:1fr}
 #home .home-bmi-figure-area{min-height:100px}
}
@media(prefers-reduced-motion:reduce){#home .home-primary-actions button{transition:none}}
`;
document.head.appendChild(homePolish);

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(iniciar,500)});else setTimeout(iniciar,500);
})();
