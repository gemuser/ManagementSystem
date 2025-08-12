import React, { useEffect, useState, useCallback } from 'react';
import axios from '../api/axios';
import DHISidebar from '../components/DHISidebar';
import RsIcon from '../components/RsIcon';
import Swal from 'sweetalert2';
import { dataRefreshEmitter } from '../hooks/useDataRefresh';
import { 
  TrendingUp, 
  Search, 
  List,
  Calendar,
  Package,
  Receipt,
  Filter,
  RefreshCw,
  BarChart3,
  Eye,
  FileText,
  Clock,
  ShoppingCart,
  Grid3X3,
  Download
} from 'lucide-react';

const SalesHistory = () => {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    dateFrom: '',
    dateTo: '',
    productId: '',
    invoiceNo: ''
  });
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [expandedInvoices, setExpandedInvoices] = useState(new Set());

  useEffect(() => {
    fetchSales();
    fetchProducts();
    
    // Listen for global data refresh events
    const unsubscribe = dataRefreshEmitter.subscribe(() => {
      fetchSales();
      fetchProducts();
    });
    
    return unsubscribe;
  }, []);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/sales/list');
      const salesData = res.data.data;
      
      // Sort sales by date (recent first)
      const sortedSales = salesData.sort((a, b) => new Date(b.sale_date) - new Date(a.sale_date));
      
      setSales(sortedSales);
      setFilteredSales(sortedSales);
    } catch (err) {
      console.error('Error fetching sales:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error Loading Sales',
        text: 'Failed to load sales history. Please check your connection.',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get('/products/list');
      setProducts(res.data.data);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const getProductName = (productId) => {
    const product = products.find(p => p.id == productId);
    return product ? product.name : `Product ID: ${productId}`;
  };

  const applyFilters = () => {
    let filtered = sales;

    if (filter.dateFrom) {
      filtered = filtered.filter(sale => 
        new Date(sale.sale_date) >= new Date(filter.dateFrom)
      );
    }

    if (filter.dateTo) {
      filtered = filtered.filter(sale => 
        new Date(sale.sale_date) <= new Date(filter.dateTo)
      );
    }

    if (filter.productId) {
      filtered = filtered.filter(sale => sale.product_id == filter.productId);
    }

    if (filter.invoiceNo) {
      filtered = filtered.filter(sale => 
        sale.invoice_no.toLowerCase().includes(filter.invoiceNo.toLowerCase())
      );
    }

    // Apply sorting (maintain recent first by default)
    const sorted = filtered.sort((a, b) => {
      if (sortOrder === 'desc') {
        return new Date(b.sale_date) - new Date(a.sale_date);
      } else {
        return new Date(a.sale_date) - new Date(b.sale_date);
      }
    });

    setFilteredSales(sorted);
  };

  const toggleSortOrder = () => {
    const newOrder = sortOrder === 'desc' ? 'asc' : 'desc';
    setSortOrder(newOrder);
    
    const sorted = [...filteredSales].sort((a, b) => {
      if (newOrder === 'desc') {
        return new Date(b.sale_date) - new Date(a.sale_date);
      } else {
        return new Date(a.sale_date) - new Date(b.sale_date);
      }
    });
    
    setFilteredSales(sorted);
  };

  const clearFilters = () => {
    setFilter({
      dateFrom: '',
      dateTo: '',
      productId: '',
      invoiceNo: ''
    });
    setFilteredSales(sales);
  };

  const calculateTotals = () => {
    const totalSales = filteredSales.length;
    const totalRevenue = filteredSales.reduce((sum, sale) => sum + parseFloat(sale.total_price), 0);
    const totalQuantity = filteredSales.reduce((sum, sale) => sum + parseInt(sale.quantity_sold), 0);
    
    return { totalSales, totalRevenue, totalQuantity };
  };

  // Group sales by invoice number for display
  const getGroupedSales = () => {
    const grouped = filteredSales.reduce((acc, sale) => {
      const invoiceNo = sale.invoice_no;
      if (!acc[invoiceNo]) {
        acc[invoiceNo] = {
          invoice_no: invoiceNo,
          sale_date: sale.sale_date,
          items: [],
          total_amount: 0,
          total_items: 0
        };
      }
      
      acc[invoiceNo].items.push(sale);
      acc[invoiceNo].total_amount += parseFloat(sale.total_price);
      acc[invoiceNo].total_items += parseInt(sale.quantity_sold);
      
      return acc;
    }, {});
    
    // Convert to array and sort by date
    return Object.values(grouped).sort((a, b) => {
      if (sortOrder === 'desc') {
        return new Date(b.sale_date) - new Date(a.sale_date);
      } else {
        return new Date(a.sale_date) - new Date(b.sale_date);
      }
    });
  };

  const { totalSales, totalRevenue, totalQuantity } = calculateTotals();
  const groupedSales = getGroupedSales();

  // Toggle function for expanding invoice details
  const toggleInvoiceExpansion = (invoiceNo) => {
    setExpandedInvoices(prev => {
      const newSet = new Set(prev);
      if (newSet.has(invoiceNo)) {
        newSet.delete(invoiceNo);
      } else {
        newSet.add(invoiceNo);
      }
      return newSet;
    });
  };

  // Product selection functions
  const toggleProductSelection = (product) => {
    setSelectedProducts(prev => {
      const isSelected = prev.find(p => p.id === product.id);
      if (isSelected) {
        return prev.filter(p => p.id !== product.id);
      } else {
        return [...prev, { ...product, quantity: 1 }];
      }
    });
  };

  const updateProductQuantity = (productId, quantity) => {
    setSelectedProducts(prev => 
      prev.map(p => p.id === productId ? { ...p, quantity: Math.max(1, quantity) } : p)
    );
  };

  const removeSelectedProduct = (productId) => {
    setSelectedProducts(prev => prev.filter(p => p.id !== productId));
  };

  const clearSelectedProducts = () => {
    setSelectedProducts([]);
  };

  // Filter products based on search term
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
    product.id.toString().includes(productSearchTerm)
  );

  const calculateSelectedTotal = () => {
    return selectedProducts.reduce((total, product) => {
      return total + (parseFloat(product.selling_price || 0) * product.quantity);
    }, 0);
  };

  const viewSaleDetails = async (sale) => {
    const productName = getProductName(sale.product_id);
    const totalAmount = parseFloat(sale.price_each) * parseInt(sale.quantity_sold);
    
    await Swal.fire({
      title: 'Sale Details',
      html: `
        <div class="text-left space-y-4">
          <div class="bg-gray-50 p-4 rounded-lg">
            <h3 class="font-semibold text-gray-900 mb-2">Invoice Information</h3>
            <div class="grid grid-cols-2 gap-2 text-sm">
              <div><span class="font-medium">Invoice No:</span> ${sale.invoice_no}</div>
              <div><span class="font-medium">Sale ID:</span> #${sale.id}</div>
              <div><span class="font-medium">Date:</span> ${new Date(sale.sale_date).toLocaleDateString()}</div>
              <div><span class="font-medium">Time:</span> ${new Date(sale.sale_date).toLocaleTimeString()}</div>
            </div>
          </div>
          
          <div class="bg-blue-50 p-4 rounded-lg">
            <h3 class="font-semibold text-gray-900 mb-2">Product Information</h3>
            <div class="text-sm space-y-1">
              <div><span class="font-medium">Product:</span> ${productName}</div>
              <div><span class="font-medium">Quantity Sold:</span> ${sale.quantity_sold} units</div>
              <div><span class="font-medium">Price per Unit:</span> Rs. ${parseFloat(sale.price_each).toFixed(2)}</div>
            </div>
          </div>
          
          <div class="bg-green-50 p-4 rounded-lg">
            <h3 class="font-semibold text-gray-900 mb-2">Payment Summary</h3>
            <div class="text-sm space-y-1">
              <div><span class="font-medium">Subtotal:</span> Rs. ${totalAmount.toFixed(2)}</div>
              <div><span class="font-medium">Tax:</span> Rs. 0.00</div>
              <div class="border-t pt-2 mt-2"><span class="font-bold text-lg">Total Amount:</span> <span class="font-bold text-lg text-green-600">Rs. ${totalAmount.toFixed(2)}</span></div>
            </div>
          </div>
        </div>
      `,
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'Close',
      width: '600px'
    });
  };

  const generateStandaloneVATBill = async () => {
    try {
      // Get VAT bill details from user
      const { value: formValues } = await Swal.fire({
        title: 'Generate VAT Bill',
        html: `
          <div class="space-y-4 text-left">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
              <input id="customerName" class="swal2-input w-full" placeholder="Enter customer name" required>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Item Description *</label>
              <input id="itemName" class="swal2-input w-full" placeholder="Enter item description" required>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Price (Rs.) *</label>
              <input id="price" class="swal2-input w-full" type="number" step="0.01" min="0" placeholder="Enter price" required>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
              <input id="quantity" class="swal2-input w-full" type="number" min="1" value="1" placeholder="Enter quantity">
            </div>
          </div>
        `,
        showCancelButton: true,
        confirmButtonColor: '#10b981',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Generate VAT Bill',
        cancelButtonText: 'Cancel',
        preConfirm: () => {
          const customerName = document.getElementById('customerName').value.trim();
          const itemName = document.getElementById('itemName').value.trim();
          const price = parseFloat(document.getElementById('price').value);
          const quantity = parseInt(document.getElementById('quantity').value) || 1;

          if (!customerName) {
            Swal.showValidationMessage('Customer name is required');
            return false;
          }
          if (!itemName) {
            Swal.showValidationMessage('Item description is required');
            return false;
          }
          if (!price || price <= 0) {
            Swal.showValidationMessage('Valid price is required');
            return false;
          }

          return { customerName, itemName, price, quantity };
        }
      });

      if (!formValues) return;

      // Show loading
      Swal.fire({
        title: 'Generating VAT Bill...',
        text: 'Please wait while we create your PDF document',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      // Generate bill using the custom endpoint
      const totalAmount = formValues.price * formValues.quantity;
      
      const billData = {
        customerName: formValues.customerName,
        invoiceDate: new Date().toLocaleDateString(),
        itemName: `${formValues.itemName} (Qty: ${formValues.quantity})`,
        price: `Rs. ${totalAmount.toLocaleString()}`,
        vatRate: 0,
        vat: `Rs. 0`,
        total: `Rs. ${totalAmount.toLocaleString()}`
      };

      const response = await axios.post('/vat-bill/generate-custom', billData, {
        responseType: 'blob'
      });

      // Create blob and show save dialog
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const suggestedFilename = `VAT-Bill-${formValues.customerName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
      
      // Use the File System Access API if available, fallback to traditional download
      if ('showSaveFilePicker' in window) {
        try {
          const fileHandle = await window.showSaveFilePicker({
            suggestedName: suggestedFilename,
            types: [{
              description: 'PDF files',
              accept: { 'application/pdf': ['.pdf'] }
            }]
          });
          const writable = await fileHandle.createWritable();
          await writable.write(blob);
          await writable.close();
        } catch (err) {
          if (err.name !== 'AbortError') {
            console.error('Save failed:', err);
            // Fallback to traditional download if save picker fails
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = suggestedFilename;
            link.click();
            window.URL.revokeObjectURL(url);
          }
        }
      } else {
        // Fallback for browsers that don't support File System Access API
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = suggestedFilename;
        link.click();
        window.URL.revokeObjectURL(url);
      }

      Swal.fire({
        icon: 'success',
        title: 'Bill Ready!',
        text: `bill for ${formValues.customerName} is ready for download. Choose where to save it.`,
        confirmButtonColor: '#10b981',
        timer: 3000,
        timerProgressBar: true
      });

    } catch (error) {
      console.error('Error generating bill:', error);
      Swal.fire({
        icon: 'error',
        title: ' Bill Generation Failed',
        text: error.response?.data?.message || 'Failed to generate bill. Please try again.',
        confirmButtonColor: '#ef4444'
      });
    }
  };

  const generateVATBillForSaleHistory = async (sale) => {
    try {
      // Get customer name and VAT rate
      const { value: formData } = await Swal.fire({
        title: 'Generate Bill for Sale',
        html: `
          <div class="text-left mb-4">
            <p><strong>Invoice:</strong> ${sale.invoice_no}</p>
            <p><strong>Product:</strong> ${getProductName(sale.product_id)}</p>
            <p><strong>Quantity:</strong> ${sale.quantity_sold}</p>
            <p><strong>Total:</strong> Rs. ${parseFloat(sale.total_price).toFixed(2)}</p>
            <p><strong>Date:</strong> ${new Date(sale.sale_date).toLocaleDateString()}</p>
          </div>
          <div class="border-t pt-4 space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Customer Name *</label>
              <input id="customerName" class="swal2-input w-full" placeholder="Enter customer name" required>
            </div>
           
          </div>
        `,
        showCancelButton: true,
        confirmButtonColor: '#10b981',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Generate VAT Bill',
        cancelButtonText: 'Cancel',
        preConfirm: () => {
          const name = document.getElementById('customerName').value.trim();
          
          if (!name) {
            Swal.showValidationMessage('Customer name is required');
            return false;
          }
          
          return {
            customerName: name
          };
        }
      });

      if (!formData) return;

      const { customerName } = formData;

      // Prepare sale data for bill using the new structured format
      const totalAmount = parseFloat(sale.total_price);

      const billData = {
        customerName,
        invoiceId: sale.invoice_no,
        invoiceDate: new Date(sale.sale_date).toLocaleDateString('en-GB'),
        items: [{
          productName: getProductName(sale.product_id),
          quantity: sale.quantity_sold,
          price: parseFloat(sale.price_each || totalAmount / sale.quantity_sold),
          total: totalAmount
        }],
        subtotal: totalAmount,
        vatRate: 0,
        vatAmount: 0,
        grandTotal: totalAmount
      };

      // Show loading
      Swal.fire({
        title: 'Generating Bill...',
        text: 'Please wait while we create your PDF document',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      // Generate VAT bill using the memory endpoint
      const response = await axios.post('/vat-bill/generate-memory', billData, {
        responseType: 'blob'
      });

      // Create blob and show save dialog
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const suggestedFilename = `VAT-Bill-${sale.invoice_no}-${customerName.replace(/\s+/g, '-')}.pdf`;
      
      // Use the File System Access API if available, fallback to traditional download
      if ('showSaveFilePicker' in window) {
        try {
          const fileHandle = await window.showSaveFilePicker({
            suggestedName: suggestedFilename,
            types: [{
              description: 'PDF files',
              accept: { 'application/pdf': ['.pdf'] }
            }]
          });
          const writable = await fileHandle.createWritable();
          await writable.write(blob);
          await writable.close();
        } catch (err) {
          if (err.name !== 'AbortError') {
            console.error('Save failed:', err);
            // Fallback to traditional download if save picker fails
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = suggestedFilename;
            link.click();
            window.URL.revokeObjectURL(url);
          }
        }
      } else {
        // Fallback for browsers that don't support File System Access API
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = suggestedFilename;
        link.click();
        window.URL.revokeObjectURL(url);
      }

      Swal.fire({
        icon: 'success',
        title: 'VAT Bill Ready!',
        text: `VAT bill for ${customerName} is ready for download. Choose where to save it.`,
        confirmButtonColor: '#10b981',
        timer: 3000,
        timerProgressBar: true
      });

    } catch (error) {
      console.error('Error generating VAT bill:', error);
      Swal.fire({
        icon: 'error',
        title: 'VAT Bill Generation Failed',
        text: error.response?.data?.message || 'Failed to generate VAT bill. Please try again.',
        confirmButtonColor: '#ef4444'
      });
    }
  };

  const viewInvoiceDetails = async (invoice) => {
    const invoiceItems = invoice.items.map((sale, index) => {
      const product = products.find(p => p.id === sale.product_id);
      const productName = product ? product.name : 'Unknown Product';
      return `
        <tr class="border-b">
          <td class="py-2">${index + 1}</td>
          <td class="py-2">${productName}</td>
          <td class="py-2 text-center">${sale.quantity_sold}</td>
          <td class="py-2 text-right">Rs. ${parseFloat(sale.price_each).toFixed(2)}</td>
          <td class="py-2 text-right font-semibold">Rs. ${parseFloat(sale.total_price).toFixed(2)}</td>
        </tr>
      `;
    }).join('');

    await Swal.fire({
      title: `Invoice Details - ${invoice.invoice_no}`,
      html: `
        <div class="text-left">
          <div class="bg-gray-50 p-4 rounded-lg mb-4">
            <div><span class="font-medium">Invoice No:</span> ${invoice.invoice_no}</div>
            <div><span class="font-medium">Date:</span> ${new Date(invoice.sale_date).toLocaleString()}</div>
            <div><span class="font-medium">Total Products:</span> ${invoice.items.length}</div>
            <div><span class="font-medium">Total Items:</span> ${invoice.total_items} units</div>
          </div>
          <div class="bg-white border rounded-lg overflow-hidden mb-4">
            <table class="w-full text-sm">
              <thead class="bg-gray-100">
                <tr>
                  <th class="py-2 px-3 text-left">#</th>
                  <th class="py-2 px-3 text-left">Product</th>
                  <th class="py-2 px-3 text-center">Qty</th>
                  <th class="py-2 px-3 text-right">Unit Price</th>
                  <th class="py-2 px-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                ${invoiceItems}
              </tbody>
            </table>
          </div>
          <div class="bg-green-50 p-4 rounded-lg">
            <div class="flex justify-between items-center">
              <span class="font-bold text-lg">Invoice Total:</span>
              <span class="font-bold text-xl text-green-600">Rs. ${invoice.total_amount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      `,
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'Close',
      width: '700px'
    });
  };

  const generateVATBillForInvoice = async (invoice) => {
    try {
      // Get customer name and VAT rate
      const { value: formData } = await Swal.fire({
        title: 'Generate VAT Bill for Invoice',
        html: `
          <div class="text-left mb-4">
            <p><strong>Invoice:</strong> ${invoice.invoice_no}</p>
            <p><strong>Products:</strong> ${invoice.items.length}</p>
            <p><strong>Total Items:</strong> ${invoice.total_items}</p>
            <p><strong>Total Amount:</strong> Rs. ${invoice.total_amount.toFixed(2)}</p>
            <p><strong>Date:</strong> ${new Date(invoice.sale_date).toLocaleDateString()}</p>
          </div>
          <div class="border-t pt-4 space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Customer Name *</label>
              <input id="customerName" class="swal2-input w-full" placeholder="Enter customer name" required>
            </div>
          </div>
        `,
        showCancelButton: true,
        confirmButtonColor: '#10b981',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Generate VAT Bill',
        cancelButtonText: 'Cancel',
        preConfirm: () => {
          const name = document.getElementById('customerName').value.trim();
          
          if (!name) {
            Swal.showValidationMessage('Customer name is required');
            return false;
          }
          
          return {
            customerName: name
          };
        }
      });

      if (!formData) return;

      const { customerName } = formData;

      // Prepare invoice data for VAT bill generation
      const vatBillData = {
        customerName: customerName,
        invoiceId: invoice.invoice_no,
        invoiceDate: new Date(invoice.sale_date).toLocaleDateString('en-GB'),
        items: invoice.items.map(sale => {
          const product = products.find(p => p.id === sale.product_id);
          return {
            productName: product ? product.name : 'Unknown Product',
            hsCode: product?.hsCode || '0000.00',
            quantity: sale.quantity_sold,
            price: parseFloat(sale.price_each),
            total: parseFloat(sale.total_price)
          };
        }),
        subtotal: invoice.total_amount,
        vatRate: 0,
        vatAmount: 0,
        grandTotal: invoice.total_amount
      };

      // Generate VAT bill
      const response = await axios.post('/vat-bill/generate-memory', vatBillData, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const suggestedFilename = `VAT-Bill-${invoice.invoice_no}-${customerName.replace(/\s+/g, '-')}.pdf`;

      // Use File System Access API if available for better save experience
      if ('showSaveFilePicker' in window) {
        try {
          const fileHandle = await window.showSaveFilePicker({
            suggestedName: suggestedFilename,
            types: [{
              description: 'PDF files',
              accept: { 'application/pdf': ['.pdf'] }
            }]
          });
          const writable = await fileHandle.createWritable();
          await writable.write(blob);
          await writable.close();
        } catch (err) {
          if (err.name !== 'AbortError') {
            console.error('Save failed:', err);
            // Fallback to traditional download
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = suggestedFilename;
            link.click();
            window.URL.revokeObjectURL(url);
          }
        }
      } else {
        // Fallback for browsers that don't support File System Access API
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = suggestedFilename;
        link.click();
        window.URL.revokeObjectURL(url);
      }

      Swal.fire({
        icon: 'success',
        title: 'VAT Bill Ready!',
        text: `VAT bill for ${customerName} is ready for download. Choose where to save it.`,
        confirmButtonColor: '#10b981',
        timer: 3000,
        timerProgressBar: true
      });

    } catch (error) {
      console.error('Error generating VAT bill:', error);
      Swal.fire({
        icon: 'error',
        title: 'VAT Bill Generation Failed',
        text: error.response?.data?.message || 'Failed to generate VAT bill. Please try again.',
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
            <TrendingUp size={32} className="mr-4 text-green-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Sales History</h1>
              <p className="text-gray-600 mt-1">Track and analyze your sales performance</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={generateStandaloneVATBill}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center transition-all shadow-sm"
              title="Generate VAT Bill"
            >
              <FileText size={16} className="mr-2" />
              VAT Bill
            </button>
            <button
              onClick={fetchSales}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center transition-all"
              title="Refresh sales data"
            >
              <RefreshCw size={16} className="mr-2" />
              Refresh
            </button>
            <div className="text-right">
              <p className="text-sm text-gray-600">Total Sales</p>
              <p className="text-2xl font-bold text-green-600">{totalSales}</p>
            </div>
          </div>
        </div>

        {/* Sales Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Invoices</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">{groupedSales.length}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <Receipt size={24} className="text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600 mt-1">Rs. {totalRevenue.toFixed(0)}</p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <RsIcon size={24} className="text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Items Sold</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">{totalQuantity}</p>
              </div>
              <div className="p-3 rounded-full bg-purple-100">
                <Package size={24} className="text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Sale Value</p>
                <p className="text-2xl font-bold text-orange-600 mt-1">
                  Rs. {groupedSales.length > 0 ? (totalRevenue / groupedSales.length).toFixed(0) : '0'}
                </p>
              </div>
              <div className="p-3 rounded-full bg-orange-100">
                <BarChart3 size={24} className="text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Search size={24} className="mr-3 text-indigo-600" />
              <h2 className="text-xl font-semibold text-gray-900">Search & Filter Sales</h2>
            </div>
            <div className="flex items-center space-x-2">
              <Filter size={16} className="text-gray-500" />
              <span className="text-sm text-gray-600">
                {filteredSales.length} of {sales.length} sales
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Calendar size={14} className="inline mr-1" />
                From Date
              </label>
              <input
                type="date"
                value={filter.dateFrom}
                onChange={(e) => setFilter({ ...filter, dateFrom: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Calendar size={14} className="inline mr-1" />
                To Date
              </label>
              <input
                type="date"
                value={filter.dateTo}
                onChange={(e) => setFilter({ ...filter, dateTo: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Package size={14} className="inline mr-1" />
                Product
              </label>
              <select
                value={filter.productId}
                onChange={(e) => setFilter({ ...filter, productId: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              >
                <option value="">All Products</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Grid3X3 size={14} className="inline mr-1" />
                Invoice Number
              </label>
              <input
                type="text"
                placeholder="Search invoice..."
                value={filter.invoiceNo}
                onChange={(e) => setFilter({ ...filter, invoiceNo: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <button
              onClick={clearFilters}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-medium transition-all"
            >
              Clear Filters
            </button>

            <div className="flex items-center space-x-3">
              <button
                onClick={applyFilters}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-all"
              >
                Apply Filters
              </button>
              
              <button
                onClick={toggleSortOrder}
                className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-lg font-medium transition-all flex items-center"
                title={`Sort ${sortOrder === 'desc' ? 'oldest first' : 'newest first'}`}
              >
                <Clock size={16} className="mr-2" />
                {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
              </button>
            </div>
          </div>
        </div>

        {/* Sales Records Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <List size={24} className="mr-3 text-indigo-600" />
                <h2 className="text-xl font-semibold text-gray-900">Sales Records</h2>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600 font-medium">
                  {groupedSales.length} invoices ({filteredSales.length} items total)
                </span>
                <button
                  className="bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1 rounded-lg text-sm font-medium transition-all flex items-center"
                  title="Export to CSV"
                >
                  <Download size={14} className="mr-1" />
                  Export
                </button>
              </div>
            </div>
          </div>
          
          {loading ? (
            <div className="p-12 text-center">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                <span className="ml-3 text-gray-600 font-medium">Loading sales data...</span>
              </div>
            </div>
          ) : filteredSales.length === 0 ? (
            <div className="p-12 text-center">
              <Receipt size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Sales Records Found</h3>
              <p className="text-gray-600 mb-4">
                No sales match your search criteria. Try adjusting your filters.
              </p>
              <button
                onClick={clearFilters}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-all"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="p-6">
              <div className="space-y-4">
                {groupedSales.map((invoice) => {
                  const isExpanded = expandedInvoices.has(invoice.invoice_no);
                  return (
                    <div key={invoice.invoice_no} className="bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                      {/* Invoice Header - Always Visible */}
                      <div className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Receipt size={20} className="text-blue-600" />
                            <div>
                              <h3 className="font-semibold text-gray-900">{invoice.invoice_no}</h3>
                              <p className="text-sm text-gray-500">
                                {new Date(invoice.sale_date).toLocaleDateString()} • {invoice.items.length} items
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className="text-lg font-bold text-green-600">
                              Rs. {invoice.total_amount.toFixed(2)}
                            </span>
                            <button
                              onClick={() => generateVATBillForInvoice(invoice)}
                              className="text-green-600 hover:text-green-800 text-sm font-medium px-3 py-1 rounded-md hover:bg-green-50 transition-all flex items-center border border-green-200"
                              title="Generate VAT Bill"
                            >
                              <FileText size={14} className="mr-1" />
                              VAT Bill
                            </button>
                            <button
                              onClick={() => toggleInvoiceExpansion(invoice.invoice_no)}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-1 rounded-md hover:bg-blue-50 transition-all"
                            >
                              {isExpanded ? 'Show Less' : 'See More'}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="border-t border-gray-100 bg-gray-50">
                          <div className="p-4 space-y-3">
                            {/* Invoice Info */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                              <div className="text-sm">
                                <span className="text-gray-500">Date & Time:</span>
                                <p className="font-medium">{new Date(invoice.sale_date).toLocaleString()}</p>
                              </div>
                              <div className="text-sm">
                                <span className="text-gray-500">Total Items:</span>
                                <p className="font-medium">{invoice.total_items} units</p>
                              </div>
                              <div className="text-sm">
                                <span className="text-gray-500">Total Amount:</span>
                                <p className="font-medium text-green-600">Rs. {invoice.total_amount.toFixed(2)}</p>
                              </div>
                            </div>

                            {/* Products List */}
                            <div className="bg-white rounded-lg p-3">
                              <h4 className="text-sm font-medium text-gray-700 mb-2">Items Sold:</h4>
                              <div className="space-y-2">
                                {invoice.items.map((sale) => (
                                  <div key={sale.id} className="flex justify-between items-center text-sm py-1 border-b border-gray-100 last:border-b-0">
                                    <div className="flex-1">
                                      <span className="font-medium text-gray-900">{getProductName(sale.product_id)}</span>
                                      <span className="text-gray-500 ml-2">× {sale.quantity_sold}</span>
                                    </div>
                                    <div className="text-right">
                                      <span className="text-gray-500">Rs. {parseFloat(sale.price_each).toFixed(2)} each</span>
                                      <p className="font-medium text-gray-900">Rs. {parseFloat(sale.total_price).toFixed(2)}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-end space-x-2 pt-2">
                              <button
                                onClick={() => viewInvoiceDetails(invoice)}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-1 rounded-md hover:bg-blue-50 transition-all flex items-center"
                              >
                                <Eye size={14} className="mr-1" />
                                View Details
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SalesHistory;
