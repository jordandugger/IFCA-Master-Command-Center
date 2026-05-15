"use client";

import { useEffect, useState, useMemo } from "react";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { ProgressBar } from "@/components/ui/ProgressBar";
import type { ProjectionsSummary } from "@/lib/sources/projections";
import type { MissionControlSummary } from "@/app/api/missioncontrol/route";

// ── Constants (legal targets from APA §3.5) ──────────────────────────────────
const LOOKBACK_TARGET = 550000;
const TIER2_FLOOR     = 400000;

// ── Lever model ──────────────────────────────────────────────────────────────
type Inputs = {
  approvedCalls: number;    // monthly approved booked calls
  showRate: number;         // %
  closeRate: number;        // %
  aov: number;              // $
  feCollectionRate: number; // %
  beUpsellRate: number;     // %
  beAov: number;            // $
  beCollectionRate: number; // %
  mrr: number;              // monthly total MRR
  arInstallments: number;   // monthly AR collected
};

const SLIDER_BOUNDS: Record<keyof Inputs, [number, number, number]> = {
  approvedCalls:    [50, 400, 5],
  showRate:         [40, 95, 0.5],
  closeRate:        [10, 45, 0.5],
  aov:              [8000, 20000, 100],
  feCollectionRate: [25, 80, 0.5],
  beUpsellRate:     [5, 50, 0.5],
  beAov:            [12000, 50000, 500],
  beCollectionRate: [20, 80, 1],
  mrr:              [60000, 130000, 1000],
  arInstallments:   [50000, 350000, 2000],
};

type Owner = "Erin → Taeler" | "Tom / Setters / Janie" | "Cory" | "Kevin / SC";

const LEVERS: { key: keyof Inputs; label: string; owner: Owner; group: string; isMoney: boolean; isPercent: boolean }[] = [
  { key: "approvedCalls",    label: "Approved Booked Calls", owner: "Tom / Setters / Janie", group: "pipeline",  isMoney: false, isPercent: false },
  { key: "showRate",         label: "Show Rate",             owner: "Tom / Setters / Janie", group: "pipeline",  isMoney: false, isPercent: true  },
  { key: "closeRate",        label: "Close Rate",            owner: "Erin → Taeler",         group: "pipeline",  isMoney: false, isPercent: true  },
  { key: "aov",              label: "AOV",                   owner: "Erin → Taeler",         group: "fe",        isMoney: true,  isPercent: false },
  { key: "feCollectionRate", label: "FE Cash Collection %",  owner: "Erin → Taeler",         group: "fe",        isMoney: false, isPercent: true  },
  { key: "beUpsellRate",     label: "BE Upsell Rate",        owner: "Cory",                  group: "be",        isMoney: false, isPercent: true  },
  { key: "beAov",            label: "BE AOV",                owner: "Cory",                  group: "be",        isMoney: true,  isPercent: false },
  { key: "beCollectionRate", label: "BE Cash Collection %",  owner: "Cory",                  group: "be",        isMoney: false, isPercent: true  },
  { key: "mrr",              label: "Total MRR / mo",        owner: "Kevin / SC",            group: "recurring", isMoney: true,  isPercent: false },
  { key: "arInstallments",   label: "AR Installments / mo",  owner: "Kevin / SC",            group: "recurring", isMoney: true,  isPercent: false },
];

const GROUP_COLOR: Record<string, string> = {
  pipeline:  "var(--green)",
  fe:        "var(--amber)",
  be:        "#a78bfa",
  recurring: "#60a5fa",
};

// ── Math ─────────────────────────────────────────────────────────────────────
function calc(i: Inputs) {
  const liveCalls = i.approvedCalls * (i.showRate / 100);
  const feCloses  = liveCalls * (i.closeRate / 100);
  const feGen     = feCloses * i.aov;
  const feCash    = feGen * (i.feCollectionRate / 100);
  const beCloses  = feCloses * (i.beUpsellRate / 100);
  const beGen     = beCloses * i.beAov;
  const beCash    = beGen * (i.beCollectionRate / 100);
  const grossRevenue = feCash + beCash + i.mrr + i.arInstallments;
  const generatedRev = feGen + beGen + i.mrr + i.arInstallments;
  return { liveCalls, feCloses, feGen, feCash, beCloses, beGen, beCash, grossRevenue, generatedRev };
}

