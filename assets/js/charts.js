/* ==========================================================================
   SportsScope — charts.js
   Chart.js interactive visualisations. Lazy-rendered per section, updated live.
   ========================================================================== */
(function () {
  'use strict';
  const SB = window.SB;
  const charts = {};
  let ready = false;

  const C = {
    brand: '#2dd4bf', brand2: '#38bdf8', accent: '#a78bfa', gold: '#fbbf24',
    green: '#34d399', red: '#f87171', orange: '#fb923c', pink: '#f472b6',
    dim: '#9aa6c8', line: '#26335c'
  };
  const PALETTE = [C.brand, C.brand2, C.accent, C.gold, C.pink, C.orange, C.green, C.red];

  function textColor() {
    return document.documentElement.getAttribute('data-theme') === 'light' ? '#16213e' : '#e8ecf7';
  }
  function gridColor() {
    return document.documentElement.getAttribute('data-theme') === 'light' ? 'rgba(30,50,90,.10)' : 'rgba(154,166,200,.12)';
  }
  function baseOpts(extra) {
    return Object.assign({
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { color: textColor(), boxWidth: 12, font: { size: 12 } } } },
      scales: {
        x: { ticks: { color: textColor() }, grid: { color: gridColor() } },
        y: { ticks: { color: textColor() }, grid: { color: gridColor() } }
      }
    }, extra || {});
  }
  function fmtAxis(v) { return SB.fmt(v, { compact: true }); }

  function make(id, cfg) {
    const el = document.getElementById(id);
    if (!el || typeof Chart === 'undefined') return null;
    if (charts[id]) { charts[id].destroy(); }
    charts[id] = new Chart(el.getContext('2d'), cfg);
    return charts[id];
  }

  // 1. Revenue breakdown doughnut
  function revenueDoughnut() {
    const r = SB.calc.revenueAt(1.0);
    const labels = ['AdSense', 'Direct Ads', 'Sponsorship', 'Memberships', 'Streaming', 'Other'];
    const data = [r.adsense, r.direct, r.sponsorship, r.memberships, r.streaming, r.other];
    make('chartRevenue', {
      type: 'doughnut',
      data: { labels, datasets: [{ data, backgroundColor: PALETTE, borderColor: gridColor(), borderWidth: 2 }] },
      options: baseOpts({
        cutout: '62%',
        plugins: {
          legend: { position: 'right', labels: { color: textColor(), boxWidth: 12, font: { size: 12 } } },
          tooltip: { callbacks: { label: c => c.label + ': ' + SB.fmt(c.raw) } }
        }
      })
    });
  }

  // 2. Revenue projection (12 months ramp) — stacked bar by stream
  function projectionChart() {
    const s = SB.state;
    const labels = ['M1','M3','M6','M9','M12','Y2','Y3','Y5'];
    const fracs = [0.03, 0.10, 0.35, 0.65, 1.0, 2.1, 3.8, 8.5];
    const streams = ['adsense','direct','sponsorship','memberships','streaming','other'];
    const names = ['AdSense','Direct Ads','Sponsorship','Memberships','Streaming','Other'];
    const datasets = streams.map((key, i) => ({
      label: names[i],
      data: fracs.map(fr => SB.calc.revenueAt(fr)[key]),
      backgroundColor: PALETTE[i], borderRadius: 4
    }));
    make('chartProjection', {
      type: 'bar',
      data: { labels, datasets },
      options: baseOpts({
        scales: {
          x: { stacked: true, ticks: { color: textColor() }, grid: { color: gridColor() } },
          y: { stacked: true, ticks: { color: textColor(), callback: fmtAxis }, grid: { color: gridColor() } }
        },
        plugins: { legend: { labels: { color: textColor(), boxWidth: 12, font: { size: 11 } } } }
      })
    });
  }

  // 3. P&L waterfall (simplified stacked bar)
  function pnlChart() {
    const p = SB.calc.pnl();
    const steps = ['Revenue', 'OpEx', 'Depreciation', 'Tax', 'Net Profit'];
    const vals = [p.rev.totalRev, -p.opex, -p.depr, -p.tax];
    const colors = [C.green, C.red, C.red, C.red, p.net >= 0 ? C.brand : C.red];
    make('chartPnl', {
      type: 'bar',
      data: {
        labels: steps,
        datasets: [{
          data: vals.concat([p.net]),
          backgroundColor: colors, borderRadius: 5
        }]
      },
      options: baseOpts({
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => SB.fmt(c.raw) } } },
        scales: { y: { ticks: { color: textColor(), callback: fmtAxis }, grid: { color: gridColor() } } }
      })
    });
  }

  // 4. Break-even chart: revenue line vs total cost line across pageviews
  function breakEvenChart() {
    const be = SB.calc.breakEven();
    const s = SB.state;
    const maxPV = Math.max(be.bePV * 2, s.pvMonth12 * 1.2, 100000);
    const pts = [];
    for (let i = 0; i <= 10; i++) {
      const pv = maxPV * i / 10;
      const rev = pv / 1000 * s.adsensePageRPM;
      const cost = be.fixed + rev * be.variableRatio;
      pts.push({ pv, rev, cost });
    }
    make('chartBreakEven', {
      type: 'line',
      data: {
        labels: pts.map(p => SB.fmtNum(p.pv / 1000) + 'k'),
        datasets: [
          { label: 'Revenue', data: pts.map(p => p.rev), borderColor: C.green, backgroundColor: 'rgba(52,211,153,.12)', fill: true, tension: .3 },
          { label: 'Total Cost', data: pts.map(p => p.cost), borderColor: C.red, backgroundColor: 'rgba(248,113,113,.10)', fill: true, tension: .3 }
        ]
      },
      options: baseOpts({
        plugins: { legend: { labels: { color: textColor() } }, tooltip: { callbacks: { label: c => c.dataset.label + ': ' + SB.fmt(c.raw) } } },
        scales: { x: { title: { display: true, text: 'Monthly Pageviews (000s)', color: textColor() }, ticks: { color: textColor() }, grid: { color: gridColor() } },
                  y: { ticks: { color: textColor(), callback: fmtAxis }, grid: { color: gridColor() } } }
      })
    });
  }

  // 5. ROI cumulative
  function roiChart() {
    const r = SB.calc.roi();
    make('chartRoi', {
      type: 'line',
      data: {
        labels: r.points.map(p => 'M' + p.m),
        datasets: [
          { label: 'Cumulative Revenue', data: r.points.map(p => p.cumRev), borderColor: C.green, backgroundColor: 'rgba(52,211,153,.10)', fill: true, tension: .25 },
          { label: 'Cumulative Expense', data: r.points.map(p => p.cumExp), borderColor: C.red, backgroundColor: 'rgba(248,113,113,.08)', fill: true, tension: .25 },
          { label: 'Cumulative Profit', data: r.points.map(p => p.cumProfit), borderColor: C.brand, backgroundColor: 'rgba(45,212,191,.12)', fill: true, tension: .25 }
        ]
      },
      options: baseOpts({
        plugins: { legend: { labels: { color: textColor(), boxWidth: 12 } }, tooltip: { callbacks: { label: c => c.dataset.label + ': ' + SB.fmt(c.raw) } } },
        scales: { y: { ticks: { color: textColor(), callback: fmtAxis }, grid: { color: gridColor() } } }
      })
    });
  }

  // 6. Startup cost doughnut
  function startupChart() {
    const st = SB.state.startup;
    const labels = Object.keys(st).map(k => k.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase()));
    const data = Object.values(st);
    make('chartStartup', {
      type: 'doughnut',
      data: { labels, datasets: [{ data, backgroundColor: PALETTE.concat([C.dim]), borderColor: gridColor(), borderWidth: 2 }] },
      options: baseOpts({
        cutout: '58%',
        plugins: { legend: { position: 'right', labels: { color: textColor(), boxWidth: 11, font: { size: 10 } } },
                   tooltip: { callbacks: { label: c => c.label + ': ' + SB.fmt(c.raw) } } }
      })
    });
  }

  // 7. Valuation methods comparison
  function valuationChart() {
    const v = SB.calc.valuation();
    make('chartValuation', {
      type: 'bar',
      data: {
        labels: ['Revenue ×', 'EBITDA ×', 'DCF', 'Asset'],
        datasets: [{ data: [v.revMethod, v.ebitdaMethod, v.dcf, v.assetMethod],
          backgroundColor: [C.brand, C.brand2, C.accent, C.gold], borderRadius: 6 }]
      },
      options: baseOpts({
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => SB.fmt(c.raw) } } },
        scales: { y: { ticks: { color: textColor(), callback: fmtAxis }, grid: { color: gridColor() } } }
      })
    });
  }

  // 8. Cap table doughnuts (before / after)
  function capChart() {
    const rows = SB.calc.capAfterRound();
    const labels = rows.map(r => r.name);
    const afterData = rows.map(r => r.after);
    const beforeData = rows.map(r => r.before).filter(v => v > 0);
    const beforeLabels = rows.filter(r => r.before > 0).map(r => r.name);
    make('chartCapAfter', {
      type: 'doughnut',
      data: { labels, datasets: [{ data: afterData, backgroundColor: PALETTE.concat([C.dim]), borderColor: gridColor(), borderWidth: 2 }] },
      options: baseOpts({ cutout: '58%', plugins: { legend: { position: 'right', labels: { color: textColor(), boxWidth: 11, font: { size: 10 } } },
        tooltip: { callbacks: { label: c => c.label + ': ' + c.raw.toFixed(2) + '%' } } } })
    });
  }

  // 9. OpEx breakdown
  function opexChart() {
    const o = SB.state.opex;
    const labels = Object.keys(o).map(k => k.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase()));
    const data = Object.values(o);
    make('chartOpex', {
      type: 'doughnut',
      data: { labels, datasets: [{ data, backgroundColor: PALETTE.concat([C.dim]), borderColor: gridColor(), borderWidth: 2 }] },
      options: baseOpts({ cutout: '58%', plugins: { legend: { position: 'right', labels: { color: textColor(), boxWidth: 10, font: { size: 9 } } },
        tooltip: { callbacks: { label: c => c.label + ': ' + SB.fmt(c.raw) } } } })
    });
  }

  // 10. Projection (forecast section, id chartProjection2)
  function projectionChart2() {
    const labels = ['M1','M3','M6','M9','M12','Y2','Y3','Y5'];
    const fracs = [0.03, 0.10, 0.35, 0.65, 1.0, 2.1, 3.8, 8.5];
    const streams = ['adsense','direct','sponsorship','memberships','streaming','other'];
    const names = ['AdSense','Direct Ads','Sponsorship','Memberships','Streaming','Other'];
    const datasets = streams.map((key, i) => ({
      label: names[i], data: fracs.map(fr => SB.calc.revenueAt(fr)[key]),
      backgroundColor: PALETTE[i], borderRadius: 4
    }));
    make('chartProjection2', {
      type: 'bar', data: { labels, datasets },
      options: baseOpts({
        scales: {
          x: { stacked: true, ticks: { color: textColor() }, grid: { color: gridColor() } },
          y: { stacked: true, ticks: { color: textColor(), callback: fmtAxis }, grid: { color: gridColor() } }
        },
        plugins: { legend: { labels: { color: textColor(), boxWidth: 12, font: { size: 11 } } } }
      })
    });
  }

  // 11. OpEx breakdown (profit-loss section, id chartOpex2)
  function opexChart2() {
    const o = SB.state.opex;
    const labels = Object.keys(o).map(k => k.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase()));
    const data = Object.values(o);
    make('chartOpex2', {
      type: 'doughnut',
      data: { labels, datasets: [{ data, backgroundColor: PALETTE.concat([C.dim]), borderColor: gridColor(), borderWidth: 2 }] },
      options: baseOpts({ cutout: '58%', plugins: { legend: { position: 'right', labels: { color: textColor(), boxWidth: 10, font: { size: 9 } } },
        tooltip: { callbacks: { label: c => c.label + ': ' + SB.fmt(c.raw) } } } })
    });
  }

  // 12. Revenue mix (financial-planning revenue tab, id chartRevMix)
  function revenueMixChart() {
    const r = SB.calc.revenueAt(1.0);
    const labels = ['AdSense','Direct Ads','Sponsorship','Memberships','Streaming','Other'];
    const data = [r.adsense, r.direct, r.sponsorship, r.memberships, r.streaming, r.other];
    make('chartRevMix', {
      type: 'doughnut',
      data: { labels, datasets: [{ data, backgroundColor: PALETTE, borderColor: gridColor(), borderWidth: 2 }] },
      options: baseOpts({ cutout: '62%',
        plugins: { legend: { position: 'right', labels: { color: textColor(), boxWidth: 12, font: { size: 12 } } },
          tooltip: { callbacks: { label: c => c.label + ': ' + SB.fmt(c.raw) } } } })
    });
  }

  // ---- Render management ----
  const SECTION_CHARTS = {
    dashboard: [revenueDoughnut],
    'revenue-forecast': [projectionChart2, revenueDoughnut],
    'profit-loss': [pnlChart, opexChart2],
    'break-even': [breakEvenChart],
    'roi': [roiChart],
    'startup-investment': [startupChart],
    'company-valuation': [valuationChart],
    'founder-ownership': [capChart],
    'financial-planning': [revenueMixChart]
  };

  function renderFor(section) {
    if (typeof Chart === 'undefined') return;
    (SECTION_CHARTS[section] || []).forEach(fn => { try { fn(); } catch (e) {} });
  }

  function update() {
    // update existing charts in place where possible
    if (charts.chartRevenue) { const r = SB.calc.revenueAt(1.0); charts.chartRevenue.data.datasets[0].data = [r.adsense,r.direct,r.sponsorship,r.memberships,r.streaming,r.other]; charts.chartRevenue.update(); }
    if (charts.chartProjection) { projectionChart(); }
    if (charts.chartPnl) { pnlChart(); }
    if (charts.chartBreakEven) { breakEvenChart(); }
    if (charts.chartRoi) { roiChart(); }
    if (charts.chartStartup) { startupChart(); }
    if (charts.chartValuation) { valuationChart(); }
    if (charts.chartCapAfter) { capChart(); }
    if (charts.chartOpex) { opexChart(); }
    if (charts.chartProjection2) { projectionChart2(); }
    if (charts.chartOpex2) { opexChart2(); }
    if (charts.chartRevMix) { revenueMixChart(); }
  }
  function refresh() { update(); }

  SB.charts = { renderFor, update, refresh, _charts: charts };

  SB.onSectionShow = function (id) {
    // slight delay so section is visible for proper sizing
    setTimeout(() => renderFor(id), 60);
    // render mermaid flowcharts in that section
    if (SB.flows && SB.flows.renderFor) setTimeout(() => SB.flows.renderFor(id), 80);
  };

  document.addEventListener('DOMContentLoaded', () => {
    ready = true;
    // initial render of dashboard
    setTimeout(() => renderFor('dashboard'), 120);
  });
})();