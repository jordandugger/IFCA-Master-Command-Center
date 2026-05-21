// Meta Marketing API v22.0 — pulls live ad performance from Impact 1 ad account
// Auth: System User access token (server-side only)

const API_VERSION = "v22.0";
const BASE = `https://graph.facebook.com/${API_VERSION}`;

export interface MetaCampaign {
  id: string;
  name: string;
  spend: number;
  impressions: number;
  reach: number;
  clicks: number;
  ctr: number;       // % link CTR
  cpm: number;       // $ per 1k impressions
  cpc: number;       // $ per click
  frequency: number; // impressions / reach
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
  qualityRanking: string | null;
  engagementRateRanking: string | null;
  conversionRateRanking: string | null;
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
  };
  campaigns: MetaCampaign[];     // ranked by spend
  ads: MetaAd[];                 // top 20 by spend
  placements: MetaBreakdown[];   // by publisher_platform + platform_position
  fatigueAlerts: MetaFatigueAlert[];
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

async function metaGet<T>(path: string, params: Record<string, string>): Promise<InsightsResponse<T> | null> {
  const token = process.env.META_ACCESS_TOKEN;
  if (!token) return null;

  const url = new URL(`${BASE}${path}`);
  url.searchParams.set("access_token", token);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  try {
    const res = await fetch(url.toString(), { cache: "no-store" });
    const json = (await res.json()) as InsightsResponse<T>;
    if (json.error) {
      console.error(`Meta API error on ${path}:`, json.error);
    }
    return json;
  } catch (e) {
    console.error(`Meta API fetch threw on ${path}:`, e);
    return null;
  }
}

