/* Minha Saúde IA — Cadastro de médicos por perfil V7.60
 * A lista usa o armazenamento do perfil ativo. Não altera consultas existentes.
 */
(function(){
'use strict';
if(window.__msaDoctorsDirectory760)return;
window.__msaDoctorsDirectory760=true;
const KEY=(window.MSA_K&&window.MSA_K.medicos)||'msa2_medicos_cadastrados';
const $=id=>document.getElementById(id);
const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR').replace(/\s+/g,' ').trim();
let filterText='';
function getList(){
 try{const v=window.MSAStorage&&typeof window.MSAStorage.get==='function'?window.MSAStorage.get(KEY):JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(v)?v:[]}
 catch(e){return[]}
}
function saveList(list){
 try{
  if(window.MSAStorage&&typeof window.MSAStorage.set==='function')return window.MSAStorage.set(KEY,list)!==false;
  localStorage.setItem(KEY,JSON.stringify(list));return JSON.parse(localStorage.getItem(KEY)||'null')!==null;
 }catch(e){return false}
}
function activeProfile(){
 const storage=window.MSAStorage,selected=storage&&typeof storage.selectedProfileId==='function'?String(storage.selectedProfileId()||''):'';
 if(selected){
  const familyKey=(window.MSA_K&&window.MSA_K.familiares)||'msa2_familiares';
  const fam=storage&&typeof storage.get==='function'?storage.get(familyKey):[];
  const member=Array.isArray(fam)?fam.find(p=>String(p&&p.id)===selected):null;
  if(member)return {id:selected,name:member.nome||member.name||'Pessoa selecionada',isFamily:true};
 }
 let p={};try{const x=storage&&storage.get?storage.get('msa2_perfil'):[];p=Array.isArray(x)?x[0]||{}:x||{}}catch(e){}
 return {id:selected,name:p.nome||p.name||'Meu perfil',isFamily:false};
}
function announce(msg){
 const status=$('msaDoctorStatus760');
 if(status){status.textContent=msg;status.hidden=false}
 if(window.msaToast)window.msaToast(msg);
}
function value(id){const el=$(id);return el?String(el.value||'').trim():''}
function emptyForm(){
 const f=$('msaDoctorForm760');if(f)f.reset();
 if($('msaDoctorEditId760'))$('msaDoctorEditId760').value='';
 const submit=$('msaDoctorSave760');if(submit)submit.textContent='💾 Cadastrar médico';
 const cancel=$('msaDoctorCancel760');if(cancel)cancel.hidden=true;
 const title=$('msaDoctorFormTitle760');if(title)title.textContent='Adicionar médico';
}
function renderDatalist(){
 const input=$('cMed');if(!input)return;
 let dl=$('msaDoctorsDatalist760');
 if(!dl){dl=document.createElement('datalist');dl.id='msaDoctorsDatalist760';document.body.appendChild(dl)}
 input.setAttribute('list',dl.id);
 const doctors=getList();
 dl.innerHTML=doctors.map(d=>'<option value="'+esc(d.nome||'')+'" label="'+esc([d.especialidade,d.clinica].filter(Boolean).join(' · '))+'"></option>').join('');
}
function connectConsultation(){
 const nameInput=$('cMed'),specialty=$('cEsp');
 if(!nameInput)return;
 if(!nameInput.dataset.msaDoctorDirectory760){
  nameInput.dataset.msaDoctorDirectory760='1';nameInput.setAttribute('list','msaDoctorsDatalist760');
  nameInput.addEventListener('focus',renderDatalist);
  nameInput.addEventListener('change',()=>{
   const current=norm(nameInput.value),doctor=getList().find(d=>norm(d.nome)===current);
   if(doctor&&specialty&&!specialty.value.trim()&&doctor.especialidade)specialty.value=doctor.especialidade;
   const hint=$('msaDoctorConsultHint760');
   if(hint)hint.textContent=doctor?'Médico cadastrado para este perfil'+(doctor.especialidade?' · '+doctor.especialidade:'')+'.':'Você pode escolher um médico cadastrado ou digitar outro nome.';
  });
 }
 renderDatalist();
 if(!$('msaDoctorConsultHint760')){
  const hint=document.createElement('small');hint.id='msaDoctorConsultHint760';hint.className='muted';
  hint.style.cssText='display:block;margin-top:-5px;margin-bottom:9px;font-size:12px';
  nameInput.insertAdjacentElement('afterend',hint);
  hint.textContent='Sugestões de médicos cadastrados para o perfil ativo; também é possível digitar outro nome.';
 }
}
function editDoctor(id){
 const d=getList().find(x=>String(x.id)===String(id));if(!d)return;
 $('msaDoctorEditId760').value=String(d.id);
 $('msaDoctorName760').value=d.nome||'';
 $('msaDoctorSpecialty760').value=d.especialidade||'';
 $('msaDoctorClinic760').value=d.clinica||'';
 $('msaDoctorPhone760').value=d.telefone||'';
 $('msaDoctorAddress760').value=d.endereco||'';
 $('msaDoctorPlan760').value=d.convenio||'';
 $('msaDoctorNotes760').value=d.obs||'';
 $('msaDoctorSave760').textContent='💾 Salvar alterações';
 $('msaDoctorCancel760').hidden=false;
 $('msaDoctorFormTitle760').textContent='Editar médico';
 $('msaDoctorForm760').scrollIntoView({behavior:'smooth',block:'center'});
}
function deleteDoctor(id){
 const list=getList(),d=list.find(x=>String(x.id)===String(id));if(!d)return;
 if(!confirm('Excluir o cadastro de '+(d.nome||'este médico')+' deste perfil?\n\nAs consultas já registradas serão preservadas.'))return;
 if(!saveList(list.filter(x=>String(x.id)!==String(id)))){
  announce('Não foi possível salvar a exclusão.');return;
 }
 render();announce('Cadastro de médico excluído. As consultas anteriores foram mantidas.');
}
function renderList(){
 const host=$('msaDoctorsList760');if(!host)return;
 const all=getList(),q=norm(filterText),shown=all.filter(d=>!q||norm([d.nome,d.especialidade,d.clinica,d.telefone,d.endereco,d.convenio,d.obs].join(' ')).includes(q));
 const profile=activeProfile(),label=$('msaDoctorsProfile760');
 if(label)label.textContent='Lista vinculada a: '+profile.name+(profile.isFamily?' (perfil familiar)':'');
 const count=$('msaDoctorsCount760');if(count)count.textContent=all.length+' médico(s) cadastrado(s) neste perfil';
 if(!all.length){
  host.innerHTML='<div class="empty" style="padding:14px">Ainda não há médicos cadastrados para <b>'+esc(profile.name)+'</b>. Você pode deixar a lista vazia e cadastrar os profissionais da sua mãe quando estiver no perfil dela.</div>';
  return;
 }
 if(!shown.length){host.innerHTML='<div class="empty" style="padding:14px">Nenhum médico corresponde à busca.</div>';return}
 host.innerHTML=shown.map(d=>'<article class="msa-doctor-item760"><div class="msa-doctor-main760"><div class="msa-doctor-avatar760" aria-hidden="true">🩺</div><div class="msa-doctor-info760"><b>'+esc(d.nome||'Nome não informado')+'</b>'+(d.especialidade?'<span>'+esc(d.especialidade)+'</span>':'<span class="muted">Especialidade não informada</span>')+(d.clinica?'<small>🏥 '+esc(d.clinica)+'</small>':'')+(d.telefone?'<small>📞 '+esc(d.telefone)+'</small>':'')+(d.convenio?'<small>💳 '+esc(d.convenio)+'</small>':'')+(d.endereco?'<small>📍 '+esc(d.endereco)+'</small>':'')+(d.obs?'<small>📝 '+esc(d.obs)+'</small>':'')+'</div></div><div class="msa-doctor-actions760"><button type="button" class="btn secondary small" data-doc-edit760="'+esc(d.id)+'">✏️ Editar</button><button type="button" class="btn red small" data-doc-delete760="'+esc(d.id)+'">🗑️ Excluir</button></div></article>').join('');
 host.querySelectorAll('[data-doc-edit760]').forEach(b=>b.addEventListener('click',()=>editDoctor(b.dataset.docEdit760)));
 host.querySelectorAll('[data-doc-delete760]').forEach(b=>b.addEventListener('click',()=>deleteDoctor(b.dataset.docDelete760)));
}
function ensureSettingsCard(){
 const section=$('configuracoes'),parent=$('msaSettingsProfessional');
 if(!section)return;
 let card=$('msaDoctorsSettings760');
 if(!card){
  card=document.createElement('div');card.id='msaDoctorsSettings760';card.className='card msa-doctors-settings760';
  card.innerHTML=
   '<div class="msa-doctor-section-head760"><div><div class="msa-vd-kicker">👩‍⚕️ CADASTRO DE PROFISSIONAIS</div><h2 style="margin:4px 0">Médicos que me atendem</h2><p class="muted" style="margin:0">Cadastre médicos, especialistas, clínicas e contatos para reutilizar ao registrar consultas.</p></div><span aria-hidden="true" style="font-size:30px">🩺</span></div>'+
   '<div class="alert safe" style="margin-top:11px">🔐 Cada lista acompanha o perfil de saúde ativo. Você pode não ter médicos cadastrados no seu perfil e manter vários médicos no perfil da sua mãe.</div>'+
   '<div id="msaDoctorsProfile760" class="msa-doctor-profile760"></div><div id="msaDoctorsCount760" class="muted" style="font-size:12px;margin:9px 0"></div>'+
   '<details id="msaDoctorFormDetails760" open><summary id="msaDoctorFormTitle760" style="cursor:pointer;font-weight:850;padding:8px 0">Adicionar médico</summary>'+
   '<form id="msaDoctorForm760" style="margin-top:8px"><input type="hidden" id="msaDoctorEditId760">'+
   '<div class="msa-doctor-fields760"><label>Nome do médico <span style="color:#dc2626">*</span><input id="msaDoctorName760" required maxlength="120" placeholder="Ex.: Dra. Ana Silva"></label><label>Especialidade<input id="msaDoctorSpecialty760" maxlength="100" placeholder="Ex.: dermatologia, cardiologia"></label><label>Clínica / hospital<input id="msaDoctorClinic760" maxlength="140" placeholder="Nome da clínica ou hospital"></label><label>Telefone / WhatsApp<input id="msaDoctorPhone760" type="tel" maxlength="50" placeholder="(51) 99999-9999"></label><label>Convênio / plano de saúde<input id="msaDoctorPlan760" maxlength="100" placeholder="Ex.: Unimed, particular"></label><label>Endereço<input id="msaDoctorAddress760" maxlength="220" placeholder="Rua, número, cidade"></label></div>'+
   '<label>Observações<textarea id="msaDoctorNotes760" rows="2" maxlength="800" placeholder="Ex.: horários, instruções de agendamento, informações úteis"></textarea></label>'+
   '<div class="row" style="gap:8px;margin-top:10px"><button type="submit" class="btn green" id="msaDoctorSave760">💾 Cadastrar médico</button><button type="button" class="btn secondary" id="msaDoctorCancel760" hidden>Cancelar edição</button></div></form></details>'+
   '<div style="border-top:1px solid #e2e8f0;margin-top:14px;padding-top:12px"><label for="msaDoctorSearch760">🔎 Buscar médico cadastrado</label><input id="msaDoctorSearch760" type="search" placeholder="Nome, especialidade, clínica ou convênio"><div id="msaDoctorsList760" class="msa-doctor-list760" style="margin-top:10px"></div></div>'+
   '<div id="msaDoctorStatus760" role="status" aria-live="polite" hidden style="margin-top:10px"></div>'+
   '<p class="muted" style="font-size:11px;margin-top:12px">Os contatos ficam no armazenamento local deste navegador, separados por perfil. Faça backup e mantenha telefone/endereço atualizados. Apagar um médico não apaga consultas já registradas.</p>';
  const style=document.createElement('style');style.id='msaDoctorsStyles760';
  style.textContent=
   '.msa-doctors-settings760{margin:14px 0;border:1px solid #dbe5f4;border-radius:18px;padding:15px}.msa-doctor-section-head760{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}.msa-doctor-profile760{padding:8px 10px;border-radius:10px;background:#f1f5f9;font-weight:800;font-size:12px;margin-top:10px}.msa-doctor-fields760{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.msa-doctor-fields760 label{margin:0}.msa-doctor-list760{display:grid;gap:9px}.msa-doctor-item760{padding:12px;border:1px solid #e2e8f0;border-radius:13px;display:flex;gap:12px;align-items:flex-start;justify-content:space-between;flex-wrap:wrap}.msa-doctor-main760{display:flex;gap:10px;min-width:0;flex:1}.msa-doctor-avatar760{width:40px;height:40px;flex:0 0 40px;border-radius:12px;background:#e8f1ff;display:flex;align-items:center;justify-content:center;font-size:21px}.msa-doctor-info760{display:flex;flex-direction:column;gap:3px;min-width:0}.msa-doctor-info760>b{font-size:15px}.msa-doctor-info760>span{font-size:12px;color:#2563eb;font-weight:750}.msa-doctor-info760>small{font-size:12px;line-height:1.4;color:#64748b;overflow-wrap:anywhere}.msa-doctor-actions760{display:flex;gap:6px;flex-wrap:wrap}.msa-doctors-settings760 details summary{list-style-position:inside}.msa-doctors-settings760 input,.msa-doctors-settings760 textarea{box-sizing:border-box;width:100%}@media(max-width:600px){.msa-doctors-settings760{padding:12px}.msa-doctor-fields760{grid-template-columns:1fr}.msa-doctor-actions760{width:100%}.msa-doctor-actions760 button{flex:1}.msa-doctor-item760{padding:10px}}body.msa-dark .msa-doctor-profile760,body.msa-dark .msa-doctor-item760{background:#1f2937;border-color:#334155}body.msa-dark .msa-doctor-avatar760{background:#26364e}';
  document.head.appendChild(style);
  if(parent)parent.insertBefore(card,parent.firstChild);else section.appendChild(card);
  $('msaDoctorForm760').addEventListener('submit',saveDoctor);
  $('msaDoctorCancel760').addEventListener('click',emptyForm);
  $('msaDoctorSearch760').addEventListener('input',()=>{filterText=$('msaDoctorSearch760').value;renderList()});
 }
 renderList();
}
function saveDoctor(e){
 e.preventDefault();
 const name=value('msaDoctorName760'),specialty=value('msaDoctorSpecialty760'),editId=value('msaDoctorEditId760');
 if(!name){announce('Informe o nome do médico.');return}
 const list=getList(),keyName=norm(name),keySpec=norm(specialty);
 const duplicate=list.find(d=>String(d.id)!==editId&&norm(d.nome)===keyName&&(!keySpec||!d.especialidade||norm(d.especialidade)===keySpec));
 if(duplicate&&confirm('Já existe um cadastro semelhante para '+(duplicate.nome||name)+(duplicate.especialidade?' — '+duplicate.especialidade:'')+'. Deseja editar esse cadastro em vez de criar outro?')){editDoctor(duplicate.id);return}
 const current=editId?list.find(d=>String(d.id)===editId):null;
 const doctor={id:editId||('med_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,8)),nome:name,especialidade:specialty,clinica:value('msaDoctorClinic760'),telefone:value('msaDoctorPhone760'),convenio:value('msaDoctorPlan760'),endereco:value('msaDoctorAddress760'),obs:value('msaDoctorNotes760'),criadoEm:current&&current.criadoEm?current.criadoEm:new Date().toISOString(),atualizadoEm:new Date().toISOString()};
 const next=editId?list.map(d=>String(d.id)===editId?doctor:d):list.concat(doctor);
 if(!saveList(next)){announce('Não foi possível salvar o médico neste navegador. Confira o espaço disponível e tente novamente.');return}
 emptyForm();filterText='';if($('msaDoctorSearch760'))$('msaDoctorSearch760').value='';
 render();announce(editId?'✅ Cadastro do médico atualizado.':'✅ Médico cadastrado para este perfil.');
}
function render(){
 ensureSettingsCard();connectConsultation();renderDatalist();
}
function boot(){
 render();
 document.addEventListener('click',e=>{if(e.target.closest('#nav button,.msa-mobile-links button,.msa-mobile-quick button,[data-go]'))setTimeout(()=>{if($('configuracoes')&&$('configuracoes').classList.contains('active'))render();renderDatalist()},180)},true);
 document.addEventListener('focusin',e=>{if(e.target&&e.target.id==='cMed')renderDatalist()});
 window.addEventListener('msa:familiares-atualizados',()=>setTimeout(()=>{if($('configuracoes')&&$('configuracoes').classList.contains('active'))render();renderDatalist()},100));
 window.addEventListener('pageshow',()=>{if($('configuracoes')&&$('configuracoes').classList.contains('active'))render();renderDatalist()});
 const section=$('configuracoes');if(section&&window.MutationObserver)new MutationObserver(()=>{if(section.classList.contains('active'))render()}).observe(section,{attributes:true,attributeFilter:['class']});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
window.renderMedicosCadastrados=render;
})();