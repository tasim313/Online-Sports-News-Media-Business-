# SportsScope — Online Sports News & Media Business Model

A complete, interactive **business planning, financial planning & management system** for launching and operating an **Online Sports News & Media Company** (Bangladesh & South Asia focus, international reach).

Built as a single-page business-intelligence dashboard with **HTML5, CSS3, vanilla JavaScript, Chart.js and Mermaid.js** — no backend required. Every number is an **editable planning assumption**, not a guarantee.

> ⚠️ **Not legal, tax, or financial advice.** All figures are illustrative and must be replaced with real business data before making decisions. No gambling/betting or prohibited financial models are included.

---

## ✨ Features

- **32 business sections** covering the full lifecycle: idea → validation → startup → growth → expansion → maturity → exit, plus startup strategy, Google Trends/keyword research, content strategy, employee/HR management, marketing, broadcasting-rights register and a decision engine.
- **Live financial calculators** — revenue, OpEx, P&L, break-even, ROI, runway, valuation (revenue/EBITDA/DCF/asset), cap-table dilution, **employee cost**, **AdSense (geo/device/category)**, **sponsorship pricing**, **cash flow**, **marketing budget**.
- **Broadcasting-rights register** with auto status (Cleared / Review / Blocked).
- **Decision engine** producing automated recommendations from your assumptions.
- **Content-opportunity scoring** and **CSV export** of tables.
- **Interactive charts** (Chart.js) that update instantly when assumptions change.
- **18+ Mermaid flowcharts** for editorial, advertising, AdSense, sponsorship, streaming, subscription, financial, investor, profit, break-even, risk, expansion, acquisition and exit workflows.
- **Editable assumptions** persisted in `localStorage`; BDT (৳) default with USD toggle and editable FX rate.
- **Scenario switch** (Conservative / Realistic / Optimistic).
- **Export** financial summary, **Export JSON** assumptions, **Print** to PDF.
- **Responsive** dark/light dashboard (mobile, tablet, desktop).
- **Policy framework** (29 policies) with Bangladesh legal context and international considerations.
- **KPI monitoring** and **risk register / SWOT**.

---

## 🚀 Getting Started

No build step. Just open `index.html` in any modern browser.

```bash
# from the repository root
xdg-open index.html      # Linux
# open index.html        # macOS
# start index.html       # Windows
```

Or serve locally:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

---

## 📁 Project Structure

```
.
├── index.html                         # App shell, 24 sections, all content
├── assets/
│   ├── css/
│   │   └── style.css                  # Premium BI dashboard styling (responsive + print)
│   └── js/
│       ├── app.js                     # State, localStorage, currency, navigation, export/print
│       ├── calculators.js             # Financial engine (revenue, P&L, break-even, ROI, valuation, cap table)
│       ├── charts.js                  # Chart.js visualisations (live-updating)
│       ├── flowcharts.js              # 18+ Mermaid workflow diagrams
│       ├── content.js                 # Dynamic tables, editable inputs, policy accordion, KPI/risk tables
│       └── extended.js                # Employee/HR, rights register, decision engine, AdSense/sponsorship/mktg calculators, CSV
├── BUSINESS_MODEL_DOCUMENTATION.md    # How the model works
├── FINANCIAL_ASSUMPTIONS.md           # Every assumption and formula
├── POLICIES_AND_COMPLIANCE.md         # Policy framework + legal context
├── SOURCES_AND_RESEARCH.md            # Sources, competitor notes, research log
└── README.md
```

---

## 🧮 Financial Model (summary)

Internal currency is **USD**; displayed in **BDT (৳)** by default (editable rate).

| Metric | Formula |
|--------|---------|
| AdSense revenue | `Pageviews ÷ 1000 × Page RPM` |
| Ad impressions | `Pageviews × Impressions/Page × Fill Rate` |
| Total revenue | `AdSense + Direct + Sponsorship + Memberships + Streaming + Other` |
| EBITDA | `Revenue − Operating Expenses` |
| Net profit | `EBITDA − Depreciation − Interest − Tax` |
| Break-even revenue | `Fixed Costs ÷ Contribution Margin` |
| ROI % | `Cumulative Profit ÷ Initial Investment` |
| Runway | `Cash ÷ Monthly Net Burn` |

See [`FINANCIAL_ASSUMPTIONS.md`](FINANCIAL_ASSUMPTIONS.md) for the complete list, ramp and stage assumptions.

---

## 🧭 Sections

1. Executive Dashboard · 2. Business Overview · 3. Market Research · 4. Business Models · 5. Revenue Opportunities · 6. Startup Investment · 7. Financial Planning · 8. Revenue Forecast · 9. Profit & Loss · 10. Break-Even Analysis · 11. ROI Analysis · 12. Founder & Ownership · 13. Investor Management · 14. Funding Strategy · 15. Operational Workflow · 16. Business Architecture · 17. Policies & Compliance · 18. KPI Monitoring · 19. Risk Management · 20. Business Lifecycle · 21. Expansion Strategy · 22. Company Valuation · 23. Exit Strategy · 24. Implementation Roadmap

---

## ✅ Validation

The financial engine is validated by an automated Node test harness (`test_formulas.js`) — **30/30 checks pass**, covering every formula and a full render pass of all modules.

```bash
node test_formulas.js
```

---

## 📚 Documentation

- [`BUSINESS_MODEL_DOCUMENTATION.md`](BUSINESS_MODEL_DOCUMENTATION.md) — overview & usage
- [`FINANCIAL_ASSUMPTIONS.md`](FINANCIAL_ASSUMPTIONS.md) — assumptions & formulas
- [`POLICIES_AND_COMPLIANCE.md`](POLICIES_AND_COMPLIANCE.md) — policies & legal context
- [`SOURCES_AND_RESEARCH.md`](SOURCES_AND_RESEARCH.md) — sources & research log

---

## 🛠️ Tech Stack

HTML5 · CSS3 · Vanilla JavaScript · [Chart.js](https://www.chartjs.org/) v4 · [Mermaid.js](https://mermaid.js.org/) v10

---

## 📄 License

MIT — see [LICENSE](LICENSE) (to be added).

---

## ⚠️ Disclaimer

This project is a planning and educational tool. It does **not** constitute legal, financial, or investment advice, does not fabricate statistics or competitor financials, and does not promise earnings. Consult qualified professionals and verify all data before real-world use.