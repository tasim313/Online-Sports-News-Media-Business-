/* ==========================================================================
   SportsScope — calculators.js
   Financial engine: revenue, opex, break-even, ROI, valuation, runway, cap table
   All formulas are explicit and correct. Illustrative assumptions only.
   ========================================================================== */
(function () {
  'use strict';
  const SB = window.SB;
  const S = () => SB.state;

  // Scenario multipliers applied to traffic & demand-driven revenue
  const SCEN = { conservative: 0.6, realistic: 1.0, optimistic: 1.6 };

  // Traffic ramp: fraction of Month-12 level reached at each milestone
  const RAMP = {
    m3: 0.10, m6: 0.35, m12: 1.00, y2: 2.10, y3: 3.80, y5: 8.50
  };
  // OpEx stage scaling relative to standard monthly opex
  const OPEX_STAGE = { lean: 0.70, standard: 1.00, growth: 1.60 };

  function scenMul() { return SCEN[S().scenario] || 1; }

  // ---- Revenue components for a given traffic fraction ----
  function revenueAt(frac) {
    const s = S();
    const m = scenMul();
    const pv = s.pvMonth12 * frac * m;
    const pageviews = Math.max(0, pv);

    // AdSense: pageRPM is revenue per 1000 pageviews (geo-mixed, fill-adjusted)
    const adImpressions = pageviews * s.adImpressionsPerPage * s.adsenseFillRate;
    const adsense = pageviews / 1000 * s.adsensePageRPM;

    // Direct advertising (flat monthly, scales mildly with audience fraction)
    const directScale = Math.min(1, 0.25 + frac * 0.75 * m);
    const direct = s.directBannerPrice * s.directBannerCount * directScale;

    // Sponsorship (demand-driven, scales with fraction, capped by availability)
    const sponScale = Math.min(1, frac * m);
    const sponsorship = (s.sponsorGold * s.sponsorGoldCount +
                         s.sponsorSilver * s.sponsorSilverCount +
                         s.sponsorBronze * s.sponsorBronzeCount) * sponScale;

    // Memberships: newsletter sponsorship (flat-ish) + premium subs
    const memberships = (s.newsletterSponsorPrice * Math.min(1, 0.3 + frac * m) +
                         s.premiumMembers * s.premiumPrice * Math.min(1, frac * m));

    // Streaming (only meaningful once frac high)
    const streamScale = Math.max(0, (frac - 0.3)) * m;
    const streaming = s.streamViewers / 1000 * s.streamRPM * Math.min(1.5, streamScale);

    // Other: affiliate + merch scale with audience
    const other = (s.affiliateRevenue + s.merchRevenue) * Math.min(1, frac * m);

    const totalRev = adsense + direct + sponsorship + memberships + streaming + other;
    return { pageviews, adImpressions, adsense, direct, sponsorship, memberships, streaming, other, totalRev };
  }

  // ---- Operating expenses ----
  function opexAt(stage) {
    const o = S().opex;
    const base = Object.values(o).reduce((a, b) => a + (parseFloat(b) || 0), 0);
    return base * (OPEX_STAGE[stage] || 1);
  }
  function opexStandard() { return opexAt('standard'); }

  // ---- Depreciation (straight line) ----
  function depreciableBase() {
    const st = S().startup;
    return (st.development || 0) + (st.uiux || 0) + (st.streamingInfra || 0) +
           (st.camera || 0) + (st.microphone || 0) + (st.videoEditing || 0) +
           (st.security || 0) + (st.cdn || 0);
  }
  function monthlyDepreciation() {
    return depreciableBase() / Math.max(1, S().depreciationMonths);
  }

  // ---- Startup total ----
  function startupTotal() {
    return Object.values(S().startup).reduce((a, b) => a + (parseFloat(b) || 0), 0);
  }
  function startupMandatory() {
    const st = S().startup;
    const keys = ['domain','hosting','development','cms','security','cdn','apis','legal','licenses','branding','internet'];
    return keys.reduce((a, k) => a + (st[k] || 0), 0);
  }

  // ---- P&L at a given month-12 state ----
  function pnl() {
    const s = S();
    const rev = revenueAt(1.0);
    const opex = opexStandard();
    const depr = monthlyDepreciation();
    const interest = 0; // no debt in base model
    const grossProfit = rev.totalRev; // direct costs are within opex (hosting/cdn/apis)
    const ebitda = rev.totalRev - opex;
    const taxable = Math.max(0, ebitda - depr - interest);
    const tax = taxable * s.taxRate;
    const net = ebitda - depr - interest - tax;
    return { rev, opex, depr, interest, grossProfit, ebitda, tax, net, netMargin: rev.totalRev ? net / rev.totalRev : 0 };
  }

  // ---- Break-even ----
  function breakEven() {
    const s = S();
    const fixed = opexStandard() + monthlyDepreciation();
    const variableRatio = 0.12; // variable cost share of revenue (CDN/API/payment fees)
    const cmr = 1 - variableRatio;
    const beRev = fixed / cmr;
    const bePV = s.adsensePageRPM > 0 ? (beRev / s.adsensePageRPM) * 1000 : 0;
    const beSponsorsGold = s.sponsorGold > 0 ? beRev / s.sponsorGold : 0;
    const beSubs = s.premiumPrice > 0 ? beRev / s.premiumPrice : 0;
    return { fixed, variableRatio, cmr, beRev, bePV, beSponsorsGold, beSubs };
  }

  // ---- ROI / 3-year projection ----
  function roi() {
    const s = S();
    const invest = startupTotal();
    let cumRev = 0, cumExp = 0;
    const points = [];
    // 36 months: ramp using RAMP anchors, opex by stage
    const anchors = [
      { m: 1, frac: 0.03, stage: 'lean' }, { m: 3, frac: RAMP.m3, stage: 'lean' },
      { m: 6, frac: RAMP.m6, stage: 'lean' }, { m: 12, frac: RAMP.m12, stage: 'standard' },
      { m: 24, frac: RAMP.y2, stage: 'growth' }, { m: 36, frac: RAMP.y3, stage: 'growth' }
    ];
    function fracAt(m) {
      for (let i = 0; i < anchors.length - 1; i++) {
        if (m >= anchors[i].m && m <= anchors[i + 1].m) {
          const t = (m - anchors[i].m) / (anchors[i + 1].m - anchors[i].m);
          return anchors[i].frac + (anchors[i + 1].frac - anchors[i].frac) * t;
        }
      }
      return anchors[anchors.length - 1].frac;
    }
    function stageAt(m) { return m <= 6 ? 'lean' : m <= 12 ? 'standard' : 'growth'; }

    for (let m = 1; m <= 36; m++) {
      const rev = revenueAt(fracAt(m)).totalRev;
      const exp = opexAt(stageAt(m)) + monthlyDepreciation();
      cumRev += rev; cumExp += exp;
      if (m % 3 === 0 || m === 1) points.push({ m, cumRev, cumExp, cumProfit: cumRev - cumExp });
    }
    const cumProfit = cumRev - cumExp;
    const roiPct = invest > 0 ? cumProfit / invest : 0;
    // payback month (cumulative profit >= initial investment)
    let payback = null, running = -invest;
    for (let m = 1; m <= 36; m++) {
      running += (revenueAt(fracAt(m)).totalRev - (opexAt(stageAt(m)) + monthlyDepreciation()));
      if (running >= 0 && payback === null) payback = m;
    }
    return { invest, cumRev, cumExp, cumProfit, roiPct, payback, points };
  }

  // ---- Runway ----
  function runway() {
    const s = S();
    const p = pnl();
    const netBurn = p.ebitda < 0 ? -p.ebitda : 0; // monthly cash burn if EBITDA negative
    const runwayMonths = netBurn > 0 ? s.cashBalance / netBurn : Infinity;
    return { cash: s.cashBalance, burn: netBurn, runwayMonths };
  }

  // ---- Valuation ----
  function valuation() {
    const s = S();
    const p = pnl();
    const annualRev = p.rev.totalRev * 12;
    const annualEbitda = p.ebitda * 12;
    const revMethod = annualRev * s.revMultiple;
    const ebitdaMethod = annualEbitda * s.ebitdaMultiple;
    // Simple DCF: 5-yr FCF proxy = EBITDA*(1-tax), grow at terminalGrowth, discount
    let dcf = 0;
    let fcff = Math.max(0, annualEbitda) * (1 - s.taxRate);
    for (let y = 1; y <= 5; y++) {
      fcff *= (1 + s.terminalGrowth);
      dcf += fcff / Math.pow(1 + s.discountRate, y);
    }
    // terminal value
    const tv = (fcff * (1 + s.terminalGrowth)) / (s.discountRate - s.terminalGrowth);
    dcf += tv / Math.pow(1 + s.discountRate, 5);
    const assetMethod = depreciableBase() * 0.6; // conservative depreciated asset value
    return { annualRev, annualEbitda, revMethod, ebitdaMethod, dcf, assetMethod };
  }

  // ---- Cap table dilution ----
  function capAfterRound() {
    const s = S();
    const newPct = s.newRoundPct;
    const rows = s.capTable.map(r => ({ name: r.name, type: r.type, before: r.pct, after: r.pct * (1 - newPct / 100) }));
    rows.push({ name: 'New Investor Round', type: 'Investor', before: 0, after: newPct });
    return rows;
  }

  // ---- Snapshot for export ----
  function snapshot() {
    const s = S();
    const r = revenueAt(1.0);
    const be = breakEven();
    const p = pnl();
    return {
      pv: r.pageviews, adsense: r.adsense, direct: r.direct, sponsorship: r.sponsorship,
      memberships: r.memberships, streaming: r.streaming, other: r.other,
      totalRev: r.totalRev, totalOpex: p.opex, ebitda: p.ebitda,
      breakEvenRev: be.beRev, breakEvenPV: be.bePV,
      startupTotal: startupTotal(), burn: runway().burn
    };
  }

  // ---- DOM binding ----
  function bindInputs() {
    SB.$$('[data-bind]').forEach(el => {
      const path = el.dataset.bind;
      // set initial value
      const val = getPath(path);
      if (val !== undefined && el.type !== 'checkbox') el.value = val;
      el.addEventListener('input', () => {
        let v = el.type === 'number' ? parseFloat(el.value) : el.value;
        if (el.type === 'number' && isNaN(v)) v = 0;
        setPath(path, v);
        SB.save();
        recalcAll();
      });
    });
  }
  function getPath(path) {
    return path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), S());
  }
  function setPath(path, v) {
    const keys = path.split('.');
    let o = S();
    for (let i = 0; i < keys.length - 1; i++) o = o[keys[i]];
    o[keys[keys.length - 1]] = v;
  }

  // ---- Recalculate & paint all outputs ----
  function recalcAll() {
    paintRevenue();
    paintOpex();
    paintStartup();
    paintPnL();
    paintBreakEven();
    paintROI();
    paintRunway();
    paintValuation();
    paintCapTable();
    paintDashboard();
    // dynamic content tables (adsense, forecast, policies values, exit)
    if (SB.content && SB.content.update) SB.content.update();
    // extended calculators (employees, decision engine, etc.)
    if (SB.extended && SB.extended.update) SB.extended.update();
    // notify charts
    if (SB.charts && SB.charts.update) SB.charts.update();
  }

  function setText(sel, txt) { const el = SB.$(sel); if (el) el.textContent = txt; }
  function setHTML(sel, html) { const el = SB.$(sel); if (el) el.innerHTML = html; }

  function paintRevenue() {
    const r = revenueAt(1.0);
    const f = SB.fmt;
    setText('#revAds', f(r.adsense)); setText('#revDirect', f(r.direct));
    setText('#revSpon', f(r.sponsorship)); setText('#revMembers', f(r.memberships));
    setText('#revStream', f(r.streaming)); setText('#revOther', f(r.other));
    setText('#revTotal', f(r.totalRev)); setText('#revPV', SB.fmtNum(r.pageviews));
    setText('#revImpr', SB.fmtNum(r.adImpressions));
  }
  function paintOpex() {
    const f = SB.fmt;
    setText('#opexLean', f(opexAt('lean')));
    setText('#opexStandard', f(opexAt('standard')));
    setText('#opexGrowth', f(opexAt('growth')));
    const total = opexStandard();
    const rows = S().opex;
    let html = '';
    for (const k in rows) {
      const label = k.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase());
      html += '<tr><td>' + label + '</td><td class="num" data-usd="' + rows[k] + '">' + f(rows[k]) + '</td></tr>';
    }
    html += '<tr style="font-weight:800"><td>Total Monthly OpEx</td><td class="num" data-usd="' + total + '">' + f(total) + '</td></tr>';
    setHTML('#opexTableBody', html);
  }
  function paintStartup() {
    const f = SB.fmt;
    setText('#startupTotal', f(startupTotal()));
    setText('#startupMandatory', f(startupMandatory()));
    setText('#startupOptional', f(startupTotal() - startupMandatory()));
    const st = S().startup;
    let html = '';
    const mand = ['domain','hosting','development','cms','security','cdn','apis','legal','licenses','branding','internet'];
    for (const k in st) {
      const label = k.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase());
      const tag = mand.includes(k) ? '<span class="badge green">Mandatory</span>' : '<span class="badge gold">Optional</span>';
      html += '<tr><td>' + label + '</td><td>' + tag + '</td><td class="num" data-usd="' + st[k] + '">' + f(st[k]) + '</td></tr>';
    }
    html += '<tr style="font-weight:800"><td>Total</td><td></td><td class="num" data-usd="' + startupTotal() + '">' + f(startupTotal()) + '</td></tr>';
    setHTML('#startupTableBody', html);
  }
  function paintPnL() {
    const p = pnl(); const f = SB.fmt;
    setText('#pnlRev', f(p.rev.totalRev));
    setText('#pnlDirectCosts', f(0));
    setText('#pnlGross', f(p.grossProfit));
    setText('#pnlOpex', f(p.opex));
    setText('#pnlEbitda', f(p.ebitda));
    setText('#pnlDepr', f(p.depr));
    setText('#pnlInterest', f(p.interest));
    setText('#pnlTax', f(p.tax));
    setText('#pnlNet', f(p.net));
    setText('#pnlMargin', SB.fmtPct(p.netMargin));
  }
  function paintBreakEven() {
    const be = breakEven(); const f = SB.fmt;
    setText('#beFixed', f(be.fixed));
    setText('#beVarRatio', SB.fmtPct(be.variableRatio, 0));
    setText('#beCM', SB.fmtPct(be.cmr, 0));
    setText('#beRev', f(be.beRev));
    setText('#bePV', SB.fmtNum(be.bePV));
    setText('#beSponsors', be.beSponsorsGold.toFixed(1));
    setText('#beSubs', Math.ceil(be.beSubs));
  }
  function paintROI() {
    const r = roi(); const f = SB.fmt;
    setText('#roiInvest', f(r.invest));
    setText('#roiCumRev', f(r.cumRev));
    setText('#roiCumExp', f(r.cumExp));
    setText('#roiCumProfit', f(r.cumProfit));
    setText('#roiPct', SB.fmtPct(r.roiPct));
    setText('#roiPayback', r.payback ? ('Month ' + r.payback) : 'Beyond 36 mo');
  }
  function paintRunway() {
    const r = runway(); const f = SB.fmt;
    setText('#runwayCash', f(r.cash));
    setText('#runwayBurn', f(r.burn));
    setText('#runwayMonths', r.runwayMonths === Infinity ? 'Profitable (no burn)' : r.runwayMonths.toFixed(1) + ' months');
  }
  function paintValuation() {
    const v = valuation(); const f = SB.fmt;
    setText('#valRev', f(v.revMethod));
    setText('#valEbitda', f(v.ebitdaMethod));
    setText('#valDcf', f(v.dcf));
    setText('#valAsset', f(v.assetMethod));
    setText('#valAnnualRev', f(v.annualRev));
    setText('#valAnnualEbitda', f(v.annualEbitda));
  }
  function paintCapTable() {
    const rows = capAfterRound();
    let before = '', after = '';
    const sumB = rows.reduce((a, r) => a + r.before, 0);
    const sumA = rows.reduce((a, r) => a + r.after, 0);
    rows.forEach(r => {
      before += '<tr><td>' + r.name + '</td><td><span class="badge ' + (r.type === 'Founder' ? 'blue' : r.type === 'Pool' ? 'purple' : 'gray') + '">' + r.type + '</span></td><td class="num">' + r.before.toFixed(1) + '%</td></tr>';
      after += '<tr><td>' + r.name + '</td><td class="num">' + r.after.toFixed(2) + '%</td></tr>';
    });
    before += '<tr style="font-weight:800"><td>Total</td><td></td><td class="num">' + sumB.toFixed(1) + '%</td></tr>';
    after += '<tr style="font-weight:800"><td>Total</td><td class="num">' + sumA.toFixed(2) + '%</td></tr>';
    setHTML('#capBefore', before); setHTML('#capAfter', after);
  }
  function paintDashboard() {
    const p = pnl(); const r = revenueAt(1.0); const be = breakEven(); const rw = runway(); const f = SB.fmt;
    setText('#dashRev', f(r.totalRev));
    setText('#dashEbitda', f(p.ebitda));
    setText('#dashNet', f(p.net));
    setText('#dashStartup', f(startupTotal()));
    setText('#dashBE', f(be.beRev));
    setText('#dashRunway', rw.runwayMonths === Infinity ? '∞' : rw.runwayMonths.toFixed(1) + ' mo');
    setText('#dashPV', SB.fmtNum(r.pageviews));
    // break-even progress
    const prog = be.beRev > 0 ? Math.min(100, (r.totalRev / be.beRev) * 100) : 100;
    const bar = SB.$('#dashBEBar');
    if (bar) bar.style.width = prog.toFixed(1) + '%';
    setText('#dashBEPct', prog.toFixed(0) + '%');
  }

  // ---- Public ----
  SB.calc = {
    revenueAt, opexAt, opexStandard, startupTotal, startupMandatory,
    depreciableBase, monthlyDepreciation, pnl, breakEven, roi, runway,
    valuation, capAfterRound, snapshot, recalcAll
  };

  document.addEventListener('DOMContentLoaded', () => {
    bindInputs();
    // editable cap table rows (add/remove handled in app via custom events)
    recalcAll();
  });
})();