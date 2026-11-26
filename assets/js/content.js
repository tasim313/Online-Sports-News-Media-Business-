/* ==========================================================================
   SportsScope — content.js
   Builds dynamic DOM: editable input grids, adsense/forecast tables,
   policy accordion, KPI & risk tables, exit figures. Hooks into recalc.
   ========================================================================== */
(function () {
  'use strict';
  const SB = window.SB;
  const S = () => SB.state;

  const OPEX_LABELS = {
    founderSalary: 'Founder Salary', editorSalary: 'Editor Salary', journalists: 'Journalists / Writers',
    videoEditor: 'Video Editor', socialManager: 'Social Media Manager', seoSpecialist: 'SEO Specialist',
    developer: 'Developer', adManager: 'Advertising Manager', hosting: 'Hosting', cdn: 'CDN',
    apis: 'News/Sports APIs', marketing: 'Marketing', office: 'Office', internet: 'Internet',
    legal: 'Legal', accounting: 'Accounting', equipMaint: 'Equipment Maintenance'
  };
  const STARTUP_LABELS = {
    domain: 'Domain', hosting: 'Hosting (year 1)', development: 'Website Development', uiux: 'UI/UX Design',
    cms: 'CMS', security: 'Security', cdn: 'CDN Setup', apis: 'News/Sports Data APIs',
    streamingInfra: 'Streaming Infrastructure', camera: 'Camera', microphone: 'Microphone',
    videoEditing: 'Video Editing Setup', office: 'Office Setup', internet: 'Internet Setup',
    legal: 'Legal Registration', licenses: 'Licenses', branding: 'Branding', marketing: 'Initial Marketing',
    workingCapital: 'Working Capital'
  };

  function buildOpexInputs() {
    const host = document.getElementById('opexInputs');
    if (!host || host.dataset.built === '1') return;
    let html = '';
    for (const k in OPEX_LABELS) {
      html += '<div class="field"><label>' + OPEX_LABELS[k] + ' (USD/mo)</label>' +
        '<input type="number" data-bind="opex.' + k + '" step="10" /></div>';
    }
    host.innerHTML = html;
    host.dataset.built = '1';
    // set values + bind
    SB.$$('[data-bind]', host).forEach(el => {
      const path = el.dataset.bind;
      const v = path.split('.').reduce((o, kk) => o == null ? undefined : o[kk], S());
      if (v !== undefined) el.value = v;
      el.addEventListener('input', () => {
        let val = parseFloat(el.value); if (isNaN(val)) val = 0;
        const keys = path.split('.'); let o = S();
        for (let i = 0; i < keys.length - 1; i++) o = o[keys[i]];
        o[keys[keys.length - 1]] = val; SB.save();
        if (SB.calc.recalcAll) SB.calc.recalcAll();
      });
    });
  }

  function buildStartupInputs() {
    const host = document.getElementById('startupInputs');
    if (!host || host.dataset.built === '1') return;
    let html = '';
    for (const k in STARTUP_LABELS) {
      html += '<div class="field"><label>' + STARTUP_LABELS[k] + ' (USD)</label>' +
        '<input type="number" data-bind="startup.' + k + '" step="10" /></div>';
    }
    host.innerHTML = html;
    host.dataset.built = '1';
    SB.$$('[data-bind]', host).forEach(el => {
      const path = el.dataset.bind;
      const v = path.split('.').reduce((o, kk) => o == null ? undefined : o[kk], S());
      if (v !== undefined) el.value = v;
      el.addEventListener('input', () => {
        let val = parseFloat(el.value); if (isNaN(val)) val = 0;
        const keys = path.split('.'); let o = S();
        for (let i = 0; i < keys.length - 1; i++) o = o[keys[i]];
        o[keys[keys.length - 1]] = val; SB.save();
        if (SB.calc.recalcAll) SB.calc.recalcAll();
      });
    });
  }

  function adsenseRows() {
    const s = S();
    const pvs = [s.pvMonth12 * 0.1, s.pvMonth12 * 0.35, s.pvMonth12, s.pvMonth12 * 2, s.pvMonth12 * 4];
    const labels = ['10%', '35%', '100% (M12)', '2×', '4×'];
    let html = '';
    pvs.forEach((pv, i) => {
      const impr = pv * s.adImpressionsPerPage * s.adsenseFillRate;
      const rev = pv / 1000 * s.adsensePageRPM;
      html += '<tr><td>' + labels[i] + ' (' + SB.fmtNum(pv) + ' PV)</td><td class="num">' + SB.fmtNum(impr) +
        '</td><td class="num">$' + s.adsensePageRPM.toFixed(2) + '</td><td class="num">' + SB.fmt(rev) + '</td></tr>';
    });
    return html;
  }

  function forecastRows() {
    const s = S();
    const fracs = { m3: 0.10, m6: 0.35, m12: 1.0, y2: 2.1, y3: 3.8, y5: 8.5 };
    const periods = ['m3', 'm6', 'm12', 'y2', 'y3', 'y5'];
    const streams = ['adsense', 'direct', 'sponsorship', 'memberships', 'streaming', 'other'];
    const names = ['AdSense', 'Direct Ads', 'Sponsorship', 'Memberships', 'Streaming', 'Other'];
    let html = '';
    streams.forEach((key, i) => {
      html += '<tr><td>' + names[i] + '</td>';
      periods.forEach(p => {
        const r = SB.calc.revenueAt(fracs[p]);
        html += '<td class="num">' + SB.fmt(r[key]) + '</td>';
      });
      html += '</tr>';
    });
    // total row
    html += '<tr style="font-weight:800"><td>Total</td>';
    periods.forEach(p => {
      const r = SB.calc.revenueAt(fracs[p]);
      html += '<td class="num">' + SB.fmt(r.totalRev) + '</td>';
    });
    html += '</tr>';
    return html;
  }

  // ---- Policies ----
  const POLICIES = [
    ['Company Governance Policy', 'Recommended', 'Board structure, decision rights, reserved matters, reporting cadence and conflict handling.'],
    ['Founder Agreement', 'Mandatory', 'Roles, equity, vesting, IP assignment, departure and non-compete (where lawful). Requires legal counsel.'],
    ['Shareholder Agreement', 'Mandatory', 'Transfer restrictions, tag/drag-along, voting, dividends and exit mechanics.'],
    ['Investor Agreement', 'Mandatory', 'Investment amount, equity, information rights, liquidation preference and protective provisions.'],
    ['Editorial Independence Policy', 'Recommended', 'Firewall between advertising/sponsorship and editorial; sponsored content clearly labelled.'],
    ['News Verification Policy', 'Recommended', 'Two-source rule, official confirmation, right of reply, and a no-publish rule for unverified claims.'],
    ['Fact-Checking Policy', 'Recommended', 'Pre-publication checklist, correction log and prominent corrections.'],
    ['Copyright Policy', 'Mandatory', 'Use only owned/licensed media; honour takedowns; no unlicensed restreaming.'],
    ['Sports Broadcasting Rights Policy', 'Mandatory', 'Never stream events without documented rights; maintain a rights register.'],
    ['Advertising Policy', 'Recommended', 'Acceptable categories, no misleading ads, clear labelling, separation from editorial.'],
    ['Google AdSense Compliance Policy', 'Mandatory', 'No invalid traffic, no prohibited content, no deceptive placements; monitor &amp; respond to policy notices.'],
    ['Sponsorship Disclosure Policy', 'Recommended', 'All sponsored material labelled; sponsor has no editorial approval.'],
    ['Affiliate Disclosure Policy', 'Recommended', 'Clear affiliate disclosure on any commission-earning links.'],
    ['Privacy Policy', 'Mandatory', 'What data is collected, purpose, retention, sharing and user rights (aligned with data-protection law).'],
    ['Cookie Policy', 'Mandatory', 'Cookie categories, consent (CMP) and opt-out.'],
    ['Terms & Conditions', 'Mandatory', 'Use terms, IP, liability limits, governing law.'],
    ['Content Moderation Policy', 'Recommended', 'Community rules, reporting, escalation and appeals.'],
    ['Employee Policy', 'Mandatory', 'Contracts, working hours, leave, conduct and termination per labour law.'],
    ['Financial Management Policy', 'Recommended', 'Budgets, approvals, segregation of duties and reporting.'],
    ['Expense Approval Policy', 'Recommended', 'Thresholds and approvers; receipts mandatory.'],
    ['Fraud Prevention Policy', 'Recommended', 'Controls, audits and whistleblowing.'],
    ['Conflict of Interest Policy', 'Recommended', 'Disclosure and recusal.'],
    ['Data Protection Policy', 'Mandatory', 'Lawful basis, security, breach handling and data-subject rights.'],
    ['Information Security Policy', 'Recommended', 'Access control, backups, incident response.'],
    ['Crisis Management Policy', 'Recommended', 'Playbook for outages, legal claims and PR crises.'],
    ['Investor Communication Policy', 'Recommended', 'Cadence, format and disclosure discipline.'],
    ['Business Continuity Policy', 'Recommended', 'DR plan, backups and recovery targets.'],
    ['Risk Management Policy', 'Recommended', 'Register, owners and review cadence.'],
    ['Business Exit Policy', 'Recommended', 'Triggers, process and distribution of proceeds.']
  ];
  function buildPolicies() {
    const host = document.getElementById('policyAcc');
    if (!host || host.dataset.built === '1') return;
    let html = '';
    POLICIES.forEach((p, i) => {
      const badge = p[1] === 'Mandatory' ? 'red' : p[1] === 'Recommended' ? 'gold' : 'gray';
      html += '<div class="acc"><div class="acc-head"><span>' + (i + 1) + '. ' + p[0] +
        '</span><span class="acc-chev">▾</span></div><div class="acc-body">' +
        '<span class="badge ' + badge + '">' + p[1] + '</span> ' +
        '<span class="xsmall muted">Sample internal rule — not legal advice.</span><br/><br/>' + p[2] + '</div></div>';
    });
    host.innerHTML = html;
    host.dataset.built = '1';
    // re-bind accordion toggles for new nodes
    SB.$$('.acc-head', host).forEach(h => h.addEventListener('click', () => h.parentElement.classList.toggle('open')));
  }

  // ---- KPI table ----
  const KPIS = [
    ['Monthly Active Users', 'Unique users in month', 'Analytics', 'Monthly', 'Marketing'],
    ['Daily Active Users', 'Unique users in day', 'Analytics', 'Daily', 'Marketing'],
    ['Pageviews', 'Total page views', 'Analytics', 'Daily', 'Editorial'],
    ['Sessions', 'Total sessions', 'Analytics', 'Daily', 'Marketing'],
    ['Returning Visitors', 'Returning / total', 'Analytics', 'Weekly', 'Marketing'],
    ['Avg Engagement Time', 'Total time / sessions', 'Analytics', 'Weekly', 'Editorial'],
    ['Newsletter Subscribers', 'Count of subs', 'ESP', 'Weekly', 'Marketing'],
    ['Organic Traffic', 'Sessions from search', 'Analytics/Search Console', 'Weekly', 'SEO'],
    ['Search Impressions', 'Impressions in search', 'Search Console', 'Weekly', 'SEO'],
    ['Search CTR', 'Clicks / impressions', 'Search Console', 'Weekly', 'SEO'],
    ['Keyword Rankings', 'Tracked positions', 'Rank tracker', 'Weekly', 'SEO'],
    ['Backlinks', 'Referring domains', 'Backlink tool', 'Monthly', 'SEO'],
    ['Discover Traffic', 'Sessions from Discover', 'Search Console', 'Weekly', 'SEO'],
    ['Ad Impressions', 'Ad views', 'AdSense', 'Daily', 'Advertising'],
    ['Ad RPM', 'Revenue / 1000 ad imp', 'AdSense', 'Daily', 'Advertising'],
    ['Page RPM', 'Revenue / 1000 pageviews', 'AdSense', 'Daily', 'Advertising'],
    ['CTR (ads)', 'Clicks / impressions', 'AdSense', 'Weekly', 'Advertising'],
    ['Fill Rate', 'Filled / requested', 'AdSense', 'Weekly', 'Advertising'],
    ['Revenue per Visitor', 'Revenue / users', 'AdSense+Analytics', 'Monthly', 'Finance'],
    ['Number of Sponsors', 'Active sponsor count', 'CRM', 'Monthly', 'Sponsorship'],
    ['Sponsorship Revenue', 'Sum of contracts', 'CRM/Finance', 'Monthly', 'Sponsorship'],
    ['Renewal Rate', 'Renewed / expiring', 'CRM', 'Quarterly', 'Sponsorship'],
    ['Live Viewers', 'Concurrent/unique', 'Streaming', 'Per event', 'Streaming'],
    ['Watch Time', 'Total minutes', 'Streaming', 'Per event', 'Streaming'],
    ['Streaming Revenue', 'Ads+subs', 'Streaming/Finance', 'Monthly', 'Streaming'],
    ['Cost per Viewer', 'Stream cost / viewers', 'Finance', 'Monthly', 'Finance'],
    ['Total Revenue', 'Sum all streams', 'Finance', 'Monthly', 'Finance'],
    ['EBITDA', 'Rev − OpEx', 'Finance', 'Monthly', 'Finance'],
    ['Net Profit', 'EBITDA − dep − tax', 'Finance', 'Monthly', 'Finance'],
    ['Cash Balance', 'Bank/cash', 'Finance', 'Weekly', 'Finance'],
    ['Burn Rate', 'Net cash out / mo', 'Finance', 'Monthly', 'Finance'],
    ['Runway', 'Cash / burn', 'Finance', 'Monthly', 'Finance'],
    ['ROI', 'Cum profit / invest', 'Finance', 'Quarterly', 'Finance'],
    ['Break-Even Progress', 'Rev / BE rev', 'Finance', 'Monthly', 'Finance'],
    ['Content Published', 'Posts / period', 'CMS', 'Weekly', 'Editorial'],
    ['Correction Rate', 'Corrections / posts', 'CMS', 'Monthly', 'Editorial'],
    ['Customer Complaints', 'Tickets count', 'Support', 'Weekly', 'Support']
  ];
  function buildKpis() {
    const host = document.getElementById('kpiTableBody');
    if (!host || host.dataset.built === '1') return;
    let html = '';
    KPIS.forEach(k => {
      html += '<tr><td><strong>' + k[0] + '</strong></td><td class="small">' + k[1] + '</td><td class="small">' + k[2] + '</td><td class="small">' + k[3] + '</td><td class="small">' + k[4] + '</td></tr>';
    });
    host.innerHTML = html; host.dataset.built = '1';
  }

  // ---- Risk table ----
  const RISKS = [
    ['Google algorithm dependency', 'High', 'High', 'Diversify traffic (social, direct, newsletter); SEO best practices', 'Marketing'],
    ['AdSense revenue dependency', 'High', 'Medium', 'Layer direct ads, sponsorships, memberships', 'Advertising'],
    ['Seasonal traffic', 'Medium', 'Medium', 'Evergreen content calendar; multi-sport coverage', 'Editorial'],
    ['Copyright / rights claims', 'Medium', 'High', 'Rights register; licensed content only; takedown process', 'Legal'],
    ['Broadcasting rights cost', 'Medium', 'High', 'Avoid unlicensed streaming; partner only with rights', 'CEO'],
    ['Journalist credibility', 'Medium', 'High', 'Verification &amp; corrections policy; training', 'Editor'],
    ['Fake news risk', 'Medium', 'High', 'Two-source rule; fact-check; right of reply', 'Editor'],
    ['Social media dependency', 'High', 'Medium', 'Owned audience (newsletter/community)', 'Marketing'],
    ['Streaming infra cost', 'Medium', 'Medium', 'Validate demand first; CDN cost controls', 'CTO'],
    ['Sponsor dependency', 'Medium', 'Medium', 'Diversify sponsor base; contracts with notice', 'Sponsorship'],
    ['Cash flow challenges', 'High', 'High', 'Reserve ≥ 3 months OpEx; monitor burn/runway', 'Finance']
  ];
  function buildRisks() {
    const host = document.getElementById('riskTableBody');
    if (!host || host.dataset.built === '1') return;
    let html = '';
    RISKS.forEach(r => {
      const lk = r[1] === 'High' ? 'red' : r[1] === 'Medium' ? 'gold' : 'green';
      const ik = r[2] === 'High' ? 'red' : r[2] === 'Medium' ? 'gold' : 'green';
      html += '<tr><td><strong>' + r[0] + '</strong></td><td><span class="badge ' + lk + '">' + r[1] + '</span></td><td><span class="badge ' + ik + '">' + r[2] + '</span></td><td class="small">' + r[3] + '</td><td class="small">' + r[4] + '</td></tr>';
    });
    host.innerHTML = html; host.dataset.built = '1';
  }

  // ---- Update dynamic values on recalc ----
  function update() {
    const s = S();
    const a1 = document.getElementById('adsenseTableBody');
    const a2 = document.getElementById('adsenseTableBody2');
    const rows = adsenseRows();
    if (a1) a1.innerHTML = rows;
    if (a2) a2.innerHTML = rows;
    const fc = document.getElementById('forecastTableBody');
    if (fc) fc.innerHTML = forecastRows();
    const rs = document.getElementById('revScenario');
    if (rs) rs.textContent = s.scenario;
    // exit figures
    const v = SB.calc.valuation();
    const annualRev = v.annualRev;
    const exitVal = annualRev * s.revMultiple;
    const founderPct = (s.capTable.find(c => c.type === 'Founder') || { pct: 0 }).pct / 100;
    const setT = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    setT('exitRev', SB.fmt(annualRev));
    setT('exitVal', SB.fmt(exitVal));
    setT('exitFounder', SB.fmt(exitVal * founderPct));
    // fill opex/startup derived tables (second copies)
    const st = s.startup;
    const mand = ['domain','hosting','development','cms','security','cdn','apis','legal','licenses','branding','internet'];
    let stHtml = '';
    for (const k in st) {
      const label = STARTUP_LABELS[k] || k;
      const tag = mand.includes(k) ? '<span class="badge green">Mandatory</span>' : '<span class="badge gold">Optional</span>';
      stHtml += '<tr><td>' + label + '</td><td>' + tag + '</td><td class="num">' + SB.fmt(st[k]) + '</td></tr>';
    }
    stHtml += '<tr style="font-weight:800"><td>Total</td><td></td><td class="num">' + SB.fmt(SB.calc.startupTotal()) + '</td></tr>';
    const st2 = document.getElementById('startupTableBody2');
    if (st2) st2.innerHTML = stHtml;
    // apply data-usd spans
    SB.$$('[data-usd]').forEach(el => {
      const usd = parseFloat(el.dataset.usd);
      if (!isNaN(usd)) el.textContent = SB.fmt(usd, { compact: el.dataset.compact === '1' });
    });
  }

  SB.content = { update, buildOpexInputs, buildStartupInputs, buildPolicies, buildKpis, buildRisks };

  document.addEventListener('DOMContentLoaded', () => {
    buildOpexInputs(); buildStartupInputs(); buildPolicies(); buildKpis(); buildRisks();
    // initial paint of dynamic tables
    setTimeout(update, 150);
  });
})();