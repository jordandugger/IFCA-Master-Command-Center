// Meta Marketing API v22.0 — pulls live ad performance from Impact 1 ad account.
// Returns auction-level metrics, kill/scale recommendations, lifecycle buckets,
// daily trend deltas, and budget pacing — i.e. an operating manual, not a dashboard.

const API_VERSION = "v22.0";
const BASE = `https://graph.facebook.com/${API_VERSION}`;

// ── Tunable thresholds (default — adjust after Craig calibrates) ─────────────
const TARGETS = {
  CPL_TARGET:        44,    // $38-50 midpoint
  CPL_KILL_MULT:     2.0,   // kill if CPL > 2 × target
  CPL_SCALE_MULT:    0.7,   // scale if CPL < 0.7 × target
  CTR_TARGET:        1.5,   // % link CTR
  CTR_SCALE_MULT:    1.5,   // scale if CTR > 1.5 × target
  FREQUENCY_WATCH:   3.0,
  FREQUENCY_FATIGUE: 3.5,
  FREQUENCY_KILL:    4.5,
  SPEND_TESTING_CAP: 500,   // < this = testing phase
  SPEND_MIN_DECISION: 1000, // < this = not enough data to kill
  SPEND_MATURE:      5000,  // > this = mature ad
  MONTHLY_BUDGET:    88000, // $88K monthly target
};

// ── Types ────────────────────────────────────────────────────────────────────
export type Lifecycle = "testing" | "proven" | "mature" | "declining" | "failed" | "watch";
export type Action    = "scale"   | "kill"   | "watch"  | "hold"      | "testing";

export interface MetaCampaign {
  id: string;
  name: string;
  spend: number;
  impressions: number;
  reach: number;
  clicks: number;
  ctr: number;
  cpm: number;
  cpc: number;
  frequency: number;
  leads: number;
  cpl: number;
}

export interface MetaAd {
  id: string;
  name: string;
  campaignName: string;
  spend: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cpm: number;
  frequency: number;
  leads: number;
  cpl: number;
  qualityRanking: string | null;
  engagementRateRanking: string | null;
  conversionRateRanking: string | null;
  // computed
  lifecycle: Lifecycle;
  action: Action;
  actionReason: string;
}

export interface MetaBreakdown {
  dimension: string;
  spend: number;
  impressions: number;
  reach: number;
  clicks: number;
  ctr: number;
  cpm: number;
}

export interface MetaFatigueAlert {
  adId: string;
  adName: string;
  campaignName: string;
  frequency: number;
  ctr: number;
  spend: number;
  reason: string;
}

export interface MetaTrendPoint {
  date: string;
  spend: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cpm: number;
}

export interface MetaTrendDelta {
  metric: "Spend" | "CTR" | "CPM" | "CPC" | "Impressions";
  current: number;
  prev: number;
  deltaPct: number;
  direction: "up" | "down" | "flat";
  goodDirection: "up" | "down";       // which direction is good for this metric
  isGood: boolean;
  unit: "currency" | "percent" | "decimal" | "number";
}

export interface MetaPacing {
  spendMtd: number;
  spendToday: number;
  spendYesterday: number;
  spend7d: number;
  daysElapsed: number;
  daysInMonth: number;
  daysRemaining: number;
  dailyAvg: number;
  paceEom: number;
  target: number;
  variancePct: number;       // (paceEom - target) / target * 100
  status: "underpacing" | "on-track" | "overpacing";
}

export interface MetaSummary {
  asOf: string;
  month: string;
  account: { id: string; name: string };
  totals: {
    spend: number;
    impressions: number;
    reach: number;
    clicks: number;
    ctr: number;
    cpm: number;
    cpc: number;
    frequency: number;
    leads: number;
    cpl: number;
  };
  campaigns: MetaCampaign[];
  ads: MetaAd[];                          // top 30 by spend
  placements: MetaBreakdown[];
  fatigueAlerts: MetaFatigueAlert[];
  // Tier 1 additions
  killList: MetaAd[];
  scaleList: MetaAd[];
  lifecycleCounts: Record<Lifecycle, number>;
  trends: MetaTrendDelta[];
  trendSeries: MetaTrendPoint[];          // 14 daily points
  pacing: MetaPacing;
  error?: string;
}

