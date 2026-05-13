import { KpiCard } from "@/components/ui/KpiCard";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { StatusTag } from "@/components/ui/Badge";

const SC_ROWS = [
  "Kevin Hamidi (Head SC)",
  "SC #2",
  "SC #3",
];

const MRR_ROWS = [
  { stream: "Continuity", mayProj: "$21,000", aprActual: "$20,067", notes: "May proj" },
  { stream: "Trainerize", mayProj: "$25,000", aprActual: "$24,863", notes: "May proj" },
  { stream: "GHL SaaS", mayProj: "$27,000", aprActual: "$33,257", notes: "$97/mo · 450+ coaches" },
  { stream: "7FCEO Memberships", mayProj: "$15,000", aprActual: "$15,000", notes: "Stable" },
];

export function BackEndTab() {
  return (
    <div>
      <div className="kpi-grid">
        <KpiCard label="Legacy Closes MTD" value="—" sub="Avg $22–25K · Path to 4% (Jul 1)" />
        <KpiCard label="7-Figure CEO Closes" value="—" sub="Avg $30–35K" />
        <KpiCard label="Continuation Closes" value="—" sub="Avg $6K" />
        <KpiCard label="BE Revenue Generated" value="—" sub="Apr: $57K" />
        <KpiCard
          label="BE Cash Collected"
          value={<span style={{ color: "var(--gold)" }}>—</span>}
          sub="Apr: $23,333"
          variant="highlight"
        />
      </div>

      <SectionTitle>
        SC Referral Pipeline{" "}
        <StatusTag variant="pending">Kevin to migrate tracker</StatusTag>
      </SectionTitle>
      <div className="dt">
        <div className="dth" style={{ gridTemplateColumns: "160px repeat(5, 1fr)" }}>
          <div>Success Coach</div>
          <div>Active Clients</div>
          <div>Referrals Out</div>
          <div>Pitched</div>
          <div>Closed</div>
          <div>Revenue</div>
        </div>
        {SC_ROWS.map((name) => (
          <div key={name} className="dtr" style={{ gridTemplateColumns: "160px repeat(5, 1fr)" }}>
            <div className="dtc nm">{name}</div>
            <div className="dtc mono">—</div>
            <div className="dtc mono">—</div>
            <div className="dtc mono">—</div>
            <div className="dtc mono">—</div>
            <div className="dtc mono">—</div>
          </div>
        ))}
        <div className="dttot" style={{ gridTemplateColumns: "160px repeat(5, 1fr)" }}>
          <div>TOTALS</div>
          <div>—</div><div>—</div><div>—</div><div>—</div><div>—</div>
        </div>
      </div>

      <SectionTitle>MRR Breakdown</SectionTitle>
      <div className="dt">
        <div className="dth" style={{ gridTemplateColumns: "200px 1fr 1fr 1fr" }}>
          <div>Stream</div>
          <div>Monthly Proj</div>
          <div>Apr Actual</div>
          <div>Notes</div>
        </div>
        {MRR_ROWS.map((r) => (
          <div key={r.stream} className="dtr" style={{ gridTemplateColumns: "200px 1fr 1fr 1fr" }}>
            <div className="dtc nm">{r.stream}</div>
            <div className="dtc mono">{r.mayProj}</div>
            <div className="dtc mono">{r.aprActual}</div>
            <div className="dtc" style={{ fontSize: 11, color: "var(--muted)" }}>{r.notes}</div>
          </div>
        ))}
        <div className="dttot" style={{ gridTemplateColumns: "200px 1fr 1fr 1fr" }}>
          <div>TOTAL MRR</div>
          <div>$88,000</div>
          <div>$93,187</div>
          <div>—</div>
        </div>
      </div>
    </div>
  );
}
