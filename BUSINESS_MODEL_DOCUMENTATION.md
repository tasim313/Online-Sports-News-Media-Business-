# SportsScope — Business Model Documentation

**Online Sports News & Media Business — Complete Business Model, Financial Planning & Management System**

> **Nature of this document.** This is an *interactive planning and management tool*, not legal, tax, or investment advice. Every number in the application is an **illustrative, editable assumption**. Nothing is a guarantee of traffic, revenue, or returns. Replace illustrative inputs with real business data before making decisions.

---

## 1. What this is

SportsScope is a single-page business-intelligence application (HTML5 + CSS3 + vanilla JavaScript + Chart.js + Mermaid.js) that lets a founder, co-founder, partner, or investor explore the full lifecycle of an **Online Sports News & Media Company** with a **Bangladesh & South Asia** core and international reach.

It covers 24 sections:

1. Executive Dashboard
2. Business Overview
3. Market Research
4. Business Models
5. Revenue Opportunities
6. Startup Investment
7. Financial Planning
8. Revenue Forecast
9. Profit & Loss
10. Break-Even Analysis
11. ROI Analysis
12. Founder & Ownership
13. Investor Management
14. Funding Strategy
15. Operational Workflow
16. Business Architecture
17. Policies & Compliance
18. KPI Monitoring
19. Risk Management
20. Business Lifecycle
21. Expansion Strategy
22. Company Valuation
23. Exit Strategy
24. Implementation Roadmap

## 2. How to use it

1. Open `index.html` in any modern browser (no build step, no backend).
2. Use the **sidebar** to navigate the 24 sections.
3. Set the **scenario** (Conservative / Realistic / Optimistic) and **currency** (BDT ৳ default / USD) in the top bar.
4. Go to **Financial Planning** and edit any assumption. Every chart, KPI, calculator and table recalculates instantly.
5. Use **Export** for a text financial summary, **Export JSON** for all assumptions, and **Print** for a printable business plan.
6. Assumptions persist in the browser via `localStorage`. Use **Reset Defaults** to restore illustrative values.

## 3. Design

- Premium dark/light dashboard (toggle 🌗 in the top bar).
- Responsive: sidebar collapses to a hamburger on tablet/mobile.
- Print stylesheet renders every section for PDF export.

## 4. Files

| File | Purpose |
|------|---------|
| `index.html` | App shell, 24 sections, all content |
| `assets/css/style.css` | Premium BI dashboard styling, responsive + print |
| `assets/js/app.js` | Namespace, persistent state, currency, navigation, tabs, accordion, export/print |
| `assets/js/calculators.js` | Financial engine (revenue, opex, P&L, break-even, ROI, runway, valuation, cap table) |
| `assets/js/charts.js` | Chart.js visualisations, live-updating |
| `assets/js/flowcharts.js` | 18 Mermaid workflow diagrams |
| `assets/js/content.js` | Dynamic tables, editable input grids, policy accordion, KPI & risk tables |
| `FINANCIAL_ASSUMPTIONS.md` | Every assumption and formula |
| `POLICIES_AND_COMPLIANCE.md` | Policy framework + Bangladesh legal context |
| `SOURCES_AND_RESEARCH.md` | Sources, competitor notes, research log |

## 5. Financial model (summary)

All monetary inputs are stored in **USD** internally and displayed in the selected currency (BDT default, rate editable). Key formulas:

- **AdSense revenue** = Pageviews ÷ 1000 × Page RPM
- **Ad impressions** = Pageviews × Impressions/Page × Fill Rate
- **Total revenue** = AdSense + Direct + Sponsorship + Memberships + Streaming + Other
- **EBITDA** = Total revenue − Operating expenses
- **Net profit** = EBITDA − Depreciation − Interest − Tax
- **Break-even revenue** = Fixed costs ÷ Contribution margin
- **ROI %** = Cumulative profit ÷ Initial investment
- **Runway** = Cash ÷ Monthly net burn

See `FINANCIAL_ASSUMPTIONS.md` for the complete list and the ramp/stage assumptions.

## 6. Important limitations

- **No fabricated performance.** The dashboard shows *projections from assumptions*, never fake "actuals".
- **No guaranteed outcomes.** Conservative/Realistic/Optimistic are scenario multipliers, not promises.
- **Legal & copyright.** The tool repeatedly warns: never restream copyrighted sports without rights; comply with AdSense policy; sample policies are not legal advice.
- **Local quotations required** for legal, office, equipment and registration costs.
- **No gambling/betting** or prohibited financial models are included.

## 7. Validation

The financial engine was validated with a Node test harness (30 checks, all passing) covering every formula (AdSense, direct, sponsorship, totals, opex stages, startup, depreciation, P&L, break-even, ROI, valuation incl. DCF, cap-table dilution, runway, currency formatting) and a full render pass of all modules. See `test_formulas.js` (development artifact).