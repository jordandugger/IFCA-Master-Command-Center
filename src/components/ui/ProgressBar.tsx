import styles from "./ProgressBar.module.css";

type BarColor = "accent" | "green" | "amber" | "red" | "gold";

interface ProgressBarProps {
  label?: string;
  rightLabel?: string;
  percent: number;
  color?: BarColor;
  height?: number;
}

const colorClass: Record<BarColor, string> = {
  accent: styles.colorAccent,
  green: styles.colorGreen,
  amber: styles.colorAmber,
  red: styles.colorRed,
  gold: styles.colorGold,
};

export function ProgressBar({ label, rightLabel, percent, color = "accent", height = 6 }: ProgressBarProps) {
  return (
    <div className={styles.wrap}>
      {(label || rightLabel) && (
        <div className={styles.labels}>
          {label && <span>{label}</span>}
          {rightLabel && <span>{rightLabel}</span>}
        </div>
      )}
      <div className={styles.track} style={{ height }}>
        <div
          className={`${styles.fill} ${colorClass[color]}`}
          style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
        />
      </div>
    </div>
  );
}
