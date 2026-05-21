"use client";

import { useEffect, useState } from "react";
import { KpiCard } from "@/components/ui/KpiCard";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Badge, StatusTag } from "@/components/ui/Badge";
import type { HyrosSummary } from "@/lib/sources/hyros";
import type { MetaSummary } from "@/lib/sources/meta";

function fmt$(n: number) {
  if (!n) return "—";
  return n >= 1000 ? `$${(n / 1000).toFixed(1)}K` : `$${n.toFixed(0)}`;
}
function fmt$d(n: number) {
  if (!n) return "—";
  return `$${n.toFixed(2)}`;
}
function fmtN(n: number) {
  if (!n) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toLocaleString();
}
function fmtPctRaw(n: number) {
  return n > 0 ? `${n.toFixed(2)}%` : "—";
}
function fmtRate(n: number) {
  return n > 0 ? `${n.toFixed(2)}x` : "—";
}
function fmtFreq(n: number) {
  return n > 0 ? `${n.toFixed(2)}` : "—";
}
function shortName(name: string, max = 45): string {
  if (!name) return "—";
  if (name.length <= max) return name;
  return name.slice(0, max - 2) + "…";
}
function rankingBadge(r: string | null) {
  if (!r) return <span style={{ color: "var(--muted)" }}>—</span>;
  const clean = r.replace(/_/g, " ").toLowerCase();
  const variant: "green" | "amber" | "red" =
    r.startsWith("ABOVE") ? "green" :
    r === "AVERAGE" ? "amber" :
    "red";
  return <Badge variant={variant}>{clean}</Badge>;
}

