/* Minha Saúde IA V6.12 — exportação de notificações remotas */
(function(){
'use strict';
const STORAGE_KEY='canivete-assistente-v9';
const SECRETS_URL='https://github.com/jhoncorretor2025-blip/delta-prompts/settings/secrets/actions';
function read(key){try{return window.MSAStorage?window.MSAStorage.get(key):JSON.parse(localStorage.getItem(key)||'[]')}catch(e){return []}}
function stableId(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0).toString(16)}
function canivete(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}')}catch(e){return {}}}
function healthTopic(){
 try{let topic=localStorage.getItem('msa-remote-ntfy-topic');if(topic)return topic;
  const bytes=new Uint8Array(16);if(window.crypto&&crypto.getRandomValues)crypto.getRandomValues(bytes);else for(let i=0;i<bytes.length;i++)bytes[i]=Math.floor(Math.random()*256);
  topic='msa-saude-'+Array.from(bytes).map(x=>x.toString(16).padStart(2,'0')).join('');
  localStorage.setItem('msa-remote-ntfy-topic',topic);return topic;
 }catch(e){return 'msa-saude-'+stableId(String(Date.now())+location.pathname)}
}
function safeDate(v){return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(String(v||''))}
function collect(includeDetails){
 const cv=canivete(),reminders=[];
 read('msa2_medicamentos_rotina').forEach(function(m){
  const nome=String(m.nome||'').trim(),hora=String(m.hora||'').trim();
  if(!nome||!/^([01]\d|2[0-3]):[0-5]\d$/.test(hora))return;
  const details=includeDetails?(nome+(m.dose?' — '+String(m.dose):'')):'';
  reminders.push({id:'medrot-'+String(m.id||stableId(nome+'|'+hora)),type:'daily',time:hora,title:includeDetails?'💊 Hora do medicamento: '+nome:'💊 Horário do medicamento',body:includeDetails?'Confira sua rotina: '+details+'.':'Está na hora de conferir sua rotina de medicamentos.',enabled:true});
 });
 read('msa2_lembretes').forEach(function(r){
  const nome=String(r.nome||'').trim(),datetime=String(r.data||'').slice(0,16),tipo=String(r.tipo||'Outro').trim();
  if(!nome||!safeDate(datetime))return;
  const ts=new Date(datetime).getTime();
  if(!Number.isFinite(ts)||ts<Date.now()-20*60*1000)return;
  const saude=/medicamento|consulta|exame/i.test(tipo);
  const before=/consulta|exame/i.test(tipo)?30:0;
  const title=includeDetails?'🔔 '+tipo+': '+nome:(/consulta/i.test(tipo)?'🩺 Lembrete de consulta':(/exame/i.test(tipo)?'🧪 Lembrete de exame':(/medicamento/i.test(tipo)?'💊 Lembrete de medicamento':'🔔 Lembrete')));
  const body=includeDetails?('Confira o lembrete: '+nome+'.'):(saude?'Você tem um lembrete de saúde. Confira os detalhes no Minha Saúde IA.':'Você tem um lembrete agendado.');
  reminders.push({id:'lembrete-'+stableId(tipo+'|'+nome+'|'+datetime),type:'once',datetime:datetime,minutesBefore:before,title:title,body:body,enabled:true});
 });
 return {schemaVersion:1,timezone:'America/Sao_Paulo',generatedAt:new Date().toISOString(),ntfyTopic:healthTopic(),telegramChatId:String(cv.notifTelegramChatId||''),reminders:reminders};
}
function init(){
 const section=document.getElementById('lembretes');if(!section||document.getElementById('msaRemoteNotifications'))return;
 const intro=section.querySelector('.muted');
 const panel=document.createElement('div');panel.className='card';panel.id='msaRemoteNotifications';panel.style.margin='12px 0';
 panel.innerHTML='<h3>📲 Notificações remotas no celular</h3><p class="muted">Prepare a configuração para o motor único do Canivete. O GitHub Actions enviará os alertas por ntfy e/ou Telegram mesmo com os sites fechados.</p><label style="display:flex;align-items:flex-start;gap:9px;margin:12px 0"><input id="msaRemoteDetails" type="checkbox" style="width:18px;height:18px;flex:0 0 auto;margin-top:2px"><span>Mostrar nome do medicamento, dose ou detalhes do compromisso na notificação. Desmarcado, o alerta será discreto na tela bloqueada.</span></label><div class="row" style="display:flex;gap:8px;flex-wrap:wrap"><button type="button" class="btn green" id="msaRemoteGenerate">🔐 Gerar configuração segura</button><button type="button" class="btn secondary" id="msaRemoteCopy" disabled>📋 Copiar JSON</button><a class="btn secondary" href="'+SECRETS_URL+'" target="_blank" rel="noopener noreferrer">⚙️ Abrir GitHub Secrets</a></div><p id="msaRemoteStatus" class="muted" role="status" style="margin-top:10px">A configuração será preparada neste navegador. Nada será enviado ao GitHub automaticamente.</p><textarea id="msaRemoteJson" readonly rows="8" aria-label="Configuração para GitHub Secret" style="display:none;width:100%;max-width:100%;margin-top:8px;font:12px/1.45 monospace"></textarea><ol style="font-size:13px;line-height:1.65;padding-left:20px;margin-top:12px"><li>Clique em <b>Gerar configuração segura</b> e depois em <b>Copiar JSON</b>.</li><li>Inscreva-se no canal ntfy indicado no aviso após gerar a configuração.</li><li>No GitHub, crie/atualize o secret <code>MINHA_SAUDE_LEMBRETES_JSON</code> e cole o JSON como valor.</li><li>Para Telegram, mantenha também o secret <code>TELEGRAM_BOT_TOKEN</code>. O Chat ID será incluído se estiver salvo nas configurações do Canivete.</li><li>Repita a exportação e atualize o secret quando alterar horários ou lembretes.</li></ol><div class="alert warn">🔒 O JSON fica em um GitHub Secret, não em arquivo público do repositório. Não compartilhe o canal ntfy gerado. O lembrete de consulta/exame usa o horário cadastrado na Central de Lembretes; consultas sem horário definido não geram alerta automático.</div>';
 if(intro)intro.insertAdjacentElement('afterend',panel);else section.prepend(panel);
 const json=document.getElementById('msaRemoteJson'),status=document.getElementById('msaRemoteStatus'),copy=document.getElementById('msaRemoteCopy');
 document.getElementById('msaRemoteGenerate').addEventListener('click',function(){
  const data=collect(document.getElementById('msaRemoteDetails').checked);
  json.value=JSON.stringify(data,null,2);json.style.display='block';copy.disabled=false;
  status.textContent='Configuração criada com '+data.reminders.length+' lembrete(s). Antes de salvar o secret, abra o app ntfy e inscreva-se neste canal privado: '+data.ntfyTopic+'. O secret ainda precisa ser salvo manualmente no GitHub.';
 });
 copy.addEventListener('click',async function(){
  if(!json.value)return;
  try{await navigator.clipboard.writeText(json.value);status.textContent='✅ JSON copiado. Cole-o no secret MINHA_SAUDE_LEMBRETES_JSON nas configurações do repositório.'}
  catch(e){json.focus();json.select();status.textContent='Selecione o texto abaixo e copie com Ctrl+C; depois cole no GitHub Secret.'}
 });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();