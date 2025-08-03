import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Monitor, Zap, ArrowLeft } from 'lucide-react';

const ComboSelectionPage = () => {
  const navigate = useNavigate();

  const comboOptions = [
    {
      id: 'dth',
      title: 'DTH',
      subtitle: 'Digital Television',
      icon: Monitor,
      color: 'from-orange-500 to-orange-600',
      route: '/combo/dth'
    },
    {
      id: 'itv',
      title: 'ITV',
      subtitle: 'Interactive Television',
      icon: Zap,
      color: 'from-indigo-500 to-indigo-600',
      route: '/combo/itv'
    }
  ];

  const handleOptionSelect = (option) => {
    navigate(option.route);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-6">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-8 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Home
        </button>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Combo Services</h1>
          <p className="text-gray-600">Choose your television service type</p>
          <div className="w-16 h-1 bg-gradient-to-r from-green-500 to-green-600 mx-auto mt-4"></div>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {comboOptions.map((option) => {
            const IconComponent = option.icon;
            return (
              <div
                key={option.id}
                onClick={() => handleOptionSelect(option)}
                className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2 p-8 text-center"
              >
                <div className={`w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r ${option.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <IconComponent className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{option.title}</h3>
                <p className="text-gray-600">{option.subtitle}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ComboSelectionPage;
