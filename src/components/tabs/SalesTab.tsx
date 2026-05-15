"use client";

import { useEffect, useState } from "react";
import { KpiCard } from "@/components/ui/KpiCard";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Badge, StatusTag } from "@/components/ui/Badge";
import type { PifSummary } from "@/lib/sources/pif";

function fmt$(n: number) {
  return n >= 1000 ? `$${(n / 1000).toFixed(1)}K` : `$${n.toLocaleString()}`;
}

export function SalesTab() {
  const [data, setData]       = useState<PifSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);

  useEffect(() => {
    fetch("/api/pif")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: PifSummary) => { setData(d); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  const isLive = !loading && !error && data !== null;
  const t = data?.totals;

  return (
    <div>
      {/* Status banner */}
      <div style={{
        background: isLive ? "rgba(16,185,129,0.06)" : "rgba(245,158,11,0.06)",
        border: `1px solid ${isLive ? "rgba(16,185,129,0.25)" : "rgba(245,158,11,0.25)"}`,
        borderRadius: 8, padding: "8px 14px", marginBottom: 16,
        fontFamily: "'IBM Plex Mono', monospace", fontSize: 11,
        color: isLive ? "var(--green)" : "var(--amber)",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <span>{loading ? "Loading PIF Perfect data…" : isLive ? `● Live — PIF Perfect · ${data.month} MTD` : "⚠ Could not load PIF data"}</span>
        {isLive && <span style={{ color: "var(--muted)" }}>Updated: {data.asOf}</span>}
      </div>

      {/* KPI Row */}
      <div className="kpi-grid">
        <KpiCard
          label="Total Sets MTD"
          value={<span style={{ color: "var(--amber)" }}>{loading ? "…" : t?.totalSets ?? "—"}</span>}
          sub="Target: 115–130/mo"
        />
        <KpiCard
          label="Live Calls MTD"
          value={loading ? "…" : t?.showed ?? "—"}
          sub={`Show rate: ${t?.showRate ?? "—"}`}
        />
        <KpiCard
          label="Close Rate MTD"
          value={<span style={{ color: "var(--white)" }}>{loading ? "…" : t?.closeRate ?? "—"}</span>}
          sub={`Apr: 16% · Target: 25% · ${t?.closes ?? "—"} closes`}
          variant="warn"
        />
        <KpiCard
          label="Closed Deals MTD"
          value={<span style={{ color: "var(--green)" }}>{loading ? "…" : t?.closes ?? "—"}</span>}
          sub="@ $12,500 ACV"
          variant="good"
        />
        <KpiCard
          label="FE Revenue MTD"
          value={<span style={{ color: "var(--gold)" }}>{loading ? "…" : t ? fmt$(t.revenue) : "—"}</span>}
          sub={`Cash collected: ${t ? fmt$(t.cash) : "—"}`}
          variant="highlight"
        />
      </div>

      {/* Closer table — fully dynamic */}
      <SectionTitle>
        Closer Performance{" "}
        <StatusTag variant={isLive ? "live" : "pending"}>
          {isLive ? "Live" : "Loading"}
        </StatusTag>
      </SectionTitle>
      <div className="dt">
        <div className="dth" style={{ gridTemplateColumns: "170px repeat(6, 1fr)" }}>
          <div>Closer</div>
          <div>Scheduled</div>
          <div>Showed</div>
          <div>Show %</div>
          <div>Closes</div>
          <div>Close %</div>
          <div>Revenue</div>
        </div>

        {loading && (
          <div className="dtr" style={{ gridTemplateColumns: "170px repeat(6, 1fr)" }}>
            <div className="dtc" style={{ color: "var(--muted)", gridColumn: "1 / -1" }}>Loading…</div>
          </div>
        )}

        {isLive && data.closers.map((c) => {
          const crNum = parseFloat(c.closeRate);
          const crColor = isNaN(crNum) ? "var(--muted)" : crNum >= 25 ? "var(--green)" : crNum >= 15 ? "var(--amber)" : "var(--red)";
          return (
            <div key={c.name} className="dtr" style={{ gridTemplateColumns: "170px repeat(6, 1fr)" }}>
              <div className="dtc nm">{c.name}</div>
              <div className="dtc mono">{c.scheduled}</div>
              <div className="dtc mono">{c.showed}</div>
              <div className="dtc mono">{c.showRate}</div>
              <div className="dtc mono">{c.closes}</div>
              <div className="dtc mono">
                {c.closeRate !== "—"
                  ? <Badge variant={crNum >= 25 ? "green" : crNum >= 15 ? "amber" : "red"}>{c.closeRate}</Badge>
                  : "—"}
              </div>
              <div className="dtc mono" style={{ color: c.revenue > 0 ? "var(--green)" : "var(--muted)" }}>
                {c.revenue > 0 ? fmt$(c.revenue) : "—"}
              </div>
            </div>
          );
        })}

        {isLive && (
          <div className="dttot" style={{ gridTemplateColumns: "170px repeat(6, 1fr)" }}>
            <div>TOTALS</div>
            <div>{t?.scheduled}</div>
            <div>{t?.showed}</div>
            <div>{t?.showRate}</div>
            <div>{t?.closes}</div>
            <div>{t?.closeRate}</div>
            <div>{t ? fmt$(t.revenue) : "—"}</div>
          </div>
        )}
      </div>

      {/* Setter table — fully dynamic */}
      <SectionTitle>
        Setter Performance{" "}
        <StatusTag variant={isLive ? "live" : "pending"}>
          {isLive ? "Live" : "Loading"}
        </StatusTag>
      </SectionTitle>
      <div className="dt">
        <div className="dth" style={{ gridTemplateColumns: "170px repeat(5, 1fr)" }}>
          <div>Setter</div>
          <div>OB Dials</div>
          <div>OB Sets</div>
          <div>IB Sets</div>
          <div>Total Sets</div>
          <div>Booked</div>
        </div>

        {loading && (
          <div className="dtr" style={{ gridTemplateColumns: "170px repeat(5, 1fr)" }}>
            <div className="dtc" style={{ color: "var(--muted)", gridColumn: "1 / -1" }}>Loading…</div>
          </div>
        )}

        {isLive && data.setters.map((s) => (
          <div key={s.name} className="dtr" style={{ gridTemplateColumns: "170px repeat(5, 1fr)" }}>
            <div className="dtc nm">{s.name}</div>
            <div className="dtc mono">{s.obDials || "—"}</div>
            <div className="dtc mono">{s.obSets || "—"}</div>
            <div className="dtc mono">{s.ibSets || "—"}</div>
            <div className="dtc mono">
              {s.totalSets > 0
                ? <Badge variant="green">{s.totalSets}</Badge>
                : "—"}
            </div>
            <div className="dtc mono">{s.callsBooked || "—"}</div>
          </div>
        ))}

        {isLive && (
          <div className="dttot" style={{ gridTemplateColumns: "170px repeat(5, 1fr)" }}>
            <div>TOTALS</div>
            <div>{t?.obDials}</div>
            <div>—</div>
            <div>—</div>
            <div>{t?.totalSets}</div>
            <div>—</div>
          </div>
        )}
      </div>
    </div>
  );
}
