import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Phone, User, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import './AuthModal.css';

const AuthModal = () => {
  const { showAuthModal, closeModal, otpLogin } = useAuth();
  const [step, setStep] = useState('details'); // details or otp
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [generatedOtp, setGeneratedOtp] = useState('');

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  useEffect(() => {
    if (!showAuthModal) {
      setTimeout(() => {
        setStep('details');
        setName('');
        setPhone('');
        setOtp('');
        setError('');
        setCountdown(0);
        setGeneratedOtp('');
      }, 300);
    }
  }, [showAuthModal]);

  const handleSendOtp = async () => {
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!phone.trim() || phone.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Call the actual send OTP API
      const response = await api.sendOTP(phone, name);
      console.log('Send OTP response:', response);
      
      if (response.success) {
        // Store the OTP from response (for demo, it might be in debugOtp)
        const receivedOtp = response.debugOtp || response.otp || '1234';
        setGeneratedOtp(receivedOtp);
        setStep('otp');
        setCountdown(60);
      } else {
        setError(response.message || 'Failed to send OTP. Please try again.');
      }
    } catch (err) {
      console.error('Send OTP error:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      setError('Please enter OTP');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Call the actual verify OTP API
      const response = await api.verifyOTP(phone, otp, name);
      console.log('Verify OTP response:', response);
      
      if (response.success && response.user && response.token) {
        // ✅ FIX: Pass both user data AND the token to otpLogin
        const userData = { 
          ...response.user,
          name: response.user.name || name,
          phone: response.user.phone || phone,
          loginTime: new Date().toISOString(),
          isGuest: true 
        };
        
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('isAuthenticated', 'true');
        
        // Call otpLogin with user data AND token
        otpLogin(userData, response.token);
      } else {
        setError(response.message || 'Invalid OTP. Please try again.');
      }
    } catch (err) {
      console.error('Verify OTP error:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setCountdown(60);
    setError('');
    setLoading(true);
    
    try {
      const response = await api.sendOTP(phone, name);
      console.log('Resend OTP response:', response);
      
      if (response.success) {
        const receivedOtp = response.debugOtp || response.otp || '1234';
        setGeneratedOtp(receivedOtp);
        alert(`OTP has been sent! Demo OTP: ${receivedOtp}`);
      } else {
        setError(response.message || 'Failed to resend OTP');
      }
    } catch (err) {
      console.error('Resend OTP error:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!showAuthModal) return null;

  return (
    <div className="auth-modal-overlay" onClick={closeModal}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="auth-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="auth-modal-close" onClick={closeModal}>
          <X size={20} />
        </button>

        <div className="auth-modal-content">
          {/* Header */}
          <div className="auth-modal-header">
            <div className="auth-icon">🔐</div>
            <h2>Welcome to CampusReveal</h2>
            <p>Sign in to access all features</p>
          </div>

          {/* Form */}
          {step === 'details' ? (
            <div className="auth-form">
              <div className="form-group">
                <label>Your Name</label>
                <div className="input-wrapper">
                  <User size={18} />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    autoFocus
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <div className="input-wrapper">
                  <Phone size={18} />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="Enter 10-digit mobile number"
                  />
                </div>
              </div>

              {error && (
                <div className="error-message">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <button className="auth-btn primary" onClick={handleSendOtp} disabled={loading}>
                {loading ? <div className="spinner" /> : 'Send OTP'}
              </button>
            </div>
          ) : (
            <div className="auth-form">
              <div className="otp-instruction">
                <div className="success-icon">
                  <CheckCircle size={24} />
                </div>
                <p>Enter the OTP sent to <strong>{phone}</strong></p>
                {generatedOtp && (
                  <small>Demo OTP: {generatedOtp}</small>
                )}
              </div>

              <div className="form-group">
                <label>Enter OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="Enter 4-digit OTP"
                  className="otp-input"
                  maxLength={4}
                  autoFocus
                />
              </div>

              {error && (
                <div className="error-message">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <button className="auth-btn success" onClick={handleVerifyOtp} disabled={loading}>
                {loading ? <div className="spinner" /> : 'Verify & Continue'}
              </button>

              <div className="resend-otp">
                {countdown > 0 ? (
                  <span>Resend OTP in <strong>{countdown}s</strong></span>
                ) : (
                  <button onClick={handleResendOtp}>Resend OTP</button>
                )}
              </div>
            </div>
          )}

          {/* Footer */}
          <p className="auth-footer">
            By continuing, you agree to our <a href="#">Terms of Service</a>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthModal;