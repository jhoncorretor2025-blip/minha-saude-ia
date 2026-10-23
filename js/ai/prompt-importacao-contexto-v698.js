/* Minha Saúde IA V7.11 — botão na Home para gerar somente campos pendentes. */
(function(){
'use strict';
const $=id=>document.getElementById(id);
let basePrompt='';
let lastContext=null;
function read(key){
 try{const value=window.MSAStorage&&typeof window.MSAStorage.get==='function'?window.MSAStorage.get(key):[];return Array.isArray(value)?value:(value&&typeof value==='object'?[value]:[])}catch(_){return []}
}
function getProfile(){return read('msa2_perfil')[0]||{}}
function isEmpty(v){return v==null||String(v).trim()===''||/^(não informado|nao informado|não informada|nao informada|nenhum|nenhuma|n\/a|-)$/i.test(String(v).trim())}
function norm(v){return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim()}
function splitConditionText(value){return String(value||'').split(/[\n;|]+|,\s+(?=[A-ZÁÉÍÓÚÂÊÔÃÕÇ])/).map(x=>x.trim()).filter(x=>!isEmpty(x))}
function nameOf(record){
 if(typeof record==='string')return record;
 if(!record||typeof record!=='object')return '';
 return record.nome||record.nomeCondicao||record.condicao||record.doenca||record.diagnostico||record.titulo||record.problema||record.name||'';
}
function collectConditions(){
 const p=getProfile(),found=[];
 function add(value,includeDetails){
  if(value==null||value==='')return;
  if(Array.isArray(value)){value.forEach(x=>add(x,includeDetails));return}
  if(typeof value==='string'){splitConditionText(value).forEach(x=>found.push(x));return}
  if(typeof value==='object'){
   const name=nameOf(value);
   if(name&&!isEmpty(name)){const detail=includeDetails?(value.observacao||value.descricao||value.status||value.detalhe||''):'';found.push(String(name)+(detail&&!norm(detail).includes(norm(name))?' — '+detail:''))}
   ['condicoes','doencas','diagnosticos','historicoMedico','historico_medico'].forEach(k=>{if(value[k])add(value[k],includeDetails)});
  }
 }
 add(p.cond,false);add(p.condicoes,true);add(p.doencas,true);add(p.diagnosticos,true);
 add(read('msa2_condicoes'),true);add(read('msa2_historico_medico'),true);
 const unique=[],seen=new Set();
 found.forEach(text=>{const s=String(text||'').trim(),key=norm(s);if(!key||seen.has(key))return;seen.add(key);unique.push(s)});
 return unique;
}
function collectContext(){
 const p=getProfile();let summary='';
 try{if(typeof window.healthText==='function')summary=window.healthText();else if(typeof healthText==='function')summary=healthText()}catch(e){console.warn('[Prompt IA] Não foi possível montar o resumo completo:',e)}
 return prepararContextoCampos({profile:p,name:p.nome||'perfil selecionado',conditions:collectConditions(),important:String(p.info||p.informacoesImportantes||p.informacoes||p.historicoClinico||'').trim(),summary:String(summary||'').trim()});
}
const MAX_PROMPT_CHARS=8000;
const FICHA_FIELDS=[
'NOME','DATA_NASCIMENTO','IDADE','SEXO','TIPO_SANGUINEO','ALTURA','PESO','OBJETIVO_CORPORAL',
'ACADEMIA','FREQUENCIA_ACADEMIA','ATIVIDADE_FISICA','TRABALHO_TIPO','HORAS_SENTADO','HORAS_EM_PE',
'AGUA_POR_DIA','FREQUENCIA_URINARIA','FREQUENCIA_EVACUACAO','EXPOSICAO_CALOR_SUOR','ALIMENTACAO',
'DOENCAS','DOENCAS_PAI','DOENCAS_MAE','ALERGIAS','CIRURGIAS_INTERNACOES','CONTATO_EMERGENCIA',
'TELEFONE_EMERGENCIA','ULTIMA_MENSTRUACAO','CICLO_MENSTRUAL','DURACAO_MENSTRUACAO','FREQUENCIA_SEXUAL_MIN',
'FREQUENCIA_SEXUAL_MAX','MASTURBACAO_POR_DIA','USO_PRESERVATIVO','JA_ENGRAVIDOU','JA_FOI_MAE',
'NUMERO_GESTACOES','HISTORICO_REPRODUTIVO','ULTIMO_PREVENTIVO_COLO','ULTIMA_MAMOGRAFIA','ULTIMO_TESTE_IST',
'VACINA_HPV','PROXIMO_PREVENTIVO','OBSERVACOES_PREVENCAO','FREQUENCIA_DORCELAX','FREQUENCIA_PARACETAMOL',
'OUTROS_REMEDIOS_DOR','JA_TEVE_CATAPORA','QUANDO_CATAPORA','MEDICAMENTOS','SUPLEMENTOS','ULTIMO_SINTOMA',
'LOCAL_SINTOMA','DATA_INICIO_SINTOMA','INTENSIDADE','OUTROS_SINTOMAS','CONSULTAS','EXAMES','SINAIS_VITAIS',
'VACINAS','HISTORICO_FAMILIAR','LEMBRETES','DOCUMENTOS','INFORMACOES_IMPORTANTES'
];
const PROFILE_FIELD_MAP={
 'NOME':['nome'],'DATA_NASCIMENTO':['nasc','nascimento'],'IDADE':['idade'],'SEXO':['sexo'],
 'TIPO_SANGUINEO':['sangue','tipoSanguineo'],'ALTURA':['altura'],'PESO':['peso'],
 'OBJETIVO_CORPORAL':['objetivoCorporal'],'ACADEMIA':['academia'],'FREQUENCIA_ACADEMIA':['academiaFreq'],
 'ATIVIDADE_FISICA':['atividadeFisica'],'TRABALHO_TIPO':['trabalhoTipo'],'HORAS_SENTADO':['horasSentado'],
 'HORAS_EM_PE':['horasPe'],'AGUA_POR_DIA':['aguaDia'],'FREQUENCIA_URINARIA':['urinaDia'],
 'FREQUENCIA_EVACUACAO':['evacuacaoDia'],'EXPOSICAO_CALOR_SUOR':['calorSuor'],'ALIMENTACAO':['alimentacao'],
 'ALERGIAS':['alerg','alergias'],'CIRURGIAS_INTERNACOES':['circ'],'CONTATO_EMERGENCIA':['emerg'],
 'TELEFONE_EMERGENCIA':['tel'],'ULTIMA_MENSTRUACAO':['menstruacao'],'CICLO_MENSTRUAL':['ciclo'],
 'DURACAO_MENSTRUACAO':['duracaoMenstr'],'FREQUENCIA_SEXUAL_MIN':['sexoFreqMin','sexoFreq'],
 'FREQUENCIA_SEXUAL_MAX':['sexoFreqMax'],'MASTURBACAO_POR_DIA':['masturbacaoDia'],
 'USO_PRESERVATIVO':['camisinha'],'JA_ENGRAVIDOU':['engravidou'],'JA_FOI_MAE':['mae'],
 'NUMERO_GESTACOES':['gestacoes'],'HISTORICO_REPRODUTIVO':['reproObs'],
 'USA_ANTICONCEPCIONAL':['usaAnticoncepcional'],'METODO_ANTICONCEPCIONAL':['anticoncepcionalMetodo'],
 'NOME_ANTICONCEPCIONAL':['anticoncepcionalNome'],'HORARIO_ANTICONCEPCIONAL':['anticoncepcionalHora'],
 'INICIO_ANTICONCEPCIONAL':['anticoncepcionalInicio'],'REGIME_ANTICONCEPCIONAL':['anticoncepcionalRegime'],
 'TIPO_MINIPILULA':['minipilulaTipo'],'ULTIMO_PREVENTIVO_COLO':['prevColo'],'ULTIMA_MAMOGRAFIA':['mamografia'],
 'ULTIMO_TESTE_IST':['ist'],'VACINA_HPV':['hpv'],'PROXIMO_PREVENTIVO':['prevProx'],
 'OBSERVACOES_PREVENCAO':['prevObs'],'FREQUENCIA_DORCELAX':['dorcelaxFreq'],
 'FREQUENCIA_PARACETAMOL':['paracetamolFreq'],'OUTROS_REMEDIOS_DOR':['outrosDor'],
 'JA_TEVE_CATAPORA':['catapora'],'QUANDO_CATAPORA':['cataporaQuando'],'INFORMACOES_IMPORTANTES':['info']
};
function isKnownValue(value){
 if(Array.isArray(value))return value.length>0;
 if(value&&typeof value==='object')return Object.keys(value).length>0;
 if(typeof value==='boolean')return value;
 return !isEmpty(value);
}
function calculateAgeFromBirthdate(value){
 if(!value)return '';
 const raw=String(value).trim();let d;
 const iso=raw.match(/^(\d{4})-(\d{2})-(\d{2})$/),br=raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
 if(iso)d=new Date(Number(iso[1]),Number(iso[2])-1,Number(iso[3]));
 else if(br)d=new Date(Number(br[3]),Number(br[2])-1,Number(br[1]));
 else d=new Date(raw);
 if(!d||Number.isNaN(d.getTime()))return '';
 const now=new Date();let age=now.getFullYear()-d.getFullYear();
 if(now.getMonth()<d.getMonth()||(now.getMonth()===d.getMonth()&&now.getDate()<d.getDate()))age--;
 return age>=0&&age<130?String(age):'';
}
function matchingFamilyEntries(family,needle){
 return family.some(x=>norm(x&&x.parente||'').includes(needle)&&isKnownValue(x&&(x.info||x.cond||x.condicao||x.diagnostico)));
}
function calculateFilledFields(ctx){
 const p=ctx.profile||{},filled=new Set();
 const mark=(field,...values)=>{if(values.some(isKnownValue))filled.add(field)};
 Object.keys(PROFILE_FIELD_MAP).forEach(field=>mark(field,...PROFILE_FIELD_MAP[field].map(k=>p[k])));
 if(isKnownValue(p.idade)||calculateAgeFromBirthdate(p.nasc))filled.add('IDADE');
 const conditionRecords=[...read('msa2_condicoes'),...read('msa2_historico_medico'),...read('msa2_historico_condicoes'),...read('msa2_doencas')];
 mark('DOENCAS',p.cond,p.condicoes,p.doencas,p.diagnosticos,ctx.conditions,conditionRecords);
 const family=read('msa2_familia');
 mark('DOENCAS_PAI',p.doencasPai,p.doencas_pai,p.historicoDoencasPai,matchingFamilyEntries(family,'pai')?'informado':'');
 mark('DOENCAS_MAE',p.doencasMae,p.doencas_mae,p.historicoDoencasMae,matchingFamilyEntries(family,'mae')?'informado':'',matchingFamilyEntries(family,'mãe')?'informado':'');
 if(family.length)filled.add('HISTORICO_FAMILIAR');
 const meds=read('msa2_meds'),supplements=read('msa2_suplementos'),symptoms=read('msa2_dores');
 mark('MEDICAMENTOS',p.medicamentos,meds);
 mark('SUPLEMENTOS',p.supl,p.suplementos,supplements);
 mark('CONSULTAS',read('msa2_consultas'));
 mark('EXAMES',read('msa2_exames'));
 mark('SINAIS_VITAIS',read('msa2_vitais'));
 mark('VACINAS',read('msa2_vacinas'));
 mark('LEMBRETES',read('msa2_lembretes'));
 mark('DOCUMENTOS',read('msa2_documentos'));
 const last=symptoms.length?symptoms[symptoms.length-1]:{};
 mark('ULTIMO_SINTOMA',p.ultimoSintoma,last.sint,last.sintoma,last.outros_sintomas);
 mark('LOCAL_SINTOMA',p.localSintoma,last.local,last.onde,last.regiao);
 mark('DATA_INICIO_SINTOMA',p.dataInicioSintoma,last.data,last.inicio,last.quando);
 mark('INTENSIDADE',p.intensidade,last.int,last.intensidade,last.intensidade_0_10);
 mark('OUTROS_SINTOMAS',p.outrosSintomas,last.outros_sintomas,last.obs,last.observacoes);
 mark('ALIMENTACAO',p.alimentacao,read('msa2_nutri'));
 mark('CONTATO_EMERGENCIA',p.emerg,read('msa2_emergencia'));
 mark('TELEFONE_EMERGENCIA',p.tel,read('msa2_emergencia'));
 mark('ALERGIAS',p.alerg,p.alergias,read('msa2_alergias'));
 mark('PESO',p.peso,read('msa2_medidas_corporais').map(x=>x&&x.peso));
 if(isKnownValue(p.endereco||p.endereço||p.address))filled.add('ENDERECO');
 return filled;
}
const SUMMARY_PROFILE_LABELS={
 'nome':'NOME','nascimento':'DATA_NASCIMENTO','idade':'IDADE','sexo':'SEXO',
 'tipo sanguineo':'TIPO_SANGUINEO','altura':'ALTURA','peso':'PESO','objetivo corporal':'OBJETIVO_CORPORAL',
 'academia':'ACADEMIA','frequencia academia':'FREQUENCIA_ACADEMIA','atividade fisica':'ATIVIDADE_FISICA',
 'trabalho':'TRABALHO_TIPO','horas sentado':'HORAS_SENTADO','horas em pe':'HORAS_EM_PE',
 'agua por dia':'AGUA_POR_DIA','frequencia urinaria (opcional)':'FREQUENCIA_URINARIA',
 'frequencia de evacuacao (opcional)':'FREQUENCIA_EVACUACAO','exposicao a calor/suor':'EXPOSICAO_CALOR_SUOR',
 'alimentacao':'ALIMENTACAO','alergias':'ALERGIAS','condicoes':'DOENCAS',
 'cirurgias/internacoes':'CIRURGIAS_INTERNACOES','informacoes importantes':'INFORMACOES_IMPORTANTES',
 'uso de dorcelax':'FREQUENCIA_DORCELAX','uso de paracetamol':'FREQUENCIA_PARACETAMOL',
 'outros remedios para dor/febre':'OUTROS_REMEDIOS_DOR','ja teve catapora':'JA_TEVE_CATAPORA','quando teve catapora':'QUANDO_CATAPORA'
};
function stripPrefilledProfileLines(summary,filled){
 let section='',out=[];
 String(summary||'').split('\n').forEach(line=>{
  const t=line.trim();
  if(/^\[[A-ZÁÉÍÓÚÂÊÔÃÕÇ_ ]+\]$/.test(t)){section=norm(t.slice(1,-1));out.push(line);return}
  if(section==='perfil'){
   const colon=t.indexOf(':');
   if(colon>0){
    const label=norm(t.slice(0,colon)),field=SUMMARY_PROFILE_LABELS[label];
    if(field&&filled.has(field))return;
   }
  }
  out.push(line);
 });
 return out.join('\n').replace(/\n{3,}/g,'\n\n').trim();
}
function prepararContextoCampos(ctx){
 const filled=calculateFilledFields(ctx);
 ctx.filledFields=filled;
 ctx.alreadyFilled=FICHA_FIELDS.filter(k=>filled.has(k));
 ctx.pendingFields=FICHA_FIELDS.filter(k=>!filled.has(k));
 ctx.summary=stripPrefilledProfileLines(ctx.summary,filled);
 return ctx;
}

function compactTemplate(fields){
 fields=Array.isArray(fields)?fields:FICHA_FIELDS;
 return [
 'Prepare uma ficha organizada para importar no aplicativo Minha Saúde IA.',
 'Responda em português, SEM fazer perguntas. Use somente dados conhecidos nas fontes/memória e no contexto local abaixo. Nunca invente nem estime dados; campo ausente = "Não informado". Não faça diagnóstico, não indique tratamento e não misture informações de familiares.',
 'CONDIÇÕES: preserve TODOS os nomes e detalhes. Em DOENCAS liste todas as condições da pessoa; em DOENCAS_PAI e DOENCAS_MAE registre somente antecedentes do respectivo pai/mãe. Diferencie doença diagnosticada, sintoma e suspeita quando isso estiver claro na fonte.',
 'O formato de saída abaixo contém SOMENTE campos ainda não preenchidos no aplicativo. Campos já preenchidos foram omitidos: não pergunte sobre eles e não os devolva novamente. Campos omitidos devem permanecer exatamente como já estão no perfil.',
 'FORMATO OBRIGATÓRIO: devolva somente os campos abaixo, na mesma ordem, um por linha, exatamente como [CHAVE]: valor. Para listas com vários registros, separe itens por ponto e vírgula. Não acrescente explicações, Markdown ou texto fora dos campos.',
 ...(fields.length?fields.map(k=>'['+k+']: Não informado'):['NENHUM_CAMPO_PENDENTE: Todos os campos estruturados já estão preenchidos; não peça nem repita informações existentes.']),
 'REGRAS: preserve todos os dados relevantes disponíveis. Inclua datas, dose e frequência de medicamentos quando conhecidas; em exames e sinais vitais mantenha data e resultado/valor. Para vacinas informe nome, data e dose quando conhecida. No histórico familiar identifique o parentesco. Preserve informações corporais, hábitos e saúde reprodutiva somente quando disponíveis. Se houver divergência, registre-a em INFORMACOES_IMPORTANTES. Não crie exames, documentos ou medicamentos inexistentes.'
 ].join('\n');
}
function makePriorityContext(ctx){
 const lines=[
 '===== CONTEXTO LOCAL DO PERFIL ATIVO =====',
 'Perfil: '+ctx.name,
 'CONDIÇÕES CADASTRADAS ('+ctx.conditions.length+'):',
 ...(ctx.conditions.length?ctx.conditions.map(x=>'- '+x):['Nenhuma condição encontrada nos campos estruturados.']),
 'INFORMAÇÕES IMPORTANTES DO PERFIL:',
 ctx.important||'Não informado.',
 '===== FIM DO CONTEXTO PRIORITÁRIO ====='
 ];
 return lines.join('\n');
}
function generate(){
 const field=$('promptIA');if(!field)return '';
 const ctx=collectContext();
 if(!ctx.pendingFields.length){const message='Todos os campos estruturados deste modelo já parecem preenchidos. Não há campos pendentes para gerar; confira seu perfil antes de importar novas informações.';const status=ensureStatus();if(status)status.textContent=message;const guide=$('iaGuidePrompt');if(guide)guide.value=message;updatePromptCount('', 'normal', message);return '';}
 const template=compactTemplate(ctx.pendingFields);
 const priority=makePriorityContext(ctx);
 const summaryHeader='\n\nRESUMO COMPLEMENTAR DOS REGISTROS LOCAIS (use apenas o que couber; as condições acima têm prioridade):\n';
 const separator='\n\n';
 const notice='\n[Resumo complementar reduzido para respeitar o limite da mensagem; consulte primeiro a lista completa de condições e informações importantes acima.]';
 const fixed=template+separator+priority+summaryHeader;
 let budget=Math.max(0,MAX_PROMPT_CHARS-fixed.length-notice.length);
 let summary=String(ctx.summary||'').trim();
 let clipped=false;
 if(summary.length>budget){summary=summary.slice(0,budget).replace(/\s+\S*$/,'').trim();clipped=true}
 let prompt=fixed+summary+(clipped?notice:'');
 // In unusually large profiles, preserve the disease list and concise schema first; reduce only the long free-text notes/summary.
 if(prompt.length>MAX_PROMPT_CHARS){
  let shrink=Math.min(ctx.important.length,prompt.length-MAX_PROMPT_CHARS+20);
  if(shrink>0){
   ctx.important=ctx.important.slice(0,Math.max(0,ctx.important.length-shrink))+' [texto reduzido por limite de caracteres]';
   const p2=makePriorityContext(ctx);
   const f2=template+separator+p2+summaryHeader;
   budget=Math.max(0,MAX_PROMPT_CHARS-f2.length-notice.length);
   summary=String(ctx.summary||'').trim();
   if(summary.length>budget){summary=summary.slice(0,budget).replace(/\s+\S*$/,'').trim();clipped=true}
   prompt=f2+summary+(clipped?notice:'');
  }
 }
 field.value=prompt;
 const guide=$('iaGuidePrompt');if(guide)guide.value=prompt;
 lastContext=ctx;
 updateStatus(ctx,'✅ Prompt padrão: '+prompt.length.toLocaleString('pt-BR')+' caracteres. '+ctx.conditions.length+' condição(ões) priorizadas. '+(clipped?'O resumo complementar foi reduzido para caber no limite. ':'')+'Revise antes de compartilhar.');
 updatePromptCount(prompt,'normal',clipped?'O resumo complementar foi reduzido para respeitar o limite do modo padrão.':'Modo padrão ativo: prompt completo, com limite de segurança de 8.000 caracteres.');
 return prompt;
}
function ensureStatus(){
 let s=$('msaPromptContextStatus');if(s)return s;
 s=document.createElement('div');s.id='msaPromptContextStatus';s.setAttribute('role','status');s.setAttribute('aria-live','polite');
 s.style.cssText='margin-top:8px;padding:10px 12px;border:1px solid #c7e9d7;background:#f0fdf4;color:#166534;border-radius:12px;font-size:12px;line-height:1.5;font-weight:750';
 const cta=document.querySelector('.ai-cta');
 if(cta&&cta.parentNode)cta.insertAdjacentElement('afterend',s);else if($('promptIA'))$('promptIA').insertAdjacentElement('beforebegin',s);
 return s;
}
function updateStatus(ctx,message){
 const s=ensureStatus();if(!s)return;
 if(message){s.textContent=message;return}
 const n=document.getElementById('promptIA')?.value?.length||0;s.textContent='✅ Prompt compacto: '+n.toLocaleString('pt-BR')+' de '+MAX_PROMPT_CHARS.toLocaleString('pt-BR')+' caracteres. '+ctx.conditions.length+' condição(ões) identificadas. Revise antes de enviar; nada é compartilhado automaticamente.';
}
function copyFallback(){const field=$('promptIA')||$('iaGuidePrompt');if(!field)return false;try{field.focus();field.select();return document.execCommand('copy')}catch(_){return false}}
function copyPrompt(){
 const prompt=generateSelectedMode();if(!prompt)return;
 const status=$('copiado');
 const done=()=>{if(status)status.textContent='✅ Prompt gerado e copiado! Abra o ChatGPT ou Gemini e cole a mensagem.';updateStatus(lastContext,'✅ Prompt gerado com '+lastContext.conditions.length+' condição(ões) e copiado. Abra a IA e cole o texto. Nada foi enviado automaticamente.')};
 if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(prompt).then(done).catch(()=>{if(copyFallback())done();else{if(status)status.textContent='⚠️ Prompt gerado, mas não copiou automaticamente. Selecione o texto e copie manualmente.';updateStatus(lastContext,'⚠️ Prompt gerado. A cópia automática falhou; selecione o texto e copie manualmente.')}});
 else if(copyFallback())done();else if(status)status.textContent='⚠️ Prompt gerado. Selecione o texto e copie manualmente.';
}
function openAI(provider){
 const prompt=generateSelectedMode();if(!prompt)return;
 const win=window.open(provider==='gemini'?'https://gemini.google.com/app':'https://chatgpt.com/','_blank');if(win){try{win.opener=null}catch(_){}}
 const status=$('iaGuideStatus');
 const done=()=>{updateStatus(lastContext,'✅ Prompt copiado. Na aba da IA, clique na caixa de mensagem e cole o texto.');if(status)status.textContent='✅ Prompt gerado e copiado. Na aba da IA, clique na caixa de mensagem e cole o texto.'};
 if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(prompt).then(done).catch(()=>{if(copyFallback())done();else if(status)status.textContent='Prompt gerado. Selecione e copie manualmente antes de enviar.'});
 else if(copyFallback())done();
 if(!win){const msg='O navegador bloqueou a nova aba. Permita pop-ups e toque novamente.';if(status)status.textContent=msg;if($('copiado'))$('copiado').textContent='⚠️ '+msg}
 const modal=$('iaGuide');if(modal)modal.style.display='none';
}

const NOTEBOOKLM_MAX_CHARS=3849;
const NOTEBOOKLM_ESSENTIAL_FIELDS=[
'NOME','DATA_NASCIMENTO','IDADE','SEXO','ALTURA','PESO','DOENCAS','DOENCAS_PAI','DOENCAS_MAE',
'ALERGIAS','CIRURGIAS_INTERNACOES','MEDICAMENTOS','SUPLEMENTOS','ULTIMO_SINTOMA','LOCAL_SINTOMA',
'DATA_INICIO_SINTOMA','INTENSIDADE','OUTROS_SINTOMAS','CONSULTAS','EXAMES','SINAIS_VITAIS','VACINAS',
'HISTORICO_FAMILIAR','LEMBRETES','AGUA_POR_DIA','ALIMENTACAO','INFORMACOES_IMPORTANTES'
];
function notebookTemplate(fields){
 return [
 'Crie uma ficha para importar no Minha Saúde IA, usando as fontes deste notebook e o contexto local abaixo.',
 'Responda em português, sem perguntas. Use apenas informações sustentadas nas fontes/contexto; não invente, diagnostique ou prescreva. Não misture dados de familiares. Dados ausentes = "Não informado".',
 'Preserve TODAS as doenças/condições e seus detalhes. Separe condições da pessoa, do pai e da mãe. Mantenha sintomas distintos de diagnósticos.',
 'O formato abaixo contém SOMENTE campos ainda não preenchidos no aplicativo. Não solicite nem devolva os campos omitidos; mantenha os dados já preenchidos sem alterações.',
 'SAÍDA: somente os campos listados, exatamente no formato [CHAVE]: valor, um por linha, na ordem apresentada. Sem Markdown ou comentários. Para vários registros, separe por ponto e vírgula.',
 ...fields.map(k=>'['+k+']:'),
 'Mantenha datas, nomes de medicamentos, doses, frequências, resultados e observações quando existirem. Não invente exames, documentos ou tratamentos.'
 ].join('\n');
}
function notebookPrompt(ctx,important,summary,fields){
 const cond=ctx.conditions.length?ctx.conditions.map(x=>'- '+x).join('\n'):'Não informado nos campos de condições do perfil.';
 return [
 '===== CONTEXTO LOCAL — PERFIL ATIVO =====',
 'Perfil: '+ctx.name,
 'DOENÇAS E CONDIÇÕES CADASTRADAS ('+ctx.conditions.length+'):',
 cond,
 'INFORMAÇÕES IMPORTANTES DO PERFIL:',
 important||'Não informado.',
 'RESUMO COMPLEMENTAR DOS REGISTROS LOCAIS:',
 summary||'Resumo omitido para respeitar o limite de caracteres.',
 '===== FIM DO CONTEXTO LOCAL =====',
 notebookTemplate(fields)
 ].join('\n\n');
}
function cutAtWord(text,max){
 const s=String(text||'');
 if(s.length<=max)return s;
 if(max<=0)return '';
 return s.slice(0,max).replace(/\s+\S*$/,'').trim();
}
function fitNotebookPrompt(ctx){
 let important=String(ctx.important||'').trim();
 let summary=String(ctx.summary||'').trim();
 let fields=(ctx.pendingFields||FICHA_FIELDS).slice();
 let prompt=notebookPrompt(ctx,important,summary,fields);
 if(prompt.length<=NOTEBOOKLM_MAX_CHARS)return {prompt,fieldsMode:'completo',importantClipped:false,summaryClipped:false};
 // Primeiro reduz o resumo dos registros, nunca a lista estruturada de condições.
 const noSummary=notebookPrompt(ctx,important,'',fields);
 if(noSummary.length<=NOTEBOOKLM_MAX_CHARS){
  let lo=0,hi=summary.length,best='';
  while(lo<=hi){
   const mid=Math.floor((lo+hi)/2),candidate=cutAtWord(summary,mid);
   if(notebookPrompt(ctx,important,candidate,fields).length<=NOTEBOOKLM_MAX_CHARS){best=candidate;lo=mid+1}else hi=mid-1;
  }
  prompt=notebookPrompt(ctx,important,best,fields);
  return {prompt,fieldsMode:'completo',importantClipped:false,summaryClipped:best.length<summary.length};
 }
 // Se ainda não couber, reduz as informações complementares; as condições ficam intactas.
 const noFreeText=notebookPrompt(ctx,'','',fields);
 if(noFreeText.length<=NOTEBOOKLM_MAX_CHARS){
  let lo=0,hi=important.length,best='';
  while(lo<=hi){
   const mid=Math.floor((lo+hi)/2),candidate=cutAtWord(important,mid);
   const finalValue=candidate.length<important.length?(candidate?candidate+' ':'')+'[informações complementares reduzidas]':candidate;
   if(notebookPrompt(ctx,finalValue,'',fields).length<=NOTEBOOKLM_MAX_CHARS){best=finalValue;lo=mid+1}else hi=mid-1;
  }
  prompt=notebookPrompt(ctx,best,'',fields);
  if(prompt.length<=NOTEBOOKLM_MAX_CHARS)return {prompt,fieldsMode:'completo',importantClipped:true,summaryClipped:summary.length>0};
 }
 // Em perfis excepcionalmente longos, preserva doenças e usa apenas os campos essenciais.
 fields=NOTEBOOKLM_ESSENTIAL_FIELDS.filter(k=>fields.includes(k));
 const minimalBase=notebookPrompt(ctx,'','',fields);
 if(minimalBase.length<=NOTEBOOKLM_MAX_CHARS){
  let lo=0,hi=important.length,best='';
  while(lo<=hi){
   const mid=Math.floor((lo+hi)/2),candidate=cutAtWord(important,mid);
   const finalValue=candidate.length<important.length?(candidate?candidate+' ':'')+'[informações complementares reduzidas]':candidate;
   if(notebookPrompt(ctx,finalValue,'',fields).length<=NOTEBOOKLM_MAX_CHARS){best=finalValue;lo=mid+1}else hi=mid-1;
  }
  prompt=notebookPrompt(ctx,best,'',fields);
  if(prompt.length<=NOTEBOOKLM_MAX_CHARS)return {prompt,fieldsMode:'essencial',importantClipped:true,summaryClipped:summary.length>0};
 }
 // Não corta silenciosamente a lista de doenças. Explica o bloqueio se a lista sozinha não couber.
 return {prompt:'',fieldsMode:'erro',importantClipped:false,summaryClipped:true,error:'A lista de doenças/condições é longa demais para caber no limite de 3.600 caracteres junto com a ficha. Não copiei um prompt incompleto. Revise duplicidades no perfil ou use o prompt completo em outra IA.'};
}
function generateNotebookLM(){
 const ctx=collectContext();
 if(!ctx.pendingFields.length){const message='Todos os campos estruturados deste modelo já parecem preenchidos. Não há campos pendentes para enviar ao NotebookLM; confira seu perfil antes de importar novas informações.';const s=ensureStatus();if(s)s.textContent=message;if($('copiado'))$('copiado').textContent=message;updatePromptCount('', 'notebook', message);return '';}
 const result=fitNotebookPrompt(ctx);
 const statusText=result.error||'';
 if(!result.prompt){
  const s=ensureStatus();if(s)s.textContent='⚠️ '+statusText;
  if($('copiado'))$('copiado').textContent='⚠️ Prompt não copiado para evitar omitir doenças.';
  return '';
 }
 const field=$('promptIA');if(!field)return '';
 field.value=result.prompt;
 const guide=$('iaGuidePrompt');if(guide)guide.value=result.prompt;
 lastContext=ctx;
 let message='📓 Prompt NotebookLM: '+result.prompt.length.toLocaleString('pt-BR')+' de '+NOTEBOOKLM_MAX_CHARS.toLocaleString('pt-BR')+' caracteres. '+ctx.conditions.length+' condição(ões) preservadas.';
 if(result.summaryClipped)message+=' Resumo longo reduzido.';
 if(result.importantClipped)message+=' Informações complementares reduzidas.';
 if(result.fieldsMode==='essencial')message+=' Perfil muito extenso: ficha usa campos essenciais para caber no limite.';
 updateStatus(ctx,message);
 updatePromptCount(result.prompt,'notebook',message);
 return result.prompt;
}
function copyNotebookPrompt(){
 const prompt=generateNotebookLM();if(!prompt)return;
 const status=$('copiado');
 const done=()=>{if(status)status.textContent='✅ Prompt NotebookLM copiado ('+prompt.length.toLocaleString('pt-BR')+' caracteres). Agora cole no NotebookLM.';updateStatus(lastContext,'📓 Prompt NotebookLM copiado: '+prompt.length.toLocaleString('pt-BR')+' de '+NOTEBOOKLM_MAX_CHARS.toLocaleString('pt-BR')+' caracteres. Revise antes de enviar.')};
 if(navigator.clipboard&&navigator.clipboard.writeText){
  navigator.clipboard.writeText(prompt).then(done).catch(()=>{
   if(copyFallback())done();
   else{if(status)status.textContent='⚠️ Prompt gerado, mas a cópia automática falhou. O texto está selecionável na caixa.';updateStatus(lastContext,'⚠️ Prompt NotebookLM gerado. Selecione e copie manualmente.')}
  });
 }else if(copyFallback())done();
 else if(status)status.textContent='⚠️ Prompt NotebookLM gerado. Selecione o texto e copie manualmente.';
}
function isNotebookMode(){return Boolean($('msaNotebookLMMode')&&$('msaNotebookLMMode').checked)}
function generateSelectedMode(){if(isNotebookMode()&&typeof gerarPartesNotebookV705==='function'){const r=gerarPartesNotebookV705();if(r.partes.length){const f=$('promptIA');if(f)f.value=r.partes[0].texto;if(typeof painelPartesV705==='function')setTimeout(painelPartesV705,0);if(r.partes.length>1){const st=$('copiado');if(st)st.textContent='✂️ O NotebookLM precisa de '+r.partes.length+' partes: use os botões “Copiar parte”. Esta é a parte 1.'}return r.partes[0].texto}}return isNotebookMode()?generateNotebookLM():generate()}
function updatePromptCount(prompt,mode,note){
 const count=$('msaPromptCharCount'),hint=$('msaPromptModeHint'),bar=$('msaPromptModeBar');
 if(count)count.textContent=mode==='notebook'?'NotebookLM: '+prompt.length.toLocaleString('pt-BR')+' / '+NOTEBOOKLM_MAX_CHARS.toLocaleString('pt-BR')+' caracteres':'Prompt padrão: '+prompt.length.toLocaleString('pt-BR')+' caracteres';
 if(hint)hint.textContent=note||(mode==='notebook'?'Modo NotebookLM ativo: limite de 3.849 caracteres. As condições de saúde têm prioridade.':'Modo padrão ativo: prompt completo, com limite de segurança de 8.000 caracteres.');
 if(bar)bar.dataset.mode=mode;
}
function buildNotebookLMButton(){
 const field=$('promptIA');if(!field||$('msaPromptModeBar'))return;
 const bar=document.createElement('div');bar.id='msaPromptModeBar';
 bar.style.cssText='display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin:12px 0;padding:12px 14px;border:1px solid #dbe5f2;border-radius:14px;background:#f8faff;color:#172033';
 bar.innerHTML='<label for="msaNotebookLMMode" style="display:flex;align-items:center;gap:9px;min-width:220px;font-weight:850;font-size:13px;cursor:pointer;margin:0"><input id="msaNotebookLMMode" type="checkbox" style="width:19px;height:19px;min-height:19px;flex:0 0 auto;accent-color:#2563eb"> 📓 Modo NotebookLM</label><div style="display:flex;flex-direction:column;gap:3px;align-items:flex-end;min-width:155px"><strong id="msaPromptCharCount" style="font-size:13px">Prompt padrão: calculando…</strong><span id="msaPromptModeHint" style="font-size:11px;line-height:1.4;color:#64748b;text-align:right">Desmarcado: gera o prompt padrão.</span></div>';
 field.insertAdjacentElement('beforebegin',bar);
 const checkbox=$('msaNotebookLMMode');
 checkbox.addEventListener('change',function(){
  const prompt=generateSelectedMode();
  if(prompt)updatePromptCount(prompt,isNotebookMode()?'notebook':'normal');
  field.scrollIntoView({behavior:'smooth',block:'center'});
 });
}
function buildButton(){
 const cta=document.querySelector('.ai-cta');if(!cta||$('msaGenerateImportPrompt'))return;
 const button=document.createElement('button');button.id='msaGenerateImportPrompt';button.type='button';button.className='btn secondary';button.textContent='🔄 Atualizar prompt no modo selecionado';button.title='Atualiza o prompt normal ou o prompt NotebookLM conforme a opção marcada.';
 button.addEventListener('click',function(){const prompt=generateSelectedMode();const field=$('promptIA');if(field)field.scrollIntoView({behavior:'smooth',block:'center'});if(prompt)updatePromptCount(prompt,isNotebookMode()?'notebook':'normal')});
 cta.appendChild(button);
}

function applyDesktopDrawerStyle(){
 if($('msaV698DesktopDrawerFix'))return;
 const style=document.createElement('style');style.id='msaV698DesktopDrawerFix';
 style.textContent=[
 '@media(min-width:761px){',
 '#msaMobileBackdrop[aria-hidden="false"]{display:block!important;position:fixed!important;inset:0!important;background:rgba(15,23,42,.48)!important;z-index:12001!important;backdrop-filter:blur(2px)}',
 '#msaMobileDrawer[aria-hidden="false"]{display:flex!important;position:fixed!important;left:50%!important;right:auto!important;top:50%!important;bottom:auto!important;transform:translate(-50%,-50%)!important;width:min(900px,94vw)!important;max-height:88vh!important;background:#fff!important;color:#172033!important;border:1px solid #e2e8f0;border-radius:24px!important;box-shadow:0 22px 70px rgba(15,23,42,.28)!important;overflow:hidden!important;z-index:12002!important}',
 '#msaMobileDrawer .msa-mobile-drawer-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 18px 13px;border-bottom:1px solid #e7ebf2;flex:0 0 auto}',
 '#msaMobileDrawer .msa-mobile-drawer-head h2{font-size:20px;line-height:1.3;margin:0;color:#172033}',
 '#msaMobileDrawer .msa-mobile-drawer-head .muted{font-size:12px;color:#64748b}',
 '#msaMobileDrawer .msa-mobile-drawer-close{width:42px;height:42px;border:0;border-radius:12px;background:#f1f5f9;font-size:18px;font-weight:900;cursor:pointer}',
 '#msaMobileDrawer .msa-mobile-drawer-body{overflow:auto;padding:13px 16px 18px;display:block}',
 '#msaMobileDrawer .msa-menu-search{width:100%;box-sizing:border-box;margin:0 0 12px;padding:12px 14px;border:1px solid #dbe3ef;border-radius:12px;background:#fff;font:inherit;font-size:14px!important}',
 '#msaMobileDrawer .msa-mobile-quick{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:8px;margin-bottom:14px}',
 '#msaMobileDrawer .msa-mobile-quick button{min-width:0;min-height:68px;border:1px solid #dbe5ff;background:#f5f8ff;border-radius:13px;padding:8px 5px;font:inherit;font-size:12px;font-weight:850;color:#1e40af;cursor:pointer}',
 '#msaMobileDrawer .msa-mobile-quick span{display:block;font-size:10px;margin-top:4px;color:#475569}',
 '#msaMobileDrawer .msa-mobile-section{margin:0 0 13px}',
 '#msaMobileDrawer .msa-mobile-section-title{margin:8px 2px 6px;color:#64748b;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:.06em}',
 '#msaMobileDrawer .msa-mobile-links{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px}',
 '#msaMobileDrawer .msa-mobile-links button{min-width:0;min-height:42px;border:1px solid #e3e8f0;background:#f8fafc;color:#172033;border-radius:11px;padding:9px 10px;text-align:left;font:inherit;font-size:12px;font-weight:800;cursor:pointer;white-space:normal}',
 '#msaMobileDrawer .msa-mobile-links button:hover{background:#eef4ff;border-color:#bfdbfe;color:#1d4ed8}',
 '#msaMobileDrawer .msa-mobile-links button.danger{background:#fff1f2;color:#b91c1c;border-color:#fecdd3}',
 'body.msa-dark #msaMobileDrawer[aria-hidden="false"]{background:#111827!important;color:#e5e7eb!important;border-color:#334155!important}',
 'body.msa-dark #msaMobileDrawer .msa-mobile-drawer-head{border-color:#334155}',
 'body.msa-dark #msaMobileDrawer .msa-mobile-drawer-head h2{color:#f8fafc}',
 'body.msa-dark #msaMobileDrawer .msa-mobile-quick button,body.msa-dark #msaMobileDrawer .msa-mobile-links button{background:#172033;color:#e5e7eb;border-color:#334155}',
 'body.msa-dark #msaMobileDrawer .msa-menu-search{background:#0f172a;color:#f8fafc;border-color:#334155}',
 '}',
 '@media(min-width:761px) and (max-width:1000px){#msaMobileDrawer .msa-mobile-quick{grid-template-columns:repeat(3,minmax(0,1fr))}#msaMobileDrawer .msa-mobile-links{grid-template-columns:repeat(2,minmax(0,1fr))}}'
 ].join('\n');document.head.appendChild(style);
}
function init(){
 const field=$('promptIA');if(field&&!basePrompt)basePrompt=field.value||'';
 applyDesktopDrawerStyle();buildButton();buildNotebookLMButton();if(field){const prompt=generate();if(prompt)updatePromptCount(prompt,'normal')}
 window.copiarPrompt=copyPrompt;window.copiarPromptIA=copyPrompt;window.copiarEAvancarIA=copyPrompt;
 window.abrirIAGuiaIA=openAI;window.abrirChatGPT=function(){return openAI('chatgpt')};window.abrirGemini=function(){return openAI('gemini')};
 window.abrirPaginaIA=function(){const prompt=generateSelectedMode();const o=$('onboarding');if(o)o.style.display='none';if(typeof window.go==='function')window.go('importar');copyPrompt();setTimeout(()=>$('promptIA')?.scrollIntoView({behavior:'smooth',block:'center'}),100);return prompt};
 window.copiarPromptAntesDeAbrir=copyPrompt;
 window.abrirPromptCamposPendentesHome=function(){
  let prompt='';
  try{prompt=generateSelectedMode()}catch(e){console.error('[Prompt campos pendentes] Falha ao gerar:',e)}
  if(typeof window.go==='function')window.go('importar');
  if(!prompt){
   setTimeout(function(){
    const st=$('msaPromptContextStatus')||$('copiado');
    const msg='Não encontrei campos pendentes para gerar. Confira se o perfil atual está preenchido e se escolheu a pessoa correta.';
    if(st)st.textContent=msg;
    const target=$('msaPromptContextStatus')||$('promptIA');
    if(target&&target.scrollIntoView)target.scrollIntoView({behavior:'smooth',block:'center'});
   },160);
   return '';
  }
  setTimeout(function(){
   const field=$('promptIA');
   if(field){field.value=prompt;field.scrollIntoView({behavior:'smooth',block:'center'})}
   const message=isNotebookMode()
    ?'📓 Prompt das informações pendentes gerado no modo NotebookLM. Use os botões de cada parte se o aplicativo dividir a ficha.'
    :'✅ Prompt gerado somente com os campos pendentes. Confira o texto e copie para enviar à IA.';
   const status=$('msaPromptContextStatus')||$('copiado');
   if(status)status.textContent=message;
   if(isNotebookMode()&&$('msaNotebookPartes'))$('msaNotebookPartes').scrollIntoView({behavior:'smooth',block:'center'});
  },180);
  return prompt;
 };
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();

/* ===== V7.05 — NotebookLM em partes: nada fica de fora e cada parte cabe no limite ===== */
const SO_MULHER_V705=['ULTIMA_MENSTRUACAO','CICLO_MENSTRUAL','DURACAO_MENSTRUACAO','JA_ENGRAVIDOU','JA_FOI_MAE','NUMERO_GESTACOES','ULTIMO_PREVENTIVO_COLO','ULTIMA_MAMOGRAFIA','PROXIMO_PREVENTIVO'];
const GRUPOS_V705=[
 ['👤','Dados pessoais, corpo e rotina',['NOME','DATA_NASCIMENTO','IDADE','SEXO','TIPO_SANGUINEO','ALTURA','PESO','OBJETIVO_CORPORAL','ACADEMIA','FREQUENCIA_ACADEMIA','ATIVIDADE_FISICA','TRABALHO_TIPO','HORAS_SENTADO','HORAS_EM_PE','AGUA_POR_DIA','FREQUENCIA_URINARIA','FREQUENCIA_EVACUACAO','EXPOSICAO_CALOR_SUOR','ALIMENTACAO','CONTATO_EMERGENCIA','TELEFONE_EMERGENCIA']],
 ['🩺','Doenças, alergias, remédios e sintomas',['DOENCAS','DOENCAS_PAI','DOENCAS_MAE','ALERGIAS','CIRURGIAS_INTERNACOES','MEDICAMENTOS','SUPLEMENTOS','FREQUENCIA_DORCELAX','FREQUENCIA_PARACETAMOL','OUTROS_REMEDIOS_DOR','ULTIMO_SINTOMA','LOCAL_SINTOMA','DATA_INICIO_SINTOMA','INTENSIDADE','OUTROS_SINTOMAS','JA_TEVE_CATAPORA','QUANDO_CATAPORA','INFORMACOES_IMPORTANTES']],
 ['📋','Consultas, exames, vacinas e família',['CONSULTAS','EXAMES','SINAIS_VITAIS','VACINAS','HISTORICO_FAMILIAR','LEMBRETES','DOCUMENTOS']],
 ['🌸','Saúde íntima e prevenção',['ULTIMA_MENSTRUACAO','CICLO_MENSTRUAL','DURACAO_MENSTRUACAO','FREQUENCIA_SEXUAL_MIN','FREQUENCIA_SEXUAL_MAX','MASTURBACAO_POR_DIA','USO_PRESERVATIVO','JA_ENGRAVIDOU','JA_FOI_MAE','NUMERO_GESTACOES','HISTORICO_REPRODUTIVO','ULTIMO_PREVENTIVO_COLO','ULTIMA_MAMOGRAFIA','ULTIMO_TESTE_IST','VACINA_HPV','PROXIMO_PREVENTIVO','OBSERVACOES_PREVENCAO']]
];
function limiteNotebookV705(){const v=Number(localStorage.getItem('msaNotebookLimite')||'');return v>=800&&v<=20000?v:NOTEBOOKLM_MAX_CHARS}
function ehHomemV705(ctx){return /^m(asc)?/i.test(String((ctx.profile||{}).sexo||'').trim())}
function camposPendentesV705(ctx){let f=ctx.pendingFields.slice();if(ehHomemV705(ctx))f=f.filter(k=>SO_MULHER_V705.indexOf(k)<0);return f}
function jaNoAppV705(ctx,grupo){
 /* só o que ajuda a IA a não repetir — curto de propósito */
 const nomes=arr=>Array.from(new Set(arr.map(x=>x&&x.nome).filter(Boolean)));
 const ult=arr=>arr.map(x=>String(x&&x.data||'').slice(0,10)).filter(Boolean).sort().pop()||'';
 const br=d=>d?d.split('-').reverse().join('/'):'';
 const L=[];
 if(grupo===1){if(ctx.conditions.length)L.push('Doenças já cadastradas: '+ctx.conditions.join('; '));const m=nomes(read('msa2_meds').concat(read('msa2_medicamentos_rotina')));if(m.length)L.push('Remédios já cadastrados: '+m.join('; '))}
 if(grupo===2){[['msa2_consultas','consulta(s)'],['msa2_exames','exame(s)'],['msa2_vacinas','vacina(s)']].forEach(([k,r])=>{const a=read(k);if(a.length)L.push('Já tenho '+a.length+' '+r+(ult(a)?', a mais recente em '+br(ult(a)):''))})}
 return L.length?'JÁ ESTÁ NO APP (não repita, envie só o que for novo):\n'+L.join('\n'):'';
}
function cabecalhoV705(n,total,titulo){
 return (total>1?'PARTE '+n+' DE '+total+' — ':'')+titulo.toUpperCase()+' (ficha para o app Minha Saúde IA)\n'+
 'Use só as fontes deste notebook. Responda em português, sem perguntas. Não invente, não diagnostique e não misture dados de familiares. Dado ausente = Não informado.\n'+
 'SAÍDA: somente as linhas abaixo, no formato [CHAVE]: valor, uma por linha, sem Markdown. Vários registros: separe por ponto e vírgula. Datas em DD/MM/AAAA.';
}
function montarParteV705(n,total,g,campos,extra){return [cabecalhoV705(n,total,g[1]),extra,campos.map(k=>'['+k+']:').join('\n')].filter(Boolean).join('\n\n')}
function gerarPartesNotebookV705(){
 const ctx=collectContext(),lim=limiteNotebookV705(),pend=camposPendentesV705(ctx);
 if(!pend.length)return {partes:[],lim,msg:'Todos os campos já estão preenchidos.'};
 const usados=new Set(),blocos=[];
 GRUPOS_V705.forEach((g,i)=>{const campos=g[2].filter(k=>pend.indexOf(k)>=0);campos.forEach(k=>usados.add(k));if(campos.length)blocos.push({g,i,campos})});
 const sobra=pend.filter(k=>!usados.has(k));if(sobra.length){if(blocos.length)blocos[0].campos=blocos[0].campos.concat(sobra);else blocos.push({g:GRUPOS_V705[0],i:0,campos:sobra})}
 /* se um grupo passar do limite, divide os campos dele; o contexto é cortado por último */
 let partes=[];
 blocos.forEach(b=>{let extra=jaNoAppV705(ctx,b.i);let fila=b.campos.slice();
  /* mede no mesmo formato da parte final (cabeçalho “PARTE 9 DE 9” + título do grupo), com folga de 20 caracteres */
  const medir=(campos,ex)=>(cabecalhoV705(9,9,b.g[1])+'\n\n— '+b.g[0]+' '+b.g[1]+' —'+(ex?'\n'+ex:'')+'\n'+campos.map(k=>'['+k+']:').join('\n')).length+20;
  while(fila.length){let k=fila.length;while(k>1&&medir(fila.slice(0,k),extra)>lim)k--;
   if(medir(fila.slice(0,k),extra)>lim&&extra){extra=cutAtWord(extra,Math.max(0,extra.length-(medir(fila.slice(0,k),extra)-lim)-10));extra=extra?extra+' …':''}
   partes.push({g:b.g,campos:fila.slice(0,k),extra});fila=fila.slice(k);extra='';}
 });
 /* junta grupos vizinhos enquanto couber no limite: menos partes para copiar */
 const juntar=(lista)=>{const corpo=lista.map(p=>'— '+p.g[0]+' '+p.g[1]+' —'+(p.extra?'\n'+p.extra:'')+'\n'+p.campos.map(k=>'['+k+']:').join('\n')).join('\n\n');return corpo};
 const unicos=lista=>lista.filter((p,i)=>lista.findIndex(q=>q.g===p.g)===i);
 const tituloDe=(lista,umaSo)=>umaSo?unicos(lista).map(p=>p.g[0]).join('')+' Ficha completa':unicos(lista).length===1?lista[0].g[0]+' '+lista[0].g[1]:unicos(lista).map(p=>p.g[0]).join('')+' '+unicos(lista).map(p=>p.g[1].split(',')[0]).join(' + ');
 const tituloTexto=(lista,total)=>total===1?'ficha completa':unicos(lista).map(p=>p.g[1].split(',')[0]).join(' + ');
 const texto=(n,total,lista)=>cabecalhoV705(n,total,tituloTexto(lista,total))+'\n\n'+juntar(lista);
 const pacotes=[];partes.forEach(p=>{const ult=pacotes[pacotes.length-1];if(ult&&texto(9,9,ult.concat([p])).length<=lim)ult.push(p);else pacotes.push([p])});
 const total=pacotes.length;
 partes=pacotes.map((lista,i)=>({titulo:tituloDe(lista,total===1),campos:lista.flatMap(p=>p.campos),texto:texto(i+1,total,lista)}));
 return {partes,lim,homem:ehHomemV705(ctx)};
}
function copiarTextoV705(t){if(navigator.clipboard&&navigator.clipboard.writeText)return navigator.clipboard.writeText(t).then(()=>true,()=>fallbackV705(t));return Promise.resolve(fallbackV705(t))}
function fallbackV705(t){try{const a=document.createElement('textarea');a.value=t;a.setAttribute('readonly','');a.style.cssText='position:fixed;opacity:0;top:0;left:0';document.body.appendChild(a);a.select();const ok=document.execCommand('copy');a.remove();return ok}catch(e){return false}}
function painelPartesV705(){
 const bar=$('msaPromptModeBar');if(!bar)return;
 /* o seletor ChatGPT/NotebookLM ficava dentro de uma parte recolhida (details) e quase ninguém via: vai para logo abaixo do botão principal */
 const cta=document.querySelector('#importar .ai-cta');if(cta&&bar.closest('details')&&!bar.dataset.v705){bar.dataset.v705='1';cta.insertAdjacentElement('afterend',bar)}
 let box=$('msaNotebookPartes');
 if(!isNotebookMode()){if(box)box.style.display='none';return}
 if(!box){box=document.createElement('div');box.id='msaNotebookPartes';box.className='msa-nb-partes';bar.insertAdjacentElement('afterend',box)}
 box.style.display='';
 const r=gerarPartesNotebookV705();
 if(!r.partes.length){box.innerHTML='<b>📓 NotebookLM</b><p>'+r.msg+'</p>';return}
 const copiadas=JSON.parse(sessionStorage.getItem('msaNbCopiadas')||'[]');
 const uma=r.partes.length===1;
 box.innerHTML='<div class="msa-nb-top"><b>'+(uma?'📓 Prompt do NotebookLM pronto — cabe numa mensagem só':'✂️ NotebookLM em '+r.partes.length+' partes — nada fica de fora')+'</b><span>'+(uma?'Tem <b>'+r.partes[0].texto.length.toLocaleString('pt-BR')+'</b> de <b>'+r.lim.toLocaleString('pt-BR')+'</b> caracteres permitidos, com todos os campos que faltam.':'Cada parte tem até <b>'+r.lim.toLocaleString('pt-BR')+'</b> caracteres.')+'</span></div>'+
  (uma?'<ol class="msa-nb-passos"><li>Abra seu notebook no NotebookLM.</li><li>Copie o prompt abaixo, cole no chat do NotebookLM e envie.</li><li>Copie a resposta e cole na caixa de importação.</li></ol>':'<ol class="msa-nb-passos"><li>Abra seu notebook no NotebookLM.</li><li>Copie a <b>parte 1</b>, cole no chat do NotebookLM e envie. Faça o mesmo com as outras partes.</li><li>Copie <b>todas as respostas</b> e cole <b>juntas</b> (uma embaixo da outra) na caixa de importação.</li></ol>')+
  '<div class="msa-nb-lista">'+r.partes.map((p,i)=>'<button type="button" data-nb-parte="'+i+'" class="'+(copiadas.indexOf(i)>=0?'ok':'')+'"><span>'+(copiadas.indexOf(i)>=0?'✅':'📋')+(uma?' Copiar prompt do NotebookLM':' Copiar parte '+(i+1))+'</span><small>'+p.titulo+' · '+p.campos.length+' campo(s) · '+p.texto.length.toLocaleString('pt-BR')+' caracteres</small></button>').join('')+'</div>'+
  '<div class="msa-nb-rodape"><a href="https://notebooklm.google.com/" target="_blank" rel="noopener noreferrer">📓 Abrir NotebookLM</a><label>Limite do NotebookLM <input id="msaNbLimite" type="number" min="800" max="20000" step="50" value="'+r.lim+'"> caracteres</label>'+(r.homem?'<small>Perfil masculino: perguntas de ciclo, gestação, preventivo e mamografia foram retiradas.</small>':'')+'</div><p class="msa-nb-status" id="msaNbStatus" role="status" aria-live="polite"></p>';
 box._partes=r.partes;
 const f=$('promptIA');if(f&&r.partes[0])f.value=r.partes[0].texto;
}
document.addEventListener('click',function(e){
 const b=e.target.closest('[data-nb-parte]');if(!b)return;const box=$('msaNotebookPartes');const i=Number(b.getAttribute('data-nb-parte'));const p=box&&box._partes&&box._partes[i];if(!p)return;
 copiarTextoV705(p.texto).then(ok=>{const st=$('msaNbStatus');if(!ok){if(st)st.textContent='Não consegui copiar. Toque e segure no texto para copiar manualmente.';const f=$('promptIA');if(f){f.value=p.texto;f.focus();f.select()}return}
  const c=JSON.parse(sessionStorage.getItem('msaNbCopiadas')||'[]');if(c.indexOf(i)<0)c.push(i);sessionStorage.setItem('msaNbCopiadas',JSON.stringify(c));
  const f=$('promptIA');if(f)f.value=p.texto;painelPartesV705();const st2=$('msaNbStatus');if(st2)st2.textContent='✅ '+(box._partes.length>1?'Parte '+(i+1)+' copiada':'Prompt copiado')+' ('+p.texto.length.toLocaleString('pt-BR')+' caracteres). Cole no NotebookLM e depois copie a próxima.'});
});
document.addEventListener('change',function(e){if(e.target&&e.target.id==='msaNbLimite'){const v=Number(e.target.value);if(v>=800&&v<=20000){localStorage.setItem('msaNotebookLimite',String(v));sessionStorage.removeItem('msaNbCopiadas');painelPartesV705()}}
 if(e.target&&e.target.id==='msaNotebookLMMode')setTimeout(painelPartesV705,50)});
/* o modo padrão (ChatGPT/Gemini) também deixa de pedir dados femininos para perfil masculino */
const _prepararV705=prepararContextoCampos;
prepararContextoCampos=function(ctx){const r=_prepararV705(ctx);if(ehHomemV705(r)){r.pendingFields=r.pendingFields.filter(k=>SO_MULHER_V705.indexOf(k)<0)}return r};
(function(){const st=document.createElement('style');st.id='msaNbPartesCss';st.textContent='.msa-nb-partes{margin:10px 0 12px;padding:14px;border-radius:16px;border:2px solid #7c3aed;background:#faf5ff}.msa-nb-top>b{display:block;font-size:16px;color:#5b21b6}.msa-nb-top span{display:block}.msa-nb-top span{font-size:13.5px;color:#4c1d95}.msa-nb-passos{margin:10px 0;padding-left:20px;font-size:14px;line-height:1.5}.msa-nb-lista{display:grid;gap:8px}.msa-nb-lista button{display:flex;flex-direction:column;align-items:flex-start;gap:2px;min-height:52px;padding:10px 14px;border-radius:14px;border:1px solid #c4b5fd;background:#fff;color:#2e1065;font:inherit;text-align:left;cursor:pointer}.msa-nb-lista button span{font-weight:900;font-size:15px}.msa-nb-lista button small{font-size:12.5px;color:#6b21a8}.msa-nb-lista button.ok{border-color:#86efac;background:#f0fdf4}.msa-nb-rodape{display:flex;flex-wrap:wrap;align-items:center;gap:10px;margin-top:10px;font-size:13px}.msa-nb-rodape a{display:inline-flex;align-items:center;min-height:44px;padding:8px 14px;border-radius:12px;background:#7c3aed;color:#fff;font-weight:900;text-decoration:none}.msa-nb-rodape input{width:90px;min-height:40px;margin:0 4px;padding:4px 8px;border-radius:10px;border:1px solid #c4b5fd;font:inherit}.msa-nb-rodape small{flex-basis:100%;color:#6b21a8}.msa-nb-status{margin:8px 0 0;font-weight:800;color:#166534;min-height:18px}body.msa-dark .msa-nb-partes{background:#1e1035;border-color:#6d28d9}body.msa-dark .msa-nb-lista button{background:#0f172a;color:#e9d5ff;border-color:#4c1d95}body.msa-dark .msa-nb-lista button small,body.msa-dark .msa-nb-top span,body.msa-dark .msa-nb-rodape small{color:#d8b4fe}body.msa-dark .msa-nb-lista button.ok{background:#052e16}';document.head.appendChild(st)})();
/* a página “Preencher com a IA” abre já com a importação à mostra (antes ela ficava recolhida em “Precisa importar seu perfil com outra IA?”) */
function abrirImportacaoV705(){const sec=$('importar');if(!sec||!sec.classList.contains('active'))return;const cta=sec.querySelector('.ai-cta');const d=cta&&cta.closest('details');if(d&&!d.open)d.open=true;painelPartesV705()}
new MutationObserver(()=>abrirImportacaoV705()).observe(document.getElementById('importar')||document.body,{attributes:true,attributeFilter:['class']});
setTimeout(abrirImportacaoV705,900);
setTimeout(painelPartesV705,900);
window.msaGerarPartesNotebook=gerarPartesNotebookV705;


/* ===== V7.06 — o prompt pede só o que está vazio OU incompleto ===== */
let ctxV706=null;
function incompletosV706(){
 const br=d=>d?String(d).slice(0,10).split('-').reverse().join('/'):'sem data';
 const vaz=v=>isEmpty(v);
 const L={meds:[],consultas:[],exames:[]};
 read('msa2_meds').forEach(m=>{if(!m||vaz(m.nome))return;const f=[];if(vaz(m.dose))f.push('dose');if(vaz(m.freq)&&vaz(m.hora))f.push('frequência/horário');if(f.length)L.meds.push(m.nome+': falta '+f.join(' e '))});
 read('msa2_medicamentos_rotina').forEach(m=>{if(!m||vaz(m.nome))return;if(vaz(m.dose))L.meds.push(m.nome+' (rotina): falta dose')});
 read('msa2_consultas').forEach(c=>{if(!c)return;const f=[];if(vaz(c.esp))f.push('especialidade');if(vaz(c.mot)&&vaz(c.obs))f.push('motivo ou orientação do médico');if(f.length)L.consultas.push('Consulta de '+br(c.data)+(c.esp?' ('+c.esp+')':'')+': falta '+f.join(' e '))});
 read('msa2_exames').forEach(e=>{if(!e||vaz(e.nome))return;if(vaz(e.res))L.exames.push(e.nome+' ('+br(e.data)+'): falta resultado')});
 return L;
}
function blocoCompletarV706(campos){
 const L=incompletosV706(),linhas=[];
 if(L.meds.length&&(!campos||campos.indexOf('MEDICAMENTOS')>=0))linhas.push(...L.meds.map(x=>'- '+x));
 if(L.consultas.length&&(!campos||campos.indexOf('CONSULTAS')>=0))linhas.push(...L.consultas.map(x=>'- '+x));
 if(L.exames.length&&(!campos||campos.indexOf('EXAMES')>=0))linhas.push(...L.exames.map(x=>'- '+x));
 if(!linhas.length)return '';
 return 'COMPLETAR (já estão no app, mas incompletos):\n'+linhas.slice(0,20).join('\n')+(linhas.length>20?'\n- … e mais '+(linhas.length-20):'')+
  '\nSe as fontes tiverem a informação, devolva o item COMPLETO no campo correspondente ([MEDICAMENTOS], [CONSULTAS] ou [EXAMES]) com o MESMO nome e a MESMA data: o app completa o registro existente, sem duplicar. Se não souber, não devolva o item.';
}
/* garante que listas com itens incompletos sejam perguntadas */
const _prepararV706=prepararContextoCampos;
prepararContextoCampos=function(ctx){const r=_prepararV706(ctx);const L=incompletosV706();
 [['MEDICAMENTOS',L.meds],['CONSULTAS',L.consultas],['EXAMES',L.exames]].forEach(([k,arr])=>{if(arr.length&&r.pendingFields.indexOf(k)<0)r.pendingFields.push(k)});
 ctxV706=r;return r};
/* ChatGPT/Gemini: o bloco entra logo depois da lista de campos */
const _compactV706=compactTemplate;
const FORMATO_LISTAS_V706='FORMATO DAS LISTAS: [MEDICAMENTOS] Nome - dose - frequência; [CONSULTAS] DD/MM/AAAA - Especialidade - Motivo - Orientação; [EXAMES] Nome (DD/MM/AAAA): resultado.';
compactTemplate=function(fields){const t=_compactV706(fields),b=blocoCompletarV706(fields);const usaLista=fields&&fields.some(k=>['MEDICAMENTOS','CONSULTAS','EXAMES'].indexOf(k)>=0);return [t,usaLista?FORMATO_LISTAS_V706:'',b].filter(Boolean).join('\n\n')};
/* NotebookLM em partes: o bloco entra na parte que tem o campo */
const _jaNoAppV706=jaNoAppV705;
jaNoAppV705=function(ctx,grupo){const base=_jaNoAppV706(ctx,grupo);const g=GRUPOS_V705[grupo];const b=g?blocoCompletarV706(g[2]):'';const lst=g&&g[2].some(k=>['MEDICAMENTOS','CONSULTAS','EXAMES'].indexOf(k)>=0)?FORMATO_LISTAS_V706:'';return [base,lst,b].filter(Boolean).join('\n')};
window.msaIncompletosPrompt=incompletosV706;


/* ===== V7.13 — botão “🧩 Prompt: pedir só o que falta” do Início =====
   Junta as duas versões que existiam (uma genérica no index e outra que levava para a página de importação):
   agora abre a janela no próprio Início com o prompt do app, que pede só os campos vazios e os itens incompletos. */
function modoHomeV713(){return localStorage.getItem('msaHomePromptModo')==='notebook'?'notebook':'chatgpt'}
function promptHomeV713(){
 if(modoHomeV713()==='notebook'){const r=gerarPartesNotebookV705();return {texto:r.partes.length?r.partes[0].texto:'',partes:r.partes.length,campos:r.partes.reduce((a,p)=>a+p.campos.length,0)}}
 const ctx=collectContext();let t='';try{t=generate()}catch(e){t=''}
 return {texto:t,partes:1,campos:(ctx.pendingFields||[]).length};
}
window.abrirPromptCamposPendentesHome=function(){
 const modal=$('msaMissingPromptModal'),campo=$('msaMissingPromptText');
 if(!modal||!campo){if(typeof window.go==='function')window.go('importar');return}
 const r=promptHomeV713(),inc=incompletosV706(),nInc=inc.meds.length+inc.consultas.length+inc.exames.length,nb=modoHomeV713()==='notebook';
 campo.value=r.texto||'Seu perfil já está completo: não há campos vazios nem incompletos para pedir à IA. 🎉';
 const p=modal.querySelector('p.muted');
 if(p)p.innerHTML='<span class="msa-hp-modos"><button type="button" data-hp-modo="chatgpt" class="'+(nb?'':'on')+'">🤖 ChatGPT / Gemini</button><button type="button" data-hp-modo="notebook" class="'+(nb?'on':'')+'">📓 NotebookLM</button></span>'+
  '<b>Pede só o que falta:</b> '+r.campos+' campo(s) vazio(s)'+(nInc?' e '+nInc+' item(ns) incompleto(s)':'')+'. O que você já preencheu não é perguntado de novo.'+
  (nb&&r.partes>1?'<br>⚠️ Para o NotebookLM este prompt precisa de <b>'+r.partes+' partes</b>: esta é a parte 1. <a href="#" data-hp-ir="importar">Ver todas as partes</a>.':'')+
  '<br><small>'+r.texto.length.toLocaleString('pt-BR')+' caracteres. Depois de a IA responder, cole a resposta em <a href="#" data-hp-ir="importar">📥 Preencher com a IA</a>.</small>';
 const acoes=modal.querySelector('.msa-missing-prompt-actions');
 if(acoes&&!acoes.querySelector('.msa-hp-abrir')){acoes.insertAdjacentHTML('beforeend','<a class="btn secondary msa-hp-abrir" href="https://chatgpt.com/" target="_blank" rel="noopener noreferrer">🟢 ChatGPT</a><a class="btn secondary msa-hp-abrir" href="https://gemini.google.com/app" target="_blank" rel="noopener noreferrer">🔵 Gemini</a><a class="btn secondary msa-hp-abrir" href="https://notebooklm.google.com/" target="_blank" rel="noopener noreferrer">📓 NotebookLM</a>')}
 const fb=$('msaMissingPromptFeedback');if(fb)fb.textContent='';
 modal.style.display='flex';document.body.style.overflow='hidden';
};
window.copiarPromptCamposPendentesHome=function(){
 const campo=$('msaMissingPromptText'),fb=$('msaMissingPromptFeedback');if(!campo)return;
 const ok=()=>{if(fb)fb.textContent='✅ Prompt copiado! Cole na IA, depois traga a resposta para “Preencher com a IA”.'};
 if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(campo.value).then(ok,()=>{campo.select();try{document.execCommand('copy');ok()}catch(e){}});else{campo.select();try{document.execCommand('copy');ok()}catch(e){}}
};
window.fecharPromptCamposPendentesHome=function(){const m=$('msaMissingPromptModal');if(m)m.style.display='none';document.body.style.overflow=''};
document.addEventListener('click',function(e){
 const m=e.target.closest('[data-hp-modo]');if(m){localStorage.setItem('msaHomePromptModo',m.getAttribute('data-hp-modo'));window.abrirPromptCamposPendentesHome();return}
 const g=e.target.closest('[data-hp-ir]');if(g){e.preventDefault();window.fecharPromptCamposPendentesHome();if(typeof window.go==='function')window.go(g.getAttribute('data-hp-ir'))}
});
(function(){const st=document.createElement('style');st.id='msaHomePromptV713';st.textContent='.msa-hp-modos{display:flex;gap:6px;margin:0 0 10px}.msa-hp-modos button{flex:1;min-height:42px;border-radius:12px;border:1px solid #c7d2fe;background:#fff;color:#3730a3;font:inherit;font-weight:800;cursor:pointer}.msa-hp-modos button.on{background:#4f46e5;border-color:#4f46e5;color:#fff}.msa-missing-prompt-actions{flex-wrap:wrap}.msa-hp-abrir{text-decoration:none;display:inline-flex;align-items:center}body.msa-dark .msa-hp-modos button{background:#0f172a;color:#c7d2fe;border-color:#3730a3}body.msa-dark .msa-hp-modos button.on{background:#4f46e5;color:#fff}';document.head.appendChild(st)})();

})();