// ── helpers ─────────────────────────────────────────────────────────────────
function n(v: string | number | undefined): number {
  if (v === undefined || v === null) return 0;
  if (typeof v === "number") return isNaN(v) ? 0 : v;
  const x = parseFloat(v);
  return isNaN(x) ? 0 : x;
}

function firstOfMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

interface InsightsResponse<T> {
  data?: T[];
  paging?: { next?: string };
  error?: { message: string; type: string; code: number };
}

interface RawCampaign {
  campaign_id?: string;
  campaign_name?: string;
  spend?: string;
  impressions?: string;
  reach?: string;
  clicks?: string;
  ctr?: string;
  cpm?: string;
  cpc?: string;
  frequency?: string;
  actions?: { action_type: string; value: string }[];
}

interface RawAd {
  ad_id?: string;
  ad_name?: string;
  campaign_name?: string;
  spend?: string;
  impressions?: string;
  clicks?: string;
  ctr?: string;
  cpm?: string;
  frequency?: string;
  quality_ranking?: string;
  engagement_rate_ranking?: string;
  conversion_rate_ranking?: string;
  actions?: { action_type: string; value: string }[];
}

interface RawPlacement {
  publisher_platform?: string;
  platform_position?: string;
  spend?: string;
  impressions?: string;
  reach?: string;
  clicks?: string;
  ctr?: string;
  cpm?: string;
}

interface RawDaily {
  date_start?: string;
  spend?: string;
  impressions?: string;
  clicks?: string;
  ctr?: string;
  cpm?: string;
}

async function metaGet<T>(path: string, params: Record<string, string>): Promise<InsightsResponse<T> | null> {
  const token = process.env.META_ACCESS_TOKEN;
  if (!token) return null;
  const url = new URL(`${BASE}${path}`);
  url.searchParams.set("access_token", token);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  try {
    const res = await fetch(url.toString(), { cache: "no-store" });
    const json = (await res.json()) as InsightsResponse<T>;
    if (json.error) console.error(`Meta API error on ${path}:`, json.error);
    return json;
  } catch (e) {
    console.error(`Meta API fetch threw on ${path}:`, e);
    return null;
  }
}

function extractLeads(actions?: { action_type: string; value: string }[]): number {
  if (!actions) return 0;
  // Common Meta lead action types
  const leadTypes = ["lead", "offsite_conversion.fb_pixel_lead", "onsite_conversion.lead_grouped"];
  for (const t of leadTypes) {
    const m = actions.find((a) => a.action_type === t);
    if (m) return n(m.value);
  }
  return 0;
}

// ── Lifecycle + action classification ────────────────────────────────────────
function classifyLifecycle(ad: {
  spend: number; cpl: number; ctr: number; frequency: number;
  engagementRateRanking: string | null;
}): Lifecycle {
  const t = TARGETS;

  // Failed: enough spend, bad CPL
  if (ad.spend >= t.SPEND_MIN_DECISION && ad.cpl > 0 && ad.cpl > t.CPL_TARGET * t.CPL_KILL_MULT) {
    return "failed";
  }
  // Declining: high frequency OR below average engagement with material spend
  if (ad.spend >= t.SPEND_MIN_DECISION && (
    ad.frequency >= t.FREQUENCY_FATIGUE ||
    ad.engagementRateRanking?.startsWith("BELOW_AVERAGE")
  )) {
    return "declining";
  }
  // Testing: low spend, evaluating
  if (ad.spend < t.SPEND_TESTING_CAP) {
    return "testing";
  }
  // Mature: lots of spend, holding steady
  if (ad.spend >= t.SPEND_MATURE && ad.cpl > 0 && ad.cpl <= t.CPL_TARGET * 1.3 && ad.frequency < t.FREQUENCY_FATIGUE) {
    return "mature";
  }
  // Proven: meaningful spend, good CPL
  if (ad.spend >= t.SPEND_MIN_DECISION && ad.cpl > 0 && ad.cpl <= t.CPL_TARGET * 1.3) {
    return "proven";
  }
  return "watch";
}

