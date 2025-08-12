import React, { useState, useEffect } from 'react';
import { User, Phone, MapPin, Package, Calendar, Banknote, Hash, Tv, Wifi, Package2, Users } from 'lucide-react';
import Swal from 'sweetalert2';
import axios from '../api/axios';

const ComboCustomerForm = ({ 
  onSubmit, 
  onCancel, 
  initialData = null,
  loading = false,
  isUpgrade = false,
  upgradeData = null
}) => {
  const [formData, setFormData] = useState({
    // IDs
    dishhomeId: initialData?.dishhomeId || upgradeData?.dishhomeId || '',
    fibernetId: initialData?.fibernetId || upgradeData?.fibernetId || '',
    
    // Combo details
    totalPrice: initialData?.totalPrice?.toString() || '',
    month: initialData?.month || '',
    upgradeType: initialData?.upgradeType || upgradeData?.upgradeType || '',
    sourceService: initialData?.sourceService || upgradeData?.sourceService || '',
    
    // Contact info (auto-filled for upgrades)
    phoneNumber: initialData?.phoneNumber || upgradeData?.phoneNumber || '',
    casId: initialData?.casId || upgradeData?.casId || '',
    
    status: initialData?.status ?? 1
  });

  const [errors, setErrors] = useState({});
  const [availableCustomers, setAvailableCustomers] = useState({
    dishhome: [],
    fibernet: []
  });

  // Fetch available customers for manual combo creation
  useEffect(() => {
    if (!isUpgrade) {
      fetchAvailableCustomers();
    }
  }, [isUpgrade]);

  const fetchAvailableCustomers = async () => {
    try {
      const [dishhomeRes, fibernetRes] = await Promise.all([
        axios.get('/dishhome/list'),
        axios.get('/fibernet/list')
      ]);
      
      setAvailableCustomers({
        dishhome: dishhomeRes.data.data || [],
        fibernet: fibernetRes.data.data || []
      });
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  // Auto-fill customer data when IDs are selected
  const handleCustomerSelect = async (type, customerId) => {
    if (!customerId) return;
    
    try {
      const customers = type === 'dishhome' ? availableCustomers.dishhome : availableCustomers.fibernet;
      const customer = customers.find(c => c.customerId.toString() === customerId);
      
      if (customer && !formData.phoneNumber) {
        setFormData(prev => ({
          ...prev,
          phoneNumber: customer.phoneNumber,
          ...(type === 'dishhome' && customer.casId && { casId: customer.casId })
        }));
      }
    } catch (error) {
      console.error('Error auto-filling customer data:', error);
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // At least one customer ID required
    if (!formData.dishhomeId && !formData.fibernetId) {
      newErrors.customerIds = 'At least one customer ID (DishHome or Fibernet) is required';
    }
    
    if (!formData.totalPrice || parseFloat(formData.totalPrice) <= 0) {
      newErrors.totalPrice = 'Valid total price is required';
    }
    if (!formData.month.trim()) newErrors.month = 'Month is required';
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Auto-fill customer data when ID is selected
    if (field === 'dishhomeId' || field === 'fibernetId') {
      const type = field === 'dishhomeId' ? 'dishhome' : 'fibernet';
      handleCustomerSelect(type, value);
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const isEditing = !!initialData;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <Package2 className="h-6 w-6 mr-2 text-green-600" />
          {isUpgrade ? 'Upgrade to Combo Plan' : (isEditing ? 'Edit Combo Customer' : 'Add Combo Customer')}
        </h2>
      </div>

      {isUpgrade && upgradeData && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-800 mb-2">Upgrade Details</h3>
          <div className="text-sm text-blue-700">
            <div>Source: {upgradeData.sourceService === 'dishhome' ? 'DishHome' : 'Fibernet'}</div>
            <div>Customer: {upgradeData.customerName}</div>
            <div>Type: {upgradeData.upgradeType}</div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer IDs Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* DishHome Customer */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Tv className="h-4 w-4 inline mr-1" />
              DishHome Customer ID
            </label>
            {isUpgrade && upgradeData?.sourceService === 'dishhome' ? (
              <input
                type="text"
                value={formData.dishhomeId}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                disabled
              />
            ) : (
              <select
                value={formData.dishhomeId}
                onChange={(e) => handleInputChange('dishhomeId', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Select DishHome Customer</option>
                {availableCustomers.dishhome.map(customer => (
                  <option key={customer.customerId} value={customer.customerId}>
                    {customer.customerId} - {customer.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Fibernet Customer */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Wifi className="h-4 w-4 inline mr-1" />
              Fibernet Customer ID
            </label>
            {isUpgrade && upgradeData?.sourceService === 'fibernet' ? (
              <input
                type="text"
                value={formData.fibernetId}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                disabled
              />
            ) : (
              <select
                value={formData.fibernetId}
                onChange={(e) => handleInputChange('fibernetId', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Select Fibernet Customer</option>
                {availableCustomers.fibernet.map(customer => (
                  <option key={customer.customerId} value={customer.customerId}>
                    {customer.customerId} - {customer.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {errors.customerIds && <p className="text-red-500 text-xs">{errors.customerIds}</p>}

        {/* Combo Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Total Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Banknote className="h-4 w-4 inline mr-1" />
              Total Combo Price *
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.totalPrice}
              onChange={(e) => handleInputChange('totalPrice', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                errors.totalPrice ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="Enter total price"
            />
            {errors.totalPrice && <p className="text-red-500 text-xs mt-1">{errors.totalPrice}</p>}
          </div>

          {/* Month */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="h-4 w-4 inline mr-1" />
              Month *
            </label>
            <input
              type="month"
              value={formData.month}
              onChange={(e) => handleInputChange('month', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                errors.month ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
            />
            {errors.month && <p className="text-red-500 text-xs mt-1">{errors.month}</p>}
          </div>
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                errors.phoneNumber ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="Enter phone number"
            />
            {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>}
          </div>

          {/* CAS ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Hash className="h-4 w-4 inline mr-1" />
              CAS ID
            </label>
            <input
              type="text"
              value={formData.casId}
              onChange={(e) => handleInputChange('casId', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              placeholder="Enter CAS ID (optional)"
            />
          </div>
        </div>

        {/* Upgrade Type (if applicable) */}
        {isUpgrade && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Package className="h-4 w-4 inline mr-1" />
              Upgrade Type
            </label>
            <input
              type="text"
              value={formData.upgradeType}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
              disabled
            />
          </div>
        )}

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Users className="h-4 w-4 inline mr-1" />
            Status
          </label>
          <select
            value={formData.status}
            onChange={(e) => handleInputChange('status', parseInt(e.target.value))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value={1}>Active</option>
            <option value={0}>Inactive</option>
          </select>
        </div>

        {/* Form Actions */}
        <div className="flex gap-4 pt-6">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white py-3 px-6 rounded-lg transition-colors"
          >
            {loading ? 'Saving...' : (isEditing ? 'Update Combo' : 'Create Combo')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ComboCustomerForm;
