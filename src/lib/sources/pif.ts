

// Primary source: scraped PIF Perfect historical data (323 records, Apr–May 2026)
const SCRAPED_SHEET_ID = "1OxJvegMCGBc2yDddRl0pBfIAtxADD6eotz7SUWo6GZg";
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SCRAPED_SHEET_ID}/export?format=csv`;

export interface CloserStats {
  name: string;
  scheduled: number;
  showed: number;
  showRate: string;
  liveConsults: number;
  offers: number;
  offerRate: string;
  setsOffered: number;
  closes: number;
  closeRate: string;
  callCloseRate: string;     // Closes / Live Consults (alt close rate measure)
  deposits: number;
  revenue: number;
  cash: number;
  cashRate: string;          // cash / revenue
}

export interface SetterStats {
  name: string;
  type: "ob" | "dm" | "hybrid";
  // Outbound dial metrics
  obLeadsAssigned: number;
  obDials: number;
  obMeaningfulConvos: number;
  obSets: number;
  // Inbound (for outbound dial setters)
  ibCallsScheduled: number;
  ibCallsLive: number;
  ibSets: number;
  // DM metrics
  dmLeadsAssigned: number;
  dmMeaningfulConvos: number;
  dmSets: number;
  newConvosAuto: number;
  newConvosManual: number;
  followUps: number;
  callsPitched: number;
  callsBooked: number;
  activeConvos: number;
  // Shared
  setsOnCalendar: number;
  setsClosed: number;          // sets that converted to closes (from this setter's leads)
  totalSets: number;
  handoffs: number;
  minsWorked: number;
  daysWithActivity: number;  // for pro-rating daily KPIs (e.g. mins/480 × days)
}

export interface PifSummary {
  asOf: string;
  month: string;
  daysInMonth: number;
  currentDay: number;
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
    liveConsults: number;
    offers: number;
    offerRate: string;
    callCloseRate: string;
    cashRate: string;
  };
  closers: CloserStats[];
  setters: SetterStats[];
  obSetters: SetterStats[];    // outbound dial setters (Tom, Anthony)
  dmSetters: SetterStats[];    // DM setters (Heather, Alvaro)
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
      const liveConsults = num(row[col("Live Consults")]);
      const closes       = num(row[col("Closes")]);
      const deposits     = num(row[col("Deposits")]);
      const revenue      = num(row[col("Revenue Generated")]);
      const cash         = num(row[col("Cash Collected")]);
      const offers       = num(row[col("Offers Made")]);
      const setsOffered  = num(row[col("Sets Offered")]);
      // Outbound dial metrics
      const obLeadsAssigned    = num(row[col("OB Leads Assigned")]);
      const obDials            = num(row[col("OB Total Dials")]);
      const obMeaningfulConvos = num(row[col("OB Meaningful Conversations")]);
      const obSets             = num(row[col("OB Total Sets Made")]);
      // Inbound for outbound dial setters
      const ibCallsScheduled   = num(row[col("IB Calls Scheduled")]);
      const ibCallsLive        = num(row[col("IB Calls Live")]);
      const ibSets             = num(row[col("IB Total Sets Made")]);
      // Shared
      const totalSets    = num(row[col("Total Sets")]);
      const setsOnCalendar = num(row[col("Sets on Calendar")]);
      const minsWorked   = num(row[col("Mins worked (KPI - 480):")]);
      const handoffs     = num(row[col("Handoffs (KPI-10):")]);
      // DM metrics
      const dmLeadsAssigned    = num(row[col("DM Leads Assigned")]);
      const dmMeaningfulConvos = num(row[col("DM Meaningful Conversations")]);
      const dmSets             = num(row[col("DM Total Sets Made")]);
      const newConvosAuto      = num(row[col("New Convos Started automated:")]);
      const newConvosManual    = num(row[col("New convos started manually(KPI -140 - (20 per hour):")]);
      const followUps          = num(row[col("Follow ups sent (50):")]);
      const activeConvos       = num(row[col("Active convos:")]);
      const callsPitched       = num(row[col("Calls Pitched:")]);
      const callsBooked        = num(row[col("Calls Booked (KPI 2.5):")]);

      const isCloser = scheduled > 0 || showed > 0 || closes > 0;
      const hasOB    = obDials > 0 || obLeadsAssigned > 0 || ibCallsScheduled > 0 || obSets > 0;
      const hasDM    = dmLeadsAssigned > 0 || dmSets > 0 || callsPitched > 0 || newConvosManual > 0 || activeConvos > 0;
      const isSetter = hasOB || hasDM || minsWorked > 0 || totalSets > 0 || callsBooked > 0;

      if (isCloser) {
        if (!closerMap[user]) {
          closerMap[user] = {
            name: user, scheduled: 0, showed: 0, showRate: "—",
            liveConsults: 0, offers: 0, offerRate: "—", setsOffered: 0,
            closes: 0, closeRate: "—", callCloseRate: "—",
            deposits: 0, revenue: 0, cash: 0, cashRate: "—",
          };
        }
        const c = closerMap[user];
        c.scheduled    += scheduled;
        c.showed       += showed;
        c.liveConsults += liveConsults;
        c.offers       += offers;
        c.setsOffered  += setsOffered;
        c.closes       += closes;
        c.deposits     += deposits;
        c.revenue      += revenue;
        c.cash         += cash;
      }

      if (isSetter) {
        if (!setterMap[user]) {
          setterMap[user] = {
            name: user,
            type: "ob",
            obLeadsAssigned: 0, obDials: 0, obMeaningfulConvos: 0, obSets: 0,
            ibCallsScheduled: 0, ibCallsLive: 0, ibSets: 0,
            dmLeadsAssigned: 0, dmMeaningfulConvos: 0, dmSets: 0,
            newConvosAuto: 0, newConvosManual: 0, followUps: 0, callsPitched: 0,
            callsBooked: 0, activeConvos: 0,
            setsOnCalendar: 0, setsClosed: 0, totalSets: 0,
            handoffs: 0, minsWorked: 0, daysWithActivity: 0,
          };
        }
        const s = setterMap[user];
        s.obLeadsAssigned    += obLeadsAssigned;
        s.obDials            += obDials;
        s.obMeaningfulConvos += obMeaningfulConvos;
        s.obSets             += obSets;
        s.ibCallsScheduled   += ibCallsScheduled;
        s.ibCallsLive        += ibCallsLive;
        s.ibSets             += ibSets;
        s.dmLeadsAssigned    += dmLeadsAssigned;
        s.dmMeaningfulConvos += dmMeaningfulConvos;
        s.dmSets             += dmSets;
        s.newConvosAuto      += newConvosAuto;
        s.newConvosManual    += newConvosManual;
        s.followUps          += followUps;
        s.callsPitched       += callsPitched;
        s.callsBooked        += callsBooked;
        s.activeConvos       += activeConvos;     // running, not summed conceptually but PIF appears to log per-day so sum is fine for MTD trend
        s.setsOnCalendar     += setsOnCalendar;
        s.totalSets          += totalSets;
        s.handoffs           += handoffs;
        s.minsWorked         += minsWorked;
        // count this row as an active day if any meaningful activity happened
        if (minsWorked > 0 || obDials > 0 || newConvosManual > 0 || dmLeadsAssigned > 0 ||
            obLeadsAssigned > 0 || callsPitched > 0 || followUps > 0) {
          s.daysWithActivity += 1;
        }
      }
    }

    // Classify each setter as OB / DM / hybrid based on which metric stack dominates
    Object.values(setterMap).forEach((s) => {
      const obSignal = s.obDials + s.obLeadsAssigned * 0.5;
      const dmSignal = s.dmLeadsAssigned + s.callsPitched * 2 + s.newConvosManual + s.activeConvos;
      if (obSignal > 0 && dmSignal > obSignal * 1.5) s.type = "dm";
      else if (obSignal > 0 && dmSignal > 0)         s.type = "hybrid";
      else if (dmSignal > 0)                          s.type = "dm";
      else                                            s.type = "ob";
    });

    // Compute derived rates for closers
    const closers = Object.values(closerMap)
      .map((c) => ({
        ...c,
        showRate:      pct(c.showed, c.scheduled),
        offerRate:     pct(c.offers, c.liveConsults || c.showed),
        closeRate:     pct(c.closes, c.showed),
        callCloseRate: pct(c.closes, c.liveConsults || c.showed),
        cashRate:      pct(c.cash, c.revenue),
      }))
      .sort((a, b) => b.closes - a.closes);

    const setters = Object.values(setterMap)
      .sort((a, b) => b.totalSets - a.totalSets);
    const obSetters = setters.filter((s) => s.type === "ob" || s.type === "hybrid");
    const dmSetters = setters.filter((s) => s.type === "dm" || s.type === "hybrid");

    // Totals
    const totScheduled = closers.reduce((s, c) => s + c.scheduled, 0);
    const totShowed    = closers.reduce((s, c) => s + c.showed, 0);
    const totCloses    = closers.reduce((s, c) => s + c.closes, 0);
    const totRevenue   = closers.reduce((s, c) => s + c.revenue, 0);
    const totCash      = closers.reduce((s, c) => s + c.cash, 0);
    const totSets      = setters.reduce((s, c) => s + c.totalSets, 0);
    const totDials     = setters.reduce((s, c) => s + c.obDials, 0);

    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const currentDay  = now.getDate();
    const totLiveConsults = closers.reduce((s, c) => s + c.liveConsults, 0);
    const totOffers       = closers.reduce((s, c) => s + c.offers,       0);

    const summary: PifSummary = {
      asOf: now.toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
      month: currentMonth,
      daysInMonth,
      currentDay,
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
        liveConsults: totLiveConsults,
        offers:    totOffers,
        offerRate: pct(totOffers, totLiveConsults || totShowed),
        callCloseRate: pct(totCloses, totLiveConsults || totShowed),
        cashRate:  pct(totCash, totRevenue),
      },
      closers,
      setters,
      obSetters,
      dmSetters,
    };

    return summary;
  } catch (err) {
    console.error("PIF fetch error:", err);
    return null;
  }
}

