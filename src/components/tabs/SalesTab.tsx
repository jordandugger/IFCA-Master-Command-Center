"use client";

import { useEffect, useState } from "react";
import { KpiCard } from "@/components/ui/KpiCard";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Badge, StatusTag } from "@/components/ui/Badge";
import type { PifSummary } from "@/app/api/pif/route";

const STATIC_CLOSERS = ["Janie (Taeler)", "Samantha", "Jason"];

const STATIC_SETTERS = [
  { name: "Pam",             source: "Taeler IG DMs",    badge: <Badge variant="green">Active</Badge> },
  { name: "Andrea",          source: "IFCA IG / TBD",    badge: <Badge variant="amber">Placement TBD</Badge> },
  { name: "Inbound Aloware", source: "VSL Leads (Paid)", badge: <Badge variant="blue">Paid</Badge> },
];

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

  const val = (v: string | undefined) =>
    loading ? "…" : (v && v !== "—" && v !== "") ? v : "—";

  const isLive = !loading && !error && data !== null;

  const closerRows = STATIC_CLOSERS.map((name) => {
    const firstName = name.split(" ")[0];
    const live = data?.reps.find((r) =>
      r.name.toLowerCase().includes(firstName.toLowerCase())
    );
    return { name, closes: live?.closes, revenue: live?.revenue, closeRate: live?.closeRate };
  });

  return (
    <div>
      {/* Live status banner */}
      {isLive && data && (
        <div style={{
          background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.25)",
          borderRadius: 8, padding: "8px 14px", marginBottom: 16,
          fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "var(--green)",
          display: "flex", justifyContent: "space-between",
        }}>
          <span>● Live — PIF Perfect</span>
          <span style={{ color: "var(--muted)" }}>Updated: {data.lastUpdated}</span>
        </div>
      )}

      {/* KPI Row */}
      <div className="kpi-grid">
        <KpiCard
          label="Sets Booked MTD"
          value={<span style={{ color: "var(--amber)" }}>{val(data?.mtdSets)}</span>}
          sub="Target: 115–130/mo"
        />
        <KpiCard
          label="Live Calls MTD"
          value={val(data?.mtdLive)}
          sub="Approved → showed"
        />
        <KpiCard
          label="Close Rate MTD"
          value={<span style={{ color: isLive ? "var(--white)" : "var(--red)" }}>{val(data?.mtdCloseRate)}</span>}
          sub="Target: 25% · Apr: 16%"
          variant="warn"
        />
        <KpiCard
          label="Closed Deals MTD"
          value={<span style={{ color: "var(--green)" }}>{val(data?.mtdCloses)}</span>}
          sub="@ $12,500 ACV"
          variant="good"
        />
        <KpiCard
          label="FE Revenue Generated"
          value={<span style={{ color: "var(--gold)" }}>{val(data?.mtdRevenue)}</span>}
          sub="From PIF Perfect"
          variant="highlight"
        />
      </div>

      {/* Closer table */}
      <SectionTitle>
        Closer Performance{" "}
        <StatusTag variant={isLive ? "live" : "pending"}>
          {isLive ? "Live" : "PIF Feed Pending"}
        </StatusTag>
      </SectionTitle>
      <div className="dt">
        <div className="dth" style={{ gridTemplateColumns: "150px repeat(7, 1fr)" }}>
          <div>Closer</div><div>Slots</div><div>Appr. Calls</div><div>Show %</div>
          <div>Live</div><div>Closes</div><div>CR%</div><div>Revenue</div>
        </div>
        {closerRows.map((c) => (
          <div key={c.name} className="dtr" style={{ gridTemplateColumns: "150px repeat(7, 1fr)" }}>
            <div className="dtc nm">{c.name}</div>
            <div className="dtc mono">—</div>
            <div className="dtc mono">—</div>
            <div className="dtc mono">{val(data?.mtdShowRate)}</div>
            <div className="dtc mono">—</div>
            <div className="dtc mono">{val(c.closes)}</div>
            <div className="dtc mono">
              {c.closeRate && c.closeRate !== "—"
                ? <Badge variant="green">{c.closeRate}</Badge>
                : "—"}
            </div>
            <div className="dtc mono">{val(c.revenue)}</div>
          </div>
        ))}
        <div className="dttot" style={{ gridTemplateColumns: "150px repeat(7, 1fr)" }}>
          <div>TOTALS</div><div>—</div><div>—</div>
          <div>{val(data?.mtdShowRate)}</div>
          <div>{val(data?.mtdLive)}</div>
          <div>{val(data?.mtdCloses)}</div>
          <div>{val(data?.mtdCloseRate)}</div>
          <div>{val(data?.mtdRevenue)}</div>
        </div>
      </div>

      {/* Setter table */}
      <SectionTitle>
        Setter Performance{" "}
        <StatusTag variant={isLive ? "live" : "pending"}>
          {isLive ? "Live" : "PIF Feed Pending"}
        </StatusTag>
      </SectionTitle>
      <div className="dt">
        <div className="dth" style={{ gridTemplateColumns: "150px repeat(4, 1fr) 120px" }}>
          <div>Setter</div><div>Dials</div><div>Sets</div><div>Set Rate</div>
          <div>Lead Source</div><div>Status</div>
        </div>
        {STATIC_SETTERS.map((s) => (
          <div key={s.name} className="dtr" style={{ gridTemplateColumns: "150px repeat(4, 1fr) 120px" }}>
            <div className="dtc nm">{s.name}</div>
            <div className="dtc mono">{val(data?.mtdCalls)}</div>
            <div className="dtc mono">{val(data?.mtdSets)}</div>
            <div className="dtc mono">{val(data?.mtdSetRate)}</div>
            <div className="dtc">{s.source}</div>
            <div className="dtc">{s.badge}</div>
          </div>
        ))}
        <div className="dttot" style={{ gridTemplateColumns: "150px repeat(4, 1fr) 120px" }}>
          <div>TOTALS</div>
          <div>{val(data?.mtdCalls)}</div>
          <div>{val(data?.mtdSets)}</div>
          <div>{val(data?.mtdSetRate)}</div>
          <div>—</div><div>—</div>
        </div>
      </div>
    </div>
  );
}
