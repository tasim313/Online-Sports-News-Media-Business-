/* ==========================================================================
   SportsScope — extended.js
   Adds: employee cost calculator, content-opportunity scoring, marketing
   budget, broadcasting-rights register, decision engine, AdSense & sponsorship
   pricing calculators, CSV export. Persists via SB.state/localStorage.
   ========================================================================== */
(function () {
  'use strict';
  const SB = window.SB;
  const S = () => SB.state;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

  // ---- default data ----
  const ROLE_SALARY = {
    'Founder / Manager': 80000, 'Content Writer': 30000, 'Editor': 45000,
    'Journalist': 35000, 'SEO / Marketing': 40000, 'Web Developer': 50000,
    'Social Media Manager': 30000, 'Video Editor': 35000, 'Graphic Designer': 30000,
    'Business Development': 40000, 'Advertising Sales': 45000, 'Editor-in-Chief': 90000,
    'Managing Editor': 70000, 'Researcher / Fact-Checker': 28000, 'Data Analyst': 55000
  };
  const SAMPLE_SCORES = [
    { kw: 'Bangladesh cricket schedule', d: 5, t: 4, c: 3, r: 5, m: 4, e: 4 },
    { kw: 'BPL 2026 teams', d: 4, t: 5, c: 2, r: 5, m: 4, e: 2 },
    { kw: 'EPL match preview', d: 4, t: 3, c: 2, r: 4, m: 3, e: 3 },
    { kw: 'How to start sports blog', d: 3, t: 3, c: 3, r: 3, m: 3, e: 5 },
    { kw: 'Cricket player stats', d: 5, t: 2, c: 3, r: 5, m: 3, e: 5 }
  ];

  function ensureState() {
    if (!S().employees) S().employees = [];
    if (!S().rights) S().rights = [];
    if (!S().scores) S().scores = SB.clone(SAMPLE_SCORES);
    if (!S().weights) S().weights = { d: 25, t: 20, c: 15, r: 15, m: 15, e: 10 };
  }

  // ---- Employees ----
  function buildRoleSelect() {
    const sel = $('#empRole'); if (!sel || sel.dataset.built) return;
    sel.innerHTML = Object.keys(ROLE_SALARY).map(r => '<option>' + r + '</option>').join('');
    sel.dataset.built = '1';
    sel.addEventListener('change', () => { $('#empSalary').value = ROLE_SALARY[sel.value] || 30000; });
  }
  function empMonthlyCost(e) { return e.salary * e.type * (1 + e.benefits / 100); }
  function renderEmployees() {
    const body = $('#empTableBody'); if (!body) return;
    const list = S().employees;
    if (!list.length) { body.innerHTML = '<tr><td colspan="6" class="muted center">No employees yet — add your first hire above.</td></tr>'; }
    else {
      body.innerHTML = list.map((e, i) =>
        '<tr><td>' + e.role + '</td><td>' + (e.type === 1 ? 'Full-time' : e.type >= 0.5 ? 'Part-time' : 'Freelance') +
        '</td><td class="num">' + SB.fmtNum(e.salary) + '</td><td class="num">' + e.benefits + '%</td>' +
        '<td class="num">' + SB.fmtNum(empMonthlyCost(e)) + '</td>' +
        '<td><button class="btn sm" data-empdel="' + i + '">✕</button></td></tr>').join('');
    }
    const monthlyBDT = list.reduce((a, e) => a + empMonthlyCost(e), 0);
    const monthlyUSD = monthlyBDT / S().usdRate;
    $('#empMonthly').textContent = '৳' + SB.fmtNum(monthlyBDT);
    $('#empAnnual').textContent = '৳' + SB.fmtNum(monthlyBDT * 12);
    $('#empCount').textContent = list.length;
    const rev = SB.calc.revenueAt(1.0).totalRev;
    $('#empRatio').textContent = rev > 0 ? SB.fmtPct(monthlyUSD / rev, 0) : '—';
    $$('[data-empdel]', body).forEach(b => b.addEventListener('click', () => {
      S().employees.splice(parseInt(b.dataset.empdel), 1); SB.save(); renderEmployees(); update();
    }));
  }
  function initEmployees() {
    buildRoleSelect();
    const add = $('#empAdd'); if (add && !add.dataset.built) {
      add.dataset.built = '1';
      add.addEventListener('click', () => {
        const role = $('#empRole').value;
        const salary = Math.max(0, parseFloat($('#empSalary').value) || 0);
        const type = parseFloat($('#empType').value) || 1;
        const benefits = Math.max(0, parseFloat($('#empBenefits').value) || 0);
        S().employees.push({ role, salary, type, benefits }); SB.save(); renderEmployees(); update();
        SB.toast('Employee added', 'good');
      });
    }
    renderEmployees();
  }

  // ---- Content opportunity scoring ----
  function renderScores() {
    const body = $('#scoreTableBody'); if (!body) return;
    const w = S().weights;
    const rows = S().scores;
    body.innerHTML = rows.map((r, i) => {
      const score = (r.d * w.d + r.t * w.t + r.c * w.c + r.r * w.r + r.m * w.m + r.e * w.e) / 5;
      const cell = (k, v) => '<td class="num"><input type="number" min="1" max="5" value="' + v + '" data-score="' + i + '" data-k="' + k + '" style="width:64px"/></td>';
      return '<tr><td>' + r.kw + '</td>' + cell('d', r.d) + cell('t', r.t) + cell('c', r.c) +
        cell('r', r.r) + cell('m', r.m) + cell('e', r.e) +
        '<td class="num"><strong>' + score.toFixed(1) + '</strong></td></tr>';
    }).join('');
    $$('[data-score]', body).forEach(inp => inp.addEventListener('input', () => {
      const i = parseInt(inp.dataset.score), k = inp.dataset.k;
      let v = parseFloat(inp.value) || 1; v = Math.min(5, Math.max(1, v));
      S().scores[i][k] = v; SB.save(); renderScores();
    }));
    ['wDemand', 'wTrend', 'wComp', 'wRel', 'wMon', 'wEver'].forEach(id => {
      const el = $('#' + id); if (el && !el.dataset.built) {
        el.dataset.built = '1'; el.value = w[id.replace('w', '').toLowerCase()] || el.value;
        el.addEventListener('input', () => {
          const map = { wDemand: 'd', wTrend: 't', wComp: 'c', wRel: 'r', wMon: 'm', wEver: 'e' };
          S().weights[map[id]] = Math.max(0, parseFloat(el.value) || 0); SB.save(); renderScores();
        });
      }
    });
  }

  // ---- Marketing budget ----
  function initMarketing() {
    const ids = ['mktGoogle', 'mktMeta', 'mktYt', 'mktTools', 'mktDesign'];
    const calc = () => {
      const total = ids.reduce((a, id) => a + (parseFloat($('#' + id).value) || 0), 0);
      $('#mktTotal').textContent = SB.fmt(total);
    };
    ids.forEach(id => { const el = $('#' + id); if (el && !el.dataset.built) { el.dataset.built = '1'; el.addEventListener('input', calc); } });
    calc();
  }

  // ---- Rights register ----
  function rightsStatus(r) {
    const today = new Date();
    const expired = r.end && new Date(r.end) < today;
    const okType = r.type === 'Owned' || r.type === 'Licens' + 'ed' || r.type === 'Public Domain';
    if (r.type === 'Unknown' || expired) return { label: 'Blocked', cls: 'red' };
    if (r.mon === 'No') return { label: 'Blocked', cls: 'red' };
    if (okType && r.mon === 'Yes') return { label: 'Cleared', cls: 'green' };
    return { label: 'Review', cls: 'gold' };
  }
  function renderRights() {
    const body = $('#rightsBody'); if (!body) return;
    const list = S().rights;
    if (!list.length) { body.innerHTML = '<tr><td colspan="10" class="muted center">No entries. Add third-party content above before publishing.</td></tr>'; return; }
    body.innerHTML = list.map((r, i) => {
      const st = rightsStatus(r);
      return '<tr><td>' + r.title + '</td><td>' + r.owner + '</td><td>' + r.type + '</td><td>' + r.terr +
        '</td><td>' + r.plat + '</td><td>' + (r.start || '-') + '</td><td>' + (r.end || '-') + '</td><td>' + r.mon +
        '</td><td><span class="badge ' + st.cls + '">' + st.label + '</span></td>' +
        '<td><button class="btn sm" data-rdel="' + i + '">✕</button></td></tr>';
    }).join('');
    $$('[data-rdel]', body).forEach(b => b.addEventListener('click', () => {
      S().rights.splice(parseInt(b.dataset.rdel), 1); SB.save(); renderRights();
    }));
  }
  function initRights() {
    const add = $('#rAdd'); if (add && !add.dataset.built) {
      add.dataset.built = '1';
      add.addEventListener('click', () => {
        const title = $('#rTitle').value.trim();
        if (!title) { SB.toast('Enter a content title', 'bad'); return; }
        S().rights.push({
          title, owner: $('#rOwner').value.trim() || '-', type: $('#rType').value,
          terr: $('#rTerr').value.trim() || '-', plat: $('#rPlat').value.trim() || '-',
          start: $('#rStart').value, end: $('#rEnd').value, mon: $('#rMon').value
        });
        SB.save(); renderRights();
        ['rTitle', 'rOwner'].forEach(id => $('#' + id).value = '');
        SB.toast('Rights entry added', 'good');
      });
    }
    renderRights();
  }

  // ---- AdSense calculator ----
  function initAdsense() {
    const ids = ['asPV', 'asImp', 'asFill', 'asRpm', 'asGeo', 'asDev', 'asCat'];
    const calc = () => {
      const pv = parseFloat($('#asPV').value) || 0;
      const imp = parseFloat($('#asImp').value) || 0;
      const fill = parseFloat($('#asFill').value) || 0;
      const base = parseFloat($('#asRpm').value) || 0;
      const geo = parseFloat($('#asGeo').value) || 1;
      const dev = parseFloat($('#asDev').value) || 1;
      const cat = parseFloat($('#asCat').value) || 1;
      const impressions = pv * imp * fill;
      const effRpm = base * geo * dev * cat;
      const rev = pv / 1000 * effRpm;
      $('#asImprOut').textContent = SB.fmtNum(impressions);
      $('#asRpmOut').textContent = '$' + effRpm.toFixed(2);
      $('#asRevOut').textContent = SB.fmt(rev);
    };
    ids.forEach(id => { const el = $('#' + id); if (el && !el.dataset.built) { el.dataset.built = '1'; el.addEventListener('input', calc); } });
    calc();
  }

  // ---- Sponsorship pricing ----
  function initSponsor() {
    const ids = ['spReach', 'spCpm', 'spDel', 'spDur'];
    const calc = () => {
      const reach = parseFloat($('#spReach').value) || 0;
      const cpm = parseFloat($('#spCpm').value) || 0;
      const del = parseFloat($('#spDel').value) || 1;
      const dur = parseFloat($('#spDur').value) || 1;
      const month = (reach / 1000) * cpm * del;
      $('#spMonthOut').textContent = SB.fmt(month);
      $('#spTotalOut').textContent = SB.fmt(month * dur);
    };
    ids.forEach(id => { const el = $('#' + id); if (el && !el.dataset.built) { el.dataset.built = '1'; el.addEventListener('input', calc); } });
    calc();
  }

  // ---- Decision engine ----
  function renderDecision() {
    const list = $('#decisionList'); if (!list) return;
    const p = SB.calc.pnl();
    const rw = SB.calc.runway();
    const r = SB.calc.revenueAt(1.0);
    const streams = [['AdSense', r.adsense], ['Direct', r.direct], ['Sponsorship', r.sponsorship], ['Memberships', r.memberships], ['Streaming', r.streaming], ['Other', r.other]];
    const total = r.totalRev || 1;
    const top = streams.reduce((a, b) => b[1] > a[1] ? b : a);
    const topShare = top[1] / total;
    $('#deRunway').textContent = rw.runwayMonths === Infinity ? '∞' : rw.runwayMonths.toFixed(1) + ' mo';
    $('#deEbitda').textContent = SB.fmt(p.ebitda);
    $('#deStreams').textContent = streams.filter(s => s[1] > 0).length;
    $('#deConc').textContent = SB.fmtPct(topShare, 0);

    const recs = [];
    const reserve = S().reserveMonths || 3;
    const be = SB.calc.breakEven();
    if (rw.runwayMonths !== Infinity && rw.runwayMonths < reserve) recs.push(['bad', 'Cash runway below ' + reserve + ' months — cut discretionary spend and prioritise revenue.']);
    if (p.ebitda < 0) recs.push(['warn', 'EBITDA negative — focus on reaching break-even (' + SB.fmt(be.beRev) + '/mo) before hiring or expanding.']);
    else recs.push(['good', 'EBITDA positive — consider controlled expansion if reserve is maintained.']);
    if (topShare > 0.6) recs.push(['warn', top[0] + ' is ' + SB.fmtPct(topShare, 0) + ' of revenue — diversify (direct ads, sponsorships, memberships).']);
    else recs.push(['good', 'Revenue reasonably diversified (top stream ' + SB.fmtPct(topShare, 0) + ').']);
    if (r.pageviews < be.bePV) recs.push(['warn', 'Traffic below break-even pageviews (' + SB.fmtNum(be.bePV) + '/mo) — invest in SEO/Discover.']);
    else recs.push(['good', 'Traffic above break-even pageviews.']);
    const empMonthlyUSD = (S().employees || []).reduce((a, e) => a + empMonthlyCost(e), 0) / S().usdRate;
    if (r.totalRev > 0 && empMonthlyUSD / r.totalRev > 0.5) recs.push(['bad', 'Payroll exceeds 50% of revenue — unsustainable; delay full-time hires.']);
    if (!S().rights || !S().rights.length) recs.push(['warn', 'No broadcasting-rights entries — log all third-party content before publishing/streaming.']);
    if (S().taxRate > 0) recs.push(['good', 'Tax reserve policy active (' + SB.fmtPct(S().taxRate, 0) + ' of positive taxable income).']);

    list.innerHTML = recs.map(x => {
      const ico = x[0] === 'good' ? '✅' : x[0] === 'warn' ? '⚠️' : '⛔';
      return '<div class="notice ' + (x[0] === 'good' ? 'good' : x[0] === 'warn' ? 'warn' : 'danger') + '"><span class="n-ico">' + ico + '</span><div>' + x[1] + '</div></div>';
    }).join('');
  }

  // ---- CSV export ----
  function initCsv() {
    $$('[data-action="export-csv"]').forEach(b => b.addEventListener('click', () => {
      const lines = [];
      const push = (title, rows) => { lines.push(title); rows.forEach(r => lines.push(r.join(','))); lines.push(''); };
      push('Employees', [['Role', 'Type', 'Salary BDT', 'Benefits %', 'Monthly Cost BDT'],
        ...S().employees.map(e => [e.role, e.type, e.salary, e.benefits, Math.round(empMonthlyCost(e))])]);
      push('Rights Register', [['Title', 'Owner', 'Type', 'Territory', 'Platform', 'Start', 'Expiry', 'Monetization', 'Status'],
        ...S().rights.map(r => [r.title, r.owner, r.type, r.terr, r.plat, r.start, r.end, r.mon, rightsStatus(r).label])]);
      push('Content Opportunity Scores', [['Keyword', 'Demand', 'Trend', 'LowComp', 'Relevance', 'Monet', 'Evergreen', 'Score'],
        ...S().scores.map(r => [r.kw, r.d, r.t, r.c, r.r, r.m, r.e,
          ((r.d * S().weights.d + r.t * S().weights.t + r.c * S().weights.c + r.r * S().weights.r + r.m * S().weights.m + r.e * S().weights.e) / 5).toFixed(1)])]);
      const csv = lines.map(l => l.replace(/,/g, ' ').replace(/\n/g, ' ')).join('\n');
      SB.download('sportscope_tables.csv', csv, 'text/csv');
      SB.toast('Tables exported as CSV', 'good');
    }));
  }

  // ---- update (called on recalc) ----
  function update() {
    renderEmployees(); renderScores(); renderDecision(); initMarketing(); initAdsense(); initSponsor();
  }

  SB.extended = { update, renderRights };

  document.addEventListener('DOMContentLoaded', () => {
    ensureState();
    initEmployees(); renderScores(); initMarketing(); initRights(); initAdsense(); initSponsor(); initCsv(); renderDecision();
    // re-render when rights change via add
    const addBtn = $('#rAdd');
    if (addBtn) addBtn.addEventListener('click', () => setTimeout(renderRights, 0));
  });
})();