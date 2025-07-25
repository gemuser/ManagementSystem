import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import Sidebar from '../components/Sidebar';
import { dataRefreshEmitter } from '../hooks/useDataRefresh';
import { 
  BookOpen,
  RefreshCw,
  Plus,
  Minus,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

const DayBook = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [dateFilter, setDateFilter] = useState('today'); // today, week, month, custom
  const [dayData, setDayData] = useState({
    sales: [], // Credit entries (money coming in)
    purchases: [] // Debit entries (money going out)
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDayBookData();
    
    const unsubscribe = dataRefreshEmitter.subscribe(() => {
      fetchDayBookData();
    });
    
    return unsubscribe;
  }, [selectedDate, dateFilter]);

  const fetchDayBookData = async () => {
    try {
      setLoading(true);
      
      // Fetch sales data (CREDIT - Money coming in)
      let allSales = [];
      try {
        const salesRes = await axios.get('/sales/list');
        allSales = salesRes.data.data || [];
      } catch (salesErr) {
        console.log('No sales data found - this is normal for new shops');
        allSales = [];
      }
      
      // Fetch purchases data (DEBIT - Money going out for purchases)
      let allPurchases = [];
      try {
        const purchasesRes = await axios.get('/purchases/list');
        allPurchases = purchasesRes.data.data || [];
      } catch (purchasesErr) {
        console.log('No purchases data found - this is normal for new shops');
        allPurchases = [];
      }
      
      // Fetch products data for sales product names
      let products = [];
      try {
        const productsRes = await axios.get('/products/list');
        products = productsRes.data.data || [];
      } catch (productsErr) {
        console.log('No products data found');
        products = [];
      }
      
      // Filter sales for selected date/period (CREDIT entries)
      const selected = new Date(selectedDate);
      const today = new Date();
      
      let filteredSales = [];
      
      switch (dateFilter) {
        case 'today':
          filteredSales = allSales.filter(sale => {
            const saleDate = new Date(sale.sale_date);
            const saleDateOnly = new Date(saleDate.getFullYear(), saleDate.getMonth(), saleDate.getDate());
            const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            return saleDateOnly.getTime() === todayOnly.getTime();
          });
          break;
        case 'week':
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          filteredSales = allSales.filter(sale => {
            const saleDate = new Date(sale.sale_date);
            return saleDate >= weekAgo && saleDate <= today;
          });
          break;
        case 'month':
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
          filteredSales = allSales.filter(sale => {
            const saleDate = new Date(sale.sale_date);
            return saleDate >= monthAgo && saleDate <= today;
          });
          break;
        case 'custom':
          filteredSales = allSales.filter(sale => {
            const saleDate = new Date(sale.sale_date);
            const saleDateOnly = new Date(saleDate.getFullYear(), saleDate.getMonth(), saleDate.getDate());
            const selectedOnly = new Date(selected.getFullYear(), selected.getMonth(), selected.getDate());
            return saleDateOnly.getTime() === selectedOnly.getTime();
          });
          break;
        default:
          filteredSales = allSales;
      }
      
      // Filter stock purchases for selected date/period (DEBIT entries)
      let filteredPurchases = [];
      
      switch (dateFilter) {
        case 'today':
          filteredPurchases = allPurchases.filter(purchase => {
            const purchaseDate = new Date(purchase.purchase_date);
            const purchaseDateOnly = new Date(purchaseDate.getFullYear(), purchaseDate.getMonth(), purchaseDate.getDate());
            const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            return purchaseDateOnly.getTime() === todayOnly.getTime();
          });
          break;
        case 'week':
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          filteredPurchases = allPurchases.filter(purchase => {
            const purchaseDate = new Date(purchase.purchase_date);
            return purchaseDate >= weekAgo && purchaseDate <= today;
          });
          break;
        case 'month':
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
          filteredPurchases = allPurchases.filter(purchase => {
            const purchaseDate = new Date(purchase.purchase_date);
            return purchaseDate >= monthAgo && purchaseDate <= today;
          });
          break;
        case 'custom':
          filteredPurchases = allPurchases.filter(purchase => {
            const purchaseDate = new Date(purchase.purchase_date);
            const purchaseDateOnly = new Date(purchaseDate.getFullYear(), purchaseDate.getMonth(), purchaseDate.getDate());
            const selectedOnly = new Date(selected.getFullYear(), selected.getMonth(), selected.getDate());
            return purchaseDateOnly.getTime() === selectedOnly.getTime();
          });
          break;
        default:
          filteredPurchases = allPurchases;
      }
      
      // Get product names for sales (CREDIT)
      const salesWithProductNames = filteredSales.map(sale => {
        const product = products.find(p => p.id == sale.product_id);
        return {
          ...sale,
          product_name: product ? product.name : `Product ID: ${sale.product_id}`,
          type: 'credit'
        };
      });
      
      // Get product names for purchases (DEBIT) - already have product_name in data
      const purchasesWithProductNames = filteredPurchases.map(purchase => {
        return {
          ...purchase,
          type: 'debit',
          total_amount: parseFloat(purchase.total_amount || 0)
        };
      });
      
      setDayData({
        sales: salesWithProductNames,
        purchases: purchasesWithProductNames
      });
      
    } catch (err) {
      console.error('Error fetching day book data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getDisplayPeriod = () => {
    switch (dateFilter) {
      case 'today':
        return 'Today';
      case 'week':
        return 'Last 7 Days';
      case 'month':
        return 'Last 30 Days';
      case 'custom':
        return new Date(selectedDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      default:
        return 'All Time';
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
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
            <p className="text-gray-600">Loading day book...</p>
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
              <div className="bg-blue-600 p-3 rounded-xl mr-4">
                <BookOpen size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-1">Day Book</h1>
                <p className="text-gray-600 text-lg">Credit & Debit Records</p>
              </div>
            </div>
            <button
              onClick={fetchDayBookData}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center transition-all"
            >
              <RefreshCw size={16} className="mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Date Selection */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter Period</label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="custom">Custom Date</option>
              </select>
            </div>
            
            {dateFilter === 'custom' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}
            
            <div className="text-right">
              <p className="text-sm text-gray-600 mb-1">Viewing records for</p>
              <p className="text-xl font-bold text-blue-600">{getDisplayPeriod()}</p>
            </div>
          </div>
        </div>

        {/* Debit & Credit Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* CREDIT Section (Money Coming In - Sales) */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="bg-green-100 p-2 rounded-lg mr-3">
                  <Plus size={20} className="text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Credit (Income)</h2>
                  <p className="text-sm text-gray-600">Money coming in from sales</p>
                </div>
              </div>
              <span className="text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">
                {dayData.sales.length} entries
              </span>
            </div>
            
            {dayData.sales.length === 0 ? (
              <div className="text-center py-8">
                <TrendingUp size={32} className="mx-auto text-gray-400 mb-3" />
                <p className="text-gray-500 text-sm">No sales recorded</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {dayData.sales.map((sale, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                    <div>
                      <p className="font-medium text-gray-900">{sale.product_name}</p>
                      <p className="text-xs text-gray-600">
                        {formatTime(sale.sale_date)} • Invoice: {sale.invoice_no} • Qty: {sale.quantity_sold}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">+ Rs. {parseFloat(sale.total_price).toFixed(2)}</p>
                      <p className="text-xs text-gray-500">@ Rs. {parseFloat(sale.price_each || 0).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">Total Credit:</span>
                <span className="font-bold text-green-600 text-lg">
                  Rs. {dayData.sales.reduce((sum, sale) => sum + parseFloat(sale.total_price || 0), 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* DEBIT Section (Money Going Out - Purchases) */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="bg-red-100 p-2 rounded-lg mr-3">
                  <Minus size={20} className="text-red-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Debit (Expenses)</h2>
                  <p className="text-sm text-gray-600">Money going out for purchases</p>
                </div>
              </div>
              <span className="text-sm font-medium text-red-600 bg-red-50 px-3 py-1 rounded-full">
                {dayData.purchases.length} entries
              </span>
            </div>
            
            {dayData.purchases.length === 0 ? (
              <div className="text-center py-8">
                <TrendingDown size={32} className="mx-auto text-gray-400 mb-3" />
                <p className="text-gray-500 text-sm">No purchases recorded</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {dayData.purchases.map((purchase, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border-l-4 border-red-500">
                    <div>
                      <p className="font-medium text-gray-900">{purchase.product_name}</p>
                      <p className="text-xs text-gray-600">
                        {formatTime(purchase.purchase_date)} • Invoice: {purchase.invoice_no} • Qty: {purchase.quantity_purchased}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-600">- Rs. {purchase.total_amount.toFixed(2)}</p>
                      <p className="text-xs text-gray-500">@ Rs. {parseFloat(purchase.price_per_unit || 0).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">Total Debit:</span>
                <span className="font-bold text-red-600 text-lg">
                  Rs. {dayData.purchases.reduce((sum, purchase) => sum + purchase.total_amount, 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DayBook;