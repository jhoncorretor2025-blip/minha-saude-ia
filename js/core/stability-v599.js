/* Minha Saúde IA — monitor de estabilidade V5.99 */
(function(){
'use strict';
function run(){
 var checks=[
  ['armazenamento',!!window.msaStorage&&!!window.MSAStorage],
  ['constantes',!!window.MSA_K],
  ['navegação',typeof window.go==='function'],
  ['renderização',typeof window.render==='function']
 ];
 var falhas=checks.filter(function(x){return !x[1]}).map(function(x){return x[0]});
 if(falhas.length){
  var box=document.getElementById('msa99-status');
  if(box){box.style.display='block';box.textContent='⚠️ O sistema detectou um módulo que não carregou: '+falhas.join(', ')+'. Atualize a página e tente novamente.';}
  console.error('[Minha Saúde IA V5.99] módulos ausentes:',falhas);
 }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(run,250)});else setTimeout(run,250);
window.MSAStability={run:run};
})();
