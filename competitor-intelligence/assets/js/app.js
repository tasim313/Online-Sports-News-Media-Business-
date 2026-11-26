/* ==========================================================================
   SportsScope — competitor-intelligence / app.js
   Navigation, search/filter, profiles, scorecard, compare, CSV, localStorage.
   Data integrity: no fabricated numbers; unknowns shown as "Unknown".
   ========================================================================== */
(function () {
  'use strict';
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const LS = 'sportscope_ri_state_v1';

  const state = load();
  function load() {
    try { const r = localStorage.getItem(LS); return r ? JSON.parse(r) : { theme: 'dark', compare: [], fin: {} }; }
    catch (e) { return { theme: 'dark', compare: [], fin: {} }; }
  }
  function save() { try { localStorage.setItem(LS, JSON.stringify(state)); } catch (e) {} }

  const STLABEL = { confirmed: 'Confirmed', disclosed: 'Disclosed', estimate: 'Estimate', unknown: 'Unknown' };
  const STBADGE = { confirmed: 'green', disclosed: 'blue', estimate: 'gold', unknown: 'gray' };

  function toast(m, k) {
    let w = $('.toast-wrap'); if (!w) { w = document.createElement('div'); w.className = 'toast-wrap'; document.body.appendChild(w); }
    const t = document.createElement('div'); t.className = 'toast ' + (k || '');
    t.innerHTML = '<span>' + (k === 'good' ? '✅' : k === 'bad' ? '⚠️' : 'ℹ️') + '</span><span>' + m + '</span>';
    w.appendChild(t); setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 2500);
  }
  function download(fn, txt, mime) {
    const b = new Blob([txt], { type: mime || 'text/plain' }); const u = URL.createObjectURL(b);
    const a = document.createElement('a'); a.href = u; a.download = fn; document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(u); a.remove(); }, 100);
  }

  // ---- Navigation ----
  function showSection(id) {
    $$('.section').forEach(s => s.classList.toggle('active', s.id === 'sec-' + id));
    $$('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.target === id));
    const lbl = $('.nav-item[data-target="' + id + '"] .ni-label'); if (lbl) $('#pageTitle').textContent = lbl.textContent;
    if (history.replaceState) history.replaceState(null, '', '#' + id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (window.RI && RI.onSection) RI.onSection(id);
  }
  function initNav() {
    $$('.nav-item').forEach(it => it.addEventListener('click', () => {
      showSection(it.dataset.target);
      if (window.innerWidth <= 860) $('.sidebar').classList.remove('open');
    }));
    const h = $('.hamburger'); if (h) h.addEventListener('click', () => $('.sidebar').classList.toggle('open'));
    const hash = location.hash.replace('#', ''); showSection(hash || 'executive-summary');
    window.addEventListener('hashchange', () => { const x = location.hash.replace('#', ''); if (x) showSection(x); });
  }

  // ---- Competitor database table ----
  function filtered() {
    const q = ($('#cSearch') ? $('#cSearch').value : '').toLowerCase();
    const ctry = $('#cCountry') ? $('#cCountry').value : '';
    const cat = $('#cCat') ? $('#cCat').value : '';
    const model = $('#cModel') ? $('#cModel').value : '';
    return COMPETITORS.filter(c => {
      if (ctry && c.c !== ctry) return false;
      if (cat && c.cat !== cat) return false;
      if (model && c.m.indexOf(model) < 0) return false;
      if (q && !(c.n + ' ' + c.c + ' ' + c.p + ' ' + c.s).toLowerCase().includes(q)) return false;
      return true;
    });
  }
  function renderDatabase() {
    const body = $('#cBody'); if (!body) return;
    const rows = filtered();
    body.innerHTML = rows.map(c =>
      '<tr><td><strong>' + c.n + '</strong></td><td>' + c.c + '</td><td>' + c.f + '</td><td>' + (c.p || '—') +
      '</td><td>' + c.cat + '</td><td class="small">' + c.m.slice(0, 3).join(', ') + '</td>' +
      '<td><span class="badge ' + STBADGE[c.ad] + '">' + STLABEL[c.ad] + '</span></td>' +
      '<td><button class="btn sm" data-cmp="' + c.n + '">Compare</button></td></tr>').join('') ||
      '<tr><td colspan="8" class="muted center">No matches.</td></tr>';
    $('#cCount').textContent = rows.length + ' of ' + COMPETITORS.length + ' companies';
    $$('[data-cmp]', body).forEach(b => b.addEventListener('click', () => toggleCompare(b.dataset.cmp)));
  }
  function toggleCompare(name) {
    const i = state.compare.indexOf(name);
    if (i >= 0) state.compare.splice(i, 1); else { if (state.compare.length >= 4) { toast('Compare up to 4', 'bad'); return; } state.compare.push(name); }
    save(); renderCompare(); toast(name + (i >= 0 ? ' removed' : ' added to compare'), 'good');
  }
  function renderCompare() {
    const host = $('#compareBox'); if (!host) return;
    if (!state.compare.length) { host.innerHTML = '<p class="muted">Select up to 4 companies via “Compare” in the database.</p>'; return; }
    const cols = state.compare.map(n => COMPETITORS.find(c => c.n === n)).filter(Boolean);
    let html = '<div class="table-wrap"><table><thead><tr><th>Field</th>' + cols.map(c => '<th>' + c.n + '</th>').join('') + '</tr></thead><tbody>';
    const fields = [['Country', c => c.c], ['Founded', c => c.f], ['Parent', c => c.p || '—'], ['Type', c => c.t], ['Category', c => c.cat], ['Sports', c => c.s], ['Platforms', c => c.plat], ['Model', c => c.m.join(', ')], ['AdSense', c => STLABEL[c.ad]]];
    fields.forEach(f => { html += '<tr><td><strong>' + f[0] + '</strong></td>' + cols.map(c => '<td class="small">' + f[1](c) + '</td>').join('') + '</tr>'; });
    html += '</tbody></table></div>';
    host.innerHTML = html;
  }

  // ---- Profiles ----
  function renderProfiles() {
    const host = $('#profileList'); if (!host) return;
    const q = ($('#pSearch') ? $('#pSearch').value : '').toLowerCase();
    const list = COMPETITORS.filter(c => !q || (c.n + ' ' + c.c).toLowerCase().includes(q));
    host.innerHTML = list.map(c =>
      '<div class="card"><h3>' + c.n + ' <span class="badge gray">' + c.cat + '</span></h3>' +
      '<p class="small muted">' + c.c + ' · Founded ' + c.f + ' · Parent: ' + (c.p || '—') + ' · HQ: ' + (c.hq || '—') + '</p>' +
      '<p class="small">Sports: ' + c.s + ' · Platforms: ' + c.plat + '</p>' +
      '<p class="small">Model: ' + c.m.join(', ') + '</p>' +
      '<div class="row mt8">' + c.streams.map(s => '<span class="pill">' + s.k + ' <span class="badge ' + STBADGE[s.st] + '">' + STLABEL[s.st] + '</span></span>').join('') + '</div>' +
      '<p class="xsmall muted mt8">' + c.note + '</p>' +
      '<p class="xsmall muted">10-yr financials: <strong>Unknown / not in dataset</strong> — see 10-Year Financial Analysis to enter sourced data.</p></div>').join('');
  }

  // ---- Scorecard (analyst judgment, transparent) ----
  function renderScorecard() {
    const host = $('#scoreBody'); if (!host) return;
    // scores are ANALYST JUDGMENT (1-10), clearly labeled; not measured
    const score = c => {
      const base = c.cat === 'Sports broadcaster' ? 8 : c.cat === 'Subscription sports' ? 7 : c.cat === 'Direct sports media' ? 7 : 6;
      const reach = c.r === 'Global' ? 2 : 0;
      return Math.min(10, base + reach - (c.f > 2015 ? 1 : 0));
    };
    const rows = COMPETITORS.map(c => ({ c, s: score(c) })).sort((a, b) => b.s - a.s).slice(0, 20);
    host.innerHTML = rows.map((r, i) => '<tr><td>' + (i + 1) + '</td><td><strong>' + r.c.n + '</strong></td><td>' + r.c.cat + '</td><td class="num">' + r.s + '/10</td></tr>').join('');
    const note = $('#scoreNote'); if (note) note.textContent = 'Scores are analyst judgment (transparent heuristic), not measured data.';
  }

  // ---- 10-year financial editable table ----
  const YEARS = ['2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025', '2026 YTD'];
  const FIELDS = ['revenue', 'advertising', 'subscription', 'other', 'opProfit', 'netProfit'];
  function renderFin() {
    const host = $('#finBody'); if (!host) return;
    const sel = $('#finCompany'); const comp = sel ? sel.value : 'The New York Times';
    const data = state.fin[comp] || {};
    let html = '';
    YEARS.forEach(y => {
      html += '<tr><td><strong>' + y + '</strong></td>';
      FIELDS.forEach(f => {
        const v = data[y] && data[y][f] != null ? data[y][f] : '';
        html += '<td class="num"><input type="number" data-fin="1" data-y="' + y + '" data-f="' + f + '" value="' + v + '" placeholder="—" style="width:92px"/></td>';
      });
      html += '</tr>';
    });
    host.innerHTML = html;
    $$('[data-fin]', host).forEach(inp => inp.addEventListener('input', () => {
      const y = inp.dataset.y, f = inp.dataset.f;
      if (!state.fin[comp]) state.fin[comp] = {};
      if (!state.fin[comp][y]) state.fin[comp][y] = {};
      const val = inp.value === '' ? null : parseFloat(inp.value);
      state.fin[comp][y][f] = val; save();
      if (window.RI && RI.updateFinChart) RI.updateFinChart(comp);
    }));
    const note = $('#finNote'); if (note) note.textContent = 'Enter only sourced figures. Blank = Unknown (never fabricated). Currency as reported; note the unit in the report.';
    if (window.RI && RI.updateFinChart) RI.updateFinChart(comp);
  }

  // ---- CSV export ----
  function exportCsv() {
    const lines = [];
    lines.push('Competitor Database');
    lines.push(['Name', 'Country', 'Founded', 'Parent', 'Type', 'Category', 'Sports', 'Platforms', 'Model', 'AdSense'].join(','));
    COMPETITORS.forEach(c => lines.push([c.n, c.c, c.f, c.p || '', c.t, c.cat, c.s, c.plat, c.m.join('; '), STLABEL[c.ad]].join(',')));
    lines.push('');
    lines.push('10-Year Financials (only entered values; blank=Unknown)');
    lines.push(['Company', 'Year', 'Revenue', 'Advertising', 'Subscription', 'Other', 'OpProfit', 'NetProfit'].join(','));
    Object.keys(state.fin).forEach(comp => YEARS.forEach(y => {
      const d = state.fin[comp][y] || {};
      lines.push([comp, y, d.revenue ?? '', d.advertising ?? '', d.subscription ?? '', d.other ?? '', d.opProfit ?? '', d.netProfit ?? ''].join(','));
    }));
    download('competitor_research.csv', lines.join('\n'), 'text/csv');
    toast('Research exported (CSV)', 'good');
  }

  // ---- init ----
  function initFilters() {
    const sel = $('#cCountry');
    if (sel && !sel.dataset.built) {
      sel.dataset.built = '1';
      sel.innerHTML = '<option value="">All countries</option>' + COUNTRIES.map(c => '<option>' + c + '</option>').join('');
    }
    const cat = $('#cCat');
    if (cat && !cat.dataset.built) {
      cat.dataset.built = '1';
      cat.innerHTML = '<option value="">All categories</option>' + CATEGORIES.map(c => '<option>' + c + '</option>').join('');
    }
    ['cSearch', 'cCountry', 'cCat', 'cModel'].forEach(id => { const el = $('#' + id); if (el) el.addEventListener('input', renderDatabase); });
    const ps = $('#pSearch'); if (ps) ps.addEventListener('input', renderProfiles);
    const fc = $('#finCompany');
    if (fc && !fc.dataset.built) {
      fc.dataset.built = '1';
      fc.innerHTML = COMPETITORS.map(c => '<option>' + c.n + '</option>').join('');
      fc.value = 'The New York Times';
      fc.addEventListener('change', renderFin);
    }
  }

  window.RI = { state, save, showSection, renderDatabase, renderCompare, renderProfiles, renderScorecard, renderFin, exportCsv, toast, download, STLABEL, STBADGE, YEARS, FIELDS };

  document.addEventListener('DOMContentLoaded', () => {
    document.documentElement.setAttribute('data-theme', state.theme || 'dark');
    initNav(); initFilters();
    renderDatabase(); renderCompare(); renderProfiles(); renderScorecard(); renderFin();
    $$('[data-action="export-csv"]').forEach(b => b.addEventListener('click', exportCsv));
    $$('[data-action="print"]').forEach(b => b.addEventListener('click', () => window.print()));
    $$('[data-action="clear-compare"]').forEach(b => b.addEventListener('click', () => { state.compare = []; save(); renderCompare(); renderDatabase(); }));
    const tt = $('#themeToggle'); if (tt) tt.addEventListener('click', () => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark'; save();
      document.documentElement.setAttribute('data-theme', state.theme);
      if (window.RI && RI.onSection) RI.onSection($('.nav-item.active').dataset.target);
    });
    // mermaid init
    if (typeof mermaid !== 'undefined') {
      mermaid.initialize({ startOnLoad: false, theme: 'dark', securityLevel: 'loose', flowchart: { useMaxWidth: true } });
    }
    if (window.RI && RI.onSection) RI.onSection($('.nav-item.active').dataset.target);
  });
})();