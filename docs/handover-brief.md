# IFCA Command Center Dashboard — Handover Brief
**Date:** May 12, 2026  
**From:** Jordan Dugger (Merger Command Center project)  
**To:** New project / build phase  

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## What We're Building

A single, always-live IFCA Command Center Dashboard with four data pillars:

| Pillar | Data Source | Status |
|---|---|---|
| **Ads Performance** | Hyros (primary attribution) + Meta Ads MCP | Meta MCP connected; Hyros manual until API key generated |
| **Funnel Economics & Sales** | PIF Perfect API | ← This brief focuses here |
| **Back-End Metrics** | Google Sheets (team manual updates) | Scaffold exists; integration pending |
| **Projections** | Calculated layer — MRR + AR + FE + BE inputs | Calculator built (HTML); needs live data feeds |

The dashboard is not a reporting tool — it's the command center for the monthly projections meeting and daily ops visibility. Every number in it should trace back to a single source of truth with no manual re-entry.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Pillar 2 — PIF Perfect: Sales Data Integration

### What PIF Perfect Is
PIF Perfect (app.pifperfect.com) is IFCA's sales performance tracking platform. Closers and setters submit their daily activity numbers directly into it. It tracks calls, sets, live calls, closes, revenue, and generates leaderboards and AI coaching insights. IFCA is on the Growth plan ($247/mo), which includes API access and webhook integrations.

---

### What We Want to Pull

These are the specific fields needed for the Command Center dashboard's Funnel Economics & Sales pillar:

**Per-Rep (Closers)**
- Closer name
- Available call slots
- Approved booked calls
- Show rate %
- Live calls taken
- Close rate %
- Closed deals (count)
- Revenue generated ($)

**Per-Rep (Setters)**
- Setter name
- Dials / outreach attempts
- Sets booked (count)
- Set rate %
- Lead source (paid vs. organic)

**Team Totals (MTD)**
- Total booked calls
- Total live calls
- Blended close rate
- Total closed deals
- Total FE revenue generated
- Total setter sets

**KPI Benchmarks to Cross-Reference Against**
- Target booked sets/month: 115–130
- Target close rate: 25%
- Target ACV: $12,500
- Target show rate: 66%
- April actuals baseline: 48 sets, 16 closes, 16% close rate

---

### Integration Path — PIF Perfect Public API

PIF Perfect has a public API. This is the correct integration path — cleaner and more reliable than webhooks for a dashboard that needs to query on demand.

**Recommended approach:** Google Apps Script scheduled trigger that calls the PIF Perfect API every hour (or on-demand before meetings), writes results to a `PIF_Live_Data` Google Sheet, and the dashboard reads from that sheet via `IMPORTRANGE()` or a direct fetch call.

**Why Google Sheets as the middleware layer:**
- No server infrastructure required
- Clementine or Kevin can see and audit the raw data
- Easy to override or manually correct a number if an API call fails
- Same pattern used for the BE metrics pillar (team updates already live in Sheets)
- Zapier can also trigger the sync if Apps Script proves unreliable

---

### Step-by-Step: PIF Perfect API → Google Sheets

**Step 1 — Get your PIF Perfect API key**
- Log into app.pifperfect.com
- Go to Settings → API (or Developer → API Keys)
- Generate a key and copy it somewhere safe
- This key goes into your Google Apps Script as a script property (not hardcoded)

**Step 2 — Find the API endpoints you need**
The two endpoints that matter for the dashboard are:

```
GET /submissions          — daily rep submissions (calls, sets, closes, revenue)
GET /users                — rep/user list with names and roles
```

Email support@pifperfect.com to request the full API documentation if it's not linked in your dashboard settings. Ask specifically: *"We need the endpoints for pulling daily submission data and MTD rollups by rep. Can you share the API docs and confirm authentication format?"*

