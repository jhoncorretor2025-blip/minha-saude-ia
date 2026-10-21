/* Minha Saúde IA — mais fácil para quem não tem prática com tecnologia (V6.62)
 * 1 Início com 4 botões grandes · 2 “Hoje” (remédios e consultas) · 3 Voltar + Você está em
 * 4 “Estou cuidando de” · 5 menu simples com 4 opções · 6 “?” em cada tela · 7 palavras do dia a dia
 * 8 anotar sintoma em passos · 9 letra maior e alto contraste · 10 botão de emergência sempre à mão
 * Só acrescenta: usa as funções e os formulários que já existem para salvar.
 */
(function(){
'use strict';
if(window.__saudeFacil)return;window.__saudeFacil=true;
function $(id){return document.getElementById(id)}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function lista(k){try{return (typeof get==='function'&&typeof K!=='undefined')?(get(K[k])||[]):[]}catch(e){return[]}}
function hoje(){try{return typeof hojeLocal==='function'?hojeLocal():new Date().toISOString().slice(0,10)}catch(e){return new Date().toISOString().slice(0,10)}}
function amanha(){var d=new Date();d.setDate(d.getDate()+1);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function atual(){var s=document.querySelector('main section.active, section.active');return s?s.id:'home'}
function ir(id){if(typeof window.go==='function')window.go(id);window.scrollTo({top:0,behavior:'smooth'})}
function ui(k,v){try{if(v===undefined)return localStorage.getItem('msaFacil_'+k);localStorage.setItem('msaFacil_'+k,v)}catch(e){return null}}

/* ---------- nomes, explicações e palavras simples ---------- */
var PAG={
 home:['🏠','Início','Resumo da sua saúde e atalhos para o que você mais usa.'],
 dor:['🤒','Como estou me sentindo','Anote uma dor ou sintoma: onde é, quanto dói e desde quando.'],
 meds:['💊','Meus remédios','Remédios e vitaminas que você toma, com dose e horário.'],
 consultas:['🩺','Minhas consultas','Consultas que você fez ou vai fazer, com o que o médico disse.'],
 exames:['🧪','Meus exames','Resultados de exames de sangue, imagem e outros.'],
 acompanhamento:['❤️','Pressão, açúcar e batimentos','Anote sua pressão, glicose (açúcar no sangue), peso e batimentos.'],
 perfil:['👤','Meus dados','Seus dados pessoais: nome, idade, peso, alergias e contato de emergência.'],
 carteirinha:['🪪','Minha carteirinha','Um resumo para mostrar no médico ou numa emergência.'],
 lembretes:['⏰','Lembretes','Avisos de remédios, consultas e exames.'],
 calendario:['📅','Calendário','Suas consultas, exames e lembretes por dia.'],
 timeline:['🕐','Linha do tempo','Tudo o que você anotou, em ordem de data.'],
 familiares:['👨‍👩‍👧','Família','Fichas das pessoas que você cuida: pais, filhos, cônjuge.'],
 familia:['🧬','Doenças na família','Doenças que existem na sua família (pais, avós, irmãos).'],
 parceiro:['💑','Meu círculo de saúde','Pessoas próximas e seus relacionamentos.'],
 documentos:['📄','Documentos','Guarde fotos e arquivos de receitas, laudos e exames.'],
 exportar:['📤','Guardar ou enviar minha ficha','Salve sua ficha em PDF ou mande para alguém de confiança.'],
 backup:['💾','Cópia de segurança','Guarde uma cópia dos seus dados para não perder nada.'],
 'perguntas-saude':['💬','Perguntar à IA','Escolha uma pergunta e a IA responde com base nos seus dados.'],
 ia:['🤖','Assistente de IA','Use o ChatGPT ou Gemini para preencher e entender sua ficha.'],
 importar:['⚡','Preencher com a IA','A IA organiza seus dados e você só confere antes de salvar.'],
 perguntas:['❓','Preparar consulta','Perguntas prontas para levar ao médico.'],
 configuracoes:['⚙️','Configurações','Aparência, IAs que você usa e outras opções.'],
 avisos:['🔔','Avisos','Coisas que merecem sua atenção.'],relatorios:['📊','Relatórios','Resumos para imprimir ou mostrar.'],
 inteligencia:['🧠','Inteligência','Padrões que o app encontrou nos seus registros.'],nutricao:['🥗','Alimentação','O que você come e bebe.'],sono:['😴','Sono','Como você está dormindo.']
};
var SIMPLES={acompanhamento:'❤️ Pressão, açúcar e batimentos',exportar:'📤 Guardar ou enviar minha ficha',backup:'💾 Cópia de segurança',dor:'🤒 Como estou me sentindo',perfil:'👤 Meus dados',familia:'🧬 Doenças na família'};
function infoDe(id){return PAG[id]||['📄',id,'']}
function aplicarPalavras(){
 document.querySelectorAll('#nav [data-tab], #msaMobileDrawer [data-tab], .msa-mobile-drawer [data-tab]').forEach(function(b){var id=b.getAttribute('data-tab');if(SIMPLES[id]&&!b.dataset.sfOrig&&!b.children.length){b.dataset.sfOrig=b.textContent;b.textContent=SIMPLES[id]}});
 var ex=$('exportar');
 if(ex&&!ex.querySelector('.sf-avancado')){var h=[].slice.call(ex.querySelectorAll('h2,h3')).filter(function(x){return /FHIR/.test(x.textContent)})[0];var card=h&&h.closest('.card');
  if(card){var det=document.createElement('details');det.className='sf-avancado card';det.innerHTML='<summary>⚙️ Avançado (para profissionais e sistemas)</summary>';card.parentNode.insertBefore(det,card);det.appendChild(card)}}
}

/* ---------- 3, 6, 10) barra do topo ---------- */
var pilha=[];
function montarTopo(){
 var main=$('main-content');if(!main||$('sfTopo'))return;
 var t=document.createElement('div');t.id='sfTopo';t.className='sf-topo';
 t.innerHTML='<button type="button" class="sf-voltar" id="sfVoltar" aria-label="Voltar para a tela anterior">← Voltar</button><div class="sf-aqui"><small>Você está em</small><b id="sfAqui"></b></div><button type="button" class="sf-tema" id="sfTema" aria-label="Trocar entre tema claro e escuro">🌙</button><button type="button" class="sf-q" id="sfAjuda" aria-expanded="false" aria-controls="sfAjudaBox" aria-label="O que é esta tela?">?</button><button type="button" class="sf-sos" id="sfSOS" aria-label="Emergência: mostrar meus dados essenciais">🆘</button>';
 var box=document.createElement('div');box.id='sfAjudaBox';box.className='sf-ajuda';box.hidden=true;
 main.insertBefore(box,main.firstChild);main.insertBefore(t,main.firstChild);
 $('sfVoltar').onclick=function(){pilha.pop();ir(pilha.pop()||'home')};
 $('sfAjuda').onclick=function(){var ab=!box.hidden;box.hidden=ab;this.setAttribute('aria-expanded',String(!ab));if(!ab)ajuda()};
 $('sfSOS').onclick=emergencia;
 $('sfTema').onclick=function(){var t=$('msaThemeToggle');if(t)t.click()};
}
function ajuda(){var i=infoDe(atual());$('sfAjudaBox').innerHTML='<b>'+i[0]+' '+esc(i[1])+'</b><p>'+esc(i[2]||'Use os botões desta tela para anotar e ver suas informações.')+'</p><div class="sf-ajuda-acoes"><button type="button" data-sf="letra">🔠 '+(document.documentElement.classList.contains('sf-letra')?'Letra normal':'Letra maior')+'</button><button type="button" data-sf="contraste">🌗 '+(document.documentElement.classList.contains('sf-contraste')?'Cores normais':'Cores mais fortes')+'</button><button type="button" data-sf="fechar">Fechar</button></div>'}
function atualizarTopo(id){var i=infoDe(id);if($('sfAqui'))$('sfAqui').textContent=i[0]+' '+i[1];if($('sfVoltar'))$('sfVoltar').hidden=(id==='home');var b=$('sfAjudaBox');if(b){b.hidden=true;$('sfAjuda').setAttribute('aria-expanded','false')}}
function emergencia(){if(typeof window.abrirModoEmergencia==='function')window.abrirModoEmergencia();else ir('carteirinha')}

/* ---------- 9) letra maior e alto contraste ---------- */
function aplicarVisao(){document.documentElement.classList.toggle('sf-letra',ui('letra')==='1');document.documentElement.classList.toggle('sf-contraste',ui('contraste')==='1')}

/* ---------- 4) estou cuidando de ---------- */
function pessoas(){var reg=[];try{reg=JSON.parse(localStorage.getItem('msa3_perfis_locais')||'[]')}catch(e){}var atualId=String(window.msaStoragePerfil||new URLSearchParams(location.search).get('perfil')||'');var eu=(lista('p')[0]||{}).nome;return {atualId:atualId,itens:[{id:'',name:'Eu'+(eu&&!atualId?' ('+eu+')':'')}].concat(reg.filter(function(x){return x&&x.id}))}}
function montarCuidando(){
 var home=$('home');if(!home||$('sfCuidando'))return;var p=pessoas();
 var w=document.createElement('div');w.id='sfCuidando';w.className='sf-cuidando';
 w.innerHTML='<label for="sfPessoa">👨‍👩‍👧 Estou cuidando da saúde de:</label><select id="sfPessoa">'+p.itens.map(function(x){return '<option value="'+esc(x.id)+'"'+(x.id===p.atualId?' selected':'')+'>'+esc(x.name)+'</option>'}).join('')+'<option value="__novo">➕ Adicionar outra pessoa…</option></select>';
 home.insertBefore(w,home.firstChild);
 $('sfPessoa').onchange=function(){var v=this.value;if(v==='__novo'){ir('perfis-locais');this.value=p.atualId;return}location.href=location.origin+location.pathname+(v?'?perfil='+encodeURIComponent(v):'')};
}

/* ---------- 1, 2) início com botões grandes e “Hoje” ---------- */
function montarInicio(){
 var home=$('home');if(!home)return;var ref=$('sfCuidando');
 if(!$('sfBotoes')){var g=document.createElement('div');g.id='sfBotoes';g.className='sf-botoes';
  g.innerHTML='<h2>O que você quer fazer hoje?</h2><div class="sf-grade"><button type="button" data-sf="sintoma"><span>🤒</span><b>Anotar como estou me sentindo</b></button><button type="button" data-sf-ir="meds"><span>💊</span><b>Meus remédios</b></button><button type="button" data-sf-ir="consultas"><span>🩺</span><b>Minhas consultas</b></button><button type="button" data-sf-ir="carteirinha"><span>🪪</span><b>Minha carteirinha</b></button></div>';
  if(ref)ref.insertAdjacentElement('afterend',g);else home.insertBefore(g,home.firstChild)}
 var h=$('sfHoje');if(!h){h=document.createElement('div');h.id='sfHoje';h.className='sf-hoje';$('sfBotoes').insertAdjacentElement('afterend',h)}
 var hj=hoje(),am=amanha(),meds=lista('medRot').filter(function(m){return m&&m.nome}).sort(function(a,b){return String(a.hora||'').localeCompare(String(b.hora||''))});
 var tomados=lista('medTaken').filter(function(t){return String(t.data||'').slice(0,10)===hj}).map(function(t){return String(t.medId)});
 var cons=lista('c').filter(function(c){var d=String(c.data||'').slice(0,10);return d===hj||d===am});
 var lem=lista('r').filter(function(r){return String(r.data||'').slice(0,10)===hj});
 var linhas=[];
 meds.forEach(function(m){var ok=tomados.indexOf(String(m.id))>=0;linhas.push('<li class="'+(ok?'ok':'')+'"><span>💊 <b>'+esc(m.nome)+'</b>'+(m.dose?' · '+esc(m.dose):'')+(m.hora?' · '+esc(m.hora):'')+'</span><button type="button" data-sf-dose="'+esc(m.id)+'" aria-pressed="'+ok+'">'+(ok?'✅ Tomei':'☐ Marcar como tomado')+'</button></li>')});
 cons.forEach(function(c){linhas.push('<li><span>🩺 <b>'+esc(c.esp||c.med||'Consulta')+'</b> · '+(String(c.data).slice(0,10)===hj?'hoje':'amanhã')+(c.hora?' às '+esc(c.hora):'')+'</span></li>')});
 lem.forEach(function(r){linhas.push('<li><span>⏰ <b>'+esc(r.nome||r.tipo||'Lembrete')+'</b>'+(String(r.data).length>10?' · '+esc(String(r.data).slice(11,16)):'')+'</span></li>')});
 h.innerHTML='<h2>📅 Hoje</h2>'+(linhas.length?'<ul>'+linhas.join('')+'</ul>':'<p class="muted">Nada marcado para hoje. Que tal cadastrar seus remédios com horário em <button type="button" class="sf-link" data-sf-ir="lembretes">⏰ Lembretes</button>?</p>');
}

/* ---------- 5) menu simples com 4 opções ---------- */
function montarMenuSimples(){
 var nav=$('nav');if(!nav||$('sfMenu'))return;
 var m=document.createElement('div');m.id='sfMenu';m.className='sf-menu';
 m.innerHTML='<button type="button" data-sf-ir="home">🏠 Minha saúde</button><button type="button" data-sf="anotar">➕ Anotar</button><button type="button" data-sf-ir="familiares">👨‍👩‍👧 Família</button><button type="button" data-sf="mais" aria-expanded="false">☰ Mais</button>';
 nav.insertBefore(m,nav.firstChild);document.body.classList.add('sf-menu-on');
}
function anotar(){
 modal('<h3>➕ O que você quer anotar?</h3><div class="sf-grade sf-grade-modal"><button type="button" data-sf="sintoma"><span>🤒</span><b>Um sintoma ou dor</b></button><button type="button" data-sf-ir="meds"><span>💊</span><b>Um remédio</b></button><button type="button" data-sf-ir="consultas"><span>🩺</span><b>Uma consulta</b></button><button type="button" data-sf-ir="acompanhamento"><span>❤️</span><b>Pressão ou açúcar</b></button><button type="button" data-sf-ir="exames"><span>🧪</span><b>Um exame</b></button><button type="button" data-sf-ir="documentos"><span>📄</span><b>Uma receita ou laudo</b></button></div>');
}

/* ---------- 8) anotar sintoma em passos ---------- */
var sint={};
function passoSintoma(n){
 var corpo;
 if(n===1){var locais=[['🧠','Cabeça'],['🦴','Pescoço'],['❤️','Peito'],['🫃','Barriga'],['🔙','Costas'],['💪','Braço'],['✋','Mão'],['🦵','Perna'],['🦶','Pé'],['🌡️','Corpo todo / febre']];
  corpo='<p class="sf-passo">Passo 1 de 3</p><h3>📍 Onde você está sentindo?</h3><div class="sf-escolhas">'+locais.map(function(l){return '<button type="button" data-sf-local="'+l[1]+'">'+l[0]+' '+l[1]+'</button>'}).join('')+'</div><label class="sf-outro">Ou escreva: <input id="sfLocalOutro" placeholder="Ex.: dente, ouvido"></label><div class="sf-modal-acoes"><button type="button" class="sf-prim" data-sf="s1ok">Continuar →</button><button type="button" data-sf="fechar-modal">Cancelar</button></div>'}
 if(n===2){corpo='<p class="sf-passo">Passo 2 de 3</p><h3>📊 De 0 a 10, quanto incomoda?</h3><p class="muted">0 = nada · 10 = a pior dor que você já sentiu</p><div class="sf-nota">'+[0,1,2,3,4,5,6,7,8,9,10].map(function(i){return '<button type="button" data-sf-int="'+i+'" style="--c:'+(i<4?'#16a34a':i<7?'#d97706':'#dc2626')+'">'+i+'</button>'}).join('')+'</div><div class="sf-modal-acoes"><button type="button" data-sf="voltar1">← Voltar</button></div>'}
 if(n===3){corpo='<p class="sf-passo">Passo 3 de 3</p><h3>🕐 Desde quando?</h3><div class="sf-escolhas"><button type="button" data-sf-quando="0">Agora há pouco</button><button type="button" data-sf-quando="hojecedo">Hoje mais cedo</button><button type="button" data-sf-quando="1">Desde ontem</button><button type="button" data-sf-quando="3">Faz alguns dias</button></div><label class="sf-outro">Quer contar mais alguma coisa? (opcional)<textarea id="sfObs" placeholder="Ex.: piora quando ando, tive febre"></textarea></label><div class="sf-modal-acoes"><button type="button" data-sf="voltar2">← Voltar</button></div>'}
 modal(corpo);
}
function dataLocal(dt){return dt.getFullYear()+'-'+String(dt.getMonth()+1).padStart(2,'0')+'-'+String(dt.getDate()).padStart(2,'0')+'T'+String(dt.getHours()).padStart(2,'0')+':'+String(dt.getMinutes()).padStart(2,'0')}
function salvarSintoma(quando){
 var dt=new Date();if(quando==='hojecedo')dt.setHours(Math.max(0,dt.getHours()-4));else dt.setDate(dt.getDate()-Number(quando||0));
 var obs=($('sfObs')||{}).value||'';fecharModal();ir('dor');
 setTimeout(function(){
  var f=$('dorForm');if(!f){alert('Não encontrei o formulário de sintomas.');return}
  $('dLocal').value=sint.local;$('dInt').value=sint.int;if($('dScore'))$('dScore').textContent=sint.int;$('dData').value=dataLocal(dt);if($('dObs')&&obs)$('dObs').value=obs;
  if(f.requestSubmit)f.requestSubmit();else f.dispatchEvent(new Event('submit',{cancelable:true,bubbles:true}));
  setTimeout(function(){proximo('✅ Sintoma anotado!','Quer perguntar à IA o que pode ser?','perguntas-saude')},400);
 },250);
}
function proximo(titulo,txt,dest){var c=document.createElement('div');c.className='sf-toast';c.setAttribute('role','status');c.innerHTML='<b>'+titulo+'</b>'+(dest?'<button type="button" data-sf-ir="'+dest+'">'+txt+' →</button>':'');document.body.appendChild(c);setTimeout(function(){c.remove()},9000)}

/* ---------- janela simples ---------- */
function modal(html){fecharModal();var m=document.createElement('div');m.className='sf-modal';m.setAttribute('role','dialog');m.setAttribute('aria-modal','true');m.innerHTML='<div class="sf-modal-box"><button type="button" class="sf-x" data-sf="fechar-modal" aria-label="Fechar">✕</button>'+html+'</div>';document.body.appendChild(m);m.addEventListener('click',function(e){if(e.target===m)fecharModal()});var f=m.querySelector('.sf-modal-box button:not(.sf-x),input');if(f)try{f.focus()}catch(e){}}
function fecharModal(){var m=document.querySelector('.sf-modal');if(m)m.remove()}
document.addEventListener('keydown',function(e){if(e.key==='Escape')fecharModal()});

/* ---------- cliques ---------- */
document.addEventListener('click',function(e){
 var t=e.target.closest('[data-sf-ir]');if(t){fecharModal();ir(t.getAttribute('data-sf-ir'));return}
 var dz=e.target.closest('[data-sf-dose]');if(dz){if(typeof window.confirmarDose==='function'){var id=dz.getAttribute('data-sf-dose');var n=isNaN(Number(id))?id:Number(id);var meds=lista('medRot');var m=meds.filter(function(x){return String(x.id)===String(id)})[0];window.confirmarDose(m?m.id:n);setTimeout(montarInicio,150)}return}
 var lo=e.target.closest('[data-sf-local]');if(lo){sint.local=lo.getAttribute('data-sf-local');passoSintoma(2);return}
 var it=e.target.closest('[data-sf-int]');if(it){sint.int=it.getAttribute('data-sf-int');passoSintoma(3);return}
 var qd=e.target.closest('[data-sf-quando]');if(qd){salvarSintoma(qd.getAttribute('data-sf-quando'));return}
 var a=e.target.closest('[data-sf]');if(!a)return;var ac=a.getAttribute('data-sf');
 if(ac==='sintoma'){sint={};passoSintoma(1)}
 else if(ac==='s1ok'){var o=($('sfLocalOutro')||{}).value||'';if(!o.trim()){$('sfLocalOutro').focus();return}sint.local=o.trim();passoSintoma(2)}
 else if(ac==='voltar1')passoSintoma(1);else if(ac==='voltar2')passoSintoma(2);
 else if(ac==='fechar-modal')fecharModal();
 else if(ac==='anotar')anotar();
 else if(ac==='mais'){var on=document.body.classList.toggle('sf-menu-completo');a.setAttribute('aria-expanded',String(on));a.textContent=on?'✕ Menos':'☰ Mais'}
 else if(ac==='letra'){ui('letra',ui('letra')==='1'?'0':'1');aplicarVisao();ajuda()}
 else if(ac==='contraste'){ui('contraste',ui('contraste')==='1'?'0':'1');aplicarVisao();ajuda()}
 else if(ac==='fechar'){$('sfAjudaBox').hidden=true;$('sfAjuda').setAttribute('aria-expanded','false')}
});

/* ---------- juntando tudo ---------- */
function aoMudar(id){if(pilha[pilha.length-1]!==id)pilha.push(id);if(pilha.length>30)pilha.shift();atualizarTopo(id);if(id==='home')montarInicio();aplicarPalavras();if(document.body.classList.contains('sf-menu-completo')){document.body.classList.remove('sf-menu-completo');var mb=document.querySelector('[data-sf="mais"]');if(mb){mb.textContent='☰ Mais';mb.setAttribute('aria-expanded','false')}}}
function iniciar(){
 aplicarVisao();montarTopo();montarMenuSimples();montarCuidando();montarInicio();aplicarPalavras();
 if(typeof window.go==='function'&&!window.go.__sf){var o=window.go;window.go=function(id){var r=o.apply(this,arguments);try{aoMudar(id)}catch(e){}return r};window.go.__sf=true}
 aoMudar(atual());
 if(typeof window.renderNovosModulos==='function'&&!window.renderNovosModulos.__sf){var rn=window.renderNovosModulos;window.renderNovosModulos=function(){var r=rn.apply(this,arguments);try{if(atual()==='home')montarInicio()}catch(e){}return r};window.renderNovosModulos.__sf=true}
}
var css=document.createElement('style');css.id='msa-saude-facil';
css.textContent=
 '.sf-topo{position:sticky;top:0;z-index:60;display:flex;align-items:center;gap:8px;margin:0 0 12px;padding:8px 10px;border-radius:16px;background:var(--card,#fff);border:1px solid var(--line,#e2e8f0);box-shadow:0 4px 14px rgba(15,23,42,.06)}'+
 '.sf-voltar{min-height:44px;padding:8px 14px;border-radius:12px;border:1px solid var(--line,#e2e8f0);background:#f8fafc;color:#172033;font:inherit;font-weight:800;font-size:15px;cursor:pointer}'+
 '.sf-aqui{flex:1;min-width:0}.sf-aqui small{display:block;font-size:12px;color:#475569}.sf-aqui b{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;font-size:15px;line-height:1.2}@media(max-width:420px){.sf-aqui small{display:none}.sf-voltar{padding:8px 10px}}'+
 '.sf-q{width:44px;height:44px;border-radius:50%;border:2px solid #2563eb;background:#eff6ff;color:#1d4ed8;font:900 20px system-ui,sans-serif;cursor:pointer;flex:0 0 auto}'+
 '.sf-sos{width:48px;height:44px;border-radius:12px;border:0;background:#dc2626;color:#fff;font:900 16px system-ui,sans-serif;cursor:pointer;flex:0 0 auto;box-shadow:0 4px 12px rgba(220,38,38,.3)}'+
 '.sf-ajuda{margin:-4px 0 14px;padding:14px 16px;border-radius:14px;background:#eff6ff;border:1px solid #bfdbfe;font-size:15px;line-height:1.5}.sf-ajuda p{margin:6px 0 10px}.sf-ajuda-acoes{display:flex;flex-wrap:wrap;gap:8px}.sf-ajuda-acoes button,.sf-link{min-height:44px;padding:8px 12px;border-radius:12px;border:1px solid #bfdbfe;background:#fff;color:#1d4ed8;font:inherit;font-weight:800;cursor:pointer}'+
 '.sf-cuidando{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin:0 0 12px;padding:12px 14px;border-radius:14px;background:#f0f9ff;border:1px solid #bae6fd;font-weight:800}.sf-cuidando select{min-height:44px;font:inherit;font-size:16px;padding:6px 10px;border-radius:10px;flex:1;min-width:180px}'+
 '.sf-botoes h2,.sf-hoje h2{margin:4px 0 10px}.sf-grade{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-bottom:14px}'+
 '.sf-grade button{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;min-height:118px;padding:14px 10px;border-radius:18px;border:2px solid var(--line,#e2e8f0);background:var(--card,#fff);color:inherit;font:inherit;text-align:center;cursor:pointer}'+
 '.sf-grade button:hover,.sf-grade button:focus-visible{border-color:#2563eb}.sf-grade span{font-size:36px;line-height:1}.sf-grade b{font-size:16px;line-height:1.25}'+
 '.sf-hoje{margin:0 0 14px;padding:14px 16px;border-radius:18px;background:var(--card,#fff);border:1px solid var(--line,#e2e8f0)}.sf-hoje ul{list-style:none;margin:0;padding:0;display:grid;gap:8px}'+
 '.sf-hoje li{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px;padding:10px 12px;border-radius:12px;background:#f8fafc;font-size:15px}.sf-hoje li.ok{background:#f0fdf4}'+
 '.sf-hoje li button{min-height:44px;padding:6px 12px;border-radius:12px;border:1px solid #93c5fd;background:#fff;color:#1d4ed8;font:inherit;font-weight:800;cursor:pointer}.sf-hoje li.ok button{border-color:#86efac;color:#15803d}'+
 /* V6.71: o Início já tem o quadro “O que você quer fazer?” logo abaixo do perfil: os botões repetidos daqui somem (o resumo para o médico continua) */
 'body:has(#homeCommandCenter) #sfBotoes>h2,body:has(#homeCommandCenter) #sfBotoes>.sf-grade{display:none!important}'+
 '.sf-menu{display:none}body.sf-menu-on .sf-menu{display:flex;flex-wrap:wrap;gap:8px;padding:6px}body.sf-menu-on .sf-menu button{min-height:46px;padding:8px 16px;border-radius:14px;border:1px solid var(--line,#e2e8f0);background:var(--card,#fff);color:inherit;font:inherit;font-weight:800;font-size:15px;cursor:pointer}'+
 'body.sf-menu-on:not(.sf-menu-completo) #nav>*:not(#sfMenu){display:none!important}'+
 '.sf-modal{position:fixed;inset:0;z-index:9000;display:flex;align-items:center;justify-content:center;padding:14px;background:rgba(15,23,42,.55)}'+
 '.sf-modal-box{position:relative;width:min(480px,100%);max-height:90vh;overflow:auto;padding:22px 18px 18px;border-radius:22px;background:var(--card,#fff);color:var(--ink,#172033);font-size:16px;line-height:1.5;box-shadow:0 30px 70px rgba(0,0,0,.3)}.sf-modal-box h3{margin:0 0 10px;font-size:21px}'+
 '.sf-x{position:absolute;top:10px;right:10px;width:44px;height:44px;border-radius:50%;border:1px solid var(--line,#e2e8f0);background:#fff;font-size:18px;cursor:pointer}.sf-grade-modal button{min-height:96px}'+
 '.sf-passo{margin:0;font-size:13px;font-weight:800;color:#2563eb;text-transform:uppercase;letter-spacing:.04em}'+
 '.sf-escolhas{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.sf-escolhas button{min-height:52px;padding:8px;border-radius:14px;border:2px solid var(--line,#e2e8f0);background:var(--card,#fff);color:inherit;font:inherit;font-weight:800;font-size:16px;cursor:pointer}.sf-escolhas button:hover,.sf-escolhas button:focus-visible{border-color:#2563eb}'+
 '.sf-nota{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:6px;margin:8px 0}.sf-nota button{min-height:52px;border-radius:14px;border:2px solid var(--c);background:#fff;color:var(--c);font:900 20px system-ui,sans-serif;cursor:pointer}.sf-nota button:hover,.sf-nota button:focus-visible{background:var(--c);color:#fff}'+
 '.sf-outro{display:block;margin-top:12px;font-weight:700}.sf-outro input,.sf-outro textarea{display:block;width:100%;box-sizing:border-box;min-height:48px;margin-top:4px;padding:10px;border-radius:12px;border:1px solid #cbd5e1;font:inherit;font-size:16px}'+
 '.sf-modal-acoes{display:flex;gap:8px;margin-top:14px}.sf-modal-acoes button{flex:1;min-height:50px;border-radius:14px;border:1px solid var(--line,#e2e8f0);background:var(--card,#fff);color:inherit;font:inherit;font-weight:900;font-size:16px;cursor:pointer}.sf-prim{background:#2563eb!important;border-color:#2563eb!important;color:#fff!important}'+
 '.sf-toast{position:fixed;left:50%;bottom:calc(96px + env(safe-area-inset-bottom));transform:translateX(-50%);z-index:9500;display:flex;flex-direction:column;gap:8px;width:min(420px,calc(100% - 24px));padding:14px 16px;border-radius:18px;background:#0f172a;color:#fff;font-size:16px;box-shadow:0 14px 40px rgba(0,0,0,.35)}.sf-toast button{min-height:46px;border-radius:12px;border:0;background:#22c55e;color:#052e16;font:inherit;font-weight:900;cursor:pointer}'+
 '.sf-avancado>summary{cursor:pointer;font-weight:800;padding:6px 0}'+
 /* 9) letra maior e alto contraste */
 'html.sf-letra{font-size:118%}html.sf-letra body{font-size:1.08em}html.sf-letra .muted,html.sf-letra small{font-size:max(15px,1em)!important}'+
 'html.sf-contraste body{background:#fff!important;color:#000!important}html.sf-contraste .card{border:2px solid #111!important;box-shadow:none!important}html.sf-contraste .muted,html.sf-contraste small{color:#111!important}html.sf-contraste .btn,html.sf-contraste button{border-width:2px!important}html.sf-contraste a{color:#0033cc!important;text-decoration:underline!important}'+
 'body.msa-dark .sf-topo,body.msa-dark .sf-hoje{background:#111827;border-color:#263244}body.msa-dark .sf-voltar{background:#0f172a;color:#e5e7eb;border-color:#263244}body.msa-dark .sf-aqui small{color:#cbd5e1}body.msa-dark .sf-hoje li{background:#0f172a}body.msa-dark .sf-cuidando{background:#0c1a2b;border-color:#1e3a5f}'+
 '@media(max-width:380px){.sf-nota{grid-template-columns:repeat(4,minmax(0,1fr))}.sf-grade b{font-size:15px}}'+
 /* a barra do topo só “gruda” se o body não for uma caixa de rolagem (overflow-x:hidden quebrava o sticky) */
 'html,body{overflow-x:clip!important}'+
 /* atalho flutuante de perguntas ficava por cima do conteúdo; a barra de baixo já tem “💬 Perguntar” */
 '#msaMobileHealthQuestions{display:none!important}'+
 /* a barra nova já tem Voltar e o nome da tela; o Tema virou o botão 🌙 dentro dela (antes ficava por cima dos botões) */
 'body:has(#sfTopo) #msaPageReturnBar{display:none!important}body:has(#sfTopo) #msaThemeToggle{display:none!important}'+
 '.sf-tema{width:44px;height:44px;border-radius:50%;border:1px solid var(--line,#e2e8f0);background:var(--card,#fff);font-size:18px;cursor:pointer;flex:0 0 auto}'+
 '@media print{.sf-topo,.sf-ajuda,.sf-botoes,.sf-hoje,.sf-cuidando,.sf-menu,.sf-toast{display:none!important}}';
document.head.appendChild(css);aplicarVisao();
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(iniciar,150)});else setTimeout(iniciar,150);
})();
