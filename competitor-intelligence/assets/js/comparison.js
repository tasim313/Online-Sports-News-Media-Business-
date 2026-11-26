/* ==========================================================================
   SportsScope — competitor-intelligence / comparison.js
   Revenue-model comparison matrix + ranked lists (real dataset, no financials).
   ========================================================================== */
(function () {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const MODELS = ['Display ads', 'Direct ads', 'Programmatic', 'Subscription', 'Sponsorship', 'Live streaming', 'Broadcasting rights', 'Affiliate', 'Licensing', 'Events'];

  function hasModel(c, m) {
    if (m === 'Display ads') return c.m.some(x => /Display|Programmatic/.test(x));
    if (m === 'Direct ads') return c.m.some(x => /Direct/.test(x));
    if (m === 'Programmatic') return c.m.some(x => /Programmatic/.test(x));
    if (m === 'Live streaming') return c.m.some(x => /Streaming|OTT/i.test(x)) || c.cat === 'Sports broadcaster';
    if (m === 'Broadcasting rights') return c.m.some(x => /Rights|Broadcast/i.test(x));
    return c.m.some(x => x.toLowerCase().includes(m.toLowerCase().split(' ')[0]));
  }

  function renderMatrix() {
    const host = $('#modelMatrix'); if (!host) return;
    let html = '<div class="table-wrap"><table><thead><tr><th>Company</th>' + MODELS.map(m => '<th class="center">' + m + '</th>').join('') + '</tr></thead><tbody>';
    COMPETITORS.forEach(c => {
      html += '<tr><td><strong>' + c.n + '</strong></td>' + MODELS.map(m => '<td class="center">' + (hasModel(c, m) ? '<span class="badge green">●</span>' : '<span class="muted">—</span>') + '</td>').join('') + '</tr>';
    });
    html += '</tbody></table></div>';
    host.innerHTML = html;
  }

  function ranked() {
    // Top 10 lists by transparent, non-financial heuristics (labeled analyst judgment)
    const byReach = c => (c.r === 'Global' ? 3 : c.r === 'South Asia' ? 2 : 1) + (c.cat === 'Sports broadcaster' ? 2 : 0);
    const sports = COMPETITORS.filter(c => c.cat === 'Direct sports media' || c.cat === 'Sports broadcaster').map(c => ({ c, s: byReach(c) })).sort((a, b) => b.s - a.s).slice(0, 10);
    const subs = COMPETITORS.filter(c => c.m.some(m => /Subscription/.test(m))).slice(0, 10);
    const ad = COMPETITORS.filter(c => c.m.some(m => /Advertising|Display|Direct|Programmatic/.test(m))).slice(0, 10);
    const set = (id, arr) => { const el = document.getElementById(id); if (el) el.innerHTML = arr.map((x, i) => '<li>' + (i + 1) + '. ' + (x.c ? x.c.n : x.n) + ' <span class="xsmall muted">(' + (x.c ? x.c.cat : x.cat) + ')</span></li>').join(''); };
    set('rankSports', sports);
    set('rankSubs', subs);
    set('rankAds', ad);
    const n = document.getElementById('rankNote'); if (n) n.textContent = 'Rankings are analyst judgment from observable attributes (reach, category, model) — not measured financial performance.';
  }

  function render() { renderMatrix(); ranked(); }
  RI.comparison = { render };
  document.addEventListener('DOMContentLoaded', () => setTimeout(render, 170));
})();