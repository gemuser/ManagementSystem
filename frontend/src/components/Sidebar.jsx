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
  Building2
} from "lucide-react";

const Sidebar = () => {
  const links = [
    { 
      name: "Dashboard", 
      path: "/", 
      icon: LayoutDashboard,
      description: "Overview & Analytics"
    },
    { 
      name: "Products", 
      path: "/products", 
      icon: Package,
      description: "Manage Inventory"
    },
    { 
      name: "Stock", 
      path: "/stock", 
      icon: Warehouse,
      description: "Stock Management"
    },
    { 
      name: "Sales", 
      path: "/sales", 
      icon: ShoppingCart,
      description: "Create Sales"
    },
    { 
      name: "Sales History", 
      path: "/sales-history", 
      icon: History,
      description: "Sales Records"
    },
    { 
      name: "Activity History", 
      path: "/history", 
      icon: BarChart3,
      description: "All Activities"
    },
  ];

  return (
    <div className="fixed left-0 top-0 h-full w-72 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white shadow-2xl flex flex-col z-40">
      {/* Header Section */}
      <div className="px-6 py-8 border-b border-slate-700/50">
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 bg-blue-600 rounded-xl shadow-lg">
            <Building2 size={28} className="text-white" />
          </div>
        </div>
        <h1 className="text-xl font-bold text-center text-white leading-tight">
          Inventory Management
        </h1>
        <p className="text-sm text-slate-300 text-center mt-2 font-medium">
          Professional System
        </p>
      </div>

      {/* Navigation Section */}
      <nav className="flex-1 px-4 py-6">
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
                      : "text-slate-300 hover:bg-slate-700/50 hover:text-white hover:transform hover:scale-102"
                  }`
                }
              >
                <div className={`p-2 rounded-lg mr-3 transition-colors bg-slate-700 group-hover:bg-slate-600`}>
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
      <div className="px-6 py-4 border-t border-slate-700/50 bg-slate-800/30">
        <ConnectionStatus variant="dark" />
        <div className="mt-3 text-center">
          <p className="text-xs text-slate-400">
            © 2025 Inventory System
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
