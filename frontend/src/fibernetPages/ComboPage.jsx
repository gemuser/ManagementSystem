import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from '../api/axios';
import ComboSidebar from '../components/ComboSidebar';
import ComboCustomerForm from '../components/ComboCustomerForm';
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
  Hash,
  FileText,
  MapPin
} from 'lucide-react';

const ComboPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [combos, setCombos] = useState([]);
  const [dishhomeCustomers, setDishhomeCustomers] = useState([]);
  const [fibernetCustomers, setFibernetCustomers] = useState([]);
  const [filteredCombos, setFilteredCombos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCombo, setEditingCombo] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  
  // Determine initial tab based on route
  const getInitialTab = () => {
    if (location.pathname.includes('/combo/dth')) return 'DTH';
    if (location.pathname.includes('/combo/itv')) return 'ITV';
    if (location.pathname.includes('/combo/all')) return 'ALL';
    if (location.pathname === '/combo') return 'ALL';
    return 'ALL';
  };
  
  const [activeTab, setActiveTab] = useState(getInitialTab());
  
  // Update tab when route changes
  useEffect(() => {
    const newTab = location.pathname.includes('/combo/dth') ? 'DTH' : 
                   location.pathname.includes('/combo/itv') ? 'ITV' :
                   location.pathname.includes('/combo/all') ? 'ALL' :
                   location.pathname === '/combo' ? 'ALL' : 'ALL';
    setActiveTab(newTab);
  }, [location.pathname]);

  // Filter combos based on search and active tab
  useEffect(() => {
    let filtered = combos;

    // Filter by active tab first
    if (activeTab === 'DTH') {
      // DTH customers: those with upgradeType 'DTH' OR those with only dishhomeId
      filtered = filtered.filter(combo => 
        combo.upgradeType === 'DTH' || 
        (combo.dishhomeId && combo.dishhomeId !== null && !combo.upgradeType)
      );
    } else if (activeTab === 'ITV') {
      // ITV customers: those with upgradeType 'ITV' OR those with only fibernetId  
      filtered = filtered.filter(combo => 
        combo.upgradeType === 'ITV' || 
        (combo.fibernetId && combo.fibernetId !== null && !combo.upgradeType)
      );
    }
    // For 'ALL' tab, show all combos (no filtering)

    // Then filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(combo => {
        const dishhomeCustomer = dishhomeCustomers.find(c => c.customerId === combo.dishhomeId);
        const fibernetCustomer = fibernetCustomers.find(c => c.customerId === combo.fibernetId);
        
        return (
          combo.comboId?.toString().includes(searchTerm) ||
          combo.totalPrice?.toString().includes(searchTerm) ||
          combo.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          combo.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          combo.phoneNumber?.includes(searchTerm) ||
          (dishhomeCustomer && dishhomeCustomer.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (fibernetCustomer && fibernetCustomer.name.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      });
    }

    setFilteredCombos(filtered);
  }, [combos, searchTerm, dishhomeCustomers, fibernetCustomers, activeTab]);

  // Get counts for each tab
  const allCount = combos.length;
  const dthCount = combos.filter(combo => 
    combo.upgradeType === 'DTH' || 
    (combo.dishhomeId && combo.dishhomeId !== null && !combo.upgradeType)
  ).length;
  const itvCount = combos.filter(combo => 
    combo.upgradeType === 'ITV' || 
    (combo.fibernetId && combo.fibernetId !== null && !combo.upgradeType)
  ).length;

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [comboRes, dishhomeRes, fibernetRes] = await Promise.all([
        axios.get('/Dhfibernet/list'),
        axios.get('/dishhome/list'),
        axios.get('/fibernet/list')
      ]);
      
      setCombos(comboRes.data.data || []);
      setDishhomeCustomers(dishhomeRes.data.data || []);
      setFibernetCustomers(fibernetRes.data.data || []);
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

  // Load data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Handle upgrade navigation - check if user is coming from upgrade action
  useEffect(() => {
    if (location.state?.upgradeData) {
      setShowAddForm(true);
      // Scroll to the form
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    }
  }, [location.state]);

  // Handle form submission (both add and edit)
  const handleFormSubmit = async (formData) => {
    setFormLoading(true);
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

      setShowAddForm(false);
      setEditingCombo(null);
      fetchData();
      dataRefreshEmitter.emit('dataChanged');
      // Clear the location state after successful submission
      if (location.state?.upgradeData) {
        navigate(location.pathname, { replace: true, state: {} });
      }
    } catch (err) {
      console.error('Error saving combo:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.response?.data?.message || 'Failed to save combo. Please try again.',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setFormLoading(false);
    }
  };

  // Cancel form
  const handleFormCancel = () => {
    setShowAddForm(false);
    setEditingCombo(null);
    // Clear the location state to prevent re-opening the form
    if (location.state?.upgradeData) {
      navigate(location.pathname, { replace: true, state: {} });
    }
  };

  // Handle edit
  const handleEdit = (combo) => {
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

  // Handle bill generation
  const handleGenerateBill = async (combo) => {
    try {
      const response = await axios.get(`/combo-bill/generate/${combo.comboId}`, {
        responseType: 'blob' // Important for PDF download
      });

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename
      const customerName = (combo.customerName || 'combo-customer').replace(/\s+/g, '-');
      const timestamp = new Date().toISOString().split('T')[0];
      link.setAttribute('download', `combo-bill-${customerName}-${combo.comboId}-${timestamp}.pdf`);
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      Swal.fire({
        icon: 'success',
        title: 'Bill Generated!',
        text: `Bill for ${combo.customerName || 'Combo Customer'} has been generated and downloaded.`,
        confirmButtonColor: '#10b981'
      });

    } catch (error) {
      console.error('Error generating bill:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to generate bill. Please try again.',
        confirmButtonColor: '#ef4444'
      });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getServiceType = () => {
    if (location.pathname.includes('/combo/dth')) return 'dth';
    if (location.pathname.includes('/combo/itv')) return 'itv';
    return 'general';
  };

  return (
    <div className="flex">
      <ComboSidebar serviceType={getServiceType()} />
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

          {/* Filter Tabs */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <Link
                  to="/combo"
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'ALL'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  All Combos ({allCount})
                </Link>
                <Link
                  to="/combo/dth"
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === 'DTH'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Tv className="h-4 w-4 mr-1" />
                  DTH Customers ({dthCount})
                </Link>
                <Link
                  to="/combo/itv"
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === 'ITV'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Wifi className="h-4 w-4 mr-1" />
                  ITV Customers ({itvCount})
                </Link>
              </nav>
            </div>
          </div>

          {/* Add/Edit Form */}
          {showAddForm && (
            <div className="mb-6">
              <ComboCustomerForm
                initialData={editingCombo}
                onSubmit={handleFormSubmit}
                onCancel={handleFormCancel}
                loading={formLoading}
                isUpgrade={!!location.state?.upgradeData}
                upgradeData={location.state?.upgradeData}
              />
            </div>
          )}

          {/* Combos Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <List className="h-5 w-5 mr-2 text-green-600" />
                {activeTab === 'ALL' && `All Combo Packages (${filteredCombos.length})`}
                {activeTab === 'DTH' && `DTH Customers (${filteredCombos.length})`}
                {activeTab === 'ITV' && `ITV Customers (${filteredCombos.length})`}
              </h3>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              </div>
            ) : filteredCombos.length === 0 ? (
              <div className="text-center py-12">
                <Package2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  {activeTab === 'ALL' && 'No combo packages found'}
                  {activeTab === 'DTH' && 'No DTH customers found'}
                  {activeTab === 'ITV' && 'No ITV customers found'}
                </p>
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
                      return (
                        <tr key={combo.comboId} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            #{combo.comboId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {combo.customerName || 'Unknown Customer'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {combo.phoneNumber || 'N/A'}
                              </div>
                              {combo.dishhomeId && (
                                <div className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded mt-1 inline-block">
                                  DTH ID: {combo.dishhomeId} • {combo.dishhomePackage || 'Standard Package'}
                                </div>
                              )}
                              {combo.upgradeType && (
                                <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded mt-1 inline-block">
                                  {combo.upgradeType} • From {combo.sourceService || 'N/A'}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {combo.customerName || 'Unknown Customer'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {combo.phoneNumber || 'N/A'}
                              </div>
                              {combo.fibernetId && (
                                <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded mt-1 inline-block">
                                  ITV ID: {combo.fibernetId} • {combo.fibernetPackage || 'Standard Package'}
                                </div>
                              )}
                              {combo.customerAddress && (
                                <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {combo.customerAddress}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              Rs. {combo.totalPrice}
                            </div>
                            {combo.month && (
                              <div className="text-xs text-gray-500">
                                Valid till: {combo.month}
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
                                onClick={() => handleGenerateBill(combo)}
                                className="text-green-600 hover:text-green-900 p-1 rounded"
                                title="Generate Bill"
                              >
                                <FileText className="h-4 w-4" />
                              </button>
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
