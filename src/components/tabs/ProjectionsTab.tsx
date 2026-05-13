import { SectionTitle } from "@/components/ui/SectionTitle";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Badge } from "@/components/ui/Badge";
import styles from "./ProjectionsTab.module.css";

const HISTORY = [
  { month: "Jan 2026", gross: "$452,387", feCash: "$134,900", beCash: "$65,000", mrr: "—", closes: "24", cr: null, cpl: null },
  { month: "Feb 2026", gross: "$411,586", feCash: "$131,758", beCash: "$55,333", mrr: "—", closes: "23", cr: null, cpl: null },
  { month: "Mar 2026", gross: "$446,242", feCash: "$140,275", beCash: "$64,000", mrr: "$92,822", closes: "25", cr: { label: "21.9%", variant: "amber" as const }, cpl: { label: "$66.82", variant: "amber" as const } },
  { month: "Apr 2026", gross: "$396,938", feCash: "$86,765", beCash: "$23,333", mrr: "$93,186", closes: "16", cr: { label: "16.0%", variant: "red" as const }, cpl: { label: "$79.98", variant: "red" as const }, highlight: true },
];

export function ProjectionsTab() {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <SectionTitle>Monthly Projections — May 2026</SectionTitle>
      </div>

      {/* Summary cards */}
      <div className="three-col">
        <div className="pbox">
          <div className={styles.miniLabel}>Total MRR (Proj)</div>
          <div className={styles.projNum}>$88,000</div>
          <ProgressBar label="vs $93K Apr actual" rightLabel="94.6%" percent={94.6} color="amber" />
        </div>
        <div className="pbox">
          <div className={styles.miniLabel}>AR Collections (Proj)</div>
          <div className={styles.projNum}>$202,275</div>
          <div className={styles.projSub}>LK $1.8K + FE AR $102K + BE AR $98K</div>
        </div>
        <div className="pbox">
          <div className={styles.miniLabel}>Upfront Cash (FE+BE)</div>
          <div className={styles.projNum}>$25,200</div>
          <div className={styles.projSub}>FE: $0 · BE: $25.2K</div>
        </div>
      </div>

      {/* Gold target banner */}
      <div className={styles.targetBanner}>
        <div>
          <div className={styles.targetLabel}>Projected Gross Revenue — May 2026</div>
          <div className={styles.targetValue}>$315,475</div>
          <div className={styles.targetSub}>
            Gap: <span style={{ color: "var(--gold)", fontWeight: 700 }}>$234,525</span>
            {" "}· Updates when live feeds connected
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className={styles.miniLabel}>Lookback Floor</div>
          <div className={styles.floorValue}>$550,000</div>
        </div>
      </div>
      <ProgressBar label="May Proj vs $550K" rightLabel="57.4%" percent={57.4} color="gold" height={10} />

      {/* Historical table */}
      <SectionTitle>Historical Reference</SectionTitle>
      <div className="dt" style={{ marginTop: 16 }}>
        <div className="dth" style={{ gridTemplateColumns: "120px repeat(7, 1fr)" }}>
          <div>Month</div>
          <div>Gross Rev</div>
          <div>FE Cash</div>
          <div>BE Cash</div>
          <div>MRR</div>
          <div>Closes</div>
          <div>CR%</div>
          <div>CPL</div>
        </div>
        {HISTORY.map((r) => (
          <div
            key={r.month}
            className="dtr"
            style={{ gridTemplateColumns: "120px repeat(7, 1fr)" }}
          >
            <div className="dtc nm" style={r.highlight ? { color: "var(--accent)" } : undefined}>
              {r.month}
            </div>
            <div className="dtc mono">{r.gross}</div>
            <div className="dtc mono">{r.feCash}</div>
            <div className="dtc mono">{r.beCash}</div>
            <div className="dtc mono">{r.mrr}</div>
            <div className="dtc mono">{r.closes}</div>
            <div className="dtc mono">
              {r.cr ? <Badge variant={r.cr.variant}>{r.cr.label}</Badge> : "—"}
            </div>
            <div className="dtc mono">
              {r.cpl ? <Badge variant={r.cpl.variant}>{r.cpl.label}</Badge> : "—"}
            </div>
          </div>
        ))}
        <div className="dttot" style={{ gridTemplateColumns: "120px repeat(7, 1fr)" }}>
          <div>3-Mo Avg</div>
          <div>$418,255</div>
          <div>$120,266</div>
          <div>$47,555</div>
          <div>$93,004</div>
          <div>21</div>
          <div>19.0%</div>
          <div>$73.40</div>
        </div>
      </div>
    </div>
  );
}
