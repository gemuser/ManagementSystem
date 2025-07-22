import React, { useEffect, useState, useCallback } from 'react';
import axios from '../api/axios';
import Sidebar from '../components/Sidebar';
import Swal from 'sweetalert2';
import { dataRefreshEmitter } from '../hooks/useDataRefresh';
import { 
  TrendingUp, 
  Search, 
  List,
  Calendar,
  DollarSign,
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
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' for recent first, 'asc' for oldest first

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
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">VAT Rate (%)</label>
              <input id="vatRate" type="number" class="swal2-input w-full" placeholder="Enter VAT rate (e.g., 13 or 0)" value="13" min="0" max="100" step="0.01">
              <small class="text-gray-500">Enter 0 for no VAT, or any percentage (e.g., 13 for 13% VAT)</small>
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
          const vatRateInput = document.getElementById('vatRate').value.trim();

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
          
          const vatRate = parseFloat(vatRateInput);
          if (isNaN(vatRate) || vatRate < 0 || vatRate > 100) {
            Swal.showValidationMessage('Please enter a valid VAT rate between 0 and 100');
            return false;
          }

          return { customerName, itemName, price, quantity, vatRate };
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

      // Generate VAT bill using the custom endpoint
      const totalAmount = formValues.price * formValues.quantity;
      const vatAmount = totalAmount * (formValues.vatRate / 100);
      const grandTotal = totalAmount + vatAmount;
      
      const billData = {
        customerName: formValues.customerName,
        invoiceDate: new Date().toLocaleDateString(),
        itemName: `${formValues.itemName} (Qty: ${formValues.quantity})`,
        price: `Rs. ${totalAmount.toLocaleString()}`,
        vatRate: formValues.vatRate,
        vat: `Rs. ${vatAmount.toLocaleString()}`,
        total: `Rs. ${grandTotal.toLocaleString()}`
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
        title: 'VAT Bill Ready!',
        text: `VAT bill for ${formValues.customerName} is ready for download. Choose where to save it.`,
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

  const generateVATBillForSaleHistory = async (sale) => {
    try {
      // Get customer name and VAT rate
      const { value: formData } = await Swal.fire({
        title: 'Generate VAT Bill for Sale',
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
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">VAT Rate (%)</label>
              <input id="vatRate" type="number" class="swal2-input w-full" placeholder="Enter VAT rate (e.g., 13 or 0)" value="13" min="0" max="100" step="0.01">
              <small class="text-gray-500">Enter 0 for no VAT, or any percentage (e.g., 13 for 13% VAT)</small>
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
          const vatRateInput = document.getElementById('vatRate').value.trim();
          
          if (!name) {
            Swal.showValidationMessage('Customer name is required');
            return false;
          }
          
          const vatRate = parseFloat(vatRateInput);
          if (isNaN(vatRate) || vatRate < 0 || vatRate > 100) {
            Swal.showValidationMessage('Please enter a valid VAT rate between 0 and 100');
            return false;
          }
          
          return {
            customerName: name,
            vatRate: vatRate
          };
        }
      });

      if (!formData) return;

      const { customerName, vatRate } = formData;

      // Prepare sale data for VAT bill
      const totalAmount = parseFloat(sale.total_price);
      const vatAmount = totalAmount * (vatRate / 100);
      const grandTotal = totalAmount + vatAmount;

      const billData = {
        customerName,
        itemName: `${getProductName(sale.product_id)} (${sale.quantity_sold}x)`,
        price: totalAmount,
        quantity: 1,
        vatRate: vatRate
      };

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

      // Generate VAT bill
      const response = await axios.post('/vat-bill/generate-for-sale', billData, {
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
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">VAT Rate (%)</label>
              <input id="vatRate" type="number" class="swal2-input w-full" placeholder="Enter VAT rate (e.g., 13 or 0)" value="13" min="0" max="100" step="0.01">
              <small class="text-gray-500">Enter 0 for no VAT, or any percentage (e.g., 13 for 13% VAT)</small>
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
          const vatRateInput = document.getElementById('vatRate').value.trim();
          
          if (!name) {
            Swal.showValidationMessage('Customer name is required');
            return false;
          }
          
          const vatRate = parseFloat(vatRateInput);
          if (isNaN(vatRate) || vatRate < 0 || vatRate > 100) {
            Swal.showValidationMessage('Please enter a valid VAT rate between 0 and 100');
            return false;
          }
          
          return {
            customerName: name,
            vatRate: vatRate
          };
        }
      });

      if (!formData) return;

      const { customerName, vatRate } = formData;

      // Prepare invoice data for VAT bill generation
      const vatBillData = {
        customerName: customerName,
        invoiceNumber: invoice.invoice_no,
        invoiceDate: new Date(invoice.sale_date).toLocaleDateString(),
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
        vatRate: vatRate,
        vatAmount: invoice.total_amount * (vatRate / 100),
        grandTotal: invoice.total_amount * (1 + (vatRate / 100))
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
      <Sidebar />
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
                <DollarSign size={24} className="text-green-600" />
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
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Invoice Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Unit Price
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Total Amount
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Sale Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {groupedSales.map((invoice, index) => (
                    <React.Fragment key={invoice.invoice_no}>
                      <tr className="bg-gray-50 border-t-2 border-gray-200">
                        <td colSpan="7" className="px-6 py-3">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <Receipt size={16} className="mr-2 text-indigo-600" />
                              <span className="font-semibold text-gray-900">Invoice: {invoice.invoice_no}</span>
                              <span className="ml-3 text-sm text-gray-600">
                                {new Date(invoice.sale_date).toLocaleDateString()} at {new Date(invoice.sale_date).toLocaleTimeString()}
                              </span>
                            </div>
                            <div className="flex items-center space-x-4">
                              <span className="text-sm font-medium text-gray-700">
                                {invoice.items.length} product{invoice.items.length > 1 ? 's' : ''}, {invoice.total_items} items total
                              </span>
                              <span className="text-lg font-bold text-green-600">
                                Rs. {invoice.total_amount.toFixed(2)}
                              </span>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => viewInvoiceDetails(invoice)}
                                  className="text-indigo-600 hover:text-indigo-800 font-medium text-sm flex items-center bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded transition-all"
                                  title="View invoice details"
                                >
                                  <Eye size={14} className="mr-1" />
                                  View
                                </button>
                                <button
                                  onClick={() => generateVATBillForInvoice(invoice)}
                                  className="text-green-600 hover:text-green-800 font-medium text-sm flex items-center bg-green-50 hover:bg-green-100 px-2 py-1 rounded transition-all"
                                  title="Generate VAT Bill"
                                >
                                  <FileText size={14} className="mr-1" />
                                  VAT Bill
                                </button>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                      {invoice.items.map((sale, itemIndex) => (
                        <tr key={`${invoice.invoice_no}-${sale.id}`} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 pl-12">
                            <div className="text-xs text-gray-500">
                              Line #{itemIndex + 1}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <Package size={16} className="mr-2 text-gray-400" />
                              <span className="text-sm text-gray-900">{getProductName(sale.product_id)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <ShoppingCart size={16} className="mr-2 text-gray-400" />
                              <span className="text-sm font-semibold text-gray-900">{sale.quantity_sold}</span>
                              <span className="text-xs text-gray-500 ml-1">units</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-semibold text-gray-900">
                              Rs. {parseFloat(sale.price_each).toFixed(2)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-bold text-green-600">
                              Rs. {parseFloat(sale.total_price).toFixed(2)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs text-gray-400">—</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs text-gray-400">—</span>
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
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

export default SalesHistory;
