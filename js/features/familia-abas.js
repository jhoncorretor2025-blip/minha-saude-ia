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
 if(e.target.closest('[data-fam-open], [data-fam-edit], [data-partner-open], [data-partner-edit]')){try{sessionStorage.setItem('msaFamChip_pessoas','ficha')}catch(x){}setTimeout(function(){abrir('pessoas');aplicarChips();var d=$('familiarDetalhe');if(d)d.scrollIntoView({behavior:'smooth',block:'start'})},60)}
});
/* o botão “💑 Compartilhar” do menu para o clique no caminho; por isso escuta antes (captura) */
document.addEventListener('click',function(e){if(e.target.closest('.msa-nav-share, #msaShareEasyBtn')){window.__famForcar={aba:'conjuge',ate:Date.now()+3000};[50,400,900].forEach(function(t){setTimeout(function(){abrir('conjuge')},t)})}},true);
function embrulhar(nome,aba){var f=window[nome];if(typeof f!=='function'||f.__abas)return;window[nome]=function(){var fz=window.__famForcar;if(!(fz&&Date.now()<fz.ate)){if(nome!=='excluirFamiliar'){try{sessionStorage.setItem('msaFamChip_pessoas','ficha')}catch(e){}}if(nome==='focarEdicaoFamiliar'){window.__famEditando=Date.now()+4000;try{sessionStorage.setItem('msaFamSub','dados')}catch(e){}}abrir(aba)}var r=f.apply(this,arguments);if(nome==='focarEdicaoFamiliar')setTimeout(subAbas,60);return r};window[nome].__abas=true}
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
 var agendado=false;new MutationObserver(function(){marcar();if(!agendado){agendado=true;setTimeout(function(){agendado=false;subAbas();aplicarChips();formEnxuto()},40)}}).observe(sec,{childList:true,subtree:true});
 subAbas();aplicarChips();formEnxuto();
 ['focarEdicaoFamiliar','selecionarFamiliar','excluirFamiliar'].forEach(function(n){embrulhar(n,'pessoas')});
 if(typeof window.go==='function'&&!window.go.__abas){var o=window.go;window.go=function(id){var r=o.apply(this,arguments);if(id==='familiares')setTimeout(function(){marcar();barra()},60);return r};window.go.__abas=true}
}

