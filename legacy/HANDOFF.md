# .shapers Revenue Dashboard — Claude Code Handoff

## What This Is
A single-file HTML dashboard (`index.html`) for .shapers that gives founders a live view of:
- **What's going in** — marketing spend by category
- **What's coming out** — revenue collected, contracted, ROI
- **Engine efficiency** — actuals vs KPI targets vs cost, conversion rates
- **Source breakdown** — which channels are producing
- **Revenue returns** — churn, client value, LTV, monthly totals

It's deployed on Netlify as a static file and embedded in GoHighLevel via iframe.

---

## Google Sheets Data Sources

All data comes from two published Google Sheets (CSV format). Both are already in the code.

### Sheet 1: Revenue Numbers
```
URL: https://docs.google.com/spreadsheets/d/e/2PACX-1vRZWIN50GPJbjDAhfvlLoBP5OGKIJXdDBU5TV98VwiWZscbXONpsQxVFHCbbCjoehsfgw9J0kuZVPrI/pub
GID: 584545953
Const: REVENUE_CSV
```
**Structure** — col A = row label, cols B–M = Jan–Dec values:
| Rows | Content |
|------|---------|
| Row 1 | Header (month names) |
| Rows 2–5 | Expense rows: Ad Spend, Staff/Contractors, Sales Commissions, Software |
| Row with label `total` | Sum of all expenses per month |
| Row with label `total cash collected` | Cash collected each month |
| Row with label `total cash contracted` | Cash contracted each month |
| Row with label `retention rate` | Monthly client retention % |
| Row with label `new clients` | New clients per month |
| Row with label `retained clients` | Retained clients per month |
| **Rows 6–23** | **Revenue Returns data (see below)** |

**Revenue Returns rows (rows 6–23) labels:**
- New Cash Collected
- New Customers
- New Clients
- Total Clients (1st)
- Churned Clients (31st)
- Client Churn Rate
- Customer Acquisition Cost
- Client Acquisition Cost
- Blended New Client ROI
- Monthly Revenue Total
- Monthly Avg. Client Value
- LTV
- LTV:CAC Ratio

### Sheet 2: Totals / Engine Results
```
URL: same base spreadsheet
GID: 1317245227
Const: TOTALS_CSV
```
**Structure** — col A = label, cols B–G = the 6 engine metrics:
| Row label | Maps to |
|-----------|---------|
| `totals` | Actuals row (cyan) |
| `max target` | KPI Targets row (gold) |
| `total cost` | Total Cost row (red) |

**Engine metric columns (B–G):**
1. Leads
2. 1st Meetings
3. Customer Sales
4. Client Sales
5. Client Retention %
6. Client LTV

> ⚠️ If the sheet adds a new row or renames a label, update the `findRow()` calls in `renderEngineFromTotals()`.

---

## Dashboard Sections (top to bottom)

| # | Section Label | Data Source | Key Function |
|---|--------------|-------------|--------------|
| 1 | Revenue Engine Overview | REVENUE_CSV | `renderRevenue()` — KPI cards |
| 2 | Monthly Flow — Spend vs Revenue | REVENUE_CSV | `buildFlowChart()` |
| 2 | Pipeline by Source | Static (hardcoded) | `buildSourceChart()` |
| 3 | Engine Results | TOTALS_CSV | `renderEngineFromTotals()` |
| 4 | Marketing Spend Breakdown | REVENUE_CSV | `buildExpenseTable()`, `buildSpendMix()` |
| 5 | Source Performance | Static (hardcoded) | HTML table |
| 6 | Client Performance | REVENUE_CSV | `buildRetentionChart()`, `buildClientChart()` |
| 7 | Revenue Returns | REVENUE_CSV (rows 6–23) | `renderReturns()` |

---

## Data Flow

