import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import ImprovedCustomerForm from '../components/ImprovedCustomerForm';
import Swal from 'sweetalert2';
import { dataRefreshEmitter } from '../hooks/useDataRefresh';
import { 
  Wifi, 
  Plus, 
  Users, 
  Search, 
  Filter,
  Edit, 
  Trash2,
  Activity,
  Phone,
  MapPin,
  Package,
  Calendar,
  Banknote,
  ArrowLeft,
  Eye,
  Download,
  RefreshCw,
  Signal,
  BarChart3
} from 'lucide-react';

const FibernetDashboard = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formLoading, setFormLoading] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeCustomers: 0,
    inactiveCustomers: 0,
    totalRevenue: 0
  });

  // Filter customers based on search and status
  useEffect(() => {
    let filtered = customers;

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(customer =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phoneNumber.includes(searchTerm) ||
        customer.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.package.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(customer => 
        customer.status === (statusFilter === 'active' ? 1 : 0)
      );
    }

    setFilteredCustomers(filtered);
  }, [customers, searchTerm, statusFilter]);

  // Calculate stats
  useEffect(() => {
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter(c => c.status === 1).length;
    const inactiveCustomers = customers.filter(c => c.status === 0).length;
    const totalRevenue = customers
      .filter(c => c.status === 1)
      .reduce((sum, c) => sum + parseFloat(c.price || 0), 0);

    setStats({
      totalCustomers,
      activeCustomers,
      inactiveCustomers,
      totalRevenue
    });
  }, [customers]);

  // Fetch customers
  const getCustomers = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/fibernet/list');
      setCustomers(res.data.data || []);
    } catch (err) {
      console.error("Error fetching customers", err);
      Swal.fire({
        icon: 'error',
        title: 'Error Loading Customers',
        text: 'Failed to load fibernet customers. Please try again.',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleFormSubmit = async (formData) => {
    try {
      setFormLoading(true);
      
      // Remove casId for fibernet (not required)
      // eslint-disable-next-line no-unused-vars
      const { casId, ...fibernetData } = formData;
      
      if (editingCustomer) {
        await axios.put(`/fibernet/update/${editingCustomer.customerId}`, fibernetData);
        Swal.fire({
          icon: 'success',
          title: 'Customer Updated!',
          text: 'Customer information has been updated successfully.',
          confirmButtonColor: '#10b981',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        await axios.post('/fibernet/create', fibernetData);
        Swal.fire({
          icon: 'success',
          title: 'Customer Added!',
          text: 'New fibernet customer has been added successfully.',
          confirmButtonColor: '#10b981',
          timer: 2000,
          showConfirmButton: false
        });
      }

      setShowAddForm(false);
      setEditingCustomer(null);
      getCustomers();
      dataRefreshEmitter.emit('dataChanged');
    } catch (err) {
      console.error('Error saving customer:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.response?.data?.message || 'Failed to save customer. Please try again.',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setFormLoading(false);
    }
  };

  // Handle edit
  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setShowAddForm(true);
  };

  // Handle delete
  const handleDelete = async (customerId) => {
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
        await axios.delete(`/fibernet/delete/${customerId}`);
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Customer has been deleted.',
          confirmButtonColor: '#10b981',
          timer: 2000,
          showConfirmButton: false
        });
        getCustomers();
        dataRefreshEmitter.emit('dataChanged');
      } catch (err) {
        console.error('Error deleting customer:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to delete customer. Please try again.',
          confirmButtonColor: '#ef4444'
        });
      }
    }
  };

  // Generate invoice for Fibernet customer
  const generateInvoice = async (customer) => {
    try {
      const { value: formValues } = await Swal.fire({
        title: 'Generate Fibernet Invoice',
        html: `
          <div class="space-y-4 text-left">
            <div class="bg-blue-50 p-4 rounded-lg mb-4">
              <h4 class="font-medium text-blue-800 mb-2">Customer Information</h4>
              <p><strong>Name:</strong> ${customer.name}</p>
              <p><strong>Package:</strong> ${customer.package}</p>
              <p><strong>Monthly Rate:</strong> Rs. ${customer.price}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Billing Months *</label>
              <input id="monthsBilled" class="swal2-input w-full" type="number" min="1" max="12" value="1" placeholder="Number of months to bill">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
              <select id="discountType" class="swal2-input w-full">
                <option value="none">No Discount</option>
                <option value="percentage">Percentage Discount</option>
                <option value="amount">Fixed Amount Discount</option>
              </select>
            </div>
            <div id="discountField" style="display: none;">
              <label id="discountLabel" class="block text-sm font-medium text-gray-700 mb-1">Discount</label>
              <input id="discountValue" class="swal2-input w-full" type="number" min="0" step="0.01" placeholder="Enter discount value">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input id="dueDate" class="swal2-input w-full" type="date" value="${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
              <textarea id="notes" class="swal2-input w-full" placeholder="Any additional notes" rows="3"></textarea>
            </div>
          </div>
        `,
        showCancelButton: true,
        confirmButtonColor: '#0066cc',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Generate Invoice',
        cancelButtonText: 'Cancel',
        didOpen: () => {
          const discountType = document.getElementById('discountType');
          const discountField = document.getElementById('discountField');
          const discountLabel = document.getElementById('discountLabel');
          const discountValue = document.getElementById('discountValue');

          discountType.addEventListener('change', (e) => {
            if (e.target.value === 'none') {
              discountField.style.display = 'none';
            } else {
              discountField.style.display = 'block';
              discountLabel.textContent = e.target.value === 'percentage' ? 'Discount (%)' : 'Discount Amount (Rs.)';
              discountValue.placeholder = e.target.value === 'percentage' ? 'Enter percentage (0-100)' : 'Enter amount';
              discountValue.max = e.target.value === 'percentage' ? '100' : '';
            }
          });
        },
        preConfirm: () => {
          const monthsBilled = parseInt(document.getElementById('monthsBilled').value);
          const discountType = document.getElementById('discountType').value;
          const discountValue = parseFloat(document.getElementById('discountValue').value) || 0;
          const dueDate = document.getElementById('dueDate').value;
          const notes = document.getElementById('notes').value;

          if (!monthsBilled || monthsBilled < 1) {
            Swal.showValidationMessage('Please enter valid billing months (1-12)');
            return false;
          }

          if (discountType === 'percentage' && discountValue > 100) {
            Swal.showValidationMessage('Percentage discount cannot exceed 100%');
            return false;
          }

          return {
            monthsBilled,
            discountType,
            discountValue,
            dueDate,
            notes
          };
        }
      });

      if (!formValues) return;

      // Show loading
      Swal.fire({
        title: 'Generating Invoice...',
        text: 'Please wait while we create your invoice',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      // Prepare invoice data
      const invoiceData = {
        customerId: customer.customerId,
        monthsBilled: formValues.monthsBilled,
        discountPercentage: formValues.discountType === 'percentage' ? formValues.discountValue : 0,
        discountAmount: formValues.discountType === 'amount' ? formValues.discountValue : 0,
        dueDate: formValues.dueDate,
        notes: formValues.notes
      };

      // Generate invoice
      const response = await axios.post('/invoices/fibernet/generate', invoiceData);

      if (response.data.success) {
        // Create blob and download PDF
        const pdfData = response.data.pdf;
        const blob = new Blob([Uint8Array.from(atob(pdfData), c => c.charCodeAt(0))], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Fibernet-Invoice-${response.data.data.invoiceNumber}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        Swal.fire({
          icon: 'success',
          title: 'Invoice Generated!',
          html: `
            <p>Invoice <strong>${response.data.data.invoiceNumber}</strong> has been generated successfully.</p>
            <p><strong>Total Amount:</strong> Rs. ${response.data.data.totalAmount}</p>
            <p><strong>Due Date:</strong> ${response.data.data.dueDate}</p>
            <p>The PDF has been downloaded automatically.</p>
          `,
          confirmButtonColor: '#10b981'
        });
      }
    } catch (error) {
      console.error('Error generating invoice:', error);
      Swal.fire({
        icon: 'error',
        title: 'Invoice Generation Failed',
        text: error.response?.data?.message || 'Failed to generate invoice. Please try again.',
        confirmButtonColor: '#ef4444'
      });
    }
  };

  // Handle cancel form
  const handleCancel = () => {
    setShowAddForm(false);
    setEditingCustomer(null);
  };

  // Export customers data
  const handleExport = () => {
    const csvContent = [
      ['Name', 'Phone', 'Package', 'Price', 'Address', 'Status', 'Month'],
      ...filteredCustomers.map(customer => [
        customer.name,
        customer.phoneNumber,
        customer.package,
        customer.price,
        customer.address,
        customer.status === 1 ? 'Active' : 'Inactive',
        customer.month
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fibernet_customers_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  useEffect(() => {
    getCustomers();
  }, []);

  if (showAddForm) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <button
              onClick={handleCancel}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              Back to Dashboard
            </button>
          </div>
          <ImprovedCustomerForm
            onSubmit={handleFormSubmit}
            onCancel={handleCancel}
            initialData={editingCustomer}
            serviceType="fibernet"
            loading={formLoading}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/')}
                className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
              >
                <ArrowLeft className="h-5 w-5 mr-1" />
                Back to Home
              </button>
              <div className="flex items-center">
                <Wifi className="h-8 w-8 text-cyan-600 mr-3" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Fibernet Dashboard</h1>
                  <p className="text-sm text-gray-600">Manage internet service customers</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={getCustomers}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Customer
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-cyan-100 rounded-lg">
                <Users className="h-6 w-6 text-cyan-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCustomers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <Signal className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Connections</p>
                <p className="text-2xl font-bold text-green-600">{stats.activeCustomers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <Activity className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Disconnected</p>
                <p className="text-2xl font-bold text-red-600">{stats.inactiveCustomers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Banknote className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-bold text-blue-600">Rs. {stats.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search customers by name, phone, address, or package..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Filter className="h-4 w-4 mr-2 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                </select>
              </div>
              <button
                onClick={handleExport}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Customers Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-cyan-600" />
              Internet Customers ({filteredCustomers.length})
            </h3>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="text-center py-12">
              <Wifi className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm || statusFilter !== 'all' 
                  ? 'No customers match your search criteria' 
                  : 'No customers found. Add your first customer!'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact Info
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Internet Plan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.customerId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="bg-cyan-100 rounded-full p-2 mr-3">
                            <Wifi className="h-4 w-4 text-cyan-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {customer.address.substring(0, 30)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {customer.phoneNumber}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 flex items-center">
                          <Signal className="h-3 w-3 mr-1" />
                          {customer.package}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Banknote className="h-3 w-3 mr-1" />
                          Rs. {parseFloat(customer.price).toFixed(2)}/mo
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          customer.status === 1
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          <Signal className="h-3 w-3 mr-1" />
                          {customer.status === 1 ? 'Connected' : 'Disconnected'}
                        </span>
                        <div className="text-xs text-gray-500 mt-1 flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {customer.month}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => generateInvoice(customer)}
                            className="text-green-600 hover:text-green-900 px-2 py-1 rounded bg-green-50 hover:bg-green-100 text-xs font-medium"
                            title="Generate Invoice"
                          >
                            Invoice
                          </button>
                          <button
                            onClick={() => handleEdit(customer)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded"
                            title="Edit Customer"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(customer.customerId)}
                            className="text-red-600 hover:text-red-900 p-1 rounded"
                            title="Delete Customer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FibernetDashboard;
