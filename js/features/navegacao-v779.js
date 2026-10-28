/* Minha Saúde IA — navegação V7.79
 * 1 uma navegação por aparelho · 2 menu lateral no computador · 3 busca/paleta (Ctrl+K) · 4 “Registrar” rápido
 * 5 Início mais curto (padrão muda com o modo) · 6 pessoa sempre visível · 7 nomes iguais (feito nos textos)
 * 8 fixados e recentes · 9 caminho na tela (voltar já funcionava pelo navegador) · 10 atalhos, Salvar fixo e alvos de toque
 * Tudo respeita o modo Simples / Confortável / Completo. Só acrescenta: usa window.go e as telas que já existem. */
(function(){
'use strict';
if(window.__msaNavV779)return;window.__msaNavV779=true;

var $=function(id){return document.getElementById(id)};
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function norm(s){return String(s==null?'':s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')}
function ler(k,pad){try{var v=JSON.parse(localStorage.getItem(k));return v==null?pad:v}catch(e){return pad}}
function gravar(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
function semIcone(t){return String(t||'').replace(/\s+/g,' ').replace(/^[^A-Za-zÀ-ÿ0-9]+/,'').trim()}

var K_FIX='msa2_nav_fixados',K_REC='msa2_nav_recentes',K_HOME='msa2_home_expandida';
var FEATURE_ALVO={academia:'medidasCorporaisCard',nutricao:'nutricao',sonoBem:'sono',ciclo:'cicloForm'};
/* itens que só aparecem a partir do modo Confortável (o modo Simples fica só com o essencial) */
var SIMPLES_OCULTOS_TAB=['lixeira','historicoClinico'];

function nivel(){return document.documentElement.dataset.msaExperience||'comfortable'}
function paginaAtual(){try{return new URL(location.href).searchParams.get('pagina')||'home'}catch(e){return 'home'}}
function digitando(el){if(!el)return false;var t=(el.tagName||'').toLowerCase();return t==='input'||t==='textarea'||t==='select'||el.isContentEditable}

/* ---------- o item vale no modo atual? ---------- */
function ativoNoModo(el){
  var n=nivel();
  for(var e=el;e&&e!==document.body;e=e.parentElement){
    if(e.hidden)return false;
    var c=e.classList;if(c&&(c.contains('msa-experience-off')||c.contains('msa-feature-off')))return false;
    var x=e.getAttribute&&e.getAttribute('data-experience');
    if(x==='advanced'&&n!=='advanced')return false;
    if(x==='simple-hidden'&&n==='simple')return false;
  }
  return true;
}

/* ---------- ir para uma página (usa o controlador único window.go) ---------- */
function ir(id,feature){
  fecharTudo();
  if(!id||!$(id))return;
  try{if(typeof window.go==='function')window.go(id)}catch(e){console.warn('[Minha Saúde IA] navegação',e)}
  setTimeout(function(){
    var alvo=(feature&&$(FEATURE_ALVO[feature]||feature))||$(id);
    try{if(alvo&&alvo.scrollIntoView)alvo.scrollIntoView({behavior:'smooth',block:'start'});else window.scrollTo({top:0,behavior:'smooth'})}catch(e){}
  },120);
}

/* ---------- índice de páginas (lido do menu que já existe, só o que o modo mostra) ---------- */
function indicePaginas(){
  var mapa={},ordem=[];
  function add(id,label,feature,el){
    if(!id||!$(id))return;
    if(!ativoNoModo(el))return;
    label=String(label||'').replace(/\s+/g,' ').trim();if(!label)return;
    var chave=id+'|'+(feature||''),atual=mapa[chave];
    if(!atual){mapa[chave]={id:id,feature:feature||'',label:label};ordem.push(chave)}
    else if(label.length>atual.label.length)atual.label=label;
  }
  document.querySelectorAll('#msaMobileDrawer [data-mobile-tab]').forEach(function(b){add(b.getAttribute('data-mobile-tab'),b.textContent,b.getAttribute('data-feature-nav')||'',b)});
  document.querySelectorAll('#nav .nav-menu button[data-tab]').forEach(function(b){add(b.getAttribute('data-tab'),b.textContent,b.getAttribute('data-feature-nav')||'',b)});
  return ordem.map(function(k){return mapa[k]});
}
function paginasPermitidas(){var s={home:1};indicePaginas().forEach(function(p){s[p.id]=1});return s}
function paginaPorId(id){var l=indicePaginas();for(var i=0;i<l.length;i++)if(l[i].id===id&&!l[i].feature)return l[i];for(i=0;i<l.length;i++)if(l[i].id===id)return l[i];return null}
function rotuloDe(id){var p=paginaPorId(id);if(p)return p.label;var b=document.querySelector('#nav .nav-menu button[data-tab="'+id+'"],#msaMobileDrawer [data-mobile-tab="'+id+'"]');return b?b.textContent.replace(/\s+/g,' ').trim():(id==='home'?'🏠 Visão geral':id)}

/* ---------- marcações por modo que não existiam nos menus ---------- */
function marcarModo(){
  document.querySelectorAll('#nav [data-tab]').forEach(function(b){
    if(SIMPLES_OCULTOS_TAB.indexOf(b.getAttribute('data-tab'))>=0&&!b.hasAttribute('data-experience'))b.setAttribute('data-experience','simple-hidden');
  });
  var d=$('msaMobileDrawer');
  if(d)d.querySelectorAll('.msa-mobile-section').forEach(function(s){
    if(!s.hasAttribute('data-experience')&&/^\s*Áreas principais/i.test((s.querySelector('.msa-mobile-section-title')||{}).textContent||''))s.setAttribute('data-experience','simple-hidden');
  });
  var a=$('msaAreasPrincipais');if(a&&!a.hasAttribute('data-experience'))a.setAttribute('data-experience','simple-hidden');
}
function marcarGruposVazios(){
  document.querySelectorAll('#nav .nav-group').forEach(function(g){
    var tem=[].some.call(g.querySelectorAll('.nav-menu button'),function(b){return ativoNoModo(b)&&!b.classList.contains('nv-repetido')});
    g.classList.toggle('nv-grupo-vazio',!tem);
  });
}
function marcarRepetidos(){
  document.querySelectorAll('#nav .nav-menu').forEach(function(m){
    var vistos={};
    [].slice.call(m.querySelectorAll('button')).forEach(function(b){
      var k=(b.getAttribute('data-tab')||'')+'|'+(b.getAttribute('data-feature-nav')||'')+'|'+b.textContent.replace(/\s+/g,' ').trim();
      if(vistos[k])b.classList.add('nv-repetido');else{vistos[k]=1;b.classList.remove('nv-repetido')}
    });
  });
}

/* ---------- fixados e recentes ---------- */
function fixados(){var f=ler(K_FIX,[]);return Array.isArray(f)?f:[]}
function recentes(){var r=ler(K_REC,[]);return Array.isArray(r)?r:[]}
function registrarVisita(id){if(!id)return;var r=recentes().filter(function(x){return x!==id});r.unshift(id);gravar(K_REC,r.slice(0,8))}
function alternarFixo(id){var f=fixados(),i=f.indexOf(id);if(i>=0)f.splice(i,1);else f.unshift(id);gravar(K_FIX,f.slice(0,8));atualizarFixos()}
function listaRapida(){
  var ok=paginasPermitidas();
  var fx=fixados().filter(function(id){return $(id)&&ok[id]}),rc=recentes().filter(function(id){return $(id)&&ok[id]&&id!=='home'&&fx.indexOf(id)<0}).slice(0,4);
  return {fixos:fx.slice(0,6),recentes:rc};
}
function botoesRapidos(){
  var q=listaRapida(),h='';
  q.fixos.forEach(function(id){h+='<button type="button" data-nv-ir="'+esc(id)+'">⭐ '+esc(semIcone(rotuloDe(id)))+'</button>'});
  q.recentes.forEach(function(id){h+='<button type="button" data-nv-ir="'+esc(id)+'">🕘 '+esc(semIcone(rotuloDe(id)))+'</button>'});
  return h;
}
function atualizarBlocoRapido(){
  var h=botoesRapidos();
  var corpo=document.querySelector('#msaMobileDrawer .msa-mobile-drawer-body');
  if(corpo){
    var b=corpo.querySelector('[data-nv-bloco="drawer"]');
    if(!h){if(b)b.remove()}
    else{
      if(!b){b=document.createElement('div');b.className='msa-mobile-section';b.setAttribute('data-nv-bloco','drawer');var quick=corpo.querySelector('.msa-mobile-quick');if(quick&&quick.parentNode===corpo)quick.insertAdjacentElement('afterend',b);else corpo.insertBefore(b,corpo.firstChild)}
      var novo='<div class="msa-mobile-section-title">⭐ Fixados e recentes</div><div class="msa-mobile-links">'+h+'</div>';
      if(b.getAttribute('data-h')!==novo){b.setAttribute('data-h',novo);b.innerHTML=novo}
    }
  }
  var nav=$('nav');
  if(nav){
    var s=nav.querySelector('[data-nv-bloco="lateral"]');
    if(!h){if(s)s.remove()}
    else{
      if(!s){s=document.createElement('div');s.className='nv-lateral-rapido';s.setAttribute('data-nv-bloco','lateral');nav.insertBefore(s,nav.firstChild)}
      var nv='<div class="nv-lateral-titulo">⭐ Fixados e recentes</div>'+h;
      if(s.getAttribute('data-h')!==nv){s.setAttribute('data-h',nv);s.innerHTML=nv}
    }
  }
}
function atualizarFixos(){
  var b=$('nvPin');if(b){var id=paginaAtual(),on=fixados().indexOf(id)>=0;b.setAttribute('aria-pressed',String(on));b.innerHTML=on?'📌 Fixada':'📌 Fixar';b.title=on?'Tirar esta página dos fixados':'Fixar esta página para voltar rápido'}
  atualizarBlocoRapido();
}

/* ---------- pessoa que está sendo cuidada ---------- */
function pessoas(){
  var reg=[],atualId='',eu='';
  try{var S=window.MSAStorage;
    if(S&&typeof S.getGlobal==='function')reg=S.getGlobal('msa2_familiares')||[];else if(S&&typeof S.get==='function')reg=S.get('msa2_familiares')||[];
    atualId=S&&typeof S.selectedProfileId==='function'?String(S.selectedProfileId()||''):'';
    var p=S&&typeof S.get==='function'?S.get('msa2_perfil'):null;eu=(Array.isArray(p)&&p[0]&&p[0].nome)||'';
  }catch(e){}
  if(!Array.isArray(reg))reg=[];
  var meuNome=(eu&&!atualId)?eu:'';
  var itens=[{id:'',nome:meuNome||'Eu',rot:meuNome?('Eu · '+meuNome):'Eu'}];
  reg.forEach(function(x){if(x&&x.id)itens.push({id:String(x.id),nome:String(x.nome||x.name||'Pessoa sem nome'),rot:String(x.nome||x.name||'Pessoa sem nome')+(x.parentesco?' · '+x.parentesco:'')})});
  return {atualId:atualId,itens:itens};
}
function nomeAtual(){var p=pessoas(),a=p.itens.filter(function(x){return x.id===p.atualId})[0]||p.itens[0];return String(a.nome).split(' ')[0]||'Eu'}
function trocarPessoa(id){
  try{if(window.MSAStorage&&typeof window.MSAStorage.set==='function')window.MSAStorage.set('msa2_familiar_selecionado',id||'')}catch(e){}
  location.href=location.origin+location.pathname+'?pagina='+encodeURIComponent(paginaAtual());
}
function fecharMenuPessoa(){var m=$('nvPessoaMenu');if(m)m.remove();var b=$('nvPessoa');if(b)b.setAttribute('aria-expanded','false')}
function abrirMenuPessoa(){
  if($('nvPessoaMenu')){fecharMenuPessoa();return}
  var b=$('nvPessoa');if(!b)return;var p=pessoas();
  var m=document.createElement('div');m.id='nvPessoaMenu';m.className='nv-pop';m.setAttribute('role','menu');
  m.innerHTML='<div class="nv-pop-titulo">Estou cuidando da saúde de:</div>'+p.itens.map(function(x){return '<button type="button" role="menuitem" data-nv-pessoa="'+esc(x.id)+'"'+(x.id===p.atualId?' class="on" aria-current="true"':'')+'>'+(x.id===p.atualId?'✔ ':'')+esc(x.rot)+'</button>'}).join('')+'<button type="button" role="menuitem" data-nv-pessoa="__novo">➕ Adicionar outra pessoa…</button>';
  b.insertAdjacentElement('afterend',m);b.setAttribute('aria-expanded','true');
  var primeiro=m.querySelector('button');if(primeiro)primeiro.focus();
}

/* ---------- linha “pessoa · registrar · buscar · fixar” + caminho ---------- */
function montarLinha(){
  if($('nvLinha'))return true;
  var topo=$('sfTopo');if(!topo)return false;
  var l=document.createElement('div');l.id='nvLinha';l.className='nv-linha';
  l.innerHTML='<div class="nv-chips">'+
    '<button type="button" id="nvPessoa" class="nv-chip" aria-haspopup="menu" aria-expanded="false" title="Trocar a pessoa que estou cuidando">👤 <b id="nvPessoaNome">Eu</b> ▾</button>'+
    '<button type="button" id="nvFamiliaBtn" class="nv-chip" title="Abrir o módulo Família">👨‍👩‍👧 Família</button>'+
    '<button type="button" id="nvRegistrarBtn" class="nv-chip nv-chip-forte" title="Registrar sintoma, remédio, consulta…">➕ Registrar</button>'+
    '<button type="button" id="nvBusca" class="nv-chip" title="Buscar páginas, pessoas e registros (Ctrl+K)">🔎 Buscar</button>'+
    '<button type="button" id="nvPin" class="nv-chip" aria-pressed="false">📌 Fixar</button>'+
  '</div><nav id="nvCaminho" class="nv-caminho" aria-label="Você está aqui"></nav>';
  var ref=$('sfAjudaBox')||topo;ref.insertAdjacentElement('afterend',l);
  $('nvPessoa').onclick=abrirMenuPessoa;
  $('nvFamiliaBtn').onclick=function(){ir('familiares')};
  $('nvRegistrarBtn').onclick=abrirRegistrar;
  $('nvBusca').onclick=function(){abrirPaleta('')};
  $('nvPin').onclick=function(){alternarFixo(paginaAtual())};
  return true;
}
function atualizarLinha(){
  var n=$('nvPessoaNome');if(n)n.textContent=nomeAtual();
  var c=$('nvCaminho');if(!c)return;
  var id=paginaAtual(),partes=[];
  if(id!=='home')partes.push({t:'🏠 Início',id:'home'});
  partes.push({t:semIcone(rotuloDe(id))||id,id:id,atual:true});
  if(id==='familiares'){
    var d=$('familiarDetalhe'),h=d&&d.getClientRects().length?d.querySelector('h2'):null;
    if(h){var nome=semIcone(h.textContent);if(nome){partes[partes.length-1].atual=false;partes.push({t:'Ficha de '+nome,id:'',atual:true})}}
  }
  var html=partes.map(function(x,i){
    var sep=i?'<span class="nv-sep" aria-hidden="true">›</span>':'';
    return sep+(x.atual?'<span class="nv-aqui" aria-current="page">'+esc(x.t)+'</span>':(x.id?'<button type="button" data-nv-ir="'+esc(x.id)+'">'+esc(x.t)+'</button>':'<span>'+esc(x.t)+'</span>'));
  }).join('');
  if(c.getAttribute('data-h')!==html){c.setAttribute('data-h',html);c.innerHTML=html}
  c.style.display=partes.length>1||id!=='home'?'':'none';
}

/* ---------- janelas: registrar rápido, busca (paleta) e atalhos ---------- */
function fecharTudo(){
  ['nvRegistrar','nvPaleta','nvAtalhos'].forEach(function(i){var e=$(i);if(e)e.remove()});
  fecharMenuPessoa();
  var d=$('msaMobileDrawer');if(d&&d.getAttribute('aria-hidden')==='false'){var x=d.querySelector('.msa-mobile-drawer-close');if(x)x.click()}
}
var focoAnterior=null;
function janela(id,html,aria){
  fecharTudo();focoAnterior=document.activeElement;
  var f=document.createElement('div');f.id=id;f.className='nv-fundo';f.innerHTML=html;
  f.setAttribute('role','dialog');f.setAttribute('aria-modal','true');f.setAttribute('aria-label',aria);
  f.addEventListener('mousedown',function(e){if(e.target===f)fecharJanela(id)});
  document.body.appendChild(f);return f;
}
function fecharJanela(id){var e=$(id);if(e)e.remove();try{if(focoAnterior&&focoAnterior.focus)focoAnterior.focus()}catch(x){}}

var ACOES=[
  ['dor','','😣','Registrar sintoma ou dor','Sintoma ou dor'],['meds','','💊','Registrar medicamento','Medicamento'],['consultas','','👨‍⚕️','Registrar consulta','Consulta'],
  ['exames','','🧪','Registrar exame','Exame'],['acompanhamento','','❤️','Registrar pressão, açúcar e batimentos','Pressão e açúcar'],['acompanhamento','academia','⚖️','Registrar peso e medidas','Peso e medidas']
];
/* a ação só aparece se o item correspondente do menu existe no modo atual (ex.: “Peso e medidas” some no Simples) */
function acaoAtiva(a){
  if(!a[1])return !!$(a[0]);
  var el=document.querySelector('#msaMobileDrawer [data-mobile-tab="'+a[0]+'"][data-feature-nav="'+a[1]+'"],#nav .nav-menu [data-tab="'+a[0]+'"][data-feature-nav="'+a[1]+'"]');
  return !!$(a[0])&&(!el||ativoNoModo(el));
}
function acoesAtivas(){return ACOES.filter(acaoAtiva)}
function abrirRegistrar(){
  var as=acoesAtivas();
  var f=janela('nvRegistrar','<div class="nv-folha"><div class="nv-folha-topo"><h2>➕ O que você quer registrar?</h2><button type="button" class="nv-x" data-nv-fechar="nvRegistrar" aria-label="Fechar">✕</button></div><div class="nv-grade">'+
    as.map(function(a){return '<button type="button" data-nv-ir="'+a[0]+'" data-nv-feat="'+a[1]+'"><span>'+a[2]+'</span><b>'+a[4]+'</b></button>'}).join('')+'</div></div>','Registrar');
  var b=f.querySelector('.nv-grade button');if(b)b.focus();
}

function itensPaleta(q){
  var nq=norm(q.trim()),out=[];
  function add(grupo,icone,titulo,sub,acao){if(!nq||norm(titulo+' '+(sub||'')).indexOf(nq)>=0)out.push({grupo:grupo,icone:icone,titulo:titulo,sub:sub||'',acao:acao})}
  if(!nq){
    var r=listaRapida();
    r.fixos.forEach(function(id){add('Fixados','⭐',semIcone(rotuloDe(id)),'',function(){ir(id)})});
    r.recentes.forEach(function(id){add('Recentes','🕘',semIcone(rotuloDe(id)),'',function(){ir(id)})});
  }
  acoesAtivas().forEach(function(a){add('Registrar rápido',a[2],a[3],'',function(){ir(a[0],a[1])})});
  if(nq){
    indicePaginas().forEach(function(p){add('Páginas','📄',semIcone(p.label),'',function(){ir(p.id,p.feature)})});
    pessoas().itens.forEach(function(x){if(x.id)add('Pessoas','👤',x.nome,x.rot.indexOf(' · ')>0?x.rot.split(' · ')[1]:'Familiar',function(){abrirPessoa(x.id)})});
    out.push({grupo:'Nos meus registros',icone:'🔎',titulo:'Buscar “'+q.trim()+'” nos meus registros',sub:'sintomas, consultas, exames, remédios…',acao:function(){buscarRegistros(q.trim())}});
  }
  var vistos={},limpo=[];out.forEach(function(x){var k=x.grupo+'|'+x.titulo;if(!vistos[k]){vistos[k]=1;limpo.push(x)}});
  return limpo.slice(0,18);
}
function abrirPessoa(id){ir('familiares');setTimeout(function(){try{if(typeof window.selecionarFamiliar==='function')window.selecionarFamiliar(id)}catch(e){}},260)}
function buscarRegistros(q){ir('buscar');setTimeout(function(){var i=$('globalSearchInput');if(i){i.value=q;i.dispatchEvent(new Event('input',{bubbles:true}));try{i.focus()}catch(e){}}},260)}
function abrirPaleta(inicial){
  var f=janela('nvPaleta','<div class="nv-paleta"><div class="nv-paleta-topo"><span aria-hidden="true">🔎</span><input id="nvPaletaBusca" type="search" autocomplete="off" placeholder="Buscar página, pessoa ou ação… (ex.: pressão, Ana, exame)" aria-label="Buscar" role="combobox" aria-expanded="true" aria-controls="nvPaletaLista"><button type="button" class="nv-x" data-nv-fechar="nvPaleta" aria-label="Fechar">✕</button></div><div id="nvPaletaLista" class="nv-paleta-lista" role="listbox"></div><div class="nv-paleta-dica">↑ ↓ para escolher · Enter para abrir · Esc para fechar</div></div>','Buscar');
  var inp=$('nvPaletaBusca'),lista=$('nvPaletaLista'),sel=0,itens=[];
  inp.value=inicial||'';
  function pintar(){
    itens=itensPaleta(inp.value);if(sel>=itens.length)sel=Math.max(0,itens.length-1);
    var g='',h='';
    itens.forEach(function(x,i){
      if(x.grupo!==g){g=x.grupo;h+='<div class="nv-grupo">'+esc(g)+'</div>'}
      h+='<button type="button" role="option" id="nvOp'+i+'" data-i="'+i+'" aria-selected="'+(i===sel)+'" class="'+(i===sel?'on':'')+'"><span>'+x.icone+'</span><b>'+esc(x.titulo)+'</b>'+(x.sub?'<small>'+esc(x.sub)+'</small>':'')+'</button>';
    });
    lista.innerHTML=h||'<div class="nv-vazio">Nada encontrado.</div>';
    var on=lista.querySelector('.on');if(on&&on.scrollIntoView)on.scrollIntoView({block:'nearest'});
    inp.setAttribute('aria-activedescendant',on?on.id:'');
  }
  function executar(i){var x=itens[i];if(!x)return;fecharJanela('nvPaleta');x.acao()}
  inp.addEventListener('input',function(){sel=0;pintar()});
  inp.addEventListener('keydown',function(e){
    if(e.key==='ArrowDown'){e.preventDefault();sel=Math.min(itens.length-1,sel+1);pintar()}
    else if(e.key==='ArrowUp'){e.preventDefault();sel=Math.max(0,sel-1);pintar()}
    else if(e.key==='Enter'){e.preventDefault();executar(sel)}
  });
  lista.addEventListener('click',function(e){var b=e.target.closest('[data-i]');if(b)executar(Number(b.getAttribute('data-i')))});
  pintar();inp.focus();
}

var GOTO={h:['home',''],f:['familiares',''],m:['meds',''],c:['consultas',''],e:['exames',''],s:['dor',''],a:['acompanhamento',''],p:['perfil',''],b:['buscar',''],r:['relatorios',''],',':['configuracoes','']};
function abrirAtalhos(){
  var linhas=[['Ctrl + K  ou  /','Buscar página, pessoa ou ação'],['N','Registrar (sintoma, remédio, consulta…)'],['G  depois  H','Início'],['G  depois  F','Familiares'],['G  depois  M','Medicamentos'],['G  depois  C','Consultas'],['G  depois  E','Exames'],['G  depois  S','Sintoma ou dor'],['G  depois  A','Sinais vitais'],['G  depois  P','Meu perfil'],['G  depois  ,','Configurações'],['?','Mostrar esta ajuda'],['Esc','Fechar janelas']];
  janela('nvAtalhos','<div class="nv-folha nv-folha-larga"><div class="nv-folha-topo"><h2>⌨️ Atalhos do teclado</h2><button type="button" class="nv-x" data-nv-fechar="nvAtalhos" aria-label="Fechar">✕</button></div><table class="nv-tabela">'+linhas.map(function(l){return '<tr><th scope="row"><kbd>'+esc(l[0])+'</kbd></th><td>'+esc(l[1])+'</td></tr>'}).join('')+'</table><p class="nv-dica">Os atalhos não funcionam enquanto você digita em um campo.</p></div>','Atalhos do teclado');
}
var sequenciaG=0;
document.addEventListener('keydown',function(e){
  if((e.ctrlKey||e.metaKey)&&String(e.key).toLowerCase()==='k'){e.preventDefault();abrirPaleta('');return}
  if(e.key==='Escape'){var abertas=['nvPaleta','nvRegistrar','nvAtalhos'].some(function(i){return $(i)});if(abertas){e.preventDefault();['nvPaleta','nvRegistrar','nvAtalhos'].forEach(fecharJanela)}else fecharMenuPessoa();return}
  if(e.ctrlKey||e.metaKey||e.altKey||digitando(e.target)||document.querySelector('.nv-fundo'))return;
  var k=String(e.key);
  if(sequenciaG&&Date.now()-sequenciaG<1200){sequenciaG=0;var d=GOTO[k.toLowerCase()];if(d){e.preventDefault();ir(d[0],d[1])}return}
  if(k==='g'||k==='G'){sequenciaG=Date.now();return}
  if(k==='/'){e.preventDefault();abrirPaleta('');return}
  if(k==='?'){e.preventDefault();abrirAtalhos();return}
  if(k==='n'||k==='N'){e.preventDefault();abrirRegistrar()}
});

/* ---------- cliques (delegação) ---------- */
document.addEventListener('click',function(e){
  var alvo=e.target;if(!alvo||!alvo.closest)return;
  var bar=alvo.closest('#msaMobileBar button');
  if(bar){
    var a=bar.getAttribute('data-mobile-action');
    if(a==='register'){e.preventDefault();e.stopImmediatePropagation();abrirRegistrar();return}
    if(a==='search'){e.preventDefault();e.stopImmediatePropagation();abrirPaleta('');return}
    if(a==='menu'){atualizarBlocoRapido()}
    return;
  }
  var ir1=alvo.closest('[data-nv-ir]');
  if(ir1){e.preventDefault();ir(ir1.getAttribute('data-nv-ir'),ir1.getAttribute('data-nv-feat')||'');return}
  var fe=alvo.closest('[data-nv-fechar]');if(fe){fecharJanela(fe.getAttribute('data-nv-fechar'));return}
  var pe=alvo.closest('[data-nv-pessoa]');
  if(pe){var v=pe.getAttribute('data-nv-pessoa');fecharMenuPessoa();if(v==='__novo'){ir('familiares');setTimeout(function(){var t=document.querySelector('[data-fam-ir="adicionar"]');if(t)t.click()},300)}else trocarPessoa(v);return}
  if(!alvo.closest('#nvPessoaMenu')&&!alvo.closest('#nvPessoa'))fecharMenuPessoa();
},true);

/* ---------- Início mais curto: o padrão depende do modo ---------- */
/* Simples: só o essencial · Confortável: essencial + painel recolhido · Completo: tudo aberto (o botão recolhe) */
function prioridadeHome(){
  var p={sfCuidando:1,sfBotoes:1,sfHoje:1,msaNextStepCard:1,nvHomeMais:1};
  if(nivel()!=='simple')p.spPainelBtn=1;
  return p;
}
function homeAberta(){
  var v=ler(K_HOME+'_'+nivel(),null);
  return v===null?nivel()==='advanced':!!v;
}
function organizarHome(){
  var home=$('home');if(!home)return;
  var pri=prioridadeHome(),filhos=[].slice.call(home.children),extras=0,ultimo=null;
  filhos.forEach(function(el){
    if(pri[el.id]){ultimo=el;el.classList.remove('nv-home-extra');return}
    if(el.tagName==='H2'||el.classList.contains('msa-page-guide'))return;
    el.classList.add('nv-home-extra');extras++;
  });
  var aberto=homeAberta();
  document.body.classList.toggle('nv-home-aberto',aberto);
  var b=$('nvHomeMais');
  if(!extras){if(b)b.remove();return}
  if(!b){b=document.createElement('button');b.id='nvHomeMais';b.type='button';b.className='nv-home-mais';
    b.onclick=function(){gravar(K_HOME+'_'+nivel(),!homeAberta());organizarHome()}}
  b.setAttribute('aria-expanded',String(aberto));
  b.innerHTML=aberto?'▲ Mostrar menos':'📊 Ver painel completo e mais atalhos <small>('+extras+' blocos)</small>';
  var ref=ultimo||$('sfHoje')||$('sfBotoes');
  if(ref&&ref.nextElementSibling!==b)ref.insertAdjacentElement('afterend',b);
  else if(!ref&&b.parentNode!==home)home.appendChild(b);
}

/* ---------- formulários longos: botão Salvar sempre à mão (celular) ---------- */
function botaoSalvar(f){
  var bs=[].slice.call(f.querySelectorAll('button')).filter(function(x){return x.getClientRects().length});
  var env=bs.filter(function(x){return x.type==='submit'});if(env.length)return env[env.length-1];
  var sal=bs.filter(function(x){return /^\s*💾|salvar|cadastrar|guardar/i.test(x.textContent)});
  return sal[sal.length-1]||null;
}
function marcarFormsLongos(){
  var celular=window.matchMedia&&window.matchMedia('(max-width:760px)').matches;
  document.querySelectorAll('#main-content form').forEach(function(f){
    var visivel=f.getClientRects().length>0;
    var longo=!!(celular&&visivel&&f.getBoundingClientRect().height>window.innerHeight*1.3);
    var b=longo?botaoSalvar(f):null;
    f.classList.toggle('nv-form-longo',longo);
    f.querySelectorAll('.nv-salvar-fixo').forEach(function(x){if(x!==b)x.classList.remove('nv-salvar-fixo')});
    if(b)b.classList.add('nv-salvar-fixo');
  });
}

/* ---------- ciclo de atualização ---------- */
var ultimaPagina='',ultimoNivel='';
function tick(){
  document.body.classList.add('nv-lateral-on');
  montarLinha();
  marcarModo();marcarRepetidos();marcarGruposVazios();
  var id=paginaAtual(),n=nivel();
  if(n!==ultimoNivel){ultimoNivel=n;organizarHome();atualizarBlocoRapido()}
  if(id!==ultimaPagina){ultimaPagina=id;registrarVisita(id);fecharMenuPessoa();atualizarFixos()}
  atualizarLinha();
  marcarFormsLongos();
}
function iniciar(){
  tick();organizarHome();atualizarBlocoRapido();
  setInterval(function(){if(!document.hidden)tick()},700);
  var home=$('home');
  if(home&&window.MutationObserver){var t=0;new MutationObserver(function(){clearTimeout(t);t=setTimeout(organizarHome,120)}).observe(home,{childList:true})}
  window.addEventListener('popstate',function(){setTimeout(tick,60)});
  window.addEventListener('resize',function(){marcarFormsLongos()});
  window.addEventListener('msa:experience-changed',function(){setTimeout(function(){ultimoNivel='';tick()},30)});
  window.msaNavegacao={abrirPaleta:abrirPaleta,abrirRegistrar:abrirRegistrar,abrirAtalhos:abrirAtalhos,fixar:alternarFixo};
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(iniciar,300)},{once:true});
else setTimeout(iniciar,300);
})();


/* Minha Saúde IA — V7.81
 * Preferência permanente de interface: nunca usar menu lateral fixo no desktop.
 * A navegação fica no topo e o menu completo só abre sob demanda.
 */
(function(){
 'use strict';
 if(window.__msaNavNoSidebarV781)return;
 window.__msaNavNoSidebarV781=true;
 var css=`
  /* Desativa a navegação lateral no desktop e não reserva largura para ela. */
  body.nv-lateral-on #nav,
  #nav.nv-lateral,
  .nv-lateral,
  .nv-sidebar,
  .msa-desktop-sidebar,
  #msaSidebar,
  aside.sidebar,
  .app-sidebar,
  .desktop-sidebar,
  .sidebar-nav,
  .left-sidebar {
    display:none!important;
    visibility:hidden!important;
    width:0!important;
    min-width:0!important;
    max-width:0!important;
    flex:0 0 0!important;
    transform:translateX(-110%)!important;
    pointer-events:none!important;
  }
  body.nv-lateral-on,
  body.nv-lateral-on #main-content,
  body.nv-lateral-on .wrap,
  body.nv-lateral-on main {
    margin-left:0!important;
    padding-left:0;
    width:auto;
    max-width:100%;
  }
  #msaPrimaryNav {
    display:flex!important;
    position:relative!important;
    top:auto!important;
    left:auto!important;
    right:auto!important;
    width:100%!important;
    margin:0 0 14px!important;
  }
  #msaMobileMenuFab {display:none!important}
  @media(max-width:760px) {
    #msaPrimaryNav {display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important}
  }
 `;
 function install(){
   if(!document.getElementById('msaV781NoSidebarStyle')){
     var st=document.createElement('style');st.id='msaV781NoSidebarStyle';st.textContent=css;document.head.appendChild(st);
   }
   document.body.classList.add('msa-no-left-menu');
   var nav=document.getElementById('nav');
   if(nav){nav.classList.remove('nv-lateral');nav.setAttribute('aria-hidden','true');nav.style.setProperty('display','none','important');}
   var fab=document.getElementById('msaMobileMenuFab');
   if(fab){fab.style.setProperty('display','none','important');fab.setAttribute('aria-hidden','true');}
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
 else install();
})();

/* V7.82 — atalho Família visível na navegação superior, sem menu lateral. */
