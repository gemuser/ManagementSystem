import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import SessionTimeoutWarning from './components/SessionTimeoutWarning';
import Dashboard from './pages/Dashboard';
import ProductPage from './pages/ProductPage';
import StockPage from './pages/StockPage';
import SalesPage from './pages/SalesPage';
import PurchasePage from './pages/PurchasePage';
import SalesHistory from './pages/SalesHistory';
import HistoryPage from './pages/HistoryPage';
import DayBook from './pages/DayBook';
import { DishhomePage, FibernetPage, ComboPage, FibernetDashboard } from './fibernetPages';
import LandingPage from './components/LandingPage';
import ComboSelectionPage from './components/ComboSelectionPage';
import './index.css';
import Login from './pages/Login';
import React from 'react';

function App() {
  return (
<<<<<<< HEAD
    <Router>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />
        
        {/* DHI - Inventory Management Routes */}
        <Route path="/dhi/dashboard" element={<Dashboard />} />
        <Route path="/dhi/products" element={<ProductPage />} />
        <Route path="/dhi/stock" element={<StockPage />} />
        <Route path="/dhi/sales" element={<SalesPage />} />
        <Route path="/dhi/purchases" element={<PurchasePage />} />
        <Route path="/dhi/sales-history" element={<SalesHistory />} />
        <Route path="/dhi/history" element={<HistoryPage />} />
        <Route path="/dhi/daybook" element={<DayBook />} />
        
        {/* Dishhome Service Routes */}
        <Route path="/dishhome" element={<DishhomePage />} />
        
        {/* Fibernet Service Routes */}
        <Route path="/fibernet" element={<FibernetPage />} />
        <Route path="/fibernet-dashboard" element={<FibernetDashboard />} />
        
        {/* Combo Service Routes */}
        <Route path="/combo" element={<ComboSelectionPage />} />
        <Route path="/combo/dth" element={<ComboPage />} />
        <Route path="/combo/itv" element={<ComboPage />} />
        
        {/* Legacy routes for backward compatibility */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/products" element={<ProductPage />} />
        <Route path="/stock" element={<StockPage />} />
        <Route path="/sales" element={<SalesPage />} />
        <Route path="/purchases" element={<PurchasePage />} />
        <Route path="/sales-history" element={<SalesHistory />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/daybook" element={<DayBook />} />
      </Routes>
    </Router>
=======
    <AuthProvider>
      <Router>
        <SessionTimeoutWarning />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/products" element={
            <ProtectedRoute>
              <ProductPage />
            </ProtectedRoute>
          } />
          <Route path="/stock" element={
            <ProtectedRoute>
              <StockPage />
            </ProtectedRoute>
          } />
          <Route path="/sales" element={
            <ProtectedRoute>
              <SalesPage />
            </ProtectedRoute>
          } />
          <Route path="/purchases" element={
            <ProtectedRoute>
              <PurchasePage />
            </ProtectedRoute>
          } />
          <Route path="/sales-history" element={
            <ProtectedRoute>
              <SalesHistory />
            </ProtectedRoute>
          } />
          <Route path="/history" element={
            <ProtectedRoute>
              <HistoryPage />
            </ProtectedRoute>
          } />
          <Route path="/daybook" element={
            <ProtectedRoute>
              <DayBook />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
>>>>>>> 839d685f703cc5427382b6e8b94102ef22f44257
  );
}

export default App;
