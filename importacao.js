function copiarPrompt(){
 const t=$('promptIA');
 navigator.clipboard?.writeText(t.value).then(()=>{$('copiado').textContent='✅ Copiado! Agora cole no ChatGPT ou Gemini.'}).catch(()=>{t.select();document.execCommand('copy');$('copiado').textContent='✅ Copiado!'});
}
function normalObj(x){return x&&typeof x==='object'&&!Array.isArray(x)?x:{}}
function arr(x){return Array.isArray(x)?x:[]}
function first(o,...keys){for(const k of keys)if(o&&o[k]!==undefined&&o[k]!==null&&String(o[k]).trim()!=='')return o[k];return ''}
function normalizarImport(d){
 const p=normalObj(d.perfil||d.profile);
 const dores=arr(d.dores||d.dores_e_sintomas||d.sintomas).map(x=>({
   data:first(x,'data','inicio','quando','datetime'),
   local:first(x,'local','onde','regiao','região'),
   int:Number(first(x,'int','intensidade','intensidade_0_10'))||0,
   tipo:first(x,'tipo','caracteristica','característica'),
   freq:first(x,'freq','frequencia','frequência'),
   gatilho:first(x,'gatilho','gatilhos','piora_melhora'),
   sint:first(x,'sint','sintomas','outros_sintomas'),
   obs:first(x,'obs','observacoes','observações')
 }));
 const consultas=arr(d.consultas).map(x=>({
   data:first(x,'data'),esp:first(x,'especialidade'),med:first(x,'med','medico','médico'),
   mot:first(x,'motivo'),perg:first(x,'perguntas'),obs:first(x,'obs','orientacoes','orientações'),ret:first(x,'ret','retorno')
 }));
 const meds=arr(d.medicamentos||d.remedios||d.remédios).map(x=>({
   nome:first(x,'nome','medicamento','remedio','remédio'),dose:first(x,'dose'),
   freq:first(x,'freq','frequencia','frequência'),inicio:first(x,'inicio','início'),
   fim:first(x,'fim'),pres:first(x,'pres','prescritor','prescrito_por'),obs:first(x,'obs','observacoes','observações')
 }));
 const exames=arr(d.exames).map(x=>({
   nome:first(x,'nome','exame'),data:first(x,'data'),res:first(x,'res','resultado'),obs:first(x,'obs','observacoes','observações')
 }));
 return {p,dores,consultas,meds,exames};
}
function normalizarFichaIA(raw){
 // Parser V4.3: lê a ficha por blocos, sem depender de regex frágil.
 const names=['NOME','DATA_NASCIMENTO','IDADE','SEXO','ALTURA','PESO','DOENCAS','ALERGIAS','CIRURGIAS_INTERNACOES','MEDICAMENTOS','SUPLEMENTOS','ULTIMO_SINTOMA','LOCAL_SINTOMA','DATA_INICIO_SINTOMA','INTENSIDADE','OUTROS_SINTOMAS','CONSULTAS','EXAMES','INFORMACOES_IMPORTANTES'];
 const values={};
 const lines=String(raw||'').replace(/\r/g,'').split('\n');
 let current='';
 for(const line of lines){
   const m=line.trim().match(/^\[([A-Z0-9_]+)\]\s*$/);
   if(m && names.includes(m[1])){current=m[1];values[current]='';continue}
   if(current) values[current]+=(values[current]?'\n':'')+line;
 }
 const field=name=>{
   const v=String(values[name]||'').trim();
   return /^não informado$/i.test(v)?'':v;
 };
 const normalizarData=v=>{
   const m=String(v||'').trim().match(/^(\d{1,2})[\\/-](\d{1,2})[\\/-](\d{4})$/);
   return m?\`\${m[3]}-\${String(m[2]).padStart(2,'0')}-\${String(m[1]).padStart(2,'0')}\`:String(v||'').trim();
 };
 const normalizarNumero=v=>{
   const m=String(v||'').replace(',','.').match(/-?\\d+(?:\\.\\d+)?/);
   return m?m[0]:'';
 };
 const normalizarAltura=v=>{
   const n=normalizarNumero(v);
   if(!n)return '';
   const x=Number(n);
   return /m\\b/i.test(String(v))&&x<3?String(Math.round(x*100)):String(x);
 };
 const p={
  nome:field('NOME'),nasc:normalizarData(field('DATA_NASCIMENTO')),
  idade:normalizarNumero(field('IDADE')),sexo:field('SEXO'),
  altura:normalizarAltura(field('ALTURA')),peso:normalizarNumero(field('PESO')),
  cond:field('DOENCAS'),alerg:field('ALERGIAS'),
  circ:field('CIRURGIAS_INTERNACOES'),supl:field('SUPLEMENTOS'),info:field('INFORMACOES_IMPORTANTES')
 };
 const med=field('MEDICAMENTOS'),sint=field('ULTIMO_SINTOMA'),local=field('LOCAL_SINTOMA'),
       data=field('DATA_INICIO_SINTOMA'),inten=field('INTENSIDADE'),outros=field('OUTROS_SINTOMAS');
 const n=parseInt((inten.match(/\d+/)||['0'])[0],10)||0;
 const dores=sint?[{data:data||new Date().toISOString().slice(0,16),local:local||'Não informado',
   int:Math.max(0,Math.min(10,n)),tipo:'',freq:'',gatilho:'',
   sint:outros?sint+' — '+outros:sint,obs:'Importado da IA'}]:[];
 const ct=field('CONSULTAS'),et=field('EXAMES');
 const consultas=ct?[{data:'',esp:'',med:'',mot:ct,perg:'',obs:'Importado da IA',ret:''}]:[];
 const exames=et?[{nome:'Exame informado',data:'',res:et,obs:'Importado da IA'}]:[];
 const meds=med?[{nome:med,dose:'',freq:'',inicio:'',fim:'',pres:'',obs:'Importado da IA'}]:[];
 return {p,dores,consultas,meds,exames};
}
function importarNormalizado(n){
 const pk=['nome','nasc','idade','sexo','altura','peso','cond','alerg','circ','supl','info'];
 const has=k=>{const v=String(n.p[k]||'').trim();return v&&v.toLowerCase()!=='não informado'};
 const count=n.dores.length+n.consultas.length+n.meds.length+n.exames.length+pk.filter(has).length;
 if(!count)throw new Error('Nenhum dado reconhecido');

 // Importação direta: não exige confirmação e já grava os dados no navegador.
 if(n.dores.length)set(K.d,get(K.d).concat(n.dores));
 if(n.consultas.length)set(K.c,get(K.c).concat(n.consultas));
 if(n.meds.length)set(K.m,get(K.m).concat(n.meds));
 if(n.exames.length)set(K.e,get(K.e).concat(n.exames));
 if(pk.some(has)){
   const old=get(K.p)[0]||{};
   const merged=Object.assign({},old);
   let novos=0,ignorados=0;
   pk.forEach(k=>{
     if(has(k)){
       if(String(merged[k]||'').trim()){
         ignorados++;
       }else{
         merged[k]=n.p[k];
         novos++;
       }
     }
   });
   set(K.p,[merged]);
   window._importPerfilNovos=novos;
   window._importPerfilIgnorados=ignorados;
 }
 render();
 const perfilSalvo=Number(window._importPerfilNovos||0);
 const perfilIgnorado=Number(window._importPerfilIgnorados||0);
 const historicoSalvo=n.dores.length+n.consultas.length+n.meds.length+n.exames.length;
 $('resultadoImport').innerHTML='<div class="alert safe">✅ <b>Importação concluída!</b> '+perfilSalvo+' campo(s) novo(s) do perfil e '+historicoSalvo+' registro(s) de histórico foram salvos. '+(perfilIgnorado?perfilIgnorado+' campo(s) já preenchido(s) foram preservados. ':'')+'Os formatos de data, idade e altura foram ajustados automaticamente para os campos do aplicativo.</div>';
 setTimeout(()=>window.scrollTo({top:0,behavior:'smooth'}),100);
}
function atualizarProgresso(p,step,status){
 const bar=$('importProgress'),pct=$('importPercent'),st=$('importStep'),msg=$('importStatus');
 if(bar)bar.style.width=p+'%';
 if(pct)pct.textContent=p+'%';
 if(st)st.textContent=step;
 if(msg)msg.textContent=status;
}
const esperar=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function criarDiagnosticoImportacao(code,step,error,raw){
 const box=$('importDiagnostic');
 const diag={versao:'V4.8',codigo:code,etapa:step,mensagem:String(error?.message||error||'Erro desconhecido'),tamanhoResposta:String(raw||'').length,navegador:navigator.userAgent,data:new Date().toISOString(),stack:String(error?.stack||'').split('\n').slice(0,4).join('\n')};
 if(box){
  box.style.display='block';
  box.innerHTML='<div class="alert danger"><b>🔎 Diagnóstico da falha</b><br>Versão: '+esc(diag.versao)+' · Etapa: '+esc(diag.etapa)+'<br>Código: <b>'+esc(diag.codigo)+'</b><pre id="importDiagnosticText" style="white-space:pre-wrap;word-break:break-word;background:#fff;margin-top:10px;padding:10px;border-radius:10px;color:#7f1d1d;font-size:11px">'+esc(JSON.stringify(diag,null,2))+'</pre><button class="btn secondary small" type="button" onclick="copiarDiagnosticoImportacao()">📋 Copiar diagnóstico</button></div>';
 }
 console.error('[Minha Saúde IA]',diag);
}
function copiarDiagnosticoImportacao(){
 const el=$('importDiagnosticText');if(!el)return;
 const text=el.textContent;
 navigator.clipboard?.writeText(text).then(()=>{const b=document.querySelector('#importDiagnostic .alert');if(b)b.insertAdjacentHTML('beforeend','<div class="muted" style="margin-top:7px">✅ Diagnóstico copiado.</div>')}).catch(()=>{const ta=document.createElement('textarea');ta.value=text;document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();alert('Diagnóstico copiado!')});
}
async function processarImportacao(){
 const btn=document.querySelector('button[onclick="processarImportacao()"]');
 const loading=$('importLoading');
 let raw=$('importIA').value.trim();
 if(!raw){criarDiagnosticoImportacao('IMPORT_INPUT_001','Leitura da resposta',new Error('Campo de importação vazio'),raw);alert('Cole primeiro a resposta da IA.');return}
 if(/Prepare meus dados pessoais de saúde para importação/i.test(raw) && !/\[NOME\]/i.test(raw)){
   $('resultadoImport').innerHTML='<div class="alert warn">💡 Você colou o <b>prompt</b>, não a resposta da IA. Primeiro envie o prompt ao ChatGPT/Gemini e depois cole aqui a resposta.</div>';
   return;
 }
 try{
   if(btn){btn.disabled=true;btn.textContent='⏳ Importando…';btn.style.opacity='.7'}
   if(loading)loading.style.display='flex';
   atualizarProgresso(10,'Lendo resposta','Lendo as informações recebidas da IA…');
   $('resultadoImport').innerHTML='<div class="alert">⏳ Importação em andamento…</div>';
   await esperar(250);

   raw=raw.replace(/^\s*\`\`\`(?:json|text)?\s*/i,'').replace(/\s*\`\`\`\s*$/,'').trim();
   atualizarProgresso(30,'Organizando perfil','Separando seus dados pessoais e informações de saúde…');
   await esperar(300);

   const n=raw.startsWith('{')?normalizarImport(JSON.parse(raw)):normalizarFichaIA(raw);
   const total=n.dores.length+n.consultas.length+n.meds.length+n.exames.length+
     ['nome','nasc','idade','sexo','altura','peso','cond','alerg','circ','supl','info'].filter(k=>String(n.p[k]||'').trim() && String(n.p[k]).toLowerCase()!=='não informado').length;
   if(!total)throw new Error('Nenhuma informação reconhecida');

   atualizarProgresso(55,'Organizando histórico','Preparando sintomas, consultas, medicamentos e exames…');
   await esperar(350);
   atualizarProgresso(75,'Salvando informações','Gravando os dados no seu histórico…');
   await esperar(350);

   importarNormalizado(n);

   atualizarProgresso(90,'Atualizando aplicativo','Atualizando seu perfil e seus registros…');
   await esperar(350);
   atualizarProgresso(100,'Concluído','Importação concluída com sucesso! ✅');
   await esperar(700);
 }catch(e){
   console.error('Importação:',e);
   if(loading)loading.style.display='none';
   if(btn){btn.disabled=false;btn.textContent='✨ Importar e salvar';btn.style.opacity='1'}
   const etapa=String(e?.message||'').includes('Nenhuma informação')?'Organizando perfil':'Processando importação';
   const codigo=String(e?.message||'').includes('JSON')?'IMPORT_JSON_001':String(e?.message||'').includes('Nenhuma informação')?'IMPORT_PARSE_001':'IMPORT_RUNTIME_001';
   criarDiagnosticoImportacao(codigo,etapa,e,raw);
   $('resultadoImport').innerHTML='<div class="alert danger">❌ Não consegui importar os dados. O diagnóstico da falha foi registrado logo abaixo. <b>Me mande um print dessa área.</b></div>';
   return;
 }
 if(loading)loading.style.display='none';
 if(btn){btn.disabled=false;btn.textContent='✨ Importar e salvar';btn.style.opacity='1'}
}
function limparImportacao(){$('importIA').value='';$('resultadoImport').innerHTML=''}
function processarTextoLivre(){
 const t=$('textoLivre').value.trim();if(!t){alert('Cole algum texto primeiro.');return}
 let added=0;
 // Conservative pattern recognition: creates only records that have enough explicit information.
 const name=t.match(/(?:meu nome é|me chamo)\s+([A-Za-zÀ-ÿ ]{2,60})/i);
 const p=get(K.p)[0]||{};
 if(name){p.nome=name[1].trim();set(K.p,[p]);added++}
 const med=[...t.matchAll(/(?:uso|tomo|tomando|medicamento)\s+([A-Za-zÀ-ÿ0-9 +.-]{3,60})(?:\s+(\d+\s?(?:mg|g|ml|mcg)))?/gi)];
 med.forEach(m=>{set(K.m,get(K.m).concat([{nome:m[1].trim(),dose:m[2]||'',freq:'',inicio:'',fim:'',pres:'',obs:'Importado de texto livre'}]));added++});
 const pain=t.match(/(?:dor|dores)\s+(?:de|no|na|em)\s*([A-Za-zÀ-ÿ ]{2,40})(?:.{0,100}?(\d{1,2})\s*\/\s*10)?/i);
 if(pain){set(K.d,get(K.d).concat([{data:new Date().toISOString().slice(0,16),local:pain[1].trim(),int:Math.min(Number(pain[2]||0),10),tipo:'',freq:'',gatilho:'',sint:t.slice(0,300),obs:'Importado de texto livre'}]));added++}
 render();
 $('resultadoLivre').innerHTML=added?`<div class="alert safe">🪄 Tentei organizar <b>${added}</b> informação(ões). Confira os registros porque o texto livre pode exigir correção manual.</div>`:'<div class="alert warn">Não encontrei informações com segurança suficiente. Use o prompt estruturado acima para obter uma importação mais completa.</div>';
}