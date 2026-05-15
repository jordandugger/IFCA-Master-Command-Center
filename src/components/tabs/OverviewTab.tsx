"use client";

import { useEffect, useState } from "react";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { SectionTitle } from "@/components/ui/SectionTitle";
import type { TabId } from "@/components/layout/Header";
import type { MissionControlSummary, Severity } from "@/app/api/missioncontrol/route";
import type { ProjectionsSummary } from "@/app/api/projections/route";

interface Props {
  onNavigate?: (tab: TabId) => void;
}

function fmt$(n: number): string {
  if (!n && n !== 0) return "—";
  if (n === 0) return "$0";
  const abs = Math.abs(n);
  if (abs >= 1000000) return `${n < 0 ? "-" : ""}$${(abs / 1000000).toFixed(2)}M`;
  if (abs >= 1000)    return `${n < 0 ? "-" : ""}$${(abs / 1000).toFixed(1)}K`;
  return `${n < 0 ? "-" : ""}$${abs.toFixed(0)}`;
}
function fmtN(n: number): string { return n === 0 ? "—" : Math.round(n).toLocaleString(); }
function fmtPct(n: number): string { return n === 0 ? "—" : `${n.toFixed(1)}%`; }

function sevColor(s: Severity): string {
  return s === "red" ? "var(--red)" : s === "amber" ? "var(--amber)" : "var(--green)";
}
function sevBg(s: Severity): string {
  return s === "red"   ? "rgba(239,68,68,0.08)"
       : s === "amber" ? "rgba(245,158,11,0.08)"
       : "rgba(16,185,129,0.08)";
}
function sevBorder(s: Severity): string {
  return s === "red"   ? "rgba(239,68,68,0.3)"
       : s === "amber" ? "rgba(245,158,11,0.3)"
       : "rgba(16,185,129,0.3)";
}
function sevIcon(s: Severity): string {
  return s === "red" ? "🔴" : s === "amber" ? "🟡" : "🟢";
}

const PILLAR_LABELS: Record<string, string> = {
  ads:     "Ads",
  sales:   "Sales",
  backend: "Back-End",
  health:  "Customer Health",
  revenue: "Revenue",
};

// Variance threshold helpers
function vColor(actual: number, target: number, lowerIsBetter = false): string {
  if (target === 0) return "var(--muted)";
  const pct = (actual / target) * 100;
  if (lowerIsBetter) {
    if (pct <= 100) return "var(--green)";
    if (pct <= 120) return "var(--amber)";
    return "var(--red)";
  }
  if (pct >= 95) return "var(--green)";
  if (pct >= 75) return "var(--amber)";
  return "var(--red)";
}

function findRow(rows: { label: string; actual: number; projection: number; pace: number }[] | undefined, q: string) {
  if (!rows) return null;
  return rows.find((x) => x.label.toLowerCase().includes(q.toLowerCase())) ?? null;
}

