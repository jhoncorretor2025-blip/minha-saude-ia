/* Minha Saúde IA V7.38 — áreas principais, com navegação sobre módulos existentes.
   Não migra, renomeia nem apaga dados. As novas áreas são atalhos para telas já existentes. */
(function(){
 'use strict';
 var AREA_STYLE='msaAreasPrincipaisStyles';
 var cards=[
  {id:'home',icon:'🏠',title:'Painel de Saúde',desc:'Resumo, indicadores e próximos cuidados.',target:'home'},
  {id:'historicoClinico',icon:'🩺',title:'Histórico Clínico',desc:'Perfil, sintomas, consultas e linha do tempo.',target:'historicoClinico'},
  {id:'exames',icon:'🧪',title:'Exames e Documentos',desc:'Resultados, laudos e arquivos médicos.',target:'exames'},
  {id:'meds',icon:'💊',title:'Tratamentos e Medicamentos',desc:'Medicamentos e registros de tratamento.',target:'meds'},
  {id:'familia',icon:'🧬',title:'Família e Genética',desc:'Histórico familiar e informações hereditárias.',target:'familia'},
  {id:'ia',icon:'🤖',title:'Central de Inteligência Artificial',desc:'Assistente, perguntas e apoio para organizar informações.',target:'ia'}
 ];
 function goTo(id){if(typeof window.go==='function')window.go(id);else location.hash=id;}
 function addStyles(){
  if(document.getElementById(AREA_STYLE))return;
  var s=document.createElement('style');s.id=AREA_STYLE;
  s.textContent='.msa-area-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:11px;margin-top:14px}.msa-area-card{display:flex;flex-direction:column;align-items:flex-start;gap:8px;min-height:145px;padding:16px;border:1px solid #e1e8f4;border-radius:17px;background:linear-gradient(145deg,#fff,#f8faff);text-align:left;cursor:pointer;color:#172033;font:inherit;transition:transform .15s,border-color .15s}.msa-area-card:hover{transform:translateY(-2px);border-color:#9bb8ff}.msa-area-icon{font-size:27px}.msa-area-card b{font-size:14px;line-height:1.3}.msa-area-card span:last-child{font-size:12px;line-height:1.45;color:#64748b}.msa-history-actions{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;margin-top:12px}.msa-history-actions button{min-height:48px;text-align:left;white-space:normal}@media(max-width:700px){.msa-area-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.msa-area-card{min-height:135px;padding:13px}}@media(max-width:390px){.msa-area-grid{grid-template-columns:1fr}.msa-history-actions{grid-template-columns:1fr}}';
  document.head.appendChild(s);
 }
 function makeCards(){
  return '<div class="msa-area-grid">'+cards.map(function(c){return '<button type="button" class="msa-area-card" data-msa-area-target="'+c.target+'"><span class="msa-area-icon">'+c.icon+'</span><b>'+c.title+'</b><span>'+c.desc+'</span></button>';}).join('')+'</div>';
 }
 function ensureHistoryPage(){
  var main=document.getElementById('main-content');if(!main||document.getElementById('historicoClinico'))return;
  var sec=document.createElement('section');sec.id='historicoClinico';
  sec.innerHTML='<div class="card"><div class="dash-section-title"><div><div class="eyebrow">MINHA SAÚDE IA</div><h2>🩺 Histórico Clínico</h2><p class="muted">Acesse seus registros clínicos por categoria. Os dados continuam nos módulos existentes; esta página apenas organiza os atalhos.</p></div></div><div class="msa-history-actions"><button class="btn secondary" type="button" data-msa-area-target="perfil">👤 Meu perfil</button><button class="btn secondary" type="button" data-msa-area-target="timeline">🕐 Linha do tempo</button><button class="btn secondary" type="button" data-msa-area-target="dor">😣 Sintomas e dor</button><button class="btn secondary" type="button" data-msa-area-target="consultas">👨‍⚕️ Consultas</button><button class="btn secondary" type="button" data-msa-area-target="meds">💊 Medicamentos</button><button class="btn secondary" type="button" data-msa-area-target="exames">🧪 Exames</button><button class="btn secondary" type="button" data-msa-area-target="documentos">📄 Documentos</button><button class="btn secondary" type="button" data-msa-area-target="familia">🧬 Histórico familiar</button></div><div class="alert safe" style="margin-top:14px">🔐 Seus registros não são copiados nem movidos por esta organização. Continue usando backup e exportação para manter uma cópia de segurança.</div></div>';
  var home=document.getElementById('home');
  if(home&&home.parentNode===main)main.insertBefore(sec,home.nextSibling);else main.appendChild(sec);
 }
 function addHomeAreas(){
  var home=document.getElementById('home');if(!home||document.getElementById('msaAreasPrincipais'))return;
  var wrap=document.createElement('div');wrap.id='msaAreasPrincipais';wrap.className='card';wrap.style.marginTop='14px';
  wrap.innerHTML='<div class="dash-section-title"><div><h2>✨ Áreas principais</h2><div class="muted">Escolha uma área para abrir os recursos relacionados.</div></div></div>'+makeCards();
  var anchor=home.querySelector('.health-dashboard')||home.querySelector('.metric-panel')||home.lastElementChild;
  if(anchor&&anchor.parentNode)anchor.insertAdjacentElement('afterend',wrap);else home.appendChild(wrap);
 }
 function addNavLinks(){
  var nav=document.getElementById('nav');if(nav&&!nav.querySelector('[data-tab="historicoClinico"]')){
   var group=nav.querySelector('[data-menu="health"]')?.parentElement;
   var menu=group&&group.querySelector('.nav-menu');
   if(menu){var b=document.createElement('button');b.type='button';b.dataset.tab='historicoClinico';b.textContent='🩺 Histórico clínico';menu.appendChild(b);}
  }
  var drawer=document.getElementById('msaMobileDrawer');
  if(drawer&&!drawer.querySelector('[data-mobile-tab="historicoClinico"]')){
   var body=drawer.querySelector('.msa-mobile-drawer-body');
   if(body){var sec=document.createElement('div');sec.className='msa-mobile-section';sec.innerHTML='<div class="msa-mobile-section-title">Áreas principais</div><div class="msa-mobile-links"><button type="button" data-mobile-tab="historicoClinico">🩺 Histórico clínico</button><button type="button" data-mobile-tab="exames">🧪 Exames e documentos</button><button type="button" data-mobile-tab="meds">💊 Tratamentos e medicamentos</button><button type="button" data-mobile-tab="familia">🧬 Família e genética</button><button type="button" data-mobile-tab="ia">🤖 Central de IA</button></div></div>';body.insertBefore(sec,body.firstChild);}
  }
 }
 function bind(){
  document.addEventListener('click',function(ev){
   var b=ev.target.closest('[data-msa-area-target]');if(!b)return;
   ev.preventDefault();goTo(b.getAttribute('data-msa-area-target'));
  });
  document.addEventListener('click',function(ev){
   var b=ev.target.closest('[data-mobile-tab="historicoClinico"]');if(!b)return;
   ev.preventDefault();goTo('historicoClinico');
   var d=document.getElementById('msaMobileDrawer'),back=document.getElementById('msaMobileBackdrop');
   if(d){d.setAttribute('aria-hidden','true');d.style.display='none';}
   if(back){back.setAttribute('aria-hidden','true');back.style.display='none';}
   document.body.classList.remove('msa-mobile-menu-open');
  });
 }
 function init(){
  if(document.documentElement.dataset.msaAreasV738==='1')return;
  document.documentElement.dataset.msaAreasV738='1';
  addStyles();ensureHistoryPage();addHomeAreas();addNavLinks();bind();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
