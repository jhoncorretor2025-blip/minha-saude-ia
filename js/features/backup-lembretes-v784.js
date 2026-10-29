/* Minha Saúde IA — backup fora do navegador, lembretes no calendário e instalar o app (V7.84)
 * 1 Backup: enviar o arquivo para Drive/WhatsApp/e-mail, lembrar a cada X dias, prévia detalhada antes de restaurar
 * 3 Lembretes: arquivo .ics (calendário do celular) com alarme — toca mesmo com o app fechado
 * + Instalar o app (Android/PC) ou instruções (iPhone)
 * Usa as funções e chaves que já existem; não altera o formato dos dados de saúde. */
(function(){
'use strict';
if(window.__msaBkLem784)return;window.__msaBkLem784=true;

var $=function(id){return document.getElementById(id)};
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function lista(k){try{return (typeof get==='function'&&typeof K!=='undefined'&&K[k])?(get(K[k])||[]):[]}catch(e){return[]}}
function dois(n){return (n<10?'0':'')+n}
function hojeISO(){var d=new Date();return d.getFullYear()+'-'+dois(d.getMonth()+1)+'-'+dois(d.getDate())}
function toast(msg){
  try{if(window.msaToast){window.msaToast(msg);return}}catch(e){}
  var c=document.createElement('div');c.className='sf-toast';c.setAttribute('role','status');c.innerHTML='<b>'+esc(msg)+'</b>';document.body.appendChild(c);setTimeout(function(){c.remove()},6500);
}

/* ======================= instalar o app ======================= */
function jaInstalado(){try{return (window.matchMedia&&window.matchMedia('(display-mode: standalone)').matches)||navigator.standalone===true}catch(e){return false}}
function ehIOS(){return /iphone|ipad|ipod/i.test(navigator.userAgent||'')||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1)}
var instaladoAgora=false;
function htmlInstalar(){
  if(instaladoAgora)return '<div class="bk-ok">✅ App instalado! Procure o ícone “Minha Saúde IA” na tela inicial.</div>';
  if(jaInstalado())return '<div class="bk-ok">✅ O app já está instalado neste aparelho.</div>';
  if(window.__msaInstallEvt)return '<button class="btn secondary" type="button" data-bk="instalar">📲 Instalar o app neste aparelho</button><div class="bk-dica">Abre mais rápido, em tela cheia e com ícone na tela inicial.</div>';
  if(ehIOS())return '<div class="bk-dica">📲 <b>No iPhone:</b> toque em <b>Compartilhar</b> e depois em <b>“Adicionar à Tela de Início”</b>.</div>';
  return '<div class="bk-dica">📲 Para instalar: no menu do navegador, escolha <b>“Instalar app”</b> ou <b>“Adicionar à tela inicial”</b>.</div>';
}
function atualizarInstalar(){document.querySelectorAll('.bk-instalar-slot').forEach(function(el){var h=htmlInstalar();if(el.getAttribute('data-h')!==h){el.setAttribute('data-h',h);el.innerHTML=h}})}
function instalar(){
  var ev=window.__msaInstallEvt;if(!ev)return;
  try{ev.prompt();ev.userChoice.then(function(r){window.__msaInstallEvt=null;atualizarInstalar();if(r&&r.outcome==='accepted')toast('✅ Instalando o app…')}).catch(function(){})}catch(e){console.warn('[Minha Saúde IA] instalar',e)}
}
window.addEventListener('msa:instalavel',atualizarInstalar);
window.addEventListener('msa:instalado',function(){instaladoAgora=true;atualizarInstalar();toast('✅ App instalado!')});

/* ======================= calendário (.ics) ======================= */
function icsTexto(t){return String(t==null?'':t).replace(/\\/g,'\\\\').replace(/;/g,'\\;').replace(/,/g,'\\,').replace(/\r?\n/g,'\\n')}
function dobrar(linha){ /* linhas do .ics têm no máximo 75 bytes; a continuação começa com espaço */
  var enc=new TextEncoder();if(enc.encode(linha).length<=75)return linha;
  var partes=[],cur='',len=0,lim=75;
  Array.from(linha).forEach(function(ch){var l=enc.encode(ch).length;if(len+l>lim){partes.push(cur);cur='';len=0;lim=74}cur+=ch;len+=l});
  partes.push(cur);return partes.join('\r\n ');
}
function carimbo(){var d=new Date();return d.getUTCFullYear()+dois(d.getUTCMonth()+1)+dois(d.getUTCDate())+'T'+dois(d.getUTCHours())+dois(d.getUTCMinutes())+dois(d.getUTCSeconds())+'Z'}
function parteData(s){var m=String(s||'').match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?/);return m?{a:m[1],m:m[2],d:m[3],h:m[4]||null,mi:m[5]||null,iso:m[1]+'-'+m[2]+'-'+m[3]}:null}
function dataHora(p){return p.a+p.m+p.d+'T'+(p.h||'09')+(p.mi||'00')+'00'}
function somarMin(p,min){var d=new Date(Number(p.a),Number(p.m)-1,Number(p.d),Number(p.h||9),Number(p.mi||0)+min);return d.getFullYear()+dois(d.getMonth()+1)+dois(d.getDate())+'T'+dois(d.getHours())+dois(d.getMinutes())+'00'}
function diaSeguinte(p){var d=new Date(Number(p.a),Number(p.m)-1,Number(p.d)+1);return d.getFullYear()+dois(d.getMonth()+1)+dois(d.getDate())}
function alarme(gatilho,desc){return ['BEGIN:VALARM','ACTION:DISPLAY','DESCRIPTION:'+icsTexto(desc),'TRIGGER:'+gatilho,'END:VALARM']}
var ICONE_TIPO={'Medicamento':'💊','Consulta':'👨‍⚕️','Exame':'🧪','Outro':'🔔'};

