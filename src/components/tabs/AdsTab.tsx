"use client";

import { useEffect, useState } from "react";
import { KpiCard } from "@/components/ui/KpiCard";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { StatusTag } from "@/components/ui/Badge";
import type { HyrosSummary } from "@/lib/sources/hyros";

function fmt$(n: number) {
  return n >= 1000 ? `$${(n / 1000).toFixed(1)}K` : `$${n.toFixed(0)}`;
}
function fmtRate(n: number) {
  return n > 0 ? `${n.toFixed(2)}x` : "—";
}
function shortName(name: string): string {
  if (name.length <= 45) return name;
  return name.slice(0, 43) + "…";
}

export function AdsTab() {
  const [data, setData]       = useState<HyrosSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/hyros")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) { setError(d.error); setLoading(false); return; }
        setData(d as HyrosSummary);
        setLoading(false);
      })
      .catch((e) => { setError(String(e)); setLoading(false); });
  }, []);

  const isLive = !loading && !error && data !== null;
  const t = data?.totals;

  const cplColor = !t ? "var(--muted)"
    : t.cpl <= 50 ? "var(--green)"
    : t.cpl <= 79 ? "var(--amber)"
    : "var(--red)";

  const roasColor = !t ? "var(--muted)"
    : t.roas >= 2 ? "var(--green)"
    : t.roas >= 1 ? "var(--amber)"
    : "var(--red)";

  return (
    <div>
      {/* Status banner */}
      <div style={{
        background: isLive ? "rgba(16,185,129,0.06)" : error ? "rgba(239,68,68,0.06)" : "rgba(245,158,11,0.06)",
        border: `1px solid ${isLive ? "rgba(16,185,129,0.25)" : error ? "rgba(239,68,68,0.25)" : "rgba(245,158,11,0.25)"}`,
        borderRadius: 8, padding: "8px 14px", marginBottom: 16,
        fontFamily: "'IBM Plex Mono', monospace", fontSize: 11,
        color: isLive ? "var(--green)" : error ? "var(--red)" : "var(--amber)",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <span>
          {loading ? "Loading Hyros data…"
            : isLive ? `● Live — Hyros Scientific · ${data.month} MTD`
            : `⚠ Hyros error: ${error}`}
        </span>
        {isLive && <span style={{ color: "var(--muted)" }}>Updated: {data.asOf}</span>}
      </div>

      {/* KPI Row */}
      <div className="kpi-grid">
        <KpiCard
          label="MTD Ad Spend"
          value={loading ? "…" : t ? fmt$(t.spend) : "—"}
          sub="Budget: $88K/mo · Meta (Impact 1)"
        />
        <KpiCard
          label="Cost Per Lead (CPL)"
          value={<span style={{ color: cplColor }}>{loading ? "…" : t ? fmt$(t.cpl) : "—"}</span>}
          sub="Target: $38–50 · Apr: $79.98"
          variant={t && t.cpl <= 50 ? "good" : "warn"}
        />
        <KpiCard
          label="Cost / Booked Call"
          value={loading ? "…" : t ? fmt$(t.costPerCall) : "—"}
          sub={`Target: $350 · Calls MTD: ${t?.calls ?? "—"}`}
        />
        <KpiCard
          label="Total Leads MTD"
          value={loading ? "…" : t?.leads ?? "—"}
          sub={`New leads: ${t?.newLeads ?? "—"} · Hyros attribution`}
        />
        <KpiCard
          label="ROAS (Scientific)"
          value={<span style={{ color: roasColor }}>{loading ? "…" : t ? fmtRate(t.roas) : "—"}</span>}
          sub={`Revenue: ${t ? fmt$(t.revenue) : "—"} · Target: 2.0x`}
          variant={t && t.roas >= 2 ? "good" : "warn"}
        />
      </div>

      <div className="two-col">
        {/* MTD Summary */}
        <div>
          <SectionTitle>
            Hyros MTD Summary{" "}
            <StatusTag variant={isLive ? "live" : "pending"}>
              {isLive ? "Live" : loading ? "Loading" : "Error"}
            </StatusTag>
          </SectionTitle>
          <div className="dt">
            <div className="dth" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
              <div>Metric</div>
              <div>MTD Actual</div>
              <div>vs Target</div>
            </div>
            {[
              { label: "Ad Spend",     val: t ? fmt$(t.spend)       : "—", target: "$88K/mo",  ok: t ? t.spend <= 88000   : null },
              { label: "CPL",          val: t ? fmt$(t.cpl)         : "—", target: "$38–50",   ok: t ? t.cpl <= 50        : null },
              { label: "Cost/Call",    val: t ? fmt$(t.costPerCall) : "—", target: "$350",     ok: t ? t.costPerCall<=350 : null },
              { label: "ROAS",         val: t ? fmtRate(t.roas)     : "—", target: ">2.0x",   ok: t ? t.roas >= 2        : null },
              { label: "Total Revenue",val: t ? fmt$(t.revenue)     : "—", target: "—",       ok: null },
              { label: "Sales (Hyros)",val: t ? String(t.sales)     : "—", target: "—",       ok: null },
              { label: "CAC",          val: t ? fmt$(t.cac)         : "—", target: "—",       ok: null },
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

        {/* Meta MCP status */}
        <div>
          <SectionTitle>
            Meta Ads MCP{" "}
            <StatusTag variant="pending">Pending Rollout</StatusTag>
          </SectionTitle>
          <div style={{
            background: "rgba(245,158,11,0.04)",
            border: "1px solid rgba(245,158,11,0.2)",
            borderRadius: 8, padding: "16px 18px",
            fontFamily: "'IBM Plex Mono', monospace", fontSize: 12,
            color: "var(--muted)", lineHeight: 1.7,
          }}>
            <div style={{ color: "var(--amber)", marginBottom: 8, fontSize: 13 }}>
              ⏳ IFCA Main 1 &amp; Impact 1
            </div>
            Meta&apos;s Ads MCP is enabled but still rolling out to the IFCA business
            ad accounts. Impressions, clicks, CTR, and CPC will populate here
            automatically once Meta grants access — no code changes needed.
            <div style={{ marginTop: 10, color: "var(--muted)", fontSize: 11 }}>
              Accounts pending: IFCA Main 1 · Impact 1
            </div>
          </div>
        </div>
      </div>

      {/* Active Campaign Breakdown */}
      <SectionTitle>
        Active Campaign Breakdown{" "}
        <StatusTag variant={isLive ? "live" : "pending"}>
          {isLive ? `${data.campaigns.length} active` : "Loading"}
        </StatusTag>
      </SectionTitle>
      <div className="dt">
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

        {isLive && data.campaigns.map((c, i) => {
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

        {isLive && (
          <div className="dttot" style={{ gridTemplateColumns: "2fr repeat(6, 1fr)" }}>
            <div>TOTALS</div>
            <div>{fmt$(t!.spend)}</div>
            <div>{t!.leads}</div>
            <div>{fmt$(t!.cpl)}</div>
            <div>{t!.calls}</div>
            <div>{fmt$(t!.revenue)}</div>
            <div>{fmtRate(t!.roas)}</div>
          </div>
        )}
      </div>
    </div>
  );
}
