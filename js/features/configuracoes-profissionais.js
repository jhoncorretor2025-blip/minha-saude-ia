/* Minha Saúde IA — configurações profissionais V6.20
 * Preferências visuais/acessibilidade isoladas; não altera registros clínicos.
 */
(function(){
'use strict';
var KEY='msa2_configuracoes_ui_v1';
var defaults={fontSize:'normal',contrast:'normal',reduceMotion:false};
function read(){try{var v=JSON.parse(localStorage.getItem(KEY)||'{}');return Object.assign({},defaults,v&&typeof v==='object'?v:{});}catch(e){return Object.assign({},defaults);}}
function apply(v){
 var d=document.documentElement,b=document.body;
 d.dataset.msaFontSize=v.fontSize||'normal';
 b.classList.toggle('msa-high-contrast',v.contrast==='high');
 b.classList.toggle('msa-reduce-motion',!!v.reduceMotion);
 var theme=b.classList.contains('msa-dark')?'dark':'light';
 var t=document.getElementById('msaThemeSelect');if(t)t.value=theme;
 var fs=document.getElementById('msaFontSize');if(fs)fs.value=v.fontSize||'normal';
 var c=document.getElementById('msaContrast');if(c)c.value=v.contrast||'normal';
 var m=document.getElementById('msaReduceMotion');if(m)m.checked=!!v.reduceMotion;
}
function write(v){try{localStorage.setItem(KEY,JSON.stringify(v));apply(v);return true;}catch(e){announce('Não foi possível salvar a preferência neste navegador.');return false;}}
function announce(msg){
 var el=document.getElementById('msaSettingsStatus');
 if(!el){el=document.createElement('div');el.id='msaSettingsStatus';el.className='alert safe';el.setAttribute('role','status');el.setAttribute('aria-live','polite');var host=document.getElementById('msaSettingsProfessional');if(host)host.appendChild(el);}
 if(el)el.textContent=msg;
 if(window.msaToast)window.msaToast(msg);
}
function go(id){if(typeof window.go==='function')window.go(id);else location.href='?pagina='+encodeURIComponent(id);}
function render(){
 var section=document.getElementById('configuracoes');if(!section)return;
 var existing=document.getElementById('msaSettingsProfessional');
 if(!existing){
  existing=document.createElement('div');existing.id='msaSettingsProfessional';existing.className='msa-settings-professional';
  existing.innerHTML=
   '<div class="card"><h2>🎨 Aparência e acessibilidade</h2><p class="muted">Estas opções afetam a apresentação neste navegador, sem alterar seu histórico de saúde.</p>'+
   '<div class="msa-settings-grid">'+
   '<label>🌗 Tema<select id="msaThemeSelect"><option value="light">Claro</option><option value="dark">Escuro</option></select><small>O tema também pode ser alterado pelo botão no topo.</small></label>'+
   '<label>🔠 Tamanho do texto<select id="msaFontSize"><option value="normal">Normal</option><option value="large">Maior</option><option value="larger">Bem maior</option></select><small>Ajuda na leitura, inclusive no celular.</small></label>'+
   '<label>◐ Contraste<select id="msaContrast"><option value="normal">Padrão</option><option value="high">Alto contraste</option></select><small>Reforça bordas e legibilidade.</small></label>'+
   '<label class="msa-settings-check"><span><input type="checkbox" id="msaReduceMotion"> ♿ Reduzir animações</span><small>Útil para quem prefere menos movimento na tela.</small></label>'+
   '</div><div class="row" style="margin-top:12px"><button type="button" class="btn" id="msaSaveAccessibility">💾 Salvar acessibilidade</button><button type="button" class="btn secondary" id="msaRestoreAccessibility">↩️ Restaurar aparência padrão</button></div></div>'+
   '<div class="card"><h2>💾 Dados e segurança</h2><p class="muted">O histórico de saúde é diferente das preferências visuais. Restaurar a aparência não apaga registros.</p>'+
   '<div class="alert warn">🔒 Os registros principais ficam no armazenamento deste navegador. Isso não significa sincronização automática entre dispositivos. Um arquivo de backup pode conter informações médicas sensíveis; guarde-o em local seguro.</div>'+
   '<div class="row" style="margin-top:12px"><button type="button" class="btn green" id="msaGoBackup">💾 Abrir backup e restauração</button><button type="button" class="btn secondary" id="msaGoExport">📤 Exportar dados</button></div></div>'+
   '<div class="card"><h2>🧪 Diagnóstico rápido</h2><p class="muted">Verifica recursos básicos do navegador sem ler nem exibir seus registros médicos.</p><div id="msaSettingsDiagnostics" class="list" aria-live="polite"><div class="empty">Toque em “Executar diagnóstico” para verificar este navegador.</div></div><div class="row" style="margin-top:12px"><button type="button" class="btn secondary" id="msaRunDiagnostics">🧪 Executar diagnóstico</button><button type="button" class="btn secondary" id="msaOpenHelp">❓ Ajuda e privacidade</button></div></div>'+
   '<div class="card"><h2>⚙️ Restaurar preferências do aplicativo</h2><p class="muted">Restaura experiência e módulos opcionais para o padrão. Não exclui sintomas, medicamentos, exames, consultas, documentos, relatórios ou backups.</p><button type="button" class="btn red" id="msaRestorePrefs">↩️ Restaurar preferências padrão</button></div>';
  section.appendChild(existing);
 }
 apply(read());
 document.getElementById('msaSaveAccessibility').onclick=function(){
  var current=read();current.fontSize=document.getElementById('msaFontSize').value;current.contrast=document.getElementById('msaContrast').value;current.reduceMotion=document.getElementById('msaReduceMotion').checked;
  if(write(current))announce('✅ Preferências de acessibilidade salvas neste navegador.');
 };
 document.getElementById('msaRestoreAccessibility').onclick=function(){
  if(!confirm('Restaurar tema, texto, contraste e animações para o padrão? Seus dados de saúde não serão alterados.'))return;
  try{localStorage.setItem('msa2_theme','light');}catch(e){}
  write(Object.assign({},defaults));
  var b=document.getElementById('msaThemeToggle');if(b&&document.body.classList.contains('msa-dark'))b.click();
  announce('Aparência padrão restaurada. Seu histórico foi mantido.');
 };
 document.getElementById('msaThemeSelect').onchange=function(){
  var theme=this.value,b=document.getElementById('msaThemeToggle');
  if(b&&((theme==='dark')!==document.body.classList.contains('msa-dark')))b.click();
  else try{localStorage.setItem('msa2_theme',theme)}catch(e){}
 };
 document.getElementById('msaGoBackup').onclick=function(){go('backup');};
 document.getElementById('msaGoExport').onclick=function(){go('exportar');};
 document.getElementById('msaOpenHelp').onclick=function(){if(typeof window.abrirPrivacidadeAjuda==='function')window.abrirPrivacidadeAjuda('privacidade');else announce('Abra a seção de ajuda e privacidade já existente no aplicativo.');};
 document.getElementById('msaRunDiagnostics').onclick=diagnostics;
 document.getElementById('msaRestorePrefs').onclick=function(){
  if(!confirm('Restaurar módulos opcionais e nível de experiência para os padrões? Seus registros de saúde e suas configurações de IA serão preservados.'))return;
  try{
   var storage=window.MSAStorage,constants=window.MSA_K||window.K,key=constants&&constants.preferencias;
   if(!storage||!key||typeof storage.get!=='function'||typeof storage.set!=='function')throw new Error('Armazenamento do aplicativo indisponível.');
   var old=storage.get(key),pref=Array.isArray(old)&&old[0]&&typeof old[0]==='object'?Object.assign({},old[0]):{};
   pref.academia='on';pref.nutricao='on';pref.sonoBem='on';pref.ciclo='on';pref.experiencia='comfortable';
   if(storage.set(key,[pref])===false)throw new Error('O navegador não confirmou a gravação.');
   if(typeof window.aplicarPreferencias==='function')window.aplicarPreferencias();
   if(typeof window.render==='function')window.render();
   announce('Preferências padrão restauradas. Histórico de saúde e configurações de IA preservados.');
  }catch(e){console.error('[Minha Saúde IA] restauração de preferências:',e);announce('Não foi possível restaurar as preferências. Confira o armazenamento e tente novamente. Nenhum registro clínico foi intencionalmente alterado.');}
 };
}
function diagnostics(){
 var box=document.getElementById('msaSettingsDiagnostics');if(!box)return;
 var checks=[];
 function add(label,ok,detail){checks.push('<div class="item"><div class="itemtop"><b>'+(ok?'✅ ':'⚠️ ')+label+'</b><span class="tag">'+(ok?'Disponível':'Verificar')+'</span></div><p>'+detail+'</p></div>');}
 var storage=false;try{var k='msa2_settings_diag_test';localStorage.setItem(k,'ok');storage=localStorage.getItem(k)==='ok';localStorage.removeItem(k);}catch(e){}
 add('Armazenamento local',storage,storage?'O navegador permite salvar preferências.':'O armazenamento pode estar bloqueado ou sem espaço.');
 add('Versão do aplicativo',!!window.MSA_VERSION,'Versão informada pelo núcleo: '+String(window.MSA_VERSION||'não identificada')+'.');
 add('Conexão segura',location.protocol==='https:'||location.hostname==='localhost',location.protocol==='https:'?'Site aberto por HTTPS.':'O site não está usando HTTPS.');
 add('Suporte a Service Worker',('serviceWorker' in navigator),'Isso informa apenas o suporte do navegador; não significa sincronização na nuvem.');
 add('Áreas de backup/exportação',!!document.getElementById('backup')&&!!document.getElementById('exportar'),'Os fluxos completos ficam nas seções existentes; este diagnóstico não abre nem lê arquivos médicos.');
 box.innerHTML=checks.join('');
}
function syncTheme(){var t=document.getElementById('msaThemeSelect');if(t)t.value=document.body.classList.contains('msa-dark')?'dark':'light';}
function boot(){render();apply(read());syncTheme();
 if(window.MutationObserver&&document.body){var observer=new MutationObserver(syncTheme);observer.observe(document.body,{attributes:true,attributeFilter:['class']});}
 window.addEventListener('storage',syncTheme);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
window.addEventListener('pageshow',function(){if(document.getElementById('configuracoes'))apply(read());});
})();
