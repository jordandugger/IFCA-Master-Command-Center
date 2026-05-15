"use client";

import { useEffect, useState } from "react";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StatusTag } from "@/components/ui/Badge";
import type { ProjectionsSummary, ProjectionRow } from "@/lib/sources/projections";
import styles from "./ProjectionsTab.module.css";

function fmt$(n: number): string {
  if (n === 0) return "—";
  const abs = Math.abs(n);
  if (abs >= 1000) return `${n < 0 ? "-" : ""}$${(abs / 1000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}
function fmtN(n: number): string {
  return n === 0 ? "—" : n.toLocaleString();
}
function fmtPct(n: number): string {
  return n === 0 ? "—" : `${n.toFixed(1)}%`;
}
function fmtRow(r: ProjectionRow, val: number): string {
  if (val === 0 && r.actual === 0 && r.projection === 0) return "—";
  switch (r.unit) {
    case "currency": return fmt$(val);
    case "percent":  return `${val.toFixed(1)}%`;
    case "ratio":    return val > 0 ? `${val.toFixed(2)}x` : "—";
    default:         return fmtN(val);
  }
}

function varianceColor(v: string): string {
  if (!v || v === "—") return "var(--muted)";
  const n = parseFloat(v.replace(/[%,]/g, ""));
  if (isNaN(n)) return "var(--muted)";
  if (n >= 0) return "var(--green)";
  if (n >= -10) return "var(--amber)";
  return "var(--red)";
}

function ProjectionsTable({ title, rows, statusTag }: { title: string; rows: ProjectionRow[]; statusTag?: string }) {
  if (!rows.length) return null;
  return (
    <>
      <SectionTitle>
        {title}{" "}
        {statusTag && <StatusTag variant="live">{statusTag}</StatusTag>}
      </SectionTitle>
      <div className="dt">
        <div className="dth" style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr" }}>
          <div>Metric</div>
          <div>Projection</div>
          <div>Actual</div>
          <div>Pace</div>
          <div>Variance</div>
        </div>
        {rows.map((r, i) => {
          const isTotal = r.label.toLowerCase().includes("total") || r.label.startsWith("~");
          const cleanLabel = r.label.replace(/^~+\s*/, "").trim();
          return (
            <div key={i} className={isTotal ? "dttot" : "dtr"}
                 style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr" }}>
              <div className={isTotal ? "" : "dtc nm"}>{cleanLabel}</div>
              <div className={isTotal ? "" : "dtc mono"}>{fmtRow(r, r.projection)}</div>
              <div className={isTotal ? "" : "dtc mono"}>{fmtRow(r, r.actual)}</div>
              <div className={isTotal ? "" : "dtc mono"}>{fmtRow(r, r.pace)}</div>
              <div className={isTotal ? "" : "dtc mono"} style={{ color: varianceColor(r.varianceText) }}>
                {r.varianceText || "—"}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

export function ProjectionsTab() {
  const [data, setData] = useState<ProjectionsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/projections")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) { setError(d.error); setLoading(false); return; }
        setData(d as ProjectionsSummary); setLoading(false);
      })
      .catch((e) => { setError(String(e)); setLoading(false); });
  }, []);

  const isLive = !loading && !error && data !== null;
  const t = data?.totals;

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
          {loading ? "Loading projections sheet…"
            : isLive ? `● Live — ${data.month} Projections · Day ${data.currentDay} of ${data.daysInMonth}`
            : `⚠ Projections error: ${error}`}
        </span>
        {isLive && <span style={{ color: "var(--muted)" }}>Updated: {data.asOf}</span>}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <SectionTitle>Monthly Projections — {data?.month ?? ""} 2026</SectionTitle>
      </div>

      {/* Month progress bar */}
      {isLive && (
        <ProgressBar
          label={`Month progress: Day ${data.currentDay} of ${data.daysInMonth}`}
          rightLabel={`${data.progressPct.toFixed(0)}%`}
          percent={data.progressPct}
          color="gold"
          height={6}
        />
      )}

      {/* Hero Summary */}
      <div className="three-col" style={{ marginTop: 16 }}>
        <div className="pbox">
          <div className={styles.miniLabel}>Total Generated Revenue</div>
          <div className={styles.projNum}>{t ? fmt$(t.totalGenRev) : "…"}</div>
          <ProgressBar
            label={`Proj: ${t ? fmt$(t.totalGenRevProj) : "—"}`}
            rightLabel={t && t.totalGenRevProj > 0 ? `${((t.totalGenRev / t.totalGenRevProj) * 100).toFixed(0)}%` : "—"}
            percent={t && t.totalGenRevProj > 0 ? (t.totalGenRev / t.totalGenRevProj) * 100 : 0}
            color="green"
          />
        </div>
        <div className="pbox">
          <div className={styles.miniLabel}>FE Closes (IFCA)</div>
          <div className={styles.projNum}>
            {t ? `${t.feCloses}` : "…"}
            <span style={{ fontSize: 14, color: "var(--muted)", marginLeft: 8 }}>
              / {t?.feClosesProj ?? "—"}
            </span>
          </div>
          <ProgressBar
            label={`Close Rate: ${t ? fmtPct(t.closeRate) : "—"}`}
            rightLabel={`Target: ${t ? fmtPct(t.closeRateProj) : "—"}`}
            percent={t && t.closeRateProj > 0 ? (t.closeRate / t.closeRateProj) * 100 : 0}
            color={t && t.closeRate >= t.closeRateProj ? "green" : "amber"}
          />
        </div>
        <div className="pbox">
          <div className={styles.miniLabel}>Ad Spend MTD</div>
          <div className={styles.projNum}>{t ? fmt$(t.adSpend) : "…"}</div>
          <div className={styles.projSub}>
            ROAS Gen: <span style={{ color: "var(--green)" }}>{t && t.roasGen > 0 ? `${t.roasGen.toFixed(2)}x` : "—"}</span>
            {" · "}
            Col: <span style={{ color: t && t.roasCol >= 2 ? "var(--green)" : "var(--amber)" }}>
              {t && t.roasCol > 0 ? `${t.roasCol.toFixed(2)}x` : "—"}
            </span>
          </div>
        </div>
      </div>

      {/* Gold target banner */}
      <div className={styles.targetBanner} style={{ marginTop: 20 }}>
        <div>
          <div className={styles.targetLabel}>AOV (Average Order Value)</div>
          <div className={styles.targetValue}>{t ? fmt$(t.aov) : "—"}</div>
          <div className={styles.targetSub}>
            Upfront Collected: <span style={{ color: "var(--gold)", fontWeight: 700 }}>{t ? fmt$(t.totalUpfrontCollected) : "—"}</span>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className={styles.miniLabel}>Lookback Floor</div>
          <div className={styles.floorValue}>$550K</div>
          <div className={styles.projSub} style={{ marginTop: 4 }}>
            {t && t.totalGenRev > 0
              ? `${((t.totalGenRev / 550000) * 100).toFixed(0)}% of target`
              : "—"}
          </div>
        </div>
      </div>

      {isLive && data && (
        <>
          {/* Revenue */}
          <ProjectionsTable title="Revenue" rows={data.revenue} statusTag="Live" />

          <div className="two-col" style={{ marginTop: 24 }}>
            {/* MRR */}
            <div>
              <ProjectionsTable title="Monthly Recurring Revenue" rows={data.mrr} />
            </div>
            {/* AR */}
            <div>
              <ProjectionsTable title="Accounts Receivable" rows={data.ar} />
            </div>
          </div>

          {/* Marketing */}
          <ProjectionsTable title="Marketing & Ad Performance" rows={data.marketing} />

          {/* Sales Funnel */}
          <ProjectionsTable title="Sales Funnel" rows={data.funnel} />

          {/* FE Closes */}
          <ProjectionsTable title="Front-End Sales" rows={data.closes} />

          {/* BE */}
          <ProjectionsTable title="Back-End Sales" rows={data.backend} />

          {/* Refunds */}
          <ProjectionsTable title="Cancellations & Refunds" rows={data.refunds} />
        </>
      )}
    </div>
  );
}