function recommendAction(ad: {
  spend: number; cpl: number; ctr: number; frequency: number;
  engagementRateRanking: string | null; qualityRanking: string | null;
  lifecycle: Lifecycle;
}): { action: Action; reason: string } {
  const t = TARGETS;

  // Testing — not enough data to act
  if (ad.lifecycle === "testing") {
    return { action: "testing", reason: `Only $${Math.round(ad.spend)} spent — let it run` };
  }

  // KILL: clear failure signals
  if (ad.spend >= t.SPEND_MIN_DECISION) {
    const killReasons: string[] = [];
    if (ad.cpl > 0 && ad.cpl > t.CPL_TARGET * t.CPL_KILL_MULT) killReasons.push(`CPL $${ad.cpl.toFixed(0)} > $${(t.CPL_TARGET * t.CPL_KILL_MULT).toFixed(0)}`);
    if (ad.frequency > t.FREQUENCY_KILL) killReasons.push(`Freq ${ad.frequency.toFixed(1)} > ${t.FREQUENCY_KILL}`);
    if (ad.qualityRanking === "BELOW_AVERAGE_LOW_10") killReasons.push("Quality bottom 10%");
    if (ad.engagementRateRanking === "BELOW_AVERAGE_LOW_10") killReasons.push("Engagement bottom 10%");
    if (killReasons.length > 0) {
      return { action: "kill", reason: killReasons.join(" · ") };
    }
  }

  // SCALE: clear winner signals
  if (ad.spend >= t.SPEND_MIN_DECISION &&
      ad.cpl > 0 && ad.cpl < t.CPL_TARGET * t.CPL_SCALE_MULT &&
      ad.ctr > t.CTR_TARGET * t.CTR_SCALE_MULT &&
      ad.frequency < t.FREQUENCY_WATCH) {
    return { action: "scale", reason: `CPL $${ad.cpl.toFixed(0)} · CTR ${ad.ctr.toFixed(2)}% · Freq ${ad.frequency.toFixed(1)}` };
  }

  // WATCH: trending wrong direction but not extreme
  if (ad.frequency >= t.FREQUENCY_WATCH ||
      (ad.cpl > 0 && ad.cpl > t.CPL_TARGET * 1.3) ||
      ad.ctr < 1.0) {
    const reasons: string[] = [];
    if (ad.frequency >= t.FREQUENCY_WATCH) reasons.push(`Freq ${ad.frequency.toFixed(1)}`);
    if (ad.cpl > t.CPL_TARGET * 1.3) reasons.push(`CPL elevated`);
    if (ad.ctr < 1.0) reasons.push(`CTR ${ad.ctr.toFixed(2)}%`);
    return { action: "watch", reason: reasons.join(" · ") };
  }

  return { action: "hold", reason: "Performing within bounds" };
}

// ── Trend delta computation ─────────────────────────────────────────────────
function computeDeltas(daily: MetaTrendPoint[]): MetaTrendDelta[] {
  if (daily.length < 7) return [];

  // Last 7 days vs the 7 days before that
  const sorted = [...daily].sort((a, b) => a.date.localeCompare(b.date));
  const recent = sorted.slice(-7);
  const prior  = sorted.slice(-14, -7);
  if (prior.length === 0) return [];

  const sumOr = (arr: MetaTrendPoint[], f: (p: MetaTrendPoint) => number, defaultVal = 0) =>
    arr.length > 0 ? arr.reduce((s, p) => s + f(p), 0) : defaultVal;
  const avgOr = (arr: MetaTrendPoint[], f: (p: MetaTrendPoint) => number) =>
    arr.length > 0 ? arr.reduce((s, p) => s + f(p), 0) / arr.length : 0;

  const r = {
    spend: sumOr(recent, (p) => p.spend),
    impressions: sumOr(recent, (p) => p.impressions),
    clicks: sumOr(recent, (p) => p.clicks),
    ctr: avgOr(recent, (p) => p.ctr),
    cpm: avgOr(recent, (p) => p.cpm),
  };
  const p = {
    spend: sumOr(prior, (q) => q.spend),
    impressions: sumOr(prior, (q) => q.impressions),
    clicks: sumOr(prior, (q) => q.clicks),
    ctr: avgOr(prior, (q) => q.ctr),
    cpm: avgOr(prior, (q) => q.cpm),
  };

  const delta = (curr: number, prev: number): { deltaPct: number; direction: "up" | "down" | "flat" } => {
    if (prev === 0) return { deltaPct: 0, direction: "flat" };
    const deltaPct = ((curr - prev) / prev) * 100;
    const direction = Math.abs(deltaPct) < 2 ? "flat" : deltaPct > 0 ? "up" : "down";
    return { deltaPct, direction };
  };

  const cpc_r = r.clicks > 0 ? r.spend / r.clicks : 0;
  const cpc_p = p.clicks > 0 ? p.spend / p.clicks : 0;

  const out: MetaTrendDelta[] = [
    { metric: "Spend",       current: r.spend, prev: p.spend,
      ...delta(r.spend, p.spend), goodDirection: "down",
      isGood: r.spend <= p.spend, unit: "currency" },
    { metric: "CTR",         current: r.ctr, prev: p.ctr,
      ...delta(r.ctr, p.ctr), goodDirection: "up",
      isGood: r.ctr >= p.ctr, unit: "percent" },
    { metric: "CPM",         current: r.cpm, prev: p.cpm,
      ...delta(r.cpm, p.cpm), goodDirection: "down",
      isGood: r.cpm <= p.cpm, unit: "currency" },
    { metric: "CPC",         current: cpc_r, prev: cpc_p,
      ...delta(cpc_r, cpc_p), goodDirection: "down",
      isGood: cpc_r <= cpc_p, unit: "currency" },
    { metric: "Impressions", current: r.impressions, prev: p.impressions,
      ...delta(r.impressions, p.impressions), goodDirection: "up",
      isGood: r.impressions >= p.impressions, unit: "number" },
  ];
  return out;
}

