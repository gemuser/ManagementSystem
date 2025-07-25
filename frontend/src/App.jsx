import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ProductPage from './pages/ProductPage';
import StockPage from './pages/StockPage';
import SalesPage from './pages/SalesPage';
import PurchasePage from './pages/PurchasePage';
import SalesHistory from './pages/SalesHistory';
import HistoryPage from './pages/HistoryPage';
import DayBook from './pages/DayBook';
import './index.css';
import React from 'react';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/products" element={<ProductPage />} />
        <Route path="/stock" element={<StockPage />} />
        <Route path="/sales" element={<SalesPage />} />
        <Route path="/purchases" element={<PurchasePage />} />
        <Route path="/sales-history" element={<SalesHistory />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/daybook" element={<DayBook />} />
      </Routes>
    </Router>
  );
}

export default App;
