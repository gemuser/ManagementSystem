import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import SessionTimeoutWarning from './components/SessionTimeoutWarning';
import Dashboard from './pages/Dashboard';
import ProductsStockPage from './pages/ProductsStockPage';
import SalesPage from './pages/SalesPage';
import PurchasePage from './pages/PurchasePage';
import SalesHistory from './pages/SalesHistory';
import HistoryPage from './pages/HistoryPage';
import DayBook from './pages/DayBook';
import ComprehensiveDayBook from './pages/ComprehensiveDayBook';
import LedgerPage from './pages/LedgerPage';
import DishhomeDashboard from './pages/DishhomeDashboard';
import FibernetDashboard from './pages/FibernetDashboard';
import { DishhomePage, FibernetPage, ComboPage, FibernetDashboard as OldFibernetDashboard } from './fibernetPages';
import LandingPage from './components/LandingPage';
import ComboSelectionPage from './components/ComboSelectionPage';
import './index.css';
import Login from './pages/Login';
import React from 'react';

function App() {
  return (
    <AuthProvider>
      <Router>
        <SessionTimeoutWarning />
        <Routes>
          {/* Authentication Routes */}
          <Route path="/login" element={<Login />} />
          
          {/* Landing Page */}
          <Route path="/" element={<LandingPage />} />
          
          {/* DHI - Inventory Management Routes */}
          <Route path="/dhi/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/dhi/products" element={
            <ProtectedRoute>
              <ProductsStockPage />
            </ProtectedRoute>
          } />
          <Route path="/dhi/stock" element={
            <ProtectedRoute>
              <ProductsStockPage />
            </ProtectedRoute>
          } />
          <Route path="/dhi/sales" element={
            <ProtectedRoute>
              <SalesPage />
            </ProtectedRoute>
          } />
          <Route path="/dhi/purchases" element={
            <ProtectedRoute>
              <PurchasePage />
            </ProtectedRoute>
          } />
          <Route path="/dhi/sales-history" element={
            <ProtectedRoute>
              <SalesHistory />
            </ProtectedRoute>
          } />
          <Route path="/dhi/history" element={
            <ProtectedRoute>
              <HistoryPage />
            </ProtectedRoute>
          } />
          <Route path="/dhi/daybook" element={
            <ProtectedRoute>
              <DayBook />
            </ProtectedRoute>
          } />
          
          {/* Comprehensive Day Book */}
          <Route path="/daybook" element={
            <ProtectedRoute>
              <ComprehensiveDayBook />
            </ProtectedRoute>
          } />

          {/* Ledger Page */}
          <Route path="/ledger" element={
            <ProtectedRoute>
              <LedgerPage />
            </ProtectedRoute>
          } />

          {/* Ledger Page - DHI Section (alternative access) */}
          <Route path="/dhi/ledger" element={
            <ProtectedRoute>
              <LedgerPage />
            </ProtectedRoute>
          } />
          
          {/* Dishhome Service Routes */}
          <Route path="/dishhome" element={
            <ProtectedRoute>
              <DishhomePage />
            </ProtectedRoute>
          } />
          <Route path="/dishhome-dashboard" element={
            <ProtectedRoute>
              <DishhomeDashboard />
            </ProtectedRoute>
          } />
          
          {/* Fibernet Service Routes */}
          <Route path="/fibernet" element={
            <ProtectedRoute>
              <FibernetPage />
            </ProtectedRoute>
          } />
          <Route path="/fibernet-dashboard" element={
            <ProtectedRoute>
              <FibernetDashboard />
            </ProtectedRoute>
          } />
          <Route path="/fibernet-old-dashboard" element={
            <ProtectedRoute>
              <OldFibernetDashboard />
            </ProtectedRoute>
          } />
          
          {/* Combo Service Routes */}
          <Route path="/combo" element={
            <ProtectedRoute>
              <ComboPage />
            </ProtectedRoute>
          } />
          <Route path="/combo/all" element={
            <ProtectedRoute>
              <ComboPage />
            </ProtectedRoute>
          } />
          <Route path="/combo/dth" element={
            <ProtectedRoute>
              <ComboPage />
            </ProtectedRoute>
          } />
          <Route path="/combo/itv" element={
            <ProtectedRoute>
              <ComboPage />
            </ProtectedRoute>
          } />
          <Route path="/combo-selection" element={
            <ProtectedRoute>
              <ComboSelectionPage />
            </ProtectedRoute>
          } />
          
          {/* Legacy routes for backward compatibility */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/products" element={
            <ProtectedRoute>
              <ProductsStockPage />
            </ProtectedRoute>
          } />
          <Route path="/stock" element={
            <ProtectedRoute>
              <ProductsStockPage />
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
  );
}

export default App;
