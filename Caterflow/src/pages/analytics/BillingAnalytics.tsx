
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const chartConfig = {
  revenue: {
    label: "Revenue",
    theme: {
      light: "#3b82f6",
      dark: "#60a5fa",
    },
  },
};

const BillingAnalytics = () => {
  const { data: billingStats = [], isLoading } = useQuery({
    queryKey: ["billing-analytics"],
    queryFn: async () => {
      const { data: events, error } = await supabase
        .from("events")
        .select("*")
        .order('event_date', { ascending: true });

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
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Billing Analytics</h1>
          <p className="text-gray-500 mt-2">Track your revenue and financial metrics</p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ChartContainer config={chartConfig}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={billingStats}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="value" stroke="var(--color-revenue)" fill="var(--color-revenue)" fillOpacity={0.2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BillingAnalytics;
