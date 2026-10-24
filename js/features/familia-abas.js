/* Minha Saúde IA — página Família em abas (V7.27)
 * A página tinha ~7.000 px de altura. Agora o conteúdo fica separado por assunto:
 * 👥 Pessoas · ➕ Adicionar pessoa · 🧬 Saúde da família (histórico e padrões) · 💑 Cônjuge e compartilhar
 * Só mostra/esconde blocos que já existem; não muda dados nem formulários.
 */
(function(){
'use strict';
if(window.__msaFamiliaAbas)return;window.__msaFamiliaAbas=true;
function $(id){return document.getElementById(id)}
var ABAS=[
 ['pessoas','👥','Pessoas','Veja e edite quem você cuida'],
 ['adicionar','➕','Adicionar','Cadastrar uma pessoa nova'],
 ['historico','🧬','Padrões familiares','Doenças e antecedentes registrados'],
 ['conjuge','💑','Importar cônjuge','Compartilhar e revisar dados']
];
/* qual aba mostra cada bloco (por id; os sem id são achados pelo texto) */
var MAPA={msaFamiliaFiltro:'pessoas',familiaPessoasCard:'pessoas',familiarDetalhe:'pessoas',familiaCadastroCard:'adicionar',familiaInteligencia:'historico',msaBasicShareCard:'conjuge',msaCoupleCareV716:'conjuge'};
function pessoasCount(){try{return ((typeof get==='function'&&typeof K!=='undefined')?get(K.familiares||'msa2_familiares'):[]).length}catch(e){return 0}}
function marcar(){
 var sec=$('familiares');if(!sec)return;
 /* Cada bloco de primeiro nível do cartão principal pertence a uma única aba.
    Isso impede que conteúdo sem categoria continue aparecendo e alongue a página. */
 var host=Array.prototype.slice.call(sec.children).filter(function(el){return el.classList&&el.classList.contains('card')})[0]||sec.querySelector('.card');
 if(!host)return;
 var porId={msaFamiliaFiltro:'pessoas',familiaPessoasCard:'pessoas',familiarDetalhe:'pessoas',familiaCadastroCard:'adicionar',familiaInteligencia:'historico',msaBasicShareCard:'conjuge',msaCoupleCareV716:'conjuge'};
 Array.prototype.slice.call(host.children).forEach(function(el){
  if(el.tagName==='H2'){el.removeAttribute('data-fam-aba');return}
  var id=el.id||'',aba=porId[id]||'';
  var area=el.getAttribute('data-fam-area')||'';
  var txt=(el.innerText||el.textContent||'').trim();
  if(!aba){
   if(area==='cadastro'||/adicionar pessoa|cadastre uma pessoa|novo familiar/i.test(txt))aba='adicionar';
   else if(area==='ia'||/padrões familiares|histórico familiar|inteligência familiar|doenças na família/i.test(txt))aba='historico';
   else if(/compartilhar meus dados|importar arquivo|cuidado a dois|compartilhamento simples/i.test(txt))aba='conjuge';
   else if(el.classList.contains('muted')||el.classList.contains('alert'))aba='adicionar';
   else aba='pessoas';
  }
  el.dataset.famAba=aba;
 });
}
function barra(){
 var sec=$('familiares');if(!sec)return null;var b=$('msaFamAbas');
 if(!b){b=document.createElement('nav');b.id='msaFamAbas';b.className='msa-fam-abas';b.setAttribute('role','tablist');b.setAttribute('aria-label','Partes da página Família');
  var guia=sec.querySelector('.msa-page-guide');if(guia)guia.insertAdjacentElement('afterend',b);else sec.insertBefore(b,sec.firstChild)}
 var atual=sec.getAttribute('data-aba')||'pessoas',n=pessoasCount();
 b.innerHTML=ABAS.map(function(a){return '<button type="button" role="tab" data-fam-ir="'+a[0]+'" aria-selected="'+(a[0]===atual)+'" class="'+(a[0]===atual?'on':'')+'"><span>'+a[1]+'</span><b>'+a[2]+(a[0]==='pessoas'&&n?' ('+n+')':'')+'</b><small>'+a[3]+'</small></button>'}).join('');
 return b;
}
function abrir(aba,rolar){
 var sec=$('familiares');if(!sec)return;
 if(!ABAS.some(function(a){return a[0]===aba}))aba='pessoas';
 sec.setAttribute('data-aba',aba);try{sessionStorage.setItem('msaFamAba',aba)}catch(e){}
 marcar();barra();
 if(rolar){var b=$('msaFamAbas');if(b)b.scrollIntoView({behavior:'smooth',block:'start'})}
}
document.addEventListener('click',function(e){
 var t=e.target.closest('[data-fam-ir]');if(t){abrir(t.getAttribute('data-fam-ir'),true);return}
 /* atalhos que levam a uma parte específica */
 if(e.target.closest('[data-fam-open], [data-fam-edit], [data-partner-open], [data-partner-edit]'))setTimeout(function(){abrir('pessoas')},30);
});
/* o botão “💑 Compartilhar” do menu para o clique no caminho; por isso escuta antes (captura) */
document.addEventListener('click',function(e){if(e.target.closest('.msa-nav-share, #msaShareEasyBtn')){window.__famForcar={aba:'conjuge',ate:Date.now()+3000};[50,400,900].forEach(function(t){setTimeout(function(){abrir('conjuge')},t)})}},true);
function embrulhar(nome,aba){var f=window[nome];if(typeof f!=='function'||f.__abas)return;window[nome]=function(){var fz=window.__famForcar;if(!(fz&&Date.now()<fz.ate)){if(nome==='focarEdicaoFamiliar'){try{sessionStorage.setItem('msaFamSub','dados')}catch(e){}}abrir(aba)}var r=f.apply(this,arguments);if(nome==='focarEdicaoFamiliar')setTimeout(subAbas,60);return r};window[nome].__abas=true}
var css=document.createElement('style');css.id='msa-familia-abas';
css.textContent=
 '#familiares[data-aba] > .card > [data-fam-aba]{display:none!important}'+
 '#familiares[data-aba="pessoas"] > .card > [data-fam-aba="pessoas"],#familiares[data-aba="adicionar"] > .card > [data-fam-aba="adicionar"],#familiares[data-aba="historico"] > .card > [data-fam-aba="historico"],#familiares[data-aba="conjuge"] > .card > [data-fam-aba="conjuge"]{display:block!important}'+
 '#familiares[data-aba]:not([data-aba="pessoas"]) #msaFamiliaFiltro{display:none!important}'+
 '#familiares[data-aba="pessoas"] #msaFamiliaFiltro{display:flex!important}'+
 '.msa-fam-abas{position:sticky;top:64px;z-index:30;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;margin:0 0 14px;padding:6px;border-radius:16px;background:var(--card,#fff);border:1px solid var(--line,#e2e8f0);box-shadow:0 6px 18px rgba(15,23,42,.06)}'+
 '.msa-fam-abas button{display:flex;flex-direction:column;align-items:center;gap:2px;min-height:64px;padding:8px 4px;border-radius:12px;border:1px solid transparent;background:transparent;color:inherit;font:inherit;text-align:center;cursor:pointer}'+
 '.msa-fam-abas button span{font-size:22px;line-height:1}.msa-fam-abas button b{font-size:12.5px;line-height:1.2;white-space:normal;overflow-wrap:anywhere}.msa-fam-abas button small{display:none;font-size:11.5px;color:#64748b;line-height:1.25}'+
 '.msa-fam-abas button.on{background:#eff6ff;border-color:#93c5fd;color:#1d4ed8}.msa-fam-abas button:focus-visible{outline:3px solid #2563eb;outline-offset:2px}'+
 '@media(min-width:760px){.msa-fam-abas button small{display:block}.msa-fam-abas button b{font-size:14.5px}}'+
 'body.msa-dark .msa-fam-abas{background:#111827;border-color:#263244}body.msa-dark .msa-fam-abas button.on{background:#172554;border-color:#1e40af;color:#bfdbfe}';
document.head.appendChild(css);
function iniciar(){
 var sec=$('familiares');if(!sec)return;
 var ini='';try{ini=sessionStorage.getItem('msaFamAba')||''}catch(e){}
 abrir(ini||'pessoas');
 var agendado=false;new MutationObserver(function(){marcar();if(!agendado){agendado=true;setTimeout(function(){agendado=false;subAbas()},40)}}).observe(sec,{childList:true,subtree:true});
 subAbas();
 ['focarEdicaoFamiliar','selecionarFamiliar','excluirFamiliar'].forEach(function(n){embrulhar(n,'pessoas')});
 if(typeof window.go==='function'&&!window.go.__abas){var o=window.go;window.go=function(id){var r=o.apply(this,arguments);if(id==='familiares')setTimeout(function(){marcar();barra()},60);return r};window.go.__abas=true}
}

/* ---- ficha da pessoa em sub-abas (era ~6.000 px numa coluna só) ---- */
var SUB=[['dados','📋','Dados',/editar dados|dados pessoais/i],['saude','🩺','Saúde',/perfil de saúde/i],['remedios','💊','Remédios',/medicamentos/i],['consultas','👨‍⚕️','Consultas',/consultas/i],['ocorrencias','🚨','Ocorrências',/crises|intercorr/i],['historico','🧬','Histórico',/histórico familiar|hereditári/i]];
function subAbas(){
 var d=$('familiarDetalhe');if(!d)return;var blocos=[].slice.call(d.querySelectorAll('.familiar-subcard'));if(blocos.length<2)return;
 var usados={};
 blocos.forEach(function(b){var h=b.querySelector('summary,h2,h3,h4');var t=h?h.textContent:'';var ach=SUB.filter(function(x){return x[3].test(t)})[0];var id=ach?ach[0]:'dados';b.dataset.famSub=id;usados[id]=1;if(b.tagName==='DETAILS')b.open=true});
 var atual='';try{atual=sessionStorage.getItem('msaFamSub')||''}catch(e){}if(!usados[atual])atual=Object.keys(usados)[0];
 d.setAttribute('data-sub',atual);
 var bar=d.querySelector('.msa-fam-sub');
 if(!bar){bar=document.createElement('div');bar.className='msa-fam-sub';bar.setAttribute('role','tablist');bar.setAttribute('aria-label','Partes da ficha');var pri=blocos[0];var ref=pri.closest('.familiar-grid')||pri;ref.parentNode.insertBefore(bar,ref)}
 var html=SUB.filter(function(x){return usados[x[0]]}).map(function(x){return '<button type="button" role="tab" data-fam-sub-ir="'+x[0]+'" aria-selected="'+(x[0]===atual)+'" class="'+(x[0]===atual?'on':'')+'">'+x[1]+' '+x[2]+'</button>'}).join('');
 if(bar.innerHTML!==html)bar.innerHTML=html;
}
document.addEventListener('click',function(e){var b=e.target.closest('[data-fam-sub-ir]');if(!b)return;try{sessionStorage.setItem('msaFamSub',b.getAttribute('data-fam-sub-ir'))}catch(x){}subAbas();var bar=document.querySelector('.msa-fam-sub');if(bar)bar.scrollIntoView({behavior:'smooth',block:'nearest'})});
/* “Editar perfil” sempre abre a parte Dados */
document.addEventListener('click',function(e){if(e.target.closest('[onclick*="focarEdicaoFamiliar"], [data-partner-edit]')){try{sessionStorage.setItem('msaFamSub','dados')}catch(x){}setTimeout(subAbas,80)}},true);
(function(){var st=document.createElement('style');st.textContent='#familiarDetalhe[data-sub] .familiar-subcard[data-fam-sub]{display:none!important}'+SUB.map(function(x){return '#familiarDetalhe[data-sub="'+x[0]+'"] .familiar-subcard[data-fam-sub="'+x[0]+'"]{display:block!important}'}).join('')+'#familiarDetalhe .familiar-grid{display:block!important}.msa-fam-sub{display:flex;gap:6px;overflow-x:auto;margin:10px 0 12px;padding:4px 2px;scrollbar-width:thin}.msa-fam-sub button{flex:0 0 auto;min-height:42px;padding:8px 14px;border-radius:999px;border:1px solid var(--line,#e2e8f0);background:var(--card,#fff);color:inherit;font:inherit;font-weight:800;font-size:14px;cursor:pointer;white-space:nowrap}.msa-fam-sub button.on{background:#2563eb;border-color:#2563eb;color:#fff}body.msa-dark .msa-fam-sub button{background:#111827;border-color:#263244}body.msa-dark .msa-fam-sub button.on{background:#2563eb}';document.head.appendChild(st)})();
window.msaFamiliaAba=abrir;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(iniciar,900)});else setTimeout(iniciar,900);
})();
