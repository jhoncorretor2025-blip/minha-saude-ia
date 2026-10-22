/* Minha Saúde IA V6.91 — atalho de doenças e condições na linha do tempo. */
(function(){
'use strict';
const $=(s,r=document)=>r.querySelector(s);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const arr=v=>Array.isArray(v)?v:(v&&typeof v==='object'?[v]:[]);
function read(key){try{const v=window.MSAStorage?.get(key);return v==null?[]:arr(v)}catch(_){return []}}
function profile(){return read('msa2_perfil')[0]||{}}
function conditions(){
 const p=profile(),out=[];
 const cond=p.cond??p.condicoes??p.doencas??p.diagnosticos;
 if(typeof cond==='string')cond.split(/[\n;,]+/).map(x=>x.trim()).filter(Boolean).forEach(name=>out.push({name,source:'Meu perfil'}));
 else arr(cond).forEach(x=>out.push({name:typeof x==='string'?x:(x.nome||x.nomeCondicao||x.condicao||x.doenca||x.diagnostico||'Condição registrada'),detail:typeof x==='object'?(x.observacao||x.descricao||x.status||''): '',source:'Meu perfil'}));
 ['msa2_condicoes','msa2_historico_medico','msa2_historico_condicoes','msa2_doencas'].forEach(key=>read(key).forEach(x=>{
  const name=typeof x==='string'?x:(x.nome||x.nomeCondicao||x.condicao||x.doenca||x.diagnostico||x.titulo);
  if(name)out.push({name,detail:typeof x==='object'?(x.observacao||x.descricao||x.status||''):'',date:typeof x==='object'?(x.dataDiagnostico||x.data||x.createdAt||''):'',source:'Registros de saúde'});
 }));
 const seen=new Set();return out.filter(x=>{const k=String(x.name).toLowerCase().trim();if(!k||seen.has(k))return false;seen.add(k);return true});
}
function render(){
 const section=$('#timeline');if(!section||$('#msa90DiseasesButton'))return;
 const filters=$('#timelineFilters');if(!filters)return;
 const btn=document.createElement('button');btn.type='button';btn.id='msa90DiseasesButton';btn.className='btn secondary';btn.textContent='🩺 Minhas doenças';
 const panel=document.createElement('div');panel.id='msa90DiseasesPanel';panel.className='card';panel.hidden=true;panel.style.cssText='margin-top:12px;border:1px solid #c7d2fe;background:var(--card,#fff);border-radius:16px;padding:15px';
 const actions=document.createElement('div');actions.id='msa90DiseasesActions';actions.className='row';actions.style.cssText='margin-top:8px;gap:7px;flex-wrap:wrap';actions.appendChild(btn);filters.insertAdjacentElement('afterend',actions);actions.insertAdjacentElement('afterend',panel);
 function draw(){
  const items=conditions(),name=profile().nome||'perfil atual';
  panel.innerHTML='<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:10px;flex-wrap:wrap"><div><h3 style="margin:0 0 5px">🩺 Minhas doenças e condições</h3><p style="margin:0;color:var(--muted,#64748b);font-size:13px">Informações cadastradas em '+esc(name)+'. Confira se está no perfil correto.</p></div><button type="button" id="msa90Close" class="btn secondary">Fechar</button></div>'+
   (items.length?'<div style="display:grid;gap:9px;margin-top:13px">'+items.map(x=>'<article style="border:1px solid var(--border,#e2e8f0);border-radius:12px;padding:12px"><strong>🩺 '+esc(x.name)+'</strong>'+(x.detail?'<p style="margin:5px 0 0;font-size:13px;color:var(--muted,#64748b)">'+esc(x.detail)+'</p>':'')+(x.date?'<small style="display:block;margin-top:5px;color:var(--muted,#64748b)">Data: '+esc(x.date)+'</small>':'')+'<small style="display:block;margin-top:5px;color:var(--muted,#64748b)">'+esc(x.source)+'</small></article>').join('')+'</div>':'<div style="margin-top:13px;padding:13px;border-radius:12px;background:var(--surface,#f8fafc)"><strong>Nenhuma doença ou condição encontrada.</strong><p style="font-size:13px;color:var(--muted,#64748b);margin:6px 0 10px">Cadastre as condições já diagnosticadas no seu perfil para que apareçam aqui. Não inclua suspeitas como se fossem diagnósticos confirmados.</p><button type="button" id="msa90GoProfile" class="btn secondary">Abrir meu perfil</button></div>');
  $('#msa90Close',panel).onclick=()=>{panel.hidden=true;btn.setAttribute('aria-expanded','false')};
  const go=$('#msa90GoProfile',panel);if(go)go.onclick=()=>{if(typeof window.go==='function')window.go('perfil');else location.hash='perfil'};
 }
 btn.setAttribute('aria-controls',panel.id);btn.setAttribute('aria-expanded','false');
 btn.addEventListener('click',()=>{panel.hidden=!panel.hidden;btn.setAttribute('aria-expanded',String(!panel.hidden));if(!panel.hidden)draw()});
 window.addEventListener('msa:perfil-selecionado',()=>{if(!panel.hidden)draw()});
 window.addEventListener('msa:familiares-atualizados',()=>{if(!panel.hidden)draw()});
}
function init(){if(render()===undefined&&!$('#msa90DiseasesButton')){const observer=new MutationObserver(()=>{if($('#timelineFilters')&&!$('#msa90DiseasesButton')){render();observer.disconnect()}});observer.observe(document.body,{childList:true,subtree:true});setTimeout(()=>observer.disconnect(),15000)}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();