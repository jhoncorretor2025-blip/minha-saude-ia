/* V7.18 — correção: atalho visível na tela inicial */
(function(){
'use strict';
function openShare(){
 if(typeof window.go==='function')window.go('familiares');
 setTimeout(function(){
  var card=document.getElementById('msaBasicShareCard');
  if(card){card.scrollIntoView({behavior:'smooth',block:'center'});card.style.outline='3px solid #2563eb';setTimeout(function(){card.style.outline=''},2200)}
  else alert('Abra o menu Família → Familiares. Lá você encontrará “Compartilhar só meus dados básicos”.');
 },350);
}
function addHome(){
 var home=document.getElementById('home');
 if(!home||document.getElementById('msaShareEasyV717'))return;
 var c=document.createElement('div');c.id='msaShareEasyV717';
 c.style.cssText='margin:14px 0;padding:17px;border:2px solid #93c5fd;border-radius:18px;background:#eff6ff;color:#172033';
 c.innerHTML='<div style="font-size:11px;font-weight:900;color:#1d4ed8;letter-spacing:.05em">💑 COMPARTILHAR COM QUEM VOCÊ AMA</div><h3 style="margin:7px 0;font-size:19px">Enviar meus dados para minha namorada ou cônjuge</h3><p style="margin:0 0 12px;line-height:1.5;color:#475569">Exporte somente nome, idade, tipo sanguíneo, peso, altura e medidas. Depois envie o arquivo pelo WhatsApp para a outra pessoa importar.</p><button type="button" id="msaShareEasyBtn" style="width:100%;min-height:48px;background:#2563eb;color:#fff;border:0;border-radius:12px;font-weight:800;font-size:15px">📤 Começar a compartilhar</button><p style="font-size:12px;color:#64748b;margin:9px 0 0">Você escolhe quando compartilhar. O histórico médico completo não será incluído.</p>';
 var hero=document.getElementById('homeProfileHero');
 if(hero&&hero.parentNode)hero.insertAdjacentElement('afterend',c);else home.prepend(c);
 c.querySelector('button').addEventListener('click',openShare);
}
function addExport(){
 var sec=document.getElementById('exportar');
 if(!sec||document.getElementById('msaShareEasyExportV717'))return;
 var c=document.createElement('div');c.id='msaShareEasyExportV717';c.className='card';
 c.style.cssText='margin:14px 0;padding:16px;border:2px solid #93c5fd;border-radius:18px;background:#eff6ff';
 c.innerHTML='<h3 style="margin-top:0">💑 Enviar meus dados básicos para minha namorada ou cônjuge</h3><p style="line-height:1.5;color:#475569">Não é em “Ferramentas IA”. A transferência fica em <b>Família → Familiares</b>. Vamos levar você até lá.</p><button type="button" style="width:100%;min-height:48px;background:#2563eb;color:white;border:0;border-radius:12px;font-weight:800">📤 Abrir compartilhamento simples</button>';
 c.querySelector('button').addEventListener('click',openShare);sec.prepend(c);
}
function init(){addHome();addExport();var obs=new MutationObserver(function(){addHome();addExport()});obs.observe(document.body,{childList:true,subtree:true});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();