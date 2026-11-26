/* ==========================================================================
   SportsScope — app.js
   Core: namespace, persistent state, currency, navigation, UI helpers
   ========================================================================== */
(function () {
  'use strict';

  const LS_KEY = 'sportscope_state_v1';

  // ---- Default assumptions (illustrative, editable) ----
  const DEFAULTS = {
    currency: 'BDT',
    usdRate: 122,            // BDT per 1 USD (illustrative, editable)
    scenario: 'realistic',   // conservative | realistic | optimistic
    // Traffic assumptions (monthly pageviews at month 12)
    pvMonth12: 600000,
    pagesPerSession: 1.8,
    // AdSense
    adsensePageRPM: 1.10,    // USD per 1000 pageviews (illustrative, geo-mixed)
    adsenseFillRate: 0.92,
    adImpressionsPerPage: 2.4,
    // Direct advertising
    directBannerPrice: 320,  // USD / month per placement
    directBannerCount: 3,
    // Sponsorship
    sponsorGold: 1500,       // USD / month
    sponsorSilver: 700,
    sponsorBronze: 250,
    sponsorGoldCount: 1,
    sponsorSilverCount: 2,
    sponsorBronzeCount: 3,
    // Newsletter / membership
    newsletterSubs: 4000,
    newsletterSponsorPrice: 400, // USD / month flat
    premiumMembers: 120,
    premiumPrice: 4.5,       // USD / month
    // Affiliate / commerce
    affiliateRevenue: 250,   // USD / month
    merchRevenue: 180,
    // Streaming
    streamViewers: 8000,     // monthly live viewers
    streamRPM: 2.2,          // USD per 1000 stream views
    // Operating expenses (USD / month, standard stage)
    opex: {
      founderSalary: 1200,
      editorSalary: 900,
      journalists: 2200,     // 2 writers
      videoEditor: 700,
      socialManager: 500,
      seoSpecialist: 600,
      developer: 1100,
      adManager: 700,
      hosting: 120,
      cdn: 90,
      apis: 150,
      marketing: 400,
      office: 250,
      internet: 60,
      legal: 150,
      accounting: 120,
      equipMaint: 40
    },
    // Startup (USD)
    startup: {
      domain: 15, hosting: 240, development: 3500, uiux: 900, cms: 0,
      security: 300, cdn: 120, apis: 200, streamingInfra: 1200,
      camera: 700, microphone: 180, videoEditing: 400, office: 800,
      internet: 120, legal: 600, licenses: 150, branding: 500,
      marketing: 1200, workingCapital: 5000
    },
    // Tax & finance
    taxRate: 0.25,
    interestRate: 0.0,
    depreciationMonths: 36,
    // Ownership (hypothetical cap table, percentages)
    capTable: [
      { name: 'Founder (Editorial)', pct: 55, type: 'Founder' },
      { name: 'Co-Founder (Business)', pct: 20, type: 'Founder' },
      { name: 'Angel Investor A', pct: 10, type: 'Investor' },
      { name: 'Angel Investor B', pct: 8, type: 'Investor' },
      { name: 'Employee Pool (ESOP)', pct: 7, type: 'Pool' }
    ],
    newRoundPct: 15,         // new investor pool % for dilution calc
    // Valuation
    revMultiple: 2.5,
    ebitdaMultiple: 8,
    discountRate: 0.22,
    terminalGrowth: 0.03,
    // Runway
    cashBalance: 25000,
    monthlyBurn: 0,          // computed
    // Risk thresholds (adjustable)
    reserveMonths: 3
  };

  // ---- State management ----
  let state = load();

  function load() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return clone(DEFAULTS);
      const parsed = JSON.parse(raw);
      return deepMerge(clone(DEFAULTS), parsed);
    } catch (e) { return clone(DEFAULTS); }
  }
  function save() {
    try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch (e) {}
  }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function deepMerge(base, over) {
    const out = clone(base);
    for (const k in over) {
      if (over[k] && typeof over[k] === 'object' && !Array.isArray(over[k]) && out[k] && typeof out[k] === 'object') {
        out[k] = deepMerge(out[k], over[k]);
      } else { out[k] = over[k]; }
    }
    return out;
  }

  // ---- Currency ----
  function toBDT(usd) { return usd * state.usdRate; }
  function fmt(usdAmount, opts) {
    opts = opts || {};
    const conv = state.currency === 'BDT' ? state.usdRate : 1;
    const sym = state.currency === 'BDT' ? '৳' : '$';
    let v = usdAmount * conv;
    const abs = Math.abs(v);
    let str;
    if (opts.compact && abs >= 1e6) str = (v / 1e6).toFixed(2) + 'M';
    else if (opts.compact && abs >= 1e3) str = (v / 1e3).toFixed(1) + 'K';
    else str = Math.round(v).toLocaleString('en-US');
    return sym + str;
  }
  function fmtNum(n, dec) {
    dec = dec == null ? 0 : dec;
    return Number(n).toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
  }
  function fmtPct(n, dec) { dec = dec == null ? 1 : dec; return (n * 100).toFixed(dec) + '%'; }

  // ---- DOM helpers ----
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

  function toast(msg, kind) {
    let wrap = $('.toast-wrap');
    if (!wrap) { wrap = document.createElement('div'); wrap.className = 'toast-wrap'; document.body.appendChild(wrap); }
    const t = document.createElement('div');
    t.className = 'toast ' + (kind || '');
    t.innerHTML = '<span>' + (kind === 'good' ? '✅' : kind === 'bad' ? '⚠️' : 'ℹ️') + '</span><span>' + msg + '</span>';
    wrap.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity .3s'; setTimeout(() => t.remove(), 320); }, 2600);
  }

  // ---- Navigation ----
  function initNav() {
    $$('.nav-item').forEach(item => {
      item.addEventListener('click', () => {
        const id = item.dataset.target;
        showSection(id);
        if (window.innerWidth <= 860) $('.sidebar').classList.remove('open');
      });
    });
    const ham = $('.hamburger');
    if (ham) ham.addEventListener('click', () => $('.sidebar').classList.toggle('open'));

    // hash routing
    const hash = location.hash.replace('#', '');
    if (hash) showSection(hash);
    else showSection('dashboard');
    window.addEventListener('hashchange', () => {
      const h = location.hash.replace('#', '');
      if (h) showSection(h);
    });
  }
  function showSection(id) {
    $$('.section').forEach(s => s.classList.toggle('active', s.id === 'sec-' + id));
    $$('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.target === id));
    const title = $('.nav-item[data-target="' + id + '"] .ni-label');
    if (title) $('#pageTitle').textContent = title.textContent;
    if (history.replaceState) history.replaceState(null, '', '#' + id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // trigger chart/flow render for this section
    if (window.SB && SB.onSectionShow) SB.onSectionShow(id);
  }

  // ---- Tabs ----
  function initTabs() {
    $$('.tabs').forEach(tabbar => {
      const tabs = $$('.tab', tabbar);
      tabs.forEach(tab => {
        tab.addEventListener('click', () => {
          const group = tab.closest('.tabs').dataset.group;
          tabs.forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          $$('[data-tabgroup="' + group + '"]').forEach(p => {
            p.classList.toggle('active', p.dataset.tab === tab.dataset.tab);
          });
        });
      });
    });
  }

  // ---- Accordion ----
  function initAcc() {
    $$('.acc-head').forEach(h => {
      h.addEventListener('click', () => h.parentElement.classList.toggle('open'));
    });
  }

  // ---- Currency switch ----
  function initCurrency() {
    const sel = $('#currencySelect');
    if (!sel) return;
    sel.value = state.currency;
    sel.addEventListener('change', () => {
      state.currency = sel.value; save();
      refreshAll();
      toast('Currency changed to ' + state.currency, 'good');
    });
    const rate = $('#usdRate');
    if (rate) {
      rate.value = state.usdRate;
      rate.addEventListener('change', () => {
        state.usdRate = Math.max(1, parseFloat(rate.value) || 122); save(); refreshAll();
      });
    }
  }

  // ---- Expand/collapse all accordions ----
  function initExpandAll() {
    $$('[data-action="expand-all"]').forEach(b => b.addEventListener('click', () => {
      $$('.acc').forEach(a => a.classList.add('open'));
    }));
    $$('[data-action="collapse-all"]').forEach(b => b.addEventListener('click', () => {
      $$('.acc').forEach(a => a.classList.remove('open'));
    }));
  }

  // ---- Export / Print / Reset ----
  function initActions() {
    $$('[data-action="print"]').forEach(b => b.addEventListener('click', () => window.print()));
    $$('[data-action="export"]').forEach(b => b.addEventListener('click', exportReport));
    $$('[data-action="reset"]').forEach(b => b.addEventListener('click', () => {
      if (confirm('Reset all assumptions to illustrative defaults?')) {
        state = clone(DEFAULTS); save(); refreshAll(); toast('Assumptions reset to defaults', 'good');
      }
    }));
    $$('[data-action="export-json"]').forEach(b => b.addEventListener('click', () => {
      download('sportscope_assumptions.json', JSON.stringify(state, null, 2), 'application/json');
      toast('Assumptions exported as JSON', 'good');
    }));
  }

  function exportReport() {
    // Build a text financial summary from current state
    const lines = [];
    lines.push('SPORTESCOPE — FINANCIAL SUMMARY (illustrative, editable assumptions)');
    lines.push('Generated: ' + new Date().toISOString());
    lines.push('Currency: ' + state.currency + ' (USD rate ' + state.usdRate + ')');
    lines.push('');
    if (SB.calc && SB.calc.snapshot) {
      const snap = SB.calc.snapshot();
      lines.push('--- KEY PROJECTIONS (Month 12, ' + state.scenario + ') ---');
      lines.push('Monthly pageviews: ' + fmtNum(snap.pv));
      lines.push('AdSense revenue/mo: ' + fmt(snap.adsense));
      lines.push('Direct advertising/mo: ' + fmt(snap.direct));
      lines.push('Sponsorship/mo: ' + fmt(snap.sponsorship));
      lines.push('Newsletter+Premium/mo: ' + fmt(snap.memberships));
      lines.push('Streaming/mo: ' + fmt(snap.streaming));
      lines.push('Other (affiliate+merch)/mo: ' + fmt(snap.other));
      lines.push('TOTAL REVENUE/mo: ' + fmt(snap.totalRev));
      lines.push('Total OpEx/mo: ' + fmt(snap.totalOpex));
      lines.push('EBITDA/mo: ' + fmt(snap.ebitda));
      lines.push('');
      lines.push('--- BREAK-EVEN ---');
      lines.push('Break-even revenue/mo: ' + fmt(snap.breakEvenRev));
      lines.push('Break-even pageviews/mo: ' + fmtNum(snap.breakEvenPV));
      lines.push('');
      lines.push('--- STARTUP ---');
      lines.push('Total startup cost: ' + fmt(snap.startupTotal));
      lines.push('');
      lines.push('--- RUNWAY ---');
      lines.push('Cash balance: ' + fmt(state.cashBalance));
      lines.push('Monthly net burn: ' + fmt(snap.burn));
      lines.push('Runway (months): ' + (snap.burn > 0 ? (state.cashBalance / snap.burn).toFixed(1) : 'n/a (profitable)'));
    }
    lines.push('');
    lines.push('NOTE: All figures are illustrative planning assumptions, not guarantees.');
    download('sportscope_financial_summary.txt', lines.join('\n'), 'text/plain');
    toast('Financial report exported', 'good');
  }

  function download(filename, text, mime) {
    const blob = new Blob([text], { type: mime || 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 100);
  }

  // ---- Refresh everything (currency / state change) ----
  function refreshAll() {
    // re-render all number spans with data-usd
    $$('[data-usd]').forEach(el => {
      const usd = parseFloat(el.dataset.usd);
      if (!isNaN(usd)) el.textContent = fmt(usd, { compact: el.dataset.compact === '1' });
    });
    if (SB.calc && SB.calc.recalcAll) SB.calc.recalcAll();
    if (SB.charts && SB.charts.refresh) SB.charts.refresh();
  }

  // ---- Scenario switch ----
  function initScenario() {
    const sel = $('#scenarioSelect');
    if (!sel) return;
    sel.value = state.scenario;
    sel.addEventListener('change', () => {
      state.scenario = sel.value; save(); refreshAll();
      toast('Scenario: ' + state.scenario, 'good');
    });
  }

  // ---- Public API ----
  window.SB = window.SB || {};
  SB.state = state;
  SB.DEFAULTS = DEFAULTS;
  SB.save = save;
  SB.get = () => state;
  SB.set = (k, v) => { state[k] = v; save(); };
  SB.fmt = fmt; SB.fmtNum = fmtNum; SB.fmtPct = fmtPct; SB.toBDT = toBDT;
  SB.$ = $; SB.$$ = $$; SB.toast = toast; SB.download = download;
  SB.showSection = showSection;
  SB.refreshAll = refreshAll;
  SB.clone = clone;

  // ---- Boot ----
  document.addEventListener('DOMContentLoaded', () => {
    initNav(); initTabs(); initAcc(); initCurrency(); initScenario(); initActions(); initExpandAll();
    // apply theme
    const theme = localStorage.getItem('sportscope_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    const themeBtn = $('#themeToggle');
    if (themeBtn) themeBtn.addEventListener('click', () => {
      const cur = document.documentElement.getAttribute('data-theme');
      const next = cur === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('sportscope_theme', next);
      if (SB.charts && SB.charts.refresh) SB.charts.refresh();
    });
    refreshAll();
  });
})();