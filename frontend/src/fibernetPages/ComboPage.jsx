import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import ComboSidebar from '../components/ComboSidebar';
import RsIcon from '../components/RsIcon';
import Swal from 'sweetalert2';
import { dataRefreshEmitter } from '../hooks/useDataRefresh';
import { 
  Package2, 
  Plus, 
  List, 
  Edit, 
  Search, 
  Trash2,
  User,
  Activity,
  Tv,
  Wifi,
  Users,
  Hash
} from 'lucide-react';

const ComboPage = () => {
  const [combos, setCombos] = useState([]);
  const [dishhomeCustomers, setDishhomeCustomers] = useState([]);
  const [fibernetCustomers, setFibernetCustomers] = useState([]);
  const [filteredCombos, setFilteredCombos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCombo, setEditingCombo] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    dishhomeId: '',
    fibernetId: '',
    totalPrice: '',
    status: 1
  });

  // Filter combos based on search
  useEffect(() => {
    let filtered = combos;

    if (searchTerm.trim()) {
      filtered = filtered.filter(combo => {
        const dishhomeCustomer = dishhomeCustomers.find(c => c.customerId === combo.dishhomeId);
        const fibernetCustomer = fibernetCustomers.find(c => c.customerId === combo.fibernetId);
        
        return (
          combo.comboId.toString().includes(searchTerm) ||
          combo.totalPrice.toString().includes(searchTerm) ||
          combo.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (dishhomeCustomer && dishhomeCustomer.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (fibernetCustomer && fibernetCustomer.name.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      });
    }

    setFilteredCombos(filtered);
  }, [combos, searchTerm, dishhomeCustomers, fibernetCustomers]);

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [comboRes, dishhomeRes, fibernetRes] = await Promise.all([
        axios.get('/Dhfibernet/list'),
        axios.get('/dishhome/list'),
        axios.get('/fibernet/list')
      ]);
      
      setCombos(comboRes.data.data);
      setDishhomeCustomers(dishhomeRes.data.data);
      setFibernetCustomers(fibernetRes.data.data);
    } catch (err) {
      console.error("Error fetching data", err);
      Swal.fire({
        icon: 'error',
        title: 'Error Loading Data',
        text: 'Failed to load combo data. Please try again.',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.dishhomeId || !formData.fibernetId || !formData.totalPrice) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Please fill in all fields',
        confirmButtonColor: '#f59e0b'
      });
      return;
    }

    if (parseFloat(formData.totalPrice) <= 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Price',
        text: 'Total price must be greater than 0',
        confirmButtonColor: '#f59e0b'
      });
      return;
    }

    try {
      if (editingCombo) {
        await axios.put(`/Dhfibernet/update/${editingCombo.comboId}`, formData);
        Swal.fire({
          icon: 'success',
          title: 'Combo Updated!',
          text: 'Combo has been updated successfully.',
          confirmButtonColor: '#10b981'
        });
      } else {
        await axios.post('/Dhfibernet/create', formData);
        Swal.fire({
          icon: 'success',
          title: 'Combo Created!',
          text: 'New combo has been created successfully.',
          confirmButtonColor: '#10b981'
        });
      }

      setFormData({
        dishhomeId: '',
        fibernetId: '',
        totalPrice: '',
        status: 1
      });
      setShowAddForm(false);
      setEditingCombo(null);
      fetchData();
      dataRefreshEmitter.emit('dataChanged');
    } catch (err) {
      console.error('Error saving combo:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.response?.data?.message || 'Failed to save combo. Please try again.',
        confirmButtonColor: '#ef4444'
      });
    }
  };

  // Handle edit
  const handleEdit = (combo) => {
    setFormData({
      dishhomeId: combo.dishhomeId.toString(),
      fibernetId: combo.fibernetId.toString(),
      totalPrice: combo.totalPrice.toString(),
      status: combo.status
    });
    setEditingCombo(combo);
    setShowAddForm(true);
  };

  // Handle delete
  const handleDelete = async (comboId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`/Dhfibernet/delete/${comboId}`);
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Combo has been deleted.',
          confirmButtonColor: '#10b981'
        });
        fetchData();
        dataRefreshEmitter.emit('dataChanged');
      } catch (err) {
        console.error('Error deleting combo:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to delete combo. Please try again.',
          confirmButtonColor: '#ef4444'
        });
      }
    }
  };

  // Cancel form
  const handleCancel = () => {
    setFormData({
      dishhomeId: '',
      fibernetId: '',
      totalPrice: '',
      status: 1
    });
    setShowAddForm(false);
    setEditingCombo(null);
  };

  // Get customer name by ID
  const getCustomerName = (customers, customerId) => {
    const customer = customers.find(c => c.customerId === customerId);
    return customer ? customer.name : 'Unknown Customer';
  };

  // Get customer details by ID
  const getCustomerDetails = (customers, customerId) => {
    return customers.find(c => c.customerId === customerId);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="flex">
      <ComboSidebar />
      <main className="flex-1 ml-72 p-6 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Package2 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Combo Packages</h1>
                <p className="text-sm text-gray-500">Manage dishhome + fibernet combo customers</p>
              </div>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Create Combo</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search combos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Add/Edit Form */}
          {showAddForm && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {editingCombo ? 'Edit Combo' : 'Create New Combo'}
              </h2>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dishhome Customer</label>
                  <select
                    value={formData.dishhomeId}
                    onChange={(e) => setFormData({...formData, dishhomeId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Select Dishhome Customer</option>
                    {dishhomeCustomers.map(customer => (
                      <option key={customer.customerId} value={customer.customerId}>
                        {customer.name} - {customer.phoneNumber}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fibernet Customer</label>
                  <select
                    value={formData.fibernetId}
                    onChange={(e) => setFormData({...formData, fibernetId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Select Fibernet Customer</option>
                    {fibernetCustomers.map(customer => (
                      <option key={customer.customerId} value={customer.customerId}>
                        {customer.name} - {customer.phoneNumber}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.totalPrice}
                    onChange={(e) => setFormData({...formData, totalPrice: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Combo price"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value={1}>Active</option>
                    <option value={0}>Inactive</option>
                  </select>
                </div>

                <div className="md:col-span-2 flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors"
                  >
                    {editingCombo ? 'Update Combo' : 'Create Combo'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Combos Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <List className="h-5 w-5 mr-2 text-green-600" />
                Combo Packages ({filteredCombos.length})
              </h3>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              </div>
            ) : filteredCombos.length === 0 ? (
              <div className="text-center py-12">
                <Package2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No combo packages found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center">
                          <Hash className="h-4 w-4 mr-1" />
                          Combo ID
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center">
                          <Tv className="h-4 w-4 mr-1" />
                          Dishhome Customer
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center">
                          <Wifi className="h-4 w-4 mr-1" />
                          Fibernet Customer
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center">
                          <RsIcon className="h-4 w-4 mr-1" />
                          Total Price
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center">
                          <Activity className="h-4 w-4 mr-1" />
                          Status
                        </div>
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredCombos.map((combo) => {
                      const dishhomeCustomer = getCustomerDetails(dishhomeCustomers, combo.dishhomeId);
                      const fibernetCustomer = getCustomerDetails(fibernetCustomers, combo.fibernetId);
                      
                      return (
                        <tr key={combo.comboId} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            #{combo.comboId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {dishhomeCustomer ? dishhomeCustomer.name : 'Unknown'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {dishhomeCustomer ? dishhomeCustomer.phoneNumber : 'N/A'}
                              </div>
                              <div className="text-xs text-purple-600">
                                {dishhomeCustomer ? dishhomeCustomer.package : 'N/A'}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {fibernetCustomer ? fibernetCustomer.name : 'Unknown'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {fibernetCustomer ? fibernetCustomer.phoneNumber : 'N/A'}
                              </div>
                              <div className="text-xs text-blue-600">
                                {fibernetCustomer ? fibernetCustomer.package : 'N/A'}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              Rs. {combo.totalPrice}
                            </div>
                            {dishhomeCustomer && fibernetCustomer && (
                              <div className="text-xs text-gray-500">
                                Individual: Rs. {(parseFloat(dishhomeCustomer.price) + parseFloat(fibernetCustomer.price)).toFixed(2)}
                                <br />
                                <span className={`${combo.totalPrice < (parseFloat(dishhomeCustomer.price) + parseFloat(fibernetCustomer.price)) ? 'text-green-600' : 'text-red-600'}`}>
                                  Savings: Rs. {(parseFloat(dishhomeCustomer.price) + parseFloat(fibernetCustomer.price) - combo.totalPrice).toFixed(2)}
                                </span>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              combo.status === 1 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {combo.status === 1 ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => handleEdit(combo)}
                                className="text-indigo-600 hover:text-indigo-900 p-1 rounded"
                                title="Edit"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(combo.comboId)}
                                className="text-red-600 hover:text-red-900 p-1 rounded"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
    </div>
  );
};

export default ComboPage;
