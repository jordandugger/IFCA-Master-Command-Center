import { NextResponse } from "next/server";

const SHEET_ID = "1lZA3TTLPebqYhkbFqdH8bzpBgp8sVnnVjhpgTOVrumE";
const SHEET_NAME = "PIF_Summary";

// Fetch PIF_Summary tab as CSV from the published Google Sheet
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(SHEET_NAME)}`;

export interface PifSummary {
  lastUpdated: string;
  mtdCalls: string;
  mtdSets: string;
  mtdLive: string;
  mtdCloses: string;
  mtdRevenue: string;
  mtdCloseRate: string;
  mtdSetRate: string;
  mtdShowRate: string;
  reps: { name: string; closes: string; revenue: string; closeRate: string }[];
}

function parseCSV(csv: string): string[][] {
  return csv
    .trim()
    .split("\n")
    .map((line) =>
      line
        .split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/)
        .map((cell) => cell.replace(/^"|"$/g, "").trim())
    );
}

function get(rows: string[][], label: string): string {
  const row = rows.find((r) => r[0] === label);
  return row ? row[1] : "—";
}

export async function GET() {
  try {
    const res = await fetch(CSV_URL, { next: { revalidate: 60 } });

    if (!res.ok) {
      return NextResponse.json({ error: "Sheet fetch failed" }, { status: 502 });
    }

    const text = await res.text();
    const rows = parseCSV(text);

    // Parse rep section — rows after "— PER REP —"
    const repStartIdx = rows.findIndex((r) => r[0].includes("PER REP"));
    const repRows = repStartIdx >= 0 ? rows.slice(repStartIdx + 1) : [];

    const repMap: Record<string, { closes: string; revenue: string; closeRate: string }> = {};
    for (const row of repRows) {
      if (!row[0]) continue;
      const [label, value] = row;
      const [repName, metric] = label.split(" | ");
      if (!repMap[repName]) repMap[repName] = { closes: "—", revenue: "—", closeRate: "—" };
      if (metric === "Closes") repMap[repName].closes = value;
      if (metric === "Revenue") repMap[repName].revenue = value;
      if (metric === "Close Rate") repMap[repName].closeRate = value;
    }

    const summary: PifSummary = {
      lastUpdated:  get(rows, "Last Updated"),
      mtdCalls:     get(rows, "MTD Calls Made"),
      mtdSets:      get(rows, "MTD Sets Booked"),
      mtdLive:      get(rows, "MTD Live Calls"),
      mtdCloses:    get(rows, "MTD Closed Deals"),
      mtdRevenue:   get(rows, "MTD Revenue"),
      mtdCloseRate: get(rows, "MTD Close Rate"),
      mtdSetRate:   get(rows, "MTD Set Rate"),
      mtdShowRate:  get(rows, "MTD Show Rate"),
      reps: Object.entries(repMap).map(([name, stats]) => ({ name, ...stats })),
    };

    return NextResponse.json(summary);
  } catch (err) {
    console.error("PIF fetch error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
