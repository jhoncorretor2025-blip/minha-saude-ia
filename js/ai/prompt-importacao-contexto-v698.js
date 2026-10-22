/* Minha Saúde IA V7.02 — prompt inteligente que omite campos já preenchidos. */
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
function generateSelectedMode(){return isNotebookMode()?generateNotebookLM():generate()}
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
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();