import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import DishhomeSidebar from '../components/DishhomeSidebar';
import ImprovedCustomerForm from '../components/ImprovedCustomerForm';
import RsIcon from '../components/RsIcon';
import Swal from 'sweetalert2';
import { dataRefreshEmitter } from '../hooks/useDataRefresh';
import { 
  Tv, 
  Plus, 
  List, 
  Edit, 
  Search, 
  Trash2,
  User,
  Phone,
  MapPin,
  Package,
  Calendar,
  Activity,
  ArrowUp
} from 'lucide-react';

const DishhomePage = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Filter customers based on search
  useEffect(() => {
    let filtered = customers;

    if (searchTerm.trim()) {
      filtered = filtered.filter(customer =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phoneNumber.includes(searchTerm) ||
        customer.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.package.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredCustomers(filtered);
  }, [customers, searchTerm]);

  // Fetch customers
  const getCustomers = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/dishhome/list');
      setCustomers(res.data.data);
    } catch (err) {
      console.error("Error fetching customers", err);
      Swal.fire({
        icon: 'error',
        title: 'Error Loading Customers',
        text: 'Failed to load dishhome customers. Please try again.',
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
      
      if (editingCustomer) {
        await axios.put(`/dishhome/update/${editingCustomer.customerId}`, formData);
        Swal.fire({
          icon: 'success',
          title: 'Customer Updated!',
          text: 'Customer information has been updated successfully.',
          confirmButtonColor: '#10b981',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        await axios.post('/dishhome/create', formData);
        Swal.fire({
          icon: 'success',
          title: 'Customer Added!',
          text: 'New dishhome customer has been added successfully.',
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

  // Handle cancel
  const handleCancel = () => {
    setShowAddForm(false);
    setEditingCustomer(null);
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
        await axios.delete(`/dishhome/delete/${customerId}`);
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Customer has been deleted.',
          confirmButtonColor: '#10b981'
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

  // Handle upgrade to combo
  const handleUpgradeToCombo = (customer) => {
    navigate('/combo/dth', {
      state: {
        upgradeData: {
          dishhomeId: customer.customerId,
          customerName: customer.name,
          customerAddress: customer.address,
          phoneNumber: customer.phoneNumber,
          dishhomePackage: customer.package,
          dishhomePrice: customer.price,
          month: customer.month,
          casId: customer.casId,
          upgradeType: 'DTH',
          sourceService: 'dishhome'
        }
      }
    });
  };

  // Generate invoice for DishHome customer
  const generateInvoice = async (customer) => {
    try {
      const { value: formValues } = await Swal.fire({
        title: 'Generate DishHome Invoice',
        html: `
          <div class="space-y-4 text-left">
            <div class="bg-blue-50 p-4 rounded-lg mb-4">
              <h4 class="font-medium text-blue-800 mb-2">Customer Information</h4>
              <p><strong>Name:</strong> ${customer.name}</p>
              <p><strong>Package:</strong> ${customer.package}</p>
              <p><strong>Total Amount:</strong> Rs. ${customer.price}</p>
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
        confirmButtonColor: '#7c3aed',
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
      const response = await axios.post('/invoices/dishhome/generate', invoiceData);

      if (response.data.success) {
        // Create blob and download PDF
        const pdfData = response.data.pdf;
        const blob = new Blob([Uint8Array.from(atob(pdfData), c => c.charCodeAt(0))], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `DishHome-Invoice-${response.data.data.invoiceNumber}.pdf`;
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

  useEffect(() => {
    getCustomers();
  }, []);

  return (
    <div className="flex">
      <DishhomeSidebar />
      <main className="flex-1 ml-72 p-6 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Tv className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dishhome Customers</h1>
                <p className="text-sm text-gray-500">Manage your dishhome service customers</p>
              </div>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add Customer</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <ImprovedCustomerForm
            onSubmit={handleFormSubmit}
            onCancel={handleCancel}
            initialData={editingCustomer}
            serviceType="dishhome"
            loading={formLoading}
          />
        )}

        {/* Customers Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <List className="h-5 w-5 mr-2 text-purple-600" />
                Customers List ({filteredCustomers.length})
              </h3>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : filteredCustomers.length === 0 ? (
              <div className="text-center py-12">
                <Tv className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No customers found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          Customer
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-1" />
                          Contact
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center">
                          <Package className="h-4 w-4 mr-1" />
                          Package
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          Month
                        </div>
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredCustomers.map((customer) => (
                      <tr key={customer.customerId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {customer.address}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {customer.phoneNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {customer.package}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          Rs. {customer.price}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            customer.status === 1 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {customer.status === 1 ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {customer.month}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleUpgradeToCombo(customer)}
                              className="text-green-600 hover:text-green-900 px-3 py-1 rounded bg-green-50 hover:bg-green-100 text-xs font-semibold flex items-center gap-1"
                              title="Upgrade to Combo"
                            >
                              <ArrowUp className="h-4 w-4" />
                              Upgrade
                            </button>
                            <button
                              onClick={() => generateInvoice(customer)}
                              className="text-blue-600 hover:text-blue-900 px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 text-xs font-medium"
                              title="Generate Invoice"
                            >
                              Invoice
                            </button>
                            <button
                              onClick={() => handleEdit(customer)}
                              className="text-indigo-600 hover:text-indigo-900 p-1 rounded"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(customer.customerId)}
                              className="text-red-600 hover:text-red-900 p-1 rounded"
                              title="Delete"
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
        </main>
    </div>
  );
};

export default DishhomePage;