**Step 3 — Create the Google Sheet**
- Create a new sheet called `IFCA Sales Data Hub`
- Add three tabs: `PIF_Raw`, `PIF_Summary`, `PIF_Log`
- Share with Clementine, Kevin, Erin

**Step 4 — Build the Apps Script sync**

Go to the sheet → Extensions → Apps Script. Paste this structure (fill in your actual endpoint URLs once you have the docs):

```javascript
const PIF_API_KEY = PropertiesService.getScriptProperties().getProperty('PIF_API_KEY');
const PIF_BASE_URL = 'https://api.pifperfect.com/v1'; // confirm with PIF support

function syncPIFData() {
  const today = new Date();
  const monthStart = Utilities.formatDate(
    new Date(today.getFullYear(), today.getMonth(), 1), 
    'UTC', 'yyyy-MM-dd'
  );
  const todayStr = Utilities.formatDate(today, 'UTC', 'yyyy-MM-dd');
  
  // Fetch MTD submissions
  const response = UrlFetchApp.fetch(
    `${PIF_BASE_URL}/submissions?start_date=${monthStart}&end_date=${todayStr}`,
    {
      headers: {
        'Authorization': `Bearer ${PIF_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  const data = JSON.parse(response.getContentText());
  writeToSheet(data);
  updateSummary(data);
}

// Set your API key once via script properties (never hardcode it):
function setApiKey() {
  PropertiesService.getScriptProperties().setProperty('PIF_API_KEY', 'YOUR_KEY_HERE');
}
```

**Step 5 — Set a scheduled trigger**
In Apps Script → Triggers (clock icon) → Add Trigger:
- Function: `syncPIFData`
- Event source: Time-driven
- Type: Hour timer → Every hour

This means the dashboard is never more than 60 minutes stale. Run it manually at the start of any meeting for real-time data.

**Step 6 — Store the API key securely**
Run `setApiKey()` once manually from the script editor with your actual key. After that, delete the function or replace the key value with a placeholder. The key lives in Script Properties, not in the code.

**Step 7 — Connect the summary sheet to the dashboard**
The `PIF_Summary` tab becomes the single source of truth the Command Center dashboard reads from. Whether the dashboard is an HTML file, a Google Sheet, or a Looker Studio — it points to `PIF_Summary` for all sales numbers.

---

### Fields the PIF_Summary Tab Should Output

```
Last Synced:          [timestamp]

