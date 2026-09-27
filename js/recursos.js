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
function profile(){return g(key('p','msa2_perfil'))[0]||{}}
function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function download(name,text,type){
 const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type}));a.download=name;a.click();
 setTimeout(()=>URL.revokeObjectURL(a.href),1000);
}
window.exportarJSONCompleto=function(){
 const keys=['msa2_dores','msa2_consultas','msa2_meds','msa2_exames','msa2_perfil','msa2_vitais','msa2_lembretes','msa2_vacinas','msa2_familia','msa2_documentos','msa2_nutri','msa2_suplementos','msa2_reacoes_alimentares','msa2_hidratacao','msa2_sono','msa2_bemestar','msa2_gatilhos','msa2_medicamentos_rotina','msa2_medicamentos_tomados'];
 const data={app:'Minha Saúde IA',formatVersion:'1.0',exportedAt:new Date().toISOString(),data:{}};
 keys.forEach(k=>{try{data.data[k]=JSON.parse(window.msaStorage.getItem(k)||'[]')}catch(e){data.data[k]=[]}}); 
 download('minha-saude-ia-backup-'+new Date().toISOString().slice(0,10)+'.json',JSON.stringify(data,null,2),'application/json');
};
window.abrirModoEmergencia=function(){
 const p=profile(), meds=g('msa2_meds'), modal=document.getElementById('emergencyOverlay');
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
 const p=profile(), meds=g('msa2_meds');
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
  const arr=g('msa2_documentos');
  arr.push({id:Date.now(),nome:file.name,tipo:file.type||'arquivo',tamanho:file.size,data:new Date().toISOString(),arquivo:reader.result});
  try{storage.set(K.doc,arr);renderDocumentosSaude();alert('📄 Documento adicionado ao seu cofre local.')}catch(e){arr.pop();alert('⚠️ Não foi possível salvar. O armazenamento do navegador pode estar cheio.')}
 };
 reader.readAsDataURL(file);
 ev.target.value='';
};
window.renderDocumentosSaude=function(){
 const box=document.getElementById('documentosSaudeList');if(!box)return;
 const arr=g('msa2_documentos');
 box.innerHTML=arr.length?arr.slice().reverse().map(x=>'<div class="item"><div class="itemtop"><b>📄 '+esc(x.nome)+'</b><span class="tag">'+esc(x.tipo||'arquivo')+'</span></div><p>'+new Date(x.data).toLocaleString('pt-BR')+' · '+Math.round((x.tamanho||0)/1024)+' KB</p><div class="row"><button class="btn small" onclick="abrirDocumentoSaude('+x.id+')">👁️ Abrir</button><button class="btn small red" onclick="removerDocumentoSaude('+x.id+')">🗑️ Remover</button></div></div>').join(''):'<div class="empty">Nenhum documento armazenado.</div>';
};
window.abrirDocumentoSaude=function(id){
 const x=g('msa2_documentos').find(a=>a.id===id);if(!x||!x.arquivo)return;
 const w=window.open();if(w)w.document.write('<title>'+esc(x.nome)+'</title><iframe src="'+x.arquivo+'" style="width:100%;height:100vh;border:0"></iframe>');
};
window.removerDocumentoSaude=function(id){
 if(!confirm('Remover este documento do armazenamento local?'))return;
 const arr=g('msa2_documentos').filter(x=>x.id!==id);storage.set(K.doc,arr);renderDocumentosSaude();
};
window.inicializarRecursosV461=function(){renderDocumentosSaude()};
document.addEventListener('DOMContentLoaded',window.inicializarRecursosV461);
})();