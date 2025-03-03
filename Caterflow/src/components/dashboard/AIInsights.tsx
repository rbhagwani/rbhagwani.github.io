
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, BarChart, Calendar, TrendingUp, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const AIInsights = () => {
  // First query to fetch the data we want to analyze
  const { data: analyticsData, isLoading: isLoadingData } = useQuery({
    queryKey: ["analytics-data"],
    queryFn: async () => {
      // Fetch events data
      const { data: events, error: eventsError } = await supabase
        .from("events")
        .select("event_date, guest_count, total_amount")
        .order("event_date", { ascending: false })
        .limit(20);
      
      if (eventsError) console.error("Error fetching events:", eventsError);
      
      // Fetch clients data
      const { data: clients, error: clientsError } = await supabase
        .from("clients")
        .select("created_at, company")
        .order("created_at", { ascending: false })
        .limit(20);
      
      if (clientsError) console.error("Error fetching clients:", clientsError);
      
      // Fetch recipes (as menu items) data
      const { data: menuItems, error: menuItemsError } = await supabase
        .from("recipes")
        .select("name, cost, category")
        .order("cost", { ascending: false })
        .limit(20);
      
      if (menuItemsError) console.error("Error fetching menu items:", menuItemsError);
      
      return {
        events: events || [],
        clients: clients || [],
        menuItems: menuItems || []
      };
    }
  });

  // Second query to send the data to Gemini and get insights
  const { data, isLoading, error } = useQuery({
    queryKey: ["ai-insights", analyticsData],
    queryFn: async () => {
      if (!analyticsData) return null;
      
      const { data, error } = await supabase.functions.invoke("analyze-trends", {
        body: { 
          model: "gemini-2.0-flash",
          analyticsData: analyticsData 
        }
      });
      
      if (error) throw error;
      return data;
    },
    enabled: !!analyticsData, // Only run this query if we have data from the first query
    refetchInterval: 1000 * 60 * 60, // Refresh every hour
  });

  if (isLoadingData || isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            AI Insights Loading...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="text-red-500 p-4">
          Error loading insights. Please try again later.
        </CardContent>
      </Card>
    );
  }

  // Split analysis into sections based on newlines
  const sections = data?.analysis.split('\n').filter(Boolean) || [];

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            AI-Powered Insights
          </CardTitle>
          <Badge variant="outline" className="bg-gradient-to-r from-blue-500 to-teal-500 text-white border-0">
            Gemini 2.0 Flash
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-4">
            <div className="flex items-start gap-2">
              <Calendar className="h-5 w-5 mt-1 text-primary" />
              <div>
                <h3 className="font-semibold">Seasonal Trends</h3>
                <p className="text-sm text-gray-600">
                  {sections[0] || 'No seasonal trends available'}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <BarChart className="h-5 w-5 mt-1 text-primary" />
              <div>
                <h3 className="font-semibold">Popular Items</h3>
                <p className="text-sm text-gray-600">
                  {sections[1] || 'No popularity data available'}
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-start gap-2">
              <TrendingUp className="h-5 w-5 mt-1 text-primary" />
              <div>
                <h3 className="font-semibold">Recommendations</h3>
                <p className="text-sm text-gray-600">
                  {sections[2] || 'No recommendations available'}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Lightbulb className="h-5 w-5 mt-1 text-primary" />
              <div>
                <h3 className="font-semibold">Demand Forecast</h3>
                <p className="text-sm text-gray-600">
                  {sections[3] || 'No forecast available'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIInsights;