// ── Helpers to extract baseline from live data ───────────────────────────────
function findRow(rows: { label: string; actual: number; projection: number; pace: number }[] | undefined, q: string): { actual: number; projection: number; pace: number } | null {
  if (!rows) return null;
  const r = rows.find((x) => x.label.toLowerCase().includes(q.toLowerCase()));
  return r ? { actual: r.actual, projection: r.projection, pace: r.pace } : null;
}

type BaselineMode = "current-pace" | "month-projection";

function deriveBaseline(proj: ProjectionsSummary | null, mode: BaselineMode): Inputs {
  // Sensible static fallbacks if API unavailable
  const FALLBACK: Inputs = {
    approvedCalls: 185, showRate: 66, closeRate: 25, aov: 12000, feCollectionRate: 50,
    beUpsellRate: 22, beAov: 18000, beCollectionRate: 30, mrr: 88000, arInstallments: 200000,
  };
  if (!proj) return FALLBACK;

  // Resilient extractor: try pace → actual → projection → fallback
  // Many cells in the projection sheet don't have pace populated for rate metrics,
  // so we have to fall back gracefully or the calculator zeros out the FE pipeline.
  const get = (rows: { label: string; actual: number; projection: number; pace: number }[] | undefined, q: string, fallback: number): number => {
    const r = findRow(rows, q);
    if (!r) return fallback;
    const primary = mode === "current-pace" ? r.pace : r.projection;
    if (primary > 0) return primary;
    // Fall back through other columns
    if (r.actual > 0) return r.actual;
    if (r.projection > 0) return r.projection;
    if (r.pace > 0) return r.pace;
    return fallback;
  };

  const approvedCalls    = get(proj.funnel,   "Approved Booked Calls", FALLBACK.approvedCalls);
  const showRate         = get(proj.funnel,   "Show Rate",             FALLBACK.showRate);
  const closeRate        = get(proj.closes,   "Close Rate",            FALLBACK.closeRate);
  const aov              = get(proj.closes,   "Average Order Value",   FALLBACK.aov);
  const feCollectionRate = get(proj.closes,   "Collected %",           FALLBACK.feCollectionRate);
  const beCollectionRate = get(proj.backend,  "Cash Collection Rate",  FALLBACK.beCollectionRate);
  const mrr              = get(proj.mrr,      "Total MRR",             FALLBACK.mrr);
  const arInstallments   = get(proj.ar,       "Total AR",              FALLBACK.arInstallments);

  // Derive BE Upsell Rate and BE AOV from BE Total Deals / FE Closes
  const beDealsRow = findRow(proj.backend, "Total Deals");
  const feClosesRow= findRow(proj.closes, "Closed Deals");
  const beRevRow   = findRow(proj.backend, "Revenue Generated");
  const pickRow = (r: { actual: number; projection: number; pace: number } | null): number => {
    if (!r) return 0;
    const primary = mode === "current-pace" ? r.pace : r.projection;
    if (primary > 0) return primary;
    if (r.actual > 0) return r.actual;
    if (r.projection > 0) return r.projection;
    if (r.pace > 0) return r.pace;
    return 0;
  };
  const feCloses = pickRow(feClosesRow);
  const beDeals  = pickRow(beDealsRow);
  const beRev    = pickRow(beRevRow);

  const beUpsellRate = (feCloses > 0 && beDeals > 0) ? (beDeals / feCloses) * 100 : FALLBACK.beUpsellRate;
  const beAov        = (beDeals > 0 && beRev > 0)    ? beRev / beDeals             : FALLBACK.beAov;

  return {
    approvedCalls: Math.round(approvedCalls),
    showRate: Math.round(showRate * 10) / 10,
    closeRate: Math.round(closeRate * 10) / 10,
    aov: Math.round(aov),
    feCollectionRate: Math.round(feCollectionRate * 10) / 10,
    beUpsellRate: Math.round(beUpsellRate * 10) / 10,
    beAov: Math.round(beAov),
    beCollectionRate: Math.round(beCollectionRate * 10) / 10,
    mrr: Math.round(mrr),
    arInstallments: Math.round(arInstallments),
  };
}

