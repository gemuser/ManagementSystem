import React, { useState } from 'react';
import { ArrowUp, Users, Search, ArrowRight, Tv, Wifi, Package2 } from 'lucide-react';
import axios from '../api/axios';
import Swal from 'sweetalert2';

const UpgradeToComboButton = ({ 
  customer = null, // Optional customer object to pre-fill data
  sourceService = 'dishhome', // 'dishhome' or 'fibernet'
  onUpgradeSuccess = () => {},
  className = ''
}) => {
  const [showModal, setShowModal] = useState(false);
  const [customerId, setCustomerId] = useState('');
  const [customerData, setCustomerData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: lookup, 2: selection, 3: confirm
  const [selectedOption, setSelectedOption] = useState('');
  const [comboData, setComboData] = useState({
    totalPrice: '',
    month: new Date().toISOString().slice(0, 7) // Default to current month in YYYY-MM format
  });

  const resetModal = () => {
    setShowModal(false);
    setCustomerId(customer ? customer.customerId : '');
    setCustomerData(customer || null);
    setStep(customer ? 2 : 1); // Skip lookup if customer is provided
    setSelectedOption('');
    setComboData({ 
      totalPrice: '', 
      month: new Date().toISOString().slice(0, 7) // Reset to current month
    });
  };

  // Initialize with customer data if provided
  React.useEffect(() => {
    if (customer) {
      setCustomerId(customer.customerId);
      setCustomerData(customer);
      setStep(2); // Skip lookup step
      // Don't auto-set option - let user choose for both services
    }
  }, [customer, sourceService]);

  const handleCustomerLookup = async () => {
    if (!customerId.trim()) {
      Swal.fire('Error', 'Please enter a Customer ID', 'error');
      return;
    }

    setLoading(true);
    try {
      const endpoint = sourceService === 'dishhome' ? '/dishhome/list' : '/fibernet/list';
      const response = await axios.get(endpoint);
      
      if (response.data.success) {
        const customer = response.data.data.find(c => 
          c.customerId.toString() === customerId.toString()
        );
        
        if (customer) {
          setCustomerData(customer);
          setStep(2);
          // Don't auto-set option - let user choose
        } else {
          Swal.fire('Error', 'Customer not found', 'error');
        }
      }
    } catch (error) {
      console.error('Error fetching customer:', error);
      Swal.fire('Error', 'Failed to fetch customer details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleNextStep = () => {
    if (step === 2) {
      if (!selectedOption) {
        Swal.fire('Error', 'Please select combo type (DTH or ITV)', 'error');
        return;
      }
      setStep(3);
    }
  };

  const handleUpgrade = async () => {
    if (!comboData.totalPrice || !comboData.month) {
      Swal.fire('Error', 'Please fill in all combo details', 'error');
      return;
    }

    setLoading(true);
    try {
      // Create combo entry
      const comboPayload = {
        dishhomeId: sourceService === 'dishhome' ? customerData.customerId : '',
        fibernetId: sourceService === 'fibernet' ? customerData.customerId : '',
        totalPrice: parseFloat(comboData.totalPrice),
        month: comboData.month,
        upgradeType: selectedOption, // Use selected option for both services
        sourceService: sourceService,
        customerName: customerData.name, // Explicitly pass customer name
        customerAddress: customerData.address, // Pass customer address
        phoneNumber: customerData.phoneNumber, // Pass phone number
        casId: customerData.casId || null, // Pass CAS ID if available
        status: 1, // Set as active
        dishhomePackage: sourceService === 'dishhome' ? customerData.package : `${selectedOption} TV Service`,
        fibernetPackage: sourceService === 'fibernet' ? customerData.package : `${selectedOption} Internet Service`
      };

      await axios.post('/Dhfibernet/create', comboPayload);

      // Remove customer from original service
      const deleteEndpoint = sourceService === 'dishhome' 
        ? `/dishhome/delete/${customerData.customerId}` 
        : `/fibernet/delete/${customerData.customerId}`;
      
      await axios.delete(deleteEndpoint);

      Swal.fire('Success', 'Customer successfully upgraded to Combo Plan!', 'success');
      onUpgradeSuccess();
      resetModal();
    } catch (error) {
      console.error('Error upgrading customer:', error);
      Swal.fire('Error', 'Failed to upgrade customer', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={customer ? 
          `text-blue-600 hover:text-blue-800 p-1 rounded transition-colors ${className}` :
          `bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2 transition-colors ${className}`
        }
        title={customer ? "Upgrade to Combo" : undefined}
      >
        <ArrowUp className="h-4 w-4" />
        {!customer && <span>Upgrade to Combo</span>}
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Upgrade to Combo Plan
              </h2>
              <button
                onClick={resetModal}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {/* Step 1: Customer Lookup */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                  <Users className="h-4 w-4" />
                  <span>Upgrading from {sourceService === 'dishhome' ? 'DishHome' : 'Fibernet'}</span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer ID
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customerId}
                      onChange={(e) => setCustomerId(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter Customer ID"
                    />
                    <button
                      onClick={handleCustomerLookup}
                      disabled={loading}
                      className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
                    >
                      <Search className="h-4 w-4" />
                      {loading ? 'Searching...' : 'Find'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Customer Details & Selection */}
            {step === 2 && customerData && (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">Customer Details</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">ID:</span> {customerData.customerId}</div>
                    <div><span className="font-medium">Name:</span> {customerData.name}</div>
                    <div><span className="font-medium">Phone:</span> {customerData.phoneNumber}</div>
                    <div><span className="font-medium">Package:</span> {customerData.package}</div>
                    <div><span className="font-medium">Price:</span> Rs. {customerData.price}</div>
                  </div>
                </div>

                {/* Combo Type Selection - Show for both services */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Select Combo Type *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className={`flex flex-col items-center space-y-2 cursor-pointer p-4 border-2 rounded-lg transition-all ${
                      selectedOption === 'ITV' 
                        ? 'border-purple-500 bg-purple-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <input
                        type="radio"
                        name="comboType"
                        value="ITV"
                        checked={selectedOption === 'ITV'}
                        onChange={(e) => setSelectedOption(e.target.value)}
                        className="text-purple-500"
                      />
                      <div className="flex items-center gap-2">
                        <Wifi className="h-5 w-5 text-purple-600" />
                        <span className="font-medium">ITV</span>
                      </div>
                      <span className="text-xs text-gray-600 text-center">
                        {sourceService === 'dishhome' ? 'DishHome + Internet' : 'Internet + TV'}
                      </span>
                    </label>
                    <label className={`flex flex-col items-center space-y-2 cursor-pointer p-4 border-2 rounded-lg transition-all ${
                      selectedOption === 'DTH' 
                        ? 'border-purple-500 bg-purple-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <input
                        type="radio"
                        name="comboType"
                        value="DTH"
                        checked={selectedOption === 'DTH'}
                        onChange={(e) => setSelectedOption(e.target.value)}
                        className="text-purple-500"
                      />
                      <div className="flex items-center gap-2">
                        <Tv className="h-5 w-5 text-purple-600" />
                        <span className="font-medium">DTH</span>
                      </div>
                      <span className="text-xs text-gray-600 text-center">
                        {sourceService === 'fibernet' ? 'Fibernet + DTH' : 'Direct-to-Home'}
                      </span>
                    </label>
                  </div>
                  
                  {/* Explanation based on source service */}
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <div className="text-sm text-blue-800">
                      <div className="font-medium mb-1">
                        Converting from {sourceService === 'dishhome' ? 'DishHome' : 'Fibernet'}:
                      </div>
                      <div className="text-xs space-y-1">
                        <div>• <strong>ITV:</strong> {sourceService === 'dishhome' ? 'Keep DishHome + Add Internet' : 'Keep Internet + Add TV service'}</div>
                        <div>• <strong>DTH:</strong> {sourceService === 'fibernet' ? 'Keep Internet + Add DTH service' : 'Enhanced DTH package'}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleNextStep}
                  className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2"
                >
                  <span>Next</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Step 3: Combo Details */}
            {step === 3 && customerData && (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">Combo Plan Details</h3>
                  <div className="text-sm text-gray-600">
                    <div>Customer: {customerData.name}</div>
                    <div>Type: {selectedOption || 'DTH'}</div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Combo Price *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500">Rs.</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={comboData.totalPrice}
                      onChange={(e) => setComboData(prev => ({ ...prev, totalPrice: e.target.value }))}
                      className="w-full pl-12 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Previous price: Rs. {customerData.price}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Month
                  </label>
                  <div className="space-y-2">
                    <input
                      type="month"
                      value={comboData.month}
                      onChange={(e) => setComboData(prev => ({ ...prev, month: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <div className="text-xs text-gray-500">
                      Current selection: {comboData.month ? new Date(comboData.month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'None'}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setStep(2)}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleUpgrade}
                    disabled={loading}
                    className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-lg disabled:opacity-50"
                  >
                    {loading ? 'Upgrading...' : 'Complete Upgrade'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default UpgradeToComboButton;
