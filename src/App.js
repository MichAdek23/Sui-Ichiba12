import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Homepage from './pages/HomePage';
import Dashboard from './pages/DashboardPage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import NotFoundPage from './pages/NotFoundPage';
import ProductSearchPage from './pages/ProductSearchPage';
import ProductPage from './pages/ProductPage';
import Navbar from './components/Navbar';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import ForgotPassword from './pages/ForgotPasswordPage'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Helmet>
          <title>Sui-Ichiba - The Best C2C Blockchain-Based Marketplace</title>
          <meta
            name="description"
            content="Sui-Ichiba is the best C2C blockchain-based marketplace where users can securely buy and sell digital assets in a decentralized manner."
          />
          <meta
            name="keywords"
            content="C2C, blockchain, marketplace, digital assets, buy and sell, decentralized"
          />
          <meta name="author" content="Sui-Ichiba Team" />
        </Helmet>

        <RouterContent />
      </Router>
    </AuthProvider>
  );
}

function RouterContent() {
  const location = useLocation();

  return (
    <>
      {location.pathname !== '/dashboard' && <Navbar />}

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Homepage />} />
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/sign-up" element={<SignUpPage />} />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="/product-search-page" element={<ProductSearchPage />} />
        <Route path="/forgot-password" element={<ForgotPassword/>} />

        {/* Protected Route wrapped with PrivateRoute */}
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>
        } />

        {/* 404 Not Found Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

export default App;
