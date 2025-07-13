import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import Sidebar from '../components/Sidebar';
import Swal from 'sweetalert2';

const SalesPage = () => {
  const [products, setProducts] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [invoiceNo, setInvoiceNo] = useState('');
  const [cartItems, setCartItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get('/products/list');
      const allProducts = res.data.data;
      setProducts(allProducts);
      
      // Filter products with stock > 0
      const inStock = allProducts.filter(product => product.total_stock > 0);
      setAvailableProducts(inStock);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const getAvailableStock = async (productId) => {
    try {
      // Get total sold for this product
      const salesRes = await axios.get('/sales/list');
      const sales = salesRes.data.data;
      
      const productSales = sales.filter(sale => sale.product_id == productId);
      const totalSold = productSales.reduce((sum, sale) => sum + parseInt(sale.quantity_sold), 0);
      
      // Find the product
      const product = products.find(p => p.id == productId);
      const availableStock = product ? product.total_stock - totalSold : 0;
      
      return Math.max(0, availableStock);
    } catch (err) {
      console.error('Error calculating available stock:', err);
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
      <main className="flex-1 p-6 bg-gray-100 min-h-screen">
        <h1 className="text-3xl font-bold mb-6">🛒 Sales Point</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Side - Add Products to Cart */}
          <div className="space-y-6">
            {/* Invoice Information */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">📋 Invoice Information</h2>
              <input
                type="text"
                value={invoiceNo}
                onChange={(e) => setInvoiceNo(e.target.value)}
                className="border p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter invoice number"
              />
            </div>

            {/* Add Product to Cart */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">➕ Add Product to Cart</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Product</label>
                  <select
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                    className="border p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Choose a product...</option>
                    {availableProducts.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} - Rs. {product.price} (Stock: {product.total_stock})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="border p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter quantity"
                    min="1"
                  />
                </div>

                <button
                  onClick={addToCart}
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
                  disabled={availableProducts.length === 0}
                >
                  ➕ Add to Cart
                </button>
              </div>
            </div>

            {/* Available Products Quick View */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-3">📦 Available Products</h3>
              <div className="max-h-60 overflow-y-auto">
                {availableProducts.length === 0 ? (
                  <p className="text-gray-500">No products available in stock.</p>
                ) : (
                  <div className="space-y-2">
                    {availableProducts.slice(0, 10).map((product) => (
                      <div key={product.id} className="flex justify-between items-center p-2 border rounded">
                        <div>
                          <span className="font-medium">{product.name}</span>
                          <span className="text-sm text-gray-600 ml-2">Rs. {product.price}</span>
                        </div>
                        <span className="text-sm font-medium text-green-600">
                          Stock: {product.total_stock}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Side - Shopping Cart */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">🛒 Shopping Cart</h2>
            
            {cartItems.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">Cart is empty</p>
                <p className="text-sm text-gray-400">Add products to start a sale</p>
              </div>
            ) : (
              <div>
                {/* Cart Items */}
                <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
                  {cartItems.map((item) => (
                    <div key={item.product_id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{item.product_name}</h4>
                        <button
                          onClick={() => removeFromCart(item.product_id)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          ✕ Remove
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">Qty:</span>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateCartQuantity(item.product_id, parseInt(e.target.value))}
                            className="border rounded w-16 px-2 py-1 text-center"
                            min="1"
                          />
                          <span className="text-sm text-gray-600">
                            @ Rs. {item.price}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold">Rs. {item.total_price.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Cart Total */}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold">Total Amount:</span>
                    <span className="text-xl font-bold text-green-600">
                      Rs. {calculateCartTotal().toFixed(2)}
                    </span>
                  </div>

                  {/* Process Sale Button */}
                  <button
                    onClick={processSale}
                    className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-medium text-lg"
                  >
                    💳 Complete Sale
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default SalesPage;
