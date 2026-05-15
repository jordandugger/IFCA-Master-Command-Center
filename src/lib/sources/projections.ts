

const SHEET_ID = "14eqjbLlS_1LMmHHuoE3V1HyoC62ilyO4FeMqyHD9AFc";

export interface ProjectionRow {
  label: string;
  projection: number;
  actual: number;
  pace: number;
  variance: number;
  varianceText: string;
  notes: string;
  unit: "currency" | "number" | "percent" | "ratio";
}

export interface ProjectionsSummary {
  asOf: string;
  month: string;
  daysInMonth: number;
  currentDay: number;
  progressPct: number;
  mrr: ProjectionRow[];
  ar: ProjectionRow[];
  revenue: ProjectionRow[];
  marketing: ProjectionRow[];
  funnel: ProjectionRow[];
  closes: ProjectionRow[];
  backend: ProjectionRow[];
  refunds: ProjectionRow[];
  totals: {
    grossRev: number;
    grossRevProj: number;
    grossRevPace: number;
    totalGenRev: number;
    totalGenRevProj: number;
    totalUpfrontCollected: number;
    feCloses: number;
    feClosesProj: number;
    closeRate: number;
    closeRateProj: number;
    aov: number;
    adSpend: number;
    roasGen: number;
    roasCol: number;
  };
}

function num(v: string | undefined): number {
  if (!v || v === "-" || v === "" || v === "—") return 0;
  const cleaned = String(v).replace(/[$,%]/g, "").trim();
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}

