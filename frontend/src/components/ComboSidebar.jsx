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
          colorScheme: {
            primary: 'orange',
            secondary: 'red'
          },
          links: [
            { 
              name: "Back to Home", 
              path: "/", 
              icon: Home,
              description: "Return to Services"
            },
            { 
              name: "Combo Selection", 
              path: "/combo-selection", 
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
          colorScheme: {
            primary: 'indigo',
            secondary: 'purple'
          },
          links: [
            { 
              name: "Back to Home", 
              path: "/", 
              icon: Home,
              description: "Return to Services"
            },
            { 
              name: "Combo Selection", 
              path: "/combo-selection", 
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
          colorScheme: {
            primary: 'green',
            secondary: 'emerald'
          },
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
  const { primary } = config.colorScheme;

  return (
    <div className={`fixed left-0 top-0 h-full w-72 bg-gradient-to-b from-${primary}-900 via-${primary}-800 to-${primary}-900 text-white shadow-2xl flex flex-col z-40`}>
      {/* Header Section */}
      <div className={`px-6 py-8 border-b border-${primary}-700/50`}>
        <div className="flex items-center justify-center mb-4">
          <div className={`p-3 bg-${primary}-600 rounded-xl shadow-lg`}>
            <config.icon size={28} className="text-white" />
          </div>
        </div>
        <h1 className="text-xl font-bold text-center text-white leading-tight">
          {config.title}
        </h1>
        <p className={`text-sm text-${primary}-300 text-center mt-2 font-medium`}>
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
                      ? `bg-${primary}-600 shadow-lg text-white transform scale-105`
                      : `text-${primary}-300 hover:bg-${primary}-700/50 hover:text-white hover:transform hover:scale-102`
                  }`
                }
              >
                <div className={`p-2 rounded-lg mr-3 transition-colors bg-${primary}-700 group-hover:bg-${primary}-600`}>
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
      <div className={`px-6 py-4 border-t border-${primary}-700/50 bg-${primary}-800/30`}>
        <ConnectionStatus variant="dark" />
        <div className="mt-3 text-center">
          <p className={`text-xs text-${primary}-400`}>
            © 2025 {config.title}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ComboSidebar;