export function AdsTab() {
  const [hyros, setHyros] = useState<HyrosSummary | null>(null);
  const [meta, setMeta]   = useState<MetaSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [hyrosError, setHyrosError] = useState<string | null>(null);
  const [metaError, setMetaError]   = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/hyros").then((r) => r.json()).catch(() => null),
      fetch("/api/meta").then((r) => r.json()).catch(() => null),
    ]).then(([h, m]) => {
      if (h?.error) setHyrosError(h.error); else if (h) setHyros(h);
      if (m?.error) setMetaError(m.error); else if (m) setMeta(m);
      setLoading(false);
    });
  }, []);

  const hyrosLive = !loading && !hyrosError && hyros !== null;
  const metaLive  = !loading && !metaError  && meta !== null && meta.totals.spend > 0;
  const ht = hyros?.totals;
  const mt = meta?.totals;

  const cplColor = !ht ? "var(--muted)"
    : ht.cpl <= 50 ? "var(--green)"
    : ht.cpl <= 79 ? "var(--amber)"
    : "var(--red)";

  const roasColor = !ht ? "var(--muted)"
    : ht.roas >= 2 ? "var(--green)"
    : ht.roas >= 1 ? "var(--amber)"
    : "var(--red)";

  const freqColor = !mt ? "var(--muted)"
    : mt.frequency <= 2.5 ? "var(--green)"
    : mt.frequency <= 3.5 ? "var(--amber)"
    : "var(--red)";

  const ctrColor = !mt ? "var(--muted)"
    : mt.ctr >= 1.5 ? "var(--green)"
    : mt.ctr >= 1.0 ? "var(--amber)"
    : "var(--red)";

  return (
    <div>
      {/* Status banner */}
      <div style={{
        background: hyrosLive ? "rgba(16,185,129,0.06)" : "rgba(245,158,11,0.06)",
        border: `1px solid ${hyrosLive ? "rgba(16,185,129,0.25)" : "rgba(245,158,11,0.25)"}`,
        borderRadius: 8, padding: "8px 14px", marginBottom: 16,
        fontFamily: "'IBM Plex Mono', monospace", fontSize: 11,
        color: hyrosLive ? "var(--green)" : "var(--amber)",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <span>
          {loading ? "Loading Hyros + Meta data…"
            : `● Live — Hyros ${hyrosLive ? "✓" : "⚠"} · Meta ${metaLive ? "✓" : "⚠"} · ${hyros?.month ?? meta?.month ?? ""} MTD`}
        </span>
        {(hyros || meta) && (
          <span style={{ color: "var(--muted)" }}>Updated: {hyros?.asOf ?? meta?.asOf}</span>
        )}
      </div>

      {/* ── Top KPI Row (Hyros-driven attribution) ── */}
      <div className="kpi-grid">
        <KpiCard
          label="MTD Ad Spend"
          value={loading ? "…" : ht ? fmt$(ht.spend) : "—"}
          sub="Budget: $88K/mo · Meta (Impact 1)"
        />
        <KpiCard
          label="Cost Per Lead (CPL)"
          value={<span style={{ color: cplColor }}>{loading ? "…" : ht ? fmt$(ht.cpl) : "—"}</span>}
          sub="Target: $38–50 · Apr: $79.98"
          variant={ht && ht.cpl <= 50 ? "good" : "warn"}
        />
        <KpiCard
          label="Cost / Booked Call"
          value={loading ? "…" : ht ? fmt$(ht.costPerCall) : "—"}
          sub={`Target: $350 · Calls MTD: ${ht?.calls ?? "—"}`}
        />
        <KpiCard
          label="Total Leads MTD"
          value={loading ? "…" : ht?.leads ?? "—"}
          sub={`New leads: ${ht?.newLeads ?? "—"} · Hyros attribution`}
        />
        <KpiCard
          label="ROAS (Scientific)"
          value={<span style={{ color: roasColor }}>{loading ? "…" : ht ? fmtRate(ht.roas) : "—"}</span>}
          sub={`Revenue: ${ht ? fmt$(ht.revenue) : "—"} · Target: 2.0x`}
          variant={ht && ht.roas >= 2 ? "good" : "warn"}
        />
      </div>

      {/* ── NEW: Meta Auction Health Strip ── */}
      <SectionTitle>
        Meta Auction Health{" "}
        <StatusTag variant={metaLive ? "live" : metaError ? "pending" : "pending"}>
          {metaLive ? "Live" : metaError ? "Error" : "Connecting"}
        </StatusTag>
      </SectionTitle>

      {metaError && (
        <div style={{
          background: "rgba(239,68,68,0.06)",
          border: "1px solid rgba(239,68,68,0.25)",
          borderRadius: 8, padding: "12px 16px", marginBottom: 16,
          fontSize: 12, color: "var(--red)",
        }}>
          ⚠ Meta API error: {metaError}
        </div>
      )}

      {!metaError && (
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 10,
          marginBottom: 24,
        }}>
          <AuctionStat label="CPM"        value={mt ? fmt$d(mt.cpm) : "…"}      sub="Cost per 1k impressions" color="var(--gold)" />
          <AuctionStat label="CTR"        value={mt ? fmtPctRaw(mt.ctr) : "…"}  sub="Link click-through"      color={ctrColor} />
          <AuctionStat label="CPC"        value={mt ? fmt$d(mt.cpc) : "…"}      sub="Cost per click"           color="var(--text)" />
          <AuctionStat label="Frequency"  value={mt ? fmtFreq(mt.frequency) : "…"} sub="Impressions / reach"   color={freqColor} />
          <AuctionStat label="Impressions" value={mt ? fmtN(mt.impressions) : "…"} sub="Total served"           color="var(--text)" />
          <AuctionStat label="Reach"      value={mt ? fmtN(mt.reach) : "…"}     sub="Unique accounts"          color="var(--text)" />
        </div>
      )}

      {/* ── Hyros + Meta side-by-side details ── */}
      <div className="two-col">
        <div>
          <SectionTitle>
            Hyros MTD Summary{" "}
            <StatusTag variant={hyrosLive ? "live" : "pending"}>
              {hyrosLive ? "Live" : loading ? "Loading" : "Error"}
            </StatusTag>
          </SectionTitle>
          <div className="dt">
            <div className="dth" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
              <div>Metric</div>
              <div>MTD Actual</div>
              <div>vs Target</div>
            </div>
            {[
              { label: "Ad Spend",     val: ht ? fmt$(ht.spend)       : "—", target: "$88K/mo",  ok: ht ? ht.spend <= 88000   : null },
              { label: "CPL",          val: ht ? fmt$(ht.cpl)         : "—", target: "$38–50",   ok: ht ? ht.cpl <= 50        : null },
              { label: "Cost/Call",    val: ht ? fmt$(ht.costPerCall) : "—", target: "$350",     ok: ht ? ht.costPerCall<=350 : null },
              { label: "ROAS",         val: ht ? fmtRate(ht.roas)     : "—", target: ">2.0x",   ok: ht ? ht.roas >= 2        : null },
              { label: "Total Revenue",val: ht ? fmt$(ht.revenue)     : "—", target: "—",       ok: null },
              { label: "Sales (Hyros)",val: ht ? String(ht.sales)     : "—", target: "—",       ok: null },
              { label: "CAC",          val: ht ? fmt$(ht.cac)         : "—", target: "—",       ok: null },
            ].map((row) => (
              <div key={row.label} className="dtr" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
                <div className="dtc nm">{row.label}</div>
                <div className="dtc mono">{row.val}</div>
                <div className="dtc mono">
                  {row.ok === null ? <span style={{ color: "var(--muted)" }}>{row.target}</span>
                    : row.ok
                    ? <span style={{ color: "var(--green)" }}>✓ {row.target}</span>
                    : <span style={{ color: "var(--red)" }}>⚠ {row.target}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <SectionTitle>
            Meta Account Summary{" "}
            <StatusTag variant={metaLive ? "live" : "pending"}>
              {metaLive ? `${meta?.account.name}` : "Connecting"}
            </StatusTag>
          </SectionTitle>
          {!metaLive && (
            <div style={{
              background: "rgba(245,158,11,0.04)",
              border: "1px solid rgba(245,158,11,0.2)",
              borderRadius: 8, padding: "16px 18px",
              fontFamily: "'IBM Plex Mono', monospace", fontSize: 12,
              color: "var(--muted)", lineHeight: 1.7,
            }}>
              <div style={{ color: "var(--amber)", marginBottom: 8, fontSize: 13 }}>
                {metaError ? "⚠ Meta connection error" : "⏳ Initializing Meta API connection..."}
              </div>
              {metaError ?? "Validating system user token and ad account permissions."}
            </div>
          )}

          {metaLive && mt && meta && (
            <div className="dt">
              <div className="dth" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
                <div>Metric</div><div>MTD</div>
              </div>
              {[
                { label: "Account",       val: meta.account.name },
                { label: "Spend",         val: fmt$(mt.spend) },
                { label: "Impressions",   val: fmtN(mt.impressions) },
                { label: "Reach",         val: fmtN(mt.reach) },
                { label: "Clicks",        val: fmtN(mt.clicks) },
                { label: "CTR",           val: fmtPctRaw(mt.ctr) },
                { label: "CPM",           val: fmt$d(mt.cpm) },
                { label: "CPC",           val: fmt$d(mt.cpc) },
                { label: "Frequency",     val: fmtFreq(mt.frequency) },
                { label: "Active Campaigns", val: String(meta.campaigns.length) },
              ].map((r, i) => (
                <div key={i} className="dtr" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
                  <div className="dtc nm">{r.label}</div>
                  <div className="dtc mono">{r.val}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Hyros Active Campaign Breakdown (existing) ── */}
      <SectionTitle>
        Hyros Campaign Breakdown — Revenue Attribution{" "}
        <StatusTag variant={hyrosLive ? "live" : "pending"}>
          {hyrosLive ? `${hyros.campaigns.length} active` : "Loading"}
        </StatusTag>
      </SectionTitle>
      <div className="dt" style={{ marginBottom: 24 }}>
        <div className="dth" style={{ gridTemplateColumns: "2fr repeat(6, 1fr)" }}>
          <div>Campaign</div>
          <div>Spend</div>
          <div>Leads</div>
          <div>CPL</div>
          <div>Calls</div>
          <div>Revenue</div>
          <div>ROAS</div>
        </div>

        {loading && (
          <div className="dtr" style={{ gridTemplateColumns: "2fr repeat(6, 1fr)" }}>
            <div className="dtc" style={{ color: "var(--muted)", gridColumn: "1 / -1" }}>Loading…</div>
          </div>
        )}

        {hyrosLive && hyros.campaigns.map((c, i) => {
          const roasC = c.roas >= 2 ? "var(--green)" : c.roas >= 1 ? "var(--amber)" : c.roas > 0 ? "var(--red)" : "var(--muted)";
          return (
            <div key={i} className="dtr" style={{ gridTemplateColumns: "2fr repeat(6, 1fr)" }}>
              <div className="dtc nm" title={c.name}>{shortName(c.name)}</div>
              <div className="dtc mono">{fmt$(c.spend)}</div>
              <div className="dtc mono">{c.leads || "—"}</div>
              <div className="dtc mono">{c.cpl > 0 ? fmt$(c.cpl) : "—"}</div>
              <div className="dtc mono">{c.calls || "—"}</div>
              <div className="dtc mono" style={{ color: c.revenue > 0 ? "var(--green)" : "var(--muted)" }}>
                {c.revenue > 0 ? fmt$(c.revenue) : "—"}
              </div>
              <div className="dtc mono" style={{ color: roasC }}>
                {c.roas > 0 ? fmtRate(c.roas) : "—"}
              </div>
            </div>
          );
        })}

        {hyrosLive && ht && (
          <div className="dttot" style={{ gridTemplateColumns: "2fr repeat(6, 1fr)" }}>
            <div>TOTALS</div>
            <div>{fmt$(ht.spend)}</div>
            <div>{ht.leads}</div>
            <div>{fmt$(ht.cpl)}</div>
            <div>{ht.calls}</div>
            <div>{fmt$(ht.revenue)}</div>
            <div>{fmtRate(ht.roas)}</div>
          </div>
        )}
      </div>

      {/* ── NEW: Meta Campaign Breakdown (auction-level metrics) ── */}
      {metaLive && meta && meta.campaigns.length > 0 && (
        <>
          <SectionTitle>
            Meta Campaign Breakdown — Auction-Level Performance{" "}
            <StatusTag variant="live">{meta.campaigns.length} campaigns</StatusTag>
          </SectionTitle>
          <ScrollTable
            cols={[
              { label: "Campaign", w: "2.5fr" },
              { label: "Spend" },
              { label: "Impressions" },
              { label: "Reach" },
              { label: "Clicks" },
              { label: "CTR" },
              { label: "CPM" },
              { label: "CPC" },
              { label: "Freq" },
            ]}
          >
            {meta.campaigns.slice(0, 15).map((c) => (
              <Row key={c.id} cols={[
                { v: shortName(c.name, 55), w: "2.5fr", nm: true, title: c.name },
                { v: fmt$(c.spend) },
                { v: fmtN(c.impressions) },
                { v: fmtN(c.reach) },
                { v: fmtN(c.clicks) },
                { v: <span style={{ color: c.ctr >= 1.5 ? "var(--green)" : c.ctr >= 1 ? "var(--amber)" : "var(--red)" }}>{fmtPctRaw(c.ctr)}</span> },
                { v: fmt$d(c.cpm) },
                { v: fmt$d(c.cpc) },
                { v: <span style={{ color: c.frequency <= 2.5 ? "var(--green)" : c.frequency <= 3.5 ? "var(--amber)" : "var(--red)" }}>{fmtFreq(c.frequency)}</span> },
              ]} />
            ))}
          </ScrollTable>
        </>
      )}

      {/* ── NEW: Meta Creative Performance (top ads) ── */}
      {metaLive && meta && meta.ads.length > 0 && (
        <>
          <SectionTitle>
            Top Creative Performance — Top 20 by Spend{" "}
            <StatusTag variant="live">Meta</StatusTag>
          </SectionTitle>
          <ScrollTable
            cols={[
              { label: "Ad", w: "2.5fr" },
              { label: "Campaign", w: "2fr" },
              { label: "Spend" },
              { label: "Impressions" },
              { label: "CTR" },
              { label: "CPM" },
              { label: "Freq" },
              { label: "Quality" },
              { label: "Engagement" },
              { label: "Conversion" },
            ]}
          >
            {meta.ads.map((a) => (
              <Row key={a.id} cols={[
                { v: shortName(a.name, 45), w: "2.5fr", nm: true, title: a.name },
                { v: shortName(a.campaignName, 35), w: "2fr", title: a.campaignName },
                { v: fmt$(a.spend) },
                { v: fmtN(a.impressions) },
                { v: <span style={{ color: a.ctr >= 1.5 ? "var(--green)" : a.ctr >= 1 ? "var(--amber)" : "var(--red)" }}>{fmtPctRaw(a.ctr)}</span> },
                { v: fmt$d(a.cpm) },
                { v: <span style={{ color: a.frequency <= 2.5 ? "var(--green)" : a.frequency <= 3.5 ? "var(--amber)" : "var(--red)" }}>{fmtFreq(a.frequency)}</span> },
                { v: rankingBadge(a.qualityRanking) },
                { v: rankingBadge(a.engagementRateRanking) },
                { v: rankingBadge(a.conversionRateRanking) },
              ]} />
            ))}
          </ScrollTable>
        </>
      )}

      {/* ── NEW: Placement Breakdown ── */}
      {metaLive && meta && meta.placements.length > 0 && (
        <>
          <SectionTitle>
            Placement Breakdown — Where Ads Are Showing{" "}
            <StatusTag variant="live">{meta.placements.length} placements</StatusTag>
          </SectionTitle>
          <div className="dt" style={{ marginBottom: 24 }}>
            <div className="dth" style={{ gridTemplateColumns: "2fr repeat(6, 1fr)" }}>
              <div>Placement</div>
              <div>Spend</div>
              <div>Impressions</div>
              <div>Reach</div>
              <div>Clicks</div>
              <div>CTR</div>
              <div>CPM</div>
            </div>
            {meta.placements.slice(0, 10).map((p, i) => (
              <div key={i} className="dtr" style={{ gridTemplateColumns: "2fr repeat(6, 1fr)" }}>
                <div className="dtc nm">{p.dimension}</div>
                <div className="dtc mono">{fmt$(p.spend)}</div>
                <div className="dtc mono">{fmtN(p.impressions)}</div>
                <div className="dtc mono">{fmtN(p.reach)}</div>
                <div className="dtc mono">{fmtN(p.clicks)}</div>
                <div className="dtc mono">{fmtPctRaw(p.ctr)}</div>
                <div className="dtc mono">{fmt$d(p.cpm)}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── NEW: Fatigue Watch ── */}
      <SectionTitle>
        Fatigue Watch — Creative Refresh Candidates{" "}
        <StatusTag variant={meta?.fatigueAlerts.length ? "pending" : "live"}>
          {meta?.fatigueAlerts.length ? `${meta.fatigueAlerts.length} flagged` : "All clear"}
        </StatusTag>
      </SectionTitle>
      {!meta?.fatigueAlerts.length && metaLive && (
        <div style={{
          padding: 20, borderRadius: 8,
          background: "rgba(16,185,129,0.06)",
          border: "1px solid rgba(16,185,129,0.2)",
          color: "var(--green)", textAlign: "center", marginBottom: 24,
        }}>
          🟢 No ad fatigue detected. Frequency &lt; 3.5 and engagement rankings healthy across active creatives.
        </div>
      )}
      {meta && meta.fatigueAlerts.length > 0 && (
        <div className="dt" style={{ marginBottom: 24 }}>
          <div className="dth" style={{ gridTemplateColumns: "2.5fr 2fr repeat(4, 1fr)" }}>
            <div>Ad</div>
            <div>Campaign</div>
            <div>Spend</div>
            <div>Frequency</div>
            <div>CTR</div>
            <div>Reason</div>
          </div>
          {meta.fatigueAlerts.map((a) => (
            <div key={a.adId} className="dtr" style={{
              gridTemplateColumns: "2.5fr 2fr repeat(4, 1fr)",
              borderLeft: "3px solid var(--amber)",
            }}>
              <div className="dtc nm" title={a.adName}>{shortName(a.adName, 40)}</div>
              <div className="dtc" title={a.campaignName} style={{ fontSize: 11, color: "var(--muted)" }}>
                {shortName(a.campaignName, 30)}
              </div>
              <div className="dtc mono">{fmt$(a.spend)}</div>
              <div className="dtc mono" style={{ color: "var(--amber)" }}>{fmtFreq(a.frequency)}</div>
              <div className="dtc mono">{fmtPctRaw(a.ctr)}</div>
              <div className="dtc" style={{ fontSize: 10, color: "var(--muted)" }}>{a.reason}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Funnel Targets (existing) ── */}
      <SectionTitle>Funnel Economics — Targets</SectionTitle>
      <div className="dt">
        <div className="dth" style={{ gridTemplateColumns: "200px repeat(4, 1fr)" }}>
          <div>Metric</div>
          <div>Apr Actual</div>
          <div>Target</div>
          <div>MTD Actual</div>
          <div>Status</div>
        </div>
        {[
          { metric: "CPL",             apr: "$79.98", target: "$38–50",  actual: ht ? fmt$(ht.cpl)        : "—", ok: ht ? ht.cpl <= 50        : null },
          { metric: "Cost / Call",     apr: "$401",   target: "$350",    actual: ht ? fmt$(ht.costPerCall) : "—", ok: ht ? ht.costPerCall <= 350 : null },
          { metric: "Ad Spend",        apr: "—",      target: "$88K/mo", actual: ht ? fmt$(ht.spend)      : "—", ok: ht ? ht.spend <= 88000    : null },
          { metric: "ROAS",            apr: "—",      target: ">2.0x",   actual: ht ? fmtRate(ht.roas)    : "—", ok: ht ? ht.roas >= 2.0       : null },
          { metric: "CTR (Meta)",      apr: "—",      target: ">1.5%",   actual: mt ? fmtPctRaw(mt.ctr)   : "—", ok: mt ? mt.ctr >= 1.5        : null },
          { metric: "Frequency (Meta)", apr: "—",     target: "<3.5",    actual: mt ? fmtFreq(mt.frequency) : "—", ok: mt ? mt.frequency <= 3.5 : null },
        ].map((row) => (
          <div key={row.metric} className="dtr" style={{ gridTemplateColumns: "200px repeat(4, 1fr)" }}>
            <div className="dtc nm">{row.metric}</div>
            <div className="dtc mono" style={{ color: "var(--muted)" }}>{row.apr}</div>
            <div className="dtc mono">{row.target}</div>
            <div className="dtc mono">{row.actual}</div>
            <div className="dtc mono">
              {row.ok === null ? "—"
                : row.ok
                ? <span style={{ color: "var(--green)" }}>✓ On track</span>
                : <span style={{ color: "var(--red)" }}>⚠ Off target</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── helpers ─────────────────────────────────────────────────────────────────
function AuctionStat({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div style={{
      background: "var(--bg-card)",
      border: "1px solid var(--border)",
      borderRadius: 8, padding: "10px 12px",
    }}>
      <div style={{ fontSize: 9, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color, marginTop: 2, fontFamily: "'IBM Plex Mono', monospace" }}>{value}</div>
      <div style={{ fontSize: 9, color: "var(--muted)", marginTop: 2 }}>{sub}</div>
    </div>
  );
}

function ScrollTable({ cols, children }: { cols: { label: string; w?: string }[]; children: React.ReactNode }) {
  const gridCols = cols.map((c) => c.w ?? "1fr").join(" ");
  return (
    <div style={{ overflowX: "auto", border: "1px solid var(--border)", borderRadius: 8, marginBottom: 16 }}>
      <div className="dt" style={{ minWidth: Math.max(cols.length * 110, 1000) }}>
        <div className="dth" style={{ gridTemplateColumns: gridCols, fontSize: 10 }}>
          {cols.map((c, i) => <div key={i}>{c.label}</div>)}
        </div>
        {children}
      </div>
    </div>
  );
}

function Row({ cols }: { cols: { v: React.ReactNode; w?: string; nm?: boolean; title?: string }[] }) {
  const gridCols = cols.map((c) => c.w ?? "1fr").join(" ");
  return (
    <div className="dtr" style={{ gridTemplateColumns: gridCols }}>
      {cols.map((c, i) => (
        <div key={i} className={c.nm ? "dtc nm" : "dtc mono"} title={c.title}>{c.v}</div>
      ))}
    </div>
  );
}
