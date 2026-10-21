/* Minha Saúde IA — mais 4 recursos (V6.63)
 * 1 aviso na hora do remédio com “✅ Tomei” e “⏰ Lembrar em 15 min”
 * 3 resumo de 1 página para levar ao médico (tudo desde a última consulta + perguntas)
 * 4 link “só leitura” para a família acompanhar (os dados vão dentro do próprio link, não passam por servidor)
 * 5 anotar falando (sintoma em 1 frase e ditado nos campos de texto)
 * Usa as funções e chaves que já existem; não altera o formato dos dados.
 */
(function(){
'use strict';
if(window.__saudePlus)return;window.__saudePlus=true;
function $(id){return document.getElementById(id)}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function lista(k){try{return (typeof get==='function'&&typeof K!=='undefined')?(get(K[k])||[]):[]}catch(e){return[]}}
function hoje(){try{return hojeLocal()}catch(e){return new Date().toISOString().slice(0,10)}}
function br(iso){var s=String(iso||'').slice(0,10).split('-');return s.length===3?s[2]+'/'+s[1]+'/'+s[0]:String(iso||'')}
function toast(msg,acao,rotulo){var c=document.createElement('div');c.className='sf-toast';c.setAttribute('role','status');c.innerHTML='<b>'+msg+'</b>'+(acao?'<button type="button" data-sp-toast>'+rotulo+'</button>':'');document.body.appendChild(c);if(acao)c.querySelector('[data-sp-toast]').onclick=function(){c.remove();acao()};setTimeout(function(){c.remove()},8000)}
function ls(k,v){try{if(v===undefined)return localStorage.getItem('msaPlus_'+k);if(v===null)localStorage.removeItem('msaPlus_'+k);else localStorage.setItem('msaPlus_'+k,v)}catch(e){return null}}

/* ================= 1) aviso na hora do remédio ================= */
function podeNotificar(){return 'Notification' in window&&Notification.permission==='granted'}
function avisoRemedio(m,adiado){
 var titulo='💊 Hora do remédio'+(adiado?' (lembrete de novo)':''),corpo=m.nome+(m.dose?' — '+m.dose:'')+(m.hora?' · '+m.hora:'');
 if(podeNotificar()&&navigator.serviceWorker&&navigator.serviceWorker.ready){
  navigator.serviceWorker.ready.then(function(reg){return reg.showNotification(titulo,{body:corpo,tag:'msa-remedio-'+m.id,renotify:true,requireInteraction:true,data:{id:m.id},actions:[{action:'tomei',title:'✅ Tomei'},{action:'adiar',title:'⏰ Lembrar em 15 min'}]})}).catch(function(){try{new Notification(titulo,{body:corpo})}catch(e){}});
 }else if(podeNotificar()){try{new Notification(titulo,{body:corpo})}catch(e){}}
 /* dentro do app aparece também, com os mesmos botões */
 var c=document.createElement('div');c.className='sf-toast sp-remedio';c.setAttribute('role','alert');
 c.innerHTML='<b>'+titulo+'</b><span>'+esc(corpo)+'</span><div class="sp-remedio-acoes"><button type="button" data-a="tomei">✅ Tomei</button><button type="button" data-a="adiar">⏰ Lembrar em 15 min</button></div>';
 document.body.appendChild(c);
 c.addEventListener('click',function(e){var b=e.target.closest('[data-a]');if(!b)return;c.remove();if(b.dataset.a==='tomei')tomei(m.id);else adiar(m.id)});
}
function tomei(id){var hj=hoje(),ja=lista('medTaken').some(function(t){return String(t.medId)===String(id)&&String(t.data).slice(0,10)===hj});
 if(!ja&&typeof window.confirmarDose==='function'){var med=lista('medRot').filter(function(x){return String(x.id)===String(id)})[0];window.confirmarDose(med?med.id:id)}
 else if(ja)toast('✅ Esta dose de hoje já estava marcada.');}
function adiar(id){var a={};try{a=JSON.parse(ls('adiados')||'{}')}catch(e){}a[id]=Date.now()+15*60000;ls('adiados',JSON.stringify(a));toast('⏰ Combinado! Aviso de novo em 15 minutos.')}
function checar(){
 var agora=new Date(),hm=agora.toTimeString().slice(0,5),hj=hoje(),meds=lista('medRot'),tomados=lista('medTaken');
 meds.forEach(function(m){
  if(!m||!m.hora||m.hora!==hm)return;
  var chave='msa2_alerta_'+m.id+'_'+hj+'_'+hm;
  try{if(window.msaStorage&&window.msaStorage.getItem(chave))return;if(window.msaStorage)window.msaStorage.setItem(chave,'1')}catch(e){}
  if(tomados.some(function(t){return String(t.medId)===String(m.id)&&String(t.data).slice(0,10)===hj}))return;
  avisoRemedio(m,false);
 });
 var a={};try{a=JSON.parse(ls('adiados')||'{}')}catch(e){}var mudou=false;
 Object.keys(a).forEach(function(id){if(Date.now()>=a[id]){delete a[id];mudou=true;var m=meds.filter(function(x){return String(x.id)===String(id)})[0];if(m)avisoRemedio(m,true)}});
 if(mudou)ls('adiados',JSON.stringify(a));
}
/* respostas vindas da notificação (o service worker abre o app com ?dose= ou ?adiar=) */
function lerAcaoDaNotificacao(){var q=new URLSearchParams(location.search),d=q.get('dose'),ad=q.get('adiar');if(d){tomei(d);limparParam(['dose'])}if(ad){adiar(ad);limparParam(['adiar'])}}
function limparParam(nomes){try{var u=new URL(location.href);nomes.forEach(function(n){u.searchParams.delete(n)});history.replaceState({},document.title,u.toString())}catch(e){}}
if(navigator.serviceWorker)navigator.serviceWorker.addEventListener('message',function(e){var d=e.data||{};if(d.tipo==='msa-remedio'){if(d.acao==='tomei')tomei(d.id);else if(d.acao==='adiar')adiar(d.id)}});
function cartaoAvisos(){
 var h=$('sfHoje');if(!h||h.querySelector('.sp-ativar'))return;if(!lista('medRot').length)return;
 if(!('Notification' in window))return;var on=Notification.permission==='granted';
 var c=document.createElement('div');c.className='sp-ativar';
 c.innerHTML=on?'<span>🔔 Avisos dos remédios <b>ligados</b> neste aparelho.</span>':'<span>🔔 Quer um aviso no celular na hora de cada remédio?</span><button type="button" data-sp="ativar">Ativar avisos</button>';
 h.appendChild(c);
}

/* ================= 3) resumo de 1 página para o médico ================= */
function ultimaConsulta(){var hj=hoje();var c=lista('c').filter(function(x){return x&&x.data&&String(x.data).slice(0,10)<hj}).sort(function(a,b){return String(b.data).localeCompare(String(a.data))});return c[0]||null}
function resumoMedico(){
 var p=lista('p')[0]||{},uc=ultimaConsulta(),desde=uc?String(uc.data).slice(0,10):'';
 var depois=function(d){return !desde||String(d||'').slice(0,10)>=desde};
 var sint=lista('d').filter(function(x){return depois(x.data)}).sort(function(a,b){return String(b.data).localeCompare(String(a.data))}).slice(0,8);
 var medsNovos=lista('m').filter(function(x){return depois(x.inicio)});
 var medsRot=lista('medRot');
 var vit=lista('v').filter(function(x){return depois(x.data)}).sort(function(a,b){return String(b.data).localeCompare(String(a.data))}).slice(0,5);
 var ex=lista('e').filter(function(x){return depois(x.data)}).slice(0,6);
 var perg=[];try{if(typeof window.perguntasConsulta==='function'){window.perguntasConsulta();perg=[].slice.call(document.querySelectorAll('#perguntasGeradas ol li')).map(function(li){return li.textContent.trim()}).slice(0,6)}}catch(e){}
 var linha=function(t){return '<li>'+t+'</li>'};
 var html='<div class="mpp-folha"><div class="mpp-marca">🩺 Minha Saúde IA</div><h1>📋 Resumo para a consulta</h1><div class="mpp-meta">👤 <b>'+esc(p.nome||'')+'</b>'+(p.nasc?' · 🎂 '+esc(br(p.nasc)):'')+(p.sangue?' · 🩸 '+esc(p.sangue):'')+' · 📅 '+esc(new Date().toLocaleDateString('pt-BR'))+'</div>'+
  '<p class="mpp-desde">'+(uc?'Tudo o que mudou desde a última consulta: <b>'+esc(br(uc.data))+'</b> ('+esc(uc.esp||uc.med||'consulta')+')':'Primeiro resumo: mostrando os registros mais recentes.')+'</p>'+
  '<div class="mpp-duas"><div><h2>🚨 Alergias</h2><p>'+esc(p.alerg||'Não informado')+'</p></div><div><h2>🩺 Condições</h2><p>'+esc(p.cond||'Não informado')+'</p></div></div>'+
  '<h2>🤒 Sintomas</h2>'+(sint.length?'<ul>'+sint.map(function(x){return linha('<b>'+esc(br(x.data))+'</b> · '+esc(x.local||'')+(x.int!=null?' · '+esc(x.int)+'/10':'')+(x.obs?' · '+esc(x.obs):''))}).join('')+'</ul>':'<p class="mpp-vazio">Nenhum sintoma anotado no período.</p>')+
  '<h2>💊 Remédios em uso</h2>'+((medsRot.length||medsNovos.length)?'<ul>'+medsRot.map(function(x){return linha('<b>'+esc(x.nome)+'</b>'+(x.dose?' · '+esc(x.dose):'')+(x.hora?' · '+esc(x.hora):''))}).concat(medsNovos.map(function(x){return linha('<b>'+esc(x.nome)+'</b> 🆕 (começou em '+esc(br(x.inicio))+')'+(x.dose?' · '+esc(x.dose):''))})).join('')+'</ul>':'<p class="mpp-vazio">Nenhum remédio cadastrado.</p>')+
  '<h2>❤️ Pressão, açúcar e outros</h2>'+(vit.length?'<ul>'+vit.map(function(x){var v=[];if(x.pressao)v.push('Pressão '+x.pressao);if(x.glic)v.push('Açúcar '+x.glic);if(x.fc)v.push('Batimentos '+x.fc);if(x.peso)v.push('Peso '+x.peso);if(x.temp)v.push('Temp. '+x.temp);if(x.sat)v.push('Saturação '+x.sat);return linha('<b>'+esc(br(x.data))+'</b> · '+esc(v.join(' · ')))}).join('')+'</ul>':'<p class="mpp-vazio">Nenhuma medição no período.</p>')+
  '<h2>🧪 Exames</h2>'+(ex.length?'<ul>'+ex.map(function(x){return linha('<b>'+esc(x.nome)+'</b> · '+esc(br(x.data))+(x.res?' · '+esc(x.res):''))}).join('')+'</ul>':'<p class="mpp-vazio">Nenhum exame no período.</p>')+
  (perg.length?'<h2>❓ Minhas perguntas</h2><ol>'+perg.map(function(q){return '<li>'+esc(q)+'<div class="mpp-linhas"><span></span></div></li>'}).join('')+'</ol>':'')+
  '<h2>📝 Anotações da consulta</h2><div class="mpp-linhas mpp-grandes"><span></span><span></span><span></span></div><p class="mpp-rodape">Resumo feito a partir dos registros do próprio paciente. Não substitui a avaliação profissional.</p></div>';
 imprimir(html,'Resumo para a consulta'+(p.nome?' - '+p.nome:''));
}
function imprimir(html,titulo){
 ['spPrint','spPrintCss'].forEach(function(id){var o=$(id);if(o)o.remove()});
 var root=document.createElement('div');root.id='spPrint';root.innerHTML=html;
 var css=document.createElement('style');css.id='spPrintCss';
 css.textContent='#spPrint{position:fixed;inset:0;z-index:99999;overflow:auto;background:#fff;color:#111;padding:16px;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif}.mpp-folha{max-width:760px;margin:0 auto;font-size:12.5px;line-height:1.4}.mpp-marca{color:#1d4ed8;font-weight:900}.mpp-folha h1{font-size:20px;margin:4px 0}.mpp-folha h2{font-size:13.5px;margin:12px 0 4px;padding:4px 8px;background:#eff6ff;border-left:4px solid #2563eb;border-radius:4px}.mpp-meta{color:#334155;margin-bottom:6px}.mpp-desde{margin:4px 0 6px;padding:6px 8px;background:#f0fdf4;border-radius:6px}.mpp-duas{display:grid;grid-template-columns:1fr 1fr;gap:10px}.mpp-duas p{margin:2px 0}.mpp-folha ul,.mpp-folha ol{margin:2px 0;padding-left:20px}.mpp-folha li{margin:1px 0}.mpp-vazio{color:#64748b;font-style:italic;margin:2px 0}.mpp-linhas span{display:block;border-bottom:1px solid #cbd5e1;height:18px}.mpp-grandes span{height:24px}.mpp-rodape{margin-top:10px;color:#64748b;font-size:10.5px}@media print{body>*:not(#spPrint){display:none!important}#spPrint{position:static!important;overflow:visible!important;padding:8mm!important}@page{size:A4;margin:8mm}}@media screen{#spPrint:before{content:"Abrindo a impressão… para guardar, escolha “Salvar como PDF”. Toque aqui para voltar.";display:block;max-width:760px;margin:0 auto 10px;color:#1d4ed8;font-weight:800}}';
 document.head.appendChild(css);document.body.appendChild(root);
 var t0=document.title;document.title=titulo;var feito=false;
 function limpar(){if(feito)return;feito=true;root.remove();css.remove();document.title=t0}
 window.addEventListener('afterprint',limpar,{once:true});root.addEventListener('click',limpar);
 try{window.print()}catch(e){limpar()}
}

/* ================= 4) link “só leitura” para a família ================= */
function b64url(bytes){var s='';for(var i=0;i<bytes.length;i++)s+=String.fromCharCode(bytes[i]);return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}
function deb64url(t){t=t.replace(/-/g,'+').replace(/_/g,'/');while(t.length%4)t+='=';var s=atob(t),u=new Uint8Array(s.length);for(var i=0;i<s.length;i++)u[i]=s.charCodeAt(i);return u}
function comprimir(txt){var bytes=new TextEncoder().encode(txt);if(typeof CompressionStream==='undefined')return Promise.resolve('j.'+b64url(bytes));return new Response(new Blob([bytes]).stream().pipeThrough(new CompressionStream('gzip'))).arrayBuffer().then(function(b){return 'g.'+b64url(new Uint8Array(b))})}
function descomprimir(t){var tipo=t.slice(0,2),bytes=deb64url(t.slice(2));if(tipo==='j.')return Promise.resolve(new TextDecoder().decode(bytes));return new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).text()}
function fotoParaFamilia(){
 var p=lista('p')[0]||{},hj=hoje(),lim=new Date();lim.setDate(lim.getDate()-7);var desde=lim.toISOString().slice(0,10);
 var tom=lista('medTaken').filter(function(t){return String(t.data).slice(0,10)>=desde});
 return {v:1,em:new Date().toISOString(),nome:p.nome||'',sangue:p.sangue||'',alerg:p.alerg||'',cond:p.cond||'',emerg:[p.emerg,p.tel].filter(Boolean).join(' — '),
  remedios:lista('medRot').map(function(m){return {n:m.nome,d:m.dose||'',h:m.hora||'',hoje:tom.some(function(t){return String(t.medId)===String(m.id)&&String(t.data).slice(0,10)===hj}),sem:tom.filter(function(t){return String(t.medId)===String(m.id)}).length}}),
  sintomas:lista('d').filter(function(x){return String(x.data||'').slice(0,10)>=desde}).sort(function(a,b){return String(b.data).localeCompare(String(a.data))}).slice(0,10).map(function(x){return {d:x.data,l:x.local,i:x.int,o:x.obs||''}}),
  vitais:lista('v').sort(function(a,b){return String(b.data).localeCompare(String(a.data))}).slice(0,3).map(function(x){return {d:x.data,p:x.pressao||'',g:x.glic||'',f:x.fc||''}}),
  consultas:lista('c').filter(function(x){return String(x.data||'').slice(0,10)>=hj}).slice(0,3).map(function(x){return {d:x.data,e:x.esp||x.med||''}})};
}
function gerarLinkFamilia(){
 var dados=fotoParaFamilia();
 if(!window.confirm('Este link leva um resumo de saúde (remédios, sintomas dos últimos 7 dias, pressão e próximas consultas) DENTRO dele.\n\nQuem tiver o link consegue ver, só ver. Ele não passa por nenhum servidor e mostra a situação de AGORA: para atualizar, gere um novo.\n\nEnviar só para pessoas de confiança. Continuar?'))return;
 comprimir(JSON.stringify(dados)).then(function(cod){
  var url=location.origin+location.pathname+'#ver='+cod;
  var texto='👀 Acompanhe minha saúde (só leitura), atualizado em '+new Date().toLocaleString('pt-BR')+':\n'+url;
  var abrir=function(){var a=document.createElement('a');a.href='https://wa.me/?text='+encodeURIComponent(texto);a.target='_blank';a.rel='noopener noreferrer';document.body.appendChild(a);a.click();a.remove()};
  if(navigator.share){navigator.share({title:'Minha saúde (só leitura)',text:texto}).catch(function(){})}else abrir();
  try{navigator.clipboard&&navigator.clipboard.writeText(url)}catch(e){}
  toast('🔗 Link criado e copiado! Mande para quem cuida de você.',abrir,'📲 Mandar no WhatsApp');
 });
}
function mostrarVisualizacao(){
 var m=/#ver=([A-Za-z0-9._-]+)/.exec(location.hash);if(!m)return false;
 document.documentElement.classList.add('sp-modo-leitura');
 var box=document.createElement('div');box.id='spLeitura';box.className='sp-leitura';box.innerHTML='<p>Carregando…</p>';document.body.appendChild(box);
 descomprimir(m[1]).then(function(t){var d=JSON.parse(t);
  var quando=new Date(d.em),dias=Math.floor((Date.now()-quando)/86400000);
  box.innerHTML='<div class="sp-leitura-in"><div class="sp-faixa">👀 <b>Só leitura</b> · informações de '+esc(quando.toLocaleString('pt-BR'))+(dias>=2?' <span class="sp-velho">(faz '+dias+' dias — peça um link novo)</span>':'')+'</div>'+
   '<h1>🩺 Saúde de '+esc(d.nome||'(sem nome)')+'</h1><div class="sp-cartoes"><div>🩸 <b>Tipo sanguíneo</b><br>'+esc(d.sangue||'—')+'</div><div>🚨 <b>Alergias</b><br>'+esc(d.alerg||'—')+'</div><div>🩺 <b>Condições</b><br>'+esc(d.cond||'—')+'</div><div>🆘 <b>Emergência</b><br>'+esc(d.emerg||'—')+'</div></div>'+
   '<h2>💊 Remédios</h2>'+(d.remedios.length?'<ul>'+d.remedios.map(function(r){return '<li class="'+(r.hoje?'ok':'')+'"><b>'+esc(r.n)+'</b> '+esc(r.d)+(r.h?' · '+esc(r.h):'')+'<span>'+(r.hoje?'✅ tomou hoje':'⏳ ainda não marcou hoje')+' · '+r.sem+'x nos últimos 7 dias</span></li>'}).join('')+'</ul>':'<p>Nenhum remédio de rotina.</p>')+
   '<h2>🤒 Sintomas (7 dias)</h2>'+(d.sintomas.length?'<ul>'+d.sintomas.map(function(s){return '<li><b>'+esc(br(s.d))+'</b> · '+esc(s.l||'')+(s.i!=null?' · '+esc(s.i)+'/10':'')+(s.o?' · '+esc(s.o):'')+'</li>'}).join('')+'</ul>':'<p>Nenhum sintoma anotado. 🙂</p>')+
   (d.vitais.length?'<h2>❤️ Últimas medições</h2><ul>'+d.vitais.map(function(v){return '<li><b>'+esc(br(v.d))+'</b>'+(v.p?' · Pressão '+esc(v.p):'')+(v.g?' · Açúcar '+esc(v.g):'')+(v.f?' · Batimentos '+esc(v.f):'')+'</li>'}).join('')+'</ul>':'')+
   (d.consultas.length?'<h2>🩺 Próximas consultas</h2><ul>'+d.consultas.map(function(c){return '<li><b>'+esc(br(c.d))+'</b> · '+esc(c.e)+'</li>'}).join('')+'</ul>':'')+
   '<p class="sp-nota">Este resumo foi enviado pela própria pessoa pelo app Minha Saúde IA. Não substitui orientação médica.</p><button type="button" class="sp-sair" data-sp="sair-leitura">Abrir o meu próprio Minha Saúde →</button></div>';
 }).catch(function(){box.innerHTML='<div class="sp-leitura-in"><h1>😕 Link inválido</h1><p>Este link de acompanhamento não pôde ser lido. Peça um link novo.</p><button type="button" class="sp-sair" data-sp="sair-leitura">Abrir o Minha Saúde →</button></div>'});
 return true;
}
function botaoFamilia(){
 ['nfCompartilharHome','nfCompartilharExp'].forEach(function(id){var c=$(id);if(!c||c.querySelector('[data-sp="link-familia"]'))return;var ac=c.querySelector('.nf-acoes');if(!ac)return;var b=document.createElement('button');b.type='button';b.className='btn secondary';b.setAttribute('data-sp','link-familia');b.textContent='👀 Link para a família acompanhar';ac.appendChild(b)});
}

/* ================= 5) anotar falando ================= */
var SR=window.SpeechRecognition||window.webkitSpeechRecognition;
function ouvir(cb,status){
 if(!SR){alert('Este navegador não entende fala. No celular, use o Chrome (Android) ou o Safari (iPhone).');return}
 var r=new SR();r.lang='pt-BR';r.interimResults=false;r.maxAlternatives=1;
 if(status)status.textContent='🎙️ Pode falar…';
 r.onresult=function(e){var t=(e.results[0]&&e.results[0][0]&&e.results[0][0].transcript)||'';if(status)status.textContent='“'+t+'”';cb(t)};
 r.onerror=function(e){if(status)status.textContent=e.error==='not-allowed'?'🎙️ Permita o uso do microfone para falar.':'Não entendi. Toque e tente de novo.'};
 r.onend=function(){if(status&&/Pode falar/.test(status.textContent))status.textContent='Não ouvi nada. Toque e tente de novo.'};
 try{r.start()}catch(e){}
}
function sem(t){return String(t).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')}
var LOCAIS=[['cabeca','Cabeça'],['enxaqueca','Cabeça'],['pescoco','Pescoço'],['garganta','Garganta'],['peito','Peito'],['coracao','Peito'],['barriga','Barriga'],['estomago','Barriga'],['abdomen','Barriga'],['costas','Costas'],['coluna','Costas'],['lombar','Costas'],['braco','Braço'],['ombro','Ombro'],['mao','Mão'],['dedo','Mão'],['perna','Perna'],['joelho','Joelho'],['pe ','Pé'],['pe,','Pé'],['dente','Dente'],['ouvido','Ouvido'],['olho','Olho'],['febre','Corpo todo / febre'],['corpo','Corpo todo / febre']];
var NUM={zero:0,um:1,uma:1,dois:2,duas:2,tres:3,quatro:4,cinco:5,seis:6,sete:7,oito:8,nove:9,dez:10};
function entender(frase){
 var t=' '+sem(frase)+' ',r={local:'',int:null,dias:0,texto:frase};
 for(var i=0;i<LOCAIS.length;i++){if(t.indexOf(LOCAIS[i][0])>=0){r.local=LOCAIS[i][1];break}}
 var n=t.match(/(?:nota|nivel|intensidade|grau)\s+(\d{1,2}|[a-z]+)/)||t.match(/\b(\d{1,2})\s*(?:de\s*10|\/\s*10)/);
 if(n){var v=/^\d+$/.test(n[1])?Number(n[1]):NUM[n[1]];if(v!=null&&v<=10)r.int=v}
 if(r.int==null){if(/insuportavel|muito forte|pior dor|demais/.test(t))r.int=9;else if(/forte|bastante|muita/.test(t))r.int=7;else if(/media|moderad|mais ou menos/.test(t))r.int=5;else if(/fraca|leve|pouquinho|pouca/.test(t))r.int=3}
 var d=t.match(/(?:ha|faz|desde)\s+(\d+|[a-z]+)\s+dias?/);
 if(d){var dv=/^\d+$/.test(d[1])?Number(d[1]):NUM[d[1]];if(dv!=null)r.dias=dv}else if(/anteontem/.test(t))r.dias=2;else if(/ontem/.test(t))r.dias=1;else if(/semana passada|uma semana/.test(t))r.dias=7;
 return r;
}
function confirmarFala(r){
 var html='<p class="sf-passo">Entendi assim</p><h3>🎙️ “'+esc(r.texto)+'”</h3><div class="sp-entendi"><label>📍 Onde<input id="spLocal" value="'+esc(r.local)+'" placeholder="Ex.: cabeça"></label><label>📊 De 0 a 10<input id="spInt" type="number" min="0" max="10" value="'+(r.int==null?5:r.int)+'"></label><label>🕐 Há quantos dias<input id="spDias" type="number" min="0" max="365" value="'+r.dias+'"></label></div><p class="muted">Confira e corrija se precisar.</p><div class="sf-modal-acoes"><button type="button" class="sf-prim" data-sp="salvar-fala">💾 Salvar sintoma</button><button type="button" data-sp="falar-de-novo">🎙️ Falar de novo</button></div>';
 if(typeof window.__sfModal==='function')window.__sfModal(html);else modalSimples(html);
 var l=$('spLocal');if(l&&!l.value)l.focus();
}
function modalSimples(html){var o=document.querySelector('.sf-modal');if(o)o.remove();var m=document.createElement('div');m.className='sf-modal';m.setAttribute('role','dialog');m.setAttribute('aria-modal','true');m.innerHTML='<div class="sf-modal-box"><button type="button" class="sf-x" data-sp="fechar" aria-label="Fechar">✕</button>'+html+'</div>';document.body.appendChild(m)}
function salvarFala(){
 var local=($('spLocal')||{}).value||'',int=Math.max(0,Math.min(10,Number(($('spInt')||{}).value)||0)),dias=Math.max(0,Number(($('spDias')||{}).value)||0),texto=(document.querySelector('.sf-modal h3')||{}).textContent||'';
 if(!local.trim()){$('spLocal').focus();return}
 var m=document.querySelector('.sf-modal');if(m)m.remove();
 if(typeof window.go==='function')window.go('dor');
 setTimeout(function(){var f=$('dorForm');if(!f)return;var dt=new Date();dt.setDate(dt.getDate()-dias);var iso=dt.getFullYear()+'-'+String(dt.getMonth()+1).padStart(2,'0')+'-'+String(dt.getDate()).padStart(2,'0')+'T'+String(dt.getHours()).padStart(2,'0')+':'+String(dt.getMinutes()).padStart(2,'0');
  $('dLocal').value=local.trim();$('dInt').value=int;if($('dScore'))$('dScore').textContent=int;$('dData').value=iso;if($('dObs'))$('dObs').value=('Anotado falando: '+texto.replace(/^🎙️\s*/,'')).trim();
  if(f.requestSubmit)f.requestSubmit();else f.dispatchEvent(new Event('submit',{cancelable:true,bubbles:true}));
 },250);
}
function botoesFala(){
 /* no passo 1 do sintoma */
 var passo=document.querySelector('.sf-modal .sf-escolhas [data-sf-local]');
 if(passo&&!document.querySelector('.sf-modal [data-sp="falar-sintoma"]')){var b=document.createElement('button');b.type='button';b.className='sp-falar-grande';b.setAttribute('data-sp','falar-sintoma');b.innerHTML='🎙️ <b>Prefere falar?</b> Toque e diga, por exemplo: “dor de cabeça forte desde ontem”';var esc2=document.querySelector('.sf-modal .sf-escolhas');esc2.parentNode.insertBefore(b,esc2)}
 /* microfone nos campos de texto de sintomas e consultas */
 if(!SR)return;
 ['dSint','dObs','dGatilho','cMot','cPerg','cObs','cMed'].forEach(function(id){var el=$(id);if(!el||el.dataset.spMic)return;el.dataset.spMic='1';var b=document.createElement('button');b.type='button';b.className='sp-mic';b.setAttribute('aria-label','Falar em vez de digitar');b.textContent='🎙️ Falar';el.insertAdjacentElement('afterend',b);b.onclick=function(){var st=document.createElement('small');st.className='sp-mic-st';b.insertAdjacentElement('afterend',st);ouvir(function(t){el.value=(el.value?el.value+' ':'')+t;el.dispatchEvent(new Event('input',{bubbles:true}));setTimeout(function(){st.remove()},2500)},st)}});
}
new MutationObserver(function(){botoesFala()}).observe(document.body,{childList:true});

/* ================= cliques ================= */
document.addEventListener('click',function(e){
 var b=e.target.closest('[data-sp]');if(!b)return;var a=b.getAttribute('data-sp');
 if(a==='ativar'){Notification.requestPermission().then(function(p){var c=document.querySelector('.sp-ativar');if(c)c.remove();cartaoAvisos();if(p==='granted')toast('🔔 Pronto! Você vai receber um aviso na hora de cada remédio.');else toast('Os avisos ficaram desligados. Dá pra ligar depois nas configurações do navegador.')})}
 else if(a==='resumo-medico')resumoMedico();
 else if(a==='link-familia')gerarLinkFamilia();
 else if(a==='falar-sintoma'||a==='falar-de-novo'){var st=document.querySelector('.sf-modal .sp-st')||(function(){var s=document.createElement('p');s.className='sp-st';s.setAttribute('aria-live','polite');var box=document.querySelector('.sf-modal .sf-modal-box');if(box)box.appendChild(s);return s})();ouvir(function(t){confirmarFala(entender(t))},st)}
 else if(a==='salvar-fala')salvarFala();
 else if(a==='fechar'){var m=document.querySelector('.sf-modal');if(m)m.remove()}
 else if(a==='sair-leitura'){location.href=location.origin+location.pathname}
});
window.__msaEntenderFala=entender;

/* ================= juntando ================= */
function montar(){
 cartaoAvisos();botaoFamilia();botoesFala();
 var g=$('sfBotoes');if(g&&!$('spResumoBtn')){var b=document.createElement('button');b.type='button';b.id='spResumoBtn';b.className='sp-resumo-btn';b.setAttribute('data-sp','resumo-medico');b.innerHTML='🗓️ <b>Resumo para levar ao médico</b><small>Tudo desde a última consulta, em 1 página</small>';g.appendChild(b)}
 var cs=$('consultas');if(cs&&!cs.querySelector('.sp-resumo-btn')){var c=document.createElement('button');c.type='button';c.className='sp-resumo-btn';c.setAttribute('data-sp','resumo-medico');c.innerHTML='🗓️ <b>Resumo para levar ao médico</b><small>Sintomas, remédios, pressão e perguntas desde a última consulta</small>';cs.insertBefore(c,cs.firstChild)}
}
var css=document.createElement('style');css.id='msa-saude-plus';
css.textContent='.sp-remedio{gap:6px}.sp-remedio span{font-size:15px}.sp-remedio-acoes{display:grid;grid-template-columns:1fr 1fr;gap:8px}.sp-remedio-acoes button{min-height:48px;border-radius:12px;border:0;font:inherit;font-weight:900;cursor:pointer;background:#22c55e;color:#052e16}.sp-remedio-acoes button+button{background:#e2e8f0;color:#0f172a}'+
 '.sp-ativar{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-top:10px;padding:10px 12px;border-radius:12px;background:#fffbeb;border:1px dashed #fcd34d;font-size:14.5px}.sp-ativar button{min-height:44px;padding:6px 14px;border-radius:12px;border:0;background:#f59e0b;color:#111;font:inherit;font-weight:900;cursor:pointer}'+
 '.sp-resumo-btn{display:flex;flex-direction:column;align-items:flex-start;gap:2px;width:100%;margin:0 0 14px;padding:14px 16px;border-radius:16px;border:2px solid #2563eb;background:#eff6ff;color:#1e3a8a;font:inherit;text-align:left;cursor:pointer}.sp-resumo-btn b{font-size:16px}.sp-resumo-btn small{font-size:13px;color:#1e40af}'+
 '.sp-falar-grande{display:block;width:100%;margin:6px 0 12px;padding:14px;border-radius:14px;border:2px dashed #7c3aed;background:#f5f3ff;color:#4c1d95;font:inherit;font-size:15px;text-align:left;cursor:pointer}.sp-st{margin:10px 0 0;font-weight:800;color:#4c1d95}'+
 '.sp-entendi{display:grid;gap:10px}.sp-entendi label{font-weight:800}.sp-entendi input{display:block;width:100%;box-sizing:border-box;min-height:48px;margin-top:4px;padding:8px 10px;border-radius:12px;border:1px solid #cbd5e1;font:inherit;font-size:16px}'+
 '.sp-mic{display:inline-flex;align-items:center;min-height:40px;margin:4px 0 8px;padding:4px 12px;border-radius:999px;border:1px solid #c4b5fd;background:#f5f3ff;color:#5b21b6;font:inherit;font-weight:800;font-size:14px;cursor:pointer}.sp-mic-st{display:block;margin:-4px 0 8px;color:#5b21b6;font-weight:700}'+
 'html.sp-modo-leitura body>*:not(#spLeitura){display:none!important}.sp-leitura{min-height:100vh;background:#f8fafc;color:#0f172a;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif}.sp-leitura-in{max-width:640px;margin:0 auto;padding:16px 16px 40px;font-size:16px;line-height:1.5}'+
 '.sp-faixa{padding:10px 12px;border-radius:12px;background:#ecfeff;border:1px solid #a5f3fc;font-size:14px}.sp-velho{color:#b45309;font-weight:800}.sp-leitura h1{font-size:24px;margin:14px 0 10px}.sp-leitura h2{font-size:18px;margin:18px 0 6px}'+
 '.sp-cartoes{display:grid;grid-template-columns:1fr 1fr;gap:8px}.sp-cartoes>div{padding:10px 12px;border-radius:12px;background:#fff;border:1px solid #e2e8f0;font-size:15px}.sp-leitura ul{list-style:none;margin:0;padding:0;display:grid;gap:6px}.sp-leitura li{padding:10px 12px;border-radius:12px;background:#fff;border:1px solid #e2e8f0}.sp-leitura li span{display:block;font-size:14px;color:#475569}.sp-leitura li.ok{background:#f0fdf4;border-color:#bbf7d0}'+
 '.sp-nota{margin-top:18px;font-size:13px;color:#64748b}.sp-sair{width:100%;min-height:50px;margin-top:8px;border-radius:14px;border:0;background:#2563eb;color:#fff;font:inherit;font-weight:900;font-size:16px;cursor:pointer}'+
 'body.msa-dark .sp-resumo-btn{background:#172554;color:#dbeafe;border-color:#3b82f6}body.msa-dark .sp-resumo-btn small{color:#bfdbfe}body.msa-dark .sp-ativar{background:#3b2a0c;border-color:#b45309}body.msa-dark .sp-falar-grande,body.msa-dark .sp-mic{background:#2e1065;color:#ddd6fe;border-color:#6d28d9}'+
 '@media print{.sp-resumo-btn,.sp-ativar,.sp-mic{display:none!important}}';
document.head.appendChild(css);
var lendo=mostrarVisualizacao();
function iniciar(){if(lendo)return;lerAcaoDaNotificacao();montar();setInterval(checar,5000);checar();
 if(typeof window.go==='function'&&!window.go.__sp){var o=window.go;window.go=function(){var r=o.apply(this,arguments);setTimeout(montar,80);return r};window.go.__sp=true}
 if(typeof window.renderNovosModulos==='function'&&!window.renderNovosModulos.__sp){var rn=window.renderNovosModulos;window.renderNovosModulos=function(){var r=rn.apply(this,arguments);setTimeout(montar,120);return r};window.renderNovosModulos.__sp=true}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(iniciar,400)});else setTimeout(iniciar,400);
})();
