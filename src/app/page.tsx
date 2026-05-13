"use client";

import { useState } from "react";
import { Header, type TabId } from "@/components/layout/Header";
import { LookbackBar } from "@/components/layout/LookbackBar";
import { OverviewTab } from "@/components/tabs/OverviewTab";
import { AdsTab } from "@/components/tabs/AdsTab";
import { SalesTab } from "@/components/tabs/SalesTab";
import { BackEndTab } from "@/components/tabs/BackEndTab";
import { ProjectionsTab } from "@/components/tabs/ProjectionsTab";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  const renderTab = () => {
    switch (activeTab) {
      case "overview":    return <OverviewTab />;
      case "ads":         return <AdsTab />;
      case "sales":       return <SalesTab />;
      case "backend":     return <BackEndTab />;
      case "projections": return <ProjectionsTab />;
    }
  };

  return (
    <>
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      <LookbackBar />
      <main className="main-content">{renderTab()}</main>
    </>
  );
}
