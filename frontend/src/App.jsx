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
              <ProductPage />
            </ProtectedRoute>
          } />
          <Route path="/dhi/stock" element={
            <ProtectedRoute>
              <StockPage />
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
          
          {/* Dishhome Service Routes */}
          <Route path="/dishhome" element={
            <ProtectedRoute>
              <DishhomePage />
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
          
          {/* Combo Service Routes */}
          <Route path="/combo" element={
            <ProtectedRoute>
              <ComboSelectionPage />
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
          
          {/* Legacy routes for backward compatibility */}
          <Route path="/dashboard" element={
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
  );
}

export default App;
