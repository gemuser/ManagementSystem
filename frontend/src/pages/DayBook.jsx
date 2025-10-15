import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import DHISidebar from '../components/DHISidebar';
import { dataRefreshEmitter } from '../hooks/useDataRefresh';
import { 
  BookOpen,
  RefreshCw,
  Plus,
  Minus,
  TrendingUp,
  TrendingDown,
  Package,
  Tv,
  Wifi,
  ShoppingCart,
  DollarSign,
  BarChart3,
  Calendar,
  Eye,
  EyeOff
} from 'lucide-react';

const DayBook = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [dateFilter, setDateFilter] = useState('today');
  const [financialData, setFinancialData] = useState({
    // Revenue sources (INCOME)
    inventorySales: { total: 0, count: 0, items: [] },
    dishhomeRevenue: { total: 0, count: 0, items: [] },
    fibernetRevenue: { total: 0, count: 0, items: [] },
    comboRevenue: { total: 0, count: 0, items: [] },
    
    // Expenditures (EXPENSES)
    purchases: { total: 0, count: 0, items: [] },
    
    // Calculations
    totalIncome: 0,
    totalExpenditure: 0,
    netProfitLoss: 0
  });
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState({
    inventorySales: false,
    dishhomeRevenue: false,
    fibernetRevenue: false,
    comboRevenue: false,
    purchases: false
  });
  const [balanceInfo, setBalanceInfo] = useState({ opening: 0, closing: 0, totalDr: 0, totalCr: 0 });

  const fetchFinancialData = useCallback(async () => {
    try {
      setLoading(true);
      
      const newFinancialData = {
        inventorySales: { total: 0, count: 0, items: [] },
        dishhomeRevenue: { total: 0, count: 0, items: [] },
        fibernetRevenue: { total: 0, count: 0, items: [] },
        comboRevenue: { total: 0, count: 0, items: [] },
        purchases: { total: 0, count: 0, items: [] },
        totalIncome: 0,
        totalExpenditure: 0,
        netProfitLoss: 0
      };

      // Helper function to filter data by date
      const filterByDate = (data, dateField) => {
        const selected = new Date(selectedDate);
        const today = new Date();

        return data.filter(item => {
          const itemDate = new Date(item[dateField]);
          
          switch (dateFilter) {
            case 'today': {
              const itemDateOnly = new Date(itemDate.getFullYear(), itemDate.getMonth(), itemDate.getDate());
              const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
              return itemDateOnly.getTime() === todayOnly.getTime();
            }
            case 'week': {
              const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
              return itemDate >= weekAgo && itemDate <= today;
            }
            case 'month': {
              const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
              return itemDate >= monthAgo && itemDate <= today;
            }
            case 'custom': {
              const itemDateOnly = new Date(itemDate.getFullYear(), itemDate.getMonth(), itemDate.getDate());
              const selectedOnly = new Date(selected.getFullYear(), selected.getMonth(), selected.getDate());
              return itemDateOnly.getTime() === selectedOnly.getTime();
            }
            default:
              return true;
          }
        });
      };

      // 1. INVENTORY SALES REVENUE
      try {
        const salesRes = await axios.get('/sales/list');
        const productsRes = await axios.get('/products/list');
        
        const allSales = salesRes.data.data || [];
        const products = productsRes.data.data || [];
        
        const filteredSales = filterByDate(allSales, 'sale_date');
        
        const salesWithProductNames = filteredSales.map(sale => {
          const product = products.find(p => p.id == sale.product_id);
          return {
            ...sale,
            product_name: product ? product.name : 'Unknown Product',
            category: 'Inventory Sales'
          };
        });
        
        // Group sales by invoice number and customer to avoid duplicates
        const groupedSales = salesWithProductNames.reduce((groups, sale) => {
          const key = `${sale.invoice_no || sale.id}_${sale.customer_name || 'unknown'}`;
          if (!groups[key]) {
            groups[key] = {
              ...sale,
              items: [],
              grouped_total: 0,
              grouped_quantity: 0
            };
          }
          
          groups[key].items.push({
            product_name: sale.product_name,
            quantity: sale.quantity_sold || 1,
            price: parseFloat(sale.total_price || 0)
          });
          groups[key].grouped_total += parseFloat(sale.total_price || 0);
          groups[key].grouped_quantity += parseInt(sale.quantity_sold || 1);
          
          // Update the display name to show multiple products
          if (groups[key].items.length > 1) {
            groups[key].product_name = `${groups[key].items.length} items (${groups[key].items.map(item => item.product_name).join(', ')})`;
          }
          
          return groups;
        }, {});
        
        // Convert back to array
        const finalSalesData = Object.values(groupedSales);
        
        newFinancialData.inventorySales = {
          total: finalSalesData.reduce((sum, sale) => sum + parseFloat(sale.grouped_total || sale.total_price || 0), 0),
          count: finalSalesData.length,
          items: finalSalesData
        };
      } catch {
        // No inventory sales data found
      }

      // 2. DISHHOME REVENUE (Monthly recurring revenue)
      try {
        const dishhomeRes = await axios.get('/dishhome/list');
        const dishhomeCustomers = dishhomeRes.data.data || [];
        
        // Calculate monthly revenue from active DishHome customers
        const activeCustomers = dishhomeCustomers.filter(customer => 
          customer.status === 'active' || customer.status === 'Active'
        );
        
        const dishhomeRevenue = activeCustomers.map(customer => ({
          id: customer.customerId,
          customer_name: customer.name,
          phone: customer.phoneNumber,
          package: customer.package,
          amount: parseFloat(customer.price || 0),
          category: 'DishHome Service',
          date: new Date().toISOString(),
          cas_id: customer.casId
        }));
        
        newFinancialData.dishhomeRevenue = {
          total: dishhomeRevenue.reduce((sum, item) => sum + item.amount, 0),
          count: dishhomeRevenue.length,
          items: dishhomeRevenue
        };
      } catch {
        // No DishHome data found
      }

      // 3. FIBERNET REVENUE (Monthly recurring revenue)
      try {
        const fibernetRes = await axios.get('/fibernet/list');
        const fibernetCustomers = fibernetRes.data.data || [];
        
        const activeCustomers = fibernetCustomers.filter(customer => 
          customer.status === 'active' || customer.status === 'Active'
        );
        
        const fibernetRevenue = activeCustomers.map(customer => ({
          id: customer.customerId,
          customer_name: customer.name,
          phone: customer.phoneNumber,
          package: customer.package,
          amount: parseFloat(customer.price || 0),
          category: 'Fibernet Service',
          date: new Date().toISOString()
        }));
        
        newFinancialData.fibernetRevenue = {
          total: fibernetRevenue.reduce((sum, item) => sum + item.amount, 0),
          count: fibernetRevenue.length,
          items: fibernetRevenue
        };
      } catch {
        // No Fibernet data found
      }

      // 4. COMBO REVENUE (Monthly recurring revenue)
      try {
        const comboRes = await axios.get('/Dhfibernet/list-with-details');
        const comboCustomers = comboRes.data.data || [];
        
        const activeComboCustomers = comboCustomers.filter(customer => 
          customer.status === 'active' || customer.status === 'Active'
        );
        
        const comboRevenue = activeComboCustomers.map(customer => ({
          id: customer.comboId,
          customer_name: customer.dishhome_customer_name || 'Unknown',
          phone: customer.phoneNumber,
          combo_type: customer.category,
          upgrade_type: customer.upgradeType,
          amount: parseFloat(customer.totalPrice || 0),
          category: `Combo Service (${customer.category || 'Unknown'})`,
          date: new Date().toISOString(),
          cas_id: customer.casId
        }));
        
        newFinancialData.comboRevenue = {
          total: comboRevenue.reduce((sum, item) => sum + item.amount, 0),
          count: comboRevenue.length,
          items: comboRevenue
        };
      } catch {
        // No Combo data found
      }

      // 5. PURCHASES (EXPENDITURE)
      try {
        const purchasesRes = await axios.get('/purchases/list');
        const allPurchases = purchasesRes.data.data || [];
        
        const filteredPurchases = filterByDate(allPurchases, 'purchase_date');
        
        const purchasesData = filteredPurchases.map(purchase => ({
          ...purchase,
          // Use correct field names from the purchases table
          product_name: purchase.product_name || 'Unknown Product',
          supplier_name: purchase.supplier_name || 'Unknown Supplier',
          quantity: purchase.quantity_purchased || 0,
          category: 'Stock Purchase',
          amount: parseFloat(purchase.total_amount || 0)
        }));
        
        newFinancialData.purchases = {
          total: purchasesData.reduce((sum, purchase) => sum + purchase.amount, 0),
          count: purchasesData.length,
          items: purchasesData
        };
      } catch {
        // No purchases data found
      }

      // Calculate totals
      newFinancialData.totalIncome = 
        newFinancialData.inventorySales.total +
        newFinancialData.dishhomeRevenue.total +
        newFinancialData.fibernetRevenue.total +
        newFinancialData.comboRevenue.total;
        
      newFinancialData.totalExpenditure = newFinancialData.purchases.total;
      newFinancialData.netProfitLoss = newFinancialData.totalIncome - newFinancialData.totalExpenditure;

      // --- Ledger / Balance calculations ---
      try {
        const ledgerRes = await axios.get('/ledger');
  const allEntries = ledgerRes.data.data || [];

        // Compute opening balance as the last balance before the selected date
        const target = new Date(selectedDate);
        const targetStart = new Date(target.getFullYear(), target.getMonth(), target.getDate());

        const entriesBefore = allEntries.filter(e => {
          const d = new Date(e.entry_date);
          return d < targetStart;
        });

        let opening = 0;
        if (entriesBefore.length > 0) {
          const lastBefore = entriesBefore[entriesBefore.length - 1];
          opening = parseFloat(lastBefore.balance) || 0;
        }

        // Entries exactly on target date
        const entriesOnDate = allEntries.filter(e => {
          const d = new Date(e.entry_date);
          return (
            d.getFullYear() === target.getFullYear() &&
            d.getMonth() === target.getMonth() &&
            d.getDate() === target.getDate()
          );
        });

  const totalDr = entriesOnDate.reduce((s, e) => s + (parseFloat(e.dr_amount) || 0), 0);
  const totalCr = entriesOnDate.reduce((s, e) => s + (parseFloat(e.cr_amount) || 0), 0);
  // Use business rule: closing = opening + credit - debit
  const closing = opening + totalCr - totalDr;

  setBalanceInfo({ opening, closing, totalDr, totalCr });
      } catch (_err) {
        // ignore ledger errors for balance display
        void _err;
        setBalanceInfo({ opening: 0, closing: 0, totalDr: 0, totalCr: 0 });
      }
      setFinancialData(newFinancialData);
    } catch (error) {
      console.error('Error fetching financial data:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedDate, dateFilter]);

  const navigate = useNavigate();

  useEffect(() => {
    fetchFinancialData();
    
    const unsubscribe = dataRefreshEmitter.subscribe(() => {
      fetchFinancialData();
    });
    
    return unsubscribe;
  }, [selectedDate, dateFilter, fetchFinancialData]);

  const getDisplayPeriod = () => {
    switch (dateFilter) {
      case 'today':
        return 'Today';
      case 'week':
        return 'Last 7 Days';
      case 'month':
        return 'Last 30 Days';
      case 'custom':
        return new Date(selectedDate).toLocaleDateString();
      default:
        return 'All Time';
    }
  };

  const toggleDetails = (section) => {
    setShowDetails(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const formatCurrency = (amount) => {
    return `Rs. ${parseFloat(amount || 0).toFixed(2)}`;
  };

  const renderRevenueSection = (title, data, icon, color, section) => (
    <div className={`bg-white rounded-lg shadow-sm border-l-4 border-${color}-500 p-6`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className={`p-2 bg-${color}-100 rounded-lg mr-3`}>
            {React.createElement(icon, { className: `h-6 w-6 text-${color}-600` })}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500">{data.count} entries</p>
          </div>
        </div>
        <div className="text-right">
          <p className={`text-2xl font-bold text-${color}-600`}>
            {formatCurrency(data.total)}
          </p>
          <button
            onClick={() => toggleDetails(section)}
            className="flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            {showDetails[section] ? (
              <>Hide Details <EyeOff className="h-4 w-4 ml-1" /></>
            ) : (
              <>Show Details <Eye className="h-4 w-4 ml-1" /></>
            )}
          </button>
        </div>
      </div>
      
      {showDetails[section] && data.items.length > 0 && (
        <div className="mt-4 border-t pt-4">
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {data.items.map((item, index) => (
              <div key={index} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
                <div className="flex-1">
                  <p className="font-medium text-sm">
                    {item.customer_name || item.product_name || item.product || 'Unknown'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {/* For inventory sales, show customer name and product separately */}
                    {item.category === 'Inventory Sales' ? (
                      <>
                        {item.customer_name && `Customer: ${item.customer_name}`}
                        {item.customer_name && item.product_name && ' • '}
                        {item.product_name && `Product: ${item.product_name}`}
                        {(item.customer_name || item.product_name) && ' • '}
                        {item.invoice_no && `Invoice: ${item.invoice_no} • `}
                        {item.category}
                      </>
                    ) : item.category === 'Stock Purchase' ? (
                      /* For purchases, show supplier and product details */
                      <>
                        {item.supplier_name && `Supplier: ${item.supplier_name}`}
                        {item.supplier_name && item.product_name && ' • '}
                        {item.product_name && `Product: ${item.product_name}`}
                        {(item.supplier_name || item.product_name) && ' • '}
                        {item.quantity && `Qty: ${item.quantity} • `}
                        {item.category}
                      </>
                    ) : (
                      /* For service sales, show existing format */
                      <>
                        {item.phone && `${item.phone} • `}
                        {item.package && `${item.package} • `}
                        {item.combo_type && `${item.combo_type} • `}
                        {item.upgrade_type && `${item.upgrade_type} • `}
                        {item.cas_id && `CAS: ${item.cas_id} • `}
                        {item.category}
                      </>
                    )}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`font-semibold text-${color}-600`}>
                    {formatCurrency(item.grouped_total || item.total_price || item.amount)}
                  </p>
                  {(item.grouped_quantity || item.quantity_sold) && (
                    <p className="text-xs text-gray-500">Qty: {item.grouped_quantity || item.quantity_sold}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex">
      <DHISidebar />
      <main className="flex-1 ml-72 p-6 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Financial DayBook</h1>
                <p className="text-gray-600">Comprehensive income and expenditure tracking</p>
              </div>
            </div>
            <button
              onClick={fetchFinancialData}
              disabled={loading}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={() => navigate('/daybook/balance')}
              className="flex items-center px-4 py-2 ml-3 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200"
            >
              Balances
            </button>
          </div>
        </div>

        {/* Date Filter Controls */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Period: {getDisplayPeriod()}
            </h2>
            <div className="flex space-x-2">
              {['today', 'week', 'month', 'custom'].map((period) => (
                <button
                  key={period}
                  onClick={() => setDateFilter(period)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium ${
                    dateFilter === period
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {period === 'custom' ? 'Custom' : 
                   period === 'today' ? 'Today' :
                   period === 'week' ? 'Week' : 'Month'}
                </button>
              ))}
            </div>
          </div>
          {dateFilter === 'custom' && (
            <div className="mt-4">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* Balance Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm p-6 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Balance</h3>
                  <p className="text-sm text-gray-500">Opening / Closing for {new Date(selectedDate).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Opening</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(balanceInfo.opening)}</p>
                  <p className="text-sm text-gray-500 mt-2">Closing</p>
                  <p className={`text-2xl font-bold ${balanceInfo.closing >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(balanceInfo.closing)}</p>
                </div>
              </div>

              {/* Keep one placeholder column to align with subsequent cards */}
              <div className="hidden md:block"></div>
            </div>

            {/* Financial Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Total Income</p>
                    <p className="text-3xl font-bold">{formatCurrency(financialData.totalIncome)}</p>
                  </div>
                  <TrendingUp className="h-12 w-12 text-green-200" />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-100 text-sm font-medium">Total Expenditure</p>
                    <p className="text-3xl font-bold">{formatCurrency(financialData.totalExpenditure)}</p>
                  </div>
                  <TrendingDown className="h-12 w-12 text-red-200" />
                </div>
              </div>
              
              <div className={`bg-gradient-to-r ${financialData.netProfitLoss >= 0 ? 'from-blue-500 to-blue-600' : 'from-orange-500 to-orange-600'} rounded-lg shadow-lg p-6 text-white`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">
                      {financialData.netProfitLoss >= 0 ? 'Net Profit' : 'Net Loss'}
                    </p>
                    <p className="text-3xl font-bold">{formatCurrency(Math.abs(financialData.netProfitLoss))}</p>
                  </div>
                  {financialData.netProfitLoss >= 0 ? (
                    <Plus className="h-12 w-12 text-blue-200" />
                  ) : (
                    <Minus className="h-12 w-12 text-orange-200" />
                  )}
                </div>
              </div>
            </div>

            {/* Revenue Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <DollarSign className="h-6 w-6 mr-2 text-green-600" />
                  Revenue Sources
                </h2>
                <div className="space-y-4">
                  {renderRevenueSection('Inventory Sales', financialData.inventorySales, Package, 'blue', 'inventorySales')}
                  {renderRevenueSection('DishHome Service', financialData.dishhomeRevenue, Tv, 'orange', 'dishhomeRevenue')}
                  {renderRevenueSection('Fibernet Service', financialData.fibernetRevenue, Wifi, 'purple', 'fibernetRevenue')}
                  {renderRevenueSection('Combo Services', financialData.comboRevenue, BarChart3, 'indigo', 'comboRevenue')}
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <ShoppingCart className="h-6 w-6 mr-2 text-red-600" />
                  Expenditures
                </h2>
                <div className="space-y-4">
                  {renderRevenueSection('Stock Purchases', financialData.purchases, ShoppingCart, 'red', 'purchases')}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default DayBook;
