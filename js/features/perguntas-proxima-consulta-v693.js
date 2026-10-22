/* Minha Saúde IA V6.93 — bloco de perguntas para a próxima consulta. */
(function(){
'use strict';
const KEY='msa2_perguntas_consulta';
const $=(s,r=document)=>r.querySelector(s);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const suggestions=[
 'Quero entender melhor meu diagnóstico e o que devo acompanhar.',
 'Esse sintoma pode ter relação com alguma condição que já tenho?',
 'Meu medicamento pode causar efeitos que devo observar?',
 'Preciso fazer algum exame ou repetir um exame anterior?',
 'Quais sinais indicam que devo procurar atendimento antes do retorno?',
 'Quando devo retornar e qual é o próximo passo do tratamento?'
];
function list(){try{const v=window.MSAStorage?.get(KEY);return Array.isArray(v)?v:[]}catch(_){return []}}
function save(v){try{return window.MSAStorage?.set(KEY,v)!==false}catch(e){console.error('[Perguntas para consulta]',e);return false}}
function dateLabel(v){if(!v)return '';const d=new Date(v);return Number.isNaN(d.getTime())?String(v):d.toLocaleDateString('pt-BR')}
function styles(){
 if($('#msa93QuestionsStyles'))return;
 const s=document.createElement('style');s.id='msa93QuestionsStyles';s.textContent=[
 '#msa93QuestionPanel{margin-top:16px;padding:15px;border:1px solid #bfe6dc;border-radius:17px;background:linear-gradient(150deg,var(--card,#fff),#f5fdfa)}',
 '#msa93QuestionPanel h4{margin:0;font-size:16px;font-weight:850;line-height:1.4;color:var(--text,#172033)}',
 '#msa93QuestionPanel .msa93-question-intro{font-size:12px;line-height:1.55;color:var(--muted,#64748b);margin:5px 0 13px}',
 '#msa93QuestionPanel label{display:block;font-size:12px;font-weight:800;margin-bottom:5px;color:var(--text,#172033)}',
 '#msa93QuestionPanel textarea{width:100%;min-height:86px;resize:vertical;border:1px solid #cbd5e1;border-radius:11px;padding:11px;font:inherit;font-size:14px;background:var(--card,#fff);color:var(--text,#172033);box-sizing:border-box}',
 '#msa93QuestionPanel .msa93-question-actions{display:flex;flex-wrap:wrap;gap:7px;margin-top:9px}',
 '#msa93QuestionPanel .msa93-question-suggestions{display:flex;flex-wrap:wrap;gap:6px;margin:11px 0 14px}',
 '#msa93QuestionPanel .msa93-question-suggestions button{border:1px solid #cbded8;background:#fff;color:#176b58;border-radius:999px;padding:6px 9px;font:inherit;font-size:11px;font-weight:750;cursor:pointer}',
 '#msa93QuestionPanel .msa93-question-list{display:grid;gap:9px;margin-top:13px}',
 '#msa93QuestionPanel .msa93-question-item{padding:12px;border:1px solid var(--border,#e2e8f0);border-radius:13px;background:var(--card,#fff)}',
 '#msa93QuestionPanel .msa93-question-text{font-size:13px;line-height:1.55;font-weight:700;overflow-wrap:anywhere;color:var(--text,#172033)}',
 '#msa93QuestionPanel .msa93-question-meta{font-size:10px;color:var(--muted,#64748b);margin-top:6px}',
 '#msa93QuestionPanel .msa93-question-badge{display:inline-block;border-radius:999px;padding:4px 8px;font-size:10px;font-weight:850;background:#fff7ed;color:#9a3412;margin-left:5px}',
 '#msa93QuestionPanel .msa93-question-badge.done{background:#ecfdf5;color:#047857}',
 '#msa93QuestionPanel .msa93-question-empty{font-size:12px;color:var(--muted,#64748b);padding:12px;border:1px dashed #cbd5e1;border-radius:12px;background:rgba(248,250,252,.7)}',
 '#msa93QuestionPanel .msa93-question-item-actions{display:flex;gap:6px;flex-wrap:wrap;margin-top:9px}',
 '#msa93QuestionPanel .msa93-question-item-actions button{border:1px solid #dbe3ec;background:#f8fafc;color:#334155;border-radius:9px;padding:7px 9px;font:inherit;font-size:11px;font-weight:800;cursor:pointer}',
 '#msa93QuestionPanel .msa93-question-status{font-size:12px;color:#047857;min-height:18px;margin:8px 0 0}',
 'body.msa-dark #msa93QuestionPanel{background:#111f1d;border-color:#285b50}body.msa-dark #msa93QuestionPanel .msa93-question-item,body.msa-dark #msa93QuestionPanel .msa93-question-suggestions button{background:#111827;color:#e2e8f0;border-color:#334155}body.msa-dark #msa93QuestionPanel textarea{background:#0f172a;color:#f8fafc;border-color:#475569}body.msa-dark #msa93QuestionPanel .msa93-question-empty{background:#111827;border-color:#475569}',
 '@media(max-width:600px){#msa93QuestionPanel{padding:13px;border-radius:15px}#msa93QuestionPanel .msa93-question-actions{display:grid;grid-template-columns:1fr}#msa93QuestionPanel .msa93-question-actions .btn{width:100%}#msa93QuestionPanel .msa93-question-item-actions button{min-height:38px}}'
 ].join('\n');document.head.appendChild(s);
}
function renderItems(root){
 const items=list().slice().sort((a,b)=>Number(Boolean(a.done))-Number(Boolean(b.done))||String(b.createdAt||'').localeCompare(String(a.createdAt||'')));
 const html=items.length?'<div class="msa93-question-list">'+items.map((q,i)=>'<article class="msa93-question-item"><div class="msa93-question-text">'+esc(q.text||'')+'<span class="msa93-question-badge '+(q.done?'done':'')+'">'+(q.done?'✅ Discutida':'⏳ Pendente')+'</span></div><div class="msa93-question-meta">Anotada em '+esc(dateLabel(q.createdAt)||'data não informada')+'</div><div class="msa93-question-item-actions">'+(q.done?'':'<button type="button" data-q-action="done" data-q-id="'+esc(q.id)+'">✅ Marcar como discutida</button>')+'<button type="button" data-q-action="delete" data-q-id="'+esc(q.id)+'">🗑️ Excluir</button></div></article>').join('')+'</div>':'<div class="msa93-question-empty">Nenhuma dúvida anotada ainda. Registre aqui as perguntas que surgirem durante a semana.</div>';
 root.querySelector('.msa93-question-list-host').innerHTML=html;
 const pending=items.filter(q=>!q.done).length;
 const count=root.querySelector('.msa93-question-count');if(count)count.textContent=items.length+' anotada(s) · '+pending+' pendente(s)';
}
function mount(panel){
 if(!panel||panel.hidden)return;
 let root=$('#msa93QuestionPanel',panel);
 if(!root){
  root=document.createElement('section');root.id='msa93QuestionPanel';root.setAttribute('aria-labelledby','msa93QuestionsTitle');
  root.innerHTML='<h4 id="msa93QuestionsTitle">🗒️ Dúvidas para a próxima consulta</h4><p class="msa93-question-intro">Anote perguntas quando elas surgirem durante a semana. Elas ficam salvas no perfil de saúde selecionado e podem ser marcadas depois da consulta.</p><form id="msa93QuestionForm"><label for="msa93QuestionInput">Sua dúvida</label><textarea id="msa93QuestionInput" name="question" maxlength="700" placeholder="Ex.: preciso repetir o exame? Esse sintoma pode ter relação com meu tratamento?" required></textarea><div class="msa93-question-actions"><button type="submit" class="btn green">➕ Guardar pergunta</button><button type="button" class="btn secondary" id="msa93CopyQuestions">📋 Copiar pendentes</button></div></form><div class="msa93-question-suggestions" aria-label="Sugestões de perguntas">'+suggestions.map((s,i)=>'<button type="button" data-q-suggest="'+i+'">'+['🩺 Diagnóstico','😣 Sintomas','💊 Medicamentos','🧪 Exames','🚨 Sinais de alerta','📅 Retorno'][i]+'</button>').join('')+'</div><div class="msa93-question-count"></div><div class="msa93-question-list-host"></div><p class="msa93-question-status" role="status" aria-live="polite"></p>';
  const cards=panel.querySelector('.msa92-list')||panel.querySelector('.msa92-empty')||panel.querySelector('.msa92-head');
  if(cards)cards.insertAdjacentElement('afterend',root);else panel.appendChild(root);
  root.addEventListener('submit',e=>{
   if(e.target.id!=='msa93QuestionForm')return;e.preventDefault();
   const input=$('#msa93QuestionInput',root),text=String(input.value||'').trim();if(!text)return;
   const items=list();items.push({id:'q_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,7),text,createdAt:new Date().toISOString(),done:false});
   const status=$('.msa93-question-status',root);
   if(!save(items)){if(status)status.textContent='Não foi possível salvar a pergunta neste perfil. Confira o armazenamento do navegador.';return}
   input.value='';if(status)status.textContent='Pergunta guardada no perfil ativo.';renderItems(root);
  });
  root.addEventListener('click',e=>{
   const suggest=e.target.closest('[data-q-suggest]');
   if(suggest){const input=$('#msa93QuestionInput',root);input.value=suggestions[Number(suggest.dataset.qSuggest)]||'';input.focus();return}
   const action=e.target.closest('[data-q-action]');
   if(action){const items=list(),id=action.dataset.qId,idx=items.findIndex(q=>String(q.id)===String(id));if(idx<0)return;
    if(action.dataset.qAction==='done')items[idx].done=true;
    else if(action.dataset.qAction==='delete')items.splice(idx,1);
    const status=$('.msa93-question-status',root);if(!save(items)){if(status)status.textContent='Não foi possível atualizar a lista.';return}
    if(status)status.textContent=action.dataset.qAction==='done'?'Pergunta marcada como discutida.':'Pergunta excluída.';renderItems(root);return}
   if(e.target.closest('#msa93CopyQuestions')){
    const pending=list().filter(q=>!q.done),textOut=pending.length?['PERGUNTAS PARA A PRÓXIMA CONSULTA','',...pending.map((q,i)=>(i+1)+'. '+q.text)].join('\n'):'Não há perguntas pendentes.';
    const status=$('.msa93-question-status',root);
    if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(textOut).then(()=>{if(status)status.textContent='Perguntas pendentes copiadas.'}).catch(()=>fallbackCopy(textOut,status));
    else fallbackCopy(textOut,status);
   }
  });
 }
 renderItems(root);
}
function fallbackCopy(text,status){
 const ta=document.createElement('textarea');ta.value=text;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();
 try{document.execCommand('copy');if(status)status.textContent='Perguntas copiadas.'}catch(_){if(status)status.textContent='Não foi possível copiar; selecione e copie manualmente.'}ta.remove();
}
function init(){
 const attach=()=>{const p=$('#msa90DiseasesPanel');if(p&&!p.hidden)mount(p)};
 const obs=new MutationObserver(attach);obs.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden']});attach();
 window.addEventListener('msa:perfil-selecionado',attach);
 window.addEventListener('msa:familiares-atualizados',attach);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();