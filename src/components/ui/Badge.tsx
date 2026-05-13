import styles from "./Badge.module.css";

type BadgeVariant = "green" | "amber" | "red" | "blue" | "muted" | "accent";
type TagVariant = "pending" | "live" | "built";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

interface StatusTagProps {
  children: React.ReactNode;
  variant: TagVariant;
}

const variantClass: Record<BadgeVariant, string> = {
  green: styles.green,
  amber: styles.amber,
  red: styles.red,
  blue: styles.blue,
  muted: styles.muted,
  accent: styles.accent,
};

const tagVariantClass: Record<TagVariant, string> = {
  pending: styles.tagPending,
  live: styles.tagLive,
  built: styles.tagBuilt,
};

export function Badge({ children, variant = "muted", className }: BadgeProps) {
  return (
    <span className={`${styles.badge} ${variantClass[variant]} ${className ?? ""}`}>
      {children}
    </span>
  );
}

export function StatusTag({ children, variant }: StatusTagProps) {
  return (
    <span className={`${styles.stag} ${tagVariantClass[variant]}`}>
      {children}
    </span>
  );
}
