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
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',iniciar);
  }else{
    iniciar();
  }
})();