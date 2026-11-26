# Google AdSense Research

> **Critical rule:** Google does not publish per-publisher AdSense earnings. Never claim a competitor earns a specific AdSense amount unless a credible source explicitly discloses it.

## Three separate measurements (never combine)
1. **Verified AdSense Revenue** — only credible disclosures. In this dataset: **none verified**.
2. **Estimated Advertising Revenue** — modeled from traffic × RPM; always labeled **Estimate**; never presented as actual.
3. **Total Company Advertising Revenue** — from filings where public; otherwise **Unknown**.

## AdSense vs Google ad tech
“Uses Google ad tech” ≠ “uses AdSense”. Distinct: AdSense, Ad Manager (DFP), AdX, header bidding, Prebid, private marketplace, direct-sold.

## What is observable
Most large publishers use Google ad technology in some form; whether **AdSense specifically** is used is usually **Unknown** (not disclosed). The app classifies AdSense usage as **Unknown** by default.

## Estimation model (for a NEW portal, hypothetical)
- Page-based: `Pageviews/1000 × Page RPM`
- Impression-based: `Monetized impressions/1000 × Impression RPM`
- Do **not** combine both (double counting). Use one method.
- RPM varies by geography, device, content, seasonality, setup.
- Use the **AdSense calculator** in the main business app (geo/device/category multipliers).

## Benchmarking
Compare estimated opportunity vs competitor **audience scale** only where reliable. Do not reverse-engineer private AdSense income and present it as actual.

## Source
See `RESEARCH_SOURCES.md`. Limitations: `DATA_QUALITY_AND_LIMITATIONS.md`.