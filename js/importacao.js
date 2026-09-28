/* Minha Saúde IA - módulo de importação V4.72 */
function obterPromptIA(){
 const t=document.getElementById('promptIA');
 return t?t.value:'';
}
function copiarPromptSincrono(){
 const t=document.getElementById('promptIA');
 if(!t)return false;
 let ok=false;
 try{
  t.focus();
  t.select();
  ok=document.execCommand('copy');
 }catch(e){}
 if($('copiado'))$('copiado').textContent=ok?'✅ Prompt copiado!':'';
 return ok;
}
function copiarPromptIA(){copiarPrompt()}
function copiarPrompt(){
 const t=document.getElementById('promptIA');
 if(!t)return;
 const texto=t.value||'';
 const ok=function(){if($('copiado'))$('copiado').textContent='✅ Prompt copiado! Agora cole no ChatGPT ou Gemini.'};
 if(navigator.clipboard&&navigator.clipboard.writeText){
  navigator.clipboard.writeText(texto).then(ok).catch(function(){
   if(!copiarPromptSincrono()&&$('copiado'))$('copiado').textContent='⚠️ Não foi possível copiar automaticamente. Selecione o texto e copie manualmente.';
  });
 }else if(!copiarPromptSincrono()){
  if($('copiado'))$('copiado').textContent='⚠️ Não foi possível copiar automaticamente. Selecione o texto e copie manualmente.';
 }else ok();
}
function copiarPromptAntesDeAbrir(){
 const texto=obterPromptIA();
 const copiado=copiarPromptSincrono();
 if(!copiado&&navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(texto).catch(function(){});
}
window.copiarPrompt=window.copiarPrompt||copiarPrompt;
window.copiarPromptIA=window.copiarPromptIA||copiarPromptIA;
window.copiarPromptAntesDeAbrir=copiarPromptAntesDeAbrir;
function normalObj(x){return x&&typeof x==='object'&&!Array.isArray(x)?x:{}}
function arr(x){return Array.isArray(x)?x:[]}
function first(o){for(var i=1;i<arguments.length;i++){var k=arguments[i];if(o&&o[k]!==undefined&&o[k]!==null&&String(o[k]).trim()!=='')return o[k]}return ''}
function normalizarImport(d){
 var p=normalObj(d.perfil||d.profile);
 var dores=arr(d.dores||d.dores_e_sintomas||d.sintomas).map(function(x){return {data:first(x,'data','inicio','quando','datetime'),local:first(x,'local','onde','regiao','região'),int:Number(first(x,'int','intensidade','intensidade_0_10'))||0,tipo:first(x,'tipo','caracteristica','característica'),freq:first(x,'freq','frequencia','frequência'),gatilho:first(x,'gatilho','gatilhos','piora_melhora'),sint:first(x,'sint','sintomas','outros_sintomas'),obs:first(x,'obs','observacoes','observações')}});
 var consultas=arr(d.consultas).map(function(x){return {data:first(x,'data'),esp:first(x,'especialidade'),med:first(x,'med','medico','médico'),mot:first(x,'motivo'),perg:first(x,'perguntas'),obs:first(x,'obs','orientacoes','orientações'),ret:first(x,'ret','retorno')}});
 var meds=arr(d.medicamentos||d.remedios||d.remédios).map(function(x){return {nome:first(x,'nome','medicamento','remedio','remédio'),dose:first(x,'dose'),freq:first(x,'freq','frequencia','frequência'),inicio:first(x,'inicio','início'),fim:first(x,'fim'),pres:first(x,'pres','prescritor','prescrito_por'),obs:first(x,'obs','observacoes','observações')}});
 var exames=arr(d.exames).map(function(x){return {nome:first(x,'nome','exame'),data:first(x,'data'),res:first(x,'res','resultado'),obs:first(x,'obs','observacoes','observações')}});
 return {p:p,dores:dores,consultas:consultas,meds:meds,exames:exames};
}
function normalizarFichaIA(raw){
 var names=['NOME','DATA_NASCIMENTO','IDADE','SEXO','TIPO_SANGUINEO','ALTURA','PESO','OBJETIVO_CORPORAL','ACADEMIA','FREQUENCIA_ACADEMIA','ATIVIDADE_FISICA','TRABALHO_TIPO','HORAS_SENTADO','HORAS_EM_PE','AGUA_POR_DIA','FREQUENCIA_URINARIA','FREQUENCIA_EVACUACAO','EXPOSICAO_CALOR_SUOR','ALIMENTACAO','DOENCAS','ALERGIAS','CIRURGIAS_INTERNACOES','CONTATO_EMERGENCIA','TELEFONE_EMERGENCIA','ULTIMA_MENSTRUACAO','CICLO_MENSTRUAL','DURACAO_MENSTRUACAO','REGULARIDADE_CICLO','FREQUENCIA_SEXUAL','FREQUENCIA_SEXUAL_MIN','FREQUENCIA_SEXUAL_MAX','MASTURBACAO_POR_DIA','USO_PRESERVATIVO','JA_ENGRAVIDOU','JA_FOI_MAE','NUMERO_GESTACOES','HISTORICO_REPRODUTIVO','USA_ANTICONCEPCIONAL','METODO_ANTICONCEPCIONAL','NOME_ANTICONCEPCIONAL','HORARIO_ANTICONCEPCIONAL','INICIO_ANTICONCEPCIONAL','REGIME_ANTICONCEPCIONAL','TIPO_MINIPILULA','ULTIMO_PREVENTIVO_COLO','ULTIMA_MAMOGRAFIA','ULTIMO_TESTE_IST','VACINA_HPV','PROXIMO_PREVENTIVO','OBSERVACOES_PREVENCAO','FREQUENCIA_DORCELAX','FREQUENCIA_PARACETAMOL','OUTROS_REMEDIOS_DOR','JA_TEVE_CATAPORA','QUANDO_CATAPORA','MEDICAMENTOS','SUPLEMENTOS','ULTIMO_SINTOMA','LOCAL_SINTOMA','DATA_INICIO_SINTOMA','INTENSIDADE','OUTROS_SINTOMAS','CONSULTAS','EXAMES','SINAIS_VITAIS','VACINAS','HISTORICO_FAMILIAR','LEMBRETES','DOCUMENTOS','INFORMACOES_IMPORTANTES'];
 var aliases={
  NOME:['NOME','NOME_COMPLETO','NOME DO PACIENTE','PACIENTE'],
  DATA_NASCIMENTO:['DATA_NASCIMENTO','DATA DE NASCIMENTO','NASCIMENTO'],
  TIPO_SANGUINEO:['TIPO_SANGUINEO','TIPO SANGUÍNEO','TIPO SANGUINEO'],
  OBJETIVO_CORPORAL:['OBJETIVO_CORPORAL','OBJETIVO CORPORAL','OBJETIVO'],
  DOENCAS:['DOENCAS','DOENCA','DOENCAS E CONDICOES','DOENCAS OU CONDICOES','DOENCAS QUE TENHO','DOENCAS QUE TENHO OU JA TIVE','CONDICOES DE SAUDE','CONDICOES DE SAUDE DIAGNOSTICADAS','CONDICOES','CONDICAO DE SAUDE','CONDIÇÕES DE SAÚDE','DOENÇAS E CONDIÇÕES'],
  FREQUENCIA_ACADEMIA:['FREQUENCIA_ACADEMIA','FREQUÊNCIA ACADEMIA','FREQUENCIA ACADEMIA'],
  ATIVIDADE_FISICA:['ATIVIDADE_FISICA','ATIVIDADE FÍSICA','ATIVIDADE FISICA'],
  TRABALHO_TIPO:['TRABALHO_TIPO','TIPO DE TRABALHO','TRABALHO'],
  HORAS_SENTADO:['HORAS_SENTADO','HORAS SENTADO','TEMPO SENTADO'],
  HORAS_EM_PE:['HORAS_EM_PE','HORAS EM PÉ','TEMPO EM PÉ'],
  AGUA_POR_DIA:['AGUA_POR_DIA','ÁGUA POR DIA','AGUA POR DIA','CONSUMO DE ÁGUA'],
  FREQUENCIA_URINARIA:['FREQUENCIA_URINARIA','FREQUÊNCIA URINÁRIA','FREQUENCIA URINARIA','URINA POR DIA'],
  FREQUENCIA_EVACUACAO:['FREQUENCIA_EVACUACAO','FREQUÊNCIA DE EVACUAÇÃO','FREQUENCIA DE EVACUACAO','EVACUAÇÃO'],
  EXPOSICAO_CALOR_SUOR:['EXPOSICAO_CALOR_SUOR','EXPOSIÇÃO AO CALOR/SUOR','CALOR E SUOR'],
  CIRURGIAS_INTERNACOES:['CIRURGIAS_INTERNACOES','CIRURGIAS/INTERNAÇÕES','CIRURGIAS E INTERNAÇÕES'],
  CONTATO_EMERGENCIA:['CONTATO_EMERGENCIA','CONTATO DE EMERGÊNCIA','CONTATO EMERGENCIA'],
  TELEFONE_EMERGENCIA:['TELEFONE_EMERGENCIA','TELEFONE DE EMERGÊNCIA','TELEFONE EMERGENCIA'],
  MEDICAMENTOS:['MEDICAMENTOS','REMÉDIOS','REMEDIOS','MEDICAÇÕES','MEDICACOES'],
  SUPLEMENTOS:['SUPLEMENTOS','VITAMINAS E SUPLEMENTOS'],
  ULTIMO_SINTOMA:['ULTIMO_SINTOMA','ÚLTIMO SINTOMA','ULTIMO SINTOMA','SINTOMA'],
  LOCAL_SINTOMA:['LOCAL_SINTOMA','LOCAL DO SINTOMA','LOCAL'],
  DATA_INICIO_SINTOMA:['DATA_INICIO_SINTOMA','DATA DE INÍCIO DO SINTOMA','INÍCIO DO SINTOMA'],
  OUTROS_SINTOMAS:['OUTROS_SINTOMAS','OUTROS SINTOMAS'],
  HISTORICO_FAMILIAR:['HISTORICO_FAMILIAR','HISTÓRICO FAMILIAR','HISTORICO FAMILIAR'],
  REGULARIDADE_CICLO:['REGULARIDADE_CICLO','REGULARIDADE DO CICLO','CICLO REGULARIDADE'],
  USA_ANTICONCEPCIONAL:['USA_ANTICONCEPCIONAL','USA ANTICONCEPCIONAL','ANTICONCEPCIONAL DIARIO'],
  METODO_ANTICONCEPCIONAL:['METODO_ANTICONCEPCIONAL','MÉTODO ANTICONCEPCIONAL','METODO CONTRACEPTIVO','MÉTODO CONTRACEPTIVO'],
  NOME_ANTICONCEPCIONAL:['NOME_ANTICONCEPCIONAL','NOME DO ANTICONCEPCIONAL','ANTICONCEPCIONAL'],
  HORARIO_ANTICONCEPCIONAL:['HORARIO_ANTICONCEPCIONAL','HORÁRIO DO ANTICONCEPCIONAL','HORARIO ANTICONCEPCIONAL'],
  INICIO_ANTICONCEPCIONAL:['INICIO_ANTICONCEPCIONAL','INÍCIO DO ANTICONCEPCIONAL','INICIO ANTICONCEPCIONAL'],
  REGIME_ANTICONCEPCIONAL:['REGIME_ANTICONCEPCIONAL','REGIME DA PILULA','REGIME DA PÍLULA','CARTELA DA PILULA'],
  TIPO_MINIPILULA:['TIPO_MINIPILULA','TIPO DE MINIPILULA','TIPO DE MINIPÍLULA'],
  INFORMACOES_IMPORTANTES:['INFORMACOES_IMPORTANTES','INFORMAÇÕES IMPORTANTES','INFORMACOES IMPORTANTES']
 };
 function keyNorm(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[^A-Z0-9]+/g,' ').trim().replace(/\s+/g,' ')}
 var keyMap={};
 names.forEach(function(n){keyMap[keyNorm(n)]=n;(aliases[n]||[]).forEach(function(a){keyMap[keyNorm(a)]=n})});
 function canonical(k){var n=keyNorm(k);return keyMap[n]||''}
 var values={},lines=String(raw||'').replace(/^\uFEFF/,'').replace(/\r/g,'').split('\n'),current='';
 lines.forEach(function(line){
  var clean=line.trim().replace(/^[-*]\s*/,'');
  var m=clean.match(/^\[([^\]]+)\]\s*(.*)$/);
  if(!m)m=clean.match(/^([^:]{2,70}):\s*(.*)$/);
  if(m){
   var key=canonical(m[1]);
   if(key){current=key;values[current]=m[2]||'';return}
  }
  if(current)values[current]+=(values[current]?'\n':'')+line;
 });
 function field(n){var v=String(values[n]||'').trim();return /^não informado$|^nao informado$|^não disponível$|^nao disponivel$|^n\/?a$/i.test(v)?'Não informado':v}
 function date(v){var s=String(v||'').trim(),m=s.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);if(m)return m[3]+'-'+String(m[2]).padStart(2,'0')+'-'+String(m[1]).padStart(2,'0');return s}
 function num(v){var m=String(v||'').replace(',','.').match(/-?\d+(?:\.\d+)?/);return m?m[0]:''}
 function height(v){var n=num(v);if(!n)return '';var x=Number(n);return /\bm\b/i.test(String(v))&&x<3?String(Math.round(x*100)):String(x)}
 function splitRecords(text){return String(text||'').split(/;\s*|\n(?=\s*(?:[-*]\s*)?[^\n|]+\|)/).map(function(x){return x.replace(/^[-*]\s*/,'').trim()}).filter(Boolean)}
 function pipeParts(text){return String(text||'').split(/\s*\|\s*/).map(function(x){return x.trim()})}
 function parseVital(x){var p=pipeParts(x),o={data:'',peso:'',pressao:'',fc:'',temp:'',glic:'',sat:'',obs:''};p.forEach(function(part,i){var m=part.match(/^([^:]+):\s*(.*)$/);if(i===0&&!m){o.data=date(part);return}if(!m)return;var k=keyNorm(m[1]),v=m[2].trim();if(/PESO/.test(k))o.peso=v.replace(/\s*KG\b/i,'').trim();else if(/PRESS/.test(k))o.pressao=v;else if(/FC|BATIMENTO/.test(k))o.fc=v;else if(/TEMP/.test(k))o.temp=v;else if(/GLIC/.test(k))o.glic=v;else if(/SATUR|SAT/.test(k))o.sat=v;else if(/OBSERV/.test(k))o.obs=v});if(!o.data)o.data=new Date().toISOString().slice(0,16);return o}
 function parseVaccine(x){var p=pipeParts(x),o={nome:'',data:'',obs:''};p.forEach(function(part,i){var m=part.match(/^([^:]+):\s*(.*)$/);if(m){var k=keyNorm(m[1]),v=m[2].trim();if(/VACINA|NOME/.test(k))o.nome=v;else if(/DATA/.test(k))o.data=date(v);else if(/DOSE|OBSERV/.test(k))o.obs=v}else if(i===0)o.nome=part;else if(/^\d{1,2}[\/-]\d{1,2}[\/-]\d{4}$/.test(part))o.data=date(part);else o.obs+=(o.obs?' — ':'')+part});return o}
 function parseFamily(x){var p=pipeParts(x),o={parente:'',info:''};p.forEach(function(part,i){var m=part.match(/^([^:]+):\s*(.*)$/);if(m){var k=keyNorm(m[1]),v=m[2].trim();if(/PARENTE|FAMILIAR/.test(k))o.parente=v;else if(/CONDICAO|INFORMACAO/.test(k))o.info=v}else if(i===0)o.parente=part;else o.info+=(o.info?' — ':'')+part});return o}
 function parseReminder(x){var p=pipeParts(x),o={id:String(Date.now())+Math.random(),nome:'',data:'',tipo:'Outro'};p.forEach(function(part,i){var m=part.match(/^([^:]+):\s*(.*)$/);if(m){var k=keyNorm(m[1]),v=m[2].trim();if(/LEMBRAR|NOME/.test(k))o.nome=v;else if(/DATA|HORA/.test(k))o.data=v;else if(/TIPO/.test(k))o.tipo=v}else if(i===0)o.nome=part;else if(!o.data)o.data=part;else o.tipo=part});return o}
 function parseDocument(x){var p=pipeParts(x),o={id:String(Date.now())+Math.random(),nome:'Documento informado',tipo:'',tamanho:'',data:''};p.forEach(function(part,i){var m=part.match(/^([^:]+):\s*(.*)$/);if(m){var k=keyNorm(m[1]),v=m[2].trim();if(/NOME|DOCUMENTO/.test(k))o.nome=v;else if(/TIPO/.test(k))o.tipo=v;else if(/DATA/.test(k))o.data=date(v)}else if(i===0)o.nome=part});return o}
 var p={nome:field('NOME'),nasc:date(field('DATA_NASCIMENTO')),idade:num(field('IDADE')),sexo:field('SEXO'),sangue:field('TIPO_SANGUINEO'),altura:height(field('ALTURA')),peso:num(field('PESO')),objetivoCorporal:field('OBJETIVO_CORPORAL'),academia:field('ACADEMIA'),academiaFreq:field('FREQUENCIA_ACADEMIA'),atividadeFisica:field('ATIVIDADE_FISICA'),trabalhoTipo:field('TRABALHO_TIPO'),horasSentado:field('HORAS_SENTADO'),horasPe:field('HORAS_EM_PE'),aguaDia:field('AGUA_POR_DIA'),urinaDia:field('FREQUENCIA_URINARIA'),evacuacaoDia:field('FREQUENCIA_EVACUACAO'),calorSuor:field('EXPOSICAO_CALOR_SUOR'),alimentacao:field('ALIMENTACAO'),cond:field('DOENCAS'),alerg:field('ALERGIAS'),circ:field('CIRURGIAS_INTERNACOES'),supl:field('SUPLEMENTOS'),info:field('INFORMACOES_IMPORTANTES'),emerg:field('CONTATO_EMERGENCIA'),tel:field('TELEFONE_EMERGENCIA'),menstruacao:date(field('ULTIMA_MENSTRUACAO')),ciclo:field('CICLO_MENSTRUAL'),duracaoMenstr:field('DURACAO_MENSTRUACAO'),regularidade:field('REGULARIDADE_CICLO'),sexoFreqMin:field('FREQUENCIA_SEXUAL_MIN')||field('FREQUENCIA_SEXUAL'),sexoFreqMax:field('FREQUENCIA_SEXUAL_MAX'),masturbacaoDia:field('MASTURBACAO_POR_DIA'),camisinha:field('USO_PRESERVATIVO'),engravidou:field('JA_ENGRAVIDOU'),mae:field('JA_FOI_MAE'),gestacoes:field('NUMERO_GESTACOES'),reproObs:field('HISTORICO_REPRODUTIVO'),usaAnticoncepcional:field('USA_ANTICONCEPCIONAL'),anticoncepcionalMetodo:field('METODO_ANTICONCEPCIONAL'),anticoncepcionalNome:field('NOME_ANTICONCEPCIONAL'),anticoncepcionalHora:field('HORARIO_ANTICONCEPCIONAL'),anticoncepcionalInicio:date(field('INICIO_ANTICONCEPCIONAL')),anticoncepcionalRegime:field('REGIME_ANTICONCEPCIONAL'),minipilulaTipo:field('TIPO_MINIPILULA'),prevColo:date(field('ULTIMO_PREVENTIVO_COLO')),mamografia:date(field('ULTIMA_MAMOGRAFIA')),ist:date(field('ULTIMO_TESTE_IST')),hpv:date(field('VACINA_HPV')),prevProx:date(field('PROXIMO_PREVENTIVO')),prevObs:field('OBSERVACOES_PREVENCAO'),dorcelaxFreq:field('FREQUENCIA_DORCELAX'),paracetamolFreq:field('FREQUENCIA_PARACETAMOL'),outrosDor:field('OUTROS_REMEDIOS_DOR'),catapora:field('JA_TEVE_CATAPORA'),cataporaQuando:field('QUANDO_CATAPORA')};
 var medText=field('MEDICAMENTOS'),sint=field('ULTIMO_SINTOMA'),local=field('LOCAL_SINTOMA'),data=field('DATA_INICIO_SINTOMA'),inten=field('INTENSIDADE'),outros=field('OUTROS_SINTOMAS');
 var n=parseInt((inten.match(/\d+/)||['0'])[0],10)||0;
 var dores=sint&&sint.toLowerCase()!=='não informado'?[{data:data||new Date().toISOString().slice(0,16),local:local||'Não informado',int:Math.max(0,Math.min(10,n)),tipo:'',freq:'',gatilho:'',sint:outros?sint+' — '+outros:sint,obs:'Importado da IA'}]:[];
 var ct=field('CONSULTAS'),et=field('EXAMES');
 var consultas=ct&&ct.toLowerCase()!=='não informado'?splitRecords(ct).map(function(x){var m=x.match(/^(\d{1,2}\/\d{1,2}\/\d{4})\s*[:\-]?\s*(.*)$/);return {data:m?date(m[1]):'',esp:'',med:'',mot:m?m[2]:x,perg:'',obs:'Importado da IA',ret:''}}):[];
 var exames=et&&et.toLowerCase()!=='não informado'?splitRecords(et).map(function(x){var m=x.match(/^(.*?)(?:\s*\((\d{1,2}\/\d{1,2}\/\d{4})\))$/);return {nome:m?m[1].trim():'Exame informado',data:m?date(m[2]):'',res:m?m[1].trim():x,obs:'Importado da IA'}}):[];
 var meds=medText&&medText.toLowerCase()!=='não informado'?splitRecords(medText).map(function(x){return {nome:x,dose:'',freq:'',inicio:'',fim:'',pres:'',obs:'Importado da IA'}}):[];
 var vt=field('SINAIS_VITAIS'),v=vt&&vt.toLowerCase()!=='não informado'?splitRecords(vt).map(parseVital):[];
 var vx=field('VACINAS'),vax=vx&&vx.toLowerCase()!=='não informado'?splitRecords(vx).map(parseVaccine).filter(function(x){return x.nome}):[];
 var fh=field('HISTORICO_FAMILIAR'),fam=fh&&fh.toLowerCase()!=='não informado'?splitRecords(fh).map(parseFamily).filter(function(x){return x.parente||x.info}):[];
 var lr=field('LEMBRETES'),r=lr&&lr.toLowerCase()!=='não informado'?splitRecords(lr).map(parseReminder).filter(function(x){return x.nome}):[];
 var dc=field('DOCUMENTOS'),docs=dc&&dc.toLowerCase()!=='não informado'?splitRecords(dc).map(parseDocument):[];
 return {p:p,dores:dores,consultas:consultas,meds:meds,exames:exames,vitais:v,vacinas:vax,familia:fam,lembretes:r,documentos:docs};
}
function atualizarProgresso(p,step,status){var bar=$('importProgress'),pct=$('importPercent'),st=$('importStep'),msg=$('importStatus');if(bar)bar.style.width=p+'%';if(pct)pct.textContent=p+'%';if(st)st.textContent=step;if(msg)msg.textContent=status}
function esperar(ms){return new Promise(function(resolve){setTimeout(resolve,ms)})}
function criarDiagnosticoImportacao(code,step,error,raw){var box=$('importDiagnostic'),diag={versao:'V4.66',codigo:code,etapa:step,mensagem:String(error&&error.message||error||'Erro desconhecido'),tamanhoResposta:String(raw||'').length,navegador:navigator.userAgent,data:new Date().toISOString(),stack:String(error&&error.stack||'').split('\n').slice(0,4).join('\n')};if(box){box.style.display='block';box.innerHTML='<div class="alert danger"><b>🔎 Diagnóstico da falha</b><br>Versão: '+esc(diag.versao)+' · Etapa: '+esc(diag.etapa)+'<br>Código: <b>'+esc(diag.codigo)+'</b><pre style="white-space:pre-wrap;word-break:break-word">'+esc(JSON.stringify(diag,null,2))+'</pre></div>'}console.error('[Minha Saúde IA]',diag)}
function resumirImportacao(n){
 var p=n.p||{},campos=Object.keys(p).filter(function(k){return String(p[k]||'').trim()&&String(p[k]).toLowerCase()!=='não informado'});
 var blocos=[['👤 Perfil',campos.length+' campo(s) reconhecido(s)'],['😣 Sintomas',n.dores.length+' registro(s)'],['👨‍⚕️ Consultas',n.consultas.length+' registro(s)'],['💊 Medicamentos',n.meds.length+' registro(s)'],['🧪 Exames',n.exames.length+' registro(s)'],['📈 Sinais vitais',n.vitais.length+' registro(s)'],['💉 Vacinas',n.vacinas.length+' registro(s)'],['🧬 Histórico familiar',n.familia.length+' registro(s)'],['📌 Lembretes',n.lembretes.length+' registro(s)'],['📄 Documentos',n.documentos.length+' registro(s)']];
 var detalhes=campos.slice(0,18).map(function(k){return '<div class="item"><b>'+esc(k.replace(/_/g,' '))+'</b><p>'+esc(String(p[k]))+'</p></div>'}).join('');
 return '<div class="grid2">'+blocos.map(function(x){return '<div class="card stat"><span>'+x[0]+'</span><b style="font-size:20px">'+x[1]+'</b></div>'}).join('')+'</div><h3>Principais campos encontrados</h3><div class="list">'+(detalhes||'<div class="empty">Nenhum campo de perfil reconhecido.</div>')+'</div>'+(campos.length>18?'<p class="muted">+ '+(campos.length-18)+' campo(s) reconhecido(s) não exibidos nesta prévia.</p>':'');
}
window.confirmarImportacaoPendente=function(){var n=window._importPendente;if(!n)return;var modal=$('importReviewOverlay');if(modal)modal.style.display='none';importarNormalizado(n);window._importPendente=null;};
window.cancelarImportacaoPendente=function(){window._importPendente=null;var modal=$('importReviewOverlay');if(modal)modal.style.display='none';if($('resultadoImport'))$('resultadoImport').innerHTML='<div class="alert">↩️ Importação cancelada. Nada foi salvo.</div>';};
function abrirRevisaoImportacao(n){window._importPendente=n;var box=$('importReviewContent');if(box)box.innerHTML=resumirImportacao(n);var modal=$('importReviewOverlay');if(modal)modal.style.display='flex';}
function importarNormalizado(n){
 var pk=['nome','nasc','idade','sexo','sangue','altura','peso','objetivoCorporal','academia','academiaFreq','atividadeFisica','trabalhoTipo','horasSentado','horasPe','aguaDia','urinaDia','evacuacaoDia','calorSuor','alimentacao','cond','alerg','circ','supl','info','emerg','tel','menstruacao','ciclo','duracaoMenstr','regularidade','sexoFreq','camisinha','engravidou','mae','gestacoes','reproObs','usaAnticoncepcional','anticoncepcionalMetodo','anticoncepcionalNome','anticoncepcionalHora','anticoncepcionalInicio','anticoncepcionalRegime','minipilulaTipo','prevColo','mamografia','ist','hpv','prevProx','prevObs','dorcelaxFreq','paracetamolFreq','outrosDor','catapora','cataporaQuando'],has=function(k){var v=String(n.p[k]||'').trim();return v&&v.toLowerCase()!=='não informado'};
 if(n.dores.length)set(K.d,get(K.d).concat(n.dores));
 if(n.consultas.length)set(K.c,get(K.c).concat(n.consultas));
 if(n.meds.length)set(K.m,get(K.m).concat(n.meds));
 if(n.exames.length)set(K.e,get(K.e).concat(n.exames));
 if(n.vitais.length)set(K.v,get(K.v).concat(n.vitais));
 if(n.vacinas.length)set(K.vax,get(K.vax).concat(n.vacinas));
 if(n.familia.length)set(K.fam,get(K.fam).concat(n.familia));
 if(n.lembretes.length)set(K.r,get(K.r).concat(n.lembretes));
 if(n.documentos.length)set(K.doc,get(K.doc).concat(n.documentos));
 if(pk.some(has)){var old=get(K.p)[0]||{},merged=Object.assign({},old),novos=0,ignorados=0;pk.forEach(function(k){if(has(k)){var atual=String(merged[k]||'').trim().toLowerCase(),novo=String(n.p[k]||'').trim();var provisoria=!atual||atual==='valor'||atual==='value'||atual==='não informado';if(provisoria||k==='sexo'||k==='alerg'||k==='emerg'||k==='tel'){if(atual!==novo.toLowerCase()){merged[k]=n.p[k];novos++}else ignorados++;}else ignorados++;}});set(K.p,[merged]);window._importPerfilNovos=novos;window._importPerfilIgnorados=ignorados}
 try{render();if(typeof loadProfile==='function')loadProfile();if(typeof renderCarteirinha==='function')renderCarteirinha();if(typeof renderNovosModulos==='function')renderNovosModulos()}catch(renderError){console.error('[Minha Saúde IA] render após importação',renderError);window._importRenderWarning=String(renderError&&renderError.message||renderError)}
 var ns=Number(window._importPerfilNovos||0),ig=Number(window._importPerfilIgnorados||0),hist=n.dores.length+n.consultas.length+n.meds.length+n.exames.length+n.vitais.length+n.vacinas.length+n.familia.length+n.lembretes.length+n.documentos.length;
 var aviso=window._importRenderWarning?'⚠️ Os dados foram salvos, mas houve um aviso ao atualizar a tela. Recarregue a página para conferir. ':'';
 $('resultadoImport').innerHTML='<div class="alert safe">✅ <b>Importação concluída!</b> '+ns+' campo(s) novo(s) do perfil e '+hist+' registro(s) novo(s) foram salvos. '+(ig?ig+' campo(s) já preenchido(s) foram preservados. ':'')+aviso+'</div>';
}
async function processarImportacao(){
 var btn=$('importBtn'),loading=$('importLoading'),campo=$('importIA'),raw=campo?campo.value.trim():'';
 if(!raw){criarDiagnosticoImportacao('IMPORT_INPUT_001','Leitura da resposta',new Error('Campo de importação vazio'),raw);alert('Cole primeiro a resposta da IA.');return}
 try{
  if(btn){btn.disabled=true;btn.textContent='⏳ Importando…'}if(loading)loading.style.display='flex';
  atualizarProgresso(10,'Lendo resposta','Lendo as informações recebidas da IA…');$('resultadoImport').innerHTML='<div class="alert">⏳ Importação em andamento…</div>';await esperar(250);
  raw=raw.replace(/^\s*```(?:json|text)?\s*/i,'').replace(/\s*```\s*$/,'').trim();
  atualizarProgresso(30,'Organizando perfil','Separando seus dados pessoais e informações de saúde…');await esperar(250);
  var n=raw.charAt(0)==='{'?normalizarImport(JSON.parse(raw)):normalizarFichaIA(raw);
  var total=n.dores.length+n.consultas.length+n.meds.length+n.exames.length+n.vitais.length+n.vacinas.length+n.familia.length+n.lembretes.length+n.documentos.length+['nome','nasc','idade','sexo','altura','peso','objetivoCorporal','academia','academiaFreq','atividadeFisica','trabalhoTipo','horasSentado','horasPe','aguaDia','urinaDia','calorSuor','alimentacao','cond','alerg','circ','supl','info','emerg','tel','menstruacao','ciclo','duracaoMenstr','sexoFreq','camisinha','engravidou','mae','gestacoes','reproObs','usaAnticoncepcional','anticoncepcionalNome','anticoncepcionalHora','anticoncepcionalInicio','prevColo','mamografia','ist','hpv','prevProx','prevObs','dorcelaxFreq','paracetamolFreq','outrosDor','catapora','cataporaQuando'].filter(function(k){return String(n.p[k]||'').trim()&&String(n.p[k]).toLowerCase()!=='não informado'}).length;
  if(!total)throw new Error('Nenhuma informação reconhecida');
  atualizarProgresso(55,'Organizando histórico','Preparando sintomas, consultas, medicamentos, exames e novos módulos…');await esperar(250);
  atualizarProgresso(75,'Salvando informações','Gravando os dados no seu histórico…');await esperar(250);
  abrirRevisaoImportacao(n);atualizarProgresso(90,'Aguardando revisão','Confira as informações antes de salvar…');await esperar(200);atualizarProgresso(100,'Pronto para revisar','Revise os dados na tela antes de confirmar.');await esperar(300);
 }catch(e){if(loading)loading.style.display='none';if(btn){btn.disabled=false;btn.textContent='✨ Importar e salvar'}criarDiagnosticoImportacao('IMPORT_RUNTIME_001','Processando importação',e,raw);$('resultadoImport').innerHTML='<div class="alert danger">❌ Não consegui importar. Veja o diagnóstico detalhado logo acima.</div>';return}
 if(loading)loading.style.display='none';if(btn){btn.disabled=false;btn.textContent='✨ Importar e salvar'}
}
function limparImportacao(){if($('importIA'))$('importIA').value='';if($('resultadoImport'))$('resultadoImport').innerHTML='';if($('importDiagnostic')){$('importDiagnostic').style.display='none';$('importDiagnostic').innerHTML=''}}
window.processarImportacao=processarImportacao;
window.limparImportacao=limparImportacao;
window._importacaoModuloV457=true;