function eventosRemedios(){
  var hj=parteData(hojeISO()),out=[];
  lista('medRot').forEach(function(m){
    if(!m||!m.hora||!/^\d{2}:\d{2}$/.test(m.hora))return;
    var h=m.hora.split(':'),p={a:hj.a,m:hj.m,d:hj.d,h:h[0],mi:h[1]};
    var desc='Lembrete diário do Minha Saúde IA. Depois de tomar, marque ✅ no app.'+((m.estoque!==undefined&&m.estoque!=='')?' Estoque restante: '+m.estoque+'.':'');
    out.push(['BEGIN:VEVENT','UID:msa-med-'+m.id+'-'+m.hora.replace(':','')+'@minha-saude-ia','DTSTAMP:'+carimbo(),'DTSTART:'+dataHora(p),'DTEND:'+somarMin(p,10),'RRULE:FREQ=DAILY',
      'SUMMARY:'+icsTexto('💊 '+(m.nome||'Remédio')+(m.dose?' — '+m.dose:'')),'DESCRIPTION:'+icsTexto(desc),'CATEGORIES:Saúde'].concat(alarme('PT0S','Hora do remédio: '+(m.nome||'')),['END:VEVENT']));
  });
  return out;
}
function eventosLembretes(){
  var hj=hojeISO(),out=[];
  lista('r').forEach(function(x,i){
    var p=parteData(x&&x.data);if(!p||p.iso<hj)return;
    var tipo=x.tipo||'Outro',ic=ICONE_TIPO[tipo]||'🔔',importante=(tipo==='Consulta'||tipo==='Exame');
    var ev=['BEGIN:VEVENT','UID:msa-lem-'+(x.id||i)+'-'+dataHora(p)+'@minha-saude-ia','DTSTAMP:'+carimbo(),'DTSTART:'+dataHora(p),'DTEND:'+somarMin(p,30),
      'SUMMARY:'+icsTexto(ic+' '+(x.nome||'Lembrete')),'DESCRIPTION:'+icsTexto('Lembrete do Minha Saúde IA ('+tipo+').'),'CATEGORIES:Saúde'];
    if(importante)ev=ev.concat(alarme('-P1D','Amanhã: '+(x.nome||tipo)));
    ev=ev.concat(alarme(importante?'-PT1H':'PT0S',(x.nome||tipo)),['END:VEVENT']);out.push(ev);
  });
  return out;
}
function eventoDiaInteiro(uid,p,titulo,desc){
  return ['BEGIN:VEVENT','UID:'+uid+'@minha-saude-ia','DTSTAMP:'+carimbo(),'DTSTART;VALUE=DATE:'+p.a+p.m+p.d,'DTEND;VALUE=DATE:'+diaSeguinte(p),'SUMMARY:'+icsTexto(titulo),'DESCRIPTION:'+icsTexto(desc),'CATEGORIES:Saúde']
    .concat(alarme('-PT15H','Amanhã: '+titulo),alarme('PT8H','Hoje: '+titulo),['END:VEVENT']);
}
function eventosConsultas(){
  var hj=hojeISO(),out=[];
  lista('c').forEach(function(c,i){
    var med=(c.med?' — '+c.med:''),esp=c.esp||'Consulta';
    var p=parteData(c&&c.data);
    if(p&&p.iso>=hj)out.push(eventoDiaInteiro('msa-cons-'+(c.id||i)+'-'+p.iso,p,'👨‍⚕️ '+esp+med,[c.mot?'Motivo: '+c.mot:'',c.perg?'Perguntas para levar: '+c.perg:''].filter(Boolean).join('\n')||'Consulta registrada no Minha Saúde IA.'));
    var r=parteData(c&&c.ret);
    if(r&&r.iso>=hj)out.push(eventoDiaInteiro('msa-ret-'+(c.id||i)+'-'+r.iso,r,'↩️ Retorno: '+esp+med,'Retorno combinado na consulta de '+(p?p.d+'/'+p.m+'/'+p.a:'data anterior')+'.'));
  });
  return out;
}
function eventosExames(){
  var hj=hojeISO(),out=[];
  lista('e').forEach(function(x,i){var p=parteData(x&&x.data);if(p&&p.iso>=hj)out.push(eventoDiaInteiro('msa-exame-'+(x.id||i)+'-'+p.iso,p,'🧪 Exame: '+(x.nome||''),'Exame registrado no Minha Saúde IA.'))});
  return out;
}
var FONTES={remedios:eventosRemedios,lembretes:eventosLembretes,consultas:eventosConsultas,exames:eventosExames};
function gerarICS(quais){
  var evs=[];(quais||['remedios','lembretes','consultas','exames']).forEach(function(q){if(FONTES[q])evs=evs.concat(FONTES[q]())});
  var linhas=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Minha Saúde IA//Lembretes//PT-BR','CALSCALE:GREGORIAN','METHOD:PUBLISH','X-WR-CALNAME:Minha Saúde IA'];
  evs.forEach(function(e){linhas=linhas.concat(e)});linhas.push('END:VCALENDAR');
  return {texto:linhas.map(dobrar).join('\r\n')+'\r\n',eventos:evs.length};
}
function contar(q){try{return FONTES[q]().length}catch(e){return 0}}
function baixarICS(quais,nome){
  var r=gerarICS(quais);
  if(!r.eventos){toast('ℹ️ Não há nada para levar ao calendário ainda.');return false}
  var blob=new Blob([r.texto],{type:'text/calendar;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download=nome||'minha-saude-lembretes.ics';a.style.display='none';document.body.appendChild(a);a.click();a.remove();
  setTimeout(function(){URL.revokeObjectURL(url)},1500);
  toast('✅ Arquivo do calendário baixado ('+r.eventos+' item(ns)). Abra-o e escolha seu calendário.');
  return true;
}
window.msaCalendario={gerar:gerarICS,baixar:baixarICS,contar:contar};

var COMO_USAR='<div class="bk-dica">Abra o arquivo baixado e escolha o <b>Google Agenda</b> (ou o calendário do iPhone). Depois disso o alarme toca <b>mesmo com o app fechado</b>.</div>';
function cartao(id,titulo,texto,botoes,extra){
  var c=document.createElement('div');c.id=id;c.className='card bk-card';
  c.innerHTML='<h2>'+titulo+'</h2><div class="muted">'+texto+'</div><div class="row bk-linha" data-bk-botoes="'+id+'">'+botoes+'</div>'+(extra||'');
  return c;
}
function botaoCal(quais,rotulo,classe){return '<button class="btn '+(classe||'green')+'" type="button" data-bk-cal="'+quais+'">'+rotulo+'</button>'}
function atualizarRotulosCal(){
  var n={remedios:contar('remedios'),lembretes:contar('lembretes'),consultas:contar('consultas'),exames:contar('exames')};
  document.querySelectorAll('[data-bk-cal]').forEach(function(b){
    var q=b.getAttribute('data-bk-cal'),base=b.getAttribute('data-bk-base')||b.textContent.replace(/\s*\(\d+\)\s*$/,'');b.setAttribute('data-bk-base',base);
    var total=q==='tudo'?(n.remedios+n.lembretes+n.consultas+n.exames):(n[q]||0);
    b.textContent=base+' ('+total+')';b.disabled=!total;b.title=total?'':'Ainda não há itens para levar ao calendário';
  });
}

/* ======================= backup fora do navegador ======================= */
function infoBackup(){try{return window.msaBackupInfo?window.msaBackupInfo():null}catch(e){return null}}
function diasDesde(d){return d?Math.max(0,Math.floor((Date.now()-d.getTime())/86400000)):null}
function htmlStatusBackup(){
  var i=infoBackup();if(!i)return '';
  var d=diasDesde(i.ultimo);
  if(d===null)return '⚠️ Você ainda não gerou nenhum backup neste navegador.';
  var quando=d===0?'hoje':(d===1?'ontem':'há '+d+' dias');
  return (i.ativo&&d>=i.dias?'⚠️':'✅')+' Último backup: <b>'+quando+'</b> ('+i.ultimo.toLocaleDateString('pt-BR')+')'+(i.ativo?'. Lembrete a cada <b>'+i.dias+' dias</b>.':'. Lembrete desligado.');
}
function opcoesFreq(){
  var i=infoBackup()||{ativo:true,dias:7},atual=i.ativo?String(i.dias):'0';
  return [['3','A cada 3 dias'],['7','A cada 7 dias'],['15','A cada 15 dias'],['30','A cada 30 dias'],['0','Não lembrar']].map(function(o){return '<option value="'+o[0]+'"'+(o[0]===atual?' selected':'')+'>'+o[1]+'</option>'}).join('');
}
function marcarBackupFeito(){
  try{window.msaStorage.setItem('msa2_backup_last_export_at',new Date().toISOString())}catch(e){}
  try{if(window.msaAtualizarLembreteBackup)window.msaAtualizarLembreteBackup()}catch(e){}
  atualizarStatusBackup();
}
async function enviarBackup(){
  try{
    if(typeof window.msaMontarPacoteBackup!=='function'){alert('O backup ainda está carregando. Tente de novo em instantes.');return}
    var pkg=window.msaMontarPacoteBackup(),nome='minha-saude-ia-backup-'+hojeISO()+'.json';
    var arq=new File([JSON.stringify(pkg,null,2)],nome,{type:'application/json'});
    if(navigator.canShare&&navigator.share&&navigator.canShare({files:[arq]})){
      await navigator.share({files:[arq],title:'Backup do Minha Saúde IA',text:'Backup dos meus dados de saúde. Guarde em local seguro.'});
      marcarBackupFeito();toast('✅ Backup enviado. Confira se ele chegou ao destino escolhido.');
    }else{
      window.exportarJSONCompleto();
      alert('Este navegador não abre o menu de compartilhar arquivos. O backup foi salvo no aparelho (pasta Downloads): envie esse arquivo para o Google Drive ou para o seu e-mail.');
    }
  }catch(e){
    if(e&&e.name==='AbortError')return; /* a pessoa fechou o menu de compartilhar */
    console.error('[Minha Saúde IA] enviar backup',e);alert('❌ Não foi possível enviar o backup. '+(e&&e.message?e.message:''));
  }
}
function atualizarStatusBackup(){
  var el=$('bkStatus');if(!el)return;
  var h=htmlStatusBackup(),i=infoBackup(),d=i?diasDesde(i.ultimo):null,atrasado=(d===null)||(i&&i.ativo&&d>=i.dias);
  el.className='alert '+(atrasado?'warn':'safe')+' bk-status';
  if(el.getAttribute('data-h')!==h){el.setAttribute('data-h',h);el.innerHTML=h}
}

/* prévia detalhada antes de restaurar (usada por recursos.js → restaurarBackup) */
var ROTULOS=[['d','sintomas','😣'],['c','consultas','👨‍⚕️'],['m','medicamentos','💊'],['e','exames','🧪'],['v','registros de sinais vitais','❤️'],['medRot','horários de remédio','⏰'],['r','lembretes','🔔'],['medidas','medidas corporais','📏']];
function rotuloDaChave(chave){
  try{for(var i=0;i<ROTULOS.length;i++){if(typeof K!=='undefined'&&K[ROTULOS[i][0]]===chave)return ROTULOS[i]}
    if(typeof K!=='undefined'&&K.p===chave)return ['p','dados do perfil','👤'];
    if(chave==='msa2_familiares')return ['f','familiares','👪'];}catch(e){}
  return ['x','outros dados','🗂️'];
}
window.msaPreviaRestauracao=function(info){
  return new Promise(function(resolve){
    try{
      var pkg=info.pkg||{},grupos={},ordem=[];
      (info.prepared||[]).forEach(function(it){
        var r=rotuloDaChave(it.key),g=grupos[r[1]];if(!g){g=grupos[r[1]]={ic:r[2],novos:0,campos:0};ordem.push(r[1])}
        var antes=null,depois=null;try{antes=it.beforeRaw?JSON.parse(it.beforeRaw):null;depois=JSON.parse(it.nextRaw)}catch(e){}
        if(Array.isArray(depois))g.novos+=Math.max(0,depois.length-(Array.isArray(antes)?antes.length:0));
        else g.campos+=Math.max(1,Object.keys(depois||{}).length-Object.keys(antes||{}).length);
      });
      var linhas=ordem.map(function(n){var g=grupos[n];return '<li>'+g.ic+' '+(g.novos?'<b>'+g.novos+'</b> novo(s) em '+esc(n):'<b>'+esc(n)+'</b>: dados completados')+'</li>'}).join('');
      var quando=pkg.exportedAt?new Date(pkg.exportedAt):null,okData=quando&&isFinite(quando.getTime());
      var integ=info.integridade,selo=integ==='ok'?'<div class="bk-selo ok">✅ Arquivo íntegro: a conferência de integridade confere.</div>':integ==='falhou'?'<div class="bk-selo aviso">⚠️ <b>A conferência de integridade falhou.</b> O arquivo pode ter sido alterado ou corrompido.</div>':'<div class="bk-selo info">ℹ️ Backup de uma versão anterior, sem conferência de integridade.</div>';
      var fundo=document.createElement('div');fundo.id='bkPrevia';fundo.className='bk-fundo';fundo.setAttribute('role','dialog');fundo.setAttribute('aria-modal','true');fundo.setAttribute('aria-label','Prévia da restauração do backup');
      fundo.innerHTML='<div class="bk-folha"><h2>♻️ Restaurar este backup?</h2><p class="bk-meta">Arquivo <b>'+esc((info.file&&info.file.name)||'backup')+'</b>'+(info.file?' ('+Math.max(1,Math.round(info.file.size/1024))+' KB)':'')+(okData?' · criado em <b>'+quando.toLocaleString('pt-BR')+'</b>':'')+(pkg.appVersion?' · versão <b>'+esc(pkg.appVersion)+'</b>':'')+'</p>'+selo+
        '<div class="bk-sub">O que vai entrar:</div><ul class="bk-lista">'+(linhas||'<li>Nada novo: seus dados já têm tudo o que está neste arquivo.</li>')+'</ul>'+
        '<p class="bk-nota">🔒 Nada do que você tem hoje será apagado: só entra o que ainda não existe aqui. O PIN e as preferências visuais não são restaurados.</p>'+
        (integ==='falhou'?'<label class="bk-risco"><input type="checkbox" id="bkRisco"> Entendo o risco e quero restaurar mesmo assim</label>':'')+
        '<div class="bk-acoes"><button type="button" class="btn secondary" data-bk-previa="nao">Cancelar</button><button type="button" class="btn green" data-bk-previa="sim"'+(integ==='falhou'?' disabled':'')+'>♻️ Restaurar</button></div></div>';
      var antesFoco=document.activeElement;
      function fechar(v){document.removeEventListener('keydown',tecla,true);fundo.remove();try{if(antesFoco&&antesFoco.focus)antesFoco.focus()}catch(e){}resolve(v)}
      function tecla(e){if(e.key==='Escape'){e.preventDefault();fechar(false)}}
      document.addEventListener('keydown',tecla,true);
      fundo.addEventListener('mousedown',function(e){if(e.target===fundo)fechar(false)});
      fundo.addEventListener('click',function(e){var b=e.target.closest('[data-bk-previa]');if(b)fechar(b.getAttribute('data-bk-previa')==='sim')});
      fundo.addEventListener('change',function(e){if(e.target.id==='bkRisco'){var s=fundo.querySelector('[data-bk-previa="sim"]');if(s)s.disabled=!e.target.checked}});
      document.body.appendChild(fundo);var foco=fundo.querySelector('[data-bk-previa="nao"]');if(foco)foco.focus();
    }catch(e){console.warn('[Minha Saúde IA] prévia da restauração',e);resolve(confirm('Restaurar este backup? Seus registros atuais serão mantidos.'))}
  });
};

/* ======================= montar os cartões nas páginas ======================= */
function montar(){
  var bak=$('backup');
  if(bak&&!$('bkCartao')){
    var c=cartao('bkCartao','☁️ Levar o backup para fora do navegador','Os dados ficam só neste navegador. Se você limpar o navegador ou trocar de celular, eles se perdem. Envie uma cópia para o <b>Google Drive</b>, e-mail ou WhatsApp.',
      '<button class="btn green" type="button" data-bk="enviar">📤 Enviar backup (Drive, WhatsApp, e-mail)</button><button class="btn secondary" type="button" data-bk="salvar">⬇️ Salvar no aparelho</button>',
      '<div id="bkStatus" class="alert safe bk-status" role="status"></div><label class="bk-freq">🔔 Lembrar de fazer backup<select id="bkFreq" aria-label="Frequência do lembrete de backup"></select></label><div class="bk-instalar-slot"></div>');
    var ref=$('msaBackupSettingsStatus');var alvo=ref&&ref.closest('.card');
    if(alvo&&alvo.parentNode)alvo.insertAdjacentElement('afterend',c);else bak.insertBefore(c,bak.firstChild);
  }
  var f=$('bkFreq');if(f&&!f.getAttribute('data-ok')){f.setAttribute('data-ok','1');f.innerHTML=opcoesFreq()}
  var meds=$('meds');
  if(meds&&!$('bkCalMeds')){
    var c2=cartao('bkCalMeds','⏰ Lembrete de remédio no calendário do celular','Gera um alarme <b>todo dia</b> em cada horário da sua rotina de remédios. Funciona mesmo com o app fechado.',botaoCal('remedios','📅 Adicionar remédios ao calendário'),COMO_USAR);
    var a2=meds.querySelector('.card');if(a2&&a2.parentNode)a2.insertAdjacentElement('afterend',c2);else meds.insertBefore(c2,meds.firstChild);
  }
  var lem=$('lembretes');
  if(lem&&!$('bkCalLem')){
    var c3=cartao('bkCalLem','📅 Levar para o calendário do celular','Seus lembretes, consultas, retornos e exames viram eventos com alarme. O aviso toca <b>mesmo com o app fechado</b>.',
      botaoCal('remedios','💊 Remédios','secondary')+botaoCal('lembretes','🔔 Lembretes','secondary')+botaoCal('consultas','👨‍⚕️ Consultas e retornos','secondary')+botaoCal('exames','🧪 Exames','secondary')+botaoCal('tudo','📅 Tudo de uma vez'),COMO_USAR+'<div class="bk-instalar-slot"></div>');
    lem.insertBefore(c3,lem.firstChild);
  }
  var con=$('consultas');
  if(con&&!$('bkCalCons')){
    var c4=cartao('bkCalCons','📅 Consultas e retornos no calendário','Leva as consultas e os retornos que ainda vão acontecer para o calendário do celular, com aviso na véspera e no dia.',botaoCal('consultas','📅 Adicionar ao calendário'),COMO_USAR);
    var p1=con.querySelector('.card');if(p1&&p1.parentNode)p1.insertAdjacentElement('afterend',c4);else con.insertBefore(c4,con.firstChild);
  }
  atualizarRotulosCal();atualizarStatusBackup();atualizarInstalar();
}

document.addEventListener('click',function(e){
  var b=e.target&&e.target.closest&&e.target.closest('[data-bk],[data-bk-cal]');if(!b)return;
  if(b.hasAttribute('data-bk-cal')){var q=b.getAttribute('data-bk-cal');baixarICS(q==='tudo'?null:[q],'minha-saude-'+(q==='tudo'?'lembretes':q)+'.ics');return}
  var a=b.getAttribute('data-bk');
  if(a==='enviar')enviarBackup();
  else if(a==='salvar'){if(typeof window.exportarJSONCompleto==='function')window.exportarJSONCompleto()}
  else if(a==='instalar')instalar();
});
document.addEventListener('change',function(e){
  if(!e.target||e.target.id!=='bkFreq')return;
  var n=Number(e.target.value);
  if(typeof window.msaDefinirFrequenciaBackup==='function')window.msaDefinirFrequenciaBackup(n);
  atualizarStatusBackup();toast(n?'✅ Vou lembrar de fazer backup a cada '+n+' dias.':'🔕 Lembrete de backup desligado.');
});

function iniciar(){
  montar();
  setInterval(function(){if(!document.hidden)montar()},1500);
  window.addEventListener('msa:grupo-carregado',montar);
  window.msaBackupLembretes784={montar:montar,enviarBackup:enviarBackup,gerarICS:gerarICS};
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(iniciar,300)},{once:true});else setTimeout(iniciar,300);
})();
