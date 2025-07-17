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

  const { totalSales, totalRevenue, totalQuantity } = calculateTotals();

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
                <p className="text-sm font-medium text-gray-600">Total Sales</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">{totalSales}</p>
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
                  Rs. {totalSales > 0 ? (totalRevenue / totalSales).toFixed(0) : '0'}
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
                  {filteredSales.length} records found
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
                  {filteredSales.map((sale, index) => (
                    <tr key={sale.id || index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{sale.invoice_no}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            Sale #{sale.id}
                          </div>
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
                        <div>
                          <div className="text-sm text-gray-900">
                            {new Date(sale.sale_date).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(sale.sale_date).toLocaleTimeString()}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          className="text-indigo-600 hover:text-indigo-800 font-medium text-sm flex items-center"
                          title="View details"
                        >
                          <Eye size={14} className="mr-1" />
                          View
                        </button>
                      </td>
                    </tr>
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
