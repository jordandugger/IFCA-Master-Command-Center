import { NextResponse } from "next/server";

export const revalidate = 120;

const SHEET_ID = "1NFQ_FIrUQPEEVs4GIT3sK2U08BcO315GFg7ry4SiT_o";
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`;

export interface HyrosCampaign {
  name: string;
  status: string;
  spend: number;
  leads: number;
  cpl: number;
  calls: number;
  costPerCall: number;
  sales: number;
  revenue: number;
  roas: number;
  cac: number;
}

export interface HyrosSummary {
  asOf: string;
  month: string;
  totals: {
    spend: number;
    leads: number;
    newLeads: number;
    cpl: number;
    calls: number;
    costPerCall: number;
    sales: number;
    costPerSale: number;
    customers: number;
    cac: number;
    revenue: number;
    roas: number;
  };
  campaigns: HyrosCampaign[];
}

function num(v: string | undefined): number {
  if (!v || v === "-" || v === "") return 0;
  const n = parseFloat(v.replace(/[$,]/g, ""));
  return isNaN(n) ? 0 : n;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') { inQuotes = !inQuotes; }
    else if (ch === "," && !inQuotes) { result.push(current.trim()); current = ""; }
    else { current += ch; }
  }
  result.push(current.trim());
  return result;
}

export async function fetchHyros(): Promise<HyrosSummary | null> {
  try {
    const res = await fetch(CSV_URL, {
      cache: "no-store",
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    if (!res.ok) throw new Error(`Sheet fetch ${res.status}`);

    const text = await res.text();
    const lines = text.trim().split("\n");
    const headers = parseCSVLine(lines[0]);

    const col = (name: string) => headers.findIndex(h =>
      h.toLowerCase().includes(name.toLowerCase())
    );

    const iName      = 0;
    const iStatus    = 1;
    const iCost      = col("Cost,") !== -1 ? col("Cost,") : 3;  // "Cost" exact
    const iLeads     = col("Leads");
    const iNewLeads  = col("New Leads");
    const iCPL       = col("Cost per Lead");
    const iCalls     = col("Calls,") !== -1 ? col("Calls,") : headers.findIndex(h => h === "Calls");
    const iCPC       = col("Cost per Call");
    const iSales     = col("Sales");
    const iCPS       = col("Cost per Sale");
    const iCustomers = col("Customers");
    const iCAC       = col("Cost per New Customer");
    const iRevenue   = col("Total Revenue");
    const iROAS      = col("ROAS");

    // Find column indices by position since some names are ambiguous
    const campaigns: HyrosCampaign[] = [];
    let totals = {
      spend: 0, leads: 0, newLeads: 0, cpl: 0,
      calls: 0, costPerCall: 0, sales: 0, costPerSale: 0,
      customers: 0, cac: 0, revenue: 0, roas: 0,
    };

    for (let i = 1; i < lines.length; i++) {
      const row = parseCSVLine(lines[i]);
      const name   = row[iName] ?? "";
      const status = row[iStatus] ?? "";

      // Use column 3 for Cost, 4 for Leads, 5 for New Leads, 6 for CPL,
      // 12 for Calls, 13 for CPC, 18 for Sales, 19 for CPS, 20 for Customers,
      // 21 for CAC, 23 for Revenue, 24 for ROAS (positional — sheet is fixed format)
      const spend      = num(row[3]);
      const leads      = num(row[4]);
      const newLeads   = num(row[5]);
      const cpl        = num(row[6]);
      const calls      = num(row[12]);
      const costPerCall= num(row[13]);
      const sales      = num(row[18]);
      const costPerSale= num(row[19]);
      const customers  = num(row[20]);
      const cac        = num(row[21]);
      const revenue    = num(row[23]);
      const roas       = num(row[24]);

      if (name.toLowerCase() === "total") {
        totals = { spend, leads, newLeads, cpl, calls, costPerCall, sales, costPerSale, customers, cac, revenue, roas };
        continue;
      }

      // Only include campaigns with spend > 0 in the breakdown table
      if (spend > 0) {
        campaigns.push({ name, status, spend, leads, cpl, calls, costPerCall, sales, revenue, roas, cac });
      }
    }

    // Sort campaigns by spend descending
    campaigns.sort((a, b) => b.spend - a.spend);

    const summary: HyrosSummary = {
      asOf: new Date().toLocaleString("en-US", {
        month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
      }),
      month: new Date().toLocaleString("en-US", { month: "short" }),
      totals,
      campaigns,
    };

    return summary;
  } catch (err) {
    console.error("Hyros sheet error:", err);
    return null;
  }
}

export async function GET() {
  const data = await fetchHyros();
  if (!data) return NextResponse.json({ error: "Failed to fetch Hyros data" }, { status: 500 });
  return NextResponse.json(data);
}
