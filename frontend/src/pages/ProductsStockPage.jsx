import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import DHISidebar from '../components/DHISidebar';
import Swal from 'sweetalert2';
import { dataRefreshEmitter } from '../hooks/useDataRefresh';
import { 
  Package, 
  Plus, 
  Search, 
  Edit, 
  AlertTriangle,
  TrendingUp,
  Warehouse,
  RefreshCw,
  Grid,
  List as ListIcon
} from 'lucide-react';

const ProductsStockPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStock, setFilterStock] = useState('all'); // all, low, out
  const [viewMode, setViewMode] = useState(() => {
    // Load saved layout preference from localStorage
    const savedViewMode = localStorage.getItem('productsStockPageViewMode');
    return savedViewMode || 'grid';
  }); // grid or list
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    modelNo: '',
    hsCode: '',
    total_stock: ''
  });

  useEffect(() => {
    fetchProducts();
    
    const unsubscribe = dataRefreshEmitter.subscribe(() => {
      try {
        emitDataRefresh();
      } catch (error) {
        console.error('Error emitting data refresh:', error);
      }
    });
    
    return unsubscribe;
  }, []);

  useEffect(() => {
    applyFilters();
  }, [products, searchTerm, filterCategory, filterStock]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchProducts = async (forceRefresh = false) => {
    try {
      setLoading(true);
      const res = await axios.get('/products/list', {
        // Add timestamp to prevent caching when force refreshing
        params: forceRefresh ? { t: Date.now() } : {}
      });
      setProducts(res.data.data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load products',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = products;

    // Search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.modelNo && product.modelNo.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(product => product.category === filterCategory);
    }

    // Stock filter
    if (filterStock === 'low') {
      filtered = filtered.filter(product => (product.available_stock || 0) <= 10 && (product.available_stock || 0) > 0);
    } else if (filterStock === 'out') {
      filtered = filtered.filter(product => (product.available_stock || 0) <= 0);
    }

    setFilteredProducts(filtered);
  };

  const getUniqueCategories = () => {
    return [...new Set(products.map(p => p.category))].filter(Boolean);
  };

  const getStockStatus = (stock) => {
    if (stock <= 0) return { status: 'Out of Stock', color: 'text-red-600 bg-red-100', icon: '❌' };
    if (stock <= 10) return { status: 'Low Stock', color: 'text-yellow-600 bg-yellow-100', icon: '⚠️' };
    return { status: 'In Stock', color: 'text-green-600 bg-green-100', icon: '✅' };
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    // Save the preference to localStorage
    localStorage.setItem('productsStockPageViewMode', mode);
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/products/create', formData);
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Product added successfully',
        confirmButtonColor: '#10b981'
      });
      setShowAddModal(false);
      resetForm();
      
      // Immediate refresh and emit
      await fetchProducts();
      dataRefreshEmitter.emit();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.response?.data?.message || 'Failed to add product',
        confirmButtonColor: '#ef4444'
      });
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/products/update/${editingProduct.id}`, formData);
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Product updated successfully',
        confirmButtonColor: '#10b981'
      });
      setEditingProduct(null);
      resetForm();
      
      // Immediate refresh and emit
      await fetchProducts();
      dataRefreshEmitter.emit();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.response?.data?.message || 'Failed to update product',
        confirmButtonColor: '#ef4444'
      });
    }
  };

  const handleStockUpdate = async (product, action) => {
    const { value: quantity } = await Swal.fire({
      title: `${action === 'add' ? 'Add' : 'Remove'} Stock`,
      html: `
        <div class="text-left mb-4">
          <p><strong>Product:</strong> ${product.name}</p>
          <p><strong>Current Available Stock:</strong> ${product.available_stock || 0} units</p>
        </div>
        <input id="quantity" class="swal2-input" type="number" min="1" placeholder="Enter quantity">
      `,
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      preConfirm: () => {
        const qty = document.getElementById('quantity').value;
        if (!qty || qty <= 0) {
          Swal.showValidationMessage('Please enter a valid quantity');
          return false;
        }
        return parseInt(qty);
      }
    });

    if (quantity) {
      try {
        await axios.post('/stock/update', {
          product_id: product.id,
          action: action,
          quantity: quantity
        });
        
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: `Stock ${action === 'add' ? 'added' : 'removed'} successfully`,
          confirmButtonColor: '#10b981'
        });
        
        // Immediate refresh and emit
        await fetchProducts();
        dataRefreshEmitter.emit();
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.response?.data?.message || 'Failed to update stock',
          confirmButtonColor: '#ef4444'
        });
      }
    }
  };

  const startEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      category: product.category || '',
      price: product.price || '',
      modelNo: product.modelNo || '',
      hsCode: product.hsCode || '',
      total_stock: product.total_stock || ''
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      price: '',
      modelNo: '',
      hsCode: '',
      total_stock: ''
    });
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const lowStockCount = products.filter(p => (p.available_stock || 0) <= 10 && (p.available_stock || 0) > 0).length;
  const outOfStockCount = products.filter(p => (p.available_stock || 0) <= 0).length;
  const totalValue = products.reduce((sum, p) => sum + ((p.price || 0) * (p.available_stock || 0)), 0);

  return (
    <div className="flex">
      <DHISidebar />
      <main className="flex-1 ml-72 p-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Products & Stock</h1>
            <p className="text-gray-600">Manage your inventory in one place</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center text-sm font-medium transition-all"
            >
              <Plus size={16} className="mr-2" />
              Add Product
            </button>
            <button
              onClick={fetchProducts}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center text-sm transition-all"
            >
              <RefreshCw size={16} className="mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Products</p>
                <p className="text-xl font-bold text-gray-900">{products.length}</p>
              </div>
              <Package className="text-blue-600" size={24} />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Low Stock</p>
                <p className="text-xl font-bold text-yellow-600">{lowStockCount}</p>
              </div>
              <AlertTriangle className="text-yellow-600" size={24} />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Out of Stock</p>
                <p className="text-xl font-bold text-red-600">{outOfStockCount}</p>
              </div>
              <Warehouse className="text-red-600" size={24} />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-xl font-bold text-green-600">Rs. {totalValue.toFixed(0)}</p>
              </div>
              <TrendingUp className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {getUniqueCategories().map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <select
                value={filterStock}
                onChange={(e) => setFilterStock(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Stock Levels</option>
                <option value="low">Low Stock</option>
                <option value="out">Out of Stock</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleViewModeChange('grid')}
                className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Grid size={16} />
              </button>
              <button
                onClick={() => handleViewModeChange('list')}
                className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <ListIcon size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Products Grid/List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading products...</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Package size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Products Found</h3>
            <p className="text-gray-600">No products match your search criteria.</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map((product) => {
              const stockInfo = getStockStatus(product.available_stock || 0);
              return (
                <div key={product.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-gray-900 text-sm truncate flex-1">{product.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${stockInfo.color}`}>
                      {stockInfo.status}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <p><span className="font-medium">Category:</span> {product.category}</p>
                    <p><span className="font-medium">Available Stock:</span> {product.available_stock || 0} units</p>
                    {(product.total_stock !== product.available_stock) && (
                      <p className="text-xs text-gray-500">
                        <span className="font-medium">Total Stock:</span> {product.total_stock || 0} units
                        <span className="text-orange-600 ml-1">({(product.total_stock - product.available_stock) || 0} sold)</span>
                      </p>
                    )}
                    <p><span className="font-medium">Price:</span> Rs. {parseFloat(product.price || 0).toFixed(2)}</p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                    <button
                      onClick={() => startEdit(product)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      <Edit size={14} className="inline mr-1" />
                      Edit
                    </button>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleStockUpdate(product, 'add')}
                        className="text-green-600 hover:text-green-800 text-xs font-medium px-2 py-1 bg-green-50 rounded"
                      >
                        + Stock
                      </button>
                      <button
                        onClick={() => handleStockUpdate(product, 'remove')}
                        className="text-red-600 hover:text-red-800 text-xs font-medium px-2 py-1 bg-red-50 rounded"
                      >
                        - Stock
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Available Stock</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProducts.map((product) => {
                  const stockInfo = getStockStatus(product.available_stock || 0);
                  return (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{product.name}</div>
                        {product.modelNo && <div className="text-sm text-gray-500">Model: {product.modelNo}</div>}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{product.category}</td>
                      <td className="px-4 py-3">
                        <div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${stockInfo.color}`}>
                            {product.available_stock || 0} units
                          </span>
                          {(product.total_stock !== product.available_stock) && (
                            <div className="text-xs text-gray-500 mt-1">
                              Total: {product.total_stock || 0} ({(product.total_stock - product.available_stock) || 0} sold)
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">Rs. {parseFloat(product.price || 0).toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => startEdit(product)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleStockUpdate(product, 'add')}
                            className="text-green-600 hover:text-green-800 text-xs font-medium px-2 py-1 bg-green-50 rounded"
                          >
                            + Stock
                          </button>
                          <button
                            onClick={() => handleStockUpdate(product, 'remove')}
                            className="text-red-600 hover:text-red-800 text-xs font-medium px-2 py-1 bg-red-50 rounded"
                          >
                            - Stock
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

        {/* Add/Edit Product Modal */}
        {(showAddModal || editingProduct) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              
              <form onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Initial Stock</label>
                    <input
                      type="number"
                      name="total_stock"
                      value={formData.total_stock}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Model Number</label>
                  <input
                    type="text"
                    name="modelNo"
                    value={formData.modelNo}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">HS Code</label>
                  <input
                    type="text"
                    name="hsCode"
                    value={formData.hsCode}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingProduct(null);
                      resetForm();
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                  >
                    {editingProduct ? 'Update' : 'Add'} Product
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProductsStockPage;
