import React from "react";
import { NavLink } from "react-router-dom";
import ConnectionStatus from "./ConnectionStatus";
import { 
  BarChart3, 
  LayoutDashboard, 
  Package, 
  Warehouse, 
  ShoppingCart, 
  History,
  Building2,
  BookOpen,
  ShoppingBag,
  Home
} from "lucide-react";

const DHISidebar = () => {
  const links = [
    { 
      name: "Back to Home", 
      path: "/", 
      icon: Home,
      description: "Return to Services"
    },
    { 
      name: "Dashboard", 
      path: "/dhi/dashboard", 
      icon: LayoutDashboard,
      description: "Overview & Analytics"
    },
    { 
      name: "Products", 
      path: "/dhi/products", 
      icon: Package,
      description: "Manage Inventory"
    },
    { 
      name: "Stock", 
      path: "/dhi/stock", 
      icon: Warehouse,
      description: "Stock Management"
    },
    { 
      name: "Sales", 
      path: "/dhi/sales", 
      icon: ShoppingCart,
      description: "Create Sales"
    },
    { 
      name: "Purchases", 
      path: "/dhi/purchases", 
      icon: ShoppingBag,
      description: "Purchase Records"
    },
    { 
      name: "Day Book", 
      path: "/dhi/daybook", 
      icon: BookOpen,
      description: "Daily Records"
    },
    { 
      name: "Sales History", 
      path: "/dhi/sales-history", 
      icon: History,
      description: "Sales Records"
    },
    { 
      name: "Activity History", 
      path: "/dhi/history", 
      icon: BarChart3,
      description: "All Activities"
    },
  ];

  return (
    <div className="fixed left-0 top-0 h-full w-72 bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900 text-white shadow-2xl flex flex-col z-40">
      {/* Header Section */}
      <div className="px-6 py-8 border-b border-blue-700/50">
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 bg-blue-600 rounded-xl shadow-lg">
            <Building2 size={28} className="text-white" />
          </div>
        </div>
        <h1 className="text-xl font-bold text-center text-white leading-tight">
          DHI System
        </h1>
        <p className="text-sm text-blue-300 text-center mt-2 font-medium">
          Inventory Management
        </p>
      </div>

      {/* Navigation Section */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto">
        <div className="space-y-2">
          {links.map((link, index) => {
            const IconComponent = link.icon;
            return (
              <NavLink
                key={index}
                to={link.path}
                className={({ isActive }) =>
                  `group flex items-center px-4 py-3 rounded-xl transition-all duration-200 ease-in-out ${
                    isActive 
                      ? "bg-blue-600 shadow-lg text-white transform scale-105" 
                      : "text-blue-300 hover:bg-blue-700/50 hover:text-white hover:transform hover:scale-102"
                  }`
                }
              >
                <div className={`p-2 rounded-lg mr-3 transition-colors bg-blue-700 group-hover:bg-blue-600`}>
                  <IconComponent size={20} />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">{link.name}</div>
                  <div className="text-xs opacity-75 mt-0.5">{link.description}</div>
                </div>
              </NavLink>
            );
          })}
        </div>
      </nav>
      
      {/* Connection Status Section */}
      <div className="px-6 py-4 border-t border-blue-700/50 bg-blue-800/30">
        <ConnectionStatus variant="dark" />
        <div className="mt-3 text-center">
          <p className="text-xs text-blue-400">
            © 2025 DHI System
          </p>
        </div>
      </div>
    </div>
  );
};

export default DHISidebar;
