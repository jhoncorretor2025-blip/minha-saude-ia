/* Minha Saúde IA — página de importação mais fácil (V7.07)
 * 1 passo a passo visível no topo · 2 botão “Colar resposta” · 3 limpeza automática da resposta da IA
 * 4 prévia instantânea do que foi encontrado · 5 rascunho (já existia; agora guarda a versão limpa)
 * 6 histórico das importações · 7 página mais limpa (importação primeiro, perguntas recolhidas)
 */
(function(){
'use strict';
if(window.__msaImportarFacil)return;window.__msaImportarFacil=true;
function $(id){return document.getElementById(id)}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
var HIST='msa2_importacoes_historico';
function stG(k){try{return window.MSAStorage&&window.MSAStorage.get?window.MSAStorage.get(k)||[]:JSON.parse(localStorage.getItem(k)||'[]')}catch(e){return[]}}
function stS(k,v){try{if(window.MSAStorage&&window.MSAStorage.set)window.MSAStorage.set(k,v);else localStorage.setItem(k,JSON.stringify(v))}catch(e){}}

/* ---------- 3) limpeza da resposta ---------- */
function limpar(t){
 var s=String(t||'').replace(/\r\n?/g,'\n');
 if(/^\s*[{[]/.test(s)&&!/^\s*\[[A-Z_]+\]/.test(s))return s.trim();/* JSON: deixa como está */
 s=s.replace(/```[a-z]*\n?/gi,'').replace(/\*\*(\[[A-Z_]+\])\*\*/g,'$1').replace(/\*\*/g,'').replace(/__/g,'');
 s=s.split('\n').map(function(l){return l.replace(/^\s*(?:[-•*>]|\d+[.)])\s+(?=\[[A-Z_]+\])/,'').replace(/^\s*#{1,6}\s*/,'').replace(/\s+$/,'')}).join('\n');
 var i=s.search(/\[[A-Z_]{3,}\]/);if(i>0)s=s.slice(i);/* tira “Claro! Aqui está sua ficha:” */
 s=s.replace(/\n{3,}/g,'\n\n');
 /* tira despedidas depois do último campo (“Espero ter ajudado”, “Se precisar…”) */
 var linhas=s.split('\n'),ult=-1;linhas.forEach(function(l,k){if(/^\[[A-Z_]+\]/.test(l))ult=k});
 if(ult>=0){var fim=ult+1;while(fim<linhas.length&&linhas[fim].trim()&&!/^(espero|se precisar|qualquer d[uú]vida|obs\.?:|nota:|observa[cç][aã]o:)/i.test(linhas[fim].trim()))fim++;linhas=linhas.slice(0,fim)}
 return linhas.join('\n').trim();
}

/* ---------- 4) prévia ---------- */
function analisar(t){
 if(!String(t||'').trim())return null;
 var n=null;try{if(/^\s*\{/.test(t)&&typeof window.normalizarImport==='function')n=window.normalizarImport(JSON.parse(t));else if(typeof window.normalizarFichaIA==='function')n=window.normalizarFichaIA(t)}catch(e){return {erro:true}}
 if(!n)return {erro:true};
 var vazio=function(v){return v==null||!String(v).trim()||/^n[aã]o informad/i.test(String(v).trim())};
 var perfil=Object.keys(n.p||{}).filter(function(k){return !vazio(n.p[k])});
 var it=[['💊','remédio','remédios',(n.meds||[]).length],['🩺','consulta','consultas',(n.consultas||[]).length],['🧪','exame','exames',(n.exames||[]).length],['🤒','sintoma','sintomas',(n.dores||[]).length],['❤️','medição','medições',(n.vitais||[]).length],['💉','vacina','vacinas',(n.vacinas||[]).length],['🧬','familiar','familiares',(n.familia||[]).length],['⏰','lembrete','lembretes',(n.lembretes||[]).length]].filter(function(x){return x[3]>0});
 return {perfil:perfil.length,itens:it,total:perfil.length+it.reduce(function(a,x){return a+x[3]},0)};
}
var NOMES={nome:'nome',nasc:'nascimento',sexo:'sexo',sangue:'tipo sanguíneo',altura:'altura',peso:'peso',alerg:'alergias',cond:'doenças',emerg:'contato de emergência',tel:'telefone'};
function mostrarPrevia(){
 var box=$('importIA'),out=$('msaImpPrevia');if(!box||!out)return;var r=analisar(limpar(box.value));
 if(!r){out.innerHTML='';out.className='msa-imp-previa';return}
 if(r.erro||!r.total){out.className='msa-imp-previa ruim';out.innerHTML='⚠️ <b>Ainda não reconheci nenhuma informação.</b> Confira se você colou a resposta inteira da IA (ela deve ter linhas como <code>[DOENCAS]: …</code>).';return}
 out.className='msa-imp-previa bom';
 out.innerHTML='✅ <b>Encontrei:</b> '+[r.perfil?'👤 '+r.perfil+' dado(s) pessoal(is)':''].concat(r.itens.map(function(x){return x[0]+' '+x[3]+' '+(x[3]>1?x[2]:x[1])})).filter(Boolean).join(' · ')+'<small>Toque em “Analisar ficha e revisar” para conferir antes de salvar.</small>';
}

/* ---------- 1) passo a passo visível e atualizado ---------- */
function passo(n,titulo,msg){var root=$('msaImportFlow');if(!root)return;root.querySelectorAll('[data-step]').forEach(function(x){x.classList.toggle('active',Number(x.dataset.step)===n);x.classList.toggle('feito',Number(x.dataset.step)<n)});var t=$('msaImportFlowTitle'),m=$('msaImportFlowMsg'),s=$('msaImportFlowState');if(t)t.textContent=titulo;if(m)m.textContent=msg;if(s)s.textContent='Etapa '+n+' de 5'}
function arrumarFluxo(){
 var flow=$('msaImportFlow'),card=document.querySelector('#importar > details .card');if(!flow||!card||flow.dataset.v707)return;flow.dataset.v707='1';
 card.insertBefore(flow,card.firstChild);
}
document.addEventListener('click',function(e){
 if(e.target.closest('[data-nb-parte], .ai-cta button, #msaGenerateImportPrompt, a[href*="notebooklm"], a[href*="chatgpt"], a[href*="gemini"]'))setTimeout(function(){var b=$('importIA');if(b&&!b.value.trim())passo(2,'Converse com sua IA','Cole o prompt na IA, espere a resposta e copie tudo o que ela devolver.')},200);
});

/* ---------- 2) colar resposta + 3) limpar ao colar ---------- */
function ferramentas(){
 var box=$('importIA');if(!box||$('msaImpTools'))return;
 var w=document.createElement('div');w.id='msaImpTools';w.className='msa-imp-tools';
 w.innerHTML='<button type="button" class="btn" id="msaImpColar">📋 Colar resposta da IA</button><button type="button" class="btn secondary" id="msaImpLimpar">🧹 Limpar caixa</button>';
 box.parentNode.insertBefore(w,box);
 var prev=document.createElement('div');prev.id='msaImpPrevia';prev.className='msa-imp-previa';prev.setAttribute('role','status');prev.setAttribute('aria-live','polite');box.insertAdjacentElement('afterend',prev);
 $('msaImpColar').onclick=function(){
  if(!navigator.clipboard||!navigator.clipboard.readText){box.focus();prev.className='msa-imp-previa ruim';prev.innerHTML='Toque e segure na caixa abaixo e escolha <b>Colar</b>.';return}
  navigator.clipboard.readText().then(function(t){if(!t.trim()){prev.className='msa-imp-previa ruim';prev.innerHTML='A área de transferência está vazia. Copie a resposta da IA primeiro.';return}aplicarTexto(t)},function(){box.focus();prev.className='msa-imp-previa ruim';prev.innerHTML='O navegador não deixou colar sozinho. Toque e segure na caixa e escolha <b>Colar</b>.'});
 };
 $('msaImpLimpar').onclick=function(){if(box.value.trim()&&!confirm('Apagar o texto colado?'))return;box.value='';box.dispatchEvent(new Event('input',{bubbles:true}));passo(1,'Prepare sua importação','Copie o prompt e cole na sua IA.')};
 box.addEventListener('paste',function(){setTimeout(function(){aplicarTexto(box.value)},30)});
 var tm;box.addEventListener('input',function(){clearTimeout(tm);tm=setTimeout(mostrarPrevia,350)});
 if(box.value.trim())mostrarPrevia();
}
function aplicarTexto(t){
 var box=$('importIA');if(!box)return;var limpo=limpar(t),mudou=limpo!==String(t).trim();
 box.value=limpo;box.dispatchEvent(new Event('input',{bubbles:true}));mostrarPrevia();
 passo(3,'Resposta colada','Confira a prévia e toque em “Analisar ficha e revisar”.');
 if(mudou){var p=$('msaImpPrevia');if(p)p.insertAdjacentHTML('beforeend','<small>🧹 Tirei textos extras que a IA colocou (saudação, asteriscos, código).</small>')}
}
/* também limpa na hora de analisar, caso a pessoa tenha digitado/colado de outro jeito */
function embrulhar(nome){var f=window[nome];if(typeof f!=='function'||f.__v707)return;window[nome]=function(){var b=$('importIA');if(b&&b.value)b.value=limpar(b.value);var r=f.apply(this,arguments);setTimeout(function(){var ov=$('importReviewOverlay');if(ov&&getComputedStyle(ov).display!=='none')passo(4,'Revise os dados','Confira cada item. Itens que já existem podem ser completados em vez de duplicados.')},300);return r};window[nome].__v707=true}

/* ---------- 6) histórico ---------- */
function historico(){
 var card=document.querySelector('#importar details .card');if(!card)return;var box=$('msaImpHist');
 if(!box){box=document.createElement('div');box.id='msaImpHist';box.className='msa-imp-hist';card.appendChild(box)}
 var h=stG(HIST).slice(-5).reverse();
 box.innerHTML=h.length?'<h3>🕐 Últimas importações</h3><ul>'+h.map(function(x){return '<li><b>'+esc(new Date(x.em).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}))+'</b> · '+esc(x.modo)+' · '+esc(x.resumo)+'</li>'}).join('')+'</ul>':'';
}
function ganchoHistorico(){
 var f=window.confirmarImportacaoPendente;if(typeof f!=='function'||f.__v707)return;
 window.confirmarImportacaoPendente=function(){
  var antes=window._importPendente,a=analisar(JSON.stringify(antes||{}));window.__msaImportCompletados=[];
  var r=f.apply(this,arguments);
  setTimeout(function(){
   if(window._importPendente||!antes)return;/* não salvou (validação) */
   var comp=(window.__msaImportCompletados||[]).join(', ');
   var partes=[];if(a&&a.perfil)partes.push(a.perfil+' dado(s) pessoal(is)');(a&&a.itens||[]).forEach(function(x){partes.push(x[3]+' '+(x[3]>1?x[2]:x[1]))});
   var nb=$('msaNotebookLMMode');
   var lista=stG(HIST);lista.push({em:new Date().toISOString(),modo:nb&&nb.checked?'📓 NotebookLM':'🤖 ChatGPT/Gemini',resumo:(partes.join(', ')||'dados importados')+(comp?' · '+comp:'')});
   stS(HIST,lista.slice(-30));historico();passo(5,'Pronto, dados salvos! 🎉','Confira suas informações no Início. A importação ficou registrada no histórico.');
   var b=$('importIA');if(b){b.value='';b.dispatchEvent(new Event('input',{bubbles:true}))}
  },400);
  return r;
 };
 window.confirmarImportacaoPendente.__v707=true;
}

/* ---------- 7) página mais limpa ---------- */
function organizar(){
 var sec=$('importar');if(!sec||sec.dataset.v707)return;sec.dataset.v707='1';
 var imp=document.querySelector('#importar > details');var guia=sec.querySelector('.msa-page-guide');
 if(imp){if(guia)guia.insertAdjacentElement('afterend',imp);else sec.insertBefore(imp,sec.firstChild);var sm=imp.querySelector('summary');if(sm)sm.textContent='📥 Importar minha ficha com a IA (ChatGPT, Gemini ou NotebookLM)'}
 /* o quadro de perguntas rápidas é de outra função: fica recolhido no fim */
 /* só o “O que você quer saber…” e as perguntas prontas vão para um bloco recolhido; a caixa de colar a resposta fica onde está */
 var hero=sec.querySelector('.ai-hero'),grade=$('msaPerguntasRapidas');
 if(hero&&!sec.querySelector('details.msa-imp-perg')){var d=document.createElement('details');d.className='msa-imp-perg';d.innerHTML='<summary>💬 Perguntas rápidas para a IA sobre a sua saúde</summary>';sec.appendChild(d);
  var aviso=grade&&grade.nextElementSibling&&/alert/.test(grade.nextElementSibling.className)?grade.nextElementSibling:null;[hero,grade,aviso].forEach(function(x){if(x)d.appendChild(x)})}
 /* o guia “O que você quer fazer com a IA?” fica menor aqui */
 var ng=sec.querySelector('.nf-guia');if(ng)ng.classList.add('msa-imp-guia-mini');
}
var css=document.createElement('style');css.id='msa-importar-facil';
css.textContent='#msaImportFlow [data-step].feito{background:#dcfce7!important;color:#166534!important}#msaImportFlow [data-step].active{background:#2563eb!important;color:#fff!important}'+
 '.msa-imp-tools{display:grid;grid-template-columns:2fr 1fr;gap:8px;margin:8px 0}.msa-imp-tools .btn{min-height:48px;font-size:15px}'+
 '.msa-imp-previa{margin:8px 0;border-radius:12px;font-size:14.5px;line-height:1.5}.msa-imp-previa.bom{padding:10px 12px;background:#f0fdf4;border:1px solid #86efac;color:#14532d}.msa-imp-previa.ruim{padding:10px 12px;background:#fffbeb;border:1px solid #fcd34d;color:#78350f}.msa-imp-previa small{display:block;margin-top:4px;font-size:12.5px;opacity:.9}.msa-imp-previa code{font-size:12px}'+
 '.msa-imp-hist{margin-top:16px;padding:12px 14px;border-radius:14px;background:#f8fafc;border:1px solid #e2e8f0}.msa-imp-hist:empty{display:none}.msa-imp-hist h3{margin:0 0 6px;font-size:15px}.msa-imp-hist ul{margin:0;padding-left:18px;font-size:14px;line-height:1.6}'+
 '.msa-imp-perg{margin-top:14px}.msa-imp-perg>summary{cursor:pointer;padding:14px;border:1px solid #dbe2ea;border-radius:14px;font-weight:800}'+
 '.msa-imp-guia-mini .nf-guia-grade button{min-height:84px!important}.msa-imp-guia-mini .nf-guia-grade small{display:none}'+
 'body.msa-dark .msa-imp-previa.bom{background:#052e16;color:#bbf7d0;border-color:#166534}body.msa-dark .msa-imp-previa.ruim{background:#3b2a0c;color:#fde68a;border-color:#b45309}body.msa-dark .msa-imp-hist{background:#0f172a;border-color:#334155}';
document.head.appendChild(css);
function iniciar(){organizar();arrumarFluxo();ferramentas();historico();['iniciarImportacao','processarImportacao'].forEach(embrulhar);ganchoHistorico()}
window.msaLimparRespostaIA=limpar;window.msaAnalisarRespostaIA=analisar;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(iniciar,1200)});else setTimeout(iniciar,1200);
setTimeout(iniciar,3000);
})();
