"use client";

import { useEffect, useState } from "react";
import { KpiCard } from "@/components/ui/KpiCard";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Badge, StatusTag } from "@/components/ui/Badge";
import type { PifSummary } from "@/lib/sources/pif";

// ── KPI targets (daily values from PIF column headers) ──────────────────────
const KPI_MINS_PER_DAY          = 480;
const KPI_CONVOS_MANUAL_PER_DAY = 140;
const KPI_FOLLOWUPS_PER_DAY     = 50;
const KPI_HANDOFFS_PER_DAY      = 10;
const KPI_CALLS_BOOKED_PER_DAY  = 2.5;

function fmt$(n: number): string {
  if (n === 0) return "—";
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}K`;
  return `$${n.toLocaleString()}`;
}
function fmtN(n: number): string { return n === 0 ? "—" : n.toLocaleString(); }
function pctNum(s: string): number {
  const n = parseFloat(s.replace("%", ""));
  return isNaN(n) ? 0 : n;
}
function ratio(num: number, denom: number, digits = 1): string {
  if (denom === 0) return "—";
  return (num / denom).toFixed(digits);
}
function pct(num: number, denom: number): string {
  if (denom === 0) return "—";
  return `${((num / denom) * 100).toFixed(1)}%`;
}

function closeRateColor(rate: number): "green" | "amber" | "red" {
  return rate >= 25 ? "green" : rate >= 15 ? "amber" : "red";
}
function showRateColor(rate: number): "green" | "amber" | "red" {
  return rate >= 66 ? "green" : rate >= 55 ? "amber" : "red";
}
function kpiColor(actual: number, target: number): string {
  const p = target > 0 ? actual / target : 0;
  if (p >= 0.95) return "var(--green)";
  if (p >= 0.70) return "var(--amber)";
  return "var(--red)";
}
function kpiChip(actual: number, target: number): React.ReactNode {
  const p = target > 0 ? (actual / target) * 100 : 0;
  const variant: "green" | "amber" | "red" = p >= 95 ? "green" : p >= 70 ? "amber" : "red";
  return <Badge variant={variant}>{p.toFixed(0)}%</Badge>;
}

// Pro-rated KPI target = daily × max(days worked, 1)
function prorated(dailyTarget: number, daysWithActivity: number): number {
  return dailyTarget * Math.max(daysWithActivity, 1);
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
        <span>{loading ? "Loading PIF Perfect data…"
          : isLive ? `● Live — PIF Perfect · ${data.month} MTD · Day ${data.currentDay} of ${data.daysInMonth}`
          : "⚠ Could not load PIF data"}</span>
        {isLive && <span style={{ color: "var(--muted)" }}>Updated: {data.asOf}</span>}
      </div>

      {/* ── SECTION 1: TEAM HEADLINE KPIs ── */}
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
          sub={`Cash collected: ${t ? fmt$(t.cash) : "—"} (${t?.cashRate ?? "—"})`}
          variant="highlight"
        />
      </div>

      {/* ── SECTION 2: CLOSER PERFORMANCE — FULL FUNNEL ── */}
      <SectionTitle>
        Closer Performance — Full Funnel{" "}
        <StatusTag variant={isLive ? "live" : "pending"}>{isLive ? "Live" : "Loading"}</StatusTag>
      </SectionTitle>
      <ScrollableTable
        cols={[
          { label: "Closer", w: "150px" },
          { label: "Sched" },
          { label: "Showed" },
          { label: "Show %" },
          { label: "Live Consults" },
          { label: "Offers" },
          { label: "Offer %" },
          { label: "Sets Offered" },
          { label: "Closes" },
          { label: "Close %" },
          { label: "Call Close %" },
          { label: "Deposits" },
          { label: "Revenue" },
          { label: "Cash" },
          { label: "Cash %" },
        ]}
      >
        {isLive && data.closers.map((c) => {
          const cr = pctNum(c.closeRate);
          const sr = pctNum(c.showRate);
          return (
            <Row key={c.name} cols={[
              { v: c.name, w: "150px", nm: true },
              { v: fmtN(c.scheduled) },
              { v: fmtN(c.showed) },
              { v: c.showRate !== "—" ? <Badge variant={showRateColor(sr)}>{c.showRate}</Badge> : "—" },
              { v: fmtN(c.liveConsults) },
              { v: fmtN(c.offers) },
              { v: c.offerRate },
              { v: fmtN(c.setsOffered) },
              { v: fmtN(c.closes) },
              { v: c.closeRate !== "—" ? <Badge variant={closeRateColor(cr)}>{c.closeRate}</Badge> : "—" },
              { v: c.callCloseRate },
              { v: fmtN(c.deposits) },
              { v: fmt$(c.revenue) },
              { v: <span style={{ color: c.cash > 0 ? "var(--green)" : "var(--muted)" }}>{fmt$(c.cash)}</span> },
              { v: c.cashRate },
            ]} />
          );
        })}
        {isLive && t && (
          <TotalRow cols={[
            { v: "TOTALS", w: "150px" },
            { v: fmtN(t.scheduled) },
            { v: fmtN(t.showed) },
            { v: t.showRate },
            { v: fmtN(t.liveConsults) },
            { v: fmtN(t.offers) },
            { v: t.offerRate },
            { v: "—" },
            { v: fmtN(t.closes) },
            { v: t.closeRate },
            { v: t.callCloseRate },
            { v: "—" },
            { v: fmt$(t.revenue) },
            { v: fmt$(t.cash) },
            { v: t.cashRate },
          ]} />
        )}
      </ScrollableTable>

      {/* ── SECTION 3: OB DIAL SETTERS — ACTIVITY (LEADING) ── */}
      <SectionTitle>
        Outbound Dial Setters — Activity (Leading){" "}
        <StatusTag variant={isLive ? "live" : "pending"}>
          {isLive ? `${data.obSetters.length} setters` : "Loading"}
        </StatusTag>
      </SectionTitle>
      <ScrollableTable
        cols={[
          { label: "Setter", w: "150px" },
          { label: "Days" },
          { label: "Mins Worked" },
          { label: "Mins / 480" },
          { label: "OB Leads Assigned" },
          { label: "OB Total Dials" },
          { label: "Dials / Lead" },
          { label: "OB Meaningful Convos" },
          { label: "Convo Rate" },
        ]}
      >
        {isLive && data.obSetters.map((s) => {
          const minsKpi = prorated(KPI_MINS_PER_DAY, s.daysWithActivity);
          return (
            <Row key={s.name} cols={[
              { v: <span>{s.name}{s.type === "hybrid" ? <span style={{ fontSize: 9, color: "var(--muted)", marginLeft: 6 }}>HYBRID</span> : null}</span>, w: "150px", nm: true },
              { v: fmtN(s.daysWithActivity) },
              { v: <span style={{ color: kpiColor(s.minsWorked, minsKpi) }}>{fmtN(s.minsWorked)}</span> },
              { v: kpiChip(s.minsWorked, minsKpi) },
              { v: fmtN(s.obLeadsAssigned) },
              { v: fmtN(s.obDials) },
              { v: ratio(s.obDials, s.obLeadsAssigned, 1) },
              { v: fmtN(s.obMeaningfulConvos) },
              { v: pct(s.obMeaningfulConvos, s.obDials) },
            ]} />
          );
        })}
      </ScrollableTable>

      {/* ── SECTION 4: OB DIAL SETTERS — OUTPUT (LAGGING) ── */}
      <SectionTitle>Outbound Dial Setters — Output (Lagging)</SectionTitle>
      <ScrollableTable
        cols={[
          { label: "Setter", w: "150px" },
          { label: "OB Sets Made" },
          { label: "IB Calls Sched" },
          { label: "IB Calls Live" },
          { label: "IB Sets" },
          { label: "Total Sets" },
          { label: "Sets / Lead" },
          { label: "Sets on Cal" },
          { label: "Handoffs" },
        ]}
      >
        {isLive && data.obSetters.map((s) => (
          <Row key={s.name} cols={[
            { v: s.name, w: "150px", nm: true },
            { v: s.obSets > 0 ? <Badge variant="green">{fmtN(s.obSets)}</Badge> : "—" },
            { v: fmtN(s.ibCallsScheduled) },
            { v: fmtN(s.ibCallsLive) },
            { v: s.ibSets > 0 ? <Badge variant="green">{fmtN(s.ibSets)}</Badge> : "—" },
            { v: s.totalSets > 0 ? <Badge variant="green">{fmtN(s.totalSets)}</Badge> : "—" },
            { v: pct(s.totalSets, s.obLeadsAssigned) },
            { v: fmtN(s.setsOnCalendar) },
            { v: fmtN(s.handoffs) },
          ]} />
        ))}
      </ScrollableTable>

      {/* ── SECTION 5: DM SETTERS — ACTIVITY (LEADING) ── */}
      <SectionTitle>
        DM Setters — Activity (Leading){" "}
        <StatusTag variant={isLive ? "live" : "pending"}>
          {isLive ? `${data.dmSetters.length} setters` : "Loading"}
        </StatusTag>
      </SectionTitle>
      <ScrollableTable
        cols={[
          { label: "Setter", w: "150px" },
          { label: "Days" },
          { label: "Mins Worked" },
          { label: "Mins / 480" },
          { label: "DM Leads" },
          { label: "New Convos Auto" },
          { label: "New Convos Manual" },
          { label: "Manual / 140" },
          { label: "Follow Ups" },
          { label: "Follow Ups / 50" },
          { label: "Active Convos" },
          { label: "DM Meaningful Convos" },
        ]}
      >
        {isLive && data.dmSetters.map((s) => {
          const minsKpi   = prorated(KPI_MINS_PER_DAY, s.daysWithActivity);
          const convosKpi = prorated(KPI_CONVOS_MANUAL_PER_DAY, s.daysWithActivity);
          const followKpi = prorated(KPI_FOLLOWUPS_PER_DAY, s.daysWithActivity);
          return (
            <Row key={s.name} cols={[
              { v: <span>{s.name}{s.type === "hybrid" ? <span style={{ fontSize: 9, color: "var(--muted)", marginLeft: 6 }}>HYBRID</span> : null}</span>, w: "150px", nm: true },
              { v: fmtN(s.daysWithActivity) },
              { v: <span style={{ color: kpiColor(s.minsWorked, minsKpi) }}>{fmtN(s.minsWorked)}</span> },
              { v: kpiChip(s.minsWorked, minsKpi) },
              { v: fmtN(s.dmLeadsAssigned) },
              { v: fmtN(s.newConvosAuto) },
              { v: <span style={{ color: kpiColor(s.newConvosManual, convosKpi) }}>{fmtN(s.newConvosManual)}</span> },
              { v: kpiChip(s.newConvosManual, convosKpi) },
              { v: <span style={{ color: kpiColor(s.followUps, followKpi) }}>{fmtN(s.followUps)}</span> },
              { v: kpiChip(s.followUps, followKpi) },
              { v: fmtN(s.activeConvos) },
              { v: fmtN(s.dmMeaningfulConvos) },
            ]} />
          );
        })}
      </ScrollableTable>

      {/* ── SECTION 6: DM SETTERS — OUTPUT (LAGGING) ── */}
      <SectionTitle>DM Setters — Output (Lagging)</SectionTitle>
      <ScrollableTable
        cols={[
          { label: "Setter", w: "150px" },
          { label: "DM Sets Made" },
          { label: "Calls Pitched" },
          { label: "Pitch Rate" },
          { label: "Calls Booked" },
          { label: "Booked / 2.5" },
          { label: "Book Rate" },
          { label: "Handoffs" },
          { label: "Handoffs / 10" },
          { label: "Sets on Cal" },
        ]}
      >
        {isLive && data.dmSetters.map((s) => {
          const callsKpi   = prorated(KPI_CALLS_BOOKED_PER_DAY, s.daysWithActivity);
          const handoffKpi = prorated(KPI_HANDOFFS_PER_DAY, s.daysWithActivity);
          return (
            <Row key={s.name} cols={[
              { v: s.name, w: "150px", nm: true },
              { v: s.dmSets > 0 ? <Badge variant="green">{fmtN(s.dmSets)}</Badge> : "—" },
              { v: fmtN(s.callsPitched) },
              { v: pct(s.callsPitched, s.activeConvos) },
              { v: s.callsBooked > 0 ? <Badge variant="green">{fmtN(s.callsBooked)}</Badge> : "—" },
              { v: kpiChip(s.callsBooked, callsKpi) },
              { v: pct(s.callsBooked, s.callsPitched) },
              { v: fmtN(s.handoffs) },
              { v: kpiChip(s.handoffs, handoffKpi) },
              { v: fmtN(s.setsOnCalendar) },
            ]} />
          );
        })}
      </ScrollableTable>

      {/* ── SECTION 7: SETTER EFFICIENCY RATIOS ── */}
      <SectionTitle>
        Setter Efficiency — Quality vs Volume{" "}
        <StatusTag variant="live">Computed</StatusTag>
      </SectionTitle>
      <ScrollableTable
        cols={[
          { label: "Setter", w: "150px" },
          { label: "Type" },
          { label: "Dials / Hour" },
          { label: "Convos / Dial" },
          { label: "Sets / Convo" },
          { label: "Sets / Lead" },
          { label: "Calls / Pitch" },
          { label: "Pitch / Active" },
          { label: "$ / Set (team avg)" },
        ]}
      >
        {isLive && data.setters.map((s) => {
          const totalConvos = s.obMeaningfulConvos + s.dmMeaningfulConvos;
          const totalLeads  = s.obLeadsAssigned + s.dmLeadsAssigned;
          const teamAovPerSet = t && t.totalSets > 0 ? t.revenue / t.totalSets : 0;
          const hoursWorked = s.minsWorked / 60;
          return (
            <Row key={s.name} cols={[
              { v: s.name, w: "150px", nm: true },
              { v: <span style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase" }}>{s.type}</span> },
              { v: ratio(s.obDials, hoursWorked, 1) },
              { v: pct(totalConvos, s.obDials) },
              { v: pct(s.totalSets, totalConvos) },
              { v: pct(s.totalSets, totalLeads) },
              { v: pct(s.callsBooked, s.callsPitched) },
              { v: pct(s.callsPitched, s.activeConvos) },
              { v: fmt$(teamAovPerSet) },
            ]} />
          );
        })}
      </ScrollableTable>

      {/* ── SECTION 8: KPI COMPLIANCE SCORECARD ── */}
      <SectionTitle>
        KPI Compliance Scorecard{" "}
        <StatusTag variant="live">Pro-rated to days worked</StatusTag>
      </SectionTitle>
      <ScrollableTable
        cols={[
          { label: "Setter", w: "150px" },
          { label: "Type" },
          { label: "Days" },
          { label: "Mins / 480" },
          { label: "Manual Convos / 140" },
          { label: "Follow Ups / 50" },
          { label: "Handoffs / 10" },
          { label: "Calls Booked / 2.5" },
          { label: "Overall Score" },
        ]}
      >
        {isLive && data.setters.map((s) => {
          const isDM = s.type === "dm" || s.type === "hybrid";
          const days = s.daysWithActivity;
          const minsKpi    = prorated(KPI_MINS_PER_DAY, days);
          const convosKpi  = prorated(KPI_CONVOS_MANUAL_PER_DAY, days);
          const followKpi  = prorated(KPI_FOLLOWUPS_PER_DAY, days);
          const handoffKpi = prorated(KPI_HANDOFFS_PER_DAY, days);
          const callsKpi   = prorated(KPI_CALLS_BOOKED_PER_DAY, days);

          const scores = [
            s.minsWorked / minsKpi,
            ...(isDM ? [
              s.newConvosManual / convosKpi,
              s.followUps / followKpi,
              s.callsBooked / callsKpi,
            ] : []),
            s.handoffs / handoffKpi,
          ].filter((n) => isFinite(n) && !isNaN(n));
          const avg = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length) * 100 : 0;
          const variant: "green" | "amber" | "red" = avg >= 90 ? "green" : avg >= 70 ? "amber" : "red";

          return (
            <Row key={s.name} cols={[
              { v: s.name, w: "150px", nm: true },
              { v: <span style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase" }}>{s.type}</span> },
              { v: fmtN(days) },
              { v: kpiChip(s.minsWorked, minsKpi) },
              { v: isDM ? kpiChip(s.newConvosManual, convosKpi) : <span style={{ color: "var(--muted)" }}>n/a</span> },
              { v: isDM ? kpiChip(s.followUps, followKpi)       : <span style={{ color: "var(--muted)" }}>n/a</span> },
              { v: kpiChip(s.handoffs, handoffKpi) },
              { v: isDM ? kpiChip(s.callsBooked, callsKpi)      : <span style={{ color: "var(--muted)" }}>n/a</span> },
              { v: <Badge variant={variant}>{avg.toFixed(0)}%</Badge> },
            ]} />
          );
        })}
      </ScrollableTable>
    </div>
  );
}

// ── Helper components ──────────────────────────────────────────────────────
function ScrollableTable({ cols, children }: { cols: { label: string; w?: string }[]; children: React.ReactNode }) {
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

function Row({ cols }: { cols: { v: React.ReactNode; w?: string; nm?: boolean }[] }) {
  const gridCols = cols.map((c) => c.w ?? "1fr").join(" ");
  return (
    <div className="dtr" style={{ gridTemplateColumns: gridCols }}>
      {cols.map((c, i) => (
        <div key={i} className={c.nm ? "dtc nm" : "dtc mono"}>{c.v}</div>
      ))}
    </div>
  );
}

function TotalRow({ cols }: { cols: { v: React.ReactNode; w?: string }[] }) {
  const gridCols = cols.map((c) => c.w ?? "1fr").join(" ");
  return (
    <div className="dttot" style={{ gridTemplateColumns: gridCols }}>
      {cols.map((c, i) => <div key={i}>{c.v}</div>)}
    </div>
  );
}
