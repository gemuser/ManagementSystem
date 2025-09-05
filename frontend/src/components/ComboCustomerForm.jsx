import React, { useState, useEffect } from 'react';
import { User, Phone, MapPin, Package, Calendar, Banknote, Hash, Tv, Wifi, Package2, Users, Info } from 'lucide-react';
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
    
    // Customer info
    customerName: initialData?.customerName || upgradeData?.customerName || '',
    phoneNumber: initialData?.phoneNumber || upgradeData?.phoneNumber || '',
    casId: initialData?.casId || upgradeData?.casId || '',
    customerAddress: initialData?.customerAddress || upgradeData?.customerAddress || '',
    
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
      
      if (customer) {
        setFormData(prev => ({
          ...prev,
          phoneNumber: customer.phoneNumber || prev.phoneNumber,
          customerAddress: customer.address || prev.customerAddress,
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

    // Required: Total price
    if (!formData.totalPrice || parseFloat(formData.totalPrice) <= 0) {
      newErrors.totalPrice = 'Valid total price is required';
    }

    // Required: Month (any positive number)
    if (!formData.month.trim()) {
      newErrors.month = 'Month is required';
    } else {
      const monthNum = parseInt(formData.month);
      if (isNaN(monthNum) || monthNum < 1) {
        newErrors.month = 'Month must be a positive number (1 or greater)';
      }
    }

    // Required: Phone number
    if (!formData.phoneNumber?.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    }

    // Required: Customer address
    if (!formData.customerAddress?.trim()) {
      newErrors.customerAddress = 'Customer address is required';
    }

    // Scenario-based validation
    const isConversionScenario = formData.sourceService && (formData.dishhomeId || formData.fibernetId) && !(formData.dishhomeId && formData.fibernetId);
    const isNewCustomerScenario = !formData.dishhomeId && !formData.fibernetId && !isUpgrade;
    
    if (isConversionScenario) {
      // CONVERSION SCENARIOS - need source customer ID and combo type selection
      if (formData.sourceService === 'dishhome' && !formData.dishhomeId) {
        newErrors.dishhomeId = 'DishHome customer ID is required for conversion';
      }
      if (formData.sourceService === 'fibernet' && !formData.fibernetId) {
        newErrors.fibernetId = 'Fibernet customer ID is required for conversion';
      }
      if (!formData.upgradeType) {
        newErrors.upgradeType = 'Please select a combo type (DTH or ITV)';
      }
    } else if (isNewCustomerScenario) {
      // NEW CUSTOMER SCENARIO - need customer name, combo type, and manual details
      if (!formData.customerName?.trim()) {
        newErrors.customerName = 'Customer name is required for new customers';
      }
      if (!formData.upgradeType) {
        newErrors.upgradeType = 'Please select a combo type (DTH or ITV) for new customers';
      }
      if (!formData.phoneNumber?.trim() || !formData.customerAddress?.trim()) {
        newErrors.customerInfo = 'Phone number and address are required for new customers';
      }
    } else if (!isUpgrade) {
      // EXISTING CUSTOMER SCENARIO - using existing customer IDs
      const hasCustomerIds = formData.dishhomeId || formData.fibernetId;
      const hasManualDetails = formData.phoneNumber?.trim() && 
                              formData.customerAddress?.trim();
      
      if (!hasCustomerIds && !hasManualDetails) {
        newErrors.customerInfo = 'Please provide either customer IDs or complete manual customer details (phone + address)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Automatically detect conversion scenarios for non-upgrade mode
      if (!isUpgrade) {
        // If only DishHome ID is provided (DishHome → Combo conversion)
        if (field === 'dishhomeId' && value && !newData.fibernetId) {
          newData.sourceService = 'dishhome';
          // Don't auto-set upgradeType - let user choose
        }
        // If only Fibernet ID is provided (Fibernet → Combo conversion)
        else if (field === 'fibernetId' && value && !newData.dishhomeId) {
          newData.sourceService = 'fibernet';
          // Don't auto-set upgradeType - let user choose
        }
        // If DishHome ID is cleared, reset conversion flags
        else if (field === 'dishhomeId' && !value && newData.sourceService === 'dishhome') {
          newData.upgradeType = '';
          newData.sourceService = '';
        }
        // If Fibernet ID is cleared, reset conversion flags
        else if (field === 'fibernetId' && !value && newData.sourceService === 'fibernet') {
          newData.upgradeType = '';
          newData.sourceService = '';
        }
        // If both IDs are provided, it's a new combo (not conversion)
        else if (newData.dishhomeId && newData.fibernetId) {
          newData.upgradeType = '';
          newData.sourceService = '';
        }
      }
      
      return newData;
    });

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
    console.log('Form submission data:', formData);
    if (validateForm()) {
      console.log('Validation passed, submitting:', formData);
      onSubmit(formData);
    } else {
      console.log('Validation failed, errors:', errors);
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

      {!isUpgrade && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-medium text-blue-800 mb-2">Combo Creation Options:</h3>
          <div className="text-xs text-blue-700 space-y-1">
            <div>• <strong>DishHome → Combo:</strong> Convert existing DishHome customer to combo (adds Fibernet service)</div>
            <div>• <strong>Fibernet → Combo:</strong> Convert existing Fibernet customer to combo (adds DishHome service)</div>
            <div>• <strong>New Combo:</strong> Create new customer directly with both services</div>
            <div>• <strong>Manual Entry:</strong> Enter customer details manually for new combo</div>
          </div>
        </div>
      )}

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

      {/* Overall Error Message */}
      {errors.customerInfo && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-red-700 text-sm">{errors.customerInfo}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Selection Section */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Users className="h-5 w-5 mr-2 text-blue-600" />
            Customer Selection
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* DishHome Customer */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Tv className="h-4 w-4 inline mr-1 text-blue-600" />
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
              <p className="text-xs text-gray-500 mt-1">Choose existing DishHome customer to convert to combo</p>
            </div>

            {/* Fibernet Customer */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Wifi className="h-4 w-4 inline mr-1 text-green-600" />
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
              <p className="text-xs text-gray-500 mt-1">Choose existing Fibernet customer to convert to combo</p>
            </div>
          </div>
          
          <div className="mt-4 text-center">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm">
              <Info className="h-4 w-4 mr-2" />
              Leave both empty to create a new combo customer manually
            </div>
          </div>
        </div>

        {/* Combo Type Selection - Show when converting from single customer */}
        {!isUpgrade && formData.sourceService && (formData.dishhomeId || formData.fibernetId) && !(formData.dishhomeId && formData.fibernetId) && (
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Package2 className="h-5 w-5 mr-2 text-purple-600" />
              Choose Combo Type
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className={`flex flex-col items-center space-y-3 cursor-pointer p-4 border-2 rounded-lg transition-all ${
                formData.upgradeType === 'ITV' 
                  ? 'border-purple-500 bg-purple-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="comboType"
                  value="ITV"
                  checked={formData.upgradeType === 'ITV'}
                  onChange={(e) => handleInputChange('upgradeType', e.target.value)}
                  className="text-purple-500"
                />
                <div className="flex items-center gap-2">
                  <Wifi className="h-6 w-6 text-purple-600" />
                  <span className="font-medium text-lg">ITV</span>
                </div>
                <span className="text-sm text-gray-600 text-center">
                  {formData.sourceService === 'dishhome' ? 'DishHome + Internet' : 'Internet + TV Service'}
                </span>
              </label>
              
              <label className={`flex flex-col items-center space-y-3 cursor-pointer p-4 border-2 rounded-lg transition-all ${
                formData.upgradeType === 'DTH' 
                  ? 'border-purple-500 bg-purple-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="comboType"
                  value="DTH"
                  checked={formData.upgradeType === 'DTH'}
                  onChange={(e) => handleInputChange('upgradeType', e.target.value)}
                  className="text-purple-500"
                />
                <div className="flex items-center gap-2">
                  <Tv className="h-6 w-6 text-purple-600" />
                  <span className="font-medium text-lg">DTH</span>
                </div>
                <span className="text-sm text-gray-600 text-center">
                  {formData.sourceService === 'fibernet' ? 'Internet + DTH Service' : 'Enhanced DTH Package'}
                </span>
              </label>
            </div>
            
            {/* Explanation based on source service */}
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <div className="text-sm text-blue-800">
                <div className="font-medium mb-2">
                  Converting from {formData.sourceService === 'dishhome' ? 'DishHome' : 'Fibernet'}:
                </div>
                <div className="text-xs space-y-1">
                  <div>• <strong>ITV:</strong> {formData.sourceService === 'dishhome' ? 'Keep your DishHome service + Add Internet connection' : 'Keep your Internet connection + Add TV service'}</div>
                  <div>• <strong>DTH:</strong> {formData.sourceService === 'fibernet' ? 'Keep your Internet connection + Add DTH service' : 'Upgrade to enhanced DTH package with additional features'}</div>
                </div>
              </div>
            </div>
            
            {errors.upgradeType && (
              <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-700 text-sm">{errors.upgradeType}</p>
              </div>
            )}
          </div>
        )}

        {/* Combo Type Selection - Show for new customers (no existing customer IDs) */}
        {!isUpgrade && !formData.dishhomeId && !formData.fibernetId && (
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Package2 className="h-5 w-5 mr-2 text-purple-600" />
              Choose Combo Type
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className={`flex flex-col items-center space-y-3 cursor-pointer p-4 border-2 rounded-lg transition-all ${
                formData.upgradeType === 'ITV' 
                  ? 'border-purple-500 bg-purple-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="newComboType"
                  value="ITV"
                  checked={formData.upgradeType === 'ITV'}
                  onChange={(e) => handleInputChange('upgradeType', e.target.value)}
                  className="text-purple-500"
                />
                <div className="flex items-center gap-2">
                  <Wifi className="h-6 w-6 text-purple-600" />
                  <span className="font-medium text-lg">ITV</span>
                </div>
                <span className="text-sm text-gray-600 text-center">
                  Internet + Interactive TV Service
                </span>
              </label>
              
              <label className={`flex flex-col items-center space-y-3 cursor-pointer p-4 border-2 rounded-lg transition-all ${
                formData.upgradeType === 'DTH' 
                  ? 'border-purple-500 bg-purple-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="newComboType"
                  value="DTH"
                  checked={formData.upgradeType === 'DTH'}
                  onChange={(e) => handleInputChange('upgradeType', e.target.value)}
                  className="text-purple-500"
                />
                <div className="flex items-center gap-2">
                  <Tv className="h-6 w-6 text-purple-600" />
                  <span className="font-medium text-lg">DTH</span>
                </div>
                <span className="text-sm text-gray-600 text-center">
                  Direct-to-Home TV Service
                </span>
              </label>
            </div>
            
            {/* New Customer Information */}
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <div className="text-sm text-blue-800">
                <div className="font-medium mb-2">
                  Creating New Combo Customer:
                </div>
                <div className="text-xs space-y-1">
                  <div>• <strong>ITV:</strong> Comprehensive package with high-speed internet and interactive TV services</div>
                  <div>• <strong>DTH:</strong> Premium direct-to-home television service with multiple channels</div>
                </div>
              </div>
            </div>
            
            {errors.upgradeType && (
              <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-700 text-sm">{errors.upgradeType}</p>
              </div>
            )}
          </div>
        )}

        {errors.customerIds && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-700 text-sm">{errors.customerIds}</p>
          </div>
        )}

        {errors.customerInfo && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-700 text-sm">{errors.customerInfo}</p>
          </div>
        )}

        {/* Combo Details Section */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Package2 className="h-5 w-5 mr-2 text-green-600" />
            Combo Package Details
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Total Price */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Banknote className="h-4 w-4 inline mr-1 text-green-600" />
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
              <p className="text-xs text-gray-500 mt-1">Combined price for both services</p>
            </div>

            {/* Month */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4 inline mr-1 text-blue-600" />
                Month *
              </label>
              <input
                type="number"
                min="1"
                value={formData.month}
                onChange={(e) => handleInputChange('month', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                  errors.month ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Enter month number"
              />
              {errors.month && <p className="text-red-500 text-xs mt-1">{errors.month}</p>}
              <p className="text-xs text-gray-500 mt-1">Billing month (can be more than 12 for multi-year packages)</p>
            </div>
          </div>
        </div>

        {/* Contact Information Section */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Phone className="h-5 w-5 mr-2 text-purple-600" />
            Contact Information
          </h3>
          
          {/* Customer Name - Full Width */}
          <div className="mb-4">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="h-4 w-4 inline mr-1 text-blue-600" />
                Customer Name *
              </label>
              <input
                type="text"
                value={formData.customerName}
                onChange={(e) => handleInputChange('customerName', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                  errors.customerName ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Enter customer full name"
              />
              {errors.customerName && <p className="text-red-500 text-xs mt-1">{errors.customerName}</p>}
              <p className="text-xs text-gray-500 mt-1">Full name of the customer</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Phone Number */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="h-4 w-4 inline mr-1 text-purple-600" />
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
              <p className="text-xs text-gray-500 mt-1">Primary contact number</p>
            </div>

            {/* CAS ID */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Hash className="h-4 w-4 inline mr-1 text-gray-600" />
                CAS ID
              </label>
              <input
                type="text"
                value={formData.casId}
                onChange={(e) => handleInputChange('casId', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="Enter CAS ID (optional)"
              />
              <p className="text-xs text-gray-500 mt-1">Customer authentication system ID</p>
            </div>
          </div>

          {/* Customer Address - Full Width */}
          <div className="mt-4">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="h-4 w-4 inline mr-1 text-red-600" />
                Customer Address *
              </label>
              <textarea
                value={formData.customerAddress}
                onChange={(e) => handleInputChange('customerAddress', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none ${
                  errors.customerAddress ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Enter complete customer address"
                rows="3"
              />
              {errors.customerAddress && <p className="text-red-500 text-xs mt-1">{errors.customerAddress}</p>}
              <p className="text-xs text-gray-500 mt-1">Complete address including area, city, and landmarks</p>
            </div>
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
