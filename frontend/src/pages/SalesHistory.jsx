import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import Sidebar from '../components/Sidebar';

const SalesHistory = () => {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [filter, setFilter] = useState({
    dateFrom: '',
    dateTo: '',
    productId: '',
    invoiceNo: ''
  });

  useEffect(() => {
    fetchSales();
    fetchProducts();
  }, []);

  const fetchSales = async () => {
    try {
      const res = await axios.get('/sales/list');
      const salesData = res.data.data;
      setSales(salesData);
      setFilteredSales(salesData);
    } catch (err) {
      console.error('Error fetching sales:', err);
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

    setFilteredSales(filtered);
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
      <main className="flex-1 p-6 bg-gray-100 min-h-screen">
        <h1 className="text-3xl font-bold mb-6">📈 Sales History</h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700">Total Sales</h3>
            <p className="text-2xl font-bold text-blue-600">{totalSales}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700">Total Revenue</h3>
            <p className="text-2xl font-bold text-green-600">Rs. {totalRevenue.toFixed(2)}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700">Items Sold</h3>
            <p className="text-2xl font-bold text-purple-600">{totalQuantity}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">🔍 Filter Sales</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
              <input
                type="date"
                value={filter.dateFrom}
                onChange={(e) => setFilter({ ...filter, dateFrom: e.target.value })}
                className="border p-2 rounded w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
              <input
                type="date"
                value={filter.dateTo}
                onChange={(e) => setFilter({ ...filter, dateTo: e.target.value })}
                className="border p-2 rounded w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
              <select
                value={filter.productId}
                onChange={(e) => setFilter({ ...filter, productId: e.target.value })}
                className="border p-2 rounded w-full"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Invoice No</label>
              <input
                type="text"
                placeholder="Search invoice..."
                value={filter.invoiceNo}
                onChange={(e) => setFilter({ ...filter, invoiceNo: e.target.value })}
                className="border p-2 rounded w-full"
              />
            </div>

            <div className="flex items-end space-x-2">
              <button
                onClick={applyFilters}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Apply
              </button>
              <button
                onClick={clearFilters}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Sales Table */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">📋 Sales Records</h2>
          {filteredSales.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No sales records found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-3 border text-left">Invoice No</th>
                    <th className="p-3 border text-left">Product</th>
                    <th className="p-3 border text-left">Quantity</th>
                    <th className="p-3 border text-left">Price Each</th>
                    <th className="p-3 border text-left">Total Price</th>
                    <th className="p-3 border text-left">Sale Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSales.map((sale, index) => (
                    <tr key={sale.id || index} className="border-t hover:bg-gray-50">
                      <td className="p-3 border font-medium">{sale.invoice_no}</td>
                      <td className="p-3 border">{getProductName(sale.product_id)}</td>
                      <td className="p-3 border text-center">{sale.quantity_sold}</td>
                      <td className="p-3 border">Rs. {parseFloat(sale.price_each).toFixed(2)}</td>
                      <td className="p-3 border font-bold">Rs. {parseFloat(sale.total_price).toFixed(2)}</td>
                      <td className="p-3 border">{new Date(sale.sale_date).toLocaleDateString()}</td>
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
