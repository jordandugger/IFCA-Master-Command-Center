// ============================================================
// IFCA × FCA — PIF Perfect Webhook Receiver
// Google Apps Script — paste into script.google.com
// ============================================================

const SHEET_NAME = "PIF_Live_Data";
const LOG_SHEET  = "Webhook_Log";

// ─── ENTRY POINT ────────────────────────────────────────────
// This function receives POST requests from PIF Perfect
function doPost(e) {
  try {
    const raw     = e.postData.contents;
    const payload = JSON.parse(raw);
    
    logWebhook(raw); // Always log raw payload first
    
    const sheet = getOrCreateSheet(SHEET_NAME);
    writeSubmission(sheet, payload);
    
    return ContentService
      .createTextOutput(JSON.stringify({ status: "ok" }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (err) {
    logError(err.message);
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ─── WRITE SUBMISSION ────────────────────────────────────────
function writeSubmission(sheet, payload) {
  // Ensure header row exists
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "Timestamp",
      "Rep Name",
      "Date",
      "Calls Made",
      "Sets Booked",
      "Live Calls",
      "Closed Deals",
      "Revenue Generated",
      "Close Rate %",
      "Set Rate %",
      "Show Rate %",
      "Product",
      "Raw JSON"
    ]);
    sheet.getRange(1, 1, 1, 13).setFontWeight("bold");
    sheet.setFrozenRows(1);
  }

  // ── Map PIF Perfect payload fields ──
  // PIF sends data in different shapes depending on plan.
  // This handles the most common formats. Adjust field names
  // to match your actual PIF Perfect webhook payload once
  // you paste a test payload into the Webhook_Log sheet.
  
  const repName   = payload.rep_name   || payload.user?.name    || payload.name    || "Unknown";
  const subDate   = payload.date       || payload.submission_date                  || new Date().toISOString().split("T")[0];
  const calls     = payload.calls_made || payload.metrics?.calls                  || 0;
  const sets      = payload.sets       || payload.meetings_set  || payload.metrics?.sets || 0;
  const live      = payload.live_calls || payload.metrics?.live_calls              || 0;
  const closes    = payload.closed     || payload.deals_closed  || payload.metrics?.closed || 0;
  const revenue   = payload.revenue    || payload.metrics?.revenue                 || 0;
  const product   = payload.product    || payload.product_name  || "IFCA";
  
  // Computed metrics (avoid div/0)
  const closeRate = live  > 0 ? ((closes / live)  * 100).toFixed(1) + "%" : "—";
  const setRate   = calls > 0 ? ((sets   / calls)  * 100).toFixed(1) + "%" : "—";
  const showRate  = sets  > 0 ? ((live   / sets)   * 100).toFixed(1) + "%" : "—";
  
  sheet.appendRow([
    new Date().toISOString(),   // Timestamp of webhook receipt
    repName,
    subDate,
    calls,
    sets,
    live,
    closes,
    revenue,
    closeRate,
    setRate,
    showRate,
    product,
    JSON.stringify(payload)     // Raw backup
  ]);
  
  // Auto-format revenue column as currency
  const lastRow = sheet.getLastRow();
  sheet.getRange(lastRow, 8).setNumberFormat("$#,##0");
  
  // ── Update Summary Sheet ──
  updateSummary();
}

// ─── SUMMARY ROLLUP ─────────────────────────────────────────
// This sheet is what you embed in the Projections Calculator
function updateSummary() {
  const ss      = SpreadsheetApp.getActiveSpreadsheet();
  let summary   = ss.getSheetByName("PIF_Summary");
  
  if (!summary) {
    summary = ss.insertSheet("PIF_Summary");
    summary.getRange("A1:B1").setValues([["Last Updated", new Date()]]);
    summary.getRange("A2:B2").setValues([["Metric", "Value (MTD)"]]);
    summary.getRange("A2:B2").setFontWeight("bold");
  }
  
  const data  = ss.getSheetByName(SHEET_NAME);
  if (!data) return;
  
  // Get current month data only
  const now        = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const rows       = data.getDataRange().getValues();
  const headers    = rows[0];
  
  let mtdCalls=0, mtdSets=0, mtdLive=0, mtdCloses=0, mtdRev=0;
  const repMap = {};
  
  for (let i = 1; i < rows.length; i++) {
    const row       = rows[i];
    const rowDate   = new Date(row[0]); // Timestamp col
    if (rowDate < monthStart) continue; // Skip prior months
    
    const rep     = row[1];
    const calls   = Number(row[3]) || 0;
    const sets    = Number(row[4]) || 0;
    const live    = Number(row[5]) || 0;
    const closes  = Number(row[6]) || 0;
    const revenue = Number(row[7]) || 0;
    
    mtdCalls   += calls;
    mtdSets    += sets;
    mtdLive    += live;
    mtdCloses  += closes;
    mtdRev     += revenue;
    
    if (!repMap[rep]) repMap[rep] = { calls:0, sets:0, live:0, closes:0, revenue:0 };
    repMap[rep].calls   += calls;
    repMap[rep].sets    += sets;
    repMap[rep].live    += live;
    repMap[rep].closes  += closes;
    repMap[rep].revenue += revenue;
  }
  
  // Write summary rows
  const summaryRows = [
    ["Last Updated",     new Date().toLocaleString()],
    ["MTD Calls Made",   mtdCalls],
    ["MTD Sets Booked",  mtdSets],
    ["MTD Live Calls",   mtdLive],
    ["MTD Closed Deals", mtdCloses],
    ["MTD Revenue",      mtdRev],
    ["MTD Close Rate",   mtdLive > 0 ? (mtdCloses/mtdLive*100).toFixed(1)+"%" : "—"],
    ["MTD Set Rate",     mtdCalls > 0 ? (mtdSets/mtdCalls*100).toFixed(1)+"%" : "—"],
    ["MTD Show Rate",    mtdSets > 0 ? (mtdLive/mtdSets*100).toFixed(1)+"%" : "—"],
    ["", ""],
    ["— PER REP —", ""],
  ];
  
  // Per-rep rows
  Object.entries(repMap).forEach(([rep, stats]) => {
    summaryRows.push([rep + " | Closes", stats.closes]);
    summaryRows.push([rep + " | Revenue", stats.revenue]);
    summaryRows.push([rep + " | Close Rate", stats.live > 0 ? (stats.closes/stats.live*100).toFixed(1)+"%" : "—"]);
  });
  
  summary.clearContents();
  summary.getRange(1, 1, summaryRows.length, 2).setValues(summaryRows);
  
  // Format revenue cells
  summaryRows.forEach((row, i) => {
    if (String(row[0]).includes("Revenue")) {
      summary.getRange(i+1, 2).setNumberFormat("$#,##0");
    }
  });
}

// ─── HELPERS ─────────────────────────────────────────────────
function getOrCreateSheet(name) {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  let sheet   = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  return sheet;
}

function logWebhook(raw) {
  const sheet = getOrCreateSheet(LOG_SHEET);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Timestamp", "Raw Payload"]);
    sheet.getRange(1, 1, 1, 2).setFontWeight("bold");
  }
  sheet.appendRow([new Date().toISOString(), raw]);
}

function logError(msg) {
  const sheet = getOrCreateSheet(LOG_SHEET);
  sheet.appendRow([new Date().toISOString(), "ERROR: " + msg]);
}

// ─── TEST FUNCTION ───────────────────────────────────────────
// Run this manually from the Apps Script editor to verify
// sheet setup before connecting PIF Perfect
function testWebhook() {
  const mockPayload = {
    rep_name:   "Janie",
    date:       new Date().toISOString().split("T")[0],
    calls_made: 45,
    sets:       12,
    live_calls: 8,
    closed:     3,
    revenue:    37500,
    product:    "IFCA Accelerator"
  };
  
  const sheet = getOrCreateSheet(SHEET_NAME);
  writeSubmission(sheet, mockPayload);
  Logger.log("✓ Test submission written. Check PIF_Live_Data sheet.");
}
