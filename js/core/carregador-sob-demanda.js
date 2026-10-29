/* Minha Saúde IA — carregador sob demanda (V7.84)
 * Os módulos pesados da Família (~270 KB) não são mais baixados e executados na abertura do app.
 * Eles carregam quando: (1) a página da Família/Círculo é aberta (inclusive por link direto), (2) alguém toca num botão que depende deles,
 * ou (3) o navegador fica ocioso depois da abertura. As tags ficam no index.html com type="text/msa-lazy" (o navegador ignora).
 * Também guarda o evento “instalar app” do navegador, que pode chegar antes dos outros scripts. */
(function(){
'use strict';
if(window.msaCarregador)return;

/* ---- instalar como app: guardar o evento cedo ---- */
window.addEventListener('beforeinstallprompt',function(e){
  e.preventDefault();window.__msaInstallEvt=e;
  try{window.dispatchEvent(new Event('msa:instalavel'))}catch(x){}
});
window.addEventListener('appinstalled',function(){
  window.__msaInstallEvt=null;
  try{window.dispatchEvent(new Event('msa:instalado'))}catch(x){}
});

/* ---- grupos carregados sob demanda ---- */
var GRUPOS={
  familia:{
    paginas:['familiares','familia','parceiro'],
    /* botões do index.html que chamam funções do grupo: viram “atalhos” que carregam o grupo e repetem a chamada */
    atalhos:['abrirImportadorRespostaFamilia','abrirPromptFamiliaIA','copiarEntrevistaParceiroWhatsApp','marcarFamiliaresComDadosDeFalecimento','marcarFamiliaresNaoInformadosVivos']
  }
};
var promessas={},prontos={};

function tags(g){return [].slice.call(document.querySelectorAll('script[type="text/msa-lazy"][data-grupo="'+g+'"]'))}
function carregar(g){
  if(promessas[g])return promessas[g];
  /* os módulos dependem dos arquivos base do site (que carregam com defer): só começa depois do DOMContentLoaded */
  if(document.readyState==='loading')return new Promise(function(res){document.addEventListener('DOMContentLoaded',function(){carregar(g).then(res)},{once:true})});
  var lista=tags(g);
  promessas[g]=new Promise(function(resolve){
    if(!lista.length){prontos[g]=true;resolve();return}
    var falta=lista.length;
    function fim(){falta--;if(falta<=0){prontos[g]=true;try{window.dispatchEvent(new CustomEvent('msa:grupo-carregado',{detail:{grupo:g}}))}catch(e){}resolve()}}
    lista.forEach(function(t){
      var s=document.createElement('script');
      s.src=t.getAttribute('data-src');
      s.async=false; /* baixa em paralelo, mas executa na ordem do index.html */
      s.onload=fim;
      s.onerror=function(){console.warn('[Minha Saúde IA] não foi possível carregar',s.src);fim()};
      document.head.appendChild(s);
    });
  });
  return promessas[g];
}

/* ---- atalhos para os botões que dependem do grupo ---- */
Object.keys(GRUPOS).forEach(function(g){
  GRUPOS[g].atalhos.forEach(function(nome){
    if(typeof window[nome]==='function')return;
    var atalho=function(){
      var self=this,args=arguments;
      carregar(g).then(function(){var f=window[nome];if(typeof f==='function'&&!f.__msaAtalho)f.apply(self,args)});
    };
    atalho.__msaAtalho=true;
    window[nome]=atalho;
  });
});

/* ---- gatilhos ---- */
function paginaDaUrl(){try{return new URL(location.href).searchParams.get('pagina')||''}catch(e){return ''}}
Object.keys(GRUPOS).forEach(function(g){
  if(GRUPOS[g].paginas.indexOf(paginaDaUrl())>=0)carregar(g); /* link direto para a página */
});
function vigiarPaginas(){
  Object.keys(GRUPOS).forEach(function(g){
    GRUPOS[g].paginas.forEach(function(id){
      var s=document.getElementById(id);if(!s||s.__msaVigiado)return;s.__msaVigiado=true;
      if(s.classList.contains('active'))carregar(g);
      if(window.MutationObserver)new MutationObserver(function(){if(s.classList.contains('active')||getComputedStyle(s).display!=='none')carregar(g)}).observe(s,{attributes:true,attributeFilter:['class','style']});
    });
  });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',vigiarPaginas,{once:true});else vigiarPaginas();

/* com o app já aberto e o navegador ocioso, carrega o que falta (assim nada fica sem funcionar por muito tempo) */
function quandoOcioso(){
  var go=function(){Object.keys(GRUPOS).forEach(carregar)};
  if(window.requestIdleCallback)window.requestIdleCallback(go,{timeout:7000});else setTimeout(go,5000);
}
if(document.readyState==='complete')setTimeout(quandoOcioso,2000);
else window.addEventListener('load',function(){setTimeout(quandoOcioso,2000)},{once:true});

window.msaCarregador={carregar:carregar,pronto:function(g){return !!prontos[g]},grupos:GRUPOS};
})();
