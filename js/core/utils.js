/* Minha Saúde IA — utilidades compartilhadas V4.85 */
(function(){
'use strict';
function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function formatDateBR(v){if(!v)return 'Data não informada';const s=String(v),m=s.match(/^(\d{4})-(\d{2})-(\d{2})/);return m?m[3]+'/'+m[2]+'/'+m[1]:s}
function hojeLocal(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function diasEntre(a,b){const x=new Date(String(a).slice(0,10)+'T12:00:00'),y=new Date(String(b).slice(0,10)+'T12:00:00');if(isNaN(x)||isNaN(y))return null;return Math.round((y-x)/86400000)}
function adicionarDiasData(data,dias){const d=new Date(String(data).slice(0,10)+'T12:00:00');if(isNaN(d))return '';d.setDate(d.getDate()+Number(dias||0));return d.toISOString().slice(0,10)}
window.MSAUtils={esc,formatDateBR,hojeLocal,diasEntre,adicionarDiasData};
})();