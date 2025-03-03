
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const BillingReport = () => {
  const { data: billingStats = [], isLoading } = useQuery({
    queryKey: ["billing-analytics"],
    queryFn: async () => {
      const { data: events, error } = await supabase
        .from("events")
        .select("event_date, total_amount");

      if (error) throw error;

      // Group revenue by month
      const monthlyRevenue = events.reduce((acc: any, event) => {
        const month = new Date(event.event_date).toLocaleString('default', { month: 'long' });
        acc[month] = (acc[month] || 0) + Number(event.total_amount);
        return acc;
      }, {});

      return Object.entries(monthlyRevenue).map(([name, value]) => ({
        name,
        value,
      }));
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Revenue</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={billingStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default BillingReport;
