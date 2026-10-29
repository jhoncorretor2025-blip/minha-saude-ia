/* Minha Saúde IA — recursos complementares V6.07
 * Módulo independente para manter novas funções separadas do app principal.
 * Não usa servidor nem API key. Dados permanecem no navegador.
 */
(function(){
'use strict';
const K=window.MSA_K||window.K||{};
const storage=window.MSAStorage;
const key=(name,fallback)=>K[name]||fallback;
function g(k){return storage.get(k)}
function profile(){return g(key('p',key('p','msa2_perfil')))[0]||{}}
function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function download(name,text,type){
 const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type}));a.download=name;a.click();
 setTimeout(()=>URL.revokeObjectURL(a.href),1000);
}
/* V6.07 — backup completo, validado e sem sobrescrita destrutiva */
const BACKUP_EXTRA_KEYS=[
 'msa2_humor','msa2_metas_pessoais','msa2_lixeira','msa2_historico_alteracoes',
 'msa2_dashboard_preferencias','msa2_rascunhos_formularios','msa2_rascunhos_painel_fechado',
 'msa2_importacao_rascunho_v514','msa2_familiar_selecionado','msa2_medidas',
 'msa2_import_diagnostic_tmp'
];
function backupExcluded(k){
 return k==='msa2_pin'||k==='msa2_theme'||k==='msa2_import_diagnostic_tmp'||
  k==='msa2_rascunhos_painel_fechado'||k.startsWith('msa2_backup_')||
  k.startsWith('msa2_onboarding')||k.startsWith('msa2_update_attempt_')||
  /* V7.84: estado da interface gravado como texto puro (não são dados de saúde e quebravam o backup) */
  k==='msa2_primeiros_passos_v714'||k==='msa2_perfil_lembrete_v714'||k==='msa2_experience_choice_v765'||k==='msa2_experiencia_global'||k==='msa2_notifications'||k.startsWith('msa2_alerta_')||k.startsWith('msa2_nav_')||k.startsWith('msa2_home_expandida');
}
function backupLogicalKeys(){
 const out=new Set([...Object.values(K),...BACKUP_EXTRA_KEYS]);
 const scope=String(window.msaStoragePerfil||'').trim();
 const prefix=scope?'msa2_'+scope+'_':'';
 try{
  for(let i=0;i<window.msaStorage.length;i++){
   const physical=window.msaStorage.key(i);
   if(!physical)continue;
   const logical=prefix?(physical.startsWith(prefix)?physical.slice(prefix.length):''):physical;
   if(/^msa2_[a-z0-9_]+$/i.test(logical)&&!backupExcluded(logical))out.add(logical);
  }
 }catch(e){console.warn('[Minha Saúde IA] não foi possível enumerar todas as chaves do backup.',e)}
 return [...out].filter(k=>/^msa2_[a-z0-9_]+$/i.test(k)&&!backupExcluded(k)).sort();
}
function readRawJSON(k){
 const raw=window.msaStorage.getItem(k);
 if(raw===null)return null;
 try{return JSON.parse(raw)}catch(e){if(new Set([...Object.values(K),...BACKUP_EXTRA_KEYS]).has(k))throw new Error('O registro local "'+k+'" contém dados inválidos. Nenhum backup foi criado para evitar uma cópia incompleta.');console.warn('[Minha Saúde IA] chave fora do backup (não é JSON):',k);return null}
}
function downloadJSON(name,value){
 const blob=new Blob([JSON.stringify(value,null,2)],{type:'application/json;charset=utf-8'});
 const url=URL.createObjectURL(blob),a=document.createElement('a');
 a.href=url;a.download=name;a.style.display='none';document.body.appendChild(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),1500);
}
function crc32(str){const b=new TextEncoder().encode(str);let crc=-1;for(let i=0;i<b.length;i++){crc^=b[i];for(let k=0;k<8;k++)crc=(crc>>>1)^(0xEDB88320&-(crc&1))}return ((crc^-1)>>>0).toString(16).padStart(8,'0')}
 /* V7.84: monta o pacote sem baixar (usado por “Enviar backup”) e inclui conferência de integridade */
 window.msaMontarPacoteBackup=function(){
  const data={},keys=backupLogicalKeys();
  keys.forEach(k=>{const value=readRawJSON(k);if(value!==null)data[k]=value});
  if(!Object.keys(data).length)throw new Error('Não encontrei registros para exportar. Verifique se você está no perfil correto.');
  const json=JSON.stringify(data);
  return {app:'Minha Saúde IA',formatVersion:'2.1',appVersion:window.MSA_VERSION||'',exportedAt:new Date().toISOString(),scope:'perfil-atual',keyCount:Object.keys(data).length,integrity:{algo:'crc32',value:crc32(json),bytes:json.length},data:data};
 };
 window.exportarJSONCompleto=function(){
  try{
   const pkg=window.msaMontarPacoteBackup();
   downloadJSON('minha-saude-ia-backup-'+new Date().toISOString().slice(0,10)+'.json',pkg);
   try{window.msaStorage.setItem(BACKUP_LAST_EXPORT_KEY,new Date().toISOString())}catch(storageErr){console.warn('[Minha Saúde IA] backup gerado, mas não foi possível registrar a data do lembrete.',storageErr)}
   renderBackupReminder();
   if(window.msaToast)window.msaToast('✅ Backup criado com '+pkg.keyCount+' grupos de dados.');
   else alert('✅ Backup criado com '+pkg.keyCount+' grupos de dados. Guarde o arquivo em local seguro.');
   return true;
  }catch(e){
   console.error('[Minha Saúde IA] backup',e);
   alert('❌ Não foi possível criar o backup completo. '+(e.message||'Confira o armazenamento e tente novamente.'));
   return false;
  }
 };
 window.baixarBackup=function(){return window.exportarJSONCompleto()};

