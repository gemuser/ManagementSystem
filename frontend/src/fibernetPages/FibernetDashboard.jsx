import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import FibernetSidebar from '../components/FibernetSidebar';
import RsIcon from '../components/RsIcon';
import { 
  Tv, 
  Wifi, 
  Package2, 
  Users, 
  TrendingUp,
  Activity,
  Calendar,
  BarChart3,
  PieChart,
  Eye,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const FibernetDashboard = () => {
  const [stats, setStats] = useState({
    dishhome: { total: 0, active: 0, revenue: 0 },
    fibernet: { total: 0, active: 0, revenue: 0 },
    combo: { total: 0, active: 0, revenue: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [recentCustomers, setRecentCustomers] = useState([]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [dishhomeRes, fibernetRes, comboRes] = await Promise.all([
        axios.get('/dishhome/list').catch(() => ({ data: { data: [] } })),
        axios.get('/fibernet/list').catch(() => ({ data: { data: [] } })),
        axios.get('/Dhfibernet/list').catch(() => ({ data: { data: [] } }))
      ]);

      const dishhomeData = dishhomeRes.data.data || [];
      const fibernetData = fibernetRes.data.data || [];
      const comboData = comboRes.data.data || [];

      // Calculate statistics
      const dishhomeStats = {
        total: dishhomeData.length,
        active: dishhomeData.filter(c => c.status === 1).length,
        revenue: dishhomeData.reduce((sum, c) => sum + parseFloat(c.price || 0), 0)
      };

      const fibernetStats = {
        total: fibernetData.length,
        active: fibernetData.filter(c => c.status === 1).length,
        revenue: fibernetData.reduce((sum, c) => sum + parseFloat(c.price || 0), 0)
      };

      const comboStats = {
        total: comboData.length,
        active: comboData.filter(c => c.status === 1).length,
        revenue: comboData.reduce((sum, c) => sum + parseFloat(c.totalPrice || 0), 0)
      };

      setStats({
        dishhome: dishhomeStats,
        fibernet: fibernetStats,
        combo: comboStats
      });

      // Get recent customers (latest 5 from each service)
      const allCustomers = [
        ...dishhomeData.slice(0, 3).map(c => ({ ...c, type: 'dishhome' })),
        ...fibernetData.slice(0, 3).map(c => ({ ...c, type: 'fibernet' })),
        ...comboData.slice(0, 2).map(c => ({ ...c, type: 'combo' }))
      ];
      setRecentCustomers(allCustomers.slice(0, 8));

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const StatCard = ({ title, value, subtitle, icon: Icon, color, bgColor, link }) => (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <div className="mt-2">
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
          </div>
        </div>
        <div className={`p-3 rounded-lg ${bgColor}`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
      </div>
      {link && (
        <Link to={link} className="mt-4 inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800">
          View Details
          <ChevronRight className="h-4 w-4 ml-1" />
        </Link>
      )}
    </div>
  );

  const totalRevenue = stats.dishhome.revenue + stats.fibernet.revenue + stats.combo.revenue;
  const totalCustomers = stats.dishhome.total + stats.fibernet.total + stats.combo.total;
  const activeCustomers = stats.dishhome.active + stats.fibernet.active + stats.combo.active;

  return (
    <div className="flex">
      <FibernetSidebar />
      <main className="flex-1 ml-72 p-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Fibernet Services Dashboard</h1>
                <p className="text-sm text-gray-500">Overview of dishhome, fibernet, and combo services</p>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <>
              {/* Overview Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                  title="Total Customers"
                  value={totalCustomers}
                  subtitle={`${activeCustomers} active`}
                  icon={Users}
                  color="text-blue-600"
                  bgColor="bg-blue-100"
                />
                <StatCard
                  title="Total Revenue"
                  value={`Rs. ${totalRevenue.toLocaleString()}`}
                  subtitle="Monthly revenue"
                  icon={RsIcon}
                  color="text-green-600"
                  bgColor="bg-green-100"
                />
                <StatCard
                  title="Active Services"
                  value={activeCustomers}
                  subtitle={`${((activeCustomers / totalCustomers) * 100 || 0).toFixed(1)}% active rate`}
                  icon={Activity}
                  color="text-emerald-600"
                  bgColor="bg-emerald-100"
                />
                <StatCard
                  title="Average Revenue"
                  value={`Rs. ${totalCustomers > 0 ? (totalRevenue / totalCustomers).toFixed(0) : 0}`}
                  subtitle="Per customer"
                  icon={TrendingUp}
                  color="text-purple-600"
                  bgColor="bg-purple-100"
                />
              </div>

              {/* Service Stats */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <StatCard
                  title="Dishhome Service"
                  value={stats.dishhome.total}
                  subtitle={`${stats.dishhome.active} active • Rs. ${stats.dishhome.revenue.toLocaleString()} revenue`}
                  icon={Tv}
                  color="text-purple-600"
                  bgColor="bg-purple-100"
                  link="/dishhome"
                />
                <StatCard
                  title="Fibernet Service"
                  value={stats.fibernet.total}
                  subtitle={`${stats.fibernet.active} active • Rs. ${stats.fibernet.revenue.toLocaleString()} revenue`}
                  icon={Wifi}
                  color="text-blue-600"
                  bgColor="bg-blue-100"
                  link="/fibernet"
                />
                <StatCard
                  title="Combo Packages"
                  value={stats.combo.total}
                  subtitle={`${stats.combo.active} active • Rs. ${stats.combo.revenue.toLocaleString()} revenue`}
                  icon={Package2}
                  color="text-green-600"
                  bgColor="bg-green-100"
                  link="/combo"
                />
              </div>

              {/* Service Breakdown Chart */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Revenue Breakdown */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <PieChart className="h-5 w-5 mr-2 text-indigo-600" />
                    Revenue Breakdown
                  </h3>
                  <div className="space-y-4">
                    {[
                      { name: 'Dishhome', value: stats.dishhome.revenue, color: 'bg-purple-500' },
                      { name: 'Fibernet', value: stats.fibernet.revenue, color: 'bg-blue-500' },
                      { name: 'Combo', value: stats.combo.revenue, color: 'bg-green-500' }
                    ].map((service) => {
                      const percentage = totalRevenue > 0 ? (service.value / totalRevenue * 100) : 0;
                      return (
                        <div key={service.name} className="flex items-center">
                          <div className="flex items-center flex-1">
                            <div className={`w-3 h-3 rounded-full ${service.color} mr-3`}></div>
                            <span className="text-sm font-medium text-gray-700">{service.name}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">{percentage.toFixed(1)}%</span>
                            <span className="text-sm font-medium text-gray-900">Rs. {service.value.toLocaleString()}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Customer Distribution */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2 text-indigo-600" />
                    Customer Distribution
                  </h3>
                  <div className="space-y-4">
                    {[
                      { name: 'Dishhome', total: stats.dishhome.total, active: stats.dishhome.active, color: 'bg-purple-500' },
                      { name: 'Fibernet', total: stats.fibernet.total, active: stats.fibernet.active, color: 'bg-blue-500' },
                      { name: 'Combo', total: stats.combo.total, active: stats.combo.active, color: 'bg-green-500' }
                    ].map((service) => {
                      const activeRate = service.total > 0 ? (service.active / service.total * 100) : 0;
                      return (
                        <div key={service.name} className="flex items-center">
                          <div className="flex items-center flex-1">
                            <div className={`w-3 h-3 rounded-full ${service.color} mr-3`}></div>
                            <span className="text-sm font-medium text-gray-700">{service.name}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">{activeRate.toFixed(1)}% active</span>
                            <span className="text-sm font-medium text-gray-900">{service.active}/{service.total}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-indigo-600" />
                    Recent Customers
                  </h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {recentCustomers.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                      No recent customers found
                    </div>
                  ) : (
                    recentCustomers.map((customer, index) => (
                      <div key={`${customer.type}-${customer.customerId || customer.comboId}-${index}`} className="p-4 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg ${
                              customer.type === 'dishhome' ? 'bg-purple-100' :
                              customer.type === 'fibernet' ? 'bg-blue-100' : 'bg-green-100'
                            }`}>
                              {customer.type === 'dishhome' ? <Tv className="h-4 w-4 text-purple-600" /> :
                               customer.type === 'fibernet' ? <Wifi className="h-4 w-4 text-blue-600" /> :
                               <Package2 className="h-4 w-4 text-green-600" />}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {customer.type === 'combo' ? `Combo #${customer.comboId}` : customer.name}
                              </p>
                              <p className="text-xs text-gray-500 capitalize">{customer.type} service</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">
                              Rs. {customer.type === 'combo' ? customer.totalPrice : customer.price}
                            </p>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              customer.status === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {customer.status === 1 ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </main>
    </div>
  );
};

export default FibernetDashboard;
