/* Minha Saúde IA — armazenamento compartilhado e perfis isolados V6.76 */
(function(){
'use strict';
const K=window.MSA_K||window.K||{};
const LEGACY_KEYS={msa_dores:'msa2_dores',msa_consultas:'msa2_consultas',msa_meds:'msa2_meds',msa_exames:'msa2_exames',msa_perfil:'msa2_perfil',msa_vitais:'msa2_vitais',msa_lembretes:'msa2_lembretes',msa_vacinas:'msa2_vacinas',msa_familia:'msa2_familia',msa_documentos:'msa2_documentos'};
const SELECTED='msa2_familiar_selecionado',FAMILIES='msa2_familiares',SPACE='msa2_perfil_espacos_v1';
const SCOPED=new Set([
'msa2_ciclo_menstrual','msa2_dores','msa2_consultas','msa2_meds','msa2_exames','msa2_perfil',
'msa2_vitais','msa2_lembretes','msa2_vacinas','msa2_familia','msa2_documentos','msa2_nutri',
'msa2_suplementos','msa2_reacoes_alimentares','msa2_hidratacao','msa2_sono','msa2_bemestar',
'msa2_gatilhos','msa2_medicamentos_rotina','msa2_medicamentos_tomados','msa2_anticoncepcional',
'msa2_medidas_corporais','msa2_medidas','msa2_humor','msa2_metas_pessoais','msa2_historico_alteracoes','msa2_preferencias'
]);
function parse(raw){try{return raw?JSON.parse(raw):null}catch(e){return null}}
function globalGet(k){
 try{
  let raw=window.msaStorage.getItem(k);
  if(!raw){const legacy=Object.keys(LEGACY_KEYS).find(x=>LEGACY_KEYS[x]===k&&window.msaStorage.getItem(x));if(legacy){raw=window.msaStorage.getItem(legacy);try{window.msaStorage.setItem(k,raw)}catch(e){}}}
  if(!raw)return [];
  const parsed=JSON.parse(raw);
  if(Array.isArray(parsed))return parsed;
  if(k===K.p&&parsed&&typeof parsed==='object')return [parsed];
  return [];
 }catch(e){console.warn('[Minha Saúde IA] leitura protegida:',k,e);return []}
}
function globalSet(k,v){
 const json=JSON.stringify(v);
 try{
  const old=window.msaStorage.getItem(k);
  if(old&&old!==json&&old.length<=300000&&!k.startsWith('msa2_backup_'))window.msaStorage.setItem('msa2_backup_'+k,old);
  window.msaStorage.setItem(k,json);
  const confirmado=window.msaStorage.getItem(k);
  if(confirmado!==json){if(old!==null&&old!==undefined)window.msaStorage.setItem(k,old);else window.msaStorage.removeItem(k);console.error('[Minha Saúde IA] gravação não confirmada',k);return false}
  return true;
 }catch(e){console.error('[Minha Saúde IA] falha ao salvar',k,e);return false}
}
function selectedId(){const raw=window.msaStorage.getItem(SELECTED);const v=parse(raw);return String(v||'')}
function scopedKey(k){const id=selectedId(),healthAlert=/^msa2_(?:alerta_|anticoncepcional_alerta_)/.test(k);return id&&(SCOPED.has(k)||healthAlert)?SPACE+'_'+encodeURIComponent(id)+'_'+k:k}
function seedFamilySpace(id,k){
 const families=globalGet(FAMILIES),p=families.find(x=>String(x&&x.id)===String(id));
 if(!p)return undefined;
 if(k===K.p||k==='msa2_perfil'){
  const profile={};
  ['id','nome','nasc','idade','sexo','peso','altura','sangue','foto','alerg','cond','emerg','tel','circ','info','supl'].forEach(x=>{if(p[x]!==undefined&&p[x]!==null)profile[x]=p[x]});
  if(p.nascimento&&!profile.nasc)profile.nasc=p.nascimento;
  if(p.pesoKg&&!profile.peso)profile.peso=p.pesoKg;
  if(p.alturaCm&&!profile.altura)profile.altura=p.alturaCm;
  return [profile];
 }
 if(k===K.m||k==='msa2_meds')return Array.isArray(p.medicamentos)?p.medicamentos:[];
 if(k===K.c||k==='msa2_consultas')return Array.isArray(p.consultas)?p.consultas:[];
 if(k==='msa2_ciclo_menstrual')return [];
 if(k==='msa2_dores')return [];
 if(k==='msa2_exames')return [];
 if(k==='msa2_vitais')return [];
 if(k==='msa2_lembretes')return [];
 if(k==='msa2_vacinas')return [];
 if(k==='msa2_familia')return [];
 if(k==='msa2_documentos')return [];
 if(k==='msa2_nutri')return [];
 if(k==='msa2_suplementos')return [];
 if(k==='msa2_reacoes_alimentares')return [];
 if(k==='msa2_hidratacao')return [];
 if(k==='msa2_sono')return [];
 if(k==='msa2_bemestar')return [];
 if(k==='msa2_gatilhos')return [];
 if(k==='msa2_medicamentos_rotina')return [];
 if(k==='msa2_medicamentos_tomados')return [];
 if(k==='msa2_anticoncepcional')return [];
 if(k==='msa2_medidas_corporais')return [];
 return undefined;
}
function get(k){
 const physical=scopedKey(k);
 if(physical!==k){
  const raw=window.msaStorage.getItem(physical);
  if(raw!==null)return k==='msa2_humor'?parse(raw):globalGet(physical);
  const id=selectedId(),seed=seedFamilySpace(id,k);
  if(seed!==undefined){globalSet(physical,seed);return seed}
  return [];
 }
 return globalGet(k);
}
function set(k,v){return globalSet(scopedKey(k),v)}
function remove(k){try{return window.msaStorage.removeItem(scopedKey(k))===undefined}catch(e){return false}}
function has(k){try{return window.msaStorage.getItem(scopedKey(k))!==null}catch(e){return false}}
function clear(k){return remove(k)}
function raw(k){try{return window.msaStorage.getItem(scopedKey(k))}catch(e){return null}}
function setJSON(k,v){return set(k,v)}
window.MSAStorage={get,set,remove,has,clear,raw,setJSON,getGlobal:globalGet,setGlobal:globalSet,rawGlobal:k=>{try{return window.msaStorage.getItem(k)}catch(e){return null}},selectedProfileId:selectedId};
})();