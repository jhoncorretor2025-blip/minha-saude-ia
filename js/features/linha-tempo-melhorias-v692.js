/* Minha Saúde IA V6.92 — busca, revisão rápida, edição inline e exportação da Linha do Tempo. */
(function(){
'use strict';
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const KEY={sintomas:'msa2_dores',consultas:'msa2_consultas',medicamentos:'msa2_meds',exames:'msa2_exames',sinais:'msa2_vitais',vacinas:'msa2_vacinas',lembretes:'msa2_lembretes',nutricao:'msa2_nutri',suplementos:'msa2_suplementos',reacoes:'msa2_reacoes_alimentares',agua:'msa2_hidratacao',sono:'msa2_sono',bemestar:'msa2_bemestar',gatilhos:'msa2_gatilhos',familia:'msa2_familia',documentos:'msa2_documentos',medidas:'msa2_medidas_corporais',ciclo:'msa2_ciclo_menstrual',anticoncepcional:'msa2_anticoncepcional',doses:'msa2_medicamentos_tomados'};
const DETAIL={sintomas:['local'],consultas:['esp','med','mot'],medicamentos:['nome'],exames:['nome'],sinais:['obs','pressao','peso'],vacinas:['nome'],lembretes:['nome'],nutricao:['texto'],suplementos:['nome'],reacoes:['reacao','nome'],agua:['qtd'],sono:['horas','habitual'],bemestar:['estresse','ansiedade'],gatilhos:['gatilho','sintoma'],familia:['parente','cond','info'],documentos:['nome'],medidas:['peso','abdomen','cintura'],ciclo:['observacoes'],anticoncepcional:['nome','metodo'],doses:['observacao','obs']};
const DATE={ciclo:'inicio'};
const COMMON=['psoríase','artrite psoriásica','dor','mãos','pés','consulta','dermatologia','reumatologia','medicamento','adalimumabe','exame','ressonância','ultrassonografia','pressão arterial','glicemia','data não informada','revisar'];
let nativeFilter=null,lastFilter='todos',reviewOnly=false,query='';
function get(k){try{const v=window.MSAStorage?.get(k);return Array.isArray(v)?v:(v&&typeof v==='object'?[v]:[])}catch(_){return []}}
function set(k,v){try{return window.MSAStorage?.set(k,v)!==false}catch(e){console.error(e);return false}}
function isoDate(v){if(!v)return '';const s=String(v).trim(),m=s.match(/^(\d{4})-(\d{2})-(\d{2})/);if(m)return m[1]+'-'+m[2]+'-'+m[3];const b=s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);if(b)return b[3]+'-'+b[2]+'-'+b[1];const d=new Date(v);if(Number.isNaN(d.getTime()))return '';return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function rows(){return $$('#timelineFull .timeline-row')}
function missingDate(r){return /data não informada|sem data|data pendente/i.test($('.timeline-date',r)?.textContent||'')}
function needsReview(r){return r.classList.contains('timeline-row-invalid')||missingDate(r)}
function suggestions(list){const s=new Set(COMMON);list.forEach(r=>{const t=($('.timeline-title',r)?.innerText||'')+' '+($('.timeline-content small',r)?.innerText||'');t.split(/[·—,;|/]+/).map(v=>v.trim()).filter(v=>v.length>=3&&v.length<=55).forEach(v=>s.add(v))});return Array.from(s).slice(0,100)}
function applyFilters(){
 const list=rows(),dl=$('#msaTimelineSuggestions');
 if(dl)dl.innerHTML=suggestions(list).map(v=>'<option value="'+esc(v.replace(/"/g,''))+'"></option>').join('');
 list.forEach(r=>{const t=(r.innerText||'').toLocaleLowerCase('pt-BR');r.style.display=(!query||t.includes(query.toLocaleLowerCase('pt-BR')))&&(!reviewOnly||needsReview(r))?'':'none'});
 const count=$('#msaTimelineResultCount');if(count)count.textContent=list.filter(r=>r.style.display!=='none').length+' de '+list.length+' registros';
 const b=$('#msaTimelineReviewToggle');if(b){b.classList.toggle('active',reviewOnly);b.setAttribute('aria-pressed',String(reviewOnly));b.textContent=reviewOnly?'✅ Mostrar todos os registros':'⚠️ Revisar / data pendente'}
 list.forEach(addEditor);
}
function say(msg){const n=$('#msaTimelineLiveStatus');if(n)n.textContent=msg}
function dateKey(type,r){if(DATE[type])return DATE[type];if(type==='medicamentos')return r.inicio?'inicio':'data';return Object.prototype.hasOwnProperty.call(r,'data')?'data':(Object.prototype.hasOwnProperty.call(r,'inicio')?'inicio':'data')}
function detailKey(type,r){const fields=DETAIL[type]||[];for(const f of fields){if(Object.prototype.hasOwnProperty.call(r,f)&&r[f]!==null&&r[f]!==undefined&&String(r[f])!=='')return f}return fields[0]||'obs'}
function addEditor(row){
 const host=$('.timeline-content',row);if(!host||$('.msa-inline-editor',host))return;
 const trigger=document.createElement('button');trigger.type='button';trigger.className='btn secondary small msa-inline-edit-trigger';trigger.textContent='✏️ Editar aqui';trigger.setAttribute('aria-expanded','false');
 trigger.addEventListener('click',()=>{
  const open=$('.msa-inline-editor',host);if(open){open.remove();trigger.textContent='✏️ Editar aqui';trigger.setAttribute('aria-expanded','false');return}
  const type=row.dataset.timelineType||'',idx=Number(row.dataset.recordIndex),key=KEY[type],list=key?get(key):[],rec=list[idx];
  if(!key||!rec||!Number.isInteger(idx)||idx<0){say('Este registro não permite edição inline. Abra a tela de origem para corrigi-lo.');return}
  const dk=dateKey(type,rec),tk=detailKey(type,rec),editor=document.createElement('form');editor.className='msa-inline-editor';
  editor.innerHTML='<label>Data <input type="date" name="date" value="'+esc(isoDate(rec[dk]||row.dataset.timelineDate))+'"></label><label>Informação principal <input name="detail" maxlength="300" value="'+esc(rec[tk]??'')+'" placeholder="Corrija o texto deste registro"></label><div class="msa-inline-editor-actions"><button class="btn" type="submit">💾 Salvar</button><button class="btn secondary" type="button" data-cancel>Cancelar</button></div><p class="msa-inline-status" role="status" aria-live="polite"></p>';
  editor.addEventListener('submit',e=>{e.preventDefault();const fresh=get(key),target=fresh[idx];if(!target){editor.querySelector('.msa-inline-status').textContent='Registro não encontrado; atualize a Linha do Tempo.';return}const d=editor.elements.date.value,v=editor.elements.detail.value.trim();if(d)target[dk]=d;else if(Object.prototype.hasOwnProperty.call(target,dk))target[dk]='';target[tk]=v;if(!set(key,fresh)){editor.querySelector('.msa-inline-status').textContent='Não foi possível salvar no armazenamento local.';return}say('Registro atualizado.');if(nativeFilter)nativeFilter(lastFilter);setTimeout(applyFilters,0)});
  $('[data-cancel]',editor).addEventListener('click',()=>{editor.remove();trigger.textContent='✏️ Editar aqui';trigger.setAttribute('aria-expanded','false')});
  host.appendChild(editor);trigger.textContent='✖ Fechar edição';trigger.setAttribute('aria-expanded','true');
 });
 host.appendChild(trigger);
}
function download(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function allRowsForExport(){const old=lastFilter;if(nativeFilter)nativeFilter('todos');const data=rows().map(r=>({date:($('.timeline-date',r)?.textContent||'').replace(/^⚠️\s*/,'').trim(),type:r.dataset.timelineType||'',title:$('.timeline-title b',r)?.textContent||'',details:$('.timeline-content small',r)?.textContent||'',status:needsReview(r)?'Revisar':'Sem pendência identificada'}));if(nativeFilter)nativeFilter(old);setTimeout(applyFilters,0);return data}
function exportCSV(){const data=allRowsForExport(),lines=[['Data','Tipo','Registro','Detalhes','Status'],...data.map(r=>[r.date,r.type,r.title,r.details,r.status])],csv=lines.map(a=>a.map(v=>'"'+String(v??'').replace(/"/g,'""')+'"').join(';')).join('\r\n');download(new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8'}),'linha-do-tempo-saude-'+new Date().toISOString().slice(0,10)+'.csv');say('CSV completo gerado. Guarde o arquivo em local seguro.')}
function exportPDF(){const data=allRowsForExport(),w=window.open('','_blank');if(!w){say('O navegador bloqueou a janela de impressão. Permita pop-ups para gerar o PDF.');return}const body=data.map(r=>'<tr><td>'+esc(r.date)+'</td><td>'+esc(r.title)+'</td><td>'+esc(r.details)+'</td><td>'+esc(r.status)+'</td></tr>').join('');w.document.write('<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Resumo de saúde</title><style>body{font:14px Arial,sans-serif;color:#172033;margin:24px}h1{font-size:22px}p{color:#526078;font-size:12px}table{border-collapse:collapse;width:100%;margin-top:18px}th,td{border:1px solid #d9e0ea;padding:8px;text-align:left;vertical-align:top}th{background:#eef3ff}tr{break-inside:avoid}@media print{body{margin:10mm}}</style></head><body><h1>Resumo da linha do tempo de saúde</h1><p>Gerado em '+esc(new Date().toLocaleString('pt-BR'))+'. Documento organizacional; não constitui diagnóstico.</p><table><thead><tr><th>Data</th><th>Registro</th><th>Detalhes</th><th>Status</th></tr></thead><tbody>'+body+'</tbody></table><p>Revise as informações e leve os exames originais à consulta. Use a opção de imprimir ou salvar como PDF no navegador.</p><script>window.onload=function(){window.print()}</scr'+'ipt></body></html>');w.document.close();say('Relatório aberto para imprimir ou salvar como PDF.')}
function toolbar(){
 const filters=$('#timelineFilters');if(!filters||$('#msaTimelineTools'))return;
 const bar=document.createElement('div');bar.id='msaTimelineTools';bar.className='msa-timeline-tools';
 bar.innerHTML='<div class="msa-timeline-search"><label for="msaTimelineSearch">🔎 Buscar no histórico</label><input id="msaTimelineSearch" type="search" list="msaTimelineSuggestions" placeholder="Ex.: dermatologia, dor, exame..." autocomplete="off"><datalist id="msaTimelineSuggestions"></datalist></div><button id="msaTimelineReviewToggle" type="button" class="btn secondary small" aria-pressed="false">⚠️ Revisar / data pendente</button><div class="msa-timeline-export"><button type="button" class="btn secondary small" id="msaTimelineExportCSV">⬇ CSV</button><button type="button" class="btn secondary small" id="msaTimelineExportPDF">🖨️ Relatório / PDF</button></div><span id="msaTimelineResultCount" class="msa-timeline-count"></span><p id="msaTimelineLiveStatus" role="status" aria-live="polite"></p>';
 filters.insertAdjacentElement('beforebegin',bar);
 $('#msaTimelineSearch').addEventListener('input',e=>{query=e.target.value.trim();applyFilters()});
 $('#msaTimelineReviewToggle').addEventListener('click',()=>{reviewOnly=!reviewOnly;applyFilters()});
 $('#msaTimelineExportCSV').addEventListener('click',exportCSV);$('#msaTimelineExportPDF').addEventListener('click',exportPDF);
}
function init(){
 nativeFilter=typeof window.definirFiltroTimeline==='function'?window.definirFiltroTimeline:null;
 if(nativeFilter)window.definirFiltroTimeline=function(f){lastFilter=f||'todos';nativeFilter(lastFilter);setTimeout(applyFilters,0)};
 toolbar();const host=$('#timelineFull');if(host&&window.MutationObserver)new MutationObserver(()=>applyFilters()).observe(host,{childList:true,subtree:true});if(host)setTimeout(applyFilters,0);
}
const css=document.createElement('style');css.id='msaTimelineEnhancementsStyles';css.textContent=[
'.msa-timeline-tools{display:grid;grid-template-columns:minmax(220px,1fr) auto;gap:10px;align-items:end;margin:15px 0 12px;padding:13px;border:1px solid var(--border,#e2e8f0);border-radius:16px;background:var(--card,#fff)}',
'.msa-timeline-search{min-width:0}.msa-timeline-search label{display:block;font-size:12px;font-weight:850;color:var(--text,#172033);margin-bottom:5px}.msa-timeline-search input{width:100%;min-width:0;margin:0;padding:11px 12px;border:1px solid #cbd5e1;border-radius:11px;font:inherit;font-size:14px;background:var(--card,#fff);color:var(--text,#172033)}',
'.msa-timeline-export{display:flex;gap:7px;flex-wrap:wrap}.msa-timeline-count{font-size:11px;color:var(--muted,#64748b)}#msaTimelineLiveStatus{grid-column:1/-1;font-size:12px;color:var(--muted,#64748b);margin:0}',
'.msa-inline-edit-trigger{margin-top:9px;min-height:34px;padding:7px 10px;font-size:11px;box-shadow:none}.msa-inline-editor{margin-top:10px;padding:12px;border:1px solid #bfdbfe;border-radius:13px;background:#f8fbff;display:grid;gap:9px}.msa-inline-editor label{display:block;font-size:12px;font-weight:800;color:#334155}.msa-inline-editor input{display:block;width:100%;min-width:0;margin-top:5px;padding:10px;border:1px solid #cbd5e1;border-radius:9px;font:inherit;font-size:14px;background:#fff}.msa-inline-editor-actions{display:flex;gap:7px;flex-wrap:wrap}.msa-inline-status{margin:0;font-size:12px;color:#475569}',
'.timeline-row-invalid .timeline-content{border-color:#fdba74;background:#fffaf4}.timeline-row-invalid .timeline-dot{background:#f97316}#msaTimelineReviewToggle.active{background:#fff7ed;color:#9a3412;border:1px solid #fdba74}',
'@media(max-width:650px){.msa-timeline-tools{grid-template-columns:minmax(0,1fr);padding:11px;gap:9px}.msa-timeline-export{display:grid;grid-template-columns:1fr 1fr}.msa-timeline-export .btn{width:100%}.msa-timeline-count{font-size:12px}.msa-inline-editor-actions .btn{flex:1 1 120px}}',
'body.msa-dark .msa-inline-editor{background:#172033;border-color:#334155}body.msa-dark .msa-inline-editor label,body.msa-dark .msa-inline-status{color:#e2e8f0}body.msa-dark .msa-inline-editor input{background:#0f172a;color:#f8fafc;border-color:#475569}'
].join('\n');document.head.appendChild(css);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();