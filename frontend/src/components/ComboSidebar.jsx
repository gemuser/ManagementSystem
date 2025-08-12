import React from "react";
import { NavLink } from "react-router-dom";
import ConnectionStatus from "./ConnectionStatus";
import { 
  Package2,
  Monitor,
  Zap,
  Home,
  Building2
} from "lucide-react";

const ComboSidebar = ({ serviceType = 'general' }) => {
  const getServiceConfig = () => {
    switch (serviceType) {
      case 'dth':
        return {
          title: 'DTH Combo System',
          subtitle: 'Digital TV Combos',
          icon: Monitor,
          bgClass: 'bg-gradient-to-b from-orange-900 via-orange-800 to-orange-900',
          borderClass: 'border-orange-700/50',
          buttonClass: 'bg-orange-600',
          hoverClass: 'hover:bg-orange-700/50',
          links: [
            { 
              name: "Back to Home", 
              path: "/", 
              icon: Home,
              description: "Return to Services"
            },
            { 
              name: "Combo Selection", 
              path: "/combo", 
              icon: Package2,
              description: "Choose Service Type"
            },
            { 
              name: "DTH Combos", 
              path: "/combo/dth", 
              icon: Monitor,
              description: "DTH Combo Packages"
            },
          ]
        };
      case 'itv':
        return {
          title: 'ITV Combo System',
          subtitle: 'Interactive TV Combos',
          icon: Zap,
          bgClass: 'bg-gradient-to-b from-indigo-900 via-indigo-800 to-indigo-900',
          borderClass: 'border-indigo-700/50',
          buttonClass: 'bg-indigo-600',
          hoverClass: 'hover:bg-indigo-700/50',
          links: [
            { 
              name: "Back to Home", 
              path: "/", 
              icon: Home,
              description: "Return to Services"
            },
            { 
              name: "Combo Selection", 
              path: "/combo", 
              icon: Package2,
              description: "Choose Service Type"
            },
            { 
              name: "ITV Combos", 
              path: "/combo/itv", 
              icon: Zap,
              description: "ITV Combo Packages"
            },
          ]
        };
      default:
        return {
          title: 'Combo System',
          subtitle: 'Package Management',
          icon: Package2,
          bgClass: 'bg-gradient-to-b from-green-900 via-green-800 to-green-900',
          borderClass: 'border-green-700/50',
          buttonClass: 'bg-green-600',
          hoverClass: 'hover:bg-green-700/50',
          links: [
            { 
              name: "Back to Home", 
              path: "/", 
              icon: Home,
              description: "Return to Services"
            },
            { 
              name: "All Combos", 
              path: "/combo", 
              icon: Package2,
              description: "All Combo Packages"
            },
          ]
        };
    }
  };

  const config = getServiceConfig();

  return (
    <div className={`fixed left-0 top-0 h-full w-72 ${config.bgClass} text-white shadow-2xl flex flex-col z-40`}>
      {/* Header Section */}
      <div className={`px-6 py-8 border-b ${config.borderClass}`}>
        <div className="flex items-center justify-center mb-4">
          <div className={`p-3 ${config.buttonClass} rounded-xl shadow-lg`}>
            <config.icon size={28} className="text-white" />
          </div>
        </div>
        <h1 className="text-xl font-bold text-center text-white leading-tight">
          {config.title}
        </h1>
        <p className="text-sm text-gray-300 text-center mt-2 font-medium">
          {config.subtitle}
        </p>
      </div>

      {/* Navigation Section */}
      <nav className="flex-1 px-4 py-6">
        <div className="space-y-2">
          {config.links.map((link, index) => {
            const IconComponent = link.icon;
            return (
              <NavLink
                key={index}
                to={link.path}
                className={({ isActive }) =>
                  `group flex items-center px-4 py-3 rounded-xl transition-all duration-200 ease-in-out ${
                    isActive 
                      ? `${config.buttonClass} shadow-lg text-white transform scale-105`
                      : `text-gray-300 ${config.hoverClass} hover:text-white hover:transform hover:scale-102`
                  }`
                }
              >
                <div className={`p-2 rounded-lg mr-3 transition-colors bg-gray-700 group-hover:${config.buttonClass}`}>
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
      <div className={`px-6 py-4 border-t ${config.borderClass} bg-black/20`}>
        <ConnectionStatus variant="dark" />
        <div className="mt-3 text-center">
          <p className="text-xs text-gray-400">
            © 2025 {config.title}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ComboSidebar;
