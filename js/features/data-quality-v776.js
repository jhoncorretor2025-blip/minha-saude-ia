/* Minha Saúde IA — revisão segura da qualidade de dados V7.76
 * A análise é feita no perfil ativo por meio de MSAStorage.
 * Nunca remove ou consolida registros automaticamente.
 */
(function(){
'use strict';
const K=window.MSA_K||window.K||{};
const storage=window.MSAStorage;
const TRASH='msa2_integridade_lixeira';
const byId=id=>document.getElementById(id);
const esc=window.MSAUtils&&window.MSAUtils.esc?window.MSAUtils.esc:function(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};

function normalize(value){
 let s=String(value==null?'':value).toLowerCase();
 try{s=s.normalize('NFD').replace(/[\u0300-\u036f]/g,'')}catch(e){}
 s=s.replace(/julho\/(\d{4})/g,'julho $1')
  .replace(/sem alteracoes(?: relatadas| observadas| identificadas)?/g,' normal ')
  .replace(/(?:resultado|exame|laudo) informado/g,' ')
  .replace(/(?:mencionada|mencionado|registrada|registrado|informada|informado) como/g,' ')
  .replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' ');
 return s;
}
function tokens(value){
 const stop=new Set(['de','da','do','das','dos','e','em','no','na','nos','nas','para','por','com','como','foi','uma','um','que','ao','aos','as','os','relatado','relatada','relatados','relatadas','mencionado','mencionada','registrado','registrada']);
 return normalize(value).split(' ').filter(function(t){return t.length>1&&!stop.has(t)});
}
function similarity(a,b){
 const A=new Set(tokens(a)),B=new Set(tokens(b));
 if(!A.size||!B.size)return 0;
 let common=0;A.forEach(function(t){if(B.has(t))common++});
 return common/(A.size+B.size-common);
}
function genericExam(name){
 return !name||/^(exame|exame informado|resultado de exame|laudo|exame medico|exame médico|nao informado|não informado)$/.test(normalize(name));
}
function dateValue(v){
 const s=String(v||'').slice(0,10);
 return /^\d{4}-\d{2}-\d{2}$/.test(s)&&!Number.isNaN(Date.parse(s+'T00:00:00'))?s:'';
}
function examResult(x){return String(x&& (x.res||x.resultado||x.obs)||'')}
function duplicateExam(a,b){
 const na=normalize(a&&a.nome),nb=normalize(b&&b.nome);
 const da=dateValue(a&&a.data),db=dateValue(b&&b.data);
 const ra=examResult(a),rb=examResult(b);
 if(na&&na===nb&&da&&db&&da===db)return true;
 if(na&&na===nb&&ra&&rb&&normalize(ra)===normalize(rb))return true;
 if((genericExam(na)||genericExam(nb))&&ra&&rb&&similarity(ra,rb)>=0.66)return true;
 if(na&&na===nb&&(!da||!db)&&ra&&rb&&similarity(ra,rb)>=0.68)return true;
 if(na&&nb&&na===nb&&ra&&rb&&similarity(ra,rb)>=0.9)return true;
 return false;
}
function duplicateMedication(a,b){
 const na=normalize(a&&a.nome),nb=normalize(b&&b.nome);
 if(!na||na!==nb)return false;
 const fields=['dose','freq','inicio','fim'];
 return fields.every(function(field){return normalize(a&&a[field])===normalize(b&&b[field])});
}
function duplicateCheck(kind,item,current){
 const check=kind==='exame'?duplicateExam:duplicateMedication;
 for(let i=0;i<(current||[]).length;i++){
  if(check(item,current[i]))return {index:i,record:current[i]};
 }
 return null;
}
function confirmBeforeSave(kind,item,current){
 const match=duplicateCheck(kind,item,current);
 if(!match)return true;
 const label=kind==='exame'?'exame':'medicamento';
 const existing=match.record||{};
 const detail=[existing.nome||label,existing.data||existing.inicio||'data não informada',existing.dose||''].filter(Boolean).join(' · ');
 return window.confirm('⚠️ Já existe um registro muito parecido de '+label+':\n'+detail+'\n\nPara evitar duplicidade, confira o histórico. Deseja salvar mesmo assim?');
}
function activeProfileName(){
 const profile=(storage&&typeof storage.get==='function'&&K.p)?(storage.get(K.p)||[])[0]||{}:{};
 return String(profile.nome||profile.name||'perfil ativo');
}
function fingerprint(value){
 const s=JSON.stringify(value==null?null:value);
 let h=2166136261;
 for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}
 return (h>>>0).toString(16);
}
function collect(){
 const findings=[];
 const lists=[
  {key:K.e||'msa2_exames',label:'Exame',kind:'exame',items:(storage.get(K.e||'msa2_exames')||[])},
  {key:K.m||'msa2_meds',label:'Medicamento',kind:'medicamento',items:(storage.get(K.m||'msa2_meds')||[])}
 ];
 lists.forEach(function(list){
  const arr=list.items;
  for(let i=0;i<arr.length;i++){
   const item=arr[i]||{};
   if(list.kind==='exame'){
    const issues=[];
    if(genericExam(item.nome))issues.push('nome precisa ser confirmado');
    if(!dateValue(item.data))issues.push('data ausente ou inválida');
    if(!String(item.res||item.resultado||item.obs||'').trim())issues.push('resultado/observação ausente');
    if(issues.length)findings.push({type:'incomplete',key:list.key,label:list.label,kind:list.kind,index:i,record:item,issues:issues});
   }else{
    const issues=[];
    if(!String(item.nome||'').trim())issues.push('nome ausente');
    if(item.inicio&&item.fim&&dateValue(item.inicio)&&dateValue(item.fim)&&item.fim<item.inicio)issues.push('data final anterior à data inicial');
    if(issues.length)findings.push({type:'incomplete',key:list.key,label:list.label,kind:list.kind,index:i,record:item,issues:issues});
   }
   for(let j=i+1;j<arr.length;j++){
    const other=arr[j]||{};
    const same=list.kind==='exame'?duplicateExam(item,other):duplicateMedication(item,other);
    if(same)findings.push({type:'duplicate',key:list.key,label:list.label,kind:list.kind,index:i,otherIndex:j,record:item,otherRecord:other});
   }
  }
 });
 return findings;
}
function describe(item,kind){
 if(kind==='exame'){
  const result=String(item.res||item.resultado||item.obs||'').trim();
  return [item.nome||'Nome não informado',dateValue(item.data)||'Data não informada',result].filter(Boolean).join(' · ');
 }
 return [item.nome||'Nome não informado',item.dose||'Dose não informada',item.freq||'Frequência não informada',item.inicio||'Início não informado',item.fim?'até '+item.fim:''].filter(Boolean).join(' · ');
}
function rowAction(key,index,record,kind,label){
 return '<div class="item" style="margin-top:7px"><div><b>'+esc(label)+'</b></div><p>'+esc(describe(record,kind))+'</p><div class="row" style="margin-top:8px"><button type="button" class="btn secondary small" data-dq-fix="'+esc(index)+'" data-dq-fp="'+fingerprint(record)+'" data-dq-key="'+esc(key)+'" data-dq-kind="'+esc(kind)+'">✏️ Corrigir dados</button><button type="button" class="btn red small" data-dq-trash="'+esc(index)+'" data-dq-fp="'+fingerprint(record)+'" data-dq-key="'+esc(key)+'">🗑️ Mover para lixeira</button></div></div>';
}
function renderFindings(findings){
 const box=byId('msaDQResults');if(!box)return;
 const dups=findings.filter(function(x){return x.type==='duplicate'});
 const missing=findings.filter(function(x){return x.type==='incomplete'});
 let html='<div class="alert safe" role="status">Análise do '+esc(activeProfileName())+': '+dups.length+' possível(is) duplicidade(s) e '+missing.length+' registro(s) que merecem revisão. Nenhum dado foi alterado pela análise.</div>';
 if(dups.length){
  html+='<h3 style="margin-top:14px">Possíveis duplicidades</h3><p class="muted">Compare os registros antes de decidir. Um registro parecido não é necessariamente duplicado.</p>';
  dups.forEach(function(f){
   html+='<div class="item" style="margin-top:8px"><b>⚠️ '+esc(f.label)+' — itens '+(f.index+1)+' e '+(f.otherIndex+1)+'</b>'+
    rowAction(f.key,f.index,f.record,f.kind,'Registro '+(f.index+1))+
    rowAction(f.key,f.otherIndex,f.otherRecord,f.kind,'Registro '+(f.otherIndex+1))+
    '</div>';
  });
 }
 if(missing.length){
  html+='<h3 style="margin-top:14px">Dados incompletos</h3><p class="muted">Preencha somente o que você conseguir confirmar nos seus documentos ou lembranças.</p>';
  missing.forEach(function(f){
   html+='<div class="item" style="margin-top:8px"><b>📝 '+esc(f.label)+' '+(f.index+1)+'</b><p>'+esc(describe(f.record,f.kind))+'</p><p>Revisar: '+esc(f.issues.join(', '))+'</p>'+
    '<div class="row" style="margin-top:8px"><button type="button" class="btn secondary small" data-dq-fix="'+esc(f.index)+'" data-dq-fp="'+fingerprint(f.record)+'" data-dq-key="'+esc(f.key)+'" data-dq-kind="'+esc(f.kind)+'">✏️ Corrigir dados</button></div></div>';
  });
 }
 if(!dups.length&&!missing.length)html+='<div class="empty" style="margin-top:10px">✅ Nenhum problema de duplicidade ou campos incompletos foi encontrado nesta verificação.</div>';
 box.innerHTML=html;
 renderTrash();
}
function scan(){
 if(!storage||typeof storage.get!=='function'||typeof storage.set!=='function'){
  const box=byId('msaDQResults');if(box)box.innerHTML='<div class="alert danger">O armazenamento do perfil não está disponível. Atualize a página e tente novamente.</div>';
  return;
 }
 const profile=byId('msaDQProfile');if(profile)profile.textContent='Perfil analisado: '+activeProfileName()+'. A verificação usa somente os dados do perfil ativo.';
 renderFindings(collect());
}
function moveToTrash(key,index,expectedFingerprint){
 if(!storage||typeof storage.get!=='function'||typeof storage.set!=='function')return;
 const items=storage.get(key)||[],idx=Number(index);
 if(!Number.isInteger(idx)||idx<0||idx>=items.length){alert('A lista mudou desde a análise. Faça uma nova verificação antes de continuar.');scan();return}
 const record=items[idx];
 if(expectedFingerprint&&fingerprint(record)!==expectedFingerprint){alert('Este registro mudou desde a análise. Faça uma nova verificação antes de continuar.');scan();return}
 const label=key===(K.e||'msa2_exames')?'exame':'medicamento';
 if(!window.confirm('Mover este '+label+' para a lixeira do perfil ativo?\n\nO registro poderá ser restaurado depois.'))return;
 const trash=storage.get(TRASH)||[];
 trash.push({id:'dq-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7),sourceKey:key,sourceIndex:idx,record:JSON.parse(JSON.stringify(record)),removedAt:new Date().toISOString(),label:label,profile:activeProfileName()});
 if(storage.set(TRASH,trash)===false){alert('Não foi possível salvar o registro na lixeira. Nada foi removido.');return}
 items.splice(idx,1);
 if(storage.set(key,items)===false){
  trash.pop();storage.set(TRASH,trash);
  alert('Não foi possível salvar a alteração. O registro original foi mantido.');
  scan();return;
 }
 scan();
}
function fixRecord(key,index,expectedFingerprint,kind){
 const items=storage.get(key)||[],idx=Number(index);
 if(!Number.isInteger(idx)||idx<0||idx>=items.length){alert('A lista mudou desde a análise. Faça uma nova verificação.');scan();return}
 const record=Object.assign({},items[idx]||{});
 if(expectedFingerprint&&fingerprint(items[idx])!==expectedFingerprint){alert('Este registro mudou desde a análise. Faça uma nova verificação.');scan();return}
 if(kind==='exame'){
  const currentName=genericExam(record.nome)?'':String(record.nome||'');
  const name=window.prompt('Confirme o nome do exame. Não adivinhe; use o laudo ou comprovante quando possível.',currentName);
  if(name===null)return;
  if(!name.trim()){alert('Informe um nome de exame antes de salvar.');return}
  const currentDate=dateValue(record.data)||'';
  const date=window.prompt('Informe a data do exame no formato AAAA-MM-DD. Se não souber, cancele e mantenha o registro para revisão.',currentDate);
  if(date===null)return;
  if(!dateValue(date)||dateValue(date)!==date.trim()){alert('Data inválida. Use o formato AAAA-MM-DD.');return}
  record.nome=name.trim();record.data=date.trim();
 }else{
  const name=window.prompt('Confirme o nome do medicamento.',String(record.nome||''));
  if(name===null)return;
  if(!name.trim()){alert('Informe o nome do medicamento antes de salvar.');return}
  record.nome=name.trim();
  if(record.inicio&&record.fim&&dateValue(record.inicio)&&dateValue(record.fim)&&record.fim<record.inicio){alert('A data final não pode ser anterior à data inicial. Corrija o período antes de salvar.');return}
 }
 items[idx]=record;
 if(storage.set(key,items)===false){alert('Não foi possível salvar a correção. O registro anterior foi preservado.');return}
 scan();
}
function renderTrash(){
 const box=byId('msaDQTrash');if(!box||!storage)return;
 const items=storage.get(TRASH)||[];
 if(!items.length){box.innerHTML='<p class="muted">A lixeira desta ferramenta está vazia.</p>';return}
 box.innerHTML='<h3>🗑️ Lixeira desta ferramenta ('+items.length+')</h3>'+items.slice().reverse().map(function(t,i){
  const actualIndex=items.length-1-i;
  return '<div class="item" style="margin-top:8px"><b>'+esc(t.label||'Registro')+' removido</b><p>'+esc(describe(t.record,t.label==='exame'?'exame':'medicamento'))+'<br><small>Removido em: '+esc(new Date(t.removedAt).toLocaleString('pt-BR'))+'</small></p><button type="button" class="btn secondary small" data-dq-restore="'+actualIndex+'">↩️ Restaurar registro</button></div>';
 }).join('');
}
function restoreFromTrash(index){
 const trash=storage.get(TRASH)||[],idx=Number(index);
 if(!Number.isInteger(idx)||idx<0||idx>=trash.length)return;
 const item=trash[idx],list=storage.get(item.sourceKey)||[];
 list.splice(Math.max(0,Math.min(Number(item.sourceIndex)||0,list.length)),0,item.record);
 if(storage.set(item.sourceKey,list)===false){alert('Não foi possível restaurar o registro.');return}
 trash.splice(idx,1);
 if(storage.set(TRASH,trash)===false){alert('O registro foi restaurado, mas a lista da lixeira não pôde ser atualizada. Verifique antes de restaurar novamente.');}
 scan();
}
function ensureUI(attempt){
 if(byId('msaDataQualityCard'))return;
 const page=byId('backup');
 if(!page){
  if((attempt||0)<8)setTimeout(function(){ensureUI((attempt||0)+1)},500);
  return;
 }
 const card=document.createElement('div');
 card.className='card';card.id='msaDataQualityCard';card.style.marginTop='13px';
 card.innerHTML='<h2>🔎 Revisão de dados e possíveis duplicidades</h2>'+
  '<p class="muted">Confira registros incompletos ou semelhantes antes de utilizá-los em relatórios médicos. A análise não apaga nem altera nada automaticamente.</p>'+
  '<div id="msaDQProfile" class="alert safe" style="margin-top:10px">A verificação considera somente o perfil ativo.</div>'+
  '<div class="row" style="margin-top:10px"><button type="button" class="btn" id="msaDQScanBtn">🔍 Verificar agora</button><button type="button" class="btn secondary" id="msaDQTrashToggle">🗑️ Ver lixeira</button></div>'+
  '<div id="msaDQResults" aria-live="polite" style="margin-top:12px"><div class="empty">Clique em “Verificar agora” para procurar registros semelhantes e dados incompletos.</div></div>'+
  '<div id="msaDQTrash" style="display:none;margin-top:14px"></div>';
 const first=page.querySelector('.card');
 if(first&&first.nextSibling)first.parentNode.insertBefore(card,first.nextSibling);else page.appendChild(card);
 byId('msaDQScanBtn').addEventListener('click',scan);
 byId('msaDQTrashToggle').addEventListener('click',function(){
  const box=byId('msaDQTrash');if(!box)return;
  const opening=box.style.display==='none';box.style.display=opening?'block':'none';renderTrash();
 });
 byId('msaDQResults').addEventListener('click',function(ev){
  const move=ev.target.closest('[data-dq-trash]');
  if(move){moveToTrash(move.getAttribute('data-dq-key'),move.getAttribute('data-dq-trash'),move.getAttribute('data-dq-fp'));return}
  const fix=ev.target.closest('[data-dq-fix]');
  if(fix){fixRecord(fix.getAttribute('data-dq-key'),fix.getAttribute('data-dq-fix'),fix.getAttribute('data-dq-fp'),fix.getAttribute('data-dq-kind'));return}
 });
 byId('msaDQTrash').addEventListener('click',function(ev){
  const restore=ev.target.closest('[data-dq-restore]');if(restore)restoreFromTrash(restore.getAttribute('data-dq-restore'));
 });
}
window.MSADataQuality={confirmBeforeSave:confirmBeforeSave,scan:scan};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){ensureUI(0)});else ensureUI(0);
})();
