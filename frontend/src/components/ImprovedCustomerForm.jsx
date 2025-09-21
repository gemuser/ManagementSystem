import React, { useState } from 'react';
import { User, Phone, MapPin, Package, Calendar, Banknote, CreditCard, Activity, Hash } from 'lucide-react';
import Swal from 'sweetalert2';

const ImprovedCustomerForm = ({ 
  onSubmit, 
  onCancel, 
  initialData = null, 
  serviceType = 'dishhome', // dishhome, fibernet, or combo
  loading = false 
}) => {
  const [formData, setFormData] = useState({
    customerId: initialData?.customerId?.toString() || '',
    name: initialData?.name || '',
    phoneNumber: initialData?.phoneNumber || '',
    address: initialData?.address || '',
    package: initialData?.package || '',
    price: initialData?.price?.toString() || '',
    month: initialData?.month || '',
    casId: initialData?.casId || '',
    status: initialData?.status ?? 1
  });

  const [errors, setErrors] = useState({});

  // Predefined packages for easy selection
  const packageOptions = {
    dishhome: [
      { name: 'Basic Plan', price: 500 },
      { name: 'Standard Plan', price: 800 },
      { name: 'Premium Plan', price: 1200 },
      { name: 'Gold Plan', price: 1500 },
      { name: 'HD Premium', price: 1800 },
      { name: 'Custom Package', price: 0 }
    ],
    fibernet: [
      { name: '10 Mbps Plan', price: 800 },
      { name: '25 Mbps Plan', price: 1200 },
      { name: '50 Mbps Plan', price: 1800 },
      { name: '100 Mbps Plan', price: 2500 },
      { name: 'Unlimited Plan', price: 3000 },
      { name: 'Custom Package', price: 0 }
    ]
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.customerId.trim()) newErrors.customerId = 'Customer ID is required';
    if (formData.customerId && !/^[a-zA-Z0-9]+$/.test(formData.customerId.trim())) {
      newErrors.customerId = 'Customer ID must contain only letters and numbers';
    }
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';
    if (formData.phoneNumber && !/^[0-9]{10}$/.test(formData.phoneNumber.replace(/\D/g, ''))) {
      newErrors.phoneNumber = 'Please enter a valid 10-digit phone number';
    }
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.package.trim()) newErrors.package = 'Package is required';
    if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = 'Valid price is required';
    if (!formData.month.trim()) newErrors.month = 'Month is required';
    if (serviceType === 'dishhome' && !formData.casId.trim()) {
      newErrors.casId = 'CAS ID is required for DishHome';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle package selection
  const handlePackageSelect = (packageName, packagePrice) => {
    setFormData({
      ...formData,
      package: packageName,
      price: packagePrice > 0 ? packagePrice.toString() : formData.price
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      Swal.fire({
        icon: 'warning',
        title: 'Please fix the errors',
        text: 'Please correct the highlighted fields and try again.',
        confirmButtonColor: '#f59e0b'
      });
      return;
    }

    // Call parent submit handler
    onSubmit(formData);
  };

  // Handle input change
  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const isEditing = initialData !== null;
  const currentPackages = packageOptions[serviceType] || packageOptions.dishhome;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          {serviceType === 'dishhome' ? (
            <>
              <CreditCard className="h-6 w-6 mr-3 text-purple-600" />
              {isEditing ? 'Edit DishHome Customer' : 'Add New DishHome Customer'}
            </>
          ) : (
            <>
              <Activity className="h-6 w-6 mr-3 text-cyan-600" />
              {isEditing ? 'Edit Fibernet Customer' : 'Add New Fibernet Customer'}
            </>
          )}
        </h2>
        <p className="text-gray-600 mt-1">Fill in the customer details below</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Quick Package Selection */}
        <div className="bg-gray-50 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            <Package className="h-4 w-4 inline mr-1" />
            Quick Package Selection
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {currentPackages.map((pkg, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handlePackageSelect(pkg.name, pkg.price)}
                className={`p-3 text-left border rounded-lg transition-all hover:shadow-md ${
                  formData.package === pkg.name 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-medium text-sm">{pkg.name}</div>
                {pkg.price > 0 && (
                  <div className="text-xs text-gray-500">Rs. {pkg.price}/month</div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Hash className="h-4 w-4 inline mr-1" />
              Customer ID *
            </label>
            <div className="flex">
              <input
                type="text"
                value={formData.customerId}
                onChange={(e) => handleInputChange('customerId', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.customerId ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Enter customer ID manually"
                disabled={isEditing} // Disable when editing
              />
            </div>
            {errors.customerId && <p className="text-red-500 text-xs mt-1">{errors.customerId}</p>}
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="h-4 w-4 inline mr-1" />
              Customer Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="Enter customer's full name"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Phone className="h-4 w-4 inline mr-1" />
              Phone Number *
            </label>
            <input
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                errors.phoneNumber ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="9800000000"
            />
            {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>}
          </div>

          {/* Package */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Package className="h-4 w-4 inline mr-1" />
              Package Name *
            </label>
            <input
              type="text"
              value={formData.package}
              onChange={(e) => handleInputChange('package', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                errors.package ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="Package or plan name"
            />
            {errors.package && <p className="text-red-500 text-xs mt-1">{errors.package}</p>}
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Banknote className="h-4 w-4 inline mr-1" />
              Total Price (Rs.) *
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => handleInputChange('price', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                errors.price ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="0.00"
            />
            {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
          </div>

          {/* Month */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="h-4 w-4 inline mr-1" />
              Month/Period *
            </label>
            <input
              type="text"
              value={formData.month}
              onChange={(e) => handleInputChange('month', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                errors.month ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="e.g., January 2025 or 1 Month"
            />
            {errors.month && <p className="text-red-500 text-xs mt-1">{errors.month}</p>}
          </div>

          {/* CAS ID (only for DishHome) */}
          {serviceType === 'dishhome' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <CreditCard className="h-4 w-4 inline mr-1" />
                CAS ID *
              </label>
              <input
                type="text"
                value={formData.casId}
                onChange={(e) => handleInputChange('casId', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.casId ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="CAS-001"
              />
              {errors.casId && <p className="text-red-500 text-xs mt-1">{errors.casId}</p>}
            </div>
          )}

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Activity className="h-4 w-4 inline mr-1" />
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange('status', parseInt(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value={1}>Active</option>
              <option value={0}>Inactive</option>
            </select>
          </div>
        </div>

        {/* Address (full width) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="h-4 w-4 inline mr-1" />
            Address *
          </label>
          <textarea
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            rows={3}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
              errors.address ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="Enter customer's full address"
          />
          {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4 pt-6 border-t border-gray-200">
          <button
            type="submit"
            disabled={loading}
            className={`flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all ${
              loading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'
            }`}
          >
            {loading ? 'Saving...' : (isEditing ? 'Update Customer' : 'Add Customer')}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-all hover:shadow-lg"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ImprovedCustomerForm;
