import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import Sidebar from '../components/Sidebar';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    totalSales: 0,
    totalRevenue: 0,
    lowStockProducts: []
  });

  const [recentSales, setRecentSales] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
    
      // Fetch products
      const productsRes = await axios.get('/products/list');
      const products = productsRes.data.data;

      // Fetch sales
      const salesRes = await axios.get('/sales/list');
      const sales = salesRes.data.data;

      // Calculate stats
      const totalProducts = products.length;
      const totalCategories = [...new Set(products.map(p => p.category))].length;
      const totalSales = sales.length;
      const totalRevenue = sales.reduce((sum, sale) => sum + parseFloat(sale.total_price), 0);
      const lowStockProducts = products.filter(p => p.total_stock < 10);

      setStats({
        totalProducts,
        totalCategories,
        totalSales,
        totalRevenue,
        lowStockProducts
      });

      // Get recent sales (last 5)
      setRecentSales(sales.slice(-5).reverse());
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-6 bg-gray-100 min-h-screen">
        <h1 className="text-3xl font-bold mb-6">📊 Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-500">
                📦
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-semibold text-gray-700">Total Products</h2>
                <p className="text-2xl font-bold text-blue-600">{stats.totalProducts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-500">
                📂
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-semibold text-gray-700">Categories</h2>
                <p className="text-2xl font-bold text-green-600">{stats.totalCategories}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-500">
                🛒
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-semibold text-gray-700">Total Sales</h2>
                <p className="text-2xl font-bold text-purple-600">{stats.totalSales}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-500">
                💰
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-semibold text-gray-700">Total Revenue</h2>
                <p className="text-2xl font-bold text-yellow-600">Rs. {stats.totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Low Stock Alert */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-red-600">⚠️ Low Stock Alert</h2>
            {stats.lowStockProducts.length === 0 ? (
              <p className="text-gray-500">All products have sufficient stock!</p>
            ) : (
              <div className="space-y-2">
                {stats.lowStockProducts.map((product) => (
                  <div key={product.id} className="flex justify-between items-center p-3 bg-red-50 rounded">
                    <span className="font-medium">{product.name}</span>
                    <span className="text-red-600 font-bold">{product.total_stock} units left</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Sales */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">📈 Recent Sales</h2>
            {recentSales.length === 0 ? (
              <p className="text-gray-500">No recent sales found.</p>
            ) : (
              <div className="space-y-3">
                {recentSales.map((sale) => (
                  <div key={sale.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">Invoice: {sale.invoice_no}</p>
                      <p className="text-sm text-gray-600">Product ID: {sale.product_id}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">Rs. {sale.total_price}</p>
                      <p className="text-sm text-gray-600">{sale.quantity_sold} units</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
