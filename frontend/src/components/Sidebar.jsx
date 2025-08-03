import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
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
<<<<<<< HEAD
  Tv,
  Wifi,
  Package2,
  Users
=======
  LogOut,
  User
>>>>>>> 839d685f703cc5427382b6e8b94102ef22f44257
} from "lucide-react";

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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
      name: "Purchases", 
      path: "/purchases", 
      icon: ShoppingBag,
      description: "Purchase Records"
    },
    { 
      name: "Day Book", 
      path: "/daybook", 
      icon: BookOpen,
      description: "Daily Records"
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

  const fibernetLinks = [
    { 
      name: "Fibernet Dashboard", 
      path: "/fibernet-dashboard", 
      icon: Users,
      description: "Services Overview"
    },
    { 
      name: "Dishhome", 
      path: "/dishhome", 
      icon: Tv,
      description: "TV Services"
    },
    { 
      name: "Fibernet", 
      path: "/fibernet", 
      icon: Wifi,
      description: "Internet Services"
    },
    { 
      name: "Combo Packages", 
      path: "/combo", 
      icon: Package2,
      description: "Combined Services"
    },
  ];

  return (
    <div className="fixed left-0 top-0 h-full w-72 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white shadow-2xl flex flex-col z-40">
      {/* Header Section */}
      <div className="px-6 py-8 border-b border-slate-700/50 flex-shrink-0">
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

<<<<<<< HEAD
      {/* Navigation Section */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto">
        {/* Inventory Management Section */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-4">
            Inventory Management
          </h3>
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
        </div>

        {/* Fibernet Services Section */}
        <div>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-4">
            Fibernet Services
          </h3>
          <div className="space-y-2">
            {fibernetLinks.map((link, index) => {
              const IconComponent = link.icon;
              return (
                <NavLink
                  key={`fibernet-${index}`}
                  to={link.path}
                  className={({ isActive }) =>
                    `group flex items-center px-4 py-3 rounded-xl transition-all duration-200 ease-in-out ${
                      isActive 
                        ? "bg-green-600 shadow-lg text-white transform scale-105" 
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
=======
      {/* User Info Section */}
      <div className="px-6 py-4 border-b border-slate-700/50 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-slate-700 rounded-lg">
            <User size={16} className="text-slate-300" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user?.name || user?.username || 'User'}
            </p>
            <p className="text-xs text-slate-400 truncate">
              {user?.role || 'Administrator'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Section - Scrollable */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
        <div className="px-4 py-6 space-y-2">
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
>>>>>>> 839d685f703cc5427382b6e8b94102ef22f44257
        </div>
      </nav>
      
      {/* Logout Section */}
      <div className="px-4 py-4 border-t border-slate-700/50 flex-shrink-0">
        <button
          onClick={handleLogout}
          className="w-full group flex items-center px-4 py-3 rounded-xl transition-all duration-200 ease-in-out text-slate-300 hover:bg-red-600/20 hover:text-red-400 border border-slate-700 hover:border-red-500"
        >
          <div className="p-2 rounded-lg mr-3 transition-colors bg-slate-700 group-hover:bg-red-600/20">
            <LogOut size={20} />
          </div>
          <div className="flex-1 text-left">
            <div className="font-medium text-sm">Logout</div>
            <div className="text-xs opacity-75 mt-0.5">Sign out of account</div>
          </div>
        </button>
      </div>
      
      {/* Connection Status Section */}
      <div className="px-6 py-4 border-t border-slate-700/50 bg-slate-800/30 flex-shrink-0">
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