// ── Pacing ──────────────────────────────────────────────────────────────────
function computePacing(spendMtd: number, daily: MetaTrendPoint[]): MetaPacing {
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysElapsed = now.getDate();
  const daysRemaining = daysInMonth - daysElapsed;

  const sorted = [...daily].sort((a, b) => a.date.localeCompare(b.date));
  const today = todayStr();
  const yest  = daysAgo(1);
  const spendToday     = sorted.find((p) => p.date === today)?.spend ?? 0;
  const spendYesterday = sorted.find((p) => p.date === yest)?.spend  ?? 0;
  const spend7d        = sorted.slice(-7).reduce((s, p) => s + p.spend, 0);

  const dailyAvg = daysElapsed > 0 ? spendMtd / daysElapsed : 0;
  const paceEom  = dailyAvg * daysInMonth;
  const target   = TARGETS.MONTHLY_BUDGET;
  const variancePct = target > 0 ? ((paceEom - target) / target) * 100 : 0;
  const status: MetaPacing["status"] =
    variancePct < -15 ? "underpacing" :
    variancePct >  15 ? "overpacing"  :
    "on-track";

  return {
    spendMtd, spendToday, spendYesterday, spend7d,
    daysElapsed, daysInMonth, daysRemaining,
    dailyAvg, paceEom, target, variancePct, status,
  };
}