// ── Formatting ───────────────────────────────────────────────────────────────
function fmt$(n: number): string {
  if (!isFinite(n)) return "—";
  if (Math.abs(n) >= 1000) return `$${(n / 1000).toFixed(0)}K`;
  return `$${Math.round(n).toLocaleString()}`;
}
function fmtN(n: number): string { return Math.round(n).toLocaleString(); }
function fmtPct(n: number): string { return `${n.toFixed(1)}%`; }

// ── Component ────────────────────────────────────────────────────────────────
export function RecoveryPlaybookTab() {
  const [proj, setProj]       = useState<ProjectionsSummary | null>(null);
  const [mc, setMc]           = useState<MissionControlSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [baseMode, setBaseMode] = useState<BaselineMode>("current-pace");
  const [inputs, setInputs]   = useState<Inputs | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/projections").then((r) => r.ok ? r.json() : null).catch(() => null),
      fetch("/api/missioncontrol").then((r) => r.ok ? r.json() : null).catch(() => null),
    ]).then(([p, m]) => {
      if (p && !p.error) setProj(p);
      if (m && !m.error) setMc(m);
      setLoading(false);
    });
  }, []);

  // Initialize inputs from baseline when data loads, or recompute when mode changes
  useEffect(() => {
    if (proj) setInputs(deriveBaseline(proj, baseMode));
  }, [proj, baseMode]);

  const baseline = useMemo(() => proj ? deriveBaseline(proj, baseMode) : null, [proj, baseMode]);
  const out = useMemo(() => inputs ? calc(inputs) : null, [inputs]);
  const baseOut = useMemo(() => baseline ? calc(baseline) : null, [baseline]);

  if (loading) return <div style={{ padding: 24, color: "var(--muted)" }}>Loading recovery playbook…</div>;
  if (!inputs || !out || !baseOut || !baseline) {
    return (
      <div style={{ padding: 24, color: "var(--red)" }}>
        Unable to load live data. Check that the projections sheet is accessible.
      </div>
    );
  }

  const set = <K extends keyof Inputs>(k: K, v: number) => setInputs((p) => p ? { ...p, [k]: v } : p);
  const resetToBaseline = () => setInputs(baseline);

  const projectedGross = out.grossRevenue;
  const grossColor = projectedGross >= LOOKBACK_TARGET ? "var(--green)"
                   : projectedGross >= TIER2_FLOOR    ? "var(--amber)"
                   : "var(--red)";
  const lookbackPct = Math.min((projectedGross / LOOKBACK_TARGET) * 100, 115);
  const deltaVsBase = projectedGross - baseOut.grossRevenue;

  const leverImpact = (k: keyof Inputs): number => {
    const modified = { ...baseline, [k]: inputs[k] };
    return calc(modified).grossRevenue - baseOut.grossRevenue;
  };

  return (
    <div>
      {/* Strategic context banner */}
      <div style={{
        background: "rgba(239,68,68,0.06)",
        border: "1px solid rgba(239,68,68,0.25)",
        borderRadius: 8, padding: "12px 16px", marginBottom: 16,
        fontSize: 12, lineHeight: 1.6,
      }}>
        <div style={{ color: "var(--red)", fontWeight: 700, marginBottom: 4, fontSize: 13 }}>
          🎯 APA §3.5 — 120-Day Lookback · Protect the $3.3M Seller Note
        </div>
        <div style={{ color: "var(--muted)" }}>
          <strong style={{ color: "var(--amber)" }}>Tier-1 (−$500K):</strong> triggered if NO 2 consecutive months ≥ <strong>$550K</strong> ·{" "}
          <strong style={{ color: "var(--red)" }}>Tier-2 (−$1M):</strong> triggered if ANY 2 months ≤ <strong>$400K</strong> (supersedes Tier-1) ·{" "}
          Reductions hit Seller Note principal only.
        </div>
      </div>

      {/* Baseline mode toggle — prominent segmented control */}
      {(() => {
        const paceBaseline = deriveBaseline(proj, "current-pace");
        const projBaseline = deriveBaseline(proj, "month-projection");
        const paceGross = calc(paceBaseline).grossRevenue;
        const projGross = calc(projBaseline).grossRevenue;
        const options = [
          { mode: "month-projection" as const, icon: "📊", label: "Original Month Projection", sub: "Set at month start by finance team", gross: projGross },
          { mode: "current-pace"      as const, icon: "📍", label: "Current MTD Pace",          sub: "Trending forward from today",       gross: paceGross },
        ];
        return (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.7, marginBottom: 8 }}>
              ⚙️ Baseline Mode — Click to load sliders
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 10, alignItems: "stretch" }}>
              {options.map((o) => {
                const active = baseMode === o.mode;
                const grossColor2 = o.gross >= LOOKBACK_TARGET ? "var(--green)"
                                  : o.gross >= TIER2_FLOOR    ? "var(--amber)"
                                  : "var(--red)";
                return (
                  <button
                    key={o.mode}
                    onClick={() => setBaseMode(o.mode)}
                    style={{
                      padding: "14px 18px", borderRadius: 10, cursor: "pointer", fontFamily: "inherit",
                      textAlign: "left",
                      background: active ? "rgba(59,130,246,0.12)" : "var(--bg-card)",
                      border: active ? "2px solid var(--accent)" : "1px solid var(--border)",
                      color: "var(--text)",
                      position: "relative",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 18 }}>{o.icon}</span>
                        <span style={{ fontSize: 13, fontWeight: 700 }}>{o.label}</span>
                      </div>
                      {active && (
                        <span style={{ fontSize: 9, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: 0.7 }}>
                          ● Active
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 10, color: "var(--muted)", marginBottom: 8 }}>{o.sub}</div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <span style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>
                        Projected Gross Revenue
                      </span>
                      <span style={{ fontSize: 20, fontWeight: 700, color: grossColor2, fontFamily: "'IBM Plex Mono', monospace" }}>
                        {fmt$(o.gross)}
                      </span>
                    </div>
                  </button>
                );
              })}
              <button
                onClick={resetToBaseline}
                title="Reset sliders to current baseline values"
                style={{
                  padding: "0 18px", borderRadius: 10, cursor: "pointer", fontFamily: "inherit",
                  background: "transparent", color: "var(--muted)",
                  border: "1px dashed var(--border)",
                  fontSize: 11, fontWeight: 600, whiteSpace: "nowrap",
                }}
              >
                ↻ Reset<br/>sliders
              </button>
            </div>
          </div>
        );
      })()}

      {/* Live MTD strip */}
      {mc && (
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, marginBottom: 20,
        }}>
          <Mini label="Live MTD Generated"  value={fmt$(mc.lookback.mtdGenerated)} color="var(--green)" />
          <Mini label="Live MTD Pace EOM"   value={fmt$(mc.lookback.mtdPace)}      color="var(--gold)"  />
          <Mini label="Original Projection" value={fmt$(mc.lookback.mtdProjection)} color="var(--text)" />
          <Mini label="Day of 120"          value={`${mc.lookback.dayNumber}/120`} color="var(--text)" />
          <Mini label="Plan B in"           value={`${mc.lookback.daysToPlanB}d`}  color={mc.lookback.daysToPlanB < 30 ? "var(--red)" : mc.lookback.daysToPlanB < 60 ? "var(--amber)" : "var(--gold)"} />
        </div>
      )}

      {/* Hero — Projected Gross from current lever settings */}
      <div style={{
        background: `linear-gradient(135deg, ${grossColor === "var(--green)" ? "rgba(16,185,129,0.08)" : grossColor === "var(--amber)" ? "rgba(245,158,11,0.08)" : "rgba(239,68,68,0.08)"}, transparent)`,
        border: `1px solid ${grossColor === "var(--green)" ? "rgba(16,185,129,0.3)" : grossColor === "var(--amber)" ? "rgba(245,158,11,0.3)" : "rgba(239,68,68,0.3)"}`,
        borderRadius: 12, padding: "20px 24px", marginBottom: 24,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>
              🎯 Projected Gross Revenue @ Current Levers (Monthly)
            </div>
            <div style={{ fontSize: 36, fontWeight: 700, color: grossColor, marginTop: 4 }}>
              {fmt$(projectedGross)}
            </div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
              vs baseline {fmt$(baseOut.grossRevenue)} · Δ{" "}
              <strong style={{ color: deltaVsBase >= 0 ? "var(--green)" : "var(--red)" }}>
                {deltaVsBase >= 0 ? "+" : ""}{fmt$(deltaVsBase)}
              </strong>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>
              Gap to $550K
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: projectedGross >= LOOKBACK_TARGET ? "var(--green)" : "var(--gold)", marginTop: 4 }}>
              {projectedGross >= LOOKBACK_TARGET
                ? `+${fmt$(projectedGross - LOOKBACK_TARGET)}`
                : fmt$(LOOKBACK_TARGET - projectedGross)}
            </div>
            <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 2 }}>
              {projectedGross >= LOOKBACK_TARGET ? "Above target ✓" :
               projectedGross >= TIER2_FLOOR ? `Above $400K floor` :
               `⚠ Below $400K Tier-2 floor`}
            </div>
          </div>
        </div>
        <ProgressBar
          label="Tier-1 Progress"
          rightLabel={`${lookbackPct.toFixed(0)}%`}
          percent={lookbackPct}
          color={projectedGross >= LOOKBACK_TARGET ? "green" : projectedGross >= TIER2_FLOOR ? "amber" : "red"}
          height={10}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: 20 }}>
        {/* INPUTS PANEL */}
        <div>
          <SectionTitle>Levers</SectionTitle>
          {["pipeline", "fe", "be", "recurring"].map((group) => (
            <div key={group} style={{ marginBottom: 18 }}>
              <div style={{
                fontSize: 10, fontWeight: 700, color: GROUP_COLOR[group],
                textTransform: "uppercase", letterSpacing: 0.7, marginBottom: 8,
              }}>
                {group === "pipeline" ? "Sales Pipeline" :
                 group === "fe"       ? "Front-End Economics" :
                 group === "be"       ? "Back-End (Cory)" :
                                         "Recurring & AR"}
              </div>
              {LEVERS.filter((l) => l.group === group).map((l) => {
                const [min, max, step] = SLIDER_BOUNDS[l.key];
                const val = inputs[l.key];
                const baseVal = baseline[l.key];
                const fmtVal = (v: number) => l.isPercent ? fmtPct(v) : l.isMoney ? fmt$(v) : fmtN(v);
                return (
                  <div key={l.key} style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 11, color: "var(--text)" }}>{l.label}</span>
                      <span style={{ fontSize: 11, color: GROUP_COLOR[group], fontWeight: 700, fontFamily: "'IBM Plex Mono', monospace" }}>
                        {fmtVal(val)}
                      </span>
                    </div>
                    <input
                      type="range" min={min} max={max} step={step} value={val}
                      onChange={(e) => set(l.key, parseFloat(e.target.value))}
                      style={{ width: "100%", accentColor: GROUP_COLOR[group] }}
                    />
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
                      <span style={{ fontSize: 9, color: "var(--muted)" }}>
                        Baseline: {fmtVal(baseVal)}
                      </span>
                      <span style={{ fontSize: 9, color: "var(--muted)" }}>{l.owner}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* OUTPUTS PANEL */}
        <div>
          {/* Pipeline Flow */}
          <SectionTitle>Projected Pipeline Flow (Monthly)</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6, marginBottom: 24 }}>
            {[
              { label: "Approved Calls", value: fmtN(inputs.approvedCalls), sub: "monthly" },
              { label: "Live Calls",     value: fmtN(out.liveCalls),         sub: `× ${inputs.showRate}% show` },
              { label: "FE Closes",      value: fmtN(out.feCloses),          sub: `× ${inputs.closeRate}% close` },
              { label: "BE Closes",      value: out.beCloses.toFixed(1),     sub: `× ${inputs.beUpsellRate}% upsell` },
              { label: "Gross Revenue",  value: fmt$(out.grossRevenue),      sub: "total monthly" },
            ].map((s, i) => (
              <div key={i} style={{
                background: "var(--bg-card)", border: "1px solid var(--border)",
                borderRadius: 8, padding: "10px 12px",
              }}>
                <div style={{ fontSize: 9, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>
                  {s.label}
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, marginTop: 2, fontFamily: "'IBM Plex Mono', monospace" }}>
                  {s.value}
                </div>
                <div style={{ fontSize: 9, color: "var(--muted)", marginTop: 2 }}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Revenue Breakdown */}
          <SectionTitle>Revenue Breakdown</SectionTitle>
          <div className="dt">
            <div className="dth" style={{ gridTemplateColumns: "150px 1fr 1fr 1fr" }}>
              <div>Stream</div><div>Generated</div><div>Cash Collected</div><div>% of Gross</div>
            </div>
            {[
              { label: "Front-End",   gen: out.feGen,    cash: out.feCash,         color: "var(--amber)" },
              { label: "Back-End",    gen: out.beGen,    cash: out.beCash,         color: "#a78bfa"      },
              { label: "MRR",         gen: inputs.mrr,   cash: inputs.mrr,         color: "#60a5fa"      },
              { label: "AR",          gen: inputs.arInstallments, cash: inputs.arInstallments, color: "#60a5fa" },
            ].map((r) => (
              <div key={r.label} className="dtr" style={{ gridTemplateColumns: "150px 1fr 1fr 1fr" }}>
                <div className="dtc nm" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: r.color }} />
                  {r.label}
                </div>
                <div className="dtc mono">{fmt$(r.gen)}</div>
                <div className="dtc mono" style={{ color: "var(--green)" }}>{fmt$(r.cash)}</div>
                <div className="dtc mono">{projectedGross > 0 ? `${(r.cash / projectedGross * 100).toFixed(0)}%` : "—"}</div>
              </div>
            ))}
            <div className="dttot" style={{ gridTemplateColumns: "150px 1fr 1fr 1fr" }}>
              <div>TOTAL</div>
              <div>{fmt$(out.generatedRev)}</div>
              <div>{fmt$(out.grossRevenue)}</div>
              <div>100%</div>
            </div>
          </div>

          {/* Lever Impact */}
          <SectionTitle>Lever Impact vs Baseline</SectionTitle>
          <div className="dt">
            <div className="dth" style={{ gridTemplateColumns: "200px 1fr 1fr 1fr 140px" }}>
              <div>Lever</div><div>Baseline</div><div>Current</div><div>Δ Gross / mo</div><div>Owner</div>
            </div>
            {LEVERS.map((l) => {
              const delta = leverImpact(l.key);
              const c = Math.abs(delta) < 100 ? "var(--muted)"
                      : delta > 0 ? "var(--green)" : "var(--red)";
              const fmtVal = (v: number) => l.isPercent ? fmtPct(v) : l.isMoney ? fmt$(v) : fmtN(v);
              return (
                <div key={l.key} className="dtr" style={{ gridTemplateColumns: "200px 1fr 1fr 1fr 140px" }}>
                  <div className="dtc nm" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: GROUP_COLOR[l.group] }} />
                    {l.label}
                  </div>
                  <div className="dtc mono" style={{ color: "var(--muted)" }}>{fmtVal(baseline[l.key])}</div>
                  <div className="dtc mono">{fmtVal(inputs[l.key])}</div>
                  <div className="dtc mono" style={{ color: c, fontWeight: 700 }}>
                    {delta > 0 ? "+" : ""}{fmt$(delta)}
                  </div>
                  <div className="dtc" style={{ fontSize: 10, color: "var(--muted)" }}>{l.owner}</div>
                </div>
              );
            })}
            <div className="dttot" style={{ gridTemplateColumns: "200px 1fr 1fr 1fr 140px" }}>
              <div>COMPOUND DELTA</div>
              <div>{fmt$(baseOut.grossRevenue)}</div>
              <div>{fmt$(projectedGross)}</div>
              <div style={{ color: deltaVsBase >= 0 ? "var(--green)" : "var(--red)" }}>
                {deltaVsBase >= 0 ? "+" : ""}{fmt$(deltaVsBase)}
              </div>
              <div>vs {baseMode === "current-pace" ? "MTD pace" : "month projection"}</div>
            </div>
          </div>

          {/* What's needed for $550K */}
          <div style={{
            marginTop: 24,
            background: "rgba(212,175,55,0.05)",
            border: "1px solid rgba(212,175,55,0.25)",
            borderRadius: 10, padding: "14px 18px",
          }}>
            <div style={{ fontSize: 12, color: "var(--gold)", fontWeight: 700, marginBottom: 8 }}>
              💡 To hit $550K with current other levers held constant:
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, fontSize: 11 }}>
              <NeededLever label="Close Rate" current={inputs.closeRate} compute={() => {
                // Solve for closeRate such that grossRevenue = 550000
                // grossRevenue = feCash + beCash + mrr + ar
                // feCash = liveCalls × cr × aov × feCol
                // beCash = liveCalls × cr × beUR × beAov × beCol
                const liveCalls = inputs.approvedCalls * (inputs.showRate / 100);
                const perPointCR = liveCalls * 0.01 * inputs.aov * (inputs.feCollectionRate / 100)
                                 + liveCalls * 0.01 * (inputs.beUpsellRate / 100) * inputs.beAov * (inputs.beCollectionRate / 100);
                const fixed = inputs.mrr + inputs.arInstallments;
                const needed = (LOOKBACK_TARGET - fixed) / perPointCR;
                return needed > 0 && needed < 100 ? `${needed.toFixed(1)}%` : "n/a";
              }} unit="%" />
              <NeededLever label="Approved Calls" current={inputs.approvedCalls} compute={() => {
                const perCall = (inputs.showRate / 100) * (inputs.closeRate / 100) *
                  (inputs.aov * (inputs.feCollectionRate / 100) +
                   (inputs.beUpsellRate / 100) * inputs.beAov * (inputs.beCollectionRate / 100));
                const fixed = inputs.mrr + inputs.arInstallments;
                const needed = (LOOKBACK_TARGET - fixed) / perCall;
                return needed > 0 ? fmtN(needed) : "n/a";
              }} unit="" />
              <NeededLever label="BE Upsell Rate" current={inputs.beUpsellRate} compute={() => {
                const liveCalls = inputs.approvedCalls * (inputs.showRate / 100);
                const feCloses = liveCalls * (inputs.closeRate / 100);
                const perPointBE = feCloses * 0.01 * inputs.beAov * (inputs.beCollectionRate / 100);
                const feCash = feCloses * inputs.aov * (inputs.feCollectionRate / 100);
                const fixed = feCash + inputs.mrr + inputs.arInstallments;
                const needed = (LOOKBACK_TARGET - fixed) / perPointBE;
                return needed > 0 && needed < 100 ? `${needed.toFixed(1)}%` : "n/a";
              }} unit="%" />
            </div>
            <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 10, lineHeight: 1.5 }}>
              Each &quot;needed&quot; value isolates that single lever — holding everything else at your current slider positions. Pull multiple together to compound the gain.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Mini({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{
      background: "var(--bg-card)", border: "1px solid var(--border)",
      borderRadius: 8, padding: "10px 14px",
    }}>
      <div style={{ fontSize: 9, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 700, color, marginTop: 4, fontFamily: "'IBM Plex Mono', monospace" }}>{value}</div>
    </div>
  );
}

function NeededLever({ label, current, compute, unit }: { label: string; current: number; compute: () => string; unit: string }) {
  const needed = compute();
  return (
    <div style={{
      background: "var(--bg-card)", border: "1px solid var(--border)",
      borderRadius: 6, padding: "8px 10px",
    }}>
      <div style={{ fontSize: 9, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--gold)", marginTop: 2, fontFamily: "'IBM Plex Mono', monospace" }}>
        {needed}
      </div>
      <div style={{ fontSize: 9, color: "var(--muted)", marginTop: 2 }}>
        currently {unit === "%" ? `${current.toFixed(1)}%` : fmtN(current)}
      </div>
    </div>
  );
}
