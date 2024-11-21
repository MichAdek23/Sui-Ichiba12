import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import styled, { keyframes } from 'styled-components'; // Import styled-components and keyframes

// Keyframe for spinner animation
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

// Styled-components for the spinner
const Spinner = styled.div`
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: ${spin} 2s linear infinite;
  margin: 50px auto;  // Center the spinner on the screen
`;

// PrivateRoute handles authentication checks
const PrivateRoute = ({ children }) => {
  const auth = getAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(null); // Store auth state
  const [loading, setLoading] = useState(true);  // State to track loading status

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user !== null) {
        setIsAuthenticated(true);  // Set authentication status as true
      } else {
        setIsAuthenticated(false);  // Set authentication status as false
      }
      setLoading(false);  // Stop loading once auth state is determined
    });

    return () => unsubscribe();  // Clean up the listener on unmount
  }, [auth]);

  // Show spinner while checking auth state
  if (loading) {
    return <Spinner />;  // Show spinner animation while loading
  }

  // Redirect if not authenticated, otherwise show children
  return isAuthenticated ? children : <Navigate to="/sign-in" />;
};

export default PrivateRoute;
