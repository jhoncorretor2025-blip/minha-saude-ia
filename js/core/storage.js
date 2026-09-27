/* Minha Saúde IA — armazenamento compartilhado V4.85 */
(function(){
'use strict';
const K=window.MSA_K||window.K||{};
const LEGACY_KEYS={msa_dores:'msa2_dores',msa_consultas:'msa2_consultas',msa_meds:'msa2_meds',msa_exames:'msa2_exames',msa_perfil:'msa2_perfil',msa_vitais:'msa2_vitais',msa_lembretes:'msa2_lembretes',msa_vacinas:'msa2_vacinas',msa_familia:'msa2_familia',msa_documentos:'msa2_documentos'};
function get(k){
 try{
  let raw=window.msaStorage.getItem(k);
  if(!raw){
   const legacy=Object.keys(LEGACY_KEYS).find(x=>LEGACY_KEYS[x]===k&&window.msaStorage.getItem(x));
   if(legacy){raw=window.msaStorage.getItem(legacy);try{window.msaStorage.setItem(k,raw)}catch(e){}}
  }
  if(!raw)return [];
  const parsed=JSON.parse(raw);
  if(Array.isArray(parsed))return parsed;
  if(k===K.p&&parsed&&typeof parsed==='object')return [parsed];
  return [];
 }catch(e){console.warn('[Minha Saúde IA] leitura protegida:',k,e);return []}
}
function set(k,v){
 const json=JSON.stringify(v);
 try{
  const old=window.msaStorage.getItem(k);
  if(old&&old!==json&&old.length<=300000&&!k.startsWith('msa2_backup_'))window.msaStorage.setItem('msa2_backup_'+k,old);
  window.msaStorage.setItem(k,json);
  return true;
 }catch(e){console.error('[Minha Saúde IA] falha ao salvar',k,e);return false}
}
function remove(k){try{window.msaStorage.removeItem(k);return true}catch(e){return false}}
window.MSAStorage={get,set,remove,has:k=>{try{return window.msaStorage.getItem(k)!==null}catch(e){return false}}};
})();