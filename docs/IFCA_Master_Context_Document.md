# IFCA Command Center — Master Context Document
### NotebookLM Reference File · Updated May 2026

> **Purpose:** This document is the authoritative reference for building the IFCA × FCA Master Command Center Dashboard. Upload this into NotebookLM (or any AI notebook) alongside your dashboard-building course to give the AI full company, offer, revenue, and technical context. Everything in here is source-of-truth — use it to guide build decisions, metric definitions, data source mapping, and integration priorities.

---

## TABLE OF CONTENTS

1. [Company Overview](#1-company-overview)
2. [The Acquisition Context](#2-the-acquisition-context)
3. [Our Offers — What We Sell](#3-our-offers--what-we-sell)
4. [Revenue Architecture — How Money Flows](#4-revenue-architecture--how-money-flows)
5. [The $550K Lookback Target — Why It Matters](#5-the-550k-lookback-target--why-it-matters)
6. [The Three Revenue Levers](#6-the-three-revenue-levers)
7. [The Command Center Dashboard — What We're Building](#7-the-command-center-dashboard--what-were-building)
8. [The Four Data Pillars](#8-the-four-data-pillars)
9. [Data Source Deep Dives](#9-data-source-deep-dives)
   - 9a. PIF Perfect (Sales)
   - 9b. Hyros (Ad Attribution)
   - 9c. Meta Ads MCP (Real-Time Ads)
   - 9d. Google Sheets (Back-End / BE Metrics)
   - 9e. Projections Calculator (Calculated Layer)
10. [KPI Definitions & Benchmarks](#10-kpi-definitions--benchmarks)
11. [Revenue Equilibrium Model](#11-revenue-equilibrium-model)
12. [Metric Hierarchy — What to Surface First](#12-metric-hierarchy--what-to-surface-first)
13. [Team Structure & Data Ownership](#13-team-structure--data-ownership)
14. [Tech Stack](#14-tech-stack)
15. [Dashboard Architecture & Data Flow](#15-dashboard-architecture--data-flow)
16. [Integration Build Plan](#16-integration-build-plan)
17. [Historical Performance Baseline](#17-historical-performance-baseline)
18. [Offer Ladder & Pricing](#18-offer-ladder--pricing)
19. [Key Constraints & Rules](#19-key-constraints--rules)
20. [Glossary](#20-glossary)

---

## 1. Company Overview

**Company Name:** Impact Fitness Coaching Academy (IFCA)

**What we do:** IFCA is a high-ticket online education and coaching company that helps health, fitness, and nutrition coaches grow their businesses. We teach coaches how to get clients predictably, build automated systems, and scale to 6- and 7-figure businesses — without burning out.

**Market position:** We serve online fitness coaches at the $0–$30K/month revenue level who want to grow to $50K–$100K+/month. Our core customer is a skilled coach who is either stuck at a revenue ceiling or grinding inefficiently (cold DMs, endless content, referrals only) and wants a proven system.

**Founded:** 2017 (as IFCA)

**Parent company history:** Jordan Dugger and Erin Dimond co-founded T4E Systems (a health coaching company that did $5M+ and sold for 7+ figures), then founded IFCA. Combined, their businesses have generated over $40M in the online health and fitness industry. Jordan and Erin have personally trained thousands of clients, owned a gym for 5 years, and have helped 4,000+ coaches since 2017.

**Mission:** By helping health and fitness professionals grow their businesses, we create a ripple effect that impacts millions.

**Vision (External):** To redefine the standard of online fitness coaching by building world-class coaches and businesses that create freedom and impact at scale.

**Vision (Internal):** Be the fucking best — for our clients, our results, and the impact we create.

**Core Values:**
1. **Relentless Growth** — choosing the action that takes you to the next level regardless of belief. Lived through: Constant Innovation, Face It + Embrace It, Take Charge, Do the Boring Work.
2. **Extreme Ownership** — owning everything in your world, both business and personal, to an uncomfortable degree. Lived through: Follow Through, Take Charge, Lead By Example, Speak Up.
3. **Authentic Connection** — creating genuine, soul-vibrating connections with self, team, and clients. Lived through: Be Open, Listen First + Be Curious, Be Present, Go the Extra Mile.

---

## 2. The Acquisition Context

**What happened:** In May 2026, IFCA was acquired by Taeler De Haes, founder of Fitness Coach Academy (FCA). The Asset Purchase Agreement (APA) is signed. Jordan Dugger and Erin Dimond are in a 90-day Founder Transition Period (roll-off date: August 31, 2026). Taeler is now the owner and incoming CEO.

**Deal structure:**
- Purchase price: **$4.8M** ($1.5M cash at close + $3.3M seller note)
- Lookback Period: 120 days post-close
- Lookback target: **$550K/month in IFCA-only revenue in 2 consecutive months** — if not hit, the purchase price is reduced
- Jordan's role: Strategic Consultant (90-day rolloff)
- Erin's role: Handles sales management, call reviews, deal communications through Q3 2026

**FCA (Fitness Coach Academy):**
- Taeler's prior business, being wound down post-acquisition
- FCA stop-sell: June 2026 (confirmed Day 2 of integration)
- FCA fully dissolved: ~90 days post-close
- All FCA clients ascend into the IFCA offer ladder
- FCA revenue is **excluded** from the $550K Lookback target — do not blend

**What Taeler brings:**
- DM-setting infrastructure: Pam (in Taeler's IG) + Andrea (placement TBD)
- High-performing closer Janie (~40% close rate on cold traffic)
- FCA client base ascending into IFCA offers
- Organic audience and brand trust in the FCA community

---

## 3. Our Offers — What We Sell

### Offer 1 — IFCA Accelerator (Front-End, Primary Offer)
**Price:** $12,500 / 6 months  
**What it is:** The flagship high-ticket coaching program. Teaches fitness coaches to install the "Client Engine" — a systemized client acquisition model using Instagram ads, done-for-you content, and Impact AI (GHL-based all-in-one platform).

**The Three Pillars of the Client Engine:**
1. **Instagram Ads Strategy** — value-led creatives, 200–500 new qualified leads in first 30 days, IFCA pays for first month of ad spend
2. **Done-For-You Content System** — 90-day content, tailored to coach's voice, AI-assisted, ~30 min/week to maintain
3. **Impact AI Business Manager** — all-in-one platform (GHL-based): CRM, funnels, landing pages, email/SMS automations, scheduling, payments. $1/month while in IFCA (saves $300–$1,000/month vs. separate tools)

**Guarantee:** 10 additional clients in first 90 days, or we coach them for free until they do.

**Target customer:** Health, fitness, or nutrition coach making $2K–$20K/month, grinding for clients through cold DMs/content/referrals, ready to install a paid acquisition system.

**Funnel:** Meta ad (VSL "Client Engine") → booked call → sales call → close  
**ACV:** $12,500 (avg. $6,250 upfront cash + $1,042/mo installments, varies by closer and deal structure)

---

### Offer 2 — Legacy Mastermind (Back-End Upsell)
**Price:** $22,000–$25,000  
**Renaming to:** "Path to 4%" on July 1, 2026  
**What it is:** High-level mastermind for coaches scaling beyond $30K–$50K/month. Advanced business strategy, accountability, peer community at the 7-figure level.  
**Sold by:** Success Coaches (upsell from Accelerator clients)  
**Entry criteria:** Typically Accelerator graduates who are scaling

---

### Offer 3 — 7-Figure CEO (Back-End, Top Tier)
**Price:** $30,000–$35,000  
**What it is:** Top-tier program. Focuses on CEO-level operations, team building, systems, and scaling past $1M/year. Personal fulfillment by Cory Carpenter (post-acquisition unlock — removing Taeler from this role is the single most important operational unlock).

---

### Offer 4 — Continuation (Back-End, Retention)
**Price:** ~$6,000  
**What it is:** Clients whose Accelerator contracts are ending re-enroll for another period. Not a full upsell — a retention close. High-priority pipeline (every month has 20–40 contracts ending).

---

### Offer 5 — GHL SaaS / Impact AI (MRR)
**Price:** $97/month per coach  
**What it is:** The Impact AI Business Manager (GoHighLevel white-label). Coaches pay monthly to maintain access. 450+ active subscribers as of May 2026.  
**Revenue stream:** MRR (Monthly Recurring Revenue)  
**Note:** This is the stickiest product. Churn here is slow but compounds negatively. Protecting this base is a priority.

---

### Offer 6 — FCA (Transitioning Out)
**Price:** ~$7,500  
**What it is:** Taeler's prior front-end offer. Stops being sold June 2026. All FCA clients ascend into IFCA Accelerator or Legacy/7FCEO.  
**Critical rule:** FCA revenue is EXCLUDED from the $550K Lookback target.

---

## 4. Revenue Architecture — How Money Flows

IFCA revenue is built from four streams. Every stream needs its own tracking line in the dashboard.

### Stream 1 — MRR (Monthly Recurring Revenue)
Stable, predictable base. Four components:

| Component | May 2026 Proj | Apr 2026 Actual | Notes |
|---|---|---|---|
| Continuity | $21,000 | $20,067 | Legacy client continuity payments |
| Trainerize | $25,000 | $24,863 | Coaching app subscriptions |
| GHL SaaS | $27,000 | $33,257 | $97/mo × 450+ coaches |
| 7FCEO Memberships | $15,000 | $15,000 | Top-tier program memberships |
| **Total MRR** | **$88,000** | **$93,187** | Apr→May decline: -$5,187 |

**MRR trend alert:** MRR has declined from $107K (Aug 2025) to $88K (May 2026 proj) — a $19K/month erosion over 9 months. This bleeds slowly and gets ignored. Protecting the MRR base is a hidden priority.

---

### Stream 2 — AR Collections (Accounts Receivable)
Installment payments from existing enrolled clients. These are not new sales — they are scheduled payment collections from clients already in programs.

| Component | May 2026 Proj | Apr 2026 Actual |
|---|---|---|
| AR – LaunchKit (legacy, phasing out) | $1,800 | $2,000 |
| AR – IFCA FE (Accelerator installments) | $102,190 | $105,874 |
| AR – Legacy + 7FCEO BE installments | $98,285 | $85,780 |
| **Total AR** | **$202,275** | **$193,654** |

AR is the second-largest revenue stream and is largely predictable. It lags new sales by 1–6 months.

---

### Stream 3 — FE Upfront Cash (New Sales, Front-End)
Cash collected at point of sale from new Accelerator clients. Driven entirely by the sales funnel: ads → leads → booked calls → live calls → closes.

| Metric | May 2026 Proj | Apr 2026 Actual |
|---|---|---|
| FE Cash Collected | $0* | $86,765 |
| Closed Deals | (being set) | 16 |
| Close Rate | Target: 25% | 16% |

*May FE cash projection pending live data from PIF Perfect.

---

### Stream 4 — BE Upfront Cash (New Upsells, Back-End)
Cash collected from upsell closes (Legacy, 7FCEO, Continuations). Driven by Success Coach pipeline and proactive upsell conversations with existing enrolled clients.

| Metric | May 2026 Proj | Apr 2026 Actual |
|---|---|---|
| BE Cash Collected | $25,200 | $23,333 |
| Legacy Closes | 6 proj | 3 actual |
| 7FCEO Closes | 2 proj | 1 actual |
| Continuation Closes | 5 proj | 5 actual |

---

### Gross Revenue Formula
```
Gross Revenue = Total MRR + Total AR + FE Cash + BE Cash
May 2026 Proj: $88,000 + $202,275 + $0 + $25,200 = $315,475
April 2026 Actual: $93,187 + $193,654 + $86,765 + $23,333 = $396,939
$550K Target gap (May): $234,525
```

---

## 5. The $550K Lookback Target — Why It Matters

**What it is:** A contractual performance threshold in the APA (Asset Purchase Agreement). IFCA must generate $550,000 in IFCA-only gross revenue in at least **2 consecutive months** during the 120-day Lookback Period post-close.

**Why it matters:** If this threshold is NOT hit in 2 consecutive months, the purchase price ($4.8M) is reduced. The seller note ($3.3M) is at risk.

**The gap:**
- April 2026 actual: $396,938 → $153K below target
- May 2026 projection (as of planning): $315,475 → $234K below target
- Required to protect deal: $550K in Month 1 AND Month 2 of the window

**What the dashboard must do:** Every view should surface the gap to $550K. Every metric should be readable through the lens of "does this move us toward or away from $550K?"

**What is included / excluded:**
- ✅ INCLUDED: IFCA Accelerator sales, Legacy, 7FCEO, Continuations, MRR, AR collections
- ❌ EXCLUDED: FCA revenue (Taeler's prior business). Do not blend.

---

## 6. The Three Revenue Levers

These are the three controllable drivers that explain the gap between current revenue and the $550K target. Every metric in the dashboard traces back to at least one of these.

### Lever 1 — Close Rate (Highest Leverage, Fastest Win)
**Target:** 25%  
**April actual:** 16%  
**Historical range:** 13.9% (Aug 2025) → 23.5% (Feb 2026)

**Math:**
- 16% → 25% on ~114 live calls/mo = +10.3 additional closes
- At $12,500 ACV = +$128K FE revenue generated/month
- At 50% upfront cash collection = +$64K cash/month immediately

**Why it's the fastest win:** No new ad spend. No new leads. No new campaigns. Same calls, better conversion. The unlock is sales script standardization and pitch training.

**Who owns it:** Erin (current, transitioning to Taeler)

**Root cause:** Closers needing pitch work. Script adoption decision still open (IFCA script vs. Taeler's process). Janie's ~40% close rate on cold traffic is the benchmark to train toward.

---

### Lever 2 — Setter Booked Call Volume (High Leverage, 2–3 Week Lag)
**Target:** 115–130 sets/month  
**April actual:** 48 sets  
**Historical range:** 86 (Feb 2026) → 113 (Aug 2025)

**Math:**
- Each additional booked set (that shows) at 25% close rate = ~$2,063 expected revenue
- 67 additional sets (to hit 115 target) × $2,063 = +$138K expected FE revenue

**Two sub-drivers:**
1. **Setter outreach volume** — Pam (Taeler's IG DMs), Andrea (placement TBD), Tom (dialer — role still unresolved)
2. **Paid lead inbound (Aloware)** — quality leads from VSL ads calling/texting in

**Taeler integration unlock:** 100% of Taeler's FCA sales come from DM setters. Pam and Andrea running 14-day pipeline cycles + voice memo check-ins every morning and night. Integrating even one setter into IFCA round-robin immediately is a priority.

**Who owns it:** Jordan (ad spend / lead flow) + setter team (managed by Erin → Taeler)

---

### Lever 3 — Back-End Upsell Rate (High Leverage, Under-Managed)
**Target:** ~$100K BE cash/month  
**April actual:** $23,333 BE cash  
**Historical:** BE revenue generated: $161K (Aug 2025) → $129K (Mar 2026) — declining 3 months straight

**Math:**
- 34 contracts ending in April (22 IFCA, 12 Legacy)
- Current resell rate: 17% → ~6 upsells
- At 25–30% resell rate → 8–10 upsells
- +4 additional upsells × $12–15K avg = +$48–60K/month

**Who owns it:** Cory Carpenter (COO). Removing Taeler from personal fulfillment of high-level upsells is the single most important operational unlock post-close.

**The unlock:** Cory building a structured upsell process — identifying clients 30 days before contract end, pitching continuation or ascension, managing SC referral pipeline.

---

## 7. The Command Center Dashboard — What We're Building

### Vision
A single, always-live web dashboard (hosted on GitHub Pages) that gives leadership real-time visibility into all four revenue streams and the three levers — replacing the monthly spreadsheet review with a live command center.

**It is NOT a reporting tool.** It is an operating tool. The goal is to see a problem before it costs a month of revenue, not after.

### What it replaces / improves
- Monthly Google Sheets projection meeting (still happens, but now fed by live data)
- Manual screenshot compilation from 4–5 different tools
- Delayed awareness of metric degradation (e.g., setter sets dropping from 113 → 48 over 6 months)

### What it does
1. Shows the live gap to the $550K Lookback target at the top of every view
2. Surfaces the three revenue levers with current vs. target at a glance
3. Pulls live data from PIF Perfect (sales), Hyros (attribution), Meta Ads MCP (paid ads), Google Sheets (BE metrics)
4. Hosts the interactive monthly projections calculator (sets targets, compares vs. actuals, toggles 1/3/6-month averages)
5. Shows Revenue Equilibrium — how many closes are needed to hit target, at what close rate and ACV

### What it looks like
- Dark-themed, always-on web dashboard
- Top navigation: Overview | Ads | Sales | Back-End | Projections
- Persistent lookback bar across the top showing the key numbers
- Each tab has KPI cards + data tables for deep drill-down
- Color coded: green = at/above target, amber = within 20% of target, red = more than 20% below target

### URL
`https://jordandugger.github.io/IFCA-Master-Command-Center`

### Technology
- HTML/CSS/JavaScript (no framework dependencies)
- GitHub Pages (free hosting, deploys on push)
- Google Apps Script (middleware for PIF Perfect API sync)
- Google Sheets (data hub / intermediate layer for all live feeds)

---

## 8. The Four Data Pillars

The dashboard is organized around four data pillars, each with its own data source and integration status.

| # | Pillar | Data Source | Integration Method | Status (May 2026) |
|---|---|---|---|---|
| 1 | **Ads Performance** | Hyros (primary) + Meta Ads MCP (real-time) | Hyros: nightly CSV email → Google Sheets. Meta MCP: Claude Desktop (Craig) | Hyros: API key needed. Meta MCP: Craig to connect (~7 min) |
| 2 | **Sales (FE)** | PIF Perfect API | Google Apps Script → PIF_Summary Google Sheet → Dashboard | API key needed from PIF settings |
| 3 | **Back-End Upsells** | Google Sheets (Kevin Hamidi) | IMPORTRANGE() from Kevin's live upsell tracker | Kevin to migrate .xlsx to live Sheet |
| 4 | **Projections** | Calculated layer (HTML) | Built. Will auto-populate when above feeds are wired | Live now with manual inputs |

---

## 9. Data Source Deep Dives

### 9a. PIF Perfect (Sales — FE Closers + Setters)

**What it is:** App.pifperfect.com — IFCA's sales performance tracking platform. Closers and setters submit their daily activity numbers. Generates leaderboards, AI coaching insights, and team performance metrics.

**Plan:** Growth plan ($247/mo) — includes API access and webhook integrations.

**API:** Public API confirmed available. Primary path is API polling via Google Apps Script (not webhooks — more reliable for dashboard pull).

**What to pull:**

*Per Closer (daily submission):*
- Closer name
- Available call slots
- Approved booked calls
- Show rate %
- Live calls taken
- Close rate %
- Closed deals (count)
- Revenue generated ($)

*Per Setter (daily submission):*
- Setter name
- Dials / outreach attempts
- Sets booked (count)
- Set rate %
- Lead source (paid vs. organic vs. DM)

*MTD Team Totals (auto-calculated by Apps Script):*
- Total booked calls
- Total live calls
- Blended close rate
- Total closed deals
- Total FE revenue generated
- Total setter sets

*KPI benchmarks to flag against:*
- Sets target: 115–130/month (Apr actual: 48)
- Close rate target: 25% (Apr actual: 16%)
- Show rate target: 66% (Apr through Day 2: 85.7%)
- ACV target: $12,500

**Integration architecture:**
```
PIF Perfect API
  → Google Apps Script (syncPIFData() - hourly trigger)
    → PIF_Raw sheet (raw data rows)
    → PIF_Summary sheet (MTD rollups + per-rep breakdown)
      → Dashboard Sales tab (reads PIF_Summary via fetch or IMPORTRANGE)
```

**Google Sheet name:** `IFCA Sales Data Hub`  
**Tabs needed:** `PIF_Raw`, `PIF_Summary`, `PIF_Log`

**Apps Script file:** `data/PIF_Webhook_Script.gs` (already built — paste into Google Apps Script editor)

**Setup steps:**
1. Log into app.pifperfect.com → Settings → API → Generate API key
2. Email support@pifperfect.com for endpoint docs if not visible (ask for `/submissions` and `/users` endpoints)
3. Create Google Sheet → Extensions → Apps Script → paste `PIF_Webhook_Script.gs`
4. Run `setApiKey()` once with your actual key, then run `testWebhook()` to verify
5. Set hourly trigger on `syncPIFData()`
6. **Apps Script permissions note:** Use a single-account Chrome session (incognito or dedicated profile) to avoid the multi-account authentication error

**Fallback:** If API docs are slow, PIF Perfect also supports webhooks on the Growth plan. The same Google Sheet structure works — just swap in the `doPost()` receiver instead of the polling function.

---

### 9b. Hyros (Ad Attribution — Primary Source of Truth)

**What it is:** Hyros is IFCA's primary paid advertising attribution platform. It uses multi-touch attribution and pixel tracking to accurately attribute leads, calls, and revenue to specific ads — more accurate than Meta's native reporting, especially for high-ticket offers with long sales cycles.

**Why Hyros is primary (not Meta):** Meta's native attribution overcounts (last-click bias, view-through inflation). Hyros tracks the full journey from ad impression to cash collected, which is essential for accurate CPL, ROAS, and CPA reporting on $12,500 offers.

**Key reports to pull:**
- MTD ad spend (total + by campaign)
- Cost per lead (CPL) — target: $38–50, Apr actual: $79.98
- Cost per booked call — target: $350, Apr actual: $401
- Total leads generated (MTD)
- ROAS (collected) — cash collected / ad spend
- ROAS (generated) — revenue generated / ad spend
- Top performing creatives by CPL
- Campaign-level breakdown (VSL, TOT, Masterclass, Scholarship)

**Integration path:**
1. Generate Hyros API key: Account Settings → API → Generate
2. Configure a saved report in Scientific Reporting (nightly email CSV) with the above metrics
3. Hyros CSV → Zapier or Google Sheets import → Dashboard Ads tab
4. Alternatively: Hyros API direct via Google Apps Script on same hourly cadence as PIF

**Scientific Reporting:** Hyros's built-in reporting layer. Can schedule automated email delivery of saved report CSVs. This is the lowest-effort integration path.

**IFCA ad account ID (Meta):** 623048835231084 (Impact 1)

---

### 9c. Meta Ads MCP (Real-Time Ads — Craig's Tool)

**What it is:** Meta's official Model Context Protocol (MCP) server for Claude, launched April 29, 2026. Connects Claude Desktop directly to a Meta Business ad account. No API keys. No developer app. No App Review. OAuth login.

**Important distinction:** Meta MCP is for real-time campaign decisions and meeting prep — NOT the official revenue/attribution number. Hyros is authoritative. Meta MCP is for "what's running right now, what's performing, what should Craig adjust."

**What Craig can pull with Claude Desktop:**
- MTD spend by campaign
- CPL by campaign and creative
- Live call pacing
- Creative performance comparison
- Budget pacing vs. monthly target

**Example queries Craig runs at each projections meeting:**
- *"What's our total Meta ad spend MTD for the IFCA account?"*
- *"What's the CPL on the VSL campaign last 30 days?"*
- *"Which ad creatives have the lowest CPL this month? Top 5."*
- *"Are we on pace to hit $88K spend this month?"*
- *"Compare last 7 days vs. prior 7 days for the Client Engine campaign."*

**Craig's setup steps:**
1. Download Claude Desktop if not installed (claude.ai/download)
2. Open Claude Desktop → Settings (top menu) → Developer → Edit Config
3. Find the `mcpServers` JSON block and add:
```json
{
  "mcpServers": {
    "meta-ads": {
      "url": "https://mcp.meta.com/ads/[YOUR_META_BUSINESS_ID]"
    }
  }
}
```
4. Find Meta Business ID: business.facebook.com → Business Settings → Business Info
5. Restart Claude Desktop
6. Authenticate via Meta Business OAuth when prompted
7. Test: ask Claude "Show me my Meta ad accounts"

**Time to set up:** ~7 minutes  
**Cost:** Free (Meta's official integration, beta)

---

### 9d. Google Sheets (Back-End Metrics — Kevin Hamidi)

**What it is:** The back-end upsell tracker maintained by Kevin Hamidi (Head Success Coach). Currently lives as `2025_SC_Backend_Upsell_Tracker.xlsx`. Needs to be migrated to a live Google Sheet so the dashboard can read from it.

**What to track:**

*Per upsell close:*
- Success Coach name
- Client name
- Contract end date (triggering the upsell window)
- Offer sold (Legacy / 7FCEO / Continuation)
- Cash at close ($)
- Installment structure
- Close date

*MTD rollup (auto-calculated):*
- Legacy Mastermind closes (count + revenue)
- 7-Figure CEO closes (count + revenue)
- Continuation closes (count + revenue)
- Total BE closes
- Total BE revenue generated
- Total BE cash collected
- SC referral pipeline (per coach: active clients, referrals out, pitched, closed)

*MRR sub-tracking:*
- GHL SaaS subscriber count (active vs. churned)
- Continuity/Trainerize active counts
- 7FCEO membership active counts

**Integration path:**
- Kevin migrates .xlsx to Google Sheet
- Sheet is published/shared with dashboard
- Dashboard backend tab reads via fetch from Google Sheets JSON endpoint
- Kevin updates weekly (minimum) — daily during projections prep

**ACV benchmarks:**
- Legacy Mastermind: $22,000–$25,000 avg
- 7-Figure CEO: $30,000–$35,000 avg
- Continuation: ~$6,000 avg

---

### 9e. Projections Calculator (Calculated Layer)

**What it is:** The monthly projections meeting tool. A standalone HTML dashboard (`projections/index.html`) that allows the team to:
- Enter projected values for each revenue stream
- View prior month / 3-month avg / 6-month avg as reference benchmarks
- Auto-calculate gross revenue and gap to $550K
- Model closer and setter projections (slots → approval % → show rate → close rate → closes → revenue)
- Track campaigns with projected leads, calls, and closes
- Add custom rows for new revenue lines

**When used:** Monthly projections meeting (first Monday of each month). Jordan sets projections with Craig (ads), Erin (sales), Kevin (BE), Clementine (ops).

**Current data loaded:** April 2026 actuals as baseline. May 2026 projections as starting point.

**Connection to live data (planned):** Once PIF Perfect, Hyros, and BE Google Sheet feeds are live, the projections calculator will auto-populate the "actual" columns, making the meeting a target-setting exercise rather than a data-gathering exercise.

---

## 10. KPI Definitions & Benchmarks

### Sales KPIs

| KPI | Definition | Target | April Actual | Owner |
|---|---|---|---|---|
| Setter Sets | Booked calls set by setters per month | 115–130 | 48 | Erin → Taeler |
| Approved Booked Calls | Total calls on closer calendars (scorer 3–4) | 155–200 | 152 | Erin |
| Show Rate | Live calls ÷ Approved booked calls | 66% | 65.8% (Mar), 85.7% (Apr Day 2) | Closers |
| Live Calls | Calls where prospect actually showed | 100–130 | 100 (Apr) | Closers |
| Close Rate | Closes ÷ Live calls | 25% | 16% | Erin → Taeler |
| Closed Deals | New Accelerator enrollments per month | 35–44 | 16 | Closers |
| ACV | Average contract value per close | $12,500 | $12,500 | — |
| FE Revenue Generated | Closed deals × ACV | $437K–$550K | $177,940 | — |
| FE Cash Collected | Upfront cash at close (typically 50%) | ~$218K | $86,765 | — |

### Ads KPIs

| KPI | Definition | Target | April Actual | Owner |
|---|---|---|---|---|
| Ad Spend (MTD) | Total Meta spend via Client Engine VSL | $88,000/mo | $70,653 | Craig |
| Cost Per Lead (CPL) | Ad spend ÷ total leads | $38–50 | $79.98 | Craig |
| Cost Per Booked Call | Ad spend ÷ booked calls from ads | $350 | $401 | Craig |
| Total Leads | Leads generated from ads (Hyros) | 1,700+ | 982 | Craig |
| ROAS (Collected) | Cash collected ÷ ad spend | 4.0x+ | ~1.2x | Craig |
| ROAS (Generated) | Revenue generated ÷ ad spend | 6.0x+ | ~2.5x | Craig |

### Revenue KPIs

| KPI | Definition | Target | April Actual |
|---|---|---|---|
| Total MRR | Sum of all monthly recurring streams | $90K+ | $93,187 |
| Total AR | Installment collections from active clients | $180K–$220K | $193,654 |
| BE Cash | Upfront cash from upsell closes | $75K–$100K | $23,333 |
| Gross Revenue | MRR + AR + FE Cash + BE Cash | $550,000 | $396,939 |
| Lookback Gap | $550K − Gross Revenue | $0 | $153,061 |

### BE KPIs

| KPI | Definition | Target | April Actual | Owner |
|---|---|---|---|---|
| Contracts Ending/Mo | Active client contracts expiring | Track | 34 (Apr) | Kevin |
| Resell Rate | Upsell closes ÷ contracts ending | 25–30% | 17% | Cory |
| Legacy Closes | Legacy Mastermind closes/month | 6–8 | 3 | Cory |
| 7FCEO Closes | 7-Figure CEO closes/month | 2–3 | 1 | Cory |
| Continuation Closes | Re-enrollment closes/month | 5–8 | 5 | Kevin |
| BE Revenue Generated | All upsell closes × ACV | $150K–$200K | $57,000 | Cory |

---

## 11. Revenue Equilibrium Model

Revenue Equilibrium answers: "How many closes do we need, at what ACV, to hit $550K — given stable MRR and AR?"

**Formula:**
```
Closes Needed = ($550K Target − MRR − AR − BE Cash) ÷ FE Cash Collection Rate per Close

Example (May 2026 inputs):
= ($550,000 − $88,000 − $202,275 − $25,200) ÷ $6,250 (50% of $12,500 ACV)
= $234,525 ÷ $6,250
= 37.5 → 38 additional FE closes needed in May

Or expressed differently:
Total closes needed to hit $550K gross = ~44 (if all from FE at full $12,500 ACV)
```

**Why it matters for the dashboard:** Equilibrium changes every month based on AR cycle and BE pipeline. The dashboard should auto-calculate this and show it prominently in the Projections and Overview tabs.

---

## 12. Metric Hierarchy — What to Surface First

When building any view in the dashboard, prioritize metrics in this order:

### Tier 1 — Always Visible (Persistent Lookback Bar)
1. Gross Revenue Projection vs. $550K Target
2. Gap to $550K ($ amount)
3. Close Rate MTD vs. 25% target
4. Setter Sets MTD vs. 115–130 target
5. CPL MTD vs. $38–50 target

### Tier 2 — Overview Tab Hero KPIs
1. Total MRR
2. FE Closes (MTD)
3. BE Upsells (MTD)
4. Ad Spend (MTD)
5. Revenue Equilibrium (closes needed)

### Tier 3 — Per-Tab Deep Dives
- **Ads:** CPL, ROAS, spend, leads, funnel economics by campaign
- **Sales:** Per-closer and per-setter performance tables, set rate, show rate, close rate
- **Back-End:** Per-SC upsell pipeline, contracts ending, resell rate, revenue by product
- **Projections:** MRR breakdown, AR schedule, upfront cash, historical comparison

---

## 13. Team Structure & Data Ownership

| Person | Role | Data Responsibility |
|---|---|---|
| **Jordan Dugger** | Co-founder / Strategic Consultant (90-day rolloff Aug 31) | Marketing, ads strategy, VSL, content, projections decisions. Owns this dashboard build. |
| **Erin Dimond** | Co-founder / Sales Manager (through Q3 2026) | Sales performance, call reviews, closer accountability. PIF Perfect data entry oversight. Always "Erin" — never "Aaron." |
| **Taeler De Haes** | Buyer / New Owner / CEO | Incoming decision-maker. Brings FCA client base, Pam + Andrea (setters), Janie (closer). Her ad account managed separately — excluded from current setup. |
| **Cory Carpenter** | COO / Chief Innovation Officer | Back-end upsell pipeline, Legacy/7FCEO delivery, SC team operations. BE data owner. |
| **Kevin Hamidi** | Head Success Coach | SC team management, student retention, upsell conversations, MRR tracking. BE Google Sheet owner. |
| **Clementine Emling** | Incoming Head Operator | Google Sheet setup, Apps Script, PIF webhook/API sync. Dashboard data maintenance going forward. Replacing Shelly Zemskov. |
| **Craig** | Paid Ads Agency | Ad account management, Meta Ads MCP setup, creative testing. Owns Ads tab data pull at meetings. |
| **Janie** | Closer (from Taeler's team) | ~40% close rate, highest priority addition to IFCA round-robin. |
| **Pam** | Setter (Taeler's IG) | Organic DM setter, stays in Taeler's Instagram profile. |
| **Andrea** | Setter | Placement TBD — either IFCA CRM or Taeler's Instagram. |
| **Tom** | Former setter, now in overflow closer/dialer hybrid | Role unresolved. Decision: likely return to full-time dialing. |

---

## 14. Tech Stack

| Tool | What It Does | Integration Role |
|---|---|---|
| **GoHighLevel (GHL)** | CRM, funnels, email/SMS, scheduling, Impact AI | Lead management, automations, MRR ($97/mo SaaS) |
| **Kajabi** | Student platform (course delivery) | Student access, onboarding |
| **Meta Ads** | Paid advertising platform | Lead generation — Client Engine VSL |
| **Hyros** | Attribution tracking | Primary revenue attribution source |
| **PIF Perfect** | Sales performance tracking | Daily rep submissions, leaderboard, AI coaching |
| **Aloware** | Inbound call/SMS platform | Routes VSL leads to setters |
| **Grain** | Call recording + AI summaries | Closer call reviews |
| **Trainerize** | Coaching app | Client delivery, MRR stream |
| **Google Sheets** | Spreadsheets | Data hub / middleware for dashboard feeds |
| **Google Apps Script** | Serverless JavaScript in Google Sheets | PIF API polling, Hyros CSV import, scheduled triggers |
| **GitHub Pages** | Static web hosting | Dashboard URL (free, instant deploy) |
| **Meta Ads MCP** | Official Meta→Claude integration | Real-time ad data in Claude Desktop |
| **Claude Desktop** | AI interface (Mac/Windows app) | MCP integrations, data pulls |
| **Zapier** | No-code automation | Backup automation layer for data syncs |
| **AddEvent** | Calendar/RSVP | Live training event embeds |
| **Vimeo** | Video hosting | TOT video, VSL hosting |

---

## 15. Dashboard Architecture & Data Flow

### File Structure (GitHub Repo)
```
IFCA-Master-Command-Center/
├── index.html                     ← Main command center (5 tabs)
├── README.md
├── projections/
│   ├── index.html                 ← Monthly projections calculator
│   └── recovery-playbook.html    ← FCA/IFCA merger recovery model
├── ads/
│   └── index.html                 ← Ads tab redirect
├── sales/
│   └── index.html                 ← Sales tab redirect
├── backend/
│   └── index.html                 ← Back-end tab redirect
├── data/
│   └── PIF_Webhook_Script.gs     ← Apps Script for PIF sync
└── docs/
    ├── project-scope.html         ← Full scope + 16-step execution plan
    ├── integration-setup-guide.html ← PIF + Meta MCP setup instructions
    └── handover-brief.md          ← Context brief
```

### Data Flow Diagram
```
PAID ADS SOURCES
  Meta Ads Platform ──────────────────────────────────────────────────►
  (Craig's account)                                                     |
                                                                        |
  Meta Ads MCP ──────► Claude Desktop ──► Manual entry at meeting ─────►
  (Official, Apr 29)                                                    |
                                                                        ▼
  Hyros ──► Scientific Reporting ──► Nightly CSV email ──────────► Google Sheets
  (Primary attribution)              (Zapier or Apps Script import)  (IFCA Sales Data Hub)
                                                                        |
SALES SOURCES                                                           |
  PIF Perfect API ──► Google Apps Script ──► PIF_Summary tab ──────────►
  (Hourly trigger)    (syncPIFData())       (MTD rollups)               |
                                                                        |
BACK-END SOURCES                                                        |
  Kevin's Upsell Tracker ──► Live Google Sheet ──► IMPORTRANGE ────────►
  (Weekly updates)                                                      |
                                                                        ▼
                                                               COMMAND CENTER
                                                               (GitHub Pages)
                                                               index.html
                                                                  |
                                                                  ├── Overview Tab
                                                                  ├── Ads Tab
                                                                  ├── Sales Tab
                                                                  ├── Back-End Tab
                                                                  └── Projections Tab
                                                                       |
                                                                projections/index.html
                                                                (Monthly calculator)
```

---

## 16. Integration Build Plan

### Phase 1 — Foundation (Day 1–2)
- [ ] Jordan shares GitHub repo with Craig and Clementine
- [ ] Craig installs Meta MCP on Claude Desktop (~7 min)
- [ ] Clementine creates `IFCA Sales Data Hub` Google Sheet
- [ ] Jordan emails PIF Perfect for API docs (support@pifperfect.com)
- [ ] Jordan generates PIF Perfect API key from Settings → API

### Phase 2 — PIF Perfect + Hyros (Day 2–4)
- [ ] Clementine pastes `PIF_Webhook_Script.gs` into Apps Script editor
- [ ] Clementine runs `testWebhook()` to verify sheet setup
- [ ] Set API key via `setApiKey()` function
- [ ] Set hourly trigger on `syncPIFData()`
- [ ] Jordan generates Hyros API key from Account Settings → API
- [ ] Jordan configures Hyros Scientific Reporting nightly CSV export

### Phase 3 — Back-End + Wiring (Day 4–6)
- [ ] Kevin migrates upsell tracker from .xlsx to live Google Sheet
- [ ] Kevin adds SC referral pipeline columns and shares with team
- [ ] First Meta MCP pull by Craig — feed numbers into Ads tab
- [ ] Connect PIF_Summary → Dashboard Sales tab (manual paste or fetch)
- [ ] Connect Hyros CSV → Dashboard Ads tab

### Phase 4 — Go Live (Day 6–7)
- [ ] Test full data flow end-to-end
- [ ] Run first live projections meeting using dashboard
- [ ] Document any field name corrections needed in PIF payload mapping
- [ ] Identify any metric gaps vs. what's showing in dashboard

### Future Phase — Full Automation
- Add `IMPORTRANGE()` formulas so dashboard auto-reads Google Sheet data
- Build Google Apps Script that calls Hyros API on nightly schedule
- Add BE tracker auto-sync on weekly trigger
- Eliminate all manual data entry at meetings (target: 2–3 months after initial launch)

---

## 17. Historical Performance Baseline

### Monthly Revenue History (Gross Collected)

| Month | Gross Rev | FE Cash | BE Cash | Total MRR | Setter Sets | Live Calls | Close Rate | Closes | Ad Spend | CPL |
|---|---|---|---|---|---|---|---|---|---|---|
| Aug 2025 | $508K | ~$154K | ~$161K | ~$107K | 113 | 101 | 13.9% | 14 | — | — |
| Sep 2025 | $613K | ~$325K | ~$155K | ~$105K | 104 | 132 | 18.2% | 24 | — | — |
| Jan 2026 | $452K | $134,900 | $65,000 | — | 109 | 120 | 19.2% | 23 | — | — |
| Feb 2026 | $412K | $131,758 | $55,333 | — | 86 | 98 | 23.5% | 23 | — | — |
| Mar 2026 | $446K | $140,275 | $64,000 | $92,822 | 95 | 114 | 21.9% | 25 | $75,328 | $66.82 |
| Apr 2026 | $396,938 | $86,765 | $23,333 | $93,187 | 48 | 100 | 16.0% | 16 | $70,653 | $79.98 |

### Averages
| Period | Gross Rev | FE Cash | BE Cash | Close Rate | CPL |
|---|---|---|---|---|---|
| 1-Month (Apr) | $396,938 | $86,765 | $23,333 | 16.0% | $79.98 |
| 3-Month (Feb–Apr) | $418,255 | $120,266 | $47,555 | 19.0% | — |
| 6-Month (Sep–Apr, est.) | $486,520 | ~$148,000 | ~$52,000 | 18.5% | — |
| 2025 Monthly Avg | ~$601,000 | — | — | — | — |

**The 2025 monthly average of ~$601K is the full recovery benchmark** (not $550K which is just the deal-protection floor).

---

## 18. Offer Ladder & Pricing

```
ENTRY POINT
     │
     ▼
 FCA Offer ──────────────────────────────────────────────────►  (FCA only, stop-sell June 2026)
 ~$7,500                                                         FCA clients ascend to IFCA ladder
     │
     ▼
 IFCA ACCELERATOR ◄──────────── Primary front-end offer
 $12,500 / 6 months               VSL → booked call → close
 (~$6,250 upfront + installments)  34 contracts ending/mo
     │
     ▼
 LEGACY MASTERMIND ◄──────────── Back-end upsell (Cory / SC team)
 $22,000–$25,000                   Renaming to "Path to 4%" July 1
 (Selling 6–8 per month target)
     │
     ▼
 7-FIGURE CEO ◄────────────────── Top-tier back-end (Cory)
 $30,000–$35,000                   2–3 closes/month target
     │
     ▼
 CONTINUATION ◄─────────────────── Retention / re-enrollment
 ~$6,000                            5–8 per month target
     │
     ▼
 GHL SAAS (IMPACT AI) ◄─────────── Ongoing MRR
 $97/month                          450+ active coaches
```

**LaunchKit:** Eliminated from offer architecture (no longer sold).

---

## 19. Key Constraints & Rules

These are non-negotiable rules for anyone working on the dashboard or data systems:

1. **FCA revenue is ALWAYS excluded** from the $550K Lookback target. Never blend FCA revenue into IFCA tracking.
2. **Hyros is the authoritative attribution source** — not Meta's native reporting. All CPL, ROAS, and lead numbers cited in the dashboard must come from Hyros unless explicitly labeled as Meta-reported.
3. **Apps Script setup** must be done in a single-account Chrome session. The multi-account error (cannot open this file) is caused by multiple Google accounts signed in simultaneously. Use incognito or a dedicated Chrome profile.
4. **Aaron = Erin.** Jordan sometimes says "Aaron" — he always means Erin Dimond. There is no Aaron on the team.
5. **Taylor = Taeler.** Jordan sometimes says "Taylor" — he always means Taeler De Haes.
6. **Actuals vs. Projections are distinct.** Never present projections as confirmed actuals. All projected numbers must be labeled as projections until actualized.
7. **FE Cash vs. FE Revenue Generated are different.** Revenue Generated = Closes × ACV (full contract value). Cash Collected = cash received at signing (typically 50% upfront). Both matter; they measure different things.
8. **Conservative / Base / Optimistic scenarios** for any revenue model. Never present a single number as certain.
9. **Cory Carpenter removing Taeler from personal fulfillment of 7FCEO** is the single most important operational unlock post-close. Dashboard should not attribute 7FCEO delivery to Taeler.
10. **Meta MCP is for real-time decisions** — Craig uses it at meetings and for campaign optimization. It does NOT replace Hyros as the revenue attribution source.

---

## 20. Glossary

| Term | Definition |
|---|---|
| **ACV** | Average Contract Value — the total contract value of a new close ($12,500 for Accelerator) |
| **AOV** | Average Order Value — sometimes used interchangeably with ACV |
| **APA** | Asset Purchase Agreement — the legal contract governing the IFCA sale to Taeler |
| **AR** | Accounts Receivable — installment payments from clients already enrolled |
| **BE** | Back-End — upsell products (Legacy, 7FCEO, Continuation); sold to existing clients |
| **BOF** | Bottom of Funnel — late-stage leads who have already watched VSL, booked a call |
| **CPL** | Cost Per Lead — ad spend ÷ leads generated |
| **CPA** | Cost Per Acquisition — ad spend ÷ new clients closed |
| **FCA** | Fitness Coach Academy — Taeler's prior business, being wound down post-acquisition |
| **FE** | Front-End — the primary Accelerator offer, sold to new clients via VSL funnel |
| **GHL** | GoHighLevel — CRM and automation platform behind Impact AI / IFCA's SaaS offer |
| **Hyros** | Attribution tracking platform. Primary source of truth for CPL, ROAS, leads |
| **IFCA** | Impact Fitness Coaching Academy — the company |
| **KPI** | Key Performance Indicator |
| **Lookback Period** | 120-day window post-close; IFCA must hit $550K/mo in 2 consecutive months |
| **MRR** | Monthly Recurring Revenue — stable subscription-based income |
| **MCP** | Model Context Protocol — standard for connecting AI models to external tools |
| **PIF Perfect** | Sales performance tracking tool for closers and setters |
| **ROAS** | Return on Ad Spend — revenue ÷ ad spend (collected = cash; generated = contract value) |
| **SDE** | Seller's Discretionary Earnings — normalized profit metric used in business valuation |
| **SC** | Success Coach — the team member managing client relationships and driving BE upsells |
| **TOT** | Transfer of Trust — the student-facing acquisition announcement campaign |
| **VSL** | Video Sales Letter — the primary ad funnel video used to generate booked calls |

---

*Document maintained by Jordan Dugger · IFCA × FCA Merger Command Center project · May 2026*  
*For dashboard build questions, refer to: `docs/project-scope.html` and `docs/integration-setup-guide.html` in the GitHub repo*  
*GitHub repo: https://github.com/jordandugger/IFCA-Master-Command-Center*  
*Live dashboard: https://jordandugger.github.io/IFCA-Master-Command-Center*
