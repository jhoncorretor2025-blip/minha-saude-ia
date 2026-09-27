/* Minha Saúde IA - módulo de importação V4.11 */
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
 var names=['NOME','DATA_NASCIMENTO','IDADE','SEXO','ALTURA','PESO','DOENCAS','ALERGIAS','CIRURGIAS_INTERNACOES','MEDICAMENTOS','SUPLEMENTOS','ULTIMO_SINTOMA','LOCAL_SINTOMA','DATA_INICIO_SINTOMA','INTENSIDADE','OUTROS_SINTOMAS','CONSULTAS','EXAMES','INFORMACOES_IMPORTANTES'];
 var values={},lines=String(raw||'').replace(/\r/g,'').split('\n'),current='';
 lines.forEach(function(line){var m=line.trim().match(/^\[([A-Z0-9_]+)\]\s*$/);if(m&&names.indexOf(m[1])>=0){current=m[1];values[current]='';return}if(current)values[current]+=(values[current]?'\n':'')+line});
 function field(n){var v=String(values[n]||'').trim();return /^não informado$/i.test(v)?'':v}
 function date(v){var m=String(v||'').trim().match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);return m?m[3]+'-'+String(m[2]).padStart(2,'0')+'-'+String(m[1]).padStart(2,'0'):String(v||'').trim()}
 function num(v){var m=String(v||'').replace(',','.').match(/-?\d+(?:\.\d+)?/);return m?m[0]:''}
 function height(v){var n=num(v);if(!n)return '';var x=Number(n);return /m\b/i.test(String(v))&&x<3?String(Math.round(x*100)):String(x)}
 var p={nome:field('NOME'),nasc:date(field('DATA_NASCIMENTO')),idade:num(field('IDADE')),sexo:field('SEXO'),altura:height(field('ALTURA')),peso:num(field('PESO')),cond:field('DOENCAS'),alerg:field('ALERGIAS'),circ:field('CIRURGIAS_INTERNACOES'),supl:field('SUPLEMENTOS'),info:field('INFORMACOES_IMPORTANTES')};
 var med=field('MEDICAMENTOS'),sint=field('ULTIMO_SINTOMA'),local=field('LOCAL_SINTOMA'),data=field('DATA_INICIO_SINTOMA'),inten=field('INTENSIDADE'),outros=field('OUTROS_SINTOMAS');
 var n=parseInt((inten.match(/\d+/)||['0'])[0],10)||0;
 var dores=sint?[{data:data||new Date().toISOString().slice(0,16),local:local||'Não informado',int:Math.max(0,Math.min(10,n)),tipo:'',freq:'',gatilho:'',sint:outros?sint+' — '+outros:sint,obs:'Importado da IA'}]:[];
 var ct=field('CONSULTAS'),et=field('EXAMES');
 var consultas=ct?[{data:'',esp:'',med:'',mot:ct,perg:'',obs:'Importado da IA',ret:''}]:[];
 var exames=et?[{nome:'Exame informado',data:'',res:et,obs:'Importado da IA'}]:[];
 var meds=med?[{nome:med,dose:'',freq:'',inicio:'',fim:'',pres:'',obs:'Importado da IA'}]:[];
 return {p:p,dores:dores,consultas:consultas,meds:meds,exames:exames};
}
function atualizarProgresso(p,step,status){var bar=$('importProgress'),pct=$('importPercent'),st=$('importStep'),msg=$('importStatus');if(bar)bar.style.width=p+'%';if(pct)pct.textContent=p+'%';if(st)st.textContent=step;if(msg)msg.textContent=status}
function esperar(ms){return new Promise(function(resolve){setTimeout(resolve,ms)})}
function criarDiagnosticoImportacao(code,step,error,raw){var box=$('importDiagnostic'),diag={versao:'V4.11',codigo:code,etapa:step,mensagem:String(error&&error.message||error||'Erro desconhecido'),tamanhoResposta:String(raw||'').length,navegador:navigator.userAgent,data:new Date().toISOString(),stack:String(error&&error.stack||'').split('\n').slice(0,4).join('\n')};if(box){box.style.display='block';box.innerHTML='<div class="alert danger"><b>🔎 Diagnóstico da falha</b><br>Versão: '+esc(diag.versao)+' · Etapa: '+esc(diag.etapa)+'<br>Código: <b>'+esc(diag.codigo)+'</b><pre style="white-space:pre-wrap;word-break:break-word">'+esc(JSON.stringify(diag,null,2))+'</pre></div>'}console.error('[Minha Saúde IA]',diag)}
function importarNormalizado(n){
 var pk=['nome','nasc','idade','sexo','altura','peso','cond','alerg','circ','supl','info'],has=function(k){var v=String(n.p[k]||'').trim();return v&&v.toLowerCase()!=='não informado'};
 if(n.dores.length)set(K.d,get(K.d).concat(n.dores));if(n.consultas.length)set(K.c,get(K.c).concat(n.consultas));if(n.meds.length)set(K.m,get(K.m).concat(n.meds));if(n.exames.length)set(K.e,get(K.e).concat(n.exames));
 if(pk.some(has)){var old=get(K.p)[0]||{},merged=Object.assign({},old),novos=0,ignorados=0;pk.forEach(function(k){if(has(k)){if(String(merged[k]||'').trim())ignorados++;else{merged[k]=n.p[k];novos++}}});set(K.p,[merged]);window._importPerfilNovos=novos;window._importPerfilIgnorados=ignorados}
 render();
 var ns=Number(window._importPerfilNovos||0),ig=Number(window._importPerfilIgnorados||0),hist=n.dores.length+n.consultas.length+n.meds.length+n.exames.length;
 $('resultadoImport').innerHTML='<div class="alert safe">✅ <b>Importação concluída!</b> '+ns+' campo(s) novo(s) do perfil e '+hist+' registro(s) de histórico foram salvos. '+(ig?ig+' campo(s) já preenchido(s) foram preservados. ':'')+'</div>';
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
  var total=n.dores.length+n.consultas.length+n.meds.length+n.exames.length+['nome','nasc','idade','sexo','altura','peso','cond','alerg','circ','supl','info'].filter(function(k){return String(n.p[k]||'').trim()&&String(n.p[k]).toLowerCase()!=='não informado'}).length;
  if(!total)throw new Error('Nenhuma informação reconhecida');
  atualizarProgresso(55,'Organizando histórico','Preparando sintomas, consultas, medicamentos e exames…');await esperar(250);
  atualizarProgresso(75,'Salvando informações','Gravando os dados no seu histórico…');await esperar(250);
  importarNormalizado(n);atualizarProgresso(90,'Atualizando aplicativo','Atualizando seu perfil e seus registros…');await esperar(200);atualizarProgresso(100,'Concluído','Importação concluída com sucesso! ✅');await esperar(500);
 }catch(e){if(loading)loading.style.display='none';if(btn){btn.disabled=false;btn.textContent='✨ Importar e salvar'}criarDiagnosticoImportacao('IMPORT_RUNTIME_001','Processando importação',e,raw);$('resultadoImport').innerHTML='<div class="alert danger">❌ Não consegui importar. O diagnóstico foi registrado abaixo.</div>';return}
 if(loading)loading.style.display='none';if(btn){btn.disabled=false;btn.textContent='✨ Importar e salvar'}
}
function limparImportacao(){if($('importIA'))$('importIA').value='';if($('resultadoImport'))$('resultadoImport').innerHTML=''}
window._importacaoModuloV411=true;