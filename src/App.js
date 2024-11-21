import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';  // Import react-helmet for SEO management
import Homepage from './pages/HomePage'; // Homepage component
import Dashboard from './pages/DashboardPage'; // Dashboard component
import SignInPage from './pages/SignInPage'; // SignInPage component
import SignUpPage from './pages/SignUpPage'; // SignUpPage component
import NotFoundPage from './pages/NotFoundPage'; // 404 Not Found page
import ProductSearc

// Dummy function to simulate authentication check
const isAuthenticated = () => {
  return localStorage.getItem('authToken'); // Check for authentication token in localStorage
};

const PrivateRoute = ({ element: Element }) => {
  return isAuthenticated() ? Element : <Navigate to="/sign-in" />;
};

function App() {
  return (
    <Router>
      <Helmet>
        {/* SEO Meta tags */}
        <title>Sui-Ichiba - The Best C2C Blockchain-Based Marketplace</title>
        <meta name="description" content="Sui-Ichiba is the best C2C blockchain-based marketplace where users can securely buy and sell digital assets in a decentralized manner." />
        <meta name="keywords" content="C2C, blockchain, marketplace, digital assets, buy and sell, decentralized" />
        <meta name="author" content="Sui-Ichiba Team" />
      </Helmet>
      
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Homepage />} />
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/sign-up" element={<SignUpPage />} />

        {/* Private Routes */}
        <Route path="/dashboard" element={<PrivateRoute element={<Dashboard />} />} />

        {/* 404 Not Found Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;
