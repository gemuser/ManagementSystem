import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import Sidebar from '../components/Sidebar';
import Swal from 'sweetalert2';
import { dataRefreshEmitter } from '../hooks/useDataRefresh';
import { 
  ShoppingCart, 
  FileText, 
  Package, 
  Plus, 
  CreditCard,
  Receipt,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Trash2,
  Edit3,
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
  const [cartItems, setCartItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState('');
  const [searchFilters, setSearchFilters] = useState({
    name: '',
    category: '',
    priceRange: 'all'
  });
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
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
        product.category.toLowerCase().includes(searchFilters.category.toLowerCase())
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

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/products/list');
      const allProducts = res.data.data;
      setProducts(allProducts);
      
      // Filter products with available stock > 0
      const inStock = allProducts.filter(product => (product.available_stock || 0) > 0);
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

  const addToCart = async () => {
    if (!selectedProduct || !quantity) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Please select a product and enter quantity',
        confirmButtonColor: '#3085d6'
      });
      return;
    }

    const product = products.find(p => p.id == selectedProduct);
    if (!product) return;

    // Check if product already in cart
    const existingItemIndex = cartItems.findIndex(item => item.product_id == selectedProduct);
    const currentCartQuantity = existingItemIndex >= 0 ? cartItems[existingItemIndex].quantity : 0;
    const newTotalQuantity = currentCartQuantity + parseInt(quantity);

    // Check available stock
    const availableStock = await getAvailableStock(selectedProduct);
    if (newTotalQuantity > availableStock) {
      Swal.fire({
        icon: 'error',
        title: 'Insufficient Stock',
        text: `Only ${availableStock} units available. You already have ${currentCartQuantity} in cart.`,
        confirmButtonColor: '#ef4444'
      });
      return;
    }

    if (existingItemIndex >= 0) {
      // Update existing item
      const updatedCart = [...cartItems];
      updatedCart[existingItemIndex].quantity = newTotalQuantity;
      updatedCart[existingItemIndex].total_price = updatedCart[existingItemIndex].price * newTotalQuantity;
      setCartItems(updatedCart);
    } else {
      // Add new item
      const cartItem = {
        product_id: product.id,
        product_name: product.name,
        price: parseFloat(product.price),
        quantity: parseInt(quantity),
        total_price: parseFloat(product.price) * parseInt(quantity)
      };
      setCartItems([...cartItems, cartItem]);
    }

    // Clear selection
    setSelectedProduct('');
    setQuantity('');

    Swal.fire({
      icon: 'success',
      title: 'Added to Cart',
      text: `${product.name} added successfully!`,
      timer: 1500,
      showConfirmButton: false
    });
  };

  const removeFromCart = (productId) => {
    setCartItems(cartItems.filter(item => item.product_id !== productId));
  };

  const updateCartQuantity = async (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
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

    const updatedCart = cartItems.map(item => {
      if (item.product_id == productId) {
        return {
          ...item,
          quantity: newQuantity,
          total_price: item.price * newQuantity
        };
      }
      return item;
    });
    setCartItems(updatedCart);
  };

  const calculateCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.total_price, 0);
  };

  const processSale = async () => {
    if (cartItems.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Empty Cart',
        text: 'Please add products to cart before processing sale',
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

    // Show confirmation with cart details
    const cartSummary = cartItems.map(item => 
      `${item.product_name} x ${item.quantity} = Rs. ${item.total_price.toFixed(2)}`
    ).join('<br>');

    const result = await Swal.fire({
      title: 'Confirm Sale',
      html: `
        <div class="text-left">
          <p><strong>Invoice No:</strong> ${invoiceNo}</p>
          <p><strong>Items:</strong></p>
          <div class="ml-4">${cartSummary}</div>
          <hr class="my-2">
          <p><strong>Total Amount: Rs. ${calculateCartTotal().toFixed(2)}</strong></p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Complete Sale',
      cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) return;

    try {
      // Process each item in the cart
      for (const item of cartItems) {
        await axios.post('/sales/create', {
          invoice_no: invoiceNo,
          product_id: item.product_id,
          quantity_sold: item.quantity
        });
      }

      Swal.fire({
        icon: 'success',
        title: 'Sale Completed!',
        text: `Invoice ${invoiceNo} processed successfully`,
        confirmButtonColor: '#10b981'
      });

      // Reset form
      setCartItems([]);
      setInvoiceNo('');
      fetchProducts(); // Refresh to update available stock
      
      // Trigger global refresh for other components
      dataRefreshEmitter.emit();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Sale Failed',
        text: err.response?.data?.message || 'Error processing sale',
        confirmButtonColor: '#ef4444'
      });
    }
  };

  return (
    <div className="flex">
      <Sidebar />
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
            <div className="text-right">
              <p className="text-sm text-gray-600">Available Products</p>
              <p className="text-2xl font-bold text-blue-600">{availableProducts.length}</p>
            </div>
          </div>
        </div>

        {/* Sales Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available Products</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">{availableProducts.length}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <Package size={24} className="text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cart Items</p>
                <p className="text-2xl font-bold text-orange-600 mt-1">{cartItems.length}</p>
              </div>
              <div className="p-3 rounded-full bg-orange-100">
                <ShoppingBag size={24} className="text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cart Value</p>
                <p className="text-2xl font-bold text-green-600 mt-1">Rs. {calculateCartTotal().toFixed(0)}</p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <DollarSign size={24} className="text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Categories</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">
                  {[...new Set(availableProducts.map(p => p.category))].length}
                </p>
              </div>
              <div className="p-3 rounded-full bg-purple-100">
                <BarChart3 size={24} className="text-purple-600" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Side - Invoice & Product Selection */}
          <div className="lg:col-span-2 space-y-8">
            {/* Invoice Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center mb-6">
                <Receipt size={24} className="mr-3 text-indigo-600" />
                <h2 className="text-xl font-semibold text-gray-900">Invoice Information</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <FileText size={14} className="inline mr-1" />
                    Invoice Number
                  </label>
                  <input
                    type="text"
                    value={invoiceNo}
                    onChange={(e) => setInvoiceNo(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="Enter invoice number (e.g., INV-001)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Grid3X3 size={14} className="inline mr-1" />
                    Date & Time
                  </label>
                  <input
                    type="text"
                    value={new Date().toLocaleString()}
                    disabled
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  />
                </div>
              </div>
            </div>

            {/* Product Search & Filter */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <Search size={24} className="mr-3 text-indigo-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Find Products</h2>
                </div>
                <div className="flex items-center space-x-2">
                  <Filter size={16} className="text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {filteredProducts.length} of {availableProducts.length} products
                  </span>
                </div>
              </div>
              
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
                  <input
                    type="text"
                    placeholder="Enter category..."
                    value={searchFilters.category}
                    onChange={(e) => setSearchFilters({ ...searchFilters, category: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <DollarSign size={14} className="inline mr-1" />
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

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <button
                  onClick={clearFilters}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-medium transition-all"
                >
                  Clear Filters
                </button>
              </div>
            </div>

            {/* Add Product to Cart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center mb-6">
                <Plus size={24} className="mr-3 text-green-600" />
                <h2 className="text-xl font-semibold text-gray-900">Add Product to Cart</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="md:col-span-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Select Product</label>
                  <select
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  >
                    <option value="">Choose a product...</option>
                    {filteredProducts.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} - Rs. {product.price} (Available: {product.available_stock || 0})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    placeholder="Enter quantity"
                    min="1"
                  />
                </div>

                <button
                  onClick={addToCart}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center transition-all shadow-sm"
                  disabled={availableProducts.length === 0}
                >
                  <Plus size={16} className="mr-2" />
                  Add to Cart
                </button>
              </div>
            </div>

            {/* Available Products Quick View */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <Package size={24} className="mr-3 text-indigo-600" />
                  <h3 className="text-xl font-semibold text-gray-900">Available Products</h3>
                </div>
                <span className="text-sm text-gray-600 font-medium">
                  {filteredProducts.length} products available
                </span>
              </div>
              <div className="max-h-80 overflow-y-auto">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredProducts.slice(0, 8).map((product) => (
                      <div key={product.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all hover:border-indigo-300">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900">{product.name}</h4>
                            <p className="text-sm text-gray-600">{product.category}</p>
                          </div>
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">
                            {product.available_stock || 0} available
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold text-gray-900">Rs. {product.price}</span>
                          <button
                            onClick={() => {
                              setSelectedProduct(product.id);
                              setQuantity('1');
                            }}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Quick Select
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Side - Shopping Cart */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <ShoppingCart size={24} className="mr-3 text-blue-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Shopping Cart</h2>
                </div>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                  {cartItems.length} items
                </span>
              </div>
              
              {cartItems.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500 mb-2">Cart is empty</p>
                  <p className="text-sm text-gray-400">Add products to start a sale</p>
                </div>
              ) : (
                <div>
                  {/* Cart Items */}
                  <div className="space-y-4 mb-6 max-h-80 overflow-y-auto">
                    {cartItems.map((item) => (
                      <div key={item.product_id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-all">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 text-sm">{item.product_name}</h4>
                            <p className="text-xs text-gray-600 mt-1">Rs. {item.price} per unit</p>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.product_id)}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="Remove from cart"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-600">Qty:</span>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateCartQuantity(item.product_id, parseInt(e.target.value))}
                              className="border border-gray-300 rounded w-16 px-2 py-1 text-center text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              min="1"
                            />
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-gray-900">Rs. {item.total_price.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Cart Summary */}
                  <div className="border-t border-gray-200 pt-6">
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Subtotal:</span>
                        <span className="font-semibold text-gray-900">Rs. {calculateCartTotal().toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Tax (0%):</span>
                        <span className="font-semibold text-gray-900">Rs. 0.00</span>
                      </div>
                      <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                        <span className="text-lg font-bold text-gray-900">Total:</span>
                        <span className="text-xl font-bold text-green-600">
                          Rs. {calculateCartTotal().toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Process Sale Button */}
                    <button
                      onClick={processSale}
                      className={`w-full px-6 py-4 rounded-lg font-semibold text-lg flex items-center justify-center transition-all shadow-sm ${
                        !invoiceNo 
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                      disabled={!invoiceNo}
                    >
                      <CheckCircle size={20} className="mr-2" />
                      Complete Sale
                    </button>
                    
                    {!invoiceNo && (
                      <p className="text-center text-xs text-red-500 mt-2">
                        Please enter an invoice number to complete the sale
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SalesPage;
