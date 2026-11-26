/* ==========================================================================
   SportsScope — competitor-intelligence / financial-analysis.js
   Growth, CAGR, margins computed ONLY from entered (sourced) data.
   Missing data -> null (Unknown), never fabricated.
   ========================================================================== */
(function () {
  'use strict';
  const $ = (s) => document.querySelector(s);
  function val(d, y, f) { return d && d[y] && d[y][f] != null ? d[y][f] : null; }
  function growth(cur, prev) { if (cur == null || prev == null || prev === 0) return null; return (cur - prev) / prev; }
  function cagr(first, last, n) { if (first == null || last == null || first <= 0 || n <= 0) return null; return Math.pow(last / first, 1 / n) - 1; }
  function margin(part, total) { if (part == null || total == null || total === 0) return null; return part / total; }
  function pct(x) { return x == null ? '—' : (x * 100).toFixed(1) + '%'; }

  function analyze(comp) {
    const d = RI.state.fin[comp] || {};
    const years = RI.YEARS;
    const rev = years.map(y => val(d, y, 'revenue'));
    const first = rev.find(x => x != null);
    const last = rev.slice().reverse().find(x => x != null);
    const firstY = years[rev.indexOf(first)], lastY = years[rev.indexOf(last)];
    const n = (firstY != null && lastY != null) ? (parseInt(lastY) - parseInt(firstY)) : 0;
    return {
      revCagr: cagr(first, last, n),
      advShare: margin(val(d, lastY, 'advertising'), last),
      subShare: margin(val(d, lastY, 'subscription'), last),
      opMargin: margin(val(d, lastY, 'opProfit'), last),
      netMargin: margin(val(d, lastY, 'netProfit'), last)
    };
  }

  function render() {
    const host = $('#finAnalysisOut'); if (!host) return;
    const comp = $('#finCompany') ? $('#finCompany').value : 'The New York Times';
    const a = analyze(comp);
    const anyData = Object.keys(RI.state.fin[comp] || {}).length > 0;
    if (!anyData) { host.innerHTML = '<div class="notice warn"><span class="n-ico">⚠️</span><div>No sourced financial data entered for <strong>' + comp + '</strong>. Metrics show — (Unknown). Enter verified figures in the table above; nothing is fabricated.</div></div>'; return; }
    host.innerHTML =
      '<div class="grid c4">' +
      '<div class="kpi"><div class="k-label">Revenue CAGR</div><div class="k-value">' + pct(a.revCagr) + '</div></div>' +
      '<div class="kpi"><div class="k-label">Ad Share</div><div class="k-value">' + pct(a.advShare) + '</div></div>' +
      '<div class="kpi"><div class="k-label">Subscription Share</div><div class="k-value">' + pct(a.subShare) + '</div></div>' +
      '<div class="kpi"><div class="k-label">Operating Margin</div><div class="k-value">' + pct(a.opMargin) + '</div></div>' +
      '<div class="kpi"><div class="k-label">Net Margin</div><div class="k-value">' + pct(a.netMargin) + '</div></div>' +
      '</div>' +
      '<p class="xsmall muted mt8">Formulas: growth=(cur−prev)/prev; CAGR=(last/first)^(1/n)−1; margin=part/total. Blank inputs are Unknown.</p>';
  }

  RI.finCalc = { analyze, render };
  RI.updateFinChart = function (c) { if (RI.charts) RI.charts.updateFin(c); render(); };
  document.addEventListener('DOMContentLoaded', () => setTimeout(render, 160));
})();