/* Minha Saúde IA V7.16 — cuidado a dois: organização, não diagnóstico */
(function(){
'use strict';
const K=window.MSA_K||window.K||{},S=window.MSAStorage;
const get=k=>{try{const x=S&&S.get?S.get(k):[];return Array.isArray(x)?x:[]}catch(e){return[]}};
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const filled=x=>String(x||'').trim()&& !/^(não informado|não sei|nenhum|nenhuma|n\/a)$/i.test(String(x).trim());
function install(){
 const sec=document.getElementById('familiares');if(!sec||document.getElementById('msaCoupleCareV716'))return;
 const own=get(K.p)[0]||{},fam=get(K.familiares||'msa2_familiares');
 const partners=fam.filter(p=>/cônjuge|conjuge|marido|esposa|companheir[oa]|parceir[oa]/i.test(String(p.parentesco||'')));
 const partner=partners[0]||null;
 const card=document.createElement('section');card.id='msaCoupleCareV716';card.style.cssText='margin:14px 0;padding:17px;border:1px solid #c7d9fb;border-radius:18px;background:linear-gradient(135deg,#eff6ff,#fff);box-shadow:0 5px 18px rgba(37,99,235,.06)';
 const ownName=own.nome||'Você',partnerName=partner&&partner.nome||'sua pessoa parceira';
 const rows=[
  ['Tipo sanguíneo',own.sangue||own.tipoSanguineo,partner&& (partner.sangue||partner.tipoSanguineo),'Serve para manter a informação registrada; não determina compatibilidade do casal.'],
  ['Alergias',own.alergias,partner&&partner.alergias,'Compartilhem alergias conhecidas para ajudar a evitar exposições acidentais.'],
  ['Medicamentos',own.medicamentosRelato||own.medicamentos,partner&&(partner.medicamentosRelato||partner.medicamentos),'Mantenham uma lista atualizada e confirmem nomes e doses com profissional de saúde.'],
  ['Condições de saúde',own.condicao||own.condicoes,partner&&(partner.condicao||partner.condicoes),'Compartilhem apenas o que cada um autorizar e que seja útil para o cuidado.']
 ];
 function display(v){if(Array.isArray(v))return v.map(x=>typeof x==='string'?x:(x&& (x.nome||x.medicamento))||'').filter(Boolean).join(', ');return String(v||'').trim()}
 const known=rows.filter(r=>filled(display(r[1]))||filled(display(r[2])));
 card.innerHTML='<div style="font-size:11px;font-weight:900;letter-spacing:.05em;color:#1d4ed8">💙 CUIDADO A DOIS</div><h3 style="margin:6px 0">Um jeito simples de cuidarem um do outro</h3><p style="margin:0 0 12px;color:#475569;line-height:1.5">Organizem juntos as informações úteis para o dia a dia. Isto não é um teste de compatibilidade médica nem substitui orientação profissional.</p>'+
 (partner?'<div style="padding:11px;border-radius:12px;background:#fff;border:1px solid #dbeafe;margin-bottom:12px"><b>Perfis considerados</b><div style="margin-top:4px;color:#475569">'+esc(ownName)+' + '+esc(partnerName)+'</div></div>':'<div style="padding:11px;border-radius:12px;background:#fff7ed;border:1px solid #fed7aa;margin-bottom:12px;color:#9a3412">Para personalizar esta área, cadastre ou importe sua pessoa parceira em Familiares e marque a relação como cônjuge/companheiro(a).</div>')+
 '<h4 style="margin:12px 0 6px">Informações para revisar juntos</h4>'+
 (partner?rows.map(r=>'<div style="padding:10px;margin:7px 0;background:#fff;border:1px solid #e2e8f0;border-radius:12px"><b>'+esc(r[0])+'</b><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:7px;font-size:13px"><div><span style="color:#64748b">Você</span><br>'+esc(display(r[1])||'Ainda não informado')+'</div><div><span style="color:#64748b">'+esc(partnerName)+'</span><br>'+esc(display(r[2])||'Ainda não informado')+'</div></div><div style="font-size:12px;color:#64748b;margin-top:7px">'+esc(r[3])+'</div></div>').join(''):'<p style="color:#64748b">Quando houver dois perfis, esta área ajuda a conferir os dados que cada um escolheu compartilhar.</p>')+
 '<h4 style="margin:14px 0 6px">Checklist de cuidado do casal</h4><p style="font-size:13px;color:#64748b;margin:0 0 8px">Marquem juntos o que já combinaram. As escolhas ficam salvas neste navegador.</p>'+
 '<div id="msaCoupleChecklistItems" style="display:grid;gap:8px">'+[
 ['emergencia','Sabemos quem contatar em uma emergência.'],
 ['alergias','Compartilhamos as alergias importantes, se houver.'],
 ['medicamentos','Sabemos onde consultar a lista atualizada de medicamentos.'],
 ['autorizacao','Combinamos quais dados de saúde cada um autoriza compartilhar.'],
 ['consultas','Apoiamos um ao outro para organizar consultas e exames.']
 ].map(x=>'<label style="display:flex;gap:9px;align-items:flex-start;padding:10px;border:1px solid #e2e8f0;border-radius:12px;background:#fff"><input type="checkbox" data-couple-check="'+x[0]+'" style="margin-top:3px;min-width:18px;min-height:18px"><span>'+x[1]+'</span></label>').join('')+'</div>'+
 '<div style="margin-top:12px;padding:10px;border-radius:12px;background:#f8fafc;color:#475569;font-size:12px;line-height:1.5">🔒 Privacidade: cada pessoa decide o que compartilhar. O tipo sanguíneo, por si só, não indica compatibilidade para relacionamento ou fertilidade. Para transfusões, gravidez ou dúvidas clínicas, procure orientação profissional.</div>';
 const anchor=sec.querySelector('#msaBasicShareCard')||sec.firstElementChild;if(anchor)anchor.insertAdjacentElement('afterend',card);else sec.prepend(card);
 const key='msa2_couple_care_checklist_v716';let saved={};try{saved=JSON.parse(localStorage.getItem(key)||'{}')||{}}catch(e){}
 card.querySelectorAll('[data-couple-check]').forEach(el=>{el.checked=!!saved[el.dataset.coupleCheck];el.addEventListener('change',()=>{saved[el.dataset.coupleCheck]=el.checked;try{localStorage.setItem(key,JSON.stringify(saved))}catch(e){}})});
}
function init(){install();const sec=document.getElementById('familiares');if(sec)new MutationObserver(()=>install()).observe(sec,{childList:true});window.addEventListener('msa:familiares-atualizados',()=>{const c=document.getElementById('msaCoupleCareV716');if(c)c.remove();install()})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
