import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import Sidebar from '../components/Sidebar';
import ConnectionStatus from '../components/ConnectionStatus';
import { dataRefreshEmitter } from '../hooks/useDataRefresh';
import { 
  Package, 
  Grid3X3, 
  ShoppingCart, 
  DollarSign, 
  AlertTriangle, 
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Eye,
  BarChart3,
  History
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    totalSales: 0,
    totalRevenue: 0,
    lowStockProducts: [],
    outOfStockProducts: 0,
    topCategories: [],
    todaysSales: 0,
    todaysRevenue: 0
  });

  const [recentSales, setRecentSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    
    // Listen for global data refresh events
    const unsubscribe = dataRefreshEmitter.subscribe(() => {
      fetchDashboardData();
    });
    
    // Set up periodic refresh every 30 seconds
    const intervalId = setInterval(() => {
      fetchDashboardData();
    }, 30000); // 30 seconds
    
    return () => {
      unsubscribe();
      clearInterval(intervalId);
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch products
      const productsRes = await axios.get('/products/list');
      const products = productsRes.data.data;

      // Fetch sales
      const salesRes = await axios.get('/sales/list');
      const sales = salesRes.data.data;

      // Calculate basic stats
      const totalProducts = products.length;
      const totalCategories = [...new Set(products.map(p => p.category))].length;
      const totalSales = sales.length;
      const totalRevenue = sales.reduce((sum, sale) => sum + parseFloat(sale.total_price), 0);
      const lowStockProducts = products.filter(p => (p.available_stock || 0) < 10 && (p.available_stock || 0) > 0);
      const outOfStockProducts = products.filter(p => (p.available_stock || 0) === 0).length;

      // Calculate today's stats
      const today = new Date().toDateString();
      const todaysSales = sales.filter(sale => 
        new Date(sale.sale_date).toDateString() === today
      );
      const todaysRevenue = todaysSales.reduce((sum, sale) => sum + parseFloat(sale.total_price), 0);

      // Calculate top categories by sales
      const categoryStats = {};
      sales.forEach(sale => {
        const product = products.find(p => p.id == sale.product_id);
        if (product) {
          const category = product.category;
          if (!categoryStats[category]) {
            categoryStats[category] = { sales: 0, revenue: 0 };
          }
          categoryStats[category].sales += parseInt(sale.quantity_sold);
          categoryStats[category].revenue += parseFloat(sale.total_price);
        }
      });

      const topCategories = Object.entries(categoryStats)
        .map(([category, data]) => ({ category, ...data }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 3);

      setStats({
        totalProducts,
        totalCategories,
        totalSales,
        totalRevenue,
        lowStockProducts,
        outOfStockProducts,
        topCategories,
        todaysSales: todaysSales.length,
        todaysRevenue
      });

      // Get recent sales (last 5)
      setRecentSales(sales.slice(-5).reverse());
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 ml-72 p-6 bg-gray-50 min-h-screen">{/* Adjusted margin for fixed sidebar */}
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Welcome back! Here's what's happening with your inventory.
              {lastUpdated && (
                <span className="ml-2 text-sm text-gray-500">
                  • Last updated: {lastUpdated.toLocaleTimeString()}
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={fetchDashboardData}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-all"
              title="Refresh dashboard data"
            >
              <TrendingUp size={16} className="mr-2" />
              Refresh
            </button>
            <ConnectionStatus />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => navigate('/sales')}
              className="flex items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-all hover:scale-105"
            >
              <ShoppingCart size={20} className="mr-2" />
              <span className="font-medium">New Sale</span>
            </button>
            <button
              onClick={() => navigate('/products')}
              className="flex items-center justify-center p-4 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-all hover:scale-105"
            >
              <Package size={20} className="mr-2" />
              <span className="font-medium">Add Product</span>
            </button>
            <button
              onClick={() => navigate('/stock')}
              className="flex items-center justify-center p-4 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-lg transition-all hover:scale-105"
            >
              <AlertTriangle size={20} className="mr-2" />
              <span className="font-medium">Manage Stock</span>
            </button>
            <button
              onClick={() => navigate('/sales-history')}
              className="flex items-center justify-center p-4 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition-all hover:scale-105"
            >
              <BarChart3 size={20} className="mr-2" />
              <span className="font-medium">View Reports</span>
            </button>
            <button
              onClick={() => navigate('/history')}
              className="flex items-center justify-center p-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition-all hover:scale-105"
            >
              <History size={20} className="mr-2" />
              <span className="font-medium">Activity History</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading dashboard...</span>
          </div>
        ) : (
          <>
            {/* Today's Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div 
                onClick={() => navigate('/sales-history')}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer hover:scale-105"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Today's Sales</p>
                    <p className="text-2xl font-bold text-blue-600 mt-1">{stats.todaysSales}</p>
                    <p className="text-xs text-gray-500 mt-1">transactions today</p>
                  </div>
                  <div className="p-3 rounded-full bg-blue-100">
                    <Calendar size={24} className="text-blue-600" />
                  </div>
                </div>
              </div>

              <div 
                onClick={() => navigate('/sales-history')}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer hover:scale-105"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Today's Revenue</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">Rs. {stats.todaysRevenue.toFixed(2)}</p>
                    <p className="text-xs text-gray-500 mt-1">earned today</p>
                  </div>
                  <div className="p-3 rounded-full bg-green-100">
                    <TrendingUp size={24} className="text-green-600" />
                  </div>
                </div>
              </div>

              <div 
                onClick={() => navigate('/stock')}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer hover:scale-105"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
                    <p className="text-2xl font-bold text-orange-600 mt-1">{stats.lowStockProducts.length}</p>
                    <p className="text-xs text-gray-500 mt-1">need attention</p>
                  </div>
                  <div className="p-3 rounded-full bg-orange-100">
                    <AlertTriangle size={24} className="text-orange-600" />
                  </div>
                </div>
              </div>

              <div 
                onClick={() => navigate('/stock')}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer hover:scale-105"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                    <p className="text-2xl font-bold text-red-600 mt-1">{stats.outOfStockProducts}</p>
                    <p className="text-xs text-gray-500 mt-1">products unavailable</p>
                  </div>
                  <div className="p-3 rounded-full bg-red-100">
                    <Package size={24} className="text-red-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Main Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div 
                onClick={() => navigate('/products')}
                className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl text-white shadow-lg cursor-pointer hover:scale-105 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Total Products</p>
                    <p className="text-3xl font-bold mt-2">{stats.totalProducts}</p>
                    <div className="flex items-center mt-2">
                      <ArrowUpRight size={16} />
                      <span className="text-xs ml-1">in inventory</span>
                    </div>
                  </div>
                  <Package size={32} className="text-blue-200" />
                </div>
              </div>

              <div 
                onClick={() => navigate('/products')}
                className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl text-white shadow-lg cursor-pointer hover:scale-105 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Categories</p>
                    <p className="text-3xl font-bold mt-2">{stats.totalCategories}</p>
                    <div className="flex items-center mt-2">
                      <Grid3X3 size={16} />
                      <span className="text-xs ml-1">product types</span>
                    </div>
                  </div>
                  <Grid3X3 size={32} className="text-green-200" />
                </div>
              </div>

              <div 
                onClick={() => navigate('/sales-history')}
                className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl text-white shadow-lg cursor-pointer hover:scale-105 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">Total Sales</p>
                    <p className="text-3xl font-bold mt-2">{stats.totalSales}</p>
                    <div className="flex items-center mt-2">
                      <ShoppingCart size={16} />
                      <span className="text-xs ml-1">all time</span>
                    </div>
                  </div>
                  <ShoppingCart size={32} className="text-purple-200" />
                </div>
              </div>

              <div 
                onClick={() => navigate('/sales-history')}
                className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-6 rounded-xl text-white shadow-lg cursor-pointer hover:scale-105 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-100 text-sm font-medium">Total Revenue</p>
                    <p className="text-2xl font-bold mt-2">Rs. {stats.totalRevenue.toFixed(2)}</p>
                    <div className="flex items-center mt-2">
                      <DollarSign size={16} />
                      <span className="text-xs ml-1">all time</span>
                    </div>
                  </div>
                  <DollarSign size={32} className="text-yellow-200" />
                </div>
              </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Low Stock Alert */}
              <div 
                onClick={() => navigate('/stock')}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition-all"
              >
                <div className="bg-red-50 px-6 py-4 border-b border-red-100">
                  <div className="flex items-center">
                    <AlertTriangle size={20} className="text-red-600 mr-2" />
                    <h3 className="text-lg font-semibold text-red-800">Low Stock Alert</h3>
                    <span className="ml-auto text-xs text-red-600 font-medium">Click to manage →</span>
                  </div>
                </div>
                <div className="p-6">
                  {stats.lowStockProducts.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Package size={24} className="text-green-600" />
                      </div>
                      <p className="text-gray-600 font-medium">All products have sufficient stock!</p>
                      <p className="text-sm text-gray-500 mt-1">Great job managing your inventory</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {stats.lowStockProducts.slice(0, 5).map((product) => (
                        <div key={product.id} className="flex items-center justify-between p-3 bg-red-25 rounded-lg border-l-4 border-red-400">
                          <div>
                            <p className="font-medium text-gray-900">{product.name}</p>
                            <p className="text-xs text-gray-500">{product.category}</p>
                          </div>
                          <div className="text-right">
                            <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                              {product.available_stock || 0} left
                            </span>
                          </div>
                        </div>
                      ))}
                      {stats.lowStockProducts.length > 5 && (
                        <p className="text-sm text-gray-500 text-center pt-2">
                          +{stats.lowStockProducts.length - 5} more items need attention
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Sales */}
              <div 
                onClick={() => navigate('/sales-history')}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition-all"
              >
                <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <TrendingUp size={20} className="text-blue-600 mr-2" />
                      <h3 className="text-lg font-semibold text-blue-800">Recent Sales</h3>
                    </div>
                    <span className="text-xs text-blue-600 font-medium">View all →</span>
                  </div>
                </div>
                <div className="p-6">
                  {recentSales.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShoppingCart size={24} className="text-gray-400" />
                      </div>
                      <p className="text-gray-600 font-medium">No recent sales found</p>
                      <p className="text-sm text-gray-500 mt-1">Sales will appear here when made</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {recentSales.map((sale) => (
                        <div key={sale.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div>
                            <p className="font-medium text-gray-900">#{sale.invoice_no}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(sale.sale_date).toLocaleDateString()} • {sale.quantity_sold} units
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-600">Rs. {sale.total_price}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Top Categories */}
              <div 
                onClick={() => navigate('/products')}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition-all"
              >
                <div className="bg-purple-50 px-6 py-4 border-b border-purple-100">
                  <div className="flex items-center">
                    <BarChart3 size={20} className="text-purple-600 mr-2" />
                    <h3 className="text-lg font-semibold text-purple-800">Top Categories</h3>
                    <span className="ml-auto text-xs text-purple-600 font-medium">Manage products →</span>
                  </div>
                </div>
                <div className="p-6">
                  {stats.topCategories.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BarChart3 size={24} className="text-gray-400" />
                      </div>
                      <p className="text-gray-600 font-medium">No sales data available</p>
                      <p className="text-sm text-gray-500 mt-1">Start making sales to see top categories</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {stats.topCategories.map((category, index) => (
                        <div key={category.category} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mr-3 ${
                              index === 0 ? 'bg-yellow-100 text-yellow-800' :
                              index === 1 ? 'bg-gray-100 text-gray-600' :
                              'bg-orange-100 text-orange-600'
                            }`}>
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 capitalize">{category.category}</p>
                              <p className="text-xs text-gray-500">{category.sales} units sold</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900">Rs. {category.revenue.toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
