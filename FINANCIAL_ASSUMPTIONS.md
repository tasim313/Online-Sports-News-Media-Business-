# Financial Assumptions & Formulas

> **All values are illustrative, editable planning assumptions — not forecasts or guarantees.** Internal currency is USD; display currency is BDT (৳) by default with an editable USD→BDT rate. Replace with real data before decisions.

## 1. Global assumptions

| Key | Default | Meaning |
|-----|---------|---------|
| `currency` | BDT | Display currency (BDT/USD) |
| `usdRate` | 122 | BDT per 1 USD (illustrative) |
| `scenario` | realistic | conservative / realistic / optimistic |
| `taxRate` | 0.25 | Tax on positive taxable income |
| `depreciationMonths` | 36 | Straight-line depreciation period |
| `cashBalance` | 25000 | Cash on hand (USD) |
| `reserveMonths` | 3 | Target OpEx reserve (decision threshold) |

**Scenario multipliers** (applied to traffic & demand-driven revenue): conservative **0.6**, realistic **1.0**, optimistic **1.6**.

## 2. Traffic & advertising

| Key | Default | Meaning |
|-----|---------|---------|
| `pvMonth12` | 600000 | Monthly pageviews at month 12 |
| `pagesPerSession` | 1.8 | Engagement depth |
| `adsensePageRPM` | 1.10 | USD revenue per 1,000 pageviews (geo-mixed) |
| `adImpressionsPerPage` | 2.4 | Ad units per pageview |
| `adsenseFillRate` | 0.92 | Fraction of ad requests filled |

**Formulas**
- AdSense revenue = `pageviews / 1000 × adsensePageRPM`
- Ad impressions = `pageviews × adImpressionsPerPage × adsenseFillRate`
- Page RPM blends geography, CTR, CPC and fill — **not all pageviews monetise equally**.

## 3. Revenue streams (USD)

| Key | Default | Meaning |
|-----|---------|---------|
| `directBannerPrice` | 320 | per placement / month |
| `directBannerCount` | 3 | placements |
| `sponsorGold` / `Count` | 1500 / 1 | Gold package |
| `sponsorSilver` / `Count` | 700 / 2 | Silver package |
| `sponsorBronze` / `Count` | 250 / 3 | Bronze package |
| `newsletterSponsorPrice` | 400 | newsletter sponsorship / month |
| `newsletterSubs` | 4000 | subscribers (context) |
| `premiumMembers` | 120 | paying members |
| `premiumPrice` | 4.5 | per member / month |
| `streamViewers` | 8000 | monthly live viewers |
| `streamRPM` | 2.2 | USD per 1,000 stream views |
| `affiliateRevenue` | 250 | / month |
| `merchRevenue` | 180 | / month |

**Scaling at traffic fraction `f` (× scenario multiplier `m`):**
- Direct = `price × count × min(1, 0.25 + f·0.75·m)`
- Sponsorship = `Σ(tier × count) × min(1, f·m)`
- Memberships = `newsletterSponsorPrice × min(1, 0.3 + f·m) + premiumMembers × premiumPrice × min(1, f·m)`
- Streaming = `streamViewers/1000 × streamRPM × min(1.5, max(0, f−0.3)·m)`
- Other = `(affiliate + merch) × min(1, f·m)`

## 4. Traffic ramp (fraction of Month-12 level)

| Milestone | Fraction |
|-----------|----------|
| M3 | 0.10 |
| M6 | 0.35 |
| M12 | 1.00 |
| Year 2 | 2.10 |
| Year 3 | 3.80 |
| Year 5 | 8.50 |

Ramp is an **assumption**, not a promise. Milestones should depend on actual performance.

## 5. Operating expenses (USD / month, standard stage)

Founder 1200, Editor 900, Journalists 2200, Video Editor 700, Social Manager 500, SEO 600, Developer 1100, Ad Manager 700, Hosting 120, CDN 90, APIs 150, Marketing 400, Office 250, Internet 60, Legal 150, Accounting 120, Equipment Maint. 40.

**Stage scaling:** Lean ×0.70, Standard ×1.00, Growth ×1.60.

## 6. Startup costs (USD, one-off)

Domain 15, Hosting 240, Development 3500, UI/UX 900, CMS 0, Security 300, CDN 120, APIs 200, Streaming Infra 1200, Camera 700, Microphone 180, Video Editing 400, Office 800, Internet 120, Legal 600, Licenses 150, Branding 500, Marketing 1200, Working Capital 5000.

**Mandatory** = domain, hosting, development, CMS, security, CDN, APIs, legal, licenses, branding, internet. Others are **optional/deferrable**. Local quotations required for legal, office, equipment.

## 7. P&L

- Gross Profit = Revenue (direct costs are within opex: hosting/CDN/APIs)
- EBITDA = Revenue − OpEx
- Depreciation = Depreciable base ÷ depreciationMonths (straight line)
- Taxable = max(0, EBITDA − Depreciation − Interest)
- Tax = Taxable × taxRate
- Net Profit = EBITDA − Depreciation − Interest − Tax
- Net Margin = Net Profit ÷ Revenue

Interest = 0 in base model (no debt). Financing costs kept separate from operations.

## 8. Break-even

- Fixed costs = OpEx(standard) + monthly Depreciation
- Variable ratio = 0.12 (CDN/API/payment fees) — adjustable assumption
- Contribution margin = 1 − variable ratio
- **Break-even revenue = Fixed ÷ Contribution margin**
- Break-even pageviews = `BE revenue / pageRPM × 1000` (AdSense-equivalent)
- Break-even Gold sponsors = `BE revenue / sponsorGold`
- Break-even subscribers = `BE revenue / premiumPrice`

## 9. ROI (36-month)

- Initial investment = Startup total
- Monthly revenue uses the ramp; OpEx uses lean (≤6m) / standard (7–12m) / growth (>12m)
- Cumulative profit = Σ(revenue − opex − depreciation)
- ROI % = Cumulative profit ÷ Initial investment
- Payback = first month cumulative running profit ≥ 0

## 10. Runway

- Monthly net burn = max(0, −EBITDA)
- Runway (months) = Cash ÷ burn (∞ if profitable)

## 11. Valuation

- Revenue method = Annual revenue × `revMultiple` (default 2.5)
- EBITDA method = Annual EBITDA × `ebitdaMultiple` (default 8)
- DCF = Σ 5-yr FCF discounted at `discountRate` (0.22) + terminal value at `terminalGrowth` (0.03); FCF proxy = max(0, annual EBITDA) × (1 − tax)
- Asset method = Depreciable base × 0.6 (conservative)

Multiples are illustrative; real valuations depend on growth, risk and comparables.

## 12. Cap table & dilution

- New investor pool % (`newRoundPct`, default 15) dilutes existing holders pro-rata: `post = pre × (1 − newPct/100)`.
- New investor receives `newPct` of post-round.
- Cap table always sums to 100% (validated).

## 13. Currency

- Internal USD. Display: BDT = USD × `usdRate`; USD = USD.
- Compact formatting (K/M) available on axes and cards.