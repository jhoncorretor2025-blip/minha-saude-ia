/* Minha Saúde IA — salvamento robusto do perfil V5.77 */
(function(){
'use strict';

function el(id){return document.getElementById(id)}
function val(id){const x=el(id);return x ? (x.value||'') : ''}

function sincronizarConjugePerfil(perfil,old,storage,K){
 const key=K.familiares||'msa2_familiares',raw=storage.get(key),lista=Array.isArray(raw)?raw.slice():[];
 const anterior=String(old&&old.conjugeFamiliarId||''),novo=String(perfil&&perfil.conjugeFamiliarId||'');
 if(novo&&!lista.some(x=>String(x&&x.id||'')===novo)){alert('A pessoa selecionada não foi encontrada na lista de familiares. Atualize o perfil e tente novamente.');return false}
 if(anterior===novo)return true;
 const parceiro=novo?lista.find(x=>String(x.id)===novo):null;
 if(parceiro&&parceiro.conjugeId&&String(parceiro.conjugeId)!=='__perfil_principal__'&&String(parceiro.conjugeId)!==anterior){
  const vinculado=lista.find(x=>String(x.id)===String(parceiro.conjugeId));
  const nome=vinculado?(vinculado.nome||'outra pessoa'):'outro cadastro';
  if(!confirm((parceiro.nome||'A pessoa selecionada')+' já está vinculada a '+nome+'. Deseja substituir o vínculo?'))return false;
  if(vinculado&&String(vinculado.conjugeId||'')===String(parceiro.id))delete vinculado.conjugeId;
 }
 if(anterior){const antiga=lista.find(x=>String(x.id)===anterior);if(antiga&&String(antiga.conjugeId||'')==='__perfil_principal__')delete antiga.conjugeId}
 if(parceiro)parceiro.conjugeId='__perfil_principal__';
 if(!storage.set(key,lista)){alert('Não foi possível atualizar o vínculo familiar. Nenhuma alteração no relacionamento foi concluída.');return false}
 try{if(window.MSAProfileBridge)window.MSAProfileBridge.publishFamilies(lista)}catch(e){}
 try{window.dispatchEvent(new CustomEvent('msa:familiares-atualizados'))}catch(e){}
 return true;
}

function salvarPerfilRobusto(e){
  if(e)e.preventDefault();

  const form=el('pForm');
  if(!form)return false;

  const sexo=val('pSexo');
  if(!sexo){
    alert('👤 Selecione Masculino, Feminino ou Outro para continuar.');
    const campo=el('pSexo'); if(campo)campo.focus();
    return false;
  }

  try{
    const K=window.MSA_K||window.K;
    const storage=window.MSAStorage;
    if(!K||!storage)throw new Error('Armazenamento da aplicação não foi inicializado.');

    const antigo=storage.get(K.p);
    const old=Array.isArray(antigo)&&antigo[0] ? antigo[0] : {};

    const perfil=Object.assign({},old,{
      nome:val('pNome'),nasc:val('pNasc'),idade:val('pIdade'),peso:val('pPeso'),sexo:sexo,conjugeFamiliarId:val('pConjugeFamiliarId'),
      sangue:val('pSangue'),altura:val('pAltura'),supl:val('pSupl'),alerg:val('pAlerg'),cond:val('pCond'),
      circ:val('pCirc'),info:val('pInfo'),emerg:val('pEmerg'),tel:val('pTel'),
      menstruacao:val('pMenstruacao'),ciclo:val('pCiclo'),duracaoMenstr:val('pDuracaoMenstr'),regularidade:val('pRegularidade'),
      sexoFreqMin:val('pSexoFreqMin'),sexoFreqMax:val('pSexoFreqMax'),masturbacaoDia:val('pMasturbacaoDia'),
      camisinha:val('pCamisinha'),engravidou:val('pEngravidou'),mae:val('pMae'),gestacoes:val('pGestacoes'),
      reproObs:val('pReproObs'),usaAnticoncepcional:val('pUsaAnticoncepcional'),anticoncepcionalMetodo:val('pAnticoncepcionalMetodo'),
      anticoncepcionalNome:val('pAnticoncepcionalNome'),anticoncepcionalHora:val('pAnticoncepcionalHora'),
      anticoncepcionalInicio:val('pAnticoncepcionalInicio'),anticoncepcionalRegime:val('pAnticoncepcionalRegime'),
      minipilulaTipo:val('pMinipilulaTipo'),prevColo:val('pPrevColo'),mamografia:val('pMamografia'),ist:val('pIST'),hpv:val('pHPV'),
      prevProx:val('pPrevProx'),prevObs:val('pPrevObs'),dorcelaxFreq:val('pDorcelaxFreq'),
      paracetamolFreq:val('pParacetamolFreq'),outrosDor:val('pOutrosDor'),catapora:val('pCatapora'),cataporaQuando:val('pCataporaQuando'),
      academia:val('pAcademia'),academiaFreq:val('pAcademiaFreq'),trabalhoTipo:val('pTrabalhoTipo'),
      horasSentado:val('pHorasSentado'),horasPe:val('pHorasPe'),aguaDia:val('pAguaDia'),urinaDia:val('pUrinaDia'),
      evacuacaoDia:val('pEvacuacaoDia'),calorSuor:val('pCalorSuor'),
      fuma:val('pFuma'),fumaObs:val('pFumaObs'),alcool:val('pAlcool'),alcoolObs:val('pAlcoolObs')
    });

    const ok=storage.set(K.p,[perfil]);
    if(!ok)throw new Error('O navegador recusou a gravação.');
    if(!sincronizarConjugePerfil(perfil,old,storage,K)){
      storage.set(K.p,antigo);
      return false;
    }

    try{const idAtivo=storage.raw('msa2_familiar_selecionado');const pessoaAtiva=idAtivo?JSON.parse(idAtivo):'';if(!pessoaAtiva&&window.MSAProfileBridge)window.MSAProfileBridge.publishProfile({nome:perfil.nome,idade:perfil.idade,nascimento:perfil.nasc,pesoKg:perfil.peso,alturaCm:perfil.altura,sexo:perfil.sexo})}catch(syncErr){console.warn('[Minha Saúde IA] sincronização do perfil central:',syncErr)}

    const depois=storage.get(K.p);
    const confirmado=Array.isArray(depois)&&depois[0];
    if(!confirmado)throw new Error('A gravação não pôde ser confirmada.');

    // Confirma um conjunto de campos que o usuário acabou de editar.
    const checks=['nome','nasc','idade','peso','sexo','sangue','altura','supl','alerg','cond','info','emerg','tel','academia','aguaDia','urinaDia'];
    const falhas=checks.filter(k=>String(confirmado[k]??'')!==String(perfil[k]??''));
    if(falhas.length)throw new Error('A confirmação falhou em: '+falhas.join(', '));

    try{if(typeof window.render==='function')window.render()}catch(err){console.warn('[Minha Saúde IA] render após perfil:',err)}
    try{if(typeof window.renderCarteirinha==='function')window.renderCarteirinha()}catch(err){console.warn('[Minha Saúde IA] carteirinha:',err)}
    try{if(typeof window.renderNovosModulos==='function')window.renderNovosModulos()}catch(err){console.warn('[Minha Saúde IA] módulos:',err)}

    const btn=form.querySelector('button[type="submit"],button:not([type])');
    if(btn){btn.disabled=true;btn.textContent='✅ Salvo!'}

    if(typeof window.msaToast==='function')window.msaToast('✅ Dados salvos com sucesso!');
    else alert('✅ Dados salvos com sucesso!');

    setTimeout(function(){
      if(btn){btn.disabled=false;btn.textContent='💾 Salvar perfil'}
      if(typeof window.go==='function')window.go('home');
      window.scrollTo({top:0,behavior:'smooth'});
    },900);

  }catch(err){
    console.error('[Minha Saúde IA] salvamento do perfil:',err);
    alert('⚠️ Não foi possível salvar o perfil.\n\nDetalhe: '+(err&&err.message?err.message:'erro desconhecido'));
    const btn=form.querySelector('button[type="submit"],button:not([type])');
    if(btn){btn.disabled=false;btn.textContent='💾 Salvar perfil'}
  }
  return false;
}

function instalar(){
  const form=el('pForm');
  if(!form)return;
  form.onsubmit=salvarPerfilRobusto;
  form.dataset.profileSave='robusto-v542';
  console.log('[Minha Saúde IA] salvamento robusto do perfil ativo.');
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',instalar,{once:true});
else instalar();
window.msaSalvarPerfilRobusto=salvarPerfilRobusto;
})();