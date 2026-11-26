/* ==========================================================================
   SportsScope — competitor-intelligence / charts.js
   Chart.js with explicit EMPTY-STATE handling (never fabricate data).
   ========================================================================== */
(function () {
  'use strict';
  const $ = (s, r) => (r || document).querySelector(s);
  const charts = {};
  const C = { brand: '#2dd4bf', brand2: '#38bdf8', accent: '#a78bfa', gold: '#fbbf24', green: '#34d399', red: '#f87171', orange: '#fb923c', pink: '#f472b6', dim: '#9aa6c8' };
  const PAL = [C.brand, C.brand2, C.accent, C.gold, C.pink, C.orange, C.green, C.red, C.dim];

  function txt() { return document.documentElement.getAttribute('data-theme') === 'light' ? '#16213e' : '#e8ecf7'; }
  function grid() { return document.documentElement.getAttribute('data-theme') === 'light' ? 'rgba(30,50,90,.1)' : 'rgba(154,166,200,.12)'; }
  function base(extra) {
    return Object.assign({ responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { color: txt(), boxWidth: 12, font: { size: 12 } } } },
      scales: { x: { ticks: { color: txt() }, grid: { color: grid() } }, y: { ticks: { color: txt() }, grid: { color: grid() } } }
    }, extra || {});
  }
  function empty(id, msg) {
    const el = document.getElementById(id); if (!el) return;
    if (charts[id]) { charts[id].destroy(); delete charts[id]; }
    const wrap = el.parentElement;
    if (wrap) {
      let ov = wrap.querySelector('.chart-empty');
      if (!ov) { ov = document.createElement('div'); ov.className = 'chart-empty'; wrap.appendChild(ov); }
      ov.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;text-align:center;color:var(--text-mute);font-size:13px;padding:20px;';
      ov.textContent = msg || 'No verified data — enter sourced figures to populate this chart.';
    }
    el.style.visibility = 'hidden';
    return;
  }
  function make(id, cfg) {
    const el = document.getElementById(id); if (!el) return;
    if (el.parentElement) { const ov = el.parentElement.querySelector('.chart-empty'); if (ov) ov.remove(); }
    el.style.visibility = 'visible';
    if (charts[id]) charts[id].destroy();
    if (typeof Chart === 'undefined') return;
    charts[id] = new Chart(el.getContext('2d'), cfg);
  }

  // 10-year financial chart for a company (only entered data)
  function finChart(comp) {
    const data = (RI.state.fin[comp]) || {};
    const has = RI.YEARS.some(y => data[y] && data[y].revenue != null);
    if (!has) { empty('chartFin', 'No sourced financials entered for ' + comp + '. Use the 10-Year Financial Analysis table to add verified figures.'); return; }
    const rev = RI.YEARS.map(y => data[y] && data[y].revenue != null ? data[y].revenue : null);
    const adv = RI.YEARS.map(y => data[y] && data[y].advertising != null ? data[y].advertising : null);
    const sub = RI.YEARS.map(y => data[y] && data[y].subscription != null ? data[y].subscription : null);
    make('chartFin', {
      type: 'line',
      data: { labels: RI.YEARS, datasets: [
        { label: 'Revenue', data: rev, borderColor: C.green, backgroundColor: 'rgba(52,211,153,.1)', spanGaps: true, tension: .25 },
        { label: 'Advertising', data: adv, borderColor: C.gold, backgroundColor: 'rgba(251,191,36,.08)', spanGaps: true, tension: .25 },
        { label: 'Subscription', data: sub, borderColor: C.brand2, backgroundColor: 'rgba(56,189,248,.08)', spanGaps: true, tension: .25 }
      ] },
      options: base({ plugins: { legend: { labels: { color: txt() } } } })
    });
  }

  // Category distribution (real, from dataset)
  function categoryChart() {
    const counts = {};
    COMPETITORS.forEach(c => counts[c.cat] = (counts[c.cat] || 0) + 1);
    const labels = Object.keys(counts), data = labels.map(l => counts[l]);
    make('chartCategory', { type: 'doughnut', data: { labels, datasets: [{ data, backgroundColor: PAL, borderColor: grid(), borderWidth: 2 }] },
      options: base({ cutout: '60%', plugins: { legend: { position: 'right', labels: { color: txt(), boxWidth: 11, font: { size: 11 } } } } }) });
  }

  // Country distribution (real)
  function countryChart() {
    const counts = {};
    COMPETITORS.forEach(c => counts[c.c] = (counts[c.c] || 0) + 1);
    const labels = Object.keys(counts).sort((a, b) => counts[b] - counts[a]).slice(0, 12);
    make('chartCountry', { type: 'bar', data: { labels, datasets: [{ label: 'Companies', data: labels.map(l => counts[l]), backgroundColor: C.brand, borderRadius: 5 }] },
      options: base({ plugins: { legend: { display: false } } }) });
  }

  // Revenue-model distribution (count of companies using each model tag)
  function modelChart() {
    const counts = {};
    COMPETITORS.forEach(c => c.m.forEach(m => counts[m] = (counts[m] || 0) + 1));
    const labels = Object.keys(counts).sort((a, b) => counts[b] - counts[a]).slice(0, 10);
    make('chartModel', { type: 'bar', data: { labels, datasets: [{ label: 'Companies', data: labels.map(l => counts[l]), backgroundColor: C.accent, borderRadius: 5 }] },
      options: base({ plugins: { legend: { display: false } } }) });
  }

  // Scorecard top 10 (analyst judgment)
  function scoreChart() {
    const score = c => Math.min(10, (c.cat === 'Sports broadcaster' ? 8 : c.cat === 'Subscription sports' ? 7 : c.cat === 'Direct sports media' ? 7 : 6) + (c.r === 'Global' ? 2 : 0) - (c.f > 2015 ? 1 : 0));
    const top = COMPETITORS.map(c => ({ n: c.n, s: score(c) })).sort((a, b) => b.s - a.s).slice(0, 10);
    make('chartScore', { type: 'bar', data: { labels: top.map(x => x.n), datasets: [{ label: 'Score (analyst)', data: top.map(x => x.s), backgroundColor: C.gold, borderRadius: 5 }] },
      options: base({ plugins: { legend: { display: false } }, scales: { y: { min: 0, max: 10, ticks: { color: txt() }, grid: { color: grid() } } } }) });
  }

  function renderAll() {
    if (typeof Chart === 'undefined') return;
    const comp = $('#finCompany') ? $('#finCompany').value : 'The New York Times';
    finChart(comp); categoryChart(); countryChart(); modelChart(); scoreChart();
  }
  function updateFin(comp) { finChart(comp || ($('#finCompany') ? $('#finCompany').value : '')); }

  window.RI.charts = { renderAll, updateFin, _c: charts };
  RI.onSection = function (id) {
    setTimeout(() => {
      if (['executive-summary', 'financial-analysis', 'revenue-model-comparison', 'competitor-database'].includes(id)) {
        if (id === 'financial-analysis' || id === 'executive-summary') updateFin();
        if (id === 'revenue-model-comparison' || id === 'executive-summary') { modelChart(); categoryChart(); }
        if (id === 'competitor-database' || id === 'executive-summary') { countryChart(); scoreChart(); }
      }
    }, 60);
  };
  document.addEventListener('DOMContentLoaded', () => setTimeout(renderAll, 150));
})();