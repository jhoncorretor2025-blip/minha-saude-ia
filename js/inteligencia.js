/* Minha Saúde IA — Inteligência V5.76
 * Central de inteligência, linha do tempo inteligente, leitor local e consistência.
 * Não envia dados para servidor/IA e não grava dados clínicos automaticamente.
 */
(function(){
'use strict';
const K=window.MSA_K||window.K||{};
const S=window.MSAStorage;
const read=k=>S&&S.get?S.get(k):[];
const esc=window.MSAUtils&&window.MSAUtils.esc?window.MSAUtils.esc:(s)=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const br=d=>{if(!d)return '—';const s=String(d).slice(0,10),m=s.match(/^(\d{4})-(\d{2})-(\d{2})$/);return m?m[3]+'/'+m[2]+'/'+m[1]:s};
const nowDate=()=>new Date();
const dateOnly=x=>String(x||'').slice(0,10);
const validDate=s=>/^\d{4}-\d{2}-\d{2}$/.test(String(s||''))&&!isNaN(new Date(String(s)+'T12:00:00').getTime());
function profile(){return read(K.p)[0]||{}}
function allData(){
 return [
  ['Sintoma','😣',K.d,'dor',x=>x.data,'local||sint'],
  ['Consulta','👨‍⚕️',K.c,'consultas',x=>x.data,'esp||motivo||mot'],
  ['Medicamento','💊',K.m,'meds',x=>x.inicio||x.fim,'nome||dose'],
  ['Exame','🧪',K.e,'exames',x=>x.data,'nome||res'],
  ['Vacina','💉',K.vax,'acompanhamento',x=>x.data,'nome||obs'],
  ['Sinal vital','❤️',K.v,'acompanhamento',x=>x.data,'peso||pressao||fc'],
  ['Lembrete','⏰',K.r,'lembretes',x=>x.data,'nome||tipo'],
  ['Documento','📄',K.doc,'documentos',x=>x.data,'nome||tipo'],
  ['Família','🧬',K.fam,'familia',x=>x.data,'nome||parentesco'],
  ['Nutrição','🥗',K.nutri,'nutricao',x=>x.data,'nome||obs'],
  ['Sono','😴',K.sono,'sono',x=>x.data||x.noite,'qualidade||obs']
 ].filter(x=>x[2]);
}
function textOf(x,keys){return String(keys.split('||').map(k=>x[k]||'').filter(Boolean).join(' — ')||'Registro')}
function montarEventos(){
 const out=[];
 allData().forEach(d=>read(d[2]).forEach((x,i)=>{
  const data=d[4](x)||x.date||'';
  out.push({cat:d[0],icon:d[1],page:d[3],data:dateOnly(data),title:textOf(x,d[5]),raw:x,index:i});
 }));
 return out.filter(x=>validDate(x.data)).sort((a,b)=>b.data.localeCompare(a.data));
}
function centralInteligencia(){
 const p=profile(),eventos=montarEventos(),hoje=nowDate(),limite=new Date(hoje);limite.setDate(limite.getDate()-30);
 const recentes=eventos.filter(x=>new Date(x.data+'T23:59:59')>=limite);
 const grupos={};eventos.forEach(x=>grupos[x.cat]=(grupos[x.cat]||0)+1);
 const pend=[];
 ['nome','nasc','sexo','altura','peso','sangue','alerg','cond','emerg'].forEach(k=>{
  const v=p[k];if(!v||String(v).trim()===''||/^não informado$|^nao informado$/i.test(String(v)))pend.push(k);
 });
 const nomes={nome:'nome',nasc:'data de nascimento',sexo:'sexo',altura:'altura',peso:'peso',sangue:'tipo sanguíneo',alerg:'alergias/ausência de alergias',cond:'condições de saúde',emerg:'contato de emergência'};
 const cards=[];
 cards.push({icon:'📊',title:'Histórico registrado',text:eventos.length+' registro(s) organizados em '+Object.keys(grupos).length+' categorias.'});
 cards.push({icon:'🕐',title:'Últimos 30 dias',text:recentes.length+' registro(s) encontrados no período.'});
 if(pend.length)cards.push({icon:'📋',title:'Cadastro incompleto',text:'Ainda faltam '+pend.length+' informações importantes: '+pend.slice(0,4).map(k=>nomes[k]).join(', ')+(pend.length>4?' e outras.':'')});
 else cards.push({icon:'✅',title:'Cadastro principal',text:'Os campos essenciais do perfil estão preenchidos.'});
 if(eventos[0])cards.push({icon:'📅',title:'Registro mais recente',text:eventos[0].cat+' em '+br(eventos[0].data)+': '+eventos[0].title});
 const duplicados=detectarDuplicados(false).length;
 if(duplicados)cards.push({icon:'🔁',title:'Possíveis duplicados',text:duplicados+' registro(s) muito semelhantes precisam de conferência.'});
 return {cards,recentes,eventos,pend};
}
window.renderCentralInteligencia=function(){
 const box=document.getElementById('msaInteligenciaResumo');if(!box)return;
 const d=centralInteligencia();
 box.innerHTML=d.cards.map(c=>'<div class="item"><div class="itemtop"><b>'+c.icon+' '+esc(c.title)+'</b></div><p>'+esc(c.text)+'</p></div>').join('');
 const kpi=document.getElementById('msaInteligenciaKpis');if(kpi)kpi.innerHTML='<div class="card stat"><span>📚 Registros</span><b>'+d.eventos.length+'</b></div><div class="card stat"><span>🕐 30 dias</span><b>'+d.recentes.length+'</b></div><div class="card stat"><span>📋 Pendências</span><b>'+d.pend.length+'</b></div><div class="card stat"><span>📄 Documentos</span><b>'+read(K.doc).length+'</b></div>';
};
window.renderLinhaInteligente=function(){
 const box=document.getElementById('msaLinhaInteligente');if(!box)return;
 let eventos=montarEventos(),filtro=document.getElementById('msaTimelineFiltro')?.value||'todos';
 if(filtro!=='todos')eventos=eventos.filter(x=>x.cat===filtro);
 box.innerHTML=eventos.length?'<div class="timeline">'+eventos.slice(0,150).map(x=>'<button type="button" class="tl" style="display:block;width:100%;border:0;background:transparent;text-align:left;cursor:pointer" onclick="go(\''+x.page+'\')"><b>'+x.icon+' '+esc(x.cat)+' · '+esc(br(x.data))+'</b><p>'+esc(x.title)+'</p></button>').join('')+'</div>':'<div class="empty">Nenhum registro encontrado para este filtro.</div>';
};
window.filtrarLinhaInteligente=function(){renderLinhaInteligente()};
function detectarDuplicados(includeFuture){
 const achados=[];
 allData().forEach(d=>{
  const arr=read(d[2]),seen={};
  arr.forEach((x,i)=>{
   const key=JSON.stringify(x);
   if(seen[key]!==undefined)achados.push({cat:d[0],key,indices:[seen[key],i]});
   else seen[key]=i;
  });
 });
 return achados;
}
window.executarConsistenciaSaude=function(){
 const problemas=[],hoje=dateOnly(new Date().toISOString());
 function checkDates(label,key,field){
  read(key).forEach((x,i)=>{const d=dateOnly(x[field]);if(d&&!validDate(d))problemas.push({tipo:'Data inválida',nivel:'alto',texto:label+' #'+(i+1)+' possui uma data inválida.'});else if(d&&d>hoje)problemas.push({tipo:'Data futura',nivel:'medio',texto:label+' #'+(i+1)+' está datado no futuro: '+br(d)+'.'})});
 }
 checkDates('Sintoma',K.d,'data');checkDates('Consulta',K.c,'data');checkDates('Exame',K.e,'data');checkDates('Vacina',K.vax,'data');checkDates('Sinal vital',K.v,'data');checkDates('Lembrete',K.r,'data');
 read(K.m).forEach((x,i)=>{if(validDate(x.inicio)&&validDate(x.fim)&&x.fim<x.inicio)problemas.push({tipo:'Período invertido',nivel:'alto',texto:'Medicamento #'+(i+1)+' termina antes de começar.'})});
 read(K.c).forEach((x,i)=>{if(validDate(x.data)&&validDate(x.ret)&&x.ret<x.data)problemas.push({tipo:'Retorno inconsistente',nivel:'medio',texto:'Consulta #'+(i+1)+' possui retorno anterior à consulta.'})});
 const dup=detectarDuplicados();dup.forEach(x=>problemas.push({tipo:'Possível duplicado',nivel:'baixo',texto:x.cat+' possui registros idênticos nas posições '+(x.indices[0]+1)+' e '+(x.indices[1]+1)+'.'}));
 const p=profile();if(!p.nome)problemas.push({tipo:'Cadastro incompleto',nivel:'baixo',texto:'O nome do perfil ainda não está preenchido.'});
 return problemas;
};
window.renderConsistenciaSaude=function(){
 const box=document.getElementById('msaConsistenciaResultado');if(!box)return;
 const p=executarConsistenciaSaude(),cont={alto:p.filter(x=>x.nivel==='alto').length,medio:p.filter(x=>x.nivel==='medio').length,baixo:p.filter(x=>x.nivel==='baixo').length};
 if(!p.length){box.innerHTML='<div class="alert safe"><b>✅ Nenhuma inconsistência encontrada.</b><br>A verificação não substitui revisão profissional; ela apenas confere a organização dos dados.</div>';return}
 box.innerHTML='<div class="alert '+(cont.alto?'danger':'warn')+'"><b>🔎 '+p.length+' ponto(s) para revisar</b><br>'+cont.alto+' alto(s) · '+cont.medio+' médio(s) · '+cont.baixo+' baixo(s)</div><div class="list" style="margin-top:10px">'+p.map(x=>'<div class="item"><div class="itemtop"><b>'+({alto:'🚨',medio:'⚠️',baixo:'ℹ️'}[x.nivel]||'🔎')+' '+esc(x.tipo)+'</b><span class="tag">'+esc(x.nivel)+'</span></div><p>'+esc(x.texto)+'</p></div>').join('')+'</div>';
};
function setLeitorStatus(msg,kind){
 const box=document.getElementById('msaLeitorStatus');if(box){box.className='alert '+(kind||'safe');box.innerHTML=esc(msg);box.style.display='block'}
}
async function ocrImagem(file,status){
 if(!window.Tesseract){
  await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';s.onload=()=>window.Tesseract?resolve():reject(new Error('OCR não carregou'));s.onerror=()=>reject(new Error('Não foi possível carregar o OCR'));document.head.appendChild(s)});
 }
 const T=window.Tesseract,worker=await T.createWorker('por',1,{logger:m=>{if(status&&m&&m.progress)status.textContent='🔎 OCR: '+Math.round(m.progress*100)+'%'}});
 const res=await worker.recognize(file);await worker.terminate();return res.data.text||'';
}
window.abrirLeitorDocumento=function(){document.getElementById('msaLeitorArquivo')?.click()};
window.lerDocumentoInteligente=async function(ev){
 const file=ev?.target?.files?.[0];if(!file)return;
 const status=document.getElementById('msaLeitorStatus');setLeitorStatus('⏳ Lendo '+file.name+' localmente…','warn');
 try{
  if(file.size>10*1024*1024)throw new Error('O arquivo deve ter no máximo 10 MB.');
  let texto='',paginas=0;
  if(file.type==='application/pdf'||/\.pdf$/i.test(file.name)){
   if(typeof window.extrairTextoPDFArquivo==='function'){const r=await window.extrairTextoPDFArquivo(file);texto=r.text||'';paginas=r.pages||0}
   if(!texto.trim()&&typeof window.extrairTextoPDFComOCR==='function'){const r=await window.extrairTextoPDFComOCR(file,status);texto=r.text||'';paginas=r.pages||paginas}
  }else if(file.type.indexOf('image/')===0){texto=await ocrImagem(file,status)}
  else if(file.type.indexOf('text/')===0||/\.(txt|csv)$/i.test(file.name)){texto=await file.text()}
  else throw new Error('Formato não suportado para leitura inteligente. Use PDF, imagem ou TXT.');
  if(!texto.trim())throw new Error('Não foi possível extrair texto deste arquivo.');
  const ficha=typeof window.normalizarTextoPDFParaImportacao==='function'?window.normalizarTextoPDFParaImportacao(texto):texto;
  const preview=document.getElementById('msaLeitorPreview');if(preview){preview.value=ficha;preview.dataset.original=texto}
  const resumo=document.getElementById('msaLeitorResumo');if(resumo)resumo.innerHTML='<div class="alert safe"><b>✅ Documento lido localmente.</b><br>'+esc(file.name)+' · '+(paginas?paginas+' página(s) · ':'')+texto.length+' caracteres. Revise a prévia antes de enviar para a importação.</div>';
  setLeitorStatus('Leitura concluída. Nenhum dado foi salvo automaticamente.','safe');
 }catch(e){setLeitorStatus('❌ '+(e.message||e),'danger')}
 finally{if(ev?.target)ev.target.value=''}
};
window.enviarLeituraParaImportacao=function(){
 const txt=document.getElementById('msaLeitorPreview')?.value||'';if(!txt.trim()){alert('Faça uma leitura antes de continuar.');return}
 const campo=document.getElementById('importIA');if(!campo){go('importar');setTimeout(window.enviarLeituraParaImportacao,250);return}
 campo.value=txt;go('importar');campo.dispatchEvent(new Event('input',{bubbles:true}));
};
function inicializar(){
 renderCentralInteligencia();renderLinhaInteligente();
 const filtro=document.getElementById('msaTimelineFiltro');if(filtro)filtro.innerHTML='<option value="todos">Todos os registros</option>'+allData().map(x=>'<option>'+esc(x[0])+'</option>').join('');
 renderConsistenciaSaude();
}
window.renderInteligenciaSaude=function(){window.renderCentralInteligencia();window.renderLinhaInteligente();window.renderConsistenciaSaude()};
document.addEventListener('DOMContentLoaded',()=>setTimeout(inicializar,260));
})();
