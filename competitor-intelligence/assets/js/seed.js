/* ==========================================================================
   SportsScope — competitor-intelligence / seed.js
   Populates qualitative tables (advertising, adsense, traffic, seo, subs,
   streaming, ownership, history, startup answers) and summary counts.
   No fabricated numbers — Unknown where data is absent.
   ========================================================================== */
(function () {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const ST = RI.STLABEL, SB = RI.STBADGE;

  function advModel(c) {
    if (/Broadcast/.test(c.cat)) return 'Broadcast + rights + subscription';
    if (/Subscription/.test(c.cat)) return 'Subscription (limited ads)';
    if (c.m.some(m => /Programmatic/.test(m))) return 'Programmatic + direct';
    if (c.m.some(m => /Direct/.test(m))) return 'Direct + display';
    return 'Display';
  }
  function fill(id, rows) {
    const el = document.getElementById(id); if (!el) return;
    el.innerHTML = rows.map(r => '<tr>' + r.map(c => '<td>' + c + '</td>').join('') + '</tr>').join('');
  }

  function render() {
    // executive counts
    $('#esCount').textContent = COMPETITORS.length;
    $('#esCats').textContent = COMPETITOR_META.CATEGORIES.length;
    $('#esCountries').textContent = COMPETITOR_META.COUNTRIES.length;

    // advertising
    fill('advBody', COMPETITORS.map(c => [c.n, advModel(c), c.m.some(m => /Direct/.test(m)) ? 'Yes' : 'Unknown', c.m.some(m => /Programmatic/.test(m)) ? 'Yes' : 'Unknown', '<span class="badge gray">Unknown magnitude</span>']));

    // adsense investigation
    fill('adsenseBody', COMPETITORS.map(c => [c.n, 'Uses Google ad tech (observable, unverified)', '<span class="badge gray">Unknown</span>']));

    // traffic (all Unknown — no private data)
    fill('trafficBody', COMPETITORS.slice(0, 20).map(c => [c.n, 'Unknown', '—', '<span class="badge gray">Unknown</span>']));

    // seo (qualitative)
    fill('seoBody', COMPETITORS.filter(c => c.cat === 'Direct sports media' || c.cat === 'Sports broadcaster').slice(0, 14).map(c => [c.n, c.cat === 'Direct sports media' ? 'High-volume news/scores, structured data' : 'Brand + video, Discover', '<span class="badge gold">Analyst</span>']));

    // subscription
    fill('subBody', COMPETITORS.filter(c => c.m.some(m => /Subscription/.test(m))).map(c => [c.n, '<span class="badge green">Yes</span>', c.note]));

    // streaming
    fill('streamBody', COMPETITORS.filter(c => c.cat === 'Sports broadcaster' || c.m.some(m => /Streaming|OTT/i.test(m))).map(c => [c.n, '<span class="badge green">Yes</span>', advModel(c)]));

    // ownership
    fill('ownBody', COMPETITORS.filter(c => c.p && c.p !== '—').map(c => [c.n, c.p, c.note]));

    // history timeline (qualitative, no fabricated years)
    const tl = document.getElementById('historyTimeline');
    if (tl) {
      const items = [
        ['2016', 'Digital sports & news accelerate; mobile-first; programmatic + direct layer onto AdSense.'],
        ['2018–19', 'Subscription wave (The Athletic founded 2016, grows); broadcasters double down on streaming.'],
        ['2020', 'COVID accelerates digital consumption; ad market softens then recovers.'],
        ['2021–22', 'Consolidation: The Athletic acquired by NYT (2022); rights costs rise.'],
        ['2023–25', 'AI-assisted content, privacy changes, diversification to memberships/data.'],
        ['2026 YTD', 'Continued shift to owned audience + diversified revenue.']
      ];
      tl.innerHTML = items.map(i => '<div class="tl-item"><div class="tl-stage">' + i[0] + '</div><div class="tl-desc">' + i[1] + '</div></div>').join('');
    }

    // startup answers
    const ans = [
      'Study most: Cricbuzz, Prothom Alo, ESPNcricinfo, BBC Sport.',
      'Avoid direct: rights-heavy broadcasting, global football scale.',
      'Niches: Bangladesh local sports, women\'s sport, grassroots/academies.',
      'Geo: Bangladesh core → South Asia → international (English).',
      'Language: Bangla-first, English for reach.',
      'Formats: news + previews/reports + evergreen + data.',
      'First revenue: AdSense (after approval) + affiliate.',
      'Ad model: AdSense → direct → programmatic (Ad Manager).',
      'First 10k visitors: SEO + Google Discover + social + newsletter.',
      'First advertisers: local telecom/beverage/sportswear via media kit.',
      'Hire: when cash flow supports (lean start).',
      'Video: after audience + editing capacity.',
      'Streaming: only with licensed/owned content.',
      'Investment: after traction & predictable growth.',
      'Moat: trust, verification, owned audience, local depth.'
    ];
    const sl = document.getElementById('startupList');
    if (sl) sl.innerHTML = ans.map((a, i) => '<li><strong>' + (i + 1) + '.</strong> ' + a + '</li>').join('');
  }

  RI.seed = { render };
  document.addEventListener('DOMContentLoaded', () => setTimeout(render, 120));
})();