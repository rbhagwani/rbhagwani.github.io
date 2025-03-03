
import { AuthProvider } from '@/contexts/AuthContext';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import React, { FC, ReactNode, useEffect, useRef, useState } from 'react';
import Index from "./pages/Index";
import Staff from "./pages/Staff";
import Clients from "./pages/Clients";
import Events from "./pages/Events";
import Menus from "./pages/Menus";
import Recipes from "./pages/Recipes";
import EventWizard from "./components/events/EventWizard";
import Signin from "./pages/AdminLogin";
import ClientReport from "./pages/analytics/ClientAnalytics";
import EventReport from "./pages/analytics/EventAnalytics";
import MenuReport from "./pages/analytics/MenuAnalytics";
import BillingReport from "./pages/analytics/BillingAnalytics";
import Settings from "./pages/Settings";
import Report from "./components/analytics/ReportSelector";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Route */}
            <Route path="/signin" element={<Signin />} />            
            <Route path="/" element={<Index />} />
            <Route path="/staff" element={<Staff />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/create" element={<EventWizard/>} />
            <Route path="/menus" element={<Menus />} />
            <Route path="/recipes" element={<Recipes />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/analytics" element={
              <Report activeReport="clients" onReportChange={() => {}} />
            } />
            <Route path="/analytics/clients" element={<ClientReport />} />
            <Route path="/analytics/events" element={<EventReport />} />
            <Route path="/analytics/menus" element={<MenuReport />} />
            <Route path="/analytics/billing" element={<BillingReport />} />
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}
export default App;
