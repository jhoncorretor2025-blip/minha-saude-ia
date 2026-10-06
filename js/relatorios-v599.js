/* Minha Saúde IA — Relatórios V5.99 */
'use strict';
/* V4.4: auto-update and force-refresh */
function forcarAtualizacao(){
 const u=new URL(window.location.href);const clean=u.origin+u.pathname+u.search; if('serviceWorker' in navigator){navigator.serviceWorker.getRegistrations().then(rs=>Promise.all(rs.map(r=>r.unregister()))).then(()=>caches&&caches.keys?caches.keys().then(ks=>Promise.all(ks.map(k=>caches.delete(k)))):null).finally(()=>window.location.replace(clean));}else window.location.replace(clean);
}
async function copiarLinkNovoUsuario(){
 const base=window.location.origin+window.location.pathname;
 const token='novo-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8);
 const link=base+'?perfil='+encodeURIComponent(token);
 if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(link).then(()=>alert('🔗 Link zerado copiado! Envie este link para a outra pessoa.\n\nOs dados dela ficarão separados dos seus neste navegador.')).catch(()=>prompt('Copie o link para enviar:',link));}else prompt('Copie o link para enviar:',link);
}
async function verificarNovaVersao(){
 try{
  const r=await fetch('./version.json?cb='+Date.now(),{cache:'no-store'});
  if(!r.ok)return;
  const data=await r.json();
  if(data.version && data.version!=='V5.99'){
   const key='msa2_update_attempt_'+data.version;
   if(sessionStorage.getItem(key)!=='1'){
    sessionStorage.setItem(key,'1');
    const clean=window.location.origin+window.location.pathname+window.location.search;
    const reload=()=>window.location.replace(clean);
    if('serviceWorker' in navigator){
     navigator.serviceWorker.getRegistrations().then(rs=>Promise.all(rs.map(r=>r.unregister()))).then(()=>('caches' in window)?caches.keys().then(ks=>Promise.all(ks.map(k=>caches.delete(k)))):null).then(reload).catch(reload);
    }else reload();
   }else{
    const el=document.getElementById('updateNotice');
    if(el){el.style.display='block';el.innerHTML='🆕 <b>Nova versão '+esc(data.version)+' disponível.</b> Toque em <b>Atualizar agora</b> para tentar novamente.';}
   }
  }
 }catch(e){console.log('Verificação de versão indisponível',e)}
}

