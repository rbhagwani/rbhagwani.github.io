
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ReportSelectorProps = {
  activeReport: string;
  onReportChange: (report: string) => void;
};

const ReportSelector = ({ activeReport, onReportChange }: ReportSelectorProps) => {
  const reports = [
    { id: 'clients', name: 'Clients' },
    { id: 'events', name: 'Events' },
    { id: 'menus', name: 'Menus' },
    { id: 'billing', name: 'Billing' },
  ];

  return (
    <div className="flex gap-2">
      {reports.map((report) => (
        <Button
          key={report.id}
          variant="outline"
          className={cn(
            "min-w-[100px]",
            activeReport === report.id && "bg-primary text-primary-foreground"
          )}
          onClick={() => onReportChange(report.id)}
        >
          {report.name}
        </Button>
      ))}
    </div>
  );
};

export default ReportSelector;
