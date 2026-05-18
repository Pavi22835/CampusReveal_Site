const { prisma } = require('../prisma');

const TEMP_OTP = '1234';

const generateOTP = () => TEMP_OTP;

const sendOTPToPhone = async (phone, otp) => {
  console.log(`\n========== OTP DELIVERY ==========`);
  console.log(`📱 Phone: ${phone}`);
  console.log(`🔐 OTP: ${otp}`);
  console.log(`⏰ Valid for 10 minutes`);
  console.log(`================================\n`);
  return true;
};

const sendLoginOTP = async (req, res) => {
  try {
    const { phone, name } = req.body;

    if (!phone || phone.length !== 10) {
      return res.status(400).json({
        success: false,
        message: 'Valid 10-digit phone number is required'
      });
    }

    await prisma.oTP.updateMany({
      where: {
        phone,
        isUsed: false,
        expiresAt: { gt: new Date() }
      },
      data: { isUsed: true }
    });

    const otp = generateOTP();

    await prisma.oTP.create({
      data: {
        phone,
        otp,
        purpose: 'login',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000)
      }
    });

    await sendOTPToPhone(phone, otp);

    res.status(200).json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to send OTP' });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { phone, otp, name } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Phone and OTP are required'
      });
    }

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

    await prisma.oTP.update({
      where: { id: otpRecord.id },
      data: { isUsed: true }
    });

    let user = await prisma.user.findUnique({
      where: { phone }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          phone,
          name: name || `User_${phone.slice(-4)}`,
          role: 'STUDENT',
          credits: 50,
          isGuest: false,
          isVerified: true
        }
      });
    } else {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          lastLogin: new Date(),
          name: name || user.name
        }
      });
    }

    const token = require('jsonwebtoken').sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || '30d'
    });

    const userData = {
      id: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      role: user.role,
      credits: user.credits,
      avatar: user.avatar
    };

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      token,
      user: userData
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to verify OTP' });
  }
};

const resendOTP = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }

    await prisma.oTP.updateMany({
      where: {
        phone,
        isUsed: false,
        expiresAt: { gt: new Date() }
      },
      data: { isUsed: true }
    });

    const otp = generateOTP();

    await prisma.oTP.create({
      data: {
        phone,
        otp,
        purpose: 'login',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000)
      }
    });

    await sendOTPToPhone(phone, otp);

    res.status(200).json({ success: true, message: 'OTP resent successfully' });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to resend OTP' });
  }
};

module.exports = {
  sendLoginOTP,
  verifyOTP,
  resendOTP
};