const BACKUP_REMINDER_KEY='msa2_backup_reminder_enabled';
const BACKUP_LAST_EXPORT_KEY='msa2_backup_last_export_at';
function backupReminderEnabled(){
 try{const v=window.msaStorage.getItem(BACKUP_REMINDER_KEY);return v===null||v!=='false'&&v!=='0'}catch(e){return true}
}
function backupLastExport(){
 try{const v=window.msaStorage.getItem(BACKUP_LAST_EXPORT_KEY);return v?new Date(v):null}catch(e){return null}
}
 const BACKUP_FREQ_KEY='msa2_backup_freq_days';
 function backupFreqDays(){try{const n=parseInt(window.msaStorage.getItem(BACKUP_FREQ_KEY),10);return [3,7,15,30].includes(n)?n:7}catch(e){return 7}}
 window.msaBackupInfo=function(){return {ativo:backupReminderEnabled(),dias:backupFreqDays(),ultimo:backupLastExport()}};
 window.msaDefinirFrequenciaBackup=function(n){try{if(!n){window.msaStorage.setItem(BACKUP_REMINDER_KEY,'false')}else{window.msaStorage.setItem(BACKUP_FREQ_KEY,String(n));window.msaStorage.setItem(BACKUP_REMINDER_KEY,'true')}}catch(e){alert('Não foi possível salvar essa preferência no navegador.');return}renderBackupReminder()};
 function renderBackupReminder(){
 const enabled=backupReminderEnabled(),last=backupLastExport(),now=new Date(),day=24*60*60*1000;
 let message='',style='safe';
 if(!enabled){message='🔕 Lembrete de backup desativado. Você ainda pode criar um backup manualmente a qualquer momento.';style='';}
 else if(!last||!Number.isFinite(last.getTime())){
   const semDados=typeof window.msaTotalRegistrosBackup==='function'&&window.msaTotalRegistrosBackup()===0;
   const recente=typeof window.msaQuickRecente==='function'&&window.msaQuickRecente(2);
   if(semDados||recente){message='💾 Quando você tiver registros, guarde uma cópia (backup) aqui para não perder nada.';style='safe';}
   else{message='⚠️ Você ainda não registrou um backup gerado neste navegador. Faça uma cópia agora para proteger seu histórico.';style='warn';}
  }
 else{
  const days=Math.max(0,Math.floor((now-last)/day));
  if(days>=backupFreqDays()){message='⚠️ Seu último backup foi gerado há '+days+' dia(s). Recomendamos criar uma nova cópia agora.';style='warn';}
  else{message='✅ Último backup gerado em '+last.toLocaleDateString('pt-BR')+'. O próximo lembrete será exibido quando completar '+backupFreqDays()+' dias.';style='safe';}
 }
 ['msaBackupHomeStatus','msaBackupSettingsStatus'].forEach(id=>{
  const el=document.getElementById(id);if(el){el.className='alert '+style;el.textContent=message;el.setAttribute('role','status')}
 });
 ['msaBackupHomeToggle','msaBackupSettingsToggle'].forEach(id=>{
  const el=document.getElementById(id);if(el)el.textContent=enabled?'🔕 Desativar lembrete de backup':'🔔 Ativar lembrete de backup';
 });
}
window.msaAtualizarLembreteBackup=renderBackupReminder;
window.msaAlternarLembreteBackup=function(){
 const next=!backupReminderEnabled();
 try{window.msaStorage.setItem(BACKUP_REMINDER_KEY,next?'true':'false');}
 catch(e){alert('Não foi possível salvar essa preferência no navegador.');return}
 renderBackupReminder();
};

