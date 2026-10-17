/* Minha Saúde IA — Perguntas sobre minha saúde (V6.33)
 * A pessoa escolhe uma pergunta pronta. O app junta a pergunta + o resumo dos registros (healthText)
 * + regras de segurança, copia e abre a IA escolhida. Nada é enviado sem a pessoa tocar no botão.
 */
(function(){
'use strict';
var ID='perguntas-saude';
var PERGUNTAS=[
 {grupo:'🩺 Visão geral',itens:[
  ['💚','Como está minha saúde, de forma geral?','Faça um resumo simples de como está minha saúde com base nos registros: o que parece bem, o que merece atenção e o que está faltando registrar.'],
  ['📋','O que eu deveria conversar com o médico?','Liste os pontos dos meus registros que valem a pena levar para uma consulta, em ordem de prioridade, com perguntas prontas para eu fazer.'],
  ['⏱️','Me faça um resumo para mostrar ao médico em 1 minuto','Monte um resumo curto e organizado (até 12 linhas) com o mais importante dos meus registros: condições, remédios, alergias, sintomas recentes e exames, no formato que um médico lê rápido.'],
  ['⚖️','Meu peso está adequado para a minha altura?','Com base no peso e altura registrados, calcule o IMC, explique o que ele significa de forma simples, lembre as limitações do IMC e diga se vale conversar com um profissional.']
 ]},
 {grupo:'🤒 Sintomas',itens:[
  ['🔍','O que pode ser esse sintoma?','Olhe os sintomas que registrei (local, intensidade, quando começou, o que melhora ou piora) e liste as possibilidades mais comuns em linguagem simples, como hipóteses para eu conversar com o médico — deixe claro que não é diagnóstico. Explique o que diferencia uma possibilidade da outra.'],
  ['🚨','Quando devo me preocupar com esse sintoma?','Com base nos meus sintomas registrados, liste os sinais de alerta que indicariam procurar atendimento logo (pronto-socorro) e os que podem esperar uma consulta marcada.'],
  ['👨‍⚕️','Que especialista devo procurar?','Com base nos meus sintomas e registros, diga qual tipo de profissional (clínico geral, cardiologista, ortopedista, nutricionista…) faz mais sentido procurar primeiro e por quê.'],
  ['🔗','Meu sintoma pode ter relação com algum remédio que uso?','Compare os sintomas registrados com os medicamentos e suplementos registrados e diga se algum deles costuma causar efeitos parecidos, para eu confirmar com o médico ou farmacêutico. Não sugira parar nenhum remédio.']
 ]},
 {grupo:'🥗 Alimentação',itens:[
  ['✅','Quais alimentos são bons para mim?','Com base no meu perfil, condições, alergias, objetivos e hábitos registrados, sugira alimentos e tipos de refeição que costumam ajudar alguém com esse perfil. Explique o porquê de cada um.'],
  ['⛔','Quais alimentos devo evitar ou diminuir?','Com base nos meus registros (condições, alergias, intolerâncias, remédios e objetivos), diga quais alimentos ou hábitos alimentares eu deveria evitar ou reduzir, e por quê. Destaque possíveis interações entre alimentos e os remédios registrados.'],
  ['🍽️','Monte um cardápio simples de 1 dia para mim','Monte um exemplo de cardápio de um dia (café, almoço, lanche e jantar) com comida brasileira do dia a dia, barata e fácil, respeitando minhas alergias, intolerâncias e condições registradas. Sem dietas restritivas.'],
  ['🧂','Que vitaminas ou nutrientes podem estar faltando?','Com base na alimentação, rotina e exames registrados, diga quais nutrientes podem merecer atenção e que exames ajudariam a confirmar. Não indique suplementos sem orientação profissional.'],
  ['💧','Estou bebendo água suficiente?','Analise o que registrei sobre água, peso, atividade física, calor e rotina e diga se a minha hidratação parece adequada e como melhorar.']
 ]},
 {grupo:'🏃 Hábitos',itens:[
  ['🧩','Qual hábito saudável está faltando?','Com base nos meus registros, aponte os hábitos saudáveis que parecem estar faltando na minha rotina (sono, atividade física, alimentação, hidratação, consultas preventivas, vacinas…) e como começar de forma simples.'],
  ['⚠️','Qual hábito meu pode estar errado?','Com base nos meus registros, aponte hábitos que podem estar prejudicando minha saúde (por exemplo: muito tempo sentado, pouco sono, uso frequente de remédio para dor, álcool, cigarro) e sugira trocas simples e realistas.'],
  ['🗓️','Monte um plano de 7 dias para eu melhorar','Crie um plano de 7 dias com UMA pequena mudança por dia, baseada nos meus registros (ex.: dia 1 beber mais água, dia 2 caminhar 10 minutos…). Coisas fáceis de cumprir.'],
  ['🏋️','Que exercícios combinam comigo?','Com base na idade, peso, rotina, dores e condições registradas, sugira tipos de atividade física para começar com segurança e o que evitar. Lembre de liberar com o médico se houver condição que peça cuidado.'],
  ['😴','Como posso dormir melhor?','Analise meus registros de sono, bem-estar, estresse e rotina e sugira mudanças práticas para melhorar meu sono.'],
  ['🧘','Como diminuir o estresse e a ansiedade no dia a dia?','Com base nos registros de estresse, ansiedade, sono e gatilhos, sugira práticas simples para o dia a dia e diga quando vale procurar um psicólogo ou médico.']
 ]},
 {grupo:'💊 Remédios e exames',itens:[
  ['💊','Tem algo nos meus remédios que devo perguntar ao médico?','Olhe os medicamentos e suplementos registrados e liste dúvidas importantes para eu levar ao médico ou farmacêutico (horários, combinações, uso prolongado). Não mude doses nem sugira parar ou começar remédios.'],
  ['🧪','Que exames ou consultas preventivas estão atrasados?','Com base na minha idade, sexo e registros, liste exames e consultas preventivas que costumam ser recomendados e que não aparecem nos meus registros, para eu conversar com o médico.'],
  ['📈','Me explique meus exames em linguagem simples','Explique, em palavras simples, o que significam os exames e resultados que registrei, o que cada item mede e quais pontos vale levar ao médico. Não feche diagnóstico.'],
  ['🧬','Meu histórico familiar pede atenção em quê?','Com base no histórico familiar registrado, diga quais cuidados e exames preventivos costumam ser recomendados para quem tem esse histórico, para eu conversar com o médico.']
 ]},
 {grupo:'🌿 Práticas complementares',itens:[
  ['🌿','Se você fosse um homeopata, o que me indicaria?','Responda como um homeopata explicaria, com base nos meus sintomas e registros, o que a homeopatia costuma considerar para esse quadro. Seja honesto: diga claramente que as evidências científicas de efeito da homeopatia além do placebo são fracas, que ela não substitui nenhum tratamento indicado pelo médico, e que nada deve ser usado no lugar dos remédios registrados. Sugira levar a ideia ao médico antes de usar.'],
  ['🍵','Tem chá ou remédio caseiro seguro para o que sinto?','Com base nos meus sintomas, sugira opções caseiras simples (chás, compressas, repouso, hidratação) que costumam aliviar desconfortos leves, e avise sobre interações com os remédios registrados, gravidez e condições que contraindicam. Deixe claro quando o caso pede médico.'],
  ['🌱','Fitoterápicos ou suplementos combinam com meus remédios?','Olhe os medicamentos registrados e diga quais plantas medicinais, chás ou suplementos comuns podem interagir com eles, para eu confirmar com o farmacêutico antes de usar.']
 ]}
];
var REGRAS=[
 'Você vai me ajudar a entender meus próprios registros de saúde. Responda em português do Brasil, com linguagem simples, como se explicasse para alguém sem formação na área.',
 'Use SOMENTE as informações do resumo abaixo. Não invente dados. Se faltar informação para responder bem, diga o que falta.',
 'Não feche diagnóstico: quando falar de possíveis causas, apresente como hipóteses para conversar com o médico. Não prescreva, não mude doses e não diga para parar ou começar remédios. Para decisões de tratamento, oriente a procurar um profissional de saúde.',
 'Se algo no resumo indicar possível urgência, diga claramente para procurar atendimento.',
 'Formato da resposta: 1) resposta curta em 2 linhas; 2) tópicos com emojis e títulos em negrito; 3) "✅ O que fazer agora" com até 3 passos simples; 4) "🩺 O que perguntar ao médico".'
].join('\n- ');
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function resumo(){try{return typeof healthText==='function'?healthText():''}catch(e){return ''}}
function montarPrompt(pergunta,detalhe){
 return 'PERGUNTA: '+pergunta+'\n\nO QUE EU QUERO: '+detalhe+'\n\nREGRAS:\n- '+REGRAS+'\n\n===== MEUS REGISTROS DE SAÚDE (Minha Saúde IA) =====\n'+resumo();
}
function iasAtivas(){
 try{var lista=(typeof preferenciasPadrao==='function'?preferenciasPadrao().ias:[])||[];lista=lista.filter(function(x){return x&&x.ativo&&x.web});if(lista.length)return lista}catch(e){}
 return [{id:'chatgpt',nome:'ChatGPT',icone:'🟢',web:'https://chatgpt.com/'},{id:'gemini',nome:'Gemini',icone:'🔵',web:'https://gemini.google.com/app'}];
}
function copiar(texto){
 if(navigator.clipboard&&navigator.clipboard.writeText)return navigator.clipboard.writeText(texto).then(function(){return true},function(){return fallback(texto)});
 return Promise.resolve(fallback(texto));
}
function fallback(texto){try{var t=document.createElement('textarea');t.value=texto;t.style.position='fixed';t.style.opacity='0';document.body.appendChild(t);t.select();var ok=document.execCommand('copy');t.remove();return ok}catch(e){return false}}
function abrirIA(ia,texto){
 var url=ia.web;
 /* O ChatGPT aceita a pergunta direto no endereço; se o texto for muito grande, abre só o site e a pessoa cola */
 if(ia.id==='chatgpt'&&texto.length<6000){url=ia.web+(ia.web.indexOf('?')>=0?'&':'?')+'q='+encodeURIComponent(texto)}
 window.open(url,'_blank','noopener');
}
var atual=null;
function mostrarEtapa(pergunta,detalhe){
 var box=document.getElementById('psEtapa');if(!box)return;
 var texto=montarPrompt(pergunta,detalhe);atual=texto;
 var semDados=!/Nome:\s*(?!Não informado)\S/.test(texto);
 box.hidden=false;
 box.innerHTML='<h3>❓ '+esc(pergunta)+'</h3>'+
  (semDados?'<div class="alert warn">💡 Seu perfil ainda está vazio. A IA vai responder melhor se você preencher o <b>Meu perfil</b> e registrar alimentação, sono e remédios.</div>':'')+
  '<div class="alert safe">🔒 Ao tocar numa IA, o <b>resumo dos seus registros</b> é copiado e enviado para ela junto com a pergunta. Só toque se estiver de acordo.</div>'+
  '<div class="ps-ias">'+iasAtivas().map(function(ia,i){return '<button type="button" class="btn" data-ps-ia="'+i+'">'+esc(ia.icone||'🤖')+' Perguntar ao '+esc(ia.nome)+'</button>'}).join('')+
  '<button type="button" class="btn secondary" id="psCopiar">📋 Só copiar a pergunta</button></div>'+
  '<p class="muted ps-dica">Se a pergunta não aparecer sozinha na IA, toque na caixa de mensagem e escolha <b>Colar</b>.</p>'+
  '<details class="ps-previa"><summary>👀 Ver o que será enviado</summary><pre>'+esc(texto)+'</pre></details>'+
  '<p class="ps-status" id="psStatus" role="status" aria-live="polite"></p>';
 box.scrollIntoView({behavior:'smooth',block:'start'});
}
function render(){
 if(document.getElementById(ID))return;
 var main=document.getElementById('main-content')||document.querySelector('main');if(!main)return;
 var sec=document.createElement('section');sec.id=ID;
 sec.innerHTML='<div class="card"><h2>❓ Perguntas sobre minha saúde</h2>'+
  '<p class="muted">Escolha uma pergunta. O app junta a pergunta com o <b>resumo dos seus registros</b> e leva para a sua IA (ChatGPT, Gemini…), que responde de um jeito simples.</p>'+
  '<div class="alert warn">⚠️ A resposta da IA é uma orientação geral para você se organizar. Ela <b>não é diagnóstico</b> e não substitui o médico, o nutricionista ou outro profissional.</div>'+
  PERGUNTAS.map(function(g){return '<h3 class="ps-grupo">'+esc(g.grupo)+'</h3><div class="ps-grade">'+g.itens.map(function(it){return '<button type="button" class="ps-pergunta" data-ps-p="'+esc(it[1])+'" data-ps-d="'+esc(it[2])+'"><span>'+it[0]+'</span><b>'+esc(it[1])+'</b></button>'}).join('')+'</div>'}).join('')+
  '<h3 class="ps-grupo">✍️ Minha própria pergunta</h3><div class="ps-livre"><textarea id="psLivre" rows="3" placeholder="Ex.: Posso comer ovo todo dia com o meu colesterol?"></textarea><button type="button" class="btn" id="psLivreBtn">Continuar →</button></div>'+
  '<div class="card ps-etapa" id="psEtapa" hidden></div></div>';
 var secoes=main.querySelectorAll(':scope > section');var ultima=secoes[secoes.length-1];
 if(ultima)ultima.insertAdjacentElement('afterend',sec);else main.appendChild(sec);
 sec.addEventListener('click',function(e){
  var p=e.target.closest('[data-ps-p]');if(p){mostrarEtapa(p.getAttribute('data-ps-p'),p.getAttribute('data-ps-d'));return}
  if(e.target.id==='psLivreBtn'){var q=(document.getElementById('psLivre').value||'').trim();if(!q){document.getElementById('psLivre').focus();return}mostrarEtapa(q,'Responda à minha pergunta usando meus registros de saúde.');return}
  var b=e.target.closest('[data-ps-ia]');
  if(b&&atual){var ia=iasAtivas()[Number(b.getAttribute('data-ps-ia'))];copiar(atual).then(function(){var st=document.getElementById('psStatus');if(st)st.textContent='✅ Pergunta copiada. Abrindo o '+ia.nome+'…'});abrirIA(ia,atual);return}
  if(e.target.id==='psCopiar'&&atual){copiar(atual).then(function(ok){var st=document.getElementById('psStatus');if(st)st.textContent=ok?'✅ Copiado! Agora cole na IA que preferir.':'Não consegui copiar sozinho. Abra “Ver o que será enviado” e copie manualmente.'})}
 });
 /* atalho no menu (grupo IA) */
 var menuIA=document.querySelector('.nav-toggle[data-menu="ai"]');var lista=menuIA&&menuIA.parentElement.querySelector('.nav-menu');
 if(lista&&!lista.querySelector('[data-tab="'+ID+'"]')){var bt=document.createElement('button');bt.type='button';bt.setAttribute('data-tab',ID);bt.textContent='💬 Perguntas sobre minha saúde';lista.insertBefore(bt,lista.firstChild);bt.addEventListener('click',function(){if(typeof go==='function')go(ID)})}
 /* atalho no Início */
 var home=document.getElementById('home');
 if(home&&!document.getElementById('psAtalhoHome')){var a=document.createElement('button');a.type='button';a.id='psAtalhoHome';a.className='ps-atalho-home';a.innerHTML='<span>💬</span><span><b>Pergunte à IA sobre sua saúde</b><small>Alimentos bons e ruins, hábitos que faltam, o que levar ao médico…</small></span><span class="ps-seta">→</span>';
  a.addEventListener('click',function(){if(typeof go==='function')go(ID)});var alvo=home.querySelector('.home-profile-actions')||home.firstElementChild;if(alvo&&alvo.parentNode)alvo.parentNode.insertBefore(a,alvo.nextSibling);else home.insertBefore(a,home.firstChild)}
}
var css=document.createElement('style');css.id='msa-perguntas-saude';
css.textContent='#'+ID+' .ps-grupo{margin:18px 0 8px;font-size:15px}'+
 '#'+ID+' .ps-grade{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:10px}'+
 '#'+ID+' .ps-pergunta{display:flex;align-items:center;gap:10px;text-align:left;padding:13px 14px;border-radius:14px;border:1px solid var(--line,#e5e7eb);background:var(--card,#fff);color:inherit;font:inherit;cursor:pointer;transition:transform .15s,border-color .15s}'+
 '#'+ID+' .ps-pergunta:hover,#'+ID+' .ps-pergunta:focus-visible{border-color:#2563eb;transform:translateY(-2px)}'+
 '#'+ID+' .ps-pergunta span{font-size:22px}#'+ID+' .ps-pergunta b{font-size:14px;line-height:1.35}'+
 '#'+ID+' .ps-livre{display:grid;gap:8px}#'+ID+' .ps-livre textarea{width:100%;box-sizing:border-box}'+
 '#'+ID+' .ps-etapa{margin-top:16px;border:2px solid #2563eb}#'+ID+' .ps-ias{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0}'+
 '#'+ID+' .ps-previa pre{white-space:pre-wrap;max-height:260px;overflow:auto;font-size:11px;background:#f8fafc;padding:10px;border-radius:10px}'+
 '#'+ID+' .ps-status{font-weight:800;color:#047857;min-height:18px}'+
 '.ps-atalho-home{display:flex;align-items:center;gap:12px;width:100%;margin:12px 0;padding:14px 16px;border-radius:16px;border:1px solid #bfdbfe;background:linear-gradient(135deg,#eff6ff,#f5f3ff);color:#172033;text-align:left;font:inherit;cursor:pointer}'+
 '.ps-atalho-home>span:first-child{font-size:26px}.ps-atalho-home b{display:block;font-size:15px}.ps-atalho-home small{display:block;color:#475569;font-size:12.5px}.ps-atalho-home .ps-seta{margin-left:auto;font-weight:900;color:#2563eb}'+
 'body.msa-dark #'+ID+' .ps-pergunta{background:#111827;border-color:#263244}body.msa-dark .ps-atalho-home{background:#111827;border-color:#263244;color:#e5e7eb}body.msa-dark .ps-atalho-home small{color:#94a3b8}body.msa-dark #'+ID+' .ps-previa pre{background:#0b1220;color:#e5e7eb}';
document.head.appendChild(css);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',render);else render();
})();
