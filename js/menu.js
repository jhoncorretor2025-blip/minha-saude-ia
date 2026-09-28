/* Minha Saúde IA — menus independentes V4.55
   O menu não depende do restante do aplicativo para abrir e navegar.
*/
(function(){
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
        '<div><h2>🩺 Minha Saúde IA</h2><div class="muted">Tudo organizado por objetivo</div></div>'+
        '<button class="msa-mobile-drawer-close" type="button" aria-label="Fechar menu">✕</button>'+
      '</div>'+
      '<div class="msa-mobile-drawer-body">'+
        '<div class="msa-mobile-quick">'+
          '<button type="button" data-mobile-tab="dor">😣<span>Registrar sintoma</span></button>'+
          '<button type="button" data-mobile-tab="meds">💊<span>Medicamento</span></button>'+
          '<button type="button" data-mobile-tab="consultas">👨‍⚕️<span>Consulta</span></button>'+
          '<button type="button" data-mobile-tab="exames">🧪<span>Exame</span></button>'+
          '<button type="button" data-mobile-tab="acompanhamento">❤️<span>Sinal vital</span></button>'+
          '<button type="button" data-mobile-tab="acompanhamento">📏<span>Medidas</span></button>'+
          '<button type="button" data-mobile-tab="nutricao">🥗<span>Alimentação</span></button>'+
          '<button type="button" data-mobile-tab="sono">😴<span>Sono</span></button>'+
          '<button type="button" data-mobile-tab="buscar">🔎<span>Buscar</span></button>'+
        '</div>'+
        mobileSection('Principal',[['home','🏠 Início'],['timeline','🕐 Linha do tempo']])+
        mobileSection('Minha saúde',[
          ['dor','😣 Sintomas'],['meds','💊 Medicamentos'],['consultas','👨‍⚕️ Consultas'],
          ['exames','🧪 Exames'],['acompanhamento','❤️ Sinais vitais'],['perfil','👤 Meu perfil']
        ])+
        mobileSection('Acompanhamento',[
          ['acompanhamento','📏 Medidas corporais'],['nutricao','🥗 Nutrição'],
          ['sono','😴 Sono e bem-estar'],['familia','🧬 Histórico familiar'],['avisos','🔔 Atenção e avisos']
        ])+
        mobileSection('Organização',[
          ['calendario','📅 Calendário'],['lembretes','⏰ Lembretes'],
          ['documentos','📄 Documentos'],['relatorios','📊 Relatórios']
        ])+
        mobileSection('IA',[
          ['ia','🤖 Assistente'],['importar','⚡ Importar com IA'],['perguntas','❓ Preparar consulta']
        ])+
        mobileSection('Dados e segurança',[
          ['carteirinha','🪪 Carteirinha'],['exportar','📤 Exportar'],
          ['backup','💾 Backup e segurança'],['configuracoes','⚙️ Configurações']
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
          var f=x[0]==='nutricao'?'nutricao':x[0]==='sono'?'sonoBem':x[0]==='acompanhamento'?'academia':null;
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