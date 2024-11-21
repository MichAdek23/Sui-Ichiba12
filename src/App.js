import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Homepage from './pages/HomePage';
import Dashboard from './pages/DashboardPage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import NotFoundPage from './pages/NotFoundPage';
import ProductSearchPage from './pages/ProductSearchPage';
import ProductPage from './pages/ProductPage';
import Navbar from './components/Navbar';

const isAuthenticated = () => {
  return localStorage.getItem('authToken'); // Check for authentication token in localStorage
};

const PrivateRoute = ({ element }) => {
  return isAuthenticated() ? element : <Navigate to="/sign-in" />;
};

function App() {
  return (
    <Router>
      <Helmet>
        {/* SEO Meta tags */}
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

      {/* Use the `useLocation` hook only after the `Router` */}
      <RouterContent />
    </Router>
  );
}

function RouterContent() {
  const location = useLocation();

  return (
    <>
      {/* Conditionally render Navbar based on the current location (URL) */}
      {location.pathname !== '/dashboard' && <Navbar />}

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Homepage />} />
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/sign-up" element={<SignUpPage />} />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="/product-search-page" element={<ProductSearchPage />} />

        {/* Private Routes */}
        <Route path="/dashboard" element={<PrivateRoute element={<Dashboard />} />} />

        {/* 404 Not Found Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

export default App;
