/* Minha Saúde IA — navegação mais fácil no celular (V6.56)
 * 1) No topo das páginas de IA: “O que você quer fazer com a IA?” com 4 caminhos claros.
 * 2) Card “Deixe sua família por dentro”: salvar PDF da ficha, mandar resumo no WhatsApp e ver a carteirinha.
 * Só acrescenta elementos; não altera os dados salvos.
 */
(function(){
'use strict';
var KEY_ULT='msa2_ultimo_compartilhamento';
function $(id){return document.getElementById(id)}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function ir(id){if(typeof window.go==='function')window.go(id);setTimeout(function(){window.scrollTo({top:0,behavior:'smooth'})},40)}
function lista(k){try{/* K e get são globais do app (K é const, por isso sem window.) */return (typeof get==='function'&&typeof K!=='undefined')?(get(K[k])||[]):[]}catch(e){return[]}}
function perfil(){return lista('p')[0]||{}}
function diasDesde(iso){var t=Date.parse(iso||'');return isNaN(t)?null:Math.floor((Date.now()-t)/86400000)}
function marcarCompartilhado(){try{localStorage.setItem(KEY_ULT,new Date().toISOString())}catch(e){}atualizarCards()}

/* ---------- 1) guia de IA ---------- */
function guiaIA(sec){
 if(!sec||sec.querySelector('.nf-guia'))return;
 var g=document.createElement('div');g.className='card nf-guia';
 g.innerHTML='<h2>🤖 O que você quer fazer com a IA?</h2><p class="muted">Escolha um caminho. Você pode voltar aqui quando quiser.</p><div class="nf-guia-grade">'+
  '<button type="button" data-nf="perguntas-saude"><span>💬</span><b>Perguntar sobre minha saúde</b><small>Alimentos bons e ruins, hábitos, sintomas, remédios…</small></button>'+
  '<button type="button" data-nf="importar"><span>⚡</span><b>Preencher minha ficha com a IA</b><small>O ChatGPT ou Gemini organiza tudo para você</small></button>'+
  '<button type="button" data-nf="consulta"><span>🩺</span><b>Preparar uma consulta</b><small>Perguntas prontas para levar ao médico</small></button>'+
  '<button type="button" data-nf="compartilhar"><span>📤</span><b>Enviar minha ficha</b><small>PDF ou WhatsApp para a família</small></button>'+
 '</div>';
 sec.insertBefore(g,sec.firstChild);
}
document.addEventListener('click',function(e){
 var b=e.target.closest('[data-nf]');if(!b)return;var alvo=b.getAttribute('data-nf');
 if(alvo==='consulta'){if(typeof window.go==='function')window.go('ia');setTimeout(function(){var c=document.querySelector('[onclick*="perguntasConsulta()"]');if(c){c.scrollIntoView({behavior:'auto',block:'center'});c.classList.add('nf-pisca');setTimeout(function(){c.classList.remove('nf-pisca')},1800)}},350);return}
 if(alvo==='compartilhar'){if(typeof window.go==='function')window.go('home');setTimeout(function(){var c=$('nfCompartilharHome');if(c)c.scrollIntoView({behavior:'auto',block:'center'})},350);return}
 ir(alvo);
});

/* ---------- 2) compartilhar com a família ---------- */
function resumoWhatsApp(){
 var p=perfil(),meds=lista('m');var L=[];
 L.push('🩺 *Resumo de saúde'+(p.nome?' — '+p.nome:'')+'*');
 if(p.nasc||p.idade)L.push('🎂 '+(p.nasc?'Nascimento: '+p.nasc:'Idade: '+p.idade));
 if(p.sangue)L.push('🩸 Tipo sanguíneo: '+p.sangue);
 L.push('🚨 Alergias: '+(p.alerg||'não informado'));
 if(p.cond)L.push('🩺 Condições: '+p.cond);
 var emUso=meds.filter(function(m){return m&&m.nome&&!/encerrad|parou|suspens/i.test(String(m.status||''))}).slice(0,8).map(function(m){return m.nome+(m.dose?' ('+m.dose+')':'')});
 if(emUso.length)L.push('💊 Remédios em uso: '+emUso.join(', '));
 if(p.emerg||p.tel)L.push('🆘 Contato de emergência: '+[p.emerg,p.tel].filter(Boolean).join(' — '));
 L.push('');L.push('Enviado pelo app Minha Saúde IA. Não substitui orientação médica.');
 return L.join('\n');
}
function cardCompartilhar(id){
 var d=diasDesde((function(){try{return localStorage.getItem(KEY_ULT)}catch(e){return''}})());
 var lembrete=d===null?'💡 Você ainda não compartilhou sua ficha. Em uma emergência, quem está perto de você vai saber o essencial.':d>30?'⏰ Faz '+d+' dias que você compartilhou. Que tal mandar a versão atualizada?':'✅ Você compartilhou há '+(d===0?'menos de 1 dia':d+' dia'+(d>1?'s':''))+'.';
 var c=document.createElement('div');c.className='card nf-compartilhar';c.id=id;
 c.innerHTML='<h2>📤 Deixe sua família por dentro</h2><p class="muted">Mande sua ficha para quem cuida de você: pais, cônjuge, filhos ou um amigo de confiança. Se algo acontecer, eles terão em mãos <b>alergias, remédios, tipo sanguíneo e contato de emergência</b>.</p>'+
  '<div class="nf-lembrete">'+lembrete+'</div><div class="nf-acoes">'+
  '<button type="button" class="btn" data-nf-acao="pdf">📄 Salvar minha ficha em PDF</button>'+
  '<button type="button" class="btn green" data-nf-acao="whats">📲 Mandar resumo no WhatsApp</button>'+
  '<button type="button" class="btn secondary" data-nf-acao="carteirinha">🪪 Ver minha carteirinha</button></div>'+
  '<p class="muted nf-priv">🔒 Só você decide quem recebe. Envie apenas para pessoas de confiança.</p>';
 return c;
}
function atualizarCards(){['nfCompartilharHome','nfCompartilharPerg','nfCompartilharExp'].forEach(function(id){var old=$(id);if(!old)return;var novo=cardCompartilhar(id);old.replaceWith(novo)})}
document.addEventListener('click',function(e){
 var b=e.target.closest('[data-nf-acao]');if(!b)return;var a=b.getAttribute('data-nf-acao');
 if(a==='pdf'){if(typeof window.exportarPDF==='function'){marcarCompartilhado();window.exportarPDF()}else ir('exportar');return}
 if(a==='carteirinha'){ir('carteirinha');return}
 if(a==='whats'){
  var texto=resumoWhatsApp();
  if(!window.confirm('Este resumo tem informações de saúde:\n\n'+texto+'\n\nEnviar pelo WhatsApp para alguém de confiança?'))return;
  marcarCompartilhado();
  var url='https://wa.me/?text='+encodeURIComponent(texto);
  var link=document.createElement('a');link.href=url;link.target='_blank';link.rel='noopener noreferrer';document.body.appendChild(link);link.click();link.remove();
 }
});
function montar(){
 guiaIA($('ia'));guiaIA($('importar'));
 var home=$('home');
 if(home&&!$('nfCompartilharHome')){var c=cardCompartilhar('nfCompartilharHome');var ref=$('homeProfileHero');if(ref&&ref.parentNode===home)ref.insertAdjacentElement('afterend',c);else home.appendChild(c)}
 var ps=$('perguntas-saude');var psCard=ps&&ps.querySelector('.card');
 if(psCard&&!$('nfCompartilharPerg'))psCard.insertAdjacentElement('afterend',cardCompartilhar('nfCompartilharPerg'));
 var ex=$('exportar');if(ex&&!$('nfCompartilharExp'))ex.insertBefore(cardCompartilhar('nfCompartilharExp'),ex.firstChild);
}
var css=document.createElement('style');css.id='msa-navegacao-facil';
css.textContent='.nf-guia h2{margin:0 0 4px}.nf-guia-grade{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:12px}'+
 '.nf-guia-grade button{display:flex;flex-direction:column;align-items:flex-start;gap:4px;text-align:left;padding:14px;border-radius:16px;border:1px solid var(--line,#e5e7eb);background:var(--card,#fff);color:inherit;font:inherit;cursor:pointer;min-height:120px;transition:transform .15s,border-color .15s}'+
 '.nf-guia-grade button:hover,.nf-guia-grade button:focus-visible{border-color:#2563eb;transform:translateY(-2px)}.nf-guia-grade span{font-size:26px}.nf-guia-grade b{font-size:14.5px;line-height:1.3}.nf-guia-grade small{font-size:12px;color:#64748b;line-height:1.35}'+
 '.nf-compartilhar{border:1px solid #bbf7d0!important;background:linear-gradient(160deg,#f0fdf4,#fff 60%)!important}.nf-compartilhar h2{margin:0 0 6px}'+
 '.nf-lembrete{margin:10px 0;padding:10px 12px;border-radius:12px;background:#fff;border:1px dashed #86efac;font-weight:700;font-size:13.5px}'+
 '.nf-acoes{display:grid;gap:8px}.nf-acoes .btn{width:100%}.nf-priv{font-size:12px;margin:8px 0 0}'+
 '.nf-pisca{outline:3px solid #2563eb;outline-offset:3px;transition:outline .3s}'+
 '@media(min-width:700px){.nf-guia-grade{grid-template-columns:repeat(4,minmax(0,1fr))}.nf-acoes{grid-template-columns:repeat(3,minmax(0,1fr))}}'+
 '@media(max-width:360px){.nf-guia-grade{grid-template-columns:1fr}}'+
 'body.msa-dark .nf-guia-grade button{background:#111827;border-color:#263244}body.msa-dark .nf-guia-grade small{color:#94a3b8}body.msa-dark .nf-compartilhar{background:#0b1f17!important;border-color:#14532d!important}body.msa-dark .nf-lembrete{background:#052e16;border-color:#166534}'+
 '@media(prefers-reduced-motion:reduce){.nf-guia-grade button{transition:none}}'+
 '@media print{.nf-guia,.nf-compartilhar{display:none!important}}'+
 '.msa-mobile-bar{grid-template-columns:repeat(5,minmax(0,1fr))!important}.msa-mobile-bar button{min-width:0;font-size:11.5px}';
document.head.appendChild(css);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(montar,60)});else setTimeout(montar,60);
setTimeout(montar,1200);
})();
