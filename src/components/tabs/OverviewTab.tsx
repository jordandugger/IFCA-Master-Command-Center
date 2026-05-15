"use client";

import { useEffect, useState } from "react";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { SectionTitle } from "@/components/ui/SectionTitle";
import type { TabId } from "@/components/layout/Header";
import type { MissionControlSummary, Severity } from "@/app/api/missioncontrol/route";
import styles from "./OverviewTab.module.css";

interface Props {
  onNavigate?: (tab: TabId) => void;
}

function fmt$(n: number): string {
  if (n === 0) return "—";
  const abs = Math.abs(n);
  if (abs >= 1000000) return `${n < 0 ? "-" : ""}$${(abs / 1000000).toFixed(2)}M`;
  if (abs >= 1000)    return `${n < 0 ? "-" : ""}$${(abs / 1000).toFixed(1)}K`;
  return `${n < 0 ? "-" : ""}$${abs.toFixed(0)}`;
}

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

export function OverviewTab({ onNavigate }: Props) {
  const [data, setData]       = useState<MissionControlSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/missioncontrol")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) { setError(d.error); setLoading(false); return; }
        setData(d as MissionControlSummary); setLoading(false);
      })
      .catch((e) => { setError(String(e)); setLoading(false); });
  }, []);

  const isLive = !loading && !error && data !== null;
  const lb = data?.lookback;
  const rev = data?.revenue;

  const planBColor = !lb ? "var(--gold)"
    : lb.daysToPlanB < 30 ? "var(--red)"
    : lb.daysToPlanB < 60 ? "var(--amber)"
    : "var(--gold)";

  const handleDrill = (tab: string) => {
    if (!onNavigate) return;
    if (tab === "ads" || tab === "sales" || tab === "backend" || tab === "projections" || tab === "overview") {
      onNavigate(tab as TabId);
    }
  };

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
          {loading ? "Loading mission control…"
            : isLive ? `● Live — Mission Control · ${data.month} Day ${data.currentDay} of ${data.daysInMonth}`
            : `⚠ Mission control error: ${error}`}
        </span>
        {isLive && (
          <span style={{ color: "var(--muted)" }}>
            Sources: PIF {data.meta.pifOk ? "✓" : "⚠"} · Hyros {data.meta.hyrosOk ? "✓" : "⚠"} · Projections {data.meta.projectionsOk ? "✓" : "⚠"} · BE {data.meta.backendOk ? "✓" : "⚠"} · Updated: {data.asOf}
          </span>
        )}
      </div>

      {/* ── LOOKBACK HERO ── */}
      <div style={{
        background: "linear-gradient(135deg, rgba(212,175,55,0.08), rgba(212,175,55,0.02))",
        border: "1px solid rgba(212,175,55,0.3)",
        borderRadius: 12, padding: "20px 24px", marginBottom: 24,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
          <div>
            <div className={styles.miniLabel}>🎯 $550K Lookback Target — 2 Consecutive Months</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: "var(--gold)", marginTop: 4 }}>
              {lb ? fmt$(lb.mtdPace) : "…"}
              <span style={{ fontSize: 14, color: "var(--muted)", marginLeft: 10 }}>
                projected end-of-month
              </span>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className={styles.miniLabel}>Day {lb?.dayNumber ?? "—"} of 120</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: planBColor, marginTop: 4 }}>
              {lb ? `${lb.daysToPlanB} days` : "—"}
            </div>
            <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 2 }}>
              Plan B trigger: {lb?.planBDate ?? "—"}
            </div>
          </div>
        </div>
        <ProgressBar
          label={`Gap to $550K: ${lb ? fmt$(lb.gap$) : "—"}`}
          rightLabel={lb ? `${lb.progressPct.toFixed(0)}%` : "—"}
          percent={lb?.progressPct ?? 0}
          color="gold"
          height={10}
        />
      </div>

      {/* ── PILLAR HEALTH ── */}
      <SectionTitle>Pillar Health</SectionTitle>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 12,
        marginBottom: 24,
      }}>
        {(data?.pillarHealth ?? []).map((p) => (
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
              textTransform: "uppercase", letterSpacing: 0.5,
              marginBottom: 4,
            }}>
              {p.score === "green" ? "Healthy" : p.score === "amber" ? "Watch" : "Action Needed"}
            </div>
            <div style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.4 }}>
              {p.reason}
            </div>
          </button>
        ))}
      </div>

      {/* ── WHAT NEEDS ATTENTION + REVENUE PULSE ── */}
      <div className="two-col">
        <div>
          <SectionTitle>What Needs Attention</SectionTitle>
          {!isLive && (
            <div style={{ color: "var(--muted)", padding: 16 }}>Scanning constraints…</div>
          )}
          {isLive && data.constraints.length === 0 && (
            <div style={{
              padding: 24, borderRadius: 8,
              background: "rgba(16,185,129,0.06)",
              border: "1px solid rgba(16,185,129,0.2)",
              color: "var(--green)", textAlign: "center",
            }}>
              🟢 No critical constraints detected — keep executing.
            </div>
          )}
          {isLive && data.constraints.map((c, i) => (
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
                <div style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.5 }}>
                  {c.reason}
                </div>
              </div>
              <div style={{ textAlign: "right", marginLeft: 16, minWidth: 110 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: sevColor(c.severity), fontFamily: "'IBM Plex Mono', monospace" }}>
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
          <SectionTitle>Revenue Pulse — {data?.month ?? ""}</SectionTitle>
          <div className="pbox">
            <div className={styles.equilGrid}>
              <div>
                <div className={styles.miniLabel}>MTD Generated</div>
                <div className={styles.bigNum} style={{ color: "var(--green)" }}>
                  {rev ? fmt$(rev.mtdGenerated) : "—"}
                </div>
                <div className={styles.miniSub}>Actual closed</div>
              </div>
              <div>
                <div className={styles.miniLabel}>Projection</div>
                <div className={styles.bigNum}>{rev ? fmt$(rev.mtdProjection) : "—"}</div>
                <div className={styles.miniSub}>Set at month start</div>
              </div>
              <div>
                <div className={styles.miniLabel}>End-of-Month Pace</div>
                <div className={styles.medNum} style={{
                  color: rev && rev.variancePct >= 0 ? "var(--green)" : rev && rev.variancePct >= -10 ? "var(--amber)" : "var(--red)",
                }}>
                  {rev ? fmt$(rev.mtdPace) : "—"}
                </div>
                <div className={styles.miniSub}>
                  {rev ? `${rev.variancePct >= 0 ? "+" : ""}${rev.variancePct.toFixed(1)}% vs proj` : ""}
                </div>
              </div>
              <div>
                <div className={styles.miniLabel}>Days Remaining</div>
                <div className={styles.medNum}>
                  {data ? data.daysRemaining : "—"}
                </div>
                <div className={styles.miniSub}>
                  {data ? `${data.currentDay}/${data.daysInMonth} elapsed` : ""}
                </div>
              </div>
            </div>
            {rev && rev.mtdProjection > 0 && (
              <ProgressBar
                label="MTD vs Projection"
                rightLabel={`${((rev.mtdGenerated / rev.mtdProjection) * 100).toFixed(0)}%`}
                percent={(rev.mtdGenerated / rev.mtdProjection) * 100}
                color={rev.variancePct >= 0 ? "green" : rev.variancePct >= -10 ? "amber" : "red"}
              />
            )}
          </div>

          {/* Quick Actions */}
          <SectionTitle>Quick Actions</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {[
              { label: "View Sales Drill-Down",    tab: "sales"       as TabId, icon: "📞" },
              { label: "View Ad Performance",      tab: "ads"         as TabId, icon: "📊" },
              { label: "View Back-End + SC Stats", tab: "backend"     as TabId, icon: "🎯" },
              { label: "View Full Projections",    tab: "projections" as TabId, icon: "📈" },
            ].map((a) => (
              <button
                key={a.tab}
                onClick={() => onNavigate?.(a.tab)}
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  borderRadius: 8, padding: "12px 14px",
                  cursor: "pointer", fontFamily: "inherit", color: "var(--text)",
                  textAlign: "left", fontSize: 12,
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
}
