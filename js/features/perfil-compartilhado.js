/* Perfil central compartilhado — Minha Saúde IA V6.13 / Canivete v8.35
 * Mesma origem GitHub Pages: sincroniza apenas perfil básico e dados familiares resumidos.
 * Não compartilha prontuário, medicamentos, consultas, exames ou dados financeiros.
 */
(function(){
'use strict';
const KEY='delta_perfil_central_v1';
const SOURCE='minha-saude-ia';
function parse(raw){try{return raw?JSON.parse(raw):null}catch(e){return null}}
function read(){try{return parse(localStorage.getItem(KEY))}catch(e){return null}}
function write(payload){
 try{const previous=read()||{};const next=Object.assign({},previous,payload,{schemaVersion:1,source:SOURCE,updatedAt:Date.now()});localStorage.setItem(KEY,JSON.stringify(next));return next}
 catch(e){console.warn('[Perfil compartilhado] não foi possível salvar:',e);return null}
}
function readProfile(){
 const K=window.MSA_K||window.K||{},s=window.MSAStorage;
 const raw=s&&K.p?s.get(K.p):[];const p=Array.isArray(raw)?(raw[0]||{}):(raw||{});
 return {nome:p.nome||'',idade:p.idade||'',nascimento:p.nasc||'',pesoKg:p.peso||'',alturaCm:p.altura||'',sexo:p.sexo||''};
}
function publishProfile(profile){
 const current=read()||{},p=profile||readProfile();
 return write({profile:Object.assign({},current.profile||{},p)});
}
function familySummary(){
 const K=window.MSA_K||window.K||{},s=window.MSAStorage;
 try{const list=s&&s.get(K.familiares||'msa2_familiares');return(Array.isArray(list)?list:[]).map(x=>({id:String(x.id||''),nome:String(x.nome||''),parentesco:String(x.parentesco||''),idade:String(x.idade||''),nascimento:String(x.nasc||''),sexo:String(x.sexo||'')}))}
 catch(e){return[]}
}
function publishFamilies(list){
 const current=read()||{},relatives=(Array.isArray(list)?list:familySummary()).map(x=>({id:String(x.id||''),nome:String(x.nome||''),parentesco:String(x.parentesco||''),idade:String(x.idade||''),nascimento:String(x.nasc||x.nascimento||''),sexo:String(x.sexo||'')}));
 return write({familiares:relatives});
}
function applyShared(data){
 if(!data||!data.profile)return;
 const p=data.profile,K=window.MSA_K||window.K||{},s=window.MSAStorage;if(!s||!K.p)return;
 try{
  const oldRaw=s.get(K.p),old=Array.isArray(oldRaw)?(oldRaw[0]||{}):(oldRaw||{}),merged=Object.assign({},old);
  if(p.nome)merged.nome=p.nome;if(p.idade!=='')merged.idade=String(p.idade);if(p.nascimento)merged.nasc=p.nascimento;
  if(p.pesoKg!=='')merged.peso=String(p.pesoKg);if(p.alturaCm!=='')merged.altura=String(p.alturaCm);if(p.sexo)merged.sexo=p.sexo;
  s.set(K.p,[merged]);
  const mapping={pNome:merged.nome,pIdade:merged.idade,pNasc:merged.nasc,pPeso:merged.peso,pAltura:merged.altura,pSexo:merged.sexo};
  Object.keys(mapping).forEach(id=>{const el=document.getElementById(id);if(el&&mapping[id]!==undefined&&mapping[id]!==null)el.value=mapping[id]});
  if(Array.isArray(data.familiares)){
   const key=K.familiares||'msa2_familiares',existing=s.get(key),list=Array.isArray(existing)?existing:[],ids=new Set(list.map(x=>String(x.id||'')));
   const incoming=data.familiares.filter(x=>x.id&&!ids.has(String(x.id)));
   if(incoming.length)s.set(key,list.concat(incoming.map(x=>({id:x.id,nome:x.nome,parentesco:x.parentesco,idade:x.idade,nasc:x.nascimento,sexo:x.sexo,medicamentos:[],consultas:[],crises:[]}))));
  }
  try{if(typeof window.render==='function')window.render()}catch(e){}
  try{if(typeof window.renderCarteirinha==='function')window.renderCarteirinha()}catch(e){}
  try{if(typeof window.renderNovosModulos==='function')window.renderNovosModulos()}catch(e){}
 }catch(e){console.warn('[Perfil compartilhado] aplicação adiada:',e)}
}
window.MSAProfileBridge={key:KEY,read,publishProfile,publishFamilies,applyShared,readProfile};
function init(){
 const data=read();
 if(data&&data.source!=='minha-saude-ia')applyShared(data);
 else if(!data){const p=readProfile();if(Object.values(p).some(v=>String(v||'').trim()))publishProfile(p);publishFamilies(familySummary())}
}
window.addEventListener('storage',e=>{if(e.key===KEY){const data=parse(e.newValue);if(data&&data.source!=='minha-saude-ia')applyShared(data)}});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