export function OverviewTab({ onNavigate }: Props) {
  const [mc, setMc]           = useState<MissionControlSummary | null>(null);
  const [proj, setProj]       = useState<ProjectionsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/missioncontrol").then((r) => r.ok ? r.json() : null).catch(() => null),
      fetch("/api/projections").then((r) => r.ok ? r.json() : null).catch(() => null),
    ]).then(([m, p]) => {
      if (m?.error) setError(m.error);
      else if (m) setMc(m);
      if (p && !p.error) setProj(p);
      setLoading(false);
    });
  }, []);

  const isLive = !loading && !error && mc !== null;
  const rev = mc?.revenue;

  const handleDrill = (tab: string) => {
    if (!onNavigate) return;
    if (tab === "ads" || tab === "sales" || tab === "backend" || tab === "projections" || tab === "overview" || tab === "recovery") {
      onNavigate(tab as TabId);
    }
  };

  // ── Build snapshot rows from projections data ──────────────────────────────
  const t = proj?.totals;
  const totalMRR    = findRow(proj?.mrr, "Total MRR");
  const totalAR     = findRow(proj?.ar,  "Total AR");
  const upfrontCol  = findRow(proj?.revenue, "UPFRONT COLLECTED");
  const grossRev    = findRow(proj?.revenue, "GROSS REVENUE");
  const feCloses    = findRow(proj?.closes, "Closed Deals");
  const closeRate   = findRow(proj?.closes, "Close Rate");
  const approvedCalls = findRow(proj?.funnel, "Approved Booked Calls");
  const showRate    = findRow(proj?.funnel, "Show Rate");
  const bookedSets  = findRow(proj?.funnel, "Booked Sets");
  const adSpend     = findRow(proj?.marketing, "Ad Spend Total");
  const cpl         = findRow(proj?.marketing, "Cost Per Lead");
  const costPerCall = findRow(proj?.marketing, "Cost Per Booked Call");
  const roasGen     = findRow(proj?.marketing, "ROAs Generated");
  const beDeals     = findRow(proj?.backend, "Total Deals");
  const beRev       = findRow(proj?.backend, "Revenue Generated");
  const beCash      = findRow(proj?.backend, "Cash Collected");
  const beCollect   = findRow(proj?.backend, "Cash Collection Rate");

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
          {loading ? "Loading command center…"
            : isLive ? `● Live — Mission Control · ${mc.month} Day ${mc.currentDay} of ${mc.daysInMonth}`
            : `⚠ ${error}`}
        </span>
        {isLive && (
          <span style={{ color: "var(--muted)" }}>
            Sources: PIF {mc.meta.pifOk ? "✓" : "⚠"} · Hyros {mc.meta.hyrosOk ? "✓" : "⚠"} · Projections {mc.meta.projectionsOk ? "✓" : "⚠"} · BE {mc.meta.backendOk ? "✓" : "⚠"} · {mc.asOf}
          </span>
        )}
      </div>

      {/* ── REVENUE PULSE HERO ── */}
      <div style={{
        background: "linear-gradient(135deg, rgba(16,185,129,0.06), transparent)",
        border: "1px solid rgba(16,185,129,0.2)",
        borderRadius: 12, padding: "18px 22px", marginBottom: 20,
      }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          <HeroStat label="MTD Generated"     value={fmt$(rev?.mtdGenerated ?? 0)}  color="var(--green)" />
          <HeroStat label="Original Projection" value={fmt$(rev?.mtdProjection ?? 0)} color="var(--text)" />
          <HeroStat label="End-of-Month Pace"  value={fmt$(rev?.mtdPace ?? 0)}
                    color={rev && rev.variancePct >= 0 ? "var(--green)" : rev && rev.variancePct >= -10 ? "var(--amber)" : "var(--red)"}
                    sub={rev ? `${rev.variancePct >= 0 ? "+" : ""}${rev.variancePct.toFixed(1)}% vs proj` : ""} />
          <HeroStat label="Days Remaining"     value={mc ? `${mc.daysRemaining}` : "—"}
                    color="var(--gold)" sub={mc ? `${mc.currentDay}/${mc.daysInMonth} elapsed` : ""} />
        </div>
        {rev && rev.mtdProjection > 0 && (
          <div style={{ marginTop: 14 }}>
            <ProgressBar
              label="MTD vs Projection"
              rightLabel={`${((rev.mtdGenerated / rev.mtdProjection) * 100).toFixed(0)}%`}
              percent={(rev.mtdGenerated / rev.mtdProjection) * 100}
              color={rev.variancePct >= 0 ? "green" : rev.variancePct >= -10 ? "amber" : "red"}
              height={8}
            />
          </div>
        )}
      </div>

      {/* ── PILLAR HEALTH ── */}
      <SectionTitle>Pillar Health</SectionTitle>
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24,
      }}>
        {(mc?.pillarHealth ?? []).map((p) => (
          <button
            key={p.pillar}
            onClick={() => handleDrill(p.pillar === "health" ? "backend" : p.pillar)}
            style={{
              background: sevBg(p.score),
              border: `1px solid ${sevBorder(p.score)}`,
              borderRadius: 10, padding: "14px 16px",
              cursor: "pointer", textAlign: "left",
              fontFamily: "inherit", color: "inherit",
              transition: "transform 0.1s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
            onMouseOut={(e) => (e.currentTarget.style.transform = "translateY(0)")}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{PILLAR_LABELS[p.pillar]}</div>
              <div style={{ fontSize: 18 }}>{sevIcon(p.score)}</div>
            </div>
            <div style={{
              fontSize: 11, color: sevColor(p.score),
              fontFamily: "'IBM Plex Mono', monospace",
              textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4,
            }}>
              {p.score === "green" ? "Healthy" : p.score === "amber" ? "Watch" : "Action Needed"}
            </div>
            <div style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.4 }}>{p.reason}</div>
          </button>
        ))}
      </div>

      {/* ── 4-QUADRANT KEY METRICS SNAPSHOT ── */}
      <SectionTitle>Key Metrics Snapshot — {mc?.month ?? ""}</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        <MetricCard
          title="💰 Finance"
          onClick={() => handleDrill("projections")}
          rows={[
            { label: "Total Generated Rev",  actual: t?.totalGenRev ?? 0,     projection: t?.totalGenRevProj ?? 0,     fmt: fmt$ },
            { label: "Gross Revenue",        actual: grossRev?.actual ?? 0,   projection: grossRev?.projection ?? 0,   fmt: fmt$ },
            { label: "Upfront Cash Collected", actual: upfrontCol?.actual ?? 0, projection: upfrontCol?.projection ?? 0, fmt: fmt$ },
            { label: "Total MRR",            actual: totalMRR?.actual ?? 0,   projection: totalMRR?.projection ?? 0,   fmt: fmt$ },
            { label: "Total AR",             actual: totalAR?.actual ?? 0,    projection: totalAR?.projection ?? 0,    fmt: fmt$ },
          ]}
        />
        <MetricCard
          title="📞 Sales"
          onClick={() => handleDrill("sales")}
          rows={[
            { label: "FE Closes",            actual: feCloses?.actual ?? 0,        projection: feCloses?.projection ?? 0,        fmt: fmtN },
            { label: "Close Rate",           actual: closeRate?.actual ?? 0,       projection: closeRate?.projection ?? 0,       fmt: fmtPct },
            { label: "Approved Booked Calls",actual: approvedCalls?.actual ?? 0,   projection: approvedCalls?.projection ?? 0,   fmt: fmtN },
            { label: "Show Rate",            actual: showRate?.actual ?? 0,        projection: showRate?.projection ?? 0,        fmt: fmtPct },
            { label: "Booked Sets (Setters)",actual: bookedSets?.actual ?? 0,      projection: bookedSets?.projection ?? 0,      fmt: fmtN },
          ]}
        />
        <MetricCard
          title="📊 Ads"
          onClick={() => handleDrill("ads")}
          rows={[
            { label: "Ad Spend MTD",         actual: adSpend?.actual ?? 0,         projection: adSpend?.projection ?? 0,         fmt: fmt$,    lowerIsBetter: true },
            { label: "CPL (New)",            actual: cpl?.actual ?? 0,             projection: cpl?.projection || 50,            fmt: fmt$,    lowerIsBetter: true },
            { label: "Cost / Booked Call",   actual: costPerCall?.actual ?? 0,     projection: costPerCall?.projection || 400,   fmt: fmt$,    lowerIsBetter: true },
            { label: "ROAS Generated",       actual: roasGen?.actual ?? 0,         projection: roasGen?.projection || 3.6,       fmt: (n) => n > 0 ? `${n.toFixed(2)}x` : "—" },
          ]}
        />
        <MetricCard
          title="🎯 Back-End"
          onClick={() => handleDrill("backend")}
          rows={[
            { label: "BE Total Deals",       actual: beDeals?.actual ?? 0,         projection: beDeals?.projection ?? 0,         fmt: fmtN },
            { label: "BE Revenue Generated", actual: beRev?.actual ?? 0,           projection: beRev?.projection ?? 0,           fmt: fmt$ },
            { label: "BE Cash Collected",    actual: beCash?.actual ?? 0,          projection: beCash?.projection ?? 0,          fmt: fmt$ },
            { label: "BE Cash Collection %", actual: beCollect?.actual ?? 0,       projection: beCollect?.projection ?? 0,       fmt: fmtPct },
          ]}
        />
      </div>

      {/* ── WHAT NEEDS ATTENTION + QUICK ACTIONS ── */}
      <div className="two-col">
        <div>
          <SectionTitle>What Needs Attention</SectionTitle>
          {!isLive && (
            <div style={{ color: "var(--muted)", padding: 16 }}>Scanning constraints…</div>
          )}
          {isLive && mc.constraints.length === 0 && (
            <div style={{
              padding: 24, borderRadius: 8,
              background: "rgba(16,185,129,0.06)",
              border: "1px solid rgba(16,185,129,0.2)",
              color: "var(--green)", textAlign: "center",
            }}>
              🟢 No critical constraints detected — keep executing.
            </div>
          )}
          {isLive && mc.constraints.map((c, i) => (
            <button
              key={i}
              onClick={() => handleDrill(c.drillTo)}
              style={{
                width: "100%", textAlign: "left",
                background: sevBg(c.severity),
                border: `1px solid ${sevBorder(c.severity)}`,
                borderLeft: `4px solid ${sevColor(c.severity)}`,
                borderRadius: 8, padding: "12px 14px", marginBottom: 8,
                cursor: "pointer", fontFamily: "inherit", color: "inherit",
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 14 }}>{sevIcon(c.severity)}</span>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>{c.metric}</span>
                  <span style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase" }}>
                    · {PILLAR_LABELS[c.pillar]}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.5 }}>{c.reason}</div>
              </div>
              <div style={{ textAlign: "right", marginLeft: 16, minWidth: 100 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: sevColor(c.severity), fontFamily: "'IBM Plex Mono', monospace" }}>
                  {c.impact$ > 0 ? `~${fmt$(c.impact$)}` : ""}
                </div>
                <div style={{ fontSize: 9, color: "var(--muted)", textTransform: "uppercase" }}>
                  {c.impact$ > 0 ? "impact" : "→ drill in"}
                </div>
              </div>
            </button>
          ))}
        </div>

        <div>
          <SectionTitle>Quick Actions</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
            {[
              { label: "Recovery Playbook",    tab: "recovery"    as TabId, icon: "🎯", primary: true },
              { label: "Set Projections",      tab: "projections" as TabId, icon: "📈" },
              { label: "Sales Drill-Down",     tab: "sales"       as TabId, icon: "📞" },
              { label: "Ad Performance",       tab: "ads"         as TabId, icon: "📊" },
              { label: "Back-End + SC Stats",  tab: "backend"     as TabId, icon: "🎯" },
            ].map((a) => (
              <button
                key={a.tab}
                onClick={() => onNavigate?.(a.tab)}
                style={{
                  background: a.primary ? "rgba(212,175,55,0.08)" : "var(--bg-card)",
                  border: `1px solid ${a.primary ? "rgba(212,175,55,0.3)" : "var(--border)"}`,
                  borderRadius: 8, padding: "12px 14px",
                  cursor: "pointer", fontFamily: "inherit",
                  color: a.primary ? "var(--gold)" : "var(--text)",
                  textAlign: "left", fontSize: 12, fontWeight: a.primary ? 600 : 400,
                  display: "flex", alignItems: "center", gap: 10,
                }}
              >
                <span style={{ fontSize: 16 }}>{a.icon}</span>
                <span>{a.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  void vColor; // suppress unused warning, kept for future use
}

function HeroStat({ label, value, color, sub }: { label: string; value: string; color: string; sub?: string }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color, marginTop: 4, fontFamily: "'IBM Plex Mono', monospace" }}>{value}</div>
      {sub && <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function MetricCard({ title, rows, onClick }: {
  title: string;
  rows: { label: string; actual: number; projection: number; fmt: (n: number) => string; lowerIsBetter?: boolean }[];
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        background: "var(--bg-card)", border: "1px solid var(--border)",
        borderRadius: 10, padding: "16px 18px",
        cursor: "pointer", fontFamily: "inherit", color: "inherit",
        textAlign: "left",
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, display: "flex", justifyContent: "space-between" }}>
        <span>{title}</span>
        <span style={{ fontSize: 10, color: "var(--muted)" }}>→ drill in</span>
      </div>
      {rows.map((r, i) => {
        const target = r.projection;
        const pct = target > 0 ? (r.actual / target) * 100 : 0;
        const isBad = r.lowerIsBetter ? pct > 110 : pct < 80;
        const isWarn = r.lowerIsBetter ? pct > 100 : pct < 95;
        const color = target === 0 ? "var(--muted)" : isBad ? "var(--red)" : isWarn ? "var(--amber)" : "var(--green)";
        return (
          <div key={i} style={{
            display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 60px",
            gap: 8, alignItems: "center",
            padding: "6px 0",
            borderTop: i === 0 ? "none" : "1px solid var(--border)",
          }}>
            <span style={{ fontSize: 11, color: "var(--muted)" }}>{r.label}</span>
            <span style={{ fontSize: 12, fontWeight: 600, fontFamily: "'IBM Plex Mono', monospace" }}>
              {r.fmt(r.actual)}
            </span>
            <span style={{ fontSize: 11, color: "var(--muted)", fontFamily: "'IBM Plex Mono', monospace" }}>
              / {r.fmt(r.projection)}
            </span>
            <span style={{ fontSize: 10, color, fontFamily: "'IBM Plex Mono', monospace", textAlign: "right" }}>
              {target > 0 ? `${pct.toFixed(0)}%` : "—"}
            </span>
          </div>
        );
      })}
    </button>
  );
}
