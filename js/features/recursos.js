/* Minha Saúde IA — recursos complementares V4.61
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
window.exportarJSONCompleto=function(){
 const keys=[key('d','msa2_dores'),key('c','msa2_consultas'),key('m','msa2_meds'),key('e','msa2_exames'),key('p','msa2_perfil'),key('v','msa2_vitais'),key('r','msa2_lembretes'),key('vax','msa2_vacinas'),key('fam','msa2_familia'),key('doc','msa2_documentos'),key('nutri','msa2_nutri'),key('suplReg','msa2_suplementos'),key('food','msa2_reacoes_alimentares'),key('agua','msa2_hidratacao'),key('sono','msa2_sono'),key('bem','msa2_bemestar'),key('gat','msa2_gatilhos'),key('medRot','msa2_medicamentos_rotina'),key('medTaken','msa2_medicamentos_tomados'),key('ciclo','msa2_ciclo_menstrual'),key('anticoncepcional','msa2_anticoncepcional'),key('medidas','msa2_medidas_corporais'),key('preferencias','msa2_preferencias')];
 const data={app:'Minha Saúde IA',formatVersion:'1.0',exportedAt:new Date().toISOString(),data:{}};
 keys.forEach(k=>{try{data.data[k]=JSON.parse(window.msaStorage.getItem(k)||'[]')}catch(e){data.data[k]=[]}}); 
 download('minha-saude-ia-backup-'+new Date().toISOString().slice(0,10)+'.json',JSON.stringify(data,null,2),'application/json');
};
window.baixarBackup=function(){window.exportarJSONCompleto();};
window.restaurarBackup=async function(ev){
 const file=ev?.target?.files?.[0];
 if(!file)return;
 try{
  if(typeof window.msaImportSyncPackage==='function'){
   await window.msaImportSyncPackage(file);
   return;
  }
  const pkg=JSON.parse(await file.text());
  if(!pkg||pkg.app!=='Minha Saúde IA'||!pkg.data)throw new Error('Arquivo incompatível.');
  const entries=Object.entries(pkg.data);
  if(!entries.length)throw new Error('O backup está vazio.');
  if(!confirm('♻️ Backup encontrado. Os registros serão mesclados aos dados atuais, sem apagar o histórico existente. Continuar?'))return;
  let total=0;
  entries.forEach(([rawKey,incoming])=>{
   const keyName=Object.keys(K).find(n=>K[n]===rawKey);
   if(!keyName||!Array.isArray(incoming)||!incoming.length)return;
   const k=K[keyName],before=storage.get(k);
   const after=(keyName==='p'||keyName==='preferencias')?incoming:[...before,...incoming.filter(x=>!before.some(y=>JSON.stringify(y)===JSON.stringify(x)))];
   if(JSON.stringify(before)!==JSON.stringify(after)){storage.set(k,after);total+=incoming.length;}
  });
  if(typeof render==='function')render();
  alert('✅ Backup restaurado. '+total+' item(ns) novo(s) foram mesclados.');
 }catch(e){alert('❌ Não foi possível restaurar o backup: '+(e.message||e));}
 finally{if(ev?.target)ev.target.value='';}
};
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
window.inicializarRecursosV461=function(){renderDocumentosSaude()};
document.addEventListener('DOMContentLoaded',window.inicializarRecursosV461);
})();