```
Page load
  │
  ├─ renderStatic()          ← immediate: shows fallback data, no blank flash
  │
  └─ Promise.all([
       fetch(REVENUE_CSV),   ← Sheet 1
       fetch(TOTALS_CSV)     ← Sheet 2
     ])
       │
       ├─ parsedRevenue → renderRevenue()     (expenses, KPIs, charts)
       ├─ parsedRevenue → renderReturns()     (revenue returns section — SAME data)
       └─ parsedTotals  → renderEngineFromTotals()
  
Auto-refresh every 5 minutes via setInterval
```

---

## Key Design Decisions

### Why one file?
Netlify deploy = drag one file. No build step, no dependencies to break. The logo is base64-embedded so it travels with the file.

### Why label-based row matching (not row index)?
The sheet can have rows reordered or new rows added without breaking the dashboard. `findRow()` searches by the text in column A.

### Why static fallback data?
Google Sheets CSV fetch fails silently in some iframe/CORS contexts. Static data means the dashboard always looks populated — never broken.

### Why parsedRevenue passed to both renderRevenue and renderReturns?
Revenue Returns rows (6–23) live in the same sheet as expenses. One fetch, two renderers. The `returnsLabels` skip list in `renderRevenue()` prevents those rows from appearing in the expense table.

---

## Deployment

1. Make changes to `index.html`
2. Go to [app.netlify.com/drop](https://app.netlify.com/drop)
3. Drag `index.html` onto the page
4. It replaces the existing deployment at the same URL

Current live URL: `https://gorgeous-narwhal-6232b1.netlify.app/`

GoHighLevel embed:
```html
<iframe src="https://gorgeous-narwhal-6232b1.netlify.app/" width="100%" height="900px" frameborder="0"></iframe>
```

---

## Known Issues / Things to Fix

- **Source Performance table** (Section 5 — Demand Capture) is **hardcoded static data**. It needs to be wired to a live sheet when that data is available.
- **Pipeline by Source doughnut** (Section 2) is also **hardcoded**. Same fix needed.
- **Engine Results** reads from `TOTALS_CSV` (gid=1317245227). Simon mentioned moving this data to the main Revenue Numbers sheet — if that happens, update `renderEngineFromTotals()` to read from `REVENUE_CSV` and remove the `TOTALS_CSV` fetch.
- **Revenue Returns rows** (6–23) rely on exact label matches. If Simon renames a row in the sheet (e.g. "Monthly Avg. Client Value" → "Avg Client Value"), update the `findExact()` call in `renderReturns()`.
- **`#DIV/0!` values** from sheet formulas are suppressed to `—`. If a cell returns a different error string, add it to the filter in `renderReturns()`.

---

## Brand / Design

- **Fonts:** DM Sans (body) + DM Mono (labels, numbers, tables) — loaded from Google Fonts
- **Colour palette:** defined as CSS variables at the top of `<style>`
  ```css
  --bg:      #050d1a   /* page background */
  --surface: #0b1930   /* card background */
  --blue:    #1e78ff   /* primary accent */
  --cyan:    #00c8ff   /* secondary accent */
  --green:   #00e5a0   /* positive / revenue */
  --red:     #ff4d6a   /* negative / churn / cost */
  --gold:    #ffb830   /* spend / targets */
  ```
- **Logo:** base64-embedded PNG at two sizes — 48px (loading screen) + 32px (header). To update the logo, replace the base64 string in both `src="data:image/png;base64,..."` attributes.
- **Grid background:** CSS `::before` pseudo-element — easy to remove if unwanted.

---

## How to Run Locally (Claude Code)

```bash
# Serve the file locally
npx serve .
# or
python3 -m http.server 8080

# Then open http://localhost:8080
# Note: Google Sheets CSV fetches work fine over localhost
```

---

## File Structure

```
shapers-dashboard/
├── index.html       ← entire dashboard (HTML + CSS + JS, ~105kb)
└── HANDOFF.md       ← this file
```

The logo is embedded in `index.html` as base64 — no separate image files needed.
