
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  UtensilsCrossed,
  Settings,
  ChefHat,
  BookOpen,
  Receipt,
  PieChart,
  Menu,
  BarChart,
  LineChart,
  CircleDollarSign
} from "lucide-react";
import { useState, useEffect } from "react";

const Sidebar = () => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved ? JSON.parse(saved) : false;
  });
  
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  const toggleCollapse = () => {
    setIsCollapsed(prev => !prev);
  };

  const links = [
    { icon: LayoutDashboard, label: "Dashboard", to: "/" }, 
    { icon: Users, label: "Clients", to: "/clients" },
    { icon: Calendar, label: "Events", to: "/events" },
    { icon: UtensilsCrossed, label: "Menus", to: "/menus" },
    { icon: BookOpen, label: "Recipes", to: "/recipes" },
    { icon: Receipt, label: "Billing", to: "/billing" },
    { 
      icon: PieChart, 
      label: "Reports", 
      to: "/analytics",
      subItems: [
        { icon: BarChart, label: "Client Analytics", to: "/analytics/clients" },
        { icon: LineChart, label: "Event Analytics", to: "/analytics/events" },
        { icon: PieChart, label: "Menu Analytics", to: "/analytics/menus" },
        { icon: CircleDollarSign, label: "Billing Analytics", to: "/analytics/billing" },
      ]
    },
    { icon: Settings, label: "Settings", to: "/settings" },
  ];

  return (
    <div 
      className={cn(
        "h-screen bg-white fixed left-0 top-0 shadow-lg border-r border-gray-200 transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className={cn("mb-8 p-6", isCollapsed && "p-4")}>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleCollapse}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <Menu size={20} className="text-gray-600" />
          </button>
          {!isCollapsed && (
            <>
              <ChefHat className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                CaterFlow
              </h1>
            </>
          )}
        </div>
      </div>
      <nav className={cn("space-y-1", isCollapsed ? "px-2" : "px-3")}>
        {links.map((link) => (
          <div key={link.to}>
            <Link
              to={link.to}
              className={cn(
                "flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200",
                location.pathname === link.to
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-gray-600 hover:bg-gray-100"
              )}
              title={isCollapsed ? link.label : undefined}
            >
              <link.icon size={20} />
              {!isCollapsed && <span>{link.label}</span>}
            </Link>
            {!isCollapsed && link.subItems && (
              <div className="ml-6 space-y-1 mt-1">
                {link.subItems.map((subItem) => (
                  <Link
                    key={subItem.to}
                    to={subItem.to}
                    className={cn(
                      "flex items-center space-x-3 px-4 py-2 rounded-lg transition-all duration-200 text-sm",
                      location.pathname === subItem.to
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-gray-600 hover:bg-gray-100"
                    )}
                  >
                    <subItem.icon size={16} />
                    <span>{subItem.label}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
