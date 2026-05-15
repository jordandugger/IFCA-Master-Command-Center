"use client";

import { useEffect, useState } from "react";
import styles from "./LookbackBar.module.css";
import type { MissionControlSummary } from "@/app/api/missioncontrol/route";

function fmt$(n: number): string {
  if (!n) return "—";
  const abs = Math.abs(n);
  if (abs >= 1000000) return `${n < 0 ? "-" : ""}$${(abs / 1000000).toFixed(2)}M`;
  if (abs >= 1000)    return `${n < 0 ? "-" : ""}$${(abs / 1000).toFixed(1)}K`;
  return `${n < 0 ? "-" : ""}$${abs.toFixed(0)}`;
}

export function LookbackBar() {
  const [data, setData] = useState<MissionControlSummary | null>(null);

  useEffect(() => {
    fetch("/api/missioncontrol")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d && !d.error) setData(d); })
      .catch(() => {});
  }, []);

  const lb = data?.lookback;
  const planBColor = !lb ? "var(--gold)"
    : lb.daysToPlanB < 30 ? "var(--red)"
    : lb.daysToPlanB < 60 ? "var(--amber)"
    : "var(--gold)";

  const paceColor = !data ? "var(--muted)"
    : data.revenue.variancePct >= 0 ? "var(--green)"
    : data.revenue.variancePct >= -10 ? "var(--amber)"
    : "var(--red)";

  return (
    <div className={styles.bar}>
      <div className={styles.item}>
        <div className={styles.label}>🎯 Lookback Target</div>
        <div className={styles.value} style={{ color: "var(--gold)" }}>$550K</div>
        <div className={styles.note}>2 consecutive months</div>
      </div>
      <div className={styles.divider} />
      <div className={styles.item}>
        <div className={styles.label}>Day of 120</div>
        <div className={styles.value}>{lb ? `${lb.dayNumber}/120` : "—"}</div>
        <div className={styles.note}>Started {lb?.startedOn ?? "—"}</div>
      </div>
      <div className={styles.item}>
        <div className={styles.label}>Plan B Trigger</div>
        <div className={styles.value} style={{ color: planBColor }}>
          {lb ? `${lb.daysToPlanB}d` : "—"}
        </div>
        <div className={styles.note}>{lb?.planBDate ?? "—"}</div>
      </div>
      <div className={styles.divider} />
      <div className={styles.item}>
        <div className={styles.label}>{data?.month ?? "Month"} Pace</div>
        <div className={styles.value} style={{ color: paceColor }}>
          {lb ? fmt$(lb.mtdPace) : "—"}
        </div>
        <div className={styles.note}>
          {data ? `${data.revenue.variancePct >= 0 ? "+" : ""}${data.revenue.variancePct.toFixed(0)}% vs proj` : ""}
        </div>
      </div>
      <div className={styles.item}>
        <div className={styles.label}>Gap to $550K</div>
        <div className={styles.value} style={{ color: "var(--gold)" }}>
          {lb ? fmt$(lb.gap$) : "—"}
        </div>
        <div className={styles.note}>{lb ? `${lb.progressPct.toFixed(0)}% of target` : ""}</div>
      </div>
      <div className={styles.divider} />
      <div className={styles.item}>
        <div className={styles.label}>MTD Generated</div>
        <div className={styles.value} style={{ color: "var(--green)" }}>
          {lb ? fmt$(lb.mtdGenerated) : "—"}
        </div>
        <div className={styles.note}>Live closed revenue</div>
      </div>
      <div className={styles.item}>
        <div className={styles.label}>Projection</div>
        <div className={styles.value}>{lb ? fmt$(lb.mtdProjection) : "—"}</div>
        <div className={styles.note}>Set at month start</div>
      </div>
    </div>
  );
}
