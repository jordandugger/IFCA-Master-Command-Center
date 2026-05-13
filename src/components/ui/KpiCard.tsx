import styles from "./KpiCard.module.css";

type KpiVariant = "default" | "highlight" | "warn" | "good";

interface KpiCardProps {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  variant?: KpiVariant;
  valueColor?: string;
}

const variantClass: Record<KpiVariant, string> = {
  default: "",
  highlight: styles.highlight,
  warn: styles.warn,
  good: styles.good,
};

export function KpiCard({ label, value, sub, variant = "default", valueColor }: KpiCardProps) {
  return (
    <div className={`${styles.card} ${variantClass[variant]}`}>
      <div className={styles.label}>{label}</div>
      <div className={styles.value} style={valueColor ? { color: valueColor } : undefined}>
        {value}
      </div>
      {sub && <div className={styles.sub}>{sub}</div>}
    </div>
  );
}
