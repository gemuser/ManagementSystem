import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import Sidebar from '../components/Sidebar';
import { dataRefreshEmitter } from '../hooks/useDataRefresh';
import Swal from 'sweetalert2';
import { 
  ShoppingBag,
  Plus,
  RefreshCw,
  Search,
  Package,
  Trash2,
  Edit3,
  Building,
  Calendar
} from 'lucide-react';

const PurchasePage = () => {
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState(null);
  
  const [purchaseForm, setPurchaseForm] = useState({
    invoice_no: '',
    supplier_name: '',
    product_name: '',
    quantity_purchased: '',
    price_per_unit: '',
    notes: ''
  });

  useEffect(() => {
    fetchData();
    
    const unsubscribe = dataRefreshEmitter.subscribe(() => {
      fetchData();
    });
    
    return unsubscribe;
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/purchases/list');
      setPurchases(response.data.data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      Swal.fire('Error', 'Failed to fetch data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const generateInvoiceNumber = async () => {
    try {
      const response = await axios.get('/purchases/generate-invoice');
      return response.data.data.invoice_no;
    } catch (err) {
      console.error('Error generating invoice number:', err);
      return `PUR-${Date.now()}`;
    }
  };

  const handleAddPurchase = async () => {
    setEditingPurchase(null);
    const invoiceNo = await generateInvoiceNumber();
    setPurchaseForm({
      invoice_no: invoiceNo,
      supplier_name: '',
      product_name: '',
      quantity_purchased: '',
      price_per_unit: '',
      notes: ''
    });
    setShowAddForm(true);
  };

  const handleEditPurchase = (purchase) => {
    setEditingPurchase(purchase);
    setPurchaseForm({
      invoice_no: purchase.invoice_no,
      supplier_name: purchase.supplier_name,
      product_name: purchase.product_name || '',
      quantity_purchased: purchase.quantity_purchased.toString(),
      price_per_unit: purchase.price_per_unit.toString(),
      notes: purchase.notes || ''
    });
    setShowAddForm(true);
  };

  const handleSubmitPurchase = async (e) => {
    e.preventDefault();
    
    if (!purchaseForm.supplier_name || !purchaseForm.product_name || !purchaseForm.quantity_purchased || !purchaseForm.price_per_unit) {
      Swal.fire('Error', 'Please fill in all required fields', 'error');
      return;
    }

    try {
      const purchaseData = {
        ...purchaseForm,
        quantity_purchased: parseInt(purchaseForm.quantity_purchased),
        price_per_unit: parseFloat(purchaseForm.price_per_unit)
      };

      if (editingPurchase) {
        await axios.put(`/purchases/${editingPurchase.id}`, purchaseData);
        Swal.fire('Success', 'Purchase updated successfully!', 'success');
      } else {
        await axios.post('/purchases/add', purchaseData);
        Swal.fire('Success', 'Purchase added successfully!', 'success');
      }

      setShowAddForm(false);
      setPurchaseForm({
        invoice_no: '',
        supplier_name: '',
        product_name: '',
        quantity_purchased: '',
        price_per_unit: '',
        notes: ''
      });
      setEditingPurchase(null);
      fetchData();
      dataRefreshEmitter.emit();
    } catch (err) {
      console.error('Error saving purchase:', err);
      Swal.fire('Error', 'Failed to save purchase', 'error');
    }
  };

  const handleDeletePurchase = async (purchase) => {
    const result = await Swal.fire({
      title: 'Delete Purchase?',
      text: `Are you sure you want to delete purchase ${purchase.invoice_no}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`/purchases/${purchase.id}`);
        Swal.fire('Deleted!', 'Purchase has been deleted.', 'success');
        fetchData();
        dataRefreshEmitter.emit();
      } catch (err) {
        console.error('Error deleting purchase:', err);
        Swal.fire('Error', 'Failed to delete purchase', 'error');
      }
    }
  };

  const filteredPurchases = purchases.filter(purchase =>
    purchase.invoice_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    purchase.supplier_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    purchase.product_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex">
        <Sidebar />
        <main className="flex-1 ml-72 p-6 bg-gray-50 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading purchases...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 ml-72 p-6 bg-gray-50 min-h-screen">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-purple-600 p-3 rounded-xl mr-4">
                <ShoppingBag size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-1">Purchases</h1>
                <p className="text-gray-600 text-lg">Manage your purchase records</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={fetchData}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center transition-all"
              >
                <RefreshCw size={16} className="mr-2" />
                Refresh
              </button>
              <button
                onClick={handleAddPurchase}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center transition-all"
              >
                <Plus size={16} className="mr-2" />
                Add Purchase
              </button>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by invoice, supplier, or product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
        </div>

        {/* Add/Edit Purchase Form */}
        {showAddForm && (
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingPurchase ? 'Edit Purchase' : 'Add New Purchase'}
            </h2>
            
            <form onSubmit={handleSubmitPurchase} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number</label>
                <input
                  type="text"
                  value={purchaseForm.invoice_no}
                  onChange={(e) => setPurchaseForm({...purchaseForm, invoice_no: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Name</label>
                <input
                  type="text"
                  value={purchaseForm.supplier_name}
                  onChange={(e) => setPurchaseForm({...purchaseForm, supplier_name: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Enter supplier name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                <input
                  type="text"
                  value={purchaseForm.product_name}
                  onChange={(e) => setPurchaseForm({...purchaseForm, product_name: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Enter product name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input
                  type="number"
                  value={purchaseForm.quantity_purchased}
                  onChange={(e) => setPurchaseForm({...purchaseForm, quantity_purchased: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Enter quantity"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price per Unit (Rs.)</label>
                <input
                  type="number"
                  step="0.01"
                  value={purchaseForm.price_per_unit}
                  onChange={(e) => setPurchaseForm({...purchaseForm, price_per_unit: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Enter price"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount</label>
                <input
                  type="text"
                  value={purchaseForm.quantity_purchased && purchaseForm.price_per_unit 
                    ? `Rs. ${(parseFloat(purchaseForm.quantity_purchased) * parseFloat(purchaseForm.price_per_unit)).toFixed(2)}`
                    : 'Rs. 0.00'}
                  className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
                  disabled
                />
              </div>

              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                <textarea
                  value={purchaseForm.notes}
                  onChange={(e) => setPurchaseForm({...purchaseForm, notes: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Enter any additional notes..."
                  rows="3"
                />
              </div>

              <div className="md:col-span-2 lg:col-span-3 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingPurchase(null);
                    setPurchaseForm({
                      invoice_no: '',
                      supplier_name: '',
                      product_id: '',
                      quantity_purchased: '',
                      price_per_unit: '',
                      notes: ''
                    });
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all"
                >
                  {editingPurchase ? 'Update Purchase' : 'Add Purchase'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Purchases List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              Purchase Records ({filteredPurchases.length})
            </h2>
          </div>
          
          {filteredPurchases.length === 0 ? (
            <div className="text-center py-12">
              <Package size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No purchases found</p>
              <p className="text-sm text-gray-400 mt-2">Add your first purchase to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price/Unit</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPurchases.map((purchase) => (
                    <tr key={purchase.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-purple-600">{purchase.invoice_no}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Building size={16} className="text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">{purchase.supplier_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{purchase.product_name}</div>
                          <div className="text-sm text-gray-500">{purchase.category}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {purchase.quantity_purchased}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        Rs. {parseFloat(purchase.price_per_unit).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-green-600">
                          Rs. {parseFloat(purchase.total_amount).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar size={16} className="mr-1" />
                          {formatDate(purchase.purchase_date)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditPurchase(purchase)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeletePurchase(purchase)}
                            className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
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

export default PurchasePage;
