/* Minha Saúde IA — abas para Configurações V7.64
 * Organiza cartões existentes sem apagar nem recriar dados dos módulos.
 */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const panelMap={
 geral:'msaConfigPanelGeral',
 aparencia:'msaConfigPanelAparencia',
 medicos:'msaConfigPanelMedicos',
 familia:'msaConfigPanelFamilia',
 dados:'msaConfigPanelDados',
 ajuda:'msaConfigPanelAjuda'
};
function activate(key,focus){
 if(!panelMap[key])key='geral';
 const tabs=document.querySelectorAll('#msaConfigTabs [data-config-tab]');
 tabs.forEach(btn=>{
  const active=btn.dataset.configTab===key;
  btn.setAttribute('aria-selected',active?'true':'false');
  btn.tabIndex=active?0:-1;
 });
 Object.keys(panelMap).forEach(name=>{
  const panel=$(panelMap[name]);
  if(panel)panel.hidden=name!==key;
 });
 if(focus){const b=document.querySelector('#msaConfigTabs [data-config-tab="'+key+'"]');if(b)b.focus();}
}
function moveCard(id,targetId){
 const node=$(id),target=$(targetId);
 if(node&&target&&node.parentElement!==target)target.appendChild(node);
}
function organize(){
 if(!$('configuracoes')||!$('msaConfigTabs'))return;
 // Um módulo pode ser inicializado depois da criação das abas. Realocar somente os cartões,
 // mantendo os IDs e todos os formulários/handlers existentes.
 const appearance=$('msaConfigPanelAparencia');
 const host=$('msaSettingsProfessional');
 if(host&&appearance&&host.parentElement!==appearance)appearance.appendChild(host);
 moveCard('msaSettingsAppearanceCard','msaConfigPanelAparencia');
 moveCard('msaSettingsDataCard','msaConfigPanelDados');
 moveCard('msaSettingsDiagnosticsCard','msaConfigPanelAjuda');
 moveCard('msaSettingsRestoreCard','msaConfigPanelGeral');
 moveCard('msaDoctorsSettings760','msaConfigPanelMedicos');
}
function bindTabs(){
 const tabs=document.querySelectorAll('#msaConfigTabs [data-config-tab]');
 tabs.forEach(btn=>{
  if(btn.dataset.msaConfigBound==='1')return;
  btn.dataset.msaConfigBound='1';
  btn.addEventListener('click',()=>activate(btn.dataset.configTab,false));
  btn.addEventListener('keydown',e=>{
   const all=Array.from(document.querySelectorAll('#msaConfigTabs [data-config-tab]'));
   const i=all.indexOf(btn);
   let next=-1;
   if(e.key==='ArrowRight')next=(i+1)%all.length;
   else if(e.key==='ArrowLeft')next=(i-1+all.length)%all.length;
   else if(e.key==='Home')next=0;
   else if(e.key==='End')next=all.length-1;
   if(next>=0){e.preventDefault();activate(all[next].dataset.configTab,true);}
  });
 });
}
function init(){
 if(!$('configuracoes')||!$('msaConfigTabs'))return;
 bindTabs();
 organize();
 activate('geral',false);
 const section=$('configuracoes');
 if(window.MutationObserver){
  const observer=new MutationObserver(()=>organize());
  observer.observe(section,{childList:true,subtree:true});
 }
 // Repassa a organização após os módulos que criam cartões em DOMContentLoaded.
 setTimeout(organize,150);
 setTimeout(organize,700);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
