import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import DHISidebar from '../components/DHISidebar';
import { dataRefreshEmitter } from '../hooks/useDataRefresh';
import { 
  History, 
  Filter, 
  Search, 
  Calendar,
  Package,
  ShoppingCart,
  TrendingUp,
  Plus,
  RefreshCw,
  Download,
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
  User,
  Tag
} from 'lucide-react';

const HistoryPage = () => {
  const [historyData, setHistoryData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: 'all', // all, sales, products, stock
    dateRange: 'all', // all, today, week, month, custom
    startDate: '',
    endDate: '',
    searchTerm: ''
  });

  useEffect(() => {
    fetchHistoryData();
    
    // Listen for global data refresh events
    const unsubscribe = dataRefreshEmitter.subscribe(() => {
      fetchHistoryData();
    });
    
    return unsubscribe;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    applyFilters();
  }, [historyData, filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchHistoryData = async () => {
    try {
      setLoading(true);
      
      // Fetch activity history from backend
      const params = new URLSearchParams();
      if (filters.type !== 'all') {
        params.append('type', filters.type);
      }
      if (filters.dateRange === 'custom' && filters.startDate) {
        params.append('startDate', filters.startDate);
      }
      if (filters.dateRange === 'custom' && filters.endDate) {
        params.append('endDate', filters.endDate);
      }
      
      const historyRes = await axios.get(`/history/activities?${params.toString()}`);
      const activities = historyRes.data.data || [];
      
      // Transform the data for the frontend
      const transformedHistory = activities.map(activity => ({
        id: activity.id,
        type: activity.type,
        title: activity.title,
        description: activity.description,
        date: new Date(activity.timestamp),
        details: activity.details,
        icon: activity.type === 'sale' ? ShoppingCart : Package,
        color: activity.type === 'sale' ? 'blue' : 'green'
      }));
      
      setHistoryData(transformedHistory);
    } catch (err) {
      console.error('Error fetching history data:', err);
      // Fallback to original method if backend endpoint fails
      await fetchHistoryDataFallback();
    } finally {
      setLoading(false);
    }
  };

  const fetchHistoryDataFallback = async () => {
    try {
      // Fetch sales data
      const salesRes = await axios.get('/sales/list');
      const sales = salesRes.data.data || [];
      
      // Fetch products data
      const productsRes = await axios.get('/products/list');
      const products = productsRes.data.data || [];
      
      // Create combined history array
      const combinedHistory = [];
      
      // Add sales history
      sales.forEach(sale => {
        const product = products.find(p => p.id == sale.product_id);
        combinedHistory.push({
          id: `sale-${sale.id}`,
          type: 'sale',
          title: `Sale: ${product?.name || 'Unknown Product'}`,
          description: `Sold ${sale.quantity_sold} units for Rs. ${sale.total_price}`,
          date: new Date(sale.sale_date || sale.created_at),
          details: {
            invoice_no: sale.invoice_no,
            product_name: product?.name || 'Unknown',
            quantity: sale.quantity_sold,
            price_each: sale.price_each,
            total_price: sale.total_price,
            product_id: sale.product_id
          },
          icon: ShoppingCart,
          color: 'blue'
        });
      });
      
      // Add product creation history (simulated - in real app you'd have audit logs)
      products.forEach(product => {
        combinedHistory.push({
          id: `product-${product.id}`,
          type: 'product',
          title: `Product Added: ${product.name}`,
          description: `Added ${product.category} product with ${product.total_stock} units`,
          date: new Date(product.created_at || Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
          details: {
            product_name: product.name,
            category: product.category,
            price: product.price,
            initial_stock: product.total_stock,
            model_no: product.modelNo,
            hs_code: product.hsCode
          },
          icon: Package,
          color: 'green'
        });
      });
      
      // Sort by date (newest first)
      combinedHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      setHistoryData(combinedHistory);
    } catch (err) {
      console.error('Error fetching fallback history data:', err);
    }
  };

  const applyFilters = () => {
    let filtered = [...historyData];
    
    // Type filter
    if (filters.type !== 'all') {
      filtered = filtered.filter(item => item.type === filters.type);
    }
    
    // Search filter
    if (filters.searchTerm.trim()) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(searchLower) ||
        item.description.toLowerCase().includes(searchLower) ||
        item.details.product_name?.toLowerCase().includes(searchLower)
      );
    }
    
    // Date range filter
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (filters.dateRange) {
      case 'today':
        filtered = filtered.filter(item => item.date >= today);
        break;
      case 'week': {
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(item => item.date >= weekAgo);
        break;
      }
      case 'month': {
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(item => item.date >= monthAgo);
        break;
      }
      case 'custom':
        if (filters.startDate) {
          const startDate = new Date(filters.startDate);
          filtered = filtered.filter(item => item.date >= startDate);
        }
        if (filters.endDate) {
          const endDate = new Date(filters.endDate);
          endDate.setHours(23, 59, 59, 999);
          filtered = filtered.filter(item => item.date <= endDate);
        }
        break;
    }
    
    setFilteredData(filtered);
  };

  const clearFilters = () => {
    setFilters({
      type: 'all',
      dateRange: 'all',
      startDate: '',
      endDate: '',
      searchTerm: ''
    });
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'sale':
        return ShoppingCart;
      case 'product':
        return Package;
      case 'stock':
        return TrendingUp;
      default:
        return Clock;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'sale':
        return 'text-blue-600 bg-blue-100';
      case 'product':
        return 'text-green-600 bg-green-100';
      case 'stock':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  return (
    <div className="flex">
      <DHISidebar />
      <main className="flex-1 ml-72 p-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <History size={32} className="mr-4 text-purple-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Activity History</h1>
              <p className="text-gray-600 mt-1">Track all activities across your inventory system</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={fetchHistoryData}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center transition-all"
              title="Refresh history"
            >
              <RefreshCw size={16} className="mr-2" />
              Refresh
            </button>
            <div className="text-right">
              <p className="text-sm text-gray-600">Total Activities</p>
              <p className="text-2xl font-bold text-purple-600">{filteredData.length}</p>
            </div>
          </div>
        </div>

        {/* Activity Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Sales</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">
                  {historyData.filter(item => item.type === 'sale').length}
                </p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <ShoppingCart size={24} className="text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Products Added</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {historyData.filter(item => item.type === 'product').length}
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <Package size={24} className="text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Stock Changes</p>
                <p className="text-2xl font-bold text-orange-600 mt-1">
                  {historyData.filter(item => item.type === 'stock').length}
                </p>
              </div>
              <div className="p-3 rounded-full bg-orange-100">
                <TrendingUp size={24} className="text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Activities</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">
                  {historyData.filter(item => {
                    const today = new Date();
                    const itemDate = new Date(item.date);
                    return itemDate.toDateString() === today.toDateString();
                  }).length}
                </p>
              </div>
              <div className="p-3 rounded-full bg-purple-100">
                <Clock size={24} className="text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Filter size={24} className="mr-3 text-purple-600" />
              <h2 className="text-xl font-semibold text-gray-900">Filter Activities</h2>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                {filteredData.length} of {historyData.length} activities
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            {/* Activity Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Activity Type</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Activities</option>
                <option value="sale">Sales</option>
                <option value="product">Products</option>
                <option value="stock">Stock Changes</option>
              </select>
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>

            {/* Start Date (for custom range) */}
            {filters.dateRange === 'custom' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            )}

            {/* End Date (for custom range) */}
            {filters.dateRange === 'custom' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            )}

            {/* Search */}
            <div className={filters.dateRange === 'custom' ? 'md:col-span-1' : 'md:col-span-2'}>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={filters.searchTerm}
                  onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                  placeholder="Search activities..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Clear Filters */}
          {(filters.type !== 'all' || filters.dateRange !== 'all' || filters.searchTerm) && (
            <div className="flex justify-end">
              <button
                onClick={clearFilters}
                className="text-purple-600 hover:text-purple-700 text-sm font-medium"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>

        {/* History List */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              <span className="ml-3 text-gray-600 font-medium">Loading history...</span>
            </div>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <History size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Activities Found</h3>
            <p className="text-gray-600 mb-4">
              {historyData.length === 0 
                ? "No activities have been recorded yet." 
                : "No activities match your current filters."
              }
            </p>
            {historyData.length > 0 && (
              <button
                onClick={clearFilters}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Activity Timeline</h2>
            </div>
            
            <div className="divide-y divide-gray-200">
              {filteredData.map((item) => {
                const IconComponent = getActivityIcon(item.type);
                return (
                  <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start space-x-4">
                      <div className={`p-2 rounded-full ${getActivityColor(item.type)}`}>
                        <IconComponent size={20} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                          <time className="text-sm text-gray-500">{formatDate(item.date)}</time>
                        </div>
                        
                        <p className="text-gray-600 mt-1">{item.description}</p>
                        
                        {/* Activity Details */}
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {item.type === 'sale' && (
                            <>
                              <div className="text-sm">
                                <span className="font-medium text-gray-700">Invoice:</span>
                                <span className="ml-1 text-gray-600">{item.details.invoice_no}</span>
                              </div>
                              <div className="text-sm">
                                <span className="font-medium text-gray-700">Quantity:</span>
                                <span className="ml-1 text-gray-600">{item.details.quantity} units</span>
                              </div>
                              <div className="text-sm">
                                <span className="font-medium text-gray-700">Price Each:</span>
                                <span className="ml-1 text-gray-600">Rs. {item.details.price_each}</span>
                              </div>
                            </>
                          )}
                          
                          {item.type === 'product' && (
                            <>
                              <div className="text-sm">
                                <span className="font-medium text-gray-700">Category:</span>
                                <span className="ml-1 text-gray-600">{item.details.category}</span>
                              </div>
                              <div className="text-sm">
                                <span className="font-medium text-gray-700">Price:</span>
                                <span className="ml-1 text-gray-600">Rs. {item.details.price}</span>
                              </div>
                              <div className="text-sm">
                                <span className="font-medium text-gray-700">Initial Stock:</span>
                                <span className="ml-1 text-gray-600">{item.details.initial_stock} units</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default HistoryPage;