/* ---- ficha da pessoa em sub-abas (era ~6.000 px numa coluna só) ---- */
var SUB=[['dados','📋','Dados',/editar dados|dados pessoais/i],['saude','🩺','Saúde',/perfil de saúde/i],['remedios','💊','Remédios',/medicamentos/i],['consultas','👨‍⚕️','Consultas',/consultas/i],['ocorrencias','🚨','Ocorrências',/crises|intercorr/i],['historico','🧬','Histórico',/histórico familiar|hereditári/i]];
function subAbas(){
 var d=$('familiarDetalhe');if(!d)return;var blocos=[].slice.call(d.querySelectorAll('.familiar-subcard'));if(blocos.length<2)return;
 var usados={};
 blocos.forEach(function(b){var h=b.querySelector('summary,h2,h3,h4');var t=h?h.textContent:'';var ach=SUB.filter(function(x){return x[3].test(t)})[0];var id=ach?ach[0]:'dados';b.dataset.famSub=id;usados[id]=1;if(b.tagName==='DETAILS'){if(id!=='dados')b.open=true;else if(!b.dataset.v756){b.dataset.v756='1';b.open=!!(window.__famEditando&&Date.now()<window.__famEditando)}}});
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

/* ===== V7.56 — sub-categorias (chips) dentro das abas, para não precisar rolar ===== */
var CHIPS={
 pessoas:{host:'familiaPessoasCard',itens:[['lista','👥 Lista',['familiaresList','msaFamilyQuickTools','msaFamilyAdvancedFilters']],['ficha','👤 Ficha aberta',['familiarDetalhe']],['resumo','📊 Resumo',['msaFamilyDashboard','msaFamilyBulkStatus']],['geracoes','🌳 Gerações',['msaFamilyTreePanel']],['vinculos','🔗 Vínculos',['msaFamilyRelationshipAudit']]]},
 historico:{host:'familiaInteligencia',itens:[['ia','🤖 Com IA',['.msa-fam-ai-card','.msa-fam-actions']],['arvore','🌳 Árvore',['msa-fam-map']],['padroes','📊 Padrões',['msa-fam-analysis']],['vinculos','🔗 Corrigir vínculos',['msaFamLinkRepairCard']]]}
};
function chipAtual(aba){var c=CHIPS[aba];var v='';try{v=sessionStorage.getItem('msaFamChip_'+aba)||''}catch(e){}return c.itens.some(function(i){return i[0]===v})?v:c.itens[0][0]}
function aplicarChips(){
 Object.keys(CHIPS).forEach(function(aba){
  var cfg=CHIPS[aba],host=$(cfg.host);if(!host)return;var atual=chipAtual(aba),existe={};
  cfg.itens.forEach(function(it){it[2].forEach(function(sel){var els=sel.charAt(0)==='.'?[].slice.call(host.querySelectorAll(sel)):[$(sel)];els.forEach(function(el){if(!el)return;existe[it[0]]=1;el.classList.toggle('msa-chip-off',it[0]!==atual)})})});
  var bar=host.querySelector(':scope > .msa-fam-chips');
  if(!bar){bar=document.createElement('div');bar.className='msa-fam-chips';bar.setAttribute('role','tablist');var h=host.querySelector(':scope > h2, :scope > h3');if(h)h.insertAdjacentElement('afterend',bar);else host.insertBefore(bar,host.firstChild)}
  var nomeFicha=(function(){var h=document.querySelector('#familiarDetalhe .familiar-detail-head h2, #familiarDetalhe h2');return h?h.textContent.replace(/^\s*\S+\s*/,'').trim().slice(0,18):''})();
  var html=cfg.itens.filter(function(i){return existe[i[0]]}).map(function(i){var rot=i[0]==='ficha'&&nomeFicha?'👤 '+nomeFicha:i[1];return '<button type="button" role="tab" data-fam-chip="'+aba+':'+i[0]+'" aria-selected="'+(i[0]===atual)+'" class="'+(i[0]===atual?'on':'')+'">'+rot+'</button>'}).join('');
  if(bar.innerHTML!==html)bar.innerHTML=html;
 });
}
document.addEventListener('click',function(e){var b=e.target.closest('[data-fam-chip]');if(!b)return;var p=b.getAttribute('data-fam-chip').split(':');try{sessionStorage.setItem('msaFamChip_'+p[0],p[1])}catch(x){}aplicarChips()});
/* formulário de cadastro: o essencial aparece; o resto fica em “Mais informações (opcional)” */
function formEnxuto(){
 var f=$('familiarForm');if(!f||f.dataset.v756)return;var mover=['fVinculosBox','msaFamilyClinicalFields','fPerfilSaudeCampos'].map($).filter(Boolean);if(!mover.length)return;f.dataset.v756='1';
 var d=document.createElement('details');d.className='msa-fam-mais';d.innerHTML='<summary>➕ Mais informações (opcional): vínculos, saúde, remédios…</summary>';
 mover[0].parentNode.insertBefore(d,mover[0]);
 /* leva junto os campos soltos entre esses blocos (ex.: observações), mas nunca o botão de salvar */
 var el=d.nextElementSibling;while(el&&!el.matches('button,[type=submit]')&&!el.querySelector('button[type=submit],button:not([type])')){var prox=el.nextElementSibling;d.appendChild(el);el=prox}
}
(function(){var st=document.createElement('style');st.textContent='.msa-chip-off,#familiares[data-aba][data-aba] .msa-chip-off{display:none!important}.msa-fam-chips{display:flex;gap:6px;overflow-x:auto;margin:8px 0 12px;padding:4px 2px;scrollbar-width:thin}.msa-fam-chips button{flex:0 0 auto;min-height:42px;padding:8px 14px;border-radius:999px;border:1px solid var(--line,#e2e8f0);background:var(--card,#fff);color:inherit;font:inherit;font-weight:800;font-size:14px;cursor:pointer;white-space:nowrap}.msa-fam-chips button.on{background:#0f766e;border-color:#0f766e;color:#fff}.msa-fam-mais{margin:10px 0;border:1px dashed #94a3b8;border-radius:14px;padding:4px 12px}.msa-fam-mais>summary{cursor:pointer;font-weight:800;padding:10px 0;min-height:24px}body.msa-dark .msa-fam-chips button{background:#111827;border-color:#263244}body.msa-dark .msa-fam-chips button.on{background:#0f766e}';document.head.appendChild(st)})();

window.msaFamiliaAba=abrir;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(iniciar,900)});else setTimeout(iniciar,900);
})();
