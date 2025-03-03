
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const chartConfig = {
  events: {
    label: "Events",
    theme: {
      light: "#3b82f6",
      dark: "#60a5fa",
    },
  },
};

const EventAnalytics = () => {
  const { data: eventStats = [], isLoading } = useQuery({
    queryKey: ["event-analytics"],
    queryFn: async () => {
      const { data: events, error } = await supabase
        .from("events")
        .select("*")
        .order('event_date', { ascending: true });

      if (error) throw error;

      // Group events by month
      const monthlyEvents = events.reduce((acc: any, event) => {
        const month = new Date(event.event_date).toLocaleString('default', { month: 'long' });
        acc[month] = (acc[month] || 0) + 1;
        return acc;
      }, {});

      return Object.entries(monthlyEvents).map(([name, value]) => ({
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
          <h1 className="text-3xl font-bold">Event Analytics</h1>
          <p className="text-gray-500 mt-2">Track your event performance and trends</p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Events by Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ChartContainer config={chartConfig}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={eventStats}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="value" stroke="var(--color-events)" />
                    </LineChart>
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

export default EventAnalytics;
