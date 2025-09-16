import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import DHISidebar from '../components/DHISidebar';
import RsIcon from '../components/RsIcon';
import { dataRefreshEmitter } from '../hooks/useDataRefresh';
import { 
  Package, 
  ShoppingCart, 
  AlertTriangle, 
  TrendingUp,
  Calendar,
  Eye
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalSales: 0,
    totalRevenue: 0,
    lowStockProducts: 0,
    todaysSales: 0,
    todaysRevenue: 0
  });

  const [recentSales, setRecentSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    
    const unsubscribe = dataRefreshEmitter.subscribe(() => {
      fetchDashboardData();
    });
    
    return unsubscribe;
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch products
      let products = [];
      try {
        const productsRes = await axios.get('/products/list');
        products = productsRes.data.data || [];
      } catch (productsErr) {
        // No products data found
        products = [];
      }
      
      // Fetch sales
      let sales = [];
      try {
        const salesRes = await axios.get('/sales/list');
        sales = salesRes.data.data || [];
      } catch (salesErr) {
        // No sales data found - this is normal for new shops
        sales = [];
      }
      
      // Calculate basic stats
      const totalProducts = products.length;
      const totalSales = sales.length;
      const totalRevenue = sales.reduce((sum, sale) => sum + parseFloat(sale.total_price || 0), 0);
      const lowStockProducts = products.filter(p => (p.available_stock || 0) < 10).length;
      
      // Today's stats
      const today = new Date().toDateString();
      const todaysSales = sales.filter(sale => new Date(sale.sale_date).toDateString() === today);
      const todaysRevenue = todaysSales.reduce((sum, sale) => sum + parseFloat(sale.total_price || 0), 0);
      
      setStats({
        totalProducts,
        totalSales,
        totalRevenue,
        lowStockProducts,
        todaysSales: todaysSales.length,
        todaysRevenue
      });

      // Get recent sales (last 5)
      setRecentSales(sales.slice(-5).reverse());
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex">
        <DHISidebar />
        <main className="flex-1 ml-72 p-6 bg-gray-50 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex">
      <DHISidebar />
      <main className="flex-1 ml-72 p-6 bg-gray-50 min-h-screen">
        
        {/* Simple Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's your business overview.</p>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => navigate('/dhi/sales')}
              className="flex items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-all"
            >
              <ShoppingCart size={20} className="mr-2" />
              <span className="font-medium">New Sale</span>
            </button>
            <button
              onClick={() => navigate('/dhi/products')}
              className="flex items-center justify-center p-4 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-all"
            >
              <Package size={20} className="mr-2" />
              <span className="font-medium">Products</span>
            </button>
            <button
              onClick={() => navigate('/dhi/stock')}
              className="flex items-center justify-center p-4 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-lg transition-all"
            >
              <AlertTriangle size={20} className="mr-2" />
              <span className="font-medium">Stock</span>
            </button>
            <button
              onClick={() => navigate('/dhi/sales-history')}
              className="flex items-center justify-center p-4 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition-all"
            >
              <TrendingUp size={20} className="mr-2" />
              <span className="font-medium">Sales History</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Package size={24} className="text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <ShoppingCart size={24} className="text-green-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total Sales</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalSales}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <RsIcon size={24} className="text-purple-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">Rs. {stats.totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <AlertTriangle size={24} className="text-red-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Low Stock Items</p>
                <p className="text-2xl font-bold text-gray-900">{stats.lowStockProducts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Calendar size={24} className="text-orange-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Today's Sales</p>
                <p className="text-2xl font-bold text-gray-900">{stats.todaysSales}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <TrendingUp size={24} className="text-green-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Today's Revenue</p>
                <p className="text-2xl font-bold text-gray-900">Rs. {stats.todaysRevenue.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Sales */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Recent Sales</h2>
              <button 
                onClick={() => navigate('/sales-history')}
                className="text-blue-600 hover:text-blue-800 flex items-center text-sm font-medium"
              >
                <Eye size={16} className="mr-1" />
                View All
              </button>
            </div>
          </div>
          
          <div className="p-6">
            {recentSales.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">No sales found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 font-semibold text-gray-700">Invoice</th>
                      <th className="text-left py-3 font-semibold text-gray-700">Date</th>
                      <th className="text-left py-3 font-semibold text-gray-700">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentSales.map((sale, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-3">
                          <span className="font-medium text-blue-600">{sale.invoice_no}</span>
                        </td>
                        <td className="py-3">
                          <span className="text-gray-600">
                            {new Date(sale.sale_date).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className="font-medium text-green-600">
                            Rs. {parseFloat(sale.total_price).toFixed(2)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
