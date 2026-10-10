/* Minha Saúde IA — constantes compartilhadas V5.99
 * Fonte única dos nomes de armazenamento.
 */
(function(){
'use strict';
const APP_VERSION='V6.04';
window.MSA_VERSION=APP_VERSION;
const K={
 ciclo:'msa2_ciclo_menstrual',d:'msa2_dores',c:'msa2_consultas',m:'msa2_meds',e:'msa2_exames',
 p:'msa2_perfil',v:'msa2_vitais',r:'msa2_lembretes',vax:'msa2_vacinas',fam:'msa2_familia',
 doc:'msa2_documentos',nutri:'msa2_nutri',suplReg:'msa2_suplementos',food:'msa2_reacoes_alimentares',
 agua:'msa2_hidratacao',sono:'msa2_sono',bem:'msa2_bemestar',gat:'msa2_gatilhos',
 medRot:'msa2_medicamentos_rotina',medTaken:'msa2_medicamentos_tomados',anticoncepcional:'msa2_anticoncepcional',medidas:'msa2_medidas_corporais',preferencias:'msa2_preferencias',familiares:'msa2_familiares'
};
window.MSA_K=K;
window.K=window.K||K;
})();