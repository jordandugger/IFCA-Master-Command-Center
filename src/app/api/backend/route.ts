import { NextResponse } from "next/server";

const SC_LEADERBOARD_ID = "1rqgskIcgKwvx0idu4yyhzLmH45beyf1sstXFJYsqPGI";
const UPSELL_TRACKER_ID = "1Og159NlTwCEOAw0bnNJOjEOwgdTSugJLvju_z21GNSw";
const CANCELLATIONS_ID  = "1ahu4O6H8D8Pot6S4pWo1eECkVPUTCS4hon7jRQMVuCw";
const NPS_ID            = "1mFGzQh63rhrChOPQ2CrByWmhwLveBrK_Er63UDZi8eY";

export interface SuccessCoach {
  name: string;
  feContractsEnding: number;
  feUpsellProj: number;
  feUpsellsActual: number;
  fePct: number;
  beContractsEnding: number;
  beUpsellProj: number;
  beResellsActual: number;
  bePct: number;
  totalContractsEnding: number;
  totalUpsellProj: number;
  totalResellsActual: number;
  totalPct: number;
  contracted: number;
  collected: number;
  collectedPct: number;
}

export interface ClientHealth {
  activeIFCA: number;
  activeLegacy: number;
  active7FCEO: number;
  totalActive: number;
  offboardedIFCA: number;
  offboardedLegacy: number;
  offboarded7FCEO: number;
  totalOffboarded: number;
  feChurnPct: number;
  beChurnPct: number;
  totalChurnPct: number;
  retentionPct: number;
  contractsCancelled: number;
  programsPaused: number;
  programExtensions: number;
  continuityActivations: number;
}

export interface BackendSummary {
  asOf: string;
  month: string;
  teamTotals: {
    feContractsEnding: number;
    feUpsellProj: number;
    feUpsellsActual: number;
    fePct: number;
    beContractsEnding: number;
    beUpsellProj: number;
    beResellsActual: number;
    bePct: number;
    totalContractsEnding: number;
    totalUpsellProj: number;
    totalResellsActual: number;
    totalPct: number;
    contracted: number;
    collected: number;
    collectedPct: number;
  };
  coaches: SuccessCoach[];
  clientHealth: ClientHealth | null;
  cancellationsMTD: {
    count: number;
    refundTotal: number;
    defaultedTotal: number;
  };
  npsAverage: number;
  npsCount: number;
}

function num(v: string | undefined): number {
  if (!v || v === "-" || v === "" || v === "—") return 0;
  const cleaned = String(v).replace(/[$,%]/g, "").trim();
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') { inQuotes = !inQuotes; }
    else if (ch === "," && !inQuotes) { result.push(current); current = ""; }
    else { current += ch; }
  }
  result.push(current);
  return result.map((c) => c.trim().replace(/^"|"$/g, ""));
}

async function fetchSheetCSV(id: string, gid?: string): Promise<string> {
  const url = gid
    ? `https://docs.google.com/spreadsheets/d/${id}/export?format=csv&gid=${gid}`
    : `https://docs.google.com/spreadsheets/d/${id}/export?format=csv`;
  const res = await fetch(url, { next: { revalidate: 300 }, headers: { "User-Agent": "Mozilla/5.0" } });
  if (!res.ok) throw new Error(`Sheet ${id} fetch ${res.status}`);
  return res.text();
}