// ── Main fetcher ────────────────────────────────────────────────────────────
export async function fetchMeta(adAccountId?: string): Promise<MetaSummary | null> {
  const token = process.env.META_ACCESS_TOKEN;
  const emptyTrendSeries: MetaTrendPoint[] = [];
  const emptyPacing: MetaPacing = {
    spendMtd: 0, spendToday: 0, spendYesterday: 0, spend7d: 0,
    daysElapsed: 0, daysInMonth: 31, daysRemaining: 31,
    dailyAvg: 0, paceEom: 0, target: TARGETS.MONTHLY_BUDGET,
    variancePct: 0, status: "on-track",
  };
  const emptyLifecycle: Record<Lifecycle, number> = {
    testing: 0, proven: 0, mature: 0, declining: 0, failed: 0, watch: 0,
  };

  if (!token) {
    return {
      asOf: new Date().toISOString(),
      month: new Date().toLocaleString("en-US", { month: "long" }),
      account: { id: "—", name: "Not connected" },
      totals: { spend: 0, impressions: 0, reach: 0, clicks: 0, ctr: 0, cpm: 0, cpc: 0, frequency: 0, leads: 0, cpl: 0 },
      campaigns: [], ads: [], placements: [], fatigueAlerts: [],
      killList: [], scaleList: [],
      lifecycleCounts: emptyLifecycle,
      trends: [], trendSeries: emptyTrendSeries,
      pacing: emptyPacing,
      error: "META_ACCESS_TOKEN not set",
    };
  }

  const accountRaw = adAccountId || process.env.META_AD_ACCOUNT_IMPACT_1 || "623048835231084";
  const accountId  = accountRaw.startsWith("act_") ? accountRaw : `act_${accountRaw}`;
  const timeRange  = JSON.stringify({ since: firstOfMonth(), until: todayStr() });
  const trendRange = JSON.stringify({ since: daysAgo(14), until: todayStr() });

  // Run all 4 fetches in parallel
  const [campaignsRes, adsRes, placementsRes, trendRes] = await Promise.all([
    metaGet<RawCampaign>(`/${accountId}/insights`, {
      level: "campaign",
      time_range: timeRange,
      fields: "campaign_id,campaign_name,spend,impressions,reach,clicks,ctr,cpm,cpc,frequency,actions",
      limit: "100",
    }),
    metaGet<RawAd>(`/${accountId}/insights`, {
      level: "ad",
      time_range: timeRange,
      fields: "ad_id,ad_name,campaign_name,spend,impressions,clicks,ctr,cpm,frequency,quality_ranking,engagement_rate_ranking,conversion_rate_ranking,actions",
      limit: "300",
    }),
    metaGet<RawPlacement>(`/${accountId}/insights`, {
      level: "account",
      time_range: timeRange,
      fields: "spend,impressions,reach,clicks,ctr,cpm",
      breakdowns: "publisher_platform,platform_position",
      limit: "50",
    }),
    metaGet<RawDaily>(`/${accountId}/insights`, {
      level: "account",
      time_range: trendRange,
      fields: "spend,impressions,clicks,ctr,cpm",
      time_increment: "1",
      limit: "30",
    }),
  ]);

  if (!campaignsRes || campaignsRes.error) {
    return {
      asOf: new Date().toISOString(),
      month: new Date().toLocaleString("en-US", { month: "long" }),
      account: { id: accountId, name: "Impact 1" },
      totals: { spend: 0, impressions: 0, reach: 0, clicks: 0, ctr: 0, cpm: 0, cpc: 0, frequency: 0, leads: 0, cpl: 0 },
      campaigns: [], ads: [], placements: [], fatigueAlerts: [],
      killList: [], scaleList: [],
      lifecycleCounts: emptyLifecycle,
      trends: [], trendSeries: emptyTrendSeries,
      pacing: emptyPacing,
      error: campaignsRes?.error?.message ?? "Unable to reach Meta Marketing API",
    };
  }

  // Campaigns
  const campaigns: MetaCampaign[] = (campaignsRes.data ?? []).map((r) => {
    const leads = extractLeads(r.actions);
    const spend = n(r.spend);
    return {
      id: r.campaign_id ?? "",
      name: r.campaign_name ?? "(unnamed)",
      spend,
      impressions: n(r.impressions),
      reach: n(r.reach),
      clicks: n(r.clicks),
      ctr: n(r.ctr),
      cpm: n(r.cpm),
      cpc: n(r.cpc),
      frequency: n(r.frequency),
      leads,
      cpl: leads > 0 ? spend / leads : 0,
    };
  }).sort((a, b) => b.spend - a.spend);

  // Ads with kill/scale classification
  const rawAds: MetaAd[] = (adsRes?.data ?? []).map((r) => {
    const leads = extractLeads(r.actions);
    const spend = n(r.spend);
    const cpl = leads > 0 ? spend / leads : 0;
    const base = {
      id: r.ad_id ?? "",
      name: r.ad_name ?? "(unnamed)",
      campaignName: r.campaign_name ?? "",
      spend,
      impressions: n(r.impressions),
      clicks: n(r.clicks),
      ctr: n(r.ctr),
      cpm: n(r.cpm),
      frequency: n(r.frequency),
      leads,
      cpl,
      qualityRanking: r.quality_ranking ?? null,
      engagementRateRanking: r.engagement_rate_ranking ?? null,
      conversionRateRanking: r.conversion_rate_ranking ?? null,
    };
    const lifecycle = classifyLifecycle(base);
    const { action, reason } = recommendAction({ ...base, lifecycle });
    return { ...base, lifecycle, action, actionReason: reason };
  }).sort((a, b) => b.spend - a.spend);

  const ads = rawAds.slice(0, 30);

  const killList  = rawAds.filter((a) => a.action === "kill")
    .sort((a, b) => b.spend - a.spend);
  const scaleList = rawAds.filter((a) => a.action === "scale")
    .sort((a, b) => (b.spend / Math.max(b.cpl, 1)) - (a.spend / Math.max(a.cpl, 1)));

  const lifecycleCounts: Record<Lifecycle, number> = {
    testing: 0, proven: 0, mature: 0, declining: 0, failed: 0, watch: 0,
  };
  rawAds.forEach((a) => { lifecycleCounts[a.lifecycle]++; });

  // Placements
  const placements: MetaBreakdown[] = (placementsRes?.data ?? []).map((r) => ({
    dimension: `${r.publisher_platform ?? "?"} / ${r.platform_position ?? "?"}`,
    spend: n(r.spend),
    impressions: n(r.impressions),
    reach: n(r.reach),
    clicks: n(r.clicks),
    ctr: n(r.ctr),
    cpm: n(r.cpm),
  })).sort((a, b) => b.spend - a.spend);

  // Trend series + deltas + pacing
  const trendSeries: MetaTrendPoint[] = (trendRes?.data ?? []).map((r) => ({
    date: r.date_start ?? "",
    spend: n(r.spend),
    impressions: n(r.impressions),
    clicks: n(r.clicks),
    ctr: n(r.ctr),
    cpm: n(r.cpm),
  }));
  const trends = computeDeltas(trendSeries);

  // Totals
  const totalLeads = campaigns.reduce((s, c) => s + c.leads, 0);
  const totals = campaigns.reduce(
    (acc, c) => ({
      spend: acc.spend + c.spend,
      impressions: acc.impressions + c.impressions,
      reach: acc.reach + c.reach,
      clicks: acc.clicks + c.clicks,
      ctr: 0, cpm: 0, cpc: 0, frequency: 0, leads: 0, cpl: 0,
    }),
    { spend: 0, impressions: 0, reach: 0, clicks: 0, ctr: 0, cpm: 0, cpc: 0, frequency: 0, leads: 0, cpl: 0 }
  );
  totals.ctr       = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0;
  totals.cpm       = totals.impressions > 0 ? (totals.spend / totals.impressions) * 1000 : 0;
  totals.cpc       = totals.clicks > 0 ? totals.spend / totals.clicks : 0;
  totals.frequency = totals.reach > 0 ? totals.impressions / totals.reach : 0;
  totals.leads     = totalLeads;
  totals.cpl       = totalLeads > 0 ? totals.spend / totalLeads : 0;

  const pacing = computePacing(totals.spend, trendSeries);

  // Fatigue alerts
  const fatigueAlerts: MetaFatigueAlert[] = ads
    .filter((a) => a.spend > 100 && (
      a.frequency > TARGETS.FREQUENCY_FATIGUE ||
      a.engagementRateRanking?.startsWith("BELOW_AVERAGE")
    ))
    .map((a) => {
      const reasons: string[] = [];
      if (a.frequency > TARGETS.FREQUENCY_FATIGUE) reasons.push(`Frequency ${a.frequency.toFixed(2)}`);
      if (a.engagementRateRanking?.startsWith("BELOW_AVERAGE")) reasons.push(`Engagement: ${a.engagementRateRanking.replace(/_/g, " ").toLowerCase()}`);
      if (a.qualityRanking?.startsWith("BELOW_AVERAGE")) reasons.push(`Quality: ${a.qualityRanking.replace(/_/g, " ").toLowerCase()}`);
      return {
        adId: a.id, adName: a.name, campaignName: a.campaignName,
        frequency: a.frequency, ctr: a.ctr, spend: a.spend,
        reason: reasons.join(" · "),
      };
    });

  return {
    asOf: new Date().toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
    month: new Date().toLocaleString("en-US", { month: "long" }),
    account: { id: accountId, name: "Impact 1" },
    totals,
    campaigns,
    ads,
    placements,
    fatigueAlerts,
    killList,
    scaleList,
    lifecycleCounts,
    trends,
    trendSeries,
    pacing,
  };
}
