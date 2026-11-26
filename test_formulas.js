// Test harness: stub browser globals, load app+calculators, validate formulas.
const fs = require('fs');
const vm = require('vm');

// Minimal DOM/localStorage stubs
const store = {};
const listeners = {};
function elStub() {
  return {
    _html: '', _text: '', dataset: {}, style: {}, classList: { add(){}, remove(){}, toggle(){}, contains(){return false;} },
    set innerHTML(v){this._html=v;}, get innerHTML(){return this._html;},
    set textContent(v){this._text=v;}, get textContent(){return this._text;},
    addEventListener(){}, appendChild(){}, removeChild(){}, remove(){},
    querySelector(){return elStub();}, querySelectorAll(){return [];},
    getContext(){return {};}, click(){}, value:''
  };
}
const document = {
  documentElement: { getAttribute(){return 'dark';}, setAttribute(){} },
  getElementById(){ return elStub(); },
  querySelector(){ return elStub(); },
  querySelectorAll(){ return []; },
  createElement(){ return elStub(); },
  addEventListener(ev, fn){ listeners[ev]=fn; },
  body: elStub()
};
const windowObj = {
  localStorage: { getItem:k=>store[k]||null, setItem:(k,v)=>store[k]=v },
  addEventListener(){}, innerWidth:1200, scrollTo(){},
  location:{hash:''}, history:{replaceState(){}},
  Chart: undefined, mermaid: undefined, confirm:()=>true,
};
windowObj.window = windowObj;
windowObj.document = document;
windowObj.localStorage = windowObj.localStorage;
windowObj.console = console;
windowObj.setTimeout = ()=>0; windowObj.clearTimeout = ()=>{};
windowObj.Blob = function(){}; windowObj.URL = {createObjectURL:()=>'',revokeObjectURL(){}};
windowObj.history = windowObj.history; windowObj.confirm = ()=>true;
windowObj.Chart = undefined; windowObj.mermaid = undefined;
const sandbox = windowObj;
sandbox.globalThis = sandbox;
vm.createContext(sandbox);

function load(f){ vm.runInContext(fs.readFileSync(f,'utf8'), sandbox, {filename:f}); }
load('assets/js/app.js');
load('assets/js/calculators.js');
load('assets/js/charts.js');
load('assets/js/flowcharts.js');
load('assets/js/content.js');

// fire DOMContentLoaded
if (listeners['DOMContentLoaded']) listeners['DOMContentLoaded']();

const SB = sandbox.window.SB;
const S = SB.state;
const calc = SB.calc;

// Exercise render paths (charts/flows/content) to ensure no runtime throws
let renderOk = true;
try {
  SB.content.update();
  SB.content.buildOpexInputs(); SB.content.buildStartupInputs();
  SB.content.buildPolicies(); SB.content.buildKpis(); SB.content.buildRisks();
  SB.charts.renderFor('dashboard');
  SB.charts.update();
  SB.flows.renderFor('business-lifecycle');
  SB.calc.recalcAll();
  SB.refreshAll();
} catch (e) { renderOk = false; console.log('  RENDER ERROR: ' + e.message); }

function approx(a,b,eps=1e-6){ return Math.abs(a-b) <= eps; }
let pass=0, fail=0;
function check(name, cond, extra){ if(cond){pass++; console.log('  ok  '+name);} else {fail++; console.log('  FAIL '+name+(extra?'  '+extra:''));} }
check('All modules render without throwing', renderOk);

console.log('Defaults: currency='+S.currency+' rate='+S.usdRate+' scenario='+S.scenario);

// Revenue at frac=1
const r = calc.revenueAt(1.0);
const expAds = S.pvMonth12/1000*S.adsensePageRPM;
check('AdSense formula', approx(r.adsense, expAds), 'got '+r.adsense+' exp '+expAds);
check('Pageviews', approx(r.pageviews, S.pvMonth12));
const expImpr = S.pvMonth12*S.adImpressionsPerPage*S.adsenseFillRate;
check('Impressions', approx(r.adImpressions, expImpr));

// Direct
const expDirect = S.directBannerPrice*S.directBannerCount*Math.min(1,0.25+1*0.75*1);
check('Direct formula', approx(r.direct, expDirect), r.direct+' vs '+expDirect);

