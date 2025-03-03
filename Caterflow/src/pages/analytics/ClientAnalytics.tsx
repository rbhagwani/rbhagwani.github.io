
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const chartConfig = {
  clients: {
    label: "Clients",
    theme: {
      light: "#3b82f6",
      dark: "#60a5fa",
    },
  },
};

const ClientAnalytics = () => {
  const { data: clientStats = [], isLoading } = useQuery({
    queryKey: ["client-analytics"],
    queryFn: async () => {
      const { data: clients, error } = await supabase
        .from("clients")
        .select("*");

      if (error) throw error;

      // Calculate company distribution
      const companyDistribution = clients.reduce((acc: any, client) => {
        acc[client.company] = (acc[client.company] || 0) + 1;
        return acc;
      }, {});

      return Object.entries(companyDistribution).map(([name, value]) => ({
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
          <h1 className="text-3xl font-bold">Client Analytics</h1>
          <p className="text-gray-500 mt-2">Analyze your client data and trends</p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Client Distribution by Company</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ChartContainer config={chartConfig}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={clientStats}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="var(--color-clients)" />
                    </BarChart>
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

export default ClientAnalytics;
