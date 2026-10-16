/* Minha Saúde IA — Começo rápido V6.22
 * Pergunta só o básico (6 perguntas, todas podem ser puladas) e deixa o resto para depois.
 * Grava no mesmo formato do perfil completo (msa2_perfil) e dos medicamentos (msa2_meds).
 * Também recolhe os blocos extras do perfil completo atrás de um botão "Mostrar mais seções". */
(function(){
'use strict';

var FLAG='msa2_quick_start_v1';
var QUANDO='msa2_quick_start_at';
var EXPANDIDO='msa2_perfil_expandido';

function K(){return window.MSA_K||window.K||{}}
function S(){return window.MSAStorage}
function ls(){return window.msaStorage||window.localStorage}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function lista(chave){try{var a=S().get(chave);return Array.isArray(a)?a:[]}catch(e){return []}}
function perfil(){try{var a=S().get(K().p);return Array.isArray(a)&&a[0]?a[0]:{}}catch(e){return {}}}
function totalRegistros(){
  var k=K();
  return [k.d,k.c,k.m,k.e,k.v,k.vax,k.doc].reduce(function(s,x){return s+(x?lista(x).length:0)},0);
}
function lerFlag(){try{return ls().getItem(FLAG)||''}catch(e){return ''}}
function grudarFlag(v){try{ls().setItem(FLAG,v)}catch(e){}}

/* ---------- estado do começo rápido (usado pela Home, pelo próximo passo e pelo aviso de backup) ---------- */
window.msaQuickEstado=function(){var v=lerFlag();return v==='feito'||v==='pulado'?v:'novo'};
window.msaQuickNovato=function(){
  return window.msaQuickEstado()==='novo'&&!String(perfil().nome||'').trim()&&totalRegistros()===0;
};
window.msaQuickRecente=function(dias){
  if(window.msaQuickEstado()!=='feito')return false;
  try{var t=new Date(ls().getItem(QUANDO));return isFinite(t.getTime())&&(Date.now()-t.getTime())<dias*86400000}catch(e){return false}
};
window.msaTotalRegistrosBackup=totalRegistros;

window.msaQuickTextoHome=function(c){
  var est=window.msaQuickEstado();
  if(est==='feito'){
    var falta=(c&&c.pendentes?c.pendentes:[]).filter(function(x){return x[0]==='Perfil'}).length;
    return '<b>✅ Perfil básico pronto.</b> '+(falta
      ?'Completar o resto é opcional: ainda há '+falta+(falta===1?' item':' itens')+' em branco no perfil (altura, peso, sexo…), que você pode preencher aos poucos.'
      :'Seu perfil está completo.');
  }
  if(est==='pulado'||window.msaQuickNovato()){
    return '<b>Comece pelo básico.</b> O Começo rápido leva 1 minuto: são 6 perguntas e todas podem ser puladas.';
  }
  return null;
};

function ajustarIntro(){
  var feito=window.msaQuickEstado()==='feito';
  if(document.body){
    document.body.classList.toggle('msa-quick-feito',feito);
    document.body.classList.toggle('msa-tem-dados',feito||!!String(perfil().nome||'').trim()||totalRegistros()>0);
  }
  var intro=document.getElementById('msaPurposeIntro');if(!intro)return;
  var btn=intro.querySelector('.msa-purpose-actions .btn');if(!btn)return;
  var promover=!feito&&(window.msaQuickEstado()==='pulado'||window.msaQuickNovato());
  if(promover){
    if(!btn.hasAttribute('data-msa-orig')){btn.setAttribute('data-msa-orig',btn.textContent);btn.setAttribute('data-msa-onclick',btn.getAttribute('onclick')||'')}
    btn.textContent='⚡ Começo rápido · 1 minuto';
    btn.removeAttribute('onclick');
    btn.onclick=function(){window.msaAbrirComecoRapido()};
  }else if(btn.hasAttribute('data-msa-orig')){
    btn.textContent=btn.getAttribute('data-msa-orig');
    btn.onclick=null;
    var o=btn.getAttribute('data-msa-onclick');if(o)btn.setAttribute('onclick',o);
    btn.removeAttribute('data-msa-orig');btn.removeAttribute('data-msa-onclick');
  }
}

window.msaQuickAjustarCartaoHome=function(){
  try{ajustarIntro()}catch(e){}
  var card=document.getElementById('homeMissingInfoCard');if(!card)return;
  var btn=card.querySelector('button.btn');if(!btn)return;
  var est=window.msaQuickEstado();
  if(est==='feito'){
    btn.textContent='✏️ Completar aos poucos';
    btn.onclick=function(){if(typeof window.abrirPendenciasPreenchimento==='function')window.abrirPendenciasPreenchimento()};
  }else if(est==='pulado'||window.msaQuickNovato()){
    btn.textContent='⚡ Começo rápido';
    btn.onclick=function(){window.msaAbrirComecoRapido()};
  }else{
    btn.textContent='✏️ Ver o que falta';
    btn.onclick=function(){if(typeof window.abrirPendenciasPreenchimento==='function')window.abrirPendenciasPreenchimento()};
  }
};

/* ---------- tela do começo rápido ---------- */
var ultimoFoco=null,overflowAntes='';

function fechar(){
  var el=document.getElementById('msaQuickStart');if(el)el.remove();
  document.removeEventListener('keydown',tecla,true);
  document.body.style.overflow=overflowAntes;
  if(ultimoFoco&&ultimoFoco.focus){try{ultimoFoco.focus()}catch(e){}}
}

function tecla(e){
  if(e.key==='Escape'){e.preventDefault();fechar();return}
  if(e.key!=='Tab')return;
  var box=document.getElementById('msaQuickStart');if(!box)return;
  var f=[].filter.call(box.querySelectorAll('button,input,textarea,select'),function(x){return !x.disabled&&x.getClientRects().length>0});
  if(!f.length)return;
  var primeiro=f[0],ultimo=f[f.length-1];
  if(e.shiftKey&&document.activeElement===primeiro){e.preventDefault();ultimo.focus()}
  else if(!e.shiftKey&&document.activeElement===ultimo){e.preventDefault();primeiro.focus()}
}

function blocoChips(g,rotulo,nenhum,placeholder,varias){
  return '<div class="msa-qs-q" data-q="'+g+'">'+
    '<div class="msa-qs-rotulo" id="qsL_'+g+'">'+rotulo+'</div>'+
    '<div class="msa-qs-chips" role="group" aria-labelledby="qsL_'+g+'">'+
      '<button type="button" class="msa-qs-chip" data-g="'+g+'" data-v="nao" aria-pressed="false">'+nenhum+'</button>'+
      '<button type="button" class="msa-qs-chip" data-g="'+g+'" data-v="tenho" aria-pressed="false">Tenho, informar</button>'+
      (g==='med'?'':'<button type="button" class="msa-qs-chip" data-g="'+g+'" data-v="nsei" aria-pressed="false">Não sei</button>')+
    '</div>'+
    '<div class="msa-qs-txt" hidden>'+(varias
      ?'<textarea id="qsT_'+g+'" rows="3" placeholder="'+placeholder+'" aria-label="'+rotulo+' — escreva aqui"></textarea>'
      :'<input id="qsT_'+g+'" type="text" placeholder="'+placeholder+'" aria-label="'+rotulo+' — escreva aqui" autocomplete="off">')+
    '</div>'+
    '<div class="msa-qs-erro" id="qsE_'+g+'" role="alert" hidden></div>'+
  '</div>';
}

function apertar(g,v){
  var box=document.getElementById('msaQuickStart');if(!box)return;
  var chips=box.querySelectorAll('.msa-qs-chip[data-g="'+g+'"]');
  var atual=[].filter.call(chips,function(c){return c.getAttribute('aria-pressed')==='true'})[0];
  var novo=atual&&atual.getAttribute('data-v')===v?'':v;
  [].forEach.call(chips,function(c){c.setAttribute('aria-pressed',c.getAttribute('data-v')===novo?'true':'false')});
  var q=box.querySelector('.msa-qs-q[data-q="'+g+'"]');
  var txt=q.querySelector('.msa-qs-txt');txt.hidden=novo!=='tenho';
  var e=document.getElementById('qsE_'+g);if(e){e.textContent='';e.hidden=true}
  if(novo==='tenho'){var campo=txt.querySelector('input,textarea');if(campo)campo.focus()}
}

function estadoChips(g){
  var b=document.querySelector('#msaQuickStart .msa-qs-chip[data-g="'+g+'"][aria-pressed="true"]');
  return b?b.getAttribute('data-v'):'';
}
function mostrarErro(g,msg){var e=document.getElementById('qsE_'+g);if(!e)return;e.textContent=msg||'';e.hidden=!msg}
function valor(id){var e=document.getElementById(id);return e?String(e.value||'').trim():''}

function calcularIdade(nasc,hoje){
  var i=hoje.getFullYear()-nasc.getFullYear();
  var m=hoje.getMonth()-nasc.getMonth();
  if(m<0||(m===0&&hoje.getDate()<nasc.getDate()))i--;
  return Math.max(0,i);
}

function separarMeds(t){
  return String(t).split(/[\n;,]+/).map(function(x){return x.trim()}).filter(Boolean).slice(0,15).map(function(x){
    var m=x.match(/^(.+?)\s+(\d[\d.,]*\s*(?:mg|mcg|µg|g|ml|ui|gotas?|comprimidos?|cp|%)\b.*)$/i);
    return m?{nome:m[1].trim(),dose:m[2].trim()}:{nome:x,dose:''};
  });
}

function avisar(msg){
  if(typeof window.toast==='function'){window.toast(msg);return}
  var t=document.getElementById('msaToast');
  if(!t){t=document.createElement('div');t.id='msaToast';t.className='msa-toast';t.setAttribute('role','status');t.setAttribute('aria-live','polite');document.body.appendChild(t)}
  t.textContent=msg;t.classList.add('show');
  clearTimeout(window.__msaToastTimer);
  window.__msaToastTimer=setTimeout(function(){t.classList.remove('show')},2400);
}

function pular(){
  if(window.msaQuickEstado()==='novo')grudarFlag('pulado');
  fechar();
  try{document.dispatchEvent(new CustomEvent('msa:data-changed'))}catch(e){}
  if(typeof window.go==='function')window.go('home');
}

function salvar(){
  var k=K(),st=S();
  if(!st||!k.p){alert('O armazenamento do aplicativo ainda não foi iniciado. Recarregue a página e tente de novo.');return}
  var temErro=false;
  ['nasc','alerg','med','cond'].forEach(function(g){mostrarErro(g,'')});

  var nasc=valor('qsNasc'),idade='';
  if(nasc){
    var d=new Date(nasc+'T12:00:00'),hoje=new Date();
    if(!isFinite(d.getTime())||d>hoje||d.getFullYear()<1900){mostrarErro('nasc','Confira a data de nascimento.');temErro=true}
    else idade=String(calcularIdade(d,hoje));
  }
  function resposta(g,oQue){
    var s=estadoChips(g);
    if(s==='nao')return {tipo:'nao'};
    if(s==='tenho'){
      var t=valor('qsT_'+g);
      if(!t){mostrarErro(g,'Escreva '+oQue+' ou escolha outra opção.');temErro=true;return {tipo:'erro'}}
      return {tipo:'texto',texto:t};
    }
    return {tipo:'pulou'};
  }
  var a=resposta('alerg','quais alergias você tem'),m=resposta('med','quais remédios você usa'),c=resposta('cond','quais condições de saúde você tem');
  if(temErro){
    var pe=document.querySelector('#msaQuickStart .msa-qs-erro:not([hidden])');
    if(pe&&pe.scrollIntoView)pe.scrollIntoView({block:'center'});
    return;
  }
  var nome=valor('qsNome'),emerg=valor('qsEmerg'),tel=valor('qsTel');
  var respondeuAlgo=nome||nasc||emerg||tel||a.tipo!=='pulou'||m.tipo!=='pulou'||c.tipo!=='pulou';
  if(!respondeuAlgo){pular();return}

  var novo=Object.assign({},perfil());
  if(nome)novo.nome=nome;
  if(nasc){novo.nasc=nasc;novo.idade=idade}
  if(a.tipo==='nao')novo.alerg='Nenhuma';else if(a.tipo==='texto')novo.alerg=a.texto;
  if(c.tipo==='nao')novo.cond='Nenhuma';else if(c.tipo==='texto')novo.cond=c.texto;
  if(emerg)novo.emerg=emerg;
  if(tel)novo.tel=tel;
  if(m.tipo==='nao')novo.medsContinuos='Nenhum';
  else if(m.tipo==='texto'&&novo.medsContinuos)delete novo.medsContinuos;

  if(!st.set(k.p,[novo])){alert('Não consegui salvar neste navegador (o armazenamento pode estar cheio ou bloqueado). Tente de novo.');return}

  if(m.tipo==='texto'){
    var meds=lista(k.m);
    var jaTem=meds.map(function(x){return String(x.nome||'').toLowerCase()});
    var novos=separarMeds(m.texto).filter(function(x){return jaTem.indexOf(x.nome.toLowerCase())<0});
    novos.forEach(function(x){meds.push({nome:x.nome,dose:x.dose,freq:'',inicio:'',fim:'',pres:'',obs:'Uso contínuo (começo rápido)'})});
    if(novos.length&&!st.set(k.m,meds)){alert('Salvei seus dados, mas não consegui salvar os remédios. Você pode cadastrá-los depois em Registrar > Medicamento.');}
  }

  grudarFlag('feito');
  try{ls().setItem(QUANDO,new Date().toISOString())}catch(e){}
  fechar();
  try{document.dispatchEvent(new CustomEvent('msa:data-changed'))}catch(e){}
  if(typeof window.go==='function')window.go('home');
  try{window.scrollTo(0,0)}catch(e){}
  avisar('✅ Perfil básico salvo');
}

window.msaAbrirComecoRapido=function(){
  var velho=document.getElementById('msaQuickStart');if(velho)velho.remove();
  ultimoFoco=document.activeElement;
  var p=perfil(),ja=window.msaQuickEstado()==='feito';

  var el=document.createElement('div');
  el.id='msaQuickStart';el.className='msa-qs';
  el.innerHTML=
   '<div class="msa-qs-card" role="dialog" aria-modal="true" aria-labelledby="qsTitulo">'+
    '<button type="button" class="msa-qs-fechar" id="qsFechar" aria-label="Fechar">×</button>'+
    '<h2 id="qsTitulo">⚡ Começo rápido</h2>'+
    '<p class="msa-qs-sub">6 perguntas, cerca de 1 minuto. Todas podem ser puladas.</p>'+
    '<div class="msa-qs-q"><label for="qsNome">Como podemos te chamar?</label><input id="qsNome" type="text" placeholder="Seu nome ou apelido" autocomplete="given-name"></div>'+
    '<div class="msa-qs-q"><label for="qsNasc">Data de nascimento</label><input id="qsNasc" type="date" max="'+new Date().toISOString().slice(0,10)+'" autocomplete="bday"><div class="msa-qs-erro" id="qsE_nasc" role="alert" hidden></div></div>'+
    blocoChips('alerg','Alergias','Nenhuma','Ex.: dipirona, amendoim',false)+
    blocoChips('med','Remédios de uso contínuo','Nenhum','Um por linha. Ex.: Losartana 50 mg',true)+
    blocoChips('cond','Condições de saúde','Nenhuma','Ex.: hipertensão, diabetes',false)+
    '<div class="msa-qs-q"><div class="msa-qs-rotulo">Contato de emergência (opcional)</div>'+
      '<div class="msa-qs-par"><input id="qsEmerg" type="text" placeholder="Nome" aria-label="Nome do contato de emergência" autocomplete="off"><input id="qsTel" type="tel" inputmode="tel" placeholder="Telefone" aria-label="Telefone do contato de emergência" autocomplete="off"></div></div>'+
    '<div class="msa-qs-acoes">'+
      '<button type="button" class="btn msa-qs-salvar" id="qsSalvar">Salvar e começar</button>'+
      '<button type="button" class="msa-qs-pular" id="qsPular">'+(ja?'Cancelar':'Pular por enquanto')+'</button>'+
    '</div>'+
    '<p class="msa-qs-nota">Sem foto e sem perguntas íntimas. O resto você completa quando quiser.</p>'+
   '</div>';
  document.body.appendChild(el);
  overflowAntes=document.body.style.overflow;document.body.style.overflow='hidden';

  var set=function(id,v){var x=document.getElementById(id);if(x&&v)x.value=v};
  set('qsNome',p.nome);set('qsNasc',p.nasc);set('qsEmerg',p.emerg);set('qsTel',p.tel);
  [['alerg',p.alerg],['cond',p.cond]].forEach(function(par){
    var v=String(par[1]||'').trim();if(!v)return;
    if(/^nenhuma?$/i.test(v)){apertar(par[0],'nao')}
    else if(!/^n[ãa]o informado$/i.test(v)){apertar(par[0],'tenho');var c=document.getElementById('qsT_'+par[0]);if(c)c.value=v}
  });
  if(p.medsContinuos==='Nenhum')apertar('med','nao');

  [].forEach.call(el.querySelectorAll('.msa-qs-chip'),function(b){b.addEventListener('click',function(){apertar(b.getAttribute('data-g'),b.getAttribute('data-v'))})});
  document.getElementById('qsSalvar').addEventListener('click',salvar);
  document.getElementById('qsPular').addEventListener('click',function(){ja?fechar():pular()});
  document.getElementById('qsFechar').addEventListener('click',fechar);
  document.addEventListener('keydown',tecla,true);
  var primeiro=document.getElementById('qsNome');if(primeiro)setTimeout(function(){primeiro.focus()},60);
};

/* ---------- perfil completo: o básico aberto e o resto atrás de um botão ---------- */
function compactarPerfil(){
  var f=document.getElementById('pForm');
  if(!f||f.getAttribute('data-msa-compacto'))return;
  var extras=[].filter.call(f.children,function(e){
    return e.tagName==='DIV'&&(e.classList.contains('card')||e.classList.contains('profile-photo-row'));
  });
  var primeiroCard=[].filter.call(extras,function(e){return e.classList.contains('card')})[0];
  if(!primeiroCard)return;
  f.setAttribute('data-msa-compacto','1');
  extras.forEach(function(e){e.classList.add('msa-perfil-extra')});

  var emerg=document.getElementById('pEmerg'),bloco=emerg;
  while(bloco&&bloco.parentElement!==f)bloco=bloco.parentElement;
  if(bloco&&bloco!==primeiroCard)f.insertBefore(bloco,primeiroCard);

  var barra=document.createElement('div');barra.className='msa-perfil-mais';
  barra.innerHTML='<button type="button" class="btn secondary" id="msaPerfilMais" aria-expanded="false">➕ Mostrar mais seções</button><small>Opcional: remédios para dor, hábitos de vida, rotina e saúde reprodutiva. O básico já está acima.</small>';
  f.insertBefore(barra,primeiroCard);

  var btn=barra.querySelector('button');
  function aplicar(aberto){
    f.classList.toggle('msa-perfil-expandido',aberto);
    btn.setAttribute('aria-expanded',aberto?'true':'false');
    btn.textContent=aberto?'➖ Mostrar só o básico':'➕ Mostrar mais seções';
    try{ls().setItem(EXPANDIDO,aberto?'1':'0')}catch(e){}
  }
  btn.addEventListener('click',function(){aplicar(!f.classList.contains('msa-perfil-expandido'))});
  var salvo='';try{salvo=ls().getItem(EXPANDIDO)||''}catch(e){}
  if(salvo==='1')aplicar(true);
}

/* ---------- foto: tocar no avatar do cartão da Home abre a escolha de foto (o app já salva e reduz a imagem) ---------- */
function atualizarCartaoDepoisDaFoto(){
  [400,1200,2500].forEach(function(t){setTimeout(function(){
    try{if(typeof window.atualizarPerfilHome==='function')window.atualizarPerfilHome();else if(typeof window.render==='function')window.render()}catch(e){}
  },t)});
}
function ligarFotoDoCartao(){
  var av=document.getElementById('homeAvatar'),inp=document.getElementById('pFoto');
  if(!av||av.getAttribute('data-msa-foto'))return;
  av.setAttribute('data-msa-foto','1');
  function abrir(){window.__msaFotoDoCartao=Date.now();if(inp&&typeof inp.click==='function')inp.click();else if(typeof window.go==='function')window.go('perfil')}
  av.addEventListener('click',abrir);
  av.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();abrir()}});
  if(inp){
    /* Foto escolhida pelo cartão da Home: o app já salva na hora. O navegador dispara "input" e "change" no campo de arquivo; os dois
       "borbulhariam" até o formulário do perfil, onde o recurso de rascunhos criaria um aviso falso de "informações ainda não salvas". */
    var daHome=function(){return window.__msaFotoDoCartao&&Date.now()-window.__msaFotoDoCartao<120000};
    inp.addEventListener('input',function(e){if(daHome())e.stopPropagation()});
    inp.addEventListener('change',function(e){
      if(daHome())e.stopPropagation();
      window.__msaFotoDoCartao=0;
      atualizarCartaoDepoisDaFoto();
    });
  }
}

function iniciar(){
  try{compactarPerfil()}catch(e){console.warn('[Minha Saúde IA] perfil compacto',e)}
  try{ajustarIntro()}catch(e){}
  try{ligarFotoDoCartao()}catch(e){console.warn('[Minha Saúde IA] foto do cartão',e)}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',iniciar);else iniciar();
})();
