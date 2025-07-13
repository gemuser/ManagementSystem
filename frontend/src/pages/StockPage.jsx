import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import Sidebar from '../components/Sidebar';
import Swal from 'sweetalert2';

const StockPage = () => {
  const [products, setProducts] = useState([]);
  const [groupedProducts, setGroupedProducts] = useState({});
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [stockAction, setStockAction] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [searchFilters, setSearchFilters] = useState({
    name: '',
    hsCode: '',
    category: '',
    stockStatus: 'all'
  });
  const [viewMode, setViewMode] = useState('grouped'); // 'grouped' or 'list'

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [products, searchFilters]);

  const fetchProducts = async () => {
    try {
      const res = await axios.get('/products/list');
      const productsData = res.data.data;
      setProducts(productsData);
      
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
    }
  };

  const applyFilters = () => {
    let filtered = products;

    // Filter by name
    if (searchFilters.name.trim()) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchFilters.name.toLowerCase())
      );
    }

    // Filter by HS code
    if (searchFilters.hsCode.trim()) {
      filtered = filtered.filter(product =>
        product.hsCode.toLowerCase().includes(searchFilters.hsCode.toLowerCase())
      );
    }

    // Filter by category
    if (searchFilters.category.trim()) {
      filtered = filtered.filter(product =>
        product.category.toLowerCase().includes(searchFilters.category.toLowerCase())
      );
    }

    // Filter by stock status
    if (searchFilters.stockStatus !== 'all') {
      filtered = filtered.filter(product => {
        const stock = parseInt(product.total_stock);
        switch (searchFilters.stockStatus) {
          case 'out_of_stock':
            return stock === 0;
          case 'low_stock':
            return stock > 0 && stock < 10;
          case 'medium_stock':
            return stock >= 10 && stock < 50;
          case 'high_stock':
            return stock >= 50;
          default:
            return true;
        }
      });
    }

    setFilteredProducts(filtered);
  };

  const clearFilters = () => {
    setSearchFilters({
      name: '',
      hsCode: '',
      category: '',
      stockStatus: 'all'
    });
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
      fetchProducts();
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

      fetchProducts();
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

  const getStockStatus = (stock) => {
    if (stock === 0) return { text: 'Out of Stock', color: 'text-red-600 bg-red-100' };
    if (stock < 10) return { text: 'Low Stock', color: 'text-orange-600 bg-orange-100' };
    if (stock < 50) return { text: 'Medium Stock', color: 'text-yellow-600 bg-yellow-100' };
    return { text: 'High Stock', color: 'text-green-600 bg-green-100' };
  };

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-6 bg-gray-100 min-h-screen">
        <h1 className="text-3xl font-bold mb-6">📦 Stock Management</h1>

        {/* Search and Filter Section */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">🔍 Search & Filter Products</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search by Name</label>
              <input
                type="text"
                placeholder="Enter product name..."
                value={searchFilters.name}
                onChange={(e) => setSearchFilters({ ...searchFilters, name: e.target.value })}
                className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search by HS Code</label>
              <input
                type="text"
                placeholder="Enter HS code..."
                value={searchFilters.hsCode}
                onChange={(e) => setSearchFilters({ ...searchFilters, hsCode: e.target.value })}
                className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search by Category</label>
              <input
                type="text"
                placeholder="Enter category..."
                value={searchFilters.category}
                onChange={(e) => setSearchFilters({ ...searchFilters, category: e.target.value })}
                className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock Status</label>
              <select
                value={searchFilters.stockStatus}
                onChange={(e) => setSearchFilters({ ...searchFilters, stockStatus: e.target.value })}
                className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Products</option>
                <option value="out_of_stock">Out of Stock (0)</option>
                <option value="low_stock">Low Stock (1-9)</option>
                <option value="medium_stock">Medium Stock (10-49)</option>
                <option value="high_stock">High Stock (50+)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={clearFilters}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Clear Filters
              </button>
              <span className="text-sm text-gray-600">
                Showing {filteredProducts.length} of {products.length} products
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">View:</span>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 rounded ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
              >
                List View
              </button>
              <button
                onClick={() => setViewMode('grouped')}
                className={`px-3 py-1 rounded ${viewMode === 'grouped' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
              >
                Category View
              </button>
            </div>
          </div>
        </div>

        {/* Stock Action Form */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Add Stock</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <select
              value={selectedProduct?.id || ''}
              onChange={(e) => {
                const product = filteredProducts.find(p => p.id == e.target.value);
                setSelectedProduct(product);
              }}
              className="border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Product</option>
              {filteredProducts.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} (Current: {product.total_stock})
                </option>
              ))}
            </select>

            <select
              value={stockAction}
              onChange={(e) => setStockAction(e.target.value)}
              className="border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Action</option>
              <option value="increase">Add Stock</option>
            </select>

            <input
              type="number"
              value={stockQuantity}
              onChange={(e) => setStockQuantity(e.target.value)}
              placeholder="Quantity"
              min="1"
              className="border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

            <button
              onClick={handleStockUpdate}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Add Stock
            </button>

            <div className="text-center">
              {selectedProduct && (
                <div className="text-sm text-gray-600">
                  <p className="font-medium">{selectedProduct.name}</p>
                  <p>Category: {selectedProduct.category}</p>
                  <p>HS Code: {selectedProduct.hsCode}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Products Display */}
        {viewMode === 'list' ? (
          /* List View */
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">📋 All Products</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full table-auto border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-3 border text-left">Product Name</th>
                    <th className="p-3 border text-left">Category</th>
                    <th className="p-3 border text-left">HS Code</th>
                    <th className="p-3 border text-left">Price</th>
                    <th className="p-3 border text-left">Current Stock</th>
                    <th className="p-3 border text-left">Status</th>
                    <th className="p-3 border text-left">Quick Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => {
                    const status = getStockStatus(product.total_stock);
                    return (
                      <tr key={product.id} className="border-t hover:bg-gray-50">
                        <td className="p-3 border font-medium">{product.name}</td>
                        <td className="p-3 border">{product.category}</td>
                        <td className="p-3 border">{product.hsCode}</td>
                        <td className="p-3 border">Rs. {product.price}</td>
                        <td className="p-3 border text-center font-bold">{product.total_stock}</td>
                        <td className="p-3 border">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                            {status.text}
                          </span>
                        </td>
                        <td className="p-3 border">
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              placeholder="Qty"
                              min="1"
                              className="border p-1 rounded w-16 text-center text-sm"
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
                              className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600"
                              title="Add stock"
                            >
                              + Add
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
          <div className="space-y-6">
            {Object.entries(groupedProducts)
              .filter(([category, categoryProducts]) => 
                categoryProducts.some(product => filteredProducts.includes(product))
              )
              .map(([category, categoryProducts]) => {
                const visibleProducts = categoryProducts.filter(product => 
                  filteredProducts.includes(product)
                );
                
                if (visibleProducts.length === 0) return null;

                return (
                  <div key={category} className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4 capitalize">
                      📂 {category} ({visibleProducts.length} products)
                    </h2>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full table-auto border border-gray-300">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="p-3 border text-left">Product Name</th>
                            <th className="p-3 border text-left">HS Code</th>
                            <th className="p-3 border text-left">Price</th>
                            <th className="p-3 border text-left">Current Stock</th>
                            <th className="p-3 border text-left">Status</th>
                            <th className="p-3 border text-left">Quick Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {visibleProducts.map((product) => {
                            const status = getStockStatus(product.total_stock);
                            return (
                              <tr key={product.id} className="border-t hover:bg-gray-50">
                                <td className="p-3 border font-medium">{product.name}</td>
                                <td className="p-3 border">{product.hsCode}</td>
                                <td className="p-3 border">Rs. {product.price}</td>
                                <td className="p-3 border text-center font-bold">{product.total_stock}</td>
                                <td className="p-3 border">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                                    {status.text}
                                  </span>
                                </td>
                                <td className="p-3 border">
                                  <div className="flex items-center space-x-2">
                                    <input
                                      type="number"
                                      placeholder="Qty"
                                      min="1"
                                      className="border p-1 rounded w-16 text-center text-sm"
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
                                      className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600"
                                      title="Add stock"
                                    >
                                      + Add
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

        {filteredProducts.length === 0 && (
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <p className="text-gray-500">No products found matching your search criteria.</p>
            <button
              onClick={clearFilters}
              className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Clear Filters to Show All Products
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default StockPage;
