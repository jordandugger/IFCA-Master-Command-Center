import styles from "./SectionTitle.module.css";

interface SectionTitleProps {
  children: React.ReactNode;
}

export function SectionTitle({ children }: SectionTitleProps) {
  return (
    <div className={styles.title}>
      <div className={styles.dot} />
      {children}
    </div>
  );
}
