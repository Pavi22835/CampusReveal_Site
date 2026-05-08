const twilio = require('twilio');

// Generate random OTP
const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

// For development - log OTP to console
const sendOTPDev = (phone, otp) => {
  console.log(`\n========== OTP DEBUG ==========`);
  console.log(`📱 Phone: ${phone}`);
  console.log(`🔐 OTP: ${otp}`);
  console.log(`⏰ Valid for 10 minutes`);
  console.log(`================================\n`);
  return true;
};

// For production - send SMS via Twilio
const sendOTPProduction = async (phone, otp) => {
  try {
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    
    // Format phone number (add country code if needed)
    let formattedPhone = phone;
    if (!phone.startsWith('+')) {
      formattedPhone = `+91${phone}`; // For India
    }
    
    await client.messages.create({
      body: `Your CampusReveal verification OTP is: ${otp}. Valid for 10 minutes.`,
      to: formattedPhone,
      from: process.env.TWILIO_PHONE_NUMBER
    });
    return true;
  } catch (error) {
    console.error('Twilio error:', error);
    return false;
  }
};

// Main send function
const sendOTP = async (phone, otp) => {
  if (process.env.NODE_ENV === 'production') {
    return await sendOTPProduction(phone, otp);
  } else {
    return sendOTPDev(phone, otp);
  }
};

module.exports = { generateOTP, sendOTP };