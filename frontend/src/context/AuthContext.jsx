import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
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
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [isOtpAuthenticated, setIsOtpAuthenticated] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
  const toastTimer = useRef(null);

  useEffect(() => {
    // Check for existing OTP session
    const authStatus = localStorage.getItem('isAuthenticated');
    const userData = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');

    if (storedToken) {
      setToken(storedToken);
      if (userData) {
        setUser(JSON.parse(userData));
        setIsOtpAuthenticated(true);
      }
    } else if (authStatus === 'true' && userData) {
      setUser(JSON.parse(userData));
      setIsOtpAuthenticated(true);
    }

    setLoading(false);
  }, []);

  const loadUser = async () => {
    try {
      const res = await api.getMe(token);
      if (res.success) {
        setUser(res.user);
      } else {
        localStorage.removeItem('token');
        setToken(null);
      }
    } catch (error) {
      localStorage.removeItem('token');
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    if (toastTimer.current) {
      clearTimeout(toastTimer.current);
    }
    setToast({ visible: true, message, type });
    toastTimer.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
      toastTimer.current = null;
    }, 5000);
  };

  const hideToast = () => {
    if (toastTimer.current) {
      clearTimeout(toastTimer.current);
      toastTimer.current = null;
    }
    setToast((prev) => ({ ...prev, visible: false }));
  };

  // OTP-based login (for guest users)
  const otpLogin = (userData, otpToken) => {
    console.log('OTP Login called with:', { userData, otpToken });
    
    setUser(userData);
    setIsOtpAuthenticated(true);
    setShowAuthModal(false);
    
    // ✅ FIX: Store the token from OTP response
    if (otpToken) {
      localStorage.setItem('token', otpToken);
      setToken(otpToken);
    }
    
    // Store user data for persistence
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('isAuthenticated', 'true');

    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  useEffect(() => {
    return () => {
      if (toastTimer.current) {
        clearTimeout(toastTimer.current);
      }
    };
  }, []);

  // Regular email/password login
  const login = async (email, password) => {
    try {
      const res = await api.login(email, password);
      if (res.success) {
        localStorage.setItem('token', res.token);
        setToken(res.token);
        setUser(res.user);
        setIsOtpAuthenticated(true);
        return { success: true };
      }
      return { success: false, message: res.message };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const register = async (userData) => {
    try {
      const res = await api.register(userData);
      if (res.success) {
        localStorage.setItem('token', res.token);
        setToken(res.token);
        setUser(res.user);
        setIsOtpAuthenticated(true);
        return { success: true };
      }
      return { success: false, message: res.message };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setIsOtpAuthenticated(false);
    setShowAuthModal(false);
  };

  const requireAuth = (callback) => {
    if (isAuthenticated) {
      callback();
    } else {
      setPendingAction(() => callback);
      setShowAuthModal(true);
    }
  };

  const openAuthModal = () => {
    setShowAuthModal(true);
  };

  const closeModal = () => {
    setShowAuthModal(false);
  };

  const isAuthenticated = !!((token && user) || isOtpAuthenticated);

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      token,
      login,
      register,
      logout,
      otpLogin,
      requireAuth,
      showAuthModal,
      closeModal,
      isAuthenticated,
      toast,
      hideToast
    }}>
      {children}
    </AuthContext.Provider>
  );
};