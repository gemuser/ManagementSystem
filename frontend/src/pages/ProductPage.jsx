import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import DHISidebar from '../components/DHISidebar';
import RsIcon from '../components/RsIcon';
import Swal from 'sweetalert2';
import { dataRefreshEmitter } from '../hooks/useDataRefresh';
import { 
  Package, 
  Plus, 
  List, 
  Edit, 
  Search, 
  Eye,
  AlertCircle,
  CheckCircle,
  Hash,
  Box,
  Tag
} from 'lucide-react';

const ProductPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    modelNo: '',
    hsCode: '',
    total_stock: ''
  });

  // Filter products based on search
  useEffect(() => {
    let filtered = products;

    // Search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.modelNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.hsCode?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm]);

  // Fetch products
  const getProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/products/list');
      setProducts(res.data.data);
    } catch (err) {
      console.error("Error fetching products", err);
      Swal.fire({
        icon: 'error',
        title: 'Error Loading Products',
        text: 'Failed to load products. Please try again.',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setLoading(false);
    }
  };

  // Add new product
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim() || !formData.category.trim() || !formData.price || !formData.total_stock) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Please fill in all required fields (Name, Category, Price, Stock)',
        confirmButtonColor: '#f59e0b'
      });
      return;
    }

    if (parseFloat(formData.price) <= 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Price',
        text: 'Price must be greater than 0',
        confirmButtonColor: '#f59e0b'
      });
      return;
    }

    if (parseInt(formData.total_stock) < 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Stock',
        text: 'Stock cannot be negative',
        confirmButtonColor: '#f59e0b'
      });
      return;
    }

    try {
      await axios.post('/products/create', {
        ...formData,
        price: parseFloat(formData.price),
        total_stock: parseInt(formData.total_stock)
      });
      
      setFormData({
        name: '',
        category: '',
        price: '',
        modelNo: '',
        hsCode: '',
        total_stock: ''
      });
      
      setShowAddForm(false);
      
      Swal.fire({
        icon: 'success',
        title: 'Product Added Successfully!',
        text: `${formData.name} has been added to your inventory`,
        confirmButtonColor: '#10b981',
        timer: 3000,
        timerProgressBar: true
      });
      
      getProducts();
      
      // Trigger global refresh for other components
      dataRefreshEmitter.emit();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Failed to Add Product',
        text: err.response?.data?.message || 'An error occurred while adding the product',
        confirmButtonColor: '#ef4444'
      });
    }
  };

  // Handle product details edit
  const handleEditProduct = async (product) => {
    const { value: formValues } = await Swal.fire({
      title: 'Edit Product Details',
      html: `
        <div class="space-y-4 text-left">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
            <input id="swal-input1" class="swal2-input w-full" placeholder="Product Name" value="${product.name}">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            <input id="swal-input2" class="swal2-input w-full" placeholder="Category" value="${product.category}">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Price (Rs.) *</label>
            <input id="swal-input3" class="swal2-input w-full" type="number" placeholder="Price" value="${product.price}">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Model Number</label>
            <input id="swal-input4" class="swal2-input w-full" placeholder="Model No" value="${product.modelNo || ''}">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">HS Code</label>
            <input id="swal-input5" class="swal2-input w-full" placeholder="HS Code" value="${product.hsCode || ''}">
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Update Product',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#6b7280',
      customClass: {
        popup: 'swal-wide'
      },
      preConfirm: () => {
        const name = document.getElementById('swal-input1').value.trim();
        const category = document.getElementById('swal-input2').value.trim();
        const price = document.getElementById('swal-input3').value;
        const modelNo = document.getElementById('swal-input4').value.trim();
        const hsCode = document.getElementById('swal-input5').value.trim();

        if (!name || !category || !price) {
          Swal.showValidationMessage('Name, Category, and Price are required');
          return false;
        }

        if (parseFloat(price) <= 0) {
          Swal.showValidationMessage('Price must be greater than 0');
          return false;
        }

        return {
          name,
          category,
          price: parseFloat(price),
          modelNo,
          hsCode
        }
      }
    });

    if (formValues) {
      try {
        await axios.put(`/products/update/${product.id}`, {
          ...formValues,
          total_stock: product.total_stock // Keep existing stock
        });
        
        Swal.fire({
          icon: 'success',
          title: 'Product Updated!',
          text: `${formValues.name} has been updated successfully`,
          confirmButtonColor: '#10b981',
          timer: 3000,
          timerProgressBar: true
        });
        
        getProducts();
        
        // Trigger global refresh for other components
        dataRefreshEmitter.emit();
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Update Failed',
          text: err.response?.data?.message || 'Failed to update product',
          confirmButtonColor: '#ef4444'
        });
      }
    }
  };

  // Get stock status
  const getStockStatus = (stock) => {
    const stockNum = parseInt(stock) || 0;
    if (stockNum === 0) return { text: 'Out of Stock', color: 'text-red-600 bg-red-100', icon: AlertCircle };
    if (stockNum < 10) return { text: 'Low Stock', color: 'text-orange-600 bg-orange-100', icon: AlertCircle };
    return { text: 'In Stock', color: 'text-green-600 bg-green-100', icon: CheckCircle };
  };

  // View product details
  const viewProductDetails = (product) => {
    Swal.fire({
      title: 'Product Details',
      html: `
        <div class="text-left space-y-3">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <strong class="text-gray-700">Name:</strong>
              <p class="text-gray-900">${product.name}</p>
            </div>
            <div>
              <strong class="text-gray-700">Category:</strong>
              <p class="text-gray-900">${product.category}</p>
            </div>
            <div>
              <strong class="text-gray-700">Price:</strong>
              <p class="text-gray-900">Rs. ${product.price}</p>
            </div>
            <div>
              <strong class="text-gray-700">Stock Levels:</strong>
              <p class="text-gray-900">
                <span class="font-semibold text-blue-600">${product.available_stock || 0}</span> available 
                <span class="text-gray-500">of</span> 
                <span class="font-semibold">${product.total_stock}</span> total units
              </p>
            </div>
            <div>
              <strong class="text-gray-700">Model No:</strong>
              <p class="text-gray-900">${product.modelNo || 'N/A'}</p>
            </div>
            <div>
              <strong class="text-gray-700">HS Code:</strong>
              <p class="text-gray-900">${product.hsCode || 'N/A'}</p>
            </div>
          </div>
        </div>
      `,
      confirmButtonText: 'Close',
      confirmButtonColor: '#3b82f6',
      customClass: {
        popup: 'swal-wide'
      }
    });
  };

  useEffect(() => {
    getProducts();
    
    // Listen for global data refresh events
    const unsubscribe = dataRefreshEmitter.subscribe(() => {
      getProducts();
    });
    
    return unsubscribe;
  }, []);

  return (
    <div className="flex">
      <DHISidebar />
      <main className="flex-1 ml-72 p-6 bg-gray-50 min-h-screen">{/* Adjusted margin for fixed sidebar */}
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <Package size={28} className="mr-3 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
              <p className="text-gray-600 mt-1">Manage your inventory products and details</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center shadow-lg transition-all duration-200"
          >
            <Plus size={20} className="mr-2" />
            Add New Product
          </button>
        </div>

        {/* Stock Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">{products.length}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <Package size={24} className="text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
                <p className="text-2xl font-bold text-orange-600 mt-1">
                  {products.filter(p => {
                    const available = parseInt(p.available_stock) || 0;
                    return available > 0 && available < 10;
                  }).length}
                </p>
              </div>
              <div className="p-3 rounded-full bg-orange-100">
                <AlertCircle size={24} className="text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                <p className="text-2xl font-bold text-red-600 mt-1">
                  {products.filter(p => parseInt(p.available_stock) === 0).length}
                </p>
              </div>
              <div className="p-3 rounded-full bg-red-100">
                <AlertCircle size={24} className="text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Categories</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{[...new Set(products.map(p => p.category))].filter(Boolean).length}</p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <Tag size={24} className="text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Add Product Form */}
        {showAddForm && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Add New Product</h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Box size={16} className="inline mr-1" />
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter product name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Tag size={16} className="inline mr-1" />
                    Category *
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Enter category"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <RsIcon size={16} className="inline mr-1" />
                    Price (Rs.) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="Enter price"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Package size={16} className="inline mr-1" />
                    Initial Stock *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.total_stock}
                    onChange={(e) => setFormData({ ...formData, total_stock: e.target.value })}
                    placeholder="Enter initial stock quantity"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Hash size={16} className="inline mr-1" />
                    Model Number
                  </label>
                  <input
                    type="text"
                    value={formData.modelNo}
                    onChange={(e) => setFormData({ ...formData, modelNo: e.target.value })}
                    placeholder="Enter model number (optional)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Hash size={16} className="inline mr-1" />
                    HS Code
                  </label>
                  <input
                    type="text"
                    value={formData.hsCode}
                    onChange={(e) => setFormData({ ...formData, hsCode: e.target.value })}
                    placeholder="Enter HS code (optional)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center transition-all shadow-lg"
                >
                  <Plus size={16} className="mr-2" />
                  Add Product
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Simple Search */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          {searchTerm && (
            <div className="mt-2 text-sm text-gray-600">
              Showing {filteredProducts.length} of {products.length} products
            </div>
          )}
        </div>

        {/* Products List */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <List size={20} className="mr-2 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Product Inventory</h3>
              </div>
              <div className="text-sm text-gray-600">
                Total Products: {products.length}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading products...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-12 text-center">
              <Package size={48} className="mx-auto text-gray-400 mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No Products Found</h4>
              <p className="text-gray-600 mb-4">
                {products.length === 0 
                  ? "You haven't added any products yet. Click 'Add New Product' to get started."
                  : "No products match your search criteria. Try adjusting your filters."
                }
              </p>
              {products.length === 0 && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg inline-flex items-center"
                >
                  <Plus size={16} className="mr-2" />
                  Add Your First Product
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.map((product) => {
                    const status = getStockStatus(product.available_stock || 0);
                    const StatusIcon = status.icon;
                    
                    return (
                      <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500">
                              {product.modelNo && `Model: ${product.modelNo}`}
                              {product.modelNo && product.hsCode && ' • '}
                              {product.hsCode && `HS: ${product.hsCode}`}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {product.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          Rs. {parseFloat(product.price).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                              <StatusIcon size={12} className="mr-1" />
                              {status.text}
                            </span>
                            <div className="ml-2 text-sm text-gray-600">
                              <div>{product.available_stock || 0} available</div>
                              {/* <div className="text-xs text-gray-500">of {product.total_stock} total</div> */}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => viewProductDetails(product)}
                              className="text-blue-600 hover:text-blue-700 flex items-center bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-lg transition-all"
                              title="View Details"
                            >
                              <Eye size={14} className="mr-1" />
                              View
                            </button>
                            <button
                              onClick={() => handleEditProduct(product)}
                              className="text-orange-600 hover:text-orange-700 flex items-center bg-orange-50 hover:bg-orange-100 px-3 py-1 rounded-lg transition-all"
                              title="Edit Product"
                            >
                              <Edit size={14} className="mr-1" />
                              Edit
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

export default ProductPage;