── TEAM MTD TOTALS ──────────────────
Total Dials:          [#]
Total Sets Booked:    [#]
Total Live Calls:     [#]
Total Closed Deals:   [#]
Total FE Revenue:     [$]
Blended Close Rate:   [%]
Blended Set Rate:     [%]
Blended Show Rate:    [%]

── VS. KPI BENCHMARKS ───────────────
Sets vs. Target:      [# vs 115–130]
Close Rate vs. Target:[% vs 25%]
Revenue vs. $550K:    [$X of $550K]

── PER-REP BREAKDOWN ────────────────
[Rep Name] | Closes | Rev | CR% | Sets
...
```

---

### Fallback — If API Docs Are Slow to Arrive

While waiting on API documentation from PIF Perfect, use the webhook path as a temporary bridge:

1. PIF Perfect fires a webhook on each submission (Growth plan supports this)
2. A Google Apps Script `doPost()` endpoint catches it and writes to `PIF_Raw`
3. Same summary rollup logic applies

This was the originally planned path before confirming API access. The API polling approach is cleaner long-term. Use webhooks as a stopgap if needed — the sheet structure and summary logic are identical either way.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## The Other Three Pillars — Context for the Next Build

### Pillar 1 — Ads Data (Hyros + Meta MCP)

**Hyros** is the primary attribution source. It has Scientific Reporting which outputs a saved report on a schedule. The plan is to configure a saved report in Hyros that emails a CSV on a nightly or weekly cadence → that CSV gets imported into the dashboard's ads tab via a Google Sheets import or Zapier.

**Meta Ads MCP** is now live (Meta launched the official connector April 29, 2026). Craig (paid ads agency) connects his Meta Business account to Claude Desktop via the official MCP server at `https://mcp.meta.com/ads/[Business ID]`. This allows real-time CPL, ROAS, spend, and creative data to be pulled into Claude by asking in plain English. Setup time: ~7 minutes. No API keys or App Review required.

Key metrics to pull from Ads:
- MTD ad spend
- Cost per lead (CPL) — target: $38–50 (April actual: $79.98)
- Cost per booked call — target: $350 (April actual: $401)
- Total leads generated
- ROAS (collected and generated)
- Top performing creatives by CPL

**IFCA ad account ID:** 623048835231084 (Impact 1)

---

### Pillar 3 — Back-End Metrics (Google Sheets)

Back-end upsell data lives in `2025_SC_Backend_Upsell_Tracker.xlsx` and is maintained by the Success Coach team (Kevin Hamidi). The plan is to migrate this to a live Google Sheet that syncs to the dashboard. Key metrics:

- Legacy Mastermind closes (MTD)
- 7-Figure CEO closes (MTD)
- Continuation closes (MTD)
- SC referral pipeline (per coach)
- Total BE revenue generated
- Total BE cash collected

This pillar feeds directly into the BE Revenue row of the Projections sheet.

---

### Pillar 4 — Projections (Calculated Layer)

The projections calculator has already been built as a standalone HTML tool (see this project). It contains:

- MRR section (Continuity, Trainerize, GHL SaaS, 7FCEO memberships)
- AR Receivables section (LK, FE, Legacy/BE)
- FE Cash and BE Cash upfront collection
- Gross Revenue auto-calculated
- $550K Lookback gap tracker
- Historical reference toggle (1-month / 3-month / 6-month avg)

The next step for this pillar is connecting it to live data from the other three pillars so it auto-populates instead of requiring manual entry at the start of each meeting.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Open Items Before Build Starts

- [ ] **PIF Perfect API docs** — email support@pifperfect.com to confirm endpoint structure and auth format
- [ ] **PIF API key** — generate from PIF Perfect settings
- [ ] **Hyros API key** — generate from Hyros account settings for Scientific Reporting integration
- [ ] **Hyros saved report** — configure the nightly CSV email export in Scientific Reporting
- [ ] **Meta MCP** — Craig installs on Claude Desktop (~7 min, instructions in Integration Setup Guide)
- [ ] **Google Sheet creation** — Clementine creates `IFCA Sales Data Hub` and shares with leadership team
- [ ] **Apps Script permissions** — Clementine must use a single-account browser session (incognito or dedicated Chrome profile) to avoid the multi-account Apps Script error
- [ ] **BE tracker migration** — Kevin migrates upsell tracker from .xlsx to a live Google Sheet
- [ ] **Dashboard architecture decision** — confirm whether the Command Center is built as an HTML file (like the current calculator), a Google Looker Studio dashboard, or a hosted web app. Recommendation: start with the HTML approach since the projections calculator already exists in that format, then migrate to Looker Studio once all data sources are stable.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Key Context for the New Project

- **$550K/month in 2 consecutive months** is the immediate north star — all dashboard metrics should surface progress toward this target
- **FCA revenue is excluded** from the $550K Lookback target — do not blend FCA numbers into IFCA performance tracking
- **Three primary revenue recovery levers** the dashboard should make visible at a glance: close rate (target 25%, April actual 16%), setter booked call volume (target 115–130/mo, April actual 48), and back-end upsell rate
- **Hyros is the authoritative attribution source** — Meta Ads MCP is for real-time campaign management and creative decisions, not the official revenue number
- **Cory Carpenter** owns back-end upsell pipeline and is the operator responsible for BE metrics accuracy
- **Kevin Hamidi** owns success coach team data and upsell tracker
- **Clementine Emling** is the incoming head operator — she owns dashboard maintenance and data hygiene going forward
