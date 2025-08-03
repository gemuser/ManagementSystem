import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  Tv, 
  Wifi, 
  Package2
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  const services = [
    {
      id: 'dhi',
      title: 'DHI',
      subtitle: 'Inventory Management',
      icon: Package,
      color: 'from-blue-500 to-blue-600',
      route: '/dhi/dashboard'
    },
    {
      id: 'dishhome',
      title: 'Dishhome',
      subtitle: 'TV Services',
      icon: Tv,
      color: 'from-purple-500 to-purple-600',
      route: '/dishhome'
    },
    {
      id: 'fibernet',
      title: 'Fibernet',
      subtitle: 'Internet Services',
      icon: Wifi,
      color: 'from-cyan-500 to-cyan-600',
      route: '/fibernet-dashboard'
    },
    {
      id: 'combo',
      title: 'Combo',
      subtitle: 'Package Services',
      icon: Package2,
      color: 'from-green-500 to-green-600',
      route: '/combo'
    }
  ];

  const handleServiceSelect = (service) => {
    navigate(service.route);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Global Powerpoint</h1>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto"></div>
        </div>

        {/* Service Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {services.map((service) => {
            const IconComponent = service.icon;
            return (
              <div
                key={service.id}
                onClick={() => handleServiceSelect(service)}
                className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2 p-8 text-center"
              >
                <div className={`w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-r ${service.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <IconComponent className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{service.title}</h3>
                <p className="text-sm text-gray-600">{service.subtitle}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
