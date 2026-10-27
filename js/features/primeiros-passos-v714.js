/* Minha Saúde IA V7.14 — primeiros passos guiados
 * Orienta iniciantes sem bloquear a navegação; respeita "agora não".
 */
(function(){
'use strict';
var TOUR_KEY='msa2_primeiros_passos_v714';
var REMIND_KEY='msa2_perfil_lembrete_v714';
var STEPS=[
 {title:'Bem-vindo ao Minha Saúde IA! 👋',text:'Este espaço ajuda você a organizar informações de saúde em um só lugar. Você não precisa aprender tudo hoje.',target:'#homeProfileHero',action:'Entendi'},
 {title:'Comece pelo seu perfil 👤',text:'Nome, data de nascimento, alergias, medicamentos e condições de saúde ajudam a contextualizar seus registros. Preencha apenas o que souber; não invente dados.',target:'#homeMissingInfoCard',action:'Ver meu perfil',go:'perfil'},
 {title:'Registre quando precisar ✍️',text:'Use Registrar para anotar sintomas, medicamentos, consultas e exames. Esses registros formam seu histórico pessoal.',target:'#homeCommandCenter',action:'Conhecer os registros'},
 {title:'Encontre ajuda e recursos 🤖',text:'Em Perguntar, Buscar e Menu você encontra orientação de uso, pesquisa dos seus registros e outras ferramentas. Você pode rever esta visita pelo menu Ajuda.',target:'#homeQuickActions',action:'Concluir visita'}
];
function storage(){try{return window.MSAStorage||null}catch(e){return null}}
function read(k){try{return localStorage.getItem(k)||''}catch(e){return ''}}
function write(k,v){try{localStorage.setItem(k,v)}catch(e){}}
function profile(){try{var k=window.MSA_K||window.K||{},s=storage(),p=s&&k.p?s.get(k.p):null;return Array.isArray(p)?(p[0]||{}):(p||{})}catch(e){return {}}}

var EXPERIENCE_CHOICE_KEY='msa2_experience_choice_v765';
function savedExperience(){
 try{
  var k=window.MSA_K||window.K||{},s=storage(),a=s&&k.preferencias?s.get(k.preferencias):null;
  var v=Array.isArray(a)&&a[0]&&typeof a[0]==='object'?a[0].experiencia:'';
  return ['simple','comfortable','advanced'].includes(v)?v:'';
 }catch(e){return ''}
}
function saveExperience(level){
 if(!['simple','comfortable','advanced'].includes(level))return false;
 try{
  if(typeof window.salvarPreferenciasObjeto==='function'){
   window.salvarPreferenciasObjeto({experiencia:level});
  }else{
   var k=window.MSA_K||window.K||{},s=storage();
   if(!s||!k.preferencias||typeof s.get!=='function'||typeof s.set!=='function')return false;
   var a=s.get(k.preferencias),old=Array.isArray(a)&&a[0]&&typeof a[0]==='object'?Object.assign({},a[0]):{};
   if(s.set(k.preferencias,[Object.assign(old,{experiencia:level})])===false)return false;
  }
  try{if(typeof window.aplicarPreferencias==='function')window.aplicarPreferencias()}catch(e){}
  try{if(typeof window.aplicarExperiencia==='function')window.aplicarExperiencia()}catch(e){}
  var select=document.getElementById('prefExperiencia');if(select)select.value=level;
  return savedExperience()===level;
 }catch(e){console.warn('[Minha Saúde IA] não foi possível salvar a experiência escolhida:',e);return false}
}
function openExperienceChoice(after){
 var existing=document.getElementById('msaExperienceChoice');if(existing)existing.remove();
 var wrap=document.createElement('div');wrap.id='msaExperienceChoice';wrap.setAttribute('role','dialog');wrap.setAttribute('aria-modal','true');wrap.setAttribute('aria-labelledby','msaExperienceTitle');
 wrap.innerHTML='<div class="msa-exp-choice-backdrop"></div><div class="msa-exp-choice-box"><button type="button" class="msa-exp-choice-close" aria-label="Escolher depois">×</button><div class="msa-exp-choice-kicker">PERSONALIZE SUA EXPERIÊNCIA</div><h2 id="msaExperienceTitle">Como você prefere usar o Minha Saúde IA?</h2><p class="msa-exp-choice-intro">Cada pessoa usa o aplicativo de um jeito. Escolha o nível de detalhes que combina com você. Você poderá mudar isso em Configurações quando quiser.</p><div class="msa-exp-choice-options">'+
 '<button type="button" data-exp-choice="simple" class="msa-exp-choice-option"><span class="msa-exp-choice-icon">🧭</span><span class="msa-exp-choice-copy"><b>Simples</b><small>Menos opções no menu, passos diretos e foco no essencial.</small></span><span class="msa-exp-choice-arrow">›</span></button>'+
 '<button type="button" data-exp-choice="comfortable" class="msa-exp-choice-option"><span class="msa-exp-choice-icon">🙂</span><span class="msa-exp-choice-copy"><b>Confortável</b><small>Recursos principais à vista, com opções avançadas para quem precisar de mais detalhes.</small></span><span class="msa-exp-choice-arrow">›</span></button>'+
 '<button type="button" data-exp-choice="advanced" class="msa-exp-choice-option"><span class="msa-exp-choice-icon">⚡</span><span class="msa-exp-choice-copy"><b>Completo / avançado</b><small>Mais abas, gráficos, ferramentas e acesso rápido aos detalhes.</small></span><span class="msa-exp-choice-arrow">›</span></button></div>'+
 '<button type="button" class="msa-exp-choice-later">Agora não — continuar com a experiência atual</button><div class="msa-exp-choice-note">A escolha muda apenas a forma de navegar. Ela não apaga nem altera seus registros de saúde.</div></div>';
 var style=document.createElement('style');style.textContent='#msaExperienceChoice{position:fixed;inset:0;z-index:2147483200;color:#172033;font-family:inherit}#msaExperienceChoice .msa-exp-choice-backdrop{position:absolute;inset:0;background:rgba(15,23,42,.62);backdrop-filter:blur(3px)}#msaExperienceChoice .msa-exp-choice-box{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);box-sizing:border-box;width:min(calc(100% - 30px),540px);max-height:calc(100dvh - 28px);overflow:auto;padding:22px;border-radius:22px;background:#fff;box-shadow:0 28px 90px #0004}#msaExperienceChoice .msa-exp-choice-kicker{font-size:11px;letter-spacing:.09em;font-weight:900;color:#2563eb}#msaExperienceChoice h2{font-size:24px;line-height:1.2;margin:10px 32px 8px 0}#msaExperienceChoice .msa-exp-choice-intro{font-size:14px;line-height:1.5;color:#475569;margin:0 0 15px}#msaExperienceChoice .msa-exp-choice-close{position:absolute;right:12px;top:12px;width:37px;height:37px;border:0;border-radius:50%;background:#f1f5f9;color:#334155;font-size:25px;cursor:pointer}#msaExperienceChoice .msa-exp-choice-options{display:grid;gap:9px}#msaExperienceChoice .msa-exp-choice-option{display:flex;align-items:center;gap:12px;width:100%;min-height:76px;text-align:left;padding:13px;border:1px solid #d8e2f0;border-radius:15px;background:#fff;color:#172033;cursor:pointer;font:inherit}#msaExperienceChoice .msa-exp-choice-option:hover,#msaExperienceChoice .msa-exp-choice-option:focus-visible{border-color:#2563eb;background:#eff6ff;outline:2px solid #bfdbfe;outline-offset:1px}#msaExperienceChoice .msa-exp-choice-icon{font-size:26px;flex:0 0 34px;text-align:center}#msaExperienceChoice .msa-exp-choice-copy{display:grid;gap:4px;flex:1}#msaExperienceChoice .msa-exp-choice-copy b{font-size:15px}#msaExperienceChoice .msa-exp-choice-copy small{font-size:12px;line-height:1.4;color:#64748b}#msaExperienceChoice .msa-exp-choice-arrow{font-size:25px;color:#64748b}#msaExperienceChoice .msa-exp-choice-later{display:block;width:100%;margin-top:12px;min-height:42px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;color:#475569;font:inherit;font-size:13px;font-weight:750;cursor:pointer}#msaExperienceChoice .msa-exp-choice-note{font-size:11px;line-height:1.45;color:#64748b;margin-top:11px}@media(max-width:420px){#msaExperienceChoice .msa-exp-choice-box{padding:18px}#msaExperienceChoice h2{font-size:21px}}body.msa-dark #msaExperienceChoice .msa-exp-choice-box{background:#111827;color:#e5e7eb}body.msa-dark #msaExperienceChoice .msa-exp-choice-option{background:#1f2937;color:#e5e7eb;border-color:#334155}body.msa-dark #msaExperienceChoice .msa-exp-choice-copy small,body.msa-dark #msaExperienceChoice .msa-exp-choice-intro,body.msa-dark #msaExperienceChoice .msa-exp-choice-note{color:#cbd5e1}';
 document.head.appendChild(style);document.body.appendChild(wrap);document.body.style.overflow='hidden';
 function close(choice){
  document.body.style.overflow='';wrap.remove();style.remove();
  if(choice)write(EXPERIENCE_CHOICE_KEY,choice);
  if(typeof after==='function')after();
 }
 wrap.querySelectorAll('[data-exp-choice]').forEach(function(btn){
  btn.addEventListener('click',function(){
   var level=btn.getAttribute('data-exp-choice');
   if(!saveExperience(level)){alert('Não foi possível salvar sua preferência agora. Você pode escolher depois em Configurações.');return;}
   close('chosen');
  });
 });
 function later(){close('skipped')}
 wrap.querySelector('.msa-exp-choice-later').addEventListener('click',later);
 wrap.querySelector('.msa-exp-choice-close').addEventListener('click',later);
 wrap.querySelector('.msa-exp-choice-backdrop').addEventListener('click',later);
 document.addEventListener('keydown',function esc(e){
  if(e.key==='Escape'&&document.getElementById('msaExperienceChoice')){later();document.removeEventListener('keydown',esc);}
 });
}
function hasData(){var p=profile();return !!(String(p.nome||'').trim()||String(p.nasc||'').trim()||String(p.alerg||'').trim()||String(p.cond||'').trim())}
function goProfile(){try{if(typeof window.go==='function')window.go('perfil');else location.hash='perfil'}catch(e){}}
function remove(){var x=document.getElementById('msa714Tour');if(x)x.remove();document.body.style.overflow=''}
function openTour(start){
 remove();
 var idx=Math.max(0,Math.min(STEPS.length-1,start||0));
 var wrap=document.createElement('div');wrap.id='msa714Tour';wrap.setAttribute('role','dialog');wrap.setAttribute('aria-modal','true');wrap.setAttribute('aria-labelledby','msa714Title');
 wrap.innerHTML='<div class="msa714-backdrop"></div><div class="msa714-box"><div class="msa714-kicker">PRIMEIROS PASSOS · <span id="msa714Count"></span></div><button type="button" class="msa714-close" aria-label="Fechar visita">×</button><h2 id="msa714Title"></h2><p id="msa714Text"></p><div class="msa714-progress"><span></span></div><div class="msa714-actions"><button type="button" class="msa714-later">Agora não</button><button type="button" class="msa714-next"></button></div><button type="button" class="msa714-help">Ver meu perfil de saúde</button></div>';
 var style=document.createElement('style');style.textContent='#msa714Tour{position:fixed;inset:0;z-index:2147483000;font-family:inherit;color:#172033}#msa714Tour .msa714-backdrop{position:absolute;inset:0;background:rgba(15,23,42,.56);backdrop-filter:blur(3px)}#msa714Tour .msa714-box{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:min( calc(100% - 32px),440px);box-sizing:border-box;background:#fff;border-radius:22px;padding:24px;box-shadow:0 24px 80px #0004}#msa714Tour .msa714-kicker{font-size:12px;font-weight:800;letter-spacing:.06em;color:#2563eb;padding-right:30px}#msa714Tour h2{font-size:23px;line-height:1.2;margin:14px 0 10px}#msa714Tour p{font-size:16px;line-height:1.55;color:#475569;margin:0 0 18px}#msa714Tour .msa714-close{position:absolute;right:14px;top:12px;border:0;background:#f1f5f9;border-radius:50%;width:36px;height:36px;font-size:25px;color:#334155}#msa714Tour .msa714-progress{height:6px;background:#e2e8f0;border-radius:9px;overflow:hidden;margin:16px 0}#msa714Tour .msa714-progress span{display:block;height:100%;width:25%;background:#2563eb;transition:width .2s}#msa714Tour .msa714-actions{display:flex;gap:10px;margin-top:14px}#msa714Tour button{cursor:pointer;font:inherit}#msa714Tour .msa714-actions button{min-height:46px;border-radius:12px;padding:10px 14px;font-weight:700}#msa714Tour .msa714-later{border:1px solid #cbd5e1;background:#fff;color:#475569}#msa714Tour .msa714-next{flex:1;border:0;background:#2563eb;color:#fff}#msa714Tour .msa714-help{width:100%;border:0;background:transparent;color:#1d4ed8;font-weight:700;padding:15px 0 0}#msa714Tour button:focus-visible{outline:3px solid #93c5fd;outline-offset:3px}@media(max-width:420px){#msa714Tour .msa714-box{padding:20px}}';
 wrap.appendChild(style);document.body.appendChild(wrap);document.body.style.overflow='hidden';
 var title=wrap.querySelector('#msa714Title'),txt=wrap.querySelector('#msa714Text'),count=wrap.querySelector('#msa714Count'),bar=wrap.querySelector('.msa714-progress span'),next=wrap.querySelector('.msa714-next'),later=wrap.querySelector('.msa714-later'),help=wrap.querySelector('.msa714-help');
 function finish(done){if(done)write(TOUR_KEY,'done');remove();if(done)showProfileCard()}
 function render(){var s=STEPS[idx];title.textContent=s.title;txt.textContent=s.text;count.textContent=(idx+1)+' de '+STEPS.length;bar.style.width=((idx+1)/STEPS.length*100)+'%';next.textContent=idx===STEPS.length-1?'Concluir':'Próximo';help.style.display=idx===1?'block':'none';}
 next.addEventListener('click',function(){if(idx===STEPS.length-1){finish(true);return}idx++;render()});
 later.addEventListener('click',function(){write(TOUR_KEY,'later');remove()});
 wrap.querySelector('.msa714-close').addEventListener('click',function(){write(TOUR_KEY,'later');remove()});
 help.addEventListener('click',function(){goProfile();write(TOUR_KEY,'done');remove()});
 wrap.querySelector('.msa714-backdrop').addEventListener('click',function(){write(TOUR_KEY,'later');remove()});
 document.addEventListener('keydown',function esc(e){if(e.key==='Escape'&&document.getElementById('msa714Tour')){write(TOUR_KEY,'later');remove();document.removeEventListener('keydown',esc)}});
 render();
}
function showProfileCard(){
 var home=document.getElementById('home');if(!home)return;
 var card=document.getElementById('msa714ProfileGuide');
 if(!card){card=document.createElement('div');card.id='msa714ProfileGuide';card.style.cssText='margin:14px 0;padding:17px;border:1px solid #cbdcfb;border-radius:18px;background:linear-gradient(135deg,#eff6ff,#fff);box-shadow:0 5px 18px rgba(37,99,235,.07)';card.innerHTML='<div style="font-size:12px;font-weight:800;color:#2563eb">🌱 SEU PRÓXIMO PASSO</div><h2 style="font-size:20px;margin:7px 0">Deixe seu perfil pronto aos poucos</h2><p style="margin:0 0 12px;color:#475569;line-height:1.5">Informações como alergias e medicamentos ajudam a manter seus dados organizados para consultar quando precisar. Você pode preencher manualmente ou pedir ajuda à IA.</p><div style="display:flex;gap:9px;flex-wrap:wrap"><button type="button" id="msa714ProfileBtn" style="flex:1;min-height:44px;border:0;border-radius:12px;background:#2563eb;color:#fff;font-weight:700;padding:10px">Completar meu perfil</button><button type="button" id="msa714LaterBtn" style="min-height:44px;border:1px solid #cbd5e1;border-radius:12px;background:#fff;color:#334155;font-weight:700;padding:10px">Lembrar depois</button></div>';
 var intro=document.getElementById('msaPurposeIntro');if(intro&&intro.parentNode)intro.parentNode.insertBefore(card,intro.nextSibling);else home.appendChild(card);
 card.querySelector('#msa714ProfileBtn').addEventListener('click',goProfile);
 card.querySelector('#msa714LaterBtn').addEventListener('click',function(){write(REMIND_KEY,String(Date.now()));card.remove()});
 }
}
/* V7.24: a chave acima tinha sido apagada e o arquivo inteiro deixava de funcionar */
function init(){
 if(!document.getElementById('home'))return;
 function maybeTour(){if(!read(TOUR_KEY))openTour(0)}
 if(!read(EXPERIENCE_CHOICE_KEY)){
   setTimeout(function(){
    if(document.getElementById('msa714Tour')||document.getElementById('msaExperienceChoice'))return;
    if(savedExperience()){write(EXPERIENCE_CHOICE_KEY,'existing');maybeTour();return;}
    openExperienceChoice(maybeTour);
   },1500);
 }else if(!read(TOUR_KEY)){
   setTimeout(function(){if(!document.getElementById('msa714Tour'))openTour(0)},1800);
 }else if((read(TOUR_KEY)==='done'||read(TOUR_KEY)==='later')&&!hasData()&&Date.now()-Number(read(REMIND_KEY)||0)>3*86400000){
   showProfileCard();
 }
 var helpBtns=[].slice.call(document.querySelectorAll('button,a')).filter(function(b){return /ajuda|guia|primeiros passos/i.test((b.innerText||b.textContent||'').trim())});
 helpBtns.forEach(function(b){if(b.dataset.msa714Help)return;b.dataset.msa714Help='1';b.addEventListener('click',function(){openTour(0)})});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
