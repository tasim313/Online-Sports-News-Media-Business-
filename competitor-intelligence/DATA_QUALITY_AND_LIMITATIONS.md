# Data Quality & Limitations

## No fabrication (mandatory)
Never invent: revenue, AdSense earnings, traffic, employee counts, sponsorship contracts, ad rates, acquisition values, historical financials. Missing data stays **Unknown**.

## Data classes
- **Confirmed** — audited/filed.
- **Disclosed** — public/observable, not audited.
- **Estimate** — third-party or modeled (labeled).
- **Unknown** — no reliable data (default).

## Historical rules
- Do not fill missing years with fabricated figures.
- Do not interpolate without labeling.
- Do not mix parent-company and subsidiary figures.
- Do not compare different reporting periods without noting it.
- Do not confuse gross vs net revenue; advertising vs AdSense; traffic vs monetized pageviews.

## What this app does NOT do
- No live Google Trends / Search Console / AdSense connection (no credentials).
- No private Google Analytics data.
- No per-publisher AdSense earnings.

## Known limitations
- Company facts are high-level/observable; verify specifics at source.
- Financial/traffic/employee numbers are intentionally blank (Unknown) until sourced.
- Scorecard & rankings are **analyst judgment** (transparent heuristic), not measured performance.

## How to add data responsibly
1. Enter sourced figures in the 10-Year Financial table (note currency/unit).
2. Classify each as Confirmed/Disclosed/Estimate.
3. Cite source in `RESEARCH_SOURCES.md`.
4. Never back-fill unknowns with guesses.