function getRange(){
 const today=new Date(), end=today.toISOString().slice(0,10);
 const start=new Date(today); start.setDate(start.getDate()-30);
 return {start:start.toISOString().slice(0,10),end};
}
function initReports(){
 const r=getRange();
 if($('rInicio')) $('rInicio').value=r.start;
 if($('rFim')) $('rFim').value=r.end;
 updatePinStatus();
}
function inRange(date,start,end){
 if(!date)return false;
 const d=String(date).slice(0,10);
 return d>=start && d<=end;
}
function rangeData(){
 let start=$('rInicio').value,end=$('rFim').value;
 if(!start||!end){let r=getRange();start=r.start;end=r.end}
 return {start,end,d:get(K.d).filter(x=>inRange(x.data,start,end)),c:get(K.c).filter(x=>inRange(x.data,start,end)),m:get(K.m).filter(x=>inRange(x.inicio||x.fim,start,end)),e:get(K.e).filter(x=>inRange(x.data,start,end))};
}
function openReport(title,body){
 const w=window.open('','_blank');
 if(!w){alert('Permita pop-ups para gerar o relatório.');return}
 const safeTitle=esc(title);
 const safeBody=String(body||'');
 const c=typeof calcularCompletudeSaude==='function'?calcularCompletudeSaude():{percentual:0,preenchidos:0,total:0};
 const appVersion='V5.99';
 const reportMeta='<div class="box" style="border:1px solid #dbeafe;background:#eff6ff"><b>📌 Identificação do sistema</b><br>Versão: <b>'+appVersion+'</b><br>Completude da ficha: <b>'+c.percentual+'%</b> ('+c.preenchidos+'/'+c.total+' itens avaliados)<br>Gerado em: '+new Date().toLocaleString('pt-BR')+'</div>';
 w.document.open();
 w.document.write('<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+safeTitle+'</title><style>'+
 'body{font-family:Arial,sans-serif;max-width:850px;margin:30px auto;padding:0 16px;color:#172033;line-height:1.65;background:#fff}'+
 'h1{color:#1d4ed8;font-size:30px;font-weight:900;margin:0 0 18px;padding-bottom:12px;border-bottom:3px solid #dbeafe;letter-spacing:-.02em}'+
 'h2{font-size:21px;font-weight:900;color:#172033;margin:28px 0 12px;padding:10px 12px;border-left:5px solid #2563eb;background:#eff6ff;border-radius:10px;page-break-after:avoid}'+
 'h3{font-size:17px;font-weight:900;color:#1d4ed8;margin:20px 0 8px}'+
 'p{margin:8px 0}ul,ol{margin:8px 0 16px;padding-left:28px}li{margin:7px 0;padding-left:3px}'+
 '.box{background:#f8fafc;border:1px solid #e2e8f0;padding:14px 16px;border-radius:12px;margin:12px 0}'+
 '.box b{font-weight:900;color:#172033}'+
 'table{border-collapse:collapse;width:100%;margin:12px 0 18px}th,td{border:1px solid #dbe2ea;padding:9px;text-align:left;font-size:13px;vertical-align:top}th{background:#eff6ff;font-weight:900;color:#1e3a8a}tr:nth-child(even) td{background:#fafcff}'+
 '.foot{color:#64748b;font-size:11px;margin-top:34px;padding-top:12px;border-top:1px solid #e2e8f0}'+
 '@media print{body{margin:0;max-width:none;padding:8mm 7mm}h1{font-size:27px}h2{font-size:19px;margin-top:20px;break-after:avoid}.box{break-inside:avoid}li,table{break-inside:auto}button{display:none!important}}'+
 '@media(max-width:700px){body{margin:16px auto;padding:0 10px}h1{font-size:24px}h2{font-size:19px}table{display:block;overflow-x:auto;-webkit-overflow-scrolling:touch;white-space:nowrap}th,td{font-size:12px;padding:8px}.box{padding:12px}}'+
 '</style></head><body><h1>🩺 '+safeTitle+'</h1>'+safeBody+
 '<div class="foot">Gerado pelo Minha Saúde IA. Este documento organiza informações registradas pelo usuário e não constitui diagnóstico, prescrição ou laudo médico.</div>'+
 '
<!-- V5.99 — Evolução, gráficos e resumo inteligente -->
<style id="msa98-style">
#msa98-evolution{margin-top:16px}.msa98-section{padding:0 2px}.msa98-head{display:flex;justify-content:space-between;align-items:flex-end;gap:16px;margin:18px 0 12px}.msa98-kicker{font-size:11px;font-weight:900;color:#2563eb;letter-spacing:.08em}.msa98-head h2{margin:4px 0;font-size:25px}.msa98-head p{margin:0;color:#64748b;font-size:13px}.msa98-kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:12px}.msa98-kpi{display:flex;gap:11px;align-items:center;background:#fff;border:1px solid #e5eaf2;border-radius:17px;padding:14px;box-shadow:0 8px 26px rgba(15,23,42,.045)}.msa98-kpi-icon{width:40px;height:40px;border-radius:13px;display:grid;place-items:center;background:#eff6ff;font-size:20px}.msa98-kpi small,.msa98-kpi span{display:block;color:#64748b;font-size:11px}.msa98-kpi strong{display:block;font-size:20px;color:#172033;margin:2px 0}.msa98-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.msa98-chart-card,.msa98-summary,.msa98-timeline{padding:17px!important}.msa98-chart-title{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:8px}.msa98-chart-title h3{margin:0;font-size:16px}.msa98-chart-title span{font-size:11px;color:#64748b}.msa98-chart-card canvas{display:block;width:100%;height:220px}.msa98-bottom{margin-top:12px}.msa98-summary ul{margin:8px 0 14px;padding-left:20px}.msa98-summary li{margin:9px 0;color:#334155;font-size:13px}.msa98-disclaimer{padding:10px 12px;border-radius:12px;background:#f8fafc;color:#64748b;font-size:11px}.msa98-event{display:grid;grid-template-columns:1fr auto;gap:2px 10px;padding:9px 0;border-bottom:1px solid #eef2f7}.msa98-event:last-child{border-bottom:0}.msa98-event b{font-size:12px}.msa98-event small{color:#64748b}.msa98-event span{grid-column:1/-1;color:#64748b;font-size:11px}@media(max-width:800px){.msa98-kpis{grid-template-columns:1fr 1fr}.msa98-grid{grid-template-columns:1fr}.msa98-head{align-items:flex-start}.msa98-head .btn{flex:none}}@media(max-width:430px){.msa98-kpis{gap:7px}.msa98-kpi{padding:11px}.msa98-kpi-icon{width:34px;height:34px;font-size:17px}.msa98-kpi strong{font-size:17px}.msa98-head{display:block}.msa98-head .btn{margin-top:10px;width:100%}}
</style>
<script src="./js/evolucao-v599.js?v=V5.99"><\/script>
</body></html>');
 w.document.close();
 setTimeout(()=>w.print(),300);
}
function relatorioCompleto(){
 const {start,end,d,c,m,e}=rangeData(),p=get(K.p)[0]||{};
 openReport('Relatório completo',`
 <div class="box"><b>Período:</b> ${start} a ${end}<br><b>Nome:</b> ${esc(p.nome||'Não informado')}<br><b>Alergias:</b> ${esc(p.alerg||'Não informado')}<br><b>Condições:</b> ${esc(p.cond||'Não informado')}</div>
 <h2>📋 Resumo</h2><p>${d.length} sintomas · ${c.length} consultas · ${m.length} medicamentos · ${e.length} exames</p>
 <h2>😣 Sintomas</h2>${d.length?'<ul>'+d.map(x=>`<li>${x.data} — <b>${esc(x.local)}</b> — ${x.int}/10 — ${esc(x.tipo)}. ${esc(x.sint||'')}</li>`).join('')+'</ul>':'<p>Nenhum registro.</p>'}
 <h2>👨‍⚕️ Consultas</h2>${c.length?'<ul>'+c.map(x=>`<li>${x.data} — ${esc(x.esp)} — ${esc(x.med||'')}. ${esc(x.obs||'')}</li>`).join('')+'</ul>':'<p>Nenhuma.</p>'}
 <h2>💊 Medicamentos</h2>${m.length?'<ul>'+m.map(x=>`<li>${esc(x.nome)} — ${esc(x.dose||'')} — ${esc(x.freq||'')} — ${x.inicio||'—'} até ${x.fim||'—'}</li>`).join('')+'</ul>':'<p>Nenhum.</p>'}
 <h2>🧪 Exames</h2>${e.length?'<ul>'+e.map(x=>`<li>${x.data} — <b>${esc(x.nome)}</b>: ${esc(x.res||'')}</li>`).join('')+'</ul>':'<p>Nenhum.</p>'}`);
}
function relatorioMedico(){
 const {start,end,d,c,m,e}=rangeData(),p=get(K.p)[0]||{};
 openReport('Resumo para consulta médica',`
 <div class="box"><b>Período:</b> ${start} a ${end}<br><b>Paciente:</b> ${esc(p.nome||'Não informado')}<br><b>Alergias:</b> ${esc(p.alerg||'Não informado')}<br><b>Condições já informadas:</b> ${esc(p.cond||'Não informado')}</div>
 <h2>🩺 Queixas e evolução</h2>${d.length?'<ul>'+d.map(x=>`<li>${x.data}: ${esc(x.local)}, intensidade ${x.int}/10, ${esc(x.tipo)}. Sintomas: ${esc(x.sint||'—')}. Gatilhos: ${esc(x.gatilho||'—')}</li>`).join('')+'</ul>':'<p>Nenhum sintoma registrado no período.</p>'}
 <h2>💊 Medicamentos registrados</h2>${m.length?'<ul>'+m.map(x=>`<li>${esc(x.nome)} — ${esc(x.dose||'')} — ${esc(x.freq||'')}</li>`).join('')+'</ul>':'<p>Nenhum.</p>'}
 <h2>🧪 Exames</h2>${e.length?'<ul>'+e.map(x=>`<li>${x.data}: ${esc(x.nome)} — ${esc(x.res||'')}</li>`).join('')+'</ul>':'<p>Nenhum.</p>'}
 <h2>💬 Perguntas para discutir</h2><ol><li>O que pode explicar a evolução dos sintomas registrados?</li><li>Há algum exame ou acompanhamento que deva ser considerado?</li><li>Quais sinais indicariam necessidade de retorno antes do previsto?</li></ol>`);
}
function relatorioSintomas(){let {start,end,d}=rangeData();openReport('Relatório de sintomas',`<p><b>Período:</b> ${start} a ${end}</p><table><tr><th>Data</th><th>Local</th><th>Intensidade</th><th>Tipo</th><th>Sintomas</th></tr>${d.map(x=>`<tr><td>${x.data}</td><td>${esc(x.local)}</td><td>${x.int}/10</td><td>${esc(x.tipo)}</td><td>${esc(x.sint||'')}</td></tr>`).join('')}</table>`) }
function relatorioMeds(){let {start,end,m}=rangeData();openReport('Relatório de medicamentos',`<p><b>Período:</b> ${start} a ${end}</p><table><tr><th>Nome</th><th>Dose</th><th>Frequência</th><th>Início</th><th>Fim</th></tr>${m.map(x=>`<tr><td>${esc(x.nome)}</td><td>${esc(x.dose||'')}</td><td>${esc(x.freq||'')}</td><td>${x.inicio||''}</td><td>${x.fim||''}</td></tr>`).join('')}</table>`) }
function relatorioExames(){let {start,end,e}=rangeData();openReport('Relatório de exames',`<p><b>Período:</b> ${start} a ${end}</p><table><tr><th>Data</th><th>Exame</th><th>Resultado</th><th>Observações</th></tr>${e.map(x=>`<tr><td>${x.data}</td><td>${esc(x.nome)}</td><td>${esc(x.res||'')}</td><td>${esc(x.obs||'')}</td></tr>`).join('')}</table>`) }
function relatorioConsultas(){let {start,end,c}=rangeData();openReport('Relatório de consultas',`<p><b>Período:</b> ${start} a ${end}</p><table><tr><th>Data</th><th>Especialidade</th><th>Médico</th><th>Motivo</th><th>Orientações</th></tr>${c.map(x=>`<tr><td>${x.data}</td><td>${esc(x.esp)}</td><td>${esc(x.med||'')}</td><td>${esc(x.mot||'')}</td><td>${esc(x.obs||'')}</td></tr>`).join('')}</table>`) }
function updateReportSummary(){
 if(!$('rResumo'))return;
 const {start,end,d,c,m,e}=rangeData();
 const comp=calcularCompletudeSaude();
 const ri=$('rSistemaInfo');
 if(ri)ri.innerHTML='<div class="alert safe"><b>🩺 Identificação do relatório</b><br>Versão do sistema: <b>V5.99</b> · Ficha preenchida: <b>'+comp.percentual+'%</b> ('+comp.preenchidos+'/'+comp.total+')</div>';
 const avg=d.length?(d.reduce((a,x)=>a+x.int,0)/d.length).toFixed(1):'—';
 $('rResumo').innerHTML=`<div class="grid4"><div><b>${d.length}</b><br><span class="muted">Sintomas</span></div><div><b>${c.length}</b><br><span class="muted">Consultas</span></div><div><b>${m.length}</b><br><span class="muted">Medicamentos</span></div><div><b>${e.length}</b><br><span class="muted">Exames</span></div></div><p style="margin-top:12px"><b>Intensidade média registrada:</b> ${avg}/10</p><p class="muted">Período: ${start} → ${end}</p>`;
}
function baixarBackup(){
 const data={version:4,createdAt:new Date().toISOString(),dores:get(K.d),consultas:get(K.c),medicamentos:get(K.m),exames:get(K.e),perfil:get(K.p),medidasCorporais:get(K.medidas)};
 const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
 const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='minha-saude-backup-'+new Date().toISOString().slice(0,10)+'.json';a.click();URL.revokeObjectURL(a.href);
}
function restaurarBackup(ev){
 const f=ev.target.files[0];if(!f)return;
 const reader=new FileReader();
 reader.onload=()=>{try{
  const x=JSON.parse(reader.result);
  if(!x||!Array.isArray(x.dores)||!Array.isArray(x.consultas)||!Array.isArray(x.medicamentos)||!Array.isArray(x.exames))throw new Error();
  if(!confirm('Restaurar este backup substituirá os dados atuais. Você fez um backup atual antes de continuar?'))return;
  set(K.d,x.dores);set(K.c,x.consultas);set(K.m,x.medicamentos);set(K.e,x.exames);set(K.p,Array.isArray(x.perfil)?x.perfil:[]);if(Array.isArray(x.medidasCorporais))set(K.medidas,x.medidasCorporais);
  render();alert('Backup restaurado com sucesso!');
 }catch(e){alert('Arquivo inválido ou incompatível.');}};
 reader.readAsText(f);ev.target.value='';
}
function csv(type){
 const maps={
 d:{k:K.d,name:'sintomas',head:['Data','Local','Intensidade','Tipo','Frequência','Gatilho','Sintomas','Observações'],row:x=>[x.data,x.local,x.int,x.tipo,x.freq,x.gatilho,x.sint,x.obs]},
 c:{k:K.c,name:'consultas',head:['Data','Especialidade','Médico','Motivo','Perguntas','Orientações','Retorno'],row:x=>[x.data,x.esp,x.med,x.mot,x.perg,x.obs,x.ret]},
 m:{k:K.m,name:'medicamentos',head:['Nome','Dose','Frequência','Início','Fim','Prescrito por','Observações'],row:x=>[x.nome,x.dose,x.freq,x.inicio,x.fim,x.pres,x.obs]},
 e:{k:K.e,name:'exames',head:['Data','Exame','Resultado','Observações'],row:x=>[x.data,x.nome,x.res,x.obs]}
 }[type];
 const rows=[maps.head,...get(maps.k).map(maps.row)];
 const csv=rows.map(r=>r.map(v=>`"${String(v??'').replace(/"/g,'""')}"`).join(';')).join('\n');
 const blob=new Blob(["\ufeff"+csv],{type:'text/csv;charset=utf-8'});
 const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=maps.name+'-'+new Date().toISOString().slice(0,10)+'.csv';a.click();
}
function salvarPin(){
 const a=$('pinNovo').value,b=$('pinConf').value;
 if(!/^\d{4,8}$/.test(a)||a!==b){alert('Use um PIN de 4 a 8 números e confirme corretamente.');return}
 localStorage.setItem('msa2_pin',a);alert('PIN ativado. Ao abrir novamente, o site solicitará o PIN.');updatePinStatus();
}
function removerPin(){if(!localStorage.getItem('msa2_pin'))return alert('Não há PIN ativo.');if(prompt('Digite o PIN atual para desativar:')===localStorage.getItem('msa2_pin')){localStorage.removeItem('msa2_pin');alert('PIN desativado.');updatePinStatus()}else alert('PIN incorreto.')}
function updatePinStatus(){if($('pinStatus'))$('pinStatus').textContent=localStorage.getItem('msa2_pin')?'🔒 PIN ativo neste navegador.':'🔓 PIN não configurado.'}
function apagarTudo(){
 if(!confirm('ATENÇÃO: isso apagará todos os registros deste navegador. Faça um backup antes. Continuar?'))return;
 if(prompt('Digite APAGAR para confirmar:')!=='APAGAR')return;
 [K.d,K.c,K.m,K.e,K.p].forEach(k=>localStorage.removeItem(k));render();alert('Dados apagados.');
}
const oldRender=render;
render=function(){oldRender();updateReportSummary();updatePinStatus();};
initReports();render();setTimeout(verificarNovaVersao,700);

