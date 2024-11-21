import React, { createContext, useState, useEffect, useContext } from 'react';

// Create a context for authentication
export const AuthContext = createContext();

// Define the AuthProvider component
export const AuthProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState(localStorage.getItem('authToken') || null);

  // Update the authToken in localStorage when the token changes
  useEffect(() => {
    if (authToken) {
      localStorage.setItem('authToken', authToken);
    } else {
      localStorage.removeItem('authToken');
    }
  }, [authToken]);

  const login = (token) => {
    setAuthToken(token);
  };

  const logout = () => {
    setAuthToken(null);
  };

  return (
    <AuthContext.Provider value={{ authToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Create the custom hook `useAuth`
export const useAuth = () => {
  return useContext(AuthContext);
};
