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
import './index.css';
import Login from './pages/Login';
import React from 'react';

function App() {
  return (
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
  );
}

export default App;
