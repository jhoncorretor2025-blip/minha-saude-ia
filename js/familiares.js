/* Minha Saúde IA — módulo Familiares V5.87 */
(function(){
'use strict';
const K=window.MSA_K||window.K||{};
const storage=window.MSAStorage;
const KEY=K.familiares||'msa2_familiares',SELECTED='msa2_familiar_selecionado';
function getList(){try{const v=storage.get(KEY);return Array.isArray(v)?v:[]}catch(e){return[]}}
function saveList(v){try{return storage.set(KEY,Array.isArray(v)?v:[])}catch(e){return false}}
function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function uid(p){return p+'_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,8)}
function val(id){const x=document.getElementById(id);return x?(x.value||'').trim():''}
function fmtDate(x){if(!x)return'Não informada';const s=String(x).slice(0,10),m=s.match(/^(\d{4})-(\d{2})-(\d{2})$/);return m?m[3]+'/'+m[2]+'/'+m[1]:String(x)}
function selectedId(){try{return storage.get(SELECTED)||''}catch(e){return''}}
function setSelected(id){try{storage.set(SELECTED,id||'')}catch(e){}}
function findMember(id){return getList().find(x=>x.id===id)||null}
function ensure(p){p.medicamentos=Array.isArray(p.medicamentos)?p.medicamentos:[];p.consultas=Array.isArray(p.consultas)?p.consultas:[];p.crises=Array.isArray(p.crises)?p.crises:[];return p}
function renderFamiliares(){
 instalarEstilosFamiliaInteligente();
 instalarCampoLadoFamilia();
 const box=document.getElementById('familiares');if(!box||!box.classList.contains('active'))return;
 const list=getList();renderFamiliaInteligencia();let sel=findMember(selectedId());if(!sel&&list.length){sel=list[0];setSelected(sel.id)}if(sel)ensure(sel);
 const cards=document.getElementById('familiaresList');
 if(cards)cards.innerHTML=list.length?list.map(p=>'<button type="button" class="familiar-person-card '+(sel&&p.id===sel.id?'selected':'')+'" onclick="selecionarFamiliar(\''+esc(p.id)+'\')"><span class="familiar-person-icon">'+(p.sexo==='Feminino'?'👩':'👤')+'</span><span class="familiar-person-info"><b>'+esc(p.nome||'Sem nome')+'</b><small>'+esc(p.parentesco||'Parentesco não informado')+'</small><small>'+esc(p.condicao||'Condição não informada')+'</small></span><span class="familiar-person-count">'+(p.medicamentos||[]).length+' 💊<br>'+(p.consultas||[]).length+' 👨‍⚕️</span></button>').join(''):'<div class="empty">Nenhum familiar cadastrado ainda.</div>';
 const detail=document.getElementById('familiarDetalhe');if(!detail)return;
 if(!sel){detail.innerHTML='<div class="empty">👨‍👩‍👧‍👦 Selecione um familiar ou cadastre o primeiro acima.</div>';return}
 const meds=sel.medicamentos||[],cons=sel.consultas||[],crises=sel.crises||[];
 detail.innerHTML='<div class="familiar-detail-head"><div><div class="familiar-kicker">PESSOA ACOMPANHADA</div><h2>👤 '+esc(sel.nome||'Sem nome')+'</h2><div class="muted">'+esc(sel.parentesco||'Parentesco não informado')+(sel.idade?' · '+esc(sel.idade)+' anos':'')+'</div></div><div class="row"><button type="button" class="btn secondary small" onclick="copiarResumoFamiliar(\''+esc(sel.id)+'\')">📋 Copiar resumo</button><button type="button" class="btn small" onclick="perguntarIAFamiliar(\''+esc(sel.id)+'\')">🤖 Perguntar à IA</button><button type="button" class="btn red small" onclick="excluirFamiliar(\''+esc(sel.id)+'\')">🗑️ Excluir</button></div></div>'+
 '<div class="familiar-alert"><b>🧠 '+esc(sel.condicao||'Condição de saúde não informada')+'</b><br><span>'+esc(sel.obs||'Use esta área para organizar o cuidado.')+'</span></div>'+
 '<div class="familiar-summary-grid"><div><span>🎂 Nascimento</span><b>'+esc(fmtDate(sel.nasc))+'</b></div><div><span>🩸 Sangue</span><b>'+esc(sel.sangue||'Não informado')+'</b></div><div><span>🚨 Alergias</span><b>'+esc(sel.alergias||'Não informado')+'</b></div><div><span>📞 Contato</span><b>'+esc(sel.contato||'Não informado')+'</b></div></div>'+
 '<details style="margin-top:13px;border:1px solid #e3e8f0;border-radius:15px;padding:11px;background:#fbfdff"><summary style="cursor:pointer;font-weight:900">📦 Ver todos os dados importados da IA</summary><pre style="white-space:pre-wrap;word-break:break-word;background:#f8fafc;border:1px solid #e5eaf2;border-radius:12px;padding:12px;margin-top:10px;font-size:12px;line-height:1.45">'+esc(JSON.stringify(sel.dadosImportadosIA||sel,null,2))+'</pre></details>'+
 '<div class="familiar-grid">'+
 '<div class="card familiar-subcard"><h3>💊 Medicamentos</h3><div class="muted">Nome, dose, horário e observações.</div><form id="familiarMedForm" style="margin-top:10px"><div class="grid2"><label>Medicamento<input id="fMedNome" required></label><label>Dose<input id="fMedDose"></label></div><div class="grid2"><label>Horário<input id="fMedHora" type="time"></label><label>Frequência<input id="fMedFreq"></label></div><label>Prescrito por<input id="fMedPres"></label><label>Observações<textarea id="fMedObs"></textarea></label><button class="btn">💾 Adicionar medicamento</button></form><div class="list" style="margin-top:12px">'+(meds.length?meds.slice().reverse().map(x=>'<div class="item"><div class="itemtop"><b>💊 '+esc(x.nome)+'</b><button type="button" class="btn red small" onclick="excluirRegistroFamiliar(\''+esc(sel.id)+'\',\'medicamentos\',\''+esc(x.id)+'\')">Excluir</button></div><p>'+esc(x.dose||'Dose não informada')+(x.hora?' · '+esc(x.hora):'')+(x.frequencia?' · '+esc(x.frequencia):'')+'<br>'+esc(x.prescritoPor||'')+'<br>'+esc(x.obs||'')+'</p></div>').join(''):'<div class="empty">Nenhum medicamento registrado.</div>')+'</div></div>'+
 '<div class="card familiar-subcard"><h3>👨‍⚕️ Consultas</h3><div class="muted">Consultas, retornos e orientações.</div><form id="familiarConsultaForm" style="margin-top:10px"><div class="grid2"><label>Data<input id="fConData" type="date" required></label><label>Especialidade<input id="fConEsp" required></label></div><div class="grid2"><label>Médico<input id="fConMed"></label><label>Próximo retorno<input id="fConRet" type="date"></label></div><label>Motivo<textarea id="fConMot"></textarea></label><label>Orientações recebidas<textarea id="fConObs"></textarea></label><button class="btn">💾 Registrar consulta</button></form><div class="list" style="margin-top:12px">'+(cons.length?cons.slice().reverse().map(x=>'<div class="item"><div class="itemtop"><b>👨‍⚕️ '+esc(x.especialidade||'Consulta')+'</b><span class="tag">'+esc(fmtDate(x.data))+'</span></div><p>'+esc(x.medico||'Médico não informado')+'<br>'+esc(x.motivo||'')+(x.retorno?'<br>Retorno: '+esc(fmtDate(x.retorno)):'')+'<br>'+esc(x.obs||'')+'</p><button type="button" class="btn red small" onclick="excluirRegistroFamiliar(\''+esc(sel.id)+'\',\'consultas\',\''+esc(x.id)+'\')">Excluir</button></div>').join(''):'<div class="empty">Nenhuma consulta registrada.</div>')+'</div></div></div>'+
 '<div class="card familiar-subcard" style="margin-top:13px"><h3>🚨 Crises / intercorrências</h3><div class="muted">Registre objetivamente o que aconteceu, possíveis gatilhos e o atendimento realizado.</div><form id="familiarCriseForm" style="margin-top:10px"><div class="grid2"><label>Data<input id="fCriData" type="date" required></label><label>Hora<input id="fCriHora" type="time"></label></div><div class="grid2"><label>Tipo<select id="fCriTipo"><option>Alteração de comportamento</option><option>Agitação</option><option>Confusão</option><option>Esquecimento acentuado</option><option>Agressividade</option><option>Queda</option><option>Outro</option></select></label><label>Intensidade<select id="fCriInt"><option>Leve</option><option>Moderada</option><option>Intensa</option><option>Risco imediato</option></select></label></div><label>O que aconteceu?<textarea id="fCriDesc" required></textarea></label><label>Possível gatilho<input id="fCriGatilho"></label><label>Conduta / atendimento recebido<textarea id="fCriConduta"></textarea></label><button class="btn">💾 Registrar ocorrência</button></form><div class="list" style="margin-top:12px">'+(crises.length?crises.slice().reverse().map(x=>'<div class="item '+(x.intensidade==='Risco imediato'?'danger':'')+'"><div class="itemtop"><b>🚨 '+esc(x.tipo||'Ocorrência')+'</b><span class="tag">'+esc(fmtDate(x.data))+(x.hora?' · '+esc(x.hora):'')+'</span></div><p><b>Intensidade:</b> '+esc(x.intensidade||'Não informada')+'<br>'+esc(x.descricao||'')+(x.gatilho?'<br><b>Possível gatilho:</b> '+esc(x.gatilho):'')+(x.conduta?'<br><b>Conduta/atendimento:</b> '+esc(x.conduta):'')+'</p><button type="button" class="btn red small" onclick="excluirRegistroFamiliar(\''+esc(sel.id)+'\',\'crises\',\''+esc(x.id)+'\')">Excluir</button></div>').join(''):'<div class="empty">Nenhuma crise ou intercorrência registrada.</div>')+'</div></div>';
 bindForms(sel.id);
}
function bindForms(id){
 const m=document.getElementById('familiarMedForm');if(m)m.onsubmit=e=>{e.preventDefault();addRecord(id,'medicamentos',{nome:val('fMedNome'),dose:val('fMedDose'),hora:val('fMedHora'),frequencia:val('fMedFreq'),prescritoPor:val('fMedPres'),obs:val('fMedObs')})};
 const c=document.getElementById('familiarConsultaForm');if(c)c.onsubmit=e=>{e.preventDefault();addRecord(id,'consultas',{data:val('fConData'),especialidade:val('fConEsp'),medico:val('fConMed'),retorno:val('fConRet'),motivo:val('fConMot'),obs:val('fConObs')})};
 const cr=document.getElementById('familiarCriseForm');if(cr)cr.onsubmit=e=>{e.preventDefault();addRecord(id,'crises',{data:val('fCriData'),hora:val('fCriHora'),tipo:val('fCriTipo'),intensidade:val('fCriInt'),descricao:val('fCriDesc'),gatilho:val('fCriGatilho'),conduta:val('fCriConduta')})};
}
function addRecord(memberId,type,data){const list=getList(),p=list.find(x=>x.id===memberId);if(!p)return;ensure(p);p[type].push(Object.assign({id:uid(type.slice(0,3)),criadoEm:new Date().toISOString()},data));if(!saveList(list)){alert('Não foi possível salvar.');return}setSelected(memberId);renderFamiliares()}
window.selecionarFamiliar=id=>{setSelected(id);renderFamiliares();setTimeout(()=>document.getElementById('familiarDetalhe')?.scrollIntoView({behavior:'smooth',block:'start'}),50)};
window.excluirFamiliar=id=>{const p=findMember(id);if(!p)return;if(!confirm('Excluir '+(p.nome||'este familiar')+' e todos os registros dele?'))return;const list=getList().filter(x=>x.id!==id);saveList(list);if(selectedId()===id)setSelected(list[0]?.id||'');renderFamiliares()};
window.excluirRegistroFamiliar=(memberId,type,recordId)=>{const list=getList(),p=list.find(x=>x.id===memberId);if(!p)return;ensure(p);p[type]=p[type].filter(x=>x.id!==recordId);saveList(list);setSelected(memberId);renderFamiliares()};
window.copiarResumoFamiliar=id=>{const p=findMember(id);if(!p)return;ensure(p);const t=['RESUMO DO FAMILIAR','Nome: '+(p.nome||'Não informado'),'Parentesco: '+(p.parentesco||'Não informado'),'Idade: '+(p.idade||'Não informada'),'Condição: '+(p.condicao||'Não informada'),'Alergias: '+(p.alergias||'Não informadas'),'Medicamentos:',...(p.medicamentos.length?p.medicamentos.map(x=>'- '+x.nome+(x.dose?' — '+x.dose:'')+(x.frequencia?' — '+x.frequencia:'')):['- Nenhum registrado']),'Consultas:',...(p.consultas.length?p.consultas.map(x=>'- '+fmtDate(x.data)+' — '+(x.especialidade||'Consulta')+' — '+(x.medico||'Não informado')):['- Nenhuma registrada']),'Crises:',...(p.crises.length?p.crises.map(x=>'- '+fmtDate(x.data)+' — '+(x.tipo||'Ocorrência')+' — '+(x.intensidade||'')+' — '+(x.descricao||'')):['- Nenhuma registrada'])].join('\n');if(navigator.clipboard?.writeText)navigator.clipboard.writeText(t).then(()=>alert('📋 Resumo copiado.')).catch(()=>fallback(t));else fallback(t)};
window.perguntarIAFamiliar=id=>{const p=findMember(id);if(!p)return;ensure(p);const t=['COMANDO — PERGUNTAR À IA SOBRE ESTE FAMILIAR','','Atue como um assistente de saúde responsável. Analise EXCLUSIVAMENTE as informações deste familiar abaixo. Não invente dados, não faça diagnóstico e deixe claro quando uma informação estiver ausente.','','FAMILIAR','Nome: '+(p.nome||'Não informado'),'Parentesco: '+(p.parentesco||'Não informado'),'Sexo: '+(p.sexo||'Não informado'),'Nascimento: '+fmtDate(p.nasc),'Idade: '+(p.idade||'Não informada'),'Tipo sanguíneo: '+(p.sangue||'Não informado'),'Condição principal: '+(p.condicao||'Não informada'),'Alergias: '+(p.alergias||'Não informadas'),'Contato/responsável: '+(p.contato||'Não informado'),'Observações: '+(p.obs||'Não informadas'),'','MEDICAMENTOS:',...(p.medicamentos.length?p.medicamentos.map(x=>'- '+x.nome+(x.dose?' — dose: '+x.dose:'')+(x.hora?' — horário: '+x.hora:'')+(x.frequencia?' — frequência: '+x.frequencia:'')+(x.prescritoPor?' — prescrito por: '+x.prescritoPor:'')+(x.obs?' — '+x.obs:'')):['- Nenhum registrado']),'','CONSULTAS:',...(p.consultas.length?p.consultas.map(x=>'- '+fmtDate(x.data)+' — '+(x.especialidade||'Consulta')+(x.medico?' — médico: '+x.medico:'')+(x.retorno?' — retorno: '+fmtDate(x.retorno):'')+(x.motivo?' — motivo: '+x.motivo:'')+(x.obs?' — orientações: '+x.obs:'')):['- Nenhuma registrada']),'','CRISES / INTERCORRÊNCIAS:',...(p.crises.length?p.crises.map(x=>'- '+fmtDate(x.data)+(x.hora?' às '+x.hora:'')+' — '+(x.tipo||'Ocorrência')+' — intensidade: '+(x.intensidade||'não informada')+' — '+(x.descricao||'')+(x.gatilho?' — possível gatilho: '+x.gatilho:'')+(x.conduta?' — conduta/atendimento: '+x.conduta:'')):['- Nenhuma registrada']),'','TAREFA PARA A IA','1. Resuma o estado de saúde deste familiar de forma clara.','2. Destaque informações importantes que merecem atenção.','3. Aponte quais informações estão faltando ou precisam ser atualizadas.','4. Sugira perguntas úteis para levar ao médico, quando apropriado.','5. Se houver sinais de alerta nos dados registrados, destaque-os sem alarmismo e oriente procurar avaliação profissional.','6. Não misture informações do meu perfil ou de outros familiares.'].join('\\n');if(navigator.clipboard?.writeText)navigator.clipboard.writeText(t).then(()=>alert('🤖 Comando do familiar copiado. Agora é só colar na IA.')).catch(()=>fallbackIAFamiliar(t));else fallbackIAFamiliar(t)};
function fallbackIAFamiliar(t){const a=document.createElement('textarea');a.value=t;document.body.appendChild(a);a.select();try{document.execCommand('copy');alert('🤖 Comando do familiar copiado. Agora é só colar na IA.')}catch(e){}a.remove()}
function fallback(t){const a=document.createElement('textarea');a.value=t;document.body.appendChild(a);a.select();try{document.execCommand('copy');alert('📋 Resumo copiado.')}catch(e){}a.remove()}
/* V5.87 — Inteligência Familiar: Ava + mapa + padrões */
function familiaArray(){const a=getList();return Array.isArray(a)?a.map(ensure):[]}
function familiaCondicaoTexto(p){return String(p.condicao||'').trim()}
function familiaLado(p){if(p.ladoFamilia)return p.ladoFamilia;const s=(String(p.parentesco||'')+' '+String(p.obs||'')).toLowerCase();if(/materna|materno/.test(s))return 'Materno';if(/paterna|paterno/.test(s))return 'Paterno';return 'Não informado'}
function familiaIdade(p){if(p.idade!==undefined&&p.idade!==null&&String(p.idade).trim()!=='')return String(p.idade);if(p.nasc){const n=new Date(String(p.nasc).slice(0,10)+'T12:00:00'),h=new Date();if(!isNaN(n.getTime())){let a=h.getFullYear()-n.getFullYear();if((h.getMonth()+1)*100+h.getDate()<(n.getMonth()+1)*100+n.getDate())a--;return String(Math.max(0,a))}}return ''}
function familiaPatterns(list){const defs=[['Diabetes',/\bdiabet(?:e|es|ica|ico|icos|icas)\b/i],['Hipertensão',/\bhipertens(?:ão|ao|ivo|iva|ivos|ivas)\b/i],['Doenças cardíacas',/\b(infarto|cardíac|coronar|insufici[eê]ncia card|angina)\b/i],['AVC',/\b(avc|acidente vascular cerebral|derrame)\b/i],['Câncer',/\b(câncer|cancer|tumor|neoplas)\b/i],['Colesterol',/\b(colesterol|dislipidem)\b/i],['Tireoide',/\b(tireoide|hipotireoid|hipertireoid)\b/i],['Doença renal',/\b(renal|rim|insufici[eê]ncia renal)\b/i],['Doença hepática',/\b(fígado|figado|hepat|cirrose)\b/i],['Autoimune / reumatológica',/\b(autoimun|artrite|lúpus|lupus|psorías|psorias|espondil|reumat)\b/i],['Demência / Alzheimer',/\b(demência|demencia|alzheimer|parkinson)\b/i],['Saúde mental',/\b(depress[aã]o|ansiedade|bipolar|esquizofren|transtorno mental)\b/i]];return defs.map(d=>{const members=list.filter(p=>d[1].test(familiaCondicaoTexto(p)+' '+String(p.obs||'')));return {nome:d[0],count:members.length,members}}).filter(x=>x.count>0).sort((a,b)=>b.count-a.count||a.nome.localeCompare(b.nome))}
function familiaMapaHTML(list){const groups={Materno:[],Paterno:[],'Núcleo próximo':[],'Não informado':[]};list.forEach(p=>{const l=familiaLado(p);groups[l==='Materno'?'Materno':l==='Paterno'?'Paterno':(['Pai','Mãe','Filho(a)','Filho/filha','Irmão/irmã','Marido','Esposa','Companheiro(a)'].includes(p.parentesco)?'Núcleo próximo':'Não informado')].push(p)});const group=(title,icon,arr)=>'<div class="msa-fam-map-group"><div class="msa-fam-map-title">'+icon+' '+title+' <span>'+arr.length+'</span></div>'+(arr.length?'<div class="msa-fam-map-list">'+arr.map(p=>{const c=familiaCondicaoTexto(p)||'Sem condição informada',med=(p.medicamentos||[]).length,con=(p.consultas||[]).length;return '<button type="button" class="msa-fam-map-person" onclick="selecionarFamiliar(\''+esc(p.id)+'\')"><span class="msa-fam-avatar">'+(p.sexo==='Feminino'?'👩':'👤')+'</span><span><b>'+esc(p.nome||'Sem nome')+'</b><small>'+esc(p.parentesco||'Parentesco não informado')+'</small><em>'+esc(c)+'</em><small>'+med+' 💊 · '+con+' 👨‍⚕️</small></span></button>'}).join('')+'</div>':'<div class="msa-fam-empty">Nenhum familiar neste grupo.</div>')+'</div>';const total=list.length,withCond=list.filter(p=>familiaCondicaoTexto(p)).length,withData=list.filter(p=>familiaCondicaoTexto(p)||p.alergias||p.sangue||p.obs).length;return '<div class="msa-fam-map-card"><div class="msa-fam-map-head"><div><div class="msa-fam-kicker">MAPA DE SAÚDE DA FAMÍLIA</div><h3>🧬 Quem está no seu histórico?</h3><p>Uma visão rápida dos familiares registrados e das informações de saúde já conhecidas.</p></div><button type="button" class="btn secondary small" onclick="iniciarEntrevistaAvaFamilia()">🤖 Falar com a Ava</button></div><div class="msa-fam-map-stats"><div><b>'+total+'</b><span>familiares</span></div><div><b>'+withCond+'</b><span>com condição</span></div><div><b>'+Math.max(0,total-withData)+'</b><span>com poucos dados</span></div></div><div class="msa-fam-map-tree"><div class="msa-fam-you">👤 <b>Você</b><small>perfil principal</small></div>'+group('Lado materno','🌷',groups.Materno)+group('Lado paterno','🧭',groups.Paterno)+group('Núcleo próximo','🏠',groups['Núcleo próximo'])+group('Lado não informado','❔',groups['Não informado'])+'</div></div>'}
function familiaAnaliseHTML(list){const patterns=familiaPatterns(list),relevant=patterns.filter(x=>x.count>=2),missing=list.filter(p=>!familiaCondicaoTexto(p)||!p.sangue||!familiaIdade(p)).length;let body='';if(patterns.length){body='<div class="msa-fam-patterns">'+patterns.slice(0,8).map(x=>'<div class="msa-fam-pattern"><div><b>'+esc(x.nome)+'</b><small>'+x.count+' familiar'+(x.count===1?'':'es')+'</small></div><div class="msa-fam-members">'+x.members.map(p=>'<button type="button" onclick="selecionarFamiliar(\''+esc(p.id)+'\')">'+esc(p.nome||'Sem nome')+'</button>').join('')+'</div></div>').join('')+'</div>'}else body='<div class="msa-fam-empty">Ainda não há condições suficientes registradas para encontrar padrões.</div>';return '<div class="msa-fam-analysis-card"><div class="msa-fam-kicker">ANÁLISE DO HISTÓRICO</div><h3>📊 Padrões familiares registrados</h3><p>O sistema agrupa informações que você registrou. Isso não significa que você terá a mesma condição.</p><div class="msa-fam-analysis-kpis"><div><b>'+relevant.length+'</b><span>padrões repetidos</span></div><div><b>'+patterns.length+'</b><span>categorias encontradas</span></div><div><b>'+missing+'</b><span>fichas com dados faltantes</span></div></div>'+body+'<div class="alert warn" style="margin-top:10px">⚠️ Esta análise é apenas organizacional. Histórico familiar não é diagnóstico nem previsão individual de risco.</div></div>'}

function dadosFamiliaParaIA(){
 const historico=(window.MSAStorage?.get(K.fam)||[]); 
 const familiares=familiaArray();
 return {
  historico:Array.isArray(historico)?historico:[],
  familiares:Array.isArray(familiares)?familiares:[]
 };
}
function gerarPromptCompletoFamilia(pergunta){
 const d=dadosFamiliaParaIA();
 const lines=[
  'PROMPT — HISTÓRICO FAMILIAR E GENÉTICA',
  '',
  'Você é um assistente especializado em organizar e analisar informações de saúde da família.',
  'Analise EXCLUSIVAMENTE os dados familiares abaixo.',
  'Não misture informações do meu perfil pessoal, sintomas, medicamentos, exames ou outros dados que não pertençam à família.',
  'Não invente informações. Quando um dado não estiver informado, diga que não foi informado.',
  'Não faça diagnóstico e não afirme que uma condição será herdada. Diferencie histórico familiar, possibilidade e diagnóstico.',
  '',
  'PERGUNTA:',
  String(pergunta||'Faça uma análise geral do histórico familiar, destacando padrões, informações relevantes e perguntas úteis para levar ao médico.'),
  '',
  '=== HISTÓRICO FAMILIAR / ANTECEDENTES ==='
 ];
 if(d.historico.length){
  d.historico.forEach((x,i)=>{
   lines.push(
    'Registro '+(i+1)+':',
    '- Parente: '+(x.parente||'Não informado'),
    '- Condição: '+(x.condicao||x.info||'Não informado'),
    '- Idade ao diagnóstico: '+(x.idade||'Não informada'),
    '- Observação: '+(x.obs||'Não informada'),
    ''
   );
  });
 }else lines.push('- Nenhum antecedente familiar cadastrado.','');
 lines.push('=== FAMILIARES CADASTRADOS ===');
 if(d.familiares.length){
  d.familiares.forEach((p,i)=>{
   lines.push(
    'Familiar '+(i+1)+':',
    '- Nome: '+(p.nome||'Não informado'),
    '- Parentesco: '+(p.parentesco||'Não informado'),
    '- Sexo: '+(p.sexo||'Não informado'),
    '- Data de nascimento: '+(p.nasc||'Não informada'),
    '- Idade: '+(p.idade||'Não informada'),
    '- Lado da família: '+(p.ladoFamilia||'Não informado'),
    '- Condição principal: '+(p.condicao||'Não informada'),
    '- Alergias: '+(p.alergias||'Não informadas'),
    '- Tipo sanguíneo: '+(p.sangue||'Não informado'),
    '- Contato/responsável: '+(p.contato||'Não informado'),
    '- Observações: '+(p.obs||'Não informadas')
   );
   const meds=Array.isArray(p.medicamentos)?p.medicamentos:[];
   const cons=Array.isArray(p.consultas)?p.consultas:[];
   const crises=Array.isArray(p.crises)?p.crises:[];
   if(meds.length){
    lines.push('- Medicamentos:');
    meds.forEach(m=>lines.push('  • '+(m.nome||'Não informado')+(m.dose?' — dose: '+m.dose:'')+(m.hora?' — horário: '+m.hora:'')+(m.frequencia?' — frequência: '+m.frequencia:'')+(m.prescritoPor?' — prescrito por: '+m.prescritoPor:'')+(m.obs?' — '+m.obs:'')));
   }else lines.push('- Medicamentos: Nenhum registrado.');
   if(cons.length){
    lines.push('- Consultas:');
    cons.forEach(x=>lines.push('  • '+(x.data||'Data não informada')+' — '+(x.especialidade||'Consulta')+(x.medico?' — médico: '+x.medico:'')+(x.retorno?' — retorno: '+x.retorno:'')+(x.motivo?' — motivo: '+x.motivo:'')+(x.obs?' — orientações: '+x.obs:'')));
   }else lines.push('- Consultas: Nenhuma registrada.');
   if(crises.length){
    lines.push('- Crises/intercorrências:');
    crises.forEach(x=>lines.push('  • '+(x.data||'Data não informada')+(x.hora?' '+x.hora:'')+' — '+(x.tipo||'Ocorrência')+' — intensidade: '+(x.intensidade||'não informada')+' — '+(x.descricao||'')+(x.gatilho?' — gatilho: '+x.gatilho:'')+(x.conduta?' — conduta: '+x.conduta:'')));
   }else lines.push('- Crises/intercorrências: Nenhuma registrada.');
   lines.push('');
  });
 }else lines.push('- Nenhum familiar cadastrado.','');
 lines.push(
  '=== COMO RESPONDER ===',
  '1. Responda primeiro à pergunta solicitada.',
  '2. Depois organize os principais padrões encontrados no histórico familiar.',
  '3. Destaque informações que podem ser úteis para uma conversa com um profissional de saúde.',
  '4. Aponte dados familiares que ainda estão faltando ou precisam ser confirmados.',
  '5. Não transforme histórico familiar em diagnóstico ou previsão individual.',
  '',
  '=== FORMATO OBRIGATÓRIO PARA IMPORTAÇÃO ===',
  'Depois da análise, gere um JSON válido dentro de um bloco ```json. O JSON deve conter o array "familiares".',
  'Para cada familiar, preserve todas as informações disponíveis: nome, parentesco, sexo, data_nascimento, idade, ladoFamilia, condicao, alergias, tipo_sanguineo, contato, obs, idadeDiagnostico, certeza, medicamentos, consultas e crises.',
  'Cada medicamento deve preservar nome, dose, horario, frequencia, prescrito_por e obs.',
  'Cada consulta deve preservar data, especialidade, medico, retorno, motivo e obs.',
  'Cada crise deve preservar data, hora, tipo, intensidade, descricao, gatilho e conduta.',
  'Não omita informações existentes no contexto e não invente valores. Use "" ou [] quando um dado não existir.',
  'Exemplo: {"familiares":[{"nome":"Maria","parentesco":"Mãe","idade":"","ladoFamilia":"Materno","condicao":"","medicamentos":[],"consultas":[],"crises":[],"obs":""}],"historico_familiar":[]}',
  'O JSON deve aparecer no final da resposta para ser importado pelo Minha Saúde IA.'
 );
 return lines.join('\n');
}
function copiarTextoFamiliaIA(txt,okMsg){
 const done=()=>alert(okMsg||'📋 Prompt familiar copiado. Agora você pode colar na IA.');
 if(navigator.clipboard?.writeText)navigator.clipboard.writeText(txt).then(done).catch(()=>fallbackIAFamiliar(txt));
 else fallbackIAFamiliar(txt);
}
function abrirPromptFamiliaIA(){
 const pergunta='Faça uma análise geral do histórico familiar, destacando padrões, informações relevantes e perguntas úteis para levar ao médico.';
 let old=document.getElementById('msaFamiliaIAPromptModal');if(old)old.remove();
 const modal=document.createElement('div');modal.id='msaFamiliaIAPromptModal';modal.className='msa-ava-overlay';
 modal.innerHTML='<div class="msa-ava-dialog" role="dialog" aria-modal="true" aria-labelledby="msaFamiliaIATitle">'+
  '<div class="msa-ava-top"><div><div class="msa-fam-kicker">🤖 IA · FAMÍLIA</div><h2 id="msaFamiliaIATitle">Perguntar para IA sobre a família</h2><p>O prompt abaixo usa somente as informações cadastradas em Histórico Familiar e Familiares.</p></div><button type="button" class="msa-ava-close" id="msaFamiliaIAClose">✕</button></div>'+
  '<label class="msa-ava-field">❓ O que você quer perguntar?<textarea id="msaFamiliaIAPergunta" style="margin-top:7px;min-height:90px" placeholder="Ex.: Existe algum padrão de doenças que aparece em mais de uma geração?">'+esc(pergunta)+'</textarea></label>'+
  '<label class="msa-ava-field">📋 Prompt completo<textarea id="msaFamiliaIATexto" readonly style="margin-top:7px;min-height:260px;font-size:12px;line-height:1.4"></textarea></label>'+
  '<div class="msa-ava-actions" style="display:grid;grid-template-columns:1fr 1fr"><button type="button" class="btn green" id="msaFamiliaIACopiar">📋 Copiar prompt</button><button type="button" class="btn" id="msaFamiliaIAChatGPT">🟢 Copiar e abrir ChatGPT</button><button type="button" class="btn secondary" id="msaFamiliaIAGemini">🔵 Copiar e abrir Gemini</button><button type="button" class="btn secondary" id="msaFamiliaIAImportar">📥 Colar resposta da IA</button><button type="button" class="btn secondary" id="msaFamiliaIAFechar">↩️ Voltar</button></div>'+
  '<div class="alert safe" style="margin-top:12px">🔒 Nada é enviado automaticamente. Você decide quando copiar e compartilhar essas informações.</div>'+
  '</div>';
 document.body.appendChild(modal);
 const textarea=modal.querySelector('#msaFamiliaIAPergunta'),out=modal.querySelector('#msaFamiliaIATexto');
 const atualizar=()=>{out.value=gerarPromptCompletoFamilia(textarea.value)};
 atualizar();
 textarea.addEventListener('input',atualizar);
 const fechar=()=>modal.remove();
 modal.querySelector('#msaFamiliaIAClose').onclick=fechar;
 modal.querySelector('#msaFamiliaIAFechar').onclick=fechar;
 modal.addEventListener('click',e=>{if(e.target===modal)fechar()});
 modal.querySelector('#msaFamiliaIACopiar').onclick=()=>copiarTextoFamiliaIA(out.value);
 modal.querySelector('#msaFamiliaIAImportar').onclick=()=>{fechar();abrirImportadorRespostaFamilia()}; modal.querySelector('#msaFamiliaIAChatGPT').onclick=()=>{
   const txt=out.value;copiarTextoFamiliaIA(txt,'✅ Prompt copiado. Abrindo o ChatGPT…');
   window.open('https://chatgpt.com/?q='+encodeURIComponent(txt),'_blank');
 };
 modal.querySelector('#msaFamiliaIAGemini').onclick=()=>{
   const txt=out.value;copiarTextoFamiliaIA(txt,'✅ Prompt copiado. Abrindo o Gemini…');
   window.open('https://gemini.google.com/app','_blank');
 };
 textarea.focus();
}
window.abrirPromptFamiliaIA=abrirPromptFamiliaIA;

function normalizarTextoIA(v){return String(v==null?'':v).trim()}
function extrairJSONFamilia(raw){
 const txt=normalizarTextoIA(raw).replace(/^\uFEFF/,'');
 const bloco=txt.replace(/^\`\`\`(?:json)?\s*/i,'').replace(/\s*\`\`\`$/,'').trim();
 try{return JSON.parse(bloco)}catch(e){}
 const i=bloco.indexOf('{'),j=bloco.lastIndexOf('}');
 if(i>=0&&j>i){try{return JSON.parse(bloco.slice(i,j+1))}catch(e){}}
 const a=bloco.indexOf('['),b=bloco.lastIndexOf(']');
 if(a>=0&&b>a){try{return JSON.parse(bloco.slice(a,b+1))}catch(e){}}
 throw new Error('Não encontrei um JSON válido na resposta da IA.');
}
function arrFam(v){return Array.isArray(v)?v:[]}
function normalizarFamiliarImportado(src){
 const p=src&&typeof src==='object'?src:{};
 const nome=normalizarTextoIA(p.nome||p.NOME);
 if(!nome)return null;
 const meds=arrFam(p.medicamentos||p.MEDICAMENTOS).map(m=>({
  id:uid('fmed'),nome:normalizarTextoIA(m&& (m.nome||m.NOME||m.medicamento)),
  dose:normalizarTextoIA(m&& (m.dose||m.DOSE)),hora:normalizarTextoIA(m&& (m.hora||m.HORARIO)),
  frequencia:normalizarTextoIA(m&& (m.frequencia||m.FREQUENCIA||m.freq)),
  prescritoPor:normalizarTextoIA(m&& (m.prescritoPor||m.PRESCRITO_POR||m.prescrito_por)),
  obs:normalizarTextoIA(m&& (m.obs||m.OBS))
 })).filter(function(x){return x.nome});
 const cons=arrFam(p.consultas||p.CONSULTAS).map(function(x){return {
  id:uid('fcon'),data:normalizarTextoIA(x&& (x.data||x.DATA)),
  especialidade:normalizarTextoIA(x&& (x.especialidade||x.ESPECIALIDADE)),
  medico:normalizarTextoIA(x&& (x.medico||x.MEDICO)),retorno:normalizarTextoIA(x&& (x.retorno||x.RETORNO)),
  motivo:normalizarTextoIA(x&& (x.motivo||x.MOTIVO)),obs:normalizarTextoIA(x&& (x.obs||x.OBS||x.orientacoes))
 }}).filter(function(x){return x.data||x.especialidade||x.medico||x.motivo||x.obs});
 const crises=arrFam(p.crises||p.CRISES).map(function(x){return {
  id:uid('fcrise'),data:normalizarTextoIA(x&& (x.data||x.DATA)),hora:normalizarTextoIA(x&& (x.hora||x.HORA)),
  tipo:normalizarTextoIA(x&& (x.tipo||x.TIPO)),intensidade:normalizarTextoIA(x&& (x.intensidade||x.INTENSIDADE)),
  descricao:normalizarTextoIA(x&& (x.descricao||x.DESCRICAO||x.o_que_aconteceu)),
  gatilho:normalizarTextoIA(x&& (x.gatilho||x.GATILHO)),conduta:normalizarTextoIA(x&& (x.conduta||x.CONDUTA))
 }}).filter(function(x){return x.data||x.tipo||x.descricao});
 const obs=[];
 const baseObs=normalizarTextoIA(p.obs||p.OBS);if(baseObs)obs.push(baseObs);
 const idadeDiag=normalizarTextoIA(p.idadeDiagnostico||p.IDADE_DIAGNOSTICO);if(idadeDiag)obs.push('Idade aproximada ao diagnóstico: '+idadeDiag+' anos');
 const certeza=normalizarTextoIA(p.certeza||p.CERTEZA);if(certeza)obs.push('Nível de confiança: '+certeza);
 return {
  id:normalizarTextoIA(p.id)||uid('fam'),nome:nome,
  parentesco:normalizarTextoIA(p.parentesco||p.PARENTESCO)||'Outro',
  sexo:normalizarTextoIA(p.sexo||p.SEXO),nasc:normalizarTextoIA(p.nasc||p.NASC||p.data_nascimento||p.DATA_NASCIMENTO),
  idade:normalizarTextoIA(p.idade||p.IDADE),condicao:normalizarTextoIA(p.condicao||p.CONDICAO),
  alergias:normalizarTextoIA(p.alergias||p.ALERGIAS),sangue:normalizarTextoIA(p.sangue||p.SANGUE||p.tipo_sanguineo||p.TIPO_SANGUINEO),
  contato:normalizarTextoIA(p.contato||p.CONTATO),obs:obs.join(' '),
  ladoFamilia:normalizarTextoIA(p.ladoFamilia||p.LADO_FAMILIA),criadoEm:normalizarTextoIA(p.criadoEm)||new Date().toISOString(),
  medicamentos:meds,consultas:cons,crises:crises,dadosImportadosIA:p
 };
}
function salvarImportacaoFamilia(dados){
 const raiz=dados&&typeof dados==='object'&&!Array.isArray(dados)?dados:{familiares:dados};
 const entrada=arrFam(raiz.familiares||raiz.FAMILIARES||raiz.family||raiz.members);
 const importados=entrada.map(normalizarFamiliarImportado).filter(Boolean);
 if(!importados.length)throw new Error('Nenhum familiar válido encontrado na resposta da IA.');
 const atuais=getList();let novos=0,atualizados=0;
 importados.forEach(function(novo){
  const chave=(String(novo.nome)+'|'+String(novo.parentesco)).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  const idx=atuais.findIndex(function(x){
   const k=(String(x.nome||'')+'|'+String(x.parentesco||'')).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
   return k===chave;
  });
  if(idx>=0){
   const antigo=ensure(atuais[idx]);
   atuais[idx]=Object.assign({},antigo,novo,{id:antigo.id,
    medicamentos:novo.medicamentos.length?novo.medicamentos:antigo.medicamentos,
    consultas:novo.consultas.length?novo.consultas:antigo.consultas,
    crises:novo.crises.length?novo.crises:antigo.crises});
   novos+=0;atualizados++;
  }else{atuais.push(ensure(novo));novos++}
 });
 if(!saveList(atuais))throw new Error('Não foi possível gravar os familiares neste navegador.');
 const antecedentes=arrFam(raiz.historico_familiar||raiz.HISTORICO_FAMILIAR||raiz.antecedentes);
 if(antecedentes.length){
  const hist=window.MSAStorage&&window.MSAStorage.get?window.MSAStorage.get(K.fam):[];
  const h=Array.isArray(hist)?hist:[];
  antecedentes.forEach(function(a){
   const par=normalizarTextoIA(a&& (a.parente||a.parentesco||a.PARENTE||a.PARENTESCO))||'Outro';
   const cond=normalizarTextoIA(a&& (a.cond||a.condicao||a.CONDICAO||a.info||a.INFORMACAO));if(!cond)return;
   const idade=normalizarTextoIA(a&& (a.idade||a.IDADE)),obs=normalizarTextoIA(a&& (a.obs||a.OBS));
   const dup=h.some(function(x){return String(x.parente||'').toLowerCase()===par.toLowerCase()&&String(x.info||x.cond||'').toLowerCase()===cond.toLowerCase()&&String(x.idade||'')===idade});
   if(!dup)h.push({parente:par,cond:cond,info:cond,idade:idade,obs:obs});
  });
  if(window.MSAStorage&&window.MSAStorage.set)window.MSAStorage.set(K.fam,h);
 }
 setSelected(importados[0].id);renderFamiliares();
 return {novos:novos,atualizados:atualizados,total:importados.length};
}
function abrirImportadorRespostaFamilia(){
 let old=document.getElementById('msaFamiliaIAImportModal');if(old)old.remove();
 const modal=document.createElement('div');modal.id='msaFamiliaIAImportModal';modal.className='msa-ava-overlay';
 modal.innerHTML='<div class="msa-ava-dialog" role="dialog" aria-modal="true" aria-labelledby="msaFamiliaIAImportTitle">'+
 '<div class="msa-ava-top"><div><div class="msa-fam-kicker">📥 IA · FAMÍLIA</div><h2 id="msaFamiliaIAImportTitle">Colar resposta da IA</h2><p>Cole aqui a resposta gerada pelo ChatGPT, Gemini ou outra IA a partir do prompt da Família.</p></div><button type="button" class="msa-ava-close" id="msaFamiliaIAImportClose">✕</button></div>'+
 '<textarea id="msaFamiliaIAImportText" style="margin-top:14px;width:100%;min-height:330px;padding:13px;border:1px solid #d6deea;border-radius:14px;font-size:13px;line-height:1.45" placeholder="Cole aqui a resposta da IA..."></textarea>'+
 '<div class="msa-ava-actions" style="display:grid;grid-template-columns:1fr 1fr"><button type="button" class="btn secondary" id="msaFamiliaIAImportPaste">📋 Colar da área de transferência</button><button type="button" class="btn green" id="msaFamiliaIAImportSave">✅ Importar e salvar</button><button type="button" class="btn secondary" id="msaFamiliaIAImportGo">➡️ Ir para Familiares</button><button type="button" class="btn secondary" id="msaFamiliaIAImportCancel">↩️ Voltar</button></div>'+
 '<div id="msaFamiliaIAImportStatus" class="alert safe" style="margin-top:12px">Os dados só serão gravados depois de você clicar em “Importar e salvar”.</div></div>';
 document.body.appendChild(modal);
 const input=modal.querySelector('#msaFamiliaIAImportText'),status=modal.querySelector('#msaFamiliaIAImportStatus'),fechar=function(){modal.remove()};
 modal.querySelector('#msaFamiliaIAImportClose').onclick=fechar;modal.querySelector('#msaFamiliaIAImportCancel').onclick=fechar;
 modal.addEventListener('click',function(e){if(e.target===modal)fechar()});
 modal.querySelector('#msaFamiliaIAImportPaste').onclick=async function(){
  try{
   const t=await navigator.clipboard.readText();
   if(t){input.value=t;status.textContent='✅ Resposta colada da área de transferência. Confira antes de importar.'}
   else status.textContent='A área de transferência está vazia.';
  }catch(e){input.focus();status.textContent='Toque no campo e use Ctrl+V (ou Colar) para inserir a resposta.'}
 };
 modal.querySelector('#msaFamiliaIAImportSave').onclick=function(){
  try{
   const raw=input.value.trim();if(!raw)throw new Error('Cole primeiro a resposta da IA.');
   const dados=extrairJSONFamilia(raw),res=salvarImportacaoFamilia(dados);
   status.className='alert safe';status.innerHTML='✅ <b>Família importada!</b> '+res.total+' familiar(es): '+res.novos+' novo(s) e '+res.atualizados+' atualizado(s).';
   setTimeout(function(){fechar();if(typeof go==='function')go('familiares');setTimeout(function(){renderFamiliares();document.getElementById('familiares')&&document.getElementById('familiares').scrollIntoView({behavior:'smooth',block:'start'})},120)},250);
  }catch(e){status.className='alert danger';status.textContent='❌ '+(e.message||'Não foi possível importar a resposta.')}
 };
 modal.querySelector('#msaFamiliaIAImportGo').onclick=function(){fechar();if(typeof go==='function')go('familiares');setTimeout(renderFamiliares,100)};
 input.focus();
}
window.abrirImportadorRespostaFamilia=abrirImportadorRespostaFamilia;
function renderFamiliaInteligencia(){const box=document.getElementById('familiares');if(!box)return;const host=box.querySelector('.card');if(!host)return;let hub=document.getElementById('familiaInteligencia');if(!hub){hub=document.createElement('div');hub.id='familiaInteligencia';host.insertBefore(hub,host.firstChild)}const list=familiaArray();hub.innerHTML='<div class="msa-fam-actions"><button type="button" class="msa-fam-action primary" onclick="iniciarEntrevistaAvaFamilia()"><strong>🤖</strong><span>Adicionar com a Ava</span><small>Ela faz perguntas uma por vez.</small></button><button type="button" class="msa-fam-action" onclick="document.getElementById(\'msa-fam-map\')?.scrollIntoView({behavior:\'smooth\',block:\'start\'})"><strong>🧬</strong><span>Ver mapa da família</span><small>Materno, paterno e núcleo próximo.</small></button><button type="button" class="msa-fam-action" onclick="document.getElementById(\'msa-fam-analysis\')?.scrollIntoView({behavior:\'smooth\',block:\'start\'})"><strong>📊</strong><span>Ver padrões</span><small>Condições que aparecem mais de uma vez.</small></button></div><div id="msa-fam-map" class="msa-fam-anchor">'+familiaMapaHTML(list)+'</div><div id="msa-fam-analysis" class="msa-fam-anchor">'+familiaAnaliseHTML(list)+'</div>'}
function instalarCampoLadoFamilia(){const form=document.getElementById('familiarForm');if(!form||document.getElementById('fLadoFamilia'))return;const wrap=document.createElement('label');wrap.innerHTML='🧬 Lado da família<select id="fLadoFamilia"><option value="">Não informado</option><option>Materno</option><option>Paterno</option><option>Ambos / não sei</option></select>';const alvo=document.getElementById('fCondicao');if(alvo&&alvo.parentElement)alvo.parentElement.parentElement.insertBefore(wrap,alvo.parentElement);else form.appendChild(wrap)}
const avaQuestions=[{key:'nome',title:'Quem é esse familiar?',help:'Digite o nome da pessoa que você quer adicionar.',type:'text',placeholder:'Ex.: Maria'},{key:'parentesco',title:'Qual é o parentesco?',help:'Ava vai usar isso para organizar o mapa da família.',type:'select',options:['Pai','Mãe','Irmão/irmã','Filho(a)','Avô/avó','Tio/tia','Marido','Esposa','Companheiro(a)','Outro']},{key:'sexo',title:'Qual é o sexo?',help:'Pode deixar como “Não informado” se preferir.',type:'select',options:['Não informado','Masculino','Feminino','Outro']},{key:'idade',title:'Qual é a idade aproximada?',help:'Pode informar apenas uma estimativa.',type:'number',placeholder:'Ex.: 68'},{key:'ladoFamilia',title:'De qual lado da família?',help:'Isso ajuda a organizar o mapa em materno e paterno.',type:'select',options:['Não informado','Materno','Paterno','Ambos / não sei']},{key:'condicao',title:'Ele(a) tem alguma doença ou condição diagnosticada?',help:'Informe somente o que você sabe. Pode escrever várias.',type:'text',placeholder:'Ex.: diabetes e hipertensão'},{key:'idadeDiagnostico',title:'Você sabe com que idade foi diagnosticada?',help:'Pode deixar em branco ou informar uma idade aproximada.',type:'number',placeholder:'Ex.: 55'},{key:'recorrencia',title:'Essa condição aparece em outros familiares?',help:'Ex.: “sim, em duas tias” ou “não sei”.',type:'text',placeholder:'Ex.: Sim, em duas tias'},{key:'certeza',title:'Quanto você confia nessa informação?',help:'Diferencie o que foi confirmado do que é apenas lembrança familiar.',type:'select',options:['Confirmado por profissional','Informado pela família','Suspeita / não confirmado','Não sei']},{key:'obs',title:'Existe mais alguma informação importante?',help:'Cirurgias, infarto, AVC, câncer, internações ou outras observações.',type:'text',placeholder:'Pode deixar em branco'}];
function fecharAvaFamilia(){const m=document.getElementById('msaAvaFamiliaModal');if(m)m.remove();window.__msaAvaFam=null}
function renderAvaFamilia(){let m=document.getElementById('msaAvaFamiliaModal');if(!m)return;const st=window.__msaAvaFam||{step:0,data:{}},q=avaQuestions[st.step],d=st.data||{},val0=d[q.key]??'';let field='';if(q.type==='select')field='<select id="msaAvaFamInput">'+q.options.map(o=>'<option '+(String(o)===String(val0)?'selected':'')+'>'+esc(o)+'</option>').join('')+'</select>';else field='<input id="msaAvaFamInput" type="'+q.type+'" value="'+esc(val0)+'" placeholder="'+esc(q.placeholder||'')+'" '+(q.key==='nome'?'required':'')+'>';const pct=Math.round((st.step/(avaQuestions.length-1))*100);m.querySelector('.msa-ava-dialog').innerHTML='<div class="msa-ava-top"><div><div class="msa-fam-kicker">🤖 AVA · ENTREVISTA FAMILIAR</div><h2>'+esc(q.title)+'</h2><p>'+esc(q.help)+'</p></div><button type="button" class="msa-ava-close" onclick="fecharAvaFamilia()">✕</button></div><div class="msa-ava-progress"><div style="width:'+pct+'%"></div></div><div class="msa-ava-step">Pergunta '+(st.step+1)+' de '+avaQuestions.length+'</div><label class="msa-ava-field">'+(q.type==='select'?'Escolha uma opção':'Resposta')+field+'</label><div class="msa-ava-actions">'+(st.step?'<button type="button" class="btn secondary" onclick="avaFamiliaAnterior()">← Voltar</button>':'')+'<button type="button" class="btn green" onclick="avaFamiliaProxima()">'+(st.step===avaQuestions.length-1?'✅ Salvar familiar':'Continuar →')+'</button></div><div class="alert safe" style="margin-top:12px">🔒 A entrevista fica neste navegador e nada é enviado automaticamente para uma IA.</div>';const inp=document.getElementById('msaAvaFamInput');if(inp){inp.focus();inp.addEventListener('keydown',e=>{if(e.key==='Enter'&&q.type!=='text')avaFamiliaProxima()})}}
window.iniciarEntrevistaAvaFamilia=function(){if(document.getElementById('msaAvaFamiliaModal'))return;window.__msaAvaFam={step:0,data:{}};const m=document.createElement('div');m.id='msaAvaFamiliaModal';m.className='msa-ava-overlay';m.innerHTML='<div class="msa-ava-dialog" role="dialog" aria-modal="true"></div>';document.body.appendChild(m);renderAvaFamilia()}
window.avaFamiliaProxima=function(){const st=window.__msaAvaFam;if(!st)return;const q=avaQuestions[st.step],inp=document.getElementById('msaAvaFamInput');if(!inp)return;const v=String(inp.value||'').trim();if(q.key==='nome'&&!v){alert('Informe o nome do familiar.');return}st.data[q.key]=v;if(st.step<avaQuestions.length-1){st.step++;renderAvaFamilia();return}const d=st.data,p={id:uid('fam'),nome:d.nome,parentesco:d.parentesco||'Outro',sexo:d.sexo&&d.sexo!=='Não informado'?d.sexo:'',idade:d.idade||'',condicao:d.condicao||'',alergias:'',sangue:'',contato:'',obs:[d.idadeDiagnostico?'Idade aproximada ao diagnóstico: '+d.idadeDiagnostico+' anos':'',d.recorrencia?'Outros familiares com condição semelhante: '+d.recorrencia:'',d.certeza?'Nível de confiança: '+d.certeza:'',d.obs||''].filter(Boolean).join(' '),ladoFamilia:d.ladoFamilia||'',criadoEm:new Date().toISOString(),medicamentos:[],consultas:[],crises:[]};const list=getList();list.push(p);if(!saveList(list)){alert('Não foi possível salvar o familiar.');return}fecharAvaFamilia();setSelected(p.id);renderFamiliares();setTimeout(()=>document.getElementById('familiarDetalhe')?.scrollIntoView({behavior:'smooth',block:'start'}),80);alert('✅ Familiar cadastrado pela Ava.')}
window.avaFamiliaAnterior=function(){const st=window.__msaAvaFam;if(!st)return;const inp=document.getElementById('msaAvaFamInput'),q=avaQuestions[st.step];if(inp)st.data[q.key]=String(inp.value||'').trim();if(st.step){st.step--;renderAvaFamilia()}}
function instalarEstilosFamiliaInteligente(){if(document.getElementById('msaV587FamStyles'))return;const s=document.createElement('style');s.id='msaV587FamStyles';s.textContent="#familiaInteligencia{display:grid;gap:12px;margin-bottom:15px}\n.msa-fam-actions{display:grid;grid-template-columns:repeat(3,1fr);gap:9px}.msa-fam-action{border:1px solid #dbe3ee;background:#fff;border-radius:16px;padding:13px;text-align:left;cursor:pointer;color:#172033;font:inherit}.msa-fam-action.primary{background:linear-gradient(135deg,#eef4ff,#f7f1ff);border-color:#d7e4ff}.msa-fam-action strong{display:block;font-size:24px;margin-bottom:6px}.msa-fam-action span{display:block;font-weight:900}.msa-fam-action small{display:block;color:#687386;margin-top:3px;line-height:1.35}\n.msa-fam-map-card,.msa-fam-analysis-card{border:1px solid #e3e8f0;border-radius:18px;padding:16px;background:#fbfdff}.msa-fam-map-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}.msa-fam-kicker{font-size:11px;font-weight:900;letter-spacing:.06em;color:#2563eb}.msa-fam-map-head h3,.msa-fam-analysis-card h3{margin:4px 0 4px;font-size:19px}.msa-fam-map-head p,.msa-fam-analysis-card>p{margin:0;color:#687386;font-size:13px;line-height:1.45}\n.msa-fam-map-stats,.msa-fam-analysis-kpis{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:12px}.msa-fam-map-stats>div,.msa-fam-analysis-kpis>div{border:1px solid #e6ebf2;background:#fff;border-radius:13px;padding:10px}.msa-fam-map-stats b,.msa-fam-analysis-kpis b{display:block;font-size:22px}.msa-fam-map-stats span,.msa-fam-analysis-kpis span{font-size:11px;color:#687386}\n.msa-fam-map-tree{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:13px}.msa-fam-you{grid-column:1/-1;text-align:center;padding:10px;border:1px dashed #b8c9e8;border-radius:14px;background:#f3f7ff;color:#1d4ed8}.msa-fam-you small{display:block;color:#687386;font-size:11px;margin-top:2px}\n.msa-fam-map-group{border:1px solid #e3e8f0;border-radius:15px;background:#fff;padding:10px}.msa-fam-map-title{font-size:12px;font-weight:900;margin-bottom:7px}.msa-fam-map-title span{float:right;color:#2563eb}.msa-fam-map-list{display:grid;gap:7px}.msa-fam-map-person{width:100%;display:flex;gap:8px;align-items:flex-start;text-align:left;border:1px solid #eef2f7;background:#f8fafc;border-radius:12px;padding:9px;cursor:pointer;font:inherit}.msa-fam-map-person:hover{background:#eff6ff;border-color:#cfe0ff}.msa-fam-avatar{font-size:22px;line-height:1}.msa-fam-map-person b,.msa-fam-map-person small,.msa-fam-map-person em{display:block}.msa-fam-map-person small{font-size:10px;color:#687386;margin-top:2px}.msa-fam-map-person em{font-size:11px;color:#334155;font-style:normal;margin-top:3px;line-height:1.25}\n.msa-fam-empty{padding:12px;text-align:center;color:#687386;border:1px dashed #d7dee9;border-radius:12px;font-size:12px}.msa-fam-patterns{display:grid;gap:8px;margin-top:12px}.msa-fam-pattern{border:1px solid #e4e9f0;background:#fff;border-radius:14px;padding:11px}.msa-fam-pattern>div:first-child{display:flex;justify-content:space-between;gap:8px}.msa-fam-pattern small{color:#687386;font-size:11px}.msa-fam-members{display:flex;gap:5px;flex-wrap:wrap;margin-top:7px}.msa-fam-members button{border:1px solid #dbe5f5;background:#f8fbff;border-radius:99px;padding:5px 8px;font-size:11px;font-weight:800;color:#2457c5;cursor:pointer}.msa-fam-anchor{scroll-margin-top:12px}\n@media(max-width:760px){.msa-fam-actions{grid-template-columns:1fr}.msa-fam-map-tree{grid-template-columns:1fr}.msa-fam-map-head{flex-direction:column}.msa-fam-map-head .btn{width:100%}.msa-fam-map-stats,.msa-fam-analysis-kpis{grid-template-columns:1fr 1fr}.msa-fam-you{grid-column:auto}.msa-fam-map-group{min-height:0}}@media(max-width:430px){.msa-fam-map-stats,.msa-fam-analysis-kpis{grid-template-columns:1fr}.msa-fam-map-card,.msa-fam-analysis-card{padding:13px}}\n.msa-ava-overlay{position:fixed;inset:0;background:rgba(15,23,42,.68);z-index:100500;display:flex;align-items:center;justify-content:center;padding:18px}.msa-ava-dialog{width:min(680px,100%);max-height:90vh;overflow:auto;background:#fff;border-radius:24px;padding:21px;box-shadow:0 25px 80px rgba(0,0,0,.28)}.msa-ava-top{display:flex;justify-content:space-between;gap:14px;align-items:flex-start}.msa-ava-top h2{margin:5px 0 5px}.msa-ava-top p{margin:0;color:#687386;font-size:13px;line-height:1.45}.msa-ava-close{width:40px;height:40px;border:0;border-radius:12px;background:#f1f5f9;cursor:pointer;font-size:18px;font-weight:900}.msa-ava-progress{height:9px;background:#e8edf5;border-radius:99px;overflow:hidden;margin-top:16px}.msa-ava-progress>div{height:100%;background:linear-gradient(90deg,#2563eb,#6d28d9);transition:width .2s ease}.msa-ava-step{margin-top:8px;color:#687386;font-size:11px;font-weight:900}.msa-ava-field{display:block;margin-top:16px;font-size:13px;font-weight:900}.msa-ava-field input,.msa-ava-field select{margin-top:7px;min-height:50px;font-size:16px}.msa-ava-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:16px}.msa-ava-actions .btn{min-width:145px}@media(max-width:600px){.msa-ava-overlay{padding:10px;align-items:flex-end}.msa-ava-dialog{max-height:88vh;border-radius:22px 22px 12px 12px;padding:17px}.msa-ava-actions{display:grid;grid-template-columns:1fr}.msa-ava-actions .btn{width:100%}}";document.head.appendChild(s)}
function instalarControleFamiliares(){
 const box=document.getElementById('settingsPreferences');if(!box||document.getElementById('prefFamiliares'))return;
 const pref=(()=>{try{return (window.MSAStorage.get('msa2_preferencias')||[])[0]||{}}catch(e){return{}}})();
 const wrap=document.createElement('label');wrap.id='prefFamiliares';wrap.style.cssText='display:flex;flex-direction:column;gap:6px;border:1px solid #dbe4f0;border-radius:14px;padding:12px;background:#fff';
 wrap.innerHTML='<span style="font-weight:900">👨‍👩‍👧‍👦 Familiares</span><small class="muted">Mostra ou oculta a área para acompanhar outras pessoas da família.</small><select id="prefFamiliaresSelect"><option value="on">Ativado</option><option value="off">Ocultado</option></select>';
 box.appendChild(wrap);
 const sel=wrap.querySelector('select');sel.value=pref.familiares==='off'?'off':'on';
 sel.onchange=function(){try{const p=(window.MSAStorage.get('msa2_preferencias')||[])[0]||{};p.familiares=this.value;window.MSAStorage.set('msa2_preferencias',[p]);aplicarVisibilidadeFamiliares()}catch(e){}};
}
function aplicarVisibilidadeFamiliares(){
 let pref={};try{pref=(window.MSAStorage.get('msa2_preferencias')||[])[0]||{}}catch(e){}
 const off=pref.familiares==='off';
 document.querySelectorAll('[data-tab="familiares"],[data-mobile-tab="familiares"]').forEach(el=>el.classList.toggle('msa-feature-off',off));
 const sec=document.getElementById('familiares');if(sec)sec.classList.toggle('msa-feature-off',off);
}
function init(){instalarControleFamiliares();aplicarVisibilidadeFamiliares();
 const form=document.getElementById('familiarForm');if(form)form.onsubmit=e=>{e.preventDefault();const p={id:uid('fam'),nome:val('fNome'),parentesco:val('fParentesco'),sexo:val('fSexo'),nasc:val('fNasc'),idade:val('fIdade'),condicao:val('fCondicao'),alergias:val('fAlergias'),sangue:val('fSangue'),contato:val('fContato'),obs:val('fObs'),ladoFamilia:val('fLadoFamilia'),criadoEm:new Date().toISOString(),medicamentos:[],consultas:[],crises:[]};if(!p.nome){alert('Informe o nome.');return}const list=getList();list.push(p);if(!saveList(list)){alert('Não foi possível salvar.');return}setSelected(p.id);form.reset();renderFamiliares()};
 renderFamiliares();
 const settings=document.getElementById('settingsPreferences');if(settings){const mo=new MutationObserver(()=>{if(!document.getElementById('prefFamiliares'))instalarControleFamiliares();aplicarVisibilidadeFamiliares()});mo.observe(settings,{childList:true});}
 const obs=new MutationObserver(()=>renderFamiliares());const section=document.getElementById('familiares');if(section)obs.observe(section,{attributes:true,attributeFilter:['class']});
}
window.renderFamiliares=renderFamiliares;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();