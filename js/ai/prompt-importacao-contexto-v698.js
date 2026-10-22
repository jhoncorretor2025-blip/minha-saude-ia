/* Minha Saúde IA V6.98 — geração dinâmica do prompt de importação com contexto do perfil local. */
(function(){
'use strict';
const $=id=>document.getElementById(id);
let basePrompt='';
let lastContext=null;
function read(key){
 try{const value=window.MSAStorage&&typeof window.MSAStorage.get==='function'?window.MSAStorage.get(key):[];return Array.isArray(value)?value:(value&&typeof value==='object'?[value]:[])}catch(_){return []}
}
function getProfile(){return read('msa2_perfil')[0]||{}}
function isEmpty(v){return v==null||String(v).trim()===''||/^(não informado|nao informado|não informada|nao informada|nenhum|nenhuma|n\/a|-)$/i.test(String(v).trim())}
function norm(v){return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim()}
function splitConditionText(value){return String(value||'').split(/[\n;|]+|,\s+(?=[A-ZÁÉÍÓÚÂÊÔÃÕÇ])/).map(x=>x.trim()).filter(x=>!isEmpty(x))}
function nameOf(record){
 if(typeof record==='string')return record;
 if(!record||typeof record!=='object')return '';
 return record.nome||record.nomeCondicao||record.condicao||record.doenca||record.diagnostico||record.titulo||record.problema||record.name||'';
}
function collectConditions(){
 const p=getProfile(),found=[];
 function add(value,includeDetails){
  if(value==null||value==='')return;
  if(Array.isArray(value)){value.forEach(x=>add(x,includeDetails));return}
  if(typeof value==='string'){splitConditionText(value).forEach(x=>found.push(x));return}
  if(typeof value==='object'){
   const name=nameOf(value);
   if(name&&!isEmpty(name)){const detail=includeDetails?(value.observacao||value.descricao||value.status||value.detalhe||''):'';found.push(String(name)+(detail&&!norm(detail).includes(norm(name))?' — '+detail:''))}
   ['condicoes','doencas','diagnosticos','historicoMedico','historico_medico'].forEach(k=>{if(value[k])add(value[k],includeDetails)});
  }
 }
 add(p.cond,false);add(p.condicoes,true);add(p.doencas,true);add(p.diagnosticos,true);
 add(read('msa2_condicoes'),true);add(read('msa2_historico_medico'),true);
 const unique=[],seen=new Set();
 found.forEach(text=>{const s=String(text||'').trim(),key=norm(s);if(!key||seen.has(key))return;seen.add(key);unique.push(s)});
 return unique;
}
function collectContext(){
 const p=getProfile();let summary='';
 try{if(typeof window.healthText==='function')summary=window.healthText();else if(typeof healthText==='function')summary=healthText()}catch(e){console.warn('[Prompt IA] Não foi possível montar o resumo completo:',e)}
 return {name:p.nome||'perfil selecionado',conditions:collectConditions(),important:String(p.info||p.informacoesImportantes||p.informacoes||p.historicoClinico||'').trim(),summary:String(summary||'').trim()};
}
function makeContextBlock(ctx){
 return [
 '===== CONTEXTO LOCAL DO MINHA SAÚDE IA — PERFIL ATUAL =====',
 'Perfil ativo: '+ctx.name,'',
 'CONDIÇÕES DE SAÚDE CADASTRADAS ('+ctx.conditions.length+'):',
 ...(ctx.conditions.length?ctx.conditions.map(x=>'- '+x):['Nenhuma condição encontrada nos campos estruturados de doenças/condições.']),
 '',
 'INFORMAÇÕES IMPORTANTES DO PERFIL (texto original):',
 ctx.important||'Não informado no campo de informações importantes.',
 '',
 'RESUMO DOS DADOS JÁ REGISTRADOS NO APLICATIVO:',
 ctx.summary||'O resumo local não estava disponível no momento em que o prompt foi gerado.',
 '',
 'INSTRUÇÃO DE PRIORIDADE: use este contexto local como fonte prioritária sobre condições e informações que já estejam cadastradas. Preserve o nome de cada condição e todos os detalhes fornecidos; não omita condições que aparecem na lista ou nas informações importantes. Não transforme sintomas em diagnósticos, não invente dados e não misture dados de familiares. Para campos realmente ausentes, escreva "Não informado".',
 '===== FIM DO CONTEXTO LOCAL ====='
 ].join('\n');
}
function generate(){
 const field=$('promptIA');if(!field)return '';
 if(!basePrompt)basePrompt=field.value||'';
 const ctx=collectContext(),block=makeContextBlock(ctx);let prompt=basePrompt;
 const firstDouble=prompt.indexOf('\n\n');
 if(firstDouble>=0)prompt=prompt.slice(0,firstDouble+2)+block+'\n\n'+prompt.slice(firstDouble+2);else prompt=block+'\n\n'+prompt;
 prompt=prompt.replace(
  '- **DOENÇAS E CONDIÇÕES DE SAÚDE:** use somente o que já estiver disponível no seu contexto/memória. Se não houver informação suficiente, registre exatamente "Não informado" em [DOENCAS].',
  '- **DOENÇAS E CONDIÇÕES DE SAÚDE:** use primeiro a lista "CONDIÇÕES DE SAÚDE CADASTRADAS" e as "INFORMAÇÕES IMPORTANTES DO PERFIL" do contexto local acima, somadas às informações confiáveis disponíveis no seu contexto/memória. Preserve todos os nomes e detalhes das condições; não omita doenças só porque a lista é longa. Se um detalhe não estiver disponível, mantenha o nome da condição e marque somente o detalhe ausente como "Não informado".'
 );
 prompt=prompt.replace(
  '- Para doenças/condições, verifique primeiro o contexto/memória disponível. Se não houver informação, use "Não informado". Nunca faça pergunta para completar a ficha.',
  '- Para doenças/condições, confira primeiro o contexto local do aplicativo acima e depois o contexto/memória disponível. Inclua todas as condições de saúde encontradas, sem omitir nenhuma e sem inventar novas. Se não houver nenhuma informação sobre um campo, use "Não informado". Nunca faça pergunta para completar a ficha.'
 );
 field.value=prompt;const guide=$('iaGuidePrompt');if(guide)guide.value=prompt;lastContext=ctx;updateStatus(ctx);return prompt;
}
function ensureStatus(){
 let s=$('msaPromptContextStatus');if(s)return s;
 s=document.createElement('div');s.id='msaPromptContextStatus';s.setAttribute('role','status');s.setAttribute('aria-live','polite');
 s.style.cssText='margin-top:8px;padding:10px 12px;border:1px solid #c7e9d7;background:#f0fdf4;color:#166534;border-radius:12px;font-size:12px;line-height:1.5;font-weight:750';
 const cta=document.querySelector('.ai-cta');
 if(cta&&cta.parentNode)cta.insertAdjacentElement('afterend',s);else if($('promptIA'))$('promptIA').insertAdjacentElement('beforebegin',s);
 return s;
}
function updateStatus(ctx,message){
 const s=ensureStatus();if(!s)return;
 if(message){s.textContent=message;return}
 s.textContent='✅ Prompt atualizado com os dados do perfil "'+ctx.name+'", '+ctx.conditions.length+' condição(ões) identificada(s) e o resumo dos registros locais. Revise o texto antes de enviar; nada é compartilhado automaticamente.';
}
function copyFallback(){const field=$('promptIA')||$('iaGuidePrompt');if(!field)return false;try{field.focus();field.select();return document.execCommand('copy')}catch(_){return false}}
function copyPrompt(){
 const prompt=generate();if(!prompt)return;
 const status=$('copiado');
 const done=()=>{if(status)status.textContent='✅ Prompt gerado e copiado! Abra o ChatGPT ou Gemini e cole a mensagem.';updateStatus(lastContext,'✅ Prompt gerado com '+lastContext.conditions.length+' condição(ões) e copiado. Abra a IA e cole o texto. Nada foi enviado automaticamente.')};
 if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(prompt).then(done).catch(()=>{if(copyFallback())done();else{if(status)status.textContent='⚠️ Prompt gerado, mas não copiou automaticamente. Selecione o texto e copie manualmente.';updateStatus(lastContext,'⚠️ Prompt gerado. A cópia automática falhou; selecione o texto e copie manualmente.')}});
 else if(copyFallback())done();else if(status)status.textContent='⚠️ Prompt gerado. Selecione o texto e copie manualmente.';
}
function openAI(provider){
 const prompt=generate();if(!prompt)return;
 const win=window.open(provider==='gemini'?'https://gemini.google.com/app':'https://chatgpt.com/','_blank','noopener');
 const status=$('iaGuideStatus');
 const done=()=>{updateStatus(lastContext,'✅ Prompt copiado. Na aba da IA, clique na caixa de mensagem e cole o texto.');if(status)status.textContent='✅ Prompt gerado e copiado. Na aba da IA, clique na caixa de mensagem e cole o texto.'};
 if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(prompt).then(done).catch(()=>{if(copyFallback())done();else if(status)status.textContent='Prompt gerado. Selecione e copie manualmente antes de enviar.'});
 else if(copyFallback())done();
 if(!win){const msg='O navegador bloqueou a nova aba. Permita pop-ups e toque novamente.';if(status)status.textContent=msg;if($('copiado'))$('copiado').textContent='⚠️ '+msg}
 const modal=$('iaGuide');if(modal)modal.style.display='none';
}
function buildButton(){
 const cta=document.querySelector('.ai-cta');if(!cta||$('msaGenerateImportPrompt'))return;
 const button=document.createElement('button');button.id='msaGenerateImportPrompt';button.type='button';button.className='btn secondary';button.textContent='🔄 Gerar prompt com meus dados';button.title='Atualiza o prompt com doenças, informações importantes e registros do perfil ativo.';
 button.addEventListener('click',function(){generate();const field=$('promptIA');if(field)field.scrollIntoView({behavior:'smooth',block:'center'});updateStatus(lastContext,'✅ Prompt atualizado com '+lastContext.conditions.length+' condição(ões). Revise o texto e toque em "Copiar Prompt Pronto (V3)" para copiar.')});
 cta.appendChild(button);
}
function applyDesktopDrawerStyle(){
 if($('msaV698DesktopDrawerFix'))return;
 const style=document.createElement('style');style.id='msaV698DesktopDrawerFix';
 style.textContent=[
 '@media(min-width:761px){',
 '#msaMobileBackdrop[aria-hidden="false"]{display:block!important;position:fixed!important;inset:0!important;background:rgba(15,23,42,.48)!important;z-index:12001!important;backdrop-filter:blur(2px)}',
 '#msaMobileDrawer[aria-hidden="false"]{display:flex!important;position:fixed!important;left:50%!important;right:auto!important;top:50%!important;bottom:auto!important;transform:translate(-50%,-50%)!important;width:min(900px,94vw)!important;max-height:88vh!important;background:#fff!important;color:#172033!important;border:1px solid #e2e8f0;border-radius:24px!important;box-shadow:0 22px 70px rgba(15,23,42,.28)!important;overflow:hidden!important;z-index:12002!important}',
 '#msaMobileDrawer .msa-mobile-drawer-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 18px 13px;border-bottom:1px solid #e7ebf2;flex:0 0 auto}',
 '#msaMobileDrawer .msa-mobile-drawer-head h2{font-size:20px;line-height:1.3;margin:0;color:#172033}',
 '#msaMobileDrawer .msa-mobile-drawer-head .muted{font-size:12px;color:#64748b}',
 '#msaMobileDrawer .msa-mobile-drawer-close{width:42px;height:42px;border:0;border-radius:12px;background:#f1f5f9;font-size:18px;font-weight:900;cursor:pointer}',
 '#msaMobileDrawer .msa-mobile-drawer-body{overflow:auto;padding:13px 16px 18px;display:block}',
 '#msaMobileDrawer .msa-menu-search{width:100%;box-sizing:border-box;margin:0 0 12px;padding:12px 14px;border:1px solid #dbe3ef;border-radius:12px;background:#fff;font:inherit;font-size:14px!important}',
 '#msaMobileDrawer .msa-mobile-quick{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:8px;margin-bottom:14px}',
 '#msaMobileDrawer .msa-mobile-quick button{min-width:0;min-height:68px;border:1px solid #dbe5ff;background:#f5f8ff;border-radius:13px;padding:8px 5px;font:inherit;font-size:12px;font-weight:850;color:#1e40af;cursor:pointer}',
 '#msaMobileDrawer .msa-mobile-quick span{display:block;font-size:10px;margin-top:4px;color:#475569}',
 '#msaMobileDrawer .msa-mobile-section{margin:0 0 13px}',
 '#msaMobileDrawer .msa-mobile-section-title{margin:8px 2px 6px;color:#64748b;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:.06em}',
 '#msaMobileDrawer .msa-mobile-links{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px}',
 '#msaMobileDrawer .msa-mobile-links button{min-width:0;min-height:42px;border:1px solid #e3e8f0;background:#f8fafc;color:#172033;border-radius:11px;padding:9px 10px;text-align:left;font:inherit;font-size:12px;font-weight:800;cursor:pointer;white-space:normal}',
 '#msaMobileDrawer .msa-mobile-links button:hover{background:#eef4ff;border-color:#bfdbfe;color:#1d4ed8}',
 '#msaMobileDrawer .msa-mobile-links button.danger{background:#fff1f2;color:#b91c1c;border-color:#fecdd3}',
 'body.msa-dark #msaMobileDrawer[aria-hidden="false"]{background:#111827!important;color:#e5e7eb!important;border-color:#334155!important}',
 'body.msa-dark #msaMobileDrawer .msa-mobile-drawer-head{border-color:#334155}',
 'body.msa-dark #msaMobileDrawer .msa-mobile-drawer-head h2{color:#f8fafc}',
 'body.msa-dark #msaMobileDrawer .msa-mobile-quick button,body.msa-dark #msaMobileDrawer .msa-mobile-links button{background:#172033;color:#e5e7eb;border-color:#334155}',
 'body.msa-dark #msaMobileDrawer .msa-menu-search{background:#0f172a;color:#f8fafc;border-color:#334155}',
 '}',
 '@media(min-width:761px) and (max-width:1000px){#msaMobileDrawer .msa-mobile-quick{grid-template-columns:repeat(3,minmax(0,1fr))}#msaMobileDrawer .msa-mobile-links{grid-template-columns:repeat(2,minmax(0,1fr))}}'
 ].join('\n');document.head.appendChild(style);
}
function init(){
 const field=$('promptIA');if(field&&!basePrompt)basePrompt=field.value||'';
 applyDesktopDrawerStyle();buildButton();if(field)generate();
 window.copiarPrompt=copyPrompt;window.copiarPromptIA=copyPrompt;window.copiarEAvancarIA=copyPrompt;
 window.abrirIAGuiaIA=openAI;window.abrirChatGPT=function(){return openAI('chatgpt')};window.abrirGemini=function(){return openAI('gemini')};
 window.abrirPaginaIA=function(){const prompt=generate();const o=$('onboarding');if(o)o.style.display='none';if(typeof window.go==='function')window.go('importar');copyPrompt();setTimeout(()=>$('promptIA')?.scrollIntoView({behavior:'smooth',block:'center'}),100);return prompt};
 window.copiarPromptAntesDeAbrir=copyPrompt;
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();