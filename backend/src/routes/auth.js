const express = require('express');
const router = express.Router();
const { prisma } = require('../prisma');
const { 
  register, 
  login, 
  getMe, 
  updateProfile,
  sendLoginOTP,
  verifyOTP,
  resendOTP
} = require('../controllers/authController');
const { protect, adminOnly } = require('../middleware/auth');

// ==================== PUBLIC ROUTES ====================
router.post('/register', register);
router.post('/login', login);

// OTP routes
router.post('/send-otp', sendLoginOTP);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);

// ==================== PROTECTED ROUTES ====================
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

// ==================== ADMIN ROUTES ====================
router.get('/users', protect, adminOnly, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { isTrashed: false },
      select: { 
        id: true, 
        name: true, 
        email: true, 
        role: true, 
        createdAt: true 
      }
    });
    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;