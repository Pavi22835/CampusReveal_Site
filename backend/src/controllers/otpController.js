const { prisma } = require('../prisma');
const { generateOTP, sendOTP } = require('../utils/sendOTP');
const generateToken = require('../utils/generateToken');

// Send OTP for login/registration
const sendLoginOTP = async (req, res) => {
  try {
    const { phone, name } = req.body;

    if (!phone || phone.length !== 10) {
      return res.status(400).json({ 
        success: false, 
        message: 'Valid 10-digit phone number is required' 
      });
    }

    // Invalidate previous unused OTPs for this phone
    await prisma.oTP.updateMany({
      where: {
        phone,
        isUsed: false,
        expiresAt: { gt: new Date() }
      },
      data: { isUsed: true }
    });

    // Generate OTP
    const otp = generateOTP();
    
    // Save OTP to database
    await prisma.oTP.create({
      data: {
        phone,
        otp,
        purpose: 'login',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
      }
    });

    // Send OTP via SMS (or console log in development)
    await sendOTP(phone, otp);

    res.status(200).json({ 
      success: true, 
      message: 'OTP sent successfully',
      // In development, send OTP for testing (remove in production)
      ...(process.env.NODE_ENV !== 'production' && { debugOtp: otp })
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ success: false, message: 'Failed to send OTP' });
  }
};

// Verify OTP and create/login user
const verifyOTP = async (req, res) => {
  try {
    const { phone, otp, name } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ 
        success: false, 
        message: 'Phone and OTP are required' 
      });
    }

    // Find valid OTP
    const otpRecord = await prisma.oTP.findFirst({
      where: {
        phone,
        otp,
        isUsed: false,
        expiresAt: { gt: new Date() }
      }
    });

    if (!otpRecord) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired OTP' 
      });
    }

    // Mark OTP as used
    await prisma.oTP.update({
      where: { id: otpRecord.id },
      data: { isUsed: true }
    });

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { phone }
    });

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          phone,
          name: name || `User_${phone.slice(-4)}`,
          isGuest: true,
          isVerified: true,
          lastLogin: new Date()
        }
      });
    } else {
      // Update last login
      user = await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() }
      });
    }

    // Generate JWT token
    const token = generateToken(user.id, user.role);

    // Remove sensitive data
    const userData = {
      id: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      role: user.role,
      credits: user.credits,
      isGuest: user.isGuest
    };

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      token,
      user: userData
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ success: false, message: 'Failed to verify OTP' });
  }
};

// Resend OTP
const resendOTP = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ 
        success: false, 
        message: 'Phone number is required' 
      });
    }

    // Invalidate previous unused OTPs
    await prisma.oTP.updateMany({
      where: {
        phone,
        isUsed: false,
        expiresAt: { gt: new Date() }
      },
      data: { isUsed: true }
    });

    // Generate new OTP
    const otp = generateOTP();
    
    // Save new OTP
    await prisma.oTP.create({
      data: {
        phone,
        otp,
        purpose: 'login',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000)
      }
    });

    // Send OTP
    await sendOTP(phone, otp);

    res.status(200).json({ 
      success: true, 
      message: 'OTP resent successfully',
      ...(process.env.NODE_ENV !== 'production' && { debugOtp: otp })
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ success: false, message: 'Failed to resend OTP' });
  }
};

module.exports = { sendLoginOTP, verifyOTP, resendOTP };