export async function fetchBackend(): Promise<BackendSummary | null> {
  try {
    const now = new Date();
    const monthName = now.toLocaleString("en-US", { month: "long" });
    const monthShort = now.toLocaleString("en-US", { month: "short" });

    // Fetch all in parallel
    const [scText, upsellText, cancelText, npsText] = await Promise.all([
      fetchSheetCSV(SC_LEADERBOARD_ID).catch(() => ""),
      fetchSheetCSV(UPSELL_TRACKER_ID).catch(() => ""),
      fetchSheetCSV(CANCELLATIONS_ID).catch(() => ""),
      fetchSheetCSV(NPS_ID).catch(() => ""),
    ]);

    // === Parse SC Leaderboard ===
    // Structure: month header rows like "May" followed by "Team" line, then 6 coach lines.
    // Each line: ,Name,,FEContractsEnd,FEUpsellProj,FEActual,FE%,,BEContractsEnd,BEUpsellProj,BEActual,BE%,,Total*3,%,,Contracted,Collected,%
    const scLines = scText.split("\n");
    let teamTotals: BackendSummary["teamTotals"] = {
      feContractsEnding: 0, feUpsellProj: 0, feUpsellsActual: 0, fePct: 0,
      beContractsEnding: 0, beUpsellProj: 0, beResellsActual: 0, bePct: 0,
      totalContractsEnding: 0, totalUpsellProj: 0, totalResellsActual: 0, totalPct: 0,
      contracted: 0, collected: 0, collectedPct: 0,
    };
    const coaches: SuccessCoach[] = [];

    // Find current month section
    let monthIdx = -1;
    for (let i = 0; i < scLines.length; i++) {
      const parsed = parseCSVLine(scLines[i]);
      if (parsed[0]?.trim() === monthName || parsed[0]?.trim() === monthShort) {
        monthIdx = i;
        break;
      }
    }

    if (monthIdx >= 0) {
      // The "Team" row is the same line as the month header
      const teamRow = parseCSVLine(scLines[monthIdx]);
      teamTotals = {
        feContractsEnding:   num(teamRow[3]),
        feUpsellProj:        num(teamRow[4]),
        feUpsellsActual:     num(teamRow[5]),
        fePct:               num(teamRow[6]),
        beContractsEnding:   num(teamRow[8]),
        beUpsellProj:        num(teamRow[9]),
        beResellsActual:     num(teamRow[10]),
        bePct:               num(teamRow[11]),
        totalContractsEnding:num(teamRow[13]),
        totalUpsellProj:     num(teamRow[14]),
        totalResellsActual:  num(teamRow[15]),
        totalPct:            num(teamRow[16]),
        contracted:          num(teamRow[18]),
        collected:           num(teamRow[19]),
        collectedPct:        num(teamRow[20]),
      };

      // Coach rows start 2 lines after the month header (skip header descriptor row)
      for (let i = monthIdx + 2; i < monthIdx + 10 && i < scLines.length; i++) {
        const row = parseCSVLine(scLines[i]);
        const name = row[1]?.trim();
        if (!name || name === "") break;
        coaches.push({
          name,
          feContractsEnding: num(row[3]),
          feUpsellProj:      num(row[4]),
          feUpsellsActual:   num(row[5]),
          fePct:             num(row[6]),
          beContractsEnding: num(row[8]),
          beUpsellProj:      num(row[9]),
          beResellsActual:   num(row[10]),
          bePct:             num(row[11]),
          totalContractsEnding:num(row[13]),
          totalUpsellProj:     num(row[14]),
          totalResellsActual:  num(row[15]),
          totalPct:            num(row[16]),
          contracted:          num(row[18]),
          collected:           num(row[19]),
          collectedPct:        num(row[20]),
        });
      }
    }

    // === Parse Upsell Tracker (Team EOM Report) for client health ===
    const upsellLines = upsellText.split("\n");
    let clientHealth: ClientHealth | null = null;
    for (const line of upsellLines) {
      const row = parseCSVLine(line);
      if (row[0]?.trim() === monthName || row[0]?.trim() === monthShort) {
        clientHealth = {
          activeIFCA:           num(row[1]),
          activeLegacy:         num(row[2]),
          active7FCEO:          num(row[3]),
          totalActive:          num(row[4]),
          offboardedIFCA:       num(row[5]),
          offboardedLegacy:     num(row[6]),
          offboarded7FCEO:      num(row[7]),
          totalOffboarded:      num(row[8]),
          feChurnPct:           num(row[9]),
          beChurnPct:           num(row[10]),
          totalChurnPct:        num(row[11]),
          retentionPct:         num(row[12]),
          contractsCancelled:   num(row[13]),
          programsPaused:       num(row[15]),
          programExtensions:    num(row[17]),
          continuityActivations:num(row[20]),
        };
        break;
      }
    }

    // === Parse Cancellations — only this month ===
    const cancelLines = cancelText.split("\n");
    let cancelCount = 0;
    let refundTotal = 0;
    let defaultedTotal = 0;
    const year = now.getFullYear();
    const monthNum = now.getMonth() + 1;
    for (const line of cancelLines) {
      const row = parseCSVLine(line);
      const cancelDate = row[5]?.trim();
      if (!cancelDate) continue;
      // Expected format e.g. "5/30/2025" or "5/14/2026"
      const m = cancelDate.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
      if (m) {
        const cm = parseInt(m[1]);
        const cy = parseInt(m[3]);
        if (cm === monthNum && cy === year) {
          cancelCount++;
          defaultedTotal += num(row[6]);
          refundTotal += num(row[7]);
        }
      }
    }

    // === Parse NPS — average of all scores in current month ===
    const npsLines = npsText.split("\n");
    let npsSum = 0, npsCount = 0;
    for (let i = 1; i < npsLines.length; i++) {
      const row = parseCSVLine(npsLines[i]);
      const date = row[0]?.trim();
      if (!date) continue;
      const m = date.match(/(\d{4})-(\d{1,2})-(\d{1,2})/) || date.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
      if (!m) continue;
      const cy = m[1].length === 4 ? parseInt(m[1]) : parseInt(m[3]);
      const cm = m[1].length === 4 ? parseInt(m[2]) : parseInt(m[1]);
      if (cy === year && cm === monthNum) {
        const score = num(row[2]);
        if (score > 0) { npsSum += score; npsCount++; }
      }
    }

    const summary: BackendSummary = {
      asOf: now.toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
      month: monthName,
      teamTotals,
      coaches,
      clientHealth,
      cancellationsMTD: {
        count: cancelCount,
        refundTotal,
        defaultedTotal,
      },
      npsAverage: npsCount > 0 ? npsSum / npsCount : 0,
      npsCount,
    };

    return summary;
  } catch (err) {
    console.error("Backend route error:", err);
    return null;
  }
}

export async function GET() {
  const data = await fetchBackend();
  if (!data) return NextResponse.json({ error: "Failed to fetch backend data" }, { status: 500 });
  return NextResponse.json(data);
}
