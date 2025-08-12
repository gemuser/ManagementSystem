import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import DHISidebar from '../components/DHISidebar';
import RsIcon from '../components/RsIcon';
import Swal from 'sweetalert2';
import { dataRefreshEmitter } from '../hooks/useDataRefresh';
import { 
  ShoppingCart, 
  Package, 
  Plus, 
  Receipt,
  ShoppingBag,
  Trash2,
  CheckCircle,
  RefreshCw,
  AlertCircle,
  Search,
  Filter,
  BarChart3,
  Grid3X3
} from 'lucide-react';

const SalesPage = () => {
  const [products, setProducts] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [invoiceNo, setInvoiceNo] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [searchFilters, setSearchFilters] = useState({
    name: '',
    category: '',
    priceRange: 'all'
  });
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchProducts();
    
    // Subscribe to data refresh events
    const unsubscribe = dataRefreshEmitter.subscribe(async () => {
      console.log('Data refresh event received in SalesPage');
      setRefreshing(true);
      await fetchProducts(true); // Force refresh when receiving events
      setRefreshing(false);
    });
    
    return unsubscribe;
  }, []);

  // Filter products based on search criteria
  useEffect(() => {
    let filtered = availableProducts;

    // Filter by name
    if (searchFilters.name.trim()) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchFilters.name.toLowerCase())
      );
    }

    // Filter by category
    if (searchFilters.category.trim()) {
      filtered = filtered.filter(product =>
        product.category === searchFilters.category
      );
    }

    // Filter by price range
    if (searchFilters.priceRange !== 'all') {
      filtered = filtered.filter(product => {
        const price = parseFloat(product.price);
        switch (searchFilters.priceRange) {
          case 'low':
            return price < 500;
          case 'medium':
            return price >= 500 && price < 2000;
          case 'high':
            return price >= 2000;
          default:
            return true;
        }
      });
    }

    setFilteredProducts(filtered);
  }, [availableProducts, searchFilters]);

  const clearFilters = () => {
    setSearchFilters({
      name: '',
      category: '',
      priceRange: 'all'
    });
  };

  const fetchProducts = async (forceRefresh = false) => {
    try {
      if (!forceRefresh) setLoading(true);
      else setRefreshing(true);
      
      const res = await axios.get('/products/list', {
        // Add timestamp to prevent caching when force refreshing
        params: forceRefresh ? { t: Date.now() } : {}
      });
      const allProducts = res.data.data || [];
      
      // Validate and sanitize product data
      const validProducts = allProducts.filter(product => {
        if (!product || !product.id) {
          console.warn('Invalid product data:', product);
          return false;
        }
        return true;
      }).map(product => ({
        ...product,
        name: product.name || 'Unknown Product',
        category: product.category || 'No Category',
        price: parseFloat(product.price) || 0,
        available_stock: parseInt(product.available_stock) || 0
      }));
      
      setProducts(validProducts);
      
      // Filter products with available stock > 0
      const inStock = validProducts.filter(product => product.available_stock > 0);
      setAvailableProducts(inStock);
      setFilteredProducts(inStock);
    } catch (err) {
      console.error('Error fetching products:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error Loading Products',
        text: 'Failed to load products. Please check your connection.',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getAvailableStock = async (productId) => {
    try {
      // Find the product and return its available stock
      const product = products.find(p => p.id == productId);
      return product ? (product.available_stock || 0) : 0;
    } catch (err) {
      console.error('Error getting available stock:', err);
      return 0;
    }
  };

  const toggleProductSelection = (product) => {
    try {
      if (!product || !product.id) {
        console.error('Invalid product data:', product);
        return;
      }

      const existingIndex = selectedProducts.findIndex(p => p.id === product.id);
      
      if (existingIndex >= 0) {
        // Remove product from selection
        setSelectedProducts(selectedProducts.filter(p => p.id !== product.id));
      } else {
        // Add product to selection with default values
        const productPrice = parseFloat(product.price) || 0;
        const newProduct = {
          id: product.id,
          name: product.name || 'Unknown Product',
          category: product.category || '',
          price: productPrice,
          available_stock: product.available_stock || 0,
          quantity: 1,
          customPrice: productPrice,
          total_price: productPrice
        };
        setSelectedProducts(prev => [...prev, newProduct]);
      }
    } catch (error) {
      console.error('Error toggling product selection:', error);
      Swal.fire({
        icon: 'error',
        title: 'Selection Error',
        text: 'Failed to select product. Please try again.',
        confirmButtonColor: '#ef4444'
      });
    }
  };

  const updateProductQuantity = async (productId, newQuantity) => {
    if (isNaN(newQuantity) || newQuantity <= 0) {
      setSelectedProducts(selectedProducts.filter(p => p.id !== productId));
      return;
    }

    const availableStock = await getAvailableStock(productId);
    if (newQuantity > availableStock) {
      Swal.fire({
        icon: 'error',
        title: 'Insufficient Stock',
        text: `Only ${availableStock} units available`,
        confirmButtonColor: '#ef4444'
      });
      return;
    }

    setSelectedProducts(selectedProducts.map(product => {
      if (product.id === productId) {
        const price = parseFloat(product.customPrice) || 0;
        return {
          ...product,
          quantity: parseInt(newQuantity),
          total_price: price * parseInt(newQuantity)
        };
      }
      return product;
    }));
  };

  const updateProductPrice = (productId, newPrice) => {
    const price = parseFloat(newPrice);
    if (isNaN(price) || price <= 0) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Price',
        text: 'Price must be greater than 0',
        confirmButtonColor: '#ef4444'
      });
      return;
    }

    setSelectedProducts(selectedProducts.map(product => {
      if (product.id === productId) {
        const quantity = parseInt(product.quantity) || 1;
        return {
          ...product,
          customPrice: price,
          total_price: price * quantity
        };
      }
      return product;
    }));
  };

  const calculateTotalAmount = () => {
    return selectedProducts.reduce((total, product) => {
      const productTotal = parseFloat(product.total_price) || 0;
      return total + productTotal;
    }, 0);
  };

  const calculateDiscountPercentage = (originalPrice, sellingPrice) => {
    if (!originalPrice || originalPrice <= 0) return 0;
    const discount = ((originalPrice - sellingPrice) / originalPrice) * 100;
    return Math.max(0, discount); // Ensure discount is never negative
  };

  const calculateTotalDiscount = () => {
    return selectedProducts.reduce((totalDiscount, product) => {
      const originalPrice = parseFloat(product.price) || 0;
      const sellingPrice = parseFloat(product.customPrice) || 0;
      const quantity = parseInt(product.quantity) || 1;
      
      const discountPerUnit = Math.max(0, originalPrice - sellingPrice);
      return totalDiscount + (discountPerUnit * quantity);
    }, 0);
  };

  const processSale = async () => {
    if (selectedProducts.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'No Products Selected',
        text: 'Please select products before processing sale',
        confirmButtonColor: '#3085d6'
      });
      return;
    }

    if (!invoiceNo) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Invoice Number',
        text: 'Please enter an invoice number',
        confirmButtonColor: '#3085d6'
      });
      return;
    }

    // Show confirmation with selected products
    const totalAmount = calculateTotalAmount();
    const totalDiscount = calculateTotalDiscount();

    const result = await Swal.fire({
      title: '',
      html: `
        <div class="text-center mb-6">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-400 to-green-600 rounded-full mb-4">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-gray-900 mb-2">Confirm Sale</h2>
          <p class="text-gray-600">Review your order details before completing the sale</p>
        </div>
        
        <div class="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 mb-6 border border-gray-200">
          <!-- Invoice Header -->
          <div class="flex items-center justify-center mb-6">
            <div class="bg-white rounded-lg px-4 py-2 shadow-sm border">
              <div class="flex items-center space-x-2">
                <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                <span class="text-sm font-medium text-gray-600">Invoice:</span>
                <span class="font-bold text-gray-900">${invoiceNo}</span>
              </div>
            </div>
          </div>

          <!-- Products List -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-4">
            <div class="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h3 class="text-sm font-semibold text-gray-700">Order Summary</h3>
            </div>
            <div class="divide-y divide-gray-100">
              ${selectedProducts.map(product => {
                const originalPrice = parseFloat(product.price) || 0;
                const sellingPrice = parseFloat(product.customPrice) || 0;
                const discountPercent = calculateDiscountPercentage(originalPrice, sellingPrice);
                const hasDiscount = discountPercent > 0;
                
                return `
                <div class="px-4 py-3">
                  <div class="flex justify-between items-start">
                    <div class="flex-1">
                      <div class="flex items-center space-x-2">
                        <span class="font-medium text-gray-900">${product.name}</span>
                        <span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">× ${product.quantity}</span>
                      </div>
                      ${hasDiscount ? `
                      <div class="flex items-center space-x-2 mt-1">
                        <span class="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                          🎉 ${discountPercent.toFixed(1)}% OFF
                        </span>
                      </div>
                      ` : ''}
                    </div>
                    <div class="text-right">
                      ${hasDiscount ? `
                      <div class="text-xs text-gray-400 line-through">Rs. ${(originalPrice * product.quantity).toFixed(2)}</div>
                      ` : ''}
                      <span class="text-lg font-bold text-gray-900">Rs. ${product.total_price.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Summary -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            ${totalDiscount > 0 ? `
            <div class="flex justify-between items-center py-2 border-b border-gray-100 mb-3">
              <span class="text-sm text-gray-600">Subtotal:</span>
              <span class="text-sm font-medium text-gray-900">Rs. ${(totalAmount + totalDiscount).toFixed(2)}</span>
            </div>
            <div class="flex justify-between items-center py-2 border-b border-gray-100 mb-3">
              <span class="text-sm text-green-600 flex items-center">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                </svg>
                Total Savings:
              </span>
              <span class="text-sm font-medium text-green-600">- Rs. ${totalDiscount.toFixed(2)}</span>
            </div>
            ` : ''}
            <div class="flex justify-between items-center py-3">
              <span class="text-lg font-bold text-gray-900">Final Total:</span>
              <span class="text-2xl font-bold text-green-600">Rs. ${totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div class="text-center">
          <p class="text-sm text-gray-500 mb-2">
            <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            ${selectedProducts.length} item${selectedProducts.length > 1 ? 's' : ''} • ${new Date().toLocaleDateString()}
          </p>
        </div>
      `,
      icon: null,
      showCancelButton: true,
      confirmButtonColor: '#059669',
      cancelButtonColor: '#6b7280',
      confirmButtonText: '✨ Complete Sale',
      cancelButtonText: '❌ Cancel',
      buttonsStyling: false,
      customClass: {
        popup: 'rounded-2xl border-0 shadow-2xl',
        title: 'hidden',
        htmlContainer: 'p-0',
        actions: 'gap-3 mt-6',
        confirmButton: 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-200 hover:scale-105',
        cancelButton: 'bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-8 rounded-xl border border-gray-300 transition-all duration-200'
      },
      width: 600,
      padding: '2rem'
    });

    if (!result.isConfirmed) return;

    try {
      // Process each selected product
      for (const product of selectedProducts) {
        const originalPrice = parseFloat(product.price) || 0;
        const sellingPrice = parseFloat(product.customPrice) || 0;
        const discountAmount = Math.max(0, originalPrice - sellingPrice);
        const discountPercent = calculateDiscountPercentage(originalPrice, sellingPrice);
        
        await axios.post('/sales/create', {
          invoice_no: invoiceNo,
          product_id: product.id,
          quantity_sold: product.quantity,
          sale_price: product.customPrice,
          original_price: originalPrice,
          discount_amount: discountAmount,
          discount_percent: discountPercent
        });
      }

      // Show success message
      Swal.fire({
        title: '',
        html: `
          <div class="text-center">
            <div class="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-400 to-green-600 rounded-full mb-6">
              <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 class="text-2xl font-bold text-gray-900 mb-3">🎉 Sale Completed!</h2>
            <div class="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6 mb-4 border border-green-200">
              <div class="flex items-center justify-center space-x-3 mb-3">
                <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                <span class="text-lg font-semibold text-green-800">Invoice: ${invoiceNo}</span>
              </div>
              <div class="text-3xl font-bold text-green-700">Rs. ${calculateTotalAmount().toFixed(2)}</div>
              <div class="text-sm text-green-600 mt-1">Payment Successfully Processed</div>
            </div>
            <p class="text-gray-600">
              <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              Transaction completed at ${new Date().toLocaleString()}
            </p>
          </div>
        `,
        icon: null,
        confirmButtonColor: '#059669',
        confirmButtonText: '✨ Great!',
        timer: 4000,
        timerProgressBar: true,
        customClass: {
          popup: 'rounded-2xl border-0 shadow-2xl',
          title: 'hidden',
          htmlContainer: 'p-0',
          confirmButton: 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-200 hover:scale-105'
        },
        width: 500,
        padding: '2rem'
      });

      // Reset form and refresh data
      setSelectedProducts([]);
      setInvoiceNo('');
      
      // Immediately emit refresh event, then refresh local data
      dataRefreshEmitter.emit(); // Notify other components first
      
      // Wait for backend to process, then refresh local data
      setTimeout(async () => {
        await fetchProducts(true); // Force refresh to update available stock
      }, 300); // Reduced delay for faster updates
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Sale Failed',
        text: err.response?.data?.message || 'Unable to process sale',
        confirmButtonColor: '#ef4444'
      });
    }
  };

  return (
    <div className="flex">
      <DHISidebar />
      <main className="flex-1 ml-72 p-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <ShoppingCart size={32} className="mr-4 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Sales Point</h1>
              <p className="text-gray-600 mt-1">Create new sales and manage transactions</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={fetchProducts}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center transition-all"
              title="Refresh products"
            >
              <RefreshCw size={16} className="mr-2" />
              Refresh
            </button>
            
          </div>
        </div>

        {/* Sales Overview Stats */}
        
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Side - Product Search & Invoice */}
          <div className="lg:col-span-2 space-y-8">
            {/* Product Search & Selection - Combined Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              {/* Find Products Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <Search size={24} className="mr-3 text-indigo-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Find & Select Products</h2>
                </div>
                <div className="flex items-center space-x-2">
                  {refreshing && (
                    <div className="flex items-center text-blue-600 mr-2">
                      <RefreshCw size={14} className="animate-spin mr-1" />
                      <span className="text-xs">Syncing...</span>
                    </div>
                  )}
                  <Filter size={16} className="text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {filteredProducts.length} of {availableProducts.length} products
                  </span>
                </div>
              </div>
              
              {/* Search Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Package size={14} className="inline mr-1" />
                    Search by Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter product name..."
                    value={searchFilters.name}
                    onChange={(e) => setSearchFilters({ ...searchFilters, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <BarChart3 size={14} className="inline mr-1" />
                    Category
                  </label>
                  <select
                    value={searchFilters.category}
                    onChange={(e) => setSearchFilters({ ...searchFilters, category: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  >
                    <option value="">All Categories</option>
                    {[...new Set(availableProducts.map(p => p.category))].sort().map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <RsIcon size={14} className="inline mr-1" />
                    Price Range
                  </label>
                  <select
                    value={searchFilters.priceRange}
                    onChange={(e) => setSearchFilters({ ...searchFilters, priceRange: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  >
                    <option value="all">All Prices</option>
                    <option value="low">Under Rs. 500</option>
                    <option value="medium">Rs. 500 - 2,000</option>
                    <option value="high">Above Rs. 2,000</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200 mb-6">
                <button
                  onClick={clearFilters}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-medium transition-all"
                >
                  Clear Filters
                </button>
              </div>

              {/* Product Selection Section */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <Package size={24} className="mr-3 text-indigo-600" />
                    <h3 className="text-xl font-semibold text-gray-900">Available Products</h3>
                  </div>
                  <span className="text-sm text-gray-600 font-medium">
                    {filteredProducts.length} products available
                  </span>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                      <span className="ml-3 text-gray-600">Loading products...</span>
                    </div>
                  ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-8">
                      <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-500 mb-2">No products available</p>
                      <p className="text-sm text-gray-400">Try adjusting your search filters</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredProducts.map((product) => {
                        try {
                          const isSelected = selectedProducts.find(p => p.id === product.id);
                          return (
                            <div 
                              key={product.id} 
                              className={`border rounded-lg p-3 transition-all cursor-pointer hover:shadow-sm ${
                                isSelected 
                                  ? 'border-green-500 bg-green-50' 
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                              onClick={() => toggleProductSelection(product)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900 text-sm">{product.name || 'Unknown Product'}</h4>
                                  <div className="flex items-center justify-between mt-1">
                                    <span className="text-xs text-gray-500">{product.category || 'No Category'}</span>
                                    <span className="text-sm font-semibold text-gray-900">Rs. {parseFloat(product.price || 0).toFixed(2)}</span>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-3 ml-4">
                                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                    {product.available_stock || 0} stock
                                  </span>
                                  {isSelected && (
                                    <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">
                                      ✓
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        } catch (error) {
                          console.error('Error rendering product:', product, error);
                          return (
                            <div key={product.id || Math.random()} className="border border-red-200 rounded-lg p-3 bg-red-50">
                              <p className="text-red-600 text-sm">Error loading product</p>
                            </div>
                          );
                        }
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Products will be displayed here - Invoice details moved to right side */}
          </div>

          {/* Right Side - Invoice Details & Selected Products Management */}
          <div className="lg:col-span-1">
            {/* Right Side Functions Container */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-fit">
              {/* Invoice Details */}
              <div className="border-b border-gray-100 p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Invoice Details</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Invoice Number
                  </label>
                  <input
                    type="text"
                    value={invoiceNo}
                    onChange={(e) => setInvoiceNo(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter invoice number"
                  />
                </div>
              </div>

              {/* Selected Products */}
              <div className="border-b border-gray-100 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-medium text-gray-900">Selected Items</h3>
                  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {selectedProducts.length} items
                  </span>
                </div>
              
              {selectedProducts.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500 mb-2">No products selected</p>
                  <p className="text-sm text-gray-400">Click on products to select them</p>
                </div>
              ) : (
                <div>
                  {/* Selected Products */}
                  <div className="space-y-3 mb-6 max-h-80 overflow-y-auto">
                    {selectedProducts.map((product) => {
                      const originalPrice = parseFloat(product.price) || 0;
                      const sellingPrice = parseFloat(product.customPrice) || 0;
                      const discountPercent = calculateDiscountPercentage(originalPrice, sellingPrice);
                      const hasDiscount = discountPercent > 0;
                      
                      return (
                      <div key={product.id} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 text-sm">{product.name}</h4>
                            <div className="text-xs text-gray-500 mt-1">
                              {hasDiscount ? (
                                <div className="flex items-center space-x-2">
                                  <span className="line-through text-gray-400">Rs. {originalPrice}</span>
                                  <span className="text-green-600 font-medium">Rs. {sellingPrice}</span>
                                  <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs">
                                    {discountPercent.toFixed(1)}% off
                                  </span>
                                </div>
                              ) : (
                                <span>Rs. {sellingPrice} per unit</span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => setSelectedProducts(selectedProducts.filter(p => p.id !== product.id))}
                            className="text-gray-400 hover:text-red-500 p-1"
                            title="Remove"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-1">
                              <label className="text-xs text-gray-500">Qty:</label>
                              <input
                                type="number"
                                value={product.quantity}
                                onChange={(e) => updateProductQuantity(product.id, parseInt(e.target.value))}
                                className="w-16 border border-gray-300 rounded px-2 py-1 text-xs text-center focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                min="1"
                              />
                            </div>
                            <div className="flex items-center space-x-1">
                              <label className="text-xs text-gray-500">Price:</label>
                              <input
                                type="number"
                                value={product.customPrice}
                                onChange={(e) => updateProductPrice(product.id, parseFloat(e.target.value))}
                                className="w-20 border border-gray-300 rounded px-2 py-1 text-xs text-center focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                min="0.01"
                                step="0.01"
                              />
                            </div>
                          </div>
                          <span className="font-semibold text-sm text-gray-900">Rs. {product.total_price.toFixed(2)}</span>
                        </div>
                      </div>
                      );
                    })}
                  </div>

                  {/* Summary */}
                  <div className="border-t border-gray-200 pt-4">
                    {calculateTotalDiscount() > 0 && (
                      <div className="flex justify-between items-center mb-2 text-sm">
                        <span className="text-gray-600">Total Discount:</span>
                        <span className="font-medium text-green-600">Rs. {calculateTotalDiscount().toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-900">Total:</span>
                      <span className="text-lg font-bold text-green-600">
                        Rs. {calculateTotalAmount().toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Selected Products Quick Summary */}
            {selectedProducts.length > 0 && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Quick Summary</span>
                  <span className="text-sm text-blue-600 font-medium">
                    {selectedProducts.length} items
                  </span>
                </div>
                <div className="space-y-1">
                  {selectedProducts.slice(0, 3).map((product) => (
                    <div key={product.id} className="flex justify-between items-center text-xs">
                      <span className="text-gray-600 truncate">{product.name} x {product.quantity}</span>
                      <span className="font-medium text-gray-900">Rs. {product.total_price.toFixed(2)}</span>
                    </div>
                  ))}
                  {selectedProducts.length > 3 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{selectedProducts.length - 3} more items
                    </div>
                  )}
                  <div className="border-t border-blue-300 pt-1 mt-1">
                    <div className="flex justify-between items-center font-bold text-sm">
                      <span>Total:</span>
                      <span className="text-green-600">Rs. {calculateTotalAmount().toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Complete Sale Button - Now in right sidebar */}
            <div className="mt-6 border-t border-gray-100 pt-6">
              <button
                onClick={processSale}
                className={`w-full px-4 py-3 rounded-lg font-semibold text-base flex items-center justify-center transition-all duration-200 ${
                  !invoiceNo || selectedProducts.length === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200' 
                    : 'bg-green-600 hover:bg-green-700 text-white shadow-sm hover:shadow-md'
                }`}
                disabled={!invoiceNo || selectedProducts.length === 0}
              >
                <Receipt size={18} className="mr-2" />
                {!invoiceNo || selectedProducts.length === 0 ? 'Complete Sale' : `Complete Sale • Rs. ${calculateTotalAmount().toFixed(2)}`}
              </button>
              
              {(!invoiceNo || selectedProducts.length === 0) && (
                <div className="mt-3 text-center">
                  <p className="text-xs text-red-500">
                    {!invoiceNo ? 'Invoice number required' : 'Select products to continue'}
                  </p>
                </div>
              )}
            </div>
          </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SalesPage;
