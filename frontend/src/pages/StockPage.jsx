import React, { useEffect, useState, useCallback } from 'react';
import axios from '../api/axios';
import Sidebar from '../components/Sidebar';
import Swal from 'sweetalert2';
import { dataRefreshEmitter } from '../hooks/useDataRefresh';
import { 
  Package, 
  Search, 
  List, 
  Folder, 
  AlertTriangle,
  Plus,
  TrendingUp,
  Warehouse,
  BarChart3,
  RefreshCw
} from 'lucide-react';

const StockPage = () => {
  const [products, setProducts] = useState([]);
  const [groupedProducts, setGroupedProducts] = useState({});
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [stockAction, setStockAction] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grouped'); // 'grouped' or 'list'

  useEffect(() => {
    fetchProducts();
    
    // Listen for global data refresh events
    const unsubscribe = dataRefreshEmitter.subscribe(() => {
      fetchProducts();
    });
    
    return unsubscribe;
  }, []);

  const applyFilters = useCallback(() => {
    if (!products || products.length === 0) {
      setFilteredProducts([]);
      return;
    }

    let filtered = products;

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.hsCode?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm]);

  useEffect(() => {
    applyFilters();
  }, [products, searchTerm, applyFilters]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/products/list');
      const productsData = res.data.data;
      setProducts(productsData);
      setFilteredProducts(productsData); // Initialize filtered products with all products
      
      // Calculate low stock products (available_stock <= 10)
      const lowStock = productsData.filter(product => {
        const availableStock = parseInt(product.available_stock) || 0;
        return availableStock > 0 && availableStock <= 10;
      });
      setLowStockProducts(lowStock);
      
      // Group products by category
      const grouped = productsData.reduce((acc, product) => {
        if (!acc[product.category]) {
          acc[product.category] = [];
        }
        acc[product.category].push(product);
        return acc;
      }, {});
      
      setGroupedProducts(grouped);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilteredProducts(products); // Immediately reset filtered products to show all products
  };

  const handleStockUpdate = async () => {
    if (!selectedProduct || !stockQuantity || !stockAction) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Please fill all fields',
        confirmButtonColor: '#3085d6'
      });
      return;
    }

    if (stockAction !== 'increase') {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Action',
        text: 'Only stock addition is allowed',
        confirmButtonColor: '#3085d6'
      });
      return;
    }

    try {
      const currentStock = parseInt(selectedProduct.total_stock);
      const quantity = parseInt(stockQuantity);
      const newStock = currentStock + quantity;

      await axios.put(`/products/update/${selectedProduct.id}`, {
        ...selectedProduct,
        total_stock: newStock
      });

      Swal.fire({
        icon: 'success',
        title: 'Stock Added Successfully!',
        text: `New stock level: ${newStock} units`,
        confirmButtonColor: '#10b981'
      });

      setSelectedProduct(null);
      setStockAction('');
      setStockQuantity('');
      fetchProducts(); // This will also update lowStockProducts
      
      // Trigger global refresh for other components
      dataRefreshEmitter.emit();
    } catch (err) {
      console.error('Error updating stock:', err);
      Swal.fire({
        icon: 'error',
        title: 'Failed to Add Stock',
        text: 'Please try again later',
        confirmButtonColor: '#ef4444'
      });
    }
  };

  const addStockDirectly = async (product, quantity) => {
    if (!quantity || quantity <= 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Quantity',
        text: 'Please enter a valid quantity greater than 0',
        confirmButtonColor: '#3085d6'
      });
      return;
    }

    // Show confirmation dialog for direct stock addition
    const result = await Swal.fire({
      title: 'Confirm Stock Addition',
      html: `
        <div class="text-left">
          <p><strong>Product:</strong> ${product.name}</p>
          <p><strong>Current Stock:</strong> ${product.total_stock} units</p>
          <p><strong>Adding:</strong> ${quantity} units</p>
          <p><strong>New Stock:</strong> ${parseInt(product.total_stock) + parseInt(quantity)} units</p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Add Stock',
      cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) return;

    try {
      const currentStock = parseInt(product.total_stock);
      const newStock = currentStock + parseInt(quantity);

      await axios.put(`/products/update/${product.id}`, {
        ...product,
        total_stock: newStock
      });

      Swal.fire({
        icon: 'success',
        title: 'Stock Added Successfully!',
        text: `${product.name} now has ${newStock} units in stock`,
        confirmButtonColor: '#10b981',
        timer: 3000,
        timerProgressBar: true
      });

      fetchProducts(); // This will also update lowStockProducts
      
      // Trigger global refresh for other components
      dataRefreshEmitter.emit();
    } catch (err) {
      console.error('Error adding stock:', err);
      Swal.fire({
        icon: 'error',
        title: 'Failed to Add Stock',
        text: 'Please try again later',
        confirmButtonColor: '#ef4444'
      });
    }
  };

  const getStockStatus = (product) => {
    const availableStock = parseInt(product.available_stock) || 0;
    if (availableStock === 0) return { text: 'Out of Stock', color: 'text-red-600 bg-red-100' };
    if (availableStock < 10) return { text: 'Low Stock', color: 'text-orange-600 bg-orange-100' };
    if (availableStock < 50) return { text: 'Medium Stock', color: 'text-yellow-600 bg-yellow-100' };
    return { text: 'High Stock', color: 'text-green-600 bg-green-100' };
  };

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 ml-72 p-6 bg-gray-50 min-h-screen">{/* Adjusted margin for fixed sidebar */}
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <Warehouse size={32} className="mr-4 text-indigo-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Stock Management</h1>
              <p className="text-gray-600 mt-1">Monitor and manage your inventory stock levels</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={fetchProducts}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center transition-all"
              title="Refresh data"
            >
              <RefreshCw size={16} className="mr-2" />
              Refresh
            </button>
            <div className="text-right">
              <p className="text-sm text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-indigo-600">{products.length}</p>
            </div>
          </div>
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
                <p className="text-2xl font-bold text-orange-600 mt-1">{lowStockProducts.length}</p>
              </div>
              <div className="p-3 rounded-full bg-orange-100">
                <AlertTriangle size={24} className="text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                <p className="text-2xl font-bold text-red-600 mt-1">
                  {products.filter(p => parseInt(p.available_stock || 0) === 0).length}
                </p>
              </div>
              <div className="p-3 rounded-full bg-red-100">
                <TrendingUp size={24} className="text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Categories</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {Object.keys(groupedProducts).length}
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <BarChart3 size={24} className="text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Low Stock Warning Alert */}
        {lowStockProducts.length > 0 && (
          <div className="bg-gradient-to-r from-orange-50 to-red-50 border-l-4 border-orange-400 p-6 mb-8 rounded-r-xl shadow-sm">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-orange-500" />
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-semibold text-orange-800 mb-2">
                  ⚠️ Stock Alert - Immediate Attention Required
                </h3>
                <p className="text-orange-700 mb-4">
                  {lowStockProducts.length} product{lowStockProducts.length > 1 ? 's are' : ' is'} running low on stock (10 units or less)
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {lowStockProducts.slice(0, 6).map((product) => (
                    <div key={product.id} className="bg-white px-4 py-3 rounded-lg shadow-sm border border-orange-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">{product.name}</p>
                          <p className="text-sm text-gray-600">{product.category}</p>
                        </div>
                        <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                          {product.available_stock || 0} left
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                {lowStockProducts.length > 6 && (
                  <p className="mt-4 text-sm text-orange-600 font-medium">
                    +{lowStockProducts.length - 6} more products need immediate restocking
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Simple Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Search size={24} className="mr-3 text-indigo-600" />
              <h2 className="text-xl font-semibold text-gray-900">Search Products</h2>
            </div>
            <span className="text-sm text-gray-600">
              {filteredProducts.length} of {products.length} products
            </span>
          </div>
          
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, category, or HS code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>
          
          {searchTerm && (
            <div className="mt-3 flex justify-between items-center">
              <span className="text-sm text-gray-600">
                Found {filteredProducts.length} matching products
              </span>
              <button
                onClick={clearFilters}
                className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
              >
                Clear Search
              </button>
            </div>
          )}
        </div>

        {/* View Mode Toggle */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Inventory Display</h2>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-600">View Mode:</span>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    viewMode === 'list' 
                      ? 'bg-indigo-600 text-white shadow-sm' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <List size={16} className="inline mr-1" />
                  List View
                </button>
                <button
                  onClick={() => setViewMode('grouped')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    viewMode === 'grouped' 
                      ? 'bg-indigo-600 text-white shadow-sm' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Folder size={16} className="inline mr-1" />
                  Category View
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stock Action Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex items-center mb-6">
            <Plus size={24} className="mr-3 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900">Quick Stock Addition</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Select Product</label>
              <select
                value={selectedProduct?.id || ''}
                onChange={(e) => {
                  const product = filteredProducts.find(p => p.id == e.target.value);
                  setSelectedProduct(product);
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              >
                <option value="">Choose a product...</option>
                {filteredProducts.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} (Available: {product.available_stock || 0}, Total: {product.total_stock})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Action</label>
              <select
                value={stockAction}
                onChange={(e) => setStockAction(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              >
                <option value="">Select Action</option>
                <option value="increase">➕ Add Stock</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity</label>
              <input
                type="number"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                placeholder="Enter quantity"
                min="1"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              />
            </div>

            <button
              onClick={handleStockUpdate}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center transition-all shadow-sm"
            >
              <Plus size={16} className="mr-2" />
              Add Stock
            </button>

            {selectedProduct && (
              <div className="bg-gray-50 p-4 rounded-lg border">
                <p className="text-sm font-semibold text-gray-900">{selectedProduct.name}</p>
                <p className="text-xs text-gray-600 mt-1">Category: {selectedProduct.category}</p>
                <p className="text-xs text-gray-600">HS Code: {selectedProduct.hsCode || 'N/A'}</p>
                <p className="text-xs text-gray-600">Available Stock: {selectedProduct.available_stock || 0} units</p>
                <p className="text-xs text-gray-600">Total Stock: {selectedProduct.total_stock} units</p>
              </div>
            )}
          </div>
        </div>

        {/* Products Display */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              <span className="ml-3 text-gray-600 font-medium">Loading products...</span>
            </div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <Package size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Products Found</h3>
            <p className="text-gray-600 mb-4">
              No products match your search criteria. Try adjusting your filters.
            </p>
            <button
              onClick={clearFilters}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-all"
            >
              Clear All Filters
            </button>
          </div>
        ) : viewMode === 'list' ? (
          /* List View */
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <List size={20} className="mr-3 text-indigo-600" />
                  <h2 className="text-xl font-semibold text-gray-900">All Products</h2>
                </div>
                <span className="text-sm text-gray-600 font-medium">
                  {filteredProducts.length} products
                </span>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Product Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      HS Code
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Stock Levels
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Quick Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.map((product) => {
                    return (
                      <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{product.name}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              ID: {product.id}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                            {product.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {product.hsCode || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                          Rs. {parseFloat(product.price).toFixed(2)}
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-lg font-bold text-gray-900">{product.available_stock || 0}</div>
                            <div className="text-xs text-gray-500">available</div>
                            <div className="text-sm text-gray-600 mt-1">
                              Total: {product.total_stock} units
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStockStatus(product).color}`}>
                            {getStockStatus(product).text}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              placeholder="Qty"
                              min="1"
                              className="w-16 px-2 py-1 border border-gray-300 rounded text-center text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  addStockDirectly(product, e.target.value);
                                  e.target.value = '';
                                }
                              }}
                            />
                            <button
                              onClick={(e) => {
                                const input = e.target.parentElement.querySelector('input');
                                addStockDirectly(product, input.value);
                                input.value = '';
                              }}
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-xs font-medium transition-all flex items-center"
                              title="Add stock"
                            >
                              <Plus size={12} className="mr-1" />
                              Add
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Category Grouped View */
          <div className="space-y-8">
            {Object.entries(groupedProducts)
              .filter(([, categoryProducts]) => 
                categoryProducts.some(product => filteredProducts.includes(product))
              )
              .map(([category, categoryProducts]) => {
                const visibleProducts = categoryProducts.filter(product => 
                  filteredProducts.includes(product)
                );
                
                if (visibleProducts.length === 0) return null;

                return (
                  <div key={category} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Folder size={24} className="mr-3 text-indigo-600" />
                          <h2 className="text-xl font-semibold text-gray-900 capitalize">
                            {category}
                          </h2>
                        </div>
                        <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-semibold">
                          {visibleProducts.length} products
                        </span>
                      </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              Product Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              HS Code
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              Price
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              Stock Levels
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              Quick Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {visibleProducts.map((product) => {
                            return (
                              <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                  <div className="text-sm font-semibold text-gray-900">{product.name}</div>
                                  <div className="text-xs text-gray-500 mt-1">ID: {product.id}</div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                  {product.hsCode || 'N/A'}
                                </td>
                                <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                                  Rs. {parseFloat(product.price).toFixed(2)}
                                </td>
                                <td className="px-6 py-4">
                                  <div>
                                    <div className="text-lg font-bold text-gray-900">{product.available_stock || 0}</div>
                                    <div className="text-xs text-gray-500">available</div>
                                    {/* <div className="text-sm text-gray-600 mt-1">
                                      Total: {product.total_stock} units
                                    </div> */}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStockStatus(product).color}`}>
                                    {getStockStatus(product).text}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center space-x-2">
                                    <input
                                      type="number"
                                      placeholder="Qty"
                                      min="1"
                                      className="w-16 px-2 py-1 border border-gray-300 rounded text-center text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                      onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                          addStockDirectly(product, e.target.value);
                                          e.target.value = '';
                                        }
                                      }}
                                    />
                                    <button
                                      onClick={(e) => {
                                        const input = e.target.parentElement.querySelector('input');
                                        addStockDirectly(product, input.value);
                                        input.value = '';
                                      }}
                                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-xs font-medium transition-all flex items-center"
                                      title="Add stock"
                                    >
                                      <Plus size={12} className="mr-1" />
                                      Add
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })
            }
          </div>
        )}
      </main>
    </div>
  );
};

export default StockPage;
 