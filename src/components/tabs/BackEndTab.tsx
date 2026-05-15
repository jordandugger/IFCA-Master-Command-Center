"use client";

import { useEffect, useState } from "react";
import { KpiCard } from "@/components/ui/KpiCard";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Badge, StatusTag } from "@/components/ui/Badge";
import type { BackendSummary } from "@/lib/sources/backend";

function fmt$(n: number): string {
  if (n === 0) return "—";
  if (Math.abs(n) >= 1000) return `$${(n / 1000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}
function fmtPct(n: number): string {
  return n === 0 ? "—" : `${n.toFixed(1)}%`;
}

export function BackEndTab() {
  const [data, setData] = useState<BackendSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/backend")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) { setError(d.error); setLoading(false); return; }
        setData(d as BackendSummary); setLoading(false);
      })
      .catch((e) => { setError(String(e)); setLoading(false); });
  }, []);

  const isLive = !loading && !error && data !== null;
  const team = data?.teamTotals;
  const health = data?.clientHealth;

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
          {loading ? "Loading SC + back-end data…"
            : isLive ? `● Live — ${data.month} Back-End · SC Leaderboard + Upsell Tracker + Cancellations`
            : `⚠ Back-end error: ${error}`}
        </span>
        {isLive && <span style={{ color: "var(--muted)" }}>Updated: {data.asOf}</span>}
      </div>

      {/* Hero KPIs */}
      <div className="kpi-grid">
        <KpiCard
          label="Total BE Resells MTD"
          value={loading ? "…" : team?.totalResellsActual ?? "—"}
          sub={`Proj: ${team?.totalUpsellProj ?? "—"} · ${team ? fmtPct(team.totalPct) : "—"} conversion`}
        />
        <KpiCard
          label="BE Revenue Generated"
          value={<span style={{ color: "var(--gold)" }}>{loading ? "…" : team ? fmt$(team.contracted) : "—"}</span>}
          sub={`Cash collected: ${team ? fmt$(team.collected) : "—"}`}
          variant="highlight"
        />
        <KpiCard
          label="FE Upsell Conversion"
          value={loading ? "…" : team ? fmtPct(team.fePct) : "—"}
          sub={`${team?.feUpsellsActual ?? "—"}/${team?.feContractsEnding ?? "—"} contracts ending`}
        />
        <KpiCard
          label="Active Clients"
          value={loading ? "…" : health?.totalActive ?? "—"}
          sub={`IFCA: ${health?.activeIFCA ?? "—"} · Legacy: ${health?.activeLegacy ?? "—"} · 7FCEO: ${health?.active7FCEO ?? "—"}`}
        />
        <KpiCard
          label="Retention Rate"
          value={
            <span style={{
              color: health && health.retentionPct >= 85 ? "var(--green)"
                : health && health.retentionPct >= 80 ? "var(--amber)" : "var(--red)"
            }}>{loading ? "…" : health ? fmtPct(health.retentionPct) : "—"}</span>
          }
          sub={`Churn: ${health ? fmtPct(health.totalChurnPct) : "—"} · ${health?.totalOffboarded ?? "—"} offboarded`}
          variant={health && health.retentionPct >= 85 ? "good" : "warn"}
        />
      </div>

      {/* Success Coach Leaderboard */}
      <SectionTitle>
        Success Coach Performance — {data?.month ?? ""}{" "}
        <StatusTag variant={isLive ? "live" : "pending"}>
          {isLive ? `${data.coaches.length} coaches` : "Loading"}
        </StatusTag>
      </SectionTitle>
      <div className="dt">
        <div className="dth" style={{ gridTemplateColumns: "140px repeat(8, 1fr)" }}>
          <div>Coach</div>
          <div>FE Ending</div>
          <div>FE Resells</div>
          <div>FE %</div>
          <div>BE Ending</div>
          <div>BE Resells</div>
          <div>BE %</div>
          <div>Contracted</div>
          <div>Collected</div>
        </div>

        {loading && (
          <div className="dtr" style={{ gridTemplateColumns: "140px repeat(8, 1fr)" }}>
            <div className="dtc" style={{ color: "var(--muted)", gridColumn: "1 / -1" }}>Loading…</div>
          </div>
        )}

        {isLive && data.coaches.map((c) => {
          const totalPct = c.totalPct;
          return (
            <div key={c.name} className="dtr" style={{ gridTemplateColumns: "140px repeat(8, 1fr)" }}>
              <div className="dtc nm">{c.name}</div>
              <div className="dtc mono">{c.feContractsEnding || "—"}</div>
              <div className="dtc mono">{c.feUpsellsActual || "—"}</div>
              <div className="dtc mono">
                {c.fePct > 0
                  ? <Badge variant={c.fePct >= 25 ? "green" : c.fePct >= 15 ? "amber" : "red"}>{fmtPct(c.fePct)}</Badge>
                  : "—"}
              </div>
              <div className="dtc mono">{c.beContractsEnding || "—"}</div>
              <div className="dtc mono">{c.beResellsActual || "—"}</div>
              <div className="dtc mono">
                {c.bePct > 0
                  ? <Badge variant={c.bePct >= 25 ? "green" : c.bePct >= 15 ? "amber" : "red"}>{fmtPct(c.bePct)}</Badge>
                  : "—"}
              </div>
              <div className="dtc mono" style={{ color: c.contracted > 0 ? "var(--gold)" : "var(--muted)" }}>
                {fmt$(c.contracted)}
              </div>
              <div className="dtc mono" style={{ color: c.collected > 0 ? "var(--green)" : "var(--muted)" }}>
                {fmt$(c.collected)}
              </div>
            </div>
          );
        })}

        {isLive && team && (
          <div className="dttot" style={{ gridTemplateColumns: "140px repeat(8, 1fr)" }}>
            <div>TEAM TOTALS</div>
            <div>{team.feContractsEnding}</div>
            <div>{team.feUpsellsActual}</div>
            <div>{fmtPct(team.fePct)}</div>
            <div>{team.beContractsEnding}</div>
            <div>{team.beResellsActual}</div>
            <div>{fmtPct(team.bePct)}</div>
            <div>{fmt$(team.contracted)}</div>
            <div>{fmt$(team.collected)}</div>
          </div>
        )}
      </div>

      {/* Client Health */}
      <div className="two-col" style={{ marginTop: 24 }}>
        <div>
          <SectionTitle>Client Health Metrics</SectionTitle>
          <div className="dt">
            <div className="dth" style={{ gridTemplateColumns: "200px 1fr 1fr" }}>
              <div>Metric</div>
              <div>Active (1st)</div>
              <div>Offboarded</div>
            </div>
            {health && [
              { label: "IFCA (FE)",    active: health.activeIFCA,   off: health.offboardedIFCA },
              { label: "Legacy",       active: health.activeLegacy, off: health.offboardedLegacy },
              { label: "7-Figure CEO", active: health.active7FCEO,  off: health.offboarded7FCEO },
            ].map((r) => (
              <div key={r.label} className="dtr" style={{ gridTemplateColumns: "200px 1fr 1fr" }}>
                <div className="dtc nm">{r.label}</div>
                <div className="dtc mono">{r.active || "—"}</div>
                <div className="dtc mono" style={{ color: r.off > 0 ? "var(--red)" : "var(--muted)" }}>
                  {r.off || "—"}
                </div>
              </div>
            ))}
            {health && (
              <div className="dttot" style={{ gridTemplateColumns: "200px 1fr 1fr" }}>
                <div>TOTAL</div>
                <div>{health.totalActive}</div>
                <div style={{ color: "var(--red)" }}>{health.totalOffboarded}</div>
              </div>
            )}
          </div>
        </div>

        <div>
          <SectionTitle>Cancellations & Health Indicators</SectionTitle>
          <div className="dt">
            <div className="dth" style={{ gridTemplateColumns: "200px 1fr" }}>
              <div>Indicator</div>
              <div>{data?.month} MTD</div>
            </div>
            <div className="dtr" style={{ gridTemplateColumns: "200px 1fr" }}>
              <div className="dtc nm">Contracts Cancelled</div>
              <div className="dtc mono" style={{ color: data && data.cancellationsMTD.count > 0 ? "var(--red)" : "var(--muted)" }}>
                {data?.cancellationsMTD.count ?? "—"}
              </div>
            </div>
            <div className="dtr" style={{ gridTemplateColumns: "200px 1fr" }}>
              <div className="dtc nm">Refunds Issued</div>
              <div className="dtc mono">{data ? fmt$(data.cancellationsMTD.refundTotal) : "—"}</div>
            </div>
            <div className="dtr" style={{ gridTemplateColumns: "200px 1fr" }}>
              <div className="dtc nm">Defaulted Amount</div>
              <div className="dtc mono">{data ? fmt$(data.cancellationsMTD.defaultedTotal) : "—"}</div>
            </div>
            <div className="dtr" style={{ gridTemplateColumns: "200px 1fr" }}>
              <div className="dtc nm">Programs Paused</div>
              <div className="dtc mono">{health?.programsPaused || "—"}</div>
            </div>
            <div className="dtr" style={{ gridTemplateColumns: "200px 1fr" }}>
              <div className="dtc nm">Extensions Granted</div>
              <div className="dtc mono">{health?.programExtensions || "—"}</div>
            </div>
            <div className="dtr" style={{ gridTemplateColumns: "200px 1fr" }}>
              <div className="dtc nm">Continuity Activations</div>
              <div className="dtc mono" style={{ color: "var(--green)" }}>{health?.continuityActivations || "—"}</div>
            </div>
            <div className="dtr" style={{ gridTemplateColumns: "200px 1fr" }}>
              <div className="dtc nm">NPS ({data?.npsCount ?? 0} responses)</div>
              <div className="dtc mono">
                {data && data.npsAverage > 0
                  ? <Badge variant={data.npsAverage >= 9 ? "green" : data.npsAverage >= 7 ? "amber" : "red"}>
                      {data.npsAverage.toFixed(1)}/10
                    </Badge>
                  : "—"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