// ── main fetcher ────────────────────────────────────────────────────────────
export async function fetchMeta(adAccountId?: string): Promise<MetaSummary | null> {
  const token = process.env.META_ACCESS_TOKEN;
  if (!token) {
    return {
      asOf: new Date().toISOString(),
      month: new Date().toLocaleString("en-US", { month: "long" }),
      account: { id: "—", name: "Not connected" },
      totals: { spend: 0, impressions: 0, reach: 0, clicks: 0, ctr: 0, cpm: 0, cpc: 0, frequency: 0 },
      campaigns: [], ads: [], placements: [], fatigueAlerts: [],
      error: "META_ACCESS_TOKEN not set in environment",
    };
  }

  const accountRaw = adAccountId || process.env.META_AD_ACCOUNT_IMPACT_1 || "623048835231084";
  const accountId  = accountRaw.startsWith("act_") ? accountRaw : `act_${accountRaw}`;
  const timeRange  = JSON.stringify({ since: firstOfMonth(), until: todayStr() });

  // 1) Campaign-level insights
  const campaignsRes = await metaGet<RawCampaign>(`/${accountId}/insights`, {
    level: "campaign",
    time_range: timeRange,
    fields: "campaign_id,campaign_name,spend,impressions,reach,clicks,ctr,cpm,cpc,frequency",
    limit: "100",
  });

  if (!campaignsRes || campaignsRes.error) {
    return {
      asOf: new Date().toISOString(),
      month: new Date().toLocaleString("en-US", { month: "long" }),
      account: { id: accountId, name: "Impact 1" },
      totals: { spend: 0, impressions: 0, reach: 0, clicks: 0, ctr: 0, cpm: 0, cpc: 0, frequency: 0 },
      campaigns: [], ads: [], placements: [], fatigueAlerts: [],
      error: campaignsRes?.error?.message ?? "Unable to reach Meta Marketing API",
    };
  }

  const campaigns: MetaCampaign[] = (campaignsRes.data ?? [])
    .map((r) => ({
      id: r.campaign_id ?? "",
      name: r.campaign_name ?? "(unnamed)",
      spend: n(r.spend),
      impressions: n(r.impressions),
      reach: n(r.reach),
      clicks: n(r.clicks),
      ctr: n(r.ctr),
      cpm: n(r.cpm),
      cpc: n(r.cpc),
      frequency: n(r.frequency),
    }))
    .sort((a, b) => b.spend - a.spend);

  // 2) Ad-level insights (creative performance)
  const adsRes = await metaGet<RawAd>(`/${accountId}/insights`, {
    level: "ad",
    time_range: timeRange,
    fields: "ad_id,ad_name,campaign_name,spend,impressions,clicks,ctr,cpm,frequency,quality_ranking,engagement_rate_ranking,conversion_rate_ranking",
    limit: "200",
  });

  const ads: MetaAd[] = (adsRes?.data ?? [])
    .map((r) => ({
      id: r.ad_id ?? "",
      name: r.ad_name ?? "(unnamed)",
      campaignName: r.campaign_name ?? "",
      spend: n(r.spend),
      impressions: n(r.impressions),
      clicks: n(r.clicks),
      ctr: n(r.ctr),
      cpm: n(r.cpm),
      frequency: n(r.frequency),
      qualityRanking: r.quality_ranking ?? null,
      engagementRateRanking: r.engagement_rate_ranking ?? null,
      conversionRateRanking: r.conversion_rate_ranking ?? null,
    }))
    .sort((a, b) => b.spend - a.spend)
    .slice(0, 20);

  // 3) Placement breakdown (publisher_platform + platform_position)
  const placementsRes = await metaGet<RawPlacement>(`/${accountId}/insights`, {
    level: "account",
    time_range: timeRange,
    fields: "spend,impressions,reach,clicks,ctr,cpm",
    breakdowns: "publisher_platform,platform_position",
    limit: "50",
  });

  const placements: MetaBreakdown[] = (placementsRes?.data ?? [])
    .map((r) => ({
      dimension: `${r.publisher_platform ?? "?"} / ${r.platform_position ?? "?"}`,
      spend: n(r.spend),
      impressions: n(r.impressions),
      reach: n(r.reach),
      clicks: n(r.clicks),
      ctr: n(r.ctr),
      cpm: n(r.cpm),
    }))
    .sort((a, b) => b.spend - a.spend);

  // 4) Compute account-level totals
  const totals = campaigns.reduce(
    (acc, c) => ({
      spend: acc.spend + c.spend,
      impressions: acc.impressions + c.impressions,
      reach: acc.reach + c.reach,
      clicks: acc.clicks + c.clicks,
      ctr: 0, cpm: 0, cpc: 0, frequency: 0,
    }),
    { spend: 0, impressions: 0, reach: 0, clicks: 0, ctr: 0, cpm: 0, cpc: 0, frequency: 0 }
  );
  totals.ctr       = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0;
  totals.cpm       = totals.impressions > 0 ? (totals.spend / totals.impressions) * 1000 : 0;
  totals.cpc       = totals.clicks > 0 ? totals.spend / totals.clicks : 0;
  totals.frequency = totals.reach > 0 ? totals.impressions / totals.reach : 0;

  // 5) Fatigue alerts — Frequency > 3.5 OR engagement_rate_ranking = BELOW_AVERAGE
  const fatigueAlerts: MetaFatigueAlert[] = ads
    .filter((a) => a.spend > 100 && (
      a.frequency > 3.5 ||
      a.engagementRateRanking === "BELOW_AVERAGE_LOW_10" ||
      a.engagementRateRanking === "BELOW_AVERAGE_LOW_20"
    ))
    .map((a) => {
      const reasons: string[] = [];
      if (a.frequency > 3.5) reasons.push(`Frequency ${a.frequency.toFixed(2)}`);
      if (a.engagementRateRanking?.includes("BELOW_AVERAGE")) reasons.push(`Engagement: ${a.engagementRateRanking.replace(/_/g, " ").toLowerCase()}`);
      if (a.qualityRanking?.includes("BELOW_AVERAGE")) reasons.push(`Quality: ${a.qualityRanking.replace(/_/g, " ").toLowerCase()}`);
      return {
        adId: a.id,
        adName: a.name,
        campaignName: a.campaignName,
        frequency: a.frequency,
        ctr: a.ctr,
        spend: a.spend,
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
  };
}
