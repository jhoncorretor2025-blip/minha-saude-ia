/* Minha Saúde IA V7.04 — painel, evolução, rotina e backup local. */
(function(){
'use strict';
const $=(s,r=document)=>r.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const store=()=>window.MSAStorage;
const get=k=>{try{const v=store()?.get(k);return v==null?[]:v}catch(e){return []}};
const arr=v=>Array.isArray(v)?v:(v&&typeof v==='object'?[v]:[]);
const fmt=v=>v===undefined||v===null||v===''?'—':String(v);
function readProfile(){return arr(get('msa2_perfil'))[0]||{}}
function readVitals(){return arr(get('msa2_vitais'))}
function readMeasures(){return arr(get('msa2_medidas_corporais')).concat(arr(get('msa2_medidas')))}
function readMeds(){return arr(get('msa2_meds')).concat(arr(get('msa2_medicamentos_rotina')))}
function readTaken(){return arr(get('msa2_medicamentos_tomados'))}
function readConsults(){return arr(get('msa2_consultas'))}
function latestValue(items,keys){for(let i=items.length-1;i>=0;i--){for(const k of keys){const n=items[i]?.[k];if(n!==undefined&&n!==null&&n!=='')return n}}return null}
function latestMeasure(keys){const items=readMeasures();return latestValue(items,keys)??latestValue(readVitals(),keys)}
function metric(title,value,unit,icon){return '<div class="msa87-metric"><span>'+icon+'</span><small>'+title+'</small><strong>'+esc(fmt(value))+(value!==null&&value!==undefined&&value!==''?'<em>'+unit+'</em>':'')+'</strong></div>'}
function draw(){
 const profile=readProfile(),meds=readMeds(),taken=readTaken(),consults=readConsults(),vitals=readVitals();
 const bp=latestMeasure(['pressao','pressaoArterial','pa','bloodPressure']);
 const weight=latestMeasure(['peso','weight']);
 const glucose=latestMeasure(['glic','glicemia','glicose','glucose']);
 const target=$('#msa87Panel');if(!target)return;
 target.innerHTML='<div class="msa87-head"><div><span class="msa87-kicker">SEU RESUMO</span><h2>Olá'+(profile.nome?' , '+esc(profile.nome.split(' ')[0]):'')+' 👋</h2><p>Um panorama dos seus registros, sem substituir avaliação médica.</p></div><button type="button" id="msa87Refresh" class="msa87-ghost">↻ Atualizar</button></div>'+
 '<div class="msa87-grid">'+metric('Peso',weight,'kg','⚖️')+metric('Pressão',bp,'','❤️')+metric('Glicemia',glucose,'','🧪')+metric('Medicamentos',meds.length,' cadastrados','💊')+'</div>'+
 '<div class="msa87-columns"><section class="msa87-card"><h3>📈 Evolução registrada</h3><p class="msa87-muted">Os gráficos aparecem conforme você cadastra medições.</p><div class="msa87-chart" id="msa87Chart"></div><p class="msa87-muted">Medições encontradas: '+(vitals.length+readMeasures().length)+'</p></section>'+
 '<section class="msa87-card"><h3>💊 Rotina de medicamentos</h3><p><strong>'+meds.length+'</strong> medicamento(s)/rotina(s) cadastrados</p><p><strong>'+taken.length+'</strong> registro(s) de dose tomada</p><p><strong>'+consults.length+'</strong> consulta(s) registrada(s)</p><button type="button" class="msa87-action" data-go="medicamentos">Abrir medicamentos</button> <button type="button" class="msa87-action secondary" data-go="consultas">Consultas</button></section></div>'+
 '<section class="msa87-card msa87-backup"><div><h3>🛡️ Backup e segurança</h3><p>Exporte os dados deste navegador para guardar uma cópia. A restauração valida o arquivo e pede confirmação antes de alterar dados.</p></div><div class="msa87-actions"><button type="button" id="msa87Export" class="msa87-action">⬇ Exportar backup</button><button type="button" id="msa87ImportBtn" class="msa87-action secondary">↥ Restaurar backup</button><input type="file" id="msa87ImportFile" accept="application/json,.json" hidden></div><p id="msa87Status" role="status" aria-live="polite"></p></section>';
 const vals=[{label:'Peso',value:weight},{label:'Pressão',value:bp},{label:'Glicemia',value:glucose}].filter(x=>x.value!==null&&x.value!==undefined&&x.value!=='');
 $('#msa87Chart').innerHTML=vals.length?vals.map(x=>'<div class="msa87-bar-row"><span>'+x.label+'</span><div class="msa87-bar-track"><div class="msa87-bar" style="width:100%"></div></div><strong>'+esc(x.value)+'</strong></div>').join(''):'<div class="msa87-empty">Ainda não há medições suficientes para mostrar a evolução. Registre peso, pressão ou glicemia para começar.</div>';
 $('#msa87Refresh').onclick=draw;
 $('#msa87Export').onclick=exportBackup;
 $('#msa87ImportBtn').onclick=()=>$('#msa87ImportFile').click();
 $('#msa87ImportFile').onchange=importBackup;
 target.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>navigate(b.dataset.go));
}
function navigate(dest){
 const map={medicamentos:['medicamentos','remedios','remedios-hoje'],consultas:['consultas']};
 const text=(map[dest]||[dest]).join(' ');
 const els=[...document.querySelectorAll('button,a,[role="button"]')];
 const el=els.find(x=>{const t=(x.innerText||x.getAttribute('aria-label')||'').trim().toLowerCase();return t && (dest==='medicamentos'?(/medicamento|remédio|remedios/.test(t)):t.includes('consulta'))});
 if(el){el.click();return}
 const urls=new URL(location.href);urls.search='?pagina='+(dest==='medicamentos'?'medicamentos':'consultas');location.href=urls.toString();
}
function status(s){const e=$('#msa87Status');if(e)e.textContent=s}
function exportBackup(){
 try{
  const keys=['msa2_ciclo_menstrual','msa2_dores','msa2_consultas','msa2_meds','msa2_exames','msa2_perfil','msa2_vitais','msa2_lembretes','msa2_vacinas','msa2_familia','msa2_documentos','msa2_nutri','msa2_suplementos','msa2_reacoes_alimentares','msa2_hidratacao','msa2_sono','msa2_bemestar','msa2_gatilhos','msa2_medicamentos_rotina','msa2_medicamentos_tomados','msa2_anticoncepcional','msa2_medidas_corporais','msa2_medidas','msa2_humor','msa2_metas_pessoais','msa2_historico_alteracoes','msa2_preferencias','msa2_historico_medico','msa2_alergias','msa2_condicoes','msa2_emergencia','msa2_atividade_fisica','msa2_alimentacao','msa2_peso','msa2_cintura','msa2_pressao','msa2_glicemia','msa2_documentos_medicos','msa2_alertas_saude','msa2_familiares','msa2_familiar_selecionado'];
  const data={app:'Minha Saúde IA',format:1,version:window.MSA_VERSION||'V7.04',createdAt:new Date().toISOString(),data:{}};
  keys.forEach(k=>{const raw=(k==='msa2_familiares'||k==='msa2_familiar_selecionado')?store()?.rawGlobal?.(k):store()?.raw?.(k);if(raw!==null&&raw!==undefined){try{data.data[k]=JSON.parse(raw)}catch(e){data.data[k]=raw}}});
  const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download='minha-saude-ia-backup-'+new Date().toISOString().slice(0,10)+'.json';document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);status('Backup exportado. Guarde o arquivo em local seguro; ele contém dados pessoais de saúde.');
 }catch(e){status('Não foi possível exportar. Verifique o espaço disponível no aparelho.');console.error(e)}
}
function importBackup(ev){
 const file=ev.target.files?.[0];if(!file)return;
 if(file.size>15*1024*1024){status('Arquivo muito grande (limite de 15 MB).');ev.target.value='';return}
 const reader=new FileReader();
 reader.onload=()=>{
  try{
   const obj=JSON.parse(String(reader.result||''));
   if(obj?.app!=='Minha Saúde IA'||obj?.format!==1||!obj.data||typeof obj.data!=='object'||Array.isArray(obj.data))throw new Error('Formato inválido');
   const allowed=new Set(['msa2_ciclo_menstrual','msa2_dores','msa2_consultas','msa2_meds','msa2_exames','msa2_perfil','msa2_vitais','msa2_lembretes','msa2_vacinas','msa2_familia','msa2_documentos','msa2_nutri','msa2_suplementos','msa2_reacoes_alimentares','msa2_hidratacao','msa2_sono','msa2_bemestar','msa2_gatilhos','msa2_medicamentos_rotina','msa2_medicamentos_tomados','msa2_anticoncepcional','msa2_medidas_corporais','msa2_medidas','msa2_humor','msa2_metas_pessoais','msa2_historico_alteracoes','msa2_historico_medico','msa2_alergias','msa2_condicoes','msa2_emergencia','msa2_atividade_fisica','msa2_alimentacao','msa2_peso','msa2_cintura','msa2_pressao','msa2_glicemia','msa2_documentos_medicos','msa2_alertas_saude','msa2_familiares','msa2_familiar_selecionado']);
   const entries=Object.entries(obj.data);if(!entries.length||entries.some(([k,v])=>!allowed.has(k)||JSON.stringify(v).length>5000000))throw new Error('Dados não reconhecidos ou excessivos');
   if(!confirm('O arquivo contém '+entries.length+' grupo(s) de dados. A restauração substituirá esses grupos neste navegador. Faça um backup atual antes de continuar. Deseja restaurar?'))return;
   const backup={};entries.forEach(([k])=>{const raw=(k==='msa2_familiares'||k==='msa2_familiar_selecionado')?store()?.rawGlobal?.(k):store()?.raw?.(k);if(raw!==null&&raw!==undefined)backup[k]=raw});
   try{entries.forEach(([k,v])=>{const global=k==='msa2_familiares'||k==='msa2_familiar_selecionado';const ok=global?store()?.setGlobal?.(k,v):store()?.set?.(k,v);if(!ok)throw new Error('Falha ao salvar '+k)});}
   catch(e){Object.entries(backup).forEach(([k,v])=>{try{window.msaStorage.setItem(k,v)}catch(_){}});throw e}
   status('Backup restaurado. Recarregando para atualizar os dados…');setTimeout(()=>location.reload(),500);
  }catch(e){status('Não foi possível restaurar: o arquivo não parece ser um backup válido deste app.');console.warn(e)}
  finally{ev.target.value=''}
 };
 reader.onerror=()=>status('Falha ao ler o arquivo de backup.');reader.readAsText(file);
}
function init(){
 if($('#msa87Panel'))return;
 const header=$('header');if(!header)return;
 const style=document.createElement('style');style.textContent=`
 #msa87Panel{display:none}#msa87Panel.active{display:block}#msa87Panel section{display:block!important}#msa87Panel{max-width:1100px;margin:18px auto;padding:0 14px;color:var(--text,#172033);font:inherit}
 #msa87Panel *{box-sizing:border-box}#msa87Panel .msa87-head{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:14px}
 #msa87Panel h2{font-size:clamp(21px,4vw,29px);margin:3px 0 5px}#msa87Panel h3{font-size:16px;margin:0 0 10px}
 #msa87Panel p{margin:6px 0;line-height:1.5}#msa87Panel .msa87-kicker{font-size:11px;font-weight:800;letter-spacing:1.2px;color:#2563eb}
 #msa87Panel .msa87-muted{font-size:12px;color:#64748b}#msa87Panel .msa87-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin:12px 0}
 #msa87Panel .msa87-metric,#msa87Panel .msa87-card{background:var(--card,#fff);border:1px solid var(--border,#e2e8f0);border-radius:16px;padding:14px;box-shadow:0 3px 12px #0f172a0a}
 #msa87Panel .msa87-metric{display:grid;gap:5px;min-width:0}#msa87Panel .msa87-metric>span{font-size:20px}
 #msa87Panel .msa87-metric small{font-size:12px;color:#64748b}#msa87Panel .msa87-metric strong{font-size:19px;overflow-wrap:anywhere}
 #msa87Panel .msa87-metric em{font-size:11px;font-style:normal;font-weight:500;margin-left:3px}
 #msa87Panel .msa87-columns{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px}
 #msa87Panel .msa87-bar-row{display:grid;grid-template-columns:65px 1fr auto;align-items:center;gap:8px;margin:12px 0;font-size:12px}
 #msa87Panel .msa87-bar-track{height:9px;border-radius:9px;background:#e2e8f0;overflow:hidden}#msa87Panel .msa87-bar{height:100%;border-radius:9px;background:#3b82f6}
 #msa87Panel .msa87-empty{padding:15px;background:#f8fafc;border-radius:10px;color:#64748b;font-size:13px}
 #msa87Panel .msa87-backup{display:flex;justify-content:space-between;align-items:center;gap:14px;flex-wrap:wrap}
 #msa87Panel .msa87-actions{display:flex;gap:8px;flex-wrap:wrap}#msa87Panel button{border:0;border-radius:10px;padding:10px 12px;font:inherit;font-size:13px;font-weight:700;cursor:pointer}
 #msa87Panel .msa87-action{background:#2563eb;color:white}#msa87Panel .msa87-action.secondary,#msa87Panel .msa87-ghost{background:#eff6ff;color:#1d4ed8}
 #msa87Panel #msa87Status{flex-basis:100%;font-size:12px;color:#166534}
 @media(max-width:680px){#msa87Panel .msa87-grid{grid-template-columns:repeat(2,minmax(0,1fr))}#msa87Panel .msa87-columns{grid-template-columns:1fr}#msa87Panel .msa87-head{align-items:flex-start}#msa87Panel .msa87-backup{align-items:flex-start}#msa87Panel .msa87-actions{width:100%}#msa87Panel .msa87-actions button{flex:1}}
 body.msa-dark #msa87Panel .msa87-empty{background:#1f2937;color:#cbd5e1}body.msa-dark #msa87Panel .msa87-bar-track{background:#334155}
 `;document.head.appendChild(style);
 const panel=document.createElement('section');panel.id='msa87Panel';panel.setAttribute('aria-label','Painel inteligente de saúde');/* V7.04: o painel vira uma página do app (antes ficava escondido para sempre: o app esconde toda seção que não está aberta) */
 const main=$('#main-content')||$('main');if(main)main.appendChild(panel);else header.insertAdjacentElement('afterend',panel);draw();
 window.addEventListener('msa:perfil-selecionado',draw);window.addEventListener('msa:familiares-atualizados',draw);
 window.addEventListener('storage',draw);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