function parseStored(k){
 const raw=window.msaStorage.getItem(k);
 if(raw===null)return {raw:null,value:null};
 try{return {raw:raw,value:JSON.parse(raw)}}catch(e){return {raw:raw,value:null,invalid:true}}
}
function mergeBackupValue(k,current,incoming){
 if(k===K.p){
  const cur=Array.isArray(current)?(current[0]&&typeof current[0]==='object'?current[0]:{}):(current&&typeof current==='object'?current:{});
  const inc=Array.isArray(incoming)?(incoming[0]&&typeof incoming[0]==='object'?incoming[0]:{}):(incoming&&typeof incoming==='object'?incoming:{});
  const merged=Object.assign({},cur,inc);
  return Array.isArray(current)||Array.isArray(incoming)?[merged]:merged;
 }
 if(Array.isArray(current)&&Array.isArray(incoming)){
  const out=current.slice(),seen=new Set(current.map(x=>JSON.stringify(x)));
  incoming.forEach(x=>{const sig=JSON.stringify(x);if(!seen.has(sig)){seen.add(sig);out.push(x)}});
  return out;
 }
 if(current&&incoming&&typeof current==='object'&&typeof incoming==='object'&&!Array.isArray(current)&&!Array.isArray(incoming)){
  return k==='msa2_rascunhos_formularios'?Object.assign({},incoming,current):Object.assign({},current,incoming);
 }
 if(current===null||current===undefined)return incoming;
 if(incoming===null||incoming===undefined)return current;
 return current;
}
window.restaurarBackup=async function(ev){
 const file=ev?.target?.files?.[0];if(!file)return;
 const snapshots=[];
 try{
  if(file.size>25*1024*1024)throw new Error('O arquivo excede 25 MB. Confira se selecionou um backup válido.');
  let pkg=JSON.parse(await file.text());
   /* V7.84: backups antigos (formato 4, só 6 grupos) continuam podendo ser restaurados */
   if(pkg&&!pkg.data&&Array.isArray(pkg.dores)&&Array.isArray(pkg.consultas)&&Array.isArray(pkg.medicamentos)&&Array.isArray(pkg.exames)){pkg={app:'Minha Saúde IA',formatVersion:'legado-'+(pkg.version||4),exportedAt:pkg.createdAt,data:{[K.d]:pkg.dores,[K.c]:pkg.consultas,[K.m]:pkg.medicamentos,[K.e]:pkg.exames,[K.p]:Array.isArray(pkg.perfil)?pkg.perfil:[],[K.medidas]:Array.isArray(pkg.medidasCorporais)?pkg.medidasCorporais:[]}}}
  if(!pkg||pkg.app!=='Minha Saúde IA'||!pkg.data||typeof pkg.data!=='object'||Array.isArray(pkg.data))throw new Error('Arquivo incompatível. Selecione um backup JSON do Minha Saúde IA.');
  const entries=Object.entries(pkg.data);
  if(!entries.length)throw new Error('O backup está vazio.');
  const allowed=new Set(backupLogicalKeys());
  const valid=entries.filter(([k,v])=>allowed.has(k)&&!backupExcluded(k)&&(Array.isArray(v)||(v&&typeof v==='object')));
  if(!valid.length)throw new Error('Não encontrei registros reconhecidos neste backup. Nenhum dado foi alterado.');
  const prepared=[];
  let ignored=entries.length-valid.length;
  valid.forEach(([k,incoming])=>{
   const before=parseStored(k);
   if(before.invalid)throw new Error('O dado atual "'+k+'" não está em formato válido. Faça uma cópia manual antes de continuar.');
   const merged=mergeBackupValue(k,before.value,incoming);
   if(JSON.stringify(merged)!==JSON.stringify(before.value)){
    prepared.push({key:k,beforeRaw:before.raw,nextRaw:JSON.stringify(merged),added:Array.isArray(incoming)?incoming.length:1});
   }
  });
  if(!prepared.length){
   alert('ℹ️ O backup foi validado, mas não contém dados novos para mesclar. Seus registros atuais foram mantidos.');
   return;
  }
  const summary='Backup validado: '+valid.length+' grupos reconhecidos'+(ignored?' e '+ignored+' item(ns) ignorado(s)':'')+'.\n\nA restauração mescla os registros, mantém itens atuais e não importa seu PIN.\n\nDeseja continuar?';
  let integridade='nenhuma';try{if(pkg.integrity&&pkg.integrity.value)integridade=crc32(JSON.stringify(pkg.data))===pkg.integrity.value?'ok':'falhou'}catch(e){}
   const seguir=typeof window.msaPreviaRestauracao==='function'?await window.msaPreviaRestauracao({pkg:pkg,prepared:prepared,valid:valid.length,ignored:ignored,integridade:integridade,file:file}):confirm(summary+(integridade==='falhou'?'\n\n⚠️ A conferência de integridade falhou: o arquivo pode ter sido alterado ou corrompido.':''));
   if(!seguir)return;
  for(const item of prepared){
   snapshots.push(item);
   const ok=storage.set(item.key,JSON.parse(item.nextRaw));
   if(ok===false)throw new Error('O navegador não confirmou a gravação de "'+item.key+'". A restauração será revertida.');
   const check=window.msaStorage.getItem(item.key);
   if(check!==item.nextRaw)throw new Error('A conferência de "'+item.key+'" falhou. A restauração será revertida.');
  }
  try{if(typeof render==='function')render()}catch(e){console.warn('[Minha Saúde IA] render após restauração',e)}
  alert('✅ Restauração concluída. '+prepared.length+' grupo(s) atualizado(s); os registros existentes foram preservados por mesclagem.');
 }catch(e){
  let rollbackOk=true;
  for(let i=snapshots.length-1;i>=0;i--){
   const item=snapshots[i];
   try{
    if(item.beforeRaw===null)window.msaStorage.removeItem(item.key);
    else window.msaStorage.setItem(item.key,item.beforeRaw);
   }catch(err){rollbackOk=false;console.error('[Minha Saúde IA] falha ao reverter backup',item.key,err)}
  }
  console.error('[Minha Saúde IA] restauração',e);
  alert('❌ '+(e.message||'Não foi possível restaurar o backup.')+(snapshots.length?(rollbackOk?'\nAs alterações parciais foram revertidas.':'\n⚠️ Confira os registros e crie um backup imediatamente.'):''));
 }finally{if(ev?.target)ev.target.value=''}
};
 /* V7.84: relatorios-v599.js ainda declara baixarBackup e restaurarBackup (versão antiga: só 6 grupos de dados, restauração que substitui)
    e, por carregar depois, sobrescrevia as versões completas daqui. Depois que todos os scripts carregam, as completas voltam a valer. */
 const _restaurarCompleto=window.restaurarBackup;
 function usarBackupCompleto(){window.baixarBackup=function(){return window.exportarJSONCompleto()};window.restaurarBackup=_restaurarCompleto}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',usarBackupCompleto,{once:true});else usarBackupCompleto();
 window.addEventListener('load',usarBackupCompleto);
