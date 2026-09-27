/* Minha Saúde IA - módulo de importação V4.27 */
function copiarPrompt(){
 const t=$('promptIA');
 if(!t)return;
 const ok=function(){if($('copiado'))$('copiado').textContent='✅ Copiado! Agora cole no ChatGPT ou Gemini.'};
 if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t.value).then(ok).catch(function(){t.select();document.execCommand('copy');ok()});
 else{t.select();document.execCommand('copy');ok()}
}
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
 var names=['NOME','DATA_NASCIMENTO','IDADE','SEXO','ALTURA','PESO','DOENCAS','ALERGIAS','CIRURGIAS_INTERNACOES','CONTATO_EMERGENCIA','TELEFONE_EMERGENCIA','ULTIMA_MENSTRUACAO','CICLO_MENSTRUAL','DURACAO_MENSTRUACAO','FREQUENCIA_SEXUAL','USO_PRESERVATIVO','JA_ENGRAVIDOU','JA_FOI_MAE','NUMERO_GESTACOES','HISTORICO_REPRODUTIVO','ULTIMO_PREVENTIVO_COLO','ULTIMA_MAMOGRAFIA','ULTIMO_TESTE_IST','VACINA_HPV','PROXIMO_PREVENTIVO','OBSERVACOES_PREVENCAO','MEDICAMENTOS','SUPLEMENTOS','ULTIMO_SINTOMA','LOCAL_SINTOMA','DATA_INICIO_SINTOMA','INTENSIDADE','OUTROS_SINTOMAS','CONSULTAS','EXAMES','SINAIS_VITAIS','VACINAS','HISTORICO_FAMILIAR','LEMBRETES','DOCUMENTOS','INFORMACOES_IMPORTANTES'];
 var values={},lines=String(raw||'').replace(/^\uFEFF/,'').replace(/\r/g,'').split('\n'),current='';
 lines.forEach(function(line){
  var clean=line.trim();
  var m=clean.match(/^\[([^\]]+)\]\s*(.*)$/);
  if(m){
   var key=String(m[1]).trim().toUpperCase();
   if(names.indexOf(key)>=0){current=key;values[current]=m[2]||'';return}
  }
  if(current)values[current]+=(values[current]?'\n':'')+line;
 });
 function field(n){var v=String(values[n]||'').trim();return /^não informado$/i.test(v)?'Não informado':v}
 function date(v){
  var s=String(v||'').trim(),m=s.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
  if(m)return m[3]+'-'+String(m[2]).padStart(2,'0')+'-'+String(m[1]).padStart(2,'0');
  return s;
 }
 function num(v){var m=String(v||'').replace(',','.').match(/-?\d+(?:\.\d+)?/);return m?m[0]:''}
 function height(v){var n=num(v);if(!n)return '';var x=Number(n);return /\bm\b/i.test(String(v))&&x<3?String(Math.round(x*100)):String(x)}
 function splitRecords(text){return String(text||'').split(/;\s*/).map(function(x){return x.trim()}).filter(Boolean)}
 function pipeParts(text){return String(text||'').split(/\s*\|\s*/).map(function(x){return x.trim()})}
 function parseVital(x){
  var p=pipeParts(x),o={data:'',peso:'',pressao:'',fc:'',temp:'',glic:'',sat:'',obs:''};
  p.forEach(function(part,i){
   var low=part.toLowerCase();
   if(i===0&&!/\b(peso|pressão|pressao|fc|batimentos|temp|temperatura|glicemia|saturação|saturacao)\s*:/i.test(part)){o.data=date(part);return}
   var m=part.match(/^([^:]+):\s*(.*)$/);if(!m)return;
   var k=m[1].trim().toLowerCase(),v=m[2].trim();
   if(/peso/.test(k))o.peso=v.replace(/\s*kg\b/i,'').trim();
   else if(/press/.test(k))o.pressao=v;
   else if(/fc|batimento/.test(k))o.fc=v;
   else if(/temp/.test(k))o.temp=v;
   else if(/glic/.test(k))o.glic=v;
   else if(/satura|sat/.test(k))o.sat=v;
   else if(/observ/.test(k))o.obs=v;
  });
  if(!o.data)o.data=new Date().toISOString().slice(0,16);
  return o;
 }
 function parseVaccine(x){
  var p=pipeParts(x),o={nome:'',data:'',obs:''};
  p.forEach(function(part,i){
   var m=part.match(/^([^:]+):\s*(.*)$/);if(m){var k=m[1].trim().toLowerCase(),v=m[2].trim();if(/vacina|nome/.test(k))o.nome=v;else if(/data/.test(k))o.data=date(v);else if(/dose|observ/.test(k))o.obs=v;}
   else if(i===0)o.nome=part;else if(/^\d{1,2}[\/-]\d{1,2}[\/-]\d{4}$/.test(part))o.data=date(part);else o.obs+=(o.obs? ' — ':'')+part;
  });
  return o;
 }
 function parseFamily(x){
  var p=pipeParts(x),o={parente:'',info:''};
  p.forEach(function(part,i){var m=part.match(/^([^:]+):\s*(.*)$/);if(m){var k=m[1].trim().toLowerCase(),v=m[2].trim();if(/parente|familiar/.test(k))o.parente=v;else if(/condição|condicao|informação|informacao/.test(k))o.info=v;}else if(i===0)o.parente=part;else o.info+=(o.info?' — ':'')+part});
  return o;
 }
 function parseReminder(x){
  var p=pipeParts(x),o={id:String(Date.now())+Math.random(),nome:'',data:'',tipo:'Outro'};
  p.forEach(function(part,i){var m=part.match(/^([^:]+):\s*(.*)$/);if(m){var k=m[1].trim().toLowerCase(),v=m[2].trim();if(/lembrar|nome/.test(k))o.nome=v;else if(/data|hora/.test(k))o.data=v;else if(/tipo/.test(k))o.tipo=v;}else if(i===0)o.nome=part;else if(!o.data)o.data=part;else o.tipo=part});
  return o;
 }
 function parseDocument(x){
  var p=pipeParts(x),o={id:String(Date.now())+Math.random(),nome:'Documento informado',tipo:'',tamanho:'',data:''};
  p.forEach(function(part,i){var m=part.match(/^([^:]+):\s*(.*)$/);if(m){var k=m[1].trim().toLowerCase(),v=m[2].trim();if(/nome|documento/.test(k))o.nome=v;else if(/tipo/.test(k))o.tipo=v;else if(/data/.test(k))o.data=date(v);}else if(i===0)o.nome=part;});
  return o;
 }
 var p={nome:field('NOME'),nasc:date(field('DATA_NASCIMENTO')),idade:num(field('IDADE')),sexo:field('SEXO'),altura:height(field('ALTURA')),peso:num(field('PESO')),cond:field('DOENCAS'),alerg:field('ALERGIAS'),circ:field('CIRURGIAS_INTERNACOES'),supl:field('SUPLEMENTOS'),info:field('INFORMACOES_IMPORTANTES'),emerg:field('CONTATO_EMERGENCIA'),tel:field('TELEFONE_EMERGENCIA'),menstruacao:date(field('ULTIMA_MENSTRUACAO')),ciclo:field('CICLO_MENSTRUAL'),duracaoMenstr:field('DURACAO_MENSTRUACAO'),sexoFreq:field('FREQUENCIA_SEXUAL'),camisinha:field('USO_PRESERVATIVO'),engravidou:field('JA_ENGRAVIDOU'),mae:field('JA_FOI_MAE'),gestacoes:field('NUMERO_GESTACOES'),reproObs:field('HISTORICO_REPRODUTIVO'),prevColo:date(field('ULTIMO_PREVENTIVO_COLO')),mamografia:date(field('ULTIMA_MAMOGRAFIA')),ist:date(field('ULTIMO_TESTE_IST')),hpv:date(field('VACINA_HPV')),prevProx:date(field('PROXIMO_PREVENTIVO')),prevObs:field('OBSERVACOES_PREVENCAO')};
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
function criarDiagnosticoImportacao(code,step,error,raw){var box=$('importDiagnostic'),diag={versao:'V4.27',codigo:code,etapa:step,mensagem:String(error&&error.message||error||'Erro desconhecido'),tamanhoResposta:String(raw||'').length,navegador:navigator.userAgent,data:new Date().toISOString(),stack:String(error&&error.stack||'').split('\n').slice(0,4).join('\n')};if(box){box.style.display='block';box.innerHTML='<div class="alert danger"><b>🔎 Diagnóstico da falha</b><br>Versão: '+esc(diag.versao)+' · Etapa: '+esc(diag.etapa)+'<br>Código: <b>'+esc(diag.codigo)+'</b><pre style="white-space:pre-wrap;word-break:break-word">'+esc(JSON.stringify(diag,null,2))+'</pre></div>'}console.error('[Minha Saúde IA]',diag)}
function importarNormalizado(n){
 var pk=['nome','nasc','idade','sexo','altura','peso','cond','alerg','circ','supl','info','emerg','tel','menstruacao','ciclo','duracaoMenstr','sexoFreq','camisinha','engravidou','mae','gestacoes','reproObs','prevColo','mamografia','ist','hpv','prevProx','prevObs'],has=function(k){var v=String(n.p[k]||'').trim();return v&&v.toLowerCase()!=='não informado'};
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
 try{render()}catch(renderError){console.error('[Minha Saúde IA] render após importação',renderError);window._importRenderWarning=String(renderError&&renderError.message||renderError)}
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
  var total=n.dores.length+n.consultas.length+n.meds.length+n.exames.length+n.vitais.length+n.vacinas.length+n.familia.length+n.lembretes.length+n.documentos.length+['nome','nasc','idade','sexo','altura','peso','cond','alerg','circ','supl','info','emerg','tel','menstruacao','ciclo','duracaoMenstr','sexoFreq','camisinha','engravidou','mae','gestacoes','reproObs','prevColo','mamografia','ist','hpv','prevProx','prevObs'].filter(function(k){return String(n.p[k]||'').trim()&&String(n.p[k]).toLowerCase()!=='não informado'}).length;
  if(!total)throw new Error('Nenhuma informação reconhecida');
  atualizarProgresso(55,'Organizando histórico','Preparando sintomas, consultas, medicamentos, exames e novos módulos…');await esperar(250);
  atualizarProgresso(75,'Salvando informações','Gravando os dados no seu histórico…');await esperar(250);
  importarNormalizado(n);atualizarProgresso(90,'Atualizando aplicativo','Atualizando seu perfil e seus registros…');await esperar(200);atualizarProgresso(100,'Concluído','Importação concluída com sucesso! ✅');await esperar(500);
 }catch(e){if(loading)loading.style.display='none';if(btn){btn.disabled=false;btn.textContent='✨ Importar e salvar'}criarDiagnosticoImportacao('IMPORT_RUNTIME_001','Processando importação',e,raw);$('resultadoImport').innerHTML='<div class="alert danger">❌ Não consegui importar. Veja o diagnóstico detalhado logo acima.</div>';return}
 if(loading)loading.style.display='none';if(btn){btn.disabled=false;btn.textContent='✨ Importar e salvar'}
}
function limparImportacao(){if($('importIA'))$('importIA').value='';if($('resultadoImport'))$('resultadoImport').innerHTML='';if($('importDiagnostic')){$('importDiagnostic').style.display='none';$('importDiagnostic').innerHTML=''}}
window._importacaoModuloV427=true;