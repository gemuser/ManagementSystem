import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import { 
  BookOpen, 
  Package, 
  Tv, 
  Wifi, 
  Package2,
  BarChart3,
  Calendar,
  TrendingUp,
  Users,
  Banknote,
  Activity,
  Eye,
  ArrowLeft,
  Filter,
  CalendarDays
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ComprehensiveDayBook = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('total');
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('today');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [data, setData] = useState({
    dhi: {
      sales: [],
      products: [],
      purchases: []
    },
    dishhome: [],
    fibernet: [],
    combo: []
  });
  const [filteredData, setFilteredData] = useState({
    dhi: {
      sales: [],
      products: [],
      purchases: []
    },
    dishhome: [],
    fibernet: [],
    combo: []
  });

  const dateFilterOptions = [
    { value: 'overall', label: 'Overall' },
    { value: 'today', label: 'Today' },
    { value: '3days', label: 'Last 3 Days' },
    { value: '7days', label: 'Last 7 Days' },
    { value: '30days', label: 'Last 30 Days' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const tabs = [
    { id: 'total', name: 'Total Overview', icon: BarChart3, color: 'orange' },
    { id: 'dhi', name: 'DHI Records', icon: Package, color: 'blue' },
    { id: 'dishhome', name: 'DishHome', icon: Tv, color: 'purple' },
    { id: 'fibernet', name: 'Fibernet', icon: Wifi, color: 'cyan' },
    { id: 'combo', name: 'Combo', icon: Package2, color: 'green' }
  ];

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    const getDateRange = (filterType) => {
      const today = new Date();
      const endDate = new Date(today);
      endDate.setHours(23, 59, 59, 999);
      
      let startDate = new Date(today);
      
      switch (filterType) {
        case 'overall':
          // Return null to indicate no date filtering should be applied
          return null;
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case '3days':
          startDate.setDate(today.getDate() - 2);
          startDate.setHours(0, 0, 0, 0);
          break;
        case '7days':
          startDate.setDate(today.getDate() - 6);
          startDate.setHours(0, 0, 0, 0);
          break;
        case '30days':
          startDate.setDate(today.getDate() - 29);
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'custom':
          if (customStartDate && customEndDate) {
            startDate = new Date(customStartDate);
            startDate.setHours(0, 0, 0, 0);
            const customEnd = new Date(customEndDate);
            customEnd.setHours(23, 59, 59, 999);
            return { startDate, endDate: customEnd };
          }
          return null;
        default:
          startDate.setHours(0, 0, 0, 0);
      }
      
      return { startDate, endDate };
    };

    const isDateInRange = (dateString, range) => {
      if (!range) return true;
      const date = new Date(dateString);
      return date >= range.startDate && date <= range.endDate;
    };

    const range = getDateRange(dateFilter);
    if (!range && dateFilter === 'custom') return;

    // If dateFilter is 'overall' or range is null, show all data without filtering
    const filtered = {
      dhi: {
        sales: dateFilter === 'overall' || !range ? data.dhi.sales : data.dhi.sales.filter(sale => 
          isDateInRange(sale.sale_date || sale.created_at, range)
        ),
        products: dateFilter === 'overall' || !range ? data.dhi.products : data.dhi.products.filter(product => 
          isDateInRange(product.created_at || new Date().toISOString(), range)
        ),
        purchases: dateFilter === 'overall' || !range ? data.dhi.purchases : data.dhi.purchases.filter(purchase => 
          isDateInRange(purchase.purchase_date || purchase.created_at, range)
        )
      },
      dishhome: dateFilter === 'overall' || !range ? data.dishhome : data.dishhome.filter(customer => 
        isDateInRange(customer.created_at || customer.registrationDate, range)
      ),
      fibernet: dateFilter === 'overall' || !range ? data.fibernet : data.fibernet.filter(customer => 
        isDateInRange(customer.created_at || customer.registrationDate, range)
      ),
      combo: dateFilter === 'overall' || !range ? data.combo : data.combo.filter(combo => 
        isDateInRange(combo.created_at || combo.registrationDate, range)
      )
    };

    setFilteredData(filtered);
  }, [data, dateFilter, customStartDate, customEndDate]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // Fetch DHI data
      const [salesRes, productsRes, purchasesRes] = await Promise.all([
        axios.get('/sales/list').catch(() => ({ data: { data: [] } })),
        axios.get('/products/list').catch(() => ({ data: { data: [] } })),
        axios.get('/purchases/list').catch(() => ({ data: { data: [] } }))
      ]);

      // Fetch other services data
      const [dishhomeRes, fibernetRes, comboRes] = await Promise.all([
        axios.get('/dishhome/list').catch(() => ({ data: { data: [] } })),
        axios.get('/fibernet/list').catch(() => ({ data: { data: [] } })),
        axios.get('/Dhfibernet/list').catch(() => ({ data: { data: [] } }))
      ]);

      setData({
        dhi: {
          sales: salesRes.data.data || [],
          products: productsRes.data.data || [],
          purchases: purchasesRes.data.data || []
        },
        dishhome: dishhomeRes.data.data || [],
        fibernet: fibernetRes.data.data || [],
        combo: comboRes.data.data || []
      });
    } catch (error) {
      console.error('Error fetching daybook data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTabColorClass = (color, type = 'bg') => {
    const colorMap = {
      orange: type === 'bg' ? 'bg-orange-500' : 'text-orange-600',
      blue: type === 'bg' ? 'bg-blue-500' : 'text-blue-600',
      purple: type === 'bg' ? 'bg-purple-500' : 'text-purple-600',
      cyan: type === 'bg' ? 'bg-cyan-500' : 'text-cyan-600',
      green: type === 'bg' ? 'bg-green-500' : 'text-green-600',
      emerald: type === 'bg' ? 'bg-emerald-500' : 'text-emerald-600',
      red: type === 'bg' ? 'bg-red-500' : 'text-red-600'
    };
    return colorMap[color] || colorMap.blue;
  };

  const renderTotalOverview = () => {
    const totalSales = filteredData.dhi.sales.length;
    const totalRevenue = filteredData.dhi.sales.reduce((sum, sale) => sum + parseFloat(sale.total_price || 0), 0);
    const totalProducts = filteredData.dhi.products.length;
    const totalCustomers = filteredData.dishhome.length + filteredData.fibernet.length + filteredData.combo.length;
    const totalPurchases = filteredData.dhi.purchases.reduce((sum, purchase) => sum + parseFloat(purchase.total_cost || 0), 0);
    const netIncome = totalRevenue - totalPurchases;

    // Service breakdown
    const dishhomeCustomers = filteredData.dishhome.length;
    const fibernetCustomers = filteredData.fibernet.length;
    const comboCustomers = filteredData.combo.length;
    const purchaseCount = filteredData.dhi.purchases.length;

    // Get filter description for display
    const getFilterDescription = () => {
      switch (dateFilter) {
        case 'overall': return 'All Historical Data';
        case 'today': return 'Today';
        case '3days': return 'Last 3 Days';
        case '7days': return 'Last 7 Days';
        case '30days': return 'Last 30 Days';
        case 'custom': return `${customStartDate} to ${customEndDate}`;
        default: return 'All Time';
      }
    };

    return (
      <div className="space-y-6">
        {/* Filter Status Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Filter className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                Showing data for: <span className="font-bold">{getFilterDescription()}</span>
              </span>
            </div>
            <span className="text-xs text-blue-600">
              Last updated: {new Date().toLocaleTimeString()}
            </span>
          </div>
        </div>

        {/* Financial Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <Banknote className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Sales Revenue</p>
                <p className="text-2xl font-bold text-gray-900">Rs. {totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-purple-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Purchases</p>
                <p className="text-2xl font-bold text-purple-600">Rs. {totalPurchases.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-cyan-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-cyan-100 rounded-lg">
                <Users className="h-6 w-6 text-cyan-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold text-cyan-600">{totalCustomers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Gross Profit</p>
                <p className={`text-2xl font-bold ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  Rs. {netIncome.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Business Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Sales</p>
                <p className="text-2xl font-bold text-gray-900">{totalSales}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-cyan-100 rounded-lg">
                <Users className="h-6 w-6 text-cyan-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold text-gray-900">{totalCustomers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                <p className="text-2xl font-bold text-gray-900">{totalSales + filteredData.dhi.purchases.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Service Distribution</h3>
              <span className="text-xs text-gray-500">Filtered Results</span>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Tv className="h-4 w-4 text-purple-600" />
                  <span className="text-gray-700 font-medium">DishHome Customers</span>
                </div>
                <span className="font-bold text-purple-600">{dishhomeCustomers}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-cyan-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Wifi className="h-4 w-4 text-cyan-600" />
                  <span className="text-gray-700 font-medium">Fibernet Customers</span>
                </div>
                <span className="font-bold text-cyan-600">{fibernetCustomers}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Package2 className="h-4 w-4 text-green-600" />
                  <span className="text-gray-700 font-medium">Combo Packages</span>
                </div>
                <span className="font-bold text-green-600">{comboCustomers}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Package className="h-4 w-4 text-gray-600" />
                  <span className="text-gray-700 font-medium">Purchase Orders</span>
                </div>
                <span className="font-bold text-gray-600">{purchaseCount}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Sales Activity</h3>
              <span className="text-xs text-gray-500">Latest {Math.min(5, totalSales)} sales</span>
            </div>
            <div className="space-y-3">
              {filteredData.dhi.sales.length > 0 ? (
                filteredData.dhi.sales.slice(-5).reverse().map((sale, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Sale #{sale.id}</span>
                      <p className="text-xs text-gray-500">
                        {new Date(sale.sale_date || sale.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="font-bold text-green-600">Rs. {parseFloat(sale.total_price || 0).toLocaleString()}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <Activity className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No sales found for selected period</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDHIRecords = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Summary</h3>
          <p className="text-3xl font-bold text-blue-600">{filteredData.dhi.sales.length}</p>
          <p className="text-gray-600">Total Sales</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Products</h3>
          <p className="text-3xl font-bold text-green-600">{filteredData.dhi.products.length}</p>
          <p className="text-gray-600">Total Products</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Purchases</h3>
          <p className="text-3xl font-bold text-purple-600">{filteredData.dhi.purchases.length}</p>
          <p className="text-gray-600">Total Purchases</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Sales</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(() => {
                // Group sales by invoice number and customer
                const groupedSales = filteredData.dhi.sales.reduce((groups, sale) => {
                  const key = `${sale.invoice_no || sale.id}_${sale.customer_name || 'unknown'}`;
                  if (!groups[key]) {
                    groups[key] = {
                      invoice_no: sale.invoice_no || sale.id,
                      customer_name: sale.customer_name || 'Not specified',
                      sale_date: sale.sale_date,
                      items: [],
                      total_amount: 0
                    };
                  }
                  
                  const product = filteredData.dhi.products.find(p => p.id == sale.product_id);
                  groups[key].items.push({
                    product_name: product ? product.name : 'Unknown Product',
                    quantity: sale.quantity_sold || 1,
                    price: parseFloat(sale.total_price || 0)
                  });
                  groups[key].total_amount += parseFloat(sale.total_price || 0);
                  
                  return groups;
                }, {});

                // Convert to array and take last 10, then reverse
                const groupedArray = Object.values(groupedSales).slice(-10).reverse();

                return groupedArray.map((groupedSale, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{groupedSale.invoice_no}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {groupedSale.customer_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="space-y-1">
                        {groupedSale.items.map((item, itemIndex) => (
                          <div key={itemIndex} className="flex justify-between">
                            <span>{item.product_name}</span>
                            <span className="text-gray-500 ml-2">×{item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {groupedSale.items.reduce((sum, item) => sum + item.quantity, 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(groupedSale.sale_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Rs. {groupedSale.total_amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Completed
                      </span>
                    </td>
                  </tr>
                ));
              })()}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Purchases Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Purchases</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.dhi.purchases.slice(-10).reverse().map((purchase, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{purchase.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {purchase.product_name || 'Unknown Product'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {purchase.supplier_name || 'Unknown Supplier'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {purchase.quantity_purchased || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(purchase.purchase_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    Rs. {parseFloat(purchase.total_amount || 0).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderServiceRecords = (serviceData, serviceName) => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{serviceName} Overview</h3>
        <p className="text-3xl font-bold text-indigo-600">{serviceData.length}</p>
        <p className="text-gray-600">Total {serviceName} Records</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">{serviceName} Records</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Package</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {serviceData.slice(-10).reverse().map((record, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    #{record.customerId || record.comboId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.phoneNumber || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.package || 'Combo Package'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    Rs. {parseFloat(record.price || record.totalPrice || 0).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      (record.status === 1 || record.status === 'active') 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {(record.status === 1 || record.status === 'active') ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      );
    }

    switch (activeTab) {
      case 'total':
        return renderTotalOverview();
      case 'dhi':
        return renderDHIRecords();
      case 'dishhome':
        return renderServiceRecords(data.dishhome, 'DishHome');
      case 'fibernet':
        return renderServiceRecords(data.fibernet, 'Fibernet');
      case 'combo':
        return renderServiceRecords(data.combo, 'Combo');
      default:
        return renderTotalOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/')}
                className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
              >
                <ArrowLeft className="h-5 w-5 mr-1" />
                Back to Home
              </button>
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-orange-600 mr-3" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Comprehensive Day Book</h1>
                  <p className="text-sm text-gray-600">All records and analytics in one place</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? `border-${tab.color}-500 ${getTabColorClass(tab.color, 'text')}`
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <IconComponent className="h-5 w-5 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Date Filter */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center">
              <Filter className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-sm font-medium text-gray-700">Filter by Date:</span>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              {dateFilterOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setDateFilter(option.value)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    dateFilter === option.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-300'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {dateFilter === 'custom' && (
              <div className="flex items-center gap-2 ml-4">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Start Date"
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="End Date"
                  />
                </div>
              </div>
            )}

            <div className="ml-auto text-sm text-gray-600">
              Showing: {dateFilter === 'today' ? 'Today\'s Data' : 
                       dateFilter === '3days' ? 'Last 3 Days' :
                       dateFilter === '7days' ? 'Last 7 Days' :
                       dateFilter === '30days' ? 'Last 30 Days' :
                       dateFilter === 'custom' && customStartDate && customEndDate ? 
                       `${customStartDate} to ${customEndDate}` : 'All Data'}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default ComprehensiveDayBook;
