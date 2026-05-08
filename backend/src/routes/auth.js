const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  getMe, 
  updateProfile,
  sendOTP,
  verifyOTP,
  resendOTP
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);

// OTP routes
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

module.exports = router;