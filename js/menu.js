/* Minha Saúde IA — menus independentes V4.55
   O menu não depende do restante do aplicativo para abrir e navegar.
*/
(function(){
  /* V5.69 — organização por objetivo: registrar, acompanhar, organizar e proteger */
  function reorganizarMenuV569(){
    var nav=document.getElementById('nav');
    if(!nav || nav.getAttribute('data-menu-v569')==='1')return;
    var tools=nav.querySelector('.msa-desktop-nav-tools');
    nav.innerHTML=
      '<div class="nav-group"><button type="button" class="nav-toggle" data-menu="overview">🏠 Início ▾</button><div class="nav-menu">'+
        '<button type="button" data-tab="home">🏠 Visão geral</button>'+
        '<button type="button" data-tab="timeline">🕐 Linha do tempo</button>'+
        '<button type="button" data-tab="perfil">👤 Meu perfil</button>'+
      '</div></div>'+
      '<div class="nav-group"><button type="button" class="nav-toggle" data-menu="register">➕ Registrar ▾</button><div class="nav-menu">'+
        '<button type="button" data-tab="dor">😣 Sintoma ou dor</button>'+
        '<button type="button" data-tab="meds">💊 Medicamento</button>'+
        '<button type="button" data-tab="consultas">👨‍⚕️ Consulta</button>'+
        '<button type="button" data-tab="exames">🧪 Exame</button>'+
        '<button type="button" data-tab="acompanhamento">❤️ Sinal vital</button>'+
        '<button type="button" data-tab="acompanhamento" data-feature-nav="academia">📏 Medidas corporais</button>'+
        '<button type="button" data-tab="nutricao" data-feature-nav="nutricao">🥗 Nutrição</button>'+
      '</div></div>'+
      '<div class="nav-group"><button type="button" class="nav-toggle" data-menu="followup">📊 Acompanhar ▾</button><div class="nav-menu">'+
        '<button type="button" data-tab="timeline">🕐 Linha do tempo</button>'+
        '<button type="button" data-tab="sono" data-feature-nav="sonoBem">😴 Sono e bem-estar</button>'+
        '<button type="button" data-tab="familia">🧬 Histórico familiar</button>'+
        '<button type="button" data-tab="avisos">🔔 Atenção e avisos</button>'+
        '<button type="button" data-tab="calendario">📅 Calendário</button>'+
        '<button type="button" data-tab="lembretes">⏰ Lembretes</button>'+
      '</div></div>'+
      '<div class="nav-group"><button type="button" class="nav-toggle" data-menu="organization">📁 Organizar ▾</button><div class="nav-menu">'+
        '<button type="button" data-tab="documentos">📄 Documentos</button>'+
        '<button type="button" data-tab="relatorios">📊 Relatórios</button>'+
        '<button type="button" data-tab="carteirinha">🪪 Carteirinha</button>'+
      '</div></div>'+
      '<div class="nav-group"><button type="button" class="nav-toggle" data-menu="ai">🤖 IA ▾</button><div class="nav-menu">'+
        '<button type="button" data-tab="ia">🤖 Assistente</button>'+
        '<button type="button" data-tab="importar">⚡ Importar com IA</button>'+
        '<button type="button" data-tab="perguntas">❓ Preparar consulta</button>'+
      '</div></div>'+
      '<div class="nav-group"><button type="button" class="nav-toggle" data-menu="security">🔐 Segurança ▾</button><div class="nav-menu">'+
        '<button type="button" data-tab="exportar">📤 Exportar e compartilhar</button>'+
        '<button type="button" data-tab="backup">💾 Backup e restauração</button>'+
        '<button type="button" data-tab="configuracoes">⚙️ Configurações</button>'+
      '</div></div>';
    if(tools)nav.appendChild(tools);
    nav.setAttribute('data-menu-v569','1');
  }

  function fechar(){
    document.querySelectorAll('#nav .nav-group').forEach(function(g){g.classList.remove('open')});
    document.querySelectorAll('#nav .nav-toggle').forEach(function(b){
      b.classList.remove('open');
      b.setAttribute('aria-expanded','false');
    });
  }

  function mostrarSecao(id){
    var secoes=document.querySelectorAll('section');
    var alvo=document.getElementById(id);
    if(!alvo)return false;

    secoes.forEach(function(s){s.classList.toggle('active',s.id===id)});
    document.querySelectorAll('#nav button[data-tab]').forEach(function(b){
      b.classList.toggle('active',b.getAttribute('data-tab')===id);
    });
    return true;
  }

  function navegar(id){
    fechar();
    try{
      if(typeof window.go==='function'){
        window.go(id);
        return;
      }
    }catch(e){
      console.error('[Minha Saúde IA] navegação principal falhou:',e);
    }
    mostrarSecao(id);
  }

  function iniciar(){
    var nav=document.getElementById('nav');
    if(!nav)return;
    reorganizarMenuV569();

    nav.addEventListener('click',function(ev){
      var toggle=ev.target.closest ? ev.target.closest('.nav-toggle') : null;
      if(toggle && nav.contains(toggle)){
        ev.preventDefault();
        ev.stopPropagation();
        var group=toggle.closest('.nav-group');
        if(!group)return;
        var abrir=!group.classList.contains('open');
        fechar();
        if(abrir){
          group.classList.add('open');
          toggle.classList.add('open');
          toggle.setAttribute('aria-expanded','true');
        }
        return;
      }

      var item=ev.target.closest ? ev.target.closest('button[data-tab]') : null;
      if(item && nav.contains(item)){
        ev.preventDefault();
        ev.stopPropagation();
        navegar(item.getAttribute('data-tab'));
      }
    });

    document.addEventListener('click',function(ev){
      if(!nav.contains(ev.target))fechar();
    });

    document.addEventListener('keydown',function(ev){
      if(ev.key==='Escape')fechar();
    });

    window.fecharMenus=fechar;
    window.__msaMenuReady=true;
    try{if(typeof window.aplicarPreferencias==='function')window.aplicarPreferencias()}catch(e){}
    prepararAcessibilidade();
    criarNavegacaoMobile();
    criarProximoPassoHome();
    melhorarAcoesRapidas();

  }

  function prepararAcessibilidade(){
    navA11y();
  }

  function navA11y(){
    document.querySelectorAll('#nav .nav-toggle').forEach(function(b){
      b.setAttribute('aria-haspopup','true');
      b.setAttribute('aria-expanded','false');
    });
  }

  function criarNavegacaoMobile(){
    if(document.getElementById('msaMobileBar'))return;

    var backdrop=document.createElement('div');
    backdrop.id='msaMobileBackdrop';
    backdrop.className='msa-mobile-backdrop';
    backdrop.setAttribute('aria-hidden','true');

    var drawer=document.createElement('aside');
    drawer.id='msaMobileDrawer';
    drawer.className='msa-mobile-drawer';
    drawer.setAttribute('aria-hidden','true');
    drawer.setAttribute('aria-label','Menu principal');

    drawer.innerHTML=
      '<div class="msa-mobile-drawer-head">'+
        '<div><h2>🩺 Minha Saúde IA</h2><div class="muted">Escolha pelo que você quer fazer</div></div>'+
        '<button class="msa-mobile-drawer-close" type="button" aria-label="Fechar menu">✕</button>'+
      '</div>'+
      '<div class="msa-mobile-drawer-body">'+
        '<div class="msa-mobile-quick">'+
          '<button type="button" data-mobile-tab="dor">😣<span>Registrar sintoma</span></button>'+
          '<button type="button" data-mobile-tab="meds">💊<span>Medicamento</span></button>'+
          '<button type="button" data-mobile-tab="consultas">👨‍⚕️<span>Consulta</span></button>'+
          '<button type="button" data-mobile-tab="exames">🧪<span>Exame</span></button>'+
          '<button type="button" data-mobile-tab="acompanhamento">❤️<span>Sinal vital</span></button>'+
          '<button type="button" data-mobile-tab="acompanhamento" data-feature-nav="academia">📏<span>Medidas</span></button>'+
        '</div>'+
        mobileSection('Principal',[['home','🏠 Início'],['timeline','🕐 Linha do tempo'],['perfil','👤 Meu perfil']])+ 
        mobileSection('Registrar',[
          ['dor','😣 Sintoma ou dor'],['meds','💊 Medicamentos'],['consultas','👨‍⚕️ Consultas'],
          ['exames','🧪 Exames'],['acompanhamento','❤️ Sinais vitais'],['acompanhamento','📏 Medidas corporais','academia'],
          ['nutricao','🥗 Nutrição','nutricao']
        ])+
        mobileSection('Acompanhar',[
          ['sono','😴 Sono e bem-estar','sonoBem'],['familia','🧬 Histórico familiar'],['avisos','🔔 Atenção e avisos'],
          ['calendario','📅 Calendário'],['lembretes','⏰ Lembretes']
        ])+
        mobileSection('Organizar',[
          ['documentos','📄 Documentos'],['relatorios','📊 Relatórios'],['carteirinha','🪪 Carteirinha']
        ])+
        mobileSection('IA',[
          ['ia','🤖 Assistente'],['importar','⚡ Importar com IA'],['perguntas','❓ Preparar consulta']
        ])+
        mobileSection('Dados e segurança',[
          ['exportar','📤 Exportar e compartilhar'],['backup','💾 Backup e restauração'],['configuracoes','⚙️ Configurações']
        ])+
        '<div class="msa-mobile-section"><div class="msa-mobile-section-title">Ação especial</div>'+ 
          '<div class="msa-mobile-links"><button type="button" class="danger" data-mobile-emergency="1">🚨 Modo emergência</button>'+ 
          '<button type="button" data-mobile-tab="perfil" data-mobile-ciclo="1" data-feature-nav="ciclo">🌸 Ciclo menstrual</button></div></div>'+ 
      '</div>';

    var bar=document.createElement('nav');
    bar.id='msaMobileBar';
    bar.className='msa-mobile-bar';
    bar.setAttribute('aria-label','Navegação rápida');
    bar.innerHTML=
      '<button type="button" data-mobile-action="home"><strong>🏠</strong>Início</button>'+
      '<button type="button" data-mobile-action="register"><strong>➕</strong>Registrar</button>'+
      '<button type="button" data-mobile-action="search"><strong>🔎</strong>Buscar</button>'+
      '<button type="button" data-mobile-action="menu"><strong>☰</strong>Menu</button>';

    document.body.appendChild(backdrop);
    document.body.appendChild(drawer);
    document.body.appendChild(bar);

    function mobileSection(title,items){
      return '<div class="msa-mobile-section"><div class="msa-mobile-section-title">'+title+'</div><div class="msa-mobile-links">'+
        items.map(function(x){
          var f=x[2]||((x[0]==='nutricao')?'nutricao':(x[0]==='sono')?'sonoBem':null);
          return '<button type="button" data-mobile-tab="'+x[0]+'"'+(f?' data-feature-nav="'+f+'"':'')+'>'+x[1]+'</button>';
        }).join('')+'</div></div>';
    }

    function closeDrawer(){
      drawer.setAttribute('aria-hidden','true');
      backdrop.setAttribute('aria-hidden','true');
      document.body.classList.remove('msa-mobile-menu-open');
    }
    function openDrawer(){
      drawer.setAttribute('aria-hidden','false');
      backdrop.setAttribute('aria-hidden','false');
      document.body.classList.add('msa-mobile-menu-open');
      var close=drawer.querySelector('.msa-mobile-drawer-close');
      if(close)close.focus();
    }
    function focusSearch(){
      navegar('buscar');
      setTimeout(function(){
        var input=document.getElementById('globalSearchInput');
        if(input){input.focus();input.scrollIntoView({behavior:'smooth',block:'center'});}
      },100);
    }
    function doMobileTab(id){
      closeDrawer();
      navegar(id);
      setTimeout(function(){window.scrollTo({top:0,behavior:'smooth'});},30);
    }

    bar.addEventListener('click',function(ev){
      var b=ev.target.closest ? ev.target.closest('button') : null;
      if(!b)return;
      var action=b.getAttribute('data-mobile-action');
      if(action==='home')doMobileTab('home');
      else if(action==='register')openDrawer();
      else if(action==='search')focusSearch();
      else if(action==='menu')openDrawer();
    });

    drawer.addEventListener('click',function(ev){
      var tab=ev.target.closest ? ev.target.closest('[data-mobile-tab]') : null;
      if(tab){
        ev.preventDefault();
        var id=tab.getAttribute('data-mobile-tab');
        doMobileTab(id);
        if(tab.hasAttribute('data-mobile-ciclo')){
          setTimeout(function(){var f=document.getElementById('cicloForm');if(f)f.scrollIntoView({behavior:'smooth',block:'start'});},140);
        }
        return;
      }
      var emergency=ev.target.closest ? ev.target.closest('[data-mobile-emergency]') : null;
      if(emergency){
        closeDrawer();
        if(typeof window.abrirModoEmergencia==='function')window.abrirModoEmergencia();
      }
      if(ev.target.closest('.msa-mobile-drawer-close'))closeDrawer();
    });
    backdrop.addEventListener('click',closeDrawer);
    document.addEventListener('keydown',function(ev){if(ev.key==='Escape')closeDrawer();});
  }


  function criarProximoPassoHome(){
    var home=document.getElementById('home');
    if(!home || document.getElementById('msaNextStepCard'))return;

    var card=document.createElement('div');
    card.id='msaNextStepCard';
    card.className='msa-next-step-card';
    card.setAttribute('aria-live','polite');

    function ler(key){
      try{
        var storage=window.MSAStorage;
        var v=storage&&typeof storage.get==='function'?storage.get(key):localStorage.getItem(key);
        if(typeof v==='string')v=JSON.parse(v);
        return v;
      }catch(e){return null}
    }
    function lista(key){
      var v=ler(key);
      return Array.isArray(v)?v:[];
    }
    function perfil(){
      var v=ler('msa2_perfil');
      return Array.isArray(v)?(v[0]||{}):(v||{});
    }
    function atualizar(){
      var p=perfil();
      var nome=String(p.nome||'').trim();
      var sexo=String(p.sexo||'').trim();
      var altura=String(p.altura||'').trim();
      var peso=String(p.peso||'').trim();
      var draft=ler('msa2_importacao_rascunho_v514');
      var total=lista('msa2_dores').length+lista('msa2_consultas').length+
        lista('msa2_meds').length+lista('msa2_exames').length+lista('msa2_vitais').length;

      var title='🎯 Seu próximo passo';
      var text='Vamos deixar seu histórico mais completo.';
      var primary='Começar agora';
      var primaryId='perfil';
      var secondary='Registrar um sintoma';
      var secondaryId='dor';

      if(draft && typeof draft==='object' && Object.keys(draft).length){
        title='↩️ Você tem uma importação em andamento';
        text='Seu rascunho foi preservado. Continue de onde parou, sem perder o que já preparou.';
        primary='Continuar importação';
        primaryId='importar';
        secondary='Preencher manualmente';
        secondaryId='perfil';
      }else if(!nome || !sexo || !altura || !peso){
        title='👤 Complete seu perfil primeiro';
        text='Com nome, sexo, altura e peso preenchidos, o painel consegue mostrar mais informações úteis.';
        primary='Completar perfil';
        primaryId='perfil';
        secondary='Importar histórico';
        secondaryId='importar';
      }else if(total===0){
        title='🚀 Agora vamos registrar seu histórico';
        text='Você já tem o perfil. O próximo passo é trazer seu histórico com IA ou fazer o primeiro registro.';
        primary='Importar histórico';
        primaryId='importar';
        secondary='Registrar primeiro dado';
        secondaryId='dor';
      }else{
        title='✅ Seu histórico já está em andamento';
        text=total+' registro'+(total===1?'':'s')+' principal'+(total===1?'':'is')+' encontrado'+(total===1?'':'s')+'. Continue acompanhando ou registre algo novo.';
        primary='➕ Registrar agora';
        primaryId='dor';
        secondary='Ver meu histórico';
        secondaryId='timeline';
      }

      card.innerHTML=
        '<div class="msa-next-step-icon">✨</div>'+
        '<div class="msa-next-step-copy"><div class="msa-next-step-kicker">PRÓXIMO PASSO</div>'+
        '<h2>'+title+'</h2><p>'+text+'</p></div>'+
        '<div class="msa-next-step-actions">'+
        '<button type="button" class="btn green" data-next-primary>'+primary+'</button>'+
        '<button type="button" class="btn secondary" data-next-secondary>'+secondary+'</button></div>';

      var bp=card.querySelector('[data-next-primary]');
      var bs=card.querySelector('[data-next-secondary]');
      if(bp)bp.onclick=function(){navegar(primaryId)};
      if(bs)bs.onclick=function(){navegar(secondaryId)};
    }

    var anchor=document.getElementById('homeCommandCenter');
    if(anchor && anchor.parentNode)anchor.parentNode.insertBefore(card,anchor.nextSibling);
    else home.insertBefore(card,home.firstChild);

    atualizar();
    window.msaAtualizarProximoPasso=atualizar;
    document.addEventListener('msa:data-changed',atualizar);
  }

  function melhorarAcoesRapidas(){
    var fab=document.getElementById('msaFabMenu');
    if(fab && !fab.querySelector('[data-v568-extra]')){
      var extra=document.createElement('button');
      extra.className='msa-fab-action';
      extra.type='button';
      extra.setAttribute('data-v568-extra','1');
      extra.textContent='📏 Registrar medida corporal';
      extra.onclick=function(){if(typeof window.toggleMsaFab==='function')window.toggleMsaFab();navegar('acompanhamento')};
      fab.appendChild(extra);

      var extra2=document.createElement('button');
      extra2.className='msa-fab-action';
      extra2.type='button';
      extra2.setAttribute('data-v568-extra','1');
      extra2.textContent='🥗 Registrar alimentação';
      extra2.onclick=function(){if(typeof window.toggleMsaFab==='function')window.toggleMsaFab();navegar('nutricao')};
      fab.appendChild(extra2);
    }

    document.addEventListener('click',function(ev){
      var form=ev.target.closest?ev.target.closest('form'):null;
      if(form && typeof window.msaAtualizarProximoPasso==='function'){
        setTimeout(function(){
          window.msaAtualizarProximoPasso();
          document.dispatchEvent(new Event('msa:data-changed'));
        },700);
      }
    },true);
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',iniciar);
  }else{
    iniciar();
  }
})();
/* V5.69 — fallback handlers preservados */
(function(){
  function lista(k){try{var s=window.MSAStorage||{};var v=s.get?s.get(k):[];return Array.isArray(v)?v:[]}catch(e){return[]}}
  function perfil(){var a=lista('msa2_perfil');return a[0]||{}}
  window.exportarJSONCompleto=window.exportarJSONCompleto||function(){
    try{
      var keys=['msa2_perfil','msa2_dores','msa2_consultas','msa2_meds','msa2_exames','msa2_vitais','msa2_vacinas','msa2_familia','msa2_documentos','msa2_lembretes','msa2_nutri','msa2_sono','msa2_medidas'];
      var dados={};keys.forEach(function(k){dados[k]=lista(k)});
      var blob=new Blob([JSON.stringify(dados,null,2)],{type:'application/json;charset=utf-8'});
      var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='minha-saude-ia-backup.json';a.click();setTimeout(function(){URL.revokeObjectURL(a.href)},1000);
    }catch(e){alert('⚠️ Não foi possível gerar o backup JSON.');console.error(e)}
  };
  window.adicionarDocumentoSaude=window.adicionarDocumentoSaude||function(){var x=document.getElementById('novoDocumentoArquivo');if(x)x.click();else alert('⚠️ Área de documentos não encontrada.')};
  window.fecharModoEmergencia=window.fecharModoEmergencia||function(){var x=document.getElementById('emergencyOverlay');if(x)x.style.display='none'};
  window.imprimirModoEmergencia=window.imprimirModoEmergencia||function(){
    var x=document.getElementById('emergencyOverlay');if(!x)return;var p=x.querySelector('.emergency-card');if(!p)return;
    var w=window.open('','_blank','width=760,height=900');if(!w){alert('⚠️ Permita pop-ups para imprimir o resumo.');return}
    w.document.write('<!doctype html><html><head><title>Resumo de emergência</title><style>body{font-family:Arial;padding:28px;color:#172033}.emergency-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}.wide{grid-column:1/-1}.emergency-actions{display:none}</style></head><body>'+p.innerHTML+'</body></html>');w.document.close();w.focus();setTimeout(function(){w.print()},250);
  };
  window.exportarResumoEmergencia=window.exportarResumoEmergencia||function(){
    var p=perfil(),m=lista('msa2_meds');
    var t=['RESUMO DE EMERGÊNCIA','Nome: '+(p.nome||'Não informado'),'Tipo sanguíneo: '+(p.sangue||'Não informado'),'Alergias: '+(p.alerg||'Não informado'),'Condições: '+(p.cond||'Não informado'),'Medicamentos: '+(m.length?m.map(function(x){return x.nome||x.medicamento||'Medicamento'}).join(', '):'Não informado'),'Contato: '+(p.emerg||'Não informado'),'Telefone: '+(p.tel||'Não informado')].join('\n');
    var b=new Blob([t],{type:'text/plain;charset=utf-8'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='resumo-emergencia.txt';a.click();setTimeout(function(){URL.revokeObjectURL(a.href)},1000);
  };
})();

(function msaV569VersionSync(){
  function sync(){
    try{
      document.title=document.title.replace(/V5\.67/g,'V5.69');
      document.querySelectorAll('body *').forEach(function(el){
        if(el.children.length===0 && el.textContent.indexOf('V5.67')>=0)el.textContent=el.textContent.replace(/V5\.67/g,'V5.69');
      });
    }catch(e){}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',sync,{once:true});else sync();
})();
