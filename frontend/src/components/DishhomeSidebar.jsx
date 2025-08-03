import React from "react";
import { NavLink } from "react-router-dom";
import ConnectionStatus from "./ConnectionStatus";
import { 
  BarChart3, 
  Tv,
  Home,
  Building2
} from "lucide-react";

const DishhomeSidebar = () => {
  const links = [
    { 
      name: "Back to Home", 
      path: "/", 
      icon: Home,
      description: "Return to Services"
    },
    { 
      name: "Dishhome Dashboard", 
      path: "/dishhome", 
      icon: BarChart3,
      description: "Customer Overview"
    },
    { 
      name: "Manage Customers", 
      path: "/dishhome", 
      icon: Tv,
      description: "TV Service Customers"
    },
  ];

  return (
    <div className="fixed left-0 top-0 h-full w-72 bg-gradient-to-b from-purple-900 via-purple-800 to-purple-900 text-white shadow-2xl flex flex-col z-40">
      {/* Header Section */}
      <div className="px-6 py-8 border-b border-purple-700/50">
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 bg-purple-600 rounded-xl shadow-lg">
            <Tv size={28} className="text-white" />
          </div>
        </div>
        <h1 className="text-xl font-bold text-center text-white leading-tight">
          Dishhome System
        </h1>
        <p className="text-sm text-purple-300 text-center mt-2 font-medium">
          TV Service Management
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
                      ? "bg-purple-600 shadow-lg text-white transform scale-105" 
                      : "text-purple-300 hover:bg-purple-700/50 hover:text-white hover:transform hover:scale-102"
                  }`
                }
              >
                <div className={`p-2 rounded-lg mr-3 transition-colors bg-purple-700 group-hover:bg-purple-600`}>
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
      <div className="px-6 py-4 border-t border-purple-700/50 bg-purple-800/30">
        <ConnectionStatus variant="dark" />
        <div className="mt-3 text-center">
          <p className="text-xs text-purple-400">
            © 2025 Dishhome System
          </p>
        </div>
      </div>
    </div>
  );
};

export default DishhomeSidebar;
