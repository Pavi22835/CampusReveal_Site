import React, { createContext, useState, useContext, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('admin_token'));

  useEffect(() => {
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const loadUser = async () => {
    try {
      const res = await api.getMe(token);
      if (res.success && res.user?.role === 'ADMIN') {
        setUser(res.user);
      } else {
        localStorage.removeItem('admin_token');
        setToken(null);
      }
    } catch (error) {
      console.error('Load user error:', error);
      localStorage.removeItem('admin_token');
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const res = await api.login(email, password);
      const user = res.user || res.data?.user;
      const token = res.token || res.data?.token;

      if (res.success && user?.role === 'ADMIN') {
        if (token) {
          localStorage.setItem('admin_token', token);
          setToken(token);
        }
        setUser(user);
        return { success: true };
      }

      return {
        success: false,
        message: res.message || res.error || 'Invalid credentials'
      };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    loading,
    token,
    login,
    logout,
    isAuthenticated: !!user && user.role === 'ADMIN'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};