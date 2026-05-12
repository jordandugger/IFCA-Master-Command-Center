# IFCA Master Command Center

Live dashboard: https://jordandugger.github.io/IFCA-Master-Command-Center/

## Structure

```
index.html                    ← Main command center (all 4 tabs)
projections/
  index.html                  ← Monthly projections calculator
  recovery-playbook.html      ← FCA/IFCA merger recovery model
ads/
  index.html                  ← Ads deep-dive (Hyros + Meta MCP)
sales/
  index.html                  ← Sales deep-dive (PIF Perfect)
backend/
  index.html                  ← BE upsells deep-dive (Google Sheets)
data/
  PIF_Webhook_Script.gs       ← Google Apps Script for PIF Perfect sync
docs/
  project-scope.html          ← Full project scope + execution plan
  integration-setup-guide.html← PIF webhook + Meta MCP setup instructions
  handover-brief.md           ← Context brief from prior project
```

## Data Sources

| Tab | Source | Status |
|-----|--------|--------|
| Ads | Hyros + Meta Ads MCP | Hyros: API key needed · Meta: Craig to connect |
| Sales | PIF Perfect API | API key needed |
| Back-End | Google Sheets (Kevin) | Tracker migration pending |
| Projections | Calculated (HTML) | Live with manual inputs |

## Quick Start

1. Open `docs/project-scope.html` for full execution plan
2. Open `docs/integration-setup-guide.html` for PIF + Meta MCP setup steps
3. Open `projections/index.html` for the monthly projections meeting tool

## Targets

- **$550K/month IFCA revenue** in 2 consecutive months (Lookback Period)
- Close rate: 25% (Apr: 16%)
- Setter sets: 115–130/mo (Apr: 48)
- CPL: $38–50 (Apr: $79.98)
