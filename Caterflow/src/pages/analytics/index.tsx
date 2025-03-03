
import { useState } from "react";
import { Card } from "@/components/ui/card";
import ReportSelector from "@/components/analytics/ReportSelector";
import ClientsReport from "@/components/analytics/reports/ClientsReport";
import EventsReport from "@/components/analytics/reports/EventsReport";
import MenusReport from "@/components/analytics/reports/MenusReport";
import BillingReport from "@/components/analytics/reports/BillingReport";
import DashboardLayout from "@/components/layout/DashboardLayout";

const Analytics = () => {
  const [activeReport, setActiveReport] = useState("clients");

  const renderReport = () => {
    switch (activeReport) {
      case "clients":
        return <ClientsReport />;
      case "events":
        return <EventsReport />;
      case "menus":
        return <MenusReport />;
      case "billing":
        return <BillingReport />;
      default:
        return <ClientsReport />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-gray-500 mt-2">Track your business performance</p>
        </div>

        <ReportSelector 
          activeReport={activeReport}
          onReportChange={setActiveReport}
        />

        <div className="mt-6">
          {renderReport()}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
