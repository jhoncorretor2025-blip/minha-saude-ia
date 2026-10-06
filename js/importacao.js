/* Minha Saúde IA - módulo de importação V5.99 */
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
function extrairJSONDaResposta(raw){
 var s=String(raw||'').replace(/^\uFEFF/,'').trim(),candidatos=[];
 var fence=s.match(/\`\`\`(?:json|javascript|js|texto|text|markdown)?\\s*([\\s\\S]*?)\`\`\`/i);
 if(fence)candidatos.push(fence[1].trim());
 candidatos.push(s);
 var a=s.indexOf('{'),b=s.lastIndexOf('}');
 if(a>=0&&b>a)candidatos.push(s.slice(a,b+1));
 for(var i=0;i<candidatos.length;i++){
  try{
   var obj=JSON.parse(candidatos[i]);
   if(obj&&typeof obj==='object'&&!Array.isArray(obj))return obj;
  }catch(e){}
 }
 return null;
}
function limparLinhaFicha(line){
 return String(line||'').trim()
  .replace(/^\s*[-*+]\s+/,'')
  .replace(/^\s*#{1,6}\s*/,'')
  .replace(/^\s*>\s*/,'')
  .replace(/^\s*[*_\`]+(\[[^\]]+\])[*_\`]+(?=\s*(?:[:=–—-]|$))/,'$1')
  .replace(/^\s*[*_\`]+|[*_\`]+\s*$/g,'')
  .trim();
}

function arr(x){return Array.isArray(x)?x:[]}
function first(o){for(var i=1;i<arguments.length;i++){var k=arguments[i];if(o&&o[k]!==undefined&&o[k]!==null&&String(o[k]).trim()!=='')return o[k]}return ''}
function normalizarImport(d){
 var fonte=normalObj(d.perfil||d.profile||d.pessoa||d.paciente),raiz=normalObj(d),p={};
 if(!Object.keys(fonte).length)fonte=raiz;
 var mapa={
  nome:['nome','NOME','nome_completo','NOME_COMPLETO','paciente','PACIENTE'],
  nasc:['nasc','data_nascimento','DATA_NASCIMENTO','data de nascimento','nascimento'],
  idade:['idade','IDADE'],
  sexo:['sexo','SEXO'],
  sangue:['sangue','tipo_sanguineo','TIPO_SANGUINEO','tipo sanguíneo'],
  altura:['altura','ALTURA'],
  peso:['peso','PESO'],
  objetivoCorporal:['objetivoCorporal','objetivo_corporal','OBJETIVO_CORPORAL','objetivo'],
  academia:['academia','ACADEMIA'],
  academiaFreq:['academiaFreq','frequencia_academia','FREQUENCIA_ACADEMIA','frequência academia'],
  atividadeFisica:['atividadeFisica','atividade_fisica','ATIVIDADE_FISICA','atividade física'],
  trabalhoTipo:['trabalhoTipo','trabalho_tipo','TRABALHO_TIPO','trabalho'],
  horasSentado:['horasSentado','horas_sentado','HORAS_SENTADO','tempo sentado'],
  horasPe:['horasPe','horas_em_pe','HORAS_EM_PE','tempo em pé'],
  aguaDia:['aguaDia','agua_por_dia','AGUA_POR_DIA','água por dia'],
  urinaDia:['urinaDia','frequencia_urinaria','FREQUENCIA_URINARIA'],
  evacuacaoDia:['evacuacaoDia','frequencia_evacuacao','FREQUENCIA_EVACUACAO'],
  calorSuor:['calorSuor','exposicao_calor_suor','EXPOSICAO_CALOR_SUOR'],
  alimentacao:['alimentacao','ALIMENTACAO'],
  cond:['cond','doencas','DOENCAS','condicoes','condições de saúde'],
  alerg:['alerg','alergias','ALERGIAS'],
  circ:['circ','cirurgias_internacoes','CIRURGIAS_INTERNACOES'],
  emerg:['emerg','contato_emergencia','CONTATO_EMERGENCIA'],
  tel:['tel','telefone_emergencia','TELEFONE_EMERGENCIA'],
  menstruacao:['menstruacao','ultima_menstruacao','ULTIMA_MENSTRUACAO'],
  ciclo:['ciclo','ciclo_menstrual','CICLO_MENSTRUAL'],
  duracaoMenstr:['duracaoMenstr','duracao_menstruacao','DURACAO_MENSTRUACAO'],
  regularidade:['regularidade','regularidade_ciclo','REGULARIDADE_CICLO'],
  sexoFreq:['sexoFreq','frequencia_sexual','FREQUENCIA_SEXUAL'],
  sexoFreqMin:['sexoFreqMin','frequencia_sexual_min','FREQUENCIA_SEXUAL_MIN'],
  sexoFreqMax:['sexoFreqMax','frequencia_sexual_max','FREQUENCIA_SEXUAL_MAX'],
  masturbacaoDia:['masturbacaoDia','masturbacao_por_dia','MASTURBACAO_POR_DIA'],
  camisinha:['camisinha','uso_preservativo','USO_PRESERVATIVO'],
  engravidou:['engravidou','ja_engravidou','JA_ENGRAVIDOU'],
  mae:['mae','ja_foi_mae','JA_FOI_MAE'],
  gestacoes:['gestacoes','numero_gestacoes','NUMERO_GESTACOES'],
  reproObs:['reproObs','historico_reprodutivo','HISTORICO_REPRODUTIVO'],
  usaAnticoncepcional:['usaAnticoncepcional','usa_anticoncepcional','USA_ANTICONCEPCIONAL'],
  anticoncepcionalMetodo:['anticoncepcionalMetodo','metodo_anticoncepcional','METODO_ANTICONCEPCIONAL'],
  anticoncepcionalNome:['anticoncepcionalNome','nome_anticoncepcional','NOME_ANTICONCEPCIONAL'],
  anticoncepcionalHora:['anticoncepcionalHora','horario_anticoncepcional','HORARIO_ANTICONCEPCIONAL'],
  anticoncepcionalInicio:['anticoncepcionalInicio','inicio_anticoncepcional','INICIO_ANTICONCEPCIONAL'],
  anticoncepcionalRegime:['anticoncepcionalRegime','regime_anticoncepcional','REGIME_ANTICONCEPCIONAL'],
  minipilulaTipo:['minipilulaTipo','tipo_minipilula','TIPO_MINIPILULA'],
  prevColo:['prevColo','ultimo_preventivo_colo','ULTIMO_PREVENTIVO_COLO'],
  mamografia:['mamografia','ultima_mamografia','ULTIMA_MAMOGRAFIA'],
  ist:['ist','ultimo_teste_ist','ULTIMO_TESTE_IST'],
  hpv:['hpv','vacina_hpv','VACINA_HPV'],
  prevProx:['prevProx','proximo_preventivo','PROXIMO_PREVENTIVO'],
  prevObs:['prevObs','observacoes_prevencao','OBSERVACOES_PREVENCAO'],
  dorcelaxFreq:['dorcelaxFreq','frequencia_dorcelax','FREQUENCIA_DORCELAX'],
  paracetamolFreq:['paracetamolFreq','frequencia_paracetamol','FREQUENCIA_PARACETAMOL'],
  outrosDor:['outrosDor','outros_remedios_dor','OUTROS_REMEDIOS_DOR'],
  catapora:['catapora','ja_teve_catapora','JA_TEVE_CATAPORA'],
  cataporaQuando:['cataporaQuando','quando_catapora','QUANDO_CATAPORA']
 };
 Object.keys(mapa).forEach(function(k){var v=first.apply(null,[fonte].concat(mapa[k]));if(v!=='')p[k]=v});
 var dores=arr(raiz.dores||raiz.dores_e_sintomas||raiz.sintomas).map(function(x){var rawInt=first(x,'int','intensidade','intensidade_0_10');return {data:first(x,'data','inicio','quando','datetime'),local:first(x,'local','onde','regiao','região'),int:rawInt===''?'':Number(rawInt),tipo:first(x,'tipo','caracteristica','característica'),freq:first(x,'freq','frequencia','frequência'),gatilho:first(x,'gatilho','gatilhos','piora_melhora'),sint:first(x,'sint','sintomas','outros_sintomas'),obs:first(x,'obs','observacoes','observações')}});
 var consultas=arr(raiz.consultas).map(function(x){return {data:first(x,'data'),esp:first(x,'especialidade'),med:first(x,'med','medico','médico'),mot:first(x,'motivo'),perg:first(x,'perguntas'),obs:first(x,'obs','orientacoes','orientações'),ret:first(x,'ret','retorno')}});
 var meds=arr(raiz.medicamentos||raiz.remedios||raiz.remédios).map(function(x){return {nome:first(x,'nome','medicamento','remedio','remédio'),dose:first(x,'dose'),freq:first(x,'freq','frequencia','frequência'),inicio:first(x,'inicio','início'),fim:first(x,'fim'),pres:first(x,'pres','prescritor','prescrito_por'),obs:first(x,'obs','observacoes','observações')}});
 var exames=arr(raiz.exames).map(function(x){return {nome:first(x,'nome','exame'),data:first(x,'data'),res:first(x,'res','resultado'),obs:first(x,'obs','observacoes','observações')}});
 var vitais=arr(raiz.vitais||raiz.sinais_vitais||raiz.sinaisVitais),vacinas=arr(raiz.vacinas||raiz.vax),familia=arr(raiz.familia||raiz.historico_familiar||raiz.historicoFamiliar),lembretes=arr(raiz.lembretes||raiz.reminders),documentos=arr(raiz.documentos||raiz.docs);
 return {p:p,dores:dores,consultas:consultas,meds:meds,exames:exames,vitais:vitais,vacinas:vacinas,familia:familia,lembretes:lembretes,documentos:documentos};
}
function normalizarFichaIA(raw){
 var names=['NOME','DATA_NASCIMENTO','IDADE','SEXO','TIPO_SANGUINEO','ALTURA','PESO','OBJETIVO_CORPORAL','ACADEMIA','FREQUENCIA_ACADEMIA','ATIVIDADE_FISICA','TRABALHO_TIPO','HORAS_SENTADO','HORAS_EM_PE','AGUA_POR_DIA','FREQUENCIA_URINARIA','FREQUENCIA_EVACUACAO','EXPOSICAO_CALOR_SUOR','ALIMENTACAO','DOENCAS','DOENCAS_PAI','DOENCAS_MAE','ALERGIAS','CIRURGIAS_INTERNACOES','CONTATO_EMERGENCIA','TELEFONE_EMERGENCIA','ULTIMA_MENSTRUACAO','CICLO_MENSTRUAL','DURACAO_MENSTRUACAO','REGULARIDADE_CICLO','FREQUENCIA_SEXUAL','FREQUENCIA_SEXUAL_MIN','FREQUENCIA_SEXUAL_MAX','MASTURBACAO_POR_DIA','USO_PRESERVATIVO','JA_ENGRAVIDOU','JA_FOI_MAE','NUMERO_GESTACOES','HISTORICO_REPRODUTIVO','USA_ANTICONCEPCIONAL','METODO_ANTICONCEPCIONAL','NOME_ANTICONCEPCIONAL','HORARIO_ANTICONCEPCIONAL','INICIO_ANTICONCEPCIONAL','REGIME_ANTICONCEPCIONAL','TIPO_MINIPILULA','ULTIMO_PREVENTIVO_COLO','ULTIMA_MAMOGRAFIA','ULTIMO_TESTE_IST','VACINA_HPV','PROXIMO_PREVENTIVO','OBSERVACOES_PREVENCAO','FREQUENCIA_DORCELAX','FREQUENCIA_PARACETAMOL','OUTROS_REMEDIOS_DOR','JA_TEVE_CATAPORA','QUANDO_CATAPORA','MEDICAMENTOS','SUPLEMENTOS','ULTIMO_SINTOMA','LOCAL_SINTOMA','DATA_INICIO_SINTOMA','INTENSIDADE','OUTROS_SINTOMAS','CONSULTAS','EXAMES','SINAIS_VITAIS','VACINAS','HISTORICO_FAMILIAR','LEMBRETES','DOCUMENTOS','INFORMACOES_IMPORTANTES'];
 var aliases={
  NOME:['NOME','NOME_COMPLETO','NOME DO PACIENTE','PACIENTE'],
  DATA_NASCIMENTO:['DATA_NASCIMENTO','DATA DE NASCIMENTO','NASCIMENTO'],
  TIPO_SANGUINEO:['TIPO_SANGUINEO','TIPO SANGUÍNEO','TIPO SANGUINEO'],
  OBJETIVO_CORPORAL:['OBJETIVO_CORPORAL','OBJETIVO CORPORAL','OBJETIVO'],
  DOENCAS:['DOENCAS','DOENCA','DOENCAS E CONDICOES','DOENCAS OU CONDICOES','DOENCAS QUE TENHO','DOENCAS QUE TENHO OU JA TIVE','CONDICOES DE SAUDE','CONDICOES DE SAUDE DIAGNOSTICADAS','CONDICOES','CONDICAO DE SAUDE','CONDIÇÕES DE SAÚDE','DOENÇAS E CONDIÇÕES'],
  DOENCAS_PAI:['DOENCAS_PAI','DOENÇAS_PAI','DOENCAS DO PAI','DOENÇAS DO PAI','DOENCAS PAI','DOENÇAS PAI','HISTORICO DE DOENCAS DO PAI'],
  DOENCAS_MAE:['DOENCAS_MAE','DOENÇAS_MAE','DOENCAS DA MAE','DOENÇAS DA MÃE','DOENCAS MAE','DOENÇAS MÃE','HISTORICO DE DOENCAS DA MAE'],
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
  var clean=limparLinhaFicha(line);
  var m=clean.match(/^\[([^\]]+)\]\s*(.*)$/);
  if(!m)m=clean.match(/^([^:=–—-]{2,70})\s*[:=]\s*(.*)$/);
  if(m){
   var key=canonical(m[1]),valor=String(m[2]||'').replace(/^\s*[:=–—-]\s*/,'');
   if(key){current=key;values[current]=valor;return}
  }
  if(current)values[current]+=(values[current]?'\n':'')+line;
 });
 function field(n){var v=String(values[n]||'').trim();return /^não informado$|^nao informado$|^não disponível$|^nao disponivel$|^n\/?a$/i.test(v)?'Não informado':v}
 function date(v){var s=String(v||'').trim(),m=s.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);if(m)return m[3]+'-'+String(m[2]).padStart(2,'0')+'-'+String(m[1]).padStart(2,'0');return s}
 function num(v){var m=String(v||'').replace(',','.').match(/-?\d+(?:\.\d+)?/);return m?m[0]:''}
 function height(v){var n=num(v);if(!n)return '';var x=Number(n);return /\bm\b/i.test(String(v))&&x<3?String(Math.round(x*100)):String(x)}
 function splitRecords(text){return String(text||'').split(/;\s*|\n(?=\s*(?:[-*]\s*)?[^\n|]+\|)/).map(function(x){return x.replace(/^[-*]\s*/,'').trim()}).filter(Boolean)}
 function pipeParts(text){return String(text||'').split(/\s*\|\s*/).map(function(x){return x.trim()})}
 function parseVital(x){var p=pipeParts(x),o={data:'',peso:'',pressao:'',fc:'',temp:'',glic:'',sat:'',obs:''};p.forEach(function(part,i){var m=part.match(/^([^:]+):\s*(.*)$/);if(i===0&&!m){o.data=date(part);return}if(!m)return;var k=keyNorm(m[1]),v=m[2].trim();if(/PESO/.test(k))o.peso=v.replace(/\s*KG\b/i,'').trim();else if(/PRESS/.test(k))o.pressao=v;else if(/FC|BATIMENTO/.test(k))o.fc=v;else if(/TEMP/.test(k))o.temp=v;else if(/GLIC/.test(k))o.glic=v;else if(/SATUR|SAT/.test(k))o.sat=v;else if(/OBSERV/.test(k))o.obs=v});if(!o.data)o.data='';return o}
 function parseVaccine(x){var p=pipeParts(x),o={nome:'',data:'',obs:''};p.forEach(function(part,i){var m=part.match(/^([^:]+):\s*(.*)$/);if(m){var k=keyNorm(m[1]),v=m[2].trim();if(/VACINA|NOME/.test(k))o.nome=v;else if(/DATA/.test(k))o.data=date(v);else if(/DOSE|OBSERV/.test(k))o.obs=v}else if(i===0)o.nome=part;else if(/^\d{1,2}[\/-]\d{1,2}[\/-]\d{4}$/.test(part))o.data=date(part);else o.obs+=(o.obs?' — ':'')+part});return o}
 function parseFamily(x){var p=pipeParts(x),o={parente:'',info:''};p.forEach(function(part,i){var m=part.match(/^([^:]+):\s*(.*)$/);if(m){var k=keyNorm(m[1]),v=m[2].trim();if(/PARENTE|FAMILIAR/.test(k))o.parente=v;else if(/CONDICAO|INFORMACAO/.test(k))o.info=v}else if(i===0)o.parente=part;else o.info+=(o.info?' — ':'')+part});return o}
 function parseReminder(x){var p=pipeParts(x),o={id:String(Date.now())+Math.random(),nome:'',data:'',tipo:'Outro'};p.forEach(function(part,i){var m=part.match(/^([^:]+):\s*(.*)$/);if(m){var k=keyNorm(m[1]),v=m[2].trim();if(/LEMBRAR|NOME/.test(k))o.nome=v;else if(/DATA|HORA/.test(k))o.data=v;else if(/TIPO/.test(k))o.tipo=v}else if(i===0)o.nome=part;else if(!o.data)o.data=part;else o.tipo=part});return o}
 function parseDocument(x){var p=pipeParts(x),o={id:String(Date.now())+Math.random(),nome:'Documento informado',tipo:'',tamanho:'',data:''};p.forEach(function(part,i){var m=part.match(/^([^:]+):\s*(.*)$/);if(m){var k=keyNorm(m[1]),v=m[2].trim();if(/NOME|DOCUMENTO/.test(k))o.nome=v;else if(/TIPO/.test(k))o.tipo=v;else if(/DATA/.test(k))o.data=date(v)}else if(i===0)o.nome=part});return o}
 var p={nome:field('NOME'),nasc:date(field('DATA_NASCIMENTO')),idade:num(field('IDADE')),sexo:field('SEXO'),sangue:field('TIPO_SANGUINEO'),altura:height(field('ALTURA')),peso:num(field('PESO')),objetivoCorporal:field('OBJETIVO_CORPORAL'),academia:field('ACADEMIA'),academiaFreq:field('FREQUENCIA_ACADEMIA'),atividadeFisica:field('ATIVIDADE_FISICA'),trabalhoTipo:field('TRABALHO_TIPO'),horasSentado:field('HORAS_SENTADO'),horasPe:field('HORAS_EM_PE'),aguaDia:field('AGUA_POR_DIA'),urinaDia:field('FREQUENCIA_URINARIA'),evacuacaoDia:field('FREQUENCIA_EVACUACAO'),calorSuor:field('EXPOSICAO_CALOR_SUOR'),alimentacao:field('ALIMENTACAO'),cond:field('DOENCAS'),alerg:field('ALERGIAS'),circ:field('CIRURGIAS_INTERNACOES'),supl:field('SUPLEMENTOS'),info:field('INFORMACOES_IMPORTANTES'),emerg:field('CONTATO_EMERGENCIA'),tel:field('TELEFONE_EMERGENCIA'),menstruacao:date(field('ULTIMA_MENSTRUACAO')),ciclo:field('CICLO_MENSTRUAL'),duracaoMenstr:field('DURACAO_MENSTRUACAO'),regularidade:field('REGULARIDADE_CICLO'),sexoFreqMin:field('FREQUENCIA_SEXUAL_MIN')||field('FREQUENCIA_SEXUAL'),sexoFreqMax:field('FREQUENCIA_SEXUAL_MAX'),masturbacaoDia:field('MASTURBACAO_POR_DIA'),camisinha:field('USO_PRESERVATIVO'),engravidou:field('JA_ENGRAVIDOU'),mae:field('JA_FOI_MAE'),gestacoes:field('NUMERO_GESTACOES'),reproObs:field('HISTORICO_REPRODUTIVO'),usaAnticoncepcional:field('USA_ANTICONCEPCIONAL'),anticoncepcionalMetodo:field('METODO_ANTICONCEPCIONAL'),anticoncepcionalNome:field('NOME_ANTICONCEPCIONAL'),anticoncepcionalHora:field('HORARIO_ANTICONCEPCIONAL'),anticoncepcionalInicio:date(field('INICIO_ANTICONCEPCIONAL')),anticoncepcionalRegime:field('REGIME_ANTICONCEPCIONAL'),minipilulaTipo:field('TIPO_MINIPILULA'),prevColo:date(field('ULTIMO_PREVENTIVO_COLO')),mamografia:date(field('ULTIMA_MAMOGRAFIA')),ist:date(field('ULTIMO_TESTE_IST')),hpv:date(field('VACINA_HPV')),prevProx:date(field('PROXIMO_PREVENTIVO')),prevObs:field('OBSERVACOES_PREVENCAO'),dorcelaxFreq:field('FREQUENCIA_DORCELAX'),paracetamolFreq:field('FREQUENCIA_PARACETAMOL'),outrosDor:field('OUTROS_REMEDIOS_DOR'),catapora:field('JA_TEVE_CATAPORA'),cataporaQuando:field('QUANDO_CATAPORA')};
 var medText=field('MEDICAMENTOS'),sint=field('ULTIMO_SINTOMA'),local=field('LOCAL_SINTOMA'),data=field('DATA_INICIO_SINTOMA'),inten=field('INTENSIDADE'),outros=field('OUTROS_SINTOMAS');
 var rawInt=(String(inten||'').match(/-?\d+(?:[\.,]\d+)?/)||[])[0],n=rawInt!==undefined&&rawInt!==''?Number(String(rawInt).replace(',','.')):'';
 var dores=sint&&sint.toLowerCase()!=='não informado'?[{data:data,local:local,int:n,tipo:'',freq:'',gatilho:'',sint:outros?sint+' — '+outros:sint,obs:'Importado da IA'}]:[];
 var ct=field('CONSULTAS'),et=field('EXAMES');
 var consultas=ct&&ct.toLowerCase()!=='não informado'?splitRecords(ct).map(function(x){var m=x.match(/^(\d{1,2}\/\d{1,2}\/\d{4})\s*[:\-]?\s*(.*)$/);return {data:m?date(m[1]):'',esp:'',med:'',mot:m?m[2]:x,perg:'',obs:'Importado da IA',ret:''}}):[];
 var exames=et&&et.toLowerCase()!=='não informado'?splitRecords(et).map(function(x){var m=x.match(/^(.*?)(?:\s*\((\d{1,2}\/\d{1,2}\/\d{4})\))$/);return {nome:m?m[1].trim():'Exame informado',data:m?date(m[2]):'',res:m?m[1].trim():x,obs:'Importado da IA'}}):[];
 var meds=medText&&medText.toLowerCase()!=='não informado'?splitRecords(medText).map(function(x){return {nome:x,dose:'',freq:'',inicio:'',fim:'',pres:'',obs:'Importado da IA'}}):[];
 var vt=field('SINAIS_VITAIS'),v=vt&&vt.toLowerCase()!=='não informado'?splitRecords(vt).map(parseVital):[];
 var vx=field('VACINAS'),vax=vx&&vx.toLowerCase()!=='não informado'?splitRecords(vx).map(parseVaccine).filter(function(x){return x.nome}):[];
 var fh=field('HISTORICO_FAMILIAR'),fam=fh&&fh.toLowerCase()!=='não informado'?splitRecords(fh).map(parseFamily).filter(function(x){return x.parente||x.info}):[];
 var pai=field('DOENCAS_PAI'),mae=field('DOENCAS_MAE');
 function adicionarDoencaPaiMae(arr,valor,parente){
   var v=String(valor||'').trim();
   if(!v||v.toLowerCase()==='não informado')return;
   splitRecords(v).forEach(function(item){
     var rec={parente:parente,info:item};
     var existe=arr.some(function(x){return String(x.parente||'').toLowerCase()===parente.toLowerCase()&&String(x.info||'').trim().toLowerCase()===item.trim().toLowerCase()});
     if(!existe)arr.push(rec);
   });
 }
 adicionarDoencaPaiMae(fam,pai,'Pai');
 adicionarDoencaPaiMae(fam,mae,'Mãe');
 var lr=field('LEMBRETES'),r=lr&&lr.toLowerCase()!=='não informado'?splitRecords(lr).map(parseReminder).filter(function(x){return x.nome}):[];
 var dc=field('DOCUMENTOS'),docs=dc&&dc.toLowerCase()!=='não informado'?splitRecords(dc).map(parseDocument):[];
 return {p:p,dores:dores,consultas:consultas,meds:meds,exames:exames,vitais:v,vacinas:vax,familia:fam,lembretes:r,documentos:docs};
}
function importarVazio(v){
 var s=String(v==null?'':v).trim().toLowerCase();
 return !s||/^(não informado|nao informado|não disponível|nao disponivel|n\/a|-)$/i.test(s);
}
function validarDataImportada(v){
 if(importarVazio(v))return false;
 var s=String(v).trim();
 if(/^\d{4}-\d{2}-\d{2}(?:[t\s]\d{2}:\d{2}(?::\d{2})?)?$/.test(s))return !isNaN(new Date(s.replace(' ','T')).getTime());
 if(/^\d{1,2}[\/-]\d{1,2}[\/-]\d{4}$/.test(s))return true;
 return !isNaN(new Date(s).getTime());
}
function validarRegistroImportacao(tipo,x){
 var r=x&&typeof x==='object'?x:{},issues=[];
 function req(label,val){if(importarVazio(val)||String(val).trim().toLowerCase()==='exame informado')issues.push(label);}
 if(tipo==='dores'){
  req('data de início',r.data);
  req('local do sintoma',r.local);
  var n=Number(r.int);
  if(!Number.isFinite(n)||n<1||n>10)issues.push('intensidade 1–10');
 }else if(tipo==='consultas'){
  req('data',r.data);
  if(importarVazio(r.esp)&&importarVazio(r.motivo||r.mot)&&importarVazio(r.med))issues.push('especialidade ou motivo');
 }else if(tipo==='meds'){
  req('nome do medicamento',r.nome);
 }else if(tipo==='exames'){
  req('nome do exame',r.nome);req('data',r.data);
 }else if(tipo==='vitais'){
  req('data',r.data);
 }else if(tipo==='vacinas'){
  req('nome da vacina',r.nome);req('data',r.data);
 }else if(tipo==='familia'){
  req('parente/familiar',r.parente);req('condição/informação',r.info||r.cond||r.condicao);
 }else if(tipo==='lembretes'){
  req('descrição do lembrete',r.nome);req('data/hora',r.data);
 }else if(tipo==='documentos'){
  if(importarVazio(r.nome)||String(r.nome).trim().toLowerCase()==='documento informado')issues.push('nome do documento');
 }
 return issues;
}
function analisarQualidadeImportacao(n){
 var grupos=[['dores','😣 Sintoma'],['consultas','👨‍⚕️ Consulta'],['meds','💊 Medicamento'],['exames','🧪 Exame'],['vitais','📈 Sinal vital'],['vacinas','💉 Vacina'],['familia','🧬 Histórico familiar'],['lembretes','📌 Lembrete'],['documentos','📄 Documento']],items=[],problemas=[];
 grupos.forEach(function(g){
  var arr0=Array.isArray(n[g[0]])?n[g[0]]:[];
  arr0.forEach(function(x,i){var issues=validarRegistroImportacao(g[0],x),item={grupo:g[0],indice:i,label:g[1],issues:issues,registro:x};items.push(item);if(issues.length)problemas.push(item);});
 });
 return {itens:items,total:items.length,invalidos:problemas.length,problemas:problemas};
}
function validarResultadoImportacao(n){
 if(!n||typeof n!=='object')throw new Error('Resultado de importação inválido.');
 var grupos=['dores','consultas','meds','exames','vitais','vacinas','familia','lembretes','documentos'];
 var perfil=n.p&&typeof n.p==='object'?n.p:{};
 var reconhecidos=Object.keys(perfil).filter(function(k){var v=String(perfil[k]||'').trim();return v&&v.toLowerCase()!=='não informado'}).length;
 var registros=grupos.reduce(function(total,k){return total+(Array.isArray(n[k])?n[k].length:0)},0);
 if(!reconhecidos&&!registros)throw new Error('Nenhuma informação reconhecida.');
 return {perfil:reconhecidos,registros:registros,qualidade:analisarQualidadeImportacao(n)};
}
window.validarResultadoImportacao=validarResultadoImportacao;
function verificarGravacaoImportacao(n){
 var checks=[
  [K.d,n.dores],[K.c,n.consultas],[K.m,n.meds],[K.e,n.exames],
  [K.v,n.vitais],[K.vax,n.vacinas],[K.fam,n.familia],[K.r,n.lembretes],[K.doc,n.documentos]
 ];
 var falhas=[];
 checks.forEach(function(pair){
  var esperado=Array.isArray(pair[1])?pair[1].length:0;
  if(!esperado)return;
  var atual=get(pair[0]);
  if(!Array.isArray(atual)||atual.length<esperado)falhas.push(pair[0]);
 });
 return falhas;
}
function atualizarProgresso(p,step,status){var bar=$('importProgress'),pct=$('importPercent'),st=$('importStep'),msg=$('importStatus');if(bar)bar.style.width=p+'%';if(pct)pct.textContent=p+'%';if(st)st.textContent=step;if(msg)msg.textContent=status}
function esperar(ms){return new Promise(function(resolve){setTimeout(resolve,ms)})}
function criarDiagnosticoImportacao(code,step,error,raw){var box=$('importDiagnostic'),diag={versao:'V5.97',codigo:code,etapa:step,mensagem:String(error&&error.message||error||'Erro desconhecido'),tamanhoResposta:String(raw||'').length,navegador:navigator.userAgent,data:new Date().toISOString(),stack:String(error&&error.stack||'').split('\n').slice(0,4).join('\n')};if(box){box.style.display='block';box.innerHTML='<div class="alert danger"><b>🔎 Diagnóstico da falha</b><br>Versão: '+esc(diag.versao)+' · Etapa: '+esc(diag.etapa)+'<br>Código: <b>'+esc(diag.codigo)+'</b><pre style="white-space:pre-wrap;word-break:break-word">'+esc(JSON.stringify(diag,null,2))+'</pre></div>'}console.error('[Minha Saúde IA]',diag)}
function resumirImportacao(n){
 var p=n.p||{},campos=Object.keys(p).filter(function(k){return String(p[k]||'').trim()&&String(p[k]).toLowerCase()!=='não informado'});
 var blocos=[['👤 Perfil',campos.length+' campo(s) reconhecido(s)'],['😣 Sintomas',n.dores.length+' registro(s)'],['👨‍⚕️ Consultas',n.consultas.length+' registro(s)'],['💊 Medicamentos',n.meds.length+' registro(s)'],['🧪 Exames',n.exames.length+' registro(s)'],['📈 Sinais vitais',n.vitais.length+' registro(s)'],['💉 Vacinas',n.vacinas.length+' registro(s)'],['🧬 Histórico familiar',n.familia.length+' registro(s)'],['📌 Lembretes',n.lembretes.length+' registro(s)'],['📄 Documentos',n.documentos.length+' registro(s)']];
 var q=analisarQualidadeImportacao(n);
 var status=q.invalidos?'<div class="alert warn"><b>⚠️ '+q.invalidos+' registro(s) precisam de correção.</b><br>Corrija os campos abaixo ou exclua o registro. Nenhum registro incompleto poderá ser salvo.</div>':'<div class="alert safe"><b>✅ Verificação básica concluída.</b><br>Você ainda pode revisar qualquer informação antes de salvar.</div>';
 var detalhes=campos.slice(0,18).map(function(k){return '<div class="item"><b>'+esc(k.replace(/_/g,' '))+'</b><p>'+esc(String(p[k]))+'</p></div>'}).join('');
 var problemas=q.problemas.map(function(it){return '<div class="item danger"><div class="itemtop"><b>'+it.label+' '+(it.indice+1)+'</b><span class="tag">⚠️ Revisar</span></div><p>Falta ou está inválido: <b>'+esc(it.issues.join(', '))+'</b></p></div>'}).join('');
 return status+'<div class="grid2">'+blocos.map(function(x){return '<div class="card stat"><span>'+x[0]+'</span><b style="font-size:20px">'+x[1]+'</b></div>'}).join('')+'</div>'+
  (problemas?'<h3>🔎 Registros que precisam de atenção</h3><div class="list">'+problemas+'</div>':'')+
  '<h3 style="margin-top:16px">✏️ Dados que serão salvos</h3><p class="muted">Edite diretamente o JSON para corrigir datas, intensidade, nomes ou outros campos. Para remover um registro, apague o item correspondente da lista.</p>'+
  '<textarea id="importReviewJSON" style="width:100%;min-height:360px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;line-height:1.45;padding:13px;border:1px solid #d6deea;border-radius:14px;background:#fbfcfe">'+esc(JSON.stringify(n,null,2))+'</textarea>'+
  '<div class="row" style="margin-top:10px"><button type="button" class="btn secondary small" onclick="msaRevalidarImportacao()">🔄 Revalidar dados</button><span class="muted" style="align-self:center">O salvamento fica bloqueado enquanto houver registros inválidos.</span></div>'+
  '<div id="importReviewValidation" class="alert" style="margin-top:10px">Revise os dados e clique em “Revalidar dados”.</div>'+
  '<h3 style="margin-top:16px">👤 Principais campos encontrados</h3><div class="list">'+(detalhes||'<div class="empty">Nenhum campo de perfil reconhecido.</div>')+'</div>';
}
function msaLerImportacaoRevisada(){
 var area=$('importReviewJSON');if(!area)throw new Error('Área de revisão não encontrada.');
 var raw=String(area.value||'').trim();if(!raw)throw new Error('Os dados revisados estão vazios.');
 var obj;try{obj=JSON.parse(raw)}catch(e){throw new Error('O JSON revisado contém um erro de sintaxe. Corrija aspas, vírgulas e chaves antes de salvar.')}
 var n;try{n=normalizarImport(obj)}catch(e){throw new Error('Não foi possível reorganizar os dados revisados: '+(e.message||e))}
 return {n:n,q:analisarQualidadeImportacao(n)};
}
window.msaLerImportacaoRevisada=msaLerImportacaoRevisada;
window.msaRevalidarImportacao=function(){
 try{
  var r=msaLerImportacaoRevisada(),q=r.q,box=$('importReviewValidation');
  if(box){
   box.className='alert '+(q.invalidos?'warn':'safe');
   box.innerHTML=q.invalidos?'<b>⚠️ '+q.invalidos+' registro(s) ainda precisam de correção.</b><br>'+q.problemas.map(function(x){return esc(x.label+' '+(x.indice+1)+': '+x.issues.join(', '))}).join('<br>'):'✅ Nenhum problema obrigatório encontrado. Você pode salvar a importação revisada.';
  }
  window._importPendente=r.n;return r;
 }catch(e){
  var box=$('importReviewValidation');if(box){box.className='alert danger';box.textContent='❌ '+e.message}throw e;
 }
};
window.msaRenderRevisaoImportacao=function(n){
 window._importPendente=n;var box=$('importReviewContent');if(box)box.innerHTML=resumirImportacao(n);var modal=$('importReviewOverlay');if(modal)modal.style.display='flex';
};
window.cancelarImportacaoPendente=function(){window._importPendente=null;var modal=$('importReviewOverlay');if(modal)modal.style.display='none';if($('resultadoImport'))$('resultadoImport').innerHTML='<div class="alert">↩️ Importação cancelada. Nada foi salvo.</div>';};
window.confirmarImportacaoPendenteCore=function(){
 try{var r=msaLerImportacaoRevisada(),q=r.q;if(q.invalidos)throw new Error('Existem '+q.invalidos+' registro(s) incompleto(s) ou inválido(s). Corrija-os ou exclua-os antes de salvar.');window._importPendente=r.n;return r.n;}
 catch(e){var box=$('importReviewValidation');if(box){box.className='alert danger';box.innerHTML='❌ <b>Não foi salvo.</b> '+esc(e.message)}return null;}
};
async function processarImportacao(){
 var btn=$('importBtn'),loading=$('importLoading'),campo=$('importIA'),raw=campo?campo.value.trim():'';
 if(!raw){criarDiagnosticoImportacao('IMPORT_INPUT_001','Leitura da resposta',new Error('Campo de importação vazio'),raw);alert('Cole primeiro a resposta da IA.');return}
 try{
  if(btn){btn.disabled=true;btn.textContent='⏳ Importando…'}if(loading)loading.style.display='flex';
  atualizarProgresso(10,'Lendo resposta','Lendo as informações recebidas da IA…');$('resultadoImport').innerHTML='<div class="alert">⏳ Importação em andamento…</div>';await esperar(250);
  raw=raw.replace(/^\s*```(?:json|text)?\s*/i,'').replace(/\s*```\s*$/,'').trim();
  atualizarProgresso(30,'Organizando perfil','Separando seus dados pessoais e informações de saúde…');await esperar(250);
  var json=extrairJSONDaResposta(raw),n=json?normalizarImport(json):normalizarFichaIA(raw);
  var validacao=validarResultadoImportacao(n);
  var total=n.dores.length+n.consultas.length+n.meds.length+n.exames.length+n.vitais.length+n.vacinas.length+n.familia.length+n.lembretes.length+n.documentos.length+['nome','nasc','idade','sexo','altura','peso','objetivoCorporal','academia','academiaFreq','atividadeFisica','trabalhoTipo','horasSentado','horasPe','aguaDia','urinaDia','calorSuor','alimentacao','cond','alerg','circ','supl','info','emerg','tel','menstruacao','ciclo','duracaoMenstr','sexoFreq','camisinha','engravidou','mae','gestacoes','reproObs','usaAnticoncepcional','anticoncepcionalNome','anticoncepcionalHora','anticoncepcionalInicio','prevColo','mamografia','ist','hpv','prevProx','prevObs','dorcelaxFreq','paracetamolFreq','outrosDor','catapora','cataporaQuando'].filter(function(k){return String(n.p[k]||'').trim()&&String(n.p[k]).toLowerCase()!=='não informado'}).length;
  if(!total)throw new Error('Nenhuma informação reconhecida');
  atualizarProgresso(55,'Organizando histórico','Reconhecidos '+validacao.perfil+' campo(s) de perfil e '+validacao.registros+' registro(s). Preparando a revisão…');await esperar(250);
  atualizarProgresso(75,'Preparando salvamento','A importação foi analisada. Revise a prévia antes de confirmar o salvamento…');await esperar(250);
  abrirRevisaoImportacao(n);atualizarProgresso(90,'Aguardando revisão','Confira os dados. Nada será salvo até você confirmar.');await esperar(200);atualizarProgresso(100,'Pronto para revisar','Revise os dados na tela antes de confirmar.');await esperar(300);
 }catch(e){if(loading)loading.style.display='none';if(btn){btn.disabled=false;btn.textContent='✨ Importar e salvar'}criarDiagnosticoImportacao('IMPORT_RUNTIME_001','Processando importação',e,raw);$('resultadoImport').innerHTML='<div class="alert danger">❌ Não consegui importar. Veja o diagnóstico detalhado logo acima.</div>';return}
 if(loading)loading.style.display='none';if(btn){btn.disabled=false;btn.textContent='✨ Importar e salvar'}
}
function executarDiagnosticoImportacao(opcoes){
 var silencioso=opcoes&&opcoes.silencioso===true,resultado=[],inicio=Date.now();
 function teste(nome,fn){
  try{var valor=fn();resultado.push({nome:nome,ok:valor!==false,mensagem:valor===false?'Teste retornou falso':'OK'});}
  catch(e){resultado.push({nome:nome,ok:false,mensagem:String(e&&e.message||e)})}
 }
 teste('Módulo carregado',function(){return typeof window.processarImportacao==='function'});
 teste('Parser de ficha padrão',function(){
  var n=normalizarFichaIA('[NOME]\nJhonatan\n\n[DATA_NASCIMENTO]\n29/10/1988\n\n[ALTURA]\n1,84 m\n\n[PESO]\n84 kg');
  return n.p.nome==='Jhonatan'&&n.p.nasc==='1988-10-29'&&n.p.altura==='184'&&n.p.peso==='84';
 });
 teste('Parser com Markdown',function(){
  var n=normalizarFichaIA('### **[NOME]**\nJhonatan\n\n**[DATA_NASCIMENTO]**: 29/10/1988\n\n- [ALTURA]: 1,84 m');
  return n.p.nome==='Jhonatan'&&n.p.nasc==='1988-10-29'&&n.p.altura==='184';
 });
 teste('Parser com separador =',function(){
  var n=normalizarFichaIA('[NOME] = Jhonatan\n[PESO] = 84 kg');
  return n.p.nome==='Jhonatan'&&n.p.peso==='84';
 });
 teste('Extração JSON com Markdown',function(){
  var j=extrairJSONDaResposta('Aqui está:\n\`\`\`json\n{"perfil":{"nome":"Jhonatan","data_nascimento":"29/10/1988"}}\n\`\`\`');
  return !!j&&j.perfil&&j.perfil.nome==='Jhonatan';
 });
 teste('Normalização JSON',function(){
  var j={perfil:{nome:'Jhonatan',data_nascimento:'29/10/1988',altura:'1,84 m',peso:'84 kg'},medicamentos:[{nome:'Teste'}]};
  var n=normalizarImport(j);
  return n.p.nome==='Jhonatan'&&n.p.nasc==='29/10/1988'&&n.meds.length===1;
 });
 teste('Validação impede importação vazia',function(){
  try{validarResultadoImportacao({p:{},dores:[],consultas:[],meds:[],exames:[],vitais:[],vacinas:[],familia:[],lembretes:[],documentos:[]});return false}catch(e){return /Nenhuma informação reconhecida/i.test(String(e.message||e))}
 });
 teste('Armazenamento temporário grava e lê',function(){
  var chave='msa2_import_diagnostic_tmp',valor='diagnostico-'+Date.now(),ok=set(chave,valor);
  var l=window.msaStorage.getItem(chave),igual=l===JSON.stringify(valor);
  try{window.msaStorage.removeItem(chave)}catch(e){}
  return ok&&igual&&window.msaStorage.getItem(chave)===null;
 });
 var falhas=resultado.filter(function(x){return !x.ok}),total=resultado.length,tempo=Date.now()-inicio;
 var resumo={versao:'V5.75',total:total,aprovados:total-falhas.length,falhas:falhas.length,duracaoMs:tempo,resultados:resultado};
 window._importDiagnostico=resumo;
 var box=document.getElementById('importDiagnostic');
 if(box&&!silencioso){
  box.style.display='block';
  box.innerHTML='<div class="alert '+(falhas.length?'danger':'safe')+'"><b>'+(falhas.length?'⚠️ Autoteste encontrou problema':'✅ Autoteste da importação aprovado')+'</b><br>Versão: <b>'+esc(resumo.versao)+'</b> · '+resumo.aprovados+'/'+total+' testes aprovados · '+tempo+' ms</div><div class="list">'+resultado.map(function(x){return '<div class="item"><b>'+(x.ok?'✅ ':'❌ ')+esc(x.nome)+'</b><p>'+esc(x.mensagem)+'</p></div>'}).join('')+'</div>';
 }
 console[falhas.length?'error':'info']('[Minha Saúde IA] Autoteste importação',resumo);
 return resumo;
}
window.executarDiagnosticoImportacao=executarDiagnosticoImportacao;
function instalarDiagnosticoImportacao(){
 if(new URLSearchParams(location.search).get('pagina')!=='importar')return;
 var btn=document.getElementById('importBtn');if(!btn||document.getElementById('importDiagnosticBtn'))return;
 var b=document.createElement('button');b.id='importDiagnosticBtn';b.type='button';b.className='btn secondary small';b.textContent='🧪 Testar importador';b.title='Executa testes locais sem alterar seus dados de saúde';
 b.onclick=function(){executarDiagnosticoImportacao({silencioso:false})};
 btn.parentNode.insertBefore(b,btn.nextSibling);
 if(new URLSearchParams(location.search).get('diagnostico')==='importacao')setTimeout(function(){executarDiagnosticoImportacao({silencioso:false})},150);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',instalarDiagnosticoImportacao);else instalarDiagnosticoImportacao();

function limparImportacao(){if($('importIA'))$('importIA').value='';if($('resultadoImport'))$('resultadoImport').innerHTML='';if($('importDiagnostic')){$('importDiagnostic').style.display='none';$('importDiagnostic').innerHTML=''}}
window.processarImportacao=processarImportacao;
window.limparImportacao=limparImportacao;
window._importacaoModuloV597=true;

/* PDF -> ficha estruturada: extração local, sem envio automático */
function carregarPDFJS(){
 return new Promise(function(resolve,reject){
  if(window.pdfjsLib){resolve(window.pdfjsLib);return}
  var s=document.createElement('script');
  s.src='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
  s.onload=function(){if(window.pdfjsLib){window.pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';resolve(window.pdfjsLib)}else reject(new Error('PDF.js não carregou'))};
  s.onerror=function(){reject(new Error('Não foi possível carregar o leitor de PDF'))};
  document.head.appendChild(s);
 });
}
async function extrairTextoPDFArquivo(file){
 if(!file)throw new Error('Selecione um PDF.');
 if(file.size>10*1024*1024)throw new Error('O PDF deve ter no máximo 10 MB.');
 var pdfjs=await carregarPDFJS(),buf=await file.arrayBuffer(),pdf=await pdfjs.getDocument({data:buf}).promise,paginas=[];
 for(var n=1;n<=pdf.numPages;n++){
  var page=await pdf.getPage(n),tc=await page.getTextContent(),itens=tc.items||[],linhas=[],linha='',ultimoY=null;
  itens.forEach(function(item){
   var str=String(item.str||''),y=item.transform&&item.transform.length?item.transform[5]:null;
   if(ultimoY!==null&&y!==null&&Math.abs(y-ultimoY)>3&&linha.trim()){linhas.push(linha.trim());linha=''}
   linha+=(linha?' ':'')+str;if(y!==null)ultimoY=y;
  });
  if(linha.trim())linhas.push(linha.trim());paginas.push(linhas.join('\n'));
 }
 return {text:paginas.join('\n\n'),pages:pdf.numPages};
}
function normalizarTextoPDFParaImportacao(raw){
 var t=String(raw||'').replace(/\u00a0/g,' ').replace(/\r/g,'').replace(/[ \t]+/g,' ').replace(/\n{3,}/g,'\n\n'),out=[];
 function val(label){var m=t.match(new RegExp('(?:^|\\n|\\s)'+label+'\\s*:\\s*([^\\n]+)','i'));return m?m[1].trim():''}
 function add(k,v){if(v&&v.trim()&&!/^não informado$|^nao informado$/i.test(v.trim()))out.push(k+': '+v.trim())}
 out.push('[PERFIL]');
 add('NOME',val('Nome'));add('DATA_NASCIMENTO',val('Nascimento'));add('IDADE',val('Idade'));add('SEXO',val('Sexo'));add('TIPO_SANGUINEO',val('Tipo sanguíneo'));add('ALTURA',val('Altura'));add('PESO',val('Peso'));add('OBJETIVO_CORPORAL',val('Objetivo corporal'));add('ACADEMIA',val('Academia'));add('FREQUENCIA_ACADEMIA',val('Frequência academia'));add('ATIVIDADE_FISICA',val('Atividade física'));add('TRABALHO_TIPO',val('Trabalho'));add('HORAS_SENTADO',val('Horas sentado'));add('HORAS_EM_PE',val('Horas em pé'));add('AGUA_POR_DIA',val('Água por dia'));add('FREQUENCIA_URINARIA',val('Frequência urinária'));add('FREQUENCIA_EVACUACAO',val('Frequência de evacuação'));add('EXPOSICAO_CALOR_SUOR',val('Exposição a calor/suor'));add('ALIMENTACAO',val('Alimentação'));add('ALERGIAS',val('Alergias'));add('DOENCAS',val('Condições'));add('CIRURGIAS_INTERNACOES',val('Cirurgias/internações'));add('INFORMACOES_IMPORTANTES',val('Informações importantes'));
 var blocos=[['SINTOMAS','[SINTOMAS]','[CONSULTAS]'],['CONSULTAS','[CONSULTAS]','[MEDICAMENTOS]'],['MEDICAMENTOS','[MEDICAMENTOS]','[EXAMES]'],['EXAMES','[EXAMES]','[SINAIS VITAIS]'],['SINAIS VITAIS','[SINAIS VITAIS]','[VACINAS]'],['VACINAS','[VACINAS]','[HISTÓRICO FAMILIAR]'],['HISTÓRICO FAMILIAR','[HISTÓRICO FAMILIAR]','[SONO E BEM-ESTAR]'],['SONO E BEM-ESTAR','[SONO E BEM-ESTAR]','[LEMBRETES]'],['LEMBRETES','[LEMBRETES]','Este arquivo organiza']];
 blocos.forEach(function(b){var start=t.indexOf(b[1]),end=t.indexOf(b[2],start+1);if(start<0)return;var body=(end>start?t.slice(start+b[1].length,end):t.slice(start+b[1].length)).trim();if(!body||/^Nenhum registro/i.test(body))return;out.push(b[1]);if(b[0]==='SONO E BEM-ESTAR'){var sm=body.match(/Rotina habitual de sono:\s*normalmente dorme às\s*([^ ]+)\s*e acorda às\s*([^—-]+)\s*[—-]\s*cerca de\s*([\d.,]+)\s*horas por noite/i);if(sm)out.push('SONO_HABITUAL: '+sm[1]+' -> '+sm[2]+' ('+sm[3]+' horas)')}else out.push(body)});
 return out.join('\n');
}

function carregarTesseract(){
 return new Promise(function(resolve,reject){
  if(window.Tesseract){resolve(window.Tesseract);return}
  var s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
  s.onload=function(){window.Tesseract?resolve(window.Tesseract):reject(new Error('OCR não carregou'))};
  s.onerror=function(){reject(new Error('Não foi possível carregar o OCR'))};
  document.head.appendChild(s);
 });
}
async function extrairTextoPDFComOCR(file,status){
 var pdfjs=await carregarPDFJS(),T=await carregarTesseract(),buf=await file.arrayBuffer(),pdf=await pdfjs.getDocument({data:buf}).promise,partes=[];
 var worker=await T.createWorker('por',1,{logger:function(m){if(status&&m&&m.status&&typeof m.progress==='number')status.innerHTML='🔎 OCR: '+m.status+' '+Math.round(m.progress*100)+'%'}}); 
 for(var n=1;n<=pdf.numPages;n++){
  if(status)status.innerHTML='🔎 OCR: lendo página '+n+' de '+pdf.numPages+'…';
  var page=await pdf.getPage(n),vp=page.getViewport({scale:1.7}),canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');
  canvas.width=Math.ceil(vp.width);canvas.height=Math.ceil(vp.height);
  await page.render({canvasContext:ctx,viewport:vp}).promise;
  var res=await worker.recognize(canvas);partes.push(res.data.text||'');
 }
 await worker.terminate();return {text:partes.join('\n\n'),pages:pdf.numPages,ocr:true};
}

async function lerPDFParaImportacao(ev){
 var file=ev&&ev.target&&ev.target.files?ev.target.files[0]:null,status=document.getElementById('pdfImportStatus'),preview=document.getElementById('pdfImportPreview');
 if(status)status.innerHTML='⏳ Lendo o PDF localmente…';if(preview)preview.style.display='none';
 try{var r=await extrairTextoPDFArquivo(file);if(!r.text.trim()){r=await extrairTextoPDFComOCR(file,status);if(!r.text.trim())throw new Error('Não foi possível reconhecer texto neste PDF.');}var ficha=normalizarTextoPDFParaImportacao(r.text),area=document.getElementById('importIA');if(area)area.value=ficha;if(status)status.innerHTML='✅ PDF lido com sucesso. Nenhum dado foi salvo ainda.';if(preview){preview.style.display='block';preview.innerHTML='<b>🔎 PDF analisado</b><br><span class="muted">'+r.pages+' página(s) · '+ficha.split(/\n/).filter(Boolean).length+' linhas estruturadas.</span><br><br><b>Próximo passo:</b> revise a ficha e clique em <b>✨ Importar e salvar</b>. O aplicativo ainda mostrará a prévia antes de gravar.'}if(area)area.scrollIntoView({behavior:'smooth',block:'center'})}catch(e){if(status)status.innerHTML='⚠️ '+(e.message||'Não foi possível ler o PDF.')}finally{if(ev&&ev.target)ev.target.value=''}
}
window.lerPDFParaImportacao=lerPDFParaImportacao;
