import styles from "./LookbackBar.module.css";

export function LookbackBar() {
  return (
    <div className={styles.bar}>
      <div className={styles.item}>
        <div className={styles.label}>🎯 Lookback Target</div>
        <div className={styles.value} style={{ color: "var(--gold)" }}>$550,000</div>
        <div className={styles.note}>2 consecutive months</div>
      </div>
      <div className={styles.divider} />
      <div className={styles.item}>
        <div className={styles.label}>May Proj Revenue</div>
        <div className={styles.value} style={{ color: "var(--amber)" }}>$315,475</div>
      </div>
      <div className={styles.item}>
        <div className={styles.label}>Gap to $550K</div>
        <div className={styles.value} style={{ color: "var(--gold)" }}>$234,525</div>
      </div>
      <div className={styles.divider} />
      <div className={styles.item}>
        <div className={styles.label}>Total MRR</div>
        <div className={styles.value}>$88,000</div>
      </div>
      <div className={styles.item}>
        <div className={styles.label}>Close Rate MTD</div>
        <div className={styles.value} style={{ color: "var(--red)" }}>—</div>
        <div className={styles.note}>Target: 25%</div>
      </div>
      <div className={styles.item}>
        <div className={styles.label}>Sets Booked MTD</div>
        <div className={styles.value} style={{ color: "var(--amber)" }}>—</div>
        <div className={styles.note}>Target: 115–130</div>
      </div>
      <div className={styles.item}>
        <div className={styles.label}>CPL MTD</div>
        <div className={styles.value} style={{ color: "var(--red)" }}>—</div>
        <div className={styles.note}>Target: $38–50</div>
      </div>
      <div className={styles.divider} />
      <div className={styles.item}>
        <div className={styles.label}>Apr Actual</div>
        <div className={styles.value} style={{ color: "var(--muted)" }}>$396,938</div>
      </div>
      <div className={styles.item}>
        <div className={styles.label}>3-Mo Avg</div>
        <div className={styles.value} style={{ color: "var(--muted)" }}>$418,255</div>
      </div>
    </div>
  );
}
