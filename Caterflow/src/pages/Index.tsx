import DashboardLayout from "@/components/layout/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";
import UpcomingEvents from "@/components/dashboard/UpcomingEvents";
import AIInsights from "@/components/dashboard/AIInsights";
import EventWizard from "@/components/events/EventWizard";
import { Calendar, DollarSign, Users, UtensilsCrossed } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  const { user, companyName } = useAuth();
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showEventWizard, setShowEventWizard] = useState(false);
  
  useEffect(() => {
    const handleStorageChange = () => {
      const collapsed = localStorage.getItem('sidebarCollapsed') === 'true';
      setIsSidebarCollapsed(collapsed);
    };

    handleStorageChange();
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Add console log to check user ID
  // Log the user ID to the console whenever the user changes
  useEffect(() => {
    console.log('User ID:', user?.id);
  }, [user]);

  const { 
    data: dashboardStats = { totalRevenue: 0, activeClients: 0, upcomingEvents: 0, menuItems: 0 },
    isLoading,
    error
  } = useQuery({
    queryKey: ["dashboard-stats", user?.id], // Add user ID to queryKey
    queryFn: async () => {
      try {
        const today = new Date().toISOString();
        
        // Get total revenue from events
        const { data: events, error: eventsError } = await supabase
          .from("events")
          .select("total_amount")
          .eq('user_id', user?.id);
        
        if (eventsError) throw eventsError;

        // Get active clients count
        const { data: clients, error: clientsError } = await supabase
          .from("clients")
          .select("id")
          .eq('user_id', user?.id);
        
        if (clientsError) throw clientsError;

        // Get upcoming events count
        const { data: upcomingEvents, error: upcomingError } = await supabase
          .from("events")
          .select("id")
          .eq('user_id', user?.id)
          .gte("event_date", today);
        
        if (upcomingError) throw upcomingError;

        // Get menu items count
        const { data: recipes, error: recipesError } = await supabase
          .from("recipes")
          .select("id")
          .eq('user_id', user?.id);

        if (recipesError) throw recipesError;

        const totalRevenue = events?.reduce((sum, event) => sum + (Number(event.total_amount) || 0), 0) || 0;
        
        console.log('Query results:', {
          totalRevenue,
          activeClients: clients?.length || 0,
          upcomingEvents: upcomingEvents?.length || 0,
          menuItems: recipes?.length || 0,
        });

        return {
          totalRevenue,
          activeClients: clients?.length || 0,
          upcomingEvents: upcomingEvents?.length || 0,
          menuItems: recipes?.length || 0,
        };
      } catch (error) {
        console.error('Dashboard stats error:', error);
        throw error;
      }
    },
    enabled: !!user?.id, // Query will only run when user ID exists
    refetchOnWindowFocus: false, // Prevent unnecessary refetches
  });

  // Add loading and error states to UI
  if (isLoading) {
    return (
      <DashboardLayout>
        <div>Loading dashboard stats...</div>
      </DashboardLayout>
    );
  }

  if (error) {
    console.error('Dashboard query error:', error);
    return (
      <DashboardLayout>
        <div>Error loading dashboard stats: {error.message}</div>
      </DashboardLayout>
    );
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/signin');
  };

  return (
    <div>
      <header 
        className={cn(
          "fixed top-0 right-0 flex justify-between items-center p-4 bg-gray-800 text-white transition-all duration-300",
          isSidebarCollapsed ? "left-16" : "left-64"
        )}
      >
        <div className="flex items-center">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          {companyName && <span className="ml-2 text-gray-300">({companyName})</span>}
        </div>
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => setShowEventWizard(true)}
            className="bg-white text-gray-800 hover:bg-gray-100"
          >
            Create New Event
          </Button>
          <button
            onClick={handleLogout}
            className="text-white hover:underline flex items-center"
          >
            Sign Out
          </button>
        </div>
      </header>
      <div className="flex pt-16">
        <main className="flex-1">
          <DashboardLayout>
            {showEventWizard ? (
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">Create New Event</h2>
                  <Button 
                    variant="ghost" 
                    onClick={() => setShowEventWizard(false)}
                  >
                    Close
                  </Button>
                </div>
                <EventWizard />
              </div>
            ) : (
              <div className="space-y-8">
                <div>
                  <h1 className="text-3xl font-bold">Welcome back</h1>
                  <p className="text-gray-500 mt-2">Here's what's happening with your business today.</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <StatCard
                    title="Total Revenue"
                    value={`$${dashboardStats.totalRevenue.toLocaleString()}`}
                    icon={DollarSign}
                    description="From all events"
                    to="/analytics/billing"
                  />
                  <StatCard
                    title="Active Clients"
                    value={dashboardStats.activeClients}
                    icon={Users}
                    description="Total clients"
                    to="/analytics/clients"
                  />
                  <StatCard
                    title="Upcoming Events"
                    value={dashboardStats.upcomingEvents}
                    icon={Calendar}
                    description="Next 30 days"
                    to="/analytics/events"
                  />
                  <StatCard
                    title="Menu Items"
                    value={dashboardStats.menuItems}
                    icon={UtensilsCrossed}
                    description="Available items"
                    to="/analytics/menus"
                  />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <UpcomingEvents />
                  <AIInsights />
                </div>
              </div>
            )}
          </DashboardLayout>
        </main>
      </div>
    </div>
  );
};

export default Index;