// Sponsorship at frac1 scale=1
const expSpon = S.sponsorGold*S.sponsorGoldCount+S.sponsorSilver*S.sponsorSilverCount+S.sponsorBronze*S.sponsorBronzeCount;
check('Sponsorship formula', approx(r.sponsorship, expSpon));

// Total = sum
const sum = r.adsense+r.direct+r.sponsorship+r.memberships+r.streaming+r.other;
check('Total = sum of streams', approx(r.totalRev, sum));

// OpEx standard = sum of opex
const opexStd = calc.opexStandard();
const expOpex = Object.values(S.opex).reduce((a,b)=>a+b,0);
check('OpEx standard', approx(opexStd, expOpex), opexStd+' vs '+expOpex);
check('OpEx lean = 0.7x', approx(calc.opexAt('lean'), expOpex*0.7));

// Startup total
const stTotal = calc.startupTotal();
const expSt = Object.values(S.startup).reduce((a,b)=>a+b,0);
check('Startup total', approx(stTotal, expSt));

// Depreciation
const dep = calc.monthlyDepreciation();
check('Depreciation positive', dep>0);

// P&L
const p = calc.pnl();
check('EBITDA = rev - opex', approx(p.ebitda, r.totalRev - opexStd));
const taxable = Math.max(0, p.ebitda - dep - 0);
check('Tax = taxable*rate', approx(p.tax, taxable*S.taxRate));
check('Net = ebitda - dep - tax', approx(p.net, p.ebitda - dep - p.tax));

// Break-even
const be = calc.breakEven();
check('BE revenue = fixed/CM', approx(be.beRev, be.fixed/be.cmr));
check('CM = 1 - varRatio', approx(be.cmr, 1-be.variableRatio));
check('BE PV = beRev/pageRPM*1000', approx(be.bePV, be.beRev/S.adsensePageRPM*1000));

// ROI
const roi = calc.roi();
check('ROI invest = startup', approx(roi.invest, stTotal));
check('ROI cumProfit = cumRev - cumExp', approx(roi.cumProfit, roi.cumRev-roi.cumExp));
check('ROI pct = profit/invest', approx(roi.roiPct, roi.cumProfit/roi.invest));

// Valuation
const v = calc.valuation();
check('Rev method = annualRev*mult', approx(v.revMethod, v.annualRev*S.revMultiple));
check('EBITDA method', approx(v.ebitdaMethod, v.annualEbitda*S.ebitdaMultiple));
check('DCF non-negative', v.dcf>=0, 'dcf='+v.dcf);
// profitable DCF check: temporarily boost revenue
const savedPV = S.pvMonth12; S.pvMonth12 = 5000000;
const v2 = calc.valuation();
check('DCF positive when profitable', v2.dcf>0, 'dcf='+v2.dcf);
S.pvMonth12 = savedPV;

// Cap table dilution sums to 100
const cap = calc.capAfterRound();
const sumAfter = cap.reduce((a,x)=>a+x.after,0);
check('Cap after sums ~100', approx(sumAfter,100,1e-6), 'sum='+sumAfter);
const newRow = cap.find(x=>x.type==='Investor' && x.before===0);
check('New investor pct', newRow && approx(newRow.after, S.newRoundPct));

// Runway
const rw = calc.runway();
if (p.ebitda < 0) check('Runway = cash/burn', approx(rw.runwayMonths, S.cashBalance/rw.burn));
else check('Runway infinite when profitable', rw.runwayMonths===Infinity);

// Snapshot
const snap = calc.snapshot();
check('Snapshot totalRev', approx(snap.totalRev, r.totalRev));

// Currency conversion
const usdFmt = SB.fmt(1000); // USD
S.currency='BDT';
const bdtFmt = SB.fmt(1000);
check('BDT format has ৳', bdtFmt.indexOf('৳')>=0, bdtFmt);
check('BDT = USD*rate', bdtFmt.indexOf(Math.round(1000*S.usdRate).toLocaleString('en-US'))>=0, bdtFmt);

console.log('\nRESULT: '+pass+' passed, '+fail+' failed');
process.exit(fail? 1:0);