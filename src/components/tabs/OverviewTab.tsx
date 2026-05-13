import { KpiCard } from "@/components/ui/KpiCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Badge, StatusTag } from "@/components/ui/Badge";
import styles from "./OverviewTab.module.css";

export function OverviewTab() {
  return (
    <div>
      {/* KPI Row */}
      <div className="kpi-grid">
        <KpiCard
          label="Gross Revenue — May Proj"
          value="$315,475"
          sub={<span style={{ color: "var(--amber)" }}>$234K gap to $550K lookback floor</span>}
          variant="highlight"
          valueColor="var(--gold)"
        />
        <KpiCard
          label="Close Rate (MTD)"
          value={<span style={{ color: "var(--red)" }}>—</span>}
          sub="Target 25% · Apr: 16% · PIF feed pending"
          variant="warn"
        />
        <KpiCard
          label="Setter Sets (MTD)"
          value={<span style={{ color: "var(--amber)" }}>—</span>}
          sub="Target 115–130 · Apr: 48 · PIF feed pending"
          variant="warn"
        />
        <KpiCard
          label="CPL (MTD)"
          value={<span style={{ color: "var(--red)" }}>—</span>}
          sub="Target $38–50 · Apr: $79.98 · Meta MCP pending"
        />
        <KpiCard
          label="BE Upsells (MTD)"
          value="—"
          sub="Legacy + 7FCEO + Cont · Sheets pending"
        />
      </div>

      {/* Mid row */}
      <div className="two-col">
        {/* Revenue Equilibrium */}
        <div className="pbox">
          <SectionTitle>Revenue Equilibrium</SectionTitle>
          <div className={styles.equilGrid}>
            <div>
              <div className={styles.miniLabel}>Closes Needed ($550K)</div>
              <div className={styles.bigNum} style={{ color: "var(--accent)" }}>44</div>
              <div className={styles.miniSub}>@ $12,500 ACV</div>
            </div>
            <div>
              <div className={styles.miniLabel}>Current Pace</div>
              <div className={styles.bigNum}>—</div>
              <div className={styles.miniSub}>Awaiting PIF feed</div>
            </div>
            <div>
              <div className={styles.miniLabel}>BE Rev Needed</div>
              <div className={styles.medNum}>~$100K</div>
            </div>
            <div>
              <div className={styles.miniLabel}>MRR (Stable)</div>
              <div className={styles.medNum} style={{ color: "var(--green)" }}>$88K</div>
            </div>
          </div>
          <ProgressBar label="May Proj vs $550K" rightLabel="57.4%" percent={57.4} color="gold" />
        </div>

        {/* 3 Revenue Levers */}
        <div className="pbox">
          <SectionTitle>3 Revenue Levers</SectionTitle>
          <div className={styles.leverItem}>
            <div className={styles.leverHeader}>
              <span className={styles.leverName}>1. Close Rate</span>
              <Badge variant="red">Apr: 16% · Target: 25%</Badge>
            </div>
            <ProgressBar percent={64} color="red" />
            <div className={styles.leverNote}>Janie target 40% · closes gap by ~$112K if hit</div>
          </div>
          <div className={styles.leverItem}>
            <div className={styles.leverHeader}>
              <span className={styles.leverName}>2. Setter Sets/Mo</span>
              <Badge variant="amber">Apr: 48 · Target: 115–130</Badge>
            </div>
            <ProgressBar percent={42} color="amber" />
            <div className={styles.leverNote}>Pam + Andrea + inbound Aloware · +67 sets needed</div>
          </div>
          <div className={styles.leverItem}>
            <div className={styles.leverHeader}>
              <span className={styles.leverName}>3. BE Upsell Pipeline</span>
              <Badge variant="muted">Cory owns · feed pending</Badge>
            </div>
            <ProgressBar percent={0} color="accent" />
            <div className={styles.leverNote}>Legacy + 7FCEO + Cont · SC referral pipeline</div>
          </div>
        </div>
      </div>

      {/* Pillar Status */}
      <SectionTitle>Data Pillar Status</SectionTitle>
      <div className="four-col">
        <PillarCard
          icon="📣"
          title="Ads Performance"
          source="Hyros + Meta MCP"
          status="pending"
          statusLabel="Partial"
          note="Meta MCP: Craig to connect · Hyros: API key needed"
          noteColor="var(--amber)"
        />
        <PillarCard
          icon="📞"
          title="Sales (FE)"
          source="PIF Perfect API"
          status="pending"
          statusLabel="Pending"
          note="Get PIF API key → build Apps Script sync"
          noteColor="var(--amber)"
        />
        <PillarCard
          icon="📈"
          title="Back-End Upsells"
          source="Google Sheets (Kevin)"
          status="pending"
          statusLabel="Pending"
          note="Kevin migrates tracker to live Google Sheet"
          noteColor="var(--amber)"
        />
        <PillarCard
          icon="🎯"
          title="Projections"
          source="Calculated layer"
          status="built"
          statusLabel="Built"
          note="Calculator live · connect live feeds next"
          noteColor="var(--green)"
        />
      </div>
    </div>
  );
}

interface PillarCardProps {
  icon: string;
  title: string;
  source: string;
  status: "pending" | "live" | "built";
  statusLabel: string;
  note: string;
  noteColor: string;
}

function PillarCard({ icon, title, source, status, statusLabel, note, noteColor }: PillarCardProps) {
  return (
    <div className={styles.pillarCard}>
      <div className={styles.pillarTop}>
        <span className={styles.pillarIcon}>{icon}</span>
        <StatusTag variant={status}>{statusLabel}</StatusTag>
      </div>
      <div className={styles.pillarTitle}>{title}</div>
      <div className={styles.pillarSource}>{source}</div>
      <div className={styles.pillarNote} style={{ color: noteColor }}>{note}</div>
    </div>
  );
}
