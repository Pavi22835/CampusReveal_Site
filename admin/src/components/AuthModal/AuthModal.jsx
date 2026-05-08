import React from 'react';
import { useAuth } from '../../context/AuthContext';
import './AuthModal.css';

const AuthModal = () => {
  const { isAuthenticated, showAuthModal, setShowAuthModal, loginWithOTP } = useAuth();

  // Don't show modal if user is already authenticated or modal is not supposed to show
  if (!showAuthModal || isAuthenticated) return null;

  return (
    <div className="auth-modal-overlay" onClick={() => setShowAuthModal(false)}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="auth-modal-close" onClick={() => setShowAuthModal(false)}>
          ×
        </button>
        <div className="auth-modal-content">
          <h2>Welcome to CampusReveal</h2>
          <p>Login or Sign up to continue</p>
          <button onClick={loginWithOTP} className="auth-phone-btn">
            Continue with Phone
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;