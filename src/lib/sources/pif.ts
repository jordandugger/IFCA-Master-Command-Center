

// Primary source: scraped PIF Perfect historical data (323 records, Apr–May 2026)
const SCRAPED_SHEET_ID = "1OxJvegMCGBc2yDddRl0pBfIAtxADD6eotz7SUWo6GZg";
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SCRAPED_SHEET_ID}/export?format=csv`;

export interface CloserStats {
  name: string;
  scheduled: number;
  showed: number;
  showRate: string;
  offers: number;
  closes: number;
  closeRate: string;
  revenue: number;
  cash: number;
}

export interface SetterStats {
  name: string;
  obDials: number;
  obSets: number;
  ibSets: number;
  totalSets: number;
  callsBooked: number;
  minsWorked: number;
  handoffs: number;
}

export interface PifSummary {
  asOf: string;
  month: string;
  totals: {
    scheduled: number;
    showed: number;
    showRate: string;
    closes: number;
    closeRate: string;
    revenue: number;
    cash: number;
    totalSets: number;
    obDials: number;
  };
  closers: CloserStats[];
  setters: SetterStats[];
}

function num(v: string | undefined): number {
  if (!v) return 0;
  const cleaned = String(v).replace(/[$,\-]/g, "").replace(/--/g, "0").trim();
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

function pct(numerator: number, denominator: number): string {
  return denominator > 0 ? `${((numerator / denominator) * 100).toFixed(1)}%` : "—";
}

function getCurrentMonth(): string {
  return new Date().toLocaleString("en-US", { month: "short" });
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

export async function fetchPif(): Promise<PifSummary | null> {
  try {
    const res = await fetch(CSV_URL, {
      cache: "no-store",
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    if (!res.ok) throw new Error(`Sheet fetch ${res.status}`);

    const text = await res.text();
    const lines = text.trim().split("\n");
    const headers = parseCSVLine(lines[0]);
    const col = (name: string) => headers.indexOf(name);

    const currentMonth = getCurrentMonth(); // "May"

    // Accumulate per-user stats for current month only
    const closerMap: Record<string, CloserStats> = {};
    const setterMap: Record<string, SetterStats> = {};

    for (let i = 1; i < lines.length; i++) {
      const row = parseCSVLine(lines[i]);
      const date = row[col("Date")] ?? "";
      const month = date.split(" ")[0];
      if (month !== currentMonth) continue;

      const user = row[col("User")] ?? "";
      if (!user) continue;

      const scheduled    = num(row[col("Scheduled Calls")]);
      const showed       = num(row[col("Showed Calls")]);
      const closes       = num(row[col("Closes")]);
      const revenue      = num(row[col("Revenue Generated")]);
      const cash         = num(row[col("Cash Collected")]);
      const offers       = num(row[col("Offers Made")]);
      const obDials      = num(row[col("OB Total Dials")]);
      const obSets       = num(row[col("OB Total Sets Made")]);
      const ibSets       = num(row[col("IB Total Sets Made")]);
      const totalSets    = num(row[col("Total Sets")]);
      const callsBooked  = num(row[col("Calls Booked (KPI 2.5):")]);
      const minsWorked   = num(row[col("Mins worked (KPI - 480):")]);
      const handoffs     = num(row[col("Handoffs (KPI-10):")]);

      const isCloser = scheduled > 0 || showed > 0 || closes > 0;
      const isSetter = obDials > 0 || minsWorked > 0 || totalSets > 0 || callsBooked > 0;

      if (isCloser) {
        if (!closerMap[user]) {
          closerMap[user] = { name: user, scheduled: 0, showed: 0, showRate: "—", offers: 0, closes: 0, closeRate: "—", revenue: 0, cash: 0 };
        }
        closerMap[user].scheduled += scheduled;
        closerMap[user].showed    += showed;
        closerMap[user].offers    += offers;
        closerMap[user].closes    += closes;
        closerMap[user].revenue   += revenue;
        closerMap[user].cash      += cash;
      }

      if (isSetter) {
        if (!setterMap[user]) {
          setterMap[user] = { name: user, obDials: 0, obSets: 0, ibSets: 0, totalSets: 0, callsBooked: 0, minsWorked: 0, handoffs: 0 };
        }
        setterMap[user].obDials     += obDials;
        setterMap[user].obSets      += obSets;
        setterMap[user].ibSets      += ibSets;
        setterMap[user].totalSets   += totalSets;
        setterMap[user].callsBooked += callsBooked;
        setterMap[user].minsWorked  += minsWorked;
        setterMap[user].handoffs    += handoffs;
      }
    }

    // Compute derived rates for closers
    const closers = Object.values(closerMap)
      .map((c) => ({
        ...c,
        showRate:  pct(c.showed, c.scheduled),
        closeRate: pct(c.closes, c.showed),
      }))
      .sort((a, b) => b.closes - a.closes);

    const setters = Object.values(setterMap)
      .sort((a, b) => b.totalSets - a.totalSets);

    // Totals
    const totScheduled = closers.reduce((s, c) => s + c.scheduled, 0);
    const totShowed    = closers.reduce((s, c) => s + c.showed, 0);
    const totCloses    = closers.reduce((s, c) => s + c.closes, 0);
    const totRevenue   = closers.reduce((s, c) => s + c.revenue, 0);
    const totCash      = closers.reduce((s, c) => s + c.cash, 0);
    const totSets      = setters.reduce((s, c) => s + c.totalSets, 0);
    const totDials     = setters.reduce((s, c) => s + c.obDials, 0);

    const summary: PifSummary = {
      asOf: new Date().toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
      month: currentMonth,
      totals: {
        scheduled: totScheduled,
        showed:    totShowed,
        showRate:  pct(totShowed, totScheduled),
        closes:    totCloses,
        closeRate: pct(totCloses, totShowed),
        revenue:   totRevenue,
        cash:      totCash,
        totalSets: totSets,
        obDials:   totDials,
      },
      closers,
      setters,
    };

    return summary;
  } catch (err) {
    console.error("PIF fetch error:", err);
    return null;
  }
}

