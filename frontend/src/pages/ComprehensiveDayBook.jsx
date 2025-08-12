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
  CalendarDays,
  TrendingDown,
  CreditCard,
  Minus
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
    combo: [],
    credits: [],
    debits: []
  });
  const [filteredData, setFilteredData] = useState({
    dhi: {
      sales: [],
      products: [],
      purchases: []
    },
    dishhome: [],
    fibernet: [],
    combo: [],
    credits: [],
    debits: []
  });

  const dateFilterOptions = [
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
    { id: 'combo', name: 'Combo', icon: Package2, color: 'green' },
    { id: 'credits', name: 'Credits', icon: TrendingUp, color: 'emerald' },
    { id: 'debits', name: 'Debits', icon: TrendingDown, color: 'red' }
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

    const filtered = {
      dhi: {
        sales: data.dhi.sales.filter(sale => 
          isDateInRange(sale.sale_date || sale.created_at, range)
        ),
        products: data.dhi.products.filter(product => 
          isDateInRange(product.created_at || new Date().toISOString(), range)
        ),
        purchases: data.dhi.purchases.filter(purchase => 
          isDateInRange(purchase.purchase_date || purchase.created_at, range)
        )
      },
      dishhome: data.dishhome.filter(customer => 
        isDateInRange(customer.created_at || customer.registrationDate, range)
      ),
      fibernet: data.fibernet.filter(customer => 
        isDateInRange(customer.created_at || customer.registrationDate, range)
      ),
      combo: data.combo.filter(combo => 
        isDateInRange(combo.created_at || combo.registrationDate, range)
      ),
      credits: data.credits.filter(credit => 
        isDateInRange(credit.date, range)
      ),
      debits: data.debits.filter(debit => 
        isDateInRange(debit.date, range)
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
        combo: comboRes.data.data || [],
        // Sample credit/debit data - replace with actual API calls
        credits: [
          { id: 1, amount: 5000, description: 'Customer Payment - DishHome', date: new Date().toISOString(), type: 'payment', customer: 'John Doe' },
          { id: 2, amount: 3000, description: 'Fibernet Service Payment', date: new Date(Date.now() - 86400000).toISOString(), type: 'service', customer: 'Jane Smith' },
          { id: 3, amount: 2500, description: 'Combo Package Payment', date: new Date(Date.now() - 172800000).toISOString(), type: 'combo', customer: 'Mike Johnson' }
        ],
        debits: [
          { id: 1, amount: 1500, description: 'Equipment Purchase', date: new Date().toISOString(), type: 'purchase', vendor: 'Tech Supplies Ltd' },
          { id: 2, amount: 800, description: 'Office Rent', date: new Date(Date.now() - 86400000).toISOString(), type: 'expense', vendor: 'Property Management' },
          { id: 3, amount: 1200, description: 'Internet Bills', date: new Date(Date.now() - 172800000).toISOString(), type: 'utility', vendor: 'ISP Provider' }
        ]
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
    const totalCredits = filteredData.credits.reduce((sum, credit) => sum + credit.amount, 0);
    const totalDebits = filteredData.debits.reduce((sum, debit) => sum + debit.amount, 0);
    const netIncome = totalRevenue + totalCredits - totalDebits;

    return (
      <div className="space-y-6">
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

          <div className="bg-white rounded-lg shadow-sm border border-emerald-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-emerald-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Credits</p>
                <p className="text-2xl font-bold text-emerald-600">+Rs. {totalCredits.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Debits</p>
                <p className="text-2xl font-bold text-red-600">-Rs. {totalDebits.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Net Income</p>
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
                <CreditCard className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Transactions</p>
                <p className="text-2xl font-bold text-gray-900">{filteredData.credits.length + filteredData.debits.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Distribution</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">DishHome Customers</span>
                <span className="font-semibold">{filteredData.dishhome.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Fibernet Customers</span>
                <span className="font-semibold">{filteredData.fibernet.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Combo Packages</span>
                <span className="font-semibold">{filteredData.combo.length}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-2">
              {filteredData.dhi.sales.slice(-5).reverse().map((sale, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Sale #{sale.id}</span>
                  <span className="font-medium">Rs. {parseFloat(sale.total_price || 0).toFixed(2)}</span>
                </div>
              ))}
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.dhi.sales.slice(-10).reverse().map((sale, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{sale.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(sale.sale_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    Rs. {parseFloat(sale.total_price || 0).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Completed
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

  const renderCredits = () => (
    <div className="space-y-4">
      {filteredData.credits.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <CreditCard className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p>No credit transactions found for the selected date range</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-emerald-100 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 px-6 py-4 border-b border-emerald-200">
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
              <h2 className="text-lg font-semibold text-emerald-800">Credit Transactions</h2>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.credits.map((credit, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(credit.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{credit.customer}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{credit.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-sm font-semibold text-emerald-600">+Rs. {credit.amount.toLocaleString()}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-emerald-50">
                <tr>
                  <td colSpan="3" className="px-6 py-4 text-sm font-medium text-emerald-800">Total Credits:</td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-lg font-bold text-emerald-600">
                      +Rs. {filteredData.credits.reduce((sum, credit) => sum + credit.amount, 0).toLocaleString()}
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  const renderDebits = () => (
    <div className="space-y-4">
      {filteredData.debits.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Minus className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p>No debit transactions found for the selected date range</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-red-100 overflow-hidden">
          <div className="bg-gradient-to-r from-red-50 to-red-100 px-6 py-4 border-b border-red-200">
            <div className="flex items-center space-x-3">
              <TrendingDown className="w-6 h-6 text-red-600" />
              <h2 className="text-lg font-semibold text-red-800">Debit Transactions</h2>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor/Expense</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.debits.map((debit, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(debit.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{debit.vendor}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{debit.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-sm font-semibold text-red-600">-Rs. {debit.amount.toLocaleString()}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-red-50">
                <tr>
                  <td colSpan="3" className="px-6 py-4 text-sm font-medium text-red-800">Total Debits:</td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-lg font-bold text-red-600">
                      -Rs. {filteredData.debits.reduce((sum, debit) => sum + debit.amount, 0).toLocaleString()}
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
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
      case 'credits':
        return renderCredits();
      case 'debits':
        return renderDebits();
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
