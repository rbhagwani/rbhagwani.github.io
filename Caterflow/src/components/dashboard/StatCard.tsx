import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  className?: string;
  to?: string;
}

const StatCard = ({ title, value, icon: Icon, description, className, to }: StatCardProps) => {
  const content = (
    <Card className={cn(
      "overflow-hidden transition-all duration-200",
      to && "cursor-pointer hover:shadow-lg hover:-translate-y-1",
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        <div className="p-2 bg-primary/10 rounded-lg">
          <Icon className="text-primary h-5 w-5" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );

  if (to) {
    return (
      <Link to={to} className={cn("block", className)}>
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
};

export default StatCard;