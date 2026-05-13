import { KpiCard } from "@/components/ui/KpiCard";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Placeholder } from "@/components/ui/Placeholder";
import { StatusTag } from "@/components/ui/Badge";

export function AdsTab() {
  return (
    <div>
      <div className="kpi-grid">
        <KpiCard label="MTD Ad Spend" value="—" sub="Budget: $88K/mo · IFCA act: 623048835231084" />
        <KpiCard
          label="Cost Per Lead (CPL)"
          value={<span style={{ color: "var(--red)" }}>—</span>}
          sub="Target: $38–50 · Apr: $79.98"
          variant="warn"
        />
        <KpiCard label="Cost / Booked Call" value="—" sub="Target: $350 · Apr: $401" />
        <KpiCard label="Total Leads MTD" value="—" sub="Hyros primary attribution" />
        <KpiCard label="ROAS (Collected)" value="—" sub="Hyros scientific report" />
      </div>

      <div className="two-col">
        <div>
          <SectionTitle>
            Hyros Attribution{" "}
            <StatusTag variant="pending">API Key Needed</StatusTag>
          </SectionTitle>
          <Placeholder
            icon="📊"
            title="Hyros Scientific Reporting"
            text="Primary attribution source. Generate API key in Hyros → Account Settings → API. Configure nightly CSV email export via Scientific Reporting, or connect via Zapier automation."
            codeHint="Step 1: Hyros account → Settings → API → Generate key"
          />
        </div>
        <div>
          <SectionTitle>
            Meta Ads MCP{" "}
            <StatusTag variant="pending">Craig to Connect</StatusTag>
          </SectionTitle>
          <Placeholder
            icon="📱"
            title="Meta Official MCP (April 29, 2026)"
            text="Craig opens Claude Desktop → Settings → Developer → Edit Config. Add meta-ads server URL. Authenticate with Business OAuth. ~7 min total."
            codeHint="docs/integration-setup-guide.html for full steps"
          />
        </div>
      </div>

      <SectionTitle>Funnel Economics</SectionTitle>
      <div className="dt">
        <div className="dth" style={{ gridTemplateColumns: "180px repeat(5, 1fr)" }}>
          <div>Campaign</div>
          <div>Spend</div>
          <div>Leads</div>
          <div>CPL</div>
          <div>Booked Calls</div>
          <div>CPA</div>
        </div>
        {[
          "VSL — Client Engine",
          "TOT — Organic",
          "Masterclass Jun 11",
        ].map((campaign) => (
          <div key={campaign} className="dtr" style={{ gridTemplateColumns: "180px repeat(5, 1fr)" }}>
            <div className="dtc nm">{campaign}</div>
            <div className="dtc mono">—</div>
            <div className="dtc mono">—</div>
            <div className="dtc mono">—</div>
            <div className="dtc mono">—</div>
            <div className="dtc mono">—</div>
          </div>
        ))}
      </div>
    </div>
  );
}
