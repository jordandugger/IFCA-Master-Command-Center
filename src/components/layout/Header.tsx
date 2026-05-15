"use client";

import styles from "./Header.module.css";

export type TabId = "overview" | "projections" | "recovery" | "ads" | "sales" | "backend";

const TABS: { id: TabId; label: string }[] = [
  { id: "overview",    label: "Overview" },
  { id: "projections", label: "Projections" },
  { id: "recovery",    label: "Recovery Playbook" },
  { id: "ads",         label: "Ads" },
  { id: "sales",       label: "Sales" },
  { id: "backend",     label: "Back-End" },
];

interface HeaderProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export function Header({ activeTab, onTabChange }: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        IFCA <span>×</span> FCA{" "}
        <span className={styles.logoSub}>Command Center</span>
      </div>

      <nav className={styles.nav}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`${styles.navBtn} ${activeTab === tab.id ? styles.navBtnActive : ""}`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div className={styles.right}>
        <div className={styles.statusIndicator}>
          <div className={styles.statusDot} />
          <span className={styles.statusLabel}>Live · 4 sources</span>
        </div>
        <button
          className={styles.ctaBtn}
          onClick={() => onTabChange("recovery")}
        >
          Recovery Playbook →
        </button>
      </div>
    </header>
  );
}
