// Render harness for competitor-intelligence app (stubs DOM, loads all modules).
const fs = require('fs'), vm = require('vm');
const store = {}, listeners = {};
function elStub(){return{_h:'',_t:'',dataset:{},style:{},classList:{add(){},remove(){},toggle(){},contains(){return false}},set innerHTML(v){this._h=v},get innerHTML(){return this._h},set textContent(v){this._t=v},get textContent(){return this._t},addEventListener(){},appendChild(){},removeChild(){},remove(){},querySelector(){return elStub()},querySelectorAll(){return[]},getContext(){return{}},value:'',parentElement:null,click(){}};}
const document={documentElement:{getAttribute(){return'dark'},setAttribute(){}},getElementById(){return elStub()},querySelector(){return elStub()},querySelectorAll(){return[]},createElement(){return elStub()},addEventListener(e,f){listeners[e]=f},body:elStub()};
const W={localStorage:{getItem:k=>store[k]||null,setItem:(k,v)=>store[k]=v},addEventListener(){},innerWidth:1200,scrollTo(){},location:{hash:''},history:{replaceState(){}},confirm:()=>true};
W.window=W;W.document=document;W.console=console;W.setTimeout=()=>0;W.clearTimeout=()=>{};W.Blob=function(){};W.URL={createObjectURL:()=>'',revokeObjectURL(){}};W.Chart=undefined;W.mermaid=undefined;
const sb=W; sb.globalThis=sb; vm.createContext(sb);
['competitors.js','app.js','financial-analysis.js','comparison.js','charts.js','seed.js'].forEach(f=>vm.runInContext(fs.readFileSync('assets/js/'+f,'utf8'),sb,{filename:f}));
if(listeners['DOMContentLoaded'])listeners['DOMContentLoaded']();
let ok=true;
try{
  if(!sb.COMPETITORS||sb.COMPETITORS.length<50){ok=false;console.log('FAIL: <50 competitors ('+(sb.COMPETITORS||[]).length+')');}
  else console.log('ok: '+sb.COMPETITORS.length+' competitors loaded');
  // exercise render paths
  sb.RI.renderDatabase&&sb.RI.renderDatabase();
  sb.RI.renderProfiles&&sb.RI.renderProfiles();
  sb.RI.renderScorecard&&sb.RI.renderScorecard();
  sb.RI.renderFin&&sb.RI.renderFin();
  sb.RI.comparison&&sb.RI.comparison.render&&sb.RI.comparison.render();
  sb.RI.finCalc&&sb.RI.finCalc.render&&sb.RI.finCalc.render();
  sb.RI.charts&&sb.RI.charts.renderAll&&sb.RI.charts.renderAll();
  sb.RI.seed&&sb.RI.seed.render&&sb.RI.seed.render();
  sb.RI.exportCsv&&sb.RI.exportCsv();
  console.log('ok: all render paths executed without throwing');
}catch(e){ok=false;console.log("FAIL render: "+e.stack);}
console.log(ok?'RESULT: PASS':'RESULT: FAIL');
process.exit(ok?0:1);