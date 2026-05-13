import { KpiCard } from "@/components/ui/KpiCard";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Badge, StatusTag } from "@/components/ui/Badge";

const CLOSERS = [
  { name: "Janie (Taeler)", crBadge: <Badge variant="green">~40%</Badge> },
  { name: "Samantha", crBadge: "—" },
  { name: "Jason", crBadge: "—" },
];

const SETTERS = [
  { name: "Pam", source: "Taeler IG DMs", statusBadge: <Badge variant="green">Active</Badge> },
  { name: "Andrea", source: "IFCA IG / TBD", statusBadge: <Badge variant="amber">Placement TBD</Badge> },
  { name: "Inbound Aloware", source: "VSL Leads (Paid)", statusBadge: <Badge variant="blue">Paid</Badge> },
];

export function SalesTab() {
  return (
    <div>
      <div className="kpi-grid">
        <KpiCard
          label="Sets Booked MTD"
          value={<span style={{ color: "var(--amber)" }}>—</span>}
          sub="Target: 115–130/mo"
        />
        <KpiCard label="Live Calls MTD" value="—" sub="Approved → showed" />
        <KpiCard
          label="Close Rate MTD"
          value={<span style={{ color: "var(--red)" }}>—</span>}
          sub="Target: 25% · Apr: 16%"
          variant="warn"
        />
        <KpiCard
          label="Closed Deals MTD"
          value={<span style={{ color: "var(--green)" }}>—</span>}
          sub="@ $12,500 ACV"
          variant="good"
        />
        <KpiCard
          label="FE Revenue Generated"
          value={<span style={{ color: "var(--gold)" }}>—</span>}
          sub="From PIF Perfect"
          variant="highlight"
        />
      </div>

      <SectionTitle>
        Closer Performance{" "}
        <StatusTag variant="pending">PIF API Pending</StatusTag>
      </SectionTitle>
      <div className="dt">
        <div className="dth" style={{ gridTemplateColumns: "150px repeat(7, 1fr)" }}>
          <div>Closer</div>
          <div>Slots</div>
          <div>Appr. Calls</div>
          <div>Show %</div>
          <div>Live</div>
          <div>Closes</div>
          <div>CR%</div>
          <div>Revenue</div>
        </div>
        {CLOSERS.map((c) => (
          <div key={c.name} className="dtr" style={{ gridTemplateColumns: "150px repeat(7, 1fr)" }}>
            <div className="dtc nm">{c.name}</div>
            <div className="dtc mono">—</div>
            <div className="dtc mono">—</div>
            <div className="dtc mono">—</div>
            <div className="dtc mono">—</div>
            <div className="dtc mono">—</div>
            <div className="dtc mono">{c.crBadge}</div>
            <div className="dtc mono">—</div>
          </div>
        ))}
        <div className="dttot" style={{ gridTemplateColumns: "150px repeat(7, 1fr)" }}>
          <div>TOTALS</div>
          <div>—</div><div>—</div><div>—</div><div>—</div><div>—</div><div>—</div><div>—</div>
        </div>
      </div>

      <SectionTitle>
        Setter Performance{" "}
        <StatusTag variant="pending">PIF API Pending</StatusTag>
      </SectionTitle>
      <div className="dt">
        <div className="dth" style={{ gridTemplateColumns: "150px repeat(4, 1fr) 120px" }}>
          <div>Setter</div>
          <div>Dials</div>
          <div>Sets</div>
          <div>Set Rate</div>
          <div>Lead Source</div>
          <div>Status</div>
        </div>
        {SETTERS.map((s) => (
          <div key={s.name} className="dtr" style={{ gridTemplateColumns: "150px repeat(4, 1fr) 120px" }}>
            <div className="dtc nm">{s.name}</div>
            <div className="dtc mono">—</div>
            <div className="dtc mono">—</div>
            <div className="dtc mono">—</div>
            <div className="dtc">{s.source}</div>
            <div className="dtc">{s.statusBadge}</div>
          </div>
        ))}
        <div className="dttot" style={{ gridTemplateColumns: "150px repeat(4, 1fr) 120px" }}>
          <div>TOTALS</div>
          <div>—</div><div>—</div><div>—</div><div>—</div><div>—</div>
        </div>
      </div>
    </div>
  );
}
