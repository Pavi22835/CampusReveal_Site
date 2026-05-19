import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Phone, User, CheckCircle, AlertCircle, RefreshCcw, ChevronRight, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import './OtpLoginModal.css';

const OtpLoginModal = () => {
  const { showOtpModal, showOtpSuggestion, closeOtpModal, closeSuggestionModal, convertSuggestionToModal, otpLogin } = useAuth();
  const [step, setStep] = useState('details');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = window.setTimeout(() => setCountdown((prev) => prev - 1), 1000);
    }
    return () => window.clearTimeout(timer);
  }, [countdown]);

  useEffect(() => {
    if (!showOtpModal && !showOtpSuggestion) {
      const reset = window.setTimeout(() => {
        setStep('details');
        setName('');
        setPhone('');
        setOtp('');
        setError('');
        setCountdown(0);
      }, 200);
      return () => window.clearTimeout(reset);
    }
    return undefined;
  }, [showOtpModal, showOtpSuggestion]);

  const handleSendOtp = async () => {
    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (!phone.trim() || phone.length !== 10) {
      setError('Please enter a valid 10-digit phone number.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.sendOTP(phone, name);
      if (response.success) {
        setStep('otp');
        setCountdown(60);
      } else {
        setError(response.message || 'Unable to send OTP. Please try again.');
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
      setError('Please enter the OTP.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.verifyOTP(phone, otp, name);
      if (response.success && response.user && response.token) {
        const userData = {
          ...response.user,
          name: response.user.name || name,
          phone: response.user.phone || phone,
          loginTime: new Date().toISOString(),
          isGuest: true,
        };

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
    if (!phone.trim() || phone.length !== 10) {
      setError('Please enter a valid phone number first.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.resendOTP(phone);
      if (response.success) {
        setCountdown(60);
      } else {
        setError(response.message || 'Unable to resend OTP. Please try again.');
      }
    } catch (err) {
      console.error('Resend OTP error:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOtpModal = () => {
    closeOtpModal();
  };

  const handleCloseSuggestion = () => {
    closeSuggestionModal();
  };

  const handleContinueFromSuggestion = () => {
    convertSuggestionToModal();
  };

  // Render suggestion modal
  if (showOtpSuggestion && !showOtpModal) {
    return (
      <motion.div
        key="suggestion"
        initial={{ opacity: 0, y: 20, x: '-50%' }}
        animate={{ opacity: 1, y: 0, x: '-50%' }}
        exit={{ opacity: 0, y: 20, x: '-50%' }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="otp-suggestion-container"
      >
        <div className="otp-suggestion-card">
          <button
            type="button"
            className="otp-suggestion-close"
            onClick={handleCloseSuggestion}
            aria-label="Close suggestion"
          >
            <X size={18} />
          </button>

          <div className="otp-suggestion-content">
            <div className="otp-suggestion-icon">
              <Lock size={24} />
            </div>
            
            <div className="otp-suggestion-text">
              <h3>Want to write reviews?</h3>
              <p>Quick and secure login via OTP</p>
            </div>

            <div className="otp-suggestion-actions">
              <button
                type="button"
                className="otp-suggestion-button primary"
                onClick={handleContinueFromSuggestion}
              >
                Continue
                <ChevronRight size={18} />
              </button>
              <button
                type="button"
                className="otp-suggestion-button secondary"
                onClick={handleCloseSuggestion}
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (!showOtpModal) return null;

  return (
    <div className="otp-modal-overlay" onClick={handleCancelOtpModal}>
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.94 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className="otp-modal-panel"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="otp-modal-close"
          onClick={handleCancelOtpModal}
          aria-label="Close OTP login"
        >
          <X size={20} />
        </button>

        <div className="otp-modal-body">
          <div className="otp-modal-header">
            <div className="otp-badge">
              <CheckCircle size={18} />
              <span>Secure access</span>
            </div>
            <h2>Guest login with an OTP</h2>
            <p>Verify your phone number to continue using protected actions.</p>
          </div>

          <div className="otp-form">
            {step === 'details' ? (
              <>
                <div className="field-group">
                  <label htmlFor="otp-name">Full name</label>
                  <div className="field-input">
                    <User size={16} />
                    <input
                      id="otp-name"
                      type="text"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder="Enter your name"
                      autoFocus
                    />
                  </div>
                </div>

                <div className="field-group">
                  <label htmlFor="otp-phone">Phone number</label>
                  <div className="field-input">
                    <Phone size={16} />
                    <input
                      id="otp-phone"
                      type="tel"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="10-digit mobile number"
                    />
                  </div>
                </div>

                {error && (
                  <div className="otp-error">
                    <AlertCircle size={16} />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="button"
                  className="otp-button primary"
                  onClick={handleSendOtp}
                  disabled={loading}
                >
                  {loading ? 'Sending OTP…' : 'Send OTP'}
                </button>
                <button
                  type="button"
                  className="otp-button secondary"
                  onClick={handleCancelOtpModal}
                  disabled={loading}
                >
                  Cancel & continue browsing
                </button>
              </>
            ) : (
              <>
                <div className="field-group">
                  <label htmlFor="otp-code">Enter OTP</label>
                  <input
                    id="otp-code"
                    type="text"
                    value={otp}
                    onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="1234"
                    className="otp-code-input"
                    maxLength={4}
                    autoFocus
                  />
                </div>

                {error && (
                  <div className="otp-error">
                    <AlertCircle size={16} />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="button"
                  className="otp-button primary"
                  onClick={handleVerifyOtp}
                  disabled={loading}
                >
                  {loading ? 'Verifying…' : 'Verify & continue'}
                </button>
                <button
                  type="button"
                  className="otp-button secondary"
                  onClick={handleCancelOtpModal}
                  disabled={loading}
                >
                  Cancel & continue browsing
                </button>

                <div className="otp-resend-bar">
                  {countdown > 0 ? (
                    <span>Resend code in <strong>{countdown}s</strong></span>
                  ) : (
                    <button type="button" className="resend-link" onClick={handleResendOtp} disabled={loading}>
                      <RefreshCcw size={16} /> Resend OTP
                    </button>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="otp-footer">
            <p>You can continue browsing without signing in.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default OtpLoginModal;