window.abrirModoEmergencia=function(){
 const p=profile(), meds=g(key('m','msa2_meds')), modal=document.getElementById('emergencyOverlay');
 if(!modal)return;
 document.getElementById('emName').textContent=p.nome||'Não informado';
 document.getElementById('emBlood').textContent=p.sangue||'Não informado';
 document.getElementById('emAllergy').textContent=p.alerg||'Não informado';
 document.getElementById('emCond').textContent=p.cond||'Não informado';
 document.getElementById('emMeds').textContent=meds.length?meds.map(x=>x.nome+(x.dose?' — '+x.dose:'')).join(' • '):'Nenhum registrado';
 document.getElementById('emContact').textContent=p.emerg?(p.emerg+(p.tel?' — '+p.tel:'')):'Não informado';
 modal.style.display='flex';
 document.body.style.overflow='hidden';
};
window.fecharModoEmergencia=function(){const m=document.getElementById('emergencyOverlay');if(m)m.style.display='none';document.body.style.overflow='';};
window.imprimirModoEmergencia=function(){window.print()};
window.exportarResumoEmergencia=function(){
 const p=profile(), meds=g(key('m','msa2_meds'));
 const text=['MINHA SAÚDE IA — CARTÃO DE EMERGÊNCIA','Nome: '+(p.nome||'Não informado'),'Tipo sanguíneo: '+(p.sangue||'Não informado'),'Alergias: '+(p.alerg||'Não informado'),'Condições: '+(p.cond||'Não informado'),'Medicamentos: '+(meds.length?meds.map(x=>x.nome+(x.dose?' — '+x.dose:'')).join('; '):'Nenhum registrado'),'Contato de emergência: '+(p.emerg||'Não informado'),'Telefone: '+(p.tel||'Não informado'),'Atualizado: '+new Date().toLocaleString('pt-BR')].join('\n');
 download('cartao-emergencia.txt',text,'text/plain;charset=utf-8');
};
window.adicionarDocumentoSaude=function(){
 const input=document.getElementById('novoDocumentoArquivo'); if(input)input.click();
};
window.processarDocumentoSaude=function(ev){
 const file=ev.target.files&&ev.target.files[0]; if(!file)return;
 const max=2*1024*1024;
 if(file.size>max){alert('⚠️ Para manter o armazenamento do navegador saudável, use arquivos de até 2 MB.');ev.target.value='';return}
 const reader=new FileReader();
 reader.onload=function(){
  const arr=g(key('doc','msa2_documentos'));
  arr.push({id:Date.now(),nome:file.name,tipo:file.type||'arquivo',tamanho:file.size,data:new Date().toISOString(),arquivo:reader.result});
  try{storage.set(K.doc,arr);renderDocumentosSaude();alert('📄 Documento adicionado ao seu cofre local.')}catch(e){arr.pop();alert('⚠️ Não foi possível salvar. O armazenamento do navegador pode estar cheio.')}
 };
 reader.readAsDataURL(file);
 ev.target.value='';
};
window.renderDocumentosSaude=function(){
 const box=document.getElementById('documentosSaudeList');if(!box)return;
 const arr=g(key('doc','msa2_documentos'));
 box.innerHTML=arr.length?arr.slice().reverse().map(x=>'<div class="item"><div class="itemtop"><b>📄 '+esc(x.nome)+'</b><span class="tag">'+esc(x.tipo||'arquivo')+'</span></div><p>'+new Date(x.data).toLocaleString('pt-BR')+' · '+Math.round((x.tamanho||0)/1024)+' KB</p><div class="row"><button class="btn small" onclick="abrirDocumentoSaude('+x.id+')">👁️ Abrir</button><button class="btn small red" onclick="removerDocumentoSaude('+x.id+')">🗑️ Remover</button></div></div>').join(''):'<div class="empty">Nenhum documento armazenado.</div>';
};
window.abrirDocumentoSaude=function(id){
 const x=g(key('doc','msa2_documentos')).find(a=>a.id===id);if(!x||!x.arquivo)return;
 const w=window.open();if(w)w.document.write('<title>'+esc(x.nome)+'</title><iframe src="'+x.arquivo+'" style="width:100%;height:100vh;border:0"></iframe>');
};
window.removerDocumentoSaude=function(id){
 if(!confirm('Remover este documento do armazenamento local?'))return;
 const arr=g(key('doc','msa2_documentos')).filter(x=>x.id!==id);storage.set(K.doc,arr);renderDocumentosSaude();
};
window.inicializarRecursosV461=function(){renderDocumentosSaude();renderBackupReminder()};
document.addEventListener('DOMContentLoaded',window.inicializarRecursosV461);
})();