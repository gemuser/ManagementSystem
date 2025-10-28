import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Swal from 'sweetalert2';
import { 
  Package, 
  Tv, 
  Wifi, 
  Package2,
  Zap,
  LogIn,
  LogOut,
  User,
  History,
  BookOpen,
  BarChart3,
  Calendar,
  FileText,
  Calculator
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

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
      route: '/dishhome-dashboard'
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
    if (isAuthenticated) {
      navigate(service.route);
    } else {
      navigate('/login', { state: { from: { pathname: service.route } } });
    }
  };

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Logout Confirmation',
      text: 'Do you really want to logout?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Logout',
      cancelButtonText: 'No, Stay'
    });

    if (result.isConfirmed) {
      logout();
      navigate('/');
      Swal.fire({
        icon: 'success',
        title: 'Logged Out',
        text: 'You have been logged out successfully',
        timer: 1500,
        showConfirmButton: false
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="relative z-10">
        <div className="flex justify-between items-center px-8 py-6">
          {/* Logo */}
          <div className="flex items-center">
            <div className="h-10 w-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mr-3">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">GPP</h1>
              <p className="text-sm text-purple-200">Management System</p>
            </div>
          </div>
          
          {/* Auth Section */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center text-white">
                  <User className="h-5 w-5 mr-2" />
                  <span className="text-sm">Welcome, {user?.username || 'User'}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-all"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Login
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-100px)] px-6">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent mb-6">
            GPP
            </h1>
            <p className="text-xl text-gray-300 mb-4">
              Complete Management System for Your Business
            </p>
            <div className="w-32 h-1 bg-gradient-to-r from-purple-500 to-blue-500 mx-auto"></div>
          </div>

          {/* Service Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service) => {
              const IconComponent = service.icon;
              return (
                <div
                  key={service.id}
                  onClick={() => handleServiceSelect(service)}
                  className="group bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 cursor-pointer transform hover:-translate-y-3 hover:scale-105 p-8 text-center"
                >
                  <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-r ${service.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <IconComponent className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-purple-200 transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-gray-300 group-hover:text-gray-200 transition-colors">
                    {service.subtitle}
                  </p>
                  
                  {/* Hover Effect */}
                  <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-full h-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"></div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Histories Section */}
          <div className="mt-16 flex justify-end">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-2xl">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">Quick Access</h3>
                <p className="text-gray-300">Access comprehensive records and accounting tools</p>
                {!isAuthenticated && (
                  <p className="text-amber-300 text-sm mt-2">
                    <LogIn className="h-4 w-4 inline mr-1" />
                    Login required to access these features
                  </p>
                )}
              </div>
              
              <div className="flex justify-center space-x-6">
                {/* Day Book Button */}
                <div
                  onClick={() => isAuthenticated ? navigate('/daybook') : navigate('/login')}
                  className="group bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-6 cursor-pointer transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <div className="text-center">
                    <BookOpen className="h-12 w-12 text-white mx-auto mb-3" />
                    <h4 className="text-white font-bold text-lg">Day Book</h4>
                    <p className="text-orange-100 text-sm">All Records & Analytics</p>
                  </div>
                </div>

                {/* Ledger Button */}
                <div
                  onClick={() => isAuthenticated ? navigate('/ledger') : navigate('/login')}
                  className="group bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-6 cursor-pointer transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <div className="text-center">
                    <Calculator className="h-12 w-12 text-white mx-auto mb-3" />
                    <h4 className="text-white font-bold text-lg">Ledger</h4>
                    <p className="text-green-100 text-sm">Accounting Transactions</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center py-8 mt-12">
            <p className="text-sm text-gray-400">
              © 2025 Global Powerpoint Solution. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