function parsePct(v: string | undefined): number {
  if (!v) return 0;
  const cleaned = String(v).replace(/%/g, "").trim();
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

function buildRow(
  rows: Map<string, string[]>,
  label: string,
  unit: "currency" | "number" | "percent" | "ratio" = "currency"
): ProjectionRow | null {
  const r = rows.get(label.toLowerCase().trim().replace(/\s+/g, " "));
  if (!r) return null;
  // Columns: D=3 metric, E=4 projection, F=5 actual, G=6 pace, H=7 variance, I=8 notes
  const projection = unit === "percent" ? parsePct(r[4]) : num(r[4]);
  const actual     = unit === "percent" ? parsePct(r[5]) : num(r[5]);
  const pace       = unit === "percent" ? parsePct(r[6]) : num(r[6]);
  const varText    = (r[7] ?? "").trim();
  const variance   = parsePct(varText);
  return {
    label: label.trim(),
    projection,
    actual,
    pace,
    variance,
    varianceText: varText,
    notes: r[8] ?? "",
    unit,
  };
}

export async function fetchProjections(): Promise<ProjectionsSummary | null> {
  try {
    const now = new Date();
    const monthName = now.toLocaleString("en-US", { month: "long" });
    const year = now.getFullYear();
    const tabName = `${monthName} ${year}`;

    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tabName)}`;

    const res = await fetch(url, {
      cache: "no-store",
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    if (!res.ok) throw new Error(`Sheet fetch ${res.status} for tab "${tabName}"`);

    const text = await res.text();
    const lines = text.split("\n");

    // Build map keyed by lowercased column D metric name
    const rows = new Map<string, string[]>();
    for (const line of lines) {
      const parsed = parseCSVLine(line);
      const label = (parsed[3] ?? "").trim();
      if (!label) continue;
      const key = label.toLowerCase().replace(/\s+/g, " ").replace(/\s+~+\s+/g, " ").trim();
      rows.set(key, parsed);
    }

    // Days in month + current day are in columns A/B on rows 1 and 2
    const firstLine = parseCSVLine(lines[1] ?? "");
    const secondLine = parseCSVLine(lines[2] ?? "");
    const daysInMonth = num(firstLine[1]) || 31;
    const currentDay  = num(secondLine[1]) || now.getDate();

    const helper = (k: string, unit: "currency" | "number" | "percent" | "ratio" = "currency") =>
      buildRow(rows, k, unit);

    const mrr: ProjectionRow[] = [
      helper("MRR - Continuity"),
      helper("MRR - Trainerize"),
      helper("MRR - GHL"),
      helper("MRR - 7FCEO"),
      helper("~ TOTAL MRR"),
    ].filter(Boolean) as ProjectionRow[];

    const ar: ProjectionRow[] = [
      helper("AR - LaunchKit"),
      helper("AR - IFCA (FE)"),
      helper("AR - Legacy + 7FCEO (BE)"),
      helper("~ TOTAL AR"),
    ].filter(Boolean) as ProjectionRow[];

    const revenue: ProjectionRow[] = [
      helper("FE Cash Collected (and LK to IFCA upsells)"),
      helper("BE Cash Collected"),
      helper("~ TOTAL UPFRONT COLLECTED"),
      helper("~ GROSS REVENUE"),
      helper("Gross Revenue Minus Cash Refund"),
      helper("Total Generated Revenue"),
    ].filter(Boolean) as ProjectionRow[];

    const marketing: ProjectionRow[] = [
      helper("Client Engine VSL"),
      helper("Masterclass"),
      helper("Video View/ Hammer Them"),
      helper("Boosted Posts"),
      helper("~ Ad Spend Total"),
      helper("Cost Per Lead (New)"),
      helper("Cost Per Booked Call (Total Calls)"),
      helper("Cost Per Approved Booked Call"),
      helper("Cost Per Live Call"),
      helper("CPA"),
      helper("ROAs Generated", "ratio"),
      helper("ROAs Collected", "ratio"),
    ].filter(Boolean) as ProjectionRow[];

    const funnel: ProjectionRow[] = [
      helper("Availability", "number"),
      helper("Total Scheduled Calls", "number"),
      helper("Booked 👉🏼 Approved Ratio", "percent"),
      helper("Approved Booked Calls", "number"),
      helper("Show Rate (TTL)", "percent"),
      helper("Live Calls (TTL)", "number"),
      helper("Booked Sets", "number"),
      helper("Closer Inbound Booked Calls", "number"),
    ].filter(Boolean) as ProjectionRow[];

    const closes: ProjectionRow[] = [
      helper("Closed Deals (IFCA)", "number"),
      helper("Close Rate (IFCA)", "percent"),
      helper("Revenue Generated (IFCA)"),
      helper("Upfront Cash Collected (FE)"),
      helper("Collected % (IFCA)", "percent"),
      helper("Average Order Value (TTL)"),
    ].filter(Boolean) as ProjectionRow[];

    const backend: ProjectionRow[] = [
      helper("Total Deals", "number"),
      helper("Legacy", "number"),
      helper("7 Figure CEO", "number"),
      helper("IFCA Upsell", "number"),
      helper("Revenue Generated"),
      helper("Cash Collected"),
      helper("Cash Collection Rate", "percent"),
    ].filter(Boolean) as ProjectionRow[];

    const refunds: ProjectionRow[] = [
      helper("Cash Refund $"),
      helper("Cash Refund %", "percent"),
      helper("Contract Cancel $"),
      helper("Contract Cancel %", "percent"),
    ].filter(Boolean) as ProjectionRow[];

    // Gross Revenue is the headline metric per APA §3.5 — legal $550K lookback measure
    const grossRev       = revenue.find(r => r.label.includes("GROSS REVENUE"))?.actual ?? 0;
    const grossRevProj   = revenue.find(r => r.label.includes("GROSS REVENUE"))?.projection ?? 0;
    const grossRevPace   = revenue.find(r => r.label.includes("GROSS REVENUE"))?.pace ?? 0;
    // Keep Total Generated Revenue available for reference
    const totalGenRev    = revenue.find(r => r.label.includes("Total Generated Revenue"))?.actual ?? 0;
    const totalGenRevProj= revenue.find(r => r.label.includes("Total Generated Revenue"))?.projection ?? 0;
    const totalUpfront   = revenue.find(r => r.label.includes("UPFRONT COLLECTED"))?.actual ?? 0;
    const feClosesRow    = closes.find(r => r.label.includes("Closed Deals"));
    const closeRateRow   = closes.find(r => r.label.includes("Close Rate"));
    const aovRow         = closes.find(r => r.label.includes("Average Order Value"));
    const adSpendRow     = marketing.find(r => r.label.includes("Ad Spend Total"));
    const roasGenRow     = marketing.find(r => r.label.includes("ROAs Generated"));
    const roasColRow     = marketing.find(r => r.label.includes("ROAs Collected"));

    const summary: ProjectionsSummary = {
      asOf: now.toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
      month: monthName,
      daysInMonth,
      currentDay,
      progressPct: daysInMonth > 0 ? (currentDay / daysInMonth) * 100 : 0,
      mrr,
      ar,
      revenue,
      marketing,
      funnel,
      closes,
      backend,
      refunds,
      totals: {
        grossRev,
        grossRevProj,
        grossRevPace,
        totalGenRev,
        totalGenRevProj,
        totalUpfrontCollected: totalUpfront,
        feCloses: feClosesRow?.actual ?? 0,
        feClosesProj: feClosesRow?.projection ?? 0,
        closeRate: closeRateRow?.actual ?? 0,
        closeRateProj: closeRateRow?.projection ?? 0,
        aov: aovRow?.actual ?? 0,
        adSpend: adSpendRow?.actual ?? 0,
        roasGen: roasGenRow?.actual ?? 0,
        roasCol: roasColRow?.actual ?? 0,
      },
    };

    return summary;
  } catch (err) {
    console.error("Projections error:", err);
    return null;
  }
}

